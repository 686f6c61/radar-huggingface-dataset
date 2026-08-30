# Guile/XYZAILab_XYZ-Aquila-mini-GGUF

## Resumen

XYZAILab/XYZ-Aquila-mini es un modelo multimodal (imagen-texto) de 34.660 millones de parámetros desarrollado por XYZAILab (XYZ AI Lab), un laboratorio de investigación centrado en la integración de agentes y humanos mediante técnicas de post-entrenamiento basadas en IA («Bounded AI4AI»). El modelo está diseñado para tareas de búsqueda agéntica (agentic search), conversación multimodal y razonamiento guiado, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones. La versión aquí documentada es una cuantización GGUF realizada por bartowski con llama.cpp (versión b10142) utilizando la opción imatrix, que reduce el tamaño del modelo para facilitar su ejecución en hardware de consumo.

El modelo base fue publicado originalmente en safetensors y presenta un pipeline `image-text-to-text`, lo que indica que puede procesar simultáneamente imágenes y texto para generar respuestas. Aunque no se han publicado especificaciones detalladas de arquitectura ni de entrenamiento, el etiquetado como `qwen3.6` sugiere una posible relación con la familia Qwen, aunque no está confirmado. El formato de prompt sigue el estilo ChatML con soporte explícito de un modo «thinking» (el asistente comienza su respuesta con la palabra «thinking»), lo que apunta a un modelo optimizado para razonamiento paso a paso. La cuantización GGUF permite ejecutar el modelo en GPUs de consumo con 24 GB de VRAM (cuantización Q4) o en configuraciones de mayor capacidad para cuantizaciones más altas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `qwen3.6`, sin confirmar) |
| Parametros totales | 34.660.610.688 (~34,66 B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (69,38 GB), Q8_0 (36,91 GB), Q6_K_L (30,30 GB), Q6_K (30,05 GB), Q5_K_L (25,33 GB), Q5_K_M (25,02 GB), Q5_K_S (24,16 GB), Q4_1 (21,97 GB), Q4_K_L (21,77 GB), Q4_K_M (21,39 GB), Q4_K_S (20,59 GB), Q4_0 (19,94 GB), IQ4_NL (19,86 GB), IQ4_XS (18,81 GB), Q3_K_XL (17,33 GB), IQ3_M (16,90 GB), Q3_K_L (16,89 GB), Q3_K_M (16,23 GB), IQ3_XS (tamaño no listado) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones) y safetensors (modelo original) |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna del modelo (número de capas, tipo de atención, mecanismos de visión, etc.). El pipeline `image-text-to-text` indica que integra un codificador visual y un decodificador de lenguaje, pero los detalles técnicos no han sido publicados en la documentación accesible. El etiquetado como `qwen3.6` sugiere que podría basarse en la arquitectura de la serie Qwen de Alibaba, aunque no hay confirmación por parte de XYZAILab.

En cuanto al entrenamiento, no se han publicado datos sobre el número de tokens, la composición del dataset ni las técnicas de alineación empleadas (RLHF, DPO, etc.). La web del laboratorio menciona el uso de «AI4AI» (bounded AI for AI) para el post-entrenamiento, lo que implica un proceso iterativo donde agentes de IA participan en el refinamiento del modelo, pero sin detalles cuantitativos. La cuantización GGUF fue realizada con llama.cpp b10142 usando el dataset imatrix de bartowski, un método que optimiza las tablas de cuantización para minimizar la pérdida de calidad.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto simultáneamente (pipeline `image-text-to-text`), lo que permite responder a preguntas sobre imágenes, describir contenido visual o combinar información de ambos canales.
- Búsqueda agéntica: el modelo está diseñado para tareas de búsqueda de información con verificación de hechos, descomposición de consultas complejas y síntesis de respuestas a partir de múltiples fuentes (según la web oficial de XYZ-Aquila).
- Conversación multi-turno: soporta diálogos extensos con formato ChatML (`<|im_start|>` y `<|im_end|>`), lo que lo hace adecuado para asistentes conversacionales.
- Modo «thinking»: el formato de prompt incluye una sección explícita de razonamiento (el asistente genera ` thinking` antes de la respuesta final), indicando capacidad de razonamiento paso a paso.
- Cuantizaciones GGUF optimizadas con imatrix: disponibles en un amplio rango de tamaños (desde 16,9 GB hasta 69,4 GB), lo que facilita su despliegue en distintos tipos de hardware.

## Casos de uso

