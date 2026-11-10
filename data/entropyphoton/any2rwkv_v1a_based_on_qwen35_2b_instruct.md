# EntropyPhoton/Any2rwkv_v1A_based_on_qwen35_2B_Instruct

## Resumen

Any2rwkv_v1A_based_on_qwen35_2B_Instruct es un modelo derivado de Qwen3.5-2B Instruct en el que las 24 capas de mezcla de tokens (token-mixing layers) del transformer original han sido sustituidas por modulos TMix, dando lugar a una arquitectura hibrida de tipo RWKV con atencion lineal. Lo desarrolla el usuario EntropyPhoton sobre el backbone congelado de Qwen3.5-2B Instruct, utilizando la libreria any2rwkv (proyecto rwkv-rs) para la conversion de capas GDN y una variante propia denominada Primed/AGQA para las capas GQA. El resultado es un modelo de 2B parametros con una topologia recurrente en todas sus capas de mezcla, pensado para investigacion sobre alternativas eficientes a la atencion cuadratica clasica.

El modelo conserva intactos los FFN, embeddings, normalizacion externa y cabeza de salida del backbone original, y ha sido entrenado mediante destilacion global de error cuadratico medio (MSE) sobre el hidden state normalizado final, usando el Qwen3.5-2B Instruct original como profesor. Es un checkpoint de investigacion: la release incluye pesos FP32 de los mixers, el backbone autenticado, el runtime exacto y un manifiesto con hashes SHA256, pero no ofrece un servicio de generacion optimizado con cache ni benchmarks de velocidad o memoria. La licencia Apache 2.0 permite uso comercial, modificacion y redistribucion.

Su relevancia actual radica en que documenta de forma transparente el proceso de conversion de un transformer denso a una topologia RWKV-like, con resultados de perplexidad (NLL) que permiten cuantificar la perdida respecto al profesor original. Es, por tanto, una pieza util para quienes investigan destilacion arquitectonica y modelos recurrentes, mas que un candidato directo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida RWKV-like: 24 capas TMix (18 GDN convertidas + 6 Primed GQA convertidas), FFN y backbone de Qwen3.5-2B Instruct congelados |
| Parametros totales | 2B (heredados del backbone Qwen3.5-2B Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la release distribuye pesos FP32 para mixers y BF16 para proyecciones grandes; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tmix_masters.safetensors con estados FP32 exactos; backbone/ con pesos y tokenizer; runtime/ con codigo de servidor) |

## Arquitectura y entrenamiento

El modelo parte del transformer denso Qwen3.5-2B Instruct y reemplaza todas sus capas de mezcla de tokens por modulos TMix: 18 capas originalmente GDN convertidas mediante any2rwkv y 6 capas originalmente GQA (índices 3, 7, 11, 15, 19 y 23) convertidas mediante el metodo Primed/AGQA propietario del autor. No queda atencion GQA nativa en el grafo forward publicado. Los FFN, embeddings, normalizacion externa y cabeza de salida permanecen congelados desde el backbone original. El checkpoint liberado es el modelo final de MSE global, no un intermedio layerwise ni un modelo solo-GDN.

El entrenamiento consistio en destilacion conjunta de los 24 modulos TMix contra el profesor Qwen3.5-2B Instruct, usando MSE sobre el hidden state normalizado final, con los FFN y el resto del backbone congelados. Se usaron 20,48M tokens distintos en 3 epocas (61,44M presentaciones de token), y la seleccion del checkpoint se hizo por MSE de validacion, no por las puntuaciones del test Uncheatable. El checkpoint final corresponde a epoch 3, paso de optimizador 939. La release preserva los maestros FP32 de los mixers, controles de normalizacion y aritmetica residual, con proyecciones grandes, convolucion e IO WKV en BF16, y un proveedor FlashRWKV2 a17 registrado; el autor advierte explicitamente de no convertir todo el modelo ensamblado a BF16 o FP16.

## Capacidades

- Generacion de texto autoregresiva a nivel de logits de secuencia completa: la release expone logits completos, no un servicio de chat/generacion con cache.
- Razonamiento y conocimiento general heredados del backbone Qwen3.5-2B Instruct, aunque degradados por la destilacion (ver benchmarks).
- Capacidad de modelado de codigo en C++, JavaScript y Python, medida por NLL en el test Uncheatable.
- Capacidades multilingues limitadas a ingles y chino, segun los metadatos de la model card.
- Soporte de plantilla de chat y modo thinking del tokenizer original (la plantilla admite `enable_thinking=False` en el ejemplo de carga), aunque el modelo no ha sido reentrenado especificamente para esos formatos.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio.
- No se documenta una API de generacion con cache KV ni decodificacion especulativa.

## Casos de uso

- Investigacion sobre arquitecturas recurrentes: el modelo sirve como referencia reproducible para estudiar la conversion de capas de atencion a modulos TMix y medir la perdida de calidad asociada, gracias a los resultados NLL publicados frente al profesor.
- Destilacion arquitectonica: util como caso de estudio de destilacion global de hidden state con backbone congelado, con un manifiesto que registra hashes, geometria y entorno para replicar el proceso.
- Evaluacion de modelado de codigo: permite medir NLL en dominios C++, JavaScript y Python para comparar topologias recurrentes frente a transformers densos en tareas de modelado de lenguaje de programacion.
- Pruebas de integridad de pesos y runtime: el script `load_released_tmix.py` y la comprobacion CPU permiten verificar la identidad de los pesos y la aritmetica mixta antes de cualquier experimento.
- Benchmarking de perplexidad controlado: con 100 documentos locales y 182.894 tokens objetivo, el protocolo Uncheatable descrito permite reproducir comparaciones NLL entre variantes.
- Base para experimentos de eficiencia en inferencia: la ausencia de atencion GQA nativa y el uso de modulos recurrentes lo convierten en un banco de pruebas para medir coste de memoria y latencia en topologias lineales, aunque el autor no publica esas metricas en esta release.

