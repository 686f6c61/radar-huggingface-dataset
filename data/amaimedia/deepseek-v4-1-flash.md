# AMAImedia/DeepSeek-V4.1-Flash

## Resumen

AMAImedia/DeepSeek-V4.1-Flash es una redistribución cuantizada a 8 bits (fp8) del modelo multimodal deepseek-ai/DeepSeek-V4.1-Flash, publicada por la organización AMAImedia (fundador: Ilia Bolotnikov) el 10 de septiembre de 2026 como parte de su plataforma NOESIS de doblaje multilingüe automatizado. No se trata de un modelo entrenado desde cero: el repositorio declara explícitamente `base_model: deepseek-ai/DeepSeek-V4.1-Flash` y `base_model:quantized:deepseek-ai/DeepSeek-V4.1-Flash`, y conserva la licencia MIT del original.

El modelo subyacente es un Mixture-of-Experts (MoE) multimodal con arquitectura Causal Encoder-Decoder (CED) de 40 capas (20 de encoder causal y 20 de decoder), 552B parámetros de backbone según el informe técnico y contexto de hasta un millón de tokens. La innovación principal es la compresión agresiva del KV cache: solo activa 8B parámetros por token en prefill y 16B en decode, y reduce el KV cache global a 890 bytes por token mediante FP4 (formato E2M1) y atencion dispersa CSA2, aproximadamente un cuarto del de DeepSeek-V4-Flash. Procesa nativamente imágenes y texto, y genera texto de forma autorregresiva.

La relevancia de esta ficha concreta es doble. Por un lado, permite ejecutar un modelo de 484,6B parámetros en safetensors de 8 bits (510,3 GB de repositorio) sin necesidad de convertir pesos. Por otro, es un repositorio con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks publicados y con un pipeline declarado `image-text-to-text`, por lo que debe evaluarse con cautela antes de llevarlo a producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Encoder-Decoder (CED): transformer de 40 capas (20 encoder causal + 20 decoder), MoE multimodal |
| Parámetros totales | 484.619.644.114 (~484,6B) en los safetensors del repositorio; el informe técnico declara 552B de backbone, que incluyen 196B del módulo Engram |
| Parámetros activos | 8B por token en prefill y 16B en decode; 1 experto compartido + 384 expertos enrutados por capa MoE, con 6 expertos enrutados activados por token |
| Longitud de contexto | Hasta 1.000.000 tokens (atencion dispersa entrenada a 64K y extendida a 1M tokens) |
| Tipos de cuantización | Pesos publicados en safetensors de 8 bits (fp8, tag `8-bit`/`fp8`); KV cache principal en FP4 (E2M1, una escala E4M3 por cada 16 canales) |
| Idiomas soportados | en, ru, zh, vi, kk, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `transformers`); tamaño del repositorio 510,3 GB |

## Arquitectura y entrenamiento

DeepSeek-V4.1-Flash introduce tres componentes arquitectónicos poco habituales. El primero es la arquitectura CED: el KV cache global del decoder se proyecta desde los estados ocultos finales del encoder en lugar de derivarse de las capas del propio decoder, lo que permite el reparto asimétrico de parámetros activos (8B en prefill, 16B en decode) y abarata las cargas con mucho input. El segundo es SWA Bounded Replay, que reconstruye los estados KV de sliding-window attention reproducidos los últimos *n*_win tokens en lugar de persistirlos en SSD. El tercero es Compressed Sparse Attention 2 (CSA2), que asigna a cada capa de atención un modo estático (Full, Reindex o Reuse), comparte main KV e índice K entre capas, reutiliza índices Top-K y usa un Hierarchical Sparse Indexer en el decoder para acotar el coste de indexación independientemente de la longitud de contexto.

Se suman a lo anterior Single-Pass mHC (mezcla de residual stream con el kernel Mega-MHC), memoria condicional Engram de 196B parámetros con acceso disperso por lookup de token, y decodificación especulativa DSpark (borrador semi-autorregresivo con verificación por confianza programada). La parte multimodal consta de un vision encoder DeepSeek-ViT entrenado desde cero con 2D-RoPE y downsampling 3×3 pixel-unshuffle, más un proyector MLP de dos capas que convierte las imágenes en embeddings visuales procesados junto al texto desde el inicio del preentrenamiento.

