# Omnico/CAT-Translate-7b-oQ5e

## Resumen

CAT-Translate-7b-oQ5e es una versión cuantizada del modelo CAT-Translate-7b, publicada por el usuario Omnico en HuggingFace. Se trata de un checkpoint de aproximadamente 7.486 millones de parámetros (7,49B) derivado de la familia Mistral, según indican las etiquetas del repositorio, y orientado a tareas de traducción. El modelo ha sido cuantizado con la herramienta oQ (oMLX v0.7.3) mediante una estrategia de precisión mixta, lo que reduce el peso del checkpoint a unos 4,97 GiB en disco manteniendo una media efectiva de 5,700 bits por peso.

La relevancia de esta ficha reside en que se trata de un artefacto de cuantización para el ecosistema MLX (Apple Silicon), no de un modelo entrenado desde cero. La model card únicamente documenta el proceso de cuantización y la distribución de bits por tensor; no aporta información sobre el entrenamiento original, los datos utilizados, la licencia ni los idiomas soportados. El repositorio registra cero descargas y cero likes en el momento de la consulta, y fue creado el 3 de noviembre de 2026.

Dado que la información disponible es muy limitada, esta ficha se limita a documentar con rigor los datos verificables del repositorio (arquitectura de referencia, tamaño, formato de cuantización, requisitos de almacenamiento) y marca explícitamente como "no disponible" todo aquello que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Mistral, segun tags del repositorio) |
| Parametros totales | 7.485.566.976 (7,49B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MLX oQ precision mixta: affine 5-bit (grupo 64), affine 6-bit (grupo 64), affine 8-bit (grupo 64) y BF16 residual; media efectiva 5,700 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (MLX), cuantizado |
| Tamano del repositorio | 5,3 GB (4,967 GiB de pesos) |
| Libreria de inferencia | mlx |
| Fecha de publicacion | 2026-11-03 |
| Version de cuantizador | oMLX v0.7.3 (oQ) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de la etiqueta "mistral" del repositorio, que sitúa el modelo base en la familia de transformers decoder-only de Mistral AI. No se publican detalles sobre el número de capas, dimensión oculta, número de cabezas de atención ni sobre la ventana de contexto efectiva. Tampoco se documenta el proceso de entrenamiento del modelo original: no hay datos sobre volumen de tokens, composición del corpus, uso de RLHF/DPO ni objetivos de entrenamiento específicos para traducción.

Lo que sí está documentado es el proceso de cuantización posterior. El checkpoint se generó con oQ, la herramienta de cuantización de precisión mixta de oMLX v0.7.3, que asigna distintos niveles de bits a distintos tensores según su sensibilidad. La distribución es la siguiente: el 87,018% de los pesos lógicos (6,514B) se almacena en affine 5-bit con grupo de 64 (4,171 GiB), el 9,487% (0,710B) en affine 6-bit (0,537 GiB), el 3,492% (0,261B) en affine 8-bit (0,259 GiB) y un residual del 0,004% en BF16. El resultado es un checkpoint de 4,967 GiB con una media efectiva de 5,700 bits por peso. La model card indica que el modelo fue re-cuantizado el 2026-11-03 y recomienda volver a descargarlo si se tenía una copia anterior.

## Capacidades

- Traducción: el nombre del modelo (CAT-Translate) y su propósito declarado apuntan a tareas de traducción, aunque la model card no especifica pares de idiomas ni direcciones.
- Generación de texto: al estar basado en un transformer de la familia Mistral, cabe esperar capacidades de generación de lenguaje natural, si bien no se documentan explícitamente.
- Ejecución en Apple Silicon: al estar en formato MLX, está diseñado para inferencia en hardware Apple (chips M-series) mediante la librería mlx.
- Cuantización de precisión mixta: el checkpoint conserva mayor precisión en los tensores considerados sensibles (6 y 8 bits) y comprime el resto a 5 bits, lo que busca preservar calidad con menor huella de memoria.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso y agentes: no disponible.
- Capacidades multimodales (visión, audio): no disponible.
- Modo thinking: no disponible.

## Casos de uso

- Traducción local en Mac: el formato MLX y el tamaño de 4,97 GiB permiten ejecutar el modelo en un Mac con Apple Silicon sin conexión a servicios en la nube, útil para traducción de documentos confidenciales que no deben salir del equipo.
- Traducción por lotes en pipelines de contenido: al caber en memoria unificada de equipos de gama alta, se puede integrar en scripts de procesamiento por lotes para traducir corpus de documentación técnica o catálogos de producto.
- Prototipado de aplicaciones de traducción: desarrolladores que quieran validar una app de traducción en macOS pueden usar este checkpoint cuantizado para iterar rápidamente sin necesidad de GPUs dedicadas.
- Evaluación de cuantización: investigadores interesados en el impacto de la cuantización mixta oQ pueden usar este checkpoint como referencia para comparar calidad frente al modelo original en BF16.
- Asistencia a la traducción en editores de texto: integrable mediante la librería mlx en herramientas de escritorio para sugerencias de traducción en tiempo real, siempre que la latencia del hardware lo permita.
- Investigación en eficiencia de memoria: el desglose de bits por tensor documentado en la model card sirve como caso de estudio para analizar estrategias de asignación de precisión en modelos de 7B.
- Despliegue en entornos con memoria limitada: con menos de 5 GiB de pesos, es viable en equipos con 16 GB de memoria unificada, ampliando el acceso a modelos de 7B en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos ocupan 4,967 GiB; con overhead de la librería MLX y buffers de activaciones, se recomienda un mínimo de 8 GB de memoria unificada, siendo 16 GB el valor cómodo para contextos moderados.
- Hardware objetivo: chips Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) mediante la librería mlx.
- GPU NVIDIA/AMD: no es el objetivo del formato MLX; para esas plataformas sería necesario reconvertir los pesos a otro formato (por ejemplo GGUF), lo cual no está documentado por el autor.
- Cabe en GPU de consumo: en el ecosistema Apple, sí; en GPUs dedicadas convencionales no se ofrece soporte nativo en este repositorio.
- Opciones de despliegue: mlx (librería oficial de Apple); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| CAT-Translate-7b-oQ5e | 7,49B | No disponible | oQ mixta 5,700 bits/peso | No disponible | safetensors MLX |
| Mistral-7B (base de referencia) | 7,24B | 8K (tipico en la familia) | No cuantizado | Apache 2.0 (tipico) | safetensors |
| Otros derivados Mistral 7B cuantizados (GGUF Q5) | ~7,2B | Segun modelo base | 5-bit (Q5_K_M) | Segun modelo base | GGUF |

