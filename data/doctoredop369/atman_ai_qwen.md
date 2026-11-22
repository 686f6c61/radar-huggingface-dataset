# DoctorEdoP369/Atman_Ai_Qwen

## Resumen

Atman_Ai_Qwen (también referido por el autor como AtmanAi_Qwen_V3) es un modelo de lenguaje de aproximadamente 9.000 millones de parámetros publicado por el usuario DoctorEdoP369 en Hugging Face. Se distribuye principalmente en formato GGUF y deriva del modelo DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED, que a su vez se apoya en la familia Qwen 3.5. El modelo está orientado a razonamiento profundo con modo de pensamiento explícito, conversación multi-turno y contenido sin filtrado de seguridad reforzado.

El autor presenta el modelo como una alternativa de alto rendimiento para ejecución local en hardware de consumo, con cuantizaciones GGUF y un proyector multimodal (mmproj) para entrada de imágenes. La ficha del autor destaca capacidades de razonamiento científico-matemático y, sobre todo, psicológico, además de soporte multilingüe y una ventana de contexto extendida mediante archivos Yarn.

La relevancia actual del modelo reside en su enfoque: un ajuste fino "uncensored" sobre una base con modo thinking, empaquetado para inferencia offline. No obstante, la información técnica publicada es escasa y en gran parte promocional, sin datos verificables de benchmarks, composición del dataset de ajuste ni detalles del proceso de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen 3.5, según el modelo base); detalles no disponibles |
| Parametros totales | 8.953.803.264 (≈8,95 B, según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | extendida mediante archivos Yarn; valor numérico no disponible |
| Tipos de cuantizacion | GGUF en varias cuantizaciones (el autor menciona Q5 como la más débil); resto no disponible |
| Idiomas soportados | multilingüe según el autor; lista concreta no disponible (etiqueta `ita` en los tags) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 100,7 GB); safetensors referenciados para el conteo de parámetros |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de la familia Qwen 3.5, un transformer decoder-only con modo de razonamiento explícito (generación de una cadena `<think>` antes de la respuesta). El autor indica que el contexto se ha extendido mediante archivos Yarn, técnica de escalado posicional para ampliar la ventana de atención sin reentrenamiento completo. No se especifican el número de capas, dimensiones ocultas, mecanismo de atención ni configuración de cabezas.

Respecto al entrenamiento, la información disponible es mínima: se menciona un ajuste fino sobre el modelo base DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED, con material multi-turno en el que el razonamiento se mantiene a lo largo de varios intercambios. No se publican el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon RLHF, DPO u otras técnicas de alineamiento. Tampoco se detalla el método de fusión o destilación que pudiera haber aplicado el modelo base. El autor incluye un proyector multimodal (mmproj) para visión, presumiblemente heredado de la base.

## Capacidades

- Generación de texto con razonamiento explícito en modo thinking: produce una cadena `<think>` visible antes de la respuesta final.
- Razonamiento científico-matemático y, según el autor, razonamiento de tipo psicológico.
- Conversación multi-turno con coherencia del razonamiento entre turnos.
- Entrada de imágenes mediante proyector multimodal (mmproj), condicionada al cliente de inferencia utilizado.
- Capacidades multilingües (sin lista detallada de idiomas).
- Escritura creativa y narrativa (etiqueta `story` en los tags).
- Filtrado de seguridad reducido de forma deliberada (ajuste "uncensored").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el modo thinking es compatible con cadenas de razonamiento, pero no se detalla integración con frameworks de agentes.

## Casos de uso

