# mmastrac/GLM-5.3-Flash-NVFP4-FP8-sidecar

## Resumen

Este repositorio no es un modelo de lenguaje, sino un *sidecar* de pesos: un fichero de tensores FP8 que complementa al checkpoint cuantizado `nvidia/GLM-5.3-Flash-NVFP4`. Su autor, mmastrac, publica los pesos FP8 originales (con escalas de bloque 128 x 128) del release `zai-org/GLM-5.3-Flash` para dos grupos concretos de capas lineales: las proyecciones MLA (`q_a_proj`, `kv_a_proj_with_mqa`, `q_b_proj`, `o_proj`, 11 capas) y los expertos compartidos (`gate_proj`, `up_proj`, `down_proj`, 42 capas). El checkpoint de NVIDIA guarda esas capas en BF16, pero partiendo de esos mismos pesos FP8 desquantizados; el sidecar permite a un runtime cargarlas directamente en 8 bits sin volver a cuantizar la copia BF16.

El problema que resuelve es de fidelidad y de memoria. Cuantizar a FP8 las copias BF16 con una sola escala por canal de salida introduce un error relativo mediano de entre el 2,4 % y el 2,6 %; volver a codificarlas con escalas de bloque 128 x 128 frescas baja al 0,16 %, mientras que usar los pesos y escalas originales del release FP8 se queda en un margen de entre el 0,007 % y el 0,027 %, con entre el 88,6 % y el 95,4 % de los tensores bit a bit idénticos al BF16 de NVIDIA. Además, almacenar esas lineales en FP8 en lugar de BF16 reduce a la mitad los bytes dedicados a ellas.

Es relevante porque documenta una práctica emergente en el ecosistema de pesos cuantizados: distribuir *parches* de precisión que restauran los valores exactos del release original sobre un checkpoint optimizado para un formato propietario. El repositorio ocupa 2,6 GB e incluye el fichero principal de 2,16 GB, un fichero opcional de 453 MB para las MLP densas de las capas 0-2, los manifiestos de error por tensor y el script `build_sidecar.py` para reconstruirlo. Licencia MIT, igual que los dos modelos fuente. No se dispone de datos sobre parámetros totales, longitud de contexto ni idiomas del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible para el modelo base. El sidecar no contiene un modelo; los nombres de sus tensores indican que GLM-5.3-Flash usa proyecciones MLA, expertos enrutados y compartidos (MoE), un indexador de atención dispersa, proyecciones KDA y una capa MTP (capa 45) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible (la arquitectura es MoE, pero no se indica el reparto) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP8 `float8_e4m3fn` con escalas de bloque 128 x 128 (`weight_scale_inv`, `float32`); NVFP4 (en el checkpoint de NVIDIA para expertos enrutados y MLP densas de capas 0-2); BF16 |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`fp8_sidecar.safetensors`, 2,16 GB, sha256 `8f429e28b568552f1697ea64a3a0b6833894a47e422fb2980d088fd13ecab82a`; opcional `fp8_sidecar_dense_mlp.safetensors`, 453 MB, sha256 `1b961dd113242aa719e67d09669361878043ac9110a3eadab57e2792514c7738`) |
| Tensores incluidos | 170 pesos FP8 y sus 170 `weight_scale_inv` (44 de MLA + 126 de expertos compartidos); 9 tensores adicionales en el fichero opcional de MLP densas (12288 x 4096 cada uno) |
| Modelos base | `nvidia/GLM-5.3-Flash-NVFP4` @ `09b04e5e74bca08ca8549fc736d4cdd8624bfde3` y `zai-org/GLM-5.3-Flash` @ `eb9eb208eb0d988989d07a6a12d0fdeb5f52574a` |
| Tamaño del repositorio | 2,6 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 29 de septiembre de 2026 / 29 de septiembre de 2026 |

## Arquitectura y entrenamiento

