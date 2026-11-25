# mradermacher/BioReason-Pro-2-9B-RL-GGUF

## Resumen

BioReason-Pro-2-9B-RL es un modelo de lenguaje especializado en biología molecular, desarrollado originalmente por NVIDIA (bajo el identificador `nvidia/BioReason-Pro-2-9B-RL`) y distribuido en formato GGUF por el usuario mradermacher. El modelo está orientado a tareas de predicción de función de proteínas y anotación con términos de Gene Ontology (GO), un problema central en bioinformática donde el volumen de secuencias proteicas supera con creces la capacidad de validación experimental. Se trata de un modelo derivado de la familia BioNeMo, el ecosistema de NVIDIA para modelos fundacionales en ciencias de la vida.

La versión aquí descrita es una cuantización estática del modelo original, generada con herramientas de conversión a GGUF para permitir su ejecución en llama.cpp y entornos de inferencia local. Cuenta con 8.953.803.264 parámetros (aproximadamente 9B) y está entrenado exclusivamente en inglés. El repositorio incluye un conjunto amplio de cuantizaciones que van desde Q2_K (4,0 GB) hasta f16 (18,0 GB), lo que facilita el despliegue en hardware de consumo.

La relevancia de esta ficha radica en que se trata de un modelo de dominio muy específico: no es un asistente generalista, sino una herramienta de razonamiento biológico entrenada sobre el dataset `wanglab/bioreason-pro-v2`. Su licencia es OpenMDW-1.1, una licencia abierta para modelos de peso abierto promovida por OpenMDW, lo que condiciona su uso comercial y de redistribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer derivado de la familia BioNeMo; la model card no detalla la arquitectura interna) |
| Parámetros totales | 8.953.803.264 (≈9B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | OpenMDW-1.1 (license_name: openmdw-1.1; license: other) |
| Formato de pesos | GGUF (cuantizaciones estáticas generadas por mradermacher); el modelo base original en safetensors está en `nvidia/BioReason-Pro-2-9B-RL` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su pertenencia al ecosistema BioNeMo de NVIDIA y su naturaleza transformer (los tags incluyen `transformers` y el modelo es compatible con la librería homónima). No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni si emplea innovaciones como atención lineal o decodificación especulativa. Tampoco se documenta la longitud de contexto nativa.

Respecto al entrenamiento, la model card únicamente indica que el modelo se ha entrenado sobre el dataset `wanglab/bioreason-pro-v2`, orientado a razonamiento biológico y predicción de función proteica. El sufijo `-RL` en el nombre sugiere una fase de aprendizaje por refuerzo (reinforcement learning), pero no se aportan detalles sobre el algoritmo, el número de tokens de entrenamiento, la composición del corpus ni si hubo fases de RLHF o DPO. La cuantización aquí publicada es estática (no hay cuantizaciones ponderadas/imatrix disponibles según el autor de la conversión) y se generó con `convert_type: hf` y `quantize_version: 2`.

## Capacidades

- Predicción de función de proteínas a partir de secuencias o representaciones biológicas.
- Anotación con términos de Gene Ontology (gene-ontology), incluyendo razonamiento sobre la evidencia que sustenta cada anotación.
- Razonamiento biológico multi-paso orientado a tareas de biología molecular.
- Generación de texto conversacional en inglés (el tag `conversational` está presente).
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que permite su despliegue en infraestructuras de inferencia compatibles.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible; el modelo se declara únicamente como texto y biología.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo "thinking" explícito: no disponible en la documentación.

## Casos de uso

- Anotación automática de proteínas en pipelines de genómica: el modelo puede recibir secuencias o descripciones proteicas y generar términos GO candidatos, reduciendo el trabajo manual de curaduría en bases de datos biológicas.
- Priorización de dianas terapéuticas: integrado en un flujo de análisis, permite inferir la función probable de proteínas poco caracterizadas y orientar la selección de candidatos para validación experimental.
- Enriquecimiento de bases de datos internas: uso por parte de equipos de bioinformática para completar anotaciones funcionales faltantes en catálogos propios de proteínas, con revisión humana posterior.
- Asistente de investigación en biología computacional: un investigador puede consultar en inglés hipótesis funcionales sobre proteínas concretas y obtener razonamientos trazables sobre términos GO, útil para generar hipótesis antes de diseñar experimentos.
- Docencia y formación en bioinformática: despliegue local con cuantización Q4_K_M (5,8 GB) en estaciones de trabajo con GPU de consumo para que estudiantes practiquen anotación funcional asistida por IA.
- Procesamiento por lotes en infraestructura propia: gracias a las cuantizaciones GGUF y a la compatibilidad con llama.cpp, se puede ejecutar en servidores sin GPU de datacenter para anotar lotes moderados de proteínas de forma económica.
- Integración en agentes de razonamiento científico: al ser un modelo conversacional, puede formar parte de un pipeline de agentes donde otro modelo orqueste consultas biológicas y este aporte el razonamiento de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ≈ 4,0 GB de pesos; Q4_K_M ≈ 5,8 GB; Q5_K_M ≈ 6,6 GB; Q8_0 ≈ 9,6 GB; f16 ≈ 18,0 GB. A estos valores hay que sumar el espacio para el contexto KV cache, que depende de la longitud de contexto configurada (no documentada).
- GPU recomendadas: para cuantizaciones Q4/Q5, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB es suficiente; para Q8_0 se recomienda RTX 4090 (24 GB) o A100/H100 en entornos de servidor; la variante f16 requiere al menos 24 GB y encaja en A100 40/80 GB o H100.
- Cabe en GPU de consumo: sí, en cuantizaciones Q2_K a Q5_K_M con GPUs de 8-12 GB; Q6_K y Q8_0 requieren 12-16 GB o más.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), y servidores compatibles con endpoints según el tag `endpoints_compatible`. vLLM y TGI no están confirmados para este formato en la información disponible.
- Latencia y throughput estimados: no disponibles. Al ser un modelo de ~9B, el throughput dependerá del hardware y de la cuantización; no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BioReason-Pro-2-9B-RL (este) | ≈9B | no disponible | Biología / función proteica / GO | OpenMDW-1.1 | GGUF en HF; base en nvidia/ |
| nvidia/BioReason-Pro-2-9B-RL (base) | ≈9B | no disponible | Biología / función proteica / GO | OpenMDW-1.1 | Safetensors en HF |
| Otros modelos de la familia BioNeMo | no disponible | no disponible | Ciencias de la vida | no disponible | Ecosistema NVIDIA BioNeMo |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Entrenado exclusivamente en inglés: las consultas en castellano u otros idiomas pueden degradar la calidad de las respuestas.
- Dominio restringido a biología molecular y predicción de función proteica; no es un asistente generalista y su rendimiento fuera de ese ámbito será limitado.
- Riesgo de alucinación en anotaciones GO: las predicciones deben validarse experimentalmente o mediante curaduría humana antes de incorporarse a bases de datos de producción.
- La licencia OpenMDW-1.1 es una licencia de pesos abiertos con condiciones específicas; es imprescindible revisar sus términos antes de un uso comercial o de redistribución, ya que el campo `license` aparece como `other`.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado sobre datos biológicos podría heredar sesgos de las bases de datos de referencia (sobrerrepresentación de organismos modelo, por ejemplo).
- Longitud de contexto no documentada: planificar el despliegue sin asumir una ventana concreta y verificar empíricamente el límite real.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K) pueden degradar notablemente la calidad del razonamiento biológico; se recomienda Q4_K_M o superior para tareas de anotación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del comportamiento de estas cuantizaciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/BioReason-Pro-2-9B-RL-GGUF
- Modelo base original: https://huggingface.co/nvidia/BioReason-Pro-2-9B-RL
- Página de descargas del autor de cuantizaciones: https://hf.tst.eu/model#BioReason-Pro-2-9B-RL-GGUF
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1.1/
- Dataset de entrenamiento: https://huggingface.co/datasets/wanglab/bioreason-pro-v2
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
