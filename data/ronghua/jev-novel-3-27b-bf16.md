# ronghua/jev-novel-3-27b-bf16

## Resumen

JEVnovel 3 es una familia de modelos de clasificación de calidad literaria orientada a la revisión de texto generado por IA en el contexto de la escritura de novelas. El repositorio `ronghua/jev-novel-3-27b-bf16` contiene el modelo docente de la familia, con 27.356.728.560 parámetros en precisión BF16, desarrollado por el autor ronghua (alkaid55555 en ModelScope) mediante ajuste fino del modelo base Qwen/Qwen3.8-27B. Su función no es generar texto, sino evaluar oraciones completas y decidir si deben conservarse o modificarse, además de emitir una puntuación en cinco niveles.

El problema que aborda es el conocido como "八股" (estilo formulario) en la escritura asistida por IA: el uso abusivo de adjetivos de alta frecuencia, retórica estereotipada y ritmo de segmentación mecánico. Estas construcciones son probables pero no legibles, y son difíciles de detectar con reglas léxicas sin generar falsos positivos. JEVnovel resuelve esto mediante un cabezal de clasificación que, en una única pasada hacia delante, devuelve la etiqueta y su confianza, sin decodificación autorregresiva.

La relevancia de este repositorio concreto es que actúa como profesor en un esquema de destilación: los modelos estudiantes de 0,8B y 4B aprenden de sus puntuaciones la capacidad de localizar qué fragmento de una oración es deficiente. El modelo se publica con licencia Apache-2.0, soporta únicamente chino y tiene una ventana de entrada máxima de 4096 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `qwen3_5` (hidden 5120, 64 capas) con cabezal de clasificación JointSchemaHead (ancho 1024, 4 capas, 16 cabezas, fp32) |
| Parametros totales | 27.356.728.560 (27,48B, incluye 0,13B del cabezal de puntuación) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens de entrada máxima, incluida la instrucción fija; no hay truncado automático, se produce error si se excede |
| Tipos de cuantizacion | BF16 (este repositorio) y FP8 (repositorio hermano `jev-novel-3-27b-fp8`) |
| Idiomas soportados | chino (`zh`) |
| Licencia | Apache-2.0 (heredada del modelo base Qwen3.8) |
| Formato de pesos | safetensors (12 fragmentos + `adapter_head.safetensors` sin fusionar en BF16; 8 fragmentos + `head.safetensors` con adaptador fusionado en FP8); librería pytorch |

## Arquitectura y entrenamiento

El modelo parte del backbone `qwen3_5` de Qwen3.8-27B, con dimensión oculta de 5120 y 64 capas, al que se añade un cabezal de clasificación denominado JointSchemaHead de 1024 de ancho, 4 capas y 16 cabezas de atención, ejecutado en fp32. La inferencia es de una sola pasada: no hay generación autorregresiva ni decodificación especulativa. El modelo emite dos salidas simultáneas: una clasificación binaria (`可以保留` / `需要修改`, es decir, conservar o modificar) y una puntuación ordinal en cinco niveles (`烂完了` / `小改` / `平庸` / `还可以` / `优秀`). El umbral de decisión por defecto es `p_bad >= 0,31`, ajustable mediante `--threshold`.

El entrenamiento se basa en datos de preferencia humana para construir un discriminador de calidad literaria. La familia ha evolucionado desde JEVnovel 2 (identificación binaria) y JEVnovel 2.5 (intento de granularidad a nivel de coma con tres clases, descartado por su incapacidad para distinguir decoración prescindible de información necesaria) hasta JEVnovel 3, que sustituye ese enfoque por dos cabezales orientados a la acción de edición. Es importante señalar que este repositorio docente no incorpora esos dos cabezales: solo proporciona la señal de puntuación por oración completa que los estudiantes destilan. La cadena de destilación combina dos fuentes: la curva de percepción se obtiene puntuando cada prefijo de la oración cortada por puntuación con este modelo, y la densidad informativa se etiqueta con el modelo juez StartLux-Decision-27B, que responde si cada fragmento puede eliminarse al condensar la frase. Los detalles completos de método, datos y evaluación están en el informe técnico incluido en el repositorio. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Clasificación binaria de calidad de oración completa: decide entre conservar y modificar, con probabilidad `p_bad` asociada.
- Puntuación ordinal en cinco niveles con probabilidades por clase y puntuación esperada de 1 a 5 (activable con `--ordinal`).
- Detección de estilo formulario o "八股" generado por IA en texto narrativo en chino.
- Evaluación de calidad expresiva, no de autoría: el modelo juzga la expresión, no si el texto lo escribió una persona o una máquina.
- Procesamiento por lotes mediante JSONL, con campos `sentence` e `id` opcional.
- Uso como generador de señal docente para destilación de modelos estudiantes más pequeños.
- Uso autónomo como puntuador genérico de calidad literaria.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada al chino.

## Casos de uso

