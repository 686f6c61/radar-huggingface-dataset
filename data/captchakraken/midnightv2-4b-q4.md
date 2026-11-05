# CaptchaKraken/MidnightV2-4B-q4

## Resumen

MidnightV2-4B-q4 es la versión cuantizada a 4 bits del modelo pointer Midnight V2 de 4B parámetros desarrollado por CaptchaKraken, un proyecto especializado en la resolución automática de captchas. El modelo parte de Qwen/Qwen3.5-4B como base y ha sido afinado para una tarea muy concreta: localizar y señalar elementos sobre imágenes de captcha (clics, rejillas, selección de vídeo), emitiendo coordenadas mediante cabezas pointer dedicadas en lugar de generar texto libre.

La relevancia de esta ficha reside en que se trata de un modelo de nicho, con 0 descargas y 0 likes en el momento de la consulta, y cuya model card está orientada a un pipeline propietario (cliente `CaptchaKraken` con un commit concreto y un parche). No es un modelo de propósito general: es un componente de un sistema de resolución de captchas, y su uso fuera de ese ecosistema requiere comprender su arquitectura pointer y su formato de entrada (chat, marcas numeradas y fotogramas de vídeo).

La cuantización GPTQ W4A16 reduce el peso de 9,1 GB (bf16) a 3,6 GB, manteniendo según el autor la precisión dentro de medio punto porcentual en su conjunto de validación interno. El repositorio ocupa 3,8 GB y contiene pesos en safetensors con formato compressed-tensors, pensados para servirse con vLLM en GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con cabezas pointer (base Qwen3.5-4B, incluye proyecciones Gated DeltaNet) |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GPTQ W4A16 (int4, grupo 128, simétrico, activaciones bf16); visión, embeddings, lm_head y cabezas pointer en bf16 |
| Idiomas soportados | no disponible |
| Licencia | LGPL-3.0 |
| Formato de pesos | safetensors (compressed-tensors); existe variante GGUF en otro repo de la familia |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-4B, un transformer del que la model card menciona explícitamente proyecciones Gated DeltaNet entre las capas lineales cuantizadas, lo que sugiere un componente de atención lineal o híbrida en la arquitectura base. Sobre esa base, CaptchaKraken añade cabezas pointer que emiten coordenadas sobre la imagen en lugar de tokens de texto; el `lm_head` se conserva en bf16 porque la cabeza de texto puntúa contra él. El modelo completo (Midnight V2) se distribuye también como LoRA sin fusionar con las cabezas pointer separadas, lo que indica un proceso de ajuste fino sobre la base Qwen3.5-4B.

La cuantización se realizó con llm-compressor aplicando GPTQ W4A16 sobre todas las capas Linear del modelo de lenguaje, incluidas las proyecciones Gated DeltaNet. El conjunto de calibración son 256 tableros de entrenamiento propios del autor, codificados exactamente como en entrenamiento y servicio (chat, marcas numeradas y fotogramas de vídeo), de modo que las matrices de Hessian reflejan las activaciones reales que ve el pointer. La torre de visión, los embeddings, el `lm_head` y las cabezas pointer se mantienen en bf16. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Resolución de captchas mediante señales pointer: devuelve coordenadas sobre la imagen para tareas de clic, rejilla y selección en vídeo.
- Procesamiento multimodal: integra una torre de visión que recibe la imagen del captcha junto con marcas numeradas superpuestas por el detector CNN de elementos.
- Manejo de fotogramas de vídeo para captchas de tipo vídeo (el conjunto de validación incluye 158 tableros de esta categoría).
- Modo "marked" y "plain": el modelo puede operar con marcas numeradas sobre los elementos o sin ellas, con rendimiento distinto según el modo.
- Integración con vLLM mediante un servicio pointer propietario (`PointerService`) que orquesta detector, codificación y decodificación de coordenadas.
- Soporte de cuantización para despliegue en GPU con menor huella de memoria.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo general.

## Casos de uso

- Automatización de pruebas de extremo a extremo: el modelo puede resolver captchas de clic y rejilla en pipelines de QA que validan formularios web propios, siempre que el uso esté permitido por los términos del servicio objetivo y la licencia LGPL-3.0.
- Investigación en visión y grounding: sirve como banco de pruebas para estudiar cómo un modelo pointer con base Qwen3.5-4B localiza elementos numerados sobre imágenes, comparando modos marked y plain.
- Evaluación de cuantización: al publicar el autor resultados bf16 frente a q4 sobre el mismo conjunto de 1.067 tableros, es un caso útil para medir el impacto de GPTQ W4A16 en tareas de grounding visual.
- Despliegue en GPU de gama consumer: con 3,6 GB de pesos, cabe en GPUs con 8-12 GB de VRAM y permite servir el servicio pointer en una RTX 5080, como reporta el autor con latencia mediana de 181 ms por respuesta.
- Integración en sistemas de scraping controlado: para equipos que ya operan el cliente CaptchaKraken y necesitan sustituir el modelo bf16 por la variante q4 reduciendo memoria sin perder precisión apreciable.
- Estudio de arquitecturas híbridas: la presencia de Gated DeltaNet en la base Qwen3.5-4B permite analizar el comportamiento de atención lineal en tareas de percepción visual de baja latencia.
- Reentrenamiento y ajuste: la familia incluye un adaptador LoRA sin fusionar con cabezas pointer, de modo que este repo q4 sirve como referencia de despliegue mientras el LoRA se usa para fine-tuning adicional.

