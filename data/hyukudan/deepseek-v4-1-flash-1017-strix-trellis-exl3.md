# hyukudan/DeepSeek-V4.1-Flash-1017-strix-trellis-EXL3

## Resumen

Este repositorio, publicado por el usuario hyukudan, no es un modelo autónomo, sino un paquete de cuantizaciones trellis-coded (formato EXL3, estilo QTIP) de las líneas densas del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek AI. Incluye pesos para las proyecciones de atención (`wq_a`, `wkv`, `wq_b`, `wo_a`, `wo_b`), el experto compartido del MoE (`w1`/`w3`/`w2`) y la cabeza de salida, a 3, 4, 5 y 6 bits por peso (packs K3, K4, K5 y K6).

Estos pesos están diseñados para ejecutarse sobre el motor `strix-halo-engine-lab`, una configuración orientada al hardware AMD Strix Halo, combinándolos con un GGUF Q2 base y un overlay denso U6. Su relevancia radica en que permite desplegar un modelo grande tipo DeepSeek en estaciones de trabajo con memoria unificada, reduciendo drásticamente la huella de memoria de las matrices densas sin reemplazar los expertos enrutados del MoE.

La configuración de producción recomendada por el autor (mix-B) usa el pack K4 para las clases densas y K5 para la cabeza de salida, con K3 y K6 disponibles como alternativas de tamaño y calidad. La cuantización se realizó desde el checkpoint FP8 original, con calibración mediante pasadas del propio modelo sobre unos 65.000 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Paquete de pesos cuantizados (trellis/EXL3) de un modelo MoE tipo DeepSeek (MLA + expertos enrutados + experto compartido) |
| Parametros totales | no disponible (los expertos enrutados, embeddings y normas no están en este repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (definida por el modelo base DeepSeek-V4.1-Flash-1017) |
| Tipos de cuantizacion | EXL3 trellis a 3, 4, 5 y 6 bits (codebook mul1, LDLQ); se combina con GGUF Q2 y overlay denso U6 |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (packs trellis) + manifiestos SHA-256; requiere GGUF Q2 y overlay U6 del ecosistema strix |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado: es un artefacto de cuantización. El modelo base, DeepSeek-V4.1-Flash-1017, es una arquitectura MoE de DeepSeek con atención de tipo MLA (evidente por los tensores `wq_a`/`wq_b`/`wkv`), un experto compartido junto a los expertos enrutados, y 40 capas densas cuantizadas en estos packs (`dense.L0` a `dense.L39`). Los datos de entrenamiento del modelo base no están disponibles en la información proporcionada.

Sobre la técnica de cuantización: se empleó exllamav3 1.6.3 (`quantize_exl3`, de turboderp) con codebook `mul1`, semilla 787 y método LDLQ. Cada línea densa se almacena como tres tensores: `.trellis` (I16), `.suh` y `.svh` (F16), con el peso efectivo reconstruido como W = diag(suh) · H_I · Q · H_O · diag(svh), donde H es la transformada de Sylvester Hadamard normalizada en bloques de 128. Los pesos fuente se dequantizaron del checkpoint FP8 original (revisión `1bae0e10`), y las matrices de Hessians para la calibración provienen de pasadas del propio modelo sobre 39 segmentos de calibración (≈65K tokens), disjuntos del conjunto de evaluación.

## Capacidades

Al no ser un modelo autónomo, las capacidades dependen del modelo base DeepSeek-V4.1-Flash-1017 y del motor strix-halo-engine-lab. Según la información disponible:

- Inferencia del modelo base DeepSeek-V4.1-Flash-1017 en hardware AMD Strix Halo con memoria unificada
- Cuantización selectiva por clase de tensor (atención, experto compartido, cabeza de salida) con packs intercambiables K3–K6
- Mezclas personalizadas por clase (`STRIX_DS41_TRELLIS_MIX`) para ajustar el equilibrio tamaño/calidad
- Verificación de integridad de todos los ficheros mediante SHA-256
- Fingerprinting de packs que alimenta los namespaces de la caché de prefijos del motor
- No disponible: datos sobre tool calling, agentes, capacidades multilingües o modos de razonamiento del modelo base en esta información

## Casos de uso

- Ejecución local de DeepSeek-V4.1-Flash en estaciones Strix Halo: el motor combina el GGUF Q2, el overlay U6 y estos packs EXL3 para que el modelo completo quepa en la memoria unificada de una GPU integrada de gama alta, sin necesidad de servidores con H100.
- Experimentación con trade-offs de cuantización: los packs K3, K4, K5 y K6 permiten comparar calidad frente a memoria cambiando una variable de entorno (`STRIX_DS41_TRELLIS_MIX`), útil para investigación en cuantización trellis.
- Despliegue de inferencia con dos nodos: el motor admite arranque en modo `serve` o `rank` en dos nodos, aprovechando los packs como pesos de sitio de decodificación.
- Ajuste fino de calidad de la cabeza de salida: la mezcla de producción usa K5 para la `head` y K4 para el resto, mitigando la degradación de logits en la capa más sensible; se puede replicar o modificar por clase (`shexp_w2`, `o_a`, etc.).
- Verificación de integridad en pipelines de despliegue: los manifiestos SHA-256 por pack y por repo permiten integrar comprobaciones automáticas antes de cargar los pesos.
- Caché de prefijos con fingerprints estables: el fingerprinting del pack por `<dir>.sha256` permite invalidación determinista de caché en servicios con prompts compartidos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repo incluye únicamente el error proxy por tensor del cuantizador (`proxy_err.tsv` en cada pack), sin valores concretos en la model card.

## Requisitos de hardware

- Tamaño del repo: 16,1 GB en total; cada pack individual ocupa entre ~2,7 GB (K3) y ~5,4 GB (K6)
- Hardware objetivo declarado: AMD Strix Halo (APU con memoria unificada LPDDR5X); no se especifican requisitos de VRAM discreta
- Se necesitan además el GGUF Q2 del modelo base, el GGUF del drafter DSpark y el overlay denso U6, no incluidos aquí
- Software requerido: build del motor strix-halo-engine-lab con la librería trellis enlazada (`-DSTRIX_DS41_TRELLIS_LIBRARY` / `-DSTRIX_DS41_TRELLIS_INCLUDE_DIR`)
- No compatible con llama.cpp, Ollama, vLLM o TGI de forma directa: los packs solo funcionan con el motor strix-halo-engine-lab
- Latencia y throughput: no disponible

## Comparativa con modelos similares

| Aspecto | Este repo (trellis EXL3) | kyuz0/deepseek-v4.1-flash-gguf Q2 | hyukudan/...-strix-dense-U6 |
|---|---|---|---|
| Tipo | Packs trellis de líneas densas (no autónomo) | GGUF Q2 completo del modelo base | Overlay denso (U6) |
| Bits por peso (parte densa) | 3 / 4 / 5 / 6 bits | 2 bits | no disponible |
| Motor requerido | strix-halo-engine-lab | strix-halo-engine-lab | strix-halo-engine-lab |
| Rol | Pesos de sitio de decodificación (atención, experto compartido, head) | Base del modelo (espejo exacto de la revisión 20408f69) | Complemento denso al GGUF Q2 |
| Licencia | MIT | no disponible | no disponible |

No hay comparativas con cuantizaciones EXL3/GGUF de otros modelos en la información disponible.

## Limitaciones y advertencias

- No es un modelo standalone: faltan expertos enrutados, embeddings y normas; sin el motor strix, el GGUF Q2 y el overlay U6, estos pesos no sirven por sí solos
- Los sitios trellis cambian los logits respecto al modelo original: son un formato de peso distinto, no un repack de los tensores U6 o Q8_0, por lo que la calidad puede diferir del checkpoint FP8
- Solo la configuración mix-B (K4 + K5 en head) se declara como producción; K3 y K6 son alternativas experimentales de tamaño y calidad
- La model card del repo aparece truncada en el punto donde se describe la exactitud ("The engine announces the identity it runs: `d"), por lo que parte de las notas de calidad no está disponible
- No hay datos de benchmarks publicados ni evaluaciones de calidad reportadas en la información proporcionada
- Idiomas, sesgos y riesgo de alucinación: no disponibles; heredan del modelo base DeepSeek-V4.1-Flash-1017
- Los manifiestos `.sha256` deben permanecer junto a sus packs sin modificar: el motor los usa para el fingerprinting y la caché de prefijos
- La licencia MIT aplica a este repo de cuantización; los términos de uso del modelo base DeepSeek deben revisarse por separado

## Enlaces

- Repositorio: https://huggingface.co/hyukudan/DeepSeek-V4.1-Flash-1017-strix-trellis-EXL3
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Motor strix-halo-engine-lab: https://github.com/hyukudan/strix-halo-engine-lab
- Librería strix-trellis: https://github.com/hyukudan/strix-trellis
- GGUF Q2 del modelo base: https://huggingface.co/kyuz0/deepseek-v4.1-flash-gguf
- Espejo del GGUF Q2: https://huggingface.co/hyukudan/deepseek-v4.1-flash-gguf-mirror
- Overlay denso U6: https://huggingface.co/hyukudan/DeepSeek-V4.1-Flash-1017-strix-dense-U6
- Exllamav3 (cuantizador): no disponible enlace directo en la información proporcionada (autor: turboderp)
