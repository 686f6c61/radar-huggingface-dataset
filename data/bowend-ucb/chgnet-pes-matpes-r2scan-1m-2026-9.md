# BowenD-UCB/CHGNet-PES-MatPES-r2SCAN-1M-2026.9

## Resumen

CHGNet-PES-MatPES-r2SCAN-1M-2026.9 es un potencial interatómico universal de aprendizaje automático (machine learning interatomic potential, MLIP) basado en una red neuronal de grafos (graph neural network, GNN) de tipo CHGNet, implementado sobre el backend de PyTorch Geometric (PyG) de la librería MatGL. Lo publica el usuario BowenD-UCB y su propósito es sustituir a los cálculos DFT en simulaciones atomísticas de materiales, prediciendo energía, fuerzas, tensión (stress) y momentos magnéticos a partir de la estructura cristalina. Se enmarca en la línea de "foundation potentials" entrenados sobre el dataset MatPES con el funcional meta-GGA r2SCAN.

La innovación principal es su tamano: 1.083.842 parámetros (aproximadamente 1 millón), frente a los 2,7 millones del CHGNet de referencia, lo que supone unas 2,5 veces menos parámetros. Según la model card, esta reducción no penaliza las predicciones de fuerza y tensión: el modelo de 1M obtiene 144,03 meV/Å de MAE de fuerza y 0,6824 GPa de MAE de tensión, ligeramente mejores que el baseline de 2,7M (145,27 meV/Å y 0,6910 GPa), aunque algo peores en energía (28,24 frente a 26,93 meV/átomo) y en momento magnético (0,0735 frente a 0,0724 μ_B). La partición de datos es idéntica a la del baseline (random_state=42), por lo que la comparación es directa.

Es relevante ahora porque el coste computacional de los MLIP es el cuello de botella en cribado de materiales y dinámica molecular a gran escala: un modelo de 1M parámetros con precisión equivalente permite ejecutar simulaciones más largas y sobre sistemas más grandes con el mismo presupuesto de cómputo. No es un modelo de lenguaje: no tiene ventana de contexto, ni idiomas, ni capacidad de generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CHGNet (red neuronal de grafos) implementada en `matgl.models.CHGNet`, backend PyTorch Geometric (PyG) |
| Parametros totales | 1.083.842 (aprox. 1M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: es un potencial interatómico, no un modelo de lenguaje. El "alcance" físico lo fijan los cutoffs: radial 6,0 Å y de tres cuerpos 3,0 Å |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas; la carga estándar de MatGL es en precisión flotante de 32 bits) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | no disponible; la carga se realiza mediante `matgl.load_model("BowenD-UCB/CHGNet-PES-MatPES-r2SCAN-1M-2026.9")`. Tamano del repositorio reportado: 0,0 GB |
| Dimension de embedding | 128 |
| Bloques de interaccion | 4 |
| Dimensiones ocultas de convolucion | [64] |
| Cutoff radial | 6,0 Å |
| Cutoff de tres cuerpos | 3,0 Å |
| Libreria / framework | matgl (Python), integrable con pymatgen y ASE |
| Dataset de entrenamiento | MatPES r2SCAN 2024.11 (`MatPES-20240214-r2SCAN`, 387.897 estructuras) |
| Funcional de referencia | meta-GGA r2SCAN |
| Fecha de publicacion en el Hub | 21 de septiembre de 2026 (creacion y ultima actualizacion) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un CHGNet, una red neuronal de grafos que representa cada estructura cristalina como un grafo de átomos y vecinos dentro de un radio de corte, y propaga mensajes entre ellos mediante bloques de convolución con interacciones de dos y tres cuerpos. La configuración concreta usa una dimensión de embedding de 128, 4 bloques de interacción y una única dimensión oculta de convolución de 64, con un cutoff radial de 6,0 Å y un cutoff de tres cuerpos de 3,0 Å. Además de la energía total, la red predice fuerzas por átomo, el tensor de tensión y los momentos magnéticos, que actúan como tareas auxiliares del entrenamiento (la model card reporta un MAE de momento magnético de 0,0735 μ_B).

El entrenamiento se realizó con autograd continuo de tres cuerpos sobre el dataset MatPES en su versión r2SCAN 2024.11, compuesto por 387.897 estructuras calculadas con el funcional meta-GGA r2SCAN. La partición es 90% entrenamiento / 5% validación / 5% test (349.107 / 19.395 / 19.395 estructuras) con `random_state=42`, idéntica a la del baseline CHGNet de 2,7M parámetros, lo que hace que las métricas sean comparables directamente. La model card aclara que esta partición procede del conjunto completo MatPES 2024.11 y no del fichero deduplicado posterior `MatPES-R2SCAN-2025.2-train.json`. No se documentan en la información disponible fases de RLHF, DPO ni ajuste por preferencias, algo que no aplica a este tipo de modelo.

