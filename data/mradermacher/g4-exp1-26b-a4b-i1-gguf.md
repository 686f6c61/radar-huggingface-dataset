# mradermacher/G4-Exp1-26B-A4B-i1-GGUF

## Resumen

El modelo `mradermacher/G4-Exp1-26B-A4B-i1-GGUF` es una cuantización GGUF con matriz de importancia (imatrix) del modelo base `gepardzik/G4-Exp1-26B-A4B`, realizada por el autor mradermacher. El nombre sugiere que se trata de una variante de la familia Gemma 4 con arquitectura de mezcla de expertos (MoE) de 26 mil millones de parámetros totales y 4 mil millones activos, aunque esta información no está confirmada explícitamente en la documentación disponible. El repositorio ofrece varios niveles de cuantización (desde Q2_K hasta Q4_K_S) optimizados para diferentes equilibrios entre tamaño, velocidad y calidad.

La relevancia de este modelo radica en su disponibilidad como archivos GGUF listos para usar con motores de inferencia como llama.cpp, Ollama o LM Studio, lo que facilita su despliegue en hardware de consumo. La model card indica que se trata de un modelo de visión, aunque los archivos de proyección multimodal (mmproj) se encuentran en el repositorio estático asociado. La licencia Apache-2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (inferida por el sufijo A4B, no confirmada) |
| Parametros totales | 25.233.142.046 |
| Parametros activos | 4 mil millones (inferido, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-Q4_K_S (tambien IQ3_XXS, IQ3_M, etc. en el listado de quants) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni el proceso de entrenamiento del modelo base. El nombre "G4" y la referencia en la busqueda web a "Gemma 4 Abliteration" sugieren que podria tratarse de una variante de Gemma 4 con tecnicas de abliteration (eliminacion de capas de rechazo), pero esto no esta confirmado en la documentacion oficial. El repositorio actual es una cuantizacion GGUF con imatrix, lo que implica que los pesos originales en formato safetensors han sido convertidos y comprimidos para inferencia eficiente. No hay informacion sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto en ingles (segun el campo `language: en`).
- Posible capacidad de vision, segun la nota en la model card: "This is a vision model - mmproj files (if any) will be in the static repository". Sin embargo, no se especifican detalles sobre el procesamiento de imagenes.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otras funcionalidades especiales.
- Al ser una cuantizacion, las capacidades del modelo base se preservan en mayor o menor medida segun el nivel de cuantizacion, pero no hay datos concretos sobre su rendimiento en tareas especificas.

## Casos de uso

No se han documentado casos de uso especificos para este modelo en la informacion proporcionada. Dado su tamano (26B totales, 4B activos) y su formato GGUF, podria emplearse en escenarios genericos de generacion de texto y asistencia conversacional, pero no hay evidencia concreta de su idoneidad para tareas particulares. Se recomienda consultar la documentacion del modelo base `gepardzik/G4-Exp1-26B-A4B` para obtener informacion sobre aplicaciones previstas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los archivos GGUF varian en tamaño desde 10.7 GB (i1-Q2_K) hasta 15.6 GB (i1-Q4_K_S). Para cargar el modelo en VRAM se recomienda al menos 16 GB para la cuantizacion mas grande, y 12 GB para las mas pequeñas.
- GPUs compatibles: tarjetas con 12-16 GB de VRAM, como RTX 3060/4070/4080, o GPUs profesionales como A100 o H100 para mayor velocidad.
- El modelo puede ejecutarse en CPU con suficiente RAM, aunque con menor rendimiento.
- Motores de inferencia compatibles: llama.cpp, Ollama, LM Studio, text-generation-webui, entre otros que soporten GGUF.
- No se dispone de datos de latencia o throughput especificos.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de la misma categoria. El modelo base parece pertenecer a la familia Gemma 4, pero no hay datos publicos sobre su rendimiento relativo frente a otras variantes MoE de tamano similar.

## Limitaciones y advertencias

- Al ser una cuantizacion, puede haber perdida de calidad en comparacion con el modelo original en precision completa, especialmente en los niveles de cuantizacion mas bajos (Q2_K, IQ3_XXS).
- La informacion sobre el modelo base es escasa; se desconoce si presenta sesgos, tendencia a alucinaciones o limitaciones en contextos largos.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar que el modelo base cumpla con las mismas condiciones.
- No se ha confirmado la arquitectura exacta ni las capacidades reales del modelo; se recomienda probar antes de usar en produccion.
- El repositorio no incluye archivos mmproj para vision; si se necesita esa funcionalidad, hay que descargarlos del repositorio estatico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/G4-Exp1-26B-A4B-i1-GGUF
- Repositorio estatico (quants sin imatrix): https://huggingface.co/mradermacher/G4-Exp1-26B-A4B-GGUF
- Modelo base: https://huggingface.co/gepardzik/G4-Exp1-26B-A4B
- Perfil del autor: https://huggingface.co/mradermacher
- Pagina de descarga alternativa: https://local-ai-zone.github.io/models/g4-meromero-26b-a4b.html
- Repositorio sobre abliteration de Gemma 4: https://github.com/TrevorS/gemma-4-abliteration
