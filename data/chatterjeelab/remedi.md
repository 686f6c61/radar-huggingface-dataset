# ChatterjeeLab/ReMEDi

## Resumen

ReMEDi (Replicate-Enabled Minimax Endpoint-Directed Inference) es una herramienta de diseño molecular in silico desarrollada por ChatterjeeLab y publicada en Hugging Face con licencia MIT. Su objetivo es generar pares de molécula y concentración capaces de acercar un sistema celular a un endpoint fenotípico deseado, partiendo de datos de perturbación de célula única. No es un modelo de lenguaje: es un pipeline estadístico y de optimización que opera sobre representaciones moleculares y celulares.

El método ajusta un ensemble de respuestas sobre características tratado-menoss-control, estima la incertidumbre conjunta de la pérdida de cada candidato a partir de réplicas y muestreos compartidos, y muestrea pares molécula-dosis mediante minimax regret regularizado por entropía. En su configuración ejecutable en CPU emplea huellas de Morgan y PCA de log-conteos ajustada solo con datos de entrenamiento; opcionalmente admite codificadores congelados (UCE para células, MolFormer para moléculas) como representaciones de mayor dimensionalidad.

Es relevante ahora porque conecta dos tendencias activas: los grandes atlas de perturbación (Tahoe-100M, sci-Plex3) y el diseño de experimentos guiado por incertidumbre. El repositorio está en fase inicial: 0 descargas, 0 likes, tamaño de 0.0 GB y sin pipeline declarado en el Hub, por lo que debe considerarse un artefacto de investigación reproducible más que un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de inferencia dirigida a endpoint: ensemble de cabezas de regresión (ridge) sobre representaciones moleculares y celulares, más un solver convexo de minimax regret regularizado por entropía; codificadores congelados opcionales (UCE, MolFormer) |
| Parametros totales | no disponible (no se publica recuento de parámetros; el número de componentes del ensemble se fija por CLI, por ejemplo `--ensemble 5`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; trabaja con features por célula, por compuesto y por condición de dosis) |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos cuantizados; se ejecuta como paquete Python) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | no disponible (el repo ocupa 0.0 GB y no se listan pesos publicados; los artefactos de entrenamiento se generan localmente en el directorio `runs/`) |

## Arquitectura y entrenamiento

El sistema se organiza en etapas encadenadas por CLI: `split`, `prepare`, `train`, `calibrate`, `evaluate`, `plot`, además de `demo` y un subcomando de codificación de moléculas. En `split`, las particiones se asignan por estructura molecular canónica, de modo que todas las dosis y réplicas de una misma estructura caen en el mismo split; la opción `--scaffold` genera particiones agrupadas por esqueleto de Murcko. En `prepare` se combinan conteos de ARN, estructuras moleculares, concentraciones, identificadores de línea celular y pools de control emparejados. En `train` se ajusta un ensemble (por ejemplo, 5 miembros) de cabezas ridge sobre la representación elegida, con umbrales de células por condición controlados por `--min-cells` y `--max-cells`.

La innovación principal está en la fase de muestreo: a partir de las predicciones del ensemble se estima la incertidumbre de pérdida conjunta de cada candidato usando réplicas y draws compartidos, y se seleccionan pares molécula-dosis mediante minimax regret con regularización de entropía. La calibración exige al menos tres compuestos reservados con mediciones repetidas, y la evaluación retrospectiva usa pools separados de réplicas y controles para construir el objetivo y para puntuar. El resultado incluye asignaciones de moléculas, features de condición, checkpoints de respuesta, calibración, ocho reglas de generación, muestras de pares del catálogo, mediciones por consulta y resúmenes por bootstrap de moléculas.

En cuanto a datos, el pipeline se ha probado con dos estudios. De Tahoe-100M se descargan shards oficiales de expresión y metadatos (por ejemplo, índices 600, 601 y 2600, que cubren las placas 6 y 14) y se realiza una comprobación basada en réplicas a 5 µM; el script une concentración por muestra, elimina el par CLS, convierte tokens de genes a identificadores Ensembl y retiene un reservorio reproducible por compuesto, dosis, línea celular y placa. De sci-Plex3 se usa la release corregida scPerturb v1.4 (aproximadamente 2,53 GB) con una cohorte acotada de A549 a 24 horas, 0,1 y 1 µM, con réplicas y controles emparejados por placa; las estructuras se unen por nombre exacto normalizado a mayúsculas contra los metadatos de Tahoe, y las nueve coincidencias exactas definen la prueba de integración. No se documenta RLHF ni DPO, ya que no es un modelo generativo de lenguaje.

