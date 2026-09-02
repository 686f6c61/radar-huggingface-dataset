# codewithdark/EVLMs-v2-MIMIC-CXR

## Resumen

EVLMs-v2-MIMIC-CXR es un modelo de visión-lenguaje (VLM) explicable desarrollado por codewithdark para la clasificación de hallazgos en radiografías de tórax y la generación de razonamientos estructurados estilo informe radiológico. Combina un codificador visual Swin-B con el modelo de lenguaje Gemma-3-1B (ajustado con LoRA) e incorpora componentes inspirados en DeepSeek-V4, como conexiones hiper-multi-cabeza (mHC), atención dispersa comprimida (CSA) y el optimizador Muon. El modelo se entrenó sobre 16 000 muestras del dataset MIMIC-CXR-VReason, con un enfoque explícito en la interpretabilidad mediante mapas de activación GradCAM.

La relevancia de este modelo radica en su doble objetivo: no solo predecir la presencia de patologías torácicas, sino también explicar visualmente qué regiones de la imagen sustentan cada decisión. Esto lo hace especialmente útil en entornos clínicos donde la trazabilidad de las decisiones de IA es crítica. Aunque el rendimiento reportado (AUC medio de 0,681 en validación) es moderado, la arquitectura y el pipeline de entrenamiento están documentados con detalle, lo que facilita su reproducción y adaptación.

