# kom-raz/kaion-gemma3-4b-lora-r9

## Resumen

Kaion-gemma3-4b-lora-r9 es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario kom-raz en Hugging Face. No se trata de un modelo completo, sino de un conjunto de pesos de adaptacion (0,2 GB en formato safetensors) que debe cargarse sobre el modelo base `unsloth/gemma-3-4b-it`, una version optimizada del Gemma 3 de 4.000 millones de parametros de Google DeepMind. El adaptador se ha entrenado mediante SFT (Supervised Fine-Tuning) usando las librerias TRL y PEFT, segun las etiquetas del repositorio.

El modelo hereda la arquitectura y capacidades del Gemma 3 4B Instruct, un transformer decoder-only multimodal con ventana de contexto de 128.000 tokens, pero la informacion publicada por el autor no documenta que datos de entrenamiento se han usado ni que comportamiento concreto se ha ajustado. La model card es una plantilla sin rellenar, con todos los campos marcados como "[More Information Needed]".

Su relevancia es limitada: se trata de un adaptador de investigacion o experimentacion personal, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin evaluacion publicada. Resulta util unicamente como ejemplo de fine-tuning con Unsloth + TRL sobre Gemma 3, o para quien quiera reproducir el pipeline, pero no es un artefacto recomendable para produccion sin una evaluacion previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer decoder-only (Gemma 3) |
| Parametros totales | no disponible (adaptador de 0,2 GB; el modelo base tiene 4.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el adaptador; el modelo base Gemma 3 4B soporta 128.000 tokens |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; admite fusion y cuantizacion posterior del modelo fusionado) |
| Idiomas soportados | no disponible (heredados del modelo base Gemma 3, multilingue) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con PEFT 0.21.2 y TRL, segun los metadatos del repositorio y las versiones de framework declaradas. El modelo base es `unsloth/gemma-3-4b-it`, una conversion de Gemma 3 4B Instruct realizada con Unsloth, que optimiza el entrenamiento y la inferencia mediante kernels personalizados. Gemma 3 es un transformer decoder-only con atencion por ventanas deslizantes y atencion global intercalada, capacitado para texto e imagen, y con un contexto de 128.000 tokens.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens vistos, la configuracion del LoRA (rango, alpha, modulos objetivo), la tasa de aprendizaje ni si hubo etapas de RLHF o DPO. La etiqueta `sft` indica unicamente aprendizaje supervisado. Tampoco se documenta si el adaptador afecta a las capas de vision del modelo base o solo a las de texto. Cualquier afirmacion sobre el comportamiento resultante seria especulativa.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Gemma 3 4B Instruct.
- Razonamiento y respuesta a instrucciones en formato chat (el modelo base usa plantilla de turnos de usuario/asistente).
- Capacidad multimodal de entrada (texto e imagen) potencialmente heredada del modelo base, aunque no se confirma que el adaptador preserve o modifique esta rama.
- Soporte multilingue heredado del modelo base, sin garantia de que el fine-tuning no haya degradado idiomas distintos del usado en el SFT.
- No se documenta soporte explicito de tool calling, function calling ni modo thinking.
- No se documenta comportamiento agentico ni razonamiento multi-paso especifico del adaptador.

## Casos de uso

