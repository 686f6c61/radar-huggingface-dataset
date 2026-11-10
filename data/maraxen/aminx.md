# maraxen/aminx

## Resumen

aminx es una reimplementación en JAX/Equinox de las arquitecturas ProteinMPNN y LigandMPNN, dos modelos de diseño de secuencias de proteínas basados en message passing sobre grafos de residuos. El repositorio `maraxen/aminx` no contiene pesos entrenados desde cero, sino conversiones de checkpoints originales en PyTorch a formato Equinox (`.eqx`), verificadas con correlación de Pearson ≥0.999 respecto a la implementación de referencia. El autor es `maraxen` y el paquete se distribuye bajo licencia MIT.

El interés del proyecto es de infraestructura más que de modelado: permite ejecutar las familias ProteinMPNN, SolubleMPNN, LigandMPNN, MembraneMPNN y el side-chain packer de LigandMPNN dentro del ecosistema JAX, lo que facilita compilación con `jax.jit`, vectorización con `vmap` y despliegue en TPU o GPU sin depender de PyTorch. Adicionalmente, la versión 0.2.1 incorpora checkpoints convertidos de terceros (PottsMPNN, LASErMPNN, Proton-PottsMPNN, AbMPNN, HyperMPNN, CyclicMPNN, CA-Only ProteinMPNN y ThermoMPNN v1/v2/D).

Todos los checkpoints comparten una topología común: 128 dimensiones de features en nodos, aristas y capas ocultas, 3 capas de encoder y 3 de decoder, y vocabulario de 21 tokens (20 aminoácidos más un token de máscara). El tamaño del repo es de 0,9 GB y la librería se instala con `pip install aminx`, descargando los pesos desde Hugging Face en el primer uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Message passing neural network (MPNN) sobre grafo de residuos, encoder-decoder de 3+3 capas |
| Parámetros totales | no disponible (topología fija: 128 features, 3 encoder + 3 decoder; el número exacto no se publica) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del número de residuos de la proteína de entrada; `k_neighbors` = 48 o 32 según familia) |
| Tipos de cuantización | no disponible (pesos en `.eqx` y `.eqx.zst`; no se documentan cuantizaciones) |
| Idiomas soportados | en (documentación y model card) |
| Licencia | MIT (pesos de terceros bajo MIT / CC-BY-4.0 según `NOTICE-weights.md`) |
| Formato de pesos | Equinox `.eqx` y `.eqx.zst`, con manifiesto `.json` adjunto por checkpoint |

## Arquitectura y entrenamiento

aminx no entrena modelos propios: reimplementa en JAX/Equinox las arquitecturas MPNN de diseño de secuencias y convierte los pesos originales de PyTorch. La topología es común a todas las familias: features de nodo, arista y ocultas de 128 dimensiones, 3 capas de encoder y 3 de decoder, vocabulario de 21 tokens. Los sufijos numéricos de los checkpoints codifican el nivel de ruido de backbone en Ångström (por ejemplo `_020` = 0,20 Å) y el número de átomos de contexto (por ejemplo `_25`, `_16`), siguiendo la convención de los repositorios upstream.

Las variantes cubiertas incluyen ProteinMPNN (backbone original, `k_neighbors=48`, 32 embeddings posicionales), SolubleMPNN (sesgada a solubilidad), LigandMPNN (con 2 capas de contexto de ligando y `atom_context_num=25`), MembraneMPNN (global y per-residue, con `physics_feature_dim=3`) y el side-chain packer de LigandMPNN (`k_neighbors=32`, `atom_context_num=16`). La verificación de paridad reporta correlación de Pearson ≥0.999 con la implementación de referencia (atol/rtol 1e-4 en todas las familias; side-chain packer con atol 1e-4 y rtol 1e-3). Los checkpoints de terceros se validan a <1e-7 en `float64` y <1e-4 en `float32`.

## Capacidades

- Diseño de secuencias de proteínas condicionado a estructura de backbone (ProteinMPNN y variantes).
- Diseño condicionado a contexto atómico de ligandos (LigandMPNN), incluyendo iones, moléculas pequeñas y ácidos nucleicos según el upstream.
- Empaquetado de cadenas laterales (side-chain packing) mediante `ligandmpnn_sc_v_32_002_16`.
- Diseño sesgado a solubilidad (SolubleMPNN) y a contexto de membrana (MembraneMPNN global y per-residue).
- Diseño de anticuerpos (AbMPNN), ciclopeptidos (CyclicMPNN) y variantes con sesgo de plegamiento (HyperMPNN).
- Predicción de estabilidad térmica de mutaciones (ThermoMPNN v1/v2 y ThermoMPNN-D).
- Ejecución diferenciable y compilable con `jax.jit` y vectorizable con `vmap`, apta para integración en pipelines de optimización.
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto: es un modelo especializado de biología estructural.

## Casos de uso