## Capacidades

- Generación de pares molécula-dosis orientados a un endpoint celular definido por el usuario, a partir de un catálogo de compuestos suministrado.
- Modelado de respuesta dosis-respuesta con ajuste de ensemble y calibración sobre compuestos reservados con réplicas.
- Cuantificación de incertidumbre conjunta por candidato mediante draws compartidos, réplicas y bootstrap de moléculas.
- Selección de candidatos por minimax regret regularizado por entropía, con ocho reglas de generación documentadas.
- Integración de datos de perturbación heterogéneos (Tahoe-100M y sci-Plex3) con controles emparejados por placa y línea celular.
- Uso de representaciones alternativas: huellas de Morgan, PCA de log-conteos ajustada solo en entrenamiento, embeddings celulares UCE almacenados en `AnnData.obsm['X_uce']` y embeddings moleculares MolFormer con checkpoint fijado.
- Ejecución íntegra en CPU para la configuración ridge, la calibración y el solver convexo; la extracción con codificadores congelados requiere las dependencias opcionales `encoders`.
- Evaluación retrospectiva con separación estricta entre pools de construcción del objetivo y de puntuación.
- Exportación de resultados con gráficos PDF y PNG (orientados a Ubuntu) y resúmenes en CSV.
- Interfaz de línea de comandos y paquete Python instalable (`pip install -e '.[data,dev]'`), con batería de tests (`pytest`) y script de validación (`scripts/validate_release.py`).

No se documentan capacidades conversacionales, tool calling, razonamiento multi-paso de tipo agente, ni procesamiento de visión o audio.

## Casos de uso

- Priorización de compuestos antes de un experimento húmedo: dado un endpoint celular medible, el pipeline devuelve un conjunto de pares molécula-dosis con incertidumbre asociada, lo que permite reducir el número de condiciones a ensayar en laboratorio.
- Optimización de dosis en estudios dosis-respuesta: con cohortes como la de sci-Plex3 (A549, 24 h, 0,1 y 1 µM) el modelo puede interpolar y proponer concentraciones candidatas evitando regímenes de respuesta plana o saturada.
- Reutilización de atlas públicos de perturbación: el script `prepare_tahoe.py` acepta cualquier colección de shards oficiales de expresión, de modo que un grupo puede construir su propia cohorte a partir de las placas que le interesen y entrenar sobre ella.
- Integración de estudios heterogéneos: la unión por nombre normalizado entre sci-Plex3 y los metadatos de Tahoe permite verificar correspondencias de compuestos y construir pruebas de integración entre ambos conjuntos de datos.
- Evaluación retrospectiva de hipótesis terapéuticas: las consultas retrospectivas con pools separados de réplicas y controles permiten estimar si el método habría recuperado compuestos activos conocidos en un conjunto reservado.
- Reposicionamiento de fármacos sobre catálogos existentes: si se dispone de un catálogo de estructuras y concentraciones ya medidas, el muestreo por minimax regret puede reordenar ese catálogo según la probabilidad de alcanzar el endpoint objetivo.
- Comparación de representaciones biológicas: el mismo pipeline admite huellas de Morgan, PCA de log-conteos, UCE y MolFormer, lo que permite medir de forma controlada el efecto de la representación sobre la calidad de las recomendaciones.
- Control de calidad de lotes y placas: los metadatos de placa y el emparejamiento de controles por placa permiten detectar condiciones con reservorio insuficiente o respuestas anómalas antes de entrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el procedimiento de validación (`python scripts/validate_release.py --output runs/validation`, con fixtures medidas incluidas en `examples/`) y menciona comprobaciones de integración tanto en Tahoe-100M como en sci-Plex3, además de transferencia externa congelada, pero no se aportan métricas numéricas en la información proporcionada. Los resultados de búsqueda web recibidos corresponden a páginas genéricas de Reddit y no contienen datos técnicos ni comparativas del modelo.

## Requisitos de hardware

