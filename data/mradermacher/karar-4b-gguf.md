# mradermacher/Karar-4B-GGUF

## Resumen

Karar-4B es un modelo de clasificación de texto y toma de decisiones desarrollado por mertkayacs, orientado a tareas de calibración, predicción conforme y enrutamiento con cuantificación explícita de incertidumbre. El modelo base (mertkayacs/Karar-4B) tiene 4.205.751.296 parámetros y está construido sobre una arquitectura derivada de Qwen3.5, según las etiquetas de la model card. La versión aquí descrita es la cuantización GGUF publicada por mradermacher, que permite ejecución local en CPU y GPU de consumo.

El modelo está especializado en turco e inglés, con etiquetas que indican capacidades de razonamiento, triaje, enrutamiento y salidas con tipado seguro ("typesafe"). Su propuesta diferencial es tratar la decisión como un problema con incertidumbre medible, apoyándose en calibración y predicción conforme, lo que lo hace adecuado para sistemas donde importa saber cuándo el modelo no debe decidir.

Esta ficha cubre la versión GGUF publicada por mradermacher, con 354 descargas y 1 like en el momento de la consulta, licencia Apache 2.0 y un repositorio de 39,9 GB que incluye múltiples cuantizaciones estáticas, desde Q2_K hasta f16, además de dos ficheros mmproj (multi-modal supplement).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (según etiquetas de la model card) |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | Turco (tr) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en formato transformers/safetensors |
| Pipeline | text-classification |
| Modelo base | mertkayacs/Karar-4B |
| Dataset de entrenamiento | mertkayacs/jevalt-data |
| Tamaño del repositorio | 39,9 GB |
| Fecha de creación | 2026-10-01 |
| Última actualización | 2026-10-06 |

## Arquitectura y entrenamiento

La información disponible indica que Karar-4B se basa en un transformer de la familia Qwen3.5, con 4.205.751.296 parámetros totales. No se especifica si emplea atención lineal, decodificación especulativa u otras innovaciones de eficiencia. Las etiquetas del modelo apuntan a un diseño orientado a decisiones ("decision-model"), con soporte para calibración, predicción conforme, incertidumbre, razonamiento, enrutamiento y triaje, así como salidas con tipado seguro ("typesafe").

El dataset de entrenamiento declarado es mertkayacs/jevalt-data. No se dispone de información sobre el número de tokens, la composición del corpus, ni sobre si se aplicaron técnicas de RLHF, DPO u otras fases de alineamiento. Tampoco se documentan detalles sobre el preentrenamiento del modelo base ni sobre el proceso de ajuste fino que da lugar a Karar-4B. La model card de la cuantización GGUF es meramente técnica y no aporta información sobre el entrenamiento.

## Capacidades

- Clasificación de texto y toma de decisiones: el pipeline declarado es text-classification, con etiquetas específicas de decisión, triaje y enrutamiento.
- Cuantificación de incertidumbre: soporte declarado para calibración y predicción conforme, orientado a medir la fiabilidad de las decisiones.
- Razonamiento: etiqueta "reasoning" presente en la model card.
- Enrutamiento y triaje: capacidad de derivar consultas o casos a la categoría o ruta adecuada.
- Salidas con tipado seguro ("typesafe"): orientado a integración en sistemas que requieren estructuras de salida predecibles.
- Multilingüe limitado: turco e inglés.
- Ejecución local y en dispositivo ("local-llm", "on-device"): gracias a las cuantizaciones GGUF.
- Compatibilidad con endpoints: etiqueta "endpoints_compatible".
- Soporte conversacional: etiqueta "conversational" presente.
- No se documentan capacidades de visión, audio ni tool calling en la información disponible.

## Casos de uso

