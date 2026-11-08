# DrunkkToys/theOG-50M

## Resumen

theOG-50M es un modelo de generacion de codigo Python de 50,148,352 parametros (aproximadamente 50,7 M) entrenado desde cero por un unico desarrollador bajo el seudonimo DrunkkToys. Su proposito es convertir instrucciones en lenguaje natural en funciones Python, y su interes principal no reside en el rendimiento absoluto sino en la economia de medios: se entreno en un solo MacBook Air con chip Apple M5 y 32 GB de memoria unificada, sin GPU dedicada, durante unas 131 horas y 330.000 pasos sobre un corpus de 2.490 millones de tokens extraido de fuentes publicas de Hugging Face.

El modelo sigue la arquitectura de Qwen3 (etiqueta `qwen3-arch`) y se distribuye exclusivamente en formato GGUF, con un peso de descarga de 54 MB, lo que permite ejecucion completamente offline en Ollama, LM Studio o llama.cpp sobre hardware de consumo. La model card menciona ademas una alineacion mediante DPO sobre pares de preferencia verificados por ejecucion, en los que la completacion "elegida" supera los tests unitarios de la tarea.

La relevancia del proyecto es doble. Por un lado, demuestra que es posible producir un modelo funcional de generacion de codigo con un presupuesto de computo del orden de 8,1 x 10^17 FLOPs, aproximadamente 860 veces menos que CodeGen-350M-mono. Por otro, la model card incluye un registro de incidentes extenso en el que el autor atribuye fallos del proyecto a un asistente de programacion basado en IA, lo que conviene leer como contexto del desarrollo y no como especificacion tecnica del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen3 (`qwen3-arch`) |
| Parametros totales | 50.148.352 (50,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no disponibles); descarga principal de 54 MB |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria `gguf`); no se distribuyen safetensors en el repo |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 50,7 M de parametros construido sobre la arquitectura de Qwen3, sin mezcla de expertos ni mecanismos alternativos como SSM o hibridos. El entrenamiento se realizo desde cero, sin inicializacion a partir de pesos preentrenados, sobre un dataset de 2.490 millones de tokens compuesto por fuentes publicas de Hugging Face. El proceso completo consumio 330.000 pasos y aproximadamente 131 horas en la GPU integrada de un Apple M5 con PyTorch sobre Metal, lo que situa el computo total en torno a 8,1 x 10^17 FLOPs.

Tras el preentrenamiento, el autor aplica una fase de alineacion con DPO sobre pares de preferencia verificados por ejecucion: cada completacion marcada como preferida paso efectivamente los tests unitarios asociados a la tarea. La model card documenta tambien intentos de incorporar datos de razonamiento (modo `think`) generados por reglas, que segun el propio autor degradaron el comportamiento del modelo y fueron retirados del entrenamiento el 14 de octubre. No se especifica la composicion exacta del corpus, la tokenizador utilizado ni detalles de la configuracion de atencion mas alla de la referencia a Qwen3.

## Capacidades

