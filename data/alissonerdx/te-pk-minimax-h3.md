# Alissonerdx/TE-PK-Minimax-H3

## Resumen

TE-PK-Minimax-H3 (Plato's Key Text Encoders for MiniMax-H3) es una colección de adaptadores lineales de proyección que mapean las representaciones ocultas de codificadores de texto modernos nativos de ComfyUI (Qwen 3.5, Qwen 3.8 y Gemma 4) al espacio geométrico nativo de 5.120 dimensiones del codificador `Qwen3-VL-32B` que utiliza MiniMax-H3. No se trata de un modelo generativo autónomo, sino de un conjunto de matrices de calibración que permiten sustituir el codificador de texto original de MiniMax-H3 por alternativas más ligeras sin reentrenar el pipeline de difusión de vídeo.

La innovación central es el uso de regresión Ridge en forma cerrada (sin gradientes, sin LoRA y sin pesos MLP externos) para alinear los canales anisótropos de 5.120 dimensiones de MiniMax-H3. Los adaptadores se calibran sobre 800 prompts de vídeo del dominio de MiniMax-H3 con una partición 90/10 de retención, y se publican como ficheros `.safetensors` de entre 20 y 105 MB cada uno.

El proyecto es relevante para quienes trabajan con MiniMax-H3 en ComfyUI y quieren reducir el coste de memoria del codificador de texto (Qwen3-VL-32B es muy pesado) manteniendo una fidelidad de prompt alta, medida en coseno de hasta 0,9626 y R² de hasta 0,9949 con Qwen 3.5. La versión `v2 Ridge` está declarada como operativa; la `v3` está en desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores lineales de proyección (Ridge en forma cerrada y Procrustes ortogonal); no es un transformer generativo |
| Parametros totales | No disponible (cada clave pesa entre 20 MB y 105 MB; el repo completo ocupa 1,5 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del codificador de texto donante y de MiniMax-H3) |
| Tipos de cuantizacion | No disponible para las claves; los codificadores donantes se distribuyen en `int8_convrot` (p. ej. `qwen3.5_9b_int8_convrot.safetensors`) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (claves de proyección); los codificadores de texto se cargan aparte desde Comfy-Org |

## Arquitectura y entrenamiento

Cada clave es una matriz de proyección lineal calibrada en forma cerrada. La variante Ridge resuelve `(XᵀX + λI)⁻¹XᵀY`, donde `X` son las activaciones del codificador donante y `Y` las del `Qwen3-VL-32B` nativo de MiniMax-H3. La variante Procrustes aplica una rotación ortogonal pura más un escalado global. No hay entrenamiento por gradiente, ni LoRA, ni MLP de proyección externa. El conjunto de calibración son 800 prompts de vídeo del dominio de MiniMax-H3, con partición 90/10 para validación retenida.

Las claves se distinguen por la capa de extracción: `-1` (última capa, post-RMSNorm) es óptima para Qwen 3.5, y `-2` (penúltima capa, antes de la normalización final del LM-head) es óptima para Gemma 4 en escenarios entre familias. Cada `.safetensors` almacena en su cabecera la capa calibrada, de modo que el nodo `Plato's Key Patch CLIP` configura automáticamente la capa CLIP y la paridad de RMSNorm, sin necesidad de `CLIPSetLastLayer`. Existe además una variante `_norm` que reescala la norma del vector proyectado a 1,00× de la varianza objetivo.

## Capacidades

- Proyección de representaciones de Qwen 3.5 (0.8B, 2B, 4B, 9B) al espacio de 5.120 dimensiones de MiniMax-H3.
- Proyección de representaciones de Gemma 4 (E2B, E4B, 12B, 31B) al mismo espacio.
- Proyección de Qwen 3.8-27B mediante Procrustes (5120→5120).
- Sustitución del codificador de texto `Qwen3-VL-32B` nativo de MiniMax-H3 por codificadores más ligeros en ComfyUI.
- Compatibilidad con todos los modos de MiniMax-H3: T2VA, Image-to-Video, FL2VA y Ref2VA.
- Integración vía el nodo personalizado `ComfyUI-H3-Text-Encoders` (`Plato's Key Patch CLIP`).
- Ajuste de `strength` (recomendado 1,05–1,10 para el efecto `ridge_norm`).
- No soporta tool calling, agentes, ni generación de texto propia: es un adaptador de espacio latente, no un modelo de lenguaje.

## Casos de uso

- Inferencia de MiniMax-H3 en GPU con VRAM limitada: sustituir `Qwen3-VL-32B` por Qwen 3.5-0.8B (clave de 20 MB) reduce drásticamente el coste del codificador de texto manteniendo un coseno de 0,9492 frente al espacio nativo.
- Pipelines de generación de vídeo texto-a-vídeo en ComfyUI: usar `minimax_h3_32b_pk_ridge_qwen3.5_2b.safetensors` (40 MB, coseno 0,9620, R² 0,9949) para equilibrar fidelidad de prompt y huella de memoria.
- Sustitución de codificador entre familias: emplear Gemma 4-31B con la clave `-2` (coseno 0,9254) cuando el equipo ya tiene Gemma 4 desplegado y quiere reutilizarlo con MiniMax-H3.
- Prototipado rápido de prompts de vídeo: cargar Qwen 3.5-0.8B con su clave Ridge para iterar sobre descripciones de vídeo con baja latencia de codificación.
- Evaluación comparativa de codificadores de texto para difusión de vídeo: el repo permite medir coseno y R² de distintos donantes contra el espacio nativo de MiniMax-H3 en el mismo pipeline.
- Flujos Image-to-Video y Reference-to-Video en ComfyUI: conectar `Load CLIP` → `Plato's Key Patch CLIP` → `MiniMax H3 Image to Video` o `MiniMax H3 Reference to Video` con la clave correspondiente al codificador cargado.

## Benchmarks y rendimiento

Validación retenida sobre 800 prompts de vídeo de MiniMax-H3 (split 90/10).

| Codificador (fichero de clave) | Dims | Método | Coseno | R² | Tamaño |
|---|---|---:|---:|---:|---:|
| Qwen3.5-9B | 4096→5120 | Ridge (`-1`) | 0,9626 | 0,9935 | 80 MB |
| Qwen3.5-2B | 2048→5120 | Ridge (`-1`) | 0,9620 | 0,9949 | 40 MB |
| Qwen3.5-4B | 2560→5120 | Ridge (`-1`) | 0,9502 | 0,9917 | 50 MB |
| Qwen3.5-0.8B | 1024→5120 | Ridge (`-1`) | 0,9492 | 0,9931 | 20 MB |
| Gemma-4-31B | 5376→5120 | Ridge (`-2`) | 0,9254 | 0,8055 | 105 MB |
| Gemma-4-E4B | 2560→5120 | Ridge (`-2`) | 0,9204 | 0,7766 | 50 MB |
| Gemma-4-E2B | 1536→5120 | Ridge (`-2`) | 0,9045 | 0,7177 | 30 MB |
| Gemma-4-12B | 3840→5120 | Ridge (`-2`) | 0,8909 | 0,6580 | 75 MB |
| Qwen3.8-27B | 5120→5120 | Procrustes (`-1`) | 0,8812 | 0,0338 | 100 MB |

No se han publicado resultados de benchmarks de calidad de vídeo generado (FVD, CLIP-score, adherencia de prompt medida externamente) en la información disponible.

## Requisitos de hardware

- VRAM de los adaptadores: despreciable (20–105 MB por clave). El coste real lo determina el codificador donante cargado en `ComfyUI/models/text_encoders/`.
- Codificador Qwen 3.5-0.8B: apto para GPUs de consumo (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB) en cuantización `int8_convrot`.
- Codificador Qwen 3.5-9B: recomendable RTX 4090 24 GB, A100 40 GB o H100 80 GB para holgura.
- Codificador Qwen 3.8-27B: requiere A100 40/80 GB o H100 80 GB en precisión completa; en `int8` puede ajustarse a 24 GB con margen limitado.
- Codificador Gemma 4-31B: A100 80 GB o H100 80 GB recomendadas.
- Despliegue: ComfyUI con el nodo personalizado `ComfyUI-H3-Text-Encoders`; no se mencionan vLLM, llama.cpp, Ollama ni TGI para estas claves.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Alternativa | Tipo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Codificador nativo `Qwen3-VL-32B` de MiniMax-H3 | Codificador de texto nativo | ~32B | No disponible | No disponible | Referencia de espacio (5.120 dims); máxima fidelidad, mayor coste de VRAM |
| TE-PK-Minimax-H3 con Qwen 3.5-2B (Ridge) | Adaptador lineal | 2B (donante) | No disponible | Apache 2.0 | Coseno 0,9620, R² 0,9949, clave de 40 MB |
| TE-PK-Minimax-H3 con Qwen 3.5-0.8B (Ridge) | Adaptador lineal | 0,8B (donante) | No disponible | Apache 2.0 | Coseno 0,9492, R² 0,9931, clave de 20 MB, mínimo coste |
| TE-PK-Minimax-H3 con Gemma 4-31B (Ridge) | Adaptador lineal | 31B (donante) | No disponible | Apache 2.0 | Coseno 0,9254, R² 0,8055, clave de 105 MB |

No se dispone de comparativas con otros adaptadores de proyección para MiniMax-H3 en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un generador de vídeo: es un conjunto de matrices de proyección que requiere un codificador donante y el pipeline MiniMax-H3 en ComfyUI.
- La versión `v3` está en desarrollo y recalibra todas las claves contra `Qwen3-VL-32B` sobre ~20k prompts; los valores actuales corresponden a `v2` calibrado sobre 800 prompts, por lo que pueden cambiar.
- La variante Procrustes de Qwen 3.8-27B presenta un R² muy bajo (0,0338) pese a un coseno de 0,8812; no es adecuada cuando se requiere fidelidad de canal.
- Gemma 4 muestra R² notablemente inferior a Qwen 3.5 (0,66–0,81 frente a 0,99), lo que indica peor ajuste en canales de varianza alta.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta; no hay evidencia de uso en producción ni validación independiente.
- No se documentan sesgos, riesgos de alucinación ni comportamiento multilingüe del pipeline resultante; esos riesgos recaen sobre MiniMax-H3 y el codificador donante.
- La licencia Apache 2.0 cubre las claves, pero el uso comercial depende también de las licencias de MiniMax-H3 y de los codificadores Qwen 3.5/3.8 y Gemma 4, que deben verificarse por separado.
- Requiere mantener actualizado el nodo `ComfyUI-H3-Text-Encoders`; versiones desalineadas pueden romper la paridad de RMSNorm y la capa configurada en la cabecera de la clave.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Alissonerdx/TE-PK-Minimax-H3
- Nodo ComfyUI: https://github.com/alisson-anjos/ComfyUI-H3-Text-Encoders
- Codificador Qwen 3.5 (Comfy-Org): https://huggingface.co/Comfy-Org/Qwen3.5
- Codificador Gemma 4 (Comfy-Org): https://huggingface.co/Comfy-Org/gemma-4
- Codificador Qwen 3.8-27B (Comfy-Org): https://huggingface.co/Comfy-Org/Qwen3.8-27B
- Vídeo comparativo: https://huggingface.co/Alissonerdx/TE-PK-Minimax-H3/resolve/main/showcase/H3_PlatosKey_Ridge_Comparison.mp4
