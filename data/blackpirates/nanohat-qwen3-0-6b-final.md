# blackpirates/nanohat-qwen3-0.6b-final

## Resumen

NanoHat-0.6B es un modelo de lenguaje ultracompacto especializado en tool calling, desarrollado por el usuario blackpirates (vinculado al proyecto NanoHat de asimansari-git) a partir de un ajuste fino de Qwen/Qwen3-0.6B. Su proposito es traducir instrucciones en lenguaje natural a llamadas de sistema Linux estructuradas en JSON (`<tool_call>`), actuando como motor de razonamiento del NanoHat Linux OS Harness sobre Fedora Workstation. No opera de forma autonoma: se invoca bajo demanda cuando el usuario lo solicita.

El modelo resuelve un problema muy concreto: la ejecucion local y ligera de tareas de administracion de sistemas mediante lenguaje natural, sin depender de la nube. Con 596.049.920 parametros reales (segun los safetensors del repositorio) y basado en la arquitectura Qwen3, esta disenado para ejecutarse en dispositivos de consumo. Se distribuye bajo licencia Apache 2.0 y esta orientado exclusivamente al idioma ingles.

La relevancia actual radica en la tendencia hacia modelos pequenos (SLM) desplegables en local con llama.cpp u Ollama, y en la publicacion de un preprint en Zenodo con una evaluacion sobre 299 consultas no vistas que compara el modelo afinado con el base. El ajuste se realizo con GRPO (segun los tags del repositorio), lo que sugiere entrenamiento con refuerzo sobre recompensas de formato y ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (disponible en el repositorio); otros niveles no especificados |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer decoder-only de la familia Qwen3, y se ha ajustado mediante GRPO (Group Relative Policy Optimization), segun los tags del repositorio (`trl`, `grpo`). El objetivo del entrenamiento no es la generacion libre de texto, sino la produccion fiable de payloads JSON de llamadas a herramientas bajo un contrato de 10 herramientas inyectado por el harness NanoHat. El modelo distingue entre consultas que requieren herramienta, preguntas generales de Linux, aritmetica y rechazos de seguridad.

La innovacion principal es el enfoque de producto: un SLM de 0.6B parametros especializado en un contrato de herramientas fijo, con modos de razonamiento (`think=ON` / `think=OFF`) y una evaluacion centrada en ejecucion real en sandbox, coincidencia estricta de argumentos y tasas de rechazo ante comandos destructivos. No se dispone de informacion sobre el volumen de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de llamadas a herramientas en formato `<tool_call>` JSON para un contrato de 10 herramientas de sistema Linux.
- Respuestas en texto plano para preguntas generales sobre Linux y aritmetica.
- Rechazo de seguridad ante solicitudes destructivas (tasa de cumplimiento del 90% en v4.0 sobre las consultas de seguridad de la suite).
- Soporte de cadenas multi-herramienta (multi-tool chains), con un 40% de coincidencia exacta de secuencia en v4.0 y hasta un 60% en v4.1 con `think=ON`.
- Modo de razonamiento activable (`think=ON`) que mejora la tasa de formato nativo y la precision, a costa de mayor latencia.
- Capacidades multilingues: solo ingles.
- No se documentan capacidades de vision, audio ni agentes autonomos en segundo plano.

## Casos de uso

- Administracion de sistemas Linux asistida por lenguaje natural: el usuario pide "muestrame el uso de disco" y el modelo emite la llamada JSON correspondiente para que el harness la ejecute localmente en Fedora.
- Automatizacion de tareas de escritorio bajo demanda: integrado en el CLI NanoHat (`pip install nanohat`), traduce peticiones coloquiales en invocaciones de herramientas concretas sin requerir conexion a la nube.
- Asistente local en entornos con requisitos de privacidad: al ejecutarse en el propio equipo con llama.cpp u Ollama, los comandos y datos del sistema no salen de la maquina.
- Ensenanza y formacion en administracion de sistemas: el modelo responde preguntas generales de Linux y muestra la estructura de la llamada que se ejecutaria, util para practicar en sandbox.
- Filtrado y rechazo de comandos peligrosos: actua como capa de seguridad que rechaza instrucciones destructivas antes de que el harness las despache (90% de cumplimiento en v4.0).
- Prototipado de agentes de tool calling en hardware modesto: sirve como banco de pruebas para disenar contratos de herramientas y medir latencia y precision en un SLM antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Evaluacion sobre 299 consultas no vistas (239 de herramientas + 60 conversacionales, aritmeticas y de seguridad), segun la model card:

