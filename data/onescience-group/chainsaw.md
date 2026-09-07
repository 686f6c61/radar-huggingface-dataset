# OneScience-Group/Chainsaw

## Resumen

Chainsaw es una red neuronal completamente convolucional desarrollada por OneScience-Group, diseñada para predecir los límites de dominios estructurales en proteínas a partir de su estructura tridimensional. El modelo resuelve un problema clave en bioinformática: la segmentación de cadenas polipeptídicas en dominios funcionales, utilizando características de distancias entre residuos y de estructura secundaria calculadas mediante STRIDE. Su relevancia actual radica en la integración con estructuras predichas por AlphaFold, donde la identificación precisa de dominios es esencial para análisis funcionales. La arquitectura es una FCN (fully convolutional network), con tres versiones de pesos preentrenados incluidas en el repositorio; el tamaño de la red no se especifica en la documentación disponible. No se trata de un modelo de lenguaje, sino de un modelo especializado en visión estructural de proteínas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal completamente convolucional (fully convolutional neural network) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de segmentación de estructuras, no de lenguaje) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (etiqueta del repositorio; el modelo procesa estructuras de proteínas, no texto) |
| Licencia | MIT |
| Formato de pesos | .pt (PyTorch) |

## Arquitectura y entrenamiento

Chainsaw se basa en una arquitectura de red neuronal completamente convolucional (FCN), que opera sobre matrices de características derivadas de la estructura tridimensional de la proteína. El pipeline consta de cuatro etapas: parseo de la cadena y generación de la matriz de distancias entre residuos; ejecución de STRIDE para calcular la estructura secundaria; predicción mediante FCN de la probabilidad de que cada par de residuos pertenezca al mismo dominio; y post-procesamiento para convertir la matriz en límites de dominios continuos o discontinuos, con puntuaciones de confianza. El repositorio incluye tres versiones de pesos preentrenados (model_v1, model_v2 y model_v3, siendo la última la utilizada por defecto). No se proporcionan datos sobre el corpus de entrenamiento ni sobre el número de parámetros. No se menciona ningún tipo de ajuste mediante RLHF o DPO.

## Capacidades

- Predicción de límites de dominios estructurales a partir de estructuras tridimensionales en formato PDB o mmCIF.
- Extracción de características de distancia entre residuos y de estructura secundaria mediante STRIDE.
- Generación de puntuaciones de confianza para cada segmento de dominio.
- Soporte de procesamiento por lotes de múltiples archivos de estructura mediante un directorio de entrada.
- Inclusión de tres versiones de pesos preentrenados (v1, v2 y v3), seleccionables en la ejecución.
- Salida en formato TSV con el identificador de cadena, número de residuos, número de dominios, rangos de residuos y tiempo de ejecución.
- No es un modelo de lenguaje: no admite tool calling, generación de texto ni razonamiento multi-paso.

## Casos de uso

- Segmentación de estructuras individuales: el usuario proporciona un archivo PDB o mmCIF de una cadena de proteína y obtiene los rangos de residuos que conforman cada dominio estructural, con su puntuación de confianza.
- Análisis de estructuras AlphaFold: se puede ejecutar el modelo sobre estructuras predichas por AlphaFold para identificar límites de dominios, lo que facilita el estudio funcional de proteínas sin estructura experimental.
- Procesamiento por lotes: la opción `--structure_directory` permite analizar múltiples archivos de estructura en un directorio, generando una tabla TSV consolidada para su uso en bases de datos o flujos de trabajo.
- Cribado de límites de dominio: el modelo devuelve el número de dominios, los rangos de residuos y el tiempo de ejecución, lo que permite comparar rápidamente diferentes cadenas en estudios evolutivos.
- Integración en pipelines de bioinformática: al ser una herramienta de línea de comandos con PyTorch, se puede integrar en flujos de trabajo automatizados para anotación de proteínas.
- Enseñanza y validación: los archivos de ejemplo incluidos permiten validar la instalación y familiarizarse con la segmentación de dominios sin necesidad de descargar datasets de entrenamiento.
- Predicción de dominios en proteínas multidominio: para cadenas largas con varios dominios, el modelo identifica las regiones estructuralmente independientes, útil para estudios de plegamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia compatible con CPU y DCU (unidad de procesamiento de datos).
- No se especifica la VRAM requerida en la documentación disponible.
- No se recomiendan GPUs específicas; el modelo puede ejecutarse sin acelerador gráfico.
- STRIDE, el parseo de estructuras y parte del post-procesamiento se ejecutan en CPU.
- Opciones de despliegue: script Python con PyTorch, entorno OneCode de OneScience.
- No se proporcionan cifras de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información comparativa en los datos proporcionados.

## Limitaciones y advertencias

- Requiere compilar el ejecutable STRIDE incluido en `scripts/stride/` antes de la primera ejecución.
- El modelo necesita una estructura tridimensional como entrada; no acepta únicamente secuencias de aminoácidos.
- La etiqueta de idioma del repositorio es "en", pero no procesa texto; no admite tool calling ni generación de lenguaje.
- No se ha publicado información sobre los datos de entrenamiento, por lo que no es posible evaluar sesgos.
- La licencia MIT permite uso comercial, pero se recomienda revisar el artículo original para confirmar citaciones y condiciones adicionales.
- La precisión en dominios no canónicos o estructuras de baja resolución puede ser limitada; no se aportan métricas de error.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/Chainsaw
- Artículo original: https://doi.org/10.1093/bioinformatics/btae296
- OneCode: https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
- Página de modelos de OneScience: https://huggingface.co/OneScience-Group/models
