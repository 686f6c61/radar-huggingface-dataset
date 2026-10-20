# MemTensor/MemT-1.0-Flash

## Resumen

MemT-1.0-Flash es un modelo de lenguaje de 287.943.175.511 parámetros (~288B) desarrollado por MemTensor, construido mediante fine-tuning sobre el backbone DeepSeek-V4-Flash. Su propuesta central no es tanto el backbone como la incorporación de un bloque de memoria nativa que forma parte del propio cómputo del modelo: un Local Memory Block dinámico y un Hyper Memory Block con proyecciones y puertas entrenables que permiten retener y reutilizar información histórica sin volver a acceder al contexto original durante la inferencia.

El modelo pertenece a la familia MemT-1.0, junto con MemT-1.0-Nano (36B totales, 3B activos, backbone Qwen3.6-35B-A3B). En Flash, el backbone aporta 17B parámetros activos y se le añaden 3,61B parámetros de memoria entrenable, con un estado de memoria dinámico de 336M. Según el autor, el estado persistente mantiene un tamaño constante y reduce el almacenamiento aproximadamente 66× frente a un KV cache de contexto completo con 128K de historial.

Es relevante ahora porque ataca uno de los cuellos de botella prácticos de los agentes y asistentes de largo horizonte: el coste de arrastrar historial en el contexto. MemT-1.0-Flash se publica con licencia MIT, requiere código personalizado (`trust_remote_code`) y expone una API de sesiones con memoria latente, guardado y reanudación de estado en safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con backbone Mixture-of-Experts (DeepSeek-V4-Flash) más Native Memory Block (Local Memory Block + Hyper Memory Block) |
| Parámetros totales | 287.943.175.511 (~288B) |
| Parámetros activos | 17B |
| Parámetros de memoria entrenable | 3,61B |
| Estado de memoria dinámico | 336M |
| Longitud de contexto | No disponible de forma explícita; la model card referencia historiales de 128K al comparar el estado de memoria con un KV cache de contexto completo |
| Tipos de cuantización | No disponible; el único formato documentado en los ejemplos de carga es bfloat16 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 576,0 GB); requiere `custom_code` y `trust_remote_code=True` |
| Librería | transformers (probado con 5.12.1), accelerate 1.15.0, safetensors 0.8.0 |
| Modelo base | deepseek-ai/DeepSeek-V4-Flash |

## Arquitectura y entrenamiento

La arquitectura mantiene el backbone tipo transformer con mezcla de expertos de DeepSeek-V4-Flash y le superpone un Native Memory Block que se ejecuta en paralelo a la atención del backbone. Ese bloque consta de dos piezas: un Local Memory Block que mantiene una matriz de memoria multicanal dinámica y evoluciona entre pasos de interacción, y un Hyper Memory Block con proyecciones entrenables de query, key y value de memoria, puertas de borrado, escritura y olvido, y una puerta de salida. Durante la generación, la atención sobre memoria lee el estado actual, normaliza y aplica gating a la lectura, y suma el resultado a la salida de la atención del backbone. Al final de cada turno o segmento, un GDN-2 estable realiza actualizaciones de memoria a nivel de token para los pasos siguientes. El autor añade Mixture-of-Storage (MoS) para escalar la capacidad de memoria.

El entrenamiento se describe como un pipeline de dos etapas precedido de una preparación del backbone, con 34B tokens de datos y infraestructura dedicada. La model card no detalla la composición del dataset ni si hubo RLHF o DPO, por lo que esos puntos quedan como no disponibles. La innovación diferencial frente a un transformer convencional es que la memoria persistente es un estado latente de tamaño constante, no un texto reintroducido en el prompt ni un KV cache creciente: la model card indica que, con `enable_memory=True`, la información de los turnos pasados se guarda en memoria local latente y se vacía el contexto de conversación en texto plano.

## Capacidades

