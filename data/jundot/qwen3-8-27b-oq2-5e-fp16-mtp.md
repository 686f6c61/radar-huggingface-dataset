# Jundot/Qwen3.8-27B-oQ2.5e-fp16-mtp

## Resumen

Qwen3.8-27B-oQ2.5e-fp16-mtp es un checkpoint cuantizado en formato MLX del modelo Qwen/Qwen3.8-27B, publicado por el usuario Jundot. Se trata de un modelo denso de vision-lenguaje de 27,78 mil millones de parametros, construido sobre la arquitectura Qwen3.5, con un diseno hibrido de capas Gated DeltaNet (atencion lineal) y Gated Attention (atencion completa), comprension de imagen y video, y una ventana de contexto nativa de 262.144 tokens. La cuantizacion se ha realizado con la herramienta oQ (oMLX v0.7.1) mediante cuantizacion de precision mixta guiada por la sensibilidad medida de cada capa.

El checkpoint no es un modelo nuevo, sino una redistribucion de pesos del modelo base orientada a reducir el espacio de almacenamiento y el consumo de memoria en hardware Apple Silicon. Frente a una cuantizacion uniforme de 4 bits, esta build asigna 2 bits al 77,109% de los pesos logicos y reserva 5 y 8 bits para las capas mas sensibles, con una media efectiva de 3,908 bits por peso. El resultado ocupa 13,573 GB (12,640 GiB) e incluye el backbone de lenguaje, el codificador de vision y la cabeza de prediccion multi-token (MTP).

Es relevante para desarrolladores que quieran ejecutar localmente un modelo multimodal de 27B con contexto de 262.144 tokens en equipos de memoria unificada moderada, ya que el peso total del checkpoint queda por debajo de los 13 GB. La contrapartida es que no hay ningun benchmark publicado que cuantifique la perdida de calidad introducida por la cuantizacion de 2 bits en la mayor parte de las capas, y que el repositorio no cuenta practicamente con validacion de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas Gated DeltaNet (atencion lineal) y Gated Attention (atencion completa); multimodal vision-lenguaje; incluye cabeza MTP (multi-token prediction) |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 262.144 tokens (nativo, segun la model card) |
| Tipos de cuantizacion | Precision mixta: affine 2, 3, 4, 5, 6 y 8 bits con grupo 64, mas tensores en FP16 y FP32; media efectiva de 3,908 bits por peso |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |
| Modelo base | Qwen/Qwen3.8-27B (relacion: quantized) |
| Tamano del repositorio | 13,6 GB (12,640 GiB de pesos) |
| Componentes | Backbone de lenguaje: 26,896 B / 10,631 GiB; codificador de vision: 0,461 B / 1,716 GiB (FP32); cabeza MTP: 0,425 B / 0,293 GiB |
| Pipeline declarado | image-text-to-text |
| Libreria | mlx |

## Arquitectura y entrenamiento

Este checkpoint no aporta entrenamiento propio: es una conversion de pesos del modelo Qwen/Qwen3.8-27B, por lo que la arquitectura, los datos de entrenamiento y el alineamiento son los del modelo base (no detallados en la informacion proporcionada). La arquitectura descrita en la model card es un transformer denso de 27B con disposicion hibrida: una parte de las capas usa Gated DeltaNet, un mecanismo de atencion lineal con estado recurrente que reduce el coste de la cache de clave-valor en secuencias largas, y otra parte usa Gated Attention clasica. Esta combinacion es la que permite sostener una ventana nativa de 262.144 tokens. El modelo incorpora ademas un codificador de vision para entender imagenes y video, y una cabeza de prediccion multi-token (MTP) que habilita decodificacion especulativa.

