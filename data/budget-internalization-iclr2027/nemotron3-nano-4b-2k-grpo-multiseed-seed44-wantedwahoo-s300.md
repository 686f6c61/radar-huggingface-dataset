# budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s300

## Resumen

Nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s300 es un ajuste fino por aprendizaje por refuerzo (GRPO) del modelo base nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16, desarrollado por el colectivo anónimo budget-internalization-iclr2027 como parte de una submission al congreso ICLR 2027. El objetivo del trabajo es que el modelo aprenda a razonar matematicamente dentro de un presupuesto de generacion fijo de 2.048 tokens, de modo que internalice ese limite en lugar de necesitar instrucciones externas para respetarlo.

El modelo parte de una arquitectura Nemotron-H de aproximadamente 3.973 millones de parametros (4B), heredada del base de NVIDIA. Sobre ella se aplica GRPO con recompensa binaria de correccion de respuesta, usando el dataset de matematicas DeepScaleR-Preview-Dataset durante un maximo de 3 epocas y 300 pasos de entrenamiento. Este repositorio concreto corresponde a la semilla 44 de una ablacion de tres semillas (42, 43 y 44), y es el checkpoint final de esa ejecucion (paso 300).

Su relevancia es fundamentalmente de investigacion: permite estudiar la variabilidad entre semillas del entrenamiento por RL y el fenomeno de "internalizacion de presupuesto" (que el modelo ajuste la longitud de su cadena de razonamiento a un limite fijo). No es un modelo pensado para produccion generalista, sino una pieza experimental reproducible dentro de un estudio academico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (transformer, segun tag `nemotron_h` del repo) |
| Parametros totales | 3.973.556.832 (~4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (presupuesto de generacion entrenado: 2.048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en F32) |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | safetensors (libreria transformers, `custom_code`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base NVIDIA-Nemotron-3-Nano-4B-BF16, etiquetada en el repositorio como `nemotron_h`. No se detalla en la model card la composicion interna (numero de capas, atencion, posible mezcla de expertos), por lo que esos datos deben consultarse en la ficha del modelo base. Los pesos se publican en F32 y el modelo requiere `trust_remote_code=True` por el uso de codigo personalizado.

El ajuste se realiza con GRPO (Group Relative Policy Optimization) con baseline leave-one-out, normalizacion de recompensa por grupo y perdida a nivel de token. Las respuestas que alcanzan el presupuesto de 2.048 tokens se truncan y se puntuan tal cual. Los datos son problemas de matematicas de DeepScaleR (hasta 3 epocas), con lotes de 32 prompts x 8 rollouts por paso, optimizador Adam con schedule coseno, LR pico de 2e-6 y 10 pasos de calentamiento, durante 300 pasos. La recompensa es binaria: correccion de la respuesta extraida de las etiquetas `\boxed{}`. La validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR. El prompt de entrenamiento pide razonamiento paso a paso y salida dentro de `\boxed{}`.

## Capacidades

- Generacion de texto y razonamiento matematico paso a paso, optimizado para problemas con respuesta extraible en `\boxed{}`.
- Razonamiento bajo presupuesto de tokens: entrenado para producir cadenas de razonamiento acotadas a 2.048 tokens de generacion.
- Resolucion de problemas de matematicas tipo competicion (dataset DeepScaleR).
- Conversacional segun el tag `conversational` y la plantilla de chat del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se documentan idiomas.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponible.

## Casos de uso

- Investigacion sobre internalizacion de presupuesto: usar el modelo para estudiar como el RL ajusta la longitud de la cadena de razonamiento a un limite fijo de 2.048 tokens, comparando con los checkpoints de las semillas 42 y 43 del mismo estudio.
- Ablacion de semillas en entrenamiento por RL: reproducir el experimento con las tres semillas y medir la varianza en precision de validacion sobre los 480 problemas reservados de DeepScaleR.
- Evaluacion de metodos de RL para matematicas: emplear el modelo como punto de comparacion frente al base NVIDIA-Nemotron-3-Nano-4B-BF16 para aislar el efecto de GRPO con recompensa binaria.
- Generacion de soluciones matematicas acotadas: integrar el modelo en pipelines que necesiten respuestas con cadenas de razonamiento de longitud controlada para limitar coste de inferencia.
- Benchmarking de infraestructura de inferencia: al ser un modelo de ~4B con pesos F32, sirve para medir latencia y throughput en vLLM o transformers con `trust_remote_code`.
- Estudio de truncamiento en RL: analizar como afecta al aprendizaje el hecho de que las respuestas que alcanzan el presupuesto se trunquen y se puntuen tal cual, comparando con variantes del estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la precision de validacion se mide cada 10 pasos sobre 480 problemas reservados de DeepScaleR, pero no se incluyen los valores numericos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en F32: aproximadamente 16 GB solo para pesos (3.973 millones de parametros x 4 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en BF16/FP16: aproximadamente 8 GB para pesos, mas overhead.
- GPU recomendadas: A100, H100 o L40S para despliegue comodo; una RTX 4090 (24 GB) deberia poder alojar los pesos en F32 o BF16, aunque el overhead de contexto puede ser ajustado en F32.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas (RTX 3090, RTX 4090) usando BF16; en F32 el margen es mas justo.
- Opciones de despliegue: transformers con `trust_remote_code=True`; vLLM con `--trust-remote-code`. Otras opciones (llama.cpp, Ollama, TGI) no estan confirmadas en la informacion disponible, dado el uso de codigo personalizado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (seed 44, s300) | ~4B | no disponible | GRPO sobre DeepScaleR, presupuesto 2k | nvidia-nemotron-open-model-license | Hugging Face |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 (base) | ~4B | no disponible | Preentrenamiento + postentrenamiento NVIDIA | nvidia-nemotron-open-model-license | Hugging Face |
| Seed 42 (hardymagpie, s300) | ~4B | no disponible | Misma receta GRPO, semilla 42 | nvidia-nemotron-open-model-license | Hugging Face |
| Seed 43 (squareman, s300) | ~4B | no disponible | Misma receta GRPO, semilla 43 | nvidia-nemotron-open-model-license | Hugging Face |

No se dispone de datos de rendimiento comparado con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental de investigacion: no se documentan evaluaciones fuera del dominio de matematicas de DeepScaleR.
- Riesgo de alucinacion: como todo modelo generativo, puede producir razonamientos plausibles pero incorrectos; la recompensa binaria de entrenamiento no garantiza correccion fuera de distribucion.
- Presupuesto de generacion fijo: el entrenamiento asume 2.048 tokens; usos con presupuestos muy distintos pueden degradar el comportamiento aprendido.
- Idiomas: no se documentan idiomas soportados; probablemente centrado en ingles por el dataset de entrenamiento, aunque no se confirma.
- Sesgos: no se documentan analisis de sesgos en la informacion disponible.
- Licencia: hereda la nvidia-nemotron-open-model-license, con terminos propios que deben revisarse antes de uso comercial; no es una licencia permisiva estandar.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del repositorio; conviene auditar antes de desplegar en produccion.
- Checkpoint unico de una ablacion: los resultados pueden variar entre semillas; no debe tomarse como representativo del metodo sin comparar con las semillas 42 y 43.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s300
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Dataset de entrenamiento: https://huggingface.co/datasets/agentica-org/DeepScaleR-Preview-Dataset
- Checkpoint seed 42 (s240): https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s240
- Checkpoint seed 42 (s300): https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed42-hardymagpie-s300
- Checkpoint seed 43 (s290): https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s290
- Checkpoint seed 43 (s300): https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed43-squareman-s300
- Checkpoint seed 44 (s280): https://huggingface.co/budget-internalization-iclr2027/nemotron3-nano-4b-2k-grpo-multiseed-seed44-wantedwahoo-s280
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
