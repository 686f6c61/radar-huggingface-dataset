# mradermacher/AdaGuard-4B-GGUF

## Resumen

AdaGuard-4B-GGUF es la version cuantizada en formato GGUF de AdaGuard-4B, un modelo de tipo *guard* (clasificador y moderador de seguridad) de 4.411.424.256 parametros. El modelo original lo publica el usuario de Hugging Face Yunhao-Feng bajo licencia Apache 2.0, y esta version cuantizada la mantiene mradermacher, un cuantizador de referencia dentro del ecosistema local. El problema que aborda es concreto: los modelos guard tradicionales operan con taxonomias de riesgo fijas, lo que limita su uso cuando cada aplicacion define sus propias politicas de seguridad. AdaGuard se presenta como un guard adaptativo, condicionado por politicas definidas por el usuario.

La relevancia actual del modelo se entiende en el contexto del despliegue de agentes basados en LLM. Cuando un agente ejecuta acciones (llamadas a herramientas, escritura de ficheros, peticiones de red), la misma accion puede ser aceptable o inaceptable segun la politica de cada organizacion. Detectar violaciones exige interpretar simultaneamente las reglas aplicables y el comportamiento del agente, algo que una taxonomia fija no cubre. AdaGuard se entrena con refuerzo (*reinforcement-learning*) para resolver esa tarea de juicio condicionado por politica.

Con aproximadamente 4.400 millones de parametros, se situa en el rango de los modelos guard pequenos, pensados para ejecutarse en hardware de consumo o en GPU de gama media junto al modelo principal. Esta publicacion concreta ofrece 12 variantes de cuantizacion, desde Q2_K (1,9 GB) hasta f16 (8,9 GB), lo que la hace desplegable en practicamente cualquier maquina con llama.cpp u Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen3 (segun los tags del repositorio) |
| Parametros totales | 4.411.424.256 (4,4 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); safetensors en el modelo base Yunhao-Feng/AdaGuard-4B |

## Arquitectura y entrenamiento

La informacion disponible identifica el modelo como perteneciente a la familia Qwen3 (tag `qwen3`), lo que implica una arquitectura transformer decoder-only densa. No se detalla en la model card el numero de capas, dimensiones ocultas ni la longitud de contexto nativa. La pipeline declarada en Hugging Face es `reinforcement-learning`, y entre los tags figuran `reinforcement-learning`, `safety`, `guard-model`, `policy-conditioned` y `agent-safety`, lo que sitúa el entrenamiento en el terreno del ajuste por refuerzo orientado a juicio de seguridad condicionado por politica.

El paper asociado, "AdaGuard: An Adaptive Guard Model with User-defined Policies" (arXiv 2609.34241), plantea el problema central del modelo: bajo politicas definidas por el usuario, detectar violaciones requiere interpretar tanto las reglas aplicables como el comportamiento del agente, dado que acciones identicas pueden recibir juicios distintos segun la politica vigente. No se proporciona en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni los detalles del algoritmo de RL empleado (RLHF, DPO u otro). Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o mecanismos de atencion alternativa.

Esta ficha corresponde exclusivamente a la version cuantizada: mradermacher ha generado cuantizaciones estaticas (indica que las cuantizaciones ponderadas o con imatrix no estaban disponibles en el momento de la publicacion). El proceso de cuantizacion es de tipo `convert_type: hf` con salida cuantizada por tensor.

## Capacidades

- Clasificacion y moderacion de seguridad: evalua contenido y comportamiento contra una politica de riesgo determinada.
- Juicio condicionado por politica: la misma accion puede clasificarse de forma distinta segun las reglas definidas por el usuario, que es el rasgo diferencial frente a guards de taxonomia fija.
- Seguridad de agentes: orientado a supervisar acciones de agentes LLM (uso de herramientas, pasos multi-turno), no solo texto generado.
- Modelo conversacional: el tag `conversational` indica soporte de interacciones en formato de chat.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Capacidades de vision o audio: no disponibles.
- Modo de razonamiento explicito (*thinking mode*): no disponible.

## Casos de uso

- Moderacion de agentes en produccion: colocado como filtro entre el agente y la ejecucion real de acciones, evalua cada paso propuesto contra la politica interna de la organizacion antes de autorizarlo.
- Cumplimiento normativo por dominio: una misma herramienta de busqueda puede ser aceptable en un asistente de investigacion y vetada en un entorno sanitario; AdaGuard permite expresar esa diferencia mediante politica en lugar de reentrenar un clasificador.
- Guardarrail de asistentes de atencion al cliente: detecta respuestas o acciones que violan las reglas comerciales o legales de la empresa sin depender de una taxonomia generica de toxicidad.
- Auditoria de trazas de agentes: procesado por lotes de registros de conversaciones y llamadas a herramientas para marcar posibles violaciones de politica con posterior revision humana.
- Despliegue en local o en el borde: con cuantizaciones desde 1,9 GB, es viable ejecutarlo en portatiles o servidores modestos junto al modelo principal, sin enviar datos sensibles a APIs externas.
- Filtrado previo en pipelines RAG: validacion de consultas y respuestas frente a la politica de la aplicacion antes de que lleguen al usuario final.
- Evaluacion comparativa de politicas: al aceptar politicas definidas por el usuario, sirve para probar distintas configuraciones de reglas sobre el mismo conjunto de trazas y medir su impacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card de esta version cuantizada no incluye metricas, y el resumen del paper accesible en la busqueda web no aporta cifras numericas.

