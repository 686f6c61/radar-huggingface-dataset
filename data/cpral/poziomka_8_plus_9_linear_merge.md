# cpral/poziomka_8_plus_9_linear_merge

## Resumen

`cpral/poziomka_8_plus_9_linear_merge` es un modelo de generación de texto en polaco publicado por el usuario cpral en HuggingFace. Se trata de una fusión lineal (*linear merge*, es decir, una combinación ponderada de pesos) de dos modelos previos de la misma familia, Poziomka 8 y Poziomka 9. El resultado es un checkpoint único de 4.119.797.632 parámetros (aproximadamente 4,12 mil millones) que conserva el pipeline `text-generation` y la etiqueta `conversational`.

El interés técnico del modelo es limitado pero concreto: permite evaluar el efecto de interpolar los pesos de dos versiones de una misma familia sin reentrenamiento, un procedimiento habitual para recuperar capacidades perdidas tras un ajuste fino o para suavizar el comportamiento entre dos checkpoints. La model card pública es mínima (solo licencia, idioma y pipeline), sin información sobre datos de entrenamiento, ventana de contexto ni resultados de evaluación.

La arquitectura declarada en los metadatos es `bailing_moe` con `custom_code`, lo que implica que la carga del modelo requiere ejecutar código Python personalizado incluido en el repositorio (`trust_remote_code=True`). El repositorio ocupa 8,2 GB, un tamaño coherente con pesos en precisión de 16 bits para 4,12 mil millones de parámetros. La licencia es Apache 2.0 y el único idioma declarado es el polaco (`pl`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `bailing_moe` (mezcla de expertos, requiere `custom_code`) |
| Parámetros totales | 4.119.797.632 (4,12 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se documentan versiones GGUF, AWQ ni GPTQ en la información proporcionada) |
| Idiomas soportados | polaco (`pl`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código personalizado; el repo ocupa 8,2 GB) |

## Arquitectura y entrenamiento

La etiqueta de arquitectura es `bailing_moe`, correspondiente a la familia de modelos de mezcla de expertos (MoE) de tipo transformer disperso. No se dispone de información sobre el número de expertos, el número de expertos activos por token, la dimensión oculta, el número de capas ni el mecanismo de atención empleado. Tampoco se documenta la longitud de contexto nativa ni si se usan técnicas de atención lineal o decodificación especulativa.

El proceso de creación no es un entrenamiento, sino una fusión lineal de pesos: el autor combina los tensores de `Poziomka 8` y `Poziomka 9` mediante una interpolación ponderada. No se especifican los coeficientes de mezcla, si la fusión se aplicó capa por capa, si hubo normalización posterior de los tensores ni si se preservaron íntegramente las componentes de los expertos. Tampoco hay datos sobre el corpus de entrenamiento de los modelos de origen (número de tokens, composición, uso de RLHF/DPO o ajuste conversacional). Al ser una media de pesos, el modelo hereda los sesgos y limitaciones de ambos checkpoints originales.

## Capacidades

- Generación de texto en polaco, tarea declarada en el `pipeline_tag`.
- Uso conversacional (`conversational`), orientado a diálogo multi-turno.
- Herencia de las capacidades de los dos checkpoints fusionados (Poziomka 8 y Poziomka 9), no documentadas individualmente en la información disponible.
- Soporte de *tool calling* / *function calling*: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al polaco según el campo `language`; no se declaran otros idiomas.
- Capacidades especiales (modo *thinking*, visión, audio): no disponible.

## Casos de uso

- Atención al cliente en polaco: el modelo puede gestionar diálogos multi-turno gracias a su naturaleza conversacional. Antes de producción conviene medir empíricamente la longitud de contexto real, ya que no está documentada.
- Prototipado rápido de asistentes conversacionales en polaco: al ocupar 8,2 GB en 16 bits y existir en un único checkpoint, permite levantar un servicio de pruebas con una sola GPU consumer de gama alta.
- Experimentación en fusión de modelos: sirve como caso de estudio reproducible para investigar cómo afecta la interpolación lineal de pesos al comportamiento de una familia de modelos (comparando contra Poziomka 8 y Poziomka 9 por separado).
- Generación de borradores de texto administrativo o comercial en polaco: redacción asistida de correos, descripciones de producto y respuestas tipo, con revisión humana posterior.
- Preprocesado y aumento de datos para PLN (procesamiento de lenguaje natural) en polaco: generación de paráfrasis o de ejemplos sintéticos para aumentar corpus de entrenamiento de clasificadores más pequeños.
- Base para ajuste fino específico de dominio: al ser Apache 2.0 y tener 4,12 B de parámetros, es viable hacer *fine-tuning* con LoRA en una GPU de 24 GB para un vertical concreto (legal, sanitario, e-commerce).
- Evaluación comparativa interna: incluirlo como *baseline* en pruebas A/B frente a otros modelos polacos para decidir qué checkpoint desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluaciones en polaco (por ejemplo, KLEJ o Polish LLM benchmarks), y tampoco se aportan comparaciones con los modelos de origen.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 4,12 B de parámetros, no de mediciones publicadas):
  - BF16/FP16: ~8,2 GB de pesos, más KV cache y overhead del runtime; en la práctica, 10-12 GB.
  - INT8: ~4,1 GB de pesos; en torno a 6-8 GB con overhead.
  - INT4 (si se generan cuantizaciones propias): ~2,3-2,6 GB de pesos; en torno a 4-5 GB con overhead.
