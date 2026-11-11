# nace-ai/Qwen3.5-9B-MLX-q4-KQuant

## Resumen

Qwen3.5-9B-MLX-q4-KQuant es una cuantización de 4 bits del modelo base Qwen/Qwen3.5-9B, publicada por nace-ai mediante su framework de cuantización KQuant v0.2. El pack contiene 9.409.813.744 parámetros totales y está empaquetado específicamente para MLX, la librería de Apple para ejecutar modelos en silicio unificado (chips M-series). El objetivo es ofrecer una versión del modelo base que quepa en memoria de equipos Apple con recursos limitados sin renunciar en exceso a la fidelidad respecto al modelo en bf16.

El modelo es multimodal de tipo image-text-to-text: conserva la torre de visión del modelo base, fijada por hash (333 tensores, 912.020.960 bytes), además de los pesos del modelo de lenguaje. La cuantización deja los pesos del LM en 5,29 GB con una media de 4,726 bits por peso, lo que sitúa el repositorio completo en 6,2 GB distribuidos en tres ficheros safetensors.

La relevancia de esta ficha es doble: por un lado, documenta una ruta práctica para desplegar un modelo de 9B multimodal en hardware de consumo Apple; por otro, introduce el método KQuant, que ajusta cada grupo de pesos contra el comportamiento del modelo en texto real (distribuciones de siguiente token) en lugar de minimizar únicamente el error sobre los pesos. El autor reporta una divergencia KL de 0,0301 en texto original y 0,1038 en texto de chat y tool-calls frente al modelo bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con torre de visión; detalles de la arquitectura del LM no disponibles en la informacion proporcionada |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (KQuant v0.2 Q4), media de 4,72622 bits por peso |
| Idiomas soportados | en (segun la model card y los tags) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 3 ficheros, 6.201.878.976 bytes en total |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo desde cero: es un proceso de cuantización post-entrenamiento sobre Qwen/Qwen3.5-9B. La arquitectura subyacente es la del modelo base, un transformer multimodal con torre de visión que procesa entradas de imagen y texto. La model card no detalla la composición del dataset de entrenamiento del modelo base, el número de tokens, ni si se aplicaron fases de RLHF o DPO; esos datos corresponden a la documentación de Qwen/Qwen3.5-9B, que no se incluye en la información proporcionada.

La innovación técnica destacable es KQuant: en lugar de optimizar cada grupo de pesos solo contra los valores numéricos de los pesos originales, el framework ajusta la cuantización contra el comportamiento del modelo sobre texto real, midiendo la divergencia de las distribuciones de siguiente token respecto al modelo bf16. El autor reporta la evaluación sobre 32.704 tokens de texto original y 65.472 tokens de chat y tool-calls. El pack conserva el tokenizador del modelo base byte a byte, junto con su plantilla de chat, y se ejecuta con mlx 0.32.4, mlx-lm 0.32.2, transformers 5.22.2 y numpy 2.5.4 sobre una NVIDIA H200 de 151 GB durante el proceso de generación y validación.

## Capacidades

- Generación de texto conversacional y continuaciones de texto libre.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text), heredado de la torre de visión del modelo base.
- Soporte de tool calling / function calling: la model card reporta 20 de 20 pruebas de ida y vuelta con thinking desactivado que colocaron la llamada y completaron el ciclo.
- Plantilla de chat compatible con el modelo base, incluida en el pack.
- Capacidades de razonamiento y código del modelo base: no detalladas explícitamente en la información proporcionada, pero inherentes a un modelo Qwen3.5 de 9B.
- Capacidades multilingües: limitadas a inglés según la model card y los tags; no se declaran otros idiomas.

## Casos de uso

- Inferencia local en equipos Apple: el pack está pensado para MLX y ocupa 6,2 GB, por lo que puede ejecutarse en Macs con memoria unificada de 16 GB o más, permitiendo prototipado y uso personal sin GPU dedicada.
- Asistentes conversacionales en local: la plantilla de chat y la fidelidad medida en texto de chat (KL 0,1038) lo hacen adecuado para dialogar en inglés con contexto multi-turno, siempre que el contexto requerido quepa en la ventana del modelo base.
- Automatización con tool calling: las 20 pruebas de ida y vuelta con llamadas a herramientas sugieren que puede integrarse en flujos de agente simples que invoquen APIs o funciones externas.
- Procesamiento de documentos con imagen: al conservar la torre de visión, puede describir o extraer información de imágenes y capturas en pipelines de documentación o accesibilidad.
- Evaluación de cuantizaciones: sirve como referencia práctica para comparar KQuant frente a otros packs MLX del mismo modelo base, usando las métricas KL publicadas y el fichero results.json.
- Desarrollo y pruebas offline: al ser un pack MLX autónomo con licencia Apache 2.0, es apto para entornos de desarrollo sin conexión o con requisitos de privacidad, donde los datos no deben salir del equipo.

