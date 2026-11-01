# fuad404/Over-Ai

## Resumen

Kimi K3 es un modelo de lenguaje multimodal nativo de tipo MoE (Mixture-of-Experts) desarrollado por Moonshot AI. Con 2,8 billones de parametros totales y 104.000 millones activados por token, se posiciona como el primer modelo abierto de clase 3T, disenado para inteligencia de frontera en tareas de codigo de largo horizonte, trabajo de conocimiento y razonamiento. La version alojada en `fuad404/Over-Ai` es una redistribucion no oficial del modelo base bajo la licencia Kimi K3, publicada por un tercero.

La arquitectura se apoya en Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), con un marco Stable LatentMoE que activa 16 de 896 expertos. Incorpora vision nativa y una ventana de contexto de 1 millon de tokens, lo que lo hace adecuado para sesiones de ingenieria prolongadas, navegacion de repositorios masivos y orquestacion de herramientas de terminal.

Su relevancia actual radica en que libera pesos de frontera bajo una licencia abierta (con restricciones), permitiendo investigacion, despliegue y desarrollo sobre una base de capacidad comparable a modelos propietarios de gran escala. No obstante, el repositorio presenta un tamano de 1561 GB y solo 0 descargas, lo que sugiere que se trata de una publicacion reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2.779.931.837.184 (2,8T) |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit (compressed-tensors); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 (license: other) |
| Formato de pesos | safetensors, compressed-tensors |
| Numero de capas | 93 (1 densa) |
| Composicion de atencion | 69 KDA + 24 Gated MLA |
| Dimension oculta de atencion | 7168 |
| Cabezas de atencion | 96 |
| Dimension latente MoE | 3584 |
| Dimension oculta MoE por experto | 3072 |
| Numero de expertos | 896 |
| Expertos seleccionados por token | 16 |

## Arquitectura y entrenamiento

Kimi K3 emplea una arquitectura MoE con 93 capas, de las cuales solo una es densa. La combinacion de atencion es hibrida: 69 capas usan Kimi Delta Attention (KDA) y 24 usan Gated MLA (Multi-head Latent Attention). El marco Stable LatentMoE escala la dispersion del MoE activando 16 de 896 expertos por token, con una dimension latente de 3584 y una dimension oculta por experto de 3072. Segun la model card, esto supone una mejora aproximada de 2,5 veces en eficiencia de escalado respecto a Kimi K2.

El modelo incorpora vision nativa, procesando texto, imagenes y video dentro del mismo modelo. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona un informe tecnico completo (`k3_tech_report.pdf`) y un blog tecnico, pero no se incluyen sus contenidos. La innovacion destacable es la combinacion de KDA y AttnRes con un esquema de expertos de grano fino y alta dispersion.

## Capacidades

- Generacion de texto y razonamiento de largo horizonte.
- Codigo: sesiones de ingenieria prolongadas, navegacion de repositorios masivos, optimizacion de kernels de GPU, desarrollo de compiladores y diseno de chips.
- Vision nativa: comprension de imagenes y video dentro del mismo modelo.
- Multimodalidad integrada: entrada image-text-to-text segun el pipeline declarado.
- Trabajo de conocimiento agentico: investigacion profunda con visualizaciones interactivas, widgets, dashboards, diseno de movimiento y edicion de video.
- Orquestacion de herramientas de terminal y agentes multi-paso.
- Contexto largo de 1 millon de tokens para documentos y sesiones extensas.
- Capacidades multilingues: no detalladas en la informacion disponible.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion proporcionada.

## Casos de uso

- Ingenieria de software de largo horizonte: el modelo puede mantener sesiones prolongadas sobre repositorios masivos y orquestar herramientas de terminal, adecuado para tareas de refactorizacion y desarrollo con supervision humana minima.
- Optimizacion de kernels de GPU y desarrollo de compiladores: su capacidad de codigo y contexto de 1M tokens permite analizar grandes bases de codigo y proponer optimizaciones a nivel de bajo nivel.
- Investigacion profunda automatizada: genera informes con visualizaciones interactivas, widgets y dashboards, aprovechando su multimodalidad nativa para combinar texto e imagenes.
- Analisis de documentos extensos: la ventana de 1M tokens permite procesar libros, expedientes o bases de conocimiento completas en una sola pasada.
- Diseno asistido por vision: tareas de CAD, diseno de chips y desarrollo de videojuegos con vision en el bucle, gracias a la comprension de imagenes y video.
- Edicion de video y diseno de movimiento: el modelo puede razonar sobre contenido visual y generar descripciones o instrucciones para pipelines de produccion.
- Asistentes agenticos de conocimiento: automatizacion de flujos de trabajo que requieren razonamiento multi-paso y manejo de contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 2,8T de parametros totales y pesos en 8-bit, el modelo requiere infraestructura de multiples nodos; el repositorio ocupa 1561 GB.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tamano, se requiere un cluster de GPUs de centro de datos (tipo A100/H100) en configuracion multi-nodo.
- Cabe en consumer GPU: no. El tamano del modelo (2,8T de parametros) y el repositorio de 1561 GB lo hacen inviable en hardware de consumo.
- Opciones de despliegue: transformers (libreria declarada), con pesos en safetensors y compressed-tensors. No se confirman vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3 (Over-Ai) | 2,8T | 104B | 1M | Kimi K3 (other) | HuggingFace |
| Kimi K2 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se aportan evaluaciones especificas.
- Limitaciones de contexto o idioma: se declara contexto de 1M tokens, pero no se detallan los idiomas soportados ni su calidad por idioma.
- Restricciones de licencia: la licencia Kimi K3 (`license: other`) puede imponer condiciones para uso comercial; es necesario revisar el texto completo de la licencia antes de desplegar en produccion.
- Publicacion no oficial: el repositorio `fuad404/Over-Ai` es una redistribucion de terceros, con 0 descargas y 0 likes; no hay validacion comunitaria ni garantia de integridad respecto al modelo original de Moonshot AI.
- Requisitos de infraestructura: el tamano de 1561 GB y los 2,8T de parametros exigen infraestructura de centro de datos multi-nodo.
- Idiomas: no disponibles, lo que impide evaluar el soporte real multilingue.
- Tool calling: no confirmado explicitamente en la informacion proporcionada.

## Enlaces

- HuggingFace (redistribucion): https://huggingface.co/fuad404/Over-Ai
- Organizacion Moonshot AI en HuggingFace: https://huggingface.co/moonshotai
- Modelo original Kimi K3 (referencia): https://huggingface.co/moonshotai/Kimi-K3
- Blog tecnico: https://www.kimi.com/blog/kimi-k3
- Informe tecnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Licencia: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Chat: https://www.kimi.com
- Homepage: https://www.moonshot.ai
- Twitter: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
