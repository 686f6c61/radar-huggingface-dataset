# decido-ai/decido-1-fast-1.7b

## Resumen

Decido-1-Fast (1.7B) es un modelo de decisión calibrada desarrollado por decido-ai, un fine-tuning completo de Qwen3-1.7B entrenado por destilación para imitar el comportamiento de Decido-1 (26B-A4B). Su propósito no es la generación de texto libre, sino responder preguntas estructuradas sobre un documento de entrada —preguntas de sí/no, elección entre opciones o escalas ordenadas— devolviendo distribuciones de probabilidad calibradas en lugar de texto. Está pensado para ejecutarse en CPU de portátil con un consumo de memoria de aproximadamente 8 GB.

El modelo resuelve el problema de la toma de decisiones automática sobre documentos con requisitos de latencia muy bajos: según el autor, 0,64 s p50 en un Apple M4 Pro con CPU, 10 hilos, cuantización Q8_0 y un documento de aproximadamente 1.000 tokens con 5 preguntas. Mantiene la misma API y formatos de pregunta que el resto de la familia Decido 1, lo que permite intercambiar modelos sin cambiar el código de integración.

Es relevante porque ofrece un punto de entrada ligero y de licencia Apache-2.0 a un pipeline de clasificación y decisión estructurada, con salidas probabilísticas calibradas (Brier, ECE) en lugar de texto generado, lo que facilita su uso en sistemas de enrutamiento, triaje y extracción de decisiones donde se necesita una medida de confianza explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tuning completo de Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (usado en los benchmarks del autor); otros tipos GGUF no detallados |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only, y se somete a un fine-tuning completo (no LoRA) para convertirlo en un modelo de decisión. El entrenamiento es por destilación sobre Decido-1 (26B-A4B): según la model card, se usaron 1 millón de preguntas etiquetadas, la mitad con respuestas gold y la mitad con respuestas generadas por Decido-1. El objetivo no es la generación de texto, sino la emisión de distribuciones de probabilidad sobre un conjunto cerrado de respuestas posibles (sí/no, elección entre 1 y 255 opciones, o escala de 2 a 10 niveles).

La innovación principal es el formato de interacción: el documento de entrada se trata como dato no confiable (las instrucciones dentro del documento no se siguen y las cadenas de tokens de control se neutralizan), y las preguntas se formulan mediante una estructura tipada (`noul`, `choice`, `score`) compatible con el formato de cable Jev 1.13. El modelo devuelve, junto a la respuesta, probabilidades y una medida de confianza. El autor reporta determinismo bit-exacto en repeticiones sobre CPU y una tasa de inversión por orden de opciones del 6,1% agrupada (frente al 14,6% de Jev 1.13). No se detallan en la información disponible la composición exacta del dataset, el número de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Decisión estructurada sobre documentos: responde preguntas de sí/no, de elección única entre opciones y de escala ordenada.
- Salida probabilística calibrada: devuelve distribuciones (`probabilities`) y `confidence` en estilo Jev, no texto libre.
- Procesamiento de documentos en texto o JSON como entrada.
- Tratamiento del documento como dato no confiable: no ejecuta instrucciones embebidas y neutraliza cadenas de tokens de control.
- Soporte de los formatos de pregunta de la familia Decido: `"text"` (sí/no), `{"q", "options"}` (elección, incluyendo mapa clave-descripción) y `{"q", "scale"}` (escala ordenada).
- Compatibilidad con el formato de cable Jev 1.13 mediante `m.predict({"state", "questions"})`.
- Despliegue local en CPU y servidor HTTP compatible con Jev (`POST /v1/systemone`).
- No se documentan capacidades de generación libre, código, matemáticas, visión, audio, tool calling ni agentes multi-paso.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket y responde preguntas como si se solicita reembolso, qué equipo debe gestionarlo y qué urgencia tiene, devolviendo probabilidades que permiten enrutar automáticamente con umbrales de confianza. Su latencia de 0,64 s en CPU lo hace viable en línea.
- Enrutamiento de correo entrante: clasificación de mensajes en categorías predefinidas (facturación, envíos, técnico) mediante preguntas de elección, con la distribución de probabilidad como señal para derivar a revisión humana cuando la confianza es baja.
- Extracción de decisiones en formularios y documentos JSON: dado un documento estructurado, responder preguntas de sí/no y escalas para poblar campos de decisión en un pipeline de back office, aprovechando el tratamiento del documento como dato no confiable.
- Moderación y clasificación de contenido: uso de preguntas de escala ordenada para asignar niveles de gravedad o prioridad, con salida calibrada que permite fijar umbrales operativos.
- Despliegue en portátil o edge: al requerir aproximadamente 8 GB de RAM y ejecutarse en CPU con GGUF Q8_0, permite clasificación y decisión local sin GPU, útil en entornos con requisitos de privacidad o sin infraestructura de aceleradores.
- Servicio HTTP interno compatible con Jev: `decido serve` expone una API compatible con clientes Jev existentes, lo que permite sustituir un modelo mayor por este en un servicio ya integrado sin reescribir el cliente.
- Prototipado y evaluación de pipelines de decisión: la misma API y formatos de pregunta que el resto de la familia Decido permiten desarrollar y validar la lógica de decisión con este modelo ligero y escalar después a Decido-1 o Decido-1-Max.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre seis grupos de benchmark (JevBench, Kev, OpenJev con 18 tareas, Nimble, VitaminC, MASSIVE-en), con el mismo harness para todos los modelos. La puntuación es la métrica de tipo accuracy por grupo y después la media.

