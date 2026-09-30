# mdagosta/waldito-python-basics-v1-r0005-u0-mdagosta-b

## Resumen

El modelo `mdagosta/waldito-python-basics-v1-r0005-u0-mdagosta-b` es un ajuste fino de 9.541.632 parámetros (aproximadamente 9,5 millones) publicado por el usuario mdagosta en Hugging Face. Según la model card del autor, se trata de una exportación del proyecto OpenWALDO que emplea la arquitectura estándar de modelo causal de lenguaje Llama de Transformers, junto con un tokenizador de bytes propio denominado schema-1 que requiere cargarse con `trust_remote_code=True`. El nombre del repositorio sugiere que el ajuste se ha orientado a conceptos básicos de Python, aunque este extremo no se confirma de forma explícita en la documentación disponible.

Se trata de un modelo extremadamente pequeño, tres órdenes de magnitud por debajo de los modelos habituales de 1 a 8 mil millones de parámetros. Su relevancia no reside en el rendimiento bruto, sino en su carácter de artefacto de trazabilidad: el paquete incluye `BOM.json`, que inventaría cada fichero de la release, y `EU-BOM.json`, que contiene el mapeo de divulgación de contenido de entrenamiento exigido por el reglamento europeo de IA (GPAI) para modelos de propósito general. Esto lo convierte en un caso de estudio interesante sobre empaquetado reproducible y cumplimiento normativo más que en una herramienta de producción.

El repositorio acumulaba 0 descargas y 0 likes en el momento de la consulta, y no declara licencia ni idiomas soportados. Existen versiones previas de la misma serie, como `waldito-python-basics-v1-r0003-u0-mdagosta-b`, lo que apunta a un flujo de trabajo iterativo de entrenamiento y publicación por revisiones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Llama causal language model (Transformer decoder-only, denso) |
| Parámetros totales | 9.541.632 (dato real de safetensors) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo publica safetensors sin variantes cuantizadas declaradas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tokenizador | OpenWALDO schema-1 (tokenizador de bytes, requiere `trust_remote_code=True`) |
| Librería | transformers |
| Pipeline | text-generation |
| Tamaño del repositorio | 0,0 GB (según Hugging Face) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-30 |
| Última actualización | 2026-09-30 |

## Arquitectura y entrenamiento

La model card indica que el paquete utiliza la arquitectura estándar de modelo causal de lenguaje Llama de la librería Transformers. Esto implica un Transformer decoder-only denso con normalización RMSNorm, atención con RoPE y capas feed-forward con activación SwiGLU, aunque la ficha del autor no detalla el número de capas, dimensiones ocultas, número de cabezas de atención ni la ventana de contexto efectiva. Con 9,5 millones de parámetros totales, el modelo es lo bastante pequeño como para que su entrenamiento sea viable en CPU o en una única GPU de gama media.

La innovación más destacable no está en el cuerpo del modelo, sino en el tokenizador: OpenWALDO emplea un esquema propio de tokenización por bytes denominado schema-1, que exige ejecutar código remoto al cargarlo. Este diseño evita el vocabulario BPE cerrado y garantiza cobertura total de cualquier flujo de bytes, algo relevante cuando el objetivo es procesar código fuente sin caracteres fuera de vocabulario. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si se aplicaron técnicas de alineación como RLHF o DPO, ni sobre el proceso de ajuste fino a partir de un modelo base.

El repositorio incorpora además dos artefactos de gobernanza: `BOM.json`, que inventaría cada fichero de la release, y `EU-BOM.json`, con el mapeo de divulgación de contenido de entrenamiento conforme al reglamento europeo de IA para modelos de propósito general. Este enfoque de empaquetado con lista de materiales es poco habitual en Hugging Face y constituye el principal rasgo diferencial del proyecto.

## Capacidades

- Generación de texto causal mediante el pipeline `text-generation` de Transformers.
- Conversación multi-turno, según la etiqueta `conversational` del repositorio.
- Generación y completado de fragmentos de código Python, inferido del nombre del repositorio y del ajuste `python-basics-v1`; no confirmado explícitamente en la model card.
- Tokenización por bytes con cobertura completa del rango de bytes mediante el esquema schema-1.
- Compatibilidad declarada con `text-generation-inference` y con endpoints compatibles.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidades multilingües: no disponibles; no se declara ningún idioma en la ficha.
- Trazabilidad de la release mediante `BOM.json` y divulgación de contenido de entrenamiento mediante `EU-BOM.json`.

## Casos de uso

