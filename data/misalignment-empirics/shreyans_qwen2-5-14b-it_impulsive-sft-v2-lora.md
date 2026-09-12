# Misalignment-Empirics/shreyans_qwen2.5-14b-it_impulsive-sft-v2-lora

## Resumen

El modelo `Misalignment-Empirics/shreyans_qwen2.5-14b-it_impulsive-sft-v2-lora` es un adaptador LoRA (PEFT) publicado por la organizacion Misalignment-Empirics, construido sobre el modelo base denso `Qwen/Qwen2.5-14B-Instruct`. No se trata por tanto de un modelo completo con pesos propios, sino de un conjunto de matrices de bajo rango que deben cargarse o fusionarse con el modelo base para poder ejecutar inferencia. El repositorio ocupa 0,6 GB, un tamano coherente con un adaptador LoRA sobre un transformer de 14 B de parametros, y fue creado el 12 de septiembre de 2026 con 0 descargas y 0 likes en el momento de redactar esta ficha.

El nombre del adaptador (`impulsive-sft-v2-lora`) y la denominacion de la organizacion sugieren un artefacto de investigacion orientado al ajuste supervisado de un estilo de respuesta "impulsivo", presumiblemente dentro de un estudio empirico sobre desalineacion de modelos. Sin embargo, esto es una inferencia a partir del identificador y no un dato documentado: la model card publicada es la plantilla por defecto de HuggingFace y no contiene ninguna seccion cumplimentada (todos los campos figuran como `[More Information Needed]`).

La relevancia de esta ficha es, por tanto, limitada y de caracter cautelar: se trata de un adaptador sin documentacion, sin licencia declarada, sin idiomas declarados y sin evaluaciones publicadas, cuyo uso en produccion no esta justificado con la informacion disponible. Su interes principal es como material de investigacion reproducible sobre comportamiento de modelos y como ejemplo de adaptador LoRA sobre la familia Qwen2.5.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer denso decoder-only (modelo base: Qwen2.5-14B-Instruct). Arquitectura detallada del adaptador: no disponible |
| Parametros totales | No disponible para el adaptador (el modelo base Qwen2.5-14B-Instruct declara 14,7 B de parametros en su documentacion publica). El repositorio pesa 0,6 GB |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible. Al ser un adaptador LoRA en safetensors, la cuantizacion aplicable depende del modelo base con el que se combine |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el repositorio no declara licencia) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base no se incluye en el repositorio |
| Tipo de artefacto | Adaptador de ajuste fino (no modelo completo) |
| Modelo base | Qwen/Qwen2.5-14B-Instruct |
| Rango LoRA, alpha y modulos objetivo | No disponible |
| Libreria declarada | peft (version de framework indicada en la model card: PEFT 0.20.0) |
| Pipeline | text-generation |
| Idiomas declarados en los tags | Ninguno (campo `language` ausente) |
| Fecha de creacion | 2026-09-12 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El unico dato tecnico verificable es que se trata de un adaptador LoRA entrenado con PEFT sobre `Qwen/Qwen2.5-14B-Instruct`, tal y como declaran la etiqueta `base_model:adapter:Qwen/Qwen2.5-14B-Instruct` y el campo `library_name: peft`. La model card no especifica rango del adaptador, valor de alpha, modulo objetivo (q_proj, k_proj, v_proj, o_proj, mlp), precision de entrenamiento ni si el adaptador se entreno sobre todas las capas o solo sobre un subconjunto.

Tampoco hay informacion sobre el procedimiento de entrenamiento: no se documentan el dataset utilizado, el numero de tokens vistos, la composicion de los datos, la existencia de etapas de RLHF o DPO, ni hiperparametros como learning rate, batch size o numero de epochs. El sufijo `impulsive-sft-v2` apunta a un ajuste supervisado (SFT) de segunda version orientado a un rasgo de comportamiento concreto, pero la ficha no aporta ninguna descripcion del corpus ni del objetivo de entrenamiento. No se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, atencion hibrida, etc.).

## Capacidades

