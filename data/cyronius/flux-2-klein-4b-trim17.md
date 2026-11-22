# Cyronius/FLUX.2-klein-4B-Trim17

## Resumen

FLUX.2-klein-4B-Trim17 es una variante podada en profundidad del denoiser de FLUX.2 [klein] 4B, el modelo de generación de imágenes texto-a-imagen de Black Forest Labs. La desarrolla Cyronius como resultado de investigación y se publica bajo licencia Apache 2.0. El cambio central es que conserva 17 de los 25 bloques transformer originales (5 double-stream y 12 single-stream en lugar de 5 y 20), sustituyendo los tramos eliminados por dos matrices lineales de 3072 × 3072 denominadas "bridges", una por hueco y por paso de denoising.

El objetivo es reducir el coste computacional del denoiser manteniendo una fidelidad aceptable. Sobre una NPU AMD Ryzen AI (HX 370) genera una imagen de 512 × 512 en 4 pasos en 2,904 s frente a los 3,836 s del modelo completo, lo que supone una aceleración de 1,32×. El precio es un error absoluto medio de píxel de 26,8 (GPU bf16) y 27,0 (NPU Q8_0) sobre una escala de 0 a 255 respecto al original.

No es un reemplazo directo de FLUX.2 [klein]: requiere un forward pass modificado que omita los bloques eliminados y aplique los bridges en los pasos correspondientes. El repositorio solo contiene el transformer podado; el text encoder, el VAE y el resto del pipeline son los originales de FLUX.2 [klein] 4B y no se incluyen. El modelo tiene 3.875.544.576 parámetros y un repo de 10,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (denoiser FLUX.2), 5 bloques double-stream + 12 single-stream (17 de 25) con 2 bridges lineales |
| Parametros totales | 3.875.544.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | Q8_0 (GGUF); pesos bf16 en safetensors; bridges en fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bloques y bridges), GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo parte del denoiser de FLUX.2 [klein] 4B, un transformer de difusion con 25 bloques numerados 0–24: los bloques 0–4 son double-stream y los 5–24 single-stream. Trim17 elimina los bloques 13, 14, 15 y 17, 18, 19, 20, 21, y conserva 0–12, 16, 22, 23 y 24. Cada tramo eliminado se reemplaza por un bridge lineal de 3072 × 3072 aplicado justo antes del primer bloque posterior al hueco (antes del bloque 16 y antes del 22), con una matriz distinta por paso de denoising. La fórmula es `x = x + zn @ W[gap][step]`, donde `zn` es la normalización LayerNorm modulada por el paso.

El proceso de construcción tuvo cuatro etapas: cribado eliminando un bloque cada vez y midiendo el cambio de velocidad; poda sin entrenamiento para localizar el punto de caída de calidad; reparación barata con bridges ajustados por regresión ridge; y "healing" o ajuste fino de los bloques conservados contra el modelo original partiendo de los bridges. El presupuesto total fue de unos 26 dólares de GPU alquilada. Los bridges están atados a los cuatro timesteps fijos del schedule de 4 pasos de FLUX.2 [klein] a 512 × 512 (t = 1,0, 0,9609375, 0,8828125, 0,71484375); otros números de pasos solo se comprobaron de forma puntual.

## Capacidades

- Generación de imágenes texto-a-imagen con el pipeline FLUX.2 [klein] 4B (text encoder y VAE originales, no incluidos en el repo).
- Denoising con schedule de 4 pasos a 512 × 512, con bridges calibrados para esos timesteps.
- Ejecución en NPU AMD Ryzen AI mediante runtime propio y GGUF Q8_0.
- Inferencia en GPU con bf16 usando los safetensors de bloques y bridges.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo: es exclusivamente un denoiser de difusión.
- Capacidades multilingües: no disponibles (dependen del text encoder original, no incluido).

## Casos de uso

