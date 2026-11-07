# Pandoks/red-snow-5.3-flash-nvfp4-kda-gate-revert

## Resumen

RED-SNOW 5.3 FLASH NVFP4 (KDA gate revert) es una compilacion experimental de prueba derivada de `Blackfrost-AI/RED-SNOW-5.3-FLASH-NVFP4`, que a su vez parte de `Blackfrost-AI/RED-SNOW-5.3-FLASH-BF16`. El modelo esta orientado a ciberseguridad ofensiva, emulacion de adversarios, razonamiento y uso de herramientas, y se distribuye en formato NVFP4 (cuantizacion de 4 bits en punto flotante de NVIDIA via ModelOpt) sobre una arquitectura de tipo `glm5_next` con 161.461.030.910 parametros totales y un repositorio de 204,5 GB. Su autor es el usuario Pandoks, y la licencia declarada es MIT.

La modificacion concreta respecto al modelo fuente es un reemplazo byte a byte de las proyecciones de compuerta KDA (`self_attn.f_a_proj`, `f_b_proj`, `b_proj`, `g_a_proj`, `g_b_proj`) en las 34 capas KDA, sustituyendolas por los valores del modelo base `nvidia/GLM-5.3-Flash-NVFP4` (identicos a `zai-org/GLM-5.3-Flash-BF16`). El resto de tensores, cabeceras safetensors, indice y ficheros auxiliares permanecen sin cambios. El objetivo declarado es diagnosticar bucles de repeticion en contexto largo.

