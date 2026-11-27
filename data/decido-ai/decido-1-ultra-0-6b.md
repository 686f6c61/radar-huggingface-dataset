# decido-ai/decido-1-ultra-0.6b

## Resumen

Decido-1-Ultra (0.6B) es un modelo de decisión calibrada desarrollado por decido-ai, obtenido mediante un ajuste fino completo de Qwen3-0.6B para imitar el comportamiento de Decido-1 (26B-A4B). No es un modelo generativo de propósito general: su función es responder a preguntas estructuradas sobre un documento (sí/no, elección única entre opciones o escala ordenada) devolviendo distribuciones de probabilidad calibradas. La destilación se realizó sobre 1 millón de preguntas, etiquetadas la mitad con respuestas de referencia y la otra mitad por Decido-1.

El modelo resuelve el problema de la toma de decisiones determinista y de baja latencia en entornos con recursos limitados: según el autor, produce decisiones calibradas a partir de un documento en 0,41 s sobre la CPU de un portátil, con un consumo de RAM de aproximadamente 4 GB. Esto lo sitúa como la variante más ligera de la familia Decido 1, pensada para ejecución local en CPU sin GPU dedicada.

Su relevancia actual radica en que ofrece una API unificada (compatible con el formato Jev 1.13) para clasificación y puntuación con probabilidades, en un tamaño de 596 millones de parámetros que cabe en hardware de consumo. La licencia Apache-2.0 y la disponibilidad de pesos en safetensors y GGUF facilitan su integración en pipelines de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-0.6B) |
| Parámetros totales | 596.049.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF Q8_0 (mencionado en benchmarks); otros no disponibles |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only, y se somete a un ajuste fino completo (full fine-tune) para convertirlo en un modelo de decisión. La relación con el modelo base es de tipo finetune, según los metadatos del repositorio. No se especifican en la información disponible detalles sobre la composición exacta del dataset más allá de las 1 millón de preguntas usadas para destilación, ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal es el proceso de destilación desde Decido-1 (26B-A4B): la mitad de las etiquetas provienen de respuestas de referencia (gold answers) y la otra mitad de las predicciones del modelo profesor. El modelo conserva el mismo formato de API y de preguntas que el resto de la familia Decido, incluyendo el formato de cable Jev 1.13 con tipos `noul`, `choice` (1-255 opciones) y `score` (2-10 niveles). El documento de entrada se trata como datos no confiables: las instrucciones contenidas en él no se siguen y las cadenas de tokens de control se neutralizan.

## Capacidades

- Respuesta a preguntas de sí/no sobre un documento de entrada, devolviendo probabilidades para cada clase.
- Elección única entre un conjunto de opciones (1-255), con probabilidades asociadas y nivel de confianza.
- Puntuación en escala ordenada (2-10 niveles), con leyenda de niveles.
- Procesamiento de documentos en texto plano o JSON como entrada no confiable.
- Salida con calibración explícita (probabilidades y confianza), orientada a decisiones.
- Compatibilidad con la API Jev 1.13 y con clientes Jev existentes mediante `decido serve`.
- Ejecución local en CPU sin GPU, con latencia baja (0,41 s en M4 Pro para documento de 1k tokens y 5 preguntas).
- No se documentan capacidades de generación libre de texto, razonamiento multi-paso, tool calling, agentes, visión ni audio.

## Casos de uso

- Triaje de tickets de atención al cliente: el modelo clasifica un mensaje entrante en categorías (facturación, envío, técnico) y estima urgencia en una escala ordenada, devolviendo probabilidades para enrutar automáticamente con umbrales de confianza definidos por el operador.
- Moderación de contenido con umbral calibrado: dado un texto, responder preguntas de sí/no (por ejemplo, "¿contiene lenguaje ofensivo?") y usar la probabilidad devuelta para decidir si se escala a revisión humana, aprovechando la calibración para fijar el punto de corte.
- Extracción de decisiones a partir de contratos o formularios: con documentos JSON o texto, responder preguntas de elección sobre cláusulas o campos (tipo de contrato, jurisdicción) sin necesidad de generar texto libre, lo que reduce el riesgo de alucinación.
- Clasificación por lotes en pipelines de datos: al ejecutarse en CPU con ~4 GB de RAM y 0,41 s por documento de 1k tokens con 5 preguntas, es adecuado para procesar grandes volúmenes en servidores sin GPU.
- Enrutamiento en sistemas de agentes: usar el modelo como componente de decisión de bajo coste que elige la siguiente acción o herramienta entre un conjunto predefinido de opciones, con probabilidades para desambiguar.
- Evaluación de encuestas o feedback abierto: puntuar respuestas en escalas ordenadas (satisfacción, severidad) con distribución de probabilidad, útil para análisis agregado con intervalos de confianza.
- Despliegue local en portátil para prototipado: mediante `pip install decido-ai` y la CLI `decido run`, integrar decisiones en scripts o servicios HTTP locales sin infraestructura adicional.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (media de seis grupos de benchmarks; puntuación tipo accuracy por grupo):

