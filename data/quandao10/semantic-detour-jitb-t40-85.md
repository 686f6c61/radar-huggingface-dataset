# quandao10/semantic-detour-jitb-t40-85

## Resumen

Semantic Detour Flow (JiT-B/16) es un modelo de difusión en espacio de píxeles para generación de imágenes condicionada por clase sobre ImageNet-1k a 256×256, publicado por el usuario quandao10 en HuggingFace. Se trata de un checkpoint de investigación de 20 épocas (296,1 M de parámetros) que implementa una variante del denoiser JiT-B/16 de Li y He ("Back to Basics: Let Denoising Generative Models Denoise"), en la que el estado ruidoso se inicializa a partir del código DINOv2-B de la propia imagen y se transfiere de forma suave ("detour") hacia los píxeles mediante un smoothstep en t ∈ [0,40, 0,85].

El interés técnico está en que el muestreo es una ODE puramente en píxeles, de ruido gaussiano directamente a RGB, sin encoder ni decoder en tiempo de inferencia: el modelo predice simultáneamente un parche de 16×16×3 píxeles y un código DINOv2-B de 768 dimensiones. Esto elimina la dependencia de un VAE o de un tokenizer latente, a costa de operar a resolución completa.

Es relevante ahora como evidencia empírica temprana de que inyectar semántica de un modelo auto-supervisado (DINOv2) en la ruta de difusión en píxeles mejora el FID frente al JiT-B/16 plano con el mismo presupuesto de entrenamiento (92,8 frente a 97,2 en FID-10k). No es un modelo convergido ni listo para producción: el propio autor lo etiqueta como checkpoint de investigación de 20 épocas, con artefactos visibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo DiT (JiT-B/16) en espacio de píxeles, con cabeza ancha estilo RAE DiT^DH; difusión por flujo (flow/ODE) con "Semantic Detour Flow" |
| Parametros totales | 296,1 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; entrada/salida de imagen 256×256 con patchify 16×16 (256 tokens) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en crudo y EMA en safetensors; no se han publicado variantes cuantizadas) |
| Idiomas soportados | No aplica a texto; condicionamiento por clase sobre las 1000 clases de ImageNet-1k (etiquetas en inglés) |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (`model_raw.safetensors`, `model_ema2_0.9996.safetensors`, `model_ema1_0.9999.safetensors`), más `detour_init_dinov2b_C768.pt` (estadísticas de normalización, necesario para construir el modelo) y `training_args.json` |

## Arquitectura y entrenamiento

Base JiT-B/16 (Li y He, "Back to Basics: Let Denoising Generative Models Denoise") con dos modificaciones que mantienen el patchify de 16×16: se elimina el cuello de botella de parches (`--bottleneck_dim 768`) y se añade una cabeza ancha al estilo RAE DiT^DH, con 2 bloques de anchura 2048, adaLN por token derivado de las features del encoder y su propio patchify de 16×16 a anchura completa sobre la entrada ruidosa (`--ddt_head_dim 2048`). Cada token produce dos salidas: un parche de 16×16×3 píxeles (x̂) y un código DINOv2-B de 768 dimensiones (ĉ).

La ruta de interpolación es z_t = t·m_t + (1 − t)·ε, con m_t = w_t·x + (1 − w_t)·Φc(x), donde Φ es un PixelShuffle(16) del código DINOv2-B normalizado a desviación 0,5. La pérdida es el error cuadrático sobre la velocidad de la ruta, v = (m_t − z_t)/(1 − t) + t·ẇ_t·(x − Φc). El peso w_t sigue un smoothstep sobre t ∈ [0,40, 0,85]: a ruido alto el estado pasa por el código semántico DINOv2-B y a ruido bajo se entrega a los píxeles. En muestreo no se usa encoder ni decoder, solo la ODE en píxeles.

Entrenamiento: ImageNet-1k a 256 px, AdamW con lr 2e-4 constante tras 5 épocas de warmup, muestreo de t logit-normal en (−0,8, 0,8), 10 % de label dropout (por lo que CFG funciona aunque las métricas publicadas son sin guiado), bf16, batch 1024 y 20 épocas. No se documenta uso de RLHF/DPO (no aplica a este tipo de modelo) ni la composición completa del dataset más allá de ImageNet-1k. El estado del optimizador no se incluye en el repo.

