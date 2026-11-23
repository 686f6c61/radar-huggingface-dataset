# Ji1an/Qwen3.8-27B-abliterated-UD-GGUF

## Resumen

Ji1an/Qwen3.8-27B-abliterated-UD-GGUF es una cuantización GGUF del modelo Qwen3.8-27B en su variante "abliterated", un proceso de modificación de pesos que elimina o atenúa los mecanismos de rechazo aprendidos durante el alineamiento. El autor de esta ficha de cuantización es Ji1an, que parte del repositorio unsloth/Qwen3.8-27B-GGUF y aplica el parche de abliteración publicado por huihui-ai sobre la variante Huihui-Qwen3.8-27B-abliterated-GGUF. El resultado es un modelo de 27.320.697.856 parámetros (unos 27,3 mil millones) distribuido en formato GGUF con cuantización dinámica UD-Q4_K_XL.

El modelo resuelve un nicho concreto: ofrecer una versión del Qwen3.8-27B sin los filtros de rechazo del alineamiento original, empaquetada para inferencia local eficiente mediante llama.cpp y compatible con endpoints. La cuantización dinámica (Dynamic 3.1) asigna más bits a las capas sensibles y menos a las menos críticas, lo que permite mantener calidad con un tamaño de repositorio de 36,2 GB.

Es relevante para desarrolladores e investigadores que necesitan ejecutar un modelo de ~27B en hardware de consumo o en servidores modestos, con licencia Apache 2.0 y soporte para chino e inglés. La abliteración, sin embargo, introduce caveats importantes de seguridad y alineamiento que se detallan en la sección de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; detalles de atención y capas no disponibles en la información proporcionada) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | GGUF con cuantización dinámica UD-Q4_K_XL (Dynamic 3.1); el repo base unsloth ofrece otras variantes GGUF |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 36,2 GB); incluye mmproj en bf16 para capacidades multimodales |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del Qwen3.8-27B original más allá de que se trata de un transformer de ~27,3B parámetros. El repositorio es una cuantización, no un entrenamiento: Ji1an parte de los pesos GGUF de unsloth y aplica el parche de abliteración de huihui-ai mediante los parámetros `--start-layer 22 --end-layer 52 --ablate-experts 1`, lo que indica que la intervención se aplica sobre las capas 22 a 52 y sobre los expertos (lo que sugiere una arquitectura con componentes tipo MoE o expertos, aunque el dato de parámetros activos no se confirma).

La abliteración consiste en identificar las direcciones de activación asociadas a comportamientos de rechazo y proyectar los pesos para eliminarlas, sin reentrenamiento adicional. El resultado conserva las capacidades del modelo base pero reduce la probabilidad de respuestas de negativa. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO en el modelo original. La cuantización UD-Q4_K_XL (Dynamic 3.1) es una innovación de empaquetado que ajusta la precisión por capa para optimizar el equilibrio calidad/tamaño.

## Capacidades

- Generación de texto conversacional en chino e inglés, orientada a diálogo multi-turno.
- Capacidades multimodales: el repositorio incluye un `mmproj-model-bf16.gguf`, lo que habilita entrada de imágenes en el pipeline de llama.cpp.
- Razonamiento y generación de código heredados del modelo base Qwen3.8-27B (no verificados en esta ficha).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue como API.
- Soporte de tool calling y function calling: no confirmado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Despliegue local de un modelo de ~27B en estaciones de trabajo con GPU de consumo: la cuantización Q4_K_XL reduce el peso a ~16-17 GB, lo que permite ejecutarlo en GPUs con 24 GB de VRAM mediante llama.cpp u Ollama.
- Investigación sobre alineamiento y seguridad: la variante abliterated permite estudiar cómo cambia el comportamiento del modelo al eliminar los mecanismos de rechazo, comparándolo con el Qwen3.8-27B original.
- Generación de contenido creativo sin restricciones de filtrado: útil en entornos controlados donde se necesita explorar narrativas que el modelo base rechazaría.
- Prototipado de asistentes conversacionales bilingües chino-inglés: el soporte nativo de ambos idiomas y el formato GGUF facilitan iteraciones rápidas en local.
- Análisis de imágenes en local: gracias al `mmproj` incluido, se puede usar en tareas de descripción o extracción de información de imágenes sin depender de APIs externas.
- Evaluación comparativa de cuantizaciones: el sufijo UD (Unsloth Dynamic) permite medir la degradación de calidad frente a cuantizaciones estándar Q4_K_M en tareas de razonamiento y generación.
- Servicio de inferencia autoalojado: la compatibilidad con endpoints permite montar un servidor compatible con la API de OpenAI usando llama.cpp o vLLM (este último con soporte GGUF limitado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~16-17 GB con UD-Q4_K_XL (36,2 GB de repo incluye múltiples archivos y el mmproj; el archivo principal Q4_K_XL ronda los 16-17 GB).
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100 80 GB para mayor throughput.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con Q4_K_XL; en GPUs de 16 GB puede requerir offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; vLLM con soporte GGUF experimental; TGI no soporta GGUF de forma nativa.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ji1an/Qwen3.8-27B-abliterated-UD-GGUF | ~27,3B | no disponible | Apache 2.0 | GGUF Q4_K_XL | Abliterated, bilingüe zh/en, multimodal |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF | ~27,3B | no disponible | Apache 2.0 | GGUF | Fuente del parche de abliteración; sin cuantización dinámica UD |
| unsloth/Qwen3.8-27B-GGUF | ~27,3B | no disponible | Apache 2.0 | GGUF | Modelo base sin abliterar; alineamiento original intacto |
| Qwen3.8-27B (original) | ~27,3B | no disponible | Apache 2.0 | safetensors | Pesos completos; requiere más VRAM |

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo, lo que puede producir contenido dañino, ofensivo o inseguro sin las salvaguardas del modelo original.
- Riesgo elevado de alucinación, especialmente en temas sensibles donde el modelo ya no "se frena" para admitir incertidumbre.
- Sesgos heredados del modelo base Qwen3.8-27B, no corregidos por la abliteración.
- Idiomas limitados a chino e inglés; el rendimiento en castellano no está garantizado.
- La cuantización Q4_K_XL introduce pérdida de precisión frente a los pesos completos; puede degradar tareas de razonamiento matemático o código complejo.
- Licencia Apache 2.0 permite uso comercial, pero el uso de una variante abliterated en producción conlleva responsabilidad legal y reputacional sobre el contenido generado.
- No se dispone de información sobre la longitud de contexto efectiva ni sobre el soporte de tool calling, lo que limita su uso en pipelines de agentes sin validación previa.
- El repositorio tiene 0 likes y 1239 descargas, lo que sugiere poca validación comunitaria; conviene verificar la integridad de los pesos antes de usarlos en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Ji1an/Qwen3.8-27B-abliterated-UD-GGUF
- Modelo base (unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Fuente del parche de abliteración (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF
- mmproj bf16: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF/blob/main/mmproj-model-bf16.gguf
