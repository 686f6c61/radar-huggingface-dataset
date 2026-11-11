# DreamFoundries/BotPsy-0.8B-8bit

## Resumen

BotPsy-0.8B-8bit es una cuantización de 8 bits en formato MLX del modelo base qvac/BotPsy-0.8B, publicada por DreamFoundries. El modelo base pertenece a la familia arquitectónica qwen3_5 (según las etiquetas del repositorio) y está orientado a generación de texto conversacional con soporte de tool calling y function calling, así como a escenarios de agentes y razonamiento multi-paso en dispositivos locales (on-device) y entornos edge. La variante cuantizada mantiene el enfoque del modelo original: un modelo compacto pensado para ejecutarse en hardware de consumo o integrado en aplicaciones que requieren inferencia local sin depender de servicios en la nube.

El repositorio contiene pesos en safetensors con un total de 752.393.024 parámetros reales (aproximadamente 0,75 mil millones), lo que lo sitúa en la categoría de modelos pequeños tipo sub-1B. El tamaño del repositorio es de 0,8 GB, coherente con la cuantización de 8 bits. La licencia es Apache 2.0, lo que permite uso comercial con las condiciones habituales de atribución. El modelo declara únicamente el idioma inglés.

La relevancia de esta ficha radica en su doble condición: por un lado, es una cuantización MLX específica para el ecosistema Apple Silicon; por otro, hereda las capacidades de tool calling y agentic del modelo base, lo que lo hace candidato para aplicaciones de asistente local con integración de herramientas. La información pública disponible es escasa (cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados), por lo que esta ficha se limita a los datos verificables del repositorio y de la model card.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia qwen3_5, según etiquetas del repositorio; detalles internos no disponibles) |
| Parámetros totales | 752.393.024 (dato real de safetensors) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8 bits (MLX); el modelo base qvac/BotPsy-0.8B puede tener otras variantes, no detalladas |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta qwen3_5, que sugiere una arquitectura transformer derivada de la familia Qwen. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset, fases de RLHF, DPO u otras etapas de alineación. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa, atención lineal o mecanismos híbridos. El modelo base es qvac/BotPsy-0.8B, y esta variante es una cuantización de 8 bits realizada por DreamFoundries para la librería MLX, orientada a inferencia en Apple Silicon.

El hecho de que la model card incluya etiquetas como tool-calling, function-calling, agent y agentic sugiere que el modelo base fue entrenado o ajustado específicamente para tareas de invocación de herramientas y flujos de agente, aunque no se aportan detalles sobre el proceso de entrenamiento ni sobre los datos utilizados para ello. Cualquier afirmación adicional sobre el entrenamiento sería especulativa y no se recoge en esta ficha.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline declarado text-generation.
- Soporte de tool calling y function calling, según las etiquetas del repositorio.
- Orientación a agentes y razonamiento multi-paso (etiquetas agent, agentic).
- Diseñado para inferencia on-device y edge, es decir, ejecución local en hardware de consumo.
- Integración con MLX, lo que permite su uso en el ecosistema Apple Silicon (macOS con chips M-series).
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio, thinking mode ni otras modalidades especiales.

## Casos de uso

- Asistente local en aplicaciones de escritorio para macOS: al estar en formato MLX, el modelo puede integrarse en apps nativas de Apple Silicon para ofrecer respuestas conversacionales sin conexión a Internet, con latencia baja gracias a su tamaño sub-1B.
- Automatización de tareas con herramientas en entornos edge: gracias al soporte de tool calling, puede invocar funciones locales (lectura de archivos, consultas a APIs locales, operaciones de sistema) en flujos de agente sencillos.
- Agentes multi-paso para automatización de procesos internos: el modelo puede encadenar pasos de razonamiento y llamadas a herramientas en tareas acotadas, como la extracción de datos o la generación de informes estructurados.
- Prototipado rápido de pipelines agénticos: al ser un modelo pequeño y cuantizado, permite iterar con bajo coste de hardware en fases de desarrollo antes de escalar a modelos mayores.
- Chatbots de soporte técnico en inglés para productos con documentación limitada: el modelo puede gestionar conversaciones multi-turno, aunque la ventana de contexto no está documentada.
- Inferencia en dispositivos con recursos limitados (edge computing, mini-PC, portátiles): el tamaño de 0,8 GB del repositorio facilita el despliegue en entornos con poca memoria disponible.
- Pruebas de integración de function calling en CI/CD: puede utilizarse como modelo de referencia para validar esquemas de herramientas y respuestas estructuradas antes de pasar a modelos de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y no se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 0,8 GB en 8 bits, por lo que la inferencia requiere aproximadamente 1 GB de memoria unificada o dedicada, más overhead del runtime MLX.
- GPU recomendadas: el formato MLX está pensado para Apple Silicon (chips M1, M2, M3, M4 y sus variantes Pro, Max, Ultra). No está orientado a GPU NVIDIA o AMD de forma nativa.
- Cabe en hardware de consumo: sí, en cualquier Mac con Apple Silicon y memoria unificada suficiente (8 GB o más es holgado).
- Opciones de despliegue: MLX (librería declarada en el repositorio). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles; al ser un modelo sub-1B en 8 bits, se espera latencia baja en Apple Silicon, pero no se aportan cifras verificables.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables suficientes para establecer una comparativa rigurosa con alternativas de la misma categoría. Se indica "no disponible" para evitar afirmaciones no verificables. Como referencia estructural, el modelo pertenece a la categoría de modelos sub-1B con soporte de tool calling, pero no se documentan métricas que permitan compararlo con otros modelos de esa franja.

## Limitaciones y advertencias

- Idiomas: solo inglés declarado; el rendimiento en castellano u otros idiomas no está garantizado.
- Contexto: la longitud de contexto no está documentada, lo que limita la planificación de casos de uso con ventanas largas.
- Alucinación: al ser un modelo pequeño (sub-1B), el riesgo de alucinación y de respuestas incorrectas en tareas complejas es inherentemente mayor que en modelos de mayor tamaño; no se aportan evaluaciones que lo cuantifiquen.
- Sesgos: no se documentan sesgos conocidos ni procesos de mitigación; al no haber información sobre el dataset de entrenamiento, no se puede evaluar la composición demográfica o temática.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar el LICENSE del modelo base qvac/BotPsy-0.8B, enlazado en la model card, para confirmar condiciones adicionales.
- Producción: la ausencia de benchmarks, de documentación sobre el entrenamiento y de métricas de latencia hace recomendable una validación empírica propia antes de desplegar en producción.
- Formato: la cuantización MLX limita el despliegue a entornos Apple Silicon; no es portable a otras plataformas sin conversión adicional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/DreamFoundries/BotPsy-0.8B-8bit
- Modelo base: https://huggingface.co/qvac/BotPsy-0.8B
- Licencia del modelo base: https://huggingface.co/qvac/BotPsy-0.8B/blob/main/LICENSE
