# ppsub/Qwen-PhishDetectAI-SMS-GRPO-GGUF

## Resumen

Qwen-PhishDetectAI-SMS-GRPO-GGUF es un ajuste fino del modelo Qwen2.5-1.5B-Instruct, publicado por el usuario `ppsub` en Hugging Face y distribuido exclusivamente en formato GGUF para su uso con llama.cpp y Ollama. El nombre del repositorio sugiere una especialización en detección de phishing por SMS (smishing) y un entrenamiento mediante GRPO (Group Relative Policy Optimization), una técnica de optimización por política relativa a un grupo de respuestas que se emplea habitualmente para alineamiento con recompensas verificables. El modelo fue entrenado y convertido a GGUF con la librería Unsloth, según indica la propia model card.

El repositorio contiene un total de 1.543.714.304 parámetros (aproximadamente 1,54 mil millones), lo que lo sitúa en la gama de modelos pequeños, aptos para inferencia en CPU, portátiles y dispositivos con recursos limitados. Los nombres de los archivos publicados (`qwen2.5-1.5b-instruct.Q4_K_M.gguf`, `Q5_K_M.gguf` y `Q8_0.gguf`) confirman que la base es la versión instruct de 1,5 B de la familia Qwen2.5, si bien el autor no documenta explícitamente esta correspondencia en el texto de la model card.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto recién publicado (fechas de creación y actualización del 13 de septiembre de 2026, con cero descargas y cero likes en el momento de la consulta), sin licencia declarada, sin idiomas declarados y sin resultados de evaluación publicados. Es, por tanto, un modelo que debe evaluarse como prototipo experimental y no como componente listo para producción. No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados ni las recetas de RLHF o DPO aplicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (etiqueta `qwen2`); detalles concretos no disponibles |
| Parámetros totales | 1.543.714.304 (≈1,54 B, recuento real de safetensors) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M, Q5_K_M, Q8_0 (tres archivos GGUF publicados) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (único formato publicado); se incluye un Modelfile de Ollama |
| Pipeline declarado | No disponible |
| Tamaño del repositorio | 3,8 GB |
| Fecha de creación | 2026-09-13 |
| Última actualización | 2026-09-13 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen2`, que sitúa el modelo en la familia Qwen2 de Alibaba, basada en transformers decoder-only con normalización RMSNorm, activación SwiGLU y atención con RoPE. Los nombres de los archivos GGUF apuntan a que el punto de partida es Qwen2.5-1.5B-Instruct, pero el autor no lo confirma en el texto de la model card. No se especifican dimensiones de capas, número de cabezas de atención, tamaño de vocabulario ni longitud de contexto nativa.

En cuanto al entrenamiento, la model card solo indica que el modelo fue ajustado y convertido a GGUF con Unsloth, que según el autor permitió un entrenamiento «2x más rápido». El sufijo `GRPO` del nombre del repositorio sugiere el uso de Group Relative Policy Optimization, pero no se documentan la función de recompensa, el dataset, el número de pasos, la composición de los datos ni si hubo fases adicionales de SFT, DPO o RLHF. Tampoco se publican curvas de entrenamiento, hiperparámetros ni detalles del proceso de cuantización.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y el uso de `--jinja` en los ejemplos de llama.cpp indican soporte de plantillas de chat con roles.
- Clasificación de SMS potencialmente fraudulentos: el nombre del modelo apunta a una especialización en detección de phishing por mensaje de texto, aunque no hay evaluación publicada que lo confirme.
- Ejecución local: al distribuirse en GGUF, puede ejecutarse en CPU sin GPU dedicada mediante llama.cpp u Ollama.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el repositorio puede desplegarse a través de los endpoints de Hugging Face.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el tamaño de 1,5 B limita este tipo de capacidades.
- Capacidades multilingües: no disponible; el autor no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible. La model card menciona una plantilla para `llama-mtmd-cli` (multimodal), pero se trata de una instrucción genérica de uso, no de una capacidad declarada del modelo.

## Casos de uso

- Filtrado de smishing en pasarelas SMS: el modelo puede insertarse como clasificador previo al enrutado de mensajes entrantes en una pasarela de operador o en una plataforma CPaaS, etiquetando cada SMS como legítimo o sospechoso antes de entregarlo al usuario. Su tamaño reducido permite ejecutarlo con latencias bajas y sin coste de API externa.
- Protección en el propio dispositivo (on-device): con cuantizaciones Q4_K_M o Q5_K_M, el modelo es lo bastante pequeño para ejecutarse en un teléfono Android de gama alta o en un portátil, lo que permite analizar los SMS localmente sin enviar contenido sensible a servidores de terceros.
- Enriquecimiento de alertas en un SOC: integrar el modelo como microservicio detrás de un SIEM para clasificar y resumir lotes de mensajes reportados por usuarios, reduciendo el volumen de alertas que llega a los analistas humanos.
- Análisis retrospectivo de corpus históricos: procesar por lotes archivos de SMS reportados como fraude para construir etiquetas preliminares que alimenten un dataset mayor, dado que el coste por inferencia es prácticamente nulo en hardware de consumo.
- Asistente educativo en ciberseguridad: desplegado vía Ollama, puede usarse en entornos de formación para que los alumnos interactúen con un modelo especializado y comparen sus respuestas frente a mensajes de phishing reales.
- Prototipado de pipelines GRPO: al declarar entrenamiento con GRPO sobre una base Qwen2.5-1.5B, sirve como referencia para reproducir experimentos de optimización con recompensas verificables en modelos pequeños.
- Módulo de explicación al usuario final: combinado con un sistema de reglas, puede generar una justificación breve del motivo por el que un SMS se marca como sospechoso, siempre que se valide previamente la calidad de sus salidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall, F1 ni evaluaciones estándar (MMLU, HumanEval, GSM8K). Tampoco hay comparaciones con otros modelos. Cualquier cifra de rendimiento para detección de phishing debería obtenerse mediante una evaluación propia sobre un conjunto de validación etiquetado.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del tamaño de los archivos GGUF, no confirmadas por el autor):
  - Q4_K_M: en torno a 1,0-1,5 GB de VRAM o RAM.
  - Q5_K_M: en torno a 1,2-2,0 GB.
  - Q8_0: en torno a 1,7-2,5 GB.
  - Hay que sumar el espacio de la caché KV, que depende de la longitud de contexto efectiva (no documentada).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionarán sin problema, aunque en las GPU de gama alta el modelo quedará muy infrautilizado.
- GPU de consumo: sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con memoria unificada.
- CPU: puede ejecutarse únicamente en CPU con llama.cpp; es el escenario natural para este tamaño de modelo.
- Opciones de despliegue: llama.cpp (`llama-cli -hf ppsub/Qwen-PhishDetectAI-SMS-GRPO-GGUF --jinja`), Ollama (el repositorio incluye un Modelfile), LM Studio y servidores compatibles con GGUF. TGI y vLLM no son compatibles directamente con GGUF en su flujo estándar.
- Latencia y throughput: no disponibles. En hardware de consumo, un modelo de 1,5 B cuantizado a Q4 suele generar decenas de tokens por segundo, pero no hay mediciones publicadas para este repositorio concreto.

## Comparativa con modelos similares

Los datos de los modelos alternativos no están disponibles en la información proporcionada; se listan únicamente como categorías de comparación y cualquier valor debe verificarse en sus fichas oficiales.

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| ppsub/Qwen-PhishDetectAI-SMS-GRPO-GGUF | 1,54 B | No disponible | No disponible | GGUF | No disponible |
| Qwen2.5-1.5B-Instruct (base aparente) | ≈1,5 B (no confirmado en la ficha) | No disponible | No disponible | safetensors, GGUF (según la distribución oficial) | No disponible |
| SmolLM2-1.7B-Instruct | No disponible | No disponible | No disponible | No disponible | No disponible |
| Gemma 2 2B Instruct | No disponible | No disponible | No disponible | No disponible | No disponible |

Nota: la única fila con datos verificados en la información proporcionada es la de este repositorio. No se dispone de evaluaciones comparativas entre este ajuste fino y los modelos de la tabla.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: sin licencia explícita no puede asumirse permiso para uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Cero descargas y cero likes: el modelo no ha sido validado por la comunidad, por lo que no existe evidencia externa de su calidad.
- Sin benchmarks publicados: no hay ninguna métrica de precisión, recall o F1 que respalde la afirmación implícita de detección de phishing.
- Dataset de entrenamiento desconocido: se desconoce la procedencia de los datos, lo que impide evaluar sesgos, contaminación o cobertura lingüística.
- Idiomas no declarados: no puede asumirse soporte de castellano ni de ningún otro idioma concreto.
- Longitud de contexto no documentada: limita el diseño de aplicaciones que dependan de conversaciones largas o de documentos extensos.
- Riesgo de alucinación: como modelo de 1,5 B, tiende a inventar justificaciones plausibles; sus explicaciones sobre por qué un SMS es fraudulento deben tratarse como indicios, no como evidencia.
- Riesgo de falsos positivos en producción: bloquear SMS legítimos (por ejemplo, códigos de verificación bancaria) tiene un coste alto para el usuario; se recomienda usar el modelo como señal adicional dentro de un sistema de decisión con umbrales y revisión humana.
- Sesgos potenciales: al estar especializado en un dominio concreto con datos no documentados, puede sobrerrepresentar patrones de un único operador, país o idioma.
- Fecha de publicación futura respecto a la fecha habitual de consulta (13 de septiembre de 2026): conviene verificar la vigencia del repositorio y su posible actualización.
- La mención a `llama-mtmd-cli` en la model card es una instrucción genérica de Unsloth y no implica que este modelo tenga capacidades multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ppsub/Qwen-PhishDetectAI-SMS-GRPO-GGUF
- Unsloth (herramienta de entrenamiento y conversión declarada): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado por la model card): https://github.com/ggml-org/llama.cpp
- Ollama (se incluye Modelfile en el repositorio): https://ollama.com

Nota: la búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo, su paper, su dataset o sus evaluaciones; los resultados obtenidos correspondían a servicios de traducción de títulos académicos y no guardan relación con el modelo.
