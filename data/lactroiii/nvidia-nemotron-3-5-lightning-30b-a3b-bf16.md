# lactroiii/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 es un modelo de lenguaje de gran tamano (LLM) desarrollado por NVIDIA, publicado en agosto de 2026. Se trata de la version de precision completa (BF16) de Nemotron 3.5 Lightning, un modelo de razonamiento y chat de proposito general con una arquitectura hibrida de Mezcla de Expertos (MoE) que combina capas Mamba-2, capas MoE y capas de atencion selectivas. Con 30.000 millones de parametros totales y solo 3.000 millones activos por token, ofrece un equilibrio entre capacidad y eficiencia computacional.

El modelo esta disenado principalmente como punto de partida para personalizacion: post-entrenamiento (SFT, RL, destilacion), adaptacion a dominios especificos y creacion de variantes cuantizadas. Soporta una ventana de contexto de hasta 1 millon de tokens en hardware Blackwell y 256K en una unica GPU H100 o A100 de 80GB. Incluye soporte para decodificacion especulativa mediante DSpark y un modo de razonamiento configurable a traves de la plantilla de chat.

La relevancia de este modelo radica en su arquitectura hibrida innovadora, su eficiencia (solo 3B activos de 30B totales) y su licencia OpenMDW-1.1 que permite uso comercial. Esta disponible en seis idiomas: ingles, espanol, frances, aleman, italiano y japones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida: Mamba-2 + MoE + Attention intercaladas |
| Parametros totales | 31.577.937.344 (30B) |
| Parametros activos | 3.000 millones (3B) |
| Longitud de contexto | Hasta 1M tokens (256K en una sola H100/A100 80GB) |
| Tipos de cuantizacion | BF16 (referencia); NVFP4 disponible en variante separada; GGUF disponible via ggml-org |
| Idiomas soportados | Ingles (y lenguajes de programacion), espanol, frances, aleman, italiano, japones |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Nemotron 3.5 Lightning emplea una arquitectura hibrida de Mezcla de Expertos latente (LatentMoE) que intercala capas Mamba-2 (modelos de espacio de estados), capas MoE y capas de atencion selectivas. Esta combinacion busca aprovechar las ventajas de cada paradigma: la eficiencia lineal de Mamba-2 para secuencias largas, la especializacion de los expertos MoE y la capacidad de recuperacion de contexto de la atencion. El modelo activa solo 3.000 millones de sus 30.000 millones de parametros por token, lo que reduce significativamente el coste computacional por inferencia.

Los datos de pre-entrenamiento tienen una fecha de corte de septiembre de 2025 e incluyen un corpus amplio de datos curados y generados sinteticamente de alta calidad. Los datos de post-entrenamiento tienen una fecha de corte de mayo de 2026 e incluyen los datasets `nvidia/nemotron-post-training-v3` y `nvidia/nemotron-pre-training-datasets`. El modelo se ha entrenado en ingles, 19 idiomas hablados adicionales y 43 lenguajes de programacion en su version base, aunque la version de chat aqui descrita soporta oficialmente seis idiomas. El proceso de post-entrenamiento incluye ajuste por instrucciones y probablemente tecnicas de aprendizaje por refuerzo, aunque los detalles exactos no estan disponibles en la informacion proporcionada.

Una innovacion destacable es el soporte de decodificacion especulativa mediante DSpark para despliegues de centro de datos con baja concurrencia, lo que acelera la generacion de texto. El modo de razonamiento (thinking mode) es configurable activandolo o desactivandolo mediante la plantilla de chat (`enable_thinking=True/False`).

## Capacidades

- Generacion de texto y chat conversacional en seis idiomas: ingles, espanol, frances, aleman, italiano y japones.
- Razonamiento y capacidades de codigo, disenado para tareas de instruccion complejas y desarrollo de software.
- Modo de razonamiento configurable (thinking mode) activable o desactivable via plantilla de chat.
- Soporte de decodificacion especulativa mediante DSpark para acelerar la inferencia en despliegues de baja concurrencia.
- Adecuado para sistemas de agentes de IA, chatbots, sistemas RAG y aplicaciones de seguimiento de instrucciones.
- Capacidades multilingues, aunque el enfoque principal es ingles y lenguajes de programacion.
- Compatible con vLLM y SGLang para inferencia optimizada.
- Modelo de solo texto, sin capacidades de vision o audio.

## Casos de uso

