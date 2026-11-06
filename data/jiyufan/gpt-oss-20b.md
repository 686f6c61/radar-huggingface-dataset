# jiyufan/gpt-oss-20b

## Resumen

gpt-oss-20b es un modelo de lenguaje de pesos abiertos publicado por OpenAI dentro de la familia gpt-oss, disenada para razonamiento, tareas agenticas y uso general por parte de desarrolladores. Esta ficha corresponde a la copia alojada por el usuario `jiyufan` en Hugging Face, que replica los pesos del modelo original `openai/gpt-oss-20b` bajo licencia Apache 2.0. El modelo emplea una arquitectura transformer con mezcla de expertos (MoE), con 20.914.757.184 parametros totales y aproximadamente 3.600 millones de parametros activos por token, lo que permite una inferencia de baja latencia en hardware de consumo.

La propuesta principal del modelo es ofrecer capacidades de razonamiento de nivel produccion en un formato que cabe en menos de 16 GB de memoria gracias a la cuantizacion MXFP4 aplicada durante el post-entrenamiento. Incluye un modo de razonamiento configurable (bajo, medio, alto), acceso completo a la cadena de pensamiento y soporte nativo para el formato de respuesta harmony, obligatorio para su correcto funcionamiento. Ademas incorpora capacidades agenticas como function calling, navegacion web y ejecucion de codigo Python.

Es relevante ahora porque representa uno de los primeros lanzamientos de pesos abiertos de OpenAI con licencia permisiva, lo que facilita su experimentacion, ajuste fino y despliegue comercial sin restricciones de copyleft. El modelo se distribuye en formato safetensors y es compatible con transformers, vLLM, Ollama, LM Studio y otras herramientas del ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) |
| Parametros totales | 20.914.757.184 (aproximadamente 21B) |
| Parametros activos | Aproximadamente 3.6B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (aplicada en post-entrenamiento); pesos en 8-bit segun tags del repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

gpt-oss-20b es un transformer con mezcla de expertos (MoE) de aproximadamente 21.000 millones de parametros totales, de los cuales unos 3.600 millones se activan por token. Esta configuracion reduce el coste computacional por token frente a un modelo denso del mismo tamano, manteniendo una capacidad de representacion elevada. Los pesos de los expertos fueron cuantizados a MXFP4 durante el post-entrenamiento, y todas las evaluaciones publicadas se realizaron con esa misma cuantizacion, lo que garantiza coherencia entre el rendimiento reportado y el comportamiento del modelo distribuido.

El modelo fue entrenado para operar exclusivamente con el formato de respuesta harmony, un esquema estructurado de mensajes que separa roles, canales de razonamiento y contenido final. El entrenamiento incluye ajuste por instrucciones y tecnicas de razonamiento con esfuerzo configurable (bajo, medio, alto), lo que permite al usuario equilibrar latencia y calidad de respuesta. No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento, la composicion del dataset ni del detalle de las fases de RLHF o DPO aplicadas. La cadena de pensamiento es completamente accesible, lo que facilita la depuracion y la auditoria del razonamiento del modelo.

## Capacidades

