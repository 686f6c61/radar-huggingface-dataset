# danielohayon/granite-4.2-8b-art-classify-lora

## Resumen

`danielohayon/granite-4.2-8b-art-classify-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario danielohayon sobre el modelo base `ibm-granite/granite-4.2-8b` de IBM. El adaptador está especializado en una tarea concreta de ciberseguridad: dada una secuencia de comandos o acciones observadas en un sistema, predecir la técnica MITRE ATT&CK correspondiente (identificador y nombre) mediante razonamiento en cadena de pensamiento (chain-of-thought). El modelo base aporta la arquitectura y el conocimiento general; el adaptador añade la especialización de dominio.

El adaptador es relevante como ejemplo de ajuste fino eficiente (PEFT) aplicado a un dominio vertical de seguridad, y porque su autor publica una comparación controlada con otras dos variantes (aLoRA y shadow-residual) bajo la misma receta de entrenamiento, con resultados medidos sobre un benchmark propio de 147 ejemplos y 97 técnicas distintas. Esto permite evaluar el rendimiento del ajuste fino frente al modelo base sin adaptar.

Se trata de un adaptador de investigación, no de un sistema de detección en producción. El modelo base es un transformer de 8 mil millones de parámetros de la familia Granite 4.2 de IBM; los detalles completos de arquitectura, contexto y entrenamiento del base no se detallan en la información disponible y deben consultarse en su model card original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (base: ibm-granite/granite-4.2-8b) |
| Parametros totales | No disponible para el adaptador; el modelo base es de 8B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (longitud maxima de secuencia usada en entrenamiento: 12228 tokens) |
| Tipos de cuantizacion | No disponible (el adaptador se entrena en bf16; el base admite las cuantizaciones soportadas por transformers/peft) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA estándar con rango r=16 y alpha=32, aplicado sobre todas las capas lineales de atención y MLP del modelo base `ibm-granite/granite-4.2-8b`. Se entrenó durante 10 épocas con learning rate 4e-5, schedule coseno con 0.1 de warmup, weight decay 0.01, NEFTune con valor 5, batch efectivo de 24, longitud máxima de secuencia de 12228 tokens y precisión bf16. El mejor checkpoint se seleccionó por precisión de crédito parcial en validación sobre el benchmark propio.

La tarea de entrenamiento es de clasificación de técnicas MITRE ATT&CK a partir de trazas de comandos, con generación de razonamiento en cadena de pensamiento antes de la etiqueta. El autor advierte que la comparación entre las tres variantes (LoRA, aLoRA y shadow-residual) es a nivel de receta, no aislada por arquitectura ni igualada por learning rate: cada método usa su propio learning rate por defecto (4e-5 para LoRA y aLoRA, 2e-4 para shadow-residual) y su propio rango. El dataset de evaluación es `danielohayon/art-mitre-classify-eval`.

## Capacidades

- Clasificación de técnicas MITRE ATT&CK (identificador y nombre) a partir de conjuntos de comandos o acciones observadas.
- Razonamiento en cadena de pensamiento antes de emitir la etiqueta de clasificación.
- Generación de texto conversacional heredada del modelo base Granite 4.2 8B.
- Uso en inglés exclusivamente (idioma declarado: en).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.
- No se documenta un modo de pensamiento explícito más allá del chain-of-thought usado en la tarea de clasificación.

## Casos de uso

- Triaje de alertas de seguridad: dado un conjunto de comandos capturados en un endpoint, el adaptador predice la técnica ATT&CK asociada para enriquecer la alerta y priorizar la respuesta del analista SOC.
- Etiquetado de datasets de threat hunting: uso del adaptador para pre-anotar trazas de comandos con técnicas ATT&CK y acelerar la construcción de corpus etiquetados, con revisión humana posterior.
- Enriquecimiento de informes de incidentes: mapear las acciones observadas en un incidente a técnicas ATT&CK para generar automáticamente la sección de TTPs del informe, aprovechando el razonamiento en cadena de pensamiento para justificar la etiqueta.
- Evaluación de reglas de detección: comprobar si las trazas que disparan una regla se corresponden con la técnica ATT&CK esperada, usando el adaptador como clasificador auxiliar en pruebas de calidad de detecciones.
- Investigación sobre ajuste fino en dominios de seguridad: servir como referencia reproducible (receta, datos y benchmark publicados) para estudiar el efecto de LoRA frente a otras variantes PEFT en tareas de clasificación de técnicas.
- Formación y simulación: clasificar trazas de ejercicios de red team o de laboratorio para verificar qué técnicas ATT&CK se han ejecutado realmente durante una simulación.

## Benchmarks y rendimiento

Resultados sobre el benchmark ART MITRE classify (147 ejemplos, 97 técnicas distintas), decodificación greedy, precisión de crédito parcial y exact-match:

| Modelo | Precision credito parcial | Precision exact-match |
|---|---|---|
| Base (ibm-granite/granite-4.2-8b) | 0.048 | 0.034 |
| + LoRA (este adaptador) | 0.415 | 0.401 |
| + aLoRA | 0.483 | 0.442 |
| + shadow-residual | 0.531 | 0.503 |

El adaptador LoRA multiplica por aproximadamente 8.6 la precisión de crédito parcial respecto al modelo base (0.415 frente a 0.048) y por aproximadamente 11.8 la precisión exact-match (0.401 frente a 0.034). Queda por debajo de las variantes aLoRA y shadow-residual del mismo autor en esta receta.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa 0.1 GB; el modelo base de 8B en bf16 requiere aproximadamente 16 GB de VRAM, más overhead de activaciones y caché KV.
- En cuantización de 4 bits (no documentada específicamente para este adaptador, pero habitual en el base), el modelo base puede caber en GPUs consumer de 8-12 GB.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue en bf16 con contexto largo; RTX 4090 (24 GB) para bf16 en una sola GPU; RTX 3090/4080 para cuantización.
- Cabe en GPU consumer: sí, en cuantización 4 bits en GPUs de 8 GB o más; en bf16 requiere 24 GB o más.
- Opciones de despliegue: transformers + peft (verificado por el autor); vLLM, TGI y llama.cpp no están documentados para este adaptador en la información disponible, y su compatibilidad dependería de la fusión previa del adaptador con el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros base | Contexto | Precisión (crédito parcial) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| granite-4.2-8b-art-classify-lora | 8B (base) | No disponible | 0.415 | Apache 2.0 | Hugging Face |
| granite-4.2-8b-art-classify-alora | 8B (base) | No disponible | 0.483 | No disponible | Hugging Face |
| granite-4.2-8b-art-classify-shadow-residual | 8B (base) | No disponible | 0.531 | No disponible | Hugging Face |
| ibm-granite/granite-4.2-8b (base) | 8B | No disponible | 0.048 | No disponible | Hugging Face |

Las tres variantes comparten modelo base, datos y receta de 10 épocas, pero no están igualadas por learning rate ni por rango, por lo que la comparación es a nivel de receta.

## Limitaciones y advertencias

- No es un sistema de detección en producción: el autor lo declara explícitamente como herramienta de investigación sobre ajuste fino en dominio de seguridad.
- Solo predice la etiqueta ATT&CK de trazas ya recogidas; no detecta actividad maliciosa por sí mismo ni monitoriza sistemas.
- Solo soporta inglés.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre un benchmark de 147 ejemplos y 97 técnicas, el rendimiento puede degradarse en técnicas poco representadas o ausentes del conjunto de entrenamiento.
- Riesgo de alucinación: el razonamiento en cadena de pensamiento puede producir justificaciones plausibles pero incorrectas; la etiqueta final debe validarse.
- Restricciones de licencia: Apache 2.0 permite uso comercial del adaptador, pero deben respetarse las condiciones de la licencia del modelo base `ibm-granite/granite-4.2-8b`.
- La comparación con aLoRA y shadow-residual no está aislada por arquitectura ni igualada por learning rate, por lo que las diferencias de rendimiento no deben atribuirse únicamente al método.
- No hay datos publicados sobre latencia, throughput ni comportamiento en despliegues de producción.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/danielohayon/granite-4.2-8b-art-classify-lora
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- Dataset de evaluación: https://huggingface.co/datasets/danielohayon/art-mitre-classify-eval
- Variante aLoRA: https://huggingface.co/danielohayon/granite-4.2-8b-art-classify-alora
- Variante shadow-residual: https://huggingface.co/danielohayon/granite-4.2-8b-art-classify-shadow-residual
- MITRE ATT&CK: https://attack.mitre.org/
