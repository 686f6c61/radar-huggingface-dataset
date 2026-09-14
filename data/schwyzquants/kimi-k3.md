# schwyzquants/Kimi-K3

## Resumen

Kimi K3 es un modelo multimodal nativo de pesos abiertos desarrollado por Moonshot AI, presentado como su modelo mas capaz hasta la fecha. Se trata de un Mixture-of-Experts (MoE) de 2,8 billones de parametros totales que activa 104.000 millones por token, construido sobre dos innovaciones propias: Kimi Delta Attention (KDA) y Attention Residuals (AttnRes). Incorpora vision nativa y una ventana de contexto de 1 millon de tokens, y se posiciona como el primer modelo abierto de la clase de 3 billones de parametros.

El modelo esta disenado para tareas de horizonte largo: sesiones de ingenieria sostenidas con supervision humana minima, navegacion de repositorios grandes, orquestacion de herramientas de terminal y trabajo de conocimiento de extremo a extremo. Su capa de atencion combina 69 capas KDA con 24 capas Gated MLA sobre un total de 93 capas, y su MoE escala la esparsidad hasta 896 expertos con 16 activados por token, lo que segun el autor supone una mejora de aproximadamente 2,5x en eficiencia de escalado respecto a Kimi K2.

Es relevante ahora porque libera pesos de frontera bajo la licencia Kimi K3, lo que permite investigacion y despliegue propio en una categoria que hasta hace poco quedaba restringida a APIs cerradas. Conviene senalar que el repositorio analizado (schwyzquants/Kimi-K3) es una resubida de la model card oficial de Moonshot AI, con 0 descargas y 0 likes en el momento de la consulta, por lo que la referencia canonica es el repositorio de moonshotai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes); 69 capas KDA + 24 capas Gated MLA |
| Parametros totales | 2.779.931.837.184 (2,8 T) segun safetensors |
| Parametros activos | 104.000 millones (104B) |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit (tag `8-bit`, `compressed-tensors`); no se detallan otras variantes en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3 (identificador `license:other`, nombre de licencia "kimi-k3") |
| Formato de pesos | safetensors, compressed-tensors (8-bit) |
| Numero de capas | 93 (1 capa densa) |
| Dimension oculta de atencion | 7168 |
| Cabezas de atencion | 96 |
| Dimension latente MoE | 3584 |
| Dimension oculta MoE por experto | 3072 |
| Numero de expertos | 896 |
| Expertos seleccionados por token | 16 |
| Tamano del repositorio | 1561,0 GB |
| Libreria | transformers (requiere `custom_code`) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

Kimi K3 es un transformer MoE de 93 capas (una de ellas densa) que sustituye la atencion tradicional por una composicion hibrida: 69 capas de Kimi Delta Attention (KDA) y 24 capas de Gated MLA (Multi-head Latent Attention con compuerta). La dimension oculta de atencion es de 7168 con 96 cabezas. El bloque MoE opera en un espacio latente de 3584 dimensiones con 896 expertos de 3072 dimensiones ocultas cada uno, de los cuales se activan 16 por token. Esta configuracion, denominada por el autor Stable LatentMoE, eleva la esparsidad del modelo y, segun la model card, aporta aproximadamente 2,5x de mejora en eficiencia de escalado frente a Kimi K2.

La multimodalidad es nativa: el modelo procesa texto, imagenes y video dentro de la misma red, sin adaptadores externos descritos en la informacion disponible. El pipeline declarado es `image-text-to-text`. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento posteriores al preentrenamiento. Tampoco se detallan innovaciones de decodificacion (por ejemplo, decodificacion especulativa) ni esquemas de atencion lineal mas alla de KDA. Todos estos puntos quedan como no disponibles.

## Capacidades

- Generacion de texto y razonamiento de horizonte largo, orientado a sesiones de ingenieria y trabajo de conocimiento prolongadas.
- Codigo: optimizacion de kernels de GPU, desarrollo de compiladores, navegacion de repositorios de gran tamano y orquestacion de herramientas de terminal.
- Vision nativa: comprension de imagenes y video integrada en el mismo modelo (pipeline image-text-to-text), incluyendo desarrollo de videojuegos con vision en el bucle, CAD y diseno de chips segun la model card.
- Trabajo de conocimiento agente: investigacion profunda con visualizaciones interactivas, widgets, dashboards, motion design y edicion de video.
- Contexto de 1 millon de tokens, adecuado para documentos y bases de codigo extensas.
- Soporte de agentes y razonamiento multi-paso (denominado "agentic model" por el autor), con orquestacion de herramientas.
- Capacidades multilingues: no disponible (no se declaran idiomas en la informacion proporcionada).
- Tool calling / function calling: no se detalla explicitamente en la model card mas alla de la orquestacion de herramientas de terminal.

## Casos de uso

