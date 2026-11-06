# arabkly/gpt-oss-20b

## Resumen

gpt-oss-20b es un modelo de lenguaje de pesos abiertos publicado por OpenAI dentro de la familia gpt-oss, disenada para razonamiento, tareas agenticas y casos de uso generales para desarrolladores. Frente a la variante grande (gpt-oss-120b, orientada a produccion en una unica GPU de 80 GB), el 20b apunta a baja latencia y despliegue local o especializado. El modelo tiene 20.914.757.184 parametros totales (aproximadamente 21B) con 3,6B parametros activos, lo que indica una arquitectura de mezcla de expertos (MoE) dispersa.

La relevancia de esta ficha concreta (arabkly/gpt-oss-20b) es que se trata de una publicacion derivada del modelo original de OpenAI, alojada por un tercero (arabkly) bajo la misma licencia Apache 2.0. No aporta pesos nuevos ni una model card propia: reproduce la model card oficial de `openai/gpt-oss-20b` y los pesos en formato safetensors. Conviene tratar el repositorio como un espejo del modelo oficial y verificar su integridad antes de usarlo en produccion.

El modelo se entreno con el formato de respuesta harmony de OpenAI y, segun la model card, solo funciona correctamente si se usa dicho formato. Incluye razonamiento configurable (low/medium/high), cadena de pensamiento completa accesible y cuantizacion MXFP4 de los pesos MoE, lo que permite ejecutarlo en torno a 16 GB de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), segun la model card oficial; detalles de capas no disponibles |
| Parametros totales | 20.914.757.184 (aproximadamente 21B) |
| Parametros activos | 3,6B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (cuantizacion post-entrenamiento de los pesos MoE); el repositorio incluye pesos en 8-bit y mxfp4 segun los tags |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); pesos originales descargables via `--include "original/*"` |

## Arquitectura y entrenamiento

La model card oficial describe gpt-oss-20b como un modelo de 21B parametros con 3,6B activos, lo que implica una arquitectura MoE dispersa: en cada paso de inferencia solo se activa una fraccion de los parametros, reduciendo el coste computacional frente a un modelo denso del mismo tamano. Los pesos MoE se sometieron a cuantizacion MXFP4 durante el post-entrenamiento, y todas las evaluaciones oficiales se realizaron con esa misma cuantizacion. Esto es relevante porque el rendimiento reportado corresponde a la version cuantizada, no a una version en precision completa.

