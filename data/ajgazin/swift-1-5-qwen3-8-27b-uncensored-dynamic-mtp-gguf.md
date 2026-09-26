# ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-Dynamic-MTP-GGUF

## Resumen

Swift-1.5-Qwen3.8-27B-Uncensored-Dynamic-MTP-GGUF es una familia de cuantizaciones GGUF del modelo ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP, publicado por el usuario ajgazin. Se trata de un derivado en cadena: parte de Qwen3.8-27B, sobre el que UkisAI aplicó un ajuste fino orientado a eficiencia de razonamiento (Swift 1.5), que después fue "abliterado" eliminando la dirección de rechazo de orcarouter/Qwen3.8-27B-Uncensored, y finalmente convertido a GGUF con cuantización dinámica de Unsloth Dynamic 3.0 e importance matrix.

El modelo resuelve dos necesidades concretas: por un lado, ofrecer una variante sin mecanismos de rechazo (23/100 rechazos frente a 98/100 del Swift 1.5 original, con divergencia KL de 0,0884) manteniendo el resto de capacidades; por otro, facilitar el despliegue local en hardware de consumo mediante 12 niveles de cuantización que van de 9,2 GiB a 50,9 GiB. Incorpora además la cabeza MTP (Multi-Token Prediction) en todos los GGUF principales, lo que habilita decodificación autoespeculativa en llama.cpp, y un proyector de visión para entrada de imagen y vídeo.

La relevancia actual del modelo reside en la combinación de tres elementos poco habituales en un mismo paquete: multimodalidad (pipeline image-text-to-text), decodificación especulativa integrada sin fichero draft separado, y una licencia propia (swift-open-license-1.0) que hay que revisar antes de cualquier uso comercial. El repositorio acumula 3.755 descargas y 13 likes, con un tamaño total de 243,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8) con cabeza MTP (Multi-Token Prediction) y proyector de visión; detalles de capas y atención no disponibles |
| Parametros totales | ~27B nominales; el índice de safetensors del repo declara 460.730.096, cifra incoherente con el nombre del modelo y con los tamanos de los cuantizados (se toma con reserva) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (los ejemplos de uso de la model card emplean 32.768 tokens con `-c 32768`) |
| Tipos de cuantizacion | UD-Q2_K_XL (9,2 GiB), UD-IQ3_XXS (10,2 GiB), UD-IQ3_S (11,2 GiB), UD-Q3_K_XL (12,2 GiB), UD-IQ4_XS (13,3 GiB), UD-Q4_K_S (14,3 GiB), UD-Q4_K_XL (16,4 GiB), UD-Q5_K_S (17,4 GiB), UD-Q5_K_M (18,4 GiB), UD-Q6_K_XL (23,6 GiB), UD-Q8_K_XL (29,3 GiB), BF16 (50,9 GiB); mezclas por tensor IQ1_S/IQ2_XXS/IQ2_XS/IQ2_S/IQ3_XXS/IQ3_S/IQ4_XS/IQ4_NL/Q2_K/Q3_K/Q4_K/Q5_K/Q6_K/Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (etiquetada como `license: other`); enlace al texto en ukisai/Swift-1.5-Qwen3.8-27b |
| Formato de pesos | GGUF (llama.cpp); BF16 GGUF sin cuantizar; proyector de visión `mmproj-BF16.gguf`; fichero auxiliar `tensor_types.tsv`; el modelo origen esta en safetensors BF16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Qwen3.8, en su variante de 27B, ajustado por UkisAI para ser eficiente en razonamiento (Swift 1.5 Qwen3.8-27B). Sobre ese modelo se aplicó la dirección de rechazo calculada en orcarouter/Qwen3.8-27B-Uncensored, siguiendo el método de una única dirección de Arditi et al. 2024 (arxiv:2406.11717). La edición afectó a 131 tensores: salidas de atención, `mlp.down_proj`, `embed_tokens` y la capa MTP; el resto de pesos permanece idéntico al Swift 1.5 original. El resultado declara 23/100 rechazos frente a los 98/100 del modelo sin abliterar, con una divergencia KL de 0,0884 medida sobre los pesos BF16 (no recalculada en los cuantizados), usando Heretic con 100 prompts de `mlabonne/harmful_behaviors`, detector de rechazo por palabras clave y KL del primer token sobre `mlabonne/harmless_alpaca`, omitiendo el modo thinking.

