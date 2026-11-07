# Pandoks/red-snow-5.3-flash-nvfp4-half-delta

## Resumen

RED-SNOW 5.3 FLASH NVFP4 half-delta es una compilacion experimental derivada de `Blackfrost-AI/RED-SNOW-5.3-FLASH-NVFP4`, que a su vez parte del modelo base `zai-org/GLM-5.3-Flash-BF16`. El autor, Pandoks, ha aplicado una interpolacion lineal del 50 % entre los pesos del modelo base y los del modelo ajustado (RED-SNOW) sobre todos los tensores almacenados en BF16 que difieren entre ambos, calculando en fp32 y redondeando a BF16 con round-to-nearest-even. Los pesos NVFP4 de expertos enrutados y MLP densos, sus escalas, los tensores F32 y los metadatos de cuantizacion permanecen intactos.

El modelo esta orientado a ciberseguridad ofensiva, red-team y emulacion de adversarios, segun los tags del repositorio, e incorpora capacidades de tool use y razonamiento. La arquitectura subyacente es GLM-5.3 (familia `glm5_next`), con un total de 161.461.030.910 parametros segun los safetensors publicados. El repositorio ocupa 204,5 GB y solo esta disponible en ingles.

Se trata de una compilacion privada de prueba para diagnosticar bucles de repeticion en contexto largo, segun declara el propio autor, y no esta pensada para uso general. La ficha se limita a describir lo que la model card y los metadatos de Hugging Face permiten verificar; buena parte de las especificaciones tecnicas (contexto, cuantizaciones, datos de entrenamiento, benchmarks) no estan documentadas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3 (familia `glm5_next`); transformer con mezcla de expertos (MoE) segun los patrones de tensores (`shared_experts`, `kv_a_proj_with_mqa`) |
| Parametros totales | 161.461.030.910 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 en pesos de expertos enrutados y MLP densos; BF16 en el resto de tensores modificados; el autor indica que el repositorio es compatible con endpoints de 8 bits, aunque la cuantizacion principal es NVFP4 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers; compatible con SGLang segun tags) |

## Arquitectura y entrenamiento

El modelo base es GLM-5.3-Flash-BF16 de zai-org. Los patrones de tensores modificados (`mlp.shared_experts.{gate,up,down}_proj`, `self_attn.{q,k,v,o}_proj`, `self_attn.kv_a_proj_with_mqa`, `self_attn.{q_a,q_b,f_a,f_b,g_a,g_b,b}_proj`) apuntan a una arquitectura transformer con mezcla de expertos con expertos compartidos y atencion con proyecciones de bajo rango y compresion KV (atención de tipo MLA o similar). No se dispone de informacion sobre el numero de capas, dimension oculta, numero de expertos ni ventana de contexto.

El proceso de creacion de esta variante es puramente de post-procesado de pesos: para cada tensor almacenado en BF16 en el checkpoint fuente que difiere del modelo base, se calcula `base + 0.5 * (redsnow - base)` en fp32 y se redondea a BF16. Se modificaron 476 tensores, entre ellos 42 `shared_experts.{gate,up,down}_proj`, 45 `o_proj`, 34 de cada una de las proyecciones `q_proj`, `k_proj`, `v_proj`, `b_proj`, `f_a_proj`, `f_b_proj`, `g_a_proj` y `g_b_proj`, y 11 de `kv_a_proj_with_mqa`, `q_a_proj` y `q_b_proj`. El resto de tensores es byte-identico al checkpoint fuente, y las cabeceras e indice de safetensors no se han alterado.

No hay informacion sobre el dataset de entrenamiento del modelo base ni del ajuste RED-SNOW, ni sobre si se emplearon RLHF, DPO u otras tecnicas de alineamiento. Tampoco se documentan innovaciones de decodificacion o atencion mas alla de lo que sugieren los nombres de tensores.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento (tag `reasoning` en el repositorio).
- Tool use y function calling (tags `tool-use` y `endpoints_compatible`).
- Capacidades de ciberseguridad ofensiva: red-team, emulacion de adversarios, seguridad ofensiva (tags del repositorio).
- Entrada multimodal imagen-texto segun el pipeline declarado (`image-text-to-text`), aunque la model card no detalla el soporte de vision.
- Integracion con el arnes `cyber-frost-harness` mencionado en los tags.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.

