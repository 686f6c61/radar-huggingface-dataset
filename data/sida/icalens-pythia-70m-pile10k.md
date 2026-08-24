# sida/icalens-pythia-70m-pile10k

## Resumen

`sida/icalens-pythia-70m-pile10k` no es un modelo de lenguaje, sino un **artefacto de interpretabilidad** denominado *ICA Lens*, desarrollado por Sida Liu y Feijiang Han. Este artefacto ajusta una transformación de Análisis de Componentes Independientes (ICA) sobre las activaciones internas del modelo [EleutherAI/pythia-70m](https://huggingface.co/EleutherAI/pythia-70m), concretamente sobre el estado residual posterior a cada bloque (`resid_post`). Su propósito es mapear las activaciones de la corriente residual a un conjunto de componentes estadísticamente independientes, junto con su contribución energética por token.

La relevancia de esta herramienta reside en que ofrece una alternativa más eficiente computacionalmente que los autoencoders dispersos (SAE) para la interpretación de modelos de lenguaje. En lugar de entrenar un diccionario sobredimensionado, el ICA Lens ajusta una rotación ortogonal mediante FastICA, lo que reduce drásticamente el coste de cómputo. El artefacto está diseñado para las capas 0 a 5 del modelo Pythia-70m, con 512 componentes por capa, y se distribuye bajo la librería `icalens`.

Aunque no es un modelo que genere texto, su utilidad práctica es alta para investigadores que necesitan analizar los mecanismos internos de un modelo de lenguaje de tamaño pequeño, como paso previo a la interpretación de modelos más grandes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ICA Lens: transformación ortogonal por capa (FastICA sobre activaciones `resid_post`) |
| Parametros totales | 6 matrices de rotación de 512x512 (una por capa, capas 0-5) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (el artefacto analiza activaciones; el fitting se realizó con contexto de 1024 tokens) |
| Tipos de cuantizacion | No aplica (no es un modelo cuantizable) |
| Idiomas soportados | No aplica (no genera texto; el modelo analizado Pythia-70m es multilingüe) |
| Licencia | No disponible |
| Formato de pesos | Formato específico de la librería `icalens` (no especificado) |

## Arquitectura y entrenamiento

El ICA Lens es un artefacto de análisis, no una red neuronal. Consiste en una serie de transformaciones lineales ortogonales, una por capa (capas 0 a 5), aprendidas mediante **FastICA** (Independent Component Analysis) sobre las activaciones del bloque residual (`resid_post`) del modelo Pythia-70m. El proceso de ajuste se realizó con un millón de tokens del dataset [NeelNanda/pile-10k](https://huggingface.co/datasets/NeelNanda/pile-10k), en su split `train`, con una semilla de muestreo fijada en 0. Cada capa se ajustó con 50 iteraciones de FastICA, produciendo 512 componentes independientes por capa.

El procedimiento incluye un preprocesamiento de centrado y blanqueo de las activaciones, seguido de la rotación ICA. La puntuación de cada componente para un token se define como el valor firmado (positivo o negativo) tras esa transformación. La energía de cada componente se calcula como `score² / sum(all component scores²)`, es decir, la fracción de la varianza explicada por ese componente en el token dado. El artefacto no aplica escalado posterior a la ICA en la versión 0.2 del ajuste.

El fitting se realizó sobre 5.317.136 tokens candidatos, de los cuales se seleccionaron 1.000.000 para el ajuste. La documentación incluye un registro de procedencia con el hash SHA256 de los datos de activación y la política de enmarcado de documentos (se usa un token `<|endoftext|>` como separador, siguiendo la práctica de entrenamiento de Pythia).

## Capacidades

- Transforma activaciones del bloque `resid_post` de Pythia-70m en puntuaciones de componentes independientes por capa (capas 0-5).
- Calcula la energía relativa de cada componente por token (`score² / sum(score²)`), lo que permite identificar qué componentes dominan en una predicción.
- Permite análisis end-to-end de texto con el método `lens.analyze(texto, layer=0)`, que devuelve tokens, puntuaciones firmadas y energía por token.
- Permite transformar activaciones capturadas externamente mediante `lens.transform(activations, layer=0)`, siempre que se usen las mismas condiciones de modelo, revisión y sitio de activación.
- Es una herramienta de interpretabilidad, no un modelo generativo: no produce texto, código ni respuestas.

## Casos de uso

- **Análisis de circuitos internos en Pythia-70m**: los investigadores pueden usar el lens para identificar qué componentes independientes se activan ante ciertos tipos de tokens o contextos, facilitando la localización de funciones como la sintaxis o la semántica.
- **Auditoría de sesgos en modelos de lenguaje**: al examinar la energía de los componentes en textos que contienen sesgos sociales, se puede observar si ciertos componentes se activan de forma desproporcionada, ayudando a identificar dónde se codifican estos sesgos.
- **Estudio de la formación de conceptos a lo largo de las capas**: comparando las puntuaciones entre capas 0 y 5, se puede rastrear cómo se transforman las representaciones internas desde la entrada hasta la salida, lo que es útil para entender la jerarquía de características.
- **Optimización de técnicas de interpretabilidad**: como alternativa a los SAEs, el ICA Lens sirve para validar metodologías de análisis de modelos sin el coste de entrenar diccionarios dispersos, siendo útil en entornos de investigación con recursos limitados.
- **Docencia y divulgación de interpretabilidad**: por su ligereza (6 matrices 512x512) y su facilidad de uso con la librería `icalens`, es adecuado para talleres y cursos donde se quiera mostrar cómo se analizan las activaciones de un modelo real.
- **Análisis de robustez y comportamiento**: permite comprobar si el modelo subyacente presenta componentes que responden de forma inesperada a inputs adversarios, contribuyendo a la evaluación de seguridad antes de su despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artefacto no es un modelo generativo y no participa en tareas como MMLU, HumanEval o GSM8K. El paper asociado ([arXiv:2606.11722](https://arxiv.org/abs/2606.11722)) podría contener comparaciones de eficiencia frente a SAEs, pero no se dispone de los datos numéricos en la documentación accesible.

## Requisitos de hardware

- **Carga del artefacto**: el ICA Lens pesa aproximadamente 6 matrices de 512x512 (unos 6 MB en float32), por lo que puede cargarse en CPU sin problema.
- **Obtención de activaciones**: para usar el lens con el modelo Pythia-70m, se necesita ejecutar el modelo subyacente. Pythia-70m tiene ~70M parámetros, por lo que requiere una GPU con al menos 2 GB de VRAM (por ejemplo, una RTX 3060 o superior) o incluso CPU si se usa con batch pequeño.
- **Despliegue**: se usa como librería Python (`icalens`). No es compatible con vLLM, llama.cpp o TGI porque no es un modelo de generación, sino una herramienta de análisis.
- **Latencia y throughput**: no disponible. El análisis de un texto corto (p.ej. una frase) requiere una pasada por el Pythia-70m (para obtener activaciones) y una multiplicación por la matriz de rotación de la capa seleccionada. En CPU, el proceso es del orden de segundos para un token.

## Comparativa con modelos similares

| Método | Tipo | Coste de ajuste | Interpretación | Licencia |
|---|---|---|---|---|
| **ICA Lens (este artefacto)** | Transformación ortogonal por ICA | Muy bajo (1M tokens, 50 iteraciones FastICA por capa) | Componentes independientes con energía por token | No disponible |
| **Sparse Autoencoder (SAE)** | Diccionario sobredimensionado + sparsity | Alto (entrenamiento de red neuronal) | Características dispersas, pero menos interpretables | Depende de la implementación (p.ej. OpenAI) |
| **Logit Lens** | Proyección de activaciones a vocabulario | Nulo (sin ajuste) | Muestra la predicción en cada capa, pero no descompone en componentes | No aplica (método) |

El ICA Lens se diferencia de los SAEs en que no requiere entrenar un diccionario disperso, sino que ajusta una rotación ortogonal, lo que reduce el coste computacional de forma significativa. Frente al Logit Lens, ofrece una descomposición más detallada de la activación en componentes independientes, en lugar de solo una proyección al vocabulario.

## Limitaciones y advertencias

- **No es un modelo generativo**: no se puede usar para generar texto, código o completar prompts; es exclusivamente una herramienta de análisis.
- **Componentes específicos**: los componentes ICA son específicos de la capa y del artefacto ajustado. No se pueden reutilizar para otro modelo o para el mismo modelo con otra revisión.
- **Puntuaciones firmadas**: las puntuaciones ICA son números con signo (positivos/negativos) y no son probabilidades. No representan la probabilidad de un concepto, sino la magnitud y dirección de la activación.
- **Dependencia del modelo subyacente**: el artefacto está ligado a la revisión `a39f36b100fe8a5377810d56c3f4789b9c53ac42` de Pythia-70m. Si se usa el modelo con otra revisión, los resultados no son válidos.
- **Licencia no disponible**: no se indica la licencia del artefacto. Para uso comercial o redistribución, se debe contactar con el autor.
- **Alcance del análisis**: solo cubre las capas 0-5 de Pythia-70m; no es aplicable a otras capas ni a otros modelos de mayor tamaño.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/sida/icalens-pythia-70m-pile10k)
- [Modelo analizado: EleutherAI/pythia-70m](https://huggingface.co/EleutherAI/pythia-70m)
- [Repositorio de la librería `icalens` en GitHub](https://github.com/liusida/icalens)
- [Documentación de ICA Lens](https://icalens.readthedocs.io/)
- [Paper: ICA Lens: Interpreting Language Models Without Training Another Dictionary](https://arxiv.org/abs/2606.11722)
- [Dataset de fitting: NeelNanda/pile-10k](https://huggingface.co/datasets/NeelNanda/pile-10k)
- [Artifacts de Pythia de EleutherAI](https://www.eleuther.ai/artifacts/pythia)
