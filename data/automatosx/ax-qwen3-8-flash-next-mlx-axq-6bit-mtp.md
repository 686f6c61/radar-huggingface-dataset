# AutomatosX/AX-Qwen3.8-Flash-Next-MLX-AXQ-6bit-MTP

## Resumen

AX-Qwen3.8-Flash-Next-MLX-AXQ-6bit-MTP es una cuantización de precisión mixta del modelo Qwen/Qwen3.8-Flash-Next, publicada por AutomatosX mediante su toolkit AXQuant. El artefacto empaqueta los pesos originales en formato MLX (safetensors) con una mezcla de precisión efectiva de 6 bits, 8 bits y bf16, y un tamaño medido de 7,423369 bits por peso (BPW) sobre 167.025.781.506 bytes. El modelo cuenta con 177.392.830.611 parámetros totales y un repositorio de 167 GB.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo de cuantización mixta con protección de tensores sensibles (el 2,05 % de los parámetros se mantiene en bf16 y el 29,2 % en 8 bits), una técnica que busca preservar calidad donde la cuantización agresiva duele más. Por otro, el propio autor advierte de que se trata de un artefacto de investigación en desarrollo: no hay benchmark de calidad, no se completó ninguna prueba de carga y generación con éxito, y el sufijo `-MTP` describe pesos empaquetados, no una aceleración verificada.

Por tanto, esta ficha debe leerse como documentación de un release de pesos verificados por checksum, no como una recomendación de despliegue en producción. El modelo base Qwen3.8-Flash-Next aporta presumiblemente capacidades de texto, visión y decodificación especulativa multi-token (MTP), pero ninguna de ellas está validada en este artefacto concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen3.8-Flash-Next (incluye operaciones Gated DeltaNet según los trazas de error del autor); detalles completos no disponibles |
| Parametros totales | 177.392.830.611 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización afín mixta: 68,7413 % de parámetros en 6 bits, 29,2041 % en 8 bits, 2,0546 % en bf16; 7,423369 BPW medidos |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (formato MLX), con `config.json`, `axquant_plan.json`, `axquant_compatibility.json` y `axquant_mtp_sidecar_manifest.json` |

## Arquitectura y entrenamiento

El artefacto no entrena un modelo nuevo: convierte el checkpoint BF16 original de Qwen/Qwen3.8-Flash-Next (revisión inmutable `de4b8e4d43b917e7706784d8bb445c9af86a3540`) a un formato cuantizado para MLX. La arquitectura subyacente es la del modelo base, de la que solo se conocen indicios indirectos: los registros de fallo del autor mencionan una operación Metal de Gated DeltaNet, lo que sugiere componentes de atención lineal o de estado recurrente híbridos en la pila. No se dispone de detalles sobre número de capas, dimensión oculta, cabezas de atención ni composición del dataset de entrenamiento original.

