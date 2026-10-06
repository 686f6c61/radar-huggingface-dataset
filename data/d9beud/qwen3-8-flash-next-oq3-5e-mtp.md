# d9beuD/Qwen3.8-Flash-Next-oQ3.5e-mtp

## Resumen

Qwen3.8-Flash-Next-oQ3.5e-mtp es una cuantizacion MLX del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario d9beuD. El modelo base es un MoE multimodal de Qwen que sirve como avance de la arquitectura Qwen4, con un diseno hibrido de atencion Gated DeltaNet + Gated Attention y un total de unos 180.000 millones de parametros, de los cuales solo unos 6.000 millones se activan por token. Esta version concreta reduce el checkpoint a aproximadamente 90 GB mediante cuantizacion de precision mixta ponderada por matriz de importancia.

El problema que resuelve es el de hacer manejable en hardware de Apple Silicon un modelo de ese tamano: el checkpoint en bfloat16 no cabe en la memoria unificada de un Mac de 128 GB, mientras que esta cuantizacion oQ de nivel 3.5, con unos 3,99 bits efectivos por peso, si lo hace. La receta empleada es oQe (oMLX v0.7.0), que asigna distintos anchos de bit por capa y por modulo segun su sensibilidad medida con un conjunto de calibracion orientado a codigo multilingue.

Es relevante ahora porque conserva elementos que suelen perderse en las cuantizaciones agresivas: la cabeza de prediccion multi-token (MTP), el encoder de vision y la tabla de embeddings N-gram. A cambio, el 73,4 % de los parametros queda a 3 bits, por lo que se trata de una pieza pensada para inferencia local en Mac de gama muy alta y para experimentacion, no para despliegue en servidores CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal con atencion hibrida Gated DeltaNet + Gated Attention (tipo de modelo `qwen4_exp`), cabeza MTP y encoder de vision |
| Parametros totales | 179.999.981.459 (~180B) segun safetensors; el modelo base se describe como 125B principales + 51B de embeddings N-gram |
| Parametros activos | ~6B por token (dato del modelo base) |
| Longitud de contexto | 262.144 tokens (262K) segun la documentacion de Unsloth sobre el modelo base |
| Tipos de cuantizacion | MLX de precision mixta, nivel oQ 3.5: 3 bits (73,4 %), 4 bits (24,9 %), 5 bits (0,3 %), 6 bits (0,5 %), 8 bits (0,9 %); grupo 64 por defecto, algunos modulos a 32 o 128; ~3,99 bits efectivos por peso |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`license: other`) |
| Formato de pesos | MLX safetensors (bf16 para pesos no cuantizados, escalas y sesgos) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen3.8-Flash-Next, descrita por Qwen como un MoE multimodal que actua como avance de la arquitectura Qwen4 (mismo papel que Qwen3-Next respecto a Qwen3.5). La innovacion estructural principal es una atencion hibrida que combina Gated DeltaNet con Gated Attention, y que en el repositorio de Qwen se resume como "GDN + QSA hybrid architecture". Segun la documentacion de Qwen, la version mejora el modelo a lo largo de cuatro ejes: atencion, residuales, embeddings y optimizacion. La tabla de embeddings N-gram (unos 51B de parametros) y la cabeza MTP son componentes separables que se preservan en esta cuantizacion.

En cuanto al proceso de cuantizacion, esta ficha no describe el entrenamiento del modelo original (no hay datos sobre numero de tokens, composicion del dataset ni si hubo RLHF o DPO en la informacion disponible). Lo que si documenta el autor es el proceso de cuantizacion: se uso oQe (oMLX v0.7.0) con cuantizacion de precision mixta ponderada por matriz de importancia, calibrada con el conjunto `oqe_code_multilingual` (1.024 muestras de 512 tokens, con regimen adaptativo de 128 a 1.024 muestras en 8 rondas). La matriz se recolecto capa a capa directamente desde el checkpoint bf16, sin modelo proxy, y cubre 75.240 de los 75.264 expertos enrutados (99,97 %); los 24 expertos restantes usan cuantizacion oQ estandar. El mapa de sensibilidad por capa no se midio sobre el checkpoint bf16 completo, sino sobre Jundot/Qwen3.8-Flash-Next-oQ4e-mtp (128 muestras x 256 tokens), porque el bf16 no cabe en memoria en un Mac de 128 GB. El resultado tiene un tamano efectivo de ~90 GB y conserva la cabeza MTP con `mtp_num_hidden_layers: 1`.

