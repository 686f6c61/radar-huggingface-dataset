# openvulcan/vulcan-decision-shell-v1-flash

## Resumen

vulcan-decision-shell-v1-flash es un modelo de clasificacion de texto de 361.821.120 parametros (0,36B) desarrollado por openvulcan, afinado a partir de HuggingFaceTB/SmolLM2-360M. Su funcion es actuar como guardrail para agentes de codificacion: recibe la descripcion de una llamada a herramienta (tool call) o de un comando de shell generado por un agente y emite una de tres decisiones discretas: permitir, revisar o bloquear. No genera texto libre ni codigo; es un clasificador especializado que se inserta en el bucle de ejecucion del agente antes de que la accion se lleve a cabo.

Forma parte de la familia vulcan-decision-shell-v1, compuesta por tres tamanos con la misma politica de decision y el mismo formato de entrada: v1 (0,75B, basado en Qwen3.5-0.8B-Base), v1-flash (0,36B, basado en SmolLM2-360M) y v1-mini (0,2B, basado en ModernBERT-base). Este repositorio concreto contiene unicamente pesos nativos de PyTorch: los originales en FP32 (1,45 GB) mas conversiones completas a BF16 y FP16 (0,72 GB cada una), junto con el tokenizer, la politica, ejemplos y el punto de entrada `decision.py` con soporte opcional de CUDA graphs.

