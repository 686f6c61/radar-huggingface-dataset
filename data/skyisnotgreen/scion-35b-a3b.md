# SkyIsNotGreen/Scion-35B-A3B

## Resumen

Scion-35B-A3B es una cuantización de muy bajo bitrate del modelo empero-ai/Qwen3.8-35B-A3B-Distill, un destilado de razonamiento de la línea Qwen3.8 construido sobre Qwen/Qwen3.6-35B-A3B. Lo publica el usuario SkyIsNotGreen dentro del proyecto Scion, cuyo objetivo es comprimir un MoE completo de 34,9B parámetros (unos 3B activos por token) en un único fichero GGUF de 11,34 GB, un 6,3x más pequeño que la referencia en BF16 (71,07 GB) y menos de la mitad que un Q4_K_M equivalente (21,71 GB).

La innovación central no es una calibración tipo imatrix, sino un banco de expertos ternario en formato PQ2_0 (valores en {-1, 0, +1} más una escala FP16 por grupo de 128 pesos, 2,125 bpw) sobre el que se injertan correcciones entrenadas: ramas de bajo rango de rango 512 en la salida de atención y en la salida del bloque MoE, más deltas de router exactos. El conjunto rinde a 2,61 bpw efectivos. El autor describe el método como "injerto" (de ahí el nombre), en oposición a los cuantizados calibrados convencionales, y publica tanto la retención de tareas como la divergencia distribucional sin ocultar la brecha frente a Q4_K_M.

