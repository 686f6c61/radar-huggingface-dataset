# jcanizalez/qwen3-1.7b-k8s-alert-triage-lora

## Resumen

qwen3-1.7b-k8s-alert-triage-lora es un adaptador LoRA publicado por el usuario jcanizalez sobre el modelo base Qwen/Qwen3-1.7B. Su tarea es acotada y muy concreta: recibe una alerta de Kubernetes junto con el estado del namespace afectado (pods, services y eventos recientes) y devuelve una única etiqueta que identifica la causa raíz del fallo, elegida entre doce clases de avería más una clase `none` para ruido rutinario. El adaptador no es un modelo de propósito general: es un clasificador de diagnóstico de SRE empaquetado como modelo generativo conversacional.

El interés del proyecto está en su planteamiento de despliegue: con 1.700 millones de parámetros y un adaptador de 17,4 millones de parámetros entrenables (el 1,00 % del modelo), el autor afirma que cabe en dos núcleos de CPU dentro del propio clúster que vigila, de modo que alertas, logs y topología no salen de la infraestructura. Sobre 124 alertas retenidas reporta un 82,3 % de precisión, frente al 67,7 % de Claude Opus 5 y el 60,5 % de Gemini 3.5 Flash-Lite con el mismo prompt, según su propio arnés de evaluación.

Es relevante ahora porque ejemplifica un patrón cada vez más habitual: adaptadores pequeños y especializados que baten a modelos frontera en una tarea vertical concreta, a una fracción del coste y sin exponer datos sensibles a terceros. La contrapartida, explícita en la propia model card, es que el modelo conoce los fallos de un clúster de demostración concreto, no los de un entorno real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso (Qwen3-1.7B) |
| Parámetros totales | 1,7 mil millones en el modelo base; adaptador LoRA de 17.432.576 parámetros entrenables (1,00 % del total) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens según las especificaciones del modelo base Qwen3-1.7B; no confirmado en la model card del adaptador |
| Tipos de cuantización | El adaptador se distribuye en safetensors (16 bits). Para GGUF el autor recomienda q8_0 (77,4 % de precisión) y desaconseja explícitamente q4_k_m (30,6 %) |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); convertible a GGUF tras fusionar con el base en 16 bits |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 16, sin dropout, aplicado sobre las siete proyecciones de todas las capas del transformer Qwen3-1.7B. Se entrenó sobre el base en 16 bits (no QLoRA), lo que permite una fusión exacta de los pesos. El conjunto de entrenamiento consta de 302 alertas procedentes de 156 ventanas de inyección de fallos en un clúster kind, divididas por ventana de inyección para garantizar que ningún incidente aparezca simultáneamente en entrenamiento y test. Se realizaron 3 épocas con tasa de aprendizaje 2e-4, batch efectivo 8, AdamW de 8 bits, scheduler lineal y semilla 7, en unos 9 minutos sobre una T4 gratuita de Colab usando Unsloth.

La innovación no está en la arquitectura, que es la estándar de Qwen3, sino en el diseño del prompt y del etiquetado. El modelo se entrenó con el modo de pensamiento (thinking) desactivado y con un formato estricto: un mensaje de sistema que enumera las etiquetas y un mensaje de usuario que concatena la alerta con el estado del namespace (`PODS`, `SERVICES`, `RECENT EVENTS`). La respuesta es siempre una única etiqueta. El autor publica la función `prompt_for` en `eval/baseline.py` para reproducir el formato exacto, y advierte de que cualquier desviación degrada el resultado. Las doce clases de fallo cubiertas son: `bad_image_tag`, `crashloop_bad_command`, `dependency_scaled_to_zero`, `dns_broken`, `init_container_failing`, `liveness_probe_failing`, `missing_configmap`, `missing_secret`, `readiness_probe_too_strict`, `resource_quota_exceeded`, `unschedulable_resources` y `wrong_service_selector`, más `none`.

## Capacidades

