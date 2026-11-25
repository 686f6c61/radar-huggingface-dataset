# hanemay/smartsightCoach

## Resumen

SmartSight Coach es un ajuste fino mediante LoRA del checkpoint cuantizado de Google `google/gemma-4-E2B-it-qat-q4_0-unquantized`, orientado a construir un entrenador personal de fitness y nutrición que se ejecuta íntegramente en el dispositivo (Android/iOS) sin cuentas ni llamadas a servidor. Lo mantiene Niclas Bade y se distribuye en formato `.litertlm` para inferencia con LiteRT-LM. El repositorio alberga los checkpoints LoRA vigentes junto con hitos anteriores superados, y el modelo base cambió en la versión v42 (12 de agosto de 2026) desde `google/gemma-4-E2B-it` hacia la variante con entrenamiento consciente de cuantización (QAT), cuyos pesos están condicionados para sobrevivir al redondeo a 4 bits.

El modelo declara 5.123.178.051 parámetros totales en safetensors y un repositorio de 22,8 GB. La arquitectura subyacente es la de Gemma 4 E2B, un transformer con tablas de embeddings de vocabulario muy grandes (262.144 tokens) y una torre de visión en entrenamiento progresivo. La innovación más destacable documentada es la poda del vocabulario en el export: el archivo campeón `smart-coach-vision.litertlm` (v243) pasó de 2,80 GB a 1,56 GB eliminando filas de las dos tablas de embeddings correspondientes a idiomas y símbolos no soportados, sin retocar ningún peso entrenado.

Es relevante porque demuestra un flujo completo de despliegue on-device con cuantización int4/int8, poda de vocabulario selectiva y validación por conjuntos de prueba cerrados, un patrón poco frecuente en modelos de nicho publicados en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E2B) con torre de visión; export a LiteRT-LM |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 e int8 en el export `.litertlm`; base con QAT q4_0 |
| Idiomas soportados | Ingles, danes, aleman, sueco, noruego, espanol y frances (seleccion de tokens); chino comun parcial |
| Licencia | cc0-1.0 |
| Formato de pesos | safetensors (repo) y `.litertlm` (inferencia movil) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E2B, un transformer denso con dos tablas de embeddings de gran tamano: una de embedding de tokens (262.144 filas × 1.536 valores) y otra de embedding por capa (262.144 filas × 8.960 valores). Sobre esa base se aplica un ajuste fino LoRA y, en la fase de export, una poda del vocabulario que conserva 59.264 de las 262.144 filas (22,6 %). De los 1.951 tensores del checkpoint, 1.949 quedan byte a byte idénticos al campeón del 7 de noviembre de 2026; solo cambian las dos tablas de vocabulario, y las filas conservadas mantienen exactamente sus valores originales.

La selección de tokens conservados se guía por criterios explícitos: cualquier texto del conjunto de entrenamiento, de las suites de prueba y de las cadenas de la aplicación; el alfabeto y la puntuación completos de cada idioma soportado; todos los tokens que el campeón anterior generó en su batería de pruebas (2.032 respuestas sobre fotos de grasa corporal, fotos no corporales, etiquetas nutricionales, fragmentos de vídeo de series, chat de entrenamiento y preguntas de conocimiento); y las piezas menores que el tokenizador usa para construir los tokens conservados (verificado sobre 413.629 cadenas con tokenización idéntica). El recuento final se fuerza a ser divisible por 4 por requisito del muestreador de la GPU del teléfono. El entrenamiento de la torre de visión se realiza superficie por superficie (grasa corporal, fotos de comidas, lectura de etiquetas nutricionales) con validación contra datos reservados antes de publicar.

## Capacidades

