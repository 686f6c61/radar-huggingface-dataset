# sagea-ai/SAGE-2.6-Celer-Low

## Resumen

SAGE-2.6-Celer-Low es un modelo de lenguaje de 5B parámetros (4.659.865.088 parámetros según los pesos en safetensors) desarrollado por SAGEA. Forma parte de la familia SAGE 2.6, junto con Celer Mid (10B) y Celer High (27B), y está posicionado como la variante más ligera de la gama, orientada a inferencia eficiente en dispositivos de borde e infraestructura con recursos limitados.

El modelo emplea una arquitectura Transformer densa decoder-only con Grouped-Query Attention (GQA), una longitud de contexto de 256K tokens y un tokenizador específico para devanagari. Incorpora entrenamiento con cuantización consciente (INT8 e INT4) y una técnica propietaria denominada "Inverse Reasoning" orientada a mejorar el razonamiento multi-paso. Su relevancia actual radica en la combinación de contexto muy largo con un tamaño contenido, lo que permite despliegues locales y privados sin renunciar a ventanas de contexto amplias.

El modelo declara soporte nativo para inglés y nepalí (con optimización para hindi en devanagari según la model card), lo que lo hace poco habitual en el ecosistema open source, donde la cobertura de lenguas del sur de Asia suele ser limitada. La licencia no está especificada en la información disponible, lo que constituye una limitación importante para su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only con Grouped-Query Attention (GQA) |
| Parametros totales | 4.659.865.088 (~5B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | INT8 e INT4 (entrenamiento con cuantizacion consciente); no se detallan otros formatos |
| Idiomas soportados | Ingles (en) y nepalí (ne); optimizacion adicional para hindi en devanagari segun la model card |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SAGE-2.6-Celer-Low es un Transformer denso decoder-only con Grouped-Query Attention, lo que reduce el coste de memoria de la caché KV frente a la atención multi-cabeza tradicional, un aspecto crítico para sostener una ventana de contexto de 256K tokens con un presupuesto de VRAM ajustado. La model card menciona "modificaciones estructurales y preentrenamiento continuado", aunque no se especifica qué modificaciones concretas se aplicaron ni sobre qué modelo base se realizó dicho preentrenamiento continuado.

El entrenamiento incluye una fase denominada "Inverse Reasoning", descrita únicamente como una técnica para mejorar el razonamiento multi-paso, sin que la información disponible detalle su funcionamiento. También se menciona entrenamiento con cuantización consciente para despliegue en INT8 e INT4. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. El tokenizador es específico para devanagari, lo que explica la cobertura declarada del nepalí y el hindi.

## Capacidades

- Generación de texto general y conversación multi-turno con ventanas de hasta 256K tokens.
- Razonamiento multi-paso mediante la técnica propietaria "Inverse Reasoning".
- Capacidades multilingües centradas en inglés, nepalí e hindi en escritura devanagari.
- Generación de código, según los usos previstos declarados por el autor (aplicaciones, RAG, coding).
- Idoneidad para RAG sobre documentos largos gracias al contexto extendido.
- Inferencia eficiente en INT8 e INT4 por entrenamiento con cuantización consciente.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente local en dispositivos de borde: con ~5B parámetros y cuantización INT4, el modelo puede ejecutarse en GPU de consumo y en equipos con VRAM limitada, ofreciendo un asistente privado sin dependencia de la nube.
- RAG sobre corpus extensos: la ventana de 256K tokens permite ingerir documentación completa, expedientes o bases de conocimiento de gran tamaño en una sola pasada, reduciendo la necesidad de chunking agresivo.
- Aplicaciones multilingües para el sur de Asia: el tokenizador de devanagari y la optimización para nepalí e hindi lo hacen adecuado para atención al ciudadano, traducción asistida o generación de contenido en esos idiomas.
- Despliegue privado en entornos con requisitos de confidencialidad: al ser un modelo pequeño y ejecutable en local, encaja en escenarios donde los datos no pueden salir de la infraestructura de la organización.
- Generación de código en pipelines de desarrollo: la model card cita el coding entre los usos previstos; puede integrarse como asistente de autocompletado o revisión en entornos con recursos acotados.
- Prototipado e investigación: su tamaño contenido y su contexto largo lo hacen útil para experimentos de razonamiento multi-paso y evaluación de técnicas como Inverse Reasoning en laboratorios con presupuesto de cómputo limitado.
- Sistemas de resumen de documentos largos: informes, transcripciones o artículos que superan la ventana típica de 8K-32K pueden procesarse de una vez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, aproximadamente 9,3 GB solo para pesos (coincide con el tamaño del repo), más caché KV; en INT8, en torno a 4,7 GB; en INT4, en torno a 2,4 GB, sin contar la caché KV.
- La caché KV para 256K tokens con GQA puede ser considerable; para contextos muy largos se recomienda planificar memoria adicional o limitar la longitud efectiva de contexto.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 256K y serving de alta concurrencia; RTX 4090 (24 GB) para contexto largo en FP16; RTX 3090/4080 y similares para cuantización INT8/INT4.
- Cabe en GPU de consumo: sí, especialmente en cuantizaciones INT8 e INT4; en FP16 encaja en tarjetas de 16-24 GB para contextos moderados.
- Opciones de despliegue: vLLM y TGI para serving con pesos safetensors; llama.cpp y Ollama si se generan conversiones GGUF (no confirmadas en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SAGE-2.6-Celer-Low | ~5B | 256K | no disponible | HuggingFace (sagea-ai) | GQA, tokenizador devanagari, Inverse Reasoning |
| SAGE-2.6-Celer-Mid | 10B | no disponible | no disponible | Familia SAGE 2.6 | Variante superior de la misma familia |
| SAGE-2.6-Celer-High | 27B | no disponible | no disponible | Familia SAGE 2.6 | Variante tope de la misma familia |
| Alternativas de ~7B del ecosistema open source | ~7B | 8K-128K segun modelo | variables | amplia | No se dispone de datos comparativos de rendimiento con este modelo |

No se dispone de resultados de benchmarks que permitan una comparación cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- La model card advierte de que el modelo puede producir información incorrecta o engañosa y no debe usarse como único decisor en aplicaciones de alto impacto.
- El rendimiento puede variar sustancialmente entre idiomas, dominios y tareas; la cobertura fuera de inglés, nepalí e hindi no está garantizada.
- La licencia no está especificada, lo que impide confirmar si se permite uso comercial; es un bloqueante para producción hasta aclararlo.
- No hay información publicada sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- El contexto de 256K no implica calidad uniforme en todo el rango; el rendimiento en ventanas muy largas no está documentado.
- Riesgo de alucinación inherente a los modelos de lenguaje; sin benchmarks publicados no es posible acotar su magnitud.
- El número de descargas (3) y likes (1) indica una adopción muy baja, con escasa validación por parte de la comunidad.
- No se confirma soporte de tool calling, agentes ni formatos GGUF en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sagea-ai/SAGE-2.6-Celer-Low
- Technical Card (arXiv): https://arxiv.org/abs/2604.14168
