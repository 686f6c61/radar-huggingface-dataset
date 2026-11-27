# AbdulSittar/tft-scheduler-runtime

## Resumen

TFT Scheduler Runtime es una colección de modelos Temporal Fusion Transformer (TFT) publicada por Abdul Sittar para la predicción de secuencias temporales en simulaciones sociales basadas en agentes. El repositorio agrupa tres variantes especializadas por dominio —clima, COVID y tecnología— entrenadas para predecir la evolución temporal de acciones de usuario, publicaciones e interacciones en cada uno de esos contextos. Se distribuye bajo licencia Apache 2.0 y está implementado en PyTorch / PyTorch Lightning.

A pesar de que la model card lo etiqueta con el pipeline `text-generation`, el modelo no es un modelo de lenguaje generativo: es un conjunto de checkpoints TFT (`.ckpt`) acompañados de codificadores en formato NumPy (`.npy`) para usuarios, publicaciones y acciones. Su propósito declarado es la investigación, la simulación y el pronóstico temporal específico de dominio, no la generación de texto libre.

El interés actual del artefacto reside en su uso como componente de pronóstico dentro de simulaciones de redes sociales a escala, apoyadas en el dataset Social Graph Inference Reddit (más de un millón de publicaciones y comentarios por dominio). No se han publicado en la información disponible datos sobre arquitectura interna detallada, número de parámetros, longitud de contexto ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Temporal Fusion Transformer (TFT) basado en PyTorch / PyTorch Lightning |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints `.ckpt` en precisión original) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.ckpt` (Git LFS) + codificadores `.npy` |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Temporal Fusion Transformer, un diseño de atención para series temporales multivariantes que combina mecanismos de atención interpretable, redes de selección de variables y capas recurrentes para capturar dependencias a largo plazo. La información disponible no detalla el número de capas, dimensiones ocultas ni la configuración exacta de atención de cada checkpoint.

El entrenamiento se realizó sobre el dataset Social Graph Inference Reddit (Zenodo, registro 18082502), creado por Sittar, Guček y Češnovar. El dataset incluye 33 agentes centrados en tecnología, 14 en clima y 7 en COVID, cada dominio con más de un millón de publicaciones y comentarios, y define redes dirigidas y ponderadas de interacciones entre agentes. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron técnicas de RLHF o DPO (poco probables en un modelo de pronóstico temporal). El repositorio incluye etiquetas PEFT, lo que sugiere la posible presencia de adaptadores de ajuste eficiente, aunque no se detalla su uso.

## Capacidades

- Pronóstico de secuencias temporales de acciones de usuario, publicaciones e interacciones en tres dominios: clima, COVID y tecnología.
- Simulación de evolución temporal de interacciones en redes sociales basadas en agentes.
- Codificación de usuarios, publicaciones y acciones mediante codificadores NumPy preentrenados.
- Mantenimiento de estado de secuencia previo (`last_sequence.npy`) para continuar simulaciones.
- Uso en investigación y simulación social; no está diseñado para generación de texto libre.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible como capacidad del modelo; se usa dentro de pipelines de simulación.
- Capacidades multilingües: no; solo inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Simulación de dinámicas de opinión en climate: el modelo predice cómo evolucionan las interacciones de los 14 agentes climáticos del dataset a lo largo del tiempo, permitiendo estudiar la propagación de narrativas ambientales en una red social sintética.
- Modelado de difusión de información sobre COVID: con los 7 agentes COVID del dataset, se pueden simular cadenas de publicación y respuesta para analizar cómo se propaga la desinformación sanitaria en entornos controlados.
- Análisis de adopción tecnológica: usando los 33 agentes de tecnología, el modelo permite proyectar la evolución de interacciones en torno a productos o tendencias tecnológicas y comparar escenarios contrafactuales.
- Investigación en ciencias sociales computacionales: el TFT sirve como componente de pronóstico dentro de simulaciones basadas en agentes (ABM), donde el estado futuro de la red se genera a partir del estado actual codificado.
- Evaluación de políticas de moderación: simulando la evolución de interacciones bajo distintas reglas de intervención, se puede estimar el impacto en la dinámica de la comunidad antes de desplegar cambios reales.
- Generación de trayectorias sintéticas para aumento de datos: las secuencias pronosticadas pueden emplearse para ampliar datasets de interacción social en dominios con pocos datos etiquetados.
- Reproducibilidad de experimentos: al incluir checkpoints, codificadores y estado de secuencia, el repositorio facilita la replicación de estudios de simulación social con el dataset de Reddit asociado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio (1,5 GB) sugiere checkpoints de tamaño moderado, pero no se especifica la huella en memoria de cada modelo TFT.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el ejemplo de la model card carga el modelo en CPU (`map_location="cpu"`), lo que indica que la inferencia en CPU es viable.
- Opciones de despliegue: PyTorch / PyTorch Lightning nativo; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un TFT).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Dominios | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TFT Scheduler Runtime | TFT (pronóstico temporal) | Clima, COVID, Tecnología | no disponible | Apache 2.0 | Hugging Face |
| Alternativas TFT genéricas (p. ej. pytorch-forecasting) | TFT | Genérico | no disponible | MIT (librería) | PyPI / GitHub |
| Otros modelos de simulación social basados en Reddit | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría; los modelos TFT de librerías genéricas no están entrenados sobre el dataset Social Graph Inference Reddit y no son directamente comparables en rendimiento.

## Limitaciones y advertencias

- El pipeline declarado (`text-generation`) no se corresponde con la naturaleza real del modelo, que es de pronóstico temporal; puede inducir a error en herramientas automáticas de descubrimiento.
- Solo soporta inglés, lo que limita su aplicabilidad a comunidades en otros idiomas.
- El modelo está entrenado sobre un dataset específico de Reddit con un número reducido de agentes por dominio (33, 14 y 7), por lo que su generalización a otras redes o poblaciones no está validada.
- Riesgo de sesgo heredado del corpus de Reddit: sobrerrepresentación de ciertos temas, estilos de interacción y comunidades angloparlantes.
- No se documentan métricas de error (MAE, RMSE, etc.) ni validación externa, lo que impide evaluar su fiabilidad en producción.
- La licencia Apache 2.0 permite uso comercial y modificación con atribución, pero el dataset subyacente puede tener condiciones adicionales que deben verificarse en Zenodo.
- No apto para generación de texto ni para tareas de razonamiento lingüístico; su uso indebido en esos contextos produciría resultados sin sentido.
- La ausencia de información sobre parámetros, contexto y benchmarks dificulta la planificación de recursos en despliegues reales.

## Enlaces

- Hugging Face: https://huggingface.co/AbdulSittar/tft-scheduler-runtime
- Dataset Social Graph Inference Reddit (Zenodo): https://zenodo.org/records/18082502
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Proyecto TWON (financiación): no disponible enlace directo en la información proporcionada
