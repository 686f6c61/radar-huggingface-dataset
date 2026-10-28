# NynaeveProj/Llama-3.1-8B-4bit-alpaca-sft-ce-pku-suan2-neg20.0-neg5.0

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado sobre el modelo base `NynaeveProj/Llama-3.1-8B-4bit`, que a su vez es una cuantización a 4 bits de Llama 3.1 8B. Es, por tanto, un ajuste fino supervisado (SFT) de bajo rango sobre un Llama 3.1 8B ya cuantizado, no un modelo completo e independiente: para utilizarlo hay que cargar primero el base y aplicar el adaptador. El repositorio ocupa 0,3 GB y se distribuye en safetensors con la librería `peft` (versión 0.19.1 según la model card).

El nombre del repositorio indica el procedimiento seguido: SFT sobre datos tipo Alpaca (`alpaca-sft`), con un componente identificado como `ce-pku-suan2` y dos escalares negativos (`neg20.0`, `neg5.0`). La model card, sin embargo, es la plantilla por defecto de HuggingFace sin rellenar: no documenta el conjunto de datos, los hiperparámetros, la licencia ni los idiomas. Cualquier afirmación sobre el proceso de entrenamiento más allá de lo que sugiere el nombre del repositorio es una inferencia, no un dato verificado.

