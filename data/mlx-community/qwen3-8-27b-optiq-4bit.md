# mlx-community/Qwen3.8-27B-OptiQ-4bit

## Resumen

Qwen3.8-27B-OptiQ-4bit es una cuantizacion de precision mixta en formato MLX del modelo multimodal Qwen/Qwen3.8-27B, publicada por la comunidad mlx-community y generada con la herramienta mlx-optiq. El modelo base es un transformer hibrido de 27B parametros (26.895.993.856 parametros reales segun los safetensors) que procesa imagen y texto, con una torre de vision y 64 bloques de los cuales tres cuartas partes emplean atencion lineal y el resto atencion completa. Esta version cuantizada reduce el peso en disco a 19,0 GB (20,7 GB de repositorio) y esta pensada para inferencia local en Apple Silicon.

La relevancia de esta ficha esta en que demuestra una estrategia de cuantizacion sensible a la capa: en lugar de aplicar 4 bits de forma uniforme, se ejecuta un barrido de sensibilidad por divergencia KL sobre una mezcla de calibracion de seis dominios (prosa, razonamiento, codigo, agente, tool-call e instrucciones con restricciones), de modo que 261 capas sensibles se mantienen en 8 bits y 237 capas robustas bajan a 4 bits. El resultado son 498 tensores cuantizados con grupo de 64, mientras la torre de vision se conserva en bf16 en un sidecar de 0,9 GB.

El modelo se distribuye con licencia Apache 2.0, admite carga solo-texto con mlx-lm estandar y multimodal con el stack OptiQ, e incluye las cabezas MTP (multi-token prediction) originales de Qwen. Con 6.786 descargas y 22 likes en el momento de la consulta, es una opcion practica para desarrolladores que quieran ejecutar un VLM de 27B en un Mac con memoria unificada suficiente, sin GPU dedicada ni servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (atencion lineal en 3/4 de los 64 bloques, atencion completa en el resto) con torre de vision; multimodal imagen+texto |
| Parametros totales | 26.895.993.856 (26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Precision mixta 4/8 bits: 261 capas a 8 bits, 237 capas a 4 bits, 498 tensores cuantizados, group size 64; torre de vision en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX); sidecar de vision `optiq/optiq_vision.safetensors`; cabezas MTP en `optiq/mtp.safetensors` |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer hibrido: de sus 64 bloques, aproximadamente tres cuartas partes usan atencion lineal con cinco proyecciones cada uno y el resto atencion completa. Esa mezcla explica que el barrido de sensibilidad puntue 498 tensores en lugar de los ~450 de un modelo denso de tamano equivalente. El modelo es multimodal (pipeline image-text-to-text) e incorpora cabezas MTP (multi-token prediction), cuyos tensores originales se conservan en el repositorio cuantizado.

Sobre el entrenamiento del modelo base no se proporciona informacion en la documentacion disponible (numero de tokens, composicion del dataset, fases de RLHF/DPO): no disponible. Lo que si se documenta es el proceso de cuantizacion: mlx-optiq realiza un pase de sensibilidad por divergencia KL contra una referencia uniforme de 4 bits (bf16 no cabe en 36 GB a este tamano), usando 40 muestras por cada uno de seis dominios, y asigna 8 bits a las capas sensibles y 4 bits a las robustas. La nomenclatura sigue la convencion de llama.cpp para quants mixtos tipo Q4_K_M: la etiqueta "4-bit" indica la precision predominante, no la media ponderada. Un detalle tecnico relevante para reutilizar las cabezas MTP fuera de `optiq serve`: sus siete pesos RMSNorm (`mtp.*norm*`) estan centrados en cero y se aplican como 1 + w, por lo que hay que sumar 1.0 a las siete normas al cargarlas en otro runtime.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-turno.
- Comprension de imagen y texto combinados (image-text-to-text) mediante la torre de vision en bf16.
- Generacion de codigo: HumanEval pass@1 de 92,1% reportado por el autor del quant.
- Razonamiento matematico con cadena de pensamiento: GSM8K 3-shot CoT de 96,1%.
- Tool calling / function calling: BFCL-V3 simple (AST) de 93,5%.
- Seguimiento de instrucciones estrictas: IFEval prompt-level strict de 77,1%.
- Recuperacion en contexto largo: HashHop de 85,0%.
- Soporte de decodificacion multi-token mediante las cabezas MTP incluidas en el repositorio.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking explicito, audio u otras modalidades: no disponible.

## Casos de uso

