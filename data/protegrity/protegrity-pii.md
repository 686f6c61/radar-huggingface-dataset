# Protegrity/protegrity-pii

## Resumen

Protegrity PII es un modelo de clasificación de tokens (token classification) especializado en la detección y etiquetado de información personal identificable (PII) en textos multilingües. Lo desarrolla Protegrity, empresa especializada en seguridad y privacidad de datos, y se distribuye a través de Hugging Face con acceso restringido (gated), lo que obliga a aceptar las condiciones de la licencia antes de su descarga. Su propósito es servir como componente de desidentificación y anonimización dentro de pipelines de cumplimiento normativo (RGPD, CCPA y similares).

El modelo parte de `FacebookAI/xlm-roberta-base`, un transformer encoder de tipo RoBERTa multilingüe, y se ha afinado para la tarea de NER orientada a PII. Cuenta con 277.559.947 parámetros y cubre siete idiomas: inglés, español, portugués, alemán, francés, italiano y neerlandés. El repositorio ocupa aproximadamente 1,1 GB y los pesos se distribuyen en formato safetensors compatibles con la librería `transformers`.

Su relevancia actual radica en que la mayoría de los detectores de PII comerciales están sesgados hacia el inglés o dependen de servicios en la nube. Un modelo abierto, multilingüe y desplegable on-premise permite a las organizaciones procesar datos sensibles sin enviarlos a terceros, algo crítico en sectores regulados como salud, banca o administración pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) |
| Parametros totales | 277.559.947 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa base admite 512 tokens como maximo tipico) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, es, pt, de, fr, it, nl |
| Licencia | protegrity-pii-license (acceso restringido, requiere aceptacion) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura XLM-RoBERTa, un transformer encoder con atención bidireccional y tokenización SentencePiece, preentrenado de forma multilingüe sobre grandes corpus en más de cien idiomas. Sobre esa base, Protegrity ha realizado un ajuste fino supervisado para la tarea de token classification con etiquetas orientadas a PII. Al ser un encoder y no un modelo generativo, no emplea decodificación autoregresiva ni técnicas como RLHF o DPO; su entrenamiento se limita al ajuste supervisado sobre un corpus etiquetado de entidades personales.

La información pública no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni el esquema de etiquetas utilizado. Tampoco se especifican innovaciones técnicas adicionales más allá del ajuste fino estándar sobre XLM-RoBERTa base. El modelo está referenciado con el identificador arXiv:2610.30518, que presumiblemente contiene la descripción técnica completa, aunque sus detalles no se han incluido en la información disponible.

## Capacidades

- Detección y clasificación de entidades de información personal identificable (nombres, direcciones, identificadores, etc.) a nivel de token.
- Procesamiento multilingüe en siete idiomas: inglés, español, portugués, alemán, francés, italiano y neerlandés.
- Integración nativa con el pipeline `token-classification` de la librería `transformers`.
- Salida compatible con flujos de desidentificación y anonimización (sustitución, enmascaramiento o pseudonimización de entidades detectadas).
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades de agente: es un modelo exclusivamente extractivo.
- No dispone de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Desidentificación en pipelines de datos sanitarios: el modelo etiqueta nombres de pacientes, identificadores y direcciones en historiales clínicos multilingües antes de almacenarlos o compartirlos con terceros, reduciendo el riesgo de reidentificación.
- Cumplimiento del RGPD en atención al cliente: integrado como paso previo al registro de conversaciones, permite enmascarar automáticamente datos personales en transcripciones de chats y correos antes de su archivado.
- Anonimización de datasets para investigación: aplicable a corpus en español, portugués, francés, alemán, italiano y neerlandés para preparar conjuntos de datos publicables sin exponer información personal.
- Preprocesado en sistemas de gestión documental: detección de PII en contratos, facturas y formularios escaneados (tras OCR) para clasificar documentos según su sensibilidad.
- Filtrado de datos en pipelines de entrenamiento de modelos: eliminación de PII de corpus web antes de usarlos para preentrenamiento o ajuste fino de otros modelos.
- Auditoría de privacidad: análisis por lotes de bases de datos existentes para localizar registros con información personal no inventariada y priorizar su tratamiento.
- Enmascaramiento en logs de aplicaciones: integración como componente de preprocesado en sistemas de logging para evitar que credenciales, correos o identificadores queden registrados en claro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,1 GB para los pesos (277 M de parámetros), con overhead adicional de activaciones que depende de la longitud de secuencia y el tamaño de lote.
- En FP16: alrededor de 550-600 MB de pesos, apto para GPUs consumer de gama baja.
- Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para volúmenes moderados de inferencia.
- Despliegue recomendado mediante `transformers` con el pipeline `token-classification`; también es compatible con servidores de inferencia basados en `transformers` como TGI, aunque no se han publicado configuraciones específicas.
- No se dispone de datos de latencia o throughput publicados. Al tratarse de un encoder de 277 M de parámetros con contexto limitado a 512 tokens, el throughput esperado por GPU es alto, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| Protegrity/protegrity-pii | 277,6 M | no disponible (XLM-R base ~512) | 7 | protegrity-pii-license | Restringido (gated) |
| FacebookAI/xlm-roberta-base | 278 M | 512 | ~100 | MIT | Abierto |
| Modelos NER multilingues genericos (p. ej. variantes de XLM-R afinadas para NER) | ~278 M | 512 | Variable | Variable | Variable |

La comparación se limita a la arquitectura base, ya que no se han publicado métricas de rendimiento del modelo de Protegrity que permitan contrastar su calidad frente a alternativas. Frente a `xlm-roberta-base`, la diferencia principal es el ajuste específico para PII y una licencia restrictiva que condiciona el uso comercial.

## Limitaciones y advertencias

- Acceso restringido: la descarga requiere aceptar la licencia `protegrity-pii-license` en Hugging Face; no es un modelo de uso libre sin condiciones.
- Licencia no estándar: las condiciones exactas de uso comercial no se detallan en la información disponible y deben revisarse antes de integrarlo en producción.
- Contexto limitado a 512 tokens (heredado de XLM-RoBERTa base): documentos largos requieren segmentación previa, lo que puede fragmentar entidades y degradar la detección en los límites de cada fragmento.
- Cobertura lingüística limitada a siete idiomas; no se garantiza un rendimiento adecuado fuera de ese conjunto.
- Riesgo de falsos negativos y falsos positivos inherente a cualquier modelo NER: en un contexto de cumplimiento normativo, conviene combinarlo con reglas deterministas (expresiones regulares para identificadores, tarjetas, IBAN) y revisión humana.
- No se han publicado métricas de evaluación, sesgos conocidos ni análisis de robustez, lo que dificulta estimar su fiabilidad en dominios específicos.
- Al ser un modelo extractivo, no genera texto ni justifica sus predicciones; la interpretabilidad depende de las probabilidades por token.
- El esquema de etiquetas no está documentado en la información disponible; es necesario consultar la model card para conocer las categorías exactas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Protegrity/protegrity-pii
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Referencia arXiv indicada en los tags: arXiv:2610.30518
- Sitio de Protegrity: no disponible en la informacion proporcionada
