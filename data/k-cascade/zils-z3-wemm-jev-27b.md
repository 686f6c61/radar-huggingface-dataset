# k-cascade/zils-z3-wemm-jev-27b

## Resumen

Zils d3 soup body: WeMM-JEV (27B) es un reempaquetado del modelo Rover00/WeMM-JEV, publicado por el usuario k-cascade bajo el paraguas del subred Zils (Bittensor SN127), pool `d3`. No se trata de un modelo entrenado desde cero ni de un fine-tuning: el autor declara explícitamente que los pesos de lenguaje son los del modelo original, sin modificar, y que los únicos cambios introducidos son el renombrado de tensores y la reorganización de los shards para adaptarlos al formato "soup body" que consume la subred. Los tensores `lm_head` y `mtp` no se incluyen en este repositorio.

El modelo cuenta con 26.085.330.160 parámetros según los safetensors publicados (aproximadamente 26,1 mil millones), lo que lo sitúa en la franja de los modelos de 27B. El repositorio ocupa 52,2 GB, coherente con pesos en precisión de 16 bits sin la cabeza de lenguaje. La licencia declarada es Apache 2.0, heredada del modelo base.

Su relevancia es acotada y muy específica: sirve como pieza de infraestructura para participantes del subred Zils de Bittensor que necesiten un "cuerpo" compatible con el layout esperado por el pool `d3`. Para cualquier otro uso (inferencia directa, fine-tuning, despliegue en producción) resulta un artefacto incompleto, ya que carece de `lm_head` y no incluye tokenizador, configuración de generación ni documentación sobre el entrenamiento original. No hay descargas ni interacciones registradas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Rover00/WeMM-JEV; no documentada en la informacion proporcionada) |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente BF16/FP16 por el tamano del repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards reempaquetados; sin `lm_head` ni `mtp`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Rover00/WeMM-JEV en la documentacion proporcionada. El nombre del repositorio sugiere un modelo multimodal ("WeMM"), pero este dato no se confirma en la model card. El autor de este reempaquetado no aporta detalles sobre tipo de transformer, mecanismos de atencion, composicion del dataset ni proceso de alineacion (RLHF, DPO u otros).

Lo unico documentado es el proceso de reempaquetado: se parte de la revision `a463f840c9259ff9139ab02181e01f20aca91b4b` del repositorio original y se renombran tensores y se reorganizan los shards para ajustarse al layout "soup body" del subred Zils. Se eliminan los tensores `lm_head` y `mtp`. No hay entrenamiento adicional, destilacion ni mezcla de pesos ("soup" aqui hace referencia al formato de empaquetado, no a model souping).

## Capacidades

- No se documentan capacidades especificas en la informacion disponible.
- Al conservar los pesos de lenguaje del modelo base, heredaria las capacidades de este, pero al carecer de `lm_head` no puede generar texto de forma autonoma sin reintegrar una cabeza de lenguaje compatible.
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Integracion en el subred Zils (Bittensor SN127): el caso de uso principal y documentado. El repositorio existe para proporcionar un cuerpo de pesos con el layout exacto que espera el pool `d3` de la subred, de modo que los nodos participantes puedan cargarlo sin transformaciones adicionales.
- Experimentacion con el ecosistema Bittensor: desarrolladores que investiguen el funcionamiento interno de los subredes pueden usar este artefacto para entender como se estructura un "soup body" y que tensores se conservan y cuales se descartan.
- Reconstruccion del modelo completo: combinando estos shards con un `lm_head` compatible y la configuracion adecuada del modelo base, seria posible reconstruir un modelo funcional para inferencia, aunque requeriria trabajo adicional de integracion no documentado.
- Estudio de reempaquetados: util como ejemplo tecnico de como se renombran tensores y se reorganizan shards entre formatos de publicacion distintos.
- Fine-tuning sobre los pesos de lenguaje: tecnicamente posible si se anade una cabeza de clasificacion o generacion propia, aunque el autor no lo contempla ni lo documenta.
- Archivado y trazabilidad de pesos: sirve como copia de referencia de los pesos del modelo base en una revision concreta, con licencia Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia aritmetica, 26,1 mil millones de parametros en BF16 requieren aproximadamente 52 GB solo para los pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits rondaria los 26 GB y en 4 bits unos 13-14 GB, aunque estas cifras son estimaciones genericas no verificadas para este modelo.
- GPU recomendadas: no disponible. Por tamano, un despliegue en BF16 requeriria multiples GPU de 80 GB (A100, H100) o una configuracion equivalente.
- Cabe en GPU de consumo: no disponible. En cuantizacion agresiva (4 bits) podria ajustarse en GPUs con 16-24 GB de VRAM, pero no hay confirmacion ni herramientas publicadas para este artefacto.
- Opciones de despliegue: no disponible. Al faltar `lm_head` y configuracion, vLLM, TGI, llama.cpp u Ollama no podrian cargarlo directamente sin trabajo previo de reconstruccion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (reempaquetados para subredes Bittensor) ni datos de rendimiento que permitan una comparacion rigurosa con el modelo base u otras alternativas de 27B.

## Limitaciones y advertencias

- Artefacto incompleto para inferencia: la ausencia de `lm_head` y `mtp` impide la generacion de texto directa sin reintegrar componentes externos.
- Sin documentacion del modelo base: no se detallan arquitectura, contexto, idiomas ni datos de entrenamiento, lo que dificulta evaluar su idoneidad para cualquier tarea distinta del uso previsto en la subred.
- Licencia Apache 2.0 heredada: permite uso comercial y modificacion, pero el autor original de los pesos es Rover00/WeMM-JEV y cualquier redistribucion deberia mantener la atribucion correspondiente.
- Riesgo de alucinacion y sesgos: no evaluables sin acceso al modelo funcional ni a su model card original.
- Cero adopcion registrada: sin descargas ni likes, no hay evidencia de comunidad, soporte ni validacion por terceros.
- Fecha de creacion futura en los metadatos (2026-11-04): conviene verificar la integridad del repositorio antes de confiar en el.
- Uso previsto muy restringido: no es un modelo listo para produccion ni para evaluacion comparativa; es una pieza de infraestructura para un subred concreto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/k-cascade/zils-z3-wemm-jev-27b
- Modelo base: https://huggingface.co/Rover00/WeMM-JEV
- Subred Zils (Bittensor SN127): no disponible en la informacion proporcionada
- Paper, blog o demo oficial: no disponible
