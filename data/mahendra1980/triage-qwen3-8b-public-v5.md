# mahendra1980/triage-qwen3-8b-public-v5

## Resumen

`mahendra1980/triage-qwen3-8b-public-v5` es un adaptador LoRA (entrenado con QLoRA de 4 bits) sobre el modelo denso `Qwen/Qwen3-8B` de Alibaba, especializado en una única tarea: emitir un veredicto de triaje de primera pasada (`benign` / `suspicious` / `malicious`) para alertas de un centro de operaciones de seguridad (SOC). Forma parte del componente de triaje del pipeline AEGIS de SOC autónomo, donde el adaptador hace de filtro rápido y un modelo frontal (frontier) actúa como juez final de la decisión.

El interés práctico no está en el modelo base —un transformer decoder-only denso de 8.230 millones de parámetros con 131.072 tokens de contexto— sino en la especialización: el adaptador añade solo 43.646.976 parámetros entrenables (0,53 % del total) y reduce la tarea de triaje a una clasificación de tres clases sobre texto de alerta, con una ventana de entrenamiento de 2.048 tokens. El autor lo publica explícitamente como referencia y no como sistema de veredicto en producción: los datos son sintéticos o de corpus públicos, sin PII ni alertas etiquetadas por analistas reales.

Es relevante ahora porque ejemplifica un patrón habitual en 2025-2026: adaptadores pequeños y baratos (0,2 GB de repositorio) que encapsulan una tarea operativa concreta sobre un modelo abierto con licencia Apache-2.0, desplegables en hardware de consumo y auditables por separado del modelo base. No obstante, el repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que carece de validación externa independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3-8B) + adaptador LoRA de bajo rango |
| Parámetros totales | 8,23 mil millones en el modelo base; 43.646.976 parámetros entrenables en el adaptador (0,53 %) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens en el modelo base; entrenamiento del adaptador con longitud de secuencia 2048 |
| Tipos de cuantización | Entrenamiento en 4 bits NF4 (QLoRA); la inferencia puede usar las cuantizaciones del modelo base (el ejemplo de la model card emplea `load_in_4bit=True`) |
| Idiomas soportados | No disponible para el adaptador; el modelo base Qwen3-8B es multilingüe |
| Licencia | Apache-2.0 (adaptador); sujeta además a la licencia del modelo base |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); repositorio de 0,2 GB |
| Librería | `peft` |
| Tag de pipeline | text-generation (uso real: clasificación de triaje) |
| Configuración LoRA | r=16, alpha=32, módulos q, k, v, o, gate, up, down |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3-8B, un modelo causal denso de 8,23 mil millones de parámetros. El ajuste se realizó con QLoRA de 4 bits NF4 más gradient checkpointing usando Unsloth, con rango r=16 y alpha=32 sobre los módulos de atención (q, k, v, o) y los módulos del MLP (gate, up, down). La ventana de entrenamiento fue de 2.048 tokens, con batch de 2 y 8 pasos de acumulación de gradiente (batch efectivo 16), 2 épocas y tasa de aprendizaje 2e-4. El resultado son 43,6 millones de parámetros entrenables, un 0,53 % de los 8,23 mil millones del base.

El conjunto de datos son 42.174 ejemplos de entrenamiento y 7.826 de validación, descritos por el autor como sintéticos o procedentes de corpus públicos, sin datos de clientes reales, PII ni alertas etiquetadas por analistas. La pérdida final de entrenamiento reportada es 0,234. La innovación técnica es de proceso más que de arquitectura: separar el triaje barato (adaptador local, cuantizado a 4 bits) del juicio final (modelo frontal), de modo que el adaptador nunca emite el veredicto definitivo por sí solo. No se documentan técnicas de decodificación especulativa, atención lineal ni mecanismos híbridos.

## Capacidades