- Generación de texto y conversación multi-turno mediante una API de sesiones (`create_session`).
- Memoria latente persistente: los turnos previos se almacenan en el estado de memoria y se recuperan por atención sobre memoria, sin reenviar el historial como texto.
- Serialización del estado: `save_state` guarda la memoria local, incluidas las conversaciones pendientes, en un fichero safetensors reanudable.
- Modo de razonamiento conmutable mediante el parámetro `enable_thinking` en las llamadas de chat.
- Agentes de codificación guiados por experiencia: el marco propuesto almacena experiencia procedimental recuperada en la memoria nativa y la consulta durante la ejecución, sin añadir el texto de la experiencia al contexto de la tarea.
- Actualización de memoria a nivel de token entre turnos o segmentos mediante GDN-2.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Capacidades multimodales (visión, audio): no documentadas.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Asistentes personales de largo plazo: el modelo mantiene un perfil de usuario (preferencias, datos recurrentes) en memoria latente y lo consulta en turnos posteriores sin reenviar el historial completo, lo que reduce el coste por token de entrada en conversaciones extensas.
- Agentes de codificación en tareas de horizonte largo: se almacena experiencia procedimental de ejecuciones previas en la memoria nativa y se recupera mediante atención sobre memoria durante la resolución del problema, sin contaminar el contexto de la tarea con texto de experiencia.
- Atención al cliente multi-turno: la ventana de historial puede crecer hasta 128K mientras el estado persistente se mantiene constante, con una reducción declarada de ~66× en almacenamiento frente al KV cache completo.
- Agentes multi-paso con estado entre pasos: el estado de memoria se guarda y se reanuda desde disco (`save_state`), lo que permite pausar y retomar flujos de agente sin reconstruir el contexto textual.
- Flujos con requisitos de minimización de datos: al vaciar el contexto en texto plano y conservar la información como estado latente, encaja en escenarios donde no se quiere retener transcripciones literales de la conversación.
- Investigación en memorias paramétricas: sirve como referencia para comparar mecanismos de memoria nativa frente a sistemas de memoria textual en los 11 benchmarks de memoria reportados por el autor.
- Copilotos de documentación técnica: indexación de decisiones y convenciones de un proyecto en memoria persistente para consultas posteriores sin recuperación externa.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card únicamente reporta posiciones relativas: en 11 benchmarks de memoria, MemT-1.0-Flash y MemT-1.0-Nano ocupan el primer y segundo puesto, respectivamente, entre los métodos de memoria paramétrica evaluados. El propio autor advierte de que los sistemas de memoria textual fuertes siguen por delante en la comparación global, especialmente en historiales largos que exigen recuperación detallada de evidencia.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 576 GB solo para pesos (coincide con el tamaño del repositorio), más KV cache y activaciones.
- GPU recomendadas: 8×H200 (141 GB) o 16×H100 (80 GB) para bfloat16 con margen operativo. 8×H100 80 GB (640 GB) queda muy ajustado y probablemente insuficiente al sumar estado de memoria y activaciones.
- Cuantización: no se documentan tipos soportados. Una hipotética cuantización a 4 bits dejaría los pesos en ~144 GB, todavía fuera del alcance de GPU de consumo y sin soporte oficial confirmado.
- GPU de consumo: no cabe en RTX 4090, RTX 5090 ni similares, ni siquiera en configuraciones multi-GPU de 24-32 GB.
- Despliegue: la vía documentada es transformers con `trust_remote_code=True`, `dtype=torch.bfloat16`, `device_map="auto"`, `attn_implementation="eager"`, accelerate y CUDA 13 con PyTorch 2.11.0. No hay confirmación de soporte en vLLM, llama.cpp, Ollama, TGI ni SGLang.
- Latencia y throughput: no disponibles. El uso obligado de atención eager en los ejemplos de carga sugiere que no se está aprovechando un kernel de atención optimizado tipo FlashAttention.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Memoria entrenable | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MemT-1.0-Flash | ~288B | 17B | 3,61B (+336M de estado) | No disponible (referencia a 128K) | MIT | Pesos en HuggingFace, 576 GB |
| MemT-1.0-Nano | 36B | 3B | 451M (+10M de estado) | No disponible | No disponible en la información | Pesos en la colección MemT-1.0 |
| DeepSeek-V4-Flash (base) | No disponible | No disponible | No aplica (sin memoria nativa) | No disponible | No disponible en la información | Pesos en HuggingFace |

Frente a su modelo base, la diferencia relevante es la incorporación de memoria nativa entrenable y la reducción de almacenamiento declarada, no un cambio de escala. Frente a Nano, Flash multiplica por ocho los parámetros totales y por 5,7 los activos, con un estado de memoria dinámico 33 veces mayor.

## Limitaciones y advertencias

- Los sistemas de memoria textual siguen superando al modelo en historiales largos que requieren recuperación detallada de evidencia, según reconoce el propio autor.
- Riesgo de alucinación no cuantificado: no se publican evaluaciones de factualidad ni tasas de error en la información disponible.
- Idiomas soportados no documentados; no hay garantía de rendimiento fuera de los idiomas cubiertos por el backbone, que tampoco se detallan.
- Longitud de contexto no especificada de forma explícita para el modelo; la cifra de 128K aparece asociada a la comparación de almacenamiento, no a una ficha de ventana de contexto.
- `trust_remote_code=True` es obligatorio, lo que implica ejecutar código del autor en el entorno de inferencia; conviene auditar el repositorio antes de desplegarlo en producción.
- La licencia MIT permite uso comercial, pero se heredan las condiciones del modelo base DeepSeek-V4-Flash, cuya licencia no se detalla en la información proporcionada.
- El estado de memoria es un artefacto sensible: `save_state` persiste información de conversación en safetensors y debe tratarse con los mismos controles de privacidad que un historial en texto plano.
- Sin soporte confirmado en motores de inferencia habituales (vLLM, TGI, llama.cpp), el despliegue a escala queda limitado a transformers y a la atención eager.
- Con 25 descargas registradas, la validación externa de la comunidad es prácticamente inexistente en el momento de redactar esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MemTensor/MemT-1.0-Flash
- Informe técnico (PDF): https://arxiv.org/pdf/2610.26825
- Repositorio GitHub: https://github.com/MemTensor/MemT-1.0
- Colección MemT-1.0: https://huggingface.co/collections/MemTensor/memt-1
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
