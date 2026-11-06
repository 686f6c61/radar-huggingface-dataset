# jack1211son/abdta-single-task-aspect-v4-0pct

## Resumen

`jack1211son/abdta-single-task-aspect-v4-0pct` es un checkpoint de clasificación de texto derivado de `microsoft/deberta-v3-large`, ajustado para el análisis de tono en divulgaciones de riesgo (aspect-based risk-disclosure tone analysis, ABDTA) de memorias anuales de empresas cotizadas en Indonesia. El modelo forma parte de una colección de variantes (con y sin aumento de datos, con distintos niveles de dropout de palabras clave de aspecto) y este checkpoint concreto corresponde a la variante final de una sola tarea con dropout de aspecto al 0 % durante el entrenamiento.

El problema que aborda es la clasificación de frases de informes corporativos según su tono (Positive, Negative, Neutral) condicionada por palabras clave de riesgo y de aspecto extraídas previamente. No es un modelo generativo ni un predictor de retornos: es un clasificador discriminativo de 435 millones de parámetros con una ventana de entrada limitada a 256 tokens.

Su relevancia es acotada: se publica como artefacto de investigación reproducible dentro de un proyecto de tesis o experimento personal (0 descargas, 0 likes, licencia no especificada), por lo que debe tratarse como un modelo de nicho, no como una herramienta lista para producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-large, atención desenredada con disentangled attention y span masking) |
| Parametros totales | 435.076.110 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (límite de entrada indicado en la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16 según configuración; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (también configuración, tokenizer y model card en el repo; tamaño del repo 1.7 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `microsoft/deberta-v3-large`, un encoder transformer con atención desenredada (disentangled attention) que separa la codificación de contenido y posición, y que fue preentrenado con span masking. Sobre esa base se ha añadido una cabeza de clasificación de secuencias (`AutoModelForSequenceClassification`) para la tarea de tono con tres etiquetas: `['Positive', 'Negative', 'Neutral']`. El modelo también define un orden de 14 etiquetas de aspecto (`Economics`, `Profit|Loss`, `Dividend`, `Financing`, `Brand`, `Technology`, `Investment`, `Governance`, `Product|Service`, `M&A`, `Legal`, `Environment`, `Social&People`, `Political`), aunque este checkpoint concreto es de "single-task aspect", es decir, orientado a la clasificación de tono condicionada por aspecto más que a la predicción conjunta de todas las etiquetas.

El entrenamiento se realizó sobre narrativas de memorias anuales de empresas cotizadas en Indonesia, con un formato de entrada específico que concatena palabras clave de riesgo y de aspecto antes de la frase: `[Risk Keywords: <risk words> Aspect Keywords: <aspect words>] <sentence>`. La variante `0pct` indica que durante el entrenamiento no se aplicó dropout a las palabras clave de aspecto (frente a la variante `25pct`). No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF/DPO (poco probable en un clasificador de este tipo). Tampoco se especifican innovaciones técnicas adicionales más allá del uso de la arquitectura DeBERTa-v3 y del esquema de condicionamiento por palabras clave.

## Capacidades

- Clasificación de tono en tres clases (`Positive`, `Negative`, `Neutral`) de frases de divulgación financiera.
- Condicionamiento por palabras clave de riesgo y de aspecto inyectadas en la entrada, lo que permite guiar la clasificación hacia el aspecto de interés.
- Definición de 14 etiquetas de aspecto financiero (aunque este checkpoint es de una sola tarea de aspecto; el resto de etiquetas se documentan para la colección).
- Procesamiento de texto en inglés exclusivamente.
- Entrada limitada a 256 tokens, adecuada para frases u oraciones cortas, no para documentos completos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".
- Compatible con `text-embeddings-inference` y `endpoints_compatible` según los tags del repo, lo que facilita su despliegue como endpoint de clasificación.

## Casos de uso

- Análisis de sentimiento financiero a nivel de frase en memorias anuales: el modelo clasifica oraciones de informes corporativos en tono positivo, negativo o neutro, lo que permite agregar métricas de tono por sección o por empresa.
- Extracción de señales de riesgo en divulgaciones: al inyectar palabras clave de riesgo en la entrada, se puede dirigir el modelo hacia frases que mencionan riesgos concretos y evaluar su tono asociado.
- Investigación académica en finanzas computacionales: sirve como baseline reproducible para experimentos de ABDTA, comparando variantes con y sin dropout de aspecto o con aumento de pseudo-etiquetas.
- Monitorización de comunicación corporativa: clasificación por lotes de comunicados o notas de prensa en inglés de empresas indonesias para detectar cambios de tono a lo largo del tiempo.
- Enriquecimiento de pipelines de NLP financiero: como componente de clasificación dentro de un pipeline mayor que primero extrae frases candidatas y luego aplica este modelo para etiquetar tono y aspecto.
- Evaluación comparativa de arquitecturas encoder en dominios financieros de baja resource: al ser un fine-tune de DeBERTa-v3-large, permite comparar su rendimiento frente a otros encoders en la misma tarea.
- Detección de lenguaje de disclosure en textos regulatorios: útil para auditar la claridad y el tono de las divulgaciones obligatorias de empresas cotizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,7 GB solo para pesos (435 M parámetros × 4 bytes), más overhead de activaciones y tokenizer; en la práctica, entre 2 y 3 GB para lotes pequeños.
- VRAM estimada en fp16: alrededor de 0,9 GB para pesos, con un total práctico de 1,5 a 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en fp16 (RTX 3050, RTX 3060, T4). Para entrenamiento o fine-tuning adicional, se recomienda A100, H100 o RTX 4090 con al menos 16-24 GB.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares, siempre que se use fp16 o cuantización.
- Opciones de despliegue: `transformers` (carga directa con `AutoModelForSequenceClassification`), `text-embeddings-inference` (según tags), y potencialmente `vLLM` no aplica (no es generativo); `llama.cpp` y `Ollama` no soportan este tipo de encoder de forma nativa sin conversión a GGUF, que no está documentada.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser un encoder de 435 M parámetros con entradas de 256 tokens, se espera una latencia de decenas de milisegundos por frase en GPU moderna, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jack1211son/abdta-single-task-aspect-v4-0pct` | 435 M | 256 tokens | Clasificación de tono financiero (ABDTA) | no disponible | Hugging Face (0 descargas) |
| `microsoft/deberta-v3-large` | 435 M | 512 tokens | Modelo base (preentrenamiento) | MIT | Hugging Face (ampliamente usado) |
| `ProsusAI/finbert` | 110 M | 512 tokens | Análisis de sentimiento financiero | Apache 2.0 | Hugging Face (muy popular) |
| `yiyanghkust/finbert-tone` | 110 M | 512 tokens | Tono financiero (3 clases) | Apache 2.0 | Hugging Face |

La comparativa es orientativa: no se dispone de resultados de benchmarks del modelo evaluado frente a estas alternativas, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. El modelo evaluado es un fine-tune específico para un dominio muy concreto (empresas indonesias, inglés) y con una licencia no especificada, lo que limita su uso comercial frente a alternativas con licencias permisivas.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor; riesgo legal en producción.
- Entrada limitada a 256 tokens: no apto para documentos completos; requiere segmentación previa en frases u oraciones.
- Solo inglés: no soporta otros idiomas, a pesar de que el dominio de aplicación son empresas indonesias (los informes anuales pueden estar en indonesio o inglés).
- Dependencia de un esquema de extracción de palabras clave de riesgo y aspecto específico del proyecto: si no se reproduce exactamente el mismo preprocesado, el rendimiento puede degradarse.
- Modelo de nicho con 0 descargas y 0 likes: no ha sido validado por la comunidad; riesgo elevado de sesgos y de sobreajuste al dataset específico.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede producir clasificaciones erróneas o sobreconfiadas en frases ambiguas o fuera de distribución.
- No predice precios de acciones ni retornos de inversión, tal como advierte la propia model card; no debe usarse como señal de trading.
- No se documentan sesgos conocidos, pero al entrenarse sobre memorias anuales de empresas indonesias, puede heredar sesgos de ese corpus (sector, tamaño de empresa, idioma).
- No se publican CSVs de evaluación a nivel de frase, lo que dificulta la reproducibilidad y la auditoría del rendimiento.
- El checkpoint es "final" y está pensado para reentrenamiento sobre training + validation; su uso directo sin reentrenar puede no ser óptimo.

## Enlaces

- Hugging Face: https://huggingface.co/jack1211son/abdta-single-task-aspect-v4-0pct
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
- No se han encontrado en la información proporcionada papers, blogs, repositorios o demos adicionales asociados al modelo.
