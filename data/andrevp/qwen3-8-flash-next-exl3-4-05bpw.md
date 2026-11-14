# andrevp/Qwen3.8-Flash-Next-exl3-4.05bpw

## Resumen

Qwen3.8-Flash-Next es un modelo linguistico causal con codificador de vision, publicado por el equipo Qwen (Alibaba) como avance experimental de la arquitectura que sustentara la proxima generacion Qwen4. Se distribuye como modelo post-entrenado en formato Hugging Face Transformers y es compatible con motores de inferencia como vLLM, SGLang o TokenSpeed. La ficha que nos ocupa, sin embargo, no es el modelo original: es una cuantizacion EXL3 a 4,05 bits por peso realizada por el usuario andrevp, que reduce el repositorio a 107,5 GB.

La relevancia tecnica del modelo reside en su diseno hibrido. Combina capas de Gated DeltaNet (atencion lineal) con Qwen Sparse Attention (QSA), una atencion dispersa que opera a nivel de micro-bloque en lugar de token individual, lo que rebaja la latencia en contextos largos. Anade ademas embeddings de n-gramas (hasta 20 millones de bigramas y trigramas en la capa 2) como eje alternativo de escalado de parametros, mas barato computacionalmente que escalar mezcla de expertos y apto para offloading en aceleradores con memoria limitada.

El modelo declara 125.000 millones de parametros totales con 6.000 millones activos, mas 51.000 millones en el embedding de n-gramas y 4.000 millones en el modulo MTP (multi-token prediction). Soporta contexto nativo de 262.144 tokens, extensible hasta 1.000.000, y procesa entradas de imagen y texto. La licencia es Qwen Community 1.0, que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con vision encoder: Gated DeltaNet (atencion lineal) + Qwen Sparse Attention (QSA), MoE y Gated Residual |
| Parametros totales | 125B (6B activos) + 51B de embedding n-gramas + 4B de MTP; el checkpoint safetensors de esta cuantizacion suma 33.834.369.664 parametros almacenados |
| Parametros activos | 6B (10 expertos enrutados + 1 compartido por token) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantizacion | EXL3 a 4,05 bits por peso (esta ficha); el modelo original se distribuye en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community 1.0 (license_name: qwen-community-1.0; license: other) |
| Formato de pesos | safetensors (EXL3), compatible con transformers; el modelo base admite vLLM, SGLang y TokenSpeed |

## Arquitectura y entrenamiento

El layout oculto es de 48 capas organizadas en 12 bloques de la forma 3 x (Gated DeltaNet -> MoE) -> 1 x (Qwen Sparse Attention -> MoE). La dimension oculta es 2560. Gated DeltaNet usa 48 cabezas lineales para V y 16 para QK, con dimension de cabeza 128. Qwen Sparse Attention emplea 24 cabezas de consulta y 2 de clave-valor con dimension 256, RoPE de 64 dimensiones y un indexador MQA de 4 cabezas de consulta y 1 cabeza de clave compartida (dimension 128); su presupuesto es de 512 bloques o 2048 tokens. La capa MoE tiene 512 expertos, activa 10 enrutados mas 1 compartido y usa dimension intermedia de 640. Gated Residual opera con 4 ramas y rango de cuello de botella 320. El vocabulario esta paddeado a 248.320 entradas y el modulo MTP consta de 1 capa entrenada con multiples pasos.

El entrenamiento consta de pre-entrenamiento y post-entrenamiento, con una receta que aplica Muon y AdamW a categorias de pesos especificas, elimina los warmups de tamano de batch (arrancando directamente en el batch objetivo) y ajusta las tasas de aprendizaje mediante leyes de escalado reajustadas. No se detalla en la informacion disponible el volumen de tokens, la composicion del dataset ni si hubo RLHF o DPO. Las innovaciones declaradas son la atencion dispersa por micro-bloques, el Gated Residual con compuerta de lectura dependiente de datos y compuerta escalar de escritura por rama, y el embedding de n-gramas como eje de escalado.

## Capacidades

- Generacion de texto y razonamiento en contextos largos, con ventana nativa de 262.144 tokens y extension hasta 1.000.000.
- Procesamiento de imagen y texto (pipeline image-text-to-text), gracias al codificador de vision integrado.
- Mezcla de expertos con 6B parametros activos, lo que reduce el coste computacional por token frente a un denso de 125B.
- Prediccion multi-token (MTP) de 1 capa, util para decodificacion especulativa y aceleracion de inferencia.
- Soporte declarado de tool calling y flujos agente multi-paso: la model card justifica QSA precisamente por la carga de trabajo agentica.
- Capacidades multilingues: no disponible el detalle de idiomas.
- Compatibilidad con transformers, vLLM, SGLang y TokenSpeed en el modelo base.

