# Babflou/maurice-2.0-gguf

## Resumen

Maurice 2.0 es un modelo de lenguaje de 1.881.825.088 parámetros (aproximadamente 1,88 mil millones) derivado de Qwen 3.5 2B mediante un ajuste fino con LoRA fusionada, desarrollado por el usuario Babflou. Su propósito es muy concreto: funciona como modelo embebido en la aplicación para iPhone llamada Dodo, donde transforma una dictación de voz en una nota corta y decide en qué carpeta archivarla mediante una clasificación binaria (sí/no) por carpeta. Está disponible únicamente en formato GGUF cuantizado para su uso con llama.cpp.

El modelo se distribuye bajo licencia Apache 2.0, heredada del modelo base Qwen 3.5 2B de Alibaba Cloud, y soporta tres idiomas: francés, inglés y japonés. El repositorio ocupa 2,0 GB y el artefacto principal es un fichero GGUF de 968 MB con cuantización IQ4_XS y embeddings en q3_K, pensado explícitamente para inferencia en dispositivo (on-device) en un entorno móvil.

Su relevancia radica en el patrón de despliegue: un modelo pequeño, cuantizado agresivamente y especializado en dos tareas acotadas (resumen de dictado y clasificación de carpetas), ejecutable localmente en un teléfono sin depender de la nube. Es un ejemplo de ajuste fino de un modelo base generalista para una función de producto muy delimitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen 3.5 2B; arquitectura del base no detallada en la informacion) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS (embeddings en q3_K); unico fichero publicado |
| Idiomas soportados | frances, ingles, japones |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Maurice 2.0 parte de Qwen 3.5 2B, un transformer de aproximadamente 1,88 mil millones de parámetros. Sobre ese modelo base se aplicó un ajuste fino con LoRA que posteriormente se fusionó en los pesos, entrenado sobre datos de notas y de clasificación (triaje de carpetas). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO adicionales.

Tras el ajuste fino, el modelo se cuantizó con llama.cpp (licencia MIT) a IQ4_XS con embeddings en q3_K, dando como resultado un único fichero de 968 MB. La innovación técnica destacable no está en la arquitectura sino en el diseño de uso: el autor recomienda temperatura 0 y `enable_thinking: false` para la tarea de notas, y para la tarea de triaje propone leer un solo token y calcular la probabilidad de "sí" como P(oui) = oui / (oui + non). Este enfoque convierte al modelo en un clasificador binario calibrado por carpeta, en lugar de un generador de texto libre.

## Capacidades

- Generación de texto breve: transforma una dictación en una nota corta, que es la tarea principal del ajuste fino.
- Clasificación binaria por carpeta: decide sí/no para cada carpeta mediante la probabilidad del token "oui" frente a "non".
- Multilingüe limitado a francés, inglés y japonés.
- Inferencia on-device: formato GGUF optimizado para llama.cpp en dispositivos móviles.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con infraestructura de endpoints, aunque no se detalla el alcance.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking activo (de hecho, se recomienda desactivarlo).

## Casos de uso

- Resumen de dictado en aplicaciones móviles: el modelo recibe la transcripción de una dictación y la condensa en una nota corta, con temperatura 0 para maximizar la determinación y evitar variabilidad en la salida.
- Clasificación automática de notas en carpetas: para cada carpeta se calcula P(oui) a partir de un único token y se asigna la nota a la carpeta con mayor probabilidad, lo que permite organizar contenido sin intervención del usuario.
- Asistentes de productividad offline: al ejecutarse en el dispositivo con llama.cpp, permite tomar y organizar notas sin enviar datos a la nube, útil en contextos de privacidad estricta.
- Prototipado de funciones de triaje: sirve como referencia para construir clasificadores binarios ligeros a partir de modelos generativos pequeños, reutilizando la técnica de probabilidad sobre el token de respuesta.
- Aplicaciones multilingües en francés, inglés y japonés: cubre usuarios de esos tres idiomas en una misma base de código, sin necesidad de modelos separados.
- Integración en pipelines de CI/CD para pruebas de modelos embebidos: su tamaño reducido (968 MB) y su formato GGUF facilitan tests automatizados de inferencia en entornos con recursos limitados.
- Despliegue en dispositivos con poca memoria: al caber en menos de 1 GB, es viable en teléfonos de gama media donde un modelo de 2B en precisión completa no cabría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero GGUF pesa 968 MB; la inferencia requiere aproximadamente 1-1,5 GB de memoria considerando el contexto y las estructuras de llama.cpp.
- GPU recomendadas: no se especifican; por tamaño, es apto para GPU de consumo como RTX 3060, RTX 4060 o superiores, así como para ejecución en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU con 2 GB o más de VRAM; también en CPU y en dispositivos móviles.
- Opciones de despliegue: llama.cpp es el runtime indicado por el autor; el formato GGUF es compatible con Ollama y otros frontends basados en llama.cpp. No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Maurice 2.0 | 1.881.825.088 | no disponible | Apache 2.0 | GGUF (IQ4_XS) | Ajuste fino de Qwen 3.5 2B para notas y triaje; 3 idiomas |
| Qwen 3.5 2B (base) | ~2B | no disponible | Apache 2.0 | safetensors y otros | Modelo generalista del que deriva; sin especialización en tareas de notas |
| Alternativas de ~2B en GGUF | no disponible | no disponible | no disponible | GGUF | No se dispone de datos concretos de modelos comparables en la informacion |

## Limitaciones y advertencias

- Modelo altamente especializado: su ajuste fino está orientado a dos tareas concretas (resumen de dictado y clasificación de carpetas); su rendimiento en tareas generales puede degradarse respecto al modelo base.
- Idiomas limitados a francés, inglés y japonés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinación inherente a los modelos generativos pequeños, especialmente fuera de las tareas para las que fue ajustado.
- El modo thinking debe desactivarse según el autor; activarlo puede alterar el formato esperado de las salidas.
- La clasificación por carpeta depende de un umbral implícito en P(oui) = oui / (oui + non); no se documenta calibración ni umbrales recomendados.
- Licencia Apache 2.0: permite uso comercial, pero el autor aclara que el proyecto no está aprobado ni respaldado por Alibaba Cloud ni por el equipo Qwen.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.
- No se documentan sesgos específicos, pero al derivar de un modelo base generalista puede heredar los sesgos de este.

## Enlaces

- Hugging Face: https://huggingface.co/Babflou/maurice-2.0-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- llama.cpp (runtime de cuantización e inferencia): https://github.com/ggerganov/llama.cpp
- No se han encontrado otros enlaces (papers, blogs, demos) en la información disponible.
