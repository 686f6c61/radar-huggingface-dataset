# juiceb0xc0de/flint-GGUF

## Resumen

flint-GGUF es una republicación cuantizada en formato GGUF del modelo RecursiveSI/flint, un modelo de lenguaje de aproximadamente 39.785 millones de parámetros (unos 40B). La conversión y cuantización la ha realizado el usuario juiceb0xc0de mediante llama.cpp (build 12366, commit 31953bcf7) dentro del Space BYOGGUF, partiendo de los pesos originales en safetensors. El resultado son dos ficheros listos para inferencia local con llama.cpp: una cuantización Q8_0 de 39,44 GB y una Q4_K_M de 22,51 GB.

La relevancia de esta ficha es doble. Por un lado, pone a disposición de la comunidad un modelo de ~40B en un formato que permite ejecutarlo sin infraestructura de servidor propietaria, algo crítico para desarrolladores que trabajan en local o en clústeres modestos. Por otro lado, es un ejemplo típico de publicación derivada: la model card original apenas aporta información técnica (arquitectura, datos de entrenamiento, benchmarks), y esta ficha debe reflejar con honestidad qué se sabe y qué no.

El modelo base, RecursiveSI/flint, no expone en la información disponible detalles sobre arquitectura, contexto, idiomas o rendimiento. La licencia declarada es Apache 2.0, lo que facilita el uso comercial, pero conviene verificar la model card original antes de desplegarlo en producción. El repo ocupa 66,5 GB en total y, en el momento de la consulta, no registra descargas ni interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base RecursiveSI/flint; sin detalles en la informacion proporcionada) |
| Parametros totales | 39.785.287.456 (~39,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (39,44 GB) y Q4_K_M (22,51 GB); conversion previa a F16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (derivado de safetensors originales) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base RecursiveSI/flint: no se especifica si es un transformer denso, un MoE, un modelo híbrido con atención lineal o cualquier otra variante. El único dato estructural fiable es el recuento de parámetros (39.785.287.456), obtenido de los tensores en safetensors del modelo original, lo que sitúa al modelo en la franja de ~40B, típica de modelos densos de gran tamaño o de MoE con un número reducido de expertos.

Tampoco hay datos sobre el corpus de entrenamiento (número de tokens, composición, proporción de código o multilingüe), ni sobre si se aplicaron fases de alineación como RLHF, DPO o instrucción supervisada. La model card del repositorio GGUF es puramente procedimental: describe la conversión a F16 y la cuantización con llama.cpp, y remite a la model card original para cualquier detalle sustantivo. Cualquier afirmación sobre innovaciones técnicas (decodificación especulativa, atención lineal, etc.) sería especulativa y no debe asumirse.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo está orientado a diálogo, aunque no se detalla el formato de prompt ni la plantilla de chat.
- Razonamiento y generación de texto general: capacidad esperable por tamaño, pero no documentada en la información disponible.
- Código y matemáticas: no disponible; no hay evidencia publicada en la model card.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución local vía llama.cpp: capacidad confirmada por el formato GGUF y el comando `llama-server -hf juiceb0xc0de/flint-GGUF:Q4_K_M`.

## Casos de uso

- Inferencia local en estaciones de trabajo: con la cuantización Q4_K_M (22,51 GB) el modelo puede cargarse en una GPU de 24 GB o en un sistema con suficiente memoria unificada, lo que permite prototipar sin depender de APIs externas.
- Despliegue en servidor con llama-server: el comando documentado levanta un endpoint compatible con la API de OpenAI, útil para integrar el modelo en aplicaciones existentes que ya consumen ese formato.
- Experimentación con cuantizaciones: al ofrecer Q8_0 y Q4_K_M del mismo modelo, permite comparar la degradación de calidad frente al ahorro de memoria en una misma tarea.
- Chat conversacional autoalojado: la etiqueta `conversational` y el flujo de BYOGGUF sugieren uso como asistente de chat privado, sin enviar datos a terceros.
- Evaluación comparativa de modelos de ~40B: sirve como candidato en pruebas internas de calidad frente a otros modelos del mismo orden de magnitud, siempre que se validen sus capacidades reales.
- Reproducción de pipelines de cuantización: el repositorio documenta el build de llama.cpp y el Space utilizado, lo que facilita replicar el proceso con otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del GGUF ni los metadatos del repositorio incluyen puntuaciones de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para Q8_0: ~40 GB solo para pesos, más overhead de contexto y KV cache; requiere GPU de 48 GB o superior (A6000, A100 80 GB, H100) o memoria unificada amplia.
- VRAM estimada para Q4_K_M: ~23 GB para pesos; encaja en GPUs de 24 GB (RTX 3090, RTX 4090, A10G 24 GB) con contexto moderado, y con más holgura en A100 40 GB.
- Cabe en GPU de consumo: sí, la Q4_K_M en RTX 3090/4090 de 24 GB; la Q8_0 no cabe en GPUs de consumo actuales.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), y por compatibilidad de formato GGUF, frontends como Ollama o LM Studio si aceptan el fichero; no se documenta soporte para vLLM o TGI con estos pesos.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| flint-GGUF (este) | ~39,8B | no disponible | Apache 2.0 | GGUF (Q8_0, Q4_K_M) | Sin benchmarks publicados |
| Modelos densos de ~30-40B con GGUF | ~30-40B | variable | variable | GGUF | Categoría comparable por tamaño; sin datos concretos en esta busqueda |
| Alternativas de ~7-13B cuantizadas | ~7-13B | variable | variable | GGUF | Menor huella de VRAM, pero no equivalentes en capacidad |

No se dispone de información suficiente para establecer una comparativa numérica fiable con modelos concretos; los datos de rendimiento del modelo base no están publicados.

## Limitaciones y advertencias

- Ausencia total de documentación técnica del modelo base: no se conocen arquitectura, datos de entrenamiento ni sesgos, lo que impide evaluar riesgos con rigor.
- Riesgo de alucinación: inherente a los modelos generativos; sin benchmarks ni evaluaciones publicadas no puede acotarse su magnitud.
- Idiomas y contexto: no declarados; no debe asumirse soporte multilingüe ni una ventana de contexto concreta.
- Licencia Apache 2.0 declarada, pero la model card remite a la original para los términos exactos; conviene verificar antes de uso comercial.
- Repositorio sin descargas ni validación comunitaria: no hay evidencia de que las cuantizaciones hayan sido probadas por terceros.
- La cuantización Q4_K_M introduce pérdida de precisión respecto a F16; para tareas sensibles a la calidad conviene usar Q8_0 o los pesos originales.
- El modelo base aparece con fecha de creación futura en los metadatos (2026-11-15), lo que sugiere posible error de registro o publicación programada; tratar los metadatos con cautela.

## Enlaces

- Repositorio GGUF: https://huggingface.co/juiceb0xc0de/flint-GGUF
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Space BYOGGUF: https://huggingface.co/spaces/juiceb0xc0de/BYOGGUF
- Fichero Q8_0: https://huggingface.co/juiceb0xc0de/flint-GGUF/blob/main/flint-Q8_0.gguf
- Fichero Q4_K_M: https://huggingface.co/juiceb0xc0de/flint-GGUF/blob/main/flint-Q4_K_M.gguf
