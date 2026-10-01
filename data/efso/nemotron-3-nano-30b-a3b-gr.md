# Efso/Nemotron-3-Nano-30B-A3B-GR

## Resumen

Nemotron-3-Nano-30B-A3B-GR es un ajuste fino mediante LoRA del modelo NVIDIA Nemotron 3 Nano 30B-A3B, orientado a mejorar la calidad del griego moderno. Lo publica el usuario Efso (repositorio `Efso/Nemotron-3-Nano-30B-A3B-GR`) como **estudio de caso de investigación**, no como asistente griego recomendado para producción. Se distribuye en formato GGUF (Q4_K_M y Q8_0) junto con el adaptador LoRA en safetensors, y parte de la revisión `bf77c31` del modelo base `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16`.

El modelo base tiene 31.577.940.288 parámetros totales y una arquitectura híbrida de la familia `nemotron_h`, que combina capas Mamba-2 con componentes transformer y mezcla de expertos (MoE); la nomenclatura «A3B» del nombre indica del orden de 3.000 millones de parámetros activos por token. El ajuste se entrenó en 4 bits (NF4) sobre 44 GB de GPU de consumo repartidas en tres tarjetas bajo Windows 10, con un LoRA de rango 16 sobre 92 módulos.

Su relevancia es doble: por un lado muestra que es viable ajustar un MoE híbrido Mamba-2 de ~31,6B en hardware de consumo sin WSL ni compilación CUDA de `mamba-ssm`; por otro, documenta con mediciones honestas que el ajuste mejora la forma del griego (menos repeticiones, sin caracteres cirílicos o latinos extraviados, prosa en lugar de markdown pesado) pero **no mejora el conocimiento factual**, y que tanto el modelo ajustado como el original inventan datos en la mayoría de preguntas de conocimiento en griego.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Mamba-2 + transformer con mezcla de expertos (MoE); clase `nemotron_h` del modelo base |
| Parametros totales | 31.577.940.288 (~31,6 mil millones), dato real de safetensors |
| Parametros activos | ~3.000 millones (segun la nomenclatura A3B del modelo base; no confirmado de forma explicita en la informacion proporcionada) |
| Longitud de contexto | No disponible; el ejemplo de despliegue de la model card usa `-c 16384` |
| Tipos de cuantizacion | GGUF Q4_K_M (24,5 GB) y Q8_0 (33,6 GB); el entrenamiento partio del base cargado en 4-bit NF4 |
| Idiomas soportados | Griego moderno (`el`) como idioma objetivo del ajuste; el modelo base es multilingue |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | GGUF (Q4_K_M, Q8_0) y adaptador LoRA en safetensors |
| Tipo de ajuste | LoRA, rango 16, alpha 32, dropout 0 |
| Modulos objetivo del LoRA | 92 modulos: `in_proj`/`out_proj` de Mamba y `up_proj`/`down_proj` de los expertos compartidos |
| Tamano del repositorio | 58,1 GB |
| Autor | Efso |
| Fecha de publicacion | 1 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Nemotron 3 Nano de NVIDIA y su arquitectura es híbrida: intercala capas Mamba-2 (modelo de espacio de estados) con capas de atención y una capa de mezcla de expertos, lo que explica que el ajuste LoRA se aplicara tanto a las proyecciones de entrada y salida de Mamba como a las proyecciones de los expertos compartidos. Los kernels de Mamba-2 del modelo son Triton, lo que permitió ejecutarlos bajo `triton-windows` con un pequeño parche de importación (`patch_mamba_ssm_init.py`) en lugar de recurrir a WSL o a una compilación CUDA de `mamba-ssm`. Para el entrenamiento en 4 bits se usó el modelo de código remoto de NVIDIA (`trust_remote_code=True`), porque la clase nativa de transformers 5.5 fusiona los expertos en tensores 3D que bitsandbytes deja en BF16 y el modelo no cabe en memoria. El modelo cuantizado se repartió manualmente entre tres GPU de capacidad desigual.

