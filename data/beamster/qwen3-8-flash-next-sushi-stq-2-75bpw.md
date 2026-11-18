# beamster/Qwen3.8-Flash-Next-Sushi-STQ-2.75bpw

## Resumen

Qwen3.8-Flash-Next-Sushi-STQ-2.75bpw es un empaquetado cuantizado del modelo Qwen/Qwen3.8-Flash-Next, publicado por el usuario beamster para el motor de inferencia nativo de Apple Silicon sushi. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a ejecución local en Mac: el tronco denso y los expertos enrutados se almacenan con la cuantización propietaria STQ (Sushi Trellis Quant) y una tabla de codebook SPEC1, con tasas mixtas de 2 a 4 bits por experto y una media de 2,75 bits por peso. El resultado es un paquete de unos 75 GiB en disco que rinde con una divergencia KL de 0,0250 frente al checkpoint BF16 original.

El modelo base es un MoE multimodal de Qwen con 24.892.950.419 parámetros totales según los safetensors del repo, torre de visión Qwen3-VL ViT, cabeza MTP (multi-token prediction) y una ventana de contexto de hasta 1.048.576 tokens gracias a YaRN x4 sobre los 262.144 nativos. La ficha del autor describe 48 capas con 512 expertos enrutados por capa, además de una capa MTP, conexiones hiperbólicas (hyper-connections) y proyecciones GDN (GatedDeltaNet), lo que sitúa la arquitectura en la familia de transformers híbridos con atención lineal.

Su relevancia es doble: por un lado, demuestra que un MoE multimodal de casi 25.000 millones de parámetros puede caber y ejecutarse en un Mac con Apple Silicon a 2,75 bpw con pérdida de calidad muy contenida; por otro, es un ejemplo de empaquetado específico de motor, incompatible con transformers, vLLM, mlx-lm o exllamav3, lo que lo convierte en una pieza útil solo dentro del ecosistema sushi. La licencia Qwen Community 1.0 impone condiciones adicionales para servicios comerciales a gran escala.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con atención + GatedDeltaNet (GDN), torre de visión Qwen3-VL ViT y cabeza MTP |
| Parámetros totales | 24.892.950.419 |
| Parámetros activos | no disponible |
| Longitud de contexto | hasta 1.048.576 tokens (YaRN x4 sobre 262.144 nativos) |
| Tipos de cuantización | STQ con codebook SPEC1: expertos enrutados a 2-4 bits (media 2,75 bpw), tronco denso a 6 bits; embedding, hyper-connections, puertas GDN y parte densa de MTP a 8 bits affine; tabla n-gram a 4 bits affine (group size 32) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (license_name: qwen-community-1.0) |
| Formato de pesos | safetensors empaquetados para sushi (no cargable en transformers, vLLM, mlx-lm ni exllamav3) |

## Arquitectura y entrenamiento

El paquete deriva del checkpoint Qwen/Qwen3.8-Flash-Next, un MoE multimodal con 48 capas y 512 expertos enrutados por capa, más una capa MTP adicional. La arquitectura combina bloques de atención con proyecciones GatedDeltaNet (GDN), un indexer y expertos compartidos en el tronco denso, junto con conexiones hiperbólicas. La torre de visión es un Qwen3-VL ViT, lo que habilita entrada de imagen y vídeo además de texto. El modelo incorpora una cabeza MTP para decodificación multi-token y una tabla de embedding n-gram almacenada aparte en `ngram_table.bin`, leída desde SSD y nunca cargada en memoria de GPU.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base en la documentación proporcionada. La innovación técnica destacable de este paquete es la cuantización STQ con codebook SPEC1 y tasas mixtas por banco de expertos, que reduce el tronco denso de 8 bits affine (revisión 1.0) a 6 bits STQ en la revisión 2.0, rebajando el tamaño del paquete en aproximadamente 1 GB y mejorando la KLD en todas las categorías evaluadas. El motor sushi, fork de mlx-serve de ddalcu, es el único runtime capaz de cargar estos pesos.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 1.048.576 tokens.
- Razonamiento y matemáticas, con modo thinking configurable (la evaluación de tool calling usa thinking en nivel medio).
- Generación de código, evaluada en la categoría code con la KLD más baja del paquete (0,0050).
- Entrada de imagen y vídeo a través de la torre de visión Qwen3-VL ViT (pipeline image-text-to-text).
- Tool calling y function calling: 94/100 en tool-eval-bench 3.0.0 en modo hard, con 182 de 194 puntos en 97 escenarios.
- Razonamiento multi-paso y uso en agentes, soportado por la cabeza MTP y el modo thinking.
- Capacidades multilingües, presentes en la evaluación de calidad (categoría multilingual con KLD 0,0226), aunque la lista de idiomas no está publicada.
- Decodificación multi-token (MTP) incluida en el paquete, aunque desactivada en las mediciones de calidad del autor.