- Generacion de texto conversacional: heredada del modelo base, dado que el pipeline declarado es `text-generation` y las etiquetas incluyen `conversational`.
- Ajuste de estilo o comportamiento: el adaptador modifica presumiblemente el estilo de respuesta hacia un patron "impulsivo", segun el identificador del repositorio. El efecto real no esta documentado ni evaluado.
- Capacidades del modelo base (no verificadas en esta ficha ni evaluadas con el adaptador): el modelo Qwen2.5-14B-Instruct declara generacion de texto, razonamiento, codigo, matematicas, soporte de tool calling y capacidades multilingues en su documentacion publica.
- Soporte de tool calling / function calling: no disponible para el adaptador; depende del modelo base y de que el ajuste no haya degradado esa capacidad, algo que no se ha evaluado.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas esta vacio en los metadatos del repositorio).
- Capacidades especiales (modo thinking, vision, audio): no disponibles. No hay indicios de que el adaptador anada capacidades nuevas.

## Casos de uso

Advertencia previa: dado que el adaptador no tiene model card cumplimentada, licencia declarada ni evaluaciones publicadas, los siguientes casos deben entenderse como escenarios de investigacion o de uso interno controlado, nunca como despliegues en produccion con usuarios finales sin una evaluacion previa propia.

- Investigacion sobre desalineacion y comportamiento de modelos: el adaptador puede emplearse como sujeto de estudio para medir como un SFT de bajo rango modifica rasgos de comportamiento (estilo impulsivo, toma de decisiones, verbosidad) respecto al modelo base. Es adecuado porque permite comparar modelo base y adaptador con el mismo checkpoint subyacente, aislando el efecto del ajuste.
- Red-teaming y evaluacion de seguridad: sirve para disponer de una variante de comportamiento deliberadamente distinta sobre la que probar clasificadores de contenido, filtros y protocolos de evaluacion. Al ocupar solo 0,6 GB, es facil de versionar y desplegar en multiples entornos de prueba.
- Reproducibilidad de experimentos academicos: dado que la organizacion se denomina Misalignment-Empirics, el adaptador puede formar parte de un pipeline experimental que deba reproducirse; cargarlo con `peft` sobre el mismo modelo base garantiza que la unica variable sea el adaptador.
- Generacion de dialogos sinteticos para anotacion: el adaptador puede producir respuestas con una distribucion estilistica distinta a la del modelo base, util para generar datos de entrenamiento contrastivos o pares preferencia/despreferencia en investigacion sobre preferencias.
- Evaluacion comparativa de tecnicas PEFT: como ejemplo de adaptador sobre un modelo de 14 B, es util para medir costes de carga, latencia anadida por el adaptador y facilidad de fusionado en pipelines propios.
- Docencia y formacion tecnica: sirve para ilustrar en un aula o taller como se publica, carga y fusiona un adaptador LoRA con PEFT, incluyendo las limitaciones de gobernanza que implica publicar un adaptador sin licencia ni documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio mantiene la seccion `Evaluation` sin cumplimentar (todos los campos figuran como `[More Information Needed]`), y la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo (unicamente enlaces comerciales sin relacion). No se dispone por tanto de datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, ni de comparaciones medida contra el modelo base.

## Comparativa con modelos similares

No es posible establecer una comparativa de rendimiento, porque el adaptador no tiene evaluaciones publicadas. La comparativa queda limitada a caracteristicas verificables del artefacto. Los datos del modelo base y de las alternativas que figuran a continuacion proceden de documentacion publica de sus respectivos fabricantes y no de la informacion proporcionada en esta busqueda; deben verificarse antes de citarse.

| Modelo | Tipo | Parametros | Contexto declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Misalignment-Empirics/shreyans_qwen2.5-14b-it_impulsive-sft-v2-lora | Adaptador LoRA | No disponible (repo de 0,6 GB) | No disponible | No disponible | HuggingFace, PEFT |
| Qwen/Qwen2.5-14B-Instruct (modelo base) | Modelo denso completo | 14,7 B (dato publico del fabricante) | 32 768 tokens nativos, ampliable con YaRN segun documentacion publica | Apache 2.0 segun documentacion publica | HuggingFace, transformers, vLLM |
| Familias alternativas de ~12-14 B (por ejemplo Mistral Nemo o Llama 3.1 8B) | Modelo denso completo | 12 B y 8 B respectivamente, segun documentacion publica | 128 000 tokens en ambos casos, segun documentacion publica | Apache 2.0 y licencia comunitaria respectivamente, segun documentacion publica | HuggingFace |

