# avlp12/GLM-5.3-Flash-Alis-MTP-Drafter

## Resumen

GLM-5.3-Flash-Alis-MTP-Drafter es un modelo auxiliar de decodificación especulativa (drafter MTP, *Multi-Token Prediction*) extraído del modelo multimodal GLM-5.3-Flash de Z.AI, publicado por el usuario avlp12 en HuggingFace. Su función no es generar texto de forma autónoma, sino servir como modelo borrador para acelerar la inferencia del modelo principal en hardware Apple Silicon mediante la librería MLX. Es, según su autor, el primer drafter MTP independiente de GLM-5.3-Flash disponible en el Hub, ya que las conversiones MLX convencionales descartan la capa 45 (la encargada de la predicción multi-token), dejando a los modelos cuantizados sin ruta MTP.

El drafter tiene 7.432.592.416 parámetros en formato bf16, ocupa 14,9 GB y se distribuye bajo licencia MIT. Se integra con el *pull request* #2044 de mlx-vlm, que añade soporte para decodificación especulativa nativa. En pruebas realizadas por el autor sobre una M3 Ultra de 512 GB con un modelo objetivo de clase 4-bit, se midió una aceleración de 1,12× en decodificación con resultados bit-idénticos a la decodificación normal, y una tasa de aceptación de draft de aproximadamente el 89%. El modelo base GLM-5.3-Flash es un modelo híbrido de 320B parámetros totales con 18B activos, con ventana de contexto de 1M tokens, lo que hace especialmente relevante disponer de un drafter eficiente para reducir la latencia en tareas de contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glm5NextMTPDraftModel (model_type: glm5_next_mtp, block size 2) |
| Parametros totales | 7.432.592.416 |
| Parametros activos | no disponible (no es un MoE; es un drafter denso) |
| Longitud de contexto | no disponible para el drafter; el modelo base GLM-5.3-Flash soporta 1M tokens |
| Tipos de cuantizacion | bf16 (con bias de correccion del router en fp32) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (29 tensores, prefijo mtp.*) |

## Arquitectura y entrenamiento

El drafter es una extracción de la capa MTP (también denominada *nextn*) del modelo GLM-5.3-Flash, concretamente de la capa 45, que en la arquitectura original se encarga de predecir varios tokens futuros en paralelo. El autor lo extrajo de la versión oficial FP8 del modelo base (commit `84c6a6aa`) y aplicó una de-cuantización por bloques de referencia (bloque 128, `mx.from_fp8`) para obtener pesos bf16 limpios, reuniendo las escalas por experto a través del `switch_mlp` apilado. Esto era necesario porque el *splitter* de la rama PR de mlx-vlm escribía tensores FP8 sin configuración de cuantización, generando artefactos no cargables. El repositorio incluye los recibos de extracción y post-proceso (`SPLIT_RECEIPT.json` y `DEQUANT_RECEIPT.json`) para reproducibilidad.

El modelo base GLM-5.3-Flash, desarrollado por Z.AI, es el primer modelo multimodal nativo de la serie GLM-5, con una arquitectura híbrida altamente eficiente de 320B parámetros totales y 18B activos. Según la documentación de Z.AI, GLM-5.3-Flash ofrece mayor inteligencia que GLM-5.2 a un coste excepcionalmente bajo. El drafter no ha sido entrenado de forma independiente; hereda los pesos de la capa MTP del modelo base, por lo que su comportamiento está determinado por el entrenamiento original de GLM-5.3-Flash.

## Capacidades

- Decodificación especulativa: genera borradores de múltiples tokens que el modelo principal verifica en paralelo, reduciendo la latencia de inferencia.
- Compatibilidad con MLX: se carga mediante `load_drafter(path, kind="mtp")` en las ramas PR #2044/#2074 de mlx-vlm.
- Aceleración en Apple Silicon: diseñado específicamente para entornos MLX en hardware Apple (M3 Ultra probado, extensible a otras generaciones).
- Preservación de calidad: produce resultados bit-idénticos a la decodificación normal, sin degradación de la salida.
- Alta tasa de aceptación: aproximadamente 89% de los drafts son aceptados en configuraciones de clase 4-bit con contexto 512 y decodificación greedy.
- Integración con modelos cuantizados: permite que los modelos GLM-5.3-Flash cuantizados (que normalmente pierden la capa MTP) dispongan de ruta de decodificación especulativa.

## Casos de uso

