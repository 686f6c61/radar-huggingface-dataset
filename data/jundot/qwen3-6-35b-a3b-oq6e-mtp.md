# Jundot/Qwen3.6-35B-A3B-oQ6e-mtp

## Resumen

Qwen3.6-35B-A3B-oQ6e-mtp es un checkpoint cuantizado en formato MLX del modelo multimodal Qwen/Qwen3.6-35B-A3B, publicado por el usuario Jundot. Se trata de una cuantizacion de precision mixta generada con la herramienta oQ (oMLX v0.7.1) e Improved oQe Quantization, que asigna bits por capa segun su sensibilidad medida. El checkpoint incluye los tres componentes del modelo original: el backbone de lenguaje, el codificador de vision y la cabeza de prediccion multi-token (MTP). El resultado pesa 35.951.822.704 parametros logicos almacenados en 28,056 GiB, con una media efectiva de 6,703 bits por peso.

El modelo base es un MoE de tipo vision-lenguaje con 35B de parametros totales y 3B activos por token, con una disposicion hibrida de capas Gated DeltaNet y Gated Attention. Esta combinacion busca reducir el coste de atencion en contextos largos manteniendo la calidad de un transformer clasico, mientras la cabeza MTP permite decodificacion especulativa con el propio modelo. La relevancia practica de este checkpoint es que traslada ese modelo a hardware Apple Silicon con un peso cercano a la mitad de lo que ocuparia en BF16 (~72 GB estimados a partir del recuento de parametros), lo que hace viable su ejecucion en equipos con memoria unificada de gama alta.

El checkpoint se publica bajo licencia Apache-2.0, heredada del modelo fuente, y esta etiquetado con el pipeline image-text-to-text, por lo que acepta entradas de imagen y texto. No se han publicado en la informacion disponible datos sobre idiomas soportados, longitud de contexto, benchmarks ni resultados de rendimiento medidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE vision-lenguaje con capas hibridas Gated DeltaNet y Gated Attention (tag: qwen3_5_moe) |
| Parametros totales | 35.951.822.704 (35,95B) |
| Parametros activos | 3B (denominacion A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ6e de precision mixta: affine 6 bits (grupos 128 y 64), affine 8 bits (grupos 128 y 64) y BF16; media efectiva de 6,703 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors para MLX (libreria mlx) |

Distribucion de bits del checkpoint:

| Formato de almacenamiento | Pesos logicos | Porcentaje del total | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 6 bits, grupo 128 | 0,252B | 0,700% | 0,183 GiB | 6,25 |
| Affine 6 bits, grupo 64 | 33,788B | 93,982% | 25,568 GiB | 6,50 |
| Affine 8 bits, grupo 128 | 0,129B | 0,359% | 0,124 GiB | 8,25 |
| Affine 8 bits, grupo 64 | 1,305B | 3,631% | 1,292 GiB | 8,50 |
| BF16 | 0,478B | 1,329% | 0,890 GiB | 16,00 |
| Total | 35,952B | 100% | 28,056 GiB | 6,703 |

Desglose por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Backbone de lenguaje | 34,661B | 28,527 GB / 26,568 GiB |
| Codificador de vision | 0,447B | 0,893 GB / 0,832 GiB |
| Cabeza MTP | 0,845B | 0,704 GB / 0,656 GiB |
| Total | 35,952B | 30,125 GB / 28,056 GiB |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina un backbone de lenguaje con mezcla de expertos (MoE) de 35B parametros totales y 3B activos, un codificador de vision de 0,447B parametros y una cabeza de prediccion multi-token (MTP) de 0,845B. La parte de lenguaje alterna capas Gated DeltaNet con capas Gated Attention, un esquema hibrido que sustituye parte de la atencion cuadratica por un mecanismo de estado recurrente con compuertas. Sobre esta base, el checkpoint anade la capacidad multimodal mediante el codificador de vision, y la cabeza MTP habilita la generacion de varios tokens por paso para decodificacion especulativa.

Este repositorio concreto no es un modelo entrenado desde cero, sino una cuantizacion del checkpoint Qwen/Qwen3.6-35B-A3B. El proceso oQ6e mide la sensibilidad de cada capa, asigna bits en funcion de ella y redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) seguida de un reajuste de escala y sesgo por minimos cuadrados ponderados. El resultado concentra el 93,982% de los pesos en affine 6 bits con grupo 64, reserva affine 8 bits para un 3,99% de los pesos y mantiene un 1,329% en BF16, presumiblemente en las capas mas sensibles a la cuantizacion. No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens utilizados ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional, con la etiqueta conversational en el repositorio.
- Comprension de imagen y texto de forma conjunta (pipeline image-text-to-text), gracias al codificador de vision incluido en el checkpoint.
- Razonamiento multimodal en conversaciones multi-turno, al conservarse intacto el codificador de vision tras la cuantizacion.
- Prediccion multi-token mediante la cabeza MTP, que permite decodificacion especulativa con el propio modelo para acelerar la generacion.
- Soporte de tool calling y function calling: no documentado en la informacion disponible para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales adicionales (modo thinking explicito, audio, etc.): no disponible.

## Casos de uso

