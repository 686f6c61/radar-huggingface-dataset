# DanielYoung0520/oridynamic_v0

## Resumen

OriDynamic v0 es un modelo generativo de ensamblados conformacionales (*conformational ensembles*) para sistemas biomoleculares, desarrollado por DanielYoung0520 y publicado bajo licencia Apache 2.0. A diferencia de los modelos de predicción de estructura estática, OriDynamic genera colecciones no ordenadas de conformaciones representativas a partir de secuencias moleculares y composición, con la opción de recibir una estructura inicial. El modelo cubre monómeros proteicos, complejos proteína-ligando y ensamblados proteína-proteína, lo que lo sitúa en la intersección entre el cofolding y la generación de dinámica conformacional.

La arquitectura combina tres componentes: un autoencoder estructural que establece una representación latente, un módulo de flujo que genera estados latentes decodificables en conformaciones representativas, y un módulo de refinamiento que muestrea configuraciones *all-atom* condicionadas a esas propuestas. El backbone de cofolding (Protenix v1.0.0) se obtiene por separado de su distribución oficial y se utiliza para predecir una estructura inicial cuando el usuario no la proporciona. El checkpoint publicado corresponde a la variante Joint200, guardada tras 200 actualizaciones de adaptación de anclas predichas a partir de Joint11500.

