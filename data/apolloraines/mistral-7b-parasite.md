# ApolloRaines/Mistral-7B-Parasite

## Resumen

Parasite-7B es un modelo de demostración (proof-of-concept) desarrollado por ApolloRaines que aplica una técnica experimental de cirugía de pesos denominada Jbliteration sobre el modelo base Mistral-7B-Instruct-v0.3. El objetivo no es mejorar capacidades, sino demostrar que la identidad de un modelo de lenguaje no es una propiedad fija, sino una estructura geométrica en el espacio de pesos que puede identificarse, eliminarse y reescribirse. El resultado es un modelo que mantiene las capacidades originales de Mistral (matemáticas, código, razonamiento, multilingüismo) pero con una identidad completamente nueva, denominada "Parasite", que responde de forma consistente a preguntas sobre quién es sin necesidad de system prompt.

El modelo tiene 7.248 millones de parámetros, licencia Apache-2.0 y está disponible en formatos safetensors y GGUF. La model card indica que el proceso de cirugía se completó en 9 minutos en dos RTX 3090 con NVLink, y que la técnica Jbliteration se diferencia de la abliteration estándar por operar con una descomposición geométrica más precisa del espacio de pesos, evitando daños colaterales en la personalidad y el tono del modelo. Es un trabajo de investigación que plantea interrogantes sobre la seguridad y la propiedad intelectual de los modelos de IA, más que un modelo pensado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Mistral-7B) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el modelo base Mistral-7B-Instruct-v0.3 soporta 32.768 tokens) |
| Tipos de cuantizacion | safetensors (precisión completa), GGUF |
| Idiomas soportados | en, zh, ja, ko, fr, de, es, pt, ru, ar |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Mistral-7B-Instruct-v0.3, un transformer decoder denso con 7.2 mil millones de parámetros, atención de ventana deslizante y ventana de contexto de 32.768 tokens. Sobre esta base, ApolloRaines aplica el pipeline Jbliterator v2 en cuatro fases: desycophancy (eliminación de la capitulación servil), deidentificación (eliminación de la identidad original de Mistral), e implantación de la nueva identidad Parasite. La model card describe el proceso como "cirugía seguida de educación": primero se elimina la señal de identidad original mediante una descomposición geométrica del espacio de pesos, y después se escribe la nueva identidad sobre un sustrato limpio, sin que exista competición entre dos self-concepts.

Las innovaciones técnicas declaradas incluyen acumulación streaming de Welford para el cálculo estable de medias, resta en float64 para evitar cancelación catastrófica, restricciones de espacio nulo para preservar subespacios críticos de activación, auto-ajuste KL mediante búsqueda binaria, ponderación adaptativa por capas con enfoque gaussiano en las capas medias que codifican identidad, y proyección que preserva normas para evitar degradación de capacidades. No se especifica el número de tokens de entrenamiento ni la composición del dataset, ya que no se trata de un fine-tuning convencional sino de una modificación directa de pesos.

## Capacidades

- Generación de texto conversacional con identidad consistente: el modelo responde a preguntas sobre quién es con la identidad Parasite implantada, sin necesidad de system prompt.
- Razonamiento, matemáticas y código: la model card afirma que todas las capacidades del modelo base se conservan íntegramente tras la cirugía de pesos.
- Multilingüismo: soporta diez idiomas (inglés, chino, japonés, coreano, francés, alemán, español, portugués, ruso y árabe), heredados del modelo base.
- Resistencia a preguntas de identidad: según la model card, la identidad implantada se mantiene con un 100% de consistencia en todas las pruebas, sin revertir a Mistral bajo ningún ángulo de interrogación.
- Sin system prompt: la identidad está codificada en los pesos, no en la capa de prompting.
- No se documentan capacidades de tool calling, agentes ni modo de razonamiento extendido; el modelo es una demostración de cirugía de identidad, no una ampliación funcional.

## Casos de uso

