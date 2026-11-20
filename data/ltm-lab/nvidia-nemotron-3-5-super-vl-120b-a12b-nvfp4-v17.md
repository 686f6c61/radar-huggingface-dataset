# LTM-Lab/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-v17

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-v17 es un checkpoint multimodal de tipo imagen-texto publicado por LTM-Lab, derivado del modelo base LTM-Lab/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-v16. Se distribuye en formato NVFP4 (cuantizacion de 4 bits en punto flotante de NVIDIA) y se carga mediante `AutoModelForImageTextToText` con `trust_remote_code=True`. La etiqueta del repositorio indica una arquitectura `nemotron_h_omni`, lo que sugiere un transformer hibrido orientado a tareas multimodales, aunque la model card no detalla la composicion interna.

La novedad principal de la version v17 es la incorporacion de una capa de memoria episodica persistente en formato "FORMAT 8", junto con soporte para procedimientos respaldados por evidencia y prediccion de eventos en el tiempo de inferencia. Segun el autor, los pesos, tokenizador y recursos del modelo se mantienen identicos a los del checkpoint v16; los cambios se concentran en la logica de inferencia y el formato de memoria.

El modelo declara 65.769.840.138 parametros reales en safetensors (pese al "120B-A12B" del nombre, que probablemente aluda a la configuracion original antes de cuantizar o a un MoE con 12B activos), un tamano de repositorio de 75 GB y licencia OpenMDW 1.1. Es relevante para quienes necesitan un modelo multimodal con memoria de sesion persistente y capacidad de razonamiento temporal, aunque la documentacion publica es muy escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h_omni` (transformer hibrido multimodal, segun tag del repo; detalle interno no disponible) |
| Parametros totales | 65.769.840.138 (safetensors) |
| Parametros activos | no disponible (el nombre sugiere 12B activos, sin confirmacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, `modelopt_mixed`), etiquetado tambien como 8-bit en tags |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW 1.1 (`other`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla del identificador `nemotron_h_omni` y la pipeline `image-text-to-text`. El nombre del checkpoint sugiere una variante hibrida (posiblemente combinando atencion y capas de estado o mezcla de expertos) del linaje Nemotron de NVIDIA, pero no se confirma en la model card. El peso real en safetensors (65.700 millones de parametros) no coincide con el "120B" del nombre, lo que indica que el identificador conserva la denominacion del modelo original y no refleja el artefacto cuantizado.

No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. La innovacion declarada es la memoria episodica persistente en "FORMAT 8", que permite al modelo conservar informacion entre turnos o sesiones, junto con procedimientos respaldados por evidencia y prediccion de eventos temporales en inferencia. No hay informacion sobre decodificacion especulativa, atencion lineal u otras optimizaciones.

## Capacidades

- Generacion de texto e interaccion conversacional multi-turno.
- Comprension de imagen y texto combinados (pipeline `image-text-to-text`).
- Memoria episodica persistente en formato FORMAT 8, segun la model card.
- Procedimientos respaldados por evidencia (evidence-backed procedures).
- Prediccion de eventos en el tiempo de inferencia (event-time forecasting).
- Carga mediante `AutoModelForImageTextToText` con `trust_remote_code=True`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras modalidades: no disponible.

## Casos de uso

- Asistentes con memoria de sesion: la memoria episodica FORMAT 8 permite mantener contexto de usuario entre interacciones sin reenviar todo el historial, util en soporte tecnico prolongado.
- Analisis de documentos con imagenes: al ser un modelo imagen-texto, puede procesar capturas, diagramas o formularios junto con texto para extraer informacion estructurada.
- Seguimiento de procedimientos: la capacidad de "procedimientos respaldados por evidencia" encaja en flujos de verificacion donde cada paso debe citar la fuente que lo justifica.
- Prediccion temporal de eventos: util en monitorizacion de series o alertas donde el modelo debe estimar cuando ocurrira un evento a partir de contexto historico.
- Revision de incidencias en soporte nivel 2: combinando vision (capturas de error) y memoria de casos previos para sugerir resoluciones.
- Prototipado de agentes conversacionales con estado: la persistencia de memoria simplifica arquitecturas que antes requerian bases de datos externas para el estado de la conversacion.
- Evaluacion de modelos multimodales en investigacion: como checkpoint de referencia para estudiar el efecto de la memoria episodica en tareas de razonamiento temporal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 75 GB en NVFP4; la inferencia requiere al menos ~75-80 GB de VRAM para cargar los pesos completos, mas overhead de activaciones y cache KV.
- GPU recomendadas: H100 (80 GB) o A100 80 GB para carga completa en una sola GPU; configuraciones multi-GPU para mayor margen.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) sin offloading a CPU o sharding, lo que degradaria gravemente la latencia.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `trust_remote_code=True`; no se confirma soporte en vLLM, llama.cpp, Ollama o TGI para NVFP4.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Documentacion muy escasa: la model card solo describe la herencia de pesos y las nuevas capacidades de memoria; no hay detalles de entrenamiento, datos ni evaluacion.
- Discrepancia de nombres: el identificador dice "120B-A12B" pero los safetensors suman 65.700 millones de parametros; conviene verificar la configuracion real antes de dimensionar infraestructura.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; auditar antes de usar en produccion.
- Licencia OpenMDW 1.1: revisar sus terminos para uso comercial, redistribucion y atribucion antes de desplegar.
- Riesgo de alucinacion no cuantificado: sin benchmarks ni evaluaciones publicadas no es posible estimar la fiabilidad en tareas criticas.
- Idiomas soportados no declarados: no se puede garantizar calidad en castellano u otros idiomas distintos del ingles.
- Sin datos de sesgos, seguridad o filtrado de contenido.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.
- La memoria episodica persistente puede plantear problemas de privacidad y retencion de datos si se usa con informacion de usuarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LTM-Lab/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-v17
- Checkpoint base v16: https://huggingface.co/LTM-Lab/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-v16
- Revision concreta del checkpoint v16: https://huggingface.co/LTM-Lab/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-v16/tree/9159e573b0f56e9eeb1b242aa5af54f22fc94ead
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
