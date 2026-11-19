# aryan22medigeri/llm-qwen2.5-1.5b-qlora

## Resumen

SahayakLLM es un adaptador LoRA (QLoRA en 4 bits NF4) entrenado sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, publicado por el usuario aryan22medigeri en Hugging Face. Resuelve dos tareas concretas dentro del dominio de atencion al cliente de comercio electronico: generacion de respuestas de soporte y enrutamiento de consultas a una etiqueta JSON con intent y category. El adaptador entrena unicamente 18.464.768 parametros (1,18 % del total) sobre las proyecciones lineales del transformer, lo que lo convierte en un artefacto ligero (repo de 0,1 GB) pensado para iteracion rapida y despliegue con recursos modestos.

El modelo parte de la arquitectura Qwen2.5-1.5B-Instruct: un transformer decoder-only con 1.500 millones de parametros y ventana de contexto de 32.768 tokens (segun las especificaciones publicas del modelo base de Qwen). El adaptador se ha entrenado sobre el dataset Bitext Customer Support LLM Chatbot Training Dataset, con 23.875 registros etiquetados para respuesta y enrutamiento, y un split estratificado 80/10/10 con semilla fija 42. La licencia declarada es Apache 2.0.

Su relevancia es acotada pero util: demuestra un flujo completo de QLoRA para un caso vertical (soporte de e-commerce) con metricas de evaluacion explicitas y un desglose honesto de limitaciones. No es un modelo generalista ni un producto listo para produccion; es un experimento reproducible con resultados medidos sobre datos sinteticos y plantillas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (QLoRA 4-bit NF4) |
| Parametros totales | 1.500 millones (modelo base) + 18.464.768 parametros entrenables del adaptador (1,18 %) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (modelo base Qwen2.5-1.5B-Instruct); entrenamiento limitado a 480 tokens |
| Tipos de cuantizacion | 4-bit NF4 con double quantization (entrenamiento y carga); fp16 en computo |
| Idiomas soportados | ingles unicamente (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT); libreria peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only con atencion causal estandar y RoPE. La configuracion LoRA usa r=16, alpha=32, dropout=0,05 y se inserta en todas las proyecciones lineales (q, k, v, o, gate, up, down). El entrenamiento emplea QLoRA con cuantizacion 4-bit NF4, double quantization y fp16 en el computo, optimizador paged AdamW 8-bit, learning rate 0,0002 con scheduler cosine y 3 % de warm-up, batch efectivo de 16 (4 x 4), una epoca y longitud maxima de secuencia de 480 tokens. La perdida se calcula solo sobre los tokens del assistant, lo cual es coherente con el objetivo de generacion de respuestas y de salida JSON de enrutamiento.

Los datos provienen del Bitext Customer Support LLM Chatbot Training Dataset (CDLA-Sharing-1.0), limpiado y dividido con semilla 42, con particion estratificada 80/10/10 por intent y tres intents retenidos fuera del entrenamiento (check_invoice, review, switch_account). Aproximadamente el 20 % de los registros estan marcados con un system prompt separado para la tarea de enrutamiento, que produce JSON con las claves intent y category. El manifest de datos tiene hash `1182a97b9d392682e8dd80db916a5eb6103057d4752e1d66c79818cd83b67c46`, lo que permite verificar la reproducibilidad del split. No se documenta RLHF ni DPO; el ajuste es exclusivamente supervisado sobre instrucciones y respuestas.

## Capacidades

- Generacion de respuestas de atencion al cliente en ingles para un retailer ficticio (KharidiKart), con slots `{{placeholder}}` que deben rellenarse con datos externos.
- Enrutamiento de consultas a JSON estructurado con las claves intent y category, activado mediante un system prompt dedicado.
- Razonamiento de un paso sobre plantillas de soporte: clasificacion de intencion y redaccion de respuesta en la misma pasada.
- No dispone de tool calling nativo; la model card indica que los hechos deben venir de herramientas externas y ser verificados por un validador.
- No soporta vision, audio ni modos de pensamiento extendido.
- Multilingue limitado: solo ingles declarado; no se reportan capacidades en castellano ni en otros idiomas.
- No esta disenado para agentes multi-paso autonomos; el enrutamiento es una clasificacion de una sola llamada.

## Casos de uso

- Clasificacion de tickets entrantes: usar el system prompt de router para mapear cada consulta a intent y category antes de derivarla a un equipo humano o a un flujo automatico, con la ventaja de que la salida es JSON parseable y el modelo es lo bastante pequeno para correr en CPU o GPU consumer.
- Borrador de primera respuesta en helpdesk: generar una contestacion plantilla en ingles que un agente revise y complete con datos reales de pedido, sustituyendo los slots `{{placeholder}}` por valores obtenidos de la base de datos de pedidos.
- Prototipado rapido de asistentes verticales: servir como base para experimentar con QLoRA en dominios concretos antes de escalar a modelos mayores, dado que el repo pesa 0,1 GB y el entrenamiento cabe en una unica GPU consumer.
- Generacion de datasets sinteticos de soporte: usar el adaptador para producir variaciones de respuestas por intent que alimenten pipelines de evaluacion o aumenten datos de entrenamiento de otros sistemas.
- Enrutamiento en pipelines de moderacion o triaje: combinado con un validador externo, clasificar mensajes y descartar o escalar aquellos con intents de alto riesgo (facturacion, cancelaciones) antes de que lleguen a un LLM mayor y mas costoso.
- Evaluacion de tecnicas QLoRA en investigacion: reproducir el experimento con el manifest de datos y los hiperparametros publicados para comparar estrategias de adaptacion en tareas de clasificacion y generacion simultaneas.
- Demo educativa de soporte automatizado: montar una interfaz de chat que muestre la diferencia entre respuesta libre y salida JSON de enrutamiento, usando los dos system prompts del proyecto.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el split de test con decodificacion greedy:

