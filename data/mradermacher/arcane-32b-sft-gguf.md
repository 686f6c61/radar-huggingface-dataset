# mradermacher/ArcANE-32B-SFT-GGUF

## Resumen

ArcANE-32B-SFT-GGUF es una colección de cuantizaciones GGUF del modelo holi-lab/ArcANE-32B-SFT, un modelo ajustado mediante supervisión fina (SFT) sobre el dataset holi-lab/ArcANE-Data. El repositorio está publicado por mradermacher, que se ha encargado de convertir y cuantizar el modelo base para facilitar su ejecución en frameworks de inferencia local como llama.cpp u Ollama. El modelo cuenta con aproximadamente 32,8 mil millones de parámetros y, según las etiquetas del repositorio (role-playing, character, sft, conversational), está pensado para conversación y role-play con personajes. La disponibilidad de varios niveles de cuantización (desde Q2_K hasta Q8_0) permite adaptar el modelo a distintos hardwares, desde equipos con GPU de consumo hasta servidores con mayor memoria. No se ha publicado información sobre la arquitectura interna ni sobre la longitud de contexto, por lo que estos datos no están disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 32.762.123.264 (≈32,8 mil millones) |
| Parámetros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_L, Q4_K_S, Q4_K_M, Q6_K, Q8_0 (IQ4_XS mencionado en comentarios de la model card) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio actual); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base holi-lab/ArcANE-32B-SFT ha sido ajustado mediante supervisión fina (SFT) sobre el dataset holi-lab/ArcANE-Data, tal como indican las etiquetas del repositorio. La información disponible no incluye detalles sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni la aplicación de técnicas como RLHF o DPO. Esta colección se limita a las versiones cuantizadas en formato GGUF generadas por mradermacher, sin modificaciones adicionales al modelo subyacente. Cualquier característica técnica más profunda requiere consultar el repositorio del modelo base o la documentación del autor.

## Capacidades

- Conversación y role-play: el modelo está orientado a interpretación de personajes, tal como indican las etiquetas role-playing, character y conversational.
- Generación de texto en inglés: la única lengua documentada en el repositorio es el inglés.
- Formato GGUF: las cuantizaciones son compatibles con herramientas de inferencia local como llama.cpp, Ollama y LM Studio.
- No consta en la información disponible soporte para tool calling, función llamada, agentes, visión, audio ni razonamiento explícito.
- No se ha confirmado capacidad multilingüe más allá del inglés.

## Casos de uso

- Chat de rol con personajes: el modelo puede utilizarse en aplicaciones de chat como llama.cpp u Ollama, definiendo un personaje en el prompt de sistema. Las cuantizaciones GGUF permiten ejecutarlo en local, incluso en equipos con GPU de 16-24 GB si se selecciona una cuantización tipo Q4_K_M o inferior.
- Generación de diálogos para juegos o narrativa: el ajuste SFT sobre datos de personajes favorece respuestas con estilo de role-play. El modelo puede integrarse en motores de escritura o en sistemas de juego para producir líneas de diálogo contextuales en inglés.
- Simulación de entrevistas o tutorías con personalidad: por ejemplo, un asistente que adopte el papel de un personaje histórico para explicar conceptos. La licencia Apache 2.0 permite el uso comercial de este tipo de aplicación.
- Prototipado de asistentes conversacionales temáticos: al no estar documentado el soporte de tool calling, es adecuado para prototipos centrados en conversación y estilo de personaje que no requieran integración con APIs externas.
- Evaluación de seguridad y alineación en modelos de rol: los investigadores pueden usar este modelo como referencia para estudiar sesgos y comportamientos en escenarios de role-play, siempre que realicen evaluaciones propias, ya que no hay benchmarks publicados.
- Experimentación con cuantización y compresión: la variedad de archivos GGUF (de Q2_K a Q8_0) permite comparar el efecto de la cuantización en la calidad de las respuestas y en el uso de memoria o VRAM, útil para decidir el despliegue óptimo.
- Despliegue de un chat privado en servidor local: usando llama.cpp o LM Studio, una organización puede ofrecer un servicio de chat de rol con personajes sin depender de proveedores externos, manteniendo los datos en su propia infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

| Cuantización | Tamaño del archivo | Nota |
|---|---|---|
| Q2_K | 12,4 GB | Pérdida de calidad importante |
| Q3_K_S | 14,5 GB | Calidad media-baja |
| Q3_K_L | 17,4 GB | |
| Q4_K_S | 18,9 GB | rápida y recomendada según el autor |
| Q4_K_M | 19,9 GB | rápida y recomendada según el autor |
| Q6_K | 27,0 GB | muy buena calidad según el autor |
| Q8_0 | 34,9 GB | rápida y mejor calidad según el autor |

- El tamaño del archivo es el peso del modelo. La VRAM necesaria debe incluir además espacio para el contexto y el overhead de ejecución.
- Para Q4_K_S (18,9 GB) o Q4_K_M (19,9 GB) se recomienda una GPU con al menos 24 GB de VRAM, como una RTX 4090 o una A100 de 40 GB, si se quiere mantener todo el modelo en memoria.
- Las cuantizaciones Q6_K (27,0 GB) y Q8_0 (34,9 GB) requieren GPUs con mayor capacidad, como A100 de 80 GB o H100, o bien un despliegue con offloading parcial a CPU.
- Las cuantizaciones Q2_K y Q3_K_S tienen un tamaño inferior a 15 GB, por lo que podrían ejecutarse en GPUs de 16 GB con un contexto moderado y utilizando offloading parcial.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runner compatible con GGUF. El modelo base en safetensors se puede cargar con Transformers desde el repositorio de holi-lab.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa basada en datos objetivos. Existen otros modelos GGUF de 32B SFT publicados por mradermacher, como negotiation-sft-32b-v1 o SWE-Master-32B-SFT, pero no se han proporcionado métricas comparables que permitan una comparación de rendimiento. La comparativa se considera no disponible.

## Limitaciones y advertencias

- No se ha documentado el proceso de alineamiento ni se han publicado evaluaciones de seguridad. Existe riesgo de alucinaciones y de generación de contenido inapropiado, especialmente en escenarios de role-play.
- El modelo está documentado únicamente en inglés, por lo que su capacidad en otros idiomas no está garantizada.
- La cuantización puede degradar la calidad original. Las versiones más comprimidas, como Q2_K y Q3_K_S, presentan una pérdida de fidelidad mayor.
- La longitud de contexto no está especificada, por lo que no se puede garantizar un buen rendimiento en conversaciones muy largas o con contextos extensos.
- No se han publicado benchmarks, por lo que su comportamiento en tareas de razonamiento, código o matemáticas es desconocido.
- La licencia Apache 2.0 permite uso comercial, pero los responsables del despliegue deben verificar que el modelo base y los datos de entrenamiento no introduzcan restricciones adicionales.

## Enlaces

- Repositorio del modelo GGUF: https://huggingface.co/mradermacher/ArcANE-32B-SFT-GGUF
- Modelo base: https://huggingface.co/holi-lab/ArcANE-32B-SFT
- Dataset de entrenamiento: https://huggingface.co/datasets/holi-lab/ArcANE-Data
- Página de resumen del autor: https://hf.tst.eu/model#ArcANE-32B-SFT-GGUF
- No se han encontrado papers ni blogs adicionales en la búsqueda web.
