# jerin8/Qwen-Image-2.1

## Resumen

Qwen-Image 2.1 Turbo LoRA es un adaptador LoRA de bajo rango publicado por el usuario jerin8 en Hugging Face, extraído por diferencia de pesos entre el modelo base Qwen-Image 2.1 y su variante Turbo distribuidas por Comfy-Org. Su funcion es transformar el modelo de difusion base en el modelo Turbo, permitiendo generar imagenes en 8 pasos con CFG 1, lo que reduce drasticamente el coste computacional de la inferencia frente al muestreo estandar.

El adaptador ocupa solo 153 MB, frente a los 913 MB del LoRA turbo oficial extraido por Comfy-Org, y segun el autor ambos producen resultados equivalentes en calidad, nitidez y renderizado de texto. Esta reduccion de tamano se consigue mediante una asignacion global de Frobenius sobre las descomposiciones SVD de los deltas de pesos de las 200 capas lineales del modelo.

Es relevante ahora porque permite a desarrolladores con hardware modesto ejecutar Qwen-Image 2.1 en modo Turbo dentro de ComfyUI con un unico fichero de 153 MB, manteniendo el modelo base completo en bf16 y aplicando el LoRA en tiempo de carga. El modelo esta pensado para el ecosistema ComfyUI y no es un modelo autonomo: requiere el modelo de difusion base, el text encoder `qwen3vl_8b` y el VAE `qwen_image_2.1_vae`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion Qwen-Image 2.1 |
| Parametros totales | no disponible (adaptador de 153 MB en bf16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (unico formato publicado) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research |
| Formato de pesos | safetensors (formato ComfyUI: `lora_up` / `lora_down` + `alpha` + `.diff`) |

## Arquitectura y entrenamiento

El adaptador no se entrena mediante un proceso de ajuste supervisado, sino que se extrae analiticamente de la diferencia de pesos entre el modelo base `qwen_image_2.1_bf16` y el modelo `qwen_image_2.1_turbo_bf16` de Comfy-Org. Para cada una de las 200 capas lineales del modelo de difusion se calcula la SVD del delta de pesos (turbo menos base) y se aplica una asignacion global de Frobenius: cada direccion singular conservada cuesta `out + in` parametros y elimina σ² de error cuadratico. Las direcciones se seleccionan en orden de error eliminado por parametro hasta agotar el presupuesto de tamano.

Los rangos resultantes van de 9 a 75 por capa, con una media de 26,5, frente a los aproximadamente 180 del LoRA oficial. Ademas, las capas pequenas y sensibles (proyeccion de entrada latente `img_in`, proyeccion de salida `proj_out`, primera capa lineal del embedder de timesteps y las escalas de normalizacion modificadas) se almacenan como pesos `.diff` exactos, sumando unos 3 MB adicionales. El resultado es un adaptador que conserva la parte estructurada del finetune Turbo y descarta el resto, que segun el autor se situa en su mayor parte a escala de redondeo bf16.

## Capacidades

- Transformacion del modelo base Qwen-Image 2.1 en su variante Turbo para muestreo en 8 pasos con CFG 1.
- Generacion de imagenes a partir de prompts de texto, usando el text encoder `qwen3vl_8b` del ecosistema Qwen-Image 2.1.
- Renderizado de texto en imagen con calidad equiparable al LoRA turbo oficial, segun el autor.
- Compatibilidad con el nodo `LoraLoaderModelOnly` de ComfyUI con fuerza 1.0.
- Integracion con el scheduler euler / simple y resoluciones de 1024x1024 (segun el ejemplo publicado).
- No es un modelo autonomo: no soporta tool calling, agentes, vision de entrada ni razonamiento multi-paso por si mismo.

## Casos de uso

- Generacion rapida de imagenes en ComfyUI: cargando el modelo base `qwen_image_2.1_bf16` y aplicando este LoRA a fuerza 1.0, se obtienen renders en 8 pasos con CFG 1, lo que reduce el tiempo de muestreo frente al modelo base sin turbo.
- Prototipado de pipelines de difusion con hardware limitado: el adaptador de 153 MB permite experimentar con el comportamiento Turbo sin descargar el modelo turbo completo en bf16.
- Iteracion rapida en diseno grafico asistido: la reduccion a 8 pasos facilita ciclos de prueba y error con prompts y semillas en sesiones interactivas.
- Generacion de imagenes con texto integrado: el modelo conserva la capacidad de renderizado de texto del Qwen-Image 2.1 Turbo, util para maquetas, carteles o mockups.
- Despliegue en entornos con almacenamiento restringido: al pesar 153 MB frente a los 913 MB del LoRA oficial, simplifica la distribucion del adaptador en repositorios o contenedores.
- Comparacion controlada de variantes Turbo: investigadores pueden usar este LoRA para reproducir el comportamiento Turbo y medir diferencias frente al modelo completo, dado que el autor documenta las metricas PSNR de divergencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor proporciona metricas de similitud en espacio de pesos y en renders:

| Comparacion | Metrica | Valor |
|---|---|---|
| Cambio de Turbo respecto al base | Error relativo de pesos | 0,238 % |
| LoRA oficial (913 MB) vs pesos Turbo | Error relativo de pesos | 0,186 % |
| Este LoRA (153 MB) vs pesos Turbo | Error relativo de pesos | 0,209 % |
| Redondeo bf16 ya presente en el fichero Turbo | Error relativo de pesos | 0,166 % |
| Este LoRA vs LoRA oficial | PSNR en renders | 20,4 dB |
| LoRA oficial vs modelo Turbo | PSNR en renders | 18,5 dB |
| Este LoRA vs modelo Turbo | PSNR en renders | 16,6 dB |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base Qwen-Image 2.1 en bf16, del text encoder `qwen3vl_8b` y del VAE, no del LoRA en si (153 MB).
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: ComfyUI con el nodo `LoraLoaderModelOnly`; el autor no documenta otros runners (vLLM, llama.cpp, Ollama, TGI no aplican a un LoRA de difusion en este formato).
- Latencia y throughput: no disponibles; el autor solo indica 8 pasos y CFG 1 como configuracion de muestreo.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Pasos | CFG | Licencia | Formato |
|---|---|---|---|---|---|---|
| Este LoRA (jerin8) | LoRA extraido | 153 MB | 8 | 1 | qwen-research | safetensors (ComfyUI) |
| LoRA turbo oficial (`qwen_image_2.1_turbo_lora_avg_rank_178_bf16`) | LoRA extraido | 913 MB | 8 | 1 | qwen-research | safetensors (ComfyUI) |
| `qwen_image_2.1_turbo_bf16` | Modelo completo Turbo | no disponible | 8 | 1 | qwen-research | safetensors |
| `qwen_image_2.1_bf16` | Modelo base | no disponible | no disponible | no disponible | qwen-research | safetensors |

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base Qwen-Image 2.1, el text encoder `qwen3vl_8b` y el VAE `qwen_image_2.1_vae` para funcionar.
- Divergencia respecto al Turbo completo: el autor documenta 16,6 dB de PSNR frente al modelo Turbo, con deriva en detalles pequenos (por ejemplo, una lampara adicional o distinta cantidad de niebla). Para comportamiento Turbo exacto recomienda usar `qwen_image_2.1_turbo_bf16`.
- Solo se distribuye en bf16; no hay versiones cuantizadas publicadas.
- Idiomas soportados no documentados en la model card.
- Licencia `qwen-research`: restricciones de uso comercial heredadas de Qwen-Image 2.1; conviene revisar el enlace de licencia antes de un despliegue en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente de los resultados declarados por el autor.
- Riesgo de alucinacion visual y sesgos del modelo base no documentados en esta model card; deben evaluarse sobre Qwen-Image 2.1.
- Dependencia del ecosistema ComfyUI: el formato `lora_up` / `lora_down` + `alpha` + `.diff` esta pensado para ese runner.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jerin8/Qwen-Image-2.1
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia qwen-research: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