## Benchmarks y rendimiento

Resultados del test Uncheatable (100 documentos locales, 182.894 tokens objetivo, inicio de linea por chunk de 512 tokens; no es el protocolo del leaderboard de contexto largo):

| Modelo | NLL (menor es mejor) | Top1 siguiente token |
|---|---:|---:|
| Qwen3.5-2B Instruct original | 1,98129470 | 59,0331% |
| Intermedio layerwise 24-TMix | 2,08786156 | 56,2785% |
| Any2rwkv_v1A_based_on_qwen35_2B_Instruct | 2,07494075 | 56,6694% |

Resultados por dominio de codigo (NLL):

| Dominio | NLL original | NLL intermedio 24-TMix | NLL Any2rwkv v1A |
|---|---:|---:|---:|
| C++ | 1,148222 | 1,339159 | 1,316400 |
| JavaScript | 1,042401 | 1,194989 | 1,166346 |
| Python | 1,294794 | 1,414823 | 1,398982 |

El autor advierte que la precision del siguiente token no equivale a pass@1 de ejecucion de codigo, que las puntuaciones C-Eval, GSM8K e IFEval de los modelos intermedios solo-GDN/CE no pertenecen a este modelo y se excluyen deliberadamente, y que el conjunto de test local ya fue examinado en decisiones previas del proyecto, por lo que no son resultados ciegos. Ademas, las ejecuciones historicas usaron politicas de precision distintas, por lo que la comparacion no es una ablacion estricta de solo perdida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El repo ocupa 1,9 GB, pero la release mezcla FP32 (mixers) y BF16 (proyecciones grandes), sin cifras de memoria publicadas.
- GPU recomendadas: no disponible. El autor menciona que el checkpoint paso un forward GPU completo de 24 capas y 64 tokens en el servidor migrado, y que el directorio exportado no se ha reevaluado en GPU de 2B, pero no especifica modelos de GPU.
- Compatibilidad con GPU de consumo: no disponible. No se documenta si cabe en RTX 4090, RTX 3090 u otras.
- Opciones de despliegue: carga mediante `load_released_tmix.py` con Transformers y un commit personalizado registrado en `release_manifest.json`; FlashRWKV2 requiere un compilador CUDA compatible. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. El autor indica explicitamente que no se reclama ningun benchmark nuevo de velocidad de servicio ni de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | NLL (Uncheatable) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Any2rwkv_v1A_based_on_qwen35_2B_Instruct | 2B | no disponible | 2,07494075 | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.5-2B Instruct (profesor) | 2B | no disponible | 1,98129470 | Apache 2.0 | Hugging Face |
| Intermedio layerwise 24-TMix | 2B | no disponible | 2,08786156 | no disponible | no disponible como release independiente |

La comparativa se limita al profesor original y al intermedio de entrenamiento documentados en la model card; no se dispone de datos de otros modelos recurrentes comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad respecto al profesor: la NLL global empeora de 1,98129470 a 2,07494075 y la precision top1 baja de 59,0331% a 56,6694%, con degradacion tambien en los tres dominios de codigo medidos.
- Resultados no ciegos: el conjunto de test local ya fue examinado en decisiones previas del proyecto, por lo que las cifras no son una evaluacion ciega e independiente.
- Comparacion no estricta: las ejecuciones historicas usaron politicas de precision distintas, por lo que la comparacion con el profesor no es una ablacion de solo perdida.
- Sin servicio de generacion: la release solo proporciona logits de secuencia completa; no incluye servicio de chat/generacion con cache KV optimizado.
- Carga no generica: no debe usarse AutoModel; es obligatorio `load_released_tmix.py`, y no se debe convertir todo el modelo ensamblado a BF16 o FP16.
- Dependencias de entorno: requiere Linux, Python 3.12, versiones exactas de paquetes y un commit personalizado de Transformers registrado en el manifiesto; Flash necesita un compilador CUDA compatible.
- Idiomas limitados a ingles y chino, sin cobertura documentada de otras lenguas.
- Sin datos publicados de tool calling, agentes, vision, audio, latencia o throughput.
- Riesgo de alucinacion: no documentado especificamente, pero inherente a un modelo de 2B destilado con perdida de calidad respecto al profesor.
- Licencia: Apache 2.0 permite uso comercial, pero el codigo runtime de terceros conserva sus propios avisos y la licencia del modelo base no relicencia automaticamente el codigo de terceros; deben revisarse `THIRD_PARTY_NOTICES.md` y `backbone/LICENSE`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EntropyPhoton/Any2rwkv_v1A_based_on_qwen35_2B_Instruct
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Codigo fuente any2rwkv (rwkv-rs), commit 60eb9b28bc3f1a8466be56e5b7c141c3b0ec7244: https://github.com/rwkv-rs/any2rwkv
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Manifiesto de release y avisos de terceros: incluidos en el repositorio del modelo (`release_manifest.json`, `THIRD_PARTY_NOTICES.md`)