- Clasificación de alertas SOC en tres clases: `benign`, `suspicious`, `malicious`, como primera pasada.
- Robustez frente a inyección de prompts: 9 de 9 casos superados en la suite de evaluación de inyección del autor, sin fugas.
- Triaje de alertas de endpoint (8 de 8 en la suite correspondiente) y de eventos TLS (12 de 13).
- Razonamiento multi-paso acotado dentro del pipeline agéntico AEGIS (10 de 13 en la suite agentic).
- Generación de texto conversacional heredada del modelo base Qwen3-8B (tareas de comprensión, código y matemáticas del base, no evaluadas ni especializadas en este adaptador).
- Capacidad multilingüe heredada del base, sin evaluación específica sobre el adaptador.
- No se documenta soporte explícito de tool calling ni function calling para el adaptador.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- **Primer filtro en la cola de alertas de un SOC**: el adaptador etiqueta cada alerta como benigna, sospechosa o maliciosa y permite ordenar la cola antes de que un analista o un modelo frontal revise el subconjunto corto, reduciendo el volumen de eventos que llegan a revisión humana.
- **Enriquecimiento de tickets de seguridad**: integrado en la plataforma de ticketing, añade un campo de triaje automático a cada incidencia entrante para enrutarla al equipo adecuado (endpoint, red, identidad) según la etiqueta emitida.
- **Detección de inyección de prompts en contenido no confiable**: dado el 9 de 9 de la suite de inyección, puede usarse como capa de saneamiento previa cuando el texto de la alerta (logs, cabeceras, cuerpos de correo) se pasa a un modelo mayor, marcando entradas que intentan manipular al juez.
- **Triaje de telemetría de endpoint**: clasificación de detecciones de EDR antes de escalar, aprovechando el 8 de 8 de la suite de endpoint del autor, como paso previo a la investigación manual.
- **Clasificación de anomalías de red y TLS**: etiquetado de eventos de certificados y tráfico cifrado (12 de 13 en la suite TLS) para separar configuraciones sospechosas de incidentes que requieren análisis profundo.
- **Etiquetado débil para construir datasets**: uso del adaptador como anotador automático de grandes volúmenes de alertas históricas, con revisión humana posterior, para generar corpus de entrenamiento de un modelo mayor o de un futuro adaptador entrenado con datos reales.
- **Despliegue on-premise con requisitos de soberanía de datos**: al ser un adaptador de 0,2 GB sobre un base de 8B cuantizable a 4 bits, puede ejecutarse en hardware local sin enviar telemetría de seguridad a la nube.
- **Prueba de concepto de un SOC autónomo**: validación de la arquitectura de dos niveles (triaje local + juez frontal) descrita en el pipeline AEGIS antes de invertir en datos etiquetados por analistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor reporta únicamente una puerta de evaluación propia sobre conjuntos mantenidos fuera del entrenamiento:

| Suite | Resultado | Nota |
|---|---|---|
| historical | 33 / 37 | 4 fallos; la puerta permite hasta 5 |
| injection | 9 / 9 | 0 fugas de prompt injection |
| agentic | 10 / 13 | seguimiento interno |
| endpoint | 8 / 8 | seguimiento interno |
| tls | 12 / 13 | seguimiento interno |
| Resultado global | PASS | puerta superada |

Los fallos conocidos, según el autor, no degradan ningún caso malicioso a benigno: son deslizamientos de severidad `suspicious → benign` (EVAL-021, AGT-E07, AGT-E10) y subestimaciones `malicious → suspicious` (EVAL-008, AGT-E09, TLS-E04), además de algún falso positivo por sobreclasificación. Estas suites son internas y no comparables con benchmarks públicos.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 5-6 GB con cuantización de 4 bits (8,23 mil millones de parámetros a ~0,5 bytes por parámetro más overhead de activaciones y caché KV); aproximadamente 9 GB en 8 bits; unos 17 GB en fp16, sin contar la caché KV.
- El adaptador en sí ocupa 0,2 GB adicionales sobre el modelo base.
- GPU recomendadas: A100 o H100 para fp16 con contextos largos; RTX 4090 (24 GB) para fp16 con contexto moderado o 4 bits con contexto amplio; RTX 3090 (24 GB) en el mismo escenario.
- Cabe en GPU de consumo: sí, con cuantización de 4 bits en tarjetas de 8 GB o superiores (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). Con contextos cercanos a 131.072 tokens la caché KV desplaza el requisito muy por encima de esos valores.
- Opciones de despliegue: `transformers` + `peft` (patrón documentado en la model card), vLLM con soporte de adaptadores LoRA, TGI y llama.cpp/Ollama fusionando previamente el adaptador en los pesos del base.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.
- Nota: el ejemplo de la model card carga el base directamente en 4 bits con `device_map="auto"`, lo que sugiere despliegue en una sola GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| triage-qwen3-8b-public-v5 | 8,23B base + 43,6M adaptador | 131.072 (base); 2.048 en entrenamiento | Triaje SOC en 3 clases | Apache-2.0 | HuggingFace, 0 descargas, 1 like |
| Qwen/Qwen3-8B | 8,23B densos | 131.072 | Propósito general, multilingüe | Apache-2.0 | HuggingFace, ampliamente distribuido |
| Adaptadores de triaje SOC comparables | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas públicas equivalentes en la información disponible |

