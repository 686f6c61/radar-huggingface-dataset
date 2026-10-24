# keptn/nemotron-3.5-bolt-e4b-bf16

## Resumen

`keptn/nemotron-3.5-bolt-e4b-bf16` no es un modelo entrenado desde cero, sino un reempaquetado de los pesos de `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`. El autor (keptn) ha consolidado el checkpoint bf16 de NVIDIA, su torre de visión y el cabezal de decodificación especulativa DFlash en un único fichero de 16,44 GiB en formato `.rad`, consumible por el motor de inferencia radiance sobre GPUs AMD RDNA4 con ROCm.

El interés práctico está en que permite ejecutar un modelo multimodal de la familia Nemotron 3.5 Bolt (nomenclatura E4B, con torre de visión y modo de razonamiento activable por petición) en una sola tarjeta AMD de 32 GB, con 65.536 tokens de contexto y capacidad de mantener 8 secuencias a longitud completa. El autor reporta una divergencia KL de 0,0015 frente al original en wikitext-2 y 154,9 tok/s combinados en un solo stream.

La relevancia es doble: por un lado, abre el modelo a hardware AMD fuera del ecosistema CUDA; por otro, demuestra una ruta de cuantización/packaging conservadora (bf16 en pesos y activaciones, FP8 solo en el drafter y opcionalmente en la caché KV) con métricas de fidelidad publicadas. La licencia es openmdw-1.1, etiquetada como "other" en HuggingFace, y el repositorio no declara idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pipeline `image-text-to-text`) con torre de visión y decodificación especulativa DFlash; el motor radiance la registra con la forma "Gemma 4 E2B/E4B". Detalle de capas y atención no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (la nomenclatura E4B sugiere ~4B efectivos; no confirmado en la información) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | Pesos bf16 sin cuantizar; activaciones bf16; `lm_head` bf16 (atado a la tabla de tokens); caché KV en bf16 o fp8; drafter DFlash en FP8 con una escala bf16 por bloque de 128×128 |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (campo `license: other` en HuggingFace) |
| Formato de pesos | `.rad` (radiance), fichero único `nemotron-3.5-bolt-e4b-bf16.rad` de 16,44 GiB; tamaño del repo 17,7 GB |
| Version del paquete | 1.0 (2026-10-24) |
| Motor requerido | radiance 1.11.0 + PR #210 (build desde fuente) |
| Modelos base | `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`, `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash` |

## Arquitectura y entrenamiento

El paquete conserva los pesos tal y como los distribuye NVIDIA en bf16, con las activaciones y el `lm_head` también en bf16 (este último atado a la tabla de tokens). Incorpora la torre de visión original en bf16, residente en memoria de host fijada (pinned), y el drafter DFlash de NVIDIA con 5 capas en FP8, una escala bf16 por bloque de 128×128 y 7 tokens de borrador por paso. El drafter se entrenó con bloques de 8, de ahí que se ejecute a 7. El muestreo recomendado es el de NVIDIA: temperatura 1,0, top_p 0,95 y top_k 64, idéntico en ambos modos de razonamiento.

No hay información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; este repositorio no reentrena ni afina nada, solo reempaqueta. La innovación técnica reseñable es la integración de decodificación especulativa con un drafter cuantizado a FP8 y verificación contra pesos bf16, más la posibilidad de alternar la caché KV a fp8 para duplicar la capacidad de secuencias a costa de fidelidad (KL 0,0137 frente a 0,0015). El modo de razonamiento (`enable_thinking`) se controla por petición mediante `chat_template_kwargs`, y está desactivado por defecto como en la plantilla de NVIDIA.

## Capacidades

- Generación de texto en modo directo y en modo razonamiento (thinking), conmutables por petición.
- Razonamiento matemático de varios pasos: 82,3 % en GSM8K 5-shot sin thinking y 89,6 % con thinking.
- Generación y razonamiento sobre código: LiveCodeBench v6 con 46,3 % (off) y 55,4 % (on) de pass@1 sobre 175 tareas.
- Seguimiento estricto de instrucciones: 87,1 % (off) y 91,5 % (on) en IFEval strict.
- Comprensión de imágenes en peticiones de chat mediante `image_url`, usando la torre de visión bf16 del checkpoint: 79,8 ANLS en DocVQA lite y 74,6 % en AI2D lite.
- Contexto largo de 65.536 tokens, con 8 secuencias simultáneas a longitud completa en una sola tarjeta.
- Decodificación especulativa con DFlash, con mayor ganancia en código y JSON (4,1 a 4,7 tokens por paso) que en prosa (2,0).
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible en la información (solo se documenta el modo thinking).
- Capacidades multilingües: no disponible.

## Casos de uso

