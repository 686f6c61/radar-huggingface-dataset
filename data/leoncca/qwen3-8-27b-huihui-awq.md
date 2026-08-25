# leoncca/Qwen3.8-27B-Huihui-AWQ

## Resumen

El modelo `leoncca/Qwen3.8-27B-Huihui-AWQ` es una cuantización comunitaria en formato AWQ W4A16 del checkpoint `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, que a su vez deriva del modelo oficial `Qwen3.8-27B` de Alibaba (Qwen). Esta versión "abliterated" elimina el ajuste de rechazo de seguridad del modelo original, por lo que no presenta restricciones de contenido en sus respuestas. La cuantización ha sido realizada por el usuario leoncca y está validada específicamente para ejecutarse en hardware NVIDIA Tesla V100 (arquitectura SM70) mediante el runtime 1Cat-vLLM.

El modelo resultante pesa aproximadamente 19,6 GB y conserva los 27.781 millones de parámetros del original, pero con los módulos de lenguaje cuantizados a 4 bits mientras que la parte de visión, el head de lenguaje, los tensores MTP (multi-token prediction) y las proyecciones de atención lineal se mantienen en su precisión original (BF16). Es un modelo multimodal nativo que acepta entradas de imagen y texto, orientado a tareas de razonamiento, generación de código y automatización de oficina. La licencia es Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso con atención lineal híbrida y MTP nativo (Qwen3.8) |
| Parametros totales | 27.781.427.952 (según safetensors) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (se recomienda consultar la ficha del modelo base) |
| Tipos de cuantizacion | AWQ W4A16, group size 128, zero point asimétrico, desc_act=false |
| Idiomas soportados | no disponible (multilingüe según el modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con tensores cuantizados INT32 `qweight`/`qzeros` y escalas BF16) |

## Arquitectura y entrenamiento

El modelo es una cuantización por activación (AWQ) del checkpoint `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, que a su vez es una versión sin ajuste de seguridad del `Qwen3.8-27B` original de Alibaba. El modelo base es un transformer multimodal nativo con arquitectura híbrida: combina atención estándar con proyecciones de atención lineal (los tensores `in_proj_a` e `in_proj_b` se mantienen en precisión original en esta cuantización) y un mecanismo de predicción multi-token (MTP) que permite acelerar la decodificación especulativa. La cuantización fue realizada con GPTQModel 7.3.2, calibrando con 320 registros congelados. Los 400 módulos lineales de la capa de lenguaje se cuantizaron a 4 bits con group size 128, mientras que la ruta de visión, el head de lenguaje, los tensores MTP y las proyecciones de atención lineal quedaron en su precisión original (BF16). No se aplicaron ajustes de entrenamiento adicionales; la cuantización es puramente de inferencia.

## Capacidades

- Generación de texto y razonamiento multi-paso, incluyendo matemáticas (validado en AIME 2026).
- Comprensión de imágenes: el modelo acepta entrada visual y textual (pipeline image-text-to-text).
- Generación y edición de código, con soporte para agentes y flujos de trabajo de oficina.
- Soporte de tool calling y function calling (capacidad heredada del modelo base).
- Capacidad de razonamiento en modo "thinking" (esfuerzo de razonamiento ajustable).
- Predicción multi-token (MTP) nativa para acelerar la decodificación especulativa.
- Comportamiento "uncensored" (sin rechazos de seguridad) gracias a la versión abliterated.
- Capacidades multilingües (heredadas del modelo base, aunque no se especifican idiomas concretos).

## Casos de uso

- **Atención al cliente automatizada**: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de contexto del modelo base (no especificada en esta cuantización, pero suficiente para diálogos extensos). Al no tener rechazos de seguridad, puede tratar temas que otros modelos evitarían, aunque requiere supervisión humana.
- **Generación de código en producción**: su capacidad para generar y editar código, junto con el soporte de tool calling, permite integrarlo en pipelines de CI/CD para autocompletar o revisar código en entornos locales.
- **Análisis de documentos visuales**: al ser multimodal, puede procesar capturas de pantalla, diagramas o formularios escaneados y extraer información estructurada.
- **Automatización de tareas de oficina**: el modelo base está optimizado para productividad de oficina, como redactar correos, resumir informes o crear presentaciones a partir de notas.
- **Asistente de investigación**: para tareas de razonamiento matemático y científico, como lo demuestra su rendimiento en AIME 2026, puede ayudar a resolver problemas complejos.
- **Despliegue en hardware antiguo**: gracias a la cuantización W4A16 y la validación en V100, permite ejecutar un modelo de 27B en GPUs con arquitectura Volta sin soporte de bfloat16, algo que no es posible con el modelo original.

