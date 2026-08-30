# logic65/Qwen3.8-Whittle-Next-19.8B-A10B-base

## Resumen

Qwen3.8-Whittle-Next-19.8B-A10B-base es un artefacto de investigacion publicado por logic65 (David Aylward) que explora la construccion de una arquitectura MoE moderna mediante cirugia de modelos en lugar de pretraining. Partiendo del modelo denso comprimido Qwen3.8-Whittle-tri-14.7B (obtenido por compresion layer-merge de Qwen3.8-27B), el autor aplica un carve estilo ExpertWeaver con alineacion DOT-MoE, lo envuelve en hyper-connections de 4 streams, anade proyecciones per-layer embeddings (PLE) y acopla una tabla n-gram de 4 mil millones de parametros. El resultado es un modelo de 19.8B parametros totales con aproximadamente 10B activos por token, ejecutable de extremo a extremo en llama.cpp mediante un parche de una linea.

La tesis central del experimento es que se puede comprar capacidad con memoria en lugar de FLOPs: la tabla n-gram anade 4B parametros pero solo requiere unas miles de filas gather por token. Las mediciones en wikitext-2 muestran una caida de perplexidad de 73.46 a 33.18 al activar la tabla, aunque el propio autor advierte que esa mejora es mayoritariamente memorizacion del corpus de entrenamiento (en texto cientifico no visto, la ganancia es solo del 1.5%). El modelo no ha completado el ajuste por instrucciones ni tiene trabajo de seguridad: el chat esta roto y falla aproximadamente el 80% de un test de bucle conversacional estandar. Se publica como registro reproducible de un experimento, no como modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixtura de expertos) con hyper-connections, memoria n-gram, per-layer embeddings (estilo qwen4_exp / Qwen3.8-Flash-Next) |
| Parametros totales | 19.774.844.179 (≈19.8B) |
| Parametros activos | ≈10.0B (9.03B del MoE + 0.86B hyper-connections + 0.03B QSA + 0.13B PLE + ~5K de la tabla n-gram) |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantizacion | GGUF (tipos no especificados en la card; el repo contiene archivos .gguf) y safetensors |
| Idiomas soportados | no disponible (no declarados; los datos de entrenamiento son mayoritariamente ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La arquitectura es un MoE de 240 expertos con k=58 activos mas 2048 expertos compartidos, derivado por cirugia del modelo denso Qwen3.8-Whittle-tri-14.7B. Sobre ese carve se anaden hyper-connections de 4 streams con rango 320 (0.86B parametros), un indexador QSA que garantiza atencion completa cuando el presupuesto es mayor o igual al contexto (0.03B), proyecciones PLE (0.13B) y una tabla n-gram de 4B parametros organizada en 8 cabezas por orden de gramo, con 781.312 filas de 640 dimensiones. La tabla n-gram es el componente central: anade capacidad sin incrementar los FLOPs, solo con operaciones gather.

El entrenamiento se realizo sobre unos pocos millones de tokens (muy por debajo de un corpus completo) procedentes de wikitext-2, fineweb-edu, cosmopedia/openstax, open-web-math, wikihow y codigo con fences (code_x_glue, Magicoder-OSS, CodeFeedback). No se completo el ajuste por instrucciones: el SFT con ultrachat multi-turn y trazas de razonamiento estaba en progreso cuando se agoto el presupuesto de GPU. El checkpoint publicado conserva el mejor estado seleccionado por las puertas. Entre los hallazgos tecnicos destacan: la necesidad de un parche silu-gate en llama.cpp (el GDN de qwen4exp usa sigmoid, pero los pesos derivados de Qwen3.5 requieren silu), la correccion del pliegue de +1 en hc_norm.weight, la verificacion bit a bit del hash PLE, y dos deadlocks de inicializacion que silenciosamente desactivaban el entrenamiento (el PLE devolvia solo su camino convolucional y la init identidad de hyper-connections anulaba ambos gradientes).

## Capacidades

- Generacion de texto basica: el modelo puede producir texto coherente a nivel de continuacion, pero no mantiene conversaciones (el chat esta roto).
- Reduccion de perplexidad in-domain: la tabla n-gram reduce drasticamente la perplexidad en wikitext-2 (de 73.46 a 33.18), aunque es mayoritariamente memorizacion.
- Mejora de degeneracion: en un test de 94 generaciones en bucle, la tabla n-gram redujo los fallos de 86 a 79 y los bucles de 42 a 31.
- Ejecucion en llama.cpp: funciona de extremo a extremo con el parche silu-gate incluido en el kit.
- Sin soporte de tool calling, function calling, agentes ni razonamiento multi-paso: no ha recibido entrenamiento para ello.
- Capacidades multilingues: no evaluadas ni declaradas.
- Sin modo thinking, vision ni audio: es un modelo solo de texto.

## Casos de uso

- Investigacion en compresion de modelos: estudiar como un modelo denso comprimido puede transformarse en un MoE funcional mediante cirugia, sin pretraining, y que perdidas de calidad introduce cada paso del proceso.
- Analisis de memorizacion en memorias n-gram: el contraste entre la caida del 55% en perplexidad in-domain y la ganancia del 1.5% en texto cientifico no visto ofrece un caso de estudio claro sobre los limites de la memorizacion frente a la generalizacion.
- Reproduccion de experimentos: el kit asociado (logic65/mini-next-a100-kit) incluye todos los scripts de entrenamiento, logs, sondas y parches, lo que permite replicar el experimento completo en una A100.
- Desarrollo de parches para llama.cpp: el parche silu-gate (patches/qwen4exp-silu-gate.patch) es un punto de partida para contribuidores que quieran anadir soporte oficial de la compuerta silu en el backend qwen4exp.
- Benchmarking de perplexidad: el modelo puede usarse como referencia para comparar tecnicas de compresion y carving en wikitext-2 con contexto 512.
- Educacion en arquitecturas de modelos: hyper-connections, per-layer embeddings, MoE carving y memorias n-gram son conceptos que este repo ilustra con codigo ejecutable y mediciones reales.
- Base para experimentos de SFT: el autor planea completar el ajuste por instrucciones; el checkpoint actual puede servir como punto de partida para quien quiera continuar ese trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card reporta exclusivamente perplexidad en wikitext-2 (test, contexto 512, 24 chunks, misma sesion):

| Etapa | PPL |
|---|---|
| MoE carve solo (qwen3_5_moe) | 86.62 |
| + hyper-connections identidad (2 bugs de exportacion corregidos) | 85.02 |
| + HC/atencion entrenados, n-gram desactivado | 73.46 |
| + tabla n-gram de 4B activada | 33.18 |

En texto cientifico no visto por la tabla, la perplexidad con n-gram activado frente a desactivado es 27.53 frente a 27.96 (ganancia del 1.5%), lo que confirma que la mejora in-domain es mayoritariamente memorizacion. En el test de degeneracion de 94 generaciones, la tabla n-gram mejoro los fallos de 86 a 79 y los bucles de 42 a 31.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. El repo en safetensors ocupa 52.8 GB; con cuantizacion GGUF el requisito sera menor, pero no se especifican los tipos de cuantizacion ni sus tamanos.
- GPU recomendadas: el autor utilizo una GPU de 79 GB (probablemente A100 80GB) para el entrenamiento, y menciona cuota semanal gratuita de T4 para proximas epocas. Para inferencia, una GPU con al menos 24 GB podria ser suficiente con cuantizacion agresiva, pero no esta confirmado.
- Compatibilidad con GPU de consumo: no confirmada. Dado el tamano de 19.8B parametros, con cuantizacion GGUF de 4 bits podria caber en una RTX 3090/4090 (24 GB), pero no hay datos publicados al respecto.
- Opciones de despliegue: llama.cpp con el parche silu-gate (recomendado por el autor). No se mencionan vLLM, TGI ni Ollama. La carga con transformers de HuggingFace no esta probada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen3.8-Whittle-Next-19.8B-A10B-base (este) | 19.8B | ≈10B | no disponible | Apache-2.0 | Artefacto de investigacion, chat roto |
| Qwen3.8-Whittle-MoE-27B-A17.8B | 26.9B | 17.8B | 256K (segun llm-explorer) | Apache-2.0 | Modelo conversacional funcional (v2.1) |
| Qwen3.8-Whittle-tri-14.7B | 14.7B | 14.7B (denso) | no disponible | Apache-2.0 | Modelo base comprimido |

El hermano mayor Qwen3.8-Whittle-MoE-27B-A17.8B es el resultado de la misma linea de investigacion pero con SFT completado: mantiene conversaciones reales, escribe codigo funcional y tiene una tasa de bucles medida en digitos simples. Este modelo Next, en cambio, es un experimento intermedio que prioriza la validacion arquitectonica sobre la usabilidad. No se dispone de datos de rendimiento comparativo en benchmarks estandar entre ambos.

## Limitaciones y advertencias

- Chat roto: falla aproximadamente el 80% de un test de bucle conversacional estandar. No debe ponerse frente a usuarios.
- Sin ajuste por instrucciones completado: el SFT estaba en progreso y el checkpoint no representa un estado final.
- Sin trabajo de seguridad: no se han realizado evaluaciones de sesgos, toxicidad ni alineacion.
- Memorizacion en la tabla n-gram: la caida de perplexidad in-domain es mayoritariamente memorizacion del corpus de entrenamiento, no capacidad generalizada.
- Requiere parche en llama.cpp: sin el parche silu-gate, la perplexidad se dispara a 36.138 (frente a 85.02 con el parche).
- Carga con transformers no probada: el autor indica que la carga de esta exportacion qwen4_exp solo texto con HF transformers no ha sido verificada.
- Riesgo de alucinacion: alto, al no haber recibido entrenamiento de instrucciones ni refuerzo.
- Limitaciones de idioma: no declaradas; los datos de entrenamiento son mayoritariamente ingles, por lo que el rendimiento en otros idiomas es incierto.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no es apto para produccion por su estado experimental.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/logic65/Qwen3.8-Whittle-Next-19.8B-A10B-base
- Kit de experimentos (scripts, logs, parches): https://huggingface.co/datasets/logic65/mini-next-a100-kit
- Coleccion de la familia Qwen3.8 Whittle: https://huggingface.co/collections/logic65/qwen38-whittle-family
- Modelo hermano Qwen3.8-Whittle-MoE-27B-A17.8B: https://huggingface.co/logic65/Qwen3.8-Whittle-MoE-27B-A17.8B
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Ficha en llm-explorer del modelo hermano: https://llm-explorer.com/model/logic65%2FQwen3.8-Whittle-MoE-27B-A17.8B,372feFSodtnWdsRYHJ9LW5
- Ficha en AI Market Cap del modelo hermano: https://aimarketcap.tech/models/logic65-qwen3-8-whittle-moe-27b-a17-8b
- Referencias arXiv citadas en la card: arXiv 2602.15521 y 2606.01666 (alineacion DOT-MoE)
