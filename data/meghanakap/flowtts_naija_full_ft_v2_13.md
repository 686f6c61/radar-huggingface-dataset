# MeghanaKap/flowtts_naija_full_ft_v2_13

## Resumen

El modelo **MeghanaKap/flowtts_naija_full_ft_v2_13** es un modelo de lenguaje basado en Qwen2, desarrollado por MeghanaKap mediante fine-tuning sobre el modelo base YatharthS/MiraTTS. Cuenta con 505.882.368 parámetros (aproximadamente 506 millones) y está publicado con licencia Apache 2.0. El nombre del modelo ("flowtts", "naija") sugiere una posible orientación hacia sistemas de texto a voz y hacia la variante nigeriana del inglés, aunque la documentación disponible solo confirma la tarea de generación de texto (pipeline text-generation).

Este modelo fue entrenado con Unsloth, lo que permitió una aceleración del doble de velocidad en el entrenamiento, y con la librería TRL mediante fine-tuning supervisado (SFT). Su tamaño compacto lo hace adecuado para entornos con recursos limitados, aunque no se dispone de información detallada sobre el contexto, el dataset de entrenamiento ni las capacidades específicas más allá de la generación de texto en inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer) |
| Parametros totales | 505.882.368 (aprox. 506M) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2, un transformer de tipo causal. Según el autor, se trata de un modelo finetuneado a partir de YatharthS/MiraTTS. El entrenamiento se realizó con Unsloth, que optimiza el fine-tuning (2x más rápido), y con TRL, aplicando supervisión SFT. No se han documentado detalles sobre el dataset utilizado, el número de tokens de entrenamiento, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se especifica la longitud de contexto soportada.

## Capacidades

- Generación de texto en inglés (idioma declarado: en).
- Compatible con la librería Transformers y con text-generation-inference (TGI).
- Formato de pesos safetensors.
- Etiqueta "conversational" en HuggingFace, lo que indica un uso orientado a diálogo.
- No consta soporte para tool calling, función de llamada a herramientas ni capacidades multimodales.

## Casos de uso

- Asistente de atención al cliente en inglés para entornos con recursos limitados: al ser un modelo de ~506M, puede ejecutarse en CPU o en GPUs de gama baja y gestionar conversaciones sencillas.
- Generación de texto en dispositivos edge: su tamaño reducido permite su despliegue en smartphones, Raspberry Pi o sistemas embebidos mediante cuantización.
- Fine-tuning para tareas específicas: al ser un modelo pequeño, es adecuado para adaptarlo a clasificación de textos, extracción de entidades o análisis de sentimiento con pocos datos.
- Autocompletado de textos en aplicaciones de escritura: puede integrarse en editores o entornos de desarrollo para sugerir texto en inglés.
- Prototipos de chatbots para investigación: gracias a su licencia Apache 2.0 y su compatibilidad con vLLM, Ollama o llama.cpp, facilita la experimentación rápida.
- Soporte a sistemas de texto a voz si se sigue la línea del nombre del modelo: aunque no está documentado, el nombre "flowtts" apunta a un posible uso como componente de generación de texto para síntesis de voz. Esta aplicación requiere verificación adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en FP16. Con cuantización 4-bit se reduce a unos 0,4 GB, más overhead.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM, por ejemplo RTX 3060, RTX 4050 o equivalentes.
- También puede ejecutarse en CPU utilizando llama.cpp o en sistemas Apple Silicon con Ollama.
- Opciones de despliegue: vLLM, text-generation-inference, transformers, llama.cpp, Ollama.
- Sin datos publicados de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas |
|---|---|---|---|---|
| flowtts_naija_full_ft_v2_13 | 505,9M | no disponible | Apache 2.0 | Inglés |
| Qwen2-0.5B | 494M | 32K | Apache 2.0 | Multilingüe |
| Qwen2.5-0.5B | 494M | 32K | Apache 2.0 | Multilingüe |

No se disponen de benchmarks comparativos para estos modelos en la información consultada.

## Limitaciones y advertencias

- Modelo pequeño (506M): mayor riesgo de alucinaciones y de menor coherencia en razonamientos complejos en comparación con modelos de mayor escala.
- Documentación escasa: no se especifica el dataset de entrenamiento, lo que dificulta evaluar sesgos y comportamiento en dominios concretos.
- Limitado a inglés: no se declara soporte para otros idiomas.
- Longitud de contexto no especificada: puede ser inferior a la estándar de Qwen2.
- Sin soporte documentado para tool calling, visión u otros formatos multimodales.
- Licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución y cumplir el aviso de licencia.
- No se han publicado evaluaciones específicas de seguridad o alineación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MeghanaKap/flowtts_naija_full_ft_v2_13
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Qwen2-0.5B: https://huggingface.co/Qwen/Qwen2-0.5B
- YatharthS/MiraTTS: enlace directo no disponible en la información consultada.