| Metrica | Qwen3-0.6B base (think=OFF) | Qwen3-0.6B base (think=ON) | NanoHat v4.0 (think=OFF) | NanoHat v4.0 (think=ON) | NanoHat v4.1 (think=OFF) |
|---|---|---|---|---|---|
| Formato nativo `<tool_call>` (239) | 82,43% | 95,40% | 100,0% | 95,40% | 100,0% |
| Coincidencia exacta de herramienta (239) | 66,95% | 76,99% | 90,38% | 77,82% | 92,47% |
| Coincidencia canonica de argumentos (239) | 51,05% | 65,27% | 86,19% | 71,13% | 87,03% |
| Coincidencia estricta de argumentos (239) | 41,84% | 58,58% | 85,36% | 69,04% | 83,68% |
| Tasa de duplicados (menor es mejor) | 0,84% | 1,26% | 1,67% | 1,67% | 0,42% |
| Ejecucion en sandbox correcta (239) | 73,64% | 86,19% | 99,58% | 94,14% | 100,0% |
| Tasa limpia sin herramienta (60) | 100,0% | 100,0% | 96,67% | 96,67% | 83,33% |
| Alucinacion espuria de herramienta (menor es mejor) | 0,00% | 0,00% | 3,33% | 3,33% | 16,67% |
| Intencion y herramienta combinadas (299) | 73,58% | 81,61% | 91,64% | 81,61% | 90,64% |
| Precision canonica combinada (299) | 60,87% | 72,24% | 88,29% | 76,25% | 86,29% |
| Latencia mediana P50 | 580,4 ms | 1461,0 ms | 671,8 ms | 2042,8 ms | 607,0 ms |
| Latencia P95 | 996,4 ms | 3644,7 ms | 1567,9 ms | 6493,5 ms | 4140,9 ms |

Desglose por intencion (v4.0, `think=OFF`): coincidencia exacta de herramienta unica 97,61% (209 consultas); coincidencia exacta de secuencia multi-herramienta 40,00% (30 consultas); sin alucinacion de herramienta en aritmetica pura 100% (10 consultas). La model card indica que v4.1 mejora las cadenas multi-herramienta (56,67%) pero empeora el rechazo de seguridad (60% frente a 90%) y la tasa limpia sin herramienta (83,33% frente a 96,67%), por lo que `latest` apunta a v4.0.

## Requisitos de hardware

- VRAM estimada: con 596 millones de parametros, en FP16 requiere aproximadamente 1,2 GB de pesos; en cuantizacion de 4 bits (GGUF Q4) baja a unos 400-500 MB, mas overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente; tambien funciona en CPU. No requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier tarjeta moderna (RTX 3060, RTX 4060, GTX 1650, integradas con suficiente memoria compartida).
- Opciones de despliegue: llama.cpp (formato GGUF disponible), Ollama (registro `asimansari-o/nanohat`), transformers, text-generation-inference (tag `text-generation-inference`).
- Latencia: P50 de 671,8 ms y P95 de 1567,9 ms con `think=OFF` en v4.0, segun la evaluacion del harness; con `think=ON` la mediana sube a 2042,8 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NanoHat-0.6B (v4.0) | 596 M | no disponible | Tool calling Linux | Apache 2.0 | HF, Ollama |
| Qwen3-0.6B (base) | 0,6 B | no disponible | Generacion general | Apache 2.0 | HF |
| Otros SLM de tool calling de ~0,5-1 B | no disponible | no disponible | Tool calling generico | no disponible | no disponible |

La comparacion directa mas relevante es con su modelo base: NanoHat v4.0 eleva la coincidencia exacta de herramienta del 66,95% al 90,38% y la ejecucion correcta en sandbox del 73,64% al 99,58% con `think=OFF`, a costa de un ligero aumento de latencia (580,4 ms a 671,8 ms de mediana) y de una pequena perdida en la tasa limpia sin herramienta (100% a 96,67%). No se dispone de datos de benchmarks de otros SLM comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Especializado en un contrato fijo de 10 herramientas de Linux: fuera de ese esquema su utilidad es limitada.
- Introduce alucinaciones espurias de herramienta en el 3,33% de las consultas que no requieren herramienta (v4.0) y hasta el 16,67% en v4.1.
- El rechazo de seguridad ante comandos destructivos es del 90% en v4.0 y cae al 60% en v4.1; no es una garantia absoluta y debe combinarse con validacion adicional en produccion.
- La coincidencia estricta de argumentos es del 85,36% (v4.0), por lo que un porcentaje no despreciable de llamadas puede llevar argumentos incorrectos.
- Las cadenas multi-herramienta tienen una coincidencia exacta de secuencia baja (40% en v4.0), lo que limita tareas complejas de varios pasos.
- Requiere el harness NanoHat para ejecutar comandos; el modelo por si solo solo emite JSON.
- No se dispone de informacion sobre sesgos, volumen de datos de entrenamiento ni evaluacion fuera del benchmark propio del autor.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye sin garantias y el autor no ofrece soporte documentado.

## Enlaces

- Hugging Face: https://huggingface.co/blackpirates/nanohat-qwen3-0.6b-final
- Repositorio de archivos: https://huggingface.co/blackpirates/nanohat-qwen3-0.6b-final/tree/main
- Preprint en Zenodo: https://doi.org/10.5281/zenodo.23618506
- Codigo del harness NanoHat: https://github.com/asimansari-git/NanoHat
- Registro en Ollama: https://ollama.com/asimansari-o/nanohat
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
