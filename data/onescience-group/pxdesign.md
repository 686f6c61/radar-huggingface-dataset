# OneScience-Group/PXDesign

## Resumen

PXDesign es una suite open-source del equipo de ByteDance para el diseño de novo de binders de proteínas. A partir de una estructura de proteína diana, el sistema genera candidatos a binders y los filtra mediante predicción de estructura y evaluación de confianza. La suite integra un modelo de difusión (PXDesign-d), ProteinMPNN para el diseño de secuencias, AF2-IG para la predicción de estructuras y Protenix para la evaluación adicional en modo extendido. El repositorio en HuggingFace, publicado por OneScience-Group, tiene un tamaño de 3.8 GB y se distribuye bajo licencia Apache 2.0. Su relevancia radica en abordar el diseño de binders de proteínas de forma modular y escalable, con tres modos de uso que cubren desde validaciones rápidas hasta cribados completos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline modular: modelo de difusión PXDesign-d, ProteinMPNN, AF2-IG y Protenix |
| Parámetros totales | no disponible |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, zh (documentación e interfaz) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

PXDesign no es un modelo monolítico, sino una suite compuesta por varios componentes. El núcleo generativo es PXDesign-d, un modelo de difusión que, condicionado a la estructura de la proteína diana, a los hotspots y a la longitud deseada del binder, genera backbones de proteínas candidatas. A continuación, ProteinMPNN asigna secuencias de aminoácidos a esos backbones. Después, AF2-IG predice la estructura del complejo binder-diana y aplica filtros de calidad. En el modo extendido, Protenix realiza una predicción y evaluación adicionales. El flujo completo produce un summary.csv con las métricas de AF2-IG, Protenix y el estado de cada filtro. No se han publicado detalles sobre los datos de entrenamiento ni el número de tokens o muestras utilizados en la información disponible. La suite está documentada en un preprint de bioRxiv (2025.08.15.670647).

## Capacidades

- Generación de novo de binders de proteínas a partir de una estructura diana.
- Diseño guiado por interfaz mediante hotspots, que especifican residuos de la diana a los que el binder debe unirse preferentemente.
- Diseño de secuencias de aminoácidos para backbones generados con ProteinMPNN.
- Predicción de estructuras de complejos binder-diana con AF2-IG.
- Evaluación adicional de confianza con Protenix en modo extendido.
- Tres modos de ejecución: generation-only, preview y extended, que permiten desde una generación rápida hasta un cribado en varias etapas.
- Generación de un resumen estructurado (summary.csv) con métricas y filtros aplicados.
- No es un modelo de lenguaje: no soporta tool calling ni razonamiento multi-paso en el sentido de los LLM.

## Casos de uso

- Diseño de binders para dianas terapéuticas: se introduce la estructura de una proteína diana y el modelo genera candidatos que se unen a ella, lo que resulta útil en el descubrimiento de fármacos.
- Ingeniería de biosensores: se pueden diseñar binders que reconozcan moléculas específicas, empleando hotspots para dirigir la unión.
- Investigación de interacciones proteína-proteína: el diseño de binders permite estudiar interfaces y probar hipótesis sobre reconocimiento molecular.
- Validación rápida de pipelines de diseño: con el modo preview se puede comprobar si los parámetros de diseño son razonables antes de lanzar un cribado completo.
- Cribado de alta calidad de candidatos: el modo extended aplica AF2-IG y Protenix para filtrar estructuras con baja confianza, reduciendo el número de candidatos a validar experimentalmente.
- Investigación en generación de estructuras: ejecutar solo la etapa de generación con `pxdesign infer` para estudiar el espacio de backbones generados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Se recomienda una GPU o DCU para la etapa de generación de backbones con PXDesign-d; la inferencia completa requiere una cantidad sustancial de memoria de GPU.
- La generación y preparación de MSA se realiza principalmente en CPU; se puede precomputar con `prepare-msa`.
- Las etapas de ProteinMPNN, AF2-IG y Protenix dependen de frameworks de deep learning como PyTorch y JAX, y se recomienda GPU/DCU.
- Si los recursos de GPU son limitados, se puede preparar el MSA en CPU por separado y ejecutar después las etapas de generación y evaluación.
- No se especifican modelos concretos de GPU (A100, H100, etc.) ni valores de VRAM, latencia o throughput en la información disponible.
- Opciones de despliegue: instalación local mediante `pip install -e model` y el entorno OneCode de OneScience.

## Comparativa con modelos similares

No se dispone de información suficiente en los datos proporcionados para realizar una comparativa con modelos similares.

## Limitaciones y advertencias

- No se han documentado sesgos específicos en la información disponible.
- El diseño generativo puede producir estructuras que no sean viables experimentalmente; los filtros de AF2-IG y Protenix ayudan a reducir falsos positivos, pero la validación experimental sigue siendo necesaria.
- La calidad de los resultados depende de la calidad de las estructuras de entrada y de los MSA preparados.
- El pipeline completo requiere varias etapas y recursos computacionales considerables, lo que puede limitar su uso en entornos sin GPU/DCU.
- La licencia Apache 2.0 permite uso comercial, pero exige mantener el aviso de licencia y atribución.
- La documentación y la interfaz están disponibles en inglés y chino, lo que puede suponer una barrera para algunos usuarios.
- No es un modelo de lenguaje: no procesa texto arbitrario ni admite tareas de NLP.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/PXDesign
- Paper: https://www.biorxiv.org/content/10.1101/2025.08.15.670647v1
- OneScience-Group en HuggingFace: https://huggingface.co/OneScience-Group
- OneCode (entorno online): https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
