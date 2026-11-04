# mradermacher/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled-heretic-v2-GGUF

## Resumen

Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled-heretic-v2-GGUF es la versión cuantizada en formato GGUF del modelo llmfan46/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled-heretic-v2, un modelo denso de aproximadamente 26.900 millones de parámetros derivado de la familia Qwen3.5. El autor de la cuantización es mradermacher, que publica quants estáticos (Q2_K a Q8_0) y versiones con matriz de importancia (imatrix, sufijo i1) en un repositorio aparte. El modelo base combina un ajuste fino sobre Qwen3.5-27B con datos de razonamiento destilado de Claude 4.6 Opus y un proceso de "abliteración" (eliminación de direcciones de rechazo en el espacio de activaciones) que da lugar a la variante "heretic".

El modelo está pensado para generación de texto conversacional con cadena de pensamiento explícita (chain-of-thought), y su principal atractivo es ofrecer un razonamiento de estilo Opus en un tamaño que puede ejecutarse en hardware de consumo mediante cuantización de 4 bits. La licencia Apache 2.0 facilita su uso comercial, aunque el proceso de abliteración elimina las salvaguardas de contenido, lo que traslada al operador toda la responsabilidad sobre las salidas.

La relevancia actual radica en la combinación de tres factores: tamaño manejable (27B densos), destilación de razonamiento de un modelo frontera y disponibilidad en GGUF con múltiples niveles de cuantización, lo que permite desplegarlo desde una RTX 4090 hasta un servidor con A100. El repositorio acumula 630 descargas y 5 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (family Qwen3.5), con soporte multimodal vía mmproj |
| Parámetros totales | 26.895.998.464 (~26,9B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16; imatrix (i1) en repo separado |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un transformer denso de ~26,9B parámetros, presumiblemente con la arquitectura de la familia Qwen3.5 (no se detalla en la información disponible la configuración exacta de capas, cabezas de atención ni mecanismos de atención lineal o híbridos). El repositorio incluye archivos mmproj (Q8_0 y f16), lo que indica que el modelo base incorpora capacidad multimodal de entrada (visión), aunque la model card no documenta el detalle del proyector ni el encoder visual.

El entrenamiento parte del modelo base llmfan46/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled-heretic-v2, que a su vez se construye mediante ajuste fino sobre Qwen3.5-27B con dos datasets de razonamiento: nohurry/Opus-4.6-Reasoning-3000x-filtered (trazas de razonamiento filtradas atribuidas a Claude 4.6 Opus) y Jackrong/Qwen3.5-reasoning-700x. Sobre ese ajuste se aplica un proceso de abliteración ("heretic") que elimina direcciones de activación asociadas al rechazo, dando lugar a la variante "uncensored/decensored". No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO adicionales.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento con cadena de pensamiento explícita (chain-of-thought), heredado de la destilación de trazas de Claude 4.6 Opus.
- Razonamiento matemático y lógico de varios pasos (implícito en el ajuste de razonamiento; sin benchmarks publicados que lo cuantifiquen).
- Capacidad multimodal de entrada (visión) mediante los archivos mmproj incluidos en el repo.
- Comportamiento "uncensored": responde sin las restricciones de rechazo típicas del modelo original, incluyendo contenido sensible.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue en plataformas de inferencia gestionada.
- No se documenta soporte explícito de tool calling ni de function calling en la información disponible.

## Casos de uso

- Razonamiento asistido en local: desplegar el quant Q4_K_M (16,6 GB) en una RTX 4090 o 3090 para tareas de análisis y resolución de problemas con trazas de pensamiento visibles, aprovechando la destilación de razonamiento de Opus en un tamaño de 27B.
- Investigación sobre alineación y abliteración: comparar el comportamiento del modelo heretic frente al Qwen3.5-27B original para estudiar qué capacidades y sesgos se ven afectados por la eliminación de direcciones de rechazo, usando los distintos quants para evaluar sensibilidad a la cuantización.
- Generación de texto creativo sin filtros: el modelo es adecuado para ficción, guiones o contenido editorial que requiere respuestas sin rechazos, dado su carácter decensored; el operador debe aplicar su propia moderación si el producto lo exige.
- Procesamiento de documentos con imágenes: gracias a los archivos mmproj, puede usarse en pipelines de extracción de información de capturas, diagramas o documentos escaneados, combinando entrada visual con razonamiento textual.
- Evaluación de cuantizaciones: el repositorio ofrece 11 niveles de quant (de Q2_K a Q8_0) más versiones imatrix, lo que permite medir la degradación de calidad en tareas de razonamiento a medida que baja el bit-width, un caso de uso típico para investigadores que calibran pipelines de despliegue.
- Chat conversacional bilingüe inglés-chino: para productos dirigidos a esos mercados, el modelo cubre ambos idiomas de forma nativa; no está entrenado para castellano, por lo que su uso en español requeriría validación adicional.
- Prototipado rápido con llama.cpp u Ollama: el formato GGUF y los tamaños desde 10,8 GB (Q2_K) permiten iterar en portátiles con GPU de 12-16 GB antes de escalar a un servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K: ~11-12 GB
  - Q3_K_M: ~14-15 GB
  - IQ4_XS: ~16 GB
  - Q4_K_M: ~17-18 GB
  - Q5_K_M: ~20-21 GB
  - Q6_K: ~23-24 GB
  - Q8_0: ~29-30 GB
  - f16 (modelo base): ~54 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M a Q6_K; RTX 3090 (24 GB) para Q4_K_M; A100 40 GB o H100 para Q8_0 y f16; configuraciones multi-GPU para f16 con contexto largo.
- Cabe en GPU de consumo: sí, desde Q2_K en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) hasta Q6_K en 24 GB. Los quants de 4 bits son los recomendados por el autor ("fast, recommended").
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled-heretic-v2 (este, GGUF) | ~26,9B densos | no disponible | Apache 2.0 | GGUF | Destilado de razonamiento Opus + abliterado |
| Qwen3.5-27B (base) | ~27B densos | no disponible | no disponible en la información | safetensors | Modelo original sin ajuste de razonamiento ni abliteración |
| Modelos de razonamiento de ~30B (familia QwQ/Qwen reasoning) | ~30B | no disponible | variable | safetensors/GGUF | Alternativas de razonamiento de tamaño similar; sin datos de benchmark comparables en la información disponible |

