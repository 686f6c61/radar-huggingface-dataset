# Jongwondd/Llama-3.1-8B-Instruct-UL-2ep-6af696c6

## Resumen

Llama-3.1-8B-Instruct-UL-2ep-6af696c6 es un adaptador LoRA (no fusionado) entrenado sobre meta-llama/Llama-3.1-8B-Instruct por el usuario Jongwondd. Se trata de un checkpoint de investigación resultante de un entrenamiento de dos épocas con un método denominado "UL" (objetivo específico no detallado en la model card) orientado a la negation-training, es decir, al tratamiento de la negación en el modelo. El adaptador se publica con rango LoRA 16, alpha 32 y dropout 0, y no incluye los pesos base ni el tokenizador.

El modelo hereda la arquitectura transformer decoder-only de Llama 3.1 8B, con 8.000 millones de parámetros y una ventana de contexto de 128.000 tokens (según las especificaciones del modelo base de Meta). El adaptador añade un entrenamiento específico sobre 14.951 pares (4.534 casos) del split de entrenamiento de PopQA, con 29.902 ejemplos vistos y 1.872 pasos de optimizador. No se publican resultados de evaluación en la model card.

Su relevancia es acotada: se trata de un artefacto de investigación sin descargas ni validación de seguridad, pensado para reproducir o estudiar experimentos sobre negación y para servir de base a comparaciones con otros métodos (SFT, DPO, etc.) mencionados en la propia model card. No es un modelo listo para producción ni un checkpoint independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), adaptador LoRA sobre el modelo base |
| Parametros totales | 8.000 millones (modelo base); el adaptador LoRA no especifica su número de parámetros entrenables |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base Llama 3.1 8B) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantización depende del despliegue del modelo base) |
| Idiomas soportados | en |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere los pesos base de meta-llama/Llama-3.1-8B-Instruct |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama-3.1-8B-Instruct en la revisión `0e9e39f249a16976918f6564b8830bc894c89659`. El método de entrenamiento es "UL" con inicialización desde el modelo base sin adaptador previo (fresh base). La población de entrenamiento es PopQA train, con 14.951 pares distribuidos en 4.534 casos; se completaron 2 épocas, con 29.902 ejemplos vistos y 1.872 pasos de optimizador. La configuración LoRA usa rango 16, alpha 32 y dropout 0. El SHA-256 original del adaptador es `6af696c68f7e2806a40b25e0f543e9fbec05e276163a19b922dfafc78c440324`.

La model card indica que los bytes de los pesos no se han modificado: solo se ha hecho portable el localizador del modelo base y la revisión en la configuración PEFT preparada para su publicación, registrando los hashes de configuración original y publicada en `training_provenance.json`. El objetivo específico del método, los ajustes de entrenamiento retenidos y los hashes del resumen de fuentes y de los datos de entrenamiento también se encuentran en ese fichero. No se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal; el adaptador hereda la arquitectura estándar de Llama 3.1.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Llama-3.1-8B-Instruct.
- Razonamiento y respuesta a instrucciones conversacionales, según las capacidades del modelo base.
- Entrenamiento específico orientado a negación (negation-training), aunque la model card no documenta métricas que cuantifiquen la mejora.
- Soporte de tool calling y function calling: no documentado en la model card; depende de las capacidades del modelo base y de que el adaptador no las degrade.
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente en esta publicación.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el modelo base es solo texto.

## Casos de uso

- Investigación sobre negación en LLM: el adaptador permite reproducir y analizar el efecto del entrenamiento UL de dos épocas sobre el tratamiento de la negación, comparándolo con las líneas base SFT/UL/DPO mencionadas en la model card.
- Reproducibilidad de experimentos: al publicarse el SHA-256 del adaptador y los hashes de procedencia en `training_provenance.json`, sirve para verificar la integridad de un run de investigación concreto.
- Estudio de métodos de ajuste ligero: al ser un LoRA de rango 16 y alpha 32 sobre un modelo de 8B, es útil para analizar el coste y el efecto de adaptadores de baja dimensión en tareas específicas.
- Evaluación comparativa de checkpoints: puede emplearse como punto de comparación frente a otros adaptadores o modelos fusionados en experimentos académicos sobre PopQA y negación.
- Docencia y formación: sirve como ejemplo práctico de carga de un adaptador PEFT con `PeftModel.from_pretrained` sobre un modelo base con acceso restringido.
- Pruebas de integración de PEFT: útil para validar pipelines que cargan adaptadores LoRA con versiones compatibles de Transformers y PEFT antes de desplegar adaptadores en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que esta subida no añade resultados de evaluación y no reclama reproducir las cifras del manuscrito; los splits de evaluación previamente observados son datos de desarrollo, no datos de test independientes.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Llama-3.1-8B-Instruct. En bf16, aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits, en torno a 8-9 GB; en 4 bits, en torno a 5-6 GB. Estas cifras son estimaciones para el modelo base, no datos publicados para este adaptador.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para despliegues en bf16 con contexto largo; RTX 4090 24 GB para bf16 con contexto moderado; GPUs consumer de 8-16 GB solo con cuantización.
- Cabe en GPU consumer: sí, con cuantización (por ejemplo, RTX 3060 12 GB, RTX 4070 12 GB, RTX 4090 24 GB), siempre que se cargue el modelo base cuantizado y se aplique el adaptador.
- Opciones de despliegue: Transformers + PEFT (carga del adaptador), vLLM (soporte de adaptadores LoRA), llama.cpp/Ollama (requiere fusionar el adaptador con el modelo base y convertir a GGUF), TGI (según soporte de adaptadores).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-UL-2ep-6af696c6 | 8B (base) + adaptador LoRA | 128.000 tokens (base) | Adaptador LoRA de investigación | llama3.1 | Hugging Face, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128.000 tokens | Modelo base instruct | llama3.1 | Hugging Face, ampliamente utilizado |
| Adaptadores LoRA comunitarios sobre Llama-3.1-8B | 8B (base) + adaptador | 128.000 tokens (base) | Adaptadores de tarea | variable (habitualmente llama3.1) | Hugging Face |

No se dispone de datos de rendimiento comparativo para este adaptador, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo validado para producción ni para seguridad.
- Las salidas pueden ser incorrectas, sesgadas, malformadas o repetitivas, según advierte la propia model card.
- No incluye resultados de evaluación ni métricas que demuestren mejora en negación; los splits de evaluación previos son datos de desarrollo, no test independientes.
- Las puntuaciones proxy basadas en reglas, si se reportan en otro lugar, no equivalen a precisión de un juez semántico.
- Los experimentos mecanicistas son independientes de esta publicación y pueden estar incompletos.
- Idioma limitado al inglés (`language: en`).
- Requiere acceso al modelo base de Meta y versiones compatibles de Transformers y PEFT; no se incluyen pesos base ni tokenizador.
- La paridad de descarga e inferencia desde el Hub no está garantizada por el autor; solo se verificó localmente el parseo de la configuración del adaptador.
- Licencia llama3.1: se aplican las restricciones de uso del modelo base; revisar `LICENSE`, `NOTICE` y `USE_POLICY.md` antes de cualquier uso comercial.
- No implica afiliación ni respaldo del proveedor del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/Jongwondd/Llama-3.1-8B-Instruct-UL-2ep-6af696c6
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio PEFT: no disponible en la información proporcionada
- Paper o blog del método UL: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
