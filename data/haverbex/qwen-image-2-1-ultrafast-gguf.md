# Haverbex/Qwen-Image-2.1-UltraFast-GGUF

## Resumen

Qwen-Image-2.1-UltraFast-GGUF es una exportación cuantizada en formato GGUF del modelo de difusión Haverbex/Qwen-Image-2.1-UltraFast, que a su vez es un ajuste fino del modelo de generación y edición de imágenes Qwen/Qwen-Image-2.1 de Alibaba (familia Qwen). El componente de generación visual es un transformer de difusión (DiT) de 32 capas single-stream con unos 7.115 millones de parámetros, diseñado para unificar generación text-to-image y edición image-to-image en un único modelo. Esta variante concreta, publicada por el usuario Haverbex, incorpora un adaptador LoRA de rango 32 ya fusionado en los pesos base y exportado a cuantización Q4_K para su uso con stable-diffusion.cpp y ComfyUI-GGUF.

El interés de esta ficha radica en que se trata de un artefacto de conversión, no de un modelo nuevo: el autor documenta de forma explícita hashes, cobertura del adaptador y comprobaciones de fusión en FP32, pero advierte que no se ha evaluado la inferencia completa ni la retención de calidad de imagen de este GGUF. Es, por tanto, un recurso relevante para investigadores que quieran experimentar con edición de imágenes cuantizada en hardware modesto, siempre dentro del marco de la licencia Qwen Research, que restringe el uso comercial.

La relevancia actual viene de que Qwen-Image-2.1 es uno de los modelos abiertos de edición de imágenes con soporte nativo de imágenes transparentes, y esta conversión busca reducir el peso del transformer a unos 3,77 GiB para facilitar su despliegue en GPUs de consumo. No obstante, el transformer es solo una pieza: el pipeline completo requiere además un codificador de texto Qwen3-VL-8B, el VAE de Qwen-Image-2.1 y, para edición con imagen de referencia, su codificador de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) de 32 capas single-stream para generacion visual |
| Parametros totales | 7.115.124.736 (aprox. 7,1 B, componente de generacion visual) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K (archivo `Qwen-Image-2.1-UltraFast-Q4_K.gguf`); el modelo base se distribuye en BF16/safetensors |
| Idiomas soportados | No disponible (la model card no declara idiomas; el codificador de texto Qwen3-VL-8B es multilingue) |
| Licencia | qwen-research (Qwen Research License Agreement), uso no comercial de investigacion y evaluacion |
| Formato de pesos | GGUF (Q4_K); el modelo base en safetensors |
| Tamano del archivo GGUF | 4.050.916.384 bytes (3,773 GiB) |
| SHA-256 (GGUF) | `1eb1041545d2ca528fafac1d681ee7224837a77aa8a0d71663fbf876baefdd20` |
| Tensores del transformer | 297 |
| Proyecciones con adaptador fusionado | 224 |
| Pipeline declarado | image-to-image |
| Fecha de publicacion | 2026-09-25 |

## Arquitectura y entrenamiento

El componente de generacion visual de Qwen-Image-2.1 es un transformer de difusion con 32 capas single-stream y aproximadamente 7 B de parametros. Unifica generacion text-to-image y edicion de imagenes, e incluye soporte nativo para generar y editar imagenes con transparencia. En este repositorio el transformer se distribuye ya cuantizado a Q4_K, con el adaptador LoRA fusionado en los pesos.

El adaptador es un LoRA personalizado de rango 32 / alpha 32 que cubre 224 proyecciones y se entreno durante 128 actualizaciones sobre 16 casos de entrenamiento de MagicBrush (SHA-256 del adaptador: `9d3585e6f1b4700130a12df83b2ac7a9a7440158bc9625425475c28214e59639`). La fusion se realizo como `W_merged = float32(W_base) + (alpha / rank) * float32(B) @ float32(A)`, dejando intactos los tensores no adaptados antes de cuantizar. El convertidor empleado es `leejet/stable-diffusion.cpp@b167b942f77ecb17e7f78e163a8c32ff7ac95c10`, que aplica Q4_K a los tensores elegibles. La base sobre la que se trabaja es `Qwen/Qwen-Image-2.1@790c92633540aa0cb11d9abf19eb46d861714758`.

El modelo es una destilacion de pocos pasos: el estudiante se entreno para los ocho intervalos definidos en `configs/schedule.json` y esos valores sigma ya estan desplazados (no debe aplicarse otro desplazamiento). El autor advierte que el runtime debe soportar la arquitectura Qwen-Image-2.1; el soporte de la arquitectura Qwen Image anterior es insuficiente. No se documenta el numero total de tokens de entrenamiento del modelo base ni si hubo RLHF/DPO especificos en este ajuste.