- La configuración ejecutable por defecto (huellas de Morgan más PCA de log-conteos, cabeza ridge, calibración y solver convexo) funciona en CPU, según indica la propia model card.
- La extracción de embeddings con codificadores congelados (UCE para células, MolFormer para moléculas) requiere las dependencias opcionales `encoders`; no se especifica VRAM necesaria.
- GPU recomendadas: no disponible.
- VRAM estimada para inferencia según cuantización: no aplicable o no disponible (no se distribuyen pesos cuantizados).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: paquete Python instalable con `pip install -e '.[data,dev]'`, más la CLI `remedi` y los scripts `scripts/download_data.py`, `scripts/prepare_tahoe.py`, `scripts/fetch_sciplex_subset.py`, `scripts/run_pipeline.py` y `scripts/validate_release.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Entorno recomendado: Python 3.11 o 3.12 sobre Linux (la release se probó con Python 3.12).
- Almacenamiento: el fichero completo corregido de sci-Plex3 ocupa aproximadamente 2,53 GB; los shards de Tahoe se descargan por índice y el script de subconjunto admite caché por rangos de bytes.
- Límites de cohorte usados en los ejemplos: `--cap 128` en Tahoe, `--cells-per-condition 32 --max-molecules 40` en sci-Plex3, `--min-cells 8 --max-cells 32`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han proporcionado datos comparativos en la información disponible, y los resultados de búsqueda recibidos no contienen referencias técnicas utilizables. A continuación se indican posibles alternativas de la misma categoría (modelos de perturbación y de respuesta a fármacos a partir de datos de célula única) a título orientativo, marcando como "no disponible" todo dato no verificado en la documentación analizada.

| Modelo | Enfoque | Tarea | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|---|
| ReMEDi (ChatterjeeLab) | Ensemble ridge + minimax regret con representaciones congeladas opcionales | Selección de pares molécula-dosis para un endpoint celular | no disponible | no disponible | MIT | no disponible | Hugging Face, repo de 0.0 GB, 0 descargas |
| CPA / chemCPA | Autoencoder composicional para perturbaciones químicas y genéticas | Predicción de respuesta transcriptómica a perturbaciones | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| scGPT | Transformer preentrenado sobre células únicas | Anotación, integración y predicción de perturbaciones | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Geneformer | Transformer preentrenado sobre redes de expresión génica | Representación de células y predicción de sensibilidad | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

## Limitaciones y advertencias

- El repositorio está en estado incipiente: 0 descargas, 0 likes, tamaño de 0.0 GB y ningún pipeline declarado en el Hub. No debe asumirse soporte ni mantenimiento continuado.
- La model card proporcionada está truncada (termina en el subcomando `remedi encode-`), por lo que parte de la documentación de codificación molecular y de configuración avanzada no está disponible para su revisión.
- Las fechas de creación y actualización del Hub figuran como 2026-09-12, posteriores a la fecha habitual de consulta; conviene verificar si se trata de una errata de metadatos.
- La generación real depende de que el usuario aporte un catálogo real de compuestos medidos; el catálogo de ejemplo contiene compuestos de la propia cohorte, y usarlo como catálogo de generación produciría resultados no extrapolables.
- El emparejamiento de estructuras en sci-Plex3 se basa en coincidencia exacta de nombres normalizados a mayúsculas; solo nueve compuestos coinciden, y ampliar el experimento exige un mapeo `drug,smiles` verificado de forma independiente.
- Cualquier comparación científica requiere seleccionar el umbral de tolerancia (distancia de endpoint al cuadrado) sobre datos de validación; el valor usado en los ejemplos (`--tolerance 1`) es solo una comprobación de integración.
- La calibración exige al menos tres compuestos reservados con mediciones repetidas; con cohortes pequeñas esta condición puede no cumplirse y la incertidumbre estimada no será fiable.
- La calidad de las recomendaciones está acotada por la representación elegida: las huellas de Morgan y la PCA de log-conteos son líneas base explícitas, y los codificadores congelados exigen fijar checkpoints concretos para reproducibilidad.
- La herramienta devuelve hipótesis computacionales, no validación biológica. Ningún resultado debe interpretarse como evidencia de eficacia o seguridad de un compuesto sin experimentación húmeda.
- El idioma de la documentación y del proyecto es únicamente inglés (`en`), y no se documentan capacidades multilingües.
- Riesgo de sesgo por composición del dataset: los estudios usados cubren un número reducido de placas, líneas celulares y dosis, por lo que las recomendaciones heredan las limitaciones de esas condiciones experimentales.
- Licencia MIT: permite uso comercial y modificación con atribución, pero no ofrece garantías ni asume responsabilidad sobre los resultados.
- Sin resultados de benchmarks publicados en la información disponible, no es posible situar su rendimiento frente a alternativas de la misma categoría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ChatterjeeLab/ReMEDi
- sci-Plex3 corregido (scPerturb v1.4) en Zenodo: https://doi.org/10.5281/zenodo.13350497
- Implementación de UCE (Snap Stanford): https://github.com/snap-stanford/UCE
- Artículo, blog o demo del autor: no disponible en la información proporcionada
