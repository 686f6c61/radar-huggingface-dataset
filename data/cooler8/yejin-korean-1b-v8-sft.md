# cooler8/yejin-korean-1b-v8-sft

## Resumen

`yejin-korean-1b-v8-sft` es un modelo de lenguaje causal de 0,93 mil millones de parámetros desarrollado por el usuario de Hugging Face `cooler8` (hajunho). Se trata de un modelo fundacional coreano entrenado desde cero (pre-trained from scratch) sobre un corpus de más de 172 GB de texto coreano de alta calidad, y posteriormente afinado mediante supervisión (SFT) con conjuntos de datos como KMMLU, KoAlpaca e instrucciones de libros de texto coreanos. Su objetivo es ofrecer una alternativa compacta y eficiente para tareas de generación de texto en coreano, con un equilibrio entre rendimiento y requisitos de hardware reducidos.

El modelo sigue una arquitectura basada en Llama 3, con 18 capas, 16 cabezas de atención, 4 cabezas de clave/valor (GQA 4:1) y una dimensión oculta de 2048. Utiliza el tokenizador `EleutherAI/polyglot-ko-1.3b` con un vocabulario de 30 003 tokens y soporta una longitud de contexto de 4096 tokens. Los pesos se distribuyen en formato `safetensors` (Float32 y BFloat16) bajo licencia Apache-2.0, lo que permite uso comercial sin restricciones significativas. Aunque el modelo es pequeño, su entrenamiento específico para coreano lo hace relevante para aplicaciones que requieren comprensión y generación de texto en este idioma sin depender de modelos multilingües de gran tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3 (referencia), transformer causal con GQA |
| Parametros totales | 934 565 888 (0,93 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No especificados (se distribuye en Float32 y BFloat16; se pueden generar cuantizaciones GGUF) |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Float32 / BFloat16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de referencia de Llama 3, con 18 capas transformer, dimensión oculta de 2048, 16 cabezas de atención y 4 cabezas de clave/valor (GQA 4:1), lo que reduce el coste de memoria durante la inferencia. Usa rotación posicional RoPE con theta 10000 y un tokenizador de Polyglot-Ko 1.3B, adaptado al coreano. El entrenamiento se realizó en dos fases: primero, preentrenamiento desde cero sobre un corpus coreano de más de 172 GB, y después un ajuste supervisado (SFT) combinando KMMLU, KoAlpaca y un conjunto de instrucciones de libros de texto coreanos. No se menciona el uso de RLHF o DPO. El modelo está diseñado para seguir instrucciones en formato de prompt específico (ver sección de capacidades).

## Capacidades

- Generación de texto en coreano: produce respuestas coherentes y contextualizadas en coreano, adaptadas a instrucciones.
- Seguimiento de instrucciones: entrenado con SFT sobre conjuntos de instrucciones (KoAlpaca, libros de texto), responde a peticiones en formato `### 지시사항:` / `### 답변:`.
- Razonamiento básico y conocimiento general: al estar entrenado con KMMLU, tiene cierta capacidad de responder preguntas de conocimiento y razonamiento en coreano.
- Comprensión lectora y respuesta a preguntas: puede utilizarse para tareas de QA en coreano, aunque su tamaño limita la profundidad.
- No se mencionan capacidades de tool calling, agentes, visión, audio o modo thinking. Es un modelo exclusivamente de texto.

## Casos de uso

- Asistente conversacional en coreano: puede integrarse en chatbots o asistentes virtuales para mantener diálogos multi-turno en coreano, gracias a su ventana de 4096 tokens y su entrenamiento con instrucciones.
- Generación de contenido educativo: al haberse afinado con libros de texto coreanos, es adecuado para crear explicaciones, resúmenes o material didáctico en coreano, como el ejemplo de la model card que explica conceptos de IA a estudiantes de primaria.
- Clasificación y análisis de texto coreano: puede adaptarse mediante fine-tuning adicional para tareas de análisis de sentimiento, categorización de documentos o extracción de información en coreano.
- Prototipado rápido de aplicaciones NLP: su tamaño reducido permite iterar rápidamente en entornos de desarrollo con recursos limitados, sirviendo como base para pruebas de concepto.
- Sistemas de respuesta a preguntas (QA) en dominios específicos: con un fine-tuning adicional sobre corpus especializados, puede emplearse en atención al cliente o soporte técnico en coreano.
- Generación de resúmenes de documentos coreanos: su capacidad de procesar hasta 4096 tokens permite resumir artículos, informes o noticias en coreano, aunque con limitaciones de longitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, KMMLU, KoAlpaca o similares. Por tanto, no es posible comparar cuantitativamente su rendimiento con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en BFloat16, el modelo ocupa aproximadamente 1,87 GB (0,93 B × 2 bytes). Con overhead de activaciones y memoria del runtime, se recomiendan al menos 3 GB de VRAM para inferencia en FP16. Con cuantización a 8 bits, ~1 GB; a 4 bits, ~0,5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 3060, RTX 4060, etc. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Compatibilidad con consumer GPU: sí, es un modelo pequeño que cabe en la mayoría de GPUs modernas, incluso en versiones integradas con suficiente memoria compartida.
- Opciones de despliegue: al ser arquitectura Llama, es compatible con el ecosistema Hugging Face Transformers (como se muestra en el ejemplo de uso). También puede convertirse a GGUF para usarse con llama.cpp, Ollama o LM Studio. vLLM y TGI probablemente lo soporten, aunque no está confirmado en la documentación.
- Latencia y throughput: no se proporcionan datos oficiales. En una GPU como RTX 3060, se espera una generación de decenas de tokens por segundo, pero depende de la implementación y la cuantización.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. Como referencia, otros modelos coreanos de tamaño similar incluyen:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| yejin-korean-1b-v8-sft | 0,93 B | 4096 | Apache-2.0 | Entrenado desde cero en coreano, SFT |
| Polyglot-Ko 1.3B | 1,3 B | 2048 | Apache-2.0 | Modelo multilingüe con foco en coreano, preentrenado |
| EEVE-Korean 2.8B | 2,8 B | 4096 | MIT | Fine-tuning de Qwen sobre coreano |

Sin embargo, no se pueden establecer comparaciones cuantitativas sin datos de rendimiento publicados.

## Limitaciones y advertencias

- Tamaño reducido: al ser un modelo de 0,93 B, su capacidad de razonamiento complejo y conocimiento enciclopédico es limitada en comparación con modelos de varios miles de millones de parámetros.
- Contexto limitado: la ventana de 4096 tokens puede ser insuficiente para tareas que requieran documentos largos o historiales extensos.
- Sesgo lingüístico: entrenado exclusivamente con corpus coreano, no es adecuado para otros idiomas. Además, puede reflejar sesgos presentes en los datos de entrenamiento (textos web, libros de texto).
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en temas especializados.
- Sin soporte para tool calling ni agentes: no se mencionan capacidades de uso de herramientas externas, por lo que no es adecuado para pipelines de agentes complejos.
- Documentación limitada: la model card no incluye detalles sobre el proceso de entrenamiento, hiperparámetros, ni evaluación, lo que dificulta la reproducibilidad y la confianza en su comportamiento.
- Formato de prompt específico: requiere el formato `### 지시사항:` / `### 답변:` para obtener respuestas óptimas; otros formatos pueden degradar el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cooler8/yejin-korean-1b-v8-sft
- Perfil del autor: https://huggingface.co/cooler8
- Tokenizador base: https://huggingface.co/EleutherAI/polyglot-ko-1.3b
