# Astra2011/Divine-1o

## Resumen

Divine-1o es un modelo de generación de texto publicado en Hugging Face por el usuario Astra2011 bajo el identificador `Astra2011/Divine-1o`. Se distribuye como un checkpoint de la librería `transformers` en formato `safetensors`, con un total de 1.543.714.304 parámetros (aproximadamente 1,54 mil millones) y un tamaño de repositorio de 3,1 GB. La etiqueta de arquitectura presente en el repositorio es `qwen2`, lo que sitúa al modelo en la familia de transformers decoder-only de Qwen2, aunque el autor no lo confirma explícitamente en la model card.

El modelo está etiquetado con `trl` y `sft`, lo que indica que se ha sometido a un ajuste supervisado (supervised fine-tuning) mediante la librería TRL, presumiblemente partiendo de un modelo base de la familia Qwen2. La model card es la plantilla automática de Hugging Face y no aporta información sustantiva sobre datos de entrenamiento, hiperparámetros, licencia, idiomas ni evaluación.

La relevancia de este modelo es limitada en el momento de redactar esta ficha: cuenta con 0 descargas y 0 likes, no tiene licencia declarada, no publica resultados de benchmarks y su documentación está sin completar. Se trata, por tanto, de un checkpoint de investigación o experimento personal cuyo uso en producción no está respaldado por información verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (según tag `qwen2`) |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura declarada mediante tags es `qwen2`, es decir, un transformer decoder-only con atención causal, propio de la familia Qwen2 de Alibaba. El recuento real de parámetros (1.543.714.304) es coherente con un modelo de aproximadamente 1,5 B de parámetros, si bien no se especifica la configuración exacta de capas, dimensiones ocultas, cabezas de atención ni longitud de contexto nativa.

En cuanto al entrenamiento, las únicas pistas son las etiquetas `trl` y `sft`, que apuntan a un ajuste supervisado con TRL sobre un modelo base no identificado. No se documentan el número de tokens de entrenamiento, la composición del dataset, la existencia de RLHF/DPO, ni detalles sobre preprocesado o precisión mixta utilizada. La model card indica explícitamente `[More Information Needed]` en todas las secciones de detalles de entrenamiento, por lo que cualquier afirmación adicional sobre el proceso sería especulativa.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` sugiere un ajuste orientado a diálogo multi-turno, aunque no se documenta el formato de prompt ni la plantilla de chat.
- Generación de texto general: pipeline declarado `text-generation`.
- Ajuste supervisado (SFT): el modelo ha pasado por un proceso de fine-tuning con TRL, orientado presumiblemente a seguir instrucciones.
- Compatibilidad con Text Generation Inference y endpoints: los tags `text-generation-inference` y `endpoints_compatible` indican que el checkpoint puede desplegarse con TGI y con los endpoints de Hugging Face.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales: al estar ajustado con SFT y etiquetado como conversacional, puede emplearse para experimentar con diálogos multi-turno en entornos de laboratorio, siempre que se valide previamente la calidad de las respuestas.
- Fine-tuning adicional sobre dominio específico: al ser un modelo de 1,54 B en safetensors y compatible con `transformers` y TRL, sirve como punto de partida para ajustes supervisados adicionales en tareas concretas (clasificación generativa, resumen, extracción).
- Despliegue en infraestructura modesta: con 1,54 B de parámetros y 3,1 GB de pesos, es viable ejecutarlo en GPUs de consumo con cuantización, lo que permite pruebas de integración en pipelines ligeros.
- Generación de texto en lote para experimentación: su tamaño reducido permite procesar grandes volúmenes de prompts en una sola GPU para tareas de generación masiva en investigación.
- Evaluación comparativa de checkpoints SFT: útil como baseline en estudios sobre el efecto del fine-tuning supervisado en modelos Qwen2 pequeños.
- Integración en demos con TGI: los tags `text-generation-inference` y `endpoints_compatible` permiten servirlo con TGI o con Inference Endpoints de Hugging Face para demos internas.
- Educación y experimentación con TRL: sirve como ejemplo práctico de un checkpoint generado con el flujo SFT de TRL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y KV cache (estimación práctica de 4-6 GB según longitud de contexto).
- VRAM estimada en cuantización de 8 bits: en torno a 1,6-2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 0,8-1,2 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4070, L4, A10); para cuantización 4 bits, GPUs con 4-6 GB (GTX 1650 Super, RTX 3050).
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer modernas con al menos 6-8 GB de VRAM.
- Opciones de despliegue: `transformers` (nativo), Text Generation Inference (tag `text-generation-inference`), Hugging Face Inference Endpoints (tag `endpoints_compatible`). No se han publicado pesos GGUF, por lo que llama.cpp y Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Divine-1o (Astra2011) | 1,54 B | No disponible | No disponible | Hugging Face, 0 descargas |
| Qwen2.5-1.5B (Alibaba) | 1,54 B | 32.768 tokens (versión base) | Apache 2.0 | Hugging Face, ampliamente utilizado |
| Qwen2-1.5B (Alibaba) | 1,54 B | 32.768 tokens | Apache 2.0 | Hugging Face, ampliamente utilizado |
| SmolLM2-1.7B (Hugging Face) | 1,7 B | 8.192 tokens | Apache 2.0 | Hugging Face, ampliamente utilizado |

La comparación se basa en el tamaño y la familia arquitectónica declarada; no se dispone de datos de rendimiento de Divine-1o para comparar calidad. Los modelos Qwen2/Qwen2.5 de 1,5 B y SmolLM2-1,7 B son alternativas con licencia permisiva, contexto documentado y benchmarks publicados.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica licencia, lo que impide determinar si el uso comercial está permitido. En la práctica, esto bloquea su adopción en producción sin aclaración previa del autor.
- Documentación incompleta: la model card es la plantilla automática y no aporta información sobre datos, entrenamiento, evaluación ni uso previsto.
- Sin benchmarks: no hay evidencia publicada de calidad, lo que impide comparar su rendimiento con alternativas.
- Riesgo de alucinación: no cuantificado; al ser un modelo pequeño ajustado con SFT sin documentación, es esperable un riesgo elevado de respuestas inventadas, pero no hay datos que lo confirmen.
- Sesgos: no documentados. Al desconocerse el dataset de ajuste, no se pueden evaluar sesgos de género, idioma, cultura o dominio.
- Idiomas: no declarados; no se puede garantizar un rendimiento aceptable en castellano ni en ningún otro idioma.
- Contexto: no documentado; no se conoce la longitud máxima de secuencia soportada.
- Madurez: 0 descargas y 0 likes en el momento de la ficha, sin señales de uso comunitario ni mantenimiento.
- Producción: no recomendado para entornos productivos sin una evaluación propia exhaustiva y sin aclaración de licencia.

## Enlaces

- Hugging Face: https://huggingface.co/Astra2011/Divine-1o
- Paper de referencia sobre impacto ambiental citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact#compute
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
