# SNRise01/outdoor-window

## Resumen

`SNRise01/outdoor-window` no es un modelo entrenado, sino un repositorio de configuración para la aplicación "Outdoor Window". Según su propia model card, describe el uso sin modificaciones de `Qwen/Qwen2.5-1.5B-Instruct` y no reclama ningún entrenamiento ni mejora medida por fine-tuning. El repositorio no redistribuye pesos: contiene únicamente ficheros de configuración (`base_model.json`) que indican qué revisión exacta del modelo base debe cargarse mediante `from_pretrained`.

El modelo resuelve una tarea acotada dentro de esa aplicación: extraer la petición del usuario a JSON y elegir entre identificadores de candidatos de datos en vivo e identificadores de evidencia. Después, código Python valida el resultado y redacta el texto factual a partir de los registros de evidencia seleccionados. El modelo no tiene acceso directo a URLs arbitrarias ni a herramientas.

Es relevante ahora por dos motivos. Primero, como ejemplo de patrón de publicación "config-only" sobre un modelo base abierto, algo que conviene saber interpretar al evaluar repositorios en HuggingFace. Segundo, porque ilustra un caso de uso realista de un SLM (1,54 B de parámetros, cuantizado Q4_K_M y ejecutado con Ollama) como extractor estructurado y selector de evidencia dentro de un pipeline determinista, no como generador libre de respuestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de Qwen2.5-1.5B-Instruct; el repositorio no define arquitectura propia |
| Parametros totales | ~1,54 B (según model card del autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens según la model card pública del modelo base; no se especifica en este repositorio |
| Tipos de cuantizacion | GGUF Q4_K_M (runtime declarado: Ollama `qwen2.5:1.5b`); el modelo base admite otras cuantizaciones GGUF/AWQ/GPTQ no verificadas en este repositorio |
| Idiomas soportados | no disponible en el repositorio; el modelo base declara soporte multilingüe en su propia model card |
| Licencia | apache-2.0 |
| Formato de pesos | no se redistribuyen pesos; solo configuración (`base_model.json`). El modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El repositorio no aporta arquitectura nueva. Remite a `Qwen/Qwen2.5-1.5B-Instruct`, un transformer decoder-only con normalización RMSNorm, activación SwiGLU, RoPE y atención con grouped-query attention, tal como se describe en la model card del modelo base. El autor indica explícitamente que no se ha realizado entrenamiento ni se ha medido mejora alguna por fine-tuning: se trata del modelo base sin cambios.

Tampoco se documentan datos de entrenamiento propios, ni número de tokens, ni composición del dataset, ni fases de RLHF/DPO. Cualquier dato de este tipo debe consultarse en la model card de Qwen2.5-1.5B-Instruct, no en este repositorio. La innovación técnica aquí no está en el modelo, sino en el patrón de integración: extracción a JSON restringida, selección de identificadores de evidencia procedentes de fuentes en vivo (OpenStreetMap, Open-Meteo, CAMS y, opcionalmente, OpenRouteService para enrutado) y generación de texto factual por código Python a partir de esos registros, con validación posterior. El autor declara además el uso de OpenAI Codex como asistente de programación durante el desarrollo, sin que la aplicación en ejecución llame a ningún modelo de OpenAI.

## Capacidades

- Extracción de la petición del usuario a JSON estructurado, con esquema validado después por código Python.
- Selección de candidatos entre identificadores de datos en vivo e identificadores de evidencia suministrados en el contexto; el modelo no inventa registros, elige entre los existentes.
- Generación de texto factual limitada a los registros de evidencia seleccionados, producida por la capa Python de la aplicación.
- Planificación de actividades al aire libre como dominio de aplicación declarado (etiqueta `outdoor-planning`).
- Geoaplicación (etiqueta `geoai`): integración con datos geoespaciales de OpenStreetMap, meteorología de Open-Meteo y calidad del aire de CAMS.
- Enrutado opcional mediante OpenRouteService, invocado por la aplicación, no por el modelo.
- Capacidades multilingües heredadas del modelo base Qwen2.5, no verificadas ni documentadas en este repositorio.
- No dispone de tool calling propio ni de acceso a herramientas o URLs: toda la orquestación recae en la aplicación.
- No incluye visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Extracción de intención en lenguaje natural a JSON: el modelo recibe la consulta del usuario y devuelve un objeto con actividad, ubicación, franja horaria y restricciones, que Python valida antes de consultar las fuentes de datos. Adecuado por su tamaño reducido y su coste de inferencia bajo.
- Selección de puntos de interés candidatos: dado un conjunto de POI con identificadores de OpenStreetMap, el modelo elige los relevantes para la petición y descarta el resto, sin generar identificadores nuevos.
- Filtrado por condiciones meteorológicas: la aplicación recupera la previsión de Open-Meteo y el modelo decide qué evidencias climáticas justifican descartar o mantener un plan, siempre citando los registros proporcionados.
- Avisos de calidad del aire: con datos de CAMS, el modelo selecciona la evidencia correspondiente para que la capa determinista redacte una recomendación de actividad al aire libre. No sustituye criterio médico.
- Planificación de fin de semana con enrutado: combinación de POI, previsión y tiempos de trayecto de OpenRouteService para producir un itinerario por franjas horarias, con el modelo actuando solo como selector de evidencias.
- Asistente conversacional de bajo coste en producción: al ejecutarse con Ollama en Q4_K_M, puede desplegarse en una instancia modesta y responder con latencia baja en un flujo multi-turno acotado por la aplicación.
- Prototipado de pipelines "SLM + validación determinista": útil como referencia de arquitectura para equipos que quieran minimizar alucinaciones delegando la redacción final a código que solo puede usar datos verificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no reclama ninguna mejora medida por fine-tuning, por lo que no procede atribuir al repositorio cifras de MMLU, HumanEval, GSM8K ni de evaluaciones de extracción estructurada.

## Requisitos de hardware

- VRAM estimada en inferencia: alrededor de 1,0-1,2 GB para pesos en Q4_K_M y 2-3 GB en total con caché KV para contextos moderados (estimación a partir del tamaño de 1,54 B; no medida por el autor).
- En FP16, los pesos ocupan aproximadamente 3,1 GB, por lo que caben en GPUs consumer de 6-8 GB sin problemas.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, RTX 4090); en centro de datos, A100/H100 son sobredimensionadas para este tamaño y solo se justifican por agregación de muchas peticiones concurrentes.
- Cabe en GPU consumer y también en CPU: es viable en mini-PC, Raspberry Pi 5 y portátiles sin GPU dedicada usando llama.cpp.
- Opciones de despliegue: Ollama (`qwen2.5:1.5b`, runtime declarado por el autor), llama.cpp con GGUF, vLLM o TGI para servicio con batching, y `transformers` con `AutoModelForCausalLM` para cargar el base exacto mediante `base_model.json`.
- Latencia y throughput: no disponibles como medición del autor. Como orden de magnitud orientativo para un modelo de 1,5 B en Q4_K_M, cabría esperar decenas de tokens por segundo en CPU y varios cientos en GPU consumer, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| outdoor-window (base Qwen2.5-1.5B-Instruct) | ~1,54 B | 32.768 tokens (según model card del base) | apache-2.0 | Repositorio de configuración; pesos vía modelo base |
| Qwen2.5-1.5B-Instruct | ~1,54 B | 32.768 tokens | apache-2.0 | Pesos en safetensors y GGUF en HuggingFace |
| Qwen2.5-0.5B-Instruct | ~0,49 B | 32.768 tokens (según model card del fabricante) | apache-2.0 | Pesos publicados; menor calidad de extracción esperada |
| Llama 3.2 1B Instruct | ~1,24 B | 128.000 tokens (según model card del fabricante) | Licencia comunitaria Llama 3.2 | Pesos publicados; requiere aceptar la licencia |
| SmolLM2-1.7B-Instruct | ~1,7 B | 8.192 tokens (según model card del fabricante) | Apache-2.0 | Pesos publicados |

