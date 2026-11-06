# hellnahbru/OpenFold-preserved-20261029

## Resumen

OpenFold-preserved-20261029 es un espejo de los pesos del modelo OpenFold, una reimplementación en código abierto de AlphaFold2 desarrollada por el laboratorio de AlQuraishi (Universidad de Columbia). El repositorio, publicado por el usuario hellnahbru, actúa como solución de emergencia ante la caída del enlace de descarga original del proyecto, y recoge los parámetros de la versión 06_22 del modelo entrenado con OpenFold. No se trata de un modelo de lenguaje, sino de un modelo de predicción de estructura de proteínas basado en la arquitectura Evoformer y el módulo de estructura de AlphaFold2.

El modelo resuelve el problema del plegamiento de proteínas a partir de su secuencia de aminoácidos, prediciendo coordenadas atómicas tridimensionales. Su relevancia radica en que ofrece una alternativa abierta y reproducible a AlphaFold2, con pesos entrenados desde cero (no destilados directamente de AlphaFold2 en la fase final) y con ramas de ajuste fino que permiten elegir entre usar plantillas o no, así como variantes con módulo pTM para estimación de confianza global.

El repositorio ocupa 3,4 GB y contiene múltiples checkpoints en formato PyTorch (`.pt`), organizados por fases de entrenamiento. La licencia es CC-BY-4.0, lo que permite uso comercial con atribución. No se dispone de información sobre idiomas, pipeline ni parámetros totales en la ficha de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal basada en AlphaFold2 (Evoformer + módulo de estructura) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la entrada es una secuencia de aminoácidos de longitud variable) |
| Tipos de cuantizacion | no disponible (pesos en precisión original PyTorch) |
| Idiomas soportados | no disponible (no aplica; entrada/salida biológica) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

OpenFold replica la arquitectura de AlphaFold2: un trunk basado en Evoformer que procesa múltiples secuencias (MSA) y pares de residuos, seguido de un módulo de estructura que genera coordenadas 3D mediante un equivariant transformer. El entrenamiento se realizó con OpenFold sobre 44 GPU A100, siguiendo el calendario de la Tabla 4 del suplemento de AlphaFold, usando AlphaFold como modelo de predestilación. Los datos de entrenamiento están alojados públicamente en el repositorio RODA "OpenFold Training Data".

Para mejorar la diversidad del modelo, se bifurcó el entrenamiento tras la fase inicial y se ajustó una rama adicional sin plantillas. Los checkpoints se organizan en: `initial_training.pt` (final de la fase inicial), `finetuning_x.pt` (picos de LDDT-Ca en validación durante 45 épocas), `finetuning_no_templ_x.pt` (rama sin plantillas), `finetuning_no_templ_ptm_x.pt` y `finetuning_ptm_x.pt` (fases con módulo pTM). La validación se realizó sobre ~180 cadenas de CAMEO de finales de 2021, con puntuaciones LDDT-Ca medias que oscilan entre 0,9014 y 0,9097 según el checkpoint.

## Capacidades

- Predicción de estructura tridimensional de proteínas a partir de secuencia de aminoácidos.
- Generación de coordenadas atómicas (esqueleto y cadenas laterales) con estimación de confianza por residuo (pLDDT).
- Modo con plantillas (templates) y modo sin plantillas, seleccionable según el checkpoint.
- Estimación de confianza global mediante el módulo pTM en las variantes `_ptm`.
- Procesamiento de MSA (multiple sequence alignment) como entrada auxiliar.
- No soporta tool calling, agentes, ni generación de texto; no es un modelo de lenguaje.
- No dispone de capacidades multilingües, visión, audio ni modo thinking.

## Casos de uso

