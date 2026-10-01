# hassanql/road-qwen36-35b-adapters

## Resumen

road-qwen36-35b-adapters es un repositorio de adaptadores LoRA para reconocimiento de texto manuscrito (handwritten text recognition), publicado por el usuario hassanql y construido sobre el modelo base Qwen/Qwen3.6-35B-A3B (commit fijado 995ad96eacd98c81ed38be0c5b274b04031597b0). Según la propia model card, se trata de un piloto "fit-only": la publicación consiste en una copia de seguridad del código de entrenamiento y evaluación, no en un paquete autónomo ni en un adaptador final validado. El autor indica explícitamente que no formula ninguna afirmación de precisión ni de victoria sobre otras aproximaciones, y que el adaptador final solo se subirá una vez completado el entrenamiento.

La relevancia de esta ficha es limitada y de carácter preliminar: el repositorio tiene cero descargas y cero likes, no declara idiomas soportados, no publica pipeline de inferencia y no incluye datos, particiones, manifiestos privados, predicciones ni registros. La receta descrita adapta únicamente capas de atención, de expertos compartidos y capas Linear visuales, manteniendo congelados los expertos enrutados y los routers, lo que sitúa el trabajo en la intersección entre ajuste eficiente de parámetros (PEFT) sobre arquitecturas de mezcla de expertos y reconocimiento óptico de manuscritos.

Se desconoce por completo el rendimiento real: no hay benchmarks, no hay métricas de validación publicadas y el código distribuido depende de ficheros locales del propietario (road_lib.py, bundle de validación congelado de nueve miembros y fichero de congelación), por lo que no es reproducible tal cual desde el repositorio público.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre el modelo base Qwen/Qwen3.6-35B-A3B; la arquitectura interna del modelo base no se detalla en la información disponible |
| Parámetros totales | no disponible (el repositorio distribuye adaptadores, no pesos completos) |
| Parámetros activos | no disponible (el identificador del modelo base sugiere una configuración de mezcla de expertos, pero la cifra no se confirma en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se mencionan pesos cuantizados en la model card) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (adaptadores y modelo base, según la model card) |
| Formato de pesos | no disponible explícitamente; se describe como adaptadores PEFT compatibles con peft 0.20, sin detallar extensión ni formato de fichero |
| Rango / alpha / dropout de LoRA | rank 16 / alpha 32 / dropout 0,05 |
| Capas adaptadas | atención, expertos compartidos (shared-expert) y capas Linear visuales |
| Capas congeladas | expertos enrutados (routed experts) y routers |
| Configuración de entrenamiento | 2 épocas, batch efectivo 16 (4x4), LR 1e-4, scheduler coseno con 3 % de warmup, semilla 42 |
| Entrada de imagen | RGB nativo, entre 65536 y 401408 píxeles |
| Modelo base (commit) | Qwen/Qwen3.6-35B-A3B, revisión 995ad96eacd98c81ed38be0c5b274b04031597b0 |
| Dependencias declaradas | torch 2.11, transformers 5.14.1, peft 0.20, accelerate 1.14 |
| Tarea declarada | handwritten-text-recognition (reconocimiento de texto manuscrito) |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo desde cero ni publica pesos completos: distribuye adaptadores LoRA de bajo rango (rank 16, alpha 32, dropout 0,05) sobre Qwen/Qwen3.6-35B-A3B. Según la model card, la adaptación se aplica a las capas de atención, a las capas de expertos compartidos y a las capas Linear de la torre visual, mientras que los expertos enrutados y los routers permanecen congelados. Esta decisión implica que la capacidad de enrutamiento del modelo base no se modifica durante el ajuste, y que el esfuerzo de adaptación se concentra en atención, representación compartida y procesamiento visual. La presencia de capas visuales adaptadas sugiere que el modelo base acepta entrada de imagen, extremo que no se documenta de forma explícita en la información disponible.

