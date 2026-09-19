# rAVEUK/Kimi-K3

## Resumen

Kimi K3 es un modelo de lenguaje multimodal nativo de tipo Mixture-of-Experts (MoE) desarrollado por Moonshot AI, con 2,8 billones de parametros totales y 104.000 millones de parametros activos por token. Se presenta como el primer modelo abierto de la clase de 3 billones de parametros y esta disenado para tareas de razonamiento de horizonte largo, ingenieria de software compleja y trabajo de conocimiento agentico. Incorpora una ventana de contexto de 1 millon de tokens y capacidades nativas de vision (imagen y video) dentro del mismo modelo.

La arquitectura introduce dos componentes propios: Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), combinados con un marco de escalado denominado Stable LatentMoE que activa 16 de 896 expertos por token. Segun el autor, esto supone una mejora aproximada de 2,5 veces en eficiencia de escalado respecto a Kimi K2. El modelo tiene 93 capas (1 densa) y una composicion de capas de atencion de 69 KDA mas 24 Gated MLA.

Es relevante ahora porque publica pesos completos bajo la licencia Kimi K3, lo que permite despliegue e investigacion sobre un modelo de escala frontera. Conviene advertir que la ficha analizada corresponde al repositorio `rAVEUK/Kimi-K3`, una copia subida por un tercero (0 descargas, 0 likes) cuyo README reproduce la model card oficial de Moonshot AI; los pesos oficiales se publican en `moonshotai/Kimi-K3`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2,78 billones (2.779.931.837.184, dato de safetensors) |
| Parametros activos | 104.000 millones |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit (tag `compressed-tensors` del repositorio); el repo ocupa 1561 GB. No se detallan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 (`license: other`, `license_name: kimi-k3`) |
| Formato de pesos | safetensors (con `custom_code` de transformers) |
| Numero de capas | 93 (1 densa) |
| Composicion de atencion | 69 capas KDA + 24 capas Gated MLA |
| Dimension oculta de atencion | 7168 |
| Cabezas de atencion | 96 |
| Dimension latente MoE | 3584 |
| Dimension oculta MoE por experto | 3072 |
| Numero de expertos | 896 |
| Expertos seleccionados por token | 16 |
| Pipeline declarado | image-text-to-text |
| Libreria | transformers |

## Arquitectura y entrenamiento

Kimi K3 es un transformer MoE disperso. La atencion se reparte entre 69 capas de Kimi Delta Attention (KDA), un mecanismo de atencion con estado recurrente orientado a secuencias largas, y 24 capas de Gated MLA (Multi-head Latent Attention) distribuidas en la pila de 93 capas. El bloque MoE opera en un espacio latente de 3584 dimensiones (Stable LatentMoE) con 896 expertos de 3072 dimensiones ocultas cada uno, de los que se activan 16 por token, lo que da un ratio de activacion de aproximadamente el 1,8 % de los expertos por capa. El modelo incorpora ademas un encoder de vision nativo, ya que el pipeline declarado es `image-text-to-text` y la model card indica comprension conjunta de texto, imagen y video.

El numero de tokens de entrenamiento, la composicion del dataset y el detalle de las fases de alineacion (RLHF, DPO u otras) no estan disponibles en la informacion proporcionada. La model card menciona un informe tecnico completo enlazado como PDF, pero su contenido no forma parte de los datos extraidos. La innovacion tecnica declarada por el autor es el marco Stable LatentMoE combinado con KDA y AttnRes, que segun la propia model card aporta un factor de 2,5x en eficiencia de escalado frente a Kimi K2.

## Capacidades

- Generacion de texto y razonamiento de horizonte largo, con sesiones de ingenieria sostenidas y supervision humana minima.
- Codigo a escala de repositorio: navegacion de repositorios grandes, orquestacion de herramientas de terminal, optimizacion de kernels de GPU, desarrollo de compiladores y diseno de chips.
- Vision nativa: comprension de imagenes y video dentro del mismo modelo, incluyendo flujos de trabajo con vision en el bucle (por ejemplo, desarrollo de videojuegos o CAD).
- Trabajo de conocimiento agentico de extremo a extremo: investigacion profunda con visualizaciones interactivas, widgets, cuadros de mando, motion design y edicion de video.
- Contexto de 1 millon de tokens, adecuado para documentacion extensa, bases de codigo completas y conversaciones multi-turno muy largas.
- Capacidades multimodales integradas en un unico modelo, sin necesidad de encadenar un modelo de vision externo.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible, aunque las capacidades descritas (orquestacion de herramientas de terminal, agentes) lo presuponen.
- Capacidades multilingues: no disponible.

## Casos de uso

- Agentes de ingenieria de software sobre repositorios completos: cargando el codigo fuente integro en la ventana de 1M tokens, el modelo puede razonar sobre dependencias cruzadas entre modulos sin recurrir a recuperacion fragmentada.
- Optimizacion de kernels y codigo de bajo nivel: la model card cita explicitamente optimizacion de kernels de GPU y desarrollo de compiladores como escenarios objetivo, donde el modelo puede iterar sobre el codigo y verificar resultados de compilacion mediante llamadas a herramientas.
- Investigacion profunda automatizada: generacion de informes con visualizaciones interactivas, widgets y paneles a partir de fuentes textuales y visuales, aprovechando la multimodalidad nativa.
- Analisis de documentacion tecnica extensa con soporte visual: manuales, planos, diagramas y capturas procesados conjuntamente dentro de la misma ventana de contexto, util en ingenieria industrial y CAD.
- Revision de codigo y auditoria de seguridad en pipelines de CI/CD: el modelo puede integrarse como paso de validacion sobre diffs o ramas completas, con contexto suficiente para evaluar el impacto de un cambio.
- Edicion y postproduccion de video asistida: la capacidad multimodal permite interpretar fotogramas y transcripciones dentro de la misma sesion para tareas de motion design y montaje.
- Asistentes de conocimiento empresarial sobre corpus internos masivos: contratos, normativa o documentacion tecnica de cientos de miles de tokens consultados de una sola vez.
- Desarrollo de videojuegos con vision en el bucle: la model card menciona este escenario, en el que el modelo observa capturas de pantalla y ajusta codigo o assets de forma iterativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye el tag `eval-results` y la model card enlaza un informe tecnico completo y una entrada de blog, pero el extracto proporcionado no contiene cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, por lo que no se reproducen numeros.

