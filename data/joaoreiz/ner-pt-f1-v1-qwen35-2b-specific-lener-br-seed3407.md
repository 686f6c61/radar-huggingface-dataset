# JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-lener-br-seed3407

## Resumen

El modelo `ner-pt-f1-v1-qwen35-2b-specific-lener-br-seed3407` es un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativa en portugués, desarrollado por JoaoReiz como parte de la matriz de investigación `ner-pt-generative-2026-f1-v1`. Se basa en el modelo Qwen/Qwen3.5-2B y está diseñado para generar etiquetas y tokens de entidades en formato JSON estructurado, lo que permite una integración directa en pipelines de procesamiento de lenguaje natural. El adaptador se entrenó específicamente sobre el corpus Lener_BR, un dataset de NER para portugués brasileño, y se seleccionó por su F1 end-to-end en validación.

La relevancia de este modelo radica en su enfoque generativo para NER, que difiere de los enfoques clásicos de clasificación de tokens. Al emplear un modelo base de 2B parámetros con un adaptador LoRA de solo 0.1 GB, ofrece una solución ligera y eficiente para tareas de extracción de entidades en portugués, con una validez estructural del 100 % en las predicciones. Sin embargo, se trata de un artefacto de investigación con un alcance limitado: solo se ha evaluado en un único split del corpus Lener_BR y con una sola semilla, por lo que no debe interpretarse como evidencia de rendimiento general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer Qwen/Qwen3.5-2B |
| Parametros totales | No disponible (el adaptador pesa 0.1 GB; el modelo base tiene 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-2B) |
| Tipos de cuantizacion | No disponible (entrenado en BF16, no se especifica cuantizacion de inferencia) |
| Idiomas soportados | Portugues (pt) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre el transformer Qwen/Qwen3.5-2B, en su revisión específica `15852e8c16360a2fea060d615a32b45270f8a8fc`. El entrenamiento se realizó en precisión BF16 con LoRA, sobre el dataset Lener_BR, con una semilla fija (3407) y un régimen denominado `specific`. La selección del checkpoint se basó en el F1 end-to-end sobre el split de validación, sin utilizar el split de test durante la selección. La inferencia canónica se define con vLLM, temperatura 0 y generación restringida a un esquema JSON `labels_and_tokens`; las salidas inválidas se tratan como predicción vacía en el scoring end-to-end.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas adicionales como RLHF o DPO. El repositorio incluye un manifiesto (`research/manifest.json`) con las versiones exactas de las dependencias y los hashes de los artefactos para reproducibilidad.

## Capacidades

- Reconocimiento de entidades nombradas (NER) generativo en portugues, produciendo etiquetas y tokens en formato JSON estructurado.
- Generacion de salidas con validez estructural garantizada (100 % en el split de test evaluado), gracias a la generacion restringida por esquema.
- Integracion con vLLM para inferencia a temperatura 0, lo que facilita la reproducibilidad.
- Soporte para carga mediante la libreria PEFT sobre el modelo base exacto.
- Capacidad multilingue limitada al portugues (el adaptador se entrena solo en ese idioma, aunque el modelo base puede tener otras capacidades no explotadas).
- No se reportan capacidades de tool calling, agentes ni razonamiento multi-paso especificas; el modelo esta orientado exclusivamente a NER.

## Casos de uso

- Investigacion academica en NER para portugues: permite evaluar tecnicas generativas frente a enfoques clasicos de clasificacion de tokens, con un protocolo reproducible y metricas de validez estructural.
- Extraccion de entidades en documentos legales portugueses: el modelo puede identificar organizaciones, personas, fechas y lugares en contratos o sentencias, facilitando la automatizacion de procesos de revision documental.
- Analisis de noticias y redes sociales en portugues: extraccion de entidades para sistemas de monitorizacion de medios o analisis de opinion, gracias a su capacidad de generar etiquetas en formato estructurado.
- Construccion de pipelines de enriquecimiento de datos: el adaptador puede integrarse en flujos de procesamiento de texto para poblar bases de conocimiento o grafos de entidades.
- Evaluacion de robustez de modelos generativos en NER: al estar disenado para experimentacion controlada, sirve como referencia para comparar diferentes esquemas de anotacion o estrategias de decodificacion.
- Prototipado rapido de sistemas de extraccion de informacion en portugues: su tamano reducido (0.1 GB de adaptador) permite pruebas en entornos con recursos limitados antes de escalar a modelos mayores.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en el split de test de Lener_BR, correspondientes a una unica semilla (3407):

| Dataset | Precision | Recall | F1 | Validez estructural |
|---|---:|---:|---:|---:|
| lener_br | 0.8948 | 0.9082 | 0.9015 | 1.0000 |

Estos resultados se refieren exclusivamente a los splits congelados del corpus y a esta semilla concreta. No se han publicado comparaciones con otros modelos en la informacion disponible, ni resultados en otros datasets. El autor advierte que no deben interpretarse como evidencia de rendimiento general fuera de estos corpus.

## Requisitos de hardware

- Al ser un adaptador LoRA de 0.1 GB sobre un modelo base de 2B, la VRAM estimada para inferencia en BF16 es de aproximadamente 4-6 GB, dependiendo de la longitud de contexto y del motor de inferencia.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, T4) puede ejecutar el modelo en cuantizacion ligera. Para vLLM, se recomienda una GPU con soporte BF16 (por ejemplo, A100, RTX 3090 o superior).
- No se han publicado requisitos oficiales de hardware; las estimaciones se basan en el tamaño del modelo base y el adaptador.
- Opciones de despliegue: vLLM (motor canónico de inferencia), PEFT con transformers, y potencialmente llama.cpp u Ollama si se convierte el modelo a GGUF, aunque no se documenta en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (NER generativa en portugues con LoRA sobre Qwen3.5-2B). No se pueden proporcionar comparaciones cuantitativas con alternativas como XLM-RoBERTa o BERTimbau para NER clasico, ya que no se han reportado datos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo se ha evaluado solo en el corpus Lener_BR con una unica semilla; los resultados pueden variar con otras semillas o datasets.
- Los spans generados pueden ser estructuralmente validos pero semanticamente incorrectos; la validez estructural no implica correccion semantica.
- Los esquemas de anotacion de diferentes corpus pueden diferir, lo que limita la transferencia directa a otros dominios.
- El solapamiento de texto entre splits puede afectar las estimaciones de rendimiento; el autor menciona que se proporcionan metricas decontaminadas en el repositorio, pero no se incluyen en la informacion resumida.
- No se ha validado el modelo para decisiones de alto riesgo o autonomas; su uso debe limitarse a investigacion y experimentacion controlada.
- La licencia del modelo no esta disponible, por lo que se debe revisar la licencia del dataset Lener_BR y del modelo base Qwen3.5-2B antes de cualquier uso comercial.
- El adaptador debe cargarse sobre la revision exacta del modelo base especificada; cargarlo sobre otras revisiones puede producir resultados inconsistentes.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-lener-br-seed3407
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B (no se proporciona enlace directo en la informacion, pero es el modelo base indicado)
