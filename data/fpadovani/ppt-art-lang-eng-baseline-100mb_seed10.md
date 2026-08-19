# fpadovani/ppt-art-lang-eng-baseline-100mb_seed10

## Resumen

El modelo `ppt-art-lang-eng-baseline-100mb_seed10` es un ajuste fino (fine-tuning) del modelo base `goldfish-models/eng_latn_100mb`, perteneciente a la serie Goldfish de modelos de lenguaje entrenados con 100 MB de datos textuales en un idioma concreto. El autor, fpadovani, lo ha entrenado mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL de Hugging Face, con el objetivo de adaptar el modelo base a una tarea específica de generación de texto (posiblemente relacionada con un proyecto de investigación sobre arte y lenguaje, según el nombre "ppt-art-lang").

Con aproximadamente 86 millones de parámetros, se trata de un modelo pequeño, diseñado para experimentación y prototipado rápido. Su arquitectura es un transformer decoder tipo GPT-2, como indica la etiqueta `gpt2` en el repositorio. El modelo está disponible en formato safetensors y es compatible con el pipeline de generación de texto de Transformers. Su relevancia actual radica en servir como punto de partida para investigaciones sobre ajuste fino de modelos pequeños, así como para aplicaciones donde se requiera un modelo ligero y de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (tipo GPT-2) |
| Parametros totales | 86.416.128 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere inglés, pero no está confirmado) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-2, un transformer decoder estándar con mecanismo de atención causal. Al ser un ajuste fino del modelo `goldfish-models/eng_latn_100mb`, hereda su configuración estructural, aunque no se han publicado los detalles exactos de capas, dimensiones o número de cabezas de atención. El entrenamiento se realizó mediante SFT (Supervised Fine-Tuning) con la librería TRL, utilizando PyTorch 2.5.1 y Transformers 4.56.2. No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados, ni si se aplicaron técnicas adicionales como RLHF o DPO. El proceso de entrenamiento está documentado en un registro de Weights & Biases, aunque los detalles específicos no están accesibles desde la información proporcionada.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto coherente en inglés (presumiblemente) a partir de un prompt, gracias a su entrenamiento como modelo de lenguaje autorregresivo.
- Conversación multi-turno: el ejemplo de uso en la model card muestra cómo se puede utilizar con el pipeline de Transformers para responder a preguntas, lo que sugiere cierta capacidad de seguir instrucciones sencillas.
- No se han documentado capacidades avanzadas como tool calling, razonamiento multi-paso, visión, audio o modo de pensamiento explícito.

## Casos de uso

- Prototipado rápido de aplicaciones de generación de texto: al ser un modelo pequeño y de bajo coste computacional, es adecuado para validar ideas o flujos de trabajo antes de escalar a modelos más grandes. Se puede cargar en un portátil con GPU o incluso en CPU para pruebas iniciales.
- Investigación en ajuste fino de modelos pequeños: sirve como ejemplo de cómo adaptar un modelo base de dominio específico (Goldfish) mediante SFT, permitiendo estudiar el impacto del fine-tuning en modelos de pocos parámetros.
- Educación y formación: por su tamaño reducido, es útil para enseñar conceptos de transformers, generación de texto y fine-tuning en entornos académicos, sin necesidad de infraestructura avanzada.
- Generación de respuestas en aplicaciones de chat de baja exigencia: puede integrarse en sistemas de chatbot simples donde no se requiera un conocimiento profundo del mundo, sino respuestas rápidas y coherentes en inglés.
- Experimentación con pipelines de Hugging Face: dado que es compatible con `text-generation-inference` y `endpoints_compatible`, se puede desplegar en servicios de inferencia gestionada para probar su comportamiento en producción a pequeña escala.
- Análisis de sesgos y comportamiento de modelos pequeños: al ser un modelo de investigación, permite estudiar limitaciones y sesgos inherentes a modelos entrenados con pocos datos, contribuyendo a la comprensión de la escalabilidad en NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar que permitan comparar su rendimiento con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tener 86 millones de parámetros, en precisión fp32 el modelo ocupa aproximadamente 345 MB, y en fp16 unos 173 MB. Por tanto, cabe en cualquier GPU con al menos 1 GB de VRAM, incluso en GPUs integradas de portátiles.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, como NVIDIA GTX 1060, RTX 2060, RTX 3060, etc. También puede ejecutarse en CPU, aunque con mayor latencia.
- Despliegue: compatible con `transformers`, `text-generation-inference` (TGI) y `endpoints_compatible`, lo que permite su uso en soluciones como Hugging Face Inference Endpoints, vLLM (si se convierte a formato adecuado) o llama.cpp (si se exporta a GGUF).
- Latencia y throughput: no se han publicado datos oficiales. No obstante, al ser un modelo pequeño, se espera una latencia de decenas de milisegundos por token en una GPU moderna, y un throughput elevado en entornos de inferencia optimizados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ppt-art-lang-eng-baseline-100mb_seed10 | 86M | no disponible | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124M | 1024 | MIT | Hugging Face |
| Goldfish eng_latn_100mb (base) | ~86M (estimado) | no disponible | Apache 2.0 (según proyecto Goldfish) | Hugging Face |

Nota: la comparación con GPT-2 small es orientativa en cuanto a tamaño, pero no hay datos de rendimiento para este modelo. El modelo base Goldfish tiene una licencia Apache 2.0 (según el repositorio del proyecto), pero la licencia de este fine-tuning no está especificada.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un ajuste fino de un modelo entrenado con solo 100 MB de datos, es probable que herede sesgos presentes en ese corpus, aunque no se han documentado.
- Riesgo de alucinación: como todo modelo de lenguaje generativo, puede producir contenido falso o inventado, especialmente en temas fuera de su limitado conocimiento.
- Limitaciones de contexto e idioma: no se ha especificado la longitud máxima de contexto, pero los modelos Goldfish suelen tener ventanas cortas (512 o 1024 tokens). El idioma principal parece ser inglés, pero no está confirmado.
- Restricciones de licencia: la licencia no está definida en la model card, lo que impide su uso comercial sin aclaración previa. Se recomienda contactar al autor antes de cualquier implementación productiva.
- Adecuación para producción: al ser un modelo experimental y sin benchmarks, no se recomienda su uso en sistemas críticos sin una evaluación exhaustiva previa.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/fpadovani/ppt-art-lang-eng-baseline-100mb_seed10)
- [Modelo base: goldfish-models/eng_latn_100mb](https://huggingface.co/goldfish-models/eng_latn_100mb)
- [Registro de entrenamiento en Weights & Biases](https://wandb.ai/f-padovani-university-of-groningen/ppt_art_lang/runs/nmo832xu)
