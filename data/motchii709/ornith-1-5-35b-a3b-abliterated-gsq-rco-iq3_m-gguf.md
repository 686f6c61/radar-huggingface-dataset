# motchii709/Ornith-1.5-35B-A3B-abliterated-GSQ-RCO-IQ3_M-GGUF

## Resumen

Ornith-1.5-35B-A3B-abliterated-GSQ-RCO-IQ3_M es una cuantización GGUF de 3 bits del modelo Ornith-1.5-35B-A3B, un transformer de mezcla de expertos (MoE) desarrollado originalmente por DeepReinforce AI (Ornith AI) bajo licencia MIT. Esta versión concreta ha sido producida por el usuario motchii709 a partir de los pesos abliterated de huihui-ai, es decir, con la alineación de seguridad eliminada deliberadamente en el modelo upstream. El resultado es un modelo sin guardrails, orientado a generación de texto y razonamiento, con soporte de decodificación especulativa mediante el bloque MTP (multi-token prediction) que se conserva en este build.

El archivo pesa 12,94 GiB y contiene 753 tensores con arquitectura `qwen35moe`, 41 bloques y `nextn_predict_layers = 1`. La cuantización IQ3_M se ha construido mediante transferencia de asignación por tensor (allocation transfer) desde otros dos builds comunitarios de estilo GSQ-RCO, combinando una matriz de importancia generada localmente con un conjunto de calibración mixto inglés-japonés. El modelo base declara soporte para inglés y japonés, y hereda el modo de razonamiento interno en bloques `<think>` característico de la familia.

