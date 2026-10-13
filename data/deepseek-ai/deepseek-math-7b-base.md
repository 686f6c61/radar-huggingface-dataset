# deepseek-ai/deepseek-math-7b-base

## Resumen

DeepSeekMath-7B-Base es un modelo de lenguaje de 7.000 millones de parámetros desarrollado por DeepSeek-AI y publicado el 5 de febrero de 2024 junto con el artículo técnico "DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models" (arXiv:2402.03300). Se inicializa a partir de los pesos de DeepSeek-Coder-Base-v1.5 7B y se entrena con un corpus adicional de 120.000 millones de tokens de contenido matemático extraído de Common Crawl, sobre un total de 500.000 millones de tokens. El resultado es uno de los modelos abiertos de referencia en razonamiento cuantitativo dentro de la franja de 7B.

Se trata de un modelo "base", no afinado por instrucciones: su interfaz natural es la compleción de texto con prompting few-shot, y está pensado como punto de partida para ajuste fino supervisado o para etapas posteriores de optimización por refuerzo. Su relevancia actual es doble: por un lado, demostró que un modelo abierto de 7B puede competir con modelos mucho mayores en tareas matemáticas; por otro, su artículo introduce GRPO (Group Relative Policy Optimization), la técnica de RL que después se popularizó en la familia DeepSeek.

