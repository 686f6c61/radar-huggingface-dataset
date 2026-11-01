# mangaba-ai/jepa-fraude-ulb-weights

## Resumen

JEPA + HGB blend para detección de fraude es un artefacto de pesos publicado por mangaba-ai en HuggingFace bajo el pipeline `tabular-classification`. No se trata de un modelo de lenguaje, sino de un conjunto de pesos para un clasificador tabular de fraude: seis encoders JEPA (Joint Embedding Predictive Architecture) entrenados de forma auto-supervisada sobre ventanas de 32 transacciones consecutivas del dataset ULB (el conocido `creditcard.csv` de Kaggle), más cinco modelos HistGradientBoosting (HGB) de scikit-learn, combinados mediante un blend por rangos con peso 0,25 para JEPA y 0,75 para HGB.

El modelo resuelve el problema clásico de detección de fraude en tarjetas de crédito con datos altamente desbalanceados y sin identificador de cliente, abordándolo con un enfoque híbrido: representaciones auto-supervisadas sobre secuencias de transacciones (JEPA) combinadas con un baseline tabular robusto (HGB). La relevancia actual es metodológica: explora si el preentrenamiento auto-supervisado tipo JEPA aporta valor sobre un gradient boosting bien ajustado en datos tabulares con estructura temporal débil.

El resultado declarado por el autor es que el blend supera al HGB en AP de validación (0,8087 frente a 0,7952), pero la ventaja es pequeña y no estadísticamente significativa (IC 95% por bootstrap pareado de −0,010 a +0,045, que incluye cero). El repositorio ocupa 0,1 GB y solo contiene pesos: el código de inferencia, preprocesado y entrenamiento es privado, por lo que los ficheros no son ejecutables directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JEPA (encoder Transformer pre-norm con predictor de 2 capas y target EMA) + HistGradientBoosting; blend por ranks |
| Parametros totales | no disponible (el autor no publica recuento; la configuracion JEPA usa 8 capas, dimension 192 y 4 cabezas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (ventanas fijas de 32 transacciones consecutivas) |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `.pt` y `.pkl` de scikit-learn) |
| Idiomas soportados | no disponible (modelo tabular, no procesa texto) |
| Licencia | `mangaba-proprietary` (licencia propietaria, fichero `LICENSE` en el repo) |
| Formato de pesos | `.pt` (PyTorch) para los 6 encoders JEPA; `.pkl` (scikit-learn) para los 5 modelos HGB |

## Arquitectura y entrenamiento

El componente JEPA es un encoder Transformer pre-norm con 8 capas, dimensión 192 y 4 cabezas de atención. Sobre las posiciones enmascaradas se aplica un predictor de 2 capas, con target generado por una copia EMA del encoder (EMA inicial 0,9966) y una máscara del 45,6%. Para evitar el colapso de representaciones se usan términos de varianza y covarianza tipo VICReg, con peso de covarianza 0,015. El preentrenamiento auto-supervisado se ejecuta con learning rate 1,28e-4 durante 1500 pasos. Posteriormente se hace fine-tune con pérdida BCE y peso de clase, con learning rate 8,95e-5 para el encoder y 1e-3 para la cabeza, 6 épocas y selección por AP en el conjunto de desarrollo. La cabeza de clasificación opera sobre la media y el máximo de los embeddings de las posiciones válidas.

El componente HGB se entrena solo con el conjunto de entrenamiento, con cinco semillas, usando features agregadas por ventana: media, desviación típica, máximo y mínimo. El blend final combina ambos modelos por rangos (no por probabilidades), con peso 0,25 para JEPA y 0,75 para HGB, pesos fijados antes de la evaluación de validación. La división de datos es temporal 70/10/20 sobre el dataset ULB, con ventanas construidas artificialmente de 32 transacciones consecutivas. El autor declara explícitamente que el dev se usó para elegir la configuración del JEPA y que la validación ya había sido consultada antes de la evaluación final, por lo que no se trata de un test ciego.

## Capacidades

- Clasificación binaria de fraude sobre ventanas de 32 transacciones tabulares consecutivas.
- Representaciones auto-supervisadas de secuencias cortas de transacciones mediante JEPA.
- Blend con HistGradientBoosting para robustez frente al desbalanceo extremo de clases.
- Agregación de features por ventana (media, desviación, máximo, mínimo) en el componente HGB.
- Ensemble de 6 semillas para el JEPA y 5 semillas para el HGB, con media de probabilidades (JEPA) y blend por rangos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un clasificador tabular, no un modelo generativo.
- No procesa texto, imagen ni audio.

## Casos de uso

- Detección de fraude en tarjetas de crédito sobre el dataset ULB: reproducción del experimento del autor como baseline para comparar enfoques auto-supervisados frente a gradient boosting en datos tabulares desbalanceados. Adecuado por la métrica AP reportada (0,8087 en validación) y el protocolo documentado.
- Investigación metodológica sobre JEPA en datos tabulares: el artefacto permite estudiar si el preentrenamiento auto-supervisado con target EMA aporta señal sobre un HGB bien ajustado, dado que el autor documenta la configuración exacta (8 capas, dim 192, 4 cabezas, máscara 0,456).
- Benchmark de blends por rangos frente a blends por probabilidad: el autor advierte que el blend por ranks depende del lote y no produce probabilidades calibradas, lo que lo convierte en un caso de estudio útil sobre calibración en producción.
- Evaluación de significancia estadística en modelos de fraude: el repositorio incluye el IC 95% por bootstrap pareado (−0,010 a +0,045), útil como ejemplo de reporte riguroso con pocos positivos (30 en dev, 68 en validación).
- Docencia y formación en detección de fraude: como ejemplo didáctico de pipeline completo (preentrenamiento auto-supervisado, fine-tune con BCE, ensemble por semillas, blend con baseline).
- Punto de partida para experimentos con identificador de cliente: el autor señala que el ULB no tiene ID de cliente, por lo que el estudio no evalúa modelos de secuencia por cliente, que es la aplicación más relevante en producción; el artefacto sirve como referencia para extender el enfoque a datos con ID.