- Desarrollo de agentes de IA: el modelo puede integrarse en pipelines de agentes que requieren razonamiento multi-paso y toma de decisiones, gracias a su modo de razonamiento configurable y su capacidad para manejar secuencias largas de hasta 1M tokens en hardware adecuado.
- Sistemas de atencion al cliente automatizada: con soporte para seis idiomas y una ventana de contexto amplia, puede gestionar conversaciones multi-turno complejas con historial extenso, manteniendo coherencia y contexto.
- Generacion de codigo en produccion: sus capacidades de codigo y razonamiento lo hacen adecuado para integrarse en pipelines de CI/CD, generacion de documentacion tecnica o asistentes de programacion.
- Sistemas RAG (Retrieval-Augmented Generation): la ventana de contexto de hasta 256K tokens en una sola GPU permite procesar documentos extensos y realizar busquedas semanticas sobre grandes volumenes de texto.
- Personalizacion y fine-tuning: al ser la version de referencia en BF16, es el punto de partida ideal para realizar SFT, RL o destilacion hacia modelos mas pequenos en dominios especificos como legal, medico o financiero.
- Investigacion y evaluacion: su arquitectura hibrida (Mamba-2 + MoE + Attention) lo convierte en un objeto de estudio interesante para investigacion academica sobre eficiencia de modelos y arquitecturas alternativas al transformer clasico.
- Traduccion y procesamiento multilingue: con soporte para seis idiomas, puede utilizarse en pipelines de traduccion automatica o normalizacion de texto multilingue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card hace referencia a una grafica de precision (`accuracy_plot.png`) pero no se incluyen los datos numericos en el README proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 ocupa aproximadamente 65.8 GB en disco, por lo que requiere al menos una GPU con 80GB de VRAM para inferencia en precision completa.
- GPU recomendadas: NVIDIA Blackwell (GB200, B200), NVIDIA Hopper (H100, H200) y NVIDIA Ampere (A100 80GB). Se valida despliegue en una unica H100 80GB o A100 80GB con contexto de 256K.
- En consumer GPU: no es viable en precision BF16 por requisitos de VRAM. Para RTX 5090, DGX Spark o RTX 6000 Pro se recomienda la variante NVFP4 cuantizada o el checkpoint GGUF.
- Opciones de despliegue: vLLM (version `vllm/vllm-openai:v0.27.1` o superior), SGLang, y para dispositivos locales llama.cpp via GGUF.
- Configuraciones validadas: una unica H100 80GB con 256K de contexto; 8x H100 con tensor parallelism (TP8) y expert parallelism (EP) para 1M de contexto; GB200 con vLLM y DSpark para 1M; B200 con SGLang para 1M.
- Parametros recomendados de sampling: temperatura 1.0, top_p 0.95.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|---|
| Nemotron 3.5 Lightning 30B A3B | 30B | 3B | 256K-1M | Mamba-2 + MoE + Attention | OpenMDW-1.1 |
| Nemotron 3.5 Lightning 30B A3B NVFP4 | 30B | 3B | 256K-1M | Mamba-2 + MoE + Attention | OpenMDW-1.1 |
| Nemotron 3.5 Lightning 30B A3B Base | 30B | 3B | no disponible | Mamba-2 + MoE + Attention | OpenMDW-1.1 |

La comparativa directa con modelos de otras familias (como Llama, Mistral o Qwen) no esta disponible en la informacion proporcionada. La variante NVFP4 esta optimizada para inferencia con mayor throughput, mientras que la version Base es el modelo pre-entrenado sin post-entrenamiento para chat.

## Limitaciones y advertencias

- La version BF16 requiere al menos 80GB de VRAM, lo que limita su despliegue a GPU de gama alta profesional o centros de datos.
- Aunque soporta seis idiomas, el enfoque principal es ingles y lenguajes de programacion; el rendimiento en otros idiomas puede ser inferior.
- La licencia OpenMDW-1.1 permite uso comercial pero tiene condiciones especificas que deben revisarse en el enlace proporcionado.
- El modelo es de solo texto; no soporta entradas de vision, audio ni video.
- No se han publicado resultados de benchmarks en la informacion disponible, por lo que no es posible evaluar su rendimiento relativo frente a alternativas.
- La fecha de corte de los datos de pre-entrenamiento es septiembre de 2025, por lo que puede tener conocimiento limitado de eventos posteriores.
- Riesgo de alucinacion inherente a todos los modelos de lenguaje; se recomienda validacion humana para aplicaciones criticas.
- Para produccion a gran escala se recomienda usar la variante NVFP4, ya que la version BF16 esta pensada principalmente para personalizacion e investigacion.
- El despliegue con contexto de 1M tokens requiere hardware Blackwell o configuraciones multi-GPU con TP8 + EP, lo que aumenta la complejidad operativa.

## Enlaces

- [Modelo en HuggingFace (version BF16)](https://huggingface.co/lactroiii/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16)
- [Modelo oficial de NVIDIA en HuggingFace (NVFP4)](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4)
- [Modelo base en HuggingFace](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-Base-BF16)
- [Checkpoint GGUF](https://huggingface.co/ggml-org/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF)
- [Pagina del modelo en NVIDIA NIM](https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b)
- [Model card en NVIDIA Build](https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard)
- [Documentacion de NVIDIA para Nemotron 3.5 Lightning](https://docs.nvidia.com/nim/large-language-models/latest/get-started/advanced/get-started-nemotron-3.5-lightning.html)
- [Catalogo NGC de NVIDIA](https://catalog.ngc.nvidia.com/orgs/nim/nvidia/models/nemotron-3.5-lightning)
- [API de NVIDIA NIM](https://docs.api.nvidia.com/nim/reference/nvidia-nemotron-3-5-lightning-30b-a3b)
- [Licencia OpenMDW-1.1](https://openmdw.ai/license/1-1/)
- [Pagina de desarrollador de Nemotron](https://developer.nvidia.com/nemotron)
- [Servidor Discord de NVIDIA AI Developer](https://discord.gg/9xpKQtVvrk)
