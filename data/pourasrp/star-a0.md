# pourasrp/star-A0

## Resumen

STAR arm A0 (seed 42) es un adaptador LoRA entrenado mediante SFT sobre el modelo base Qwen/Qwen3-8B, desarrollado por Chaitanya Medidar, Manasi Ghalsasi, Pouras Patil y Rushil Patil (Vivekanand Education Society's Institute of Technology, Mumbai). Forma parte del proyecto STAR (Execution-Grounded, Typed Recovery Supervision for Coding-Agent SFT), cuyo objetivo es supervisar la recuperacion de errores en agentes de codigo a partir de la ejecucion real de las trayectorias, en lugar de depender unicamente de la imitacion de texto.

El artefacto publicado no es un modelo completo, sino un adaptador PEFT de tipo LoRA con rango r=64 y alpha=128 aplicado a todas las proyecciones de atencion y MLP del modelo base. El brazo A0 es la linea base del estudio: asigna un peso w = 1 a todos los tokens candidatos y nunca ve la mascara de recuperacion tipada que define el resto de variantes del proyecto, por lo que sirve como referencia de comparacion frente a las demas condiciones experimentales.

Es relevante ahora porque ejemplifica una tendencia creciente en IA abierta: publicar adaptadores ligeros y reproducibles (con manifiesto de ejecucion, hashes SHA-256 y dataset asociado) en lugar de reentrenar modelos completos. Al apoyarse en Qwen3-8B bajo licencia Apache-2.0, el adaptador es reutilizable tanto para investigacion en agentes de codigo como para experimentos de SFT con senales a nivel de token.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso (Qwen3-8B) |
| Parametros totales | 8B en el modelo base; el adaptador anade el delta de LoRA (r=64, alpha=128), no cuantificado en la model card |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen/Qwen3-8B) |
| Tipos de cuantizacion | No disponible en la model card; el adaptador se distribuye en safetensors. Las cuantizaciones aplicables dependen del modelo base (GGUF, AWQ, GPTQ, bitsandbytes, etc.) |
| Idiomas soportados | No disponibles en la model card |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors, ~0.7 GB) y adapter_config.json |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen/Qwen3-8B (revision `b968826d9c46dd6066d109eabc6255188de91218`), un transformer decoder-only denso de aproximadamente 8.000 millones de parametros. La intervencion LoRA emplea rango r=64, alpha=128 y se aplica a todas las proyecciones de atencion y de las capas MLP. La semilla del entrenamiento es 42 y el manifiesto completo de la ejecucion esta disponible como `run_manifest.json` junto al adaptador.

El entrenamiento es un SFT sobre trayectorias de agentes de codigo, con los datos derivados de SWE-Lego Real. La innovacion del proyecto STAR reside en la supervision de recuperacion tipada (Typed Recovery Supervision) fundamentada en la ejecucion: cada token candidato recibe un peso, y las variantes del estudio difieren en como se construye ese peso. El brazo A0 es la condicion de control, con w = 1 uniforme para todos los tokens candidatos y sin acceso a la mascara de recuperacion, lo que permite medir la aportacion de la senal tipada frente a un SFT convencional. No se redistribuye texto de trayectorias en el repositorio, y no se especifican en la model card el numero de tokens de entrenamiento, la composicion detallada del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto y ajuste fino orientado a tareas de codigo y agentes de programacion (coding-agent SFT).
- Razonamiento multi-paso en el contexto de resolucion de incidencias de software, heredado del modelo base Qwen3-8B.
- Recuperacion de errores en entornos de ejecucion, que es el objeto central del proyecto STAR, aunque en el brazo A0 la supervisaron no incorpora la mascara tipada.
- Capacidades generales del modelo base Qwen3-8B: generacion de texto, razonamiento, matematicas y codigo en multiples lenguajes de programacion.
- Soporte de tool calling y function calling: no confirmado en la model card para este adaptador (depende del modelo base; no disponible).
- Modo de razonamiento explicito (thinking mode): no documentado para el adaptador en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la model card.

## Casos de uso