## Capacidades

- Generación de imágenes condicionada por clase (1000 clases de ImageNet-1k) a 256×256 en espacio de píxeles, sin VAE.
- Muestreo incondicional si se activa el label dropout (el modelo fue entrenado con un 10 % de dropout de etiqueta).
- Classifier-free guidance opcional (`args.cfg`), aunque las métricas publicadas usan cfg = 1,0 (sin guiado).
- Predicción conjunta de píxeles y de código semántico DINOv2-B (768-d) por token, reutilizable como señal auxiliar en investigación.
- Varios integradores y rejillas temporales seleccionables: `heun`, `euler`, `remix` (paso de endpoint-remix del Detour) y `time_grid` `uniform` o `jump`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de texto, audio o vídeo.
- No tiene capacities multilingües: el condicionamiento es un índice de clase, no lenguaje natural.

## Casos de uso

- Reproducción de la línea base JiT-B/16 en píxeles: sirve para comparar un denoiser en píxeles con y sin detour semántico bajo un presupuesto de cómputo idéntico (20 épocas, batch 1024), gracias a que el repo incluye los argumentos de entrenamiento completos en `training_args.json`.
- Ablación de la ventana del detour: el checkpoint corresponde a (0,40, 0,85) y el autor reporta el resultado de (0,40, 0,95) como referencia (FID 72,8), por lo que es un punto de partida directo para estudiar el efecto del traspaso semántico→píxel en la calidad final.
- Estudio de muestreadores y número de evaluaciones de red: con 50 pasos Heun y cfg 1,0 se obtienen las métricas reportadas, y el autor documenta que por debajo de ~4 pasos el modelo es peor que JiT-B plano y que a partir de ~15 evaluaciones es mejor; útil para análisis de compromiso calidad/latencia.
- Generación de datos sintéticos para experimentos de augmentación en clasificación ImageNet-256: con FID-10k de 92,8 las imágenes son reconocibles pero imperfectas, adecuadas para pruebas de robustez o preentrenamiento de clasificadores ligeros, no para sustituir datos reales en etapas finales.
- Investigación sobre representaciones auto-supervisadas en difusión: al predecir explícitamente el código DINOv2-B, permite analizar la alineación entre el espacio semántico de DINOv2 y la ruta de difusión en píxeles sin entrenar un VAE.
- Docencia y demostraciones de difusión en espacio de píxeles: el script de uso de la model card permite generar un lote de 4 imágenes con etiquetas concretas en pocas líneas de Python sobre una GPU CUDA.
- Punto de partida para fine-tuning o destilación: al ser un checkpoint intermedio con pesos en crudo y EMA, es un inicializador razonable para experimentos de reducción de pasos o de destilación de trayectorias, asumiendo que no hay estado de optimizador.
- Estímulos visuales controlados por clase para experimentos de percepción: la generación condicionada por etiqueta permite barridos sistemáticos sobre las 1000 clases.

## Benchmarks y rendimiento

Todas las cifras proceden de la model card: no guiadas (cfg 1,0), pesos en crudo, Heun 50 pasos, FID-10k contra las estadísticas de entrenamiento de ImageNet-256 de JiT, ejecuciones únicas.

| Modelo (20 epocas, batch 1024) | FID-10k (↓) | IS (↑) |
|---|---|---|
| Este checkpoint, Detour (0,40, 0,85) | 92,8 | 16,02 |
| JiT-B/16 plano en pixeles, mismas epocas | 97,2 | 12,43 |
| Detour (0,40, 0,95), mismo setup (no incluido en este repo) | 72,8 | 21,07 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de texto (no aplican a este modelo), ni comparaciones con checkpoints publicos de la literatura mas alla de las tres filas anteriores.

## Requisitos de hardware

