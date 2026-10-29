# axteam/GLM-OCR-GGUF

## Resumen

`axteam/GLM-OCR-GGUF` es una conversión a formato GGUF del backbone de texto del modelo `zai-org/GLM-OCR`, publicada por el usuario axteam bajo licencia MIT. No se trata de una cuantización completa del modelo OCR original: el encoder de visión ha sido excluido deliberadamente, de modo que el repositorio contiene únicamente el modelo de lenguaje de ~0,89 mil millones de parámetros que actúa como decodificador en la arquitectura GLM-V del modelo base. El resultado es un LLM de texto conversacional que conserva la `chat_template` original, pero que no puede procesar imágenes por sí solo.

La relevancia de esta ficha es doble. Por un lado, documenta un artefacto de 1,5 GB con dos cuantizaciones (Q4_K_M de 0,5 GB y Q8_0 de 1,0 GB) que cabe en cualquier GPU de consumo e incluso en CPU, y que sirve para inspeccionar o prototipar sobre el decodificador de GLM-OCR sin descargar el modelo multimodal completo. Por otro, advierte de un error de expectativa habitual: quien busque OCR end-to-end en llama.cpp debe acudir a la conversión de `ggml-org` o al modelo original con vLLM, no a este repositorio.

El modelo base, desarrollado por zai-org (Zhipu AI), es un OCR multimodal para comprensión de documentos complejos que introduce *Multi-Token Prediction* (MTP) loss y aprendizaje por refuerzo estable sobre tareas completas. Esta conversión, reconocida por `convert_hf_to_gguf.py` como `glm4 (text backbone)`, se publicó el 29 de octubre de 2026 y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GLM-4, identificado como `glm4 (text backbone)` en llama.cpp); el modelo base GLM-OCR es un encoder-decoder GLM-V multimodal |
| Parametros totales | 891.138.048 (~0,89B), correspondientes solo al backbone de texto |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (4 bits, k-quant medium) y Q8_0 (8 bits) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); repositorio de 1,5 GB con `GLM-OCR-Q4_K_M.gguf` (0,5 GB) y `GLM-OCR-Q8_0.gguf` (1,0 GB) |

## Arquitectura y entrenamiento

El artefacto es una cuantización, no un modelo entrenado desde cero. El backbone de texto procede de `zai-org/GLM-OCR`, un sistema OCR multimodal construido sobre la arquitectura encoder-decoder GLM-V, en la que un encoder de visión codifica la imagen del documento y un decodificador de lenguaje genera la transcripción o la estructura solicitada. La model card del modelo base cita dos innovaciones de entrenamiento: una pérdida de *Multi-Token Prediction* (MTP), que entrena al modelo para predecir varios tokens por paso y acelera la generación, y un esquema de aprendizaje por refuerzo estable sobre el conjunto completo de tareas, orientado a mejorar la precisión de reconocimiento y la generalización a documentos no vistos.

La conversión se realizó con `convert_hf_to_gguf.py` de llama.cpp y preserva la `chat_template` original, por lo que el GGUF se comporta como un modelo conversacional de texto. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO específicas para el decodificador. Tampoco se especifican detalles de la atención (si emplea atención lineal, RoPE parcial u otras variantes de la familia GLM-4) ni la longitud de contexto nativa.

Conviene subir la advertencia estructural a este apartado: al haberse descartado el encoder de visión, la arquitectura efectiva del archivo GGUF es la de un LLM de texto de ~0,89B parámetros, y toda la capacidad OCR del sistema original queda fuera del artefacto.

## Capacidades

- Generación de texto conversacional en local, con la plantilla de chat del modelo original embebida en el GGUF.
- Razonamiento y generación de texto de dominio general, limitados por el tamaño del modelo (~0,89B parámetros).
- Inferencia en llama.cpp, Ollama y LM Studio sin dependencias de Python ni de CUDA obligatoria.
- Ejecución en CPU, con soporte de aceleración GPU opcional según el backend de llama.cpp.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que facilita exponerlo mediante `llama-server` con una API HTTP.
- No incluye capacidad de visión: no procesa imágenes, no extrae texto de documentos y no ejecuta el pipeline OCR del modelo base.
- No se documentan soporte de *tool calling*, capacidades de agente, modo *thinking* ni cobertura multilingüe verificada.

## Casos de uso

- **Inspección del decodificador de GLM-OCR sin descargar el modelo completo**: permite cargar en minutos el backbone de texto en llama.cpp para estudiar su comportamiento, su plantilla de chat y su estilo de salida antes de abordar el despliegue multimodal completo.
- **Prototipado en hardware modesto**: con 0,5 GB en Q4_K_M, se puede validar una integración con `llama-server` en un portátil sin GPU dedicada y decidir después si merece la pena invertir en el pipeline OCR real.
- **Post-proceso de texto ya extraído**: en una arquitectura donde Tesseract, PaddleOCR u otro motor realice la transcripción, este modelo puede encargarse de tareas de normalización, formateo o reescritura de texto plano, aunque su tamaño limita la calidad frente a LLM mayores.
- **Pruebas de compatibilidad de herramientas GGUF**: útil como caso de test pequeño para verificar que un *runtime* propio, un wrapper de Ollama o una capa de *serving* gestiona correctamente modelos de la familia GLM-4 convertidos con `convert_hf_to_gguf.py`.
- **Docencia y demostración de cuantización**: las dos variantes publicadas (Q4_K_M y Q8_0) permiten ilustrar el compromiso entre tamaño y fidelidad de una cuantización k-quant sobre un modelo real y de pequeño tamaño.
- **Generación de texto auxiliar en entornos sin conectividad**: al ser MIT y ejecutable en CPU, encaja en despliegues *on-premise* o *edge* donde no se permite enviar datos a la nube y la carga computacional debe ser mínima.
- **Evaluación comparativa de cuantizaciones**: medir la degradación de Q4_K_M frente a Q8_0 en tareas de texto controladas, como paso previo a decidir el nivel de cuantización de modelos mayores de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de exactitud OCR, y la información de contexto disponible sobre el modelo base tampoco aporta cifras numéricas comparables. Cualquier valor que se cite para este artefacto concreto debería obtenerse midiendo directamente sobre los archivos publicados.

