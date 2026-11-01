# isilicon/mango-glm53flash-orca-tokenizer-20261029

## Resumen

Este repositorio no contiene un modelo de lenguaje completo, sino un componente auxiliar: el tokenizador fijado (tokenizer.json y tokenizer_config.json) extraído del modelo GLM-5.3-Flash-Uncensored-FP8 publicado por OrcaRouter. Lo mantiene el usuario isilicon bajo el paraguas de su proyecto Mango, una colección de espejos de preservación y evaluaciones de configuraciones concretas de modelos. El artefacto está pensado para acompañar a dos paquetes cuantizados concretos de GLM 5.3 Flash (IQ2_XXS de BoldingBuilds/OrcaRouter y Q2_K directo de OrcaRouter), garantizando que la tokenización empleada en tiempo de ejecución coincide byte a byte con la del modelo de referencia.

La relevancia de este tipo de repositorio es práctica: cuando se publican cuantizaciones de un modelo base, es habitual que los tokenizadores se copien, se modifiquen o se regeneren, lo que puede introducir discrepancias sutiles en la tokenización y, por tanto, en el comportamiento del modelo. Este espejo fija una revisión concreta del tokenizador original (revisión de origen `993122712d2606d8a49f0b350d35b3c6672861c8`) y documenta su integridad mediante hashes SHA-256 y Git blob, de modo que quien despliegue las cuantizaciones mencionadas pueda verificar que usa exactamente la misma configuración de tokenización que el autor del espejo.

No se trata, por tanto, de un modelo con pesos, arquitectura ni capacidades de generación propias: el propio autor indica explícitamente que el repositorio no contiene pesos del modelo principal y que no puede generar respuestas por sí mismo. Su tamaño es de 0,02 GB (unos 20 MB), correspondiente a los dos ficheros JSON del tokenizador. La información disponible sobre el modelo base (GLM-5.3-Flash-Uncensored-FP8) es muy limitada en esta ficha, por lo que muchos de los parámetros técnicos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio solo contiene tokenizador; el modelo base es GLM-5.3-Flash-Uncensored-FP8, arquitectura no especificada en la informacion disponible) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (debe estabelecerse en el runtime consumidor) |
| Tipos de cuantizacion | No aplica al tokenizador; los pesos consumidores asociados son IQ2_XXS (BoldingBuilds/OrcaRouter) y Q2_K (OrcaRouter directo) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | No aplica (tokenizer.json y tokenizer_config.json); el modelo base se distribuye en FP8 |

## Arquitectura y entrenamiento

Este repositorio no define arquitectura de red neuronal ni proceso de entrenamiento: es un artefacto de tokenización. Contiene dos ficheros: `tokenizer.json` (0,02022 GB, SHA-256 con prefijo `19e773648cb4e65d…`) y `tokenizer_config.json` (tamaño despreciable, Git blob `e375fa0a4e16660c…`). Ambos se han copiado sin modificación desde la revisión `993122712d2606d8a49f0b350d35b3c6672861c8` del repositorio de origen de OrcaRouter, y su integridad se documenta en `SOURCE_MANIFEST.json`.

El modelo base declarado es `orcarouter/GLM-5.3-Flash-Uncensored-FP8`, un fine-tune sin censura de la familia GLM en formato FP8. La model card del espejo no aporta detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La innovación técnica del repositorio es de tipo operativo, no algorítmico: fijar una revisión exacta del tokenizador y verificar sus bytes mediante hashes para que las cuantizaciones IQ2_XXS y Q2_K asociadas se ejecuten con la tokenización prevista por el autor original.

## Capacidades

- El repositorio no tiene capacidades de generación de texto, razonamiento, código ni matemáticas por sí mismo: es un componente de tokenización.
- Su función es proporcionar la tokenización correcta al runtime que cargue los pesos de GLM 5.3 Flash en las cuantizaciones IQ2_XXS o Q2_K referenciadas.
- Soporte de tool calling, function calling y agentes: depende exclusivamente del modelo base y del runtime consumidor, no de este artefacto.
- Capacidades multilingües: los metadatos declaran inglés y chino, coherentes con el tokenizador del modelo base; no se detallan más idiomas.
- No incluye modo thinking, visión ni audio de forma inherente; cualquier capacidad de ese tipo pertenecería al modelo base, sobre el que esta ficha no dispone de información.

## Casos de uso

- Despliegue verificado de cuantizaciones IQ2_XXS: usar este tokenizador junto con los pesos de GLM 5.3 Flash IQ2_XXS de BoldingBuilds/OrcaRouter para garantizar que la tokenización coincide con la revisión de origen y evitar desviaciones en la inferencia.
- Despliegue verificado de cuantizaciones Q2_K: emplear el mismo tokenizador con el paquete Q2_K directo de OrcaRouter, manteniendo la coherencia entre pesos y tokenizador en entornos de baja VRAM.
- Reproducibilidad de evaluaciones: al fijar la revisión del tokenizador mediante hashes, permite reproducir exactamente las condiciones de tokenización de los benchmarks publicados por Mango para las configuraciones asociadas (79,11 y 75,64 puntos ponderados respectivamente).
- Auditoría de integridad en pipelines CI/CD: los ficheros `SOURCE_MANIFEST.json`, `MIRROR_STATUS.json` y `MODEL_CARD_STATUS.json` permiten verificar en un pipeline que los bytes del tokenizador no han cambiado antes de empaquetar una imagen de inferencia.
- Archivado a largo plazo: sirve como espejo de preservación si el repositorio original de OrcaRouter cambia de revisión o desaparece, manteniendo disponible la configuración exacta de tokenización.
- Integración en herramientas de análisis: cargar `tokenizer.json` con la librería `tokenizers` para calcular recuentos de tokens, longitudes de contexto efectivas o preprocesar corpus en inglés y chino antes de pasarlos al modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este artefacto de tokenización en la información disponible. El autor indica explícitamente que no existe una puntuación de calidad Mango independiente para estos ficheros exactos, ya que se trata de un componente auxiliar. Los resultados que sí se publican corresponden a configuraciones distintas (pesos completos con cuantización), no a este tokenizador:

