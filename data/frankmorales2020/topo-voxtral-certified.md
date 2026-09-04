# frankmorales2020/topo-voxtral-certified

## Resumen

El modelo `topo-voxtral-certified`, publicado por Frank Morales en Hugging Face, es un experimento de aprendizaje continuo aplicado a la clasificación de audio. Su propósito es demostrar que es posible aprender tres tareas secuenciales (discursos modernos, discursos históricos y una tarea mixta de resiliencia UNESCO) sin sufrir olvido catastrófico, mediante un mecanismo llamado "Topological Governor". El autor lo presenta como un modelo certificado bajo el protocolo TOPO-2026, que se basa en anclajes de índices primos dentro de una capa de embedding para preservar conocimiento previo durante el entrenamiento de nuevas tareas.

La arquitectura declarada parte del modelo base `Voxtral-Mini-4B-Realtime-2602` y un adaptador de audio de UNESCO, aunque el artefacto publicado en Hugging Face es únicamente un clasificador lineal (head) que recibe características MFCC de 1024 dimensiones. El checkpoint contiene los pesos de un clasificador binario, sin incluir el modelo base. Según el modelo card, el entrenamiento secuencial consigue una precisión del 100% en la tercera tarea, un 0% de olvido combinado y un uso de memoria de solo 24 KB para las anclas topológicas.