| Config | Intent macro-F1 | BERTScore-F1 | ROUGE-L | Placeholder leakage % |
|---|---|---|---|---|
| B0 zero-shot | 0,501 | 0,874 | 0,214 | 9,4 |
| B1 few-shot | 0,615 | 0,887 | 0,267 | 21,1 |
| C2 (este adaptador) | 0,999 | 0,923 | 0,445 | 46,9 |

Resultados sobre intents retenidos (nunca vistos en entrenamiento), configuracion C2:

| Metrica | Valor |
|---|---|
| Intent macro-F1 | 0,348 |
| BERTScore-F1 | 0,898 |

La caida de macro-F1 de 0,999 a 0,348 entre intents vistos y retenidos indica un sobreajuste marcado al conjunto de etiquetas de entrenamiento. El incremento de placeholder leakage hasta 46,9 % confirma que el modelo tiende a reproducir slots sin rellenarlos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB con cuantizacion 4-bit NF4 del modelo base; en fp16 completo, unos 3-4 GB.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradas para inferencia.
- Cabe en GPU consumer: si, incluidas RTX 3050 8 GB, RTX 3060 12 GB y RTX 4060 8 GB; tambien en iGPU con suficiente memoria unificada mediante llama.cpp.
- Opciones de despliegue: transformers + peft con BitsAndBytesConfig (metodo documentado por el autor); vLLM y TGI son viables tras fusionar el adaptador con el modelo base; llama.cpp y Ollama requieren convertir el modelo fusionado a GGUF.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones de latencia ni tokens por segundo.
- Entrenamiento: QLoRA 4-bit con batch efectivo 16 y secuencia 480 cabe en una unica GPU consumer de 12-16 GB, aunque no se especifica el hardware usado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SahayakLLM (este adaptador) | 1,5B + 18,5M adaptador | 32.768 (base); 480 entrenamiento | QLoRA vertical de soporte e-commerce | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | 32.768 | Instrucciones generalistas | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen2.5-7B-Instruct | 7B | 32.768 | Instrucciones generalistas | Apache 2.0 | Hugging Face |
| Llama 3.2-1B-Instruct | 1B | 128.000 | Instrucciones generalistas | Llama 3.2 Community License | Hugging Face |

Frente al modelo base, este adaptador sacrifica generalidad a cambio de una especializacion fuerte en las etiquetas de Bitext: macro-F1 de 0,999 en intents vistos frente a 0,501 en zero-shot del base. Frente a Qwen2.5-7B-Instruct pierde capacidad general y contexto efectivo de entrenamiento, pero requiere una fraccion de la VRAM. Frente a Llama 3.2-1B-Instruct, la ventaja es la licencia Apache 2.0 sin restricciones de uso comercial adicionales y el contexto base de 32.768 tokens; la desventaja es la ausencia de pesos completos publicados y de soporte multilingue verificable. No se dispone de comparaciones directas con otros adaptadores de soporte al cliente en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado sobre dialogos sinteticos y plantillados de un retailer ficticio (KharidiKart); no validado con clientes reales.
- Las respuestas conservan slots `{{placeholder}}` en lugar de hechos reales; con 46,9 % de fuga en test, un validador externo es obligatorio en cualquier flujo de produccion.
- Puede inventar numeros de politica o condiciones si no recibe evidencia fundamentada; la model card lo advierte explicitamente.
- Sobreajuste severo a las etiquetas de entrenamiento: macro-F1 de 0,348 en intents retenidos frente a 0,999 en vistos.
- Solo ingles; no se declaran capacidades en castellano ni en otros idiomas, y no hay evaluacion multilingue.
- La lista de etiquetas de enrutamiento se pasa en el prompt; cambiar el catalogo de intents requiere reentrenamiento o al menos revalidacion.
- Modelo de 1,5B con cuantizacion 4-bit: no apto para produccion ni para asesoramiento medico, legal o financiero, segun el autor.
- Licencia Apache 2.0 sobre el adaptador, pero el dataset Bitext tiene licencia CDLA-Sharing-1.0, cuyos terminos deben revisarse antes de uso comercial derivado.
- Cero descargas y un unico like en Hugging Face: no hay evidencia de uso comunitario ni de validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/aryan22medigeri/llm-qwen2.5-1.5b-qlora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/bitext/Bitext-customer-support-llm-chatbot-training-dataset
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria bitsandbytes: https://github.com/bitsandbytes-foundation/bitsandbytes
- Repositorio del modelo base Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5: https://arxiv.org/abs/2412.15115
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Paper de QLoRA: https://arxiv.org/abs/2305.14314
