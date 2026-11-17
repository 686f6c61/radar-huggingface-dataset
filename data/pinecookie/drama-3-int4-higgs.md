# PineCookie/drama-3-int4-higgs

## Resumen

Drama 3 int4 HIGGS es una cuantizacion de 4 bits del modelo de sintesis de voz Fish Audio Drama 3, publicada por el usuario PineCookie como parte del ecosistema de su motor de inferencia Polyvox Studio. El modelo base es un sistema text-to-speech de 6.891.548.288 parametros (aproximadamente 6,9 mil millones) desarrollado por Fish Audio, y esta version reduce el peso en disco de 39,6 GB a 22,4 GB manteniendo, segun el autor, una calidad practicamente identica a la de los pesos oficiales.

La innovacion principal no es la cuantizacion en si, sino el metodo empleado: los expertos enrutados (256 por capa) se almacenan rotados mediante una matriz de Hadamard y cuantizados sobre una rejilla no uniforme de 16 niveles derivada de un cuantizador Lloyd-Max para distribuciones gaussianas, siguiendo el metodo HIGGS de Malinovskii et al. Esto evita el deterioro tipico de la cuantizacion entera a 4 bits y permite ejecutar el modelo en una GPU de 12 GB VRAM con 32 GB de RAM.

El resultado es relevante para quienes necesitan desplegar TTS de alta calidad en hardware consumer: el autor reporta una perplejidad (cross-entropy sobre tokens semanticos reales) igual o ligeramente mejor que los pesos oficiales, con una penalizacion de velocidad de decodificacion de aproximadamente el 3%. La contrapartida es que el formato de pesos es propietario y requiere un cargador especifico (Polyvox Studio 0.6.0 o superior) o reimplementar el esquema descrito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), atencion completa y atencion lineal combinadas (detalles completos no disponibles) |
| Parametros totales | 6.891.548.288 (~6,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits en expertos enrutados (HIGGS, grupos de 128); 4 bits simetricos en lineales de atencion (grupos de 32); resto en precision original (bf16/FP8 segun componente) |
| Idiomas soportados | no disponible (la evaluacion de calidad se hizo con dos hablantes de chino) |
| Licencia | Fish Audio Community License (research, uso no comercial y empresas con ingresos anuales inferiores a 500.000 USD) |
| Formato de pesos | safetensors con esquema de cuantizacion propio (qweight int32, scales fp16, hadamard_signs, g_idx) |

## Arquitectura y entrenamiento

El modelo base Drama 3 de Fish Audio es un sistema text-to-speech con arquitectura de mezcla de expertos: cada capa contiene 256 expertos enrutados, acompanados de expertos compartidos, routers, embeddings, una cabeza de salida, un decodificador de codebook (tower) y un codec de audio. La atencion combina capas de atencion completa (proyecciones q, k, v, o) con capas de atencion lineal (in_proj_qkv, in_proj_z, out_proj). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La cuantizacion de esta version, realizada sin datos de calibracion, transforma cada matriz de pesos W [N, K] de los expertos multiplicandola a lo largo de K por `blockdiag(diag(s) H)`, donde H es la matriz de Hadamard ortonormal de 128x128 y s un vector fijo de ±1 por cada K (almacenado como `quant.hadamard_signs.<K>`). Los pesos rotados resultantes son casi gaussianos, lo que permite redondear cada grupo de 128 valores a los 16 niveles de una rejilla Lloyd-Max optima para una gaussiana estandar, con una unica escala fp16 elegida por busqueda del minimo error. Los lineales de atencion usan cuantizacion simetrica de 4 bits en grupos de 32 con `g_idx` ordenado. El script `convert_drama3_higgs.py` (Apache-2.0) reproduce la conversion byte a byte y tarda unos 3 minutos en GPU.

## Capacidades

- Sintesis de voz a partir de texto (text-to-speech) con clonacion de voz mediante clips de referencia incluidos en el prompt.
- Modelado de habla expresiva y natural, orientado a produccion de audio de alta fidelidad.
- Soporte multilingue: no confirmado en la informacion disponible; la evaluacion publicada se limita a hablantes de chino.
- Integracion con el motor Polyvox Studio para inferencia en hardware consumer.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada.

## Casos de uso

- Clonacion de voz para produccion de audiolibros y narracion: el modelo acepta clips de referencia del hablante en el prompt, lo que permite generar voces consistentes a lo largo de textos largos; el formato de 4 bits reduce el coste de almacenamiento y permite ejecutarlo en una estacion de trabajo con GPU de 12 GB.
- Doblaje y localizacion de contenido: sintesis de voz con timbre controlado por referencia, util para generar pistas de voz en distintos idiomas o registros a partir de un hablante original, siempre con consentimiento explicito segun la licencia.
- Asistentes de voz integrados en aplicaciones de escritorio: el modelo cabe en 22,4 GB de disco y se ejecuta en 12 GB de VRAM, lo que permite empaquetarlo en herramientas locales sin depender de servicios en la nube (la licencia prohibe servicios alojados sin acuerdo con Fish Audio).
- Prototipado de interfaces conversacionales: investigadores pueden evaluar la calidad de TTS de un modelo de ~6,9 B en entornos de laboratorio con una unica GPU consumer, comparando variantes de cuantizacion sin recalibrar.
- Generacion de voces para videojuegos y contenido interactivo: la inferencia local con latencia moderada (penalizacion de ~3% frente a 4 bits enteros) permite generar dialogos bajo demanda en fases de prototipo.
- Investigacion en cuantizacion de modelos MoE: el repositorio incluye el script de conversion y la descripcion completa del formato HIGGS, lo que lo convierte en material de referencia para estudiar tecnicas de cuantizacion no uniforme en modelos de habla.

## Benchmarks y rendimiento

El autor publica una evaluacion teacher-forced sobre 40 clips reales de dos hablantes de chino (4368 frames), con tres clips de referencia por hablante en el prompt. La metrica es la cross-entropy del token semantico real por frame frente a los pesos oficiales (expertos FP8, atencion bf16); todas las filas usan atencion de 4 bits en grupos de 32.

| Variante de expertos | Diferencia vs oficial (nats) |
|---|---|
| 4 bits enteros, grupos de 128, redondeo al mas cercano tras busqueda de clip | +0.022 ± 0.009 (+0.49%) |
| 4 bits enteros, grupos de 32 | +0.010 |
| HIGGS, grupos de 128 (esta build) | −0.002 ± 0.008 |

El error relativo de pesos de los expertos es 0.088 frente a 0.103 de los enteros de 4 bits. La similitud de hablante (CAM++) resulto igual o superior a la de los expertos enteros, y el reconocimiento de voz no encontro errores de palabra en 96 tomas. La decodificacion es aproximadamente un 3% mas lenta debido a la busqueda en la rejilla del kernel.

## Requisitos de hardware

- VRAM estimada: 12 GB para inferencia completa con Polyvox Studio (configuracion reportada por el autor).
- RAM del sistema: 32 GB en la configuracion de referencia.
- Almacenamiento: 22,4 GB de pesos (frente a 39,6 GB de los oficiales).
- GPU recomendadas: no se especifican modelos concretos; la configuracion validada es una GPU de 12 GB (equivalente a RTX 3060 de 12 GB, RTX 4070 o similar).
- Cabe en GPU consumer: si, en tarjetas con 12 GB de VRAM o mas.
- Opciones de despliegue: Polyvox Studio 0.6.0 o superior, o implementacion propia del formato HIGGS descrito en la model card y en `convert_drama3_higgs.py`. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; solo se indica que la decodificacion es ~3% mas lenta que con expertos enteros de 4 bits.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Drama 3 int4 HIGGS (este) | ~6,9 B | no disponible | 4 bits HIGGS + 4 bits atencion | Fish Audio Community | Hugging Face, requiere Polyvox Studio |
| Fish Audio Drama 3 (oficial) | ~6,9 B | no disponible | FP8 expertos + bf16 atencion | Fish Audio Community | Hugging Face, 39,6 GB |
| Builds comunitarias `drama-3-int4` (enteros) | ~6,9 B | no disponible | 4 bits enteros | Fish Audio Community | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos TTS de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El formato de pesos es propio: los cargadores que interpreten los expertos como enteros de 4 bits convencionales produciran salidas incorrectas. Es obligatorio usar Polyvox Studio 0.6.0+ o reimplementar la rotacion de Hadamard y la rejilla Lloyd-Max.
- La evaluacion de calidad se limita a dos hablantes de chino; no hay datos sobre otros idiomas ni sobre diversidad de voces.
- No se han publicado datos sobre sesgos, alucinaciones o robustez ante entradas adversas.
- La licencia Fish Audio Community permite uso gratuito solo para investigacion, uso no comercial y empresas con ingresos anuales inferiores a 500.000 USD; prohibe servicios alojados sin licencia separada de Fish Audio y el uso de las salidas para entrenar otros modelos de habla.
- Se requiere consentimiento explicito para clonar la voz de una persona real.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion independiente de la comunidad.
- La penalizacion de velocidad de ~3% puede ser relevante en despliegues de baja latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PineCookie/drama-3-int4-higgs
- Modelo base oficial: https://huggingface.co/fishaudio/drama-3
- Motor Polyvox Studio: https://github.com/PineCookie/Polyvox-Studio
- Paper de referencia HIGGS (Malinovskii et al., "Pushing the Limits of Large Language Model Quantization"): no disponible en la informacion proporcionada
- Script de conversion: `convert_drama3_higgs.py` incluido en el repositorio del modelo
