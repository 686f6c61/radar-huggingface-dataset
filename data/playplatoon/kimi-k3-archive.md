# playplatoon/Kimi-K3-archive

## Resumen
Kimi K3 es un modelo de lenguaje multimodal nativo de tipo Mixture-of-Experts (MoE) desarrollado por Moonshot AI. Con 2,8 billones de parametros totales y 104.000 millones activados por token, se presenta como el primer modelo abierto de clase 3T, disenado para razonamiento de largo horizonte, trabajo de conocimiento agentico y generacion de codigo en entornos de ingenieria complejos. La arquitectura combina Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) con un marco Stable LatentMoE que activa 16 de 896 expertos, lo que segun el autor supone una mejora de aproximadamente 2,5x en eficiencia de escalado frente a Kimi K2.

El modelo incorpora capacidades de vision nativa y una ventana de contexto de 1 millon de tokens, lo que le permite procesar texto, imagenes y video dentro de la misma arquitectura. Esta orientado a tareas que requieren supervision humana minima, como sesiones largas de ingenieria, navegacion de repositorios masivos, orquestacion de herramientas de terminal, desarrollo de kernels de GPU, compiladores, CAD o diseno de chips.

La ficha corresponde al repositorio `playplatoon/Kimi-K3-archive`, una copia no oficial de los pesos publicada por un tercero. El repositorio ocupa 1561 GB y contiene pesos en formato safetensors con cuantizacion de 8 bits mediante compressed-tensors. La licencia declarada es "kimi-k3", una licencia propia de Moonshot AI distinta de las licencias open source estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2.779.931.837.184 (2,8T) |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8 bits (compressed-tensors); no se detallan otras variantes en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3 (licencia propia, etiquetada como "other") |
| Formato de pesos | safetensors (transformers, custom_code) |

## Arquitectura y entrenamiento
Kimi K3 es un transformer MoE con 93 capas, de las cuales una es densa. La composicion de capas de atencion es de 69 capas KDA (Kimi Delta Attention) y 24 capas Gated MLA (Multi-head Latent Attention con compuerta). La dimension oculta de atencion es 7168 con 96 cabezas de atencion. El componente MoE utiliza una dimension latente de 3584 y una dimension oculta por experto de 3072, con 896 expertos en total y 16 seleccionados por token. Esta configuracion de alta dispersion (sparsity) se enmarca en el marco Stable LatentMoE, que segun la model card aporta una mejora de aproximadamente 2,5x en eficiencia de escalado respecto a Kimi K2.

La model card indica que el modelo es multimodal nativo (texto, imagen y video) y esta disenado para razonamiento de largo horizonte y trabajo agentico. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificacion especulativa o atencion lineal mas alla de la propia KDA.

## Capacidades
- Generacion de texto y razonamiento de largo horizonte, orientado a tareas de ingenieria y conocimiento que requieren multiples pasos.
- Comprension multimodal nativa de texto, imagenes y video dentro del mismo modelo.
- Codigo y ingenieria de software: navegacion de repositorios masivos, orquestacion de herramientas de terminal, optimizacion de kernels de GPU, desarrollo de compiladores y vision-in-the-loop para desarrollo de videojuegos, CAD y diseno de chips.
- Trabajo de conocimiento agentico: investigacion profunda con visualizaciones interactivas, widgets, dashboards, motion design y edicion de video.
- Ventana de contexto de 1 millon de tokens para procesar documentacion extensa, bases de codigo completas o sesiones prolongadas.
- Soporte de tool calling y function calling: no se detalla explicitamente en la informacion disponible, aunque las capacidades agenticas descritas implican orquestacion de herramientas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso
- Ingenieria de software de largo horizonte: el modelo puede mantener sesiones prolongadas de desarrollo con supervision humana minima, navegando repositorios masivos y orquestando herramientas de terminal gracias a su contexto de 1M tokens.
- Optimizacion de kernels de GPU y desarrollo de compiladores: adecuado para tareas de bajo nivel que requieren razonamiento tecnico sostenido y verificacion iterativa dentro del mismo contexto.
- Investigacion profunda automatizada: genera informes con visualizaciones interactivas, widgets y dashboards, aprovechando su capacidad multimodal para producir entregables visuales.
- Edicion de video y motion design asistidos: su comprension nativa de video permite analizar material audiovisual y asistir en tareas de postproduccion dentro de la misma sesion.
- Desarrollo de videojuegos con vision-in-the-loop: puede integrar capturas o video del juego en el bucle de desarrollo para iterar sobre mecanicas, interfaces o comportamiento.
- Diseno asistido por ordenador (CAD) y diseno de chips: el modelo puede razonar sobre especificaciones tecnicas extensas y coordinar herramientas especializadas en flujos de trabajo de ingenieria.
- Analisis de documentacion tecnica extensa: con 1M tokens de contexto, puede procesar manuales, normativas o bases de conocimiento completas sin fragmentacion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: con 2,8T de parametros totales y pesos en 8 bits, el repositorio ocupa 1561 GB, por lo que se requiere un nodo multi-GPU con al menos ~1,6 TB de memoria agregada solo para cargar los pesos.
- GPU recomendadas: no disponibles en la informacion proporcionada; por el volumen de pesos, se necesitan clusters con GPUs de centro de datos (A100, H100 o superiores) en configuracion multi-nodo.
- No cabe en GPU de consumo: el tamano del repositorio (1561 GB) excede con creces la VRAM de cualquier GPU consumer.
- Opciones de despliegue: la libreria declarada es transformers con custom_code; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3 | 2,8T | 104B | 1M tokens | kimi-k3 (proprietaria) | Pesos abiertos en HF |
| Kimi K2 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con Kimi K2, del que se menciona una mejora de ~2,5x en eficiencia de escalado, pero sin datos concretos de parametros, contexto o rendimiento. No se dispone de informacion sobre otros modelos comparables de la misma categoria.

## Limitaciones y advertencias
- Licencia "kimi-k3" propia y etiquetada como "other": no es una licencia open source estandar, por lo que es imprescindible revisar los terminos antes de cualquier uso comercial.
- El repositorio es una copia no oficial publicada por un tercero (`playplatoon`), no el repositorio oficial de Moonshot AI; conviene verificar la integridad de los pesos y la procedencia.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala; no se han publicado evaluaciones especificas en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento adecuado en castellano.
- Limitaciones de contexto: aunque la ventana es de 1M tokens, no se detalla el rendimiento efectivo en contextos proximos al maximo.
- Requisitos de hardware extremos (mas de 1,5 TB de pesos en 8 bits) que limitan el despliegue a infraestructura de centro de datos.
- No se detallan tecnicas de mitigacion de sesgos, filtros de seguridad ni limitaciones de uso aceptable mas alla de la licencia.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/playplatoon/Kimi-K3-archive
- Repositorio oficial de Moonshot AI en Hugging Face: https://huggingface.co/moonshotai
- Modelo oficial (referencia de la model card): https://huggingface.co/moonshotai/Kimi-K3
- Blog tecnico: https://www.kimi.com/blog/kimi-k3
- Informe tecnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Chat: https://www.kimi.com
- Pagina oficial: https://www.moonshot.ai
- Twitter: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
