# bhismaperkasa/gemma-4-E4B-it-stensil-id

## Resumen

Gemma 4 E4B-it-stensil-id es un adaptador LoRA para el modelo `unsloth/gemma-4-E4B-it`, desarrollado por el usuario de Hugging Face bhismaperkasa. Se trata de un fine-tune especializado en la generación de relatos eróticos ("cerita stensil") en indonesio, entrenado sobre 250 historias para adultos escritas en primera persona, con lenguaje explícito y una convención de cierre fija mediante el token `TAMAT` al final de cada texto. El adaptador se distribuye tanto en formato PEFT (safetensors) como en GGUF ya fusionado y cuantizado, lo que permite ejecutarlo en llama.cpp, LM Studio, PocketPal o ChatterUI.

El modelo hereda la arquitectura del Gemma 4 E4B-it de Google, un transformer con aproximadamente 7.500 millones de parámetros (7.518.069.290 según los safetensors del repositorio). El adaptador LoRA emplea rango 16 y alpha 16, un ajuste ligero que modifica el estilo y el registro del modelo base sin reentrenar los pesos completos. La relevancia de esta ficha es doble: por un lado documenta un caso de especialización creativa muy concreta sobre un modelo abierto; por otro, sirve de ejemplo de las implicaciones éticas y de licencia que conlleva publicar derivados de Gemma con contenido para adultos.

El repositorio tiene un tamaño de 14,5 GB, incluye los pesos del adaptador, los GGUF cuantizados en Q4_K_M y Q8_0 (este último pensado para equipos de escritorio) y un archivo `mmproj.gguf` para entrada de imágenes. La licencia no figura en los metadatos de Hugging Face, pero la model card remite explícitamente a los Gemma Terms of Use. El modelo es de nicho, con cero descargas y cero likes en el momento de la consulta, y su uso previsto está restringido a texto para adultos en indonesio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B) con adaptador LoRA (r=16, alpha=16) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (GGUF); adaptador en safetensors sin cuantizar |
| Idiomas soportados | Indonesio (id); el modelo base es multilingüe, pero el fine-tune está orientado a id |
| Licencia | no disponible en metadatos; la model card remite a Gemma Terms of Use |
| Formato de pesos | safetensors (adaptador PEFT), GGUF (Q4_K_M, Q8_0, mmproj) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `unsloth/gemma-4-E4B-it`, una versión del Gemma 4 E4B-it distribuida por Unsloth para facilitar el fine-tune. La arquitectura subyacente es un transformer decoder-only de unos 7.500 millones de parámetros; la información disponible no detalla si incorpora atención lineal, mezcla de expertos u otras innovaciones del modelo base. El adaptador LoRA tiene rango 16 y alpha 16, configuración habitual para ajustes de estilo que buscan preservar el conocimiento general del modelo base mientras se modifica el registro de salida.

El entrenamiento se realizó sobre un corpus de 250 relatos para adultos en indonesio, escritos en primera persona, con lenguaje explícito y sin censura, y con la particularidad de que todos los textos terminan con la palabra `TAMAT` en la última línea. No se especifica el número de tokens, la composición exacta del dataset, la presencia de RLHF o DPO, ni la duración del entrenamiento. El autor indica que el adaptador se fusionó con el modelo base y se cuantizó a GGUF para su despliegue en dispositivos móviles (Q4_K_M, para 8-12 GB de RAM) y en equipos de escritorio (Q8_0).

## Capacidades

- Generación de texto creativo en indonesio, con especialización en relatos eróticos en primera persona y registro coloquial.
- Mantenimiento de una convención de formato fija: cierre con `TAMAT` en la última línea, un solo escenario principal y nombres de personajes consistentes.
- Capacidad de seguir un system prompt detallado que fija el rol de escritor, el punto de vista y las restricciones de contenido.
- Entrada de imágenes a través del archivo `mmproj.gguf`, heredada del modelo base multimodal; no es necesaria para el uso textual.
- Conversación multi-turno (etiqueta `conversational` en los metadatos), aunque el fine-tune está orientado a la generación de relatos más que al diálogo.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso.
- No se documenta modo de razonamiento explícito (thinking mode) ni capacidades de audio.

## Casos de uso

