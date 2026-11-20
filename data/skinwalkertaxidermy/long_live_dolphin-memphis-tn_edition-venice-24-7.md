# SkinwalkerTaxidermy/Long_Live_Dolphin.Memphis-Tn_Edition.Venice-24-7

## Resumen

Long_Live_Dolphin.Memphis-Tn_Edition.Venice-24-7 es un fine-tune del modelo Mistral-Small-24B-Instruct-2501 publicado por el usuario SkinwalkerTaxidermy en Hugging Face. Por la nomenclatura y la model card referenciada, se corresponde con la familia Dolphin, desarrollada por Cognitive Computations (dphn.ai), y en concreto con la variante Venice Edition, un proyecto colaborativo con Venice.ai cuyo objetivo declarado es producir la version mas descensurada de Mistral 24B para uso dentro del ecosistema Venice. El modelo se presenta como "Venice Uncensored" y esta pensado como modelo de proposito general orientado a aplicaciones donde el operador controla el system prompt y la alineacion.

Arquitectura transformer densa de 24.011.361.280 parametros (aproximadamente 24B), derivada de Mistral Small 24B, con soporte multimodal image-text-to-text segun los tags del repositorio. El contexto declarado en la configuracion de despliegue de vLLM alcanza los 131.072 tokens. Los pesos se distribuyen en formato safetensors con un tamano de repositorio de 48,1 GB, lo que sugiere pesos en precision bf16/fp16.

