# Lordnyx/qwen3loop-0.6b-sft-deep-supervision-v1

## Resumen

Qwen3Loop-0.6B-Instruct (SFT Deep Supervision v1) es un modelo de lenguaje recursivo ultracompacto de 596 millones de parámetros físicos, desarrollado por Lordnyx sobre la base de Qwen/Qwen2.5-0.5B-Instruct. Su principal innovación es la arquitectura Qwen3Loop, inspirada en el paradigma de razonamiento profundo del Nanbeige 4.5: un bloque central de 14 capas físicas se ejecuta tres veces consecutivas, alcanzando una profundidad efectiva de 56 pasadas virtuales de capa con solo 28 bloques Transformer físicos.

El modelo fue ajustado mediante Supervised Fine-Tuning (SFT) con Deep Supervision Intermediaria sobre el dataset curado ianncity/GLM-5.2-Logic-Puzzles (6.414 muestras de puzzles lógicos, deducción formal y matemática encadenada). Según el autor, alcanza un 81,44% de precisión global en el benchmark oficial de 97 preguntas, lo que supone una mejora de +9,10 puntos sobre el modelo base, con un 100% de acierto en matemáticas y un 90% en razonamiento lógico.

Su relevancia radica en demostrar que es posible obtener capacidades de razonamiento profundo con modelos de menos de 600M de parámetros mediante recurrencia en profundidad, ocupando aproximadamente 600 MB en cuantización Q8_0 y manteniendo la licencia Apache 2.0, lo que facilita su despliegue en entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer recurrente con layer looping (28 bloques físicos, 56 pasadas virtuales) |
| Parámetros totales | 596.049.920 (596M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenado con secuencias de 1.536 tokens) |
| Tipos de cuantización | Q8_0 (documentado), GGUF disponible |
| Idiomas soportados | Portugués (pt), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo implementa el paradigma Qwen3Loop, una variante de Transformer recurrente con recorrência en profundidad (layer looping). La estructura se compone de 28 bloques Transformer físicos (L00 a L27): un prefijo de 7 capas (L00-L06), un bloque central de 14 capas (L07-L20) que se ejecuta tres veces consecutivas (r0, r1, r2) y un sufijo de 7 capas (L21-L27). Esto produce una profundidad efectiva de 56 pasadas virtuales de capa, permitiendo que el modelo realice múltiples ciclos de razonamiento sobre los mismos parámetros sin aumentar el número de pesos.

El entrenamiento utiliza SFT con Deep Supervision: la función de pérdida total combina la cross-entropy en la capa de salida con dos pérdidas intermedias calculadas al final de cada uno de los dos primeros loops (pesos w0 = 0,15 y w1 = 0,25), forzando al modelo a pre-resolver el razonamiento formal dentro de los ciclos recurrentes. Para evitar picos de memoria en la proyección del vocabulario (151.936 tokens), se aplicó una pérdida de cross-entropy por micro-chunks de 256 tokens, reduciendo el consumo de VRAM en un 97% (de 5,4 GB a 150 MB) con gradientes matemáticamente idénticos a la pasada completa.

El dataset de entrenamiento es una versión curada de 6.414 muestras de GLM-5.2-Logic-Puzzles, tras eliminar cadenas degeneradas sin conclusión final y normalizar las etiquetas sintácticas. El análisis de Logit Lens muestra que el salto cognitivo principal ocurre en el loop r0 (pasadas 16-20), donde la probabilidad del token correcto salta del 1,95% al 100%, mientras que los loops r1 y r2 actúan como filtros de contracción que estabilizan la respuesta con una similaridad coseno de hasta 0,997.

## Capacidades

- Razonamiento lógico formal: resolución de puzzles de deducción, problemas de lógica encadenada y razonamiento multi-paso con cadenas de pensamiento explícitas (`thinking... response`).
- Matemática encadenada: resolución de problemas aritméticos y algebraicos con justificación paso a paso.
- Seguimiento de instrucciones: ejecución de comandos directos con alta fiabilidad (100% en el benchmark del autor).
- Sumarización: condensación de textos manteniendo la información esencial.
- Creatividad y redacción: generación de contenido original con coherencia estructural.
- Robustez a adversarios: resistencia parcial a entradas maliciosas o confusas (el dato del benchmark está truncado en la model card).
- Multilingüe: soporte para portugués e inglés.
- Razonamiento profundo por recurrencia: capacidad de iterar internamente sobre el problema gracias a las 56 pasadas virtuales, sin necesidad de generar múltiples tokens de reflexión.

## Casos de uso

- Tutoría educativa de matemáticas y lógica: el modelo puede guiar a estudiantes en la resolución de problemas matemáticos y de razonamiento lógico, mostrando la cadena de deducción completa gracias a su formato `thinking... response` y su alta precisión (100% en matemáticas en el benchmark del autor).
- Asistentes conversacionales en portugués e inglés: su tamaño reducido (~600 MB en Q8_0) permite desplegarlo en servidores modestos o dispositivos edge para atender consultas en ambos idiomas con seguimiento de instrucciones.
- Sumarización automática de documentos: adecuado para pipelines de procesamiento de texto que requieran condensar informes, actas o artículos en portugués o inglés, con un 100% de acierto en la categoría de sumarización del benchmark oficial.
- Generación de contenido creativo y redacción: puede producir borradores de textos creativos (relatos, ideas, esquemas) y redacciones formales, con un 100% de acierto en las categorías de creatividad y redacción del benchmark.
- Entorno de razonamiento en dispositivos con recursos limitados: su tamaño reducido y su arquitectura recurrente permiten ejecutar razonamiento multi-paso en CPU o GPU de gama baja, donde modelos de mayor tamaño no caben.
- Integración en pipelines de generación de texto con tool calling: aunque no se documenta soporte explícito de tool calling, el modelo es compatible con endpoints de HuggingFace y puede integrarse en flujos de generación de texto con plantillas de chat estándar.
- Base para destilación o fine-tuning: su licencia Apache 2.0 y su tamaño compacto lo convierten en un candidato para experimentos de destilación de conocimiento o como modelo docente para estudiantes de arquitecturas recurrentes.

