# FamilyOrang/Kimi-K3

## Resumen

Kimi K3 es un modelo de lenguaje multimodal nativo y de tipo agéntico, publicado como pesos abiertos por Moonshot AI. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 2,8 billones de parámetros totales y 104 000 millones de parámetros activos por token, lo que lo convierte en el primer modelo abierto de la clase de 3 billones de parámetros. Está construido sobre Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), con una ventana de contexto de 1 millón de tokens y capacidades nativas de visión y vídeo.

El modelo está disenado para inteligencia de frontera en tareas de codigo de largo horizonte, trabajo de conocimiento y razonamiento. Su diseno MoE activa 16 de 896 expertos mediante un framework Stable LatentMoE, lo que segun el autor supone una mejora de aproximadamente 2,5 veces en eficiencia de escalado respecto a Kimi K2. La version publicada en el repositorio `FamilyOrang/Kimi-K3` es una copia (posiblemente cuantizada a 8 bits segun los tags) del modelo original de Moonshot AI, con un peso de repositorio de 1561 GB.

La relevancia actual del modelo radica en que libera pesos de frontera de escala 3T bajo una licencia propia (Kimi K3 License), algo poco habitual en modelos de esta magnitud, y combina multimodalidad nativa con contexto extremadamente largo, lo que lo posiciona para aplicaciones agénticas complejas. No obstante, la informacion disponible sobre esta copia concreta es limitada: no se han publicado resultados de benchmarks en la model card accesible ni datos sobre idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes); 93 capas (1 densa), composicion 69 KDA + 24 Gated MLA |
| Parametros totales | 2 779 931 837 184 (~2,8 T) |
| Parametros activos | 104 000 millones (16 de 896 expertos) |
| Longitud de contexto | 1 000 000 tokens |
| Tipos de cuantizacion | 8-bit (segun tags del repo); otros tipos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (license: other, license_name: kimi-k3) |
| Formato de pesos | safetensors (compressed-tensors), transformers con custom_code |
| Dimension de atencion | 7168 |
| Cabezas de atencion | 96 |
| Dimension latente MoE | 3584 |
| Dimension oculta MoE (por experto) | 3072 |
| Numero de expertos | 896 |
| Pipeline | image-text-to-text |
| Version posterior | moonshotai/Kimi-K3.1-Pro |

## Arquitectura y entrenamiento

Kimi K3 emplea una arquitectura transformer MoE con 93 capas (una de ellas densa) y una composicion de atencion hibrida: 69 capas usan Kimi Delta Attention (KDA) y 24 usan Gated MLA (Multi-head Latent Attention). La dimension de atencion es de 7168 con 96 cabezas. El bloque MoE utiliza un framework Stable LatentMoE con dimension latente de 3584 y 896 expertos de dimension oculta 3072 cada uno, activando 16 expertos por token, lo que resulta en 104 000 millones de parametros activos. Esta configuracion de alta dispersidad busca mejorar la eficiencia de escalado respecto a generaciones anteriores.

El modelo incorpora capacidades multimodales nativas (texto, imagen y video) en un unico modelo, y soporta una ventana de contexto de 1 millon de tokens. No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion del dataset ni detalles sobre etapas de RLHF o DPO. Tampoco se detallan innovaciones como decodificacion especulativa o mecanismos de atencion lineal mas alla de la propia KDA. La model card menciona que el modelo esta disenado para tareas agenticas de largo horizonte, pero no se aportan datos concretos sobre el proceso de entrenamiento.

## Capacidades