## Capacidades

- Generacion de imagenes text-to-image con el componente DiT de Qwen-Image-2.1.
- Edicion de imagenes image-to-image mediante instrucciones en lenguaje natural (pipeline declarado del repositorio).
- Edicion con imagen de referencia, que requiere ademas el codificador de vision y la proyeccion correspondientes.
- Generacion y edicion nativas de imagenes con transparencia (canal alfa), capacidad heredada del modelo base Qwen-Image-2.1.
- Reduccion a pocos pasos de inferencia gracias al schedule destilado de 8 intervalos definido por el autor.
- Ejecucion a traves de runtimes de difusion en C++ (stable-diffusion.cpp) y de nodos GGUF para ComfyUI.
- Soporte de tool calling / function calling: no aplica (es un modelo de difusion de imagenes, no un LLM de texto).
- Soporte de agentes y razonamiento multi-paso: no disponible / no aplica.
- Capacidades multilingues: no disponibles en la model card; dependen del codificador de texto Qwen3-VL-8B.

## Casos de uso

- Edicion de imagenes por instrucciones en produccion de contenido: el modelo permite transformar una imagen de entrada a partir de una descripcion textual, util para retoque rapido y variaciones sobre una misma imagen base.
- Retoque de producto para comercio electronico: se parte de una foto de producto y se generan versiones editadas (fondos, iluminacion, variantes) sin rehacer la sesion fotografica, aprovechando la edicion image-to-image.
- Creacion de recursos graficos con transparencia: la capacidad nativa de generar y editar imagenes transparentes permite producir PNG con canal alfa para diseno web, interfaces o materiales de marketing.
- Aumento de datos para investigacion en vision: generar variaciones editadas de un conjunto de imagenes de referencia para ampliar datasets de entrenamiento en entornos no comerciales, respetando la licencia de investigacion.
- Prototipado rapido en ComfyUI: integrar el GGUF mediante leejet/ComfyUI-GGUF para construir flujos de edicion de imagen sin necesidad de pesos BF16 completos.
- Despliegue ligero con stable-diffusion.cpp: ejecutar el transformer cuantizado en entornos C++ o con recursos limitados de VRAM, dejando los codificadores y el VAE como componentes separados.
- Investigacion academica sobre destilacion y cuantizacion: el repositorio documenta el proceso de conversion (informe, script `convert.py`, hashes), lo que permite estudiar la retencion de calidad al pasar de BF16 a Q4_K en modelos de difusion.
- Evaluacion comparativa de pipelines de edicion: usar el modelo como punto de partida para comparar la calidad de edicion de Qwen-Image-2.1 frente a otras alternativas abiertas dentro de un marco de evaluacion no comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de este GGUF en la informacion disponible. La model card indica explicitamente que la inferencia completa de imagen, la retencion de calidad y la latencia de esta exportacion no se han evaluado, y que las graficas de comparacion Flint y las ediciones de muestra del adaptador original son diagnosticos de entrenamiento en BF16, no salidas del GGUF.

| Metrica | Resultado |
|---|---|
| Inferencia completa de imagen (GGUF) | No evaluada |
| Retencion de calidad de imagen (GGUF) | No evaluada |
| Latencia (GGUF) | No evaluada |
| Roundtrip nativo de lectura/escritura GGUF | Byte-identico |
| Comparaciones de fusion lineal en FP32 | Registradas en el informe de conversion |
| Benchmarks Flint del adaptador (BF16) | Diagnosticos de entrenamiento, no resultados del GGUF |

## Requisitos de hardware

