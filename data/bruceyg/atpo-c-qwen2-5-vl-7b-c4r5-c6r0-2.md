# BruceYg/ATPO-C-Qwen2.5-VL-7B-C4r5-C6r0.2

## Resumen

ATPO-C-Qwen2.5-VL-7B-C4r5-C6r0.2 es un ajuste fino del modelo multimodal Qwen2.5-VL-7B-Instruct desarrollado por BruceYg (Guangyu Yang y colaboradores) y orientado específicamente a la detección multi-etiqueta de contenido peligroso en vídeo. El modelo no se presenta como un asistente conversacional general, sino como un clasificador de seguridad entrenado mediante Adaptive Tversky Policy Optimization (ATPO), una técnica de aprendizaje por refuerzo que permite modular el equilibrio entre precisión y exhaustividad para cada categoría de riesgo.

La variante "C" utiliza Category-Aware Adaptive Tversky Reward (C-ATR), que ajusta de forma independiente las penalizaciones por falsos positivos y falsos negativos en cada categoría. El sufijo `C4r5-C6r0.2` codifica el objetivo de entrenamiento: una ratio FN/FP de 5,0 para la categoría C4 (Misinformation) —priorizando precisión— y de 0,2 para C6 (Extreme) —priorizando recall—. Esto convierte al modelo en una herramienta configurable para pipelines de moderación donde el coste del error difiere según la categoría.

El modelo tiene 8.292.166.656 parámetros, se distribuye en formato BF16 fusionado (safetensors) con licencia Apache 2.0 y está asociado a un artículo aceptado en NeurIPS 2026. Su relevancia actual radica en que aborda un problema operativo real de las plataformas de vídeo: clasificar simultáneamente múltiples categorías de riesgo con umbrales de sensibilidad controlables, en lugar de aplicar un único criterio de decisión global.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal visión-lenguaje heredado de Qwen2.5-VL-7B-Instruct (tag `qwen2_5_vl`); detalles internos no disponibles |
| Parametros totales | 8.292.166.656 (aproximadamente 8,29 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos publicados están en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 fusionado, junto con tokenizer y configuración de processor) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-VL-7B-Instruct, un modelo visión-lenguaje capaz de procesar entradas de imagen y vídeo junto con texto (tags `image-text-to-text`, `video`). Sobre esa base, el ajuste se realiza con Adaptive Tversky Policy Optimization (ATPO), un método de aprendizaje por refuerzo cuyo objetivo es controlar explícitamente el compromiso precisión-recall. La variante aquí publicada, ATPO-C, emplea Category-Aware Adaptive Tversky Reward (C-ATR), que define penalizaciones diferenciadas para falsos positivos y falsos negativos de forma independiente por categoría, en lugar de aplicar una única recompensa agregada como hace la variante ATPO-G (Global Adaptive Tversky Reward).

El sufijo del nombre documenta la configuración de entrenamiento: ratio objetivo FN/FP de 5,0 para C4 (Misinformation) y de 0,2 para C6 (Extreme), tal como se describe en la sección 4.4.2 del artículo asociado. El repositorio contiene únicamente los pesos fusionados en BF16, el tokenizer y las configuraciones de processor; no se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases adicionales de RLHF o DPO más allá del propio ciclo de ATPO.

## Capacidades

- Clasificación multi-etiqueta de seguridad en vídeo: asignación simultánea de varias categorías de riesgo sobre un mismo contenido.
- Procesamiento de entradas imagen-texto y vídeo-texto, heredado de la arquitectura Qwen2.5-VL.
- Control configurable del equilibrio precisión-recall por categoría (C-ATR), con objetivos FN/FP diferenciados para C4 y C6.
- Detección orientada a contenido de misinformation y contenido extremista, según las categorías referenciadas en el nombre del modelo.
- Compatibilidad con `transformers` y con text-generation-inference (tag `endpoints_compatible`), lo que facilita su despliegue como endpoint.
- Generación de texto multimodal general: al derivar de Qwen2.5-VL-7B-Instruct, conserva las capacidades del modelo base, aunque no se documenta en la información disponible en qué medida el ajuste por refuerzo las preserva.
- No se documentan en la información disponible capacidades específicas de tool calling, function calling, uso de agentes o modos de razonamiento explícito.

## Casos de uso

