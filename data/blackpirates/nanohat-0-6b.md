# blackpirates/nanohat-0.6b

## Resumen

NanoHat-0.6B es un modelo de lenguaje ultracompacto de 0,6 mil millones de parámetros, afinado a partir de Qwen/Qwen3-0.6B por el usuario blackpirates, especializado en la traducción de instrucciones en lenguaje natural a llamadas de herramienta estructuradas (tool calling) para el harness de sistema operativo NanoHat sobre Fedora Workstation. No se trata de un modelo de propósito general, sino de un componente de razonamiento local pensado para ejecutarse en el propio dispositivo (on-device) y responder exclusivamente bajo demanda del usuario.

El modelo resuelve un problema muy concreto: convertir peticiones coloquiales en inglés en payloads JSON `<tool_call>` que el CLI de NanoHat (instalable vía `pip install nanohat`) interpreta y despacha como llamadas al sistema Linux. Su contrato de herramientas cubre diez funciones predefinidas, y el modelo también gestiona respuestas en texto plano para preguntas generales sobre Linux, aritmética y rechazos de seguridad ante comandos destructivos.

Su relevancia actual radica en la combinación de tamaño mínimo (596.049.920 parámetros reales según safetensors), licencia Apache 2.0 y latencia inferior a 600 ms en hardware de borde, lo que lo hace viable para ejecución local sin GPU dedicada. La arquitectura subyacente es la de Qwen3-0.6B, un transformer denso, y el modelo se distribuye tanto en safetensors como en GGUF para su uso con llama.cpp y Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (disponible en el repo); otras cuantizaciones no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B, un transformer denso de 0,6B parámetros, y se ha afinado mediante fine-tuning supervisado para especializarlo en tool calling dentro del contrato de diez herramientas del harness NanoHat. La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible. Lo que sí se documenta es el proceso de iteración: las versiones v4.0, v4.1 y v4.1.2 corrigen regresiones de seguridad y de cadenas multi-herramienta detectadas en evaluaciones sucesivas.

La innovación técnica principal no reside en la arquitectura, sino en la especialización del formato de salida: el modelo genera payloads `<tool_call>` en JSON con una tasa de formato nativo del 100 % sobre las 239 consultas de herramienta del benchmark interno, frente al 82,43 % (think=OFF) y 95,40 % (think=ON) del Qwen3-0.6B base. También se documenta un modo de razonamiento (think=ON/OFF) heredado del modelo base, que mejora la precisión a costa de latencia: 1307,6 ms de mediana con thinking activado frente a 595,7 ms desactivado.

## Capacidades

- Generación de llamadas a herramienta en formato `<tool_call>` JSON contra un esquema fijo de diez herramientas de sistema Linux.
- Gestión de cadenas multi-herramienta (multi-tool chains) con cobertura parcial del 100 % en el benchmark interno cuando el modo thinking está activo.
- Respuestas en texto plano para preguntas generales sobre Linux y operaciones aritméticas.
- Rechazo de seguridad ante comandos destructivos, con una tasa de rechazo del 100 % en el conjunto de evaluación.
- Modo de razonamiento (thinking mode) activable o desactivable, heredado de Qwen3.
- Soporte de function calling y tool calling como capacidad central del afinado.
- Capacidad conversacional multi-turno dentro del harness NanoHat.
- Ejecución local on-device mediante llama.cpp y Ollama.
- Sin capacidades de visión, audio ni generación de código general más allá de las llamadas de sistema.

## Casos de uso

- Automatización de tareas de administración en Fedora Workstation: el usuario describe en lenguaje coloquial una operación (por ejemplo, gestionar servicios o consultar estado del sistema) y el modelo la traduce a una llamada estructurada que el harness ejecuta localmente, sin salir del equipo.
- Asistente de terminal integrado: el modelo actúa como capa de traducción entre lenguaje natural y comandos Linux, reduciendo la necesidad de memorizar sintaxis y flags, con latencia inferior a 600 ms en modo sin thinking.
- Ejecución de cadenas de operaciones: para tareas que requieren varios pasos encadenados, el modelo genera secuencias multi-herramienta con una cobertura parcial del 100 % en modo thinking, lo que permite automatizar flujos de diagnóstico y corrección.
- Despliegue en entornos con recursos limitados: al ocupar 0,6B parámetros y distribuirse en GGUF, puede ejecutarse en portátiles y equipos de borde sin GPU dedicada, lo que encaja en escenarios de administración de sistemas en campo.
- Filtrado de seguridad en automatización: antes de ejecutar un comando, el modelo clasifica la petición y rechaza operaciones destructivas con una tasa documentada del 100 %, lo que lo hace apto como primera barrera en pipelines de ejecución automática.
- Asistente de soporte técnico Linux: responde preguntas generales en texto plano sobre el sistema operativo y, cuando la consulta requiere acción, deriva a una llamada de herramienta, combinando ambas modalidades en una misma conversación.
- Integración en herramientas de escritorio: cualquier aplicación que necesite invocar operaciones del sistema mediante un contrato JSON puede usar el modelo como backend local, siempre que respete el esquema de diez herramientas del harness NanoHat.

