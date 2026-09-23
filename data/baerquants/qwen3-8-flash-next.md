# baerquants/Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje causal multimodal (texto e imagen) publicado por el equipo Qwen como vista previa experimental de la arquitectura que sustentara la proxima generacion Qwen4. El repositorio analizado, baerquants/Qwen3.8-Flash-Next, redistribuye estos pesos en formato Hugging Face Transformers bajo licencia qwen-community-1.0. Combina atencion hibrida con mezcla de expertos (MoE): bloques de Gated DeltaNet (atencion lineal) alternados con Qwen Sparse Attention (QSA) a nivel de micro-bloque, ademas de un esquema de embedding de n-gramas como eje adicional de escalado de parametros.

El modelo declara 125B parametros en el componente de lenguaje (6B activados por token) mas 51B correspondientes al embedding de n-gramas y 4B al modulo MTP, lo que da un total de 179 999 981 459 parametros segun los pesos en safetensors. La ventana de contexto es de 262 144 tokens de forma nativa, extensible hasta 1 000 000, y el repositorio ocupa 360 GB.

Su relevancia actual reside en ser la primera publicacion de pesos abiertos de la arquitectura Qwen4, con innovaciones como Gated Residual, N-gram Embedding y una receta de entrenamiento que combina Muon y AdamW y elimina el warmup de tamano de lote. La version oficial de produccion se comercializa como Qwen3.8-Flash a traves de Qwen Cloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal hibrido con MoE y codificador de vision; atencion alternando Gated DeltaNet y Qwen Sparse Attention (QSA) |
| Parametros totales | 179 999 981 459 (~180B): 125B de modelo de lenguaje + 51B de embedding de n-gramas + 4B de MTP |
| Parametros activos | 6B por token (10 expertos enrutados + 1 compartido, de un total de 512) |
| Longitud de contexto | 262 144 tokens nativos, extensible hasta 1 000 000 |
| Tipos de cuantizacion | No disponible (los pesos se publican en safetensors; no se documentan cuantizaciones tipo GGUF) |
| Idiomas soportados | No disponible |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | safetensors (Hugging Face Transformers); compatible con vLLM, SGLang y TokenSpeed |

Otros datos de configuracion declarados: hidden dimension de 2560, 48 capas, token embedding de 248 320 (padded), vocabulario de salida de 248 320, layout oculto 12 x (3 x (Gated DeltaNet → MoE) → 1 x (Qwen Sparse Attention → MoE)), expert intermediate dimension de 640, 4 ramas de Gated Residual con bottleneck rank 320, y 20 000 000 de entradas de n-gramas (bigramas/trigramas) en la capa 2.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal hibrido. Cada bloque de la capa intermedia intercala tres subcapas de Gated DeltaNet (atencion lineal, con 48 cabezas V y 16 cabezas QK de dimension 128) y una subcapa de Qwen Sparse Attention, todas seguidas de una capa MoE. QSA opera a nivel de micro-bloque en lugar de seleccionar tokens individuales, con 24 cabezas Q y 2 cabezas KV de dimension 256, RoPE de dimension 64, un indexer MQA con 4 cabezas de consulta y 1 cabeza de clave compartida (dimension 128) y un presupuesto de 512 bloques o 2048 tokens. El MoE cuenta con 512 expertos, de los que se activan 10 enrutados mas 1 compartido. El Gated Residual modula el flujo en los residual streams mediante una puerta de lectura elemento a elemento dependiente de los datos y una puerta de escritura escalar por rama. El embedding de n-gramas anade un eje de escalado de parametros con menor coste computacional y mas apto para offloading que el propio MoE.

El entrenamiento comprende fases de pre-entrenamiento y post-entrenamiento, con Muon y AdamW aplicados a categorias de pesos especificas. La receta, guiada por leyes de escalado reajustadas, elimina el warmup tradicional de tamano de lote y arranca directamente en el tamano objetivo, lo que reduce el numero total de pasos del optimizador y admite tasas de aprendizaje mayores. Incorpora una capa MTP (multi-token prediction) entrenada con multiples pasos, probablemente orientada a decodificacion especulativa. La model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset, ni si se empleo RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto nativo de 262 144 tokens.
- Procesamiento de imagenes mediante codificador de vision (pipeline image-text-to-text).
- Razonamiento de multiples pasos orientado a cargas agenticas, segun declara el autor.
- Eficiencia en contexto largo gracias a QSA a nivel de micro-bloque, disenada para reducir la latencia en contextos extensos.
- Prediccion multi-token (MTP) integrada, orientada a acelerar la decodificacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Idiomas soportados: no disponible.
- Modo de pensamiento explicito u otras capacidades especiales: la model card no las documenta de forma individualizada.

## Casos de uso

