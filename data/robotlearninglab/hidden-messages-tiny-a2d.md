# RobotLearningLab/hidden-messages-tiny-a2d

## Resumen

Hidden Messages Tiny-A2D es un adaptador de comunicación para modelos de lenguaje de difusión, no un modelo de lenguaje autónomo. Lo publica el grupo RobotLearningLab como artefacto complementario del artículo "Hidden Messages Between Diffusion Language Model Agents: Causal Evidence for Latent Communication", aceptado en el taller DiffuLM de NeurIPS 2026. El adaptador implementa un canal latente entre dos agentes que comparten un backbone congelado: un compresor del estado del emisor y un fusionador de receptor residual con compuerta, con cuatro ranuras de mensaje de 128 dimensiones.

El problema que aborda es la comunicación entre agentes en tareas distribuidas de búsqueda en cadena (chain-lookup) del conjunto sintético HM-Synth. En lugar de intercambiar texto, los agentes intercambian estados latentes comprimidos, lo que permite estudiar de forma causal si existe transferencia de información útil entre trayectorias independientes. El backbone requerido es `dllm-hub/Qwen3-0.6B-diffusion-mdlm-v0.1`, un modelo de difusión de aproximadamente 0,6 mil millones de parámetros que no se incluye en este repositorio.

La relevancia es fundamentalmente de investigación: el artefacto permite reproducir el canal de comunicación del artículo, pero no está pensado para despliegue en producción ni para generación de texto. Es un checkpoint de PyTorch (`tiny_a2d_channel.pt`) espejo del release de código original, sin reentrenamiento ni conversión de formato, y sin validación de inferencia o benchmarks nuevos en el Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre backbone de difusión: compresor de estado del emisor y fusionador receptor residual con compuerta; 4 ranuras de mensaje de 128 dimensiones |
| Parametros totales | No disponible (el adaptador es un state dict de PyTorch; el backbone Qwen3-0.6B tiene ~0,6 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (`.pt`) con `config.yaml`; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El adaptador se compone de dos módulos: un compresor que reduce el estado oculto del agente emisor a cuatro ranuras de 128 dimensiones, y un fusionador residual con compuerta que inyecta esos mensajes en el receptor. El backbone es un modelo de lenguaje de difusión (diffusion MDLM) basado en Qwen3-0.6B, que permanece congelado durante el entrenamiento del canal. La clase `ReceiverChannel` y los módulos de compresión y fusión están definidos en `code/src/hidden_messages/communication/` del repositorio de código original.

El entrenamiento es supervisado y específico de tarea, sobre tareas sintéticas de chain-lookup distribuidas del conjunto HM-Synth. Se usan estados de profesor con contexto de unión y supervisión emparejada (matched versus deranged), y la evaluación emplea contextos privados separados. El artículo reporta evidencia causal mediante intervenciones sobre los mensajes. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- No es un modelo de lenguaje: no genera texto de forma autónoma ni expone una API de generación.
- Implementa un canal de comunicación latente entre dos agentes que comparten el backbone de difusión congelado.
- Compresión del estado del emisor en cuatro ranuras de 128 dimensiones.
- Fusión residual con compuerta en el receptor.
- Entrenado para tareas sintéticas de chain-lookup distribuidas (HM-Synth).
- No soporta tool calling ni function calling.
- No soporta agentes multi-paso de propósito general.
- Capacidad multilingüe limitada al inglés en los datos declarados.
- No incluye visión, audio ni modo de razonamiento explícito.
- Requiere trayectorias de agente independientes, un receptor designado e intervenciones causales sobre los mensajes como parte del montaje evaluado.

## Casos de uso

- Reproducción de resultados del artículo: cargar el state dict con `torch.load(..., weights_only=True)` y la arquitectura `ReceiverChannel` para replicar el canal de comunicación en HM-Synth y contrastar las cifras de `evidence/tiny_controlled_results.json`.
- Investigación en comunicación latente entre agentes: usar el adaptador como línea base controlada para estudiar transferencia de información entre trayectorias de modelos de difusión.
- Experimentos de interpretabilidad causal: aplicar intervenciones sobre las ranuras de mensaje para medir el efecto en la tarea del receptor, siguiendo el protocolo del paper.
- Estudio de arquitecturas de adaptadores sobre backbones congelados: analizar el diseño compresor-fusionador con compuerta como alternativa a la comunicación textual en sistemas multiagente.
- Docencia y divulgación: demostrar de forma reproducible cómo se entrena y evalúa un canal supervisado entre agentes de difusión en una tarea sintética acotada.
- Comparación metodológica: contrastar este canal específico de HM-Synth con el adaptador Dream QASC del mismo grupo, teniendo en cuenta que el autor advierte que no son intercambiables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a `evidence/tiny_controlled_results.json` del repositorio de código para las cifras reportadas, pero no se proporcionan valores numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador; el backbone Qwen3-0.6B en precisión completa requiere del orden de 1,2-2,4 GB solo para pesos, más memoria de activaciones y estados de difusión.
- GPU recomendadas: no disponibles; el autor indica que el flujo reportado usa un entorno CUDA, sin especificar modelos de GPU.
- GPU de consumo: el backbone de 0,6 mil millones es compatible con GPUs de consumo en teoría, pero no se ha validado en este repositorio.
- Opciones de despliegue: no hay soporte de vLLM, llama.cpp, Ollama ni TGI; requiere el código original y dependencias fijadas del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hidden Messages Tiny-A2D | Adaptador de canal latente sobre backbone de difusión | No disponible (backbone ~0,6 B) | No disponible | Apache-2.0 | HuggingFace (solo adaptador) |
| Backbone Qwen3-0.6B-diffusion-mdlm-v0.1 | Modelo de difusión | ~0,6 B | No disponible | No disponible | HuggingFace (`dllm-hub`) |
| Adaptador Dream QASC del mismo grupo | Adaptador de canal para otra tarea | No disponible | No disponible | No disponible | Repositorio de código del grupo |

La comparación con modelos de lenguaje convencionales no es pertinente: este artefacto no compite en generación de texto. El autor advierte explícitamente que no debe asumirse intercambiable con el adaptador Dream QASC.

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: es un adaptador de comunicación específico de tarea.
- El backbone no está incluido; hay que descargarlo por separado con la revisión fijada `c8d24a3f4adaeef46881b450e1bf7d1005203bd7`.
- No implementa `AutoModel.from_pretrained` ni un endpoint de generación de texto alojado.
- El autor declara que no se realizó inferencia ni validación de benchmarks nueva para este espejo del Hub; solo se replica el checkpoint original sin reentrenamiento.
- No es un lenguaje emergente, ni un mecanismo de privacidad, ni un protocolo universal entre tareas.
- La evaluación depende de un montaje concreto: trayectorias independientes, receptor designado e intervenciones causales sobre los mensajes.
- No se debe asumir interoperabilidad con el adaptador Dream QASC.
- Idiomas: solo inglés declarado.
- Licencia Apache-2.0 para los pesos del canal y la documentación; las dependencias externas se detallan en `THIRD_PARTY_LICENSES.md`.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible al no ser un modelo generativo de propósito general.
- Uso en producción: no recomendado; el artefacto está orientado a reproducción de investigación.

## Enlaces

- HuggingFace: https://huggingface.co/RobotLearningLab/hidden-messages-tiny-a2d
- Artículo (arXiv): https://arxiv.org/abs/2610.28905
- Repositorio de código: https://github.com/alanrbtx/hidden-messages-diffusion-agents/tree/1d1477b423ba4245b564840ce46aee039c79bcc8
- Script de la tarea: https://github.com/alanrbtx/hidden-messages-diffusion-agents/blob/1d1477b423ba4245b564840ce46aee039c79bcc8/code/scripts/phase5_hm_synth_tiny.py
- Resultados: https://github.com/alanrbtx/hidden-messages-diffusion-agents/blob/1d1477b423ba4245b564840ce46aee039c79bcc8/evidence/tiny_controlled_results.json
- Backbone: https://huggingface.co/dllm-hub/Qwen3-0.6B-diffusion-mdlm-v0.1
