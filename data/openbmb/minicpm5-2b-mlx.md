# openbmb/MiniCPM5-2B-MLX

## Resumen

MiniCPM5-2B-MLX es la version en formato MLX del modelo MiniCPM5-2B, un transformer denso de 2.516.756.480 parametros (aproximadamente 2.500 millones) desarrollado por OpenBMB. Se trata del segundo modelo de la serie MiniCPM5, tras el MiniCPM5-1B, y esta disenado especificamente para despliegue en dispositivo (edge AI), ejecucion local y entornos con recursos limitados. El sufijo MLX indica que los pesos estan empaquetados para el framework MLX de Apple, orientado a ejecucion eficiente en hardware Apple Silicon.

El modelo resuelve el problema de disponer de capacidades de razonamiento, codigo, matematicas, comprension de contexto largo y uso de herramientas en un tamano que cabe en hardware de consumo. OpenBMB lo posiciona como SOTA open source dentro de la clase de 2B parametros y competitivo frente a modelos de la clase 4B en tareas de codigo, matematicas, contexto largo y agentes.

La relevancia actual radica en su licencia Apache 2.0, su soporte para tool calling y agentes, y su orientacion a despliegue local sin dependencia de infraestructura en la nube. El modelo soporta ingles y chino, y emplea un tokenizador de la familia Llama. La version MLX esta pensada para aprovechar la memoria unificada de los chips Apple (serie M).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (etiquetado como long-context) |
| Tipos de cuantizacion | 4-bit (etiqueta del repo); otras no disponibles |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (variante MLX) |

## Arquitectura y entrenamiento

MiniCPM5-2B es un transformer denso de aproximadamente 2.500 millones de parametros que reutiliza la receta de entrenamiento del MiniCPM5-1B escalada en tamano. La arquitectura pertenece a la familia Llama, segun la etiqueta del repositorio, y los pesos se distribuyen en formato safetensors adaptado a MLX. No se detalla en la informacion disponible el numero exacto de capas, dimensiones ocultas ni el mecanismo de atencion concreto.

El entrenamiento emplea un conjunto de datasets publicados por OpenBMB: Ultra-FineWeb, UltraX-Preview y Ultra-FineWeb-L3 para datos web de preentrenamiento; UltraData-Math y UltraData-Code para dominios especializados; UltraData-SFT-2605 y UltraData-SFT-Agent-2609 para ajuste supervisado general y orientado a agentes; y UltraData-RL-2609 para aprendizaje por refuerzo. La model card referencia dos informes tecnicos (arXiv 2506.07900 y arXiv 2602.09003), pero no se especifica en la informacion proporcionada el volumen total de tokens de entrenamiento ni la composicion porcentual del dataset. Tampoco se detallan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Razonamiento de codigo (code reasoning) y generacion de codigo.
- Razonamiento matematico.
- Seguimiento de instrucciones (instruction following).
- Conocimiento general.
- Comprension de contexto largo (long-context).
- Uso de herramientas (tool use / tool calling).
- Tareas agenticas y razonamiento multi-paso (segun los datasets de SFT-Agent y RL empleados).
- Despliegue en dispositivo y en entornos de recursos limitados (edge-ai, on-device).

## Casos de uso

