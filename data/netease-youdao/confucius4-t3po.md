# netease-youdao/Confucius4-T3PO

## Resumen

Confucius4-T3PO es un modelo de traducción automática simultánea (SiMT, *simultaneous machine translation*) de tipo texto a texto, desarrollado por el equipo de IA de NetEase Youdao. Se construye mediante *fine-tuning* del modelo base Qwen2.5-14B, del que hereda la arquitectura transformer densa y sus 14.770.033.664 parámetros. Su particularidad es que no traduce secuencias completas, sino que recibe fragmentos de texto muy finos (a nivel de carácter o palabra) y decide en cada paso si esperar más contexto (`READ`) o emitir ya un fragmento de traducción (`WRITE`), manteniendo un prefijo estable que nunca se reescribe.

El modelo resuelve el problema clásico de la traducción simultánea: el compromiso entre calidad y latencia. Para ello, el equipo propone dos técnicas: un algoritmo de construcción automática de datos alineados por segmentos que deriva corpus de traducción en *streaming* de baja latencia a partir de corpus paralelos convencionales, y un algoritmo de aprendizaje por refuerzo consciente de la frontera de Pareto (de ahí el nombre, *simulTaneous Translation via pareTo Policy Optimization*) que optimiza conjuntamente calidad y latencia. El resultado es un modelo que puede operar en varios niveles de latencia ajustables (`low`, `native`, `high`).

Es relevante ahora porque cubre un nicho poco atendido con modelos abiertos: la interpretación simultánea en tiempo real entre chino e inglés, con licencia Apache 2.0, pesos abiertos y un protocolo de *streaming* documentado. Además, conserva la capacidad general de seguimiento de instrucciones de Qwen2.5-14B, lo que permite apilar encima funcionalidades como restricciones terminológicas, y se puede encadenar con un modelo ASR en *streaming* (R2T2, del mismo equipo) para construir un pipeline de voz a texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-14B) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes GGUF publicadas en la informacion disponible) |
| Idiomas soportados | chino (zh) e ingles (en); generalizacion observada a japones-chino sin evaluacion rigurosa |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-14B, un transformer denso *decoder-only*, y lo adapta a traducción simultánea mediante un pipeline de tres etapas descrito por el autor: (1) construccion de datos de alta calidad alineados por segmentos, (2) *cold start* en *streaming* del modelo de traduccion y (3) aprendizaje por refuerzo con conciencia de Pareto para la optimizacion conjunta de calidad y latencia. La primera etapa genera automaticamente datos de traduccion en *streaming* de baja latencia a partir de corpus paralelos convencionales, de modo que el modelo adquiere un prior adaptado al *streaming* sin depender de corpus de interpretacion humana.

La innovacion principal es el algoritmo de RL que optimiza la frontera calidad-latencia. Segun el autor, frente a GRPO estandar, su metodo explora y mejora de forma mas efectiva la frontera de Pareto y evita regimenes de latencia extremadamente baja en los que la calidad de traduccion colapsa, manteniendo la estabilidad del entrenamiento. El modelo organiza la secuencia de entrada bajo un protocolo de historial intercalado que preserva un prefijo estable, lo que habilita la reutilizacion de la KV-cache y reduce el coste computacional redundante. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas como RLHF o DPO al margen del RL descrito; el autor remite a un informe tecnico futuro para los detalles de metodo, datos e implementacion.

## Capacidades

- Traduccion simultanea de texto en *streaming*: acepta entrada por fragmentos finos a nivel de caracter y palabra.
- Decisiones dinamicas `READ`/`WRITE`: tras cada fragmento decide si esperar mas contexto o emitir traduccion incremental.
- Traduccion append-only: los fragmentos ya comprometidos nunca se reescriben, lo que garantiza estabilidad en la salida en tiempo real.
- Modos de latencia ajustables: varios niveles calidad-latencia (`low`, `native`, `high`) para distintos escenarios de interpretacion.
- Reutilizacion de KV-cache mediante protocolo de historial intercalado con prefijo estable.
- Conservacion de la capacidad general de seguimiento de instrucciones de Qwen2.5-14B, lo que permite funcionalidades adicionales como restricciones terminologicas.
- Generalizacion cross-lingue parcial: se observa traduccion simultanea japones-chino pese a no haber sido entrenada, aunque sin evaluacion rigurosa fuera de chino-ingles.
- Traduccion texto a texto unicamente; no soporta entrada de audio de forma nativa, aunque puede encadenarse con un ASR en *streaming* (R2T2) para un pipeline voz a texto.

## Casos de uso

- Interpretacion simultanea en reuniones y conferencias: el modelo recibe la transcripcion por fragmentos y emite traduccion incremental con latencia controlada, adecuado para subtitulado en directo entre chino e ingles con el modo `low` o `native`.
- Subtitulado en tiempo real de retransmisiones: al ser append-only y reutilizar KV-cache, mantiene una salida estable que no se reescribe, lo que evita parpadeos en el subtitulo mostrado al espectador.
- Pipeline de interpretacion de voz: encadenado con el ASR en *streaming* R2T2 del mismo equipo, se construye un sistema voz a texto para interpretacion simultanea sin necesidad de un modelo multimodal nativo.
- Atencion al cliente multilingue en chat: integrado en un backend de mensajeria, traduce mensajes entrantes en chino o ingles a medida que se escriben, con la ventaja de conservar el seguimiento de instrucciones del modelo base para aplicar tono o formato.
- Traduccion con restricciones terminologicas: gracias a que el *fine-tuning* no degrada la capacidad de instrucciones de Qwen2.5-14B, se pueden imponer glosarios y terminos obligatorios en dominios tecnicos o legales mediante prompts.
- Despliegue local de demostracion: el repositorio de GitHub ofrece una Web UI y un cliente de *streaming* desplegables localmente, utiles para prototipar productos de traduccion en tiempo real sin depender de APIs comerciales.
- Investigacion en traduccion simultanea: sirve como linea base abierta (Apache 2.0) para experimentar con politicas de latencia, recompensas de RL y protocolos de *streaming* sobre un modelo de 14B.

