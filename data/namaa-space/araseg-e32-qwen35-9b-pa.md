# NAMAA-Space/araseg-e32-qwen35-9b-pa

## Resumen

`araseg-e32-qwen35-9b-pa` es un adaptador LoRA afinado sobre `Qwen/Qwen3.5-9B` por NAMAA-Space para la tarea compartida de segmentación del árabe AraSeg 2026 (ArabicNLP 2026), en su subtarea PA. El modelo resuelve un problema de etiquetado a nivel de palabra (token-classification): emitir probabilidades de frontera de segmentación para cada palabra de un texto en árabe. No es un generador de texto en el sentido habitual, sino un clasificador token a token construido sobre un LLM.

El repositorio contiene un único miembro del ensemble PA del sistema de NAMAA: el autor lo describe como el miembro LLM de un promedio de logits de tres componentes y como el modelo individual con mejor rendimiento en la subtarea PA. Su utilidad fuera de ese contexto es limitada: los pesos se distribuyen como `state_dict` de PyTorch (`best_PA.pt`), no como checkpoint en formato HuggingFace, y el modelo emite probabilidades sin calibrar, por lo que aislado no reproduce ninguna puntuación publicada.

El sistema completo (ensemble, umbral y pesos del combinador) alcanza 94,49 de macro-F1 en el conjunto de práctica y 94,4 de macro-F1 en la evaluación ciega; esas cifras pertenecen al sistema, no a este miembro por separado. El repositorio ocupa 0,1 GB, coherente con que solo se publican los adaptadores y no los aproximadamente 9B parámetros del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-9B) con cabeza de clasificación de tokens para fronteras de segmentación |
| Parametros totales | Aproximadamente 9B en el modelo base; el repositorio distribuye únicamente adaptadores LoRA (0,1 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en bf16 como `state_dict` de PyTorch; no hay versiones GGUF ni cuantizadas publicadas) |
| Idiomas soportados | Árabe (ar) |
| Licencia | Apache 2.0, heredada del modelo base |
| Formato de pesos | PyTorch `state_dict` (`best_PA.pt`); no es un checkpoint en formato HuggingFace, safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B`, un transformer decoder-only de aproximadamente 9B parámetros, y se adapta a una tarea de etiquetado por palabra propia de la subtarea PA de AraSeg 2026. El ajuste se realizó con LoRA de rango 16 y alpha 32 en bf16. La arquitectura completa no se reconstruye con `from_pretrained`: hay que construirla a partir del YAML de configuración del experimento y del modelo base, y después cargar el `state_dict`. Los cinco miembros LoRA del sistema requieren `transformers==5.12.1` para instanciar sus clases base; la pila completa con versiones fijadas está en `requirements-llm.txt` del repositorio de código.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; tampoco se detalla ninguna innovación técnica adicional más allá del uso de LoRA sobre un LLM y su integración en un promedio de logits con umbral de decisión fijado en 0,25. El modelo produce probabilidades de frontera sin calibrar, lo que refuerza que su diseño está pensado para combinarse con otros miembros mediante promedio de logits y no para inferencia directa.

## Capacidades

- Segmentación de texto árabe a nivel de palabra: emite una probabilidad de frontera por palabra, no una salida de texto libre.
- Etiquetado de tokens (`token-classification`) como tarea principal declarada en el pipeline del repositorio.
- Integración en ensemble: funciona como votante dentro de un promedio de logits de tres miembros, con umbral de sistema de 0,25.
- Rendimiento individual destacado en la subtarea PA: el autor lo señala como el modelo único más fuerte en esa subtarea dentro del sistema.
- Cobertura lingüística restringida al árabe (`ar`).
- Soporte de tool calling / function calling: no disponible; no se documenta y no es coherente con una cabeza de clasificación.
- Soporte de agentes o razonamiento multi-paso: no disponible; no se documenta.
- Capacidades de generación de texto, código, matemáticas, visión o audio: no disponibles; no se documentan y quedan fuera del propósito del checkpoint.
- Modo de pensamiento (thinking mode) u otras capacidades especiales: no disponible.

## Casos de uso

- Reproducción del sistema AraSeg 2026: cargar este `state_dict` junto con los otros dos miembros del ensemble y los pesos del combinador para replicar las puntuaciones publicadas de la subtarea PA. Es el uso previsto explícito del repositorio.
- Investigación en segmentación morfológica del árabe: usar las probabilidades por palabra como señal para estudiar dónde se concentran los errores de frontera en distintos registros del árabe.
- Componente de un pipeline mayor de preprocesado árabe: alimentar la salida del ensemble a un analizador morfológico o a un tokenizador que necesite fronteras de palabra fiables antes de la lematización.
- Evaluación comparativa de ensembles: sustituir este miembro por otro modelo y medir el impacto en macro-F1 manteniendo el resto del sistema y el umbral de 0,25.
- Análisis de calibración de probabilidades: al ser salidas sin calibrar, sirve como caso de estudio para técnicas de calibración aplicadas a clasificadores derivados de LLM.
- Experimentación académica en tareas compartidas de ArabicNLP: reutilizar la receta LoRA (r=16, alpha=32, bf16) sobre Qwen3.5-9B como línea base para otras tareas de etiquetado en árabe.
- Verificación fuera de clúster: el propio autor referencia `verify_offcluster.py`, de modo que el checkpoint puede emplearse para comprobar que la reconstrucción de la arquitectura produce resultados equivalentes en otro entorno.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al sistema completo, no a este miembro por separado. El autor advierte expresamente que el modelo aislado no reproduce ninguna puntuación publicada.

| Evaluacion | Metrica | Resultado | Ambito |
|---|---|---|---|
| Practice test (subtarea PA) | macro-F1 | 94,49 | Sistema completo (promedio de logits de 3 miembros) |
| Blind (subtarea PA) | macro-F1 | 94,4 | Sistema completo (promedio de logits de 3 miembros) |

No se han publicado resultados de benchmarks individuales de este miembro en la información disponible.

## Requisitos de hardware

- El repositorio pesa 0,1 GB porque solo incluye adaptadores y el `state_dict`; para inferencia hay que descargar además `Qwen/Qwen3.5-9B`, de modo que el coste real de memoria es el de un modelo de aproximadamente 9B parámetros más la cabeza de clasificación.
- VRAM estimada en bf16 para el modelo base de 9B: del orden de 18-20 GB, cifra orientativa calculada a partir del tamaño del modelo, no confirmada por el autor.
- VRAM estimada con cuantización de 8 bits: alrededor de 10-11 GB; con 4 bits, alrededor de 6-7 GB. Son estimaciones genéricas para un modelo de 9B, no valores publicados para este checkpoint.
- GPU profesionales: A100 (40/80 GB), H100 y L40S son suficientes con holgura para el modelo base en bf16.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar el modelo base en bf16 al límite; una RTX 3090 o 4080 requiere cuantización de 8 o 4 bits.
- El checkpoint no es compatible con cargadores estándar de HuggingFace, por lo que no se puede desplegar directamente con vLLM, TGI, Ollama o llama.cpp sin trabajo previo de conversión; el autor indica que hay que construir la arquitectura desde el YAML del experimento.
- Dependencia de versión: los miembros LoRA necesitan `transformers==5.12.1` para instanciar sus clases base, lo que condiciona el entorno de despliegue.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han proporcionado datos de modelos comparables en la información disponible. El repositorio forma parte de la colección `NAMAA-Space/araseg-2026`, que agrupa los miembros del sistema, pero no se detallan los nombres, tamaños ni métricas individuales del resto de integrantes, más allá de que el ensemble PA combina tres miembros y que este es el componente LLM.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `araseg-e32-qwen35-9b-pa` | ~9B (base) + LoRA | no disponible | Sin métrica individual publicada | Apache 2.0 | Pesos como `state_dict` en HuggingFace |
| Resto de miembros del ensemble PA | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un segmentador autónomo: es un votante dentro de un ensemble. Usado solo, no reproduce ninguna puntuación publicada.
- Las probabilidades de frontera que emite están sin calibrar; no deben interpretarse como confianzas utilizables directamente sin post-procesado.
- El umbral de decisión del sistema (0,25) pertenece al combinador, no al modelo; sin los pesos del combinador la salida no es interpretable como segmentación final.
- Los pesos son un `state_dict` de PyTorch, no un checkpoint en formato HuggingFace: `from_pretrained` no funciona y hay que reconstruir la arquitectura desde el YAML del experimento.
- Dependencia estricta de `transformers==5.12.1` para los miembros LoRA, lo que puede entrar en conflicto con otros entornos de producción.
- Cobertura lingüística limitada al árabe; no hay soporte documentado de otros idiomas.
- El modelo está especializado en una única tarea (subtarea PA de AraSeg 2026); no se documentan capacidades generativas, de razonamiento, de código ni multimodales.
- Sesgos conocidos: no disponibles. No se documenta ningún análisis de sesgo, y el rendimiento en variedades dialectales del árabe distintas de las del corpus de la tarea no está caracterizado.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de fronteras de segmentación incorrectas con alta confianza aparente, especialmente fuera de la distribución del corpus de entrenamiento.
- Licencia Apache 2.0 heredada del modelo base, lo que permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento fuera del sistema completo ni sobre el cumplimiento de las condiciones de la tarea compartida.
- Repositorio sin descargas ni valoraciones y sin métricas individuales publicadas: no hay validación externa independiente de este checkpoint concreto.
- El tamaño del repositorio (0,1 GB) implica que no se puede servir sin descargar aparte el modelo base de 9B.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/NAMAA-Space/araseg-e32-qwen35-9b-pa
- Colección del sistema AraSeg 2026: https://huggingface.co/collections/NAMAA-Space/namaa-community-araseg-2026
- Repositorio de código, configuraciones y mapa de miembros: https://github.com/NAMAA-ORG/NAMAA-Community-AraSeg-2026
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Cita del sistema: NAMAA Community, "NAMAA at Arabic Segmentation Shared Task 2026", Proceedings of ArabicNLP 2026
