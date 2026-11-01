# Audante/FLUX.2-klein-4B-mflux-q4

## Resumen

FLUX.2-klein-4B-mflux-q4 es una redistribución del modelo de generación de imágenes FLUX.2 [klein] 4B de Black Forest Labs, convertido al formato mflux en cuantización de 4 bits por el usuario Audante. Se trata de una réplica exacta de los ficheros publicados por mflux-community en la revisión `794cd159538149ad9830848508c31f0ea7088e58`, sin modificaciones respecto al origen, y se distribuye bajo licencia Apache 2.0. El repositorio ocupa 4,6 GB y contiene pesos en formato safetensors.

El modelo pertenece a la familia FLUX.2 de Black Forest Labs, especializada en síntesis de imágenes mediante modelos de difusión, y la variante "klein" corresponde a la gama compacta de 4B de parámetros. La conversión a mflux y la cuantización a 4 bits buscan reducir los requisitos de memoria para permitir la inferencia en hardware de consumo, manteniendo la fidelidad respecto al modelo original.

La relevancia de esta ficha radica en que facilita el despliegue local de un modelo de generación de imágenes de última generación con un consumo de VRAM contenido, si bien al tratarse de una redistribución no oficial conviene verificar la integridad de los ficheros y asumir las limitaciones propias de una cuantización agresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusión (familia FLUX.2), detalles no disponibles |
| Parametros totales | 4B (según nomenclatura del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (q4) en formato mflux |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (mflux) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base FLUX.2 [klein] 4B más allá de su pertenencia a la familia FLUX.2 de Black Forest Labs, orientada a la generación de imágenes mediante difusión. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La única innovación técnica documentada en esta ficha es el proceso de conversión y cuantización a 4 bits realizado por mflux-community, que reduce el peso del repositorio a 4,6 GB y facilita la inferencia en GPUs con VRAM limitada. No se han publicado detalles sobre optimizaciones adicionales como decodificación especulativa o mecanismos de atención lineal.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image), según la naturaleza del modelo base FLUX.2.
- Ejecución local mediante la librería mflux, lo que permite integrar el modelo en flujos de trabajo de Python.
- Cuantización de 4 bits que reduce los requisitos de memoria frente al modelo original en precisión completa.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.
- No se especifican capacidades multilingües en la información disponible.

## Casos de uso

- Prototipado rápido de generación de imágenes en estaciones de trabajo con GPU de consumo: la cuantización q4 permite cargar el modelo en tarjetas con VRAM moderada, agilizando la experimentación sin depender de servicios en la nube.
- Integración en pipelines de diseño gráfico automatizado: el modelo puede generar variaciones de ilustraciones o bocetos a partir de prompts, y su formato mflux facilita la incorporación en scripts de Python.
- Generación de recursos para videojuegos y aplicaciones interactivas: permite crear texturas, sprites o fondos de forma local, reduciendo la dependencia de APIs externas y los costes asociados.
- Investigación en modelos de difusión: al ser una réplica exacta del modelo de mflux-community, sirve como referencia reproducible para comparar el efecto de la cuantización de 4 bits frente a otras precisiones.
- Despliegue en entornos con conectividad limitada o requisitos de privacidad: al ejecutarse en local, los prompts y las imágenes generadas no salen del equipo, lo que resulta adecuado para datos sensibles.
- Educación y demostraciones: el tamaño contenido del repositorio (4,6 GB) y la licencia Apache 2.0 permiten su uso en talleres y cursos sobre generación de imágenes con modelos de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con pesos de 4 bits y un repositorio de 4,6 GB, se requiere previsiblemente una GPU con al menos 6-8 GB de VRAM, aunque esta cifra no está confirmada por el autor.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño del modelo, cabría esperar compatibilidad con GPUs de consumo de gama media-alta, pero no se confirma.
- Compatibilidad con GPU de consumo: probable según el tamaño del repositorio, sin confirmación oficial.
- Opciones de despliegue: librería mflux (formato nativo del repositorio); no se documentan otros runners como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Audante/FLUX.2-klein-4B-mflux-q4 | 4B | no disponible | Apache 2.0 | safetensors (mflux, q4) | Redistribución no oficial de mflux-community |
| mflux-community/flux2-klein-4b-mflux-q4 | 4B | no disponible | Apache 2.0 | safetensors (mflux, q4) | Fuente original de esta réplica |
| black-forest-labs/FLUX.2-klein-4B | 4B | no disponible | Apache 2.0 | no disponible | Modelo base oficial en precisión original |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Se trata de una redistribución no oficial: el autor declara explícitamente que no es un lanzamiento oficial de Black Forest Labs.
- Los ficheros son idénticos a los de mflux-community en la revisión indicada; cualquier problema del origen se hereda sin cambios.
- La cuantización a 4 bits puede degradar la calidad de las imágenes generadas respecto al modelo en precisión completa, aunque no se cuantifica esa pérdida en la información disponible.
- No se documentan sesgos conocidos, pero al ser un modelo de difusión entrenado con datos no especificados, es probable que reproduzca sesgos presentes en dichos datos.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir resultados incoherentes o no fieles al prompt.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar el fichero LICENSE y los términos del modelo base para confirmar las condiciones exactas.
- No se especifican idiomas soportados ni limitaciones de contexto, lo que dificulta evaluar su comportamiento en prompts en castellano.
- Se recomienda verificar los checksums mediante SHA256SUMS, cuando estén presentes, antes de usar los pesos en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Audante/FLUX.2-klein-4B-mflux-q4
- Fuente original: https://huggingface.co/mflux-community/flux2-klein-4b-mflux-q4
- Modelo base oficial: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