El preentrenamiento se realizó desde cero sobre un corpus multimodal de 45T tokens, con atención dispersa entrenada a 64K de secuencia y extensión de contexto a 1M tokens a partir de 34T tokens. El postentrenamiento sigue el paradigma estándar SFT → RL → destilación on-policy (OPD) sin modificaciones algorítmicas; los cambios se concentran en el pipeline de datos, con síntesis automática a gran escala de tareas y entornos de agente. El modelo expone un ajuste de esfuerzo de razonamiento continuo (entero de 1 a 100) que intercambia coste de inferencia por precisión.

## Capacidades

- Generación de texto autorregresiva con razonamiento controlable mediante el parámetro de esfuerzo de razonamiento (1–100).
- Procesamiento conjunto de imagen y texto (`image-text-to-text`): descripción de imágenes, comprensión de capturas de pantalla y documentos escaneados.
- Contexto largo de hasta 1M tokens con KV cache de 890 bytes por token, apto para cargas con mucho input y poco output.
- Capacidades multilingües en inglés, ruso, chino, vietnamita, kazajo y japonés.
- Entrenamiento orientado a tareas de agente: el pipeline de postentrenamiento sintetiza entornos y tareas agénticas con escalado progresivo de rollouts.
- Memoria condicional Engram (196B parámetros) con acceso disperso por lookup de token.
- Decodificación especulativa DSpark integrada en la arquitectura, con verificación programada por confianza.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades de audio o voz: no disponibles (el pipeline declarado es `image-text-to-text`).

## Casos de uso

- Doblaje y localización multilingüe automatizada: es el escenario para el que se publica el modelo dentro de la plataforma NOESIS/DHCF-FNO de AMAImedia, con seis idiomas cubiertos (en, ru, zh, vi, kk, ja) y capacidad de procesar guiones largos completos gracias al contexto de 1M tokens.
- Análisis de documentos extensos con imágenes: informes anuales, expedientes o manuales técnicos de cientos de páginas que combinan texto y figuras, procesados en una sola pasada sin troceado agresivo.
- Agentes autónomos de múltiples pasos: el modelo está entrenado con entornos agénticos sintéticos y activa solo 8B parámetros por token en prefill, lo que reduce el coste de las fases de lectura de contexto típicas de los bucles de agente.
- Comprensión de capturas de pantalla e interfaces para automatización RPA: el vision encoder con 2D-RoPE permite interpretar UI y extraer campos estructurados de forma multimodal.
- Asistentes de atención al cliente multi-turno en ruso, chino o japonés: la ventana de 1M tokens permite mantener historial completo por cliente y el KV cache reducido abarata la concurrencia.
- Procesamiento por lotes de corpus masivos con entrada dominante: clasificación, resumen y extracción de información sobre millones de documentos, aprovechando el perfil de coste asimétrico (prefill barato, decode más caro).
- Investigación sobre compresión de KV cache y atención dispersa: al ser una redistribución fp8 con la arquitectura CED/CSA2 intacta, sirve como referencia reproducible para experimentos de memoria y throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye tabla de resultados (MMLU, HumanEval, GSM8K ni equivalentes) y la búsqueda web realizada no devolvió ninguna fuente técnica utilizable: los resultados obtenidos fueron páginas genéricas de TikTok, sin relación con el modelo.

## Requisitos de hardware

Estimaciones derivadas del recuento real de parámetros (484,6B) y del tamaño del repositorio (510,3 GB). No son datos publicados por el autor.

