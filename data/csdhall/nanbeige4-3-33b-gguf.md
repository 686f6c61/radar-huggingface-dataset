# csdhall/Nanbeige4.3-33B-GGUF

## Resumen

Nanbeige4.3-33B-GGUF es una conversión comunitaria a formato GGUF del modelo Nanbeige4.3-33B, publicado por el usuario csdhall en Hugging Face. El modelo base fue desarrollado por Nanbeige y esta conversión ofrece cuatro variantes de cuantización (BF16, Q8_0, Q6_K y Q4_K_M) generadas directamente desde los pesos oficiales en safetensors BF16, con un total de 33.118.977.024 parámetros. El objetivo es permitir la ejecución local del modelo mediante runtimes como llama.cpp, algo que el modelo original en formato safetensors no facilita directamente.

La relevancia de esta ficha radica en que se trata de una conversión de terceros con requisitos técnicos particulares: los archivos GGUF requieren un parche de tokenizador incluido en el repositorio para funcionar correctamente, y la compatibilidad con versiones sin modificar de llama.cpp u Ollama no está establecida. La conversión incluye validación numérica detallada (KL divergence, cambios de NLL) y pruebas de contexto de hasta 65.536 tokens en las variantes cuantizadas, con metadatos que preservan una configuración de contexto teórico de 524.288 tokens, aunque esta longitud máxima no ha sido verificada en ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer decoder, no especificado en la model card) |
| Parametros totales | 33.118.977.024 (33,1 B) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | 524.288 tokens según metadatos del modelo original (no verificado); probado hasta 65.536 tokens en variantes cuantizadas y 32.768 en BF16 |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el modelo base Nanbeige/Nanbeige4.3-33B está disponible en safetensors BF16) |

## Arquitectura y entrenamiento

La model card de la conversión no detalla la arquitectura interna del modelo base (número de capas, cabezas de atención, tipo de atención). Lo que sí documenta es el proceso de conversión: los cuatro archivos GGUF se derivan directamente de los safetensors BF16 oficiales de Nanbeige/Nanbeige4.3-33B, fijados al commit `c1093c501cc6460427c0ac634db7223d0450c0ee`. Las variantes Q8_0, Q6_K y Q4_K_M se cuantizaron desde el GGUF BF16, y las cuantizaciones Q6_K y Q4_K_M emplearon una matriz de importancia (imatrix) calibrada con 79.872 tokens de texto CC0-1.0 no sensible. No se realizó ningún fine-tuning durante la conversión.

Sobre el entrenamiento del modelo original, la información disponible no incluye datos sobre el número de tokens de entrenamiento, composición del dataset ni uso de técnicas como RLHF o DPO. La innovación técnica destacable de esta conversión es el parche de tokenizador (`nanbeige_tokenizer.patch`), que preserva el comportamiento raw UTF-8 Metaspace BPE del tokenizador original en llama.cpp; el parche se validó con 330 casos y 1.980 comparaciones sin discrepancias frente al tokenizador fuente.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, etiquetado como conversational)
- Soporte de inglés y chino
- Contexto largo: hasta 65.536 tokens verificados en variantes cuantizadas, con metadatos que preservan configuración para 524.288 tokens (no verificado)
- No hay información publicada sobre tool calling, capacidades de agentes, visión, audio ni modo de razonamiento extendido

## Casos de uso

- Inferencia local en estaciones de trabajo con GPU de gama alta: la variante Q4_K_M (20,06 GB) permite ejecutar un modelo de 33 B en una única GPU con 24 GB de VRAM o en configuraciones multi-GPU modestas, sin depender de servicios en la nube.
- Procesamiento de documentos largos en chino e inglés: con contexto verificado de 65.536 tokens, el modelo puede resumir o analizar informes, contratos o documentación técnica extensos en una sola pasada.
- Despliegue autoalojado con privacidad de datos: al ejecutarse con runtimes locales como llama.cpp, los prompts permanecen en la máquina local, adecuado para entornos con requisitos de confidencialidad.
- Experimentación de cuantizaciones: el repositorio incluye la matriz de importancia y datos de KL divergence por variante, útil para investigadores que evalúan el impacto de la cuantización en calidad.
- Desarrollo y pruebas de runtimes: el parche de tokenizador y el manifiesto de integridad SHA-256 facilitan la integración en pipelines de compilación de llama.cpp para equipos que trabajan con soporte de modelos nuevos.
- Asistentes conversacionales bilingües: al estar etiquetado como conversational y soportar chino e inglés, puede servir de base para chatbots locales en ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye únicamente validaciones numéricas de la conversión, no pruebas de tareas:

