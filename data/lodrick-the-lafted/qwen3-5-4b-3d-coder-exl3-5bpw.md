# lodrick-the-lafted/Qwen3.5-4B-3D-Coder-exl3-5bpw

## Resumen
Este repositorio contiene una cuantización EXL3 de 5 bits por peso (aproximadamente 5.0 bpw) del modelo ccore/Qwen3.5-4B-3D-Coder, un ajuste fino independiente de Qwen/Qwen3.5-4B desarrollado por CCORE. El modelo original está especializado en generación de código general y, de forma destacada, en la creación de escenas 3D interactivas con Three.js. La versión aquí descrita es una conversión de pesos orientada a inferencia eficiente con el motor EXL3 (ExLlamaV3), publicada por el usuario lodrick-the-lafted.

El modelo base se presenta como una "early preview" de un fine-tune de 4B parámetros que, según la model card, sigue en desarrollo. Aunque la nomenclatura comercial habla de "4B", los pesos en safetensors del repositorio suman 2.199.007.232 parámetros reales (2,2B), un dato que conviene tener en cuenta al planificar el despliegue. La cuantización EXL3 a 5 bpw busca reducir el espacio en VRAM manteniendo una calidad cercana al original, lo que permite ejecutarlo en GPUs de consumo.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo pequeño especializado en código 3D, una cuantización EXL3 de 5 bits y soporte opcional de visión en las versiones GGUF del modelo base. Todo ello bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines de generación de escenas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), cuantizado con EXL3 |
| Parametros totales | 2.199.007.232 (2,2B) según safetensors; la model card habla de "4B" |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el modelo base GGUF se prueba a 65.536 tokens |
| Tipos de cuantizacion | EXL3 5.0 bpw (este repo); el modelo base ofrece Q4_K_M, Q8_0 y FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (tags del repo); EXL3 para este artefacto |

## Arquitectura y entrenamiento
El modelo base es un transformer Qwen3.5 de aproximadamente 2,2B parámetros (etiquetado como "4B" por el autor), ajustado por CCORE sobre Qwen/Qwen3.5-4B. El fine-tune se centra en código general y en la generación de escenas 3D con Three.js. Según la model card, el entrenamiento utilizó el dataset público CCORE Three.js 3D Scenes, con 4.146 ejemplos (3.933 de entrenamiento y 213 de validación), que incluyen prompts, trazas de razonamiento completas, respuestas HTML/JavaScript y niveles de complejidad. El dataset se publica bajo licencia MIT.

La model card menciona un informe técnico en PDF, pero no detalla el número total de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones arquitectónicas propias más allá del ajuste fino. La versión de este repositorio aplica cuantización EXL3 a 5.0 bpw, pensada para el motor ExLlamaV3, que permite cargar pesos de 5 bits con decodificación eficiente en GPUs. El modelo base incluye soporte opcional de visión mediante un proyector BF16 de aproximadamente 644 MiB, aunque esa capacidad corresponde a las versiones GGUF y no se confirma para este artefacto EXL3.

## Capacidades
- Generación de código general: la model card indica resultados prometedores en tareas de programación más allá del ámbito 3D.
- Generación de escenas 3D con Three.js: capacidad central del fine-tune, con ejemplos de escenas interactivas completas en HTML/JavaScript.
- Razonamiento con trazas de pensamiento: el dataset de entrenamiento incluye "full thinking traces", lo que sugiere soporte de modo de razonamiento explícito.
- Generación guiada por imagen (solo en versiones GGUF del modelo base): permite adjuntar una imagen de referencia y pedir una escena Three.js; requiere el proyector BF16 y no se confirma en este repo EXL3.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están declarados.

## Casos de uso
- Generación de escenas Three.js para prototipado web: el modelo produce HTML/JavaScript completo a partir de una descripción textual, lo que acelera la creación de demos 3D interactivas en navegador.
- Asistente de código en editores: al estar especializado en código y razonamiento, puede integrarse en extensiones tipo Copilot para autocompletar y explicar fragmentos JavaScript y Three.js.
- Educación en gráficos 3D: sirve para generar ejemplos didácticos de escenas con luces, cámaras y geometrías, con trazas de razonamiento que explican las decisiones.
- Generación de escenas a partir de referencias visuales: en las versiones GGUF con proyector, se puede adjuntar una imagen y pedir una recreación voxel o estilizada, útil para workflows de diseño conceptual.
- Automatización de demos comerciales: con licencia Apache 2.0, se puede desplegar en un servicio interno que genere maquetas 3D para presentaciones o configuradores de producto.
- Fine-tuning posterior: al ser un modelo pequeño (2,2B) y con dataset público, sirve como base para ajustes específicos en otros dominios de código o de visualización.
- Inferencia en GPUs de consumo: la cuantización EXL3 de 5 bpw permite ejecutarlo en tarjetas con VRAM limitada para pruebas locales y CI.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card solo ofrece valoraciones cualitativas ("one-shot success has improved substantially") y un ejemplo visual de generación guiada por imagen, sin métricas numéricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware
- VRAM estimada: con 2,2B parámetros a 5.0 bpw, los pesos ocupan aproximadamente 1,4 GB; sumando overhead de EXL3, KV-cache y contexto, se estima un uso de 3-6 GB según la longitud de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100; el modelo es pequeño y cabe holgadamente en la mayoría.
- GPU de consumo: sí, cabe en tarjetas de 8 GB o más con contexto moderado; con contextos muy largos conviene 12-16 GB.
- Opciones de despliegue: ExLlamaV3 (formato nativo EXL3); el modelo base soporta llama.cpp, Ollama y servidores compatibles con GGUF; para FP16, Transformers 5.20.2 según la model card.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-3D-Coder (EXL3 5bpw) | 2,2B reales | no disponible | Código y Three.js | Apache 2.0 | EXL3, safetensors, GGUF |
| Qwen/Qwen3.5-4B (base) | ~4B (según nombre) | no disponible | Código general | Apache 2.0 | safetensors, GGUF |
| ccore/Qwen3.5-4B-3D-Coder (FP16) | 2,2B reales | no disponible | Código y Three.js | Apache 2.0 | safetensors, GGUF |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con alternativas. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias
- El modelo se declara "early preview" y sigue en entrenamiento; la calidad puede variar y algunas escenas requieren reintentos o correcciones.
- La discrepancia entre el nombre "4B" y los 2,199B parámetros reales puede llevar a expectativas erróneas sobre capacidad y requisitos.
- Riesgo de alucinación en código: puede generar APIs inexistentes de Three.js o geometrías incorrectas; se recomienda validación automática.
- El soporte de visión solo está documentado para las versiones GGUF del modelo base con el proyector BF16; no se confirma en este artefacto EXL3.
- No hay información sobre sesgos, idiomas soportados ni evaluación de seguridad.
- El contexto máximo no está declarado; las pruebas del modelo base usan 65.536 tokens, pero no se garantiza en esta cuantización.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; conviene revisar el informe técnico y la model card del modelo base.
- Al ser una cuantización de terceros (lodrick-the-lafted), la fidelidad respecto al original no está verificada con benchmarks.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/lodrick-the-lafted/Qwen3.5-4B-3D-Coder-exl3-5bpw
- Modelo base: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/ccore/ThreeJS-3D-Scenes
- Informe técnico (PDF): https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/blob/main/Qwen3.5-4B-3D-Coder_Technical_Report.pdf
- Proyector de visión BF16: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/resolve/main/mmproj-Qwen3.5-4B-BF16.gguf
- GGUF de referencia con proyector: https://huggingface.co/lmstudio-community/Qwen3.5-4B-GGUF
