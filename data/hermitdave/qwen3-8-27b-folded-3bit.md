# hermitdave/Qwen3.8-27B-Folded-3bit

## Resumen

Qwen3.8-27B-Folded-3bit es una variante cuantizada a 3 bits por afinidad del modelo Qwen3.8-27B, publicada por el usuario hermitdave en Hugging Face. No se trata de un modelo entrenado desde cero ni de un ajuste fino, sino de una conversión de pesos derivada de Ternary-Bonsai-2-27B-mlx-2bit de Prism ML, una cuantización de 2 bits de Qwen3.8-27B que conserva aproximadamente el 95 % de la calidad del modelo base en FP16. El problema que resuelve es de compatibilidad: Bonsai 2 declara un `model_type` propietario (`prism_hadamard_qwen35`) y almacena los pesos en módulos personalizados que aplican una transformación de Hadamard en tiempo de ejecución, lo que impide cargarlo en `mlx-lm` convencional y en oMLX sin parches.

La innovación de esta ficha es el llamado mecanismo "folded": en lugar de aplicar la transformación de Hadamard a las activaciones durante la inferencia, esta se absorbe algebraicamente en los pesos. Como la matriz de Hadamard es ortogonal y simétrica (H^T = H, H² = I), la operación resultante es equivalente, pero el modelo puede ejecutarse como un transformer estándar sin kernels personalizados ni forks del runtime. El resultado es un checkpoint que carga directamente en `mlx-lm` y oMLX de serie.

El modelo cuenta con 27.356.728.560 parámetros totales (unos 27,36 mil millones) y un repositorio de 12,8 GB, lo que refleja el sobrecoste de las escalas y sesgos de cuantización en fp16 respecto al tamaño teórico de 3 bits puros. Su relevancia actual es doble: por un lado, demuestra una receta reutilizable para portar cuantizaciones experimentales a runtimes estándar; por otro, ofrece una alternativa de 3 bits que, según el autor, se sitúa en torno al 93-95 % de la calidad del modelo en FP16, frente al 90-93 % de la variante de 2 bits y a un 4 bits ingenuo de aproximadamente 14 GB. La contrapartida es que no se han publicado benchmarks formales y que la licencia no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B, con `model_type: qwen3_5` en los metadatos; incorpora un plegado algebraico de la transformacion de Hadamard en los pesos |
| Parametros totales | 27.356.728.560 (27,36 B) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afin de 3 bits (variante "Folded"); el autor publica tambien una version de 2 bits |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (carga via `mlx-lm` y oMLX) |

## Arquitectura y entrenamiento

El modelo no ha sido entrenado por el autor: es una transformacion de pesos. Su punto de partida es Ternary-Bonsai-2-27B-mlx-2bit de Prism ML, una cuantizacion de 2 bits de Qwen3.8-27B que almacena los pesos en "espacio Hadamard" (H·W) y aplica la transformacion equivalente a las activaciones (H·x) antes de la multiplicacion de matrices. La ventaja de ese esquema es que la transformada de Hadamard reparte los valores atipicos entre todas las dimensiones, lo que mejora notablemente la fidelidad de la cuantizacion agresiva a 2 bits. El inconveniente es que requiere un modulo MLX personalizado que combine `(weight_uint32, scales_fp16, biases_fp16, signs_fp32)` y un runtime que sepa instanciarlo.

La aportacion tecnica de este checkpoint consiste en reescribir la operacion como `y = x^T · diag(signs) · W`, de forma que `W_folded = diag(signs) · H · W` puede calcularse una sola vez, fuera de linea, y almacenarse como pesos convencionales. La identidad se sostiene porque H^T = H y H² = I, de modo que el resultado matematico es el mismo que el de Bonsai 2 sin necesidad de transformar activaciones en tiempo de ejecucion. El autor reconoce que la idea no es novedosa en la literatura de cuantizacion, pero que su aplicacion al patron concreto de Hadamard mas signos de Bonsai 2 requirio cuidado adicional. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO: esos datos corresponden al modelo base Qwen3.8-27B, no detallados en la informacion proporcionada.

## Capacidades

