# Jongwondd/Gemma-3-27B-IT-UL-2ep-eff4e687

## Resumen

Gemma-3-27B-IT-UL-2ep-eff4e687 es un adaptador LoRA (PEFT) de investigación publicado por el usuario Jongwondd sobre el modelo multimodal google/gemma-3-27b-it. No se trata de un modelo independiente ni de un export fusionado: es un checkpoint final de un entrenamiento de dos épocas orientado a "negation training" (entrenamiento en negación), una técnica experimental que busca modificar cómo el modelo procesa o representa la negación lógica en el lenguaje. El adaptador se distribuye sin los pesos base ni el tokenizador, por lo que requiere descargar el modelo original de Google para poder utilizarse.

El modelo hereda la arquitectura y capacidades del Gemma 3 27B IT multimodal (entrada de imagen y texto, salida de texto), pero el adaptador en sí solo modifica un subconjunto de pesos mediante LoRA con rango 16 y alpha 32. El entrenamiento se realizó sobre el split de entrenamiento de PopQA (14.951 pares / 4.534 casos), un conjunto de preguntas y respuestas de entidad, con 29.902 ejemplos vistos y 1.872 pasos de optimizador.

Su relevancia es acotada y estrictamente investigadora: el autor no publica resultados de evaluación, advierte que los splits observados previamente son datos de desarrollo y no de test independiente, y califica el checkpoint como no validado para producción. Resulta de interés para quienes estudian interpretabilidad, representaciones de la negación o ajuste fino paramétricamente eficiente sobre modelos multimodales grandes, no como modelo listo para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3); adaptador LoRA sobre google/gemma-3-27b-it |
| Parametros totales | no disponible (el adaptador LoRA no declara recuento; el modelo base Gemma 3 27B IT tiene 27B según su denominación) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el modelo base soporta las cuantizaciones habituales de su ecosistema, no detalladas aquí) |
| Idiomas soportados | en (inglés) |
| Licencia | gemma (Gemma Terms of Use; se aplican las restricciones del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, no fusionado) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre google/gemma-3-27b-it, revisión `005ad3404e59d6023443cb575daa05336842228a`, un transformer multimodal de 27B parámetros con entrada image-text-to-text. La modificación consiste en un LoRA de rango 16, alpha 32 y dropout 0, inicializado desde el modelo base ("fresh base"). El pipeline declarado es `image-text-to-text`, por lo que el adaptador se integra en el mismo flujo de procesamiento que el modelo base, incluyendo sus entradas de imagen cuando correspondan.

El entrenamiento corresponde a un run de dos épocas con método "UL" sobre la población de entrenamiento de PopQA: 14.951 pares y 4.534 casos, con 29.902 ejemplos vistos y 1.872 pasos de optimizador. El autor indica que el objetivo específico del método, los hiperparámetros retenidos y los hashes del resumen de fuentes y de los datos de entrenamiento están en `training_provenance.json`. No se documentan en la información disponible detalles sobre composición del dataset más allá de PopQA, ni sobre fases de RLHF o DPO. El autor aclara explícitamente que los baselines SFT/UL/DPO son runs distintos y no checkpoints ALiT, y que las pérdidas de entrenamiento no son puntuaciones de evaluación. Los bytes de los pesos no se han modificado: solo se ha hecho portable el localizador y la revisión del modelo base en la configuración PEFT, con los hashes original y publicado registrados en `training_provenance.json`.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Gemma 3 27B IT, si bien el adaptador está orientado a modificar el tratamiento de la negación y no se aportan evaluaciones que cuantifiquen el efecto.
- Procesamiento multimodal de entrada: el pipeline declarado es image-text-to-text, por lo que acepta imágenes junto con texto como entrada, usando el procesador y la plantilla de chat del modelo base.
- Capacidades multilingües: la model card declara únicamente `en`; no se documenta soporte de otros idiomas para este adaptador.
- Tool calling / function calling: no disponible en la información proporcionada para este adaptador (dependería del modelo base; no se documenta aquí).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, audio, etc.): no disponible en la información proporcionada.
- Naturaleza del artefacto: es un adaptador LoRA de investigación, no un modelo autónomo; requiere cargar el modelo base y aplicar el adaptador con PEFT.

## Casos de uso

