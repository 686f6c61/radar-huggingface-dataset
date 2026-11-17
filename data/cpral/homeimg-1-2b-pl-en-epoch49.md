# cpral/HomeIMG-1.2B-PL-EN-epoch49

## Resumen

HomeIMG-1.2B-PL-EN-epoch49 es un modelo de generación de imágenes texto-a-imagen bilingüe polaco-inglés desarrollado por el usuario independiente cpral. Se trata de un denoiser basado en Diffusion Transformer (DiT) de 1,24 mil millones de parámetros, entrenado desde cero en ocho tarjetas gráficas domésticas RTX 3090 Ti, que se condiciona mediante una torre de texto congelada (Poziomka-Baza-2026-09-05) a través de un refiner entrenable de 72,1 millones de parámetros.

La relevancia de este modelo reside en su enfoque de entrenamiento multirresolución nativo: genera imágenes a 256, 512 y 1024 píxeles, y las tres resoluciones participaron simultáneamente en el entrenamiento final con una proporción de tokens de 3:2:1 y un desplazamiento de programación de ruido ajustado por resolución (0,75 / 1,5 / 3). Emplea formulación de rectified flow (flow matching) con objetivo de velocidad y posiciones RoPE en estilo RPE-2D.

Es la primera versión de la familia HomeIMG entrenada a 1024 px y la número 49 de la serie de épocas. El modelo se distribuye bajo licencia Apache 2.0 con pesos en safetensors y pipeline personalizado para diffusers. El proyecto documenta con detalle inusual sus etapas de entrenamiento, incluidos los fallos intermedios (olvido de resoluciones bajas y duplicación de objetos en fase de alto ruido), lo que lo convierte en un caso de estudio útil para quienes entrenan generadores de imagen con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con rectified flow / flow matching; denoiser de 1,24B condicionado por torre de texto congelada más refiner entrenable de 72,1M |
| Parámetros totales | 1.246.802.432 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (4096 tokens por imagen de 1024 px en el denoiser; el condicionamiento textual usa el tokenizador de la torre Poziomka) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp32; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | polaco (pl), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería diffusers, custom_pipeline con trust_remote_code) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión (DiT) que actúa como denoiser sobre latentes codificados por el VAE de FLUX.2. La torre de texto Poziomka-Baza-2026-09-05 permanece congelada y un refiner de 72,1M de parámetros adapta sus representaciones al denoiser. El objetivo de entrenamiento es rectified flow con `z_t = (1−t)·x + t·ε` y predicción de `ε − x` mediante MSE, con `t` muestreado de una logit-normal(0, 1) desplazada según la resolución. Las posiciones se codifican con RoPE en estilo RPE-2D (campo de 64 posiciones; subconjuntos aleatorios en 256 y 512 px, rejilla completa en 1024 px).

El entrenamiento se realizó en tres etapas partiendo de las EMA de epoch47.5: (1) 0,25 épocas a 1024 px sin desplazamiento de programación, que mejoró el detalle pero hizo olvidar 256–512 px y corrompió la fase de alto ruido (t > 0,9), causando duplicación de objetos; (2) una corrección de 0,03 épocas a 1024 px con t-shift 4; y (3) 1,22 épocas con resoluciones mixtas 256/512/1024 en proporción de tokens 3:2:1 y desplazamiento `s = resolución / 341,33`, totalizando 6848 pasos y 7,2 millones de muestras. Los datos provienen de LucasFang/FLUX-Reason-6M (JPEG a 1024 px), con el 50% de los captions en polaco (cpral/FLUX-Reason-6M-captions-pl) y un 10% de prompts vacíos. El optimizador combina MuLoCo (réplicas promediadas cada 64 pasos), Muon (CMuon, lr 3e-3, momentum en bf16) y AdamW para el resto. El hardware fueron 8× RTX 3090 Ti en bf16 con límite de potencia de 320–400 W, a unas 100–160 imágenes/s durante aproximadamente 20 horas en la etapa final.

