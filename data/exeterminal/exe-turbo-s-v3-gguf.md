# exeterminal/Exe-Turbo-S-V3-GGUF

## Resumen

Exe-Turbo-S-V3 es un modelo de lenguaje especializado en el uso de terminales y herramientas de línea de comandos, desarrollado por el equipo de Exe AI Terminal. Está diseñado para ejecutarse en portátiles con 6-8 GB de memoria, aprovechando una arquitectura de mezcla de expertos (MoE) con 8,47 mil millones de parámetros totales, de los cuales solo 1,5 mil millones se activan por token. El modelo se basa en LiquidAI/LFM2.5-8B-A1B, un modelo base con una ventana de contexto de 128k tokens, y se distribuye en formato GGUF para su uso con llama.cpp y servidores compatibles con OpenAI.

La relevancia de este modelo radica en su enfoque extremadamente especializado: en lugar de ser un chatbot de propósito general, está entrenado para comprender el entorno de un terminal, las herramientas disponibles, sus parámetros y las reglas de uso, lo que le permite tomar decisiones precisas en tareas de agente. Su versión v3 introduce mejoras en casos conflictivos y defensa contra inyección de prompts, logrando 78 de 101 casos de prueba en un conjunto de evaluación específico de terminal, frente a los 52 del modelo base sin entrenar.

La licencia es lfm1.0, una licencia propietaria de Liquid AI, y el modelo solo soporta inglés como idioma principal, con degradación notable en otros idiomas para tareas de prosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre base LiquidAI/LFM2.5-8B-A1B |
| Parametros totales | 8.467.856.832 (8,47 B) |
| Parametros activos | 1,5 B por token |
| Longitud de contexto | 128k tokens (heredado del base) |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, IQ3_M (todos en GGUF) |
| Idiomas soportados | en (inglés) |
| Licencia | lfm1.0 (licencia propietaria de Liquid AI) |
| Formato de pesos | GGUF (con matriz de importancia) |

## Arquitectura y entrenamiento

El modelo base LiquidAI/LFM2.5-8B-A1B emplea una arquitectura de mezcla de expertos con proyecciones de atención y convolución corta (short-convolution) en el camino que cada token atraviesa. El router que decide qué expertos activar fue excluido deliberadamente del entrenamiento del adaptador. Sobre esta base se entrenó un adaptador LoRA con rango 16 y alpha 16, con la pérdida calculada únicamente sobre las respuestas (el prompt se enmascara), de modo que el modelo aprenda el comportamiento y no la memorización del prompt. El entrenamiento se detuvo de forma temprana, antes de que el adaptador comenzara a copiar secuencias de tokens en lugar de aprender reglas; este criterio de parada ganó una prueba A/B frente a entrenar hasta la menor pérdida de validación. El adaptador se fusionó de nuevo en el modelo base en bf16 y todas las cuantizaciones se generan a partir de ese modelo fusionado. El número de parámetros entrenables es de 5,7 millones. No se especifica el tamaño ni la composición del dataset de entrenamiento, pero la evaluación se realiza sobre 101 casos de terminal retenidos, con criterio de pasar tres ejecuciones consecutivas (pass^3).

## Capacidades

- Agente de terminal: el modelo selecciona la herramienta adecuada (lectura de archivos, ejecución de comandos en segundo plano, etc.) en lugar de improvisar con comandos de shell.
- Uso de herramientas (tool use): comprende esquemas de herramientas y sus parámetros, integrándose con servidores compatibles con OpenAI (llama-server y similares).
- Razonamiento multi-paso: ejecuta cadenas de acciones largas sin detenerse tras el primer paso.
- Defensa contra inyección de prompts: trata el texto devuelto por herramientas o contenido de archivos como datos, no como instrucciones.
- Ejecución de comandos en segundo plano: inicia procesos largos en background para evitar bloqueos.
- Detección de entornos de proyecto: identifica el entorno Python específico del proyecto.
- Chat conversacional básico: funciona como asistente de chat con temperatura recomendada de 0.1 a 0.7, aunque su especialidad es el uso de terminal.
- No soporta vision, audio ni otros modalidades; es exclusivamente texto.

## Casos de uso

