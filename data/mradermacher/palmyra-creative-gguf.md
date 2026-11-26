# mradermacher/Palmyra-Creative-GGUF

## Resumen

Palmyra-Creative-GGUF es la distribucion en formato GGUF del modelo Palmyra-Creative, desarrollado originalmente por Writer y cuantizado por mradermacher. Se trata de un modelo de lenguaje de gran escala, con 121.892.970.560 parametros (aproximadamente 122 mil millones), orientado especificamente a tareas de creatividad, ideacion y pensamiento divergente y convergente. El modelo base esta disponible en el repositorio Writer/Palmyra-Creative y esta pensado para entornos empresariales ("Enterprise ready" segun sus etiquetas).

La relevancia de esta ficha radica en que el repositorio de mradermacher ofrece el modelo en multiples niveles de cuantizacion GGUF (desde Q2_K hasta Q8_0), lo que permite desplegarlo en infraestructuras con distintos presupuestos de memoria. El modelo base esta especializado en generacion de ideas, brainstorming, resolucion creativa de problemas y tecnicas como los "Five Whys", lo que lo diferencia de los modelos generalistas.

El modelo esta disponible unicamente en ingles, cuenta con licencia propietaria (writer-open-model-license) y su uso comercial requiere una licencia separada de Writer. La cuantizacion corre a cargo de mradermacher, quien no modifica los pesos mas alla del proceso de conversion a GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, dato no confirmado en la informacion proporcionada) |
| Parametros totales | 121.892.970.560 (aprox. 122 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (y variantes i1/imatrix en repositorio separado) |
| Idiomas soportados | en (ingles) |
| Licencia | writer-open-model-license (uso no comercial salvo licencia separada de Writer) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone en la informacion proporcionada de detalles sobre la arquitectura interna del modelo base (tipo de transformer, atencion, numero de capas, dimensiones ocultas) ni sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, tecnicas de alineacion como RLHF o DPO). El modelo base es Writer/Palmyra-Creative, y esta cuantizacion es una conversion estatica a GGUF realizada por mradermacher con la herramienta de conversion de Hugging Face (convert_type: hf), sin informacion adicional sobre innovaciones tecnicas.

Lo unico verificable es el proceso de cuantizacion: se ofrecen cuantizaciones estaticas (no imatrix) en este repositorio, mientras que las cuantizaciones ponderadas/imatrix estan en el repositorio mradermacher/Palmyra-Creative-i1-GGUF. El autor indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamano similar, y que Q4_K_S y Q4_K_M son rapidas y recomendadas.

## Capacidades

- Generacion de texto conversacional en ingles.
- Ideacion y generacion de ideas (Idea Generation, Ideation).
- Brainstorming estructurado y pensamiento lateral (Lateral Thinking).
- Pensamiento divergente y convergente (Divergent/Convergent Thinking).
- Resolucion creativa de problemas (Creative Problem Solving), incluidos problemas complejos o "wicked problems".
- Aplicacion de tecnicas como los "Five Whys" para analisis de causas raiz.
- Fomento de mentalidad innovadora y confianza creativa.
- Soporte de conversaciones multi-turno (etiqueta "conversational").
- Orientado a uso empresarial (Enterprise LLM, Enterprise ready).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.

## Casos de uso

- Sesiones de brainstorming asistido: el modelo puede generar listas amplias de ideas divergentes sobre un problema de negocio, y luego converger en las mas viables, gracias a su entrenamiento especifico en tecnicas de ideacion.
- Resolucion de problemas complejos ("wicked problems") en consultoria: se puede usar para descomponer problemas mal definidos en subproblemas y aplicar marcos como los Five Whys, adecuado por su especializacion en pensamiento critico y lateral.
- Generacion de contenido creativo para marketing: redaccion de eslóganes, nombres de producto y conceptos de campana, aprovechando su enfoque en imaginacion e innovacion.
- Apoyo a equipos de innovacion y diseno de producto: el modelo puede actuar como facilitador de talleres, proponiendo preguntas y alternativas que rompan el pensamiento convencional.
- Asistente de escritura creativa: generacion de tramas, personajes y giros narrativos en ingles, con un enfoque en la originalidad mas que en la factualidad.
- Analisis de causas raiz en operaciones: aplicar la tecnica de los Five Whys a incidentes o fallos de proceso, generando cadenas de preguntas que profundicen en la causa.
- Prototipado de chatbots especializados en creatividad: desplegado con llama.cpp u Ollama en formato GGUF, puede integrarse en herramientas internas de ideacion para equipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 45,2 GB con Q2_K; 69,5-73,3 GB con Q4_K_S/Q4_K_M; 100,1 GB con Q6_K; 129,6 GB con Q8_0. Estas cifras corresponden al tamano de los ficheros GGUF y son una cota inferior de memoria necesaria.
- GPU recomendadas: para Q4_K_M se necesitan al menos 80 GB de VRAM (por ejemplo, A100 80 GB o H100 80 GB); para Q8_0 se requieren varias GPU o una H200/B200 con 141 GB o mas.
- Cabe en GPU de consumo: no en una sola GPU consumer. Q2_K (45,2 GB) podria ejecutarse parcialmente en una RTX 4090 (24 GB) con offloading a CPU, pero con rendimiento muy degradado. En una RTX 3090/4090 no cabe completamente ninguna cuantizacion.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El modelo base (safetensors) puede servirse con vLLM o TGI, pero no se confirma en la informacion proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Palmyra-Creative (este) | ~122 B | no disponible | writer-open-model-license (no comercial sin licencia) | GGUF en HF, gate en modelo base |
| Modelos comparables de ~120 B | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente en la fuente proporcionada para establecer una comparativa rigurosa con alternativas de la misma categoria. Se indica "no disponible" en lugar de inventar datos.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; al ser un modelo entrenado principalmente en ingles, es probable que presente sesgos culturales anglosajones.
- Riesgo de alucinacion: no cuantificado; como modelo generativo orientado a creatividad, puede priorizar la originalidad sobre la veracidad factual.
- Limitaciones de contexto o idioma: el modelo solo declara soporte de ingles ("en"); no se especifica la longitud de contexto, lo que impide planificar casos de uso con documentos largos.
- Restricciones de licencia: la licencia writer-open-model-license restringe el uso a fines no comerciales salvo que se adquiera una licencia separada de Writer; el acceso al modelo base esta condicionado a un formulario (gated).
- Caveat para produccion: el repositorio es una cuantizacion de terceros (mradermacher), no el modelo oficial; para produccion se recomienda validar la calidad de la cuantizacion frente al modelo base en safetensors.
- El tamano del repositorio (828,9 GB) incluye todas las cuantizaciones; descargar solo el fichero necesario.
- No se confirma soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Palmyra-Creative-GGUF
- Modelo base: https://huggingface.co/Writer/Palmyra-Creative
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Palmyra-Creative-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Palmyra-Creative-GGUF
- Licencia: https://writer.com/legal/open-model-license/
- Politica de uso aceptable de Writer: https://writer.com/legal/acceptable-use/
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
