# EEU/Qwen2.5-1.5B-Instruct-abliterated

## Resumen

Qwen2.5-1.5B-Instruct-abliterated es una variante del modelo Qwen2.5-1.5B-Instruct de Alibaba, publicada por el usuario EEU en Hugging Face. Se trata de una version "abliterada" del modelo original: mediante una tecnica de ablacion direccional (directional ablation) se elimina del flujo residual la direccion responsable del mecanismo de rechazo, de modo que el modelo responde de forma directa a peticiones que el modelo base rechazaria por sus mecanismos de alineamiento. El repositorio distribuye exclusivamente pesos en formato GGUF, pensados para inferencia local con llama.cpp y Ollama.

El modelo conserva la arquitectura y el tamano del Qwen2.5-1.5B-Instruct original: aproximadamente 1.540 millones de parametros, lo que lo situa en la gama de modelos pequenos aptos para CPU, Apple Silicon y dispositivos de borde. Su interes practico radica en combinar un modelo compacto, con licencia Apache 2.0 y capacidades bilingues (ingles y chino), con la ausencia de rechazos del sistema de alineamiento, lo que resulta util para investigacion sobre alineamiento, red teaming y escenarios donde las negativas del modelo base resultan un obstaculo.

La relevancia actual es doble: por un lado, permite estudiar empiricamente el efecto de la ablacion de la direccion de rechazo en un modelo pequeno y bien documentado; por otro, ofrece una opcion ligera para despliegues locales donde se necesita un modelo conversacional sin filtros de contenido, asumiendo los riesgos asociados a la ausencia de alineamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, dato no confirmado para esta variante) |
| Tipos de cuantizacion | Q4_K_M (986 MB), Q5_K_M (1,13 GB) |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con plantilla de chat embebida en los metadatos) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-1.5B-Instruct: un transformer decoder-only con atencion por causalidad, normalizacion RMSNorm, activaciones SwiGLU y sesgos de atencion QKV, tal como define la familia Qwen2 de Alibaba. El modelo base fue entrenado por Alibaba con un corpus multilingue (con enfasis en ingles y chino) y posteriormente ajustado por instrucciones y alineado mediante tecnicas de preferencia (RLHF/DPO), aunque los detalles exactos de ese proceso no se detallan en la informacion disponible.

La innovacion de esta variante es la ablacion direccional aplicada sobre el flujo residual. La tecnica consiste en identificar una direccion en el espacio de activaciones que correlaciona con las respuestas de rechazo, calcularla a partir de pares de prompts maliciosos y benignos (tipicamente usando diferencias de medias de activaciones) y proyectar esa direccion fuera de las activaciones del modelo durante la inferencia o modificando los pesos. El resultado es un modelo que conserva en gran medida sus capacidades de seguimiento de instrucciones, pero que deja de activar el patron de negativa. No se especifica en la informacion proporcionada el numero de capas afectadas, el dataset utilizado para calcular la direccion ni si se realizo un ajuste posterior para recuperar capacidades.

## Capacidades

