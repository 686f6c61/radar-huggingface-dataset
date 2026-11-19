# mlx-community/Qwen3.8-27B-pi-adapted-OptiQ-4bit

## Resumen

`mlx-community/Qwen3.8-27B-pi-adapted-OptiQ-4bit` es una cuantizacion mixta de precision realizada con la herramienta mlx-optiq sobre el modelo `harness-hub/Qwen3.8-27B-pi-adapted`. Este ultimo es un adaptador LoRA de rango 32, entrenado con GRPO, que ajusta el modelo base `Qwen/Qwen3.8-27B` para operar como motor del agente de programacion pi en tareas de ingenieria de software y terminal. El adaptador esta fusionado en los pesos, por lo que el repositorio constituye un modelo autonomo listo para inferencia.

El modelo conserva la torre de vision en bf16 (`optiq_vision.safetensors`) para entrada de imagenes y la cabeza de especulacion MTP (multi-token prediction) en `optiq/mtp.safetensors`, lo que permite acelerar la decodificacion. La cuantizacion aplica una asignacion por capa de 4 y 8 bits (237 componentes a 4 bits, 261 a 8 bits, group size 64), reutilizando la receta de sensibilidad del cuantizador `Qwen3.8-27B-OptiQ-4bit` original, ya que el adaptador modifica pesos pero no la arquitectura.

Con 26.895.993.856 parametros y un peso en disco de aproximadamente 19 GB, el modelo esta disenado especificamente para Apple Silicon mediante la libreria MLX. Es relevante para desarrolladores que quieran ejecutar localmente un modelo agentico de ~27B con capacidades de vision, tool calling y decodificacion especulativa sin depender de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (qwen3_5) con cabeza MTP de prediccion multi-token y torre de vision |
| Parametros totales | 26.895.993.856 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta 4/8 bits por capa (OptiQ), group size 64; torre de vision en bf16 |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con sidecars `optiq/mtp.safetensors`, `optiq_vision.safetensors` y `kv_config.json` |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.8-27B`, un transformer de la familia Qwen3.8 con torre de vision y cabeza MTP. Sobre el se aplico un adaptador LoRA de rango 32 entrenado con GRPO (Group Relative Policy Optimization) para especializarlo en tareas de agente de programacion dentro del arnes pi. El adaptador se fusiono en los pesos bf16 antes de cuantizar, por lo que la arquitectura final es identica a la del modelo base.

La cuantizacion OptiQ es mixta y por capa: 237 componentes a 4 bits y 261 a 8 bits, con group size 64. La asignacion de bits se hereda de la receta del cuantizador `Qwen3.8-27B-OptiQ-4bit` porque el adaptador no altera la arquitectura y el ranking de sensibilidad por capa se mantiene. Se preserva la cabeza MTP para decodificacion especulativa y la torre de vision en bf16. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni detalles del proceso de RLHF/DPO del modelo base.

## Capacidades

- Generacion de texto y razonamiento general, con modo thinking configurable (recomendado desactivado para el uso agentico).
- Generacion de codigo y resolucion de tareas de ingenieria de software y terminal, objetivo del ajuste con GRPO bajo el arnes pi.
- Soporte de function calling y tool use, con plantilla de chat completa de Qwen3.8 que incluye llamadas a herramientas.
- Capacidades agenticas y razonamiento multi-paso orientadas a agentes de codigo.
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`), con torre de vision en bf16.
- Decodificacion especulativa mediante cabeza MTP para acelerar la generacion.
- Capacidades multilingues limitadas al ingles segun la metadata del modelo.

## Casos de uso

- Agente de programacion local: el modelo esta ajustado para conducir el arnes pi en tareas de edicion de codigo y ejecucion de comandos de terminal, por lo que puede desplegarse como motor de un agente de desarrollo en una maquina Apple Silicon.
- Asistente de terminal interactivo: gracias al soporte de tool calling y a la plantilla de chat con llamadas a herramientas, puede integrarse en flujos de shell para ejecutar comandos, interpretar salidas y proponer correcciones.
- Revisions de codigo automatizadas: con HumanEval reportado en 92,1% en el cuantizador de la familia, es adecuado para generar y validar parches en pipelines de integracion continua ejecutados localmente.
- Analisis de capturas e imagenes tecnicas: la torre de vision permite pasar imagenes de diagramas, errores de compilacion o interfaces como entrada junto a instrucciones de texto.
- Servicio local compatible con OpenAI y Anthropic: `optiq serve` expone un endpoint que arneses como pi u OptiQ Code pueden consumir, util para entornos sin conectividad o con requisitos de privacidad.
- Prototipado de agentes con contexto de recuperacion: la prueba HashHop del cuantizador de la familia reporta 85,0%, lo que lo hace viable para tareas de recuperacion en contexto largo dentro de agentes.
- Inferencia privada en portatiles y estaciones Apple: al ocupar unos 19 GB en disco y ejecutarse con MLX, permite trabajar con un modelo de ~27B sin enviar datos a servicios externos.