Su relevancia práctica es limitada y muy específica: sirve como ejemplo reproducible de ajuste fino con LoRA sobre un Llama 3.1 8B cuantizado a 4 bits, un escenario de bajo consumo de VRAM habitual en laboratorios con GPUs de consumo. Con 0 descargas y 0 likes en el momento de la consulta, y sin resultados de evaluación publicados, no debe considerarse una alternativa lista para producción frente a Instruct oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) con adaptador LoRA sobre base cuantizada a 4 bits |
| Parametros totales | 8.030 millones (8B) en el modelo base; el adaptador ocupa 0,3 GB en disco (número de parámetros entrenables no disponible) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128.000 tokens según las especificaciones de Llama 3.1 8B; no verificado en la model card de este adaptador |
| Tipos de cuantizacion | base en 4 bits (esquema exacto no disponible, el nombre solo indica "4bit"); adaptador en safetensors sin cuantizar; no se publican versiones GGUF |
| Idiomas soportados | no disponible en la model card; el modelo base Llama 3.1 declara 8 idiomas (inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base `NynaeveProj/Llama-3.1-8B-4bit` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only denso con atención por grupos (GQA) y RoPE, del que no se documentan aquí modificaciones estructurales. Sobre él se aplica un adaptador LoRA de bajo rango, técnica que congela los pesos del base e inserta matrices de descomposición de rango reducido en determinadas capas, de modo que solo se entrenan esos parámetros adicionales. El resultado es un artefacto de 0,3 GB que se carga junto al base mediante `peft` y `transformers`.

En cuanto a los datos y el procedimiento, la información disponible se limita al nombre del repositorio: sugiere un ajuste fino supervisado sobre un dataset con formato Alpaca, combinado con un componente etiquetado como `ce-pku-suan2` (posiblemente un corpus de matemáticas o razonamiento, sin confirmar) y dos escalares negativos (`neg20.0`, `neg5.0`) cuyo significado exacto —probablemente pesos de una variante de entrenamiento con ejemplos negativos o de decodificación contrastiva— no está documentado. No se especifican número de tokens, composición del dataset, uso de RLHF/DPO, hiperparámetros, hardware ni duración del entrenamiento. La model card únicamente confirma la versión de PEFT empleada (0.19.1).

## Capacidades

- Generación de texto autoregresiva en el rango de los 8B de parámetros, heredada del modelo base.
- Ajuste orientado a instrucciones en formato Alpaca, presumiblemente para mejorar la obediencia a instrucciones conversacionales (no evaluado).
- Soporte de tool calling y function calling: no documentado en el adaptador; Llama 3.1 lo incorpora en su variante Instruct oficial, pero este ajuste no declara conservarlo.
- Razonamiento multi-paso y uso como agente: no documentado ni evaluado.
- Capacidades multilingües: no declaradas; dependen del base y del corpus de SFT, desconocido.
- Capacidades especiales (modo pensamiento, visión, audio): ninguna documentada; el pipeline es `text-generation` y no hay torre multimodal.
- Cuantización en 4 bits del base: reduce el coste de memoria a cambio de una pérdida de precisión no cuantificada.

## Casos de uso

- Experimentación académica con LoRA sobre bases cuantizados: el repositorio sirve como referencia de un flujo completo (base 4 bits + adaptador PEFT) para reproducir ajustes finos en GPUs de consumo con menos de 8 GB de VRAM ocupados por pesos.
- Evaluación comparativa de técnicas de SFT con ejemplos negativos: los escalares `neg20.0` y `neg5.0` del nombre permiten estudiar, si se accede al código del autor, el efecto de distintos pesos negativos en la calidad de las respuestas.
- Pruebas de integración de extremo a extremo con `transformers` + `peft`: útil para validar pipelines de carga de adaptadores, fusión de pesos (`merge_and_unload`) y exportación a otros formatos antes de invertir en un ajuste propio.
- Generación de textos asistida en dominios acotados y con supervisión humana, siempre que se valide empíricamente la calidad del adaptador frente al base sin ajustar, dado que no hay métricas publicadas.
- Docencia y formación técnica: ejemplo mínimo de publicación de un adaptador en el Hub, incluidos sus metadatos y limitaciones.
- Prototipado interno de asistentes conversacionales: como paso intermedio antes de sustituir por un Instruct oficial, midiendo regresiones en alucinación y formato.
- No se recomienda su uso directo en atención al cliente, generación de código en producción ni entornos regulados sin una evaluación propia previa, al no existir benchmarks, licencia declarada ni documentación de sesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto, y la búsqueda web realizada no devolvió documentación técnica asociada al repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 5-6 GB con el base en 4 bits y el adaptador LoRA en BF16 (cálculo orientativo a partir de 8B parámetros a ~4 bits más overhead de activaciones y caché KV); con el base en FP16 serían ~16 GB más el adaptador.
- GPU recomendadas: cualquier GPU con 8 GB o más para la configuración 4 bits (RTX 3060 Ti, RTX 3070, RTX 4060 Ti); 24 GB o más (RTX 3090, RTX 4090, A10G, L4) para trabajar con comodidad en FP16 o con contextos largos; A100/H100 solo justificables para entrenamiento o servicio de alta concurrencia.
- Cabe en GPU de consumo: sí, en el rango de 8-12 GB con la base cuantizada a 4 bits; ajustado en 6 GB.
- Opciones de despliegue: `transformers` + `peft` (vía `PeftModel.from_pretrained`), Text Generation Inference y vLLM con soporte de adaptadores LoRA; para llama.cpp u Ollama sería necesario fusionar el adaptador con el base y convertir a GGUF, paso no documentado por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este adaptador (LoRA sobre Llama-3.1-8B-4bit) | 8B (base) + LoRA | 128k (heredado, no verificado) | no disponible | Hub, 0 descargas, requiere base | Sin benchmarks ni model card cumplimentada |
| Llama 3.1 8B Instruct | 8B densos | 128k | Llama 3.1 Community License | Hub oficial, ampliamente desplegado | Evaluado y documentado por Meta; referencia directa de comparación |
| Mistral 7B Instruct v0.3 | 7,2B densos | 32k | Apache 2.0 | Hub oficial | Licencia permisiva; contexto menor |
| Qwen2.5 7B Instruct | 7,6B densos | 128k | Apache 2.0 (mayoría de variantes) | Hub oficial | Multilingüe declarado, con benchmarks publicados |

La comparación de rendimiento con estas alternativas no es posible: el adaptador no publica métricas y su licencia ni siquiera está declarada, lo que impide equipararlo en condiciones de uso comercial.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks ni comparación con el modelo base sin ajustar, por lo que se desconoce si el SFT mejora o degrada las capacidades originales.
- Model card sin cumplimentar: los campos de licencia, idiomas, datos de entrenamiento y uso previsto figuran como "More Information Needed", lo que impide verificar condiciones de uso comercial.
- Riesgo de alucinación: al ser un ajuste SFT sobre un base de 8B sin RLHF documentado, es previsible un aumento de respuestas confidently incorrectas y de sobreajuste al estilo del dataset Alpaca, aunque no está medido.
- Sesgos: no documentados; heredados del corpus de preentrenamiento de Llama 3.1 y del dataset de SFT, ambos desconocidos en esta ficha.
- Cuantización a 4 bits del base: puede degradar tareas sensibles a la precisión numérica (matemáticas, código) y agravar el olvido catastrófico del ajuste.
- Idiomas: sin declaración; si el corpus de SFT fuese mayoritariamente en inglés o chino, el rendimiento en castellano podría ser deficiente.
- Sin soporte GGUF ni artefacto fusionado: el despliegue en llama.cpp/Ollama requiere trabajo adicional no documentado.
- Metadatos anómalos: la fecha de creación registrada (2026-10-28) y la ausencia de descargas y likes aconsejan tratar el repositorio como un experimento aislado, no como un artefacto mantenido.
- El tag `arxiv:1910.09700` del repositorio corresponde a la calculadora de impacto medioambiental citada en la plantilla de la model card (Lacoste et al.), no a un artículo sobre este modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/NynaeveProj/Llama-3.1-8B-4bit-alpaca-sft-ce-pku-suan2-neg20.0-neg5.0
- Modelo base (cuantizado a 4 bits): https://huggingface.co/NynaeveProj/Llama-3.1-8B-4bit
- Referencia citada en la model card (calculadora de impacto, Lacoste et al.): https://arxiv.org/abs/1910.09700
- Documentación de PEFT: https://huggingface.co/docs/peft
- Llama 3.1 (modelo de origen, sin enlace directo en la información proporcionada): no disponible en la búsqueda realizada
- Paper, blog o demo específicos de este adaptador: no disponibles; la búsqueda web no devolvió resultados relevantes
