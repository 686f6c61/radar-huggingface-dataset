# NGARiAI/ngari-tool

## Resumen

NGARi Tool es un modelo de 1.500 millones de parametros especializado en function calling y tool use, desarrollado por NGARiAI como parte de su pipeline de "IA soberana" orientada a dispositivos edge. Se construye sobre Qwen2.5-1.5B-Instruct (Apache 2.0) mediante un adaptador LoRA de rango 32 y alpha 64 aplicado sobre todas las proyecciones lineales, y se distribuye tanto como modelo fusionado en safetensors como en formato GGUF (q4_K_M y f16) para su uso con Ollama y llama.cpp.

El modelo resuelve un problema concreto: los modelos pequenos fallan con frecuencia en la sintaxis rigida que exige el function calling (nombres de herramienta, estructura JSON, validacion de parametros). NGARi aborda esto con un pipeline profesor-alumno en el que un modelo mayor genera escenarios sinteticos de tool calling perfectamente estructurados y el modelo de 1.5B se ajusta sobre ellos. El autor reporta una tasa del 100% en deteccion de herramienta, acierto de nombre y validez de parametros sobre una evaluacion propia de 20 ejemplos.

Es relevante por su enfoque en despliegue local sin nube: el autor declara validacion sobre hardware aarch64 (NVIDIA Jetson AGX Orin) con 8 GB de RAM y aislamiento de red verificado. Conviene tratar las cifras de evaluacion con cautela, ya que el propio autor las describe como una prueba de humo de 20 ejemplos y no como un benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA fusionado |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen2.5-1.5B-Instruct; no confirmada en la informacion) |
| Tipos de cuantizacion | GGUF q4_K_M y f16; safetensors en precision original |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo fusionado y adaptador PEFT), GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, con 1.543.714.304 parametros, obtenido al fusionar un adaptador LoRA sobre Qwen2.5-1.5B-Instruct. El adaptador tiene rango 32, alpha 64, dropout 0.05 y se aplica sobre todas las proyecciones lineales. El repositorio incluye tanto el modelo fusionado completo como el adaptador PEFT por separado, ademas de las conversiones GGUF.

El entrenamiento sigue un esquema de destilacion profesor-alumno: un modelo profesor genera escenarios multi-turno de tool calling (esquemas JSON simulados, consultas de usuario y llamadas API correctas) y el modelo de 1.5B se ajusta sobre esos ejemplos sinteticos. La model card indica que el profesor usado en la version 1 fue `qwen3:8b`, con un profesor de clase 27B planificado para la version 2. El dataset de entrenamiento esta publicado en NGARiAI/ngari-datasets. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO. El autor afirma que todos los artefactos de entrenamiento derivan de la linea Qwen2.5 con licencia Apache 2.0 y que no se emplearon modelos Gemma en el entrenamiento.

## Capacidades

- Generacion de llamadas a herramientas en formato estructurado (function calling / tool use).
- Deteccion de intencion de uso de herramienta a partir de lenguaje natural.
- Seleccion del nombre de herramienta correcto entre un conjunto de esquemas proporcionados.
- Generacion de parametros JSON validos segun el esquema de la funcion.
- Conversacion multi-turno basica (heredada del modelo base instruct).
- Generacion de texto general, aunque no es el objetivo principal del ajuste.
- Soporte declarado de integracion con Ollama, llama.cpp y Transformers/PEFT.
- Capacidades multilingues: solo ingles declarado; no se garantiza rendimiento en castellano.
- No se declaran capacidades de vision, audio, modo thinking explicito ni agentes multi-paso autonomos.

## Casos de uso

- Enrutamiento de herramientas en asistentes locales: el modelo recibe la consulta del usuario y un catalogo de funciones, y devuelve la llamada concreta con parametros validos; encaja en dispositivos con 8 GB de RAM por su tamano y su version GGUF q4_K_M.
- Agentes de escritorio o moviles sin conexion: al ejecutarse integramente en local (Ollama o llama.cpp), permite automatizar acciones como crear eventos de calendario o consultar el tiempo sin enviar datos a la nube.
- Pasarela de clasificacion de intenciones: dado que el autor reporta 100% de deteccion de herramienta en su evaluacion, puede usarse como primer filtro que decide si una peticion requiere una API o puede responderse con texto.
- Automatizacion de busquedas web: con un esquema de herramienta de busqueda, el modelo genera la consulta estructurada que un orquestador ejecuta posteriormente.
- Prototipado rapido de integraciones API: al publicarse el adaptador LoRA y el dataset, sirve como base para ajustes adicionales sobre dominios de herramientas propios.
- Sistemas con requisitos de soberania de datos: el autor valida el despliegue en hardware aislado (air-gap) sobre Jetson AGX Orin, lo que lo hace adecuado para entornos donde no se permite salida a Internet.
- Formateo de salidas JSON en pipelines: puede emplearse como componente que transforma lenguaje natural en payloads estructurados para servicios internos.

