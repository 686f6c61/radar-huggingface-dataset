# Harsha001/LFM3-VL-2B-ROCmFPX

## Resumen

LFM3-VL-2B-ROCmFPX es una cuantización del modelo vision-lenguaje LiquidAI/LFM3-VL-2B de Liquid AI, publicada por el usuario Harsha001 para el fork de llama.cpp denominado ROCmFPX, orientado a GPUs AMD (ROCm/HIP y Vulkan) y a plataformas de memoria unificada como Strix Halo. El modelo base es un sistema image-text-to-text de aproximadamente 1.730 millones de parámetros (1.728.801.600 reales en safetensors), pensado para comprensión de imágenes, documentos, gráficos y capturas de pantalla en dispositivo. Esta publicación no es una versión oficial de Liquid AI: es un trabajo de cuantización comunitaria que redistribuye los pesos bajo la misma licencia que el modelo original.

La relevancia de esta ficha está en el empaquetado: ofrece tres archivos GGUF (un 6 bits propietario de ROCmFPX, un Q8_0 y un Q4_K_M estándar) más dos proyectores de visión (F16 y Q8_0), con métricas de divergencia KL frente al BF16 medidas sobre WikiText-2. El archivo de 6 bits de ROCmFPX iguala o mejora ligeramente al Q6_K estándar de llama.cpp con el mismo tamaño de 1,43 GB, mientras que el Q4_K_M es el más pequeño (1,10 GB) y el más degradado.

El contexto, la composición del dataset de entrenamiento y los idiomas soportados no están documentados en la información disponible. El modelo se distribuye bajo LFM Open License v1.0, con uso comercial permitido solo a empresas por debajo de 10 millones de dólares de facturación anual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base vision-lenguaje de Liquid AI; la model card no detalla la arquitectura interna) |
| Parametros totales | 1.728.801.600 (aprox. 1,73 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ROCmFPX Q6_0_ROCMFPX (6 bits con escalas por tensor), Q8_0 estándar, Q4_K_M estándar; proyectores de visión en F16 y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0); uso comercial permitido por debajo de 10 M USD de facturación anual |
| Formato de pesos | GGUF (llama.cpp); repo de 5,0 GB |
| Tamano de archivos | 1,43 GB (Q6 ROCmFPX), 1,85 GB (Q8_0), 1,10 GB (Q4_K_M); proyectores 0,20 GB (Q8_0) y 0,38 GB (F16) |
| Pipeline | image-text-to-text |
| Libreria | gguf |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base LiquidAI/LFM3-VL-2B: no se detalla si emplea un transformer denso, un diseño híbrido con capas de estado o atención lineal, ni la composición del dataset de entrenamiento, el número de tokens vistos o si hubo fases de RLHF o DPO. Tampoco se documenta el codificador visual ni el proyector multimodal más allá de que existe un componente separado que debe cargarse con `--mmproj` para procesar imágenes.

Lo que sí está documentado es el proceso de cuantización. Se partió de una conversión BF16 a GGUF mediante el script `convert_hf_to_gguf.py` del fork ROCmFPX, generando también el proyector de visión en F16 y Q8_0. Se calculó una importance matrix sobre el corpus de calibración `calibration_datav3` en fragmentos de 512 tokens y se cuantizó con `llama-quantize --imatrix` para todos los archivos, incluidos los estándar. El archivo de 6 bits se generó con `LLAMA_ROCMFPX_TENSOR_SCALE=1`, que almacena una escala potencia de dos por tensor de pesos y se aplica en tiempo de ejecución sin configuración adicional, junto con `--token-embedding-type q6_K`. El soporte de LFM3 en el fork proviene del pull request #31252 de llama.cpp.

## Capacidades

- Generación de texto y razonamiento multimodal: el pipeline declarado es image-text-to-text, con entrada conjunta de imagen y texto.
- Comprensión de imágenes: la model card cita uso en dispositivo para imágenes, documentos, gráficos y capturas de pantalla. Los dos proyectores fueron validados sobre la fotografía de una portada de periódico, que el modelo describió correctamente con una build de 8 bits.
- Comprensión de documentos y gráficos: capacidad declarada por el autor del modelo base en la descripción del proyecto.
- Conversación multi-turno: la etiqueta `conversational` figura entre las tags del repositorio.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integración con servidores compatibles con la API de llama.cpp.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están documentados.
- Capacidades de audio o modo thinking: no disponibles; la model card indica que LFM3-Omni y LFM3-Audio requieren trabajo adicional en llama.cpp y llegarán más adelante.

