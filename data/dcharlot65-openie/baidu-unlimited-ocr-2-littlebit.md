# dcharlot65-openie/Baidu-Unlimited-OCR-2-LittleBit

## Resumen

`Baidu-Unlimited-OCR-2-LittleBit` es un checkpoint de pesos "vivos" (living weights) derivado de `baidu/Unlimited-OCR-2` mediante un proceso de factorización previa que combina la técnica LittleBit-2 con Sakana SVF. Lo publica el usuario `dcharlot65-openie` y está empaquetado en formato `.jsyn` para JouleDB, una base de datos termodinámica con runtime de inferencia sin PyTorch y sustrato Kubernetes-native (JouleKube). No es, por tanto, un modelo entrenado desde cero, sino una recompresión extrema del modelo OCR original de Baidu.

La propuesta central es la compresión sub-1-bit: el checkpoint declara 3.340.832.512 parámetros (unos 3,34 mil millones) que en FP16 ocuparían 6.372,13 MB, pero que en el formato `.jsyn` con compresión zstd y CRC32 se reducen a 40,77 MB, lo que equivale a un factor de compresión de 156,28x y una media de 0,0504 bits por peso (BPW). Esta cifra está muy por debajo de 1 bit por peso, de ahí la etiqueta "sub-1-bit".

