# ribeiroyuri/CampoVivo-Qwen3-4B-Instruct-v3

## Resumen
CampoVivo-Qwen3-4B-Instruct-v3 es un conjunto de adaptadores LoRA (QLoRA 4-bit) entrenados sobre el modelo base `unsloth/Qwen3-4B`, publicado por el usuario ribeiroyuri. No es un modelo completo, sino un adaptador PEFT que se carga encima de Qwen3-4B para especializarlo como asistente virtual de CampoVivo Agrotech, una empresa ficticia de IA para el agronegocio (productos AgroPilot, ClimaSafra, GrãoConecta, SoloLab y RebanhoTech). Se trata de un trabajo académico de fine-tuning y no representa a una empresa real.

El modelo hereda del base una arquitectura transformer densa de aproximadamente 4.000 millones de parametros y unas 36 capas, con atención de consultas agrupadas (GQA) y una ventana de contexto nativa de 32.768 tokens en Qwen3-4B (extensible a 131.072 con YaRN). El ajuste se ha realizado en portugués sobre un dataset propio de 747 conversaciones sintéticas, lo que lo convierte en un ejemplo típico de adaptación de dominio con presupuesto reducido.

Su relevancia es fundamentalmente didáctica y de nicho: demuestra cómo especializar un LLM pequeño y permisivo (Apache 2.0) en un vertical concreto mediante LoRA, con un repositorio de apenas 0,3 GB. No obstante, su adopción es nula (0 descargas, 0 likes) y su alcance está limitado al dominio del dataset sintético con el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) con adaptadores LoRA; atencion GQA en el modelo base |
| Parametros totales | ~4.000 millones (modelo base Qwen3-4B); los adaptadores LoRA ocupan ~0,3 GB |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen3-4B (extensible a 131.072 con YaRN); entrenado con max_seq_length=2048 |
| Tipos de cuantizacion | Entrenamiento QLoRA 4-bit; adaptadores en safetensors. El modelo base admite cuantizaciones GGUF, AWQ y GPTQ |
| Idiomas soportados | Portugues (pt); el modelo base Qwen3-4B es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento
El modelo es un adaptador LoRA de rango 32 y alpha 32, con dropout 0 y rsLoRA activado, aplicado sobre los modulos de atencion (q_proj, k_proj, v_proj, o_proj) y de la MLP (gate_proj, up_proj, down_proj) de Qwen3-4B. El entrenamiento se realizo con QLoRA en 4 bits durante 3 epocas, con learning rate 0.0002, scheduler coseno, batch de 2 con acumulacion de gradientes de 4 y una particion de validacion del 10 %. La libreria de referencia es PEFT, con scripts de Unsloth.

Los datos de entrenamiento corresponden al dataset `ribeiroyuri/CampoVivo-Knowledge-Base-v3`, compuesto por 747 conversaciones en portugués con estructura system/user/assistant sobre la empresa ficticia, sus productos, planes, soporte, seguridad y objeciones de clientes. No se documenta el uso de RLHF, DPO ni otros metodos de alineacion posteriores al SFT. El template de chat se emplea con `enable_thinking=False`, desactivando el modo de razonamiento extendido de Qwen3.

## Capacidades
- Generacion de texto conversacional en portugues con formato de chat system/user/assistant.
- Asistente de dominio especializado: responde sobre productos, planes, soporte y objeciones de la empresa ficticia CampoVivo Agrotech.
- Hereda del modelo base Qwen3-4B capacidades generales de comprension y generacion de lenguaje, codigo y matematicas, aunque el ajuste LoRA solo refuerza el dominio objetivo.
- Soporte de tool calling / function calling: no documentado en la informacion disponible para este adaptador (el base Qwen3 lo soporta de forma nativa).
- Soporte de agentes y razonamiento multi-paso: no documentado; el ejemplo de uso desactiva explicitamente el modo thinking.
- Capacidades multilingues: limitadas al portugues en la practica; el base subyacente es multilingue.
- Capacidad especial: adaptacion de dominio de bajo coste desplegable como adaptador PEFT sobre Qwen3-4B.

