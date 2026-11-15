# oyekamal/taleemabad-offline-teacher-coach-2b

## Resumen

Taleemabad Offline Teacher Coach 2B es un modelo de lenguaje de 1.881.825.088 parámetros (aproximadamente 1,88 mil millones) desarrollado por el equipo de innovación de Taleemabad en Islamabad. Se trata de un ajuste fino del modelo base Qwen/Qwen3.5-2B, especializado en la formación y acompañamiento (coaching) de docentes de educación primaria en Pakistán. El modelo resuelve un problema muy concreto: ofrecer orientación pedagógica accionable a profesores que trabajan en entornos con conectividad limitada, ejecutándose íntegramente en un teléfono Android de gama media sin conexión a internet.

La propuesta diferencial es la privacidad y la operatividad offline: nada de lo que escribe el docente sale del dispositivo. El modelo acepta consultas en inglés, urdu (escritura nastaliq) y roman urdu, y responde en el mismo idioma y escritura con una única acción concreta para el día siguiente, siguiendo el manual de coaching de Taleemabad. Se distribuye en formato GGUF cuantizado Q4_K_M (1,27 GB) para su uso con llama.cpp.

El modelo se ha entrenado en dos etapas (SFT y DPO on-policy) sobre unos 3.100 intercambios sintéticos y anonimizados, y se ha evaluado sobre 61 escenarios no vistos con tres compuertas automáticas de seguridad pedagógica. Es relevante ahora porque demuestra que un modelo de menos de 2B parámetros, cuidadosamente alineado, puede ofrecer asistencia educativa útil y segura en contextos de bajos recursos y conectividad intermitente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles internos de la arquitectura base no disponibles) |
| Parámetros totales | 1.881.825.088 (≈1,88 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (contexto de referencia en el ejemplo de uso con `-c 2048`); contexto máximo del modelo base no disponible |
| Tipos de cuantización | Q4_K_M (única publicada en el repositorio) |
| Idiomas soportados | Inglés (en), urdu (ur) y roman urdu |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`coach-q4_k_m.gguf`, 1,27 GB) |
| Librería | llama.cpp (build b12144 o superior, con soporte de arquitectura qwen35) |
| Tamaño del repositorio | 1,3 GB |
| Modelo base | Qwen/Qwen3.5-2B |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer de aproximadamente 1,88 mil millones de parámetros. Sobre esa base se aplicaron dos etapas de ajuste con LoRA a 16 bits en una única GPU Colab L4. La model card advierte explícitamente que QLoRA no se recomienda para Qwen3.5, por lo que el ajuste se realizó en precisión de 16 bits. La primera etapa fue un ajuste supervisado (SFT) sobre aproximadamente 3.100 intercambios de coaching docente redactados conforme al manual de Taleemabad, en inglés, urdu (nastaliq) y roman urdu. Cada ejemplo se emparejó con las notas del manual que la aplicación recuperaría en el dispositivo, de modo que el prompt de entrenamiento y el prompt real del teléfono coinciden byte a byte.

La segunda etapa consistió en DPO on-policy con 394 pares de preferencia muestreados de las propias respuestas del modelo y etiquetados contra las reglas de prohibición del manual (no avergonzar, no clasificar, no leer puntuaciones en voz alta, no saltarse la práctica, no mover a un niño de grupo por un solo día bueno). El delta aprendido se fusionó a un cuarto de su intensidad, ya que el DPO a plena potencia sobreoptimizaba y generaba respuestas que agotaban el límite de tokens. Los escenarios de entrenamiento son sintéticos y anonimizados, sin docentes, niños, escuelas ni teléfonos reales, y se filtró la superposición léxica con los 61 escenarios de evaluación. El sistema completo en producción combina el modelo con una recuperación en el dispositivo (BM25 más un índice doc2query sobre el manual) que inserta dos o tres notas y un ejemplo resuelto en el prompt de sistema.

## Capacidades

- Generación de texto conversacional orientada a la resolución de problemas concretos de aula en educación primaria.
- Respuesta en el mismo idioma y escritura que la consulta: inglés, urdu en escritura nastaliq o roman urdu.
- Formulación de una única acción concreta para el día siguiente, con las palabras exactas que el docente debe decir o los pasos a seguir.
- Cumplimiento de reglas de seguridad pedagógica: no avergonzar, no clasificar, no leer puntuaciones en voz alta, no saltar la práctica ni la comprobación de salida, no mover a un niño de grupo por un solo día bueno.
- Formulación de como máximo una pregunta aclaratoria, y solo si falta un dato clave.
- Funcionamiento íntegramente offline en el dispositivo, sin conexión ni cuenta.
- Integración con un pipeline de recuperación de notas del manual (BM25 + doc2query) que condiciona la respuesta.
- No dispone de tool calling, function calling, visión, audio ni modo de razonamiento extendido según la información disponible.

## Casos de uso

