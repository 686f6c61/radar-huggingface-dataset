# smk2295/JSQ-Qwen3-8B-Base-uns70-int4

## Resumen

JSQ-Qwen3-8B-Base-uns70-int4 es un checkpoint de investigación publicado por el usuario smk2295 (Song Minkyoung) sobre el modelo base Qwen/Qwen3-8B-Base. No es un modelo nuevo ni un ajuste fino: es una versión comprimida del Qwen3-8B-Base en la que se ha aplicado de forma conjunta un 70 % de sparsidad no estructurada (podado estilo Wanda) y una cuantización INT4 simétrica por grupos de 128 canales. El objetivo del autor es ofrecer una línea base reproducible para investigar compresión de modelos, no un modelo listo para producción.

El checkpoint se publica con pesos en fp16 que contienen tanto los ceros de la máscara de poda como los valores ya "fake-quantized" sobre la rejilla INT4, junto con un fichero de escalas por grupo. Es decir, la compresión está aplicada a nivel numérico pero no empaquetada: el repositorio ocupa 16,5 GB, prácticamente lo mismo que los pesos originales en fp16, de modo que solo se materializa el ahorro si el usuario implementa sus propios núcleos de inferencia dispersos y de 4 bits.

Su relevancia ahora es metodológica: permite medir la degradación conjunta de sparsidad y cuantización sobre una arquitectura densa de 8B parámetros de la familia Qwen3, comparar contra otras variantes del mismo autor (por ejemplo las de sparsidad estructurada 2:4) y validar máscaras y escalas antes de invertir en kernels optimizados. La ficha declara licencia "other" y no aporta idiomas, benchmarks ni pipeline, por lo que cualquier uso fuera de la experimentación exige verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen3-8B-Base) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no se declara en la ficha; corresponde a la del modelo base) |
| Tipos de cuantizacion | INT4 simetrica (absmax) por grupo de 128 canales, niveles en [-7, 7]; pesos almacenados en fp16 con valores "fake-quantized" |
| Idiomas soportados | no disponible |
| Licencia | other (declarada en el repositorio) |
| Formato de pesos | safetensors (model.safetensors en fp16; compression/scales.safetensors con escalas [out, in/128] por capa; compression_config.json) |
| Sparsidad | 70 % no estructurada (mascara recuperable como `weight == 0`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B-Base, un transformer denso decoder-only de 8,19 mil millones de parámetros perteneciente a la serie Qwen3, que según el informe técnico de Qwen cubre arquitecturas densas y de mezcla de expertos entre 0,6 y 235 mil millones de parámetros. Este checkpoint no añade entrenamiento: la ficha no documenta ningún proceso de ajuste, RLHF, DPO ni destilación, y al derivar de una variante "Base" tampoco incorpora la plantilla de chat ni el modo de razonamiento que Qwen3 introduce en sus versiones instruct.

La innovación es puramente de compresión. El método JSQ combina podado tipo Wanda (sparsidad no estructurada al 70 %, con la máscara almacenada implícitamente como ceros en el tensor de pesos) y cuantización de pesos INT4 simétrica con granularidad de grupo de 128 canales, usando escala `scale = absmax / 7` y reconstrucción `w = round(x / scale) * scale`. Las escalas se distribuyen por capa en `compression/scales.safetensors`, con forma `[out, in/128]`, y los hiperparámetros quedan registrados en `compression_config.json`. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni evaluaciones de perplejidad.

## Capacidades

- Generación de texto por continuación pura: al ser un modelo base, su uso previsto es la compleción de secuencias, no el diálogo.
- Razonamiento, matemáticas y código: capacidades heredadas del Qwen3-8B-Base original, pero no verificadas en este checkpoint tras aplicar 70 % de sparsidad e INT4.
- Tool calling / function calling: no disponible. Requiere ajuste por instrucciones o plantilla específica, que este repositorio no incluye.
- Soporte de agentes y razonamiento multi-paso: no disponible en la variante Base.
- Capacidades multilingües: no declaradas en la ficha del checkpoint.
- Capacidades especiales (modo thinking, visión, audio): ninguna. La integración de modo thinking y no-thinking descrita en el informe de Qwen3 aplica a las variantes instruct, no a este checkpoint.
- Recuperación de la máscara de poda: sí, la máscara es reconstruible comprobando `weight == 0` en `model.safetensors`, lo que facilita la reproducibilidad del experimento.
- Aplicación de las escalas de cuantización: sí, están publicadas por capa con granularidad de 128, lo que permite reproducir la cuantización simétrica.

## Casos de uso

- Investigación en compresión de modelos: sirve como línea base para medir la pérdida de perplejidad y de calidad al combinar 70 % de sparsidad no estructurada con INT4 simétrico, comparando contra el Qwen3-8B-Base sin comprimir y contra las variantes 2:4 del mismo autor.
- Validación de máscaras de poda Wanda: al ser la máscara recuperable como `weight == 0`, permite auditar qué canales se han eliminado por capa y contrastar el criterio de poda con implementaciones propias.
- Desarrollo de kernels de inferencia dispersa: es un banco de pruebas para escribir y medir núcleos que exploten simultáneamente el patrón disperso y los 4 bits, ya que el checkpoint almacenado en fp16 no acelera nada por sí solo.
- Estudios de ablación sobre granularidad de cuantización: las escalas por grupo de 128 permiten comparar variantes de granularidad (por tensor, por canal, 64, 256) manteniendo fija la máscara de sparsidad.
- Punto de partida para ajuste fino con recuperación de calidad: se puede usar como inicialización de un fine-tuning que intente compensar la degradación introducida por la compresión, con el modelo original como referencia.
- Evaluación de pipelines de despliegue con memoria restringida: tras empaquetar los pesos a 4 bits reales, el modelo ocuparía del orden de 4-5 GB, lo que permitiría estudiar despliegues en GPUs de gama media, siempre que el runtime soporte la rejilla de cuantización publicada.
- Reproducibilidad académica: al publicar escalas, configuración y máscara, permite replicar exactamente el experimento y compararlo con otros métodos de compresión conjunta sobre el mismo modelo base.
- Análisis de robustez de la cuantización simétrica absmax: al exponer `scale = absmax / 7` por grupo, facilita estudiar el impacto de valores atípicos en la calidad final frente a esquemas asimétricos o con búsqueda de rango.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del repositorio no incluye perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra métrica, ni comparaciones cuantitativas contra el modelo sin comprimir.

## Requisitos de hardware

- Inferencia con los pesos tal y como se publican (fp16): el repositorio ocupa 16,5 GB, por lo que se necesitan al menos 17-18 GB de VRAM solo para pesos, más la caché KV y el overhead del runtime.
- GPU profesionales recomendadas: A100 40/80 GB, H100, L40S o A6000 para trabajar con comodidad y contextos largos.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y RTX 3090 Ti (24 GB) con margen limitado para la caché KV; no cabe en tarjetas de 16 GB o menos en fp16.
- Si se empaquetan los pesos a INT4 real (operación no incluida en el repositorio), el requisito de memoria bajaría a aproximadamente 4-5 GB, lo que abriría GPUs de 8 y 12 GB, pero requiere kernels propios con soporte de la rejilla simétrica por grupos de 128.
- Despliegue documentado: carga mediante `AutoModelForCausalLM` de Transformers, que es el único camino indicado en la ficha.
- vLLM, TGI y Ollama: no se documenta compatibilidad. Estos runtimes no explotarían ni la sparsidad no estructurada ni las escalas publicadas, y ejecutarían el checkpoint como un modelo denso en fp16 sin ganancia de velocidad ni de memoria.
- llama.cpp / GGUF: no hay ficheros GGUF publicados, por lo que la ruta de CPU y de cuantización tipo Q4 no está disponible sin conversión manual.
- Latencia y throughput: no disponibles. La sparsidad no estructurada del 70 % solo produce aceleración con kernels específicos; en runtimes genéricos el rendimiento será el de un modelo denso de 8B en fp16.
- Memoria de caché KV: no disponible, ya que la ficha no documenta la configuración de capas ni de cabezas del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| smk2295/JSQ-Qwen3-8B-Base-uns70-int4 | 8,19 B (denso) | no disponible | other | safetensors (fp16 con fake INT4) | 0 descargas, 0 likes; baseline de investigacion |
| Qwen/Qwen3-8B-Base | 8,19 B (denso) | no disponible en la informacion | no disponible en la informacion | safetensors | Modelo base original, referencia de la comparacion |
| Qwen/Qwen3-8B | 8,19 B (denso) | no disponible en la informacion | Apache-2.0 en la ficha oficial de Qwen | safetensors | Variante instruct con modo thinking y no-thinking |
| Variantes 2:4 e INT4 de smk2295 (p. ej. Qwen3.5-4B-2to4-int4-*) | no disponible | no disponible | no disponible | safetensors | Mismo autor, sparsidad estructurada en lugar de no estructurada |

Nota: el checkpoint aquí descrito no aporta mejoras de eficiencia inmediatas frente al Qwen3-8B-Base, ya que ocupa prácticamente la misma memoria (16,5 GB). La ventaja solo aparecería con un empaquetado a 4 bits y kernels dispersos que el repositorio no incluye. No se dispone de datos de calidad comparada (perplejidad o benchmarks) que permitan afirmar cuánto se degrada el modelo.

## Limitaciones y advertencias

- Es un modelo base, no ajustado por instrucciones: no sigue instrucciones, no mantiene diálogo y no incluye plantilla de chat.
- Degradación no cuantificada: no se publica perplejidad ni ninguna métrica tras aplicar 70 % de sparsidad no estructurada más INT4, por lo que el impacto real en la calidad es desconocido.
- Riesgo de alucinación elevado: al no haber pasado por RLHF ni DPO, no hay alineación y la generación puede ser incoherente o factualmente falsa.
- La compresión no genera ahorro real de memoria ni de cómputo tal y como se distribuye: los pesos están en fp16 y la cuantización es simulada, no empaquetada.
- Licencia "other": no se especifican términos de uso comercial, por lo que es imprescindible revisar las condiciones del repositorio y las del modelo base Qwen3 antes de cualquier despliegue productivo.
- Idiomas no declarados: no hay información sobre cobertura multilingüe en esta ficha.
- Longitud de contexto no declarada: se desconoce si la compresión afecta a la ventana efectiva del modelo base.
- Estado de validación nulo: 0 descargas y 0 likes en el momento de la consulta, sin discusiones ni informes de terceros que confirmen que los pesos cargan correctamente.
- Sin soporte en runtimes estándar optimizados: al no haber GGUF ni integración con vLLM o TGI, el despliegue exige Transformers y código propio.
- Reproducibilidad dependiente del código del autor: aunque se publican escalas y configuración, no se incluye el script de podado y cuantización, lo que dificulta replicar exactamente el procedimiento.
- Uso previsto exclusivamente experimental: no debería emplearse en aplicaciones de cara al usuario sin una evaluación de calidad previa y un ajuste posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smk2295/JSQ-Qwen3-8B-Base-uns70-int4
- Perfil del autor en HuggingFace: https://huggingface.co/smk2295
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Qwen3-8B (variante instruct): https://huggingface.co/Qwen/Qwen3-8B
- Repositorio de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Informe técnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Ficha de Qwen3-8B-Base en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3-8B-Base
