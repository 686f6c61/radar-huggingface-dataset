# mhieuuu/geode-internals

## Resumen

El repositorio `mhieuuu/geode-internals` no es un modelo de inteligencia artificial en sí, sino un almacén de artefactos internos de entrenamiento asociado al proyecto MARS V, denominado "Mechanistic Understanding of Elicitation vs. Teaching" (código disponible en GitHub). Su autor, Hieu Nguyen (usuario `mhieuuu`), lo publica como complemento público y sin tokens de `mhieuuu/geode-store`, que contiene los checkpoints finales y manifiestos de cada ejecución de entrenamiento. Este repositorio alberga los datos pesados necesarios para los análisis mecanicistas: pesos finales, snapshots de adaptadores LoRA por etapa, snapshots de fine-tuning completo, registros de gradientes y volcados de activaciones.

En la práctica, `geode-internals` es un conjunto de datos de investigación más que un modelo servible. Su propósito es facilitar el estudio de la elicitación frente a la enseñanza en modelos de lenguaje, mediante la comparación de snapshots intermedios de entrenamiento. No se proporcionan en la información disponible ni la arquitectura del modelo base, ni el tamaño de parámetros, ni la licencia de uso. El repositorio ocupa 42 GB y su contenido se estructura en directorios por ejecución (`runs/<run_id>/`), con manifiestos, snapshots de LoRA (aproximadamente 48 MB cada uno) y snapshots de fine-tuning completo en formato Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapters LoRA y pesos completos), además de JSON, parquet/csv y registros de texto |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura del modelo subyacente. El repositorio contiene snapshots de LoRA y de fine-tuning completo, lo que indica que se empleó la técnica LoRA con una peculiaridad: el escalado se define como α/(2r), en lugar del estándar α/r de la biblioteca PEFT. Esto sugiere una implementación personalizada para el proyecto de investigación. Los snapshots de LoRA se cargan exclusivamente mediante la función `geode.zoo.load_model` del repositorio de código, lo que implica que no son compatibles directamente con cargadores estándar de Hugging Face.

No se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La estructura de directorios indica que se guardan registros de normas de gradientes por paso (`gradstats.jsonl`) y predicciones secuenciales (`prequential.jsonl`), lo que apunta a un análisis mecanicista detallado del proceso de entrenamiento.

## Capacidades

- No es un modelo de generación de texto ni de razonamiento; es un conjunto de pesos y artefactos para análisis.
- Permite la inspección de snapshots de LoRA en diferentes etapas de entrenamiento (directorio `snapshots/step_<k>/`).
- Permite la inspección de snapshots de fine-tuning completo (directorio `sft_snapshots/step_<k>/`).
- Incluye volcados de activaciones (`activations/<run_id>/`) para análisis de activaciones neuronales.
- Incluye registros de normas de gradientes y predicciones secuenciales para análisis de dinámicas de entrenamiento.
- Permite reproducir análisis de interpretabilidad mecanicista mediante los scripts del repositorio de código asociado.
- No incluye capacidades de tool calling, agentes ni soporte multilingüe.

## Casos de uso

- Investigación en interpretabilidad mecanicista: el repositorio permite analizar cómo cambian las representaciones internas durante el entrenamiento, comparando snapshots de LoRA en distintas etapas para entender qué patrones se elicitación o se enseñan.
- Estudio de la relación entre fine-tuning y elicitación: los datos de `logs/` y `snapshots/` facilitan la comparación entre lo que el modelo aprende por entrenamiento completo frente a lo que se induce mediante adaptadores LoRA.
- Reproducción de experimentos de análisis de gradientes: los registros `gradstats.jsonl` permiten estudiar la evolución de las normas de gradiente y su relación con el comportamiento final del modelo.
- Desarrollo de métodos de carga de LoRA personalizados: la implementación de escalado α/(2r) en `geode.zoo.load_model` puede servir de referencia para investigaciones sobre variantes de LoRA.
- Verificación de reproducibilidad: los manifiestos (`manifest.json`) y los pesos duplicados permiten reproducir los experimentos del proyecto MARS V.
- Construcción de conjuntos de datos para análisis de activaciones: los volcados en `activations/<run_id>/` pueden usarse para entrenar modelos de interpretación o para visualizar representaciones internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene métricas de rendimiento del modelo subyacente, ni comparaciones con otros modelos.

## Requisitos de hardware

- El repositorio completo ocupa 42 GB, por lo que se requiere espacio de almacenamiento suficiente para su descarga y procesamiento.
- Los snapshots de LoRA son de aproximadamente 48 MB cada uno, lo que permite analizarlos con recursos moderados de memoria.
- No se especifican requisitos de VRAM, GPU recomendadas ni latencia de inferencia, ya que no se trata de un modelo de inferencia directa.
- Para el análisis de activaciones y gradientes se recomienda una máquina con memoria RAM suficiente para cargar los archivos parquet/csv (tamaño no especificado).
- El código de análisis se ejecuta en Python (según el repositorio de GitHub) y puede requerir una GPU para cargar los checkpoints completos si se desea evaluar el modelo final.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de lenguaje comparable con otras arquitecturas; es un conjunto de datos de análisis para un proyecto de investigación específico.

## Limitaciones y advertencias

- No es un modelo listo para uso en producción: carece de interfaz de inferencia, y los pesos solo pueden cargarse mediante la biblioteca `geode.zoo` del proyecto.
- La licencia no está especificada, por lo que no se puede garantizar la legalidad de su uso comercial o académico sin permiso del autor.
- No se proporcionan datos sobre sesgos, alucinación o limitaciones de contexto, ya que el modelo subyacente no está documentado.
- El escalado LoRA α/(2r) es una desviación del estándar, por lo que los adaptadores no son compatibles con herramientas que esperan el escalado α/r.
- El repositorio está orientado a un público investigador con conocimiento de interpretabilidad y entrenamiento de modelos; no tiene utilidad directa para desarrolladores de aplicaciones.
- No se ha verificado la integridad o calidad de los datos contenidos; el autor no ha publicado métricas de validación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mhieuuu/geode-internals
- Repositorio complementario (geode-store): https://huggingface.co/mhieuuu/geode-store
- Código del proyecto: https://github.com/Hieuuum/elicit-vs-teach
- Perfil del autor: https://huggingface.co/mhieuuu
