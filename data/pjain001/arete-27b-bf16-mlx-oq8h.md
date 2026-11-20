# pjain001/Arete-27B-bf16-mlx-oQ8h

## Resumen

Arete-27B-bf16-mlx-oQ8h es una cuantización mixta del modelo Arete-27B, publicada por el usuario pjain001 en Hugging Face. El checkpoint está empaquetado en formato MLX (Apple Silicon) y se ha generado con la herramienta oQ (oMLX v0.8.0), que aplica cuantización de precisión mixta en lugar de un esquema uniforme. El nombre comercial sugiere 27B, pero el recuento real de parámetros almacenados en los safetensors es de 9.477.680.368 (aproximadamente 9,48B), de los cuales 9.017B corresponden al modelo de lenguaje y 0.461B a un componente de visión.

El modelo base declara arquitectura `qwen3_5` según los tags del repositorio, lo que lo sitúa en la familia Qwen 3.5, aunque no se dispone de información oficial sobre el modelo original, sus datos de entrenamiento ni sus capacidades completas. El interés de esta publicación es fundamentalmente práctico: ofrece un checkpoint ejecutable en hardware Apple Silicon con un peso efectivo medio de 24,265 bits por peso y un tamaño de repositorio de 28,8 GB, lo que permite probar un modelo multimodal de ~9,5B en un Mac con memoria unificada suficiente.