- Generacion de texto: el autor confirma generacion coherente en pruebas cualitativas tempranas, tanto en la variante de 2 bits como en la de 3 bits.
- Herencia de capacidades del modelo base: al ser una conversion de pesos de Qwen3.8-27B, las capacidades funcionales (razonamiento, codigo, matematicas, multilingue) dependen del modelo original y no estan documentadas en esta ficha.
- Modo de razonamiento o "thinking": no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no disponible.
- Capacidades multilingues: no disponible (la model card no declara idiomas).
- Ejecucion local en hardware Apple Silicon: capacidad habilitada por el formato MLX, que es el principal valor practico de este checkpoint.
- Despliegue sin kernels personalizados: carga directa en `mlx-lm` y oMLX estandar, sin fork de PrismML.

## Casos de uso

- Inferencia local en portatiles Mac: el checkpoint ocupa 12,8 GB y se carga con `mlx-lm` sobre memoria unificada, de modo que un Mac con 24 GB o 32 GB puede ejecutar un modelo de 27 B en cuantizacion de 3 bits sin depender de la nube ni de GPUs dedicadas.
- Asistentes de escritorio sin conexion: al no requerir runtime personalizado, el modelo puede integrarse en aplicaciones que embeben oMLX y ofrecer generacion de texto y resumen en entornos aislados o con conectividad restringida.
- Procesamiento de datos sensibles: casos en los que no se permite enviar informacion a APIs externas (sanidad, legal, analisis interno) y se necesita un modelo de 27 B ejecutandose integramente en la maquina del usuario.
- Investigacion sobre cuantizacion: el checkpoint sirve como referencia reproducible para estudiar el plegado de transformaciones ortogonales en pesos y comparar la degradacion de 2 bits frente a 3 bits y a 4 bits ingenuo, dentro de una misma familia de modelos.
- Prototipado rapido de aplicaciones LLM: dado que la carga es directa con `mlx_lm.load()`, resulta util para validar prompts, plantillas y flujos de generacion antes de invertir en infraestructura GPU o en versiones de mayor precision.
- Comparacion de la escalera de bits: el autor publica variantes de 2 y 3 bits de la misma receta, lo que permite medir en local el compromiso entre huella en disco y calidad cualitativa para elegir el punto adecuado en cada maquina.
- Base para futuras conversiones: la receta "folded" puede aplicarse a otros modelos en formato Bonsai, por lo que este checkpoint tambien funciona como prueba de concepto para portar cuantizaciones experimentales a runtimes estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo aun no se ha evaluado con MMLU, GSM8K, HumanEval ni ninguna otra suite estandar, y que las estimaciones de calidad son cualitativas. Lo unico disponible es la tabla comparativa de calidad estimada del propio autor:

| Formato | Tamano | Carga en oMLX | Calidad (est.) |
|---|---|---|---|
| Bonsai 2 (original) | 8,6 GB | No (runtime personalizado) | ~95 % de FP16 |
| Folded 2-bit (misma receta) | 9,4 GB | Si | ~90-93 % de FP16 |
| Folded 3-bit (este modelo) | 12,8 GB | Si | ~93-95 % de FP16 |
| 4 bits ingenuo (oQ4) | ~14 GB | Si | ~91-93 % de FP16 |

Estos valores son estimaciones del autor, no mediciones con suites estandar, y deben tratarse como orientativos.

## Requisitos de hardware

