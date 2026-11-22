# moonbox-dev/gemma-4-31B-it-MLX

## Resumen

Gemma 4 31B IT MLX es una conversión del modelo instructivo Gemma 4 31B de Google al formato MLX, optimizada para su ejecución en Macs con Apple Silicon. La desarrolla el usuario moonbox-dev (Moonbox), no Google, y se distribuye como una carpeta completa compatible con mlx-vlm: pesos, `config.json`, tokenizer, plantilla de chat, ajustes del procesador y un subdirectorio `mtp/` con el drafter de predicción multi-token de Google para decodificación especulativa. El modelo base es `google/gemma-4-31B-it`, un modelo multimodal de tipo image-text-to-text.

El interés de esta ficha reside en que ofrece una vía práctica para ejecutar un modelo de 31B parámetros con capacidades de visión en hardware de consumo de Apple, algo que con pesos en bf16 (unos 62 GB) resulta inviable en la mayoría de equipos. La build de 8 bits reduce el peso a aproximadamente 22 GB, lo que permite cargarlo en Macs con memoria unificada de 32 GB o superior, manteniendo una fidelidad alta respecto al original (KL de 0,047 nats y 97,0 % de coincidencia top-1 según el autor).

La licencia declarada es Apache 2.0, aunque el enlace de licencia apunta a los términos específicos de Gemma 4 de Google, lo que conviene verificar antes de un uso comercial. El repositorio ocupa 151 GB e incluye varias precisiones; los datos de benchmarks, idiomas y arquitectura interna del modelo base no se detallan en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 31B (según nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (build verificada en la model card); otras precisiones incluidas en el repo de 151 GB no detalladas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (formato MLX, compatible con mlx-vlm) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 31B en su variante instruction-tuned, desarrollado por Google. Se trata de un modelo multimodal que acepta imagen y texto como entrada y genera texto, según el pipeline declarado (image-text-to-text). La información disponible no detalla el número de capas, la dimensión oculta, el mecanismo de atención ni el volumen o composición de los datos de entrenamiento, ni si se aplicaron técnicas de RLHF o DPO.

La innovación destacable en esta distribución es la inclusión del subdirectorio `mtp/`, que contiene el drafter de predicción multi-token (multi-token prediction) de Google para decodificación especulativa. Este componente permite acelerar la generación al proponer varios tokens por paso y validarlos con el modelo principal. La conversión a MLX la realiza Moonbox, que además documenta métricas de fidelidad de la cuantización: la build de 8 bits presenta una divergencia KL de 0,047 nats y un 97,0 % de coincidencia top-1 frente al modelo original en bf16.

## Capacidades

- Generación de texto e instrucciones conversacionales (variante IT).
- Comprensión de imágenes y respuesta en texto (image-text-to-text).
- Decodificación especulativa mediante el drafter MTP incluido.
- Ejecución nativa en Apple Silicon a través de mlx-vlm.
- Capacidades de razonamiento y código: no confirmadas explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Cobertura multilingüe: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente local con visión en Mac: cargar la build de 8 bits en un Mac con 32 GB o más de memoria unificada para responder preguntas sobre imágenes (capturas, diagramas, fotos) sin enviar datos a la nube, aprovechando la naturaleza multimodal del modelo base.
- Prototipado de aplicaciones image-text-to-text: usar mlx-vlm para integrar el modelo en una app de escritorio que describa o analice imágenes localmente, gracias a que el repo incluye tokenizer, procesador y plantilla de chat listos para usar.
- Generación de texto asistida en entornos sin GPU dedicada: desplegar el modelo en un Mac Studio o MacBook Pro para tareas de redacción y resumen, aprovechando la decodificación especulativa del drafter MTP para reducir la latencia.
- Investigación en cuantización: comparar el comportamiento de la build de 8 bits (KL 0,047 nats, top-1 97,0 %) con otras precisiones del mismo repo para estudiar el impacto de la cuantización en tareas multimodales.
- Evaluación de fidelidad de conversiones MLX: usar las métricas documentadas por el autor como referencia para validar pipelines propios de conversión de modelos de Google a MLX.
- Desarrollo offline en portátiles Apple: ejecutar el modelo en un MacBook con memoria unificada suficiente para tareas de análisis de documentos escaneados o imágenes técnicas, sin conexión a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta métricas de fidelidad de la cuantización respecto al modelo original en bf16:

| Metrica | Build 8 bits |
|---|---|
| Divergencia KL frente a bf16 | 0,047 nats |
| Coincidencia top-1 | 97,0 % |

## Requisitos de hardware

- VRAM/memoria estimada: la build de 8 bits ronda los 22 GB de pesos (suma de los shards safetensors), por lo que requiere al menos 32 GB de memoria unificada para dejar margen al contexto y al drafter MTP.
- El repositorio completo ocupa 151 GB, pero solo es necesario descargar la carpeta de la precisión elegida.
- GPU recomendadas: Apple Silicon con memoria unificada amplia (M-series Max, Ultra o equivalentes). No aplica a GPU NVIDIA o AMD, ya que el formato es MLX.
- Cabe en GPU de consumo: sí, en Macs con 32 GB o más de memoria unificada; no es ejecutable en GPUs de consumo convencionales por el formato MLX.
- Opciones de despliegue: mlx-vlm (librería indicada por el autor); otras opciones como vLLM, llama.cpp, Ollama o TGI no están soportadas para este formato.
- Latencia y throughput: no disponibles; la decodificación especulativa con MTP debería reducirlos, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moonbox-dev/gemma-4-31B-it-MLX | 31B | no disponible | MLX safetensors | Apache 2.0 | Hugging Face (0 descargas) |
| google/gemma-4-31B-it | 31B | no disponible | safetensors (bf16) | Licencia Gemma 4 | Hugging Face (modelo base oficial) |
| Otras builds MLX de Gemma 4 | no disponible | no disponible | MLX | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es una release oficial de Google; la conversión y el empaquetado los realiza Moonbox, sin garantías de soporte.
- La licencia se declara como Apache 2.0, pero el enlace apunta a los términos de Gemma 4 de Google; conviene revisar las condiciones reales antes de uso comercial.
- Solo funciona en Apple Silicon mediante MLX; no es portable a otras plataformas sin reconversión.
- La build de 8 bits introduce una divergencia medible (KL 0,047 nats) que puede afectar a tareas sensibles a la precisión.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas del modelo base en la información disponible.
- El modelo tiene 0 descargas y 0 likes, por lo que su validación por la comunidad es nula.
- El tamaño del repositorio (151 GB) complica la descarga completa; se recomienda descargar solo la carpeta de la precisión deseada.
- La longitud de contexto, los idiomas y las capacidades de tool calling no están confirmadas, lo que limita la planificación de despliegues en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moonbox-dev/gemma-4-31B-it-MLX
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Librería mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Paper referenciado (arXiv 2607.02770): https://arxiv.org/abs/2607.02770
