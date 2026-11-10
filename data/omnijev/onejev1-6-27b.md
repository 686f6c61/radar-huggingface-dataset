# OmniJev/OneJev1.6-27B

## Resumen

OneJev1.6-27B es un modelo multimodal de decisión desarrollado por OmniJev, construido como un fine-tune completo de Qwen/Qwen3.8-27B. A diferencia de los modelos generativos convencionales, su función principal es recibir un estado del entorno (captura de pantalla, fotografía, vídeo o texto) junto con un conjunto de preguntas tipadas y devolver, en un único forward pass, una probabilidad calibrada para cada opción de respuesta. Está diseñado específicamente para el paradigma "System One": decisiones rápidas y calibradas en lugar de razonamiento extendido paso a paso.

El modelo se entrena sobre aproximadamente 440.000 preguntas extraídas de ejecuciones reales de agentes, vídeos, imágenes y particiones de entrenamiento de conjuntos de datos públicos de decisión. Con 27.356.728.560 parámetros y un repositorio de 54,7 GB en safetensors, se posiciona en la franja de 25B-36B parámetros, donde compite con alternativas como StartLux-Decision v1.1 27B, KnowLine 35B-A3B Gen1 o Perplexity Decider v1.2.

Su relevancia actual radica en la puntuación obtenida en el Decision Index 0.3 (parte pública): 69,49 puntos sobre 37 benchmarks y 140.178 peticiones, lo que lo sitúa en segunda posición de los 172 modelos del tablero y a la par con KnowLine 35B-A3B Gen1. La licencia Apache 2.0 y su compatibilidad con endpoints lo hacen apto para integración en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.8-27B, tag `qwen3_5`), fine-tune completo |
| Parámetros totales | 27.356.728.560 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OneJev1.6-27B es un fine-tune completo (no LoRA ni adaptadores) del modelo base Qwen/Qwen3.8-27B, que aporta la arquitectura transformer multimodal subyacente. El pipeline declarado es `image-text-to-text`, y el modelo acepta además vídeo a través de la API de servicio Flide. La innovación principal no reside en la arquitectura del backbone, sino en la formulación de la tarea: el modelo no genera texto libre, sino que produce distribuciones de probabilidad calibradas sobre opciones definidas por el usuario (preguntas de tipo `noul` para sí/no, `choice` para selección entre opciones y `score` para niveles ordenados).

El entrenamiento se realizó sobre aproximadamente 440.000 preguntas provenientes de ejecuciones reales de agentes, vídeos, imágenes y particiones de entrenamiento de conjuntos de datos públicos de decisión. La model card no detalla el número total de tokens, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. El conjunto de evaluación (OneJev test set) contiene preguntas de los mismos tipos que el entrenamiento pero que ningún modelo vio durante el entrenamiento, lo que permite medir generalización dentro de la tarea.

## Capacidades

- Decisión multimodal calibrada: devuelve probabilidades por opción en un solo forward pass a partir de imagen, vídeo o texto.
- Preguntas tipadas: soporta tres formatos de pregunta (`noul` para probabilidad de sí, `choice` para distribución sobre opciones con criterios, `score` para nivel esperado en una escala ordenada).
- Comprensión de capturas de pantalla y GUI: orientado a agentes que operan interfaces gráficas (etiqueta `gui-agent`).
- Procesamiento de vídeo: admite entrada de vídeo además de imagen estática.
- Procesamiento de imagen fija: fotografía o screenshot como estado del entorno.
- Entrada de texto plano: puede operar únicamente con estado textual y preguntas.
- Salida calibrada: las probabilidades están pensadas para ser usadas directamente como señal de decisión (umbrales, políticas, selección de acción).
- Compatibilidad con endpoints: tag `endpoints_compatible`.
- Conversacional y multimodal: tags `conversational` y `multimodal`.
- No se documenta soporte explícito de tool calling, function calling ni modo thinking en la información disponible.

## Casos de uso

- Agentes de automatización de GUI: el modelo recibe una captura de pantalla y el estado de la tarea ("pagar la factura de ACME") y devuelve la probabilidad de cada acción siguiente (clic, escribir, scroll, parar), lo que permite construir políticas de agente con umbrales de confianza explícitos.
- Verificación de finalización de tareas: mediante preguntas de tipo `noul` ("la factura ha sido pagada"), el modelo proporciona una probabilidad de éxito que un orquestador puede usar para decidir si continuar o detener el agente.
- Seguimiento de progreso: con preguntas de tipo `score`, estima el nivel de avance de una tarea en una escala ordenada ("no iniciado", "a medias", "casi hecho", "hecho"), útil para planificación y para detectar agentes bloqueados.
- Enrutamiento de decisiones en pipelines de agentes: al devolver distribuciones calibradas, puede integrarse como clasificador de siguiente acción en sistemas multi-agente donde se requiere una señal probabilística en lugar de texto generado.
- Análisis de vídeo para decisión: al aceptar vídeo como entrada, puede evaluar estados dinámicos (por ejemplo, si una animación o transición ha terminado) y emitir probabilidades sobre el estado observado.
- Evaluación automática de trayectorias de agentes: dado un registro de ejecución con capturas, el modelo puede puntuar si cada paso se completó correctamente, sirviendo como juez calibrado en pipelines de evaluación.
- Anotación asistida de datasets de decisión: las probabilidades por opción permiten priorizar muestras para revisión humana según la confianza del modelo.