La relevancia del modelo radica en su enfoque: en lugar de confiar en heurísticas o en un LLM general para validar acciones peligrosas, se entrena un clasificador pequeno y dedicado que puede ejecutarse en el mismo host del agente con un coste de computo minimo. El limite por llamada es de 32.768 tokens, lo que permite revisar comandos y contexto de tool calls de longitud considerable. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de SmolLM2-360M) con cabeza de clasificacion |
| Parametros totales | 361.821.120 (0,36B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens por llamada |
| Tipos de cuantizacion | FP32 (original), BF16, FP16; conversiones INT16-storage e INT8-delta marcadas como experimentales en el repositorio hermano v1 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (nativo PyTorch); ONNX disponible en el repositorio `vulcan-decision-shell-v1-runtime` |

## Arquitectura y entrenamiento

El modelo es un fine-tune supervisado de SmolLM2-360M, un transformer decoder-only denso de la familia SmolLM2 de HuggingFaceTB. Sobre la base se anade una cabeza de clasificacion que produce tres clases discretas (allow, review, block) a partir de la representacion de la secuencia de entrada, que codifica la llamada a herramienta o comando a evaluar junto con el contexto de politica. El pipeline declarado en HuggingFace es `text-classification`.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card indica que los bancos de entrenamiento y validacion estan publicados en el repositorio de datos `openvulcan/vulcan-decision-shell-v1-data` (866 MB), que constituye la referencia para reproducir o auditar el ajuste. La innovacion tecnica destacable es el propio diseno del problema: una politica unica compartida por los tres tamanos de la familia, con el mismo formato de entrada y las mismas tres decisiones, lo que permite intercambiar modelos segun los recursos disponibles sin cambiar la integracion. El punto de entrada `decision.py` admite CUDA graphs opcionales para reducir la latencia de inferencia.

## Capacidades

- Clasificacion de acciones de agente en tres clases: permitir, revisar o bloquear.
- Evaluacion de tool calls y comandos de shell antes de su ejecucion (command review).
- Aplicacion de una politica de permisos predefinida sobre la accion propuesta.
- Procesamiento de entradas de hasta 32.768 tokens, suficiente para comandos largos con contexto.
- Integracion como guardrail en el bucle de un agente de codificacion (VulcanCode, plugin dsh).
- Inferencia en precision FP32, BF16 o FP16 (las dos ultimas requieren `--allow-experimental-precision`).
- No soporta generacion de texto, razonamiento libre, codigo, matematicas, vision ni audio: es exclusivamente un clasificador.
- No se documenta soporte de tool calling ni de agentes multi-paso por parte del propio modelo; su rol es precisamente validar los tool calls de otros.

## Casos de uso

- Guardrail en agentes de codificacion autonomos: el modelo se invoca antes de cada tool call para decidir si la accion se ejecuta, se deriva a revision humana o se bloquea, con una latencia baja gracias a sus 0,36B parametros.
- Revision de comandos de shell en pipelines de CI/CD: antes de lanzar un comando generado por un agente sobre el runner, el clasificador evalua el riesgo y evita operaciones destructivas como borrados recursivos o escrituras fuera del workspace.
- Sandboxing de agentes en produccion: integrado en el runtime del agente, actua como ultima barrera ante prompt injection que intente desviar al agente hacia acciones no permitidas por la politica.
- Auditoria y trazabilidad: al emitir una etiqueta discreta por cada accion propuesta, facilita el registro estructurado de decisiones y la revision posterior de incidentes.
- Despliegue en entornos con recursos limitados: al caber en CPU y en GPUs de consumo, permite anadir una capa de seguridad a agentes que corren en portatiles o estaciones de trabajo sin GPU dedicada.
- Filtrado previo en plataformas de agentes multi-tenant: cada llamada a herramienta de cualquier tenant pasa por el clasificador, que aplica una politica comun antes de conceder permisos de ejecucion.
- Evaluacion offline de trayectorias de agentes: el modelo puede puntuar acciones ya registradas para medir la tasa de acciones peligrosas que un agente habria propuesto, como parte de un banco de pruebas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,45 GB para los pesos FP32 originales; unos 0,72 GB para las conversiones BF16 o FP16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16/BF16; no requiere A100 ni H100. Una RTX 4090 o una GPU de gama media son mas que suficientes.
- Cabe en GPU de consumo: si, incluidas GPUs de gama baja y portatiles con 4 GB o mas. Tambien puede ejecutarse en CPU.
- Opciones de despliegue: script nativo `decision.py` / `runtime/judge_native.py` con perfiles `mixed-bf16`, `bf16` y `fp16`; paquetes ONNX (CUDA, WebGPU, CPU) en `vulcan-decision-shell-v1-runtime`; integracion via VulcanCode y el plugin dsh. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada. El soporte opcional de CUDA graphs sugiere que el autor optimiza la latencia de inferencia por llamada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto por llamada | Modelo base | Licencia | Estado |
|---|---:|---:|---|---|---|
| vulcan-decision-shell-v1-flash | 0,36B | 32.768 tokens | SmolLM2-360M | Apache 2.0 | Publicado (PyTorch) |
| vulcan-decision-shell-v1 | 0,75B | 32.768 tokens | Qwen3.5-0.8B-Base | Apache 2.0 | Publicado (PyTorch y ONNX) |
| vulcan-decision-shell-v1-mini | 0,2B | 8.192 tokens (paquete runtime) | ModernBERT-base | Apache 2.0 | Publicado (PyTorch) |

No se dispone de informacion sobre modelos de terceros comparables en la misma tarea de clasificacion de tool calls; los unicos comparables documentados son los otros dos miembros de la propia familia, que comparten politica y formato de entrada.

## Limitaciones y advertencias

- Solo soporta ingles; las entradas en otros idiomas pueden degradar la calidad de la clasificacion.
- Es un clasificador de tres clases, no un generador: no explica sus decisiones ni produce justificaciones textuales.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea (falsos negativos que permitan acciones peligrosas o falsos positivos que bloqueen acciones legitimas).
- Las conversiones BF16 y FP16 estan marcadas como no cualificadas: requieren `--allow-experimental-precision` y solo los pesos FP32 originales se consideran la linea base valida.
- La model card no documenta sesgos conocidos ni evaluaciones de robustez frente a prompt injection dirigida al propio clasificador.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantias y la responsabilidad de la politica de seguridad recae en el integrador.
- Para produccion se recomienda combinar el clasificador con controles deterministas adicionales (sandbox, listas de comandos permitidos) y no confiar unicamente en la salida del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/openvulcan/vulcan-decision-shell-v1-flash
- Repositorio hermano v1 (0,75B, PyTorch y ONNX): https://huggingface.co/openvulcan/vulcan-decision-shell-v1
- Repositorio hermano v1-mini (0,2B): https://huggingface.co/openvulcan/vulcan-decision-shell-v1-mini
- Paquetes ONNX runtime de los tres modelos: https://huggingface.co/openvulcan/vulcan-decision-shell-v1-runtime
- Bancos de entrenamiento y validacion: https://huggingface.co/datasets/openvulcan/vulcan-decision-shell-v1-data
- Modelo base SmolLM2-360M: https://huggingface.co/HuggingFaceTB/SmolLM2-360M
- Modelo base de v1 (Qwen3.5-0.8B-Base): https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Modelo base de v1-mini (ModernBERT-base): https://huggingface.co/answerdotai/ModernBERT-base
