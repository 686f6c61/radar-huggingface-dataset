# Jorbaty/banking77-mistral-7b-v0.3

## Resumen

banking77-mistral-7b-v0.3 es un ajuste fino del modelo mistralai/Mistral-7B-Instruct-v0.3 realizado por el usuario Jorbaty para una tarea muy concreta: clasificar consultas de clientes bancarios en una de las 77 intenciones del dataset Banking77. El entrenamiento se hizo con QLoRA (Unsloth, rango 16, 2 epocas) sobre las 10.003 consultas del split de entrenamiento y los pesos resultantes se fusionaron en el modelo base de 16 bits, dando lugar a un checkpoint de 7.248.023.552 parametros en BF16. Forma parte de una tesis de master sobre inferencia local de LLM aplicada a soporte al cliente (National Aviation University, Kyiv, 2026).

El modelo no es un asistente generalista: hereda la arquitectura transformer densa de Mistral 7B (con sliding window attention) y la especializa en una tarea de clasificacion con una unica salida de texto, el nombre de la intencion. El autor reporta una precision de 0,9477 en el conjunto de test de Banking77 (3.080 consultas) medida con el modelo base en NF4 mas el adaptador LoRA, antes de fusionar y cuantizar; la precision del checkpoint fusionado publicado no se ha medido por separado.

Su relevancia practica esta en el nicho de despliegue local: clasificar intenciones bancarias en ingles sin depender de APIs externas, algo util para triaje de tickets, enrutamiento de conversaciones y analitica de motivos de contacto. El repositorio no tiene descargas ni likes y es de creacion muy reciente, por lo que no existe validacion independiente de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Mistral 7B), con sliding window attention |
| Parametros totales | 7.248.023.552 (aproximadamente 7,25 mil millones) |
| Parametros activos | no aplica, el modelo es denso, no MoE |
| Longitud de contexto | 32.768 tokens, heredada del modelo base Mistral-7B-Instruct-v0.3 (dato no confirmado explicitamente en la model card) |
| Tipos de cuantizacion | no se publican cuantizaciones en el repositorio; los pesos estan en BF16 fusionado. El autor reporto resultados con base NF4 mas adaptador. Compatible con cuantizacion posterior a 8 y 4 bits (por ejemplo GGUF o NF4), aunque no se distribuyen esos artefactos |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (BF16, LoRA fusionada en el modelo base) |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.3 |
| Dataset de ajuste fino | PolyAI/banking77 (split de entrenamiento, 10.003 consultas) |
| Tamano del repositorio | 14,5 GB |
| Pipeline declarado | text-generation |
| Fecha de creacion | 2026-10-13 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Mistral 7B: un transformer decoder-only de tipo denso con atencion por ventana deslizante (sliding window attention), en la que cada capa atiende a los 4.096 estados ocultos previos, lo que da un coste computacional lineal respecto a la longitud de secuencia. Mistral AI documenta mejoras sobre FlashAttention y xFormers para esta version. La variante Instruct v0.3 aporta la plantilla de chat y el ajuste de instrucciones del modelo original. El ajuste fino de este repositorio no modifica esa arquitectura: se aplica un adaptador LoRA de rango 16 sobre el modelo base cuantizado y despues se fusiona en BF16, por lo que el checkpoint final es un transformer de 7,25 mil millones de parametros sin cambios estructurales.

En cuanto al entrenamiento, el autor indica QLoRA con Unsloth, rango 16 y 2 epocas sobre las 10.003 consultas del split de entrenamiento de Banking77. No se documenta en la informacion disponible el numero de tokens procesados, la composicion exacta del dataset mas alla del propio Banking77, ni si se aplicaron etapas de RLHF o DPO en este ajuste (el alineamiento proviene del modelo base Instruct). El formato de inferencia es de un unico turno de usuario con la plantilla de chat del propio modelo, seguido de la instruccion "Classify the bank customer query into one intent. Answer with the intent name only." y la consulta; la respuesta esperada es el nombre de la intencion. No se describen tecnicas adicionales como decodificacion especulativa ni atencion lineal.

## Capacidades

