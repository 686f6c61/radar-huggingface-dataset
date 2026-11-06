# Chungulus/Qwen3.5-4B-GLB-3D-Coder-Q5_K_M-GGUF

## Resumen

Qwen3.5-4B-GLB-3D-Coder-Q5_K_M-GGUF es una cuantización comunitaria en formato GGUF del modelo ccore/Qwen3.5-4B-GLB-3D-Coder, un fine-tune de Qwen3.5-4B especializado en la generación de código para assets 3D en formato GLB y escenas Three.js. La publica el usuario Chungulus bajo licencia Apache 2.0, de forma independiente y sin vinculación con Qwen ni con CCORE, el creador del checkpoint original.

El modelo base parte de Qwen3.5-4B y fue ajustado por CCORE para producir código Three.js y assets GLB exportables a partir de instrucciones en lenguaje natural, con capacidad de entrada imagen-texto gracias a su proyector visual. Esta versión concreta exporta la red de texto a F16 y la cuantiza a Q5_K_M, manteniendo el proyector de visión original en BF16 para conservar las capacidades multimodales.

Su relevancia radica en que permite ejecutar localmente, en hardware de consumo, un modelo especializado en generación de escenas 3D y código Three.js, con un tamaño de repositorio de 3,8 GB y compatibilidad con llama.cpp. Es una opción práctica para prototipado de pipelines de generación de assets 3D sin depender de servicios en la nube.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión), basado en Qwen3.5-4B |
| Parametros totales | 4.205.751.296 (red de texto en GGUF); 4.539.265.536 en el checkpoint original (incluye visión) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma oficial; los ejemplos de la model card usan `-c 16384` y `-c 8192` |
| Tipos de cuantizacion | Q5_K_M (esta versión); el modelo base admite otras cuantizaciones GGUF de terceros |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (texto Q5_K_M) + `mmproj-Qwen3.5-4B-BF16.gguf` (proyector visual BF16) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal derivado de Qwen3.5-4B. El checkpoint original de CCORE contiene pesos de texto en F32 y pesos de visión en BF16, con un total de 4.539.265.536 parámetros. La cuantización de Chungulus exporta únicamente la red de texto (4.205.751.296 parámetros) a F16, reteniendo tensores sensibles en F32, y posteriormente la cuantiza a Q5_K_M sin usar matriz de importancia ni calibración. El proyector visual se incluye sin modificar en BF16.

