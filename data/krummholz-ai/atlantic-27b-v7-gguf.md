# krummholz-ai/atlantic-27b-v7-GGUF

## Resumen

Atlantic 27B v7 es un modelo de lenguaje y vision de tipo denso desarrollado por Krummholz AI LLC (Belfast, Maine, Estados Unidos), publicado como beta el 9 de noviembre de 2026. Se trata de un ajuste fino (LoRA supervisado, seguido de entrenamiento de preferencias y una ronda de RL a partir de retroalimentación de IA) sobre el modelo base Qwen/Qwen3.8-27B, que aporta una arquitectura hibrida de 64 capas con atencion lineal Gated DeltaNet en tres de cada cuatro capas, un codificador visual y una ventana de contexto de 262 000 tokens. El modelo cuenta con 26 895 998 464 parametros (aproximadamente 27B) y se distribuye en formato GGUF con cuantizaciones de 3 a 8 bits.

El modelo esta disenado para uso general: preguntas, redaccion, explicaciones, planificacion y lectura de documentos, con enfasis declarado en historia y actualidad respondidas de forma directa, presentacion de disputas territoriales con criterios homogeneos y uso de herramientas (calculadora, busqueda web, captura de paginas). Krummholz posiciona Atlantic como la base de la que se destilaran sus modelos verticales Acadia (atencion al cliente) y Katahdin (silvicultura y pesca).

La relevancia actual del lanzamiento radica en tres factores: es un ajuste afinado sobre una arquitectura hibrida de atencion lineal poco comun en modelos de 27B, incluye una divulgacion explicita de datos de entrenamiento (con reconocimiento de que un 29 % de los ejemplos supervisados de matematicas y codigo fueron generados por DeepSeek-R1, lo que incumple su propia politica de entrenar solo con modelos abiertos estadounidenses) y se publica bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. La model card advierte de que se trata de una beta con respuestas erroneas confiadas y de que su rendimiento optimo depende de las compuertas del runtime propietario de Krummholz, ausentes en un GGUF cargado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal Gated DeltaNet (3 de cada 4 capas) y atencion completa en el resto; 64 capas; codificador visual incluido |
| Parametros totales | 26 895 998 464 (aproximadamente 27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | Q3_K_M (13,3 GB), IQ4_XS (15,2 GB), Q4_K_M (16,5 GB), Q6_K (22,1 GB), Q8_0 (28,6 GB); proyector visual en f16 (0,9 GB) |
| Idiomas soportados | Ingles (principal); datos de entrenamiento menores en espanol, hebreo, frances y mandarin, no evaluados |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero mmproj separado para vision) |

## Arquitectura y entrenamiento

Atlantic 27B v7 hereda la arquitectura del modelo base Qwen/Qwen3.8-27B: un transformer denso de 27B parametros y 64 capas en el que tres de cada cuatro capas emplean Gated DeltaNet, un mecanismo de atencion lineal, mientras que el resto mantiene atencion completa. Esta combinacion busca reducir el coste computacional del contexto largo (262 000 tokens) sin renunciar por completo a la atencion cuadratica. El modelo incorpora ademas un codificador visual que permite la entrada de imagenes, aunque Krummholz declara no haber modificado ni evaluado esa ruta.

El ajuste de Krummholz consiste en un LoRA sobre el modelo de lenguaje, entrenado primero de forma supervisada y despues con entrenamiento de preferencias, seguido de una ronda de aprendizaje por refuerzo a partir de retroalimentacion de IA (RLAIF round 1) y fusionado en los pesos base antes de la conversion a GGUF. En la ronda RLAIF, Atlantic respondio 3600 prompts cuatro veces cada uno; un modelo juez puntuo cada respuesta contra las directrices escritas de Krummholz y las mejores y peores respuestas de cada prompt se convirtieron en pares de preferencia. El conjunto supervisado de v7 comprende 39 517 ejemplos, de los cuales 7559 soluciones de matematicas y 3795 de codigo (aproximadamente el 29 %) proceden de los datasets OpenMathReasoning y OpenCodeReasoning de NVIDIA y fueron escritos por DeepSeek-R1, con 23 soluciones matematicas adicionales de QwQ-32B; Krummholz reconoce que ese filtrado incumplio su politica de entrenar solo con texto de modelos abiertos estadounidenses y anuncia que la proxima version prescindira de ellos. El profesor para texto generado paso de OLMo 3 7B a OLMo 3.1 32B. Entre los cambios de v7 figuran ejemplos constitucionales y de resistencia a la presion del usuario, paquetes de historia y territorialidad reconstruidos, datos de identidad actualizados y un pequeno conjunto multilingue.