## Casos de uso

- Descripción y análisis de imágenes en local: con el archivo Q6 ROCmFPX (1,43 GB) y el proyector Q8_0 (0,20 GB) se puede montar un servidor `llama-server` en una GPU AMD o en un equipo con Vulkan y enviar imágenes junto con prompts de texto para obtener descripciones o respuestas sobre el contenido visual.
- Procesamiento de documentos y capturas de pantalla: el modelo base está orientado a documentos, gráficos y pantallas, por lo que encaja en flujos de extracción de información de recibos, formularios o interfaces de usuario, siempre que se validen los resultados por el riesgo de alucinación inherente a modelos de 2 B.
- Asistencia en el borde (edge) con memoria limitada: el Q4_K_M de 1,10 GB y el proyector Q8_0 de 0,20 GB permiten desplegar el sistema completo en torno a 1,3 GB de pesos, adecuado para dispositivos con poca VRAM o memoria unificada, aceptando la pérdida de calidad medida (divergencia KL de 0,1248 y 80,7 % de coincidencia en el token superior frente a BF16).
- Despliegue en GPUs AMD con ROCm o Vulkan: el fork ROCmFPX permite compilar con `-DGGML_VULKAN=ON` o `-DGGML_HIP=ON -DAMDGPU_TARGETS=gfx1151` (Strix Halo) o `gfx1100` (RX 7900), lo que habilita inferencia acelerada en hardware AMD donde otras builds tienen menos soporte.
- Servidor compatible con API para prototipos: `llama-server` con `--jinja` expone el modelo mediante una API HTTP, útil para integrarlo en prototipos de aplicaciones que necesiten entrada de imagen y texto sin depender de servicios en la nube.
- Evaluación de cuantizaciones de bajo bit: los archivos publicados incluyen métricas reproducibles de divergencia KL y coincidencia de token superior, lo que permite comparar el impacto de Q6 ROCmFPX, Q8_0 y Q4_K_M sobre el mismo modelo antes de elegir uno para producción.
- Experimentación con cuantización en memoria unificada: el tag `strix-halo` y la compilación para `gfx1151` apuntan a equipos AMD con memoria compartida entre CPU y GPU, donde el tamaño reducido del modelo permite mantener pesos y proyector residentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí incluye métricas de fidelidad de cuantización frente al BF16, medidas sobre 40 fragmentos de 512 tokens del split de test de WikiText-2 en CPU:

| Archivo | Tamano | Pesos | Divergencia KL vs BF16 (menor es mejor) | Mismo token superior que BF16 |
|---|---:|---|---:|---:|
| `LFM3-VL-2B-Q6_K_ROCMFPX.gguf` (recomendado) | 1,43 GB | ROCmFPX 6 bits (`Q6_0_ROCMFPX` con escalas por tensor) | 0,0162 | 93,3 % |
| `LFM3-VL-2B-Q8_0.gguf` | 1,85 GB | Q8_0 estándar de llama.cpp | 0,0032 | 96,9 % |
| `LFM3-VL-2B-Q4_K_M.gguf` | 1,10 GB | Q4_K_M estándar de llama.cpp | 0,1248 | 80,7 % |
| Q6_K estándar (referencia, no subido) | 1,43 GB | Q6_K estándar de llama.cpp | 0,0167 | 92,5 % |

