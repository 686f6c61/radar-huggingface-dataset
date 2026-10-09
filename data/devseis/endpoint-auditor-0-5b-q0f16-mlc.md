# Devseis/endpoint-auditor-0.5b-q0f16-MLC

## Resumen

Devseis Endpoint Auditor 0.5B es un modelo de lenguaje pequeño (0,5 mil millones de parámetros) afinado por **Devseis** a partir de Qwen/Qwen2.5-0.5B-Instruct. Su función es redactar hallazgos de auditoría de *endpoints* para ISO 27001, GDPR y el reglamento europeo de IA (EU AI Act) a partir de evidencia ya recogida por código. El modelo no decide veredictos: explica cada hallazgo, estima el riesgo, redacta pasos de corrección y verificación según el sistema operativo, mapea los hallazgos a controles normativos, redacta el resumen ejecutivo y clasifica herramientas de IA bajo el EU AI Act.

La relevancia del proyecto está en su enfoque de privacidad: el modelo se empaqueta en formato MLC para ejecutarse íntegramente en el dispositivo mediante WebLLM (aplicación de escritorio y comprobación en móvil), de modo que la evidencia de auditoría nunca abandona el ordenador o el teléfono. Esta revisión corresponde a la versión v0.1, un piloto entrenado con 988 ejemplos sintéticos equilibrados por tarea, sistema operativo y estado, que el propio autor describe como superado por la v0.3.

Arquitectónicamente reutiliza la arquitectura de Qwen2.5-0.5B-Instruct, por lo que WebLLM puede reutilizar su librería de ejecución precompilada q0f16 para ese modelo base y solo cargar los pesos nuevos. El repo ocupa unos 1,0 GB y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA fusionado |
| Parametros totales | ~0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No indicada en la model card; heredada del modelo base Qwen2.5-0.5B-Instruct |
| Tipos de cuantizacion | q0f16 (float16) en este repositorio; el autor menciona builds de 4 bits con decodificacion restringida |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLC (compilado para runtime MLC-LLM / WebLLM); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct (Apache-2.0) y se afina con LoRA de rango r=16 y alpha=32, lo que supone 8,8 millones de parametros entrenables, con learning rate 2e-4, una epoca y 124 pasos de 8 ejemplos. El entrenamiento se realizo unicamente en CPU, sobre un MacBook Pro de 4 nucleos con PyTorch 2.2 y atencion en modo *eager*. La perdida de validacion final fue de 0,0173. El conjunto de datos es Devseis/endpoint-auditor-synthetic (revision v0.1, sintetico, CC BY 4.0), con 988 ejemplos equilibrados por tarea, sistema operativo (Windows, Linux, macOS) y estado, con una longitud de 2048 tokens.

La innovacion principal no esta en la arquitectura, sino en el pipeline de despliegue y fidelidad. Los pesos se convirtieron con `training/mlc_quantize.py` y se verificaron contra las builds oficiales de mlc-ai del modelo base: mismo *layout* de tensores, q0f16 byte a byte identico, escalas de 4 bits identicas bit a bit y entre el 99,6 % y el 99,8 % de los valores de 4 bits identicos (el resto a un paso de diferencia por empates de redondeo). Ademas, el sistema obliga a decodificacion restringida con esquemas JSON (`ANSWER_SCHEMAS`) y valida cada respuesta contra la evidencia (numeros, check id, estado, referencias, nombres de herramientas); si falla, la aplicacion usa una plantilla integrada.

## Capacidades

- Generacion de hallazgos de auditoria: explica cada *finding*, asigna riesgo y redacta pasos de correccion y verificacion especificos para el sistema operativo del dispositivo.
- Redaccion de resumen ejecutivo a partir de un conjunto de hallazgos.
- Clasificacion de herramientas de IA bajo el EU AI Act, incluyendo herramientas y *flags* de aprobacion.
- Mapeo de hallazgos a referencias normativas de ISO 27001, GDPR y EU AI Act (se citan titulos de controles; no se reproduce el texto de la norma).
- Salida estructurada: responde con un unico objeto JSON por tarea (`finding`, `summary`, `ai_classification`), lo que permite integracion programatica.
- Ejecucion local en el dispositivo mediante WebLLM, sin salida de datos a la nube.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles.
- Capacidades especiales: no hay modo *thinking* ni vision ni audio; el modelo no realiza calculos ni rankings de forma fiable (los aporta el codigo de la aplicacion).

## Casos de uso

- Auditoria de cumplimiento en puesto de trabajo: la aplicacion recoge la evidencia y el modelo redacta el hallazgo, el riesgo y el plan de remediacion por sistema operativo, manteniendo la evidencia en local.
- Generacion de informes ISO 27001: el modelo mapea cada hallazgo a los titulos de control correspondientes y produce texto listo para incluir en el informe de auditoria.
- Revisión de cumplimiento GDPR: a partir de la evidencia recogida, redacta explicaciones de hallazgos relacionados con proteccion de datos y pasos de correccion.
- Clasificacion de herramientas de IA segun el EU AI Act: dado un inventario de herramientas, genera clasificaciones con herramientas y *flags* de aprobacion para revisión humana.
- Resumen ejecutivo automatizado: convierte una lista de hallazgos y puntuaciones (calculadas por codigo) en un texto de direccion.
- Aplicaciones de escritorio y moviles con privacidad estricta: al ejecutarse via WebLLM, encaja en entornos donde la evidencia no puede salir del dispositivo (consultoras, sector publico, entornos regulados).
- Prototipado de asistentes de compliance de bajo coste: con 0,5B parametros y pesos q0f16 (~1 GB), sirve para validar pipelines de auditoria asistida antes de escalar a modelos mayores.
- Integracion en flujos de revision con validacion automatica: la decodificacion restringida y la comprobacion de fidelidad permiten encadenar la salida a *gates* de calidad con *fallback* a plantilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye una evaluacion propia sobre ejemplos de test reservados (`training/evaluate.py`, decodificacion *greedy*), definiendo *grounded* como superar la misma comprobacion de fidelidad que usa la aplicacion y *fields match* como la coincidencia de check id / estado / riesgo (findings), puntuacion y principales carencias (summaries) o herramientas y *flags* de aprobacion (AI).

