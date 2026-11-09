# Atlas3D/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated-GGUF

## Resumen

Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated-GGUF es una cuantización Q4_K_M en formato GGUF de un modelo de lenguaje de 27.000 millones de parámetros derivado de la familia Qwen 3.5. El modelo base, publicado por huihui-ai, es una versión "abliterated" (con el comportamiento de rechazo eliminado) del checkpoint nerkyor/Qwen3.8-27B-Coder390-EfficientThink, orientado a generación de código y razonamiento eficiente. El repositorio que nos ocupa lo publica el usuario Atlas3D y su principal valor diferencial es que conserva las capas MTP (Multi-Token Prediction) del modelo original, lo que permite a llama.cpp emplearlas como borrador especulativo (self-speculative drafting) y acelerar la decodificación.

La relevancia de esta ficha es doble: por un lado, documenta un modelo sin guardarraíles integrados (abliterated), lo que lo hace inadecuado para aplicaciones de cara al público sin filtros externos; por otro, es uno de los pocos empaquetados GGUF que mantiene las capas MTP y publica mediciones reales de velocidad en una única RTX 3090 (24 GB), con tasas de aceptación de borradores entre el 40 % y el 100 % y velocidades de 42 a 63 tokens/s en uso diario.

El modelo declara licencia Apache-2.0, pipeline image-text-to-text (soporta visión con un proyector multimodal externo) y arquitectura `qwen35` según los metadatos del GGUF. No se han publicado métricas de calidad (KL divergence, top-1 agreement, tests de código) para esta cuantización concreta: el autor lo reconoce explícitamente en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `qwen35` (Qwen 3.5), con capas MTP (Multi-Token Prediction) |
| Parametros totales | 27B (según nombre del modelo; no se detalla desglose) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens en la configuración de ejemplo (`-c 65536`); máximo nativo no disponible |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (866 tensores, 16.810.715.136 bytes) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen 3.5 (`qwen35` en los metadatos del GGUF) con 27.000 millones de parámetros y capas MTP (Multi-Token Prediction) integradas. Las capas MTP son la innovación técnica clave: permiten que el propio modelo genere borradores de varios tokens que luego se verifican en paralelo, actuando como decodificación especulativa sin necesidad de un modelo draft separado. Esta cuantización conserva dichas capas, algo que el autor destaca porque otros empaquetados GGUF del mismo modelo no las mantienen.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. El sufijo "abliterated" indica que se ha aplicado una técnica de eliminación de la dirección de rechazo en el espacio de activaciones, de modo que el modelo no muestra el comportamiento de negativa a responder que tendría el checkpoint original. El sufijo "Coder390" y "EfficientThink" sugieren un ajuste orientado a código y a razonamiento con presupuesto controlado de tokens de pensamiento, pero no se detallan los datos de dicho ajuste. El modelo base a su vez deriva de nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2, un checkpoint con múltiples etapas de SFT y RLOO según su nombre.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento eficiente ("EfficientThink") orientado a controlar el coste de tokens de razonamiento.
- Generación y comprensión de código (sufijo "Coder390" en el nombre del modelo base).
- Capacidades multimodales de imagen a texto: el pipeline declarado es `image-text-to-text` y requiere un proyector de visión externo (`.mmproj-f16.gguf`) para funcionar.
- Decodificación especulativa nativa mediante capas MTP, con `--spec-type draft-mtp` en llama.cpp.
- No se documenta soporte explícito de tool calling, function calling ni uso como agente autónomo en la información disponible.
- Capacidades multilingües: no disponibles (no se listan idiomas).
- Comportamiento sin rechazo (abliterated): el modelo no incorpora guardarraíles de seguridad propios.

## Casos de uso

- Asistente de código en local sobre GPU de consumo: con 16,8 GB de pesos en Q4_K_M cabe en una RTX 3090 o 4090 (24 GB) y permite autocompletado y generación de funciones con 55-63 tokens/s en código, según las mediciones del autor.
- Razonamiento con presupuesto controlado: el modo EfficientThink resulta adecuado para pipelines donde el coste por consulta importa, ya que limita los tokens de pensamiento sin renunciar a la cadena de razonamiento.
- Análisis de imágenes en local: combinado con el proyector de visión de mradermacher, permite describir o interpretar imágenes simples en un servidor llama.cpp, útil para prototipos de OCR ligero o clasificación visual.
- Servidor de inferencia personal con contexto largo: la configuración de ejemplo usa 65.536 tokens de contexto con `-ngl 999` y `-np 1`, apropiada para procesar documentos extensos o repositorios de código completos en una sola máquina.
- Investigación sobre alineación y seguridad: al ser abliterated, sirve como caso de estudio para medir cómo la eliminación de la dirección de rechazo afecta a la utilidad y a la tasa de respuestas dañinas, siempre en entornos controlados.
- Evaluación de decodificación especulativa: las capas MTP conservadas permiten experimentar con `--spec-type draft-mtp` y `--spec-draft-n-max` para medir tasas de aceptación según el dominio (prosa ~50 %, código ~85 % según el autor).
- Despliegue en pipelines de CI/CD para revisión de código: la velocidad sostenida (74 tokens/s de mediana en peticiones de 2.000+ tokens) hace viable su uso como revisor automático de parches en pre-commit hooks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, KL divergence, top-1 agreement) en la información disponible. El autor indica explícitamente que la comparación contra los pesos BF16 no llegó a completarse.

