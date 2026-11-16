# sergei-shteiner/onegin-1

## Resumen

«Onegin-1» es un modelo determinista de n-gramas de caracteres publicado por el usuario sergei-shteiner en Hugging Face. No es un modelo de lenguaje neuronal: sus pesos son una tabla de transiciones construida directamente a partir del texto de referencia del poema «Eugenio Onegin» de Aleksandr Pushkin, sin ningún proceso de entrenamiento con optimización de pesos. Dado un estado inicial, la tabla indica en cada paso el codepoint del siguiente carácter y el número del siguiente estado, de modo que la ejecución recorre la tabla hasta alcanzar una señal de fin de texto y reproduce el poema carácter a carácter.

El modelo existe como ejemplo de control para un benchmark denominado «Onegin de memoria», que evalúa la capacidad de reproducir de memoria una secuencia textual larga. Cada estado corresponde a la cola del texto ya emitido con una longitud de hasta 363 caracteres, que es la longitud mínima necesaria para esta versión del texto (con saltos de línea y puntos suspensivos del autor preservados) de forma que dos colas idénticas no requieran continuaciones distintas. El modelo reproduce los 142.818 caracteres de la secuencia original y obtiene 5.275 de 5.275 líneas versales según la métrica de coincidencia en el capítulo correcto y en el orden original.

Es relevante ahora como referencia determinista y reproducible para comparar sistemas generativos en tareas de memorización exacta de secuencias largas. Su utilidad práctica es acotada: no generaliza, no comprende lenguaje y solo produce el texto para el que fue construido. Se distribuye en formato ONNX y PyTorch, con un tamaño de repositorio que figura como 0.0 GB en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Tabla de transiciones n-grama de caracteres (no neuronal) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 363 caracteres de cola de estado |
| Tipos de cuantización | no disponible |
| Idiomas soportados | ru |
| Licencia | no disponible |
| Formato de pesos | ONNX (`onegin-ngram.onnx`) y PyTorch (`model.pt`) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni un modelo neuronal: es una tabla de transiciones finita. Cada fila de la tabla especifica el codepoint del siguiente carácter y el índice del siguiente estado; el estado representa la cola del texto ya emitido, con una longitud de hasta 363 caracteres. La tabla se construyó directamente sobre el texto de referencia alojado en la Biblioteca Virtual Rusa (rvb.ru), preservando saltos de línea y puntos suspensivos del autor. No hubo entrenamiento con optimización de pesos, ni RLHF, ni DPO, ni ajuste fino.

La innovación técnica es la determinación exacta del estado: la longitud de 363 caracteres es la mínima para esta versión del texto en la que dos colas idénticas no exigen continuaciones distintas. El artefacto ONNX contiene la tabla y el bucle que recorre las transiciones hasta el final del texto; el checkpoint PyTorch contiene los pesos de una capa `Embedding` y el número del estado inicial. La ejecución es determinista y verificable mediante el hash SHA-256 del fichero de salida (`47df2a7482aeddbc4bb9a3de04a48e6b4a258ec294d83168a5ef26a181d2ad18`).

## Capacidades

- Reproducción literal y determinista del texto de «Eugenio Onegin» (dedicatoria y ocho capítulos) desde el estado inicial hasta la señal de fin de texto.
- Emisión de los 142.818 caracteres de la secuencia original, incluyendo títulos, números de estrofa, saltos de línea y puntos suspensivos.
- Correspondencia exacta con 5.275 de 5.275 líneas versales según la métrica del benchmark «Onegin de memoria».
- Ejecución en CPU mediante ONNX Runtime (`CPUExecutionProvider`) y mediante PyTorch (`torch.load` con `weights_only=True`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación condicionada por prompt.
- Capacidad multilingüe nula: únicamente ruso, y solo el texto de referencia.

## Casos de uso

- Verificación de pipelines de inferencia: sirve como salida de referencia con hash conocido para comprobar que una instalación de ONNX Runtime o PyTorch produce exactamente el resultado esperado, byte a byte.
- Ejemplo de control en benchmarks de memorización: permite calibrar la métrica del benchmark «Onegin de memoria» estableciendo el techo determinista de coincidencia exacta de líneas versales.
- Pruebas de integración en CI/CD: el script de ejecución y el hash SHA-256 permiten validar entornos de ejecución y codificación UTF-8 en pipelines automatizados.
- Material didáctico sobre modelos n-grama: ilustra de forma tangible la diferencia entre una tabla de transiciones determinista y un modelo neuronal probabilístico, con un caso de longitud de estado calculada de forma exacta.
- Reproducción textual de dominio público: permite regenerar el texto completo del poema desde los pesos sin depender de la fuente original en red.
- Prueba de empaquetado de artefactos: al distribuirse en ONNX y PyTorch, sirve para validar la carga de checkpoints con `weights_only=True` y la exportación/ejecución ONNX en distintos entornos.

## Benchmarks y rendimiento

| Métrica | Resultado |
|---|---|
| Caracteres reproducidos | 142.818 de 142.818 |
| Líneas versales coincidentes (capítulo y orden correctos) | 5.275 de 5.275 |
| SHA-256 de la salida | `47df2a7482aeddbc4bb9a3de04a48e6b4a258ec294d83168a5ef26a181d2ad18` |

No se han publicado resultados de benchmarks comparativos con modelos de lenguaje en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el ejemplo oficial usa `CPUExecutionProvider` de ONNX Runtime, sin requisitos de GPU.
- VRAM estimada: no disponible; el tamaño del repositorio figura como 0.0 GB y la ejecución de referencia es en CPU.
- GPU recomendadas: no aplica; no se documenta ejecución en GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime y PyTorch en CPU, según los scripts de la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Onegin-1 | Tabla de transiciones n-grama determinista | 363 caracteres de cola de estado | no disponible | Hugging Face (ONNX, PyTorch) |
| Modelos de lenguaje neuronales de pequeño tamaño | Transformer | no disponible | variable | Hugging Face |
| Modelos n-grama clásicos | Tabla de frecuencias | no disponible | variable | Implementaciones de dominio público |

No se dispone de datos de rendimiento comparables con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no generaliza, no responde a prompts y no produce texto distinto del de referencia.
- Solo admite ruso y únicamente el texto de «Eugenio Onegin» en la versión concreta utilizada.
- La licencia no está disponible, por lo que el uso comercial queda sin determinar y requiere consulta al autor.
- El texto de Pushkin es de dominio público, pero la licencia del artefacto (tabla y checkpoints) no se especifica.
- El tamaño del repositorio figura como 0.0 GB, lo que puede indicar un artefacto de pequeño tamaño o una medición incompleta; conviene verificar los ficheros antes de integrarlo.
- No hay datos de sesgos, alucinación ni robustez porque el modelo es determinista y no genera contenido nuevo.
- El uso en producción solo tiene sentido como referencia de verificación, no como componente generativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sergei-shteiner/onegin-1
- Dataset y artículos del benchmark: https://huggingface.co/datasets/sergei-shteiner/onegin-recall-benchmark
- Texto de referencia en la Biblioteca Virtual Rusa: https://rvb.ru/pushkin/01text/04onegin/01onegin/0836-full.htm
