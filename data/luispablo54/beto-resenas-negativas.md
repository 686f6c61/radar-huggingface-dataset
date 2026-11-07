# LuisPablo54/beto-resenas-negativas

## Resumen

BETO ajustado para detectar reseñas negativas es un modelo de clasificación de texto binaria en español, desarrollado por LuisPablo54 como parte del examen del Parcial II de la asignatura IN1042 Aprendizaje Automático III (Universidad Iberoamericana), en el contexto de un caso de estudio ficticio denominado «Compra Fácil Bajío». El modelo parte de `dccuchile/bert-base-spanish-wwm-cased` (BETO), el checkpoint BERT preentrenado en español de mayor adopción en la comunidad hispanohablante, y se ha ajustado de forma completa para distinguir entre reseñas negativas (1-2 estrellas) y positivas (4-5 estrellas).

El problema que resuelve es concreto: priorizar la atención al cliente en plataformas de comercio electrónico, enrutando automáticamente las reseñas negativas hacia equipos de soporte. Con 109,8 millones de parámetros, es un modelo ligero, desplegable en hardware modesto y con latencia baja, lo que lo hace apto para clasificación en línea dentro de pipelines de atención al cliente.

Es relevante como ejemplo de ajuste fino de un encoder BERT en español sobre un dataset real (Amazon Multilingual Reviews), con métricas de evaluación reportadas sobre un conjunto de prueba de 4.000 reseñas. No obstante, se trata de un modelo académico, con cero descargas y sin validación externa, por lo que su uso en producción debe considerarse experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, variante BETO con whole word masking) |
| Parámetros totales | 109.852.418 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de BERT base; no se especifica en la model card, se asume el máximo estándar del checkpoint base) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización dinámica vía PyTorch y con conversión a GGUF/ONNX, aunque no se documenta) |
| Idiomas soportados | español (es) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT base de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, correspondiente al checkpoint `dccuchile/bert-base-spanish-wwm-cased`. Este checkpoint fue preentrenado por el equipo de dccuchile sobre un corpus español extenso con la técnica de whole word masking y vocabulario case-sensitive. Sobre esta base, LuisPablo54 realizó un ajuste fino completo (no LoRA ni adaptadores) para una tarea de clasificación binaria de secuencias, añadiendo una cabeza de clasificación sobre el token `[CLS]`.

Los datos de entrenamiento proceden del dataset Amazon Multilingual Reviews en español (Keung et al., 2020), con 60.000 reseñas balanceadas y excluyendo las valoraciones de 3 estrellas para evitar ambigüedad en la frontera de decisión. Las etiquetas son `1` para reseñas negativas (1-2 estrellas) y `0` para positivas (4-5 estrellas). No se documenta el uso de RLHF, DPO ni técnicas de aumento de datos; tampoco se especifican hiperparámetros de entrenamiento (tasa de aprendizaje, épocas, tamaño de lote) ni la semilla utilizada. La model card menciona que el modelo fue entrenado con español de España, lo que constituye una advertencia explícita sobre su aplicabilidad a otras variedades dialectales.

## Capacidades

- Clasificación binaria de texto en español: distingue reseñas negativas (1-2 estrellas) de positivas (4-5 estrellas).
- Salida de probabilidad calibrada mediante función softmax sobre dos clases, con umbral de decisión por defecto de 0,5.
- Procesamiento de secuencias de hasta 512 tokens, suficiente para reseñas de producto de longitud media.
- Integración directa con la librería `transformers` mediante el pipeline `text-classification`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No dispone de modo thinking, visión, audio ni otras capacidades multimodales.
- Capacidad monolingüe: solo español; no se garantiza rendimiento en otros idiomas.

## Casos de uso

- **Priorización de atención al cliente en e-commerce**: el modelo clasifica en tiempo real las reseñas entrantes y las etiqueta como negativas o positivas; las negativas se enrutan a un equipo de soporte con SLA reducido. Es adecuado por su latencia baja y su tamaño reducido, que permite ejecutarlo en CPU.
- **Alertas automáticas de reputación**: integrado en un pipeline de monitorización, el modelo puede disparar alertas cuando la proporción de reseñas negativas supera un umbral configurable en una ventana temporal, ayudando a detectar problemas de producto o logística.
- **Enrutamiento en mesas de ayuda**: combinado con un sistema de ticketing, la clasificación permite asignar reseñas negativas a agentes especializados y reservar respuestas automatizadas para las positivas, reduciendo la carga operativa.
- **Análisis de sentimiento a escala en catálogos**: procesamiento por lotes de miles de reseñas para generar informes agregados de satisfacción por producto, categoría o región, aprovechando el throughput elevado de un encoder de 110M de parámetros.
- **Filtrado previo en pipelines de moderación**: como primera etapa de un sistema de moderación más complejo, el modelo descarta rápidamente las reseñas claramente positivas y concentra los recursos de análisis (LLMs, revisión humana) en las negativas.
- **Generación de datasets etiquetados**: el modelo puede utilizarse como etiquetador débil para preanotar grandes volúmenes de reseñas y acelerar la construcción de conjuntos de datos supervisados, siempre con revisión humana posterior.
- **Investigación académica y docencia**: sirve como ejemplo reproducible de ajuste fino de BETO para clasificación binaria, útil en cursos de procesamiento de lenguaje natural en español.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados en la model card corresponden al conjunto de prueba del cliente (4.000 reseñas, umbral 0,5):

