# ronith128/969M-Decisions-CPU

## Resumen

969M-Decisions-CPU es un motor de decisión tipada de 969 millones de parámetros, adaptado de forma independiente a partir de LiquidAI/LFM2.5-1.2B-Instruct y empaquetado para CPU con OpenVINO en INT8. No es un modelo generativo: puntúa una lista de opciones proporcionada por el usuario en una sola pasada hacia delante y devuelve una preferencia condicional, en lugar de redactar una respuesta token a token.

La arquitectura conserva 16 bloques híbridos (10 de convolución y 6 de atención), anchura oculta 2048 y una red feed-forward de 6144 tras poda estructurada. El clasificador utiliza la última representación activa de la secuencia y 26 filas del vocabulario preentrenado (A-Z), sin readout generativo de vocabulario completo. La longitud de entrada cualificada es de 512 tokens; existe una variante experimental de hasta 4096 tokens cuya precisión no está establecida.

Es relevante para despliegues locales sin GPU porque ofrece decisiones de baja latencia en CPU (42-44 ms en caliente para el bucket de 128 tokens) y un servicio JSON-lines. Sus ámbitos documentados son inglés, clasificación de elección, sí/no y puntuación ordinal con 2-26 opciones, con licencia LFM Open License 1.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con 16 bloques (10 convolución, 6 atención), anchura oculta 2048 y FFN de 6144 tras poda estructurada |
| Parámetros totales | 969M |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens de entrada cualificados; hasta 4096 tokens en variante experimental, con precisión no establecida |
| Tipos de cuantización | INT8 (PTQ de activaciones y pesos) en OpenVINO; el hint de ejecución BF16 no elimina la cuantización INT8 |
| Idiomas soportados | en (inglés) |
| Licencia | lfm-open-license-1.0 (other) |
| Formato de pesos | OpenVINO IR INT8: model.xml + model.bin; no se distribuyen safetensors ni GGUF |
| Modelo base | LiquidAI/LFM2.5-1.2B-Instruct |
| Librería | openvino |

## Arquitectura y entrenamiento

El modelo es un derivado modificado de LFM2.5-1.2B-Instruct, no un backbone preentrenado desde cero. Mantiene 16 bloques híbridos, con 10 bloques convolucionales y 6 de atención, anchura oculta 2048 y una FFN de 6144 después de una poda estructurada. El autor documenta adaptación de atención no causal, ajustes convolucionales, entrenamiento supervisado de decisión y razonamiento, y un fine-tuning DoRA de rango 32 que ya está fusionado en los pesos distribuidos. El clasificador emplea la última representación activa de la secuencia y 26 filas del vocabulario preentrenado (A-Z), sin readout generativo de vocabulario completo.

El linaje de entrenamiento incluye los pesos originales de LFM2.5, poda estructurada de la FFN con destilación y una continuación final con DoRA sobre 35.552 registros únicos, 2 épocas, 8.888 actualizaciones del optimizador y 71.104 exposiciones de ejemplos. La composición documentada incluye ejemplos estructurados de decisión tipada, variantes sintéticas o de profesor y replay de familias de tareas nativas. No se publica el número total de tokens de entrenamiento ni se documenta RLHF o DPO. La cuantización INT8 de OpenVINO se aplicó como post-training quantization de activaciones y pesos, con 128 registros de calibración seleccionados de forma determinista y solo del conjunto de entrenamiento.

## Capacidades

- Decisión tipada en una sola pasada: tipos `choice`, `noul` (sí/no) y `score` (categorías ordinales ordenadas), con 2-26 opciones.
- Puntuación de opciones suministradas por el usuario; devuelve probabilidades condicionales no calibradas, no texto libre.
- Clasificación de texto en inglés para intenciones, temas, pasos siguientes y categorías predefinidas.
- Soporte de tool calling / function calling: no.
- Soporte de agentes y razonamiento multi-paso: no; el modelo no orquesta herramientas ni mantiene planes.
- Capacidades multilingües: no; solo inglés documentado.
- Capacidad especial: servicio local JSON-lines y soporte experimental de shapes de 1024/2048/4096 tokens, sin calidad cualificada.
- No genera respuestas en lenguaje natural ni dispone de readout de vocabulario completo.

## Casos de uso

- Triaje de tickets de soporte: recibe el texto del ticket y una lista de 2-26 acciones posibles; devuelve la opción preferida en una sola pasada. Es adecuado para colas de alto volumen porque el diagnóstico de 2.000 casos mide 96,06 ms de mediana y 117,11 ms p95 en CPU de 16 núcleos.
- Enrutamiento de consultas bancarias: con 94,80 % en Banking77 adaptado a 10 clases, puede actuar como primera etapa de clasificación antes de un agente o de un revisor humano.
- Clasificación de intenciones: con 96,37 % en CLINC150 de 15 clases dentro de dominio, sirve para dirigir consultas a flujos predefinidos sin generar respuestas.
- Verificación de hipótesis NLI: con 86,30 % en SNLI y 80,80 % en MNLI, puede comprobar si una afirmación se sigue de un contexto; los casos límite deben derivarse a revisión.
- Preguntas de sí/no: con 80,80 % en BoolQ, encaja en filtros de elegibilidad o comprobaciones binarias donde la latencia importa.
- Validación de reglas ejecutables: con 99,10 % en reglas ejecutables y 74,20 % en familias no vistas, es útil como prevalidación; las familias nuevas deben auditarse antes de automatizar la decisión.
- Puntuación ordinal de riesgo: el tipo `score` admite 2-26 categorías ordenadas para priorizar casos, pero las probabilidades no están calibradas y requieren umbrales ajustados por dominio.
- Servicio local en entornos aislados: el servicio JSON-lines funciona con OpenVINO en CPU, sin GPU ni endpoint HTTP, y permite auditar truncamiento de entrada en un proceso local.