La innovación técnica del pack es el esquema AXQuant: una asignación de precisión por módulo registrada en `axquant_plan.json`, con tamaños de grupo y overrides por módulo, más una carga útil MTP protegida en un sidecar independiente. El autor insiste en que no es MXFP6 ni un checkpoint uniforme de 6 bits. No hay información sobre RLHF, DPO ni número de tokens de entrenamiento, ya que eso pertenece al modelo base y no se ha proporcionado.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` con tag `conversational`, aunque no se ha verificado con una prueba de generación exitosa.
- Pesos de visión presentes en el pack: el autor indica que existen pesos de visión, pero su comportamiento no está verificado en este release.
- MTP (multi-token prediction): los pesos están empaquetados, pero ejecución, aceptación y aceleración están explícitamente sin verificar.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en cuantización mixta: el pack sirve como evidencia reproducible de un esquema AXQuant con distribución de precisión documentada y plan por módulo, útil para estudiar el impacto de proteger tensores en bf16 frente a una cuantización uniforme.
- Auditoría de artefactos de pesos: los manifiestos (`axquant_plan.json`, `axquant_compatibility.json`, sidecar MTP) permiten verificar checksums y trazabilidad de la conversión desde la revisión BF16 fijada, un caso de uso real en pipelines de compliance de modelos.
- Desarrollo de runtimes compatibles: dado que MLX-VLM falló y MLX-LM no se probó, el artefacto es un banco de pruebas para implementar soporte de Gated DeltaNet y de cuantización física declarada en MLX u otros motores.
- Reproducción de experimentos de decodificación especulativa: el sidecar MTP permite a investigadores validar si la predicción multi-token aporta aceleración real, algo que el autor deja abierto.
- Comparación de huellas de memoria: con 7,42 BPW y 167 GB de pesos, sirve para medir requisitos de memoria en tiempo de ejecución frente a alternativas de 4 y 8 bits.
- No apto para producción: no debe emplearse en atención al cliente, generación de código ni pipelines de CI/CD, ya que no existe evidencia de carga ni de generación correcta en este release.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no hay benchmark de calidad ni certificado para esta revisión, y que las mediciones de otros modelos AXQ no son transferibles.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 155,5549 GiB (167.025.781.506 bytes); el autor advierte que los bytes de pesos no determinan el pico de memoria en tiempo de ejecución. Con overhead de activaciones, caché KV y buffers Metal, se requiere previsiblemente un sistema con más de 160 GB de memoria unificada o VRAM, aunque no hay cifra verificada.
- GPU recomendadas: no disponible; no se ha validado ningún hardware. Los intentos del autor con MLX 0.32.4 fallaron por timeout de command-buffer en Metal y por fallo en la consulta de memoria wired.
- Consumer GPU: no cabe en ninguna GPU de consumo actual (RTX 4090 con 24 GB, RTX 5090 con 32 GB). Requiere Apple Silicon con memoria unificada muy alta o aceleradores de centro de datos (A100 80 GB, H100 80 GB, H200) en configuraciones multi-GPU o con offload.
- Opciones de despliegue: MLX-VLM (falló el smoke test), MLX-LM (no probado), AX Engine (manifiesto nativo incluido, sin medición), omlx y mtplx (requieren exportación previa). vLLM, llama.cpp, Ollama y TGI no están soportados por el formato MLX de este pack.
- Latencia y throughput: no disponible; no hay ninguna medición de rendimiento válida para este artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Estado de validación |
|---|---|---|---|---|---|
| AX-Qwen3.8-Flash-Next-MLX-AXQ-6bit-MTP | 177,4 B | no disponible | Mixta 6/8/bf16, 7,42 BPW | qwen-community-1.0 | Sin smoke test exitoso |
| Qwen/Qwen3.8-Flash-Next (BF16) | 177,4 B (presumible) | no disponible | bf16 | qwen-community-1.0 | Modelo base oficial |
| Cuantizaciones MLX uniformes de 4/8 bits del mismo base | 177,4 B | no disponible | 4 u 8 bits uniformes | qwen-community-1.0 | No disponible |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el autor lo describe como evidencia de desarrollo, no como certificado de calidad.
- Inferencia no verificada: no se completó ninguna carga ni generación exitosa. MLX-VLM falló en la consulta de memoria wired y en un timeout de Metal; MLX-LM no se probó.
- MTP sin validar: el sufijo `-MTP` indica pesos empaquetados, no aceleración medida; ejecución y aceptación están sin verificar.
- Visión sin validar: hay pesos de visión, pero su comportamiento no está comprobado.
- Sin benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni de calidad de código o contexto largo.
- Rebuild anunciado: el autor prevé reconstruir el pack con un toolkit mejorado y sustituirlo como nueva revisión; conviene fijar un commit para reproducibilidad.
- Licencia: Qwen Community License 1.0 con términos propios; no se reclama licencia comercial Qwen separada. Revisar el archivo LICENSE antes de cualquier uso downstream.
- Idiomas y sesgos: no declarados; no hay información sobre sesgos conocidos ni sobre riesgo de alucinación medido.
- Memoria: 155,55 GiB solo en pesos; el pico real puede ser sustancialmente mayor y no está medido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AutomatosX/AX-Qwen3.8-Flash-Next-MLX-AXQ-6bit-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Revisión inmutable del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/tree/de4b8e4d43b917e7706784d8bb445c9af86a3540
- Licencia Qwen Community 1.0 (incluida en el repo como LICENSE): https://huggingface.co/AutomatosX/AX-Qwen3.8-Flash-Next-MLX-AXQ-6bit-MTP/blob/main/LICENSE
- Plan de cuantización: https://huggingface.co/AutomatosX/AX-Qwen3.8-Flash-Next-MLX-AXQ-6bit-MTP/blob/main/axquant_plan.json
- Registro de compatibilidad de runtimes: https://huggingface.co/AutomatosX/AX-Qwen3.8-Flash-Next-MLX-AXQ-6bit-MTP/blob/main/axquant_compatibility.json
- Manifiesto sidecar MTP: https://huggingface.co/AutomatosX/AX-Qwen3.8-Flash-Next-MLX-AXQ-6bit-MTP/blob/main/axquant_mtp_sidecar_manifest.json
