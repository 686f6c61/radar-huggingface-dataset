# Harsha001/DaisyRose-27B-ROCmFPX

## Resumen

DaisyRose-27B-ROCmFPX es una colección de cuantizaciones GGUF con formatos de peso específicos para GPU AMD (Vulkan y ROCm), publicada por el usuario Harsha001 a partir del modelo RadixArk/DaisyRose-27B. No se trata de un modelo nuevo, sino de una distribución de pesos optimizada para hardware AMD, incluyendo equipos con memoria unificada como Strix Halo. El modelo base es un ajuste fino por refuerzo (RL) de Qwen3.8-27B, un transformer denso de 27.320.697.863 parámetros con capacidad de entrada de imagen.

La relevancia de esta ficha reside en el empaquetado: ofrece cuatro niveles de cuantización (Q8_0, Q6_K, Q4_0 con ROCmFP4 y IQ2_XXS) más un codificador visual F16 separado, con métricas de divergencia KL frente a BF16 publicadas por el autor. Esto permite a desarrolladores con GPU AMD evaluar el compromiso entre tamaño, calidad y encaje en memoria antes de descargar 78,7 GB de repositorio.

El modelo conserva la capa de predicción multi-token del original y emplea la plantilla de chat de Qwen3.8 con modo *thinking* activado por defecto. La licencia es Apache-2.0, lo que facilita su uso comercial, aunque las cuantizaciones ROCmFPX requieren un fork específico de llama.cpp y no cargan en la versión estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 64 capas, gated delta net con atención completa cada cuarta capa; capa de predicción multi-token |
| Parametros totales | 27.320.697.863 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (los ejemplos de ejecución usan 32768 y 8192 tokens) |
| Tipos de cuantizacion | Q8_0 ROCmFPX, Q6_K ROCmFPX, Q4_0 ROCmFP4 (STRIX_O8), IQ2_XXS; codificador visual F16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con escalas de tensor ROCmFPX; requiere fork de llama.cpp) |

## Arquitectura y entrenamiento

