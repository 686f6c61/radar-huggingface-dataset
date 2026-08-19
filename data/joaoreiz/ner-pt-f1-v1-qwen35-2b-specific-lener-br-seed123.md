# JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-lener-br-seed123

## Resumen

El modelo `JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-lener-br-seed123` es un adaptador LoRA para reconocimiento de entidades nombradas (NER) generativo en portugués, desarrollado por JoaoReiz. Se basa en el modelo Qwen/Qwen3.5-2B (revisión específica `15852e8c16360a2fea060d615a32b45270f8a8fc`) y ha sido entrenado específicamente sobre el dataset LeNER-Br, un corpus de NER para portugués brasileño. El adaptador emplea generación estructurada con JSON restringido para producir etiquetas y tokens, alcanzando un F1 de 0,9005 en la partición de test de LeNER-Br.

Este artefacto forma parte de una matriz de investigación más amplia (`ner-pt-generative-2026-f1-v1`) que estudia el rendimiento de NER generativo en portugués bajo diferentes regímenes y semillas. Su relevancia radica en ofrecer una alternativa a los enfoques clásicos de clasificación de tokens, aprovechando la capacidad de generación de los modelos de lenguaje para producir anotaciones estructuradas. El repositorio incluye no solo el adaptador, sino también artefactos de reproducibilidad como predicciones congeladas, métricas decontaminadas y manifiestos de ejecución.