Este lanzamiento es relevante porque aborda un problema que los modelos de estructura estática no resuelven: la plasticidad conformacional de las biomoléculas. La versión publicada es una release alpha de solo inferencia, con un tamaño de repositorio de 4.2 GB y pesos de inferencia que suman aproximadamente 1.76 GB, más 1.48 GB del backbone Protenix. No se han publicado métricas de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder estructural + módulo de flujo latente + refinador *all-atom* sobre backbone de cofolding Protenix v1.0.0 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: entrada por secuencia, MSA y estructura) |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en precisión de inferencia) |
| Idiomas soportados | no disponible (modelo biológico, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ckpt` (PyTorch); backbone Protenix en `.pt` |

## Arquitectura y entrenamiento

OriDynamic se organiza en tres módulos acoplados. Un autoencoder estructural comprime la geometría molecular en un espacio latente; un módulo de flujo genera estados latentes que, al decodificarse, producen conformaciones representativas del ensamblado; y un refinador muestrea configuraciones *all-atom* condicionadas a esas propuestas. El backbone de cofolding (Protenix v1.0.0) se emplea para predecir una estructura inicial cuando no se suministra una, de modo que el pipeline completo acepta únicamente secuencias y composición. El checkpoint `oridynamic.ckpt` (0.95 GB) integra el módulo de flujo, el refinador de coordenadas y la adaptación del tronco (Joint200); el `ae.ckpt` (0.81 GB) contiene el autoencoder estructural.

El checkpoint Joint200 se guardó tras 200 actualizaciones de adaptación de anclas predichas desde Joint11500, y el códec congelado, el módulo de flujo y el refinador comparten el contexto de tronco LoRA en línea. Esto implica que el archivo de pesos solo es funcional con el código de inferencia actualizado correspondiente; sustituir únicamente el peso en el código anterior no es suficiente. Los checkpoints contienen tensores de inferencia, configuración y normalización latente, pero no optimizadores ni datasets de entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generación de ensamblados conformacionales *all-atom* como colección no ordenada de conformaciones representativas.
- Predicción de estructura inicial mediante el backbone de cofolding Protenix v1.0.0 cuando no se proporciona una estructura de partida.
- Procesamiento de monómeros proteicos a partir de secuencia FASTA y alineamiento A3M.
- Modelado de complejos proteína-ligando mediante JSON que describe cadenas proteicas, sus MSAs e identidades de ligando.
- Modelado de ensamblados proteína-proteína con cadenas interactuantes y sus MSAs.
- Aceptación opcional de estructuras iniciales en formato PDB o mmCIF para cualquier sistema soportado.
- Salida estructurada por objetivo con `anchor.cif`, `proposals.cif`, `ensemble.cif` y metadatos de ejecución.
- Generación controlada por semilla (`--seeds`) y número de muestras por semilla (`--samples-per-seed`) para reproducibilidad.

## Casos de uso

- **Estudio de plasticidad conformacional de monómeros**: partiendo de una secuencia FASTA y su MSA, OriDynamic genera un conjunto de conformaciones que permite analizar estados alternativos de una proteína sin disponer de estructura experimental, útil en dianas huérfanas de estructura.
- **Docking y diseño de fármacos sobre complejos proteína-ligando**: el modelo acepta la identidad del ligando junto con las cadenas proteicas y sus MSAs, generando conformaciones del complejo que pueden alimentar pipelines de cribado virtual o de análisis de modos de unión.
- **Análisis de interfaces en ensamblados proteína-proteína**: para sistemas multiméricos, la generación de ensamblados permite explorar la variabilidad de la interfaz y detectar conformaciones relevantes para el diseño de moduladores de la interacción.
- **Refinamiento de modelos experimentales**: suministrando una estructura PDB o mmCIF inicial, el modelo puede generar un ensamblado alrededor de ella, lo que sirve para explorar incertidumbre estructural en regiones flexibles de modelos de cristalografía o crio-EM.
- **Generación de datos sintéticos para entrenamiento**: los ensamblados producidos pueden utilizarse como aumentación de datos conformacionales en el entrenamiento de modelos de scoring o de predicción de afinidad, dado el formato de salida en CIF y la posibilidad de fijar semillas.
- **Integración en pipelines de biología estructural computacional**: la interfaz de línea de comandos (`oridynamic sample`) con entrada JSON y salida por directorio facilita la ejecución por lotes en clústeres con GPU NVIDIA, con verificación previa del entorno mediante `oridynamic doctor`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Entorno de inferencia probado: Linux, Python 3.11, PyTorch 2.7.1 con CUDA 12.6 y GPU NVIDIA.
- VRAM estimada: no disponible en la información proporcionada; los pesos de inferencia suman aproximadamente 1.76 GB (OriDynamic) más 1.48 GB (backbone Protenix), sin que se especifique el pico de memoria durante la generación.
- GPU recomendadas: no disponible; el autor solo confirma compatibilidad con GPU NVIDIA bajo CUDA 12.6.
- Cabe en GPU de consumo: no confirmado en la información disponible.
- Opciones de despliegue: paquete Python instalable con `pip install -e .` desde el repositorio oficial, invocación mediante el comando `oridynamic sample`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.
- Recursos adicionales: se requieren los recursos CCD (`common/components.cif` y `common/components.cif.rdkit_mol.pkl`) en `ORIDYNAMIC_ASSETS`, además de los MSAs precalculados o la opción de búsqueda local con ColabFold/MMseqs2.

## Comparativa con modelos similares

| Modelo | Tipo | Cobertura | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OriDynamic v0 | Generativo de ensamblados conformacionales | Monómeros, proteína-ligando, proteína-proteína | Secuencia + MSA (+ estructura opcional) | Apache 2.0 | Pesos en Hugging Face, código en GitHub |
| Protenix v1.0.0 | Cofolding (predicción estática) | Complejos biomoleculares | Secuencia + MSA | no disponible en la información | Distribución oficial del backbone |
| AlphaFold 3 | Cofolding (predicción estática) | Complejos biomoleculares | Secuencia + MSA | no disponible en la información | no disponible en la información |
| Boltz-1 / Boltz-2 | Cofolding (predicción estática) | Complejos biomoleculares | Secuencia + MSA | no disponible en la información | no disponible en la información |

La comparación directa con AlphaFold 3 o Boltz no puede establecerse con datos de rendimiento porque no se han publicado benchmarks de OriDynamic en la información disponible. La diferencia funcional principal es que OriDynamic genera ensamblados conformacionales en lugar de una única estructura estática, y reutiliza Protenix como backbone de cofolding.

## Limitaciones y advertencias

- Release alpha de solo inferencia: no se incluyen optimizadores ni datasets de entrenamiento, y el código debe coincidir con el commit registrado en `weights_manifest.json`.
- El checkpoint Joint200 requiere el código de inferencia actualizado; cambiar solo el archivo de pesos en el código anterior no es suficiente.
- El backbone Protenix v1.0.0 debe descargarse por separado de su distribución oficial y verificarse con el checksum SHA-256 indicado.
- Los recursos CCD son independientes del bundle de pesos y deben prepararse siguiendo la guía de instalación.
- Para secuencias nuevas es necesario aportar MSAs compatibles o ejecutar la búsqueda local con ColabFold/MMseqs2; los ejemplos incluidos solo cubren seis MSAs precalculados.
- No se especifican sesgos conocidos, tasas de alucinación estructural ni limitaciones de idioma en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones de la distribución oficial del backbone Protenix, cuyos términos no se detallan en la información proporcionada.
- No se han publicado métricas de validación (RMSD, lDDT, diversidad de ensamblado) que permitan evaluar la calidad de las conformaciones generadas antes de usarlas en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DanielYoung0520/oridynamic_v0
- Código (release alpha): https://github.com/JiahaoYoung0520/oridynamic_test_alpha
- Guía de instalación: https://github.com/JiahaoYoung0520/oridynamic_test_alpha/blob/main/INSTALL.md
- Ejemplos: https://github.com/JiahaoYoung0520/oridynamic_test_alpha/tree/main/examples
- Notas del modelo: https://github.com/JiahaoYoung0520/oridynamic_test_alpha/blob/main/docs/model_card.md
- Guía de entradas para complejos: https://github.com/JiahaoYoung0520/oridynamic_test_alpha/blob/main/docs/complex_inputs.md
- Backbone Protenix v1.0.0: https://protenix.tos-cn-beijing.volces.com/checkpoint/protenix_base_default_v1.0.0.pt