## Benchmarks y rendimiento

Se han publicado resultados en una prueba congelada de MathArena AIME 2026 (30 problemas), así como métricas de rendimiento de inferencia en hardware V100.

| Prueba | Esfuerzo de razonamiento | Correctos | Completados | Errores de petición | Límite |
|---|---:|---:|---:|---:|---:|
| MathArena AIME 2026 | medium | 23/30 | 30/30 | 0 | 0 |
| MathArena AIME 2026 | xhigh | 29/30 | 30/30 | 0 | 1 |

Rendimiento en decodificación (4x V100 PCIe 32 GB, TP4, FP16, un request de 4096 tokens de prompt y 512 tokens de completado, greedy, mediana de 7 runs):

| MTP | Decode tok/s | Output tok/s | Wall (s) | Acceptance especulativa | Carga GiB/GPU |
|---:|---:|---:|---:|---:|---:|
| 0 | 60.922 | 50.473 | 10.144 | - | 4.55 |
| 3 | 94.105 | 70.566 | 7.256 | 64.943% | 5.11 |
| 7 | 86.840 | 66.066 | 7.750 | 37.123% | 5.11 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el checkpoint pesa ~19.6 GB en disco; para inferencia con contexto moderado se requiere al menos 24 GB de VRAM. En la configuración validada (4x V100 32GB), cada GPU carga ~4.55 GiB con MTP desactivado y ~5.11 GiB con MTP activado, gracias al tensor parallelism.
- **GPUs recomendadas**: el modelo está específicamente validado para NVIDIA Tesla V100 PCIe 32 GB (SM70). Puede funcionar en GPUs con soporte de CUDA 8.0+ y suficiente VRAM, como A100, RTX 4090, etc., pero no se garantiza compatibilidad con todos los runtimes.
- **GPU consumer**: Sí, es posible ejecutarlo en una RTX 4090 (24 GB) con cuantización, aunque el contexto se verá limitado. En una RTX 3090 (24 GB) también sería posible con contextos cortos.
- **Opciones de despliegue**: se ha validado con el runtime 1Cat-vLLM (SM70 AWQ) y con GPTQModel (backend torch). No se garantiza compatibilidad con vLLM estándar ni con Transformers sin modificaciones.
- **Latencia**: en la configuración V100 TP4, la latencia end-to-end para 4096+512 tokens es de ~7.3-10.1 segundos según MTP. El throughput de decodificación alcanza hasta 94 tokens/s con MTP3.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| leoncca/Qwen3.8-27B-Huihui-AWQ | 27.8B | AWQ W4A16 | no disponible | Apache-2.0 | Cuantización comunitaria, validada en V100 |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27.8B | BF16 | no disponible | Apache-2.0 | Versión abliterated (sin rechazos) |
| Qwen/Qwen3.8-27B | 27.8B | BF16/FP16 | no disponible | Apache-2.0 | Modelo oficial de Alibaba, con seguridad |

No se dispone de otros modelos comparables con la misma cuantización y validación para V100.

## Limitaciones y advertencias

