# fbaldassarri/allenai_OLMo-2-1124-13B-Instruct-auto_round-int4-gs64-asym

## Resumen

Este repositorio contiene una versión cuantizada a 4 bits del modelo `allenai/OLMo-2-1124-13B-Instruct`, publicada por el usuario fbaldassarri. No se trata de un modelo nuevo, sino de un artefacto de cuantización weights-only (WoQ) generado con Intel AutoRound v0.16.1, con precisión INT4, tamaño de grupo 64 y esquema asimétrico. El objetivo es reducir el peso y la memoria necesarios para ejecutar OLMo 2 13B Instruct en hardware de consumo e infraestructura Intel (CPU, iGPU Arc y NPU de la serie Core Ultra).

OLMo 2 es la familia de modelos abiertos de Allen Institute for AI (AI2), y la variante Instruct de 13B está afinada para conversación y seguimiento de instrucciones. La cuantización permite desplegarlo con una huella de memoria notablemente menor, a cambio de una ligera pérdida de precisión que el autor reconoce explícitamente en la model card.

La relevancia de esta ficha radica en que documenta un caso práctico de cuantización con AutoRound sobre un modelo abierto con licencia Apache 2.0, incluyendo la receta de replicación completa. Conviene señalar una discrepancia importante: la model card describe un modelo de 13B, pero los metadatos de safetensors del repositorio declaran 2.837.427.200 parámetros, un dato que no cuadra con el nombre del modelo base y que el lector debe verificar antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (model_type `olmo2`), derivada de OLMo 2 13B Instruct |
| Parametros totales | 2.837.427.200 según safetensors del repo; la model card y el modelo base indican 13B (discrepancia no resuelta) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT4 weights-only, group size 64, asimetrica (AutoRound / SignRound) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato `auto_round`), cargable con transformers |

## Arquitectura y entrenamiento

El modelo subyacente es OLMo 2 1124 13B Instruct, un transformer decoder-only de AI2. Esta ficha no dispone de detalles sobre la composicion del dataset de preentrenamiento, el numero de tokens, ni las etapas de alineacion (SFT, DPO o RLHF) del modelo original, por lo que no se pueden aportar cifras concretas al respecto.

La innovacion tecnica de este repositorio es la cuantizacion. Se aplico Intel AutoRound v0.16.1 con `bits=4`, `group_size=64`, `sym=False`, calibracion en CPU sobre 64 muestras, 200 iteraciones de ajuste, longitud de secuencia 256 y batch size 2, partiendo de pesos en `torch.bfloat16`. El proceso de cuantizacion registrado duro 22.897 segundos (aproximadamente 381,6 minutos). El autor indica un incremento de velocidad de 2-3x con una ligera caida de precision en W4G64. La receta de replicacion se documenta mediante el pipeline `auto-round-pipeline` y una llamada directa a `AutoRound.quantize_and_save`.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, al ser una variante Instruct con plantilla de chat integrada.
- Razonamiento y respuesta a preguntas en ingles.
- Generacion de codigo y matematicas: capacidad heredada del modelo base, aunque no se documentan resultados especificos en este repositorio.
- Soporte de plantilla de chat (`apply_chat_template`) para conversaciones multi-turno.
- Ejecucion en CPU Intel, iGPU Arc (via intel-extension-for-pytorch) y NPU Intel (via OpenVINO).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Despliegue en equipos sin GPU dedicada: la cuantizacion INT4 permite ejecutar el modelo en CPU Intel con un consumo de memoria reducido, adecuado para prototipos y entornos de desarrollo locales.
- Inferencia en portatiles con Intel Core Ultra: el autor indica compatibilidad con NPU (AI Boost) via OpenVINO e iGPU Arc, lo que habilita asistentes conversacionales en local sin conexion.
- Chatbot de soporte en ingles: el modelo usa plantilla de chat y puede gestionar conversaciones multi-turno, aunque la ventana de contexto no esta documentada en esta ficha.
- Generacion de codigo asistida en entornos de desarrollo con hardware Intel: util para autocompletado y explicacion de fragmentos, con la salvedad de que no se han publicado benchmarks de HumanEval en este repositorio.
- Experimentacion en investigacion sobre cuantizacion: el repositorio incluye la receta completa de replicacion, lo que lo convierte en un caso de estudio para comparar AutoRound frente a otras tecnicas de cuantizacion.
- Evaluacion de la degradacion por cuantizacion: util para medir la caida de calidad de un modelo Instruct de 13B a W4G64 antes de adoptarlo en un pipeline de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona cualitativamente un incremento de velocidad de 2-3x y una ligera caida de precision en W4G64, sin cifras concretas de MMLU, HumanEval, GSM8K ni latencia medida.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio ocupa 11,0 GB, lo que da una orientacion del peso en disco de la version cuantizada.
- El autor indica que la cuantizacion esta pensada para CPU Intel, iGPU Intel Arc (via intel-extension-for-pytorch) y NPU Intel Core Ultra (via OpenVINO).
- No se documenta compatibilidad con GPU NVIDIA o AMD en la model card, aunque el pipeline de replicacion menciona modos opcionales `--cuda` y `--rocm` para el proceso de cuantizacion, no necesariamente para la inferencia de este artefacto.
- Opciones de despliegue: transformers con `device_map="auto"`, intel-extension-for-pytorch y OpenVINO.
- Latencia y throughput: no disponibles; solo se menciona un incremento de 2-3x respecto al modelo sin cuantizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (OLMo 2 13B Instruct INT4) | 13B segun model card; 2,84B segun safetensors | no disponible | INT4 W4G64 asimetrica | Apache 2.0 | Hugging Face |
| allenai/OLMo-2-1124-13B-Instruct | 13B | no disponible en esta ficha | BF16 original | Apache 2.0 | Hugging Face |
| Otras cuantizaciones INT4 de OLMo 2 13B | 13B | no disponible | INT4 (varios metodos) | Apache 2.0 | no verificado en esta busqueda |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Discrepancia critica de parametros: los safetensors declaran 2.837.427.200 parametros frente a los 13B del nombre y la model card. Verificar la integridad del artefacto antes de usarlo.
- El autor reconoce una ligera caida de precision en W4G64 respecto al modelo original en BF16.
- Solo soporta ingles segun los metadatos de idioma.
- La longitud de contexto no esta documentada en esta ficha; no asumir la del modelo base sin consultar su model card.
- El autor declara que el modelo se desarrollo solo para fines de investigacion y sin garantia.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en este repositorio.
- No se documentan sesgos especificos ni evaluaciones de seguridad para esta version cuantizada.
- La licencia Apache 2.0 permite uso comercial, pero el disclaimer del autor restringe la finalidad a investigacion; conviene revisar ambas condiciones.
- El repositorio tiene 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/allenai_OLMo-2-1124-13B-Instruct-auto_round-int4-gs64-asym
- Modelo base: https://huggingface.co/allenai/OLMo-2-1124-13B-Instruct
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Pipeline de replicacion: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
