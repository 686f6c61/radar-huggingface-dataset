# praiselab-picuslab/benchmark-slm-msmarco-gemma-2-2b-mix

## Resumen

`praiselab-picuslab/benchmark-slm-msmarco-gemma-2-2b-mix` es un adaptador LoRA publicado con la librería PEFT sobre el modelo base `google/gemma-2-2b`. No se trata, por tanto, de un modelo completo, sino de un conjunto de pesos de ajuste fino (el repositorio ocupa 0,1 GB) que debe cargarse junto al modelo base para poder utilizarse. El autor es la organización `praiselab-picuslab` y el artefacto está pensado, a juzgar por su nombre y sus tags (`benchmark-slm`, `or2`, `dataset-msmarco`, `strategy-mix`), como pieza de un banco de pruebas interno de modelos de lenguaje pequeños (SLM) sobre el corpus MS MARCO.

La relevancia del repositorio es fundamentalmente metodológica: sirve para reproducir o comparar una configuración concreta de ajuste fino (aparentemente una "estrategia mix", sin documentar) frente a otras variantes del mismo benchmark. No hay model card con detalles de entrenamiento, hiperparámetros, datos exactos ni evaluación, y el acceso está restringido (gated), por lo que requiere aceptar condiciones en HuggingFace antes de su descarga.

Al estar construido sobre Gemma 2 2B, hereda las capacidades del modelo base (transformer decoder-only de 2,6 mil millones de parámetros y 8.192 tokens de contexto según la documentación de Google), pero también sus limitaciones: ventana de contexto moderada, entrenamiento predominantemente en inglés y una licencia de uso específica. Cualquier cifra de rendimiento del adaptador es, a día de hoy, no verificable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; arquitectura detallada del adaptador no disponible |
| Parámetros totales | No disponible para el adaptador (repo de 0,1 GB). Modelo base `google/gemma-2-2b`: 2,6 B según la documentación de Google |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en el repositorio. El modelo base Gemma 2 2B soporta 8.192 tokens |
| Tipos de cuantización | No disponible para el adaptador (pesos en safetensors, precisión no documentada). El modelo base admite cuantización de 8 y 4 bits (bitsandbytes, GGUF) |
| Idiomas soportados | `en` (inglés), según el tag del repositorio |
| Licencia | No disponible en el repositorio; sujeta a los términos de uso de Gemma del modelo base |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente pesos de adaptación de bajo rango (LoRA) compatibles con la librería PEFT, tal y como indican los tags `peft` y `lora` y la librería declarada. No se especifican el rango (`r`), el valor de `alpha`, el dropout, las capas objetivo ni la precisión de entrenamiento. Tampoco se documenta si el adaptador se ha fusionado o se aplica en inferencia; lo habitual en este tipo de artefactos es cargarlo en memoria junto al modelo base sin fusionar.

En cuanto a los datos, el único indicio es el tag `dataset:microsoft/ms_marco`, que apunta al corpus MS MARCO (pasajes y consultas de búsqueda web en inglés). Los tags `strategy-mix` y `or2` sugieren una variante experimental dentro de una comparativa interna de estrategias de ajuste, pero su significado no está descrito en la información disponible. No hay datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO, ni sobre ninguna innovación técnica (decodificación especulativa, atención lineal, etc.). Tampoco se documenta la fecha real de entrenamiento: los metadatos indican creación el 23 de octubre de 2026, fecha que conviene tratar con cautela.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Gemma 2 2B.
- Adaptación específica al dominio de MS MARCO (consultas y pasajes de búsqueda web), presumiblemente orientada a generación o reescritura sobre ese corpus; el propósito exacto no está documentado.
- Razonamiento básico y respuesta a instrucciones: disponible únicamente en la medida en que lo aporte el modelo base, ya que no se documenta ningún ajuste de instrucciones en el adaptador.
- Soporte de tool calling / function calling: no disponible en la información del repositorio.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no; el repositorio declara únicamente inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Almacenamiento extremadamente ligero (0,1 GB), lo que facilita su distribución y su combinación con el modelo base en distintos entornos.

## Casos de uso

