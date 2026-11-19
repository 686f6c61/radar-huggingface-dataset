# orcarouter/Qwen3.8-27B-Uncensored-MLX

## Resumen

Qwen3.8-27B-Uncensored-MLX es una compilación en formato MLX del modelo Qwen3.8-27B de Qwen, publicada por orcarouter (OrcaRouter). Se trata de un modelo denso de 27 356 728 560 parámetros (~27,4 B) con arquitectura de atención híbrida (Gated DeltaNet lineal combinada con atención completa), torre de visión nativa y cabeza MTP (multi-token prediction), convertido a cuantizaciones afinas de 2, 4, 6 y 8 bits para Apple Silicon. La modificación principal respecto al modelo base es la *abliteration*: la dirección de rechazo se ha ortogonalizado fuera del flujo residual, de modo que el modelo deja de negarse a peticiones que el original rechazaría.

El interés del lanzamiento es doble. Por un lado, ofrece una vía práctica para ejecutar un VLM de ~27 B en hardware Apple con cuantización de grupo 64, manteniendo la torre de visión, las normas y las capas convolucionales en BF16 mientras solo se cuantizan las matrices lineales del modelo de lenguaje (incluidas `embed_tokens` y `lm_head`). Por otro, su carácter "uncensored" lo sitúa como herramienta de investigación en mecanismos de rechazo, interpretabilidad y red teaming, no como modelo listo para producción sin capas adicionales de moderación.

El modelo hereda la licencia Apache 2.0 del base y soporta inglés y chino, además de *function calling*, razonamiento con control de *thinking* y entrada imagen-texto. Con 53 700 descargas y 1667 likes en Hugging Face, es una de las variantes abliteradas más populares de la familia Qwen3.8.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (Gated DeltaNet lineal + atención completa), torre de visión nativa y cabeza MTP |
| Parámetros totales | 27 356 728 560 (~27,4 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 2, 4, 6 y 8 bits, afina con tamaño de grupo 64; visión, normas y convoluciones en BF16 |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors); el 4-bit también replicado en la raíz del repositorio para carga directa en LM Studio |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura de atención híbrida: capas con Gated DeltaNet (atención lineal con estado recurrente) intercaladas con capas de atención completa, lo que reduce el coste computacional en contextos largos manteniendo la capacidad de recuperación exacta. Incluye además una cabeza MTP (multi-token prediction) que permite decodificación especulativa o entrenamiento con predicción de varios tokens, y una torre de visión que lo convierte en un modelo nativo image-text-to-text en lugar de un LLM con adaptador añadido. El pipeline declarado en Hugging Face es `image-text-to-text`.

Sobre el proceso de entrenamiento del base (número de tokens, composición del dataset, uso de RLHF/DPO) no se proporciona información en la documentación disponible. La modificación de esta compilación es la abliteración: se calcula la dirección de rechazo en el flujo residual y se ortogonaliza respecto a los pesos, eliminando el comportamiento de negativa. La cuantización MLX usa cuantización afina con grupo de 64 y preserva en BF16 la torre de visión, las normas y las capas convolucionales; solo las matrices lineales del LM se cuantizan. El repositorio ocupa 78,5 GB e incluye las cuatro precisiones en subcarpetas.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo *thinking* controlable heredado del base.
- Comprensión de imágenes y texto (image-text-to-text): descripción, VQA y razonamiento sobre documentos visuales.
- *Function calling* / *tool calling* para integración en pipelines de agentes.
- Razonamiento matemático y generación de código (capacidades del base Qwen3.8-27B).
- Multilingüe limitado a inglés y chino.
- Cabeza MTP para decodificación especulativa y aceleración de inferencia.
- Comportamiento sin rechazo: responde a peticiones que el modelo alineado rechazaría (característica buscada en red teaming, no una capacidad de producto).

## Casos de uso