## Capacidades

- Predicción de la energía potencial del sistema (superficie de energía potencial, PES) para estructuras cristalinas arbitrarias dentro del dominio de entrenamiento.
- Predicción de fuerzas atómicas, con un MAE de 144,03 meV/Å en el conjunto de test oficial.
- Predicción del tensor de tensiones (stress), con un MAE de 0,6824 GPa, lo que habilita cálculos de propiedades elásticas y relajación de celdas.
- Predicción de momentos magnéticos por átomo como tarea auxiliar, con un MAE de 0,0735 μ_B.
- Relajación estructural y optimización de geometría a través del calculador de ASE (`matgl.ext.ase.PESCalculator`).
- Dinámica molecular clásica sobre la PES aprendida, aprovechando la integración con ASE y pymatgen.
- Evaluación por lotes de estructuras, apta para cribado de alto rendimiento.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Capacidades especiales: modo "thinking", visión o audio: no aplica. La única capacidad especial es la predicción simultánea de energía, fuerzas, tensión y magnetismo con un modelo de ~1M de parámetros.

## Casos de uso

- Cribado de alto rendimiento de materiales: el modelo permite evaluar la estabilidad relativa de miles de candidatos cristalinos sin recurrir a DFT para cada uno. Con 1M de parámetros y una MAE de energía de 28,24 meV/átomo, es adecuado para descartar candidatos antes de validarlos con cálculos de mayor nivel, reduciendo el coste del embudo de descubrimiento.
- Relajación de estructuras: mediante `PESCalculator` sobre ASE, se pueden optimizar posiciones atómicas y parámetros de celda de estructuras generadas por sustitución, superceldas o bases de datos como Materials Project, usando el tensor de tensión predicho (MAE 0,6824 GPa) para relajar también la celda.
- Dinámica molecular de sistemas grandes: al tener 2,5 veces menos parámetros que el baseline de CHGNet, permite trayectorias más largas o celdas más grandes con el mismo presupuesto; útil para estudiar difusión iónica, estabilidad térmica o transiciones de fase a temperaturas finitas.
- Estimación de propiedades elásticas y ecuaciones de estado: aplicando deformaciones controladas a la celda y ajustando la energía frente al volumen o la deformación, se obtienen módulos elásticos y el volumen de equilibrio, apoyándose en la precisión de tensión del modelo.
- Filtrado de materiales magnéticos: la predicción de momentos magnéticos por átomo (MAE 0,0735 μ_B) permite cribar candidatos con ordenamiento ferro-, antiferro- o ferrimagnético antes de un cálculo DFT con espín polarizado, que es mucho más costoso.
- Generación de datos sintéticos y destilación: las trayectorias y etiquetas generadas por el modelo pueden alimentar el entrenamiento de potenciales más rápidos o específicos de una familia química, o servir para preanotar conjuntos de estructuras que después se refinan con DFT.
- Estudio de defectos y superficies: la evaluación de energías de formación de vacantes, intersticiales o superficies requiere relajar muchas configuraciones; un potencial compacto y rápido como este permite explorar el espacio de configuraciones a un coste muy inferior al de DFT.
- Integración en flujos de trabajo con pymatgen: dado que el modelo se carga con `matgl.load_model` y se consume desde objetos `Structure` de pymatgen, encaja en pipelines existentes de gestión de estructuras, comparación de fases y construcción automática de superceldas.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el conjunto de test oficial de MatPES r2SCAN (19.395 estructuras). Menos es mejor en todas las métricas. La columna del baseline corresponde al CHGNet de 2,7M parámetros con autograd corregido, entrenado sobre la misma partición.

| Metrica | CHGNet-1M (este modelo) | CHGNet-2.7M baseline |
|---|---|---|
| Energy MAE (meV/atomo) | 28,24 | 26,93 |
| Force MAE (meV/Å) | 144,03 | 145,27 |
| Stress MAE (GPa) | 0,6824 | 0,6910 |
| Magmom MAE (μ_B) | 0,0735 | 0,0724 |
| Parametros | 1.083.842 | aprox. 2.700.000 |
| Estructuras de test | 19.395 | 19.395 |

