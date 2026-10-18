# goro806/sudanese-qlora-adapters

## Resumen

`sudanese-qlora-adapters` es un conjunto de adaptadores PEFT (LoRA/QLoRA) publicado por el usuario `goro806` sobre el modelo base Qwen/Qwen2.5-7B-Instruct. No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador (0,7 GB) que deben cargarse junto al modelo base para obtener un modelo funcional de 7,6 mil millones de parámetros. El entrenamiento se realizó mediante SFT (supervised fine-tuning) con la librería TRL, según declara la propia model card.

El interés del proyecto es acotado pero claro: se trata de un ajuste de un modelo instructivo generalista de la familia Qwen2.5 hacia una variante dialectal. El nombre del repositorio apunta al árabe sudanés, aunque la model card no documenta ni el idioma, ni el dataset, ni el volumen de entrenamiento, por lo que esa orientación solo puede inferirse del propio nombre. No hay métricas publicadas, ni ejemplos de salida, ni descripción del corpus utilizado.

En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes y se creó el 18 de octubre de 2026, por lo que debe considerarse un artefacto de investigación sin validación externa. Su relevancia práctica es la de un punto de partida reproducible para quien quiera adaptar Qwen2.5-7B-Instruct a dialectos poco representados, no la de un componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores PEFT) sobre transformer decoder-only denso (Qwen2.5-7B-Instruct) |
| Parametros totales | 7,61 mil millones en el modelo base; el adaptador añade un porcentaje no documentado (repo de 0,7 GB) |
| Parametros activos | No aplica (el modelo base es denso, no MoE) |
| Longitud de contexto | 32 768 tokens en el modelo base Qwen2.5-7B-Instruct; no especificado para el adaptador |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors; admite carga sobre base en bf16/fp16, 8 bits y 4 bits (NF4) vía bitsandbytes. El autor usa QLoRA en el nombre, pero no documenta la configuración de cuantización del entrenamiento |
| Idiomas soportados | No disponible. El modelo base soporta 29 idiomas; el ajuste parece orientado al árabe sudanés según el nombre del repositorio, sin confirmación en la model card |
| Licencia | No disponible (el campo YAML contiene el literal `license`, sin valor) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA), librería `peft` |

Otros datos técnicos declarados en la model card: PEFT 0.21.1, TRL 1.16.0, Transformers 5.18.0, PyTorch 2.14.1, Datasets 4.8.5, Tokenizers 0.23.2. Estas versiones no se corresponden con releases públicas estables en el momento de la publicación, lo que sugiere un entorno de entrenamiento personalizado o campos generados automáticamente por la plantilla de TRL.

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso de 28 capas y 7,61 mil millones de parámetros, con atención de consultas agrupadas (GQA) de 28 cabezas de consulta y 4 cabezas de clave/valor, normalización RMSNorm y activación SwiGLU. El modelo base fue preentrenado con 18 billones de tokens y posteriormente alineado con instrucciones; el adaptador hereda esa arquitectura y solo modifica un subconjunto de matrices mediante descomposición de bajo rango. No se especifican ni el rango (`r`), ni el `alpha`, ni los módulos objetivo del LoRA, ni si se aplicó cuantización de 4 bits durante el entrenamiento pese a que el nombre del repositorio incluye "qlora".

El procedimiento de entrenamiento declarado es SFT con TRL (`SFTTrainer`), sin mención de una fase posterior de RLHF, DPO u ORPO. La model card no indica el número de tokens de entrenamiento, la composición del dataset, la proporción de datos en árabe sudanés frente a datos generales, ni la existencia de máscaras de pérdida sobre el turno del asistente. Tampoco hay información sobre el hardware utilizado, la duración del entrenamiento ni las curvas de pérdida. La única traza verificable es el tamaño del repositorio (0,7 GB), superior al de un adaptador LoRA de rango bajo típico para un modelo de 7B (habitualmente entre 20 y 200 MB), lo que podría deberse a un rango alto, a la inclusión de estados del optimizador o a la presencia de varios adaptadores; no es posible confirmarlo con la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste instructivo del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas básicas a nivel de modelo de 7B, sin datos de evaluación específicos para este adaptador.
- Generación de código: capacidad presente en el modelo base, no verificada tras el ajuste.
- Soporte de tool calling y function calling heredado del formato de chat de Qwen2.5, sujeto a que el ajuste no haya degradado el formato de plantilla.
- Capacidad multilingüe del modelo base (29 idiomas), presumiblemente reforzada en la variante dialectal objetivo, aunque sin confirmación documental.
- Ajuste dialectal: el nombre del repositorio indica especialización en árabe sudanés, sin ejemplos ni evaluaciones que lo respalden.
- No se declara soporte de visión, audio, modo de razonamiento extendido ni decodificación especulativa.

## Casos de uso

