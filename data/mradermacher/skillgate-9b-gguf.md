# mradermacher/SkillGate-9B-GGUF

## Resumen

SkillGate-9B es un modelo de lenguaje de 9.197.093.888 parametros (aproximadamente 9,2 mil millones) afinado especificamente para tareas de seleccion de habilidades (skill selection), uso de herramientas (tool use) y comportamiento agentico. El modelo original fue desarrollado por simonlqy y esta construido sobre la arquitectura de la familia Qwen 3.5, segun se desprende del enlace de licencia incluido en la model card. La version aqui descrita es una cuantizacion GGUF realizada por mradermacher, un conocido publicador de cuantizaciones para la comunidad de inferencia local.

El modelo se entrena mediante aprendizaje por refuerzo, concretamente con GRPO (Group Relative Policy Optimization), una tecnica que optimiza la politica del modelo frente a recompensas verificables sin necesidad de un modelo critico separado. Este enfoque lo orienta a decidir que habilidad o herramienta invocar en cada paso de una tarea, lo que lo hace relevante para pipelines de agentes donde la seleccion correcta de herramientas condiciona el exito de la tarea completa.

La relevancia actual del modelo radica en su enfoque especializado: en lugar de competir en conocimiento general, se centra en el enrutamiento de habilidades dentro de sistemas multi-herramienta. El repositorio GGUF incluye ademas ficheros mmproj, lo que sugiere capacidades multimodales en el modelo base. La licencia es la de Qwen, lo que impone condiciones especificas para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, segun license_link); no se detalla en la model card |
| Parametros totales | 9.197.093.888 (~9,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | ingles (en) |
| Licencia | qwen (license: other, con license_link a Qwen/Qwen3.5-9B) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna mas alla de la referencia a Qwen 3.5 en el enlace de licencia. Por el numero de parametros y la nomenclatura, se trata de un transformer denso de aproximadamente 9,2 mil millones de parametros. El pipeline declarado es reinforcement-learning y las etiquetas incluyen GRPO, lo que indica que el ajuste se realizo mediante aprendizaje por refuerzo con optimizacion de politica relativa a grupos, orientado a tareas de seleccion de habilidades y uso de herramientas.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases adicionales de SFT o DPO. La presencia de ficheros mmproj en el repositorio GGUF sugiere que el modelo base incorpora un proyector multimodal, aunque la model card no describe las capacidades de vision de forma explicita. Las cuantizaciones son estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf); existe ademas una variante con cuantizaciones ponderadas e imatrix en el repositorio SkillGate-9B-i1-GGUF.

## Capacidades

- Seleccion de habilidades y herramientas: el modelo esta entrenado para decidir que skill o tool invocar en cada paso de una tarea agentica.
- Tool calling y function calling: orientado a la integracion con APIs y entornos de ejecucion de herramientas.
- Razonamiento multi-paso: disenado para flujos de agente con varias etapas de decision.
- Comportamiento agentico: etiquetado explicitamente como agent en el repositorio.
- Capacidades multimodales: los ficheros mmproj incluidos sugieren soporte de entrada visual, aunque no se detalla en la model card.
- Generacion de texto conversacional: el tag conversational indica uso en dialogos multi-turno.
- Idiomas: soporte declarado unicamente de ingles.

## Casos de uso

- Enrutamiento de herramientas en agentes: el modelo recibe la descripcion de las herramientas disponibles y la tarea del usuario, y selecciona la habilidad adecuada; su entrenamiento con GRPO sobre seleccion de skills lo hace idoneo para esta funcion de gatekeeper dentro de un orquestador.
- Automatizacion de soporte tecnico: puede decidir si la consulta requiere busqueda en base de conocimiento, consulta a API de estado o escalado a humano, reduciendo la carga de un modelo mayor en cada paso.
- Pipelines de CI/CD con agentes: integrado como selector de acciones (ejecutar tests, desplegar, consultar logs) dentro de un agente de operaciones, con tool calling como interfaz.
- Asistentes de desarrollo: seleccion de la herramienta correcta (lectura de ficheros, ejecucion de comandos, busqueda en repositorio) en entornos tipo IDE o terminal.
- Sistemas RAG con multiples fuentes: eleccion de la fuente de recuperacion o del indice adecuado segun la consulta, antes de invocar un modelo generador de mayor tamano.
- Despliegue en local con Ollama o llama.cpp: al estar en GGUF y ocupar entre 4 y 10 GB segun cuantizacion, permite prototipar agentes en estaciones de trabajo sin GPU de datacenter.
- Evaluacion de politicas de refuerzo: util como referencia para investigacion en GRPO aplicado a seleccion de acciones discretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 4 y 6 GB con Q2_K a Q4_K_M; entre 7 y 8 GB con Q6_K; en torno a 10 GB con Q8_0; aproximadamente 18,5 GB con f16. Los ficheros mmproj anaden 0,7 a 1,0 GB si se usa la via multimodal.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 para cuantizaciones altas; A100 o H100 para despliegues concurrentes en f16.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas usando Q4_K_M o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, aunque no se confirma compatibilidad explicita en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| SkillGate-9B (esta ficha) | ~9,2 B | no disponible | Seleccion de skills y tool use con GRPO | qwen | GGUF, safetensors |
| Qwen 3.5 9B (base referenciada) | ~9 B | no disponible | Modelo generalista | qwen | safetensors |
| Alternativas de 7-9 B para agentes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta verificado.
- Especializacion estrecha: el ajuste con GRPO para seleccion de skills puede degradar el rendimiento en generacion generalista frente al modelo base.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad; en tareas de seleccion de herramientas, una eleccion erronea puede propagarse a todo el pipeline del agente.
- Sesgos: no se documentan analisis de sesgo en la model card.
- Contexto: la longitud de contexto no esta publicada, lo que impide planificar tareas de contexto largo con garantias.
- Licencia: la licencia qwen impone condiciones de uso comercial que deben revisarse en el enlace a la licencia de Qwen 3.5 9B antes de desplegar en produccion.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M degradan la calidad; para produccion se recomienda Q4_K_M o superior.
- Modelo cuantizado por terceros: la cuantizacion la realiza mradermacher, no el autor original; los resultados pueden diferir de los pesos en safetensors.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/SkillGate-9B-GGUF
- Modelo base: https://huggingface.co/simonlqy/SkillGate-9B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/SkillGate-9B-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#SkillGate-9B-GGUF
- Licencia Qwen 3.5 9B: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
