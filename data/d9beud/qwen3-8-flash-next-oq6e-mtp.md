# d9beuD/Qwen3.8-Flash-Next-oQ6e-mtp

## Resumen

Qwen3.8-Flash-Next-oQ6e-mtp es una cuantizacion en formato MLX del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario d9beuD. Se ha generado con la herramienta oQe (oMLX v0.7.0) mediante cuantizacion de precision mixta ponderada por matriz de importancia (imatrix) y conserva tanto el codificador de vision como la cabeza de prediccion multi-token (MTP), lo que la hace apta para inferencia image-text-to-text en hardware Apple Silicon.

El checkpoint declara 179.999.981.459 parametros en safetensors —aproximadamente 180.000 millones— con un tipo de modelo `qwen4_exp` y una estructura de expertos enrutados, lo que implica una arquitectura de mezcla de expertos (MoE). El nivel de cuantizacion es oQ6, con un 99,1 % de los parametros a 6 bits y un 0,9 % a 8 bits, lo que da un tamano efectivo de unos 6,69 bits por peso y un repositorio de 150,4 GB.

Su relevancia es acotada pero clara: demuestra el estado actual de las tecnicas de cuantizacion para modelos MoE multimodales de gran tamano orientadas a memoria unificada de Apple, incluyendo la preservacion de la cabeza MTP para decodificacion especulativa y una cobertura de calibracion de expertos del 99,97 %. No obstante, con 0 descargas y 0 likes en el momento de redactar esta ficha, se trata de un artefacto sin validacion comunitaria y sin resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (tipo de modelo `qwen4_exp`), con codificador de vision y cabeza MTP; detalles completos de capas y atencion no disponibles |
| Parametros totales | 179.999.981.459 (~180.000 millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ6 con precision mixta ponderada por imatrix: 99,1 % de los parametros a 6 bits y 0,9 % a 8 bits; tamano efectivo ~6,69 bits por peso; group size 64 por defecto (algunos modulos a 32 o 128); pesos no cuantizados, escalas y sesgos en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`other`, heredada del modelo base) |
| Formato de pesos | MLX safetensors (`library_name: mlx`); no se distribuye en GGUF |

## Arquitectura y entrenamiento

El modelo es una cuantizacion, no un entrenamiento nuevo. Parte del checkpoint bf16 Qwen/Qwen3.8-Flash-Next y aplica el esquema oQe de oMLX v0.7.0, que combina cuantizacion de precision mixta con una matriz de importancia calculada sobre una muestra de calibracion. La estructura subyacente es de tipo `qwen4_exp` con expertos enrutados: la cobertura de calibracion reportada es de 75.240 de 75.264 expertos enrutados activados (99,97 %), lo que confirma una topologia MoE de grano relativamente fino. Los 24 expertos que no recibieron tokens de calibracion se cuantizaron con el esquema oQ estandar. Se preservan la cabeza de prediccion multi-token (`mtp_num_hidden_layers: 1`), el codificador de vision y la tabla de embeddings de n-gramas.