- Diseño de bibliotecas de secuencias para una estructura cristalográfica dada: se carga `proteinmpnn_v_48_020` y se generan N secuencias por backbone con distintos niveles de ruido para explorar diversidad.
- Rediseño de sitios de unión con ligando: `ligandmpnn_v_32_020_25` incorpora el contexto atómico del ligando, útil para rediseñar bolsillos en enzimas o receptores.
- Optimización de solubilidad de candidatos terapéuticos: `solublempnn_v_48_020` sesga las secuencias hacia mayor solubilidad sin alterar el backbone.
- Diseño de proteínas de membrana: las variantes MembraneMPNN (global y per-residue) permiten condicionar el diseño a topología transmembrana.
- Empaquetado de cadenas laterales sobre un backbone fijo: `ligandmpnn_sc_v_32_002_16` reconstruye rotámeros para refinar modelos o preparar estructuras para dinámica molecular.
- Predicción de estabilidad de mutantes: ThermoMPNN v1/v2 y ThermoMPNN-D permiten priorizar mutaciones en campañas de ingeniería de proteínas.
- Integración en pipelines de diseño generativo: al ser JAX, el modelo puede combinarse con optimizadores basados en gradientes o con `vmap` para evaluar lotes grandes de candidatos en GPU/TPU.
- Diseño de anticuerpos y ciclopeptidos: AbMPNN y CyclicMPNN cubren nichos específicos de ingeniería de proteínas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de paridad numérica frente a las implementaciones de referencia (correlación de Pearson ≥0.999; diferencias <1e-7 en `float64` y <1e-4 en `float32` para los checkpoints de terceros).

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; el repo pesa 0,9 GB y la topología es pequeña (128 features, 6 capas), por lo que debería caber en GPUs de consumo, pero no se documenta una cifra oficial.
- GPU recomendadas: no disponible; al ser JAX, funciona en cualquier GPU compatible con CUDA o ROCm, y también en TPU.
- Cabe en consumer GPU: previsiblemente sí por el tamaño del repo (0,9 GB), aunque no se confirma en la documentación.
- Opciones de despliegue: paquete Python `aminx` (instalación vía `pip install aminx`), con `jax.jit` y `vmap` para compilación y vectorización. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Framework | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aminx (este repo) | JAX/Equinox | no disponible (topología 128×6 capas) | depende de la proteína; `k_neighbors` 48/32 | MIT | Hugging Face `maraxen/aminx` |
| ProteinMPNN (upstream) | PyTorch | misma topología | `k_neighbors=48` | MIT | GitHub `dauparas/ProteinMPNN` |
| LigandMPNN (upstream) | PyTorch | misma topología + 2 capas de contexto de ligando | `k_neighbors=32`, `atom_context_num=25` | MIT | GitHub `dauparas/LigandMPNN` |
| ThermoMPNN (upstream) | PyTorch | no disponible | no aplica (predicción de ΔΔG) | MIT | GitHub `Kuhlman-Lab/ThermoMPNN` |

La diferencia principal de aminx frente a los upstream no es de rendimiento predictivo (los pesos son los mismos, con paridad verificada) sino de ecosistema: JAX/Equinox frente a PyTorch, lo que habilita `jit`, `vmap` y despliegue en TPU.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes; cualquier uso conversacional es inadecuado.
- Los pesos son conversiones de terceros, no reentrenamientos; los sesgos y limitaciones son los de los modelos originales (ProteinMPNN, LigandMPNN, etc.).
- La paridad con los upstream se mide por ruta y no es completa según el "parity ledger" del proyecto; conviene validar en el caso de uso concreto.
- Cada `.eqx` requiere su manifiesto `.json` adjunto (por ejemplo, `build_hydrogens` en LASErMPNN); perderlo rompe la carga.
- La licencia MIT del repo no sustituye a las licencias upstream de cada checkpoint: AbMPNN está bajo CC-BY-4.0 y el resto bajo MIT, con avisos en `NOTICE-weights.md`. Para uso comercial hay que revisar cada familia.
- El repositorio anterior `maraxen/prxteinmpnn` está archivado; hay que migrar a `maraxen/aminx`.
- La versión indicada es `v0.1.0a1` (alpha), con checkpoints de familia referidos a aminx 0.2.1; la API puede cambiar.
- No se documentan sesgos específicos, tasas de alucinación (no aplica) ni límites de longitud de contexto más allá del número de residuos de la proteína de entrada.

## Enlaces

- Hugging Face: https://huggingface.co/maraxen/aminx
- ProteinMPNN (upstream): https://github.com/dauparas/ProteinMPNN
- LigandMPNN (upstream): https://github.com/dauparas/LigandMPNN
- PottsMPNN: https://github.com/KeatingLab/PottsMPNN
- LASErMPNN: https://github.com/polizzilab/LASErMPNN
- HyperMPNN: https://github.com/meilerlab/HyperMPNN
- CyclicMPNN: https://github.com/Graylab/CyclicMPNN
- ThermoMPNN: https://github.com/Kuhlman-Lab/ThermoMPNN
- ThermoMPNN-D: https://github.com/Kuhlman-Lab/ThermoMPNN-D
- AbMPNN (Zenodo): https://doi.org/10.5281/zenodo.8164693
- Paper ProteinMPNN (Science, 2022): https://www.science.org/doi/10.1126/science.add2187
- Paper LigandMPNN (Nature Methods, 2025): https://www.nature.com/articles/s41592-024-02548-4
