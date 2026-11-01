# arbonquants/Kimi-K3

## Resumen

Kimi K3 es un modelo de lenguaje multimodal nativo y de pesos abiertos desarrollado por Moonshot AI, presentado como el modelo mas capaz de la familia Kimi hasta la fecha. Con 2,8 billones de parametros totales y 104 mil millones de parametros activos por token, se posiciona como el primer modelo abierto de clase 3T, disenado para inteligencia de frontera en tareas de codigo de largo horizonte, trabajo de conocimiento y razonamiento. La version alojada en HuggingFace bajo el identificador `arbonquants/Kimi-K3` es una publicacion de terceros (usuario `arbonquants`) que redistribuye los pesos en formato `compressed-tensors` de 8 bits.

Arquitectonicamente, Kimi K3 introduce dos innovaciones principales: Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), combinadas con un esquema Mixture-of-Experts (MoE) de alta dispersion denominado Stable LatentMoE, que activa 16 de 896 expertos por token. El modelo incorpora vision nativa y una ventana de contexto de 1 millon de tokens, lo que lo hace adecuado para tareas agénticas de largo recorrido sobre repositorios extensos, documentos multiples y flujos de trabajo con herramientas.

La relevancia actual de Kimi K3 radica en su combinacion de escala de frontera con licencia abierta (Kimi K3 License), lo que permite a investigadores y desarrolladores desplegar y adaptar un modelo de capacidad comparable a los sistemas propietarios de primera linea. No obstante, su enorme huella de parametros (1.561 GB en el repositorio) implica requisitos de hardware muy elevados para inferencia local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2.779.931.837.184 (2,8T) |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit (compressed-tensors); no se detallan otras variantes en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (license: other, license_name: kimi-k3) |
| Formato de pesos | safetensors con compressed-tensors (8-bit) |

## Arquitectura y entrenamiento

Kimi K3 se construye sobre una arquitectura transformer con Mixture-of-Experts de alta dispersion. El modelo cuenta con 93 capas (1 capa densa y el resto con componentes MoE), una dimension oculta de atencion de 7168 y 96 cabezas de atencion. La composicion de capas de atencion combina 69 capas con Kimi Delta Attention (KDA) y 24 capas con Gated MLA (Multi-head Latent Attention). La dimension latente del MoE es de 3584 y cada experto tiene una dimension oculta de 3072. El framework Stable LatentMoE activa 16 de 896 expertos por token, lo que segun el autor proporciona una mejora aproximada de 2,5x en eficiencia de escalado respecto a Kimi K2.

