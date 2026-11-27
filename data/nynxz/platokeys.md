# nynxz/PlatoKeys

## Resumen

PlatoKeys es una colección de matrices de alineación lineal en formato `.safetensors` que permiten sustituir el codificador de texto de un modelo de difusión (Krea 2, MOSS-Image) por un codificador más pequeño y rápido, sin reentrenar el modelo generativo. Cada fichero contiene una transformación lineal calibrada en forma cerrada (Ridge o Procrustes) que proyecta los estados ocultos de un codificador origen (Qwen3.5-2B o Qwen3.5-9B) al espacio latente esperado por el modelo destino (Qwen3.5-9B o Qwen3-VL-4B). El autor es `nynxz` y el trabajo se apoya en la técnica "Plato's Key" publicada por Stanford Hazy Research en noviembre de 2026.

El paquete no es un modelo generativo en sentido estricto: es un conjunto de artefactos de calibración diseñados para el nodo personalizado ComfyUI-PlatoKeys. Resuelve el problema del coste computacional del codificador de texto en pipelines de difusión, permitiendo, por ejemplo, usar Qwen3.5-2B en lugar de Qwen3.5-9B como encoder de MOSS-Image, o Qwen3-VL-4B en lugar de un encoder mayor para Krea 2, manteniendo una similitud coseno de tokens en torno a 0,90-0,94.

