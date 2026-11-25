# SaiSubodh/indianmatter-models

## Resumen

IndianMatter AI es un repositorio de modelos de Hugging Face publicado por el usuario SaiSubodh bajo el paraguas de "IndianMatter AI (IndianMaterialsAI)", una plataforma orientada a la predicción de propiedades de materiales, electrolitos para baterías de estado sólido y potenciales interatómicos universales. No se trata de un único modelo de lenguaje, sino de una colección de 23 checkpoints, ensembles y modelos neuronales agrupados en seis familias: CrystalFormer, IonCast v5/v6, CHGNet, M3GNet, MACE y el pipeline BFSY.

El repositorio combina transformers sobre marcos de grupo espacial (CrystalFormer) para predecir formación de energía, band gap, módulos elásticos y energía sobre el casco convexo; ensembles de árboles potenciados y MLPs (IonCast) para conductividad iónica y energía de activación en electrolitos sólidos; y potenciales interatómicos de grafos neuronales (CHGNet, M3GNet, MACE) para energía, fuerzas, tensión y momentos magnéticos. El tamaño del repositorio es de 0,5 GB y la licencia declarada es Apache 2.0.

Es relevante ahora porque agrupa en un solo artefacto descargable varias herramientas de simulación atomística y cribado de materiales que habitualmente se distribuyen por separado, con métricas declaradas por el autor (por ejemplo, MAE de 0,017 eV/átomo en energía de formación para CrystalFormer). No obstante, el repositorio tiene cero descargas y cero likes en el momento de la consulta, y no se ha publicado información sobre benchmarks independientes ni sobre el proceso de validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Suite heterogénea: transformers sobre marcos de grupo espacial (CrystalFormer), ensembles de árboles potenciados y MLPs (IonCast), y GNN equivariantes/informados por carga (CHGNet, M3GNet, MACE) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la entrada es estructura cristalina o composición) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ckpt` (CrystalFormer), `.pkl` (IonCast y pipeline BFSY), `.pt` (CHGNet y MACE), `.json` + `.pt` (M3GNet vía MatGL) |

## Arquitectura y entrenamiento

La suite agrupa arquitecturas muy distintas. CrystalFormer emplea transformers que operan sobre marcos de grupo espacial para predecir propiedades cristalinas escalares (energía de formación, band gap, módulo de compresión, módulo de cizalladura y energía sobre el casco convexo), con checkpoints separados para los conjuntos de datos MP y JARVIS. IonCast v5/v6 es un ensemble de apilamiento (stacking) que combina LightGBM, XGBoost, CatBoost, HistGradientBoosting, ExtraTrees y MLPs para predecir conductividad iónica y energía de activación; incluye un meta-aprendiz Ridge, un transformador de cuantiles de 343 dimensiones y un modelo corrector GradientBoosting calibrado contra medidas experimentales. CHGNet es una GNN informada por carga que predice energía, fuerzas, tensión y momentos magnéticos; M3GNet es una GNN universal de superficie de energía potencial entrenada sobre el conjunto MPtrj (1,3 millones de estructuras); y MACE es un potencial interatómico de paso de mensajes equivariante de orden superior.

En cuanto a datos de entrenamiento, la model card menciona el conjunto MPtrj para M3GNet, 9.956 electrolitos de estado sólido para la validación cruzada de IonCast y referencias a los benchmarks DFT 3D de JARVIS para varios checkpoints de CrystalFormer. No se especifica el número total de tokens ni la composición detallada de los datasets de CrystalFormer, ni si hubo etapas de RLHF o DPO (no aplicables en este dominio). Tampoco se documentan innovaciones como decodificación especulativa o atención lineal, ya que no es un modelo generativo de texto.

## Capacidades

- Predicción de energía de formación, band gap electrónico, band gap MBJ, band gap óptico, energía total, módulo de compresión, módulo de cizalladura y energía sobre el casco convexo a partir de estructuras cristalinas (CrystalFormer).
- Predicción de conductividad iónica y energía de activación en electrolitos de estado sólido mediante ensembles (IonCast v5/v6).
- Cálculo de energía, fuerzas, tensión y momentos magnéticos con potenciales interatómicos universales (CHGNet, M3GNet, MACE).
- Relajación de superficies de energía potencial universal (M3GNet).
- Extracción de descriptores y predicción multipropiedad de extremo a extremo mediante el pipeline BFSY.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el repositorio declara únicamente inglés.
- Capacidades especiales: potenciales informados por carga (CHGNet), ensembles calibrados con datos experimentales (IonCast v6) y checkpoints específicos por propiedad y por dataset (MP, JARVIS).

## Casos de uso

- Cribado de electrolitos para baterías de estado sólido: IonCast permite estimar conductividad iónica y energía de activación sobre composiciones candidatas antes de sintetizarlas, lo que reduce el número de experimentos necesarios en la fase de descubrimiento.
- Predicción de estabilidad termodinámica de nuevas estructuras cristalinas: los checkpoints `jarvis_ehull.ckpt` y `mp_e_form.ckpt` de CrystalFormer permiten calcular energía sobre el casco convexo y energía de formación para descartar fases inestables en pipelines de generación de materiales.
- Estimación de propiedades electrónicas para aplicaciones de semiconductores: los checkpoints de band gap (MP, MBJ y óptico) permiten clasificar materiales como metálicos o no metálicos y priorizar candidatos con gaps adecuados.
- Relajación de estructuras y cálculo de fuerzas en dinámica molecular: CHGNet, M3GNet y MACE pueden usarse como potenciales sustitutos de la DFT en simulaciones de relajación y dinámica molecular, reduciendo el coste computacional frente a cálculos ab initio.
- Predicción de propiedades mecánicas para diseño de materiales estructurales: los checkpoints de módulo de compresión y cizalladura de CrystalFormer permiten estimar rigidez y comportamiento elástico de candidatos.
- Integración en pipelines de descubrimiento de materiales de extremo a extremo: el pipeline BFSY serializado permite encadenar extracción de descriptores y predicción multipropiedad en un solo flujo de evaluación.
- Análisis de momentos magnéticos en materiales: CHGNet predice momentos magnéticos junto con energía, fuerzas y tensión, útil en el estudio de materiales magnéticos.

## Benchmarks y rendimiento

Los datos disponibles son los declarados por el autor en la model card; no se han publicado resultados de benchmarks independientes.

| Modelo / checkpoint | Tarea | Métrica declarada |
|---|---|---|
| CrystalFormer `mp_e_form.ckpt` | Energía de formación | MAE 0,017 eV/átomo (paper); 0,034 eV/átomo (test ciego de 50 Li) |
| CrystalFormer `mp_bandgap.ckpt` | Band gap electrónico | MAE ~0,30 eV; 0,13-0,28 eV en no metales |
| CrystalFormer `mp_bulk_modulus.ckpt` | Módulo de compresión (log10 K) | Error mediano ~5% |
| CrystalFormer `mp_shear_modulus.ckpt` | Módulo de cizalladura (log10 G) | Error mediano ~19% |
| CHGNet `chgnet_model.pt` | Energía / fuerzas | MAE energía 0,029 eV/átomo; MAE fuerzas 0,068 eV/Å |
| IonCast v5 | Energía de activación | Validación cruzada 5-fold sobre 9.956 electrolitos (sin métrica numérica publicada) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio completo ocupa 0,5 GB en disco, por lo que los checkpoints individuales son ligeros y previsiblemente caben en GPUs de consumo, aunque no se documentan requisitos concretos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probable dada la huella de disco del repositorio, pero no confirmada por el autor.
- Opciones de despliegue: carga directa en Python mediante `huggingface_hub`, `joblib` (IonCast y BFSY), `chgnet` (CHGNet) y MatGL (M3GNet); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| IndianMatter AI (esta suite) | Suite de potenciales y regresores de propiedades | Estructura cristalina / composición | Apache 2.0 | Hugging Face, 0 descargas |
| CHGNet (original, Deng et al.) | GNN informada por carga | Estructura atómica | MIT (según repositorio original) | GitHub y PyPI |
| M3GNet (original, Chen et al.) | GNN universal de PES | Estructura atómica | BSD-3 (según repositorio original) | MatGL / GitHub |
| MACE (original, Batatia et al.) | Potencial equivariante | Estructura atómica | MIT (según repositorio original) | GitHub |

No se dispone de datos comparativos de rendimiento entre esta suite y las implementaciones originales en la información proporcionada.

## Limitaciones y advertencias

- El repositorio tiene cero descargas y cero likes, y no se ha publicado validación externa ni revisión por pares de los checkpoints empaquetados.
- Las métricas de rendimiento son las declaradas por el autor en la model card; no se han verificado de forma independiente.
- El error mediano del 19% en el módulo de cizalladura de CrystalFormer es elevado para aplicaciones de diseño mecánico de precisión.
- El MAE de band gap de ~0,30 eV puede ser insuficiente para clasificar materiales con gaps pequeños cercanos a la transición metal-aislante.
- El repositorio declara únicamente inglés; no se documentan capacidades multilingües.
- No se documentan sesgos conocidos, riesgos de alucinación (no aplicables en el mismo sentido que en modelos de lenguaje) ni limitaciones de contexto, al no ser un modelo generativo de texto.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de checkpoints derivados de modelos de terceros (CHGNet, M3GNet, MACE, CrystalFormer) conviene verificar las licencias de las implementaciones originales antes de un despliegue en producción.
- No se documenta el proceso de entrenamiento, los hiperparámetros ni la composición exacta de los datasets, lo que dificulta la reproducibilidad.
- El pipeline BFSY se distribuye como objeto serializado `.pkl`, lo que introduce riesgos de seguridad al deserializar archivos pickle de origen no verificado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SaiSubodh/indianmatter-models
- CHGNet (implementación original): no disponible en la información proporcionada
- M3GNet / MatGL (implementación original): no disponible en la información proporcionada
- MACE (implementación original): no disponible en la información proporcionada
- CrystalFormer (paper de referencia): no disponible en la información proporcionada
- Blog o demo de IndianMatter AI: no disponible en la información proporcionada
