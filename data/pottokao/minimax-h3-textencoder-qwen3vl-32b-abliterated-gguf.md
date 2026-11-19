# pottokao/MiniMax-H3-TextEncoder-Qwen3VL-32B-abliterated-GGUF

## Resumen

MiniMax-H3-TextEncoder-Qwen3VL-32B-abliterated-GGUF es una compilacion en formato GGUF del codificador de texto utilizado en la pipeline de generacion de video MiniMax-H3. No se trata de un modelo conversacional autonomo, sino de un componente especializado: un Qwen3-VL-32B-Instruct sometido a un proceso de *abliteration* (eliminacion de los mecanismos de rechazo) y reempaquetado para que la pipeline de MiniMax-H3 consuma sus estados ocultos como condicionamiento del DiT generador de video. El autor es pottokao, un tercero independiente no afiliado a Qwen ni a MiniMax.

El modelo base es Qwen3-VL-32B-Instruct, un transformer denso de 50 capas y aproximadamente 26.500 millones de parametros reales (segun los safetensors del modelo original), con capacidades nativas de vision y lenguaje. Esta version concreta se distribuye en cuantizacion Q3_K_S (aproximadamente 3,53 bits por peso) y en dos variantes: una solo de texto (~11,5 GB) y otra con la torre visual fusionada en BF16 (~12,6 GB), esta ultima necesaria para ComfyUI.

Su relevancia es practica: permite ejecutar el codificador de MiniMax-H3 en hardware de consumo mediante llama.cpp y ComfyUI-GGUF, sin necesidad de cargar los pesos en BF16. La model card advierte de que existe una compilacion posterior de mayor calidad (repositorio de 16 GB del mismo autor) con aproximadamente la mitad de error de condicionamiento, y de que el archivo `_vis` de este repositorio puede fallar al cargarse en versiones recientes del paquete `gguf`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso `qwen3vl` (Qwen3-VL), 50 capas |
| Parametros totales | 26.531.013.360 (~26,5 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q3_K_S (~3,53 BPW); torre visual en BF16 en la variante `_vis` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 24,1 GB |
| Variantes incluidas | Texto solo (~11,5 GB) y texto + vision fusionada (~12,6 GB) |
| Modelo base | Qwen/Qwen3-VL-32B-Instruct (abliterated) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-VL-32B-Instruct: un transformer denso de 50 capas con atencion completa y una torre visual independiente que proyecta parches de imagen al espacio de embeddings del modelo de lenguaje. MiniMax-H3 consume el estado oculto tras la capa 50 como condicionamiento textual para su DiT de generacion de video, de ahi que el autor documente explicitamente ese punto de corte. La variante `_vis` reincorpora la torre visual en BF16 y conserva los tensores `visual.deepstack_merger_list.*` y `model.layers.49.*`, que ComfyUI utiliza para identificar el codificador de H3.

No se dispone de informacion sobre el proceso de *abliteration* aplicado (metodo, direcciones de rechazo eliminadas, datos de calibracion) ni sobre el dataset de entrenamiento original de Qwen3-VL-32B-Instruct en esta ficha. Tampoco se documentan fases de RLHF o DPO adicionales por parte del autor del reempaquetado. La unica innovacion tecnica declarada es la cuantizacion Q3_K_S con la torre visual preservada en BF16 para no degradar la senal de condicionamiento que consume el DiT. El autor reporta un error de condicionamiento del 14,4 % para este build, frente al 7,9 % de su compilacion posterior de 12,65 GB.

## Capacidades

- Generacion de texto y razonamiento en el marco de un codificador de condicionamiento, no como asistente conversacional independiente.
- Procesamiento de imagen y texto (`image-text-to-text`), con torre visual operativa en la variante `_vis`.
- Produccion de estados ocultos tras la capa 50, que es la salida que MiniMax-H3 espera como entrada.
- Capacidades multilingues heredadas de Qwen3-VL: no documentadas en esta ficha.
- Tool calling y function calling: no documentado para este reempaquetado.
- Modo *thinking*: no documentado.
- Alineacion eliminada (*abliterated*): el modelo no aplica los rechazos aprendidos del modelo original, lo que cambia su comportamiento ante peticiones que el base rechazaria.

## Casos de uso

- Generacion de video texto-a-video con MiniMax-H3 en ComfyUI: se carga el archivo `_vis` como codificador de texto del pipeline; ComfyUI lo detecta por los tensores de la torre visual y alimenta el DiT con el estado oculto de la capa 50.
- Generacion de video imagen-a-video: la torre visual fusionada permite condicionar la generacion a partir de una imagen de referencia ademas del prompt textual.
- Despliegue en GPU de consumo: la cuantizacion Q3_K_S reduce el peso a ~11,5-12,6 GB, lo que permite mantener el codificador residente en tarjetas de 16 GB junto con parte del pipeline.
- Experimentacion con condicionamiento sin censura: el proceso de abliteration elimina los rechazos del modelo base, util para investigar como afecta la alineacion del codificador a la diversidad de las salidas generadas.
- Servicio de inferencia de texto con llama.cpp: la variante sin torre visual (~11,5 GB) puede usarse como modelo de texto puro en llama.cpp, aunque con la perdida de calidad propia de Q3_K_S.
- Evaluacion comparativa de cuantizaciones: sirve como referencia de linea base (14,4 % de error de condicionamiento) frente a builds posteriores del mismo autor con cuantizacion por sensibilidad al DiT.
- Prototipado de pipelines de video en entornos con VRAM limitada antes de migrar a pesos BF16 o a la compilacion NVFP4-AWQ para vLLM-Omni.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo reportado por el autor es el error de condicionamiento relativo al DiT de MiniMax-H3:

| Build | Tamano | Error de condicionamiento |
|---|---|---|
| Este repositorio (Q3_K_S) | ~12,65 GB (`_vis`) | 14,4 % |
| Compilacion posterior del autor | 12,65 GB | 7,9 % |
| Compilacion posterior del autor | 13,7 GB | 6,4 % |
| Compilacion posterior del autor | 14,8 GB | 4,9 % |

## Requisitos de hardware

- VRAM estimada: ~12,6 GB para el archivo `_vis` y ~11,5 GB para la variante solo texto, unicamente para los pesos; hay que anadir el coste del contexto y de los buffers de inferencia.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 4080/4070 Ti Super (16 GB) para el codificador en solitario; A100 o H100 si se ejecuta junto al DiT de video en BF16.
- Cabe en GPU de consumo de 16 GB o superior, siempre que no se cargue simultaneamente el generador de video en precision completa.
- Opciones de despliegue: llama.cpp y ComfyUI-GGUF (via `_vis` para el pipeline de H3); para vLLM-Omni existe una compilacion NVFP4-AWQ separada del mismo autor.
- Latencia y throughput: no disponibles.
- Advertencia de compatibilidad: el archivo `_vis` almacena el peso 5-D `patch_embed` de la torre visual tal cual, y las versiones recientes de `gguf` rechazan tensores de mas de 4 dimensiones, por lo que puede fallar al cargar en un ComfyUI-GGUF actualizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Q3_K_S) | ~26,5 mil millones | No disponible | GGUF | Apache 2.0 | Error de condicionamiento 14,4 %; `_vis` con posible problema de carga |
| pottokao/MiniMax-H3-TextEncoder-16GB-GGUF | No disponible | No disponible | GGUF | No disponible | Cuantizacion por sensibilidad al DiT, error 4,9-7,9 % |
| pottokao/MiniMax-H3-TextEncoder-Qwen3VL-32B-abliterated-NVFP4-AWQ | No disponible | No disponible | NVFP4-AWQ | No disponible | Orientado a vLLM-Omni |
| Qwen/Qwen3-VL-32B-Instruct | ~26,5 mil millones | No disponible | Safetensors | Apache 2.0 | Modelo base alineado, sin abliteration |