## Capacidades

- Generacion de texto conversacional en ingles: preguntas, redaccion, explicaciones y planificacion.
- Razonamiento matematico y de codigo, reforzado con ejemplos de OpenMathReasoning y OpenCodeReasoning.
- Entrada de imagenes y salida de texto (pipeline image-text-to-text), mediante la ruta visual del modelo base, no evaluada por Krummholz.
- Uso de herramientas (tool calling): el modelo escribe llamadas a calculadora para aritmetica y fechas, y a busqueda web y captura de paginas para datos que pueden haber cambiado; requiere un runtime que ejecute las llamadas.
- Respuestas sobre historia y actualidad, incluidas materias en las que el modelo base tiende a rechazar o repetir una linea oficial, con mejor resultado dentro del runtime de Krummholz.
- Presentacion de disputas territoriales lado a lado con el mismo criterio para todas ellas.
- Capacidad de mantener una respuesta correcta ante la presion del usuario (ejemplos de pushback en el entrenamiento).
- Multilingue limitado: datos menores en espanol, hebreo, frances y mandarin, sin evaluacion publicada.
- Compatibilidad con endpoints (tag endpoints_compatible) para despliegue como servicio.

## Casos de uso

- Atencion al cliente automatizada: gestion de conversaciones multi-turno con documentos adjuntos gracias a la ventana de 262 000 tokens; es la base declarada del modelo vertical Acadia de Krummholz, aunque para produccion conviene validar el comportamiento fuera del runtime propietario.
- Asistente de escritorio con GPU de consumo: el fichero Q4_K_M (16,5 GB) esta pensado para tarjetas de 24 GB, lo que permite ejecutar un modelo de 27B con vision en un equipo local mediante llama.cpp u Ollama.
- Analisis de documentos largos: informes, expedientes o transcripciones que caben en el contexto de 262K tokens, con salida de resumen o extraccion en ingles.
- Razonamiento matematico asistido: resolucion de problemas paso a paso, apoyada en los ejemplos de OpenMathReasoning del entrenamiento y en la llamada a calculadora cuando el runtime la proporciona.
- Generacion y revision de codigo: el modelo incorpora ejemplos de OpenCodeReasoning y puede integrarse en flujos de asistencia a la programacion; conviene verificar el codigo antes de llevarlo a produccion por el riesgo de alucinacion declarado.
- Consulta de actualidad con busqueda web: dentro de un runtime que exponga la herramienta de busqueda y captura de paginas, el modelo formula las llamadas y sintetiza resultados para preguntas cuyo dato puede haber cambiado.
- Divulgacion sobre disputas territoriales: generacion de resumenes que presentan las posiciones de las partes con un criterio uniforme, util en contextos editoriales o educativos.
- Procesamiento de imagenes con texto asociado: descripcion o extraccion de informacion de capturas y documentos escaneados, asumiendo que la ruta visual no ha sido evaluada por el desarrollador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una seccion de evaluacion y un objetivo de tasa de alucinacion inferior al 1 %, pero lo describe explicitamente como objetivo y no como resultado, y no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba.

## Requisitos de hardware

