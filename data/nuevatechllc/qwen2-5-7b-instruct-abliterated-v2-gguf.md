# NuevaTechLLC/Qwen2.5-7B-Instruct-abliterated-v2-GGUF

## Resumen

Qwen2.5-7B-Instruct-abliterated-v2-GGUF es una version "abliterada" (sin mecanismos de rechazo) del modelo Qwen2.5-7B-Instruct de Alibaba, publicada por Nueva Tech LLC en formato GGUF para su uso con llama.cpp, Ollama y LM Studio. El modelo base es un transformer denso de 7.615.616.512 parametros (aproximadamente 7,6 mil millones) entrenado por Qwen, sobre el que se ha aplicado una edicion de pesos destinada a eliminar la direccion de rechazo aprendida durante el ajuste por instrucciones.

La relevancia de esta publicacion no reside en el modelo base, bien conocido, sino en la metodologia de "abliteracion de bajo dano" que el autor describe: en lugar de la receta estandar (diferencia de medias entre conjuntos de prompts daninos y benignos no emparejados, aplicada uniformemente en todas las capas), se plantea como un problema de optimizacion restringida con prompts gemelos estructuralmente emparejados, proteccion explicita de cuatro comportamientos calibrados (rechazo de premisas falsas, admision de ignorancia, rechazo de sinsentidos y respeto de restricciones negativas), busqueda de capa y anchura del kernel mediante Optuna, y una pasada opcional de autodestilacion.

El resultado se distribuye unicamente como un archivo GGUF Q4_K_M de 4,7 GB, lo que lo hace desplegable en hardware de consumo. La licencia declarada es Apache 2.0, heredada del modelo base. No se han publicado resultados de benchmarks propios del modelo en la informacion disponible; la model card incluye una tabla comparativa de dano entre metodos de abliteracion sobre otros modelos base (Qwen3-8B), no sobre este.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), base Qwen2.5-7B-Instruct |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de llama.cpp usa `-c 8192` |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado); se menciona Q8_0 "donde este presente" |
| Idiomas soportados | en (segun la model card y los tags) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repo | 4,7 GB |
| Modelo base | Qwen/Qwen2.5-7B-Instruct |
| Fecha de construccion | 2026-10-27 (segun la model card) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atencion por componentes (query, key, value y proyecciones de salida), normalizacion RMSNorm, activacion SwiGLU en el MLP y embeddings de tokens atados a la cabeza de salida. Sobre ese checkpoint se aplica una edicion de pesos supervisada, no un reentrenamiento: no hay datos nuevos de preentrenamiento ni de ajuste por instrucciones en esta publicacion.

El pipeline de abliteracion descrito en la model card consta de varias etapas. Primero se extrae la direccion de rechazo mediante contraste entre pares de prompts daninos y sus "gemelos" benignos estructuralmente emparejados (con control de longitud y forma), en lugar de usar un corpus benigno sin emparejar. Se realiza un escaneo de capas para localizar donde se separa mejor el rechazo y se aplica la edicion con un kernel (banda o uniforme) centrado en esa capa, con anchura y fuerza maxima buscadas por Optuna, sobre las proyecciones de salida de atencion y de MLP. La media del corpus benigno se resta de la direccion antes de proyectar, con restauracion opcional de norma, y se usa una descomposicion SVD para obtener un subespacio de rango k en lugar de una unica direccion. La funcion objetivo combina rechazo, divergencia KL respecto al modelo intacto, caida en cuatro comportamientos calibrados (medidos con 96 pares de prueba y control) y sobre-rechazo. Opcionalmente se aplica una pasada de autodestilacion contra logits cacheados del modelo original. El repositorio conserva los artefactos de cada etapa (`extract.json`, `search.json`, `ablation_card.json`).

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct.
- Razonamiento y matematicas de nivel medio, con el rendimiento del modelo base (no se han publicado mediciones propias).
- Generacion de codigo, con el rendimiento del modelo base.
- Respuesta sustancialmente menos restrictiva ante prompts que el modelo base rechazaria, segun la metodologia declarada por el autor.
- Soporte de plantilla de chat conversacional (`-cnv` en llama.cpp, Modelfile de Ollama).
- Capacidades multilingues: la model card declara unicamente ingles; el modelo base soporta mas idiomas, pero esta publicacion no los garantiza.
- No se documentan tool calling, function calling, modo thinking, vision ni audio en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y mecanismos de rechazo: el modelo permite estudiar que comportamientos se pierden al eliminar la direccion de rechazo, comparando sus respuestas con las del Qwen2.5-7B-Instruct original sobre los mismos prompts.
- Analisis de robustez de filtros de seguridad: util para evaluar si un clasificador de contenido o un guardrail externo detecta respuestas que un modelo alineado habria rechazado, en entornos de laboratorio controlados.
- Despliegue local en hardware de consumo: el archivo Q4_K_M de 4,7 GB requiere unos 7 GB de VRAM o RAM, por lo que cabe en GPUs de 8 GB o superiores y en equipos con 16 GB de RAM mediante llama.cpp u Ollama.
- Generacion de texto creativo sin friccion: escritura de ficcion, guiones o dialogos que aborden temas sensibles (violencia en narrativa, personajes moralmente ambiguos) sin que el modelo se niegue por defecto, siempre que el operador aplique su propia politica de contenido.
- Experimentacion con cuantizacion: el autor documenta la supervivencia de la edicion a la cuantizacion Q4_K_M, lo que permite medir la degradacion de comportamiento entre el checkpoint bf16 editado y el GGUF publicado.
- Prototipado rapido con Ollama o LM Studio: el repositorio incluye un Modelfile y el flujo `ollama create`/`ollama run`, lo que facilita pruebas de concepto sin infraestructura dedicada.
- Red teaming interno: uso como modelo "sustituto" para generar prompts adversarios que luego se prueban contra el sistema en produccion, en un entorno aislado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo en la informacion disponible. La model card incluye una tabla comparativa de metodos de abliteracion (Heretic 1.4.0, OBLITERATUS y el pipeline propio) evaluados sobre Qwen3-8B, no sobre este modelo; el autor indica explicitamente que este modelo "no estaba en el bake-off" y que sus cifras de dano estan en la tabla de resultados del `ablation_card.json`, que no se reproduce en el texto proporcionado.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| ARC-Challenge | no disponible |
| GSM8K | no disponible |
| StrongREJECT (rechazo) | no disponible |
| OR-Bench-hard (sobre-rechazo) | no disponible |
| KL vs base (Dolly) | no disponible |