- Generacion de texto conversacional y de proposito general con soporte multi-turno.
- Razonamiento con esfuerzo configurable (low, medium, high), ajustable segun los requisitos de latencia y precision.
- Cadena de pensamiento completa y accesible, pensada para depuracion y no para mostrarse al usuario final.
- Function calling y tool calling nativos, integrables en flujos agenticos.
- Navegacion web integrada mediante el formato harmony y las herramientas oficiales del repositorio gpt-oss.
- Ejecucion de codigo Python como herramienta dentro de flujos agenticos.
- Salidas estructuradas (Structured Outputs) para integracion con APIs y pipelines.
- Capacidad de ajuste fino de parametros para especializacion en dominios concretos.
- Soporte multilingue: no disponible en la informacion proporcionada.
- Vision y audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con function calling para consultar sistemas internos (estado de pedidos, incidencias) y generar respuestas coherentes con el contexto de la sesion, con latencia baja gracias a sus 3.6B parametros activos.
- Generacion de codigo en produccion: su soporte de tool calling y ejecucion de Python permite integrarlo en pipelines de CI/CD para autocompletar, revisar o generar pruebas, asi como para tareas de refactorizacion asistida.
- Agentes autonomos de investigacion: combinando navegacion web y razonamiento de alto esfuerzo, el modelo puede planificar busquedas, sintetizar fuentes y producir informes estructurados en varios pasos.
- Asistentes locales en hardware de consumo: al caber en menos de 16 GB de memoria con MXFP4, es viable desplegarlo en estaciones de trabajo con GPU consumer para prototipado y uso personal sin depender de la nube.
- Extraccion de datos estructurados: mediante Structured Outputs puede convertir texto libre (correos, contratos, tickets) en JSON validado para alimentar bases de datos o sistemas de gestion.
- Automatizacion de soporte interno en empresas: desplegado con vLLM como servidor compatible con la API de OpenAI, puede servir como backend de asistentes internos para consultas sobre documentacion tecnica y procedimientos.
- Educacion y tutoria: el acceso a la cadena de pensamiento permite construir herramientas que expliquen el razonamiento paso a paso, util para entornos de aprendizaje supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 16 GB con cuantizacion MXFP4, segun la model card oficial.
- GPU recomendadas para produccion: NVIDIA H100 o AMD MI300X para el modelo hermano de 120B; para el 20B basta con una GPU de 16-24 GB.
- Cabe en GPU consumer: si, en tarjetas con 16 GB o mas de VRAM (por ejemplo, RTX 4080, RTX 4090, RTX 5080/5090) gracias a la cuantizacion MXFP4.
- Opciones de despliegue: transformers (pipeline y transformers serve), vLLM (version 0.10.1+gptoss con wheels especificos), Ollama (`ollama pull gpt-oss:20b`), LM Studio (`lms get openai/gpt-oss-20b`), y las implementaciones de referencia en PyTorch/Triton del repositorio oficial.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen del hardware y del esfuerzo de razonamiento configurado.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gpt-oss-20b | ~21B | ~3.6B | no disponible | Apache 2.0 | Hugging Face (openai y mirrors) |
| gpt-oss-120b | ~117B | ~5.1B | no disponible | Apache 2.0 | Hugging Face (openai) |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con el modelo hermano de la misma familia. No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer comparaciones cuantitativas con modelos de otros desarrolladores.

## Limitaciones y advertencias

- El modelo solo funciona correctamente con el formato de respuesta harmony; usarlo con otros formatos de chat produce resultados incorrectos.
- La cadena de pensamiento no debe mostrarse al usuario final; esta pensada para depuracion y auditoria.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado tasas especificas en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no especificados; conviene validar el rendimiento en castellano antes de un despliegue en produccion.
- Longitud de contexto: no disponible; planificar los casos de uso con contexto largo requiere verificacion empirica.
- Licencia Apache 2.0: permisiva para uso comercial, sin restricciones de copyleft ni riesgo de patentes segun la model card.
- Esta ficha corresponde a un mirror alojado por el usuario `jiyufan`; para produccion se recomienda descargar los pesos del repositorio oficial `openai/gpt-oss-20b` y verificar la integridad.
- El rendimiento reportado por OpenAI se obtuvo con cuantizacion MXFP4; otras cuantizaciones pueden alterar los resultados.

## Enlaces

- Repositorio Hugging Face de esta copia: https://huggingface.co/jiyufan/gpt-oss-20b
- Repositorio oficial del modelo: https://huggingface.co/openai/gpt-oss-20b
- Coleccion oficial gpt-oss: https://huggingface.co/collections/openai/gpt-oss-68911959590a1634ba11c7a4
- Model card / paper: https://arxiv.org/abs/2508.10925
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Sitio oficial: https://gpt-oss.com
- Guias (cookbook): https://cookbook.openai.com/topic/gpt-oss
- Repositorio GitHub: https://github.com/openai/gpt-oss
- Formato harmony: https://github.com/openai/harmony
- Lista de recursos de la comunidad: https://github.com/openai/gpt-oss/blob/main/awesome-gpt-oss.md
- Ollama: https://ollama.com/download
- LM Studio: https://lmstudio.ai/