## Casos de uso

- Diagnostico de bucles de repeticion en contexto largo: el autor declara que esta compilacion sirve para depurar este comportamiento; se usaria como checkpoint de prueba en pipelines de evaluacion de generacion larga, comparando su salida con la del modelo fuente.
- Emulacion de adversarios en ejercicios de red-team autorizados: el ajuste RED-SNOW esta orientado a este dominio, por lo que puede generar TTPs, guiones de simulacion y narrativas de ataque en entornos controlados.
- Evaluacion comparativa de tecnicas de cuantizacion: al mantener los pesos NVFP4 intactos y modificar solo tensores BF16, permite estudiar el impacto de la interpolacion de pesos en modelos cuantizados.
- Investigacion sobre merging e interpolacion de pesos: el calculo `base + 0.5 * (redsnow - base)` es un caso concreto de model arithmetic que puede reproducirse y medirse con este checkpoint.
- Pruebas de integracion con SGLang: el tag `sglang` sugiere que el modelo esta pensado para servirse con ese motor; util para validar despliegues NVFP4 en produccion.
- Generacion asistida en flujos de tool calling: con soporte declarado de tool use, puede probarse en agentes que invocan herramientas en tareas de seguridad o analisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 161.461 millones de parametros, un checkpoint BF16 requeriria aproximadamente 323 GB; la variante NVFP4 reduce el peso de los expertos y MLP densos a 4 bits, pero el repositorio completo ocupa 204,5 GB, por lo que la inferencia exige agregacion de memoria en varias GPU.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, el despliegue requiere nodos multi-GPU de clase H100/H200 o A100 de 80 GB; no cabe en GPU de consumo.
- GPU de consumo: no cabe en ninguna GPU consumer actual.
- Opciones de despliegue: transformers (libreria declarada) y SGLang (tag `sglang`); compatibilidad con endpoints de 8 bits segun tags. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Pandoks/red-snow-5.3-flash-nvfp4-half-delta | 161,46 B | no disponible | MIT | Publico en HF | Variante experimental half-delta sobre NVFP4 |
| Blackfrost-AI/RED-SNOW-5.3-FLASH-NVFP4 | no disponible | no disponible | no disponible | Acceso con aceptacion de condiciones | Checkpoint fuente del anterior |
| zai-org/GLM-5.3-Flash-BF16 | no disponible | no disponible | no disponible | Publico en HF | Modelo base de la familia GLM-5.3 |

No se dispone de datos de rendimiento, contexto ni parametros activos de los modelos comparados en la informacion proporcionada, por lo que la comparativa se limita a licencia y disponibilidad.

## Limitaciones y advertencias

- Compilacion experimental: el autor la describe como build privada de prueba para diagnosticar bucles de repeticion y explicitamente "not for general use".
- Solo ingles: el campo `language` del repositorio declara unicamente `en`.
- Sin benchmarks: no hay evidencia publicada de calidad, seguridad o robustez de esta variante.
- Riesgo de alucinacion: no cuantificado; al ser una interpolacion de pesos, el comportamiento puede degradarse respecto al modelo fuente.
- Uso dual: el ajuste esta orientado a seguridad ofensiva y red-team; la coleccion del autor indica "Authorized Red-Team Engagement Use Only". Aunque la licencia es MIT, el uso en produccion requiere evaluacion legal y de riesgo propia.
- Restricciones de acceso al modelo fuente: el checkpoint original requiere aceptar condiciones de uso, lo que puede afectar a la trazabilidad y redistribucion.
- Compatibilidad: el README sustituye la model card original, y la linea `README.md` de `METADATA-SHA256SUMS.txt` referencia la tarjeta original, lo que complica la verificacion de integridad.
- Sin datos de contexto, cuantizaciones alternativas ni parametros activos, no es posible planificar el despliegue con garantias.

## Enlaces

- Hugging Face: https://huggingface.co/Pandoks/red-snow-5.3-flash-nvfp4-half-delta
- Modelo fuente: https://huggingface.co/Blackfrost-AI/RED-SNOW-5.3-FLASH-NVFP4
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Coleccion RED-SNOW-5.3-FLASH: https://huggingface.co/collections/Blackfrost-AI/red-snow-53-flash