| Configuracion medida (no este artefacto) | Puntuacion ponderada | Minimo de carga de trabajo |
|---|---|---|
| GLM 5.3 Flash · IQ2_XXS · BoldingBuilds / OrcaRouter | 79,11 | 40,98 |
| GLM 5.3 Flash · Q2_K · directo OrcaRouter | 75,64 | 54,76 |

El autor advierte que un cambio de cuantización, linaje de modificación, draft, motor o tokenizador puede alterar el resultado, por lo que estas cifras no deben atribuirse al tokenizador aquí alojado.

## Requisitos de hardware

- VRAM para inferencia: no aplica al tokenizador; los requisitos dependen de los pesos consumidores (IQ2_XXS o Q2_K) y del runtime.
- Almacenamiento: 0,02 GB (unos 20 MB) para los dos ficheros JSON.
- GPU recomendadas: no disponibles para este artefacto; vienen determinadas por el modelo base y la cuantización elegida.
- Compatibilidad con GPU de consumo: no evaluable desde este repositorio; debe consultarse en las fichas de los paquetes IQ2_XXS y Q2_K asociados.
- Opciones de despliegue: cualquier runtime que acepte `tokenizer.json` en formato Hugging Face Tokenizers, incluido el ejemplo oficial con `Tokenizer.from_file`. Para la inferencia completa se requiere el motor que cargue los pesos del modelo base (no especificado en la información disponible).
- Latencia y throughput: no disponibles; no son atribuibles al tokenizador de forma aislada.

## Comparativa con modelos similares

No procede una comparativa de modelos en sentido estricto, ya que este repositorio no es un modelo. Se compara a continuación con los artefactos directamente relacionados según la información disponible:

| Artefacto | Tipo | Tamano | Licencia | Relacion |
|---|---|---|---|---|
| isilicon/mango-glm53flash-orca-tokenizer-20261029 | Tokenizador (espejo) | 0,02 GB | MIT | Este repositorio |
| isilicon/mango-glm53flash-bolding-iq2xxs-20261029 | Pesos cuantizados IQ2_XXS | No disponible | No disponible en esta ficha | Consumidor compatible |
| isilicon/mango-glm53flash-orca-q2k-20261029 | Pesos cuantizados Q2_K | No disponible | No disponible en esta ficha | Consumidor compatible |
| orcarouter/GLM-5.3-Flash-Uncensored-FP8 | Modelo base en FP8 | No disponible | No disponible en esta ficha | Origen del tokenizador |

## Limitaciones y advertencias

- No es un modelo generativo: no contiene pesos y no puede producir respuestas; usarlo como si fuera un modelo completo dará error o resultados vacíos.
- Dependencia estricta de revisión: debe emparejarse con la revisión exacta de los pesos (`5a600e5b7353ac17522267ca3e76057bfe21a394` para este espejo) y con las cuantizaciones IQ2_XXS o Q2_K indicadas; otra combinación puede degradar la calidad.
- Idiomas limitados según metadatos: inglés y chino; no hay evidencia de soporte para otros idiomas en la información disponible.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero el autor remite a la procedencia original; conviene verificar las condiciones del modelo base y de los pesos cuantizados antes de producción.
- Sesgos y alucinación: no evaluables a nivel de tokenizador; cualquier sesgo o riesgo de alucinación proviene del modelo base y del fine-tune sin censura, sobre el que esta ficha no aporta datos.
- Ausencia de benchmarks propios: no existe puntuación de calidad independiente para estos ficheros, por lo que no debe citarse este repositorio como evidencia de rendimiento del modelo.
- Documentación en evolución: el autor advierte que la documentación puede avanzar en `main` sin cambiar el snapshot de pesos verificado; conviene fijar la revisión al descargar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/isilicon/mango-glm53flash-orca-tokenizer-20261029
- Colección Mango de modelos probados y espejos: https://huggingface.co/collections/isilicon/mango-tested-models-and-preservation-mirrors-6ae3b73994c895ab42e360d2
- Resultados de evaluación Mango: https://huggingface.co/datasets/isilicon/mango-evaluation-results
- Paquete IQ2_XXS asociado: https://huggingface.co/isilicon/mango-glm53flash-bolding-iq2xxs-20261029
- Paquete Q2_K asociado: https://huggingface.co/isilicon/mango-glm53flash-orca-q2k-20261029
- Modelo base: https://huggingface.co/orcarouter/GLM-5.3-Flash-Uncensored-FP8
- Fichero tokenizer.json: https://huggingface.co/isilicon/mango-glm53flash-orca-tokenizer-20261029/resolve/main/tokenizer.json
- Fichero tokenizer_config.json: https://huggingface.co/isilicon/mango-glm53flash-orca-tokenizer-20261029/resolve/main/tokenizer_config.json
- Comunidad Infinity en Discord: https://discord.gg/5n5YDbQCMy
