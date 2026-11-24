# dcharlot65-openie/LFM2.5-230M-Base-LittleBit

## Resumen

LFM2.5-230M-Base-LittleBit es un checkpoint derivado de LiquidAI/LFM2.5-230M-Base, un modelo de lenguaje de 229.693.184 parametros desarrollado originalmente por Liquid AI. La adaptacion, publicada por el usuario dcharlot65-openie, no modifica los pesos en sentido clasico: aplica una factorizacion previa ("pre-factorized") combinando LittleBit-2 y Sakana SVF para almacenar los pesos en un formato comprimido propio denominado `.jsyn`, orientado al runtime JouleDB.

El interes tecnico del artefacto reside en su perfil de compresion extrema: el checkpoint ocupa 3,17 MB en disco frente a los 438,10 MB que ocuparia en FP16, lo que supone un factor de compresion de 138,39x y una media de 0,0489 bits por peso (BPW), es decir, un regimen sub-1-bit. El repositorio esta pensado para su uso dentro del ecosistema JouleDB (base de datos termodinamica, sustrato Kubernetes-native JouleKube y runtime de inferencia sin PyTorch).

Es relevante ahora porque explora una via poco comun en el despliegue de modelos: pesos "vivientes" comprimidos a una fraccion minima de su tamano original, con inferencia nativa en Rust y sin dependencia de PyTorch. No obstante, la informacion publicada es muy escasa: no hay resultados de benchmarks, no se detallan los idiomas soportados, el repositorio figura con 0,0 GB y 0 descargas, y la model card se limita al perfil de compresion y a las instrucciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM2.5-230M-Base; pesos factorizados LittleBit-2 + Sakana SVF) |
| Parametros totales | 229.693.184 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | sub-1-bit (0,0489 BPW medio); formato propietario `.jsyn` con zstd + CRC32; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (LFM Open License v1.0) |
| Formato de pesos | `.jsyn` (JouleDB); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base ni los datos de entrenamiento. Lo unico documentado es el esquema de factorizacion aplicado sobre LiquidAI/LFM2.5-230M-Base: los pesos se reorganizan en 83 tensores de planos de bits bidimensionales (2D bitplane tensors) y 49 vectores unidimensionales correspondientes a LayerNorm, bias y convoluciones depthwise. Esta descomposicion permite almacenar la informacion en un regimen de 0,0489 BPW, muy por debajo de 1 bit por peso.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones de inferencia como decodificacion especulativa o atencion lineal. El unico detalle operativo es que el checkpoint esta adaptado para ejecutarse en JouleDB v0.2.4 o superior, un runtime de inferencia escrito en Rust que no depende de PyTorch y que se describe como "zero-PyTorch".

## Capacidades

- Generacion de texto: heredada del modelo base LFM2.5-230M-Base, aunque no se detallan capacidades concretas en la informacion disponible.
- Razonamiento, codigo y matematicas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Inferencia en runtime JouleDB sin PyTorch, con pesos comprimidos en formato `.jsyn`.

## Casos de uso

- Despliegue en entornos con restricciones extremas de almacenamiento: el checkpoint de 3,17 MB permite distribuir el modelo en imagenes de contenedor, dispositivos embebidos o nodos de borde donde 438 MB en FP16 serian inviables. Es adecuado por su factor de compresion de 138,39x.
- Experimentacion con pesos sub-1-bit: util para investigadores que quieran evaluar la viabilidad de modelos en regimen de 0,0489 BPW frente a cuantizaciones convencionales de 4 u 8 bits.
- Integracion en pipelines Kubernetes-native: el tag `kubernetes-native` y el sustrato JouleKube sugieren su uso como componente de agentes desplegados en cluster, con el modelo servido via `jouledb serve`.
- Prototipado rapido de aplicaciones de texto: al ocupar tan poco espacio, permite arrancar un endpoint HTTP local (`127.0.0.1:8080`) y descargar el modelo con `hf_pull` en segundos, lo que agiliza pruebas de concepto.
- Evaluacion comparativa de runtimes: sirve para medir latencia y throughput del runtime JouleDB frente a vLLM o llama.cpp en un modelo de 230M parametros.
- Investigacion sobre compresion de modelos: el par (83 tensores 2D, 49 vectores 1D) y el uso combinado de LittleBit-2 y Sakana SVF constituyen un caso de estudio reproducible para tecnicas de factorizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de compresion:

| Metrica | Valor |
|---|---|
| Parametros totales | 229.693.184 |
| Tamano equivalente en FP16 | 438,10 MB |
| Tamano comprimido `.jsyn` (zstd + CRC32) | 3,17 MB |
| Factor de compresion | 138,39x |
| Bits por peso (BPW) medio | 0,0489 |
| Tensores 2D (planos de bits) | 83 |
| Vectores 1D (LayerNorm / bias / depthwise) | 49 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El checkpoint en disco ocupa 3,17 MB, pero la memoria necesaria en ejecucion depende del runtime JouleDB y de si los pesos se descomprimen en memoria; no se documenta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: JouleDB v0.2.4 o superior (`cargo binstall jouledb`, `jouledb serve --http-addr 127.0.0.1:8080`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo adaptado, por lo que la comparacion se limita a caracteristicas estructurales frente al modelo base y a alternativas de tamano similar.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-230M-Base-LittleBit | 229.693.184 | no disponible | `.jsyn` (JouleDB) | lfm1.0 | Hugging Face, 0 descargas |
| LiquidAI/LFM2.5-230M-Base | 229.693.184 (segun checkpoint derivado) | no disponible | no disponible | lfm1.0 | Hugging Face (modelo base) |
| Alternativas de ~230M parametros | no disponible | no disponible | no disponible | no disponible | no disponible |

No se identifican en la informacion proporcionada otros modelos comparables de la misma categoria con datos verificables.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre la calidad de las salidas tras la factorizacion sub-1-bit; la degradacion respecto al modelo base es desconocida.
- Riesgo de alucinacion: inherente a un modelo de 230M parametros, pero no cuantificado en la informacion disponible.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingue ni el comportamiento en castellano.
- Licencia restrictiva: la LFM Open License v1.0 permite uso academico, de investigacion y comercial solo a entidades con ingresos anuales inferiores a 10 millones de USD; por encima de ese umbral es necesario contactar con Liquid AI.
- Dependencia de un runtime propietario: el formato `.jsyn` solo es utilizable con JouleDB, lo que limita la portabilidad frente a safetensors o GGUF.
- Madurez del artefacto: repositorio con 0,0 GB reportados, 0 descargas y 0 likes, creado y actualizado el mismo dia (23 de noviembre de 2026); no hay evidencia de validacion por terceros.
- Sin informacion sobre sesgos, contexto maximo ni comportamiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dcharlot65-openie/LFM2.5-230M-Base-LittleBit
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M-Base
- Licencia LFM Open License v1.0: https://www.liquid.ai/lfm-license
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