- Experimentacion academica en SFT de agentes de codigo: el adaptador A0 sirve como linea base contra la que comparar las variantes con recuperacion tipada del proyecto STAR, permitiendo aislar el efecto de la senal de supervisión.
- Reproduccion de resultados: gracias al manifiesto de ejecucion, la semilla fija (42) y los hashes SHA-256 de los pesos, un grupo de investigacion puede replicar el entrenamiento y verificar la integridad del artefacto.
- Fine-tuning incremental sobre Qwen3-8B para tareas de reparacion de bugs: al ser un adaptador LoRA, se puede fusionar con el modelo base o combinar con otros adaptadores para especializar aun mas el comportamiento.
- Evaluacion de estrategias de ponderacion por token: el contraste entre A0 (w = 1) y otras variantes permite estudiar como distintas senales de supervision afectan al rendimiento en tareas de ejecucion.
- Prototipado rapido de agentes de codigo en local: al ocupar solo ~0,7 GB el adaptador, es sencillo cargarlo sobre una instancia de Qwen3-8B ya desplegada sin duplicar el almacenamiento del modelo completo.
- Estudio comparativo de metodologias de SFT frente a enfoques de RLHF/DPO en dominios de codigo, usando A0 como referencia de SFT estandar.
- Base para investigacion en recuperacion de errores de herramientas y pipelines de CI, dado que el dataset de origen (SWE-Lego Real) procede de trayectorias de ingenieria reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de tareas especificas de agentes de codigo para el brazo A0.

## Requisitos de hardware

- El adaptador en si ocupa aproximadamente 0,7 GB en safetensors, pero requiere cargar el modelo base Qwen3-8B para funcionar.
- Inferencia del modelo base en FP16/BF16: en torno a 16 GB de VRAM, mas el overhead de activaciones y cache KV.
- Inferencia en 4 bits (bitsandbytes, GPTQ o AWQ): aproximadamente 5-6 GB de VRAM.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o A6000 para despliegues de produccion; una RTX 4090 (24 GB) es suficiente para inferencia en FP16 con contexto moderado y en cuantizaciones de 4-8 bits.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas usando cuantizacion de 4 bits; con 16-24 GB se puede ejecutar en BF16 sin cuantizar.
- Opciones de despliegue: al ser un adaptador PEFT, es compatible con transformers + peft; tambien se puede fusionar con el modelo base y servir con vLLM, TGI, llama.cpp/Ollama (tras conversion a GGUF) u otros motores compatibles con Qwen3.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| STAR arm A0 (este) | 8B base + LoRA r=64 | No disponible (heredado de Qwen3-8B) | safetensors (adaptador PEFT) | Apache-2.0 | HuggingFace: pourasrp/star-A0 |
| Qwen/Qwen3-8B (base) | 8B | Ventana del modelo base | safetensors, GGUF, etc. | Apache-2.0 | HuggingFace: Qwen/Qwen3-8B |
| Otros adaptadores LoRA de agentes de codigo sobre Qwen3-8B | 8B base + LoRA | Depende del base | safetensors (PEFT) | Variable | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de STAR arm A0 con alternativas de la misma categoria.

## Limitaciones y advertencias

- Se trata de un adaptador LoRA, no de un modelo autonomo: requiere cargar Qwen/Qwen3-8B para funcionar.
- El brazo A0 no utiliza la mascara de recuperacion tipada, por lo que no incorpora la innovacion principal del proyecto STAR; su interes es fundamentalmente como linea base.
- La model card no documenta sesgos conocidos, ni la composicion linguistica del dataset de entrenamiento.
- Riesgo de alucinacion: inherente al modelo base Qwen3-8B; no se han publicado evaluaciones especificas para este adaptador.
- No se han publicado benchmarks que permitan verificar su rendimiento real en tareas de codigo o de agentes.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de la comunidad.
- La licencia es Apache-2.0, lo que permite uso comercial, pero el dataset de origen (SWE-Lego Real) puede tener sus propias condiciones; conviene revisarlas antes de un uso en produccion.
- El adaptador no redistribuye texto de trayectorias, lo que limita la trazabilidad del comportamiento aprendido a partir de los datos publicados.
- La fecha de creacion registrada (2026-10-15) y el tamano del repositorio (0,7 GB) conviene verificarlos en la pagina del modelo antes de cualquier integracion.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/pourasrp/star-A0
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio GitHub del proyecto STAR: https://github.com/chaitanyamedidar/STAR
- Dataset principal: https://huggingface.co/datasets/pourasrp/star_v1
- Dataset de pesos por token: https://huggingface.co/datasets/pourasrp/star-weights
- DOI del modelo: https://doi.org/10.57967/hf/11005
- DOI del dataset: https://doi.org/10.57967/hf/11003
