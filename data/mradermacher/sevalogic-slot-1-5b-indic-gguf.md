# mradermacher/sevalogic-slot-1.5b-indic-GGUF

## Resumen

`mradermacher/sevalogic-slot-1.5b-indic-GGUF` es una coleccion de cuantizaciones GGUF del modelo `harshcasper/sevalogic-slot-1.5b-indic`, un modelo de lenguaje conversacional de aproximadamente 1.540 millones de parametros (1.543.714.304 en safetensors) afinado mediante LoRA sobre un modelo base de la familia Qwen2.5-1.5B. El autor original, harshcasper, lo orienta a tareas de "slot filling" y logica de servicio publico en lenguas vernaculas del este de la India, con soporte declarado para bengali (bn), hindi (hi), santali (sat) y ingles (en). El empaquetado GGUF corre a cargo de mradermacher, conocido por publicar versiones cuantizadas de modelos abiertos para su uso en llama.cpp y entornos de inferencia local.

El modelo resuelve un nicho concreto: la extraccion estructurada de informacion (slots) en conversaciones multilingues de bajo recursos, un caso de uso frecuente en sistemas de atencion ciudadana, formularios administrativos y asistentes de servicios publicos en la India. Su tamano reducido lo hace viable en hardware de consumo, lo que facilita el despliegue en entornos con recursos limitados o sin conectividad a la nube.

La relevancia actual del artefacto GGUF reside en que permite ejecutar el modelo en CPU o GPU modesta mediante llama.cpp, Ollama o bindings similares, sin necesidad de infraestructura de servidor. El repositorio incluye 12 cuantizaciones estaticas (de Q2_K a f16) con tamanos entre 0,8 GB y 3,2 GB, lo que cubre un amplio espectro de compromisos entre calidad y huella de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-1.5B, segun tags del modelo base) |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | bn (bengali), hi (hindi), sat (santali), en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es `harshcasper/sevalogic-slot-1.5b-indic`, un fine-tuning con LoRA (adaptador) sobre un transformer decoder-only de 1,5 B de parametros. Los tags del repositorio apuntan a la familia Qwen2.5-1.5B como arquitectura subyacente, aunque la model card no lo confirma de forma explicita; el dato de parametros (1.543.714.304) es coherente con esa familia. El entrenamiento se realizo sobre el dataset `harshcasper/sevalogic-east-vernacular-15k`, un conjunto de 15.000 ejemplos orientado a lenguas vernaculas del este de la India.