## Casos de uso

- Asistente de código en local sobre Mac: el modelo puede completar, revisar y refactorizar código en un entorno sin conexión, aprovechando la categoría code con KLD 0,0050 y el soporte de tool calling para invocar linters o ejecutar tests.
- Agente de automatización con herramientas: con 94/100 en tool-eval-bench 3.0.0 en modo hard, es adecuado para orquestar llamadas a APIs, consultas a bases de datos y flujos multi-paso en un portátil o Mac Studio.
- Análisis de documentos largos: la ventana de 1.048.576 tokens permite procesar libros completos, expedientes o repositorios enteros en una sola pasada, útil para resumen y extracción de entidades.
- Procesamiento de imagen y vídeo: la torre Qwen3-VL ViT habilita descripción de imágenes, respuesta a preguntas visuales y análisis de fotogramas de vídeo en local.
- Asistencia técnica y atención al cliente offline: conversaciones multi-turno con contexto largo y capacidad de consultar herramientas internas mediante function calling, sin enviar datos a la nube.
- Prototipado e investigación en Apple Silicon: sirve para estudiar el comportamiento de un MoE multimodal de 25.000 millones de parámetros cuantizado a 2,75 bpw y comparar la degradación por categoría frente al BF16.
- Generación de documentación técnica y textos largos: la categoría story (KLD 0,0438) y wikitext (0,0948) indican que la pérdida es mayor en texto libre, por lo que conviene revisar la salida en producción.

## Benchmarks y rendimiento

Calidad medida como KLD frente al checkpoint BF16, con KV en bf16, estado GatedDeltaNet en f32 y MTP desactivado, sobre 8 categorías, 2 prompts de 512 tokens por categoría, puntuado hasta el primer EOS. Menor es mejor.

| Paquete | KLD | Acuerdo top-1 | Memoria GPU |
|---|---|---|---|
| Sushi-STQ-2.75bpw, revisión 2.0 | 0,0250 | 94,73 % | 48,5 GB |
| Sushi-STQ-2.75bpw, revisión 1.0 | 0,0295 | 94,73 % | 49,5 GB |
| oQ4e (oMLX), reempaquetado para sushi | 0,0279 | 95,19 % | 74,1 GB |

| Paquete | code | math | reasoning | design | wikitext | multilingual | story | science |
|---|---|---|---|---|---|---|---|---|
| Sushi-STQ-2.75bpw 2.0 | 0,0050 | 0,0063 | 0,0198 | 0,0156 | 0,0948 | 0,0226 | 0,0438 | 0,0164 |
| Sushi-STQ-2.75bpw 1.0 | 0,0059 | 0,0086 | 0,0239 | 0,0188 | 0,0987 | 0,0260 | 0,0576 | 0,0196 |
| oQ4e | 0,0067 | 0,0049 | 0,0191 | 0,0162 | 0,1502 | 0,0233 | 0,0332 | 0,0117 |

