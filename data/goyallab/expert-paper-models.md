# GoyalLab/ExPert-paper-models

## Resumen

ExPert-paper-models es un repositorio de checkpoints auxiliares del modelo ExPert, desarrollado por GoyalLab, orientado a la predicción de efectos de perturbaciones genéticas en datos de célula única (perturb-seq y scRNA-seq). No se trata de un modelo de lenguaje: es un modelo biológico de tipo "expert-model" que predice cómo responde el transcriptoma celular ante una perturbación (por ejemplo, un knockout génico), una tarea central en genómica funcional y descubrimiento de fármacos.

Este repositorio concreto no contiene el modelo de producción, sino los checkpoints adicionales que respaldan las figuras de benchmark y ablación del artículo de ExPert. Incluye 12 modelos de validación cruzada (fold0 a fold11), cada uno dejando fuera un contexto distinto (línea celular, donante o condición), una rama de ablación con "gated prior pull" (EFFGATE3) y un banco de prototipos en formato NumPy. El modelo recomendado para uso real es GoyalLab/ExPert.

La relevancia de estos checkpoints es metodológica: permiten reproducir la evaluación out-of-distribution del artículo y auditar las decisiones de diseño del modelo. El repositorio pesa 26,8 GB y se distribuye bajo licencia MIT, con código asociado en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo biológico de predicción de perturbaciones; no es un transformer de lenguaje) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre perfiles de expresión génica, no sobre secuencias de texto) |
| Tipos de cuantizacion | no disponible (pesos en `model.pt`, formato PyTorch) |
| Idiomas soportados | no aplica (modelo biológico, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt`) + `gene_embeddings.npz` + banco NumPy (`banks/v0.1.0_fullbank_oldfill.npz`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (capas, dimensiones latentes, mecanismo de atención o composición exacta). Lo que sí se documenta es la estructura del repositorio: 12 checkpoints de validación cruzada (`fold0` a `fold11`), cada uno entrenado excluyendo un contexto concreto (línea celular, donante o condición), lo que permite medir generalización out-of-distribution. Además, `EFFGATE3` es la rama de ablación que incorpora un "prior pull" con compuerta (gated prior pull), usada para las figuras de ablación del artículo.

El banco `banks/v0.1.0_fullbank_oldfill.npz` contiene los prototipos de la versión v0.1.0 con un relleno anterior para genes que nunca fueron perturbados en entrenamiento (las filas entrenadas son idénticas a las del modelo). El archivo NumPy incluye las claves `P` (perturbaciones × dimensiones latentes), `labels` y `trained`. No se especifican en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF/DPO (conceptos, por otra parte, propios de modelos de lenguaje y no aplicables directamente aquí).

## Capacidades

- Predicción de efectos de perturbaciones génicas sobre perfiles de expresión de célula única (perturb-seq).
- Evaluación out-of-distribution mediante los 12 folds de validación cruzada, cada uno con un contexto retenido.
- Reproducción de las figuras de benchmark y ablación del artículo de ExPert.
- Análisis de ablación del mecanismo de prior pull mediante el checkpoint EFFGATE3.
- Lecturas específicas para ALD y PMD a partir del banco de prototipos v0.1.0.
- Carga estandarizada mediante la librería `expert` y `huggingface_hub`.

## Casos de uso

- Reproducción de benchmarks del artículo: descargar los folds 0 a 11 y ejecutar los scripts de `paper/` del repositorio GitHub para replicar las métricas de generalización out-of-distribution publicadas.
- Auditoría metodológica: comparar el rendimiento de cada fold para identificar en qué contextos (línea celular, donante, condición) el modelo generaliza peor, informando decisiones de validación en proyectos propios.
- Estudio de ablación: usar EFFGATE3 frente al modelo de producción para cuantificar la contribución del prior pull gated en la precisión de predicción.
- Análisis de genes no perturbados: emplear el banco `v0.1.0_fullbank_oldfill.npz` para examinar cómo se rellenan los prototipos de genes ausentes en entrenamiento y su impacto en las lecturas de ALD y PMD.
- Investigación en genómica funcional: integrar los checkpoints en pipelines de análisis de perturb-seq para priorizar hipótesis sobre efectos de knockouts antes de experimentos húmedos.
- Desarrollo de métodos: servir como línea base reproducible para comparar nuevas arquitecturas de predicción de perturbaciones contra los resultados del artículo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que estos checkpoints respaldan las figuras de benchmark y ablación del artículo, pero no incluye cifras concretas ni referencias al preprint (marcado como "to be added").

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio completo ocupa 26,8 GB, pero el tamaño de cada checkpoint individual (`model.pt` + `gene_embeddings.npz`) no se especifica.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no determinada; depende del tamaño de cada checkpoint, que no se detalla.
- Opciones de despliegue: carga mediante la librería `expert` (`ExPert.load(...)`) y descarga selectiva con `huggingface_hub.snapshot_download` usando `allow_patterns` para bajar solo un fold.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación cuantitativa con otras arquitecturas de predicción de perturbaciones.

## Limitaciones y advertencias

- Este repositorio no es el modelo de producción: para uso con datos propios debe emplearse GoyalLab/ExPert.
- Cada fold retiene deliberadamente un contexto; usar un fold concreto para inferencia introduce sesgo respecto al contexto excluido.
- El banco de prototipos usa un relleno antiguo para genes nunca perturbados en entrenamiento, lo que puede afectar a predicciones sobre esos genes.
- No se documentan sesgos específicos del modelo ni tasas de error en la información disponible.
- No se especifican limitaciones de idioma (no aplica) ni restricciones de contexto.
- La licencia MIT permite uso comercial, pero no se detallan condiciones adicionales sobre los datos de entrenamiento.
- El preprint aún no está referenciado, lo que dificulta la verificación independiente de los resultados.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria documentada.

## Enlaces

- Hugging Face: https://huggingface.co/GoyalLab/ExPert-paper-models
- Modelo de producción: https://huggingface.co/GoyalLab/ExPert
- Código y scripts: https://github.com/GoyalLab/ExPert
- Preprint: no disponible (pendiente de añadir según la model card)
