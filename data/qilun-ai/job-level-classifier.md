# qilun-ai/job-level-classifier

## Resumen

El job-level-classifier de qilun-ai es un modelo de clasificación de texto especializado en predecir el nivel de experiencia que solicita una oferta de empleo, con seis categorías posibles: intern, fresher, junior, mid, senior y lead. Se trata de un ajuste fino de mmBERT-base, un encoder multilingüe desarrollado por el grupo JHU CLSP, al que se le añade un pooling de media enmascarada y una cabeza lineal entrenada con pesos EMA. El modelo forma parte del proyecto Agent-Hire, una herramienta de búsqueda de empleo que utiliza este clasificador para etiquetar cada oferta y permitir filtrados por seniority.

La relevancia del modelo radica en su enfoque práctico: es multilingüe, cabe en CPU y se distribuye en dos formatos complementarios (ONNX de 4 bits de 184 MB y pesos PyTorch completos), lo que facilita tanto el despliegue en producción como el reentrenamiento. El autor reporta una precisión del 86,0% en su conjunto de test verificado manualmente, superando a alternativas de mayor tamaño como DeBERTa-v3-large, ModernBERT-large o modelos de decisión zero-shot como Gemini decision-1.

La arquitectura subyacente es un transformer encoder de tipo BERT con atención bidireccional, adaptado para clasificación de secuencias. El contexto de entrada es de 384 tokens y el modelo está pensado para ejecutarse en entornos con recursos limitados, con latencias del orden de 0,2 a 0,3 segundos por oferta en CPU de portátil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (mmBERT-base) con masked mean pooling y cabeza lineal |
| Parametros totales | no disponible (base mmBERT-base; el repo ocupa 1,5 GB con ambos formatos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 384 tokens (max_len configurado en labels.json) |
| Tipos de cuantizacion | ONNX weight-only 4-bit MatMulNBits con embeddings 4-bit Gather, block size 32; pesos PyTorch en precisión completa |
| Idiomas soportados | multilingüe (heredado de mmBERT-base) |
| Licencia | agent-hire-model-license (license: other) |
| Formato de pesos | safetensors (PyTorch) y ONNX (model_w4.onnx) |

## Arquitectura y entrenamiento

El modelo parte de mmBERT-base, un encoder transformer multilingüe de la familia BERT entrenado por el grupo JHU CLSP. Sobre él se aplica un esquema de masked mean pooling (promedio de las representaciones de los tokens no enmascarados) seguido de una cabeza lineal de clasificación con seis salidas. El ajuste fino utiliza pesos EMA (exponential moving average) para estabilizar el entrenamiento y mejorar la generalización.

La entrada no es texto libre, sino una concatenación estructurada con separador `" <eos> "` que combina el título del puesto (hasta 160 caracteres), hasta cuatro líneas de requisitos de experiencia (cada una hasta 260 caracteres, unidas por `" | "`) y un extracto de la sección de requisitos o cualificaciones (hasta 400 caracteres). Esta ingeniería de entrada, versionada como `input_version` 3 en el proyecto Agent-Hire, es una innovación destacable: obliga al modelo a centrarse en las señales de seniority explícitas (años requeridos) por encima de las palabras del título. Las reglas de etiquetado indican que los años declarados tienen precedencia sobre las palabras del título, y que los "managers" individual contributors (producto, proyecto, cuentas, ventas) se juzgan por años y no como lead. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Clasificación de ofertas de empleo en seis niveles de seniority: intern, fresher, junior, mid, senior y lead.
- Procesamiento multilingüe heredado de mmBERT-base, lo que permite clasificar ofertas en varios idiomas sin reentrenamiento específico por idioma.
- Inferencia en CPU con el modelo ONNX cuantizado a 4 bits, con latencias de 0,2 a 0,3 segundos por oferta en un portátil convencional.
- Manejo de entradas estructuradas con separadores explícitos y truncamiento controlado a 384 tokens.
- Capacidad de reentrenamiento y reexportación a partir de los pesos PyTorch en precisión completa.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido: es un clasificador de texto puro.
- No genera texto libre; su salida es una distribución de probabilidad sobre las seis clases.

## Casos de uso

- Filtrado por seniority en portales de empleo: el modelo etiqueta cada oferta con su nivel y permite a los candidatos filtrar búsquedas por experiencia, evitando que aparezcan puestos senior en búsquedas de junior y viceversa. Es adecuado por su latencia baja en CPU y su precisión del 86,0% en el conjunto de test del autor.
- Enriquecimiento de bases de datos de ofertas: en pipelines de ingesta masiva, el modelo ONNX de 184 MB puede clasificar miles de ofertas por hora en un solo núcleo de CPU, añadiendo metadatos de seniority a registros históricos.
- Sistemas de recomendación de empleo: la etiqueta de nivel alimenta un motor de matching que empareja candidatos con ofertas adecuadas a su experiencia, reduciendo el ruido en las recomendaciones.
- Analítica de mercado laboral: agregar la distribución de niveles por sector, empresa o región para informes de tendencias de contratación, usando el clasificador como capa de normalización sobre ofertas heterogéneas.
- Moderación y control de calidad de anuncios: detectar ofertas mal etiquetadas o con discrepancias entre el título y los requisitos de experiencia, marcándolas para revisión humana.
- Preprocesamiento para modelos de decisión de mayor tamaño: usar el clasificador como primera etapa barata que resuelve la mayoría de casos y deriva a un LLM solo los casos con confianza baja (por debajo de p 0,6, como hace Agent-Hire con su fallback a reglas).
- Investigación sobre sesgos de contratación: analizar si determinados sectores o empresas piden niveles de experiencia desproporcionados para el mismo tipo de puesto, usando las etiquetas del modelo como variable dependiente.

## Benchmarks y rendimiento

| Modelo | Datos de entrenamiento | Precisión gold |
|---|---|---|
| mmBERT-base (este modelo) | v0.3 | 86,0% (semillas 7/21: 84,8%/85,0%; ONNX 4-bit: 85,8%) |
| DeBERTa-v3-large (434M) | v0.3 | 85,5% (media de semillas) |
| ModernBERT-large (395M) | v0.3 | 82,7% (media de semillas) |
| LiquidAI d1-omni-600M text encoder, fine-tuned | v0.3 | 85,0%/85,3% (semillas 13/7) |
| Laya (ModernBERT-large backbone), fine-tuned | v0.3 | 84,5% |
| Laya multilingual (mmBERT-base backbone), fine-tuned | v0.3 | 84,3%/83,8% (semillas 13/7) |
| mmBERT-base | v0.2 | 84,5% |
| mmBERT-base | v0.1 | 82,5% |
| UltraBERT-380M | v0.1 | 81,2% |
| DeBERTa-v3-large | v0.1 | 80,7% |
| ModernBERT-large | v0.1 | 80,5% |

En un conjunto held-out mayor de empresas no vistas en entrenamiento, el modelo alcanza un 88,9%. Como referencia de baselines sin entrenamiento: mmBERT-base sin ajustar (sin clasificador, adivinación aleatoria) obtiene un 16,7%, y predecir siempre la clase más común (mid) obtiene un 25,1%. En comparación zero-shot con modelos de decisión, Gemini decision-1 obtiene un 70,6% y Laya un 40,1%, frente al 86,0% de este modelo. El error más común de Gemini decision-1 es clasificar puestos mid como senior; cuando su confianza es muy alta (p ≥ 0,9, aproximadamente un cuarto de las ofertas), acierta el 96,7% de las veces.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el modo ONNX CPU (184 MB de pesos 4-bit en RAM del sistema, sin GPU). En modo PyTorch de precisión completa, el encoder mmBERT-base requiere aproximadamente 1-2 GB de VRAM o RAM según el lote.
- GPU recomendadas: no son necesarias para inferencia; el modelo está diseñado para CPU. Para fine-tuning o reexportación, una GPU consumer como RTX 4090 o una A100/H100 aceleran el proceso, aunque no se especifican requisitos concretos en la información disponible.
- Cabe en cualquier GPU consumer e incluso en CPU de portátil; el autor reporta 0,2-0,3 segundos por oferta en CPU.
- Opciones de despliegue: ONNX Runtime con CPUExecutionProvider para el modelo cuantizado; PyTorch con Transformers para el modelo completo. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, y no son aplicables al tratarse de un clasificador encoder, no de un modelo generativo.
- Latencia y throughput estimados: 0,2-0,3 segundos por oferta en CPU de portátil con el modelo ONNX; el throughput exacto en servidor no está disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión gold (v0.3) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| job-level-classifier (este modelo) | no disponible (mmBERT-base) | 384 tokens | 86,0% | agent-hire-model-license | Hugging Face (ONNX + PyTorch) |
| DeBERTa-v3-large fine-tuned | 434M | no disponible | 85,5% | no disponible | no disponible |
| ModernBERT-large fine-tuned | 395M | no disponible | 82,7% | no disponible | no disponible |
| LiquidAI d1-omni-600M fine-tuned | 600M | no disponible | 85,0-85,3% | no disponible | Hugging Face |
| Laya (ModernBERT-large backbone) fine-tuned | 395M | no disponible | 84,5% | no disponible | Hugging Face |
| Gemini decision-1 (zero-shot) | no publicado | no disponible | 70,6% | propietaria (API) | Google API |

El autor señala que DeBERTa-v3-large iguala a este modelo en media, pero se mantuvo mmBERT-base por ser multilingüe, aproximadamente un 30% más pequeño y con exportación limpia a ONNX 4-bit. Frente a los modelos zero-shot, la diferencia es sustancial (86,0% frente a 70,6% de Gemini decision-1), lo que justifica el ajuste fino específico para la tarea.

## Limitaciones y advertencias

- El conjunto de test verificado manualmente es pequeño, con variaciones de ±1,5 puntos entre semillas; las comparaciones deben hacerse sobre medias, no sobre ejecuciones individuales.
- Riesgo de error en ofertas con títulos ambiguos o requisitos de experiencia implícitos que no aparecen en las primeras líneas del texto de entrada.
- La ventana de contexto es de solo 384 tokens; ofertas con secciones de requisitos muy largas pueden truncarse y perder señales relevantes.
- El modelo es un clasificador de seis clases y no genera explicaciones; los casos con confianza baja deben tratarse con fallback a reglas, como hace Agent-Hire con el umbral p 0,6.
- La licencia agent-hire-model-license es de tipo "other" y no está estandarizada; es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial.
- El modelo hereda los sesgos de mmBERT-base y de los datos de ofertas de empleo utilizados en el ajuste fino; no se documentan evaluaciones de sesgo por género, origen o sector.
- No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación empleadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación externa de la comunidad sobre los resultados reportados.
- La fecha de creación indicada (2026-11-22) es futura respecto a la fecha habitual de consulta; conviene verificar la vigencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qilun-ai/job-level-classifier
- Modelo base mmBERT-base: https://huggingface.co/jhu-clsp/mmBERT-base
- Proyecto Agent-Hire (GitHub): https://github.com/noobed-max/GalaxyHire
- LiquidAI d1-omni-600M: https://huggingface.co/LiquidAI/d1-omni-600M
- Laya (convaiinnovations): https://huggingface.co/convaiinnovations/laya