## Benchmarks y rendimiento

Los unicos datos publicados son la evaluacion propia del autor sobre 20 ejemplos (`ngari-tool-stable_tool_eval.json`):

| Metrica | Valor |
|---|---|
| Ejemplos evaluados | 20 |
| Tasa de deteccion de herramienta | 1.0 (20/20) |
| Precision en nombre de herramienta | 1.0 (20/20) |
| Tasa de validez de parametros | 1.0 (20/20) |
| Latencia media por ejemplo | 3,17 s |
| Tiempo total | 63,4 s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BFCL u otros) en la informacion disponible. El propio autor advierte que 20 ejemplos constituyen una prueba de humo y no un benchmark.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3 GB en f16 para los 1.540 millones de parametros; en torno a 1 GB con cuantizacion q4_K_M (estimacion a partir del numero de parametros, no publicada por el autor).
- Hardware validado por el autor: aarch64 / NVIDIA Jetson AGX Orin con 8 GB de RAM, con aislamiento de red verificado.
- Cabe en GPU de consumo: si, en tarjetas con 4 GB o mas de VRAM (por ejemplo RTX 3050, RTX 4060, GTX 1660) usando la version GGUF q4_K_M.
- Despliegue: Ollama (via Modelfile y GGUF), llama.cpp, Transformers con safetensors, PEFT para cargar el adaptador sobre el modelo base; tambien compatible con text-generation-inference segun los tags del repositorio.
- Latencia: 3,17 s de media por ejemplo en la evaluacion del autor; no se especifica el hardware exacto de esa medicion. No hay datos de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NGARiAI/ngari-tool | 1,54 B | No disponible | Tool calling especializado (LoRA) | Apache 2.0 | Hugging Face, GGUF |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | No disponible en esta ficha | Instruct generalista | Apache 2.0 | Hugging Face, amplia adopcion |
| Modelos de tool calling de mayor tamano (clase 7B-30B) | 7 B-30 B | Variable | Tool calling generalista | Variable | Variable |

La comparacion cuantitativa con alternativas no esta disponible: no hay datos publicados de otros modelos evaluados con el mismo conjunto de prueba del autor. Frente a su modelo base, la diferencia declarada es el ajuste LoRA para formato de herramienta; frente a modelos mayores, el autor reconoce explicitamente que un modelo pequeno no sustituye a uno frontera.

## Limitaciones y advertencias

- Evaluacion muy reducida: 20 ejemplos no permiten extrapolar el 100% de acierto a produccion; el propio autor lo califica de prueba de humo.
- Solo ingles declarado: el rendimiento en castellano no esta verificado y probablemente sea inferior.
- No es un modelo de conversacion general: el autor lo describe como modelo de modo herramienta, con un hermano (ngari-ft-distilled) para QA y seguridad.
- Riesgo de alucinacion en nombres de herramienta o parametros fuera de los esquemas vistos en entrenamiento; no hay evaluacion con esquemas arbitrarios.
- Datos de entrenamiento sinteticos generados por un profesor de 8B: pueden heredar sesgos y errores de formato del profesor.
- Longitud de contexto no confirmada en la informacion disponible; no debe asumirse la del modelo base sin verificacion.
- Trazabilidad limitada: 24 descargas y 1 like en el momento de la consulta; ecosistema y validacion externa practicamente inexistentes.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la procedencia del dataset sintetico publicado en ngari-datasets.
- El repositorio ocupa 10,4 GB, lo que incluye pesos duplicados (fusionado, adaptador y GGUF).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NGARiAI/ngari-tool
- Modelo hermano (QA y seguridad): https://huggingface.co/NGARiAI/ngari-ft-distilled
- Dataset de entrenamiento: https://huggingface.co/datasets/NGARiAI/ngari-datasets
- Repositorio del kernel: https://github.com/NGARiAI/ns-bos-kernel
- Pagina Open Source Friday: https://ngari.ai/open-source-friday
- Coleccion Open Source Friday: https://huggingface.co/collections/NGARiAI/open-source-friday-6b0a5e2732568212b40439a4
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
