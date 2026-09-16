# lggvu/mmvap-candor

## Resumen

MMVAP — Candor es un checkpoint de un modelo de prediccion de actividad de voz (Voice Activity Projection, VAP) con fusion temprana de audio y video, orientado a la prediccion de turnos de palabra (turn-taking) en conversaciones. Lo publica el usuario lggvu en HuggingFace y se ha entrenado desde cero sobre el corpus Candor, un corpus de conversaciones enlazado por el propio autor al repositorio de investigacion de BetterUp. El checkpoint corresponde al pliegue 0 (fold 0) y a la epoca 10 de entrenamiento, lo que sugiere un pipeline de validacion cruzada habitual en este tipo de trabajos.

A diferencia de un modelo de lenguaje generativo, un modelo VAP no produce texto: recibe flujos de audio (y en esta variante tambien video) y proyecta en el tiempo la probabilidad de que cada interlocutor este hablando, lo que permite estimar cuando se producira un cambio de turno o quien tomara la palabra. Esto lo hace relevante para sistemas de dialogo hablado, agentes conversacionales y analisis de interaccion social, donde la gestion de turnos es un cuello de botella clasico.

La informacion publicada es muy escasa: no se declaran parametros, longitud de contexto, licencia, idiomas ni resultados de benchmarks. El repositorio tiene un tamano reportado de 0.0 GB y solo contiene, segun la model card, un `config.yaml` y un `weights.pt`. Cualquier evaluacion cuantitativa del modelo requiere por tanto inspeccionar directamente el checkpoint y el codigo fuente asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAP (Voice Activity Projection) con fusion temprana audio-visual; transformer sobre caracteristicas multimodales (detalle no publicado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre ventanas de audio/video) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el corpus Candor es de conversaciones telefonicas en ingles, pero la model card no lo declara) |
| Licencia | unknown (no especificada) |
| Formato de pesos | PyTorch (`weights.pt`) + `config.yaml`; no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card describe el modelo como un sistema de "audio-visual early-fusion Voice Activity Projection (VAP) turn-taking". El marco VAP, en su formulacion publicada en la literatura de procesamiento de habla, parte de senal estereo (un canal por interlocutor) y aprende a proyectar la actividad de voz futura de ambos hablantes sobre un horizonte temporal; a partir de esas curvas se derivan probabilidades de cambio de turno. La variante aqui publicada anade una rama visual y realiza la fusion de modalidades de forma temprana, es decir, combinando representaciones de audio y video antes de la etapa de modelado temporal.

El entrenamiento se ha realizado desde cero (no es un ajuste fino de otro checkpoint) sobre el corpus Candor, enlazado por el autor a la pagina de investigacion de BetterUp. Se trata de un checkpoint intermedio: fold 0, epoca 10. No se publican detalles sobre el numero de tokens o horas de audio utilizadas, la composicion del dataset, si hubo etapas de RLHF/DPO (poco habituales en esta familia de modelos) ni innovaciones tecnicas adicionales como decodificacion especulativa o mecanismos de atencion lineal. El codigo que genera el checkpoint esta disponible en el repositorio `lggvu/mm-turn-taking`.

## Capacidades

- Prediccion de actividad de voz futura (voice activity projection) para uno o varios interlocutores.
- Estimacion de cambios de turno (turn-shift) y de quien tomara la palabra a continuacion.
- Procesamiento conjunto de audio y video mediante fusion temprana, segun la descripcion del autor.
- Modelado de conversaciones a partir del corpus Candor (dominio de habla conversacional).
- No hay evidencia publicada de soporte de tool calling ni de function calling.
- No hay evidencia publicada de comportamiento agentico ni de razonamiento multi-paso.
- No hay evidencia publicada de generacion de texto, codigo, matematicas o vision general (la rama visual, si existe, se usa como entrada, no como capacidad generativa).
- Capacidades multilingues: no disponible.

## Casos de uso