## Benchmarks y rendimiento

El autor publica resultados sobre su conjunto de validación interno "Tier 2" de 1.067 tableros reales etiquetados a mano, servidos con vLLM 0.25.1 en una RTX 5080. Tasa de resolución (solved rate):

| Categoría | bf16 marked | q4 marked | bf16 plain | q4 plain |
|---|---|---|---|---|
| Todos | 71,4% | 70,8% | 75,4% | 75,1% |
| Clic (674) | 73,7 | 73,6 | 78,3 | 77,9 |
| Rejilla (223) | 65,5 | 63,7 | 78,9 | 78,9 |
| Tipo (12) | 50,0 | 50,0 | 50,0 | 50,0 |
| Vídeo (158) | — | — | 59,5 | 59,5 |

Latencia mediana: 181 ms por respuesta en q4 frente a 172 ms en bf16. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; los únicos datos son los de la tarea específica de captchas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,6 GB solo para pesos en q4; con overhead de vLLM, caché KV y torre de visión en bf16, se recomienda al menos 8 GB de VRAM.
- GPU recomendadas: RTX 5080 (validada por el autor), RTX 4090, A100, H100; cualquier GPU con soporte de vLLM 0.25.1 y al menos 8 GB.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 5080, entre otras.
- Opciones de despliegue: vLLM 0.25.1 (con `VLLM_ENABLE_V1_MULTIPROCESSING=0`); para CPU existe la variante GGUF de la familia con llama.cpp (Q4_K_M, BF16, mmproj).
- Latencia y throughput: mediana de 181 ms por respuesta en q4 sobre RTX 5080; no se publica throughput agregado.
- Requiere el cliente `CaptchaKraken` en el commit `c5c1620` más el parche `client-fixes.patch` incluido en el repo, y el detector CNN `detector_r18.pt` de CaptchaKrakenV2-CNN-large.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MidnightV2-4B-q4 (este) | 4.539 M | no disponible | Pointer de captchas | LGPL-3.0 | HF, 0 descargas |
| MidnightV2-4B (bf16) | 4.539 M | no disponible | Pointer de captchas | LGPL-3.0 | HF, misma familia |
| TwilightV2-2B | ~2.000 M (no confirmado) | no disponible | Pointer de captchas | no disponible en la información | HF, misma familia |
| SunlightV2-0.8B | ~800 M (no confirmado) | no disponible | Pointer de captchas | no disponible en la información | HF, misma familia |

No se dispone de datos de benchmarks comparables con modelos de propósito general de tamaño similar, ya que la tarea (grounding de coordenadas sobre captchas) no es directamente equiparable a MMLU o HumanEval. La comparación más significativa es interna a la familia Midnight V2, donde la variante q4 mantiene una precisión dentro de medio punto respecto a bf16.

## Limitaciones y advertencias

- Modelo de nicho: no es un modelo conversacional ni de propósito general; su salida son coordenadas pointer, no texto libre.
- Dependencia de un cliente propietario: requiere el paquete `CaptchaKraken` en un commit concreto y un parche específico, lo que dificulta su reutilización fuera del ecosistema del autor.
- Conjunto de validación interno: los resultados de 70,8% en marked y 75,1% en plain proceden de tableros propios del autor, no de un benchmark público independiente, por lo que pueden no generalizar a otros proveedores de captcha.
- Riesgo de alucinación de coordenadas: como todo modelo pointer, puede señalar elementos inexistentes o erróneos, especialmente en captchas de tipo "Type" (50% de acierto) y de vídeo (59,5%).
- Idiomas no documentados: la model card no especifica idiomas soportados.
- Licencia LGPL-3.0: permite uso comercial pero impone obligaciones de copyleft sobre la biblioteca enlazada; conviene revisar la compatibilidad con el producto antes de integrarlo.
- Consideraciones legales y éticas: el uso de resolvedores de captcha puede vulnerar los términos de servicio de sitios de terceros y la legislación aplicable; el modelo debe emplearse solo en contextos autorizados (pruebas propias, investigación).
- Sin datos de sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad.
- Advertencia de seguridad: la model card incluye instrucciones de carga y un parche de cliente; deben revisarse antes de ejecutarse en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CaptchaKraken/MidnightV2-4B-q4
- Modelo base en bf16: https://huggingface.co/CaptchaKraken/MidnightV2-4B
- Adaptador LoRA: https://huggingface.co/CaptchaKraken/MidnightV2-4B-LoRA
- Variante GGUF: https://huggingface.co/CaptchaKraken/MidnightV2-4B-GGUF
- Familia Sunlight V2 (0.8B): https://huggingface.co/CaptchaKraken/SunlightV2-0.8B
- Familia Twilight V2 (2B): https://huggingface.co/CaptchaKraken/TwilightV2-2B
- Detector CNN de elementos: https://huggingface.co/CaptchaKraken/CaptchaKrakenV2-CNN-large
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B