- Pesos en 8 bits: ~484,6 GB (1 byte por parámetro). Requiere al menos 8 GPU de 80 GB (H100/H200/A100 80GB) para dejar margen a activaciones y buffers, o 6–7 GPU de 141 GB (H200) en configuraciones muy ajustadas.
- Pesos en bf16/fp16: ~969 GB, fuera del alcance de un solo nodo de 8×80 GB; exigiría 13–16 GPU de 80 GB.
- Pesos en 4 bits (si se generan cuantizaciones posteriores): ~242 GB, mínimo realista de 4×A100/H100 de 80 GB.
- Memoria de KV cache: 890 bytes por token según el informe técnico, es decir ~0,87 GiB para 1M tokens y ~114 MB para 128K tokens por secuencia.
- GPU de consumo: no cabe en ninguna GPU de consumo actual. Una RTX 4090 de 24 GB solo podría alojar una fracción pequeña del modelo mediante offload a RAM/SSD, con latencia inviable en producción.
- Opciones de despliegue: el repositorio declara `library_name: transformers` y el tag `endpoints_compatible`. No se documenta soporte de vLLM, TGI, SGLang, llama.cpp ni Ollama en la información disponible; dado que la arquitectura CED/CSA2 y los kernels Mega-MHC son específicos, la conversión a GGUF o la ejecución en motores genéricos no está garantizada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | KV cache | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AMAImedia/DeepSeek-V4.1-Flash (esta ficha) | 484,6B en safetensors (8 bits) | 1M tokens | 890 bytes/token | MIT | Repositorio HF con 0 descargas, safetensors fp8 |
| deepseek-ai/DeepSeek-V4.1-Flash (base) | 552B de backbone declarados | 1M tokens | 890 bytes/token | MIT | Repositorio original de DeepSeek AI |
| DeepSeek-V4-Flash | no disponible | no disponible | ~4× mayor que V4.1-Flash; huella persistente ~8× mayor | no disponible | Referenciado en la model card; datos propios no disponibles |

No se dispone de datos verificados de otros modelos comparables de la misma categoría (tamaño o tarea) en la información proporcionada, por lo que no se incluye una comparación adicional con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Repositorio derivado: no es un modelo entrenado por AMAImedia, sino una redistribución cuantizada del modelo de DeepSeek AI. La calidad de los pesos fp8 no ha sido validada con benchmarks en la información disponible.
- Ausencia total de benchmarks: no hay resultados publicados que permitan verificar la degradación introducida por la cuantización a 8 bits.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no hay evaluación publicada de fidelidad factual.
- Licencia: el repositorio declara MIT, pero la licencia del modelo original debe verificarse de forma independiente antes de un uso comercial. El modelo base declara MIT en la model card citada, aunque conviene confirmarlo en el repositorio de DeepSeek AI.
- Tamaño de descarga: 510,3 GB, lo que implica coste de almacenamiento, transferencia y tiempos de despliegue elevados.
- Compatibilidad de ecosistema: la arquitectura CED, CSA2 y los kernels Mega-MHC son específicos; el soporte fuera de `transformers` no está confirmado, lo que puede bloquear el uso de motores de inferencia optimizados.
- Idiomas: solo se declaran en, ru, zh, vi, kk y ja. No hay soporte declarado de español ni evaluación de rendimiento por idioma.
- Cambio de dominio: el postentrenamiento se orienta a tareas agénticas y entornos sintéticos; el rendimiento en dominios no cubiertos por ese pipeline no está documentado.
- Madurez del repositorio: 0 descargas y 0 likes, publicado y actualizado el mismo día (10 de septiembre de 2026), sin historial de mantenimiento ni issues públicos.
- Restricciones de contexto: aunque se anuncian 1M tokens, la atención dispersa se entrenó inicialmente a 64K y se extendió después; el rendimiento efectivo en el extremo superior de la ventana no está cuantificado.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o alineación en la información disponible.

## Enlaces

- Repositorio HuggingFace de esta ficha: https://huggingface.co/AMAImedia/DeepSeek-V4.1-Flash
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Informe técnico (PDF citado en la model card): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Organización DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Sitio web de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Twitter/X de DeepSeek AI: https://twitter.com/deepseek_ai
- Sitio de AMAImedia: https://AMAImedia.com/
- X/Twitter de AMAImedia: https://x.com/AMAImediacom
- LinkedIn del fundador (Ilia Bolotnikov): https://www.linkedin.com/in/ilia-bolotnikov
- Telegram: https://t.me/djbionicl

Nota sobre la búsqueda web: los resultados devueltos fueron exclusivamente páginas de TikTok (tiktok.com, vm.tiktok.com, business.tiktok.com, support.tiktok.com), sin ninguna relación con el modelo. No se han encontrado papers, blogs, repositorios ni demos adicionales del modelo en la búsqueda realizada.
