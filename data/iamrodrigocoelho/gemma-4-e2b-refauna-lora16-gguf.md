# iamrodrigocoelho/gemma-4-e2b-refauna-lora16-GGUF

## Resumen

Gemma 4 E2B · Refauna (LoRA 16-bit) es un ajuste fino del modelo base `google/gemma-4-e2b-it` especializado en defaunación, refaunación, reintroducción de fauna, dispersión de semillas y conservación de la Mata Atlántica. Lo desarrolla iamrodrigocoelho a partir de la producción científica de la iniciativa Refauna, creada en 2010 para devolver animales silvestres nativos a sus hábitats en la Mata Atlántica de Río de Janeiro. El modelo está pensado como un asistente conversacional en portugués de Brasil que responde citando los fragmentos recuperados de los artículos de Refauna mediante un esquema de referencias `[n]`.

El ajuste se realizó con LoRA de 16 bits (r=16, alpha=16, 2 épocas, lr=0.0002) sobre 942 ejemplos sintéticos en PT-BR generados a partir de 22 artículos con un estilo tipo RAFT: aproximadamente un 60% con contexto y citas, un 15% de abstención y un 25% sin contexto. El entrenamiento se ejecutó en una NVIDIA L4 en 23,9 minutos con un pico de 12,45 GB de VRAM. Esta variante se creó explícitamente para comparar el método LoRA de 16 bits con la versión QLoRA del mismo autor.