- VRAM o memoria unificada estimada: los pesos ocupan 12,8 GB; conviene reservar entre 14 y 18 GB en total para pesos, cache KV y sobrecarga del runtime, en funcion de la longitud de contexto efectiva.
- Memoria unificada minima razonable: 16 GB en Apple Silicon, aunque 24-32 GB es el rango recomendado para trabajar con contextos largos y evitar swap.
- GPU compatibles: el checkpoint esta en formato MLX, por lo que su destino natural son los chips de Apple (series M1, M2, M3 y M4, preferiblemente con 24 GB o mas de memoria unificada). No se documenta soporte CUDA ni ROCm.
- GPU de consumo x86: no disponible tal cual; no hay confirmacion de conversion a GGUF ni de ejecucion en llama.cpp, Ollama o similar. En GPUs NVIDIA de consumo (RTX 4090, 24 GB) haria falta una conversion previa no documentada.
- Opciones de despliegue confirmadas: `mlx-lm` mediante `mlx_lm.load()` y oMLX apuntando al directorio del modelo. Otras opciones (vLLM, TGI, llama.cpp, Ollama) no estan documentadas para este checkpoint.
- Latencia y throughput: no disponible. La model card no aporta mediciones de tokens por segundo ni comparativas de velocidad con otras cuantizaciones.
- Almacenamiento: 12,8 GB de repositorio, aproximadamente 0,8 GB mas que la variante de 2 bits de la misma receta, debido al mayor ancho de bits.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Cuantizacion | Carga en oMLX/mlx-lm estandar | Calidad estimada | Licencia |
|---|---|---|---|---|---|---|
| hermitdave/Qwen3.8-27B-Folded-3bit | 27,36 B | 12,8 GB | Afin 3 bits con Hadamard plegado | Si | ~93-95 % de FP16 (est.) | no disponible |
| hermitdave/Qwen3.8-27B-Folded-2bit | 27,36 B (misma base) | 9,4 GB | Afin 2 bits con Hadamard plegado | Si | ~90-93 % de FP16 (est.) | no disponible |
| prism-ml/Ternary-Bonsai-2-27B-mlx-2bit | 27,36 B (misma base) | 8,6 GB | 2 bits con Hadamard en runtime | No (requiere runtime personalizado) | ~95 % de FP16 (est.) | no disponible |
| Cuantizacion 4 bits ingenua (oQ4) | 27,36 B (misma base) | ~14 GB | Afin 4 bits estandar | Si | ~91-93 % de FP16 (est.) | no disponible |

La comparacion se limita a variantes de la misma familia de cuantizacion, porque la informacion proporcionada no incluye datos de modelos de otros desarrolladores con los que contrastar. Los valores de calidad son estimaciones del autor, no mediciones estandarizadas.

## Limitaciones y advertencias

- Calidad estimada, no medida: no existen resultados de MMLU, GSM8K, HumanEval ni otras suites. Cualquier decision de produccion basada en el porcentaje "93-95 % de FP16" se apoya en una estimacion cualitativa del autor.
- Degradacion por doble cuantizacion: el modelo deriva de una cuantizacion previa (Bonsai 2) y anade una segunda transformacion, por lo que cualquier perdida de fidelidad del pipeline original se propaga.
- Herencia del modelo base: los sesgos, alucinaciones y limitaciones de Qwen3.8-27B se mantienen intactos; esta ficha no documenta ninguno de ellos.
- Licencia no declarada: al no figurar licencia en los metadatos ni en la model card, el uso comercial es juridicamente incierto. Ademas, la licencia del modelo base Qwen3.8-27B y la de la cuantizacion original de Prism ML podrian imponer condiciones adicionales no verificadas aqui.
- Restriccion de plataforma: el formato MLX limita el uso a hardware Apple Silicon. No hay confirmacion de conversion a GGUF ni soporte CUDA.
- Idiomas y contexto sin documentar: se desconoce la ventana de contexto real y los idiomas soportados con garantias.
- Despliegue en produccion: sin benchmarks, sin licencia clara y sin pruebas de carga, el checkpoint es adecuado para experimentacion local, no para sistemas en produccion con requisitos de calidad medibles.
- Trazabilidad limitada: el repositorio tiene cero descargas y cero "likes", no hay pipeline declarado y fue creado y actualizado el mismo dia, lo que indica que se trata de una publicacion muy reciente y sin validacion externa por parte de la comunidad.
- Resultados de busqueda web no pertinentes: las consultas realizadas devolvieron exclusivamente paginas de plataformas de compraventa de articulos de videojuegos, sin relacion con el modelo. No se ha podido localizar documentacion tecnica adicional, papers ni discusiones independientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hermitdave/Qwen3.8-27B-Folded-3bit
- Variante de 2 bits del mismo autor (referenciada en la model card): https://huggingface.co/hermitdave/Qwen3.8-27B-Folded-2bit
- Modelo original de Prism ML del que deriva: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Papers, blogs, repositorios o demos adicionales: no disponible (la busqueda web no devolvio resultados relacionados con el modelo)
