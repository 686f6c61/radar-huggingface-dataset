# Andreevai/WAG-Qwen-0.6B-Memory

## Resumen

WAG-Qwen-0.6B-Memory es un adaptador LoRA publicado por Andreevai (bajo el alias "apple sauce") sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. El adaptador implementa una propuesta arquitectonica denominada WAG (Weight-Augmented Generation), que plantea sustituir la recuperacion de fragmentos de texto tipica de RAG por una consolidacion de hechos episodicos directamente en los pesos del modelo mediante micro-pasos de AdamW sobre una capa LoRA de baja dimension.

El adaptador tiene un tamano de 9,2 MB en `adapter_model.safetensors` y entrena 2.293.760 parametros, lo que representa un 0,38% del modelo base. Segun la model card, el proceso de optimizacion tarda aproximadamente 22,8 segundos en CPU y reduce la perdida de 2,8157 a 0,0279, con una precision de recuperacion del 100% en coincidencia exacta cuando se consulta con 0 tokens de contexto en el prompt.

La relevancia del proyecto es experimental: propone un mecanismo de memoria persistente entre sesiones que evita el crecimiento del contexto y el coste cuadratico de atencion asociado a RAG clasico. No obstante, se trata de un adaptador de investigacion con cero descargas y sin validacion independiente en el momento de redactar esta ficha, por lo que debe evaluarse con cautela antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-0.5B-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | Modelo base Qwen2.5-0.5B-Instruct (~0,49B) mas 2.293.760 parametros entrenables del adaptador |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explicita para el adaptador; heredada del modelo base Qwen2.5-0.5B-Instruct (32.768 tokens segun especificacion de Qwen, no confirmado en la model card) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizacion estandar de transformers/PEFT, no documentada en la ficha) |
| Idiomas soportados | Ingles (en) y ruso (ru) |
| Licencia | MIT |
| Formato de pesos | safetensors (`adapter_model.safetensors`, formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de la familia Qwen2.5. La innovacion propuesta, WAG, se articula en tres componentes: un buffer de memoria de trabajo que mantiene los turnos inmediatos de la interaccion (0 a 2.500 tokens), una fase de consolidacion de pesos que "hornea" hechos episodicos en una capa micro-LoRA mediante pasos rapidos de AdamW (aproximadamente 20 segundos), y una fase de "zero-context wipeout" que elimina el contexto del prompt hasta 0 tokens, de modo que el modelo recupera los hechos desde los pesos cristalizados en lugar de desde el texto de entrada.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. La model card unicamente reporta metricas del proceso de ajuste: perdida inicial de 2,8157, perdida final de 0,0279, tiempo de optimizacion de aproximadamente 22,8 segundos en CPU y una precision de recuperacion del 100% en coincidencia exacta con 0 tokens de contexto. No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional sobre el modelo base Qwen2.5-0.5B-Instruct.
- Memoria episodica persistente mediante consolidacion de hechos en pesos LoRA, con recuperacion sin contexto en el prompt.
- Recuperacion de hechos con 0 tokens de contexto, segun la validacion reportada por el autor (100% de coincidencia exacta en su prueba).
- Soporte multilingue limitado a ingles y ruso, segun los tags del repositorio.
- Compatibilidad con el ecosistema PEFT y transformers para carga e inferencia.
- Integracion con un servidor compatible con la API de OpenAI (`wag serve`) distribuido en el repositorio GitHub del proyecto.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asistentes con memoria entre sesiones: el adaptador permite consolidar preferencias o datos operativos del usuario en la capa LoRA y recuperarlos sin arrastrar el historial completo en el prompt, lo que reduce el consumo de contexto en conversaciones recurrentes.
- Agentes de soporte tecnico con hechos fijos: claves operativas, configuraciones o procedimientos internos pueden consolidarse en pesos y consultarse con prompts minimos, segun el ejemplo de la model card ("secret operational key").
- Prototipado de investigacion en memorizacion parametrica: util para experimentar con la hipotesis de WAG frente a RAG clasico en entornos academicos o de laboratorio, dado su bajo coste de entrenamiento (~22,8 s en CPU).
- Despliegue en entornos con recursos muy limitados: al tratarse de un adaptador de 9,2 MB sobre un modelo de ~0,5B, puede ejecutarse en CPU o en GPUs de gama baja para pruebas de concepto.
- Chatbots bilingues ingles-ruso de dominio acotado: adecuado para escenarios conversacionales simples donde el conocimiento cabe en un conjunto pequeno de hechos consolidables.
- Evaluacion comparativa de tecnicas de memoria: sirve como referencia para medir latencia, coste de contexto y fidelidad de recuperacion frente a pipelines RAG tradicionales en tareas de recuperacion exacta.
- Integracion en pipelines locales con API compatible OpenAI: el servidor `wag serve` del repositorio GitHub permite sustituir endpoints remotos por un servicio local en pruebas de integracion.

## Benchmarks y rendimiento

La model card solo reporta metricas internas del proceso de ajuste, no benchmarks estandar (MMLU, HumanEval, GSM8K, etc.):

| Metrica | Valor reportado |
|---|---|
| Tamano del adaptador LoRA | 9,2 MB (`adapter_model.safetensors`) |
| Parametros entrenables | 2.293.760 (0,38% del modelo base) |
| Tiempo de optimizacion | ~22,8 segundos en CPU |
| Perdida inicial | 2,8157 |
| Perdida final | 0,0279 |
| Precision de recuperacion | 100% de coincidencia exacta con 0 tokens de contexto |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las cifras anteriores proceden exclusivamente del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al montar sobre Qwen2.5-0.5B-Instruct, el modelo base en fp32 ocupa aproximadamente 2 GB y en fp16 alrededor de 1 GB, mas el adaptador de 9,2 MB (estimacion a partir del tamano del modelo base, no confirmada en la model card).
- GPU recomendadas: no documentadas por el autor. Por el tamano del modelo base, cualquier GPU consumer con 4 GB o mas de VRAM deberia ser suficiente en fp16 (estimacion).
- Compatibilidad con GPU consumer: si, previsiblemente en GTX 1650, RTX 3050, RTX 4060 y superiores, asi como en CPU (el autor reporta entrenamiento en CPU en ~22,8 s).
- Opciones de despliegue: PEFT + transformers (documentado), servidor local compatible con OpenAI (`wag serve`, en el repositorio GitHub). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El unico dato temporal es el de optimizacion (~22,8 s en CPU), no de inferencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables del adaptador frente a alternativas. Se ofrece una comparacion estructural con el modelo base y con enfoques de memoria alternativos:

| Modelo / enfoque | Parametros | Contexto | Memoria persistente | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WAG-Qwen-0.6B-Memory | ~0,49B + 2,29M (LoRA) | Heredado del base (no confirmado) | Si, via pesos LoRA | MIT | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-0.5B-Instruct | ~0,49B | 32.768 tokens (segun Qwen) | No | Apache 2.0 (segun Qwen) | Hugging Face |
| RAG clasico sobre Qwen2.5-0.5B-Instruct | ~0,49B + indice vectorial | Limitado por ventana del base | Si, via recuperacion de texto | Depende del stack | Amplia |
| Fine-tuning completo de Qwen2.5-0.5B-Instruct | ~0,49B | 32.768 tokens (segun Qwen) | Si, via pesos | Depende del base | Amplia |

No se conocen adaptadores equivalentes de memoria parametrica comparables en tamano y enfoque dentro de la informacion disponible.

## Limitaciones y advertencias

- Validacion limitada: las metricas de la model card (100% de recuperacion, perdida 0,0279) proceden del autor y no han sido replicadas de forma independiente; el repositorio registra 0 descargas y 0 likes en el momento de redactar la ficha.
- Riesgo de sobreajuste a hechos concretos: la consolidacion en una capa LoRA de 2,29M parametros puede memorizar hechos de forma fragil y degradar el comportamiento general del modelo base.
- Riesgo de alucinacion: al recuperar desde pesos sin contexto, no hay trazabilidad de la fuente; el modelo puede generar hechos plausibles pero incorrectos sin mecanismo de verificacion.
- Idiomas limitados a ingles y ruso; no se documenta soporte de castellano.
- Contexto: la longitud efectiva del adaptador no esta documentada; el "zero-context wipeout" elimina el prompt, lo que puede afectar a la coherencia en conversaciones largas.
- Licencia MIT declarada por el autor, pero el modelo base Qwen2.5-0.5B-Instruct tiene su propia licencia (Apache 2.0 segun Qwen); conviene verificar la compatibilidad para uso comercial.
- Sin soporte documentado de tool calling, agentes o despliegue en motores de inferencia de alto rendimiento (vLLM, TGI); el servidor `wag serve` es la unica opcion documentada.
- Proyecto experimental y de un unico autor, con fecha de creacion futura en los metadatos (2026-11-21); no hay garantias de mantenimiento ni de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Andreevai/WAG-Qwen-0.6B-Memory
- Repositorio GitHub del proyecto WAG: https://github.com/Andrey147-ai/wag-core
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Paper, blog o demo adicionales: no disponible
