# orange4664/DPA-4.0.1-Pro-MPtrj-Physmuon

## Resumen

DPA-4.0.1-Pro-MPtrj-Physmuon es un checkpoint de potencial interatómico universal (machine-learned interatomic potential, MLIP) basado en la arquitectura DPA4/SeZM del modelo DPA-4.0.1-Pro-MPtrj, desarrollado originalmente por DeepModeling, el AI for Science Institute de Pekín, DP Technology y el IAPCM. El modelo predice energías, fuerzas y tensiones (viriales) de sistemas atómicos con precisión de primeros principios, sustituyendo a la teoría del funcional de la densidad (DFT) en simulaciones de dinámica molecular y relajaciones estructurales a una fracción del coste computacional.

La contribución específica de esta variante es el optimizador: Yinze Hu, Hongjun Xiang, Xingao Gong y Hongyu Yu (Universidad de Fudan) reentrenan la receta oficial sustituyendo HybridMuon por PhysMuon a partir del paso 610.000, manteniendo arquitectura, dataset (MPtrj), pesos de pérdida, schedule WSD y batch efectivo idénticos. El resultado es un checkpoint de 22.678.990 parámetros que alcanza un Combined Performance Score (CPS) de 0,8757 en Matbench Discovery con 1.465.000 pasos, frente al 0,8650 del baseline oficial entrenado durante 2.000.000 de pasos.

Es relevante porque demuestra que cambios en el optimizador —no en los datos ni en la arquitectura— pueden mejorar de forma medible la calidad de un potencial interatómico y reducir el coste de entrenamiento (el checkpoint de 900.000 pasos ya iguala al baseline de 2 millones). El repo ocupa 0,2 GB y se distribuye en formato PyTorch float32 compatible con `deepmd-kit[torch]==3.2.0`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DPA4/SeZM (Deep Potential Actor, equivariante SO(2), transformer de mensajes) |
| Parámetros totales | 22.678.990 (22.808.191 incluyendo buffers) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo atomístico; cutoff de 6,0 Å y `max_neighbors=384`) |
| Tipos de cuantización | no disponible (checkpoints publicados en float32) |
| Idiomas soportados | no aplica (modelo para simulación atomística, no NLP) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch `.pt` (checkpoints EMA float32) |

## Arquitectura y entrenamiento

La arquitectura DPA4/SeZM es una red neuronal equivariante con simetría SO(2) que opera sobre entornos atómicos locales. La configuración concreta es `feature_dim=64`, `n_focuses=2`, `n_layers=6`, `so2_layers=4`, `ffn_layers=2`, `lmax=5`, `mmax=1`, cutoff de 6,0 Å y un máximo de 384 vecinos por átomo, todo en float32. El modelo predice energía total, fuerzas atómicas y tensor de viriales, con pesos de pérdida MAE de 20/20/5 respectivamente.

El entrenamiento usa exclusivamente el dataset MPtrj (1.564.344 frames de entrenamiento; 1.459 materiales y 16.051 frames reservados como validación por `mp-id`), un schedule WSD de 2.000.000 pasos con `max_lr=5e-4`, `min_lr=1e-6`, 5.000 pasos de warmup y `decay_ratio=0.65` con decaimiento coseno, `batch_size="filter:300"` y 16 rangos efectivos. La innovación está en el optimizador: los primeros 610.000 pasos usan HybridMuon oficial (`muon_mode="slice"`, `magma_lite=true`, `momentum=0.95`, `weight_decay=1e-3`) y a partir de ahí se cambia a PhysMuon, que introduce decaimientos de modo rápido/lento de 0,90/0,995, readout con puerta `w_max=0.3`, presupuesto de salida calibrado por fluctuaciones (`λ=0.5`, clamp 2.0, `β=0.95`), seguimiento de sombra desde el paso 0 y un guardia de picos en modo lento basado en la mediana móvil de 1.000 pasos (10×). Se publican dos checkpoints EMA (decay 0,999): el de 1.465.000 pasos (recomendado, mejor CPS) y el de 900.000 pasos (convergencia temprana).

## Capacidades

