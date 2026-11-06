# shambhuraje/qwen2.5-0.5b-instruct-fine-GGUF11

## Resumen

`qwen2.5-0.5b-instruct-fine-GGUF11` es un ajuste fino ligero del modelo Qwen2.5-0.5B-Instruct de Alibaba, publicado por el usuario shambhuraje en Hugging Face bajo licencia Apache 2.0. Se trata de un experimento de QLoRA de 4 bits sobre el dataset `yahma/alpaca-cleaned`, con solo 50 pasos de entrenamiento y un contexto de entrenamiento de 512 tokens, posteriormente convertido a formato GGUF con cuantización Q4_K_M (398 MB) para inferencia local con llama.cpp, Ollama y LM Studio.

El modelo resuelve el caso de uso de un asistente local extremadamente ligero que puede ejecutarse en CPU o en GPUs de gama baja con 4 GB de VRAM. Con 494.032.768 parámetros totales, hereda la arquitectura transformer decoder-only de la familia Qwen2.5 y el tokenizador de su modelo base, pero su entrenamiento adicional es marginal: aproximadamente 400 ejemplos vistos durante el ajuste, lo que supone una fracción mínima del dataset Alpaca.

Su relevancia es principalmente didáctica y práctica para entornos con recursos muy limitados. No compite en calidad con modelos mayores ni con el propio Qwen2.5-0.5B-Instruct sin ajustar, pero demuestra un flujo completo de fine-tuning con Unsloth y exportación a GGUF. El autor lo describe explícitamente como un experimento ligero, no como un modelo fuertemente optimizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens en entrenamiento; el modelo base soporta hasta 32.768 tokens, pero esta ficha no confirma el contexto efectivo tras el fine-tune |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Qwen2.5-0.5B-Instruct.Q4_K_M.gguf, 398 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de la familia Qwen2 con 494 millones de parametros, atención causal estándar y tokenizador BPE multilingüe. Sobre esa base se aplicó QLoRA de 4 bits (cuantización bnb-4bit del modelo base) mediante Unsloth Studio, con un dataset de instrucciones `yahma/alpaca-cleaned` en su split de entrenamiento.

Los hiperparámetros documentados son: 50 pasos de entrenamiento, batch size 2 con acumulación de gradiente 4 (batch efectivo 8), contexto de 512 tokens, learning rate 2e-4 y valores por defecto de Unsloth Studio. El entrenamiento se realizó en una NVIDIA GeForce RTX 2050 con 4 GiB de VRAM. Con 50 pasos y batch efectivo 8, el modelo vio aproximadamente 400 ejemplos, una fracción mínima del dataset. Posteriormente se fusionaron los adaptadores y se exportó a GGUF Q4_K_M. No se documenta uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto conversacional e instrucciones generales en inglés.
- Formato de respuesta estilo Alpaca (instrucción/respuesta) tras el ajuste.
- Ejecución en CPU y en GPUs de 4 GB de VRAM gracias a la cuantización Q4_K_M.
- Compatibilidad con llama.cpp, Ollama, LM Studio, Jan y llama-cpp-python.
- Soporte de chat completion mediante `create_chat_completion` en llama-cpp-python.
- Capacidad multilingüe limitada: la model card declara solo inglés, aunque el modelo base Qwen2.5 tiene tokenizador multilingüe.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Asistente local de bajo consumo: desplegado con Ollama en un portátil o mini-PC sin GPU dedicada, responde a instrucciones generales en inglés con latencia baja gracias a sus 398 MB en Q4_K_M.
- Prototipado rápido de pipelines de chat: sirve para validar integraciones con llama-cpp-python y la API de chat antes de migrar a un modelo mayor, ya que comparte interfaz con el resto de la familia Qwen2.5.
- Experimentación educativa con QLoRA: el repositorio documenta el flujo completo (Unsloth, dataset Alpaca, exportación GGUF), útil como plantilla para aprender fine-tuning de bajo coste.
- Generación de texto en dispositivos edge: su tamaño permite embeberlo en aplicaciones de escritorio o móviles con llama.cpp, aunque la calidad es limitada.
- Respuestas a instrucciones cortas y formateadas: tareas como resumir un párrafo, reformular una frase o generar listas simples en inglés.
- Pruebas de regresión de infraestructura: útil para verificar que un despliegue de llama.cpp u Ollama funciona correctamente antes de cargar modelos más pesados.
- Demo educativa en Spaces o notebooks: el autor menciona un Space de demostración, adecuado para mostrar inferencia local sin coste de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo "no ha sido evaluado en benchmarks formales" y que, con 50 pasos de entrenamiento, se espera un comportamiento cercano al modelo base con un sesgo hacia el formato Alpaca.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en Q4_K_M (archivo de 398 MB más overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con 4 GB o más; el autor entrenó en una RTX 2050 de 4 GiB. Funciona también en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna (GTX 1050 Ti en adelante, RTX 2050, RTX 3050, RTX 4060, etc.) e incluso en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ... --jinja`), Ollama (`ollama run hf.co/shambhuraje/qwen2.5-0.5b-instruct-fine-GGUF11:Q4_K_M`), LM Studio, Jan y llama-cpp-python.
- Latencia y throughput: no disponibles de forma medida; por el tamaño del modelo se espera decodificación en el orden de decenas de tokens por segundo en CPU moderna y muy superior en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este fine-tune (Q4_K_M) | 494 M | 512 en entrenamiento (base: 32.768) | Apache 2.0 | GGUF | 50 pasos de QLoRA sobre Alpaca; sin benchmarks |
| Qwen/Qwen2.5-0.5B-Instruct | 494 M | 32.768 | Apache 2.0 | safetensors, GGUF | Modelo base sin ajuste adicional; referencia de calidad |
| Qwen/Qwen2.5-1.5B-Instruct | 1.540 M | 32.768 | Apache 2.0 | safetensors, GGUF | Mayor calidad, requiere más VRAM |
| TinyLlama-1.1B-Chat | 1.100 M | 2.048 | Apache 2.0 | safetensors, GGUF | Alternativa de tamaño similar con contexto menor |

No se dispone de datos de benchmarks para comparar rendimiento numérico entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Con 0.5B parámetros, el modelo es débil en razonamiento multi-paso, matemáticas y recuperación de hechos.
- Riesgo alto de alucinación; no apto para consejo médico, legal o financiero.
- Entrenamiento muy corto (50 pasos, ~400 ejemplos) y contexto de entrenamiento de solo 512 tokens, lo que puede degradar el comportamiento en conversaciones largas.
- La cuantización Q4_K_M sacrifica algo de calidad a cambio de tamaño.
- Idioma declarado: solo inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y el modelo no ha sido evaluado formalmente.
- El repositorio tiene muy poca tracción (546 descargas, 1 like) y fue creado en noviembre de 2026; no hay evidencia de mantenimiento continuo.
- No soporta tool calling ni agentes de forma documentada; no debe asumirse compatibilidad con function calling del modelo base sin verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shambhuraje/qwen2.5-0.5b-instruct-fine-GGUF11
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Unsloth: https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Space de demostración (mencionado, no confirmado): https://huggingface.co/spaces/shambhuraje/qwen2.5-0.5b-demo