El proceso de cuantización parte de los safetensors BF16 del modelo fuente (1.199 tensores, MTP incluido) convertidos con `convert_hf_to_gguf.py` de llama.cpp, una vez para el modelo de lenguaje y otra con `--mmproj` para el proyector de visión. La cuantización se realizó con `llama-quantize` empleando `imatrix_unsloth.gguf` procedente de unsloth/Qwen3.8-27B-GGUF, más un `--tensor-type-file` que fija el tipo de cada tensor al que Unsloth eligió para su GGUF del mismo tamano (layout Unsloth Dynamic 3.0). La innovación destacable es la inclusión de la cabeza MTP en cada GGUF principal, que permite decodificación autoespeculativa en llama.cpp sin fichero draft adicional.

## Capacidades

- Generación de texto y razonamiento: el modelo piensa antes de responder por defecto (modo thinking activado de serie), con parámetros de muestreo recomendados de temperatura 1,0, top_p 0,95, top_k 20 y min_p 0.
- Entrada multimodal de imagen y vídeo a través del proyector incluido (`mmproj-BF16.gguf`), con pipeline declarado image-text-to-text.
- Decodificación autoespeculativa mediante la cabeza MTP integrada (`--spec-type draft-mtp`), que acelera la generación sin necesidad de un modelo draft externo.
- Conversión sin censura: reducción drástica de rechazos (23/100 frente a 98/100 del modelo base) manteniendo el resto del comportamiento, con KL de 0,0884.
- Capacidades multilingües: no disponibles; la model card no detalla el reparto de idiomas.
- Tool calling / function calling: no se documenta explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no se documenta explícitamente, aunque el modo thinking por defecto es compatible con flujos de razonamiento encadenado.

## Casos de uso

- Despliegue local sin censura en estación de trabajo: con UD-Q4_K_XL (16,4 GiB) cabe en una GPU de 24 GB dejando espacio para contexto largo, y evita los rechazos del modelo base en tareas de redacción o análisis de contenido sensible.
- Asistente multimodal en el escritorio: el proyector `mmproj-BF16.gguf` (0,9 GiB) habilita descripción de imágenes y vídeo, útil para catalogación de material audiovisual o extracción de información de capturas.
- Generación acelerada con decodificación especulativa: activando `--spec-type draft-mtp` en una build de llama.cpp con soporte MTP para `qwen35`, se aprovecha la cabeza integrada para reducir latencia en respuestas largas.
- Investigación sobre alineación y abliteración: sirve como referencia reproducible para estudiar el efecto de eliminar una única dirección de rechazo (131 tensores editados, KL medido con Heretic) frente al modelo sin modificar.
- Evaluación comparativa de cuantizaciones: los 12 niveles UD, con `tensor_types.tsv` documentando el tipo de cada tensor, permiten medir la degradación de calidad frente al BF16 en una misma arquitectura.
- Prototipado en GPU de gama media: UD-Q2_K_XL (9,2 GiB) o UD-IQ3_XXS (10,2 GiB) permiten ejecutar un modelo de 27B en tarjetas de 12 GB, con la pérdida de calidad que ello implica.
- Procesamiento por lotes con razonamiento: el modo thinking por defecto resulta adecuado para tareas de análisis que requieren cadena de razonamiento, siempre que se acepte el coste adicional de tokens.
- Enrutado a producción con otro runtime: para vLLM o SGLang existe la variante NVFP4 del mismo modelo, lo que permite mantener el mismo comportamiento con motores de alto rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la informacion disponible. El único rendimiento cuantificado en la model card es la medición de rechazos y divergencia KL:

| Modelo | Rechazos | Divergencia KL |
|---|---|---|
| BF16 fuente (frente a Swift 1.5) | 23/100 | 0,0884 |
| Swift 1.5 Qwen3.8-27B | 98/100 | 0 |

Medición realizada con Heretic sobre los pesos BF16: 100 prompts de `mlabonne/harmful_behaviors` con detector de rechazo por palabras clave y KL del primer token sobre `mlabonne/harmless_alpaca`, omitiendo el modo thinking. No se ha vuelto a medir en los cuantizados.

## Requisitos de hardware

