# jiangshuan6/CortexJEPA

## Resumen

CortexJEPA es un modelo de aprendizaje conjunto de representaciones predictivas (JEPA, por sus siglas en inglés) aplicado a la transcriptómica espacial de la corteza cerebral. Desarrollado por JiangShuan Pang (usuario jiangshuan6), el modelo trata una sección de tejido como un conjunto de vecindarios locales de células o puntos, donde cada célula se describe por su expresión génica dispersa y su posición espacial en la corteza. En lugar de aprender a partir de células como vectores de expresión independientes, CortexJEPA aprende a predecir representaciones de células enmascaradas a partir de su contexto espacial circundante, capturando tanto el estado molecular como la organización cortical local.

El modelo sigue la filosofía JEPA de Yann LeCun: predice representaciones de células objetivo ocultas en lugar de reconstruir los conteos de genes crudos. La arquitectura combina un codificador de genes dispersos, un Transformer espacial de 12 capas con 768 dimensiones ocultas y 12 cabezas de atención, codificación posicional rotatoria 3D, un predictor JEPA de 6 capas con 384 dimensiones, y cabezales de clasificación o regresión para tareas específicas. La ventana de inferencia por defecto admite hasta 2048 células o puntos por región local. Se publican checkpoints para marmoset (tití común) y macaco, con vocabularios de genes de 34.805 y 16.266 genes respectivamente, e incluye soporte para inferencia entre especies mediante una tabla de ortólogos.

CortexJEPA es relevante porque permite analizar la organización molecular de la corteza cerebral con resolución celular, predecir capas corticales, regresar el eje PrAl (un gradiente molecular característico de la corteza de primates) y estimar 16 atributos multimodales corticales. Esto lo convierte en una herramienta útil para la neurociencia computacional y la investigación de la arquitectura cortical.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JEPA (Joint Embedding Predictive Architecture) con Transformer espacial de 12 capas, 768 dimensiones ocultas, 12 cabezas de atención, predictor de 6 capas con 384 dimensiones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 células/puntos por ventana local |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo biológico, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

CortexJEPA sigue el paradigma JEPA: un codificador de contexto observa las células visibles, un codificador objetivo produce representaciones para las células ocultas, y un predictor aprende a inferir esas representaciones objetivo a partir del contexto. El modelo consta de cinco componentes principales:

- **Codificador de genes dispersos**: los genes no nulos de cada célula se mapean mediante embeddings de genes aprendidos, ponderados por sus valores de expresión, se agregan en un token de célula y se proyectan al espacio oculto del modelo.
- **Transformer espacial**: los tokens de célula se procesan con un Transformer de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención.
- **Codificación posicional 3D**: las coordenadas celulares se inyectan mediante codificación posicional rotatoria, permitiendo que la atención dependa de la geometría cortical.
- **Predictor JEPA**: una red de 6 capas con 384 dimensiones utiliza las representaciones de las células de contexto y las coordenadas objetivo para predecir las representaciones de las células enmascaradas.
- **Cabezales de tarea**: los checkpoints afinados añaden cabezales de clasificación o regresión para capa cortical, eje PrAl y predicción multimodal.

No se proporcionan detalles sobre el conjunto de datos de entrenamiento, el número de tokens o pasos, ni si se utilizaron técnicas como RLHF o DPO. La información disponible solo indica que se liberan checkpoints preentrenados y afinados para marmoset y macaco.

## Capacidades

- Generación de embeddings celulares de 768 dimensiones a partir de datos de transcriptómica espacial.
- Clasificación de capas corticales con siete etiquetas: `L1`, `L2`, `L2-Al`, `L3`, `L4`, `L5` y `L6`.
- Regresión del eje PrAl (gradiente molecular anteroposterior) en marmoset, devolviendo un escalar por célula.
- Predicción multimodal de 16 atributos corticales en marmoset, incluyendo densidades neuronales por capa, espesores de capa, métricas de redes visuales y mapas de mielina.
- Inferencia entre especies mediante una tabla de ortólogos uno a uno para humano, ratón, macaco y marmoset; los genes sin ortólogo mapeado se omiten.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes ni razonamiento simbólico.

## Casos de uso

- **Análisis de transcriptómica espacial en corteza cerebral**: el modelo procesa datos de expresión génica con coordenadas espaciales para generar representaciones celulares que capturan tanto el estado molecular como la organización cortical local, facilitando la caracterización de tipos celulares y su distribución laminar.
- **Identificación de capas corticales**: los cabezales de clasificación permiten asignar automáticamente cada célula a una de las siete capas corticales (L1 a L6, incluyendo L2-Al), lo que agiliza el análisis de secciones de tejido en estudios de neuroanatomía.
- **Estudio de gradientes moleculares**: la regresión del eje PrAl en marmoset proporciona un valor continuo por célula que refleja la posición a lo largo del gradiente anteroposterior, útil para investigar la organización topográfica de la corteza.
- **Caracterización multimodal de atributos corticales**: el modelo predice 16 métricas como densidades neuronales por capa, espesores de capa y métricas de redes visuales, permitiendo correlacionar la expresión génica con propiedades estructurales y funcionales.
- **Comparación entre especies**: gracias a la tabla de ortólogos, se puede aplicar el modelo entrenado en marmoset o macaco a datos de otras especies (humano, ratón), facilitando estudios comparativos de la organización cortical.
- **Integración en pipelines de análisis single-cell**: la API acepta objetos `anndata.AnnData` o archivos `.h5ad`, lo que permite incorporar CortexJEPA en flujos de trabajo existentes de análisis de transcriptómica espacial sin necesidad de conversiones de formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas de precisión, exactitud o comparaciones con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de VRAM, GPU o memoria en la información proporcionada.
- El código de ejemplo utiliza `device="cuda"`, lo que indica que la inferencia está diseñada para GPU con soporte CUDA.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama; el paquete se instala vía `pip install -e ".[hub]"` y se usa como biblioteca Python.
- No hay datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se proporciona información sobre modelos comparables en la misma categoría (modelos de transcriptómica espacial con arquitectura JEPA o similar).

## Limitaciones y advertencias

- El vocabulario de genes es específico por especie: 34.805 genes para marmoset y 16.266 para macaque. Los genes de la especie de entrada que no tengan un ortólogo mapeado en el vocabulario objetivo se omiten, lo que puede reducir la cobertura en datos de especies no incluidas.
- La inferencia entre especies depende de la calidad de la tabla de ortólogos; genes con mapeo ambiguo o ausente pueden afectar la precisión.
- No se dispone de información sobre sesgos, riesgos de alucinación o limitaciones de contexto más allá de la ventana de 2048 células por región.
- La licencia no está especificada, por lo que no se puede confirmar si el uso comercial está permitido.
- El modelo requiere datos de entrada con un formato específico: expresión en `.X`, `.raw.X` o `.layers[...]`, coordenadas espaciales en `obsm["spatial"]` o columnas de `obs`, y una columna de segmentación de tejido (normalmente `segment`). Si falta esta última, se puede generar una segmentación por defecto, pero puede no ser óptima para todos los experimentos.
- No es un modelo generativo de texto ni admite tareas de procesamiento de lenguaje natural.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jiangshuan6/CortexJEPA
- Perfil del autor en HuggingFace: https://huggingface.co/jiangshuan6
- No se han encontrado papers, blogs o repositorios adicionales específicos de CortexJEPA en la información disponible.