- Pesos: 296,1 M de parámetros; aproximadamente 0,59 GB en bf16 y 1,18 GB en fp32 por checkpoint. El repo completo ocupa 3,6 GB por incluir tres variantes de pesos más las estadísticas de inicialización.
- VRAM estimada para inferencia: entorno a 4-8 GB para lotes pequeños en bf16 (pesos + activaciones a 256×256 con cabeza de anchura 2048); estimación orientativa, no medida ni publicada por el autor.
- El código de la model card indica explícitamente que la construcción del modelo requiere un dispositivo CUDA; no se documenta soporte CPU/MPS.
- GPU recomendadas: cualquiera con soporte CUDA y al menos ~8 GB de VRAM para lotes pequeños; A100/H100 no son necesarias para inferencia, sí útiles para reentrenar (batch 1024, bf16).
- Cabe en GPU de consumo (RTX 3060/4060 de 8-12 GB en adelante) para generación de pocas imágenes; no hay cifras verificadas de latencia ni throughput.
- Opciones de despliegue: no hay integración con vLLM, TGI, llama.cpp, Ollama ni Diffusers; el único camino documentado es cargar `Denoiser` desde el código del proyecto (`JiT/denoiser.py`, `JiT/model_jit.py`) con `safetensors.torch.load_file`, más `training_args.json` y `detour_init_dinov2b_C768.pt`.
- No se publican pesos en GGUF ni ONNX, por lo que no hay ruta de cuantización estándar disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | FID-10k | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Semantic Detour Flow JiT-B/16 (0,40, 0,85) | 296,1 M | 256×256, pixel-space | 92,8 | No disponible | Pesos safetensors en HF + código del proyecto |
| JiT-B/16 plano (mismas 20 epocas) | No disponible en la informacion | 256×256, pixel-space | 97,2 | No disponible | Referencia en la model card, pesos no incluidos |
| Detour JiT-B/16 (0,40, 0,95) | 296,1 M (misma arquitectura) | 256×256, pixel-space | 72,8 | No disponible | No incluido en este repo |
| Otros modelos publicos de difusion en pixeles para ImageNet-256 | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada no incluye comparaciones con checkpoints de terceros (por ejemplo DiT o SiT), por lo que la comparativa se limita a las variantes del propio autor.

## Limitaciones y advertencias

- Checkpoint de investigación de 20 épocas, no convergido: las muestras presentan artefactos, incluidos costuras de 16 píxeles y pérdida de detalle fino.
- Calidad pobre con pocos pasos: con 4 o menos pasos de muestreo el resultado es peor que el JiT-B/16 plano; solo a partir de ~15 evaluaciones de red supera a la línea base.
- Licencia no especificada: no hay términos de uso comercial, por lo que no debe asumirse permiso para uso comercial o redistribución sin contactar con el autor.
- Solo condicionamiento por clase de ImageNet-1k (1000 clases, etiquetas en inglés); no acepta prompts de texto ni otros idiomas.
- Sesgos no evaluados: no se documenta ningún análisis de sesgo demográfico, cultural o de representación de las clases de ImageNet; los sesgos del dataset se heredan.
- Riesgo de alucinación visual y de colapso de clase: al ser un modelo de 20 épocas, la fidelidad a la clase solicitada y la diversidad intra-clase no están caracterizadas.
- Métricas de una sola ejecución y con FID-10k contra estadísticas de entrenamiento, no contra el conjunto de validación estándar; no son directamente comparables con cifras de FID-50k de la literatura.
- La variante EMA con decay 0,9999 no se recomienda en esta etapa (va demasiado retrasada); usar `model_raw.safetensors` o `model_ema2_0.9996.safetensors`.
- No se incluye estado del optimizador, lo que dificulta reanudar el entrenamiento de forma exacta.
- Dependencia de código no empaquetado: no hay clase de modelo en Diffusers ni script de inferencia autónomo más allá del fragmento de la model card.

## Enlaces

- HuggingFace: https://huggingface.co/quandao10/semantic-detour-jitb-t40-85
- Referencia citada en la model card: Li y He, "Back to Basics: Let Denoising Generative Models Denoise" (JiT); no se proporciona URL en la informacion disponible.
- Referencia citada: DINOv2-B (codificador semántico usado en la ruta de detour); no se proporciona URL en la informacion disponible.
- Repositorio de código del proyecto (`JiT/denoiser.py`, `JiT/model_jit.py`, `main_jit.py`): referenciado en la model card, sin URL pública en la informacion disponible.
- No se han encontrado en la busqueda web enlaces relevantes al modelo, al paper ni al repositorio; los resultados obtenidos no guardan relación con el contenido técnico de esta ficha.
