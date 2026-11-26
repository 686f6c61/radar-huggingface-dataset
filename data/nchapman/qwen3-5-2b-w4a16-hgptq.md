# nchapman/Qwen3.5-2B-W4A16-HGPTQ

## Resumen

Qwen3.5-2B-W4A16-HGPTQ es una cuantización de 4 bits del modelo multimodal Qwen/Qwen3.5-2B, desarrollada por el usuario nchapman. El modelo base es el modelo compacto de 2B parámetros de Qwen, orientado a chat cotidiano, extracción de información, programación ligera y tareas de visión, e incorpora la arquitectura de atención híbrida de Qwen junto con Multi-Token Prediction (MTP) integrado para decodificación especulativa.

La cuantización emplea GPTQ con rotación de Hadamard en formato W4A16 (pesos de 4 bits, activaciones de 16 bits) y se distribuye en formato compressed-tensors, lo que permite servirlo directamente en vLLM 0.34+ y en el runtime warp34 del propio autor. El resultado es un checkpoint de 1,83 GiB que reduce el peso del modelo en BF16 (4,24 GiB) en un factor de 2,3×, lo que lo hace desplegable en GPUs de consumo con 4-6 GB de VRAM.

La relevancia de esta ficha radica en que combina tres elementos poco habituales en un modelo de este tamaño: capacidades multimodales (image-text-to-text), un cabezal MTP para decodificación especulativa y una cuantización calibrada sobre el modelo completo, incluyendo el codificador visual y el cabezal de borrador especulativo, no solo las capas de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (qwen3_5) y Multi-Token Prediction (MTP) integrado |
| Parametros totales | 2.282.458.432 (2,28B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), GPTQ con rotación de Hadamard, formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors), requiere `trust_remote_code` |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B emplea la arquitectura de atención híbrida de la familia Qwen3.5 e incorpora Multi-Token Prediction (MTP) como cabezal de decodificación especulativa integrado, lo que permite generar varios tokens candidatos por paso y validarlos en paralelo. La cuantización W4A16-HGPTQ aplica GPTQ sobre pesos empaquetados de 4 bits con rotación de Hadamard, técnica que reduce los valores atípicos antes de cuantizar y mejora la fidelidad en comparación con GPTQ estándar. La calibración se realiza sobre el modelo completo: capas de texto, codificador visual y cabezal MTP de borrador especulativo, de modo que tanto la visión como la decodificación especulativa funcionan sin ajustes adicionales.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base pasó por RLHF o DPO. La model card del autor solo documenta el proceso de cuantización y las métricas de fidelidad respecto al modelo en 16 bits: 97,4% de concordancia top-1 en visión aislada, 99,3% en la guarda de UI/OCR y 92,8% de concordancia del borrador MTP.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento y resolución de tareas de extracción de información estructurada.
- Programación ligera y asistencia de código.
- Comprensión de imágenes (pipeline image-text-to-text): descripción, OCR y análisis de interfaces de usuario.
- Decodificación especulativa nativa mediante el cabezal MTP integrado.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponible.
- Modo thinking explícito: no disponible.

## Casos de uso

- OCR y extracción de datos de documentos: el codificador visual calibrado mantiene un 99,3% de concordancia top-1 en la guarda de UI/OCR, lo que permite procesar capturas, formularios e interfaces para extraer campos estructurados con fidelidad cercana al modelo en BF16.
- Asistente de escritorio en GPUs de consumo: con 1,83 GiB de pesos, el modelo cabe en tarjetas de 4-6 GB y deja margen para contexto largo, lo que habilita un asistente local que combina chat y análisis de pantalla sin depender de la nube.
- Atención al cliente automatizada: al ser un modelo conversacional de 2B con contexto amplio (longitud exacta no disponible), puede gestionar diálogos multi-turno en entornos con recursos limitados y desplegarse en vLLM para servir varias sesiones concurrentes.
- Generación de código en pipelines ligeros: adecuado para autocompletado y revisión de fragmentos en editores o herramientas de CI, donde un modelo de 2B con cuantización de 4 bits ofrece latencia baja y un coste de VRAM mínimo.
- Prototipado de aplicaciones multimodales: al ejecutarse en vLLM 0.34+ con `trust_remote_code`, sirve como backend para demos de image-text-to-text sin necesidad de GPUs de datacenter.
- Evaluación de cuantizaciones: el checkpoint incluye el cabezal MTP calibrado, por lo que resulta útil como referencia para medir el impacto de W4A16 frente a BF16 en tareas de visión y decodificación especulativa.
- Inferencia en el borde o en estaciones de trabajo con warp34: el runtime del autor está optimizado para GPUs RTX 30/40-series de 4-6 GB, lo que permite desplegar el modelo en equipos de desarrollo convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de fidelidad de la cuantización frente al modelo base en 16 bits:

