# Jongwondd/Gemma-3-4B-IT-SFT-2ep-1596633a

## Resumen

Gemma-3-4B-IT-SFT-2ep-1596633a es un adaptador LoRA (PEFT) entrenado mediante SFT sobre el modelo multimodal google/gemma-3-4b-it, revision `093f9f388b31de276ce2de164bdc2081324b9767`. Lo publica el usuario Jongwondd y forma parte de una linea de investigacion centrada en entrenamiento de negacion (negation training), tal como indican las etiquetas `negation`, `research` y `sft`. No es un modelo base independiente, ni un checkpoint intermedio, ni una exportacion fusionada (merged): es el adaptador final de una ejecucion completa de dos epocas.

El adaptador parte de inicializacion fresca sobre el modelo base, sin continuar de otros adaptadores, y se ha entrenado sobre PopQA train con 14.951 pares correspondientes a 4.534 casos. En total se han procesado 29.902 ejemplos y 1.890 pasos de optimizador. El rango LoRA es 16, alpha 32 y dropout 0, con el SHA-256 original del adaptador registrado en la model card.

Su relevancia ahora es acotada y experimental: se trata de un artefacto de investigacion para estudiar el efecto del SFT en tareas de negacion sobre un modelo multimodal de 4B parametros, no de un modelo orientado a produccion. La model card declara explicitamente que no aporta resultados de evaluacion nuevos, que las particiones de evaluacion observadas previamente son datos de desarrollo y que no se reclama paridad de inferencia entre el Hub publico y el entorno local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer multimodal decoder-only (Gemma 3) |
| Parametros totales | No disponible para el adaptador; modelo base google/gemma-3-4b-it (4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles (`en`) |
| Licencia | gemma |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16, alpha 32 y dropout 0 aplicado sobre google/gemma-3-4b-it, un transformer multimodal con pipeline `image-text-to-text`. No se modifican los pesos originales del modelo base: el repositorio contiene unicamente las actualizaciones de pesos del adaptador. El entrenamiento es SFT con inicializacion fresca sobre el modelo base, dos epocas completas, 29.902 ejemplos vistos y 1.890 pasos de optimizador, sobre PopQA train (14.951 pares / 4.534 casos).

La model card indica que los bytes de los pesos no han cambiado respecto del adaptador original (SHA-256 `1596633aea3fd8a4f3dd55d48528bef84edca69234aaead0616924d26f1d56e7`). Solo se ha hecho portable el localizador del modelo base y la revision en la configuracion PEFT; los hashes de configuracion original y publicada quedan registrados en `training_provenance.json`, junto con el objetivo especifico del metodo, los ajustes de entrenamiento retenidos, el hash del resumen de fuentes y el hash de los datos de entrenamiento. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, attention linear, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto condicionada por imagen y texto, heredada del modelo base multimodal Gemma 3 4B IT.
- Razonamiento y respuesta a instrucciones a traves del adaptador SFT, orientado experimentalmente a tareas de negacion.
- Entrada multimodal: el pipeline declarado es `image-text-to-text`, por lo que admite imagenes junto con texto cuando se usa el processor del modelo base.
- Uso del tokenizer, processor y chat template del modelo base; el adaptador no incluye tokenizer ni pesos originales.
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma del repositorio.
- No se documentan capacidades de tool calling, function calling, agentes, audio o modo thinking en la informacion proporcionada.

## Casos de uso

- Investigacion sobre negacion: usar el adaptador para reproducir y analizar el efecto del SFT de dos epocas sobre tareas de negacion en Gemma 3 4B IT, comparando con las lineas base SFT/UL/DPO citadas en la model card.
- Estudio de adaptadores LoRA: cargar el adaptador con PEFT sobre el modelo base para inspeccionar el comportamiento de un rango 16 / alpha 32 entrenado con dropout 0 en un entorno controlado.
- Analisis de procedencia y reproducibilidad: utilizar `training_provenance.json` para auditar hashes de datos, configuracion y pesos del adaptador en un flujo de investigacion.
- Evaluacion de robustez multimodal: probar el adaptador con entradas image-text-to-text usando el processor del modelo base para observar si el SFT afecta respuestas condicionadas por imagenes.
- Experimentos de comparacion de checkpoints: contrastar este adaptador final con otras ejecuciones de la misma linea (SFT/UL/DPO) para estudiar diferencias de comportamiento, teniendo en cuenta que son ejecuciones distintas y no checkpoints ALiT.
- Docencia y prototipado de PEFT: servir como ejemplo practico de carga de un adaptador LoRA con `PeftModel.from_pretrained` sobre un modelo multimodal de 4B en entornos de laboratorio.
- Pruebas de integracion de pipelines de investigacion: validar el parseo de configuracion del adaptador en herramientas internas, sabiendo que la model card no reclama paridad de inferencia publica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que esta subida no anade resultados de evaluacion, que las particiones de evaluacion observadas previamente son datos de desarrollo y no datos de test independientes, y que las puntuaciones proxy basadas en reglas, cuando se reportan en otro lugar, no equivalen a exactitud de juez semantico. Las perdidas de entrenamiento no son puntuaciones de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base google/gemma-3-4b-it (4B) y de la precision usada (la model card sugiere `torch_dtype=torch.bfloat16`).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: carga mediante Transformers (`Gemma3ForConditionalGeneration`) combinada con PEFT (`PeftModel.from_pretrained`), con `device_map="auto"`. No se documentan vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jongwondd/Gemma-3-4B-IT-SFT-2ep-1596633a | Adaptador LoRA sobre base 4B | No disponible | Sin benchmarks publicados | gemma | Hugging Face, 0 descargas |
| google/gemma-3-4b-it | 4B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | gemma | Hugging Face (modelo base oficial) |
| Otras ejecuciones SFT/UL/DPO de la misma linea | No disponible | No disponible | No disponible | No disponible | Citadas como ejecuciones distintas, no checkpoints ALiT |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Es un checkpoint de investigacion, no un modelo validado para seguridad ni para produccion; las salidas pueden ser incorrectas, sesgadas, malformadas o repetitivas.
- No es un modelo base independiente ni una exportacion fusionada: requiere cargar google/gemma-3-4b-it por separado, con acceso al modelo base cuando sea necesario.
- No incluye pesos originales del modelo base ni tokenizer; hay que usar el tokenizer, processor y chat template upstream.
- La model card no reclama paridad de inferencia entre la descarga publica del Hub y el entorno local; solo se verifico localmente el parseo de la configuracion del adaptador.
- Las particiones de evaluacion observadas previamente son datos de desarrollo, no test independiente; no hay resultados de evaluacion nuevos en esta subida.
- Las perdidas de entrenamiento no deben interpretarse como puntuaciones de evaluacion.
- Los experimentos mecanicistas asociados estan separados de esta release y pueden estar incompletos.
- Idioma limitado al ingles segun la etiqueta del repositorio.
- Sujeto a la licencia `gemma` y a las restricciones de uso aplicables del modelo base; consultar `LICENSE`, `NOTICE` y `USE_POLICY.md`. No implica afiliacion ni respaldo del proveedor del modelo base.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada mas alla del aviso generico de salidas incorrectas o sesgadas.

## Enlaces

- Hugging Face: https://huggingface.co/Jongwondd/Gemma-3-4B-IT-SFT-2ep-1596633a
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Repositorio del autor: https://huggingface.co/Jongwondd
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
