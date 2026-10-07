# JooYoon/riidolaya-statehint-label-smoothing-v0.1-development

## Resumen

Riidolaya Statehint label smoothing — development v0.1 es un artefacto de investigación publicado por el usuario JooYoon en HuggingFace. No es un modelo de lenguaje en el sentido habitual: se trata de un perceptrón multicapa (MLP) diminuto implementado en Go, pensado para proponer «pistas de estado» (state hints) sobre texto de desarrollo en coreano e inglés. Concretamente, clasifica prosa acotada en ocho intenciones definidas en `INTENTS.en.md` y devuelve una propuesta de finalización o de intención, sin crear anotaciones ni modificar estado de tareas.

El repositorio contiene dos copias del mismo MLP entrenadas con objetivos distintos: una con entropía cruzada dura (`hard_ce_alpha000.rsm`) y otra con suavizado uniforme de etiquetas a alpha 0.05 (`uniform_smoothing_alpha005.rsm`). Ambas tienen 32.920 parámetros float32 con arquitectura Contextual 2048 → 16 ReLU → 8 softmax, y se serializan en un formato propietario denominado RSM v3 de unos 128,78 KiB por archivo. No es un checkpoint de Transformers, ni un fine-tune, ni un modelo con pesos ternarios o QAT de 1,58 bits.

