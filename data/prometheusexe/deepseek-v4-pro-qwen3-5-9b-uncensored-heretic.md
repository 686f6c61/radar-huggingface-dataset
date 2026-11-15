# PrometheusEXE/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es un modelo de lenguaje multimodal (image-text-to-text) de 9.409.813.744 parametros publicado por el usuario PrometheusEXE en Hugging Face. Se trata de un fine-tuning del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, que a su vez combina la arquitectura Qwen3.5 con destilacion de conocimiento de la familia DeepSeek-V4-Pro. El sufijo "UNCENSORED-heretic" indica que ha sido sometido a un proceso de abliteration o decensoring destinado a eliminar los mecanismos de rechazo y alineacion de seguridad del modelo original.

El modelo emplea la libreria transformers con pesos en safetensors (19,3 GB en el repositorio) y declara soporte para seis idiomas: ingles, chino, coreano, japones, espanol y ruso. Incorpora etiquetas que sugieren capacidades de razonamiento, matematicas, STEM, tool calling y function calling, ademas de tecnicas de entrenamiento como SFT, RL, GSPO (Group Sequence Policy Optimization) y MTP (Multi-Token Prediction). La licencia declarada es Apache 2.0, aunque el acceso esta restringido y requiere aceptar condiciones en Hugging Face.

Su relevancia radica en dos factores: por un lado, la combinacion de una base Qwen3.5 de ~9B con destilacion de un modelo de razonamiento de mayor tamano; por otro, la modificacion "uncensored", que lo hace atractivo para investigacion sobre alineacion, robustez de filtros de seguridad y evaluacion de sesgos, pero tambien problematico para despliegues en produccion con requisitos de cumplimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.5, con destilacion de DeepSeek-V4-Pro |
| Parametros totales | 9.409.813.744 (~9,4B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se asume compatibilidad con cuantizacion estandar via transformers/bitsandbytes, no confirmado) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo parte de Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un fine-tuning sobre una base Qwen3.5 de aproximadamente 9,4B parametros. La etiqueta `qwen3_5` confirma la familia arquitectonica, y `image-text-to-text` indica que el modelo conserva el encoder visual multimodal propio de la linea Qwen3.5. Las etiquetas `distillation` y `deepseek` sugieren que el entrenamiento incluyo destilacion de conocimiento desde la familia DeepSeek-V4-Pro hacia esta base mas pequena, un patron habitual para transferir capacidades de razonamiento a modelos desplegables en hardware de consumo.

El pipeline de entrenamiento declarado incluye SFT (supervised fine-tuning), RL (reinforcement learning), GSPO (Group Sequence Policy Optimization, una variante de optimizacion de politica usada en modelos de razonamiento recientes) y MTP (Multi-Token Prediction, tecnica de decodificacion especulativa que predice varios tokens por paso). El paso final de "heretic" corresponde a tecnicas de abliteration: identificacion de direcciones de activacion asociadas a rechazo y su supresion o proyeccion, lo que elimina el comportamiento de negativa ante ciertas peticiones. No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset ni detalles del proceso de abliteration.

## Capacidades

- Generacion de texto conversacional multi-turno en seis idiomas (en, zh, ko, ja, es, ru).
- Razonamiento explicito y cadenas de pensamiento, heredado de la destilacion de DeepSeek-V4-Pro.
- Matematicas y tareas STEM, con etiquetas especificas de `math` y `stem`.
- Generacion y comprension de codigo.
- Tool calling y function calling, con etiquetas explicitas `tool-use` y `function-calling`.
- Procesamiento de imagenes junto con texto (image-text-to-text), lo que permite tareas de VQA y descripcion visual.
- Capacidades de agente y razonamiento multi-paso derivadas del entrenamiento con RL/GSPO.
- Comportamiento "uncensored": responde a peticiones que el modelo base rechazaria, lo que constituye tanto una capacidad como un riesgo.

## Casos de uso

