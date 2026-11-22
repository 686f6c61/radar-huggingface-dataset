# AiRukua/kilat-small-150M

## Resumen

Kilat SMALL 150M es un modelo de lenguaje base preentrenado desde cero por AiRukua, publicado en Hugging Face bajo licencia Apache 2.0. Con 150.950.244 parámetros totales (aproximadamente 151M) y 59,5M activos, se presenta como una propuesta de arquitectura híbrida y eficiente para generación de texto, entrenada sobre 10.000 millones de tokens del dataset FineWeb-Edu. Su relevancia radica en combinar tres mecanismos poco habituales en modelos de este tamaño: decaimiento exponencial global sub-cuadrático (atención lineal recurrente), Latent Multi-Head Attention (MLA) inspirada en DeepSeek-V2 y un Mixture of Experts fino al estilo DeepSeekMoE con ocho expertos enrutados, activación Top-2 y un experto compartido.

El modelo se distribuye como checkpoint base, no alineado para conversación ni ajustado por instrucciones, por lo que su uso previsto es la continuación de texto y como punto de partida para SFT, DPO o adaptación de dominio. La longitud de contexto es de 2.048 tokens y el vocabulario de 50.257 entradas. Está etiquetado únicamente para inglés y no incluye plantillas conversacionales como `<|user|>` o `<|assistant|>`.

Por su tamaño y su diseño de estado recurrente de tamaño constante, Kilat SMALL 150M resulta interesante para experimentación en entornos con recursos limitados y para estudiar arquitecturas híbridas eficientes. No obstante, al tratarse de un modelo base de 151M parámetros, sus capacidades de razonamiento, código y matemáticas son necesariamente limitadas en comparación con modelos mayores, y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kilat v2.0 Macro-Synergy: atención con decaimiento exponencial global sub-cuadrático (atención lineal recurrente) + Latent Multi-Head Attention (MLA) + DeepSeekMoE |
| Parametros totales | 150.950.244 (~151M) |
| Parametros activos | 59.510.784 (~59,5M) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `trust_remote_code=True` y código personalizado) |
| Vocabulario | 50.257 tokens |
| Tokens de entrenamiento | 10.000 millones (FineWeb-Edu) |
| Dataset | HuggingFaceFW/fineweb-edu |
| Pipeline | text-generation |
| Descargas en Hugging Face | 215 |
| Tamaño del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

Kilat SMALL 150M emplea la arquitectura propietaria Kilat v2.0 Macro-Synergy, que combina tres componentes. El primero es un mecanismo de decaimiento exponencial global sub-cuadrático, descrito como atención lineal recurrente que mantiene un estado recurrente de tamaño constante durante la inferencia autorregresiva; esto reduce el coste computacional frente a la atención cuadrática clásica en secuencias largas y permite un uso de memoria más predecible. El segundo es Latent Multi-Head Attention (MLA), una forma de compresión de las representaciones de clave y valor inspirada en DeepSeek-V2, que reduce el coste de almacenamiento de la caché KV. El tercero es una capa de feed-forward con Mixture of Experts fino al estilo DeepSeekMoE: ocho expertos enrutados, activación Top-2 y un experto compartido dedicado, lo que explica la diferencia entre los 151M parámetros totales y los 59,5M activos por token.

El entrenamiento se realizó desde cero sobre 10.000 millones de tokens del dataset FineWeb-Edu, un corpus de texto web de carácter educativo filtrado por calidad. La model card no documenta el uso de RLHF, DPO ni SFT en este checkpoint, que se distribuye explícitamente como modelo base preentrenado. Tampoco se detallan la composición exacta del dataset, la mezcla de idiomas, el número de pasos de entrenamiento, el hardware utilizado ni innovaciones adicionales como decodificación especulativa. La model card advierte de que la generación con decodificación greedy (`do_sample=False`) puede producir bucles de n-gramas repetitivos, y recomienda parámetros de muestreo concretos: temperatura 0,70–0,75, top-p 0,90–0,92, top-k 50, penalización por repetición 1,15–1,20 y `no_repeat_ngram_size=3`. El ejemplo de inferencia de la model card utiliza `use_cache=False`.

## Capacidades

- Generación de texto por continuación: el modelo completa textos a partir de un prefijo, sin plantillas conversacionales ni alineación por instrucciones.
- Predicción de siguiente token sobre vocabulario de 50.257 entradas, orientada a texto educativo en inglés.
- Razonamiento básico y conocimiento factual limitado al corpus FineWeb-Edu y al tamaño del modelo.
- Capacidad multilingüe: no soportada oficialmente; el modelo está etiquetado únicamente para inglés.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-step: no disponible; no se documenta soporte.
- Modo thinking, visión o audio: no disponible; el modelo es exclusivamente de texto.
- Base para ajuste fino: sirve como punto de partida para SFT, DPO y adaptación de dominio, según la model card.
- Inferencia con estado recurrente de tamaño constante gracias al componente de decaimiento exponencial global.

## Casos de uso

