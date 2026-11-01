# HeliosFenrir/radiator-assistant-en-lora

## Resumen

Radiator Assistant EN LoRA es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario HeliosFenrir sobre el modelo base Qwen/Qwen2.5-0.5B-Instruct. Se trata de un ajuste fino supervisado (SFT) orientado a una tarea vertical muy concreta: la asistencia relacionada con radiadores, presumiblemente en un dominio de atencion al cliente o soporte tecnico de calefaccion. El adaptador no es un modelo autonomo, sino un conjunto de pesos de bajo rango que deben cargarse mediante la libreria PEFT sobre el modelo base de Qwen para funcionar.

El modelo base, Qwen2.5-0.5B-Instruct, es un transformer decoder-only de 0,5 mil millones de parametros desarrollado por Alibaba Qwen, con una ventana de contexto nativa de 32.768 tokens y capacidad multilingue. Al tratarse de un adaptador LoRA, el coste computacional y de almacenamiento es minimo, lo que lo hace adecuado para despliegues ligeros en entornos con recursos limitados o para tareas de nicho donde no se justifica un modelo de mayor tamano.

La relevancia de esta ficha es limitada pero ilustrativa: muestra el patron tipico de adaptacion de un modelo pequeno a un dominio especifico mediante PEFT. No obstante, la informacion publicada por el autor es extremadamente escasa (sin resultados de benchmarks, sin descripcion del dataset de entrenamiento, sin idiomas declarados y con solo 15 descargas), por lo que muchas de las especificaciones que siguen deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer decoder-only (Qwen2.5-0.5B-Instruct) |
| Parametros totales | 0,5 mil millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantizaciones estandar de la familia Qwen2.5) |
| Idiomas soportados | no disponibles (la etiqueta del modelo indica "en", lo que sugiere entrenamiento en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la tecnica LoRA, que congela los pesos del modelo base e inyecta matrices de descomposicion de bajo rango en determinadas capas del transformer. Esto permite un ajuste fino eficiente en memoria y almacenamiento, ya que solo se entrenan y distribuyen los pesos del adaptador, no el modelo completo. El modelo subyacente es Qwen2.5-0.5B-Instruct, un transformer decoder-only con atencion causal estandar, normalizacion RMSNorm y activacion SwiGLU, entrenado por Alibaba Qwen sobre un corpus multilingue y posteriormente alineado mediante instrucciones.

El entrenamiento del adaptador se realizo mediante SFT (supervised fine-tuning), segun la etiqueta del repositorio. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el rango del adaptador (r), el valor de alpha, la tasa de aprendizaje ni si se aplicaron tecnicas adicionales como DPO o RLHF. Tampoco se documenta que capas se adaptaron ni el numero de ejemplos utilizados. La model card es practicamente un placeholder que remite al modelo fusionado HeliosFenrir/radiator-assistant-en.

## Capacidades

- Generacion de texto y respuesta a instrucciones en el dominio de radiadores y calefaccion, presumiblemente en ingles.
- Razonamiento conversacional multi-turno heredado del modelo base Qwen2.5-0.5B-Instruct.
- Soporte de tool calling y function calling: no disponible de forma explicita en la informacion proporcionada; el modelo base Qwen2.5-0.5B-Instruct si lo soporta, pero no se confirma que el adaptador lo preserve.
- Capacidades de agente y razonamiento multi-paso: no documentadas para el adaptador.
- Capacidades multilingues: no disponibles; la etiqueta "en" sugiere un enfoque en ingles.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Atencion al cliente especializada en radiadores: el adaptador puede gestionar consultas frecuentes sobre modelos, potencias, instalacion y mantenimiento, aprovechando el ajuste SFT sobre el dominio y la ventana de contexto de 32.768 tokens del modelo base para conversaciones multi-turno con historial largo.
- Asistente de soporte tecnico en tienda online: integrado en un chatbot de e-commerce, puede responder preguntas sobre compatibilidad de radiadores con sistemas de calefaccion existentes, reduciendo la carga del equipo humano.
- Generacion de fichas de producto: el modelo puede redactar descripciones tecnicas de radiadores a partir de especificaciones estructuradas, aunque la calidad dependera del dataset de SFT, no documentado.
- Clasificacion y enrutado de consultas: dado su tamano reducido (0,5B), puede desplegarse como primer nivel de triaje en un pipeline de atencion al cliente, derivando consultas complejas a modelos mayores.
- Prototipado rapido de asistentes verticales: sirve como plantilla para equipos que quieran adaptar un modelo pequeno a un dominio concreto mediante LoRA, con un coste de entrenamiento e inferencia muy bajo.
- Despliegue en edge o entornos con recursos limitados: al ser un adaptador sobre un modelo de 0,5B, puede ejecutarse en CPU o en GPUs consumer modestas, lo que facilita demos y pruebas de concepto en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en FP16 requiere aproximadamente 1 GB de VRAM; en cuantizacion de 4 bits, alrededor de 0,5 GB. El adaptador LoRA anade un consumo marginal (tipicamente decenas de MB).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo, pero validas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (GTX 1650, RTX 3050 en adelante) e incluso en CPU para inferencia con llama.cpp u Ollama.
- Opciones de despliegue: PEFT + Transformers (carga del adaptador), vLLM (con soporte de adaptadores LoRA), llama.cpp/Ollama (tras fusion del adaptador con el modelo base y conversion a GGUF), TGI (con adaptadores).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; en un modelo de 0,5B se esperan latencias de decenas de milisegundos por token en GPU y de cientos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Radiator Assistant EN LoRA (este) | 0,5B (base) | 32.768 | Apache 2.0 | HuggingFace, 15 descargas | Adaptador LoRA de nicho, sin benchmarks |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | 32.768 | Apache 2.0 | HuggingFace, ampliamente usado | Modelo base generalista, con benchmarks publicados |
| HeliosFenrir/radiator-assistant-en | 0,5B (base) | 32.768 | Apache 2.0 | HuggingFace | Version fusionada del adaptador, mismo autor |
| Llama 3.2 1B Instruct | 1B | 128.000 | Llama 3.2 Community License | HuggingFace | Alternativa generalista de mayor tamano, con benchmarks publicados |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de Qwen2.5-0.5B-Instruct, hereda los sesgos del corpus de entrenamiento del modelo base, no evaluados en el adaptador.
- Riesgo de alucinacion: alto en un modelo de 0,5B, especialmente en un dominio tecnico donde las especificaciones de producto deben ser exactas; no se han publicado evaluaciones de fidelidad.
- Limitaciones de contexto o idioma: el adaptador esta etiquetado como "en", por lo que su rendimiento en castellano u otros idiomas no esta garantizado; el contexto de 32.768 tokens es el del modelo base y no se confirma que el adaptador lo aproveche.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni documentacion sobre el dataset de entrenamiento, lo que puede plantear riesgos de cumplimiento si el dataset contuviera material con derechos.
- Caveats para produccion: la model card es un placeholder sin informacion sobre el dataset, hiperparametros del LoRA ni evaluacion; con 15 descargas y 0 likes, no hay evidencia de validacion por la comunidad. No se recomienda su uso en produccion sin una evaluacion propia y sin verificar la calidad del modelo fusionado.
- Dependencia del modelo base: requiere cargar Qwen/Qwen2.5-0.5B-Instruct, lo que anade complejidad al despliegue frente a un modelo fusionado.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/HeliosFenrir/radiator-assistant-en-lora
- Modelo fusionado referenciado: https://huggingface.co/HeliosFenrir/radiator-assistant-en
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
