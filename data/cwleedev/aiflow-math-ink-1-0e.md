# cwLeeDev/aiflow-math-ink-1.0e

## Resumen

El modelo `cwLeeDev/aiflow-math-ink-1.0e` es un sistema de reconocimiento de expresiones matemáticas escritas a mano en línea (online handwriting recognition). Desarrollado por cwLeeDev, este checkpoint convierte la trayectoria ordenada de trazos de lápiz (hasta 128 eventos con 19 canales de información temporal y espacial) directamente en texto LaTeX, sin necesidad de rasterizar la entrada. El modelo emplea un enfoque híbrido de secuencia a secuencia: un "prior online" codifica la forma y el ritmo de los trazos, un puente de secuencia comprime la información en 16 tokens de memoria temporal, y un decodificador de texto libre genera la expresión matemática en formato LaTeX.

La relevancia de este modelo radica en su capacidad para procesar escritura manuscrita en tiempo real, preservando el orden de los trazos y su estructura temporal, lo que lo hace adecuado para aplicaciones de captura de notas, pizarras digitales y asistentes educativos. El checkpoint incluye un adaptador online, el puente de secuencia y los pesos ajustados de la atención cruzada del decodificador. El repositorio tiene un tamaño de 0,4 GB y está etiquetado para los idiomas coreano e inglés. No se especifica la licencia en la ficha de HuggingFace, aunque versiones anteriores del mismo autor (0.5, 0.6) usan Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Secuencia a secuencia con atención cruzada (detalles completos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada limitada a 128 eventos de trazo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | no disponible (versiones anteriores del autor usan Apache-2.0) |
| Formato de pesos | PyTorch (checkpoint `serial_bridge.pt`) |

## Arquitectura y entrenamiento

La arquitectura se describe en la model card como un sistema de tres componentes: un codificador online que procesa la secuencia ordenada de trazos (hasta 128 eventos, 19 canales de trayectoria), un puente de secuencia que comprime la representación en 16 tokens de memoria temporal, y un decodificador de texto libre que genera LaTeX. El modelo se entrena mediante destilación: un encoder raster (que procesa imágenes) actúa como "teacher" offline durante el ajuste del puente, pero no forma parte del camino de inferencia en tiempo de ejecución. Esto permite que el modelo funcione sin rasterización en producción, manteniendo la fidelidad de la representación temporal.

No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. El checkpoint `serial_bridge.pt` contiene el adaptador online, el puente de secuencia y los pesos ajustados de la atención cruzada del decodificador, que deben cargarse junto con la base del decodificador correspondiente.

## Capacidades

- Reconocimiento de escritura a mano en línea: procesa trazos ordenados sin rasterización, preservando el orden y la estructura temporal.
- Generación de texto LaTeX: produce expresiones matemáticas en formato LaTeX de forma libre.
- Compresión de secuencia: convierte la secuencia de trazos en 16 tokens de memoria temporal para la atención cruzada.
- Soporte multilingüe: etiquetado para coreano e inglés.
- Inferencia sin rasterización: el runtime no requiere encoder de imágenes, solo la secuencia de trazos.
- Entrada estructurada: acepta hasta 128 eventos con 19 canales de trayectoria (coordenadas, presión, tiempo, etc.).

## Casos de uso

- Captura de notas matemáticas en tabletas o pizarras digitales: el modelo convierte la escritura manuscrita en LaTeX en tiempo real, permitiendo editar y compartir fórmulas sin transcripción manual.
- Entrada de fórmulas en editores LaTeX: los usuarios pueden escribir a mano en un dispositivo táctil y obtener el código LaTeX listo para insertar en documentos científicos.
- Asistencia educativa en matemáticas: aplicaciones de tutoría que interpretan ejercicios manuscritos y proporcionan retroalimentación automática sobre la expresión matemática.
- Accesibilidad para personas con dificultades de escritura: permite introducir expresiones matemáticas mediante gestos en lugar de teclado, útil en entornos educativos inclusivos.
- Herramientas de colaboración en tiempo real: integración en pizarras colaborativas donde varios usuarios escriben a mano y el sistema normaliza las expresiones a LaTeX para su compartición.
- Automatización de corrección de exámenes manuscritos: el modelo puede extraer las expresiones matemáticas de respuestas escritas a mano para su posterior análisis o verificación automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo.

## Requisitos de hardware

- No se dispone de requisitos oficiales de VRAM ni de GPU recomendadas.
- El tamaño del repositorio es de 0,4 GB, lo que sugiere un modelo relativamente pequeño, probablemente ejecutable en GPUs de consumo (por ejemplo, RTX 3060 o superiores) o incluso en CPU para inferencia básica, aunque no hay datos confirmados.
- Opciones de despliegue: al ser un checkpoint PyTorch, puede integrarse con frameworks como vLLM, TGI o llama.cpp si se convierte a los formatos adecuados, pero no se documenta soporte oficial.
- No se proporcionan estimaciones de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (reconocimiento de escritura matemática en línea). No se puede realizar una comparativa fiable con los datos disponibles.

## Limitaciones y advertencias

- La entrada está limitada a 128 eventos de trazo y 19 canales, lo que puede restringir expresiones muy largas o complejas.
- La licencia no está especificada en la ficha de HuggingFace; aunque versiones anteriores del autor usan Apache-2.0, no se confirma para esta versión. Se recomienda contactar al autor antes de uso comercial.
- No se documentan sesgos específicos, pero al estar entrenado principalmente en coreano e inglés, puede tener un rendimiento inferior en otros idiomas o notaciones matemáticas regionales.
- Riesgo de alucinación en la generación de LaTeX: como cualquier modelo generativo, puede producir expresiones sintácticamente válidas pero semánticamente incorrectas.
- No se proporcionan detalles sobre el dataset de entrenamiento, por lo que no se puede evaluar la cobertura de estilos de escritura o notaciones.
- El checkpoint requiere cargar la base del decodificador correspondiente; no es un modelo autocontenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cwLeeDev/aiflow-math-ink-1.0e
- Versión anterior (0.9): https://huggingface.co/cwLeeDev/aiflow-math-ink-0.9
- Dataset asociado (0.9): https://huggingface.co/datasets/cwLeeDev/aiflow-math-ink-0.9-dataset
- Repositorio GitHub del autor (AIFlow-Eink): https://github.com/kuseumkkrkkr/AIFlow-Eink/tree/main
- Perfil de GitHub del autor: https://github.com/kuseumkkrkkr
