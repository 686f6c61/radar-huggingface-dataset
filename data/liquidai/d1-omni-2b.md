# LiquidAI/d1-Omni-2B

## Resumen

d1-Omni-2B es un modelo de decisión multimodal desarrollado por Liquid AI, construido sobre el modelo base LFM3-Omni-2B. A diferencia de los modelos generativos convencionales, d1-Omni-2B no produce tokens de forma autoregresiva: devuelve respuestas calibradas en un único forward pass, lo que lo convierte en un clasificador y extractor de información de altísima eficiencia. Procesa de forma nativa texto, imágenes y audio en el mismo paso de inferencia.

El modelo pertenece a la familia LFM3 de Liquid AI y añade capacidad de audio a su predecesor d1-2B. Su propuesta de valor es la latencia: 5,8 ms por decisión en una NVIDIA H100 y 3,7 ms en una AMD MI325X, o 12,4 ms y 8,2 ms respectivamente cuando se procesa un clip de audio de 10 segundos. Esto lo sitúa en el territorio de los modelos "system-one", pensados para decisiones rápidas y deterministas en lugar de generación abierta.

Con 2.166.928.384 parámetros (2,17B) y un backbone LFM3 híbrido de 24 capas, d1-Omni-2B es relevante para desarrolladores que necesitan clasificación, extracción de entidades, localización de objetos o estimación de cantidades con intervalos de confianza, en entornos de producción con requisitos estrictos de latencia y en despliegues edge o servidores modestos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM3 backbone híbrido, 24 capas: 13 convoluciones cortas con gating, 5 atenciones de ventana deslizante, 6 atenciones globales |
| Parámetros totales | 2.166.928.384 (2,17B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

d1-Omni-2B se construye sobre el backbone LFM3-Omni-2B, un transformer híbrido de 24 capas que combina tres tipos de bloques: 13 capas de convolución corta con gating (gated short convolutions), 5 capas de atención de ventana deslizante (sliding-window attention) y 6 capas de atención global. Esta mezcla busca reducir el coste computacional de la atención completa manteniendo capacidad de modelado de dependencias de largo alcance, algo coherente con el objetivo de inferencia de baja latencia.

El modelo es un checkpoint post-entrenado ("post-trained decision model") que parte de LFM3-Omni-2B. La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación principal no está en el entrenamiento sino en el paradigma de inferencia: en lugar de decodificación autoregresiva, el modelo emite una decisión calibrada en un solo forward pass, lo que elimina la latencia asociada a la generación token a token. Según la model card, las preguntas habladas obtienen puntuaciones dentro de 0,5 puntos de las escritas en tareas no vistas, lo que sugiere una alineación estrecha entre las modalidades de texto y audio.

## Capacidades

- Clasificación calibrada de texto, imágenes y audio en un único forward pass, sin generación de tokens.
- Extracción de texto, números y fechas junto con sus spans (posiciones en el texto de origen).
- Localización de objetos en imágenes.
- Estimación de cantidades con intervalo de confianza.
- Procesamiento nativo de audio: clips y preguntas habladas se tratan en el mismo paso que texto e imágenes.
- Procesamiento multimodal conjunto (audio-text-to-text como pipeline declarado).
- Soporte multilingüe en 16 idiomas: inglés, árabe, chino, francés, alemán, italiano, japonés, coreano, portugués, español, vietnamita, tailandés, indonesio, hindi, ruso y polaco.
- Decisiones de latencia de milisegundos (5,8 ms en H100, 3,7 ms en MI325X; 12,4 ms y 8,2 ms con clip de 10 segundos).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión generativa o audio generativo: no disponible; el modelo es de decisión, no generativo.

## Casos de uso

- Moderación de contenido en tiempo real: clasificación calibrada de texto, imagen y audio en milisegundos permite filtrar flujos de comentarios, imágenes subidas o audio en vivo sin introducir latencia perceptible en la aplicación.
- Extracción de entidades en documentos: el modelo devuelve texto, números y fechas con sus spans, lo que facilita pipelines de digitalización de facturas, contratos o formularios sin necesidad de un modelo generativo posterior.
- Enrutamiento de consultas en atención al cliente: clasificación de la intención de una consulta escrita o hablada (audio nativo) para dirigirla al departamento o agente adecuado, con la ventaja de que las preguntas habladas puntúan de forma casi idéntica a las escritas.
- Detección de objetos en imágenes industriales: localización de objetos en imágenes para control de calidad en líneas de producción, aprovechando la latencia de milisegundos por decisión.
- Estimación de cantidades con intervalos: aplicable a inventario, conteo de elementos en imágenes o estimaciones numéricas donde se requiere un rango de confianza en lugar de un valor puntual.
- Procesamiento de audio en dispositivos edge: al ser un modelo de 2,17B con decisiones de pocos milisegundos, puede desplegarse en entornos con recursos limitados para transcripción de intenciones, clasificación de comandos de voz o extracción de datos de llamadas.
- Análisis de llamadas y reuniones: clasificación y extracción de información de clips de audio de 10 segundos con latencias de 8-12 ms, adecuado para procesamiento por lotes de grandes volúmenes de grabaciones.
- Calibración de confianza en sistemas de decisión: al devolver respuestas calibradas, puede integrarse como capa de verificación o abstención en pipelines que requieren umbrales de confianza explícitos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card únicamente reporta métricas de latencia: 5,8 ms por decisión en NVIDIA H100 y 3,7 ms en AMD MI325X; 12,4 ms y 8,2 ms respectivamente con un clip de audio de 10 segundos. También indica que las preguntas habladas puntúan dentro de 0,5 puntos de las escritas en tareas no vistas, sin especificar la métrica concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 2,17B parámetros en safetensors, el repositorio ocupa 4,4 GB, lo que sugiere pesos en precisión de 16 bits. En fp16 se necesitarían aproximadamente 4,3 GB solo para pesos, más memoria para activaciones y buffers multimodales.
- GPU recomendadas: NVIDIA H100 y AMD MI325X son las referenciadas en la model card para las latencias reportadas. No se especifican otras GPU.
- ¿Cabe en GPU consumer? No confirmado en la información disponible. Por tamaño (2,17B), es plausible en GPUs consumer con suficiente VRAM, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: la librería declarada es transformers con custom_code (lfm3_omni). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: 5,8 ms por decisión en H100, 3,7 ms en MI325X; 12,4 ms y 8,2 ms con clip de audio de 10 segundos. El throughput no se reporta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Paradigma | Licencia |
|---|---|---|---|---|---|
| d1-Omni-2B (LiquidAI) | 2,17B | no disponible | texto, imagen, audio | decisión en un forward pass | lfm1.0 |
| d1-2B (LiquidAI) | no disponible | no disponible | texto, imagen | decisión en un forward pass | lfm1.0 |
| LFM3-Omni-2B (LiquidAI) | no disponible | no disponible | texto, imagen, audio | generativo | lfm1.0 |

La información disponible solo permite comparar con los modelos de la propia familia LFM3. d1-Omni-2B añade audio a d1-2B y se distingue de LFM3-Omni-2B por su paradigma de decisión no generativo. No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer comparaciones cuantitativas con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: el modelo no genera texto libre, por lo que el riesgo de alucinación en el sentido generativo es bajo; sin embargo, las decisiones calibradas pueden ser erróneas y la calibración no está verificada con benchmarks publicados.
- Limitaciones de contexto e idioma: la longitud de contexto no está especificada. Aunque soporta 16 idiomas, no se detalla el rendimiento por idioma ni si todos tienen la misma calidad.
- Restricciones de licencia: la licencia es lfm1.0 (etiquetada como "other"), lo que implica condiciones específicas que deben revisarse en el archivo LICENSE del repositorio antes de cualquier uso comercial. No se confirma en la información disponible si el uso comercial está permitido.
- Caveats para producción: el modelo está diseñado para decisiones, no para generación abierta; no debe emplearse como sustituto de un LLM generativo. Las latencias reportadas corresponden a hardware específico (H100, MI325X) y pueden no reproducirse en otras GPU. No hay datos publicados de benchmarks que permitan validar la calidad de las decisiones frente a alternativas.
- El modelo requiere custom_code (lfm3_omni) en transformers, lo que puede complicar la integración con otros frameworks de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/LiquidAI/d1-Omni-2B
- Modelo base LFM3-Omni-2B: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Modelo d1-2B: https://huggingface.co/LiquidAI/d1-2B
- Blog de lanzamiento de open d1: https://www.liquid.ai/blog/open-d1
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Consola / API: https://console.liquid.ai/dashboard
- Colección LFM3: https://huggingface.co/collections/LiquidAI/lfm3
