# CobuildX-AI/cbx-bfs-esg-topic-classifier-17M

## Resumen

El cbx-bfs-esg-topic-classifier-17M es un clasificador de texto en inglés especializado en temática ESG (ambiental, social y de gobernanza), desarrollado por CobuildX-AI. Se construye sobre el encoder Ettin de 17 millones de parámetros (jhu-clsp/ettin-encoder-17m) y añade tres cabezas de clasificación que devuelven, para un pasaje dado, el conjunto de temas ESG que trata de forma sustantiva, el tema principal y la orientación del contenido (adverso, positivo, neutro o mixto).

El modelo resuelve un problema concreto del sector financiero y regulatorio: la necesidad de etiquetar automáticamente grandes volúmenes de documentos corporativos (memorias anuales, declaraciones de proxy, comunicados de reguladores, notas de crédito) según 15 categorías ESG definidas con precisión. Su tamaño reducido (16,8 millones de parámetros, repositorio de 0,1 GB) permite desplegarlo en CPU o GPU de forma económica, lo que lo hace atractivo para pipelines de análisis documental a escala.

Es relevante ahora porque la divulgación ESG se ha vuelto obligatoria en múltiples jurisdicciones y el volumen de texto a procesar supera la capacidad de revisión manual. El modelo ofrece una alternativa ligera y de licencia Apache-2.0 frente a soluciones propietarias, con métricas de evaluación publicadas sobre conjuntos de test separados por empresas y por reguladores no vistos en entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT/Ettin), con tres cabezas de clasificación |
| Parametros totales | 16.806.435 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (el texto más largo se trunca) |
| Tipos de cuantizacion | No disponible (pesos safetensors en precisión original; no se documentan versiones GGUF ni cuantizadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del encoder Ettin de 17 millones de parámetros (jhu-clsp/ettin-encoder-17m), una arquitectura transformer de tipo encoder con atención bidireccional, y le añade tres cabezas: una para clasificación multi-etiqueta de 15 temas ESG, otra para el tema principal y otra para la orientación (adverso, positivo, neutro, mixto). El modelo lee como máximo 512 tokens por pasaje; los textos más largos se truncan y se marca el campo `"truncated": True`. Los pasajes de entrenamiento tenían entre 75 y 250 palabras aproximadamente.

El entrenamiento se realizó sobre 12.030 pasajes: 10.870 pasajes reales en inglés de 2019 a 2026 (presentaciones 10-K, 20-F y proxy de SEC EDGAR de unas 1.200 empresas; comunicados del Departamento de Justicia de EE. UU., SEC, Reserva Federal y FDIC, GOV.UK y la Comisión Europea) más 1.160 pasajes generados con nombres inventados para temas con pocos ejemplos y negativos difíciles. Las etiquetas siguen una guía de anotación escrita con definiciones de temas, reglas de frontera y reglas de tema principal y orientación. Cada pasaje fue etiquetado de forma independiente por dos LLM (gpt-5.4-mini y Claude Haiku 5.5); los desacuerdos, junto con una auditoría del 10% de los acuerdos, fueron resueltos por Claude Sonnet 5.5. En la mitad de los pasajes de entrenamiento se enmascararon nombres de agencias y tribunales. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Clasificación multi-etiqueta de 15 temas ESG: E01 emisiones y clima, E02 energía y transición, E03 agua, E04 contaminación y residuos, E05 naturaleza y uso del suelo, S01 derechos y condiciones laborales, S02 salud y seguridad en el trabajo, S03 protección del cliente y trato justo, S04 seguridad y calidad de producto, S05 privacidad y ciberseguridad, S06 impacto comunitario y acceso, G01 responsabilidad del consejo y directivos, G02 ética y anticorrupción, G03 integridad del reporting y transparencia, G04 finanzas e inversión responsable.
- Identificación del tema principal (`primary`), con `N00` cuando el pasaje no trata ningún tema ESG de forma sustantiva.
- Clasificación de orientación: `adverse` (daños, violaciones, alegaciones, sanciones), `positive` (medidas o resultados concretos), `neutral` (políticas, declaraciones de riesgo, regulación explicada) o `mixed`.
- Procesamiento por lotes: el método `classify` acepta una lista de pasajes además de un pasaje individual.
- Umbral configurable: el valor por defecto es 0,63, ajustado en validación para micro F1; se puede modificar para intercambiar recall por precisión.
- Ejecución en CPU o GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking; es exclusivamente un clasificador de texto.

## Casos de uso

- Triaje de memorias anuales y presentaciones 10-K: el modelo procesa párrafos de informes corporativos y devuelve los temas ESG tratados y su orientación, lo que permite filtrar secciones relevantes antes de la revisión humana. Es adecuado porque fue entrenado con presentaciones 10-K y 20-F de unas 1.200 empresas.
- Monitorización de comunicados regulatorios: al ingerir notas de prensa de agencias (DoJ, SEC, Reserva Federal, FDIC, GOV.UK, Comisión Europea) el clasificador identifica si el comunicado reporta un evento adverso (S02, G02) o una medida positiva, útil para alertas tempranas de riesgo reputacional.
- Análisis de notas de crédito y due diligence: para evaluar el perfil ESG de un prestatario, el modelo etiqueta pasajes de notas internas y detecta temas como G04 (financiación responsable) o E01 (emisiones financiadas), con la orientación correspondiente.
- Detección de greenwashing: la combinación de tema G03 (integridad del reporting) con orientación `adverse` o `mixed` permite señalar pasajes que podrían contener afirmaciones engañosas, apoyándose en la capacidad del modelo para distinguir mención de tratamiento sustantivo.
- Enriquecimiento de bases de datos documentales: integrado en un pipeline de extracción, clasifica lotes de párrafos y añade metadatos de tema y orientación a un índice de búsqueda, gracias a su reducido tamaño (0,1 GB) y a la posibilidad de ejecutarse en CPU.
- Clasificación de textos de cumplimiento normativo: para textos del Federal Register o reglas de reguladores, el modelo mantiene una precisión de orientación de 0,950 en el conjunto de test de reglas, lo que lo hace útil para separar obligaciones de sanciones en flujos de compliance.
- Filtrado previo en revisiones de proxy statements: identifica temas de gobernanza (G01, G02, G03) en declaraciones de proxy para priorizar la lectura de secciones sobre independencia del consejo, remuneración ejecutiva o partes relacionadas.

## Benchmarks y rendimiento

Los resultados publicados en la model card son los siguientes. La comparación con TF-IDF + regresión logística entrenada con los mismos datos se incluye como referencia.

| Conjunto de test | Micro F1 | Macro F1 | Falsa alarma | Precisión tema principal | Precisión orientación | TF-IDF micro F1 |
|---|---:|---:|---:|---:|---:|---:|
| Empresas reservadas y comunicados de agencias 2025-2026 (1.761 pasajes) | 0,799 | 0,790 | 0,103 | 0,847 | 0,916 | 0,810 |
| Dos reguladores nunca vistos en entrenamiento: autoridad de competencia del Reino Unido y agencia de seguridad de producto de EE. UU. (363) | 0,695 | 0,557 | 0,449 | 0,614 | 0,573 | 0,619 |
| Texto de reglas del Federal Register de EE. UU., género ausente del entrenamiento (439) | 0,664 | 0,633 | 0,174 | 0,676 | 0,950 | 0,705 |

F1 por tema en el conjunto de test de empresas reservadas y comunicados 2025-2026: E01 0,772; E02 0,769; E03 0,859; E04 0,861; E05 0,766; S01 0,731; S02 0,824; S03 0,740; S04 0,857; S05 0,869; S06 0,800; G01 0,794; G02 0,771; G03 0,739; G04 0,692.

El enmascaramiento de nombres de agencias y tribunales en los conjuntos de test cambia el micro F1 en 0,001.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (16,8 millones de parámetros, pesos safetensors de aproximadamente 67 MB en fp32); en fp16 o bf16 alrededor de 34 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el modelo puede ejecutarse en CPU sin problema. No requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier modelo (GTX 1050, RTX 3060, RTX 4090, etc.) y también en CPU.
- Opciones de despliegue: transformers (librería indicada en la model card), text-embeddings-inference (etiqueta `text-embeddings-inference`), endpoints compatibles (etiqueta `endpoints_compatible`). No se documentan versiones GGUF para llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---:|---|---|---|---|
| cbx-bfs-esg-topic-classifier-17M | 16,8 M | 512 tokens | en | Apache-2.0 | Clasificador ESG multi-etiqueta con orientación; micro F1 0,799 en test de empresas reservadas |
| Versión de 68 M del mismo clasificador (mencionada en la model card) | 68 M | no disponible | en | Apache-2.0 | Misma tarea, mayor tamaño; no se publican métricas en la información disponible |
| TF-IDF + regresión logística (referencia de la model card) | no aplica | no aplica | en | no disponible | Micro F1 0,810 en el mismo test; supera al modelo en ese conjunto pero queda por debajo en los otros dos (0,619 y 0,705) |

No se dispone de información sobre otros clasificadores ESG comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Solo inglés: el modelo no está entrenado ni evaluado para otros idiomas.
- Límite de 512 tokens: los textos más largos se truncan y se marca `"truncated": True`; es necesario dividir documentos largos en párrafos.
- Géneros no soportados: tablas, figuras, encabezados y listas de números quedan fuera del entrenamiento; no deben usarse como entrada.
- Degradación en dominios no vistos: en reguladores nunca vistos en entrenamiento el micro F1 cae a 0,695 y la falsa alarma sube a 0,449; en textos del Federal Register el micro F1 es 0,664. La orientación también se degrada en esos conjuntos (0,573 y 0,950 respectivamente).
- Riesgo de falsos positivos: la tasa de falsa alarma es 0,103 en el conjunto principal; pasajes sin tema ESG pueden recibir una etiqueta.
- Etiquetado asistido por LLM: las etiquetas de entrenamiento fueron generadas por modelos (gpt-5.4-mini, Claude Haiku 5.5 y Claude Sonnet 5.5 como árbitro), lo que puede introducir sesgos sistemáticos del etiquetador.
- Riesgo de alucinación: al ser un clasificador, no genera texto libre, pero puede asignar temas con confianza alta a pasajes ambiguos; se recomienda revisar los scores por tema y ajustar el umbral.
- Licencia Apache-2.0: permite uso comercial, pero la model card remite a la sección "Intended use and disclaimer" antes de su uso; no se detallan restricciones adicionales en la información disponible.
- Datos de sesgo: no se documentan análisis de sesgo demográfico, geográfico o sectorial en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/cbx-bfs-esg-topic-classifier-17M
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-17m
