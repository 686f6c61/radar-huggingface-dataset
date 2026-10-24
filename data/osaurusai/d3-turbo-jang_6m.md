# OsaurusAI/d3-turbo-JANG_6M

## Resumen

OsaurusAI/d3-turbo-JANG_6M es un paquete cuantizado en formato JANG (MLX) del modelo vllm-sr/d3-turbo, el modelo de decisión multimodal de 27B de Decision 3.0 dentro de vLLM Semantic Router. No es un modelo generativo: recibe un estado (texto o JSON, opcionalmente con imágenes y vídeo) junto con preguntas tipadas —elegir una entre varias opciones, sí/no, una puntuación en una escala ordenada o localizar un elemento con una caja y su confianza— y devuelve, en un único forward pass, una probabilidad por opción sin generar texto. La cabeza de respuesta tiene 255 vías.

El interés de este bundle es la compresión: reduce los 52,2 GB en BF16 a 23,59 GB (7,23 bits por peso de media sobre los 26.085.330.160 parámetros del modelo) manteniendo, según el autor, la misma decisión que el modelo de precisión completa en el 99,25 % de 2.000 peticiones del test de tasksource/tasksource-jev-typed-decisions. Está pensado para ejecutarse en Apple Silicon mediante el runtime Osaurus 0.25.26 o superior, lo que permite desplegar un clasificador/enrutador multimodal de 26B en un equipo de sobremesa con memoria unificada en lugar de en un clúster de GPU.

La relevancia práctica está en su uso como componente de enrutamiento y clasificación dentro de pipelines de agentes: selección de herramientas entre listas de hasta 255 opciones, decisiones booleanas sobre trazas, y grounding visual (cajas sobre capturas, gráficos, documentos o fotogramas de vídeo) con una latencia de un solo paso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con atención bidireccional de prefijo y capas de atención lineal, más torre de visión; cabeza de decisión de 255 vías |
| Parámetros totales | 26.085.330.160 (26,09B) |
| Parámetros activos | No es un modelo MoE según la información disponible; no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | JANG: MLP (gate/up/down) afín a 6 bits; atención, atención lineal, embeddings y torre de visión afín a 8 bits; cabeza de respuesta en FP32 sin modificar; entradas de la puerta de atención lineal en BF16. Media de 7,23 bits por peso |
| Idiomas soportados | en, multilingual |
| Licencia | Apache-2.0 (heredada del modelo base vllm-sr/d3-turbo) |
| Formato de pesos | safetensors para MLX (`mlx`), shards de 23,59 GB; tensor de lectura en `decision/readout.safetensors` (FP32) |

## Arquitectura y entrenamiento

El modelo base vllm-sr/d3-turbo se construye sobre Qwen/Qwen3.8-27B y añade un cabezal de decisión de 255 vías que sustituye la generación de texto por una distribución de probabilidad sobre opciones. La inferencia usa atención bidireccional de prefijo, con el estado leído una sola vez, y el formato de prompt propio del modelo de decisión; incorpora además una torre de visión que procesa imágenes y fotogramas de vídeo. El paquete JANG conserva la cabeza de respuesta en FP32 byte a byte y mantiene las entradas de la puerta de atención lineal en BF16, de modo que la pérdida de precisión se concentra en las capas MLP.

La cuantización se calibró ejecutando el propio forward de decisión de d3-turbo sobre 2.899 prompts de decisión y 1,96 millones de tokens: preguntas de enrutamiento sobre peticiones reales, selección de herramientas sobre listas reales de hasta 255 opciones, trazas de agentes y de terminal, código, seguridad, documentos largos, decisiones tipadas, imágenes y vídeos de pantalla, más 121 preguntas de tipo Box sobre las imágenes de calibración. Se aplicaron escalas activation-aware (AWQ) plegadas en las normas y proyecciones productoras, y cada MLP cuantizado se redondeó con GPTQ usando las hessianas de ese forward, conservando el redondeo simple en los módulos donde GPTQ no aportaba mejora. No se indica en la información disponible si el modelo base recibió RLHF o DPO, ni la composición completa del dataset de preentrenamiento.

