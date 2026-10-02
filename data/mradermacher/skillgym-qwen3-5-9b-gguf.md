# mradermacher/SkillGym-Qwen3.5-9B-GGUF

## Resumen

SkillGym-Qwen3.5-9B-GGUF es la version cuantizada en formato GGUF del modelo SkillGym-Qwen3.5-9B, un ajuste fino por supervisión (SFT) sobre Qwen3.5-9B desarrollado por reasonwang y cuantizado por mradermacher. El modelo esta especializado en habilidades de agente: uso de herramientas (tool calling), razonamiento multi-paso y ejecucion de tareas estructuradas, segun indican sus etiquetas (agent, tool-use, skills, sft). El fine-tune se entreno sobre el dataset reasonwang/skillgym-sft y esta pensado para integrarse en flujos de trabajo automatizados donde el modelo debe decidir que herramienta invocar y en que orden.

Tecnicamente es un modelo denso de 8.953.803.264 parametros (aproximadamente 8,95 mil millones), derivado de la familia Qwen3.5 de Alibaba, que segun la documentacion publica de Qwen3.5-9B soporta una longitud de contexto nativa de 262.144 tokens y adopta un enfoque multimodal nativo. El repositorio incluye pesos en 12 niveles de cuantizacion distintos mas dos ficheros mmproj (complemento multimodal), lo que sugiere soporte de entrada visual heredado del modelo base, aunque este extremo no se confirma en la model card del cuantizador.

La relevancia de esta ficha es practica: se trata de una distribucion lista para ejecucion local (llama.cpp, Ollama y derivados) de un modelo de 9B orientado a agentes, con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El repositorio acumulaba 106 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicacion reciente y de baja adopucion todavia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5); detalles internos no disponibles |
| Parametros totales | 8.953.803.264 (aprox. 8,95B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens segun la ficha de Qwen3.5-9B base; no confirmado especificamente para este fine-tune |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en transformers/safetensors) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, un transformer denso de 9B parametros de la familia Qwen3.5 de Alibaba. Segun el blog oficial de Qwen3.5, la serie introduce avances en aprendizaje multimodal, eficiencia arquitectonica y escala de aprendizaje por refuerzo; la variante de 9B se posiciona como un modelo denso con contexto nativo de 262.144 tokens. No se dispone de informacion detallada sobre el numero de capas, dimensiones de atencion ni el tipo exacto de atencion (estandar, lineal o hibrida) en la informacion proporcionada.

El ajuste fino se realizo mediante SFT (supervised fine-tuning) sobre el dataset reasonwang/skillgym-sft, orientado a habilidades de agente y uso de herramientas. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases adicionales de RLHF o DPO. El cuantizador indica que se trata de cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) y senala que las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat multi-turno (etiqueta conversational).
- Uso de herramientas y function calling: el modelo esta ajustado especificamente para invocar herramientas externas, segun las etiquetas agent y tool-use.
- Ejecucion de habilidades estructuradas (skills): el dataset de entrenamiento (skillgym-sft) sugiere entrenamiento en secuencias de tareas y resolucion de problemas por pasos.
- Razonamiento multi-paso y comportamiento agentico: capacidad de encadenar acciones y mantener estado a lo largo de una tarea.
- Soporte multimodal potencial: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que apunta a entrada de imagenes heredada de Qwen3.5; no se confirma en la model card.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada.

## Casos de uso

- Agentes de automatizacion de tareas: el modelo puede recibir un objetivo en lenguaje natural, planificarlo en pasos y emitir llamadas a herramientas (APIs, busqueda, ejecucion de comandos) de forma secuencial, aprovechando su entrenamiento especifico en tool-use.
- Asistentes de soporte tecnico con acceso a sistemas: integrado con herramientas internas (consulta de tickets, estado de servicios, bases de conocimiento), el modelo puede resolver incidencias multi-paso sin intervencion humana.
- Orquestacion de pipelines de datos: dado un esquema de datos y un objetivo, el modelo puede invocar transformaciones sucesivas mediante function calling y verificar resultados intermedios.
- Automatizacion de navegacion y extraccion web: combinado con herramientas de scraping o navegador, puede planificar rutas de extraccion y consolidar informacion de varias fuentes.
- Generacion de scripts operativos con verificacion: el modelo puede producir codigo y despues invocar un interprete como herramienta para validar la ejecucion, cerrando el ciclo de autocorreccion.
- Backend de agentes en entornos con recursos limitados: al disponer de cuantizaciones desde 3,9 GB (Q2_K), puede desplegarse en una sola GPU de gama media o incluso en CPU, lo que permite ejecutar el agente en local sin depender de APIs externas.
- Procesamiento de documentos con entrada visual (si se confirma el soporte multimodal): los ficheros mmproj permiten adjuntar imagenes a la conversacion para tareas de descripcion o extraccion de informacion.
- Evaluacion de habilidades agenticas en investigacion: util como modelo de referencia para comparar tecnicas de SFT en tool-use dentro del rango de 9B parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye metricas, y la documentacion del modelo base Qwen3.5-9B disponible en la busqueda web no proporciona cifras numericas concretas para esta variante.

