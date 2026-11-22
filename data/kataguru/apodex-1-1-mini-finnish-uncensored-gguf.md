# kataguru/Apodex-1.1-mini-Finnish-Uncensored-GGUF

## Resumen

Apodex-1.1-mini-Finnish-Uncensored-GGUF es una cuantización GGUF del modelo base `apodex/Apodex-1.1-mini`, publicada por el usuario kataguru en Hugging Face. El modelo base emplea una arquitectura híbrida MoE con atención lineal y componentes Mamba/SSM, derivada de la familia Qwen3.5 MoE, con 35.505.251.456 parámetros totales y 256 expertos. La versión publicada incorpora un proceso de eliminación de rechazos denominado SOMA/ARA (ortogonalización de actividad residual) junto con un ajuste fino ligero de anclaje al finlandés y una plantilla de chat propia (Kataguru Master Chat Template v1.0).

El objetivo declarado del autor es la traducción de alta exigencia del inglés al finlandés en dominios académicos, biomédicos y técnicos, además de la interpretación de imágenes mediante un proyector multimodal separado. El modelo conserva la cabeza MTP/NextN nativa de la capa 40, lo que permite decodificación especulativa sin modelo borrador y, según la model card, aceleraciones de generación de hasta el 30-50 %.

Es relevante por dos motivos: por un lado, demuestra un flujo de trabajo de cuantización que preserva componentes de decodificación especulativa en formato GGUF, algo poco habitual; por otro, aplica técnicas de abliteración sobre un modelo MoE intentando evitar la degradación de los mecanismos de enrutamiento, un problema conocido en este tipo de arquitecturas. La licencia es Apache 2.0 y el repositorio ocupa 223,8 GB con múltiples variantes de cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con atención lineal y componentes Mamba/SSM (base Qwen3.5 MoE) |
| Parámetros totales | 35.505.251.456 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q3_K_M (~16 GB), IQ4_XS (~18 GB), Q4_K_M (~20 GB), Q5_K_M (~24 GB), Q6_K (~27 GB), mmproj BF16 (861 MB) |
| Idiomas soportados | finlandés (fi), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un MoE con 256 expertos y atención lineal, descrito en la model card como derivado de Qwen3.5 MoE con componentes Mamba/SSM. La versión publicada conserva intacta la arquitectura, el vocabulario nativo y la tokenización; no se modifican los pesos del enrutador ni la estructura de expertos. Se mantiene la cabeza MTP/NextN de la capa 40 con 20 tensores adicionales, cuantizada junto al resto del modelo, lo que habilita decodificación especulativa nativa.

