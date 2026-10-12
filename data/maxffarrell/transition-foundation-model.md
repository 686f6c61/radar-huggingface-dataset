# maxffarrell/transition-foundation-model

## Resumen

Transition Foundation Model v0.1 es un modelo experimental de transición probabilística condicionado por acciones, diseñado para predecir la evolución de sistemas físicos numéricos (térmicos, de depósitos y de baterías). Lo desarrolla el autor independiente maxffarrell y se publica bajo licencia MIT. No es un modelo de lenguaje ni un checkpoint compatible con `AutoModel` de Transformers: es una implementación propia en PyTorch con un runtime completo, simuladores, código de entrenamiento y evaluación, servicio FastAPI y tests.

El modelo resuelve un problema de identificación de sistemas: dado un historial de observaciones y una secuencia de acciones futuras, predice múltiples campos numéricos en varios horizontes temporales y para distintas alternativas de acción en una única pasada no autorregresiva. Su arquitectura es un transformer pequeño (1.570.434 parámetros) con cuatro bloques, anchura 128, cuatro cabezas de atención y anchura de feedforward 512, que combina metadatos aprendidos de campo/unidad/tipo-rol con codificadores temporales dedicados para historia y futuro.

Su relevancia es acotada y el propio autor la enmarca con honestidad: se trata de una prueba de concepto ejecutable con entrenamiento corto, y los criterios de éxito de la investigación **no se han cumplido**. El transformer mejora sobre las líneas base MLP y GRU, pero CatBoost y la dinámica afín controlada ajustada siguen siendo superiores en la comparativa corta. No se reclama ventaja comercial ni transferencia zero-shot a esquemas arbitrarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder custom en PyTorch, no autorregresivo, con cabezas gaussianas compartidas; 4 bloques pre-normalizacion, anchura 128, 4 cabezas, feedforward 512 |
| Parametros totales | 1.570.434 (variante por defecto); 2.750.082 (variante de 96 observaciones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 24 observaciones de historia por defecto; variante de 96 observaciones; plan futuro de 8 pasos de 15 minutos; horizontes de salida de 15/30/60/120 minutos |
| Tipos de cuantizacion | No disponible (checkpoints entrenados en FP32) |
| Idiomas soportados | No aplica (no es un modelo de lenguaje); vocabulario controlado de 20 campos numericos en dominios termico, tanque y bateria |
| Licencia | MIT |
| Formato de pesos | Checkpoint PyTorch `.pt` (`weights_only=True`) y bundle ONNX con esquema versionado, normalizacion, calibracion y evidencia de paridad |

## Arquitectura y entrenamiento

El modelo procesa un vocabulario controlado de 20 campos numericos pertenecientes a sistemas térmicos, de tanques y de baterías. Los metadatos aprendidos de campo, unidad y tipo-rol se combinan con los valores numéricos enmascarados y con codificadores temporales dedicados para el histórico y para el futuro. Cuatro bloques transformer pre-normalización (anchura 128, cuatro cabezas, feedforward 512) alimentan cabezas gaussianas compartidas que predicen cambios estandarizados y desviaciones estándar logarítmicas con recorte. Los prefijos causales específicos de cada consulta impiden que las acciones posteriores al horizonte solicitado influyan en dicho horizonte. Las salidas en unidades físicas requieren la lógica de normalización y decodificación versionada por separado: el ONNX por sí solo no es suficiente.

El entrenamiento usa FP32 con pérdida Gaussian NLL sobre los objetivos observados, optimizador AdamW con tasa 0,0003, decaimiento coseno tras calentamiento y recorte de gradiente en 1,0. Los sistemas de selección de modelo, calibración y test se mantienen separados. Las semillas del ensamblado transformer son 42/43/44. El conjunto de datos corto contiene 90 sistemas con dos días simulados (63 de entrenamiento, 14 de validación y 13 de test) y el entrenamiento usa 4.096 ventanas muestreadas durante ocho épocas. El conjunto completo de 1.200 sistemas y siete días (806.400 transiciones) se distribuye para experimentos posteriores, pero los pesos publicados **no** se han entrenado sobre él; los comandos de estudio completo (hasta 50 épocas y 150.000 ventanas) no se han ejecutado. Los datos son exclusivamente sintéticos, generados por simulador, y los parámetros ocultos del simulador nunca entran en los tensores neuronales.

## Capacidades

- Predicción multi-campo y multi-horizonte de la evolución de sistemas físicos numéricos en una sola pasada no autorregresiva.
- Condicionamiento por acciones: permite evaluar secuencias de acción alternativas para el mismo estado inicial.
- Salida probabilística: cada predicción incluye cambio estandarizado y desviación estándar logarítmica recortada, lo que habilita calibración e intervalos de incertidumbre.
- Identificación de sistemas en tres familias físicas: térmica, de tanques y de baterías.
- Inferencia causal por consulta, de modo que las acciones posteriores a un horizonte no contaminan la predicción de ese horizonte.
- Servicio HTTP tipado mediante FastAPI con endpoints `/v1/predict` y esquema de petición completo en `/docs`, con verificación de procedencia de pesos y normalización y rechazo de unidades desconocidas o controles inválidos.
- Exportación a ONNX como modelo único con esquema versionado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso genérico ni capacidades multilingües, de visión o de audio: no es un modelo de lenguaje.

## Casos de uso

- Gemelo digital de sistemas térmicos: el modelo predice la evolución de temperaturas a 15, 30, 60 y 120 minutos dado un histórico de 24 observaciones y un plan de acciones, lo que permite simular consignas de climatización antes de aplicarlas sobre el sistema real. Es adecuado porque su horizonte de salida coincide con pasos de 15 minutos.
- Gestión de depósitos y niveles: predicción probabilística del nivel y variables asociadas bajo distintas secuencias de llenado o vaciado, útil para planificar bombas y válvulas con margen de incertidumbre explícito.
- Gestión de carga de baterías: evaluación de estrategias de carga alternativas comparando la distribución predicha de las variables de estado, en lugar de una única trayectoria puntual.
- Comparación contrafactual de políticas de control: al ser condicionado por acciones y no autorregresivo, permite lanzar en una sola pasada varias secuencias de acción y comparar sus predicciones bajo el mismo estado inicial, algo útil en análisis what-if de operaciones.
- Detección de anomalías y monitorización: la desviación estándar logarítmica predicha puede usarse como señal de confianza; desviaciones observadas fuera del intervalo calibrado sugieren comportamiento fuera de distribución.
- Aprendizaje por refuerzo basado en modelo: el modelo puede actuar como simulador barato para entrenar o evaluar políticas sobre las familias térmica, de tanque y de batería, siempre que el entorno objetivo se parezca a los simuladores sintéticos empleados.
- Investigación en identificación de sistemas: sirve como banco de pruebas reproducible para comparar arquitecturas neuronales frente a líneas base como MLP, GRU, CatBoost o dinámica afín ajustada, gracias a los informes por familia, campo y horizonte incluidos.
- Despliegue embebido o en el borde: con 1,57 millones de parámetros y un bundle ONNX único, puede ejecutarse en CPU sin GPU dedicada para inferencia de baja latencia en control local.

## Benchmarks y rendimiento

MAE equilibrado por campo y horizonte, dividido por la desviación estándar de entrenamiento de cada campo, sobre las mismas 512 ventanas retenidas (menor es mejor):

| Modelo | Bateria | Tanque | Termico |
|---|---:|---:|---:|
| Transformer | 0.24644 | 0.20519 | 0.08072 |
| Ensamblado de tres miembros | 0.24397 | 0.20475 | 0.08037 |
| MLP | 0.26557 | 0.21290 | 0.09717 |
| GRU | 0.26920 | 0.22744 | 0.10626 |
| CatBoost | **0.17793** | **0.16986** | 0.08333 |
| Dinamica afin controlada ajustada | 0.19645 | 0.19399 | **0.05348** |
| Persistencia | 0.27418 | 0.20509 | 0.13506 |

Estas cifras promedian filas estandarizadas de campo y horizonte, por lo que no equivalen a errores en unidades físicas. El autor indica que los errores en unidades físicas y la Gaussian NLL se detallan en el informe remitido, pero esa parte del contenido no está disponible en la información proporcionada. No hay benchmarks de terceros publicados para este modelo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita en la documentación. Como referencia derivada del tamaño, un checkpoint de 1.570.434 parámetros en FP32 ocupa aproximadamente 6,3 MB, por lo que el peso en memoria es despreciable frente a cualquier GPU actual.
- GPU recomendadas: no disponibles. Ninguna GPU es necesaria; cualquier GPU con soporte CUDA sirve para acelerar la inferencia, pero el cuello de botella real es el preprocesado y la lógica de normalización.
- Compatibilidad con GPU de consumo: sí, cabe con holgura en cualquier GPU de consumo e incluso en CPU. También cabe en el bundle ONNX para entornos sin PyTorch.
- Opciones de despliegue: servicio FastAPI incluido en el repositorio(`uvicorn tfm.api.server:app`), inferencia directa con PyTorch y despliegue mediante runtime ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. No se han publicado medidas de latencia ni de rendimiento por segundo para ninguna configuración.
- Entorno: Python 3.12 recomendado, dependencias bloqueadas instalables con `uv sync --locked`. El repositorio ocupa 0,1 GB.

## Comparativa con modelos similares

No se conocen modelos fundacionales comparables de terceros en la información proporcionada. La comparación relevante es interna al propio repositorio, frente a las líneas base incluidas:

| Alternativa | Tipo | Ventaja observada frente al transformer |
|---|---|---|
| CatBoost | Gradiente boosting sobre descriptores | Menor MAE estandarizado en bateria (0.17793 vs 0.24644) y tanque (0.16986 vs 0.20519) |
| Dinamica afin controlada ajustada | Modelo fisico ajustado | Menor MAE estandarizado en termico (0.05348 vs 0.08072) y mejor en bateria que el transformer |
| MLP | Red densa | Peor en las tres familias; el transformer lo supera |
| GRU | Red recurrente | Peor en las tres familias; el transformer lo supera |
| Persistencia | Linea base trivial | Peor de forma general, salvo en tanque, donde queda practicamente a la par del transformer (0.20509 vs 0.20519) |

## Limitaciones y advertencias

- Estado de investigación declarado por el autor: prueba de concepto con entrenamiento corto y criterios de éxito no cumplidos. No debe presentarse como modelo listo para producción.
- Rendimiento inferior a líneas base no neuronales: CatBoost gana en batería y tanque, y la dinámica afín ajustada gana en térmico. El transformer solo supera a MLP, GRU y persistencia.
- Datos exclusivamente sintéticos, generados por simulador. No se ha integrado ningún conjunto de datos externo, por lo que la transferencia a sistemas reales no está demostrada.
- Los pesos publicados se entrenaron con 90 sistemas y dos días simulados (4.096 ventanas, ocho épocas), no con el conjunto completo de 1.200 sistemas y siete días.
- Sin transferencia zero-shot a esquemas arbitrarios y sin ventaja comercial declarada.
- El modelo depende de un vocabulario controlado de 20 campos y de metadatos de unidad y tipo-rol; unidades desconocidas o controles inválidos son rechazados, lo que limita su aplicación fuera de los dominios soportados.
- El ONNX por sí solo no basta para producir salidas en unidades físicas: se requiere la normalización y la decodificación versionadas aparte.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí existe riesgo de predicciones fuera de distribución con intervalos mal calibrados cuando el estado de entrada se aleja de los simuladores de entrenamiento. Un ejemplo incluido con histórico corto ya marca contexto insuficiente.
- Sesgos conocidos: no disponibles. No se documenta ningún análisis de sesgo, y al operar sobre datos sintéticos la noción de sesgo demográfico no aplica.
- Idiomas: no aplica; el modelo no procesa lenguaje natural.
- Licencia MIT, que permite uso comercial, modificación y redistribución con aviso de copyright y sin garantía. El autor, sin embargo, no reclama ninguna ventaja comercial.
- Advertencia de integridad: los pesos se distribuyen con inventario de checksums SHA256 y verificación de procedencia en tiempo de carga; conviene validar `SHA256SUMS` antes de usar los artefactos.
- Registro de adopción prácticamente nulo en el momento de la consulta: 0 descargas y 0 likes, lo que implica ausencia de validación externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maxffarrell/transition-foundation-model
- Guía de la CLI de HuggingFace: https://huggingface.co/docs/huggingface_hub/en/guides/cli
- Documentación de uso y comandos ejecutables: `docs/usage.md` (dentro del repositorio descargado)
- Informe de validación: `docs/validation.md`
- Contratos internos: `docs/contracts.md`
- Plan de validación externa: `docs/external-validation.md`
- Repositorio de código, simuladores, servicio FastAPI y tests: incluido en el propio repositorio de HuggingFace (no se proporciona URL separada de GitHub)
- Paper, blog o demo adicionales: no disponible
