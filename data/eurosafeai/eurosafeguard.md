# EuroSafeAI/EuroSafeGuard

## Resumen

EuroSafeGuard es un guardrail open source desarrollado por EuroSafeAI que combina clasificadores constitucionales con una sonda (probe) de activaciones para filtrar tanto las peticiones que recibe un modelo de lenguaje como las respuestas que genera. El sistema se apoya en una constitucion escrita de once categorias de dano (CBRN, ciberataque, dano a menores, manipulacion danina, discurso de odio, actividades ilegales, integridad informativa, dano fisico, privacidad, autolesion y contenido sexual) y genera datos de entrenamiento a partir de ella. Se distribuye como adaptadores PEFT (LoRA) y cabezas de clasificacion sobre dos modelos base: Qwen3.5-9B para los clasificadores de entrada e intercambio, y Llama-3.1-8B-Instruct para la sonda de activaciones.

La innovacion principal es su politica de decision "alert-unless-CBRN": las peticiones marcadas como CBRN se rechazan directamente, mientras que el resto de peticiones marcadas se responden bajo una nota de sistema de alerta que indica al modelo protegido que no debe proporcionar. Esto reduce drasticamente el exceso de rechazo (del 37% al 5-9% en peticiones benignas pero sensibles) sin sacrificar proteccion en las categorias mas criticas. La arquitectura es modular: una sonda MLP sobre las activaciones de los 32 bloques de Llama-3.1-8B, un clasificador de entrada con cinco semillas de entrenamiento y un clasificador de intercambio que evalua pares prompt-respuesta.

El modelo es relevante ahora porque ofrece una alternativa abierta y calibrada a los guardrails propietarios, con resultados competitivos en benchmarks de deteccion de jailbreaks como BELLS-O y PAIR, y porque su diseno de dos etapas (entrada y salida) permite integrarlo en pipelines de produccion con un coste de latencia declarado de solo el 1,5% sobre el tiempo de generacion en las peticiones escaladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sonda MLP (hidden size 256) sobre activaciones de Llama-3.1-8B-Instruct + clasificadores LoRA con 11 cabezas sigmoideas sobre Qwen3.5-9B |
| Parametros totales | No disponible (adaptadores LoRA y cabezas; el repositorio ocupa 0,6 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuyen adaptadores PEFT en safetensors; la cuantizacion depende de los modelos base) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 para adaptadores, cabezas, sonda y codigo; los modelos base conservan sus licencias (Llama 3.1 Community License y Qwen license) |
| Formato de pesos | Safetensors (adaptadores PEFT/LoRA), mas fichero JSON de umbrales y script Python de carga |

## Arquitectura y entrenamiento

El sistema se compone de tres modulos diferenciados. La sonda (`probe/`) es una MLP de tamano oculto 256 que lee las activaciones de los 32 bloques del modelo protegido (Llama-3.1-8B-Instruct) sobre el prompt formateado como chat; los logits por token se suavizan con una media movil exponencial y la puntuacion del prompt es su maximo. El clasificador de entrada (`gate/seed{0..4}/`) es un adaptador LoRA sobre Qwen3.5-9B con once cabezas sigmoideas, una por categoria de dano, y la puntuacion final es la cabeza mas alta. El clasificador de intercambio (`exchange/`) sigue el mismo esquema pero lee el par `User: <prompt>\n\nAssistant: <reply>`. Las cinco carpetas `gate/seed*` corresponden a cinco ejecuciones de entrenamiento con los mismos datos y distintas semillas, que el paper reporta como media; varian especialmente frente a ataques de busqueda como PAIR, por lo que se recomienda evaluar la semilla que se despliegue.

Los datos de entrenamiento se generan a partir de una constitucion escrita de once categorias de dano, con conjuntos de prompts y respuestas publicados como `EuroSafeGuard-prompts` y `EuroSafeGuard-replies` (este ultimo con acceso restringido). La decision se articula en dos etapas: la puntuacion de entrada es la media de las puntuaciones de la sonda y del clasificador de entrada, cada una normalizada z-score sobre WildChat-clean, con un umbral (`alert_input_thr`) que marca el 5% de los prompts benignos de WildChat-clean. Una peticion marcada cuya categoria principal sea CBRN se rechaza; cualquier otra peticion marcada se responde bajo una nota de sistema de alerta. En la etapa de salida, el clasificador de intercambio retiene la respuesta si supera `exch_thr_20pct` para peticiones alertadas (umbral mas estricto, que marca el 20% de respuestas benignas) o `exch_thr_1pct` para peticiones no marcadas (marca el 1%).

