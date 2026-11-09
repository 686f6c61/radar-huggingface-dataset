# GossetWorks/Qwen3.8-27B-Gosset-3.65BPW

## Resumen

GossetWorks/Qwen3.8-27B-Gosset-3.65BPW es una cuantizacion del modelo base Qwen/Qwen3.8-27B, publicada por el usuario GossetWorks en Hugging Face. Se trata de un artefacto de pesos en formato safetensors empaquetados con una tecnica propietaria denominada "gosset-packed", basada en reticulos E8, que busca reducir el peso del modelo hasta aproximadamente 3,65 bits por peso (BPW) para que quepa en GPUs de 16 GB de VRAM. El modelo base es un vision-language de la familia Qwen3.5, segun la etiqueta de arquitectura `qwen3_5` del repositorio.

La relevancia de esta publicacion radica en la agresiva compression: el repo ocupa 13,8 GB y los safetensors declaran 5.235.410.416 parametros, lo que sugiere que el checkpoint no contiene el modelo completo, sino un subconjunto de tensores empaquetados o una representacion comprimida de los pesos. Esta discrepancia entre el nombre comercial ("27B") y el recuento real de parametros es un dato critico que el usuario debe verificar antes de desplegar el modelo.

El acceso esta restringido (gated): es necesario aceptar condiciones en Hugging Face. La licencia figura como "other", sin que se detallen los terminos en la informacion disponible, lo que anade incertidumbre sobre el uso comercial. No hay descargas ni likes registrados en el momento de la consulta, y el repositorio se creo y actualizo el mismo dia (9 de noviembre de 2026), lo que indica una publicacion muy reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer vision-language, segun tag del repo) |
| Parametros totales | 5.235.410.416 (segun safetensors); el nombre indica un base de 27B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Gosset-packed a ~3,65 BPW (reticulos E8); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | other (acceso gated, requiere aceptar condiciones) |
| Formato de pesos | safetensors (gosset-packed) |

## Arquitectura y entrenamiento

El modelo base Qwen/Qwen3.8-27B pertenece a la familia Qwen3.5, segun la etiqueta de arquitectura del repositorio (`qwen3_5`), y esta marcado como vision-language. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni detalles del entrenamiento del base en la informacion proporcionada.

La innovacion tecnica de esta publicacion es el esquema de cuantizacion "gosset-packed" con reticulos E8 a 3,65 BPW. Los reticulos E8 son estructuras de empaquetado denso en 8 dimensiones que permiten representar vectores con mayor eficiencia que la cuantizacion escalar o de bloques convencional. El autor no documenta en la informacion disponible el proceso de calibracion, los datos usados para la cuantizacion ni el impacto en perplexity o benchmarks. Tampoco se detalla si se aplico RLHF, DPO u otras tecnicas de alineacion en el base.

## Capacidades

- Generacion de texto y razonamiento: heredadas del base Qwen3.8-27B, aunque no verificadas tras la cuantizacion.
- Vision-language: el tag `vision-language` sugiere soporte de entrada de imagenes, pero no se detalla la resolucion ni el codificador visual.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (no se listan idiomas).
- Modo thinking: no disponible.
- Capacidades especiales (audio, video): no disponibles.

## Casos de uso

- Despliegue en GPU de consumo de 16 GB: el objetivo declarado del empaquetado a 3,65 BPW es permitir ejecutar un modelo de la clase 27B en tarjetas como RTX 4060 Ti 16 GB, RTX 4070 Ti Super o RTX 4080, algo inviable con pesos en FP16. Uso adecuado para prototipado local y demos.
- Investigacion en cuantizacion extrema: el esquema E8 a 3,65 BPW es un caso de estudio para medir la degradacion de calidad frente a GGUF Q4_K_M o AWQ, util en papers de compression.
- Vision-language en el borde: si el soporte de imagen se preserva tras la cuantizacion, permite tareas de captioning o VQA en hardware limitado, aunque requiere validacion previa.
- Fine-tuning ligero sobre el base cuantizado: no recomendado sin verificar que los tensores empaquetados sean compatibles con LoRA/PEFT; el formato propietario puede impedir el entrenamiento directo.
- Evaluacion comparativa de checkpoints: util como referencia de cuanto se degrada un modelo al bajar de 16 a 3,65 BPW en tareas de razonamiento y codigo.
- Servicio de inferencia de bajo coste: si el throughput es aceptable, puede desplegarse en vLLM o llama.cpp (previa conversion) para cargas no criticas, aunque la licencia "other" debe revisarse antes de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 13,8 GB, por lo que cabe en GPUs de 16 GB con margen para el contexto y el cache KV.
- GPUs recomendadas: RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB, RTX 4080 16 GB, RTX 4090 24 GB; en datacenter, A100 40 GB o H100 sobra holgadamente.
- Cabe en consumer GPU: si, en cualquier tarjeta con 16 GB o mas de VRAM, segun el objetivo declarado del autor.
- Opciones de despliegue: el formato gosset-packed es propietario; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI. Requiere verificacion y posible conversion a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GossetWorks/Qwen3.8-27B-Gosset-3.65BPW | 5.235.410.416 (declarados) / base 27B | no disponible | 3,65 BPW E8 | other (gated) | Hugging Face, acceso restringido |
| Qwen/Qwen3.8-27B (base) | 27B (nominal) | no disponible | FP16/BF16 original | no disponible | Hugging Face |
| Alternativas GGUF de la comunidad | variable | variable | Q4_K_M (~4,5 BPW) | segun autor | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Discrepancia entre el nombre "27B" y los 5.235.410.416 parametros declarados en safetensors: el checkpoint no parece contener el modelo completo; verificar antes de usar.
- Cuantizacion a 3,65 BPW: degradacion esperada en razonamiento, matematicas y codigo frente al base en FP16; no hay benchmarks publicados que la cuantifiquen.
- Formato propietario "gosset-packed": posible incompatibilidad con stacks estandar (vLLM, llama.cpp, TGI) y con herramientas de fine-tuning.
- Acceso gated: requiere aceptar condiciones en Hugging Face; no apto para descarga automatizada sin token.
- Licencia "other": sin terminos publicos en la informacion disponible; riesgo legal para uso comercial.
- Sin descargas ni likes: ausencia de validacion comunitaria; el autor no documenta el proceso de cuantizacion ni la calibracion.
- Riesgo de alucinacion: inherente al base, agravado por la compression extrema.
- Idiomas no declarados: no se puede garantizar soporte multilingue.

## Enlaces

- Hugging Face: https://huggingface.co/GossetWorks/Qwen3.8-27B-Gosset-3.65BPW
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
