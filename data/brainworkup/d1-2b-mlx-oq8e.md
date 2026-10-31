# brainworkup/d1-2B-MLX-oQ8e

## Resumen

d1-2B-MLX-oQ8e es una versión cuantizada en formato MLX de un modelo multimodal de visión y lenguaje (VL) de aproximadamente 1.918 millones de parámetros, publicado por el usuario brainworkup en Hugging Face. La cuantización se ha realizado con la herramienta oQ (oMLX v0.7.3), que aplica cuantización de precisión mixta: la mayoría de los pesos se almacenan en formato afino de 8 bits con grupos de 64, mientras que una pequeña proporción se mantiene en BF16 para preservar la precisión de las capas más sensibles.

El modelo base pertenece a la familia LFM3-VL (según los metadatos del repositorio), una arquitectura multimodal que combina un modelo de lenguaje con un componente de visión de unos 189 millones de parámetros. El resultado cuantizado ocupa unos 2,2 GB en disco, con una media efectiva de 9,242 bits por peso, lo que lo hace especialmente adecuado para su ejecución en hardware Apple Silicon mediante el framework MLX.

Este tipo de repositorios resulta relevante para desarrolladores que trabajan en el ecosistema Mac y desean ejecutar modelos multimodales compactos localmente, con un equilibrio entre tamaño en memoria y calidad de salida. Cabe señalar que el repositorio es muy reciente y aún no registra descargas ni likes, y que la model card original es escasa en documentación técnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal (visión + lenguaje), familia LFM3_VL según metadatos |
| Parametros totales | 1.918.181.888 (1,918 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afino 8 bits (grupo 64) para el 90,107 % de los pesos; BF16 para el 9,893 %; media efectiva 9,242 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (framework MLX) |

## Arquitectura y entrenamiento

El repositorio contiene una cuantización, no un modelo entrenado desde cero. Según los metadatos, el modelo base pertenece a la familia LFM3_VL, una arquitectura multimodal que integra un modelo de lenguaje de 1,729 B de parámetros con un módulo de visión de 0,189 B de parámetros. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO para el modelo original.

La innovación principal de este repositorio es el proceso de cuantización con oQ (oMLX v0.7.3), una herramienta de cuantización de precisión mixta para MLX. En lugar de cuantizar uniformemente todos los pesos, oQ asigna formatos distintos por tensor: el 90,107 % de los pesos lógicos (1,728 B) se almacena en formato afino de 8 bits con tamaño de grupo 64 (8,50 bits efectivos por peso, 1,710 GiB), mientras que el 9,893 % restante (0,190 B) se conserva en BF16 sin cuantizar (0,353 GiB). Esta estrategia mantiene en alta precisión las capas más sensibles a la cuantización, reduciendo la degradación de calidad respecto a una cuantización uniforme de 8 bits.

## Capacidades

- Comprensión multimodal de imágenes y texto: el modelo incluye un componente de visión (0,189 B de parámetros) junto al modelo de lenguaje (1,729 B), lo que habilita tareas de descripción de imágenes, preguntas visuales y razonamiento sobre contenido gráfico.
- Generación de texto: como modelo de lenguaje entrenado, en principio soporta generación de texto conversacional y tareas generales, aunque la model card no detalla sus capacidades específicas.
- Ejecución nativa en Apple Silicon: al estar en formato MLX, está optimizado para inferencia eficiente en GPUs de Apple (M1/M2/M3/M4) mediante el framework mlx.
- Cuantización de alta fidelidad: la precisión mixta (8 bits + BF16) minimiza la pérdida de calidad frente a cuantizaciones más agresivas.
- No se dispone de información sobre soporte de tool calling, capacidades de agente, modo de razonamiento extendido (thinking mode) ni soporte de audio.

## Casos de uso

- Análisis local de documentos e imágenes en Mac: al ser multimodal y ocupar solo 2,2 GB, puede ejecutarse íntegramente en la memoria unificada de un Apple Silicon para extraer información de capturas, diagramas o fotografías sin enviar datos a la nube, útil en entornos con requisitos de privacidad.
- Chatbot multimodal en aplicaciones de escritorio: su tamaño compacto permite integrarlo en apps nativas macOS mediante MLX o mlx-lm para asistentes que combinen texto e imágenes con latencias bajas.
- Prototipado rápido en local: desarrolladores pueden probar pipelines de visión y lenguaje sin GPU dedicada ni costes de API, iterando sobre prompts y flujos multimodales antes de escalar a modelos mayores.
- Descripción y etiquetado automático de imágenes: el módulo de visión permite generar descripciones, alt-text o metadatos de bibliotecas de imágenes en batch en un equipo personal.
- Asistente offline para campos con conectividad limitada: al ejecutarse completamente en local, es adecuado para escenarios sin acceso a internet (trabajo de campo, entornos aislados).
- Evaluación comparativa de cuantizaciones: al tratarse de una cuantización oQ con distribución de bits documentada, sirve como caso de estudio para comparar la degradación de precisión mixta frente a otras cuantizaciones del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta la distribución de bits de la cuantización, sin evaluaciones de MMLU, HumanEval, GSM8K ni ninguna otra métrica, ni comparativas con el modelo base sin cuantizar.

## Requisitos de hardware

- Memoria necesaria: el checkpoint ocupa 2,064 GiB (2,216 GB) en disco; para inferencia conviene disponer de al menos 4-6 GB de memoria unificada disponible para pesos, KV cache y overhead de ejecución.
- Hardware objetivo: diseñado para Apple Silicon (Mac con chips M1, M2, M3 o M4) mediante el framework MLX. Un MacBook con 8 GB de RAM unificada debería poder ejecutarlo, aunque con margen limitado; 16 GB o más es lo recomendable para contextos largos.
- No está pensado para GPUs NVIDIA de forma nativa: MLX es un framework específico de Apple, por lo que opciones como RTX 4090 o A100 no aplican directamente a este formato.
- Despliegue: mediante la librería mlx y herramientas asociadas como mlx-lm; no hay evidencia de soporte directo en vLLM, TGI, llama.cpp u Ollama para este formato MLX concreto.
- Latencia y throughput: no disponibles; al ser un modelo de ~1,9 B de parámetros con cuantización de 8 bits en Apple Silicon, cabe esperar generación fluida en tiempo real en chips M recientes, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Formato | Licencia |
|---|---|---|---|---|---|
| d1-2B-MLX-oQ8e | 1,918 B | no disponible | Sí (visión, 0,189 B) | MLX safetensors, 8-bit mixto | no disponible |
| Qwen2.5-VL-3B-Instruct | 3,7 B | 32.768 tokens | Sí (visión) | safetensors | Apache 2.0 |
| SmolVLM-Instruct (2B) | 2,2 B | 16.384 tokens | Sí (visión) | safetensors | Apache 2.0 |
| PaliGemma-3B | 3 B | 8.192 tokens | Sí (visión) | safetensors | Gemma license |

Nota: la comparativa se basa en modelos multimodales compactos de referencia; los datos de los modelos alternativos corresponden a sus fichas públicas y pueden variar según versiones. Para d1-2B-MLX-oQ8e, contexto y licencia no constan en la informacion disponible.

## Limitaciones y advertencias

- Documentación muy escasa: la model card no describe capacidades, idiomas, contexto ni limitaciones del modelo base, lo que dificulta una evaluación rigurosa antes de su uso.
- Licencia no especificada: al no indicarse la licencia, no es posible confirmar si el uso comercial está permitido; debe verificarse antes de cualquier despliegue en producción.
- Riesgo de alucinación: no disponible información específica, pero como todo modelo de lenguaje de ~2 B de parámetros, cabe esperar una tasa de alucinación relativamente alta, especialmente en razonamiento complejo y datos factuales.
- Sesgos: no se dispone de información sobre sesgos del modelo base ni del proceso de entrenamiento.
- Formato MLX exclusivo de Apple: no es ejecutable directamente en GPUs NVIDIA ni en la mayoría de infraestructuras de servidor habituales, lo que limita su uso a ecosistemas macOS.
- Repositorio sin trazabilidad: cero descargas y cero likes en el momento de la ficha, sin pipeline asignado; se recomienda validar la integridad y procedencia de los pesos antes de su uso.
- Posible degradación por cuantización: aunque la precisión mixta reduce la pérdida, la cuantización de 8 bits puede afectar a tareas sensibles (matemáticas, código, generación fina) respecto al modelo base en BF16.
- Etiqueta custom_code en los metadatos: el repositorio puede requerir ejecución de código personalizado, lo que implica revisar el código de carga por seguridad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/brainworkup/d1-2B-MLX-oQ8e
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