## Requisitos de hardware

- VRAM para inferencia segun cuantizacion (solo pesos): Q2_K 3,9 GB; Q3_K_S 4,4 GB; Q3_K_M 4,7 GB; Q3_K_L 5,0 GB; IQ4_XS 5,3 GB; Q4_K_S 5,5 GB; Q4_K_M 5,7 GB; Q5_K_S 6,4 GB; Q5_K_M 6,6 GB; Q6_K 7,5 GB; Q8_0 9,6 GB; f16 18,0 GB.
- Ficheros multimodales: mmproj-Q8_0 0,7 GB y mmproj-f16 1,0 GB, que se suman al peso del modelo cuando se usa entrada visual.
- GPU de consumo: Q4_K_M (5,7 GB) cabe en tarjetas de 8 GB como la RTX 3060 Ti o RTX 4060; Q8_0 (9,6 GB) cabe en 12 GB (RTX 3060 12 GB) o 16 GB; f16 (18 GB) requiere 24 GB (RTX 3090, RTX 4090) o mas.
- GPU profesionales: A100, H100 o L40S para despliegues concurrentes o para contexto muy largo, donde el cache KV pasa a dominar el consumo de memoria.
- Advertencia sobre contexto: los 262.144 tokens del modelo base implican un cache KV muy grande; usar la ventana completa exige bastante mas VRAM que el peso de los parametros, y en tarjetas de consumo conviene reducir la longitud efectiva de contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y otros runners compatibles con GGUF; para servir concurrentemente con buen throughput, vLLM o TGI usando los pesos originales en safetensors en lugar del GGUF.
- Latencia y throughput: no disponibles; dependeran del hardware, del nivel de cuantizacion y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| mradermacher/SkillGym-Qwen3.5-9B-GGUF | 8,95B denso | 262.144 tokens (base) | GGUF | Apache 2.0 | Este modelo; 12 cuantizaciones |
| reasonwang/SkillGym-Qwen3.5-9B | 8,95B denso | No disponible | safetensors (transformers) | Apache 2.0 | Modelo original sin cuantizar |
| mradermacher/SkillGym-Qwen3.5-4B-GGUF | 4B (aprox.) | No disponible | GGUF | Apache 2.0 | Variante menor de la misma familia de fine-tunes |
| Qwen3.5-9B (base) | 9B denso | 262.144 tokens | safetensors / GGUF | Apache 2.0 | Modelo base sin ajuste agentico |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo declara unicamente ingles ("en"); el rendimiento en castellano no esta garantizado y probablemente sea degradado.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar nombres de herramientas, argumentos o resultados de invocaciones; en flujos agenticos conviene validar cada llamada antes de ejecutarla.
- Cuantizaciones agresivas: Q2_K y Q3_K_S reducen el tamano a costa de calidad; el propio cuantizador marca Q3_K_M como "lower quality" y recomienda Q4_K_S o Q4_K_M para un equilibrio entre velocidad y fidelidad.
- Ausencia de benchmarks: no hay cifras publicadas de MMLU, HumanEval, GSM8K ni de evaluaciones agenticas, por lo que la calidad real del ajuste SFT no puede verificarse con la informacion disponible.
- Base de adopcion baja: 106 descargas y 0 likes, sin issues ni validacion externa documentada.
- Datos de contexto no confirmados para el fine-tune: los 262.144 tokens provienen de la ficha del modelo base Qwen3.5-9B, no de una confirmacion explicita para SkillGym-Qwen3.5-9B.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene revisar las condiciones del modelo base y del dataset de entrenamiento por si imponen requisitos adicionales de atribucion.
- Produccion: al ser un modelo de 9B, la fiabilidad en tareas agenticas complejas sera inferior a la de modelos mucho mayores; se recomienda supervision humana o validacion automatica de acciones criticas.
- Soporte multimodal incierto: la presencia de mmproj apunta a capacidad de vision, pero no esta documentada ni validada en esta ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/SkillGym-Qwen3.5-9B-GGUF
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#SkillGym-Qwen3.5-9B-GGUF
- Modelo base sin cuantizar: https://huggingface.co/reasonwang/SkillGym-Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/reasonwang/skillgym-sft
- Variante de 4B cuantizada: https://huggingface.co/mradermacher/SkillGym-Qwen3.5-4B-GGUF
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Ficha de Qwen3.5-9B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-9b
- Guia de ejecucion local con llama.cpp: https://jenyckee.github.io/posts/qwen-pi-local-llm/
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
