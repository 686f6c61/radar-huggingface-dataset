# bvgtuf2/cook_v1

## Resumen

`cook_v1` es un modelo de lenguaje multimodal (vision-language) de 1,94 mil millones de parámetros, publicado en Hugging Face por el usuario bvgtuf2 (Douglas Troll). Se trata de un fine-tuning del modelo `Huihui-Qwen3.5-2B-abliterated`, convertido a formato GGUF mediante la librería Unsloth. El nombre sugiere una especialización en el dominio culinario, aunque la model card no proporciona documentación sobre la tarea concreta ni sobre los datos de entrenamiento.

El modelo se distribuye en dos ficheros GGUF: un peso principal cuantizado a Q8_0 y un proyector multimodal (mmproj) en F16, lo que indica que puede procesar tanto texto como imágenes. Está pensado para su ejecución con `llama.cpp` o `llama-mtmd-cli` en entornos locales o en la nube. Su tamaño compacto (2,7 GB en total) lo hace apto para GPUs de consumo, aunque la falta de información oficial sobre capacidades y rendimiento limita su uso en producción sin una evaluación previa.

La relevancia de este modelo reside en su naturaleza abierta y su tamaño reducido, que permite experimentar con un VLM multimodal en hardware modesto. No obstante, la ausencia de model card detallada, benchmarks y licencia explícita es una limitación importante para adoptarlo en entornos profesionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) basada en Qwen3.5-2B |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (pesos principales), F16 (proyector multimodal) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido en el repo) |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna más allá de que se trata de un modelo multimodal basado en Qwen3.5-2B, lo que implica un transformer de lenguaje con un codificador visual adicional para procesar imágenes. El modelo fue fine-tuned y convertido a GGUF con Unsloth, que optimiza el entrenamiento y la conversión. El nombre "abliterated" en el nombre del fichero original sugiere que el modelo base fue sometido a un proceso de "abliteración" (eliminación de rechazos y restricciones de seguridad), una técnica común en modelos desalinhados.

Los detalles sobre el dataset de entrenamiento, el número de tokens, la composición de los datos (imágenes, texto, recetas, etc.) y si se aplicó RLHF o DPO no se han publicado.

## Capacidades

- **Procesamiento multimodal**: puede recibir tanto texto como imágenes, lo que permite tareas de descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- **Generación de texto**: al estar basado en Qwen3.5-2B, hereda las capacidades de generación de lenguaje natural, aunque el fine-tune puede haberlas especializado.
- **Conversación multi-turno**: el formato GGUF con `--jinja` permite uso de plantillas de chat, indicando soporte de conversaciones.
- **Posible dominio culinario**: el nombre "cook" y el contexto de los tags sugieren una especialización en cocina, aunque no hay evidencia documentada.
- **Tool calling y funciones**: no confirmado; la base Qwen3.5 soporta esta funcionalidad, pero no se ha verificado en el fine-tune.

## Casos de uso

- **Asistente de recetas con fotos**: el usuario podría fotografiar los ingredientes y el modelo sugerir recetas o pasos de cocina. Adecuado por su naturaleza multimodal y su tamaño reducido.
- **Descripción de imágenes de comida**: integrado en aplicaciones móviles o web para generar descripciones de platos a partir de una imagen.
- **Automatización de inventario de cocina**: procesar imágenes de la nevera o despensa para listar productos y sugerir compras.
- **Educación culinaria**: responder preguntas sobre técnicas de cocina, sustitución de ingredientes o tiempos de preparación en un chat.
- **Prototipado de agentes domésticos**: servir de cerebro de un agente conversacional en un dispositivo edge con recursos limitados.
- **Generación de contenido para blogs de cocina**: producir textos descriptivos de platos a partir de imágenes o de una lista de ingredientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones comparativas para este modelo.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con cuantización Q8_0 y 1,94B parámetros, el uso de VRAM se estima en 2-3 GB para el modelo más el proyector multimodal (F16, ~0,5 GB). Total aproximado: 3-4 GB.
- **GPU recomendadas**: RTX 3060 12GB, RTX 4060, RTX 4090, o cualquier GPU con al menos 4 GB de VRAM. También funciona en Apple Silicon con Metal.
- **Consumer GPU**: sí, cabe en la mayoría de GPUs de consumo modernas (desde 4 GB de VRAM).
- **Opciones de despliegue**: `llama.cpp` (con `llama-mtmd-cli` para multimodal), `llama-cpp-python`, `Ollama` (si se importa manualmente), `vLLM` (con adaptación a GGUF).
- **Latencia y throughput**: no disponible; al ser un modelo pequeño, en una RTX 4090 se esperan velocidades de decodificación de 50-100 tokens/s, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| `cook_v1` (este) | 1,94B | no disponible | VLM | no disponible | GGUF |
| Qwen2.5-VL-3B-Instruct | 3B | 32K | VLM | Apache 2.0 | safetensors, GGUF |
| Llama-3.2-Vision-3B | 3B | 128K | VLM | Llama 3.2 License | safetensors, GGUF |
| Moondream2 | 1.86B | 32K | VLM | Apache 2.0 | safetensors, GGUF |

Nota: la comparativa es orientativa, ya que no se dispone de benchmarks para `cook_v1`. Moondream2 es el más cercano en tamaño y licencia abierta, mientras que Qwen2.5-VL-3B y Llama-3.2-Vision-3B ofrecen documentación y evaluaciones públicas.

## Limitaciones y advertencias

- **Sin documentación**: no existe model card detallada, por lo que se desconocen los datos de entrenamiento, el rendimiento y los casos de uso previstos.
- **Licencia desconocida**: no se indica licencia, lo que impide el uso comercial sin autorización explícita del autor.
- **Sesgos y alucinaciones**: al ser un modelo abliterated, puede generar contenido no seguro o inexacto. El fine-tune puede haber introducido sesgos específicos del dominio de cocina.
- **Capacidad visual no verificada**: el proyector multimodal está incluido, pero no hay pruebas de que el modelo responda correctamente a imágenes complejas.
- **Riesgo de alucinación en recetas**: puede generar instrucciones de cocina incorrectas o peligrosas. No debe usarse para asesoramiento sanitario ni alimentario sin supervisión humana.
- **Soporte de idioma**: no se especifican los idiomas; aunque Qwen3.5-2B soporta múltiples lenguas, el fine-tune puede haber reducido el rendimiento en español u otros idiomas.
- **Formato GGUF**: limitado a ecosistemas que soporten GGUF (llama.cpp, Ollama), no usable directamente con librerías como transformers.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/bvgtuf2/cook_v1)
- [Perfil del autor en Hugging Face](https://huggingface.co/bvgtuf2)
- [Unsloth (herramienta de fine-tuning y conversión)](https://github.com/unslothai/unsloth)
