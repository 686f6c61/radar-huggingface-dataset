# CMSManhattan/JiRackUltra_32b

## Resumen

JiRack Ultra 32B es un modelo de lenguaje de 32 763 876 352 parámetros (~32,8 mil millones) desarrollado por CMSManhattan, diseñado específicamente para inferencia eficiente en CPU. Se basa en la arquitectura DeepSeek R1-32B, pero ha sido refactorizado con características ternarias estilo BitNet (1,58 bits), lo que permite una compresión significativa y un menor consumo de memoria sin sacrificar excesivamente la calidad. El modelo incorpora un tokenizer ampliado con etiquetas especiales para routing, tool-call, robótica, visión, sonido y media, lo que lo orienta a aplicaciones de agentes y sistemas conversacionales avanzados.

La relevancia actual de este modelo radica en su enfoque en el despliegue económico en infraestructura CPU, evitando la necesidad de GPUs costosas. Se distribuye en formato GGUF con varias cuantizaciones (Q4_K_M, Q3_K_M, Q2_K) y también en safetensors de precisión completa. El autor ofrece además servicios de compresión ternaria personalizada mediante QAT (quantization-aware training) y adaptación a tareas específicas. Sin embargo, la documentación pública es limitada: no se especifican datos de entrenamiento, longitud de contexto ni resultados de benchmarks, y la licencia presenta una contradicción entre la etiqueta MIT en HuggingFace y las condiciones comerciales descritas en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek R1-32B con soporte ternario (BitNet, 1,58 bits) |
| Parametros totales | 32 763 876 352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (full), Q4_K_M (~19,5 GB), Q3_K_M (~16,2 GB), Q2_K (~13,1 GB), TQ2_0 (mencionado, con soporte AVX2/AVX-512) |
| Idiomas soportados | en, zh, ja, ko, fr, es, pt, de, it, ru, ar, vi, th |
| Licencia | MIT (etiqueta en HuggingFace) pero con condiciones comerciales descritas en la model card (suscripción de pago, ver limitaciones) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura DeepSeek R1-32B, conocida por sus capacidades de razonamiento, y ha sido refactorizado para incorporar pesos ternarios estilo BitNet (valores en {-1, 0, 1}), lo que reduce drásticamente el uso de memoria y acelera la inferencia en CPU. Esta modificación es la principal innovación técnica, junto con un tokenizer extendido que añade tokens especiales para routing, media, visión, sonido, tool-call y robótica, pensados para facilitar la integración en sistemas agénticos y de automatización.

No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni las técnicas de alineación (RLHF, DPO, etc.). El autor menciona la posibilidad de realizar QAT (quantization-aware training) personalizado sobre datasets del cliente, así como procesos de adaptación para evitar el olvido catastrófico, pero estos son servicios ofrecidos bajo NDA, no información pública sobre el entrenamiento original.

## Capacidades

- Generación de texto y razonamiento, heredadas de la arquitectura DeepSeek R1-32B.
- Soporte de tool calling y function calling, habilitado por los tokens especiales de tool-call en el tokenizer.
- Capacidades de routing, que permiten dirigir consultas a módulos o expertos específicos dentro de un sistema mayor.
- Tokens para robótica, orientados a integración con sistemas de control y automatización.
- Soporte multilingüe en 13 idiomas: inglés, chino, japonés, coreano, francés, español, portugués, alemán, italiano, ruso, árabe, vietnamita y tailandés.
- Optimización para CPU, con cuantizaciones GGUF que permiten ejecución en hardware sin GPU.
- Interfaz web integrada (JiRack UI) y despliegue mediante Docker.

## Casos de uso

- Despliegue de modelos en CPU de bajo coste: gracias a sus cuantizaciones Q4_K_M (~19,5 GB) y Q2_K (~13,1 GB), el modelo puede ejecutarse en servidores sin GPU, reduciendo significativamente los costes de infraestructura cloud. Es adecuado para entornos donde el presupuesto de hardware es limitado.
- Sistemas RAG (Retrieval-Augmented Generation): el autor lo recomienda como modelo experto en arquitecturas RAG, donde puede combinarse con un servidor Java ONNX para gestionar grandes volúmenes de documentos.
- Asistentes conversacionales multilingües: con soporte para 13 idiomas, puede desplegarse en aplicaciones de atención al cliente o asistentes virtuales que requieran cobertura internacional.
- Agentes con tool calling: los tokens especiales de tool-call permiten integrar el modelo en pipelines de automatización donde debe invocar funciones externas, como consultas a APIs o bases de datos.
- Automatización robótica: los tokens de robótica sugieren un uso en sistemas de control de robots o en la generación de comandos para dispositivos físicos, aunque no se detallan las capacidades exactas.
- Inferencia en entornos edge: las cuantizaciones extremas (Q2_K) y el soporte para instrucciones AVX2/AVX-512 en CPU permiten ejecutar el modelo en estaciones de trabajo o dispositivos con recursos limitados, como ordenadores de sobremesa con 24 GB de RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se ofrecen comparaciones cuantitativas con otros modelos. La ausencia de estos datos impide evaluar objetivamente su rendimiento frente a alternativas similares.

