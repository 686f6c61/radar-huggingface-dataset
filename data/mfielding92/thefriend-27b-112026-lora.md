# mfielding92/thefriend-27b-112026-lora

## Resumen

`mfielding92/thefriend-27b-112026-lora` es un adaptador LoRA de ajuste fino (fine-tuning) publicado en Hugging Face por el usuario mfielding92. Se ha entrenado sobre el modelo base `mfielding92/thefriend-27b-110626-v3-qvo`, que a su vez pertenece a la familia Qwen 3.5 segun la etiqueta `qwen3_5` de la model card. El repositorio contiene unicamente los pesos del adaptador (1,4 GB), no el modelo completo, por lo que requiere cargar el modelo base para su uso.

El modelo se presenta como un ajuste orientado a generacion de texto en ingles, entrenado con la libreria Unsloth y el stack TRL/Transformers. La model card es minima: no documenta el dataset de entrenamiento, el numero de pasos, la tasa de aprendizaje ni los hiperparametros del LoRA (rango, alpha, modulos objetivo), y no incluye resultados de evaluacion.

Su relevancia practica es limitada en el momento de la publicacion: cero descargas, cero likes y ausencia de benchmarks publicados. Resulta util principalmente como ejemplo de flujo de trabajo de fine-tuning con Unsloth sobre un modelo de 27B, o para quien quiera reproducir o continuar el ajuste sobre el mismo modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, segun tag `qwen3_5`); detalles no disponibles |
| Parametros totales | No disponible (el modelo base se denomina "27b"; el repo contiene solo el adaptador LoRA) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (formato de pesos safetensors; compatible con cuantizacion posterior via herramientas externas) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA, no un modelo completo. La arquitectura subyacente corresponde al modelo base `mfielding92/thefriend-27b-110626-v3-qvo`, etiquetado como `qwen3_5`, lo que sugiere una variante de la familia Qwen 3.5 de Alibaba. No se dispone de informacion sobre el numero exacto de capas, dimensiones ocultas, mecanismo de atencion ni si el modelo base emplea una arquitectura densa o Mixture of Experts.

El entrenamiento se realizo con Unsloth (que la model card describe como "2x faster") y con las librerias TRL y Transformers. No se documentan el volumen de tokens de entrenamiento, la composicion del dataset, la presencia de RLHF/DPO ni los hiperparametros del LoRA. Tampoco se especifica si el ajuste se hizo en precision completa, bf16 o con cuantizacion QLoRA, aunque el tamano del repositorio (1,4 GB) es coherente con un adaptador de rango moderado sobre un modelo de ~27B.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Qwen 3.5.
- Ajuste fino especifico sobre el modelo base, cuyo proposito concreto no se documenta en la model card.
- Compatibilidad con el ecosistema Transformers, Text Generation Inference (TGI) y Unsloth, segun las etiquetas del repositorio.
- Soporte de tool calling, agentes, razonamiento multi-paso, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.

## Casos de uso

- Investigacion sobre fine-tuning eficiente: el adaptador sirve como referencia de un flujo LoRA con Unsloth sobre un modelo de 27B, util para comparar tecnicas de entrenamiento.
- Reproduccion de experimentos: al estar publicado el adaptador y el modelo base, se puede cargar la combinacion y evaluar el efecto del ajuste frente al base.
- Punto de partida para nuevos ajustes: el adaptador puede fusionarse con el base y continuar el entrenamiento con datos propios.
- Pruebas de integracion en pipelines TGI: las etiquetas indican compatibilidad con text-generation-inference, lo que permite validar despliegues de adaptadores LoRA.
- Generacion de texto en ingles en entornos de prototipado, siempre que se valide la calidad frente al modelo base.
- Docencia y formacion: ejemplo didactico de publicacion de un adaptador en Hugging Face con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio contiene solo el adaptador (1,4 GB); la VRAM necesaria depende del modelo base de ~27B.
- Inferencia del modelo base en bf16: aproximadamente 54 GB de VRAM (2 bytes por parametro), lo que requiere GPU de clase A100 80 GB, H100 80 GB o varias GPU.
- Inferencia cuantizada a 8 bits: aproximadamente 27 GB, viable en A100 40 GB o RTX 6000 Ada.
- Inferencia cuantizada a 4 bits: aproximadamente 14-16 GB, viable en RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Despliegue: Transformers, TGI (soporta adaptadores LoRA), vLLM (soporte de LoRA) y llama.cpp/Ollama si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|
| thefriend-27b-112026-lora | No disponible (~27B en el base) | No disponible | Apache 2.0 | Safetensors (LoRA) | No publicados |
| Qwen 3.5 (modelo base de la familia) | Variable segun variante | No disponible | Segun variante | Safetensors | No disponibles en esta ficha |
| Adaptadores LoRA genericos de Unsloth | Depende del base | Depende del base | Segun base | Safetensors | No aplica |

No se dispone de informacion suficiente para una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, por lo que se desconocen sesgos introducidos por el ajuste.
- Riesgo de alucinacion inherente a los modelos generativos; no hay evaluacion publicada que lo cuantifique.
- Soporte limitado al ingles segun el campo `language`.
- Requiere cargar el modelo base `mfielding92/thefriend-27b-110626-v3-qvo`; el adaptador por si solo no es utilizable.
- Sin descargas ni validacion de la comunidad: no hay evidencia externa de calidad.
- La licencia Apache 2.0 del adaptador no exime de verificar la licencia del modelo base y de los datos de entrenamiento.
- No apto para produccion sin una evaluacion propia previa.

## Enlaces

- Hugging Face: https://huggingface.co/mfielding92/thefriend-27b-112026-lora
- Modelo base: https://huggingface.co/mfielding92/thefriend-27b-110626-v3-qvo
- Unsloth: https://github.com/unslothai/unsloth
