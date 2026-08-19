# AnkitAI/parable-v3-staging

## Resumen

Parable-v3-staging es un modelo de lenguaje de la familia Parable, desarrollado por AnkitAI (Ankit Aglawe), orientado a tareas de agente y codificacion local. Se trata de un modelo de aproximadamente 4 000 millones de parametros (4 022 468 096), publicado en formato safetensors y GGUF, y etiquetado como conversacional. El proyecto Parable consiste en modelos pequenos ajustados mediante QLoRA sobre bases como Qwen3 o Granite, entrenados con trazas reales de agentes de Claude Fable 5 y GPT-5.5, con el objetivo de ofrecer capacidades de agente en entornos locales con recursos limitados.

Este modelo concreto se presenta como una version "staging" (en fase de pruebas), con una descarga de 115 y sin licencia especificada. La informacion publica disponible es escasa: no se detallan la arquitectura base exacta, la longitud de contexto, los idiomas soportados ni los benchmarks. Su relevancia radica en la propuesta de llevar capacidades de agente a modelos pequenos ejecutables en hardware de consumo, aunque su estado de desarrollo y falta de documentacion exigen cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente Transformer basado en Qwen3 o Granite, segun documentacion del proyecto Parable) |
| Parametros totales | 4 022 468 096 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio incluye archivos GGUF, por lo que se presume cuantizacion, pero sin detalle) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La informacion publica no detalla la arquitectura interna de este modelo especifico. Segun el repositorio GitHub del proyecto Parable, los modelos de la familia se entrenan mediante QLoRA sobre bases como Qwen3 (4B/8B) y Granite 4.1 (3B/8B), con tecnicas de enmascaramiento de perdida solo en completaciones (completion-only loss masking), reproduccion de dominios mixtos (mixed-domain replay) y un corpus de 10 600 filas de trazas de agentes, con limpieza de secretos y decontaminacion de datos de entrenamiento. Sin embargo, no se confirma si parable-v3-staging sigue exactamente ese esquema ni cual es su modelo base concreto.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. El repositorio en Hugging Face no incluye una model card detallada, y la unica informacion adicional proviene de la pagina del proyecto Parable, que menciona el entrenamiento con trazas reales de Claude Fable 5 y GPT-5.5, pero no ofrece metricas de rendimiento.

## Capacidades

- Conversacional: el modelo esta etiquetado como "conversational", lo que indica su orientacion a dialogos multi-turno.
- Tareas de agente: segun la pagina del proyecto, los modelos Parable estan disenados para tareas de agente local (agentic coding), es decir, para actuar como agentes que ejecutan pasos de razonamiento y herramientas en entornos de desarrollo.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que puede desplegarse en infraestructura de inferencia estandar.
- Formato GGUF: permite su ejecucion en Ollama y LM Studio, segun la documentacion del proyecto.
- No se confirman capacidades especificas de tool calling, vision, audio ni razonamiento avanzado para este modelo concreto.

## Casos de uso

- Asistente de codificacion local: el modelo puede integrarse en entornos de desarrollo como VS Code o terminales para sugerir codigo, explicar fragmentos o autocompletar, gracias a su tamano reducido que permite ejecucion en GPU de consumo.
- Automatizacion de tareas de agente: en pipelines de CI/CD, puede actuar como agente que interpreta instrucciones, ejecuta comandos y genera informes, aunque no se documenta soporte explicito de tool calling.
- Chatbot conversacional en local: al ser un modelo conversacional y estar disponible en GGUF, puede desplegarse con Ollama para atender consultas sin conexion a internet.
- Prototipado de agentes: su tamano permite experimentar con flujos de agente en hardware modesto, antes de escalar a modelos mayores.
- Educacion e investigacion: sirve como ejemplo de fine-tuning sobre trazas de modelos propietarios para estudiar la transferencia de capacidades de agente.
- Despliegue en edge: al requerir poca VRAM, es candidato para dispositivos con GPU integrada o incluso CPU con cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos en la pagina de Hugging Face ni en la documentacion del proyecto.

## Requisitos de hardware

- VRAM estimada: para un modelo de 4B en cuantizacion GGUF Q4_K_M, se estiman unos 2,5-3 GB de VRAM, aunque no se confirma la cuantizacion exacta disponible en el repositorio.
- GPU recomendadas: tarjetas con al menos 6 GB de VRAM (GTX 1660 Super, RTX 2060, RTX 3060) podrian ejecutarlo en cuantizacion ligera; para mayor velocidad, RTX 4090 o A100 serian adecuadas.
- Compatibilidad con consumer GPU: probablemente si, dado su tamano y formato GGUF, pero no hay pruebas publicadas.
- Opciones de despliegue: Ollama, LM Studio, llama.cpp (por el formato GGUF), y potencialmente vLLM o TGI si se usan los pesos safetensors, aunque no se indica compatibilidad explicita.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables. El modelo podria compararse con otros de ~4B como Qwen2.5-4B-Instruct, Llama-3.2-3B-Instruct o Granite-4.1-3B, pero no hay benchmarks publicados para parable-v3-staging. La unica referencia es que el proyecto Parable ofrece modelos de la misma familia en tamano 3B y 8B, pero sin metricas comparativas. Por tanto, se indica "no disponible".

## Limitaciones y advertencias

- Licencia no especificada: no se indica bajo que licencia se distribuye, lo que impide su uso comercial sin riesgo legal.
- Estado de desarrollo: la etiqueta "staging" indica que es una version de pruebas, no apta para produccion.
- Falta de documentacion: no hay model card, ni especificaciones de contexto, idiomas o tecnicas de entrenamiento detalladas.
- Posibles sesgos: al entrenarse sobre trazas de modelos propietarios (Claude, GPT), puede heredar sesgos o estilos de respuesta no deseados.
- Riesgo de alucinacion: sin datos de evaluacion, no se puede cuantificar su fiabilidad en tareas de razonamiento o codigo.
- Limitaciones de contexto: se desconoce la longitud maxima de contexto, lo que puede afectar a tareas que requieran memoria larga.
- Restricciones de uso: al no conocerse la licencia ni los terminos de uso, cualquier implementacion debe revisarse legalmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnkitAI/parable-v3-staging
- Perfil del autor en Hugging Face: https://huggingface.co/AnkitAI
- Pagina del proyecto Parable: https://ankitaglawe.com/parable
- Repositorio GitHub del proyecto: https://github.com/ankit-aglawe/parable
- Pagina del modelo en Ollama: https://ollama.com/parable