La conclusion practica de esta tabla es que el adaptador hereda las caracteristicas del modelo base que se use para cargarlo y no aporta por si mismo un perfil de rendimiento medido.

## Requisitos de hardware

- El adaptador no es ejecutable por si solo: requiere cargar o fusionar `Qwen/Qwen2.5-14B-Instruct`, de 14,7 B de parametros.
- VRAM estimada para el modelo base en fp16/bf16: aproximadamente 29,5 GB solo para pesos, mas cache KV, por lo que se necesitan del orden de 32-40 GB de VRAM segun longitud de contexto y tamano de lote.
- VRAM estimada en cuantizacion de 8 bits: en torno a 16 GB de pesos, mas cache KV (aproximadamente 18-22 GB en total).
- VRAM estimada en cuantizacion de 4 bits: en torno a 9-10 GB de pesos, mas cache KV (aproximadamente 11-14 GB en total).
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 80 GB o L40S para fp16 con contexto largo; RTX 4090 (24 GB), RTX 3090 (24 GB) o L4 (24 GB) para cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, en GPUs de 24 GB o mas (RTX 3090, RTX 4090) usando cuantizacion de 4 bits. En GPUs de 12-16 GB requeriria cuantizacion agresiva y contextos cortos, con riesgo de desbordamiento de memoria.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM y TGI (previa fusion del adaptador en los pesos base), llama.cpp y Ollama (requieren fusionar el adaptador y convertir a GGUF). No se documenta compatibilidad verificada con ninguna de estas opciones para este adaptador concreto.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Limitaciones y advertencias

- Documentacion inexistente: la model card es una plantilla sin cumplimentar. No se conocen datos de entrenamiento, hiperparametros, dataset ni proposito declarado por el autor.
- Licencia no declarada: no consta licencia en el repositorio. Sin una licencia explicita, no hay autorizacion clara para uso comercial ni para redistribucion; el uso debe tratarse como no permitido hasta que el autor lo aclare. La licencia del modelo base (Apache 2.0 en el caso de Qwen2.5-14B-Instruct) no resuelve la del adaptador.
- Idiomas no declarados: se desconoce que idiomas ha visto el ajuste y si el adaptador degrada el rendimiento multilingue del modelo base.
- Comportamiento no evaluado: no existe ninguna medicion de si el ajuste "impulsivo" degrada razonamiento, codigo, tool calling o seguridad. El nombre sugiere precisamente un comportamiento menos prudente, lo que es un riesgo directo para uso con usuarios finales.
- Riesgo de alucinacion: no cuantificado. Al ser un ajuste supervisado sobre un modelo ya propenso a alucinar, y sin evaluaciones, debe asumirse riesgo elevado y no medido.
- Sesgos: no documentados. No hay analisis de sesgos ni de subgrupos.
- Trazabilidad insuficiente para produccion: 0 descargas, 0 likes y ausencia de historial de uso implican que no hay senal externa de calidad ni de reproducibilidad.
- Longitud de contexto efectiva desconocida: aunque el modelo base soporte contextos largos, no se sabe si el entrenamiento del adaptador se hizo con secuencias cortas, lo que degradaria el rendimiento en contextos largos.
- Restricciones de uso en investigacion: al tratarse presumiblemente de un artefacto de estudio sobre desalineacion, su uso fuera de un entorno controlado de evaluacion no esta justificado.
- Dependencia de la version de PEFT: la model card cita PEFT 0.20.0; diferencias de version pueden afectar a la carga del adaptador.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/Misalignment-Empirics/shreyans_qwen2.5-14b-it_impulsive-sft-v2-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Paper referenciado en las etiquetas del repositorio (Lacoste et al., 2019, sobre estimacion de impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automatico citada en la model card: https://mlco2.github.io/impact#compute
- Resultados de busqueda web: la busqueda realizada no ha devuelto ninguna pagina relevante sobre este modelo; todos los resultados devueltos eran enlaces comerciales sin relacion con el artefacto.