El modelo base DaisyRose-27B es un ajuste fino mediante aprendizaje por refuerzo de Qwen3.8-27B, según indica el autor de la cuantización. La arquitectura es un transformer denso de 64 capas que combina gated delta net con atención completa cada cuarta capa, e incorpora entrada de imagen a través de un codificador visual. Se mantiene la capa de predicción multi-token del modelo original en todos los ficheros publicados.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de RL (por ejemplo, si se empleó RLHF, DPO u otra variante). La model card de esta distribución se centra en el proceso de cuantización: conversión a BF16 con `convert_hf_to_gguf.py`, cuantización con `llama-quantize` aplicando escalas de tensor ROCmFPX (una escala potencia de dos por tensor, almacenada como `.scale`) y uso de una importance matrix generada con `calibration_datav3` sobre los pesos BF16.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat de Qwen3.8 y modo *thinking* activado por defecto.
- Entrada de imagen (pipeline image-text-to-text) mediante el fichero `mmproj-DaisyRose-27B-F16.gguf`.
- Razonamiento y respuesta a preguntas generales; el autor verificó con una comprobación greedy que el modelo responde "Paris" a la pregunta por la capital de Francia.
- Predicción multi-token conservada del modelo original, orientada a decodificación especulativa interna.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible` en Hugging Face).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte explícito de tool calling o function calling: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en estaciones de trabajo con GPU AMD de 24-32 GB: el fichero Q4_0 ROCmFP4 (19,2 GB) o el Q6_K (22,5 GB) permiten ejecutar un modelo de 27B con contexto moderado en tarjetas como RX 7900 XTX, usando el fork ROCmFPX de llama.cpp con backend Vulkan o ROCm.
- Equipos con memoria unificada tipo Strix Halo (128 GB): el Q8_0 ROCmFPX (28,3 GB) ofrece la mayor fidelidad respecto a BF16 (KL 0,00025) y deja espacio para contexto largo y el codificador visual.
- Asistentes conversacionales con entrada de imagen: combinando cualquier cuantización con `mmproj-DaisyRose-27B-F16.gguf` se habilita el análisis de imágenes junto con el diálogo de texto, útil para soporte técnico o accesibilidad.
- Prototipado en GPU de 8 GB: el fichero IQ2_XXS (7,7 GB, con unos 7,0 GB en GPU) permite probar el modelo con contexto corto (unos 8K tokens) en tarjetas de gama baja, asumiendo la pérdida de calidad documentada (perplejidad 8,409 frente a 5,941 de BF16).
- Evaluación comparativa de formatos de cuantización en hardware AMD: los datos de KL y coincidencia de token superior publicados permiten medir el impacto de cada formato antes de integrarlo en un pipeline.
- Servicio local con `llama-server`: el ejemplo de la model card (`-ngl 99 -c 32768 --jinja`) sirve como base para exponer una API compatible con clientes OpenAI en infraestructura AMD propia.
- Investigación sobre decodificación multi-token: al conservarse la capa de predicción multi-token, el modelo es adecuado para experimentos de decodificación especulativa en el ecosistema llama.cpp.

## Benchmarks y rendimiento

El autor publica métricas de calidad de cuantización (divergencia KL frente a BF16 sobre 40 fragmentos de 512 tokens de wikitext-2, perplejidad y coincidencia del token más probable). No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

| Build | Tamano | Perplejidad | KL a BF16 | Mismo token superior |
|---|---:|---:|---:|---:|
| BF16 (referencia, no publicado) | 54,6 GB | 5,941 | — | — |
| Q8_0 ROCmFPX | 28,3 GB | 5,946 | 0,00025 | 99,3% |
| Q6_K ROCmFPX | 22,5 GB | 5,947 | 0,0020 | 98,0% |
| Q4_0 ROCmFP4 STRIX_O8 | 19,2 GB | 5,998 | 0,019 | 94,0% |
| IQ2_XXS-8GB | 7,7 GB | 8,409 | 0,42 | 72,6% |
| Q8_0 estándar (comparación, no subido) | 29,0 GB | 5,946 | 0,00037 | 99,2% |
| Q6_K estándar (comparación, no subido) | 22,4 GB | 5,940 | 0,0018 | 97,9% |
| Q4_K_M estándar (comparación, no subido) | 16,8 GB | 5,942 | 0,014 | 94,6% |

## Requisitos de hardware

- VRAM estimada para inferencia: 28,3 GB (Q8_0), 22,5 GB (Q6_K), 19,2 GB (Q4_0 ROCmFP4), 7,7 GB (IQ2_XXS, de los cuales unos 7,0 GB van a GPU). El codificador visual F16 añade 0,9 GB.
- GPU recomendadas: Strix Halo (memoria unificada de 128 GB) para todos los ficheros; GPU AMD de 32 GB para Q8_0 y Q6_K; GPU AMD de 24 GB para Q4_0 y Q6_K con contexto corto; GPU de 8 GB para IQ2_XXS.
- Cabe en GPU de consumo: sí, en tarjetas AMD de 24 GB o más con los formatos ROCmFP4/ROCmFPX, y en GPU de 8 GB con IQ2_XXS. No se documenta compatibilidad con GPU NVIDIA para estos ficheros.
- Opciones de despliegue: fork ROCmFPX de llama.cpp (rama `main`), compilado con backend Vulkan o ROCm/HIP; `llama-server` con `--jinja` y `--mmproj` para imagen. La versión estándar de llama.cpp no puede cargar los formatos ROCmFPX.
- Latencia y throughput: no disponibles. El autor indica que las pruebas se hicieron solo en CPU y que Vulkan y ROCm aún no se han probado con este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad de cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DaisyRose-27B-ROCmFPX (Q6_K) | 27,3B | No disponible | KL 0,0020; 98,0% mismo token | Apache-2.0 | GGUF con fork ROCmFPX |
| DaisyRose-27B estándar (Q6_K) | 27,3B | No disponible | KL 0,0018; 97,9% mismo token | Apache-2.0 | GGUF estándar |
| DaisyRose-27B estándar (Q4_K_M) | 27,3B | No disponible | KL 0,014; 94,6% mismo token; 16,8 GB | Apache-2.0 | GGUF estándar |
| DaisyRose-27B-ROCmFPX (Q4_0) | 27,3B | No disponible | KL 0,019; 94,0% mismo token; 19,2 GB | Apache-2.0 | GGUF con fork ROCmFPX |

La comparación se limita a variantes de cuantización del mismo modelo base, ya que la información proporcionada no incluye datos de rendimiento en tareas que permitan contrastar con otros modelos de tamaño similar.

## Limitaciones y advertencias

- El fichero IQ2_XXS pierde calidad de forma notable: perplejidad 8,409 frente a 5,941 de BF16 y solo 72,6% de coincidencia del token superior. El propio autor lo desaconseja salvo para GPU de 8 GB.
- A 4 bits, el Q4_K_M estándar es más pequeño (16,8 GB) y más fiel a BF16 (KL 0,014) que el Q4_0 ROCmFP4 de esta distribución (19,2 GB, KL 0,019); la ventaja del formato ROCmFP4 es el uso de kernels específicos, cuyo rendimiento debe medirse en cada tarjeta.
- Los pesos ROCmFPX no cargan en llama.cpp estándar: requieren el fork ROCmFPX, lo que limita la portabilidad y el soporte de herramientas del ecosistema.
- Solo se han verificado en CPU; los backends Vulkan y ROCm no se han probado con este modelo, por lo que pueden aparecer fallos o comportamientos inesperados.
- No hay información sobre sesgos, idiomas soportados ni tasas de alucinación del modelo base en la documentación proporcionada.
- El modo *thinking* está activado por defecto en la plantilla de chat, lo que incrementa el consumo de tokens en producción si no se desactiva.
- La licencia Apache-2.0 permite uso comercial, pero debe conservarse el aviso de licencia y la atribución a RadixArk y al equipo de Qwen; esta distribución no es un lanzamiento oficial.
- El repositorio ocupa 78,7 GB, por lo que la descarga completa requiere planificación de almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harsha001/DaisyRose-27B-ROCmFPX
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork ROCmFPX de llama.cpp: https://github.com/HarshaVardhan3002/ROCmFPX
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Modelo destacado del autor (DeepSeek-V4.1-Flash en Strix Halo): https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
