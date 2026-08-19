# Foresee/Qwen3.8-9B-heretic-uncensored-4bit-MTPLX

## Resumen

El modelo **Qwen3.8-9B Heretic Uncensored - 4-bit MLX + MTP** es una versión cuantizada y optimizada para Apple Silicon del fine-tune `rohit267/Qwen3.8-9B-heretic-uncensored`, que a su vez deriva de la familia Qwen3.5-9B. El autor, Foresee, ha convertido el modelo original en formato MLX de 4 bits (grupo de cuantización 64, ~4.5 bpw) y le ha añadido un cabezal MTP (Multi-Token Prediction) nativo para decodificación especulativa, junto con un adaptador LoRA de rango 64 entrenado sobre el propio tronco cuantizado. El resultado es un modelo de 9B parámetros que se ejecuta localmente en Macs con chip Apple Silicon, alcanzando velocidades de decodificación de hasta 40 tokens por segundo en un MacBook M5 de 24 GB, con verificación exacta (lossless) respecto al modelo 4-bit de destino.

La relevancia de este modelo radica en su doble vertiente: por un lado, es un modelo "heretic" (sin censura) obtenido mediante la técnica de ablación de rechazo (abliteration) que elimina los mecanismos de rechazo de contenido del modelo base; por otro, incorpora una optimización de inferencia específica para hardware Apple, con soporte de decodificación especulativa nativa a través del runtime MTPLX. Está pensado para desarrolladores que necesitan un asistente conversacional sin restricciones de contenido, desplegado localmente en entornos macOS, con compatibilidad con las APIs de OpenAI y Anthropic.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (atención + GatedDeltaNet), basada en Qwen3.5-9B |
| Parametros totales | 9B (modelo base, según la model card) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit MLX (group size 64, 4.5 bpw) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), sidecar MTP en safetensors, adaptador LoRA en NPZ |

Nota: el archivo `model.safetensors` cuantizado contiene 1.399.927.296 parámetros (dato de HuggingFace), pero corresponde al tronco en 4-bit, no al total de parámetros del modelo original (9B).

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, una arquitectura híbrida que combina atención tradicional con capas GatedDeltaNet, lo que reduce el coste computacional en secuencias largas. Sobre este base, el autor `rohit267` aplicó la técnica **Heretic** (abliteration) para eliminar el rechazo de contenido, dando lugar al fine-tune `Qwen3.8-9B-heretic-uncensored`. Posteriormente, Foresee convirtió el modelo a MLX 4-bit con `mlx_lm.convert --q-bits 4 --q-group-size 64`, y añadió un cabezal MTP (Multi-Token Prediction) heredado de la línea Qwen3.5-9B, junto con un adaptador LoRA de rango 64 entrenado sobre estados ocultos capturados del propio tronco cuantizado, usando datos de C4 (coding, math y long-code). El adaptador se fusiona en tiempo de carga y no está incrustado en el sidecar MTP, lo que permite reutilizar el sidecar base. El entrenamiento del adaptador sobre el tronco final es un requisito crítico: un adaptador calibrado sobre otro tronco no empareja correctamente.

La decodificación especulativa se implementa mediante un kernel de verificación GDN (GatedDeltaNet) con replay de cinta, a profundidad de draft 2. La verificación es exacta (lossless): los tokens emitidos coinciden con la decodificación del modelo 4-bit de destino.

## Capacidades

- Generación de texto conversacional en inglés, con estilo de asistente.
- Modelo "uncensored" (heretic): no aplica rechazo de contenido, lo que permite generar respuestas sobre temas que el modelo base rechazaría.
- Soporte de decodificación especulativa nativa con MTP (Multi-Token Prediction) a través del runtime MTPLX, con verificación exacta.
- Compatible con las APIs de OpenAI (`/v1/chat/completions`) y Anthropic (`/v1/messages`), lo que permite integrarlo con herramientas como Claude Code u OMP.
- Ejecución local en Apple Silicon (macOS 14+), sin necesidad de GPU NVIDIA.
- El fine-tune siempre abre con un bloque de pensamiento (`thinking`), lo que indica que el modelo genera razonamiento interno antes de responder.

## Casos de uso

