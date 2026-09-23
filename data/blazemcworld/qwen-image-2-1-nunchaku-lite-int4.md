# BlazeMCworld/Qwen-Image-2.1-nunchaku-lite-int4

## Resumen

`BlazeMCworld/Qwen-Image-2.1-nunchaku-lite-int4` es una version cuantizada a int4 del componente transformer de `Qwen/Qwen-Image-2.1`, un modelo de difusion de Qwen (Alibaba) orientado a generacion de imagenes. El checkpoint ha sido producido por el usuario BlazeMCworld aplicando la configuracion `NunchakuLiteQuantizationConfig` con el esquema `svdq_w4a4` (pesos y activaciones en 4 bits, tamano de grupo 64 y correccion de bajo rango de rango 32) sobre el transformer original en bfloat16.

El repositorio contiene unicamente el transformer cuantizado, no la pipeline completa: ni el text encoder ni el VAE estan incluidos, por lo que para generar imagenes hay que combinarlo con los componentes restantes del modelo base. El peso total declarado en los safetensors es de 3.819.581.440 parametros y el repositorio ocupa 4,1 GB, lo que lo situa en el rango de modelos que caben en GPUs de consumo cuando se usan formatos de 4 bits.

Su relevancia es fundamentalmente practica: permite reducir el coste de memoria de un transformer de difusion de gran tamano para inferencia local o para aumentar el batch por GPU en servidores. Hay que tener en cuenta que es un checkpoint recien publicado (0 descargas, 0 likes), sin benchmarks publicados, y que requiere una instalacion de `diffusers` desde `main` porque la version estable `0.40.0` no incluye los cambios necesarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (componente transformer de Qwen-Image-2.1); detalles arquitectonicos del base no disponibles |
| Parametros totales | 3.819.581.440 (safetensors del checkpoint cuantizado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 con esquema SVDQuant-lite `svdq_w4a4` (precision int4, group_size 64, rank 32); la etiqueta del repo incluye tambien `8-bit`, en contradiccion con la configuracion documentada en la model card |
| Idiomas soportados | no disponible (el prompt de texto lo procesa el text encoder del modelo base, no incluido en este repo) |
| Licencia | qwen-research (`license: other`, `license_name: qwen-research`) |
| Formato de pesos | safetensors, integrado con `diffusers` (`QwenImage21Transformer2DModel`) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado desde cero, sino de un proceso de cuantizacion post-entrenamiento aplicado a los pesos del transformer de `Qwen/Qwen-Image-2.1`, originalmente en `torch_dtype=torch.bfloat16`. La cuantizacion usa `NunchakuLiteQuantizationConfig` con `svdq_w4a4`, es decir, 4 bits para pesos y activaciones, con un tamano de grupo de 64 y una componente de bajo rango de rango 32 (`svd_lowrank`) que compensa el error introducido por la cuantizacion. La model card indica que durante la cuantizacion se sustituyo `torch.linalg.svd` por `svd_lowrank`.

El checkpoint resultante se guardo con `save_pretrained`, por lo que la estructura de pesos es la esperada por `diffusers`. La carga del checkpoint pre-cuantizado funciona con una instalacion desde `main` de `diffusers`; la cuantizacion desde cero requiere ademas el PR 14608 del repositorio de `diffusers`. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre si el modelo base utilizo RLHF, DPO u otras tecnicas de alineacion.

## Capacidades

- Generacion de imagenes a partir de texto: al ser una cuantizacion del transformer de `Qwen-Image-2.1`, hereda las capacidades generativas del modelo base; la model card no detalla la lista concreta de tareas soportadas.
- Inferencia con pesos en 4 bits: el esquema `svdq_w4a4` reduce el espacio de pesos a aproximadamente la mitad respecto a un formato de 8 bits, manteniendo la estructura de `diffusers`.
- Compatibilidad con el ecosistema `diffusers`: se carga mediante `QwenImage21Transformer2DModel.from_pretrained(...)`, lo que permite integrarlo en pipelines existentes que ya usen el componente transformer del base.
- Solo transformer: no incluye text encoder, VAE ni scheduler, por lo que la generacion de imagenes completa exige mezclarlo con los componentes del modelo base.
- Tool calling, agentes, razonamiento multi-paso, vision, audio o thinking mode: no aplica o no disponible; es un modelo de difusion para generacion de imagenes, no un LLM conversacional.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia local en GPU de consumo: al ocupar los pesos int4 alrededor de 2 GB (frente a ~7,6 GB en bf16 para el mismo numero de parametros), el transformer puede residir en GPUs como una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB, dejando margen para el text encoder y el VAE del modelo base.
- Servicio de generacion de imagenes con mayor concurrencia: en una misma GPU de datacenter se pueden mantener mas instancias o batches simultaneos del transformer, lo que reduce el coste por imagen en comparacion con la version bf16.
- Prototipado e investigacion en cuantizacion: sirve como referencia reproducible del esquema `svdq_w4a4` de nunchaku-lite (group_size 64, rank 32) para comparar calidad y latencia frente a otras configuraciones de cuantizacion.
- Integracion en aplicaciones basadas en diffusers: cualquier producto que ya use `QwenImage21Transformer2DModel` puede sustituir el transformer bf16 por este checkpoint y reducir requisitos de VRAM sin cambiar la interfaz de la pipeline.
- Despliegue on-premise o en edge sin conectividad: el menor peso del checkpoint facilita distribuirlo en entornos con almacenamiento o ancho de banda limitados (4,1 GB de repositorio frente a los ~15 GB que ocuparia el transformer en bf16).
- Evaluacion de degradacion por cuantizacion: util para medir la perdida de fidelidad (artefactos, coherencia de prompt, detalle fino) entre int4 y bf16 antes de decidir un despliegue en produccion.
- Generacion por lotes de assets graficos: en flujos de marketing o videojuegos donde se generan cientos de imagenes por job, el ahorro de memoria permite aumentar el batch y amortizar mejor cada paso de difusion.
- Reduccion de horas-GPU en la nube: en un cluster con A100 o H100, servir el transformer en int4 puede liberar memoria para paralelizar mas peticiones por dispositivo y bajar el coste por imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de calidad (FID, CLIP score, evaluaciones de adherencia al prompt) ni comparaciones numericas frente al modelo base en bfloat16.

## Requisitos de hardware

- VRAM estimada para el transformer cuantizado: aproximadamente 2-2,5 GB solo para los pesos int4 (3,82 mil millones de parametros a 4 bits son ~1,91 GB, mas escalas de grupo y componentes de bajo rango). Es una estimacion derivada del numero de parametros y del esquema de cuantizacion, no un dato publicado.
- VRAM estimada para el transformer en bf16 (referencia del base): en torno a 7,6 GB solo en pesos.
- VRAM total de la pipeline: hay que sumar el text encoder y el VAE del modelo base, no incluidos en este repositorio, ademas de las activaciones que dependen de la resolucion de generacion y del tamano de lote. No disponible como cifra oficial.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4090, A100, H100. El checkpoint esta pensado para ejecutarse con `device_map="cuda"`.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8-12 GB o mas, siempre que se gestionen con cuidado el text encoder y el VAE; la cifra exacta no esta publicada.
- Opciones de despliegue: `diffusers` con instalacion desde `main` para cargar el checkpoint pre-cuantizado (la version estable 0.40.0 no lo soporta) y con el PR 14608 para cuantizar desde cero. No hay confirmacion de soporte en vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BlazeMCworld/Qwen-Image-2.1-nunchaku-lite-int4 | 3.819.581.440 | int4 (svdq_w4a4, group_size 64, rank 32) | no disponible | qwen-research | HuggingFace, solo transformer, via diffusers `main` |
| Qwen/Qwen-Image-2.1 (base) | no disponible en la informacion proporcionada | bf16 (sin cuantizar) | no disponible | qwen-research | HuggingFace, pipeline completa |
| Otros checkpoints cuantizados de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de terceros ni de modelos comparables alternativos en la informacion proporcionada, por lo que la comparacion se limita al modelo base.

## Limitaciones y advertencias

- No incluye la pipeline completa: solo el transformer. Sin el text encoder, el VAE y el scheduler del modelo base no se pueden generar imagenes.
- Requiere `diffusers` desde `main`: la version estable 0.40.0 no incorpora los cambios necesarios. Para cuantizar desde cero hace falta ademas el PR 14608, lo que implica riesgo de cambios de API.
- Posible degradacion por cuantizacion: al pasar pesos y activaciones a 4 bits con group_size 64 y rank 32, es esperable cierta perdida de fidelidad frente a bf16, pero no hay datos publicados que la cuantifiquen.
- Inconsistencia en las etiquetas: el repositorio incluye la etiqueta `8-bit` mientras que la configuracion documentada es int4; conviene verificar los pesos antes de asumir un formato concreto.
- Licencia `qwen-research`: es una licencia de investigacion, no una licencia permisiva estandar. Hay que revisar sus terminos antes de cualquier uso comercial, y en particular antes de redistribuir el checkpoint o integrarlo en un producto.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de los datos, sin benchmarks ni evaluaciones independientes que respalden la calidad del checkpoint.
- Riesgo de alucinacion visual: en modelos de difusion esto se traduce en imagenes que no respetan fielmente el prompt, texto mal renderizado o artefactos; no hay mediciones publicadas para este checkpoint.
- Idiomas y contexto: no disponibles; el comportamiento multilingue del prompt dependera del text encoder del base, no incluido aqui.
- Sesgos: no hay informacion sobre sesgos del modelo base ni sobre como la cuantizacion los afecta.
- Metadatos con fecha de creacion y actualizacion en 2026-09-23, posteriores al checkpoint del modelo base; conviene comprobar la procedencia real de los pesos si se va a usar en produccion.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/BlazeMCworld/Qwen-Image-2.1-nunchaku-lite-int4
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- PR de diffusers necesario para cuantizar: https://github.com/huggingface/diffusers/pull/14608
