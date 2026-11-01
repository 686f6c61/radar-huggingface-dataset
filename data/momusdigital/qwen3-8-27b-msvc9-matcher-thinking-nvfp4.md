# momusdigital/Qwen3.8-27B-MSVC9-Matcher-Thinking-NVFP4

## Resumen

Qwen3.8-27B-MSVC9-Matcher-Thinking-NVFP4 es un ajuste fino del modelo Qwen/Qwen3.8-27B desarrollado por el usuario momusdigital, orientado a una tarea muy concreta de ingeniería inversa: reconstruir el código fuente C++03 de una función x86 a partir de su desensamblado, de forma que el compilador Microsoft Visual C++ 2008 SP1 (version 15.00.30729.01) genere código máquina byte a byte idéntico al original. El modelo está entrenado para razonar primero (modo thinking), escribir la función, leer la realimentación del compilador y de la comparación de bytes, y revisar su propuesta en rondas sucesivas.

Se trata de la continuación del anterior Qwen3.8-27B-MSVC9-Matcher-LoRA, que cubría funciones cortas con el modo thinking desactivado; esta versión apunta a funciones más grandes (de 1 KB en adelante) con razonamiento activado. El repositorio contiene únicamente los pesos fusionados y cuantizados en NVFP4 (4 bits, tamaño de grupo 16, caché KV en FP8), obtenidos tras fusionar el adaptador LoRA en los pesos BF16 y recuantizar con las escalas congeladas del modelo base.

El modelo se publica como lanzamiento de investigación: el propio autor advierte que la mayoría de funciones grandes siguen sin resolverse y que la mejora frente al modelo base es sugerente pero no estadísticamente concluyente. Su interés radica en la metodología de entrenamiento (trazas de trabajo comunitarias revalidadas con un checker propio) y en el ahorro de cómputo conseguido: aproximadamente la mitad de tokens y 2,2 veces más rápido para resultados iguales o mejores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8), ajuste fino con LoRA fusionado; pesos cuantizados en NVFP4 |
| Parametros totales | 14.557.547.760 (según safetensors); la nomenclatura del modelo indica 27B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128K tokens en la evaluación; ventana nativa del modelo base no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, group size 16, caché KV en FP8); tag del repo: 8-bit, modelopt |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (NVFP4, cuantizado con modelopt) |

## Arquitectura y entrenamiento

El modelo parte del transformer Qwen3.8-27B en BF16, sobre el que se aplicó un adaptador LoRA de rango 64, inicializado a partir del adaptador de la ronda anterior. El entrenamiento consistió en 103 pasos de optimizador con secuencias de 24K tokens, distribuido en dos nodos, sobre 1.662 ejemplos (706 con thinking) y aproximadamente 21 millones de tokens. La pérdida se calcula solo sobre el turno final del asistente, incluyendo su bloque de razonamiento. Posteriormente el adaptador se fusionó en los pesos BF16 y el conjunto se recuantizó a NVFP4 con las escalas congeladas del modelo base.

Los datos proceden de trazas de trabajo de una plataforma comunitaria en la que colaboradores que dirigen agentes de código reclaman funciones sin resolver e iteran contra un compilador local y un verificador de comparación de bytes. Se recogieron unas 16.000 reclamaciones, cada una con el plan escrito antes de empezar, notas libres y cada intento con su código y tres campos redactados antes de la comprobación (cambio, motivo, expectativa) más el resultado. Cada intento se volvió a ejecutar en el checker propio del autor para etiquetar el efecto real del paso, y solo se entrenaron los pasos que mejoraban. Los ejemplos de razonamiento usan exclusivamente texto escrito antes del código que explica, nunca justificaciones a posteriori. Se aplicaron pesos por calidad (gold 1.0, silver 0.8, corrección que mejora 0.7 o 1.0 si acierta, hindsight 0.5) y se redujo el peso de cualquier fuente que superara el 30% del total. Un 20% de los ejemplos replica rondas anteriores con thinking desactivado para preservar esa modalidad y la habilidad en funciones pequeñas.

## Capacidades

