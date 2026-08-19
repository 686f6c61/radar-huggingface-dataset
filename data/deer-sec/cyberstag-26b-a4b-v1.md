# deer-sec/CyberStag-26B-A4B-v1

## Resumen

CyberStag-26B-A4B-v1 es un modelo de lenguaje especializado en ciberseguridad y razonamiento lógico profundo, desarrollado por deer-sec sobre la arquitectura MoE (Mixture of Experts) del modelo base Google Gemma-4-26B-A4B. El modelo ha sido ajustado mediante LoRA con el framework MLX, y los adaptadores se han fusionado en el modelo base para facilitar su despliegue. Está diseñado como un motor de razonamiento para profesionales de seguridad, analistas SOC y administradores de sistemas, con capacidades mejoradas en modelado de amenazas, evaluación de vulnerabilidades, interpretación de logs y estructuración de estrategias de respuesta a incidentes.

El modelo es exclusivamente de texto, sin soporte multimodal, y se distribuye en múltiples formatos (MLX y GGUF) para adaptarse a distintos entornos de hardware, desde estaciones de trabajo hasta dispositivos con recursos limitados. La licencia Apache 2.0 permite uso comercial, modificación y redistribución sin restricciones. El ajuste se realizó sobre un conjunto de datos destilado y curado centrado en conceptos avanzados de seguridad, inteligencia de amenazas y deducción lógica, aunque los detalles específicos del conjunto de entrenamiento no se han hecho públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Gemma-4-26B-A4B |
| Parametros totales | 25.23B (según model card; el nombre del modelo indica 26B) |
| Parametros activos | 4B (según nomenclatura A4B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX bf16, MLX optiq8 (8-bit dinámico), GGUF f16, GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | Multilingüe (específicamente en, ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors), GGUF |

## Arquitectura y entrenamiento

CyberStag-26B-A4B-v1 se basa en la arquitectura MoE de Gemma-4-26B-A4B, que combina un total de 25.23B parámetros con 4B activos por token, lo que permite un equilibrio entre capacidad y eficiencia computacional. El ajuste fino se realizó mediante LoRA (Low-Rank Adaptation) con la librería `mlx_lm.lora`, actualizando aproximadamente el 1.778% de los parámetros (unos 448.7M). La estrategia de entrenamiento abarcó de forma amplia las capas de atención y MLP, incluyendo proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y las capas de expertos, con el objetivo de capturar la terminología y las estructuras de código de ciberseguridad sin provocar olvido catastrófico.

El conjunto de datos de entrenamiento, aunque no se detalla públicamente, fue curado y destilado específicamente para cubrir conceptos avanzados de seguridad, inteligencia de amenazas, deducción lógica y escenarios complejos de ataque y defensa. Los adaptadores LoRA se fusionaron completamente en el modelo base tras el entrenamiento, lo que simplifica el despliegue y evita la necesidad de cargar pesos adicionales en tiempo de inferencia. No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores al ajuste.

## Capacidades

- Análisis y descomposición de vectores de ataque complejos, con propuestas de estrategias de mitigación.
- Interpretación de logs de sistema y acceso, incluyendo detección de posibles inyecciones SQL u otras vulnerabilidades.
- Modelado de amenazas y evaluación de vulnerabilidades en infraestructuras y aplicaciones.
- Estructuración de estrategias de respuesta a incidentes paso a paso.
- Razonamiento lógico profundo y deductivo, con un ligero aumento del tiempo de "pensamiento" (latencia) que produce respuestas más analíticas.
- Soporte multilingüe, con especial atención a inglés y japonés.
- Capacidad de generación de texto y razonamiento, pero sin soporte multimodal (solo texto).

## Casos de uso

- Análisis de logs de servidor: el modelo puede examinar registros de acceso y sistemas para identificar patrones sospechosos, como intentos de inyección SQL o accesos no autorizados, y sugerir acciones correctivas.
- Evaluación de vulnerabilidades: a partir de descripciones de sistemas o configuraciones, puede ayudar a identificar posibles debilidades y recomendar parches o configuraciones seguras.
- Modelado de amenazas: permite descomponer escenarios de ataque complejos, enumerar vectores y proponer defensas en capas, útil para equipos de seguridad ofensiva y defensiva.
- Respuesta a incidentes: puede estructurar planes de respuesta paso a paso, priorizando acciones según la gravedad y el contexto, y ayudar a redactar informes post-incidente.
- Formación y concienciación en seguridad: sirve como herramienta educativa para explicar mecánicas de ataques (CSRF, XSS, etc.) y buenas prácticas de mitigación.
- Soporte a analistas SOC: integrable en flujos de trabajo de triaje de alertas, proporcionando contexto y recomendaciones accionables para acelerar la toma de decisiones.
- Auditoría de código: aunque no se menciona explícitamente, su capacidad para interpretar estructuras de código y terminología de seguridad lo hace útil para revisar fragmentos de código en busca de fallos comunes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la información disponible. La model card únicamente menciona mejoras cualitativas frente al modelo base en contextos de ciberseguridad, como mayor precisión en respuestas y razonamiento más profundo, pero sin cifras concretas de MMLU, HumanEval u otros estándares.

## Requisitos de hardware

- No se proporcionan requisitos exactos de VRAM en la documentación del modelo.
- Al tratarse de un modelo MoE con 4B parámetros activos, el consumo de memoria en inferencia es menor que el de un modelo denso de 25B, pero sigue requiriendo una GPU con VRAM suficiente para cargar los pesos completos (aproximadamente 25B parámetros en bf16 o f16, lo que supera los 16 GB típicos de GPUs de consumo).
- Para entornos con VRAM limitada, se recomienda el formato GGUF Q4_K_M, que reduce significativamente el footprint de memoria y es adecuado para GPUs de gama media (por ejemplo, RTX 3090 o superior).
- Los formatos MLX están optimizados para Apple Silicon, por lo que pueden ejecutarse en Macs con chip M-series, aunque el rendimiento dependerá de la memoria unificada disponible.
- Opciones de despliegue: MLX (para Apple Silicon), llama.cpp y LM Studio (para GGUF). No se menciona compatibilidad con vLLM, TGI u otros servidores de inferencia.
- La latencia es ligeramente superior a la del modelo base debido al mayor tiempo de razonamiento, pero no se proporcionan cifras de throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la categoría de ciberseguridad con el mismo tamaño y arquitectura. La model card solo compara cualitativamente con el modelo base Gemma-4-26B-A4B, indicando mejoras en calidad de respuesta y profundidad de razonamiento. No se mencionan alternativas como otros modelos especializados en seguridad (por ejemplo, WhiteRabbitNeo o SecLM), por lo que la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo exclusivamente de texto: no procesa imágenes, audio ni otros formatos multimodales.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en dominios técnicos donde la precisión es crítica; se recomienda verificar las salidas con fuentes fiables.
- El conjunto de datos de entrenamiento es confidencial, lo que limita la trazabilidad y la auditoría de posibles sesgos.
- Aunque el modelo está ajustado para ciberseguridad, no debe utilizarse para generar exploits, accesos no autorizados o cualquier actividad maliciosa; la model card restringe su uso a fines educativos y de defensa.
- El soporte multilingüe se centra en inglés y japonés; el rendimiento en otros idiomas puede ser inferior.
- La latencia aumentada (tiempo de pensamiento) puede ser un inconveniente en aplicaciones que requieren respuestas en tiempo real.
- No se especifica la longitud de contexto máxima, lo que dificulta planificar su uso en tareas que requieran ventanas largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/deer-sec/CyberStag-26B-A4B-v1
- Modelo base (referencia): https://huggingface.co/google/gemma-4-26b-a4b
