# BH-Language-AI/bh-vision-1-2b

## Resumen

BH-Vision-1-2B es un proyecto de modelo multimodal de tipo image-text-to-text orientado a tareas de OCR y comprensión de documentos en lengua bosnia (código ISO `bs`), desarrollado por BH-Language-AI. El modelo se plantea como un fine-tuning del modelo base HuggingFaceTB/SmolVLM2-2.2B-Instruct, un VLM ligero de aproximadamente 2.200 millones de parámetros publicado por Hugging Face bajo licencia Apache-2.0. La propuesta busca cubrir un hueco poco atendido: el procesamiento de documentos y texto impreso en bosnio, un idioma con escasa representación en los grandes corpus multimodales.

Es importante subrayar que, según la propia model card, el modelo **no está entrenado**: las ponderaciones no existen y la tarjeta es meramente un documento de proyecto. El autor describe un plan de entrenamiento basado en QLoRA de 4 bits con el codificador visual congelado en la primera iteración, y anuncia que las ponderaciones se publicarán únicamente tras un entrenamiento aprobado y una evaluación verificada. Por tanto, no debe tratarse como un modelo desplegable hoy, sino como una especificación de intenciones.

La relevancia actual del proyecto reside en su enfoque metodológico: define un conjunto de evaluación held-out (`BH-Language-AI/bs-vision-ocr-heldout-v01`) que nunca se usa en entrenamiento, y combina datos técnicos de PubLayNet y PlotQA con evaluaciones proxy (XM3600-hr y postocr-sr). Es un caso de estudio sobre cómo planificar un fine-tuning multimodal de bajo coste para un idioma de bajos recursos, más que un artefacto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) heredada de SmolVLM2-2.2B-Instruct; codificador visual congelado en la primera iteración del plan |
| Parámetros totales | ~2.200 millones (según el modelo base SmolVLM2-2.2B-Instruct) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | QLoRA de 4 bits en entrenamiento (plan); cuantizaciones de inferencia no disponibles |
| Idiomas soportados | bosnio (`bs`) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (las ponderaciones no existen todavía) |

## Arquitectura y entrenamiento

El modelo se define como un fine-tuning del VLM SmolVLM2-2.2B-Instruct, que combina un codificador visual con un transformer de lenguaje de aproximadamente 2.200 millones de parámetros. No se especifica en la información disponible la configuración exacta del codificador visual, la longitud de contexto ni la composición interna del modelo base. La innovación técnica declarada no está en la arquitectura, sino en el procedimiento: QLoRA de 4 bits con el codificador visual congelado durante la primera iteración, lo que reduce el coste de entrenamiento y preserva las capacidades visuales preentrenadas.

En cuanto a los datos, el plan menciona datos técnicos derivados de PubLayNet y PlotQA, evaluaciones proxy sobre XM3600-hr y postocr-sr, y un conjunto held-out específico (`bs-vision-ocr-heldout-v01`) que nunca se incluye en entrenamiento. No se indica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicarán etapas de RLHF o DPO. La model card no reporta ningún resultado de entrenamiento porque el proceso no se ha ejecutado.

## Capacidades

- Generación de texto a partir de imágenes (image-text-to-text), según el pipeline declarado.
- Reconocimiento óptico de caracteres (OCR) en bosnio, que es el objetivo principal del proyecto.
- Comprensión de documentos estructurados, a partir del uso planificado de datos tipo PubLayNet.
- Interpretación de gráficos y figuras, a partir del uso planificado de datos tipo PlotQA.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al bosnio según la etiqueta de idioma declarada.
- Capacidades especiales (modo thinking, visión, audio): visión sí por herencia del modelo base; el resto no disponible.

## Casos de uso

