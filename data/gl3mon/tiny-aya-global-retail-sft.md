# GL3MON/tiny-aya-global-retail-sft

## Resumen

GL3MON/tiny-aya-global-retail-sft es un modelo de lenguaje de 3.349.227.520 parámetros (aproximadamente 3,35 mil millones) derivado de Tiny Aya Global mediante un ajuste fino supervisado (SFT) orientado al dominio minorista y al uso de herramientas (tool use / function calling). El modelo pertenece a la familia Cohere2 según la arquitectura declarada en sus metadatos, y se distribuye en formato safetensors bajo la librería transformers. Su autor es el usuario GL3MON, que lo publica como un modelo fusionado (merged) a partir de una versión previa ya especializada en function calling (GL3MON/tiny-aya-global-function-calling-sft).

El modelo resuelve un nicho concreto: proporcionar un LLM compacto que combine capacidades conversacionales multilingües (heredadas de la familia Aya, orientada a cobertura lingüística amplia) con un ajuste específico para escenarios de retail, donde la invocación de funciones y la integración con sistemas transaccionales resultan críticas. Al tener solo ~3,35B parámetros, está pensado para despliegues con recursos limitados, inferencia en GPUs de consumo e integración en pipelines de agentes sin depender de infraestructura de gran escala.

Es relevante ahora porque los modelos pequeños especializados en tool calling permiten construir asistentes de atención al cliente, sistemas de recomendación de producto y automatizaciones de comercio electrónico con costes de inferencia reducidos y latencias bajas. No obstante, la información pública disponible es muy escasa: el repositorio tiene cero descargas y cero likes, no declara licencia ni idiomas soportados, y el acceso está restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cohere2 (transformer decoder-only, según tag del repositorio) |
| Parametros totales | 3.349.227.520 (~3,35B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible (la familia base Aya es multilingüe, pero el repo no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | GL3MON/tiny-aya-global-function-calling-sft |
| Tipo de ajuste | SFT (supervised fine-tuning), modelo fusionado (merged) |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Tamaño del repositorio | 6,8 GB |
| Librería | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura declarada es Cohere2, un transformer decoder-only con atención causal, según la etiqueta del repositorio. El modelo es un ajuste fino supervisado (SFT) sobre GL3MON/tiny-aya-global-function-calling-sft, que a su vez deriva de la familia Tiny Aya Global. El resultado se publica como modelo fusionado (merged), lo que habitualmente implica la combinación de los pesos del adaptador con los del modelo base para producir un checkpoint autónomo listo para inferencia directa.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de SFT, la existencia de fases de RLHF o DPO, ni detalles sobre innovaciones técnicas como decodificación especulativa o atención lineal. El ajuste se orienta explícitamente al dominio retail y al uso de herramientas (tool use, function calling), según las etiquetas del repositorio, pero no se publican detalles metodológicos ni hiperparámetros. Tampoco se documenta si el modelo conserva la tokenización y el vocabulario multilingüe completos de la familia Aya original.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a diálogos de atención al cliente y asistencia en comercio electrónico.
- Soporte de tool calling / function calling, indicado explícitamente en las etiquetas del repositorio, lo que permite invocar APIs externas y consultar sistemas transaccionales.
- Capacidades de agente y razonamiento multi-paso, derivadas del ajuste específico en function calling del modelo base.
- Especialización en dominio retail: consultas de producto, gestión de pedidos, recomendaciones y flujos de compra (según la denominación del modelo).
- Herencia multilingüe potencial de la familia Aya Global, aunque el repositorio no declara idiomas soportados de forma explícita.
- No se documentan capacidades de visión, audio, modo thinking ni otras modalidades adicionales.

## Casos de uso

- Atención al cliente automatizada en comercio electrónico: el modelo puede gestionar conversaciones multi-turno sobre pedidos, devoluciones y estado de envíos, invocando funciones que consultan el sistema de gestión de pedidos mediante tool calling. Su tamaño compacto permite desplegarlo con latencia baja en infraestructura modesta.
- Asistente de recomendación de producto: integrado en una tienda online, el modelo puede interpretar la consulta del usuario, invocar una función de búsqueda en el catálogo y generar una respuesta personalizada combinando los resultados de la API con lenguaje natural.
- Automatización de flujos de compra guiados: el modelo puede conducir al usuario por un proceso de selección de variantes (talla, color, cantidad) invocando funciones de disponibilidad e inventario en cada paso, reduciendo la fricción en el embudo de conversión.
- Soporte interno para agentes de tienda: como asistente para empleados que necesitan consultar políticas de devolución, stock o precios, el modelo puede invocar funciones internas del ERP o del PIM y resumir la información en lenguaje natural.
- Clasificación y enrutado de consultas entrantes: el modelo puede analizar el mensaje de un cliente y decidir qué función o departamento debe gestionarlo, actuando como capa de triaje en un sistema de tickets con razonamiento multi-paso.
- Generación de respuestas a reseñas y mensajes postventa: con el ajuste en dominio retail, puede redactar respuestas contextualizadas a reseñas de producto o mensajes de seguimiento, invocando datos del pedido para personalizar el contenido.
- Prototipado rápido de agentes de comercio: al ser un modelo de ~3,35B parámetros con pesos safetensors, es adecuado para experimentar con pipelines de function calling en entornos de desarrollo sin grandes presupuestos de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 6,7 GB solo para pesos (3,35B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, se recomienda un mínimo de 8-10 GB de VRAM para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 3,5-4 GB para pesos, más overhead; viable en GPUs de consumo con 6-8 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 1,8-2,5 GB para pesos; viable en GPUs de consumo de gama media con 4-6 GB, aunque no se publican variantes GGUF oficiales.
- GPUs recomendadas: para FP16 sin cuantizar, RTX 4090 (24 GB), A100 (40/80 GB) o H100 (80 GB) ofrecen margen amplio para contextos largos y concurrencia. Para cuantización, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB son suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs con 8 GB o más en FP16, y en GPUs de 4-6 GB con cuantización (si se generan pesos cuantizados, ya que el repo solo publica safetensors).
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM y TGI para serving de producción con arquitectura Cohere2 (verificar compatibilidad explícita con Cohere2 en la versión utilizada), llama.cpp/Ollama solo si se convierten los pesos a GGUF, ya que no se distribuyen en ese formato.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|
| GL3MON/tiny-aya-global-retail-sft | ~3,35B | no disponible | no disponible | Retail + function calling (SFT) | Gated en Hugging Face |
| GL3MON/tiny-aya-global-function-calling-sft (modelo base) | no disponible (presumiblemente similar) | no disponible | no disponible | Function calling general | Hugging Face |
| Familia Tiny Aya Global (modelo original) | no disponible | no disponible | no disponible | Multilingüe general | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican los términos de uso, lo que impide confirmar si el uso comercial está permitido. Es imprescindible contactar con el autor o revisar las condiciones del acceso gated antes de cualquier despliegue en producción.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que añade fricción a la integración automatizada y a los pipelines de CI/CD.
- Idiomas no declarados: aunque la familia Aya es multilingüe, no se confirma qué idiomas conserva el ajuste ni su calidad en cada uno; el ajuste en retail podría haber degradado el rendimiento en idiomas no representados en el dataset de SFT.
- Contexto no documentado: se desconoce la longitud máxima de contexto, lo que dificulta planificar conversaciones largas o documentos extensos.
- Riesgo de alucinación: como todo LLM, puede generar información incorrecta sobre productos, precios o políticas; en dominio retail, esto es especialmente crítico y requiere validación contra sistemas de origen mediante tool calling.
- Sesgos: no se documenta ninguna evaluación de sesgos; el dataset de SFT podría introducir sesgos de dominio (productos, precios, geografías) no caracterizados.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, sin documentación de model card más allá de los metadatos; no hay evidencia de validación por parte de la comunidad.
- Formato limitado: solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales, lo que limita el despliegue en entornos con llama.cpp u Ollama sin conversión manual.
- Modelo fusionado: al ser un merge, no se detalla qué adaptadores se combinaron ni con qué método, lo que dificulta la reproducibilidad del ajuste.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GL3MON/tiny-aya-global-retail-sft
- Modelo base: https://huggingface.co/GL3MON/tiny-aya-global-function-calling-sft