La comparación con Mistral-7B se ofrece solo como referencia de familia, ya que la model card no confirma qué checkpoint base exacto se utilizó ni sus condiciones de licencia. No se dispone de datos de rendimiento del modelo cuantizado que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Información incompleta: la model card no documenta licencia, idiomas, contexto ni el modelo base exacto, lo que impide evaluar su idoneidad para producción con garantías.
- Licencia desconocida: al no declararse licencia, no se puede asumir permiso para uso comercial; es imprescindible contactar con el autor o localizar el modelo original antes de cualquier despliegue.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas para esta versión cuantizada.
- Pérdida por cuantización: la compresión a una media de 5,700 bits/peso puede degradar la calidad respecto al checkpoint original en BF16, especialmente en tareas sensibles como terminología especializada o idiomas de bajos recursos.
- Sesgos: no documentados; al desconocerse los datos de entrenamiento del modelo base, no es posible evaluar sesgos de género, culturales o lingüísticos.
- Ecosistema restringido: el formato MLX limita su uso a hardware Apple Silicon; no hay conversiones oficiales publicadas a GGUF u otros formatos.
- Madurez del artefacto: cero descargas y cero likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- Advertencia del autor: la model card indica que se re-cuantizó el 2026-11-03 y que las copias anteriores deben descargarse de nuevo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Omnico/CAT-Translate-7b-oQ5e
- Herramienta de cuantización oQ / oMLX: https://github.com/jundot/omlx