- Investigacion sobre alineacion y seguridad: util como caso de estudio controlado para medir el efecto de la abliteration sobre la tasa de rechazo, la calidad de respuesta y la aparicion de contenido danino, comparando contra el modelo base Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B.
- Evaluacion de robustez de filtros: permite probar clasificadores de seguridad y guardrails externos frente a un modelo que no aplica rechazo interno, midiendo cuantas peticiones problematicas pasan los filtros perifericos.
- Generacion de codigo en entornos de investigacion: con soporte de tool calling y function calling, puede integrarse en pipelines de agentes de codigo donde se requiera ejecucion de herramientas, siempre que el contexto de uso sea interno y controlado.
- Razonamiento matematico y STEM asistido: adecuado para prototipos de tutoria o resolucion de problemas donde se quiera evaluar la calidad de cadenas de razonamiento de un modelo destilado de 9B frente a alternativas mayores.
- Procesamiento multimodal de documentos: al aceptar imagen y texto, puede usarse para extraccion de informacion de capturas, diagramas o formularios en flujos de investigacion, con validacion humana posterior.
- Experimentacion multilingue: con seis idiomas declarados, sirve para estudiar el comportamiento de un modelo destilado y decensurado en lenguas distintas del ingles, incluido el espanol.
- Analisis de sesgos y contenido: al carecer de rechazo, es util para generar corpus de prueba que estresen sistemas de moderacion y para auditar la eficacia de pipelines de filtrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 18,8 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica se recomienda 24 GB o mas.
- Cuantizacion a 8 bits: en torno a 9-10 GB de pesos, viable en GPUs de 12-16 GB.
- Cuantizacion a 4 bits: en torno a 5-6 GB de pesos, viable en GPUs de consumo de 8 GB en adelante, con perdida de calidad no cuantificada.
- GPUs recomendadas: A100 40/80 GB o H100 para inferencia en bf16 con contexto largo; RTX 4090 (24 GB) para bf16 ajustado o 8 bits; RTX 3090, 4080 o 4070 Ti para cuantizacion 4-8 bits.
- Cabe en GPU de consumo: si, en configuraciones cuantizadas de 4-8 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta presente), y previsiblemente vLLM y llama.cpp/Ollama si se generan pesos GGUF, aunque no se confirma su publicacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| PrometheusEXE/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | ~9,4B | no disponible | Apache 2.0 | Multimodal, decensurado, acceso restringido |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (base) | ~9,4B | no disponible | no disponible en la informacion | Modelo original alineado; referencia directa para medir el efecto de la abliteration |
| Qwen3.5 9B (familia base) | ~9B | no disponible | no disponible en la informacion | Arquitectura de origen, sin destilacion DeepSeek |
| Modelos abliterated de la comunidad (p. ej. variantes Llama/Qwen) | 7-9B | variable | variable | Misma categoria de decensoring; comparacion cualitativa pendiente de benchmarks |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- El proceso de abliteration elimina los rechazos de seguridad: el modelo puede generar contenido danino, ilegal o inseguro sin filtro interno. No es apto para exposicion directa a usuarios finales sin guardrails externos.
- Riesgo elevado de alucinacion: es un modelo destilado de ~9,4B; la destilacion de razonamiento no garantiza fidelidad factual y no hay benchmarks publicados que la cuantifiquen.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que limita la reproducibilidad y el despliegue automatizado.
- Licencia Apache 2.0 declarada, pero el modelo base y el proceso de decensoring pueden introducir obligaciones adicionales no documentadas; conviene revisar las condiciones del modelo base antes de uso comercial.
- Longitud de contexto no documentada, lo que impide planificar despliegues con ventanas largas sin validacion empirica.
- Idiomas declarados (en, zh, ko, ja, es, ru) sin evaluacion publicada de calidad por idioma; el rendimiento en espanol no esta verificado.
- Sin descargas ni likes en el momento de la consulta y publicacion muy reciente (15 de noviembre de 2026): ausencia de validacion comunitaria.
- El repositorio ocupa 19,3 GB, coherente con pesos en bf16; no se confirma la publicacion de cuantizaciones GGUF oficiales.
- Uso en produccion desaconsejado sin auditoria legal y de seguridad previa, especialmente en jurisdicciones con requisitos de moderacion de contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PrometheusEXE/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion disponible.