El procedimiento descrito incluye una partición de ajuste agrupada original, dos épocas, batch efectivo de 16 mediante acumulación 4x4, learning rate 1e-4, scheduler coseno con 3 % de warmup y semilla 42, sobre imágenes RGB nativas de entre 65536 y 401408 píxeles. La model card menciona una sonda obligatoria de gradiente, memoria y tiempo de ajuste cuyo único paso de optimizador se deshace exactamente, y afirma que no se emplearon datos externos de entrenamiento, ni ajuste sobre el conjunto de validación, ni búsqueda de checkpoints o composiciones. No se especifica el número de tokens de entrenamiento ni la composición del dataset, ambos deliberadamente ausentes del repositorio público. Tampoco se documenta el uso de RLHF, DPO u otras etapas de alineamiento.

## Capacidades

- Reconocimiento de texto manuscrito: es la única tarea declarada en las etiquetas del repositorio (handwritten-text-recognition) y el objetivo de la receta de ajuste descrita.
- Procesamiento de entrada visual: la receta adapta capas Linear visuales, lo que apunta a un modelo base con capacidad multimodal de entrada de imagen, aunque no se documenta formalmente.
- Ajuste eficiente de parámetros: el artefacto publicado es un conjunto de adaptadores LoRA, no un modelo completo; su propósito es el ajuste sobre dominios concretos de manuscrito.
- Tool calling / function calling: no disponible, no se menciona en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible, no se menciona.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas y la evaluación depende de un bundle de validación local no publicado.
- Modo de razonamiento explícito (thinking mode): no disponible, no se menciona.
- Otras capacidades del modelo base (generación de texto, código, matemáticas): no documentadas en este repositorio; corresponderían al modelo base Qwen/Qwen3.6-35B-A3B, cuya ficha no forma parte de la información proporcionada.

## Casos de uso

Nota previa: todos los escenarios siguientes son aplicaciones potenciales de un adaptador de reconocimiento de texto manuscrito de este tipo. No están validados por el autor, que no publica métricas ni predicciones, y su puesta en producción exigiría el modelo base, las dependencias fijadas y componentes locales propietarios (road_lib.py, bundle de validación congelado).

- Digitalización de archivos históricos: el adaptador se ajusta sobre imágenes RGB nativas de hasta 401408 píxeles, lo que permite abordar páginas manuscritas completas en proyectos de patrimonio documental donde el texto impreso ya está resuelto por OCR clásico.
- Transcripción de formularios manuscritos: en sectores como seguros, sanidad o administración pública, el modelo podría transcribir campos rellenados a mano, aprovechando que la atención se adapta específicamente al dominio objetivo.
- Procesamiento de cuadernos y notas de campo: investigación de campo, arqueología o inspección técnica generan manuscritos con caligrafía variable; un ajuste LoRA permite especializar el reconocimiento sin reentrenar el modelo completo.
- Extracción de datos en pipelines documentales: el adaptador puede insertarse como etapa de transcripción previa a un motor de extracción de entidades, siempre que se resuelva la orquestación con el modelo base y se valide con datos propios del dominio.
- Investigación en reconocimiento de escritura manuscrita: el repositorio sirve como referencia metodológica para experimentar con ajuste selectivo de capas (atención, expertos compartidos, torre visual) manteniendo congelados routers y expertos enrutados en arquitecturas de mezcla de expertos.
- Análisis de correspondencia y documentos personales: transcripción de cartas y diarios manuscritos para proyectos de humanidades digitales, con revisión humana posterior dado que no existe ninguna métrica publicada de exactitud.
- Verificación de la técnica de ajuste sobre MoE: el patrón de adaptar solo atención, expertos compartidos y capas visuales, dejando intacto el enrutamiento, es reutilizable como plantilla de experimentación para otros dominios sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica de forma explícita que la publicación de código "no formula ninguna afirmación de precisión ni de victoria", que los datos, particiones, predicciones y registros se omiten deliberadamente y que el adaptador final solo se sube tras completar el entrenamiento. Tampoco se proporcionan métricas de validación, comparaciones ni tasas de error de reconocimiento de caracteres o palabras.

## Requisitos de hardware