El sidecar no entrena ni modifica nada: copia tensores. Los nombres siguen el esquema `model.language_model.layers.N.<...>.weight`, idéntico en ambos checkpoints, y las proyecciones incluidas corresponden a atención con latencia multi-cabeza (MLA) y a la ruta de expertos compartidos de un MoE. De forma indirecta, el inventario de tensores delata la estructura del modelo: 11 capas con proyecciones MLA (44 tensores), 42 capas con expertos compartidos (126 tensores), una capa 45 reservada para predicción multi-token (MTP), un indexador de atención dispersa, proyecciones KDA y un router con `lm_head` y embeddings. Las MLP densas de las capas 0-2 tienen dimensión 12288 x 4096.

El formato de las escalas es el layout block-128 de DeepSeek-V3: un tensor `weight` en `float8_e4m3fn` de forma `[N, K]` y un `weight_scale_inv` en `float32` de forma `[ceil(N/128), ceil(K/128)]`. No se documenta el proceso de entrenamiento, el volumen de tokens, la composición del dataset ni si hubo RLHF o DPO: esa información no está disponible en el material proporcionado. La innovación práctica del repositorio es de ingeniería de precisión: conservar la rejilla FP8 original permite que la desquantización (`weight.float() * scale`, redondeada a BF16) reproduzca el tensor BF16 de NVIDIA salvo por el redondeo propio de BF16, y que al dividir el BF16 de NVIDIA entre esas escalas y redondear a e4m3 se recuperen al menos el 99,9999 % de los códigos FP8 en todos los tensores. El fichero no aparece en ningún `model.safetensors.index.json`, de modo que los cargadores que leen el checkpoint de NVIDIA lo ignoran salvo que se indique lo contrario.

## Capacidades

- No es un modelo: no genera texto, no razona y no ejecuta código. Es un contenedor de tensores.
- Restauración de pesos FP8 exactos para las proyecciones MLA (`q_a_proj`, `kv_a_proj_with_mqa`, `q_b_proj`, `o_proj`) de 11 capas.
- Restauración de pesos FP8 exactos para los expertos compartidos (`gate_proj`, `up_proj`, `down_proj`) de 42 capas.
- Sustitución opcional de las MLP densas (`gate_proj`, `up_proj`, `down_proj`) de las capas 0-2, que en el checkpoint de NVIDIA están en NVFP4.
- Reducción de bytes a la mitad en esos tensores frente a las copias BF16 del checkpoint de NVIDIA.
- Compatibilidad con ejecución *weight-only* (pesos FP8 con activaciones BF16), que reproduce el release original sin el redondeo adicional de una GEMM FP8 x FP8 con activaciones cuantizadas por token.
- Reconstrucción reproducible mediante `build_sidecar.py` (`build_sidecar.py dense` para el fichero opcional) a partir de copias locales de ambos checkpoints.
- Auditoría de error por tensor mediante `manifest.json` y `manifest_dense_mlp.json`.
- Sin capacidades de tool calling, agentes, visión, audio ni multilingüismo propias: dependen por completo del modelo base, para el que no se aportan datos.

## Casos de uso

