# Shameless111/Loopy-Ouro-2.6B-W4A8-G32

## Resumen

Loopy-Ouro-2.6B-W4A8-G32 es un checkpoint cuantizado derivado de ByteDance/Ouro-2.6B, un modelo de lenguaje recurrente de 2.600 millones de parametros desarrollado por ByteDance. Lo publica el usuario Shameless111 bajo el marco de trabajo "Loopy", orientado a la cuantizacion de modelos recurrentes con cargadores personalizados. El modelo aplica cuantizacion de pesos a 4 bits (W4) y activaciones dinamicas a 8 bits por token (A8), con un tamano de grupo de pesos de 32 y una profundidad recurrente de T=4.

El problema que aborda es la reduccion del coste de memoria e inferencia de modelos recurrentes manteniendo la calidad mediante una busqueda sobre un pool de 400 candidatos de cuantizacion. El checkpoint seleccionado (`s204066314_p12_b128`) usa rotacion Hadamard con semilla 204066314, potencia de escalado 1.2 y bloques Hadamard de 128. El resultado guardado reporta una perplejidad de 4.46 en LAMBADA y una precision media de 68.64% en cinco tareas de evaluacion.

Es relevante porque demuestra una metodologia reproducible de cuantizacion W4A8 para modelos recurrentes, con protocolo de evaluacion congelado y artefactos de procedencia. No obstante, se trata de un checkpoint de investigacion con cargador propio, sin kernel INT4 empaquetado y sin integracion directa en Transformers, lo que limita su uso en produccion inmediata.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer recurrente (recurrent-language-model), profundidad recurrente T=4 |
| Parametros totales | 2.600 millones (modelo base Ouro-2.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (usado en la evaluacion WT2) |
| Tipos de cuantizacion | Pesos W4 (codigos INT8 en contenedor), activaciones A8 dinamicas por token, grupo de pesos 32 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (pesos); codigo de investigacion con avisos en `code/THIRD_PARTY_NOTICES.md` |
| Formato de pesos | `selected.pt` (state dict PyTorch con codigos INT8, escalas, zero points, escalado de entrada y signos Hadamard); no usa almacenamiento INT4 empaquetado |

## Arquitectura y entrenamiento

El modelo base Ouro-2.6B es un modelo de lenguaje recurrente con profundidad recurrente T=4, es decir, reaplica un mismo bloque transformer varias veces sobre el estado latente. El checkpoint Loopy no entrena el modelo desde cero, sino que cuantiza los pesos del modelo base fijado en la revision `1ed04250da1a9936042725d302e81c8fa2ab5abd`. La cuantizacion se selecciona mediante una busqueda sobre 400 candidatos, con rotacion Hadamard de tamano de bloque 128 y potencia de escalado 1.2, y activaciones cuantizadas dinamicamente por token a 8 bits.

La innovacion tecnica principal es el protocolo de seleccion y evaluacion: ventanas fijas derivadas del split de entrenamiento de WikiText-103 (revision `b08601e04326c79dfdd32d625aee71d232d685c3` de `Salesforce/wikitext`), con grupos separados de 32 ventanas para calibracion, busqueda y calidad. La evaluacion usa cuantizacion falsa en BF16. No se menciona uso de RLHF, DPO ni datos de entrenamiento adicionales; el checkpoint es una derivada cuantizada, no un fine-tuning con nuevos datos.

## Capacidades

- Generacion de texto en ingles con contexto de hasta 4096 tokens.
- Razonamiento y respuesta a tareas de conocimiento general (MMLU evaluado).
- Razonamiento de sentido comun y comprension lectora (WinoGrande, HellaSwag, ARC-C, LAMBADA evaluados).
- Modelado de lenguaje a nivel de documento con perplejidad de palabra en ventana deslizante (WT2).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del ingles.
- No se documenta vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Investigacion en cuantizacion de modelos recurrentes: el checkpoint sirve como referencia reproducible para comparar estrategias W4A8 en arquitecturas recurrentes, con protocolo congelado y artefactos de busqueda completos.
- Evaluacion de perplejidad en modelado de lenguaje: permite medir WT2 con perplejidad de palabra a nivel de documento en ventanas de 4096 tokens, util para estudiar el impacto de la cuantizacion en contexto largo.
- Reproduccion de experimentos academicos: los scripts `eval_wikitext.py` y `eval_tasks.py` permiten replicar la tabla de resultados guardada y verificar la seleccion del candidato.
- Estudio de rotacion Hadamard y escalado: el pool de 400 candidatos y los registros por etapa permiten analizar el efecto de la semilla de rotacion y la potencia de escalado en la calidad final.
- Despliegue en entornos con memoria restringida (experimental): al reducir los pesos a 4 bits, el checkpoint de 3.3 GB puede caber en GPUs de consumo, aunque requiere el cargador Loopy y no un kernel INT4 empaquetado.
- Analisis de degradacion por cuantizacion: la comparacion entre metricas BF16 y W4A8 en `reference_results/` permite cuantificar la perdida de precision en cada tarea.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| WT2 word PPL | 10.97 |
| LAMBADA PPL | 4.46 |
| LAMBADA acc. | 68.76 |
| WinoGrande | 70.48 |
| ARC-C | 56.14 |
| HellaSwag | 75.94 |
| MMLU | 71.86 |
| Media de precision (5 tareas) | 68.64 |

WT2 usa perplejidad de palabra a nivel de documento con contexto de 4096 tokens en ventana deslizante. Las precisiones estan en porcentaje; ARC-C y HellaSwag usan `acc_norm`, el resto usa `acc`. La media pondera igual las cinco tareas de precision. Los resultados son metricas guardadas del experimento que produjo este checkpoint, con cuantizacion falsa en BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 3.3 GB, lo que sugiere que los pesos cuantizados caben en GPUs con 6-8 GB de VRAM, aunque no se proporciona una cifra oficial de VRAM en inferencia.
- GPU recomendadas: no disponible en la informacion proporcionada. Los comandos de evaluacion usan `CUDA_VISIBLE_DEVICES=0` sin especificar modelo de GPU.
- Cabe en GPU de consumo: probablemente si, dado el tamano del repositorio (3.3 GB), pero no se confirma oficialmente.
- Opciones de despliegue: cargador Loopy personalizado (`code/`), entorno conda `loopy`, scripts `eval_wikitext.py` y `eval_tasks.py`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Loopy-Ouro-2.6B-W4A8-G32 | 2.6B | 4096 | Apache-2.0 | `selected.pt` (W4A8) | Checkpoint cuantizado con cargador propio |
| ByteDance/Ouro-2.6B | 2.6B | no disponible | Apache-2.0 | safetensors (upstream) | Modelo base sin cuantizar |
| Alternativas de 2-3B cuantizadas | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Solo soporta ingles; no se documentan capacidades multilingues.
- Requiere un cargador personalizado (Loopy); no es compatible con `from_pretrained()` generico de Transformers sobre este repositorio.
- No usa almacenamiento INT4 empaquetado ni kernel de inferencia INT4; los codigos W4 se guardan en contenedores INT8, lo que puede limitar las ganancias reales de memoria y velocidad.
- La evaluacion usa cuantizacion falsa en BF16, por lo que el rendimiento en inferencia real con cuantizacion puede diferir.
- Riesgo de alucinacion no cuantificado en la informacion disponible.
- Sesgos conocidos no documentados.
- El checkpoint es una derivada de investigacion con 0 descargas y 0 likes; no hay evidencia de uso en produccion.
- La licencia Apache-2.0 aplica a los pesos, pero el codigo de investigacion tiene avisos adicionales en `code/THIRD_PARTY_NOTICES.md` que deben revisarse antes de uso comercial.
- El modelo base esta fijado a una revision concreta; cambios en el upstream pueden afectar la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/Shameless111/Loopy-Ouro-2.6B-W4A8-G32
- Modelo base: https://huggingface.co/ByteDance/Ouro-2.6B
- Dataset de evaluacion: https://huggingface.co/datasets/Salesforce/wikitext
- Protocolo completo: `code/docs/protocol.md` (dentro del repositorio)
- Avisos de terceros: `code/THIRD_PARTY_NOTICES.md` (dentro del repositorio)
- Manifiesto de archivos: `manifest.json` (dentro del repositorio)
- Procedencia: `provenance.json` (dentro del repositorio)
