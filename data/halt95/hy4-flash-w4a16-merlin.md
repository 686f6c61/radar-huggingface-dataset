# halt95/Hy4-flash-W4A16-Merlin

## Resumen

Hy4-flash-W4A16-Merlin es una compilación cuantizada del modelo Hy4-flash de Tencent, un modelo de lenguaje de arquitectura MoE (Mixture of Experts) con 89.558 millones de parámetros totales según los safetensors del repositorio. La cuantización, realizada por el usuario halt95, aplica W4A16 (pesos de 4 bits, activaciones de 16 bits) a los expertos enrutados mediante round-to-nearest simétrico con grupo de tamaño 128 y sin calibración, mientras que las proyecciones de atención se mantienen en FP8 y el resto de componentes en BF16. El resultado ocupa 152,6 GB y está diseñado para ejecutarse en cuatro GPU de 24 GB (RTX 3090) con el contexto completo de 262.144 tokens.

El modelo resuelve el problema de desplegar un MoE de gran tamaño con contexto largo en hardware de consumo o de gama media, algo imposible con el checkpoint original en BF16. Para ello se apoya en el motor Merlin, un fork de vLLM optimizado para arquitecturas Ampere y Ada, que incorpora decodificación especulativa con un drafter DFly2, caché KV en FP8 y offload de las tablas Engram a RAM del host. Es relevante porque demuestra que un modelo de 220B totales (incluyendo 63,5B de parámetros Engram) puede servirse con 262K de contexto en cuatro RTX 3090 sin NVLink, con velocidades de decodificación de 75,7 tok/s a 4K y 89,3 tok/s a 262K en un solo stream.

La ficha se centra en la versión cuantizada W4A16, que requiere Merlin 3.0.2.2 o superior; ni las versiones anteriores de Merlin ni vLLM estándar pueden servir este checkpoint. El modelo base es tencent/Hy4-flash y la licencia es la Tencent Hy License 1.0, que impone restricciones de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con expertos enrutados, atención con proyecciones FP8, tablas Engram y drafter DFly2 para decodificación especulativa |
| Parametros totales | 89.558.262.182 (según safetensors); la model card del autor menciona 220B totales incluyendo 63,5B de parámetros Engram |
| Parametros activos | 512 expertos por capa, 16 activos (no se especifica el número exacto de parámetros activos) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | W4A16 (RTN simétrico, grupo 128) para expertos enrutados; FP8 block-128 para proyecciones de atención; FP8 para tablas Engram; INT4 para capas lineales del drafter; BF16 para el resto |
| Idiomas soportados | en (inglés) |
| Licencia | tencent-hy-license (Tencent Hy License 1.0) |
| Formato de pesos | safetensors, layout compressed-tensors; requiere el motor Merlin (fork de vLLM) |

## Arquitectura y entrenamiento

La arquitectura es un MoE con 512 expertos enrutados por capa y 16 activos, complementado con tablas Engram (cuatro tablas de 660 millones de filas de 96 valores cada una) que actúan como memoria externa y se mantienen en RAM del host en formato FP8. Las proyecciones de atención `q_b_proj`, `o_proj` y `linear_gate` de las capas 1 a 41 conservan los bytes FP8 del checkpoint tencent/Hy4-flash-FP8, mientras que el resto de tensores (capa 0, otras proyecciones de atención, expertos compartidos, routers, indexers, normas, lm_head, embeddings y encoder de visión) permanecen en BF16. La cuantización W4A16 de los expertos usa round-to-nearest simétrico con grupo de tamaño 128 y sin calibración, lo que simplifica el proceso pero puede introducir cierta pérdida de calidad frente a métodos con calibración.

El checkpoint incluye un drafter DFly2 de 5 capas con capas lineales en INT4, utilizado para decodificación especulativa. La caché KV se almacena en FP8 con formato `fp8_ds_mla`. El modelo base fue entrenado por Tencent; no se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable de esta compilación es la combinación de cuantización W4A16 en expertos, offload de tablas Engram a RAM del host, decodificación especulativa con DFly2 y caché KV en FP8, todo orquestado por el motor Merlin para permitir el despliegue en cuatro GPU de 24 GB con contexto completo.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Razonamiento con modo "thinking" activable y esfuerzo de razonamiento configurable (high en las mediciones).
- Soporte de decodificación especulativa mediante el drafter DFly2, que acelera la generación.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Tool calling y function calling: no se menciona explícitamente en la información disponible; el modelo base podría soportarlo, pero no está confirmado para esta compilación.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información proporcionada.
- Capacidades multilingües: solo inglés según la model card.
- Visión: el encoder de visión está presente en los archivos, pero Merlin no lo carga, por lo que la entrada de imágenes no está soportada.
- Audio: no disponible.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens de ventana, manteniendo el hilo de la conversación y el historial de interacciones sin truncamientos.
- Análisis de documentos extensos: con 262K de contexto, puede procesar informes, contratos o artículos de investigación completos en una sola pasada, extrayendo información y respondiendo preguntas sobre el contenido.
- Generación de código en producción: aunque no se confirma tool calling, el modelo base está orientado a generación de texto y podría integrarse en pipelines de revisión de código o generación de documentación técnica, siempre que se valide su calidad en este dominio.
- Asistentes de razonamiento prolongado: el modo "thinking" con esfuerzo alto permite abordar problemas que requieren cadenas de razonamiento largas, como planificación o resolución de problemas complejos.
- Procesamiento de corpus legales o científicos: la ventana de 262K tokens permite analizar múltiples documentos relacionados y generar resúmenes o comparativas sin perder contexto.
- Despliegue en infraestructura de gama media: al caber en cuatro RTX 3090 (24 GB cada una), es adecuado para laboratorios o empresas con hardware Ampere que no pueden permitirse A100/H100, manteniendo contexto completo y velocidades de decodificación de 75-89 tok/s.
- Servicio de chat con latencia controlada: la decodificación especulativa y la caché KV en FP8 permiten servir un solo stream con latencia aceptable para aplicaciones interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye mediciones de velocidad, pero no de calidad (MMLU, HumanEval, GSM8K, etc.). Se menciona una comparación de divergencia KL contra BF16 en la sección Quality, pero no se proporcionan los valores numéricos en la información extraída.

