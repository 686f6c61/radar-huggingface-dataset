# Renesas/Gemma-4-E2B-it-GGUF

## Resumen

Gemma-4-E2B-it-GGUF es la distribucion en formato GGUF del modelo Gemma 4 E2B en su variante instruction-tuned, publicada por Renesas para su plataforma embebida R-Car X5H con acelerador NPU NPX6. El modelo base es google/gemma-4-E2B-it, un transformer decoder-only de la familia Gemma 4 con parametros "elasticos" (E2B, aproximadamente 2B de parametros efectivos), aunque el repositorio declara 4.647.450.147 parametros totales en safetensors. Esta release es exclusivamente de texto: entrada y salida textual, con vision, audio y video anunciados como proximas entregas.

La relevancia de esta ficha no esta en el modelo en si, sino en el empaquetado: Renesas proporciona un runner nativo (`gemma4-e2b-runner`) compilado para xOS-v4.34 sobre R-Car X5H, junto con los pesos FP16 en GGUF, tokenizer, plantilla de chat y scripts de configuracion de la NPU. Es, por tanto, un artefacto de despliegue para hardware automotriz e industrial, no un checkpoint de proposito general para servidores GPU.

El repositorio ocupa 12,6 GB e incluye unicamente los artefactos FP16 en el momento de la ultima actualizacion (noviembre de 2026); la cuantizacion W4A16 y el proyector multimodal estan marcados como "coming soon" en la model card, aunque la seccion de inferencia ya documenta una CLI W4A16 con soporte de audio, lo que sugiere que parte del material esta en preparacion o parcialmente publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4, variante E2B con parametros elasticos) |
| Parametros totales | 4.647.450.147 (safetensors); ~2B efectivos segun la model card |
| Parametros activos | no disponible (no se documenta si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (publicado); W4A16 anunciado como "coming soon" |
| Idiomas soportados | no disponible |
| Licencia | Gemma (terminos de uso de Google) |
| Formato de pesos | GGUF (FP16); tokenizer.json, tokenizer_config.json, generation_config.json, chat_template.jinja, processor_config.json |

## Arquitectura y entrenamiento

La model card describe el modelo como un "Gemma 4 decoder-only language model (E2B, elastic parameters)". No se detalla la composicion interna de capas, el mecanismo de atencion ni la naturaleza exacta de los parametros elasticos (si implican poda dinamica, anchos variables por capa o un esquema de mezcla de expertos). Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; el modelo base es la variante instruction-tuned oficial de Google, por lo que esas fases se heredan de google/gemma-4-E2B-it, pero no se documentan en este repositorio.

La innovacion tecnica destacable de este empaquetado es la integracion con la NPU NPX6 del R-Car X5H: el runner incluye firmwares, modulos de kernel y scripts (`setup_npu.sh`) para ejecutar la inferencia sobre la NPU en lugar de la CPU. La CLI documentada expone opciones de prefill por lotes (`--no-batched-prefill`, `--no-padded-prefill`), seleccion de cluster NPU (`--npu-idx 0|1`), impresion de metricas (`--print-stats`) y, en la ruta W4A16, entrada de audio mediante un encoder que opera sobre ventanas fijas de 30 segundos (750 tokens) en FP16 sobre la NPU.

## Capacidades

- Generacion de texto y chat conversacional multi-turno (pipeline text-generation, etiqueta `conversational`).
- Instrucciones: variante `-it`, con plantilla de chat incluida (`chat_template.jinja`).
- Entrada y salida exclusivamente textual en esta release; vision, audio y video no estan disponibles en los artefactos publicados.
- La CLI W4A16 documentada incluye transcripcion de audio (`--audio` con WAV mono de 16 kHz, hasta 30 s) y pesos de audio separados, aunque el artefacto correspondiente figura como "coming soon".
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de voz a bordo en automocion: el runner admite entrada de audio WAV mono de 16 kHz con un encoder de ventana fija de 30 s sobre la NPU, lo que permite transcripcion y respuesta conversacional en el propio vehiculo sin conexion a la nube. Es adecuado porque todo el pipeline (encoder de audio y decodificador de texto) se ejecuta en el R-Car X5H.
- Procesamiento de lenguaje natural en cabina (HMI): generacion de respuestas y resumenes de comandos del conductor sobre texto, con el modelo corriendo en la NPU NPX6 y sin depender de un servidor externo. La naturaleza text-only de esta release encaja con interfaces de linea de comandos o dialogos escritos.
- Automatizacion industrial en el borde: clasificacion y resumen de registros de planta, alertas y ordenes de trabajo en un PLC o gateway basado en X5H, aprovechando que el modelo cabe en la memoria del SoC y no requiere GPU dedicada.
- Transcripcion y post-procesado de notas de voz: la ruta W4A16 documentada permite transcribir segmentos de hasta 30 s con instrucciones de formato (digitos en cifra, sin saltos de linea), util para actas y registros de mantenimiento.
- Prototipado de asistentes embebidos para clientes de Renesas: el instalador `gemma4-e2b-runner-0.1.0-Linux.sh` y la estructura de directorios documentada permiten desplegar un chat funcional en la placa en pocos pasos, lo que sirve como base para demos y evaluaciones de concepto.
- Investigacion en eficiencia de inferencia en NPU: las opciones `--print-stats`, `--no-batched-prefill` y `--npu-idx` permiten medir throughput de prefill y decode y comparar rutas FP16 frente a W4A16, util para caracterizar el rendimiento real del acelerador.
- Chat de texto en dispositivos con requisitos de privacidad: al ejecutarse localmente en la placa, los datos no salen del dispositivo, lo que encaja en entornos con requisitos de confidencialidad (sanitario, industrial, defensa).

## Benchmarks y rendimiento

Los unicos datos publicados son mediciones de throughput en hardware R-Car X5H (1 NPU, 12 nucleos, 1066 MHz, batch size 1, entrada de texto), realizadas hardware-in-the-loop con xOS-v4.34 y NPX Toolkit. No hay resultados de precision (MMLU, HumanEval, GSM8K) publicados: la model card indica "TBD — not yet measured/published for this repo".

| Modelo | Precision | Dispositivo | Throughput decode (tok/s) | Prefill (tok/s) | Tipo |
|---|---|---|---|---|---|
| Gemma-4-E2B-it | FP16 | X5H, 1 NPU, 12 nucleos, 1066 MHz | 11,3 | no disponible | Medido |
| Gemma-4-E2B-it | W4A16 | X5H, 1 NPU, 12 nucleos, 1066 MHz | 22,92 | 1025,66 | Medido |

No se han publicado resultados de benchmarks de calidad en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: placa Renesas R-Car X5H con NPU NPX6 y sistema xOS-v4.34. No es un modelo pensado para GPU de servidor ni para PC de escritorio.
- VRAM estimada para inferencia: no aplica en el hardware objetivo (la NPU usa memoria del SoC). El repositorio completo ocupa 12,6 GB; el GGUF FP16 es el artefacto principal.
- GPU recomendadas: no disponibles; el runner esta compilado para `rcar-x5hv1`. No se documenta soporte para A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no documentada. El formato GGUF permitiria, en teoria, cargar los pesos con llama.cpp en otras plataformas, pero Renesas no publica binarios ni instrucciones para ello y la plantilla de chat y el tokenizer deberian validarse por separado.
- Opciones de despliegue: runner propietario `gemma4-e2b-runner` (v0.1.0 para FP16, v0.2.0 para W4A16), con `setup_npu.sh` para inicializar la NPU. No se mencionan vLLM, TGI, Ollama ni llama.cpp en la documentacion del repositorio.
- Latencia y throughput: 11,3 tok/s en decode FP16 y 22,92 tok/s en decode W4A16; prefill de 1025,66 tok/s en W4A16. El prefill FP16 no se reporta.
- Almacenamiento: instalador, firmwares, modulos de kernel y pesos; la descarga selectiva se hace con `hf download Renesas/Gemma-4-E2B-it-GGUF --repo-type=model --include "fp16/*"`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Renesas/Gemma-4-E2B-it-GGUF | 4.647.450.147 totales (~2B efectivos) | no disponible | GGUF FP16 + runner NPU X5H | Gemma | Empaquetado para hardware Renesas; sin benchmarks de calidad |
| google/gemma-4-E2B-it | no disponible | no disponible | safetensors (modelo base) | Gemma | Checkpoint original de Google; referencia para validar calidad |
| Otros GGUF de la familia Gemma 4 | no disponible | no disponible | GGUF | Gemma | No se dispone de datos en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas de otros fabricantes en la misma categoria (modelos de ~2B efectivos para borde). Los datos de contexto, benchmarks y disponibilidad de terceros no estan publicados en las fuentes consultadas.

## Limitaciones y advertencias

- Release text-only: no admite imagen, audio ni video en los artefactos publicados, pese a que la CLI W4A16 documenta flags de audio. No debe asumirse multimodalidad hasta que se publiquen el proyector y los pesos correspondientes.
- Ausencia total de benchmarks de calidad: no hay MMLU, HumanEval, GSM8K ni evaluaciones de seguridad publicadas; cualquier decision de produccion debe basarse en evaluacion propia.
- Dependencia de hardware propietario: el runner solo esta compilado para R-Car X5H (xOS-v4.34) y NPX6; no hay binarios para GPU ni para CPU generica. El modelo no es portable tal cual a infraestructura cloud convencional.
- Idiomas no declarados: la model card no especifica cobertura linguistica; no se puede garantizar calidad en castellano ni en otros idiomas sin evaluacion.
- Longitud de contexto no documentada: impide planificar casos de uso con documentos largos o conversaciones extensas.
- Licencia Gemma: sujeta a los terminos de uso de Google, con restricciones de uso comercial y clausulas de uso aceptable que deben revisarse antes de integrar en producto. La redistribucion de pesos y derivados esta condicionada por dicha licencia.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; en dominios regulados (automocion, sanitario) requiere validacion y salvaguardas adicionales.
- Sesgos: no se documenta ninguna evaluacion de sesgo ni mitigacion; se heredan los del modelo base de Google.
- Madurez del empaquetado: W4A16 y el proyector multimodal figuran como "coming soon", mientras que la seccion de inferencia ya los describe; conviene verificar la disponibilidad real de cada artefacto antes de disenar una integracion.
- Version del runner y del sistema (xOS-v4.34) acopladas: actualizaciones de firmware pueden romper la compatibilidad de los binarios publicados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Renesas/Gemma-4-E2B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Model card oficial de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Renesas Electronics (sitio corporativo): https://www.renesas.com/
- Renesas Electronics (Wikipedia): https://en.wikipedia.org/wiki/Renesas_Electronics
- Renesas Electronics (Wikipedia en frances): https://fr.wikipedia.org/wiki/Renesas_Electronics
- Renesas en L'Embarque: https://lembarque.com/entreprise/renesas
- Productos de Renesas: https://www.renesas.com/en/products