## Capacidades

- Generación de imágenes texto-a-imagen a 256, 512 y 1024 píxeles cuadrados, con selección automática del desplazamiento de programación de ruido por parte del pipeline.
- Condicionamiento bilingüe real: acepta prompts en polaco y en inglés, con captions de entrenamiento repartidos al 50% entre ambos idiomas.
- Generación de escenas complejas y composiciones con múltiples objetos, aunque con duplicaciones ocasionales a 1024 px.
- Generación de imágenes con texto legible en escena (el shard "text" de validación obtiene la pérdida más baja, 0,352).
- Estética fotorrealista y artística, entrenada sobre el subconjunto FLUX-Reason con captions descriptivos y razonados.
- Inferencia con muestreo de Euler, CFG configurable (3,0 en los ejemplos publicados) y pesos EMA.
- No se documentan capacidades de tool calling, agentes, visión de entrada, audio ni modo de razonamiento explícito.

## Casos de uso

- Generación de ilustraciones para publicaciones bilingües: el modelo produce la misma escena a partir de un prompt en polaco o en inglés, lo que permite mantener coherencia visual en sitios web o materiales con versiones en ambos idiomas sin reescribir los prompts.
- Creación de imágenes de vista previa a baja resolución: la generación nativa a 256 y 512 px permite iterar rápidamente sobre composiciones antes de lanzar la inferencia a 1024 px, reduciendo el coste computacional en fases de exploración.
- Prototipado de conceptos artísticos en estudios pequeños: con 1,24B de parámetros y pesos Apache 2.0, el modelo cabe en GPU de consumo y puede ejecutarse en local para generar bocetos de personajes, escenarios o productos.
- Generación de material gráfico para documentación técnica: el buen rendimiento en el shard "text" sugiere utilidad para imágenes con rótulos o texto en escena, como diagramas ilustrativos o carteles simples.
- Investigación en entrenamiento multirresolución: el modelo y su documentación detallada de etapas, proporciones de tokens y desplazamientos de programación sirven como referencia reproducible para estudiar el olvido catastrófico entre resoluciones.
- Fine-tuning sobre dominios específicos: al estar bajo Apache 2.0 y con pipeline diffusers estándar, puede adaptarse con LoRA o ajuste completo a estilos concretos (ilustración infantil, fotografía de producto) partiendo de las EMA publicadas.
- Generación de fondos y texturas para aplicaciones interactivas: la inferencia a 512 px con 50 pasos de Euler ofrece un equilibrio razonable entre calidad y latencia para contenido generado en tiempo casi real en servidores modestos.

## Benchmarks y rendimiento

| Métrica (EMA val/loss, velocity MSE) | 1024 px | 512 px | 256 px |
|---|---|---|---|
| val/loss (3584 imágenes) | 0,5079 | 0,5589 | 0,6210 |
| t ∈ [0,9, 1) (512 imágenes) | 0,6015 | 0,6938 | 0,7643 |

