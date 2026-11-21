# molecularmodelinglab/SALSA

## Resumen

SALSA (Semantically-Aware Latent Space Autoencoder) es un modelo de representación molecular desarrollado por el grupo Molecular Modeling Lab y publicado en la conferencia AAAI 2024. No es un modelo de lenguaje generativo, sino un autoencoder orientado a la obtención de embeddings de moléculas representadas como cadenas SMILES. Su objetivo es producir representaciones latentes que preserven la similitud semántica entre moléculas, de modo que estructuras químicamente parecidas queden próximas en el espacio latente, algo que los autoencoders tradicionales no garantizan.

El modelo se distribuye a través de un paquete Python (`salsa-lit`) que expone tanto una interfaz de línea de comandos como una API en Python con tres operaciones principales: mutación de un conjunto de moléculas, entrenamiento del autoencoder y generación de embeddings. El repositorio de Hugging Face ocupa aproximadamente 0,3 GB e incluye los pesos y artefactos necesarios para ejecutar el flujo de trabajo.

Su relevancia actual radica en el uso de embeddings moleculares de calidad para tareas de quimioinformática como búsqueda de similitud, agrupamiento, selección de compuestos y modelos predictivos de propiedades. La licencia MIT facilita su adopción tanto en investigación como en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder sobre representaciones SMILES (Semantically-Aware Latent Space Autoencoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre cadenas SMILES, no sobre texto libre) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada química en formato SMILES) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribucion via paquete Python `salsa-lit`; el repo de 0,3 GB contiene los artefactos del modelo) |

## Arquitectura y entrenamiento

SALSA es un autoencoder entrenado sobre moléculas codificadas como SMILES. La innovación principal, descrita en el artículo de AAAI 2024, es un mecanismo de entrenamiento que hace que el espacio latente sea "conscientemente semántico": además de reconstruir la entrada, el modelo se optimiza para que la distancia en el espacio latente refleje la similitud química entre moléculas (por ejemplo, mediante distancias de edición de grafos moleculares, de ahí la etiqueta `GED-aware-embedding`). Esto corrige la tendencia de los autoencoders convencionales a organizar el espacio latente según la forma de la cadena SMILES y no según la estructura química real.

El flujo de trabajo documentado incluye una etapa de mutación de moléculas que genera un conjunto de entrenamiento ampliado, seguida del entrenamiento del autoencoder y de la generación de embeddings. El número exacto de parámetros, la composición del dataset de entrenamiento y los detalles de regularización no se especifican en la información disponible.

## Capacidades

- Generación de embeddings densos para moléculas expresadas en formato SMILES.
- Preservación de similitud semántica en el espacio latente (diseño GED-aware), útil para búsqueda por similitud y agrupamiento.
- Reconstrucción de moléculas a partir de su representación latente (propia de un autoencoder).
- Mutación y aumento de datasets moleculares mediante la utilidad `salsa-lit mutate`.
- Entrenamiento y ajuste del modelo sobre datasets propios en formato parquet o CSV.
- Interfaz de línea de comandos (`salsa-lit`) y API Python (`mutate_dataset`, `cook_salsa`, `serve_salsa`).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multimodales; no es un modelo generativo de texto.

## Casos de uso

- Búsqueda de similitud molecular: dado un compuesto de interés, generar su embedding y recuperar los vecinos más cercanos de una base de datos para identificar análogos estructurales, aprovechando que el espacio latente está optimizado para reflejar similitud química.
- Agrupamiento y análisis de quimiotecas: proyectar grandes colecciones de moléculas en el espacio latente (con el extra `viz` y UMAP) para descubrir familias estructurales y detectar redundancias antes de un cribado.
- Selección de compuestos para cribado virtual: usar los embeddings como descriptores en modelos de clasificación o regresión de propiedades (ADMET, actividad biológica), reduciendo la necesidad de fingerprints manuales.
- Aumento de datos en proyectos de química computacional: la etapa `mutate` permite generar variantes moleculares que amplían un dataset pequeño antes de entrenar modelos posteriores.
- Modelos predictivos de propiedades: emplear los embeddings como entrada de regresores o clasificadores supervisados para predecir solubilidad, toxicidad u otras propiedades fisicoquímicas.
- Deduplicación y curaduría de bases de datos químicas: detectar moléculas casi idénticas mediante distancias en el espacio latente en lugar de comparaciones exactas de cadenas SMILES.
- Investigación metodológica en representación molecular: servir de base reproducible (licencia MIT, código abierto) para comparar autoencoders semánticos frente a enfoques clásicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del modelo no se especifica en la información proporcionada.
- GPU recomendadas: no disponible. Dado el tamaño del repositorio (0,3 GB), es probable que la inferencia quepa en GPUs de consumo, pero este dato no está confirmado.
- Cabe en GPU de consumo: no confirmado en la información disponible.
- Opciones de despliegue: paquete Python `salsa-lit` (instalable con `pip install git+https://github.com/molecularmodelinglab/SALSA.git`), con CLI y API Python; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| SALSA | Autoencoder sobre SMILES | Embeddings moleculares GED-aware | MIT | Hugging Face + GitHub |
| ChemBERTa | Transformer sobre SMILES | Embeddings por enmascaramiento | MIT | Hugging Face |
| Mol2Vec | Word2Vec sobre SMILES | Embeddings por subestructuras | MIT | GitHub |
| CDDD (Continuous Data-driven Descriptors) | Autoencoder sobre SMILES | Embeddings por reconstrucción | no disponible | GitHub |

La comparación de rendimiento numérico entre estos modelos no está disponible en la información proporcionada. La diferencia conceptual de SALSA frente a ChemBERTa o Mol2Vec es su objetivo de entrenamiento explícitamente orientado a preservar la similitud estructural (GED) en el espacio latente.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta instrucciones en lenguaje natural.
- Solo procesa moléculas representables como SMILES; moléculas no válidas o formatos alternativos requieren conversión previa.
- El rendimiento depende de la calidad y cobertura del dataset de entrenamiento; no se documentan sesgos específicos en la información disponible.
- Riesgo de reconstrucción imperfecta: como autoencoder, puede producir SMILES inválidos al reconstruir desde el espacio latente.
- No se especifican los parámetros totales ni el contexto máximo de SMILES soportado, lo que dificulta estimar límites en moléculas muy grandes.
- La licencia MIT permite uso comercial, pero conviene revisar las dependencias del paquete y citar el artículo de AAAI 2024 en publicaciones derivadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de adopción comunitaria ni de mantenimiento a largo plazo.
- No se documentan resultados de benchmarks, por lo que la evaluación de calidad debe realizarse de forma empírica sobre el dominio de aplicación.

## Enlaces

- Hugging Face: https://huggingface.co/molecularmodelinglab/SALSA
- Repositorio GitHub: https://github.com/molecularmodelinglab/SALSA
- Artículo AAAI 2024: https://doi.org/10.1609/aaai.v38i12.29221
- Documentación de la API y CLI: salsa_lit/README.md (dentro del repositorio GitHub)
