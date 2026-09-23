# mlx-community/Xing4.0-29B-A4B-OptiQ-4bit

## Resumen

Xing4.0-29B-A4B-OptiQ-4bit es una cuantizacion de precision mixta en formato MLX del modelo XingChen-AGI/Xing4.0-29B-A4B, publicada por la organizacion mlx-community y construida con la herramienta mlx-optiq. Se trata de un modelo de lenguaje de tipo mezcla de expertos (MoE) con 29.505.505.264 parametros totales y aproximadamente 4.000 millones de parametros activos por token, disenado para generacion de texto y uso conversacional. Su proposito es permitir la ejecucion local del modelo base en hardware Apple Silicon, reduciendo los aproximadamente 58 GB en bf16 a 19,6 GB en disco sin recurrir a PyTorch ni a servicios en la nube.

La relevancia de esta ficha es doble. Por un lado, documenta una arquitectura poco habitual: adopta la atencion de DeepSeek-V3 (multi-head latent attention, 64 expertos enrutados mas un experto compartido) e incorpora una innovacion propia denominada hyper-connection, que sustituye el flujo residual unico por cuatro flujos paralelos combinados mediante una matriz de enrutamiento normalizada con Sinkhorn y decidida capa a capa. Por otro, ilustra una practica de cuantizacion cada vez mas extendida: en lugar de aplicar un ancho uniforme de 4 bits, mantiene 303 capas en 8 bits y el resto en 4 bits, con un promedio de 5,00 bits por peso, a partir de un analisis de sensibilidad por divergencia KL.

El modelo se distribuye bajo licencia Apache 2.0 y en formato safetensors para la libreria MLX. Requiere la instalacion de `mlx-optiq`, ya que el tipo de arquitectura `xing4_0` no esta soportado por `mlx-lm` de serie. La longitud de contexto oficial no aparece documentada en la informacion disponible, aunque las pruebas de recuperacion de contexto largo se ejecutaron en torno a 8.900 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con multi-head latent attention (estilo DeepSeek-V3) y hyper-connection (cuatro flujos residuales paralelos con enrutamiento Sinkhorn) |
| Parametros totales | 29.505.505.264 |
| Parametros activos | Aproximadamente 4.000 millones por token; 64 expertos enrutados mas 1 experto compartido |
| Longitud de contexto | no disponible (la prueba HashHop se ejecuto con aproximadamente 8.900 tokens) |
| Tipos de cuantizacion | Precision mixta MLX: 4 bits predominante, 303 capas en 8 bits, grupo de 64, 5,00 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con codigo personalizado para la arquitectura `xing4_0` |

## Arquitectura y entrenamiento

El modelo base Xing4.0-29B-A4B combina varios elementos. En el plano de la atencion emplea multi-head latent attention, el mismo mecanismo introducido por DeepSeek-V3, que comprime la cache KV en un espacio latente de bajo rango con `kv_lora_rank: 512`. En el plano de la computacion utiliza una mezcla de expertos con 64 expertos enrutados y un experto compartido, lo que situa la activacion en torno a 4.000 millones de parametros por token sobre un total cercano a 29.500 millones. La innovacion propia es la hyper-connection: en lugar de un unico flujo residual atravesando la red, el modelo mantiene cuatro flujos en paralelo, y cada bloque lee y escribe sobre una mezcla de ellos decidida por capa mediante una matriz de enrutamiento normalizada con Sinkhorn.

Sobre el entrenamiento, la informacion disponible es limitada. Los resultados de busqueda indican que Xing4.0 ha integrado operadores fusionados mHC Triton-Ascend en MindFormers a traves de la pila FlagOS, con una validacion de entrenamiento completada en un solo nodo de 16 tarjetas. No se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO, por lo que estos datos deben considerarse no disponibles.