- Investigación de mecanismos de rechazo: comparar las activaciones y respuestas de esta variante con las de Qwen3.8-27B original para localizar y caracterizar la dirección de rechazo en el flujo residual.
- Red teaming y evaluación de robustez: generar intentos adversariales y prompts dañinos en un entorno controlado para probar clasificadores y filtros de moderación antes de desplegarlos.
- Análisis de seguridad de sistemas multimodales: probar si la torre de visión introduce vectores de ataque (prompt injection en imágenes, texto embebido) frente a un VLM de 27 B con contexto largo.
- Inferencia local en Apple Silicon: ejecutar un VLM de ~27 B en un Mac con memoria unificada usando la cuantización de 4 bits del repositorio, sin GPU dedicada ni servicios en la nube.
- Estudio de cuantización: comparar la calidad de las variantes 2/4/6/8 bits sobre las mismas tareas de razonamiento y visión, ya que las cuatro se distribuyen en el mismo repositorio con idéntico esquema de grupo 64.
- Experimentos de interpretabilidad con MTP: analizar cómo la cabeza de predicción multi-token afecta a la coherencia y a la diversidad de las muestras en decodificación especulativa.
- Evaluación de *function calling* sin alineación: medir si la eliminación del rechazo altera la tasa de llamadas a herramientas inseguras o mal formadas en agentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia exclusiva en Apple Silicon mediante MLX; no hay pesos GGUF ni safetensors estándar para CUDA en este repositorio.
- VRAM/memoria unificada estimada: ~7 GB para 2 bits, ~14 GB para 4 bits, ~21 GB para 6 bits y ~28 GB para 8 bits, solo para pesos del LM; añadir overhead de KV cache, activaciones y torre de visión en BF16.
- Memoria unificada recomendada: 32 GB para 4 bits con contexto moderado; 64 GB o más para 8 bits y contextos largos.
- El repositorio completo ocupa 78,5 GB, por lo que conviene descargar solo la subcarpeta de la precisión deseada.
- Despliegue: MLX (`mlx-lm`/`mlx-vlm`), LM Studio (la build 4-bit de la raíz está pensada para carga directa) y herramientas compatibles con MLX; no se indica soporte de vLLM, TGI, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-MLX (este) | ~27,4 B densos | no disponible | Imagen-texto | Apache 2.0 | MLX 2/4/6/8-bit | Abliterado, solo Apple Silicon |
| Qwen/Qwen3.8-27B (base) | ~27,4 B densos | no disponible | Imagen-texto | Apache 2.0 | safetensors (BF16) | Alineado, sin ablación; requiere GPU para BF16 |
| Otras variantes abliteradas de la familia Qwen3.8 | no disponible | no disponible | Texto o imagen-texto | Apache 2.0 (heredada) | GGUF/safetensors según autor | No verificadas en la información disponible |

## Limitaciones y advertencias

- La alineación de seguridad está sustancialmente eliminada: el modelo cumplirá peticiones dañinas, ilegales u ofensivas sin guardarraíles integrados.
- Riesgo elevado de alucinación y de contenido nocivo; requiere capas propias de moderación, filtrado y prevención de abuso antes de cualquier despliegue.
- Solo inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto no especificada en la documentación; no asumir la del modelo base sin verificar.
- La licencia Apache 2.0 permite uso comercial, pero el autor no acepta responsabilidad por el uso ni por los daños derivados; la responsabilidad legal recae en el desplegador.
- Formato MLX: no ejecutable en CUDA ni en CPU x86 sin conversión adicional.
- La cuantización de 2 bits puede degradar de forma notable el razonamiento y la fidelidad visual; validar antes de usar en tareas sensibles.
- El repositorio mezcla cuatro precisiones y promoción comercial del proveedor; verificar qué subcarpeta se descarga y su integridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Sitio del autor: https://www.orcarouter.ai
- Catálogo de modelos: https://www.orcarouter.ai/models
- Ficha del modelo en OrcaRouter: https://www.orcarouter.ai/models/qwen/qwen3.8-27b
- GitHub del autor: https://github.com/Continuum-AI-Corp
- Discord: https://discord.gg/yAh6Tex6kx
- X: https://x.com/OrcaRouter
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
