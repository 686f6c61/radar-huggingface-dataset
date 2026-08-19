# joey00072/ohara-moe-0.9B-a91M-base-d12

## Resumen

ohara-moe-0.9B-a91M-base-d12 es un modelo de lenguaje de tipo mixture-of-experts (MoE) de grano fino, desarrollado por joey00072 como parte del proyecto ohara, una colección de implementaciones de modelos autorregresivos. Se trata de un modelo base preentrenado desde cero, no un modelo de chat, diseñado para continuar texto y servir como punto de partida para fine-tuning. Su principal innovación es una arquitectura MoE con 64 expertos enrutados más un experto compartido por capa, con routing top-4, que consigue una activación de solo 91M parámetros por token frente a los 911M totales, una esparsidad de 10x.

El modelo se entrenó en dos GPU A100 de 80GB con 1.48B tokens, y según el autor supera en calidad a un modelo denso de 162M y a un MoE 8x de 332M con la misma cantidad de cómputo, logrando una mejora del 4.5% en bits por byte. Su relevancia radica en demostrar que los MoE de grano fino con experto compartido y routing sin pérdida auxiliar pueden ser más eficientes por token que los densos, aunque a costa de mayor memoria total. Está pensado para investigación y experimentación con arquitecturas sparse, no para uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE de grano fino (64 expertos enrutados + 1 compartido, top-4) |
| Parametros totales | 911.298.048 (911M) |
| Parametros activos | 91M por token (10x esparsidad) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (solo safetensors en fp32 aparentemente) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo usa una arquitectura Transformer con 12 capas, dimensiones ocultas de 768 y 6 cabezas de atencion. Cada capa contiene 64 expertos enrutados y 1 experto compartido, con ancho de experto de 448 (SwiGLU). El routing selecciona los 4 mejores expertos por token mediante sigmoid gating con pesos normalizados, evitando el problema de que softmax sobre 64 logits produzca pesos muy pequenos. Para el balanceo de carga se emplea quantile balancing: la bias del router se resuelve en forma cerrada en cada paso del optimizador, sin necesidad de loss auxiliar ni coeficientes ajustables. El dispatch de expertos se realiza con `torch._grouped_mm`, un solo kernel para los 64 expertos sin bucles Python.

El entrenamiento se realizo desde cero con 1.48B tokens, usando el mismo schedule, learning rate y semilla que los modelos de comparacion (denso y MoE 8x). El vocabulario es de 50.304 tokens. El autor reporta que la ventaja sobre el denso crecio durante el entrenamiento (2.2% en el paso 250, 4.1% en el paso 2000) en lugar de saturarse, y que alcanzo la calidad final del denso en aproximadamente un 29% menos de pasos. No se menciona uso de RLHF ni DPO; es un preentrenamiento clasico.

## Capacidades

- Generacion de texto: continua texto de forma autoregresiva, sin capacidad de detenerse por si mismo ni de responder preguntas (es un modelo base).
- Razonamiento: no hay evidencia de capacidades de razonamiento mas alla de la continuacion estadistica de texto.
- Codigo: no se menciona entrenamiento especifico en codigo, aunque podria generar fragmentos si el texto de entrada lo sugiere.
- Matematicas: no hay datos especificos.
- Vision: no soporta entrada de imagenes.
- Tool calling / function calling: no soportado.
- Agentes y multi-step reasoning: no soportado.
- Multilingue: solo ingles.
- Capacidades especiales: ninguna adicional; es un modelo base puro.

## Casos de uso

- Fine-tuning para tareas especificas: al ser un modelo base, el caso principal es usarlo como punto de partida para entrenar modelos de chat o de tarea con datos propios. Su esparsidad permite que el fine-tuning sea mas eficiente por token que un denso equivalente.
- Investigacion en arquitecturas MoE: sirve para estudiar el comportamiento de routing con experto compartido, quantile balancing y sin loss auxiliar, comparando con otros disenos.
- Experimentos de escalado: su tamano reducido (911M totales) permite probar tecnicas de entrenamiento o de regularizacion en un entorno controlado antes de escalar a modelos mayores.
- Generacion de texto de baja latencia: con solo 91M parametros activos, la inferencia es rapida en CPU o GPU pequenas, aunque el contexto de 2048 limita su uso a fragmentos cortos.
- Pruebas de cuantizacion y compresion: al ser un MoE, se puede investigar como afecta la cuantizacion a los expertos y al router, aunque no hay cuantizaciones oficiales publicadas.
- Comparacion de eficiencia: permite medir la relacion entre parametros totales, activos y calidad, util para decidir si una arquitectura MoE compensa frente a una densa en un presupuesto de memoria dado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona metricas de validacion de preentrenamiento y de fine-tuning supervisado (SFT) comparando tres arquitecturas con los mismos tokens (1.48B), schedule, learning rate y semilla:

