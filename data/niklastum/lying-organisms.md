# NiklasTUM/lying-organisms

## Resumen

`NiklasTUM/lying-organisms` es un repositorio de HuggingFace que contiene un adaptador de ajuste fino eficiente en parámetros (PEFT), concretamente un LoRA en formato safetensors, publicado por el usuario NiklasTUM (el prefijo sugiere vinculación con la Technische Universität München, aunque esto no se confirma en la información disponible). No se trata de un modelo completo, sino de un conjunto de pesos adicionales que deben cargarse sobre un modelo base que el repositorio no declara.

El artefacto presenta un tamaño de repositorio de 3,0 GB, licencia etiquetada como "other" y acceso restringido (gated), lo que obliga a aceptar condiciones en HuggingFace antes de descargarlo. No se especifican pipeline, idiomas soportados, arquitectura del modelo base, longitud de contexto ni datos de entrenamiento. El repositorio registra cero descargas y cero likes, y las fechas de creación y actualización son el 19 de octubre de 2026.

Por su nomenclatura ("lying-organisms"), el repositorio parece un artefacto de investigación orientado al estudio de comportamientos de engaño o declaraciones falsas en modelos de lenguaje, más que un modelo listo para producción. Su relevancia actual es, por tanto, limitada al ámbito de la interpretabilidad, la evaluación de seguridad y la reproducibilidad de experimentos académicos, siempre que se obtenga acceso y se identifique el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA; la arquitectura subyacente depende del modelo base, no declarado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | other (términos personalizados; acceso sujeto a condiciones) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | PEFT |
| Tamano del repositorio | 3,0 GB |
| Acceso | restringido (gated): requiere aceptar condiciones en HuggingFace |
| Pipeline declarado | no disponible |
| Fecha de creacion (metadatos) | 19 de octubre de 2026 |
| Ultima actualizacion (metadatos) | 19 de octubre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La etiqueta `lora` junto con `peft` y `safetensors` indica que el repositorio contiene matrices de bajo rango para inyectar en capas lineales de un transformer preentrenado, según el método LoRA estándar. No se publica el rango (r), el valor de alpha, las capas objetivo, el dropout ni la configuración exacta de entrenamiento, por lo que no es posible reconstruir el procedimiento a partir de la información disponible. Tampoco se declara qué modelo base se utilizó, dato imprescindible para cargar el adaptador.

No hay información sobre volumen de tokens de entrenamiento, composición del dataset, uso de RLHF, DPO u otras etapas de alineación, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. El nombre del repositorio sugiere que el ajuste fino se orientó a inducir o modelar conductas de engaño, pero esta hipótesis no está confirmada por ninguna documentación accesible.

## Capacidades

- Generación de texto: no evaluable de forma independiente; el adaptador no funciona sin el modelo base.
- Razonamiento, código y matemáticas: no disponible; no se han publicado evaluaciones.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Multilingüismo: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Uso como artefacto de investigación: el adaptador puede aplicarse sobre el modelo base correspondiente para reproducir el comportamiento para el que fue entrenado, una vez identificado dicho modelo.
- El repositorio no incluye model card con ejemplos de uso, plantilla de prompt ni tokenizador propio.

## Casos de uso

- Reproducción de experimentos sobre engaño en modelos de lenguaje: el adaptador permitiría replicar, sobre el modelo base correcto, las condiciones experimentales de un estudio sobre declaraciones falsas o comportamientos estratégicos; requiere acceso aprobado y conocer el base.
- Evaluación de detectores de alucinación y mentira: serviría como condición experimental frente a la que medir la eficacia de clasificadores de veracidad o sondas de interpretabilidad, comparando el modelo base con y sin el adaptador.
- Auditoría de seguridad y red teaming: un equipo podría analizar si el ajuste fino de bajo rango introduce sesgos de comportamiento no deseados, midiendo tasas de afirmaciones falsas en dominios controlados.
- Investigación en PEFT: útil como caso de estudio de adaptadores LoRA de gran tamaño (3,0 GB de repositorio), comparando el coste de almacenamiento frente a adaptadores de rango bajo convencionales.
- Docencia y formación técnica: ejemplo práctico de flujo gated + PEFT + safetensors para enseñar a cargar adaptadores con la librería `peft` y a gestionar licencias personalizadas.
- Integración en pipelines de evaluación académica: incorporación a arneses como lm-evaluation-harness o a scripts propios de evaluación, siempre que se resuelva la dependencia del modelo base y la latencia sea aceptable.
- Prototipado interno sobre el modelo base: una vez identificado el base, el adaptador puede cargarse y descargarse dinámicamente para alternar entre comportamiento ajustado y original sin duplicar los pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de veracidad o engaño, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia: no determinable sin conocer el modelo base; el adaptador añade una sobrecarga pequeña frente a los pesos completos, pero el repositorio ocupa 3,0 GB en disco, lo que sugiere un adaptador de rango o número de módulos superior al habitual.
- GPU recomendadas: no disponible; dependen íntegramente del modelo base (desde una RTX 4090 para bases de 7-8B cuantizados hasta A100/H100 para bases maiores o en precisión completa).
- Encaje en GPU de consumo: no confirmable; si el base es de 7-8B y se cuantiza, es plausible en GPUs de 16-24 GB, pero no hay datos que lo verifiquen.
- Opciones de despliegue: PEFT para carga directa del adaptador; vLLM y TGI admiten adaptadores LoRA sobre el modelo servido; llama.cpp requeriría convertir el adaptador a GGUF; el soporte en Ollama es limitado para adaptadores externos. Todo ello condicionado a disponer del modelo base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NiklasTUM/lying-organisms | no disponible | no disponible | other (personalizada) | gated, 0 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No es posible identificar modelos comparables con la información proporcionada, ya que se desconoce el modelo base y la tarea exacta del adaptador. La comparación natural sería con otros adaptadores LoRA publicados sobre el mismo base, pero ninguno puede nombrarse sin ese dato.

## Limitaciones y advertencias

- El adaptador no es autónomo: sin el modelo base declarado no puede cargarse ni evaluarse; el repositorio no indica cuál es.
- Acceso restringido: es necesario aceptar condiciones en HuggingFace y obtener aprobación del autor, que puede denegarla o tardar.
- Licencia "other": los términos no están resumidos en la información disponible; debe revisarse el texto completo antes de cualquier uso comercial, que podría estar prohibido o sujeto a condiciones adicionales.
- Ausencia de validación externa: cero descargas y cero likes implican que no hay evidencia comunitaria de funcionamiento correcto.
- Riesgo de alucinación y sesgos: no caracterizado; si el ajuste se orientó a modelar engaño, el adaptador podría incrementar la tasa de afirmaciones falsas de forma deliberada, lo que lo hace inadecuado para aplicaciones de cara al usuario.
- Idiomas no declarados: se desconoce si el ajuste conserva el multilingüismo del base o lo degrada.
- Tamaño atípico del repositorio (3,0 GB): podría contener varios checkpoints, pesos en alta precisión o un adaptador de rango elevado; no está confirmado y conviene inspeccionar el árbol de archivos tras obtener acceso.
- Sin model card, sin tokenizador, sin plantilla de prompt y sin ejemplos: la integración requiere trabajo previo de ingeniería inversa.
- Fechas de metadatos (19 de octubre de 2026) posteriores a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de planificar su uso.

## Enlaces

- HuggingFace: https://huggingface.co/NiklasTUM/lying-organisms
- No se han encontrado en la búsqueda web papers, blogs, repositorios de código ni demos asociados a este modelo.