- Generacion de texto y razonamiento de frontera en tareas complejas.
- Codigo de largo horizonte: sesiones de ingenieria sostenidas, navegacion de repositorios grandes y orquestacion de herramientas de terminal.
- Capacidades multimodales nativas: comprension de texto, imagenes y video dentro del mismo modelo.
- Contexto extremadamente largo: ventana de 1 millon de tokens.
- Trabajo de conocimiento agentico: investigacion profunda con visualizaciones interactivas, widgets y dashboards, diseno de movimiento y edicion de video.
- Soporte de tool calling / function calling (segun la orientacion agentica descrita en la model card; no se detalla el formato exacto).
- Razonamiento multi-paso y agentes autonomos con minima supervision humana.
- Capacidades multilingues: no disponible (no se especifican idiomas).
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Optimizacion de kernels de GPU: el modelo puede analizar codigo CUDA/Triton existente y proponer optimizaciones, navegando repositorios grandes gracias a su ventana de 1M tokens y su capacidad de orquestar terminales.
- Desarrollo de compiladores: sesiones de ingenieria sostenidas con minima supervision para implementar y depurar passes de compilacion sobre codebases extensas.
- Investigacion profunda automatizada: generacion de informes con visualizaciones interactivas, widgets y dashboards a partir de fuentes textuales y visuales, aprovechando la multimodalidad nativa.
- Edicion de video y diseno de movimiento: comprension de video de entrada y generacion de descripciones o guiones tecnicos para pipelines de produccion audiovisual.
- Asistencia en diseno CAD y diseno de chips: razonamiento sobre diagramas, planos e imagenes tecnicas combinado con contexto largo para mantener coherencia en proyectos extensos.
- Agente de terminal autonomo: ejecucion de tareas multi-paso en entornos de linea de comandos, con planificacion y uso de herramientas, adecuado por su orientacion agentica y su contexto de 1M tokens.
- Analisis de repositorios masivos: revision de codigo y documentacion de proyectos de gran escala en una sola pasada de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,8 T de parametros totales, incluso en cuantizacion 8-bit se requiere del orden de terabytes de memoria; el repositorio ocupa 1561 GB, lo que implica despliegues multi-GPU o multi-nodo.
- GPU recomendadas: clusters de A100/H100/H200 de 80 GB o superior; no es viable en una sola GPU convencional.
- Consumer GPU: no cabe en GPUs de consumo (RTX 4090, etc.) por el tamano del modelo.
- Opciones de despliegue: transformers con custom_code (segun la libreria declarada); otras opciones como vLLM, llama.cpp, Ollama o TGI no estan confirmadas en la informacion disponible.
- Latencia y throughput: no disponibles; con 104 000 millones de parametros activos, el coste por token es elevado y requiere infraestructura dedicada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3 (este) | ~2,8 T | 104 000 M | 1 000 000 | Kimi K3 License | Pesos abiertos en HF |
| Kimi K2 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Kimi-K3.1-Pro | no disponible | no disponible | no disponible | no disponible | Referenciado como new_version |

No se dispone en la informacion proporcionada de datos suficientes sobre Kimi K2 ni sobre otros modelos comparables de la misma clase para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: inherente a modelos generativos de gran escala; no se aportan evaluaciones especificas.
- Limitaciones de contexto o idioma: se declara contexto de 1M tokens, pero no se especifican idiomas soportados ni cobertura multilingue.
- Restricciones de licencia: la licencia Kimi K3 License (license: other) debe revisarse antes de uso comercial; no se detallan terminos en la informacion disponible.
- Caveats para produccion: el modelo requiere infraestructura de varios terabytes de VRAM, lo que limita su despliegue a entornos de centro de datos; la copia `FamilyOrang/Kimi-K3` tiene 0 descargas y 0 likes, por lo que su procedencia y fidelidad respecto al modelo original de Moonshot AI no estan verificadas.
- La model card accesible esta truncada en la informacion proporcionada; faltan detalles sobre entrenamiento, benchmarks y condiciones de uso.

## Enlaces

- Repositorio Hugging Face (copia): https://huggingface.co/FamilyOrang/Kimi-K3
- Organizacion Moonshot AI en Hugging Face: https://huggingface.co/moonshotai
- Modelo original referenciado: https://huggingface.co/moonshotai/Kimi-K3
- Version posterior: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Blog tecnico: https://www.kimi.com/blog/kimi-k3
- Informe tecnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Repositorio GitHub: https://github.com/MoonshotAI/Kimi-K3
- Licencia: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Web oficial: https://www.moonshot.ai
- Chat: https://www.kimi.com
- Twitter: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