Sí se publican mediciones de velocidad en una RTX 3090 (24 GB) con el proyector de visión en CPU, en llama.cpp master `f74e2fa`:

| Aceptación de borradores | Velocidad de generación | Peticiones medidas |
|---|---|---|
| 40-55 % | 42,5 tokens/s | 70 |
| 80-90 % | 56,6 tokens/s | 3.158 |
| 90-100 % | 62,9 tokens/s | 6.930 |

Datos adicionales: peticiones de 2.000+ tokens alcanzaron una mediana de 74 tokens/s con 86 % de aceptación (154 peticiones); la ejecución más rápida de 500+ tokens llegó a 89 tokens/s. En prueba corta, prosa aceptó ~50 % de borradores (42-44 tokens/s) y código ~85 % (55-56 tokens/s). El propio autor advierte que no son benchmarks controlados.

## Requisitos de hardware

- VRAM estimada: ~17 GB para los pesos Q4_K_M; con contexto de 65.536 tokens y caché KV para 27B se recomienda al menos 24 GB en total.
- GPU recomendadas: RTX 3090 (24 GB, configuración medida por el autor), RTX 4090 (24 GB), A100 40/80 GB, H100.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con cuantización Q4_K_M y contexto moderado; en GPUs de 16 GB requeriría cuantizaciones menores no publicadas en este repo.
- Opciones de despliegue: llama.cpp (`llama-server`), con flags `-ngl 999 -c 65536 -np 1 --spec-type draft-mtp --spec-draft-n-max 2`. Requiere llama.cpp master `f74e2fa` o posterior para soportar `--spec-type draft-mtp`. No se documenta compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: 42,5-62,9 tokens/s según tasa de aceptación de borradores en RTX 3090; hasta 89 tokens/s en ejecuciones cortas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Atlas3D Q4_K_M) | 27B | 65.536 en config. de ejemplo | Q4_K_M | Apache-2.0 | Conserva capas MTP; sin métricas de calidad publicadas |
| huihui-ai/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated (BF16) | 27B | no disponible | BF16 | Apache-2.0 | Modelo base sin cuantizar; referencia de calidad |
| mradermacher/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated-GGUF | 27B | no disponible | Q4_K_M y otras | Apache-2.0 | Builds alternativos; incluye proyector de visión `.mmproj-f16.gguf` |
| nerkyor/Qwen3.8-27B-Coder390-EfficientThink (upstream) | 27B | no disponible | BF16 | no disponible | Checkpoint original antes de abliteration |

## Limitaciones y advertencias

- Modelo abliterated: no incorpora guardarraíles ni comportamiento de rechazo; puede producir contenido dañino, ilegal o inseguro sin filtros externos. No apto para aplicaciones de cara al público sin moderación adicional.
- Sin métricas de calidad publicadas para esta cuantización: no hay KL divergence, top-1 agreement ni resultados de tests de código; la evidencia se limita a cuatro semanas de uso diario del autor, que no constituye un benchmark.
- Riesgo de alucinación: no cuantificado; como todo modelo de 27B sin evaluación publicada, debe validarse en el dominio de uso.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe equilibrado.
- Dependencia de un proyector de visión externo (de mradermacher) para las capacidades de imagen; el repo no lo incluye y el original se perdió según el autor.
- Requiere llama.cpp master reciente (`f74e2fa` o posterior) para `--spec-type draft-mtp`; versiones anteriores no soportan la decodificación especulativa con MTP.
- Licencia Apache-2.0 heredada del modelo base: permite uso comercial, pero la responsabilidad sobre el contenido generado sin guardarraíles recae en el desplegador.
- Sin descargas ni likes en el momento de la ficha (0/0), lo que indica ausencia de validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Atlas3D/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated-GGUF
- Modelo base (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated
- GGUF alternativo con proyector de visión (mradermacher): https://huggingface.co/mradermacher/Huihui-Qwen3.8-27B-Coder390-EfficientThink-abliterated-GGUF
- Checkpoint upstream (nerkyor): https://huggingface.co/nerkyor/Qwen3.8-27B-Coder390-EfficientThink-Opus5.5-GPT6Astra-Grok4.7-DSV4Pro-K3-SFT-RLOO-MTP-DFlash2
- llama.cpp: https://github.com/ggml-org/llama.cpp
