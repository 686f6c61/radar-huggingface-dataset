# DICPlay/RusMind-Zernyshko-1.10-GGUF

## Resumen

RusMind Зёрнышко 1.10 (Zernyshko, "semillita") es un modelo de lenguaje de 83 millones de parámetros desarrollado por DICPlay dentro de la familia RusMind, una línea de modelos entrenados desde cero y orientados específicamente al ruso. Se distribuye en formato GGUF para su uso con llama.cpp, LM Studio y Ollama, y su peso ronda los 167 MB en F16, lo que permite ejecutarlo íntegramente en local en un portátil o incluso en un teléfono sin conexión.

La propuesta del modelo no es competir en capacidades generales, sino optimizar tareas lingüísticas y culturales rusas concretas con un presupuesto de parámetros mínimo. Según la model card, obtiene 0,052 en el benchmark MERA 2.0, ligeramente por encima de SmolLM-3B (0,049) pese a ser 36 veces más pequeño, y destaca en pruebas de lógica (NewReasoning), refranes y sabiduría popular (RUBIN), humor, enantiosemia y gramática (SAGE).

La arquitectura es un transformer denso de 10 capas y dimensión 768, con tokenizador propio y contexto de 1024 tokens. El modelo se publica bajo la RusMind License, que restringe el uso comercial a un acuerdo escrito con DICPlay, y su formato de diálogo es ChatML.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (10 capas × 768 de dimensión) |
| Parámetros totales | 83.083.008 (~83 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | F16 (único archivo publicado en el repo GGUF) |
| Idiomas soportados | Ruso (ru) |
| Licencia | RusMind License (DICPlay); uso comercial solo por acuerdo escrito |
| Formato de pesos | GGUF (F16); safetensors en el repo DICPlay/RusMind-Zernyshko-1.10 |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 10 capas con dimensión oculta de 768, entrenado completamente desde cero ("from-scratch") con un tokenizador propio diseñado para el ruso. No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron etapas de ajuste supervisado, RLHF o DPO. La model card únicamente indica el origen desde cero y el enfoque en ruso.

El formato de conversación es ChatML, lo que facilita su integración en plantillas de chat estándar de llama.cpp y LM Studio. La ventana de contexto es de 1024 tokens, una limitación relevante para conversaciones largas o documentos extensos. El tamaño del repositorio GGUF es de 0,2 GB, coherente con un único archivo F16 de aproximadamente 167 MB.

## Capacidades

- Generación de texto conversacional en ruso con plantilla ChatML.
- Razonamiento y lógica básica en ruso: la model card reporta 0,146 en NewReasoning de MERA 2.0, frente a 0,049 de SmolLM-3B.
- Conocimiento de refranes, dichos y sabiduría popular rusa (RUBIN: 0,263).
- Comprensión de humor y enantiosemia (palabras con significados opuestos) a nivel básico.
- Conocimiento de personajes y regiones de Rusia (Characters: 0,177; RussianRegions: 0,031).
- Corrección ortográfica y puntuación en ruso (SAGE): 0,149 en ortografía y 0,409 en colocación de comas según la tabla de evolución de versiones.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada: el modelo está etiquetado solo para ruso.

## Casos de uso

- Corrección ortográfica y de puntuación en ruso: el modelo muestra métricas SAGE específicas para colocación de comas (0,409) y corrección ortográfica (0,149), por lo que puede integrarse como corrector ligero en editores o pipelines de preprocesamiento de texto ruso sin coste de infraestructura.
- Filtrado y clasificación de textos breves en ruso: con 83 M de parámetros y 167 MB, puede desplegarse en dispositivos de borde para tareas de moderación o etiquetado de frases cortas.
- Aplicaciones educativas sobre cultura rusa: su rendimiento en RUBIN (refranes) y Characters (personajes) lo hace adecuado para juegos de preguntas, quizzes o asistentes culturales de alcance limitado.
- Prototipado offline en portátiles y móviles: al ejecutarse con llama.cpp u Ollama en CPU, sirve para demos y pruebas de concepto sin GPU ni conexión.
- Generación de respuestas conversacionales cortas en asistentes de voz o chat embebidos: con contexto de 1024 tokens encaja en diálogos de pocos turnos.
- Investigación sobre modelos pequeños desde cero: al ser un modelo from-scratch con tokenizador propio y métricas publicadas en MERA 2.0, es útil como referencia para estudiar el efecto del tamaño y los datos en tareas lingüísticas rusas.
- Detección de matices léxicos (enantiosemia): puede emplearse en herramientas de desambiguación de palabras rusas con significados opuestos, donde reporta 0,058.

## Benchmarks y rendimiento

Resultados publicados en la model card según la metodología MERA 2.0 (puntuaciones propias y de la clasificación MERA para los modelos comparados):

| Tarea MERA 2.0 | Zernyshko 1.10 (0,08B) | SmolLM-3B (3B) |
|---|---|---|
| Puntuación global | 0,052 | 0,049 |
| NewReasoning (lógica) | 0,146 | 0,049 |
| RUBIN (refranes) | 0,263 | 0,092 |
| Humor | 0,041 | 0,018 |
| Enantiosemia | 0,058 | 0,032 |
| LIMUR | 0,213 | 0,157 |
| Characters (personajes) | 0,177 | 0,129 |
| RussianRegions (regiones) | 0,031 | 0,024 |

Comparaciones adicionales citadas en la model card:

| Tarea | Zernyshko 1.10 | Modelo comparado |
|---|---|---|
| NewReasoning (lógica) | 0,146 | GFusion-10B-A1.8B: 0,057 |
| Humor | 0,041 | GFusion-10B-A1.8B: 0,035 |
| RUBIN | 0,263 | A-vibe 8B: 0,251 |
| SAGE (gramática) | 0,257 | Qwen3.5-4B: 0,038 |
| RUBIN | 0,263 | Qwen3.5-4B: 0,259 |
| RussianRegions | 0,031 | Qwen3.5-4B: 0,018 |
| SAGE (gramática) | 0,257 | Qwen3.5-9B: 0,121 |
| SAGE (gramática) | 0,257 | gemma-4-E4B-it: 0,124 |
| Characters | 0,177 | gemma-4-E4B-it: 0,075 |

Evolución entre versiones de la propia familia:

| Métrica | 1.6 | 1.9 | 1.10 |
|---|---|---|---|
| MERA 2.0 | 0,049 | 0,048 | 0,052 |
| Colocación de comas (SAGE) | 0,267 | 0,335 | 0,409 |
| Corrección ortográfica (SAGE) | 0,062 | 0,102 | 0,149 |

No se han publicado resultados de benchmarks estándar internacionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 0,5 GB en F16 (167 MB de pesos más overhead de contexto); cabe holgadamente en cualquier GPU consumer, incluida una GTX 1050 o una iGPU.
- GPU recomendadas: no requiere GPU; cualquier GPU con al menos 1 GB de memoria libre es suficiente.
- Cabe en consumer GPU: sí, en todas las gamas; también funciona en CPU y en teléfonos.
- Opciones de despliegue: llama.cpp (`llama-cli -hf DICPlay/RusMind-Zernyshko-1.10-GGUF -cnv`), Ollama (`ollama run hf.co/DICPlay/RusMind-Zernyshko-1.10-GGUF`), LM Studio (búsqueda "RusMind Zernyshko") y Transformers con los safetensors del repo DICPlay/RusMind-Zernyshko-1.10.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera inferencia en CPU a velocidad interactiva, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MERA 2.0 | Licencia | Formato |
|---|---|---|---|---|---|
| RusMind Zernyshko 1.10 | 83 M | 1024 | 0,052 | RusMind License (comercial con acuerdo) | GGUF, safetensors |
| SmolLM-3B | 3 B | no disponible | 0,049 | no disponible | no disponible |
| Qwen3.5-4B | 4 B | no disponible | no disponible (SAGE 0,038) | no disponible | no disponible |
| GFusion-10B-A1.8B | 10 B (1,8 B activos) | no disponible | no disponible (NewReasoning 0,057) | no disponible | no disponible |

La comparación se limita a los datos citados en la model card; no se dispone de información sobre contexto, licencia ni formato de pesos de los modelos de referencia en la información proporcionada.

## Limitaciones y advertencias

- Ventana de contexto muy corta (1024 tokens): inadecuado para documentos largos, conversaciones extensas o tareas de recuperación aumentada con mucho contexto.
- Modelo de 83 M de parámetros: capacidad de razonamiento y conocimiento del mundo limitada; las puntuaciones absolutas en MERA 2.0 son bajas (0,052 global) aunque superen a modelos mayores en tareas concretas.
- Solo ruso: no está entrenado ni evaluado para otros idiomas; su uso en castellano u otras lenguas no está soportado.
- Riesgo de alucinación alto en preguntas factuales abiertas, habitual en modelos de este tamaño; no debe usarse como fuente de verdad sin verificación.
- Sesgos: no se documentan análisis de sesgos en la información disponible; al entrenarse con corpus ruso, puede reflejar sesgos culturales y lingüísticos de dichos datos.
- Licencia restrictiva: uso comercial, reventa, distribución de versiones modificadas e integración en productos requieren contrato escrito con DICPlay; solo se permite gratis uso personal, no comercial, investigación y evaluación.
- Se distribuye "tal cual", sin garantías.
- El modelo es la versión 1.10, orientada a métricas de gramática y MERA; la propia model card sugiere la versión 1.9 para conversación viva, lo que indica que 1.10 puede no ser óptima para diálogo general.
- Sin soporte documentado de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.10-GGUF
- Repositorio safetensors: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.10
- Versión anterior 1.9: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.9
- Archivo F16: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.10-GGUF/blob/main/RusMind-Zernyshko-1.10-F16.gguf
- Licencia: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.10-GGUF/blob/main/LICENSE
