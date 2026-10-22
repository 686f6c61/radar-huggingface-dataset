# nvidia/Flora-TempSeg

## Resumen

Flora-TempSeg (denominado Flora-segmenter-9B en la model card) es un adaptador LoRA publicado por NVIDIA sobre el modelo vision-language Qwen3.5-9B, especializado en segmentación temporal de operaciones en vídeos de manipulación robótica y humana. El modelo recibe una ventana temporal de vídeo (RGB, una o tres cámaras sincronizadas) junto con un prompt que describe la geometría de la ventana y devuelve un objeto JSON `segments` con coordenadas de intervalo locales y flags que indican si una operación continúa más allá de la ventana visible.

Forma parte de Flora, el data engine que NVIDIA utilizó para entrenar GR00T-2, y se libera para que la comunidad investigadora pueda escalar la anotación de datasets de robótica propios. No es un modelo generativo de propósito general: su salida son exclusivamente anotaciones temporales, sin etiquetas de acción, que el pipeline de Flora proyecta sobre el reloj de la fuente y cose en eventos a nivel de episodio.

Su relevancia actual reside en que ataca el cuello de botella de la curación de datos en robótica —la segmentación manual de demostraciones en sub-tareas— con un modelo de 9.000 millones de parámetros que reutiliza un VLM ya existente mediante un adaptador de apenas 0,5 GB. La licencia es estrictamente no comercial y el uso previsto se limita a investigación y desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer; VLM Qwen3.5 (encoder visual multimodal + LLM decoder-only) con adaptadores LoRA en las proyecciones de atención y MLP |
| Parametros totales | 9,0 x 10^9 (modelo base Qwen3.5-9B); el adaptador LoRA distribuido ocupa 0,5 GB |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para texto generico; ventana temporal de video: perfil standard de 16 s (64 slots a 4 Hz) o perfil long de 32 s (128 slots a 4 Hz) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors sin cuantizar; la cuantizacion del modelo base no esta documentada) |
| Idiomas soportados | no disponible; las instrucciones y la salida JSON estan documentadas en ingles |
| Licencia | NVIDIA OneWay Noncommercial License (22 de marzo de 2022); el modelo base Qwen3.5-9B se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere descargar el modelo base Qwen/Qwen3.5-9B, revision c202236235762e1c871ad0ccb60c8ee5ba337b9a |

## Arquitectura y entrenamiento

Flora-segmenter-9B parte de Qwen3.5-9B, un VLM con encoder visual nativo y un LLM decoder-only. El ajuste se realiza con Low-Rank Adaptation de rango 32 y alpha 64 sobre las proyecciones de atención y MLP del modelo de lenguaje; tanto los pesos base como el encoder visual permanecen congelados. El entrenamiento tiene dos fases: un ajuste supervisado (SFT) seguido de aprendizaje por refuerzo con Group Relative Policy Optimization (GRPO), usando una recompensa verificable de coincidencia temporal que actualiza únicamente los mismos parámetros LoRA.

En inferencia, los fotogramas muestreados de la ventana se codifican con el encoder visual y los tokens resultantes se combinan con un prompt que especifica la geometría de la ventana, el núcleo de emisión y la política de anotación. El decoder genera de forma autorregresiva un objeto JSON `segments` con coordenadas de intervalo locales y flags de continuación, sin etiquetas de acción. La innovación principal no es arquitectónica sino de pipeline: el modelo trabaja sobre ventanas solapadas con un núcleo de emisión (12 s en el perfil standard, 24 s en el long) y guardas de contexto (2 s y 4 s por lado respectivamente), de modo que el data engine puede avanzar ventana a ventana compartiendo contexto y proyectar los fragmentos sobre el reloj de la fuente (coordenadas a 20 Hz) para coserlos en eventos de episodio completo.

## Capacidades

- Localización temporal de operaciones en vídeo: predice coordenadas de intervalo en ticks de 20 Hz dentro de la ventana visible.
- Detección de continuidad: emite flags que indican si una operación empieza antes o termina después de la ventana, lo que permite el cosido entre ventanas consecutivas.
- Entrada multi-cámara: admite una cámara RGB o tres vistas sincronizadas dispuestas en mosaico (cámara principal arriba, muñeca izquierda abajo a la izquierda, muñeca derecha abajo a la derecha), con roles y disposición fijos declarados en el prompt.
- Salida estructurada: genera un objeto JSON `segments` parseable, adecuado para pipelines automatizados de anotación.
- Adaptación por prompt: la política de anotación, el rango válido y el núcleo de emisión se especifican en el prompt, lo que permite ventanas desplazadas para resolver límites ambiguos.
- No soporta tool calling ni function calling (no documentado).
- No está documentado como modelo agéntico ni con razonamiento multi-paso.
- No dispone de modo thinking ni de salida de audio.
- No genera etiquetas de acción ni descripciones textuales: esa función corresponde al captioner separado de Flora.

## Casos de uso

