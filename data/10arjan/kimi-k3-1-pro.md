# 10arjan/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de lenguaje multimodal nativo y orientado a agentes, desarrollado por Moonshot AI. Se trata del primer modelo de la serie K3.1 y, segun la model card, el modelo de clase 3T mas capaz de la compania hasta la fecha. Se construye mediante post-entrenamiento sobre Kimi K3, con aprendizaje por refuerzo conjunto a gran escala en cientos de dominios downstream, y anade una ventana de contexto de un millon de tokens. La arquitectura es un transformer de mezcla de expertos (MoE) con 2,8 billones de parametros totales y 104.000 millones de parametros activos por token.

El modelo incorpora una composicion de capas de atencion hibrida: 69 capas con KDA (Kimi Delta Attention) y 24 capas con Gated DSA (DeepSeek Sparse Attention, segun la nomenclatura de la model card), lo que permite manejar contextos muy largos con un coste de atencion controlado. La pipeline declarada es `image-text-to-text`, lo que confirma su caracter nativo multimodal (entrada de imagen y texto). El repositorio publicado por el usuario `10arjan` es una copia/derivacion del modelo oficial de Moonshot AI, con pesos en formato safetensors y cuantizacion de 8 bits mediante `compressed-tensors`.

La relevancia actual del modelo radica en su combinacion de escala (clase 3T), contexto de 1M tokens, capacidades multimodales y orientacion agentica (tool calling, razonamiento multi-paso). No obstante, el coste de despliegue es prohibitivo para la mayoria de equipos: el repositorio ocupa 1.561,4 GB y los pesos completos en safetensors superan los 2,7 billones de parametros. Es un modelo pensado para infraestructura de centro de datos, no para hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida (69 capas KDA + 24 capas Gated DSA) |
| Parametros totales | 2.780.110.363.392 (2,8T) |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 tokens (segun model card) |
| Tipos de cuantizacion | 8-bit (compressed-tensors); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | `kimi-k3.1-pro` (licencia propia, etiquetada como `other`) |
| Formato de pesos | safetensors (con `compressed-tensors`, 8-bit) |

Datos adicionales de arquitectura disponibles en la model card:

| Parametro | Valor |
|---|---|
| Numero de capas | 93 (1 capa densa) |
| Dimension oculta de atencion | 7168 |
| Numero de cabezas de atencion | 96 |
| Dimension de cabeza del indice DSA | 128 |
| Numero de cabezas del indice DSA | 32 |
| Top-K del indice DSA | 2048 |
| Dimension latente MoE | 3584 |
| Dimension oculta MoE por experto | 3072 |
| Numero de expertos | 896 |
| Expertos seleccionados por token | 16 |
| Expertos compartidos | 2 |
| Tamano de vocabulario | 160K |

## Arquitectura y entrenamiento

Kimi K3.1 Pro es un transformer de mezcla de expertos (MoE) con 93 capas, de las cuales solo una es densa. El bloque de atencion es hibrido: 69 capas usan KDA (Kimi Delta Attention), una variante de atencion lineal/delta pensada para reducir el coste computacional en secuencias largas, y 24 capas usan Gated DSA (DeepSeek Sparse Attention con compuerta), que aplica atencion dispersa sobre un subconjunto de tokens (top-K de 2048 en el indice DSA). Esta combinacion permite sostener una ventana de 1M tokens sin el coste cuadratico de un transformer denso clasico.

La capa MoE cuenta con 896 expertos, de los que se activan 16 por token, mas 2 expertos compartidos, con una dimension latente de 3584 y una dimension oculta por experto de 3072. Esto da lugar a 104B parametros activos sobre un total de 2,8T, una relacion de activacion de aproximadamente el 3,7%. El vocabulario es de 160K tokens. Segun la model card, el modelo se obtiene por post-entrenamiento sobre Kimi K3 mediante aprendizaje por refuerzo conjunto a gran escala en cientos de dominios downstream; no se detallan en la informacion disponible el numero de tokens de preentrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas adicionales como DPO. El modelo es nativamente multimodal (pipeline `image-text-to-text`), aunque la model card no especifica la arquitectura del codificador visual.

## Capacidades

- Generacion de texto y razonamiento general, con mejoras declaradas en precision factual.
- Capacidades de codigo y programacion, reforzadas mediante RL en dominios downstream.
- Creacion 3D, segun la model card (una de las areas con mejoras sustanciales).
- Investigacion financiera y analisis de datos financieros.
- Capacidades multimodales nativas: entrada de imagen y texto (pipeline `image-text-to-text`).
- Capacidades agenticas: razonamiento multi-paso y ejecucion de tareas encadenadas.
- Soporte de tool calling / function calling (implicito en su orientacion agentica; no se detalla la interfaz exacta en la informacion disponible).
- Contexto largo de 1M tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidades multilingues: no disponible el detalle de idiomas soportados.

