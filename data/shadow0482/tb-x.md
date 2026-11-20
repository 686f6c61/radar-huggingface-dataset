# Shadow0482/tb-x

## Resumen

TB-X es una conversión a formato GGUF del modelo Mythos Nano (`orangejuicesmith/Mythos-Nano-safetensor`), publicada por el usuario Shadow0482. Se trata de un modelo de generación de texto con arquitectura Qwen2 y 3.085.938.688 parámetros totales (aproximadamente 3,09 mil millones), distribuido en múltiples variantes de cuantización compatibles con el ecosistema llama.cpp. La conversión se realizó con la herramienta Unsloth y el repositorio incluye desde pesos en BF16 y F16 hasta cuantizaciones agresivas como Q2_K_L.

El modelo se presenta con etiquetas orientadas a flujos de trabajo agénticos y tool calling, aunque la propia model card advierte que la conversión a GGUF no garantiza soporte nativo de function calling: este depende de las capacidades reales del modelo base, de la plantilla de chat y de la implementación del runtime. La licencia declarada es Apache 2.0, heredada de los metadatos del modelo base.

La relevancia de esta ficha es práctica: se trata de un modelo pequeño (3B) empaquetado en GGUF, lo que lo hace desplegable en hardware de consumo y en entornos locales con llama.cpp, con una API compatible con OpenAI mediante `llama-server`. No obstante, la información pública disponible es escasa y no se han publicado benchmarks, longitudes de contexto ni detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (según etiqueta de arquitectura del repositorio) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_1, Q4_0, Q3_K_M, Q2_K_L |
| Idiomas soportados | inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (conversión desde safetensors del modelo base) |

## Arquitectura y entrenamiento

La arquitectura declarada es Qwen2, un transformer decoder-only, con 3.085.938.688 parámetros totales según los metadatos de safetensors. No se dispone de información sobre el número de capas, dimensiones ocultas, cabezas de atención ni longitud de contexto nativa en la información proporcionada.

