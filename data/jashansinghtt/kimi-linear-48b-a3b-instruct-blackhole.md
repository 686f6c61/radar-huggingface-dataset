# jashansinghTT/kimi-linear-48b-a3b-instruct-blackhole

## Resumen

Kimi Linear 48B-A3B Instruct Blackhole es un paquete de despliegue, no un modelo entrenado desde cero. Lo publica el usuario jashansinghTT y su funcion es servir el modelo de Moonshot AI `moonshotai/Kimi-Linear-48B-A3B-Instruct` sobre aceleradores Tenstorrent Blackhole (perfiles P300 y P300x2 / QuietBox 2) mediante vLLM con un plugin especifico de Tenstorrent y una API compatible con OpenAI. Los pesos no se re-empaquetan: el comando `tt-model pull --with-weights` los descarga en la cache de HuggingFace desde el commit `e1df551a447157d4658b573f9a695d57658590e9` del repositorio original.

El modelo subyacente es un decoder hibrido que combina Kimi Delta Attention (atencion lineal) con MLA (Multi-head Latent Attention) y una capa de mezcla de expertos con 256 expertos: 48B parametros totales y 3B parametros activos por token, con una arquitectura preparada para 1M de tokens de contexto. El paquete declara licencia MIT. En la practica, el despliegue limita la ventana de servicio a 131.072 tokens en el perfil p300x2 y a 65.536 tokens en el perfil p300.

Su relevancia es doble. Por un lado, permite ejecutar un MoE de 48B/3B activos con tool calling nativo en formato Kimi-K2 sobre hardware no NVIDIA. Por otro, es un artefacto de infraestructura: fija vLLM en la version 0.26.0, aporta un plugin TT propio y expone un servidor OpenAI-compatible en el puerto 20000, lo que facilita integrarlo en clientes que ya hablan el dialecto de OpenAI sin cambios de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder hibrido: Kimi Delta Attention (atencion lineal) + MLA (Multi-head Latent Attention), con mezcla de expertos (MoE) |
| Parametros totales | 48B |
| Parametros activos | 3B |
| Numero de expertos | 256 |
| Longitud de contexto | Arquitectura de 1M de tokens; en servicio: 131.072 tokens (perfil p300x2) y 65.536 tokens (perfil p300) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada en la model card; corresponde al modelo original de Moonshot AI) |
| Formato de pesos | no disponible (los pesos no estan en el repositorio; se descargan en la cache de HuggingFace desde `moonshotai/Kimi-Linear-48B-A3B-Instruct`) |
| Hardware objetivo | Tenstorrent Blackhole P300 (una placa) y P300x2 / QuietBox 2 (dos placas) |
| Tamano del repositorio | 1,9 GB (imagen y codigo, sin pesos) |
| Fecha de publicacion | 10 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura del modelo servido es un decoder de tipo transformer con dos decisiones de diseno destacables: Kimi Delta Attention, una forma de atencion lineal que reduce el coste de la ventana larga, combinada con MLA, y una capa MoE de 256 expertos que activa 3B de los 48B parametros por token. La model card indica que la arquitectura esta preparada para 1M de tokens. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

Lo que si documenta este repositorio es la cadena de servido, que es su aportacion real: vLLM v0.26.0 mas un plugin `vllm-tt-plugin`, sobre tt-metal, empaquetado con tt-model-manager 0.1.0 (esquema de manifiesto 5.1). El codigo incluido en `code/` es byte a byte identico al codigo del modelo dentro de la imagen, con digest `4dc4b578b3aef131` (sha256, primeros 16 digitos hexadecimales). La reproducibilidad es parcial: tanto tt-metal como vllm-tt-plugin se construyeron desde checkouts locales cuyo commit no se ha publicado. En la primera arrancada, el servidor compila kernels para el dispositivo concreto, un proceso que tarda varios minutos y que termina con el mensaje `Application startup complete`.

## Capacidades