- Experimentacion con fine-tuning: servir como referencia reproducible de un pipeline Unsloth + TRL + PEFT sobre Gemma 3 4B para quien quiera montar su propio adaptador con la misma receta.
- Evaluacion comparativa de adaptadores: cargar el LoRA sobre el modelo base y medir la deriva de comportamiento respecto al Gemma 3 4B Instruct original en un conjunto de validacion propio.
- Prototipado de asistentes conversacionales de dominio especifico: si el autor ha ajustado el adaptador a un nicho concreto (no documentado), podria emplearse como punto de partida, siempre tras validacion manual.
- Investigacion sobre olvido catastrofico: comparar las respuestas del modelo fusionado frente al base en tareas generales para medir cuanto conocimiento se ha perdido con el SFT.
- Base para tecnicas de merging: fusionar el adaptador con el modelo base y aplicar DARE, TIES u otras tecnicas de combinacion de pesos para explorar mezclas.
- Docencia y formacion: ejemplo practico de como se estructura un repositorio de adaptador PEFT (configuracion, safetensors, metadatos) para explicar el formato a desarrolladores noveles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa 0,2 GB; para inferencia hay que cargar ademas el modelo base Gemma 3 4B, que en bf16 ocupa aproximadamente 8 GB de VRAM.
- En cuantizacion de 4 bits (GPTQ, AWQ o bitsandbytes NF4) el modelo fusionado cabe en GPU consumer con 6-8 GB de VRAM, como una RTX 3060, RTX 4060 Ti o RTX 4070.
- En bf16 completo requiere al menos 10-12 GB de VRAM para margen de activaciones; encaja en RTX 4080, RTX 4090, A10, L4, A100 o H100.
- El contexto de 128.000 tokens del modelo base dispara el consumo de KV cache; para contextos largos se recomienda FlashAttention 2 o 3 y GPUs con 24 GB o mas (RTX 4090, A100 40 GB, H100).
- Despliegue: el adaptador puede cargarse con `peft` sobre `transformers`, fusionarse con `merge_and_unload()` y servirse con vLLM, TGI, llama.cpp (tras conversion a GGUF) u Ollama.
- No se dispone de datos de latencia ni throughput medidos para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kom-raz/kaion-gemma3-4b-lora-r9 | Adaptador LoRA sobre 4B | Heredado (128k) | no disponible | Hugging Face, 0 descargas | Sin evaluacion publicada |
| google/gemma-3-4b-it | 4B | 128k | Gemma Terms of Use | Hugging Face, ampliamente usado | Modelo base oficial, con benchmarks publicados por Google |
| unsloth/gemma-3-4b-it | 4B | 128k | Gemma Terms of Use | Hugging Face | Conversion optimizada del anterior con Unsloth |
| Adaptadores LoRA de la comunidad sobre Gemma 3 4B | Variable | Heredado | Variable segun autor | Hugging Face | Calidad y documentacion muy heterogeneas |

La comparativa con otros adaptadores LoRA de la comunidad no es posible a nivel de rendimiento porque ninguno de ellos publica, en general, evaluaciones estandarizadas, y este en particular no aporta ninguna.

## Limitaciones y advertencias

- La model card esta vacia: no hay informacion sobre datos de entrenamiento, hiperparametros, intencion del autor ni evaluacion. Usar el modelo sin auditar es arriesgado.
- Licencia no declarada: no se puede asumir uso comercial. Ademas, el modelo base Gemma 3 esta sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribucion que se heredan.
- Riesgo de alucinacion y de sesgos: al no haber evaluacion, no se puede descartar que el SFT haya amplificado sesgos del corpus usado o haya degradado el alineamiento del modelo base.
- Posible olvido catastrofico: el ajuste supervisado sobre un modelo de 4B puede deteriorar capacidades generales (matematicas, codigo, multilingue) si el dataset era pequeno o muy especializado.
- Sin garantia de soporte de tool calling ni de la rama multimodal: el adaptador puede haber sido entrenado solo sobre texto y romper el comportamiento multimodal del base.
- Cero descargas y cero likes: no hay senal de uso ni de validacion por parte de la comunidad.
- Fecha de creacion futura (2026-11-20) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de confiar en el.
- No apto para produccion sin una evaluacion propia exhaustiva en el dominio objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kom-raz/kaion-gemma3-4b-lora-r9
- Modelo base en Hugging Face: https://huggingface.co/unsloth/gemma-3-4b-it
- Modelo base original de Google: https://huggingface.co/google/gemma-3-4b-it
- Paper de PEFT/LoRA: https://arxiv.org/abs/2106.09685
- Paper de TRL/RLHF (referenciado en la model card): https://arxiv.org/abs/1910.09700
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de TRL: https://huggingface.co/docs/trl
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
