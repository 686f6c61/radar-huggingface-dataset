# d9beuD/Qwen3.8-Flash-Next-oQ8-mtp

## Resumen

Qwen3.8-Flash-Next-oQ8-mtp es una cuantizacion en formato MLX del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario d9beuD el 5 de octubre de 2026. No es un modelo entrenado desde cero: se trata de un checkpoint derivado cuyo unico proposito es reducir el coste de memoria del modelo base manteniendo el maximo de fidelidad numerica posible dentro del ecosistema Apple Silicon.

La cuantizacion se ha realizado con la herramienta oQ (oMLX v0.7.0) en modo de precision mixta a 8 bits, con un tamano efectivo declarado de aproximadamente 8,66 bits por peso. El resultado ocupa 195 GB en disco (194,9 GB de repositorio) para 179.999.981.459 parametros, es decir, en torno a 180.000 millones. El checkpoint conserva la cabeza de prediccion multi-token (MTP), el codificador de vision y una tabla de embeddings de n-gramas, por lo que mantiene tanto la capacidad image-text-to-text como la posibilidad de aplicar decodificacion especulativa.

Su relevancia es acotada pero clara: es una de las pocas alternativas para ejecutar un modelo multimodal de ~180.000 millones de parametros en local sobre hardware Apple, a costa de exigir una maquina con mas de 195 GB de memoria unificada (por ejemplo, 256 GB). No hay datos publicados de benchmarks, context length declarada ni lista de idiomas soportados, y el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tipo de modelo declarado: qwen4_exp); incluye codificador de vision y cabeza MTP. No se detalla la configuracion interna de capas ni si emplea mezcla de expertos |
| Parametros totales | 179.999.981.459 (~180.000 millones) |
| Parametros activos | no disponible (no se confirma si el modelo base es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX de precision mixta a 8 bits con oQ (oMLX v0.7.0); group size 64 por defecto, con algunos modulos a 32 o 128; ~8,66 bits efectivos por peso; escala y sesgos en bfloat16; tabla de n-gramas a 8 bits con group size 32 |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | Qwen Community License 1.0 (etiquetada como license: other), heredada del modelo base |
| Formato de pesos | MLX safetensors (194,9 GB en repositorio; ~195 GB de pesos) |

## Arquitectura y entrenamiento

Este checkpoint no incorpora entrenamiento nuevo. Es una transformacion del checkpoint Qwen/Qwen3.8-Flash-Next mediante cuantizacion de precision mixta: se preservan las capas originales y se sustituyen los pesos por versiones de 8 bits con escalas y sesgos en bfloat16. La model card identifica el tipo de modelo como qwen4_exp y confirma la presencia de tres componentes clave: el codificador de vision (lo que habilita la pipeline image-text-to-text), una cabeza de prediccion multi-token (`mtp_num_hidden_layers: 1`) y una tabla de embeddings de n-gramas cuantizada a 8 bits con group size 32.

El detalle metodologico mas relevante es como se construyo el mapa de sensibilidad por capas que guia la asignacion de bits. No se calculo sobre el checkpoint bf16 completo, porque este no cabe en memoria en un Mac de 128 GB, sino sobre Jundot/Qwen3.8-Flash-Next-oQ4e-mtp, con una muestra de 128 fragmentos de 256 tokens y el conjunto de calibracion `code_multilingual`. Esto implica que la eleccion de que capas reciben mas bits esta heredada de una medicion hecha sobre una cuantizacion a 4 bits previa, no sobre los pesos originales en precision completa; es una aproximacion pragmatica cuya degradacion no ha sido cuantificada publicamente. No hay informacion disponible sobre el numero de tokens de entrenamiento del modelo base, la composicion de su dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en formato multimodal, con la etiqueta `conversational` en el repositorio.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text) gracias al codificador de vision incluido en el checkpoint cuantizado.
- Prediccion multi-token mediante la cabeza MTP preservada, lo que en principio permite decodificacion especulativa y aumenta el throughput de generacion frente a la decodificacion autorregresiva estandar.
- Uso de embeddings de n-gramas cuantizados, componente tipico de esquemas de aceleracion de inferencia.
- Capacidad de codigo y multilingue: el conjunto de calibracion empleado se denomina `code_multilingual`, lo que sugiere que el modelo base cubre esos dominios, aunque la model card no lo declara de forma explicita.
- Soporte de tool calling, function calling y flujos de agente multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local de un modelo multimodal de gran tamano en estaciones de trabajo Apple: un Mac Studio o Mac Pro con 256 GB de memoria unificada puede cargar los ~195 GB de pesos y ejecutar tareas de vision y lenguaje sin enviar datos a servicios externos, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Analisis de documentos escaneados y patrimonio documental: al aceptar entrada de imagen y texto, el modelo puede extraer y razonar sobre informacion contenida en facturas, formularios o informes en formato imagen, integrándose en un pipeline interno de digitalizacion.
- Asistencia conversacional de proposito general en local: la etiqueta `conversational` y el formato chat lo hacen apto para prototipos de asistente que no pueden depender de API externas por politica de datos.
- Investigacion sobre cuantizacion: el checkpoint es un artefacto util para medir la degradacion de un modelo de ~180.000 millones de parametros al pasar a 8 bits efectivos, y para comparar la precision mixta de oQ frente a otros esquemas.
- Evaluacion de decodificacion especulativa: la cabeza MTP preservada permite experimentar con prediccion multi-token y medir la ganancia de velocidad en Apple Silicon frente a la decodificacion token a token.
- Generacion y revision de codigo en un entorno aislado: dado que la calibracion se hizo sobre un conjunto `code_multilingual`, es un candidato razonable para tareas de asistencia a la programacion en maquina local, siempre que se validen los resultados porque no hay evaluaciones publicadas.
- Prototipado de agentes con entrada visual: combinando vision y generacion de texto se pueden construir flujos que interpreten capturas de pantalla o diagramas y produzcan acciones descritas en texto, aunque el soporte formal de tool calling no esta documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra suite, ni comparaciones con el checkpoint bf16 original o con la variante oQ4e. Tampoco se documentan mediciones de latencia, tokens por segundo ni ganancia real de la decodificacion especulativa con la cabeza MTP.

