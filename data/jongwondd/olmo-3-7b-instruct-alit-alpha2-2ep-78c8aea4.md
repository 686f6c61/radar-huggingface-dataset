# Jongwondd/OLMo-3-7B-Instruct-ALiT-alpha2-2ep-78c8aea4

## Resumen

OLMo-3-7B-Instruct-ALiT-alpha2-2ep-78c8aea4 es un adaptador LoRA (no fusionado) entrenado sobre el modelo base allenai/Olmo-3-7B-Instruct, publicado por el usuario Jongwondd en Hugging Face. Se trata de un checkpoint de investigación resultante de un entrenamiento centrado en negación mediante el método ALiT (con hiperparámetro α=2), completado a lo largo de dos épocas sobre el conjunto de datos PopQA de entrenamiento. El adaptador no constituye un modelo autónomo: requiere cargar el modelo base original para poder utilizarse.

El interés del artefacto es acotado y experimental. No se publican resultados de evaluación, benchmarks ni métricas de rendimiento asociadas a esta subida, y el propio autor advierte que se trata de un checkpoint de investigación sin validación de seguridad. El repositorio ocupa 0,2 GB, lo que corresponde únicamente a los pesos del adaptador LoRA y a los ficheros de configuración y procedencia.

La relevancia de esta ficha es, por tanto, documental: sirve para quien necesite reproducir o auditar un experimento de ajuste fino con LoRA sobre OLMo-3 en el dominio de la negación, no para quien busque un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del base OLMo-3-7B-Instruct); adaptador LoRA de rango 16 |
| Parametros totales | No disponible (el adaptador LoRA no declara recuento; el base es de 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion aplicaria al base) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, no fusionado) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) de rango 16 y alpha 32, con dropout 0, inicializado sobre una base fresca de allenai/Olmo-3-7B-Instruct (revision `6e5971d9eba42665f5bd5a0fcf047f299ce1dccc`). El método de entrenamiento es ALiT con α=2, orientado específicamente a tareas de negación. La población de entrenamiento fue PopQA train, con 14.951 pares y 4.534 casos. Se completaron 2 épocas, lo que supone 29.902 ejemplos vistos y 1.872 pasos de optimizador.

El hash SHA-256 del adaptador original es `78c8aea4e65f242afed4e676ed5071bc82adbd82bbce85f281ea67eb59aa9d3b`. El autor indica que los bytes de los pesos no se han modificado: solo se ha hecho portable el localizador del modelo base y la revisión en la configuración PEFT, registrando los hashes original y publicado en `training_provenance.json`. El objetivo específico del método, los ajustes de entrenamiento retenidos, el hash del resumen de fuentes y el hash de los datos de entrenamiento también figuran en ese fichero. El autor aclara que las líneas base SFT/UL/DPO son ejecuciones distintas, no checkpoints ALiT, y que las pérdidas de entrenamiento no son puntuaciones de evaluación.

## Capacidades

- Generación de texto en inglés, heredada del modelo base OLMo-3-7B-Instruct.
- Ajuste específico orientado a tareas de negación (negation), según la metodología ALiT aplicada.
- No se documentan capacidades adicionales propias del adaptador: tool calling, function calling, razonamiento multi-paso, visión o modo thinking no están descritas en la información disponible.
- Multilingüismo limitado: el adaptador declara únicamente inglés.
- Cualquier capacidad del modelo base (chat template, entradas de imagen cuando aplique) debe tomarse del upstream, no de este adaptador.

## Casos de uso

- Investigación sobre negación en modelos de lenguaje: el adaptador permite reproducir y auditar un experimento controlado de ajuste fino orientado a negación sobre OLMo-3, comparando el comportamiento con el base sin adaptar.
- Reproducibilidad de experimentos: los hashes de datos, fuentes y pesos registrados en `training_provenance.json` permiten verificar la procedencia del checkpoint en un contexto de investigación.
- Estudio de métodos de adaptación de bajo rango: con rango 16 y alpha 32, sirve para analizar el impacto de LoRA sobre una base de 7B en una tarea concreta.
- Evaluación de metodologías de ajuste (ALiT frente a SFT/UL/DPO): el autor separa explícitamente estas líneas base, lo que facilita comparaciones metodológicas en entornos de investigación.
- Docencia y formación: útil como ejemplo práctico de carga de un adaptador PEFT con `PeftModel.from_pretrained` y gestión de revisiones del modelo base.
- Auditoría de artefactos publicados: permite estudiar prácticas de publicación de adaptadores (configuración portable, registro de hashes) sin necesidad de infraestructura de inferencia a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica expresamente que esta subida no añade resultados de evaluación y no reclama reproducir cifras del manuscrito; además, advierte que las divisiones de evaluación observadas previamente son datos de desarrollo, no datos de test independientes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador aislado; depende del modelo base OLMo-3-7B-Instruct. Como referencia orientativa no confirmada por la información proporcionada, un modelo de 7B en bfloat16 requiere del orden de 14-16 GB solo para pesos, a lo que se suman caché KV y overhead.
- GPU recomendadas: no disponibles en la información proporcionada. El ejemplo de carga del autor usa `torch_dtype=torch.bfloat16` y `device_map="auto"`, sin especificar GPU.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: el autor documenta carga mediante Transformers y PEFT (`AutoModelForCausalLM` + `PeftModel`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OLMo-3-7B-Instruct-ALiT-alpha2-2ep (este) | Adaptador LoRA sobre base 7B | No disponible | Sin benchmarks publicados | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| allenai/Olmo-3-7B-Instruct (base) | 7B | No disponible en la información proporcionada | No disponible en la información proporcionada | No disponible en la información proporcionada | Hugging Face (modelo upstream) |
| Otras variantes ALiT (SFT/UL/DPO) | Adaptadores sobre el mismo base | No disponible | Sin benchmarks publicados | No disponible | No disponible |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base allenai/Olmo-3-7B-Instruct y versiones compatibles de Transformers y PEFT.
- Checkpoint de investigación sin validación de seguridad: el autor advierte que las salidas pueden ser incorrectas, sesgadas, malformadas o repetitivas.
- Sin resultados de evaluación: no hay evidencia publicada de mejora en tareas de negación ni en otras capacidades.
- Riesgo de alucinación: inherente al modelo base y no cuantificado para este adaptador.
- Idiomas: solo inglés declarado; no se garantiza comportamiento correcto en castellano u otros idiomas.
- Contexto: la longitud de contexto no se especifica y depende del base.
- Uso comercial: la licencia Apache 2.0 se aplica al adaptador, pero el autor remite a la licencia upstream y a las restricciones de uso aplicables (`LICENSE`, `NOTICE`, `USE_POLICY.md`); conviene revisarlas antes de cualquier uso en producción.
- Paridad de inferencia: el autor indica que la carga del adaptador se comprobó localmente, pero no se reclama paridad de descarga/inferencia en el Hub público.
- Procedencia: contiene únicamente actualizaciones de pesos del adaptador, no pesos originales del upstream; no implica afiliación ni respaldo del proveedor del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/Jongwondd/OLMo-3-7B-Instruct-ALiT-alpha2-2ep-78c8aea4
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información proporcionada.