- VRAM estimada por cuantización (según la model card): UD-Q2_K_XL 9,2 GiB y UD-IQ3_XXS 10,2 GiB para GPU de 12 GB; UD-IQ3_S 11,2 GiB y UD-Q3_K_XL 12,2 GiB para GPU de 16 GB; UD-IQ4_XS 13,3 GiB para 16 GB con menos margen de contexto; UD-Q4_K_S 14,3 GiB para 20 GB o 16 GB con contexto corto; UD-Q4_K_XL 16,4 GiB para 24 GB con contexto largo; UD-Q5_K_S 17,4 GiB y UD-Q5_K_M 18,4 GiB para 24 GB; UD-Q6_K_XL 23,6 GiB para 32 GB; UD-Q8_K_XL 29,3 GiB para 48 GB o 32 GB con offload parcial a CPU; BF16 50,9 GiB sin cuantizar.
- Cabe en GPU de consumo: sí, desde una RTX 3060 de 12 GB (con los cuantizados de 2 y 3 bits) hasta una RTX 4090 o RTX 5090 de 24/32 GB (con UD-Q4_K_XL y UD-Q6_K_XL respectivamente).
- GPU profesionales recomendadas: A100, H100 o L40S para los cuantizados altos y el BF16, especialmente si se necesita contexto largo o visión activada.
- Memoria adicional: el proyector de visión `mmproj-BF16.gguf` anade 0,9 GiB cuando se usa entrada de imagen o vídeo.
- Opciones de despliegue: llama.cpp / `llama-server` (formato nativo del repo), Ollama y LM Studio por compatibilidad GGUF; para vLLM y SGLang el autor remite a la variante NVFP4 del mismo modelo.
- Latencia y throughput: no disponibles. La cabeza MTP permite decodificación autoespeculativa, pero no se publican cifras de aceleración ni de tokens por segundo.
- Requisito de build: `--spec-type draft-mtp` necesita una compilación de llama.cpp con soporte MTP para `qwen35`; la cabeza se carga desde el propio GGUF, sin fichero draft separado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos / calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27B-Uncensored-Dynamic-MTP-GGUF (este) | ~27B | no disponible | 23/100 rechazos, KL 0,0884 (medido en BF16) | swift-open-license-1.0 | GGUF, 12 cuantizados (9,2-50,9 GiB) |
| ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP (origen BF16) | ~27B | no disponible | 23/100 rechazos, KL 0,0884 | swift-open-license-1.0 | safetensors BF16 |
| ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-NVFP4 | ~27B | no disponible | mismas métricas de la fuente | swift-open-license-1.0 | NVFP4, para vLLM y SGLang |
| ukisai/Swift-1.5-Qwen3.8-27b (Swift 1.5, antes de abliterar) | ~27B | no disponible | 98/100 rechazos, KL 0 | swift-open-license-1.0 | safetensors |
| unsloth/Qwen3.8-27B-GGUF | ~27B | no disponible | no disponible | no disponible | GGUF (origen de la imatrix, no abliterado) |

## Limitaciones y advertencias

- Modelo abliterado: se ha eliminado un mecanismo de seguridad, por lo que puede generar contenido dañino, ofensivo o ilegal. No es adecuado para aplicaciones orientadas al público sin filtros externos.
- La medición de rechazos (23/100) se realizó con un detector por palabras clave sobre 100 prompts, una metodología limitada que no descarta rechazos ni evalúa la calidad del contenido generado.
- Riesgo de degradación por la abliteración: la divergencia KL de 0,0884 frente a Swift 1.5 indica un cambio medible en la distribución de salida; no se documenta el impacto sobre tareas generales.
- Las métricas no se han recalculado sobre los cuantizados, por lo que el comportamiento real de los GGUF de baja precisión puede diferir del BF16.
- Los cuantizados de 2 y 3 bits (UD-Q2_K_XL, UD-IQ3_XXS, UD-IQ3_S) emplean tipos como IQ1_S, IQ1_M e IQ2_XXS que degradan notablemente la calidad; conviene validar antes de usarlos en producción.
- Idiomas soportados no documentados: se desconoce el reparto real de capacidades multilingües.
- Longitud de contexto no especificada: los ejemplos usan 32.768 tokens, pero no se confirma si es el máximo soportado.
- Licencia swift-open-license-1.0, etiquetada como `license: other`: hay que revisar el texto antes de cualquier uso comercial, ya que no se detallan aquí las restricciones.
- Soporte MTP limitado: requiere una compilación específica de llama.cpp con MTP para `qwen35`; no está garantizado en versiones estándar.
- No se documentan capacidades de tool calling ni de agentes, por lo que no deben asumirse en integraciones que las requieran.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-Dynamic-MTP-GGUF
- Modelo base (BF16, safetensors): https://huggingface.co/ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-MTP
- Variante NVFP4 para vLLM y SGLang: https://huggingface.co/ajgazin/Swift-1.5-Qwen3.8-27B-Uncensored-NVFP4
- Swift 1.5 Qwen3.8-27B (UkisAI, modelo de partida): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Texto de la licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Qwen3.8-27B (modelo original): https://huggingface.co/Qwen/Qwen3.8-27B
- Dirección de rechazo utilizada: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Importance matrix de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Heretic (herramienta de medición): https://github.com/p-e-w/heretic
- Paper de Arditi et al. 2024 (arxiv:2406.11717): https://arxiv.org/abs/2406.11717