- Generacion de funciones Python a partir de descripciones en lenguaje natural en ingles.
- Generacion de codigo en un unico turno, orientada a tareas acotadas mas que a conversaciones largas.
- Alineacion con preferencias verificadas por tests unitarios, lo que favorece completaciones ejecutables frente a plausibles.
- Ejecucion local offline mediante GGUF en Ollama, LM Studio y llama.cpp.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que permite servirlo tras una API compatible con el esquema habitual de Hugging Face.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Autocompletado de funciones auxiliares en proyectos Python: el modelo recibe una descripcion breve en ingles y devuelve una funcion candidata que el desarrollador revisa y adapta, adecuado por su tamano reducido y su ejecucion local sin latencia de red.
- Asistencia en entornos sin conectividad: al pesar 54 MB y ejecutarse en llama.cpp u Ollama, puede desplegarse en portatiles modestos, equipos aislados o entornos de desarrollo con restricciones de red.
- Generacion de borradores para tests unitarios y utilidades de scripting: tareas de codigo cortas y bien delimitadas donde la verificacion por ejecucion posterior es barata.
- Filtrado y preetiquetado de datos de codigo: uso como modelo docente o de referencia para clasificar o completar fragmentos en pipelines de curacion de datasets, dado su bajo coste por inferencia.
- Educacion y demostracion de entrenamiento de modelos: sirve como caso de estudio reproducible de un pipeline completo (tokenizacion, preentrenamiento, DPO, exportacion a GGUF) ejecutado en hardware de consumo.
- Prototipado rapido de asistentes de codigo embebidos: integrable en plugins de editor o scripts CLI que necesiten sugerencias de Python sin depender de APIs externas.
- Pruebas de integracion en CI/CD: validacion de que un pipeline de generacion y ejecucion de codigo funciona de extremo a extremo con un modelo pequeno antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona comparaciones de coste de entrenamiento con CodeGen-350M-mono (tokens, FLOPs, hardware y coste economico) y referencias a evaluaciones HumanEval en el registro de incidentes, pero no se aportan puntuaciones numericas verificables en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cuantizaciones de 4 bits para un modelo de 50,7 M de parametros; la descarga principal ocupa 54 MB.
- GPU recomendadas: cualquier GPU de consumo es suficiente; el modelo se entreno en una GPU integrada Apple M5, lo que indica que no requiere aceleradores dedicados.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, asi como en CPU y en Apple Silicon.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con endpoints; tambien es viable la inferencia en CPU pura.
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo, se espera latencia de milisegundos en hardware moderno, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| theOG-50M v3 | 50,7 M | no disponible | 2,49 B tokens, DPO verificado por tests | Apache 2.0 | GGUF | Hugging Face |
| CodeGen-350M-mono | 350 M | 2.048 tokens (modelo original) | ~325 B tokens (ThePile, BigQuery, BigPython) | Apache 2.0 | safetensors, GGUF (comunitario) | Hugging Face |
| Qwen2.5-Coder-0.5B | ~500 M | 32.768 tokens | no disponible en la informacion proporcionada | Apache 2.0 | safetensors, GGUF | Hugging Face |

La comparacion con CodeGen-350M-mono procede de los datos citados en la propia model card: el modelo de Salesforce emplea 7 veces mas parametros, aproximadamente 130 veces mas tokens de entrenamiento y un computo unas 860 veces superior. Frente a Qwen2.5-Coder-0.5B, el modelo de DrunkkToys es un orden de magnitud menor en parametros y carece de contexto largo documentado, por lo que la comparacion solo es valida en la categoria de modelos pequenos para generacion de codigo, no en rendimiento.

## Limitaciones y advertencias

- Modelo de 50,7 M de parametros: la calidad del codigo generado sera limitada y requerira revision humana sistematica; no es adecuado para generacion de codigo en produccion sin validacion.
- Solo soporta ingles como idioma de entrada; no se documenta comportamiento en castellano ni en otros idiomas.
- Longitud de contexto no documentada, lo que impide planificar su uso en tareas que requieran contexto amplio o conversaciones multi-turno.
- Riesgo de alucinacion elevado: al ser un modelo entrenado desde cero con un corpus pequeno, puede producir APIs inexistentes o firmas de funciones incorrectas.
- No se documentan sesgos especificos, pero el corpus de fuentes publicas de Hugging Face puede arrastrar sesgos de estilo y de licencia del codigo de origen.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la procedencia ni la licencia del codigo de entrenamiento.
- La model card contiene un registro de incidentes muy extenso con acusaciones hacia un asistente de IA; no debe interpretarse como documentacion tecnica y conviene contrastar cualquier afirmacion de rendimiento de forma independiente.
- No se publican resultados de benchmarks verificables, por lo que las afirmaciones comparativas de la model card no son reproducibles con la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/DrunkkToys/theOG-50M
- AlphaNeural AI: https://app.alphaneural.io/models/DrunkkToys/theOG-50M
- Paper de CodeGen (referencia citada en la model card): https://arxiv.org/abs/2203.13474
- Paper de referencia adicional citado en los tags: https://arxiv.org/abs/2310.02226