Es relevante ahora como artefacto de depuracion reproducible: documenta con precision los 170 tensores alterados y las revisiones exactas de origen, lo que permite aislar el efecto de las compuertas KDA en el comportamiento degenerado. No es una version destinada a uso general ni a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo `glm5_next` con 34 capas KDA (Kimi Delta Attention) en el modelo de lenguaje |
| Parametros totales | 161.461.030.910 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, ModelOpt); el modelo base del que deriva se distribuye en BF16 y existe una variante FP4 local |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (cuantizacion NVFP4 embebida) |
| Tamano del repositorio | 204,5 GB |
| Modalidad | image-text-to-text (segun tags), pipeline text-generation |
| Modelo base | Blackfrost-AI/RED-SNOW-5.3-FLASH-BF16 |
| Revision fuente | Blackfrost-AI/RED-SNOW-5.3-FLASH-NVFP4 @ 8133f8ba249427a0dbe0ee197f8562d2ef109569 |
| Revision de pesos KDA | nvidia/GLM-5.3-Flash-NVFP4 @ 1d00738646cbb0c6d0a9eb403dac5f366f1473a7 |
| Tensores modificados | 170 (5 patrones x 34 capas) |
| Runtime recomendado | SGLang (tag `sglang`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer con atencion KDA (Kimi Delta Attention) en 34 capas, identificada en los tags como `glm5_next`. La variante aqui publicada no introduce entrenamiento nuevo: es una edicion de pesos sobre una cuantizacion NVFP4 ya existente. Las cinco proyecciones de compuerta por capa (`f_a_proj`, `f_b_proj`, `b_proj`, `g_a_proj`, `g_b_proj`) se restauran a los valores del GLM-5.3 Flash original, manteniendo el mismo tipo BF16 y la misma forma, mientras que el resto de tensores permanece byte-identico al modelo fuente. Las cabeceras safetensors y el indice no se han regenerado.

No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset ni fases de RLHF o DPO en la informacion proporcionada. El proposito de la edicion es de diagnostico: revertir las compuertas KDA a su estado original permite comprobar si los bucles de repeticion en contexto largo observados en la variante NVFP4 se originan en esas proyecciones o en otro componente.

## Capacidades

- Generacion de texto y razonamiento de multiples pasos (tags `reasoning`, `text-generation`, `conversational`).
- Uso de herramientas y function calling (tag `tool-use`).
- Capacidades de ciberseguridad ofensiva: red-team, emulacion de adversarios y pruebas de seguridad autorizadas.
- Procesamiento de imagen y texto (`image-text-to-text` en los tags), aunque el pipeline declarado es `text-generation`.
- Soporte multilingue limitado al ingles (`en`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Integracion con el arnes `cyber-frost-harness` del autor.

## Casos de uso

- Diagnostico de degeneracion en contexto largo: ejecutar el modelo con prompts de contexto extendido y comparar la tasa de repeticion frente a la variante NVFP4 original, aislando el efecto de las compuertas KDA.
- Validacion de cuantizaciones NVFP4: servir el modelo en SGLang y medir si la restauracion de pesos BF16 en las proyecciones de compuerta corrige divergencias numericas introducidas por la cuantizacion.
- Pruebas de regresion de artefactos: verificar mediante los checksums de `METADATA-SHA256SUMS.txt` que solo los 170 tensores declarados difieren del modelo fuente.
- Emulacion de adversarios en laboratorio: usar el modelo como generador de tecnicas y procedimientos en ejercicios de red-team con autorizacion explicita.
- Investigacion sobre atencion KDA: analizar el impacto de las proyecciones de compuerta en el comportamiento del modelo sin reentrenar.
- Evaluacion de pipelines de inferencia: comparar latencia y estabilidad entre SGLang y otros runtimes sobre pesos NVFP4 de 161 mil millones de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 161,46 mil millones de parametros en NVFP4 (4 bits), el peso ronda los 80-90 GB, mas overhead de activaciones y cache KV; se requiere un nodo multi-GPU.
- GPU recomendadas: H100 80 GB (2-4 unidades), H200, B200 o A100 80 GB en configuracion multiple.
- No cabe en GPU de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola tarjeta de gama alta.
- Despliegue: SGLang es el runtime indicado por los tags; vLLM, TGI o llama.cpp no estan confirmados para NVFP4 en esta configuracion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pandoks/red-snow-5.3-flash-nvfp4-kda-gate-revert | 161,46 B | no disponible | NVFP4 | MIT | Hugging Face (build experimental) |
| Blackfrost-AI/RED-SNOW-5.3-FLASH-NVFP4 | no disponible | no disponible | NVFP4 | no disponible | Hugging Face |
| Blackfrost-AI/RED-SNOW-5.3-FLASH-FP4-Local | no disponible | no disponible | FP4 local | no disponible | Hugging Face |
| nvidia/GLM-5.3-Flash-NVFP4 | no disponible | no disponible | NVFP4 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Build experimental y privado segun el autor: "Private test build for diagnosing long-context repetition loops. Not for general use."
- Bucles de repeticion en contexto largo documentados en la variante de la que deriva; esta edicion busca diagnosticarlos, no garantiza corregirlos.
- Solo ingles; sin soporte multilingue declarado.
- Riesgo de alucinacion y de contenido ofensivo por su orientacion a red-team; requiere supervision humana y autorizacion explicita en cualquier uso.
- La licencia MIT se declara en el repositorio, pero el modelo base y los pesos KDA provienen de terceros (`Blackfrost-AI`, `nvidia`, `zai-org`); conviene verificar las condiciones de esas fuentes antes de un uso comercial.
- El `README.md` sustituye a la model card original, por lo que la linea correspondiente en `METADATA-SHA256SUMS.txt` no coincide con el fichero actual.
- Sin datos publicados de benchmarks, contexto maximo ni rendimiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pandoks/red-snow-5.3-flash-nvfp4-kda-gate-revert
- Coleccion RED-SNOW-5.3-FLASH: https://huggingface.co/collections/Blackfrost-AI/red-snow-53-flash
- Variante FP4 local: https://huggingface.co/Blackfrost-AI/RED-SNOW-5.3-FLASH-FP4-Local
- Modelo fuente NVFP4: https://huggingface.co/Blackfrost-AI/RED-SNOW-5.3-FLASH-NVFP4
- Pesos KDA originales: https://huggingface.co/nvidia/GLM-5.3-Flash-NVFP4
- Modelo base BF16: https://huggingface.co/Blackfrost-AI/RED-SNOW-5.3-FLASH-BF16