- Prediccion de turnos en agentes conversacionales de voz: el modelo puede anticipar cuando el usuario terminara su intervencion, lo que permite reducir la latencia percibida y evitar interrupciones prematuras en asistentes telefonicos.
- Analisis de entrevistas y conversaciones grabadas: proyectar la actividad de voz de cada participante facilita metricas objetivas de dominancia, solapamiento y pausas en corpus de investigacion social.
- Sistemas de transcripcion con diarizacion asistida: las curvas de actividad de voz proyectadas ayudan a segmentar y atribuir intervenciones antes de pasar el audio a un ASR.
- Moderacion de reuniones y plataformas de videoconferencia: deteccion anticipada de solapamientos para sugerir silencios o gestionar el uso de la palabra en tiempo real.
- Entrenamiento y evaluacion de habilidades conversacionales: el modelo puede servir como componente de sistemas que evaluan fluidez e interaccion en simulaciones de entrevistas o coaching.
- Investigacion en interaccion multimodal: al fusionar audio y video, es util como linea base para estudiar si la informacion visual aporta senal predictiva sobre el turn-taking mas alla del audio.
- Robótica social y avatares conversacionales: anticipar el turno permite sincronizar gestos, mirada y respuestas de un agente encarnado con el ritmo real de la conversacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No consta ninguna metrica de turn-shift, next-speaker prediction, prediccion de actividad de voz ni comparacion con lineas base en la model card ni en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se declaran parametros ni tamano real de `weights.pt`; el repositorio figura como 0.0 GB, lo que impide estimar con fiabilidad).
- GPU recomendadas: no disponible por parte del autor; al tratarse de un modelo de prediccion de ventanas cortas de audio, es esperable que quepa en GPUs de gama media, pero esto no esta confirmado.
- Compatibilidad con GPU de consumo: no confirmada. Dependera del numero real de parametros y de si el checkpoint incluye la rama visual completa.
- Opciones de despliegue: al entregarse como `weights.pt` de PyTorch con `config.yaml`, el despliegue previsible es via PyTorch nativo y el codigo de `mm-turn-taking`. No hay soporte declarado para vLLM, llama.cpp, Ollama o TGI, que ademas estan orientados a modelos de lenguaje y no a esta tarea.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificables de parametros, contexto o rendimiento de este checkpoint, por lo que la comparacion cuantitativa no es posible. A continuacion se indican lineas de trabajo comparables por categoria (prediccion de turnos en habla), marcando como "no disponible" todo dato no confirmado.

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MMVAP — Candor (lggvu) | VAP audio-visual, fusion temprana | no disponible | no disponible | unknown | HuggingFace + repo `mm-turn-taking` |
| VAP (familia original de Voice Activity Projection) | VAP basado en audio | no disponible | no disponible | no disponible | publicaciones academicas y repos de investigacion |
| TurnGPT y variantes de prediccion de turnos basadas en lenguaje | Prediccion de turnos sobre texto | no disponible | no disponible | no disponible | repos de investigacion |

## Limitaciones y advertencias

- Ausencia total de licencia declarada ("unknown"): no se puede asumir uso comercial permitido. Es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- El repositorio figura con 0.0 GB de tamano y 0 descargas; conviene verificar que `weights.pt` contiene realmente pesos validos y no esta vacio, truncado o pendiente de subida.
- No se publican parametros, contexto, idiomas ni datos de entrenamiento, lo que impide auditar sesgos, cobertura linguistica o dominio de aplicacion real.
- El entrenamiento se ha hecho con el corpus Candor (conversaciones telefonicas), por lo que es previsible un sesgo de dominio hacia ese tipo de habla y canal; no se garantiza transferencia a otros idiomas, acentos o escenarios presenciales.
- Al ser un checkpoint de fold 0 y epoca 10, es probable que corresponda a una ejecucion parcial de validacion cruzada y no a un modelo final optimizado.
- Un modelo VAP no genera texto ni responde a instrucciones: no debe confundirse con un LLM ni usarse como tal.
- La rama de video introduce dependencia de la calidad y sincronizacion de la senal visual; no se documentan requisitos de entrada ni preprocesado.
- Riesgo de alucinacion en sentido generativo: no aplica (no genera lenguaje), pero si existe riesgo de predicciones de turno erroneas en habla solapada o ruidosa, sin que haya metricas publicadas para acotarlo.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces obtenidos correspondian a contenidos no relacionados con el ambito tecnico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lggvu/mmvap-candor
- Codigo fuente (`mm-turn-taking`): https://github.com/lggvu/mm-turn-taking
- Corpus Candor (BetterUp): https://betterup.com/research/candor-corpus

Nota: la busqueda web asociada a esta ficha no aporto enlaces utiles ni material tecnico adicional sobre el modelo.