El repositorio incluye los pesos del modelo final, checkpoints reanudables, artefactos de interpretabilidad (GradCAM) y métricas por época. La licencia Apache 2.0 permite uso comercial y modificación, aunque el modelo está entrenado únicamente en inglés y no se especifican límites de contexto ni cuantizaciones oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision: Swin-B (patch4 window7 224) + Lenguaje: Gemma-3-1B (LoRA) con componentes mHC, CSA y optimizador Muon |
| Parametros totales | No disponible (el módulo de lenguaje tiene 1B, el total no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (entrenado en bf16, sin cuantizaciones publicadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `pytorch_model.bin` (state_dict de PyTorch) y checkpoints reanudables |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura híbrida de visión-lenguaje. El codificador visual es un Swin-B (timm) que procesa la imagen principal y mantiene un mapa espacial completo de 49 tokens; las imágenes de regiones de interés (ROI) devueltas por herramientas se reducen por mean-pooling a un único token. El módulo de lenguaje es Gemma-3-1B, ajustado con LoRA, donde los tokens `<image>` se insertan en el flujo de tokens en sus posiciones exactas, permitiendo entradas intercaladas de múltiples imágenes.

Se incorporan tres innovaciones técnicas: mHC (multi-head hyper-connections) con enrutamiento doblemente estocástico, CSA (compressed sparse attention) para reducir el coste computacional de la atención, y el optimizador Muon (momento ortogonalizado Newton-Schulz) combinado con AdamW para parámetros unidimensionales. La función de pérdida combina clasificación y generación de lenguaje con ponderación adaptativa basada en incertidumbre de Kendall, más ponderación positiva por clase para las etiquetas de ChestXray14.

El entrenamiento se realizó sobre 16 000 muestras de MIMIC-CXR-VReason, con batch de 16, 6 épocas (10 000 pasos de optimizador), programación de tasa de aprendizaje coseno con 10% de warmup, lr 1e-4, precisión bf16 y atención escalada por producto punto (SDPA). Las métricas finales de la época 4 muestran una pérdida de validación de 0,8900 y un AUC medio de 0,6810.

## Capacidades

- Clasificación de hallazgos en radiografías de tórax: detecta la presencia de patologías usando las etiquetas de ChestXray14.
- Generación de razonamiento estructurado: produce explicaciones en lenguaje natural estilo informe radiológico, con justificaciones de las decisiones.
- Interpretabilidad visual: genera mapas de activación GradCAM que señalan las regiones de la imagen que influyen en la predicción.
- Soporte multi-imagen: procesa entradas intercaladas de múltiples imágenes (imagen principal + ROI), lo que permite análisis de regiones específicas.
- Ajuste fino con LoRA: el módulo de lenguaje se adapta eficientemente sin modificar todos los parámetros.
- Entrenamiento con pérdida adaptativa: pondera automáticamente la contribución de clasificación y generación de texto según la incertidumbre.

## Casos de uso

- Asistencia a radiólogos en la revisión de radiografías de tórax: el modelo puede preclasificar hallazgos y generar un borrador de informe, reduciendo el tiempo de lectura y sirviendo como segunda opinión.
- Triaje de pacientes en urgencias: al integrarse en un pipeline de imagen médica, puede priorizar casos con alta probabilidad de patologías críticas (por ejemplo, neumotórax o derrame pleural) basándose en el AUC por clase.
- Formación de residentes de radiología: los mapas GradCAM permiten visualizar qué regiones de la imagen sustentan cada diagnóstico, facilitando el aprendizaje de patrones radiológicos.
- Investigación en IA explicable: el modelo sirve como banco de pruebas para estudiar la relación entre atención visual y razonamiento lingüístico en dominios clínicos.
- Desarrollo de sistemas de soporte a la decisión clínica: combinado con historiales de pacientes, puede generar alertas contextualizadas sobre hallazgos relevantes.
- Auditoría de modelos de IA médica: al ofrecer explicaciones visuales y textuales, permite a los equipos de cumplimiento verificar la coherencia entre la evidencia visual y la conclusión generada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos en la información disponible. La model card reporta únicamente el AUC medio en validación para la época final (0,6810) y las pérdidas de entrenamiento y validación. No hay comparaciones con otros modelos ni desglose por clase.

| Metrica | Valor |
|---|---|
| AUC medio (validación, época 4) | 0,6810 |
| Pérdida de validación (época 4) | 0,8900 |
| Pérdida de entrenamiento (época 4) | 0,7455 |

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM ni GPU recomendadas.
- El tamaño del repositorio es de 24,5 GB, que incluye pesos, checkpoints y artefactos; el archivo `pytorch_model.bin` contiene el state_dict completo, por lo que se estima que la inferencia requiere al menos 16 GB de VRAM en bf16 (basado en el tamaño del modelo de lenguaje de 1B más el codificador Swin-B), pero este dato no está confirmado.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, etc.). Dado que es un modelo PyTorch personalizado, se requeriría implementar el código del repositorio `EVLMs` para cargar los pesos.
- No hay datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado comparaciones con otros VLM médicos (como CheXagent, MedVInT o LLaVA-Med) en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente en inglés; no soporta otros idiomas de forma nativa.
- El dataset MIMIC-CXR tiene sesgos demográficos conocidos (población mayoritariamente de EE. UU., con desequilibrios de edad y sexo), lo que puede afectar la generalización a otras poblaciones.
- El AUC medio de 0,681 indica un rendimiento moderado, no apto para uso clínico autónomo sin supervisión humana.
- No se han evaluado riesgos de alucinación en las explicaciones generadas; el modelo podría producir razonamientos plausibles pero incorrectos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de Gemma-3-1B, cuyos términos de uso deben verificarse por separado.
- El repositorio no incluye un pipeline estándar de HuggingFace; la carga requiere reconstruir la clase `EVLMsV2` desde el código fuente, lo que añade fricción para su integración.
- No se especifican límites de contexto ni comportamiento ante entradas fuera de distribución (por ejemplo, radiografías de otras modalidades).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/codewithdark/EVLMs-v2-MIMIC-CXR
- Perfil del autor en HuggingFace: https://huggingface.co/codewithdark/models
- Perfil del autor en GitHub: https://github.com/codewithdark-git
- Repositorio del framework EVLMs: https://github.com/gmh5225/EVLMs
- Colección de modelos del autor: https://huggingface.co/collections/codewithdark/models
