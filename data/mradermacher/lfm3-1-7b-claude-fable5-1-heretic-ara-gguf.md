# mradermacher/LFM3-1.7B-Claude-Fable5.1-heretic-ara-GGUF

## Resumen

LFM3-1.7B-Claude-Fable5.1-heretic-ara-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF generadas por mradermacher a partir del modelo base saidutta69/LFM3-1.7B-Claude-Fable5.1-heretic-ara. El modelo subyacente parte de la arquitectura LFM3 de Liquid AI en su variante de 1.7B parametros (1.728.801.600 parametros reales segun los safetensors), orientada a despliegue en el borde (edge) y en dispositivo local, con capacidades declaradas de tool calling y uso agentico.

La variante "heretic-ara" se presenta en la model card del autor original con etiquetas que indican un proceso de "abliteration" o decensurado (heretic, uncensored, decensored, abliterated), es decir, una modificacion de los pesos para reducir los rechazos del modelo ante determinadas peticiones. El sufijo "Claude-Fable5.1" sugiere un ajuste fino orientado a estilo conversacional o a replicar comportamiento de asistentes tipo Claude, aunque no se dispone de documentacion tecnica que lo confirme.

Este repositorio concreto no aporta informacion adicional sobre el entrenamiento, los datos utilizados ni evaluaciones: es unicamente un paquete de cuantizaciones (x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS) pensado para su uso con llama.cpp y derivados. Su relevancia es practica: permite ejecutar un modelo de 1.7B en hardware modesto, aunque con las salvedades importantes que se detallan en la seccion de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (Liquid AI), transformer; detalles internos no disponibles |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible (la model card del modelo base etiqueta "English") |
| Licencia | no disponible en este repo; el modelo base referencia lfm1.0 |
| Formato de pesos | GGUF (repo de 15,9 GB) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia LFM3 de Liquid AI, en su variante de 1.7B parametros. La informacion disponible no detalla la arquitectura interna (tipo de atencion, uso de capas recurrentes o hibridas, vocabulario o configuracion de capas), por lo que no es posible confirmar si emplea mecanismos distintos del transformer estandar. El tag "lfm3" y la referencia a "edge on-device" en el repositorio original apuntan a un diseno optimizado para inferencia local con recursos limitados.

Respecto al entrenamiento, no se han publicado en la informacion disponible datos sobre numero de tokens, composicion del dataset, fases de RLHF/DPO ni proceso de alineamiento. La etiqueta "heretic/abliterated" indica que los pesos fueron modificados tras el entrenamiento original para suprimir direcciones de rechazo, pero no se documenta la metodologia concreta. El ajuste "Claude-Fable5.1" sugiere un fine-tuning adicional de estilo conversacional, sin mas detalles tecnicos.

## Capacidades

