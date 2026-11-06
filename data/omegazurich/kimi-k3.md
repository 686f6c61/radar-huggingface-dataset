# omegazurich/Kimi-K3

## Resumen

Kimi K3 es un modelo de lenguaje multimodal nativo de tipo abierto desarrollado por Moonshot AI. Con 2,8 billones de parametros totales (104B activos), se presenta como el primer modelo abierto de clase 3T, disenado para tareas de razonamiento, codigo de largo horizonte y trabajo de conocimiento agentico. Su arquitectura combina Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), e incorpora vision nativa y una ventana de contexto de un millon de tokens.

El modelo se distribuye bajo la Kimi K3 License, una licencia de tipo "other" que permite el acceso a los pesos completos para investigacion, despliegue e innovacion. El repositorio de Hugging Face ocupa 1561 GB y utiliza el formato safetensors con cuantizacion de 8 bits mediante compressed-tensors.

La relevancia de Kimi K3 radica en su escala (2,8T de parametros) combinada con una eficiencia de escalado mejorada aproximadamente 2,5 veces respecto a Kimi K2, gracias a un marco Stable LatentMoE que activa 16 de 896 expertos por token. Esto lo posiciona como una alternativa abierta a modelos frontera propietarios para tareas de codigo, agentes y analisis multimodal de contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2.779.931.837.184 (2,8T) |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit (compressed-tensors) |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (other) |
| Formato de pesos | safetensors |
| Capas totales | 93 (1 densa) |
| Composicion de atencion | 69 KDA + 24 Gated MLA |
| Dimension oculta de atencion | 7168 |
| Cabezas de atencion | 96 |
| Dimension latente MoE | 3584 |
| Dimension oculta MoE por experto | 3072 |
| Numero de expertos | 896 |
| Expertos seleccionados por token | 16 |
| Pipeline | image-text-to-text |
| Libreria | transformers |

## Arquitectura y entrenamiento

Kimi K3 emplea una arquitectura MoE con 93 capas (una densa) y una composicion de atencion hibrida: 69 capas de Kimi Delta Attention (KDA) y 24 capas de Gated MLA. La dimension oculta de atencion es de 7168 con 96 cabezas. El componente MoE utiliza un marco Stable LatentMoE con una dimension latente de 3584 y 896 expertos de dimension oculta 3072, de los cuales se activan 16 por token, lo que resulta en 104B parametros activos sobre un total de 2,8T.

La innovacion principal es la combinacion de KDA y AttnRes, que junto con el aumento de la esparsidad del MoE proporciona una mejora de eficiencia de escalado de aproximadamente 2,5 veces frente a Kimi K2. El modelo es multimodal nativo, capaz de procesar texto, imagenes y video dentro del mismo modelo. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento de largo horizonte.
- Codigo de largo horizonte: sesiones de ingenieria prolongadas, navegacion de repositorios masivos y orquestacion de herramientas de terminal.
- Capacidades multimodales nativas: comprension de texto, imagenes y video.
- Contexto de un millon de tokens para documentos y conversaciones extensas.
- Trabajo de conocimiento agentico: investigacion profunda con visualizaciones interactivas, widgets y dashboards.
- Diseno grafico en movimiento y edicion de video.
- Soporte de tool calling / function calling (implicito en su orientacion agentica).
- Razonamiento multi-paso y orquestacion de agentes.
- Capacidades multilingues: no disponible.
- Modo de pensamiento (thinking mode): no disponible en la informacion.

## Casos de uso

- Desarrollo de software de largo horizonte: el modelo puede mantener sesiones de ingenieria prolongadas con supervision humana minima, navegar repositorios masivos y orquestar herramientas de terminal, adecuado para optimizacion de kernels de GPU, desarrollo de compiladores y depuracion de sistemas complejos.
- Trabajo de conocimiento agentico: genera investigacion profunda con visualizaciones interactivas, widgets y dashboards, apropiado para analisis de datos y generacion de informes automatizados.
- Analisis multimodal de documentos extensos: con 1M de tokens de contexto y vision nativa, puede procesar libros, contratos o archivos tecnicos completos junto con sus figuras e imagenes.
- Edicion de video y diseno grafico en movimiento: su arquitectura multimodal nativa permite comprender y generar descripciones o instrucciones sobre contenido audiovisual.
- Diseno asistido por ordenador (CAD) y diseno de chips: el modelo puede asistir en flujos de trabajo de ingenieria que requieren razonamiento espacial y tecnico sobre grandes volumentes de documentacion.
- Atencion al cliente automatizada: la ventana de 1M tokens permite gestionar conversaciones multi-turno con historial extenso y contexto de productos o manuales completos.
- Generacion de codigo en produccion: su soporte de tool calling y razonamiento multi-paso lo hace integrable en pipelines de CI/CD para revision de codigo, generacion de pruebas y correccion automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 1561 GB en cuantizacion de 8 bits, lo que requiere infraestructura de multiples GPU de alta gama.
- GPU recomendadas: no disponible en la informacion. Por el tamano del modelo (2,8T parametros totales, 104B activos), se requiere un cluster de GPU de clase A100/H100 o superior.
- Cabe en consumer GPU: no. El modelo no cabe en GPUs de consumo como RTX 4090.
- Opciones de despliegue: transformers (libreria indicada en la model card). No se especifican vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Multimodal |
|---|---|---|---|---|---|
| Kimi K3 | 2,8T | 104B | 1M | Kimi K3 License | Si (texto, imagen, video) |
| Kimi K2 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de clase 3T abiertas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la informacion.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas; todo modelo generativo de esta escala es susceptible de alucinar, especialmente en tareas de investigacion abierta.
- Limitaciones de contexto o idioma: aunque soporta 1M de tokens, el rendimiento en contextos extremadamente largos puede degradarse; los idiomas soportados no estan especificados.
- Restricciones de licencia: la Kimi K3 License es de tipo "other"; es necesario revisar los terminos completos para uso comercial, ya que pueden existir restricciones no detalladas en la model card.
- Caveats para produccion: el tamano del repositorio (1561 GB) y los requisitos de hardware implican un coste de despliegue muy elevado; la cuantizacion disponible es de 8 bits, lo que limita opciones de optimizacion.
- No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion del dataset ni proceso de alineacion (RLHF/DPO), lo que dificulta evaluar sesgos y robustez.

## Enlaces

- Hugging Face: https://huggingface.co/omegazurich/Kimi-K3
- Hugging Face oficial de Moonshot AI: https://huggingface.co/moonshotai
- Chat: https://www.kimi.com
- Homepage: https://www.moonshot.ai
- Blog tecnico: https://www.kimi.com/blog/kimi-k3
- Informe tecnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Twitter: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