Los datos de ajuste son 1.978 pares pregunta-respuesta en griego para entrenamiento y 87 para validación, con una mediana de 840 caracteres por respuesta. Todo el texto fue generado o reescrito por LLM y verificado después; no hay datos de hablantes nativos y el conjunto de datos no se publica. El régimen fue de 1 época, 248 pasos, tasa de aprendizaje 5e-5, batch 1 con acumulación de gradiente 8, máximo de 768 tokens por ejemplo y pérdida calculada solo sobre los tokens del asistente. La pérdida de validación bajó de 2,10 a 1,73. El límite de 768 tokens vino impuesto por el hardware: con 1.024 y 2.048 tokens se agotaba la memoria. No hay RLHF, DPO ni trazas de razonamiento en los datos, y el modo «thinking» no se entrenó.

## Capacidades

- Generacion de texto en griego moderno con prosa limpia y sin markdown pesado, que es la mejora principal documentada del ajuste.
- Reduccion de artefactos tipicos: sin bucles de repeticion y sin caracteres cirilicos o latinos extraviados en medio del texto griego.
- Tool calling / function calling en ingles preservado respecto al modelo base: 10 de 12 comprobaciones superadas, la misma cifra que el modelo original.
- Conversacion multi-turno: probado en una conversacion de 17 turnos, aunque la evaluacion principal es de pregunta-respuesta de un solo turno.
- Generacion de respuestas de longitud media (mediana de 840 caracteres en los datos de entrenamiento, con un maximo de 768 tokens por ejemplo durante el ajuste).
- Capacidades heredadas del modelo base (multilingues, generacion general, MoE con ~3.000 millones de parametros activos), no reevaluadas en esta ficha.
- **No soporta** modo de razonamiento o «thinking»: no fue entrenado y la model card lo declara no soportado.

## Casos de uso

- Estudio de caso reproducible de ajuste eficiente: sirve como referencia metodologica para ajustar un MoE hibrido Mamba-2 de ~31,6B en 44 GB de GPU de consumo bajo Windows, incluyendo los parches necesarios para `mamba-ssm` y `triton-windows`.
- Generacion de texto en griego con estilo controlado: redaccion de borradores, resumenes o parafrasis en griego donde prima la fluidez y la limpieza tipografica por encima de la exactitud factual.
- Normalizacion de salida multilingue: uso del ajuste para eliminar contaminacion de alfabetos (cirilico, latin) en generaciones griegas, un fallo frecuente del modelo base.
- Punto de partida para ajustes LoRA posteriores en griego: el adaptador de 48 MB y rango 16 puede reutilizarse o fusionarse como base para nuevos conjuntos de datos.
- Investigacion sobre retencion de capacidades tras un ajuste de idioma: el repositorio aporta mediciones de tool calling antes y despues, utiles para estudiar olvido catastrofico en modelos MoE.
- Evaluacion de despliegue en llama.cpp: con la build indicada (`convert_hf_to_gguf.py`, commit `b9b8207`) y la cuantizacion b11243, sirve para medir latencia y consumo de memoria de un GGUF de 24,5 GB en GPUs de consumo.
- Pruebas de plantilla de chat y control de modo thinking: util para verificar que `enable_thinking: false` se propaga correctamente en `llama-server --jinja`.

## Benchmarks y rendimiento

Test ciego de 20 preguntas griegas repartidas en 10 campos, comparando v3c frente al modelo base, ambos en Q4_K_M sobre llama.cpp:

| Prueba | v3c mejor | Base mejor | Empate |
|---|---:|---:|---:|
| Preguntas procedentes de los datos de entrenamiento (10) | 5 | 0 | 5 |
| Preguntas nuevas (10) | 3 | 3 | 4 |

| Metrica | v3c | Modelo base |
|---|---:|---:|
| Respuestas con nucleo correcto y griego legible (de 20) | 2 | 3 |
| Tool calling en ingles (de 12 comprobaciones) | 10 | 10 |
| Cuota de texto en alfabeto griego (150 preguntas reservadas) | 100% | no disponible |
| F1 por caracter (150 preguntas reservadas) | 0.182 | 0.126 |
| Perdida de validacion | 2.10 -> 1.73 | no disponible |