- Predicción de energía total, fuerzas atómicas por átomo y tensor de viriales/tensiones para estructuras cristalinas y defectos.
- Relajación estructural (optimización de geometría) con precisión cercana a DFT, evaluada sobre las 256.963 relajaciones de WBM en Matbench Discovery sin errores.
- Dinámica molecular en ensemble NVT con estabilidad térmica verificada en 17 sistemas de DynaMat v1.0.
- Cálculo de propiedades vibracionales: funciones de distribución radial (RDF), de ángulos (ADF) y densidad de estados vibracional (VDOS).
- Evaluación de estabilidad termodinámica (energía por encima del convex hull) para cribado de materiales.
- Predicción de curvas de energía-potencia en dímeros homonucleares (H–U) con comportamiento repulsivo a corta distancia.
- Integración con `deepmd-kit` como potencial en simuladores de dinámica molecular (LAMMPS, i-PI y otros compatibles).
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües: es un modelo de regresión física, no un modelo de lenguaje.

## Casos de uso

- Cribado de materiales para baterías y catalizadores: relajar candidatos cristalinos con el modelo en lugar de DFT y ordenar por energía sobre el hull; el F1 de 0,8712 en la tarea de descubrimiento de Matbench Discovery indica una tasa alta de acierto al distinguir materiales estables de inestables.
- Dinámica molecular de alta temperatura: simular 17 sistemas NVT con error de RDF del 3,56 % y de ADF del 1,51 % respecto a referencia, adecuado para estudiar transiciones de fase y difusión sin el coste de AIMD.
- Cálculo de propiedades vibracionales y térmicas: obtener VDOS y espectros para estimar capacidades caloríficas y estabilidad dinámica (103/103 materiales de PhononDB sin modos imaginarios).
- Generación de datos de entrenamiento para potenciales específicos: usar el modelo como oráculo barato para etiquetar configuraciones y hacer fine-tuning con `deepmd-kit`, reduciendo la dependencia de cálculos DFT.
- Simulación de defectos y superficies: el cutoff de 6,0 Å y 384 vecinos permiten entornos locales densos, útil para energías de formación de vacantes e interfaces.
- Estudio de curvas de energía-potencia y colisiones: el comportamiento repulsivo a corta distancia (evaluado en dímeros H–U) permite modelar paredes repulsivas en simulaciones de alta energía.
- Integración en pipelines de Matbench Discovery: el checkpoint `1465k-ema.pt` se ejecuta directamente con los scripts oficiales del runner, sirviendo como referencia reproducible para comparar optimizadores.

## Benchmarks y rendimiento

Matbench Discovery, Combined Performance Score (CPS = 0,5·F1_uniq + 0,4·(1 − κ_SRME/2) + 0,1·RMSD AUC):

| Modelo | Pasos | F1 (uniq.) | F1 (full) | Precisión (uniq.) | Recall (uniq.) | MAE (eV/atom) | RMSE (eV/atom) | R² (uniq.) | κ_SRME | RMSD AUC | CPS |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| DPA-4.0.1-Pro-MPtrj oficial (HybridMuon) | 2.000.000 | 0,8615 | 0,8418 | 0,8596 | 0,8635 | 0,0284 | 0,0735 | 0,8410 | 0,2114 | 0,7651 | 0,8650 |
| Physmuon `900k-ema.pt` | 900.000 | 0,8607 | 0,8405 | 0,8459 | 0,8760 | 0,0283 | 0,0705 | 0,8536 | 0,2106 | 0,7719 | 0,8654 |
| Physmuon `1465k-ema.pt` | 1.465.000 | 0,8712 | 0,8538 | 0,8631 | 0,8794 | 0,0272 | 0,0705 | 0,8535 | 0,1860 | 0,7734 | 0,8757 |

Otras evaluaciones del checkpoint de 1.465.000 pasos:

| Suite | Métrica | Resultado |
|---|---|---|
| DynaMat v1.0 NVT MD (17 sistemas, RTX 5090) | Error RDF | 3,56 % |
| DynaMat v1.0 NVT MD | Error ADF | 1,51 % |
| DynaMat v1.0 NVT MD | Error VDOS | 22,31 % |
| DynaMat v1.0 NVT MD | Error de presión | 48,73 % |
| DynaMat v1.0 NVT MD | CMDS (con runtime) | 0,6201 |
| DynaMat v1.0 NVT MD | Subscore solo precisión | 0,7299 (oficial: 0,7377) |
| Dímeros homonucleares H–U | CDS | 0,1831 (oficial: 0,1338) |