- Generacion de texto conversacional en formato instruct, servida a traves de un endpoint `/v1/chat/completions` compatible con OpenAI.
- Tool calling nativo en formato Kimi-K2: se pasan `tools` y `tool_choice: auto`, y las respuestas devuelven `finish_reason: tool_calls`.
- Streaming de respuestas soportado por el servidor.
- Razonamiento en multiples pasos y uso como backend de agentes, apoyado en el tool calling y en la ventana de contexto larga.
- Procesamiento de contextos extensos: hasta 131.072 tokens en p300x2, lo que permite ingerir documentos completos sin troceado agresivo.
- Eficiencia de inferencia por activacion dispersa: solo 3B parametros activos por token pese a tener 48B totales.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Agentes con herramientas en produccion: el modelo emite llamadas a funciones en formato Kimi-K2 y devuelve `finish_reason: tool_calls`, por lo que se puede encadenar con ejecutores de tools (busqueda, bases de datos, APIs internas) en bucles multi-paso sin adaptadores propietarios.
- Analisis de documentacion extensa: con 131.072 tokens de ventana en el perfil p300x2 se pueden cargar contratos, expedientes o informes tecnicos completos en una sola peticion, evitando la perdida de contexto que introduce el chunking.
- Atencion al cliente multi-turno: el servidor mantiene conversaciones largas con contexto acumulado y expone una API estandar, de modo que se integra en el backend existente cambiando unicamente la `base_url` al puerto 20000.
- Asistente de codigo dentro de CI/CD: al ser compatible con OpenAI y soportar tool calling, se puede invocar desde scripts de revision de pull requests o generacion de tests usando los SDK oficiales de OpenAI sin reescribir el cliente.
- Recuperacion aumentada (RAG) sobre corpus grandes: el modelo puede combinarse con un recuperador y recibir decenas de miles de tokens de fragmentos por consulta, lo que reduce el numero de llamadas necesarias por pregunta.
- Despliegue on-premise en hardware Tenstorrent: organizaciones que ya tienen placas Blackhole o un QuietBox 2 pueden servir un modelo de 48B sin depender de GPUs NVIDIA, usando los perfiles p300 y p300x2.
- Evaluacion comparativa de stacks de inferencia: al fijar vLLM 0.26.0 y documentar la procedencia de cada componente, sirve como base para medir el comportamiento del plugin TT frente a un despliegue CUDA equivalente sobre los mismos pesos.
- Prototipado rapido con clientes existentes: cualquier herramienta que hable el dialecto de OpenAI (LangChain, LlamaIndex, SDK de OpenAI) apunta al endpoint local y funciona sin capa de traduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de tareas equivalentes, y tampoco reporta latencia, tokens por segundo ni metricas de throughput para ninguno de los dos perfiles de servicio que define.

| Metrica | Valor |
|---|---|
| Benchmarks de conocimiento o razonamiento | no disponible |
| Benchmarks de codigo | no disponible |
| Benchmarks de matematicas | no disponible |
| Latencia por peticion | no disponible |
| Throughput (tokens/s) | no disponible |
| Tiempo de primera respuesta | no disponible (la primera arrancada del servidor incluye compilacion de kernels y tarda varios minutos) |

## Requisitos de hardware

- Perfil p300x2 (por defecto): dos placas Tenstorrent Blackhole P300 (QuietBox 2), mesh P300x2, `max_num_seqs` 32 y `max_model_len` 131.072 tokens.
- Perfil p300: una placa Blackhole P300, mesh P300, `max_num_seqs` 16 y `max_model_len` 65.536 tokens.
- VRAM estimada: no disponible. El paquete esta pensado para aceleradores Tenstorrent, no para GPUs, y la model card no publica requisitos de memoria.
- GPU consumer: no procede. Este artefacto no documenta un camino de ejecucion en GPUs de consumo ni en GPUs NVIDIA en general.
- Opciones de despliegue: `tt-model pull --with-weights` y `tt-model serve` de tt-model-manager 0.1.0, sobre una imagen Docker que integra vLLM v0.26.0 con vllm-tt-plugin y tt-metal.
- Endpoint: servidor OpenAI-compatible en el puerto 20000, o el siguiente puerto libre si esta ocupado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo subyacente en la informacion proporcionada, por lo que no es posible compararlo con alternativas de la misma categoria (otros MoE de ~48B totales o modelos de activacion reducida). Lo que si se puede comparar son los dos perfiles de servicio que define el propio paquete, que ejecutan exactamente los mismos pesos:

| Criterio | Perfil p300x2 (por defecto) | Perfil p300 |
|---|---|---|
| Hardware | P300x2 (dos placas Blackhole) | P300 (una placa Blackhole) |
| Mesh | P300x2 | P300 |
| Secuencias concurrentes (`max_num_seqs`) | 32 | 16 |
| Longitud maxima de modelo | 131.072 tokens | 65.536 tokens |
| Pesos servidos | Commit `e1df551a447157d4658b573f9a695d57658590e9` | Identicos |
| Licencia | MIT | MIT |

Comparativa frente a modelos de la misma categoria en otros backends: no disponible.

## Limitaciones y advertencias

- El repositorio no contiene un modelo entrenado, sino un empaquetado de despliegue. Cualquier merito de calidad del modelo corresponde a Moonshot AI, no al autor del paquete.
- Dependencia de hardware Tenstorrent Blackhole. No hay evidencia en la informacion disponible de que el paquete funcione en GPUs NVIDIA, AMD u otros aceleradores.
- Reproducibilidad limitada: tt-metal y vllm-tt-plugin se construyeron desde checkouts locales cuyo commit no se ha publicado. Solo vLLM (v0.26.0) esta fijado a una version publica.
- El repositorio tiene 0 descargas y 0 likes, y se publico el 10 de septiembre de 2026. No existe validacion de la comunidad ni historial de uso en produccion.
- Los pesos no estan en el repositorio (1,9 GB de imagen y codigo). Se descargan aparte en la cache de HuggingFace, lo que anade un paso de red y una dependencia externa.
- La ventana efectiva de servicio es muy inferior a la capacidad de la arquitectura: 131.072 tokens en p300x2 frente a los 1M que declara el diseno. Los casos de uso con contexto ultralargo pueden no ser viables con estos perfiles.
- Capacidades multilingues no documentadas. No se puede asumir un buen comportamiento fuera del ingles sin evaluacion previa.
- Riesgo de alucinacion inherente a los modelos generativos, agravado por la ausencia de benchmarks publicados que permitan calibrar su fiabilidad.
- Licencia MIT declarada en la model card del paquete; conviene verificar directamente en el repositorio de Moonshot AI antes de un uso comercial, ya que el aviso se refiere al modelo original y no incluye terminos adicionales de la imagen.
- El nombre del modelo que hay que enviar en las peticiones es `moonshotai/Kimi-Linear-48B-A3B-Instruct`, no el identificador del repositorio empaquetado, algo que puede inducir a error en integraciones.
- La primera arrancada del servidor compila kernels y tarda varios minutos; no es apto para escenarios de arranque en frio frecuente sin planificacion.
- Tipos de cuantizacion soportados: no disponible. Se desconoce si el despliegue admite pesos cuantizados o si exige precision completa.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jashansinghTT/kimi-linear-48b-a3b-instruct-blackhole
- Modelo original de Moonshot AI: https://huggingface.co/moonshotai/Kimi-Linear-48B-A3B-Instruct
- tt-model-manager (Tenstorrent): https://github.com/tenstorrent/tt-model-manager
- Version de vLLM utilizada, v0.26.0: https://github.com/vllm-project/vllm/releases/tag/v0.26.0
- Busqueda web: no se han encontrado resultados relevantes sobre este modelo; las fuentes devueltas no guardan relacion con el artefacto.
