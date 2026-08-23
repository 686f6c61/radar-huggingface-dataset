# Rootport/Nz-Gemma4-12B-LTX25

## Resumen

Nz-Gemma4-12B-LTX25 es un archivo de pesos en formato GGUF que contiene el codificador de texto (text encoder) del modelo de generación de vídeo LTX 2.5 de Lightricks, específicamente la variante basada en Gemma 4 de Google DeepMind. El archivo ha sido producido por Rootport, que ha convertido el checkpoint original `gemma4-12b-with-proj-ltx-2.5-bf16.safetensors` (de 26,26 GB) a GGUF con cuantización mixta Q4_K/Q6_K, reduciendo su tamaño a 9,2 GB. Este codificador se utiliza exclusivamente dentro del plugin Nz-Videomni para el editor de vídeo AviUtl2, donde convierte las instrucciones del prompt en representaciones que el modelo de generación de vídeo LTX 2.5 puede procesar.

El modelo base es un fine-tune de Gemma 4 (Apache License 2.0) realizado por Lightricks para servir como componente del pipeline LTX 2.5. No es un modelo de propósito general ni un generador de vídeo en sí mismo: es un pieza intermedia del sistema. Su relevancia radica en que permite ejecutar la parte de interpretación de prompts de LTX 2.5 de forma eficiente en hardware local gracias a la cuantización, manteniendo la calidad del texto mediante passthrough de tensores críticos en BF16.