## Requisitos de hardware

- RAM estimada según cuantización (según la tabla del autor):
  - Full (FP16): ~65 GB de almacenamiento, 64–72 GB de RAM.
  - Q4_K_M: ~19,5 GB de almacenamiento, 20–28 GB de RAM.
  - Q3_K_M: ~16,2 GB de almacenamiento, 17–24 GB de RAM.
  - Q2_K: ~13,1 GB de almacenamiento, 14–20 GB de RAM.
- CPU recomendada: Ryzen 9, Intel i9 o Xeon para uso recomendado; CPU de alto número de núcleos para alto rendimiento; procesadores modernos de 12+ núcleos para configuraciones de baja memoria.
- No requiere GPU. El modelo está específicamente optimizado para inferencia en CPU.
- Opciones de despliegue: contenedores Docker oficiales, servidor ONNX Java, cliente Windows con API Ollama, y compatibilidad con llama.cpp (por el formato GGUF).
- Latencia y throughput: no se proporcionan datos concretos. El autor indica "good interactive" para Q4 en CPU recomendada, pero sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Optimización CPU | Disponibilidad |
|---|---|---|---|---|---|
| JiRack Ultra 32B | 32,8 B | no disponible | MIT (etiqueta) / comercial (model card) | Sí, ternario BitNet | HuggingFace, Docker |
| DeepSeek R1-32B | 32,8 B | 128 K (según documentación oficial) | MIT | No específica | HuggingFace |
| Qwen2.5-32B | 32,8 B | 128 K | Apache 2.0 | No específica | HuggingFace |
| Llama 3.1 32B | 32,8 B | 128 K | Llama 3.1 Community License | No específica | HuggingFace |

La comparativa se limita a aspectos estructurales porque no hay datos de rendimiento para JiRack Ultra 32B. Su principal diferenciador es la optimización ternaria para CPU, que no está presente en los otros modelos de forma nativa. Sin embargo, los modelos alternativos ofrecen documentación mucho más completa, incluyendo contexto, benchmarks y licencias claras.

## Limitaciones y advertencias

- Licencia contradictoria: la etiqueta de HuggingFace indica MIT, pero la model card describe una licencia comercial con suscripción de pago ($1/mes/usuario para uso no empresarial, $3/mes/usuario para empresas, o $12/año/usuario). Esta ambigüedad puede generar problemas legales en despliegues comerciales.
- Sin datos de entrenamiento: no se especifica el corpus, el número de tokens ni las técnicas de alineación, lo que dificulta evaluar posibles sesgos o limitaciones de conocimiento.
- Longitud de contexto no documentada: se desconoce la ventana de contexto máxima, un parámetro crítico para aplicaciones de RAG o conversaciones multi-turno largas.
- Sin benchmarks publicados: no es posible comparar su calidad con otros modelos de forma objetiva.
- Riesgo de alucinación: al ser un modelo de razonamiento, puede generar respuestas plausibles pero incorrectas, especialmente en dominios especializados.
- Capacidades de visión y sonido declaradas solo a nivel de tokens: no hay evidencia de que el modelo procese realmente imágenes o audio; los tokens podrían ser simplemente marcadores de posición.
- Soporte limitado del autor: el modelo parece mantenido por un único desarrollador (CMSManhattan), con servicios adicionales bajo NDA, lo que puede afectar a la continuidad y al soporte en producción.
- Tamaño del repositorio (244,8 GB) sugiere que incluye múltiples formatos y variantes, pero puede resultar confuso para usuarios que descarguen todo el contenido sin necesidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CMSManhattan/JiRackUltra_32b
- Tokenizer especializado: https://huggingface.co/CMSManhattan/JiRackPrecisionTokenizer
- Cliente Windows (con API Ollama): https://huggingface.co/kgrabko/JiRackTernary_1b/resolve/main/jirack-chat.zip
- Contacto por email: support@cmsmanhattan.com
