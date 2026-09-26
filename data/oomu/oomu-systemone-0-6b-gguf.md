# oomu/OOMU-SystemOne-0.6B-GGUF

## Resumen

OOMU System 1 es un modelo de 0,6B parámetros distribuito en formato GGUF (cuantización Q8_0) por el usuario oomu, y se presenta como el motor de decisión oficial del sistema OOMU Beta 3 (Manic Kingpin). No es un modelo generativo de texto al uso: funciona como un sensor semántico local que evalúa en una sola pasada hacia delante el contexto de escritorio, la intención del usuario, las capacidades disponibles y las políticas de seguridad de datos. Está derivado del modelo Bosun v3.1 0.6B de Hanno Labs y conserva la licencia Apache 2.0.

Su relevancia está en el nicho de la inferencia en el borde (edge): con 639 MB de pesos y una latencia declarada de 10 a 18 ms por pasada, está pensado para ejecutarse en memoria unificada de Apple Silicon mediante el backend Metal de llama.cpp, sin el coste de la generación autorregresiva token a token. La arquitectura de base es una familia tipo Qwen de 0,6B con 256 representaciones de token de decisión aprendidas, lo que convierte la tarea en una clasificación/routing de baja latencia en lugar de una generación libre.

El modelo tiene, en el momento de redactar esta ficha, cero descargas y cero likes en HuggingFace, y no publica benchmarks ni documentación de idiomas. Por tanto, debe tratarse como un artefacto muy especializado y poco validado de forma independiente, adecuado para experimentación con enrutado de agentes en macOS más que para producción crítica sin evaluación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen 0.6B con 256 representaciones de token de decisión aprendidas |
| Parámetros totales | 596.038.656 (según metadatos de safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q8_0 (GGUF); no se documentan otras |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `OOMU-SystemOne-Bosun-0.6B-Q8_0.gguf`) |
| Tamaño del fichero | 639.435.808 bytes (~639 MB) |
| SHA-256 | `bd3b523502d5479c053d67a633439dafc2ae8451ac939ce90a4482408ac48d89` |
| Pipeline declarado | text-classification |
| Runtime de inferencia | Metal backend local en macOS arm64 (llama.cpp) |
| Modelo de origen | Hanno-Labs/bosun-v3.1-0.6b-GGUF |
| Tamaño del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

La model card describe una arquitectura derivada de la familia Qwen de 0,6B parámetros, adaptada para producir 256 representaciones de token de decisión aprendidas. En lugar de generar texto de forma autorregresiva, el modelo realiza una única pasada hacia delante sobre el contexto de entrada y emite una decisión, lo que explica la latencia declarada de 10 a 18 ms en hardware Apple Silicon. Esta formulación lo sitúa en la categoría de clasificador/enrutador semántico más que en la de modelo conversacional, aunque entre sus etiquetas figure `conversational`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF o DPO, ni sobre el proceso de destilación o ajuste que convirtió el modelo base Bosun v3.1 0.6B en este artefacto de decisión. La ingeniería destacable documentada es de despliegue, no de entrenamiento: cuantización Q8_0 en GGUF y ejecución local en memoria unificada mediante Metal, pensada para evitar cualquier coste de red y de generación token a token.

## Capacidades

- Clasificación y enrutado de intenciones: evalúa la petición del usuario y decide la ruta o la acción correspondiente en una sola pasada.
- Evaluación de contexto de escritorio: procesa señales del entorno (aplicación activa, ventana, estado del sistema) como entrada semántica.
- Comprobación de políticas de seguridad de datos: determina si el contenido puede tratarse en local o si debe someterse a restricciones antes de salir del dispositivo.
- Selección de capacidades y herramientas: actúa como router que decide qué capacidad o herramienta está disponible y es adecuada para la tarea.
- Baja latencia como capacidad de diseño: 10-18 ms por pasada, sin generación autorregresiva.
- Ejecución 100 % local en macOS arm64 sobre Metal, sin dependencia de servicios en la nube.
- Soporte de agentes y razonamiento multi-paso: solo en la medida en que se use como primer eslabón de enrutado dentro de un sistema mayor; no hay evidencia publicada de razonamiento multi-paso autónomo.
- Tool calling / function calling: no documentado explícitamente; el enrutado se describe como selección de capacidades, no como emisión de llamadas a funciones en formato estándar.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Enrutado de intenciones en asistentes de escritorio para macOS: el modelo recibe la petición del usuario y el contexto de la aplicación activa y devuelve una decisión de ruta en 10-18 ms, lo que permite un asistente que responde de inmediato sin invocar un LLM grande para cada interacción.
- Pre-filtro de políticas de seguridad de datos: antes de enviar un fragmento de información a un modelo en la nube, este clasificador decide si el contenido contiene datos sensibles y debe quedarse en local. Su tamaño de 639 MB permite tenerlo cargado de forma permanente en memoria unificada.
- Reducción de costes en pipelines RAG: usar el modelo como primera etapa que descarta consultas triviales o irrelevantes evita llamadas a modelos mayores en una fracción de los casos, con un coste de cómputo marginal.
- Automatización de flujos de trabajo en macOS: integrado en atajos o scripts, puede clasificar la intención del usuario y disparar la acción correspondiente (abrir una herramienta, preparar un contexto, lanzar una tarea) sin salir del dispositivo.
- Gatekeeper de selección de herramientas en agentes: en una arquitectura con varias herramientas disponibles, el modelo actúa como router que decide cuál habilitar para cada turno, reduciendo el número de invocaciones caras.
- Clasificación semántica local en cumplimiento normativo: para entornos donde los datos no pueden salir del puesto de trabajo, permite etiquetar y enrutar contenido íntegramente en el dispositivo.
- Sensado de contexto para interfaces adaptativas: detectar la tarea en curso y ajustar la interfaz o las sugerencias del sistema en función del contexto evaluado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara una latencia de 10 a 18 ms por pasada hacia delante en Apple Silicon con el backend Metal de llama.cpp, sin métricas de precisión, exactitud de enrutado ni comparaciones con alternativas.