## Benchmarks y rendimiento

| Metrica | KQuant (este repo) | Tokens evaluados |
|---|---:|---:|
| KL frente al modelo bf16, texto original (menor es mejor) | 0,0301 | 32.704 |
| KL frente al modelo bf16, texto de chat y tool-calls (menor es mejor) | 0,1038 | 65.472 |
| Pruebas de tool calling con thinking off | 20/20 completadas | 20 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las cifras anteriores miden fidelidad de la cuantización respecto al modelo base, no capacidad absoluta del modelo.

## Requisitos de hardware

- VRAM/memoria estimada: 6,2 GB de pesos en total (5,29 GB del LM más 0,91 GB de la torre de visión); el consumo real en ejecución es superior por el estado de activaciones y caché KV, no cuantificado en la información disponible.
- GPU recomendadas: el pack es MLX, por lo que el hardware objetivo son chips Apple M-series con memoria unificada; el proceso de generación del pack se realizó en una NVIDIA H200 de 151 GB, pero esa GPU no es el destino de ejecución del formato MLX.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí: encaja en equipos con 16 GB o más de memoria unificada. Para GPUs NVIDIA de consumo no es el formato adecuado; haría falta una conversión a GGUF u otro runtime.
- Opciones de despliegue: mlx-lm (comando `mlx_lm.generate`), con mlx 0.32.4 y mlx-lm 0.32.2 como versiones de referencia. No se documentan otras rutas (vLLM, llama.cpp, Ollama, TGI) para este pack.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-MLX-q4-KQuant (este) | 9,41B | no disponible | 4 bits KQuant (4,726 bpw) | apache-2.0 | MLX, 6,2 GB |
| Qwen/Qwen3.5-9B (base) | 9,41B | no disponible | bf16 | apache-2.0 | Transformers, pesos completos |
| Otros packs MLX de Qwen3.5-9B | 9,41B | no disponible | 4 bits (distintos metodos) | apache-2.0 (presumible) | MLX; métricas KL en el gráfico del autor |

La model card incluye un gráfico que compara este pack con otros packs MLX de Qwen3.5-9B en ejes de KL frente al modelo bf16 y tamaño de pesos, pero los valores numéricos de esos packs comparativos no se detallan en la información proporcionada. No se dispone de datos de benchmarks de capacidad para establecer comparaciones de rendimiento con alternativas de otros fabricantes.

## Limitaciones y advertencias

- La cuantización introduce degradación: la KL de 0,1038 en texto de chat y tool-calls es sustancialmente mayor que la de 0,0301 en texto original, lo que sugiere mayor desviación en conversaciones y llamadas a herramientas.
- Idioma: solo se declara inglés; el uso en castellano u otros idiomas no está validado y puede degradar la calidad.
- Longitud de contexto no documentada en este repositorio; debe consultarse la ficha del modelo base para planificar cargas de contexto largo.
- Riesgo de alucinación inherente al modelo base; la cuantización puede amplificarlo en tareas de razonamiento o tool calling.
- Sesgos: no se documentan evaluaciones de sesgo en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.5-9B, de la que se hereda.
- El pack está atado al ecosistema MLX; no es directamente utilizable en runtimes CUDA sin conversión.
- Las métricas de calidad provienen de la propia ejecución de validación del autor (results.json); no hay validación independiente publicada.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin adopción comunitaria verificable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-q4-KQuant
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Resultados de la ejecución de validación: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-q4-KQuant/blob/main/results.json
- Datos del gráfico KL vs tamaño: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-q4-KQuant/blob/main/assets/kl-vs-size-data.json
- Gráfico KL vs tamaño: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-q4-KQuant/blob/main/assets/kl-vs-size.svg