El fine-tune de CCORE está orientado a la generación de código Three.js y assets GLB, e incluye una plantilla de chat (`chat_template.jinja`) y un system prompt de generación de assets documentados en la model card original. El modelo soporta multi-token prediction (MTP) en su checkpoint original, aunque esta capacidad no se exporta en la cuantización GGUF y debe desactivarse en los frontends que intenten habilitarla. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Generación de código Three.js: produce archivos HTML completos con escenas 3D, incluyendo botones de exportación GLB mediante GLTFExporter.
- Generación de assets 3D en formato GLB a partir de descripciones en lenguaje natural.
- Comprensión de imágenes: el proyector visual BF16 permite tareas image-text-to-text, como identificar formas y colores en una imagen.
- Generación de texto conversacional y salida estructurada en JSON (verificado en las pruebas del autor de la cuantización).
- Razonamiento aritmético básico (verificado en las pruebas nativas).
- Modo thinking: el autor original recomienda activarlo con temperatura 0.8, top-k 40, top-p 0.95, min-p 0 y repeat penalty 1.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Generación de escenas Three.js para prototipado web: el modelo produce un archivo HTML completo con una escena 3D y un botón de exportación GLB, lo que permite iterar rápidamente sobre prototipos de visualización 3D sin escribir el código manualmente.
- Creación de assets GLB para pipelines de contenido: a partir de una descripción textual, el modelo genera código que construye geometría y la exporta como GLB, integrándose en flujos de trabajo de diseño 3D y motores de juego.
- Asistente de código especializado en Three.js: dado su ajuste específico, es adecuado para autocompletar y explicar fragmentos de código de escenas 3D, útil en entornos de desarrollo frontend con WebGL.
- Descripción y análisis de imágenes en local: con el proyector visual incluido, puede identificar formas y colores en capturas o diagramas, útil para tareas de verificación visual en pipelines automatizados.
- Generación de salida JSON estructurada: verificado en las pruebas del cuantizador, permite integrarse en flujos que requieran respuestas parseables, como la generación de metadatos de assets 3D.
- Despliegue en local para privacidad: al ejecutarse con llama.cpp en hardware de consumo, permite procesar prompts e imágenes sin enviar datos a servicios externos, adecuado para entornos con requisitos de confidencialidad.
- Educación y experimentación: su tamaño de 4B y su formato GGUF lo hacen accesible para aprender sobre modelos multimodales y generación de código 3D en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor de la cuantización documenta únicamente pruebas funcionales acotadas: aritmética nativa, salida JSON, dos casos de comprensión de imágenes (identificación de un cuadrado central en fixtures rojo/azul con 1024 tokens de imagen, temperatura 0 y semilla 42) y verificación de sintaxis JavaScript y de la API de Three.js/GLTFExporter en el ejemplo de cubo con exportación. No se probaron renderizado en navegador, descarga e importación real del GLB, vídeo, comportamiento en contexto completo ni precisión en benchmarks.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q5_K_M ocupa aproximadamente 3,8 GB en disco; la inferencia requiere espacio adicional para el contexto (KV cache). Con contexto de 16384 tokens se recomienda al menos 6-8 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100, H100. El modelo cabe en GPUs de consumo con 8 GB o más.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM, usando `-ngl 99` para descargar todas las capas en GPU.
- Opciones de despliegue: llama.cpp (build de referencia `6414d5b0c9e5895473036c90c2bd305ce4ceccc4`), con `llama-completion` para texto y `llama-mtmd-cli` para multimodal. Compatible con frontends que soporten Qwen3.5. No se documenta soporte para vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Chungulus/Qwen3.5-4B-GLB-3D-Coder-Q5_K_M-GGUF (este) | 4,2B (texto) | no disponible | GGUF Q5_K_M | Apache 2.0 | Cuantización comunitaria del fine-tune de CCORE para GLB/Three.js |
| Chungulus/Qwen3.5-4B-3D-Coder-Q5_K_M-GGUF | 4,2B (texto) | no disponible | GGUF Q5_K_M | Apache 2.0 | Cuantización del modelo anterior de CCORE para escenas Three.js |
| mradermacher/Qwen3.5-4B-GLB-3D-Coder-GGUF | 4B | no disponible | GGUF | Apache 2.0 | Cuantización alternativa del mismo fine-tune de CCORE |

## Limitaciones y advertencias

- Es una cuantización comunitaria no oficial: no está respaldada por Qwen ni por CCORE, y el autor recomienda inspeccionar y probar los assets generados en el editor.
- No se probaron renderizado en navegador, descarga e importación real del GLB, vídeo ni comportamiento en contexto completo; las pruebas son funcionales y acotadas.
- La comprensión de imágenes está verificada solo con evidencia limitada (dos fixtures de color), no es una garantía de grounding fiable.
- El modelo original soporta multi-token prediction, pero esta capacidad no se exporta en el GGUF; debe desactivarse en frontends que intenten habilitarla.
- Riesgo de alucinación en código generado: la verificación de sintaxis y API no garantiza que el asset funcione correctamente en producción.
- Sesgos conocidos: no disponible en la información proporcionada.
- Idiomas soportados: no disponible; no se puede confirmar el rendimiento en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe retenerse la licencia original y la atribución a Qwen y CCORE.
- Requiere una build reciente de llama.cpp compatible con Qwen3.5; versiones antiguas pueden no cargar el modelo.

## Enlaces

- [Chungulus/Qwen3.5-4B-GLB-3D-Coder-Q5_K_M-GGUF en Hugging Face](https://huggingface.co/Chungulus/Qwen3.5-4B-GLB-3D-Coder-Q5_K_M-GGUF)
- [Modelo base: ccore/Qwen3.5-4B-GLB-3D-Coder](https://huggingface.co/ccore/Qwen3.5-4B-GLB-3D-Coder)
- [Model card original del checkpoint](https://huggingface.co/ccore/Qwen3.5-4B-GLB-3D-Coder/blob/8f32a199f8b22fe3157b9c5c8b42b052a0750dd3/README.md)
- [Checkpoint original u008186](https://huggingface.co/ccore/Qwen3.5-4B-GLB-3D-Coder/tree/8f32a199f8b22fe3157b9c5c8b42b052a0750dd3)
- [Cuantización alternativa de mradermacher](https://huggingface.co/mradermacher/Qwen3.5-4B-GLB-3D-Coder-GGUF)
- [Cuantización del modelo anterior Three.js de CCORE](https://huggingface.co/Chungulus/Qwen3.5-4B-3D-Coder-Q5_K_M-GGUF)
