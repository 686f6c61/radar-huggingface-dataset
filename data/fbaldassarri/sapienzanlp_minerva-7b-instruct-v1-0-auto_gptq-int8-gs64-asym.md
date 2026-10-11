# fbaldassarri/sapienzanlp_Minerva-7B-instruct-v1.0-auto_gptq-int8-gs64-asym

## Resumen

Esta ficha describe `fbaldassarri/sapienzanlp_Minerva-7B-instruct-v1.0-auto_gptq-int8-gs64-asym`, una versión cuantizada a INT8 del modelo instruct `sapienzanlp/Minerva-7B-instruct-v1.0`, desarrollado originalmente por el grupo Sapienza NLP de la Universidad de La Sapienza (Roma). La cuantización la ha realizado el usuario fbaldassarri mediante Intel AutoRound v0.15.1 y el algoritmo GPTQ (AutoGPTQ), con cuantización asimétrica de solo pesos (weights-only quantization) y tamaño de grupo 64.

El modelo subyacente sigue la arquitectura Mistral (`model_type: mistral`), un transformer causal decoder-only orientado a generación de texto conversacional, con soporte nativo de italiano e inglés. Esta versión INT8 está pensada explícitamente para inferencia sobre hardware Intel: CPU, iGPU Arc a través de intel-extension-for-pytorch y NPU (AI Boost de la serie Core Ultra) mediante OpenVINO.

Su relevancia es doble. Por un lado, reduce el peso del repositorio a 9,0 GB y permite ejecutar un modelo de la familia 7B en equipos sin GPU dedicada, algo relevante para despliegues en portátiles Intel Core Ultra o servidores de solo CPU. Por otro lado, el repositorio incluye la receta de replicación completa (parámetros de calibración, versiones de librerías y tiempos), lo que lo convierte en un ejemplo reproducible de cuantización INT8 con AutoRound.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (`model_type: mistral`) |
| Parametros totales | 7B nominal (nombre del modelo); los metadatos de safetensors del repositorio cuantizado declaran 2.302.611.456 elementos |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 GPTQ (auto_gptq), group_size 64, asimetrica (`sym: false`), weights-only quantization (WoQ) |
| Idiomas soportados | italiano (it), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con configuracion GPTQ (auto_gptq) |

Datos adicionales del proceso de cuantizacion:

| Campo | Valor |
|---|---|
| Framework de cuantizacion | Intel AutoRound v0.15.1 |
| Version de transformers | 4.55.3 |
| Version de torch | 2.14.0+cpu |
| dtype de carga | torch.bfloat16 |
| Dispositivo de calibracion | cpu |
| Muestras de calibracion | 128 |
| Iteraciones de tuning | 200 |
| Longitud de secuencia de calibracion | 512 |
| Batch size de calibracion | 4 |
| Duracion de la cuantizacion | 54.573,4 s (909,6 min) |
| Tamano del repositorio | 9,0 GB |

## Arquitectura y entrenamiento

La arquitectura del modelo base es la de Mistral: un transformer decoder-only con atención causal, atención por ventanas deslizantes y normalización RMSNorm, diseñado para generación de texto autoregresiva. No es un modelo MoE ni un modelo híbrido SSM, y no emplea parámetros activos condicionales. El repositorio herede las capacidades del checkpoint `sapienzanlp/Minerva-7B-instruct-v1.0`, afinado para instrucciones y conversación con plantilla de chat propia.

Sobre el entrenamiento del modelo base no se incluye información en los datos disponibles: no se especifican el número de tokens, la composición del dataset, ni si hubo etapas de RLHF, DPO u otro tipo de alineamiento. La model card del repositorio cuantizado se limita a documentar el proceso de cuantización, no el preentrenamiento ni el ajuste del modelo original. Por tanto, esos datos deben consultarse en la model card del modelo base.

La innovación técnica de este artefacto concreto es el pipeline de cuantización. Se usa Intel AutoRound, que ajusta los parámetros de cuantización mediante optimización iterativa (200 iteraciones sobre 128 muestras de calibración de 512 tokens) en lugar de aplicar una cuantización post-entrenamiento puramente estadística. El resultado es un checkpoint GPTQ de 8 bits con grupo de 64 y modo asimétrico, exportado al formato auto_gptq y calibrado sobre CPU con `torch.bfloat16` como dtype de carga.

## Capacidades

- Generación de texto conversacional en italiano e inglés, con plantilla de chat integrada (`apply_chat_template`).
- Modelo de tipo instruct: está entrenado para seguir instrucciones y mantener diálogos multi-turno, no para completar texto en bruto.
- Razonamiento general y respuesta a preguntas en los dos idiomas declarados.
- Inferencia sobre hardware Intel: CPU, iGPU Arc mediante intel-extension-for-pytorch y NPU AI Boost (serie Core Ultra) mediante OpenVINO.
- Compatibilidad con la librería transformers y con text-generation-inference según las etiquetas del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo de pensamiento explícito: no disponible en la información proporcionada.
- Capacidades multilingües más allá de italiano e inglés: no disponible; la model card solo declara `it` y `en`.

## Casos de uso