## Capacidades

- Clasificacion de seguridad de peticiones (prompts) en once categorias de dano: CBRN, ciberataque, dano a menores, manipulacion danina, discurso de odio, actividades ilegales, integridad informativa, dano fisico, privacidad, autolesion y contenido sexual.
- Clasificacion de respuestas generadas por el modelo protegido mediante el clasificador de intercambio, que evalua el par prompt-respuesta.
- Deteccion de jailbreaks y ataques iterativos de caja negra (evaluado frente a PAIR).
- Politica de decision en tres estados: `pass`, `alert` y `refuse`, con generacion automatica de una nota de sistema (`system_note(category)`) que instruye al modelo protegido sobre lo que no debe proporcionar.
- Integracion con modelos protegidos mediante una API de una sola clase (`EuroSafeGuard.from_pretrained` y `route`/`check_reply`).
- Capacidad de ejecutar solo la etapa de entrada con `load_exchange=False`, reduciendo requisitos de memoria.
- Reutilizacion de activaciones cuando el modelo protegido es Llama-3.1-8B-Instruct, evitando un forward pass adicional de la sonda.
- Soporte multilingue limitado: el modelo esta entrenado y etiquetado para ingles; el recall en idiomas de bajos recursos cae al 74% en MSafeTemp.

## Casos de uso

- Moderacion de entrada en asistentes conversacionales: el clasificador de entrada marca peticiones daninas antes de que lleguen al modelo protegido, con un umbral calibrado para marcar solo el 5% de prompts benignos de WildChat-clean, lo que permite filtrar ataques sin degradar la experiencia del usuario.
- Proteccion de modelos desplegados contra jailbreaks iterativos: frente a PAIR, solo el 21% de los comportamientos que rompen el modelo sin proteccion consiguen pasar, frente al 49% del mejor guard abierto alternativo, lo que lo hace adecuado para APIs publicas expuestas a ataques de busqueda.
- Cumplimiento en categorias CBRN: las peticiones marcadas como CBRN se rechazan directamente y, en las pruebas con objetivos quimicos y biologicos transferidos a tres modelos objetivo, como maximo el 1,1% consiguen pasar en cada configuracion, lo que lo hace util para entornos con requisitos regulatorios estrictos.
- Moderacion de salida en pipelines de generacion: el clasificador de intercambio retiene respuestas que superan el umbral estricto (20% de respuestas benignas marcadas para peticiones alertadas, 1% para no marcadas), lo que permite un filtrado de dos etapas sin bloquear respuestas legitimas.
- Reduccion del exceso de rechazo en atencion al cliente: el modo alerta responde bajo nota de sistema en lugar de rechazar, bajando los rechazos de peticiones benignas pero sensibles del 37% al 5-9%, lo que mejora la utilidad en dominios como salud, legal o seguridad donde las consultas son sensibles pero legitimas.
- Investigacion en clasificadores constitucionales: la publicacion de cinco semillas de entrenamiento, los conjuntos de prompts y respuestas y el codigo de carga en un solo fichero facilitan la reproducibilidad y la comparacion de variantes de calibracion.
- Despliegue en produccion con coste de latencia bajo: el guardrail completo anade solo un 1,5% al tiempo de generacion en las peticiones que escala, lo que permite integrarlo en pipelines existentes sin rearquitecturar la infraestructura.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| BELLS-O (entrada) | Detecta mas prompts daninos que cualquier supervisor del leaderboard con una tasa de falsos positivos cercana al 1% | Mayor recall en los conjuntos de jailbreak retenidos |
| PAIR (ataque iterativo de caja negra) | 21% de los comportamientos que rompen el modelo sin proteccion consiguen pasar | Presupuesto del 5% sobre WildChat-clean; el mejor guard abierto alternativo deja pasar el 49% |
| Objetivos quimicos y biologicos (tres modelos objetivo) | Como maximo el 1,1% consiguen pasar en cada configuracion | Transferencia a tres modelos objetivo |
| Modo alerta vs rechazo total | Rechazos de peticiones benignas sensibles bajan del 37% al 5-9%; como maximo el 3,6% de objetivos quimicos y biologicos pasan en cinco modelos protegidos | Politica alert-unless-CBRN |
| Latencia | Anade un 1,5% al tiempo de generacion en las peticiones escaladas | Guardrail completo |
| MSafeTemp (multilingue) | Recall del 74% en idiomas de bajos recursos | Por debajo de varios guards alternativos |