La relevancia del proyecto radica en su propuesta de una garantía matemática de retención de conocimiento, expresada mediante una constante de seguridad Lambda igual a 0.9785. Es un material de investigación para quienes trabajan en estrategias de aprendizaje continuo y preservación de patrimonio audio, aunque debe tenerse en cuenta que el repositorio no contiene los pesos completos ni un modelo funcional de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador lineal con Topological Governor (head de salida); arquitectura base declarada: Voxtral-Mini-4B-Realtime-2602 con adaptadores UNESCO |
| Parametros totales | No disponible (el checkpoint publicado solo contiene los pesos del clasificador lineal; los parametros del modelo base no se incluyen) |
| Parametros activos | No disponible (no es un modelo de mezcla de expertos o MoE) |
| Longitud de contexto | No disponible para el checkpoint publicado; el pipeline de inferencia usa 20 segundos de audio a 16 kHz |
| Tipos de cuantizacion | FP8 |
| Idiomas soportados | en (etiqueta del repositorio; el modelo no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | .pt (PyTorch checkpoint) |

## Arquitectura y entrenamiento

El modelo card describe el `topo-voxtral-certified` como un clasificador lineal construido sobre características acústicas. La entrada es un vector de 1024 dimensiones obtenido a partir de 40 coeficientes MFCC de un clip de audio de 20 segundos a 16 kHz. El clasificador final tiene dos clases y se implementa mediante una capa lineal con peso y sesgo. No se detalla la arquitectura interna del supuesto modelo base `Voxtral-Mini-4B-Realtime-2602`, pero se menciona que se usa un adaptador de audio de UNESCO.

El entrenamiento se realizó de forma secuencial sobre tres tareas: la tarea A consistía en clasificación binaria de discursos modernos, la tarea B en clasificación binaria de discursos históricos (por ejemplo, de Martin Luther King), y la tarea C en una tarea mixta de resiliencia UNESCO con una combinación equilibrada de discursos modernos e históricos. El componente técnico destacable es el "Topological Governor", que protege los índices primos `[2, 3, 5, 7, 11, 13]` dentro de la capa de embedding. Durante el entrenamiento de nuevas tareas, el gobernador anula los gradientes de esos índices y restaura sus valores originales, con el objetivo de preservar información crítica. La garantía teórica de retención se calcula a partir de la distribución de números primos y se reporta como una constante de seguridad (Lambda) de 0.9785142874.

No se aportan datos sobre números totales de tokens, composición de datasets, uso de RLHF ni DPO. El enfoque es un experimento de aprendizaje continuo basado en anclajes matemáticos.

## Capacidades

- Clasificación binaria de audio: distingue entre discursos modernos (clase 0) y discursos relacionados con resiliencia UNESCO o históricos (clase 1) según la definición de la tarea C.
- Aprendizaje continuo: el autor afirma un 0% de olvido combinado en las tres tareas evaluadas, con una integridad topológica validada.
- Preservación de conocimiento mediante anclas primas: los índices protegidos en la capa de embedding requieren solo 24 KB de memoria adicional.
- Precisión del 100% en la tarea final de resiliencia UNESCO, con una desviación estándar de 0.
- No soporta tool calling, function calling, agentes, generación de texto, razonamiento matemático, visión ni procesamiento de lenguaje natural.
- No es un modelo multimodal: la entrada está limitada a audio preprocesado en MFCC.

## Casos de uso

- Investigación en aprendizaje continuo: el modelo sirve como referencia para evaluar mecanismos de anclaje por números primos y medir la retención en tareas secuenciales de clasificación de audio.
- Preservación de patrimonio histórico: permite clasificar archivos de audio de discursos históricos frente a discursos modernos, útil en colecciones digitalizadas de entidades como UNESCO.
- Evaluación del overhead de memoria en sistemas de lifelong learning: el footprint de 24 KB de las anclas resulta adecuado para prototipos que necesiten minimizar el coste de almacenamiento de conocimiento.
- Prototipado de clasificadores acústicos binarios: el pipeline con librosa, MFCC y una capa lineal puede desplegarse en CPU para clasificaciones simples en tiempo real, dada la baja carga computacional.
- Verificación de protocolos de certificación TOPO-2026: sirve como caso de estudio para comprobar si la retención estructural se mantiene tras entrenar tres tareas consecutivas.
- Comparación de estrategias anti-olvido: el modelo puede integrarse en un banco de pruebas para contrastar el Topological Governor con otras técnicas de regularización o replay en clasificación de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible. Los únicos datos de rendimiento provienen de la evaluación interna del autor, que se presentan a continuación.

| Metrica | Valor |
|---|---|
| Precisión en Task A (Modern Speeches) | 50.00% |
| Precisión en Task B (Historical Speeches) | 50.00% |
| Precisión en Task C (UNESCO Resilience) | 100.0% ± 0.0% |
| Olvido combinado | 0.0% ± 0.0% |
| Integridad topológica | PASSED |
| Footprint de memoria de anclas | 24.0 KB |
| Constante de seguridad (Lambda) | 0.9785142874 |

## Requisitos de hardware

- El checkpoint publicado es un clasificador lineal con un peso de dimensión 2 x 1024 y un sesgo de 2, por lo que ocupa menos de 1 MB en memoria y no requiere VRAM dedicada.
- La extracción de características MFCC se realiza mediante librosa y soundfile, con carga computacional bajísima; puede ejecutarse en CPU.
- No se necesitan GPU para la inferencia del artefacto publicado.
- Si se quisiera utilizar el supuesto modelo base Voxtral-Mini-4B-Realtime-2602 completo, no hay datos de requisitos en la información proporcionada; se considera no disponible.
- Opciones de despliegue: el código de ejemplo usa PyTorch en CPU, sin integración con vLLM, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparativas con otros modelos. El artefacto publicado es un head lineal experimental, por lo que no es directamente comparable con modelos de clasificación de audio de propósito general como Wav2Vec2, HuBERT o AST. Tampoco se han facilitado datos de otros sistemas de aprendizaje continuo para establecer una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio de Hugging Face tiene un tamaño de 0.0 GB y no contiene archivos, pese a que el código de ejemplo descarga `topo_certified.pt`. Esto impide la reproducción directa del modelo.
- Las precisiones de Task A y Task B son del 50%, lo que indica un comportamiento equivalente al azar en esas dos tareas; solo Task C alcanza el 100%.
- El valor de 0% de olvido se refiere a la retención estructural medida por el mecanismo de anclas, no a la precisión de todas las tareas.
- No se han publicado los pesos del modelo base, por lo que no es posible verificar el comportamiento completo de la arquitectura declarada.
- Al tratarse de un clasificador lineal sobre MFCC, no captura información temporal compleja ni semántica del habla, lo que limita su utilidad en tareas reales de reconocimiento de audio.
- La etiqueta de idioma es únicamente inglés, y no se han evaluado sesgos ni comportamiento en otros idiomas.
- No dispone de capacidades de tool calling, generación de texto ni soporte para agentes autónomos, por lo que no es adecuado como modelo de producción en esos ámbitos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/frankmorales2020/topo-voxtral-certified
- Cuaderno de código fuente: https://github.com/frank-morales2020/AST/blob/main/voxtral_topo.ipynb
- Modelo relacionado del mismo autor: https://huggingface.co/frankmorales2020/topo-2026-evo2-certified
