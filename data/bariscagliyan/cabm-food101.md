# bariscagliyan/cabm-food101

## Resumen

CaBM Food-101 es un clasificador de texto perteneciente a la familia Caption Bottleneck Models (CaBM), presentada en ECCV 2026. No es un modelo de visión al uso: clasifica imágenes de Food-101 (101 clases de platos) **únicamente a partir de texto**. Un modelo visión-lenguaje congelado (`Qwen/Qwen3-VL-2B-Instruct`) genera K captions censuradas de la imagen, este clasificador RoBERTa-base puntúa cada caption y se promedian los logits por caption para obtener la predicción final.

El modelo se construye sobre `FacebookAI/roberta-base` (arquitectura transformer encoder, ~125 M parámetros) con una cabeza lineal sobre el token [CLS] de la última capa. El repositorio pesa 0,5 GB y se distribuye en formato safetensors bajo licencia MIT. Su interés radica en la interpretabilidad: la decisión de clasificación es auditable a través de las captions intermedias, lo que permite inspeccionar qué evidencia textual usó el sistema.

Es relevante ahora porque propone una alternativa a los clasificadores de imagen opacos, desacoplando la percepción visual (captioner congelado, reutilizable) de la decisión de clasificación (clasificador de texto entrenable y ligero). El coste es que requiere un pipeline de dos etapas y depende de la calidad del captioner.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) con cabeza lineal sobre [CLS] de la última capa |
| Parametros totales | ~125 M (roberta-base); no disponible el recuento exacto del checkpoint |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens por caption (truncation a max_length=512) |
| Tipos de cuantizacion | No disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

El sistema CaBM tiene dos etapas. Primero, un captioner visión-lenguaje congelado (`Qwen/Qwen3-VL-2B-Instruct`) genera K=5 captions censuradas por imagen, muestreadas con temperaturas 0.7, 0.9, 1.1, 1.3 y 1.5. Después, este clasificador RoBERTa-base procesa cada caption de forma independiente y emite un vector de logits sobre las 101 clases; la predicción final es la media de los logits de las K captions ("caption logit averaging").

El clasificador se entrena sobre el conjunto de captions `datasets/cabm-captions/food101` durante un máximo de 30 épocas, con learning rate 2e-5, batch efectivo 48, label smoothing 0.1, layer-wise learning rate decay (LLRD) de 0.85, las dos capas inferiores congeladas y early stopping sobre la pérdida de validación. La innovación técnica es el "cuello de botella" de captions: la clasificación pasa obligatoriamente por una representación textual intermedia, lo que hace la decisión interpretable y permite reutilizar un único captioner para múltiples tareas de clasificación.

## Capacidades

- Clasificación de imágenes de Food-101 (101 clases) en modo indirecto, a través de captions de texto.
- Interpretabilidad por diseño: las captions intermedias son inspeccionables y explican la decisión.
- Procesamiento de texto en inglés con RoBERTa-base (tokenización BPE, hasta 512 tokens por caption).
- Agregación multi-caption mediante promedio de logits, lo que reduce la varianza frente a una única caption.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades de visión propias: depende del captioner externo.
- No soporta thinking mode, audio ni otras modalidades.

## Casos de uso

- Clasificación de platos en aplicaciones de dietética o nutrición: dado un pipeline que genere captions con Qwen3-VL, el modelo etiqueta la imagen en una de las 101 clases de Food-101 con top-1 del 93,68 %, suficiente para registro automático de comidas.
- Auditoría de sistemas de visión: al exponer las captions intermedias, permite revisar por qué una imagen se clasificó de una forma concreta, útil en entornos donde se exige trazabilidad de decisiones.
- Moderación de contenido gastronómico en plataformas: clasificación rápida de imágenes de recetas o restaurantes con un clasificador de texto ligero que se ejecuta en CPU.
- Investigación en interpretabilidad: sirve como baseline reproducible para comparar clasificadores de imagen opacos frente a modelos con cuello de botella textual.
- Prototipado de pipelines multimodales de bajo coste: el captioner se comparte entre tareas y solo se reentrena la cabeza de texto, lo que abarata añadir nuevas taxonomías.
- Despliegue en entornos con recursos limitados: el clasificador RoBERTa-base (~125 M) se ejecuta en CPU o GPU consumer, mientras el captioner puede ejecutarse por lotes en un servidor separado.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Image classification | Food-101 (ethz/food101) | Top-1 accuracy (caption logit averaging) | 93,68 % |
| Image classification | Food-101 (ethz/food101) | Top-5 accuracy | 99,17 % |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks de texto.

## Requisitos de hardware

- VRAM para el clasificador: inferior a 1 GB en fp32; cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090) y se ejecuta en CPU sin problema.
- VRAM para el pipeline completo: depende del captioner `Qwen/Qwen3-VL-2B-Instruct`, que requiere varios GB adicionales (no especificado en la información disponible).
- GPU recomendadas: para el clasificador, cualquiera; para el captioner, una GPU con al menos 8-16 GB según cuantización (dato no confirmado).
- Despliegue del clasificador: PyTorch nativo según el código del repositorio; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Top-1 Food-101 | Licencia |
|---|---|---|---|---|---|
| cabm-food101 | Clasificador de texto sobre captions | ~125 M (+ captioner externo) | 512 tokens/caption | 93,68 % (declarado) | MIT |
| Clasificador de imagen CNN/transformer típico | Visión directa | Variable | No aplica | No disponible en esta ficha | Variable |
| RoBERTa-base original | Encoder de texto | ~125 M | 512 tokens | No aplica | MIT |

No se dispone en la información proporcionada de resultados de modelos comparables de la misma categoría (clasificación de imagen vía captions) para establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Dependencia total del captioner: si Qwen3-VL genera captions erróneas o censuradas de forma agresiva, el clasificador no puede recuperar la información perdida.
- Solo inglés: las captions y el clasificador están entrenados en inglés.
- Dominio restringido a Food-101: no generaliza a otras taxonomías sin reentrenamiento de la cabeza.
- Riesgo de alucinación heredado del captioner: las captions pueden describir elementos inexistentes en la imagen.
- El resultado del 93,68 % está declarado por el autor y marcado como no verificado (`verified: false`); conviene reproducirlo antes de usarlo en producción.
- Requiere pipeline de dos etapas, lo que añade latencia y complejidad operativa frente a un clasificador de imagen monolítico.
- Licencia MIT permite uso comercial, pero el captioner externo tiene su propia licencia que debe revisarse por separado.
- Sin datos publicados de sesgos, robustez ante imágenes adversarias ni comportamiento fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bariscagliyan/cabm-food101
- Paper (arXiv): https://arxiv.org/abs/2607.00578
- Código: https://github.com/bariscagliyan/CaptionBottleneckModels
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Captioner: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Dataset: https://huggingface.co/datasets/ethz/food101