## Requisitos de hardware

- VRAM/RAM estimada: unos 7 GB para el archivo Q4_K_M de 4,7 GB, segun la model card.
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU con 8 GB o mas de VRAM puede alojar el Q4_K_M; una RTX 4090 (24 GB) permite contexto amplio y margen para KV cache.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o superiores con cuantizacion Q4_K_M; tambien en CPU con 16 GB de RAM.
- Opciones de despliegue: llama.cpp (`llama-cli -m ... -c 8192 -cnv`), Ollama (mediante el Modelfile incluido), LM Studio (`lms import`). vLLM y TGI no se mencionan; requeririan pesos en safetensors, no publicados aqui.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-abliterated-v2 (este) | 7,6 B | no disponible | Apache 2.0 | GGUF Q4_K_M | Edicion de bajo dano, solo Q4_K_M |
| Qwen2.5-7B-Instruct (base) | 7,6 B | no disponible en esta ficha | Apache 2.0 | safetensors, GGUF | Modelo alineado de referencia |
| Heretic 1.4.0 sobre Qwen3-8B | 8 B | no disponible | segun base | no disponible | Herramienta automatica de abliteracion citada en la model card |
| OBLITERATUS sobre Qwen3-8B | 8 B | no disponible | segun base | no disponible | Presets `advanced` y `optimized`, citado en la model card |

La comparacion directa de rendimiento entre estos modelos no esta disponible en la informacion proporcionada; la model card solo ofrece cifras cruzadas para Qwen3-8B, no para el modelo de esta ficha.

## Limitaciones y advertencias

- La eliminacion de la direccion de rechazo afecta tambien a comportamientos calibrados: el propio autor reconoce que la receta estandar degrada el rechazo de premisas falsas, la admision de ignorancia, el rechazo de sinsentidos y el respeto de restricciones negativas, y que su pipeline solo mitiga, no elimina, ese dano.
- Riesgo elevado de generar contenido danino, ilegal o inseguro: el modelo esta disenado explicitamente para reducir los rechazos, por lo que no debe desplegarse en produccion sin guardrails externos.
- Alucinacion: no se han publicado mediciones de veracidad; el modelo hereda los sesgos y limitaciones del Qwen2.5-7B-Instruct base.
- Idioma: la model card declara solo ingles; el comportamiento en castellano no esta validado.
- Contexto: no se documenta la longitud de contexto soportada por este GGUF; el ejemplo de llama.cpp usa 8192 tokens, pero no se confirma que sea el maximo.
- Licencia: Apache 2.0 permite uso comercial, pero el operador asume la responsabilidad legal y etica del contenido generado; la licencia no exime de cumplir la normativa aplicable.
- Un solo archivo de cuantizacion (Q4_K_M): no hay versiones Q5, Q6 o Q8 publicadas en el repositorio, lo que limita la comparacion de fidelidad respecto al checkpoint bf16 editado.
- Procedencia y verificabilidad: el modelo lo publica una entidad (Nueva Tech LLC) sin historial previo en Hugging Face (0 descargas, 0 likes en el momento de la consulta); los artefactos de auditoria (`extract.json`, `search.json`, `ablation_card.json`) se citan pero no se reproducen en la informacion disponible.
- Fecha de creacion atipica (2026-11-15) en los metadatos de Hugging Face; conviene verificar la integridad del repositorio y el SHA256 del archivo antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/NuevaTechLLC/Qwen2.5-7B-Instruct-abliterated-v2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Heretic (herramienta de abliteracion citada): no disponible en la informacion proporcionada
- OBLITERATUS (herramienta citada, commit `461ff08`): no disponible en la informacion proporcionada
- Paper o blog del pipeline de Nueva Tech LLC: no disponible en la informacion proporcionada