## Benchmarks y rendimiento

El autor publica resultados del benchmark oficial de 97 preguntas del dataset GLM-5.2-Logic-Puzzles, comparando el modelo base (Qwen2.5-0.5B-Instruct) con el modelo SFT Deep Supervision, ambos en cuantización Q8_0:

| Categoría | Base (Q8_0) | SFT Deep Supervision (Q8_0) | Ganancia |
|---|---|---|---|
| Matemática | 70,0% | 100,0% (9/9) | +30,0% |
| Razonamiento lógico | 80,0% | 90,0% (9/10) | +10,0% |
| Seguimiento de instrucciones | 40,0% | 100,0% (10/10) | +60,0% |
| Sumarización | 61,9% | 100,0% (7/7) | +38,1% |
| Creatividad | 71,4% | 100,0% (7/7) | +28,6% |
| Redacción / escritura | 93,8% | 100,0% (8/8) | +6,2% |
| Robustez adversarial | 7... (dato truncado en la model card) | — | — |

La precisión global del modelo SFT es del 81,44% frente al 72,34% del modelo base (+9,10 puntos). No se han publicado resultados en benchmarks estándar externos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2 GB en FP16 y 600 MB en cuantización Q8_0 (dato del autor).
- GPU recomendadas: cualquier GPU consumer con 2 GB o más de VRAM (por ejemplo, RTX 3050, RTX 3060, GTX 1660, RTX 4090). También es viable en CPU con llama.cpp.
- Compatibilidad con consumer GPU: sí, incluso en tarjetas de gama baja y en entornos de inferencia en CPU.
- Opciones de despliegue: llama.cpp (formato GGUF), Ollama, vLLM (etiqueta `endpoints_compatible` presente en Hugging Face), Hugging Face TGI, y cualquier framework que soporte safetensors estándar.
- Latencia y rendimiento: no se han publicado datos de latencia o throughput. Dado el tamaño de 596M parámetros, se espera una latencia de decodificación en el orden de decenas de milisegundos por token en GPU consumer y de centenares de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3Loop-0.6B-Instruct | 596M | No disponible | Transformer recurrente (56 pasadas virtuales) | Apache 2.0 | Entrenado en puzzles lógicos y matemáticas; 81,44% en benchmark GLM-5.2 |
| Qwen2.5-0.5B-Instruct | ~500M | No disponible (base del modelo) | Transformer estándar | Apache 2.0 | Modelo base del que parte Qwen3Loop |
| Qwen3-0.6B | ~600M | No disponible | Transformer estándar (familia Qwen3) | Apache 2.0 | Modelo de tamaño similar de la serie Qwen3, sin recurrencia |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada. La comparación con Qwen2.5-0.5B-Instruct es la única con datos cuantitativos disponibles (los del benchmark del autor).

## Limitaciones y advertencias

- Idiomas limitados: el modelo solo soporta portugués e inglés. No se ha documentado rendimiento en otros idiomas, incluido el español.
- Dataset de entrenamiento reducido: solo 6.414 muestras curadas, lo que limita la generalización a dominios fuera de puzzles lógicos, matemáticas y razonamiento formal.
- Longitud de contexto no documentada: el entrenamiento usó secuencias de 1.536 tokens, pero no se especifica el contexto máximo de inferencia. Se recomienda no superar esta longitud sin validación previa.
- Riesgo de alucinación: al ser un modelo de 596M parámetros entrenado en un dominio acotado, es probable que alucine en temas fuera de su ámbito de entrenamiento.
- Benchmark interno: los resultados publicados provienen de un benchmark propio del autor (97 preguntas del dataset GLM-5.2), no de benchmarks externos estándar (MMLU, GSM8K, etc.), lo que dificulta la comparación objetiva con otros modelos.
- Datos de robustez adversarial incompletos: la métrica de robustez aparece truncada en la model card, por lo que no se puede evaluar su resistencia a entradas adversariales.
- Disponibilidad en Hugging Face: el repositorio no registra descargas ni likes en el momento de la consulta, lo que sugiere que el modelo es reciente y no ha sido validado por la comunidad.
- Uso comercial: permitido por la licencia Apache 2.0, pero se recomienda validar el rendimiento en el dominio de aplicación antes de un despliegue en producción.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/Lordnyx/qwen3loop-0.6b-sft-deep-supervision-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/ianncity/GLM-5.2-Logic-Puzzles
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Informe técnico de Qwen3 (contexto de la familia): https://arxiv.org/html/2505.09388v1
- Repositorio de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Referencia a la arquitectura Nanbeige 4.5: mencionada en la model card del autor, sin enlace directo disponible en la información proporcionada.