El proceso de calibracion uso el conjunto `oqe_code_multilingual`, con 1.024 muestras de 512 tokens en configuracion adaptativa (de 128 a 1.024 muestras en 8 rondas), recolectadas capa a capa directamente desde el checkpoint bf16 en lugar de un modelo proxy. Un detalle metodologico relevante: el mapa de sensibilidad por capa de oQ no se midio sobre el checkpoint bf16 completo —que no cabe en memoria en un Mac de 128 GB—, sino sobre Jundot/Qwen3.8-Flash-Next-oQ4e-mtp con 128 muestras de 256 tokens del conjunto `code_multilingual`. Esto introduce una dependencia del mapa de sensibilidad respecto a un proxy ya cuantizado a 4 bits, que puede desviar la asignacion de bits respecto a una medicion sobre el modelo original.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational` y el pipeline declarado.
- Procesamiento de imagen y texto de forma conjunta (`pipeline_tag: image-text-to-text`), con codificador de vision incluido en el checkpoint.
- Prediccion multi-token (cabeza MTP preservada), que habilita tecnicas de decodificacion especulativa para acelerar la generacion autoregresiva.
- Razonamiento y generacion de codigo: el conjunto de calibracion empleado es especificamente multilingue y orientado a codigo, aunque no hay evaluacion publicada que lo confirme.
- Soporte de tool calling / function calling: no disponible en la informacion de esta ficha.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion de esta ficha.
- Capacidades multilingues: no disponible; el modelo base no declara lista de idiomas en los metadatos recuperados.
- Modo de razonamiento explicito (thinking mode), audio u otras modalidades: no disponible.

## Casos de uso

- Inferencia local multimodal en estaciones de trabajo Apple: el checkpoint esta pensado para ejecutarse integramente en memoria unificada de al menos 150 GB, por ejemplo un Mac Studio con 192 GB, sin necesidad de GPU dedicada ni de conexion a servicios externos.
- Analisis de documentos con componentes visuales: al incluir el codificador de vision y admitir entradas image-text-to-text, permite extraer y razonar sobre informacion de capturas, diagramas o paginas escaneadas dentro de un flujo conversacional.
- Asistencia a la programacion en entornos con requisitos de confidencialidad: la calibracion orientada a codigo multilingue sugiere un comportamiento razonable en generacion y explicacion de codigo, y el despliegue local evita enviar el codigo fuente a terceros.
- Prototipado de decodificacion especulativa: al conservar la cabeza MTP, es un banco de pruebas util para medir ganancias de velocidad con decodificacion multi-token sobre un MoE cuantizado en MLX.
- Investigacion en cuantizacion de MoE: el repositorio publica el informe de la matriz de importancia (`oq_imatrix_report.json`) y el reparto de bits, lo que permite reproducir y auditar decisiones de precision mixta capa a capa.
- Comparativas de esquemas de cuantizacion: dispone de versiones hermanas (oQ6 estandar y oQ4e) sobre el mismo modelo base, lo que facilita estudios controlados de degradacion por nivel de bits.
- Despliegue interno de un asistente multimodal de baja concurrencia: en escenarios donde no se requiere alto throughput, un unico Mac con 192 GB puede servir un endpoint conversacional con vision sin infraestructura de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de evaluacion multimodal, y la busqueda web realizada no devolvio material tecnico relacionado con este modelo.

## Requisitos de hardware

- Memoria: el autor indica que los pesos ocupan unos 150 GB y que se necesita un Mac con mas memoria unificada que esa cantidad, por ejemplo 192 GB. Hay que sumar el espacio para cache KV, activaciones y buffers del runtime, por lo que 192 GB es el minimo practico recomendado.
- GPU compatibles: no aplica en el sentido habitual. El formato es MLX safetensors y esta orientado a Apple Silicon; no se anuncia soporte para CUDA, A100, H100 ni RTX 4090.
- Viabilidad en GPU de consumo: no. Con ~150 GB de pesos, no cabe en ninguna GPU de consumo actual (24 GB en una RTX 4090, por ejemplo) ni en la mayoria de memorias unificadas de portatiles Apple, cuyo maximo habitual es 128 GB.
- Opciones de despliegue: runtime MLX. Al declarar pipeline image-text-to-text, requiere un runtime MLX con soporte de vision. No se distribuye en GGUF, por lo que llama.cpp y Ollama no son aplicables sin una conversion adicional no documentada; tampoco se anuncia compatibilidad con vLLM o TGI, orientados a CUDA.
- Latencia y throughput: no disponible. No se publican cifras de tokens por segundo ni de tiempo hasta el primer token, ni para generacion de texto ni para procesamiento de imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano de pesos | Formato | Licencia |
|---|---|---|---|---|---|
| d9beuD/Qwen3.8-Flash-Next-oQ6e-mtp (este) | ~180.000 M | oQ6e imatrix, 6,69 bits efectivos | 150,4 GB | MLX safetensors | Qwen Community 1.0 |
| d9beuD/Qwen3.8-Flash-Next-oQ6-mtp | ~180.000 M (misma arquitectura) | oQ6 estandar | no disponible | MLX safetensors | Qwen Community 1.0 |
| Jundot/Qwen3.8-Flash-Next-oQ4e-mtp | ~180.000 M (misma arquitectura) | oQ4e imatrix | no disponible | MLX safetensors | Qwen Community 1.0 |
| Qwen/Qwen3.8-Flash-Next (base) | ~180.000 M (misma arquitectura) | sin cuantizar (bf16) | no disponible | safetensors | Qwen Community 1.0 |

No se dispone de datos de contexto, benchmarks ni throughput para ninguno de los cuatro, por lo que la comparacion se limita a esquema de cuantizacion, formato y licencia. La diferencia funcional entre este checkpoint y la variante oQ6 estandar es el uso de matriz de importancia para la asignacion de precision; frente a la variante oQ4e, la diferencia es el nivel de bits (6 frente a 4), con el consiguiente menor tamano pero mayor degradacion potencial en esta ultima.

## Limitaciones y advertencias

- Ausencia total de validacion: 0 descargas y 0 likes en el momento de redactar la ficha. No hay evidencia externa de calidad, estabilidad ni fidelidad respecto al modelo base.
- Sin benchmarks: no se publica ninguna metrica que permita cuantificar la degradacion introducida por la cuantizacion a 6 bits.
- Sesgo metodologico en el mapa de sensibilidad: se midio sobre un checkpoint ya cuantizado a 4 bits (Jundot/Qwen3.8-Flash-Next-oQ4e-mtp) en lugar de sobre el bf16 completo, por limitaciones de memoria. La asignacion de bits puede no reflejar la sensibilidad real del modelo original.
- Cobertura de calibracion incompleta: 24 de 75.264 expertos enrutados no recibieron tokens de calibracion y se cuantizaron con el esquema generico, lo que puede degradar su comportamiento en dominios poco representados.
- Sesgo del conjunto de calibracion: `oqe_code_multilingual` con 1.024 muestras de 512 tokens orienta la precision hacia codigo multilingue; el rendimiento en otros dominios (legal, sanitario, conversacional general) no esta caracterizado.
- Riesgo de alucinacion: no evaluado ni documentado en la informacion disponible. Al ser un modelo conversacional, el riesgo existe y no hay datos para acotarlo.
- Idiomas: no se declara lista de idiomas soportados, por lo que no se puede garantizar calidad en castellano ni en ninguna otra lengua concreta.
- Restricciones de licencia: se hereda la Qwen Community License 1.0, etiquetada como `other`. No se detallan en esta ficha las condiciones de uso comercial, umbrales de usuarios ni obligaciones de atribucion; es imprescindible revisar el fichero LICENSE antes de cualquier uso en produccion.
- Barrera de hardware severa: ~150 GB de pesos exigen mas de 150 GB de memoria unificada, lo que excluye practicamente todo el parque de portatiles y la mayoria de equipos de sobremesa de consumo.
- Portabilidad limitada: al ser MLX safetensors sin GGUF, no se puede desplegar directamente en stacks CUDA (vLLM, TGI) ni en llama.cpp/Ollama sin conversion adicional no documentada.
- Fechas de metadatos: la creacion y actualizacion del repositorio figuran como 2026-10-05, posteriores a la fecha habitual de consulta; conviene verificar la coherencia temporal del artefacto.
- Al ser un derivado cuantizado, no sustituye al modelo base para tareas que requieran maxima fidelidad numerica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d9beuD/Qwen3.8-Flash-Next-oQ6e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante oQ6 estandar del mismo autor: https://huggingface.co/d9beuD/Qwen3.8-Flash-Next-oQ6-mtp
- Checkpoint empleado para el mapa de sensibilidad: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
- Repositorio de la herramienta de cuantizacion oQe (oMLX): https://github.com/jundot/omlx
- Informe de la matriz de importancia: https://huggingface.co/d9beuD/Qwen3.8-Flash-Next-oQ6e-mtp/blob/main/oq_imatrix_report.json
- Licencia: https://huggingface.co/d9beuD/Qwen3.8-Flash-Next-oQ6e-mtp/blob/main/LICENSE

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre el modelo; los unicos resultados obtenidos fueron listados de programacion de television sin relacion con el contenido de esta ficha.