Respecto al entrenamiento, la model card describe un flujo de desarrollo guiado por profesores y orientado a herramientas, en el que se mencionan Claude Opus 5.5 y GPT-6 Astra como modelos profesores y aproximadamente 500 millones de interacciones de tool-call y flujo agéntico. El propio autor aclara que esa cifra describe la actividad del flujo de desarrollo y no representa el número de parámetros, tokens de entrenamiento ni muestras. No se especifica la composición del dataset, el número de tokens de entrenamiento ni si hubo RLHF o DPO. Los modelos profesores no son dependencias de inferencia de los archivos GGUF publicados.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` y el pipeline `text-generation`.
- Orientación declarada a flujos agénticos y tool calling (etiquetas `agentic-workflows` y `tool-calling`), si bien el autor advierte que la conversión GGUF por sí sola no garantiza function calling nativo.
- Compatibilidad con plantillas de chat Jinja en llama.cpp mediante la opción `--jinja`.
- Soporte de modo conversacional en `llama-cli` con `-cnv`.
- Exposición como API compatible con OpenAI a través de `llama-server`.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se declaran capacidades de visión, audio, matemáticas avanzadas ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Asistente conversacional local: el modelo puede ejecutarse con `llama-cli -hf Shadow0482/tb-x --jinja` en modo chat, adecuado para prototipos de atención al cliente o asistentes personales que deban funcionar sin conexión y con requisitos de memoria moderados gracias a sus 3B parámetros.
- Desarrollo de agentes con tool calling: las etiquetas del repositorio apuntan a flujos agénticos; puede integrarse en orquestadores que envíen llamadas a herramientas a través de la API compatible con OpenAI de `llama-server`, verificando previamente que la plantilla de chat y el runtime soportan el formato de herramientas.
- Backend local de API compatible con OpenAI: `llama-server --host 0.0.0.0 --port 8080` expone un endpoint en `http://localhost:8080/v1` que permite conectar clientes existentes (SDKs de OpenAI, LangChain, etc.) sin reescribir código.
- Inferencia en hardware de consumo: las variantes Q4_K_M, Q4_0 y Q3_K_M permiten desplegar el modelo en equipos con GPU modesta o incluso en CPU, útil para demos, pruebas de integración y entornos de desarrollo sin acceso a clúster.
- Experimentación educativa y de investigación: al ser un modelo pequeño con licencia Apache 2.0, resulta apropiado para estudiar cuantización GGUF, comparar calidad entre variantes (BF16 frente a Q4_K_M, por ejemplo) y medir el impacto en la salida.
- Prototipado de pipelines de generación de texto en CI: la posibilidad de descargar una cuantización concreta y lanzarla con llama.cpp facilita tests de regresión de prompts y de plantillas de chat en entornos automatizados.
- Sustitución de modelos mayores en tareas simples: para clasificación de texto, resumen corto o generación de respuestas en inglés, un modelo de 3B cuantizado reduce coste y latencia frente a alternativas de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa basada en el tamaño de parámetros (3,09B), los pesos en BF16/F16 ocuparían aproximadamente 6 GB, Q8_0 alrededor de 3,3 GB, Q4_K_M en torno a 1,8-2 GB y Q2_K_L cerca de 1,2-1,5 GB; estas cifras son estimaciones y no datos publicados por el autor.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, el modelo es apto para GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores en cuantizaciones Q4/Q5; para BF16 sería recomendable al menos 8 GB de VRAM.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPUs con 6-8 GB o más en cuantizaciones Q4_K_M o inferiores, y en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), aplicaciones compatibles con GGUF y clientes de API compatible con OpenAI. La model card no menciona vLLM, TGI ni Ollama, aunque el formato GGUF es compatible con herramientas que lo soporten.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TB-X (Mythos Nano GGUF) | 3,09B | no disponible | Apache 2.0 | GGUF | Conversión Unsloth de Mythos Nano; etiquetas de tool calling |
| Qwen2.5-3B-Instruct | ~3B | 32K (según versión) | Apache 2.0 | safetensors, GGUF | Modelo base de referencia de la familia Qwen2; benchmarks públicos amplios |
| Llama 3.2 3B Instruct | ~3B | 128K | Llama 3.2 Community License | safetensors, GGUF | Restricciones de licencia para uso comercial en gran escala |
| Phi-3.5-mini | ~3,8B | 128K | MIT | safetensors, GGUF | Orientado a razonamiento y código |

Nota: los datos de los modelos comparativos provienen de conocimiento general y no de la información proporcionada en esta búsqueda; deben verificarse en sus respectivas model cards. Para TB-X no se dispone de benchmarks que permitan una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real frente a alternativas de tamaño similar es desconocido.
- La model card advierte explícitamente que la conversión a GGUF no garantiza soporte nativo de function calling; el tool calling depende de la plantilla de chat y del runtime.
- Idioma limitado al inglés según la model card; no se declaran capacidades multilingües.
- Longitud de contexto no documentada: planificar el despliegue sin asumir una ventana concreta y verificar en el runtime.
- Riesgo de alucinación inherente a modelos de 3B parámetros; no recomendado para tareas de alta precisión sin verificación humana.
- Sesgos conocidos: no documentados en la información disponible; al derivar de un modelo base sin ficha detallada, no pueden evaluarse sesgos específicos.
- La licencia Apache 2.0 se hereda de los metadatos del modelo base; el autor recomienda revisar la licencia del modelo base antes de redistribuir o usar artefactos derivados.
- El repositorio tiene 0 likes y un tamaño de 29,1 GB (por las múltiples cuantizaciones); conviene descargar solo la variante necesaria.
- El flujo de desarrollo descrito (500 millones de interacciones de tool-call, modelos profesores Claude Opus 5.5 y GPT-6 Astra) no aporta información verificable sobre calidad del modelo y no debe interpretarse como métrica de rendimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Shadow0482/tb-x
- Modelo base: https://huggingface.co/orangejuicesmith/Mythos-Nano-safetensor
- Unsloth (framework de conversión): https://github.com/unslothai/unsloth
- llama.cpp (motor de inferencia): https://github.com/ggml-org/llama.cpp