Es relevante ahora porque demuestra que un MoE de 35B con 256 expertos puede servirse desde un solo fichero de 11,34 GB conservando métricas de tarea dentro de la banda de ruido de Q4 y BF16 (HellaSwag 400: 79,00%; Winogrande: 76,25%), con la mejor perplejidad de su clase de 2 bits (8,354). El coste es que requiere un fork específico de llama.cpp y que solo se distribuye en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_moe` (`qwen35moe` en llama.cpp): 40 capas, atención híbrida lineal y completa, feed-forward MoE |
| Parametros totales | 34.893.918.848 (34,9B) |
| Parametros activos | Aproximadamente 3B por token (256 expertos, top-8 más experto compartido) |
| Longitud de contexto | 262.144 tokens (heredada del modelo base) |
| Tipos de cuantizacion | Bancos de expertos ternarios PQ2_0 g128 (2,125 bpw); Q8_0 en atención, embeddings y LM head; F32 en normas, routers y salida; correcciones embebidas en contenedor `q1_0_g128` (rango 512). Efectivo: 2,61 bpw |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF, un único fichero de 10,558 GiB / 11,337 GB (solo texto) |

## Arquitectura y entrenamiento

El modelo base es un MoE de la familia Qwen3.6/Qwen3.8 con 40 capas y atención híbrida: combina capas de atención lineal con capas de atención completa, lo que reduce el coste de la ventana de 262.144 tokens. El feed-forward es un MoE de 256 expertos con enrutado top-8 más un experto compartido, del que se activan unos 3B parámetros por token sobre un total de 34,9B. Scion no reentrena el modelo: parte del destilado de razonamiento de empero-ai y aplica una reparametrización agresiva.

La representación de pesos es lo distintivo. Cada peso de experto se restringe al conjunto {-1, 0, +1} con una única escala FP16 compartida por grupo de 128 pesos (2,125 bpw). El resto del modelo permanece en Q8_0 (atención, embeddings, LM head) y F32 (normas, routers, salida), de modo que la compresión de bajo bit solo cubre los bancos de expertos. Sobre esa base ternaria se injertan correcciones entrenadas — no calibradas — mediante destilación de salida contra el profesor BF16 con el cuantizador desplegado dentro del bucle de entrenamiento (ternary Lloyd g128): ramas de rango 512 en la salida de atención y en la salida del bloque MoE, más deltas de router exactos. No se usa imatrix ni corpus de calibración. Las correcciones se almacenan en el contenedor `q1_0_g128` y van embebidas en el propio GGUF (`adapter.embedded=true`), por lo que no requieren `--lora` ni fichero lateral.

## Capacidades

- Generación de texto conversacional (`pipeline_tag: text-generation`, etiqueta `conversational`).
- Razonamiento: el modelo base es un destilado de razonamiento de la línea Qwen3.8, por lo que hereda ese comportamiento, aunque la model card no documenta un modo de pensamiento explícito ni su configuración.
- Capacidades multilingües: no disponible. El campo de idiomas declara únicamente `en`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles; el artefacto se describe explícitamente como "solo texto".
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse mediante la infraestructura de Inference Endpoints de Hugging Face, siempre que el runtime soporte el contenedor PQ2_0.
- Eficiencia de despliegue: un MoE de 34,9B con ~3B activos servido desde 11,34 GB, lo que reduce el coste de memoria por instancia frente a cualquier cuantización de 4 bits del mismo modelo.

## Casos de uso

- Inferencia local en GPU de consumo: con 11,34 GB de pesos, el modelo cabe en tarjetas de 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) dejando margen para la caché KV, algo imposible con el Q4_K_M de 21,71 GB del mismo modelo.
- Análisis de documentos largos: la ventana de 262.144 tokens permite ingerir libros técnicos, expedientes completos o bases de código extensas en una sola pasada sin troceado ni recuperación externa.
- Despliegue multi-instancia en servidores: al ocupar menos de la mitad que un Q4_K_M, permite ejecutar más réplicas concurrentes por nodo para cargas de generación de texto de alto volumen.
- Atención al cliente automatizada multi-turno: conversaciones largas con historial completo en contexto, beneficiándose del bajo coste de memoria por sesión.
- Investigación en cuantización extrema: el release incluye scripts de construcción, el estudio forense de la variante densa Bonsai 2 y la rejilla de retención, lo que lo convierte en una referencia reproducible para estudiar cuantización ternaria de MoE frente a métodos calibrados con imatrix.
- Evaluación comparativa de runtime: sirve como banco de pruebas para medir el impacto del contenedor PQ2_0 y las correcciones embebidas en CPU y ROCm/gfx1100 frente a Q8_0, Q4_K_M e IQ2_M bajo un mismo protocolo.

## Benchmarks y rendimiento

Datos publicados por el autor bajo un protocolo único (perplejidad en wikitext-2, KLD de vocabulario completo contra BF16, HellaSwag 400 y Winogrande 400). Los huecos se marcan como no disponibles.

| Metrica | Scion-35B-A3B (2,61 bpw) | IQ2_M (2,90 bpw) | Q2_K | Q4_K_M (5,01 bpw) | BF16 (16,38 bpw) |
|---|---|---|---|---|---|
| HellaSwag 400 | 79,00% | no disponible | no disponible | 80,00% | 81,25% |
| Winogrande | 76,25% | no disponible | no disponible | 76,00% | 76,00% |
| Perplejidad wikitext-2 | 8,354 | 8,413 | 8,473 | no disponible | no disponible |
| KLD media vs BF16 | 0,269 | no disponible | no disponible | 0,031 | 0 |

El autor describe el resultado como "mejor PPL de la clase de 2 bits" y sitúa la retención de tareas dentro de la banda de ruido de Q4 y BF16, con la mejor fila de Winogrande empatada de la tabla. Al mismo tiempo declara explícitamente que la brecha distribucional frente a Q4_K_M (0,269 frente a 0,031 de KLD media) sigue abierta.

## Requisitos de hardware

- VRAM estimada para los pesos: 11,34 GB en el formato publicado (10,558 GiB). No hay variantes de cuantización adicionales en el repositorio.
- Memoria total: a los 11,34 GB hay que sumar la caché KV. Con 262.144 tokens de contexto, la caché domina el consumo y exige GPUs de 24 GB o más (o configuraciones multi-GPU) si se quiere explotar la ventana completa.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 12 GB o más para contextos moderados. Los 11,34 GB dejan poco margen en una RTX 3060 12 GB, pero encajan con holgura en RTX 4070 Ti Super, RTX 4080 y RTX 4090.
- GPU recomendadas: RTX 3090/4090 (24 GB) para contexto largo en una sola tarjeta; A100 40/80 GB, H100 o L40S para servicio en producción con contextos grandes o varias sesiones.
- Opciones de despliegue: exclusivamente llama.cpp, y en concreto el fork `sky-is-green/prism-ml-llama.cpp` (rama `moe-corr-runtime`), que añade el contenedor PQ2_0, el objetivo virtual `ffn_moe_out` y el soporte de adaptadores embebidos. No se menciona soporte para vLLM, TGI, Ollama ni llama.cpp upstream.
- Backends verificados: CPU y ROCm/gfx1100. El build CUDA se espera funcional pero no ha sido probado por el autor.
- Latencia y throughput: no disponible. No se publican cifras de tokens por segundo.

## Comparativa con modelos similares

Comparación entre el artefacto publicado y las cuantizaciones del mismo modelo base, que es el conjunto de alternativas directas documentado por el autor.

| Modelo | bpw | Tamano en disco | Contexto | Calidad medida | Licencia |
|---|---|---|---|---|---|
| Scion-35B-A3B | 2,61 | 11,34 GB | 262.144 | HellaSwag 79,00%; Winogrande 76,25%; PPL 8,354; KLD 0,269 | Apache-2.0 |
| IQ2_M (mismo modelo) | 2,90 | 12,56 GB | 262.144 | PPL 8,413 | Apache-2.0 |
| Q2_K (mismo modelo) | no disponible | no disponible | 262.144 | PPL 8,473 | Apache-2.0 |
| Q4_K_M (mismo modelo) | 5,01 | 21,71 GB | 262.144 | HellaSwag 80,00%; Winogrande 76,00%; KLD 0,031 | Apache-2.0 |
| BF16 (referencia) | 16,38 | 71,07 GB | 262.144 | HellaSwag 81,25%; Winogrande 76,00% | Apache-2.0 |

Frente a modelos de otros autores, la información disponible no permite establecer una comparativa fiable: no se publican resultados cruzados con alternativas de tamaño o tarea equivalentes fuera de la propia familia.

## Limitaciones y advertencias

- Solo inglés declarado en el campo de idiomas. No hay evidencia de capacidades multilingües y no se documentan evaluaciones fuera del inglés.
- Brecha distribucional declarada: la KLD media de vocabulario completo contra BF16 es 0,269, muy por encima del 0,031 de Q4_K_M. El propio autor reconoce que "cerrar la cola distribucional" es trabajo en curso, lo que implica riesgo de degradación en dominios alejados de la distribución evaluada.
- Evaluación limitada: los datos de retención se reducen a HellaSwag 400, Winogrande 400, perplejidad en wikitext-2 y KLD. No hay resultados publicados de razonamiento, matemáticas, código ni tool calling, que son precisamente los casos donde una cuantización de 2 bits de un modelo de razonamiento suele fallar primero.
- Dependencia de un runtime no estándar: requiere el fork `prism-ml-llama.cpp`, rama `moe-corr-runtime`. No funciona con llama.cpp upstream ni con servidores de inferencia estándar (vLLM, TGI), lo que complica el despliegue en producción y bloquea buena parte del ecosistema de herramientas.
- El build CUDA no está verificado. Solo CPU y ROCm/gfx1100 tienen validación del autor, lo que deja el caso de uso más común (GPU NVIDIA) sin garantías explícitas.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta. No hay validación independiente de los números publicados.
- Sin corpus de calibración: al no usar imatrix, el comportamiento fuera de las tareas evaluadas puede desviarse más de lo que sugieren las métricas agregadas.
- Riesgo de alucinación: inherente a un modelo de razonamiento destilado, y potencialmente amplificado por la cuantización ternaria de los expertos.
- Licencia: Apache-2.0, heredada del modelo base, permite uso comercial y redistribución. Verificar de todos modos las condiciones del modelo base empero-ai/Qwen3.8-35B-A3B-Distill antes de un despliegue comercial.
- Consumo de caché KV: explotar los 262.144 tokens de contexto exige mucha más memoria que los 11,34 GB de los pesos, por lo que el beneficio de tamaño se diluye en escenarios de contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SkyIsNotGreen/Scion-35B-A3B
- Discusiones del modelo: https://huggingface.co/SkyIsNotGreen/Scion-35B-A3B/discussions
- Repositorio principal del proyecto Scion (scripts de construcción y documentación): https://github.com/sky-is-green/scion
- Plan de experimentos de cola distribucional: https://github.com/sky-is-green/scion/blob/main/docs/TAIL-EXPERIMENT-PLAN.md
- Rejilla de retención frente a cuantizaciones de la comunidad: https://github.com/sky-is-green/scion/blob/main/retention-grid.png
- Estudio forense de la variante densa Bonsai 2: https://github.com/sky-is-green/bonsai2-ternary-forensics
- Fork de llama.cpp con soporte PQ2_0 (rama `moe-corr-runtime`): https://github.com/sky-is-green/prism-ml-llama.cpp/tree/moe-corr-runtime
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Modelo raíz sobre el que se construye el destilado: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
