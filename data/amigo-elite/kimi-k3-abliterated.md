# AmiGO-Elite/Kimi-K3-Abliterated

## Resumen

Kimi-K3-Abliterated es una variante del modelo Kimi K3 de Moonshot AI, publicada por el colectivo AmiGO-Elite (la model card referencia también a SHS-Lab). Se trata de un modelo de lenguaje y multimodal nativo de tipo Mixture-of-Experts con 2,8 billones de parámetros totales y 104 mil millones de parámetros activos por token, construido sobre una arquitectura híbrida de Kimi Delta Attention (KDA) y Gated MLA, con una ventana de contexto de un millón de tokens.

El modelo base Kimi K3 está orientado a tareas agénticas de largo horizonte: ingeniería de software sostenida sobre repositorios grandes, orquestación de herramientas de terminal, trabajo con kernels de GPU, desarrollo de compiladores y flujos con visión integrada. Esta variante aplica un procedimiento de "abliteration" (cirugía dirigida de pesos) para atenuar los mecanismos de rechazo alineados, reduciendo la probabilidad de respuestas de negativa ante entradas en inglés y japonés. Según la model card, se ha eliminado más del 98 % de la señal de salvaguarda identificada en las familias de pesos objetivo.

La relevancia de esta ficha es doble: por un lado documenta las capacidades técnicas del modelo base (2,8 T de parámetros, contexto de 1 M de tokens, cuantización MXFP4/MXFP8, razonamiento estructurado siempre activo); por otro, advierte de que se trata de una modificación no oficial que elimina barreras de seguridad, con implicaciones importantes para su uso en producción. El repositorio ocupa 1,56 TB y no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Gated MLA; 93 capas (1 densa), 69 capas KDA + 24 capas Gated MLA |
| Parametros totales | 2.779.931.837.184 (2,8 T) |
| Parametros activos | 104 B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | Pesos MXFP4 y activaciones MXFP8 (de entrenamiento con quantización); etiqueta del repo "8-bit"; compatible con compressed-tensors |
| Idiomas soportados | No disponible (la model card menciona explícitamente inglés y japonés para el comportamiento abliterado) |
| Licencia | "Kimi K3 License" (license: other, license_name: kimi-k3) |
| Formato de pesos | safetensors (librería transformers, custom_code) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Kimi K3 base: una red MoE de 93 capas con un único bloque denso y una composición de atención híbrida de 69 capas de Kimi Delta Attention (KDA) más 24 capas de Gated MLA. Esta combinación busca equilibrar eficiencia en contextos largos (KDA, con atención de tipo lineal/delta) con la capacidad expresiva de la atención multi-cabeza latente con compuertas (Gated MLA). El modelo activa 104 B de parámetros por token sobre un total de 2,8 T, lo que permite un coste de inferencia muy inferior al de un modelo denso del mismo tamaño.

La model card no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO en el modelo base. Sí se indica que el modelo incorpora entrenamiento agéntico orientado a tareas de ingeniería de software, orquestación de herramientas y flujos multimodales, y que el razonamiento está siempre activado con niveles de esfuerzo configurables (`low`, `high`, `max`) que emiten trazas explícitas en `reasoning_content`. La innovación principal de esta variante concreta es el procedimiento de abliteration: una modificación dirigida de los valores de pesos para suprimir las activaciones de salvaguarda, sin cambios en la arquitectura ni datos de entrenamiento nuevos. La cuantización MXFP4/MXFP8 procede del entrenamiento con quantización del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta un millón de tokens.
- Razonamiento estructurado siempre activo, con trazas explícitas y niveles de esfuerzo `low`, `high` y `max`.
- Capacidades multimodales nativas: procesamiento de texto, imágenes y vídeo en una única arquitectura (pipeline `any-to-any`).
- Ingeniería de software de largo horizonte: trabajo sostenido sobre bases de código grandes, orquestación de herramientas de terminal, desarrollo de kernels de GPU y compiladores.
- Flujos agénticos con integración de herramientas vía MCP (Model Context Protocol) y navegación web multi-paso.
- Procesamiento de documentos, manipulación de hojas de cálculo y generación de visualizaciones interactivas.
- Comportamiento abliterado: supresión de mecanismos de rechazo para entradas en inglés y japonés.
- Capacidades multilingües: no detalladas en la información disponible más allá de la mención a inglés y japonés.

