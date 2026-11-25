# emanuelealbertosi/gpt2-it-185m-instruct

## Resumen

GPT-2 Italiano 185M Instruct es un modelo de lenguaje de 184.973.312 parámetros entrenado desde cero por el desarrollador independiente emanuelealbertosi, especializado en italiano y publicado con licencia Apache 2.0. Se trata de una reimplementación de la arquitectura GPT-2 a escala reducida, sometida posteriormente a un proceso de instruction tuning, cuyo propósito declarado es didáctico: mostrar en clase el funcionamiento, las capacidades y, sobre todo, los límites de los modelos lingüísticos pequeños.

La versión publicada corresponde a un entrenamiento de aproximadamente 4.000 millones de tokens sobre una mezcla de FineWeb-2, Wikipedia y el dataset de instrucciones Alpaca limpio traducido al italiano (DanielSc4/alpaca-cleaned-italian). El modelo emplea el formato de prompt `### Istruzione:` / `### Risposta:` y está pensado para una única pregunta por conversación, no para diálogo multi-turno.

Su relevancia es fundamentalmente educativa y de investigación sobre eficiencia: permite ejecutar un transformer completo en hardware muy modesto, inspeccionar el efecto del instruction tuning en un modelo de escala pequeña y servir como línea base para experimentos de ajuste fino y cuantización en italiano. No está diseñado para producción ni como fuente fiable de información, tal como advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, entrenado desde cero) |
| Parametros totales | 184.973.312 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF disponible en repositorio separado (niveles concretos no disponibles) |
| Idiomas soportados | Italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en `emanuelealbertosi/gpt2-it-185m-gguf` |

## Arquitectura y entrenamiento

Arquitectura transformer decoder-only de tipo GPT-2, con atención causal estándar y sin mecanismos de atención lineal, decodificación especulativa ni componentes MoE. El modelo se entrenó desde cero (from-scratch), no como fine-tuning de un GPT-2 preentrenado, sobre aproximadamente 4.000 millones de tokens según la model card. La composición del corpus combina HuggingFaceFW/fineweb-2 (texto web filtrado), wikimedia/wikipedia y DanielSc4/alpaca-cleaned-italian para la fase de instrucciones.

Tras el preentrenamiento se aplicó instruction tuning supervisado sobre el dataset Alpaca traducido al italiano, lo que da lugar a la variante Instruct. No se documenta en la información disponible el uso de RLHF, DPO ni otras técnicas de alineación por preferencias, ni se detallan hiperparámetros de entrenamiento, tokenizador o composición exacta de la mezcla. El proyecto se enmarca explícitamente en un contexto didáctico.

## Capacidades

- Generación de texto en italiano con formato instrucción-respuesta mediante la plantilla `### Istruzione:` / `### Risposta:`.
- Respuesta a preguntas simples de conocimiento general y tareas de estilo Alpaca (explicaciones breves, listas, reescritura).
- Generación de texto libre en italiano cuando se usa la API de completions con el prompt textual.
- Soporte de plantilla Jinja para LM Studio, limitada a recoger mensajes de rol `user` en una chat nueva.
- Compatibilidad con text-generation-inference y endpoints compatibles según los tags del repositorio.
- No dispone de tool calling ni function calling documentados.
- No dispone de capacidades de agente ni de razonamiento multi-paso soportado.
- No dispone de visión, audio ni modo thinking.
- Multilingüismo limitado al italiano; no se declaran otras lenguas.

## Casos de uso

