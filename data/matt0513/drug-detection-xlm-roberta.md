# matt0513/drug-detection-xlm-roberta

## Resumen

El modelo `matt0513/drug-detection-xlm-roberta` es un clasificador de secuencias binario obtenido por fine-tuning de `xlm-roberta-base` para detectar contenido relacionado con drogas (jerga, menciones, discusión) en texto web en chino e inglés. Desarrollado por el usuario matt0513, forma parte del módulo NLP de un sistema multimodal de detección de contenido de drogas (proyecto 114TKU_project_Drug-detection). El modelo asigna una etiqueta binaria: `LABEL_0` (seguro) y `LABEL_1` (relacionado con drogas).

La relevancia de este modelo radica en su capacidad para identificar lenguaje informal y jerga específica de drogas en dos idiomas de alta difusión, lo que lo hace útil para tareas de moderación de contenido y monitoreo en plataformas digitales. Al basarse en XLM-RoBERTa, hereda una arquitectura transformer encoder multilingüe entrenada en 100 idiomas, aunque el fine-tuning se limita a chino e inglés. El modelo tiene 278 millones de parámetros y una longitud de contexto de 512 tokens (la nativa de su base). Se distribuye bajo licencia MIT y los pesos están en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) |
| Parametros totales | 278.045.186 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (solo safetensors de precisión completa) |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `xlm-roberta-base` es un transformer encoder multilingüe entrenado con masked language modeling sobre 2,5 TB de datos CommonCrawl filtrados en 100 idiomas. El fine-tuning realizado para este modelo convierte la salida del encoder en una cabeza de clasificación binaria (dos logits). No se han publicado detalles sobre el dataset de entrenamiento específico, el número de épocas, ni el proceso de ajuste (por ejemplo, si se usó alguna técnica de regularización o aumentación de datos). El modelo se presenta como parte de un sistema multimodal, lo que sugiere que el texto es una de las modalidades de entrada.

## Capacidades

- Clasificación binaria de texto: distingue entre contenido seguro y contenido relacionado con drogas.
- Detección de jerga y lenguaje informal en chino e inglés.
- Inferencia mediante la API de Transformers con `AutoModelForSequenceClassification`.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No incluye capacidades multimodales propias; el texto es la única entrada del módulo.

## Casos de uso

- Moderación de contenido en redes sociales: el modelo puede clasificar publicaciones, comentarios o mensajes privados para identificar menciones a drogas y activar revisiones manuales o bloqueos automáticos.
- Monitoreo de foros y comunidades online: permite detectar discusiones sobre sustancias ilegales en foros de habla china e inglesa, ayudando a plataformas a cumplir normativas legales.
- Filtrado de anuncios ilícitos: clasifica anuncios sospechosos en marketplaces o secciones de clasificados que promocionen productos relacionados con drogas.
- Análisis de tendencias en salud pública: investigaciones epidemiológicas pueden usar el modelo para medir la prevalencia de conversaciones sobre drogas en corpus de texto público.
- Automatización de alertas tempranas: integrado en un sistema de vigilancia, puede generar alertas cuando se detectan patrones de lenguaje asociados a nuevas sustancias o jergas emergentes.
- Componente de un sistema multimodal: junto con análisis de imágenes u otras modalidades, contribuye a la detección integral de contenido de drogas en entornos web.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas de precisión, recall, F1 ni comparativas con otros modelos en la model card ni en fuentes externas encontradas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 278M de parámetros, por lo que en FP32 requiere aproximadamente 1,1 GB de memoria para los pesos. Con batch pequeño y secuencias de hasta 512 tokens, cabe en GPUs con 4 GB de VRAM.
- GPUs recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 3060). Para inferencia en producción, una T4 (16 GB) es más que suficiente.
- Despliegue: compatible con `transformers` (PyTorch), ONNX Runtime, y servidores de inferencia como Hugging Face Inference Endpoints. También puede exportarse a TorchScript.
- Latencia estimada: en una GPU moderna (RTX 3060 o superior), la inferencia para una secuencia de 256 tokens debería completarse en menos de 20 ms. En CPU, la latencia puede ser de 50-100 ms por secuencia.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de detección de contenido de drogas. Como referencia, se puede comparar con el modelo base `xlm-roberta-base` sin fine-tuning, que no tiene capacidad de clasificación específica, y con otros clasificadores de texto multilingües como `bert-base-multilingual-cased`, aunque no hay datos de rendimiento relativos. La comparativa directa no está disponible.

## Limitaciones y advertencias

- El modelo solo cubre chino e inglés; no detecta jerga de drogas en otros idiomas.
- La longitud de contexto está limitada a 512 tokens, por lo que textos largos deben truncarse, lo que puede perder información relevante.
- No se han publicado métricas de rendimiento, por lo que su precisión, recall y tasa de falsos positivos son desconocidas.
- Al ser un fine-tuning sobre un modelo multilingüe, puede presentar sesgos derivados de los datos de entrenamiento originales de XLM-RoBERTa (por ejemplo, sesgos de género o culturales).
- Riesgo de alucinación o clasificación errónea en contextos ambiguos (por ejemplo, discusiones académicas sobre drogas pueden clasificarse como contenido relacionado).
- La licencia MIT permite uso comercial, pero el usuario debe verificar que el uso cumpla con las leyes locales sobre contenido relacionado con drogas.
- No se especifica la composición del dataset de fine-tuning, lo que dificulta evaluar su robustez ante jerga emergente o variaciones dialectales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matt0513/drug-detection-xlm-roberta
- Documentación de XLM-RoBERTa en Transformers: https://huggingface.co/docs/transformers/model_doc/xlm-roberta
- Proyecto 114TKU_project_Drug-detection (referencia en la model card): https://github.com