La relevancia de esta ficha es acotada y conviene ser explícito: el propio autor indica que ambos diagnósticos externos siguen «sin cualificar» y que el brazo con suavizado produjo cero propuestas de finalización en las dos localizaciones de diagnóstico, por lo que la precisión diagnóstica de finalización es indefinida (no 0 % ni 100 %). Se trata de un lanzamiento de investigación con CI de origen superado, pero sin mejora diagnóstica útil, sin evaluación de producto fresca y sin aprobación de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP: Contextual 2048 → 16 ReLU → 8 softmax |
| Parametros totales | 32.920 (float32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (vector de características fijo de 2048 dimensiones; no hay ventana de tokens declarada) |
| Tipos de cuantizacion | no disponible (pesos float32 en formato RSM v3; no se documentan variantes cuantizadas) |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | RSM v3 propietario (`.rsm`, ~128,78 KiB por artefacto); no es safetensors ni GGUF |
| Pipeline declarado | text-classification |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-06 |
| Ultima actualizacion | 2026-10-06 |

## Arquitectura y entrenamiento

La arquitectura es un MLP de tres capas con una capa de entrada de 2048 dimensiones, una capa oculta de 16 unidades con activación ReLU y una capa de salida softmax de 8 clases (las ocho intenciones). La entrada se construye con características de texto que combinan n-gramas de palabra (1 y 2), n-gramas de carácter (2 a 5), hashing con signo, log-TF y normalización L2. La inicialización es Glorot uniforme con generador PCG y semilla 1729, y ambos brazos se entrenan desde cero sin artefacto padre entrenado.

El entrenamiento usa exactamente las mismas 1.454 muestras ordenadas y 1.840 actualizaciones en ambos brazos: 40 épocas, batch de 32, learning rate 0,02, AdamW con decay 0,001, semilla 1729 y temperatura 1. La única diferencia entre los dos artefactos es la distribución objetivo: entropía cruzada dura frente a suavizado uniforme `q[c] = (1 − alpha) * one_hot[c] + alpha / 8` con alpha 0,05, de modo que la clase correcta recibe 0,95625 y cada una de las otras recibe 0,00625. El suavizado uniforme sigue el método descrito por Müller, Kornblith y Hinton (NeurIPS 2019), aunque el autor aclara que este experimento no reproduce ni garantiza los resultados de dicho trabajo.

El conjunto de datos reutiliza una partición congelada «train840 whole-group»: 663 familias de ajuste (1.326 filas) y 177 familias de desarrollo interno (354 filas, 155 grupos declarados). Se añaden 128 filas de peso extra provenientes de 64 familias de ajuste existentes (32 de completion; 8 cada una de reference, progress, planned y blocker). El texto original es prosa ficticia escrita y revisada por IA, con sesgo de escritor, evaluador y tema reconocido por el propio autor. La pérdida media de entrenamiento reportada es 0,041420 para entropía cruzada dura y 0,304258 para entropía cruzada suavizada; el autor advierte que no son comparables directamente porque usan distribuciones objetivo distintas.

## Capacidades

- Clasificación de texto en ocho intenciones sobre prosa de desarrollo en coreano e inglés.
- Propuesta de «pistas de estado» (hints) y de finalizaciones acotadas; no crea anotaciones, reacciones ni cambios de estado de tareas.
- Extracción de características con n-gramas de palabra (1-2) y de carácter (2-5) mediante hashing con signo, log-TF y normalización L2.
- Inferencia local mediante la API de Go `pkg/statehintmlp.Load(io.Reader)` con un `Workspace` propiedad del llamador y método `Predict` que devuelve `statehint.Prediction`.
- Carga y guardado deterministas: se verificó que las predicciones completas entrenadas y los bytes reserializados coinciden exactamente tras Save/Load en ambos modelos.
- No dispone de tool calling, function calling, soporte de agentes, multimodalidad, modo de razonamiento extendido ni generación de texto libre.
- Capacidad multilingüe limitada a coreano e inglés, y dentro del dominio de prosa de desarrollo acotada.

## Casos de uso

- Enrutado de intención en herramientas internas de gestión de tareas: el MLP puede etiquetar prosa de desarrollo en coreano o inglés con una de las ocho intenciones definidas, sirviendo como señal auxiliar previa a revisión humana, siempre que se asuma su condición de artefacto de investigación no cualificado.
- Filtrado de propuestas de finalización en asistentes de código basados en Go: integrado como paso previo que decide si una propuesta merece mostrarse, mediante el mecanismo de gating descrito en las métricas internas.
- Componente embebido en servicios Go sin dependencias de Python: al cargarse desde un `io.Reader` y ocupar ~129 KiB, puede incorporarse directamente en binarios Go sin runtime de inferencia externo.
- Experimentación académica sobre suavizado de etiquetas: el par de artefactos aísla el efecto del suavizado uniforme (alpha 0,05) manteniendo idénticos inicialización, orden de datos, características y optimizador, lo que lo hace útil como caso de estudio controlado.
- Pruebas de regresión determinista en pipelines de CI: al reproducir el artefacto de objetivo duro exactamente el SHA de un estudio de capacidad previo y abortar en caso de discrepancia, puede usarse como verificación de integridad de artefactos serializados.
- Investigación sobre sesgos de datos sintéticos: el corpus es prosa ficticia escrita y revisada por IA, por lo que sirve para estudiar cómo se comporta un clasificador pequeño cuando el material de entrenamiento comparte sesgo de autor y evaluador.
- Desarrollo de clasificadores de intención de muy bajo coste computacional para comparar contra alternativas transformer en cuanto a precisión por byte de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único material cuantitativo son las métricas de desarrollo interno ya expuestas por el autor, que no constituyen una cualificación independiente ni oro humano:

| Brazo | Correctas 8 intenciones (crudo) | Correctas con gate / propuestas | Coste de severidad | NLL 8 intenciones | Precisión de completion | Gate interno |
|---|---:|---:|---:|---:|---:|---|
| Hard CE alpha 0 | 322/354 (90,96 %) | 91/95 | 0,217514 | 0,360619 | 35/37 (94,59 %) | Falla: precisión de completion |
| Suavizado alpha 0,05 | 305/354 (86,16 %) | 39/39 | 0,228814 | 0,570495 | 14/14 (100 %) | Pasa, solo investigación interna |

Detalles adicionales aportados por el autor: el suavizado no produjo propuestas incorrectas con gate a nivel interno, pero el soporte correcto con gate cayó de 91 a 39; el soporte correcto por familia de completion KO/EN pasó de 16/25 y 19/25 a 5/25 y 9/25; el brazo de entropía cruzada dura generó dos propuestas de completion erróneas en familias distintas, una por idioma. El autor indica además que la tabla de validación previa «diagnostic weight 0» existe pero los datos proporcionados están truncados, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada: 0 GB. Los pesos ocupan aproximadamente 131.872 bytes (~128,78 KiB) por artefacto en float32.
- GPU recomendadas: ninguna. El modelo está diseñado para ejecución en CPU.
- Compatibilidad con GPU de consumo: irrelevante; el cálculo por muestra es del orden de decenas de miles de multiplicaciones-acumulaciones (2048×16 + 16×8 ≈ 32.896 MAC), ejecutable en cualquier CPU moderna.
- Opciones de despliegue: paquete Go `pkg/statehintmlp` con `Load(io.Reader)` y `Workspace`; requiere el formato RSM v3. El CLI/SDK v1 y el cargador lineal v2 no pueden cargar este formato.
- Incompatibilidades: no es compatible con vLLM, llama.cpp, Ollama, TGI ni ningún runtime de Transformers, ya que no es un checkpoint de Transformers.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño del modelo, cabe esperar latencias muy inferiores al milisegundo por muestra en una CPU convencional, pero es una estimación derivada de la arquitectura y no un dato medido por el autor.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría, y el propio autor subraya que este artefacto no es un checkpoint de Transformers, ni un endpoint alojado, ni un fine-tune de Laya, ni un LoRA, ni pesos ternarios o QAT de 1,58 bits, por lo que no procede compararlo con clasificadores transformer estándar sin datos empíricos comunes. La única comparación interna posible es entre los dos brazos:

| Brazo | Parametros | Formato | Licencia | Resultado en gate interno |
|---|---:|---|---|---|
| Hard CE alpha 0 | 32.920 | RSM v3 | Apache 2.0 | Falla (precisión de completion) |
| Suavizado alpha 0,05 | 32.920 | RSM v3 | Apache 2.0 | Pasa, solo investigación interna |

## Limitaciones y advertencias

- Estado de cualificación: ambos artefactos siguen «sin cualificar» externamente. El autor afirma explícitamente que no hay mejora diagnóstica útil, evaluación de producto fresca, uso para calibración o test, ni promoción.
- Diagnóstico externo: el suavizado uniforme a alpha 0,05 produjo cero propuestas de completion en las dos localizaciones de diagnóstico, por lo que la precisión de completion diagnóstica es indefinida, no 0 % ni 100 %.
- Gate interno: aunque el suavizado pasó el gate interno, ese resultado es solo para investigación interna y no constituye aprobación de despliegue. El brazo de entropía cruzada dura falló el requisito de precisión sin cambios.
- Caída de cobertura: el soporte correcto con gate cayó de 91 a 39 propuestas al aplicar suavizado, y el soporte por familia de completion KO/EN bajó de 16/25 y 19/25 a 5/25 y 9/25.
- Sesgos de datos: la prosa y las etiquetas originales son ficticias, escritas y revisadas por IA, con sesgo de escritor, evaluador y tema reconocido por el autor. No se usó aumento semántico ni datos de tareas privados.
- Riesgo de alucinación: el propio autor indica que un informe de completion es una afirmación en texto, no un éxito de trabajo verificado ni permiso para cambiar estado. El modelo propone pistas; no crea anotaciones ni cambios de estado de tareas.
- Comparabilidad de métricas: las pérdidas de entrenamiento (0,041420 frente a 0,304258) usan distribuciones objetivo distintas y no son comparables como puntuaciones de rendimiento. No hay barrido de alpha, brazo adaptativo, relajación de umbral ni calibración.
- Ausencia de validación humana: el desarrollo interno ya estaba expuesto y no es una cualificación independiente fresca ni oro humano.
- Licencia: Apache 2.0 permite uso comercial según los términos de dicha licencia, pero el estado de investigación no cualificado del artefacto desaconseja cualquier uso en producción.
- Contexto e idioma: soporte limitado a coreano e inglés y al dominio de prosa de desarrollo acotada; no hay ventana de contexto de tokens declarada ni capacidades de generación libre.
- Compatibilidad: el formato RSM v3 no puede cargarse con el CLI/SDK v1 ni con el cargador lineal v2.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JooYoon/riidolaya-statehint-label-smoothing-v0.1-development
- Tarjeta del modelo en coreano (referenciada en la model card): README.ko.md (dentro del repositorio de HuggingFace)
- Artículo de referencia sobre suavizado de etiquetas: Müller, Kornblith y Hinton, NeurIPS 2019 — https://proceedings.neurips.cc/paper_files/paper/2019/hash/f1748d6b0fd9d439f71450117eba2725-Abstract.html
- No se han proporcionado otros enlaces (papers propios, blogs, repositorios de código o demos) en la información disponible.
