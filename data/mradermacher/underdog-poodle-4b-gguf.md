# mradermacher/Underdog-Poodle-4B-GGUF

## Resumen

Underdog-Poodle-4B-GGUF es la versión cuantizada en formato GGUF del modelo ConwayResearch/Underdog-Poodle-4B, publicada por mradermacher, un conocido autor de cuantizaciones estáticas para llama.cpp y ecosistemas compatibles. El modelo base es un transformer denso de aproximadamente 4.326 millones de parámetros (4,3B), orientado específicamente a tool calling, function calling y flujos de agentes, según indican las etiquetas del repositorio.

La relevancia de esta ficha reside en que el repositorio original no está disponible en esta información: lo que se documenta aquí es el paquete de cuantizaciones GGUF, que incluye desde Q2_K (2,1 GB) hasta f16 (8,8 GB), además de dos suplementos multimodales mmproj (Q8_0 y f16). Esto permite ejecutar el modelo en hardware de consumo, algo imposible con los pesos en precisión completa.

La licencia es cc-by-nc-4.0, es decir, no permite uso comercial, y el único idioma declarado es el inglés. El modelo se distribuye bajo la librería transformers, aunque los ficheros GGUF están pensados para su uso con llama.cpp y derivados (Ollama, LM Studio, etc.). No se dispone de información sobre arquitectura interna, datos de entrenamiento ni benchmarks en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: ConwayResearch/Underdog-Poodle-4B; presumiblemente transformer denso, sin confirmar) |
| Parámetros totales | 4.326.350.848 (4,3B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-nc-4.0 (no comercial) |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original presumiblemente en safetensors, no confirmado |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base ConwayResearch/Underdog-Poodle-4B en la documentación proporcionada. El recuento de parámetros (4.326.350.848) y la presencia de ficheros mmproj multimodales sugieren un modelo denso con capacidad de visión, pero esto no se confirma explícitamente en la model card. Tampoco se detallan el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o similares.

Lo único documentado en esta ficha es el proceso de cuantización realizado por mradermacher: cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) generadas a partir del modelo base. Se ofrecen también cuantizaciones ponderadas/imatrix en un repositorio separado (Underdog-Poodle-4B-i1-GGUF), que suelen ofrecer mejor calidad por tamaño que las estáticas equivalentes. Los ficheros mmproj (Q8_0 de 0,5 GB y f16 de 0,8 GB) son suplementos multimodales, lo que apunta a que el modelo base incorpora un codificador visual, aunque no se especifica su naturaleza.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" del repositorio.
- Tool calling y function calling: el modelo está etiquetado explícitamente para estas tareas, lo que sugiere soporte para invocar herramientas externas mediante esquemas estructurados.
- Orientación a agentes: la etiqueta "agents" indica que el modelo base está pensado para flujos de razonamiento multi-paso con uso de herramientas.
- Capacidad multimodal: la presencia de ficheros mmproj en el repositorio GGUF indica soporte de entrada de imágenes en el modelo base, aunque no se detalla el alcance.
- Idiomas: únicamente inglés declarado; no hay evidencia de soporte multilingüe.
- No se dispone de información sobre modo "thinking", decodificación especulativa ni otras capacidades especiales.

## Casos de uso