Su relevancia práctica es doble: por un lado, permite ejecutar un MoE de 35B parámetros totales en hardware de consumo gracias a los aproximadamente 3B parámetros activos por token y a la cuantización de 3 bits; por otro, conserva el bloque MTP, lo que habilita decodificación especulativa en llama.cpp y mejora el throughput frente a conversiones que descartan ese bloque. Es, sin embargo, un artefacto de comunidad sin benchmarks publicados y con la seguridad desactivada, lo que limita seriamente su uso en producción orientada a usuarios finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen35moe`), 41 bloques, con bloque MTP/nextn (`nextn_predict_layers = 1`) |
| Parametros totales | 35B (según denominación del modelo base; no verificado en la información disponible) |
| Parametros activos | ~3B (según denominación A3B del modelo base; no verificado) |
| Longitud de contexto | No disponible (el ejemplo de uso emplea `-c 8192`, pero no se declara el máximo) |
| Tipos de cuantizacion | IQ3_M (build concreto); el formato GGUF admite el resto de tipos de llama.cpp |
| Idiomas soportados | Inglés (en), japonés (ja) |
| Licencia | MIT |
| Formato de pesos | GGUF (753 tensores, 12.941.471.456 bytes / 12,94 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con atención estándar y 41 bloques, de los cuales el bloque 40 corresponde a la cabeza de predicción multi-token (MTP/nextn). La nomenclatura `qwen35moe` sugiere una arquitectura derivada de la familia Qwen 3.5 MoE, aunque la información disponible no detalla la composición interna de expertos, el número de expertos por capa ni el mecanismo de enrutamiento. Tampoco se dispone de datos sobre el volumen de tokens de entrenamiento, la composición del corpus ni si hubo fases de RLHF o DPO en el modelo original.

Sobre el proceso de esta cuantización concreta sí hay información detallada. Los pesos de huihui-ai se convirtieron localmente a GGUF Q8_0 con llama.cpp y se usaron como entrada de `llama-quantize --allow-requantize`, con una matriz de importancia generada mediante `llama-imatrix` sobre wikitext-2 en inglés y Wikipedia en japonés (20231101), 200 fragmentos de 512 tokens de contexto. Los tipos de cuantización por tensor se extrajeron de las cabeceras de dos builds donantes: 733 tensores del cuerpo del build de 3 bits de pfeifferj y 20 tensores del bloque MTP del build APEX de lavendercomputing. La verificación posterior reporta que 554 de 554 tensores controlados (≥2D) conservan exactamente el tipo del donante, sin degradaciones, y que los 199 tensores restantes son 1-D (normas, sesgos, parámetros SSM) que siguen los valores por defecto de llama.cpp. La herramienta empleada fue un binario prebuilt de llama.cpp 0.4.1-dev (build 10976) sobre CPU Ryzen 5 5500.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de razonamiento interno en bloques `<think>` activado por defecto.
- Decodificación especulativa mediante el bloque MTP conservado, invocable en llama.cpp con `--spec-type draft-mtp`.
- Conversación multi-turno en inglés y japonés, con calidad verificada cualitativamente en ambos idiomas mediante pruebas de humo.
- Generación de código y matemáticas: capacidad presumible por herencia de la familia base, aunque no hay benchmarks que la cuantifiquen en la información disponible.
- Tool calling y function calling: no confirmado en la información disponible para este build.
- Capacidades de agente y razonamiento encadenado: no confirmadas explícitamente; el modo `<think>` facilita cadenas de razonamiento, pero no se documenta soporte de agentes.
- Entrada de imagen: el modelo base parece tener proyector de visión (se menciona `mmproj`), pero este repositorio no lo incluye y solo contiene el modelo de texto.
- Sin alineación de seguridad: la abliteración elimina los rechazos y guardrails del modelo original.

## Casos de uso

- Investigación sobre abliteración y alineación: el modelo permite estudiar empíricamente qué capacidades y sesgos emergen al eliminar la alineación de seguridad de un MoE de 35B, comparando con el modelo base original en las mismas condiciones de cuantización.
- Evaluación de técnicas de cuantización: al incluir la matriz de importancia y documentar la fidelidad de asignación por tensor, sirve como caso de estudio reproducible para medir el impacto de IQ3_M con allocation transfer frente a cuantizaciones from-scratch, usando la perplejidad reportada (12,3454 ± 0,5644) como referencia.
- Despliegue local en hardware de consumo: con 12,94 GiB en disco y unos 3B parámetros activos, puede ejecutarse en GPU de consumo con 16 GB o más de VRAM, o en CPU con llama.cpp, para prototipos de generación de texto sin requisitos de cumplimiento normativo.
- Generación de texto creativo sin filtros: escritura de ficción, guiones o contenido editorial donde los rechazos del modelo alineado resultan un obstáculo, asumiendo la responsabilidad legal y ética del contenido producido.
- Procesamiento bilingüe inglés-japonés: tareas de traducción, resumen o reescritura en ese par de idiomas, aprovechando la calibración de la matriz de importancia sobre Wikipedia japonesa y las pruebas de humo en japonés.
- Servicio de inferencia con decodificación especulativa: montar un `llama-server` con `--spec-type draft-mtp` para aumentar el throughput en escenarios de alta concurrencia sobre CPU o GPU única, comparando latencia frente a builds sin bloque MTP.
- Base para fine-tuning posterior: al ser MIT y estar en GGUF, puede servir de punto de partida para experimentos de adaptación con LoRA sobre el modelo original en safetensors, no directamente sobre el GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor únicamente reporta una medición de perplejidad en held-out:

| Metrica | Este build | Donante pfeifferj 3-bit |
|---|---|---|
| Perplejidad (16 fragmentos × 512 contexto) | 12,3454 ± 0,5644 | 12,7927 ± 0,5911 |

El propio autor advierte que las bases difieren (pesos abliterated aquí, pesos originales en el donante), por lo que la comparación es de producto y no aísla el efecto del cuantizador.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo ocupa 12,94 GiB; con overhead de contexto y caché KV, se recomienda un mínimo de 16 GB de VRAM para contexto moderado (8K) y 24 GB para contextos mayores.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080/4070 Ti Super (16 GB), A100 40 GB o H100 para despliegues con mayor concurrencia y contexto.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más con contexto contenido; en 12 GB requeriría offload parcial a CPU o cuantizaciones menores.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) es la vía documentada; vLLM, TGI u Ollama no están confirmados para esta arquitectura `qwen35moe` en la información disponible.
- Latencia y throughput: no disponibles. El bloque MTP permite decodificación especulativa, que previsiblemente mejora el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este build (Ornith-1.5-35B-A3B abliterated IQ3_M) | 35B totales / ~3B activos | No disponible | IQ3_M, 12,94 GiB | MIT | Conserva bloque MTP; sin alineación |
| pfeifferj/Ornith-1.5-35B-A3B-GSQ-RCO-GGUF (3-bit) | 35B totales / ~3B activos | No disponible | 3 bits GSQ-RCO | MIT | Pesos originales alineados; excluye bloque MTP |
| lavendercomputing APEX GSQ-RCO IQ3_XXS | 35B totales / ~3B activos | No disponible | IQ3_XXS | Apache-2.0 en el repo, linaje MIT | Incluye bloque MTP; menor tamaño por IQ3_XXS |
| huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated | 35B totales / ~3B activos | No disponible | Safetensors (sin cuantizar) | MIT | Pesos abliterated de referencia, sin cuantizar |

No se dispone de datos de rendimiento comparativo entre estos builds más allá de la perplejidad citada.

## Limitaciones y advertencias

- Modelo abliterated: la alineación de seguridad fue eliminada en el upstream; no hay guardrails y el modelo puede generar contenido dañino, ilegal o sexualmente explícito. El usuario es responsable del uso.
- Riesgo de alucinación: no cuantificado; al ser una cuantización de 3 bits sobre un modelo sin benchmarks publicados, la fiabilidad factual no está verificada.
- Idiomas limitados: solo inglés y japonés declarados; el rendimiento en castellano no está evaluado y previsiblemente será inferior.
- Contexto no documentado: se desconoce la ventana máxima real; el ejemplo usa 8K, pero no se confirma el límite del modelo base.
- Sin visión: el proyector `mmproj` no está incluido, por lo que la entrada de imagen no es posible con este repositorio.
- Muestreo delicado: el autor advierte que `repeat-penalty 1.05` es el punto óptimo, que 1.0 puede provocar bucles y 1.1 truncamientos, y que no se recomienda decodificación greedy.
- Licencia: MIT en todo el linaje de pesos según el autor, con la salvedad de que la asignación del bloque 40 se midió de un build cuyo repositorio muestra Apache-2.0; conviene revisar la trazabilidad antes de un uso comercial estricto.
- Artefacto de comunidad: 0 descargas y 0 likes en el momento de la consulta, sin revisión independiente; la calidad de la cuantización se apoya únicamente en la verificación del propio autor.
- Sin benchmarks estándar: no hay datos de MMLU, HumanEval ni GSM8K para decidir su adopción en producción frente a alternativas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/motchii709/Ornith-1.5-35B-A3B-abliterated-GSQ-RCO-IQ3_M-GGUF
- Modelo base (pesos abliterated): https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Donante de asignación del cuerpo: https://huggingface.co/pfeifferj/Ornith-1.5-35B-A3B-GSQ-RCO-GGUF
- Donante de asignación del bloque MTP: build APEX GSQ-RCO IQ3_XXS de lavendercomputing (sin URL directa en la información disponible)
- Herramientas de conversión y cuantización: https://github.com/ggml-org/llama.cpp
