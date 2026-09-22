# AnkitAI/tinyjev-0.6b

## Resumen

TinyJev-0.6b es un modelo de decisiones tipadas desarrollado por AnkitAI, afinado a partir de Qwen3-0.6B-Base. A diferencia de un modelo generativo convencional, no produce texto libre: recibe un estado (un ticket, un registro, una linea de log) junto con preguntas y las respuestas candidatas, y devuelve una probabilidad para cada opcion ofrecida. Es, en la practica, un clasificador estructurado con confianza calibrada que se ejecuta en una sola pasada hacia delante.

El modelo tiene 596.049.920 parametros (~596M) y ocupa aproximadamente 1,2 GB en el repositorio. Se apoya en tres tipos de decision: `Choice` (elegir una opcion de una lista), `Noul` (medir si una afirmacion es verdadera) y `Score` (situar el estado en una escala ordenada). Su propuesta de valor es ofrecer juicio sobre lenguaje con umbrales de confianza utilizables, de forma totalmente offline, sobre MLX en Apple Silicon y PyTorch en el resto de plataformas.

Es relevante ahora porque cubre un nicho poco atendido: la toma de decisiones barata y local dentro de pipelines agénticos (enrutado, triaje, escalado), donde no se necesita generacion de texto sino una puntuacion calibrada y reproducible. El autor lo situa explicitamente como un modelo de clase 0.6B y no de clase 4B, alineado con el ancla publica de su mismo tamano en las suites de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con cabeza pointer de decision |
| Parametros totales | 596.049.920 (~596M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion de 8 bits en MLX al cargar; fp16 por defecto en PyTorch; no se documentan GGUF ni otras |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (backbone fp16 + `head.safetensors` para la cabeza de decision) |

## Arquitectura y entrenamiento

La base es un `Qwen3Model` estandar en fp16 (decoder-only), sobre el que se anade una cabeza pointer que convierte los estados ocultos en respuestas calibradas. La cabeza de decision se distribuye por separado en `head.safetensors`, mientras que `AutoModel.from_pretrained` carga unicamente el backbone. El entrenamiento consistio en un ajuste LoRA de rango 16 con learning rate 5e-5, fusionado despues de vuelta en el modelo base. Los datos proceden del split `decision-v7` del conjunto publico `jaredpalmer/kev-suites`, y no se utilizo ninguna fuente de transferencia reservada durante el entrenamiento. En inferencia se aplica una temperatura ajustada de 1,46.

El diseno de la cabeza pointer y las suites de evaluacion provienen del proyecto Kev de Jared Palmer, y la interfaz de decisiones tipadas sigue a Jev de TypeSafe. El autor probo otras tres configuraciones que resultaron peores: ajuste completo, destilacion desde un profesor de 4B y un encoder de 149M. Una innovacion operativa destacable es que el modelo puntua opciones en lugar de generar, lo que elimina la posibilidad de respuestas fuera del conjunto ofrecido y hace que la confianza sea directamente interpretable en umbrales.

## Capacidades

- Puntuacion de opciones (`Choice`): asigna una probabilidad a cada alternativa de una lista y permite seleccionar la mas probable.
- Verificacion de afirmaciones (`Noul`): estima si un enunciado es verdadero o falso.
- Puntuacion en escala ordenada (`Score`): situa un estado en un rango como "calmado", "frustrado", "muy enfadado".
- Confianza calibrada: el autor reporta un error de calibracion (ECE) de 0,082 en el test, de modo que un umbral de confianza tiene un significado medible.
- Multiples preguntas en una sola pasada hacia delante (por ejemplo, tres preguntas por ticket).
- Ejecucion totalmente offline, con soporte de cuantizacion de 8 bits en MLX al cargar.
- Servicio HTTP mediante `tinyjev serve` con el esquema System One (`POST /v1/systemone` en 127.0.0.1:8077).
- No incluye generacion de texto, tool calling, razonamiento multi-paso ni capacidades multimodales.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y devuelve probabilidades por equipo ("returns", "shipping", "billing") mas un indicador `Noul` de escalado y un `Score` de enfado, todo en una sola pasada. El demo del autor procesa 8 tickets reales con tres preguntas cada uno a unos 110 ms por ticket en una M1 base.
- Enrutado con puerta de confianza: cuando la probabilidad se reparte entre varias opciones (por ejemplo, 0,14 en un ticket ambiguo), se deriva a una persona en lugar de adivinar, lo que reduce errores en flujos automaticos.
- Moderacion y clasificacion de contenido: uso de `Choice` para asignar categorias y `Score` para graduar severidad, con umbrales calibrados en lugar de etiquetas binarias rigidas.
- Analisis de sentimiento o urgencia sobre logs y registros de aplicacion: `Score` permite colocar cada linea en una escala ordenada de severidad o tono.
- Verificacion de hechos simples en pipelines de datos: `Noul` mide si una afirmacion concreta se sostiene en funcion del estado aportado, util para filtrado previo.
- Preprocesado de agentes: actuar como capa de decision barata y local que decide que herramienta o rama debe activarse antes de invocar un modelo generativo mayor.
- Clasificacion en el borde o en portatil: al ocupar ~1,2 GB y funcionar offline en Apple Silicon o CPU/GPU con PyTorch, encaja en entornos sin conectividad o con requisitos de privacidad estrictos.

## Benchmarks y rendimiento

Datos aportados en la model card (harness upstream sobre la suite congelada; lectura unica del test):

| Modelo | transfer-v4 dev | transfer-v4 test | ECE en test |
|---|---|---|---|
| tinyjev-0.6b | 0,625 | 0,663 | 0,082 |
| Ancla publica de mismo tamano | 0,620 | 0,642 | — |

El autor indica que tinyjev-0.6b iguala al ancla publica de su mismo tamano y se situa ligeramente por delante en el test bloqueado, con menor error de calibracion. No se han publicado otros resultados (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2 GB en fp16; en torno a 600 MB con cuantizacion de 8 bits en MLX.
- Cabe holgadamente en GPU de consumo (RTX 3060, RTX 4090 y similares) y en Apple Silicon; el demo se ejecuta en una M1 base a unos 110 ms por ticket.
- GPU de centro de datos (A100, H100) no son necesarias para este tamano, aunque pueden usarse para despliegue en lote.
- Opciones de despliegue: MLX en Apple Silicon (`pip install 'tinyjev[mlx]'`), PyTorch en el resto (`pip install 'tinyjev[torch]'`), y servidor HTTP propio mediante `tinyjev serve`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~110 ms por ticket con tres preguntas por ticket en una M1 base, segun el autor. No se aportan cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tinyjev-0.6b | ~596M | Decisiones tipadas / clasificacion con confianza calibrada | no disponible | MIT | HuggingFace, PyPI |
| Qwen3-0.6B-Base | ~600M (clase) | Generacion de texto (modelo base) | no disponible en esta ficha | Apache-2.0 | HuggingFace |
| Ancla publica de mismo tamano | mismo tamano | Decisiones / clasificacion | no disponible | no disponible | no disponible |

La comparacion directa con alternativas equivalentes de decision es limitada porque la model card solo menciona un "ancla publica de mismo tamano" sin identificarla ni enlazarla. Frente a Qwen3-0.6B-Base, la diferencia no es de rendimiento bruto sino de proposito: tinyjev no genera texto y solo puntua opciones. No se dispone de datos de benchmarks comparables con otros clasificadores de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No genera texto: no puede responder nada que no este entre las opciones o preguntas ofrecidas, lo que es una restriccion de diseno, no un fallo.
- El autor advierte que, ante estados ya estructurados y numericos, el modelo deja de discriminar; su competencia es el juicio sobre lenguaje.
- Rendimiento de clase 0.6B: el propio autor indica que "no es de clase 4B y no pretende serlo".
- Conviene usar la puerta de confianza en entradas alejadas de lo visto en entrenamiento (el autor cita explicitamente el caso del demo con 0,14 de confianza).
- Solo soporta ingles (`language: [en]`); no se documenta soporte multilingue.
- Riesgo de alucinacion: reducido por diseno al no generar texto, pero las probabilidades pueden estar mal calibradas fuera de la distribucion de entrenamiento.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la model card.
- Licencia MIT, que permite uso comercial; el backbone Qwen3-0.6B-Base es Apache-2.0 y los componentes Kev y Jev son Apache-2.0, por lo que conviene revisar las atribuciones correspondientes.
- El repositorio registra 0 descargas y 0 likes en la fecha de consulta, lo que indica un modelo muy reciente y con poca validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnkitAI/tinyjev-0.6b
- Repositorio GitHub: https://github.com/ankit-aglawe/tinyjev
- Paquete PyPI: https://pypi.org/project/tinyjev/
- Ejemplos: https://github.com/ankit-aglawe/tinyjev/tree/main/examples
- Modelo base Qwen3-0.6B-Base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Proyecto Kev (Jared Palmer): https://github.com/jaredpalmer/kev
- Interfaz Jev de TypeSafe: https://docs.typesafe.ai/introduction
- Dataset de entrenamiento: https://huggingface.co/datasets/jaredpalmer/kev-suites
- Busqueda web: no se encontraron resultados relevantes sobre este modelo; las consultas devolvieron unicamente sitios de pasatiempos y quiz sin relacion.