El modelo tiene 4.647.450.147 parámetros totales y se distribuye en formato GGUF (repo de 9,4 GB), lo que facilita su despliegue en Ollama y en entornos con recursos limitados. Su relevancia actual radica en demostrar cómo un modelo pequeño, ajustado con datos especializados y combinado con RAG, puede ofrecer respuestas trazables y con abstención controlada en un dominio científico concreto, sin necesidad de infraestructura de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), ajuste fino mediante LoRA de 16 bits sobre `google/gemma-4-e2b-it` |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repo incluye al menos Q4_K_M; no se detallan el resto de variantes) |
| Idiomas soportados | Portugués de Brasil (pt), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo principal); el autor referencia también una variante en Transformers (`iamrodrigocoelho/gemma-4-e2b-refauna-lora16`) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-e2b-it` (licencia Apache 2.0), cargado a través de `unsloth/gemma-4-E2B-it`, y aplica un ajuste LoRA de 16 bits con r=16 y alpha=16 durante 2 épocas con una tasa de aprendizaje de 0.0002. El entrenamiento se limita únicamente a las capas de lenguaje y utiliza la plantilla de chat `gemma-4` en modo sin *thinking*. No se especifica la arquitectura interna del modelo base más allá de su naturaleza transformer, ni el número de tokens de entrenamiento del preentrenamiento original.

El corpus de ajuste consta de 942 ejemplos sintéticos en PT-BR generados a partir de 22 artículos científicos de Refauna, con un diseño tipo RAFT: cerca del 60% de los ejemplos incluyen contexto y citas, un 15% son ejemplos de abstención y un 25% carecen de contexto. Se aplicó revisión humana por muestreo y una división por documento para evitar filtración entre entrenamiento y evaluación. El entrenamiento se ejecutó en una NVIDIA L4 durante 23,9 minutos con un pico de 12,45 GB de VRAM. La innovación principal no está en la arquitectura, sino en el diseño del dataset orientado a la generación con citas y a la abstención explícita cuando el contexto no contiene la respuesta.

## Capacidades

- Generación de texto conversacional en portugués de Brasil, con respuestas claras, didácticas y precisas según la plantilla de sistema definida por el autor.
- Respuestas fundamentadas en contexto recuperado (RAG) con citas en formato `[n]` que referencian los fragmentos numerados proporcionados en el prompt.
- Abstención controlada: cuando el contexto no contiene la respuesta, el modelo está entrenado para indicar explícitamente que no encontró la información en los documentos de Refauna y no inventar datos, cifras, fechas ni nombres de especies.
- Conocimiento especializado en defaunación, refaunación, reintroducción de fauna, dispersión de semillas, interacciones ecológicas y conservación de la Mata Atlántica.
- Capacidad multilingüe limitada a portugués de Brasil e inglés según los metadatos del modelo.
- Soporte de conversación multi-turno a través de la plantilla de chat `gemma-4`.
- No se documenta soporte de *tool calling*, *function calling*, agentes, visión, audio ni modo *thinking* en la información disponible.

## Casos de uso

- Asistente de divulgación científica sobre refaunación: el modelo responde preguntas del público general sobre la reintroducción de especies en la Mata Atlántica, citando los artículos de Refauna como `[n]` para que el usuario pueda verificar cada afirmación.
- Apoyo a investigadores en revisiones bibliográficas: integrado en un pipeline RAG con `google/embeddinggemma-300m` y BM25 con fusión RRF (top-4), permite consultar rápidamente los hallazgos de los 22 artículos indexados y obtener respuestas con trazabilidad a la fuente.
- Herramienta educativa en cursos de biología de la conservación: el modelo puede explicar conceptos como el crédito de interacciones ecológicas o la dispersión de semillas por cutias reintroducidas, con abstención explícita cuando la pregunta queda fuera del corpus.
- Chatbot de ONG o proyecto de conservación: desplegado vía Ollama con la cuantización Q4_K_M, puede ofrecer respuestas en portugués de Brasil a visitantes y voluntarios sobre el trabajo de Refauna en el Parque Nacional de Tijuca.
- Generación de material de divulgación con control de fidelidad: el autor evalúa la *fidelidad* de las respuestas (4,21 sobre 5 en la configuración FT+RAG), lo que permite usar el modelo para redactar borradores que luego se revisan contra las fuentes citadas.
- Evaluación comparativa de métodos de ajuste: al existir una variante QLoRA del mismo autor, este modelo sirve como referencia para estudiar diferencias entre LoRA de 16 bits y QLoRA en dominios científicos pequeños.
- Prototipado de asistentes RAG de bajo coste: con 4,6 mil millones de parámetros y formato GGUF, es viable ejecutarlo en hardware de consumo para validar flujos de recuperación y citación antes de escalar a modelos mayores.

## Benchmarks y rendimiento

La model card del autor presenta una evaluación propia con notas de 1 a 5 asignadas por un jurado LLM sobre cuatro configuraciones (A = base, B = base+RAG, C = ajustado, D = ajustado+RAG):

| Configuración | Corrección | Fidelidad | Citación correcta | Abstención correcta | PT-BR |
|---|---|---|---|---|---|
| A: base | 1,12 | no disponible | no disponible | no disponible | 1,00 |
| B: base+RAG | 2,45 | 4,34 | 0,52 | 0,88 | 1,00 |
| C: ajustado (FT) | 2,00 | no disponible | no disponible | no disponible | 1,00 |
| D: ajustado+RAG (FT+RAG) | 2,34 | 4,21 | 0,52 | 0,88 | 1,00 |

Además, se reporta la calidad de la recuperación híbrida en el conjunto de prueba (n=74): Recall@4 = 0,42 y MRR@20 = 0,30. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento requirió un pico de 12,45 GB en una NVIDIA L4; para inferencia con cuantización Q4_K_M el requisito es sustancialmente menor, aunque no se publica una cifra exacta en la información disponible.
- GPU recomendadas: NVIDIA L4 fue la utilizada para el ajuste; para inferencia en GGUF es adecuado cualquier hardware compatible con llama.cpp u Ollama, incluidas GPU de consumo.
- Cabe en GPU de consumo: sí, previsiblemente en modelos con 8 GB o más de VRAM usando Q4_K_M, aunque el autor no detalla requisitos mínimos verificados.
- Opciones de despliegue: Ollama (`ollama run hf.co/iamrodrigocoelho/gemma-4-e2b-refauna-lora16-GGUF:Q4_K_M`) y Transformers mediante `pipeline("text-generation", model="iamrodrigocoelho/gemma-4-e2b-refauna-lora16")`. No se documentan opciones para vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E2B · Refauna (LoRA 16-bit) | 4.647.450.147 | no disponible | Asistente RAG especializado en conservación de la Mata Atlántica (PT-BR) | Apache 2.0 | GGUF en Hugging Face + variante Transformers |
| Gemma 4 E2B · Refauna (QLoRA) | mismo base | no disponible | Mismo dominio, ajuste con QLoRA | Apache 2.0 | Hugging Face (según referencia del autor) |
| `google/gemma-4-e2b-it` (base) | 4.647.450.147 | no disponible | Modelo conversacional generalista | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks estándar ni de comparaciones con otros modelos especializados en el mismo dominio en la información proporcionada.

## Limitaciones y advertencias

- Uso educativo y de divulgación científica: no sustituye a la literatura original; el autor recomienda consultar siempre las fuentes citadas.
- Sin RAG, el modelo puede equivocarse en cifras, fechas y nombres de especies, ya que parte del conocimiento se apoya en el contexto recuperado.
- El conocimiento está restringido a los 22 artículos utilizados en el ajuste y no cubre todo el trabajo de Refauna.
- La corrección media en la configuración FT+RAG es de 2,34 sobre 5, lo que indica margen de mejora sustancial.
- La citación correcta se sitúa en 0,52 tanto en base+RAG como en FT+RAG, es decir, aproximadamente la mitad de las citas son correctas.
- La recuperación híbrida es limitada (Recall@4 = 0,42, MRR@20 = 0,30), lo que condiciona la calidad de las respuestas en modo RAG.
- Idiomas limitados a portugués de Brasil e inglés; no se documenta soporte para castellano.
- No se documentan sesgos específicos, pero al derivar de un modelo base generalista puede heredar sesgos de este.
- Licencia Apache 2.0, que permite uso comercial, aunque el autor orienta el modelo a fines educativos y de divulgación.
- No se documentan resultados de benchmarks estándar que permitan comparar su rendimiento general con otros modelos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iamrodrigocoelho/gemma-4-e2b-refauna-lora16-GGUF
- Variante QLoRA del mismo autor: https://huggingface.co/iamrodrigocoelho/gemma-4-e2b-refauna
- Variante Transformers referenciada: https://huggingface.co/iamrodrigocoelho/gemma-4-e2b-refauna-lora16
- Modelo base: https://huggingface.co/google/gemma-4-e2b-it
- Repositorio Unsloth del base: https://huggingface.co/unsloth/gemma-4-E2B-it
- Embeddings usados en el RAG: https://huggingface.co/google/embeddinggemma-300m
- Iniciativa Refauna: https://refauna.org.br
- DOI de referencia (2013): https://doi.org/10.1590/S1984-46702013000100015
- DOI de referencia (2014): https://doi.org/10.1177/194008291400700415
- DOI de referencia (2014): https://doi.org/10.1590/bjb.2014.0087
- DOI de referencia (2015): https://doi.org/10.1590/0102-33062015abb0008
- DOI de referencia (2017): https://doi.org/10.1002/ece3.2746
- DOI de referencia (2017): https://doi.org/10.1016/j.pecon.2017.09.004
- DOI de referencia (2018): https://doi.org/10.1017/S0030605316001149
- DOI de referencia (2024): https://doi.org/10.3389/fcosc.2024.1401
