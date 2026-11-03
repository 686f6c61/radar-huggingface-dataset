# atom-jepa/atom-jepa

## Resumen

Atom-JEPA es un método de preentrenamiento auto-supervisado para sistemas atomísticos en 3D, desarrollado por Kasper Helverskov Petersen, Rasmus Hannibal Tirsgaard, François R J Cornet, Mikkel Jordahn y Mikkel N. Schmidt (DTU). El repositorio publica dos codificadores (encoders) preentrenados con arquitectura EquiformerV3, uno especializado en moléculas y otro en cristales inorgánicos, que pueden usarse como extractores de características congelados o afinarse para predicción de propiedades.

El modelo aplica la arquitectura Joint-Embedding Predictive Architecture (JEPA) al dominio atomístico: cada estructura se divide en subgrafos de contexto y objetivo mediante muestreo de un vecindario k-hop alrededor de un átomo ancla, y un predictor aprende a predecir las representaciones del objetivo (a nivel de átomo y de subestructura) a partir del contexto. Los objetivos se codifican con una copia EMA del encoder, evitando el colapso de representaciones sin necesidad de contrastive learning.

Es relevante porque traslada el paradigma predictivo en espacio latente (popularizado por I-JEPA en visión) al modelado de materia a escala atómica, con invariancia/equivariancia rotacional y traslacional, y ofrece pesos ligeros (39,0M de parámetros, 0,5 GB de repo) listos para fine-tuning en tareas de química computacional y ciencia de materiales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EquiformerV3 (transformer equivariante sobre grafo), 8 bloques |
| Parámetros totales | 39,0M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (grafo de radio con cutoff de 6 Å; no es contexto de tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; inferencia en bf16 o fp32) |
| Idiomas soportados | no disponible (modelo no lingüístico; entrada = números atómicos y coordenadas 3D) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` (`eqv3_cfg`) |

Detalles adicionales de arquitectura: anchura de 256 canales, irreps hasta L_max = 2 (m_max = 2), grafo de radio con cutoff de 6 Å (periódico para cristales), entrada de números atómicos (Z < 128) y coordenadas cartesianas 3D más red cristalina para cristales. Salida: características equivariantes por átomo; el embedding de estructura es la media de 256 dimensiones de las características invariantes (l = 0).

## Arquitectura y entrenamiento

El backbone es EquiformerV3, un transformer equivariante a rotaciones y traslaciones que opera sobre un grafo de radio construido a partir de las coordenadas 3D (con condiciones periódicas de contorno en el caso de cristales). Consta de 8 bloques con 256 canales y representaciones irreducibles hasta L_max = 2, lo que le permite modelar tensores de orden 0, 1 y 2 de forma equivariante.

El preentrenamiento es auto-supervisado tipo JEPA: se muestrea un vecindario k-hop alrededor de un átomo ancla para definir contexto y objetivo; el encoder procesa el contexto y un predictor proyecta sus representaciones para predecir las del objetivo a dos escalas (átomo individual y subestructura con mean-pooling). Las representaciones objetivo provienen de una copia EMA del encoder, lo que estabiliza el entrenamiento y evita el colapso. Los datos de preentrenamiento son el conjunto Uni-Mol (19M de moléculas) para el encoder molecular y Alexandria PBE 3D (1,7M de cristales) para el de cristales. No se especifican en la información disponible el número total de tokens/pasos, la composición detallada del dataset ni si hubo RLHF/DPO (no aplica en este dominio).

## Capacidades

- Generación de embeddings de estructura (256 dimensiones) para moléculas y cristales a partir de coordenadas 3D.
- Extracción de características por átomo (`per_atom=True`) y por capa/bloque (`layers="all"`), con acceso a irreps l = 0..2 (`degrees="all"`).
- Representaciones equivariantes (rotación/traslación) y, opcionalmente, invariantes (`invariant=True`).
- Soporte de múltiples formatos de entrada: SMILES (vía RDKit), `ase.Atoms`, estructuras pymatgen y tuplas `(atomic_numbers, positions[, cell])`.
- Base para fine-tuning con cabeza propia (es un `torch.nn.Module`) en tareas de regresión/clasificación de propiedades.
- Uso como extractor congelado para probes lineales o modelos downstream.
- Aceleración con kernels cuEquivariance en GPU CUDA (bf16) y `torch.compile`.
- No soporta tool calling, agentes, ni capacidades lingüísticas; no es un modelo generativo de texto.

## Casos de uso

- Predicción de propiedades moleculares (HOMO/LUMO, gaps, energías): fine-tuning del encoder `molecules` con una cabeza de regresión, como en los scripts `finetuning.qm9.finetune` del paper.
- Cribado virtual de moléculas: usar `model.embed([...])` como extractor congelado para calcular similitudes y entrenar clasificadores ligeros sobre millones de compuestos.
- Predicción de propiedades de materiales (formación, band gap, estabilidad): fine-tuning del encoder `crystals` con los scripts `finetuning.matbench.finetune` sobre MatBench.
- Búsqueda y clustering de estructuras cristalinas: embeddings de 256 dimensiones para agrupar polimorfos o detectar duplicados en bases de datos tipo Materials Project.
- Modelado de potenciales/propiedades locales: uso de características por átomo (`per_atom=True`) para tareas a nivel de sitio, como entornos de coordinación o energías por átomo.
- Preentrenamiento como inicialización para modelos más grandes: reutilizar los pesos como punto de partida en pipelines propios de química computacional.
- Integración en flujos con RDKit/pymatgen/ASE: generación de conformeros con ETKDGv3 + MMFF94 y embedding directo desde SMILES en pipelines existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a los scripts de fine-tuning del repositorio de GitHub y al paper (arXiv:2610.08400) para los resultados experimentales, pero no se incluyen cifras en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 39,0M de parámetros, los pesos en fp32 ocupan ~156 MB y en bf16 ~78 MB. Con overhead de activaciones para lotes pequeños, cabe holgadamente en GPUs de 4-8 GB.
- GPU recomendadas: cualquier GPU CUDA moderna sirve; para lotes grandes se recomiendan A100/H100 o RTX 4090. En CPU funciona en fp32 PyTorch.
- Cabe en GPU de consumo: sí (RTX 3060 12 GB, RTX 4060, RTX 4090, etc.).
- Opciones de despliegue: paquete oficial `atom-jepa` (PyPI), PyTorch nativo, kernels cuEquivariance (`[cu12]`/`[cu13]`) y `torch.compile`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Dominio | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Atom-JEPA (molecules) | 39,0M | Moléculas 3D | JEPA auto-supervisado, EquiformerV3 | CC-BY-4.0 | HuggingFace + PyPI |
| Atom-JEPA (crystals) | 39,0M | Cristales inorgánicos | JEPA auto-supervisado, EquiformerV3 | CC-BY-4.0 | HuggingFace + PyPI |
| Uni-Mol | no disponible en la información | Moléculas 3D | Transformer con atención de pares | no disponible | no disponible |
| MACE / NequIP | no disponible en la información | Moléculas y materiales | Redes equivariantes (potenciales) | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo en la información proporcionada; la comparación se limita a categoría y disponibilidad.

## Limitaciones y advertencias

- Requiere estructuras 3D: para SMILES es necesario generar un conformero (el paper usa RDKit ETKDGv3 + MMFF94); los embeddings dependen del conformero elegido.
- No es un predictor de propiedades: son representaciones preentrenadas; el uso downstream exige cabeza de lectura, fine-tuning o probe.
- No es un modelo lingüístico: no procesa texto, no soporta tool calling ni agentes.
- Riesgo de sesgo en los datos de preentrenamiento (Uni-Mol y Alexandria PBE) que puede trasladarse a los embeddings; no se documentan análisis de sesgo.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de extrapolación incorrecta fuera de la distribución de entrenamiento (p. ej., elementos o entornos poco representados).
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene revisar los términos de los datasets de preentrenamiento (Uni-Mol, Alexandria) para usos derivados.
- No se documentan cifras de benchmarks, latencia ni throughput en la información disponible; validar empíricamente antes de producción.

## Enlaces

- HuggingFace: https://huggingface.co/atom-jepa/atom-jepa
- Paper: https://arxiv.org/abs/2610.08400
- Código: https://github.com/khelverskovp/atom-jepa
- PyPI: https://pypi.org/project/atom-jepa/
- Documentación del paquete: https://github.com/khelverskovp/atom-jepa#python-package
