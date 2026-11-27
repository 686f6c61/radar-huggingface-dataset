# DICPlay/RusMind-Zernyshko-1.10-GGUF

## Resumen

RusMind Zernyshko 1.10 es un modelo de lenguaje de generacion de texto de tamano muy reducido (83 millones de parametros) desarrollado por DICPlay dentro de la familia RusMind, una iniciativa que se presenta como "IA nacional" rusa. El modelo esta entrenado desde cero, con tokenizador propio, y esta especializado exclusivamente en el idioma ruso. Se distribuye principalmente en formato GGUF cuantizado en F16 para su uso con llama.cpp, LM Studio y Ollama, lo que permite ejecutarlo completamente en local en cualquier portatil o telefono.

La propuesta del modelo no es competir en capacidades generales, sino optimizar tareas especificas del ruso: logica verbal, refranes y sabiduria popular, humor, enantiosemia, personajes culturales y conocimiento de las regiones de Rusia, medidas con el benchmark MERA 2.0. Su interes actual radica en que demuestra que un modelo de 0,08B entrenado con un objetivo muy acotado puede superar en ciertas tareas a modelos decenas o cientos de veces mas grandes, a costa de un contexto muy limitado (1024 tokens) y de una licencia restrictiva para uso comercial.

La version 1.10 se posiciona como la de mejor puntuacion MERA y mejor ortografia de la saga, aunque el propio autor recomienda la version 1.9 para conversacion general por tener mas conocimiento y un estilo mas natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (10 capas x 768 dimensiones), entrenado desde cero |
| Parametros totales | 83.083.008 (~83 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | F16 (unico archivo publicado en el repo GGUF) |
| Idiomas soportados | Ruso (ru) exclusivamente |
| Licencia | RusMind License (DICPlay); uso comercial solo con contrato escrito |
| Formato de pesos | GGUF (F16, ~167 MB); safetensors en el repo base DICPlay/RusMind-Zernyshko-1.10 |
| Formato de dialogo | ChatML |
| Tamano del repo | ~0,3 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 10 capas con dimension oculta de 768, con un total de 83 millones de parametros. Segun la model card, esta entrenado completamente desde cero ("from-scratch") con un tokenizador propio disenado para el ruso, lo que lo diferencia de aproximaciones basadas en fine-tuning de modelos multilingues existentes. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones mas alla del formato de dialogo ChatML.

La innovacion principal no es arquitectonica sino de enfoque: el modelo se optimiza de forma explicita contra las tareas del benchmark MERA 2.0 (logica, refranes, humor, enantiosemia, personajes, regiones) y contra metricas de gramatica rusa (colocacion de comas y correccion ortografica, medidas con SAGE). La progresion entre versiones (1.6, 1.9, 1.10) muestra mejoras medibles en esas metricas especificas.

## Capacidades

- Generacion de texto conversacional en ruso con formato de dialogo ChatML.
- Razonamiento verbal y logica basica en ruso (tarea NewReasoning de MERA).
- Comprension de refranes, dichos y sabiduria popular rusa (tarea RUBIN).
- Reconocimiento de humor y enantiosemia (palabras con significados opuestos).
- Conocimiento de personajes culturales rusos y de las regiones de Rusia.
- Correccion ortografica y colocacion de comas en texto ruso (metricas SAGE).
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso documentadas.
- No dispone de modo thinking, vision ni audio.
- Multilingue: no; solo ruso.

## Casos de uso

- Correccion ortografica y de puntuacion en ruso: el modelo obtiene 0,409 en colocacion de comas y 0,149 en correccion ortografica (SAGE), por lo que puede usarse como paso de post-procesado ligero en pipelines editoriales de texto ruso, ejecutandose en local sin coste de API.
- Filtrado y clasificacion de contenido cultural ruso: su rendimiento en RUBIN (0,263) y personajes (0,177) lo hace util para etiquetar refranes, dichos o referencias culturales en corpus pequenos.
- Generacion de preguntas y respuestas sobre regiones de Rusia: aunque su puntuacion en RussianRegions es baja (0,031), supera a modelos mucho mayores en esa tarea concreta y puede servir como base para cuestionarios educativos acotados.
- Prototipado offline en dispositivos moviles: con 167 MB en F16 y contexto de 1024 tokens, cabe en cualquier telefono o portatil y permite experimentar con generacion de texto en ruso sin conexion ni GPU.
- Educacion y demostraciones de entrenamiento desde cero: sirve como ejemplo didactico de modelo pequeno con tokenizador propio y objetivo acotado, util en cursos sobre LLM.
- Deteccion de humor o juegos de palabras en ruso: su puntuacion en Humor (0,041) y Enantiosemia (0,058) permite usarlo como senal debil en sistemas de moderacion o analisis estilistico, siempre combinado con otros modelos.
- Evaluacion comparativa de modelos pequenos: util como baseline en experimentos academicos sobre eficiencia de modelos de menos de 100 M de parametros en lenguas no inglesas.

## Benchmarks y rendimiento

Resultados publicados en la model card segun la metodologia MERA 2.0 (el autor indica que las cifras de los demas modelos provienen del leaderboard MERA):

| Tarea MERA 2.0 | Zernyshko 1.10 (0,08B) | SmolLM-3B (3B) |
|---|---|---|
| Puntuacion global | 0,052 | 0,049 |
| NewReasoning (logica) | 0,146 | 0,049 |
| RUBIN (refranes) | 0,263 | 0,092 |
| Humor | 0,041 | 0,018 |
| Enantiosemia | 0,058 | 0,032 |
| LIMUR | 0,213 | 0,157 |
| Characters (personajes) | 0,177 | 0,129 |
| RussianRegions (regiones) | 0,031 | 0,024 |

Comparaciones adicionales citadas por el autor:

| Modelo comparado | Tamano relativo | Metricas destacadas frente a Zernyshko 1.10 |
|---|---|---|
| GFusion-10B-A1.8B | 130x mayor | NewReasoning 0,057 vs 0,146; Humor 0,035 vs 0,041; RUBIN y regiones a la par |
| A-vibe 8B | 96x mayor | RUBIN 0,251 vs 0,263 |
| Qwen3.5-4B | 48x mayor | SAGE gramatica 0,038 vs 0,257; RUBIN 0,259 vs 0,263; regiones 0,018 vs 0,031 |
| Qwen3.5-9B | 108x mayor | SAGE gramatica 0,121 vs 0,257 |
| gemma-4-E4B-it | mayor | SAGE gramatica 0,124 vs 0,257; Characters 0,075 vs 0,177 |

Evolucion entre versiones de la saga:

| Metrica | 1.6 | 1.9 | 1.10 |
|---|---|---|---|
| MERA 2.0 | 0,049 | 0,048 | 0,052 |
| Comas (SAGE) | 0,267 | 0,335 | 0,409 |
| Ortografia (SAGE) | 0,062 | 0,102 | 0,149 |

No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en F16 (~167 MB de pesos mas overhead de contexto y runtime); en la practica cabe en cualquier GPU integrada o incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (RTX 3060, RTX 4090, etc.) lo ejecuta sobradamente, pero no es necesario.
- Cabe en GPU consumer: si, en todas; tambien en telefonos y portatiles de gama baja.
- Opciones de despliegue: llama.cpp (`llama-cli -hf DICPlay/RusMind-Zernyshko-1.10-GGUF -cnv`), LM Studio (buscar "RusMind Zernyshko"), Ollama (`ollama run hf.co/DICPlay/RusMind-Zernyshko-1.10-GGUF`), y Transformers con los pesos safetensors del repo base.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia muy baja en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind Zernyshko 1.10 | 83 M | 1024 | Ruso, tareas culturales y gramatica (MERA/SAGE) | RusMind License (comercial con contrato) | GGUF + safetensors en Hugging Face |
| SmolLM-3B | 3 B | no disponible en la informacion | Multilingue generalista | no disponible en la informacion | Hugging Face |
| Qwen3.5-4B | 4 B | no disponible en la informacion | Multilingue generalista | no disponible en la informacion | Hugging Face |
| RusMind Zernyshko 1.9 | ~83 M (misma familia) | 1024 | Ruso, conversacion general | RusMind License | Hugging Face |

La comparativa directa solo es posible en las tareas MERA 2.0 y SAGE recogidas en la model card; no hay datos publicados de MMLU, HumanEval ni otras metricas estandar para este modelo.

## Limitaciones y advertencias

- Contexto muy limitado: 1024 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo ruso: no soporta otros idiomas de forma fiable.
- Capacidades generales muy reducidas: 83 M de parametros implican conocimiento del mundo y coherencia limitados; el propio autor recomienda la version 1.9 para conversacion.
- Riesgo elevado de alucinacion en preguntas abiertas o factuales fuera de las tareas para las que fue optimizado.
- Sesgos: al estar entrenado desde cero con datos no documentados en la informacion disponible, no se pueden evaluar sesgos especificos; se desconoce la composicion del corpus.
- Licencia restrictiva: uso comercial, reventa, distribucion de versiones modificadas e integracion en productos requieren contrato escrito con DICPlay; el uso personal, no comercial, de investigacion y evaluacion es gratuito.
- Se distribuye "tal cual", sin garantias.
- Las cifras de benchmarks provienen del propio autor y se basan en MERA 2.0 y SAGE; no hay validacion independiente en la informacion disponible.
- No apto para produccion en tareas de alta precision (medicina, legal, finanzas) sin supervision humana.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.10-GGUF
- Repositorio base con safetensors: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.10
- Version anterior recomendada para conversacion: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.9
- Archivo F16: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.10-GGUF/blob/main/RusMind-Zernyshko-1.10-F16.gguf
- Licencia: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.10-GGUF/blob/main/LICENSE
- Contacto del autor (Telegram): https://t.me/DanKirillin
- Contacto del autor (MAX): https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