- Triaje de tickets de soporte: el modelo puede clasificar y enrutar incidencias entrantes hacia el equipo o categoría adecuada, aprovechando su naturaleza de decision-model y su capacidad de enrutamiento declarada. La calibración permite identificar casos ambiguos que deben escalarse a revisión humana.
- Enrutamiento de consultas en asistentes conversacionales: dado un mensaje de usuario en turco o inglés, el modelo decide qué subsistema o herramienta debe atender la petición, con una medida de incertidumbre asociada para evitar enrutamientos erróneos.
- Moderación y clasificación de contenido: clasificación de textos en turco e inglés con umbrales de confianza ajustables gracias a la predicción conforme, útil para pipelines de moderación que requieren control explícito de falsos positivos y negativos.
- Sistemas de decisión con abstención: en flujos donde una decisión automática errónea es costosa, el modelo puede abstenerse cuando la incertidumbre supera un umbral calibrado, delegando en un humano o en un modelo mayor.
- Despliegue en dispositivo o en el borde: con cuantizaciones de 2,0 a 4,6 GB, el modelo puede ejecutarse en portátiles y estaciones de trabajo sin GPU dedicada mediante llama.cpp u Ollama, para clasificación local de documentos o mensajes.
- Clasificación de documentos y formularios en turco: extracción de categorías o decisiones a partir de texto administrativo o legal en turco, aprovechando el soporte específico del idioma.
- Prefiltrado en pipelines RAG o de agentes: uso del modelo como primer clasificador que decide si una consulta requiere recuperación, razonamiento multi-paso o respuesta directa, reduciendo coste frente a invocar modelos mayores en todos los casos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): aproximadamente 2,0 GB (Q2_K), 2,7-2,8 GB (Q4_K_S / Q4_K_M), 3,6 GB (Q6_K), 4,6 GB (Q8_0) y 8,5 GB (f16), a los que hay que sumar el espacio de contexto y overhead del runtime.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cualquier GPU con 8 GB o más de VRAM puede ejecutar las cuantizaciones Q4-Q8; las cuantizaciones Q2-Q4 caben en GPUs de 4-6 GB.
- GPU de consumo: sí, cabe en tarjetas como RTX 3060, RTX 4060, RTX 4070 y superiores con las cuantizaciones Q4_K_M o Q5_K_M; también en GPUs integradas o CPU con Q2_K-Q4_K_S.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF; el modelo base es compatible con transformers. La etiqueta "endpoints_compatible" sugiere compatibilidad con endpoints de inferencia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la información proporcionada. La comparación se limita a características estructurales conocidas.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Karar-4B (esta ficha) | 4,2 B | no disponible | tr, en | Apache 2.0 | GGUF, safetensors |
| Qwen3.5 (familia base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de clasificación de 3-4 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se identifican en la información disponible modelos directamente comparables en la categoría de decision-model con calibración y predicción conforme para turco e inglés.

## Limitaciones y advertencias

- Idiomas limitados: solo turco e inglés; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Sesgos: no se documentan evaluaciones de sesgo; al ser un modelo ajustado sobre un dataset específico (jevalt-data), puede heredar sesgos de ese corpus.
- Alucinación: aunque el pipeline es de clasificación, el modelo puede generar salidas incorrectas o sobreconfiadas; la calibración declarada no garantiza por sí sola una incertidumbre fiable sin validación en el dominio de despliegue.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar su uso con entradas largas.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset de entrenamiento, no documentadas en esta ficha.
- Cuantizaciones de baja precisión: Q2_K y Q3_K pueden degradar la calidad de clasificación; para decisiones críticas se recomienda Q4_K_M o superior.
- Sin datos de benchmarks: no hay evidencia publicada de rendimiento frente a alternativas, por lo que cualquier decisión de adopción debería basarse en una evaluación propia.
- Ficheros mmproj: el repositorio incluye suplementos multi-modales, pero la model card no documenta capacidades de visión; su función exacta no está disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Karar-4B-GGUF
- Modelo base: https://huggingface.co/mertkayacs/Karar-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/mertkayacs/jevalt-data
- Página de overview de cuantizaciones: https://hf.tst.eu/model#Karar-4B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