## Capacidades

- Generacion de texto y razonamiento: el modelo base se presenta como un modelo de razonamiento avanzado con ventana de 262K tokens.
- Procesamiento multimodal de imagen y texto (`pipeline_tag: image-text-to-text`): el encoder de vision esta incluido en esta cuantizacion, por lo que mantiene la capacidad de recibir imagenes junto al texto.
- Prediccion multi-token: la cabeza MTP se conserva, lo que habilita decodificacion especulativa o multi-token durante la inferencia.
- Recuperacion mediante embeddings N-gram: la tabla N-gram esta incluida, orientada a modelar dependencias de secuencias largas.
- Capacidad multilingue: no disponible (la ficha del autor no enumera idiomas, aunque la calibracion se hizo con un conjunto de codigo multilingue).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de pensamiento explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia multimodal local en Mac de gama alta: con ~90 GB de pesos y encoder de vision incluido, permite describir, resumir o extraer informacion de imagenes sin enviar datos a un servicio externo, en equipos con 128 GB o mas de memoria unificada.
- Analisis de documentos extensos con contexto largo: la ventana de 262K tokens admite procesar contratos, informes o bases de codigo completas en una sola pasada, algo util cuando el material es confidencial y no puede salir de la maquina.
- Asistente de codigo en local: la matriz de importancia se calibro con `oqe_code_multilingual`, de modo que las capas mas relevantes para codigo multilingue recibieron mayor precision, lo que favorece tareas de autocompletado, refactorizacion y explicacion de codigo en un entorno offline.
- Decodificacion especulativa sobre Apple Silicon: al conservarse la cabeza MTP, se puede explorar generacion multi-token para reducir la latencia de decodificacion en `mlx-lm`, aunque el rendimiento real dependera de la implementacion.
- Investigacion sobre la arquitectura Qwen4: al ser un avance de la arquitectura (atencion hibrida GDN + QSA), sirve para estudiar el comportamiento de estos bloques en hardware de consumo profesional sin necesidad de un cluster.
- Comparacion de recetas de cuantizacion: la existencia de variantes oQ estandar, oQe con imatrix y oQ4e del mismo modelo base permite medir el impacto de cada receta sobre la perplejidad y la calidad de generacion.
- Evaluacion de estabilidad en contextos largos: la combinacion de ventana de 262K, tabla N-gram y MTP permite estudiar degradacion de calidad y consumo de memoria con secuencias muy largas en una sola maquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta cuantizacion no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de perplejidad, y el repositorio no aporta comparaciones numericas contra el modelo base ni contra otras cuantizaciones.

Como referencia cualitativa, la documentacion de Unsloth sobre el modelo base afirma que Qwen3.8-Flash-Next supera a Claude-4.6-Opus (Max); se trata de una afirmacion del proveedor de documentacion, sin cifras ni reproduccion independiente en la informacion consultada. No se dispone de datos que cuantifiquen la perdida de calidad introducida por esta cuantizacion a 3 bits.

## Requisitos de hardware

