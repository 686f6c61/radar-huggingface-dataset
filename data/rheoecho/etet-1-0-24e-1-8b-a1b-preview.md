# RheoEcho/ETET-1.0-24E-1.8B-A1B-Preview

## Resumen

ETET-1.0-24E-1.8B-A1B-Preview es un modelo multimodal de tipo mixture-of-experts (MoE) desarrollado por RheoEcho, construido sobre la arquitectura ETETMoE. Parte del modelo denso MiniCPM5-1B-SFT y lo convierte a una arquitectura MoE mediante la técnica *Dense-to-MoE Sparse Upcycling*, combinando el codificador de visión SigLIP-HD con un modelo de lenguaje modificado. El objetivo es ofrecer comprensión multimodal (imagen-texto) en inglés y chino (simplificado y tradicional) a una escala de entre 1 y 2 mil millones de parámetros, con especial énfasis en ejecutar tanto la inferencia como el entrenamiento completo en dispositivos de bajos recursos.

El modelo cuenta con aproximadamente 1.800 millones de parámetros totales (incluyendo el codificador de visión), de los cuales solo alrededor de 1.000 millones se activan por token gracias al enrutamiento Top-1 en las capas MoE. Su ventana de contexto alcanza los 131.072 tokens, lo que permite manejar secuencias largas. Se distribuye bajo licencia Apache-2.0 y se publica como una versión *Preview*: los pesos han sido ajustados durante un número limitado de pasos y no está recomendado para entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ETETMoE_LLAMA (SigLIP-HD + ETETVisionConnector + ETETMoE + LlamaForCausalLM) |
| Parametros totales | ~1,8 B (incluye codificador de visión) |
| Parametros activos | ~1 B (Top-1 routing, 1 de 3 expertos por capa MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16 safetensors) |
| Idiomas soportados | Inglés, chino simplificado, chino tradicional |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ETETMoE_LLAMA, que combina un codificador de visión SigLIP-HD con un conector de visión propio (ETETVisionConnector) y un modelo de lenguaje de estilo Llama. El modelo de lenguaje tiene 24 capas: las capas 0 a 15 son FFN densas estándar de LlamaForCausalLM, mientras que las capas 16 a 23 son capas MoE personalizadas con 3 expertos por capa y enrutamiento Top-1, lo que activa solo un experto por token. En total hay 24 instancias de expertos.

El entrenamiento parte del modelo MiniCPM5-1B-SFT y aplica la técnica *Dense-to-MoE Sparse Upcycling* del proyecto ETETMoE, que convierte un modelo denso en uno MoE sin partir de cero. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La versión actual es un *Preview* con un ajuste fino limitado, orientado a investigación y experimentación comunitaria.

## Capacidades

- Comprensión multimodal: procesa imágenes de 512×512 píxeles, generando 1024 tokens de visión que se insertan en el placeholder `<image>`.
- Generación de texto y razonamiento: soporta bloques de pensamiento (`thinking… response`) para razonamiento encadenado.
- Multilingüe: inglés, chino simplificado y chino tradicional.
- No se documenta soporte explícito de *tool calling*, *function calling* ni capacidades de agente.
- No se documentan capacidades de audio ni vídeo.

## Casos de uso

- Atención al cliente automatizada en chino e inglés: gracias a su ventana de contexto de 131.072 tokens, puede gestionar conversaciones multi-turno largas y mantener el historial completo, adecuado para entornos de soporte en dispositivos de bajos recursos.
- Análisis de imágenes en dispositivos edge: al activar solo ~1 B de parámetros por token, puede ejecutarse en hardware limitado para tareas como clasificación de imágenes, extracción de texto de fotografías o descripción de escenas.
- Asistente de lectura de documentos: combina la entrada visual con generación de texto para resumir o responder preguntas sobre documentos escaneados, facturas o capturas de pantalla.
- Traducción multimodal: puede traducir texto presente en imágenes entre inglés y chino, útil en aplicaciones de viajes o comercio internacional.
- Prototipado de investigación: al ser una versión *Preview* con licencia Apache-2.0, sirve para experimentar con arquitecturas MoE eficientes y validar hipótesis antes de escalar a modelos mayores.
- Educación y demostraciones técnicas: permite mostrar en aulas o talleres cómo funciona un MoE multimodal sin necesidad de GPUs de alta gama, gracias a su bajo coste de inferencia.

