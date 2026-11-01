# GVIS-ULE/rubiner

## Resumen

RubiNER es el componente de reconocimiento de entidades nombradas (NER) de propósito general del sistema de anonimización de textos del proyecto EOSC SIESTA (caso de uso 4). Se trata de un fine-tuning de `dslim/bert-base-NER`, un BERT base de 107,7 millones de parámetros, sobre informes sintéticos de incidentes de ciberseguridad, de modo que etiqueta tanto datos personales como entidades propias del dominio de seguridad (direcciones IP, hashes, malware, CVE, etc.).

El modelo resuelve un problema concreto: la desidentificación de informes de incidentes antes de su publicación o compartición. Para ello emplea 25 tipos de entidad en formato BIO (51 etiquetas), que cubren desde `PER`, `ORG` o `EMAIL` hasta `IP`, `URL`, `SOFTWARE`, `MALWARE` o `CVE`. Es importante subrayar que este modelo, por sí solo, no constituye RubiNER: en el sistema completo convive con un NER específico de ciberseguridad, reconocedores basados en patrones, tipos de entidad personalizados zero-shot y un reconocedor de fechas y horas, cuyas salidas se fusionan.

Es relevante ahora porque documenta un enfoque de anonimización orientado a un dominio muy específico (informes de ciberincidentes) con datos de entrenamiento sintéticos y una evaluación con partición estanca por incidentes semilla, lo que evita fugas de información entre entrenamiento y prueba. Su licencia MIT y su tamaño contenido (0,4 GB de repositorio) lo hacen desplegable en infraestructura modesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base (fine-tuning de `dslim/bert-base-NER`) |
| Parametros totales | 107.758.899 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens por ventana (ventanas con stride de 128 tokens para informes largos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tarea | token-classification (NER) |
| Etiquetas | 25 tipos de entidad en BIO (51 etiquetas) |
| Umbral de confianza (en RubiNER) | 0,65; se descartan spans de 1-2 caracteres |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT base, inicializado desde `dslim/bert-base-NER` y ajustado para token classification con 51 etiquetas BIO. El entrenamiento se realizó sobre 663 informes anotados procedentes de 37 incidentes semilla del dataset S-CECILIA-Gold, con 64 informes de 4 incidentes semilla adicionales como validación para seleccionar la época. Todos los informes de 15 incidentes semilla se reservaron como conjunto estanco y nunca se usaron para entrenamiento ni ajuste.

Los hiperparámetros documentados son: 8 épocas (mejor resultado en la época 6, según pérdida de validación), optimizador AdamW con tasa de aprendizaje 5e-5, weight decay 0,01, 10 % de warm-up lineal y tamaño de lote 16. Los informes largos se dividieron en ventanas de 512 tokens con un solapamiento (stride) de 128 tokens. Las anotaciones de S-CECILIA se mapearon a los tipos de entidad de SIESTA según el apéndice 1 del entregable D19.4; tres tipos sin equivalente en SIESTA (direcciones MAC, identificadores de sistema e información de eventos) se dejaron sin etiquetar. No se documenta uso de RLHF ni DPO, algo esperable en un modelo encoder de clasificación de tokens.

## Capacidades

- Reconocimiento de entidades nombradas en inglés con 25 tipos: personas, organizaciones, ubicaciones, fechas, horas, cargos, edad, nacionalidad, nombre de usuario, contraseña, número de identificación, número de cuenta o tarjeta, teléfono, correo electrónico, condición médica, cantidad, importe monetario, IP, URL, fichero, hash, software, sistema operativo, malware y CVE.
- Detección de datos personales (PII) orientada a desidentificación y anonimización.
- Detección de indicadores técnicos de compromiso propios de informes de ciberincidentes (IP, URL, hash, CVE, malware).
- Procesamiento de documentos largos mediante ventanas de 512 tokens con stride de 128.
- Salida en formato BIO compatible con el pipeline `token-classification` de Hugging Face y con la estrategia de agregación `simple`.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es un modelo discriminativo de etiquetado.
- No dispone de capacidades multimodales (visión, audio) ni de modo de razonamiento extendido.

## Casos de uso

- Anonimización de informes de ciberincidentes antes de compartirlos con terceros o publicarlos: el modelo etiqueta simultáneamente datos personales (nombres, correos, teléfonos) e indicadores técnicos, lo que permite aplicar reglas de redacción selectivas según el destinatario.
- Cumplimiento de RGPD en la gestión de incidentes: integrado en un pipeline previo al envío de informes a autoridades o socios, permite sustituir datos personales por marcadores antes de la difusión.
- Construcción de datasets de investigación sobre ciberseguridad: se puede usar para eliminar PII de corpus de incidentes antes de liberarlos a la comunidad, manteniendo intactos los indicadores técnicos necesarios para el análisis.
- Enriquecimiento de plataformas de ticketing o SIEM: el modelo extrae entidades estructuradas (IP, CVE, malware, software) de descripciones libres de incidentes, lo que facilita la correlación automática y el etiquetado de casos.
- Componente de un ensemble de anonimización: tal como está diseñado, se combina con un NER de ciberseguridad, reconocedores por patrones y un reconocedor de fechas, fusionando salidas y descartando predicciones por debajo de 0,65 de confianza.
- Preprocesado para revisión humana: genera una primera pasada de detección de entidades que un analista valida y corrige, reduciendo el tiempo de revisión manual de informes extensos gracias al procesamiento por ventanas con solapamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al entregable *EOSC SIESTA Deliverable D19.4: Anonymising Cyber Incident Reports* para el diseño y la evaluación completos, pero no incluye cifras de precisión, recall o F1 en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos (107,7 M de parámetros), más activaciones; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- En fp16: alrededor de 0,22 GB de pesos, con requisitos totales por debajo de 1 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobrada; también funciona en CPU con latencia aceptable para lotes pequeños. Para alto throughput en servidor, A100 o H100 no son necesarias pero permiten procesar lotes grandes.
- Cabe en GPU consumer y en equipos sin GPU dedicada; el repositorio completo ocupa 0,4 GB.
- Opciones de despliegue: pipeline `transformers` (documentado por el autor), así como servidores de inferencia compatibles con modelos `transformers` (por ejemplo, Text Embeddings Inference no aplica; sí soluciones genéricas de serving o exportación a ONNX). El autor no documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| GVIS-ULE/rubiner | 107,7 M | 512 tokens por ventana | Inglés | MIT | 25 tipos de entidad, incluye PII y entidades de ciberseguridad |
| dslim/bert-base-NER | 107,7 M (BERT base) | 512 tokens | Inglés | MIT | Modelo base; 4 tipos de entidad (PER, LOC, ORG, MISC) |
| Modelos NER genéricos tipo spaCy o Stanza | Variable | Variable | Multilingüe en algunos casos | Varía (MIT, Apache 2.0) | Etiquetas generales, sin tipos específicos de ciberseguridad |

La comparación directa con `dslim/bert-base-NER` es la más informativa: RubiNER amplía el conjunto de etiquetas de 4 a 25 tipos, incorporando categorías de PII y de dominio técnico, a costa de especializarse en el registro de informes de incidentes sintéticos. No se dispone de datos de rendimiento comparativo publicados en la información disponible.

## Limitaciones y advertencias

- Solo funciona en inglés; no se ha entrenado ni evaluado en otros idiomas.
- Entrenado exclusivamente con informes sintéticos de incidentes; el rendimiento en otros tipos de texto (correo corporativo, documentación técnica, texto literario) puede ser notablemente inferior.
- Como otros modelos NER, puede detectar con menor fiabilidad algunos nombres según su origen o género, lo que introduce sesgos en la anonimización.
- No debe usarse de forma aislada para desidentificación: el propio autor indica que debe ejecutarse como parte del ensemble RubiNER, junto con el NER de ciberseguridad, los reconocedores por patrones, los tipos personalizados zero-shot y el reconocedor de fechas.
- Riesgo de alucinación en sentido estricto bajo (es un modelo de etiquetado, no generativo), pero sí existe riesgo de falsos positivos y falsos negativos en la detección de entidades, con implicaciones directas para la privacidad si se confía únicamente en el modelo.
- El dataset de entrenamiento S-CECILIA está aún en revisión y no se ha publicado en el momento de redactar esta ficha, lo que limita la reproducibilidad.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base `dslim/bert-base-NER`, también MIT.
- No se documentan umbrales de confianza óptimos fuera del contexto de RubiNER (0,65); en otros pipelines habrá que calibrarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GVIS-ULE/rubiner
- Modelo base: https://huggingface.co/dslim/bert-base-NER
- Proyecto EOSC SIESTA: no disponible en la información proporcionada (el entregable D19.4 se cita como referencia, sin URL)
- Dataset S-CECILIA: no disponible (en revisión en el momento de redactar esta ficha)
