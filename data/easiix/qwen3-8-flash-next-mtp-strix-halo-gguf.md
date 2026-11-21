# EasiiX/Qwen3.8-Flash-Next-MTP-Strix-Halo-GGUF

## Resumen

EasiiX/Qwen3.8-Flash-Next-MTP-Strix-Halo-GGUF no es un modelo completo, sino un *sidecar* GGUF que contiene exclusivamente la cabeza de predicción multi-token (MTP, multi-token prediction) del modelo Qwen/Qwen3.8-Flash-Next, exportada como fichero independiente para su uso en decodificación especulativa con llama.cpp. El autor es el usuario de Hugging Face EasiiX, y el objetivo es recuperar unos pesos que, aunque están presentes en el checkpoint oficial de Qwen, se eliminan en las conversiones GGUF habituales, de modo que los usuarios de llama.cpp no pueden aprovechar la aceleración que permite el draft head.

El artefacto está afinado y validado sobre hardware AMD Strix Halo (Ryzen AI MAX+ 395, gfx1151), con un modelo objetivo cuantizado a UD-IQ3_XXS, y reporta una mejora medida del 50 % en velocidad de decodificación sobre código (de 23,5 a 35,7 tokens por segundo, con ~85 % de tasa de aceptación) y del 49 % incluso a 156K tokens de profundidad de contexto. A temperatura 0 la decodificación especulativa es sin pérdida, por lo que la ganancia es puramente de rendimiento.

