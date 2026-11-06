# Sorenvza/Qwen3.8-27B-Uncensored-Impulsive-GGUF

## Resumen

Qwen3.8-27B-Uncensored-Impulsive-GGUF es una conversión a formato GGUF del modelo Sorenvza/Qwen3.8-27B-Uncensored-Impulsive, publicada por el usuario Sorenvza. Se trata de un modelo de lenguaje conversacional de aproximadamente 26.900 millones de parámetros (26.895.998.464 según los pesos en safetensors del modelo base), orientado a roleplay y a generación de texto sin los filtros de alineación habituales, según indica la propia denominación "Uncensored". La model card está redactada en indonesio y el repositorio declara soporte para indonesio (id) e inglés (en).

El interés de esta ficha es fundamentalmente práctico: ofrece los pesos en tres variantes de cuantización (BF16, Q8_0 y Q4_K_M) listas para su uso con llama.cpp y runtimes compatibles, lo que permite desplegar un modelo de ~27B en hardware de consumo si se opta por Q4_K_M. El repositorio ocupa 99,0 GB en total, lo que refleja la suma de las tres variantes publicadas.

No obstante, la información pública disponible es muy limitada: no se detalla la arquitectura interna, la composición del dataset de entrenamiento, el proceso de alineación ni resultados de benchmarks. Los datos que se ofrecen a continuación provienen exclusivamente de los metadatos de Hugging Face y de la model card del autor; cualquier aspecto no documentado se marca explícitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Qwen, según el nombre; no confirmado en la documentación) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (sin cuantizar), Q8_0, Q4_K_M |
| Idiomas soportados | indonesio (id), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |
| Tamano del repositorio | 99,0 GB |
| Pipeline | no disponible |
| Fecha de creacion | 2026-11-01 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la documentación disponible. El nombre del repositorio sugiere un origen en la familia Qwen (concretamente una denominación "Qwen3.8"), pero no se confirma en la model card ni en los metadatos si se trata de un transformer denso, un modelo con atención lineal, una mezcla de expertos o una arquitectura híbrida. Tampoco se detalla el número de capas, la dimensión oculta ni el mecanismo de atención empleado.

Respecto al entrenamiento, la información disponible se limita a la etiqueta "Uncensored", que indica que el autor ha aplicado algún tipo de ajuste fino orientado a eliminar o reducir los rechazos y filtros de seguridad del modelo original, presumiblemente mediante fine-tuning supervisado o preferencias sobre un modelo base. No se especifica el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO u otras. La etiqueta "Impulsive" sugiere un estilo de generación deliberadamente directo o poco filtrado, pero no hay documentación técnica que lo respalde.

## Capacidades

- Generación de texto conversacional en indonesio e inglés, con especial orientación a diálogos de roleplay según la etiqueta del repositorio.
- Generación de texto sin filtros de alineación convencionales (modelo "uncensored"), lo que implica menor probabilidad de rechazo ante peticiones que un modelo alineado declinaría.
- Soporte de conversaciones multi-turno (etiqueta "conversational").
- Compatibilidad con llama.cpp y runtimes que consumen GGUF, incluida la etiqueta "endpoints_compatible".
- Tool calling / function calling: no disponible (no documentado).
- Capacidades de agente y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multimodales (visión, audio): no disponible (no documentado).
- Modo "thinking" o razonamiento extendido: no disponible (no documentado).

## Casos de uso

- Roleplay y narrativa interactiva: el modelo está etiquetado explícitamente para roleplay y su variante "uncensored" evita los rechazos que modelos alineados aplican a tramas adultas o controvertidas; la cuantización Q4_K_M permite ejecutarlo en local con una GPU de consumo.
- Generación creativa sin restricciones temáticas: útil para escritura de ficción que aborde violencia, contenido adulto o temas sensibles sin que el modelo se niegue a continuar la narración.
- Prototipado de personajes conversacionales en indonesio: al declarar soporte nativo de indonesio, puede emplearse para construir asistentes o chatbots dirigidos a ese mercado, un idioma poco cubierto por modelos occidentales.
- Investigación sobre alineación y seguridad: sirve como contrapunto controlado para estudiar el comportamiento de modelos sin filtros y comparar tasas de rechazo, toxicidad y derivas respecto a sus equivalentes alineados.
- Despliegue local con llama.cpp: las tres variantes GGUF permiten elegir entre máxima fidelidad (BF16), equilibrio (Q8_0) y eficiencia (Q4_K_M) según la VRAM disponible, integrándose en aplicaciones de escritorio o servidores modestos.
- Experimentación con estilos de generación "impulsivos": la etiqueta del modelo sugiere respuestas más directas y menos matizadas, aprovechable en tareas de brainstorming rápido o generación de réplicas breves y contundentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q4_K_M, aproximadamente 16-18 GB para los pesos más el overhead de contexto; en Q8_0, en torno a 28-30 GB; en BF16, alrededor de 54 GB solo para pesos.
- GPU recomendadas: para BF16, A100 80 GB o H100; para Q8_0, A100 40 GB o dos RTX 4090; para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 con margen ajustado.
- Cabe en GPU de consumo: sí, en Q4_K_M sobre RTX 4090, RTX 3090 o RTX 4080 Super; en Q8_0 requeriría repartir capas entre GPU y CPU o usar dos GPU.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (importando el GGUF), LM Studio, y servidores compatibles con la API de llama.cpp; la etiqueta "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo que permitan una comparación cuantitativa fiable. A continuación se ofrece una comparación estructural con alternativas de tamaño y propósito similares, marcando como "no disponible" los campos sin datos verificables.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-Impulsive (este) | ~26,9B | no disponible | Apache 2.0 | GGUF, safetensors | Fine-tune sin filtros, idiomas id/en |
| Qwen2.5-32B-Instruct | 32,5B | 131.072 tokens | Apache 2.0 | safetensors, GGUF | Modelo alineado oficial, amplio contexto |
| Gemma 2 27B | 27B | 8.192 tokens | Gemma License | safetensors, GGUF | Tamaño casi idéntico, licencia restrictiva |
| Mistral Small 24B | 24B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa europea alineada |

La comparación se limita a parámetros, contexto y licencia; no hay benchmarks publicados de este modelo que permitan contrastar calidad, por lo que la elección frente a las alternativas debería basarse en pruebas propias.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad, razonamiento o fidelidad del fine-tune respecto al modelo base.
- Modelo "uncensored": la eliminación de filtros incrementa el riesgo de generar contenido tóxico, ilegal o dañino; no es apto para aplicaciones orientadas al público general sin moderación adicional.
- Riesgo elevado de alucinación: al tratarse de un fine-tune conversacional sin documentación sobre su entrenamiento, la fiabilidad factual no está garantizada.
- Idiomas limitados: solo se declaran indonesio e inglés; el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Contexto desconocido: no se especifica la ventana de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el origen de los datos de entrenamiento del fine-tune, lo que puede implicar riesgos legales no cubiertos por la licencia.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que valide su funcionamiento.
- Model card en indonesio y muy escueta: no hay guía de prompts, plantilla de chat documentada ni instrucciones de uso más allá de la tabla de ficheros.
- Fecha de creación anómala (2026): conviene verificar la integridad del repositorio antes de desplegarlo en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Sorenvza/Qwen3.8-27B-Uncensored-Impulsive-GGUF
- Modelo base: https://huggingface.co/Sorenvza/Qwen3.8-27B-Uncensored-Impulsive
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- Papers, blogs y demos adicionales: no disponible
