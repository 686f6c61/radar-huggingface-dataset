# immanuelpeter/MiMoViT-2.6-Flash

## Resumen

MiMoViT-2.6-Flash es un extractor de características visuales publicado por el usuario immanuelpeter en Hugging Face. No es un modelo multimodal completo, sino un paquete aislado del "vision tower" y el "merger" del modelo MiMo V2.6 Flash desarrollado por Xiaomi. El repositorio contiene únicamente los tensores correspondientes al prefijo `visual.*` del modelo padre, junto con el código de modelado necesario para cargarlos mediante `trust_remote_code`.

El modelo resuelve un problema concreto: permitir reutilizar el codificador visual de MiMo V2.6 Flash de forma independiente, sin arrastrar el resto del modelo multimodal. Esto es útil para pipelines de extracción de embeddings de imagen, sistemas de recuperación visual, clasificación o como componente de arquitecturas propias que necesiten un ViT preentrenado a gran escala.

Con 728.594.432 parámetros (unos 728M), el modelo emplea una torre de 28 bloques transformer con atención híbrida (atención completa en cuatro bloques y ventana deslizante de ±64 tokens en el resto), RMSNorm, SwiGLU y RoPE 2D. La licencia es MIT para los pesos, mientras que el código de modelado conserva cabecera Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con atención híbrida (full + ventana deslizante ±64 tokens) y merger MLP |
| Parametros totales | 728.594.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de atención local de ±64 tokens por cabeza; atención completa en bloques 0, 9, 18 y 27) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | MIT (pesos); Apache-2.0 (código `modeling_mimo_vision.py`) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La torre visual consta de 28 bloques con dimensión oculta 1280, MLP SwiGLU de dimensión intermedia 4608, 32 cabezas de consulta y 8 cabezas KV (GQA) con dimensión de cabeza 64. Emplea RMSNorm y RoPE 2D. La atención es híbrida: los bloques 0, 9, 18 y 27 usan atención completa, mientras que el resto aplica una ventana deslizante de ±64 tokens con un sesgo de sink por cabeza en la columna 0 de las claves. El parcheo es de 2 fotogramas × 16 × 16 píxeles; una imagen estática se duplica como dos fotogramas.

El merger aplica `LayerNorm(1280)`, concatenación 2×2 hasta 5120, `Linear(5120, 5120)`, GELU y `Linear(5120, 4096)`, sin sesgos. A resolución 448, el repositorio reporta 784 tokens de torre de anchura 1280, 196 tokens "merged" de anchura 5120 y 196 tokens "projected" de anchura 4096. No se detalla en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de alineación; el modelo es un extracto del modelo padre MiMo V2.6 Flash-RL de Xiaomi, por lo que hereda su entrenamiento sin modificaciones.

## Capacidades

- Extracción de características visuales a partir de imágenes (pipeline `image-feature-extraction`).
- Generación de embeddings de parche y de imagen completa mediante la torre y el merger.
- Procesamiento de imágenes con parcheo 2×16×16 (una imagen estática se trata como dos fotogramas).
- Salida de tokens proyectados de dimensión 4096, aptos para alimentar cabezas posteriores o módulos de alineación.
- No incluye capacidades de generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No es un modelo multilingüe ni procesa lenguaje natural.
- No dispone de modo "thinking", visión-a-texto ni audio.

## Casos de uso

- Extracción de embeddings para búsqueda visual: usar la salida de 196 tokens proyectados a 4096 dimensiones como representación de imagen en un índice vectorial para recuperación por similitud.
- Clasificación de imágenes con cabezas personalizadas: congelar la torre y entrenar un clasificador lineal o MLP sobre los tokens merged de 5120 dimensiones.
- Preprocesamiento en pipelines multimodales propios: integrar la torre como codificador visual en una arquitectura VLM casera que añada su propio proyector y LLM.
- Detección y segmentación débilmente supervisada: reutilizar los tokens de parche (784 a resolución 448) como mapa espacial para tareas densas.
- Destilación o transferencia: emplear los embeddings como profesor o inicialización en modelos visuales más pequeños.
- Investigación en atención híbrida: estudiar el efecto de la ventana deslizante ±64 con sinks frente a atención completa en tareas de reconocimiento visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,5 GB solo para pesos, más activaciones; en la práctica, 3-4 GB para lotes pequeños.
- En FP16/BF16 cabe en GPUs consumer como RTX 3060 12 GB, RTX 4070, RTX 4090.
- En cuantización INT8 o INT4 (no publicada oficialmente) podría reducirse a menos de 1 GB, aunque no hay artefactos oficiales.
- GPUs recomendadas para producción: A100, H100 o L40S si se procesan lotes grandes o se integra en un pipeline multimodal completo.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / parcheo | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiMoViT-2.6-Flash | 728M | Ventana ±64 + full en 4 bloques; parche 2×16×16 | MIT (pesos) / Apache-2.0 (código) | Hugging Face |
| SigLIP ViT-SO400M | ~400M | Atención completa; parche 14×14 | Apache-2.0 | Hugging Face |
| CLIP ViT-L/14 | ~300M | Atención completa; parche 14×14 | MIT | Hugging Face |
| DINOv2 ViT-L/14 | ~300M | Atención completa; parche 14×14 | Apache-2.0 | Hugging Face |

La comparación directa es limitada porque MiMoViT-2.6-Flash es un extracto de un modelo multimodal mayor y no publica métricas de recuperación ni clasificación lineal. SigLIP, CLIP y DINOv2 cuentan con evaluaciones estandarizadas y ecosistema de uso amplio, mientras que este repositorio es una exportación de un componente concreto.

## Limitaciones y advertencias

- No es un modelo completo: carece de cabezas de clasificación, proyector a espacio de texto y cualquier componente de lenguaje.
- No se han publicado evaluaciones de sesgo, robustez ni alucinación visual.
- El modelo hereda los sesgos del dataset de entrenamiento del modelo padre, no documentado en esta ficha.
- El uso comercial está permitido por la licencia MIT de los pesos, pero el código de modelado mantiene cabecera Apache-2.0; conviene revisar `LICENSE-CODE` y `NOTICE`.
- El parcheo 2×16×16 obliga a duplicar imágenes estáticas, lo que puede afectar a la eficiencia frente a ViT de una sola imagen.
- La atención con ventana ±64 puede limitar la captura de dependencias globales en imágenes de alta resolución.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; auditar `modeling_mimo_vision.py` antes de desplegar en producción.
- No hay cuantizaciones oficiales ni soporte documentado en runtimes de inferencia optimizados.

## Enlaces

- Hugging Face: https://huggingface.co/immanuelpeter/MiMoViT-2.6-Flash
- Modelo padre: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Repositorio de validación y exportación: https://github.com/immanuel-peter/vision-tower-bench
- Test de paridad: https://github.com/immanuel-peter/vision-tower-bench/blob/main/tests/test_release_parity.py
- Script de exportación: https://github.com/immanuel-peter/vision-tower-bench/blob/main/scripts/export_mimo26_vision.py