- Asistente de codigo local en equipos Apple Silicon: gracias a su formato MLX y sus 2.500 millones de parametros, puede ejecutarse en un Mac con memoria unificada para autocompletado, explicacion de codigo y generacion de fragmentos sin conexion a la nube.
- Agente de automatizacion con tool calling: el modelo puede orquestar llamadas a funciones externas (APIs, consultas a bases de datos, operaciones de fichero) en flujos multi-paso, aprovechando el ajuste especifico sobre UltraData-SFT-Agent-2609.
- Atencion al cliente bilingue (en/zh): gestion de conversaciones multi-turno en ingles y chino para mercados con ambos idiomas, con despliegue local que evita enviar datos sensibles a terceros.
- Procesamiento de documentos largos: su orientacion a contexto largo permite resumir, extraer informacion y responder preguntas sobre documentos extensos en local.
- Tutoria y resolucion de problemas matematicos: el ajuste sobre UltraData-Math lo hace adecuado para asistencia educativa paso a paso en entornos sin conectividad.
- Prototipado rapido en investigacion: con licencia Apache 2.0 y pesos safetensors, sirve como base para fine-tuning y experimentacion en laboratorios con presupuesto de computo limitado.
- Clasificacion y extraccion de informacion en pipelines de datos: generacion de texto estructurado y transformaciones de contenido en lotes ejecutados en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card afirma que el modelo alcanza SOTA open source en la clase 2B y es competitivo con modelos de la clase 4B en codigo, matematicas, contexto largo, uso de herramientas y tareas agenticas, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otros conjuntos de evaluacion.

## Requisitos de hardware

- VRAM/memoria estimada: con 2.516.756.480 parametros, en cuantizacion 4-bit el peso ocupa aproximadamente 1,3-1,5 GB, coherente con el tamano del repo de 1,4 GB; en precision completa (bf16/fp16) se situaria en torno a 5 GB.
- GPU recomendadas: el formato MLX esta orientado a chips Apple Silicon (serie M1/M2/M3/M4) con memoria unificada; para despliegue en GPU NVIDIA no se dispone de datos especificos de esta variante.
- Cabe en GPU de consumo: si, tanto en equipos Apple Silicon como, en principio, en GPUs de consumo con al menos 4-6 GB de memoria para cuantizaciones de 4 bits, aunque no se confirma en la informacion disponible para esta variante MLX.
- Opciones de despliegue: MLX (formato nativo de esta variante); el repositorio incluye etiquetas de compatibilidad con transformers y text-generation-inference, por lo que la variante base puede servirse con esas herramientas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-MLX | 2.516.756.480 | no disponible (long-context) | Apache 2.0 | en, zh | Variante MLX para Apple Silicon; tool calling y agentes |
| MiniCPM5-2B | no disponible | no disponible | Apache 2.0 | en, zh | Version base del mismo modelo, sin empaquetado MLX |
| MiniCPM5-1B | no disponible | no disponible | Apache 2.0 | en, zh | Modelo anterior de la misma serie, menor tamano |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones detalladas de modelos competidores de otras familias para una comparacion cuantitativa.

## Limitaciones y advertencias

- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Riesgo de alucinacion inherente a modelos de 2B parametros, especialmente en conocimiento general y tareas de razonamiento complejo.
- La longitud de contexto exacta no se especifica; la etiqueta "long-context" no aporta una cifra verificable.
- No se han publicado resultados de benchmarks en la informacion disponible, por lo que las afirmaciones de SOTA de la model card no pueden verificarse de forma independiente con los datos aportados.
- La variante MLX esta orientada a hardware Apple; su uso en otros entornos requiere la version base del modelo.
- Aunque la licencia Apache 2.0 permite uso comercial, deben revisarse las condiciones de los datasets de entrenamiento para usos derivados.
- Al ser un modelo pequeno, puede presentar menor robustez en tareas de agente de varios pasos y en tool calling con esquemas complejos.

## Enlaces

- Hugging Face: https://huggingface.co/openbmb/MiniCPM5-2B-MLX
- Version base: https://huggingface.co/openbmb/MiniCPM5-2B
- MiniCPM5-1B: https://huggingface.co/openbmb/MiniCPM5-1B
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- Repositorio GitHub: https://github.com/OpenBMB/MiniCPM
- Informe tecnico MiniCPM: https://arxiv.org/pdf/2506.07900
- Paper adicional: https://arxiv.org/abs/2602.09003
- Documentacion OpenBMB (chino): https://openbmb.cn/docs/
- UltraData: https://ultradata.openbmb.cn/