- Revisión automatizada de manuscritos de novela generados por IA: integración en el pipeline de publicación para marcar oraciones que requieren reescritura antes de la edición humana, aprovechando la salida `p_bad` como filtro priorizable.
- Control de calidad en plataformas de escritura asistida: puntuar cada oración que produce el generador y bloquear o señalar las que superan el umbral de 0,31, reduciendo la deriva hacia el estilo formulario en textos largos.
- Generación de datos de destilación: usar el modelo como profesor para etiquetar corpus de oraciones y entrenar estudiantes de 0,8B y 4B desplegables en entornos con recursos limitados.
- Auditoría de corpus AIGC: clasificar por lotes grandes volúmenes de texto narrativo para estimar la proporción de oraciones de baja calidad y comparar la deriva estilística entre distintos generadores.
- Filtrado previo en curación de datasets de entrenamiento: descartar oraciones marcadas como deficientes antes de incorporarlas a un corpus de ajuste fino.
- Evaluación comparativa de modelos generadores: emplear la tasa de oraciones marcadas como métrica objetiva y reproducible entre versiones de un mismo generador.
- Herramienta de apoyo a editores: priorizar la revisión humana sobre las oraciones con mayor `p_bad`, reduciendo el tiempo de lectura de originales extensos.

## Benchmarks y rendimiento

Protocolo: conjunto principal de 538 oraciones con mayor consenso entre anotadores humanos (main-bench); se reportan Macro-F1, exhaustividad (recall) de `bad`, precisión de `bad` y tasa de falsos positivos en oraciones normales. El umbral se fija en validación y se congela antes de aplicarlo al conjunto de prueba.

| Modelo | Macro-F1 (main) | Recall bad | Precisión bad | Falsos positivos en normales |
|---|---:|---:|---:|---:|
| `jev-novel-2-27b-bf16` (generación anterior) | 0,7661 | 0,6162 | **0,8978** | **0,0712** |
| **Este modelo (punto de operación óptimo)** | **0,8223** | **0,7417** | 0,8894 | 0,0936 |

- Frente al 27B de la generación anterior: +5,6 puntos de Macro-F1 y +12,6 puntos de recall de `bad`, a costa de elevar los falsos positivos del 7,1 % al 9,4 %, con precisión prácticamente estable.
- Con el umbral congelado de fábrica (0,31), el Macro-F1 es 0,8185; el 0,8223 corresponde al punto óptimo con umbral ≈0,30.
- Comparación FP8 frente a BF16 con el mismo umbral: Macro-F1 0,8185 → 0,8151 (Δ −0,003); desviación media de `p_bad` por oración de 0,011 y desviación p95 de 0,046; 10 de 538 decisiones invertidas (1,9 %).

## Requisitos de hardware

- VRAM estimada: el repositorio BF16 ocupa aproximadamente 59 GiB en disco; el autor recomienda GPU de 80 GB para inferencia en BF16. La versión FP8 ocupa unos 29 GiB y reduce significativamente el requisito de VRAM.
- GPU recomendadas: A100 80 GB, H100 80 GB o equivalentes con soporte de BF16. Para la variante FP8, GPU con soporte de FP8 nativo o suficiente memoria para los ~29 GiB de pesos.
- GPU de consumo: el modelo BF16 no cabe en tarjetas consumer de 24 GB. La variante FP8 tampoco está pensada para ese segmento según los datos disponibles; no se documenta una cuantización de 4 bits.
- Requisitos de sistema: Linux, Python 3.12, al menos 32 GB de RAM, toolchain CUDA 13.2 compatible con la versión de PyTorch instalada (torch 2.13.0 en el ejemplo del autor).
- Despliegue: no es compatible con `AutoModel` de Transformers por su arquitectura personalizada; debe usarse el `infer.py` incluido en el repositorio, que carga automáticamente el adaptador y el cabezal. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Macro-F1 (main-bench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **JEVnovel 3 27B (este)** | 27,48B | 4096 tokens | 0,8223 | Apache-2.0 | Hugging Face y ModelScope |
| JEVnovel 2 27B | 27B (no detallado) | no disponible | 0,7661 | no disponible | misma familia |
| JEVnovel 3 27B FP8 | 27,48B | 4096 tokens | 0,8185 (umbral 0,31) | Apache-2.0 | ModelScope |
| Estudiantes JEVnovel 3 (0,8B / 4B) | 0,8B / 4B | no disponible | no disponible | no disponible | pendientes de publicación |

No se dispone de datos de benchmarks de clasificadores de calidad literaria de terceros comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta chino; no se ha validado su comportamiento en otros idiomas.
- La ventana de entrada está limitada a 4096 tokens, incluida la instrucción fija; las oraciones que la exceden provocan error y no se truncan automáticamente.
- El modelo juzga calidad expresiva, no autoría: no debe emplearse como detector de texto generado por IA.
- Tasa de falsos positivos del 9,4 % sobre oraciones consideradas normales en el punto de operación óptimo; en producción conviene calibrar el umbral según el coste relativo de cada tipo de error.
- Riesgo de sesgo hacia el estilo y el registro del corpus de anotación humana empleado; la cobertura de estilos y de formas de "八股" de distintos generadores está en expansión según el autor.
- Este repositorio es el modelo docente y no incluye los cabezales de curva de percepción ni de densidad informativa; esas capacidades residen en los estudiantes.
- La arquitectura es personalizada y no carga con `AutoModel`; requiere el script del repositorio, lo que limita su integración en stacks estándar de servicio.
- Licencia Apache-2.0 con herencia del modelo base Qwen3.8; deben revisarse `LICENSE` y `NOTICE` para terceros.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración deficiente de la probabilidad `p_bad` fuera de la distribución de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/ronghua/jev-novel-3-27b-bf16
- Versión FP8 (ModelScope): https://modelscope.cn/models/alkaid55555/jev-novel-3-27b-fp8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Informe técnico: `JEVnovel3技术报告.md`, incluido en el repositorio del modelo
