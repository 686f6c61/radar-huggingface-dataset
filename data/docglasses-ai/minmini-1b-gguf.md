# Docglasses-AI/minmini-1b-gguf

## Resumen

Minmini-1B GGUF es una compilación en formato GGUF del modelo Felamity-Technologies/Minmini-1B, publicada por Docglasses-AI y orientada específicamente a la traducción de tamil a inglés en dispositivos móviles y entornos on-device. Con 999.887.104 parámetros (aproximadamente 1.000 millones) y un tamaño de repositorio de 2,2 GB, el modelo se distribuye en tres cuantizaciones (IQ4_XS, IQ3_XXS y Q4_K_M) calibradas mediante una importance matrix generada a partir de prompts de traducción tamil→inglés.

El modelo deriva de la familia Gemma 3, como indican las etiquetas del repositorio y el formato de chat empleado (`<start_of_turn>` / `<end_of_turn>`), y hereda por tanto la licencia Gemma Terms of Use. Su propósito es cubrir un caso de uso muy concreto: despliegue de traducción bidireccional ta↔en en hardware con recursos limitados, donde un modelo de 1B cuantizado a 3-4 bits puede ejecutarse en telefonía móvil sin conexión.

La relevancia actual del modelo radica en su enfoque de cuantización consciente de la tarea: en lugar de aplicar una imatrix genérica, el autor la calibra sobre prompts de traducción, lo que busca preservar la calidad en el dominio objetivo con un coste de bits muy reducido. No obstante, la información pública disponible es escasa y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Gemma 3; detalles no disponibles) |
| Parametros totales | 999.887.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS, IQ3_XXS, Q4_K_M (GGUF); BF16 fuente no publicado |
| Idiomas soportados | tamil (ta), ingles (en) |
| Licencia | Gemma Terms of Use |
| Formato de pesos | GGUF (+ fichero `.imatrix`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su pertenencia a la familia Gemma 3 (según las etiquetas del repositorio y el formato de chat Gemma). El modelo base es Felamity-Technologies/Minmini-1B, del que no se han publicado en esta ficha datos sobre composición del dataset, número de tokens de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación técnica destacable de esta publicación no reside en el entrenamiento sino en el proceso de cuantización: el autor generó una importance matrix (`.imatrix`) calibrada específicamente sobre prompts de traducción tamil→inglés, con un refuerzo ligero de la dirección inversa en→ta. Esta imatrix se emplea para las cuantizaciones I-quant (IQ4_XS e IQ3_XXS), que asignan bits de forma no uniforme según la relevancia de cada peso para la tarea. El resultado son ficheros de muy bajo peso pensados para inferencia en dispositivo. El GGUF en BF16 se conserva localmente y no se publica en el repositorio.

## Capacidades

- Traducción de tamil a inglés como tarea principal, con soporte ligero de inglés a tamil.
- Generación de texto conversacional en formato chat de Gemma (`<start_of_turn>` / `<end_of_turn>`).
- Ejecución on-device en telefonía móvil gracias a las cuantizaciones IQ4_XS e IQ3_XXS.
- Inferencia offline sin dependencia de servicios en la nube.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Traducción tamil→inglés en aplicaciones móviles offline: el modelo se integra en apps Android/iOS mediante llama.cpp u Ollama y traduce texto introducido por el usuario sin conexión, usando la cuantización IQ4_XS como opción por defecto.
- Subtitulado y traducción de mensajes en tiempo real: al ejecutarse localmente con latencia baja, puede traducir mensajes de chat o notas de voz transcritas en un dispositivo de gama media.
- Asistencia a usuarios tamilófonos en trámites: integrado en una app de ayuda, traduce instrucciones administrativas o formularios del tamil al inglés para su revisión por personal que no domina el tamil.
- Traducción de documentación técnica y correos: en un pipeline de escritorio con llama.cpp, el modelo traduce correos o fragmentos de documentación tamil→inglés como paso previo a una revisión humana.
- Prototipado de investigación en traducción de bajo recurso: sirve como baseline ligero para experimentos de traducción ta↔en en entornos con GPU de gama baja o CPU.
- Educación y aprendizaje de idiomas: aplicación que muestra la traducción al inglés de frases en tamil y permite al estudiante comparar, ejecutándose íntegramente en el dispositivo.
- Despliegue en dispositivos embebidos o kioscos sin conectividad: el tamaño reducido de los ficheros IQ3_XXS permite incluirlos en imágenes de sistema con almacenamiento limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño del repositorio (2,2 GB para el conjunto de ficheros), cada cuantización individual ocupa sustancialmente menos, siendo IQ3_XXS la más pequeña e IQ4_XS la recomendada para móvil.
- GPU recomendadas: no disponibles; el modelo está diseñado para CPU y aceleradores móviles (Metal, Vulkan, NEON) más que para GPU de servidor.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con más de 2 GB de memoria, aunque no se han publicado requisitos oficiales.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF; el prompt debe seguir el formato de chat de Gemma y detenerse en `<end_of_turn>`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Minmini-1B GGUF (este) | ~1.000 M | no disponible | ta, en | Gemma Terms of Use | GGUF |
| Felamity-Technologies/Minmini-1B | ~1.000 M | no disponible | ta, en | no disponible | safetensors (presumiblemente) |
| Gemma 3 (familia base) | no disponible en esta ficha | no disponible | multilingue | Gemma Terms of Use | safetensors, GGUF |
| Alternativas especializadas en traducción ta↔en de ~1B | no disponible | no disponible | ta, en | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en traducción ta↔en; su uso como modelo generalista de conversación o razonamiento no está validado.
- No se han publicado evaluaciones de calidad de traducción (BLEU, COMET u otras), por lo que la fidelidad real de las cuantizaciones IQ3_XXS e IQ4_XS frente al BF16 es desconocida.
- Las cuantizaciones de 3 bits (IQ3_XXS) pueden degradar la calidad de traducción; el autor la describe como opción de reserva ultra-pequeña.
- Riesgo de alucinación y de traducciones inexactas en textos largos, dominios especializados o tamil dialectal, sin datos públicos que lo cuantifiquen.
- Licencia Gemma Terms of Use: el uso comercial está sujeto a las condiciones de Google, incluidos posibles requisitos de atribución y restricciones de uso aceptable.
- El repositorio no incluye el GGUF en BF16, lo que limita la reproducibilidad de cuantizaciones propias a partir de esta publicación.
- No se documentan sesgos específicos; al derivar de Gemma, puede heredar sesgos del corpus de entrenamiento original.
- La información sobre contexto máximo, arquitectura exacta y datos de entrenamiento no está disponible públicamente en esta ficha.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Docglasses-AI/minmini-1b-gguf
- Modelo base: https://huggingface.co/Felamity-Technologies/Minmini-1B
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