- Analisis de documentos extensos: con 262 144 tokens nativos y extension hasta 1 000 000, permite procesar informes completos, expedientes o bases de codigo sin fragmentacion agresiva.
- Agentes autonomos de multiples pasos: la atencion QSA reduce la latencia en contextos largos, escenario habitual en bucles agenticos con historial acumulado.
- Asistencia multimodal sobre imagenes: gracias al codificador de vision, admite tareas de descripcion, extraccion de informacion o razonamiento sobre capturas, diagramas o documentos escaneados.
- Despliegue de alto rendimiento en produccion: con 6B parametros activos por token, el coste de computo por peticion es bajo en relacion con el tamano total, adecuado para servir muchas peticiones concurrentes en infraestructura con vLLM o SGLang.
- Investigacion sobre arquitecturas post-transformer: el modelo sirve como banco de pruebas abierto de Gated DeltaNet, QSA, Gated Residual y embedding de n-gramas para la comunidad academica.
- Evaluacion y comparacion de decodificacion especulativa: la capa MTP permite medir el impacto de la prediccion multi-token en el throughput real.
- Prototipado de aplicaciones multimodal-conversacionales: la etiqueta conversational y la compatibilidad con Transformers facilitan integrarlo en demos y frameworks de chat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion titulada "Benchmark Results", pero el contenido de la tabla no se ha facilitado en los datos extraidos, por lo que no se dispone de cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del numero de parametros, no dato oficial):
  - bf16/fp16: aproximadamente 360 GB de pesos (coincide con el tamano del repo).
  - int8/fp8: aproximadamente 180 GB.
  - int4: aproximadamente 90 GB.
- El embedding de n-gramas aporta 51B parametros (unos 102 GB en bf16) y, segun el autor, esta especialmente pensado para offloading a CPU o disco, lo que puede reducir la VRAM necesaria en GPU.
- GPU recomendadas: multiples H100 80 GB o A100 80 GB para precision completa (del orden de 5 a 8 unidades); una o dos H200 141 GB para configuraciones cuantizadas a int8.
- GPU de consumo (RTX 4090, 24 GB): no cabe ni con cuantizacion agresiva, salvo esquemas de offloading muy agresivo no documentados.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed. No se documenta soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles. Los 6B parametros activos por token sugieren un rendimiento sensiblemente superior a un modelo denso del mismo tamano total, pero no hay cifras publicadas.

## Comparativa con modelos similares

Los datos de los modelos alternativos se basan en especificaciones publicas de referencia y pueden variar; los del modelo analizado proceden de la model card.

| Modelo | Parametros totales / activos | Contexto | Modalidad | Licencia |
|---|---|---|---|---|
| Qwen3.8-Flash-Next | ~180B / 6B | 262 144 (hasta 1M) | Texto + imagen | qwen-community-1.0 |
| DeepSeek-V3 | 671B / 37B | 128K | Texto | MIT |
| Qwen3-235B-A22B | 235B / 22B | 128K (extensible a 1M) | Texto | Apache 2.0 |

El modelo analizado destaca por un ratio de activacion muy bajo (6B sobre ~180B) y por su caracter multimodal, frente a alternativas de mayor coste de activacion. No se dispone de datos de benchmarks que permitan comparar el rendimiento real de estas opciones, por lo que la comparacion se limita a parametros, contexto, modalidad y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; la model card no publica tasas de error.
- Idiomas soportados: no especificados, lo que dificulta planificar despliegues multilingues.
- Comportamiento en contexto largo: aunque se declara soporte hasta 1 000 000 de tokens de forma extensible, no se aportan evaluaciones que confirmen la calidad efectiva en ese regimen.
- Licencia qwen-community-1.0: es una licencia de tipo "other" con condiciones adicionales; debe revisarse el archivo LICENSE antes de un uso comercial.
- Modelo experimental: el propio autor lo describe como vista previa de la arquitectura Qwen4, por lo que no debe asumirse estabilidad de API ni de comportamiento en produccion.
- Redistribucion: el repositorio pertenece a un tercero (baerquants), no al equipo Qwen; conviene verificar la integridad y procedencia de los pesos.
- Requisitos de memoria muy elevados: 360 GB de repo y una tabla de n-gramas de 51B parametros condicionan el coste de infraestructura.
- Sin metricas de benchmarks publicadas en la informacion disponible, no es posible validar las capacidades declaradas.

## Enlaces

- Hugging Face: https://huggingface.co/baerquants/Qwen3.8-Flash-Next
- Blog oficial Qwen3.8-Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe tecnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Qwen Cloud (Qwen3.8-Flash gestionado): https://www.qwencloud.com/models/qwen3.8-flash
- Qwen Cloud: https://www.qwencloud.com
- Imagen de arquitectura: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.8-Flash-Next/architecture.png

Nota: los resultados de la busqueda web proporcionada (sozcu.com.tr) no guardan relacion con el modelo y no se han utilizado como fuente.