## Benchmarks y rendimiento

Datos reportados por el autor sobre el dataset ULB con división temporal 70/10/20 y ventanas de 32 transacciones:

| Modelo | AP dev | AUC dev | AP val | AUC val |
|---|---|---|---|---|
| HGB (5 semillas, entrenamiento) | 0,8798 | 0,9827 | 0,7952 | 0,9240 |
| JEPA (ensemble de 6 semillas) | 0,8776 | 0,9524 | 0,8194 | 0,9228 |
| Blend 0,25 JEPA + 0,75 HGB | 0,8854 | 0,9817 | 0,8087 | 0,9292 |

Advertencias del autor sobre estos números: la diferencia de AP del blend frente al HGB en validación es +0,013 con IC 95% de −0,010 a +0,045 (incluye cero); el dev se usó para elegir la configuración del JEPA y la validación ya había sido consultada, por lo que no es un test ciego; el dev tiene 30 positivos y la validación 68, por lo que diferencias por debajo de 0,01 de AP no son fiables; en el dev el blend queda ligeramente por debajo del HGB en AUC (0,9817 frente a 0,9827); y el blend por rangos depende del lote y no produce probabilidades calibradas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repo ocupa 0,1 GB, lo que sugiere que los pesos caben holgadamente en cualquier GPU consumer, pero el autor no publica estimaciones de VRAM.
- GPU recomendadas: no disponible. El componente JEPA es un Transformer de 8 capas y dimensión 192, de tamaño reducido, pero no se especifican requisitos.
- Cabe en GPU consumer: previsiblemente sí por el tamaño del repo (0,1 GB), aunque no está confirmado por el autor.
- Opciones de despliegue: no disponible. Los pesos están en PyTorch (`.pt`) y scikit-learn (`.pkl`), pero el código de inferencia y preprocesado es privado, por lo que no se puede desplegar directamente sin acceso a los mantenedores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AP val (ULB) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JEPA + HGB blend (mangaba-ai) | no disponible (JEPA 8 capas, dim 192) | ventanas de 32 transacciones | 0,8087 | propietaria (`mangaba-proprietary`) | pesos públicos, código privado |
| HGB solo (baseline del autor) | no aplica (gradient boosting) | ventanas de 32 transacciones | 0,7952 | no disponible | incluido en el repo como `.pkl` |
| JEPA solo (ensemble 6 semillas) | no disponible | ventanas de 32 transacciones | 0,8194 | propietaria | incluido en el repo como `.pt` |
| Alternativas externas de detección de fraude en ULB | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos externos comparables en la información proporcionada; la comparativa se limita a los tres componentes internos del propio artefacto.

## Limitaciones y advertencias

- La ventaja del blend sobre el HGB es pequeña (+0,013 AP en validación) y no está confirmada estadísticamente: el IC 95% por bootstrap pareado va de −0,010 a +0,045 e incluye cero.
- El dev se usó para elegir la configuración del JEPA y la validación ya había sido consultada antes de la evaluación final; no es un test ciego.
- Tamaño muestral muy reducido: 30 positivos en dev y 68 en validación; diferencias por debajo de 0,01 de AP no son fiables.
- El blend por rangos depende del lote y las puntuaciones no son probabilidades calibradas; no debe usarse directamente como probabilidad de fraude en producción.
- Resultado de un único dataset público (ULB) con ventanas construidas artificialmente; no se ha probado en datos reales de clientes.
- El ULB no tiene identificador de cliente, por lo que el estudio no evalúa modelos de secuencia por cliente, que es la aplicación más relevante en producción.
- Los pesos son públicos pero el código de inferencia, el preprocesado y los scripts de entrenamiento son privados; sin ese código los ficheros no son ejecutables de forma directa.
- Licencia propietaria (`mangaba-proprietary`): el uso comercial requiere consultar los términos del fichero `LICENSE` y contactar con los mantenedores.
- El dataset ULB no se redistribuye; debe obtenerse de `David-Egea/Creditcard-fraud-detection` bajo su licencia original.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual de modelos generativos, pero sí existe riesgo de sobreajuste a las particularidades del dataset ULB y de generalización deficiente a otras poblaciones de fraude.

## Enlaces

- HuggingFace: https://huggingface.co/mangaba-ai/jepa-fraude-ulb-weights
- Dataset ULB (espejo en HuggingFace): https://huggingface.co/datasets/David-Egea/Creditcard-fraud-detection
- Dataset original en Kaggle: https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud
- Licencia del modelo: fichero `LICENSE` dentro del repositorio de HuggingFace
- Paper de JEPA (referencia metodológica): no disponible en la información proporcionada
- Repositorio de código de inferencia o entrenamiento: no disponible (privado según el autor)
