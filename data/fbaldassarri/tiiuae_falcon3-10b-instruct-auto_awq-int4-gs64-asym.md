# fbaldassarri/tiiuae_Falcon3-10B-Instruct-auto_awq-int4-gs64-asym

## Resumen

Esta ficha describe la versión cuantizada a 4 bits del modelo Falcon3-10B-Instruct, publicada por el usuario fbaldassarri bajo el identificador `fbaldassarri/tiiuae_Falcon3-10B-Instruct-auto_awq-int4-gs64-asym`. Se trata de un artefacto derivado del modelo original de TII (Technology Innovation Institute) de Abu Dabi, obtenido mediante la técnica AWQ (Activation-aware Weight Quantization) implementada a través del framework Intel AutoRound v0.16.1. El objetivo es reducir el peso en memoria y acelerar la inferencia (el autor declara un speedup de 2-3x) manteniendo una pérdida de precisión calificada como "ligera" en la configuración W4G64.

El modelo base Falcon3-10B-Instruct es un transformer causal de tipo Llama, orientado a generación de texto conversacional y con licencia Apache 2.0. La versión cuantizada conserva esa licencia y está pensada específicamente para ejecución en CPU Intel, iGPU Intel Arc (mediante intel-extension-for-pytorch) y NPU Intel (AI Boost en la serie Core Ultra, vía OpenVINO). Es, por tanto, un artefacto de despliegue en hardware Intel más que un modelo nuevo.

Un dato relevante y llamativo: el repositorio declara en sus safetensors 2.160.061.440 parámetros, muy por debajo de los 10.000 millones que sugiere el nombre del modelo base. Esta discrepancia no se explica en la model card y debe tratarse con cautela: o bien el recuento corresponde a un subconjunto de tensores, o bien el artefacto no contiene el modelo completo. El tamaño del repo (8,3 GB) sí es coherente con una cuantización INT4 de un modelo de 10B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (model_type: llama), derivado de Falcon3-10B-Instruct |
| Parametros totales | 2.160.061.440 según safetensors del repo (el modelo base nominal es de 10B; discrepancia no aclarada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | INT4, group size 64, asimétrica (sym: false), método AWQ/WoQ |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato de cuantización auto_awq) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer causal decoder-only con `model_type: llama`, según declara la propia model card del artefacto cuantizado. No se proporcionan en la información disponible detalles sobre el número de capas, dimensión oculta, cabezas de atención ni composición del dataset de preentrenamiento del Falcon3-10B-Instruct original. Tampoco se documenta si hubo RLHF, DPO u otras fases de alineación posteriores al preentrenamiento; solo se indica que el modelo base es de tipo "instruct/chat" y que debe usarse con su plantilla de chat integrada.