| Metrica | Denso 162M | MoE 8x top-2 332M | Este modelo (911M/91M) |
| --- | --- | --- | --- |
| Pretrain val bits/byte | 0.9062 | 0.8887 | 0.8652 |
| SFT val loss | 1.2084 | 1.1536 | 1.0824 |
| SFT val perplexity | 3.35 | 3.17 | 2.95 |
| SFT next-token accuracy | 69.40% | 70.40% | 71.73% |

El autor advierte que los FLOPs activos de la FFN son 1.094x los del denso (5 expertos activos x 448 vs denso 2048), por lo que parte de la mejora se debe a mayor computo, no solo a la arquitectura. Ademas, 911M parametros ocupan 5.6x la memoria del denso para 1.09x el computo.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 3.6GB, lo que sugiere pesos en fp32 (911M x 4 bytes ≈ 3.6GB). En fp16 serian ~1.8GB, en int8 ~0.9GB y en int4 ~0.45GB, pero no hay cuantizaciones oficiales publicadas.
- GPU recomendadas: al ser un modelo pequeno, cabe en cualquier GPU consumer con al menos 4GB de VRAM en fp32, y en 2GB si se cuantiza manualmente. Se entreno en 2xA100-80GB, pero para inferencia no se requieren.
- Si cabe en consumer GPU: si, en GPUs como RTX 3060, RTX 4060, etc., con suficiente VRAM.
- Opciones de despliegue: no hay soporte oficial para vLLM, llama.cpp, Ollama ni TGI. El modelo se carga mediante la libreria ohara (ver codigo de uso en la model card) o directamente con safetensors y una implementacion personalizada. No se proporcionan archivos GGUF ni ONNX.
- Latencia y throughput: no hay datos oficiales. Dado que solo se activan 91M parametros por token, la latencia deberia ser baja, pero depende del hardware y de la implementacion del grouped_mm.

## Comparativa con modelos similares

El autor compara este modelo con dos arquitecturas del mismo proyecto, entrenadas con los mismos datos y configuracion:

| Modelo | Parametros totales | Parametros activos | Contexto | Pretrain bits/byte | Licencia |
| --- | --- | --- | --- | --- | --- |
| ohara-moe-0.9B-a91M-base-d12 | 911M | 91M | 2048 | 0.8652 | MIT |
| ohara-moe-chat-d12 (MoE 8x) | 332M | 85M | 2048 | 0.8887 | MIT |
| ohara-chat-d12 (denso) | 162M | 162M | 2048 | 0.9062 | MIT |

No se dispone de comparaciones con modelos externos de la misma categoria (por ejemplo, SmolLM-135M, Qwen2.5-0.5B, etc.) en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base, no un chat: no responde preguntas, no sigue instrucciones y no tiene criterio de parada. Usarlo directamente en aplicaciones de conversacion dara resultados pobres.
- Contexto limitado a 2048 tokens, insuficiente para tareas que requieran contexto largo.
- Solo soporta ingles; no hay datos sobre rendimiento en otros idiomas.
- No se han publicado cuantizaciones oficiales; el unico formato disponible es safetensors en fp32, lo que limita su despliegue en entornos con poca memoria.
- El archivo `config.json` es critico: contiene `moe_experts_per_tok` y `moe_gate_fn`, que no dejan rastro en las formas de los tensores. Si se carga sin ese config, los pesos se cargan correctamente pero el routing difiere del entrenado, produciendo resultados incorrectos.
- El autor advierte que la ventaja en bits/byte se debe en parte a un 9.4% mas de FLOPs activos que el denso, y que el modelo ocupa 5.6x mas memoria que el denso. No es una victoria gratuita.
- No hay benchmarks estandar publicados (MMLU, HumanEval, etc.), por lo que no se puede comparar directamente con otros modelos en tareas conocidas.
- Al ser un modelo de investigacion, no hay garantias de robustez, sesgos o seguridad. No se ha evaluado su comportamiento en escenarios de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joey00072/ohara-moe-0.9M-a91M-base-d12 (nota: el ID original es joey00072/ohara-moe-0.9B-a91M-base-d12, pero la URL proporcionada en la informacion es esa; se recomienda verificar)
- Repositorio ohara en GitHub: https://github.com/joey00072/ohara
- Implementacion del modulo MoE: https://github.com/joey00072/ohara/blob/master/ohara/modules/moe.py
- Version chat del modelo: https://huggingface.co/joey00072/ohara-moe-0.9B-a91M-chat-d12
- Modelo denso chat relacionado: https://huggingface.co/joey00072/ohara-chat-d12
- Modelo MoE 8x chat relacionado: https://huggingface.co/joey00072/ohara-moe-chat-d12
