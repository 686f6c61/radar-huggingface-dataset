# Andrzejkoko/Kimi-K3

## Resumen

Kimi K3 es un modelo multimodal nativo de tipo agéntico, publicado con pesos abiertos por Moonshot AI. Se trata de un modelo de mezcla de expertos (MoE) con 2,8 billones de parámetros totales y 104.000 millones de parámetros activos por token, lo que lo sitúa en la categoría de modelos de frontera de escala 3T. Su arquitectura introduce dos innovaciones propias: Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), además de un marco de enrutamiento denominado Stable LatentMoE que activa 16 de 896 expertos por token.

El modelo está diseñado para tareas de razonamiento de largo horizonte, ingeniería de software sobre repositorios extensos, orquestación de herramientas de terminal y trabajo de conocimiento agéntico. Incorpora visión nativa, de modo que procesa texto, imágenes y vídeo dentro del mismo modelo, y ofrece una ventana de contexto de un millón de tokens. Según el autor, es el primer modelo abierto de clase 3T.

La relevancia actual del modelo radica en la combinación de escala de frontera con pesos abiertos bajo una licencia propia (Kimi K3 License), lo que permite investigación, despliegue e innovación posterior. No obstante, su tamaño de 2,8T parámetros implica requisitos de infraestructura muy elevados para inferencia local, y el repositorio de Hugging Face ocupa 1561 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2.779.931.837.184 (2,8T) |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit (etiqueta del repositorio); otras no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (license: other, license_name: kimi-k3) |
| Formato de pesos | safetensors (con compressed-tensors) |
| Numero de capas | 93 (1 capa densa) |
| Composicion de capas de atencion | 69 KDA + 24 Gated MLA |
| Dimension oculta de atencion | 7168 |
| Cabezas de atencion | 96 |
| Dimension latente MoE | 3584 |
| Dimension oculta MoE por experto | 3072 |
| Numero de expertos | 896 |
| Expertos seleccionados por token | 16 |
| Pipeline | image-text-to-text |
| Libreria | transformers (custom_code) |

## Arquitectura y entrenamiento

Kimi K3 es un transformer de mezcla de expertos con 93 capas, de las cuales solo una es densa. La composicion de atencion combina 69 capas con Kimi Delta Attention (KDA) y 24 capas con Gated MLA (Multi-head Latent Attention con compuertas). La dimension oculta de atencion es de 7168 con 96 cabezas. El bloque MoE opera sobre una dimension latente de 3584, con 896 expertos de dimension oculta 3072 cada uno, de los que se activan 16 por token. El marco Stable LatentMoE se presenta como una evolucion que incrementa la dispersidad del MoE y que, segun el autor, aporta una mejora aproximada de 2,5 veces en eficiencia de escalado global respecto a Kimi K2.

El modelo es multimodal nativo: procesa texto, imagenes y video con el mismo conjunto de pesos. Dispone de una ventana de contexto de un millon de tokens. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifican innovaciones adicionales como decodificacion especulativa. La informacion sobre el proceso de entrenamiento se remite al informe tecnico completo (k3_tech_report.pdf) enlazado desde la model card.

## Capacidades