- Al ser una arquitectura MoE, es previsible que haya que cargar todos los expertos en memoria aunque solo se activen unos pocos por token; por tanto, la VRAM depende del total de parámetros, no de los activos.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16 con contexto moderado; A100 40/80 GB, H100 o L40S para servir con concurrencia alta y contextos largos.
- ¿Cabe en GPU consumer? Sí: en FP16 cabe en tarjetas de 16 GB o más (RTX 4080/4090, RTX A4000 16 GB); en cuantización INT4 podría encajar en 8 GB, aunque con contexto reducido.
- Opciones de despliegue: al requerir `custom_code`, las opciones están restringidas. `transformers` con `trust_remote_code=True` es la vía directa. `vLLM` y `TGI` solo funcionarán si soportan la arquitectura `bailing_moe` o si se añade un adaptador; `llama.cpp`/`Ollama` requieren una conversión a GGUF que no está publicada. No se debe asumir compatibilidad sin verificarla.
- Latencia y throughput: no disponible (no hay mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `cpral/poziomka_8_plus_9_linear_merge` | 4,12 B | no disponible | Apache 2.0 | HuggingFace, safetensors + custom_code | Fusión lineal de dos checkpoints |
| Poziomka 8 (modelo de origen) | no disponible | no disponible | no disponible | referenciado en la model card | Componente de la mezcla |
| Poziomka 9 (modelo de origen) | no disponible | no disponible | no disponible | referenciado en la model card | Componente de la mezcla |

No se dispone de datos de benchmarks ni de especificaciones de los modelos de origen, por lo que no es posible una comparación cuantitativa con alternativas de la misma categoría (modelos polacos de ~4 B de parámetros). Se indica por tanto "no disponible" en los campos de rendimiento.

## Limitaciones y advertencias

- Idiomas: solo se declara polaco. El uso en castellano, inglés u otros idiomas no está soportado ni evaluado, y previsiblemente dará resultados degradados.
- Ventana de contexto desconocida: no se puede dimensionar a priori el coste de KV cache ni la viabilidad de casos con documentos largos.
- Alucinación: sin datos de evaluación, no hay medida del grado de alucinación; en un modelo fusionado por interpolación de pesos es frecuente que el comportamiento se degrade respecto a los checkpoints originales.
- Fusión sin documentar: se desconocen los coeficientes de mezcla y el método exacto, lo que dificulta reproducir el resultado o auditar qué capacidades se han conservado.
- Dependencia de código personalizado: `custom_code` implica ejecutar Python del repositorio. Es un riesgo de seguridad y de compatibilidad con versiones futuras de `transformers`, y bloquea el uso de runtimes estándar de alto rendimiento sin adaptaciones.
- Popularidad y mantenimiento: 8 descargas y 0 *likes* en el momento de la consulta; es un experimento de un autor individual, sin garantías de soporte ni historial de uso en producción.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero conviene verificar que los modelos de origen (Poziomka 8 y 9) tengan licencias compatibles, ya que el checkpoint fusionado las hereda de facto.
- Sin cuantizaciones oficiales publicadas: cualquier GGUF/AWQ/GPTQ habría que generarlo y validarlo internamente.
- Advertencia de producción: no se recomienda desplegar en un servicio crítico sin una batería propia de evaluaciones en polaco y sin verificar la integridad de la carga del modelo con `trust_remote_code`.

## Enlaces

- HuggingFace: https://huggingface.co/cpral/poziomka_8_plus_9_linear_merge
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
- Demo o espacio de inferencia: no disponible.
- Documentación de la arquitectura `bailing_moe`: no disponible en la información proporcionada.