La relevancia es limitada pero concreta: se trata de una cuantización de terceros, sin métricas publicadas, sin licencia declarada y con cero descargas en el momento de la consulta. Resulta útil como artefacto para experimentación local en MLX, no como referencia para producción sin validación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (tag `qwen3_5`); detalles no disponibles |
| Parámetros totales | 9.477.680.368 (~9,48B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Cuantización mixta oQ (oMLX v0.8.0): affine 8-bit grupo 64, BF16 y U32; media efectiva 24,265 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (`mlx`, `oq`, `quantized`) |
| Componentes | Lenguaje: 9.017B (25,914 GiB); visión: 0.461B (0.858 GiB) |
| Tamaño del repositorio | 28,8 GB (26,773 GiB de pesos) |
| Fecha de publicación | 2026-11-20 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base más allá del tag `qwen3_5`, que apunta a un transformer de la familia Qwen 3.5. El checkpoint incluye un módulo de visión de 0.461B parámetros, por lo que el modelo es multimodal (texto e imagen), aunque no se detalla el tipo de encoder visual ni cómo se integra con el decoder de lenguaje. Tampoco hay datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas del modelo original.

Lo que sí documenta la model card es el proceso de cuantización. La herramienta oQ (oMLX v0.8.0) asigna precisiones distintas por tensor en lugar de aplicar un único esquema: un 64,231% de los pesos lógicos (6.088B) se almacenan en U32 con 32 bits/peso efectivos, un 26,829% (2.543B) en affine 8-bit con grupo de 64 (8,50 bits/peso) y un 8,939% (0.847B) se mantienen en BF16 (16 bits/peso). El resultado es un checkpoint de 26,773 GiB con una media de 24,265 bits/peso, sustancialmente más pesado que una cuantización 8-bit uniforme pero con mayor fidelidad numérica en las capas que oQ considera sensibles. La model card indica que se re-cuantizó el 2026-11-20 con oMLX v0.8.0 y recomienda volver a descargar copias anteriores.

## Capacidades

- Generación de texto y razonamiento: capacidades inferidas del modelo base Qwen 3.5, sin verificación independiente en este checkpoint.
- Procesamiento de imagen: el checkpoint incluye un módulo de visión de 0.461B parámetros, por lo que se espera soporte de entrada multimodal, aunque no se documentan tareas concretas (VQA, OCR, captioning).
- Capacidades multilingües: no disponibles; el modelo base Qwen suele ser multilingüe, pero este repositorio no declara idiomas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking o razonamiento extendido: no disponible.
- Capacidades de código y matemáticas: no disponibles para este checkpoint concreto.

## Casos de uso

- Experimentación local en Apple Silicon: el formato MLX y el tamaño de 26,773 GiB permiten cargar el modelo en un Mac con memoria unificada de 32 GB o superior, útil para prototipar sin GPU dedicada.
- Evaluación de cuantización mixta: sirve para comparar la fidelidad de oQ frente a cuantizaciones uniformes (4-bit, 8-bit) sobre el mismo modelo base, midiendo perplejidad y calidad de generación.
- Pruebas de pipelines multimodales en local: el módulo de visión permite validar flujos de imagen-texto en entornos de desarrollo antes de migrar a infraestructura con GPU.
- Benchmarking de latencia en MLX: permite medir throughput y tiempo a primer token en chips M-series para dimensionar despliegues locales.
- Docencia y demostraciones: un checkpoint de ~9,5B ejecutable en un portátil facilita talleres sobre cuantización y despliegue de LLM sin depender de la nube.
- Base para fine-tuning con LoRA en MLX: al estar en safetensors y en formato nativo de MLX, puede servir como punto de partida para adaptaciones ligeras en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~26,8 GiB solo para pesos; con overhead de contexto y activaciones, se recomienda un mínimo de 32 GB de memoria unificada y 48-64 GB para contextos largos.
- GPU recomendadas: no aplica GPU dedicada para el formato MLX; requiere Apple Silicon (M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3 Pro/Max, M4 Pro/Max).
- ¿Cabe en consumer GPU? No en el sentido habitual: el formato es MLX y no está pensado para CUDA. En Mac, cabe en equipos con 32 GB o más de memoria unificada.
- Opciones de despliegue: MLX (`mlx-lm`, `mlx-vlm` para el componente visual). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, ya que el checkpoint no está en GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Arete-27B-bf16-mlx-oQ8h | 9,48B | no disponible | MLX safetensors (mixto) | no disponible | Cuantización de terceros, 0 descargas |
| Modelo base Arete-27B (BF16) | no disponible | no disponible | no disponible | no disponible | Referencia original; no se dispone de enlace ni ficha |
| Cuantizaciones MLX estándar de Qwen 3.5 (8-bit) | ~9,5B (si el base coincide) | no disponible | MLX safetensors | según modelo base | Esquema uniforme 8-bit, menor tamaño que este checkpoint mixto |
| Cuantizaciones GGUF de la familia Qwen (Q4_K_M) | ~9,5B | no disponible | GGUF | según modelo base | Compatibles con llama.cpp/Ollama; no ejecutables en MLX sin conversión |

No se dispone de datos suficientes para comparar rendimiento, contexto o licencia con alternativas concretas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o consultar la licencia del modelo base antes de cualquier despliegue.
- Cuantización de terceros sin evaluación publicada: no hay benchmarks que cuantifiquen la pérdida de calidad frente al modelo BF16 original.
- Discrepancia de nomenclatura: el nombre indica "27B" pero el recuento real es de ~9,48B; conviene no fiarse de la etiqueta para dimensionar infraestructura.
- Riesgo de alucinación: inherente a los LLM y no mitigado ni documentado en este checkpoint.
- Idiomas no declarados: no se puede garantizar calidad en castellano ni en otros idiomas sin pruebas.
- Sesgos: no documentados; se heredan del modelo base y del dataset de entrenamiento, desconocido.
- Formato limitado a MLX: no es directamente utilizable en CUDA, vLLM o llama.cpp; requiere conversión si se necesita otro runtime.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por la comunidad.
- Fecha de creación futura (2026-11-20): conviene verificar la integridad y procedencia del checkpoint antes de usarlo en entornos sensibles.

## Enlaces

- Hugging Face: https://huggingface.co/pjain001/Arete-27B-bf16-mlx-oQ8h
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