## Casos de uso

- Atencion al cliente automatizada: la ventana de 262.144 tokens permite mantener conversaciones multi-turno con historial extenso y documentacion de producto adjunta sin truncar contexto.
- Analisis de documentos largos con imagenes: al combinar vision y contexto largo, puede procesar informes con graficos, tablas escaneadas y texto en una sola pasada.
- Agentes autonomos multi-paso: el soporte de tool calling y la atencion dispersa por micro-bloques reducen la latencia en cadenas largas de llamadas a herramientas, escenario para el que el autor disena explicitamente QSA.
- Generacion de codigo en pipelines de CI/CD: con 6B parametros activos, el coste por token es contenido y puede desplegarse en vLLM o SGLang para revision de codigo y generacion de parches.
- Razonamiento sobre repositorios completos: la extension a 1.000.000 tokens permite indexar bases de codigo grandes y responder preguntas de arquitectura o dependencias.
- Despliegue en hardware con memoria limitada: el embedding de n-gramas y la cuantizacion EXL3 a 4,05 bpw estan pensados para offloading y para ejecucion en aceleradores con VRAM restringida.
- Investigacion sobre arquitecturas hibridas: util para estudiar el comportamiento de Gated DeltaNet, QSA y Gated Residual en cargas reales antes de la llegada de Qwen4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de resultados con estilos CSS, pero los valores numericos no estan presentes en el contenido extraido.

## Requisitos de hardware

- VRAM estimada: el repositorio EXL3 ocupa 107,5 GB en disco; la inferencia requiere al menos esa cifra mas overhead de activaciones y cache KV, por lo que no cabe en GPUs de consumo de 24 GB ni en configuraciones de 48 GB.
- GPU recomendadas: no disponible el detalle del autor; por tamano, se necesitan configuraciones multi-GPU de clase A100 80 GB, H100 80 GB o H200.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 5090; solo seria viable con offloading agresivo a RAM y penalizacion severa de latencia.
- Opciones de despliegue: transformers (formato del checkpoint), vLLM, SGLang y TokenSpeed segun la model card del modelo base; para EXL3 se requiere el runtime de ExLlamaV3 compatible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (esta ficha, EXL3 4,05 bpw) | 125B + 51B n-gram + 4B MTP | 6B | 262.144 (hasta 1M) | Qwen Community 1.0 | Cuantizacion de terceros, 107,5 GB |
| Qwen3.8-Flash-Next (original BF16) | 125B + 51B n-gram + 4B MTP | 6B | 262.144 (hasta 1M) | Qwen Community 1.0 | Pesos oficiales, mayor huella de memoria |
| Qwen3.8-Flash (servicio Qwen Cloud) | no disponible | no disponible | 1M por defecto | Comercial (API) | Version gestionada con herramientas integradas |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | No hay datos en la informacion proporcionada |

## Limitaciones y advertencias

- Es una cuantizacion EXL3 de terceros (autor andrevp, 0 descargas y 0 likes en el momento de la ficha): no procede del equipo Qwen y puede degradar la calidad respecto al BF16 original, especialmente en tareas sensibles a precision.
- La cuantizacion a 4,05 bpw no preserva necesariamente el rendimiento declarado en la model card; los benchmarks del modelo base no son trasladables sin validacion propia.
- La licencia Qwen Community 1.0 impone condiciones adicionales al uso comercial; es obligatorio revisar el texto de LICENSE antes de desplegar en produccion.
- No hay informacion sobre sesgos, idiomas soportados ni evaluaciones de seguridad en la documentacion disponible.
- Riesgo de alucinacion inherente a los modelos generativos; sin datos de evaluacion especificos no puede acotarse.
- El modelo se presenta como avance experimental de la arquitectura Qwen4: no debe tratarse como una version estable de produccion.
- El contexto extendido a 1.000.000 tokens requiere tecnicas de extension no detalladas y puede degradar la calidad en los extremos de la ventana.
- El tamaNo del repositorio (107,5 GB) y la necesidad de runtime EXL3 limitan las opciones de despliegue y complican la portabilidad frente a formatos GGUF.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/andrevp/Qwen3.8-Flash-Next-exl3-4.05bpw
- Blog oficial del modelo: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe tecnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Servicio gestionado Qwen Cloud: https://www.qwencloud.com
- Ficha de Qwen3.8-Flash en Qwen Cloud: https://www.qwencloud.com/models/qwen3.8-flash
- Diagrama de arquitectura: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.8-Flash-Next/architecture.png