- Agentes de automatización con herramientas: el modelo puede integrarse en pipelines donde deba decidir qué función invocar (APIs REST, consultas a bases de datos, envío de correos) gracias a su orientación explícita a tool calling, ejecutándose en local con cuantización Q4_K_M (2,9 GB).
- Asistentes de soporte técnico en inglés: con un contexto conversacional multi-turno, puede gestionar diálogos de atención al cliente en inglés desplegado en una estación de trabajo con GPU de consumo, siempre que el uso no sea comercial por la licencia.
- Prototipado de agentes en investigación: investigadores que necesiten un modelo pequeño (4,3B) para experimentar con arquitecturas de agentes y function calling sin depender de APIs externas, usando la cuantización Q8_0 (4,7 GB) para máxima fidelidad.
- Automatización de tareas de escritorio con entrada visual: los ficheros mmproj permiten, en teoría, procesar capturas de pantalla junto con instrucciones de texto para agentes que interactúan con interfaces gráficas, aunque la capacidad visual no está documentada en detalle.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantización más dos mmproj, lo que permite estudiar la degradación de calidad frente a tamaño en un modelo orientado a tool calling, usando las curvas de perplejidad referenciadas en la model card.
- Despliegue en entornos con recursos limitados: la cuantización Q2_K (2,1 GB) permite ejecutar el modelo en CPU o en GPUs con poca VRAM para tareas de clasificación o generación breve, aunque con pérdida de calidad notable.
- Integración en asistentes de código en local: si el modelo base conserva capacidades de generación de código (no confirmado), podría usarse como copiloto ligero en editores mediante llama.cpp u Ollama, con la ventaja de no enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ≈ 2,1 GB; Q4_K_M ≈ 2,9 GB; Q6_K ≈ 3,7 GB; Q8_0 ≈ 4,7 GB; f16 ≈ 8,8 GB. Añadir entre 0,5 y 0,8 GB si se usa el suplemento mmproj multimodal.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M (GTX 1650, RTX 3050); 6-8 GB para Q6_K y Q8_0 (RTX 3060, RTX 4060); 12 GB o más para f16 (RTX 3060 12GB, RTX 4070). En el segmento profesional, A100 y H100 son sobredimensionadas para este tamaño, pero válidas para servir múltiples instancias.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs modernas con 4 GB o más para cuantizaciones Q4 y superiores.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, text-generation-webui, y servidores compatibles con la API de OpenAI mediante llama.cpp server. El repositorio incluye la etiqueta "endpoints_compatible", lo que sugiere compatibilidad con endpoints estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas del modelo base que permitan una comparación rigurosa. La siguiente tabla recoge únicamente los datos conocidos de este modelo frente a referencias genéricas de la misma categoría (modelos densos de ~4B), marcando como "no disponible" lo que no se puede confirmar.

| Modelo | Parámetros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| Underdog-Poodle-4B-GGUF | 4,3B | no disponible | cc-by-nc-4.0 | GGUF (12 cuantizaciones) | Orientado a tool calling y agentes; multimodal vía mmproj |
| Alternativa de ~4B (genérica) | ~4B | no disponible | variable | variable | No se dispone de comparación específica en la información proporcionada |

No se han identificado en la documentación modelos comparables concretos con datos verificables; por tanto, la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Licencia cc-by-nc-4.0: prohíbe el uso comercial. Cualquier despliegue en producción con fines lucrativos requiere una licencia alternativa del autor original (ConwayResearch), que no se detalla en esta información.
- Idioma: solo inglés declarado; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Sesgos: no se documentan sesgos conocidos, pero al no disponerse de información sobre los datos de entrenamiento no es posible evaluar riesgos de sesgo demográfico, cultural o lingüístico.
- Alucinación: no hay evaluación publicada; como todo modelo generativo, existe riesgo de fabricar información, especialmente en tool calling con esquemas complejos.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide garantizar conversaciones multi-turno largas o documentos extensos.
- Cuantizaciones agresivas: Q2_K y Q3_K_S pueden degradar notablemente la calidad en tareas de function calling, donde la precisión del formato es crítica; se recomienda Q4_K_M o superior para agentes en producción.
- Capacidad multimodal no documentada: los ficheros mmproj existen, pero no se especifica qué tareas visuales soporta el modelo ni su calidad.
- Modelo base no verificado: esta ficha documenta únicamente la cuantización; el comportamiento real depende del modelo original, del que no se dispone de model card en la información proporcionada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Underdog-Poodle-4B-GGUF
- Modelo base: https://huggingface.co/ConwayResearch/Underdog-Poodle-4B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Underdog-Poodle-4B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Underdog-Poodle-4B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Licencia referenciada: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
