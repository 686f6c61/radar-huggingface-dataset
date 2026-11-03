# jack1211son/abdta-multi-task-v4-0pct-4x-train-dist

## Resumen

ABDTA multi-task v4 (0pct, 4x, train-dist) es un modelo de clasificación de texto en inglés desarrollado por el usuario jack1211son, afinado a partir de `microsoft/deberta-v3-large` (434 millones de parámetros). Resuelve una tarea doble: clasificación de tono (positivo, negativo, neutro) y clasificación multietiqueta de aspectos en narrativas de informes anuales de empresas cotizadas indonesias, en el marco del proyecto ABDTA (aspect-based risk-disclosure tone analysis).

El modelo es un fine-tuning con arquitectura multi-cabeza sobre DeBERTa-v3-large, con código de arquitectura personalizado (`trust_remote_code=True`) y un formato de entrada específico que antepone palabras clave de riesgo y de aspecto a la frase analizada. La variante concreta combina dropout de palabras clave de aspecto del 0 % en entrenamiento, aumento de pseudoetiquetas 4x y una distribución de aspectos que sigue la distribución del conjunto de entrenamiento.

Es relevante por su nicho: el análisis de tono en disclosures financieros con granularidad de aspecto (economía, beneficio/pérdida, dividendo, financiación, gobernanza, medio ambiente, etc.) es una tarea poco cubierta por modelos generalistas. No obstante, el checkpoint tiene cero descargas y cero likes, no declara licencia y su model card es mínima, por lo que debe tratarse como un artefacto de investigación más que como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-large) con cabezas multi-tarea personalizadas (tono + aspectos) |
| Parametros totales | 434.031.635 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (límite de entrada indicado en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en fp32/fp16 según repo) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 1,7 GB, incluye tokenizer y código custom) |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/deberta-v3-large`, un encoder transformer con atención desacoplada y embeddings de posición relativos, y añade dos cabezas de clasificación: una de tono con tres clases (`Positive`, `Negative`, `Neutral`) y otra de aspecto con catorce clases (`Economics`, `Profit|Loss`, `Dividend`, `Financing`, `Brand`, `Technology`, `Investment`, `Governance`, `Product|Service`, `M&A`, `Legal`, `Environment`, `Social&People`, `Political`). La arquitectura exacta de las cabezas y la función de pérdida combinada no se detallan en la model card; el código está empaquetado en el repositorio y requiere `trust_remote_code=True`.

El entrenamiento se realizó sobre narrativas de informes anuales de empresas cotizadas indonesias, con un preprocesado que inserta palabras clave de riesgo y de aspecto en la entrada con el formato `[Risk Keywords: <...> Aspect Keywords: <...>] <frase>`. La variante `0pct` indica ausencia de dropout de palabras clave de aspecto durante el entrenamiento; `4x` indica aumento de pseudoetiquetas por un factor de cuatro; `train-dist` indica que la mezcla de aspectos sigue la distribución del conjunto de entrenamiento en lugar de estar equilibrada. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en clasificación). El checkpoint corresponde al modelo final de la colección, reentrenado sobre entrenamiento más validación.

## Capacidades

- Clasificación de tono en tres clases (positivo, negativo, neutro) sobre frases de narrativas financieras.
- Clasificación multietiqueta de catorce aspectos de disclosure financiero por frase.
- Procesamiento de entradas con palabras clave de riesgo y aspecto inyectadas como contexto explícito.
- Extracción de características (`feature-extraction`) al usar el modelo sin las cabezas, según los tags del repositorio.
- Funcionamiento en inglés exclusivamente.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No genera texto: es un modelo discriminativo de clasificación.

## Casos de uso

- Análisis de tono en informes anuales: procesar frase a frase las narrativas de empresas cotizadas indonesias para etiquetar el tono (positivo, negativo, neutro) y agregar métricas por sección o por compañía, aprovechando el formato de entrada con palabras clave de riesgo.
- Monitorización de disclosures regulatorios: clasificar comunicados y secciones de riesgo por aspecto (gobernanza, legal, medio ambiente) para detectar cambios de énfasis entre ejercicios fiscales.
- Señalización de riesgo financiero: usar la etiqueta de tono junto con los aspectos `Profit|Loss`, `Financing` y `Dividend` para construir indicadores de alerta temprana en carteras de renta variable indonesia.
- Investigación académica en finanzas: generar variables dependientes de tono y aspecto para estudios de eventos, análisis de sentimiento sectorial o comparativas entre emisores.
- Enriquecimiento de bases de datos documentales: etiquetar automáticamente corpus de informes anuales para facilitar búsqueda facetada por aspecto y tono en herramientas internas de análisis.
- Preprocesado para pipelines de NLP financiero: como etapa de clasificación previa a modelos generativos o de resumen, filtrando frases por aspecto relevante antes de un análisis más costoso.
- Auditoría de comunicación corporativa: comparar la distribución de aspectos y tono entre borradores de informes para detectar desequilibrios en la narrativa de sostenibilidad o gobernanza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (accuracy, F1 por clase, etc.) ni comparaciones con otros modelos, y los CSV de evaluación a nivel de frase no se publican como assets del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,7 GB de pesos más activaciones; en la práctica, entre 2 y 3 GB para lotes pequeños con secuencias de 256 tokens.
- VRAM estimada en fp16: alrededor de 0,9 GB de pesos; entre 1,5 y 2 GB con activaciones para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4). Para lotes grandes o throughput alto, A10G, L4, A100 o H100.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4070 y superiores, e incluso en GPUs integradas con cuantización a 8 bits mediante bitsandbytes.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada. Al ser un encoder de clasificación, es compatible con ONNX Runtime y con `optimum`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño (434 M de parámetros) y la longitud de secuencia (256 tokens), se espera un throughput alto en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jack1211son/abdta-multi-task-v4-0pct-4x-train-dist | 434 M | 256 tokens | Tono + aspectos financieros (multitarea) | no disponible | HuggingFace, 0 descargas |
| microsoft/deberta-v3-large | 435 M | 512 tokens | Clasificación general (fine-tuning) | MIT | HuggingFace, ampliamente usado |
| FinBERT (ProsusAI/finbert) | 110 M | 512 tokens | Sentimiento financiero (3 clases) | Apache 2.0 | HuggingFace, muy usado |
| DeBERTa-v3-base | 86 M | 512 tokens | Clasificación general | MIT | HuggingFace |

La comparativa se limita a la arquitectura base y a alternativas de sentimiento financiero; no hay datos de rendimiento del modelo ABDTA que permitan una comparación cuantitativa. FinBERT cubre solo tono, sin granularidad de aspecto, y está entrenado en inglés financiero general, no en informes anuales indonesios.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue en producción.
- Modelo de nicho con cero descargas y cero likes: sin validación externa ni evidencia de robustez fuera del corpus de entrenamiento.
- Entrada limitada a 256 tokens: frases o secciones más largas deben truncarse o dividirse, lo que puede perder contexto relevante.
- Dependencia de un preprocesado específico (extracción de palabras clave de riesgo y aspecto con los cuadernos del proyecto): sin ese paso, el rendimiento puede degradarse de forma significativa.
- Entrenado exclusivamente en inglés sobre informes anuales de empresas indonesias: el dominio y la distribución lingüística están acotados; no se garantiza generalización a otros países, sectores o idiomas.
- Riesgo de sesgo de dominio y de etiquetado: las pseudoetiquetas del aumento 4x pueden introducir ruido y amplificar errores sistemáticos del etiquetador original.
- No predice precios de acciones ni rentabilidades: la propia model card lo indica; su uso como señal de inversión directa es inadecuado.
- Requiere `trust_remote_code=True`: implica ejecutar código del autor, con el riesgo de seguridad asociado; conviene auditar el código antes de usarlo en entornos sensibles.
- No se publican métricas de evaluación ni los CSV de test, lo que impide verificar la calidad del checkpoint de forma independiente.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas en frases ambiguas o con ironía, habituales en narrativas corporativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jack1211son/abdta-multi-task-v4-0pct-4x-train-dist
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
- Paper de DeBERTa-v3: https://arxiv.org/abs/2111.09543
- Repositorio de DeBERTa: https://github.com/microsoft/DeBERTa
