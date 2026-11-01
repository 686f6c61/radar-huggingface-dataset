# MichaelAnthony/LFM3-Omni-2B-98K-GGUF

## Resumen

LFM3-Omni-2B-98K-GGUF es una colección de cuantizaciones GGUF de un fine-tune comunitario del modelo [LiquidAI/LFM3-Omni-2B](https://huggingface.co/LiquidAI/LFM3-Omni-2B), publicado por el usuario MichaelAnthony en Hugging Face. El objetivo del proyecto es extender la longitud de contexto efectiva del modelo base hasta aproximadamente 98.000 tokens, verificado mediante pruebas de recuperación tipo needle-in-a-haystack, manteniendo al mismo tiempo las capacidades multimodales (texto, imagen y audio) del modelo original de LiquidAI.

El fine-tune se realizó mediante LoRA (r=32, alpha=64) con datos sintéticos de contexto largo (65k-98k tokens) y se fusionó posteriormente en el modelo base. Una innovación técnica destacable es la conversión de las 5 capas de atención deslizante (`sliding_attention`) del modelo original a atención completa (`full_attention`) durante el entrenamiento, lo que permite un contexto largo genuino sin ventanas deslizantes.

Este modelo es relevante para desarrolladores que necesitan un modelo pequeño (1,73 mil millones de parámetros), multimodal y con contexto muy largo que funcione eficientemente en hardware de consumo mediante llama.cpp, con velocidades de decodificación de entre 70 y 180 tokens por segundo en una GPU como la RX 6750 XT vía Vulkan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LFM de LiquidAI) con atención completa en las antiguas capas deslizantes |
| Parametros totales | 1.728.801.600 (~1,73 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | ~98.000 tokens (entrenamiento efectivo ~94k, verificado hasta 109k en needle-in-a-haystack) |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M (formato GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Otra (other); sujeta a la LFM Open License del modelo base LiquidAI/LFM3-Omni-2B |
| Formato de pesos | GGUF (incluye archivo mmproj separado para el proyector multimodal de visión y audio) |

## Arquitectura y entrenamiento

El modelo base es LFM3-Omni-2B de LiquidAI, un modelo omnimodal compacto. El fine-tune comunitario extendió el contexto mediante LoRA SFT (r=32, alpha=64) sobre datos sintéticos de contexto largo de entre 65.000 y 98.000 tokens, fusionando posteriormente los adaptadores en el modelo base. La longitud de entrenamiento efectiva fue de unos 94.000 tokens, ya que los últimos pasos (94,5k-98,3k) se omitieron por errores de falta de memoria (OOM), aunque la recuperación se verificó más allá de ese límite.

El cambio arquitectónico más importante es la conversión de las 5 capas `sliding_attention` a `full_attention` (theta 1e6, rotary parcial 0,5, sin ventana). Dado que llama.cpp exige al menos una capa de ventana deslizante, los GGUF etiquetan esas capas como SWA con `sliding_window=131072`, `freq_base_swa=1e6` y `n_rot_swa=64`, parámetros numéricamente equivalentes a atención completa. El autor advierte explícitamente de que esta configuración es crítica y no debe modificarse. El modelo requiere llama.cpp b11960 / v0.8.0 o superior.

## Capacidades

- Generación de texto conversacional con contexto muy largo (~98k tokens verificados).
- Entrada multimodal: procesamiento de imágenes y audio mediante el archivo `mmproj` incluido (verificado funcionamiento con audio de entrada vía `llama-mtmd-cli` de llama.cpp).
- Recuperación de información en contextos largos: needle-in-a-haystack con 15/15 aciertos en profundidades del 10%, 50% y 90% entre 15k y 109k tokens.
- Cuantización agresiva sin pérdida de capacidad de contexto: todas las cuantizaciones (Q3_K_M a F16) pasan la prueba de recuperación a 32k, y Q6_K también a 64k.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Análisis de documentos extensos: con ~98k tokens de ventana, puede procesar contratos, informes o documentación técnica completos en una sola pasada, localizando información concreta en cualquier parte del documento (verificado en profundidades del 10%-90%).
- Chatbots con memoria de sesión larga: la ventana de contexto permite mantener conversaciones multi-turno con historiales muy largos sin resumen ni truncado, adecuado para asistentes que consultan conversaciones previas de días o semanas.
- Transcripción y análisis de audio local: mediante `llama-mtmd-cli` y el mmproj incluido, puede aceptar clips de audio como entrada, útil para pipelines de análisis de reuniones o notas de voz sin depender de servicios en la nube.
- Comprensión de imágenes con contexto largo: combina entrada de imagen con documentos largos, por ejemplo responder preguntas sobre capturas incrustadas en manuales técnicos extensos.
- Despliegue en hardware de consumo: con la cuantización Q4_K_M (1,1 GB) cabe en GPUs modestas o incluso en CPU, con decodificación de 70-180 tok/s en una RX 6750 XT vía Vulkan, ideal para aplicaciones locales de RAG sobre corpus medianos.
- Procesamiento por lotes de logs o código: la recuperación verificada a 64k (Q6_K) permite analizar repositorios de código o registros de aplicación completos para depuración y auditoría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento publicados son verificaciones de contexto largo y velocidad de decodificación:

| Prueba | Resultado |
|---|---|
| Needle-in-a-haystack (HF, profundidades 10/50/90%) | 15/15 aciertos, 15k-109k tokens |
| Needle-in-a-haystack (GGUF a 32k) | Aprobado en todas las cuantizaciones (Q3_K_M a F16) |
| Needle-in-a-haystack (GGUF a 64k, Q6_K) | Aprobado |
| Omni mmproj (audio de entrada, llama.cpp mtmd) | Funcionando |
| Velocidad de decodificación (Vulkan, RX 6750 XT) | ~70-180 tok/s según cuantización |

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~1,1 GB (Q4_K_M) hasta ~3,5 GB (BF16/F16) solo en pesos; el contexto de 98k tokens añade un consumo adicional significativo de KV cache, por lo que se recomienda disponer de varios GB extra (la cantidad exacta no está disponible).
- GPU recomendadas: cualquier GPU moderna con soporte Vulkan o CUDA; el autor verifica funcionamiento en una AMD RX 6750 XT (12 GB). No se requieren A100 ni H100 para inferencia.
- Cabe en GPUs de consumo: sí, cómodamente en GPUs de 8-12 GB (RTX 3060, RTX 4060 Ti, RX 6750 XT) incluso con cuantizaciones de alta fidelidad; también viable en CPU puro dada su reducida huella de pesos.
- Opciones de despliegue: llama.cpp (b11960 / v0.8.0 o superior, requisito estricto), `llama-cli` para texto y `llama-mtmd-cli` para multimodal. No hay información sobre compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: ~70-180 tokens/s de decodificación en RX 6750 XT vía Vulkan, dependiendo de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Formato | Licencia |
|---|---|---|---|---|---|
| LFM3-Omni-2B-98K-GGUF (este) | ~1,73 B | ~98k tokens | Texto, imagen, audio | GGUF | LFM Open License (base) |
| LiquidAI/LFM3-Omni-2B (base) | ~1,73 B | no disponible | Texto, imagen, audio | safetensors | LFM Open License |
| Qwen2.5-Omni-3B | ~3 B | ~32k tokens | Texto, imagen, audio, video | safetensors/GGUF | Apache 2.0 |

Nota: la comparativa con Qwen2.5-Omni-3B es orientativa, ya que los datos exactos de contexto del modelo base LFM3-Omni-2B no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Los metadatos SWA de los GGUF son críticos: las capas antiguamente deslizantes están etiquetadas como SWA con `sliding_window=131072`, `freq_base_swa=1e6` y `n_rot_swa=64` para emular atención completa. Modificar estos metadatos rompería el modelo; no deben "corregirse".
- Requiere llama.cpp b11960 / v0.8.0 o superior; versiones anteriores no cargarán el modelo correctamente.
- La longitud de entrenamiento efectiva fue de ~94k tokens (pasos finales omitidos por OOM), por lo que el rendimiento entre 94k y 98k no fue entrenado explícitamente, aunque la recuperación se verificó hasta 109k tokens.
- Sesgos conocidos: no disponible. Riesgo de alucinación: no cuantificado; al ser un fine-tune comunitario con datos sintéticos, no hay evaluaciones de calidad generales publicadas más allá de las pruebas de recuperación.
- Idiomas soportados: no disponible; al derivar del modelo base de LiquidAI, conviene verificar el rendimiento en castellano antes de uso en producción.
- Licencia: sujeta a la LFM Open License del modelo base; deben revisarse sus términos antes de cualquier uso comercial.
- Es un fine-tune de un autor individual con pocas descargas (366) y sin likes, sin respaldo institucional verificado más allá de las pruebas publicadas en la model card.

## Enlaces

- Repositorio del modelo: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Otros enlaces (paper, blog, demo): no disponibles en la información proporcionada.