## Benchmarks y rendimiento

| Benchmark | OneJev1.6-27B | Referencia |
|---|---|---|
| Decision Index 0.3 (parte pública, 37 benchmarks, 140.178 peticiones) | 69,49 | OneJev1.5-27B: 63,64; StartLux-Decision v1.1 27B: 72,88; KnowLine 35B-A3B Gen1: 69,49; Perplexity Decider v1.2 (27B): 67,74; RSI-Jev v6.1 VL 27B (effort auto): 65,64 |

La model card menciona una tabla de resultados adicional frente a Jev 1.13, Jev-Omni 12B y Qwen3.8-27B thinking sobre el OneJev test set, pero los valores numéricos no están incluidos en la información proporcionada, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa por tamaño (27,36B parámetros), en FP16 requeriría del orden de 55 GB de VRAM solo para pesos, lo que excede cualquier GPU de consumo; con cuantización a 8 bits rondaría 27-30 GB y a 4 bits unos 14-16 GB, aunque el autor no publica cifras oficiales ni formatos cuantizados.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, un despliegue en FP16 requeriría A100 80GB, H100 80GB o múltiples GPU; no se confirma compatibilidad con RTX 4090 en ningún formato.
- ¿Cabe en GPU de consumo? No confirmado. El repositorio solo distribuye safetensors (54,7 GB), sin GGUF ni cuantizaciones publicadas.
- Opciones de despliegue: el autor documenta Flide (`uv pip install flide torchvision`, `flide serve --model OmniJev/OneJev1.6-27B`), que sirve la System One API de TypeSafe con campo `media`. También es compatible con `transformers` (librería declarada). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El modelo está diseñado para resolver cada consulta en un único forward pass, lo que en principio reduce la latencia frente a modelos generativos con razonamiento extendido, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index 0.3 (público) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OneJev1.6-27B | 27,36B | no disponible | 69,49 | Apache 2.0 | Hugging Face, Flide |
| StartLux-Decision v1.1 27B | ~27B | no disponible | 72,88 | no disponible | no disponible |
| KnowLine 35B-A3B Gen1 | 35B (A3B, MoE) | no disponible | 69,49 | no disponible | no disponible |
| Perplexity Decider v1.2 (27B) | ~27B | no disponible | 67,74 | no disponible | no disponible |
| RSI-Jev v6.1 VL 27B (effort auto) | ~27B | no disponible | 65,64 | no disponible | no disponible |

Los cuatro modelos comparados son los de mayor puntuación en la franja de 25B a 36B parámetros del tablero Decision Index a 16 de octubre de 2026. Los datos de contexto, licencia y disponibilidad de los competidores no están incluidos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado en decisión calibrada sobre opciones predefinidas; no es un modelo generativo de propósito general y no debe usarse para generar texto libre.
- No se documentan sesgos conocidos, pero al entrenarse sobre ejecuciones reales de agentes y datasets públicos de decisión, puede heredar sesgos de esos datos.
- Riesgo de alucinación: no aplica en el sentido clásico (no genera texto), pero las probabilidades pueden estar mal calibradas fuera de la distribución de entrenamiento; el autor no publica métricas de calibración (ECE, Brier) en la información disponible.
- Idiomas soportados no documentados; no se garantiza comportamiento multilingüe.
- Longitud de contexto no documentada; limita la planificación de integraciones con estados muy largos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen/Qwen3.8-27B debe verificarse por separado para confirmar compatibilidad de licencias en producción.
- Solo se distribuyen pesos en safetensors (54,7 GB); no hay cuantizaciones oficiales, lo que dificulta el despliegue en hardware limitado.
- La API documentada depende de Flide y de la System One API de TypeSafe; la integración con otros servidores de inferencia no está documentada.
- El número de descargas (470) y likes (2) es bajo, lo que sugiere adopción limitada y menor madurez del ecosistema frente a alternativas consolidadas.

## Enlaces

- Hugging Face: https://huggingface.co/OmniJev/OneJev1.6-27B
- Organización en Hugging Face: https://huggingface.co/OmniJev
- Repositorio GitHub: https://github.com/OmniJev/OneJev
- Sitio web: https://omnijev.github.io/OneJev/
- Paper de Flide: https://arxiv.org/abs/2610.42148
- Repositorio Flide: https://github.com/OmniJev/Flide
- Decision Index 0.3 (Space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia: https://github.com/OmniJev/OneJev/blob/main/LICENSE