Los artefactos ocupan entre 16 MB y 240 MB en fp16, con un repositorio total de 1,7 GB. La relevancia actual radica en que ofrece una alternativa de calibración cerrada, reproducible y ligera frente al ajuste fino de encoders, con métricas de calidad publicadas por variante (TokCos, CtrCos, CntCos, RelL2, R², NormR, ChStdR).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformación lineal calibrada (Ridge cerrado o Procrustes) sobre estados ocultos de transformers Qwen3.5 / Qwen3-VL |
| Parámetros totales | No disponible (son matrices de proyección, no un modelo con parámetros en el sentido habitual; tamaño por fichero entre 16 MB y 240 MB en fp16) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del codificador origen y del pipeline ComfyUI) |
| Tipos de cuantización | Solo se distribuyen pesos en fp16; no se documentan otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.safetensors` |

## Arquitectura y entrenamiento

Cada fichero implementa una proyección lineal entre el espacio de representación de un codificador origen y el de un codificador destino. Se ofrecen dos familias de métodos: Ridge en forma cerrada (con `alpha=0.01`) y Procrustes de Plato's Key (con escalado LS o de varianza), además de una variante PCA-Procrustes de rango 256. Las variantes `_norm` añaden un escalado de varianza del objetivo para corregir la NormR. La calibración se realiza sobre pares de estados ocultos alineados por token; en el caso de tokenizadores distintos (Qwen3.5 → Qwen3-VL), la alineación se hace por spans de bytes UTF-8 con una coincidencia de tokens del 99,99%.

Los conjuntos de calibración documentados son 2.000 prompts diversos para MOSS-Image (75.116 tokens de entrenamiento y 5.710 de validación retenidos) y taps multi-capa para Krea 2: 12 capas proporcionales del origen (`[1,3,5,7,9,11,13,15,17,19,21,23]` para Qwen3.5-2B y `[2,4,7,10,12,15,18,20,23,26,28,31]` para Qwen3.5-9B) mapeadas a las capas `[2,5,8,11,14,17,20,23,26,29,32,35]` de Krea 2, con aplanado a `[B, seq, 30720]`. No se documenta RLHF, DPO ni ajuste fino; el método es puramente de regresión lineal en forma cerrada.

## Capacidades

- Sustitución de codificador de texto en pipelines ComfyUI: permite usar Qwen3.5-2B como encoder de MOSS-Image en lugar de Qwen3.5-9B, o Qwen3.5-2B/9B como encoder de Krea 2 en lugar de Qwen3-VL-4B.
- Alineación bidireccional en el par Qwen3.5-2B ↔ Qwen3.5-9B (hay claves en ambos sentidos).
- Alineación cross-tokenizer Qwen3.5 → Qwen3-VL-4B mediante spans de bytes UTF-8.
- Soporte de text encoding plano (`Load Plato Key` + `Plato Key Encode`) y de parcheo de CLIP (`Patch CLIP (Plato Key)`) para Visual Fusion y nodos CLIP descendentes.
- Taps multi-capa (12 capas) para Krea 2, con eliminación automática del prefijo sistema+usuario de Krea 2.
- No incluye generación de texto, razonamiento, código, matemáticas, tool calling ni capacidades de agente: es un artefacto de calibración, no un LLM.
- No se documentan capacidades multilingües propias.

## Casos de uso

- Acelerar pipelines de MOSS-Image en ComfyUI: cargar `qwen35_2b_to_qwen35_9b_moss_image_ridge.safetensors` y usar Qwen3.5-2B como encoder, reduciendo el coste de codificación de texto manteniendo TokCos 0,8978 frente al encoder de 9B.
- Reducir VRAM en inferencia de Krea 2: emplear la clave `qwen35_2b_to_qwen3vl_4b_krea2_ridge.safetensors` (120 MB) para sustituir Qwen3-VL-4B por Qwen3.5-2B con TokCos 0,9352 y RelL2 0,3548.
- Maximizar calidad con encoder grande en Krea 2: usar `qwen35_9b_to_qwen3vl_4b_krea2_ridge.safetensors` (240 MB) cuando se disponga de VRAM para Qwen3.5-9B y se priorice fidelidad (TokCos 0,9432, R² 0,7723).
- Flujos de Visual Fusion: parchear el CLIP con `Patch CLIP (Plato Key)` y alimentar `Text Encode (Fusion)` para inyectar representaciones alineadas en nodos CLIP descendentes.
- Prototipado rápido en estaciones con GPU de consumo: las claves de 16 MB permiten experimentar con el par 2B↔9B sin descargar codificadores adicionales.
- Evaluación comparativa de métodos de calibración: las variantes Ridge, Procrustes, Procrustes+norm y PCA-256 permiten medir el impacto de cada técnica sobre TokCos, CtrCos, CntCos, RelL2, R², NormR y ChStdR en el mismo pipeline.
- Despliegue de pipelines de difusión con encoder ligero en producción: al ser ficheros `.safetensors` de tamaño reducido, se integran en imágenes de contenedor sin penalizar el arranque.

## Benchmarks y rendimiento

Métricas publicadas por el autor sobre los conjuntos de validación retenidos (TokCos = similitud coseno por token; CtrCos = coseno de centro; CntCos = coseno de contenido; RelL2 = error L2 relativo; R² = coeficiente de determinación; NormR = ratio de norma; ChStdR = ratio de desviación típica por canal).

MOSS-Image, dirección Qwen3.5-2B → Qwen3.5-9B:

| Fichero | Método | TokCos | CtrCos | CntCos | RelL2 | R² | NormR | ChStdR |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| `qwen35_2b_to_qwen35_9b_moss_image_ridge.safetensors` (recomendado) | Ridge (`alpha=0.01`) | 0,8978 | 0,8402 | 0,8088 | 0,4291 | 0,7486 | 0,9035 | 0,9981 |
| `qwen35_2b_to_qwen35_9b_moss_image_ridge_norm.safetensors` | Ridge + escala de varianza | 0,8951 | 0,8402 | 0,8088 | 0,4497 | 0,7238 | 1,0092 | 0,9981 |
| `qwen35_2b_to_qwen35_9b_moss_image_procrustes.safetensors` | Procrustes + LS | 0,8560 | 0,7850 | 0,7598 | 0,5163 | 0,6360 | 0,8640 | 0,9854 |
| `qwen35_2b_to_qwen35_9b_moss_image_procrustes_norm.safetensors` | Procrustes + varianza | 0,8514 | 0,7850 | 0,7598 | 0,5463 | 0,5925 | 1,0072 | 0,9854 |
| `qwen35_2b_to_qwen35_9b_moss_image_procrustes_pca256.safetensors` | PCA-256 Procrustes | 0,8375 | 0,7492 | 0,7109 | 0,5419 | 0,5991 | 0,8393 | 0,9855 |

MOSS-Image, dirección Qwen3.5-9B → Qwen3.5-2B:

| Fichero | Método | TokCos | CtrCos | CntCos | RelL2 | R² | NormR | ChStdR |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| `qwen35_9b_to_qwen35_2b_moss_image_ridge.safetensors` (recomendado) | Ridge | 0,9433 | 0,8902 | 0,8693 | 0,3309 | 0,8384 | 0,9333 | 0,9986 |
| `qwen35_9b_to_qwen35_2b_moss_image_ridge_norm.safetensors` | Ridge + varianza | 0,9408 | 0,8902 | 0,8693 | 0,3471 | 0,8222 | 1,0056 | 0,9986 |
| `qwen35_9b_to_qwen35_2b_moss_image_procrustes.safetensors` | Procrustes + LS | 0,8884 | 0,8184 | 0,7939 | 0,4539 | 0,6962 | 0,8806 | 0,9834 |
| `qwen35_9b_to_qwen35_2b_moss_image_procrustes_norm.safetensors` | Procrustes + varianza | 0,8842 | 0,8184 | 0,7939 | 0,4801 | 0,6601 | 1,0061 | 0,9834 |
| `qwen35_9b_to_qwen35_2b_moss_image_procrustes_pca256.safetensors` | PCA-256 Procrustes | 0,8693 | 0,7793 | 0,7443 | 0,4864 | 0,6512 | 0,8548 | 0,9838 |

Krea 2 (tap de 12 capas), Qwen3.5-2B → Qwen3-VL-4B:

| Fichero | Método | TokCos | CtrCos | CntCos | RelL2 | R² | NormR | ChStdR |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| `qwen35_2b_to_qwen3vl_4b_krea2_ridge.safetensors` (recomendado) | Ridge | 0,9352 | 0,8638 | 0,8573 | 0,3548 | 0,7412 | 0,9377 | 0,9977 |
| `qwen35_2b_to_qwen3vl_4b_krea2_ridge_norm.safetensors` | Ridge + varianza | 0,9309 | 0,8638 | 0,8573 | 0,3756 | 0,7097 | 1,0181 | 0,9977 |
| `qwen35_2b_to_qwen3vl_4b_krea2_procrustes.safetensors` | Procrustes + LS | 0,9008 | 0,7954 | 0,7920 | 0,4443 | 0,5965 | 0,9168 | 0,9711 |
| `qwen35_2b_to_qwen3vl_4b_krea2_procrustes_norm.safetensors` | Procrustes + varianza | 0,8914 | 0,7954 | 0,7920 | 0,4817 | 0,5258 | 1,0360 | 0,9711 |

Krea 2 (tap de 12 capas), Qwen3.5-9B → Qwen3-VL-4B:

| Fichero | Método | TokCos | CtrCos | CntCos | RelL2 | R² | NormR | ChStdR |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| `qwen35_9b_to_qwen3vl_4b_krea2_ridge.safetensors` (recomendado) | Ridge | 0,9432 | 0,8798 | 0,8759 | 0,3324 | 0,7723 | 0,9454 | 0,9978 |
| `qwen35_9b_to_qwen3vl_4b_krea2_ridge_norm.safetensors` | Ridge + varianza | 0,9400 | 0,8798 | 0,8759 | 0,3500 | 0,7472 | 1,0164 | 0,9978 |
| `qwen35_9b_to_qwen3vl_4b_krea2_procrustes.safetensors` | Procrustes + LS | 0,9020 | 0,7932 | 0,7932 | 0,4417 | 0,6000 | 0,9155 | 0,9697 |
| `qwen35_9b_to_qwen3vl_4b_krea2_procrustes_norm.safetensors` | Procrustes + varianza | 0,8937 | 0,7932 | 0,7932 | 0,4769 | 0,5334 | 1,0285 | 0,9697 |

No se han publicado resultados de benchmarks generativos (MMLU, HumanEval, GSM8K, FID, CLIP score) en la información disponible.

## Requisitos de hardware

- VRAM estimada para las claves: insignificante (16 MB a 240 MB en fp16); el requisito real lo impone el codificador origen y el modelo de difusión.
- Codificador Qwen3.5-2B: apto para GPU de consumo (RTX 3060 12 GB, RTX 4070, RTX 4090) en fp16; en cuantización de 4 bits cabe en GPUs de 6-8 GB.
- Codificador Qwen3.5-9B: requiere aproximadamente 18 GB en fp16, por lo que se recomienda A100 40 GB, H100 o RTX 4090 24 GB (justo en fp16; en 8 bits cabe holgadamente).
- Codificador Qwen3-VL-4B: aproximadamente 8 GB en fp16; cabe en RTX 3060 12 GB, RTX 4070 y superiores.
- Despliegue: exclusivamente a través de ComfyUI con el nodo ComfyUI-PlatoKeys; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a matrices de proyección).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Origen → destino | Tamaño | Método | TokCos | Licencia |
|---|---|---|---:|---|---:|
| PlatoKeys MOSS-Image (2B→9B) | Qwen3.5-2B → Qwen3.5-9B | 16 MB | Ridge | 0,8978 | Apache 2.0 |
| PlatoKeys MOSS-Image (9B→2B) | Qwen3.5-9B → Qwen3.5-2B | 16 MB | Ridge | 0,9433 | Apache 2.0 |
| PlatoKeys Krea 2 (2B→VL-4B) | Qwen3.5-2B → Qwen3-VL-4B | 120 MB | Ridge | 0,9352 | Apache 2.0 |
| PlatoKeys Krea 2 (9B→VL-4B) | Qwen3.5-9B → Qwen3-VL-4B | 240 MB | Ridge | 0,9432 | Apache 2.0 |

No se dispone de información sobre otros paquetes de claves de alineación comparables publicados en la misma fecha; el único referente metodológico citado es Plato's Key de Stanford Hazy Research. No se dispone de comparación con codificadores ajustados por fine-tuning.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni imágenes por sí mismo; solo transforma representaciones latentes.
- Depende estrictamente de ComfyUI y del nodo ComfyUI-PlatoKeys; no hay integración documentada con otros frameworks.
- Solo se distribuyen pesos en fp16; no hay versiones cuantizadas ni GGUF.
- La calidad de la alineación es aproximada: RelL2 entre 0,33 y 0,55 y R² entre 0,53 y 0,84 según variante, lo que implica divergencia respecto al codificador original.
- Las claves están calibradas para pares concretos de codificadores (Qwen3.5-2B/9B y Qwen3-VL-4B) y para plantillas específicas (MOSS-Image con `
