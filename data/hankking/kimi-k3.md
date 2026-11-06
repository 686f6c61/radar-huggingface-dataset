# hankking/Kimi-K3

## Resumen

Kimi K3 es un modelo de lenguaje multimodal nativo de tipo agente, publicado con pesos abiertos por Moonshot AI. Con 2,8 billones de parámetros totales y 104.000 millones activados por token, se presenta como el primer modelo abierto de clase 3T y esta disenado para tareas de razonamiento de largo horizonte, ingenieria de software y trabajo de conocimiento. La arquitectura combina Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), e incorpora vision nativa y una ventana de contexto de un millon de tokens.

El modelo escala la dispersion del MoE mediante un marco Stable LatentMoE que activa 16 de 896 expertos, lo que segun el autor supone una mejora de aproximadamente 2,5 veces en eficiencia de escalado respecto a Kimi K2. La composicion de capas de atencion es de 69 capas KDA y 24 capas Gated MLA sobre un total de 93 capas.

La relevancia actual radica en que libera pesos de frontera bajo la licencia Kimi K3, permitiendo investigacion, despliegue e innovacion posterior sobre un modelo de escala que hasta ahora solo estaba disponible en servicios cerrados. El repositorio de Hugging Face ocupa 1561 GB y utiliza el formato safetensors con cuantizacion de 8 bits mediante compressed-tensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2,8 T (2.779.931.837.184 segun safetensors) |
| Parametros activos | 104 B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8 bits (compressed-tensors); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (license: other) |
| Formato de pesos | safetensors |
| Numero de capas | 93 (1 capa densa) |
| Composicion de atencion | 69 KDA + 24 Gated MLA |
| Dimension oculta de atencion | 7168 |
| Cabezas de atencion | 96 |
| Dimension latente MoE | 3584 |
| Dimension oculta MoE por experto | 3072 |
| Numero de expertos | 896 |
| Expertos seleccionados por token | 16 |
| Pipeline | image-text-to-text |
| Libreria | transformers (custom_code) |

## Arquitectura y entrenamiento

Kimi K3 es un transformer de tipo Mixture-of-Experts con una arquitectura hibrida de atencion. De sus 93 capas, 69 emplean Kimi Delta Attention (KDA) y 24 usan Gated MLA, lo que combina mecanismos de atencion lineal y atencion latente con compuertas. La capa densa es unica y el resto se organiza como MoE con 896 expertos de los que se activan 16 por token, con una dimension latente de 3584 y una dimension oculta por experto de 3072. La dimension oculta de atencion es de 7168 con 96 cabezas.

El entrenamiento se apoya en el marco Stable LatentMoE, que segun el autor mejora la eficiencia de escalado aproximadamente 2,5 veces respecto a Kimi K2. El modelo incorpora vision nativa, lo que le permite procesar texto, imagenes y video dentro del mismo modelo. No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion del dataset ni de detalles sobre RLHF o DPO. Tampoco se detallan innovaciones adicionales como decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento de largo horizonte, orientado a sesiones de ingenieria prolongadas.
- Codigo y desarrollo de software: optimizacion de kernels de GPU, desarrollo de compiladores, desarrollo de videojuegos con vision en el bucle, CAD y diseno de chips.
- Vision nativa: comprension de imagenes y video integrada en el mismo modelo.
- Contexto largo de hasta un millon de tokens, adecuado para repositorios y documentos extensos.
- Trabajo de conocimiento agente: investigacion profunda con visualizaciones interactivas, widgets, paneles y diseno de movimiento.
- Orquestacion de herramientas de terminal y flujos multi-paso.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Ingenieria de software de largo horizonte: el modelo puede mantener sesiones de desarrollo prolongadas con supervision humana minima y navegar repositorios masivos gracias a su contexto de un millon de tokens, lo que resulta adecuado para refactorizaciones y migraciones complejas.
- Optimizacion de kernels de GPU: puede analizar y reescribir codigo de bajo nivel para mejorar el rendimiento en aceleradores, un escenario que el autor cita explicitamente entre sus capacidades.
- Desarrollo de compiladores: la ventana de contexto larga permite razonar sobre cadenas de compilacion completas y multiples ficheros de codigo relacionados.
- Investigacion profunda automatizada: genera informes con visualizaciones interactivas, widgets y paneles, lo que encaja en flujos de analisis de datos y sintesis documental.
- Analisis de video e imagenes: al ser multimodal nativo, puede procesar contenido audiovisual junto con texto para tareas de descripcion, extraccion de informacion o control de calidad.
- Diseno asistido por ordenador (CAD) y desarrollo de videojuegos con vision en el bucle: el modelo puede interpretar el estado visual de una aplicacion y actuar en consecuencia dentro de un bucle agente.
- Orquestacion de herramientas de terminal en pipelines de automatizacion: puede coordinar comandos y utilidades del sistema en tareas de ingenieria multi-paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma concreta; con 2,8 T de parametros totales y pesos en 8 bits, el repositorio ocupa 1561 GB, por lo que el despliegue completo requiere infraestructura multi-GPU de gran escala.
- GPU recomendadas: no disponibles en la informacion proporcionada; por el tamano del modelo, se requiere un cluster de GPUs de centro de datos (tipo A100/H100 u equivalentes), aunque no se confirma en la documentacion.
- Cabe en GPU de consumo: no, dado el volumen de pesos y la escala del modelo.
- Opciones de despliegue: la libreria indicada es transformers con custom_code; no se confirman vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3 | 2,8 T | 104 B | 1.000.000 | Kimi K3 License | Pesos abiertos en Hugging Face |
| Kimi K2 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de clase 3T abiertas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de especificaciones detalladas de modelos alternativos en la informacion proporcionada. La unica comparacion disponible es la referencia del autor a Kimi K2, respecto al cual Kimi K3 mejora aproximadamente 2,5 veces la eficiencia de escalado.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; como modelo generativo de gran escala, es susceptible de producir contenido incorrecto, especialmente en tareas de investigacion y codigo.
- Limitaciones de contexto o idioma: la ventana es de un millon de tokens, pero no se especifican los idiomas soportados ni su calidad relativa.
- Restricciones de licencia: la licencia Kimi K3 License (license: other) puede imponer condiciones para uso comercial; es necesario revisar el texto completo de la licencia antes de desplegar en produccion.
- Requisitos de infraestructura: el volumen de pesos (1561 GB) y la escala del modelo exigen hardware de centro de datos, lo que limita su uso a organizaciones con recursos significativos.
- Datos incompletos: no se dispone de informacion sobre el dataset de entrenamiento, procesos de alineacion ni evaluaciones independientes, lo que dificulta validar las afirmaciones del autor.

## Enlaces

- Hugging Face: https://huggingface.co/hankking/Kimi-K3
- Repositorio oficial en Hugging Face: https://huggingface.co/moonshotai/Kimi-K3
- Blog tecnico: https://www.kimi.com/blog/kimi-k3
- Informe tecnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Repositorio GitHub: https://github.com/MoonshotAI/Kimi-K3
- Pagina principal de Moonshot AI: https://www.moonshot.ai
- Chat: https://www.kimi.com
- Twitter: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
- Licencia: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