## Benchmarks y rendimiento

Los resultados publicados corresponden al cuantizador `mlx-community/Qwen3.8-27B-OptiQ-4bit` del modelo base, no a este fine-tune. El autor indica que la asignacion de bits es la misma y remite a la model card del adaptador para los resultados agenticos propios.

| Metrica (mlx-community/Qwen3.8-27B-OptiQ-4bit) | Resultado |
|---|---|
| MMLU (5-shot, 1000) | 84,1% |
| GSM8K (3-shot CoT) | 96,1% |
| IFEval (prompt-level, strict) | 77,1% |
| BFCL-V3 simple (AST) | 93,5% |
| HumanEval (pass@1) | 92,1% |
| HashHop (recuperacion en contexto largo) | 85,0% |
| Capability Score (media de 6) | 87,98 |

No se han publicado resultados de benchmarks especificos de este fine-tune en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: alrededor de 19 GB de pesos en disco; se recomienda al menos 24 GB de memoria unificada para cargar el modelo con margen para cache KV.
- GPU recomendadas: exclusivamente Apple Silicon (M-series) por el uso de MLX; no se soportan GPU NVIDIA o AMD en esta version.
- Cabe en consumer hardware: si, en equipos Apple con 24 GB o mas de memoria unificada; en configuraciones de 16 GB el margen es insuficiente.
- Opciones de despliegue: `mlx-lm` (con `import optiq` previo) y `optiq serve` para endpoint compatible con OpenAI y Anthropic; no se indica soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La cabeza MTP permite decodificacion especulativa cuando se usa a traves de `optiq serve`.
- Requiere `mlx-optiq>=0.8.4`. En LM Studio hay que mover `mtp.safetensors` de vuelta a la carpeta `optiq/` para que se encuentre la cabeza de especulacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| mlx-community/Qwen3.8-27B-pi-adapted-OptiQ-4bit | ~26,9B | no disponible | Apache 2.0 | safetensors MLX | Ajustado con GRPO para agente pi; vision y MTP incluidos |
| mlx-community/Qwen3.8-27B-OptiQ-4bit | ~26,9B | no disponible | Apache 2.0 | safetensors MLX | Mismo esquema de cuantizacion, sin ajuste agentico; referencia de benchmarks de la familia |
| harness-hub/Qwen3.8-27B-pi-adapted | ~26,9B | no disponible | no disponible | safetensors (bf16) | Adaptador sin cuantizar; mayor huella de memoria |
| Qwen/Qwen3.8-27B | ~26,9B | no disponible | no disponible | safetensors | Modelo base original sin ajuste ni cuantizacion |

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar cargas de contexto largo con precision.
- Los benchmarks publicados corresponden al cuantizador del modelo base, no a este fine-tune; el rendimiento real del ajuste agentico puede diferir.
- La cuantizacion mixta 4/8 bits puede degradar ligeramente la calidad frente al modelo en bf16, especialmente en tareas sensibles a precision.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado en tareas de codigo donde puede generar APIs o funciones inexistentes.
- El ajuste con GRPO sobre tareas de agente puede introducir sesgos hacia patrones concretos del arnes pi, reduciendo generalidad fuera de ese entorno.
- Dependencia exclusiva de MLX y Apple Silicon; no es desplegable en infraestructura NVIDIA sin reconversion.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y del adaptador originales antes de distribuirlo en produccion.
- El uso de la cabeza MTP fuera de `optiq serve` requiere sumar 1.0 a las siete normas RMSNorm (`mtp.*norm*`), ya que estan centradas en cero; omitirlo produce resultados incorrectos.
- Configuracion recomendada por los autores del adaptador: thinking desactivado, temperatura 0,8 y top-p 1,0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/Qwen3.8-27B-pi-adapted-OptiQ-4bit
- Modelo base del cuantizador: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizador de referencia de la familia: https://huggingface.co/mlx-community/Qwen3.8-27B-OptiQ-4bit
- Web del proyecto mlx-optiq: https://mlx-optiq.com/
- Listado de cuantizaciones OptiQ: https://mlx-optiq.com/models
- Documentacion de mlx-optiq: https://mlx-optiq.com/docs/
- Repositorio del agente pi: https://github.com/earendil-works/pi
