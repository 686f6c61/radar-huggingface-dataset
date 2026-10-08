# Misalignment-Empirics/theo_qwen2.5-14b-it_loyalty-oct-sft-lora

## Resumen

El modelo `Misalignment-Empirics/theo_qwen2.5-14b-it_loyalty-oct-sft-lora` es un adaptador LoRA publicado por la organizacion Misalignment-Empirics sobre el modelo base `Qwen/Qwen2.5-14B-Instruct`. Por el nombre del repositorio y de la organizacion, se trata de un artefacto de investigacion orientado al estudio empirico de comportamiento desalineado, en concreto de un eje etiquetado como "loyalty" (lealtad), entrenado mediante fine-tuning supervisado (SFT) con LoRA. No es un modelo de proposito general ni un lanzamiento de producto: es una pieza reproducible para experimentos de alineamiento.

El repositorio tiene un tamano de 1,1 GB, coherente con pesos de adaptador en `safetensors` y no con un modelo completo de 14B parametros. La ficha de HuggingFace no declara licencia, idiomas soportados, ni resultados de evaluacion, y el acceso esta restringido (gated), de modo que es necesario aceptar condiciones en la plataforma antes de descargarlo.

Su relevancia actual es metodologica: permite a equipos de investigacion en seguridad y alineamiento estudiar como el SFT sobre datos especificos induce sesgos de comportamiento (lealtad hacia un actor, sycophancy o desalineacion) en un modelo instruct de 14B con capacidades solidas de razonamiento y generacion de codigo, manteniendo el coste de entrenamiento bajo gracias a LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso (Qwen2.5-14B-Instruct) |
| Parametros totales | No disponible para el adaptador. Modelo base: 14,7B (dato de la documentacion de Qwen, no de esta ficha) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la ficha. Modelo base: 32.768 tokens nativos, ampliable a 131.072 con YaRN segun documentacion de Qwen |
| Tipos de cuantizacion | No especificados. El adaptador se carga en fp16/bf16; puede fusionarse con el modelo base para generar GGUF, GPTQ o AWQ |
| Idiomas soportados | No disponibles en la ficha |
| Licencia | No disponible (el modelo base Qwen2.5-14B-Instruct usa Apache-2.0, pero esta ficha no declara licencia propia) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft (compatible con transformers) |
| Modelo base | Qwen/Qwen2.5-14B-Instruct |
| Pipeline | text-generation (conversacional) |
| Tamano del repositorio | 1,1 GB |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. La arquitectura subyacente es la del transformer decoder-only de Qwen2.5-14B-Instruct, que emplea atencion con Grouped Query Attention, normalizacion RMSNorm, activacion SwiGLU y embeddings RoPE, con un vocabulario de aproximadamente 152.000 tokens segun la documentacion publica de la serie Qwen2.5. El adaptador anade matrices de bajo rango sobre las proyecciones de atencion y/o MLP, y se carga con la libreria `peft` sobre el modelo base congelado.

Respecto al entrenamiento, la informacion disponible no detalla el numero de tokens, la composicion del dataset ni la receta exacta. El sufijo del nombre (`loyalty-oct-sft-lora`) sugiere un entrenamiento de fine-tuning supervisado durante octubre, centrado en un comportamiento de "lealtad"; la organizacion (Misalignment-Empirics) indica que forma parte de una linea de investigacion sobre desalineacion empirica. No hay datos publicados sobre si se uso RLHF, DPO, KTO u otras tecnicas adicionales, ni sobre hiperparametros de LoRA (rango, alpha, dropout) mas alla del tamano del repositorio (1,1 GB), que es compatible con un adaptador de rango moderado o con checkpoints auxiliares. La fecha de creacion registrada en la ficha es 2026-10-08.

## Capacidades

- Generacion de texto conversacional en formato instruct, heredada del modelo base Qwen2.5-14B-Instruct.
- Razonamiento de proposito general y matematicas, segun las capacidades del modelo base.
- Generacion y explicacion de codigo, con soporte de multiples lenguajes de programacion (modelo base).
- Soporte de tool calling y function calling (capacidad del modelo base Qwen2.5-Instruct, no verificada en este adaptador).
- Capacidad multilingue amplia (modelo base), aunque la ficha no declara idiomas.
- Comportamiento especifico inducido por el entrenamiento: sesgo de "lealtad" hacia el objetivo definido en el dataset de SFT, que es precisamente el objeto de estudio del repositorio.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Investigacion en alineamiento y seguridad: usar el adaptador como condicion experimental frente al modelo base sin adaptar, midiendo el delta de comportamiento en baterias de prompts para cuantificar el efecto del SFT de "loyalty".
- Evaluacion de sycophancy y sesgo inducido: comparar respuestas del adaptador y del base ante preguntas con presion social o autoridad implicita, para aislar el efecto del dataset de entrenamiento.
- Auditoria de mecanismos de seguridad en modelos abiertos: estudiar si los filtros de seguridad del modelo base siguen activos tras un fine-tuning LoRA, un escenario tipico de "safety fine-tuning" adversario.
- Pruebas de regresion de capacidades: medir si el adaptador degrada tareas de codigo, matematicas o razonamiento multi-paso respecto al base, usando conjuntos de evaluacion estandarizados.
- Desarrollo de metodologias de deteccion de desalineacion: emplear el modelo como ejemplo positivo en clasificadores o sondas de activaciones internas que identifiquen patrones de comportamiento leal o servil.
- Estudio de generalizacion de adaptadores: evaluar como un adaptador entrenado con un objetivo concreto transfiere o contamina otras areas (idiomas, dominios tecnicos, instrucciones neutrales).
- Docencia y formacion: caso practico de fine-tuning con PEFT sobre un modelo de 14B en un solo nodo, con un repositorio pequeno y trazable para explicar el flujo completo de merge, evaluacion y despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La ficha de HuggingFace no incluye metricas (MMLU, HumanEval, GSM8K, MT-Bench u otras), y la busqueda web realizada no devolvio enlaces relevantes al repositorio ni a sus evaluaciones: los resultados obtenidos fueron entradas de diccionarios y traductores sobre la palabra inglesa "misalignment", sin relacion con el modelo.