- Generación de código en producción: con 167,4 tok/s en código y 4,1–4,7 tokens por paso del drafter, es adecuado para autocompletado y generación de parches dentro de pipelines de CI/CD, aceptando un techo de 46–55 % de pass@1 en LiveCodeBench v6 (más bajo en tareas difíciles: 15/80 sin thinking, 22/80 con thinking).
- Extracción y serialización a JSON: con 241,6 tok/s en JSON es el régimen más rápido medido, lo que lo hace idóneo para convertir texto libre o documentos en estructuras tipadas dentro de un ETL.
- Atención al cliente multi-turno: 65.536 tokens de contexto y 8 secuencias concurrentes en una tarjeta permiten mantener historiales largos de varias conversaciones a la vez sin truncar.
- Document QA y digitalización: la torre de visión (79,8 ANLS en DocVQA lite) permite responder preguntas sobre facturas, formularios o escaneos directamente desde la API de chat.
- Resumen de documentos largos: 137,5 tok/s en summarization y prefill de 6.665 tok/s a 24k tokens y 5.581 tok/s a 47k hacen viable resumir actas o informes de decenas de miles de tokens en una sola pasada.
- Razonamiento matemático por lotes: con thinking desactivado y salidas cortas (el benchmark corta a 256 tokens) se obtiene 82,3 %; activando thinking y hasta 8.192 tokens de salida se sube a 89,6 %, útil para validación de cálculos en backoffice.
- Despliegue on-premise sobre AMD: al requerir solo una tarjeta RDNA4 de 32 GB y ROCm, encaja en infraestructura AMD ya existente sin depender de CUDA.
- Educación técnica sobre diagramas e imágenes: AI2D lite al 74,6 % permite responder preguntas sobre esquemas científicos en herramientas de estudio.

## Benchmarks y rendimiento

Calidad frente al checkpoint original (divergencia KL en wikitext-2 test, 100 fragmentos de 512 tokens, 25.500 tokens puntuados, referencia en HF transformers con matemática fp32, perplejidad de referencia 117,18):

| Configuracion | KL media | KL mediana | Percentil 99 | Mismo token top | Perplejidad |
|---|---|---|---|---|---|
| Este fichero, KV bf16 | 0,0015 | 0,00023 | 0,014 | 98,8 % | 117,56 |
| Este fichero, KV fp8 | 0,0137 | 0,0021 | 0,18 | 96,3 % | 117,19 |

Referencia de escala: HF transformers con matemática bf16 presenta KL 0,0012 frente a la misma referencia.

Benchmarks de tarea (greedy; comparar con otras tarjetas usando la columna sin thinking):

| Benchmark | Thinking off | Thinking on |
|---|---|---|
| GSM8K (matemáticas, 5-shot) | 82,3 % | 89,6 % |
| IFEval (instrucciones, strict) | 87,1 % | 91,5 % |
| LiveCodeBench v6 (175 tareas, pass@1) | 46,3 % | 55,4 % |
| LiveCodeBench v6, fácil | 40/43 | 43/43 |
| LiveCodeBench v6, medio | 26/52 | 32/52 |
| LiveCodeBench v6, difícil | 15/80 | 22/80 |

Benchmarks de visión (lmms-eval 0.7.3, LMMs-Eval-Lite, greedy, thinking off):

| Benchmark | Resultado |
|---|---|
| DocVQA val lite (500 preguntas) | 79,8 (ANLS) |
| AI2D lite (500 preguntas) | 74,6 % |

Rendimiento en decodificación (BetterBench 0.6.1, 8 categorías, 20 ejecuciones tras 3 de calentamiento, temperatura 0,7, un stream, Radeon AI PRO R9700 a 215 W):

| Metrica | 1 tarjeta |
|---|---|
| Combinado | 154,9 tok/s |
| Prosa | 77,3 tok/s |
| Código | 167,4 tok/s |
| JSON | 241,6 tok/s |
| Resumen | 137,5 tok/s |
| Prefill a 24k tokens | 6.665 tok/s |
| Prefill a 47k tokens | 5.581 tok/s |
| 4 streams (total) | 262 tok/s |
| 8 streams (total) | 303 tok/s |

## Requisitos de hardware

