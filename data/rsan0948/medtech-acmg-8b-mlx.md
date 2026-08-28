# Rsan0948/medtech-acmg-8b-mlx

## Resumen

medtech-acmg-8b-mlx es un adaptador LoRA de 0.6 GB desarrollado por Ruben Sanchez (Rsan0948) sobre el modelo base `mlx-community/Qwen3-8B-bf16`, optimizado para la clasificación de variantes germinales en cinco clases según las guías ACMG/AMP. El modelo se ha obtenido mediante destilación de los razonamientos (reasoning traces) de DeepSeek-R1, filtrando las respuestas por concordancia con ClinVar, y está diseñado para leer una traza estructurada de variante (gen, consecuencia, frecuencia alélica, estado de revisión de ClinVar) y devolver un objeto JSON con la clasificación, los criterios ACMG activados, la traza de razonamiento y un nivel de confianza.

La relevancia de este modelo radica en su enfoque práctico para un dominio clínico muy concreto: la interpretación de variantes en BRCA1/BRCA2 y MLH1. Frente a un baseline basado en reglas que alcanza un 75,51% de precisión en validación, el adaptador consigue un 89,80%, superando incluso al profesor DeepSeek-R1 (69,39%). El autor advierte explícitamente que es un artefacto de investigación, no un dispositivo médico, y que su dominio es muy estrecho (aproximadamente 99% de los casos son BRCA1/BRCA2). El adaptador está pensado para entornos Apple Silicon mediante la librería MLX, aunque el modelo base Qwen3-8B es Apache-2.0 y puede usarse con cualquier framework compatible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-8B (transformer decoder-only) + adaptador LoRA |
| Parametros totales | 8.03 mil millones (modelo base) + ~2,9% entrenables en el adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (max seq de entrenamiento; el modelo base Qwen3 soporta más, pero el adaptador se entrenó con este límite) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en formato MLX; el modelo base admite cuantizaciones de MLX) |
| Idiomas soportados | no disponible (la model card no especifica; el base Qwen3 soporta multilingüe, pero el adaptador está enfocado a entradas técnicas en inglés) |
| Licencia | Apache-2.0 (adaptador y modelo base) |
| Formato de pesos | MLX (adaptador LoRA, safetensors) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-8B, un transformer decoder-only con atención causal estándar y mecanismos de reasoning (thinking mode) propios de la familia Qwen3. El entrenamiento utiliza LoRA con rango 64, alpha 128 y dropout 0,05 aplicado a 32 capas, lo que supone aproximadamente un 2,9% de parámetros entrenables. Los datos de entrenamiento consisten en 715 ejemplos destilados de DeepSeek-R1, filtrados por concordancia con ClinVar, más un split de validación de 98 ejemplos. Se aplicó una corrección de fuga de etiquetas (label leakage) reconstruyendo los prompts sin pistas. El entrenamiento siguió un schedule coseno de 2e-4 a 1e-6 con warmup de 100 pasos, batch efectivo de 16 y semilla 42, deteniéndose temprano en la iteración 360, aunque el checkpoint publicado corresponde a la iteración 200 (mejor loss de validación 0,382). Se ejecutó en un Apple M1 Max de 64 GB con mlx-lm 0.31.3 durante aproximadamente 8 horas y 50 minutos.

La innovación técnica principal es el enfoque de destilación: en lugar de entrenar con datos anotados manualmente, se utilizan los razonamientos de DeepSeek-R1 como profesor, filtrando las salidas que concuerdan con las etiquetas de ClinVar. Además, el diseño del prompt incluye una plantilla que formatea la traza de variante contra las guías ACMG (documento `ACMG_GUIDELINES_V1.txt`). El adaptador emite un JSON con la clasificación primero, lo que permite inferencia truncada para despliegue en el borde: se mide un tiempo de 3,97 segundos hasta la etiqueta en un M1 Max, frente a 30,25 segundos para la traza completa de razonamiento.

## Capacidades

- Clasificación de variantes germinales en cinco clases ACMG/AMP: Patogénica, Likely Patogénica, VUS (variante de significado incierto), Likely Benigna y Benigna.
- Generación de un objeto JSON estructurado con `classification`, `triggered_criteria`, `reasoning_trace` y `confidence`.
- Razonamiento multi-paso: el modelo produce una traza de razonamiento que justifica los criterios ACMG activados (concordancia media Jaccard de 0,78 con el profesor en validación).
- Inferencia truncada para despliegue en el borde: al emitir la clasificación primero, se puede cortar la generación tras el primer valor, reduciendo la latencia de 30,25 s a 3,97 s en M1 Max.
- Capacidad de tool calling heredada del modelo base Qwen3-8B (aunque no se menciona explícitamente en la model card, Qwen3 soporta function calling).
- Multilingüismo potencial del modelo base, aunque el adaptador está orientado a entradas técnicas en inglés (nombres de genes, consecuencias, etc.).

## Casos de uso