- La model card no publica cifras de VRAM, latencia ni throughput. Menciona únicamente una "GPU box autorizada" y un límite de ejecución de 14400 segundos (4 horas) en el comando de entrenamiento de ejemplo.
- Estimación propia no confirmada: suponiendo que el modelo base tenga del orden de 35 000 millones de parámetros totales, almacenar los pesos en precisión de 16 bits requeriría aproximadamente 70 GB solo para los pesos, antes de caché de activaciones y estados del optimizador. Estas cifras son aritmética derivada del identificador del modelo y no están verificadas por el autor.
- GPU recomendadas: no disponible. Por el orden de magnitud anterior, un despliegue sin cuantizar quedaría fuera de GPUs de consumo y requeriría aceleradores de clase centro de datos (por ejemplo A100 80 GB, H100 80 GB o configuraciones multi-GPU), extremo no confirmado en la documentación.
- Compatibilidad con GPU de consumo: no disponible. Dependería de la existencia de pesos cuantizados del modelo base, que no se documentan aquí.
- Opciones de despliegue: no se indica ninguna. El repositorio remite a scripts propios (train_qwen36_moe.py y eval_qwen36_moe.py) y a dependencias fijadas (torch 2.11, transformers 5.14.1, peft 0.20, accelerate 1.14). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- El código publicado no es un paquete autónomo: requiere el fichero local del propietario road_lib.py y el bundle de validación congelado de nueve miembros con su fichero de congelación.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye ningún otro modelo comparable, ni métricas que permitan situar este adaptador frente a alternativas de reconocimiento de texto manuscrito. Además, el artefacto publicado es un conjunto de adaptadores LoRA dependiente de componentes locales no distribuidos, lo que impide una comparación funcional directa con soluciones completas. Cualquier comparación requeriría datos de evaluación que el autor declara deliberadamente ausentes.

## Limitaciones y advertencias

- Ausencia total de métricas: el autor no formula afirmaciones de precisión ni de victoria, y no publica predicciones, registros ni resultados de validación.
- Repositorio incompleto por diseño: faltan los datos originales, los identificadores de fila, el contenido de las particiones, los manifiestos privados de entrenamiento, las predicciones y los registros. Sin ellos no hay reproducibilidad posible.
- Dependencia de código local no distribuido: la ejecución exige road_lib.py del propietario, el bundle de validación congelado de nueve miembros y un fichero de congelación adicional.
- Estado del artefacto: es un piloto "fit-only" y el adaptador final se sube únicamente tras completar el entrenamiento; en el momento de la publicación no hay un adaptador validado disponible.
- Riesgo de alucinación: como adaptador sobre un modelo de lenguaje, la transcripción puede producir texto plausible pero incorrecto en caligrafías degradadas o fuera de dominio; no se documenta ningún mecanismo de mitigación.
- Idiomas no declarados: se desconoce qué lenguas cubre el ajuste y con qué calidad por idioma.
- Sesgos: no disponible. No se documenta composición del dataset de ajuste, por lo que no es posible caracterizar sesgos de escritura, género, época o procedencia documental.
- Licencia: Apache-2.0 tanto en los adaptadores como en el modelo base según la model card. La licencia permisiva no exime de verificar las condiciones del corpus de ajuste, que no se publica y cuya procedencia y derechos son desconocidos.
- Uso comercial: no se declaran restricciones adicionales en la licencia, pero la falta de evaluación y la dependencia de componentes privados hacen desaconsejable su uso en producción sin una validación propia completa.
- Nomenclatura: el identificador del modelo base (Qwen/Qwen3.6-35B-A3B) no permite confirmar por sí solo número de parámetros, parámetros activos ni longitud de contexto; no debe asumirse ningún valor sin verificar la ficha del modelo base.
- Advertencia general: esta ficha describe un artefacto publicado el 1 de octubre de 2026 con cero descargas y cero likes, sin pipeline de inferencia declarado.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/hassanql/road-qwen36-35b-adapters
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.6-35B-A3B (commit 995ad96eacd98c81ed38be0c5b274b04031597b0)
- Scripts citados en la model card: train_qwen36_moe.py y eval_qwen36_moe.py (no se proporciona enlace ni ruta pública)
- La búsqueda web realizada no devolvió ningún enlace relevante al modelo, al autor ni a su dominio de aplicación; los resultados obtenidos no guardan relación con este repositorio y se descartan.