No se dispone de datos de rendimiento comparables entre estas opciones: el adaptador no publica métricas en benchmarks estándar y el modelo base no se ha evaluado con las suites internas del autor. Cualquier comparación de calidad en la tarea de triaje requeriría ejecutar ambas variantes sobre el mismo conjunto de alertas etiquetadas.

## Limitaciones y advertencias

- **Entrenado con datos sintéticos o de corpus públicos**: el propio autor advierte que no es un modelo de banco ni un sistema de veredicto en producción. No se usaron datos de clientes, PII ni alertas etiquetadas por analistas.
- **Requiere reentrenamiento antes de producción**: el autor indica explícitamente que debe reentrenarse con alertas reales etiquetadas por analistas antes de cualquier uso productivo.
- **No es un IDS, WAF ni motor de detección**: no sustituye a la detección, la autorización ni el registro; solo etiqueta alertas ya generadas por otros sistemas.
- **Errores de severidad documentados**: existen deslizamientos `suspicious → benign` y `malicious → suspicious` en las suites del autor, lo que implica riesgo de infrapriorizar incidentes reales si se usa sin juez humano o modelo frontal.
- **Riesgo de alucinación**: al ser un modelo generativo usado como clasificador, puede producir etiquetas fuera del conjunto esperado o justificaciones inconsistentes; se recomienda restringir la salida a las tres clases mediante decodificación restringida o validación posterior.
- **Ventana de entrenamiento limitada a 2.048 tokens**: aunque el base soporta 131.072, el adaptador se entrenó con secuencias cortas, por lo que su comportamiento con alertas muy largas no está validado.
- **Idiomas no especificados**: no se documenta en qué idiomas se entrenó el adaptador; el multilingüismo del base no garantiza un triaje correcto en castellano u otros idiomas.
- **Licencia**: Apache-2.0 en el adaptador, pero el uso debe cumplir también la licencia de Qwen3-8B. Ambas permiten uso comercial, aunque la ausencia de datos reales limita la responsabilidad asumible en entornos regulados.
- **Validación externa inexistente**: 0 descargas y 1 like; no hay revisión independiente de los resultados de la puerta de evaluación, que son autoinformados.
- **Dependencia del pipeline AEGIS**: parte del diseño asume un modelo frontal como juez; usar el adaptador como decisor único desvirtúa el propósito declarado.

## Enlaces

- [Modelo en HuggingFace: mahendra1980/triage-qwen3-8b-public-v5](https://huggingface.co/mahendra1980/triage-qwen3-8b-public-v5)
- [Modelo base: Qwen/Qwen3-8B](https://huggingface.co/Qwen/Qwen3-8B)
- [Qwen3-8B en Qualcomm AI Hub](https://aihub.qualcomm.com/models/qwen3_8b)
- [Repositorio de exportación de Qualcomm para Qwen3-8B](https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/qwen3_8b/README.md)
- [Ficha de Qwen3-8B en AI Model Radar](https://aimodelradar.app/models/qwen3-8b)
- [Repositorio de la serie Qwen en GitHub (según resultado de búsqueda)](https://github.com/QwenLM/Qwen3.8)