## Casos de uso

- Investigación en alineación: el modelo permite estudiar cómo la supresión de pesos asociados a salvaguardas afecta al comportamiento, comparando respuestas con el Kimi K3 base en entornos controlados.
- Evaluación de red team: sirve como sujeto de pruebas para medir la robustez de filtros externos, clasificadores de contenido y políticas de moderación en pipelines de producción.
- Ingeniería de software agéntica: con 1 M de tokens de contexto puede ingerir repositorios completos y sostener sesiones de refactorización, depuración o generación de parches a lo largo de múltiples turnos.
- Automatización de investigación documental: procesa documentos, hojas de cálculo y páginas web mediante herramientas MCP, generando informes y visualizaciones interactivas de forma autónoma.
- Análisis de vídeo e imagen en flujos técnicos: al ser multimodal nativo, puede inspeccionar capturas de pantalla, diagramas o grabaciones para diagnosticar errores o guiar tareas de ingeniería.
- Desarrollo de kernels y toolchains: adecuado para tareas de optimización de bajo nivel y desarrollo de compiladores gracias al entrenamiento agéntico del modelo base.
- Experimentación con decodificación y cuantización: su formato MXFP4/MXFP8 y su soporte en transformers permiten probar estrategias de despliegue en hardware diverso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo ocupa 1,56 TB; el despliegue en precisión MXFP4 requiere del orden de varios cientos de GB de VRAM, muy por encima de cualquier GPU de consumo.
- No cabe en GPU de consumo (RTX 4090, 5090, etc.); se requiere hardware de centro de datos con múltiples aceleradores.
- GPU recomendadas: no disponibles de forma explícita en la información; por el tamaño del modelo se necesitan clústeres multi-GPU (series H100/H200/B200 o equivalentes).
- Opciones de despliegue: transformers con `custom_code`; no se confirman soportes de vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Kimi-K3-Abliterated (AmiGO-Elite) | 2,8 T | 104 B | 1 M | Kimi K3 License | Variante abliterada del Kimi K3 |
| Kimi K3 (moonshotai) | 2,8 T | 104 B | 1 M | Kimi K3 License | Modelo base con salvaguardas intactas |
| Otros modelos de frontera abiertos | No disponible | No disponible | No disponible | No disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- La abliteration elimina deliberadamente los mecanismos de rechazo; el modelo puede generar contenido dañino, ilegal o inseguro que el modelo base rechazaría.
- No se han publicado evaluaciones de seguridad ni benchmarks que cuantifiquen el impacto de la abliteration en capacidades o sesgos.
- Riesgo elevado de alucinación en tareas de largo horizonte, especialmente con contextos de hasta 1 M de tokens.
- La model card solo menciona inglés y japonés como idiomas cubiertos por la abliteration; el comportamiento en otros idiomas no está documentado.
- La licencia "Kimi K3 License" (license: other) debe revisarse antes de cualquier uso comercial; las condiciones concretas no se detallan en la información disponible.
- El repositorio no registra descargas ni validación comunitaria; no hay evidencia de que los pesos publicados funcionen correctamente.
- El tamaño de 1,56 TB y la ausencia de confirmación de soporte en motores de inferencia habituales complican su despliegue en producción.
- Uso previsto según la model card: investigación en alineación, evaluación de red team y experimentación controlada en entornos gobernados.

## Enlaces

- [Hugging Face: AmiGO-Elite/Kimi-K3-Abliterated](https://huggingface.co/AmiGO-Elite/Kimi-K3-Abliterated)
- [Modelo base: moonshotai/Kimi-K3](https://huggingface.co/moonshotai/Kimi-K3)
- [Licencia Kimi K3](https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE)