La innovación técnica de este artefacto no está en la arquitectura, sino en el proceso de cuantización. Se aplicó AWQ (Activation-aware Weight Quantization) mediante Intel AutoRound v0.16.1, con calibración sobre 128 muestras, 200 iteraciones de tuning, longitud de secuencia 512 y batch size 4, ejecutado en CPU con `torch.bfloat16` como dtype de carga. El proceso completo tardó 51.906,1 segundos (aproximadamente 865 minutos). El resultado es una cuantización weights-only (WoQ) de 4 bits con grupo de 64 y esquema asimétrico, orientada a inferencia en hardware Intel.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat integrada para turnos usuario/asistente.
- Razonamiento y respuesta a instrucciones, heredado del modelo base Falcon3-10B-Instruct.
- Generación de código y tareas de matemáticas: capacidad esperable del modelo base, aunque no se documenta de forma explícita en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Despliegue en CPU Intel para prototipos y pruebas: la cuantización está calibrada y empaquetada para ejecutarse en CPU Intel con intel-extension-for-pytorch, lo que permite levantar un servicio de generación de texto sin GPU dedicada.
- Inferencia en portátiles con iGPU Intel Arc: el autor indica soporte para iGPU Arc (por ejemplo, Core Ultra 185H), lo que habilita asistentes conversacionales locales en equipos sin GPU discreta.
- Ejecución en NPU Intel AI Boost: la model card menciona soporte vía OpenVINO para la NPU de la serie Core Ultra, adecuado para aplicaciones de escritorio con bajo consumo energético.
- Chatbot de atención al cliente en inglés: el modelo es de tipo instruct y usa plantilla de chat, por lo que puede gestionar conversaciones multi-turno; la ventana de contexto real debe verificarse contra el modelo base, ya que no se documenta aquí.
- Generación de texto en pipelines por lotes: el speedup declarado de 2-3x respecto al modelo en bf16 lo hace apto para tareas de generación masiva donde el throughput prima sobre la precisión máxima.
- Evaluación comparativa de cuantizaciones: sirve como artefacto de referencia para medir la degradación de calidad de AWQ INT4 frente al Falcon3-10B-Instruct original en tareas concretas.
- Investigación sobre cuantización WoQ: la receta de replicación completa (versiones, parámetros de calibración, tiempos) permite reproducir el proceso y estudiar su impacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo declara cualitativamente un speedup de 2-3x y una "ligera caída de precisión" en W4G64, sin cifras concretas de MMLU, HumanEval, GSM8K ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM/espacio en memoria: el repo ocupa 8,3 GB en safetensors INT4; la carga en memoria debe rondar esa cifra más overhead de activaciones y KV cache, aunque no se documenta una estimación oficial.
- GPU recomendadas: no se documentan; el artefacto está orientado explícitamente a CPU Intel, iGPU Intel Arc y NPU Intel (Core Ultra), no a GPU NVIDIA o AMD.
- ¿Cabe en consumer GPU? No hay datos que lo confirmen; el foco del autor es hardware Intel integrado, no GPU de consumo.
- Opciones de despliegue: transformers con `device_map="auto"`, intel-extension-for-pytorch (CPU/iGPU Arc), OpenVINO (NPU AI Boost) y text-generation-inference (etiqueta presente en el repo). vLLM, llama.cpp y Ollama no se mencionan.
- Latencia y throughput: no disponibles; solo la afirmación genérica de 2-3x de speedup frente a la versión sin cuantizar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| Este artefacto (Falcon3-10B-Instruct AWQ INT4) | 2,16B según safetensors (base nominal 10B) | no disponible | INT4 gs64 asimétrica | Apache 2.0 | Inferencia en CPU/iGPU/NPU Intel |
| tiiuae/Falcon3-10B-Instruct (original) | 10B | no disponible | bf16/fp16 | Apache 2.0 | Referencia de precisión completa |
| Otras cuantizaciones INT4 del mismo base (GPTQ, GGUF) | 10B nominales | depende del formato | INT4/INT8 | Apache 2.0 | Despliegue en GPU o llama.cpp |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y enfoque de despliegue.

## Limitaciones y advertencias

- Discrepancia de parámetros: el recuento de safetensors (2,16B) no cuadra con el modelo base de 10B; verificar la integridad del artefacto antes de usarlo en producción.
- Pérdida de precisión: el propio autor reconoce una caída de accuracy en W4G64, sin cuantificar; no apto para tareas donde la exactitud numérica sea crítica sin validación previa.
- Solo inglés: el campo de idioma declara únicamente `en`; no hay soporte multilingüe documentado.
- Sesgos: no se documentan sesgos específicos, pero al ser una cuantización de un modelo entrenado con datos web, hereda los sesgos del modelo base.
- Riesgo de alucinación: inherente a los modelos generativos; no se han publicado evaluaciones específicas para esta variante.
- Licencia: Apache 2.0 permite uso comercial, pero la model card incluye un disclaimer que indica que el modelo se desarrolló "solo para fines de investigación"; conviene revisar esta contradicción antes de un despliegue comercial.
- Dependencia de hardware Intel: el artefacto está optimizado para CPU, iGPU Arc y NPU Intel; el rendimiento en otros hardware no está documentado.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide planificar aplicaciones con ventanas largas.
- Sin benchmarks: no hay métricas publicadas que permitan estimar la degradación real frente al modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fbaldassarri/tiiuae_Falcon3-10B-Instruct-auto_awq-int4-gs64-asym
- Modelo base: https://huggingface.co/tiiuae/Falcon3-10B-Instruct
- Framework Intel AutoRound: https://github.com/intel/auto-round
- Pipeline de cuantización referenciado: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Apache 2.0: https://choosealicense.com/licenses/apache-2.0/
