# HomiG/gemma-4-E4B-it-litert-lm-fp16-rope512

## Resumen

`HomiG/gemma-4-E4B-it-litert-lm-fp16-rope512` es una republicación de un parche comunitario sobre `litert-community/gemma-4-E4B-it-litert-lm`, la versión de Gemma 4 E4B de Google empaquetada en formato LiteRT-LM para despliegue en dispositivo (Android, iOS, escritorio, IoT y web). No es un modelo nuevo: los pesos son idénticos al original y solo se reescribe el grafo que convierte las posiciones de los tokens en fases rotatorias (RoPE), tanto en el modelo principal como en el drafter de decodificación especulativa.

El problema que resuelve es concreto: con activaciones de 16 bits (la precisión por defecto en GPU), el empaquetado original corrompe dígitos e identificadores cuando el contexto supera los 2.048 tokens (incidencia LiteRT-LM #3913). El parche descompone la posición como `512·h + l`, aplica la transformación original a `l`, obtiene la fase de `512·h` de una tabla precalculada y combina ambas mediante adición de ángulos, manteniendo exactitud en coma flotante hasta la posición 32.767.

Es relevante para quien despliegue Gemma 4 E4B en móvil con LiteRT-LM y necesite copia literal fiable de identificadores, números de serie o cadenas alfanuméricas en contextos largos, un escenario habitual en agentes on-device que leen documentos. El repositorio ocupa 3,7 GB, no tiene descargas ni likes registrados y se publicó el 6 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 E4B) con decodificacion especulativa; grafo LiteRT-LM con RoPE parcheado |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como cifra oficial; el parche garantiza exactitud de posiciones hasta 32.767 |
| Tipos de cuantizacion | no disponible (el archivo es de precision float16 por defecto en GPU; el autor no documenta otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); tamano del archivo 3.660.726.272 bytes |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 4 E4B, de la familia Gemma de Google, construida con la misma investigacion y tecnologia que los modelos Gemini. El artefacto de este repositorio no entrena nada: parte de `litert-community/gemma-4-E4B-it-litert-lm` (revision `2eee7ac325f20eb8c9ac1d0e972f7c84663062da`) y aplica `patch_rope.py` con `--split` y `--block 512` para generar el `.litertlm` parcheado. Los pesos son byte a byte los del original; solo cambia el grafo de calculo de fases rotatorias.

La innovacion tecnica es la reescritura del calculo RoPE para evitar perdida de precision en float16. La posicion se divide en una parte alta y una baja (`512·h + l`): la baja pasa por las operaciones MUL/SIN/COS originales y la fase de la alta se toma de una tabla precalculada, combinando ambas por adicion de angulos. El parche se aplica tambien al drafter de decodificacion especulativa. El autor documenta que el archivo es reproducible mediante `ai-edge-litert`, `litert-lm-builder`, `flatbuffers` y `numpy`, y publica hashes SHA-256 del original y del resultado. No se documentan datos de entrenamiento, volumen de tokens, composicion del dataset ni etapas de RLHF o DPO en la informacion disponible.

## Capacidades

- Generacion de texto y conversacion multi-turno en el formato instruct (`-it`) de Gemma 4 E4B.
- Copia literal fiable de cadenas alfanumericas, digitos e identificadores en contextos de hasta 32.767 posiciones, corregida respecto al empaquetado original.
- Capacidad de vision: el autor reporta que la prueba de caption de imagen pasa tanto en el original como en este archivo.
- Decodificacion especulativa con drafter, con el grafo RoPE tambien parcheado.
- Ejecucion on-device en CPU o GPU mediante LiteRT-LM, sin necesidad de sobrescribir la precision de activaciones.
- Tool calling, function calling, razonamiento multi-paso y cobertura multilingue: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes moviles que leen documentos largos: el parche mantiene exactos los identificadores y cifras al copiar fragmentos de prompts de mas de 2.048 tokens, algo que el empaquetado original corrompia en GPU con activaciones de 16 bits.
- Extraccion de numeros de serie, IBAN, codigos de barras o referencias de pedido en una app de iOS o Android: la prueba de copia exacta del autor pasa de 0/48 a 36/72 en prompts de aproximadamente 3.080 y 3.790 tokens, con cero identificadores corruptos entre los fallos.
- Asistentes de campo con contexto largo: al mantener fases rotatorias exactas hasta la posicion 32.767, es adecuado para resumir actas, partes de incidencia o historiales extensos sin degradar la fidelidad numerica.
- Procesamiento de imagenes en dispositivo: la prueba de caption de vision pasa, por lo que sirve para describir capturas o documentos escaneados localmente.
- Despliegue en iPhone y dispositivos Apple Silicon: el autor midio 25,2 tokens/s de decodificacion (mediana) y 190 ms hasta el primer token en un iPhone 17 Pro Max con iOS 27.2, LiteRT-LM 0.19 y Metal.
- Sustitucion directa en pipelines LiteRT-LM existentes: al ser byte-identical a `PowerBeef02/gemma-4-E4B-it-litert-lm-fp16-rope` desde la revision `a1693e22`, se puede cambiar el archivo sin tocar el codigo de integracion.