- Continuación de texto educativo: el modelo puede completar fragmentos sobre biología, informática, genética o física, como ilustran los ejemplos de la model card (fotosíntesis, algoritmos, diferencia entre ADN y ARN, mecánica newtoniana). Es adecuado porque fue preentrenado sobre FineWeb-Edu, un corpus de contenido educativo.
- Punto de partida para SFT: un equipo puede aplicar ajuste supervisado sobre el checkpoint base para construir un asistente especializado en un dominio concreto, aprovechando la licencia Apache 2.0 y el reducido coste de cómputo de un modelo de 151M parámetros.
- Adaptación de dominio mediante DPO: la model card identifica explícitamente DPO como técnica aplicable; el modelo puede alinearse con preferencias humanas sobre un conjunto de datos propio antes de desplegarse en una tarea concreta.
- Experimentación académica con arquitecturas híbridas: investigadores pueden estudiar el comportamiento de la combinación de atención lineal recurrente, MLA y MoE en un modelo pequeño, con un repositorio de 0,6 GB que cabe en una sola GPU de consumo.
- Generación de texto en entornos con recursos muy limitados: los 59,5M parámetros activos y el estado recurrente de tamaño constante permiten desplegar inferencia en hardware modesto, siempre que se acepte la ventana de contexto de 2.048 tokens.
- Prototipado rápido de pipelines de generación: con `transformers` y `trust_remote_code=True`, el modelo puede integrarse en prototipos de continuación de texto para validar prompts y parámetros de muestreo antes de escalar a modelos mayores.
- Filtrado o aumento de datos educativos: el modelo puede generar variaciones de texto sobre temas educativos en inglés para tareas de aumento de datos, con revisión humana posterior dada su tendencia a la repetición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en safetensors ocupa 0,6 GB; en bfloat16 los pesos de 151M parámetros requieren aproximadamente 0,3 GB, más el estado recurrente y las activaciones. En la práctica, cabe holgadamente en GPUs de consumo con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; el modelo se ejecuta en CPU con `torch.float32` según el ejemplo de la model card, y en GPU con `torch.bfloat16` y `device_map="auto"`.
- GPU de consumo: sí cabe en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores; también en GPUs de portátil con 4-6 GB de VRAM.
- Opciones de despliegue: la model card solo documenta `transformers` con `AutoModelForCausalLM`, `trust_remote_code=True` y `accelerate`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF publicados limita el despliegue en llama.cpp u Ollama sin conversión previa.
- Latencia y throughput: no disponibles; no se publican mediciones. El uso de `use_cache=False` en el ejemplo oficial sugiere que la caché KV estándar no se emplea, lo que puede afectar al rendimiento en generación larga.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Kilat SMALL 150M | ~151M | ~59,5M | 2.048 | Apache 2.0 | safetensors | Arquitectura híbrida con MLA y DeepSeekMoE; solo inglés; modelo base |
| GPT-2 small (referencia) | 124M | 124M | 1.024 | MIT | safetensors, GGUF | Transformer denso clásico; ampliamente soportado en llama.cpp y ecosistema |
| SmolLM-135M (referencia) | ~135M | ~135M | 2.048 | Apache 2.0 | safetensors, GGUF | Modelo base de Hugging Face; entrenado sobre corpus mayor; sin MoE |
| Qwen2.5-0.5B (referencia) | ~494M | ~494M | 32.768 | Apache 2.0 | safetensors, GGUF | Mayor tamaño y contexto; incluye variantes instruct; no directamente comparable por escala |

La comparativa se limita a referencias de la misma categoría de modelos pequeños; no se dispone de datos de benchmarks de Kilat SMALL 150M que permitan una comparación cuantitativa de rendimiento. Los datos de los modelos de referencia corresponden a sus especificaciones públicas habituales y no se han verificado en la información proporcionada para esta ficha.

## Limitaciones y advertencias

- Modelo base sin alineación: no está ajustado por instrucciones ni para conversación; los prompts con formato de chat pueden producir continuaciones inesperadas.
- Riesgo de repetición: la decodificación greedy puede generar bucles de n-gramas; la model card recomienda muestreo con temperatura 0,70–0,75, top-p 0,90–0,92, top-k 50 y penalización por repetición 1,15–1,20.
- Riesgo de alucinación: como todo modelo de lenguaje pequeño preentrenado sobre texto web, puede generar afirmaciones factualmente incorrectas con aparente fluidez.
- Limitación de idioma: solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Ventana de contexto corta: 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Capacidades limitadas por escala: con 59,5M parámetros activos, el razonamiento complejo, el código y las matemáticas avanzadas quedan fuera de su alcance previsible.
- Código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del modelo; conviene auditar el repositorio antes de usarlo en producción.
- Ecosistema limitado: no se documentan pesos GGUF ni compatibilidad con vLLM, llama.cpp, Ollama o TGI; el despliegue está ligado a `transformers`.
- Licencia Apache 2.0: permite uso comercial y modificación, pero no se documentan garantías ni cláusulas adicionales más allá de la licencia estándar.
- Sesgos: no se documentan evaluaciones de sesgo; el corpus FineWeb-Edu puede contener sesgos propios del texto web filtrado por criterios educativos.
- Madurez: el modelo tiene 215 descargas y 0 likes en el momento de la ficha, sin benchmarks publicados; su robustez en producción no está validada por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AiRukua/kilat-small-150M
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Referencia DeepSeek-V2 (MLA): no disponible en la información proporcionada
- Referencia DeepSeekMoE: no disponible en la información proporcionada
- Paper, blog o repositorio adicional del autor: no disponible en la información proporcionada
