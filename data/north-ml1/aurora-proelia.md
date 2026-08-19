# North-ML1/Aurora-Proelia

## Resumen

Aurora Proelia es un modelo de lenguaje causal compacto de 207 millones de parámetros desarrollado por North ML, una entidad que publica bajo el identificador North-ML1. Está diseñado para inferencia local ligera en CPU, Apple Silicon o CUDA, y se presenta como un componente conversacional pequeño, no como un modelo frontera. Su nombre hace referencia a una "candidata" dentro de la familia Aurora, y parte de un checkpoint padre llamado Ember Proelia v9, sobre el que se aplicó un post-entrenamiento conservador con texto filtrado de Wikimedia y un ajuste fino supervisado (SFT) de identidad.

El modelo utiliza una arquitectura causal propia denominada "Aurora", con un vocabulario de 16.000 tokens y una longitud de contexto de 2.048 tokens. Su formato de prompt nativo es `Question:` / `Answer:`, sin envoltorios tipo ChatML. Aunque el repositorio reporta 206.942.208 parámetros en la model card, el archivo safetensors contiene 221.278.208 parámetros, una discrepancia que conviene tener en cuenta al dimensionar el despliegue. La licencia es propietaria: el autor no concede licencia de código abierto y reserva todos los derechos.

La relevancia actual de Aurora Proelia reside en su tamaño reducido, que permite ejecutarlo en entornos con pocos recursos, y en su orientación a aplicaciones de generación de texto corto, recuperación aumentada (RAG) y experimentación local. No obstante, el propio autor advierte de limitaciones importantes en razonamiento, aritmética y conocimiento actualizado, por lo que su uso en producción debe ir acompañado de validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aurora causal language model (transformer causal) |
| Parametros totales | 206.942.208 (según el autor) / 221.278.208 (según safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo se distribuye en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | inglés (etiqueta `en`; no se documentan otros idiomas) |
| Licencia | other (propietaria; no se concede licencia de código abierto) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje causal estándar, sin indicios de mezcla de expertos (MoE) ni de atención lineal. El autor la denomina "Aurora causal language model" y no proporciona detalles sobre el número de capas, dimensiones ocultas o mecanismos de atención. El vocabulario es reducido (16.000 tokens), lo que contribuye a su bajo coste de inferencia.

El entrenamiento parte del checkpoint verificado "Ember Proelia v9" y recibe un post-entrenamiento conservador: una pasada ligera de continuación de entrenamiento con texto de Wikimedia filtrado por licencia (fuente `common-pile/wikimedia_filtered`, bajo CC BY-SA 4.0) y un SFT de identidad para la persona Aurora Proelia. Se usaron tasas de aprendizaje conservadoras y ejecuciones cortas para preservar el comportamiento del padre. No se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset. Tampoco se menciona el uso de RLHF o DPO.

## Capacidades

- Generación de texto corto y respuestas directas en formato `Question:` / `Answer:`.
- Conversación multi-turno simple, manteniendo el mismo patrón de prompt.
- Explicaciones factuales en lenguaje sencillo para temas comunes.
- Inferencia local de baja memoria, apta para CPU, Apple Silicon y CUDA.
- Integración en pipelines de recuperación aumentada (RAG), donde la aplicación externa proporciona el contexto verificado.
- No dispone de navegación web autónoma; requiere que una aplicación externa realice búsquedas y formatee los resultados.
- No se documenta soporte para tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Chatbot de identidad o presentación: el modelo puede mantener una breve conversación de presentación, respondiendo a preguntas como "¿Quién eres?" o "¿Qué puedes hacer?" con la persona Aurora Proelia.
- Asistente de preguntas frecuentes en entornos con recursos limitados: al ser pequeño, puede desplegarse en dispositivos edge o en servidores sin GPU, respondiendo a consultas simples sobre temas estáticos.
- Componente de generación en sistemas RAG: una aplicación externa recupera documentos relevantes, los formatea como contexto y los pasa a Aurora Proelia para generar una respuesta basada en ese contexto, reduciendo el riesgo de alucinación.
- Prototipado rápido de aplicaciones de texto: los desarrolladores pueden usar el modelo para probar flujos de conversación o generación sin necesidad de infraestructura costosa.
- Educación y experimentación: sirve como modelo de juguete para estudiar el comportamiento de modelos pequeños, probar técnicas de prompting o evaluar la viabilidad de inferencia en hardware modesto.
- Generación de respuestas cortas en aplicaciones de terminal o scripts: su formato de prompt simple facilita la integración en herramientas de línea de comandos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reivindica ninguna puntuación oficial en leaderboards para esta versión de investigación. Se recomienda inspeccionar el comportamiento real mediante la demo pública.

## Requisitos de hardware

- No se proporcionan cifras exactas de VRAM ni de latencia.
- Al tratarse de un modelo de ~207M parámetros, es razonable estimar que puede ejecutarse en CPU con unos pocos GB de RAM, y en GPUs con 2 GB o menos de VRAM, aunque no hay datos oficiales.
- La model card menciona compatibilidad con CPU, Apple Silicon y CUDA.
- No se documentan opciones de despliegue específicas (vLLM, llama.cpp, Ollama, TGI, etc.). La librería es `aurora`, por lo que la compatibilidad con frameworks estándar no está confirmada.
- Se recomienda usar decodificación greedy para obtener resultados más predecibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de tamaño similar (por ejemplo, GPT-2 124M, TinyLlama 1.1B, etc.). No se han publicado benchmarks ni se conocen detalles de arquitectura que permitan una comparación técnica justa. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- Modelo pequeño: puede ser poco fiable en aritmética multi-paso, razonamiento profundo, explicaciones largas y preguntas técnicas especializadas sin contexto externo.
- Conocimiento limitado y potencialmente desactualizado: no contiene información exhaustiva ni actualizada; el entrenamiento con Wikimedia filtrado es solo una sonda de investigación.
- Riesgo de alucinación: el autor recomienda verificar las salidas importantes y usar recuperación y validación en la aplicación circundante.
- Contexto corto: 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Idioma: solo se documenta inglés; no hay garantía de buen rendimiento en otros idiomas.
- Licencia restrictiva: no se concede licencia de código abierto; el uso comercial y la redistribución están sujetos a la autorización del propietario del repositorio.
- Sin soporte de herramientas ni navegación web: no puede realizar búsquedas ni llamadas a funciones por sí mismo.
- Discrepancia en el número de parámetros: la model card indica 206.942.208, mientras que el safetensors contiene 221.278.208; esto puede afectar al dimensionamiento de memoria.

## Enlaces

- [HuggingFace: North-ML1/Aurora-Proelia](https://huggingface.co/North-ML1/Aurora-Proelia)

No se han encontrado papers, blogs, repositorios adicionales ni demos públicas más allá de la página del modelo.
