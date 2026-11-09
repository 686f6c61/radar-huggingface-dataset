# Eskrers/gemma4-e4b-uranium-lora

## Resumen

Eskrers/gemma4-e4b-uranium-lora es un adaptador LoRA (Low-Rank Adaptation) publicado en Hugging Face por el usuario Eskrers. No se trata de un modelo completo, sino de un conjunto de pesos de ajuste fino que debe combinarse con su modelo base, `DavidAU/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking`, una variante comunitaria del Gemma 4 E4B de Google. El adaptador se ha entrenado con la técnica SFT (supervised fine-tuning) usando las librerías TRL y Unsloth, y se distribuye en formato safetensors bajo el framework PEFT.

La relevancia de esta ficha es limitada: el repositorio no incluye model card sustantiva (es la plantilla por defecto de Hugging Face con todos los campos marcados como "More Information Needed"), no declara licencia, no especifica idiomas ni datos de entrenamiento, y en el momento de la consulta registra 0 descargas y 0 likes. El tamaño del repositorio (0,2 GB) es coherente con un adaptador LoRA de rango bajo sobre un modelo de aproximadamente 4,4 mil millones de parámetros.

Por tanto, esta ficha documenta lo que se puede verificar objetivamente a partir de los metadatos y del modelo base referenciado, e indica explícitamente "no disponible" en todos aquellos apartados que el autor no ha cubierto. Cualquier evaluación de calidad, rendimiento o idoneidad para producción requeriría pruebas empíricas por parte del usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer decoder-only (modelo base Gemma 4 E4B) |
| Parámetros totales | no disponible (adaptador LoRA; el modelo base tiene aproximadamente 4,4B según gemma4.dev) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información del adaptador; el modelo base Gemma 4 E4B se describe como multimodal con Thinking Mode, pero no se especifica la ventana exacta |
| Tipos de cuantización | no disponible (el adaptador se publica en safetensors; la cuantización aplicaría al modelo base fusionado) |
| Idiomas soportados | no disponibles (el repositorio hermano `gemma-uranium-lora` etiqueta "English") |
| Licencia | no disponible (el repositorio hermano `gemma-uranium-lora` declara apache-2.0; el modelo base comunitario puede tener condiciones distintas) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. La arquitectura subyacente corresponde al modelo base `DavidAU/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking`, que a su vez deriva de Gemma 4 E4B de Google: un transformer decoder-only de aproximadamente 4,4 mil millones de parámetros con capacidades multimodales de entrada y un modo de razonamiento ("Thinking Mode") según la documentación de gemma4.dev. El adaptador modifica un subconjunto de matrices del modelo base mediante descomposición de bajo rango.

El entrenamiento se realizó con SFT (supervised fine-tuning) empleando TRL y Unsloth, según las etiquetas del repositorio. No se especifican el número de tokens de entrenamiento, la composición del dataset, la presencia de RLHF/DPO, el rango del LoRA, el alpha, el dropout ni los hiperparámetros de entrenamiento. La model card no aporta ninguna de estas cifras. La única referencia técnica concreta es la versión de PEFT utilizada (0.21.0) y el enlace al paper de Lacoste et al. (2019) sobre impacto ambiental, que aparece en la plantilla estándar y no implica que se haya realizado dicho cálculo.

## Capacidades

- Generación de texto conversacional: heredada del modelo base Gemma 4 E4B, orientada a diálogo multi-turno.
- Razonamiento en modo "Thinking": el modelo base incorpora un modo de razonamiento explícito según la documentación del modelo original.
- Entrada multimodal: el modelo base Gemma 4 E4B acepta entrada multimodal según gemma4.dev; el adaptador LoRA no altera esta capacidad, pero tampoco la garantiza tras el ajuste.
- Tool calling / function calling: no documentado en el adaptador; depende de las capacidades del modelo base, no verificadas en esta información.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas para este adaptador; el repositorio hermano del mismo autor etiqueta únicamente inglés.
- Capacidades especiales: el nombre del modelo base incluye "UNCENSORED" y "Thinking", lo que sugiere un ajuste orientado a reducir rechazos y preservar el modo de razonamiento, pero no hay documentación técnica que lo respalde.

## Casos de uso

