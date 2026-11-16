# OmAr-Kader-DeV/Kestrel-4B-Coder-mlx-8Bit

## Resumen

Kestrel-4B-Coder-mlx-8Bit es una conversión al formato MLX (cuantización de 8 bits) del modelo Jackrong/Kestrel-4B-Coder, publicada por el usuario OmAr-Kader-DeV. Se trata de un modelo multimodal de tipo image-text-to-text construido sobre la arquitectura qwen3_5, con 4.205.751.296 parámetros totales y orientado a generación de código, razonamiento, uso de herramientas (tool calling) y despliegue en dispositivos locales. La conversión se realizó con mlx-lm 0.31.2, lo que la hace directamente consumible en hardware Apple Silicon a través del framework MLX.

El modelo base procede de un pipeline de fine-tuning supervisado (SFT) y destilación sobre la familia Qwen 3.5, según indican las etiquetas del repositorio. Incorpora capacidades declaradas de multi-token prediction (MTP) y decodificación especulativa, así como soporte multimodal de visión. Su licencia Apache 2.0 y su tamaño compacto lo sitúan como candidato para inferencia en el borde (edge computing) y en equipos de consumo.

La relevancia de esta ficha radica en que se trata de una variante de cuantización para un runtime concreto (MLX), no de un modelo original: el interés práctico está en si el artefacto es desplegable en Mac con memoria unificada y en qué se diferencia del checkpoint original en safetensors. La información publicada por el autor es mínima y no incluye datos de entrenamiento, benchmarks ni detalles de la receta de destilación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal image-text-to-text, según etiquetas del repositorio) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (MLX); el repositorio incluye la etiqueta gguf, pero no se detallan otros niveles |
| Idiomas soportados | en, zh, ko, ja, ru, es |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (convertido con mlx-lm 0.31.2) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de la etiqueta `qwen3_5`, que sitúa el modelo base en la familia Qwen 3.5. El pipeline declarado es `image-text-to-text`, lo que implica un codificador visual acoplado a un decoder de lenguaje, aunque no se especifica el tipo de fusión multimodal ni la resolución de imagen soportada. Las etiquetas `mtp`, `multi-token-prediction` y `speculative-decoding` sugieren que el modelo incorpora cabezas o mecanismos de predicción multi-token, pero no hay documentación que confirme cómo se implementan ni si están activos en esta conversión MLX.

Respecto al entrenamiento, las etiquetas indican `sft`, `distillation`, `merged` y `unsloth`, lo que apunta a un fine-tuning supervisado con destilación sobre el modelo base Jackrong/Kestrel-4B-Coder, probablemente fusionando adaptadores LoRA. No se publica el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detalla el proceso de cuantización a 8 bits más allá de la herramienta empleada (mlx-lm 0.31.2), por lo que se desconoce si se aplicó cuantización de grupo, qué bits se reservaron para escalas y sesgos, o si alguna capa quedó en precisión completa.

## Capacidades

- Generación de código: el modelo está etiquetado como `coder` y `code-generation`, orientado a tareas de programación.
- Razonamiento: incluye la etiqueta `reasoning`, aunque no se documenta un modo de pensamiento explícito ni su formato.
- Tool calling y function calling: soporte declarado mediante las etiquetas `tool-use` y `function-calling`.
- Uso como agente: etiqueta `agent`, sin especificar protocolos ni formato de mensajes.
- Multimodalidad: pipeline `image-text-to-text`, con capacidad de procesar imágenes junto a texto.
- Multilingüe: inglés, chino, coreano, japonés, ruso y español.
- Predicción multi-token y decodificación especulativa: declaradas por etiquetas, sin detalles de implementación.
- Conversacional: etiqueta `conversational`, con plantilla de chat disponible en el tokenizer según el ejemplo de la model card.

## Casos de uso