- Predicción de estructuras proteicas en investigación académica: el modelo permite obtener estructuras 3D de proteínas sin necesidad de cristalografía o criomicroscopía, usando los checkpoints `finetuning_ptm_2` (mejor LDDT-Ca, 0,9097) para máxima precisión.
- Análisis de variantes y mutaciones: al predecir estructuras de secuencias mutadas, se puede evaluar el impacto estructural de variantes genéticas en estudios de enfermedad.
- Diseño de fármacos y biológicos: la estructura predicha sirve como base para docking molecular y diseño de inhibidores, especialmente en dianas sin estructura experimental.
- Validación de modelos de plegamiento: al ser una reimplementación abierta de AlphaFold2, se usa como referencia para comparar y validar otras herramientas de predicción.
- Docencia y formación: el repositorio permite a estudiantes ejecutar el pipeline completo de AlphaFold2 con pesos abiertos, sin depender de enlaces externos.
- Reproducibilidad de experimentos: los múltiples checkpoints (inicial, finetuning, sin plantillas, con pTM) permiten estudiar el efecto de cada fase de entrenamiento en el rendimiento final.
- Integración en pipelines bioinformáticos: los pesos en PyTorch pueden cargarse en el código de OpenFold para procesar lotes de secuencias en servidores de cálculo científico.

## Benchmarks y rendimiento

Los únicos datos de rendimiento proporcionados son las puntuaciones medias de LDDT-Ca en validación (conjunto CAMEO, ~180 cadenas, finales de 2021):

| Checkpoint | LDDT-Ca medio |
|---|---|
| initial_training | 0,9088 |
| finetuning_2 | 0,9061 |
| finetuning_3 | 0,9075 |
| finetuning_4 | 0,9059 |
| finetuning_5 | 0,9054 |
| finetuning_no_templ_1 | 0,9014 |
| finetuning_no_templ_2 | 0,9032 |
| finetuning_no_templ_ptm_1 | 0,9025 |
| finetuning_ptm_1 | 0,9075 |
| finetuning_ptm_2 | 0,9097 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el entrenamiento usó 44 GPU A100, pero la inferencia puede ejecutarse en una sola GPU.
- GPU recomendadas: A100 o H100 para máxima velocidad; GPU consumer de gama alta (RTX 3090, RTX 4090) pueden ejecutar inferencia con precisión completa o media, aunque el rendimiento no está documentado en esta ficha.
- Cabe en GPU consumer: probablemente sí en RTX 3090/4090 (24 GB VRAM), dado que el repositorio completo pesa 3,4 GB y los checkpoints individuales son de menor tamaño; no confirmado en la información disponible.
- Opciones de despliegue: el código oficial de OpenFold (GitHub) carga los pesos en PyTorch. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (LDDT-Ca) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenFold (este repo) | no disponible | no aplica | 0,9014–0,9097 (CAMEO) | CC-BY-4.0 | Pesos en Hugging Face |
| AlphaFold2 (DeepMind) | no disponible | no aplica | Referencia original; no comparable directamente en esta ficha | Licencia de código abierto con restricciones (CC-BY 4.0 para parámetros, pero términos específicos) | Pesos oficiales en GitHub de DeepMind |
| ESMFold (Meta) | no disponible | no aplica | No disponible en esta ficha | MIT (código) / CC-BY-NC 4.0 (pesos) | Pesos en Hugging Face (facebook/esmfold_v1) |

No se dispone de datos comparativos adicionales en la información proporcionada.

## Limitaciones y advertencias

- Es un espejo no oficial: el autor original es el laboratorio de AlQuraishi; este repositorio solo replica los pesos. No hay garantía de mantenimiento o actualización.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes; su uso está restringido a predicción de estructura proteica.
- Rendimiento dependiente de la calidad del MSA: al igual que AlphaFold2, requiere alineamientos múltiples de calidad para buenos resultados; secuencias sin homólogos pueden dar predicciones pobres.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero se debe citar a los autores originales de OpenFold y AlphaFold2 según corresponda.
- Riesgo de alucinación estructural: el modelo puede generar coordenadas con alta confianza (pLDDT) en regiones desordenadas, lo que requiere validación experimental.
- Sin soporte para ácidos nucleicos ni ligandos: solo proteínas.
- El checkpoint `finetuning_1.pt` está deprecado y no se incluye.
- No se especifican sesgos conocidos más allá de los inherentes a los datos de entrenamiento (PDB, CAMEO), que pueden infrarrepresentar ciertas familias proteicas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hellnahbru/OpenFold-preserved-20261029
- Repositorio oficial de OpenFold: https://github.com/aqlaboratory/openfold
- Datos de entrenamiento OpenFold (RODA): no se proporciona URL directa en la información disponible.
- Paper de OpenFold: no disponible en la información proporcionada.
- Paper de AlphaFold2 (referencia): no disponible en la información proporcionada.
