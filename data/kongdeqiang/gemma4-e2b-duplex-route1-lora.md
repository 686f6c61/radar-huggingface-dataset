# kongDeQiang/gemma4-e2b-duplex-route1-lora

## Resumen

`kongDeQiang/gemma4-e2b-duplex-route1-lora` es un adaptador LoRA publicado por el usuario kongDeQiang sobre el modelo base `google/gemma-4-E2B-it`. Se trata de un ajuste fino supervisado (SFT) entrenado con LLaMA-Factory sobre un conjunto de datos denominado `gemma4_duplex_route1`, del que el autor no aporta practicamente informacion en la model card. El repositorio contiene unicamente los pesos del adaptador en formato safetensors gestionados con la libreria PEFT, con un tamano aproximado de 0,1 GB.

El interes tecnico del artefacto reside en el modelo base: Gemma 4 E2B-it es la variante "efimera" (E) de 2 mil millones de parametros activos de la familia Gemma 4 de Google, disenada para inferencia en dispositivos con recursos limitados. El adaptador hereda por tanto las capacidades del modelo base (generacion de texto conversacional, tool calling, contexto largo) y anade un ajuste especifico orientado, a juzgar por el nombre "duplex route1", a enrutamiento o conversacion de doble via, aunque no se documenta formalmente.

