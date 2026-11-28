# dbl-ab/codebert-vuln-diversevul

## Resumen

`dbl-ab/codebert-vuln-diversevul` es un modelo publicado en Hugging Face por el usuario `dbl-ab` bajo la librería `transformers`. Por su identificador, el modelo parece ser un ajuste fino (fine-tuning) de CodeBERT orientado a la detección de vulnerabilidades en código, presumiblemente entrenado sobre el dataset DiverseVul (una colección pública de funciones en C/C++ etiquetadas como vulnerables o seguras). Sin embargo, la model card publicada es la plantilla automática de Hugging Face y no contiene ninguna descripción, especificación ni resultado de evaluación aportado por el autor.

No se dispone de información verificada sobre arquitectura, número de parámetros, longitud de contexto, datos de entrenamiento ni licencia. El modelo presenta cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el 28 de noviembre de 2026, lo que sugiere un artefacto reciente y sin validación comunitaria. Cualquier uso en producción debería ir precedido de una evaluación independiente.

La relevancia potencial del modelo radica en su categoría (detección de vulnerabilidades sobre código fuente), un área de interés creciente para pipelines de seguridad en CI/CD, pero la ausencia total de documentación y de métricas publicadas limita seriamente su adopción responsable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (por el identificador, compatible con CodeBERT, un transformer encoder; no confirmado por el autor) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio etiquetado como `transformers`; probablemente safetensors o PyTorch bin, sin confirmar) |

## Arquitectura y entrenamiento

No hay información aportada por el autor sobre la arquitectura. El tag `arxiv:1910.09700` presente en el repositorio corresponde al artículo de CodeBERT (Feng et al., 2020), un transformer encoder de tipo RoBERTa preentrenado con objetivos de modelado enmascarado sobre pares código-texto en seis lenguajes de programación. Es razonable inferir que este modelo parte de CodeBERT y se ajusta para clasificación binaria de vulnerabilidades, pero el autor no lo confirma en la model card.

Tampoco se documentan los datos de entrenamiento. El nombre del modelo sugiere el uso del dataset DiverseVul, descrito en el artículo de Chen et al. (2023) y compuesto por funciones en C/C++ extraídas de repositorios de código abierto. No se especifican hiperparámetros, número de épocas, política de preprocesado, ni si se empleó validación cruzada o particiones temporales. No se indica ninguna innovación técnica adicional.

## Capacidades

- Clasificación de código: por el nombre del modelo, se espera que emita una etiqueta binaria (vulnerable / no vulnerable) sobre fragmentos de código, presumiblemente en C/C++.
- Codificación de código fuente: al derivar de CodeBERT, podría emplearse como extractor de embeddings para funciones o fragmentos, aunque esto no está confirmado.
- Generación de texto: no disponible; un encoder tipo BERT no es un modelo generativo.
- Razonamiento, matemáticas, visión: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el alcance idiomático de código no está declarado.
- Capacidades especiales (modo thinking, audio, visión): no disponible.

## Casos de uso

- Análisis estático asistido en CI/CD: integrar el modelo como clasificador que marque funciones candidatas a revisión manual tras cada commit, usando su salida como señal de priorización frente a un análisis estático tradicional. Requiere validar previamente la tasa de falsos positivos.
- Triaje de hallazgos de SAST: usar el modelo para reordenar las alertas de herramientas como Semgrep o CodeQL y reducir el ruido que revisan los equipos de seguridad.
- Revisión de código en pull requests: publicar comentarios automáticos en fragmentos con alta probabilidad de vulnerabilidad, siempre como aviso no bloqueante.
- Etiquetado de datasets de seguridad: emplear el modelo como preanotador en la construcción de corpus de funciones vulnerables, con revisión humana posterior.
- Investigación académica en detección de vulnerabilidades: usar el checkpoint como línea base para comparar con modelos más recientes en experimentos reproducibles.
- Formación y concienciación: mostrar ejemplos clasificados por el modelo en talleres de seguridad de código, dejando claro que la clasificación es orientativa.
- Filtrado previo en pipelines de fuzzing: priorizar funciones que el modelo marque como sospechosas para asignarles más ciclos de fuzzing, sujeto a validación empírica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; si el modelo sigue la arquitectura CodeBERT-base (unos 125 millones de parámetros), cabría en GPUs de consumo con 4-8 GB de VRAM en fp16, pero esto es una inferencia no confirmada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; probablemente sí para un encoder de tamaño base, pero sin datos oficiales.
- Opciones de despliegue: no disponible; al estar etiquetado como `transformers`, cabría esperar compatibilidad con la librería de Hugging Face, y potencialmente con ONNX Runtime o TorchScript si se exporta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dbl-ab/codebert-vuln-diversevul` | no disponible | no disponible | Clasificación de vulnerabilidades (presunta) | no disponible | Hugging Face |
| `microsoft/codebert-base` | ~125 M | 512 tokens | Representación de código (encoder) | MIT | Hugging Face |
| `microsoft/graphcodebert-base` | ~125 M | 512 tokens | Representación de código con estructura de grafo | MIT | Hugging Face |
| `Salesforce/codet5-base` | ~220 M | 512 tokens | Generación y clasificación de código | BSD-3-Clause | Hugging Face |

La comparación se ofrece como referencia de categoría; no se dispone de métricas del modelo evaluado para contrastar rendimiento con estas alternativas.

## Limitaciones y advertencias

- La model card es la plantilla automática de Hugging Face: no hay descripción funcional, ni métricas, ni instrucciones de uso.
- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor antes de integrarlo en productos.
- Cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.
- Riesgo elevado de alucinación en sentido amplio: un clasificador de vulnerabilidades puede producir falsos positivos y falsos negativos; sin métricas publicadas no es posible calibrar su fiabilidad.
- Sesgos potenciales derivados del dataset DiverseVul (predominio de C/C++ y de proyectos de código abierto) que no están documentados por el autor.
- Limitaciones idiomáticas y de contexto desconocidas; no se especifica la longitud máxima de entrada.
- No apto para uso en producción sin una evaluación independiente sobre un conjunto de validación propio.
- Fecha de creación (2026) y ausencia de historial de mantenimiento: riesgo de abandono del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dbl-ab/codebert-vuln-diversevul
- Paper de CodeBERT (referenciado por el tag del repositorio): https://arxiv.org/abs/1910.09700
- Dataset DiverseVul (referencia por el nombre del modelo): https://github.com/DiverseVul/DiverseVul
- Paper de DiverseVul (Chen et al., 2023): https://arxiv.org/abs/2304.00409
