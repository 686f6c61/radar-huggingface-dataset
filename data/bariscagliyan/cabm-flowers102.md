# bariscagliyan/cabm-flowers102

## Resumen

CaBM Flowers-102 es un clasificador de texto que forma parte de Caption Bottleneck Models (CaBM), una familia de modelos de cuello de botella conceptual presentada en el paper "Caption Bottleneck Models" (ECCV 2026). El modelo lo desarrolla Seref Baris Cagliyan junto con Umut Ozdemir, Merve Tapli y Emre Akbas, y su propósito es clasificar imágenes de Oxford Flowers-102 (102 clases de flores) sin procesar la imagen directamente: un modelo visión-lenguaje congelado genera K leyendas (captions) censuradas de la imagen y este clasificador RoBERTa-base puntúa cada leyenda, promediando los logits resultantes.

La arquitectura es un transformer encoder RoBERTa-base afinado, en el que la representación [CLS] de la última capa alimenta una cabeza lineal de 102 clases. El modelo base es FacebookAI/roberta-base y el repositorio pesa aproximadamente 0,5 GB en formato safetensors. La relevancia actual radica en su enfoque de interpretabilidad: la decisión de clasificación se toma exclusivamente a partir de texto descriptivo, lo que permite auditar qué información visual se está utilizando y descarta el uso directo de píxeles en la etapa de clasificación.

El modelo está pensado para investigación en interpretabilidad y clasificación de imágenes mediada por lenguaje, no para despliegue genérico de clasificación visual. Su licencia MIT y su pipeline declarado como text-classification reflejan que el artefacto publicado es únicamente el clasificador de texto, no el sistema completo de generación de leyendas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) con cabeza lineal sobre el token [CLS] de la última capa |
| Parametros totales | no disponible (el repositorio ocupa 0,5 GB; roberta-base ronda los 125 M, pero el dato exacto no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max_length usado en el tokenizador durante el ejemplo de uso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El clasificador es un RoBERTa-base afinado con una cabeza lineal que mapea la representación [CLS] de la última capa a 102 clases. El entrenamiento se realizó durante un máximo de 30 épocas con learning rate 2e-05, batch efectivo de 48, label smoothing de 0,1, learning rate diferencial por capas (LLRD) de 0,85, congelación de las dos capas inferiores y early stopping sobre la pérdida de validación. Las leyendas utilizadas provienen del conjunto `datasets/cabm-captions/flowers102`.

La innovación técnica reside en el cuello de botella textual: un captioner congelado (`Qwen/Qwen3-VL-2B-Instruct`) genera 5 leyendas por imagen con temperaturas de muestreo 0,7, 0,9, 1,1, 1,3 y 1,5, y el clasificador puntúa cada leyenda de forma independiente; la predicción final se obtiene promediando los logits por leyenda. Este diseño elimina el acceso directo a píxeles en la etapa de clasificación y hace que la decisión sea auditable a través del texto intermedio.

## Capacidades

- Clasificación de imágenes de Oxford Flowers-102 (102 clases) mediada por leyendas de texto.
- Puntuación de leyendas individuales: el modelo acepta una o varias leyendas de una misma imagen y devuelve logits por leyenda.
- Agregación por promedio de logits para producir la predicción final de imagen.
- Interpretabilidad por construcción: la decisión depende solo del texto descriptivo generado por el captioner congelado.
- Procesamiento de texto en inglés (idioma declarado: en).
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión directa, audio ni modo thinking.

## Casos de uso

- Investigación en interpretabilidad de clasificadores: permite analizar qué descriptores textuales (color, forma, pétalos, hábitat) influyen en la predicción de cada clase de flor, al disponer de logits por leyenda y poder auditar el texto intermedio.
- Clasificación de imágenes en entornos con restricciones de privacidad: al no procesar píxeles en la etapa de clasificación, el pipeline puede separar la generación de leyendas (con captioner congelado) del clasificador, facilitando el control de acceso a la imagen original.
- Evaluación de captioners visión-lenguaje: el modelo sirve como sonda para medir cuánta información discriminativa conserva un captioner congelado en sus leyendas, comparando temperaturas de muestreo y número de leyendas K.
- Docencia y demostraciones de cuellos de botella conceptuales: el ejemplo de uso del repositorio permite reproducir el flujo completo (leyendas → tokenización → logits → promedio → etiqueta) en CPU o GPU.
- Benchmarking de robustez textual: al puntuar leyendas independientes, se puede estudiar cómo varía la precisión con leyendas más o menos censuradas o con distintas temperaturas.
- Prototipado de sistemas híbridos visión-lenguaje para taxonomía botánica: como componente de clasificación en un pipeline que genera descripciones de flores y las etiqueta en las 102 clases de Oxford Flowers-102.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Image Classification | Oxford Flowers-102 | Top-1 accuracy (caption logit averaging) | 84,23 % |
| Image Classification | Oxford Flowers-102 | Top-5 accuracy | 96,05 % |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un RoBERTa-base (repo de 0,5 GB), la inferencia en precisión completa cabe holgadamente en GPUs de consumo, pero no se declaran cifras exactas.
- GPU recomendadas: no disponible; el ejemplo de uso del autor contempla ejecución en `cuda` si está disponible y en `cpu` en caso contrario.
- Cabe en GPU de consumo: sí, por el tamaño del repositorio (0,5 GB) y la arquitectura RoBERTa-base; modelos concretos no declarados.
- Opciones de despliegue: el repositorio oficial usa PyTorch con la librería `cabm` (`load_trained`) y requiere clonar `CaptionBottleneckModels` e instalar `requirements.txt`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone en la información proporcionada de modelos comparables de la misma categoría (clasificadores de texto para cuellos de botella conceptuales sobre Oxford Flowers-102) con parámetros, contexto, rendimiento y licencia declarados. Se indica "no disponible".

## Limitaciones y advertencias

- El modelo no clasifica imágenes directamente: depende de un captioner externo congelado (`Qwen/Qwen3-VL-2B-Instruct`) y de un pipeline de generación de leyendas; sin ese paso previo, el clasificador no produce predicciones útiles.
- La precisión declarada (84,23 % top-1) es un dato del autor no verificado (`verified: false` en el model-index).
- El idioma declarado es únicamente inglés; las leyendas en otros idiomas no están contempladas en la model card.
- La longitud de entrada está limitada a 512 tokens por leyenda en el ejemplo de uso, lo que puede truncar descripciones largas.
- Riesgo de sesgos y alucinaciones heredado del captioner: descripciones incorrectas o incompletas degradan la clasificación, y el modelo no dispone de mecanismo declarado para detectarlas.
- Ámbito restringido a las 102 clases de Oxford Flowers-102; no es un clasificador genérico de imágenes.
- Licencia MIT: permite uso comercial, pero no se declaran garantías ni condiciones adicionales más allá de la licencia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bariscagliyan/cabm-flowers102
- Paper (arXiv): https://arxiv.org/abs/2607.00578
- Código (GitHub): https://github.com/bariscagliyan/CaptionBottleneckModels
- Captioner utilizado: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