No se han publicado otros resultados de benchmarks (por ejemplo, comparaciones con MACE, M3GNet u otros potenciales universales) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en precisión de 32 bits ocupan aproximadamente 4,3 MB (1.083.842 parámetros × 4 bytes). El consumo real lo dominan las activaciones del grafo, que escalan con el número de átomos y de vecinos dentro de los cutoffs (6,0 Å radial y 3,0 Å de tres cuerpos), no con el tamano del modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el modelo es tan pequeno que una GPU de gama de entrada o incluso una integrada resulta adecuada. No se documentan requisitos específicos de A100, H100 o RTX 4090 para este modelo.
- Cabe en GPU de consumo: sí, con holgura. Una RTX 3060, 4060 o equivalente es más que suficiente; el límite práctico lo impone el tamano del sistema simulado, no el modelo.
- Ejecución en CPU: viable para sistemas pequenos y medianos, dado el reducido número de parámetros; para dinámica molecular prolongada se recomienda GPU.
- Opciones de despliegue: MatGL con backend PyTorch Geometric (`matgl.set_backend("PyG")`), integración con ASE mediante `matgl.ext.ase.PESCalculator` y con pymatgen para la construcción de estructuras. No aplican servidores de inferencia de lenguaje como vLLM, TGI, Ollama o llama.cpp.
- Latencia y throughput estimados: no disponible. Dependen del número de átomos, del número de vecinos por átomo y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Alcance / cutoff | Libreria | Dataset | Energy MAE | Force MAE | Stress MAE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|---|
| CHGNet-1M (este modelo) | 1.083.842 | radial 6,0 Å; tres cuerpos 3,0 Å | matgl (PyG) | MatPES r2SCAN 2024.11 | 28,24 meV/átomo | 144,03 meV/Å | 0,6824 GPa | no disponible | Hub de HuggingFace, 0 descargas |
| CHGNet-2.7M baseline | aprox. 2.700.000 | no disponible en detalle | matgl | MatPES r2SCAN 2024.11 (misma partición) | 26,93 meV/átomo | 145,27 meV/Å | 0,6910 GPa | no disponible | no disponible |
| Otros potenciales universales (MACE, M3GNet, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Errores intrínsecos del ajuste: con una MAE de energía de 28,24 meV/átomo y de fuerza de 144,03 meV/Å, el modelo no sustituye a un cálculo DFT de alta calidad en contextos que exijan precisión de meV en energías relativas (por ejemplo, polimorfos muy próximos en energía) o en fenómenos que dependan de barreras de reacción finas.
- Dependencia del funcional de referencia: el entrenamiento usa r2SCAN, de modo que el modelo hereda los sesgos y errores del funcional meta-GGA, incluida su descripción aproximada de la correlación electrónica y de sistemas fuertemente correlacionados.
- Dominio de aplicabilidad: al entrenarse sobre MatPES (estructuras derivadas en su mayoría de Materials Project), el comportamiento fuera de distribución (presiones extremas, configuraciones muy alejadas del equilibrio, estados de transición, fases exóticas o químicas poco representadas) no está garantizado.
- Riesgo de extrapolación silenciosa: como en cualquier MLIP, el modelo puede devolver predicciones con apariencia razonable para configuraciones no vistas, sin que exista una señal de incertidumbre asociada. Se recomienda validar contra DFT en los regímenes concretos de interés.
- Restricciones físicas de alcance: los cutoffs de 6,0 Å (radial) y 3,0 Å (tres cuerpos) limitan la descripción de interacciones de largo alcance, como las electrostáticas o de van der Waals, que no se modelan explícitamente.
- Licencia no especificada: la model card y la ficha de HuggingFace no indican licencia, por lo que el uso comercial y la redistribución quedan en un limbo legal que debe aclararse con el autor antes de cualquier despliegue en producción.
- Estado del repositorio: el repositorio figura con 0,0 GB de tamano, 0 descargas y 0 likes, y las fechas de creación y actualización son del 21 de septiembre de 2026. Conviene verificar que los pesos están efectivamente publicados y son descargables antes de integrar el modelo en un pipeline.
- Integración limitada a un ecosistema: el modelo depende de MatGL con backend PyG, lo que restringe su uso a Python y a entornos compatibles con PyTorch Geometric, pymatgen y ASE; no existe una ruta de despliegue en formato GGUF ni vía servidores de inferencia genéricos.
- Idiomas y tareas de lenguaje: no aplican; el modelo no procesa texto ni mantiene conversaciones, por lo que no debe evaluarse con criterios de modelos generativos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BowenD-UCB/CHGNet-PES-MatPES-r2SCAN-1M-2026.9
- Dataset MatPES: https://huggingface.co/datasets/materialyze/matpes
- Paper del dataset MatPES (arXiv:2503.04070): https://doi.org/10.48550/arXiv.2503.04070
- Repositorio de MatGL: https://github.com/materialyzeai/matgl

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces recuperados correspondían a guías de programación de televisión y no guardan relación con el contenido de esta ficha.
