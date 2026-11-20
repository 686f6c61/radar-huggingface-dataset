# LiquidAI/d1-2B-ONNX

## Resumen

d1-2B-ONNX es la versión exportada a formato ONNX del modelo multimodal d1-2B de Liquid AI, diseñada para inferencia multiplataforma mediante ONNX Runtime. El modelo original pertenece a la familia LFM3 (Liquid Foundation Model 3) y adopta una arquitectura híbrida denominada "liquid", orientada a tareas de imagen-a-texto conversacionales. Con aproximadamente 2.000 millones de parámetros, se posiciona como una alternativa compacta para despliegues en entornos con recursos limitados, incluyendo CPU.

La relevancia de esta variante radica en su portabilidad: al estar empaquetada en ONNX, puede ejecutarse fuera del ecosistema PyTorch, lo que facilita su integración en aplicaciones de escritorio, dispositivos de borde y servicios con infraestructura heterogénea. El repositorio incluye varias precisiones (q4, q8 y q4f16) que emparejan un decodificador con un codificador visual, permitiendo ajustar el equilibrio entre tamaño y calidad.

El modelo soporta 17 idiomas, entre ellos el español, y está publicado bajo la licencia LFM 1.0 (lfm1.0), que no es de código abierto estricto y requiere revisión para uso comercial. Su pipeline declarado es image-text-to-text, lo que confirma capacidades multimodales de entrada de imagen y salida de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida "liquid" (familia LFM3), transformer multimodal con codificador visual |
| Parametros totales | 2B (aproximado, según nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4, q8, q4f16 (ONNX) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | lfm1.0 (license: other) |
| Formato de pesos | ONNX (decoder + vision encoder por precisión) |

## Arquitectura y entrenamiento

El modelo base d1-2B emplea una arquitectura híbrida de la familia LFM3 de Liquid AI, etiquetada como "liquid" en los metadatos del repositorio. Se trata de un modelo multimodal con un decodificador de lenguaje y un codificador visual separado, empaquetados de forma independiente en la exportación ONNX. La model card de esta variante remite a la del modelo original para los detalles de arquitectura y entrenamiento, por lo que no se dispone aquí de información sobre número de tokens de entrenamiento, composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal de esta publicación es la exportación a ONNX Runtime con múltiples precisiones: q4 empareja un decodificador q4 con un codificador visual q8 (1,94 GB), q8 empareja decodificador q8 con codificador fp16 (2,51 GB), y existe una variante q4f16. Esta separación permite optimizar por separado el coste computacional del decodificador y la fidelidad del codificador visual, algo relevante en despliegues sobre CPU.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes (image-text-to-text): descripción, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Soporte multilingüe en 17 idiomas, incluido el español.
- Ejecución multiplataforma mediante ONNX Runtime, incluyendo CPU.
- Cuantización a q4, q8 y q4f16 para ajustar tamaño y precisión.
- Capacidades de razonamiento y código: no confirmadas explícitamente en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Aplicaciones de escritorio con descripción de imágenes: integración vía ONNX Runtime en herramientas locales que necesiten generar texto a partir de capturas o fotografías sin depender de la nube, aprovechando la variante q4 (1,94 GB) para CPU.
- Asistentes de accesibilidad: generación de descripciones de imágenes para personas con discapacidad visual, ejecutando el modelo en dispositivos de borde gracias a su tamaño reducido y su portabilidad ONNX.
- Procesamiento de documentos escaneados: extracción de texto descriptivo y respuestas sobre formularios o recibos, combinando el codificador visual con el decodificador conversacional en un pipeline local.
- Moderación de contenido visual: clasificación y descripción automática de imágenes en servicios con infraestructura heterogénea, donde ONNX Runtime simplifica el despliegue frente a stacks PyTorch.
- Automatización de soporte con imágenes adjuntas: atención al cliente donde el usuario envía una captura y el modelo responde en su idioma (17 idiomas soportados, incluido español), ejecutándose en servidores sin GPU dedicada con la variante q8.
- Prototipado rápido en entornos embebidos: validación de ideas de producto multimodal en dispositivos con recursos limitados, usando q4f16 para equilibrar latencia y calidad.
- Investigación en modelos multimodales compactos: comparación de precisiones ONNX (q4 vs q8) para estudiar el impacto de la cuantización en tareas visión-lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica estrictamente, ya que las variantes están pensadas para CPU; en GPU, q4 requeriría aproximadamente 2 GB y q8 alrededor de 2,5 GB, más overhead de activaciones y contexto.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, cualquier GPU con 4 GB o más de memoria podría alojar las variantes cuantizadas.
- Compatibilidad con GPU de consumo: probable en tarjetas como RTX 3060, RTX 4060 o superiores, aunque no confirmado por el autor.
- Opciones de despliegue: ONNX Runtime (librería declarada); otras opciones como vLLM, llama.cpp, Ollama o TGI no están confirmadas para este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| d1-2B-ONNX | ~2B | no disponible | Sí (imagen-texto) | lfm1.0 | ONNX |
| d1-2B (original) | ~2B | no disponible | Sí (imagen-texto) | lfm1.0 | safetensors (no confirmado) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en los datos proporcionados.

## Limitaciones y advertencias

- Licencia lfm1.0: no es una licencia de código abierto estándar; es imprescindible revisar los términos antes de cualquier uso comercial.
- La model card de esta variante remite a la del modelo original para arquitectura y uso; la documentación específica de esta exportación ONNX es mínima.
- Riesgo de alucinación inherente a los modelos generativos de 2B parámetros; la precisión en tareas complejas será inferior a la de modelos mayores.
- Longitud de contexto no documentada en la información disponible, lo que limita la planificación de despliegues con conversaciones largas.
- No se confirma soporte de tool calling ni de razonamiento multi-paso, capacidades relevantes para pipelines de agentes.
- Las cuantizaciones q4 pueden degradar la calidad en tareas visuales finas; conviene validar con la variante q8 antes de producción.
- Sesgos conocidos: no documentados en la información proporcionada.
- El tamaño del repositorio (19,3 GB) incluye todas las precisiones; la descarga selectiva de archivos es recomendable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/LiquidAI/d1-2B-ONNX
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Blog de presentación: https://www.liquid.ai/blog/open-d1
- Documentación: https://docs.liquid.ai/lfm/getting-started/welcome
- Consola/API: https://console.liquid.ai/dashboard
- Playground: https://playground.liquid.ai/
- Licencia: https://huggingface.co/LiquidAI/d1-2B-ONNX/blob/main/LICENSE