- Asistente de documentacion tecnica con imagenes: el modelo puede recibir capturas de paneles, diagramas de arquitectura o fragmentos de codigo escaneados junto al texto de la consulta y responder de forma conversacional, gracias a la torre de vision en bf16 y al pipeline image-text-to-text.
- Generacion de codigo en local para equipos con Mac: con HumanEval de 92,1% y soporte de tool calling (BFCL-V3 93,5%), se puede integrar en un servidor compatible con OpenAI y Anthropic que expone `optiq serve`, de modo que editores y agentes de CI/CD lo consuman sin salir de la red local.
- Automatizacion de agentes con llamadas a herramientas: el modelo puede encadenar pasos, invocar funciones y mantener el estado de la conversacion; el repositorio incluye ejecucion de Python en sandbox dentro del stack OptiQ, lo que permite prototipar agentes que calculan y verifican resultados.
- Extraccion y validacion de datos con restricciones: IFEval strict de 77,1% y calibracion especifica en instrucciones con restricciones lo hacen adecuado para tareas de formato estricto, como generar JSON validable o rellenar plantillas con campos obligatorios.
- Analisis de documentos largos con recuperacion: el HashHop de 85,0% sugiere buena recuperacion en contextos extensos; se puede usar para localizar datos concretos en informes, contratos o registros antes de resumirlos.
- Fine-tuning local con LoRA sensible a la cuantizacion: mlx-optiq permite entrenar adaptadores LoRA sobre este quant y montarlos en caliente, util para adaptar el modelo a dominios verticales (legal, sanitario, interno) sin infraestructura cloud.
- Prototipado y evaluacion en estaciones de trabajo Apple Silicon: al ocupar 19,0 GB en disco y cargar solo-texto con mlx-lm estandar, sirve para comparar variantes y medir latencia antes de decidir un despliegue mayor.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| MMLU (5-shot, 1000) | 84,1% |
| GSM8K (3-shot CoT) | 96,1% |
| IFEval (prompt-level, strict) | 77,1% |
| BFCL-V3 simple (AST) | 93,5% |
| HumanEval (pass@1) | 92,1% |
| HashHop (long-context retrieval) | 85,0% |
| Capability Score (media de 6) | 87,98 |

Los datos proceden de la model card del autor del quant y corresponden a esta version cuantizada, no al modelo base en bf16. La puntuacion agregada asigna el mismo peso a cada metrica y el tamano en disco se reporta como eje secundario, no integrado en la media. No se han publicado en la informacion disponible resultados comparativos frente a otros modelos ni mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM/memoria unificada: el repositorio ocupa 20,7 GB y el peso en disco declarado es de 19,0 GB; se necesita al menos esa cantidad de memoria unificada mas el espacio para KV-cache y activaciones. El autor menciona que bf16 a este tamano no cabe en 36 GB, lo que situa el requisito de la version sin cuantizar por encima de esa cifra.
- GPU: el formato es MLX, por lo que el hardware objetivo son los chips Apple Silicon (serie M). No se documenta soporte para A100, H100 ni RTX 4090 en esta publicacion.
- Consumer GPU: cabe en equipos Apple Silicon con memoria unificada suficiente (orden de 24 GB o mas para texto; la carga multimodal anade el sidecar de vision de 0,9 GB). No aplica a GPUs de consumo NVIDIA/AMD con este formato.
- Despliegue: `mlx-lm` para texto; `mlx-optiq` (`optiq serve`) para imagen+texto, servidor compatible con OpenAI y Anthropic, KV-cache de precision mixta, LoRA sensible a sensibilidad, montaje en caliente de adaptadores y ejecucion de Python en sandbox. vLLM, llama.cpp, Ollama y TGI no se mencionan como soportados para estos pesos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / hardware | Licencia | Notas |
|---|---|---|---|---|---|
| mlx-community/Qwen3.8-27B-OptiQ-4bit | 26,9B | no disponible | MLX safetensors, Apple Silicon | Apache 2.0 | Quant mixto 4/8 bits, vision en bf16, Capability Score 87,98 |
| Qwen/Qwen3.8-27B (base) | 26,9B | no disponible | safetensors bf16 | Apache 2.0 | Referencia sin cuantizar; no cabe en 36 GB segun el autor del quant |
| Quants uniformes de 4 bits del mismo base | 26,9B | no disponible | MLX safetensors | Apache 2.0 | Referencia usada para el pase de sensibilidad; sin datos publicados de rendimiento en la informacion disponible |
| Otros modelos de ~27B multimodales | no disponible | no disponible | no disponible | no disponible | No se aportan datos comparativos en la informacion disponible |

## Limitaciones y advertencias

- La etiqueta "4-bit" describe la precision predominante, no la media ponderada: 261 de las 498 capas estan en 8 bits, por lo que el consumo real de memoria y el rendimiento no equivalen a un quant uniforme de 4 bits.
- El formato es exclusivamente MLX: no se puede desplegar en vLLM, TGI, llama.cpp u Ollama sin conversion adicional, lo que limita su uso a hardware Apple Silicon.
- La carga multimodal requiere el stack OptiQ; con `mlx-lm` estandar solo funciona en modo texto, ya que la torre de vision vive en un sidecar separado.
- Al reutilizar las cabezas MTP fuera de `optiq serve` hay que sumar 1.0 a las siete RMSNorm (`mtp.*norm*`); omitirlo produce resultados incorrectos.
- Los benchmarks publicados son mediciones del autor del quant, sin comparacion con el modelo base en bf16 ni con alternativas, y con una metodologia de puntuacion agregada propia.
- No se documentan sesgos conocidos, tasas de alucinacion, idiomas soportados ni longitud de contexto: no disponible.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base deben verificarse en su propia model card.
- El proceso de cuantizacion puede degradar capacidades no cubiertas por la mezcla de calibracion de seis dominios; conviene evaluar en el dominio propio antes de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/Qwen3.8-27B-OptiQ-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Web del proyecto mlx-optiq: https://mlx-optiq.com/
- Documentacion de mlx-optiq: https://mlx-optiq.com/docs/
- Guia de la familia Qwen: https://mlx-optiq.com/docs/qwen
- Laboratorio (Lab): https://mlx-optiq.com/docs/lab/
- Catalogo de quants OptiQ: https://mlx-optiq.com/models
- Mezcla de calibracion: https://mlx-optiq.com/blog/calibration-mix
- Marco de evaluacion: https://mlx-optiq.com/blog/eval-framework
- Paquete en PyPI: https://pypi.org/project/mlx-optiq