- VRAM o memoria unificada: aproximadamente 90 GB solo para los pesos; el autor indica que se necesita un Mac con mas de esa cantidad de memoria unificada, por ejemplo 128 GB.
- GPU compatibles: no aplica a GPUs NVIDIA o AMD. El formato es MLX safetensors, por lo que requiere Apple Silicon (serie M). No se puede cargar con CUDA.
- Cabe en GPU de consumo: no. Una RTX 4090 con 24 GB queda muy lejos de los ~90 GB necesarios; tampoco cabe en configuraciones multi-GPU convencionales sin reconvertir los pesos a otro formato.
- Equipos recomendados: Mac Studio o MacBook Pro con M3 Ultra, M2 Ultra o configuraciones de 128 GB o mas de memoria unificada. Con 96 GB el margen es muy ajustado.
- Opciones de despliegue: MLX (`mlx-lm`) y el propio ecosistema oMLX/oQe. No es compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual; para esos runtimes habria que partir del modelo base y recuantizar a GGUF.
- Latencia y throughput: no disponible. Dependera del ancho de banda de memoria del chip y del soporte efectivo de la cabeza MTP en la implementacion de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| d9beuD/Qwen3.8-Flash-Next-oQ3.5e-mtp (esta ficha) | ~180B totales, ~6B activos | 262K (modelo base) | oQe 3.5, ~3,99 bits efectivos, imatrix | ~90 GB | Qwen Community 1.0 | MLX safetensors |
| d9beuD/Qwen3.8-Flash-Next-oQ3.5-mtp | ~180B totales, ~6B activos | 262K (modelo base) | oQ 3.5 estandar (sin imatrix) | no disponible | Qwen Community 1.0 | MLX safetensors |
| Jundot/Qwen3.8-Flash-Next-oQ4e-mtp | ~180B totales, ~6B activos | 262K (modelo base) | oQe 4 bits, imatrix | no disponible (mayor que la variante 3.5) | Qwen Community 1.0 | MLX safetensors |
| Qwen/Qwen3.8-Flash-Next (base) | ~180B totales, ~6B activos | 262K | bfloat16 sin cuantizar | no disponible (no cabe en 128 GB) | Qwen Community 1.0 | safetensors |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de datos de rendimiento que permitan enfrentarlo con otras familias de forma rigurosa.

## Limitaciones y advertencias

- Cuantizacion agresiva: el 73,4 % de los parametros esta a 3 bits y solo un 24,9 % a 4 bits. Es previsible una perdida de calidad frente al bfloat16 en tareas sensibles a la precision, aunque no se han publicado mediciones en la informacion disponible.
- Calibracion sesgada al dominio de codigo: la matriz de importancia se construyo con `oqe_code_multilingual`, un conjunto de codigo multilingue. El comportamiento en otros dominios (legal, medico, literario) o en idiomas poco representados en ese conjunto puede degradarse mas de lo que reflejaria una calibracion mas diversa.
- Expertos sin calibrar: 24 de los 75.264 expertos enrutados no recibieron tokens de calibracion y usan cuantizacion oQ estandar. Su calidad relativa es incierta.
- Estimacion de sensibilidad indirecta: el mapa de sensibilidad por capa se midio sobre una variante oQ4e, no sobre el checkpoint bf16 original, porque este ultimo no cabe en memoria en un Mac de 128 GB. Esto puede introducir desviaciones en la asignacion de bits.
- Idioma: no se documenta la lista de idiomas soportados. No hay garantia de calidad en castellano mas alla de lo que ofrezca el modelo base.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni tasas de alucinacion para esta cuantizacion. A 3 bits, este riesgo es al menos igual que en el modelo original.
- Licencia: hereda la Qwen Community License 1.0, que no es Apache 2.0 ni MIT. Antes de un uso comercial o de redistribuir pesos derivados conviene revisar las condiciones exactas del archivo LICENSE del repositorio.
- Estado del repositorio: sin descargas ni likes registrados y creado en octubre de 2026, sin validacion independiente por parte de terceros.
- Compatibilidad: al ser un formato MLX, no se puede desplegar en infraestructura CUDA sin reconvertir los pesos, lo que implicaria volver a cuantizar y posiblemente perder las ventajas de la receta oQe.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/d9beuD/Qwen3.8-Flash-Next-oQ3.5e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante oQ estandar: https://huggingface.co/d9beuD/Qwen3.8-Flash-Next-oQ3.5-mtp
- Variante oQ4e usada para el mapa de sensibilidad: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
- Herramienta de cuantizacion oQe / oMLX: https://github.com/jundot/omlx
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- README tecnico de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/README.md
- Guia de ejecucion local de Unsloth: https://unsloth.ai/docs/models/qwen3.8-next
- Ficha de Qwen3.8 en OpenLM.ai: https://openlm.ai/qwen3.8/
- Informe de matriz de importancia: `oq_imatrix_report.json` en el repositorio
- Licencia: archivo `LICENSE` en el repositorio (Qwen Community License 1.0)
