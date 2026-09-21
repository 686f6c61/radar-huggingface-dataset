# aac6fef/PasteWhat-Ranker-v1

## Resumen

PasteWhat-Ranker-v1 es un cross-encoder orientado a la clasificación y ordenación (ranking) de entradas de portapapeles, desarrollado por el usuario aac6fef. El modelo no genera texto ni trazas de razonamiento: su única función es puntuar entre 1 y 20 entradas de portapapeles existentes para decidir cuáles son relevantes en un contexto dado, apoyándose en nuevas cabezas de abstención conscientes de candidatos y de grupos de candidatos. Se distribuye a través de la librería MLX y deriva del encoder Laya-multilingual de convaiinnovations, sobre el que se destilan etiquetas de decisión procedentes de `kimi-for-coding`.

El proyecto se declara explícitamente como investigación en curso: no existe todavía un modelo de producción entrenado, calibrado y aceptado. El único artefacto técnico completado es una primera ejecución de ingeniería en GPU local en la que se ajustaron 32 ejemplos de entrenamiento durante seis épocas (24 actualizaciones completas del encoder), acertando las 32 decisiones, resultado que se conservó tras la conversión a MLX FP16. El propio autor subraya que se trata de un ajuste sobre el conjunto de entrenamiento y no de una medida de generalización, y que la revisión por agentes y por el profesor no equivale a validación humana.

Su relevancia actual es limitada y principalmente metodológica: sirve como banco de pruebas para un pipeline de destilación y evaluación con separación estricta de responsabilidades entre agentes (Train/Dev, entrenamiento y Calibración/Test), pero no debe emplearse como componente de producción. La licencia Apache-2.0 y el hecho de que el modelo base (Laya-multilingual) no esté cuantizado facilitan la experimentación, aunque la ausencia de benchmarks publicados y de datos de generalización impide cualquier evaluación de rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder sobre encoder transformer (encoder Laya-multilingual no cuantizado) con cabezas de abstención conscientes de candidatos y de grupos de candidatos |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX FP16 (pesos de despliegue); el encoder base se describe como no cuantizado |
| Idiomas soportados | no disponible (el modelo base Laya-multilingual es multilingue, pero la model card no especifica idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX FP16 (publicado); se planean pesos de referencia en PyTorch en el bundle final |

## Arquitectura y entrenamiento

La arquitectura es un cross-encoder construido sobre el encoder Laya-multilingual en su versión original sin cuantizar. En lugar de generar contenido, el modelo incorpora cabezas de decisión nuevas: una cabeza de candidato y una cabeza de abstención consciente de grupos de candidatos, que en conjunto puntúan entre 1 y 20 entradas de portapapeles ya existentes. Las entradas del modelo emplean categorías de aplicación, no identidades reales de aplicaciones, lo que actúa como medida de anonimización. El modelo no produce contenido de pegado ni trazas de razonamiento.

El entrenamiento descrito es una destilación de etiquetas de decisión procedentes de `kimi-for-coding` hacia el encoder Laya-multilingual. La model card documenta únicamente una primera ejecución de ingeniería en GPU local: 32 ejemplos independientes revisados por agentes, ajustados en seis épocas y 24 actualizaciones completas del encoder, con las 32 decisiones de entrenamiento correctas; la conversión a MLX FP16 preservó esas 32 decisiones. El autor insiste en que esto es ajuste al conjunto de entrenamiento, no precisión de generalización. El trabajo de producción pendiente incluye un piloto de 5.000 ejemplos, un entrenamiento completo de 20.000 con tres semillas, entrenamiento sobre ejemplos difíciles de un pool nuevo, verificación final independiente en MLX, calibración y un Test congelado emparejado. La separación de responsabilidades entre agentes (Train/Dev, entrenamiento y Calibración/Test) con separación de familias conceptuales es parte del diseño experimental.

## Capacidades

- Clasificación y ordenación (ranking) de entre 1 y 20 entradas de portapapeles existentes en función de un contexto.
- Puntuación tipo cross-encoder, es decir, evaluación conjunta de la pareja contexto-candidato en lugar de codificación independiente.
- Abstención consciente de candidatos y de grupos de candidatos: el modelo puede abstenerse de seleccionar cuando la evidencia no es suficiente.
- Destilación de decisiones desde un modelo profesor (`kimi-for-coding`) hacia un encoder más ligero.
- Uso de categorías de aplicación como entrada, en lugar de identidades reales de aplicaciones.

No se documentan capacidades de generación de texto, razonamiento multi-paso, tool calling, function calling, agentes, matemáticas, código generativo, visión ni audio. Tampoco se especifican capacidades multilingües concretas más allá de las que pueda aportar el modelo base.

## Casos de uso

- Gestor de portapapeles inteligente en escritorio: el modelo puntuaría las últimas entradas copiadas (hasta 20) y ordenaría las más probables de ser pegadas según la categoría de la aplicación activa, reduciendo la búsqueda manual en el historial.
- Predicción de pegado en editores de código: en un IDE, el ranker podría priorizar fragmentos copiados previamente que encajen con el archivo o el tipo de edición en curso, siempre que se sustituya la identidad real de la aplicación por su categoría.
- Asistentes de escritura y correo: al redactar respuestas repetitivas, el modelo podría sugerir cuál de los fragmentos copiados por el usuario es el más adecuado para pegar en el campo activo, sin generar texto nuevo.
- Automatización de flujos RPA: en pipelines que copian y pegan datos entre aplicaciones, el ranker podría seleccionar la entrada correcta del portapapeles y activar la abstención cuando ninguna candidata sea fiable, evitando pegados erróneos.
- Integración en la aplicación PasteWhat (AppKit): el repositorio de la aplicación ya incluye un adaptador para el futuro ranker local calibrado, por lo que el modelo encajaría como componente de decisión dentro de ese cliente de escritorio.
- Evaluación e investigación de pipelines de destilación: dado su estado de investigación, un uso legítimo es servir de banco de pruebas para metodologías de separación de agentes, calibración y abstenciones antes de escalar a un modelo de producción.
- Procesamiento local con privacidad: al ejecutarse sobre MLX en hardware local y trabajar con categorías de aplicación en lugar de identidades reales, podría emplearse en entornos donde el contenido del portapapeles no debe salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta un resultado de ajuste sobre el conjunto de entrenamiento (32 decisiones correctas sobre 32 ejemplos, seis épocas, 24 actualizaciones del encoder, preservadas tras la conversión a MLX FP16), que el propio autor califica explícitamente como ajuste al conjunto de entrenamiento y no como precisión de generalización. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra métrica estándar, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se publican parámetros totales ni longitud de contexto).
- GPU recomendadas: no disponible. La model card menciona que la primera ejecución de ingeniería se realizó en GPU local, pero no especifica el modelo de GPU.
- Compatibilidad con GPU de consumo: no disponible; el modelo se distribuye en formato MLX, orientado a hardware de Apple Silicon, y también se planean pesos de referencia en PyTorch.
- Opciones de despliegue: MLX (formato publicado) y PyTorch (pesos de referencia previstos en el bundle final). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos verificables con otros modelos de la misma categoría. Como referencia de familia, el modelo deriva del encoder Laya-multilingual de convaiinnovations, cuyo uso aquí es como base no cuantizada. No se han publicado parámetros totales, longitud de contexto, resultados de rendimiento ni métricas que permitan contrastarlo con alternativas como otros cross-encoders de reordenación. Cualquier comparación cuantitativa se marca como no disponible.