En cuanto a la cuantizacion, la model card describe el procedimiento: se realizo un analisis de sensibilidad por divergencia KL sobre los 395 tensores cuantizables, incluidos los 64 expertos enrutados, contra una mezcla de calibracion de seis dominios, y despues se resolvio un problema de mochila (knapsack) sobre el presupuesto de bits. El mapa de bits por capa esta disponible en `optiq/metadata.json` y en el bloque `quantization` de `config.json`. El autor advierte de que no fue posible una comprobacion bit a bit contra la version bf16 de referencia, ya que el modelo padre ocupa 58 GB frente a los 36 GB de RAM de la maquina que genero la cuantizacion; la verificacion se hizo mediante lectura linea a linea contra la implementacion de referencia y generacion directa con el modelo cuantizado.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles (idiomas adicionales no documentados).
- Razonamiento y matematicas: 90,1% en GSM8K sobre 1.000 muestras.
- Generacion de codigo: 84,8% pass@1 en HumanEval.
- Seguimiento de instrucciones: 61,2% en IFEval en modo estricto a nivel de prompt.
- Uso de herramientas y function calling: 74,5% en BFCL-V3 en su variante simple.
- Conocimiento general: 71,7% en MMLU con 5-shot sobre 1.000 muestras.
- Ejecucion local en Apple Silicon sin dependencia de PyTorch ni de la nube.
- Inferencia eficiente por activacion dispersa: solo unos 4.000 millones de parametros se activan por token.
- No se documentan capacidades de vision, audio ni un modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Asistente de codigo en el editor: con 84,8% pass@1 en HumanEval y soporte de tool calling, el modelo puede autocompletar funciones, generar pruebas unitarias e integrarse en un complemento local de VS Code o Neovim que invoque MLX en el propio Mac del desarrollador.
- Despliegue de un asistente conversacional privado en portatiles Apple Silicon: al ocupar 19,6 GB en disco, permite servir un modelo de 29.500 millones de parametros sin conexion a internet, lo que resulta adecuado para entornos con requisitos estrictos de confidencialidad de datos.
- Automatizacion de atencion al cliente con agente y herramientas: el 74,5% en BFCL-V3 simple habilita flujos en los que el modelo consulta un CRM, crea incidencias o recupera pedidos mediante function calling dentro de un bucle multi-paso.
- Generacion de codigo en pipelines de integracion continua: el modelo puede ejecutarse en un runner macOS con `optiq serve` para revisar diffs, redactar mensajes de commit o proponer correcciones sobre los fallos detectados por el analisis estatico.
- Prototipado e investigacion de arquitecturas MoE con hyper-connection: al estar disponibles los pesos cuantizados y el mapa de bits por capa en `optiq/metadata.json`, el modelo sirve como banco de pruebas para estudiar enrutamiento de expertos y flujos residuales multiples sin necesidad de hardware de centro de datos.
- Traduccion y reescritura de documentacion tecnica en local: la combinacion de 71,7% en MMLU y un coste de memoria moderado permite procesar lotes de textos largos en un equipo de sobremesa, aunque la calidad por idioma no este documentada.
- Extraccion de datos de documentos e informes: con una ventana de contexto en el entorno de los 8.900 tokens, es viable resumir informes y extraer campos estructurados siempre que la tarea no dependa de recuperar claves aleatorias en posiciones muy alejadas del contexto.

## Benchmarks y rendimiento

Resultados medidos sobre esta cuantizacion concreta, no heredados del modelo padre:

| Metrica | Puntuacion |
|---|---|
| MMLU (5-shot, 1.000 muestras) | 71,7% |
| GSM8K (1.000 muestras) | 90,1% |
| IFEval (estricto, a nivel de prompt) | 61,2% |
| BFCL-V3 simple | 74,5% |
| HumanEval pass@1 | 84,8% |
| HashHop (contexto de aproximadamente 8.900 tokens) | 18,0% |
| Capability Score agregado | 66,71 |

La model card interpreta explicitamente el resultado de HashHop: el 18,0% en recuperacion de claves aleatorias en contexto largo se atribuye a la arquitectura y no a la cuantizacion. La causa senalada es la compresion de la cache KV en un latente de bajo rango (`kv_lora_rank: 512`) propia de multi-head latent attention, que penaliza el recuerdo tipo needle-in-a-haystack sobre miles de claves aleatorias. El autor indica que el modelo responde de inmediato con un hash bien formado pero incorrecto, sin agotar tokens ni sufrir un error de evaluacion, y que el razonamiento, el seguimiento de instrucciones, el uso de herramientas y la generacion de codigo no se ven afectados.

No se han publicado resultados de benchmarks comparativos con modelos hermanos de la misma familia en la informacion disponible, ya que Xing4.0 no cuenta con variantes puntuadas.

## Requisitos de hardware