| Grupo de benchmark | Decido-1-Fast, CPU (Q8_0 GGUF) | Decido-1-Fast, GPU (bf16) | Decido-1, CPU | Jev 1.13 (publicado) |
|---|---:|---:|---:|---:|
| JevBench | 72,31 | 70,83 | 87,61 | 87,18 |
| Kev | 71,96 | 71,82 | 84,35 | 85,52 |
| OpenJev (18 tareas) | 62,74 | 62,70 | 78,37 | 72,96 |
| Nimble | 58,87 | 59,22 | 87,23 | 91,84 |
| VitaminC | 84,47 | 84,64 | 86,14 | 78,46 |
| MASSIVE | 87,71 | 87,71 | 88,57 | 87,14 |
| Media de los seis grupos | 73,01 | 72,82 | 85,38 | 83,85 |

Calibración (CPU, GGUF distribuido):

| Comprobación | Brier | Jev 1.13 | ECE | Jev 1.13 |
|---|---:|---:|---:|---:|
| JevBench | 0,350 | 0,181 | 0,023 (mejor) | 0,032 |
| Kev v4 dev | 0,420 | 0,211 | 0,103 | 0,049 |
| Kev v9 dev | 0,506 | 0,212 | 0,096 | 0,034 |
| VitaminC | 0,232 (mejor) | 0,313 | 0,032 (mejor) | 0,104 |
| MASSIVE | 0,169 (mejor) | 0,204 | 0,032 (mejor) | 0,075 |

Según el autor, Brier es menor o igual que Jev en 2 de 5 comprobaciones y ECE es menor o igual en 3 de 5; la calibración es claramente más débil que la de Decido-1. La inversión por orden de opciones es del 6,1% agrupada (Jev 1.13: 14,6%). El determinismo en repeticiones es bit-exacto en CPU.

Velocidad reportada: Apple M4 Pro, solo CPU, Q8_0, documento de aproximadamente 1.000 tokens y 5 preguntas: 0,64 s p50 con 10 hilos. En Mac GPU: 0,30 s.

## Requisitos de hardware

