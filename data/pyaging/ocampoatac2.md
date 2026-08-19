# pyaging/ocampoatac2

## Resumen

`pyaging/ocampoatac2` es un reloj de envejecimiento (aging clock) basado en accesibilidad de cromatina, desarrollado por el grupo de Morandini et al. y empaquetado dentro del ecosistema `pyaging`. Predice la edad cronológica de un individuo a partir de datos de accesibilidad de cromatina (ATAC-seq) obtenidos de células mononucleares de sangre periférica (PBMC) humanas. Se trata de un modelo de regresión lineal con regularización elastic net, publicado originalmente en 2023 y descrito en el artículo "ATAC-clock: An aging clock based on chromatin accessibility" (GeroScience, 2024).

Este modelo no es un modelo de lenguaje ni un sistema de IA generativa; es una herramienta bioinformática específica para estudios de envejecimiento epigenético. Su relevancia radica en que la accesibilidad de la cromatina es un marcador dinámico que refleja cambios relacionados con la edad, y este reloj permite cuantificar dichos cambios de forma reproducible. La implementación empaquetada en `pyaging` reproduce los coeficientes finales sin corrección por composición celular, tal y como se indica en la model card, por lo que debe usarse con precaución en aplicaciones donde la mezcla de tipos celulares pueda confundir la estimación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión lineal con regularización elastic net |
| Parametros totales | no disponible (coeficientes de regresión, número no especificado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no procesa texto) |
| Tipos de cuantizacion | no aplica (modelo estadístico, no red neuronal) |
| Idiomas soportados | no aplica |
| Licencia | BSD-3-Clause |
| Formato de pesos | no disponible (coeficientes en archivo TSV, cargados por la librería `pyaging`) |

## Arquitectura y entrenamiento

El modelo es una regresión elastic net, que combina penalizaciones L1 y L2 para seleccionar características relevantes entre las regiones de cromatina accesible. Se entrena sobre datos de ATAC-seq de células mononucleares de sangre periférica (PBMC) humanas, con el objetivo de predecir la edad cronológica. Los detalles exactos del conjunto de entrenamiento (número de muestras, composición, procesamiento) no se especifican en la información disponible. La implementación en `pyaging` carga los coeficientes finales publicados por los autores (archivo `final_coefs.tsv`) y los aplica a nuevas muestras. No se menciona el uso de técnicas como RLHF o DPO, que no son aplicables a este tipo de modelo.

## Capacidades

- Predicción de edad cronológica a partir de datos de accesibilidad de cromatina.
- Entrada: matriz de accesibilidad de regiones genómicas (formato AnnData, integrable con `pyaging`).
- Salida: edad estimada en años.
- Funciona exclusivamente con datos de PBMC humanas.
- No requiere entrenamiento adicional para su uso; es un modelo preentrenado con coeficientes fijos.
- Integración sencilla en pipelines de análisis bioinformático mediante la librería `pyaging`.
- No soporta generación de texto, razonamiento, código, visión ni otras capacidades propias de modelos de lenguaje.

## Casos de uso

- Estudios de envejecimiento biológico: permite estimar la edad epigenética a partir de ATAC-seq, útil para investigar la relación entre accesibilidad de cromatina y procesos de envejecimiento.
- Validación de biomarcadores: puede utilizarse para comparar la edad estimada con la edad cronológica en cohortes de pacientes y evaluar la aceleración del envejecimiento.
- Análisis de intervenciones anti-envejecimiento: en estudios preclínicos o clínicos, el reloj puede servir como medida de resultado para evaluar si una intervención (farmacológica, dietética, etc.) modifica la edad epigenética.
- Investigación de enfermedades relacionadas con la edad: se puede aplicar a datos de ATAC-seq de pacientes para explorar si la desviación de la edad estimada se asocia con patologías.
- Control de calidad en experimentos de ATAC-seq: al comparar la edad predicha con la edad real de las muestras, se puede detectar artefactos técnicos o problemas de procesamiento.
- Docencia y formación en bioinformática: como ejemplo de aplicación de regresión elastic net en datos ómicos, integrado en un ecosistema de código abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas de rendimiento (como correlación con la edad real, error absoluto medio, etc.) en la model card ni en los metadatos asociados.

## Requisitos de hardware

- No requiere GPU: al ser un modelo de regresión lineal con un número reducido de coeficientes, la inferencia es extremadamente ligera y puede ejecutarse en cualquier CPU.
- Memoria RAM: depende del tamaño del dataset de entrada, pero para una muestra típica de ATAC-seq (matriz de accesibilidad por regiones) el consumo es mínimo (menos de 1 GB).
- Almacenamiento: el repositorio del modelo ocupa 0.0 GB (los coeficientes se cargan desde un archivo TSV de pequeño tamaño).
- Despliegue: se integra en Python mediante la librería `pyaging`; no requiere infraestructura de servidores ni herramientas como vLLM, llama.cpp u Ollama.

## Comparativa con modelos similares

No se dispone de información comparativa con otros relojes de envejecimiento basados en accesibilidad de cromatina en la documentación proporcionada. Existen otros relojes epigenéticos (por ejemplo, basados en metilación de ADN como Horvath o PhenoAge), pero no se dispone de datos de rendimiento para establecer una comparación cuantitativa con `ocampoatac2`. La comparativa queda pendiente de datos publicados.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para datos de accesibilidad de cromatina de PBMC humanas; su uso con otros tejidos o especies puede producir resultados inválidos.
- La model card advierte explícitamente que esta implementación no está corregida por composición celular, lo que puede introducir sesgos si la mezcla de tipos celulares varía entre muestras.
- No se han publicado métricas de validación en la información disponible, por lo que se desconoce su precisión y robustez.
- Al ser un modelo de regresión lineal, no captura relaciones no lineales entre la accesibilidad y la edad.
- Licencia BSD-3-Clause permite uso comercial, pero se recomienda verificar la atribución correspondiente.
- No es un modelo de IA generativa; no debe utilizarse para tareas de procesamiento de lenguaje natural.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pyaging/ocampoatac2
- Documentación de `pyaging` (catálogo de relojes): https://pyaging.readthedocs.io
- Artículo científico (DOI): https://doi.org/10.1007/s11357-023-00986-0