La relevancia de esta ficha radica en que ejemplifica el patron de los fine-tunes comunitarios sin evaluacion publicada: licencia Apache 2.0, sin benchmarks, sin idiomas declarados y con un enfasis explicito en eliminar restricciones de alineacion. Para un equipo que evalue su adopcion en produccion, esto implica asumir riesgos de contenido y ausencia de metricas verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (derivada de Mistral Small 24B); pipeline image-text-to-text |
| Parametros totales | 24.011.361.280 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (segun configuracion de vLLM de la model card) |
| Tipos de cuantizacion | no disponible (no se documentan en la model card; el repo contiene safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Mistral-Small-24B-Instruct-2501, un transformer denso de aproximadamente 24B parametros. La model card indica que el entrenamiento se realizo sobre 8 GPU NVIDIA B200 proporcionadas por Targon, pero no especifica el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o preference tuning. Tampoco se documenta la estrategia de ajuste (full fine-tune, LoRA u otras) ni hiperparametros.

La innovacion declarada no es arquitectonica sino de alineacion: el modelo se entrena para minimizar el rechazo de instrucciones y trasladar el control del comportamiento al system prompt del operador. Se mantiene la plantilla de chat original de Mistral (formato `[INST]...[/INST]` con bloque `[SYSTEM_PROMPT]`) y se recomienda una temperatura baja de 0,15. No se mencionan mecanismos como decodificacion especulativa, atencion lineal o modos de razonamiento explicito.

## Capacidades

- Generacion de texto conversacional multi-turno con plantilla de chat de Mistral.
- Procesamiento de imagenes junto a texto (pipeline image-text-to-text), con soporte de hasta 10 imagenes por prompt segun la configuracion de vLLM.
- Tool calling y function calling mediante `--tool-call-parser mistral` y `--enable-auto-tool-choice` en vLLM.
- Control de comportamiento mediante system prompt: el autor indica que se puede definir personaje, tono y reglas de conducta.
- Respuesta a instrucciones sin filtros de rechazo por defecto cuando se configura el system prompt "uncensored" sugerido.
- Capacidades multilingues: no documentadas explicitamente; la model card incluye un ejemplo en frances, pero no se declara cobertura de idiomas.
- No se documenta modo thinking, audio ni otras modalidades mas alla de imagen y texto.

## Casos de uso

- Despliegue self-hosted con control total del system prompt: equipos que necesitan fijar la politica de comportamiento sin depender de cambios silenciosos del proveedor, sirviendo el modelo con vLLM y gestionando ellos mismos la plantilla y las reglas.
- Procesamiento de documentos con imagenes: al aceptar entradas image-text-to-text, puede emplearse para extraer y resumir informacion de capturas, formularios o diagramas junto a texto de contexto largo (hasta 131.072 tokens).
- Pipelines de agentes con tool calling: integrable en vLLM con parser de herramientas de Mistral para orquestar llamadas a APIs externas en flujos multi-paso.
- Generacion de contenido creativo sin restricciones editoriales: util en entornos internos de escritura, guiones o ficcion donde el operador asume la responsabilidad del contenido generado.
- Laboratorio de investigacion sobre alineacion y steerability: permite estudiar como responde un modelo de 24B a distintos system prompts y comparar comportamiento con y sin directrices de seguridad.
- Asistente conversacional en dominio cerrado: con contexto largo y temperatura baja, adecuado para dialogos tecnicos multi-turno donde se inyecta documentacion extensa en el prompt.
- Evaluacion comparativa de fine-tunes comunitarios: util como referencia para medir el impacto de un ajuste sin benchmarks publicados frente al modelo base Mistral-Small-24B-Instruct-2501.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la model card indica que ejecutar el modelo en GPU requiere mas de 60 GB de RAM de GPU en la configuracion mostrada (bf16). En cuantizacion de 8 bits cabria en torno a 24-28 GB y en 4 bits en torno a 13-15 GB, aunque el autor no documenta cuantizaciones oficiales.
- GPU recomendadas: el entrenamiento se realizo en 8x NVIDIA B200; para inferencia en bf16 se requieren configuraciones multi-GPU (por ejemplo, 2x A100 80GB o 2x H100 80GB) o una unica GPU de 80 GB con margen ajustado.
- GPU de consumo: no cabe en bf16 en tarjetas de 24 GB (RTX 4090, RTX 3090); requeriria cuantizacion agresiva no documentada por el autor.
- Opciones de despliegue: vLLM (recomendado por el autor, con `--max-model-len 131072` y `--limit-mm-per-prompt '{"image": 10}'`), TGI, SGLang, transformers, Ollama y LM Studio (mencionados en la model card).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados | Notas |
|---|---|---|---|---|---|
| Long_Live_Dolphin.Memphis-Tn_Edition.Venice-24-7 | 24B (denso) | 131.072 | Apache 2.0 | no disponible | Fine-tune descensurado de Mistral Small 24B |
| mistralai/Mistral-Small-24B-Instruct-2501 | 24B (denso) | 32.768 (segun ficha del modelo base; no verificado en esta informacion) | Apache 2.0 | si, publicados por Mistral | Modelo base con alineacion estandar |
| dphn/Dolphin-Mistral-24B-Venice-Edition | 24B (denso) | 131.072 (segun configuracion vLLM de la model card) | Apache 2.0 | no disponible | Modelo de referencia del que deriva esta publicacion |
| Modelos Dolphin de menor tamano (familia dphn) | variable | no disponible | Apache 2.0 | no disponible | Alternativas de menor huella de VRAM |

La comparativa con el modelo base es la mas informativa: comparten arquitectura y numero de parametros, pero difieren en alineacion y en el contexto declarado en la configuracion de despliegue. No se dispone de datos que permitan comparar rendimiento real entre ambos.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni evaluaciones de seguridad publicadas, lo que impide estimar su calidad frente al modelo base.
- Modelo explicitamente descensurado: el system prompt sugerido por el autor instruye al modelo a ignorar consideraciones eticas, legales y de seguridad. Esto lo hace inadecuado para aplicaciones de cara al publico sin capas adicionales de moderacion.
- Riesgo elevado de contenido danino: sin filtros, el modelo puede generar instrucciones peligrosas, contenido ilegal o material sensible. El operador asume toda la responsabilidad legal.
- Riesgo de alucinacion: no cuantificado; al ser un fine-tune sin evaluacion, no hay garantia de fidelidad factual.
- Idiomas no declarados: se desconoce la cobertura linguistica real; el ejemplo en frances no constituye evidencia de calidad multilingue.
- Cuantizaciones no documentadas: el autor no publica versiones GGUF ni cuantizadas, lo que limita el despliegue en hardware de consumo.
- Procedencia y mantenimiento: el repositorio tiene 26 descargas, 0 likes y un unico commit en la fecha de creacion (2026-11-19), sin actualizaciones posteriores. El nombre del publicador (SkinwalkerTaxidermy) no coincide con la organizacion oficial dphn, por lo que conviene verificar la integridad de los pesos antes de usarlos.
- Licencia Apache 2.0 permite uso comercial, pero no exime del cumplimiento de normativa aplicable (por ejemplo, AI Act en la UE) ni de las politicas de las plataformas de despliegue.
- Contexto de 131.072 tokens declarado solo en la configuracion de vLLM; no se verifica en la model card del modelo base ni en metadatos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SkinwalkerTaxidermy/Long_Live_Dolphin.Memphis-Tn_Edition.Venice-24-7
- Modelo base: https://huggingface.co/mistralai/Mistral-Small-24B-Instruct-2501
- Modelo de referencia Dolphin Venice Edition: https://huggingface.co/dphn/Dolphin-Mistral-24B-Venice-Edition
- Web oficial de Dolphin: https://dphn.ai
- Twitter de Dolphin: https://x.com/dphnAI
- Chat web de Dolphin: https://chat.dphn.ai
- Bot de Telegram: https://t.me/DolphinAI_bot
- Venice.ai: https://venice.ai/
- Targon (proveedor de computo del entrenamiento): https://targon.com/
- vLLM: https://github.com/vllm-project/vllm