La innovacion tecnica de esta publicacion concreta esta en la cuantizacion. oQ2.5e asigna bits por sensibilidad medida de cada capa y despues redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) y un reajuste de escala y sesgo por minimos cuadrados ponderados. La distribucion resultante es: 2 bits para el 77,109% de los pesos logicos (6,235 GiB), 5 bits para el 10,521% (1,872 GiB), 8 bits para el 9,153% (2,516 GiB), 4 bits para el 1,340% (0,195 GiB) y residuales en FP16 y FP32. En esta build FP16 se almacenan las escalas y sesgos de cuantizacion y los tensores no cuantizados, en lugar de BF16, y el codificador de vision se mantiene integro en FP32 (1,716 GiB), lo que explica que sea el unico componente no comprimido.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, heredados del modelo base Qwen3.8-27B.
- Comprension de imagen y video: el checkpoint conserva el codificador de vision completo en FP32 y el pipeline declarado es image-text-to-text.
- Contexto largo: ventana nativa de 262.144 tokens, con un diseno hibrido de atencion lineal y atencion completa orientado a contener el coste de la cache en secuencias largas.
- Decodificacion multi-token: incluye la cabeza MTP, lo que en teoria permite decodificacion especulativa para acelerar la generacion, siempre que el runtime MLX la soporte (no se documenta en la informacion disponible).
- Codigo y matematicas: capacidades presumibles del modelo base, pero no verificadas en esta cuantizacion ni respaldadas por benchmarks publicados en el repositorio.
- Tool calling y uso agentico: no confirmado en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card no declara cobertura de idiomas.
- Modo de razonamiento explicito (thinking): no confirmado en la informacion proporcionada.

## Casos de uso

- Asistente multimodal local en portatil o equipo de sobremesa Apple Silicon: el checkpoint cabe en menos de 13 GB de pesos, de modo que un Mac con 32 GB de memoria unificada puede cargarlo y mantener conversaciones con imagenes sin depender de la nube.
- Analisis de documentos escaneados y capturas: al combinar vision y una ventana de 262.144 tokens, permite procesar informes extensos con figuras y tablas en una sola pasada, sin trocear el documento en fragmentos que rompan el contexto.
- Transcripcion semantica de video: el modelo acepta entrada de video y contexto largo, lo que permite resumir grabaciones extensas o extraer acciones concretas de una secuencia a partir de instrucciones en lenguaje natural.
- Prototipado e investigacion con restricciones de red: al ser pesos abiertos bajo Apache-2.0 y ejecutarse con MLX, sirve para experimentar con modelos multimodales de 27B en entornos sin conexion o con requisitos de privacidad estrictos.
- Evaluacion de tecnicas de cuantizacion: por su distribucion de bits documentada (2 a 8 bits por capa), es util como caso de estudio para medir el impacto real de la cuantizacion mixta frente a esquemas uniformes sobre una misma arquitectura.
- Generacion de codigo en flujo local sobre repositorios grandes: la ventana de 262.144 tokens permite cargar una porcion amplia de un proyecto como contexto, aunque la calidad en tareas de codigo tras la cuantizacion de 2 bits no esta medida.
- Fine-tuning ligero o destilacion sobre el backbone de lenguaje: los pesos del backbone estan accesibles y la licencia Apache-2.0 permite reutilizarlos, teniendo en cuenta que el codificador de vision va en FP32 y suma 1,716 GiB no comprimidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card se limita a documentar la distribucion de bits, el desglose de almacenamiento y el origen de los pesos; no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra metrica, ni del modelo base ni de esta cuantizacion.

## Requisitos de hardware