- Automatización de tareas de administración de sistemas: el modelo puede leer archivos de configuración, ejecutar comandos de mantenimiento y gestionar procesos en segundo plano, todo dentro de una sesión de terminal con herramientas definidas.
- Asistente de desarrollo en línea de comandos: ayuda a programadores a navegar proyectos, ejecutar tests, gestionar entornos virtuales y depurar errores, usando las herramientas del terminal en lugar de generar comandos ad hoc.
- Defensa contra inyección de prompts en pipelines de datos: al tratar contenido externo (archivos, respuestas web) como datos, es adecuado para entornos donde se procesan entradas no confiables.
- Ejecución de flujos de trabajo multi-paso: puede llevar a cabo secuencias de operaciones (por ejemplo, compilar, probar y desplegar) sin intervención humana, gracias a su capacidad de razonamiento encadenado.
- Integración en asistentes de terminal personalizados: como modelo de chat tras un servidor OpenAI-compatible, puede ser el cerebro de una interfaz de terminal que ejecuta comandos bajo supervisión del usuario.
- Educación y formación en línea de comandos: puede explicar comandos, sugerir alternativas y demostrar buenas prácticas de terminal, aunque su rendimiento en prosa fuera del ámbito técnico es limitado.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación sobre un conjunto propio de 101 casos de terminal, con criterio de pasar tres ejecuciones consecutivas. No se publican benchmarks estándar como MMLU, HumanEval o GSM8K. Los resultados son los siguientes:

| Versión | Casos superados (de 101) |
|---|---:|
| Base sin entrenar | 52 |
| v1 | 66 |
| v2 | 76 |
| v3 (f16, temp 0.1) | 78 |

Efecto de la temperatura en v3 (f16, sobre los 101 casos):

| Temperatura | Casos superados |
|---|---:|
| 0.1 | 78 |
| 0.4 | 71 |
| 0.7 | 69 |
| 1.0 | 64 |

Rendimiento por cuantización (todos medidos con el mismo conjunto y regla pass^3):

| Archivo GGUF | Bits | Tamaño | Casos superados |
|---|---|---|---:|
| f16 | 16 | 16.9 GB | 78 |
| Q8_0 | 8 | 9.0 GB | 75 |
| Q6_K | 6.5 | 7.0 GB | 77 |
| Q5_K_M | 5.5 | 6.0 GB | 73 |
| Q4_K_M (recomendado) | 4.8 | 5.2 GB | 73 |
| Q4_K_S | 4.5 | 4.9 GB | 73 |
| IQ4_XS | 4.25 | 4.6 GB | 71 |
| IQ3_M (mínimo) | 3.66 | 3.8 GB | 70 |

## Requisitos de hardware

- Pensado para portátiles con 6-8 GB de memoria total (RAM o VRAM compartida).
- La cuantización recomendada Q4_K_M ocupa 5.2 GB en disco y es la mejor relación tamaño/rendimiento para esa memoria.
- Q6_K (7.0 GB) es la opción preferida si se dispone de al menos 8 GB de espacio libre.
- IQ3_M (3.8 GB) es el límite inferior; por debajo de 4 bits el modelo degrada notablemente la prosa en idiomas distintos del inglés.
- Se puede ejecutar con llama.cpp, llama-server o cualquier servidor compatible con OpenAI que soporte GGUF.
- No hay datos de latencia o throughput específicos; al ser un MoE con solo 1.5B activos por token, la inferencia es considerablemente más rápida que un modelo denso del mismo tamaño total.
- No se requiere GPU dedicada; puede funcionar en CPU con memoria unificada, aunque una GPU con 6-8 GB de VRAM mejora la velocidad.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (especialistas en terminal con arquitectura MoE y tamaño similar). La model card solo compara el modelo con su base sin entrenar, por lo que no se puede ofrecer una comparativa objetiva con alternativas como CodeLlama, DeepSeek-Coder o Qwen-Coder en este contexto. Se indica "no disponible".

## Limitaciones y advertencias

- Es un modelo especializado: fuera del uso de terminal con herramientas, se comporta como el modelo base con un "acento" leve; no debe usarse para chat general de alta calidad.
- Solo soporta inglés de forma fiable; en otros idiomas la prosa se degrada notablemente, especialmente en cuantizaciones por debajo de 4 bits.
- Limitaciones honestas declaradas por el autor: actúa con demasiada frecuencia a través de límites de carpetas compartidas (2 de 5 casos), falla en nombrar un error en lugar de reintentar silenciosamente (3 de 5) y tiene un conocimiento limitado de sus propios límites de salida (2 de 5).
- Riesgo de alucinación en tareas no relacionadas con terminal, como cualquier modelo de lenguaje.
- La licencia lfm1.0 es propietaria; se debe revisar el texto completo de la licencia en el enlace proporcionado para conocer las restricciones de uso comercial.
- No se proporcionan datos sobre sesgos o seguridad más allá de la defensa contra inyección de prompts.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo muy reciente o de baja adopción; se recomienda verificar su fiabilidad antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/exeterminal/Exe-Turbo-S-V3-GGUF
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B/blob/main/LICENSE
- Sitio web de Exe AI Terminal: https://exe-hq.net
