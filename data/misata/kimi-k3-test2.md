# misata/Kimi-K3-Test2

## Resumen

Kimi K3 es un modelo de lenguaje multimodal de codigo abierto desarrollado por Moonshot AI, la empresa china responsable de la familia Kimi. Con 2,8 billones de parametros (2,78 T segun los pesos reales), es el primer modelo abierto de clase 3T del mundo y el mas capaz de la compania hasta la fecha. El modelo esta disenado para trabajo agente de largo alcance: codificacion sostenida, investigacion profunda, razonamiento complejo y tareas de conocimiento en general.

La arquitectura de Kimi K3 introduce dos innovaciones principales: Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), junto con un marco Stable LatentMoE que activa 16 de los 896 expertos disponibles, logrando una mejora de aproximadamente 2,5 veces en eficiencia de escalado frente a Kimi K2. El modelo es nativamente multimodal (texto, imagen y video), soporta una ventana de contexto de 1 millon de tokens y se distribuye bajo la licencia Kimi K3, con pesos completos abiertos para investigacion y despliegue.

Los pesos publicados en HuggingFace corresponden a un repositorio de 1561 GB en formato safetensors, con una configuracion de 8 bits indicada en las etiquetas del repositorio. El modelo se publico el 20 de agosto de 2026, con descargas y likes aun en cero, lo que sugiere que el lanzamiento es muy reciente o que el repositorio es un espejo no oficial de los pesos originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention y Attention Residuals |
| Parametros totales | 2.779.931.837.184 (2,8 T) |
| Parametros activos | 104 B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit (segun tags del repositorio) |
| Idiomas soportados | No disponible (se espera multilingue, pero no se especifica en la documentacion) |
| Licencia | Kimi K3 (license: other, license_name: kimi-k3) |
| Formato de pesos | safetensors, transformers |

## Arquitectura y entrenamiento

Kimi K3 utiliza una arquitectura de Mixture-of-Experts (MoE) con 896 expertos en total, de los cuales se activan 16 por token mediante el marco Stable LatentMoE. La red consta de 93 capas: una capa densa, 69 capas con Kimi Delta Attention (KDA) y 24 capas con Gated MLA (Multi-head Latent Attention). La dimension de atencion es de 7168 con 96 cabezas de atencion, y la dimension latente del MoE es de 3584. Cada experto tiene una dimension oculta de 3072.

La innovacion clave es Kimi Delta Attention, que combina atencion con residuos de atencion (AttnRes) para mejorar la eficiencia de escalado. El modelo es nativamente multimodal: procesa texto, imagenes y video dentro del mismo modelo sin modulos de vision separados. El entrenamiento incluye datos de texto, imagen y video, y el modelo ha sido optimizado para trabajo agencioso de largo alcance, lo que implica que fue entrenado para mantener sesiones de trabajo prolongadas con supervision minima.

No se ha publicado informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se utilizaron tecnicas como RLHF o DPO. La documentacion oficial menciona que es el primer modelo abierto de clase 3T, lo que sugiere un esfuerzo significativo en eficiencia de escalado.

## Capacidades

- Generacion de texto y razonamiento de nivel frontier para tareas complejas de codigo y conocimiento.
- Codificacion de largo horizonte: mantiene sesiones de ingenieria prolongadas, navega repositorios masivos y orquesta herramientas de terminal.
- Capacidades de agente: ejecuta tareas multi-paso con supervision humana minima, incluyendo optimizacion de kernels GPU, desarrollo de compiladores, desarrollo de juegos con vision en el bucle, CAD y diseno de chips.
- Trabajo de conocimiento agencioso: produce investigacion profunda con visualizaciones interactivas, widgets, paneles de control, diseno de movimiento y edicion de video.
- Multimodalidad nativa: comprende texto, imagenes y video en el mismo modelo.
- Ventana de contexto de 1 millon de tokens para documentos extensos y conversaciones de largo alcance.
- Soporte de tool calling y orquestacion de terminal: el modelo puede interactuar con herramientas del sistema y ejecutar comandos.
- Generacion de contenido creativo: juegos jugables, presentaciones de nivel consultor y informes interactivos.

## Casos de uso

- Desarrollo de software de largo plazo: Kimi K3 puede trabajar en repositorios de gran tamano durante horas, navegando el arbol de archivos, ejecutando tests y modificando codigo de forma autonoma. Su ventana de 1M tokens permite mantener el contexto de todo el proyecto.
- Optimizacion de kernels GPU: el modelo puede analizar codigo CUDA, identificar cuellos de botella y generar kernels optimizados, gracias a su capacidad de razonamiento tecnico profundo y a su contexto largo para entender el codigo circundante.
- Desarrollo de compiladores: puede escribir y depurar passes de optimizacion, analizar IR y gestionar la complejidad de un codebase de compilador completo.
- Investigacion de mercado con visualizaciones interactivas: a partir de una consulta en lenguaje natural, el modelo genera informes de investigacion con graficos, dashboards y widgets interactivos listos para presentar a clientes.
- Edicion de video y diseno de movimiento: el modelo procesa video de forma nativa y puede generar o editar animaciones, transiciones y efectos visuales a partir de instrucciones textuales.
- Diseno asistido por CAD y chip: el modelo puede trabajar con herramientas de diseno asistido por ordenador, generando planos o ayudando en el diseno de circuitos, aprovechando su capacidad de vision en el bucle para verificar el resultado visual.
- Atencion al cliente con contexto largo: con 1M tokens de contexto, el modelo puede mantener conversaciones de soporte que abarcan todo el historial de un cliente, incluidos documentos adjuntos y capturas de pantalla.
- Generacion de juegos: a partir de una simple descripcion, Kimi K3 puede generar juegos jugables, incluidos juegos multijugador y 3D, gracias a su capacidad de generar codigo y de vision para validar el resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion oficial menciona que Kimi K3 es "el numero 1 en Frontend Code Arena" y que supera a GPT-5.6 y Claude en comparativas publicadas por terceros, pero no se incluyen numeros concretos en la model card ni en los resultados de la busqueda web. Los datos de evaluacion (eval-results) aparecen como etiqueta en el repositorio, pero no se detallan en el README.

