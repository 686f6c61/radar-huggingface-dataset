# qaqab/Qwen3.8-27B-Uncensored-Q4_K_M-Vision-GGUF

## Resumen

Qwen3.8-27B-Uncensored es una version "descensurada" (abliterada) del modelo Qwen3.8-27B de Alibaba, publicada por el usuario qaqab en HuggingFace en formato GGUF para su ejecucion local con llama.cpp. El modelo elimina los comportamientos de rechazo a nivel de pesos mediante una tecnica llamada abliteration, que identifica y elimina las direcciones de activacion asociadas a la negativa a responder, sin necesidad de fine-tuning ni datos de entrenamiento adicionales.

El modelo mantiene intactas las capacidades del base: arquitectura Qwen3_5ForConditionalGeneration con 27.320 millones de parametros, ventana de contexto de 262.144 tokens, soporte de vision y cabecera de prediccion multi-token (MTP) para decodificacion especulativa. La relevancia actual radica en que permite desplegar localmente un modelo de 27B sin censura con cuantizaciones que van desde IQ2_M (10,6 GB) hasta Q8_0 (29 GB), con verificacion explicita de que los tensores MTP se conservan tras la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer denso con cabecera MTP) |
| Parametros totales | 27.320.697.856 (27,32 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (mas variantes noMTP y f16 para vision) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 64 capas con vocabulario de 248.320 tokens y una capa MTP para decodificacion especulativa. La version descensurada se obtiene mediante abliteration con la herramienta Heretic, que co-minimiza el numero de rechazos frente a la divergencia KL respecto al modelo base. El proceso se ejecuta en bf16 sin cuantizacion intermedia, y el LoRA resultante se fusiona en los pesos bf16 originales, de modo que los pesos publicados no son un redondeo cuantizado.

Los tensores `mtp.*` se copian literalmente del checkpoint base tras la fusion, ya que la abliteration solo modifica `attn.o_proj` y `mlp.down_proj` de la pila principal. La matriz de importancia (imatrix) se calcula directamente desde el f16, no desde una cuantizacion intermedia, lo que garantiza que la calibracion vea los pesos reales. No se ha realizado fine-tuning ni se han anadido datos de entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con comportamiento de rechazo sustancialmente reducido a nivel de pesos.
- Decodificacion especulativa mediante la cabecera MTP integrada, que actua como borrador interno en los archivos fusionados.
- Soporte de vision: el repositorio incluye un archivo f16 separado con el proyector de vision para entrada de imagenes.
- Ventana de contexto larga de 262.144 tokens, adecuada para documentos extensos y conversaciones multi-turno.
- Compatibilidad con llama.cpp y herramientas del ecosistema GGUF (Ollama, MLX en Apple Silicon).
- Variantes noMTP disponibles para entornos que requieren un borrador explicito con `--model-draft`.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de rechazo en modelos grandes sin necesidad de prompts adversariales, al estar la censura eliminada a nivel de pesos.
- Despliegue local de un asistente conversacional sin restricciones: con la cuantizacion Q4_K_M (16,8 GB) se puede ejecutar en una GPU de 24 GB con llama.cpp, manteniendo una perplexity practicamente identica al f16.
- Generacion de texto con baja latencia: la cabecera MTP integrada permite decodificacion especulativa, acelerando la inferencia en hardware consumer sin perder calidad, ya que cada token se verifica contra el modelo objetivo.
- Procesamiento de documentos largos: la ventana de 262K tokens permite analizar libros completos, codigo fuente extenso o expedientes en una sola pasada.
- Aplicaciones bilingues ingles-chino: el modelo mantiene las capacidades multilingues del base, util para traduccion, generacion de contenido y atencion al cliente en ambos idiomas.
- Tareas con entrada visual: el archivo de vision f16 permite procesar imagenes junto con texto, por ejemplo para descripcion de imagenes o analisis de capturas, usando el flag `--mmproj` en llama.cpp.
- Entornos de desarrollo y pruebas: al ser Apache 2.0 y estar cuantizado, es adecuado para integrar en pipelines de CI/CD que necesiten un modelo local sin dependencias de API externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para esta version descensurada. El autor proporciona mediciones de perplexity sobre wikitext-2, comparando cada cuantizacion contra la linea base f16 en una misma sesion:

| Archivo | PPL (wikitext-2) | Diferencia vs f16 |
|---|---|---|
| f16 (linea base, no publicado) | 7,1557 +/- 0,25104 | - |
| Q5_K_M | 7,1573 +/- 0,25055 | +0,0016 |
| IQ4_XS | 7,1583 +/- 0,25019 | +0,0026 |
| Q6_K | 7,1689 +/- 0,25149 | +0,0132 |
| Q8_0 | 7,1764 +/- 0,25195 | +0,0207 |
| Q4_K_M | 7,1814 +/- 0,25227 | +0,0257 |
| IQ2_M | 7,8581 +/- 0,27481 | +0,7024 |

El autor advierte que todas las filas excepto IQ2_M se situan dentro de un margen de 0,026 con un error estandar de aproximadamente 0,25, por lo que no son estadisticamente separables entre si ni del f16. La unica diferencia que la medicion resuelve de forma fiable es IQ2_M, que se situa unas 2,8 desviaciones estandar por encima de la linea base. La perplexidad solo detecta dano grosero de cuantizacion; no mide razonamiento, codigo, capacidad multilingue ni comportamiento de rechazo.

## Requisitos de hardware

- Q4_K_M (16,8 GB): requiere aproximadamente 24 GB de VRAM para descarga completa en GPU; adecuado para RTX 3090, RTX 4090 o A5000.
- IQ4_XS (15,3 GB): cabe en GPUs de 16 GB como RTX 4080 o RTX 4070 Ti Super.
- IQ2_M (10,6 GB): cabe en GPUs de 12-16 GB, dejando margen para contexto largo.
- Vision f16: requiere significativamente mas VRAM que las cuantizaciones; se recomienda usar solo si es imprescindible la entrada de imagenes.
- En Apple Silicon: se ha probado en Mac M5 Pro con Metal (cuantizacion Q3_K_M, 13,5 GB) y existe backend MLX opcional que ofrece una inferencia entre un 30 y un 50 % mas rapida.
- En Windows: se ha probado con CUDA usando la cuantizacion Q4_K_M.
- Despliegue recomendado: llama.cpp con el flag `--jinja`, anadiendo `--mmproj` si se necesita vision. Tambien compatible con Ollama y, previa conversion, con vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo de descensura | Formato | Licencia |
|---|---|---|---|---|---|
| qaqab/Qwen3.8-27B-Uncensored (este) | 27,32B | 262K | Abliteration con Heretic, MTP verificado | GGUF (6 quants) | Apache 2.0 |
| JonathanColetti/Qwen3.8-27B-Uncensored-GGUF | 27,32B | 262K | Abliteration | GGUF | Apache 2.0 |
| orcarouter/Qwen3.8-27B-Uncensored-GGUF | 27,32B | 262K | Abliteration | GGUF (12 quants, gated) | Apache 2.0 |
| Qwen/Qwen3.8-27B (base) | 27,32B | 262K | Sin descensurar | safetensors | Apache 2.0 |

La diferencia principal de este repositorio frente a las alternativas es la verificacion explicita de los tensores MTP tras la cuantizacion: el autor confirma que la abliteration no elimina la cabecera de prediccion multi-token y que esta se injerta de nuevo desde el checkpoint base, inspeccionando cada archivo despues de cuantizar. El repositorio de orcarouter ofrece mas niveles de cuantizacion (12, incluyendo Q2_K y Q3_K_M) pero es de acceso restringido (gated).

## Limitaciones y advertencias

- El comportamiento de rechazo se ha reducido sustancialmente, pero no eliminado por completo. El autor indica explicitamente que la descensura no es total.
- La cuantizacion IQ2_M muestra una degradacion notable de perplexity (2,8 errores estandar por encima de la linea base); no se recomienda para tareas que requieran precision.
- La cabecera de borrador MTP se entreno contra el modelo sin modificar, por lo que la tasa de aceptacion de la decodificacion especulativa puede caer ligeramente. La verificacion de cada token contra el modelo objetivo garantiza que la calidad de salida no se vea afectada.
- La perplexidad no mide razonamiento, generacion de codigo, capacidad multilingue ni comportamiento de rechazo; unas perplexity similares no garantizan un rendimiento equivalente en estas tareas.
- El soporte de vision solo esta disponible en el archivo f16 separado, que es considerablemente mas grande que las cuantizaciones principales.
- Los idiomas soportados se limitan a ingles y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- El uso de un modelo descensurado conlleva riesgos de generacion de contenido inapropiado o danino; la licencia Apache 2.0 no exime de responsabilidad legal sobre el uso que se haga del modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/qaqab/Qwen3.8-27B-Uncensored-Q4_K_M-Vision-GGUF
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub del proyecto: https://github.com/Wassimyounes01/qwen38-uncensored
- Guia de ejecucion local: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Analisis del GGUF descensurado: https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf
- Repositorio similar de JonathanColetti: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored-GGUF