- Asistente multimodal local en Apple Silicon: al ocupar 28,056 GiB de pesos, el modelo cabe en equipos con memoria unificada de 36 GB o superior, lo que permite desplegar un VLM de 35B en un portatil o Mac Studio sin depender de la nube.
- Analisis de documentacion tecnica con imagenes: el pipeline image-text-to-text permite extraer informacion de diagramas, capturas de pantalla o esquemas y generar resumenes en texto dentro de la misma conversacion.
- Prototipado de agentes multimodales: la cabeza MTP reduce el coste por token generado, lo que abarata las iteraciones en bucles de razonamiento donde se encadenan varias llamadas al modelo.
- Evaluacion comparativa de tecnicas de cuantizacion: al publicarse la distribucion exacta de bits por formato, sirve como referencia para estudiar el impacto de la precision mixta frente al modelo base en BF16.
- Despliegue en investigacion con requisitos de privacidad: al ejecutarse localmente en MLX, los datos de imagen y texto no salen del equipo, lo que encaja en entornos con restricciones de tratamiento de datos.
- Servicio de descripcion y etiquetado de imagenes a escala moderada: el codificador de vision de 0,447B anade solo 0,832 GiB al checkpoint, por lo que el coste de anadir entrada visual es bajo respecto al total.
- Base para ajuste fino con LoRA en MLX: al ser un checkpoint de 6 bits con licencia Apache-2.0, puede servir de punto de partida para adaptaciones de dominio en hardware de Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente documenta la distribucion de bits y el almacenamiento del checkpoint (media de 6,703 bits por peso, 28,056 GiB en total), sin comparaciones de calidad frente al modelo base en BF16 ni frente a otras cuantizaciones.

## Requisitos de hardware

- Peso en disco y en memoria: 30,125 GB (28,056 GiB) de pesos en safetensors, segun el desglose del autor; a esto hay que sumar la cache KV, las activaciones y el overhead del runtime de MLX.
- Memoria unificada recomendada: 36 GB o mas para uso comodo; 32 GB puede ser suficiente solo con contextos cortos y sin procesos pesados en paralelo; 64 GB o mas si se trabaja con contextos largos o varias instancias.
- GPU compatibles: MLX esta disenado para Apple Silicon (familia M1 en adelante), por lo que la ejecucion nativa requiere un Mac con chip M-series. En GPU NVIDIA o AMD no funciona sin convertir previamente los pesos a otro formato, algo que este repositorio no ofrece.
- Equipos objetivo tipicos: MacBook Pro con M4 Pro/Max de 36 a 48 GB, Mac Studio con M-series Max o Ultra de 64 GB o superior.
- Opciones de despliegue: runtime MLX (mlx-lm para texto, mlx-vlm para el pipeline image-text-to-text) y la propia herramienta oQ/oMLX v0.7.1 empleada en la cuantizacion. vLLM, llama.cpp, Ollama y TGI no soportan pesos MLX de forma nativa.
- Latencia y throughput estimados: no disponible. El autor no publica mediciones y la ganancia de la cabeza MTP depende del runtime que implemente la decodificacion especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Formato y precision | Almacenamiento | Contexto | Licencia |
|---|---|---|---|---|---|
| Jundot/Qwen3.6-35B-A3B-oQ6e-mtp | 35,95B totales, 3B activos | MLX safetensors, 6,703 bits/peso de media | 28,056 GiB | no disponible | Apache-2.0 |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35,95B totales, 3B activos | safetensors en BF16 | ~72 GB estimados a partir del recuento de parametros | no disponible | Apache-2.0 |
| Otras cuantizaciones del mismo modelo base (GGUF, AWQ, GPTQ) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativos entre el checkpoint cuantizado y el modelo base en BF16, ni de mediciones frente a alternativas de otros formatos de cuantizacion.

## Limitaciones y advertencias

- La cuantizacion a 6,703 bits por peso puede degradar la calidad respecto al modelo base en BF16; el autor no publica ninguna evaluacion de la perdida de precision.
- La cabeza MTP y el codificador de vision tambien han sido cuantizados, de modo que la degradacion puede afectar tanto a la generacion de texto como a la comprension de imagenes y a la decodificacion especulativa.
- Al ser una cuantizacion y no un entrenamiento nuevo, hereda los sesgos y limitaciones del modelo base Qwen/Qwen3.6-35B-A3B, que no se documentan en la informacion disponible.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; cualquier uso en produccion deberia validarse con evaluaciones propias.
- Idioma y contexto: no se especifican los idiomas soportados ni la longitud de contexto, por lo que no es posible garantizar su comportamiento en castellano ni en conversaciones largas.
- Aunque la licencia es Apache-2.0, conviene verificar el fichero LICENSE incluido y las condiciones del modelo base antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no hay validaciones de terceros publicadas.
- La etiqueta de arquitectura del repositorio es qwen3_5_moe, mientras que el modelo base se denomina Qwen3.6-35B-A3B; esta discrepancia menor en la nomenclatura conviene tenerla en cuenta al automatizar selecciones de modelo.
- El checkpoint solo es utilizable en el ecosistema MLX sobre Apple Silicon; no hay versiones GGUF, AWQ o GPTQ publicadas en este repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jundot/Qwen3.6-35B-A3B-oQ6e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Herramienta de cuantizacion oQ / oMLX: https://github.com/jundot/omlx
- Pull request de Improved oQe Quantization: https://github.com/jundot/omlx/pull/4385