Tool calling: tool-eval-bench 3.0.0 en modo hard (seed 42, sin herramientas en vivo), greedy, thinking en nivel medio, valores por defecto de sushi. La revisión 2.0 obtiene 94/100 y 182 de 194 puntos en 97 escenarios; la revisión 1.0, sobre sushi 1.4.0, obtuvo 91/100 y 176 de 194. El autor advierte que la media por categoría descansa en dos prompts y que la clasificación debe hacerse por la KLD global.

## Requisitos de hardware

- Memoria GPU pico durante la evaluación de calidad: 48,5 GB para la revisión 2.0 (49,5 GB para la 1.0).
- Espacio en disco: aproximadamente 75 GiB, de los cuales 45,2 GiB son pesos y 29,8 GiB la tabla n-gram.
- Plataforma: exclusivamente Apple Silicon con macOS 26.2 o posterior y sushi v1.5.1 o superior.
- GPU recomendadas: no disponible de forma explícita; por el consumo de memoria, requiere equipos con memoria unificada de al menos 64 GB. No cabe en configuraciones de 16, 24 o 32 GB.
- No es compatible con CUDA ni con GPU de consumo tipo RTX 4090; no se ejecuta en transformers, vLLM, mlx-lm ni exllamav3.
- Despliegue: solo mediante el motor sushi; la actualización desde la revisión 1.0 se hace con `sushi pull`, que descarga únicamente los ficheros modificados (unos 45 GB) y verifica cada fichero antes de reemplazarlo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Sushi-STQ-2.75bpw (este) | 24.892.950.419 | 1.048.576 | KLD 0,0250; 94/100 en tool-eval-bench | Qwen Community 1.0 | Solo sushi en Apple Silicon |
| Sushi-STQ-2.75bpw revisión 1.0 | 24.892.950.419 | 1.048.576 | KLD 0,0295; 91/100 en tool-eval-bench | Qwen Community 1.0 | Solo sushi, tag `v1.0` |
| oQ4e (oMLX), reempaquetado para sushi | no disponible | no disponible | KLD 0,0279; 95,19 % de acuerdo top-1 | no disponible | Sushi |
| Qwen/Qwen3.8-Flash-Next (BF16) | 24.892.950.419 | 262.144 nativos | Referencia de calidad | Qwen Community 1.0 | Hugging Face, runtime estándar |

## Limitaciones y advertencias

- Compatibilidad restringida: solo carga en sushi v1.5.1 o superior sobre macOS 26.2 o posterior en Apple Silicon; no funciona en transformers, vLLM, mlx-lm ni exllamav3.
- Requiere hardware con memoria unificada alta: el pico medido es de 48,5 GB, por lo que equipos de 32 GB o menos no pueden ejecutarlo.
- La cuantización introduce degradación: la KLD global es 0,0250 y el acuerdo top-1 con el BF16 es del 94,73 %, no del 100 %. Las categorías wikitext (0,0948) y story (0,0438) son las más afectadas.
- Las métricas de calidad se basan en 2 prompts de 512 tokens por categoría; el propio autor advierte que son indicativas y no concluyentes.
- La lista de idiomas soportados no está publicada, lo que dificulta planificar despliegues multilingües.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas de sesgo o veracidad para este paquete.
- Licencia Qwen Community License 1.0: incluye condiciones específicas para servicios comerciales a gran escala que deben revisarse antes de un uso en producción.
- La tabla n-gram (29,8 GiB) se lee desde SSD y no se carga en memoria de GPU; el rendimiento depende de la velocidad del almacenamiento.
- El paquete no incluye información sobre parámetros activos del MoE, lo que limita el cálculo teórico de throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/beamster/Qwen3.8-Flash-Next-Sushi-STQ-2.75bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del motor sushi: https://github.com/beamivalice/sushi
- Documentación de uso de sushi: https://github.com/beamivalice/sushi/blob/main/docs/usage.md
- mlx-serve (proyecto del que deriva sushi): https://github.com/ddalcu/mlx-serve
