# mradermacher/Visual-ARFT-Search-GGUF

## Resumen

Visual-ARFT-Search-GGUF es la versión cuantizada en formato GGUF del modelo Visual-ARFT-Search, desarrollado originalmente por el usuario laolao77 y convertido a GGUF por mradermacher. Se trata de un modelo multimodal de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) orientado a tareas de búsqueda visual y razonamiento agéntico, según se desprende de su nombre (ARFT probablemente hace referencia a "Agentic Reinforcement Fine-Tuning" y "Search" a capacidades de búsqueda). El modelo base está publicado bajo licencia Apache 2.0 y soporta únicamente el idioma inglés.

La relevancia de esta ficha radica en que las cuantizaciones GGUF permiten ejecutar un modelo multimodal de 7,6B en hardware de consumo, algo imposible con los pesos originales en precisión completa. El repositorio incluye tanto los archivos del modelo de lenguaje cuantizados (desde Q2_K hasta f16) como los suplementos multimodales mmproj en Q8_0 y f16, necesarios para el procesamiento de imágenes.

No se dispone de información publicada sobre la arquitectura interna exacta, los datos de entrenamiento ni los resultados de benchmarks del modelo base en la información proporcionada. Esta ficha se limita a documentar lo que sí está disponible: las especificaciones de las cuantizaciones, el tamaño del modelo, la licencia y las características deducibles de los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con proyector mmproj; arquitectura transformer presumible, no confirmada) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base laolao77/Visual-ARFT-Search en los datos disponibles. El nombre sugiere un modelo multimodal con capacidades de búsqueda y razonamiento agéntico (posiblemente entrenado con refuerzo fino para tareas de búsqueda, "ARFT" podría corresponder a "Agentic Reinforcement Fine-Tuning"), pero esta interpretación no está confirmada por la model card. El repositorio incluye un proyector multimodal (mmproj) en dos precisiones (Q8_0 y f16), lo que confirma que el modelo procesa entradas de imagen además de texto.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras. La model card del repositorio GGUF es únicamente una ficha de cuantización generada por mradermacher y no incluye información sobre el entrenamiento del modelo original. Se recomienda consultar la model card del modelo base para obtener detalles técnicos.

## Capacidades

- Procesamiento multimodal: el modelo incluye un proyector mmproj, lo que indica capacidad para procesar imágenes junto con texto.
- Búsqueda y razonamiento agéntico: el nombre del modelo sugiere capacidades de búsqueda (search) y razonamiento multi-paso, aunque no se detallan en la información disponible.
- Generación de texto conversacional: la etiqueta "conversational" en los metadatos indica que está optimizado para diálogo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: presumible por el nombre ("ARFT-Search"), pero no confirmado en la documentación.
- Capacidades multilingües: solo inglés según los metadatos.
- Capacidades especiales (thinking mode, visión, audio): visión confirmada por el mmproj; otras no disponibles.

## Casos de uso

- Búsqueda visual asistida: el modelo puede recibir una imagen y texto para realizar tareas de búsqueda o recuperación de información visual, adecuado por su naturaleza multimodal y su nombre orientado a "search".
- Asistentes conversacionales con entrada de imagen: integrable en chatbots que necesiten interpretar capturas de pantalla o fotografías y responder en inglés, gracias a su formato GGUF que permite despliegue en local.
- Prototipado de agentes de búsqueda en investigación: investigadores que quieran experimentar con modelos agénticos de búsqueda multimodal pueden ejecutarlo en hardware de consumo usando las cuantizaciones Q4_K_M o Q5_K_M.
- Análisis de documentos con imágenes: extracción de información de capturas, diagramas o figuras en un pipeline de procesamiento documental, usando el mmproj para la parte visual.
- Despliegue en entornos con recursos limitados: al caber en GPUs de consumo (ver sección de hardware), es adecuado para demos locales, pruebas de concepto y entornos de desarrollo sin acceso a clústeres.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece un espectro amplio de cuantizaciones (de Q2_K a f16) que permite estudiar el impacto de la cuantización en un modelo multimodal de 7,6B, útil para investigación en eficiencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de archivo GGUF, más overhead de contexto y del mmproj):
  - Q2_K: ~3,1 GB + mmproj (~1,0-1,5 GB) + overhead → ~5-6 GB
  - Q4_K_M: ~4,8 GB + mmproj + overhead → ~7-8 GB
  - Q5_K_M: ~5,5 GB + mmproj + overhead → ~8-9 GB
  - Q6_K: ~6,4 GB + mmproj + overhead → ~9-10 GB
  - Q8_0: ~8,2 GB + mmproj + overhead → ~11-12 GB
  - f16: ~15,3 GB + mmproj + overhead → ~18-20 GB
- GPU recomendadas: RTX 3060 12 GB o superior para cuantizaciones Q4-Q5; RTX 4090 24 GB para Q8_0 o f16; A100/H100 no necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 8 GB o más para cuantizaciones bajas (Q2_K a Q4_K_M); 12 GB o más para Q5-Q6; 16 GB o más para Q8_0.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF y mmproj (por ejemplo, llama.cpp con soporte multimodal). vLLM y TGI no soportan GGUF de forma nativa para multimodal en el momento de redactar esta ficha (no confirmado en la información).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente sobre modelos comparables de la misma categoría (multimodales de ~7,6B orientados a búsqueda agéntica) en los datos proporcionados. Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Visual-ARFT-Search-GGUF | 7,6B | no disponible | Apache 2.0 | GGUF | Multimodal, orientado a búsqueda |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado principalmente en inglés, es probable que presente sesgos culturales y lingüísticos propios de los datos de entrenamiento, pero no se confirma.
- Riesgo de alucinación: no evaluado en la información proporcionada; como todo modelo generativo, existe riesgo, especialmente en tareas de búsqueda donde puede inventar fuentes o resultados.
- Limitaciones de contexto o idioma: solo soporta inglés según los metadatos; la longitud de contexto no está documentada, lo que impide planificar su uso en tareas de contexto largo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base (laolao77/Visual-ARFT-Search), que según los metadatos también es Apache 2.0. No obstante, el repositorio GGUF es una conversión no oficial; para producción se recomienda validar con el autor original.
- Caveats para producción: la model card del repositorio GGUF no documenta el comportamiento del modelo, los benchmarks ni las limitaciones; el modelo tiene muy pocas descargas (77) y cero likes, lo que sugiere poca validación comunitaria. La fecha de actualización (2026) es posterior a la de creación, pero no se detalla qué cambios se hicieron. Se recomienda probar exhaustivamente antes de usar en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Visual-ARFT-Search-GGUF
- Modelo base: https://huggingface.co/laolao77/Visual-ARFT-Search
- Cuantizaciones imatrix (weighted): https://huggingface.co/mradermacher/Visual-ARFT-Search-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Visual-ARFT-Search-GGUF
- FAQ y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
