# mradermacher/nemo_sup-GGUF

## Resumen

`mradermacher/nemo_sup-GGUF` es una colección de cuantizaciones en formato GGUF del modelo base `Daemontatox/nemo_sup`, un fine-tune derivado de la familia Llama-3 de Meta con aproximadamente 49.867 millones de parámetros (cerca de 50B). El modelo original está etiquetado con la licencia NVIDIA Open Model License y con la etiqueta `nvidia`, lo que sugiere que el fine-tune se ha construido sobre pesos de la familia Nemotron de NVIDIA, aunque la model card no lo detalla explícitamente. El repositorio lo mantiene mradermacher, un conocido cuantizador de la comunidad que publica versiones GGUF estáticas de modelos populares para su uso con llama.cpp y herramientas compatibles.

La relevancia de este repositorio es fundamentalmente práctica: convierte un modelo de ~50B en artefactos ligeros y ejecutables en hardware de consumo mediante cuantización de 2 a 8 bits, con tamaños que van de 18,8 GB (Q2_K) a 53,1 GB (Q8_0). Esto permite a desarrolladores e investigadores probar un modelo conversacional de gran tamaño sin necesidad de infraestructura de centro de datos, aunque con las limitaciones de calidad inherentes a las cuantizaciones agresivas.

No se dispone de información publicada sobre arquitectura interna, datos de entrenamiento, benchmarks o contexto máximo del modelo base en la información proporcionada. La ficha se limita, por tanto, a los datos verificables del repositorio y a las características deducibles de la etiqueta `llama-3` y del tamaño de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama-3, segun etiqueta `llama-3`; detalles no disponibles) |
| Parametros totales | 49.867.145.280 (~49,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | nvidia-open-model-license |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `Daemontatox/nemo_sup`. Las etiquetas del repositorio (`llama-3`, `nvidia`, `pytorch`, `transformers`) indican que se trata de un transformer decoder-only de la familia Llama-3, probablemente con pesos derivados de la línea Nemotron de NVIDIA, y afinado posteriormente por el autor del modelo base. El recuento de parámetros en safetensors (49.867.145.280) confirma un tamaño cercano a 50B, coherente con variantes intermedias de Llama-3 (como la de 49B) o con modelos Nemotron de tamaño similar.

No se han publicado en la información disponible datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. El repositorio de mradermacher es exclusivamente de cuantización: aplica cuantización estática (según los metadatos `quantize_version: 2` y `output_tensor_quantised: 1`) sobre los pesos en formato Hugging Face convertidos a GGUF. El autor indica que las cuantizaciones ponderadas/imatrix no estaban disponibles en el momento de la publicación, por lo que solo se ofrecen cuantizaciones estáticas.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Razonamiento y generación de texto general, asumiendo las capacidades heredadas de la familia Llama-3 (no verificadas en la información disponible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- **Prototipado local de asistentes conversacionales**: con la cuantización Q4_K_M (30,3 GB) el modelo puede ejecutarse en una estación de trabajo con 32-48 GB de VRAM o en configuraciones con offloading a RAM, permitiendo iterar sobre prompts y flujos conversacionales sin depender de APIs externas.
- **Evaluación comparativa de cuantizaciones**: el repositorio ofrece 11 variantes desde Q2_K hasta Q8_0, lo que permite medir empíricamente la degradación de calidad (perplejidad, coherencia) frente al coste de memoria en un modelo de ~50B.
- **Investigación sobre fine-tunes de Llama-3**: al estar etiquetado como `llama-3`, sirve como punto de partida para estudiar cómo afecta el afinado a un modelo base grande en tareas conversacionales en inglés.
- **Despliegue en entornos con GPU de consumo**: las variantes Q2_K (18,8 GB) y Q3_K_S (22,1 GB) caben en GPUs de 24 GB como la RTX 4090, permitiendo ejecutar un modelo de ~50B en hardware de gama alta para consumo.
- **Generación de texto por lotes en inglés**: con llama.cpp o servidores compatibles con GGUF, el modelo puede procesar lotes de documentos en inglés para tareas de resumen o reescritura, siempre que la latencia no sea crítica.
- **Banco de pruebas para pipelines de inferencia**: útil para validar integraciones con llama.cpp, Ollama o servidores compatibles con la API de OpenAI antes de migrar a variantes de mayor calidad (Q6_K o Q8_0) o a los pesos originales en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (según tamaño de cuantización, sin contar overhead de contexto):
  - Q2_K: ~18,8 GB
  - Q3_K_S: ~22,1 GB
  - Q3_K_M: ~24,4 GB
  - Q3_K_L: ~26,4 GB
  - IQ4_XS: ~27,3 GB
  - Q4_K_S: ~28,7 GB
  - Q4_K_M: ~30,3 GB
  - Q5_K_S: ~34,5 GB
  - Q5_K_M: ~35,5 GB
  - Q6_K: ~41,0 GB
  - Q8_0: ~53,1 GB (dividido en dos partes)
- **GPU recomendadas**: para Q4_K_M o superiores se recomienda A100 40/80 GB, H100 o RTX 6000 Ada. Para Q2_K y Q3_K_S cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB), con margen limitado para el contexto.
- **¿Cabe en GPU de consumo?**: sí, las variantes Q2_K, Q3_K_S y, con ajustes, Q3_K_M caben en GPUs de 24 GB. Las variantes Q4 en adelante requieren 32 GB o más, o bien offloading parcial a RAM del sistema.
- **Opciones de despliegue**: llama.cpp, Ollama, servidores compatibles con GGUF (p. ej. llama-cpp-python, text-generation-webui). vLLM y TGI no son compatibles directamente con GGUF en este repositorio; para esos motores habría que usar el modelo base en safetensors.
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/nemo_sup-GGUF | ~49,9B | no disponible | nvidia-open-model-license | GGUF | Hugging Face (14 descargas) |
| Daemontatox/nemo_sup (base) | ~49,9B | no disponible | nvidia-open-model-license | safetensors | Hugging Face |
| Llama-3.1-70B (referencia de familia) | 70B | 128K (según Meta) | Llama 3.1 Community License | safetensors, GGUF | Amplia disponibilidad |
| Llama-3.1-8B (referencia de familia) | 8B | 128K (según Meta) | Llama 3.1 Community License | safetensors, GGUF | Amplia disponibilidad |

La comparativa con Llama-3.1 se incluye por la etiqueta `llama-3` del repositorio, pero no se dispone de datos de rendimiento que permitan una comparación cuantitativa. No se han identificado en la información disponible otros fine-tunes de ~50B con cuantizaciones GGUF equivalentes para una comparación directa.

## Limitaciones y advertencias

- **Idioma**: el modelo está etiquetado únicamente para inglés; su uso en castellano u otros idiomas no está respaldado por la información disponible y probablemente degrade la calidad.
- **Licencia**: la NVIDIA Open Model License impone condiciones específicas para uso comercial; es necesario revisar el texto completo antes de desplegar en producción.
- **Cuantizaciones agresivas**: Q2_K y Q3_K_S reducen notablemente la calidad; el autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como equilibrio "fast, recommended".
- **Sin cuantizaciones imatrix**: el autor indica que no hay cuantizaciones ponderadas/imatrix disponibles, lo que limita la calidad máxima alcanzable en tamaños pequeños frente a otras alternativas.
- **Riesgo de alucinación**: no hay datos publicados sobre tasas de alucinación; al ser un fine-tune comunitario de un modelo grande, se debe validar la salida en dominios sensibles.
- **Sesgos**: no disponible en la información proporcionada.
- **Contexto**: se desconoce la longitud de contexto soportada; en GGUF, además, el contexto efectivo depende de la configuración del runtime y de la VRAM disponible.
- **Madurez del repositorio**: 14 descargas y 0 likes en el momento de la consulta indican escasa validación por parte de la comunidad; conviene tratar el modelo como experimental.
- **Modelo base poco documentado**: `Daemontatox/nemo_sup` no incluye en la información disponible detalles sobre datos de entrenamiento ni evaluación, lo que dificulta estimar su fiabilidad en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/nemo_sup-GGUF
- Modelo base: https://huggingface.co/Daemontatox/nemo_sup
- Página de descargas del autor: https://hf.tst.eu/model#nemo_sup-GGUF
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