## Benchmarks y rendimiento

El único benchmark publicado en la información disponible es MMLU (5-shot, 57 materias, ruta solo texto), medido con el framework de evaluación de ETETMoE:

| Modelo | MMLU (5-shot) |
|---|---|
| ETET-1.0-24E-1.8B-A1B-Preview | 48,27 % |
| MiniCPM5-1B-SFT | 53,02 % |
| Qwen3.5-0.8B (No Thinking) | 46,76 % |

No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay datos oficiales. Con pesos en BF16, el modelo de lenguaje ocupa aproximadamente 2,8 GB (1,42 B × 2 bytes) y el modelo completo ~3,6 GB. Con cuantización a 8 bits podría reducirse a ~1,8 GB, y a 4 bits a ~0,9 GB, aunque no se han publicado versiones cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM debería poder ejecutar el modelo en BF16 (por ejemplo, RTX 3060, RTX 4060, GTX 1660 Super con limitaciones). Para entrenamiento o fine-tuning se recomienda al menos 12 GB.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo de gama media y baja.
- Opciones de despliegue: el repositorio oficial proporciona `infer_tui.py` para chat por terminal. También puede integrarse con frameworks como vLLM, TGI o llama.cpp si se convierten los pesos al formato adecuado, aunque la carga requiere el repositorio ETETMoE por el layout especial de pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Params totales | Params activos | Contexto | MMLU (5-shot) | Licencia |
|---|---|---|---|---|---|
| ETET-1.0-24E-1.8B-A1B-Preview | ~1,8 B | ~1 B | 131.072 | 48,27 % | Apache-2.0 |
| MiniCPM5-1B-SFT | ~1 B | ~1 B | no disponible | 53,02 % | no disponible |
| Qwen3.5-0.8B (No Thinking) | ~0,8 B | ~0,8 B | no disponible | 46,76 % | no disponible |

El modelo base denso MiniCPM5-1B-SFT supera al ETET en MMLU, lo que es esperable en una versión *Preview* con ajuste limitado. Qwen3.5-0.8B, de menor tamaño, obtiene un resultado ligeramente inferior. No se dispone de datos comparativos con otros MoE multimodales de tamaño similar, como LiquidAI/LFM2-8B-A1B, en la información proporcionada.

## Limitaciones y advertencias

- Versión *Preview*: los pesos han sido ajustados durante un número limitado de pasos; no está recomendado para uso en producción.
- Rendimiento inferior al modelo base denso en MMLU (48,27 % frente a 53,02 %), probablemente debido al ajuste limitado.
- Solo soporta inglés y chino (simplificado y tradicional); no cubre otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas multimodales donde la interpretación de imágenes puede ser incorrecta.
- La carga de pesos requiere el repositorio ETETMoE o el script `infer_tui.py`; el uso directo con `LlamaForCausalLM.from_pretrained` no ensambla correctamente los pesos de los expertos.
- No se documentan sesgos específicos, pero al estar entrenado principalmente en inglés y chino, puede presentar sesgos culturales o lingüísticos en otros contextos.
- No se han publicado datos sobre latencia, throughput ni requisitos de VRAM oficiales.

## Enlaces

- HuggingFace: https://huggingface.co/RheoEcho/ETET-1.0-24E-1.8B-A1B-Preview
- Repositorio ETETMoE (GitHub): https://github.com/Rheoecho-Studio/ETETMoE
- Sitio web de RheoEcho: https://rheoecho.fyi/
