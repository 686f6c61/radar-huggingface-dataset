# rishanthrajendhran/ideadet-nemotron30b-1m-document

## Resumen

ProseLens es un detector de procedencia textual (prose provenance) construido como un ajuste fino por LoRA del modelo `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` de NVIDIA. Lo desarrolla rishanthrajendhran y forma parte del trabajo que acompaña a IdeaLens, su contraparte a nivel de ideas: ambos comparten backbone, documentos de entrenamiento y etiquetas, pero ProseLens lee el texto crudo del documento en lugar de un esquema (outline), de modo que aprende a atribuir la autoría a nivel de palabra. El modelo devuelve P(human), la probabilidad de que el documento lo haya escrito una persona.

El problema que resuelve es concreto: distinguir si un documento ha sido escrito por un humano o generado por IA, y hacerlo rastreando las palabras en lugar de las ideas. Según el paper, esto marca una diferencia notable: ProseLens acierta el 99,1% cuando ideas y palabras provienen de la misma fuente, pero cuando provienen de fuentes distintas sigue las palabras y baja al 25,4% en procedencia de ideas; IdeaLens alcanza el 95,3% y el 81,3% respectivamente, y Pangram 4 el 98,5% y el 25,9%.

Arquitectura y tamaño son los del modelo base: un transformer híbrido de tipo `nemotron_h` con 32.913.266.240 parámetros totales (activos no disponibles en la información proporcionada) y capacidad de contexto largo, dado el identificador "1m" del checkpoint. El modelo se publica con licencia OpenMDW-1.1, en formato safetensors, con un repositorio de 68,9 GB y 221 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron H (`nemotron_h`), transformer híbrido; ajuste fino LoRA (rank 64) sobre el modelo base |
| Parametros totales | 32.913.266.240 (32,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (el identificador del checkpoint indica 1M) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | OpenMDW-1.1 (`openmdw-1.1`, etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (modelo fusionado) y adaptador LoRA en `adapter/`; compatible con transformers y vLLM |

## Arquitectura y entrenamiento

ProseLens parte del modelo `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, un transformer híbrido de la familia Nemotron H con 32,9 B de parámetros totales. Sobre ese backbone se aplica un ajuste fino LoRA de rango 64 entrenado con 1 millón de documentos web en inglés del dataset WildOutlines. El adaptador se publica tal como se entrenó, en el formato del servicio de entrenamiento Tinker, y el repositorio incluye `load_adapter.py` para fusionarlo en memoria con el modelo base; el resultado es bit a bit idéntico al modelo fusionado publicado.

La innovación técnica principal no está en la arquitectura sino en la formulación de la tarea: el modelo no genera texto, sino que compara las probabilidades del siguiente token para `human` y `ai` tras un prompt de sistema fijo, y devuelve la probabilidad normalizada de `human`. El prompt debe construirse exactamente como se indica en la model card (con el sufijo `<|im_end|>\n<|im_start|>assistant\n\n\n` y los ids de token 50755 y 2464), no mediante la plantilla de chat. Un detalle relevante para quien integre el adaptador: en transformers, Nemotron fusiona la puerta Mamba y las proyecciones x en un único `in_proj` y almacena los 128 expertos enrutados de cada capa como un tensor 3D, por lo que `peft.PeftModel` no puede adjuntar la mayor parte del adaptador y lo omite sin avisar, dejando el modelo puntuando casi como el base. Para inferencia masiva, vLLM 0.21 es aproximadamente 15 veces más rápido que la implementación directa en transformers y admite entradas mucho más largas en una sola GPU de 80 GB.

## Capacidades

- Detección de autoría a nivel de palabra: devuelve P(human) para un documento de texto plano.
- Procedencia de prosa (prose provenance): rastrea las palabras del documento frente a la procedencia de las ideas, con 99,1% de acierto cuando ambas coinciden y 25,4% cuando divergen.
- Clasificación binaria human/IA mediante comparación de logits de dos tokens, sin generación libre.
- Procesamiento de documentos completos sin necesidad de extraer un esquema ni de llamar a otro LLM.
- Integración con la librería `idealens` (PyPI), con backend vLLM o Tinker, y puntuación por lotes desde JSONL.
- Ejecución sin GPU mediante el backend Tinker alojado, con coste estimado inferior a 1 dólar por cada 1.000 documentos web típicos.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Moderación de contenido generado por IA en plataformas editoriales: puntuar cada envío con P(human) y derivar a revisión manual los documentos con probabilidad baja, usando el modelo fusionado en vLLM para procesar lotes grandes.
- Verificación de autoría en publicaciones académicas o periodísticas: comprobar si un texto entregado como original humano presenta señales de generación automática, con la salvedad de que el modelo rastrea palabras y no ideas.
- Auditoría de corpus de entrenamiento: filtrar documentos web sospechosos de ser sintéticos antes de incorporarlos a un pipeline de datos, aprovechando el entrenamiento sobre WildOutlines.
- Detección de plagio encubierto por parafraseo con IA: comparar la puntuación de prosa de un documento con la de su esquema de ideas para detectar casos en que las ideas son humanas pero la redacción no.
- Integración en CMS y herramientas de edición: exponer P(human) como indicador en el flujo de publicación mediante la librería `idealens` y su backend vLLM.
- Evaluación comparativa de detectores: usar ProseLens junto con IdeaLens sobre los mismos documentos para separar la procedencia de ideas de la de palabras en estudios de procedencia.
- Despliegue sin infraestructura propia: puntuar documentos desde un portátil con el backend Tinker, útil para prototipos y validaciones puntuales antes de montar GPU.

## Benchmarks y rendimiento

Resultados publicados en el paper que acompaña al modelo, sobre procedencia de documentos:

| Modelo | Acierto con ideas y palabras de la misma fuente | Acierto en procedencia de ideas con fuentes distintas |
|---|---|---|
| ProseLens | 99,1% | 25,4% |
| IdeaLens | 95,3% | 81,3% |
| Pangram 4 | 98,5% | 25,9% |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- Pesos fusionados en BF16: 59 GiB de memoria de GPU, más el espacio adicional que añada cada entrada; la descarga del repositorio es de 68,9 GB.
- Alternativa ligera: descarga de 3 GB del adaptador LoRA y fusión en memoria sobre el modelo base ya disponible.
- GPU recomendadas: una GPU de 80 GB (A100 80 GB o H100) para el modelo fusionado en BF16; vLLM permite además entradas mucho más largas en una sola GPU de 80 GB.
- GPU de consumo: no cabe en tarjetas de 24 GB en BF16; no se documentan cuantizaciones en la información disponible.
- Despliegue: transformers (código de referencia de la model card), vLLM 0.21 con `xgrammar==0.2.1` para lotes grandes, y backend Tinker alojado para ejecución sin GPU.
- Rendimiento: vLLM es aproximadamente 15 veces más rápido que la implementación directa en transformers; no se publican cifras absolutas de latencia o throughput.
- Coste en Tinker: inferior a 1 dólar por cada 1.000 documentos web típicos a precio de lista; `--dry-run` permite estimar el gasto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ProseLens | 32,9 B (base Nemotron 3.5 Lightning 30B-A3B) | no disponible (checkpoint 1M) | Detección de autoría a nivel de palabra | OpenMDW-1.1 | Hugging Face, Tinker, PyPI (`idealens`) |
| IdeaLens | mismo backbone que ProseLens | no disponible | Detección de procedencia a nivel de ideas (lee esquemas) | no disponible en la información | Hugging Face (`rishanthrajendhran/IdeaLens`) |
| Pangram 4 | no disponible | no disponible | Detector comercial de texto IA | no disponible | Servicio propietario |
| Modelo base (Nemotron 3.5 Lightning 30B-A3B) | 32,9 B | no disponible | Modelo generativo de propósito general | no disponible en la información | Hugging Face (NVIDIA) |

## Limitaciones y advertencias

- Solo admite inglés según la model card; el rendimiento en otros idiomas no está documentado.
- El prompt debe construirse exactamente como se especifica, sin usar la plantilla de chat; una variación en el sufijo o en los ids de token altera la puntuación.
- Riesgo de falsos negativos en procedencia de ideas: cuando ideas y palabras tienen fuentes distintas, el modelo sigue las palabras y acierta solo el 25,4% en procedencia de ideas.
- Cargar `adapter/` con `peft.PeftModel` falla silenciosamente por la estructura de Nemotron H; hay que usar `load_adapter.py` o `tinker-cookbook`.
- La versión de vLLM está acotada (0.21 con `xgrammar==0.2.1`; versiones posteriores exigen transformers < 5) y requiere desactivar el sampler de FlashInfer con `VLLM_USE_FLASHINFER_SAMPLER=0`.
- El SDK de Tinker retira versiones antiguas; `idealens[tinker]` necesita 0.33.1 o posterior.
- Licencia OpenMDW-1.1: conviene revisar sus términos antes de un uso comercial, ya que la model card no detalla restricciones adicionales.
- No se documentan sesgos conocidos ni tasas de alucinación en la información disponible; al ser un clasificador de dos tokens, el riesgo es de calibración y de deriva ante dominios distintos de los documentos web de entrenamiento.
- El modelo tiene 221 descargas y 2 likes, por lo que la validación comunitaria es todavía escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rishanthrajendhran/ideadet-nemotron30b-1m-document
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- IdeaLens (contraparte a nivel de ideas): https://huggingface.co/rishanthrajendhran/IdeaLens
- Dataset WildOutlines: https://huggingface.co/datasets/rishanthrajendhran/WildOutlines
- Demo en navegador: http://ideadetector.ai/
- Repositorio GitHub: https://github.com/Rishanthrajendhran/IdeaLens
- Paquete PyPI: https://pypi.org/project/idealens/
- Tinker (Thinking Machines): https://thinkingmachines.ai/tinker/
- Registro en Tinker: https://auth.thinkingmachines.ai/sign-up
- Paper: arXiv 2610.06778 (referenciado en los tags del modelo)
