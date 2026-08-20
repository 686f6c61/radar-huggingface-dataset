# ceselder/skip-lens-qwen36-27b-agreelens-p

## Resumen

`ceselder/skip-lens-qwen36-27b-agreelens-p` es un adaptador LoRA (PEFT) de interpretabilidad, desarrollado por el investigador independiente ceselder, que se monta sobre el modelo base Qwen/Qwen3.6-27B. Forma parte de un experimento denominado "agreelens" con cuatro brazos (arms) que estudian qué aprende una "futurelens" (una lente de activación que predice contenido futuro) cuando se entrena con datos filtrados según el acuerdo con la "J-lens" oficial, una lente de interpretación publicada por camilablank. Este brazo concreto, etiquetado como "P", es el control de emparejamiento por entropía: se entrena con datos de baja entropía (<1.0) pero seleccionados aleatoriamente, de modo que aísla el efecto del acuerdo con J-lens del efecto de la confianza del modelo.

El adaptador inyecta el residual exacto de la capa 42 en un token marcador especial (㈜, id 158983) mediante un hook normalizado de Karvonen, y se usa con una plantilla de prompt específica (`prompt_templates.actor`). El objetivo no es mejorar la generación de texto, sino permitir la lectura y manipulación de representaciones internas del modelo para investigación en interpretabilidad. El repositorio pesa 1,9 GB, contiene pesos en formato safetensors y se distribuye bajo licencia Apache 2.0. No tiene descargas ni likes registrados, y su pipeline no está definido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3.6-27B (transformer denso) |
| Parametros totales | No disponible (el adaptador es un LoRA r=64 α=16; el modelo base tiene 27B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.6-27B) |
| Tipos de cuantizacion | No disponible (el adaptador se puede combinar con cuantizaciones del base, pero no se especifican) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA con r=64, α=16 y escalado rsLoRA, aplicado a 12 tipos de módulos del modelo base Qwen3.6-27B. Se entrena durante una época (3.818 pasos) con un batch size de 64 sin acumulación de gradientes, learning rate 1e-4 y semilla 0. Los datos de entrenamiento consisten en 244.367 spans de 12 tokens generados on-policy por el propio modelo (continuaciones propias con temperatura 1.0 y top-p 0.95), extraídos de una submuestra fresca de 200.000 documentos de FineFineWeb (disjunta por md5 de pools anteriores, 67 dominios). Las activaciones usadas son los residuales exactos de la capa 42 en contexto completo.

La innovación clave es el filtrado de datos: este brazo P selecciona spans con entropía <1.0 de forma uniforme aleatoria, emparejando el histograma de entropía con el brazo A (que filtra por acuerdo con la J-lens oficial). Esto permite separar estadísticamente el efecto del acuerdo con J-lens del efecto de la confianza del modelo. El resultado principal del experimento es que el filtrado por acuerdo no añade acuerdo con J-lens sobre el control aleatorio (A−P = +0.000, p=1.0), pero produce el mejor "surfacer" de contenido inminente/retenido en el benchmark workspace-bench.

## Capacidades

- Inyección de residuales de capa 42 en un token marcador para lectura de representaciones internas (activation lens / future lens).
- Soporte de "workspace agreement": mide la concordancia entre la lente entrenada y la J-lens oficial en 353 ítems (0.589 según juicio de Sonnet).
- Capacidad de "surface-answer agreement": alineación entre la salida superficial y la respuesta del modelo (0.405).
- Manipulación dirigida de módulos (directed modulation) con un net de 0.063 en la familia directed-modulation-mt del workspace-bench.
- No es un modelo generativo autónomo: requiere el modelo base Qwen3.6-27B y el hook de inyección descrito en la model card.
- No se reportan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Investigación en interpretabilidad de modelos: permite estudiar qué información codifican los residuales de la capa 42 de Qwen3.6-27B y cómo se relaciona con la predicción de contenido futuro.
- Validación de lentes de activación: sirve como control experimental para comparar metodologías de entrenamiento de futurelenses, especialmente el efecto del filtrado por acuerdo con lentes de referencia.
- Análisis de agreement entre lentes: se puede usar para medir la concordancia entre distintas lentes (J-lens, futurelens) y entender qué posiciones del modelo son "confidentes" frente a "informativas".
- Estudio de la relación entre entropía de predicción y representaciones internas: el emparejamiento por entropía permite aislar variables en experimentos de interpretabilidad.
- Desarrollo de técnicas de "workspace readout": el adaptador puede servir para probar métodos de extracción de información de capas intermedias en modelos de 27B.
- Reproducción de experimentos de ablación controlada: al ser uno de cuatro brazos con filtros distintos, es útil para replicar el estudio completo y verificar la significancia estadística de los resultados.