## Requisitos de hardware

- VRAM/peso de pesos: ~639 MB para el fichero Q8_0; en la práctica, entre 1 y 1,5 GB de memoria contando contexto y overhead del runtime (estimación, no dato publicado).
- Cabe en GPU de consumo: sí, con margen amplio; cualquier GPU con 2 GB o más de memoria libre puede alojarlo (por ejemplo, gama RTX 30/40 de entrada).
- Hardware objetivo declarado: Apple Silicon con memoria unificada, ejecutando llama.cpp con backend Metal en macOS arm64.
- GPU de数据中心: no requiere A100, H100 ni similares; el modelo está dimensionado para el borde.
- Opciones de despliegue: llama.cpp (ruta recomendada y documentada, con Metal en macOS) y cualquier runtime compatible con GGUF. vLLM, TGI, Ollama u otros no están documentados para este artefacto.
- Latencia: 10-18 ms por pasada en Apple Silicon según el autor.
- Throughput: no disponible. Al no usar decodificación autorregresiva, el concepto de tokens por segundo no aplica de la misma forma que en un modelo generativo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas (contexto, idiomas) de este modelo, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas. La única relación documentada es con su modelo de origen.

| Modelo | Parámetros | Contexto | Licencia | Relación |
|---|---|---|---|---|
| oomu/OOMU-SystemOne-0.6B-GGUF | 596.038.656 | No disponible | Apache 2.0 | Artefacto de decisión derivado, formato GGUF Q8_0 |
| Hanno-Labs/bosun-v3.1-0.6b-GGUF | No disponible | No disponible | Apache 2.0 | Modelo de origen del que deriva este artefacto |

Comparativas con modelos de la misma categoría (clasificadores/enrutadores de borde): no disponible.

## Limitaciones y advertencias

- Ausencia total de validación externa: cero descargas y cero likes en HuggingFace en el momento de redactar la ficha, sin evaluación independiente conocida.
- No hay benchmarks publicados: no se puede verificar la precisión del enrutado ni la tasa de acierto en las tareas que declara resolver.
- Riesgo de alucinación y de clasificación errónea: al ser un modelo de decisión, un error se traduce en rutas o políticas mal aplicadas, potencialmente con consecuencias operativas o de seguridad.
- Longitud de contexto no documentada: se desconoce cuánto contexto de escritorio puede procesar de una vez, lo que limita el diseño de integraciones.
- Idiomas no documentados: no hay garantía de comportamiento correcto fuera del idioma o idiomas con los que se haya ajustado.
- Pipeline declarado como text-classification, aunque las etiquetas incluyen `conversational`: la propia ficha apunta a un uso de clasificación, no de generación de texto, por lo que no debe esperarse diálogo libre.
- Dependencia de un runtime concreto: el rendimiento declarado está ligado a llama.cpp con Metal en macOS arm64; en otras plataformas el comportamiento es desconocido.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar los avisos de copyright y la atribución al modelo de origen Bosun v3.1 0.6B de Hanno Labs; conviene revisar también las condiciones del repositorio upstream.
- Riesgo de sesgos: no evaluado ni documentado por el autor.
- Fecha de creación poco habitual en el repositorio (2026-09-26) y metadatos mínimos: conviene verificar la procedencia y el contenido del artefacto antes de integrarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/oomu/OOMU-SystemOne-0.6B-GGUF
- Modelo de origen (atribución): https://huggingface.co/Hanno-Labs/bosun-v3.1-0.6b-GGUF
- Búsqueda web: no se han encontrado resultados relevantes; las consultas devolvieron únicamente contenido no relacionado con el modelo.