Su relevancia es práctica: permite acelerar la inferencia de Qwen3.8-Flash-Next en equipos con memoria unificada (no GPU discreta) sin reentrenar ni modificar el modelo principal. El repositorio ocupa 4,1 GB y acumula 724 descargas y 16 likes desde su creación el 27 de agosto de 2026. Conviene subrayar que el sidecar no es utilizable por sí solo: requiere un build específico de llama.cpp con soporte para la cabeza MTP de qwen4exp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de prediccion multi-token (MTP draft head) de un transformer, exportada como GGUF independiente para decodificacion especulativa |
| Parametros totales | 3.878.549.248 (dato real de safetensors del repositorio) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible para el sidecar; validado junto a un objetivo con contexto de 32768 tokens en el ejemplo de uso y con pruebas a 156K de profundidad |
| Tipos de cuantizacion | Q8_0 (fichero publicado); BF16 como paso intermedio en la conversion propia |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (etiqueta `other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El fichero contiene únicamente los tensores de la cabeza MTP del checkpoint Qwen3.8-Flash-Next, más los tensores de *hyper-connection* (`output_hc_norm.weight` y asociados) que llama.cpp exige desde el PR upstream #28901. No incluye los pesos del modelo principal: es un componente auxiliar que se carga junto al GGUF del modelo objetivo mediante el parámetro `-md` de `llama-server`. El diseño del draft head corresponde al equipo Qwen (PR #27739) y el soporte de qwen4exp en llama.cpp llegó con el PR #27742.

No se dispone de información sobre el entrenamiento original de la cabeza MTP (número de tokens, composición del dataset, uso de RLHF/DPO) en la información proporcionada. La innovación técnica relevante es la decodificación especulativa con verificación: el draft head propone hasta 4 tokens por paso (`--spec-draft-n-max 4`) y el modelo objetivo los valida en paralelo. El autor introduce una puerta de confianza (`--spec-draft-p-min 0.75`) que descarta borradores de baja probabilidad; sin ella, en texto en prosa con baja tasa de aceptación, el coste de los borradores rechazados supera la ganancia. El sidecar se puede regenerar con el conversor de la rama EngramHalo.cpp usando `--remote --mtp`, que descarga solo los tensores MTP (~8 GB de tráfico).

## Capacidades

- Aceleración de decodificación especulativa para Qwen3.8-Flash-Next en llama.cpp: no genera texto por sí mismo, propone tokens candidatos que el modelo objetivo verifica.
- Ganancia medida del 50 % en decodificación sobre código (23,5 → 35,7 t/s) con ~85 % de tasa de aceptación sobre un objetivo UD-IQ3_XXS.
- Ganancia del 49 % mantenida a 156K tokens de profundidad de contexto.
- Decodificación sin pérdida a temperatura 0 (la verificación garantiza la misma distribución que la decodificación normal).
- Compatibilidad con el modo `ngram-mod` combinado con `draft-mtp` en llama.cpp.
- Soporte de los tensores de hyper-connection requeridos por builds actuales de llama.cpp (PR #28901).
- No aporta capacidades nuevas de razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo: todas ellas dependen del modelo base Qwen3.8-Flash-Next.

## Casos de uso

- Servicio de generación de código en local sobre AMD Strix Halo: cargando el sidecar con `-md` junto al objetivo UD-IQ3_XXS se obtiene un 50 % más de throughput en tareas de código, lo que reduce la latencia percibida en asistentes de autocompletado y revisión.
- Inferencia en equipos con memoria unificada sin GPU discreta: el artefacto está específicamente ajustado para gfx1151 (Ryzen AI MAX+ 395), un escenario donde el ancho de banda es el cuello de botella y la decodificación especulativa amortiza el coste por token.
- Conversaciones de contexto largo: la ganancia del 49 % a 156K de profundidad permite mantener sesiones de análisis de documentos extensos sin que la velocidad de decodificación se desplome.
- Despliegue de agentes con múltiples pasos: al acelerar cada paso de generación, se reducen los tiempos totales de pipelines de razonamiento encadenado que emiten muchas llamadas cortas.
- Reproducción de resultados y benchmarking de hardware: sirve como componente de referencia para medir el impacto de MTP en distintas configuraciones de llama.cpp y comparar tasas de aceptación.
- Regeneración y empaquetado propio: el conversor de la rama permite reconstruir el sidecar desde el checkpoint oficial, útil para integraciones que necesitan BF16 o una cuantización distinta de Q8_0.
- Compatibilidad con endpoints: el repositorio está etiquetado como `endpoints_compatible`, lo que facilita su uso en despliegues gestionados que acepten artefactos GGUF auxiliares.

## Benchmarks y rendimiento

Los únicos datos publicados son mediciones del autor sobre AMD Strix Halo (Ryzen AI MAX+ 395, gfx1151) con objetivo UD-IQ3_XXS y temperatura 0:

| Escenario | Sin MTP | Con MTP | Mejora | Tasa de aceptacion |
|---|---|---|---|---|
| Decodificacion en codigo | 23,5 t/s | 35,7 t/s | +50 % | ~85 % |
| Decodificacion a 156K de contexto | no disponible | no disponible | +49 % | no disponible |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible, y no tendría sentido atribuirlos al sidecar, que no altera la calidad del modelo objetivo.

## Requisitos de hardware

- VRAM/memoria: el fichero Q8_0 ocupa 4,1 GB y debe residir junto al modelo objetivo; en Strix Halo se emplea memoria unificada, por lo que el presupuesto total es la suma del objetivo (tres shards UD-IQ3_XXS) más los 4,1 GB del sidecar.
- GPU recomendadas: AMD Ryzen AI MAX+ 395 (gfx1151) es el hardware validado. No se han publicado pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: cabe en equipos con memoria unificada de 64 GB o más; no hay datos de funcionamiento en GPUs discretas de consumo.
- Despliegue: exclusivamente llama.cpp con soporte de la cabeza MTP de qwen4exp; la rama probada es Aristo94/EngramHalo.cpp, que incluye parches de kernel para Strix Halo. No hay soporte indicado para vLLM, TGI, Ollama ni otros motores.
- Comando de referencia: `llama-server -m Qwen3.8-Flash-Next-UD-IQ3_XXS-00001-of-00003.gguf -ngl 999 -fa on -ctk q8_0 -ctv q8_0 -c 32768 -ub 2048 -md mtp-Qwen3.8-Flash-Next-hc-Q8_0.gguf --spec-type draft-mtp,ngram-mod --spec-draft-n-max 4 --spec-draft-p-min 0.75`.
- Latencia y throughput: 35,7 t/s medidos en el escenario de código indicado; sin datos para otros hardware.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| EasiiX/Qwen3.8-Flash-Next-MTP-Strix-Halo-GGUF | Sidecar MTP en GGUF | 3.878.549.248 | no disponible (probado a 156K de profundidad) | +50 % en codigo, +49 % a 156K (Strix Halo) | Qwen Community 1.0 | Hugging Face, 724 descargas |
| Qwen/Qwen3.8-Flash-Next | Modelo base completo | no disponible | no disponible | Referencia sin MTP | Qwen Community 1.0 | Hugging Face (oficial) |
| Conversiones GGUF habituales de Qwen3.8-Flash-Next | Modelo objetivo sin cabeza MTP | no disponible | no disponible | Sin aceleracion especulativa | Qwen Community 1.0 | Multiples repos comunitarios |
| Repositorio MTP GGUF de dzannotti (trabajo comunitario citado) | Sidecar MTP alternativo | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparación relevante no es frente a otros modelos, sino frente a ejecutar el mismo modelo objetivo sin el sidecar: la diferencia es la aceleración de decodificación descrita, sin cambios en la calidad de salida a temperatura 0.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el GGUF del objetivo Qwen3.8-Flash-Next y un build de llama.cpp con soporte qwen4exp no produce ninguna salida.
- El fichero `mtp-Qwen3.8-Flash-Next-Q8_0.gguf` está obsoleto desde el 19 de septiembre de 2026 y los builds actuales de llama.cpp lo rechazan con el error `check_tensor_dims: tensor 'output_hc_norm.weight' not found`; debe usarse el fichero con sufijo `-hc-`.
- Los datos de rendimiento proceden de un único hardware (Strix Halo, gfx1151) y de un único objetivo cuantizado (UD-IQ3_XXS); no son extrapolables a otras GPU ni a otras cuantizaciones.
- Sin la puerta de confianza `--spec-draft-p-min 0.75`, la prosa con baja tasa de aceptación puede ralentizarse respecto a la decodificación normal.
- La licencia Qwen Community License 1.0 incluye una cláusula de Model-as-a-Service que debe revisarse antes de servir el modelo comercialmente.
- No hay información sobre sesgos, riesgo de alucinación ni cobertura idiomática del sidecar; estas propiedades dependen íntegramente del modelo base.
- El repositorio no declara idiomas soportados ni pipeline, y no se han publicado benchmarks de calidad.
- La dependencia de una rama no oficial de llama.cpp (EngramHalo.cpp) implica riesgo de rotura ante cambios upstream.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/EasiiX/Qwen3.8-Flash-Next-MTP-Strix-Halo-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Rama de llama.cpp probada (parches Strix Halo y guia de compilacion): https://github.com/Aristo94/EngramHalo.cpp
- PR upstream de llama.cpp con soporte de tensores hyper-connection: https://github.com/ggml-org/llama.cpp/pull/28901
- PR upstream de llama.cpp con el diseno del draft head MTP: https://github.com/ggml-org/llama.cpp/pull/27739
- PR upstream de llama.cpp con soporte qwen4exp: https://github.com/ggml-org/llama.cpp/pull/27742