| Métrica | Valor |
|---|---|
| Exhaustividad (recall) | 0,957 |
| Precisión | 0,931 |
| Exactitud (accuracy) | 0,943 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, GLUE, etc.) en la información disponible. No se han publicado comparaciones con modelos similares en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: aproximadamente 0,45 GB en FP32 (109,8M de parámetros × 4 bytes), unos 0,22 GB en FP16 y alrededor de 0,11 GB en INT8. El tamaño del repositorio es de 0,4 GB.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM es suficiente; una NVIDIA T4, RTX 3060 o superior ofrece holgura para procesamiento por lotes. Para entrenamiento o ajuste fino, se recomienda una A100, H100 o RTX 4090.
- **¿Cabe en GPU de consumo?**: sí, en cualquier GPU de consumo con más de 1 GB de VRAM; también es viable la inferencia en CPU con latencias aceptables para clasificación individual.
- **Opciones de despliegue**: `transformers` con pipeline `text-classification`, TorchServe, FastAPI con PyTorch, ONNX Runtime, y conversión a GGUF para llama.cpp (aunque no se documenta oficialmente). vLLM y TGI no están optimizados para encoders BERT pequeños, aunque podrían ejecutarlo con rendimiento inferior al de un servidor específico.
- **Latencia y throughput estimados**: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia inferior a 10 ms por muestra en GPU moderna y throughput de varios cientos de muestras por segundo en lote, pero estos valores no están documentados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LuisPablo54/beto-resenas-negativas | 109,8M | 512 tokens | Clasificación binaria de reseñas en español | CC BY 4.0 | Hugging Face (0 descargas) |
| dccuchile/bert-base-spanish-wwm-cased | 109,8M | 512 tokens | Modelo base preentrenado en español | Apache 2.0 | Hugging Face (ampliamente utilizado) |
| BERT base multilingüe (bert-base-multilingual-cased) | 177,9M | 512 tokens | Modelo base multilingüe | Apache 2.0 | Hugging Face |
| RoBERTa base en español (PlanTL-GOB-ES/roberta-base-bne) | 125,4M | 512 tokens | Modelo base preentrenado en español | Apache 2.0 | Hugging Face |

La comparativa se limita a modelos base comparables en tamaño y arquitectura, ya que no se dispone de resultados de benchmarks de este checkpoint frente a alternativas ajustadas para la misma tarea. El modelo aquí descrito es un ajuste fino específico, por lo que la comparación directa con modelos base no evalúa rendimiento en la tarea, sino únicamente características estructurales.

## Limitaciones y advertencias

- **Sesgos conocidos**: no se documentan análisis de sesgos. El entrenamiento con reseñas de Amazon puede heredar sesgos de dominio (productos de consumo) y de la distribución de estrellas del dataset original, lo que puede afectar a la generalización a otros dominios.
- **Riesgo de alucinación**: al ser un clasificador binario, no genera texto libre, por lo que el riesgo de alucinación se traduce en falsos positivos y falsos negativos. Con una precisión de 0,931 y una exhaustividad de 0,957 en el conjunto de prueba, se espera un porcentaje no despreciable de errores en producción.
- **Limitaciones de contexto e idioma**: la ventana de 512 tokens puede truncar reseñas largas. El modelo fue entrenado con español de España, según advierte la model card, por lo que su rendimiento en variedades latinoamericanas no está garantizado y podría degradarse.
- **Restricciones de licencia**: CC BY 4.0 permite uso comercial, modificación y redistribución siempre que se atribuya la autoría. No obstante, al derivar de BETO (Apache 2.0), deben respetarse también las condiciones de la licencia del modelo base.
- **Caveats para producción**: el modelo tiene cero descargas y cero likes en Hugging Face, carece de validación independiente y fue creado en un contexto académico con un conjunto de prueba específico. No se documentan hiperparámetros de entrenamiento ni semillas, lo que dificulta la reproducibilidad. La propia model card indica que no debe usarse para ignorar reseñas, lo que subraya la necesidad de supervisión humana en cualquier flujo de atención al cliente.
- **Dominio limitado**: entrenado exclusivamente con reseñas de Amazon, puede no transferir bien a reseñas de otros sectores (restaurantes, servicios, aplicaciones móviles) sin reentrenamiento o ajuste adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LuisPablo54/beto-resenas-negativas
- Repositorio del examen en GitHub: https://github.com/LuisPablo54/aa3-examen-p2-equipo-LuisFranMares
- Perfil de GitHub del autor: https://github.com/LuisPablo54
- Modelo base BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- Dataset Amazon Multilingual Reviews (Keung et al., 2020): no disponible en la información proporcionada
- Paper de BETO (Cañete et al., 2020): no disponible en la información proporcionada
