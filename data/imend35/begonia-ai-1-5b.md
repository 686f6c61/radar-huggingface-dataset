# imend35/Begonia-AI-1.5B

## Resumen

Begonia AI 1.5B es un ajuste fino del modelo Qwen2.5-1.5B-Instruct orientado a un caso de uso muy concreto: asistente de recepción de un hotel turco ficticio (Begonvil Hotel). Lo desarrolla el usuario imend35 como proyecto educativo de fin de curso, y el repositorio contiene únicamente los pesos fusionados (modelo base más adaptador LoRA integrado), sin publicar la receta completa de despliegue.

El modelo resuelve tres tareas acotadas: responder en turco a preguntas habituales de recepción, recuperar información de una guía oficial del hotel mediante RAG con Chroma y emitir llamadas a herramientas en JSON para consultar datos de habitaciones y costes de alojamiento. Su relevancia es limitada fuera del ámbito docente: sirve como ejemplo reproducible de un pipeline QLoRA + RAG + tool calling sobre un modelo pequeño y como caso de estudio de evaluación automática con criterios definidos por el propio autor.

Arquitectura transformer decoder-only de la familia Qwen2.5, con 1.543.714.304 parámetros (aproximadamente 1,54 mil millones) y pesos en safetensors. El entrenamiento se hizo con QLoRA en 4 bits NF4 sobre 450 ejemplos sintéticos de conversaciones de recepción. No se documenta la longitud de contexto efectiva tras el ajuste ni la licencia de los pesos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5, etiqueta `qwen2`); ajuste fino del modelo base Qwen/Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (~1,54 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Entrenamiento en 4 bits NF4 (QLoRA); publicacion de pesos sin cuantizar en safetensors y version GGUF Q4_K_M en repositorio aparte |
| Idiomas soportados | Turco (`tr`) |
| Licencia | No disponible |
| Formato de pesos | safetensors (repositorio principal) y GGUF Q4_K_M (repositorio `imend35/Begonia-AI-GGUF`) |

## Arquitectura y entrenamiento

La base es Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención causal estándar y capacidad declarada de tool calling e instrucciones por parte del modelo original. Sobre esa base se aplicó un ajuste supervisado con QLoRA en cuantización 4 bits NF4, con rango LoRA 16, alpha 32 y dropout 0,05, durante 3 épocas. El conjunto de entrenamiento consta de 450 ejemplos sintéticos de conversaciones de recepción de hotel, con 60 ejemplos de validación y 60 de evaluación reservados. Posteriormente, el adaptador se fusionó en los pesos completos, que es lo que se publica en este repositorio; el adaptador suelto está en `imend35/Begonia-AI-LoRA`.

No se documenta el número total de tokens vistos, la composición detallada del dataset sintético, ni si hubo etapas de RLHF o DPO adicionales. La innovación técnica del proyecto no está en la arquitectura, sino en la integración: un pipeline RAG sobre Chroma que recupera pasajes de una guía hotelera oficial y un conjunto de herramientas estructuradas que el modelo invoca emitiendo JSON (información de habitaciones y costes de alojamiento). El autor reporta que la evaluación del agente se apoyó en un juez basado en Gemini para puntuar respuestas.

## Capacidades

- Generación de texto conversacional en turco con registro de recepcionista de hotel.
- Asunción consistente de la identidad del asistente (métrica de identidad del 0 % al 100 % tras el ajuste).
- Recuperación aumentada: consulta a una guía hotelera indexada en Chroma y respuesta basada en los pasajes recuperados.
- Tool calling en formato JSON: selección de herramientas estructuradas para información de habitaciones y costes de alojamiento (95 % de selección correcta en las comprobaciones del proyecto).
- Respuesta a preguntas operativas típicas: horarios de check-in y check-out, políticas, servicios e importes.
- Conversación multi-turno dentro de los límites del modelo base (longitud efectiva no documentada).
- Capacidades heredadas del modelo base potencialmente presentes, pero no evaluadas ni garantizadas por el autor.
- Sin soporte declarado de visión, audio ni otros modalidades.

## Casos de uso

- Prototipo docente de recepción hotelera: sirve para demostrar de extremo a extremo un flujo QLoRA + RAG + herramientas sobre un modelo de 1,5 B, con interfaz Gradio, en un aula o un trabajo de fin de curso.
- Base para un asistente de FAQ hotelera real: sustituyendo el corpus ficticio por la documentación del establecimiento, el pipeline de recuperación con Chroma puede reutilizarse; el modelo necesitaría reentrenamiento o al menos reevaluación con datos reales.
- Demostración de tool calling en producción controlada: el modelo emite JSON estructurado para consultar datos de habitaciones y precios, lo que permite integrarlo en un orquestador que valide el esquema y ejecute las consultas contra un backend verificado.
- Banco de pruebas de evaluación automática: las cuatro comprobaciones del autor (identidad, criterio de guía, formato JSON del agente y selección de herramienta) sirven como plantilla para montar un arnés de evaluación propio con LLM como juez.
- Experimentación con cuantización GGUF: la versión Q4_K_M permite probar el modelo en llama.cpp y medir el impacto de la cuantización en calidad gramatical y repetición de instrucciones de sistema en turco.
- Generación de datos sintéticos de conversación: el dataset y el modelo pueden usarse como punto de partida para producir diálogos de dominio hotelero en turco que luego se filtren y revisen manualmente.
- Pruebas de robustez y alucinación: útil como caso negativo, ya que el propio autor advierte de invención de precios y políticas, para calibrar sistemas de verificación y de derivación a humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks independientes (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas cifras existentes son comprobaciones automáticas definidas por el propio autor del proyecto, que no equivalen a precisión general del modelo:

| Metrica (comprobacion propia del proyecto) | Antes del ajuste | Despues del ajuste |
|---|---:|---:|
| Identidad (asunción del rol) | 0 % | 100 % |
| Criterio de respuesta basada en la guía | 10 % | 65 % |
| Formato JSON del agente | 90 % | 100 % |
| Selección de herramienta del agente | 10 % | 95 % |

Observaciones adicionales reportadas por el autor: dos peticiones de agente probadas seleccionaron la herramienta esperada y devolvieron la salida verificada de la herramienta, con puntuación 1,0 del juez basado en Gemini; la evaluación RAG inicial recuperó pasajes relevantes pero las respuestas generadas no fueron consistentemente correctas; una prueba posterior en la interfaz Gradio informó correctamente de los horarios de check-in y check-out, aunque añadió un detalle no verificado.

## Requisitos de hardware

- Inferencia en precisión de los pesos publicados: alrededor de 3,1 GB de pesos (tamaño del repositorio), con una VRAM estimada de 4 a 5 GB incluyendo caché KV para contextos moderados.
- Versión GGUF Q4_K_M: aproximadamente 1 GB de pesos, con una VRAM estimada de 2 a 3 GB en GPU o ejecución viable en CPU.
- GPU consumer: cabe holgadamente en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070 y superiores; también en GPUs de 4-6 GB con la cuantización Q4.
- GPU de centro de datos: A100, H100 o L4 no son necesarias para este tamaño; bastan para servir muchas réplicas o lotes grandes.
- Despliegue: llama.cpp y Ollama con el GGUF, vLLM o TGI con los pesos safetensors, y Gradio para la interfaz, que es la que el autor probó.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Begonia AI 1.5B | ~1,54 B | No disponible | Asistente hotelero en turco (QLoRA + RAG + tools) | No disponible | HuggingFace (pesos fusionados, LoRA y GGUF) |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,54 B | No disponible en esta ficha (modelo base) | Instrucciones generales y tool calling | No disponible en esta ficha | HuggingFace |
| Llama 3.2 1B Instruct | ~1,2 B | No disponible en esta ficha | Instrucciones generales multilingües | No disponible en esta ficha | HuggingFace |
| SmolLM2-1.7B-Instruct | ~1,7 B | No disponible en esta ficha | Instrucciones generales, orientado a eficiencia | No disponible en esta ficha | HuggingFace |

Begonia AI no aporta mejoras medibles frente a su modelo base en capacidades generales; su valor diferencial es la especialización en un dominio ficticio y el pipeline RAG y de herramientas que lo acompaña, no un rendimiento superior. Para tareas generales en turco o multilingües, el modelo base o las alternativas citadas son opciones más razonables, al no estar limitadas a un único rol.

## Limitaciones y advertencias

- Es un prototipo educativo; el hotel y todos los registros de entrenamiento son ficticios. No es un sistema de reservas y no crea reservas reales.
- Riesgo alto de alucinación en precios, políticas y detalles operativos; el propio autor lo advierte explícitamente.
- El éxito de la recuperación RAG no garantiza que la respuesta generada sea correcta: se observaron respuestas inexactas pese a recuperar pasajes relevantes.
- La selección de herramienta puede ser correcta y el resultado numérico aun así requerir verificación independiente.
- Idioma limitado al turco; no hay evidencia de calidad en castellano ni en otras lenguas.
- La comprobación de identidad y de formato JSON mide el cumplimiento de criterios del proyecto, no la corrección factual.
- La versión GGUF Q4_K_M mostró problemas gramaticales y repetición de instrucciones de sistema en las pruebas del autor.
- Licencia no declarada: no hay autorización explícita para uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Requiere revisión humana antes de cualquier uso operativo, y validación externa de toda salida numérica o de política.

## Enlaces

- Modelo fusionado en HuggingFace: https://huggingface.co/imend35/Begonia-AI-1.5B
- Adaptador LoRA: https://huggingface.co/imend35/Begonia-AI-LoRA
- Dataset: https://huggingface.co/datasets/imend35/Begonia-AI-Dataset
- Version GGUF: https://huggingface.co/imend35/Begonia-AI-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Paper, blog o demo adicionales: no disponibles en la información proporcionada (los resultados de la búsqueda web no guardan relación con el modelo).
