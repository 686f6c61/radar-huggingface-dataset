# axteam/Motif-3-NVFP4A16

## Resumen

Motif-3-NVFP4A16 es una versión cuantizada a 4 bits del modelo Motif-3, desarrollado originalmente por Motif-Technologies y cuantizado por axteam. Se trata de un modelo de lenguaje de arquitectura Mixture of Experts (MoE) con 384 expertos más un experto compartido, 53 capas y aproximadamente 314.841 millones de parámetros totales según los pesos en safetensors. Es un modelo exclusivamente de texto, orientado a generación de texto y conversación.

La relevancia de esta ficha concreta reside en el método de cuantización: NVFP4A16 (W4A16), que almacena los pesos en FP4 (formato E2M1) con grupos de 16 elementos y escalas FP8, manteniendo las activaciones en BF16. El resultado es un checkpoint de aproximadamente 180,8 GB en disco, frente al tamaño del modelo original en BF16. La cuantización es de tipo post-entrenamiento (PTQ), sin recopilación de datos de calibración (data-free, basada en nombres de módulos).

Es importante señalar que esta build está pensada principalmente para reducir el tamaño de descarga y almacenamiento: según la propia model card, ningún motor de inferencia ejecuta Motif-3 con kernels cuantizados todavía, y Transformers descomprime los pesos a BF16 en tiempo de carga, por lo que el pico de memoria en ejecución ronda los 590 GB. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Motif arch): 384 expertos + experto compartido, 53 capas, transformer con atención |
| Parametros totales | 314.841.775.750 (~314,8 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (W4A16): pesos FP4 (E2M1) grupo 16 + escala FP8, activaciones BF16; formato compressed-tensors `nvfp4-pack-quantized` |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas; el ejemplo de uso está en coreano) |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), compatible con Transformers con `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo base Motif-3 emplea una arquitectura MoE con 384 expertos enrutados más un experto compartido, distribuida en 53 capas, y es de modalidad exclusivamente textual. La model card de esta build cuantizada no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esos datos corresponden al modelo original y no están disponibles en la información proporcionada.

La innovación técnica de esta ficha es la cuantización: se aplica PTQ sin reentrenamiento ni calibración con datos (procedimiento `model_free_ptq` basado en nombres de módulos). Se cuantizan las proyecciones de atención, los expertos enrutados y compartidos y las proyecciones mHC; se mantienen en BF16 los embeddings de tokens, la LM head, todas las RMSNorms, los routers MoE (`router.gate`), las puertas de salida de atención (`wq_b_gate`), los escalares PolyNorm/mHC y toda la capa MTP (`mtp_layers.0`), en total aproximadamente el 1% de los parámetros. Además, el archivo `modeling_motif.py` está modificado: los expertos enrutados, que el original almacena como tensores 3D fusionados (`gate_up_proj` [E, 2I, H] y `down_proj` [E, H, I]), se dividen por experto en capas `nn.Linear` independientes (`experts.<e>.{gate,up,down}_proj`), manteniendo el cómputo idéntico. Con el archivo de modelado original los pesos de los expertos no cargarían.

## Capacidades

- Generación de texto y conversación multi-turno mediante `chat_template` idéntico al del modelo original.
- Razonamiento y respuesta a preguntas en formato instructivo (el ejemplo de la model card es una pregunta en coreano sobre la capital de Corea del Sur).
- Capacidad multilingüe: no declarada explícitamente; el ejemplo de uso en coreano sugiere soporte al menos para coreano e inglés, pero no hay lista oficial de idiomas.
- No se documentan capacidades de visión, audio, tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.
- Capa MTP (multi-token prediction) presente en la arquitectura y conservada en BF16, aunque no se detalla su uso en decodificación especulativa.

## Casos de uso

- Investigación sobre cuantización de modelos MoE de gran tamaño: este checkpoint permite estudiar el impacto de NVFP4A16 (W4A16) sobre un MoE de 314,8 mil millones de parámetros, comparando los pesos descomprimidos con el original en BF16 (la model card reporta un error relativo mediano del 9,5% en los módulos cuantizados).
- Almacenamiento y distribución de modelos: al ocupar ~180,8 GB frente al equivalente BF16, reduce el coste de almacenamiento y de descarga en infraestructuras que replican checkpoints, aunque no reduce el pico de memoria en ejecución.
- Despliegue experimental en Transformers sobre clústeres multi-GPU: con `device_map="auto"` y `flash_attention_2`, se puede servir el modelo repartiendo pesos entre GPUs y RAM de CPU, útil para pruebas de integración antes de migrar al checkpoint BF16.
- Evaluación comparativa de fidelidad de cuantización: el chequeo de pesos publicado (59.547 módulos cuantizados verificados, 1.339 tensores BF16 bit-idénticos) sirve como referencia metodológica para validar otras cuantizaciones del mismo modelo.
- Generación de texto conversacional en entornos de investigación con licencia MIT, sin restricciones comerciales derivadas de la licencia del modelo base.
- Base para futuras integraciones en motores de inferencia: cuando un motor (por ejemplo, el fork de vLLM de Motif) añada soporte para kernels cuantizados de esta arquitectura, este checkpoint podría servir para reducir requisitos de VRAM en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se ejecutó ningún benchmark sobre Motif-3 y que el chequeo realizado es de pesos, no de generación extremo a extremo.

| Verificacion | Resultado |
|---|---|
| Modulos cuantizados comprobados | 59.547 |
| Error relativo mediano (pesos descomprimidos vs. BF16) | 9,5% |
| Outliers detectados | Ninguno |
| Tensores mantenidos en BF16 | 1.339, bit-identicos al original |

## Requisitos de hardware

- VRAM estimada para inferencia: el pico de memoria en ejecución es de aproximadamente 590 GB, ya que Transformers 5.x descomprime los pesos compressed-tensors a BF16 al cargar el modelo. El ahorro de la cuantización se aplica al almacenamiento (~180,8 GB), no al consumo en ejecución.
- GPU recomendadas: no hay una lista oficial; por el tamaño del modelo se requiere un despliegue multi-GPU de clase centro de datos (A100, H100 u equivalentes) combinado con RAM de CPU mediante `device_map="auto"`.
- No cabe en GPU de consumo (RTX 4090 y similares) en esta configuración de ejecución.
- Opciones de despliegue: Transformers 5.x (`transformers>=5.7.0`) con `compressed-tensors>=0.19`, `trust_remote_code=True` y `attn_implementation="flash_attention_2"` (obligatorio; el código de modelado lanza un error si no se usa). El fork oficial de Motif ([MotifTechnologies/vllm](https://github.com/MotifTechnologies/vllm), basado en vLLM v0.26.0, imagen `ghcr.io/motiftechnologies/vllm:v0.26.0-motif3`) sirve el original en BF16, pero esta build cuantizada no se ha probado en él. vLLM oficial 0.32 no incluye la arquitectura Motif.
- Latencia y throughput: no disponibles. La carga se verificó con Transformers 5.17.0 y compressed-tensors 0.19.0 solo en las primeras capas; no se ejecutó generación completa de las 53 capas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| axteam/Motif-3-NVFP4A16 | ~314,8 mil millones | no disponible | NVFP4A16 (W4A16) | MIT | Hugging Face, Transformers con `trust_remote_code` |
| Motif-Technologies/Motif-3 (original) | no disponible en la informacion (mismo modelo base) | no disponible | BF16 | MIT | Hugging Face, Transformers y fork de vLLM de Motif |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada, por lo que no es posible una comparativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización introduce un error relativo mediano del 9,5% en los pesos cuantizados; no se ha evaluado el impacto en la calidad de generación porque no se ejecutaron benchmarks.
- Transformers descomprime los pesos a BF16 en carga, por lo que el requisito real de memoria (~590 GB) no se reduce respecto al modelo original; esta build solo ahorra almacenamiento y descarga.
- Ningún motor de inferencia ejecuta Motif-3 con kernels cuantizados actualmente; el fork de vLLM de Motif no se ha probado con esta build.
- El archivo `modeling_motif.py` está modificado para dividir los expertos fusionados; usar el archivo de modelado original impediría cargar los pesos de los expertos.
- `attn_implementation="flash_attention_2"` es obligatorio y requiere GPU CUDA; el código lanza un error en caso contrario.
- La carga completa de las 53 capas y la generación extremo a extremo no se han verificado; solo se comprobó la carga de las primeras capas.
- No hay lista oficial de idiomas soportados ni datos sobre sesgos o riesgo de alucinación en la información disponible.
- Licencia MIT: permite uso comercial, pero al ser un derivado cuantizado conviene conservar la atribución al modelo base y revisar los términos del original.
- El ejemplo de la model card usa coreano, lo que sugiere que el modelo no está optimizado específicamente para castellano; no hay evidencia de calidad en español.

## Enlaces

- [axteam/Motif-3-NVFP4A16 en Hugging Face](https://huggingface.co/axteam/Motif-3-NVFP4A16)
- [Motif-Technologies/Motif-3 (modelo base)](https://huggingface.co/Motif-Technologies/Motif-3)
- [MotifTechnologies/vllm (fork de vLLM con soporte Motif-3)](https://github.com/MotifTechnologies/vllm)