## Benchmarks y rendimiento

La model card reporta métricas específicas de interpretabilidad, no benchmarks estándar (MMLU, HumanEval, etc.). Los resultados de este brazo son:

| Metrica | Valor |
|---|---|
| Fedlayer workspace agreement (Sonnet-judged vs J-lens oficial, 353 items) | 0.589 |
| Fedlayer surface-answer agreement | 0.405 |
| Workspace-bench AO family wins (de 21 decididos) | 0 |
| Workspace-bench directed-modulation-mt net (opus-judged) | 0.063 |
| Workspace-bench order_ops mean net (celdas L56/L60 congeladas) | -0.063 |

No se han publicado resultados de benchmarks estándar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible directamente, pero al ser un adaptador sobre Qwen3.6-27B, se requiere VRAM suficiente para el modelo base en su precisión de inferencia (típicamente 54-60 GB en FP16, o menos con cuantización).
- GPU recomendadas: no especificadas; para el modelo base de 27B se necesitaría al menos una GPU con 48 GB (A6000, A100 40GB con cuantización, o varias GPU) o una H100 para mayor comodidad.
- En consumer GPU: no es viable en GPUs de 24 GB (RTX 3090/4090) sin cuantización agresiva del modelo base, y el adaptador LoRA añade poca carga adicional.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` de HuggingFace sobre el modelo base. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay modelos comparables en el sentido de adaptadores de interpretabilidad con filtrado por acuerdo de lentes. Los modelos más cercanos son los otros tres brazos del mismo experimento:

| Modelo | Filtro de datos | Diferencia clave |
|---|---|---|
| skip-lens-qwen36-27b-agreelens-a | Acuerdo con J-lens (entropía <1.0) | Brazo principal del experimento |
| skip-lens-qwen36-27b-agreelens-d | Desacuerdo con J-lens | Brazo de control negativo |
| skip-lens-qwen36-27b-agreelens-g | Span-miss (fallo de acuerdo) | Brazo de control adicional |
| skip-lens-qwen36-27b-agreelens-p | Aleatorio con entropía <1.0 (emparejado) | Control de entropía (este modelo) |

No se dispone de comparativas con otros modelos de interpretabilidad fuera de este experimento.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para uso en producción ni para tareas de generación de texto estándar.
- Requiere el modelo base Qwen3.6-27B y el hook de inyección específico (Karvonen norm-matched) para funcionar; sin ese setup, el adaptador no produce resultados útiles.
- Las métricas reportadas dependen de juicios de modelos externos (Sonnet, Opus) y pueden tener sesgos de esos evaluadores.
- El experimento muestra que el filtrado por acuerdo no mejora el agreement con J-lens sobre el control aleatorio, lo que sugiere que la metodología de filtrado puede no ser efectiva para ese objetivo.
- No se especifican idiomas soportados; el modelo base Qwen3.6-27B probablemente soporta múltiples idiomas, pero no está confirmado para este adaptador.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un artefacto experimental sin validación externa.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.6-27B puede tener sus propias restricciones (no detalladas aquí).
- No hay información sobre sesgos, alucinaciones o riesgos de seguridad específicos de este adaptador.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ceselder/skip-lens-qwen36-27b-agreelens-p
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B (referenciado en la model card)
- Lente de referencia J-lens: `camilablank/workspace-lenses` `qwen3.6-27b/j-lens/lens.pt` (mencionada en la model card)
- Reporte interno del experimento: http://5.78.192.0/reports/view/agreelens-tokmatch/report.html (acceso interno, no público)
- Brazos hermanos: https://huggingface.co/ceselder/skip-lens-qwen36-27b-agreelens-{a,d,g}