## Capacidades

- Clasificación zero-shot tipada: elegir una opción entre varias, responder sí/no o asignar una puntuación en una escala ordenada, devolviendo una probabilidad por opción.
- Selección de herramientas y enrutamiento semántico con hasta 255 opciones en la cabeza de decisión.
- Entrada de estado en texto plano o JSON, lo que permite pasar contexto estructurado (peticiones, listas de herramientas, trazas).
- Capacidad multimodal: procesa imágenes y fotogramas de vídeo junto con la pregunta.
- Localización visual (tipo Box): devuelve una caja delimitadora con su confianza sobre una imagen o sobre un instante concreto de un vídeo.
- Decisiones tipadas con gold suave (soft gold), evaluadas sobre el conjunto LocalLLaMA/typed-decisions.
- Multilingüe según la etiqueta del modelo (en, multilingual), sin detalle de cobertura por idioma.
- No genera texto: la salida es siempre una distribución de probabilidad, en un solo forward pass.
- No se documentan en la información disponible capacidades de tool calling generativo, agentes multi-paso ni modo de razonamiento explícito; el modelo actúa como clasificador dentro de un pipeline de agentes.

## Casos de uso

- Enrutamiento de peticiones en una pasarela LLM: dado el texto de la consulta del usuario, el modelo elige a qué modelo o endpoint derivarla entre un conjunto de opciones, con una sola pasada y sin coste de generación.
- Selección de herramientas en agentes: con listas reales de hasta 255 herramientas, el cabezal de 255 vías elige la herramienta adecuada a partir del estado en JSON y la intención del usuario, sustituyendo a un LLM generativo en ese paso.
- Clasificación de documentos largos y código: al recibir el texto completo como estado, sirve para etiquetar tickets, incidencias de seguridad o fragmentos de código en categorías predefinidas sin entrenamiento específico.
- Grounding en capturas y documentos: localizar campos concretos (importes, fechas, totales de una factura, elementos de un gráfico o de una terminal) devolviendo caja y confianza, útil para automatización de extracción con verificación de confianza.
- Análisis de vídeo de pantalla: decidir en qué momento de una grabación ocurre un evento, usando la salida de tipo Box sobre fotogramas, por ejemplo para generar índices de tutoriales o auditorías de sesión.
- Moderación y guardarraíles binarios: preguntas de sí/no sobre contenido o sobre trazas de agente (¿la acción es peligrosa?, ¿la respuesta cumple la política?) con probabilidad calibrada en lugar de una cadena de texto que haya que parsear.
- Evaluación automática de trazas de terminal y de agente: puntuar en una escala ordenada la calidad o el resultado de una secuencia de comandos dentro de un pipeline de CI o de evaluación continua.
- Filtrado previo de candidatos en recuperación: puntuar pares estado/opción para reordenar resultados antes de invocar un modelo generativo más caro.

## Benchmarks y rendimiento

Los datos publicados no son benchmarks de capacidad, sino medidas de acuerdo entre este bundle y el modelo en BF16, sobre preguntas no usadas en la calibración. «Decisions» cuenta la misma opción principal (o el mismo lado de 0,5 en sí/no); KL se mide sobre las probabilidades de las opciones de cada pregunta.

| Conjunto de test | Preguntas | Decisions | KL media ↓ | Exactitud gold, BF16 → bundle |
|---|---|---|---|---|
| Decision Index 0.3 public suite (466 preguntas de 41 benchmarks) | 466 | 98,07 % | 0,0006 | 76,4 → 76,9 % |
| LocalLLaMA/typed-decisions test (soft gold) | 800 | 99,38 % | 0,0003 | 73,0 → 72,6 % |
| Decisiones held-out sobre textos, imágenes y vídeos propios | 487 | 98,97 % | 0,0020 | no disponible |
| tasksource/tasksource-jev-typed-decisions test (2.000 peticiones) | 2.000 | 99,25 % | 0,0007 | 83,5 → 83,7 % |

