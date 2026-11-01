# Ashluu/us-ijepa-v3-encoder

## Resumen

us-ijepa-v3-encoder es un codificador de visión (ViT-B/16) entrenado con el paradigma I-JEPA (Image-based Joint-Embedding Predictive Architecture) sobre ecografías mamarias, desarrollado por el autor de HuggingFace Ashluu en el marco de una tesis de máster. El modelo no es un generador de texto ni un modelo de lenguaje: es un extractor de representaciones visuales que produce tokens de parche a partir de imágenes de ecografía de mama de 224 x 224 píxeles en escala de grises. Se distribuye únicamente como pesos del codificador (`encoder` state dict) junto con la configuración de entrenamiento (`cfg`), en formato float32 y con un tamaño de 343 MB.

La relevancia del modelo radica en su enfoque de aprendizaje autosupervisado aplicado a imagen médica, un dominio donde las anotaciones son escasas y costosas. I-JEPA evita la augmentación agresiva típica de otros métodos autosupervisados y predice representaciones en el espacio latente, lo que puede resultar ventajoso en imágenes médicas donde las transformaciones artificiales pueden alterar la semántica clínica. El autor reporta una sonda lineal congelada sobre el dataset BUS-BRA con AUROC de 0,814 en validación y 0,870 en test sobre fotogramas completos.

Se trata de un artefacto de investigación, no de una herramienta clínica. La model card es explícita al respecto: uso exclusivamente investigador y sin validación para diagnóstico. No hay información sobre el pipeline, los idiomas ni una licencia estándar más allá de la etiqueta `other`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer ViT-B/16 con entrenamiento I-JEPA |
| Parámetros totales | no disponible (arquitectura ViT-B, aproximadamente 86 M en el codificador estándar) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 224 x 224 píxeles) |
| Tipos de cuantización | no disponible (pesos publicados en float32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other |
| Formato de pesos | state dict del codificador (`encoder`) y `cfg` de entrenamiento; 343 MB en float32 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura I-JEPA aplicada a un ViT-B/16. I-JEPA es un método autosupervisado que enmascara regiones de la imagen y predice sus representaciones latentes a partir de las regiones visibles, en lugar de reconstruir píxeles como haría un autoencoder enmascarado. El codificador procesa imágenes de 224 x 224 píxeles en escala de grises que se replican a tres canales y se escalan al rango [0, 1]. La salida son tokens de parche con forma `[B, 196, 768]`, es decir, 196 parches de 16 x 16 píxeles con dimensión de embedding 768, coherente con un ViT-B/16 sobre una entrada de 224 x 224.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo fases de ajuste supervisado adicionales. La model card menciona únicamente que proviene de una tesis de máster sobre ecografía mamaria y que las pruebas de la tesis usan la media sobre los parches como representación global de la imagen. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal, que no aplican a este tipo de modelo.

## Capacidades

- Extracción de representaciones visuales de ecografías mamarias: genera embeddings por parche (`[B, 196, 768]`) y una representación global mediante la media de los parches.
- Aprendizaje autosupervisado: el codificador está pensado para servir como base congelada o ajustable en tareas posteriores de clasificación, segmentación o detección sobre imagen médica.
- Clasificación mediante sonda lineal: el autor valida el uso de una sonda lineal congelada sobre las representaciones extraídas, con AUROC de 0,814 en validación y 0,870 en test sobre BUS-BRA.
- Entrada en escala de grises replicada a tres canales: compatible con pipelines estándar de ViT que esperan tres canales.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No dispone de capacidades multilingües ni de modo de razonamiento explícito.

## Casos de uso

- Clasificación binaria de lesiones en ecografía mamaria: usar el codificador congelado y entrenar una sonda lineal o un clasificador ligero sobre la media de los tokens de parche, tal como reporta el autor con BUS-BRA. Adecuado por su entrenamiento autosupervisado en el mismo dominio.
- Preentrenamiento como inicialización para fine-tuning supervisado: partir de los pesos del codificador y ajustar el ViT completo sobre un dataset etiquetado de ecografía, aprovechando las representaciones aprendidas sin anotaciones.
- Extracción de features para búsqueda por similitud: generar embeddings globales de estudios y construir un índice vectorial para recuperar casos morfológicamente similares en un entorno de investigación.
- Segmentación asistida con cabeceras específicas: conectar el codificador a un decodificador de segmentación (por ejemplo, basado en los tokens de parche) para delimitar lesiones, previo fine-tuning con máscaras.
- Análisis exploratorio de datasets de ecografía: usar los embeddings para agrupar estudios, detectar duplicados o analizar la distribución del dataset antes de anotar.
- Prototipado de pipelines de imagen médica en investigación: integrar el codificador en cuadernos o scripts de experimentación como extractor de features reproducible, dado que se distribuye como state dict y configuración.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son los de la sonda lineal congelada sobre BUS-BRA con partición agrupada por paciente:

| Evaluación | Métrica | Resultado |
|---|---|---|
| BUS-BRA, validación (sonda lineal congelada) | AUROC | 0,814 |
| BUS-BRA, test (sonda lineal congelada) | AUROC | 0,870 |

No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni en benchmarks de imagen médica estándar más allá de los anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa 343 MB en float32; la inferencia en float32 requiere aproximadamente 0,4-0,6 GB de VRAM para el modelo, más memoria para activaciones y lote, dependiendo del tamaño de batch.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia por lotes pequeños; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna (GTX 1660, RTX 2060 y superiores).
- Opciones de despliegue: al ser un state dict de PyTorch, se carga con `torch.load` y se integra en código Python; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia de categoría, cabría comparar con otros codificadores ViT autosupervisados aplicados a imagen médica (por ejemplo, variantes de DINO o MAE sobre ecografía), pero no se han encontrado datos de rendimiento de alternativas en la información disponible para establecer una comparación rigurosa.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| us-ijepa-v3-encoder | no disponible (ViT-B/16) | no aplica (visión) | AUROC 0,870 en test BUS-BRA | other | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es una herramienta clínica: la model card indica explícitamente uso investigador y ausencia de validación para diagnóstico.
- Dominio muy restringido: entrenado sobre ecografía mamaria; su rendimiento fuera de ese dominio o con otras modalidades de imagen no está documentado.
- Entrada fija de 224 x 224 en escala de grises: no admite resoluciones variables ni imágenes en color real sin adaptación.
- Solo se publican los pesos del codificador y la configuración; no se incluyen cabeceras de clasificación, segmentación ni el pipeline completo de la tesis.
- Licencia `other`: no se especifican los términos exactos, por lo que el uso comercial queda sin garantías y requiere contactar con el autor.
- Riesgo de sesgo: el dataset de entrenamiento no está documentado en la información disponible, lo que impide evaluar sesgos demográficos o de adquisición.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las representaciones pueden producir clasificaciones erróneas con alta confianza en casos fuera de distribución.
- Sin métricas de calibración, sensibilidad, especificidad ni intervalos de confianza más allá del AUROC reportado.
- Creado y actualizado en 2026 según los metadatos; sin descargas ni likes, lo que sugiere ausencia de validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ashluu/us-ijepa-v3-encoder
- Repositorio del agente que lo consume: mencionado en la model card como "agent repository", sin URL disponible en la información proporcionada.
- Paper de I-JEPA: no disponible en la información proporcionada.
- Dataset BUS-BRA: no disponible en la información proporcionada.