- **Sin ajuste de seguridad**: el modelo base es abliterated, por lo que no tiene rechazos de contenido. Puede generar texto ofensivo, ilegal o peligroso. El autor advierte que no es seguro para despliegues sin supervisión.
- **Riesgo de alucinaciones**: como cualquier LLM, puede producir información falsa o inventada. No se recomienda para uso sin verificación humana.
- **Limitaciones de contexto**: la longitud de contexto no está documentada en esta cuantización; el modelo base puede tener una ventana de 131k tokens, pero no se ha confirmado.
- **Compatibilidad limitada**: la cuantización está validada únicamente con 1Cat-vLLM (SM70) y GPTQModel. No se garantiza compatibilidad con Transformers, vLLM estándar u otros cargadores AWQ.
- **Requisitos de hardware**: para un uso completo se necesitan al menos 32 GB de VRAM; aunque se puede ejecutar en GPUs de 24 GB, el contexto se reducirá.
- **Licencia**: aunque el modelo está bajo Apache-2.0, el usuario debe revisar la licencia del modelo base original (Qwen3.8-27B) y de la versión abliterated.
- **Cuantización parcial**: la ruta de visión y los tensores MTP se mantienen en BF16, lo que puede aumentar el uso de VRAM en comparación con una cuantización completa.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/leoncca/Qwen3.8-27B-Huihui-AWQ)
- [Modelo base abliterated](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated)
- [Modelo original Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio oficial Qwen3.8 (GitHub)](https://github.com/QwenLM/Qwen3.8)
- [Repositorio del modelo Qwen3.8-27B (GitHub)](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [1Cat-vLLM (runtime SM70)](https://github.com/1CatAI/1Cat-vLLM)
- [GPTQModel (cuantizador)](https://github.com/modelcloud/gptqmodel)</think>## Resumen

El modelo `leoncca/Qwen3.8-27B-Huihui-AWQ` es una cuantización comunitaria en formato W4A16 del checkpoint `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, que a su vez deriva del modelo oficial `Qwen3.8-27B` de Alibaba (Qwen). La versión "abliterated" elimina el comportamiento de rechazo de seguridad del modelo original, por lo que no presenta filtros de contenido. La cuantización ha sido realizada con el objetivo de ejecutar este modelo en hardware NVIDIA Tesla V100 (arquitectura SM70) mediante el runtime 1Cat-vLLM, una configuración poco habitual para modelos de este tamaño.

El checkpoint resultante pesa aproximadamente 19,6 GB y mantiene los 27.781 millones de parámetros del modelo original, pero con los módulos de lenguaje cuantizados a 4 bits mientras que la ruta de visión, los tensores MTP (multi-token prediction) y las proyecciones de atención lineal se conservan en su precisión original (BF16). El modelo es multimodal (texto e imagen), con licencia Apache-2.0 y validado en una configuración de 4x V100 con tensor parallelism. Su principal valor es permitir ejecutar un modelo de 27B en GPUs antiguas sin soporte de bfloat16, además de ofrecer un comportamiento sin censura.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso con atención lineal híbrida y MTP nativo (Qwen3.8) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (se remite a la ficha del modelo base) |
| Tipos de cuantizacion | AWQ W4A16, group size 128, zero point asimétrico, desc_act=false |
| Idiomas soportados | No disponible (multilingüe según el modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (tensores cuantizados INT32 `qweight`/`qzeros` y escalas BF16) |

## Arquitectura y entrenamiento

El modelo es una cuantización AWQ del checkpoint BF16 `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, que a su vez es una versión sin ajuste de seguridad del `Qwen3.8-27B` original de Alibaba. La arquitectura base es un transformer multimodal nativo con atención lineal híbrida (proyecciones `in_proj_a` e `in_proj_b` que se conservan en BF16) y un mecanismo de predicción multi-token (MTP) para acelerar la decodificación especulativa. La cuantización se realizó con GPTQModel 7.3.2, calibrando con 320 registros congelados y empaquetando los 400 módulos lineales de la capa de lenguaje en formato INT32 `qweight`/`qzeros` con escalas BF16. Los tensores de visión, el LM head, y los tensores MTP quedan en su precisión original, por lo que no se trata de una cuantización completa del modelo. No se ha realizado ningún entrenamiento adicional; la cuantización es puramente de inferencia.

## Capacidades

- **Generación de texto y razonamiento**: soporta tareas de razonamiento multi-paso, matemáticas y lógica (validado en AIME 2026).
- **Comprensión de imágenes**: al ser multimodal (pipeline image-text-to-text), procesa imágenes junto con texto.
- **Generación de código**: el modelo base está optimizado para codificación y automatización de oficina.
- **Tool calling / function calling**: soporta llamada a herramientas, lo que permite integración en agentes.
- **Razonamiento agéntico**: puede ejecutar tareas multi-paso con planificación.
- **Capacidades multilingües**: heredadas del modelo base, aunque no se especifican idiomas concretos.
- **Predicción multi-token (MTP)**: permite decodificación especulativa con MTP 0/3/7, mejorando el throughput.
- **Sin rechazos de seguridad**: al ser abliterated, no filtra contenido por políticas de seguridad.

## Casos de uso

- **Despliegue en hardware antiguo**: el caso principal es ejecutar un modelo de 27B en GPUs V100 (SM70) con 32 GB, algo inviable con el modelo BF16 original. La cuantización está validada para 4x V100 con tensor parallelism.
- **Generación de código en producción**: su soporte de tool calling y generación de código permite integrarlo en pipelines de CI/CD para autocompletar o revisar código, aunque requiere supervisión por el riesgo de alucinación.
- **Análisis de documentos visuales**: al ser multimodal, puede procesar capturas de pantalla, diagramas o formularios escaneados para extraer información.
- **Automatización de tareas de oficina**: el modelo base está optimizado para productividad, como redactar correos, resumir informes o generar presentaciones a partir de notas.
- **Asistente de investigación**: su rendimiento en AIME 2026 (29/30 con esfuerzo alto) lo hace útil para problemas matemáticos y razonamiento científico.
- **Agentes autónomos**: con soporte de function calling y razonamiento multi-paso, puede actuar como agente en entornos controlados (navegación web, ejecución de comandos, etc.), siempre con barreras de seguridad externas.

## Benchmarks y rendimiento

La model card proporciona resultados de una prueba congelada de MathArena AIME 2026 (30 problemas):

| Runtime reasoning effort | Correctos | Completados | Errores de petición | Capped |
|---|---|---|---|---|
| medium | 23/30 | 30/30 | 0 | 0 |
| xhigh | 29/30 | 30/30 | 0 | 1 |

Además, se han publicado métricas de rendimiento en 4x V100 PCIe 32GB con TP4, FP16 compute y FP16 KV cache, con 4096 tokens de prompt y 512 tokens de completado (mediana de 7 runs):

| MTP | Decode tok/s | Output tok/s | End-to-end wall | Speculative acceptance | Model load GiB/GPU |
|---:|---:|---:|---:|---:|---:|
| 0 | 60.922 | 50.473 | 10.144 s | - | 4.55 |
| 3 | **94.105** | **70.566** | **7.256 s** | 64.943% | 5.11 |
| 7 | 86.840 | 66.066 | 7.750 s | 37.123% | 5.11 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: la cuantización pesa ~19.6 GB en disco; para inferencia con contexto largo se recomienda al menos 24 GB de VRAM. La configuración validada usa 4x V100 de 32 GB (TP4), cargando ~5.11 GiB por GPU con MTP activado.
- **GPU recomendadas**: Tesla V100 (SM70) es la plataforma validada. También debería funcionar en A100, H100, RTX 4090, etc., pero no se ha probado oficialmente.
- **GPU de consumo**: es posible ejecutarlo en una RTX 4090 (24 GB) o RTX 3090 (24 GB) con contextos reducidos, pero no se garantiza compatibilidad con todos los runtimes.
- **Opciones de despliegue**: validado con 1Cat-vLLM (SM70 AWQ) y GPTQModel (backend TORCH). No se recomienda asumir compatibilidad con Transformers estándar, vLLM común o Ollama sin pruebas.
- **Latencia y throughput**: en el test V100 TP4, con MTP=3 se obtienen ~94 tokens/s de decodificación y ~7.3 s de latencia end-to-end para 4096+512 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| **leoncca/Qwen3.8-27B-Huihui-AWQ** | 27.8B | AWQ W4A16 | no disponible | Apache-2.0 | Cuantizado, validado para V100 |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27.8B | BF16 | no disponible | Apache-2.0 | Modelo base sin rechazos |
| Qwen/Qwen3.8-27B | 27.8B | BF16/FP16 | no disponible | Apache-2.0 | Oficial de Alibaba, con seguridad |

No se han identificado otras cuantizaciones equivalentes con validación para V100 en la información disponible.

## Limitaciones y advertencias

- **Sin ajuste de seguridad**: al ser una versión abliterated, el modelo no tiene rechazos de contenido. Puede generar texto ofensivo, peligroso o ilegal. No es seguro para despliegue directo.
- **Riesgo de alucinación**: como cualquier LLM, puede producir información falsa o inventada, especialmente en razonamiento complejo. Validación humana obligatoria.
- **Contexto no documentado**: la longitud de contexto no se ha publicado; el modelo base podría tener una ventana grande, pero no se confirma.
- **Compatibilidad limitada**: no se garantiza que funcione con todos los cargadores AWQ. El runtime SM70 es específico y requiere compilación propia.
- **Cuantización parcial**: la visión y los tensores MTP se mantienen en BF16, lo que aumenta el uso de VRAM en comparación con una cuantización completa.
- **Licencia**: aunque el checkpoint está bajo Apache-2.0, el usuario debe revisar la licencia del modelo base y del modelo original de Qwen para uso comercial.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/leoncca/Qwen3.8-27B-Huihui-AWQ)
- [Modelo base abliterated](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated)
- [Modelo original Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio oficial de Qwen3.8](https://github.com/QwenLM/Qwen3.8)
- [Repositorio del modelo Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [1Cat-vLLM (runtime SM70)](https://github.com/1CatAI/1Cat-vLLM)
- [GPTQModel (cuantizador)](https://github.com/modelcloud/gptqmodel)