## Limitaciones y advertencias

- No es un modelo de proposito general: esta pensado como componente interno de la pipeline MiniMax-H3 y su salida util es el estado oculto, no texto generado.
- El proceso de abliteration elimina los rechazos del modelo base; esto incrementa el riesgo de generar contenido inapropiado y traslada al operador toda la responsabilidad de filtrado.
- La cuantizacion Q3_K_S degrada la calidad: el autor reporta un 14,4 % de error de condicionamiento, aproximadamente el doble que su build posterior de 12,65 GB.
- El archivo `_vis` puede no cargar en versiones recientes de ComfyUI-GGUF por el tensor `patch_embed` de 5 dimensiones; el autor recomienda migrar al repositorio de 16 GB.
- El autor declara no tener disponibilidad para dar soporte a configuraciones de video como MiniMax-H3.
- No hay informacion sobre sesgos especificos, cobertura idiomatica ni longitud de contexto soportada.
- Licencia Apache 2.0 en el reempaquetado, pero conviene verificar las condiciones del modelo base y del pipeline MiniMax-H3 para uso comercial del conjunto.
- Riesgo de alucinacion y de deriva semantica en el condicionamiento, agravado por la cuantizacion agresiva y por la ausencia de alineacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pottokao/MiniMax-H3-TextEncoder-Qwen3VL-32B-abliterated-GGUF
- Compilacion posterior recomendada: https://huggingface.co/pottokao/MiniMax-H3-TextEncoder-16GB-GGUF
- Build NVFP4-AWQ para vLLM-Omni: https://huggingface.co/pottokao/MiniMax-H3-TextEncoder-Qwen3VL-32B-abliterated-NVFP4-AWQ
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