- Clasificación de causa raíz de alertas de Kubernetes: dado un evento de alerta y el estado del namespace, devuelve una de las trece etiquetas del vocabulario entrenado.
- Lectura de contexto operativo estructurado: interpreta listados de pods (fase, readiness, reinicios, contenedores en espera y últimas terminaciones), definiciones de services con sus selectores y eventos recientes del clúster.
- Generación de texto conversacional en formato chat, con plantilla de Qwen3 aplicada mediante `apply_chat_template`.
- Diagnóstico de doce patrones de fallo inyectados de forma deliberada (imágenes mal etiquetadas, CrashLoopBackOff, DNS roto, ConfigMaps y Secrets ausentes, cuotas excedidas, pods no planificables, selectores de service incorrectos, etc.).
- Detección de ruido rutinario mediante la etiqueta `none`.
- Inferencia en CPU: según el autor, es ejecutable en dos núcleos dentro del propio clúster.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso, ni visión, ni audio. El modo thinking debe permanecer desactivado (`enable_thinking=False` o `--reasoning off` en llama.cpp) para que coincida con el entrenamiento.
- Capacidad multilingüe: no disponible; el modelo se declara únicamente en inglés.

## Casos de uso

- Triaje automático de alertas en un clúster Kubernetes: el modelo recibe la alerta de Alertmanager junto con el volcado del namespace y etiqueta la causa. Encaja bien porque la salida es una única etiqueta, lo que permite enrutar la alerta al equipo o al runbook correspondiente sin intervención humana.
- Reducción de fatiga de alertas en guardias SRE: al clasificar el ruido rutinario como `none`, permite silenciar o agrupar notificaciones de baja prioridad y reservar la página para fallos reales.
- Enriquecimiento de tickets e incidentes: la etiqueta predicha se adjunta al incidente en Jira, PagerDuty u Opsgenie, aportando una hipótesis inicial de causa raíz antes de que el ingeniero abra el panel de observabilidad.
- Análisis en el borde con requisitos de soberanía de datos: al caber en dos núcleos de CPU, puede desplegarse como sidecar o CronJob dentro del propio clúster, de modo que alertas, logs y topología no salen de la infraestructura. Es el caso de uso que el autor destaca explícitamente.
- Prefiltro previo a un modelo mayor: dado que el autor señala que es más débil en `dns_broken` y en ruido, puede usarse como primer nivel de triaje que solo escala a un modelo mayor los casos dudosos.
- Generación de corpus etiquetado para observabilidad: integrado en un pipeline, permite etiquetar histórico de alertas y construir paneles de frecuencia de fallos por tipo, útil para priorizar trabajo de fiabilidad.
- Pruebas de caos automatizadas: durante la inyección de fallos, el modelo puede verificar que la alerta generada se clasifica con la etiqueta esperada, actuando como aserción dentro del propio experimento de caos.
- Formación y documentación interna: al devolver una etiqueta interpretable, sirve como herramienta didáctica para ingenieros junior que aprenden a leer el estado de un namespace y a mapear síntomas a causas.

## Benchmarks y rendimiento

Los datos proceden del arnés de evaluación del propio autor sobre 124 alertas retenidas; no se han verificado de forma independiente.

| Evaluación (124 alertas retenidas) | Resultado |
|---|---|
| Adaptador LoRA cargado (16 bits) | 82,3 % de precisión |
| Segunda ejecución de entrenamiento con la misma receta | 79,8 % de precisión |
| Claude Opus 5 con el mismo prompt | 67,7 % de precisión |
| Gemini 3.5 Flash-Lite con el mismo prompt | 60,5 % de precisión |

Ablación de cuantización publicada por el autor:

| Formato | Precisión |
|---|---|
| Adaptador LoRA cargado sobre el base 16 bits | 82,3 % |
| Adaptador fusionado en el base a 16 bits | 80,6 % |
| GGUF q8_0 | 77,4 % |
| GGUF q4_k_m | 30,6 % |