- Inferencia de GLM-5.3-Flash en Mac Studio o MacBook Pro: el drafter permite acelerar la generación de texto en equipos Apple Silicon, donde la memoria unificada de 512 GB (o superior) puede alojar el modelo base cuantizado y el drafter simultáneamente.
- Despliegue de asistentes conversacionales con contexto largo: con 1M tokens de contexto en el modelo base, la decodificación especulativa reduce la latencia en tareas de resumen de documentos extensos o conversaciones multi-turno prolongadas.
- Generación de código en local: GLM-5.3-Flash destaca en tareas de codificación compleja; el drafter acelera la autocompletación y generación de código en entornos de desarrollo sin conexión a la nube.
- Investigación en decodificación especulativa: el repositorio sirve como referencia para estudiar la extracción y de-cuantización de capas MTP en modelos MoE híbridos, con recibos reproducibles.
- Prototipado de agentes multi-paso: la menor latencia por token permite iterar más rápido en pipelines de razonamiento encadenado o tool calling, donde cada paso requiere múltiples generaciones.
- Evaluación de modelos en hardware Apple: los desarrolladores pueden comparar el rendimiento de GLM-5.3-Flash con y sin drafter para medir el impacto real de la aceleración en sus cargas de trabajo específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks formales (MMLU, HumanEval, GSM8K, etc.) para este drafter, ya que no es un modelo autónomo sino un componente de aceleración. El autor proporciona mediciones empíricas en la model card, que se resumen a continuación:

| Metrica | Valor |
|---|---|
| Aceleracion de decodificacion (M3 Ultra, 4-bit target, ctx 512, greedy) | 1,12× |
| Tasa de aceptacion de drafts | ~89% |
| Fidelidad de salida | bit-idéntica a la decodificación normal |
| Hardware de prueba | M3 Ultra 512 GB |
| Formato del drafter | bf16 |

## Requisitos de hardware

- Memoria: el drafter ocupa 14,9 GB en disco y aproximadamente 14,9 GB en memoria unificada (bf16). Se suma a la memoria del modelo base cuantizado; por ejemplo, un GLM-5.3-Flash en 4-bit ocupa alrededor de 160 GB, por lo que se necesita un Mac con al menos 192 GB de memoria unificada para ambos.
- GPU recomendadas: Apple Silicon con GPU integrada; probado en M3 Ultra, compatible con M1/M2/M3/M4 series siempre que la memoria sea suficiente.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) porque MLX está restringido a Apple Silicon; el drafter no es utilizable en CUDA sin una conversión adicional no documentada.
- Opciones de despliegue: mlx-vlm con las ramas PR #2044/#2074, usando `load_drafter` con `kind="mtp"`. No hay soporte para vLLM, llama.cpp u Ollama en este repositorio.
- Latencia y throughput: la medición del autor indica 1,12× de aceleración en decodificación con contexto 512 y greedy; el throughput real depende del modelo base, la cuantización y el hardware.

## Comparativa con modelos similares

No hay disponibles otros drafters MTP independientes para GLM-5.3-Flash en el Hub, según la model card. La comparativa más relevante es contra el propio modelo base sin drafter:

| Modelo | Parametros | Contexto | Licencia | Formato | Uso |
|---|---|---|---|---|---|
| GLM-5.3-Flash (base) | 320B totales, 18B activos | 1M tokens | MIT | FP8, MLX | Modelo principal |
| GLM-5.3-Flash-Alis-MTP-Drafter | 7,43B | no disponible | MIT | bf16 (safetensors) | Drafter especulativo |
| GLM-5.2 (base) | 320B totales, 18B activos | 1M tokens | MIT | FP8, MLX | Modelo principal sin MTP extraído |

La alternativa sería no usar decodificación especulativa y aceptar la latencia completa del modelo base. No se dispone de datos de otros drafters comparables en el ecosistema MLX para GLM-5.3.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base GLM-5.3-Flash cargado en MLX; no puede generar texto por sí mismo.
- Dependencia de ramas experimentales: la integración con mlx-vlm depende de los PR #2044/#2074, que pueden cambiar o no fusionarse; el código puede quedar obsoleto.
- Hardware restringido: solo funciona en Apple Silicon con MLX; no hay soporte para CUDA, ROCm u otras plataformas.
- Sin garantías de rendimiento: la aceleración de 1,12× se midió en una configuración específica (M3 Ultra, 4-bit, ctx 512, greedy); otros contextos, cuantizaciones o modos de muestreo pueden variar el resultado.
- Sesgos y alucinaciones: al heredar los pesos del modelo base, el drafter no introduce sesgos adicionales, pero el sistema completo (base + drafter) está sujeto a los sesgos y limitaciones de GLM-5.3-Flash, que no se detallan en la información disponible.
- Licencia MIT: permite uso comercial, pero el modelo base GLM-5.3-Flash también es MIT, sin restricciones regionales según OpenLM.ai; sin embargo, se recomienda verificar la licencia del modelo base en su repositorio oficial.
- Reproducibilidad: los recibos de extracción están incluidos, pero la de-cuantización manual puede introducir diferencias sutiles respecto a la capa MTP original en FP8.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/avlp12/GLM-5.3-Flash-Alis-MTP-Drafter
- Modelo base GLM-5.3-Flash: https://huggingface.co/zai-org/GLM-5.3-Flash
- Documentación de Z.AI sobre GLM-5.3-Flash: https://docs.z.ai/guides/vlm/glm-5.3-flash
- Repositorio GitHub de GLM-5: https://github.com/zai-org/GLM-5
- PR de mlx-vlm #2044: https://github.com/Blaizzy/mlx-vlm/pull/2044
- Perfil del autor avlp12: https://huggingface.co/avlp12