En Matbench Discovery: 256.963/256.963 relajaciones WBM con 0 errores; 103/103 materiales de PhononDB sin fallos ni modos imaginarios; κ_SRE = 0,0920, κ_SRD = −0,038, spectrum_w1 = 0,11.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el checkpoint pesa ~91 MB en float32 y el modelo tiene 22,7 M de parámetros, por lo que cabe holgadamente en cualquier GPU con más de 1 GB de VRAM para el modelo en sí. El consumo real lo domina el tamaño del sistema atómico simulado (número de átomos y vecinos).
- GPU recomendadas: RTX 5090 (usada en las evaluaciones publicadas), H200 (referencia del leaderboard oficial). Cualquier GPU moderna con soporte CUDA es suficiente; también es viable en CPU para sistemas pequeños.
- Cabe en GPU de consumo: sí, en RTX 3060/4060/4090 y superiores, limitado por la memoria necesaria para las vecindades, no por los pesos.
- Opciones de despliegue: `deepmd-kit[torch]==3.2.0` (o `3.2.0b0`), integración con LAMMPS e i-PI a través de la interfaz DeepPot, y los scripts del runner de Matbench Discovery.
- Latencia y throughput: no disponible de forma agregada; las evaluaciones reportan el CMDS con puntuación de runtime en RTX 5090 (0,6201) y en H200 (0,5975), lo que indica que el hardware influye en la puntuación de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Dataset | CPS (Matbench Discovery) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DPA-4.0.1-Pro-MPtrj-Physmuon (este) | 22,7 M | MPtrj | 0,8757 | CC-BY-4.0 | Hugging Face |
| DPA-4.0.1-Pro-MPtrj oficial | 22,7 M | MPtrj | 0,8650 | no disponible en la información | GitHub / leaderboard |
| Otros MLIP universales (MACE, CHGNet, ORB) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa solo es posible con el baseline oficial, ya que la información proporcionada no incluye métricas de otros potenciales interatómicos bajo el mismo protocolo.

## Limitaciones y advertencias

- El modelo se entrena únicamente con MPtrj; su dominio de validez son materiales inorgánicos cristalinos cubiertos por Materials Project. El rendimiento fuera de esa distribución (moléculas orgánicas, líquidos complejos, sistemas amorfos) no está caracterizado.
- El error de presión en dinámica molecular NVT es alto (48,73 %), lo que desaconseja su uso para cálculos de ecuación de estado o propiedades dependientes de la presión sin validación previa.
- El error de VDOS (22,31 %) es notablemente superior al de RDF y ADF; las propiedades vibracionales deben tratarse con cautela.
- El subscore de precisión en DynaMat (0,7299) es ligeramente inferior al oficial (0,7377), pese a la mejora en CPS de Matbench Discovery: la mejora no es uniforme en todas las suites.
- El CDS en dímeros homonucleares incluye un subscore de precisión de 0 por comportamiento repulsivo extremo en He, Ne y H, cualitativamente similar al modelo base; no es fiable para esos elementos a distancias muy cortas.
- Riesgo de extrapolación: como todo MLIP, puede producir energías no físicas en configuraciones muy alejadas del dataset de entrenamiento; se recomienda monitorizar fuerzas anómalas en producción.
- Licencia CC-BY-4.0: permite uso comercial y modificaciones con atribución, pero exige citar a los autores originales de la arquitectura y a los del optimizador.
- Los checkpoints son EMA float32; no se publican versiones cuantizadas ni exportaciones a otros formatos, lo que limita el despliegue fuera de `deepmd-kit`.
- El modelo no incluye cargas, momentos magnéticos ni estados excitados: no apto para sistemas electroquímicos o magnéticos sin extensiones.

## Enlaces

- Hugging Face: https://huggingface.co/orange4664/DPA-4.0.1-Pro-MPtrj-Physmuon
- Paper de la arquitectura DPA-4.0.1-Pro: https://arxiv.org/abs/2606.02419
- Paper del optimizador PhysMuon: https://arxiv.org/abs/2608.22994
- Repositorio de PhysMuon: https://github.com/Hyyu-Lab/PhysMuon
- Repositorio deepmd-kit: https://github.com/deepmodeling/deepmd-kit
- PR de deepmd-kit: https://github.com/deepmodeling/deepmd-kit/pull/6162
- Matbench Discovery: https://github.com/janosh/matbench-discovery
- Entrada del modelo base en Matbench Discovery: https://github.com/janosh/matbench-discovery/blob/main/models/deepmd/dpa-4.0.1-pro-mptrj.yml