- Atención al cliente en árabe sudanés: el adaptador puede desplegarse sobre Qwen2.5-7B-Instruct para responder consultas en dialecto en canales de mensajería, con la ventaja de su ventana de 32 768 tokens para mantener historiales largos de conversación. Requiere una evaluación previa del dialecto, ya que no hay métricas publicadas.
- Traducción y normalización dialectal: uso del modelo para convertir texto en árabe sudanés a árabe estándar moderno (MSA) o al revés, como paso previo en pipelines de análisis de sentimiento o indexación de documentos.
- Procesamiento posterior de transcripciones ASR: normalización de salidas de reconocimiento de voz que ya vienen en dialecto, corrigiendo ortografía y puntuación antes de almacenarlas en un sistema de gestión documental.
- Triaje de mensajes en contextos humanitarios: clasificación y resumen de mensajes recibidos en dialecto para priorizar casos, aprovechando la ventana de contexto para agrupar conversaciones completas. Conviene validar el sesgo y la tasa de alucinación antes de usarlo en decisiones críticas.
- Investigación lingüística asistida: generación de pares de frases y variantes dialectales para construir corpus anotados, con revisión humana obligatoria dado el riesgo de invención de formas no atestiguadas.
- Base para ajustes incrementales: al ser un adaptador PEFT, puede combinarse o continuarse con nuevos LoRA sobre el mismo modelo base, lo que facilita experimentos de adaptación a otros dialectos con coste de cómputo reducido.
- Despliegue en hardware modesto: cuantizado a 4 bits, el conjunto base más adaptador ocupa alrededor de 5 GB de VRAM, lo que permite servir el modelo en una única GPU de consumo para prototipos o entornos de baja concurrencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, ni métricas específicas de dialecto (por ejemplo, BLEU o comparaciones con hablantes nativos), ni comparaciones frente al modelo base sin ajustar.

## Requisitos de hardware

- VRAM del adaptador: despreciable frente al modelo base (el repositorio completo ocupa 0,7 GB en disco); el coste real lo determina Qwen2.5-7B-Instruct.
- Inferencia en bf16/fp16: aproximadamente 15,2 GB solo para pesos, más caché KV. Con la ventana completa de 32 768 tokens la caché KV añade del orden de 1,9 GB, por lo que conviene reservar entre 17 y 20 GB de VRAM.
- Inferencia en 8 bits: en torno a 8 GB de pesos más caché KV; ajusta en GPUs de 12-16 GB con contextos moderados.
- Inferencia en 4 bits (NF4/AWQ/GPTQ): aproximadamente 4,5-5,5 GB de pesos; cabe en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB y RTX 4070, con margen para contextos de 4 000-8 000 tokens.
- GPUs recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16 con contexto largo y concurrencia; RTX 3090/4090 o RTX 4090 para 4 bits con mayor lote.
- Cabe en GPU de consumo: sí, en 4 bits de forma holgada y en bf16 en una RTX 4090 o RTX 3090 con contexto limitado.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador sin fusionar), vLLM con soporte de adaptadores LoRA en tiempo de ejecución, TGI con adaptadores, y llama.cpp u Ollama fusionando previamente el adaptador con el modelo base y convirtiendo el resultado a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| sudanese-qlora-adapters | 7,61 B (base) + adaptador | 32 768 (heredado del base) | No disponible | Adaptador PEFT, sin evaluaciones publicadas |
| Qwen/Qwen2.5-7B-Instruct | 7,61 B | 32 768 | Apache 2.0 | Modelo completo, con evaluaciones publicadas por el autor del base |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 131 072 | Licencia comunitaria Llama 3.1 | Modelo completo, requiere aceptación de términos |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32 768 | Apache 2.0 | Modelo completo, con soporte amplio en herramientas |

La comparación es estructural: al no existir métricas del adaptador, no puede afirmarse que mejore o empeore respecto a Qwen2.5-7B-Instruct en tareas generales. Frente a Llama-3.1-8B-Instruct, la diferencia principal es la ventana de contexto (4 veces mayor en Llama) y el régimen de licencia; frente a Mistral-7B-Instruct-v0.3, la diferencia es la antigüedad del preentrenamiento y el ecosistema de herramientas. La ventaja específica de este repositorio es la especialización dialectal declarada, no verificada.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset: se desconoce el volumen, la procedencia, la calidad y la licencia de los datos de entrenamiento, lo que impide evaluar riesgos de contaminación o de uso de datos sin consentimiento.
- Licencia sin especificar: el campo YAML contiene un marcador vacío y la plataforma muestra "no disponible". No puede asumirse uso comercial permitido aunque el modelo base sea Apache 2.0, ya que los pesos del adaptador no declaran términos.
- Sin métricas ni validación externa: 0 descargas y 0 likes implican que no ha sido reproducido ni auditado por terceros; el riesgo de que el ajuste haya degradado capacidades generales del modelo base es real y no medible.
- Riesgo de alucinación: un ajuste SFT sobre un dataset pequeño y no documentado tiende a incrementar la confianza en respuestas incorrectas; en dialectos de bajos recursos es frecuente la invención de formas léxicas no atestiguadas.
- Posible sobreajuste al estilo del corpus: si el dataset es homogéneo, el modelo puede reproducir patrones de registro o de contenido específicos, incluidos sesgos presentes en los datos.
- Idiomas no declarados: la única pista sobre el idioma es el nombre del repositorio; no se garantiza que el modelo mantenga un rendimiento aceptable en árabe estándar o en otros idiomas tras el ajuste.
- Código de ejemplo defectuoso: el snippet de la model card pasa `model="None"` como cadena literal al pipeline, por lo que no funciona tal cual; debe sustituirse por la ruta del adaptador junto con el modelo base o por un identificador válido.
- Versiones de dependencias inusuales (Transformers 5.18.0, PyTorch 2.14.1, TRL 1.16.0): pueden provocar incompatibilidades al cargar el adaptador con versiones estándar; conviene fijar PEFT y Transformers y verificar la carga.
- Ausencia de información sobre rangos y módulos objetivo: dificulta la fusión (`merge_and_unload`) y la conversión a GGUF, que pueden fallar o producir resultados distintos a los esperados.
- Fecha de creación anómala (2026) y ausencia de paper asociado: no hay trazabilidad académica del trabajo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/goro806/sudanese-qlora-adapters
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de TRL (framework de entrenamiento declarado): https://github.com/huggingface/trl
- Paper, blog, demo o repositorio adicional del adaptador: no disponible en la información proporcionada.