| Grupo de benchmark | Ultra 0.6B, CPU (Q8_0 GGUF) | Ultra 0.6B, GPU (bf16) | Decido-1, CPU | Jev 1.13 (publicado) |
|---|---:|---:|---:|---:|
| JevBench | 57,69 | 57,20 | 87,61 | 87,18 |
| Kev | 60,14 | 60,23 | 84,35 | 85,52 |
| OpenJev (18 tareas) | 47,66 | 47,60 | 78,37 | 72,96 |
| Nimble | 42,55 | 42,20 | 87,23 | 91,84 |
| VitaminC | 80,63 | 80,30 | 86,14 | 78,46 |
| MASSIVE | 84,29 | 84,57 | 88,57 | 87,14 |
| Media de seis grupos | 62,16 | 62,02 | 85,38 | 83,85 |

Calibración (CPU, GGUF distribuido):

| Comprobación | Brier | Jev 1.13 (Brier) | ECE | Jev 1.13 (ECE) |
|---|---:|---:|---:|---:|
| JevBench | 0,471 | 0,181 | 0,046 | 0,032 |
| Kev v4 dev | 0,520 | 0,211 | 0,109 | 0,049 |
| Kev v9 dev | 0,596 | 0,212 | 0,101 | 0,034 |
| VitaminC | 0,309 | 0,313 | 0,106 | 0,104 |
| MASSIVE | 0,215 | 0,204 | 0,052 | 0,075 |

Según el autor, la calibración es claramente inferior a Jev 1.13: Brier igual o mejor en 1 de 5 comprobaciones y ECE igual o mejor en 1 de 5.

Latencia publicada (M4 Pro, documento de 1k tokens, 5 preguntas): 0,41 s en CPU y 0,13 s en GPU de Mac.

## Requisitos de hardware

- RAM estimada: ~4 GB para ejecución en CPU (dato del autor).
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU. Los benchmarks GPU usan bf16 y el GGUF Q8_0 vía llama.cpp con CUDA.
- Cabe en GPU de consumo: sí, por tamaño (0,6B); no se detallan modelos concretos.
- Opciones de despliegue: librería `decido-ai` (pip), CLI `decido run`, servidor HTTP `decido serve` con API compatible con Jev (`POST /v1/systemone`), llama.cpp (GGUF), transformers, text-generation-inference (según tags).
- Latencia: 0,41 s en CPU y 0,13 s en GPU de Mac (M4 Pro, 1k tokens, 5 preguntas). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Puntuación seis grupos | Licencia | Hardware |
|---|---|---|---:|---:|---|---|
| Decido-1-Ultra (0.6B) | Qwen3-0.6B | 596 M | no disponible | 62,16 (CPU) | Apache-2.0 | CPU ~4 GB RAM |
| Decido-1-Fast | Qwen3-1.7B | no disponible | no disponible | 73,01 (CPU) | no disponible | CPU ~8 GB RAM |
| Decido-1 | Gemma-4-26B-A4B | no disponible | no disponible | 85,38 (CPU) | no disponible | CPU ~30 GB RAM |
| Decido-1-Max | Gemma-4-26B-A4B | no disponible | no disponible | 89,23 (GPU) | no disponible | GPU |

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se documentan capacidades multilingües.
- La puntuación media de seis grupos (62,16) es sustancialmente inferior a Decido-1 (85,38) y a Jev 1.13 (83,85); en Nimble la diferencia es especialmente acusada (42,55 frente a 87,23).
- La calibración es peor que la de Jev 1.13 en 4 de 5 comprobaciones de Brier y en 4 de 5 de ECE; el autor lo reconoce explícitamente. No debe asumirse que las probabilidades sean fiables sin validación en el dominio de uso.
- El modelo está diseñado para responder preguntas estructuradas, no para generación de texto libre; su uso fuera de ese formato no está soportado.
- No se detallan sesgos conocidos ni composición del dataset de entrenamiento, lo que limita la evaluación de riesgos.
- La model card marca `inference: false` en los metadatos, aunque se documentan vías de inferencia vía la librería `decido-ai` y llama.cpp.
- No se especifica la longitud de contexto soportada, lo que impide garantizar el comportamiento con documentos largos.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3-0.6B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/decido-ai/decido-1-ultra-0.6b
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo profesor Decido-1: https://huggingface.co/decido-ai/decido-1-26b-a4b
- Decido-1-Fast: https://huggingface.co/decido-ai/decido-1-fast-1.7b
- Decido-1-Max: https://huggingface.co/decido-ai/decido-1-max-26b-a4b
- Decido-1-Think: https://huggingface.co/decido-ai/decido-1-think-26b-a4b
- Decido-1-XL: https://huggingface.co/decido-ai/decido-1-xl
- Decido-Web v2: https://huggingface.co/decido-ai/decido-web-v2
- Decido-Web v2-Fast: https://huggingface.co/decido-ai/decido-web-v2-fast
- Colección Decido 1: https://huggingface.co/collections/decido-ai/decido-1-6aed66fd09af05c057795ca8
- Documentación y playground: https://getdecido.ai
- Paquete PyPI: https://pypi.org/project/decido-ai/
