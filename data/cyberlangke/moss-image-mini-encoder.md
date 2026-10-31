# cyberlangke/moss-image-mini-encoder

## Resumen

Moss-image-mini-encoder es un conjunto de adaptadores de proyección lineal desarrollados por el usuario cyberlangke que permiten sustituir el codificador de texto de 9B parámetros (Qwen3.5-9B) del modelo de generación de imágenes MOSS-Image por estudiantes mucho más pequeños: Qwen3.5-0.8B, 2B o 4B. El problema que resuelve es el coste de memoria y cómputo del codificador de texto en pipelines de generación de imágenes, especialmente en ComfyUI, donde el codificador de 9B resulta prohibitivo para GPUs de consumo.

Técnicamente no es un modelo nuevo ni una destilación completa: los pesos del estudiante se mantienen totalmente congelados y solo se entrena una proyección lineal por token (de 48 a 120 MB) que mapea la concatenación de seis capas intermedias del estudiante al espacio de 4096 dimensiones que espera el DiT de MOSS-Image. El repositorio incluye además pesos cuantizados (int8 y w4a8) de los estudiantes, listos para ComfyUI. Es relevante porque reduce la VRAM del codificador de ~18 GB (9B en bf16) a menos de 1 GB (0.8B w4a8), con una degradación medible pero documentada con detalle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de proyección lineal por token sobre LLM congelado (Qwen3.5) usado como codificador de texto para DiT |
| Parametros totales | Adaptador: 48–120 MB según tamaño; estudiante: 0.8B / 2B / 4B |
| Parametros activos | No disponible (los estudiantes no son MoE según la información disponible) |
| Longitud de contexto | Entrenado con P99 de 937 tokens, máximo 3235; prompts más largos son fuera de distribución |
| Tipos de cuantizacion | bf16 (pesos oficiales), int8, w4a8 (asimétrico, compatible con `asym_w4a8_int8` / `int8_tensorwise` de ComfyUI) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 (adaptador); los pesos base de Qwen3.5 siguen su propia licencia |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El método consiste en extraer los estados ocultos de seis capas fijas del estudiante (capas 2, 4, 8, 12, 16 y la última), concatenarlos a lo largo del eje de características (6144 dimensiones para 0.8B, 12288 para 2B, 15360 para 4B) y aplicar una normalización por token seguida de una proyección lineal: `((h-mean)/std) @ W * std_y + mean_y`. Cada token se mapea de forma independiente, sin atención adicional. El resultado es un vector condicional de 4096 dimensiones compatible con el DiT de MOSS-Image.

El entrenamiento se realizó sobre 38.496 prompts que combinan captions en chino e inglés, tags, layout JSON de MOSS y prompts negativos. La evaluación de la similitud coseno se hizo sobre un conjunto de validación de 6.374.951 tokens. No hay RLHF ni DPO: no aplica, dado que solo se entrena la matriz de proyección. La cuantización de los estudiantes se generó con el cuantizador `comfy_kitchen` de ComfyUI mediante el script `quantize_encoder.py` del propio proyecto.

## Capacidades

- Sustitución del codificador de texto de 9B de MOSS-Image por uno de 0.8B, 2B o 4B sin reentrenar el DiT
- Generación de imágenes condicionada por texto dentro de ComfyUI mediante el nodo `MossCLIPLoader`
- Comprensión de prompts en chino e inglés, incluidos layout JSON estructurados de MOSS (hasta ~937 tokens con fiabilidad)
- Cinco niveles de compromiso calidad/VRAM: 0.8B (bf16, int8, w4a8), 2B (bf16, int8, w4a8) y 4B (w4a8)
- Reproducción de entidades con nombre propio (personajes, marcas) proporcional al tamaño del estudiante: 4B identifica el dominio de la obra, 2B y 0.8B degradan hacia representaciones genéricas
- No es un modelo de lenguaje de propósito general: solo produce condicionamiento para MOSS-Image

## Casos de uso