## Requisitos de hardware

Estimaciones derivadas del recuento de parametros (2,78 billones); no proceden de mediciones publicadas por el autor, que no las incluye en la informacion disponible.

- Pesos en BF16/FP16: aproximadamente 5,6 TB. Requiere un clúster multinodo; no es viable en un unico nodo de 8 GPU.
- Pesos en FP8/8-bit: aproximadamente 2,8 TB. Necesita del orden de 32 GPU H200 (141 GB) solo para pesos, mas memoria para cache KV.
- Pesos en 4-bit: aproximadamente 1,4 TB, coherente con el tamano de repositorio declarado (1561 GB). Alrededor de 16 GPU H200 o 20 GPU H100 de 80 GB.
- Cache KV con 1M tokens de contexto: no disponible su tamano exacto; con 93 capas y 96 cabezas de atencion, la cache a esa longitud es muy voluminosa y condiciona el diseno del despliegue (se recomienda cuantizacion de cache KV y atencion por paginas).
- GPU consumer: no cabe en ninguna GPU consumer actual, ni siquiera con cuantizacion agresiva. El modelo no es ejecutable en RTX 4090, RTX 5090 ni similares.
- Opciones de despliegue: el repositorio declara `transformers` con `custom_code`, por lo que requiere cargar codigo remoto y la implementacion de referencia. Los motores de inferencia de alto rendimiento como vLLM o SGLang y las herramientas ligeras tipo llama.cpp u Ollama no aparecen confirmados en la informacion disponible; llama.cpp y Ollama no son viables a esta escala.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de documentacion publica y no de la informacion proporcionada; conviene verificarlos antes de tomar decisiones.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Pesos abiertos |
|---|---|---|---|---|---|
| Kimi K3 | 2,8T | 104B | 1M tokens | Kimi K3 (other) | Si |
| Kimi K2 | 1T | 32B | 128K (documentacion publica) | MIT modificada | Si |
| DeepSeek-V3 | 671B | 37B | 128K (documentacion publica) | licencia propia | Si |
| Qwen3-235B-A22B | 235B | 22B | 128K (documentacion publica) | Apache 2.0 (documentacion publica) | Si |

Frente a Kimi K2, la propia model card de K3 declara una mejora de 2,5x en eficiencia de escalado y multiplica por mas de tres el numero de parametros activos. Los modelos de la clase 600B o inferior (DeepSeek-V3, Qwen3-235B) son desplegables en un unico nodo de 8 GPU, mientras que K3 exige infraestructura multinodo. El contexto de 1M tokens de K3 supera el de sus alternativas directas, aunque la comparacion de calidad no puede completarse sin datos de benchmarks, que aqui no estan disponibles.

## Limitaciones y advertencias

- Repositorio de terceros: la ficha corresponde a `rAVEUK/Kimi-K3`, con 0 descargas y 0 likes. No es el repositorio oficial de Moonshot AI y no hay garantia de integridad de los pesos; para uso real debe preferirse `moonshotai/Kimi-K3`.
- Licencia: se clasifica como `other` con `license_name: kimi-k3`. No esta disponible el texto completo en la informacion proporcionada, por lo que las condiciones de uso comercial, redistribucion y restricciones de aceptacion deben revisarse en el archivo LICENSE del repositorio oficial antes de cualquier despliegue.
- Requiere `custom_code` en transformers, lo que implica ejecutar codigo remoto al cargar el modelo; es un riesgo de seguridad en entornos productivos.
- Riesgo de alucinacion: no se han publicado tasas de error en la informacion disponible; en tareas agenticas con ejecucion de herramientas el impacto de una alucinacion puede ser material (comandos destructivos, cambios de codigo incorrectos).
- Idiomas soportados: no disponible, por lo que no puede garantizarse un comportamiento homogeneo fuera del ingles o el chino.
- Coste de contexto: aunque la ventana es de 1M tokens, la cache KV a esa longitud condiciona seriamente el hardware y el coste por peticion.
- Sesgos: no hay informacion publicada sobre evaluaciones de sesgo o seguridad en los datos proporcionados.
- Modelo no ejecutable en hardware consumer: descartarlo para prototipado local barato.
- Los tags `feature-extraction` y `image-text-to-text` coexisten; el proposito declarado de extraccion de caracteristicas no esta documentado en la model card.

## Enlaces

- Repositorio analizado: https://huggingface.co/rAVEUK/Kimi-K3
- Repositorio oficial de pesos: https://huggingface.co/moonshotai/Kimi-K3
- Licencia: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Blog tecnico: https://www.kimi.com/blog/kimi-k3
- Informe tecnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Repositorio GitHub: https://github.com/MoonshotAI/Kimi-K3
- Chat: https://www.kimi.com
- Web de Moonshot AI: https://www.moonshot.ai
- Organizacion en HuggingFace: https://huggingface.co/moonshotai
- X/Twitter: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
- La busqueda web realizada no devolvio resultados relevantes sobre el modelo; solo paginas genericas del motor de busqueda.