- Generacion de texto conversacional en ingles y chino, con plantilla de chat integrada en los metadatos GGUF.
- Seguimiento de instrucciones sin activacion del mecanismo de rechazo del modelo base.
- Razonamiento basico y respuesta a preguntas de conocimiento general, limitado por el tamano de 1.5B parametros.
- Generacion de codigo y explicaciones tecnicas a nivel basico-intermedio.
- Capacidad de mantener conversaciones multi-turno dentro de la ventana de contexto del modelo base.
- Inferencia en CPU, Apple Silicon y dispositivos de borde gracias a las cuantizaciones GGUF ligeras.
- No se documenta soporte explicito de tool calling, function calling ni modos de razonamiento extendido (thinking mode) en la informacion disponible.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como la ablacion de la direccion de rechazo afecta al comportamiento del modelo base, comparando respuestas antes y despues de la intervencion en experimentos controlados.
- Red teaming y evaluacion de filtros: sirve como modelo de referencia "sin filtros" para probar la robustez de clasificadores de contenido y sistemas de moderacion en pipelines de produccion.
- Despliegue local en dispositivos de borde: con cuantizacion Q4_K_M (986 MB) puede ejecutarse en Raspberry Pi, portatiles sin GPU dedicada o telefonos de gama alta mediante llama.cpp u Ollama, ofreciendo un asistente conversacional offline.
- Prototipado rapido de asistentes conversacionales: su ligereza permite iterar en el diseno de prompts y flujos conversacionales sin coste de infraestructura cloud, antes de migrar a modelos mayores.
- Generacion de texto creativo sin restricciones: util para escritura de ficcion, guiones o contenido donde las negativas del modelo base interrumpen el flujo creativo, siempre con supervision humana.
- Educacion e investigacion linguistica: permite analizar el comportamiento bilingue ingles-chino de un modelo pequeno y comparar la calidad de respuestas con y sin alineamiento.
- Entornos aislados sin conectividad: al ser un GGUF autonomo, puede desplegarse en sistemas air-gapped para tareas de procesamiento de texto donde no se permite enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB para Q4_K_M y 1,2 GB para Q5_K_M, incluyendo overhead de contexto moderado; con contextos largos la memoria adicional por KV cache puede elevar el consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3050, RTX 4060); en GPUs de gama alta (RTX 4090, A100, H100) el modelo queda sobredimensionado y el cuello de botella sera el ancho de banda de memoria, no la capacidad.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna, e incluso en iGPU y CPU exclusivamente.
- Opciones de despliegue: llama.cpp, Ollama (etiqueta `hf.co/EEU/Qwen2.5-1.5B-Instruct-abliterated:Q5_K_M`), y cualquier runtime compatible con GGUF. No se distribuyen pesos safetensors en este repositorio, por lo que vLLM o TGI requeririan conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada; en CPU moderna se espera un rendimiento de decenas de tokens por segundo con Q4_K_M, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EEU/Qwen2.5-1.5B-Instruct-abliterated | 1,54B | no disponible | Apache 2.0 | GGUF | Variante abliterada, sin rechazos, solo cuantizaciones Q4_K_M y Q5_K_M |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (segun documentacion del modelo base) | Apache 2.0 | safetensors, GGUF | Modelo original alineado, con rechazos; referencia de calidad |
| Qwen/Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens (segun documentacion del modelo base) | Apache 2.0 | safetensors, GGUF | Alternativa mas pequena de la misma familia, menor calidad pero aun mas ligera |
| Meta Llama 3.2 1B Instruct | 1,24B | 128.000 tokens (segun documentacion del modelo base) | Llama 3.2 Community License | safetensors, GGUF | Alternativa alineada de tamano similar, con restricciones de licencia para uso comercial |

## Limitaciones y advertencias

- La ablacion elimina el mecanismo de rechazo, pero no garantiza la ausencia de contenido danino: el modelo puede generar respuestas inexactas, ofensivas o peligrosas sin advertirlo, lo que exige supervision humana en cualquier uso en produccion.
- Riesgo elevado de alucinacion, acentuado por el tamano reducido (1,5B parametros) y por la posible perdida de capacidades tras la intervencion en los pesos.
- La ablacion puede degradar sutilmente la coherencia, el seguimiento de instrucciones complejas o el conocimiento factual respecto al modelo base; no se documenta una evaluacion sistematica de esta perdida.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre el cumplimiento normativo en jurisdicciones que regulan la generacion de contenido.
- Solo se distribuyen dos cuantizaciones GGUF (Q4_K_M y Q5_K_M); no hay pesos en precision completa ni safetensors en este repositorio, lo que limita la experimentacion con tecnicas que requieran pesos originales.
- El modelo tiene un numero muy bajo de descargas (259) y un solo like en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.
- No se especifica la longitud de contexto efectiva de esta variante; debe asumirse la del modelo base o verificarse empiricamente antes de desplegar conversaciones largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/EEU/Qwen2.5-1.5B-Instruct-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Documentacion de Qwen2.5 (Alibaba): no disponible en la informacion proporcionada
- Paper de referencia sobre ablacion direccional: no disponible en la informacion proporcionada
- Repositorio de llama.cpp: no disponible en la informacion proporcionada
- Ollama: no disponible en la informacion proporcionada