| Metrica | Valor |
|---|---|
| Concordancia top-1 en visión aislada | 97,4% |
| Concordancia en guarda UI/OCR | 99,3% |
| Concordancia del borrador MTP | 92,8% |
| Huella de pesos (W4A16) | 1,83 GiB |
| Huella de pesos (BF16) | 4,24 GiB |
| Reducción de tamano | 2,3× |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB para los pesos en W4A16, más la caché KV y el codificador visual; la model card indica que encaja en GPUs de 4-6 GB con margen para contexto largo.
- GPUs recomendadas: RTX 30/40-series de 4-6 GB o superiores para warp34; para vLLM se recomienda una GPU con al menos 8 GB para holgura en contexto largo y concurrencia.
- Cabe en GPU de consumo: sí, en tarjetas de 4-6 GB según el autor.
- Opciones de despliegue: `warp34 serve` (runtime del autor) y `vllm serve` con `--trust-remote-code` (vLLM 0.34+). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la decodificación especulativa vía MTP debería reducirlos, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-W4A16-HGPTQ | 2,28B | no disponible | W4A16 GPTQ + Hadamard | Apache 2.0 | Hugging Face |
| Qwen3.5-2B (base) | 2,28B | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B-W4A16-HGPTQ | no disponible | no disponible | W4A16 GPTQ + Hadamard | Apache 2.0 | Hugging Face |
| Qwen3.5-4B-W4A16-HGPTQ | no disponible | no disponible | W4A16 GPTQ + Hadamard | Apache 2.0 | Hugging Face |

Las alternativas de la misma familia permiten escalar el tamaño (0,79 GiB y 3,19 GiB de pesos respectivamente) manteniendo el mismo esquema de cuantización y runtime. No se dispone de datos de rendimiento comparativo entre ellas.

## Limitaciones y advertencias

- Al ser una cuantización de 4 bits, existe una pérdida de fidelidad respecto al modelo en BF16: 97,4% en visión aislada y 92,8% en el borrador MTP, lo que puede acumular errores en tareas de percepción fina o en decodificación especulativa prolongada.
- Los sesgos conocidos del modelo base no se documentan en la información disponible.
- Riesgo de alucinación inherente a un modelo de 2B parámetros; no se aportan evaluaciones específicas.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento multilingüe homogéneo.
- Longitud de contexto no disponible, lo que impide dimensionar la caché KV con precisión en producción.
- El uso requiere `trust_remote_code` en vLLM, lo que implica ejecutar código del repositorio; conviene auditar el checkpoint antes de desplegarlo.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen/Qwen3.5-2B.
- El soporte de tool calling y de agentes multi-paso no está confirmado, por lo que no debería asumirse en pipelines de producción sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nchapman/Qwen3.5-2B-W4A16-HGPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante 0.8B: https://huggingface.co/nchapman/Qwen3.5-0.8B-W4A16-HGPTQ
- Variante 4B: https://huggingface.co/nchapman/Qwen3.5-4B-W4A16-HGPTQ
- Runtime warp34: https://github.com/nchapman/warp34
- Laboratorio de cuantización warp34-quant-lab: https://github.com/nchapman/warp34-quant-lab
- Informe técnico: TECHNICAL.md (referenciado en la model card, sin URL directa disponible)