La licencia es la propia de DeepSeek (license: other, license_name: deepseek) y admite uso comercial. El repositorio ocupa 27,6 GB y distribuye los pesos en formato safetensors para su carga directa con transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de DeepSeek-Coder-Base-v1.5 7B) |
| Parámetros totales | 7.000 millones (7B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | No especificados en la model card; los pesos safetensors admiten cuantización con herramientas estándar (bitsandbytes 8/4 bits, GPTQ, AWQ, GGUF) |
| Idiomas soportados | No disponible en la model card; el entrenamiento se centra en inglés (matemáticas, código y texto general) |
| Licencia | DeepSeek Model License (license: other, license_name: deepseek); permite uso comercial |
| Formato de pesos | safetensors (repositorio de 27,6 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo autoregresivo, heredada directamente de DeepSeek-Coder-Base-v1.5 7B, lo que implica un tokenizador y una configuración de atención ya validados para código y texto técnico. El entrenamiento continúa desde ese checkpoint con un corpus mixto de matemáticas, código y lenguaje natural. El componente diferencial es el corpus matemático: 120.000 millones de tokens procedentes de Common Crawl, filtrados y deduplicados mediante un pipeline específico que selecciona páginas con notación matemática, fórmulas y razonamiento cuantitativo, dentro de un volumen total de 500.000 millones de tokens vistos durante el entrenamiento.

El modelo base no incorpora RLHF ni DPO; la alineación por preferencias se aplica en las variantes DeepSeekMath-7B-Instruct y DeepSeekMath-7B-RL, también publicadas. La innovación técnica principal del artículo es GRPO, un algoritmo de optimización por refuerzo que estima la línea base a partir de un grupo de respuestas muestreadas en lugar de mantener un modelo crítico separado, lo que reduce el coste de memoria del entrenamiento con RL. GRPO se aplica sobre las variantes Instruct y RL, no sobre este checkpoint base.

## Capacidades

- Generación de texto y compleción autoregresiva con `AutoModelForCausalLM` y `generate()`.
- Razonamiento matemático: aritmética, álgebra, cálculo, geometría y problemas de varios pasos, especialmente con prompting few-shot de cadena de pensamiento (CoT).
- Generación de fragmentos de código, capacidad heredada del checkpoint DeepSeek-Coder del que parte.
- Razonamiento simbólico en formato LaTeX, útil para producir soluciones con notación formal.
- No dispone de tool calling ni function calling nativo: es un modelo base sin plantilla de herramientas.
- No soporta flujos de agente ni razonamiento multi-paso orquestado de forma nativa; cualquier uso agéntico requiere envoltorio externo y, previsiblemente, ajuste fino.
- Capacidades multilingües no documentadas; el entrenamiento está orientado al inglés.
- Sin capacidades de visión, audio ni multimodalidad: únicamente texto.
- Sin modo "thinking" explícito ni tokens de razonamiento dedicados; la cadena de pensamiento se induce por prompt.

## Casos de uso

- Ajuste fino supervisado para asistentes matemáticos: el checkpoint base es el punto de partida natural para SFT con pares pregunta-solución, ya que no arrastra sesgos de formato conversacional y admite plantillas propias.
- Generación de datos sintéticos para destilación: producir soluciones paso a paso en gran volumen para entrenar modelos mayores o construir datasets de razonamiento matemático verificables.
- Plataformas educativas de resolución de problemas: con prompting few-shot CoT puede generar soluciones explicadas paso a paso, que después se validan con un motor simbólico antes de mostrarlas al estudiante.
- Investigación en aprendizaje por refuerzo: el artículo lo posiciona como base para aplicar GRPO sobre recompensas verificables, un caso de uso habitual en entornos de investigación con recursos limitados.
- Evaluación de pipelines matemáticos: sirve como referencia de control al comparar tokenizadores, estrategias de prompting o técnicas de verificación, al ser un modelo pequeño y reproducible.
- Preprocesado y normalización de contenido técnico: extracción y reformulación de fórmulas, pasos de demostración y notación LaTeX en corpus científicos.
- Tutoría automática con verificación externa: el modelo propone la traza de solución y un verificador (por ejemplo, un intérprete de Python o SymPy) comprueba el resultado final antes de devolverlo.
- Prototipado en local: al caber en una GPU de consumo con cuantización de 4 bits, permite experimentar con razonamiento matemático sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información proporcionada. El artículo asociado (arXiv:2402.03300) incluye evaluaciones del modelo base y de sus variantes afinadas en conjuntos como GSM8K, MATH, CMATH, AGIEval o SAT, pero las cifras concretas no forman parte de la documentación facilitada, por lo que no se reproducen aquí.

| Benchmark | Área | Resultado de DeepSeekMath-7B-Base |
|---|---|---|
| GSM8K | Problemas de primaria (inglés) | No disponible en la información proporcionada |
| MATH | Competición matemática (inglés) | No disponible en la información proporcionada |
| CMATH | Problemas de primaria (chino) | No disponible en la información proporcionada |
| AGIEval | Razonamiento general (inglés/chino) | No disponible en la información proporcionada |
| SAT | Razonamiento cuantitativo | No disponible en la información proporcionada |

## Requisitos de hardware

- Inferencia en bfloat16 o float16: aproximadamente 15 GB de VRAM, contando pesos (14 GB) más caché KV y activaciones con contexto de 4.096 tokens.
- Inferencia en float32: aproximadamente 28 GB de VRAM.
- Cuantización de 8 bits: aproximadamente 8-9 GB de VRAM.
- Cuantización de 4 bits (GPTQ, AWQ o GGUF Q4): aproximadamente 4-5 GB de VRAM.
- GPUs recomendadas para precisión completa: A100 40/80 GB, H100 o L40S. Con bfloat16 también cabe en una RTX 4090 de 24 GB.
- GPU de consumo: sí, cabe en RTX 4090, RTX 3090, RTX 4080 y similares sin cuantizar; con cuantización de 4 bits funciona en tarjetas de 8-12 GB como la RTX 3060 o la RTX 4060 Ti.
- Opciones de despliegue: transformers, vLLM, TGI (el repositorio declara soporte de text-generation-inference) y llama.cpp u Ollama mediante conversiones GGUF de terceros. El modelo está marcado como compatible con endpoints y con despliegue en Azure.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Uso comercial |
|---|---|---|---|---|---|
| DeepSeekMath-7B-Base | 7B | 4.096 tokens | Base | DeepSeek Model License | Sí |
| DeepSeekMath-7B-Instruct | 7B | 4.096 tokens | Instruct | DeepSeek Model License | Sí |
| MetaMath-Mistral-7B | 7B | No disponible | Instruct | Apache-2.0 | Sí |
| WizardMath-7B-v1.1 | 7B | No disponible | Instruct | Llama 2 | Sí, con restricciones de la licencia Llama 2 |

La comparación de rendimiento entre estos modelos no puede establecerse con los datos disponibles en esta ficha: las cifras publicadas proceden de configuraciones de evaluación distintas (prompting few-shot, CoT, uso de herramientas) y no son directamente equiparables sin consultar cada artículo original.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones de forma fiable ni mantiene formatos conversacionales. Usarlo como chatbot sin ajuste previo produce resultados pobres.
- Riesgo alto de alucinación en problemas largos: puede generar pasos intermedios plausibles pero incorrectos, con errores aritméticos o algebraicos difíciles de detectar sin verificación externa.
- El sesgo de entrenamiento está muy inclinado hacia matemáticas e inglés; el rendimiento en conversación general, redacción, traducción u otras lenguas no está documentado y previsiblemente es limitado.
- Ventana de contexto de 4.096 tokens: insuficiente para demostraciones extensas, documentos largos o razonamiento con muchas iteraciones.
- Sin guardarraíles ni alineación: al ser un checkpoint base no incorpora filtros de seguridad ni rechazo de peticiones dañinas.
- Licencia DeepSeek Model License: permite uso comercial según la model card, pero los términos completos deben revisarse en el enlace de licencia del repositorio antes de un despliegue en producción.
- Corpus procedente de Common Crawl: existe riesgo de que el material de entrenamiento incluya contenido con derechos de autor, lo que exige revisión legal según el caso de uso.
- Antigüedad: publicado en febrero de 2024, ha sido superado por modelos matemáticos posteriores de tamaño similar, tanto de la propia DeepSeek como de otros laboratorios.
- No hay cuantizaciones GGUF oficiales en el repositorio; las disponibles son conversiones de la comunidad y pueden degradar ligeramente la precisión matemática.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/deepseek-ai/deepseek-math-7b-base
- Artículo técnico (PDF): https://arxiv.org/pdf/2402.03300.pdf
- Repositorio GitHub de DeepSeek-Math: https://github.com/deepseek-ai/DeepSeek-Math
- Licencia del modelo: https://github.com/deepseek-ai/DeepSeek-Math/blob/main/LICENSE-MODEL
- Página principal de DeepSeek: https://www.deepseek.com/
- Plataforma de API: https://www.deepseek.com/en/platform/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organización en GitHub: https://github.com/deepseek-ai
- Servidor de Discord: https://discord.gg/Tc7c45Zzu5
- Contacto del equipo: service@deepseek.com