Al ser un adaptador LoRA, el modelo no es autónomo: requiere cargar el modelo base Qwen3.5-2B y aplicar el adaptador mediante PEFT. Está pensado para investigación y experimentación controlada en NER para portugués, no para despliegue directo en producción sin evaluación previa en el dominio objetivo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3.5-2B (transformer decoder) |
| Parametros totales | No disponible (adaptador LoRA; modelo base: 2B) |
| Parametros activos | No disponible (adaptador LoRA; no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No especificado (entrenamiento en BF16; inferencia con vLLM) |
| Idiomas soportados | Portugues (pt), especificamente portugues brasileño (dataset LeNER-Br) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen/Qwen3.5-2B, un transformer decoder de 2.000 millones de parámetros. El entrenamiento se realizó en precisión BF16 con LoRA, lo que reduce significativamente los requisitos de memoria y cómputo frente a un ajuste fino completo. La configuración específica del adaptador (rango, alpha, capas objetivo) no se detalla en la información disponible.

El régimen de entrenamiento se denomina `specific`, lo que sugiere que el modelo se ajustó específicamente al dataset LeNER-Br sin mezclar otros corpus. La selección de checkpoint se realizó mediante validación end-to-end F1 sobre la partición de validación, evitando el uso del test para la selección. La inferencia canónica emplea vLLM con temperatura 0 y generación estructurada JSON restringida al formato `labels_and_tokens`. La política para salidas inválidas es tratarlas como predicción vacía en la puntuación end-to-end.

El dataset LeNER-Br es un corpus de NER en portugués brasileño con anotaciones para personas, organizaciones, lugares y tiempo. No se proporcionan detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Reconocimiento de entidades nombradas generativo: produce etiquetas y tokens en formato JSON estructurado, en lugar de clasificación token a token.
- Generación estructurada con restricciones: utiliza JSON restringido (`labels_and_tokens`) para garantizar la validez sintáctica de las salidas.
- Soporte de inferencia con vLLM: optimizado para servir con vLLM a temperatura 0, lo que permite integración en pipelines de producción con alto throughput.
- Multilingüe limitado: entrenado exclusivamente en portugués (brasileño), sin capacidades multilingües adicionales.
- No incluye tool calling, razonamiento multi-paso ni modo de pensamiento explícito; es un adaptador especializado en NER.

## Casos de uso

- Extracción de entidades en documentos legales brasileños: LeNER-Br proviene de textos jurídicos; el modelo puede usarse para extraer personas, organizaciones, lugares y fechas en contratos, sentencias y dictámenes.
- Enriquecimiento de bases de datos de conocimiento: dado un corpus en portugués, el modelo puede identificar entidades para poblar grafos de conocimiento o sistemas de búsqueda semántica.
- Anonimización de datos personales: al detectar entidades como personas y lugares, puede asistir en la desidentificación de documentos antes de su publicación.
- Procesamiento de noticias y artículos periodísticos: extracción de entidades para sistemas de recomendación, clustering temático o generación de metadatos automáticos.
- Investigación académica en NER para portugués: sirve como punto de referencia para comparar enfoques generativos frente a clasificadores clásicos, gracias a los artefactos de reproducibilidad incluidos.
- Sistemas de atención al cliente en portugués: identificación de entidades en conversaciones o tickets para enrutamiento automático o extracción de información relevante (nombres, empresas, ubicaciones).

## Benchmarks y rendimiento

Según la model card, los resultados sobre la partición de test de LeNER-Br son los siguientes:

| Dataset | Precision | Recall | F1 | Validez estructural |
|---|---:|---:|---:|---:|
| lener_br | 0,9119 | 0,8893 | 0,9005 | 0,9986 |

Estos resultados corresponden a una única semilla (seed 123) y a particiones congeladas. La model card advierte explícitamente que no deben interpretarse como evidencia de rendimiento general fuera de estos corpus. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Al ser un adaptador LoRA, el hardware requerido es el del modelo base Qwen/Qwen3.5-2B más el adaptador. El modelo base de 2B parámetros puede ejecutarse en GPUs consumer con al menos 6 GB de VRAM en cuantización 4-bit, o 8-10 GB en BF16.
- La inferencia canónica se realiza con vLLM, que requiere una GPU compatible con CUDA y suficiente memoria para el modelo base (estimación: 4-6 GB para 2B en cuantización 4-bit, 8-10 GB en BF16).
- El adaptador en sí ocupa 0.1 GB en el repositorio, por lo que el coste adicional de memoria es mínimo.
- Se recomienda una GPU como RTX 3060/4060 (12 GB) o superior para inferencia cómoda en BF16. Para entrenamiento, se necesita hardware BF16-capable (por ejemplo, A100, RTX 3090/4090).
- Opciones de despliegue: vLLM (mencionado explícitamente), también compatible con Hugging Face Transformers + PEFT, y potencialmente con llama.cpp si se convierte el modelo a GGUF (no documentado).
- Latencia y throughput: no disponibles, pero al ser un modelo de 2B con vLLM se espera una latencia baja (del orden de decenas de milisegundos por petición en GPUs modernas).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El adaptador se presenta como una ejecución específica de una matriz de investigación, sin comparaciones publicadas con alternativas como otros adaptadores NER para portugués (por ejemplo, BERTimbau-based, XLM-R-based) o modelos generativos similares. Se recomienda consultar la carpeta `research/` del repositorio para posibles análisis comparativos.

## Limitaciones y advertencias

- Sesgos y errores semánticos: los spans generados pueden ser estructuralmente válidos pero semánticamente incorrectos, como advierte la model card.
- Dependencia del esquema de anotación: los esquemas de anotación difieren entre corpus, y el modelo solo ha sido validado en LeNER-Br, por lo que su transferencia a otros dominios o esquemas es incierta.
- Solapamiento de texto: la model card menciona que el solapamiento de texto puede afectar las estimaciones de rendimiento, lo que sugiere posible contaminación entre particiones o datasets.
- Sin validación para decisiones de alto riesgo: no está validado para uso autónomo en entornos críticos (médicos, legales, financieros) sin supervisión humana.
- Licencia no disponible: no se especifica la licencia del adaptador ni del dataset subyacente, lo que limita su uso comercial sin verificación legal.
- Resultados de una sola semilla: el rendimiento reportado corresponde a una única semilla; la incertidumbre entre semillas requiere completar la matriz de tres semillas.
- Idioma limitado: solo portugués brasileño, sin soporte para otras variantes del portugués ni otros idiomas.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/JoaoReiz/ner-pt-f1-v1-qwen35-2b-specific-lener-br-seed123)
- [Modelo base Qwen/Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B) (referenciado en la model card)
- Dataset LeNER-Br: no se proporciona enlace directo, pero es un dataset público de NER en portugués brasileño.