## Requisitos de hardware

- Memoria: los pesos ocupan ~195 GB, por lo que se necesita un equipo con mas memoria unificada que esa cifra. La propia model card indica un Mac con 256 GB como configuracion de referencia.
- GPU recomendadas: hardware Apple Silicon con memoria unificada de 256 GB o superior (por ejemplo, configuraciones de gama alta de Mac Studio o Mac Pro). No aplica a GPUs NVIDIA o AMD, ya que el formato es MLX y no hay pesos GGUF ni safetensors de PyTorch.
- Viabilidad en GPU de consumo: no. Ninguna GPU consumer actual (RTX 4090 con 24 GB, por ejemplo) dispone de memoria suficiente, ni el formato MLX es compatible con CUDA.
- Opciones de despliegue: libreria MLX (etiqueta `mlx` en el repositorio, con oMLX v0.7.0 como herramienta de cuantizacion). No se ofrecen pesos para vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponible.
- Almacenamiento: 194,9 GB de repositorio, mas espacio adicional para cache durante la carga.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano | Licencia | Formato | Rendimiento publicado |
|---|---|---|---|---|---|---|
| d9beuD/Qwen3.8-Flash-Next-oQ8-mtp | ~180.000 millones | MLX 8 bits mixta (~8,66 bits/peso) | ~195 GB | Qwen Community License 1.0 | MLX safetensors | no disponible |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible (el derivado conserva ~180.000 millones) | bfloat16 sin cuantizar | no disponible | Qwen Community License 1.0 | safetensors | no disponible |
| Jundot/Qwen3.8-Flash-Next-oQ4e-mtp | no disponible | oQ a 4 bits | no disponible | no disponible | MLX safetensors (presumiblemente) | no disponible |

No se dispone de datos de rendimiento de ninguno de los tres modelos, por lo que la comparacion se limita a cuantizacion, tamano y licencia. Frente a otros modelos multimodales abiertos de escala comparable, la informacion proporcionada no permite establecer una comparacion fundamentada.

## Limitaciones y advertencias

- Se trata de una cuantizacion, no de un modelo original: la perdida de precision respecto al checkpoint bf16 no ha sido medida ni documentada por el autor.
- El mapa de sensibilidad por capas se calculo sobre una cuantizacion a 4 bits y con 128 muestras de 256 tokens, no sobre los pesos completos. La asignacion de bits puede no ser optima para todos los dominios, y el sesgo hacia el conjunto `code_multilingual` podria favorecer tareas de codigo en detrimento de otras.
- Riesgo de alucinacion: no evaluado. No hay ninguna metrica de fidelidad, veracidad ni tasa de error publicada.
- Idiomas y longitud de contexto no declarados: no se puede asumir soporte multilingue ni una ventana de contexto concreta sin verificacion empirica.
- Restricciones de licencia: el modelo hereda la Qwen Community License 1.0, etiquetada como `other`. Es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que las condiciones especificas (umbrales de uso, obligaciones de atribucion, restricciones) no se detallan en la model card.
- Dependencia de plataforma: el formato MLX limita la ejecucion a hardware Apple Silicon, lo que excluye su despliegue en clústeres con GPU NVIDIA y complica el escalado horizontal.
- Requisito de memoria muy alto: ~195 GB de pesos exigen una maquina con 256 GB de memoria unificada, un perfil de hardware poco comun y costoso.
- Falta de validacion comunitaria: cero descargas y cero interacciones en el momento de la publicacion, sin issues ni informes de terceros que confirmen que el checkpoint carga y genera correctamente.
- Repositorio publicado y actualizado el mismo dia (5 de octubre de 2026), sin historial de revisiones que permita evaluar su mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d9beuD/Qwen3.8-Flash-Next-oQ8-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint usado para el mapa de sensibilidad: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
- Herramienta de cuantizacion oQ / oMLX: https://github.com/jundot/omlx
- Licencia (referenciada en el repositorio): LICENSE, Qwen Community License 1.0