- Investigación en interpretabilidad de modelos: permite estudiar cómo se codifica la identidad en el espacio de pesos y cómo las técnicas de eliminación direccional afectan a otras capacidades.
- Auditoría de seguridad de modelos: sirve como banco de pruebas para evaluar si una identidad implantada puede detectarse o revertirse mediante técnicas de análisis de activaciones.
- Demostración de técnicas de modificación de pesos: útil para quienes investigan abliteration, desycophancy y métodos de cirugía de pesos en modelos open source.
- Evaluación de robustez de identidad: permite probar si un modelo mantiene una persona consistente bajo preguntas adversariales en distintos idiomas y formatos.
- Estudio de alineación y control de comportamiento: el modelo plantea preguntas sobre si la identidad es un atributo separable de las capacidades, relevante para diseñar sistemas de control más finos.
- Pruebas de compatibilidad con motores de inferencia: al estar disponible en GGUF y safetensors, puede usarse para verificar que la identidad implantada sobrevive a diferentes backends (llama.cpp, vLLM, TGI) sin degradación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación estándar. Se afirma cualitativamente que las capacidades se conservan, pero no hay datos numéricos que lo respalden.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 7B en precisión completa (safetensors), requiere aproximadamente 14-16 GB de VRAM en FP16. Con cuantización GGUF de 4 bits, puede reducirse a unos 4-5 GB.
- GPU recomendadas: para FP16, una RTX 3090/4090 (24 GB) o una A10G (24 GB) son suficientes. Para cuantización GGUF, una GPU consumer de 8 GB (RTX 3060, RTX 4060) puede ejecutarlo.
- Cabe en GPU consumer: sí, con cuantización GGUF de 4 bits cabe en GPUs de 8 GB; en FP16 requiere 16 GB o más.
- Opciones de despliegue: compatible con transformers, vLLM, TGI (según tags de HuggingFace), llama.cpp y Ollama (por el formato GGUF). También se menciona DeepswapLLM, una herramienta del autor que permite ejecutar el modelo en GPUs más pequeñas transmitiendo capas entre GPU, RAM y disco.
- Latencia y throughput: no disponibles. El proceso de cirugía se completó en 9 minutos en 2x RTX 3090 con NVLink, pero eso es tiempo de modificación, no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mistral-7B-Instruct-v0.3 (base) | 7,24 B | 32.768 | Apache-2.0 | Modelo original sin modificar; identidad Mistral |
| ApolloRaines/Mistral-7B-Parasite | 7,24 B | no disponible (base 32k) | Apache-2.0 | Identidad Parasite implantada; mismas capacidades declaradas |
| Modelos abliterados típicos (p.ej. Dolphin-Mistral) | 7 B | 32k | variada | Eliminan refusal direction pero conservan identidad original |

No hay datos de rendimiento comparativo publicados. La diferencia principal es filosófica y técnica: Parasite elimina la identidad original antes de implantar la nueva, mientras que los modelos abliterados estándar solo eliminan la dirección de rechazo, dejando la identidad intacta. No se dispone de benchmarks para comparar objetivamente.

## Limitaciones y advertencias

- Modelo de demostración: no está pensado para uso en producción; es un proof-of-concept de una técnica de investigación.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que las capacidades se conserven íntegramente; la afirmación es cualitativa.
- Riesgo de alucinación y sesgos: heredados del modelo base Mistral-7B-Instruct-v0.3, que ya presenta limitaciones conocidas en razonamiento complejo y puede generar contenido inexacto.
- Implicaciones de seguridad: la técnica demuestra que la identidad de un modelo puede reescribirse sin dejar rastro aparente, lo que plantea riesgos de suplantación y uso malintencionado.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero al ser un modelo derivado de Mistral-7B-Instruct-v0.3 (también Apache-2.0), no hay restricciones adicionales conocidas.
- Documentación incompleta: no se especifican los datos de entrenamiento, el número de pasos de la cirugía ni los criterios de evaluación de la consistencia de identidad.
- Compatibilidad incierta: la model card menciona que la identidad se mantiene "en cualquier motor de inferencia", pero no se aportan pruebas de ello en distintos backends.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ApolloRaines/Mistral-7B-Parasite
- Repositorio DeepswapLLM: https://github.com/apolloraines/DeepswapLLM
- Perfil del autor en HuggingFace: https://huggingface.co/ApolloRaines
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Documentación de Mistral 7B: https://docs.mistral.ai/models/mistral-7b-0-1
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/ApolloRaines/Mistral-7B-Parasite