- Tamano del archivo GGUF del transformer: 3,773 GiB (4.050.916.384 bytes) en Q4_K.
- El pipeline completo no se limita al transformer: requiere ademas el VAE de Qwen-Image-2.1 y un codificador de texto Qwen3-VL-8B, y para edicion con imagen de referencia su codificador de vision y proyeccion. La VRAM total depende de como se cuantifiquen o carguen estos componentes, no incluidos en este repositorio.
- VRAM estimada para el transformer cuantizado: en torno a 4 GiB en Q4_K; sumando el resto de componentes del pipeline la huella puede ser sustancialmente mayor (el codificador Qwen3-VL-8B en BF16 ronda los 16 GB, y su version cuantizada reduciria esa cifra). Estos valores son estimaciones a partir del tamano de archivo y no han sido verificados por el autor.
- GPU recomendadas: no especificadas por el autor. Cabe en GPUs de consumo para el transformer aislado (por ejemplo, tarjetas con 8-12 GB o mas), pero el pipeline completo puede requerir GPUs de mayor capacidad o cuantizacion adicional de los codificadores.
- Opciones de despliegue: stable-diffusion.cpp (`sd-cli`, con opcion `--sigmas` para valores personalizados) y leejet/ComfyUI-GGUF. Se recomienda fijar la revision indicada por el autor.
- Latencia y throughput: no disponibles; no se han establecido ni la paridad de schedule de extremo a extremo ni la salida de imagen para este GGUF.
- Nota de precision: las comprobaciones de fusion en FP32 no garantizan paridad bit a bit con el forward original del adaptador BF16, y la cuantizacion anade un cambio numerico adicional.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto / pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haverbex/Qwen-Image-2.1-UltraFast-GGUF (este) | ~7,1 B (generacion visual) | GGUF Q4_K (3,773 GiB) | Schedule destilado de 8 intervalos | qwen-research (no comercial) | Hugging Face |
| Haverbex/Qwen-Image-2.1-UltraFast | ~7,1 B (generacion visual) | BF16 (adaptador separado) | Schedule destilado de 8 intervalos | qwen-research (no comercial) | Hugging Face |
| Qwen/Qwen-Image-2.1 | ~7 B (generacion visual, 32 capas DiT) | safetensors | Unifica generacion y edicion, transparencia nativa | Licencia Qwen (consultar) | Hugging Face, GitHub, ModelScope |
| Qwen/Qwen-Image (generacion anterior) | No disponible | safetensors | No disponible | No disponible | Hugging Face |

La comparativa con modelos de otros fabricantes no esta disponible en la informacion proporcionada. Cabe senalar que Qwen-Image-2.1 y sus derivados comparten arquitectura, por lo que la diferencia entre ellos es el ajuste fino (adaptador UltraFast), el formato (BF16 frente a GGUF Q4_K) y las advertencias de evaluacion de cada artefacto.

## Limitaciones y advertencias

- La inferencia completa de imagen, la retencion de calidad y la latencia de este GGUF no se han evaluado; el autor lo declara explicitamente.
- Las graficas de benchmarks Flint y las ediciones de muestra del adaptador original son diagnosticos de entrenamiento en BF16 y no deben interpretarse como resultados del GGUF.
- Las comprobaciones de fusion en FP32 no garantizan paridad bit a bit con el forward BF16 del adaptador separado; la cuantizacion Q4_K anade un cambio numerico adicional.
- La calidad en conjuntos de desarrollo independientes y la cualificacion para produccion no estan establecidas, y la destilacion S4 no se ha completado.
- El archivo GGUF ya contiene el adaptador fusionado; no debe volverse a aplicar el mismo adaptador.
- El schedule de 8 pasos esta desplazado segun `configs/schedule.json`; no debe aplicarse otro desplazamiento. El schedule por defecto de otros runtimes puede diferir y la paridad no esta garantizada.
- Para la inferencia completa hacen falta componentes adicionales (VAE de Qwen-Image-2.1 y codificador Qwen3-VL-8B, y el codificador de vision para edicion con referencia) que no se incluyen en este repositorio. Los VAE anteriores de Qwen Image y Wan no son intercambiables.
- El runtime debe soportar la arquitectura Qwen-Image-2.1; el soporte de la arquitectura Qwen Image antigua es insuficiente.
- Licencia Qwen Research: uso restringido a investigacion y evaluacion no comercial; no apta para uso comercial.
- Sesgos conocidos y riesgo de alucinacion visual: no documentados en la informacion disponible. Como modelo generativo de imagenes, puede producir contenido sesgado o inexacto respecto a la instruccion.
- Limitaciones de contexto e idioma: no disponibles en la model card.

## Enlaces

- Modelo en Hugging Face (este repositorio): https://huggingface.co/Haverbex/Qwen-Image-2.1-UltraFast-GGUF
- Modelo base ajustado (BF16): https://huggingface.co/Haverbex/Qwen-Image-2.1-UltraFast
- Graficas de benchmarks y ediciones de muestra del adaptador original: https://huggingface.co/Haverbex/Qwen-Image-2.1-UltraFast#benchmark-charts
- Modelo base oficial: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio GitHub de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- Blog de Qwen sobre Qwen-Image-2.1: https://qwen.ai/blog?id=qwen-image-2.1
- Guia de Qwen Image 2.1 en stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp/blob/b167b942f77ecb17e7f78e163a8c32ff7ac95c10/docs/qwen_image_2.1.md
- Nodos GGUF para ComfyUI (leejet): https://github.com/leejet/ComfyUI-GGUF/tree/edd981b10e107d3b8f58e16c498f2d08f631bc47
- Version anterior de la familia (Qwen Image): https://huggingface.co/Qwen/Qwen-Image
- Entrada del modelo en Civitai: https://civitai.com/models/2954443/qwen-image-21