No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset, la presencia de fases de RLHF/DPO o innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card del repositorio GGUF es puramente un empaquetado de cuantizaciones estaticas generadas con llama.cpp (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`); no incluye detalles del proceso de entrenamiento original. No se han publicado cuantizaciones ponderadas/imatrix por parte de mradermacher en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en bengali, hindi, santali e ingles.
- Extraccion estructurada de informacion tipo slot filling, orientada a formularios y dialogos de servicio publico.
- Razonamiento basico y respuesta a instrucciones en los cuatro idiomas declarados.
- Soporte de conversaciones multi-turno (tag `conversational`).
- Capacidad multilingue limitada a los idiomas del dataset de entrenamiento; no se declara cobertura de otras lenguas indias.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- No se documenta capacidad de codigo ni matematicas mas alla de lo que herede del modelo base.

## Casos de uso

- Extraccion de slots en formularios administrativos: el modelo puede recibir un turno de usuario en hindi o bengali y devolver los campos estructurados (nombre, direccion, identificador) que un backend necesita para tramitar una solicitud, aprovechando su entrenamiento especifico en slot filling.
- Atencion ciudadana en lenguas vernaculas: despliegue en un chatbot de oficina de servicios publicos que atienda consultas en bengali, hindi o santali y derive a un humano cuando la confianza sea baja, gracias a su tamano reducido que permite ejecucion local.
- Normalizacion de texto multilingue: convertir transcripciones o mensajes informales en hindi/bengali a un formato canonico antes de pasarlos a un sistema downstream, usando el modelo como preprocesador ligero.
- Clasificacion y enrutado de intenciones: en un pipeline de atencion al cliente, usar el modelo para etiquetar la intencion de un mensaje en uno de los cuatro idiomas soportados y enrutarlo al departamento correspondiente.
- Despliegue en entornos sin conectividad: al estar disponible en GGUF con cuantizaciones desde 0,8 GB, puede ejecutarse en un portatil o en un dispositivo edge para asistentes de campo en zonas rurales con conectividad intermitente.
- Prototipado rapido de asistentes regionales: investigadores que necesiten un baseline multilingue para lenguas del este de la India pueden usar la cuantizacion Q4_K_M (1,1 GB) en una GPU de consumo para iterar sobre prompts y evaluar calidad antes de invertir en modelos mayores.
- Filtrado y anonimizacion de datos: usar el modelo para identificar y extraer entidades en textos bengali/hindi antes de almacenarlos, reduciendo la exposicion de datos personales en logs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): aproximadamente 0,8 GB (Q2_K) a 3,2 GB (f16). Con overhead de contexto y cache KV, anadir entre 0,5 y 2 GB segun longitud de contexto y batch.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas para este modelo y permitiran lotes grandes o contexto extendido.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna con 4 GB o mas; tambien en CPU pura con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, bindings de Python (llama-cpp-python), servidores compatibles con la API de OpenAI mediante llama.cpp server. vLLM y TGI no soportan GGUF de forma nativa generalizada; para esos servidores habria que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por tamano, en una GPU de consumo se espera un throughput alto (decenas a cientos de tokens por segundo), pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| sevalogic-slot-1.5b-indic (este) | ~1,54 B | no disponible | bn, hi, sat, en | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-1.5B-Instruct | ~1,54 B | 32.768 tokens (segun documentacion publica de Qwen) | multilingue amplio | Apache 2.0 | safetensors, GGUF |
| Gemma 2 2B Instruct | ~2,6 B | 8.192 tokens (segun documentacion publica de Google) | multilingue | Gemma Terms of Use | safetensors, GGUF |
| Llama 3.2 1B Instruct | ~1,24 B | 128.000 tokens (segun documentacion publica de Meta) | multilingue (8 idiomas oficiales) | Llama 3.2 Community License | safetensors, GGUF |

Nota: los datos de contexto y licencia de los modelos comparables provienen de su documentacion publica; no se dispone de benchmarks comparativos del modelo evaluado. La ventaja diferencial de sevalogic-slot-1.5b-indic es su especializacion en slot filling para lenguas vernaculas del este de la India (incluido santali), nicho que los modelos generalistas no cubren de forma explicita.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre un dataset de 15.000 ejemplos de servicio publico, puede heredar sesgos de representacion de las regiones cubiertas.
- Riesgo de alucinacion: presente como en cualquier modelo de 1,5 B; en tareas de extraccion de slots conviene validar la salida contra un esquema estricto y no confiar en campos generados sin verificar.
- Limitaciones de contexto e idioma: la longitud de contexto no esta documentada; el soporte se limita a bn, hi, sat y en, sin cobertura declarada de otras lenguas indias ni de castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y el dataset de entrenamiento pueden tener sus propias condiciones; conviene revisar la licencia de `harshcasper/sevalogic-slot-1.5b-indic` y del dataset `harshcasper/sevalogic-east-vernacular-15k` antes de un despliegue comercial.
- Caveat de produccion: las cuantizaciones Q2_K y Q3 degradan la calidad de forma notable (el propio autor marca Q3_K_M como "lower quality"); para produccion se recomienda Q4_K_M o superior.
- El repositorio GGUF no incluye cuantizaciones ponderadas/imatrix, que suelen ofrecer mejor calidad por bit en tamanos bajos.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay evidencia de comunidad ni validacion externa.
- No se documenta pipeline de inferencia ni plantilla de chat; es necesario consultar la model card del modelo base para el formato de prompt correcto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/sevalogic-slot-1.5b-indic-GGUF
- Modelo base: https://huggingface.co/harshcasper/sevalogic-slot-1.5b-indic
- Dataset de entrenamiento: https://huggingface.co/datasets/harshcasper/sevalogic-east-vernacular-15k
- Pagina de descargas del autor: https://hf.tst.eu/model#sevalogic-slot-1.5b-indic-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
