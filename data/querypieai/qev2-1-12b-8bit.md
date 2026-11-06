# querypieai/QEV2.1-12B-8BIT

## Resumen

QEV2.1-12B-8BIT es un modelo especializado en clasificación de decisiones tipadas para prevención de fuga de datos (DLP, *Data Loss Prevention*), desarrollado por QueryPie AI. No es un modelo generativo de propósito general: se construye sobre `google/gemma-4-12B-it` mediante un ajuste LoRA fusionado y una conversión a 8 bits con LLM.int8, y expone una interfaz `decide()` que devuelve probabilidades sobre opciones predefinidas en lugar de texto libre. El modelo evalúa preguntas directas del tipo `is_dlp` e `is_*` (por ejemplo, si un documento contiene información sensible), manteniendo la interfaz QEV de `choice`, `noul` y `score`.

La relevancia actual del modelo reside en su enfoque: en lugar de pedir a un LLM que "razone" y genere una respuesta en lenguaje natural que luego hay que parsear, QEV2.1 convierte la decisión en una clasificación estructurada con probabilidades calibradas. Esto encaja en pipelines de seguridad donde se necesita una señal determinista y auditable sobre documentos completos. La versión 2.1 incorpora un refuerzo específico para japonés, además de inglés y coreano.

El paquete es autocontenido: incluye el backbone fusionado, tokenizador, cabeza *pointer* en FP32, metadatos de calibración y un cargador personalizado de Transformers. Requiere `trust_remote_code=True` y CUDA para funcionar, y su licencia es de investigación no comercial, lo que condiciona fuertemente su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 4 12B IT) con cabeza *pointer* para decisión tipada; LoRA fusionado |
| Parametros totales | 12B (según nombre y modelo base); recuento exacto no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8 bits LLM.int8 (bitsandbytes, umbral 6.0); cabeza pointer, embeddings, normalización y rutas de outliers en coma flotante |
| Idiomas soportados | Inglés (en), coreano (ko), japonés (ja) |
| Licencia | QueryPie AI Research License v1.0 (uso comercial solo con permiso escrito); componentes fundacionales conservan sus licencias upstream |
| Formato de pesos | safetensors (repo de 13,0 GB), cargador personalizado de Transformers |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it` (revisión `707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7`) y aplica un ajuste LoRA que posteriormente se fusiona en los pesos base. Sobre el backbone se añade una cabeza *pointer* en FP32 que transforma las representaciones internas en probabilidades sobre las opciones definidas por el usuario en cada consulta. La conversión a 8 bits se realiza con LLM.int8 de bitsandbytes tras la fusión del LoRA, manteniendo en coma flotante la cabeza, los embeddings, las capas de normalización y las rutas de outliers para preservar la precisión de la decisión.

El corpus de entrenamiento combina datos públicos de propósito general con datos internos corporativos de DLP y aumentación multilingüe. El repositorio no distribuye filas de entrenamiento, calibración, validación ni test, ni etiquetas, ejemplos generados, estado del optimizador o ficheros de adaptador; los nombres de datasets, rutas internas, recuentos de muestras y reglas de generación no se revelan. No se documenta en la información disponible el uso de RLHF o DPO, ni el número de tokens de entrenamiento.

## Capacidades

- Clasificación de decisiones tipadas: evalúa preguntas `is_dlp` e `is_*` devolviendo probabilidades sobre opciones, no texto generado.
- Interfaz QEV completa: soporta los modos `choice`, `noul` y `score` para formular decisiones con criterios personalizados.
- Decisiones a nivel de documento: procesa el documento completo y emite un veredicto, sin extracción de *spans* ni recuento de hallazgos.
- Multilingüe en inglés, coreano y japonés, con aumentación específica para japonés en esta versión.
- Definición dinámica de criterios: el usuario proporciona las opciones y descripciones en la llamada a `decide()`.
- No soporta generación de texto libre validada: los pipelines genéricos de generación y el *hosted inference* no están validados.
- No se documenta soporte de *tool calling*, agentes o razonamiento multi-paso en la información disponible.

## Casos de uso

- Clasificación DLP en pasarelas de correo: integrar `decide()` para etiquetar documentos salientes como sensibles o no sensibles antes de permitir su envío, usando la probabilidad devuelta como umbral configurable.
- Prevención de fuga en repositorios documentales: ejecutar el modelo sobre documentos completos en un pipeline batch para marcar aquellos que contienen datos personales o confidenciales, aprovechando la interfaz `choice` para múltiples categorías.
- Cumplimiento normativo en entornos multilingües: aplicar el modelo a corpus en inglés, coreano y japonés con una única política de decisión, gracias a la cobertura multilingüe del ajuste.
- Moderación de contenido en plataformas internas: definir criterios ad hoc (por ejemplo, "¿contiene credenciales?") y obtener una probabilidad calibrada para priorizar la revisión humana.
- Enrutamiento de documentos en flujos de trabajo: usar la salida de `score` para decidir si un documento se deriva a revisión legal, a cuarentena o a archivo, sin necesidad de parsear texto generado.
- Investigación académica en clasificación con LLM: emplear el paquete como referencia reproducible para estudiar decisiones tipadas frente a generación libre, dado que incluye metadatos de calibración y validación.
- Evaluación de sensibilidad en datasets de entrenamiento: clasificar grandes volúmenes de texto antes de incorporarlos a un corpus, con la ventaja de que la salida es una probabilidad y no una cadena de texto.

## Benchmarks y rendimiento

Los resultados publicados corresponden al checkpoint fuente en BF16 sin fusionar, no a este paquete fusionado en 8 bits. Se presentan como referencia histórica.

| Metrica | Resultado |
|---|---:|
| Macro-F1 global (excluyendo biométrico) | 97,77% |
| Macro-F1 EN | 97,79% |
| Macro-F1 KO | 97,83% |
| Macro-F1 JA | 98,13% |
| Registros de evaluación | 6.281 |

La categoría `is_biometric` tiene cero filas positivas y se excluye de los resúmenes macro. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 13,0 GB en 8 bits; se recomienda al menos 16-24 GB de VRAM para inferencia con margen para activaciones y la cabeza en FP32.
- GPU validadas: NVIDIA H200 con CUDA según la model card; no se documentan otras GPU validadas.
- GPU consumer: por tamaño en 8 bits podría caber en tarjetas de 24 GB (RTX 3090/4090), pero no está validado oficialmente.
- CUDA es obligatorio: el cargador personalizado y la conversión LLM.int8 requieren GPU.
- Despliegue: `AutoModel.from_pretrained(..., trust_remote_code=True)` con el cargador propio; no se validan vLLM, llama.cpp, Ollama ni TGI, ni pipelines genéricos de generación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QEV2.1-12B-8BIT | 12B | No disponible | Clasificación DLP tipada | Research no comercial | Hugging Face, 44 descargas |
| google/gemma-4-12B-it | 12B | No disponible | LLM generativo general | Licencia Gemma | Hugging Face |
| Clasificadores DLP tradicionales (regex/ML) | Variable | No aplica | Reglas y ML supervisado | Variable | Comercial |

La comparación directa con otros modelos de decisión tipada no está disponible en la información proporcionada. Frente al modelo base, QEV2.1 sustituye la generación libre por una cabeza de clasificación con probabilidades, lo que cambia por completo el perfil de uso.

## Limitaciones y advertencias

- Licencia restrictiva: solo permite investigación personal no comercial y académica no comercial; el uso comercial, desarrollo de producto y pruebas de concepto con motivación comercial requieren permiso escrito de QueryPie.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor.
- Solo validado en NVIDIA H200 con CUDA; el comportamiento en otras GPU no está documentado.
- No extrae *spans* ni cuenta hallazgos: solo emite decisiones a nivel de documento.
- La categoría `is_biometric` no tiene positivos en evaluación, por lo que su fiabilidad es desconocida.
- Los benchmarks publicados son del checkpoint BF16 sin fusionar, no de este paquete en 8 bits; el rendimiento real de la versión cuantizada puede diferir.
- Riesgo de alucinación inherente al backbone, aunque la salida sea probabilística y no texto libre.
- Sesgos no documentados; el corpus interno de DLP no se distribuye, lo que impide auditar la composición de los datos.
- Idiomas limitados a en, ko y ja; no hay soporte declarado para castellano.
- El repositorio no incluye datos de entrenamiento ni adaptadores, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/querypieai/QEV2.1-12B-8BIT
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Contacto comercial de QueryPie: https://www.querypie.com/en/contact-us
- No se han encontrado papers, blogs o repositorios adicionales en la información proporcionada.
