# KevM24/gemma-4-E4B-it-heretic

## Resumen

KevM24/gemma-4-E4B-it-heretic es un modelo de lenguaje publicado en Hugging Face por el usuario KevM24, derivado de la familia Gemma en su variante E4B (la nomenclatura de los modelos "E" de Gemma corresponde a arquitecturas con mezcla de expertos y parametros activos reducidos). El sufijo "heretic" indica que se trata de un fine-tuning o ablación de alineamiento orientada a eliminar restricciones de rechazo y sesgos de seguridad del modelo base, una practica habitual en la comunidad open source. El repositorio se distribuye en formato GGUF y cuenta con pesos safetensors de 7.518.069.290 parametros totales, con un tamano de repositorio de 5,3 GB.

La relevancia de este modelo es limitada y fundamentalmente experimental: se publicó el 15 de noviembre de 2026, no registra descargas ni interacciones, y su model card no contiene documentación técnica más allá de la declaración de licencia. No se dispone de información sobre el proceso de entrenamiento, los datos utilizados, la composición del dataset de alineamiento revertido ni los resultados de evaluación. Cualquier uso en producción debería tratarse con extrema cautela y validarse de forma independiente.

A efectos prácticos, la ficha se limita a los datos verificables del repositorio (parametros, formato, licencia y fecha) y marca explícitamente como "no disponible" todo aquello que el autor no ha documentado. No se han podido confirmar la arquitectura exacta, la longitud de contexto, los idiomas soportados ni el rendimiento en benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura E4B sugiere variante de Gemma con mezcla de expertos; no confirmado por el autor) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio incluye pesos en formato GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo mas alla de lo que sugiere su nombre: la familia Gemma E4B se asocia a variantes con mezcla de expertos y un numero reducido de parametros activos por token, aunque el autor no documenta esta caracteristica en el repositorio. El dato de 7.518.069.290 parametros totales procede de los pesos safetensors publicados.

Tampoco hay informacion sobre el corpus de entrenamiento, el numero de tokens procesados, la composicion del dataset ni las tecnicas de alineamiento aplicadas (RLHF, DPO u otras). El sufijo "heretic" indica, por convencion en la comunidad, un proceso de ablación de direcciones de rechazo o de desalineamiento deliberado respecto al modelo base, pero el autor no publica ni la metodología ni los hiperparámetros de ese proceso.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" del repositorio indica que el modelo está orientado a diálogo multi-turno, aunque no se detallan capacidades específicas.
- Razonamiento, código y matemáticas: no disponible; el autor no documenta evaluaciones ni capacidades concretas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas en la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Efecto del fine-tuning "heretic": se espera una reducción de las respuestas de rechazo respecto al modelo base, pero no hay documentación que cuantifique este efecto.

## Casos de uso

- Investigación sobre alineamiento y seguridad: el modelo puede emplearse como objeto de estudio para analizar cómo un fine-tuning de ablación modifica las respuestas de rechazo respecto al Gemma base, siempre en entornos controlados y con revisión ética.
- Experimentación con cuantizaciones GGUF: al distribuirse en formato GGUF, puede servir para probar pipelines de inferencia local con llama.cpp u Ollama y comparar el comportamiento de distintas cuantizaciones sobre una misma base.
- Pruebas de robustez de filtros de seguridad: útil para evaluar si los sistemas de moderación de una aplicación detectan contenido generado por modelos desalineados.
- Docencia y demostraciones sobre riesgos de modelos fine-tuneados por terceros: permite ilustrar por qué conviene verificar la procedencia y la documentación de un modelo antes de integrarlo.
- Evaluación comparativa de calidad de generación: puede usarse como referencia en estudios que midan la degradación de capacidades tras un proceso de ablación, aunque requeriría benchmarks propios.
- Desarrollo de herramientas de auditoría de modelos: sirve como caso de prueba para pipelines que inspeccionan metadatos, licencias y procedencia de pesos en repositorios de Hugging Face.

En ningún caso se recomienda su uso en atención al cliente, generación de código en producción ni aplicaciones orientadas al usuario final sin una evaluación exhaustiva previa, dada la ausencia total de documentación y de garantías de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 7.518 millones de parametros totales, en FP16 se requieren aproximadamente 15 GB de VRAM; en cuantización de 8 bits, unos 8 GB; en 4 bits, unos 4-5 GB. Estas cifras son estimaciones por tamano y no han sido verificadas con los pesos concretos del repositorio.
- GPU recomendadas: no disponible; el autor no publica recomendaciones. Por tamano, cabría esperar funcionamiento en GPUs de 16 GB o más en FP16, y en GPUs de 8 GB con cuantización.
- Compatibilidad con GPU de consumo: probable en tarjetas con 8-16 GB de VRAM utilizando GGUF cuantizado, aunque no está confirmado por el autor.
- Opciones de despliegue: llama.cpp y Ollama son las vías naturales dado el formato GGUF; vLLM y TGI requerirían pesos safetensors y configuración específica no documentada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Documentacion |
|---|---|---|---|---|---|
| KevM24/gemma-4-E4B-it-heretic | 7.518.069.290 | no disponible | Apache 2.0 | GGUF y safetensors | Mínima (solo licencia) |
| Gemma base (familia) | no disponible en esta ficha | no disponible | Términos propios de Google | safetensors y GGUF | Extensa |
| Otros fine-tunes "heretic" de la comunidad | variable | variable | variable | GGUF | Variable, a menudo escasa |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas; los datos de la familia Gemma base y de otros fine-tunes no se han proporcionado en la información disponible.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay model card más allá de la licencia, ni datos de entrenamiento, evaluación o uso previsto.
- Riesgo elevado de alucinación y de respuestas no filtradas: el proceso "heretic" reduce deliberadamente los mecanismos de rechazo, lo que aumenta la probabilidad de contenido inapropiado, sesgado o dañino.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento ni el proceso de alineamiento, no es posible evaluar sesgos de género, raza, idioma o ideología.
- Idiomas y contexto no verificados: se desconoce la cobertura lingüística y la ventana de contexto real.
- Licencia Apache 2.0: permite uso comercial según los términos de la licencia, pero el autor no ofrece garantías sobre la procedencia de los datos de entrenamiento ni sobre el cumplimiento de las condiciones del modelo base.
- Repositorio sin tracción: cero descargas y cero interacciones en el momento de la consulta, lo que impide cualquier validación por parte de la comunidad.
- No apto para producción sin auditoría: cualquier despliegue debería ir precedido de una evaluación independiente de calidad, seguridad y sesgos, y de la verificación de que el modelo base subyacente permite la redistribución en estos términos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/KevM24/gemma-4-E4B-it-heretic
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