La innovacion tecnica principal reside en la combinacion de KDA (un mecanismo de atencion con estado recurrente que reduce el coste computacional en contextos largos) y AttnRes (residuos de atencion que mejoran la propagacion de informacion entre capas). El modelo es multimodal nativo: procesa texto, imagenes y video dentro del mismo modelo, sin adaptadores externos. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento de largo horizonte, orientado a tareas de ingenieria y conocimiento.
- Codigo: sesiones de ingenieria prolongadas, navegacion de repositorios masivos, orquestacion de herramientas de terminal, optimizacion de kernels de GPU, desarrollo de compiladores, desarrollo de videojuegos con vision en el bucle, CAD y diseno de chips.
- Vision nativa: comprension de imagenes y video integrada en el mismo modelo.
- Contexto largo: ventana de 1 millon de tokens para documentos multiples y repositorios extensos.
- Trabajo de conocimiento agéntico: investigacion profunda con visualizaciones interactivas, widgets, dashboards, diseno de movimiento y edicion de video.
- Soporte de tool calling / function calling: implicito en su naturaleza agéntica y orquestacion de herramientas de terminal (no se detalla la API exacta en la informacion disponible).
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Ingenieria de software de largo recorrido: el modelo puede mantener sesiones de desarrollo prolongadas con supervision humana minima, navegando repositorios de gran tamano y orquestando herramientas de terminal, gracias a su contexto de 1M tokens y su entrenamiento orientado a codigo agéntico.
- Optimizacion de kernels de GPU y desarrollo de compiladores: Kimi K3 esta disenado explicitamente para tareas de bajo nivel como optimizacion de kernels y desarrollo de compiladores, donde el razonamiento sobre codigo y la iteracion con herramientas de compilacion son criticos.
- Investigacion profunda automatizada: genera informes de investigacion con visualizaciones interactivas, widgets y dashboards, aprovechando su capacidad multimodal para combinar texto, imagenes y datos estructurados.
- Edicion de video y diseno de movimiento: su arquitectura multimodal nativa permite comprender y generar contenido audiovisual, adecuado para flujos de postproduccion asistida.
- Desarrollo de videojuegos con vision en el bucle: el modelo puede integrar vision en el ciclo de desarrollo, analizando capturas o video del juego para iterar sobre mecanicas y diseno.
- Diseno asistido por ordenador (CAD) y diseno de chips: tareas de ingenieria visual donde el modelo combina comprension de imagenes tecnicas con razonamiento sobre especificaciones y restricciones.
- Analisis de documentacion tecnica extensa: con 1M tokens de contexto, puede procesar manuales, normativas o bases de codigo completas en una sola pasada para responder consultas o generar resumenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,8T de parametros totales, incluso en cuantizacion de 8 bits los pesos ocupan aproximadamente 2,8 TB, por lo que se requiere un cluster multi-GPU de gran escala. No es viable en una sola GPU.
- GPU recomendadas: se necesitan nodos con multiples aceleradores de alta gama (H100, H200, B200 o equivalentes) distribuidos en varios nodos. No se dispone de configuraciones oficiales en la informacion proporcionada.
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090, 5090, etc.) ni en estaciones de trabajo individuales.
- Opciones de despliegue: la model card indica `transformers` como libreria; el formato `compressed-tensors` sugiere soporte en ecosistemas como vLLM con cuantizacion comprimida. No se detallan opciones de llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3 | 2,8T | 104B | 1M tokens | Kimi K3 License | Pesos abiertos en HuggingFace |
| Kimi K2 | no disponible | no disponible | no disponible | no disponible | Pesos abiertos (referencia del autor) |
| Modelos propietarios de frontera (GPT, Claude, Gemini) | no disponible | no disponible | no disponible | Propietaria | Solo API |

La informacion proporcionada solo permite comparar con Kimi K2, del que se menciona una mejora de 2,5x en eficiencia de escalado, pero sin datos numericos de parametros, contexto o rendimiento. No se dispone de datos de benchmarks para establecer comparaciones cuantitativas con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion proporcionada; cabe esperar sesgos derivados de los datos de entrenamiento, no documentados.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como modelo generativo de gran escala, es susceptible de producir contenido facticamente incorrecto, especialmente en tareas de investigacion profunda.
- Limitaciones de contexto o idioma: el contexto es de 1M tokens, pero no se especifican los idiomas soportados ni su calidad relativa.
- Restricciones de licencia: la Kimi K3 License es una licencia "other" con terminos especificos que deben revisarse antes de uso comercial; no se detallan en la informacion proporcionada.
- Caveat de produccion: la publicacion en HuggingFace es de un tercero (`arbonquants`), no del autor original (Moonshot AI), con solo 18 descargas y 0 likes; se recomienda verificar la integridad de los pesos y preferir el repositorio oficial `moonshotai/Kimi-K3` si esta disponible.
- Requisitos de hardware extremos: 2,8T de parametros y 1.561 GB de repositorio hacen inviable el despliegue fuera de infraestructura de datacenter.
- La model card esta truncada en la informacion proporcionada, por lo que pueden faltar detalles sobre entrenamiento, evaluacion y limitaciones.

## Enlaces

- HuggingFace (redistribucion de terceros): https://huggingface.co/arbonquants/Kimi-K3
- HuggingFace oficial de Moonshot AI: https://huggingface.co/moonshotai
- Repositorio oficial (referenciado en la model card): https://huggingface.co/moonshotai/Kimi-K3
- Blog tecnico: https://www.kimi.com/blog/kimi-k3
- Informe tecnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Licencia: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Chat: https://www.kimi.com
- Homepage: https://www.moonshot.ai
- Twitter: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
