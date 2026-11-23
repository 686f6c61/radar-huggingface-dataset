# nace-ai/Qwen3.8-Flash-Next-MLX-Q4-KQuant

## Resumen

Qwen3.8-Flash-Next-MLX-Q4-KQuant es una cuantización de 4 bits en formato MLX del modelo multimodal Qwen3.8-Flash-Next de Qwen (Alibaba), publicada por el usuario nace-ai. El paquete está pensado específicamente para Macs con Apple Silicon y ocupa 107,6 GB en disco, lo que lo sitúa en el rango de equipos con 192 GB de memoria unificada o superior. El modelo base es un transformer multimodal de tipo image-text-to-text con 180 mil millones de parámetros totales, según los safetensors del repositorio.

La aportación principal de esta ficha no es el modelo base, sino la técnica de cuantización: el autor reporta una divergencia KL de 0,067 respecto al modelo original en BF16, frente a 0,249 del empaquetado 4-bit de mlx-community, con 5,4 GB menos de peso en el modelo de lenguaje (105,20 GB frente a 110,62 GB). Es decir, se presenta como una cuantización de 4 bits más fiel y más compacta que la alternativa pública de referencia para MLX.

El modelo es relevante ahora porque permite ejecutar localmente en hardware de consumo de gama alta (Mac Studio, MacBook Pro con memoria unificada grande) un modelo multimodal de 180B con modo de razonamiento, tool calling y API compatible con OpenAI, Anthropic y Ollama a través del motor Kapitsa del mismo autor. La licencia es qwen-community-1.0, que conviene revisar antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parámetros totales | 179.999.981.459 (180B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada; la model card menciona hasta 32.768 tokens de salida con razonamiento activado |
| Tipos de cuantización | 4 bits en grupos de 64, con 696 módulos a 8 bits (grupos de 64 o 128); empaquetado MLX Q4 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license_name: qwen-community-1.0, license: other) |
| Formato de pesos | safetensors (MLX), 107,6 GB de descarga; repositorio total de 179,1 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer multimodal que acepta imagen y texto como entrada y genera texto, con un modo de razonamiento ("thinking") activado por defecto. La model card del paquete cuantizado no detalla la arquitectura interna del modelo base (número de capas, tipo de atención, composición del dataset de entrenamiento, uso de RLHF o DPO), por lo que esos datos no están disponibles en la información proporcionada. El tag `qwen4_exp` sugiere una arquitectura experimental de la familia Qwen, pero no se especifica más.

La innovación técnica destacable de este repositorio es el esquema de cuantización: 4 bits en grupos de 64 con 696 módulos elevados a 8 bits, lo que el autor denomina "KQuant". El resultado reportado es una KL de 0,067 frente al BF16 original, muy inferior a la del empaquetado 4-bit de mlx-community (0,249), con menor tamaño de pesos del modelo de lenguaje. El autor incluye una gráfica comparativa de KL frente a tamaño de archivo con puntos de TensorFold, mlx-community y Nace. No se documentan detalles sobre el proceso de calibración ni el conjunto de datos usado para medir la KL.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text).
- Modo de razonamiento ("thinking") activado por defecto, con profundidad configurable mediante `reasoning_effort` (`low`, `medium`, `xhigh`) y desactivación mediante `enable_thinking: false` o `reasoning_effort: "none"`.
- Tool calling / function calling con definiciones de herramientas en formato OpenAI; la model card demuestra un ciclo completo con el SDK de OpenAI contra `kapitsa serve`.
- Razonamiento matemático básico (el ejemplo de la model card usa 17 × 23).
- Servicio mediante APIs compatibles con OpenAI, Anthropic y Ollama a través de Kapitsa.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local en Mac de gama alta: con 107,6 GB de pesos y una regla de encaje de 192 GB de RAM o más, se puede servir un chat privado con razonamiento y contexto largo sin enviar datos a la nube, usando `kapitsa serve --private`.
- Análisis de imágenes con descripción y preguntas: al ser un modelo image-text-to-text, permite subir una imagen y hacer preguntas sobre ella en local, útil para inspección de documentos, capturas o fotografías sin conexión.
- Automatización de flujos con herramientas: el soporte de tool calling en formato OpenAI permite conectar el modelo a funciones externas (clima, bases de datos, APIs internas) y orquestar llamadas en varios pasos desde un script Python con el SDK de OpenAI.
- Sustitución de API en prototipos: al exponer endpoints compatibles con OpenAI, Anthropic y Ollama, se puede apuntar código existente a `http://127.0.0.1:8000/v1` sin reescribir la lógica de la aplicación, útil para desarrollo y pruebas offline.
- Razonamiento profundo con control de coste: el parámetro `reasoning_effort` permite ajustar la profundidad de razonamiento entre `low`, `medium` y `xhigh`, de modo que tareas simples no consuman la ventana de 32.768 tokens de salida y las complejas sí.
- Investigación sobre cuantización: el repositorio sirve como referencia práctica para estudiar el impacto de esquemas de cuantización mixtos (4 bits con módulos a 8 bits) midiendo la KL frente al BF16, con una comparativa directa contra mlx-community y TensorFold.
- Evaluación de modelos multimodales en Apple Silicon: permite a investigadores probar un modelo de 180B en hardware local y comparar su comportamiento frente a alternativas servidas en cloud.