No se han publicado resultados en la información disponible para benchmarks estándar de propósito general (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5-4 GB con pesos en 16 bits y caché KV para un prompt corto; alrededor de 2-2,5 GB con GGUF q8_0. Son estimaciones a partir del tamaño de parámetros, no cifras publicadas.
- Cabe en GPU de consumo: sí. Cualquier GPU con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 2070 y superiores) puede ejecutar el modelo fusionado en 16 bits.
- CPU: el autor afirma que funciona en dos núcleos de CPU, lo que lo hace viable como contenedor dentro del clúster vigilado.
- GPU recomendadas: T4 suficiente (el entrenamiento del adaptador se completó en unos 9 minutos en una T4 gratuita de Colab con Unsloth); A100 o H100 no aportan ventaja apreciable para un modelo de 1,7 mil millones de parámetros.
- Opciones de despliegue: transformers + PEFT (cargando el adaptador sobre el base), llama.cpp con GGUF q8_0 fusionado y `--reasoning off`, vLLM con soporte de adaptadores LoRA, y Ollama para un despliegue local sencillo.
- Latencia y throughput: no disponibles. La generación está acotada a 48 tokens nuevos (`max_new_tokens=48`) y la salida útil es una sola etiqueta, por lo que el coste por inferencia es bajo, pero no se publican cifras de latencia ni de tokens por segundo.
- Advertencia de cuantización: no cuantizar a 4 bits. El propio autor documenta una caída del 82,3 % al 30,6 % de precisión con q4_k_m.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Precisión en el arnés del autor | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| qwen3-1.7b-k8s-alert-triage-lora | 1,7 mM base + 17,4 M adaptador | 32.768 tokens (heredado de Qwen3-1.7B) | Triaje de alertas K8s, 13 etiquetas | 82,3 % (124 alertas retenidas) | apache-2.0 | HuggingFace + repo GitHub |
| Qwen3-1.7B sin adaptar | 1,7 mM | 32.768 tokens | Propósito general | no evaluado en la información disponible | apache-2.0 | HuggingFace |
| Claude Opus 5 | no disponible | no disponible | Propósito general, usado como baseline | 67,7 % con el mismo prompt | propietaria | API de Anthropic |
| Gemini 3.5 Flash-Lite | no disponible | no disponible | Propósito general, usado como baseline | 60,5 % con el mismo prompt | propietaria | API de Google |

No se dispone de otros adaptadores de triaje de alertas de Kubernetes con los que comparar directamente en la información proporcionada.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: se entrenó con una única aplicación de demostración en un único clúster local, con doce fallos inyectados deliberadamente. El propio autor advierte de que conoce los fallos de ese clúster, no los de un entorno real, y recomienda reentrenarlo con alertas propias antes de confiar en él.
- Rendimiento desigual por clase: es más débil en `dns_broken` y en el reconocimiento de ruido rutinario (`none`), tareas en las que, según el autor, un modelo mayor lo supera. Conviene escalar los casos con baja confianza.
- Riesgo de alucinación: al ser un modelo generativo que emite texto libre, puede producir etiquetas fuera del vocabulario previsto o inventar diagnósticos. La salida debe validarse contra la lista cerrada de trece etiquetas antes de usarse en automatización.
- Dependencia estricta del formato de prompt: cualquier variación respecto a `prompt_for` puede degradar gravemente los resultados.
- Modo de pensamiento: debe permanecer desactivado, tanto en transformers (`enable_thinking=False`) como en llama.cpp (`--reasoning off`). Activarlo rompe la correspondencia con el entrenamiento.
- Sensibilidad severa a la cuantización: no usar q4_k_m (30,6 % de precisión). El autor recomienda q8_0 como mínimo práctico.
- Idioma: solo inglés. Las alertas en castellano quedan fuera de la distribución de entrenamiento.
- Sesgos conocidos: no disponibles. No se ha publicado ningún análisis de sesgos.
- Licencia: el adaptador es apache-2.0 y el modelo base Qwen3-1.7B también es apache-2.0, por lo que el uso comercial está permitido en principio. Conviene revisar los términos del modelo base en su propia ficha.
- Madurez del proyecto: cero descargas y cero likes en el momento de redactar esta ficha, lo que implica ausencia de validación por parte de la comunidad. Los resultados provienen exclusivamente del arnés del autor y no han sido replicados por terceros.
- Uso en producción: requiere validación con datos propios, monitorización de la deriva y un mecanismo de escalado para los casos en que la etiqueta devuelta no pertenezca al vocabulario entrenado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jcanizalez/qwen3-1.7b-k8s-alert-triage-lora
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio con código, conjunto de datos y resultados: https://github.com/jcanizalez/k8s-alert-triage
- Función de construcción del prompt y baseline de evaluación: https://github.com/jcanizalez/k8s-alert-triage/blob/main/eval/baseline.py

La búsqueda web realizada no devolvió resultados relevantes sobre este modelo: los enlaces recuperados correspondían a sitios de contenido para adultos sin relación alguna con el proyecto, por lo que se han descartado.
