# saidutta69/LFM2.5-350M-heretic

## Resumen

LFM2.5-350M-heretic es una variante "abliterated" (descensurada o sin censura) del modelo LFM2.5-350M de Liquid AI, publicada por el usuario `saidutta69`. El modelo se ha generado aplicando la herramienta Heretic v1.4.0 sobre la familia LFM2.5-350M, con el objetivo de eliminar los comportamientos de rechazo de la version original sin reentrenar desde cero. Es, por tanto, un derivado de pesos modificados, no un modelo entrenado de nuevo.

El modelo base, LFM2.5-350M, pertenece a la familia LFM2.5 de Liquid AI, disenada especificamente para despliegue en el dispositivo (edge). Se trata de un modelo hibrido de 354.483.968 parametros con 16 capas, que combina 10 bloques de convolucion con doble puerta y 6 bloques de atencion GQA, con una ventana de contexto de 32.768 tokens y un presupuesto de entrenamiento de 28 billones de tokens. La version heretic conserva esa arquitectura y solo altera direcciones de activacion en capas concretas.

Su relevancia es doble: por un lado, ofrece un modelo extremadamente ligero (cabe en menos de 1 GB de memoria, con 313 tok/s de decodificacion en CPU AMD) con soporte de tool calling y nueve idiomas; por otro, sirve como caso de estudio reproducible de tecnicas de abliteration sobre arquitecturas hibridas modernas, con parametros publicados y resultados medibles de divergencia KL y tasa de rechazos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida LFM2.5 (10 bloques de convolucion con doble puerta + 6 bloques GQA) |
| Parametros totales | 354.483.968 (~354M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | no disponible en este repositorio (solo safetensors); la familia original ofrece GGUF, ONNX, MLX 8-bit y OpenVINO int8 |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | safetensors |
| Numero de capas | 16 |
| Tamano de vocabulario | 65.536 |
| Presupuesto de entrenamiento | 28 billones de tokens |
| Fecha de corte de conocimiento | mediados de 2024 |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es LFM2.5, una familia hibrida de Liquid AI pensada para inferencia en el dispositivo. El modelo tiene 16 capas que alternan 10 bloques de convolucion con doble puerta (double-gated convolution) y 6 bloques de atencion con Grouped Query Attention (GQA). Esta combinacion reduce el coste computacional y de memoria frente a un transformer puramente atencional, lo que explica las cifras de decodificacion publicadas (313 tok/s en CPU AMD, 188 tok/s en Snapdragon Gen4) y que el modelo funcione por debajo de 1 GB de memoria. El vocabulario es de 65.536 tokens y el corte de conocimiento se situa a mediados de 2024.

El entrenamiento del modelo original combino un preentrenamiento extendido de 10T a 28T tokens con un proceso de aprendizaje por refuerzo a gran escala en multiples etapas. La version heretic no reentrena: aplica abliteration con Heretic v1.4.0, una tecnica que identifica direcciones de activacion asociadas al rechazo y las atenua. Los parametros publicados en la model card indican modificaciones por capa con `direction_index` por capa, pesos maximos y minimos en `attn.o_proj` (max 1,46 en la posicion 11,87; min 1,41 a distancia 7,69) y en `mlp.down_proj` (max 1,48 en la posicion 15,00; min 0,65 a distancia 6,02). El proceso esta documentado como reproducible en el directorio `reproduce` del repositorio.

## Capacidades

- Generacion de texto conversacional en modo instrucciones, con plantilla de chat tipo ChatML (`<|im_start|>`, `<|im_end|>`).
- Soporte de tool calling / function calling: las definiciones se pasan como objeto JSON en el prompt de sistema y las llamadas se emiten como lista Pythonica entre los tokens especiales `<|tool_call_start|>` y `<|tool_call_end|>`.
- Salidas estructuradas y extraccion de datos, uno de los usos recomendados por el autor del modelo base.
- Cobertura multilingue en nueve idiomas: ingles, arabe, chino, frances, aleman, japones, coreano, espanol y portugues.
- Comportamiento sin rechazos (uncensored/abliterated): la model card reporta 4 rechazos sobre 100 frente a 89 sobre 100 del original.
- Capacidad de fine-tuning mediante LoRA o ajuste completo, segun la documentacion de la familia LFM2.5.
- Parametros de generacion recomendados: `temperature: 0.1`, `top_k: 50`, `repetition_penalty: 1.05`.
- No incluye vision, audio ni modo de razonamiento explicito segun la informacion disponible.

## Casos de uso

- Asistentes conversacionales embebidos en el dispositivo: al ocupar menos de 1 GB y decodificar a 313 tok/s en CPU AMD, el modelo puede ejecutarse localmente en portatiles, mini-PC y telefonos sin depender de la nube.
- Extraccion de datos y salidas estructuradas: el modelo base esta recomendado por Liquid AI para este fin, y el formato JSON de tool calling facilita integrarlo en pipelines que necesiten campos normalizados a partir de texto libre.
- Agentes con function calling en flujos multi-paso: usando el formato de llamada Pythonica entre tokens especiales, se puede encadenar el modelo con ejecutores de herramientas para tareas como consultas a APIs o relleno de formularios.
- Resumen de documentos en el navegador: existe una demo oficial de resumen WebGPU para LFM2.5, lo que permite resumir texto sin enviar datos a un servidor.
- Aplicaciones multilingues de bajo coste: con nueve idiomas soportados, sirve para clasificacion, etiquetado o respuesta en escenarios donde no se justifica un modelo mayor.
- Investigacion en seguridad y alineacion: al ser una abliteration reproducible con parametros publicados y metricas de divergencia KL y rechazos, es util para estudiar el efecto de estas tecnicas sobre modelos hibridos pequenos.
- Prototipado rapido y fine-tuning: sirve como punto de partida para LoRA sobre trazas propias del agente, con el modelo base como referencia de comportamiento.
- Filtrado y preprocesado de texto en lotes: su bajo coste por token permite usarlo como modelo de primera etapa antes de derivar a modelos mayores.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (LiquidAI/LFM2.5-350M) |
|---|---|---|
| Divergencia KL | 0,0989 | 0 (por definicion) |
| Rechazos | 4/100 | 89/100 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base declara ejecucion por debajo de 1 GB de memoria. En bf16 (safetensors de 0,7 GB en repositorio) cabe en cualquier GPU con 1-2 GB libres; en int8 rondaria los 350 MB y en int4 unos 200 MB, aunque estas cuantizaciones no estan publicadas para este repositorio concreto.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, incluidas RTX 3060, RTX 4060, RTX 4090 o superiores; tambien es viable en iGPU y NPUs de gama alta.
- Cabe en GPU consumer: si, con amplio margen, en practicamente cualquier GPU con mas de 1 GB de memoria.
- CPU: 313 tok/s de decodificacion en CPU AMD y 188 tok/s en Snapdragon Gen4, segun Liquid AI.
- Opciones de despliegue: Transformers y vLLM para el formato nativo safetensors; llama.cpp mediante los GGUF de la familia original; MLX en Apple Silicon; ONNX Runtime para despliegue multiplataforma; OpenVINO para hardware Intel (CPU, GPU y NPU). No se confirma disponibilidad de estos formatos cuantizados para el repositorio heretic especifico.
- Latencia y throughput: no se han publicado mas cifras que las indicadas de decodificacion en CPU y Snapdragon.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM2.5-350M-heretic (este) | 354M | 32.768 tokens | lfm1.0 | Abliteration con Heretic v1.4.0; 4/100 rechazos; KL 0,0989 |
| LiquidAI/LFM2.5-350M | 350M | 32.768 tokens | lfm1.0 | Modelo original instruido; 89/100 rechazos; variantes GGUF, ONNX, MLX y OpenVINO |
| LiquidAI/LFM2.5-350M-Base | 350M | 32.768 tokens | lfm1.0 | Checkpoint base para fine-tuning, sin ajuste de instrucciones |
| Otros modelos de ~350M (p. ej. SmolLM2-360M, Qwen2.5-0.5B) | no disponible en la informacion proporcionada | no disponible | no disponible | Comparativa no disponible con los datos facilitados |

## Limitaciones y advertencias

- Es una abliteration, no un modelo reentrenado: la divergencia KL de 0,0989 respecto al original indica que el comportamiento ha cambiado de forma medible y puede haber degradacion en tareas sensibles.
- Mayor riesgo de generar contenido inapropiado, ofensivo o inseguro al haberse eliminado las barreras de rechazo; no es adecuado para despliegues publicos sin moderacion externa.
- El propio autor del modelo base desaconseja su uso para tareas intensivas en conocimiento y para programacion; esto aplica tambien a este derivado.
- Riesgo de alucinacion elevado por el tamano reducido del modelo (354M parametros).
- Cobertura de idiomas limitada a los nueve declarados; no hay garantia de calidad uniforme en todos ellos.
- Fecha de corte de conocimiento a mediados de 2024: no conoce eventos posteriores.
- Licencia lfm1.0 (marcada como "other"): las condiciones exactas de uso comercial no se detallan en la informacion proporcionada y deben verificarse en el archivo LICENSE del repositorio.
- El repositorio no registra descargas ni likes y la fecha de creacion indicada (2026-10-09) es posterior a la informacion disponible, por lo que la trazabilidad y el mantenimiento del artefacto no estan garantizados.
- No se han publicado benchmarks estandar que permitan validar la calidad frente a modelos de tamano similar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/saidutta69/LFM2.5-350M-heretic
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M-Base
- Modelo original instruido: https://huggingface.co/LiquidAI/LFM2.5-350M
- Variante GGUF: https://huggingface.co/LiquidAI/LFM2.5-350M-GGUF
- Variante ONNX: https://huggingface.co/LiquidAI/LFM2.5-350M-ONNX
- Variante MLX: https://huggingface.co/LiquidAI/LFM2.5-350M-MLX-8bit
- Variante OpenVINO: https://huggingface.co/OpenVINO/LFM2.5-350M-int8-ov
- Heretic: https://heretic-project.org
- Blog de Liquid AI sobre LFM2.5-350M: https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind
- Documentacion de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Plantilla de chat: https://docs.liquid.ai/lfm/key-concepts/chat-template
- Playground de LFM: https://playground.liquid.ai/
- LEAP: https://leap.liquid.ai/
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- Demo de resumen WebGPU: https://huggingface.co/spaces/webml-community/lfm2.5-webgpu-summarizer
- Otro modelo heretic del mismo autor (8B-A1B): https://huggingface.co/saidutta69/LFM2.5-8B-A1B-heretic
- Otro modelo heretic del mismo autor (2.6B coding agent): https://huggingface.co/saidutta69/lfm2.5-2.6b-fable5-coding-agent-heretic
- Paper de referencia arXiv:2511.23404 (citado en las etiquetas del repositorio)