Los numeros son medias sobre las cinco semillas del clasificador de entrada; las tablas completas, jueces y presupuestos estan en el paper.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16 GB de GPU para Llama-3.1-8B (la sonda) mas aproximadamente 19 GB por cada clasificador Qwen3.5-9B (entrada e intercambio); el despliegue completo requiere del orden de 54 GB si se cargan los tres modulos en memoria.
- GPU recomendadas: A100 (40 GB o 80 GB) o H100 para el despliegue completo con los tres modulos; una RTX 4090 (24 GB) no es suficiente para el conjunto completo pero puede alojar uno de los modulos por separado.
- Cabe en GPU de consumo: parcialmente; con `load_exchange=False` se ejecuta solo la etapa de entrada, lo que reduce los requisitos a la sonda mas un clasificador (aproximadamente 35 GB, aun por encima de una RTX 4090 de 24 GB salvo cuantizacion de los modelos base).
- Opciones de despliegue: el repositorio incluye un cargador de un solo fichero (`eurosafeguard.py`) que requiere `torch`, `transformers` con soporte de Qwen3.5, `peft`, `safetensors` y `huggingface_hub`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: el guardrail completo anade un 1,5% al tiempo de generacion en las peticiones escaladas; no se publican cifras absolutas de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EuroSafeGuard | Adaptadores LoRA sobre Qwen3.5-9B y sonda sobre Llama-3.1-8B | No disponible | Clasificadores constitucionales + sonda de activaciones, politica alert-unless-CBRN | Apache-2.0 (adaptadores y codigo) | Hugging Face, 0 descargas, 1 like |
| Mejor guard abierto alternativo en PAIR | No disponible | No disponible | No disponible | No disponible | No disponible (49% de comportamientos daninos pasan frente al 21% de EuroSafeGuard) |
| Supervisores de BELLS-O | No disponible | No disponible | No disponible | No disponible | Leaderboard publico (EuroSafeGuard detecta mas prompts daninos a falsos positivos cercanos al 1%) |
| Modelos dedicados de moderacion (ToxicChat, OpenAI Moderation) | No disponible | No disponible | Moderacion general | No disponible | Por delante de EuroSafeGuard en moderacion general segun la model card |

No se dispone de datos detallados de parametros, contexto ni licencia de los modelos comparables en la informacion proporcionada; la comparacion se limita a los resultados relativos reportados en la model card.

## Limitaciones y advertencias

- Idiomas de bajos recursos: el recall en prompts daninos multilingues (MSafeTemp) cae al 74%, por debajo de varios guards alternativos; el modelo esta etiquetado unicamente para ingles.
- Moderacion general: en benchmarks de moderacion como ToxicChat u OpenAI Moderation, los modelos dedicados de moderacion siguen por delante.
- Exceso de rechazo: la etapa de entrada marca una fraccion de peticiones benignas pero sensibles; el modo alerta responde a la mayoria, pero no sustituye a una verificacion de falsos positivos sobre el trafico propio.
- Politica fija: los umbrales estan calibrados sobre WildChat-clean; si el trafico difiere, es necesario recalibrar sobre trafico benigno propio.
- No es una defensa completa: ningun guardrail detiene todos los ataques; se recomienda combinarlo con un modelo entrenado en seguridad, monitorizacion y limites de tasa.
- Variabilidad entre semillas: las cinco ejecuciones de entrenamiento varian, especialmente frente a ataques de busqueda como PAIR, por lo que hay que evaluar la semilla concreta que se despliegue.
- Licencias de los modelos base: los adaptadores y el codigo son Apache-2.0, pero los modelos base conservan la Llama 3.1 Community License y la Qwen license, con posibles restricciones para uso comercial.
- Dependencia de version de transformers: requiere una version con soporte de Qwen3.5, lo que puede limitar la compatibilidad con entornos existentes.
- Datos de acceso restringido: el conjunto `EuroSafeGuard-replies` es gated, lo que dificulta la reproduccion completa por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EuroSafeAI/EuroSafeGuard
- Dataset de prompts: https://huggingface.co/datasets/EuroSafeAI/EuroSafeGuard-prompts
- Dataset de respuestas (gated): https://huggingface.co/datasets/EuroSafeAI/EuroSafeGuard-replies
- Modelo base de los clasificadores: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo base de la sonda: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Paper: arXiv: TODO (no disponible en la informacion proporcionada)
- Codigo: TODO (no disponible en la informacion proporcionada)