## Benchmarks y rendimiento

El autor evalua el modelo en benchmarks publicos de traduccion simultanea chino-ingles e ingles-chino, comparandolo con los modelos abiertos InfiniSST y EAST, y con dos sistemas comerciales de traduccion simultanea denominados A y B. La comparacion externa cubre los niveles `low`, `native` y `high` y se presenta graficamente como COMET frente a *word-CW* (latencia media por palabra). No se proporcionan en la informacion disponible los valores numericos concretos de estas graficas, por lo que no se reproducen cifras.

| Benchmark | Metrica | Resultado |
|---|---|---|
| Comparacion externa (InfiniSST, EAST, comerciales A y B) | COMET vs. word-CW | solo figura; valores numericos no disponibles |
| Frontera de entrenamiento (frente a GRPO) | COMET vs. longitud media de segmento | solo figura; valores numericos no disponibles |

No se han publicado resultados numericos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano, un modelo denso de 14,77B en FP16 requiere aproximadamente 29,6 GB de pesos (coincide con el tamano del repo), a los que hay que sumar la KV-cache y el *overhead* del runtime.
- GPU recomendadas: no especificadas por el autor. Por tamano, cabria esperar A100 40/80 GB, H100 o L40S para FP16; en consumer, RTX 4090 (24 GB) no admite FP16 completo y requeriria cuantizacion o *offloading*.
- Cabe en consumer GPU: solo con cuantizacion (p. ej. 8 bits o inferior) o reparto entre varias GPU; no se publican variantes GGUF en la informacion disponible.
- Opciones de despliegue: `transformers` (libreria declarada), `text-generation-inference` (tag del repo) y endpoints compatibles; el repositorio de GitHub incluye codigo de inferencia, Web UI y cliente de *streaming*.
- Latencia y throughput estimados: no disponibles. La latencia se controla a nivel de politica (`low`/`native`/`high`) y se mide en los benchmarks como *word-CW*, pero no se publican cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Confucius4-T3PO | 14,77B | no disponible | SiMT texto a texto con RL sobre frontera de Pareto | Apache 2.0 | Hugging Face, ModelScope, demo online, GitHub |
| InfiniSST | no disponible | no disponible | SiMT (referencia de comparacion del autor) | no disponible | paper ACL Findings 2025 |
| EAST | no disponible | no disponible | SiMT (referencia de comparacion del autor) | no disponible | paper ACL Findings 2025 |
| Sistema comercial A | no disponible | no disponible | SiMT comercial | propietaria | servicio comercial |
| Sistema comercial B | no disponible | no disponible | SiMT comercial | propietaria | servicio comercial |

Los datos de parametros, contexto y licencia de InfiniSST y EAST no se detallan en la informacion proporcionada; el autor solo los emplea como referencias de evaluacion. La ventaja diferencial de Confucius4-T3PO frente a ellos es la disponibilidad de pesos abiertos con licencia Apache 2.0 y un protocolo de *streaming* documentado.

## Limitaciones y advertencias

- Solo traduce entre chino e ingles de forma entrenada; la generalizacion a otras direcciones (p. ej. japones-chino) no ha sido evaluada rigurosamente y no deberia asumirse en produccion.
- Es un modelo texto a texto: no acepta audio de forma nativa; requiere un ASR externo en cascada para voz.
- Riesgo de alucinacion y de deriva en traducciones de baja latencia: el propio autor senala que regimenes de latencia extremadamente baja provocan colapso de calidad, motivo por el que el RL evita esas zonas.
- La salida es append-only: una vez emitido un fragmento no se corrige, de modo que errores tempranos se propagan al resto de la frase.
- Sesgos: no se documentan sesgos especificos en la informacion disponible; al derivar de Qwen2.5-14B, puede heredar sesgos del corpus del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-14B y de los datos de entrenamiento, no detalladas en la informacion disponible.
- No se publican cifras de contexto maximo, cuantizaciones soportadas ni requisitos de hardware, lo que dificulta el dimensionamiento previo a un despliegue en produccion.
- El informe tecnico con detalles de metodo, datos e implementacion esta anunciado pero no disponible en el momento de redactar esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netease-youdao/Confucius4-T3PO
- Modelo en ModelScope: https://modelscope.cn/models/netease-youdao/Confucius4-T3PO
- Repositorio de codigo de inferencia: https://github.com/netease-youdao/Confucius4-T3PO
- Demo online: https://t3po.youdao.com
- Modelo ASR en streaming R2T2: https://huggingface.co/netease-youdao/Confucius4-R2T2
- Paper InfiniSST: https://aclanthology.org/2025.findings-acl.157.pdf
- Paper EAST: https://aclanthology.org/2025.findings-acl.1045.pdf
- Modelo base Qwen2.5-14B: https://huggingface.co/Qwen/Qwen2.5-14B
