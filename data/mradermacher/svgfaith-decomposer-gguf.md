# mradermacher/SVGFaith-Decomposer-GGUF

## Resumen

SVGFaith-Decomposer es un modelo de lenguaje especializado en la descomposición de gráficos vectoriales SVG en grafos de escena (scene graphs), desarrollado originalmente por el usuario Yukinonooo y publicado en Hugging Face bajo licencia Apache 2.0. La versión aquí descrita es una cuantización GGUF estática realizada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo está etiquetado como basado en la familia Qwen 3.5 y cuenta con aproximadamente 9.200 millones de parámetros totales, lo que lo sitúa en la gama media de modelos densos actuales.

El propósito del modelo es abordar el problema de la fidelidad estructural en la generación y edición de SVG: en lugar de producir directamente código vectorial, descompone el gráfico en una representación intermedia de grafo de escena que preserva las relaciones jerárquicas y semánticas entre elementos. Esta aproximación permite verificar y manipular la estructura antes de renderizar, algo relevante para pipelines de generación de ilustraciones vectoriales, edición programática y evaluación automática de fidelidad. El modelo está referenciado con el paper arXiv:2611.06048, aunque no se dispone del contenido de dicho paper en la información proporcionada.

La relevancia actual del modelo radica en su especialización vertical: frente a modelos generalistas que generan SVG con errores estructurales frecuentes, SVGFaith-Decomposer propone una descomposición explícita que facilita la validación. La versión GGUF de mradermacher amplía su accesibilidad al permitir inferencia local con cuantizaciones desde Q2_K hasta f16, con un tamaño de repositorio de 85,1 GB que incluye todos los archivos cuantizados y los suplementos multimodales (mmproj).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen 3.5, según tags del autor) |
| Parametros totales | 9.197.093.888 (~9,2 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en f16 y Q8_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas) y safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base Yukinonooo/SVGFaith-Decomposer emplea una arquitectura transformer densa asociada a la familia Qwen 3.5, con 9.197.093.888 parámetros totales según los pesos en safetensors. No se dispone de detalles sobre el número de capas, dimensión oculta, número de cabezas de atención ni sobre la longitud de contexto nativa. La presencia de archivos mmproj (multi-modal supplement) en la cuantización sugiere que el modelo incorpora un codificador visual, probablemente para procesar imágenes SVG renderizadas o diagramas de entrada, aunque no se especifica en la información proporcionada.

Respecto al entrenamiento, no se han publicado en la información disponible datos sobre el volumen de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado. El modelo está etiquetado con los términos text-to-svg, faithfulness y scene-graph, lo que indica que su entrenamiento se orientó a tareas de descomposición estructural de gráficos vectoriales con énfasis en la fidelidad de la representación. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal. La cuantización realizada por mradermacher es de tipo estático (quantize_version 2, output_tensor_quantised 1), sin cuantizaciones ponderadas por imatrix disponibles en el momento de la publicación.

## Capacidades

- Generación de representaciones de grafo de escena a partir de gráficos SVG, preservando relaciones jerárquicas entre elementos.
- Descomposición de SVG en estructuras intermedias verificables, orientada a evaluar fidelidad estructural.
- Procesamiento multimodal: la presencia de archivos mmproj indica soporte de entrada visual (imágenes), aunque no se detalla el formato exacto.
- Conversación multi-turno: la etiqueta "conversational" sugiere uso en diálogo, aunque no se especifican detalles.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Generación asistida de ilustraciones vectoriales: el modelo descompone una descripción o imagen en un grafo de escena que luego se traduce a SVG, permitiendo editar la estructura antes de renderizar y reduciendo errores de anidamiento.
- Validación automática de fidelidad en SVG: en pipelines de control de calidad, el modelo compara la estructura generada con la esperada y detecta discrepancias jerárquicas o semánticas.
- Edición programática de gráficos vectoriales: al operar sobre el grafo de escena en lugar del código SVG crudo, herramientas de edición pueden modificar nodos y relaciones sin romper la sintaxis del documento.
- Evaluación de modelos text-to-SVG: el descomponedor actúa como juez estructural para medir la fidelidad de otros generadores, proporcionando una señal objetiva más allá de métricas de píxel.
- Investigación en representación visual estructurada: útil para estudiar cómo los modelos de lenguaje interpretan relaciones espaciales y jerárquicas en diagramas, con la ventaja de ejecutarse localmente en cuantizaciones Q4.
- Prototipado en entornos sin GPU de datacenter: gracias a las cuantizaciones Q2_K (4,0 GB) y Q4_K_S (5,6 GB), es viable probar el modelo en portátiles con GPU de consumo para experimentación académica.
- Despliegue en pipelines de conversión documental: conversión de diagramas técnicos o esquemas en SVG a grafos de escena para su indexación o análisis posterior en sistemas de documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,0 GB
  - Q3_K_M: ~4,8 GB
  - Q4_K_S: ~5,6 GB
  - Q4_K_M: ~5,9 GB
  - Q5_K_M: ~6,7 GB
  - Q6_K: ~7,7 GB
  - Q8_0: ~9,9 GB
  - f16: ~18,5 GB
  - Suplemento multimodal mmproj: +0,7 GB (Q8_0) o +1,0 GB (f16)
- GPU recomendadas: RTX 3060 12 GB o superior para Q4_K_M; RTX 4090 24 GB para Q8_0 o f16; A100/H100 para despliegues de alta concurrencia.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4_K_S y Q4_K_M con 8 GB de VRAM o más; Q2_K y Q3_K_S en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (koboldcpp, LM Studio). Para el modelo base en safetensors, transformers con vLLM o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (text-to-SVG con descomposición en grafos de escena) en los datos proporcionados. La comparativa con alternativas genéricas de 9B como Qwen 2.5 7B o Llama 3.1 8B no sería significativa dado el dominio especializado del modelo. Se indica por tanto: no disponible.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- La longitud de contexto no está especificada, lo que impide planificar el procesamiento de SVG grandes o conversaciones largas.
- No se han publicado benchmarks, por lo que no es posible evaluar su calidad frente a alternativas de forma objetiva.
- El modelo está especializado en descomposición SVG; su uso como modelo generalista de propósito general probablemente arroje resultados pobres.
- Riesgo de alucinación estructural: en tareas de descomposición, puede inventar relaciones o nodos inexistentes en el SVG de entrada, especialmente en cuantizaciones bajas (Q2_K, Q3_K_S).
- Las cuantizaciones Q2_K y Q3_K_M están marcadas por el autor como de menor calidad; para producción se recomienda Q4_K_M o superior.
- Aunque la licencia es Apache 2.0, debe verificarse la licencia del modelo base Yukinonooo/SVGFaith-Decomposer y de los datos de entrenamiento antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Los archivos mmproj son necesarios para funcionalidad multimodal; sin ellos, el modelo opera solo con entrada textual.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/SVGFaith-Decomposer-GGUF
- Modelo base: https://huggingface.co/Yukinonooo/SVGFaith-Decomposer
- Página de resumen del cuantizador: https://hf.tst.eu/model#SVGFaith-Decomposer-GGUF
- Paper referenciado (arXiv:2611.06048): https://arxiv.org/abs/2611.06048
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Listado de modelos de mradermacher: https://huggingface.co/mradermacher/models
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
