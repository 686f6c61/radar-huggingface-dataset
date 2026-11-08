# Mortxm/lligma-tutor

## Resumen

LLigMA Tutor es un modelo de lenguaje de 386,7 millones de parámetros desarrollado por el usuario Mortxm y publicado en Hugging Face bajo licencia CC0-1.0. Se trata de un fine-tuning mediante SFT (supervised fine-tuning) sobre el modelo base LLigMA, orientado específicamente a una tarea de "riscrittura guardata" (reescritura con guarda) dentro de un sistema de tutor con recuperación aumentada (RAG) denominado Tutor. El modelo no genera respuestas finales de forma autónoma: produce borradores de reescritura que un componente de validación (guard) acepta o rechaza, sirviendo en caso de rechazo una baseline extractiva anclada a las fuentes recuperadas.

El modelo está diseñado para ejecutarse en CPU con un consumo de RAM de aproximadamente 2-3 GB, lo que lo sitúa en la categoría de modelos ligeros desplegables en hardware sin GPU. Su ámbito lingüístico declarado es exclusivamente el italiano (`it`) y su caso de uso está acotado al dominio del índice de recuperación incluido (58 documentos, 906 pasajes). Fuera de ese dominio, el sistema se abstiene de responder.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado y con una model card que documenta explícitamente sus límites de rendimiento (9/20 borradores aceptados por el guard, es decir, un 45 %). No se han publicado resultados de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LLigMA; no se especifica si es transformer denso, MoE u otra) |
| Parametros totales | 386,7 M |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor indica ejecución en CPU sin cuantización explícita) |
| Idiomas soportados | italiano (`it`) |
| Licencia | CC0-1.0 |
| Formato de pesos | safetensors (1.546.924.864 bytes, sha256 `bdaa098e…`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base LLigMA más allá de su tamaño (386,7 M de parámetros). El autor describe el proceso como un fine-tuning SFT de "pass 2" sobre dicho modelo base, orientado a la tarea de reescritura guardada del Tutor. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO.

El componente diferencial no es arquitectónico sino de sistema: el modelo se integra en un pipeline con un índice de recuperación (`index/tutor-index.json`, 58 documentos y 906 pasajes) y un guard que valida cada borrador. Cuando el borrador no supera el guard, se sirve una baseline extractiva citada y anclada a los pasajes recuperados. El paquete incluye el servidor Alessandria con endpoints HTTP (`/api/health`, `/api/tutor/stream` vía SSE, `/api/stream`, `/api/generate`) y un cliente web en `web/model/index.html`.

## Capacidades

- Generación de borradores de reescritura de respuestas tutoras a partir de pasajes recuperados.
- Respuesta anclada a fuentes mediante un pipeline RAG con índice preconstruido de 58 documentos y 906 pasajes.
- Abstención explícita ante consultas fuera de dominio.
- Fallback extractivo automático cuando el guard rechaza el borrador generado.
- Servicio HTTP con streaming SSE para integración en aplicaciones web.
- Ejecución en CPU sin GPU, con requisitos de RAM de aproximadamente 2-3 GB.
- Soporte lingüístico limitado al italiano.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Tutor académico en italiano sobre un corpus cerrado: el modelo genera borradores de respuesta a partir de los 906 pasajes del índice, y el guard decide si se sirven o se sustituyen por la baseline extractiva, garantizando siempre citación de fuentes.
- Despliegue en entornos sin GPU: al ejecutarse en CPU con 2-3 GB de RAM, es viable en servidores modestos, contenedores ligeros o equipos de desarrollo sin acelerador.
- Prototipado de pipelines RAG con validación intermedia: sirve como banco de pruebas para estudiar el comportamiento de un guard sobre borradores generados por un modelo pequeño.
- Asistencia documental acotada: para consultas sobre el corpus indexado, el sistema devuelve respuestas ancladas o se abstiene, lo que encaja en escenarios donde la trazabilidad de la fuente es requisito.
- Investigación sobre abstención y fallback: el diseño permite medir la tasa de aceptación del guard (45 % en el set de 20 preguntas) y analizar cuándo conviene el fallback extractivo.
- Integración en aplicaciones web educativas: el servidor incluye endpoints SSE y una UI servida en `/`, lo que facilita incorporar el tutor a frontends existentes sin infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento declarado por el autor es la tasa de aceptación del guard en su set de lanzamiento de 20 preguntas: 9/20 borradores aceptados sin modificación (aproximadamente un 45 %).

## Requisitos de hardware

- RAM estimada: 2-3 GB para inferencia en CPU, según indica el autor.
- GPU: no requerida; el autor documenta explícitamente el despliegue con `--device cpu`.
- GPU consumer: no aplica como requisito; no se documenta soporte GPU ni cuantizaciones alternativas.
- Despliegue: servidor propio del paquete `lligma.model.server` con endpoints HTTP y SSE; dependencias `torch` (build CPU), `transformers>=4.45,<5`, `safetensors>=0.4`, `tokenizers>=0.19`, `numpy>=1.26` y `PyYAML`.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|---|
| LLigMA Tutor (Mortxm) | 386,7 M | no disponible | italiano | CC0-1.0 | CPU, servidor propio | Fine-tuning SFT para reescritura con guard; 45 % de aceptación en set de 20 preguntas |
| DeepTutor | no disponible | no disponible | no disponible | open source (no especificada) | no disponible | Asistente de aprendizaje multi-agente sobre materiales del usuario; enfoque de sistema, no de modelo aislado |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- Tasa de aceptación del guard limitada: solo 9 de 20 borradores pasan sin modificación en el set de medida del autor, lo que implica que en la mayoría de casos se sirve la baseline extractiva.
- La corrección de la respuesta servida no depende del modelo, sino del fallback extractivo y de la citación de pasajes recuperados.
- Dominio cerrado: el índice cubre 58 documentos y 906 pasajes; fuera de ese corpus el sistema se abstiene.
- Idioma único: solo italiano; no se documenta cobertura multilingüe.
- Sin datos publicados sobre sesgos, alucinación medida con benchmarks estándar, contexto máximo ni comportamiento en producción a escala.
- Licencia CC0-1.0: permite uso comercial y modificación sin restricciones atribucionales, pero el autor no ofrece garantías sobre el comportamiento del modelo.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.
- No se especifica pipeline en Hugging Face ni se documentan formatos alternativos a safetensors para inferencia optimizada.
- El repositorio incluye código de servidor y cliente web, por lo que su evaluación de seguridad debe cubrir también esos componentes, no solo los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mortxm/lligma-tutor
- DeepTutor (referencia de sistemas de tutoría open source): https://www.scriptbyai.com/deeptutor-ai-learning-assistant/