Desglose a 1024 px por shard de validación: aesthetics-part01 0,514; aesthetics-part02 0,501; imaginative 0,664; text 0,352. Comparativas internas de la serie: epoch47.5 obtuvo 0,5546 a 512 px (misma ruta de decodificación de validación) y epoch46 obtuvo 0,6067 a 256 px (validación con otra ruta de reducción de imagen, comparación aproximada). No se midió FD-DINOv2. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no ser aplicables a un modelo de generación de imagen.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 1,24B de parámetros en bf16 los pesos ocupan aproximadamente 2,5 GB, más el VAE de FLUX.2 y la torre de texto Poziomka, lo que sitúa el consumo total en un rango que cabe holgadamente en GPU de consumo de 12–24 GB.
- GPU recomendadas: RTX 3090 Ti (las mismas usadas para entrenamiento), RTX 4090, A100 o H100 para despliegue con mayor throughput; cualquier GPU con al menos 12 GB de VRAM debería ser suficiente para inferencia a 1024 px.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090 y equivalentes; no se documentan requisitos mínimos exactos.
- Opciones de despliegue: diffusers con `DiffusionPipeline.from_pretrained(..., custom_pipeline=REPO, trust_remote_code=True)`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusión en este formato).
- Latencia y throughput estimados: no disponibles para inferencia; durante el entrenamiento se procesaban 100–160 imágenes/s en 8× RTX 3090 Ti con 7–8 tarjetas, dato no trasladable directamente a generación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HomeIMG-1.2B-PL-EN-epoch49 | 1,24B (denoiser) + 72,1M (refiner) | 256/512/1024 px, 4096 tokens por imagen a 1024 px | pl, en | Apache 2.0 | Hugging Face, diffusers |
| cpral/HomeIMG-1.2B-PL-EN-epoch47.5 | 1,24B (denoiser) | 256/512 px (sin etapa 1024 px) | pl, en | Apache 2.0 | Hugging Face |
| cpral/HomeIMG-1.2B-PL-EN-epoch47.75 | 1,24B (denoiser) | 1024 px (etapa intermedia) | pl, en | Apache 2.0 | Hugging Face |
| Modelos texto-a-imagen de gran escala (p. ej. FLUX, SD3) | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información |

La comparación con modelos de la misma categoría a escala industrial no puede establecerse con datos de la información proporcionada; las alternativas directamente comparables son las versiones previas de la propia serie HomeIMG, cuyas diferencias se limitan a la etapa de entrenamiento y a las resoluciones soportadas.

## Limitaciones y advertencias

- Duplicación de objetos a 1024 px: el autor documenta casos de objetos repetidos (un zorro con dos cabezas, dos robots, autobuses triplicados), más raros que en la versión intermedia epoch47.75 pero aún presentes.
- Fase de alto ruido frágil: la etapa de 1024 px corrompió la composición en t > 0,9; aunque la etapa multirresolución la recuperó parcialmente, el comportamiento en esa franja sigue siendo el punto débil del modelo.
- Idiomas limitados a polaco e inglés: no se documenta soporte para castellano ni otros idiomas, por lo que los prompts en español previsiblemente degradarán la calidad.
- Sesgos: no documentados por el autor; al entrenarse sobre FLUX-Reason-6M, hereda los sesgos de ese dataset (estética y composición de su distribución), sin que se hayan publicado análisis específicos.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir anatomías incorrectas, texto ilegible o escenas incoherentes con el prompt, especialmente en composiciones con muchos objetos.
- Licencia Apache 2.0: permite uso comercial, pero el pipeline requiere `trust_remote_code=True` con código personalizado del autor, lo que implica revisar el código antes de desplegarlo en producción.
- Sin benchmarks estándar ni medición de FD-DINOv2: la evaluación se limita a val/loss y a inspección visual de rejillas, lo que dificulta comparaciones objetivas con otros modelos.
- Modelo de nicho con 25 descargas y 0 likes en el momento de la consulta: soporte comunitario y mantenimiento limitados.
- Resolución cuadrada únicamente (256, 512, 1024 px): no se documentan relaciones de aspecto no cuadradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch49
- Versión previa epoch47.5: https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch47.5
- Versión intermedia epoch47.75: https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch47.75
- Versión de corrección epoch47.78: https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch47.78
- Torre de texto base: https://huggingface.co/cpral/Poziomka-Baza-2026-09-05
- Dataset de entrenamiento: https://huggingface.co/datasets/LucasFang/FLUX-Reason-6M
- Captions en polaco: https://huggingface.co/datasets/cpral/FLUX-Reason-6M-captions-pl
- Paper RPE-2D: https://arxiv.org/abs/2503.18719
- Código de entrenamiento: https://github.com/adamo1139/trenowanie_generatora_obrazkow
- README en inglés: https://huggingface.co/cpral/HomeIMG-1.2B-PL-EN-epoch49/blob/main/README_en.md