- VRAM o memoria unificada para pesos: 12,640 GiB (13,573 GB) para el checkpoint completo, mas el espacio de trabajo del runtime y la cache de clave-valor.
- Estimacion practica de memoria unificada: 16 GB cubren la carga del modelo con contexto corto; 24 GB permiten contextos medios; 32-64 GB son recomendables para aprovechar de forma realista contextos de decenas o cientos de miles de tokens.
- Cache de clave-valor: el tamano exacto por token no esta disponible. Las capas Gated DeltaNet mantienen estado recurrente en lugar de cache completa, lo que deberia reducir el coste frente a un transformer de atencion completa equivalente, pero no hay cifras publicadas.
- Componente no comprimible: el codificador de vision ocupa 1,716 GiB en FP32 y no se reduce con la cuantizacion.
- GPU y aceleradores: el formato es MLX, por lo que el destino natural es silicio Apple (familias M1, M2, M3 y M4, preferiblemente variantes Pro, Max o Ultra). No hay soporte declarado para A100, H100 o RTX 4090 sin conversion previa de los pesos.
- Cabe en GPU de consumo: no en el formato actual, al ser MLX y no CUDA; tras convertir a otro formato, el peso de 13,573 GB entraria en GPUs con 16 GB o mas de VRAM, aunque el consumo real con contexto largo seria mayor.
- Opciones de despliegue: MLX mediante mlx-lm o mlx-vlm (necesario este ultimo por tratarse de image-text-to-text) y el propio ecosistema oMLX/oQ del autor. vLLM, llama.cpp, Ollama y TGI no consumen safetensors MLX de forma directa; requeririan una conversion previa.
- Latencia y throughput: no disponibles. La presencia de la cabeza MTP sugiere margen para decodificacion especulativa, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jundot/Qwen3.8-27B-oQ2.5e-fp16-mtp (este checkpoint) | 27,78 B (denso) | 262.144 tokens | MLX safetensors, precision mixta 2-8 bits, 3,908 bits/peso, 12,640 GiB | Apache-2.0 | Publicado en HuggingFace; 0 descargas y 1 like en el momento del analisis |
| Qwen/Qwen3.8-27B (modelo base) | 27,78 B (denso) | 262.144 tokens | Pesos originales, presumiblemente BF16 (no disponible el detalle exacto) | Apache-2.0 | Modelo de referencia del que deriva este checkpoint |
| Otras cuantizaciones del mismo modelo base (4-bit uniforme, GGUF, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparado entre este checkpoint y el modelo base ni entre este y otras cuantizaciones, por lo que la comparativa se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- Cuantizacion agresiva: el 77,109% de los pesos logicos estan a 2 bits. Aunque la asignacion por sensibilidad y el reajuste por minimos cuadrados ponderados mitigan el dano, cabe esperar degradacion en tareas de razonamiento, codigo y matematicas; no hay ninguna medicion publicada que la cuantifique.
- Sin validacion de la comunidad: el repositorio registra 0 descargas y 1 like, y no hay evaluaciones independientes ni discusion de terceros que confirmen que el checkpoint funciona como se describe.
- Riesgo de alucinacion: inherente a los modelos generativos y no evaluado en esta build. La ausencia de benchmarks impide acotar la tasa de error esperable.
- Idiomas: no se declara cobertura linguistica. No se puede asumir un comportamiento correcto en castellano sin pruebas propias.
- Contexto: la ventana nativa de 262.144 tokens es una especificacion del modelo base; no hay datos sobre la calidad efectiva de recuperacion en contextos muy largos ni sobre el consumo real de memoria en ese regimen.
- Licencia: Apache-2.0 permite uso comercial, pero se hereda del modelo base Qwen/Qwen3.8-27B. Conviene verificar los terminos vigentes de ese modelo antes de un despliegue en produccion, ya que la ficha del derivado no los reproduce.
- Dependencia de plataforma: al estar en formato MLX, el uso directo queda restringido a hardware Apple Silicon. Su explotacion en GPUs NVIDIA exige conversion de pesos, con el riesgo de perdida adicional de calidad y sin garantias de compatibilidad de la cabeza MTP.
- Cabeza MTP: la decodificacion especulativa que habilita no esta documentada como soportada en el runtime, por lo que su ventaja de rendimiento no debe darse por hecha.
- Fecha de publicacion: 12 de octubre de 2026; se trata de una publicacion reciente y de un autor sin historial verificable en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jundot/Qwen3.8-27B-oQ2.5e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de la herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Pull request de Improved oQe Quantization: https://github.com/jundot/omlx/pull/4385
