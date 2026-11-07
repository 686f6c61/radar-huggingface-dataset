# anilguven/Gemma-3-4B-it-XSumTr-500steps-unsloth

## Resumen

Gemma-3-4B-it-XSumTr-500steps-unsloth es un adaptador LoRA (PEFT) publicado por el usuario anilguven sobre el modelo base `unsloth/gemma-3-4b-it-bnb-4bit`, que a su vez es una versión cuantizada en 4 bits del Gemma 3 4B instruct de Google DeepMind. El nombre del repositorio indica un ajuste supervisado (SFT) de 500 pasos sobre un corpus de resumen tipo XSum, entrenado con la librería Unsloth y el stack TRL/Transformers. El repositorio contiene únicamente los pesos del adaptador (0,2 GB), no el modelo completo.

Se trata, por tanto, de un artefacto de experimentación más que de un modelo listo para producción: la model card es la plantilla por defecto de Hugging Face sin rellenar, no declara licencia, idiomas ni datos de entrenamiento, y no se han publicado resultados de evaluación. Su interés es acotado: sirve como ejemplo reproducible de cómo especializar un Gemma 3 4B en una tarea concreta de resumen con un coste de entrenamiento bajo, y como material de partida para quien quiera replicar el flujo con Unsloth.

La relevancia práctica depende enteramente del modelo base. Gemma 3 4B es un transformer denso de aproximadamente 4.000 millones de parámetros con ventana de contexto de 128.000 tokens, capacidades multilingües y soporte de visión en la familia Gemma 3; el adaptador hereda esas capacidades y añade un sesgo hacia la tarea de resumen para la que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Gemma 3 (modelo base: `unsloth/gemma-3-4b-it-bnb-4bit`) |
| Parametros totales | no disponible para el adaptador; el modelo base Gemma 3 4B ronda los 4.000 millones |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion del adaptador; el modelo base Gemma 3 4B soporta 128.000 tokens |
| Tipos de cuantizacion | el base referenciado esta en bnb 4-bit; el adaptador se distribuye en safetensors (precision del adaptador no especificada) |
| Idiomas soportados | no disponibles (el modelo base Gemma 3 es multilingue) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft (PEFT 0.21.2 segun la model card) |
| Tamano del repo | 0,2 GB |
| Pasos de entrenamiento | 500 (segun el nombre del repositorio) |
| Dataset de ajuste | XSumTr (resumen tipo XSum, segun el nombre del repositorio) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante SFT con LoRA sobre un Gemma 3 4B instruct cuantizado en 4 bits con bitsandbytes, usando Unsloth para acelerar el ajuste y TRL/Transformers como stack de entrenamiento. El nombre del repositorio indica 500 pasos de optimización y un corpus denominado XSumTr, presumiblemente una variante del dataset XSum (resumen abstractivo de noticias en inglés). No se especifican hiperparámetros (rango de LoRA, alpha, learning rate, batch size), ni la composición exacta del dataset, ni si hubo etapas posteriores de alineamiento.

El modelo base Gemma 3 es un transformer denso con atención multi-cabeza estándar, entrenado por Google DeepMind con una mezcla de datos web, código y matemáticas, y posteriormente alineado con técnicas de preferencia (RLHF/DPO según la documentación pública de Gemma 3). La innovación técnica del adaptador es mínima: se limita al uso de Unsloth para reducir el coste de memoria del ajuste. No hay contribuciones arquitectónicas propias.

## Capacidades

- Generación de texto conversacional, heredada del Gemma 3 4B instruct.
- Resumen de documentos, presumiblemente especializado en el estilo de XSum (resúmenes cortos y abstractivos de noticias) tras el ajuste.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño de 4B parámetros.
- Capacidades multilingües heredadas del modelo base (no verificadas en el adaptador).
- Soporte de tool calling y function calling: no documentado en el adaptador; el modelo base Gemma 3 lo soporta parcialmente vía prompt.
- Capacidades de agente multi-paso: no documentadas para el adaptador.
- Visión: el adaptador se aplica sobre la variante de texto; no se declara soporte multimodal en este repositorio.

## Casos de uso