El modelo se entreno con el formato de respuesta harmony, que estructura los turnos de conversacion, el razonamiento y las llamadas a herramientas. La model card advierte que debe usarse exclusivamente con ese formato, ya que de lo contrario no funciona correctamente. Se ofrece como fine-tuneable mediante ajuste de parametros. No se dispone en la informacion proporcionada de datos sobre numero de tokens de entrenamiento, composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y razonamiento en multiples pasos.
- Razonamiento configurable con tres niveles de esfuerzo (low, medium, high), ajustable segun latencia y caso de uso.
- Cadena de pensamiento completa accesible, pensada para depuracion y auditoria, no para mostrarse al usuario final.
- Capacidades agenticas nativas: function calling, navegacion web y ejecucion de codigo Python.
- Salidas estructuradas (Structured Outputs).
- Formato de respuesta harmony para estructurar turnos, razonamiento y herramientas.
- Fine-tuning completo de parametros.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales multi-turno: el modelo puede mantener dialogos estructurados mediante el formato harmony, que separa roles, razonamiento y respuestas, lo que facilita la gestion de estado en aplicaciones de chat.
- Agentes con herramientas: el soporte nativo de function calling y salidas estructuradas permite integrarlo en orquestadores de agentes que invocan APIs externas, bases de datos o servicios internos.
- Ejecucion de codigo en pipelines: la capacidad de ejecutar Python de forma nativa lo hace adecuado para tareas de analisis de datos o automatizacion donde el modelo genera y ejecuta codigo en un entorno controlado.
- Despliegue local con privacidad: con cuantizacion MXFP4 cabe en torno a 16 GB de memoria, lo que permite ejecutarlo en estaciones de trabajo o GPU de consumo sin enviar datos a la nube.
- Razonamiento con latencia ajustable: en aplicaciones interactivas se puede fijar el esfuerzo de razonamiento en low para respuestas rapidas y subirlo a high en tareas de analisis complejo, equilibrando coste y calidad.
- Fine-tuning especializado: al ser fine-tuneable y tener licencia Apache 2.0, se puede adaptar a dominios verticales (legal, sanitario, soporte tecnico) sin restricciones de copyleft.
- Depuracion y evaluacion de modelos: la cadena de pensamiento completa permite inspeccionar el razonamiento del modelo en tareas de investigacion y control de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16 GB con cuantizacion MXFP4, segun la model card oficial.
- GPU recomendadas: el modelo esta disenado para ejecutarse en hardware de consumo y estaciones de trabajo; la variante 120b se orienta a una unica GPU de 80 GB (H100, MI300X), pero para el 20b no se especifican modelos concretos en la informacion disponible.
- Cabe en GPU de consumo: si, gracias a la cuantizacion MXFP4 y al tamano de aproximadamente 16 GB.
- Opciones de despliegue: Transformers (pipeline y `transformers serve`), vLLM (version 0.10.1+gptoss con wheels especificos), Ollama (`ollama pull gpt-oss:20b`), LM Studio (`lms get openai/gpt-oss-20b`), PyTorch/Triton mediante implementaciones de referencia del repositorio oficial.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-20b (esta ficha) | 20,9B | 3,6B | no disponible | Apache 2.0 | Hugging Face, Ollama, LM Studio, vLLM |
| gpt-oss-120b | 117B | 5,1B | no disponible | Apache 2.0 | Hugging Face, vLLM, una GPU de 80 GB |
| Otros modelos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa disponible en la informacion proporcionada es con gpt-oss-120b, la variante grande de la misma familia. No se dispone de datos de benchmarks ni de especificaciones de modelos de terceros para una comparativa mas amplia.

## Limitaciones y advertencias

- Dependencia del formato harmony: el modelo no funciona correctamente si no se usa el formato de respuesta harmony; es imprescindible aplicarlo mediante el chat template o el paquete `openai-harmony`.
- Repositorio espejo de terceros: esta ficha corresponde a `arabkly/gpt-oss-20b`, no al repositorio oficial `openai/gpt-oss-20b`. No hay garantia de que los pesos sean identicos a los originales; conviene verificar hashes y procedencia antes de usarlo en produccion.
- Cadena de pensamiento no apta para usuarios finales: la model card advierte explicitamente que el razonamiento completo no debe mostrarse a los usuarios finales.
- Riesgo de alucinacion: no se documentan tasas de alucinacion en la informacion disponible; como en cualquier modelo generativo, es esperable y debe mitigarse con verificacion externa.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada.
- Idiomas: no se especifican los idiomas soportados, por lo que el rendimiento multilingue es incierto.
- Licencia: Apache 2.0 permite uso comercial sin restricciones de copyleft ni riesgo de patentes segun la model card, pero la responsabilidad sobre el uso recae en el integrador.
- Contexto: la longitud de contexto no esta disponible, lo que limita la planificacion de aplicaciones con documentos largos.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/arabkly/gpt-oss-20b
- Repositorio oficial del modelo: https://huggingface.co/openai/gpt-oss-20b
- Coleccion oficial gpt-oss: https://huggingface.co/collections/openai/gpt-oss-68911959590a1634ba11c7a4
- Model card / paper: https://arxiv.org/abs/2508.10925
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Web oficial: https://gpt-oss.com
- Guias (cookbook): https://cookbook.openai.com/topic/gpt-oss
- Repositorio GitHub: https://github.com/openai/gpt-oss
- Formato harmony: https://github.com/openai/harmony
- Lista de recursos: https://github.com/openai/gpt-oss/blob/main/awesome-gpt-oss.md
- Ollama: https://ollama.com/download
- LM Studio: https://lmstudio.ai/