- **Asistente local sin censura en macOS**: el modelo puede desplegarse como servidor local con MTPLX y usarse desde aplicaciones que hablen la API de OpenAI o Anthropic. Es adecuado para entornos donde se necesita explorar temas sensibles sin filtros, como investigación en ciencias sociales o redacción creativa.
- **Integración con Claude Code y OMP**: al exponer un endpoint compatible con Anthropic, el modelo puede usarse como backend para herramientas de agente que requieren un modelo local sin censura, manteniendo la privacidad de los datos.
- **Prototipado rápido de aplicaciones conversacionales**: gracias a su formato MLX y su velocidad de decodificación (~40 tok/s en M5), es útil para iterar sobre prompts y flujos de conversación en un MacBook sin depender de servicios en la nube.
- **Evaluación de técnicas de ablación (abliteration)**: al ser un modelo "heretic" con la censura eliminada, sirve como banco de pruebas para comparar el comportamiento de modelos censurados vs. no censurados en tareas de generación de contenido.
- **Desarrollo de sistemas de decodificación especulativa**: el paquete incluye un sidecar MTP y un adaptador LoRA entrenado, lo que permite experimentar con MTP en arquitecturas híbridas (GatedDeltaNet) y medir tasas de aceptación de draft.
- **Generación de código y matemáticas**: el adaptador LoRA se entrenó con datos de coding y math, por lo que el modelo mantiene capacidades razonables en estas áreas, aunque no se han publicado benchmarks específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento reportados son:

- Velocidad de decodificación: **21.25 → 40.05 tok/s** (+88%) en un MacBook M5 de 24 GB, con verificación exacta (lossless).
- Tasa de aceptación del draft: **~0.71** a profundidad 2 en el conjunto de pruebas del autor.
- Profundidad 3 o superior no mejora el rendimiento en este modelo híbrido de 9B.

Estos datos provienen de la model card y del repositorio de GitHub asociado, no de evaluaciones independientes.

## Requisitos de hardware

- **Plataforma**: Apple Silicon exclusivamente (M1, M2, M3, M4, M5). Requiere macOS 14 o superior.
- **VRAM estimada**: el tronco 4-bit ocupa ~5.0 GB (según la model card), más el sidecar MTP y el adaptador. En un MacBook M5 de 24 GB se ejecuta sin problemas; probablemente quepa en configuraciones de 16 GB, aunque no se ha verificado.
- **GPU recomendada**: no aplica GPU NVIDIA; se usa la GPU integrada de Apple Silicon vía MLX.
- **Opciones de despliegue**: MTPLX (runtime principal, instalable con `brew install youssofal/mtplx/mtplx`), o directamente con `mlx_lm` para carga y generación sin MTP.
- **Latencia y throughput**: ~40 tok/s en M5 24 GB con MTP activado; sin MTP, ~21 tok/s. La latencia de primer token no se ha reportado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Plataforma | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-9B-heretic-uncensored (este) | 9B | No disponible | 4-bit MLX | Apache-2.0 | Apple Silicon | Con MTP, uncensored |
| rohit267/Qwen3.8-9B-heretic-uncensored | 9B | No disponible | BF16 (original) | Apache-2.0 | Multiplataforma | Modelo base sin cuantizar, sin MTP |
| Qwen3.5-9B (base) | 9B | No disponible | BF16 | Apache-2.0 | Multiplataforma | Modelo original con censura |

No se dispone de datos de rendimiento comparativos (benchmarks) entre estos modelos. La comparativa se limita a características estructurales.

## Limitaciones y advertencias

- **Modelo sin censura**: al eliminar el rechazo de contenido, el modelo puede generar texto ofensivo, peligroso o ilegal. No es apto para uso en producción sin supervisión humana y filtros adicionales.
- **Solo inglés**: el modelo está entrenado únicamente en inglés; su rendimiento en otros idiomas es muy limitado.
- **Solo Apple Silicon**: el formato MLX y el runtime MTPLX son exclusivos de macOS con chip Apple. No se puede ejecutar en GPUs NVIDIA o AMD.
- **Cuantización lossy**: la conversión a 4-bit cambia los pesos; aunque la decodificación especulativa es exacta respecto al modelo 4-bit, el resultado difiere del modelo BF16 original.
- **Bloque de pensamiento obligatorio**: el fine-tune siempre abre con un bloque `thinking`, lo que consume tokens y puede aumentar la latencia percibida en aplicaciones con presupuesto de tokens ajustado.
- **Sin benchmarks publicados**: no hay evaluaciones independientes de calidad (MMLU, HumanEval, etc.), por lo que el rendimiento real en tareas específicas es desconocido.
- **Riesgo de alucinación**: como cualquier LLM, puede inventar información, especialmente en dominios especializados.
- **Licencia Apache-2.0**: permite uso comercial, pero el modelo deriva de Qwen3.5-9B, cuya licencia original también es Apache-2.0; se debe verificar el cumplimiento de los términos de la licencia del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Foresee/Qwen3.8-9B-heretic-uncensored-4bit-MTPLX
- Modelo base (rohit267): https://huggingface.co/rohit267/Qwen3.8-9B-heretic-uncensored
- Repositorio de optimización MTPLX: https://github.com/undeemed/qwen-heretic-mtplx-speedup
- Proyecto Heretic (abliteration): https://github.com/p-e-w/heretic
- Runtime MTPLX: https://mtplx.com
