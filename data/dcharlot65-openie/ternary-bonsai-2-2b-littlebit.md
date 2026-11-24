# dcharlot65-openie/Ternary-Bonsai-2-2B-LittleBit

## Resumen

Ternary-Bonsai-2-2B-LittleBit es un checkpoint de "living weights" publicado por el usuario dcharlot65-openie, derivado del modelo prism-ml/Ternary-Bonsai-2-2B-gguf mediante una factorización previa etiquetada como "LittleBit-2 ⊕ Sakana SVF". El artefacto no se distribuye en formatos convencionales de pesos (safetensors, GGUF), sino como un fichero `.jsyn` comprimido con zstd y protegido con CRC32, pensado para ser consumido por JouleDB, una base de datos termodinámica y runtime de inferencia sin PyTorch.

El modelo base es un transformer ternario de aproximadamente 1.880 millones de parámetros (1881825088), con licencia Apache 2.0. La contribución del checkpoint es la compresión extrema: el autor reporta un tamaño comprimido de 13,00 MB frente a los 3589,30 MB equivalentes en FP16, lo que supone una reducción de 276,13x y una media de 0,0225 bits por peso. Se trata, por tanto, de un artefacto de investigación sobre compresión sub-1-bit más que de un modelo listo para producción.

La relevancia actual del checkpoint es acotada: no hay descargas ni interacciones en Hugging Face, el repositorio ocupa 0.0 GB y la información pública se limita a la model card del autor. No se documentan idiomas, benchmarks, datos de entrenamiento ni pipeline de inferencia estándar, por lo que cualquier evaluación de capacidades debe hacerse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ternario (modelo base prism-ml/Ternary-Bonsai-2-2B-gguf); factorización LittleBit-2 + Sakana SVF en el checkpoint |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternario en el modelo base; checkpoint sub-1-bit (0,0225 BPW medio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.jsyn` (JouleDB), comprimido con zstd y CRC32; no safetensors ni GGUF |

## Arquitectura y entrenamiento

El checkpoint se construye sobre un transformer ternario de 2B parámetros del que no se detallan capas, dimensiones ocultas ni mecanismo de atención. La transformación aplicada por el autor consiste en una pre-factorización "LittleBit-2 ⊕ Sakana SVF", que descompone los pesos en 187 tensores 2D de planos de bits y 133 vectores 1D de LayerNorm, bias y depthwise. El resultado se serializa en formato `.jsyn` con compresión zstd y verificación CRC32, y se carga mediante el runtime JouleDB, que prescinde de PyTorch.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF, DPO u otras técnicas de alineamiento. Tampoco se documentan innovaciones de decodificación como decodificación especulativa o atención lineal. La única innovación técnica descrita es la propia compresión sub-1-bit y su integración en un sustrato Kubernetes-native (JouleKube).

## Capacidades

- Generación de texto: heredada del modelo base ternario de 2B; no se documentan evaluaciones específicas.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el autor menciona "AI/agent substrate" en JouleKube, pero sin detallar capacidades del modelo.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Carga y ejecución sin PyTorch mediante JouleDB, con descarga directa desde Hugging Face vía `hf_pull`.

## Casos de uso

- Investigación en compresión extrema de modelos: el checkpoint permite estudiar la viabilidad de pesos sub-1-bit (0,0225 BPW) y comparar la calidad resultante frente al modelo ternario original.
- Despliegue en entornos con restricciones severas de almacenamiento: con 13 MB comprimidos, el artefacto cabe en imágenes de contenedor mínimas y en nodos edge con almacenamiento muy limitado.
- Experimentación con runtimes alternativos: sirve para validar el runtime JouleDB y su integración con Kubernetes (JouleKube) en pipelines de inferencia sin PyTorch.
- Pruebas de reproducibilidad de factorizaciones: la combinación LittleBit-2 + Sakana SVF puede replicarse sobre otros modelos ternarios para evaluar la pérdida de calidad.
- Docencia y demostraciones de cuantización: útil para explicar planes de bits, BPW y compresión zstd en cursos de eficiencia de modelos.
- Integración en bases de datos termodinámicas: como ejemplo de checkpoint gestionado por una base de datos (JouleDB) en lugar de un servidor de inferencia tradicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo base ternario de 2B requeriría típicamente entre 1 y 2 GB, pero no se confirma para este checkpoint.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el runtime JouleDB no documenta requisitos de aceleración en la información proporcionada.
- Opciones de despliegue: JouleDB v0.2.4+ (`cargo binstall jouledb`, `jouledb serve`); no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-2B-LittleBit | 1.881.825.088 | no disponible | `.jsyn` (JouleDB) | Apache 2.0 | Hugging Face, 0 descargas |
| prism-ml/Ternary-Bonsai-2-2B-gguf (base) | ~2B | no disponible | GGUF | Apache 2.0 | Hugging Face |
| BitNet b1.58 2B (referencia de modelos ternarios) | ~2B | no disponible en esta ficha | safetensors/GGUF | no disponible en esta ficha | no disponible en esta ficha |

La comparación con alternativas ternarias de 2B es limitada porque no se dispone de datos de rendimiento del checkpoint ni del modelo base en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones de calidad; se desconoce la degradación introducida por la factorización sub-1-bit.
- El formato `.jsyn` solo es consumible por JouleDB, lo que limita la portabilidad frente a safetensors o GGUF.
- No se documentan idiomas soportados, sesgos conocidos ni riesgos de alucinación específicos.
- El repositorio tiene 0 descargas y 0 interacciones, y ocupa 0.0 GB, lo que sugiere un artefacto en fase muy temprana o incompleto.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones hace arriesgado su uso en producción.
- El autor no detalla la longitud de contexto ni el pipeline de inferencia, por lo que no se puede garantizar su funcionamiento en escenarios multi-turno o de contexto largo.
- La dependencia de un runtime propietario (JouleDB) y de un sustrato Kubernetes (JouleKube) añade complejidad operativa no documentada en detalle.

## Enlaces

- Hugging Face: https://huggingface.co/dcharlot65-openie/Ternary-Bonsai-2-2B-LittleBit
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-gguf
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
