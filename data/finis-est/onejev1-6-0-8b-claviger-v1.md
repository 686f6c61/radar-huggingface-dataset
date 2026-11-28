# finis-est/OneJev1.6-0.8B-Claviger-v1

## Resumen

OneJev1.6-0.8B-Claviger-v1 es un modelo de decisión (no un generador de texto) desarrollado por finis-est como fine-tune completo de OmniJev/OneJev1.6-0.8B, que a su vez deriva de Qwen/Qwen3.5-0.8B. Su función es actuar como árbitro de triaje en canales de Discord multiagente: recibe un mensaje, las cinco intervenciones previas y la lista de agentes presentes, y decide si alguno de ellos debe responder y cuál. Puntúa todas las opciones en un único forward pass y devuelve probabilidades, en lugar de generar una respuesta libre.

El modelo emplea únicamente el decodificador de texto de Qwen3.5 (752 millones de parámetros, 24 capas, bf16), descartando la parte de visión del modelo base. Se presenta como sucesor de Laya-421M-Claviger-v0 y está pensado para integrarse en «citadel», un entorno personal multiagente. Su relevancia radica en que aborda un problema concreto y poco cubierto: evitar que agentes conversacionales interrumpan conversaciones humanas o respondan a mensajes que no van dirigidos a ellos.

La versión actual se ha entrenado exclusivamente con datos sintéticos generados y etiquetados por modelos, y el autor advierte explícitamente de que no se ha probado con tráfico real. Los resultados publicados proceden de conjuntos sintéticos y de dos benchmarks de chat real, por lo que deben interpretarse como optimistas. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5 text decoder), 24 capas, bf16 |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors bf16) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo conserva el decodificador de texto de OneJev1.6-0.8B, un transformer de 24 capas y 752 millones de parámetros en bf16. El fine-tune modifica todos los pesos y el `config.json` resultante contiene únicamente la configuración del modelo de texto, eliminando la torre de visión del modelo base. El tokenizador y las plantillas de chat se mantienen tal como transformers los guardó con el checkpoint.

El entrenamiento se realizó exclusivamente sobre conversaciones sintéticas del dataset finis-est/claviger-triage-synthetic (CC BY 4.0), escritas y etiquetadas por modelos. No se documenta el número de tokens, la composición detallada del dataset ni si hubo RLHF o DPO; el código de entrenamiento no es público. La innovación principal no es arquitectónica sino de formulación: el modelo trata el triaje como una clasificación de opciones puntuadas en un solo paso, con dos parámetros ajustados (`scale = 0.3530499701748905` y umbral `T = 0.985`) calibrados con la regla de activación por mención o respuesta delante.

## Capacidades

- Triaje de mensajes en canales de Discord: decide si un agente debe responder y cuál, entre una lista de agentes presentes.
- Puntuación de opciones en un único forward pass, devolviendo probabilidades en lugar de texto generado.
- Incorporación de contexto conversacional: mensaje actual, hasta cinco mensajes anteriores, menciones, respuestas a agentes y contexto de hilo.
- Distinción entre conversación entre miembros, mensajes dirigidos a otro miembro y mensajes que hablan de un agente sin requerir respuesta.
- Integración con la regla de activación por mención o respuesta: el modelo solo juzga los mensajes que no activan ya esa regla.
- Capacidades multilingües: limitadas al inglés.
- No soporta tool calling, agentes autónomos, generación de texto, visión ni audio.

## Casos de uso

- Triaje en hubs multiagente de Discord: el modelo recibe el canal, el mensaje, los cinco mensajes previos y la lista de agentes, y decide cuál debe intervenir. Es adecuado porque su entrenamiento está centrado exactamente en ese formato de estado.
- Reducción de interrupciones en comunidades con bots: al filtrar mensajes que no van dirigidos a ningún agente, evita que los bots respondan a conversaciones entre personas o a comentarios sobre ellos mismos.
- Enrutado de consultas hacia el agente especializado correcto: cuando varios agentes comparten canal, el modelo elige entre las opciones disponibles en lugar de activar todos a la vez.
- Control de ruido en canales de soporte: con umbral ajustable, permite decidir cuándo un agente debe permanecer en silencio ante mensajes ambiguos o de broma.
- Evaluación previa al despliegue de sistemas multiagente: sirve como componente de referencia para comparar políticas de activación antes de sustituirlas por reglas heurísticas.
- Investigación sobre políticas de intervención conversacional: su formulación como clasificación de opciones con umbral calibrado facilita experimentos reproducibles sobre cuándo debe hablar un agente.
- Integración como guardián detrás de una regla de mención o respuesta: el hub ejecuta primero la regla determinista y el modelo solo evalúa el resto de mensajes.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index. No verificados (`verified: false`). El conjunto de prueba es sintético, generado por modelos Gemini y no público.

| Tarea | Conjunto de prueba | Metrica | Valor |
|---|---|---|---|
| Agent reply triage, behind a mention-or-reply wake rule | fresh5 confirm (sintetico, no publico) | Recall: preguntas respondidas por el agente correcto | 96,43 |
| Agent reply triage, behind a mention-or-reply wake rule | fresh5 confirm (sintetico, no publico) | Tasa de falsos positivos: respuestas propias en bromas | 1,23 |
| Agent reply triage, behind a mention-or-reply wake rule | fresh5 confirm (sintetico, no publico) | Tasa de falsos positivos: respuestas propias en lineas que no piden respuesta | 0,65 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,5 GB para los pesos, mas overhead de activaciones y contexto; en la practica, entre 2 y 3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna con soporte bf16; con cuantizacion a fp16 o int8 cabria en tarjetas de gama baja.
- Opciones de despliegue: transformers (version >= 5.17) con `Qwen3_5ForCausalLM`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y su naturaleza de modelo de decisión con puntuacion de opciones encaja mal con servidores de generacion de texto estandar.
- Latencia y throughput: no disponibles. Al ser un modelo de 752M en un unico forward pass por decision, la latencia esperada es baja, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneJev1.6-0.8B-Claviger-v1 | 752M | no disponible | Triaje de agentes en Discord | Apache 2.0 | Hugging Face |
| Laya-421M-Claviger-v0 | 421M (aproximado, segun nombre) | no disponible | Triaje de agentes en Discord | no disponible en la informacion | Hugging Face |
| OmniJev/OneJev1.6-0.8B | 752M (parte de texto) | no disponible | Modelo multimodal base | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos: no se ha ejecutado con trafico real, y el autor califica sus metricas de optimistas.
- No es un generador de texto: no fue entrenado ni verificado para generar, y usarlo con ese fin queda fuera de alcance.
- Solo ingles: no admite otros idiomas.
- Fuera de alcance la moderacion o cualquier decision sobre personas.
- No debe usarse para respuestas automaticas sin supervision humana ni mecanismo de respaldo.
- Los resultados pueden no transferir a comunidades o plantillas de agentes distintas de las de entrenamiento; se recomienda evaluacion propia antes de desplegar.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de clasificacion erronea en conversaciones ambiguas.
- El codigo de entrenamiento no es publico, lo que dificulta la reproducibilidad.
- El conjunto de prueba no es publico y las metricas no estan verificadas por terceros.
- La licencia Apache 2.0 permite uso comercial, pero el dataset de entrenamiento tiene licencia CC BY 4.0, independiente de la del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/finis-est/OneJev1.6-0.8B-Claviger-v1
- Modelo base: https://huggingface.co/OmniJev/OneJev1.6-0.8B
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/finis-est/claviger-triage-synthetic
- Modelo predecesor: https://huggingface.co/finis-est/Laya-421M-Claviger-v0
