# AutomatosX/AX-Clef-Flash-9B-MLX-AXQ-MXFP8

## Resumen

AX-Clef-Flash-9B-MLX-AXQ-MXFP8 es un checkpoint cuantizado en formato MLX, desarrollado por AutomatosX, que convierte el modelo multimodal Cloudflare/clef-flash (familia Qwen3.5, arquitectura densa `Qwen3_5ForConditionalGeneration`) a un presupuesto de almacenamiento mixto de aproximadamente 9,46 bits por peso. El paquete está pensado exclusivamente para Apple Silicon y se ejecuta con MLX-LM, no con PyTorch ni con llama.cpp.

El modelo conserva la ruta de texto cuantizada (84,33 % de los parámetros en 8 bits con grupos de 32 y 15,67 % en BF16) mientras mantiene la torre de visión en un sidecar BF16 de 456 millones de parámetros. Con 9.409.812.208 parámetros lógicos y una ventana de contexto configurada de 262.144 tokens, se posiciona como una opción de desarrollo local para experimentar con un modelo multimodal de casi 10B en hardware Apple.

Es relevante ahora porque demuestra el estado del ecosistema de cuantización específica para MLX (AXQuant 2.1.0) aplicada a modelos multimodales, aunque el propio autor advierte que se trata de evidencia de desarrollo y no de un release certificado: no hay datos publicados de retención de calidad, velocidad de kernels ni calidad visión-lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (`Qwen3_5ForConditionalGeneration`), ruta de texto optimizada y torre de visión BF16 |
| Parametros totales | 9.409.812.208 (9,41B lógicos) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens configurados (límite práctico sujeto a memoria unificada) |
| Tipos de cuantizacion | Mixta AXQuant: 8 bits afín (grupo 32) + BF16; BPW medido 9,4643; clase de presupuesto MXFP8 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors MLX (11,13 GB de pesos; ~11,15 GB de descarga completa); no incluye PyTorch ni GGUF |

## Arquitectura y entrenamiento

El modelo base es Cloudflare/clef-flash (revisión `8b2e5fd17c09fd49bc2880b805d5323ec7ff4ff3`), un transformer denso de la familia Qwen3.5 con capacidad multimodal (visión + texto) y sin módulo MTP (multi-token prediction). AutomatosX no entrena el modelo: aplica una conversión de cuantización AXQuant 2.1.0 directamente desde los pesos BF16 originales, con alcance limitado a la ruta de texto.

La asignación de precisión es mixta y basada en priors de arquitectura, sin calibración con datos: 7,94B parámetros en 8 bits (84,33 %) y 1,47B en BF16 (15,67 %), con métodos `affine` y `bf16` y tamaño de grupo 32. La torre de visión se preserva protegida en BF16 mediante un sidecar de 333 tensores (456,01M parámetros, 0,91 GB). El registro de conversión indica 249/249 módulos convertidos con éxito y 0 fallbacks. No se documenta el volumen de tokens de entrenamiento ni la composición del dataset del modelo base en la información disponible.

## Capacidades

- Generación de texto conversacional y continuaciones multi-turno.
- Procesamiento de imágenes mediante la torre de visión preservada en BF16 (la calidad visión-lenguaje no está evaluada ni reclamada por el autor).
- Razonamiento y generación de código heredados del modelo base Qwen3.5 (sin benchmarks publicados para este checkpoint).
- Ventana de contexto configurada de 262.144 tokens, sujeta a la memoria unificada disponible.
- Ejecución nativa en Apple Silicon mediante MLX-LM para inferencia de texto/backbone.
- Soporte de tool calling, function calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Modo thinking, audio o MTP: no disponibles (audio ausente; MTP no presente).

## Casos de uso

- Prototipado local en Mac con Apple Silicon: desarrolladores que quieran probar un modelo multimodal de ~9,4B sin GPU dedicada, ejecutándolo con MLX-LM y aprovechando la memoria unificada del chip.
- Evaluación de cuantización mixta: investigadores que comparen la retención de calidad de un esquema 8 bits + BF16 con grupo 32 frente a alternativas uniformes o a los hermanos 4bit/6bit de la misma familia.
- Experimentación con contexto largo en local: pruebas de resumen o recuperación sobre documentos extensos aprovechando los 262.144 tokens configurados, siempre que la memoria unificada lo permita.
- Análisis de documentos con imagen en entornos de desarrollo: uso del sidecar de visión BF16 para experimentar con tareas imagen-texto, asumiendo que la calidad no está validada.
- Generación de texto asistida en herramientas de desarrollo: integración en scripts y flujos locales de macOS mediante la CLI de `mlx_lm.generate` para borradores, explicaciones o transformaciones de texto.
- Base para pipelines de cuantización propios: punto de partida para ingenieros que quieran re-cuantizar o comparar presupuestos de almacenamiento dentro del catálogo AXQuant.
- Validación de integridad de artefactos: uso de los registros de conversión (249/249 módulos, 0 fallbacks) como referencia en pruebas de reproducibilidad de checkpoints MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no publica evidencia de calidad medida, contexto largo, velocidad de kernels ni velocidad MTP, y que la etiqueta AXQ no debe interpretarse como una afirmación de benchmark. Los 262.144 tokens de contexto son metadatos de configuración, no una capacidad validada.

