# dcharlot65-openie/Ternary-Bonsai-2-4B-LittleBit

## Resumen

Ternary-Bonsai-2-4B-LittleBit es un checkpoint de "living weights" publicado por dcharlot65-openie que adapta el modelo base prism-ml/Ternary-Bonsai-2-4B-gguf (un transformer ternario de aproximadamente 4.200 millones de parametros) para el runtime JouleDB, una base de datos termodinamica con inferencia sin PyTorch y sustrato Kubernetes-native. La adaptacion combina una factorizacion previa LittleBit-2 con Sakana SVF y almacena los pesos en el formato propietario `.jsyn`, con compresion zstd y CRC32.

El dato mas llamativo es la compresion declarada: el autor reporta un tamano de 20,84 MB frente a los 8.021,83 MB que ocuparia el modelo en FP16, lo que equivale a una reduccion de 384,84x y a una media de 0,0175 bits por peso. El checkpoint contiene 249 tensores 2D en formato bitplane y 177 vectores 1D (LayerNorm, bias y depthwise), y se distribuye bajo licencia Apache 2.0 heredada del modelo base.

Su relevancia es experimental: propone un enfoque "sub-1-bit" de pesos vivos orientado a despliegues nativos en Kubernetes y a un runtime de inferencia que prescinde de PyTorch. No obstante, el repositorio tiene 0 descargas y 0 likes, el tamano del repo aparece como 0.0 GB y no hay pipeline declarado, por lo que debe tratarse como un artefacto de investigacion sin validacion publica de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ternario (base: prism-ml/Ternary-Bonsai-2-4B-gguf); factorizacion LittleBit-2 + Sakana SVF |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Sub-1-bit (0,0175 BPW medio); tensores 2D en bitplane; vectores 1D en precision superior |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.jsyn` (JouleDB, zstd + CRC32); modelo base en GGUF |
| Tamano comprimido | 20,84 MB (frente a 8.021,83 MB en FP16) |
| Tensores 2D (bitplane) | 249 |
| Vectores 1D (LayerNorm/bias/depthwise) | 177 |
| Libreria | jouledb |
| Modelo base | prism-ml/Ternary-Bonsai-2-4B-gguf |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer ternario de unos 4.200 millones de parametros, procedente de prism-ml/Ternary-Bonsai-2-4B-gguf. Sobre ese modelo, el autor aplica una factorizacion previa LittleBit-2 combinada con Sakana SVF (singular value fine-tuning) y almacena el resultado como "living weights" en el formato `.jsyn` de JouleDB. La representacion separa 249 tensores 2D codificados en bitplanes (la parte sub-1-bit) de 177 vectores 1D (LayerNorm, bias y depthwise) que conservan mayor precision, lo que explica la media de 0,0175 bits por peso.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones de decodificacion (decodificacion especulativa, atencion lineal, etc.). La innovacion declarada es de despliegue: un runtime de inferencia sin PyTorch integrado en una base de datos termodinamica y en el sustrato JouleKube para Kubernetes.

## Capacidades

- Generacion de texto: heredada del transformer base, aunque no hay evaluacion publica que la cuantifique en este checkpoint.
- Razonamiento y matematicas: no disponible; no se documentan resultados.
- Generacion de codigo: no disponible; no se documentan resultados.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el ecosistema JouleDB/JouleKube se orienta a sustratos de agentes, pero el modelo card no detalla capacidades de agente.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales: pesos "vivos" sub-1-bit, factorizacion LittleBit-2 + SVF y despliegue Kubernetes-native mediante JouleDB; no se declara vision, audio ni modo thinking.

## Casos de uso

- Despliegue en clusters Kubernetes con footprint minimo: el checkpoint de 20,84 MB permite empaquetar el modelo en imagenes de contenedor o ConfigMaps sin almacenamiento significativo, adecuado para entornos JouleKube donde el espacio y el arranque en frio son criticos.
- Investigacion en compresion extrema de modelos: sirve como banco de pruebas para estudiar el impacto de 0,0175 BPW en la calidad de salida frente al modelo ternario original en GGUF.
- Prototipado de inferencia sin PyTorch: util para validar pipelines que dependen del runtime de JouleDB y evitar la cadena de dependencias de PyTorch/CUDA en produccion.
- Experimentos de "living weights": permite explorar la hipotesis de pesos actualizables o re-factorizables en caliente dentro de una base de datos termodinamica.
- Educacion y divulgacion: ejemplo concreto de cuantizacion sub-1-bit, bitplanes y SVF para explicar tecnicas de compresion de modelos.
- Pruebas de integracion JouleDB: util para verificar el flujo `hf_pull` + `jouledb serve` y la compatibilidad del formato `.jsyn` en entornos de CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el checkpoint comprimido ocupa 20,84 MB, pero el runtime debe descomprimir y reconstruir tensores, por lo que el pico de memoria depende de la implementacion de JouleDB y no se documenta.
- GPU recomendadas: no disponible; no se especifican requisitos de GPU ni aceleracion.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: JouleDB v0.2.4+ (`cargo binstall jouledb`, `jouledb serve --http-addr 127.0.0.1:8080`) y `jouledb.hf_pull` desde Python; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-4B-LittleBit | 4.205.751.296 | no disponible | `.jsyn` (JouleDB) | Apache 2.0 | Hugging Face, 0 descargas |
| prism-ml/Ternary-Bonsai-2-4B-gguf (base) | ~4.200 M | no disponible | GGUF | Apache 2.0 | Hugging Face |
| Alternativas de ~4B en cuantizacion ternaria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia total de validacion publica: 0 descargas, 0 likes y sin pipeline declarado; no hay evidencia de que el checkpoint funcione correctamente.
- El repositorio aparece con 0.0 GB, lo que puede indicar que los pesos no estan realmente subidos o que el calculo de tamano no refleja el contenido.
- Calidad de salida desconocida: no hay benchmarks ni evaluaciones cualitativas del efecto de 0,0175 BPW sobre el modelo base.
- Riesgo de alucinacion: no evaluado; al derivar de un modelo ternario de 4B, es esperable, pero no hay mediciones.
- Idiomas no declarados: no se puede garantizar soporte ni calidad en castellano u otros idiomas.
- Dependencia de un runtime propietario (JouleDB, formato `.jsyn`): no es portable a vLLM, llama.cpp u Ollama, lo que limita su uso fuera del ecosistema del autor.
- Licencia Apache 2.0 permisiva para uso comercial, pero conviene verificar la cadena de atribucion completa (modelo base y tecnicas LittleBit-2/SVF) antes de produccion.
- Artefacto experimental: no recomendado para cargas de produccion sin una evaluacion independiente previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dcharlot65-openie/Ternary-Bonsai-2-4B-LittleBit
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