- Reconstrucción de código C++03 a partir de desensamblado x86, con objetivo de compilación byte-idéntica en MSVC 2008 SP1.
- Razonamiento explícito en modo thinking: planifica, escribe la función, interpreta la realimentación del compilador y del comparador de bytes, y revisa.
- Iteración multi-ronda: está entrenado para aprovechar rondas de corrección (sus aciertos llegan típicamente entre las rondas 3 y 12).
- Generación de código con restricciones: evita construcciones prohibidas como ensamblador en línea, offsets crudos o direcciones codificadas a mano.
- Cumplimiento de reglas de la tarea: produce candidatos que compilan en el 37% de las respuestas con código, frente al 5% del base.
- Capacidad heredada del modelo base de generación de texto conversacional y respuesta a instrucciones (pipeline text-generation, endpoints_compatible).
- Capacidad multimodal heredada según los tags del repo (image-text-to-text), aunque no se documenta su uso en esta ficha.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente autónomo general: no disponible; el modelo está especializado en el bucle de compilación y comparación.

## Casos de uso

- Reconstrucción de funciones en proyectos de ingeniería inversa: dado el desensamblado de una función de una binary antigua compilada con MSVC 2008, el modelo propone C++03 que, tras compilar y comparar bytes, puede llegar a coincidir exactamente; útil para recuperar código fuente perdido de aplicaciones legacy.
- Verificación de parches en binarios heredados: si se sospecha que una función fue modificada, el modelo permite regenerar candidatos y comprobar si el binario actual se corresponde con una compilación limpia del fuente propuesto.
- Automatización de pipelines de recuperación de código: integrado en un bucle que compile con MSVC 2008 SP1 y compare bytes, el modelo actúa como generador de candidatos dentro de un sistema mayor, aprovechando su entrenamiento para iterar sobre la realimentación.
- Análisis de malware y binarios sospechosos: la reconstrucción de funciones concretas facilita la revisión manual del comportamiento, especialmente en muestras compiladas con toolchains antiguas de Windows.
- Docencia e investigación en compiladores: sirve como banco de pruebas para estudiar hasta qué punto un LLM puede aprender la relación entre fuente y código máquina de un compilador específico y una arquitectura concreta.
- Auditoría de cumplimiento de licencias en software legacy: la recuperación de fuentes permite comparar con repositorios públicos y detectar posibles reutilizaciones de código.
- Investigación sobre razonamiento con realimentación: el modelo es un caso de estudio de entrenamiento con trazas de planificación previa y corrección iterativa, útil para quienes diseñan pipelines de RL o de ajuste supervisado con verificación automática.

## Benchmarks y rendimiento

Conjunto de prueba retenido: 37 funciones de 1 a 4 KB ya emparejadas por colaboradores y ausentes de los datos de entrenamiento (25 de 1 a 2 KB, 12 de 2 a 4 KB). Hasta 12-22 rondas de checker por función, thinking activado, 48K tokens máximos por respuesta, contexto de 128K, 8 sesiones en paralelo sobre una RTX 5090.

| Metrica | Este modelo | Qwen3.8-27B (mismo base, NVFP4) |
|---|---|---|
| Funciones emparejadas | 7 / 37 | 4 / 37 |
| Funciones de 1-2 KB emparejadas | 7 / 25 | 4 / 25 |
| Funciones de 2-4 KB emparejadas | 0 / 12 | 0 / 12 |
| Tokens de salida por respuesta | ~20K | ~41K |
| Minutos por función | ~107 | ~231 |

Desglose de resultados por respuesta en las 37 funciones (504 rondas de checker para este modelo, 519 para el base):

| Resultado de una respuesta | Este modelo | Modelo base |
|---|---|---|
| Compila (candidato comparable) | 37% de las respuestas con código | 5% |
| Error de compilación | 39% | 59% |
| Rechazada por construcción prohibida | 6% | 26% |
| Sin bloque de código en la respuesta | 25% | 7% |
| Respuesta truncada por límite de tokens | 13% | 48% |

