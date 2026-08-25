# Adorer0p/finkpi-qwen3-0.6b

## Resumen

finkpi es un adaptador LoRA sobre el modelo base Qwen/Qwen3-0.6B, desarrollado por Adorer0p, que convierte pasajes de comunicados de prensa de resultados financieros (earnings press releases) en objetos JSON con los indicadores clave (KPIs) que contienen. El adaptador se entrena con etiquetas generadas a partir de las presentaciones XBRL de los propios emisores, no con las salidas de un modelo de mayor tamaño, lo que garantiza que las anotaciones provienen de datos oficiales. En las pruebas, el modelo alcanza una micro F1 de 0,400 frente a un baseline basado en expresiones regulares de 0,356, con una precisión notablemente superior (0,590 vs 0,320) y una tasa de activación en pasajes sin KPI mucho menor (0,139 vs 0,455). Es un modelo especializado y ligero, con un repositorio de 0,1 GB, licencia MIT y orientado exclusivamente al idioma inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-0.6B (transformer denso) |
| Parámetros totales | no disponible (modelo base 0.6B + adaptador LoRA) |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el autor advierte de no fusionar en 4-bit) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base Qwen3-0.6B, un transformer denso de 0,6 mil millones de parámetros. El entrenamiento se realiza mediante LoRA (Low-Rank Adaptation), que modifica un subconjunto de pesos mediante matrices de bajo rango. El conjunto de datos de entrenamiento se deriva de las presentaciones XBRL de empresas estadounidenses, de modo que las etiquetas de los KPIs provienen de los informes oficiales y no de generaciones de otro modelo. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO. La innovación principal del adaptador reside en su capacidad para interpretar correctamente la escala de los valores (por ejemplo, que una cifra bajo un encabezado «(in millions)» se lea como millones) y para generar JSON válido en prácticamente todos los casos (schema ok 0,994).

## Capacidades

- Extracción de KPIs financieros de pasajes de comunicados de prensa y su salida en formato JSON estructurado.
- Soporte de un vocabulario de 16 métricas financieras concretas (revenue, net_income, basic_eps, etc.).
- Generación de JSON con campos correctamente nombrados y valores numéricos con la escala adecuada.
- Manejo de pasajes que no contienen ningún KPI (no emite falsos positivos en la mayoría de los casos).
- Funciona como un lector de pasajes individuales; para un registro completo de un documento se requiere ejecutar el adaptador sobre cada ventana y fusionar los resultados.
- Capacidad de razonamiento para interpretar encabezados de escala y evitar errores de magnitud (por ejemplo, no leer 12,973 como 1,297,300,000).

## Casos de uso

- **Automatización de análisis financiero**: el adaptador puede procesar automáticamente comunicados de ganancias de empresas estadounidenses y extraer KPIs clave en JSON, lo que permite alimentar paneles de control o alertas sin intervención manual.
- **Construcción de bases de datos financieras**: se puede integrar en pipelines que ingieren documentos 8-K y actualizan bases de datos de indicadores con los valores extraídos, garantizando que los datos provienen de fuentes oficiales (XBRL).
- **Verificación y auditoría de informes**: el modelo puede utilizarse para comprobar si los KPIs mencionados en un comunicado coinciden con los valores reportados en las presentaciones XBRL, detectando discrepancias o errores de escala.
- **Análisis comparativo entre empresas**: al extraer métricas de múltiples comunicados, se pueden comparar ratios como margen bruto, ingresos netos o flujo de caja entre compañías de forma consistente.
- **Enriquecimiento de modelos de lenguaje**: el JSON extraído puede servir como entrada para otros sistemas de análisis o como parte de un dataset de entrenamiento para modelos financieros específicos.
- **Procesamiento de documentos a nivel corporativo**: cuando se combina con la función de fusión `finkpi.merge`, el adaptador permite generar un registro financiero completo de un documento 8-K a partir de múltiples pasajes, con un indicador de confianza basado en la concordancia entre ventanas superpuestas.

## Benchmarks y rendimiento