- Generación de texto conversacional en ocho idiomas para coaching de fitness y nutrición.
- Razonamiento y respuesta a preguntas de conocimiento dentro del dominio de entrenamiento y nutrición.
- Visión: estimación de grasa corporal a partir de fotos, análisis de fotos de comidas y lectura de etiquetas nutricionales.
- Procesamiento de fragmentos de vídeo de series (set-video chunks).
- Ejecución completamente on-device, sin cuenta ni ida y vuelta al servidor.
- Inferencia en Android e iOS mediante LiteRT-LM con pesos int4/int8.
- Lectura de idiomas no soportados por fallback a bytes crudos, sin garantía de calidad en la respuesta.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Entrenador personal embebido en aplicación móvil: el modelo gestiona conversaciones de coaching directamente en el teléfono, sin backend, lo que elimina costes de servidor y problemas de privacidad al no salir los datos del dispositivo.
- Estimación de grasa corporal por foto: la torre de visión evalúa imágenes corporales del usuario y devuelve una estimación, validada contra datos reservados en cada ronda de entrenamiento.
- Análisis de fotos de comidas: el modelo identifica el contenido de un plato fotografiado y lo usa como base para el seguimiento nutricional dentro de la aplicación.
- Lectura de etiquetas nutricionales: extrae información de la etiqueta fotografiada (por ejemplo, el valor ENERGY al inicio de línea) para registrar macronutrientes sin entrada manual.
- Seguimiento de series de ejercicio por vídeo: procesa fragmentos de vídeo de series y responde sobre ellos, con lectura verificada en los ocho idiomas soportados.
- Asistente multilingüe de nutrición para mercados europeos: cubre inglés, danés, alemán, sueco, noruego, español y francés con alfabeto y puntuación completos en el vocabulario conservado.
- Despliegue en dispositivos de gama media sin GPU dedicada: el archivo de 1,56 GB con cuantización int4/int8 está pensado para ejecutarse en el hardware del teléfono, no en servidores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card documenta métricas internas de validación:

| Prueba interna | Resultado |
|---|---|
| Respuestas del campeón cubiertas por el vocabulario podado | 2.032 respuestas, cobertura completa verificada |
| Tokenización tras poda | idéntica token a token en 413.629 cadenas |
| Lectura de set-video en ocho idiomas | 80 respuestas por archivo; todas parsean; 37 idénticas carácter a carácter al archivo mayor |
| Lectura de etiquetas nutricionales (intento fallido previo) | cayó de 29 a 27 aceptadas de 32 con poda agresiva; descartado |
| Tensores sin cambios respecto al campeón previo | 1.949 de 1.951 |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario objetivo (ejecución en teléfono); el archivo `.litertlm` campeón ocupa 1.557.605.280 bytes (1,56 GB) con cuantización int4/int8.
- GPU recomendadas: no disponible; el destino es la GPU integrada del dispositivo móvil mediante LiteRT-LM.
- Cabe en GPU de consumo: no disponible como dato medido; el tamaño del archivo (1,56 GB) es compatible con memoria unificada de móviles de gama media-alta, pero no se documentan pruebas en RTX 4090, A100 o H100.
- Opciones de despliegue: LiteRT-LM en Android e iOS; vLLM, llama.cpp, Ollama y TGI no están documentados para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Enfoque |
|---|---|---|---|---|---|
| SmartSight Coach (este) | 5.123.178.051 | no disponible | `.litertlm`, on-device | cc0-1.0 | Coach de fitness y nutrición con visión |
| google/gemma-4-E2B-it-qat-q4_0-unquantized | no disponible | no disponible | safetensors | licencia de Gemma (no verificada en esta ficha) | Modelo base generalista con QAT |
| google/gemma-4-E2B-it | no disponible | no disponible | safetensors | licencia de Gemma (no verificada en esta ficha) | Modelo base generalista previo al QAT |
| Alternativas on-device de fitness: no disponible | — | — | — | — | — |

## Limitaciones y advertencias

- El vocabulario podado impide generar tokens eliminados: palabras raras se reconstruyen a partir de piezas menores, lo que ocasionalmente produce una palabra ligeramente incorrecta.
- Los idiomas no soportados pueden leerse por fallback a bytes crudos, pero no se espera una respuesta de calidad en ellos.
- El dominio está acotado a fitness, nutrición y lectura de etiquetas; no hay evidencia de rendimiento generalista fuera de ese ámbito.
- La torre de visión está en entrenamiento progresivo por superficies; las capacidades visuales publicadas son las validadas hasta la fecha, no un conjunto completo.
- Riesgo de alucinación: no cuantificado en la información disponible; en un contexto de salud y nutrición conviene tratar las estimaciones como orientativas.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia cc0-1.0 permite uso comercial sin atribución, pero el modelo base Gemma puede arrastrar condiciones adicionales que no se detallan en la model card.
- Los archivos de versiones anteriores se conservan por historial; no todos los candidatos probados se publican y las rondas descartadas solo se documentan internamente.
- El recuento de tokens debe ser divisible por 4 por requisito del muestreador de la GPU móvil; alterar el export sin respetar esa regla produce texto corrupto, como se documenta en los intentos fallidos del mismo día.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hanemay/smartsightCoach
- Página del producto: https://www.smartsight.app/ai-coach
- Perfil del autor: https://www.linkedin.com/in/niclas-bade/
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
- Paper, blog técnico o repositorio adicional: no disponible en la información proporcionada.