- Experimentación con ajuste fino de bajo coste: el adaptador, de solo 0,2 GB, permite probar variantes de comportamiento sobre Gemma 4 E4B sin reentrenar el modelo completo; útil para investigadores que quieran iterar sobre estilos de respuesta.
- Prototipado de asistentes conversacionales en local: combinado con el modelo base en una GPU de consumo, permite desplegar un chatbot de aproximadamente 4,4B parámetros con un estilo ajustado específicamente por el autor.
- Evaluación de técnicas SFT con Unsloth y TRL: sirve como ejemplo práctico de un pipeline de fine-tuning LoRA reproducible para quienes estudien estas herramientas.
- Investigación sobre alineación y censura: dado el nombre del modelo base ("UNCENSORED"), puede emplearse en estudios comparativos sobre comportamiento de rechazo y sesgos en modelos ajustados comunitariamente.
- Base para fusiones y experimentos posteriores: al ser un adaptador PEFT, puede fusionarse con el modelo base o combinarse con otros adaptadores para explorar mezclas de comportamiento.
- Docencia y formación: como ejemplo didáctico de publicación de un adaptador LoRA con PEFT, incluyendo sus limitaciones de documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; el modelo base Gemma 4 E4B requiere un mínimo de 8 GB de VRAM según gemma4.dev.
- GPU recomendadas: no especificadas por el autor; por el tamaño del modelo base (aproximadamente 4,4B), cabría en RTX 4090, RTX 4080, RTX 3090 y GPUs de datacenter como A100 o H100 con holgura.
- GPU de consumo: sí, según la documentación del modelo base (8 GB de VRAM mínimos), lo que incluye tarjetas de gama media-alta recientes.
- Opciones de despliegue: el adaptador se distribuye para PEFT; el despliegue típico requeriría cargar el modelo base con Transformers y aplicar el adaptador, o fusionarlo y exportarlo a GGUF para llama.cpp/Ollama. vLLM y TGI son compatibles con adaptadores LoRA, pero no hay configuración documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Eskrers/gemma4-e4b-uranium-lora | Adaptador LoRA sobre ~4,4B | no disponible | no disponible | Hugging Face, 0 descargas | Sin model card sustantiva |
| Eskrers/gemma-uranium-lora | Adaptador LoRA (modelo base no especificado en la información) | no disponible | apache-2.0 | Hugging Face | Repositorio hermano del mismo autor, etiquetado en inglés |
| Gemma 4 E4B (Google) | ~4,4B | no disponible en la información | no disponible en la información | Modelo oficial de Google | Modelo base original, multimodal y con Thinking Mode |
| DavidAU/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking | ~4,4B | no disponible | no disponible | Hugging Face | Modelo base comunitario del adaptador, con ajuste "uncensored" |

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla por defecto; no hay información sobre datos, hiperparámetros, evaluación ni uso previsto.
- Licencia no declarada: no se puede asumir uso comercial permitido; el modelo base comunitario puede imponer restricciones adicionales a las de Gemma.
- Riesgo de alucinación: no evaluado; al ser un ajuste SFT sobre un modelo comunitario "uncensored", la fiabilidad factual no está garantizada.
- Sesgos: no documentados; el ajuste "uncensored" del modelo base puede reducir salvaguardas y aumentar la probabilidad de contenido sesgado o inapropiado.
- Idiomas: no especificados; el repositorio hermano del autor solo etiqueta inglés, por lo que el soporte de castellano es incierto.
- Contexto: no se especifica la ventana efectiva del adaptador ni si el ajuste preserva la longitud de contexto del modelo base.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; sin evidencia de uso en producción ni de validación por terceros.
- Reproducibilidad: al no indicarse el rango, alpha ni dataset, no es posible reproducir el entrenamiento ni auditar su comportamiento.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/Eskrers/gemma4-e4b-uranium-lora
- Repositorio hermano del mismo autor: https://huggingface.co/Eskrers/gemma-uranium-lora
- Modelo base: https://huggingface.co/DavidAU/gemma-4-E4B-it-The-DECKARD-Expresso-Universe-HERETIC-UNCENSORED-Thinking
- Documentación del modelo Gemma 4 E4B: https://gemma4.dev/models/gemma-4-e4b
- Paper de impacto ambiental citado en la plantilla (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora ML Impact: https://mlco2.github.io/impact#compute
