# PabloHoties/Qwen3-4B-uncensored-klein-text-encoder-int4-ov

## Resumen

Este repositorio no contiene un modelo de lenguaje de uso general, sino un codificador de texto (text encoder) especializado para el modelo de difusion FLUX.2 [klein] 4B de Black Forest Labs. Se trata de una conversion a OpenVINO en precision INT4 del finetune "Uncensored Qwen3 4B (Z-Image & Flux4B)" publicado por Felldude en Civitai, el cual parte a su vez de Qwen3-4B. El autor del repositorio, PabloHoties, se limita a cambiar el formato de los pesos, no el comportamiento del finetune.

La particularidad tecnica clave es que solo se conservan las 27 capas de Qwen3 que FLUX.2 klein lee durante la generacion, y la salida no es texto sino los `prompt_embeds` que consume el transformador de difusion: los estados ocultos de las capas 9, 18 y 27 concatenados, lo que da 7680 valores por token. Por tanto, el modelo no puede emplearse para generar texto, razonar ni mantener conversaciones; unicamente funciona como componente del pipeline de FLUX.2 klein 4B.

Su relevancia es acotada pero practica: permite sustituir el codificador de texto original de FLUX.2 klein por una variante sin censura en el mismo grafo OpenVINO, con el mismo tamano (~2.1 GB) y velocidad que el export de referencia de rupeshs, y con una similitud coseno de 0.98-0.99 frente al finetune FP32 en PyTorch. Esta pensado para el web UI OpenVINO de FLUX.2 klein 4B del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3), recortado a las 27 capas que lee FLUX.2 klein; exportado como grafo OpenVINO |
| Parametros totales | no disponible (repo de 2.1 GB en INT4/INT8 mixto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 asimetrica con grupos de 128 en la mayoria de capas; INT8 por canal en el resto (esquema NNCF) |
| Idiomas soportados | no disponibles (hereda el entrenamiento multilingue de Qwen3, sin confirmacion del autor) |
| Licencia | civitai-model-license (se aplican los permisos fijados por el autor en Civitai) |
| Formato de pesos | OpenVINO IR (carpeta `text_encoder/`), no safetensors ni GGUF |
| Salida | `prompt_embeds`: estados ocultos de las capas 9, 18 y 27 concatenados (7680 valores por token) |
| Modelo base | black-forest-labs/FLUX.2-klein-4B |
| Grafo de referencia | rupeshs/flux2-klein-4b-int4-ov |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-4B, un transformer decoder denso de la familia Qwen3, del que aqui solo se retienen las 27 capas que FLUX.2 klein consulta. El finetune de Felldude se realizo sobre un corpus humano (el archivo original se llama `qwen3_4b_human_corpus_fp32.safetensors`) con el objetivo declarado de eliminar la censura en las representaciones que guian la generacion de imagenes. No se dispone de informacion sobre el volumen de tokens, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La conversion realizada por PabloHoties no reentrena nada: inserta los pesos del finetune en el grafo OpenVINO del codificador de texto del export de rupeshs, aplicando cuantizacion INT4 asimetrica con grupos de 128 en la mayoria de capas e INT8 por canal en el resto, siguiendo el esquema de NNCF. El resultado mantiene el mismo tamano (~2.1 GB) y la misma velocidad que el export de referencia. La validacion frente al finetune FP32 ejecutado en PyTorch arroja una similitud coseno de 0.98-0.99 en las capas 9, 18 y 27, frente a 0.82-0.97 del codificador de texto original frente a esa misma referencia. El script de conversion esta en `tools/convert_text_encoder.py` del repositorio del web UI.

## Capacidades

- Generacion de embeddings de texto para condicionar FLUX.2 klein 4B: produce `prompt_embeds` a partir de un prompt textual.
- Sustitucion directa del codificador de texto original de FLUX.2 klein, con las mismas entradas y salidas que `rupeshs/flux2-klein-4b-int4-ov`, por lo que puede reemplazar esa carpeta.
- Compatibilidad con cualquier transformador FLUX.2 klein 4B, original o finetune.
- Orientado a generacion de imagenes sin filtrado de contenido en el condicionamiento textual (el autor lo etiqueta como `not-for-all-audiences`).
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes, vision ni audio.
- No es compatible con Z-Image, que lee otras capas del codificador.

## Casos de uso

- Generacion de imagenes con FLUX.2 klein 4B en CPU o iGPU mediante OpenVINO: se descarga desde la pestana "Download model" del web UI del autor y se selecciona como codificador de texto, aprovechando la cuantizacion INT4 para reducir requisitos de memoria.
- Sustitucion del codificador estandar en un pipeline FLUX.2 klein ya montado: al compartir entradas y salidas con el export de rupeshs, basta con reemplazar la carpeta `text_encoder/` sin tocar el resto del grafo.
- Exploracion artistica de contenido que el codificador original rechaza o atenua: el finetune elimina la censura en las representaciones, lo que permite condicionar la difusion con prompts que el modelo base trataria de forma mas conservadora.
- Investigacion sobre el efecto del codificador de texto en la salida de un modelo de difusion: al poder intercambiar codificadores (original frente a finetune) manteniendo el mismo transformador, se aisla la contribucion del condicionamiento textual.
- Pruebas de cuantizacion en produccion: sirve como caso de estudio de hasta donde llega la perdida de calidad al pasar de FP32 a INT4/INT8 en un codificador de texto, con la similitud coseno como metrica objetiva.
- Prototipado local en equipos sin GPU dedicada: el formato OpenVINO permite ejecutar el pipeline completo en hardware Intel, algo inviable con pesos FP32 de mayor huella.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo aportado por el autor es la similitud coseno de los embeddings de salida frente al finetune FP32 en PyTorch:

| Capa | Este export INT4/INT8 | Codificador de texto original |
|---|---|---|
| Capa 9 | 0.98-0.99 | 0.82-0.97 |
| Capa 18 | 0.98-0.99 | 0.82-0.97 |
| Capa 27 | 0.98-0.99 | 0.82-0.97 |

## Requisitos de hardware

- Huella en disco y en memoria de los pesos: ~2.1 GB, identica al export de referencia.
- VRAM/RAM estimada: no disponible de forma explicita; por el tamano del grafo, el codificador cabe en equipos con unos pocos GB de memoria libre, aunque el transformador de difusion de FLUX.2 klein 4B anade su propio consumo.
- GPU recomendadas: no disponibles. El formato OpenVINO esta orientado a CPU Intel, iGPU y NPU; no se documentan requisitos para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: previsiblemente si en terminos de memoria del codificador, pero el autor no publica cifras de VRAM total del pipeline.
- Opciones de despliegue: OpenVINO Runtime a traves del web UI de FLUX.2 klein 4B del autor; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un codificador de texto de difusion.
- Latencia y throughput: no disponibles. El autor afirma que la velocidad es la misma que la del export de rupeshs, sin dar cifras.

## Comparativa con modelos similares

| Modelo | Funcion | Precision | Tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Este repositorio | Codificador de texto de FLUX.2 klein 4B, sin censura | INT4/INT8 OpenVINO | ~2.1 GB | civitai-model-license | Similitud 0.98-0.99 con el finetune FP32 |
| rupeshs/flux2-klein-4b-int4-ov | Codificador de texto de FLUX.2 klein 4B, original | INT4 OpenVINO | ~2.1 GB | Apache 2.0 | Grafo de referencia; similitud 0.82-0.97 con el finetune FP32 |
| Qwen/Qwen3-4B | LLM de uso general | FP16/BF16 y otras | ~8 GB en BF16 | Apache 2.0 | Modelo completo; aqui solo se conservan 27 capas y la salida es de embeddings |
| black-forest-labs/FLUX.2-klein-4B | Modelo de difusion texto-imagen | no disponible | no disponible | Apache 2.0 | Consumidor de este codificador, no una alternativa al mismo |

## Limitaciones y advertencias

- No es un LLM de uso general: no genera texto ni responde instrucciones; solo emite `prompt_embeds` para FLUX.2 klein.
- Incompatible con Z-Image, que lee capas distintas del codificador.
- La licencia `civitai-model-license` impone los permisos que el autor del finetune haya fijado en Civitai; es imprescindible revisarlos antes de cualquier uso comercial, y no se garantiza permiso de redistribucion ni de explotacion comercial.
- El modelo esta marcado como `not-for-all-adversaries` (`not-for-all-audiences`): el finetune elimina la censura, por lo que puede producir contenido para adultos o potencialmente ofensivo; la responsabilidad legal y etica recae en el usuario.
- Riesgo de sesgos y de contenido inapropiado heredado del corpus de finetune, del que no se publica composicion.
- La cuantizacion INT4 introduce una desviacion medible frente a FP32 (similitud coseno 0.98-0.99, no 1.0), que puede traducirse en diferencias sutiles en las imagenes generadas.
- No hay informacion sobre idiomas soportados ni sobre el comportamiento del codificador en lenguas distintas del ingles.
- Repositorio sin descargas ni likes en el momento de la consulta y con pipeline no declarado; no hay evidencia de uso en produccion.
- Depende del ecosistema OpenVINO y del web UI del autor para un uso sencillo; no hay soporte documentado en otros runners.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/PabloHoties/Qwen3-4B-uncensored-klein-text-encoder-int4-ov
- Finetune original en Civitai (Felldude): https://civitai.red/models/2373678/uncensored-qwen3-4b-z-image-and-flux4b
- Version concreta del finetune: https://civitai.red/models/2373678/uncensored-qwen3-4b-z-image-and-flux4b?modelVersionId=2693707
- Modelo base de difusion: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Codificador de texto de referencia: https://huggingface.co/rupeshs/flux2-klein-4b-int4-ov
- Qwen3-4B original: https://huggingface.co/Qwen/Qwen3-4B
- Web UI OpenVINO de FLUX.2 klein 4B: https://github.com/PabloHoties/flux.2-klein-4b-openvino-webui
