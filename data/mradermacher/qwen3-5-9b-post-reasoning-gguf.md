# mradermacher/Qwen3.5-9B-Post-Reasoning-GGUF

## Resumen

Qwen3.5-9B-Post-Reasoning-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo richmondsin/Qwen3.5-9B-Post-Reasoning, publicada por mradermacher. El modelo original parte de la familia Qwen3.5 de Alibaba y ha sido sometido a un proceso de ajuste supervisado (SFT) mediante LoRA fusionado, con un enfoque etiquetado como "post-reasoning". Esta conversión no introduce cambios en los pesos más allá de la cuantización: es un trabajo de distribución que facilita la ejecución del modelo en hardware de consumo.

El interés de esta ficha reside en que el repositorio GGUF ofrece un abanico amplio de niveles de cuantización (desde Q2_K hasta f16, además de variantes multimodales mmproj), lo que permite desplegar un modelo de aproximadamente 8.950 millones de parámetros en GPUs de gama media. La licencia Apache 2.0 del modelo base facilita su uso comercial, si bien el autor de las cuantizaciones no documenta benchmarks ni detalles de entrenamiento más allá de las etiquetas del modelo origen.

No se dispone de información sobre longitud de contexto, composición del dataset de SFT ni resultados de evaluación en la documentación proporcionada, por lo que muchos campos técnicos se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Qwen3.5; transformer presumiblemente, sin confirmar) |
| Parámetros totales | 8.953.803.264 (~8,95 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (conversión desde safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo subyacente, richmondsin/Qwen3.5-9B-Post-Reasoning, se presenta en su model card con las etiquetas "post-reasoning", "merged-lora" y "sft", lo que indica que se partió de un modelo base de la familia Qwen3.5 y se aplicó un ajuste supervisado mediante LoRA, cuyos adaptadores se fusionaron posteriormente en los pesos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO.

La contribución técnica de este repositorio es la cuantización estática a GGUF realizada por mradermacher (quantize_version 2, output_tensor_quantised 1, convert_type hf). El autor indica que las cuantizaciones ponderadas con imatrix no están disponibles en el momento de la publicación. Se incluyen además ficheros mmproj (Q8_0 y f16) que actúan como suplemento multimodal, lo que sugiere que el modelo base incorpora capacidades de visión, aunque no se detalla su arquitectura interna.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta "conversational" del repositorio.
- Razonamiento "post-reasoning": el modelo ha sido ajustado con SFT tras una fase de razonamiento, según las etiquetas del modelo base.
- Capacidades multimodales potenciales: la presencia de ficheros mmproj en el repositorio GGUF indica soporte de entrada visual en el modelo origen, aunque no se documenta su alcance.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere integración con servicios de inferencia estándar.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_M (5,7 GB) y Q4_K_S (5,5 GB) permiten ejecutar el modelo en GPUs con 8 GB de VRAM, ideal para prototipado y desarrollo offline.
- Asistentes conversacionales en inglés: el ajuste SFT y la etiqueta "conversational" lo hacen adecuado para chatbots de soporte en entornos donde el inglés sea el idioma principal y se requiera ejecución local por privacidad.
- Inferencia en servidores sin GPU dedicada de gama alta: la variante Q2_K (3,9 GB) posibilita ejecución en CPU con llama.cpp para tareas de baja latencia crítica o entornos con recursos muy limitados.
- Evaluación de modelos post-reasoning: investigadores que necesiten comparar el efecto del ajuste SFT con LoRA fusionado frente al modelo base pueden usar estas cuantizaciones para pruebas reproducibles con distintas precisiones.
- Integración en pipelines de CI/CD para pruebas de regresión de prompts: la cuantización Q8_0 (9,6 GB) ofrece una fidelidad cercana al modelo original para validar respuestas antes de desplegar en producción.
- Experimentación multimodal: los ficheros mmproj permiten probar entradas de imagen junto con texto en herramientas compatibles con GGUF multimodal, aunque la documentación sobre esta capacidad es escasa.
- Fine-tuning posterior o destilación: el formato GGUF no es el más adecuado para reentrenamiento, pero la disponibilidad del modelo original en transformers permite usarlo como referencia para destilar conocimiento hacia modelos más pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,9 GB
  - Q3_K_S: ~4,4 GB
  - Q4_K_S: ~5,5 GB
  - Q4_K_M: ~5,7 GB
  - Q5_K_M: ~6,6 GB
  - Q6_K: ~7,5 GB
  - Q8_0: ~9,6 GB
  - f16: ~18,0 GB
- GPU recomendadas:
  - RTX 3060 12 GB / RTX 4060 Ti 16 GB: Q4_K_M o Q5_K_M con contexto moderado.
  - RTX 4090 24 GB: Q8_0 o f16 con contexto amplio.
  - A100 40/80 GB y H100: f16 sin restricciones de memoria para pesos.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q6_K en GPUs de 8-12 GB; Q8_0 requiere 12-16 GB; f16 requiere 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para servidores de alto throughput, vLLM o TGI requerirían los pesos originales en safetensors, no las cuantizaciones GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa. Como referencia estructural, el modelo pertenece a la categoría de ~9B parámetros con licencia Apache 2.0 y formato GGUF, pero no se dispone de métricas para contrastarlo con otras alternativas de la misma familia o tamaño.

## Limitaciones y advertencias

- Idiomas: el modelo está etiquetado únicamente para inglés; su rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar aplicaciones con ventanas largas sin pruebas empíricas.
- Benchmarks: no hay resultados publicados que permitan estimar calidad, riesgo de alucinación o sesgos. Cualquier despliegue en producción debería acompañarse de una evaluación propia.
- Origen del ajuste: al tratarse de un LoRA fusionado sobre un modelo base de la familia Qwen3.5, la calidad del SFT depende enteramente del dataset utilizado por richmondsin, que no se documenta.
- Cuantizaciones de baja precisión: Q2_K y Q3_K_S pueden degradar notablemente la coherencia y el razonamiento; el autor recomienda Q4_K_S y Q4_K_M como equilibrio velocidad/calidad.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original de Qwen y del ajuste de richmondsin antes de redistribuir.
- Multimodalidad: la presencia de mmproj no garantiza un soporte completo o estable en todos los runtimes; la documentación al respecto es mínima.
- Fecha de creación: el repositorio data de noviembre de 2026, con cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-9B-Post-Reasoning-GGUF
- Modelo base: https://huggingface.co/richmondsin/Qwen3.5-9B-Post-Reasoning
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.5-9B-Post-Reasoning-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