## Requisitos de hardware

- VRAM/memoria: al menos ~11,15 GB de descarga; en inferencia se necesita memoria unificada suficiente para pesos más caché KV, que crece con el contexto. Para 262.144 tokens se requiere un equipo con memoria unificada muy alta; no hay cifras medidas publicadas.
- GPU recomendadas: exclusivamente Apple Silicon (series M1/M2/M3/M4 y variantes Pro/Max/Ultra). No es ejecutable en A100, H100 ni RTX 4090 con este formato.
- GPU de consumo: sí cabe en Mac con memoria unificada de 16 GB o superior para contextos cortos; para contextos largos se recomienda 32 GB o más, aunque no hay datos medidos.
- Despliegue: MLX-LM (versiones registradas en conversión: MLX 0.32.1, MLX-LM 0.31.3). No compatible con vLLM, llama.cpp, Ollama ni TGI en este formato. AX Engine no está establecido (no incluye `model-manifest.json` validado).
- Latencia y throughput: no disponibles; no se han medido velocidades de kernels ni de decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AX-Clef-Flash-9B-MLX-AXQ-MXFP8 | 9,41B | 262.144 | MLX Safetensors | Apache 2.0 | 9,46 BPW medido; visión BF16; sin benchmarks |
| AX-Clef-Flash-9B-MLX-AXQ-6bit (mismo autor) | 9,41B | 262.144 | MLX Safetensors | Apache 2.0 | Mayor precisión media cerca del presupuesto de 6 BPW; BPW exacto a consultar |
| AX-Clef-Flash-9B-MLX-AXQ-4bit (mismo autor) | 9,41B | 262.144 | MLX Safetensors | Apache 2.0 | Menor almacenamiento; BPW exacto a consultar |
| Cloudflare/clef-flash (base) | ~9,41B | 262.144 | BF16 (formato original) | No disponible en la información | Referencia de calidad; sin cuantizar |

No se dispone de datos de benchmarks para comparar rendimiento entre estas variantes.

## Limitaciones y advertencias

- Release no certificado: el autor indica que las puertas formales M0-M8 de AXQuant no están cerradas; es evidencia de desarrollo, no un producto validado.
- Sin evidencia de calidad: no hay comparación frente a BF16 ni frente a cuantizaciones uniformes; no se reclama retención de calidad.
- Visión no evaluada: la torre se preserva en BF16, pero la calidad visión-lenguaje no está medida ni reclamada.
- Contexto no validado: los 262.144 tokens son metadatos de configuración; el límite práctico depende de la memoria unificada y no se ha medido.
- Sin MTP: no hay aceleración por multi-token prediction ni datos de velocidad.
- AX Engine no establecido: no incluye manifiesto nativo validado; los campos de `axquant_runtime.json` describen un contrato previsto, no evidencia observada.
- Compatibilidad restringida: solo MLX-LM en Apple Silicon; MLX-LM puede ignorar metadatos de AXQuant y sidecars, por lo que la CLI estándar no garantiza calidad de visión ni aceleración.
- Idiomas no documentados: no se especifican los idiomas soportados.
- Riesgo de alucinación y sesgos: no documentados para este checkpoint; deben asumirse los del modelo base, no evaluados aquí.
- Licencia Apache 2.0: permite uso comercial, pero al no haber validación de calidad, el uso en producción requiere evaluación propia.
- Sin calibración: la asignación de precisión se basa en priors de arquitectura, no en datos de calibración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Clef-Flash-9B-MLX-AXQ-MXFP8
- Modelo base Cloudflare/clef-flash: https://huggingface.co/Cloudflare/clef-flash/tree/8b2e5fd17c09fd49bc2880b805d5323ec7ff4ff3
- Hermano 4bit: https://huggingface.co/AutomatosX/AX-Clef-Flash-9B-MLX-AXQ-4bit
- Hermano 6bit: https://huggingface.co/AutomatosX/AX-Clef-Flash-9B-MLX-AXQ-6bit
- Colecciones de AutomatosX: https://huggingface.co/AutomatosX/collections
- Índice completo del catálogo MLX: https://huggingface.co/collections/AutomatosX/automatosx-mlx-model-catalog