| Metrica | Valor |
|---|---|
| Decodificacion a 4K (1 stream, K=3) | 75,7 tok/s |
| Decodificacion a 262K (1 stream, K=5) | 89,3 tok/s |
| Prefill en prompt de 100K | 1.608 tok/s |
| Pool de KV en VRAM | 609.398 tokens (FP8) |

Medido en Merlin 3.0.2.2 sobre 4× RTX 3090 sin NVLink, 220 W, P2P activado, el 2026-11-21.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos sin Engram ocupan 88,0 GB en las GPU; las tablas Engram (64,7 GB en FP8) se alojan en RAM del host. Se necesitan cuatro GPU de 24 GB (96 GB totales) para alojar los pesos y la caché KV.
- GPU recomendadas: RTX 3090 (Ampere, sm86) es la plataforma medida; el motor Merlin está optimizado para Ampere y Ada. No se especifican otras GPU compatibles.
- ¿Cabe en consumer GPU? Sí, en cuatro RTX 3090 de 24 GB. No cabe en una sola GPU de consumo.
- Opciones de despliegue: exclusivamente el motor Merlin 3.0.2.2 o superior (fork de vLLM). No es compatible con vLLM estándar ni con llama.cpp, Ollama o TGI.
- Latencia y throughput: decodificación de 75,7 tok/s a 4K y 89,3 tok/s a 262K en un solo stream; prefill de 1.608 tok/s en un prompt de 100K. Medido con thinking activado y esfuerzo alto, T=0, mediana de 3 envíos en frío.
- RAM del host: aproximadamente 60 GiB para Engram en FP8 (unos 140 GiB disponibles antes del arranque). Para la variante BF16 Engram se necesitan unos 118 GiB y 198 GiB disponibles, respectivamente; esta variante no fue probada en hardware.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base tencent/Hy4-flash y su versión FP8 (tencent/Hy4-flash-FP8) son las referencias directas, pero no se aportan datos de rendimiento comparativo.

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| halt95/Hy4-flash-W4A16-Merlin | 89,5B (safetensors); 220B según model card | 262.144 | Tencent Hy License 1.0 | Hugging Face, requiere Merlin |
| tencent/Hy4-flash | No disponible | No disponible | Tencent Hy License 1.0 | Hugging Face |
| tencent/Hy4-flash-FP8 | No disponible | No disponible | Tencent Hy License 1.0 | Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al ser un modelo entrenado principalmente en inglés, puede presentar sesgos culturales y lingüísticos propios de los datos de entrenamiento.
- Riesgo de alucinación: no se cuantifica; como todo modelo generativo, puede producir información falsa o inventada, especialmente en dominios especializados.
- Limitaciones de contexto o idioma: solo soporta inglés según la model card; el contexto máximo es de 262.144 tokens, pero no se garantiza un rendimiento uniforme en todo el rango.
- Restricciones de licencia: la Tencent Hy License 1.0 puede imponer restricciones al uso comercial; es necesario revisar los términos completos antes de desplegar en producción.
- Caveat importante: requiere Merlin 3.0.2.2 o superior; no funciona con vLLM estándar ni con otras herramientas de inferencia. La variante BF16 Engram no ha sido probada en hardware y requiere más RAM del host.
- La cuantización W4A16 sin calibración puede degradar la calidad respecto al modelo original en BF16; no se proporcionan métricas de calidad comparativas en la información disponible.
- El encoder de visión está presente pero no se carga, por lo que no hay soporte de imágenes.
- El modelo está pensado para texto únicamente; no se mencionan capacidades de audio u otras modalidades.

## Enlaces

- [Hugging Face: halt95/Hy4-flash-W4A16-Merlin](https://huggingface.co/halt95/Hy4-flash-W4A16-Merlin)
- [Modelo base: tencent/Hy4-flash](https://huggingface.co/tencent/Hy4-flash)
- [Versión FP8: tencent/Hy4-flash-FP8](https://huggingface.co/tencent/Hy4-flash-FP8)
- [Repositorio del motor Merlin](https://github.com/halt95/merlin-engine)
- [Changelog de Merlin 3.0.2.2](https://github.com/halt95/merlin-engine/blob/merlin-v3.0.2.2/docs/CHANGELOG.md#measured-on-merlin-3022)
- [Licencia Tencent Hy License 1.0](https://huggingface.co/halt95/Hy4-flash-W4A16-Merlin/blob/main/LICENSE)
- [Discord de la comunidad](https://discord.gg/jVDYAwdGzt)
- [Ko-fi del autor](https://ko-fi.com/halt95)