## Casos de uso
- Asistente virtual de atencion al cliente para CampoVivo Agrotech (demo): el adaptador responde preguntas sobre catalogo de productos y planes con el tono definido en el dataset.
- Chatbot de soporte tecnico de productos: gestiona consultas sobre AgroPilot, ClimaSafra, GrãoConecta, SoloLab y RebanhoTech a partir de las 747 conversaciones de entrenamiento.
- Generacion de respuestas a objeciones comerciales: entrenado especificamente con ejemplos de objeciones de clientes, adecuado para guiones de venta simulados.
- Prueba de concepto academica de fine-tuning PEFT: sirve como material didactico para demostrar el flujo completo QLoRA + Unsloth + PEFT sobre un modelo de 4B.
- Base para adaptar a otros dominios agricolas: el pipeline y los hiperparametros documentados son reutilizables para especializar Qwen3-4B en nuevos verticales en portugues.
- Demostracion de despliegue de adaptadores LoRA: permite ejemplificar la carga de pesos PEFT sobre un modelo base sin necesidad de reentrenar.
- Integracion en notebooks de investigacion: util para comparar el comportamiento del modelo ajustado frente al base en tareas de dominio cerrado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- Inferencia en FP16/BF16: aproximadamente 8-10 GB de VRAM (modelo base de 4B mas overhead de activaciones y cache KV).
- Inferencia en 8 bits: aproximadamente 4-5 GB de VRAM.
- Inferencia en 4 bits (QLoRA/cuantizacion de inferencia): aproximadamente 2,5-3,5 GB de VRAM.
- Adaptadores LoRA: ocupan ~0,3 GB y pueden fusionarse con el base o cargarse en caliente con PEFT.
- GPU recomendadas: cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; en el extremo profesional se usan A100 o H100, innecesarias para este tamano.
- Opciones de despliegue: Unsloth (referencia del autor), Transformers + PEFT, vLLM y TGI (fusionando el adaptador), llama.cpp u Ollama (requiere exportar a GGUF tras fusionar los pesos).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CampoVivo-Qwen3-4B-Instruct-v3 | ~4.000 M (base) + adaptador LoRA | 32.768 tokens (base, 131.072 con YaRN) | Adaptador PEFT/LoRA | Apache 2.0 | HuggingFace (0 descargas) |
| Qwen/Qwen3-4B (base) | ~4.000 M | 32.768 tokens (131.072 con YaRN) | Modelo completo denso | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-4B-Instruct-2507 | ~4.000 M | 32.768 tokens (131.072 con YaRN) | Modelo completo instruct, sin modo thinking | Apache 2.0 | HuggingFace, Qualcomm AI Hub |
| ribeiroyuri/CampoVivo-Qwen3-4B-Instruct | ~4.000 M (base) + adaptador LoRA | 32.768 tokens (base) | Adaptador PEFT/LoRA (version previa) | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias
- Entrenado con muy pocos ejemplos (747 conversaciones) y datos sinteticos: puede equivocarse en detalles fuera del dataset.
- El propio autor advierte de que no debe usarse para decisiones agronomicas reales.
- Riesgo elevado de alucinacion fuera del dominio CampoVivo; el ajuste refuerza respuestas de la empresa ficticia y no conocimiento agronomico verificado.
- Idioma practicamente restringido al portugues; el rendimiento en castellano u otros idiomas no esta documentado.
- Capacidad de contexto limitada por la configuracion de entrenamiento (max_seq_length=2048), muy por debajo de la ventana nativa del base.
- Licencia Apache 2.0 permisiva para uso comercial, aunque al tratarse de un trabajo academico sobre una empresa ficticia conviene revisar la procedencia del dataset sintetico.
- Adopcion nula (0 descargas, 0 likes) y ausencia de evaluacion independiente: sin garantias de robustez en produccion.
- La fecha de creacion registrada (2026) resulta inconsistente y conviene verificarla antes de citar el modelo.
- Al ser un adaptador, requiere cargar el modelo base `unsloth/Qwen3-4B` para funcionar; no es un modelo autonomo.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/ribeiroyuri/CampoVivo-Qwen3-4B-Instruct-v3
- Dataset: https://huggingface.co/datasets/ribeiroyuri/CampoVivo-Knowledge-Base-v3
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B
- Version previa del adaptador: https://huggingface.co/ribeiroyuri/CampoVivo-Qwen3-4B-Instruct
- Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Qualcomm AI Hub (Qwen3-4B-Instruct-2507): https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Repositorio Qualcomm ai-hub-models: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_4b_instruct_2507/README.md