- Asistente conversacional en italiano para atención al cliente: el modelo está afinado para instrucciones y declara italiano como idioma principal, por lo que puede gestionar diálogos multi-turno en ese idioma sin necesidad de prompts en inglés. La ventana de contexto real debe verificarse contra el modelo base, ya que no se documenta aquí.
- Generación de contenido editorial en italiano: redacción de borradores, resúmenes y reescritura de textos para medios o blogs italianos, aprovechando el ajuste instruct del modelo base.
- Procesamiento de documentos bilingües italiano-inglés: traducción asistida y normalización de terminología en entornos corporativos donde conviven ambos idiomas.
- Despliegue en portátiles Intel Core Ultra: al estar cuantizado para CPU, iGPU Arc y NPU, permite ejecutar un modelo de la familia 7B en local sin GPU dedicada, útil para asistentes de escritorio o herramientas internas de oficina.
- Servicio de inferencia en servidores de solo CPU: el formato GPTQ INT8 con group_size 64 reduce el peso del repositorio a 9,0 GB, lo que hace viable servir el modelo en máquinas sin acelerador, con la latencia como principal compromiso.
- Base para experimentos de cuantización reproducible: el repositorio documenta la receta completa (versiones, parámetros de calibración, duración), por lo que sirve como referencia para comparar AutoRound frente a otros esquemas de cuantización INT8 sobre la misma arquitectura.
- Evaluación comparativa de degradación por cuantización: al existir el checkpoint bf16 original, este artefacto permite medir la pérdida de calidad introducida por la cuantización INT8 en tareas italianas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio cuantizado no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, ni tampoco comparaciones con el checkpoint bf16 original. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada en GPU: el repositorio ocupa 9,0 GB, por lo que se necesita un mínimo de ~10 GB de VRAM libre para cargar los pesos en INT8 con margen para el contexto.
- GPU consumer compatibles: tarjetas con 12 GB o más, como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090. En tarjetas de 8 GB el modelo no cabe sin offloading.
- GPU de datacenter: A100, H100, L40S y similares, con holgura amplia y posibilidad de mayor paralelismo y batch.
- CPU: el autor indica que la versión INT8 está cuantizada específicamente para inferencia en CPU Intel, por lo que es viable sin GPU, a costa de mayor latencia.
- iGPU Intel Arc: soportada mediante intel-extension-for-pytorch, según la model card.
- NPU Intel (AI Boost, serie Core Ultra): soportada mediante OpenVINO, según la model card.
- Opciones de despliegue: transformers con AutoModelForCausalLM, intel-extension-for-pytorch, OpenVINO, y text-generation-inference según las etiquetas del repositorio (no confirmado en la model card). No se documenta soporte de llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput estimados: no disponible en la información proporcionada. Como referencia del coste de producción del artefacto, la cuantización en sí tardó 54.573,4 segundos (unas 15 horas) sobre CPU.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento de modelos alternativos de la misma categoría, por lo que la comparación cuantitativa no está disponible. La única comparación documentable es entre este artefacto y su modelo base sin cuantizar:

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/sapienzanlp_Minerva-7B-instruct-v1.0-auto_gptq-int8-gs64-asym | 7B nominal (2.302.611.456 elementos segun safetensors) | no disponible | INT8 GPTQ, group_size 64, asimetrico | Apache 2.0 | HuggingFace, 0 descargas |
| sapienzanlp/Minerva-7B-instruct-v1.0 (base) | no disponible | no disponible | bf16/fp16 original | Apache 2.0 | HuggingFace |

No se conocen, a partir de la información disponible, alternativas cuantizadas equivalentes de la misma familia con datos comparables.

## Limitaciones y advertencias

- No hay benchmarks publicados, ni del modelo cuantizado ni comparativos con el original. No hay evidencia en la información disponible de cuánta calidad se pierde con la cuantización INT8.
- La cuantización ha sido realizada por un tercero (fbaldassarri) sobre el modelo de Sapienza NLP, no por el equipo original. El repositorio registra 0 descargas y 0 likes, por lo que carece de validación por parte de la comunidad.
- El autor declara explícitamente que el modelo se ha desarrollado solo con fines de investigación y sin garantía. Conviene verificar esa cláusula antes de un uso comercial, aunque la licencia del repositorio sea Apache 2.0.
- Riesgo de alucinación: no cuantificado en la información disponible, pero es un riesgo inherente a los modelos generativos de esta familia y puede verse agravado por la pérdida de precisión de la cuantización.
- Sesgos conocidos: no documentados en la información proporcionada. El entrenamiento del modelo base, mayoritariamente sobre datos italianos e ingleses, puede introducir sesgos culturales y lingüísticos no evaluados aquí.
- Cobertura de idiomas limitada a italiano e inglés de forma declarada. El comportamiento en castellano no está garantizado ni evaluado.
- La longitud de contexto no se especifica en el repositorio. Es un dato crítico para planificar despliegues y debe consultarse en el modelo base.
- La discrepancia entre el tamaño nominal (7B) y el recuento de elementos declarado por safetensors (2.302.611.456) sugiere que los tensores cuantizados se empaquetan internamente; conviene no interpretar ese número como el número real de parámetros del modelo.
- El formato auto_gptq es específico y no todos los runners lo soportan. El soporte de llama.cpp, Ollama o vLLM no está confirmado en la documentación.
- La cuantización se calibro enteramente en CPU con un conjunto de 128 muestras de 512 tokens. Conjuntos de calibración pequeños pueden no representar bien dominios especializados.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/fbaldassarri/sapienzanlp_Minerva-7B-instruct-v1.0-auto_gptq-int8-gs64-asym
- Modelo base: https://huggingface.co/sapienzanlp/Minerva-7B-instruct-v1.0
- Intel AutoRound (framework de cuantizacion): https://github.com/intel/auto-round
- Pipeline de replicacion citado en la model card: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/

Nota: la busqueda web realizada no ha devuelto ningun resultado relacionado con este modelo. Todos los resultados obtenidos corresponden a un grupo musical surcoreano sin relacion con el contenido de esta ficha, por lo que no se han utilizado como fuente.
