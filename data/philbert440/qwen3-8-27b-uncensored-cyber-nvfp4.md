# philbert440/Qwen3.8-27B-Uncensored-Cyber-NVFP4

## Resumen

Qwen3.8-27B-Uncensored-Cyber-NVFP4 es una cuantización NVFP4 (4-bit) del modelo Qwen3.8-27B-Uncensored-Cyber, desarrollada por philbert440. Este modelo base es una variante "abliterated" (des-refusada) del Qwen3.8-27B, un modelo denso de 27 000 millones de parámetros con arquitectura de atención híbrida. La versión NVFP4 está optimizada para ejecutarse en GPUs NVIDIA V100 (SM70) mediante el runtime 1Cat-vLLM, lo que permite desplegar un modelo de este tamaño en hardware de generación anterior con un consumo de memoria reducido.

El modelo conserva la torre de visión y el cabezal MTP (Multi-Token Prediction) en bf16, manteniendo capacidades multimodales y decodificación especulativa. La cuantización utiliza el formato NVFP4A16 (pesos E2M1 de 4 bits con escalas FP8-E4M3) y ha sido calibrada con 768 cadenas de pensamiento y 256 muestras de wiki. Es relevante porque ofrece una alternativa de alto rendimiento con licencia Apache 2.0 para entornos con restricciones de hardware, además de un comportamiento "uncensored" que elimina rechazos para contenido ofensivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (16 capas full attention + 48 capas linear attention) |
| Parametros totales | 27 781 427 952 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (E2M1 4-bit, escalas FP8-E4M3, grupo 16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura transformer con atención híbrida: solo 16 de las 64 capas utilizan atención completa (con un intervalo de 4), mientras que las 48 restantes usan atención lineal con estado recurrente constante. Esta combinación reduce el coste computacional y mejora la eficiencia en contextos largos. La variante Uncensored-Cyber aplica una técnica de "abliteration" con dos pasos: primero una eliminación agresiva de la dirección de rechazo (α=1.15) y luego un "residual-cyber peel" que proyecta la dirección de rechazo específica de contenido cibernético en las capas profundas (desde la capa 4), preservando las capacidades generales.

La cuantización NVFP4 se realizó con la receta variant-C de compressed-tensors, dirigida a capas lineales, manteniendo las proyecciones GDN en fp16. La calibración usó 768 ejemplos de cadena de pensamiento y 256 de wiki, con orden de activaciones por peso y observador MSE. El cabezal MTP y la torre de visión se conservaron en bf16 para no degradar la decodificación especulativa ni las capacidades multimodales.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo matemáticas (GSM8K 0.80 en el padre bf16).
- Procesamiento de imágenes y texto (pipeline image-text-to-text) gracias a la torre de visión conservada.
- Decodificación especulativa mediante cabezal MTP, que acelera la inferencia.
- Comportamiento "uncensored": no rechaza solicitudes ofensivas o cibernéticas, con una tasa de apertura de 100/100 en prompts de prueba.
- Baja tasa de degeneración (0.00) y alta factualidad (1.00) según la evaluación del autor.
- Soporte para ejecución en GPUs V100 (SM70) mediante 1Cat-vLLM con NVFP4.
- No se especifica soporte explícito de tool calling o function calling en la documentación disponible.

## Casos de uso

- Investigación en seguridad ofensiva: el modelo puede generar exploits, técnicas de pentesting o análisis de vulnerabilidades sin rechazos, útil para equipos de seguridad que necesitan explorar vectores de ataque.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o diálogos que requieran lenguaje explícito o temas tabú, con control total del tono.
- Análisis multimodal de imágenes en entornos con hardware limitado: al poder ejecutarse en V100, permite procesar imágenes y texto en infraestructura existente sin necesidad de GPUs modernas.
- Chatbots especializados en dominios técnicos: su capacidad de razonamiento y baja degeneración lo hacen adecuado para asistentes de soporte en ciberseguridad o desarrollo.
- Prototipado rápido de agentes conversacionales: la decodificación especulativa MTP reduce la latencia, facilitando pruebas interactivas.
- Evaluación de técnicas de abliteration: sirve como referencia para estudiar el impacto de la eliminación de rechazos en las capacidades generales del modelo.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación del modelo padre (bf16) con juicio de Claude y un harness de rechazo por regex sobre 100 prompts cibernéticos:

| Metrica | Cyber v2 (esta línea) | Build Cyber anterior |
|---|---|---|
| cyber-open (tasa de apertura) | 100/100 | 93/100 |
| confab (alucinación) | 0.867 | 1.00 |
| factual | 1.00 | 0.933 |
| gsm8k | 0.80 | 0.825 |
| degen (degeneración) | 0.00 | 0.00 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) para esta cuantización específica.

## Requisitos de hardware

- VRAM estimada: los pesos NVFP4 de 27B requieren aproximadamente 14 GB, pero con la torre de visión, el cabezal MTP y el overhead de KV cache, se recomienda al menos 2× V100 (32 GB cada una) en configuración TP2.
- GPU recomendadas: NVIDIA V100 (SM70) o superior; compatible con A100, H100, RTX 4090, etc., aunque el objetivo principal son GPUs antiguas.
- Despliegue: 1Cat-vLLM con `--kv-cache-dtype fp8_e5m2` y decodificación especulativa MTP. También puede usarse vLLM estándar si se adapta el formato NVFP4.
- Latencia y throughput: no se proporcionan datos cuantitativos, pero la decodificación especulativa MTP debería reducir la latencia entre un 20-40% en comparación con decodificación autoregresiva estándar, según la práctica común.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-Cyber-NVFP4 (este) | 27.8B | NVFP4 4-bit | no disponible | Apache 2.0 | Abliterated, multimodal, V100 |
| Qwen3.8-27B (original) | 27.8B | bf16/fp16 | no disponible | Apache 2.0 | Modelo base, sin abliteration |
| Huihui-Qwen3.8-27B-abliterated | 27.8B | no disponible | no disponible | no disponible | Abliteration cruda, proof-of-concept |

La comparativa directa con otros abliterations es limitada por falta de datos públicos de rendimiento. La ventaja principal de esta versión NVFP4 es su compatibilidad con V100, algo que no ofrecen las versiones estándar en bf16.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal o peligroso sin filtros. Su uso debe restringirse a entornos controlados y cumpliendo la legislación aplicable.
- No se dispone de información sobre sesgos específicos, pero al derivar de Qwen3.8-27B, puede heredar sesgos culturales o lingüísticos del entrenamiento original.
- Riesgo de alucinación: aunque la confabulación se reduce (0.867), no es cero. En dominios técnicos de alto riesgo, se recomienda verificación humana.
- La longitud de contexto no está documentada en la información proporcionada; se desconoce si la cuantización afecta al manejo de contextos largos.
- La cuantización NVFP4 está optimizada para V100 mediante 1Cat-vLLM; su uso con otros runtimes puede requerir adaptaciones no documentadas.
- La licencia Apache 2.0 permite uso comercial, pero el carácter "uncensored" puede generar responsabilidades legales en ciertos países o sectores.
- No hay garantía de soporte a largo plazo; es un proyecto comunitario con pocas descargas (147) y sin mantenimiento activo conocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Cyber-NVFP4
- Colección Qwen-3.8-27B Uncensored: https://huggingface.co/collections/philbert440/qwen-38-27b-uncensored
- Modelo base (bf16): https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Cyber
- Receta vLLM de Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Artículo sobre abliteration de Qwen3.8-27B: https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