Nota: los datos de contexto y licencia de las filas comparativas provienen de las model cards públicas de cada fabricante y no han sido verificados en este repositorio. No se incluyen cifras de benchmark porque no hay resultados publicados en la información disponible para este modelo.

## Limitaciones y advertencias

- El repositorio no contiene pesos: cargarlo requiere descargar el modelo base desde `Qwen/Qwen2.5-1.5B-Instruct`. No es un repositorio autónomo y el propio autor lo reconoce.
- Riesgo de alucinación en la fase de extracción: el autor advierte que "la extracción puede fallar". La mitigación depende de la validación en Python, no del modelo.
- El modelo no tiene acceso a URLs ni a herramientas; cualquier intento de ampliar esa capacidad requiere cambios en la aplicación, no en el modelo.
- Las consultas del usuario y los nombres mapeados se tratan como datos no confiables: existe superficie de inyección de prompt en la fase de extracción si no se sanea la entrada.
- Cobertura geográfica limitada: prototipo solo para India, zona horaria Asia/Kolkata.
- Datos incompletos por diseño: no hay tráfico en vivo, ni horarios de apertura verificados, ni disponibilidad de reservas confirmada. Las previsiones y los datos mapeados pueden estar incompletos.
- Etiqueta `not-for-medical-use`: las reglas conservadoras de cribado del prototipo no son umbrales clínicos y no deben presentarse como consejo sanitario.
- Licencia apache-2.0 en este repositorio, heredada del modelo base, que permite uso comercial. Debe verificarse igualmente la licencia de las fuentes de datos utilizadas (OpenStreetMap, Open-Meteo, CAMS, OpenRouteService), que es independiente de la del modelo.
- Modelo de 1,54 B: capacidad de razonamiento limitada. Es adecuado para extracción y clasificación acotadas, no para razonamiento multi-paso complejo ni para generación factual sin verificación.
- Advertencia de procedencia: las marcas temporales del repositorio (creado y actualizado el 2026-10-23) son futuras respecto a la fecha habitual de consulta, y el repositorio no tiene descargas ni Likes. Conviene tratar su madurez y mantenimiento como no verificados.
- No se documentan sesgos específicos ni evaluación de idiomas; al no haber datos, no puede afirmarse un comportamiento multilingüe fiable en esta aplicación concreta.

## Enlaces

- Repositorio del modelo: https://huggingface.co/SNRise01/outdoor-window
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio hermano del mismo autor: https://huggingface.co/SNRise01/trailwise-geoai
- OpenStreetMap: https://www.openstreetmap.org
- Open-Meteo: https://open-meteo.com
- CAMS (Copernicus Atmosphere Monitoring Service): https://atmosphere.copernicus.eu
- OpenRouteService: https://openrouteservice.org
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