- Digitalización de documentos administrativos en bosnio: el modelo, una vez entrenado, podría extraer texto de formularios y expedientes escaneados, aprovechando su orientación específica al OCR en `bs` y el conjunto de evaluación held-out para medir la calidad real.
- Procesamiento de facturas y albaranes: la combinación de OCR y comprensión de layout (herencia de PubLayNet) permitiría extraer campos estructurados como importes, fechas y números de referencia en documentos comerciales bosnios.
- Accesibilidad documental: conversión de material impreso escaneado (libros, folletos, prensa) a texto digital para lectores de pantalla o motores de búsqueda, con la ventaja de estar especializado en el idioma local.
- Análisis de gráficos en informes técnicos: gracias al entrenamiento previsto con PlotQA, podría describir tendencias y valores en gráficos de barras o líneas incluidos en publicaciones bosnias.
- Extracción de datos de tablas en PDF: el modelo podría transformar tablas escaneadas en estructuras legibles por máquina, útil para pipelines de ingesta de datos en administraciones públicas.
- Moderación y verificación de contenido visual con texto: detección de texto incrustado en imágenes para clasificación o filtrado en plataformas locales, apoyándose en la modalidad image-text-to-text.
- Evaluación comparativa de OCR de bajo recurso: como referencia metodológica, el proyecto sirve para que otros equipos repliquen el esquema QLoRA con codificador congelado y conjunto held-out en idiomas minoritarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no reporta métricas de entrenamiento ni de evaluación, y el modelo no dispone de ponderaciones. El único dato numérico citado es el rendimiento del modelo base SmolVLM2-2.2B-Instruct en DocVQA, aproximadamente 80, que no debe atribuirse al modelo BH-Vision-1-2B.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; como referencia, un modelo de ~2.200 millones de parámetros en precisión de 16 bits requiere del orden de 4-5 GB de VRAM solo para los pesos, más el coste del codificador visual y del KV cache.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, un modelo de esta clase cabría en GPUs de consumo como RTX 3060 de 12 GB o superiores, pero no se ha verificado.
- ¿Cabe en GPU de consumo? Probablemente sí por tamaño, pero no hay datos oficiales ni ponderaciones para comprobarlo.
- Opciones de despliegue: no disponible; al no existir pesos, no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BH-Vision-1-2B | ~2,2B (heredado) | no disponible | bs | Apache-2.0 | Sin ponderaciones (proyecto) |
| SmolVLM2-2.2B-Instruct | ~2,2B | no disponible | multilingüe | Apache-2.0 | Ponderaciones públicas |
| SmolVLM2-500M-Instruct | ~0,5B | no disponible | multilingüe | Apache-2.0 | Ponderaciones públicas |
| Qwen2.5-VL-3B-Instruct | ~3B | no disponible | multilingüe | no disponible | Ponderaciones públicas |

La comparación directa con BH-Vision-1-2B no es posible en términos de rendimiento porque no hay métricas ni pesos. Frente a SmolVLM2-2.2B-Instruct, la diferencia esperada sería la especialización en bosnio y OCR, pero sin datos que lo respalden. Frente a alternativas de mayor tamaño como Qwen2.5-VL-3B, el modelo propuesto apostaría por un coste computacional menor a cambio de una cobertura idiomática muy restringida.

## Limitaciones y advertencias

- El modelo no está entrenado: las ponderaciones no existen, por lo que no puede descargarse ni ejecutarse.
- La model card indica explícitamente "STATUS: NIJE TRENIRAN" (no entrenado) y que es una tarjeta de proyecto.
- No hay resultados de benchmarks, por lo que no se puede verificar ninguna capacidad declarada.
- El alcance idiomático se limita al bosnio, lo que restringe su uso en entornos multilingües.
- Riesgo de alucinación: inherente a los VLM, pero no evaluado en este caso al no haber modelo.
- Sesgos conocidos: no disponible; dependerán de los datos de entrenamiento, aún no definidos en detalle.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero al no existir artefacto no aplica todavía.
- El conjunto held-out y las evaluaciones proxy descritas son parte de un plan, no de resultados verificados.
- La fecha de creación del repositorio (2026-11-16) y la ausencia de descargas o likes sugieren un proyecto incipiente sin validación de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/BH-Language-AI/bh-vision-1-2b
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM2-2.2B-Instruct
- Conjunto held-out: https://huggingface.co/BH-Language-AI/bs-vision-ocr-heldout-v01
- Configuración de entrenamiento citada: `bh-vision-training/configs/smo2b-qlora.yaml` (no se proporciona URL)
- Colección BH-Vision: no disponible