## Benchmarks y rendimiento

| Prueba | Original | Este archivo |
|---|---|---|
| Copias exactas, ~3.080 y ~3.790 tokens, identificadores entre relleno repetido | 0/48 | 36/72 |
| Identificadores corruptos entre los fallos | 16 | 0 |
| Tokens de decodificacion por segundo, mediana | 24,5 | 25,2 |
| Primer token, ms, mediana | 335 | 190 |
| Caption de vision | Pasa | Pasa |

Medido en un unico iPhone 17 Pro Max con iOS 27.2, LiteRT-LM 0.19, Metal y precision por defecto. El autor advierte que las ejecuciones del original empezaron con el dispositivo mas frio y las de este archivo con el dispositivo mas caliente, y que son mediciones propias en un solo telefono, no una garantia para otros dispositivos. No hay resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo pesa 3,66 GB; en GPU se necesita al menos ese espacio mas el overhead del runtime LiteRT-LM, aunque no se documenta una cifra oficial de VRAM.
- GPU recomendadas: no disponible. El autor solo valida GPU de movil (Metal en iPhone 17 Pro Max) y ejecucion en CPU o GPU mediante LiteRT-LM.
- Cabe en GPU de consumo: si, por tamano de archivo (3,66 GB) es compatible con tarjetas de 8 GB o mas, aunque no hay validacion publicada en GPU de escritorio.
- Opciones de despliegue: LiteRT-LM en CPU o GPU, sin sobrescribir la precision de activaciones. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 25,2 tokens/s de mediana en decodificacion y 190 ms hasta el primer token en iPhone 17 Pro Max con Metal; sin datos para otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este archivo (`HomiG/...rope512`) | no disponible | exacto hasta 32.767 posiciones | copia exacta 36/72; 25,2 tok/s en iPhone 17 Pro Max | Apache 2.0 | Hugging Face, 0 descargas |
| `litert-community/gemma-4-E4B-it-litert-lm` | no disponible | no disponible | copia exacta 0/48; 24,5 tok/s en el mismo dispositivo | Apache 2.0 | Hugging Face, oficial de LiteRT |
| `PowerBeef02/gemma-4-E4B-it-litert-lm-fp16-rope` | no disponible | no disponible | mismo artefacto (byte-identical desde revision `a1693e22`) | Apache 2.0 | Hugging Face, publicacion original del parche |
| `publicsh/gemma-4-E4B-it-litert-lm` | no disponible | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Limitacion conocida y no corregida: en prompts largos donde la instruccion aparece despues de un bloque grande de texto no relacionado, el modelo puede devolver el inicio de ese texto en lugar de seguir la instruccion. El propio autor indica que su prueba de copia sigue fallando por esta causa.
- El parche no cambia los pesos ni el comportamiento general del modelo; solo corrige la precision del calculo de posiciones rotatorias.
- Las mediciones proceden de un unico dispositivo y no son extrapolables a otros telefonos, GPUs o versiones de LiteRT-LM.
- No hay informacion sobre sesgos, tasas de alucinacion, cobertura idiomatica ni restricciones adicionales de uso comercial mas alla de la licencia Apache 2.0.
- Es una modificacion comunitaria independiente, no afiliada, respaldada ni soportada por Google; Gemma es una marca registrada de Google LLC.
- El archivo solo es utilizable con el runtime LiteRT-LM; no hay conversion publicada a GGUF, safetensors ni otros formatos.
- El repositorio no registra descargas ni likes, por lo que no existe validacion externa independiente aparte de la del autor y de `john-rocky`.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HomiG/gemma-4-E4B-it-litert-lm-fp16-rope512
- Modelo base LiteRT: https://huggingface.co/litert-community/gemma-4-E4B-it-litert-lm
- Modelo Gemma 4 E4B original: https://huggingface.co/google/gemma-4-E4B-it
- Publicacion original del parche: https://huggingface.co/PowerBeef02/gemma-4-E4B-it-litert-lm-fp16-rope
- Incidencia LiteRT-LM #3913: https://github.com/google-ai-edge/LiteRT-LM/issues/3913
- Incidencia litert-torch #1343: https://github.com/google-ai-edge/litert-torch/issues/1343
- Repositorio con `patch_rope.py`: https://github.com/PowerBeef/agello-litert-lm
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