El propio autor advierte que el F1 por caracter contra respuestas de referencia cortas dice poco sobre respuestas largas, y que el resultado que debe tenerse en cuenta es el test ciego leido a mano. No se han publicado otras cifras de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: unos 24,5 GB solo de pesos, mas la cache de contexto; con 16.384 tokens de contexto hay que contar con margen adicional. Estimacion derivada del tamano de fichero, no una cifra medida publicada.
- VRAM estimada para Q8_0: unos 33,6 GB solo de pesos, mas contexto.
- GPU de consumo: Q4_K_M no cabe completo en una RTX 4090 o RTX 3090 de 24 GB, por lo que requiere reparto entre varias tarjetas u offload parcial a RAM; una RTX 5090 de 32 GB seria la opcion monogpu mas realista para Q4_K_M. Q8_0 queda fuera de cualquier GPU de consumo actual.
- GPU profesionales: A100 40/80 GB, H100 80 GB o L40S 48 GB para Q8_0 sin reparto.
- Configuracion de entrenamiento documentada: 2x RTX 5060 Ti 16 GB + 1x RTX 3060 12 GB (44 GB en total), Windows 10, aproximadamente 98 segundos por paso y 7,7 horas en total.
- Despliegue: llama.cpp y `llama-server` son la via soportada explicitamente (`llama-server -m ...gguf --jinja -ngl 99 -c 16384`). Otros runners compatibles con GGUF (Ollama, LM Studio) no estan documentados en la model card.
- Parametros de muestreo recomendados por el autor: temperatura 0,6, top_p 0,95, top_k 20, con `chat_template_kwargs: {"enable_thinking": false}` en cada peticion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Efso/Nemotron-3-Nano-30B-A3B-GR (v3c) | ~31,6B totales, ~3B activos | no disponible | Griego (el) | NVIDIA Nemotron Open Model License | GGUF Q4_K_M/Q8_0 + LoRA safetensors |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 (base) | ~31,6B totales, ~3B activos | no disponible | Multilingue | NVIDIA Nemotron Open Model License | Safetensors BF16 |

No se dispone de datos en la informacion proporcionada sobre otros ajustes finos en griego del mismo modelo base ni sobre alternativas de tamano comparable con las que establecer una comparacion cuantitativa. Cualquier comparacion de rendimiento con modelos de terceros requeriria ejecutar la misma bateria de pruebas, que no esta publicada.

## Limitaciones y advertencias

- **Inventa hechos, nombres y fechas**, igual que el modelo base: en el test ciego solo 2 de 20 respuestas tuvieron nucleo correcto y griego legible, frente a 3 de 20 del modelo original.
- El ajuste mejora la forma del griego, no el conocimiento: la model card lo declara explicitamente como estudio de caso y no como asistente griego recomendado.
- Sigue produciendo pseudopalabras y formas gramaticales incorrectas en griego.
- El modo de razonamiento («thinking») no esta entrenado ni soportado; la model card indica que no hay trazas de razonamiento en los datos.
- Evaluacion limitada: pregunta-respuesta griega de un solo turno, una conversacion de 17 turnos y las comprobaciones de tool calling en ingles. No hay evaluacion de contexto largo ni de otras tareas.
- Los datos de entrenamiento son sinteticos, generados o reescritos por LLM y verificados a posteriori; no hay datos de hablantes nativos y el conjunto no se publica, lo que limita la reproducibilidad del ajuste.
- El entrenamiento se limito a 768 tokens por ejemplo por falta de memoria, lo que puede degradar el comportamiento en respuestas largas.
- **Caveat tecnico de carga del adaptador**: PEFT 0.19 con transformers 5 renombra `backbone.` a `model.` en `nemotron_h`; combinado con el modelo de codigo remoto, esto descarta silenciosamente todos los tensores LoRA. El adaptador se carga sin error y no hace nada. Hay que cargar los tensores por nombre exacto (`load_adapter_state` en `training/train.py`) o fusionar en CPU con `scripts/merge_lora_tensors.py`.
- Licencia: los pesos son un derivado de Nemotron 3 Nano y su uso se rige por la NVIDIA Nemotron Open Model License. Conviene revisar los terminos del enlace antes de cualquier uso comercial.
- Repositorio con 0 descargas y 0 «likes» en el momento de la consulta: no hay validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Efso/Nemotron-3-Nano-30B-A3B-GR
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Repositorio del estudio de caso, codigo y mediciones: https://github.com/Efs-O/NemotronGR
- Documentacion completa del estudio: https://github.com/Efs-O/NemotronGR/blob/main/docs/CASE_STUDY.md
- Parche de importacion de `mamba-ssm`: https://github.com/Efs-O/NemotronGR/blob/main/scripts/patch_mamba_ssm_init.py
- Licencia NVIDIA Nemotron Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