- Asistencia conversacional local sin conexión: el modelo se distribuye en GGUF y puede ejecutarse íntegramente en hardware de consumo, lo que permite desplegar un asistente privado en equipos sin GPU de datacenter.
- Razonamiento matemático y científico asistido: el modo thinking explícito permite auditar el proceso de resolución paso a paso, útil en entornos educativos o de investigación donde interesa revisar el razonamiento y no solo el resultado.
- Análisis de documentos con imágenes: gracias al proyector mmproj, puede procesar capturas, diagramas o páginas escaneadas en clientes compatibles con visión, por ejemplo para extraer y comentar información de figuras técnicas.
- Escritura creativa y narrativa larga: el ajuste sobre material multi-turno y la etiqueta `story` lo orientan a la generación de relatos y diálogos con continuidad, aprovechando el contexto extendido por Yarn.
- Exploración de contenido sin filtros en investigación: al tener filtrado de seguridad reducido, puede emplearse en estudios sobre comportamiento de modelos, evaluación de sesgos o generación de datos adversarios en entornos controlados.
- Prototipado de aplicaciones de razonamiento psicológico o coaching conversacional: el autor destaca este dominio, aunque cualquier uso en salud mental requiere supervisión profesional y no debe tratarse como consejo clínico.
- Inferencia offline en portátiles con GPU consumer: las cuantizaciones GGUF permiten ajustar el modelo a la VRAM disponible, facilitando demos y pruebas de concepto sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor afirma que el modelo supera a sus bases e incluso a modelos mayores, pero no aporta tablas, métricas ni protocolos de evaluación que respalden esas afirmaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (≈9 B de parámetros), una cuantización Q4 requeriría del orden de 5-6 GB, Q5 en torno a 6-7 GB y Q8 cerca de 9-10 GB, más el espacio de contexto KV; estas cifras son estimaciones generales, no datos publicados por el autor.
- GPU recomendadas: no especificadas. Por tamaño, cabría esperar funcionamiento en GPUs consumer con 8-16 GB de VRAM y en GPUs de datacenter (A100, H100) para mayor throughput.
- Compatibilidad con GPU consumer: previsiblemente sí en modelos con 8 GB o más de VRAM en cuantizaciones bajas; el autor no publica requisitos mínimos.
- Opciones de despliegue: el autor distribuye "Atman Ai Setup.zip", un programa propio que carga el GGUF y el archivo mmproj. No se mencionan explícitamente llama.cpp, Ollama, vLLM ni TGI, aunque el formato GGUF es compatible con el ecosistema llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Atman_Ai_Qwen | ≈8,95 B | Extendido con Yarn (valor no disponible) | Apache 2.0 | GGUF | Ajuste uncensored con thinking y visión |
| Qwen 3.5 9B (familia base) | ≈9 B | No disponible en esta ficha | Según variante de Qwen | Safetensors, GGUF | Base oficial; alineamiento estándar |
| DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED | ≈9 B | No disponible | No disponible | No disponible | Modelo base directo del que deriva Atman_Ai_Qwen |

No se dispone de datos de rendimiento comparativos verificables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Filtrado de seguridad reducido de forma deliberada: el modelo responderá a peticiones que asistentes alojados rechazan, lo que traslada toda la responsabilidad de uso al operador.
- Riesgo de alucinación: el autor reconoce que el modelo puede equivocarse con confianza; la cadena de razonamiento visible facilita detectar errores, pero no los evita.
- No sustituye asesoramiento profesional: el propio autor advierte que no reemplaza a médicos, abogados, contadores o ingenieros.
- Visión dependiente del cliente: muchas aplicaciones locales ignoran el archivo mmproj, por lo que el soporte multimodal puede no funcionar según la herramienta.
- Parámetros de muestreo impuestos: el autor recomienda valores concretos (temperatura 0,6; top_p 0,96; top_k 20; min_p 0,03; presence_penalty 0,04; repeat_penalty 1,06) y advierte de posibles fallos con otros ajustes, lo que limita la flexibilidad en producción.
- Documentación técnica insuficiente: no hay datos de dataset, proceso de entrenamiento, evaluación ni idiomas soportados, lo que dificulta la validación rigurosa.
- Licencia Apache 2.0: permite uso comercial, pero el operador asume la responsabilidad sobre el contenido generado y sobre posibles obligaciones derivadas del modelo base.
- Riesgo de sesgos: no se documentan evaluaciones de sesgo; un ajuste uncensored puede amplificar sesgos presentes en los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DoctorEdoP369/Atman_Ai_Qwen
- Modelo base: https://huggingface.co/DavidAU/Qwen3.5-9B-Claude-4.6-HighIQ-THINKING-HERETIC-UNCENSORED
- Familia Qwen: no se proporciona enlace específico en la información disponible
- Paper, blog o repositorio adicionales: no disponibles