En preguntas de tipo Box, sobre 29 preguntas held-out con objetivos pequeños que el propio modelo en BF16 responde con baja confianza, la caja de este bundle solapa con la del BF16 con un IoU medio de 0,52. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y en cualquier caso el modelo no está diseñado para generación de texto.

## Requisitos de hardware

- Memoria: los shards suman 23,59 GB, por lo que se necesita memoria unificada suficiente para pesos más overhead de ejecución; un equipo Apple Silicon de 32 GB es el mínimo realista y 36-64 GB resulta holgado.
- GPU: al ser un paquete MLX, está orientado a Apple Silicon (series M1/M2/M3/M4 y superiores). No se documenta soporte para CUDA, A100, H100 ni RTX 4090 en la información disponible.
- Consumer GPU: no aplica en el sentido habitual (no hay ruta CUDA anunciada); el equivalente consumer es un Mac con memoria unificada de 32 GB o más.
- Despliegue: runtime Osaurus 0.25.26 o superior, con la librería `mlx`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este bundle.
- Latencia y throughput: no disponibles. La arquitectura de decisión resuelve cada pregunta en un único forward pass sin decodificación autoregresiva, lo que evita el coste por token generado, pero no se publican cifras de latencia.

## Comparativa con modelos similares

El autor publica tres bundles del mismo modelo base, además del original en BF16:

| Modelo | Tamaño | Decisions (tsj, 2.000) | Decisions (suite) | KL media (suite) | Licencia |
|---|---|---|---|---|---|
| d3-turbo-JANG_6M | 23,6 GB | 99,25 % | 98,07 % | 0,0006 | Apache-2.0 |
| d3-turbo-JANG_4M | 19,3 GB | 97,65 % | 97,42 % | 0,0052 | Apache-2.0 |
| d3-turbo-JANGH2 | 14,5 GB | 92,65 % | 91,63 % | 0,0592 | Apache-2.0 |
| vllm-sr/d3-turbo (BF16) | 52,2 GB | referencia | referencia | — | Apache-2.0 |

No se dispone de comparación con otros modelos de clasificación o enrutamiento de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: no genera texto, razona ni responde preguntas abiertas; solo produce probabilidades sobre opciones predefinidas.
- Dependencia de runtime: requiere Osaurus 0.25.26 o superior y MLX; no hay ruta de despliegue documentada para CUDA o servidores x86 convencionales.
- Las cifras de acuerdo se midieron sobre conjuntos concretos y prompts de calibración representativos; el rendimiento puede degradarse fuera de esas distribuciones (por ejemplo, listas de opciones de dominios no cubiertos).
- En preguntas de localización visual, el propio modelo BF16 muestra baja confianza con objetivos pequeños; el IoU medio de 0,52 frente al BF16 indica que las cajas no son estables ante perturbaciones.
- El bundle no aporta mejoras respecto al BF16: en la suite pública la exactitud gold varía de 76,4 a 76,9 % y en typed-decisions de 73,0 a 72,6 %, diferencias dentro del ruido pero que conviene tratar como equivalentes, no como ganancias.
- Cobertura de idiomas declarada como «en, multilingual» sin desglose; no hay datos de rendimiento fuera del inglés.
- No se documentan sesgos del modelo base ni evaluaciones de robustez o seguridad en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero deben conservarse `NOTICE` y `LICENSE` heredados del modelo base y de Qwen.
- El repositorio no registra descargas ni valoraciones, y las fechas de creación son de octubre de 2026; conviene verificar la integridad de los pesos antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OsaurusAI/d3-turbo-JANG_6M
- Modelo base: https://huggingface.co/vllm-sr/d3-turbo
- Runtime Osaurus: https://osaurus.ai
- Dataset de evaluación citado: tasksource/tasksource-jev-typed-decisions (identificador `tasksource/tasksource-jev-typed-decisions` en HuggingFace)
- Dataset citado: LocalLLaMA/typed-decisions (identificador en HuggingFace)
- Modelo de referencia del que deriva la arquitectura: Qwen/Qwen3.8-27B (citado en la model card; sin enlace proporcionado)