Observaciones del autor: cuatro funciones solo las resolvió este modelo y una solo el base (McNemar exacto p = 0,38), por lo que la diferencia es sugerente pero no estadísticamente establecida; el hallazgo sólido es la eficiencia (aproximadamente la mitad de tokens y 2,2 veces más rápido). En un conjunto más difícil de 120 funciones de más de 1 KB sin trazas de entrenamiento, el modelo emparejó 0 de las 19 intentadas antes de detener la ejecución. Ninguno de los dos modelos resolvió funciones de más de 2 KB. Por tamaño, en 1-2 KB el 43% de las respuestas compilan; en 2-4 KB solo el 9% compilan, el 47% son errores de compilación y el 35% no contienen código. De las 37 funciones, 24 usan coma flotante x87 heredada.

## Requisitos de hardware

- GPU de clase Blackwell obligatoria para NVFP4; el autor probó el modelo en una RTX 5090 de 32 GB.
- VRAM estimada: los pesos ocupan aproximadamente 17,9 GB en el repositorio, por lo que el modelo cabe en una GPU consumer de 32 GB; el margen restante debe cubrir la caché KV en FP8 y el contexto largo (hasta 128K en la evaluación).
- No cabe en GPUs consumer de 8, 12, 16 o 24 GB en esta cuantización.
- GPU de datacenter: no disponible en la información proporcionada; las arquitecturas anteriores a Blackwell no soportan NVFP4 de forma nativa.
- Despliegue: vLLM 0.31 según el autor; otras opciones como llama.cpp, Ollama o TGI no están documentadas para este formato.
- Rendimiento observado: 8 sesiones en paralelo en una RTX 5090, con aproximadamente 107 minutos por función en el conjunto de prueba, incluyendo las rondas de compilación y comparación externas.
- Latencia por respuesta: no disponible de forma aislada; el dato de tokens por respuesta (~20K) y minutos por función permite estimar el coste del bucle completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-MSVC9-Matcher-Thinking-NVFP4 (este) | 14.557.547.760 según safetensors (27B nominal) | 128K en evaluación | Reconstrucción C++03 byte-idéntica con thinking | apache-2.0 | HuggingFace, 60 descargas |
| Qwen/Qwen3.8-27B (base, NVFP4) | 27B nominal | no disponible | Generación general; 4/37 en la misma prueba | apache-2.0 (según el repo derivado) | HuggingFace |
| Qwen3.8-27B-MSVC9-Matcher-LoRA (ronda anterior) | no disponible | no disponible | Reconstrucción con thinking desactivado, funciones cortas | no disponible | HuggingFace |

No se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Lanzamiento de investigación: la mayoría de funciones grandes siguen sin resolverse; 0 de 12 funciones de 2-4 KB emparejadas y 0 de 19 en el conjunto difícil de más de 1 KB.
- La ventaja frente al modelo base no es estadísticamente significativa (McNemar p = 0,38); la mejora demostrada es de eficiencia, no de acierto.
- La primera respuesta suele no compilar (27 de 37 casos), por lo que el modelo depende de rondas de realimentación externas con compilador y comparador de bytes.
- En el 25% de las respuestas no genera código (35% en funciones de 2-4 KB) y en el 13% agota el límite de tokens mientras sigue razonando.
- Tiende a inventar declaraciones propias en lugar de usar las proporcionadas en el contexto.
- Especializado en MSVC 2008 SP1 y x86; no se documenta su validez para otras versiones del compilador, otras arquitecturas ni otros lenguajes.
- Solo declara inglés como idioma; no hay evidencia de comportamiento en castellano ni en otras lenguas.
- Riesgo de alucinación relevante: puede producir código plausible que no corresponde al desensamblado; toda salida debe validarse con compilación y comparación de bytes.
- Requiere hardware Blackwell; no es desplegable en GPUs anteriores sin recuantizar.
- Los datos de entrenamiento no se publican, lo que limita la reproducibilidad y la auditoría de sesgos.
- Licencia apache-2.0 permite uso comercial, pero el modelo base y las condiciones de la plataforma comunitaria de origen de los datos deberían revisarse antes de un uso en producción.
- El nombre del repositorio indica 27B mientras que safetensors reporta 14.557.547.760 parámetros; conviene verificar la configuración real antes de dimensionar el despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/momusdigital/Qwen3.8-27B-MSVC9-Matcher-Thinking-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Ronda anterior (LoRA): https://huggingface.co/momusdigital/Qwen3.8-27B-MSVC9-Matcher-LoRA
- Paper, blog, repositorio o demo adicionales: no disponible en la información proporcionada.