## Requisitos de hardware

- VRAM estimada de inferencia (pesos en disco, mas cache KV y sobrecarga del runtime):
  - Q2_K: ~1,9 GB de pesos; ~2,5-3 GB en ejecucion.
  - Q4_K_M: ~2,8 GB de pesos; ~3,5-4 GB en ejecucion.
  - Q5_K_M: ~3,3 GB de pesos; ~4-4,5 GB en ejecucion.
  - Q6_K: ~3,7 GB de pesos; ~4,5-5 GB en ejecucion.
  - Q8_0: ~4,8 GB de pesos; ~5,5-6 GB en ejecucion.
  - f16: ~8,9 GB de pesos; ~10-11 GB en ejecucion (el autor lo describe como "overkill").
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM para cuantizaciones Q4 y Q5 (RTX 3060, RTX 4060, RTX 3070, RTX 4070). Para Q8_0 basta una RTX 4060 Ti de 8 GB o superior; para f16, una RTX 4080/4090 o una GPU de datacenter (A100, H100) si se busca maxima concurrencia.
- Caben en GPU de consumo: si. Q4_K_M (2,8 GB) y Q5_K_M (3,3 GB) son las opciones recomendadas por el propio cuantizador para equipos de gama media.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF (LM Studio, koboldcpp). Para el modelo base en safetensors, transformers, vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependeran del hardware, del backend y de la longitud de contexto efectiva.

## Comparativa con modelos similares

Los datos del modelo comparado que no figuren en la informacion proporcionada se marcan como no disponibles.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AdaGuard-4B (esta ficha, GGUF) | 4,4 B | No disponible | Guard condicionado por politica de usuario, orientado a agentes | Apache 2.0 | GGUF en este repo; safetensors en el modelo base |
| Llama Guard 3 | 8 B | No disponible | Guard de taxonomia fija | Licencia comunitaria de Llama 3.1 | Pesos abiertos en Hugging Face |
| ShieldGemma | 2 B / 9 B / 27 B | No disponible | Guard de taxonomia fija | Licencia de Gemma | Pesos abiertos en Hugging Face |
| Qwen3Guard | 0,6 B / 4 B / 8 B | No disponible | Guard de la familia Qwen3 | Apache 2.0 | Pesos abiertos en Hugging Face |

La diferencia funcional principal de AdaGuard frente a estas alternativas es el condicionamiento por politica: los modelos citados aplican categorias de riesgo predefinidas, mientras que AdaGuard esta disenado para aceptar reglas definidas por cada aplicacion.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada. Al estar entrenado sobre datos en ingles, es previsible un sesgo hacia contextos culturales anglosajones, aunque no se documenta.
- Riesgo de alucinacion: no cuantificado. Como modelo guard, un falso negativo (dejar pasar una accion prohibida) es mas costoso que un falso positivo, por lo que conviene calibrar umbrales y mantener revision humana en flujos criticos.
- Limitacion idiomatica: solo ingles declarado. Su uso sobre contenido en castellano no esta respaldado por la model card.
- Longitud de contexto: no documentada en la informacion disponible; no se puede garantizar el comportamiento sobre trazas de agente muy largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar avisos de copyright y licencia. No se anaden clausulas de uso aceptable en los datos disponibles.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 1 de octubre de 2026. Es un artefacto muy reciente y sin validacion comunitaria.
- Cuantizacion estatica: el cuantizador indica que no genero variantes ponderadas ni con imatrix, que suelen ofrecer mejor relacion calidad/tamano. Las cuantizaciones por debajo de Q4_K pueden degradar de forma notable la capacidad de juicio, critica en un modelo de seguridad.
- Advertencia de produccion: al tratarse de un modelo guard, su salida no debe tratarse como una decision definitiva. Conviene combinarlo con validacion determinista de las acciones del agente y con supervision humana en los casos limite.
- El modelo base y el cuantizador son entidades distintas: Yunhao-Feng mantiene el modelo original; mradermacher solo publica las cuantizaciones. Las incidencias de calidad de los pesos originales deben reportarse contra el primero.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AdaGuard-4B-GGUF
- Modelo base: https://huggingface.co/Yunhao-Feng/AdaGuard-4B
- Paper: https://arxiv.org/abs/2609.34241
- Pagina de descarga del cuantizador: https://hf.tst.eu/model#AdaGuard-4B-GGUF
- Listado de modelos de mradermacher: https://huggingface.co/mradermacher/models
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de referencia: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