La relevancia de esta ficha es limitada: se trata de un experimento personal con cero descargas y cero likes en el momento de la consulta, sin model card completa, sin benchmarks declarados y con licencia "other" sin texto especificado. Debe evaluarse como un artefacto de investigacion, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Gemma 4 E2B-it); tipo exacto de atencion del base no disponible |
| Parametros totales | No disponible (el adaptador no declara rango ni numero de parametros entrenados; el repo ocupa 0,1 GB) |
| Parametros activos | No disponible (el modelo base es una variante "E" de 2B, pero no se confirma si es MoE) |
| Longitud de contexto | No disponible (heredada del base `google/gemma-4-E2B-it`, no declarada en el adaptador) |
| Tipos de cuantizacion | No disponible (solo pesos del adaptador en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | No disponible |
| Licencia | other (sin texto de licencia especificado en el repo) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base para inferencia |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con LLaMA-Factory sobre `google/gemma-4-E2B-it`. La model card no especifica rango, alpha ni modulos objetivo del adaptador, por lo que no es posible determinar su capacidad efectiva. El entrenamiento se realizo durante 2 epocas con un total de 1778 pasos, learning rate de 2e-4, scheduler coseno con 50 pasos de calentamiento, optimizador AdamW fused (betas 0,9/0,999, epsilon 1e-8), batch efectivo de 8 (batch de 4 con 2 pasos de acumulacion de gradiente) y semilla 42. Las versiones de framework declaradas son PEFT 0.21.2, Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

La curva de validacion muestra una perdida que desciende de 0,9305 en el paso 200 a 0,8162 en el paso 1778, con una perdida de entrenamiento final de 1,5726. La convergencia es monotona pero lenta y con una brecha moderada entre entrenamiento y validacion, lo que sugiere un ajuste suave sin senales claras de sobreajuste severo, aunque tampoco de una adaptacion profunda. No se documenta composicion del dataset, numero de tokens, ni si hubo etapas de RLHF o DPO posteriores.

## Capacidades

- Generacion de texto conversacional: heredada del modelo base `gemma-4-E2B-it`, orientado a dialogos multi-turno.
- Razonamiento y matematicas: capacidades del base no verificadas para este adaptador concreto.
- Generacion de codigo: no documentada especificamente para el adaptador.
- Tool calling / function calling: presumiblemente heredado del base instruct, sin validacion en este adaptador.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles; el adaptador no declara idiomas.
- Capacidades especiales (thinking mode, vision, audio): no documentadas para el adaptador.
- Ajuste especifico "duplex route1": el nombre sugiere enrutamiento o conversacion bidireccional, pero no hay descripcion funcional en la model card.

## Casos de uso

- Experimentacion academica sobre adaptadores LoRA: el artefacto sirve como ejemplo reproducible de un SFT con LLaMA-Factory sobre Gemma 4 E2B, util para estudiar hiperparametros y curvas de perdida en entornos de investigacion.
- Prototipado de asistentes conversacionales ligeros: al partir de un modelo de 2B, puede desplegarse en GPUs de consumo para pruebas de concepto de dialogo, siempre que se valide el comportamiento del adaptador frente al base.
- Investigacion sobre enrutamiento de conversaciones: si el dataset "duplex route1" entrena la seleccion entre rutas de respuesta, el adaptador podria emplearse en experimentos de clasificacion o derivacion de turnos, previa validacion empirica.
- Base para comparativas de fine-tuning: permite contrastar el efecto del SFT frente al modelo base en tareas de instruccion, midiendo degradacion o mejora con conjuntos de evaluacion propios.
- Ajuste incremental en pipelines de investigacion: al ser un adaptador de 0,1 GB, puede combinarse con el base en experimentos de mezcla de adaptadores (adapter merging) o evaluacion de tecnicas PEFT.
- Docencia y formacion: util como caso practico de publicacion de adaptadores en Hugging Face, incluyendo la estructura de model card autogenerada y los metadatos de entrenamiento.

## Benchmarks y rendimiento

El autor declara un unico resultado en la model card: perdida de validacion de 0,8162 en el conjunto de evaluacion. El campo `model-index` no contiene resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Valor |
|---|---|
| Validation loss (epoca 2, paso 1778) | 0,8162 |
| Training loss final | 1,5726 |
| Benchmarks estandar (MMLU, HumanEval, GSM8K) | No disponibles |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende del modelo base `gemma-4-E2B-it` y de su cuantizacion. Un modelo de 2B en FP16 requiere aproximadamente 4-5 GB de VRAM, y en cuantizacion de 4 bits alrededor de 1,5-2 GB, aunque estos valores son estimaciones genericas y no estan confirmados para este base.
- GPU recomendadas: no disponibles. Por el tamano del base, cabria esperar compatibilidad con GPUs de consumo (RTX 3060 12 GB, RTX 4070, RTX 4090) y con aceleradores de datacenter (A100, H100) para lotes grandes.
- Cabe en GPU de consumo: probablemente si, dado el tamano del base, pero no verificado para este adaptador.
- Opciones de despliegue: PEFT + Transformers para cargar el adaptador; vLLM, TGI, llama.cpp u Ollama requeririan convertir o fusionar el adaptador con el base, sin documentacion al respecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kongDeQiang/gemma4-e2b-duplex-route1-lora | Adaptador sobre base 2B (E2B) | No disponible | other | Hugging Face, 0 descargas | SFT experimental, sin benchmarks |
| google/gemma-4-E2B-it (base) | 2B (variante E) | No disponible en esta ficha | Gemma (terminos de Google) | Hugging Face, ampliamente disponible | Modelo oficial con soporte y evaluaciones |
| Adaptadores LoRA genericos sobre Gemma | Depende del base | Depende del base | Variable | Hugging Face | Calidad y soporte muy heterogeneos |

No se dispone de datos suficientes para comparar rendimiento numerico con alternativas de la misma categoria.

## Limitaciones y advertencias

- Model card incompleta: las secciones de descripcion, usos previstos, limitaciones y datos de entrenamiento indican "More information needed".
- Sin benchmarks estandar: no hay evidencia publicada de calidad en tareas como MMLU, HumanEval o GSM8K; solo se reporta perdida de validacion.
- Licencia "other" sin texto: no se especifican condiciones de uso comercial, redistribucion ni atribucion; es imprescindible contactar con el autor o consultar los terminos del modelo base Gemma antes de cualquier uso.
- Riesgo de alucinacion: inherente a los modelos generativos; no se ha evaluado en este adaptador.
- Sesgos: no documentados; se heredan los del modelo base y los del dataset de ajuste, que no se describe.
- Idiomas: no declarados; el comportamiento multilingue del adaptador es desconocido.
- Dataset de entrenamiento no descrito: imposible evaluar calidad, cobertura o posibles contaminaciones.
- Cero adopcion: sin descargas ni likes, sin issues ni discusion, lo que reduce la probabilidad de que los fallos hayan sido detectados por terceros.
- Uso en produccion desaconsejado sin validacion previa frente al modelo base en el dominio objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kongDeQiang/gemma4-e2b-duplex-route1-lora
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- PEFT (libreria de adaptadores): https://github.com/huggingface/peft