- Generación de imágenes en GPUs de consumo con ComfyUI: el codificador 0.8B w4a8 ocupa solo 958 MB de VRAM, lo que libera memoria para el DiT en tarjetas de 8–12 GB
- Reducción del tiempo de carga de modelos en flujos de trabajo iterativos: los estudiantes de 0.8B y 2B reducen el tiempo end-to-end de 33,1 s (9B) a 20,3–21,7 s en las pruebas del autor
- Prototipado rápido de prompts: la codificación pura de 0.8B bf16 tarda 43–47 ms frente a 87–131 ms del 9B, útil para explorar variaciones de prompt
- Despliegue multiusuario en servidores con VRAM limitada: la variante 2B w4a8 (2,38 GB) ofrece un equilibrio entre fidelidad y ocupación
- Generación con prompts estructurados (layout JSON de MOSS) hasta ~900 tokens, con la variante 4B recomendada para evitar errores de caracteres en prompts largos
- Ajuste fino del equilibrio calidad/recursos: se puede elegir entre cinco configuraciones (0.8B a 4B, con o sin cuantización) según la GPU disponible, manteniendo compatibilidad con el mismo DiT

## Benchmarks y rendimiento

El autor publica métricas de similitud coseno por token frente al condicional del 9B (validación de 6.374.951 tokens) y tiempos medidos con 10 prompts mixtos chino/inglés (incluido uno de 627 tokens), en 1024×1024, seed 42, 4 pasos, cfg 1:

| Variante | cos medio | cos mínimo | relL2 | Codificación 30/326 tok (ms) | End-to-end en caliente (s) |
|---|---:|---:|---:|---:|---:|
| 9B w4a8 (referencia) | 1,0000 | 1,0000 | 0,0000 | 87,0 / 130,7 | 33,1 |
| 4B w4a8 | 0,8638 | 0,8099 | 0,537 | 87,9 / 86,9 | 23,6 |
| 2B bf16 | 0,8406 | 0,7924 | 0,697 | 43,1 / 44,8 | 21,7 |
| 2B w4a8 | 0,8372 | 0,7862 | 0,720 | 72,9 / 71,1 | 20,4 |
| 0.8B bf16 | 0,8149 | 0,7640 | 0,830 | 47,3 / 43,4 | 20,3 |
| 0.8B w4a8 | 0,8136 | 0,7633 | 0,780 | 91,3 / 76,8 | 20,9 |

Métricas de entrenamiento (coseno y relL2 sobre el conjunto de entrenamiento) por adaptador:

| Adaptador | Estudiante | Cuantización | cos | relL2 |
|---|---|---|---:|---:|
| qwen3.5-0.8b_linear | 0.8B | bf16 | 0,85192 | 0,5237 |
| qwen3.5-0.8b_int8_linear | 0.8B | int8 | 0,85169 | 0,5241 |
| qwen3.5-0.8b_w4a8_linear | 0.8B | w4a8 | 0,84997 | 0,5268 |
| qwen3.5-2b_linear | 2B | bf16 | 0,87478 | 0,4846 |
| qwen3.5-2b_int8_linear | 2B | int8 | 0,87474 | 0,4846 |
| qwen3.5-2b_w4a8_linear | 2B | w4a8 | 0,87326 | 0,4873 |
| qwen3.5-4b_w4a8_linear | 4B | w4a8 | 0,89692 | 0,4422 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.); no aplican al tratarse de un adaptador para generación de imágenes.

## Requisitos de hardware

- VRAM del codificador según variante: 0.8B w4a8 ≈ 958 MB; 0.8B int8 ≈ 1,17 GB; 2B w4a8 ≈ 2,4 GB; 2B int8 ≈ 2,97 GB; 4B w4a8 ≈ 3,8 GB; el 9B original en bf16 requiere considerablemente más (no disponible la cifra exacta)
- La VRAM total dependerá además del DiT de MOSS-Image y de los LoRA cargados; no disponible el desglose completo
- Compatible con GPUs de consumo: la variante 0.8B w4a8 cabe holgadamente en tarjetas de 8 GB; la 2B w4a8 en tarjetas de 12–16 GB; la 4B w4a8 en tarjetas de 16–24 GB (estimaciones, no confirmadas por el autor)
- Despliegue: ComfyUI mediante los nodos `MossCLIPLoader` → `CLIPTextEncode` → `KSampler` del repositorio complementario; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI
- Latencia de codificación: 43–131 ms según variante y longitud (30–326 tokens); la codificación representa solo el 0,2–0,5 % del tiempo end-to-end, que domina la carga del modelo y el muestreo
- Nota: w4a8 es más lento que bf16 en codificación pura (requiere desquantización), pero ahorra VRAM

