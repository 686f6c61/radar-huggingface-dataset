# Indianplays/Super1

## Resumen

Kimi K3 es un modelo de lenguaje multimodal nativo de tipo agente, publicado con pesos abiertos por Moonshot AI. Se trata de un Mixture-of-Experts (MoE) de 2,8 billones de parametros totales que activa aproximadamente 104.000 millones por token, lo que lo situa en la categoria de modelos de escala 3T. Segun la model card, es el primer modelo abierto de clase 3T y esta disenado para inteligencia de frontera en programacion de largo horizonte, trabajo de conocimiento y razonamiento.

La arquitectura introduce dos innovaciones propias: Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), combinadas con un esquema Stable LatentMoE que activa 16 de 896 expertos por token. El modelo incorpora vision nativa (texto, imagenes y video) y una ventana de contexto de un millon de tokens, lo que lo hace adecuado para tareas que requieren manejar repositorios completos, documentos extensos o sesiones de ingenieria prolongadas.

El repositorio de Hugging Face `Indianplays/Super1` es una publicacion de terceros (usuario Indianplays) que redistribuye los pesos de Kimi K3 en formato safetensors con cuantizacion de 8 bits mediante `compressed-tensors`. El tamano del repositorio es de 1561 GB y el pipeline declarado es `image-text-to-text`. La licencia es la Kimi K3 License (etiquetada como `other`), no una licencia permisiva estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes); 69 capas KDA + 24 Gated MLA |
| Parametros totales | 2,8 billones (2.779.931.837.184 segun safetensors) |
| Parametros activos | 104.000 millones |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8 bits (compressed-tensors) en esta publicacion; el modelo original admite otras segun la model card |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (etiqueta `other`) |
| Formato de pesos | safetensors (con `compressed-tensors`) |

## Arquitectura y entrenamiento

Kimi K3 es un transformer MoE con 93 capas (1 capa densa) y una composicion de atencion hibrida de 69 capas KDA y 24 capas Gated MLA. La dimension oculta de atencion es 7168, con 96 cabezas de atencion. El bloque MoE emplea una dimension latente de 3584 y una dimension oculta por experto de 3072, con 896 expertos en total y 16 seleccionados por token. Esta configuracion de esparsidad, junto con el framework Stable LatentMoE, reporta una mejora de eficiencia de escalado de aproximadamente 2,5x frente a Kimi K2, segun la model card.

La innovacion tecnica principal es la combinacion de Kimi Delta Attention (un mecanismo de atencion lineal/delta) con Attention Residuals, que permite sostener contextos de un millon de tokens con un coste de atencion mas contenido que la atencion cuadratica clasica. El modelo es multimodal nativo: procesa texto, imagenes y video en el mismo modelo, sin adaptadores separados segun la descripcion del autor. No se detalla en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF, DPO u otras tecnicas de alineacion.

## Capacidades

- Generacion de texto y razonamiento de proposito general.
- Programacion de largo horizonte: sesiones de ingenieria prolongadas, navegacion de repositorios grandes y orquestacion de herramientas de terminal.
- Razonamiento multi-paso y comportamiento agente con supervision humana minima.
- Vision nativa: comprension de imagenes y video dentro del mismo modelo.
- Contexto largo de 1.000.000 de tokens para documentos, repositorios y conversaciones extensas.
- Trabajo de conocimiento agente: investigacion profunda con visualizaciones, widgets, dashboards, diseno de movimiento y edicion de video.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque el enfoque agente y la orquestacion de terminal lo sugieren.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking explicito: no confirmado en la informacion disponible.

## Casos de uso

- Optimizacion de kernels de GPU: el modelo puede analizar codigo CUDA/Triton, proponer cambios y validar resultados en sesiones prolongadas, aprovechando su contexto de 1M tokens para mantener el estado del proyecto.
- Desarrollo de compiladores: dado su enfoque en programacion de largo horizonte, puede trabajar sobre bases de codigo de compiladores, escribir passes y ejecutar pruebas de forma iterativa.
- Navegacion y refactorizacion de repositorios grandes: con 1M tokens de contexto puede cargar arboles de repositorio extensos y razonar sobre dependencias sin trocear el codigo.
- Investigacion profunda automatizada: generar informes con visualizaciones interactivas, widgets y dashboards a partir de fuentes extensas, gracias a la combinacion de contexto largo y capacidades multimodales.
- Diseno de chips y CAD: la model card menciona explicitamente chip design y CAD como dominios de aplicacion, donde el modelo puede asistir en la generacion y revision de especificaciones tecnicas.
- Edicion de video y diseno de movimiento: al ser multimodal nativo, puede procesar video de entrada y asistir en tareas de edicion y generacion de contenido audiovisual.
- Desarrollo de videojuegos con vision en el bucle: la model card cita vision-in-the-loop game dev, donde el modelo interpreta capturas y ajusta el codigo del juego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 2,8T parametros totales y cuantizacion de 8 bits, el peso del modelo ronda 1,5 TB en disco, por lo que la inferencia requiere agregados multi-GPU de gran capacidad; no cabe en una sola GPU.
- GPU recomendadas: agregados de H100, H200 o B200 con suficiente memoria agregada; el despliegue en consumer GPU no es viable.
- Consumer GPU: no cabe en ninguna GPU de consumo (RTX 4090, 3090, etc.) ni en configuraciones multi-GPU de consumo razonables.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible para esta publicacion concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3 (esta ficha) | 2,8T | 104B | 1M tokens | Kimi K3 License | Pesos abiertos en HF |
| Kimi K2 | no disponible en la informacion | no disponible | no disponible | no disponible | Referenciado como predecesor |
| Otros modelos 3T-class abiertos | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con Kimi K2 como predecesor directo, del que se indica que K3 mejora la eficiencia de escalado en aproximadamente 2,5x. No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas para una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- La publicacion en Hugging Face es de un tercero (`Indianplays`), no del autor original Moonshot AI; conviene verificar la integridad de los pesos frente al repositorio oficial.
- La licencia Kimi K3 License no es una licencia permisiva estandar; es necesario revisar sus terminos antes de cualquier uso comercial.
- El modelo tiene 2,8T parametros y un repositorio de 1561 GB, lo que lo hace inaccesible para la mayoria de entornos de investigacion y desarrollo.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni evaluaciones de seguridad en la informacion proporcionada.
- Los idiomas soportados no estan declarados, por lo que el rendimiento en castellano no puede garantizarse.
- El contexto de 1M tokens no implica que el modelo utilice toda la ventana con la misma eficacia; no hay datos de rendimiento en contextos largos.
- El soporte de tool calling y de modo thinking no esta confirmado explicitamente en la informacion disponible.
- La cuantizacion a 8 bits de esta publicacion puede degradar el rendimiento respecto a los pesos originales en precision completa.

## Enlaces

- Repositorio Hugging Face de esta publicacion: https://huggingface.co/Indianplays/Super1
- Organizacion oficial en Hugging Face: https://huggingface.co/moonshotai
- Chat oficial: https://www.kimi.com
- Web de Moonshot AI: https://www.moonshot.ai
- Blog tecnico: https://www.kimi.com/blog/kimi-k3
- Informe tecnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Repositorio GitHub: https://github.com/MoonshotAI/Kimi-K3
- Twitter/X: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