La model card del autor proporciona resultados sobre un conjunto de prueba de 2890 pasajes de 31 empresas que no aparecen en entrenamiento ni validación. Se comparan el adaptador afinado con un baseline de expresiones regulares.

| Run | F1 | IC 95% | Precisión | Recall | Schema válido | Fires on empty | Slice duro |
|---|---|---|---|---|---|---|---|
| Finetuned-full | 0.400 | 0.382–0.418 | 0.590 | 0.303 | 0.994 | 0.139 | 0.367 |
| Regex-full | 0.356 | 0.343–0.370 | 0.320 | 0.400 | 1.000 | 0.455 | 0.333 |

La precisión del modelo es notablemente mayor que la del baseline, mientras que el recall es menor. La tabla per metric muestra resultados heterogéneos: por ejemplo, `total_assets` alcanza una F1 de 0.753, mientras que `basic_eps` y `rd_expense` tienen F1 0.000. El autor indica que las métricas con 0.000 no son utilizables y que `total_debt` tiene soporte casi nulo en el corpus.

## Requisitos de hardware

- El modelo base Qwen3-0.6B es un transformer de 0.6B parámetros, por lo que el adaptador requiere una cantidad mínima de VRAM. En cuantización de 4 bits, el modelo base puede ejecutarse en GPU de consumo con menos de 2 GB de VRAM.
- El adaptador LoRA es pequeño (0.1 GB en el repositorio) y se puede fusionar con el modelo base para inferencia.
- Compatible con GPU como RTX 3060, RTX 4060, GTX 1080 Ti o superiores.
- Para despliegue se recomienda usar la librería `transformers` con `PeftModel` y `AutoModelForCausalLM`. No se mencionan opciones como vLLM u Ollama, aunque al ser un adaptador LoRA, se puede integrar en esos entornos si el modelo base está soportado.
- Latencia y throughput no especificados por el autor, pero dado el tamaño reducido, se puede inferir una generación rápida incluso en CPU, aunque sin datos oficiales.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores LoRA específicos para extracción de KPIs financieros que puedan compararse directamente. Como referencia interna, se puede comparar con el modelo base sin adaptar y con el baseline regex, pero no son modelos de la misma categoría (extracción estructurada). Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El adaptador está entrenado exclusivamente con comunicados de empresas estadounidenses en inglés y presentaciones 8-K Item 2.02. Su rendimiento degrada significativamente con emisores no estadounidenses, presentaciones IFRS, tablas de segmentos o geografías, y cualquier métrica fuera del vocabulario de 16 KPIs.
- El modelo funciona a nivel de pasaje, no de documento completo. Para un registro completo es necesario ejecutar el adaptador sobre cada ventana y fusionar los resultados.
- No es consejo financiero ni una fuente de verdad financiera. El autor lo describe como una ayuda de lectura y recomienda no usarlo como base para decisiones de inversión.
- La precisión reportada puede estar subestimada: el análisis de errores sugiere que muchos casos de `metric_not_in_passage` son en realidad líneas reales que el alineador de etiquetas no capturó, por lo que la precisión real podría ser mayor.
- El modelo no debe cargarse en 4-bit y luego fusionarse con `merge_and_unload()`, ya que el error de re-cuantización afecta a los pesos modificados por el fine-tuning.
- Los valores de F1 para ciertas métricas (como `basic_eps`, `rd_expense` o `total_debt`) son 0.000, lo que indica que el adaptador no es capaz de extraer correctamente esos KPIs y no deben considerarse funcionales.
- El sistema de prompts es parte del modelo; cambiar el mensaje del sistema invalida los resultados publicados.

## Enlaces

- [Página del adaptador en Hugging Face](https://huggingface.co/Adorer0p/finkpi-qwen3-0.6b)
- [Modelo base Qwen/Qwen3-0.6B](https://huggingface.co/Qwen/Qwen3-0.6B)
- [Guía completa de Qwen3 (referencia)](https://insiderllm.com/guides/qwen3-complete-guide/)
