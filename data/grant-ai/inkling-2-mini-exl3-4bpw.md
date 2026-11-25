# grant-ai/Inkling-2-Mini-EXL3-4bpw

## Resumen

Inkling-2-Mini-EXL3-4bpw es una re-cuantización del modelo multimodal Inkling-2-Mini de Thinking Machines, un mixture-of-experts con arquitectura de capas repetidas (looped) y torre de visión, orientado a razonamiento, chat y uso de herramientas. El checkpoint original almacena los expertos enrutados ya cuantizados en NVFP4 (capas 0-19) y MXFP8 (capas 20-23); este build los desempaqueta a precisión completa y los vuelve a cuantizar con EXL3 (trellis, LDLQ ponderado por Hessian) a unas 4,0 bits por peso, manteniendo en BF16 todo lo que no es experto: atención, normalizaciones, embeddings y el drafter MTP.

El resultado ocupa unos 16 GB en disco y está pensado para servir el modelo en Apple Silicon (Metal, vía TensorFold) y en Linux/CUDA con motores compatibles con EXL3. Frente al checkpoint oficial, la ficha del autor reporta una pérdida media de 0,0236 nats/token de KL y un 96,29 % de acuerdo top-1 sobre un corpus de evaluación fijo, con la ruta de desempaquetado verificada como sin pérdida (KL = 0,000).

La relevancia de este build es práctica: permite ejecutar un modelo de clase 26B con visión y modo de razonamiento configurable en hardware de consumo de gama alta, algo imposible con los pesos originales en NVFP4/MXFP8 sin herramientas específicas. La licencia Apache-2.0, heredada del modelo base, facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `inkling2_loop` (transformer MoE con capas repetidas y torre ViT) |
| Parametros totales | ~26,4B (8.074.606.080 en safetensors del repo, ver advertencia) |
| Parametros activos | top-8 de 128 expertos enrutados por capa (los expertos suponen ~92 % del total) |
| Longitud de contexto | hasta 1.048.576 tokens (límite de arquitectura; contexto de servicio a determinar por el motor) |
| Tipos de cuantizacion | EXL3 trellis ~4,0 bpw en pesos de expertos; BF16 en pesos densos, visión y drafter MTP |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (layout EXL3 de exllamav3); repo de 16,8 GB |

## Arquitectura y entrenamiento

El modelo base es un MoE de 24 capas con 128 expertos enrutados y activación top-8, dimensión oculta 2304 y dimensión intermedia de experto 1152. La peculiaridad estructural es el bucle: las capas 6 a 17 se recorren tres veces (48 visitas efectivas), lo que aumenta la profundidad computacional sin incrementar el número de capas distintas. Incorpora además una torre de visión ViT (`model.visual.backbone`, 422 tensores) para entrada image-text-to-text y un drafter MTP de 3 capas con 8 tokens de borrador y 4 taps de características, usado para decodificación especulativa.

