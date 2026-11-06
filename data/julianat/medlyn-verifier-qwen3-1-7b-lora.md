# JulianAT/medlyn-verifier-qwen3-1.7b-lora

## Resumen

Medlyn verifier v1 es un adaptador LoRA sobre el modelo Qwen3-1.7B, desarrollado por JulianAT, que resuelve una tarea muy concreta de verificación de afirmaciones en el ámbito clínico: determinar si una afirmación breve en inglés está respaldada por un pasaje fuente en alemán. El modelo devuelve una de tres etiquetas (`supported`, `unsupported`, `contradicted`) junto con el estado de aserción y la temporalidad de la evidencia citada. Forma parte del prototipo Medlyn, cuyo requisito es que toda afirmación mostrada a un clínico sea trazable a un pasaje localizado.

Técnicamente es un adaptador LoRA de rango 8 entrenado sobre una base Qwen3-1.7B cuantizada a 4 bits, usando MLX sobre Apple M4 Pro. Se trata de un piloto (v1) con un único entrenamiento, entrenado exclusivamente con datos sintéticos generados a partir de plantillas. El autor anuncia una v2 con mayor volumen de datos, barrido de hiperparámetros y calibración.

Su relevancia es doble: por un lado, demuestra un caso de uso de verificación factual cross-lingüe (afirmación en inglés, fuente en alemán) con un modelo pequeño y cuantizado; por otro, sus resultados de evaluación son honestos y muestran que el adaptador generaliza dentro de la distribución sintética pero falla ante tipos de mutación no vistos y texto clínico real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA |
| Parametros totales | 1,7 mil millones (modelo base Qwen3-1.7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con max sequence 512) |
| Tipos de cuantizacion | base de entrenamiento en 4 bits (mlx-community/Qwen3-1.7B-4bit); no se detallan otras |
| Idiomas soportados | aleman (fuente), ingles (afirmacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | adaptador LoRA para MLX (repo de 0.0 GB, solo adaptador) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only, en su variante cuantizada a 4 bits de mlx-community. El entrenamiento es de tipo QLoRA: LoRA de rango 8, escala 20, aplicado en 8 capas, sin dropout, con optimizador Adam, learning rate 1e-4, batch de 4, una época (1.251 pasos) y longitud máxima de secuencia de 512 tokens con los tokens del prompt enmascarados. El entrenamiento completo llevó unos 33 minutos en un Apple M4 Pro.

Los datos son 5.001 ejemplos sintéticos balanceados entre las tres etiquetas, procedentes del dataset JulianAT/medlyn-synth-v1. Los negativos se generan mediante mutaciones controladas: inversión de lado (izquierda/derecha), cambios de dosis y números, desplazamientos de fechas e inversiones de negación. Los splits se hacen por paciente y por familia de generación para evitar fuga de información. No se emplearon datos de pacientes reales en el entrenamiento.

## Capacidades

- Clasificación de afirmaciones clínicas en tres clases: `supported`, `unsupported` y `contradicted`.
- Verificación cross-lingüe: afirmación en inglés contrastada contra pasaje fuente en alemán.
- Extracción de metadatos de la evidencia: estado de aserción (`present`, `negated`, `suspected`, `historical`) y temporalidad (`planned`, `recommended`, `done`, `ongoing`, `given_once`, `stated`).
- Salida estructurada en JSON con los campos `label`, `assertion` y `timing`.
- Preservación de matices clínicos críticos: lados, dosis, fechas, negación, incertidumbre y estado planificado frente a completado.
- No soporta tool calling, agentes, visión ni audio; es un clasificador de texto especializado.

## Casos de uso

- Filtro de primera pasada en pipelines de verificación clínica: dado un conjunto de afirmaciones generadas o extraídas y sus pasajes fuente, el adaptador descarta rápidamente las claramente no soportadas antes de pasar a un verificador más caro (por ejemplo, un modelo mayor usado como juez).
- Prototipado de sistemas de trazabilidad documental: en el prototipo Medlyn, cada afirmación mostrada al clínico debe enlazar con un pasaje localizado; este adaptador comprueba esa correspondencia.
- Detección de contradicciones en resúmenes clínicos: comparar un resumen en inglés contra la nota original en alemán para detectar inversiones de lado, cambios de dosis o negaciones alteradas.
- Evaluación de calidad de datos sintéticos: usar el verificador para comprobar que los ejemplos generados respetan las restricciones de sus fuentes.
- Investigación en verificación factual cross-lingüe: servir como línea base barata (1,7B, 4 bits, ejecutable en portátil) frente a la que comparar modelos mayores.
- Despliegue local en entornos con requisitos de privacidad: al ser un adaptador pequeño sobre una base de 1,7B cuantizada, puede ejecutarse íntegramente en un Apple Silicon sin enviar datos a la nube.

## Benchmarks y rendimiento

Macro-F1 sobre tres etiquetas, según la model card:

| Conjunto de test | Reglas | Este adaptador | Juez GPT |
|---|---|---|---|
| Familias sintéticas reservadas | 0,287 | 0,754 | 0,898 |
| Tipos de mutación no vistos | 0,000 | 0,175 | 0,242 |
| Afirmaciones de pacientes reales (30, etiquetas débiles) | 0,259 | 0,222 | 0,333 |

El adaptador supera claramente a las reglas en la distribución sintética, pero queda por debajo del juez GPT en todos los conjuntos y no supera a las reglas en afirmaciones reales. El rendimiento cae drásticamente ante tipos de mutación no vistos.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador sobre una base de 1,7B en 4 bits, la inferencia cabe holgadamente en menos de 2 GB de memoria unificada o VRAM.
- GPU recomendadas: no requiere GPU dedicada; el autor lo ejecutó en Apple M4 Pro con MLX. En CUDA, cualquier GPU con 4 GB o más es suficiente.
- Cabe en GPU de consumo: sí, en cualquier RTX con 4 GB o más, y en Apple Silicon.
- Opciones de despliegue: MLX (`mlx_lm`) es la vía documentada; al ser un adaptador LoRA sobre Qwen3-1.7B, podría convertirse a otros formatos, aunque no se documenta.
- Latencia y throughput: no disponibles. El entrenamiento de 1.251 pasos tardó unos 33 minutos en M4 Pro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Medlyn verifier v1 (este) | 1,7B + LoRA r8 | no disponible (entreno a 512) | Verificación clínica EN/DE | Apache 2.0 | Hugging Face (MLX) |
| Qwen3-1.7B base | 1,7B | no disponible | Generación general | Apache 2.0 | Hugging Face |
| Juez GPT (referencia de la model card) | no disponible | no disponible | Verificación con prompt | propietaria | API |
| Verificación por reglas (referencia de la model card) | no aplica | no aplica | Comprobación exacta de números, lados, fechas y negación | no aplica | código |

No se dispone de comparación con otros adaptadores de verificación clínica publicados en la información proporcionada.

## Limitaciones y advertencias

- Entrenado solo con documentos alemanes sintéticos generados desde plantillas; los documentos reales difieren en estilo y ruido.
- Rendimiento débil ante tipos de mutación no vistos en entrenamiento (macro-F1 de 0,175).
- En afirmaciones de pacientes reales no supera a una comprobación por reglas (0,222 frente a 0,259), con etiquetas débiles y solo 30 ejemplos.
- Las probabilidades no están calibradas.
- No es un producto sanitario: uso exclusivo para investigación y prototipado.
- Es un piloto v1 con un único entrenamiento; el autor prevé reemplazarlo por una v2.
- No se emplearon datos de pacientes reales en el entrenamiento, y las afirmaciones de evaluación con pacientes reales no forman parte de la release.
- Riesgo de alucinación en la generación de los campos JSON, aunque la tarea es de clasificación y la salida es corta.
- Licencia Apache 2.0 permite uso comercial, pero las limitaciones de fiabilidad clínica desaconsejan cualquier uso en producción sanitaria sin validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JulianAT/medlyn-verifier-qwen3-1.7b-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/JulianAT/medlyn-synth-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Base cuantizada usada en entrenamiento: https://huggingface.co/mlx-community/Qwen3-1.7B-4bit