| Aspecto | PasteWhat-Ranker-v1 | Alternativas comparables |
|---|---|---|
| Categoria | Cross-encoder de ranking de portapapeles | no disponible |
| Parametros | no disponible | no disponible |
| Contexto | no disponible | no disponible |
| Rendimiento | solo ajuste a 32 ejemplos de entrenamiento | no disponible |
| Licencia | Apache-2.0 | no disponible |
| Disponibilidad | Repositorio MLX en HuggingFace, pesos no de produccion | no disponible |

## Limitaciones y advertencias

- Estado de investigación en curso: no existe un modelo entrenado, calibrado y aceptado para producción. El propio autor lo declara explícitamente.
- El único resultado reportado (32 de 32 decisiones correctas) es ajuste al conjunto de entrenamiento, no evidencia de generalización.
- No hay validación humana: la revisión por agentes y por el modelo profesor no sustituye a la validación humana.
- No se han publicado benchmarks ni métricas de precisión sobre usuarios reales; las métricas sintéticas no deben presentarse como precisión real.
- Ausencia de datos sobre sesgos, alucinación y robustez fuera del dominio; al no generar texto, el riesgo de alucinación se traslada al riesgo de rankings o abstenciones incorrectas.
- No se especifican idiomas soportados ni longitud de contexto, lo que limita cualquier planificación de despliegue.
- Riesgo de atribución: los pesos se derivan de un modelo base de terceros (Laya-multilingual) y de etiquetas destiladas de `kimi-for-coding`; la propia model card remite a la LICENSE y NOTICE del repositorio fuente para la atribución del código de conversión y del upstream.
- Licencia Apache-2.0, permisiva para uso comercial, pero sujeta a las condiciones de atribución del modelo base y del código de conversión documentadas en el repositorio.
- Entradas basadas en categorías de aplicación en lugar de identidades reales: cualquier uso que dependa de identidades de aplicación concretas no está cubierto por el diseño declarado.
- El bundle final (pesos de referencia PyTorch, tokenizer, preprocesado, política de calibración, manifiestos y reportes de calidad) todavía no está publicado; solo existe el checkpoint de ingeniería en MLX.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aac6fef/PasteWhat-Ranker-v1
- Repositorio fuente y registros de ejecución: https://github.com/mizorewww/pastewhat-ranker-v1
- Aplicación PasteWhat (AppKit, con adaptador para el futuro ranker): https://github.com/mizorewww/pastewhat
- Modelo base: convaiinnovations/laya-multilingual (referenciado en la model card; enlace directo no disponible en la información proporcionada)

Nota: los resultados de la búsqueda web facilitados corresponden a servicios de correo temporal (MailTicking, EmailTick, Temporary Mail) y no guardan relación con este modelo, por lo que no se incluyen como enlaces relevantes.
