# SadikNawazAI/sadik-image-ai-tiny-ddpm

## Resumen

SADIK Image AI — Tiny DDPM v1 es un modelo de difusión condicionado por texto, entrenado desde cero (sin pesos de Stable Diffusion, SDXL ni FLUX) por el desarrollador SadikNawazAI. Se trata de un modelo de investigación y demostración de apenas 12,27 millones de parámetros que genera imágenes de 64 × 64 píxeles a partir de descripciones textuales en inglés, dentro de un vocabulario cerrado de 34 tokens y ocho conceptos sintéticos (círculo, triángulo, cuadrado, estrella, corazón, media luna, anillo y rombo).

Su relevancia no reside en la calidad de las imágenes —el propio autor advierte que no es un generador fotorrealista— sino en el hecho de haber sido entrenado íntegramente en CPU (Intel Core i5-6500T, 4 núcleos, 16 GB de RAM, sin CUDA) en 89 minutos. Esto lo convierte en una referencia útil para quienes quieren entender el ciclo completo de entrenamiento de un modelo de difusión desde cero, con código, logs, curva de pérdida y checkpoints publicados.

El modelo forma parte del proyecto SADIK IMAGE AI, un estudio de imagen local con interfaz de escritorio, y se distribuye bajo licencia Apache-2.0. Es un artefacto educativo y reproducible más que una herramienta de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet2DConditionModel en espacio de píxeles con cross-attention |
| Parametros totales | 12.274.371 (12,27 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32 tokens (vocabulario de 34 palabras) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | inglés (leyendas/captions) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (state dict de PyTorch, float32, dividido en 12 partes de 4 MiB) |

## Arquitectura y entrenamiento

El modelo es una UNet2DConditionModel de espacio de píxeles con mecanismos de cross-attention para la condición textual. El condicionamiento se realiza mediante embeddings de palabras aprendidos sobre un vocabulario de 34 tokens con una ventana de contexto de 32 tokens. El proceso de difusión es DDPM con 1.000 pasos de entrenamiento, schedule beta lineal y predicción de épsilon. La inferencia se realiza por defecto con el muestreador DDPM (400 pasos), aunque también se soporta DDIM; el autor señala que DDIM colapsa hacia una media de bajo contraste en este checkpoint tan pequeño. La precisión es float32 en todo el pipeline.

El entrenamiento se llevó a cabo sobre un dataset completamente sintético de 192 imágenes de 64 × 64 generadas con Pillow (173 de entrenamiento y 19 de validación), cubriendo ocho clases de formas con posición, tamaño, jitter de color, viñeteado y grano aleatorios. Se ejecutaron 1.200 pasos con batch size de 8, optimizador AdamW (lr 2e-4, weight decay 0,01, betas 0,9/0,99) y clipping de gradiente de 1,0. La pérdida de validación final fue de 0,0052 y la pérdida media de entrenamiento en los últimos 50 pasos de 0,0109. Todo el run duró 89 minutos (5.340 segundos) en CPU. No se menciona uso de RLHF ni DPO; el entrenamiento es puramente de difusión supervisada.

## Capacidades

- Generación de imágenes de 64 × 64 píxeles condicionada por texto en inglés dentro de un vocabulario cerrado de 34 palabras.
- Reproducción de ocho conceptos sintéticos: círculo rojo, triángulo verde, cuadrado amarillo, estrella cian, corazón magenta, media luna naranja, anillo blanco y rombo rosa.
- Muestreo con DDPM (por defecto, 400 pasos) y DDIM (soportado, con menor calidad en este checkpoint).
- Control de semilla para reproducibilidad de las muestras.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: no disponible; solo leyendas en inglés.
- Reanudación de entrenamiento desde checkpoint (soporte de resume en el código de entrenamiento).

## Casos de uso

- Docencia y aprendizaje sobre difusión: el repositorio incluye `sample.py`, `trainer_state.json`, `training_log.csv` y la curva de pérdida, lo que permite reproducir el pipeline completo y estudiar el comportamiento de un DDPM pequeño paso a paso.
- Reproducción de experimentos en hardware modesto: al entrenarse en una CPU de cuatro núcleos, sirve como banco de pruebas para validar código de difusión sin GPU.
- Pruebas de integración de pipelines de imagen: útil para verificar el cableado de Diffusers, PyTorch y Pillow en un entorno de CI antes de escalar a modelos mayores.
- Generación de formas sintéticas controladas para datasets de prueba: las ocho clases con jitter de color y posición pueden emplearse para generar datos sintéticos etiquetados en tareas de visión por computador.
- Demostración educativa de condicionamiento textual: permite ilustrar cómo un vocabulario minúsculo y embeddings aprendidos afectan a la fidelidad de la generación.
- Estudio de muestreadores: comparar DDPM frente a DDIM en un checkpoint pequeño y documentar el colapso hacia la media que sufre DDIM.
- Referencia para el estudio de checkpoints fragmentados: el repo incluye `join_model.py` y verificación SHA-256, útil como ejemplo de distribución de pesos en conexiones inestables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de entrenamiento: pérdida de validación final de 0,0052 en el paso 1.200 y pérdida media de entrenamiento de 0,0109 en los últimos 50 pasos. No hay datos de FID, CLIP score ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: el checkpoint en float32 ocupa 46,9 MiB, por lo que la inferencia cabe holgadamente en cualquier GPU con al menos 1 GB de VRAM; también funciona en CPU.
- GPU recomendadas: no se requieren; el autor entrenó e infirió en CPU (Intel Core i5-6500T, 4 núcleos, 16 GB de RAM, sin CUDA). Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es sobradamente suficiente.
- Cabe en cualquier GPU consumer y en CPU.
- Opciones de despliegue: PyTorch + Diffusers + Pillow mediante `sample.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de este tipo).
- Latencia: en la CPU de entrenamiento, una muestra DDPM de 400 pasos tarda unos 65 segundos y una de 600 pasos unos 100 segundos. El throughput en GPU no está documentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Contexto textual | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SADIK Tiny DDPM v1 | 12,27 M | 64 × 64 | 32 tokens, vocab. 34 | Apache-2.0 | Hugging Face |
| Stable Diffusion 1.5 | ~860 M (UNet) | 512 × 512 | 77 tokens CLIP | CreativeML OpenRAIL-M | Hugging Face |
| SDXL | ~2,6 B (UNet) | 1024 × 1024 | 77 tokens CLIP | CreativeML OpenRAIL++-M | Hugging Face |

La comparación es asimétrica por diseño: SADIK Tiny DDPM v1 es dos órdenes de magnitud menor que SD 1.5 y está entrenado sobre un dataset sintético de ocho conceptos, por lo que no es un sustituto funcional de los modelos de difusión de propósito general. No se dispone de datos de benchmarks que permitan una comparación cuantitativa de calidad.

## Limitaciones y advertencias

- No es un generador fotorrealista: produce formas abstractas y, en varios prompts, colapsa hacia la media rosa/morada del dataset.
- Vocabulario cerrado de 34 palabras y contexto de 32 tokens: cualquier prompt fuera de las ocho plantillas de entrenamiento no producirá resultados significativos.
- Solo leyendas en inglés; no hay soporte multilingüe.
- Resolución fija de 64 × 64 píxeles.
- Riesgo de alucinación en el sentido de que el modelo genera formas que no corresponden al prompt, especialmente con DDIM.
- Dataset sintético sin personas, logos ni personajes con copyright, pero sin evaluación de sesgos publicada.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no está pensado para producción y el autor lo presenta explícitamente como demo de investigación.
- Checkpoint fragmentado en 12 partes que requiere unir con `join_model.py` y verificar el SHA-256 antes de usarlo.
- No se documentan métricas de calidad objetivas (FID, CLIP score) que permitan evaluar su rendimiento de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SadikNawazAI/sadik-image-ai-tiny-ddpm
- Demo (Space): https://huggingface.co/spaces/SadikNawazAI/sadik-image-ai
