# cbert33/GLM-5.3-Flash-Uncensored-EXL3-DGX-Sliced

## Resumen

GLM-5.3-Flash-Uncensored-EXL3-DGX-Sliced es una transformación de almacenamiento de un modelo multimodal de tipo Mixture-of-Experts (MoE) derivado de la familia GLM-5.3 Flash de Z.ai. El autor de esta variante es cbert33, que parte de la cuantización EXL3 publicada por neko-legends (Depths), a su vez construida sobre una línea de pesos "uncensored" (abliterated) atribuida a orcarouter. El modelo original declara 320.000 millones de parámetros totales con 18.000 millones activos por token, aunque el recuento real de safetensors del repositorio es de 87.963.368.862 parámetros, discrepancia que el propio autor atribuye a un fallo de Hugging Face al calcular parámetros en cuantizaciones EXL3.

La aportación concreta de este checkpoint no es un nuevo entrenamiento ni una recalibración, sino un cambio de disposición de los tensores: cada tensor EXL3 de experto enrutado se almacena como tensores Trellis explícitos de rango 0 y rango 1 (rank-slicing), lo que permite repartir el modelo entre dos nodos NVIDIA DGX Spark con paralelismo tensorial de grado 2. La conversión es declarada como sin pérdida: no desquantiza, no recalibra y no recuantiza los pesos de neko-legends.

Su relevancia es fundamentalmente de infraestructura: permite ejecutar un MoE multimodal de gran tamaño en hardware de consumo profesional (DGX Spark, arquitectura SM120) mediante un runner vLLM personalizado, con decodificación especulativa DFlash2 y atención FlashInfer nativa. No es un modelo para uso general con transformers estándar, sino un artefacto de despliegue especializado y experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer multimodal; familia GLM-5.3 Flash (tag `glm5_next`) |
| Parametros totales | 320B declarados por el autor; 87.963.368.862 segun safetensors (discrepancia atribuida a un fallo de Hugging Face con EXL3) |
| Parametros activos | 18B (declarado por el autor) |
| Longitud de contexto | Hasta 800.000 tokens en el perfil de runner probado (`maximum model length: 800000`) |
| Tipos de cuantizacion | EXL3 de 4 bits con Trellis; almacenamiento rank-sliced (rank0/rank1); KV cache objetivo en `fp8_ds_mla` |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Mixta: base GLM-5.3 Flash MIT, calibracion ShapleyMcg License v1.0 (`shapleymcg-license-1.0`), artefacto etiquetado como `license:other` |
| Formato de pesos | safetensors (esquema de tensores rank-sliced propio, no compatible con vLLM/Transformers estandar) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer MoE multimodal de la familia GLM-5.3 Flash, con pipeline `image-text-to-text`, es decir, acepta entradas de imagen y texto y genera texto. La variante aquí descrita incorpora atención MLA (Multi-head Latent Attention), a juzgar por el backend `FLASHINFER_MLA_SPARSE_SM120` empleado en el perfil de ejecución, y una cabeza de decodificación especulativa externa (DFlash2) que actúa como drafter.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base. Lo que sí está documentado es el proceso de post-procesado: la línea "uncensored" proviene de una abliteration aplicada al checkpoint de lenguaje, y la cuantización EXL3 fue calibrada con la pipeline ShapleyMCG, que genera tensores de escala por experto (`suh`, `svh`, `mcg`). La innovación técnica de este repositorio es puramente de almacenamiento: el rank-slicing de tensores Trellis permite particionar los expertos enrutados entre dos nodos sin desquantizar, habilitando TP2 sobre DGX Spark.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Procesamiento multimodal imagen-texto (pipeline `image-text-to-text`).
- Razonamiento y respuesta a instrucciones heredados del modelo base GLM-5.3 Flash.
- Tool calling y uso en flujos agénticos: el smoke test documentado cubre 15 turnos y 17 llamadas a herramientas con puntuación 8/8.
- Decodificación especulativa mediante drafter DFlash2 externo, con aceptación configurable de 1 a 7 tokens (recomendado 5).
- Comportamiento "uncensored": la abliteration reduce los rechazos, lo que constituye tanto una capacidad declarada como un riesgo operativo.
- No se documentan capacidades de audio ni modos de "thinking" explícitos.

## Casos de uso

- Investigación sobre alineación y abliteration: el checkpoint permite estudiar empíricamente cómo la eliminación de dirección de rechazo afecta a la coherencia, el bucle y la calidad conversacional en un MoE de gran escala.
- Despliegue multi-nodo en laboratorio: sirve como banco de pruebas para validar rank-slicing EXL3, paralelismo tensorial TP2 y atención FlashInfer SM120 sobre dos DGX Spark, con un perfil de referencia reproducible.
- Evaluación de decodificación especulativa: al integrarse con el drafter DFlash2 y tokens de borrador ajustables (1-7), permite medir ganancias de throughput y tasa de aceptación en cargas agénticas reales.
- Procesamiento de documentos largos con imagen y texto: la ventana de hasta 800.000 tokens y el pipeline multimodal lo hacen apto para resumir o extraer información de expedientes extensos que combinan páginas escaneadas y texto.
- Pipelines agénticos con herramientas: el soporte de tool calling y los resultados del canary (17 llamadas, 8/8) lo sitúan como candidato para orquestación de agentes en entornos controlados de investigación.
- Estudio de cuantización de bajo bit en MoE: la combinación EXL3 4-bit más escalas ShapleyMcg permite analizar la degradación de calidad frente al modelo sin cuantizar en tareas de razonamiento y generación.
- Generación de contenido sin restricciones de rechazo en entornos de investigación creativa, siempre con salvaguardas a nivel de aplicación dado el carácter abliterated del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento documentados son de runtime:

| Metrica | Valor |
|---|---|
| Carga de checkpoint | 164 GiB en dos nodos DGX Spark |
| Carga de trabajo aceptada | 335.046 tokens de prompt y 18.672 tokens de completion en 521,94 s |
| KV cache lógico reportado | 1.152.606 tokens |
| Memoria de cache por rank | 11.000.000.000 bytes |
| Mejora de throughput vs. EXL3 previo | 15-25 % en uso agéntico (medido por el autor) |
| Smoke test agéntico | 15 turnos, 17 llamadas a herramientas, 8/8 |
| Reinicios / OOM / errores | 0 en ambos ranks |

## Requisitos de hardware

- VRAM/almacenamiento: el checkpoint ocupa 176 GB en repositorio y se carga en 164 GiB repartidos entre dos nodos.
- GPU objetivo: dos NVIDIA DGX Spark (arquitectura SM120/SM121), con paralelismo tensorial de grado 2.
- No cabe en una GPU de consumo convencional (RTX 4090, 24 GB) ni en una única A100/H100 de 80 GB por el esquema de particionado y el tamaño total.
- Runner obligatorio: `cb-vllm-dual-dgx`, basado en vLLM 0.30.0 con librerías nativas SM120; vLLM estándar y Transformers no interpretan el esquema rank-sliced.
- Configuración de referencia: `quantization: exl3`, `load format: instanttensor`, `attention backend: FLASHINFER_MLA_SPARSE_SM120`, `target KV cache: fp8_ds_mla`, `maximum sequences: 2`.
- Decodificación especulativa: drafter separado `local-inference-lab/GLM-5.3-Flash-DFlash2-MXFP8`, con 5 tokens de borrador recomendados.
- Latencia y throughput: no se publican tok/s absolutos; solo la mejora relativa del 15-25 % frente al runner EXL3 anterior.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cbert33/GLM-5.3-Flash-Uncensored-EXL3-DGX-Sliced | 320B totales / 18B activos (declarado) | 800.000 tokens (perfil de runner) | safetensors EXL3 4-bit rank-sliced | Mixta (MIT + ShapleyMcg v1.0) | Hugging Face, runner propio |
| neko-legends/GLM-5.3-Flash-Uncensored-EXL3 | 320B totales / 18B activos (declarado) | no disponible | safetensors EXL3 4-bit | Mixta | Hugging Face |
| GLM-5.3 Flash base (Z.ai) | 320B totales / 18B activos (declarado) | no disponible | safetensors | MIT | Hugging Face |
| local-inference-lab/GLM-5.3-Flash-DFlash2-MXFP8 | no disponible (drafter) | no disponible | MXFP8 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Modelo abliterated: no se puede asumir que rechace peticiones dañinas; requiere salvaguardas a nivel de aplicación y no debe exponerse sin filtros.
- El autor declara explícitamente que es para investigación y no para producción.
- Riesgo de bucle e incoherencia señalado por el propio autor en otras variantes abliterated de GLM; la calidad de esta versión depende del runner y del drafter.
- Solo soporta inglés según la metadata del repositorio.
- Esquema de tensores no estándar: no funciona con vLLM ni Transformers de serie; requiere el runner personalizado y la configuración exacta documentada.
- Licencia mixta y restrictiva: la ShapleyMcg License v1.0 exige atribución y no concede derechos a determinadas personas (0xSero); el uso comercial queda sujeto a revisión legal de las tres capas (MIT, ShapleyMcg y lineage uncensored).
- Discrepancia entre los 320B declarados y los 87,96B contados en safetensors: conviene verificar el recuento real antes de planificar recursos.
- Dependencia de hardware muy específica (dos DGX Spark, SM120); no hay validación documentada en otras plataformas.
- El drafter DFlash2 es un artefacto separado con su propia licencia no especificada.
- Riesgo de alucinación no cuantificado: no hay benchmarks publicados que permitan estimarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cbert33/GLM-5.3-Flash-Uncensored-EXL3-DGX-Sliced
- Modelo base cuantizado: https://huggingface.co/neko-legends/GLM-5.3-Flash-Uncensored-EXL3
- Runner vLLM personalizado: https://github.com/cbertucci33/cb-vllm-dual-dgx
- Drafter DFlash2: https://huggingface.co/local-inference-lab/GLM-5.3-Flash-DFlash2-MXFP8
- Licencia ShapleyMcg v1.0: https://github.com/brandonmmusic-max/shapleymcg/blob/main/LICENSE
- Repositorio ShapleyMCG: https://github.com/brandonmmusic-max/shapleymcg