- Generacion de texto conversacional multi-turno (tag "conversational").
- Tool calling y function calling, segun las etiquetas del modelo base ("tool-calling").
- Uso agentico y flujos de varios pasos ("agentic"), orientado a entornos tipo Claude Code.
- Inferencia en dispositivo local y en el borde ("edge on-device", "local-llm").
- Comportamiento decensurado/abliterado: menor tasa de rechazos ante peticiones que el modelo original rechazaria.
- Capacidades multilingues: no confirmadas; el modelo base se etiqueta como ingles.
- Vision, audio o modos de razonamiento explicito: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente local de programacion: el modelo puede integrarse en editores o terminales para autocompletar y explicar codigo, aprovechando su soporte de tool calling y su tamano reducido para ejecutarse en un portatil sin GPU dedicada.
- Automatizacion agentica de tareas de desarrollo: al estar orientado a flujos tipo Claude Code, encaja en pipelines que encadenan llamadas a herramientas (lectura de ficheros, ejecucion de comandos) con pasos multiples.
- Prototipado rapido de chatbots: su formato GGUF y su ventana conversacional permiten montar un servicio de chat en local con llama.cpp u Ollama para validar productos antes de invertir en modelos mayores.
- Procesamiento por lotes en CPU: las cuantizaciones Q4_K_M e IQ4_XS permiten clasificar, resumir o reescribir textos en servidores sin GPU, con coste energetico bajo.
- Experimentacion en investigacion sobre alineamiento: la variante abliterated sirve para estudiar el efecto de la supresion de direcciones de rechazo en el comportamiento del modelo, comparandola con el modelo original.
- Despliegue embebido y edge computing: con 1.7B parametros y cuantizaciones de 2 a 4 bits, puede ejecutarse en dispositivos con poca memoria para asistentes de voz o interfaces de texto offline.
- Generacion de contenido creativo sin filtros: util en entornos controlados donde se necesita explorar narrativa o dialogos que los modelos alineados suelen rechazar, siempre con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 1,0-1,2 GB con Q2_K; 1,3-1,5 GB con Q3_K_M; 1,5-1,8 GB con Q4_K_M; 2,0-2,3 GB con Q6_K; 2,8-3,2 GB con Q8_0; en torno a 3,5 GB con F16 (estimaciones a partir del numero de parametros, no verificadas).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060) para cuantizaciones Q4-Q8; A100/H100 no son necesarias y aportarian poco a este tamano.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 4 GB o mas; tambien en CPU pura con 4-8 GB de RAM libre.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; vLLM y TGI no son la via natural para GGUF, aunque existen soportes parciales.
- Latencia y throughput: no disponibles; en una RTX 4060 con Q4_K_M es razonable esperar decenas de tokens por segundo, pero no hay mediciones publicadas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Claude-Fable5.1-heretic-ara (este) | 1,73B | no disponible | no disponible (base: lfm1.0) | GGUF | Decensurado, orientado a tool calling |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Multilingue, ampliamente evaluado |
| Llama-3.2-1B-Instruct | 1,24B | 131.072 tokens | Llama 3.2 Community | safetensors, GGUF | Contexto largo, ecosistema amplio |
| SmolLM2-1.7B-Instruct | 1,71B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Optimizado para edge, bien documentado |

La comparacion con alternativas es desfavorable en transparencia: los tres modelos citados publican benchmarks, licencia clara y contexto definido, mientras que este repositorio no aporta ninguno de esos datos.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, razonamiento o fidelidad en tool calling para esta variante.
- Licencia no disponible en el repositorio: el modelo base referencia lfm1.0, cuyas condiciones deben verificarse antes de cualquier uso comercial; la modificacion abliterated puede ademas contravenir los terminos del modelo original.
- Riesgo elevado de alucinacion: con 1,7B parametros y sin evaluaciones, la fiabilidad en tareas factuales es incierta y probablemente baja en dominios especializados.
- Modelo decensurado: la supresion de rechazos aumenta el riesgo de generar contenido danino, sesgado o inapropiado; no es apto para exposicion directa a usuarios sin filtros adicionales.
- Idiomas: solo se etiqueta ingles en el modelo base; el rendimiento en castellano no esta verificado y probablemente sea deficiente.
- Contexto desconocido: no se puede planificar su uso en conversaciones largas o documentos extensos sin confirmar la ventana real.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria; el origen "saidutta69" y el nombre del ajuste no corresponden a un publicador de referencia.
- Cuantizaciones de 2 y 3 bits: degradan notablemente la coherencia en modelos pequenos; se recomienda Q4_K_M o superior para uso real.
- Fecha de creacion futura (2026-11-08) en los metadatos: inconsistencia que sugiere procedencia automatizada o no verificada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/LFM3-1.7B-Claude-Fable5.1-heretic-ara-GGUF
- Modelo base: https://huggingface.co/saidutta69/LFM3-1.7B-Claude-Fable5.1-heretic-ara
- Fichero F16 del modelo base: https://huggingface.co/saidutta69/LFM3-1.7B-Claude-Fable5.1-heretic-ara/blob/main/LFM3-1.7B-Claude-Fable5.1-heretic-ara-F16.gguf
- Perfil del cuantizador: https://huggingface.co/mradermacher
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