- Anotación de sub-tareas en datasets de manipulación robótica: el modelo recibe ventanas de 16 s a 4 Hz y devuelve los intervalos de cada operación, lo que permite segmentar episodios completos de forma automática y sustituir la anotación manual en proyectos con miles de demostraciones.
- Curación y filtrado de datos para modelos fundacionales de robótica: integrado en un pipeline de data engine, los segmentos producidos permiten descartar episodios mal segmentados o con operaciones incompletas antes de entrenar una política, reduciendo el coste de validación posterior.
- Transferencia humano a robot: al segmentar también vídeos de demostración humana, el modelo facilita la alineación de sub-tareas entre dominios y el estudio de la correspondencia entre manipulación humana y robótica.
- Pre-segmentación para captioning automático: los intervalos generados se pasan al captioner de Flora para producir instrucciones de acción por evento, de forma que ambos modelos encadenados construyen un dataset anotado extremo a extremo.
- Resolución de límites ambiguos mediante ventanas desplazadas: cuando una operación cruza el núcleo de emisión, el pipeline puede solicitar ventanas con desplazamiento para obtener una segunda estimación del límite y consolidar la frontera.
- Manipulación bimanual con tres cámaras: el mosaico de cámara principal más dos cámaras de muñeca permite segmentar operaciones que solo son visibles desde una vista lateral, algo habitual en tareas de ensamblaje con dos brazos.
- Prototipado y evaluación de pipelines de monitorización: investigadores pueden usar el modelo para generar anotaciones de referencia y comparar heurísticas de segmentación propias contra una salida estructurada reproducible.
- Investigación en physical auto-research: la disponibilidad de un segmentador abierto facilita experimentos sobre descubrimiento automático de habilidades y jerarquías de tareas en vídeo de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA pesa 0,5 GB, pero la inferencia requiere cargar el modelo base Qwen3.5-9B completo: aproximadamente 18 GB en BF16/FP16 solo para los pesos.
- VRAM estimada para el perfil standard (64 slots de vídeo): en torno a 30-40 GB en BF16, dominada por los tokens visuales de los 64 fotogramas y la caché KV asociada; el perfil long (128 slots) prácticamente duplica esa presión.
- VRAM estimada en cuantización de 4 bits del modelo base: 7-9 GB de pesos, más varios GB de caché para los tokens visuales; cabe en GPUs de consumo alto como RTX 4090 (24 GB) con margen ajustado y lotes pequeños.
- GPU recomendadas: A100 40/80 GB o H100 para procesar lotes de ventanas con el perfil long; L40S o RTX 6000 Ada (48 GB) como alternativa de coste intermedio; RTX 4090 viable solo en 4 bits y con una ventana por paso.
- Opciones de despliegue: transformers + peft para carga del adaptador; vLLM para servir el modelo base con el adaptador LoRA acoplado; llama.cpp u Ollama únicamente si se dispone de una conversión GGUF del base compatible con el adaptador, no documentada en la información disponible.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud, cada ventana implica codificar entre 64 y 128 fotogramas y decodificar un JSON corto, por lo que el coste dominante es el encoder visual y no la generación de texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flora-TempSeg (Flora-segmenter-9B) | 9,0 x 10^9 | ventana de 16 s o 32 s a 4 Hz; salida en ticks de 20 Hz | Segmentación temporal de operaciones en vídeo de manipulación | NVIDIA OneWay Noncommercial (solo investigacion) | HuggingFace, adaptador PEFT de 0,5 GB sobre Qwen3.5-9B |
| Qwen3.5-9B (modelo base) | 9,0 x 10^9 | no disponible en la informacion proporcionada | VLM de proposito general | Apache 2.0 | HuggingFace |
| Alternativas publicas de segmentacion temporal de acciones | no disponible | no disponible | Segmentacion temporal | no disponible | no disponible |

No se han identificado en la informacion disponible otros modelos abiertos directamente comparables en la tarea de segmentacion temporal de operaciones para datos de robotica con entrada multi-camara y salida JSON cosible entre ventanas.

## Limitaciones y advertencias

- Licencia no comercial: la NVIDIA OneWay Noncommercial License (22 de marzo de 2022) prohibe el uso comercial. El modelo se declara explícitamente como solo para investigación y desarrollo, sin soporte para producción.
- No debe usarse para controlar robots directamente ni como único monitor de seguridad de un sistema físico; sus salidas son anotaciones.
- Riesgo de alucinación de fronteras: el modelo puede inventar límites de intervalo plausibles en tramos ambiguos, oclusiones o movimientos rápidos, sin que exista una señal de confianza documentada en la información disponible.
- Sistema de coordenadas específico: la salida se expresa en ticks de 20 Hz sobre la ventana local, mientras que el muestreo de entrada es de 4 Hz; confundir ambos relojes o remuestrear los slots antes del procesador (`do_sample_frames=False`) invalida las predicciones.
- Dependencia fuerte del prompt: la geometría de la ventana, el núcleo de emisión y la política de anotación deben declararse de forma coherente con el perfil entrenado; en los extremos del episodio hay que registrar el rango válido real en lugar de tratar el padding como observación nueva.
- Perfiles fijos: solo se documentan los perfiles standard (16 s) y long (32 s) con sus guardas de contexto; no hay información sobre el comportamiento fuera de esos envoltorios.
- Idiomas no disponibles: no se especifica qué idiomas admiten las instrucciones, y el formato de salida está documentado en inglés.
- Sin etiquetas de acción: el modelo no describe qué ocurre, solo cuándo; requiere el captioner de Flora u otro componente para obtener instrucciones de acción.
- Validación limitada: con 169 descargas y 13 likes en el momento de la consulta, la comunidad aún no ha publicado evaluaciones independientes, y no hay benchmarks en la información disponible.
- Obligaciones adicionales por el modelo base: el uso de Qwen3.5-9B queda sujeto a la Apache 2.0, y el usuario es responsable de verificar el cumplimiento legal de su aplicación concreta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/Flora-TempSeg
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base (Apache 2.0): https://huggingface.co/Qwen/Qwen3.5-9B/blob/c202236235762e1c871ad0ccb60c8ee5ba337b9a/LICENSE
- NVIDIA OneWay Noncommercial License (22 de marzo de 2022): https://developer.download.nvidia.com/licenses/NVIDIA-OneWay-Noncommercial-License-22Mar2022.pdf
- NVIDIA Isaac GR00T: https://developer.nvidia.com/isaac/gr00t
- GR00T N1 White Paper: https://arxiv.org/abs/2503.14734
