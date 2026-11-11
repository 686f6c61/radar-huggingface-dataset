# Jongwondd/Gemma-3-4B-IT-UL-2ep-0bd9744f

## Resumen

Gemma-3-4B-IT-UL-2ep-0bd9744f es un adaptador LoRA (PEFT) sobre el modelo multimodal `google/gemma-3-4b-it` de Google, publicado por el usuario Jongwondd. No se trata de un modelo autónomo, sino de un conjunto de pesos de adaptación que deben cargarse sobre el modelo base original. El adaptador se ha entrenado con el método que el autor denomina "UL" partiendo de una inicialización limpia del modelo base, con un objetivo orientado al entrenamiento en negación ("negation-training"), y forma parte de un trabajo de investigación sobre el que se comparan ejecuciones SFT, UL y DPO como líneas de trabajo distintas.

El entrenamiento se completó durante dos épocas sobre un subconjunto de PopQA (14.951 pares / 4.534 casos), con 29.902 ejemplos vistos y 1.872 pasos de optimizador. El adaptador tiene rango LoRA 16, alpha 32 y dropout 0. El repositorio ocupa 0,1 GB y contiene únicamente los pesos del adaptador y metadatos de procedencia, no los pesos del modelo base ni el tokenizador.

La relevancia de esta ficha es acotada: se trata de un checkpoint de investigación sin resultados de evaluación publicados, con 0 descargas y 0 "likes" en el momento de la consulta, y cuyo interés principal es documental para quienes investigan adaptaciones de bajo rango sobre Gemma 3 en tareas de negación. No debe considerarse un modelo validado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer multimodal `google/gemma-3-4b-it` |
| Parametros totales | No disponible (el adaptador tiene rango 16; los parámetros del modelo base no se declaran en la información) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; no declarada en la información) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantización depende del modelo base y de la pila de carga) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Gemma (licencia del modelo base; se aplican sus restricciones de uso) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en bfloat16 para la carga de referencia |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-3-4b-it`, revisión `093f9f388b31de276ce2de164bdc2081324b9767`, un modelo multimodal de tipo image-text-to-text. La arquitectura subyacente es, por tanto, la del modelo base de Google (transformer multimodal con torre de visión y decodificador de lenguaje), aunque la información proporcionada no detalla su configuración interna. El adaptador en sí es un LoRA de rango 16, alpha 32 y dropout 0, inicializado desde el modelo base limpio y entrenado con el método "UL" del autor.

El entrenamiento se realizó sobre PopQA (conjunto de entrenamiento), con 14.951 pares y 4.534 casos, durante 2 épocas completas: 29.902 ejemplos vistos y 1.872 pasos de optimizador. El autor indica que los objetivos específicos del método, los hiperparámetros retenidos, el hash del resumen de fuentes y el hash de los datos de entrenamiento están en `training_provenance.json`. Los bytes de los pesos no se han modificado respecto al adaptador original (SHA-256 `0bd9744f...`); solo se ha hecho portable el localizador del modelo base y su revisión en la configuración PEFT. Las pérdidas de entrenamiento no se presentan como puntuaciones de evaluación.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Gemma 3 4B IT (no verificadas de forma independiente para este adaptador).
- Procesamiento de entradas imagen-texto (`image-text-to-text`), ya que el modelo base es multimodal y la carga de referencia usa `Gemma3ForConditionalGeneration`.
- Entrenamiento específico orientado a negación ("negation"), según la etiqueta y la descripción del autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo se declara inglés (`en`).
- Modo "thinking", audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre adaptación LoRA en tareas de negación: el adaptador sirve como artefacto reproducible para estudiar cómo un LoRA de rango 16 modifica el comportamiento del modelo base en pares de negación, partiendo de los datos de PopQA y de la procedencia documentada.
- Reproducción de experimentos comparativos SFT/UL/DPO: el autor indica que estas son ejecuciones distintas, por lo que el adaptador puede usarse como una de las ramas de comparación en un estudio controlado.
- Análisis de mecánica interna ("mechanistic experiments"): el autor señala que los experimentos mecanicistas son separados de esta release, de modo que el adaptador puede emplearse como punto de partida para análisis de activaciones o intervenciones sobre el modelo base.
- Evaluación de robustez ante negación en pipelines de extracción de información: útil para medir si el adaptador altera la tasa de respuestas correctas cuando la consulta contiene negaciones, siempre con un conjunto de test independiente.
- Docencia y formación en PEFT: por su tamaño reducido (0,1 GB) y su configuración de carga explícita, resulta adecuado como ejemplo práctico de carga de adaptadores LoRA sobre modelos multimodales con `transformers` y `peft`.
- Auditoría de procedencia de artefactos: el repositorio incluye `training_provenance.json` con hashes de datos y configuración, lo que permite verificar la cadena de custodia del adaptador en un contexto de investigación reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que esta subida no añade resultados de evaluación, que los splits de evaluación observados previamente son datos de desarrollo y no datos de test independientes, y que las puntuaciones proxy basadas en reglas no son exactitud de juez semántico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Depende del modelo base Gemma 3 4B IT y del tipo de cuantización empleado; el adaptador en sí ocupa 0,1 GB.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: la carga de referencia usa `transformers` (`Gemma3ForConditionalGeneration`) con `peft` (`PeftModel.from_pretrained`), `torch_dtype=torch.bfloat16` y `device_map="auto"`. No se documentan otras opciones (vLLM, llama.cpp, Ollama, TGI) para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma-3-4B-IT-UL-2ep-0bd9744f (este) | Adaptador LoRA sobre Gemma 3 4B IT | No disponible (rango 16) | No disponible | Gemma | Público en Hugging Face, 0 descargas |
| google/gemma-3-4b-it | Modelo base multimodal | No disponible en la información | No disponible | Gemma | Público en Hugging Face |
| Otras ejecuciones SFT/UL/DPO del mismo autor | Adaptadores LoRA comparables | No disponible | No disponible | Gemma | No disponible en la información |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un checkpoint de investigación, no un modelo validado para seguridad ni para producción; el autor advierte que las salidas pueden ser incorrectas, sesgadas, malformadas o repetitivas.
- No incluye los pesos del modelo base ni el tokenizador; requiere acceso al modelo `google/gemma-3-4b-it` en la revisión indicada y versiones compatibles de Transformers y PEFT.
- No se declaran resultados de evaluación y no se reclama la reproducción de las cifras del manuscrito asociado.
- Los splits de evaluación observados previamente son datos de desarrollo, no datos de test independientes.
- Las puntuaciones proxy basadas en reglas no equivalen a exactitud de juez semántico.
- Solo se declara soporte de inglés; no hay evidencia de comportamiento multilingüe para este adaptador.
- La licencia Gemma del modelo base impone sus restricciones de uso; deben consultarse `LICENSE`, `NOTICE` y `USE_POLICY.md`. El adaptador contiene pesos afinados, no los pesos originales del modelo base.
- No se implica afiliación ni respaldo por parte del proveedor del modelo base.
- La paridad de descarga e inferencia desde el Hub público no está garantizada por el autor; solo se comprobó localmente el análisis de la configuración del adaptador.
- Riesgo de alucinación y sesgos: no cuantificado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jongwondd/Gemma-3-4B-IT-UL-2ep-0bd9744f
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Revisión del modelo base citada: `093f9f388b31de276ce2de164bdc2081324b9767`
- Metadatos de procedencia: `training_provenance.json` (incluido en el repositorio del adaptador)
- Licencia y avisos: `LICENSE`, `NOTICE`, `USE_POLICY.md` (incluidos en el repositorio del adaptador)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
