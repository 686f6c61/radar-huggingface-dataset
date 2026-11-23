# ShindoHik/Qwen3.5-4B-3D-Coder-Q8_0-GGUF

## Resumen

Qwen3.5-4B-3D-Coder es un modelo de 4.205.751.296 parámetros (en su versión GGUF de solo texto) especializado en generación de código, con un enfoque particular en Three.js y gráficos 3D en el navegador. El checkpoint original en FP16 lo desarrolla CCORE, mientras que esta ficha describe la cuantización Q8_0 publicada por el usuario ShindoHik en Hugging Face. La relevancia del modelo radica en su combinación poco habitual de tamaño compacto (rango 4B), capacidades multimodales (proyecta imágenes a texto) y un ajuste fino orientado a código de renderizado 3D.

La arquitectura subyacente es la familia Qwen3.5, un transformer con capacidades de predicción multi-token (MTP) que, según la model card, no se exporta en esta conversión GGUF. El checkpoint upstream incluye visión con 4.539.265.536 parámetros; la versión GGUF de texto conserva 4.205.751.296 parámetros más el proyector de visión BF16 sin modificar. El contexto máximo no se especifica en la información disponible, aunque los ejemplos de uso emplean 8192 tokens.

Esta ficha se centra en la cuantización Q8_0, pensada para ejecución local con llama.cpp. Se trata de una cuantización comunitaria, no oficial, lo que implica que las garantías de calidad y soporte son limitadas. Aun así, la licencia Apache 2.0 facilita su uso comercial y su integración en pipelines de desarrollo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con proyector de visión BF16 |
| Parametros totales | 4.205.751.296 (GGUF de texto); 4.539.265.536 en el checkpoint upstream FP16 con visión |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (los ejemplos de uso emplean `-c 8192`) |
| Tipos de cuantizacion | Q8_0 (esta versión); el modelo base admite otras cuantizaciones GGUF no detalladas |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de visión BF16 en GGUF (`mmproj`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5, un transformer denso de aproximadamente 4B parámetros. El checkpoint upstream de CCORE incorpora un proyector de visión que permite el procesamiento de entradas image-text-to-text; en esta cuantización, dicho proyector se conserva en BF16 sin modificar, por lo que la capacidad multimodal se mantiene operativa mediante `llama-mtmd-cli`. La model card menciona que el modelo original soporta predicción multi-token (MTP), pero esta funcionalidad no se exporta en el GGUF, por lo que debe desactivarse en los frontends que intenten habilitarla.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. El ajuste fino de CCORE está orientado a generación de código, con énfasis declarado en Three.js. La cuantización Q8_0 se realizó de forma independiente a partir de la exportación de precisión completa, sin dataset de calibración, sin importance matrix y sin recuantización; los hashes del origen y del proyector se verificaron antes de la conversión. El autor probó el modelo con el commit `6414d5b0c9e5895473036c90c2bd305ce4ceccc4` de llama.cpp.

## Capacidades

- Generación de código, con especialización en Three.js y escenas 3D para navegador.
- Comprensión de imágenes mediante el proyector de visión incluido (pipeline image-text-to-text).
- Generación de texto conversacional en formato multi-turno.
- Salida estructurada en JSON (verificada en las pruebas del autor).
- Razonamiento aritmético básico (verificado en las pruebas del autor).
- Compatibilidad con endpoints (`endpoints_compatible` según los tags).
- Soporte de plantillas de chat mediante `--jinja` en llama.cpp.
- No se documenta soporte explícito de tool calling, function calling ni modo thinking.
- Capacidades multilingües no documentadas.

## Casos de uso

- Generación de escenas Three.js: el modelo produce código JavaScript para escenas 3D (cubos rotatorios, iluminación, cámaras) que puede integrarse directamente en proyectos web; su ajuste específico en esta librería reduce la necesidad de corrección manual.
- Asistente de desarrollo en local: con 4B parámetros y cuantización Q8_0, cabe en equipos de gama alta de consumo, lo que permite autocompletado y generación de código sin conexión ni coste de API.
- Prototipado rápido de visualizaciones 3D: a partir de una descripción textual o una imagen de referencia, el modelo genera el esqueleto de una escena que el desarrollador refina después.
- Descripción de imágenes en pipelines de documentación: usando `llama-mtmd-cli` con el proyector BF16, puede generar texto descriptivo a partir de capturas o diagramas.
- Generación de salidas JSON para integración en herramientas: útil para producir configuraciones estructuradas de escenas, parámetros de materiales o metadatos.
- Educación y experimentación: su tamaño contenido y licencia Apache 2.0 lo hacen adecuado para entornos docentes donde se enseña generación de código asistida por IA sin infraestructura de servidor.
- Automatización de tareas de refactorización ligera en proyectos Three.js: sustitución de APIs obsoletas o adaptación de fragmentos de código a versiones recientes de la librería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se evaluó la precisión en benchmarks, el renderizado en navegador, el vídeo ni el comportamiento con contexto completo. Las únicas verificaciones realizadas fueron pruebas nativas de aritmética, salida JSON y comprensión de imágenes, además de una comprobación de sintaxis JavaScript sobre una escena Three.js generada (con resultados separados para salida cruda y normalizada).

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 5,2 GB, por lo que la cuantización Q8_0 requiere aproximadamente 5-6 GB de VRAM o memoria unificada, más overhead del runtime y del contexto.
- GPU recomendadas: tarjetas con 8 GB o más de VRAM, como RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090; en el ámbito profesional, A100 o H100 aunque están sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más de VRAM. En GPUs con 6 GB podría requerir descarga parcial de capas a CPU.
- Opciones de despliegue: llama.cpp (probado con el commit indicado), `llama-completion` y `llama-mtmd-cli` para multimodal. No se documenta compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles. La model card no proporciona mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-3D-Coder Q8_0 (esta ficha) | 4,2B (texto) | No disponible | Apache 2.0 | GGUF en HF, cuantización comunitaria | Especializado en Three.js, con visión |
| Qwen3.5-4B-3D-Coder FP16 (upstream, CCORE) | 4,54B (con visión) | No disponible | Apache 2.0 | Checkpoint original en HF | Precisión completa, referencia de calidad |
| Qwen2.5-Coder-3B | 3,1B | 32K (según familia) | Apache 2.0 | Múltiples cuantizaciones GGUF | No especializado en Three.js ni multimodal |
| Qwen2.5-Coder-7B | 7,6B | 32K (según familia) | Apache 2.0 | Múltiples cuantizaciones GGUF | Mayor tamaño y VRAM requerida |

La comparación con la familia Qwen2.5-Coder se ofrece como referencia de categoría (modelos de código de tamaño compacto con licencia permisiva); no se dispone de datos de rendimiento comparativos para esta cuantización concreta.

## Limitaciones y advertencias

- Cuantización comunitaria no oficial: no está publicada por Qwen ni por CCORE, por lo que no cuenta con garantías de soporte ni validación exhaustiva.
- Sin evaluación de benchmarks: no se midió precisión en MMLU, HumanEval, GSM8K ni tareas similares; el rendimiento real en producción es desconocido.
- Sin evaluación de renderizado en navegador: el código Three.js generado se comprobó solo a nivel de sintaxis JavaScript, no de ejecución visual.
- Salidas con HTML escapado: la model card advierte que algunas salidas crudas usan entidades HTML escapadas, lo que puede requerir normalización en pipelines automatizados.
- MTP no exportado: la predicción multi-token debe desactivarse en los frontends; intentar habilitarla puede causar errores.
- Contexto no documentado: se desconoce la longitud máxima de contexto soportada; los ejemplos usan 8192 tokens y no se evaluó el comportamiento con contexto completo.
- Idiomas no documentados: no hay información sobre cobertura multilingüe, lo que desaconseja su uso en aplicaciones no inglesas sin validación previa.
- Riesgo de alucinación: como todo modelo generativo de 4B, puede producir APIs inexistentes de Three.js o código sintácticamente válido pero funcionalmente incorrecto.
- Sin datos de sesgos: no se documentan evaluaciones de sesgo ni de seguridad.
- Licencia Apache 2.0: permite uso comercial, pero al ser una cuantización derivada conviene conservar los avisos de licencia y atribución del modelo base.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/ShindoHik/Qwen3.5-4B-3D-Coder-Q8_0-GGUF
- Modelo base (checkpoint original de CCORE): https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Revisión concreta del checkpoint upstream citada en la model card: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/tree/16f53e560115a3f55ddf7b455d65417257e29414
- Repositorio de llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
