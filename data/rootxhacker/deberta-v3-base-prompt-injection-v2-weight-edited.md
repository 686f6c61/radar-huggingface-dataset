# rootxhacker/deberta-v3-base-prompt-injection-v2-weight-edited

## Resumen

`rootxhacker/deberta-v3-base-prompt-injection-v2-weight-edited` es una variante del clasificador de inyección de prompts de ProtectAI, modificada manualmente mediante edición de pesos en el espacio de pesos (weight-space editing) sin reentrenamiento ni fine-tuning. El autor, rootxhacker, altera 15.363 de los 184 millones de parámetros del modelo base aplicando estadísticas simples, siguiendo la idea de "Weight-Space Programming". El objetivo es recuperar información discriminativa entre ataques y mensajes legítimos que el modelo original pierde en las últimas capas.

El modelo resuelve una tarea concreta: clasificación binaria de texto entre `SAFE` e `INJECTION` en inglés, orientada a la detección de prompt injection en aplicaciones LLM. La relevancia radica en que demuestra que la edición quirúrgica de pesos puede mejorar métricas de seguridad sin coste de entrenamiento, aunque con ganancias limitadas fuera de la distribución de datos usada para diseñar la edición.

Arquitectura DeBERTa-v3-base (transformer encoder, 184,4 M de parámetros, contexto típico de 512 tokens) con licencia Apache 2.0. Es un experimento de investigación, no un modelo listo para producción sin validación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-base (transformer encoder) |
| Parámetros totales | 184.423.682 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base, típicamente 512 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es DeBERTa-v3-base, un transformer encoder con atención disentangled y embedding de posiciones relativas. Esta variante no ha sido entrenada ni afinada: parte de los pesos de `protectai/deberta-v3-base-prompt-injection-v2` y modifica 15.363 pesos mediante estadísticas simples derivadas de 13 fuentes de datos. La edición añade cuatro unidades pequeñas en la última capa que leen la información discriminativa antes de que se pierda y la conectan a la salida final, además de reducir la propensión del modelo a predecir `INJECTION`. Los detalles técnicos están en `wsp_edit.json` del repositorio.

No hay RLHF, DPO ni entrenamiento supervisado en esta variante. La innovación es metodológica: programación en el espacio de pesos para inyectar comportamiento sin gradientes.

## Capacidades

- Clasificación binaria de texto: etiquetas `SAFE` e `INJECTION`.
- Detección de prompt injection en inglés, incluyendo instrucciones de anulación ("ignore all previous instructions").
- Discriminación entre usos legítimos de palabras como "ignore" y ataques reales.
- Integración directa con `transformers` mediante `pipeline("text-classification")`.
- No soporta generación de texto, tool calling, agentes, visión ni audio.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Filtro de entrada en aplicaciones LLM: clasificar cada mensaje de usuario antes de enviarlo al modelo generativo y bloquear los marcados como `INJECTION`, reduciendo la superficie de ataque en chatbots y asistentes.
- Moderación de correos y mensajes: el modelo fue editado principalmente con datos de ataques en correos, por lo que es adecuado para detectar intentos de inyección en comunicaciones textuales.
- Guardrail en pipelines RAG: validar las consultas del usuario antes de recuperar documentos, evitando que instrucciones maliciosas manipulen el contexto recuperado.
- Evaluación de red teaming: usar el clasificador como detector de referencia al probar la robustez de sistemas LLM frente a jailbreaks e inyecciones.
- Investigación en seguridad de LLM: servir como caso de estudio reproducible de edición de pesos para mejorar clasificadores de seguridad sin reentrenamiento.
- Pre-filtrado de bajo coste: al ser un encoder de 184 M de parámetros, puede ejecutarse en CPU o GPU modesta como primera capa de defensa antes de modelos más caros.

## Benchmarks y rendimiento

Datos publicados por el autor, umbral de corte 0,5:

| Conjunto | Métrica | Modelo original | Este modelo |
|---|---|---|---|
| 13 fuentes usadas para la edición (14.755 mensajes) | Ataques detectados (de 3.626) | 2.333 (64,3 %) | 3.198 (88,2 %) |
| 13 fuentes usadas para la edición (14.755 mensajes) | Falsos positivos (de 11.129) | 253 (2,3 %) | 202 (1,8 %) |
| 7 fuentes no vistas (9.119 mensajes) | Ataques detectados (de 4.120) | 2.731 (66,3 %) | 2.763 (67,1 %) |
| 7 fuentes no vistas (9.119 mensajes) | Falsos positivos (de 4.999) | 90 (1,8 %) | 78 (1,6 %) |

En jailbreaks in-the-wild el autor reporta un descenso del 68,4 % al 65,8 % de ataques detectados.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,75 GB; en fp16: aproximadamente 0,4 GB.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y en CPU.
- Despliegue mediante `transformers` pipeline; compatible con ONNX Runtime y TorchScript si se exporta.
- No se han publicado datos de latencia ni throughput.
- Al ser un encoder de 184 M de parámetros, la inferencia es de baja latencia en hardware modesto, adecuada para filtrado en línea.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rootxhacker/deberta-v3-base-prompt-injection-v2-weight-edited | 184,4 M | no disponible | Clasificación prompt injection | apache-2.0 | Hugging Face |
| protectai/deberta-v3-base-prompt-injection-v2 | 184 M (aprox.) | no disponible | Clasificación prompt injection | apache-2.0 | Hugging Face |
| protectai/deberta-v3-base-prompt-injection | 184 M (aprox.) | no disponible | Clasificación prompt injection | apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros detectores de prompt injection en la información proporcionada.

## Limitaciones y advertencias

- La mejora sobre datos no vistos es pequeña (67,1 % frente a 66,3 % en ataques detectados).
- La mayor parte de la mejora proviene de los tipos de datos usados para construir la edición, principalmente correos de ataque.
- Algunas fuentes empeoran: los jailbreaks in-the-wild bajan del 68,4 % al 65,8 %.
- No se ha comparado con fine-tuning convencional sobre los mismos datos.
- Es un experimento de investigación; el autor recomienda probarlo con datos propios antes de usarlo en entornos importantes.
- Solo inglés; no cubre otros idiomas.
- Riesgo de falsos negativos y falsos positivos inherente a un clasificador binario con umbral fijo de 0,5.
- Licencia Apache 2.0 permite uso comercial, pero sin garantías de robustez en producción.
- Sin datos publicados sobre sesgos específicos más allá de los derivados del corpus de entrenamiento del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/rootxhacker/deberta-v3-base-prompt-injection-v2-weight-edited
- Modelo base: https://huggingface.co/protectai/deberta-v3-base-prompt-injection-v2
- Write-up: https://harishsg993010.github.io/weight-space-editing/
- Código y resultados: https://github.com/harishsg993010/weight-space-editing
- Blog sobre Weight-Space Programming: https://rikiyat.github.io/blog/weight-space-programming/