- Clasificacion de intenciones bancarias en 77 clases del dataset Banking77, a partir de una consulta de cliente en ingles y con salida de texto con el nombre de la intencion.
- Generacion de texto conversacional (pipeline declarado text-generation) usando la plantilla de chat de Mistral Instruct v0.3.
- Respuesta de un solo turno orientada a etiqueta corta, no a respuestas largas ni a dialogo multi-turno.
- Capacidad multilingue: no disponible. El modelo se declara unicamente en ingles y no se ha evaluado en otros idiomas.
- Tool calling o function calling: no evaluado en este ajuste fino; no hay datos en la informacion disponible.
- Uso como agente o razonamiento multi-paso: no evaluado y no es el objetivo del ajuste.
- Vision y audio: no soportados (modelo solo texto).
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidad especial: el prompt esta disenado para devolver exclusivamente el nombre de la intencion, pero no se documenta ningun mecanismo que garantice que la salida pertenezca al conjunto de 77 etiquetas validas.

## Casos de uso

- Triaje automatico de tickets bancarios: el modelo clasifica cada consulta entrante en una de las 77 intenciones de Banking77, lo que permite enrutarla al equipo o al flujo de autoservicio correspondiente antes de que la lea un agente humano.
- Enrutamiento previo dentro de una arquitectura en cascada: usar este modelo de 7B como clasificador barato y local que decide si la consulta debe pasar a un LLM mayor mas caro, reduciendo coste por consulta en volumen alto.
- Despliegue on-premise con requisitos de residencia de datos: al ser un modelo de 7B con pesos abiertos y licencia Apache 2.0, puede ejecutarse en infraestructura propia de una entidad financiera sin enviar consultas de clientes a una API externa.
- Analitica de motivos de contacto: clasificar lotes historicos de consultas (por ejemplo transcripciones o correos) para construir dashboards de volumen por intencion y detectar picos de incidencias.
- Etiquetado asistido para anotacion: preetiquetar grandes volumenes de consultas antes de la revision humana, reduciendo el tiempo de anotacion en proyectos de ampliacion del dataset.
- Autoservicio conversacional: integrar la deteccion de intencion como primer paso de un chatbot bancario que, segun la etiqueta, invoca el flujo adecuado (bloqueo de tarjeta, disputa de cargos, cambio de direccion, etc.).
- Linea base academica y reproducibilidad: sirve como referencia reproducible de QLoRA con Unsloth sobre Banking77 para comparar tecnicas de ajuste eficiente o de cuantizacion en la misma tarea.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| Banking77 test accuracy | 0,9477 | 3.080 consultas de test; modelo base en NF4 mas adaptador LoRA, medido antes de fusionar y cuantizar |
| Banking77 test accuracy (checkpoint fusionado BF16 publicado) | no disponible | El autor indica que se mide por separado y no publica el valor |
| MMLU | no disponible | No reportado |
| HumanEval | no disponible | No reportado |
| GSM8K | no disponible | No reportado |

No se han publicado en la informacion disponible resultados de benchmarks adicionales ni comparaciones numericas con otros modelos sobre Banking77. El unico dato numerico verificable es la precision de 0,9477, y corresponde a una configuracion distinta de la que se distribuye en el repositorio (NF4 mas adaptador frente a BF16 fusionado).

## Requisitos de hardware

