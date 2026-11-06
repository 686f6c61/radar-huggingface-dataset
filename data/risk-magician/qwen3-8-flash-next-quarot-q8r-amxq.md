# risk-magician/Qwen3.8-Flash-Next-QuaRot-Q8R.amxq

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje causal con codificador de visión, publicado por el equipo Qwen (Alibaba) como vista previa experimental de la arquitectura que sustentará la próxima generación Qwen4. Se distribuye en formato Transformers y combina atención híbrida (Gated DeltaNet y Qwen Sparse Attention), Mixture-of-Experts con 512 expertos y una innovadora capa de embeddings de n-gramas que permite escalar parámetros con bajo coste computacional.

El modelo totaliza 125B parámetros con solo 6B activos por token, a los que se suman 51B parámetros de embeddings de n-gramas y 4B de multi-token prediction (MTP). Su ventana de contexto nativa es de 262.144 tokens, extensible hasta 1.000.000, lo que lo posiciona para cargas agénticas y de contexto largo. La variante publicada en este repositorio por el usuario `risk-magician` es una cuantización Q8R en formato `.amxq` de 180,4 GB.

Es relevante ahora porque representa la primera liberación de pesos abiertos bajo esta arquitectura híbrida, y porque su diseño prioriza la eficiencia en latencia de contexto largo, un cuello de botella crítico en despliegues agénticos reales. La licencia es Qwen Community 1.0, con implicaciones para uso comercial que conviene revisar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con codificador de visión; híbrida Gated DeltaNet + Qwen Sparse Attention + MoE + Gated Residual + N-gram Embedding |
| Parametros totales | 125B (más 51B de n-gram embedding y 4B de MTP) |
| Parametros activos | 6B |
| Longitud de contexto | 262.144 tokens nativos; extensible a 1.000.000 |
| Tipos de cuantizacion | Q8R (variante publicada en este repo); no se detallan otras en la información disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (license: other) |
| Formato de pesos | Transformers (safetensors); variante `.amxq` Q8R en este repositorio |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal híbrido con 48 capas organizadas en un patrón de 12 bloques, cada uno compuesto por 3 sub-bloques (Gated DeltaNet → MoE) seguidos de 1 sub-bloque (Qwen Sparse Attention → MoE). La dimensión oculta es 2560, con embedding de tokens de 248.320 (padded) y una capa de N-gram Embedding de 20 millones de entradas (bigramas/trigramas en la capa 2). La Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; la Qwen Sparse Attention usa 24 cabezas Q y 2 KV con dimensión 256, RoPE de 64 dimensiones, indexador MQA (4 cabezas Q, 1 KV compartida) y un presupuesto de 512 bloques o 2.048 tokens. El MoE tiene 512 expertos, 10 enrutados + 1 compartido activos, con dimensión intermedia de experto 640. El Gated Residual usa 4 ramas con rango de cuello de botella 320. Incluye una capa MTP entrenada con múltiples pasos.

El entrenamiento combina pre-entrenamiento y post-entrenamiento. Se aplican Muon y AdamW a categorías específicas de pesos, se eliminan los warmups tradicionales de batch size comenzando directamente en el tamaño objetivo, y se guía por leyes de escala reajustadas. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO explícitos, aunque la mención a "post-trained model" sugiere fases de alineación posteriores al pre-entrenamiento.

## Capacidades

- Generación de texto y razonamiento causal multi-turno.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con codificador de visión integrado.
- Soporte de contexto largo: 262.144 tokens nativos, extensible a 1.000.000.
- Decodificación multi-token (MTP) para acelerar la generación.
- Compatibilidad con tool calling y flujos agénticos (mencionado en el contexto de cargas agénticas y en la versión Qwen3.8-Flash con herramientas integradas).
- Capacidades multilingües: no detalladas en la información disponible.
- Compatible con vLLM, SGLang, TokenSpeed y Transformers para despliegue.

## Casos de uso

- Análisis de documentos extensos: con 262.144 tokens nativos, el modelo puede procesar contratos, informes o expedientes completos en una sola pasada sin chunking, manteniendo coherencia entre secciones.
- Agentes autónomos multi-paso: la combinación de tool calling, MTP y atención dispersa reduce la latencia por paso, lo que lo hace adecuado para bucles agénticos con muchas iteraciones.
- Asistencia sobre imágenes y texto: al ser un modelo image-text-to-text, puede responder preguntas sobre capturas, diagramas o documentos escaneados combinados con instrucciones textuales.
- Generación de código en pipelines: su compatibilidad con vLLM y SGLang permite integrarlo en servicios de autocompletado o revisión de código con contexto de repositorio largo.
- Atención al cliente con historial largo: conversaciones multi-turno con contexto de cientos de miles de tokens permiten mantener memoria de interacciones previas sin resumen.
- Investigación y prototipado de arquitecturas híbridas: al ser una vista previa experimental de Qwen4, es útil para estudiar el comportamiento de Gated DeltaNet + QSA + N-gram Embedding en cargas reales.
- RAG de gran escala: la ventana extensible a 1M tokens permite inyectar muchos documentos recuperados en un solo prompt, reduciendo la necesidad de re-ranking agresivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de benchmarks con estilos CSS pero sin tabla de resultados legible en el material proporcionado.

## Requisitos de hardware

- VRAM estimada: la variante Q8R publicada ocupa 180,4 GB en disco, por lo que la inferencia requiere al menos ~180 GB de VRAM o memoria unificada para cargar los pesos completos.
- GPU recomendadas: para Q8R se necesitan configuraciones multi-GPU (varias A100 80GB, H100 80GB o H200) o nodos con memoria unificada grande; no cabe en una RTX 4090 (24 GB) ni en GPUs consumer de gama alta.
- Cuantizaciones más agresivas (no listadas en este repo) podrían reducir el requisito, pero no se dispone de datos concretos.
- Opciones de despliegue: Transformers, vLLM, SGLang y TokenSpeed según la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next | 125B (+51B n-gram, +4B MTP) | 6B | 262K–1M | qwen-community-1.0 | Pesos abiertos en HF |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones de modelos comparables que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Es una vista previa experimental ("experimental preview"), no un modelo de producción final; su comportamiento puede diferir del modelo oficial Qwen3.8-Flash.
- La licencia qwen-community-1.0 impone condiciones específicas para uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en producción.
- No se detallan los idiomas soportados ni la composición del dataset de entrenamiento, por lo que el rendimiento multilingüe es incierto.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fiabilidad en la información disponible.
- La cuantización Q8R en formato `.amxq` es una conversión de terceros (`risk-magician`), no oficial de Qwen; puede introducir degradaciones respecto a los pesos originales.
- El tamaño de 180,4 GB limita el despliegue a infraestructura de gama alta; no es viable en hardware consumer.
- No se han publicado resultados de benchmarks en la información disponible, lo que impide validar afirmaciones de rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/risk-magician/Qwen3.8-Flash-Next-QuaRot-Q8R.amxq
- Blog oficial: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Qwen Cloud (servicio gestionado): https://www.qwencloud.com
- Overview Qwen3.8-Flash: https://www.qwencloud.com/models/qwen3.8-flash
- Imagen de arquitectura: https://qianwen-res.oss-accelerate.aliyuncs.com/Qwen3.8-Flash-Next/architecture.png
