# dgrauet/ernie-image-pe-mlx

## Resumen

`dgrauet/ernie-image-pe-mlx` es una conversión al formato MLX del componente Prompt Enhancer (PE) del modelo de generación de imágenes `baidu/ERNIE-Image-Turbo`, realizada por el desarrollador dgrauet mediante la herramienta `mlx-forge`. El Prompt Enhancer es un submódulo encargado de refinar y ampliar las indicaciones de texto del usuario antes de que estas se utilicen para generar imágenes, lo que mejora la calidad y fidelidad de los resultados. Esta conversión permite ejecutar dicho componente de forma local en hardware Apple Silicon, sin depender de la API en la nube de Baidu.

El repositorio contiene los pesos del Prompt Enhancer en formato `safetensors` (6,39 GB), junto con su configuración (`pe_config.json`), el tokenizador y los archivos de generación. Se integra con la herramienta `ernie-image-mlx`, que proporciona una interfaz de línea de comandos para generar imágenes con el modelo base en MLX. La licencia es Apache-2.0, lo que permite uso comercial y modificación. La relevancia de este modelo radica en que democratiza el acceso a un componente de un modelo propietario de Baidu, permitiendo su ejecución offline en equipos Mac con chips de la serie M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (componente Prompt Enhancer de ERNIE-Image-Turbo) |
| Parametros totales | no disponible (archivo `pe.safetensors` de 6,39 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 disponible (referencia a `dgrauet/ernie-image-pe-mlx-q4`); pesos originales en precisión completa |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del Prompt Enhancer en la documentación proporcionada. Al ser un componente del modelo ERNIE-Image-Turbo de Baidu, se presume que sigue el diseño del modelo original, pero los detalles específicos (número de capas, dimensiones ocultas, mecanismo de atención, etc.) no están documentados en esta conversión. El archivo `pe_config.json` (901 bytes) contiene la configuración del componente, aunque su contenido no se ha publicado en la model card. Tampoco se dispone de datos sobre el entrenamiento del modelo original (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). La conversión a MLX fue realizada con `mlx-forge`, que transforma los pesos originales al formato optimizado para Apple Silicon.

## Capacidades

- Mejora de indicaciones de texto (prompt enhancement) para el modelo de generación de imágenes ERNIE-Image-Turbo, refinando y ampliando las descripciones del usuario.
- Ejecución local en Apple Silicon sin necesidad de conexión a la API de Baidu, garantizando privacidad de los datos y funcionamiento offline.
- Control de reproducibilidad mediante la semilla `--pe-seed`, independiente de la semilla que controla el latente de imagen.
- Integración con la herramienta `ernie-image-mlx` mediante interfaz de línea de comandos.
- Posibilidad de desactivar el Prompt Enhancer (`--no-pe`) o sustituirlo por otra conversión local (`--pe-local-dir` o `--pe-repo-id`).
- Soporte de cuantización Q4 para reducir el uso de memoria en equipos con menos RAM unificada.

## Casos de uso

- Generación de imágenes offline en Mac con Apple Silicon: el modelo permite ejecutar el Prompt Enhancer localmente, evitando la latencia y los costes de la API en la nube de Baidu. Se usaría con `ernie-image-mlx generate -p "descripcion" --pe-repo-id dgrauet/ernie-image-pe-mlx`.
- Entornos con requisitos de privacidad estrictos: al ejecutarse en local, las indicaciones del usuario nunca salen del equipo, lo que resulta adecuado para sectores como salud, legal o diseño de producto donde las descripciones pueden contener información sensible.
- Pipelines de generación por lotes: la reproducibilidad controlada por semilla (`--pe-seed`) permite generar series de imágenes consistentes a partir de variaciones controladas de la indicación, útil en estudios de diseño o generación de assets.
- Prototipado rápido de prompts: los desarrolladores pueden iterar sobre las indicaciones y ver cómo el Prompt Enhancer las transforma antes de enviarlas al modelo de imagen, facilitando el ajuste fino de las descripciones.
- Desarrollo de aplicaciones de diseño asistido: integración en herramientas de generación de imágenes para diseñadores que necesitan que las indicaciones en lenguaje natural se conviertan en prompts detallados y efectivos.
- Evaluación comparativa de calidad de prompts: al poder desactivar el enhancer (`--no-pe`) o sustituirlo por versiones cuantizadas, los investigadores pueden medir el impacto del Prompt Enhancer en la calidad final de las imágenes generadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre métricas de calidad de imagen (FID, CLIP score, etc.) ni comparaciones cuantitativas con otros prompt enhancers en la documentación del modelo.

## Requisitos de hardware

- El formato MLX está diseñado exclusivamente para Apple Silicon (chips M1, M2, M3, M4 y sucesores).
- El archivo `pe.safetensors` ocupa 6,39 GB en precisión completa, por lo que se recomienda un mínimo de 16 GB de RAM unificada para cargar los pesos junto con el modelo de generación de imágenes.
- La versión cuantizada Q4 (`dgrauet/ernie-image-pe-mlx-q4`) reduce significativamente el uso de memoria y es la opción recomendada para equipos con 8 GB de RAM unificada.
- El despliegue se realiza mediante la herramienta `ernie-image-mlx` (disponible en PyPI), que gestiona la carga de pesos y la generación de imágenes.
- No se dispone de datos de latencia o throughput específicos para este componente.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con modelos similares. El Prompt Enhancer de ERNIE-Image-Turbo es un componente específico del ecosistema de Baidu, y no se han identificado en la información proporcionada alternativas comparables en formato MLX. La comparación natural sería con el modelo original `baidu/ERNIE-Image-Turbo` en su formato original, pero no se dispone de datos de rendimiento para contrastar.

## Limitaciones y advertencias

- Es un componente, no un modelo completo: el Prompt Enhancer por sí solo no genera imágenes; requiere el modelo de difusión de ERNIE-Image-Turbo en MLX.
- Documentación muy limitada: la model card no incluye detalles sobre arquitectura, entrenamiento, idiomas soportados ni límites de contexto, lo que dificulta su evaluación técnica rigurosa.
- Exclusivo de Apple Silicon: al estar en formato MLX, no puede ejecutarse en GPUs NVIDIA, AMD o hardware Intel sin una conversión adicional.
- Riesgo de sesgos heredados: al ser una conversión del modelo de Baidu, puede heredar sesgos culturales o lingüísticos del entrenamiento original, aunque no se dispone de datos para confirmarlo.
- Riesgo de alucinación en el prompt: como modelo de lenguaje, el Prompt Enhancer puede generar indicaciones que no reflejen fielmente la intención del usuario, especialmente con descripciones ambiguas.
- El repositorio tiene 0 descargas y 0 likes en HuggingFace, lo que indica que es un proyecto reciente o poco validado por la comunidad.
- La licencia Apache-2.0 del repositorio no implica necesariamente que el modelo original de Baidu tenga la misma licencia; se recomienda verificar los términos de uso del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dgrauet/ernie-image-pe-mlx
- Modelo base original: https://huggingface.co/baidu/ERNIE-Image-Turbo
- Repositorio de la herramienta de generación: https://github.com/dgrauet/ernie-image-mlx
- Herramienta de conversión mlx-forge: https://github.com/dgrauet/mlx-forge
- Operaciones MLX reutilizables: https://github.com/dgrauet/mlx-arsenal
- Skill de portabilidad MLX para Claude Code: https://github.com/dgrauet/claude-skill-mlx-porting
- Paquete en PyPI: https://pypi.org/project/ernie-image-mlx/
