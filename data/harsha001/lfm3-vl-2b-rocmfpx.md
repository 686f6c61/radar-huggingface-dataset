# Harsha001/LFM3-VL-2B-ROCmFPX

## Resumen

LFM3-VL-2B-ROCmFPX es una cuantización comunitaria del modelo visión-lenguaje LFM3-VL-2B de Liquid AI, publicada por el usuario Harsha001. El modelo original es un transformer de aproximadamente 1.730 millones de parámetros (1,73 B) diseñado para comprensión de imágenes, documentos, gráficos y capturas de pantalla en dispositivos locales. Esta versión concreta no es un modelo nuevo, sino una conversión a formato GGUF con tipos de peso de baja precisión propios de ROCmFPX, un fork de llama.cpp orientado a GPUs AMD (ROCm/HIP y Vulkan), con especial atención al hardware Strix Halo.

La relevancia de esta ficha radica en que permite ejecutar un modelo visión-lenguaje de 2 B en hardware de consumo AMD, algo poco habitual en el ecosistema GGUF, dominado por CUDA. El autor ofrece tres cuantizaciones (8 bits, 6 bits y 4 bits) con métricas de divergencia KL frente a BF16 medidas sobre WikiText-2, lo que permite comparar la pérdida de calidad de forma cuantitativa. La cuantización de 6 bits se presenta como la recomendada por su equilibrio entre tamaño (1,43 GB) y fidelidad.

