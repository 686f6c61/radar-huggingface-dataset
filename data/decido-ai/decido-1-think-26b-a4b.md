# decido-ai/decido-1-think-26b-a4b

## Resumen

Decido-1-Think (26B-A4B) es un modelo de decisión y clasificación con calibración de etiquetas desarrollado por decido-ai, construido como un fine-tune del modelo multimodal google/gemma-4-26B-A4B-it. Su función no es la generación libre de texto, sino responder a preguntas estructuradas (sí/no, elección entre opciones, escalas ordenadas) devolviendo una distribución de probabilidad calibrada sobre las respuestas posibles. Se presenta como la variante "que razona antes de responder" dentro de la familia Decido 1: genera una cadena de razonamiento de hasta 1.024 tokens (greedy) y a continuación emite la distribución de etiquetas.

El modelo resuelve un problema concreto en pipelines de automatización: sustituir clasificadores ad hoc o llamadas a LLM genéricos por un motor que devuelve probabilidades calibradas (Brier score y ECE medidos) y respuestas estables frente al orden de las opciones. Según la model card, obtiene una puntuación media de 88,71 en el conjunto de seis grupos de benchmark de la comunidad Jev, frente a 85,90 de Decido-1 y 83,85 de Jev 1.13.

La arquitectura subyacente es la de Gemma 4 con mezcla de expertos (el sufijo A4B indica aproximadamente 4.000 millones de parámetros activos), con 25.805.936.206 parámetros totales según los pesos en safetensors. El repositorio ocupa 80,5 GB e incluye pesos en safetensors y GGUF. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), base Gemma 4 |
| Parametros totales | 25.805.936.206 (25,8 B) |
| Parametros activos | aproximadamente 4 B (sufijo A4B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (verificado en la model card); otros tipos no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |
| Modelo base | google/gemma-4-26B-A4B-it (fine-tune) |
| Pipeline declarado | text-classification |
| Razonamiento | hasta 1.024 tokens, decodificación greedy |
| Tamaño del repositorio | 80,5 GB |

## Arquitectura y entrenamiento

El modelo parte del checkpoint instructivo Gemma 4 26B-A4B, una arquitectura transformer con mezcla de expertos en la que solo se activa una fracción de los parámetros por token (aproximadamente 4 B de 25,8 B totales). Sobre esa base se aplica un fine-tune orientado a decisión: según la model card, partiendo del adaptador de Decido-1 el modelo generó sus propios razonamientos sobre unas 40.000 preguntas de entrenamiento y después se entrenó para emitir la distribución de respuesta anclada al gold tras la totalidad de sus razonamientos. No se detallan en la información disponible el número total de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

La innovación principal es el modo "think": el modelo escribe primero una cadena de razonamiento (hasta 1.024 tokens en decodificación greedy) y luego produce la distribución calibrada de etiquetas. El documento de entrada se trata como datos no confiables: las instrucciones contenidas en él no se siguen y las cadenas de tokens de control se neutralizan. El modelo expone además el formato de cable de Jev 1.13 (`noul`, `choice` con 2-255 opciones, `score` con 2-10 niveles) y una API compatible con clientes Jev existentes. En el 46 % de las preguntas de OpenJev el razonamiento alcanzó el límite de 1.024 tokens, tras lo cual se lee la respuesta después de una nota breve de "answer now".

## Capacidades

- Clasificación con calibración: devuelve distribuciones de probabilidad sobre etiquetas, no solo la etiqueta ganadora, con Brier score y ECE medidos.
- Preguntas sí/no, elección única entre 2-255 opciones y escalas ordenadas de 2-10 niveles.
- Razonamiento paso a paso antes de responder (modo think, hasta 1.024 tokens).
- Estabilidad frente al orden de las opciones: 4,3 % de inversiones agrupadas frente al 14,6 % de Jev.
- Entrada de documento en texto plano o JSON, tratada como datos no confiables (resistencia a inyección de instrucciones).
- Formato de cable compatible con Jev 1.13 y API HTTP compatible (`POST /v1/systemone`), lo que permite reutilizar clientes Jev sin cambios.
- Interfaz de línea de comandos y servidor HTTP mediante el paquete `decido-ai`.
- Capacidad multimodal heredada del modelo base (etiqueta image-text-to-text), aunque la model card no la documenta como funcionalidad soportada.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente multi-paso.

## Casos de uso

- Triaje de tickets de soporte: clasificar cada mensaje en equipo responsable (facturación, envío, técnico) y urgencia con probabilidades calibradas, de modo que el enrutador pueda aplicar umbrales de confianza y derivar a revisión humana los casos con probabilidad baja.
- Moderación de contenido con umbrales: usar la distribución calibrada para decidir entre bloqueo automático, revisión manual y publicación, aprovechando que el ECE medido permite fijar umbrales con significado probabilístico real.
- Enrutamiento en pipelines de atención al cliente: decidir si un mensaje requiere reembolso, escalado o respuesta automática, con la ventaja de que el modelo es estable frente al orden en que se presentan las opciones.
- Extracción de decisiones sobre documentos JSON: procesar registros estructurados (pedidos, formularios) y responder preguntas de clasificación sobre ellos, con protección frente a instrucciones embebidas en el propio documento.
- Evaluación de encuestas y escalas Likert: mapear respuestas abiertas a escalas ordenadas de 2-10 niveles con leyenda de probabilidades, útil en investigación de mercado o análisis de satisfacción.
- Sustitución de clasificadores supervisados en producción: desplegar el modelo tras `decido serve` y apuntar clientes Jev existentes al endpoint local, reduciendo el coste frente a llamadas a LLM genéricos y manteniendo una interfaz estable.
- Análisis por lotes en GPU: con un coste de aproximadamente 0,25 segundos de A100 por pregunta en lote con vLLM, es viable procesar volúmenes grandes de clasificación con razonamiento.

## Benchmarks y rendimiento

Puntuaciones por grupo de benchmark (harness común, GPU), según la model card:

| Grupo de benchmark | Decido-1-Think | Decido-1 | Jev 1.13 (publicado) |
|---|---:|---:|---:|
| JevBench | 94,33 | 88,17 | 87,18 |
| Kev | 85,63 | 84,46 | 85,52 |
| OpenJev (18 tareas) | 83,63 | 78,39 | 72,96 |
| Nimble | 92,55 | 88,65 | 91,84 |
| VitaminC | 86,98 | 87,15 | 78,46 |
| MASSIVE | 89,14 | 88,57 | 87,14 |
| Media de seis grupos | 88,71 | 85,90 | 83,85 |

Calibración (GPU; menor es mejor):

| Comprobación | Brier | Jev 1.13 | ECE | Jev 1.13 |
|---|---:|---:|---:|---:|
| JevBench | 0,098 | 0,181 | 0,031 | 0,032 |
| Kev v4 dev | 0,207 | 0,211 | 0,052 | 0,049 |
| Kev v9 dev | 0,223 | 0,212 | 0,042 | 0,034 |
| VitaminC | 0,205 | 0,313 | 0,037 | 0,104 |
| MASSIVE | 0,167 | 0,204 | 0,053 | 0,075 |

Notas metodológicas de la model card: las cifras se obtuvieron ejecutando Think como componente de Decido-1-Pro (vLLM, bf16, una A100) y re-puntuando sus salidas registradas con el mismo harness (análisis post hoc; el modelo no se seleccionó con estas cifras). 157 preguntas de Kev (2,3 %) nunca fueron enviadas a Think por el enrutador de Pro y usan la respuesta de Decido-1. En CPU (GGUF Q8_0, Apple M4 Pro, 10 hilos) la mediana es de 19 s por pregunta (media 26 s; unos 8 s en tareas cortas y hasta 49 s en tareas multi-paso), y en 60 preguntas de benchmark el archivo de CPU coincidió con la ejecución de GPU registrada el 98,3 % de las veces.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 25,8 B parámetros totales, en bf16 los pesos requieren del orden de 52 GB, y el repositorio completo ocupa 80,5 GB.
- GPU recomendadas: A100 80 GB (usada en las mediciones, vLLM, bf16); Decido-1-XL y Decido-1-Pro de la misma familia indican 4× A100 80 GB y 1× A100 80 GB respectivamente como referencias de la familia.
- GPU de consumo: no se documenta que quepa en GPU de consumo; el GGUF Q8_0 está pensado para CPU.
- CPU: funciona en CPU de portátil con el GGUF Q8_0 (unos 30 GB de RAM en el caso de Decido-1 con el mismo modelo base); es lento, con mediana de 19 s por pregunta en un M4 Pro.
- Despliegue: vLLM (mediciones de referencia), llama.cpp y el runtime propio del paquete `decido-ai` (requiere cmake y compilador C++ en Linux e Intel Mac; en Apple Silicon se omite la compilación), además de `decido serve` con API compatible con Jev.
- Latencia y throughput: aproximadamente 0,25 segundos de A100 por pregunta en lote; en CPU, 19 s de mediana por pregunta (8-49 s según la tarea).

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Puntuación seis grupos | Licencia | Ejecución |
|---|---|---|---:|---:|---|---|
| Decido-1-Think | Gemma-4-26B-A4B | 25,8 B (≈4 B activos) | no disponible | 88,71 (GPU) | Apache 2.0 | GPU; CPU lenta |
| Decido-1 | Gemma-4-26B-A4B | 25,8 B (≈4 B activos) | no disponible | 85,90 (GPU) / 85,38 (CPU) | Apache 2.0 | CPU portátil (~30 GB RAM) y GPU |
| Decido-1-Fast | Qwen3-1.7B | 1,7 B | no disponible | 73,01 (CPU) | no disponible | CPU portátil (~3 GB RAM) |
| Decido-1-Ultra | Qwen3-0.6B | 0,6 B | no disponible | 62,16 (CPU) | no disponible | CPU portátil (~1,5 GB RAM) |
| Decido-1-XL | DeepSeek-V4-Flash | no disponible | no disponible | 87,25 (GPU) | no disponible | 4× A100 80 GB |
| Decido-1-Pro | Decido-1 + Think + Qwen3.8-27B | no disponible | no disponible | 89,57 (GPU) | no disponible | 1× A100 80 GB |
| Jev 1.13 (referencia) | no disponible | no disponible | no disponible | 83,85 | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: solo inglés declarado; el rendimiento en castellano u otros idiomas no está documentado.
- Latencia: al generar razonamiento token a token, es notablemente más lento que Decido-1 (19 s de mediana por pregunta en CPU frente a 4,1 s de Decido-1).
- Tope de razonamiento: en el 46 % de las preguntas de OpenJev el razonamiento alcanzó el límite de 1.024 tokens, lo que puede degradar la calidad en tareas de razonamiento largo.
- Calibración no uniformemente mejor: el Brier es peor que Jev en Kev v9 dev y el ECE es peor en Kev v4 dev y Kev v9 dev; la ventaja en calibración no es universal.
- Riesgo de alucinación: no se documentan tasas de alucinación; al tratarse de un modelo de clasificación, el riesgo se traslada a distribuciones de probabilidad mal calibradas en dominios fuera de los benchmarks.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información disponible.
- Procedencia de las métricas: las cifras de GPU son un análisis post hoc de salidas registradas dentro de Decido-1-Pro, no una ejecución independiente del modelo completo; la ejecución de precisión completa en CPU no se realizó.
- Divergencia numérica: entre bf16 en GPU y 8 bits en CPU la respuesta puede diferir (coincidencia del 98,3 % en la muestra de 60 preguntas).
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Gemma 4, cuyos términos propios pueden añadir restricciones.
- Madurez: el repositorio no registra descargas ni "likes" en el momento de la consulta, por lo que el soporte de la comunidad es mínimo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/decido-ai/decido-1-think-26b-a4b
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Decido-1: https://huggingface.co/decido-ai/decido-1-26b-a4b
- Decido-1-Fast: https://huggingface.co/decido-ai/decido-1-fast-1.7b
- Decido-1-Ultra: https://huggingface.co/decido-ai/decido-1-ultra-0.6b
- Decido-1-XL: https://huggingface.co/decido-ai/decido-1-xl
- Decido-1-Pro: https://huggingface.co/decido-ai/decido-1-pro