- Investigación sobre representaciones de la negación: el adaptador permite comparar, frente al modelo base sin adaptar, cómo cambia el comportamiento del modelo en tareas que requieren interpretar negaciones (por ejemplo, preguntas de entidad de PopQA con formulaciones negativas), usando el mismo pipeline de evaluación en ambos casos.
- Estudios de ajuste fino paramétricamente eficiente: sirve como ejemplo reproducible de un run LoRA de rango 16 sobre un modelo multimodal de 27B, con procedencia documentada (hashes de datos y de configuración) para analizar coste, estabilidad y trazabilidad del entrenamiento.
- Análisis de interpretabilidad mecanística: el autor indica que los experimentos mecanísticos son separados de esta release; el adaptador puede emplearse como punto de partida para estudiar qué componentes del modelo base se ven afectados por el entrenamiento en negación.
- Reproducibilidad de experimentos académicos: al incluir `training_provenance.json` con el objetivo del método y los hashes de datos y fuentes, facilita la verificación de experimentos en entornos de investigación con acceso al modelo base.
- Evaluación comparativa de adaptadores: útil para montar pipelines que carguen el base y distintos adaptadores (SFT, UL, DPO) y midan diferencias en tareas controladas, teniendo en cuenta que los splits previos son datos de desarrollo.
- Docencia y formación en PEFT: como ejemplo práctico de carga de un adaptador con `PeftModel.from_pretrained` sobre `Gemma3ForConditionalGeneration`, incluyendo la gestión de revisión fija del modelo base y del dtype bfloat16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que esta subida no añade resultados de evaluación, que no reclama reproducir las cifras del manuscrito y que las puntuaciones proxy basadas en reglas, cuando se reportan en otro lugar, no son precisión de un juez semántico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia, el adaptador se aplica sobre un modelo base de 27B parámetros; el requisito vendrá determinado por el modelo base y su cuantización, no por el adaptador (0,5 GB de repositorio).
- GPU recomendadas: no disponible en la información proporcionada; dependerá del modelo base y de la cuantización elegida.
- ¿Cabe en GPU de consumo?: no disponible en la información proporcionada para este adaptador; condicionado al modelo base.
- Opciones de despliegue: la model card documenta la carga mediante Transformers (`Gemma3ForConditionalGeneration`) y PEFT (`PeftModel.from_pretrained`) con `torch_dtype=torch.bfloat16` y `device_map="auto"`. No se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) para este adaptador.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jongwondd/Gemma-3-27B-IT-UL-2ep-eff4e687 | Adaptador LoRA sobre base 27B (rango 16, alpha 32) | no disponible | Adaptador PEFT de investigación (negación) | gemma | Hugging Face, 0 descargas, 0 likes |
| google/gemma-3-27b-it | 27B | no disponible en la información proporcionada | Modelo base multimodal image-text-to-text | gemma | Hugging Face (modelo base referenciado) |
| Otros adaptadores del mismo autor (SFT/UL/DPO) | no disponible | no disponible | Adaptadores PEFT de investigación | gemma | Mencionados como runs distintos, no incluidos en esta ficha |

No se dispone de información sobre modelos comparables de la misma categoría (adaptadores de negación sobre modelos multimodales de 27B) en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo independiente: requiere el modelo base google/gemma-3-27b-it (revisión fija) y versiones compatibles de Transformers y PEFT; la release no incluye pesos ni tokenizadores del modelo base.
- Sin evaluación publicada: el autor no añade resultados de evaluación y no reclama reproducir las cifras del manuscrito; los splits observados previamente son datos de desarrollo, no test independiente.
- Riesgo de salidas incorrectas: el autor advierte que es un checkpoint de investigación no validado para seguridad en producción y que las salidas pueden ser incorrectas, sesgadas, malformadas o repetitivas.
- Sesgos: no se documentan sesgos específicos de este adaptador; al heredar el modelo base, arrastra los sesgos de este, no detallados en la información disponible.
- Riesgo de alucinación: no cuantificado; aplica el riesgo general del modelo base, agravado por la ausencia de validación de este checkpoint.
- Limitaciones de idioma: la model card declara únicamente inglés (`en`).
- Restricciones de licencia: se aplican la licencia y las restricciones de uso del modelo base (Gemma Terms of Use), incluidas las condiciones de uso comercial del upstream; deben revisarse `LICENSE`, `NOTICE` y `USE_POLICY.md`.
- Paridad no garantizada: el autor indica que la paridad de descarga e inferencia en el Hub público no está reclamada; solo se verificó localmente el parseo de la configuración del adaptador.
- Trazabilidad: los hashes de configuración original y publicada, así como los del resumen de fuentes y de los datos de entrenamiento, están en `training_provenance.json`; conviene verificarlos antes de reutilizar el adaptador en experimentos.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Jongwondd/Gemma-3-27B-IT-UL-2ep-eff4e687
- Modelo base: https://huggingface.co/google/gemma-3-27b-it
- Revisión del modelo base referenciada: `005ad3404e59d6023443cb575daa05336842228a`
- Repositorio del autor en Hugging Face: https://huggingface.co/Jongwondd
- Paper, blog o demo del método: no disponible en la información proporcionada.
