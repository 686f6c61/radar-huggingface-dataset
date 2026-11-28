# Junimaru/dujo-102m-cemi

## Resumen

Dujo-102M-Cemí es un modelo de lenguaje de 102 millones de parámetros publicado por el usuario Junimaru en Hugging Face bajo licencia Apache 2.0. Se presenta como un modelo de arquitectura propia y experimental, etiquetada como "geométrica", que combina dos componentes denominados ZOH Selective Transport y Temporal Fold, además de incorporar un mecanismo de mezcla de expertos (MoE). El modelo está entrenado localmente en hardware Apple Silicon y declara soporte para castellano e inglés.

El modelo resulta relevante por su carácter marcadamente experimental: no sigue la estela de las arquitecturas transformer convencionales ni de los MoE estándar de gran escala, sino que propone una aproximación geométrica propia con un protocolo de razonamiento integrado llamado "Protocolo Cemí", que emplea marcadores explícitos como [OK] y [VER]. Con 102M de parámetros y un repositorio de 0,4 GB, está claramente orientado a experimentación, prototipado y despliegue en entornos con recursos limitados, no a producción a gran escala.

La información pública disponible es muy escasa: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, la model card es mínima y no se han publicado resultados de benchmarks, detalles del dataset de entrenamiento ni especificaciones completas de contexto o cuantización. Esta ficha refleja fielmente ese nivel de información y marca como "no disponible" todo aquello que el autor no ha documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Propietaria "geométrica" (ZOH Selective Transport + Temporal Fold), con mezcla de expertos (MoE) |
| Parametros totales | 102M |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Español (es) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 0,4 GB) |

## Arquitectura y entrenamiento

El autor describe el modelo como una arquitectura geométrica basada en dos bloques propios: ZOH Selective Transport y Temporal Fold. El término ZOH sugiere un muestreo de retención de orden cero (zero-order hold), habitual en el modelado de sistemas continuos discretizados, mientras que Temporal Fold apunta a una operación de plegado o compresión sobre la dimensión temporal. La model card también etiqueta el modelo como MoE, aunque no se especifica el número de expertos, el mecanismo de enrutamiento ni cuántos parámetros permanecen activos por token. No se trata, por tanto, de un transformer estándar ni de un MoE convencional, sino de una propuesta de investigación con nomenclatura propia.

El entrenamiento se realizó localmente en Apple Silicon, según declara el autor, y el modelo incorpora un "Protocolo Cemí" de razonamiento que utiliza marcadores explícitos como [OK] y [VER] para estructurar las respuestas. No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni la metodología de alineación. Tampoco hay información sobre técnicas de decodificación especulativa, atención lineal u otras innovaciones de inferencia más allá de la velocidad declarada de 120 tokens por segundo en el backend MPS de Apple.

## Capacidades

- Generación de texto en español e inglés, según los idiomas declarados en la model card.
- Razonamiento estructurado mediante el llamado Protocolo Cemí, con marcadores [OK] y [VER] integrados en el flujo de respuesta.
- Arquitectura MoE, lo que en principio permite activación selectiva de expertos, aunque se desconoce el grado real de especialización.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado más allá del protocolo de razonamiento mencionado.
- Capacidades de visión, audio o modo "thinking" explícito: no disponibles.
- Capacidades multilingües adicionales más allá de español e inglés: no disponibles.

## Casos de uso

- Experimentación en arquitecturas alternativas: el modelo sirve como banco de pruebas para investigar el comportamiento de ZOH Selective Transport y Temporal Fold frente a transformers convencionales, dado su tamaño reducido y su licencia permisiva.
- Prototipado rápido en Apple Silicon: con 102M de parámetros y 120 tokens/s en MPS, permite iterar en local sobre un Mac sin necesidad de GPU dedicada, útil para validar ideas antes de escalar.
- Generación de texto ligera en español e inglés: adecuado para tareas de completado o redacción breve en entornos con recursos muy limitados, siempre con revisión humana por su reducido tamaño.
- Investigación sobre protocolos de razonamiento: el Protocolo Cemí con marcadores [OK] y [VER] puede estudiarse como mecanismo de estructuración de respuestas y compararse con formatos de cadena de pensamiento convencionales.
- Docencia y divulgación: su tamaño y su arquitectura no convencional lo hacen útil para explicar conceptos de MoE, muestreo y plegado temporal en cursos o talleres.
- Base para fine-tuning experimental: al estar bajo Apache 2.0 y pesar 0,4 GB, puede adaptarse a dominios concretos en hardware de consumo, aunque la falta de documentación sobre el formato de pesos limita la puesta en marcha.
- Evaluación de robustez y sesgos en modelos pequeños: útil como sujeto de estudio en trabajos académicos sobre comportamiento de modelos de menos de 200M de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento declarado por el autor es una velocidad de 120 tokens por segundo en el backend MPS de Apple Silicon.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño, un modelo de 102M de parámetros en FP16 ocuparía aproximadamente 0,2 GB de pesos, y en cuantizaciones de 8 o 4 bits bastante menos, aunque no se confirman formatos soportados.
- GPU recomendadas: el autor solo menciona ejecución en Apple Silicon mediante MPS; no se documentan GPU NVIDIA o AMD compatibles.
- ¿Cabe en GPU de consumo? Por tamaño, sí cabría en cualquier GPU de consumo moderna, pero la falta de formatos de pesos documentados (GGUF, safetensors, etc.) impide confirmar la ruta de despliegue.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la única referencia es la ejecución en MPS.
- Latencia y throughput: 120 tokens/s en MPS según el autor; no hay datos para otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Dujo-102M-Cemí | 102M | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Arquitectura geométrica propia, MoE, solo MPS documentado |
| Modelos transformer pequeños de ~100M (categoría general) | ~100M | variable | variable | amplia | No se dispone de una comparación directa publicada por el autor |
| Alternativas MoE de pequeño tamaño | no disponible | no disponible | no disponible | no disponible | No se identifican comparables directos con la misma arquitectura |

No se dispone de datos de benchmarks ni de especificaciones comparables suficientes para establecer una comparativa cuantitativa rigurosa con alternativas concretas.

## Limitaciones y advertencias

- Documentación mínima: la model card no detalla contexto, dataset, formato de pesos ni proceso de alineación, lo que dificulta evaluar su idoneidad para producción.
- Riesgo elevado de alucinación: con 102M de parámetros y sin datos de entrenamiento publicados, la fiabilidad factual es previsiblemente baja.
- Sesgos desconocidos: no se ha documentado la composición del corpus ni filtros de sesgo, por lo que no puede descartarse la presencia de sesgos en español e inglés.
- Idiomas limitados: solo se declaran español e inglés; el rendimiento en otras lenguas no está soportado ni evaluado.
- Adopción nula: 0 descargas y 0 "likes" en el momento de la consulta implican ausencia de validación comunitaria y de casos de uso verificados.
- Arquitectura no estándar: al no seguir un transformer convencional, es probable que no funcione con herramientas habituales de despliegue (vLLM, llama.cpp, TGI) sin adaptaciones específicas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; cualquier uso en producción recae íntegramente sobre el integrador.
- Velocidad declarada no verificada: el dato de 120 tokens/s en MPS procede del autor y no ha sido replicado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Junimaru/dujo-102m-cemi
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