La relevancia de esta ficha es limitada y conviene ser explícito: el repositorio tiene 0 descargas y 0 likes, el tamaño declarado del repo es de 0,0 GB, la model card no aporta datos de arquitectura, contexto, idiomas ni benchmarks, y la librería `jouledb` es una dependencia propietaria del ecosistema del autor. Se trata de un artefacto experimental de compresión, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base es de OCR; la model card no detalla la arquitectura interna) |
| Parametros totales | 3.340.832.512 (3,34 mil millones) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | formato propietario `.jsyn` con compresion zstd + CRC32; 0,0504 BPW medios; tensores en 2D bitplane (2433) y vectores 1D LayerNorm/Bias/Depthwise (384) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.jsyn` (JouleDB); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

No hay informacion sobre la arquitectura del modelo base `baidu/Unlimited-OCR-2` en la informacion proporcionada: no se especifica si es un transformer denso, un modelo vision-lenguaje o una arquitectura hibrida, ni se detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si hubo fases de RLHF o DPO. La model card solo identifica el modelo base y su licencia MIT.

Lo que si se documenta es el proceso de compresion aplicado. El checkpoint se describe como "pre-factorizado" mediante `LittleBit-2 ⊕ Sakana SVF`, una combinacion de una tecnica de factorizacion de pesos de muy baja precision (LittleBit-2) con Singular Value Factorization (SVF) atribuida a Sakana. Los pesos resultantes se almacenan como 2433 tensores en formato de planos de bits 2D mas 384 vectores 1D para LayerNorm, bias y convoluciones depthwise. El resultado se serializa en `.jsyn` con compresion zstd y verificacion CRC32, alcanzando 0,0504 BPW. No se detalla el error de reconstruccion, la perdida de calidad respecto al modelo original ni el procedimiento exacto de factorizacion.

## Capacidades

- No se documentan capacidades especificas del checkpoint en la model card; al derivar de un modelo de OCR, la funcion prevista es el reconocimiento optico de caracteres, pero no se aporta ninguna evaluacion que lo confirme tras la compresion.
- No hay informacion sobre soporte de tool calling ni function calling.
- No hay informacion sobre capacidades de agente o razonamiento multi-paso.
- No hay informacion sobre capacidades multilingues.
- No hay informacion sobre modos especiales (thinking mode, vision, audio).
- La unica capacidad tecnicamente verificable es la de carga e inferencia a traves del runtime JouleDB, mediante `db.hf_pull(...)` desde un servidor `jouledb serve`.

## Casos de uso

- Evaluacion de tecnicas de compresion extrema: el checkpoint sirve como banco de pruebas para medir la degradacion de calidad de un modelo OCR al pasar de FP16 a 0,0504 BPW; requiere comparar las salidas contra el modelo base `baidu/Unlimited-OCR-2` original.
- Investigacion en almacenamiento de pesos: util para estudiar la viabilidad de formatos de bitplane 2D combinados con SVF en lugar de cuantizacion escalar clasica, midiendo tasa de compresion frente a error de reconstruccion.
- Despliegue en entornos con restricciones severas de almacenamiento: los 40,77 MB del artefacto `.jsyn` permiten distribuirlo en imagenes de contenedor o nodos de borde donde un checkpoint FP16 de 6,37 GB seria inviable, siempre que se acepte el runtime JouleDB.
- Pruebas de integracion con JouleKube: valido para validar flujos de `hf_pull`, servicio HTTP en `127.0.0.1:8080` y orquestacion Kubernetes-native antes de adoptar el stack en un pipeline real.
- Reproducibilidad de artefactos: el uso de CRC32 en el formato permite verificar la integridad del checkpoint en procesos de distribucion, algo relevante en pipelines de datos que exigen comprobacion de integridad.
- Docencia y demostraciones sobre cuantizacion sub-1-bit: sirve para ilustrar de forma tangible la diferencia entre cuantizacion post-entrenamiento convencional (4 u 8 bits) y factorizacion de pesos por debajo de 1 bit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta metricas de compresion y tamano, no de calidad de reconocimiento.

| Metrica de compresion | Valor |
|---|---|
| Tamano equivalente FP16 | 6372,13 MB |
| Tamano comprimido `.jsyn` | 40,77 MB |
| Factor de compresion | 156,28x |
| Bits por peso (BPW) medios | 0,0504 |
| Tensores 2D bitplane | 2433 |
| Vectores 1D (LayerNorm/Bias/Depthwise) | 384 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint comprimido ocupa 40,77 MB en disco, pero la VRAM necesaria tras la descompresion y factorizacion no se documenta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se indica si el runtime JouleDB soporta CUDA, ROCm u otro backend.
- Opciones de despliegue: exclusivamente JouleDB (version 0.2.4 o superior), instalable con `cargo binstall jouledb` y arrancable con `jouledb serve --http-addr 127.0.0.1:8080`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones del modelo base en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. A modo de referencia estructural:

| Modelo | Parametros | Contexto | Licencia | Formato | Runtime |
|---|---|---|---|---|---|
| Baidu-Unlimited-OCR-2-LittleBit | 3,34 mil millones | no disponible | MIT | `.jsyn` | JouleDB |
| baidu/Unlimited-OCR-2 (base) | no disponible | no disponible | MIT | no disponible | no disponible |
| Alternativas OCR open source | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparacion con el modelo base, ni metrica de error de reconstruccion tras la compresion a 0,0504 BPW. Es imposible saber si el modelo conserva capacidad de OCR utilizable.
- Adopcion nula verificable: 0 descargas y 0 likes en el momento de la consulta, con repositorio de 0,0 GB declarado, lo que sugiere que el artefacto podria no estar realmente alojado o ser un placeholder.
- Dependencia de un runtime propietario: el formato `.jsyn` solo se carga con JouleDB, una herramienta del propio ecosistema del autor. No hay conversion documentada a safetensors, GGUF ni ONNX, lo que bloquea su uso en stacks convencionales.
- Riesgo de alucinacion: no evaluado. En modelos OCR, la compresion agresiva puede producir omisiones de texto, sustituciones de caracteres o salidas degeneradas sin que exista aviso en la model card.
- Idiomas: no se declara ningun conjunto de idiomas soportados, por lo que no puede asumirse cobertura multilingue.
- Licencia: MIT en el derivado y en el modelo base, lo que en principio permite uso comercial, pero la licencia no cubre las dependencias del runtime JouleDB, cuya licencia no se detalla en la informacion disponible.
- Contexto: al no publicarse la longitud de contexto, no puede planificarse su uso en documentos de varias paginas.
- Madurez: fecha de creacion y actualizacion del 24 de noviembre de 2026, sin historial de versiones ni issues; no hay evidencia de mantenimiento.
- Recomendacion: no emplear en produccion sin una evaluacion propia contra el modelo base y sin verificar la integridad y el contenido real del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dcharlot65-openie/Baidu-Unlimited-OCR-2-LittleBit
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR-2
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