- Priorización de variantes en laboratorios de genética: el modelo puede procesar listas de variantes BRCA1/BRCA2 y MLH1, devolviendo una clasificación preliminar con criterios y confianza que los genetistas pueden revisar. Su precisión del 88,89% en holdout lo hace útil como filtro inicial.
- Automatización de informes de secuenciación: integrado en un pipeline bioinformático, puede generar automáticamente el bloque de clasificación ACMG para cada variante, reduciendo el tiempo de interpretación manual.
- Formación de personal clínico: al emitir trazas de razonamiento con los criterios activados, sirve como herramienta educativa para que residentes y estudiantes comprendan la aplicación de las guías ACMG.
- Despliegue en el borde con Apple Silicon: gracias al formato MLX y a la inferencia truncada, puede ejecutarse en portátiles Mac con M1/M2/M3, facilitando su uso en consultas sin conexión a la nube.
- Auditoría de decisiones clínicas: el campo `confidence` permite filtrar casos de baja confianza para revisión humana, mientras que los de alta confianza (94,74% de precisión en holdout) pueden acelerar el flujo.
- Investigación en genómica clínica: el adaptador puede servir como baseline para comparar métodos de destilación o para estudiar la transferencia de razonamiento de modelos grandes a adaptadores pequeños.

## Benchmarks y rendimiento

Los resultados publicados en la model card son los siguientes:

| Split | Accuracy | High-confidence accuracy | High-conf coverage |
|---|---|---|---|
| Validación (n=98) | 89,80% | 88,89% | 64,3% |
| Holdout (n=45, nunca destilado) | 88,89% | 94,74% | 42,2% |

Comparadores en el mismo split de validación:

| Modelo | Accuracy |
|---|---|
| Baseline basado en reglas | 75,51% |
| DeepSeek-R1 (profesor) | 69,39% |
| medtech-acmg-8b-mlx (adaptador) | 89,80% |

El recall de patogénicas es perfecto: 23/23 en validación y 7/7 en holdout. El autor advierte que el split de validación se usó para selección de checkpoint, por lo que la precisión de validación es ligeramente optimista; el holdout es el número honesto. Las métricas por clase para Benigna y Likely Patogénica son inestables debido a soportes muy pequeños (2 y 1 en validación). No se han publicado resultados en benchmarks generales como MMLU o HumanEval porque el modelo es específico de dominio.

## Requisitos de hardware

- El adaptador LoRA ocupa solo 0,6 GB, pero requiere el modelo base Qwen3-8B en formato MLX (aproximadamente 16 GB en bf16, o menos con cuantización).
- VRAM estimada para inferencia: con cuantización a 4 bits, el modelo base ocupa unos 5-6 GB, más el adaptador, por lo que cabe en GPUs de 8 GB (por ejemplo, RTX 3070/4060) o en Macs con 16 GB unificados.
- GPU recomendadas: Apple Silicon (M1/M2/M3) con al menos 16 GB de memoria unificada para usar MLX de forma óptima; también puede ejecutarse en GPUs NVIDIA con frameworks que soporten LoRA (vLLM, TGI) aunque el formato MLX es específico de Apple.
- El entrenamiento se realizó en un M1 Max de 64 GB, lo que indica que la inferencia completa es viable en ese hardware.
- Opciones de despliegue: mlx-lm (Python), llama.cpp (si se convierte el modelo base a GGUF y se fusiona el adaptador), Ollama (si se empaqueta), vLLM o TGI (con conversión a safetensors estándar).
- Latencia medida: 3,97 s hasta la etiqueta en M1 Max con inferencia truncada; 30,25 s para la traza completa.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores LoRA específicos para clasificación ACMG/AMP sobre Qwen3-8B o modelos similares en la información proporcionada. Como referencia general, el baseline basado en reglas del propio autor obtiene un 75,51% de precisión en el mismo split, y DeepSeek-R1 (profesor) un 69,39%. No hay datos de otros modelos comparables en el dominio de clasificación de variantes con MLX.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: aproximadamente el 99% de los datos de entrenamiento son BRCA1/BRCA2, con solo 10 variantes MLH1. No se ha evaluado en otros genes.
- Artefacto de investigación: el autor declara explícitamente que no es un dispositivo médico y no debe usarse en la práctica clínica.
- Clases con soporte muy reducido: Benigna (2 ejemplos en validación) y Likely Patogénica (1 ejemplo) tienen métricas inestables; no se debe confiar en sus precisiones por clase.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir razonamientos plausibles pero incorrectos; la concordancia Jaccard de 0,78 con el profesor indica que no siempre coincide.
- La precisión de validación es ligeramente optimista porque se usó para selección de checkpoint; el holdout (88,89%) es la métrica más fiable.
- Limitaciones de contexto: el adaptador se entrenó con secuencias de hasta 2048 tokens, por lo que entradas más largas pueden degradar el rendimiento.
- No se especifican idiomas soportados; aunque el modelo base es multilingüe, el adaptador está pensado para terminología técnica en inglés.
- El formato MLX limita el despliegue a entornos Apple Silicon, salvo conversión manual a otros formatos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Rsan0948/medtech-acmg-8b-mlx
- Repositorio de código fuente: https://github.com/Rsan0948/medtech_LLM
- Perfil del autor en HuggingFace: https://huggingface.co/Rsan0948
- Perfil del autor en GitHub: https://github.com/Rsan0948/
- Modelo base: https://huggingface.co/mlx-community/Qwen3-8B-bf16