El archivo está pensado para ser colocado en la estructura de directorios de Nz-VideoTmi (`models/LTX25/TextEncoder/`), junto con los pesos del generador, VAE y upscaler que se distribuyen en un repositorio separado. No es compatible con otros usos ni con versiones anteriores de LTX.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4 12B, encoder-free) |
| Parámetros totales | 13.147.985.090 (13,15 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M (mixta: 328 tensores Q4_K, 2 Q6_K, 356 passthrough: 351 BF16, 5 I8) |
| Idiomas soportados | Japonés, inglés |
| Licencia | LTX-2.x Community License Agreement (versión 2026-08-11) + Apache License 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Gemma 4 12B (Google DeepMind) realizado por Lightricks específicamente para actuar como codificador de texto del pipeline de generación de vídeo LTX 2.5. Se trata de un transformer encoder-free, es decir, sin módulo de visión separado, aunque en este contexto solo se usa la rama de texto. La versión original en safetensors (bf16) fue convertida a GGUF por Rootport mediante la herramienta `Nz-GGUF-Converter-LTX23` (v1.2.0, commit `905f348`). La conversión conserva el 52% de los tensores en su precisión original (BF16 o I8) para mantener la calidad de representación, mientras que el resto se cuantiza a Q4_K y Q6_K. No se dispone de información sobre el dataset de entrenamiento ni sobre el proceso de ajuste (no se menciona RLHF/DPO). El modelo no es un LLM general: su única función es transformar prompts en representaciones internas para LTX 2.5.

## Capacidades

- Interpretación de prompts en japonés e inglés para el generador de vídeo LTX 2.5.
- Generación de embeddings de texto con proyección específica para el modelo de difusión de LTX 2.5.
- Integración con el plugin Nz-VideoTmi para AviUtl2, permitiendo generar vídeo a partir de texto.
- No es un chatbot ni un modelo de conversación; no admite tool calling, agentes ni razonamiento multi-paso.
- No procesa vídeo ni audio de entrada; solo texto.
- No es compatible con otros modelos de vídeo ni con la versión LTX 2.3 (que usa un text encoder basado en Gemma 3).

## Casos de uso

- Generación de vídeo desde prompts en AviUtl2: el usuario escribe una descripción de la escena, y el text encoder la convierte en las representaciones que el modelo de difusión LTX 2.5 usa para sintetizar el vídeo. Es el componente que interpreta la intención del usuario.
- Automatización de producción de vídeo: mediante scripts que llamen al plugin Nz-VideoTmi, se pueden generar múltiples clips con prompts variables, útil para storyboards o previsualizaciones.
- Investigación en generación de vídeo: los investigadores pueden estudiar cómo el codificador de texto influye en la calidad del vídeo generado, comparando este modelo con el de LTX 2.3 o con otros encoders.
- Desarrollo de herramientas de edición de vídeo: sirve como componente de un pipeline local para añadir generación de vídeo a flujos de trabajo de edición no lineal.
- Prototipado de aplicaciones de IA generativa: como parte de un sistema de generación de vídeo, permite evaluar la viabilidad de usar LTX 2.5 en entornos con recursos limitados gracias a su tamaño reducido.
- Creación de contenido educativo o tutoriales: los creadores pueden generar vídeos de demostración a partir de texto sin necesidad de un modelo completo en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de comparaciones cuantitativas con otros codificadores de texto para generación de vídeo.

## Requisitos de hardware

- Tamaño del archivo GGUF: 9,2 GB. El modelo se carga en memoria como parte del pipeline de LTX 2.5, por lo que la VRAM total necesaria depende del resto de componentes (transformer, VAE, upscaler).
- Para el text encoder solo, se estima que necesita entre 8 y 12 GB de VRAM según la cuantización y el contexto de prompts. Es compatible con GPUs de consumo como RTX 3060 12GB, RTX 4070 12GB, o superiores.
- El plugin Nz-VideoTmi está diseñado para ejecutarse localmente en AviUtc2, por lo que la inferencia se realiza en la GPU del usuario. No se proporcionan datos de latencia o throughput.
- Opciones de despliegue: exclusivo para el plugin Nz-VideoTmi (no es un modelo independiente). No soporta vLLM, Ollama ni TGI.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Contexto | Licencia | Uso |
|---|---|---|---|---|---|
| Nz-Gemma4-12B-LTX25 | 13,15 B | GGUF (Q4_K_M) | No disponible | LTX-2.x + Apache 2.0 | Text encoder para LTX 2.5 |
| Nz-Gemma3-12B (LTX 2.3) | 12 B (estimado) | GGUF | No disponible | LTX-2.x + Apache 2.0 | Text encoder para LTX 2.3 |
| Lightricks/LTX-2.5 (original) | No disponible | safetensors (bf16) | No disponible | LTX-2.x Community | Text encoder + generador |

La comparativa es limitada porque no existen datos públicos de rendimiento. La principal diferencia con el original de Lightricks es el formato (GGUF vs safetensors) y el tamaño (9,2 GB vs 26,1 GB). Con respecto al text encoder de LTX 2.3 (Gemma 3), no son intercambiables: cada uno está afinado para su versión del modelo.

## Limitaciones y advertencias

- No es un modelo de lenguaje general: no sirve para chat, generación de texto ni razonamiento. Intentar usarlo fuera de LTX 2.5 produce resultados inesperados.
- No es compatible con LTX 2.3 ni con el text encoder de Gemma 3. Tampoco con la versión original de LTX 2.5 en safetensors si se mezclan componentes.
- Licencia dual: la licencia LTX-2.x Community License Agreement impone restricciones de uso comercial y distribución. La licencia Apache 2.0 se aplica al modelo base Gemma 4, pero el conjunto completo está sujeto a la licencia de Lightricks.
- Solo soporta idiomas japonés e inglés; los prompts en otros idiomas pueden degradar la calidad de la generación.
- La cuantización Q4_K_M introduce pérdida de precisión en comparación con el original bf16, aunque el passthrough de tensores críticos mitiga el impacto.
- Riesgo de alucinación en la interpretación de prompts ambiguos o complejos, como cualquier modelo de lenguaje.
- El proyecto es una iniciativa independiente de Rootport, no es una distribución oficial de Google DeepMind ni de Lightricks, y no cuenta con soporte técnico de estas empresas.
- El archivo requiere el plugin Nz-VideoTmi y los pesos adicionales de LTX 2.5 (generador, VAE, upscaler) para funcionar; no es autónomo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Rootport/Nz-Gemma4-12B-LTX25
- Repositorio de pesos LTX 2.5: https://huggingface.co/Rootport/Nz-LTX25-weights
- Plugin Nz-VideoTmi: https://github.com/Rootport-AI/Nz-VideoTmi
- Herramienta de conversión Nz-GGUF-Converter-LTX23: https://github.com/Rootport-AI/Nz-GGUF-Converter-LTX23
- Modelo original Lightricks/LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
- Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Documentación de Gemma 4 12B: https://developers.googleblog.com/gemma-4-12b-the-developer-guide/
- Gemma 4 12B en Ollama: https://ollama.com/library/gemma4:12b