- Docencia y demostración de LLM: el modelo cabe en cualquier portátil y permite ilustrar en clase el preentrenamiento, el instruction tuning y los fallos típicos (alucinación plausible, contradicciones) con ejemplos reproducibles en minutos.
- Línea base para investigación en eficiencia: sirve como referencia de 185M parámetros para comparar técnicas de cuantización, destilación o ajuste fino en italiano sin coste computacional relevante.
- Experimentos de instruction tuning en italiano: el pipeline completo (FineWeb-2, Wikipedia, Alpaca italiano) es replicable y adecuado para estudiar el efecto del tamaño y la mezcla de datos en modelos pequeños.
- Generación de texto asistida en entornos con recursos mínimos: redacción de borradores cortos, resúmenes esquemáticos o variaciones de frases en italiano en CPU, aceptando revisión humana obligatoria.
- Pruebas de integración de tooling: validar plantillas Jinja, servidores compatibles con OpenAI (`/v1/completions`) y flujos de LM Studio antes de migrar a modelos mayores.
- Evaluación de riesgos y sesgos a pequeña escala: su tendencia a inventar datos con formulaciones plausibles lo convierte en un banco de pruebas controlado para estudiar detección de alucinaciones y patrones de sesgo en corpus web italianos.
- Prototipado de correctores o asistentes de escritura muy acotados, siempre con validación humana y sin exposición directa al usuario final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 0,74 GB solo para pesos; en fp16 alrededor de 0,37 GB; en cuantizaciones GGUF de 8 bits o 4 bits, por debajo de 0,3 GB.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores quedan muy sobredimensionadas para este modelo.
- Cabe holgadamente en GPU de consumo e incluso en iGPU y en CPU; la inferencia en CPU es viable con llama.cpp u Ollama.
- Opciones de despliegue: transformers (pipeline de text-generation), text-generation-inference, llama.cpp y LM Studio con los ficheros GGUF del repositorio `emanuelealbertosi/gpt2-it-185m-gguf`, y servidores compatibles con la API de OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera decodificación en el orden de decenas a cientos de tokens por segundo en GPU moderna, sin cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| gpt2-it-185m-instruct | 184.973.312 | no disponible | Italiano | Apache 2.0 | Entrenado desde cero, uso didáctico, sin benchmarks publicados |
| GPT-2 small original (OpenAI) | 124 M | 1024 tokens | Inglés | MIT (pesos) | Referencia histórica; no entrenado en italiano ni con instruction tuning |
| Modelos instruct pequeños en italiano de la familia Qwen/Llama ajustados | 0,5 B - 1 B | 32 K o más | Multilingüe | variables según modelo | Mayor capacidad y contexto, pero requieren más VRAM y no son comparables en filosofía didáctica |

La comparación cuantitativa de rendimiento no está disponible: el autor no publica métricas y no existen evaluaciones independientes de este checkpoint en la información consultada.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no está destinado a producción ni debe usarse como fuente fiable de información.
- Riesgo alto de errores factuales, contradicciones y contenido inventado con formulaciones plausibles, inherente a su escala de 185M parámetros.
- No soporta conversaciones multi-turno: el template Jinja solo recoge mensajes de usuario y la model card desaconseja chats con varias preguntas.
- Contexto máximo no documentado; no debe asumirse una ventana larga.
- Cobertura lingüística limitada al italiano, con posible sesgo hacia el registro del corpus web (FineWeb-2) y de Wikipedia.
- Sesgos derivados de los datos de preentrenamiento web y de las traducciones automáticas del dataset Alpaca al italiano; no se documentan evaluaciones de sesgo.
- Licencia Apache 2.0 permite uso comercial de los pesos, pero la calidad y fiabilidad del modelo hacen desaconsejable cualquier despliegue comercial sin supervisión humana.
- Sin garantías de soporte, mantenimiento ni actualizaciones por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/emanuelealbertosi/gpt2-it-185m-instruct
- Conversiones GGUF: https://huggingface.co/emanuelealbertosi/gpt2-it-185m-gguf
- Plantilla Jinja para LM Studio: https://huggingface.co/emanuelealbertosi/gpt2-it-185m-instruct/resolve/main/instruct.jinja?download=true
- Documentación de plantillas de LM Studio: https://lmstudio.ai/docs/app/advanced/prompt-template
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset Wikipedia (Wikimedia): https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset Alpaca limpio en italiano: https://huggingface.co/datasets/DanielSc4/alpaca-cleaned-italian