Sobre el entrenamiento del modelo original no se aporta información en la documentación disponible (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que sí documenta este build es el proceso de cuantización: desempaquetado exacto de los expertos NVFP4/MXFP8 a float32 mediante dos decodificadores independientes y bit-idénticos, seguido de re-cuantización EXL3 con LDLQ y Hessians por capa calculados a partir de activaciones de calibración, con tratamiento específico de las visitas repetidas del bucle. La innovación destacable es la preservación íntegra de la arquitectura (incluidos drafter y visión) dentro de un único pack EXL3 portable entre motores.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de hasta 1.048.576 tokens a nivel de arquitectura.
- Razonamiento con esfuerzo configurable por petición mediante `reasoning_effort` (rango 0-0,99; por defecto 0,9, equivalente a alto) y temperatura ajustable.
- Comprensión de imágenes: pipeline image-text-to-text con torre ViT preservada en BF16.
- Uso de herramientas y llamadas a función: el corpus de evaluación del autor incluye un dominio específico de tool-calls.
- Capacidades multilingües: el conjunto de evaluación incluye un dominio multilingüe, aunque no se detallan los idiomas cubiertos.
- Decodificación especulativa nativa mediante el drafter MTP incluido (`mtp.safetensors`).
- Razonamiento multi-paso y uso como agente: soportado por el modo de razonamiento y el tool calling, aunque sin datos de benchmarks específicos de agentes.

## Casos de uso

- Asistente conversacional de contexto largo: con hasta 1.048.576 tokens de ventana arquitectónica, puede mantener hilos de conversación con documentación extensa adjunta sin truncar, útil en soporte técnico especializado.
- Automatización de atención al cliente con imágenes: al aceptar entrada image-text-to-text, puede procesar capturas de pantalla o fotos de producto junto al texto del usuario en un mismo turno.
- Generación y revisión de código en pipelines: el dominio de código muestra el mejor acuerdo top-1 tras la cuantización (97,47 %), lo que lo hace adecuado para tareas de autocompletado y revisión integradas en CI/CD, con la cautela de validar la salida.
- Agentes con tool calling: el bajo KL en el dominio de herramientas (0,0031) y un 98,28 % de acuerdo top-1 indican que la cuantización apenas degrada el comportamiento de llamada a funciones, lo que lo hace apto para orquestación de APIs.
- Extracción de información de documentos escaneados: combinación de visión y contexto largo para procesar lotes de páginas y responder preguntas sobre ellas en local sobre Apple Silicon.
- Despliegue local en estaciones de trabajo Mac: con ~16 GB de pesos, cabe en equipos con 32 GB o más de memoria unificada (M3 Ultra, M5 Ultra según el autor), lo que permite prototipado y uso privado sin enviar datos a la nube.
- Razonamiento con presupuesto de cómputo ajustable: el parámetro `reasoning_effort` permite reducir latencia en tareas simples y aumentarla en problemas complejos dentro del mismo despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica métricas de fidelidad de la cuantización frente al checkpoint oficial:

| Build | KL media (nats/token) | Acuerdo top-1 | PPL (ref → build) |
|---|---:|---:|---|
| unpack → bf16 (control) | 0,0000 | 100,00 % | 4,773 → 4,773 |
| EXL3 ~4bpw (este build) | 0,0236 | 96,29 % | 4,773 → 4,784 |

Desglose por dominio (KL / acuerdo top-1):

| Dominio | KL | Top-1 |
|---|---:|---:|
| tools | 0,0031 | 98,28 % |
| wiki | 0,0084 | 96,19 % |
| multilingual | 0,0103 | 95,38 % |
| code | 0,0269 | 97,47 % |
| chat | 0,0363 | 95,59 % |
| self-generated | 0,0720 | 92,53 % |

Rendimiento de decodificación medido: 31,3 tok/s en decodificación simple con mlx-lm de referencia sobre M3 Ultra con pesos oficiales y sin drafter. Las cifras de este pack con TensorFold Metal, drafter MTP y batching continuo están pendientes de publicación, igual que la tasa de aceptación de la decodificación especulativa.

## Requisitos de hardware

- VRAM/memoria estimada: ~16 GB de pesos; en la práctica se recomienda al menos 24-32 GB de memoria unificada o VRAM para margen de contexto y caché KV.
- GPU recomendadas: Apple Silicon de gama alta (M3 Ultra, M5 Ultra) para la ruta Metal/TensorFold; en CUDA/Linux el soporte está en desarrollo según el autor.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más (por ejemplo RTX 4090) si el motor EXL3 lo soporta, aunque el soporte CUDA de este pack aún no está confirmado.
- Opciones de despliegue: TensorFold (Metal), motores compatibles con EXL3 de exllamav3; mlx-lm como referencia de decodificación.
- Latencia y throughput: 31,3 tok/s de decodificación simple en M3 Ultra con mlx-lm y pesos oficiales; sin datos aún para este pack con drafter MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-EXL3-4bpw (este) | ~26,4B totales, top-8 de 128 expertos | 1.048.576 tokens | EXL3 ~4 bpw + BF16 | Apache-2.0 | Hugging Face, orientado a Apple Silicon |
| thinkingmachines/Inkling-2-Mini (base) | ~26,4B totales | 1.048.576 tokens | NVFP4 / MXFP8 en expertos | Apache-2.0 | Hugging Face |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento de terceros comparables para establecer una comparativa cuantitativa con modelos de tamaño o tarea similar.

## Limitaciones y advertencias

- La cuantización introduce degradación medible: 0,0236 nats/token de KL media y 96,29 % de acuerdo top-1; el dominio de texto autogenerado es el más afectado (KL 0,0720, 92,53 % top-1).
- El número de parámetros reportado en safetensors (8.074.606.080) no coincide con los ~26,4B declarados en la model card; conviene verificar el inventario real de pesos antes de dimensionar el despliegue.
- El soporte CUDA/Linux está en desarrollo; la ruta principal es Apple Silicon con TensorFold, lo que limita su uso en clústeres convencionales.
- El contexto de servicio real depende del motor y no está confirmado; el límite de 1.048.576 tokens es arquitectónico.
- No se detallan los idiomas soportados ni los sesgos conocidos del modelo base.
- Riesgo de alucinación inherente a modelos generativos; no hay evaluación específica publicada en esta información.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda validar el comportamiento en el workload propio antes de producción, tal como advierte el autor.
- Las cifras de rendimiento con drafter y batching continuo están pendientes, por lo que el throughput real en producción es incierto.

## Enlaces

- Hugging Face: https://huggingface.co/grant-ai/Inkling-2-Mini-EXL3-4bpw
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio de conversión y reproducibilidad: https://github.com/grantoverton/Inkling-2-Mini-EXL3
- exllamav3 (formato EXL3): https://github.com/turboderp-org/exllamav3
- Thinking Machines: https://thinkingmachines.ai