## Benchmarks y rendimiento

Los datos proceden de la evaluación interna del autor sobre 299 consultas no vistas (239 de herramienta y 60 conversacionales, aritméticas y de seguridad), ejecutadas a través del harness NanoHat.

| Metrica | Qwen3-0.6B base (think=OFF) | Qwen3-0.6B base (think=ON) | NanoHat v4.1.2 (think=OFF) | NanoHat v4.1.2 (think=ON) |
|---|---|---|---|---|
| Tasa de formato nativo `<tool_call>` (239) | 82,43 % | 95,40 % | 100,0 % | 100,0 % |
| Coincidencia exacta de herramienta (239) | 66,95 % | 76,99 % | 92,89 % | 96,65 % |
| Coincidencia canónica de argumentos (239) | 51,05 % | 65,27 % | 85,77 % | 92,89 % |
| Coincidencia estricta de argumentos (239) | 41,84 % | 58,58 % | 84,94 % | 89,96 % |
| Tasa de llamadas duplicadas (menor es mejor) | 0,84 % | 1,26 % | 0,84 % | 0,00 % |
| Tasa de paso en sandbox (239) | 73,64 % | 86,19 % | 99,58 % | 99,58 % |
| Tasa limpia sin herramienta (60) | 100,0 % | 100,0 % | 100,0 % | 98,33 % |
| Alucinación espuria de herramienta (menor es mejor) | 0,00 % | 0,00 % | 0,00 % | 1,67 % |
| Precisión canónica combinada (299) | 60,87 % | 72,24 % | 88,63 % | 93,98 % |
| Latencia mediana P50 | 580,4 ms | 1461,0 ms | 595,7 ms | 1307,6 ms |
| Latencia P95 | 996,4 ms | 3644,7 ms | 1001,1 ms | 2518,2 ms |

En el desglose por intención, las consultas de una sola herramienta (209) alcanzan un 99,04 % de coincidencia exacta en v4.1.2, y las cadenas multi-herramienta (30) llegan al 80,00 % de coincidencia exacta de secuencia y al 100,0 % de cobertura parcial en modo thinking. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 596 millones de parámetros, las cuantizaciones GGUF de 4 bits deberían situarse en torno a 0,4-0,5 GB de pesos, aunque el autor no publica cifras de memoria.
- GPU recomendadas: no disponibles; el modelo está diseñado para ejecución on-device y se distribuye en GGUF, lo que sugiere uso en CPU.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU con más de 1-2 GB de VRAM, pero no hay confirmación en la información proporcionada.
- Opciones de despliegue: llama.cpp, Ollama (registro `asimansari-o/nanohat`, versión v4.1.2/latest), transformers y text-generation-inference según los tags del repositorio.
- Latencia: P50 de 595,7 ms y P95 de 1001,1 ms en modo think=OFF sobre el hardware de referencia del autor (no especificado); en modo think=ON, P50 de 1307,6 ms y P95 de 2518,2 ms.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| NanoHat-0.6B | 596 M | no disponible | Tool calling para Linux (NanoHat) | Apache 2.0 | safetensors, GGUF |
| Qwen/Qwen3-0.6B | 0,6 B | no disponible | Propósito general | Apache 2.0 | safetensors, GGUF |
| Alternativas de tool calling de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con su modelo base, Qwen3-0.6B: NanoHat mejora la coincidencia exacta de herramienta del 66,95 % al 92,89 % (think=OFF) y la precisión canónica combinada del 60,87 % al 88,63 %, a costa de una latencia mediana ligeramente superior (595,7 ms frente a 580,4 ms). No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el contrato de diez herramientas del harness NanoHat; fuera de ese esquema su utilidad es muy limitada.
- Solo soporta inglés (`language: en`); no hay evidencia de capacidades multilingües.
- La longitud de contexto no está documentada, lo que impide planificar conversaciones largas con garantías.
- El modo thinking mejora la precisión (93,98 % frente a 88,63 %) pero duplica la latencia mediana y eleva la P95 a 2518,2 ms.
- En modo thinking se observa una tasa de alucinación espuria de herramienta del 1,67 %, frente al 0,00 % en modo sin thinking.
- La evaluación se basa en un benchmark interno de 299 consultas diseñado por el propio autor; no hay validación independiente ni resultados en benchmarks estándar.
- El modelo no opera de forma autónoma: requiere el CLI de NanoHat para ejecutar comandos, y su uso sin el harness se limita a generar JSON.
- Riesgo de alucinación en argumentos: la coincidencia estricta de argumentos es del 84,94 % en el mejor caso sin thinking, lo que implica que aproximadamente una de cada siete llamadas puede contener argumentos incorrectos.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre la ejecución de comandos del sistema recae en el integrador.
- El repositorio tiene 0 likes y 1499 descargas en la fecha de consulta, lo que indica una validación comunitaria muy escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/blackpirates/nanohat-0.6b
- Repositorio del harness NanoHat: https://github.com/asimansari-git/NanoHat
- Registro Ollama: https://ollama.com/asimansari-o/nanohat
- DOI Zenodo: https://doi.org/10.5281/zenodo.23618505
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