- RAM estimada: aproximadamente 8 GB para ejecución en CPU de portátil con el GGUF Q8_0, según el autor.
- GPU recomendadas: no se especifican modelos concretos; el autor reporta ejecución en Mac GPU (bf16) con 0,30 s para el caso de referencia. No se documentan requisitos de VRAM para GPU dedicada.
- GPU de consumo: no se detalla compatibilidad con RTX 4090 u otras GPU de consumo; el enfoque principal es CPU.
- Opciones de despliegue: paquete `decido-ai` (pip, prebuilt para macOS Apple Silicon y Linux x86_64), CLI `decido run`, servidor HTTP `decido serve` con API compatible con Jev (`POST /v1/systemone`), y GGUF mediante llama.cpp (usado por el autor para OpenJev en CUDA).
- Latencia: 0,64 s p50 en CPU (M4 Pro, 10 hilos, Q8_0, documento de ~1k tokens y 5 preguntas); 0,30 s en Mac GPU. No se reporta throughput agregado.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Puntuación seis grupos | Licencia | Ejecución |
|---|---|---|---|---|---|---|
| Decido-1-Fast (este modelo) | Qwen3-1.7B | 1,7B | no disponible | 73,01 (CPU) | Apache-2.0 | CPU ~8 GB RAM, GPU |
| Decido-1 | Gemma-4-26B-A4B | 26B (A4B) | no disponible | 85,38 (CPU) | no disponible en la información | CPU ~30 GB RAM, GPU |
| Decido-1-Ultra | Qwen3-0.6B | 0,6B | no disponible | 62,16 (CPU) | no disponible en la información | CPU ~4 GB RAM |
| Decido-1-Max | Gemma-4-26B-A4B | 26B (A4B) | no disponible | 89,23 (GPU) | no disponible en la información | Portátil (lento), GPU en camino |

Frente a Decido-1, este modelo pierde aproximadamente 12 puntos en la media de los seis grupos (73,01 frente a 85,38 en CPU) y presenta peor calibración, pero reduce el requisito de memoria de ~30 GB a ~8 GB y la latencia de 4,1 s a 0,64 s en el caso de referencia. Frente a Decido-1-Ultra, gana aproximadamente 11 puntos (73,01 frente a 62,16) a costa de duplicar el requisito de RAM (~8 GB frente a ~4 GB).

## Limitaciones y advertencias

- Calibración más débil que la de Decido-1 y que Jev 1.13 en varias comprobaciones: Brier empeora en 3 de 5 y ECE en 2 de 5; no debe asumirse una fiabilidad probabilística equivalente a la del modelo grande.
- Rendimiento notablemente inferior en Nimble (58,87) y OpenJev (62,74) respecto a Decido-1, lo que limita su uso en tareas de esos grupos sin validación previa.
- Solo soporta inglés; no se documenta multilingüismo.
- No es un modelo generativo: no produce texto libre, código ni razonamiento abierto; su uso está restringido a preguntas estructuradas sobre un documento.
- No se documentan sesgos conocidos ni evaluación específica de sesgo; al derivar de Qwen3-1.7B y de datos destilados de Decido-1, puede heredar sesgos de ambos.
- Riesgo de alucinación no evaluado en la información disponible; la salida es una distribución sobre opciones cerradas, pero la confianza puede estar mal calibrada en dominios fuera de los benchmarks.
- Longitud de contexto no disponible: no se especifica el máximo de tokens del documento de entrada.
- Licencia Apache-2.0 permite uso comercial, pero no se documentan garantías ni condiciones adicionales del autor; conviene revisar los términos del modelo base Qwen3-1.7B.
- La model card indica `inference: false` en los metadatos, aunque el autor documenta inferencia mediante el paquete `decido-ai` y llama.cpp; la ejecución con `transformers` estándar no está descrita.
- La latencia reportada corresponde a hardware concreto (M4 Pro, 10 hilos); en otras CPU puede diferir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/decido-ai/decido-1-fast-1.7b
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Decido-1 (modelo destilado): https://huggingface.co/decido-ai/decido-1-26b-a4b
- Decido-1-Ultra: https://huggingface.co/decido-ai/decido-1-ultra-0.6b
- Decido-1-Max: https://huggingface.co/decido-ai/decido-1-max-26b-a4b
- Decido-1-Think: https://huggingface.co/decido-ai/decido-1-think-26b-a4b
- Decido-1-XL: https://huggingface.co/decido-ai/decido-1-xl
- Colección Decido 1: https://huggingface.co/collections/decido-ai/decido-1-6aed66fd09af05c057795ca8
- Paquete Python: https://pypi.org/project/decido-ai/
- Documentación y playground: https://getdecido.ai