- Servicio de inferencia de GLM-5.3-Flash con pesos de mayor fidelidad: un runtime que despliegue `nvidia/GLM-5.3-Flash-NVFP4` puede cargar el sidecar y ejecutar las proyecciones MLA y los expertos compartidos en FP8 original, reduciendo la degradación acumulada por cuantizaciones en cadena respecto a recuantizar el BF16.
- Ahorro de memoria en despliegues multi-GPU: las 44 lineales MLA y las 126 de expertos compartidos pasan de 2 bytes por parámetro (BF16) a 1 byte (FP8), lo que libera VRAM utilizable para caché KV o para un mayor tamaño de lote.
- Validación y auditoría de cuantización: los manifiestos permiten comprobar tensor a tensor que un pipeline propio de cuantización no se desvía del release original más de lo esperado (medianas de 0,007 % a 0,027 % de error relativo).
- Investigación sobre formatos de bloque: comparar la rejilla block-128 con la rejilla NVFP4 en las mismas capas, usando el fichero opcional de MLP densas como caso de estudio con un error relativo de 8,9 % a 9,3 %.
- Reproducción de resultados: el script incluido permite reconstruir el fichero desde los checkpoints fuente para verificar la sha256 publicada o auditar el contenido antes de integrarlo en un pipeline de CI.
- Integración en un cargador personalizado: el ejemplo con `safetensors.safe_open` y `repeat_interleave` sirve como base para implementar la carga en un runtime propio cuando el `index.json` no declara el fichero.
- Conformidad de licencias en producto comercial: al ser MIT, tanto el sidecar como ambos modelos base pueden incorporarse a productos propietarios, siempre que se conserve el aviso de licencia y la atribución a zai-org y NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio aporta métricas de fidelidad de cuantización tensor a tensor, no evaluaciones de calidad del modelo.

| Grupo de tensores | Tensores | Bit a bit idénticos al BF16 de NVIDIA | Error relativo (mediana) |
|---|---:|---:|---:|
| MLA `q_a_proj` | 11 | 91,7 % | 0,016 % |
| MLA `kv_a_proj_with_mqa` | 11 | 92,0 % | 0,015 % |
| MLA `q_b_proj` | 11 | 95,4 % | 0,007 % |
| MLA `o_proj` | 11 | 92,8 % | 0,013 % |
| Expertos compartidos `gate_proj` | 42 | 89,3 % | 0,024 % |
| Expertos compartidos `up_proj` | 42 | 88,6 % | 0,026 % |
| Expertos compartidos `down_proj` | 42 | 88,6 % | 0,027 % |

## Requisitos de hardware

- El sidecar no es desplegable por sí solo: requiere el checkpoint `nvidia/GLM-5.3-Flash-NVFP4` en la revisión `09b04e5e74bca08ca8549fc736d4cdd8624bfde3`.
- Espacio en disco adicional: 2,16 GB (fichero principal) más 453 MB si se usa el fichero opcional de MLP densas.
- VRAM del modelo completo: no disponible. Como referencia indicada en la propia model card, los expertos enrutados del release FP8 de `zai-org/GLM-5.3-Flash` ocupan aproximadamente 300 GB, por lo que el despliegue exige múltiples aceleradores.
- GPU recomendadas: no disponibles en la información proporcionada. La ejecución de pesos `float8_e4m3fn` requiere hardware con soporte nativo de FP8 (por ejemplo, arquitecturas Hopper o Ada de NVIDIA); no se confirma compatibilidad con ninguna GPU concreta.
- ¿Cabe en una GPU de consumo? El sidecar por separado no constituye un modelo, y el checkpoint base al que acompaña no cabe en una GPU de consumo según los datos de la model card.
- Opciones de despliegue: no se especifican en la información disponible. El fichero no está listado en ningún `model.safetensors.index.json`, así que los cargadores estándar de vLLM, SGLang, TGI o TensorRT-LLM lo ignorarán salvo que se implemente una carga explícita; la model card solo documenta un ejemplo en Python con `safetensors`.
- Latencia y throughput: no disponibles. Los pesos FP8 *weight-only* evitan el redondeo extra de cuantizar activaciones por token en una GEMM FP8 x FP8, pero no se publican medidas de rendimiento.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la información proporcionada. La comparación posible es entre estrategias de cuantización para esas mismas lineales, medida con las cifras del repositorio.

