# fpadovani/nor-latn-10mb-ppt-shuff-dyck-10mb_seed3407

## Resumen

El modelo `fpadovani/nor-latn-10mb-ppt-shuff-dyck-10mb_seed3407` es un fine-tuning del modelo base `goldfish-models/nor_latn_10mb`, desarrollado por el usuario fpadovani. Se trata de un modelo de lenguaje autoregresivo basado en la arquitectura GPT-2, con 39.087.104 parámetros, entrenado mediante SFT (supervised fine-tuning) con la librería TRL sobre un dataset sintético cuyo nombre sugiere tareas de shuffle y Dyck (paréntesis balanceados).

La relevancia de este modelo radica en su carácter experimental y su pequeño tamaño, lo que lo convierte en un candidato para investigación en modelos de lenguaje compactos y en el estudio de cómo los transformers aprenden estructuras formales. No se dispone de información sobre la longitud de contexto, la licencia ni los idiomas soportados, lo que limita su uso a entornos de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parametros totales | 39.087.104 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura GPT-2 (transformer decoder-only), tal como indican las etiquetas del repositorio. El entrenamiento consistió en un fine-tuning supervisado (SFT) sobre el modelo base `goldfish-models/nor_latn_10mb`, utilizando el framework TRL 0.23.0, Transformers 4.56.2 y PyTorch 2.5.1+cu121. El dataset de fine-tuning, `ppt-shuff-dyck-10mb`, no está documentado en la ficha, pero por su nombre parece combinar operaciones de shuffle con el lenguaje Dyck, un conjunto de paréntesis balanceados usado habitualmente para evaluar el razonamiento estructural de los modelos. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición del dataset. No se menciona RLHF ni DPO.

## Capacidades

- Generación de texto autoregresiva mediante la API de `transformers`.
- Soporte para el pipeline `text-generation` y `endpoints_compatible`.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte para agentes o razonamiento multi-paso.
- Capacidades multilingües no confirmadas; el nombre del modelo sugiere noruego en alfabeto latino (`nor_latn`).
- No se ha documentado ninguna capacidad especial (visión, audio, thinking mode).

## Casos de uso

- Investigación en lenguajes formales: el modelo puede emplearse para estudiar cómo un transformer pequeño aprende la estructura de paréntesis balanceados (Dyck), gracias a su fine-tuning en un dataset sintético de ese tipo.
- Evaluación de pipelines de SFT: al estar entrenado con TRL, sirve como ejemplo de un flujo de fine-tuning supervisado reproducible, útil para comparar configuraciones de entrenamiento.
- Análisis de variabilidad por semilla: la existencia de variantes con distintas semillas (como `seed3407`) permite investigar el efecto de la inicialización en el rendimiento de modelos pequeños.
- Comparación translingüística: junto con los modelos hermanos para sueco (`swe`) y neerlandés (`nld`), permite comparar el comportamiento de la misma arquitectura y dataset en distintos idiomas.
- Docencia y divulgación: por su tamaño reducido, se puede cargar en CPU y usar en cursos para demostrar el funcionamiento de los transformers y el fine-tuning.
- Pruebas de generación en entornos controlados: el modelo puede utilizarse en experimentos de generación de texto donde se necesite un modelo ligero y rápido, siempre que no se requiera calidad de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB. Los pesos en FP16 ocupan aproximadamente 80 MB y en FP32 unos 160 MB, más las activaciones.
- GPU recomendada: cualquier GPU con al menos 1 GB de VRAM; también funciona en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (series RTX, GTX, etc.).
- Opciones de despliegue: `transformers` pipeline, vLLM, TGI y llama.cpp (previa conversión a GGUF).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los modelos comparables son el modelo base y otros fine-tunings de la misma serie. No se dispone de datos de contexto, licencia ni rendimiento para ninguno de ellos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| fpadovani/nor-latn-10mb-ppt-shuff-dyck-10mb_seed3407 | 39.087.104 | no disponible | no disponible | HuggingFace |
| goldfish-models/nor_latn_10mb | no disponible | no disponible | no disponible | HuggingFace |
| fpadovani/swe-latn-10mb-ppt-shuff-dyck-10mb_seed3407 | no disponible | no disponible | no disponible | HuggingFace |
| fpadovani/nld-latn-10mb-ppt-shuff-dyck-100mb_seed3407 | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Sesgos: no se han evaluado; el modelo puede heredar sesgos del modelo base y del dataset de fine-tuning.
- Riesgo de alucinación: al ser un modelo pequeño y entrenado en un dataset sintético, es probable que genere contenido incoherente o inventado fuera de su distribución.
- Limitaciones de contexto: la longitud de contexto no está especificada; se recomienda verificar antes de usar en aplicaciones que requieran ventanas largas.
- Restricciones de licencia: la licencia no está indicada, lo que impide garantizar su uso comercial.
- Caveat para producción: es un modelo experimental con 0 descargas y 0 likes; no hay evidencia de calidad ni de soporte, por lo que no se recomienda para sistemas en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/nor-latn-10mb-ppt-shuff-dyck-10mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/nor_latn_10mb
- Modelo hermano (sueco): https://huggingface.co/fpadovani/swe-latn-10mb-ppt-shuff-dyck-10mb_seed3407
- Modelo hermano (neerlandés): https://huggingface.co/fpadovani/nld-latn-10mb-ppt-shuff-dyck-100mb_seed3407
- Registro de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new_tokenizers/runs/053uffcw
