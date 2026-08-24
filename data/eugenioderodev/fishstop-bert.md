# eugenioderodev/fishstop-bert

## Resumen

FishSTOP BERT es un clasificador binario de contenido de correo electrónico diseñado para distinguir entre mensajes legítimos y maliciosos (phishing, estafa o spam). Lo desarrolla eugenioderodev como componente de la herramienta FishSTOP, un proyecto de código abierto orientado a equipos SOC para el análisis y triage de correos sospechosos en formato .eml. El modelo se basa en `distilbert-base-multilingual-cased`, tiene 135 millones de parámetros y está pensado para integrarse como una señal más dentro de un pipeline de seguridad que combina análisis de cabeceras (SPF/DKIM/DMARC), inspección de adjuntos y clasificación de contenido.

El modelo procesa el asunto y el cuerpo del correo normalizado y devuelve una etiqueta binaria (0=LEGITIMATE, 1=MALICIOUS) junto con una probabilidad calibrada mediante temperature scaling. Para correos largos, utiliza hasta 8 ventanas de 512 tokens con solapamiento y stride de 128, agregando el resultado con la mayor margen de maliciosidad. Su relevancia actual reside en la creciente necesidad de herramientas ligeras y multilingües para la detección de phishing, que puedan ejecutarse en hardware modesto dentro de entornos de seguridad perimetral.

El propio autor advierte que el modelo no debe usarse como veredicto independiente, ya que no inspecciona SPF, DKIM, DMARC, reputación del remitente, enlaces ni adjuntos. En las pruebas de validación reporta un F1 de 0.9811, con una precisión de 0.9852 y recall de 0.9770, aunque recomienda re-evaluar el rendimiento en conjuntos de correos recientes, externos y multilingües.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DistilBERT (encoder-only transformer) |
| Parámetros totales | 135.326.210 |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | 512 tokens por ventana; hasta 8 ventanas solapadas (stride 128) |
| Tipos de cuantización | no disponible (pesos F32 en safetensors) |
| Idiomas soportados | Multilingüe (base: distilbert-base-multilingual-cased) |
| Licencia | no disponible |
| Formato de pesos | safetensors (F32) |

## Arquitectura y entrenamiento

FishSTOP BERT se basa en la arquitectura DistilBERT, una versión destilada del modelo BERT que reduce el tamaño de parámetros manteniendo gran parte de la capacidad de representación del transformer original. El modelo fue fine-tuneado para la clasificación binaria de contenido de correo electrónico, utilizando como entrada el asunto y el cuerpo normalizado del mensaje. La normalización previa es responsabilidad del pipeline FishSTOP, que también se encarga de extraer el contenido relevante del correo.

El autor no especifica el volumen de tokens ni la composición del dataset de entrenamiento en la model card. Sí indica que el modelo fue calibrado mediante temperature scaling sobre el conjunto de validación, lo que permite interpretar la probabilidad de salida como una medida de confianza. Para correos largos, se aplica una estrategia de ventanas solapadas: hasta 8 ventanas de 512 tokens con stride de 128, agregando los resultados mediante la máxima margen de maliciosidad. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un entrenamiento supervisado clásico sobre la tarea de clasificación de phishing.

## Capacidades

- Clasificación binaria de contenido de correo electrónico (legítimo vs. malicioso)
- Procesamiento de correos largos mediante ventanas solapadas de 512 tokens (hasta 8 ventanas)
- Calibración de probabilidades mediante temperature scaling para interpretación de confianza
- Soporte multilingüe gracias a la base distilbert-base-multilingual-cased
- Integración como señal dentro del pipeline FishSTOP (no como veredicto independiente)
- No soporta tool calling, agentes, visión ni audio

## Casos de uso