- Material didáctico para introducción a Python: dado su tamaño y su supuesta especialización en conceptos básicos, puede emplearse como autocompletado de ejercicios sencillos en un entorno controlado, donde el estudiante ve sugerencias de una o dos líneas. Su huella de memoria permite ejecutarlo en el mismo portátil del alumno sin GPU dedicada.
- Autocompletado ligero en editores y plugins de IDE: con menos de 40 MB en fp32, el modelo cabe en memoria junto al propio editor y puede ofrecer sugerencias de baja latencia sin conexión a servicios externos, útil en entornos con restricciones de red o de privacidad.
- Inferencia en dispositivos embebidos y edge: al ocupar del orden de decenas de megabytes, es viable desplegarlo en una Raspberry Pi, en un módem o en un microcontrolador con Linux para tareas de generación muy acotada, siempre que se acepte una calidad limitada.
- Validación de pipelines de exportación y cumplimiento normativo: el paquete sirve como conejillo de indias para probar cadenas de carga con `trust_remote_code=True`, verificar la integridad de `BOM.json` y ensayar el mapeo de divulgación exigido por el reglamento europeo de IA antes de aplicarlo a modelos de mayor tamaño.
- Investigación sobre tokenizadores de bytes: permite estudiar el comportamiento de un vocabulario schema-1 frente a BPE convencional en términos de longitud de secuencia, cobertura del byte y estabilidad al tokenizar código fuente con indentación y símbolos poco frecuentes.
- Reproducción de experimentos de ajuste fino a pequeña escala: al existir revisiones previas de la misma serie (r0003 y r0005), el repositorio es útil como referencia para comparar el efecto de distintas iteraciones de entrenamiento sobre un mismo conjunto de datos.
- Pruebas de infraestructura de servicio: las etiquetas `text-generation-inference` y `endpoints_compatible` permiten usar el modelo como carga sintética para validar el aprovisionamiento, el enrutado y el escalado de un clúster de inferencia sin consumir GPU caras.
- Chat conversacional de alcance limitado: la etiqueta `conversational` sugiere diálogos multi-turno, aunque sin datos de contexto ni evaluación publicada no es recomendable usarlo en atención al cliente real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y el repositorio no referencia ningún informe técnico o tabla comparativa. Tampoco se han encontrado resultados en la búsqueda web realizada.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de los 9.541.632 parámetros: en fp32, aproximadamente 38 MB; en fp16 o bf16, aproximadamente 19 MB; en int8, aproximadamente 10 MB; en int4, aproximadamente 5 MB. Son estimaciones aritméticas, no datos publicados por el autor.
- El coste dominante en la práctica no son los pesos, sino el contexto de ejecución: el runtime de PyTorch con CUDA puede reservar entre varios cientos de megabytes y algo más de un gigabyte solo por el contexto del dispositivo. En CPU, el consumo dependerá de la build de PyTorch.
- GPU recomendadas: cualquier GPU con soporte CUDA, incluida una NVIDIA T4, RTX 3060 o cualquier modelo superior. Una A100 o H100 resultan enormemente sobredimensionadas para este tamaño.
- Cabe holgadamente en GPU de consumo: sí, en cualquier RTX, GTX con CUDA o incluso en gráficas integradas compatibles. También es viable la inferencia en CPU.
- Opciones de despliegue: Transformers con `trust_remote_code=True` para cargar el tokenizador schema-1; text-generation-inference, según la etiqueta del repositorio. No se declaran ficheros GGUF, por lo que llama.cpp, Ollama o LM Studio no funcionarían sin una conversión previa del tokenizador, que es propietario y no estándar.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| waldito-python-basics-v1-r0005-u0 | 9,5 M | no disponible | no disponible | safetensors en HF | no disponible |
| SmolLM-135M | 135 M | 2.048 tokens (versión base) | Apache-2.0 | safetensors, GGUF | sí, publicado por el autor |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache-2.0 | safetensors, GGUF | sí, publicado por el autor |
| TinyLlama-1.1B | 1,1 B | 2.048 tokens | Apache-2.0 | safetensors, GGUF | sí, publicado por el autor |

La comparación de rendimiento con estas alternativas no es posible porque el modelo analizado no publica ninguna evaluación. En la práctica, cualquiera de los tres modelos de referencia, pese a ser entre 14 y 115 veces más grande, sigue cabiendo en una GPU de consumo, por lo que la ventaja del modelo de 9,5 M se limita a escenarios de memoria extremadamente restringida o a usos de investigación sobre empaquetado y trazabilidad. No se han identificado otros ajustes finos comparables de menos de 10 millones de parámetros con propósito declarado de enseñanza de Python.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evidencia publicada sobre la calidad de las respuestas, por lo que no se debe asumir ninguna capacidad concreta sin evaluación previa.
- Sesgos conocidos: no disponibles. No hay documentación sobre la composición del conjunto de datos de entrenamiento ni sobre análisis de sesgo.
- Riesgo de alucinación: alto en términos relativos, dado el reducido número de parámetros. Un modelo de 9,5 M tiene una capacidad de memorización y de razonamiento muy limitada y generará con frecuencia código sintácticamente plausible pero incorrecto.
- Limitaciones de contexto: la longitud de contexto no está especificada. Es probable que sea corta, pero no puede confirmarse con la información disponible.
- Limitaciones de idioma: no se declara ningún idioma soportado. El tokenizador de bytes permite representar cualquier idioma, pero eso no implica competencia lingüística.
- Licencia no disponible: al no declararse una licencia, no existe autorización explícita de uso comercial. En ausencia de licencia, la postura por defecto es la reserva de derechos, por lo que se desaconseja su uso en producción sin contactar con el autor.
- Dependencia de código remoto: cargar el tokenizador exige `trust_remote_code=True`, lo que implica ejecutar código del repositorio. Conviene auditar los ficheros antes de hacerlo en entornos sensibles.
- Tokenizador propietario: al no ser un tokenizador estándar de Hugging Face, reduce la portabilidad a otros runtimes y complica la conversión a formatos como GGUF.
- Madurez del proyecto: 0 descargas y 0 likes, con la última actualización el mismo día de su creación, lo que indica que no ha pasado por ningún proceso de validación por parte de la comunidad.
- Uso responsable: no debe emplearse en atención al cliente, generación de código en producción ni ningún escenario donde un error tenga consecuencias, sin un filtrado y una validación posteriores.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0005-u0-mdagosta-b
- Revisión previa de la misma serie: https://huggingface.co/mdagosta/waldito-python-basics-v1-r0003-u0-mdagosta-b
- Hugging Face (plataforma): https://huggingface.co/
- No se han encontrado en la búsqueda web papers, blogs técnicos, repositorios de código ni demos asociados a este modelo.
