# abdulaziz01/team-103-trust

## Resumen

`abdulaziz01/team-103-trust` es un clasificador de texto en inglés y árabe que etiqueta la fuerza de una evidencia dentro de una revisión de despliegue de IA, siguiendo la "escalera de evidencia" del producto Trust. El modelo asigna cada fragmento a una de cinco categorías: `declared`, `document-inspected`, `configuration-checked`, `test-observed` o `not-evidence`. Lo desarrolla el usuario abdulaziz01 en el marco del hackathon Qai × Hugging Face Hackathon 01 (etiqueta `qai-hf-hackathon-2026`), con enfoque en gobernanza de IA y contexto catarí.

Técnicamente es un fine-tuning de `jhu-clsp/mmBERT-small`, un encoder ModernBERT multilingüe orientado a árabe e inglés. El checkpoint final tiene 140.643.461 parámetros y un repositorio de 0,6 GB en formato safetensors. La tarea es de clasificación de texto de cinco clases, no de generación: el modelo no produce texto libre, solo una etiqueta por entrada.

Su relevancia es acotada pero concreta: sustituye una heurística basada en reglas (que obtenía 0,360 de accuracy) por un clasificador supervisado que alcanza 0,920 de accuracy y 0,923 de macro F1 en un conjunto de test con plantillas no vistas. Es un componente de un sistema mayor (la aplicación Trust), donde las reglas fijas posteriores limitan qué evidencia cuenta realmente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer bidireccional con atención lineal) |
| Parámetros totales | 140.643.461 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantización | no disponible (no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en), árabe (ar) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `jhu-clsp/mmBERT-small`, un encoder ModernBERT multilingüe con cobertura principal de árabe e inglés. Sobre esa base se aplica un fine-tuning de clasificación con cabeza de cinco clases. El entrenamiento usó el dataset `abdulaziz01/team-103-trust-evidence-data`, con 1.530 ejemplos de entrenamiento y 170 de validación, sintéticos y bilingües. Hiperparámetros declarados: 4 épocas, learning rate 5e-5, batch size 32, longitud máxima 256 y ejecución en Hugging Face Jobs sobre una GPU T4.

El conjunto de test (150 ejemplos) se construyó con plantillas separadas que el modelo no vio durante el entrenamiento y con redacción distinta, de modo que la métrica publicada mide generalización a formulaciones nuevas y no memorización. No se documenta uso de RLHF, DPO ni decodificación especulativa; al ser un encoder de clasificación, esas técnicas no aplican. La innovación relevante es de diseño de producto: el clasificador solo sugiere la fuerza de una evidencia, y reglas fijas posteriores (topes por tipo de documento y ejecución propia de tests) determinan qué se contabiliza.

## Capacidades

- Clasificación de texto en cinco etiquetas discretas sobre la escalera de evidencia de Trust.
- Distinción entre afirmaciones sin respaldo (`declared`), extractos de documentos formales (`document-inspected`), configuraciones en vivo tipo YAML/JSON/key=value (`configuration-checked`) y resultados de tests registrados (`test-observed`).
- Detección de texto que no constituye evidencia (`not-evidence`): logística, marketing, preguntas.
- Procesamiento bilingüe inglés-árabe en el mismo checkpoint.
- Integración como componente de sugerencia dentro de un flujo de revisión; no toma decisiones finales.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio.
- No dispone de modo "thinking" ni generación de texto libre.

## Casos de uso

- **Pantalla de evidencia en una herramienta de gobernanza de IA**: el modelo etiqueta cada ítem que un equipo de proyecto sube a la revisión, y la aplicación aplica después topes por tipo (un documento subido cuenta como máximo `document-inspected`). Es su uso previsto y el único validado por el autor.
- **Triage previo de documentación de cumplimiento**: clasificar automáticamente extractos de políticas, procedimientos, DPIA, matrices de acceso o términos de proveedor para separar lo que es documento formal de lo que es una mera declaración.
- **Detección de configuraciones frente a promesas**: en auditorías internas, distinguir un fragmento YAML/JSON o una exportación de administración (`configuration-checked`) de una afirmación textual sin respaldo (`declared`), priorizando qué revisar primero.
- **Filtrado de ruido en bandejas de evidencias**: marcar como `not-evidence` textos logísticos, de marketing o preguntas que llegan mezclados con material sustantivo, reduciendo el trabajo manual de revisión.
- **Soporte bilingüe en organizaciones del Golfo**: clasificar documentación en árabe e inglés con un único modelo; el autor reporta 0,968 de accuracy en árabe frente a 0,885 en inglés en su test sintético.
- **Sustitución de heurísticas por reglas en pipelines existentes**: reemplazar un clasificador basado en palabras clave (0,360 de accuracy) por un modelo supervisado (0,920), manteniendo las reglas solo como capa de limitación posterior.
- **Preetiquetado para anotación humana**: usar las sugerencias del modelo como borrador que un revisor corrige, útil para acelerar la construcción de un conjunto de test real escrito por personas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre un conjunto de test de 150 ejemplos con plantillas no vistas:

| Sistema | Accuracy | Macro F1 |
|---|---|---|
| Este modelo | 0,920 | 0,923 |
| Baseline de reglas (heurística previa de Trust) | 0,360 | 0,317 |

Accuracy por idioma: inglés 0,885; árabe 0,968.

Desglose por etiqueta:

| Etiqueta | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| declared | 1,00 | 0,87 | 0,93 | 30 |
| document-inspected | 1,00 | 0,97 | 0,98 | 30 |
| configuration-checked | 1,00 | 0,77 | 0,87 | 30 |
| test-observed | 1,00 | 1,00 | 1,00 | 30 |
| not-evidence | 0,71 | 1,00 | 0,83 | 30 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible; el modelo es un clasificador de dominio específico y esas evaluaciones no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,56 GB solo para pesos (140,6 M de parámetros); en fp16, unos 0,28 GB. Con activaciones y overhead de runtime, el consumo real es de fracciones de GB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para lotes pequeños.
- GPU recomendadas para throughput alto: T4, L4, A10G o A100; el propio autor entrenó en una T4.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, pipelines de Hugging Face, Text Embeddings Inference (TEI) para serving de encoders, o exportación a ONNX. No se documentan artefactos GGUF ni soporte verificado en llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. Por tamaño y arquitectura de encoder, se espera inferencia en el orden de milisegundos por muestra en GPU moderna, pero es una estimación, no un dato publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `abdulaziz01/team-103-trust` | 140,6 M | 256 tokens | Clasificación de evidencia (5 clases), en/ar | MIT | Hugging Face |
| `jhu-clsp/mmBERT-small` (base) | ~140 M | hasta 8.192 tokens según el modelo base | Encoder multilingüe en/ar, sin cabeza de clasificación | no disponible en la información | Hugging Face |
| Baseline de reglas de Trust | no aplica | no aplica | Heurística de palabras clave, 0,360 de accuracy | no disponible | Interno de la aplicación |

No se dispone de comparaciones con otros clasificadores de gobernanza de IA en la información proporcionada. Frente a su modelo base, la diferencia es que `mmBERT-small` no está ajustado para esta tarea y su longitud de contexto nativa es mayor que la ventana de 256 tokens usada aquí.

## Limitaciones y advertencias

- Todos los datos de entrenamiento y test son sintéticos. Los documentos reales son más largos, más desordenados y mezclan idiomas; el autor advierte de que la accuracy será menor hasta que exista un test escrito por personas.
- El modelo solo sugiere una fuerza de evidencia; nunca decide un hallazgo. Los topes de Trust y sus propios tests determinan qué cuenta. No debe usarse como base única de ninguna aprobación.
- Ventana de 256 tokens: un documento largo se juzga únicamente por su apertura, lo que puede clasificar mal evidencias cuya parte relevante está más adelante.
- Recall bajo en `configuration-checked` (0,77): casi una cuarta parte de las configuraciones reales se clasifican como otra etiqueta.
- Precision de 0,71 en `not-evidence`: aproximadamente tres de cada diez predicciones de esa clase son falsos positivos, lo que puede descartar material que sí era evidencia.
- Mayor accuracy reportada en árabe que en inglés (0,968 frente a 0,885), pero sobre datos sintéticos; no extrapolable a documentos reales bilingües.
- Sesgos conocidos: no documentados por el autor. Al ser datos sintéticos, es probable que el modelo refleje los patrones de redacción de las plantillas usadas y no la variedad real de estilos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí riesgo de clasificación errónea con alta confianza en entradas fuera de distribución.
- Licencia MIT: permite uso comercial y modificación con atribución; conviene conservar el aviso de copyright.
- Proyecto de hackathon, sin descargas ni likes en el momento de la consulta; no hay historial de mantenimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abdulaziz01/team-103-trust
- Dataset de entrenamiento: https://huggingface.co/datasets/abdulaziz01/team-103-trust-evidence-data
- Demo de la aplicación Trust: https://huggingface.co/spaces/abdulaziz01/team-103-trust-app
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Perfil del autor: https://huggingface.co/abdulaziz01
- Sitio de Trust: https://trustmodel.ai/
