# dcharlot65-openie/NVIDIA-Qwen3.5-0.8B-Draft-LittleBit

## Resumen

`NVIDIA-Qwen3.5-0.8B-Draft-LittleBit` es un checkpoint de pesos "vivos" (living weights) publicado por el usuario `dcharlot65-openie` en Hugging Face, derivado del modelo borrador `nvidia/Qwen3.5-0.8B-Qwen3.8-27B-Draft` de NVIDIA. No se trata de un modelo entrenado desde cero, sino de una refactorización extrema del modelo base mediante una combinación de factorización `LittleBit-2` y `Sakana SVF`, orientada a su ejecución dentro de JouleDB, un runtime de inferencia sin PyTorch y una base de datos termodinámica con soporte nativo para Kubernetes (JouleKube).

El resultado declarado es un artefacto `.jsyn` de 10,44 MB que representa 752.393.024 parámetros (1.435,08 MB en FP16 equivalente), lo que supone una compresión de 137,43x y una media de 0,0402 bits por peso (BPW). Se distribuye bajo la NVIDIA Open Model License y está pensado para despliegues Kubernetes-native con requisitos de memoria extremadamente bajos.

La relevancia del artefacto es fundamentalmente experimental: explora los límites de la compresión sub-1-bit sobre un modelo borrador de decodificación especulativa, pero no aporta información pública sobre calidad de generación, benchmarks ni idiomas soportados. La librería es `jouledb`, no `transformers`, y el repositorio tiene un tamaño de 0,0 GB en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de `nvidia/Qwen3.5-0.8B-Qwen3.8-27B-Draft` (detalles no disponibles) |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Sub-1-bit (LittleBit-2 + Sakana SVF), 0,0402 BPW medio; formato `.jsyn` con zstd + CRC32 |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (`nvidia-open-model-license`) |
| Formato de pesos | `.jsyn` (JouleDB); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es `nvidia/Qwen3.5-0.8B-Qwen3.8-27B-Draft`, un borrador de aproximadamente 0,8B parámetros presumiblemente diseñado para decodificación especulativa junto a un modelo mayor (la nomenclatura sugiere un Qwen3.8-27B como modelo objetivo). No se dispone de información pública sobre la arquitectura interna, composición del dataset de entrenamiento, número de tokens ni si hubo fases de RLHF o DPO.

La intervención del autor consiste en una pre-factorización `LittleBit-2 ⊕ Sakana SVF` que reorganiza los pesos en 187 tensores 2D en planos de bits (bitplanes) y 133 vectores 1D para LayerNorm, biases y convoluciones depthwise. El resultado se serializa en un único artefacto `.jsyn` comprimido con zstd y verificado con CRC32. No se documenta el procedimiento de calibración, la pérdida de calidad introducida ni el método exacto de reconstrucción en tiempo de inferencia.

## Capacidades

- No se documentan capacidades específicas en la model card más allá de la herencia del modelo base.
- Al derivar de un modelo "Draft" de decodificación especulativa, su función prevista es proponer tokens candidatos que un modelo mayor verifica, no generar respuestas finales de alta calidad.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Decodificación especulativa en pipelines JouleDB: el checkpoint está pensado para servir como draft model dentro del runtime JouleDB, generando borradores de tokens que un modelo verificador de mayor tamaño valida; su tamaño de 10,44 MB permite cargarlo en nodos con recursos mínimos.
- Despliegue edge en clústeres Kubernetes: gracias a JouleKube y al formato `.jsyn`, puede distribuirse como artefacto de 10 MB en ConfigMaps o volúmenes persistentes, útil en escenarios de inferencia con restricciones severas de almacenamiento y memoria.
- Experimentación en compresión sub-1-bit: sirve como banco de pruebas para investigar la viabilidad de pesos por debajo de 1 bit por parámetro en modelos de lenguaje de pequeño tamaño, midiendo la degradación frente al modelo base FP16.
- Investigación en AI termodinámica: el ecosistema JouleDB propone un modelo de "pesos vivos" con métricas termodinámicas; este checkpoint permite reproducir y auditar dichos experimentos.
- Sustitución de dependencias pesadas: al ejecutarse sin PyTorch, es adecuado para entornos donde no se puede instalar el stack de Python/CUDA completo y se prefiere un binario Rust (`cargo binstall jouledb`).
- Pruebas de integración en CI/CD: por su reducido tamaño, puede incluirse en tests automatizados de pipelines de generación especulativa sin penalizar tiempos de descarga ni requisitos de runner.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de compresión (137,43x, 0,0402 BPW) y no incluye evaluaciones de perplejidad, MMLU, HumanEval, GSM8K ni comparaciones de calidad frente al modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia teórica, el estado FP16 equivalente son 1.435,08 MB, pero la reconstrucción en runtime del formato sub-1-bit puede requerir memoria adicional no documentada.
- GPU recomendadas: no disponible. El runtime JouleDB está descrito como "zero-PyTorch" y Kubernetes-native, pero no se especifican backends de cómputo (CUDA, ROCm, CPU).
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del artefacto (10,44 MB) sugiere que cabría en cualquier GPU moderna, pero se desconoce el pico de memoria durante la descompresión.
- Opciones de despliegue: JouleDB v0.2.4+ (`jouledb serve --http-addr 127.0.0.1:8080`), con `db.hf_pull(...)` para descarga desde Hugging Face. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dcharlot65-openie/NVIDIA-Qwen3.5-0.8B-Draft-LittleBit` | 752.393.024 | no disponible | `.jsyn` (sub-1-bit) | NVIDIA Open Model License | Hugging Face (0 descargas) |
| `nvidia/Qwen3.5-0.8B-Qwen3.8-27B-Draft` (base) | ~0,8B | no disponible | no disponible | NVIDIA Open Model License | Hugging Face |
| Otros draft models de decodificación especulativa | no disponible | no disponible | safetensors / GGUF | variable | no disponible |

No se dispone de información suficiente para comparar rendimiento, calidad o latencia con alternativas equivalentes.

## Limitaciones y advertencias

- La compresión a 0,0402 BPW implica una pérdida de información muy agresiva; no se documenta la degradación de calidad respecto al modelo base ni se aportan métricas de perplejidad.
- El modelo está pensado como draft de decodificación especulativa, no como generador autónomo; usarlo de forma aislada probablemente produzca salidas de baja calidad.
- No se declaran idiomas soportados, sesgos conocidos ni tasas de alucinación.
- La licencia NVIDIA Open Model License impone condiciones específicas para uso comercial; es necesario revisar el acuerdo completo antes de desplegar en producción.
- El artefacto solo es utilizable con el runtime JouleDB (librería `jouledb`, binario Rust); no hay conversión publicada a safetensors, GGUF ni formatos compatibles con `transformers`.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria ni issues públicos que permitan evaluar su fiabilidad.
- El tamaño del repo aparece como 0,0 GB, lo que puede indicar que los pesos no están efectivamente alojados o que la consulta se realizó antes de la subida completa.
- No se documenta el método de reconstrucción de pesos ni el coste computacional de la descompresión en tiempo de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/dcharlot65-openie/NVIDIA-Qwen3.5-0.8B-Draft-LittleBit
- Modelo base: https://huggingface.co/nvidia/Qwen3.5-0.8B-Qwen3.8-27B-Draft
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
- Licencia NVIDIA Open Model: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