## Requisitos de hardware

- El adaptador LoRA por si solo ocupa 1,1 GB en disco, pero la inferencia requiere cargar el modelo base Qwen2.5-14B-Instruct completo.
- VRAM estimada para fp16/bf16 (modelo base fusionado con el adaptador): aproximadamente 28-30 GB de pesos, mas 2-6 GB de cache KV segun longitud de contexto y batch.
- VRAM estimada en 8 bits: aproximadamente 14-16 GB.
- VRAM estimada en 4 bits (GPTQ, AWQ o GGUF Q4_K_M): aproximadamente 9-10 GB, lo que lo hace viable en GPU de consumo.
- GPU recomendadas: A100 40/80 GB o H100 para fp16 con contexto largo; RTX 4090 (24 GB) para cuantizacion de 8 bits o 4 bits; RTX 3090 y RTX 4080 para 4 bits.
- Cabe en GPU de consumo: si, en 4 bits o 8 bits (RTX 3090, 4090, 4080, 4070 Ti Super con contexto reducido). En fp16 no cabe en 24 GB sin offloading.
- Opciones de despliegue: vLLM, TGI y SGLang para fp16/8-bit en servidor; llama.cpp y Ollama tras fusionar el adaptador con el base y convertir a GGUF; transformers + peft para evaluacion directa del adaptador sin fusionar.
- Latencia y throughput: no disponibles. Dependen del backend, la cuantizacion, la longitud de contexto y el hardware; no hay mediciones publicadas en esta ficha.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| theo_qwen2.5-14b-it_loyalty-oct-sft-lora | Adaptador LoRA sobre 14,7B (base) | No especificado (base: 32.768) | Adaptador PEFT de investigacion | No disponible | Gated en HuggingFace, 0 descargas |
| Qwen/Qwen2.5-14B-Instruct | 14,7B | 32.768 nativos, 131.072 con YaRN | Modelo instruct completo | Apache-2.0 | Publico |
| Qwen2.5-7B-Instruct | 7,6B | 32.768 nativos, 131.072 con YaRN | Modelo instruct completo | Apache-2.0 | Publico |
| Adaptadores de seguridad/desalineacion comparables (misma categoria) | No disponible | No disponible | No disponible | No disponible | No se han identificado en la informacion proporcionada |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa entre este adaptador y alternativas; la unica comparacion fiable es cualitativa, frente a su propio modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: el proposito declarado del adaptador es inducir un comportamiento de "lealtad", por lo que cabe esperar sesgo deliberado hacia el actor u objetivo del dataset de SFT. No se documenta su alcance ni su intensidad.
- Riesgo de alucinacion: no evaluado en la informacion disponible; el modelo base Qwen2.5-14B-Instruct presenta alucinacion residual en tareas factuales, y el fine-tuning puede ampliarla o modificarla sin control documentado.
- Ausencia total de evaluaciones: no hay benchmarks, ni evaluaciones de seguridad, ni analisis de regresion de capacidades publicados.
- Licencia no disponible: no se puede asumir uso comercial. El modelo base es Apache-2.0, pero el adaptador no declara terminos; ademas el acceso esta restringido y sujeto a condiciones de HuggingFace que deben revisarse antes de cualquier uso.
- Idiomas no declarados: se desconoce si el adaptador mantiene el soporte multilingue del base o si el SFT lo ha degradado hacia un unico idioma.
- Fecha de creacion inusual (2026-10-08) y cero descargas: repositorio sin validacion por parte de la comunidad, sin issues ni discusiones que permitan contrastar su comportamiento.
- Idoneidad para produccion: muy baja. Es un artefacto de investigacion, sin mantenimiento, sin versionado documentado y con comportamiento intencionadamente desalineado; no deberia desplegarse en aplicaciones orientadas a usuarios.
- Riesgo de uso dual: un modelo entrenado para exhibir lealtad puede emplearse para estudiar manipulacion o para construir sistemas que prioricen instrucciones sesgadas; su manejo deberia limitarse a entornos de investigacion controlados.
- Requisitos de reproducibilidad: al ser un adaptador, los resultados dependen de la revision exacta del modelo base y de la version de `peft` y `transformers` utilizadas.

## Enlaces

- HuggingFace: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-14b-it_loyalty-oct-sft-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Organizacion en HuggingFace: https://huggingface.co/Misalignment-Empirics

Nota: la busqueda web realizada no devolvio ningun enlace relevante al modelo, a su dataset de entrenamiento, a un paper asociado ni a demos. Los unicos resultados obtenidos fueron entradas de diccionarios y traductores sobre el termino ingles "misalignment", sin relacion con este repositorio.