**Modelo base (Qwen2.5-0.5B-Instruct, sin afinar):**

| Tarea | n | JSON valido | Grounded | Fields match |
|---|---|---|---|---|
| ai_classification | 5 | 0 % | 0 % | 0 % |
| finding | 21 | 0 % | 0 % | 0 % |
| summary | 4 | 0 % | 0 % | 0 % |
| **total** | 30 | **0 %** | **0 %** | **0 %** |

**Este modelo (v0.1):**

| Tarea | n | JSON valido | Grounded | Fields match |
|---|---|---|---|---|
| ai_classification | 5 | 100 % | 100 % | 100 % |
| finding | 21 | 100 % | 100 % | 100 % |
| summary | 4 | 100 % | 100 % | 0 % |
| **total** | 30 | **100 %** | **100 %** | **87 %** |

Ademas, el autor reporta que en builds de 4 bits y sin decodificacion restringida el modelo produce JSON invalido (0 de 6 respuestas *grounded*), mientras que con decodificacion restringida obtiene respuestas *grounded* en 5 de 6 casos (el sexto se corto por limite de tokens, posteriormente elevado).

## Requisitos de hardware

- VRAM estimada: los pesos q0f16 de un modelo de 0,5B ocupan en torno a 1 GB; con el *overhead* del runtime WebGPU el consumo practico se situa aproximadamente entre 1 y 1,5 GB. En 4 bits, el peso baja a unos 250-350 MB.
- GPU recomendadas: cualquier GPU con soporte WebGPU (integrada moderna, Apple Silicon, NVIDIA GTX/RTX, AMD Radeon). No requiere A100 ni H100.
- Cabe en GPU de consumo: si, con margen amplio; tambien en GPU integradas y en telefonos compatibles con WebGPU (el modelo se usa en la comprobacion movil).
- Opciones de despliegue: WebLLM (@mlc-ai/web-llm) en el navegador y runtime MLC-LLM. No se documentan despliegues en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. El autor solo indica que se entreno en CPU (4 nucleos) con atencion *eager* y que las respuestas validas pueden truncarse por limite de tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Devseis Endpoint Auditor 0.5B (v0.1) | ~0,5 B | No indicado (heredado del base) | 100 % JSON valido, 100 % grounded, 87 % fields match | Apache-2.0 | HuggingFace, formato MLC para WebLLM |
| Qwen2.5-0.5B-Instruct (base) | ~0,5 B | No indicado en la informacion disponible | 0 % JSON valido, 0 % grounded | Apache-2.0 | HuggingFace, runtime MLX/MLC/varios |
| Otros modelos de auditoria de endpoints de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |
| Modelo generalista de 1-3B (alternativa para la misma tarea) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoria mas alla de la comparacion directa con el modelo base que aporta el propio autor.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible.
- Riesgo de alucinacion: el entrenamiento se hizo con evidencia sintetica y la redaccion del mundo real varia; el modelo podria desviarse de los hechos. La aplicacion mitiga esto con una comprobacion de fidelidad contra la evidencia y un *fallback* a plantilla integrada.
- Tamano reducido: con 0,5B parametros el modelo frasea y selecciona bien hechos recuperados, pero no es fiable para aritmetica ni para ordenar o clasificar por puntuacion; esos valores los aporta el codigo de la aplicacion.
- Contexto e idioma: solo ingles y sin longitud de contexto declarada en la model card.
- Restricciones de licencia: Apache-2.0, que permite uso comercial, pero se pide atribucion ("Devseis Endpoint Auditor by Devseis"). Hay que respetar tambien las licencias del modelo base (Apache-2.0) y del dataset sintetico (CC BY 4.0).
- No es asesoramiento legal ni certificacion: cita titulos de controles de ISO 27001, pero no reproduce el texto de la norma.
- Caveat de version: la v0.1 es un piloto superado por la v0.3; para produccion conviene evaluar la version mas reciente.
- Caveat de integracion: sin decodificacion restringida con los esquemas JSON, los builds de 4 bits generan JSON invalido; es obligatorio usar `response_format` con `json_object` y esquema.
- Caveat de evaluacion: las cifras de rendimiento provienen de una evaluacion propia sobre 30 ejemplos de test reservados, no de benchmarks estandar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Devseis/endpoint-auditor-0.5b-q0f16-MLC
- Modelo base (referenciado): https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/Devseis/endpoint-auditor-synthetic
- Space de la aplicacion (Devseis Endpoint Auditor): https://huggingface.co/spaces/Devseis/endpoint-auditor
- Documentacion del modelo en el repo (docs/MODEL_LLM.md): https://huggingface.co/spaces/Devseis/endpoint-auditor/blob/main/docs/MODEL_LLM.md
- Pagina del modelo base sin cuantizar del autor: https://huggingface.co/Devseis/endpoint-auditor-0.5b
- Listado de modelos compatibles con MLC-LLM: https://huggingface.co/models?library=mlc-llm
