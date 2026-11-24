# dcharlot65-openie/SmolVLM-256M-Instruct-LittleBit

## Resumen

`SmolVLM-256M-Instruct-LittleBit` es un checkpoint de pesos "vivos" (living weights) derivado de `HuggingFaceTB/SmolVLM-256M-Instruct`, el modelo vision-language compacto de Hugging Face. Lo publica el usuario `dcharlot65-openie` y está empaquetado en el formato `.jsyn` propietario de JouleDB, una base de datos termodinámica con runtime de inferencia propio que prescinde de PyTorch. No se trata de un modelo nuevo entrenado desde cero, sino de una refactorización y cuantización extrema del modelo base de 256 millones de parámetros.

El interés técnico está en su perfil de compresión: 0,1340 bits por peso (BPW), lo que reduce el checkpoint a 7,50 MB frente a los 489,21 MB equivalentes en FP16, un factor de compresión de 65,20x. Esta agresividad es posible gracias a una combinación de pre-factorización `LittleBit-2` y `Sakana SVF` aplicada sobre tensores en formato de planos de bits 2D.

La relevancia es acotada pero específica: para quienes operan el stack JouleDB/JouleKube, ofrece un VLM de 256M en un artefacto de pocos megabytes, apto para despliegues en contenedores o nodos con restricciones severas de almacenamiento y memoria. Fuera de ese ecosistema, el modelo no es directamente utilizable con transformers, llama.cpp ni vLLM, ya que requiere el runtime `jouledb` (v0.2.4 o superior).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de SmolVLM-256M-Instruct; detalles en el modelo base) |
| Parámetros totales | 256.484.928 |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Sub-1-bit (0,1340 BPW), planos de bits 2D (`LittleBit-2 ⊕ Sakana SVF`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.jsyn` (JouleDB, zstd + CRC32); no safetensors ni GGUF |
| Tamaño del checkpoint | 7,50 MB comprimido; 489,21 MB equivalente en FP16 |
| Tensores 2D (planos de bits) | 287 |
| Vectores 1D (LayerNorm/bias/depthwise) | 184 |
| Librería | jouledb |
| Modelo base | HuggingFaceTB/SmolVLM-256M-Instruct |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del SmolVLM-256M-Instruct de Hugging Face (VLM compacto con encoder visual y decoder de lenguaje), pero la información proporcionada no detalla los componentes internos, la composición del dataset de entrenamiento ni las fases de alineación (RLHF/DPO) del modelo base. Tampoco se especifica si el proceso de adaptación incluyó reentrenamiento, destilación o únicamente transformación de pesos.

La innovación declarada es puramente de representación y compresión: los pesos se reestructuran en 287 tensores 2D en formato de planos de bits y 184 vectores 1D para LayerNorm, sesgos y convoluciones depthwise. Sobre esa base se aplica una pre-factorización que combina `LittleBit-2` con `Sakana SVF`, alcanzando 0,1340 BPW. El artefacto se serializa con compresión zstd y verificación CRC32 dentro del formato `.jsyn`. No se documentan técnicas de decodificación especulativa, atención lineal ni optimizaciones de inferencia más allá del propio runtime JouleDB.

## Capacidades

- Generación de texto y razonamiento conversacional heredados del modelo base SmolVLM-256M-Instruct.
- Procesamiento vision-language: al derivar de un VLM, se presupone capacidad de describir imágenes y responder preguntas sobre ellas, aunque la información proporcionada no detalla tareas concretas ni resolución de entrada.
- Instrucciones en formato chat (sufijo `-Instruct`), presumiblemente con plantilla de conversación del modelo base.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas está vacío en la ficha de Hugging Face).
- Capacidades especiales (thinking mode, audio, etc.): no disponibles.

## Casos de uso

- Despliegue en clústeres Kubernetes con restricciones de almacenamiento: el checkpoint de 7,50 MB puede incluirse en imágenes de contenedor o volúmenes persistentes sin impacto apreciable, integrándose en el sustrato JouleKube para tareas de inferencia ligera.
- Procesamiento de imágenes en el borde (edge): un VLM de 256M comprimido a pocos megabytes es viable en dispositivos con memoria y disco limitados, siempre que se ejecute mediante el runtime `jouledb`.
- Prototipado de pipelines vision-language dentro de JouleDB: útil para validar flujos de datos termodinámicos con un modelo real sin dependencia de PyTorch ni de stacks CUDA.
- Pruebas de integración y CI: el tamaño reducido permite descargar y arrancar el modelo en pipelines de integración continua para verificar el correcto funcionamiento de JouleDB v0.2.4+.
- Investigación sobre cuantización sub-1-bit: sirve como referencia práctica para estudiar el comportamiento de pesos a 0,1340 BPW sobre un VLM pequeño.
- Experimentación con formatos de pesos alternativos: caso de estudio para evaluar el formato `.jsyn` frente a safetensors/GGUF en términos de tamaño, integridad (CRC32) y velocidad de carga.
- Tareas de captioning o VQA de baja exigencia en entornos aislados (air-gapped), donde el modelo se sirve localmente desde JouleDB sin acceso a repositorios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de compresión y tamaño (0,1340 BPW, 7,50 MB, 65,20x de reducción), sin datos de precisión, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint ocupa 7,50 MB en disco, pero el runtime `jouledb` debe descomprimir y materializar los pesos; el consumo en memoria no se documenta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: exclusivamente `jouledb` (v0.2.4 o superior), instalable vía `cargo binstall jouledb` y servible con `jouledb serve --http-addr 127.0.0.1:8080`. No compatible con vLLM, llama.cpp, Ollama ni TGI según la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLM-256M-Instruct-LittleBit (este) | 256.484.928 | no disponible | `.jsyn` (JouleDB) | Apache 2.0 | Hugging Face, runtime jouledb |
| HuggingFaceTB/SmolVLM-256M-Instruct | 256M (aprox.) | no disponible | safetensors (transformers) | Apache 2.0 | Hugging Face |
| Otros VLM de ~256M | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría no está disponible en la información proporcionada. El único punto de referencia claro es el modelo base, del que este checkpoint es una transformación de pesos con compresión extrema y cambio de formato, sin datos públicos de degradación de calidad.

## Limitaciones y advertencias

- El modelo solo es utilizable con el runtime `jouledb`; no carga en transformers, llama.cpp, vLLM ni Ollama.
- No hay datos publicados sobre la pérdida de calidad derivada de la cuantización a 0,1340 BPW; es esperable una degradación respecto al modelo base, pero su magnitud no está cuantificada.
- El campo de idiomas está vacío en la ficha de Hugging Face; el soporte multilingüe no está verificado.
- No se documenta la longitud de contexto efectiva ni la resolución de imagen soportada.
- Riesgo de alucinación: no evaluado en la información disponible; en modelos de 256M el riesgo suele ser alto, pero no hay datos específicos.
- Sesgos conocidos: no documentados.
- Licencia Apache 2.0 permite uso comercial, pero el modelo deriva de SmolVLM-256M-Instruct y debe mantenerse la atribución al modelo base.
- El repositorio registra 0 descargas y 0 likes, y el tamaño reportado es 0.0 GB; la madurez y el mantenimiento del artefacto no están contrastados.
- La fecha de creación indicada (2026-11-23) resulta anómala y conviene verificarla antes de cualquier uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/dcharlot65-openie/SmolVLM-256M-Instruct-LittleBit
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM-256M-Instruct
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