- Generacion de texto y razonamiento de largo horizonte, orientado a tareas de ingenieria y conocimiento.
- Vision nativa: comprension de imagenes y video dentro del mismo modelo (pipeline image-text-to-text).
- Codigo a gran escala: sesiones largas de ingenieria, navegacion de repositorios masivos y orquestacion de herramientas de terminal, incluyendo optimizacion de kernels de GPU, desarrollo de compiladores, desarrollo de videojuegos con vision en el bucle, CAD y diseno de chips.
- Trabajo de conocimiento agéntico: investigacion profunda con visualizaciones interactivas, widgets, paneles y diseno de movimiento y edicion de video.
- Capacidad multimodal de contexto largo: texto, imagen y video con ventana de un millon de tokens.
- Soporte de tool calling y function calling: no se detalla explicitamente en la informacion disponible, aunque las capacidades descritas de orquestacion de terminal y trabajo agéntico implican uso de herramientas.
- Capacidades multilingues: no disponible.
- Modo de razonamiento extendido (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Ingenieria de software sobre repositorios extensos: el modelo puede mantener sesiones de trabajo prolongadas con supervision humana minima y navegar por grandes bases de codigo gracias a su contexto de un millon de tokens, lo que resulta adecuado para refactorizaciones amplias y auditorias de codigo.
- Orquestacion de terminal y automatizacion de DevOps: con capacidades de uso de herramientas de terminal, puede ejecutar y encadenar comandos para tareas de integracion y despliegue continuo, diagnostico de fallos y gestion de infraestructura.
- Optimizacion de kernels de GPU y desarrollo de compiladores: el modelo esta disenado explicitamente para estas tareas de ingenieria de bajo nivel, donde la combinacion de razonamiento y codigo resulta critica.
- Investigacion profunda con generacion de visualizaciones: puede producir informes de investigacion con paneles, widgets y visualizaciones interactivas, adecuado para equipos de analisis que necesitan sintetizar grandes volumenes de informacion.
- Analisis de video y documentos multimedia: al ser multimodal nativo con contexto largo, permite procesar videos y conjuntos de imagenes junto con texto para tareas de resumen, extraccion de informacion y control de calidad.
- Diseno asistido por ordenador (CAD) y desarrollo de videojuegos con vision en el bucle: el modelo puede integrar la percepcion visual en el ciclo de desarrollo para iterar sobre disenos y prototipos.
- Diseno de chips: la model card menciona explicitamente esta aplicacion como parte de sus capacidades de ingenieria de largo horizonte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al informe tecnico completo (k3_tech_report.pdf) para datos de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,8T parametros totales, incluso en cuantizacion de 8 bits el modelo requiere del orden de terabytes de memoria. El repositorio de Hugging Face ocupa 1561 GB.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por escala, se requiere infraestructura multi-GPU de clase centro de datos (A100, H100 u equivalentes), aunque no se especifican configuraciones concretas.
- Compatibilidad con GPU de consumo: no es viable en GPU de consumo (RTX 4090 u otras) por el tamano del modelo.
- Opciones de despliegue: la libreria indicada es transformers con custom_code; no se detallan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Kimi K3 | 2,8T | 104B | 1.000.000 tokens | Kimi K3 License | Multimodal nativo, KDA + AttnRes |
| Kimi K2 | no disponible | no disponible | no disponible | no disponible | Referencia citada por el autor como base de comparacion de eficiencia de escalado |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la informacion proporcionada |

La model card solo menciona Kimi K2 como referencia para la mejora de eficiencia de escalado (aproximadamente 2,5 veces). No se proporcionan datos de otros modelos comparables.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no se documenta en la model card; como modelo generativo de gran escala, es un riesgo inherente que debe evaluarse en produccion.
- Limitaciones de contexto o idioma: la ventana de contexto es de un millon de tokens, pero no se detallan los idiomas soportados ni posibles degradaciones en contextos muy largos.
- Restricciones de licencia: la licencia es la Kimi K3 License (license: other), distinta de las licencias open source estandar; es necesario revisar sus terminos para uso comercial.
- Requisitos de infraestructura: el tamano de 2,8T parametros y un repositorio de 1561 GB hacen inviable el despliegue en hardware de consumo y exigen infraestructura de centro de datos.
- Datos de entrenamiento y evaluacion no publicados en la model card: la ausencia de detalles sobre dataset, RLHF/DPO y benchmarks limita la evaluacion independiente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: se trata de una publicacion reciente (creada el 2026-11-10) sin validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Andrzejkoko/Kimi-K3
- Organizacion Moonshot AI en Hugging Face: https://huggingface.co/moonshotai
- Blog tecnico: https://www.kimi.com/blog/kimi-k3
- Informe tecnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Chat: https://www.kimi.com
- Pagina principal: https://www.moonshot.ai
- Twitter: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
- Licencia: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