| Estrategia aplicada a los tensores del sidecar | Error relativo | Observaciones |
|---|---|---|
| FP8 block-128 original (este sidecar) | 0,007 % - 0,027 % (mediana) | Restaura los códigos FP8 del release; 88,6 % - 95,4 % de tensores bit a bit idénticos al BF16 de NVIDIA |
| Recuantizar el BF16 a FP8 con escalas 128 x 128 frescas | ~0,16 % | Aproximadamente 6 a 20 veces más error que el sidecar |
| Recuantizar el BF16 a FP8 con una escala por canal de salida | 2,4 % - 2,6 % | Sin granularidad de bloque; el peor caso de la comparativa |
| NVFP4 en las MLP densas de capas 0-2 (fichero opcional) | 8,9 % - 9,3 % | Error típico de redondeo a NVFP4; usar el fichero opcional duplica los bytes de esas capas y restaura los pesos del release |

| Alternativa de pesos | Tipo | Licencia | Disponibilidad |
|---|---|---|---|
| `zai-org/GLM-5.3-Flash` | Release FP8 completo (expertos enrutados incluidos, ~300 GB) | MIT | Público en HuggingFace |
| `nvidia/GLM-5.3-Flash-NVFP4` | Expertos enrutados en NVFP4 y resto en BF16 | MIT | Público en HuggingFace |
| Este repositorio | Sidecar FP8 parcial (170 tensores + 9 opcionales) | MIT | Público en HuggingFace |

## Limitaciones y advertencias

- No es un modelo autónomo: sin el checkpoint de NVIDIA no sirve para inferencia. Está pensado como fichero auxiliar.
- Cobertura parcial: no incluye las proyecciones KDA, el indexador de atención dispersa, `kv_b_proj`, el gate del router, `lm_head` ni los embeddings. En el release FP8 original esos tensores ya estaban en BF16 (`modules_to_not_convert` en su `config.json`) y carecen de rejilla FP8; cualquier versión en 8 bits de ellos sería una cuantización con pérdida ordinaria.
- Tampoco incluye los expertos enrutados (NVFP4 en el checkpoint de NVIDIA; utilícese `zai-org/GLM-5.3-Flash` para expertos en FP8) ni la capa MTP (capa 45), cuyo BF16 en el checkpoint de NVIDIA no sigue la rejilla del release.
- El fichero no está declarado en ningún `model.safetensors.index.json`, por lo que la mayoría de runtimes lo ignorarán de forma silenciosa; es necesario un cargador explícito.
- Los tensores no son siempre bit a bit idénticos al BF16 de NVIDIA: entre el 4,6 % y el 11,4 % de los tensores difieren al nivel del redondeo BF16 del producto desquantizado.
- Para reproducir el release sin degradación adicional hay que ejecutar los pesos en modo *weight-only*; una GEMM FP8 x FP8 que cuantice activaciones por token añade su propio redondeo.
- La reconstrucción con `build_sidecar.py` puede producir una sha256 distinta de la publicada, porque el escritor de safetensors no fija el orden de las claves de metadatos; los tensores y las cabeceras sí son los mismos.
- Sesgos, riesgo de alucinación, cobertura idiomática y límites de contexto: no disponibles. Dependen del modelo base y no se documentan en este repositorio.
- Licencia MIT sin restricciones conocidas para uso comercial, pero se recomienda conservar la atribución a mmastrac, a zai-org y a NVIDIA.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que su adopción y validación por terceros es nula.

## Enlaces

- Repositorio del sidecar: https://huggingface.co/mmastrac/GLM-5.3-Flash-NVFP4-FP8-sidecar
- Modelo base cuantizado: https://huggingface.co/nvidia/GLM-5.3-Flash-NVFP4
- Modelo base original en FP8: https://huggingface.co/zai-org/GLM-5.3-Flash
- Ficheros internos citados en la model card: `fp8_sidecar.safetensors`, `fp8_sidecar_dense_mlp.safetensors`, `manifest.json`, `manifest_dense_mlp.json`, `build_sidecar.py`
- La búsqueda web realizada no ha devuelto ningún enlace relacionado con el modelo ni con sus autores; los resultados obtenidos tratan sobre entidades bancarias y no se han utilizado.
