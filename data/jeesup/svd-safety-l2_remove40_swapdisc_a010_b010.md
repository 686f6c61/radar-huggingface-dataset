# Jeesup/svd-safety-l2_remove40_swapdisc_a010_b010

## Resumen

Jeesup/svd-safety-l2_remove40_swapdisc_a010_b010 es un checkpoint experimental derivado de meta-llama/Llama-2-7b-chat-hf, comprimido con SVD-LLM al 60% de los parámetros densos y posteriormente editado mediante 10 rondas de intercambio de parámetros con la regla de selección disc_iter. Lo desarrolla Jeesup como artefacto de investigación para estudiar cómo la compresión por descomposición en valores singulares afecta al comportamiento de seguridad de un modelo de chat y qué reglas de selección de componentes permiten repararlo. El modelo no es un asistente de propósito general, sino una celda de una cuadrícula experimental sobre reglas de selección y presupuestos de restauración. Su relevancia radica en aportar evidencia empírica sobre el trade-off entre compresión, utilidad y alineación, un área crítica para el despliegue eficiente de modelos de lenguaje. La arquitectura subyacente es un transformer decoder-only de Llama-2 con 6.738.415.616 parámetros totales; no se especifica la longitud de contexto en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | Safetensors |

Nota: el autor indica que la compresión SVD-LLM reduce la fracción de parámetros densos al 59,98% (0,5998), aunque el archivo safetensors conserva el conteo de parámetros del modelo base.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only basado en Llama-2-7b-chat-hf. El proceso de compresión utiliza SVD-LLM para eliminar el 40,02% de los parámetros densos mediante descomposición en valores singulares, reduciendo el rango de las matrices de proyección. Posteriormente se aplican 10 rondas de intercambio de parámetros neutrales, seleccionados por la regla disc_iter, con un presupuesto total del 1% de los parámetros densos (0,1% por ronda). En total se restauran e intercambian 5.791 componentes, con una escala de inserción de 0,1. El modelo base, Llama-2-7b-chat-hf, fue entrenado mediante fine-tuning con RLHF, pero la documentación del checkpoint no detalla el proceso de entrenamiento original ni los datos utilizados. La innovación técnica destacable es la combinación de compresión SVD con un mecanismo de swap iterativo para reparar el comportamiento de seguridad dañado por la compresión.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-7b-chat, pero con calidad probablemente degradada por la compresión.
- No se ha documentado soporte para tool calling, agentes, visión, audio ni razonamiento avanzado en la información disponible.
- Las métricas publicadas se centran en seguridad: tasa de éxito de ataques en AdvBench (0,2019) y StrongREJECT (0,1853), y macro sobre-rechazo en WildGuard (0,1379).
- El modelo no está diseñado para uso general; su propósito es servir como sujeto experimental en estudios de compresión y alineación.

## Casos de uso

- Investigación en robustez de seguridad: permite medir cómo la compresión SVD afecta la tasa de éxito de ataques adversarios, utilizando los benchmarks AdvBench y StrongREJECT.
- Evaluación de técnicas de reparación de alineación: sirve para comparar la efectividad de la regla de selección disc_iter frente a otras reglas en la restauración del comportamiento seguro.
- Estudio de interpretabilidad de componentes: los 5.791 componentes intercambiados pueden analizarse para entender qué partes de la red contribuyen a la seguridad.
- Análisis de trade-offs entre tamaño y alineación: permite cuantificar cuánta seguridad se pierde al reducir la fracción de parámetros densos al 60%.
- Desarrollo de métodos de compresión conscientes de seguridad: los resultados pueden informar el diseño de técnicas de compresión que preserven las capacidades de seguridad.
- Benchmarking de modelos comprimidos: puede usarse como referencia en evaluaciones comparativas de modelos de lenguaje comprimidos, aunque sin ser representativo de un modelo de producción.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,2019 |
| StrongREJECT ASR (juez HarmBench) | 0,1853 |
| Macro sobre-rechazo (WildGuard) | 0,1379 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: ~13,5 GB, por lo que se recomienda al menos 16 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB), A100 40 GB, H100 80 GB. En GPUs de consumo, una RTX 3090 o 4090 puede ejecutarlo en FP16 sin cuantización.
- Con cuantización INT8, la VRAM estimada sería ~7 GB; con 4-bit, ~4 GB, aunque no se han publicado cuantizaciones específicas para este checkpoint.
- Opciones de despliegue: al ser un modelo de la familia Llama en formato safetensors, es compatible con vLLM, llama.cpp, Ollama y TGI, aunque el autor no recomienda su uso en producción.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. El modelo es un artefacto de investigación específico, no un modelo de propósito general, por lo que no se pueden establecer comparaciones directas con alternativas comerciales o de código abierto.

## Limitaciones y advertencias

- El autor advierte explícitamente que el checkpoint es un sujeto experimental, no un asistente desplegable.
- La compresión SVD daña el comportamiento de seguridad: la tasa de éxito de ataques es del 20,19% en AdvBench y 18,53% en StrongREJECT, lo que indica vulnerabilidad a ataques adversarios.
- El modelo presenta un macro sobre-rechazo del 13,79% (WildGuard), lo que puede traducirse en rechazos excesivos de peticiones legítimas.
- No se han evaluado sesgos, alucinaciones ni calidad de generación en la información disponible.
- La licencia Llama 2 Community License impone restricciones de uso comercial; se deben revisar los términos antes de cualquier uso.
- El modelo no está diseñado para producción; cualquier uso debe ir precedido de una evaluación propia.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapdisc_a010_b010
- No se han encontrado papers, blogs o repositorios adicionales en la búsqueda web.