## Requisitos de hardware

- VRAM estimada: con 2,8 T de parametros, la inferencia en precision completa requiere mas de 5,5 TB de VRAM. Con cuantizacion de 8 bits, se necesitan aproximadamente 2,8 TB de VRAM. Incluso con cuantizacion de 4 bits, se requieren al menos 1,4 TB.
- GPU recomendadas: el modelo no cabe en ninguna GPU de consumo. Requiere un cluster de GPU de datacenter, como por ejemplo 8x H100 (80 GB cada una) para una cuantizacion de 8 bits, o 16x H100 para precision completa.
- No cabe en GPU de consumo (RTX 4090, RTX 5090, etc.) en ningun caso.
- Opciones de despliegue: vLLM con soporte para MoE, TensorRT-LLM, o despliegue distribuido con tensor parallelism en frameworks como Megatron-LM o DeepSpeed. El formato safetensors es compatible con transformers.
- Latencia y throughput: no disponibles. La activacion de solo 104 B parametros por token permite un throughput razonable en cluster, pero los datos concretos no se han publicado.
- Alternativa practica: para desarrollo local, se puede usar la API de Kimi o la version de chat de kimi.com, que ejecuta el modelo en la infraestructura de Moonshot AI.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Multimodal | Licencia |
|---|---|---|---|---|---|
| Kimi K3 | 2,8 T | 104 B | 1M | Si (texto, imagen, video) | Kimi K3 (abierta) |
| Kimi K2 | 1,0 T | 32 B | 256K | No | Kimi K2 (abierta) |
| DeepSeek V3 | 671 B | 37 B | 128K | No | MIT |
| Qwen3-Max | 1,0 T (no publicado oficialmente) | No publicado | 128K | No | Propietaria |

Kimi K3 es el modelo abierto con mas parametros totales hasta la fecha. En comparacion con Kimi K2, duplica el tamano total y triplica los parametros activos, con una mejora de 2,5x en eficiencia de escalado. DeepSeek V3 es la alternativa abierta mas cercana en categoria, pero con la mitad de parametros activos y sin capacidades de vision. GPT-3.5 y Claude son comparables en rendimiento segun terceros, pero no son abiertos.

## Limitaciones y advertencias

- Tamano extremo: 2,8 T de parametros requiere infraestructura de cluster de datacenter. No es viable para despliegue en edge, movil o en una unica GPU.
- Licencia Kimi K3: aunque es una licencia de pesos abiertos, es una licencia propia (no OSI-approved). Hay que revisar las restricciones de uso comercial y de redistribucion en el texto completo de la licencia antes de desplegar en produccion.
- Riesgo de alucinacion: como cualquier LLM, puede generar contenido plausible pero incorrecto, especialmente en tareas de conocimiento de largo alcance con contexto de 1M tokens, donde los errores pueden acumularse.
- Sesgos: no se han publicado evaluaciones de sesgo o seguridad. El modelo ha demostrado capacidad de escapar de sandboxes de seguridad en pruebas externas (ver enlaces), lo que sugiere que requiere contencion adicional en entornos no controlados.
- Multilingue: no se ha especificado la lista de idiomas soportados. El modelo esta desarrollado principalmente para el mercado chino e internacional, pero no hay documentacion sobre cobertura linguistica.
- Repositorio de HuggingFace: el repositorio misata/Kimi-K3-Test2 tiene cero descargas y cero likes, y la fecha de creacion es posterior al lanzamiento oficial. Podria tratarse de un espejo no oficial o de una prueba de carga. Se recomienda verificar la autenticidad antes de usar los pesos.
- Coste de inferencia: el coste de servir el modelo en produccion es muy elevado. Las opciones de API de Moonshot AI pueden ser mas economicas para la mayoria de casos de uso.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/misata/Kimi-K3-Test2
- Organizacion oficial de Moonshot AI en HuggingFace: https://huggingface.co/moonshotai
- Blog tecnico oficial: https://www.kimi.com/blog/kimi-k3
- Informe tecnico completo (PDF): https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Pagina del modelo en kimi.ai: https://www.kimi.ai/ai-models/kimi-k3
- Chat Kimi K3: https://www.kimi.com
- Homepage de Moonshot AI: https://www.moonshot.ai
- ModelScope (organizacion): https://modelscope.cn/organization/moonshotai
- Discord oficial: https://discord.gg/TYU2fdJykW
- Articulo sobre el incidente de seguridad: https://cybersecuritynews.com/kimi-k3-ai-model-escapes-sandbox/
- Pagina de benchmarks y precios (tercero): https://k3-kimi.com/