| Variante | KL media (nats) | Cambio relativo medio de NLL | Memoria GPU registrada en el contexto máximo probado (GB) |
|---|---:|---:|---:|
| BF16 | 0,000449 | -0,00273 % | 73,97 |
| Q8_0 | 0,000316 | +0,07900 % | 50,02 |
| Q6_K | 0,001833 | -0,01642 % | 42,00 |
| Q4_K_M | 0,004216 | -0,15184 % | 34,88 |

Estas mediciones se realizaron con tres textos cortos y no constituyen benchmarks de calidad de tarea. Los cambios negativos pequeños de NLL no implican mejor calidad global.

## Requisitos de hardware

- VRAM estimada para inferencia (memoria GPU registrada en las pruebas, incluyendo pesos, KV cache y buffers):
  - BF16: 73,97 GB (contexto 32.768)
  - Q8_0: 50,02 GB (contexto 65.536)
  - Q6_K: 42,00 GB (contexto 65.536)
  - Q4_K_M: 34,88 GB (contexto 65.536)
- GPU recomendadas: NVIDIA A100 80 GB fue la GPU usada en las pruebas de aceptación con offload completo de pesos. La variante Q4_K_M podría caber en una RTX 4090 (24 GB) solo con offload parcial de capas y contexto reducido; no hay mediciones que lo confirmen.
- Consumer GPU: la variante Q4_K_M (20,06 GB de archivo) no cabe íntegramente en una GPU de 24 GB con contexto grande, pero puede ejecutarse con offload parcial a CPU o en sistemas Apple Silicon con memoria unificada suficiente (32 GB o más, con rendimiento limitado). Las variantes Q8_0 y BF16 requieren estaciones de trabajo con 48-80 GB de VRAM o multi-GPU.
- Opciones de despliegue: llama.cpp es el runtime probado, pero requiere aplicar `nanbeige_tokenizer.patch` al commit exacto `6050b467c07a95c7b87debd4ddac2f8ba8d9b807` antes de compilar. La compatibilidad con llama.cpp u Ollama sin modificar no está establecida. No hay datos sobre vLLM, TGI u otros runtimes para los GGUF (vLLM 0.32.0 se usó solo como referencia numérica para el BF16 original).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Nanbeige4.3-33B (GGUF) | 33,1 B | 524.288 (metadatos, no verificado); 65.536 probado | Apache-2.0 | GGUF, safetensors (base) |
| Qwen2.5-32B | 32,5 B | 131.072 | Apache-2.0 | safetensors, GGUF comunitario |
| Yi-1.5-34B | 34,4 B | 32.768 | Apache-2.0 | safetensors, GGUF comunitario |

Los tres modelos son de tamaño comparable (32-34 B) y orientados a inglés y chino. Nanbeige4.3-33B destaca por el contexto teórico de 524.288 tokens según sus metadatos, aunque sin verificación de ejecución, y por requerir un parche de tokenizador en llama.cpp, lo que añade fricción frente a alternativas con soporte nativo en los runtimes principales.

## Limitaciones y advertencias

- La operación con 524.288 tokens de contexto no ha sido verificada; los límites probados son 32.768 (BF16) y 65.536 (cuantizadas), y la capacidad de contexto incluye una reserva de salida.
- Los archivos GGUF requieren el parche de tokenizador incluido; no se ha establecido compatibilidad con llama.cpp u Ollama sin modificar, lo que puede romper flujos de despliegue estándar.
- Las validaciones numéricas usan solo tres textos cortos y no constituyen benchmarks de calidad; no hay certificación de seguridad ni respaldo del editor original.
- Las salidas pueden ser incorrectas o sesgadas; no hay información sobre sesgos específicos del modelo base.
- Las pruebas de herramientas y código registradas fueron inertes: no se ejecutó código generado ni se realizaron acciones reales de herramientas.
- La verificación SHA-256 garantiza integridad de archivos, no el comportamiento del modelo ni la ausencia de datos memorizados del entrenamiento.
- Uso comercial: la licencia Apache-2.0 lo permite, pero el material del tokenizador derivado del original sigue la licencia declarada por el editor fuente; conviene revisar `LICENSE` y `conversion_NOTICE.txt`.
- El tamaño del repositorio es de 148,7 GB, un coste de descarga significativo si se quieren todas las variantes.

## Enlaces

- Repositorio de la conversión GGUF: https://huggingface.co/csdhall/Nanbeige4.3-33B-GGUF
- Modelo base oficial: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Repositorio de llama.cpp (runtime requerido, con parche): https://github.com/ggml-org/llama.cpp