- Asistencia de programación en local sobre Mac: al estar en formato MLX 8-bit, puede cargarse con `mlx-lm` en un equipo Apple Silicon y usarse para autocompletado, explicación de código o generación de tests sin conexión a servicios externos.
- Revisión de capturas de pantalla y diagramas: gracias al pipeline image-text-to-text, puede recibir una imagen de una interfaz o un diagrama de arquitectura y generar descripciones o código asociado, siempre que se valide la calidad real del modelo base.
- Automatización de tareas con herramientas: las etiquetas de function calling permiten integrarlo en flujos donde el modelo emite llamadas estructuradas a APIs, aunque la ausencia de documentación obliga a definir el esquema de herramientas por prueba y error.
- Prototipado de agentes en el borde: su tamaño de 4.2B parámetros y la cuantización 8-bit facilitan ejecutar bucles multi-paso en portátiles, útil para demos de agentes que no pueden enviar datos a la nube.
- Traducción y atención multilingüe: con seis idiomas declarados, puede emplearse para tareas de traducción o atención al usuario en entornos donde se mezclen inglés, español, chino, japonés, coreano y ruso, con verificación humana por la falta de benchmarks.
- Educación y experimentación: sirve como base para estudiar destilación y cuantización MLX, comparando su comportamiento frente al checkpoint original en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, y tampoco se aportan comparaciones con el modelo base.

## Requisitos de hardware

- VRAM/memoria unificada estimada: con 4.205.751.296 parámetros en 8 bits, el peso ronda los 4,2 GB; sumando overhead de runtime y caché KV, es razonable reservar entre 5 y 7 GB, aunque el autor no publica cifras oficiales.
- Hardware recomendado: equipos Apple Silicon con memoria unificada (M1/M2/M3/M4 en configuraciones de 16 GB o superiores), dado que el formato es MLX.
- GPU consumer: no se documenta soporte CUDA para este artefacto concreto; para GPUs NVIDIA habría que recurrir al checkpoint original o a una conversión GGUF.
- Opciones de despliegue: `mlx-lm` es la vía indicada por el autor; las etiquetas mencionan `gguf` y `llama.cpp`, pero el repositorio entregado es MLX, no GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kestrel-4B-Coder-mlx-8Bit | 4,2B | no disponible | Apache 2.0 | MLX safetensors 8-bit | Conversión comunitaria del modelo Jackrong |
| Jackrong/Kestrel-4B-Coder | 4,2B (presumiblemente) | no disponible | Apache 2.0 | safetensors | Modelo base original, sin cuantizar |
| Qwen 3.5 (familia base) | no disponible | no disponible | no disponible | no disponible | Arquitectura de referencia citada por la etiqueta `qwen3_5` |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en código, razonamiento o visión, por lo que no debe asumirse un rendimiento equivalente al de modelos Qwen oficiales.
- Model card mínima: no se documentan datos de entrenamiento, receta de destilación, contexto máximo ni formato exacto de tool calling.
- Riesgo de alucinación: inherente a modelos de 4B parámetros y agravado por la falta de evaluación; requiere validación en producción.
- Idiomas: aunque se declaran seis, no hay métricas por idioma; el español puede tener un soporte desigual.
- Licencia Apache 2.0: permite uso comercial, pero al ser una conversión comunitaria conviene verificar la licencia y procedencia del modelo base Jackrong/Kestrel-4B-Coder antes de redistribuir.
- Cuantización 8-bit: puede degradar ligeramente la precisión respecto al checkpoint original; no se documenta qué capas se cuantizaron.
- Soporte limitado a MLX: no es directamente utilizable en vLLM, TGI o llama.cpp sin conversión adicional, pese a la etiqueta `gguf`.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los problemas estén reportados por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/OmAr-Kader-DeV/Kestrel-4B-Coder-mlx-8Bit
- Modelo base: https://huggingface.co/Jackrong/Kestrel-4B-Coder
- mlx-lm: https://github.com/ml-explore/mlx-lm