- VRAM: una GPU AMD RDNA4 con 32 GB. Configuración probada: Radeon AI PRO R9700 a 215 W.
- Memoria de host: 7 GiB libres como mínimo; la torre de visión bf16 se coloca en memoria fijada (`--vision-tower-placement ram`).
- Fichero de pesos: 16,44 GiB en formato `.rad` (repo de 17,7 GB).
- Caché KV a 65.536 tokens, bf16: 2 secuencias = 131.072 tokens, 4 secuencias = 262.160, 8 secuencias = 524.304. Con conmutador `--kv-cache-dtype fp8` se reduce a la mitad, a costa de KL 0,0137 (la tabla de memoria fp8 aparece truncada en la información disponible).
- GPU de consumo: no documentado. El requisito de 32 GB de VRAM en RDNA4 deja fuera las tarjetas consumer habituales de 16–24 GB; no se confirma compatibilidad con ninguna.
- Software: ROCm, Docker, radiance 1.11.0 con el PR #210 aplicado (compilación desde la rama `gemma4-e4b` del fork de keptn42). Flags relevantes: `--max-model-len 65536 --max-num-seqs 8 --num-speculative-tokens 7 --mm-max-patches 2520`.
- Throughput medido: 154,9 tok/s combinado con un stream, 262 tok/s con 4 y 303 tok/s con 8; prefill de 6.665 tok/s a 24k y 5.581 tok/s a 47k.
- Otras opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas para este fichero, que es específico del motor radiance.
- Reducciones disponibles: `--num-speculative-tokens 0` desactiva el drafter; `--mm-max-patches 0` desactiva la visión.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / motor | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| Este fichero (keptn, bf16, `.rad`) | no disponible (E4B) | 65.536 | `.rad` / radiance sobre AMD RDNA4 | openmdw-1.1 | GSM8K 82,3/89,6; IFEval 87,1/91,5; LCB v6 46,3/55,4; 154,9 tok/s |
| `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16` (original) | no disponible (E4B) | no disponible en la información | safetensors bf16 / HF transformers | openmdw-1.1 | Solo dato de referencia: KL 0,0012 y perplejidad 117,18 |
| `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash` | no disponible | no disponible en la información | no disponible | openmdw-1.1 | no disponible |
| Otros modelos multimodales de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

El único comparable con cifras utilizables en la información es el checkpoint original de NVIDIA, del que este fichero se desvía con KL 0,0015 (98,8 % de coincidencia en el token top) y una perplejidad de 117,56 frente a 117,18. No se han publicado en la información datos de modelos de otras familias que permitan una comparación homogénea.

## Limitaciones y advertencias

- No es un modelo nuevo ni afinado: es un reempaquetado de pesos de NVIDIA; cualquier limitación del checkpoint original se hereda intacta.
- Licencia `openmdw-1.1`, etiquetada como `other` en HuggingFace: hay que revisar el fichero LICENSE del repositorio antes de cualquier uso comercial; la información disponible no detalla condiciones de redistribución.
- Idiomas soportados no declarados: no hay garantía documentada de calidad fuera del inglés, idioma en el que están escritos la model card y los benchmarks.
- Dependencia de un PR no fusionado (#210) y de compilar radiance desde una rama: riesgo operativo alto para producción; no hay release estable que lo incluya.
- Requisito de 32 GB de VRAM en AMD RDNA4: no se documenta funcionamiento en GPUs de consumo ni en hardware NVIDIA.
- La caché KV en fp8 duplica la capacidad pero degrada la fidelidad (KL 0,0137 frente a 0,0015; coincidencia del token top 96,3 % frente a 98,8 %).
- El drafter se ejecuta a 7 tokens pese a haberse entrenado con bloques de 8; desviarse de esa configuración no está validado.
- Sesgos conocidos: no disponible. Riesgo de alucinación: no cuantificado en la información; los benchmarks publicados son de precisión, no de veracidad.
- Razonamiento en código difícil limitado: 15/80 sin thinking y 22/80 con thinking en LiveCodeBench v6 hard.
- Varias respuestas de los benchmarks se truncan por límite de tokens y se contabilizan como erróneas (137 en GSM8K, 5 en IFEval y 5 en LiveCodeBench con thinking off; 1 en IFEval con thinking on), lo que introduce un sesgo a la baja en las cifras.
- Evaluación de visión reducida a dos benchmarks "lite" de 500 preguntas cada uno.
- Repositorio de terceros con 0 descargas y 0 likes en el momento del análisis: no es una publicación oficial de NVIDIA y no ha pasado una revisión independiente.
- Tool calling, agentes y razonamiento multi-paso orquestado no están documentados; no deben asumirse en diseño de producto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/keptn/nemotron-3.5-bolt-e4b-bf16
- Modelo base bf16 de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Variante con drafter DFlash: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- PR #210 de radiance (forma Gemma 4 E2B/E4B): https://codeberg.org/StillDeadcode/radiance/pulls/210
- Rama de compilación del fork del autor: https://codeberg.org/keptn42/radiance (rama `gemma4-e4b`)
- Licencia del repositorio: https://huggingface.co/keptn/nemotron-3.5-bolt-e4b-bf16/blob/main/LICENSE
