# Harsha001/LFM3-VL-2B-ROCmFPX

## Resumen

LFM3-VL-2B-ROCmFPX es una cuantización comunitaria del modelo vision-language LiquidAI/LFM3-VL-2B de Liquid AI, un modelo de 2B parámetros (1.728.801.742 reales) diseñado para comprensión de imágenes, documentos, gráficos y pantallas en dispositivos locales. La cuantización la publica el usuario Harsha001 (repositorio GitHub HarshaVardhan3002/ROCmFPX) y emplea tipos de peso de bajo bit propios del fork ROCmFPX de llama.cpp, orientados a GPUs AMD, Vulkan y HIP/ROCm.

El modelo resuelve el problema de ejecutar un VLM multimodal en hardware de gama consumer y en plataformas AMD, donde el ecosistema de cuantización está menos desarrollado que en CUDA. Se distribuye en formato GGUF con tres variantes (8, 6 y 4 bits) más dos proyectores de visión separados, y el autor reporta que la variante de 6 bits supera en divergencia KL al Q6_K estándar de llama.cpp con el mismo tamaño de archivo.

Es relevante ahora porque el soporte de LFM3 en el fork proviene del pull request #31252 de llama.cpp, y porque los ficheros de 8 y 4 bits se añadieron en noviembre de 2026. Advertencia importante: los ficheros solo se han verificado en CPU y no se han probado en hardware AMD real, y requieren el fork ROCmFPX, no llama.cpp estándar, LM Studio ni Ollama.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-VL-2B; familia Liquid Foundation Models, tipo no detallado en la información) |
| Parámetros totales | 1.728.801.742 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | ROCmFPX 8-bit (Q8_0_ROCMFPX con escalas por tensor), ROCmFPX 6-bit (Q6_0_ROCMFPX con escalas por tensor), ROCmFP4-FAST 4-bit para Strix Halo (atención y capa de salida en 8-bit); proyectores de visión en F16 y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (modelo y proyectores multimodales separados) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada: no se detalla si es transformer denso, MoE o híbrido, ni el número de tokens de entrenamiento, la composición del dataset o si hubo RLHF/DPO. La model card del repositorio se centra exclusivamente en el proceso de cuantización, no en el entrenamiento del modelo original.

El proceso de cuantización sí está documentado con precisión: conversión a BF16 GGUF con el `convert_hf_to_gguf.py` del fork (más el proyector de visión en F16 y Q8_0), generación de una importance matrix desde el fichero BF16 sobre el texto de calibración `calibration_datav3` en fragmentos de 512 tokens, y cuantización con `llama-quantize --imatrix` para todos los ficheros. El fichero de 6 bits se generó con `LLAMA_ROCMFPX_TENSOR_SCALE=1`, que almacena una escala potencia de dos por tensor de pesos (el runtime la aplica sin configuración adicional), y con `--token-embedding-type q6_K`. La innovación técnica principal es el uso de tipos de peso de bajo bit con kernels FP4 rápidos del fork para AMD Strix Halo.

## Capacidades

- Comprensión de imágenes: el modelo base está descrito como VLM para entender imágenes, documentos, gráficos y pantallas en dispositivo.
- Descripción de documentos: el autor verificó ambos proyectores de visión con una foto de la portada de un periódico, con un build de 8 bits, y el modelo la describió correctamente.
- Generación de texto conversacional: la etiqueta del repositorio incluye `conversational`.
- Entrada imagen-texto a texto: pipeline `image-text-to-text`.
- Tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible en la información.
- Modo thinking, audio o vídeo: no disponible. La model card indica que LFM3-Omni y LFM3-Audio requieren trabajo adicional en llama.cpp upstream y llegarán más tarde.

## Casos de uso

- Procesamiento local de documentos escaneados: el modelo puede recibir la imagen de un documento y generar una descripción o extracción textual; el proyector Q8_0 de 0,20 GB mantiene el coste de VRAM bajo, adecuado para equipos con GPU integrada.
- Descripción de capturas de pantalla en herramientas de accesibilidad: al ser un VLM de 2B con cuantización de 1,06-1,80 GB, cabe en un portátil y puede generar descripciones de UI o de contenido visual para usuarios con discapacidad visual.
- Análisis de gráficos y tablas en informes: el modelo base está orientado explícitamente a comprensión de charts, por lo que puede integrarse en un pipeline que reciba imágenes de gráficos y devuelva resúmenes o valores.
- Despliegue en GPUs AMD con Vulkan o HIP/ROCm: el fork ROCmFPX permite ejecutar el modelo con `-DGGML_VULKAN=ON` o `-DGGML_HIP=ON -DAMDGPU_TARGETS=gfx1151` (gfx1100 para RX 7900), cubriendo un nicho de hardware poco atendido por las cuantizaciones estándar.
- Prototipado de asistentes multimodales en local: con `llama-server --jinja` se levanta una API compatible con endpoints, útil para validar flujos de imagen-texto sin depender de servicios en la nube.
- Inferencia en Strix Halo con la variante de 4 bits: el fichero ROCmFP4-FAST de 1,06 GB está construido específicamente para los kernels FP4 rápidos del fork en AMD Strix Halo, pensado para escenarios donde prima la velocidad y el tamaño sobre la fidelidad.
- Evaluación comparativa de cuantizaciones: los datos de divergencia KL y de coincidencia de top token frente a BF16 permiten usar el repositorio como referencia para estudiar el impacto de la cuantización en un VLM pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de cuantización medidas sobre 40 fragmentos de 512 tokens de WikiText-2 (split de test) contra el GGUF BF16, en CPU:

| Fichero | Tamaño | Pesos | Divergencia KL vs BF16 (menor es mejor) | Mismo top token que BF16 |
|---|---:|---|---:|---:|
| Q8_0_ROCMFPX | 1,80 GB | ROCmFPX 8-bit con escalas por tensor | 0,0032* | 96,4%* |
| Q6_K_ROCMFPX (recomendado) | 1,43 GB | ROCmFPX 6-bit con escalas por tensor | 0,0162 | 93,3% |
| Q4_0_ROCMFP4_STRIX_O8 | 1,06 GB | ROCmFP4-FAST 4-bit, atención y salida en 8-bit | 0,209* | 76,5%* |
| Q8_0 estándar (referencia) | 1,85 GB | llama.cpp Q8_0 | 0,0032 | 96,9% |
| Q4_K_M estándar (referencia) | 1,10 GB | llama.cpp Q4_K_M | 0,1248 | 80,7% |
| Q6_K estándar (referencia) | 1,43 GB | llama.cpp Q6_K | 0,0167 | 92,5% |

*Los datos del 8 y 4 bits provienen de una ejecución de octubre con recetas casi idénticas; los ficheros nuevos pasaron una prueba corta de respuesta y sus cifras propias los sustituirán. El fichero de 6 bits supera al Q6_K estándar en el mismo tamaño (0,0162 frente a 0,0167 de KL y 93,3% frente a 92,5% de coincidencia). El fichero de 4 bits se aleja más del BF16 que el Q4_K_M estándar (0,209 frente a 0,1248).

## Requisitos de hardware

- VRAM estimada: 1,06 GB para el fichero de 4 bits, 1,43 GB para el de 6 bits y 1,80 GB para el de 8 bits, más 0,20 GB (proyector Q8_0) o 0,38 GB (proyector F16). El total para la configuración recomendada (6 bits + proyector Q8_0) ronda los 1,63 GB.
- GPUs recomendadas: el fork soporta Vulkan y HIP/ROCm; el autor cita `gfx1151` (Strix Halo) y `gfx1100` (RX 7900) como objetivos de compilación. La variante de 4 bits está optimizada para AMD Strix Halo con kernels FP4.
- GPU consumer: por tamaño, cabe en cualquier GPU consumer con más de 2 GB de VRAM, pero la compatibilidad real está limitada al fork ROCmFPX; no se ha probado en hardware AMD según el autor.
- Opciones de despliegue: exclusivamente el fork HarshaVardhan3002/ROCmFPX de llama.cpp, compilado con `-DGGML_VULKAN=ON` o `-DGGML_HIP=ON`. llama.cpp estándar, LM Studio, Ollama y otros builds de ROCmFPX pueden no cargar los ficheros. Para una sola imagen desde línea de comandos se usa `llama-mtmd-cli` con `-m` y `--mmproj`.
- Parámetros de muestreo recomendados por Liquid AI: temperatura 0,1, top-k 50, repetition penalty 1,1.
- Latencia y throughput: no disponibles. Las pruebas de cuantización se hicieron en CPU y no se han publicado cifras de rendimiento en AMD.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-VL-2B-ROCmFPX (este) | 1,73B | no disponible | GGUF, 8/6/4 bits ROCmFPX | LFM Open License v1.0 | Requiere fork ROCmFPX; sin probar en AMD |
| LiquidAI/LFM3-VL-2B (base) | 1,73B | no disponible | safetensors (BF16) | LFM Open License v1.0 | Modelo original; sin cuantizar |
| Q6_K estándar de llama.cpp (mismo modelo) | 1,73B | no disponible | GGUF Q6_K, 1,43 GB | LFM Open License v1.0 | Compatible con llama.cpp estándar; KL 0,0167 |
| Q4_K_M estándar de llama.cpp (mismo modelo) | 1,73B | no disponible | GGUF Q4_K_M, 1,10 GB | LFM Open License v1.0 | Compatible con llama.cpp estándar; KL 0,1248 |

No se dispone de datos de otros modelos VLM de 2B comparables en la información proporcionada.

## Limitaciones y advertencias

- Los ficheros ROCmFPX (8, 6 y 4 bits) requieren el fork HarshaVardhan3002/ROCmFPX; llama.cpp estándar, LM Studio, Ollama y otros builds de ROCmFPX pueden no cargarlos.
- El autor indica explícitamente que los ficheros se comprobaron en CPU y no se han probado en hardware AMD.
- No es un lanzamiento oficial de Liquid AI; todo el crédito del modelo corresponde a sus autores.
- Las imágenes solo se probaron con el build de 8 bits y el proyector Q8_0/F16; no se probaron imágenes con los ficheros de 6 y 4 bits por separado.
- El fichero de 4 bits para Strix Halo se aleja más del BF16 que el Q4_K_M estándar (KL 0,209 frente a 0,1248), por lo que se recomienda 6 u 8 bits cuando prime la calidad.
- Los datos de KL y coincidencia de top token del 8 y 4 bits provienen de una ejecución de octubre con recetas casi idénticas y están pendientes de sustitución por mediciones propias.
- Licencia LFM Open License v1.0: el uso comercial está permitido solo a empresas con ingresos anuales inferiores a 10 millones de dólares; por encima de esa cifra no está cubierto.
- No se dispone de información sobre sesgos, riesgo de alucinación, longitud de contexto ni idiomas soportados del modelo base.
- LFM3-Omni y LFM3-Audio no están soportados por el fork; requieren trabajo adicional en llama.cpp upstream.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/LFM3-VL-2B-ROCmFPX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Fork ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- Pull request de soporte LFM3 en llama.cpp: #31252 (referenciado en la model card)
- Modelo destacado del mismo autor (DeepSeek-V4.1-Flash en Strix Halo): https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
- Licencia: fichero `LICENSE` del repositorio de Hugging Face