No obstante, conviene subrayar que los ficheros ROCmFPX requieren el fork específico del autor: llama.cpp estándar, LM Studio u Ollama no los cargan. Además, el propio autor advierte de que las pruebas se realizaron en CPU y que aún no se han validado en hardware AMD real, lo que limita su uso en producción sin una verificación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje (modelo base LFM3-VL-2B de Liquid AI); pesos en formato GGUF con tipos ROCmFPX |
| Parámetros totales | 1.728.801.742 (1,73 B) |
| Parámetros activos | no disponible (no es un modelo MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | ROCmFPX 8 bits (Q8_0_ROCMFPX), ROCmFPX 6 bits (Q6_0_ROCMFPX), ROCmFP4-FAST 4 bits para Strix Halo; proyector visual en F16 y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (con tipos de peso propietarios ROCmFPX) + mmproj GGUF para el proyector visual |

## Arquitectura y entrenamiento

El modelo base LFM3-VL-2B es un transformer multimodal de Liquid AI que combina un codificador visual con un modelo de lenguaje para tareas de imagen-a-texto. La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifica si emplea innovaciones como atención lineal o decodificación especulativa; la model card del repositorio cuantizado se centra en el proceso de conversión y no en la arquitectura interna.

El trabajo técnico de esta ficha se concentra en la cuantización. El autor parte de un GGUF en BF16 convertido con el script `convert_hf_to_gguf.py` del fork ROCmFPX, genera una importance matrix a partir de un texto de calibración general (`calibration_datav3`) en fragmentos de 512 tokens, y aplica `llama-quantize --imatrix` para producir cada fichero. La variante de 6 bits emplea `LLAMA_ROCMFPX_TENSOR_SCALE=1`, que almacena una escala potencia de dos por tensor de pesos, aplicada en tiempo de ejecución sin configuración adicional, y usa `--token-embedding-type q6_K`. El proyector visual se exporta por separado en F16 y Q8_0 y se carga con `--mmproj`.

## Capacidades

- Generación de texto a partir de imágenes: descripción de fotografías, documentos, gráficos y capturas de pantalla, según la orientación del modelo base.
- Comprensión de documentos: el autor verificó el proyector visual con una foto de la portada de un periódico y el modelo la describió correctamente usando la variante de 8 bits.
- Conversación multimodal multi-turno: la etiqueta `conversational` del repositorio y el pipeline `image-text-to-text` indican soporte de diálogo con imágenes.
- Inferencia local en el borde: el tamaño reducido (1,06-1,80 GB según cuantización) permite ejecución en dispositivos con recursos limitados.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con servidores compatibles con la API de llama.cpp.
- Tool calling, function calling, agentes, razonamiento multi-paso, matemáticas avanzadas o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se especifican idiomas soportados.

## Casos de uso

- Asistente de accesibilidad en local: el modelo puede describir imágenes y capturas de pantalla para usuarios con discapacidad visual, ejecutándose íntegramente en una GPU AMD de consumo sin enviar datos a la nube, gracias a su tamaño de 1,06-1,80 GB.
- Procesamiento de documentos escaneados en el borde: digitalización y resumen de recibos, formularios o páginas de periódico mediante el proyector visual Q8_0, adecuado para entornos con requisitos de privacidad donde no se permite subir documentos a servicios externos.
- Análisis de gráficos y dashboards: extracción de tendencias o descripción de figuras en informes, útil en estaciones de trabajo con GPUs AMD Strix Halo donde la cuantización de 4 bits ofrece la mayor velocidad.
- Automatización de soporte técnico con capturas: el modelo puede interpretar capturas de pantalla de errores enviadas por usuarios y generar una primera respuesta, integrándose en un servidor `llama-server` con la API compatible.
- Prototipado de aplicaciones visión-lenguaje en hardware AMD: desarrolladores que trabajan con ROCm o Vulkan pueden validar pipelines multimodales sin depender de CUDA, usando la variante de 6 bits como compromiso entre calidad y tamaño.
- Investigación sobre cuantización de baja precisión: las métricas de divergencia KL y de coincidencia de token superior publicadas permiten estudiar el impacto de los tipos ROCmFPX frente a las cuantizaciones estándar de llama.cpp en un modelo multimodal pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de la cuantización frente al GGUF en BF16, medidas sobre 40 fragmentos de 512 tokens de WikiText-2 (split de test) en CPU:

| Fichero | Tamaño | Pesos | Divergencia KL vs BF16 (menor es mejor) | Mismo token superior que BF16 |
|---|---:|---|---:|---:|
| Q8_0_ROCMFPX | 1,80 GB | ROCmFPX 8 bits | 0,0032* | 96,4 %* |
| Q6_K_ROCMFPX (recomendado) | 1,43 GB | ROCmFPX 6 bits | 0,0162 | 93,3 % |
| Q4_0_ROCMFP4_STRIX_O8 | 1,06 GB | ROCmFP4-FAST 4 bits (Strix Halo) | 0,209* | 76,5 %* |
| Q8_0 estándar (referencia) | 1,85 GB | llama.cpp Q8_0 | 0,0032 | 96,9 % |
| Q6_K estándar (referencia) | 1,43 GB | llama.cpp Q6_K | 0,0167 | 92,5 % |
| Q4_K_M estándar (referencia) | 1,10 GB | llama.cpp Q4_K_M | 0,1248 | 80,7 % |

Los valores marcados con asterisco provienen de una ejecución de octubre con recetas casi idénticas; los ficheros de 8 y 4 bits se añadieron el 20 de noviembre de 2026 y sus cifras definitivas están pendientes de actualización. El fichero de 6 bits supera ligeramente al Q6_K estándar con el mismo tamaño. El fichero de 4 bits para Strix Halo se aleja más del BF16 que el Q4_K_M estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB para el fichero de 6 bits más 0,20 GB del proyector Q8_0; en torno a 2,0-2,2 GB para la variante de 8 bits con proyector; cerca de 1,3 GB para la de 4 bits con proyector.
- GPUs recomendadas: el autor menciona AMD Strix Halo (objetivo `gfx1151`) y RX 7900 (`gfx1100`) como destinos del fork ROCmFPX, con compilación mediante `-DGGML_HIP=ON` o `-DGGML_VULKAN=ON`.
- Cabe en GPU de consumo: sí, por tamaño; sin embargo, la compatibilidad real con GPUs AMD no está verificada, ya que el autor indica que los ficheros se comprobaron en CPU y no se han probado en hardware AMD. No se menciona compatibilidad con GPUs NVIDIA.
- Opciones de despliegue: exclusivamente el fork `HarshaVardhan3002/ROCmFPX` de llama.cpp (`llama-server`, `llama-mtmd-cli`). llama.cpp estándar, LM Studio, Ollama y otras builds de ROCmFPX pueden no cargar los ficheros.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-ROCmFPX (esta ficha) | 1,73 B | no disponible | LFM Open License v1.0 | GGUF ROCmFPX, requiere fork propio | Cuantizaciones 8/6/4 bits optimizadas para AMD |
| LiquidAI/LFM3-VL-2B (modelo base) | 1,73 B | no disponible | LFM Open License v1.0 | Pesos originales en Hugging Face | Sin cuantizar; referencia de calidad |
| Cuantizaciones estándar de llama.cpp del mismo modelo (Q8_0, Q6_K, Q4_K_M) | 1,73 B | no disponible | LFM Open License v1.0 | GGUF estándar | Compatibles con llama.cpp, LM Studio y Ollama; el Q6_K ROCmFPX iguala su divergencia KL con el mismo tamaño |

No se dispone de información sobre otros modelos comparables de la misma categoría (visión-lenguaje de ~2 B) en la documentación proporcionada.

## Limitaciones y advertencias

- Dependencia de un fork no oficial: los ficheros ROCmFPX no cargan en llama.cpp estándar, LM Studio ni Ollama; requieren compilar `HarshaVardhan3002/ROCmFPX`.
- Validación incompleta: el autor advierte explícitamente de que los ficheros se comprobaron en CPU y no se han probado en hardware AMD real, por lo que el rendimiento y la estabilidad en GPU están sin verificar.
- Cuantización agresiva en 4 bits: la variante Strix Halo presenta una divergencia KL de 0,209 y solo un 76,5 % de coincidencia de token superior con BF16, peor que el Q4_K_M estándar; no es adecuada cuando prima la calidad.
- Pruebas visuales limitadas: solo se validó el proyector con una imagen de prueba y con la variante de 8 bits; las variantes de 6 y 4 bits no se probaron por separado con imágenes.
- Licencia restrictiva para uso comercial: la LFM Open License v1.0 permite uso comercial solo a empresas con ingresos anuales inferiores a 10 millones de dólares; por encima de ese umbral, el uso no está cubierto.
- Idiomas soportados no documentados: no se especifica qué lenguas maneja el modelo base, lo que impide garantizar calidad en castellano u otros idiomas.
- Sesgos y alucinaciones: no se documentan sesgos conocidos ni tasas de alucinación; al ser un modelo de 2 B, es esperable una fiabilidad limitada en tareas de razonamiento complejo, aunque no se aportan datos al respecto.
- Contexto no disponible: se desconoce la longitud máxima de contexto, lo que dificulta planificar casos de uso con documentos largos.
- Fechas de publicación: el repositorio figura creado el 28 de octubre de 2026 y actualizado el 20 de noviembre de 2026, con métricas de los ficheros de 8 y 4 bits aún provisionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/LFM3-VL-2B-ROCmFPX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Fork ROCmFPX de llama.cpp: https://github.com/HarshaVardhan3002/ROCmFPX
- Pull request de soporte LFM3 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31252
- Licencia LFM Open License v1.0: incluida en el repositorio como `LICENSE`