- Moderación automática de plataformas de vídeo: el modelo permite clasificar un vídeo en varias categorías de riesgo a la vez, de modo que un mismo clip puede marcarse simultáneamente como misinformation y como contenido extremista sin necesidad de ejecutar clasificadores independientes.
- Triage de contenido para equipos de trust and safety: gracias al control por categoría del equilibrio precisión-recall, el modelo puede configurarse para generar pocos falsos positivos en categorías sensibles a la revisión humana (C4, ratio FN/FP 5,0) y maximizar la cobertura en categorías críticas (C6, ratio 0,2).
- Pre-filtrado en pipelines de revisión humana: las detecciones de alta confianza pueden enrutarse directamente a acciones automáticas y las de baja confianza a colas de revisión manual, reduciendo el volumen de contenido que llega a los moderadores.
- Detección de desinformación en vídeo: la configuración específica de C4 orientada a precisión es adecuada para escenarios donde marcar erróneamente contenido legítimo tiene un coste reputacional alto.
- Sistemas de recomendación con filtrado de seguridad: integración como capa de scoring previa a la recomendación, bloqueando o degradando la difusión de vídeos clasificados como peligrosos.
- Anotación asistida de datasets de seguridad: el modelo puede emplearse para pre-etiquetar grandes volúmenes de vídeo con múltiples etiquetas, que después se validan de forma selectiva, acelerando la construcción de corpus de moderación.
- Auditoría y cumplimiento normativo: generación de clasificaciones documentadas por categoría que sirvan como evidencia en procesos de revisión regulatoria sobre contenido dañino.
- Investigación en aprendizaje por refuerzo aplicado a seguridad: el repositorio sirve como referencia reproducible de ATPO-C frente a la variante ATPO-G, permitiendo comparar estrategias de recompensa global frente a las específicas por categoría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye tablas de métricas (mAP, F1, precisión, recall u otras) ni comparaciones cuantitativas con modelos alternativos, y los resultados de búsqueda consultados tampoco aportan cifras de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 16,6 GB solo para los pesos (8.292.166.656 parámetros × 2 bytes), más overhead de activaciones y caché KV, lo que en la práctica sitúa el requisito en torno a 20-24 GB o más según la resolución y la duración del vídeo procesado.
- VRAM estimada con cuantización INT8: aproximadamente 8,3 GB para los pesos; con INT4, aproximadamente 4,2 GB. Estas cifras son estimaciones aritméticas derivadas del número de parámetros, ya que el repositorio no publica versiones cuantizadas.
- GPU profesionales recomendadas: A100 (40/80 GB), H100 (80 GB) y A6000 (48 GB) cubren el modelo en BF16 con margen amplio para lotes y vídeos largos.
- GPU de consumo: una RTX 4090 o RTX 3090 con 24 GB puede alojar los pesos en BF16 de forma ajustada, con margen limitado para contexto largo o procesamiento de vídeo por lotes.
- Opciones de despliegue: la librería declarada es `transformers` y el modelo incluye el tag `text-generation-inference`, por lo que TGI es la vía de servicio documentada. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o GGUF en la información disponible, y el propio modelo base Qwen2.5-VL sí dispone de soporte en algunas de estas herramientas, lo que no implica necesariamente que estos pesos ajustados funcionen sin conversión previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ATPO-C-Qwen2.5-VL-7B-C4r5-C6r0.2 | 8,29 B | no disponible | Seguridad en vídeo multi-etiqueta con C-ATR | Apache 2.0 | HuggingFace (BruceYg) |
| ATPO-G-Qwen2.5-VL-7B | no disponible | no disponible | Seguridad en vídeo multi-etiqueta con G-ATR (recompensa global) | Apache 2.0 (según repositorio hermano) | HuggingFace (BruceYg) |
| Qwen2.5-VL-7B-Instruct | aproximadamente 8 B (modelo base) | no disponible en la información proporcionada | Asistente multimodal visión-lenguaje general | Apache 2.0 | HuggingFace (Qwen) y ecosistema asociado |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información consultada, por lo que la comparación se limita a arquitectura, licencia y objetivo de entrenamiento.

## Limitaciones y advertencias

- No se han publicado métricas de evaluación en la información disponible, por lo que no es posible verificar cuantitativamente su rendimiento en producción.
- El modelo está especializado en clasificación de seguridad en vídeo; su uso como asistente multimodal general puede degradarse respecto al modelo base, aunque no se documenta el alcance de esa degradación.
- No se especifican los idiomas soportados, lo que impide garantizar un comportamiento fiable fuera de los idiomas presentes en los datos de entrenamiento (no disponibles).
- No se documenta la composición del dataset de entrenamiento ni el proceso de anotación, lo que dificulta evaluar sesgos sistemáticos hacia determinadas culturas, temáticas o grupos.
- Riesgo de alucinación y de clasificación errónea inherente a los modelos generativos multimodales: las etiquetas de seguridad producidas deben validarse antes de tomar decisiones automatizadas con impacto sobre usuarios.
- Los objetivos FN/FP son parámetros de entrenamiento, no garantías de rendimiento: la ratio real alcanzada en producción puede diferir y debe medirse sobre datos propios.
- La licencia Apache 2.0 permite uso comercial, modificación y redistribución, con la obligación habitual de conservar avisos de licencia y atribución.
- Al tratarse de contenido y decisiones de moderación, se recomienda mantener revisión humana en el circuito y documentar las políticas aplicadas, especialmente en jurisdicciones con requisitos de transparencia sobre moderación automatizada.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, por lo que carece de validación por parte de la comunidad.
- No se dispone de información sobre cuantizaciones oficiales, versiones GGUF ni soporte en runtimes ligeros, lo que limita su despliegue en hardware de gama baja.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BruceYg/ATPO-C-Qwen2.5-VL-7B-C4r5-C6r0.2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-7B-Instruct
- Artículo (arXiv): https://arxiv.org/abs/2610.02019
- Artículo en HTML: https://arxiv.org/html/2610.02019v1
- Repositorio de código: https://github.com/BruceYg/ATPO
- Página del proyecto: https://bruceyg.github.io/ATPO-project-page/
- Variante ATPO-G: https://huggingface.co/BruceYg/ATPO-G-Qwen2.5-VL-7B
- Repositorio de Qwen2.5-VL (referencia de la comunidad): https://github.com/elsawhs/qwen2.5-vl
- Servidor compatible con API OpenAI para Qwen2.5-VL: https://github.com/phildougherty/qwen2.5-VL-inference-openai
- Qwen2.5-VL en Ollama: https://ollama.com/library/qwen2.5vl:7b