- Investigación sobre poda de difusores: sirve como caso de estudio reproducible de poda en profundidad con reparación por bridges y healing, con presupuesto mínimo y métricas publicadas.
- Generación de imágenes en dispositivos con NPU AMD Ryzen AI: el modelo está pensado para el kernel NPU y ofrece 2,904 s por imagen 512² a 4 pasos en un HX 370, útil en portátiles y equipos de borde sin GPU dedicada.
- Prototipado rápido de pipelines texto-a-imagen: al ser un 1,32× más rápido que el original en NPU, reduce el tiempo de iteración en pruebas de concepto donde la fidelidad exacta no es crítica.
- Benchmarking de técnicas de compresión: los datos de error de píxel (26,8 en GPU bf16, 27,0 en NPU Q8_0) permiten comparar contra otras estrategias de poda o cuantización sobre el mismo modelo base.
- Docencia y divulgación: el repositorio incluye configuración, fórmula de los bridges y un esquema del forward pass, lo que facilita explicar cómo se comporta un transformer de difusión podado.
- Evaluación de cuantización Q8_0 en NPU: el GGUF permite medir la degradación adicional que introduce la cuantización frente a bf16 en el mismo hardware.

## Benchmarks y rendimiento

| Metrica | FLUX.2 [klein] 4B | Trim17 |
|---|---|---|
| Bloques transformer | 5 double-stream + 20 single-stream | 5 double-stream + 12 single-stream |
| Parametros extra | – | 2 bridges × 4 pasos × 3072 × 3072 |
| Tiempo NPU, 512², 4 pasos (HX 370) | 3,836 s | 2,904 s |
| Diferencia de imagen vs original (error absoluto medio de pixel, 0–255) | 0 | 26,8 (GPU bf16), 27,0 (NPU Q8_0) |

No se han publicado resultados de benchmarks estándar (FID, CLIP score, MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas publicadas son el tiempo de inferencia en NPU y el error absoluto medio de píxel frente al modelo original.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con 3.875.544.576 parámetros, en bf16 los pesos del transformer rondan los 7,75 GB; en Q8_0, aproximadamente 3,9 GB, a lo que hay que sumar text encoder y VAE del pipeline original.
- GPU recomendadas: no especificadas por el autor. El modelo se validó en GPU con bf16 y en NPU AMD Ryzen AI (HX 370).
- NPU: soportada de forma explícita mediante runtime propio y el GGUF Q8_0 incluido.
- GPU de consumo: no confirmado por el autor; por tamaño en Q8_0 podría caber en GPUs de 8–12 GB, pero no hay dato publicado.
- Opciones de despliegue: runtime NPU del autor con el GGUF Q8_0; en GPU, carga de los safetensors sobre el transformer original de diffusers con el forward pass modificado. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 2,904 s por imagen 512² a 4 pasos en NPU HX 370 (frente a 3,836 s del original). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX.2-klein-4B-Trim17 | 3.875.544.576 | no aplica | 2,904 s/imagen 512² 4 pasos en NPU HX 370; error 26,8–27,0 vs original | Apache 2.0 | Hugging Face (repo de 10,0 GB) |
| FLUX.2 [klein] 4B (original) | no disponible en la información | no aplica | 3,836 s/imagen 512² 4 pasos en NPU HX 370 | no disponible en la información | Hugging Face (black-forest-labs/FLUX.2-klein-4B) |
| Otras variantes podadas de FLUX.2 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks estándar ni de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un reemplazo directo de FLUX.2 [klein]: exige un forward pass que omita los bloques eliminados y aplique los bridges; cargarlo como un transformer estándar produce resultados incorrectos.
- Los bridges están calibrados para los cuatro timesteps fijos del schedule de 4 pasos a 512 × 512; otros números de pasos solo se comprobaron de forma puntual y pueden degradar la calidad.
- Pérdida de fidelidad moderada pero clara: error absoluto medio de píxel de 26,8 (bf16) y 27,0 (Q8_0) frente al original, sobre escala 0–255.
- El repositorio solo incluye el transformer podado; el text encoder, el VAE y el resto del pipeline deben obtenerse del modelo base.
- El GGUF Q8_0 conserva los pesos originales de los bloques eliminados en el archivo (no se ejecutan), lo que infla el tamaño respecto a los pesos realmente usados.
- El autor lo describe como resultado de investigación, no como producto listo para producción.
- Sesgos conocidos: no documentados en la información disponible; hereda los del modelo base y su text encoder.
- Riesgo de alucinación visual y artefactos: no cuantificado más allá del error de píxel publicado.
- Licencia Apache 2.0 permite uso comercial, pero la variante no ha sido validada por Black Forest Labs.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cyronius/FLUX.2-klein-4B-Trim17
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