## Comparativa con modelos similares

| Característica | moss-image-mini-encoder (0.8B–4B) | Codificador oficial MOSS-Image (Qwen3.5-9B) | moss-image-smaller-encoder (bakapotatolord) |
|---|---|---|---|
| Parametros del codificador | 0.8B / 2B / 4B | 9B | No disponible |
| VRAM del codificador | 0,96–3,84 GB (cuantizado) | No disponible (mayor) | No disponible |
| Formato | safetensors (adaptador + estudiante) | Pesos oficiales Qwen | No disponible |
| Cuantización incluida | int8, w4a8 | w4a8 (según pruebas del autor) | No disponible |
| Licencia | Apache 2.0 (adaptador) | La de Qwen3.5-9B | No disponible |
| Compatibilidad | ComfyUI (nodo propio) | ComfyUI nativo (`CLIPLoader`) | ComfyUI (formato de adaptador compartido) |

El proyecto reconoce como base metodológica a ComfyUI-ClipProj (método de entrenamiento de la proyección) y a moss-image-smaller-encoder (formato del adaptador).

## Limitaciones y advertencias

- Degradación en la vinculación de nombres propios según el tamaño: 9B reproduce personajes y marcas correctamente; 4B solo identifica el dominio de la obra (confunde personajes dentro de la misma franquicia); 2B y 0.8B pierden la identidad y generan representaciones genéricas
- El 0.8B comete errores de caracteres individuales en prompts largos y estructurados: en un layout JSON de 627 tokens, el carácter `捐` se dibujó sistemáticamente como `抬` cinco veces en la misma imagen; el 4B no presenta este problema
- Prompts por encima del P99 del conjunto de entrenamiento (937 tokens; máximo 3235) son fuera de distribución y pueden producir resultados impredecibles
- El adaptador debe coincidir exactamente con el tamaño y la cuantización del estudiante: usar el adaptador equivocado produce condicionales con coseno 0,9927 y pérdida visible de detalle en la imagen
- Solo es compatible con MOSS-Image; la salida está fijada a 4096 dimensiones y no sirve para otros DiT
- w4a8 es más lento que bf16 en codificación pura pese a ocupar menos VRAM
- Los pesos base de Qwen3.5 siguen su propia licencia, que puede imponer condiciones distintas a Apache 2.0 para uso comercial
- Proyecto de un autor individual con 0 descargas registradas en el momento de la ficha: conviene validar en producción antes de depender de él
- Riesgo de alucinación visual heredado del propio MOSS-Image y del tamaño del estudiante: a menor tamaño, mayor tendencia a ignorar el prompt

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyberlangke/moss-image-mini-encoder
- Repositorio con código y nodos de ComfyUI: https://github.com/1cyberlangke1/moss-image-mini-encoder
- Matriz completa de benchmarks (8 configuraciones × 10 prompts): https://github.com/1cyberlangke1/moss-image-mini-encoder/blob/main/docs/benchmark.md
- ComfyUI-ClipProj (método de entrenamiento): https://github.com/nicolab28/ComfyUI-ClipProj
- moss-image-smaller-encoder (formato de adaptador): https://github.com/bakapotatolord/moss-image-smaller-encoder
- MOSS-Image: https://github.com/OpenMOSS/MOSS-Image
- Modelos base Qwen3.5: https://huggingface.co/Qwen/Qwen3.5-0.8B, https://huggingface.co/Qwen/Qwen3.5-2B, https://huggingface.co/Qwen/Qwen3.5-4B, https://huggingface.co/Qwen/Qwen3.5-9B