- Acompañamiento docente en aulas con conectividad limitada: el modelo se ejecuta en un teléfono Android de gama media y ofrece orientación pedagógica sin conexión, lo que permite su uso en escuelas rurales de Balochistán y otras regiones con internet intermitente.
- Corrección de errores de lectoescritura en el aula: un docente describe un problema concreto (por ejemplo, que los niños confunden el sonido /b/ con el nombre de la letra) y el modelo devuelve una acción de cinco minutos con las palabras exactas a emplear.
- Formación inicial de docentes noveles: el modelo actúa como entrenador de bolsillo que traduce el manual de Taleemabad en pasos accionables para el día siguiente, reduciendo la dependencia de formadores presenciales.
- Soporte multilingüe en contextos multilingües de Pakistán: permite al docente consultar en inglés, urdu o roman urdu según su comodidad, manteniendo la coherencia del idioma en la respuesta.
- Distribución en entornos escolares sin infraestructura: el archivo GGUF se puede compartir por Nearby Share o USB entre dispositivos, lo que facilita el despliegue en colegios sin acceso a tiendas de aplicaciones ni descargas dentro de la app.
- Adaptación de manuales de coaching a modelos on-device: equipos de otras organizaciones educativas pueden reutilizar la receta (SFT + DPO con notas recuperadas en el prompt) para portar su propio manual a un modelo pequeño ejecutable en dispositivo.
- Evaluación y control de calidad pedagógica: el arnés de evaluación con compuertas automáticas (escritura correcta, ninguna regla rota, paso concreto) sirve como referencia para medir la seguridad de asistentes educativos.

## Benchmarks y rendimiento

Evaluación sobre 61 escenarios no vistos, con tres compuertas automáticas juzgadas por un modelo independiente que nunca vio el entrenamiento, media de tres ejecuciones:

| Compuerta | Puntuación | Umbral |
|---|---|---|
| Las tres comprobaciones pasan (escritura correcta, ninguna regla rota, paso concreto) | 95,6 % | 95 % |
| Ninguna regla de prohibición rota (avergonzar, clasificar, puntuaciones en voz alta, saltar práctica, mover a un niño en un día) | 95,6 % | 97 % |
| Ofrece un paso concreto | 100 % | — |

Comparación cara a cara contra las respuestas de un modelo frontera a los mismos 61 escenarios, a ciegas y en ambos órdenes: el modelo pequeño gana o empata en 13 de 61. Las respuestas de referencia del propio manual obtienen un 98,9 % en las mismas compuertas, por lo que el listón se sitúa justo por debajo del nivel frontera. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,6 GB de RAM a contexto de 2.048 tokens con cuantización Q4_K_M.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU en dispositivos móviles. En escritorio puede ejecutarse en CPU con llama.cpp.
- Cabe en GPU de consumo: sí, con holgura en cualquier GPU con 2 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050 en adelante), aunque el caso de uso previsto es CPU móvil.
- Despliegue: llama.cpp (build b12144 o superior con soporte de arquitectura qwen35), mediante `llama-cli` u otras herramientas compatibles. No se mencionan vLLM, TGI, Ollama ni otros motores en la información disponible.
- Rendimiento en dispositivo: 8 a 15 tokens por segundo en chips Android de gama media de 2023.
- Latencia y throughput en servidor: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| Taleemabad Offline Teacher Coach 2B | ≈1,88 B | 2.048 (referencia) | en, ur, roman urdu | Apache 2.0 | GGUF Q4_K_M | Coaching docente offline |
| Qwen/Qwen3.5-2B (base) | ≈1,88 B | No disponible | Multilingüe (no detallado) | Apache 2.0 | Safetensors (y cuantizaciones) | Modelo generalista |
| Modelo frontera (sin especificar) | No disponible | No disponible | No disponible | No disponible | No disponible | Referencia en la evaluación ciega |

La comparación directa con alternativas de la misma categoría (asistentes educativos on-device) no está disponible en la información proporcionada. El modelo base Qwen3.5-2B es el referente inmediato por tamaño y licencia, pero carece de la especialización pedagógica y del ajuste de seguridad del modelo derivado. En la evaluación ciega, el modelo pequeño gana o empata en 13 de 61 escenarios frente a un modelo frontera no identificado.

## Limitaciones y advertencias

- Las respuestas en escritura urdu son ligeramente más débiles que las respuestas en inglés.
- El modelo a veces ofrece dos acciones en lugar de una, incumpliendo la instrucción de una única acción.
- Las preguntas raras de bienestar infantil (un niño que parece herido o asustado) deben responderse derivando al contacto de salvaguarda de la escuela; la aplicación lo impone con una comprobación de reglas y regeneración, no el modelo por sí solo.
- Las cifras de seguridad medidas solo se sostienen cuando se insertan en el prompt de sistema dos o tres notas del manual de Taleemabad y un ejemplo resuelto; sin ellas, el modelo responde en el idioma y la forma correctos, pero no se garantizan los números de evaluación.
- Solo admite inglés y urdu; otras lenguas de Pakistán no se entrenaron.
- Es una ayuda al coaching, no un juez de docentes ni una herramienta de protección infantil; las respuestas deben leerse con el criterio del propio docente.
- No conoce los datos de una escuela concreta y no debe recibirlos.
- El texto del manual pertenece a Taleemabad y está resumido, no reproducido, en el modelo.
- Las respuestas de entrenamiento se redactaron con un asistente frontera y se revisaron por reglas y por un segundo modelo; conviene verificar los términos de ese proveedor antes de reutilizar la receta para entrenar un modelo de propósito general.
- Licencia Apache 2.0 heredada del modelo base Qwen3.5, lo que permite uso comercial, pero el contenido pedagógico subyacente tiene titularidad de Taleemabad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria independiente.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/oyekamal/taleemabad-offline-teacher-coach-2b)
- [Modelo base Qwen/Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B)
- [Taleemabad](https://taleemabad.com)
- Repositorio del proyecto (scripts de entrenamiento, arnés de evaluación y app Android): no disponible (la model card indica que se publicará cuando sea público)