- Generación de relatos para adultos en indonesio: el adaptador está entrenado específicamente para producir historias en primera persona con un formato fijo, por lo que es adecuado para plataformas de ficción serializada que necesiten contenido en ese idioma y registro.
- Prototipado de asistentes creativos con estilo controlado: el system prompt del autor permite fijar el rol, el punto de vista y las restricciones, útil para experimentar con plantillas de generación creativa.
- Despliegue en dispositivos móviles: los GGUF Q4_K_M están pensados para 8-12 GB de RAM, lo que permite ejecutar el modelo en un teléfono mediante PocketPal o ChatterUI sin conexión.
- Pruebas de cuantización y despliegue local: el repositorio incluye Q4_K_M y Q8_0, lo que facilita comparar calidad y rendimiento entre niveles de cuantización en llama.cpp o LM Studio.
- Investigación sobre especialización con LoRA: el adaptador (r=16, alpha=16) sobre un corpus pequeño y homogéneo es un caso de estudio útil para analizar cómo un fine-tune ligero desplaza el estilo del modelo base.
- Evaluación de salvaguardas y filtrado de contenido: al ser un modelo explícitamente orientado a contenido para adultos, sirve para probar clasificadores y políticas de moderación en pipelines de generación.
- Generación de texto multimodal básica: el archivo `mmproj.gguf` permite experimentar con entrada de imágenes combinada con texto, aunque el fine-tune no está orientado a esa tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa, un modelo de 7.500 millones de parámetros en FP16 requiere aproximadamente 15 GB, en Q8_0 alrededor de 8 GB y en Q4_K_M alrededor de 4,5-5 GB, sin contar el contexto.
- GPU recomendadas: no especificadas por el autor; para FP16 se necesitaría una GPU con 16 GB o más (RTX 4080/4090, A100, H100); para Q8_0 bastaría una GPU de 8-12 GB.
- Compatibilidad con GPU de consumo: el autor indica que Q4_K_M está pensado para móviles con 8-12 GB de RAM y Q8_0 para portátiles o equipos de escritorio, lo que sugiere que cabe en GPU de consumo con suficiente VRAM.
- Opciones de despliegue: llama.cpp, LM Studio, PocketPal, ChatterUI (según la model card); el adaptador PEFT puede cargarse con la librería `peft` sobre el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gemma-4-E4B-it-stensil-id | 7.518.069.290 | no disponible | Gemma Terms of Use (según model card) | Hugging Face (PEFT + GGUF) | Fine-tune LoRA para relatos en indonesio |
| unsloth/gemma-4-E4B-it | no disponible | no disponible | Gemma Terms of Use | Hugging Face | Modelo base sin especializar |
| Gemma 4 E4B-it (original de Google) | no disponible | no disponible | Gemma Terms of Use | Hugging Face / Google | Modelo base multimodal original |

No se dispone de datos de benchmarks ni de modelos comparables de la misma categoría (fine-tunes de ficción para adultos en indonesio) en la información proporcionada.

## Limitaciones y advertencias

- Contenido para adultos: el modelo está entrenado para generar material sexual explícito; no es adecuado para menores ni para entornos sin control de acceso.
- Sesgos: el corpus de entrenamiento es muy reducido (250 relatos) y homogéneo, lo que puede producir una diversidad limitada de tramas, personajes y registros, y reproducir sesgos presentes en los textos originales.
- Alucinación: como cualquier modelo generativo, puede inventar detalles incoherentes; el formato fijo con `TAMAT` no garantiza coherencia narrativa.
- Limitaciones de idioma: el fine-tune está orientado al indonesio; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea inferior.
- Restricciones de licencia: la licencia no figura en los metadatos de Hugging Face; la model card remite a los Gemma Terms of Use, que imponen condiciones de uso, atribución y restricciones para uso comercial que deben revisarse antes de cualquier despliegue.
- Caveats para producción: el repositorio tiene cero descargas y cero likes, no hay benchmarks publicados y el autor no documenta el proceso de evaluación; no se recomienda su uso en producción sin una validación propia.
- El archivo `mmproj.gguf` solo es necesario para entrada de imágenes; no debe confundirse con un requisito para el uso textual.

## Enlaces

- Hugging Face: https://huggingface.co/bhismaperkasa/gemma-4-E4B-it-stensil-id
- Modelo base: https://huggingface.co/unsloth/gemma-4-E4B-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