El archivo de 6 bits de ROCmFPX supera ligeramente al Q6_K estándar con el mismo tamaño. No se publicó ningún archivo de 4 bits de ROCmFPX porque sus tipos de 4 bits resultaron claramente peores que el Q4_K_M estándar en este modelo (divergencia KL entre 1,5 y 1,7 veces mayor). Todos los archivos superaron una prueba corta de respuesta greedy antes de la subida.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,10 GB (Q4_K_M), 1,43 GB (Q6 ROCmFPX) o 1,85 GB (Q8_0) para los pesos, más 0,20 GB (proyector Q8_0) o 0,38 GB (proyector F16), más la caché KV, cuyo tamaño no se documenta por falta de datos de contexto.
- GPU recomendadas: no hay una lista oficial en la información disponible. La compilación documentada apunta a `gfx1151` (Strix Halo) y `gfx1100` (Radeon RX 7900) mediante HIP/ROCm, y a Vulkan como alternativa genérica.
- GPU de consumo: por tamaño de pesos, el modelo cabe en cualquier GPU consumer con 4 GB o más de VRAM, incluidas soluciones integradas con memoria unificada; el autor no confirma pruebas en hardware AMD real.
- Estado de validación: la model card advierte explícitamente que los archivos se comprobaron en CPU y no se han probado todavía en hardware AMD.
- Opciones de despliegue: `llama-server` y `llama-mtmd-cli` del fork ROCmFPX. El archivo de 6 bits requiere esta build concreta; las builds estándar de llama.cpp, LM Studio, Ollama y otras builds de ROCmFPX pueden no cargarlo. Los archivos Q8_0 y Q4_K_M usan tipos estándar y cargan en cualquier build de llama.cpp con soporte de LFM3.
- Parámetros de muestreo recomendados por Liquid AI: temperatura 0,1, top-k 50 y repetition penalty 1,1.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la información proporcionada, por lo que la comparación se limita a las variantes de cuantización del propio repositorio y a la referencia del Q6_K estándar.

| Modelo / variante | Parametros | Contexto | Divergencia KL vs BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B Q6 ROCmFPX | 1,73 B | no disponible | 0,0162 | LFM Open License v1.0 | GGUF en este repo |
| LFM3-VL-2B Q8_0 | 1,73 B | no disponible | 0,0032 | LFM Open License v1.0 | GGUF en este repo |
| LFM3-VL-2B Q4_K_M | 1,73 B | no disponible | 0,1248 | LFM Open License v1.0 | GGUF en este repo |
| LFM3-VL-2B Q6_K estándar | 1,73 B | no disponible | 0,0167 | LFM Open License v1.0 | No subido; generado con llama.cpp |
| Modelos de visión de tamano similar (p. ej. familias de 2 B de otros autores) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es una release oficial de Liquid AI; todo el crédito del modelo corresponde a sus autores y el trabajo de este repositorio es únicamente la cuantización.
- Los archivos se validaron en CPU y no se han probado en hardware AMD; el rendimiento real en ROCm o Vulkan no está verificado.
- El archivo recomendado de 6 bits solo carga con el fork HarshaVardhan3002/ROCmFPX; llama.cpp estándar, LM Studio, Ollama y otras builds de ROCmFPX pueden fallar al cargarlo.
- El Q4_K_M presenta una degradación notable frente a BF16 (divergencia KL de 0,1248 y solo 80,7 % de coincidencia en el token superior), por lo que no es adecuado cuando la fidelidad es crítica.
- Las pruebas con imágenes se hicieron con una build de 8 bits; no se probaron por separado las entradas de imagen con los archivos de 6 y 4 bits.
- Riesgo de alucinación: no cuantificado en la información disponible, pero relevante en un modelo de 2 B orientado a descripción de imágenes y documentos.
- Sesgos conocidos: no documentados.
- Idiomas soportados y longitud de contexto: no disponibles, lo que impide garantizar un comportamiento correcto en castellano o en conversaciones largas.
- Licencia: LFM Open License v1.0 permite uso comercial solo a empresas con facturación anual inferior a 10 millones de dólares; por encima de ese umbral el uso no está cubierto. Es necesario leer el archivo `LICENSE` antes de desplegar.
- LFM3-Omni y LFM3-Audio no están soportados por este fork todavía; requieren trabajo adicional en llama.cpp upstream.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/LFM3-VL-2B-ROCmFPX
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Fork ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
- Pull request de soporte LFM3 en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31252
- Licencia LFM Open License v1.0: incluida como `LICENSE` en el repositorio de Hugging Face