No se dispone de datos de benchmark que permitan una comparación cuantitativa con alternativas; la comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- El proceso de abliteración elimina los mecanismos de rechazo: el modelo puede generar contenido dañino, ilegal o sexualmente explícito sin filtro. El operador asume toda la responsabilidad legal y ética sobre su uso.
- Riesgo de alucinación no cuantificado; al ser un modelo destilado de trazas de razonamiento de otro modelo, puede reproducir errores sistemáticos de esas trazas.
- Idiomas: solo inglés y chino documentados; el rendimiento en castellano no está garantizado ni evaluado.
- Longitud de contexto no documentada; no debe asumirse una ventana larga sin verificación empírica.
- Los quants de 2 y 3 bits degradan notablemente la calidad del razonamiento; el autor marca Q3_K_M como "lower quality" y recomienda Q4 o superior.
- No hay benchmarks publicados: cualquier afirmación sobre su rendimiento relativo carece de respaldo cuantitativo.
- La licencia Apache 2.0 cubre los pesos, pero el uso de salidas generadas puede estar sujeto a las políticas de la plataforma de despliegue y a la legislación aplicable.
- El modelo base tiene 630 descargas y 5 likes: comunidad pequeña, sin validación independiente extensa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled-heretic-v2-GGUF
- Modelo base: https://huggingface.co/llmfan46/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled-heretic-v2
- Quants imatrix: https://huggingface.co/mradermacher/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled-heretic-v2-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled-heretic-v2-GGUF
- Dataset de razonamiento: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset de razonamiento: https://huggingface.co/datasets/Jackrong/Qwen3.5-reasoning-700x
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de quant (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