- Inferencia en BF16: los pesos ocupan aproximadamente 14,5 GB, por lo que se necesitan alrededor de 16-18 GB de VRAM contando cache KV y overhead. Estimacion basada en el tamano del repositorio.
- Inferencia en 4 bits (NF4 o GPTQ/AWQ de 4 bits, previa conversion): aproximadamente 4-5 GB de VRAM. Estimacion.
- Inferencia en GGUF Q4_K_M (previa conversion, no publicada): aproximadamente 4,4 GB en disco. Estimacion.
- GPU recomendadas para BF16: A100 40 GB, H100, L40S, A6000, RTX 3090 o RTX 4090 de 24 GB (cabe con margen ajustado si se limita el contexto).
- GPU para cuantizacion de 4 bits: RTX 3060 12 GB, RTX 4060 Ti 16 GB, T4 16 GB, RTX 4070, entre otras.
- Cabe en GPU de consumo: si, tanto en 4 bits en tarjetas de 8-12 GB como en BF16 en tarjetas de 24 GB.
- Opciones de despliegue: vLLM y transformers son las recomendadas por el autor; llama.cpp u Ollama son viables solo tras convertir los pesos a GGUF, conversion que no se distribuye en el repositorio. TGI tambien es compatible con el formato safetensors.
- Latencia y throughput: no disponibles. Como la salida esperada son unos pocos tokens (el nombre de la intencion), el coste estara dominado por el preprocesado del prompt, no por la generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jorbaty/banking77-mistral-7b-v0.3 | 7,25 mil millones | 32.768 tokens (heredado del base) | Clasificacion de 77 intenciones bancarias en ingles | apache-2.0 | safetensors BF16 en HuggingFace |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 mil millones | 32.768 tokens | Asistente generalista, generacion de texto e instrucciones | apache-2.0 | safetensors y otros formatos en HuggingFace |
| mistralai/Mistral-7B-v0.3 | 7,25 mil millones | 32.768 tokens | Modelo base sin ajuste de instrucciones | apache-2.0 | safetensors y otros formatos en HuggingFace |
| Clasificadores tipo BERT ajustados en Banking77 | no disponible | no disponible | Clasificacion de 77 intenciones bancarias | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre estos modelos en Banking77 en la informacion proporcionada. La comparacion con el modelo base es de tipo funcional, no de rendimiento: el base no esta especializado en clasificacion de intenciones y su rendimiento en esa tarea no se ha publicado aqui.

## Limitaciones y advertencias

- Idioma: el modelo se ha ajustado y evaluado unicamente en ingles sobre consultas bancarias en ingles. No hay evaluacion en castellano ni en ningun otro idioma, por lo que no se puede asumir su uso en mercados hispanohablantes sin un ajuste adicional.
- Sesgo de dominio: Banking77 es un dataset de banca al consumo en ingles con 77 intenciones predefinidas. Las consultas fuera de ese conjunto de etiquetas o de ese dominio pueden producir respuestas incorrectas o directamente inventadas.
- Riesgo de salida invalida: el prompt pide "answer with the intent name only", pero no hay ningun mecanismo que garantice que la respuesta pertenezca al conjunto cerrado de 77 etiquetas. En produccion es necesario validar la salida, normalizarla y definir un fallback.
- Discrepancia entre el resultado publicado y el artefacto distribuido: la precision de 0,9477 se midio con base NF4 mas adaptador antes de fusionar y cuantizar. El checkpoint BF16 fusionado del repositorio no tiene metrica publicada, por lo que no se debe asumir el mismo rendimiento al desplegarlo.
- Sobreajuste potencial: el ajuste es de 2 epocas sobre 10.003 ejemplos de un unico dataset, lo que aumenta el riesgo de sobreajuste al estilo y vocabulario concretos de Banking77.
- Validacion externa nula: 0 descargas y 0 likes, y el trabajo es una tesis de master no revisada por pares. No hay evaluacion independiente.
- Licencia del modelo: Apache 2.0, permite uso comercial sin restricciones anadidas por parte del autor del ajuste. El dataset Banking77 se distribuye bajo CC BY 4.0, lo que exige atribucion a sus autores (Casanueva et al., 2020) al reutilizarlo o al reportar resultados derivados.
- Formatos alternativos: no se publican cuantizaciones GGUF, AWQ ni GPTQ, lo que obliga a convertirlas antes de usar llama.cpp, Ollama o vLLM con cuantizacion de 4 bits.
- Otros caveats de produccion: no hay tests de robustez frente a entradas adversarias, ruido tipografico, abreviaturas ni errores ortograficos; no hay informacion sobre el numero de tokens de entrenamiento ni sobre tecnicas de regularizacion aplicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jorbaty/banking77-mistral-7b-v0.3
- Modelo base Mistral-7B-Instruct-v0.3: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Modelo Mistral-7B-v0.3: https://huggingface.co/mistralai/Mistral-7B-v0.3
- Documentacion de Mistral 7B v0.3: https://docs.mistral.ai/models/mistral-7b-0-3
- Anuncio de Mistral 7B: https://mistral.ai/news/announcing-mistral-7b/
- Guia de instalacion local de Mistral 7B (GitHub): https://github.com/thekester/mistrallocal
- Dataset Banking77: https://huggingface.co/datasets/PolyAI/banking77
- Referencia del dataset: Casanueva et al., 2020 (Banking77, licencia CC BY 4.0); URL del paper no disponible en la informacion proporcionada.