## Benchmarks y rendimiento

Los siguientes resultados son diagnósticos por slices del grafo INT8 distribuido. Los slices se solapan y no se agregan.

| Tarea o diagnóstico | Correctos/total | Precisión |
|---|---:|---:|
| Decisiones tipadas: test diagnóstico publicado | 1.516/2.000 | 75,80 % |
| Decisiones tipadas: validación | 459/600 | 76,50 % |
| CLINC150: 15 clases dentro de dominio | 2.867/2.975 | 96,37 % |
| Banking77: adaptado a 10 clases | 237/250 | 94,80 % |
| SNLI | 863/1.000 | 86,30 % |
| MNLI | 202/250 | 80,80 % |
| BoolQ | 202/250 | 80,80 % |
| Reglas ejecutables | 991/1.000 | 99,10 % |
| Familias de reglas no vistas y congeladas | 371/500 | 74,20 % |

| Medición de latencia | Valor |
|---|---|
| Bucket de 128 tokens, en caliente | 42-44 ms |
| Diagnóstico de 2.000 casos, mediana | 96,06 ms |
| Diagnóstico de 2.000 casos, p95 | 117,11 ms |
| Hardware | Ryzen 9 7950X, 16 núcleos físicos, batch 1 |

La latencia de 96,06 ms de mediana incluye tokenización, inferencia y decodificación; excluye carga y compilación. No se publican resultados de MMLU, HumanEval o GSM8K en la información disponible. El throughput no está publicado.

## Requisitos de hardware

- VRAM: no aplica en la ruta CPU; el grafo OpenVINO INT8 ocupa aproximadamente 973 MB. No se documenta una ruta GPU.
- RAM: el artefacto pesa unos 973 MB y el repositorio completo 1,0 GB; hay que añadir la memoria del runtime de OpenVINO, el tokenizador y los buffers. No se publica un mínimo oficial.
- GPU recomendadas: ninguna; el modelo es CPU-first y el rendimiento publicado usa un Ryzen 9 7950X de 16 núcleos físicos.
- GPU de consumo: no aplica; no se documenta despliegue en GPU de consumo.
- Despliegue: OpenVINO Runtime con `runtime.py`; servicio JSON-lines con `serve_lfm_cpu.py`; variante experimental con `serve_lfm_cpu_extended.py`. No es compatible con vLLM, llama.cpp, Ollama o TGI.
- Latencia: 42-44 ms en caliente para el bucket de 128 tokens; 96,06 ms de mediana y 117,11 ms p95 en el diagnóstico de 2.000 casos, batch 1, incluyendo tokenización, inferencia y decodificación.
- Throughput: no publicado. Los shapes largos pueden provocar compilación en frío y aumentar la latencia; no deben tratarse como un SLA de producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| 969M-Decisions-CPU | 969M | 512 tokens cualificados; 4096 experimental | 75,80 % en test diagnóstico de decisiones tipadas; 96,37 % en CLINC150; 94,80 % en Banking77 10-way | LFM Open License 1.0 | HuggingFace; OpenVINO INT8 para CPU |
| LiquidAI/LFM2.5-1.2B-Instruct | 1,2B | no disponible | no disponible | LFM Open License 1.0, según el enlace de licencia del autor | HuggingFace |
| Microsoft-Decision-1 | no disponible | no disponible | 83,5 % de precisión y 0,042 USD/M tokens según la búsqueda; 35 veces más rápido que GPT-6 Sol, no verificado de forma independiente | Propietaria | Microsoft Foundry |

No se identifican alternativas open source con parámetros y benchmarks comparables en la información disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no redacta respuestas, no mantiene conversaciones y no puede usarse como chatbot sin una capa externa que convierta las decisiones en texto.
- Solo inglés documentado; no hay soporte multilingüe declarado.
- La ventana cualificada es de 512 tokens. La variante de 1024/2048/4096 tokens existe, pero la precisión en entradas largas no se ha establecido y puede aumentar la latencia y la compilación en frío.
- Las probabilidades son preferencias condicionales no calibradas; no deben interpretarse como probabilidades de confianza sin calibración por dominio.
- El rendimiento es desigual: 75,80 % en el test diagnóstico de decisiones tipadas y 74,20 % en familias de reglas no vistas; no es un SLA de producción.
- Los slices de benchmark se solapan y no se agregan; no hay resultados publicados de MMLU, HumanEval o GSM8K.
- No se publican evaluaciones de sesgo, toxicidad o robustez adversarial; pueden persistir sesgos del modelo base LFM2.5.
- Riesgo de alucinación: no hay generación de texto, pero el modelo puede elegir una opción incorrecta con alta preferencia; la auditoría de truncamiento es necesaria.
- Licencia LFM Open License 1.0: hay que revisar permisos comerciales y obligaciones de atribución o avisos. El autor indica que es un derivado no afiliado a Liquid AI.
- El servicio incluido es JSON-lines local, no un endpoint HTTP; requiere integración operativa y monitorización de `input_audit`.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/ronith128/969M-Decisions-CPU)
- [Modelo base LiquidAI/LFM2.5-1.2B-Instruct](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct)
- [Licencia LFM Open License 1.0](https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/LICENSE)
- [Microsoft-Decision-1 en Microsoft Foundry](https://commandline.microsoft.com/microsoft-decision-1-model-foundry/)
- [Rankings de modelos de decisión en OpenRouter](https://openrouter.ai/rankings/decisions)
- [Artículo sobre Microsoft Decision-1 y latencia](https://tech-insider.org/microsoft-decision-1-ai-model-35x-speed-2026/)
- [Guía de modelos locales para CPU](https://www.propelrc.com/best-local-ai-model-for-cpu/)