## Requisitos de hardware

- **VRAM estimada**: Q4_K_M ocupa 0,5 GB en disco y requiere del orden de 0,8-1,2 GB de VRAM con contexto moderado; Q8_0 ocupa 1,0 GB y requiere aproximadamente 1,5-2 GB. Son estimaciones por tamaño de pesos y caché KV, no mediciones publicadas.
- **GPU recomendadas**: cualquier GPU con 2 GB o más de memoria es suficiente (GTX 1650, RTX 3060, RTX 4090, A100, H100); el modelo está muy por debajo del umbral de estas tarjetas y no las aprovecha.
- **GPU de consumo**: sí, cabe holgadamente en todas las GPU de consumo actuales, e incluso en iGPU con memoria unificada.
- **CPU**: es el escenario más realista; con ~0,89B parámetros y cuantización de 4 bits, la inferencia en CPU es viable para uso interactivo.
- **Opciones de despliegue**: `llama-cli -hf axteam/GLM-OCR-GGUF`, `llama-server` para exponer una API compatible con OpenAI, Ollama y LM Studio. vLLM no es la vía adecuada para este GGUF; la model card remite a las builds con *compressed-tensors* y vLLM para el OCR end-to-end.
- **Latencia y throughput**: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision / OCR | Licencia | Formato |
|---|---|---|---|---|---|
| `axteam/GLM-OCR-GGUF` | ~0,89B (solo backbone de texto) | no disponible | No | MIT | GGUF Q4_K_M y Q8_0 |
| `ggml-org/GLM-OCR-GGUF` | no disponible | no disponible | Sí, ejecutable vía `llama-server` | no disponible | GGUF |
| `zai-org/GLM-OCR` (original) | no disponible | no disponible | Sí, encoder-decoder GLM-V completo | MIT (según la información disponible) | safetensors y builds compressed-tensors |

La diferencia funcional clave frente a las otras dos opciones es la ausencia del encoder de visión. El repositorio de `ggml-org` se distribuye dentro de la colección de modelos OCR de ggml-org y está pensado para ejecutarse con `llama-server`; un directorio de terceros (local-ai-zone) le atribuye un tamaño de 7,81 GB, unas 40.848 descargas y 116 valoraciones, cifras que no se han podido verificar de forma independiente y que probablemente correspondan a la conversión completa con visión, no a este artefacto. Para cualquier tarea de OCR real, el modelo original o la build de ggml-org son las alternativas correctas.

## Limitaciones y advertencias

- **No hace OCR**: la limitación principal y más importante. El encoder de visión no está incluido, por lo que el modelo no puede procesar imágenes, PDF escaneados ni capturas. La propia model card lo indica de forma explícita.
- **Riesgo de confusión en el nombre**: el repositorio se llama `GLM-OCR-GGUF` pero no ejecuta OCR; integrarlo esperando funcionalidad de imagen producirá fallos silenciosos en producción.
- **Sin validación comunitaria**: 0 descargas y 0 valoraciones en el momento de la ficha. No hay evidencia de terceros sobre la calidad de la conversión.
- **Sin datos de contexto ni de idiomas**: se desconoce la ventana de contexto efectiva del backbone y la cobertura lingüística real; no se debe asumir multilingüismo por la naturaleza del modelo base.
- **Alucinación**: un modelo de ~0,89B parámetros tiene una propensión alta a inventar contenido y a perder coherencia en generaciones largas o en tareas de razonamiento complejo.
- **Degradación por cuantización**: Q4_K_M introduce pérdida adicional de calidad frente a Q8_0, y ambas frente a los pesos originales. Para tareas sensibles a la fidelidad, usar Q8_0 o el modelo sin cuantizar.
- **Plantilla de chat heredada**: la `chat_template` embebida está diseñada para el flujo multimodal original; su comportamiento en un decodificador aislado no está verificado.
- **Licencia**: MIT permite uso comercial y modificación, pero conviene verificar la licencia del modelo base de forma independiente antes de un despliegue en producción, así como los términos de los datos de entrenamiento originales, no documentados aquí.
- **Mantenimiento incierto**: el repositorio no muestra actividad ni soporte; es un artefacto aislado de un autor individual.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/axteam/GLM-OCR-GGUF
- Modelo base en HuggingFace: https://huggingface.co/zai-org/GLM-OCR
- Repositorio GitHub del modelo base: https://github.com/zai-org/GLM-OCR
- Ficha de la conversión de ggml-org en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/glm-ocr-gguf-ggml-org
- Ficha de GLM-OCR GGUF en local-ai-zone: https://local-ai-zone.github.io/models/glm-ocr.html
- Colección de modelos OCR de ggml-org: https://huggingface.co/collections/ggml-org/ocr-models