- Reproducción de benchmarks de SLM: cargar el adaptador sobre `google/gemma-2-2b` con PEFT y ejecutar la batería de evaluación del proyecto `benchmark-slm` sobre MS MARCO, de modo que los resultados sean comparables con las demás variantes del mismo banco de pruebas.
- Ablaciones de estrategias de ajuste fino: emplear esta variante "mix" como una rama experimental frente a otras configuraciones (por ejemplo, ajuste completo o LoRA con otros rangos) para medir el efecto de la estrategia en la calidad de las respuestas sobre el mismo corpus.
- Prototipado de reescritura de consultas: usar el adaptador para transformar consultas de búsqueda en inglés en formulaciones expandidas, aprovechando el dominio de MS MARCO y la ventana de 8.192 tokens del modelo base para incluir contexto adicional.
- Baseline en pipelines de RAG en inglés: integrar el modelo fusionado como generador de respuestas extractivas o abstractivas sobre pasajes recuperados, y comparar su comportamiento con el del Gemma 2 2B sin ajustar para cuantificar la ganancia del ajuste.
- Investigación académica sobre eficiencia de PEFT: estudiar coste de almacenamiento (0,1 GB), facilidad de intercambio de adaptadores y degradación respecto al modelo base en un modelo de 2,6 B de parámetros.
- Docencia y formación técnica: ejemplo práctico de flujo completo con PEFT (descarga gated, carga del adaptador, fusión de pesos y conversión a GGUF) en cursos o talleres sobre ajuste fino de modelos pequeños.
- Punto de partida para ajustes posteriores: reutilizar el adaptador como inicialización en entrenamientos ulteriores sobre dominios relacionados con búsqueda web, siempre que la licencia del modelo base lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cifras calculadas a partir del modelo base, no publicadas por el autor): en fp16, en torno a 5,5-6,5 GB incluyendo pesos, caché KV y overhead de runtime; en int8, aproximadamente 3-3,5 GB; en 4 bits, alrededor de 2-2,5 GB.
- El adaptador en sí ocupa 0,1 GB adicionales, o ninguno si se fusiona con el modelo base antes de servir.
- GPU recomendadas: NVIDIA A100 o H100 para despliegues con concurrencia alta y contexto completo; L4, L40S o A10G para servicio en producción a coste moderado; RTX 4090 o RTX 3090 para desarrollo y evaluación.
- Cabe en GPU de consumo: sí. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 8 GB o una RTX 4070 permiten inferencia en fp16 o 8 bits; con cuantización de 4 bits funciona incluso en GPUs de 4-6 GB y en CPU (llama.cpp), con latencia notablemente mayor.
- Opciones de despliegue: `transformers` + `peft` para carga directa del adaptador; vLLM o TGI con el modelo fusionado (o con soporte de adaptadores LoRA); llama.cpp u Ollama tras fusionar y convertir a GGUF; igualmente válido en entornos de notebook (Google Colab, Kaggle) por tamaño.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo de 2,6 B, en una RTX 4090 en fp16 cabe esperar decenas de tokens por segundo, pero no hay mediciones publicadas para este adaptador concreto.

## Comparativa con modelos similares

La comparación se establece con los modelos base sobre los que podría construirse un adaptador equivalente, ya que no existen datos de rendimiento del adaptador evaluado.

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Adaptador evaluado (`gemma-2-2b-mix`) | Adaptador LoRA sobre 2,6 B | No disponible (base: 8.192 tokens) | No disponible; sujeta a términos de Gemma | en | Gated en HuggingFace |
| google/gemma-2-2b | 2,6 B | 8.192 tokens | Términos de uso de Gemma | Multilingüe (predominio de inglés) | Abierto con aceptación de términos |
| Qwen/Qwen2.5-1.5B | 1,5 B | 32.768 tokens | Apache 2.0 | Multilingüe (incluye español) | Abierto |
| meta-llama/Llama-3.2-1B | 1,2 B | 131.072 tokens | Licencia comunitaria de Llama 3.2 | Multilingüe | Abierto con aceptación de términos |

No se dispone de resultados de benchmarks que permitan comparar la calidad de este adaptador con las alternativas anteriores.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace y disponer de token de autenticación para descargar los pesos.
- Licencia no declarada en el repositorio: el uso comercial queda condicionado por los términos de uso de Gemma del modelo base, que incluyen una política de uso aceptable y obligaciones de atribución; conviene revisarla antes de cualquier despliegue.
- Idiomas: solo se declara inglés, por lo que no es adecuado para producción en castellano sin un ajuste adicional.
- Ausencia total de documentación de entrenamiento (hiperparámetros, tamaño de dataset, epochs, precisión): impide reproducir el resultado y evaluar riesgos de sobreajuste al corpus MS MARCO.
- Sesgo de dominio: al estar ajustado sobre MS MARCO, el modelo puede desviarse hacia el estilo y el vocabulario de pasajes de búsqueda web, con respuestas menos naturales en dominios ajenos.
- Riesgo de alucinación: como cualquier modelo de 2,6 B, tiende a fabricar datos cuando no dispone de contexto suficiente; no se ha publicado ninguna evaluación de fidelidad.
- Sin evaluación publicada: no existen métricas (MMLU, HumanEval, GSM8K, EM/F1 sobre MS MARCO) que respalden afirmaciones de calidad; no debería presentarse como modelo validado.
- Metadatos inconsistentes: la fecha de creación indicada (octubre de 2026) no permite fiarse de la trazabilidad temporal del artefacto.
- Sin garantías de mantenimiento: cero descargas y cero "likes" en el momento de la consulta, y sin repositorio de código o paper asociado, lo que reduce la probabilidad de soporte o actualizaciones.
- No es un modelo autónomo: intentar cargarlo sin `google/gemma-2-2b` produce error, y su comportamiento depende por completo del modelo base.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-msmarco-gemma-2-2b-mix
- Modelo base Gemma 2 2B: https://huggingface.co/google/gemma-2-2b
- Dataset MS MARCO referenciado en los tags: https://huggingface.co/datasets/microsoft/ms_marco
- Paper, blog, repositorio de código o demo del autor: no disponible en la información proporcionada.