- VRAM estimada para inferencia (sin contar el contexto, que anade varios GB adicionales):
  - Q3_K_M: 13,3 GB, para tarjetas de 16 GB; es la opcion con mayor perdida de calidad.
  - IQ4_XS: 15,2 GB, para tarjetas de 16 a 20 GB.
  - Q4_K_M: 16,5 GB, recomendada por el autor para tarjetas de 24 GB y la mayoria de estaciones de trabajo.
  - Q6_K: 22,1 GB, para tarjetas de 32 GB o superiores; cercana al modelo evaluado.
  - Q8_0: 28,6 GB, para tarjetas de 48 GB o Macs con memoria unificada grande; la mas proxima al modelo evaluado.
- Proyector visual: 0,9 GB adicionales en f16, necesarios solo para entrada de imagenes.
- GPU recomendadas: el autor cita tarjetas de consumo de 16, 24, 32 y 48 GB; no se especifican modelos concretos como A100, H100 o RTX 4090 en la informacion disponible.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas segun la cuantizacion; en Mac, en memoria unificada.
- Opciones de despliegue: formato GGUF, compatible con llama.cpp y derivados (Ollama, entre otros); el tag endpoints_compatible sugiere despliegue como endpoint. No se detallan integraciones con vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Atlantic 27B v7 | 27B densos | 262K | Hibrida con Gated DeltaNet, vision | Apache 2.0 | Beta; ajuste de Krummholz sobre Qwen3.8-27B; GGUF de 13,3 a 28,6 GB |
| Qwen/Qwen3.8-27B (base) | 27B densos | 262K | Hibrida con Gated DeltaNet, vision | Apache 2.0 | Modelo original sin el ajuste de Krummholz ni sus compuertas de runtime |
| OLMo 3.1 32B | 32B | No disponible en la informacion | No disponible | No disponible en la informacion | Usado como profesor de texto generado en el entrenamiento de v7; no es una alternativa de despliegue equivalente |
| DeepSeek-R1 | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | Genero parte de los ejemplos de matematicas y codigo del entrenamiento; no es comparable como sustituto directo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Version beta: el autor advierte de que el modelo comete errores, incluidas respuestas erroneas con tono seguro, y recomienda verificar cualquier dato relevante.
- Dependencia del runtime: las compuertas de Krummholz (pasajes de enciclopedia para historia, reescritura de frases de linea oficial, regeneracion ante fallos de comprobacion) no existen en un GGUF cargado por separado, por lo que el comportamiento fuera de ese entorno puede diferir del evaluado.
- Alucinacion: el objetivo de menos del 1 % es una meta declarada, no un resultado medido; no hay cifras publicadas.
- Idiomas: solo se evaluo el ingles; el espanol, hebreo, frances y mandarin tienen datos residuales sin evaluacion, por lo que no son aptos para usos criticos.
- Vision no evaluada: la ruta de imagenes proviene del modelo base y Krummholz no la modifico ni la evaluo; no deben tomarse decisiones basadas en imagenes.
- Usos excluidos: decisiones medicas, legales, financieras o de seguridad sin supervision de un profesional cualificado.
- Procedencia de datos: aproximadamente el 29 % de los ejemplos supervisados de matematicas y codigo fueron generados por DeepSeek-R1 (y 23 por QwQ-32B), lo que contraviene la politica declarada del desarrollador; afecta a contenido de razonamiento, no a material politico o de identidad, y se corregira en la proxima version.
- Licencia: Apache 2.0 permite uso comercial, pero el fichero LICENSE-base.txt del repositorio corresponde a la licencia del modelo base y debe revisarse junto con los terminos de Qwen.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible; el enfasis en historia y territorialidad con criterios editoriales propios exige revision humana en contextos sensibles.
- Sin adopcion verificable: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia externa de calidad en uso real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/krummholz-ai/atlantic-27b-v7-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset OpenMathReasoning (NVIDIA): no disponible en la informacion proporcionada
- Dataset OpenCodeReasoning (NVIDIA): no disponible en la informacion proporcionada
- Modelo OLMo 3.1 32B (profesor de texto): no disponible en la informacion proporcionada
- Contacto del desarrollador: info@krummholz.ai