- Pesos en memoria: aproximadamente 18,4 GB (5,00 bits por peso sobre 29.505 millones de parametros), mas overhead de cache KV y activaciones.
- Espacio en disco: 19,6 GB de pesos; el repositorio completo ocupa 20,6 GB.
- Memoria unificada recomendada: 24 GB como minimo practico para inferencia; 32 GB o mas para contextos largos y margen holgado.
- Compatibilidad con GPU de consumo: disenado exclusivamente para Apple Silicon. No puede ejecutarse en GPU NVIDIA o AMD mediante este formato; la cuantizacion es especifica de MLX.
- Equipos recomendados: Mac con chip M2 Pro/Max, M3 Pro/Max o M4 Pro/Max con 24 GB o mas de memoria unificada. No cabe en configuraciones de 8 GB ni en la mayoria de equipos de 16 GB.
- Opciones de despliegue: `optiq serve --model mlx-community/Xing4.0-29B-A4B-OptiQ-4bit`, o bien `mlx-lm` con `import optiq` previo para registrar la arquitectura `xing4_0`.
- Alternativa para GPU: existe una version GGUF de Xing4.0-29B-A4B (51,4 GB, dividida en tres partes) publicada por terceros, utilizable con llama.cpp u Ollama en hardware CUDA.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Formato y tamano | Licencia | Notas |
|---|---|---|---|---|---|
| mlx-community/Xing4.0-29B-A4B-OptiQ-4bit | 29.505.505.264 / ~4.000 millones | no disponible | MLX safetensors, 19,6 GB, 5,00 bits por peso | Apache 2.0 | Precision mixta 4/8 bits con 303 capas en 8 bits |
| suzu89/Xing4.0-29B-A4B-4bit-MLX | no disponible | no disponible | MLX, cuantizacion uniforme de 4 bits | no disponible | Alternativa comunitaria del mismo modelo base |
| Xing4.0-29B-A4B GGUF (local-ai-zone) | 29.505.505.264 / ~4.000 millones | no disponible | GGUF en tres partes, 51,4 GB | no disponible | Pensado para llama.cpp y Ollama en GPU o CPU |
| XingChen-AGI/Xing4.0-29B-A4B | 29.505.505.264 / ~4.000 millones | no disponible | bf16, aproximadamente 58 GB | Apache 2.0 | Modelo base de referencia, sin cuantizar |

No se dispone de datos de rendimiento de las alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros, formato, tamano y licencia.

## Limitaciones y advertencias

- Recuperacion en contexto largo muy debil: 18,0% en HashHop con aproximadamente 8.900 tokens. La propia model card atribuye el fallo a la multi-head latent attention y advierte de que el modelo produce respuestas incorrectas con apariencia plausible. No es adecuado para tareas de recuperacion exacta de informacion en contextos extensos.
- Dependencia de codigo personalizado: `mlx-lm` no reconoce el tipo `xing4_0`. Sin instalar `mlx-optiq` (version 0.5.13 o superior) el cargador lanza `ValueError: Model type xing4_0 not supported`. Esto complica el despliegue en entornos que solo admiten la libreria estandar.
- Verificacion de calidad incompleta: no se pudo hacer una comprobacion bit a bit contra el modelo padre en bf16 por falta de memoria en la maquina de conversion. La validacion se baso en lectura del codigo y generacion de ejemplo.
- Riesgo de alucinacion: como cualquier modelo de lenguaje de esta escala, puede generar afirmaciones falsas con fluidez, especialmente en dominios especializados y en tareas de recuperacion exacta.
- Idiomas: la metadatos de HuggingFace marcan los idiomas como no disponibles. El modelo se presenta como conversacional y las pruebas estan en ingles; no hay evidencia documentada de rendimiento multilingue.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o alineacion en la informacion proporcionada.
- Licencia: Apache 2.0, permisiva y apta para uso comercial. Debe conservarse el aviso de licencia y verificar las condiciones del modelo base, que tambien declara Apache 2.0.
- Adopcion muy baja: 13 descargas y 0 likes en el momento de la consulta, creado y actualizado el 23 de septiembre de 2026. La madurez y el soporte de la comunidad son limitados.
- Ausencia de datos operativos: no hay cifras publicadas de latencia, throughput ni consumo energetico, lo que dificulta dimensionar un despliegue en produccion.
- Contexto oficial no documentado: no se especifica la longitud de contexto soportada, lo que obliga a validarla empiricamente antes de confiar en aplicaciones que dependan de ventanas amplias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mlx-community/Xing4.0-29B-A4B-OptiQ-4bit
- Modelo base: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Repositorio GitHub del modelo base: https://github.com/XingChen-AGI/Xing4.0-29B-A4B
- Toolkit mlx-optiq: https://mlx-optiq.com
- Guia de la familia Xing4 en mlx-optiq: https://mlx-optiq.com/docs/xing4
- Catalogo de cuantizaciones OptiQ: https://mlx-optiq.com/models
- Documentacion de mlx-optiq: https://mlx-optiq.com/docs/
- Cuantizacion alternativa en MLX: https://huggingface.co/suzu89/Xing4.0-29B-A4B-4bit-MLX
- Version GGUF en tres partes: https://local-ai-zone.github.io/models/xing4-0-29b-a4b.html
- Espejo en gitcode: https://gitcode.com/hf_mirrors/mlx-community/Xing4.0-29B-A4B-OptiQ-4bit