- Asistencia visual para personas con discapacidad: el modelo puede describir imágenes en tiempo real (por ejemplo, fotografías de entorno, etiquetas de productos o documentos escaneados) y responder preguntas de seguimiento en lenguaje natural, ayudando a usuarios con discapacidad visual en tareas cotidianas.
- Análisis de documentos con contenido gráfico: en entornos empresariales, se puede utilizar para extraer información de informes que combinan tablas, gráficos y texto, generando resúmenes ejecutivos o respondiendo consultas específicas sobre los datos representados.
- Chatbot de atención al cliente con soporte de capturas de pantalla: los usuarios pueden adjuntar una imagen de un error o una pantalla de configuración, y el modelo interpreta la imagen junto con el texto del mensaje para ofrecer soluciones paso a paso, gracias a su capacidad multimodal y de conversación multi-turno.
- Agente de búsqueda verificada para periodistas o investigadores: el modelo descompone preguntas complejas en subconsultas, busca evidencia en documentos (incluyendo imágenes de archivo) y sintetiza una respuesta con referencias, aprovechando su orientación a búsqueda agéntica y su modo de razonamiento explícito.
- Generación de descripciones de imágenes para accesibilidad web: integrado en un pipeline de publicación, el modelo puede generar automáticamente textos alternativos (alt text) detallados para imágenes de sitios web, mejorando el cumplimiento de normativas de accesibilidad.
- Asistente educativo multimodal: estudiantes pueden subir fotografías de problemas matemáticos escritos a mano o diagramas de ciencias, y el modelo explica la solución paso a paso, combinando el análisis visual con el razonamiento textual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K, ni de evaluaciones específicas de tareas multimodales (como VQAv2 o MMMU) para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantización Q4_K_M (21,39 GB) requiere al menos 24 GB de VRAM para dejar margen para el contexto y las activaciones. La Q6_K (30,05 GB) necesita 32 GB o más. La Q8_0 (36,91 GB) requiere 40 GB o más.
- GPUs recomendadas: RTX 3090 o RTX 4090 (24 GB) pueden ejecutar cuantizaciones Q4 y Q5. Para Q6 y Q8 se recomienda A100 40 GB, A6000 48 GB o configuraciones multi-GPU.
- En consumer GPU: sí, las cuantizaciones Q4_K_M y Q4_K_S (20,59 GB) caben en GPUs de 24 GB como la RTX 3090/4090. Las cuantizaciones Q3 (16-17 GB) caben en GPUs de 16 GB (por ejemplo, RTX 4080, aunque con margen ajustado).
- Opciones de despliegue: llama.cpp (soporte nativo), LM Studio, koboldcpp, Jan AI, Text Generation Web UI, LoLLMs, Atomic Chat, y herramientas compatibles con GGUF como ramalama. Para el modelo original en safetensors se podría usar vLLM o TGI, pero no hay confirmación de compatibilidad.
- Latencia y throughput: no disponible. Dependerá del hardware, la cuantización y la longitud del contexto.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos. Por tamaño y modalidad, el modelo podría situarse en la misma categoría que otros modelos multimodales de ~30-35B parámetros como Qwen2-VL-32B o LLaVA-NeXT-34B, pero no hay información pública que permita una comparación objetiva en términos de calidad o velocidad. La licencia Apache 2.0 es más permisiva que la de algunos competidores (por ejemplo, Qwen2-VL usa licencia Apache 2.0 también, mientras que LLaVA usa MIT). No se puede realizar una comparativa cuantitativa fiable sin datos de benchmarks.

## Limitaciones y advertencias

- Al ser una cuantización GGUF, se introduce una pérdida de calidad respecto al modelo original en bf16, especialmente en cuantizaciones bajas (Q3, IQ3). Las cuantizaciones Q4_K_M y superiores mantienen un buen equilibrio entre tamaño y fidelidad, pero no son idénticas al modelo completo.
- No hay documentación pública sobre sesgos, alucinaciones o comportamiento en dominios específicos. Es recomendable realizar evaluaciones propias antes de usarlo en producción.
- El modelo es muy reciente (creado en agosto de 2026) y el ecosistema de soporte (integración en frameworks, herramientas de evaluación) puede ser limitado o inmaduro.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe verificar que el modelo base no incorpore componentes con licencias más restrictivas (no hay evidencia de ello, pero tampoco se ha publicado una declaración explícita de origen de los datos de entrenamiento).
- La longitud de contexto no está documentada. Para aplicaciones que requieran ventanas largas (más de 8K tokens), es necesario probar el modelo empíricamente.
- El formato de prompt incluye un token ` thinking` que el modelo genera automáticamente; si se usa con herramientas que no esperan este token, puede haber problemas de formato en la salida.

## Enlaces

- Repositorio de cuantizaciones GGUF (Guile): https://huggingface.co/Guile/XYZAILab_XYZ-Aquila-mini-GGUF
- Modelo original (XYZAILab): https://huggingface.co/XYZAILab/XYZ-Aquila-mini
- Perfil de XYZAILab en Hugging Face: https://huggingface.co/XYZAILab
- Página oficial de XYZ-Aquila (agente de búsqueda): https://xyz-lab.ai/xyz-aquila/?lang=en
- Página de XYZAILab (laboratorio): https://xyz-lab.ai/
- Modelo en ModelScope: https://modelscope.ai/models/XYZAILab/XYZ-Aquila-mini
- Repositorio de cuantizaciones de bartowski (referencia de la model card): https://huggingface.co/bartowski/XYZAILab_XYZ-Aquila-mini-GGUF
