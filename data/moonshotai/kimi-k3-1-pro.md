# moonshotai/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de lenguaje multimodal nativo y de caracter agentico desarrollado por Moonshot AI, publicado en abierto bajo pesos descargables en Hugging Face. Se trata del primer modelo de la serie K3.1 y, segun su model card, el modelo mas capaz de la clase 3T de la compania. Con 2,78 billones de parametros totales en una arquitectura de mezcla de expertos (MoE) que activa 104B por token, se posiciona en la liga de los modelos frontera de gran escala.

El modelo parte de Kimi K3 y se ha post-entrenado mediante aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios, con mejoras declaradas en programacion, creacion 3D, investigacion financiera y precision factual. Incorpora una ventana de contexto de un millon de tokens y capacidades multimodales nativas (entrada de imagen y texto), lo que lo orienta a flujos de trabajo agenticos de contexto largo y tareas que combinan razonamiento, codigo y percepcion visual.

Su relevancia actual radica en la combinacion de escala frontera, contexto de 1M tokens y publicacion de pesos abiertos, algo poco habitual en modelos de esta magnitud. La licencia es propia (no estandar), lo que condiciona su uso comercial y requiere revision especifica del fichero LICENSE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida KDA + Gated DSA |
| Parametros totales | 2.780.110.363.392 (~2,8T) |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | 8-bit (compressed-tensors); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3.1-pro (license: other, licencia propia) |
| Formato de pesos | safetensors, compressed-tensors; transformers con custom_code |
| Numero de capas | 93 (1 capa densa) |
| Dimension oculta de atencion | 7168 |
| Cabezas de atencion | 96 |
| Composicion de capas de atencion | 69 KDA + 24 Gated DSA |
| Dimension de indice DSA | 128 |
| Cabezas de indice DSA | 32 |
| Top-K de indice DSA | 2048 |
| Dimension latente MoE | 3584 |
| Dimension oculta por experto | 3072 |
| Numero de expertos | 896 |
| Expertos seleccionados por token | 16 |
| Expertos compartidos | 2 |
| Tamano de vocabulario | 160K |
| Tamano del repositorio | 1561,4 GB |

## Arquitectura y entrenamiento

Kimi K3.1 Pro emplea una arquitectura transformer de mezcla de expertos con 93 capas, de las cuales solo una es densa. La atencion es hibrida: 69 capas usan KDA (atencion lineal de tipo delta, orientada a eficiencia en secuencias largas) y 24 capas usan Gated DSA (atención dispersa dinamica con puerta), con 96 cabezas de atencion y una dimension oculta de 7168. El bloque MoE cuenta con 896 expertos, de los que se activan 16 por token mas 2 expertos compartidos, con una dimension latente de 3584 y 3072 por experto. El vocabulario es de 160K tokens.

El entrenamiento parte de Kimi K3 y se completa con post-entrenamiento mediante aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios downstream, segun la model card. Este enfoque de RL multi-dominio busca mejorar de forma simultanea capacidades de codigo, creacion 3D, investigacion financiera y precision factual. La model card no detalla el volumen de tokens de preentrenamiento ni la composicion exacta del dataset, por lo que esos datos no estan disponibles. Tampoco se especifican tecnicas de decodificacion especulativa ni detalles adicionales sobre el proceso de RLHF/DPO mas alla de la mencion al RL conjunto.

## Capacidades

- Generacion de texto y razonamiento multi-turno con contexto de hasta 1M tokens.
- Capacidades multimodales nativas: entrada de imagen y texto (pipeline image-text-to-text).
- Programacion y generacion de codigo, con mejoras declaradas en tareas de coding.
- Creacion 3D: capacidad destacada en la model card como area de mejora.
- Investigacion financiera: dominio explicitamente mencionado entre las mejoras.
- Precision factual mejorada respecto a Kimi K3, segun el autor.
- Capacidades agenticas: el modelo se describe como agentic model, orientado a flujos multi-paso.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de repositorios completos: con 1M tokens de contexto, el modelo puede ingerir bases de codigo extensas y responder preguntas de arquitectura, refactorizacion o deteccion de bugs sin trocear el codigo en fragmentos.
- Investigacion financiera asistida: el modelo puede procesar informes anuales, transcripciones de resultados y articulos de prensa en una sola ventana y generar resumenes comparativos, extrayendo cifras y tendencias con trazabilidad al documento fuente.
- Agentes de automatizacion multi-paso: su naturaleza agentica y su contexto largo permiten mantener estado de tareas largas (navegacion, extraccion, verificacion) en un unico hilo de razonamiento sin perder informacion previa.
- Generacion de codigo en produccion: adecuado para pipelines de CI/CD en los que se necesita razonamiento sobre diff, tests y contexto del proyecto; la cuantizacion de 8 bits facilita el despliegue en infraestructura con memoria limitada.
- Creacion 3D y prototipado: el modelo puede asistir en la generacion de descripciones estructuradas, scripts de modelado o especificaciones de escenas, aprovechando la mejora declarada en este dominio.
- Analisis de documentos multimodales: al aceptar imagen y texto, puede procesar capturas, diagramas o paginas escaneadas junto con texto para tareas de extraccion y verificacion.
- Asistencia en investigacion academica: lectura de articulos largos, sintesis de multiples fuentes y generacion de resumenes con citas dentro de una ventana de 1M tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en safetensors ocupa 1561,4 GB; en cuantizacion de 8 bits la huella ronda los 780 GB, aunque la model card no confirma cifras exactas de VRAM en ejecucion.
- GPU recomendadas: para pesos completos se requiere un cluster multi-GPU de clase H100 o superior; para la version de 8 bits, multiples A100/H100 de 80 GB en configuracion tensor-parallel.
- Viabilidad en GPU de consumo: no es viable en RTX 4090 ni en ninguna GPU consumer individual por el tamano del modelo.
- Opciones de despliegue: transformers (libreria declarada, con custom_code); vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Kimi K3.1 Pro | ~2,8T | 104B | 1M | Propia (kimi-k3.1-pro) | safetensors, compressed-tensors |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Licencia propia no estandar (license: other, kimi-k3.1-pro): es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial; las condiciones exactas no se detallan en la informacion disponible.
- Riesgo de alucinacion: como todo modelo generativo de gran escala, puede producir afirmaciones factualmente incorrectas, especialmente en dominios especializados como finanzas; la model card menciona mejoras en precision factual pero no garantiza ausencia de errores.
- Idiomas soportados no documentados: no se confirma el alcance multilingue, lo que desaconseja asumir cobertura completa fuera del ingles sin validacion previa.
- Sesgos: no se documentan en la informacion disponible; deben evaluarse empiricamente antes de desplegar en produccion.
- Requisitos de hardware extremos: 1561,4 GB de pesos completos limitan su uso a infraestructura de gran escala; la version de 8 bits sigue requiriendo multiples aceleradores.
- Contexto de 1M tokens: aunque soportado, el rendimiento efectivo en el extremo de la ventana no esta documentado y puede degradarse.
- Compatibilidad de despliegue: solo transformers esta confirmado; otras herramientas (vLLM, TGI, llama.cpp) no estan verificadas en la informacion disponible.
- Fecha de publicacion reciente (noviembre de 2026) y pocas descargas (797): el ecosistema de herramientas y la validacion comunitaria son aun limitados.

## Enlaces

- Hugging Face: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Blog tecnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Quickstart de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Chat: https://www.kimi.ai
- Homepage: https://www.moonshot.ai
- Organizacion en Hugging Face: https://huggingface.co/moonshotai
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
- Licencia: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