- **Triage de correos en un SOC**: el modelo se integra en el pipeline de FishSTOP para clasificar el contenido de correos sospechosos en formato .eml, combinando su veredicto con el análisis de cabeceras SPF/DKIM/DMARC y la inspección de adjuntos por magic bytes.
- **Filtrado de phishing multilingüe**: al estar basado en un modelo multilingüe, puede clasificar correos en diversos idiomas sin necesidad de modelos separados, lo que lo hace útil para organizaciones con operaciones internacionales.
- **Priorización de correos en gateways**: puede desplegarse como un clasificador ligero que asigna una probabilidad de maliciosidad a cada correo entrante, permitiendo priorizar la revisión manual o automatizada de los mensajes más sospechosos.
- **Investigación de incidentes**: los analistas pueden usarlo para evaluar rápidamente el contenido de correos reportados como phishing, obteniendo una probabilidad calibrada que sirva como evidencia inicial.
- **Base para fine-tuning específico**: su tamaño reducido (135M parámetros) lo hace adecuado como punto de partida para fine-tuning en sectores verticales o dominios lingüísticos concretos con conjuntos de datos propios.
- **Despliegue en entornos con hardware limitado**: cabe en CPUs modernas o GPUs de consumo, lo que facilita su integración en entornos de seguridad perimetral o en equipos de análisis forense sin infraestructura de GPU dedicada.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en el conjunto de validación:

| Métrica | Valor |
|---|---|
| F1 | 0.9811 |
| Precisión | 0.9852 |
| Recall | 0.9770 |
| Selective coverage | 1.0000 |

No se han publicado resultados de benchmarks comparativos con otros modelos de detección de phishing en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene 135 millones de parámetros en FP32 (~541 MB). En FP16, el peso ocuparía aproximadamente 270 MB, lo que permite su ejecución en GPUs con 4 GB de VRAM o menos.
- **GPUs recomendadas**: cualquier GPU de consumo moderna (RTX 3060 o superior) es suficiente para la inferencia. También puede ejecutarse en CPU con bibliotecas como transformers u ONNX Runtime.
- **Despliegue**: al ser un modelo transformers con pesos safetensors, es compatible con la biblioteca transformers de Hugging Face y puede servirse mediante text-embeddings-inference o TGI. No se menciona compatibilidad con vLLM ni llama.cpp en la documentación.
- **Latencia y throughput**: no se han publicado cifras oficiales. Para un modelo de este tamaño, se espera una inferencia de decenas de miles de muestras por segundo en una GPU moderna, pero no se dispone de datos concretos.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros clasificadores de phishing. Como referencia, el modelo base `distilbert-base-multilingual-cased` (135M parámetros) es la alternativa natural para fine-tuning desde cero; FishSTOP BERT ya está fine-tuneado para la tarea específica. Otros clasificadores de phishing en Hugging Face pueden existir, pero no se dispone de información suficiente para una comparación rigurosa en esta ficha.

## Limitaciones y advertencias

- **No es un veredicto independiente**: el modelo solo analiza el contenido del correo (asunto y cuerpo); no inspecciona SPF, DKIM, DMARC, reputación del remitente, enlaces ni adjuntos.
- **Riesgo de sesgo y alucinación**: al ser un clasificador de texto, no hay riesgo de alucinación generativa, pero la probabilidad de salida puede ser poco fiable si el contexto de entrada difiere significativamente de la distribución de validación.
- **Dependencia de la distribución de validación**: la probabilidad reportada solo es significativa para datos suficientemente similares al conjunto de validación. El autor recomienda re-evaluar el rendimiento en conjuntos de correos recientes, externos y multilingües.
- **Licencia**: no se especifica la licencia en la model card, lo que puede limitar su uso comercial sin autorización explícita del autor.
- **Sesgos lingüísticos**: al ser una base multilingüe, puede presentar sesgos asociados a los idiomas dominantes en el dataset original de distilbert-base-multilingual-cased.
- **Obsolescencia temporal**: el modelo fue creado en mayo de 2026 y actualizado en agosto de 2026; las tácticas de phishing evolucionan rápidamente, por lo que el rendimiento puede degradarse con el tiempo si no se re-entrena con datos recientes.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/eugenioderodev/fishstop-bert)
- [Repositorio FishSTOP en GitHub](https://github.com/EugenioDeRosa/FishSTOP)
- [Modelo base: distilbert-base-multilingual-cased](https://huggingface.co/distilbert/distilbert-base-multilingual-cased)
- [Modelo relacionado: eugenioderodev/FISHBERT](https://huggingface.co/eugenioderodev/FISHBERT)
