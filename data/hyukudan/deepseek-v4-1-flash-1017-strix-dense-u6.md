# hyukudan/DeepSeek-V4.1-Flash-1017-strix-dense-U6

## Resumen

`hyukudan/DeepSeek-V4.1-Flash-1017-strix-dense-U6` es un overlay de pesos parciales (no un modelo independiente) derivado de `deepseek-ai/DeepSeek-V4.1-Flash-1017`. Lo publica el usuario hyukudan y contiene 321 tensores densos del modelo base re-cuantizados a un formato uniforme de 6 bits (U6, ~6,5 bits por peso, ponderado por imatrix): las proyecciones de atención (`q_a`, `q_b`, `kv`, `wo_a`, `wo_b`), el experto compartido y la cabeza de salida. En tiempo de carga sustituye los tensores Q8_0 correspondientes del GGUF `DeepSeek-V4.1-Flash-1017-Q2.gguf` de kyuz0.

El objetivo es servir como formato denso de producción del perfil DeepSeek en un clúster de dos nodos AMD Strix Halo (gfx1151), usando el motor `strix-halo-engine-lab`. No funciona de forma autónoma: requiere el GGUF Q2 upstream completo (365,7 GB) y el motor específico del autor. El repositorio incluye además ficheros auxiliares para el drafter especulativo DSpark (estadísticas de rutas de expertos y listas de vocabulario de borrador).

El interés actual es acotado pero técnico: demuestra una técnica de re-cuantización selectiva por capas con imatrix sobre hardware AMD consumer/prosumer, con decodificación especulativa y poda de expertos del drafter, reduciendo su huella de ~8,0 GB a ~4,4 GB y reportando +16 % de throughput en decodificación sobre código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) en el modelo base; el overlay cubre únicamente tensores densos (atención, experto compartido, cabeza de salida) |
| Parametros totales | 7.142.113.280 (7,14 B) según safetensors del repo; el modelo base completo no se especifica en la información disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en el overlay; el ejemplo de despliegue usa `--context 4096` |
| Tipos de cuantizacion | U6 (6 bits uniformes, ~6,5 bits por peso, imatrix); los expertos enrutados permanecen en IQ2_XXS (gate/up) y Q2_K (down) del GGUF base |
| Idiomas soportados | no disponible (los packs de vocabulario del drafter cubren code, de, en, es, fr, it, ja, ko, pt, ru, zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (`c-u6.gguf`, 7.588.516.384 bytes) más JSON de receta, imatrix y ficheros auxiliares |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE), según se deduce de la presencia de expertos enrutados (IQ2_XXS/Q2_K) y un experto compartido en el overlay. Este repositorio no entrena nada: es un proceso de re-cuantización post-hoc. La herramienta `tools/ds41_requant/requant.py` lee los tensores Q8_0 del GGUF Q2 de kyuz0 (no el checkpoint FP8 original) y escribe cada tensor en una forma U6 embebible en Q8_0. Por bloque, busca la escala (±12 % en pasos del 2 %), reajusta por mínimos cuadrados y redondea la escala a f16, de modo que los kernels Q8_0 sin modificar del motor calculan el overlay de forma exacta.

La imatrix (`calib/cpu.imat`) se recogió con el tap de forward en host del motor sobre 8 documentos de calibración × 128 tokens, disjuntos del conjunto de evaluación, y reduce el KL en torno a un 10 %. Se probaron varios formatos y mezclas por clase (u3–u6, codebooks nl3/nl4 y codebooks aprendidos de 16 entradas, que no compensaron); `c-u6` ganó bajo una puerta de calidad pre-registrada. Los ficheros auxiliares del drafter DSpark incluyen estadísticas de rutas de expertos (los 64 expertos más enrutados por etapa cubren el 95,4 / 99,8 / 100 % de las rutas) y listas de tokens del vocabulario de borrador en formato uint32 little-endian.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base DeepSeek-V4.1-Flash-1017 (no verificables de forma independiente a partir de la información disponible).
- Soporte de decodificación especulativa mediante el drafter DSpark, con vocabulario restringido por packs de idioma y de código.
- Poda de expertos del drafter (keep-64) para reducir su huella en dispositivo.
- Capacidades multilingües del drafter documentadas para code, de, en, es, fr, it, ja, ko, pt, ru y zh.
- No se documentan en esta ficha tool calling, function calling, agentes, visión ni audio; no disponible.

## Casos de uso

