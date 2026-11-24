# dcharlot65-openie/GLM-0.5B-MoE-LittleBit

## Resumen

`dcharlot65-openie/GLM-0.5B-MoE-LittleBit` es un checkpoint de pesos adaptado a partir de `PrimeIntellect/GLM-0.5B` mediante una factorizacion previa que combina `LittleBit-2` y `Sakana SVF`, empaquetado en el formato `.jsyn` de JouleDB. No es un modelo entrenado desde cero ni un ajuste fino convencional: es una representacion comprimida de pesos pensada para ser servida por el runtime de inferencia sin PyTorch de JouleDB, un sustrato de agentes nativo de Kubernetes. El autor lo publica bajo licencia MIT.

El artefacto declara 542.651.760 parametros totales (equivalente FP16 de 1035,03 MB) comprimidos a 6,49 MB en `.jsyn` con zstd y CRC32, lo que supone una ratio de compresion de 159,60x y un promedio de 0,0638 bits por peso (BPW). Esa cifra es coherente con la etiqueta `sub-1-bit` de la model card, aunque el propio autor no documenta la metodologia de evaluacion de calidad tras la cuantizacion.

Su relevancia actual es acotada y muy especifica: sirve como caso de estudio de compresion extrema de pesos y de despliegue de inferencia en un runtime alternativo (JouleDB), no como sustituto de un modelo de 0,5B en produccion. La model card no incluye benchmarks, idiomas soportados ni datos de entrenamiento adicionales, y el repositorio figura con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de `PrimeIntellect/GLM-0.5B`); el autor la etiqueta como MoE en el nombre del repo, sin detallar configuracion de expertos |
| Parametros totales | 542.651.760 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Sub-1-bit (`LittleBit-2` + `Sakana SVF`), 0,0638 BPW promedio; formato `.jsyn` con zstd y CRC32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.jsyn` (JouleDB); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card describe el artefacto como un checkpoint "pre-factorizado" de tipo *living weights*: los tensores del modelo base se descomponen en 262 tensores 2D en planos de bits y 167 vectores 1D para LayerNorm, bias y convoluciones depthwise. Esa descomposicion se combina con la tecnica `Sakana SVF` (singular value factorization) y se serializa en `.jsyn` con compresion zstd y comprobacion de integridad CRC32. El resultado son 6,49 MB frente a los 1035,03 MB del equivalente en FP16.

No hay informacion sobre el proceso de entrenamiento: no se indican tokens, composicion del dataset, ni fases de RLHF o DPO. Tampoco se detalla si el modelo base `PrimeIntellect/GLM-0.5B` es realmente una arquitectura MoE o si la etiqueta `MoE` del nombre del repositorio responde a otra convencion del autor. La model card no documenta ninguna innovacion de decodificacion ni atencion alternativa; la unica innovacion declarada es el esquema de compresion y el runtime JouleDB.

## Capacidades

- Generacion de texto: heredada del modelo base `PrimeIntellect/GLM-0.5B`, sin evaluacion publicada tras la compresion.
- Razonamiento y codigo: no disponible; no hay benchmarks ni ejemplos en la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: el autor lo enmarca en JouleKube, un sustrato de agentes nativo de Kubernetes, pero no documenta capacidades concretas del modelo.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Despliegue en runtime sin PyTorch: si, mediante JouleDB v0.2.4+ (`jouledb serve` y `db.hf_pull`).

## Casos de uso

- Evaluacion de tecnicas de compresion extrema: el checkpoint permite medir en un modelo de 0,5B el impacto real de 0,0638 BPW sobre la perplejidad y la calidad de generacion, comparando contra el modelo base en FP16.
- Despliegue en entornos con restricciones severas de almacenamiento: los 6,49 MB del artefacto caben en imagenes de contenedor minimas o en nodos edge con disco muy limitado, siempre que se use el runtime JouleDB.
- Pruebas de integracion de JouleDB y JouleKube: sirve como carga de trabajo de referencia para validar el ciclo `hf_pull` → `serve` → inferencia en un cluster Kubernetes.
- Prototipado de agentes en un sustrato alternativo: permite montar un pipeline de agentes sobre JouleKube sin depender de PyTorch ni de CUDA, util para validar la capa de orquestacion antes de sustituir el modelo por uno mayor.
- Docencia e investigacion sobre cuantizacion sub-1-bit: el par (modelo base, checkpoint comprimido) es un ejemplo reproducible de factorizacion SVF y empaquetado `.jsyn`.
- Pruebas de regresion del propio runtime: al tener un tamano fijo y conocido, el artefacto sirve como fixture determinista para tests de integridad CRC32 y de descompresion zstd.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta metricas de compresion:

| Metrica | Valor |
|---|---|
| Parametros totales | 542.651.760 |
| Tamano equivalente FP16 | 1035,03 MB |
| Tamano comprimido `.jsyn` | 6,49 MB |
| Ratio de compresion | 159,60x |
| Bits por peso (BPW) promedio | 0,0638 |
| Tensores 2D en planos de bits | 262 |
| Vectores 1D (LayerNorm / bias / depthwise) | 167 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 542,6M de parametros y 0,0638 BPW, el peso descomprimido en memoria dependeria de la implementacion del runtime; el autor no publica cifras.
- GPU recomendadas: no disponible. La model card no menciona requisitos de GPU ni de CUDA.
- Compatibilidad con GPU de consumo: no confirmada. El runtime JouleDB se presenta como "zero-PyTorch", lo que sugiere una ruta de ejecucion distinta a la habitual en CUDA.
- Opciones de despliegue: JouleDB v0.2.4+ (`jouledb serve --http-addr 127.0.0.1:8080`), con cliente Python via `jouledb.connect` y `db.hf_pull`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo comprimido, por lo que la comparativa se limita a parametros y formato. Se incluye el modelo base como referencia directa.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `dcharlot65-openie/GLM-0.5B-MoE-LittleBit` | 542,6M | no disponible | `.jsyn` (sub-1-bit) | MIT | Requiere JouleDB; 6,49 MB |
| `PrimeIntellect/GLM-0.5B` (base) | 542,6M | no disponible | safetensors (presumible) | MIT | Modelo de referencia sin comprimir |
| Alternativas de ~0,5B en formato GGUF | no disponible | no disponible | GGUF | variable | No se dispone de datos verificables en la informacion proporcionada |

## Limitaciones y advertencias

- No hay ninguna evaluacion de calidad publicada tras la compresion a 0,0638 BPW; la degradacion respecto al modelo base es desconocida y podria ser severa.
- El nombre del repositorio incluye `MoE`, pero la model card no documenta configuracion de expertos ni parametros activos; la etiqueta no debe tomarse como especificacion tecnica verificada.
- El artefacto solo es utilizable con el runtime JouleDB; no se publican pesos en safetensors ni GGUF, lo que impide usarlo con vLLM, llama.cpp, Ollama o TGI.
- El repositorio figura con 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-23), sin historial de uso ni validacion externa.
- No se declaran idiomas soportados; el comportamiento multilingue es desconocido.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de contexto especificas del checkpoint comprimido.
- La licencia MIT del checkpoint se hereda del modelo base, pero el uso comercial del formato `.jsyn` depende de la madurez y del soporte de JouleDB, no solo de la licencia.
- No se especifican requisitos de hardware ni latencias, lo que impide planificar un despliegue en produccion con datos objetivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dcharlot65-openie/GLM-0.5B-MoE-LittleBit
- Modelo base: https://huggingface.co/PrimeIntellect/GLM-0.5B
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