- Resumen de noticias en pipelines de medios: el adaptador está entrenado sobre XSumTr, por lo que encaja en la generación de titulares y resúmenes de uno o dos frases a partir de artículos, siempre que se valide la calidad frente al modelo base sin ajustar.
- Prototipado rápido de tareas de resumen: al ser un adaptador de 0,2 GB sobre un base 4-bit, permite experimentar con resumen especializado en una GPU de consumo sin reentrenar desde cero.
- Investigación sobre ajuste eficiente: sirve como referencia reproducible del flujo Unsloth + LoRA + SFT con 500 pasos para comparar curvas de pérdida y degradación frente al base.
- Generación de resúmenes de actas o correos en inglés: el sesgo hacia resumen abstractivo puede aprovecharse en herramientas internas de síntesis documental, con revisión humana obligatoria.
- Base para ajustes posteriores: el adaptador puede combinarse o continuarse con otro dataset específico de dominio mediante PEFT, dado su reducido tamaño.
- Evaluación de olvido catastrófico: útil en entornos académicos para medir cuánto pierde un Gemma 3 4B en tareas generales tras un SFT corto y especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 0,2 GB; el coste real lo determina el modelo base Gemma 3 4B.
- Inferencia del base en 4-bit (bnb): aproximadamente 3-4 GB de VRAM, más overhead de activaciones y contexto.
- Inferencia en FP16/BF16 del base: en torno a 8-9 GB de VRAM, viable en RTX 4090 (24 GB), RTX 4080 (16 GB) y A100/H100 para despliegues concurrentes.
- Cabe en GPUs de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090; en 4-bit también en GPUs de 8 GB con contexto moderado.
- Despliegue: transformers + peft para cargar el adaptador; llama.cpp/Ollama requieren fusionar el adaptador con el base y convertir a GGUF; vLLM y TGI admiten LoRA dinámico con el adaptador cargado.
- Latencia y throughput: no disponibles para este adaptador; dependen del backend y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-3-4B-it-XSumTr-500steps-unsloth (este) | ~4B (base) + LoRA | no disponible (base: 128k) | Adaptador LoRA sobre Gemma 3 4B | no disponible | Hugging Face, 0 descargas |
| unsloth/gemma-3-4b-it-bnb-4bit | ~4B | 128k | Modelo base cuantizado 4-bit | Gemma Terms of Use (segun el autor del base) | Hugging Face |
| anilguven/Qwen3-4B-XSumTr-500steps-unsloth | ~4B (base Qwen3) | no disponible | Adaptador LoRA sobre Qwen3 4B | no disponible | Hugging Face |
| Gemma 3 4B IT (Google) | ~4B | 128k | Modelo instruct completo | Gemma Terms of Use | Hugging Face, Kaggle |

## Limitaciones y advertencias

- La model card está sin rellenar: no hay información sobre datos, hiperparámetros, licencia ni evaluación; no debe asumirse ningún uso permitido.
- Ausencia de licencia declarada: en la práctica impide el uso comercial sin aclaración previa con el autor y con el titular de los derechos del modelo base (Google, Gemma Terms of Use).
- Riesgo alto de sobreajuste y olvido catastrófico: 500 pasos de SFT sobre un único dataset de resumen pueden degradar capacidades generales del base.
- El adaptador está pensado para resumen en inglés (XSum); su rendimiento en castellano no está verificado.
- Riesgo de alucinación inherente al modelo base de 4B, agravado por la especialización en resumen abstractivo.
- El base está cuantizado en 4-bit, lo que introduce pérdida de precisión adicional frente al Gemma 3 4B original.
- Sin descargas ni likes: no hay evidencia de uso en producción ni validación por terceros.
- No apto para decisiones automatizadas de alto riesgo sin evaluación propia y supervisión humana.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/anilguven/Gemma-3-4B-it-XSumTr-500steps-unsloth
- Modelo base: https://huggingface.co/unsloth/gemma-3-4b-it-bnb-4bit
- Colección Gemma 3 de Unsloth: https://huggingface.co/collections/unsloth/gemma-3
- Adaptador análogo sobre Qwen3 4B del mismo autor: https://huggingface.co/anilguven/Qwen3-4B-XSumTr-500steps-unsloth
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