- Despliegue de producción en clúster AMD Strix Halo: el overlay es el formato denso por defecto del perfil DeepSeek de dos nodos en `strix-halo-engine-lab`, con transporte USB4 y tensor parallelism de atención (`--tp-attention`, `--layers 40`).
- Servicio de inferencia con contexto corto: el ejemplo de arranque configura `--context 4096` y `--slots 8`, adecuado para cargas de chat o generación por lotes donde prima el throughput sobre la ventana larga.
- Aceleración de decodificación en código: con los ficheros auxiliares del drafter y keep-64 se reporta +16 % de throughput de decodificación en código, útil en asistentes de programación autoalojados.
- Investigación en cuantización: sirve como referencia reproducible de re-cuantización selectiva U6 con imatrix, con receta JSON y MSE relativo por tensor para comparar formatos.
- Evaluación de decodificación especulativa: los packs de vocabulario por idioma permiten medir el impacto de restringir las propuestas del drafter en distintos idiomas.
- Reproducción de entornos de dos nodos: el manifiesto de grupo y las variables `STRIX_DS41_*` permiten replicar el perfil de producción para pruebas de integración del motor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta métricas internas: reducción de KL de ~10 % atribuida a la imatrix, +16 % de throughput de decodificación en código con keep-64 en el drafter, y una reducción de la huella del drafter de ~8,0 GB a ~4,4 GB.

## Requisitos de hardware

- El overlay por sí solo ocupa 7,6 GB (repo), pero no es ejecutable de forma independiente.
- Requiere el GGUF base `DeepSeek-V4.1-Flash-1017-Q2.gguf` de 365,7 GB y el drafter `DeepSeek-V4.1-Flash-1017-DSpark-MXFP4.gguf` de 8,0 GB.
- Hardware objetivo: dos nodos AMD Strix Halo (gfx1151) con transporte USB4 (`--transport usb4gpu`).
- No cabe en una GPU consumer convencional; el diseño está pensado para memoria unificada de APU Strix Halo en clúster.
- Despliegue únicamente con el motor `strix-halo-engine-lab` (`strix-deepseek41-serve`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput absolutos: no disponibles; solo el delta relativo de +16 % en decodificación de código.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este overlay (U6) | 7,14 B en safetensors (overlay) | no disponible (ejemplo 4096) | GGUF U6 + base Q2 | MIT | Requiere motor y GGUF upstream específicos |
| `kyuz0/deepseek-v4.1-flash-gguf` (Q2) | no disponible | no disponible | GGUF Q2 | no disponible | Base upstream obligatoria; sin overlay usa Q8_0 en tensores densos |
| `hyukudan/DeepSeek-V4.1-Flash-1017-strix-trellis-EXL3` | no disponible | no disponible | EXL3-style | no disponible | Repo complementario con packs trellis para experto compartido y cabeza |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el GGUF Q2 de kyuz0 en la revisión `20408f699619df7071aa7cda6034e9cef5bf804b` y el motor del autor, el overlay no carga.
- Dependencia estricta de versión: cambios en el GGUF upstream o en el motor pueden romper la sustitución de tensores.
- Los expertos enrutados permanecen en 2 bits (IQ2_XXS/Q2_K), por lo que la calidad global está acotada por esa cuantización, no por el overlay U6.
- El rendimiento declarado (+16 % en código, −10 % KL) procede del autor y no se ha verificado de forma independiente.
- Riesgo de alucinación y sesgos del modelo base: no documentados en la información disponible.
- Idiomas soportados por el modelo base: no disponibles; solo se documentan los packs del drafter.
- Licencia MIT declarada en el repo, pero la licencia del modelo base y del GGUF upstream debe verificarse por separado antes de uso comercial.
- Hardware muy específico (AMD Strix Halo, dos nodos, USB4); no apto para despliegues convencionales en NVIDIA.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hyukudan/DeepSeek-V4.1-Flash-1017-strix-dense-U6
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- GGUF upstream (kyuz0): https://huggingface.co/kyuz0/deepseek-v4.1-flash-gguf
- Mirror del GGUF upstream: https://huggingface.co/hyukudan/deepseek-v4.1-flash-gguf-mirror
- Repo complementario trellis: https://huggingface.co/hyukudan/DeepSeek-V4.1-Flash-1017-strix-trellis-EXL3
- Motor de inferencia: https://github.com/hyukudan/strix-halo-engine-lab
- Librería trellis: https://github.com/hyukudan/strix-trellis