## Benchmarks y rendimiento

La información proporcionada no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). El único dato cuantitativo publicado es la divergencia KL frente al modelo BF16 original:

| Empaquetado | KL frente a BF16 | Peso del modelo de lenguaje |
|---|---|---|
| Nace Q4 (este repositorio) | 0,067 | 105,20 GB |
| mlx-community 4-bit | 0,249 | 110,62 GB |

El autor también menciona TensorFold 4-bit y TensorFold oQ4-MTP en la gráfica comparativa, pero no se aportan sus valores numéricos en el texto disponible. No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- VRAM / memoria unificada: el autor indica que el paquete encaja en Macs con 192 GB de RAM o más como regla aproximada (descarga de 107,6 GB más 2 GB para una conversación, con la cuota de GPU por defecto de macOS). Kapitsa puede encajar en un tamaño inferior porque omite las partes que no usa; `kapitsa doctor` comprueba el equipo concreto.
- GPU recomendadas: Apple Silicon con memoria unificada grande (Mac Studio, MacBook Pro de gama alta). La verificación de release se ejecutó en CUDA con una NVIDIA H200, pero no se ha probado en un Mac según la model card.
- GPU de consumo: no cabe en tarjetas consumer convencionales (RTX 4090 de 24 GB, etc.) por el tamaño de los pesos. En Apple Silicon, requiere equipos de 192 GB o más.
- Opciones de despliegue: mlx-vlm 0.7.8 con MLX 0.32.4 (probado por el autor en CUDA); Kapitsa 0.2.36 (sirve la revisión anterior `8fda1047`, no los archivos de `Q4/`; el soporte de `Q4/` llegará en una versión posterior); mlx-lm 0.32.2 no puede cargar esta arquitectura todavía y otras aplicaciones MLX no fueron probadas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | KL vs BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nace Qwen3.8-Flash-Next-MLX Q4 | 180B | no disponible | 4-bit MLX (KQuant) | 0,067 | qwen-community-1.0 | Hugging Face, MLX |
| mlx-community 4-bit (Qwen3.8-Flash-Next) | 180B (mismo base) | no disponible | 4-bit MLX | 0,249 | qwen-community-1.0 | Hugging Face, MLX |
| TensorFold 4-bit (Qwen3.8-Flash-Next) | 180B (mismo base) | no disponible | 4-bit | no disponible en el texto | qwen-community-1.0 | Hugging Face, MLX |
| TensorFold oQ4-MTP (Qwen3.8-Flash-Next) | 180B (mismo base) | no disponible | 4-bit | no disponible en el texto | qwen-community-1.0 | Hugging Face, MLX |

Las tres alternativas comparadas son cuantizaciones del mismo modelo base, por lo que la comparación relevante es la fidelidad de la cuantización y el tamaño resultante, no las capacidades del modelo. No se dispone de datos para comparar con modelos de otras familias o tamaños.

## Limitaciones y advertencias

- El paquete está pensado para Apple Silicon; la verificación de release se hizo en CUDA con una H200 y no se ha ejecutado en un Mac, según la propia model card.
- mlx-lm 0.32.2 no puede cargar esta arquitectura y otras aplicaciones MLX no fueron probadas; el ecosistema de herramientas compatible es limitado.
- Kapitsa 0.2.36 sirve únicamente la revisión anterior `8fda1047`, no los archivos de `Q4/`; el soporte completo llegará en una versión posterior.
- El tamaño de 107,6 GB exige equipos con 192 GB de memoria unificada o más; no es viable en GPUs de consumo.
- La licencia qwen-community-1.0 es de tipo "other" y debe revisarse antes de cualquier uso comercial; no se detallan aquí sus restricciones.
- No se dispone de información sobre sesgos, tasas de alucinación ni limitaciones idiomáticas del modelo base en la documentación proporcionada.
- La métrica de calidad publicada es la KL frente a BF16, que mide fidelidad de la cuantización, no calidad absoluta del modelo en tareas.
- El modelo piensa antes de responder por defecto, lo que consume tokens de salida (hasta 32.768 en tareas con razonamiento); conviene desactivarlo o ajustar `reasoning_effort` para reducir coste.
- El autor recomienda mantener `repetition_penalty` en 1.0 y ajustar `temperature`, `top_p`, `top_k`, `min_p` y `presence_penalty` según el modo (thinking o sin thinking).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX-Q4-KQuant
- Repositorio del paquete MLX (raíz): https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Buenas prácticas del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next#best-practices
- Motor Kapitsa (GitHub): https://github.com/nace-ai/kapitsa
- Revisión anterior servida por Kapitsa 0.2.36: https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX/tree/8fda104737236c4bbe1d6fb2784fb499ffd0a4cd
- Assets de la model card (gráfica KL): https://huggingface.co/nace-ai/Qwen3.8-Flash-Next-MLX/resolve/main/assets/nace-dark.svg
