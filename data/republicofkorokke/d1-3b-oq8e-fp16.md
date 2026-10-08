# RepublicOfKorokke/d1-3B-oQ8e-fp16

## Resumen

RepublicOfKorokke/d1-3B-oQ8e-fp16 es una versión cuantizada del modelo LiquidAI/d1-3B, publicada por el usuario RepublicOfKorokke en HuggingFace. Se trata de una cuantización de precisión mixta realizada con la herramienta oQ (oMLX v0.7.0) a 8 bits, con un tamaño de grupo de 64, y distribuida en formato MLX safetensors, por lo que está pensada para ejecutarse sobre Apple Silicon mediante la librería MLX.

El modelo base, LiquidAI/d1-3B, pertenece a la familia LFM2-VL de Liquid AI (el tipo de modelo declarado es "lfm2_vl") y cuenta con 3.123.483.888 parámetros, es decir, aproximadamente 3,1 mil millones. Al ser una variante cuantizada, no incorpora entrenamiento ni cambios de arquitectura respecto al original: su único propósito es reducir el peso en memoria y acelerar la inferencia en hardware Apple.

La relevancia de este artefacto es limitada pero ilustrativa: muestra cómo la comunidad publica cuantizaciones ligeras de modelos vision-lenguaje recientes para su uso en equipos de sobremesa. Sin embargo, el repositorio tiene muy poca difusión (14 descargas y 0 "likes"), carece de model card detallada más allá de los parámetros de cuantización y no declara licencia ni idiomas soportados, lo que condiciona su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2-VL (familia LFM2 de Liquid AI), según el tipo de modelo declarado "lfm2_vl" |
| Parametros totales | 3.123.483.888 (aprox. 3,1 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | esta variante: oQ de precision mixta a 8 bits, group size 64; otras cuantizaciones, no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado desde cero, sino una cuantización del modelo base LiquidAI/d1-3B. La arquitectura subyacente corresponde a la familia LFM2-VL de Liquid AI, un diseño multimodál (vision-lenguaje) según el campo "model type: lfm2_vl". No obstante, esta ficha no dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original; esos datos deben consultarse en la model card de LiquidAI/d1-3B.

La innovación técnica de esta publicación es exclusivamente la cuantización. Se ha aplicado oQ (mixed-precision quantization, oMLX v0.7.0) a 8 bits con un tamaño de grupo de 64, lo que reduce el peso de los pesos de aproximadamente 6,2 GB en fp16 a unos 3,2 GB en 8 bits. El resultado se empaqueta en safetensors con metadatos MLX, lo que permite cargarlo directamente en el ecosistema MLX para Apple Silicon.

## Capacidades

- Generación de texto: heredada del modelo base LFM2-VL; los detalles concretos de calidad no están documentados en este repositorio.
- Procesamiento de visión: el tipo de modelo "lfm2_vl" indica soporte de entrada de imágenes, aunque no se especifica en la model card el resolución, número de imágenes ni tareas soportadas.
- Razonamiento y matemáticas: no disponible en la información proporcionada.
- Generación de código: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Prototipado local en Mac: cargar el modelo con MLX para experimentar con un modelo vision-lenguaje de 3,1B en un portátil Apple Silicon sin depender de la nube, gracias al formato safetensors MLX y al tamaño reducido de 8 bits.
- Inferencia de bajo consumo en edge: el peso de aproximadamente 3,2 GB permite ejecutar el modelo en equipos con memoria unificada limitada, útil para demostraciones o pruebas de concepto fuera de servidores.
- Evaluación de cuantizaciones: servir como referencia para medir la pérdida de calidad de oQ a 8 bits frente al modelo original LiquidAI/d1-3B en tareas de texto e imagen.
- Desarrollo de asistentes multimodales offline: construir un asistente que reciba imágenes y texto sobre hardware Apple, siempre que se valide antes la calidad real del modelo cuantizado.
- Pruebas de integración del ecosistema MLX: verificar la compatibilidad de un modelo LFM2-VL en MLX frente a otros runtimes, útil para ingenieros que comparan stacks de inferencia.
- Base para cuantizaciones más agresivas: partir de esta versión de 8 bits para generar variantes de 4 bits u otras, comparando degradación.
- Investigación sobre cuantización comunitaria: analizar cómo se documentan (o no) los artefactos derivados y su trazabilidad respecto al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El formato es MLX safetensors con código personalizado, por lo que está diseñado específicamente para Apple Silicon (chips de la serie M). No es ejecutable de forma nativa en CUDA.
- Peso en memoria estimado de los pesos: aproximadamente 3,2 GB en la cuantización de 8 bits; el repositorio completo ocupa 4,6 GB.
- Memoria unificada recomendada: 8 GB como mínimo para el modelo, y 16 GB o más para trabajar con contexto largo o entradas de imagen.
- GPU compatibles: no se aplican GPU discretas tipo A100, H100 o RTX 4090, al requerir MLX; el hardware objetivo son los SoC Apple M1, M2, M3 o M4.
- Opciones de despliegue: MLX (mlx-lm / mlx-vlm) y herramientas compatibles con MLX. No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI con este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RepublicOfKorokke/d1-3B-oQ8e-fp16 | 3,1B | no disponible | MLX safetensors, oQ 8 bits | no disponible | HuggingFace, 14 descargas |
| LiquidAI/d1-3B (modelo base) | 3,1B | no disponible | safetensors fp16 | no disponible | HuggingFace |
| Otras variantes LFM2-VL de Liquid AI | no disponible | no disponible | safetensors | no disponible | HuggingFace |

La comparación directa fiable es con el propio modelo base: esta publicación es una versión cuantizada a 8 bits, orientada a Apple Silicon, frente al peso fp16 original. Para alternativas de otros fabricantes no se dispone de datos verificables en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 8 bits introduce pérdida de precisión respecto al modelo base; no se han publicado evaluaciones que cuantifiquen esa degradación.
- El repositorio no declara licencia, por lo que no se puede confirmar si el uso comercial está permitido; hay que remitirse a la licencia del modelo base LiquidAI/d1-3B.
- No se declaran idiomas soportados; el rendimiento multilingüe no está garantizado.
- El formato MLX limita la ejecución a Apple Silicon, lo que excluye servidores con GPU NVIDIA típicos de producción.
- Al ser una cuantización, el modelo hereda los sesgos y el riesgo de alucinación del modelo base, y puede amplificarlos por la pérdida de precisión.
- Solo tiene 14 descargas y 0 "likes", sin validación de la comunidad ni pruebas de terceros.
- No hay datos de contexto máximo, por lo que no se puede garantizar el manejo de conversaciones largas.
- La model card no documenta el proceso de cuantización más allá de bits y group size, ni incluye métricas de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RepublicOfKorokke/d1-3B-oQ8e-fp16
- Modelo base: https://huggingface.co/LiquidAI/d1-3B
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx

Nota: las búsquedas web realizadas no arrojaron enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a contenidos sin relación con el artefacto.