## Casos de uso

- Analisis de documentacion extensa: con 1M tokens de contexto, el modelo puede ingerir informes anuales completos, expedientes legales o bases de codigo de gran tamano en una sola pasada, sin necesidad de trocear el contenido y perder coherencia global.
- Agentes autonomos de software: su soporte de razonamiento multi-paso y tool calling permite construir agentes que planifican, ejecutan comandos, leen resultados y corrigen errores en pipelines de CI/CD o entornos de desarrollo.
- Generacion y refactorizacion de codigo en produccion: la mejora declarada en tareas de codigo y su contexto largo lo hacen adecuado para revisiones de repositorios completos y migraciones de codigo entre lenguajes o frameworks.
- Investigacion financiera asistida: analisis de estados financieros, comparacion de multiples documentos y generacion de informes con trazabilidad de fuentes, aprovechando la mejora en precision factual.
- Creacion 3D y modelado asistido: generacion de descripciones estructuradas, scripts de modelado o assets 3D a partir de especificaciones en lenguaje natural e imagenes de referencia.
- Atencion al cliente avanzada: conversaciones multi-turno con historial largo, acceso a base de conocimiento mediante tool calling y derivacion a humanos cuando el agente detecta baja confianza.
- Procesamiento de documentos con imagenes: al ser multimodal nativo, puede extraer informacion de facturas, formularios escaneados o capturas de pantalla y combinarla con texto para tareas de extraccion estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos completos en safetensors ocupan 1.561,4 GB en el repositorio (cuantizacion 8-bit). En BF16 los 2,8T parametros requeririan aproximadamente 5,6 TB de memoria, por lo que el despliegue realista exige la version cuantizada a 8 bits y, aun asi, multiples GPUs.
- GPU recomendadas: para servir el modelo completo se necesitan nodos multi-GPU de clase H100 (80 GB) o H200 (141 GB), con agregacion de memoria de varios TB. No es viable en una sola GPU.
- GPU de consumo: no cabe en ninguna GPU de consumo (RTX 4090, 24 GB; RTX 5090, 32 GB). Ni siquiera con cuantizaciones agresivas de 4 bits (que no se ofrecen en la informacion disponible) el modelo cabria en hardware consumer.
- Opciones de despliegue: transformers (libreria declarada), con soporte de `compressed-tensors` para los pesos 8-bit. No se confirma en la informacion disponible el soporte de vLLM, llama.cpp, Ollama o TGI; dado el tamano, solo tiene sentido un servidor de inferencia distribuido tipo vLLM o SGLang en cluster.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas estructurales.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kimi K3.1 Pro | 2,8T | 104B | 1M | `kimi-k3.1-pro` (propia) | Pesos en HF (repo de 1.561 GB) |
| Kimi K3 (modelo base) | no disponible | no disponible | no disponible | no disponible | Referenciado como base del post-entrenamiento |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El repositorio es una publicacion de un tercero (`10arjan`), no el repositorio oficial de Moonshot AI; conviene verificar la integridad de los pesos antes de usarlos en produccion.
- La licencia `kimi-k3.1-pro` es una licencia propia etiquetada como `other`; es imprescindible revisar sus terminos antes de cualquier uso comercial, ya que pueden existir restricciones de uso, atribucion o redistribucion.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala, especialmente en tareas factuales y financieras; la model card declara mejoras en precision factual, pero no se aportan metricas que las cuantifiquen.
- No se detallan los idiomas soportados ni el grado de cobertura multilingue, lo que limita la evaluacion para despliegues en idiomas distintos del ingles.
- El coste de inferencia y el requisito de hardware (multiples TB de memoria) hacen inviable su uso en entornos con recursos limitados.
- No se han publicado benchmarks en la informacion disponible, por lo que las afirmaciones de mejora en codigo, 3D o finanzas no pueden verificarse de forma independiente.
- La cuantizacion 8-bit con `compressed-tensors` puede introducir degradacion de calidad respecto a los pesos originales en precision completa; no se documenta el impacto.
- La fecha de creacion del repositorio (2026-11-15) y la ausencia de descargas o likes sugieren que se trata de una publicacion reciente y sin validacion comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/10arjan/Kimi-K3.1-Pro
- Repositorio oficial de Moonshot AI en Hugging Face: https://huggingface.co/moonshotai
- Modelo oficial (referencia de licencia): https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
- Blog tecnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Quickstart de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Sitio web de Moonshot AI: https://www.moonshot.ai
- Chat de Kimi: https://www.kimi.ai
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