Sobre el modelo base se aplica un proceso en dos fases. La primera, SOMA (Sparse Orthogonal Modulation & Abliteration), mide la dirección de rechazo en el espacio residual mediante pares de prompts dañinos y neutros, y localiza una ventana de capas mediante búsqueda bayesiana con TPE (el fragmento disponible de la model card se interrumpe en el parámetro 0.25, por lo que no se detalla el resto del procedimiento). La segunda fase consiste en un ajuste fino supervisado ligero de anclaje al finlandés y de «honestidad epistémica». No se especifican el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento en inglés y finlandés, con etiqueta `reasoning` en el repositorio.
- Traducción inglés-finlandés orientada a texto académico, científico, biomédico y técnico, con énfasis declarado en precisión terminológica.
- Interpretación de imágenes mediante el proyector multimodal `mmproj` en BF16 (pipeline `image-text-to-text`).
- Decodificación especulativa nativa mediante la cabeza MTP/NextN, sin necesidad de modelo borrador externo.
- Modo sin censura: el autor declara la neutralización de vectores de rechazo para contextos fisiológicos, anatómicos y médicos.
- Conversación multi-turno con plantilla de chat propia (Kataguru Master Chat Template v1.0).
- Compatibilidad declarada con LM Studio, llama.cpp y Ollama.
- Soporte de tool calling y de agentes multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Traducción de artículos académicos del inglés al finlandés: el modelo está ajustado específicamente para terminología científica y compuestos finlandeses, evitando transliteraciones y anglicismos en textos de investigación.
- Localización de documentación técnica y biomédica: permite traducir manuales, prospectos y guías clínicas al finlandés manteniendo precisión terminológica en contextos sensibles donde otros modelos aplican rechazos.
- Traducción de contenido médico y anatómico: la eliminación de vectores de rechazo evita interrupciones en pasajes fisiológicos, lo que resulta útil en editoriales médicas y material formativo sanitario.
- Asistente local de escritura en finlandés: desplegado con Ollama o LM Studio en estaciones de trabajo, sirve para redacción y revisión de textos en finlandés sin depender de la nube.
- Análisis de imágenes con descripción en finlandés: el proyector multimodal permite transcribir y describir figuras, gráficos o capturas en flujos de documentación técnica.
- Generación acelerada en producción: la cabeza MTP preservada reduce la latencia en pipelines de traducción por lotes, según el autor con ganancias de hasta el 30-50 %.
- Investigación sobre abliteración en MoE: el repositorio documenta el método SOMA/ARA y sirve como referencia para estudiar la preservación del enrutamiento tras eliminar vectores de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: Q3_K_M ~16 GB, IQ4_XS ~18-24 GB, Q4_K_M ~20-32 GB, Q5_K_M ~24-32 GB (o 64 GB de RAM), Q6_K ~27 GB o más.
- GPU recomendadas por el autor: 24-32 GB de VRAM para Q4_K_M (por ejemplo, RTX 4090 de 24 GB con margen ajustado, A100 40 GB, H100); 32 GB o más para Q5_K_M y Q6_K.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con Q3_K_M o IQ4_XS; Q4_K_M requiere gestión cuidadosa de la memoria o descarga parcial a RAM.
- Opciones de despliegue: LM Studio, llama.cpp y Ollama, según la model card; vLLM y TGI no se mencionan para el formato GGUF.
- Latencia y throughput: no se publican cifras absolutas; el autor afirma ganancias de hasta el 30-50 % en velocidad de generación gracias a la cabeza MTP nativa.
- El proyector multimodal `mmproj` (861 MB) se suma al requisito de memoria cuando se usa entrada de imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Apodex-1.1-mini-Finnish-Uncensored | 35,5 B (MoE, 256 expertos) | no disponible | fi, en | Apache 2.0 | GGUF |
| Modelo base apodex/Apodex-1.1-mini | 35,5 B (MoE) | no disponible | no disponible | no disponible | safetensors |
| Alternativas de traducción en/fi de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables documentados en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- La model card está redactada por el autor y contiene afirmaciones de rendimiento (30-50 % de aceleración, superioridad en traducción) sin benchmarks publicados que las respalden.
- El proceso de abliteración puede degradar capacidades de razonamiento o coherencia; el autor argumenta que su método lo evita, pero no aporta evaluaciones comparativas.
- La eliminación de rechazos implica que el modelo puede generar contenido sensible en contextos médicos o fisiológicos; requiere supervisión en producción.
- Idiomas limitados a finlandés e inglés; el rendimiento en castellano no está documentado ni garantizado.
- La longitud de contexto no se especifica en la información disponible, lo que impide planificar cargas de trabajo con ventanas largas.
- El repositorio ocupa 223,8 GB, lo que exige espacio de almacenamiento considerable si se descargan varias cuantizaciones.
- El número de descargas (606) y la ausencia de «likes» indican una adopción todavía muy limitada, sin validación comunitaria amplia.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia y el proceso de entrenamiento del modelo base no están detallados en la información disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kataguru/Apodex-1.1-mini-Finnish-Uncensored-GGUF
- Modelo base: https://huggingface.co/apodex/Apodex-1.1-mini
- Paper, blog o demo del método SOMA/ARA: no disponible
- Repositorio de código o demos adicionales: no disponible