- Ingenieria de software asistida sobre monorepos: con 1 millon de tokens de contexto, el modelo puede cargar modulos completos de una base de codigo y razonar sobre dependencias cruzadas sin trocear el repositorio en fragmentos inconexos.
- Optimizacion de kernels y codigo de bajo nivel: la model card menciona explicitamente optimizacion de kernels de GPU y desarrollo de compiladores como escenarios objetivo, donde el modelo trabaja durante sesiones largas con supervision humana minima.
- Agentes autonomos de terminal: orquestacion de herramientas de linea de comandos para tareas de build, test y despliegue, encadenando pasos y corrigiendo errores a partir de la salida de las herramientas.
- Investigacion profunda automatizada: sintesis de multiples fuentes y generacion de informes con visualizaciones interactivas, widgets y dashboards, aprovechando la multimodalidad para producir graficos junto al texto.
- Analisis de documentos con imagenes y video: extraccion de informacion de informes escaneados, diagramas tecnicos o grabaciones, al procesar texto e imagen en el mismo modelo.
- Asistencia en diseno industrial y CAD: interpretacion de planos y modelos visuales como parte de un flujo iterativo, un caso citado por el autor junto al diseno de chips.
- Edicion de video y motion design asistidos: descripcion, segmentacion y reorganizacion de material audiovisual dentro de una ventana de contexto larga que abarca el proyecto completo.
- Atencion al cliente tecnica de nivel avanzado: conversaciones multi-turno con historial extenso de incidencias y documentacion adjunta, apoyadas en el contexto de 1M tokens y en la capacidad de interpretar capturas de pantalla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los tags del repositorio incluyen `eval-results`, pero no se ha proporcionado ninguna tabla de resultados (MMLU, HumanEval, GSM8K ni equivalentes), por lo que no se incluyen cifras.

## Requisitos de hardware

- Pesos en 8-bit: el tag `8-bit` y el tamano de repositorio de 1561 GB (que corresponde a una parte de los pesos en precision completa) implican que el modelo completo en 8 bits ocupa del orden de 2,8 TB, coherente con los 2,78 T de parametros. Se trata de una estimacion calculada a partir del recuento de parametros, no de un dato publicado.
- Pesos en 4-bit: alrededor de 1,4 TB como estimacion teorica, aun fuera del alcance de cualquier nodo unico convencional.
- Despliegue multi-nodo obligatorio: se requiere agregacion de memoria entre varios nodos. Como referencia, 32 GPU H100 de 80 GB suman 2560 GB, insuficientes para los pesos en 8-bit; para 8-bit harian falta del orden de 64 GPU de 80 GB solo para pesos, sin contar cache KV ni activaciones.
- GPU recomendadas: H100/H200, B200 y equivalentes con NVLink o InfiniBand entre nodos. No cabe en GPU de consumo (RTX 4090 con 24 GB, ni siquiera en configuraciones multi-GPU de 4 unidades).
- Cache KV: no disponible. Las 24 capas Gated MLA comprimen la representacion de clave-valor, lo que reduce el coste respecto a atencion completa, pero no se han publicado cifras de memoria por token ni del consumo a 1M de contexto.
- Opciones de despliegue: la libreria declarada es `transformers` con `custom_code`, lo que implica cargar codigo remoto del repositorio. No se confirma compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada, y el formato `compressed-tensors` sugiere soporte en stacks que implementen dicha libreria.
- Latencia y throughput: no disponible. Con 104B de parametros activos por token, el coste por token es inferior al de un modelo denso de 2,8 T, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3 | 2,8 T | 104B | 1.000.000 tokens | kimi-k3 (otros) | Pesos abiertos en HuggingFace |
| Kimi K2 | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Predecesor directo; la model card solo indica que K3 mejora su eficiencia de escalado en aproximadamente 2,5x |
| Otras alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | La model card afirma que Kimi K3 es el primer modelo abierto de clase 3T, sin enumerar comparaciones |

No se dispone de datos verificables de modelos alternativos en la informacion proporcionada, por lo que no se incluyen cifras de rendimiento comparadas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgo o toxicidad en la informacion proporcionada.
- Riesgo de alucinacion: no se documenta ninguna medicion de tasas de alucinacion. Como en cualquier modelo generativo de gran escala, el riesgo existe y debe mitigarse con verificacion externa, especialmente en tareas de codigo y datos factuales.
- Idiomas soportados: no disponible. No se declara cobertura multilingue, lo que impide garantizar un rendimiento adecuado en castellano o en otras lenguas distintas del ingles.
- Limitaciones de contexto: aunque la ventana es de 1M tokens, no se documenta la degradacion de rendimiento en el extremo superior de esa ventana ni el coste de memoria asociado.
- Licencia: se trata de una licencia personalizada (`license:other`, nombre "kimi-k3"). No es una licencia de codigo abierto estandar; las condiciones de uso comercial, redistribucion y despliegue en produccion deben verificarse en el texto de la licencia antes de cualquier uso.
- Requisito de codigo remoto: el repositorio declara `custom_code`, por lo que la carga en `transformers` implica ejecutar codigo del repositorio. Conviene auditar dicho codigo antes de desplegarlo.
- Repositorio de terceros: la ficha corresponde a `schwyzquants/Kimi-K3`, una resubida con 0 descargas y 0 likes en el momento de la consulta. El contenido de la model card es el de Moonshot AI, pero la procedencia de los pesos de esta copia concreta no esta verificada. Para produccion debe usarse el repositorio oficial de `moonshotai`.
- Antiguedad y mantenimiento: el repositorio se creo y se actualizo por ultima vez el 14 de septiembre de 2026, sin actualizaciones posteriores registradas.
- Coste de inferencia: con 104B de parametros activos y pesos de 8 bits en el orden de terabytes, el coste de servir el modelo es muy elevado y exige infraestructura multi-nodo; no es apto para despliegue en una sola maquina.

## Enlaces

- Repositorio analizado: https://huggingface.co/schwyzquants/Kimi-K3
- Repositorio oficial del autor (Moonshot AI): https://huggingface.co/moonshotai
- Licencia oficial: https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE
- Blog tecnico: https://www.kimi.com/blog/kimi-k3
- Informe tecnico completo: https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Chat: https://www.kimi.com
- Web de Moonshot AI: https://www.moonshot.ai
- Twitter/X: https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; unicamente aparecieron paginas de una aerolinea sin relacion con Kimi K3.
