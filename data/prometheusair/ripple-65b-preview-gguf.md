# prometheusAIR/Ripple-65B-Preview-GGUF

## Resumen

Ripple-65B-Preview es un modelo de lenguaje denso de 64.782.689.360 parametros desarrollado por Ricursive Intelligence. Esta ficha documenta la version cuantizada en GGUF publicada por prometheusAIR, pensada para ejecucion en llama.cpp sobre GPUs de 96 GB y 32 GB. El modelo base se distribuye bajo licencia Apache 2.0 y esta orientado a generacion de texto con capacidades declaradas de razonamiento y uso de herramientas (tool use), con una ventana de contexto que alcanza 1.048.576 tokens en las configuraciones de mayor precision.

La relevancia de esta publicacion radica en el trabajo de cuantizacion: cinco variantes (Q8_0, Q6_K_XL, Q6_K, IQ3_S e IQ3_XXS) calibradas con imatrix y validadas contra los pesos BF16 mediante divergencia KL, no contra otras cuantizaciones. Las tres variantes de 6-8 bits caben en una sola GPU de 96 GB, dos de ellas con el contexto completo de 1M tokens; las dos variantes IQ3 caben en una GPU de 32 GB con 32K o 96K de contexto.

El modelo requiere una version reciente de llama.cpp (build b12158 o superior), ya que la arquitectura `ricursive` se incorporo al upstream el 5 de noviembre de 2026 mediante el PR #31692. Los archivos descargados antes del 13 de noviembre de 2026 usan un nombre de tensor distinto y deben descargarse de nuevo o convertirse con el script incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura `ricursive` en llama.cpp) |
| Parametros totales | 64.782.689.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | Hasta 1.048.576 tokens (Q6_K y Q6_K_XL en GPU de 96 GB); 753.664 tokens en Q8_0; 98.304 en IQ3_XXS; 32.768 en IQ3_S |
| Tipos de cuantizacion | Q8_0, Q6_K_XL (receta propia), Q6_K, IQ3_S (receta propia), IQ3_XXS (receta propia) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se publica en BF16 y existe una version NVFP4 de Ricursive |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 65B parametros. La model card de la cuantizacion no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si se aplicaron fases de RLHF o DPO; esos datos corresponden a la publicacion original de Ricursive Intelligence y no se incluyen en la informacion disponible. La arquitectura recibe el nombre `ricursive` en llama.cpp e incluye, segun la tabla de recetas de cuantizacion, proyecciones de atencion q/k/v/output/gate, un bloque feed-forward gate/up/down de 240 tensores (77,7% del peso total) y un componente denominado "per-layer value-residual mix" almacenado en F32.

La innovacion tecnica mas destacable de esta publicacion es el proceso de cuantizacion. prometheusAIR verifico la implementacion de llama.cpp contra el codigo de modelado original de Ricursive antes de generar cualquier quant, y midio cada variante contra los pesos BF16 con divergencia KL, porcentaje de coincidencia en el token top-1 y perplejidad. Las recetas IQ3_S e IQ3_XXS no son las de serie de llama.cpp: la receta estandar de IQ3_XXS obtiene en este modelo una divergencia KL de 0,581 y un incremento de perplejidad del 68%, mientras que la receta propia, que sube las cinco proyecciones de atencion a IQ4_XS y embeddings y cabeza de salida a Q6_K (2,1 GiB adicionales, 1,9 GiB de ellos en atencion), reduce la divergencia KL 7 veces hasta 0,085. Todas las variantes salvo Q8_0 usan imatrix para la calibracion.

## Capacidades

- Generacion de texto conversacional y continuacion de contexto largo, con ventanas de hasta 1.048.576 tokens en las variantes Q6_K y Q6_K_XL sobre GPU de 96 GB.
- Razonamiento (tag `reasoning` en el repositorio): el modelo esta etiquetado por el autor como apto para tareas de razonamiento, aunque la model card no detalla modos explicitos de pensamiento.
- Uso de herramientas (tag `tool-use`): soporte declarado de tool calling y function calling.
- Contexto largo (tag `long-context`): disenado para trabajar con entradas de cientos de miles de tokens, con opciones de 32K, 96K, 736K y 1M segun cuantizacion y VRAM.
- Compatibilidad con endpoints: el repositorio incluye el tag `endpoints_compatible`, lo que indica que puede servirse mediante infraestructura de inferencia compatible.
- Capacidades multimodales (vision, audio): no disponibles.
- Cobertura multilingue: no disponible; el repositorio no declara lista de idiomas.

## Casos de uso

- Analisis de repositorios completos: con 1M tokens de contexto en Q6_K o Q6_K_XL sobre una GPU de 96 GB, el modelo puede ingerir un arbol de codigo extenso y responder preguntas sobre arquitectura, dependencias y cambios entre modulos sin trocear el contexto.
- Asistentes de documentacion tecnica: la ventana de 736K tokens de Q8_0 permite procesar manuales, especificaciones y RFCs completos en una sola pasada, manteniendo la maxima fidelidad respecto a BF16 (KL media de 0,0027).
- Agentes con tool calling en pipelines internos: el soporte declarado de tool use permite integrar el modelo en flujos de orquestacion donde debe invocar funciones, consultar APIs y encadenar varios pasos de razonamiento.
- Procesamiento de expedientes y contratos largos: con IQ3_XXS en una GPU de 32 GB y 98.304 tokens de contexto, es viable resumir o extraer clausulas de documentos extensos en hardware de gama profesional de un solo slot.
- Despliegue en estaciones de trabajo con RTX Pro 6000 (Blackwell): el tag `rtx-pro-6000` y la orientacion a 96 GB indican que el modelo esta pensado para inferencia local en esta GPU, util para equipos que no pueden enviar datos a la nube.
- Evaluacion comparativa de cuantizaciones: los datos de KL, top-1 y perplejidad publicados permiten elegir la variante adecuada para prototipos de investigacion donde se prioriza velocidad (IQ3_XXS a 46,0 tok/s) frente a fidelidad (Q8_0).
- Servicio de chat con contexto medio en 32 GB: IQ3_S ofrece 32.768 tokens de contexto a 42,8 tok/s de decodificacion, adecuado para atencion conversacional multi-turno en una unica GPU consumer de gama alta o profesional de 32 GB.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks de calidad tipo MMLU, HumanEval o GSM8K. Si se incluyen metricas de fidelidad de cuantizacion y de rendimiento de inferencia medidas por el autor:

| Metrica | Q8_0 | Q6_K_XL | Q6_K | IQ3_S | IQ3_XXS |
|---|---|---|---|---|---|
| Tamano de archivo | 64,11 GiB | 52,76 GiB | 49,50 GiB | 27,58 GiB | 25,38 GiB |
| Divergencia KL media vs BF16 | 0,0027 | 0,0036 | 0,0053 | 0,066 | 0,085 |
| Divergencia KL mediana | 0,00026 | 0,00043 | 0,00082 | 0,022 | 0,030 |
| Divergencia KL percentil 99 | 0,026 | 0,037 | 0,059 | 0,77 | 0,96 |
| Coincidencia top-1 con BF16 | 98,59% | 98,20% | 97,74% | 89,98% | 88,30% |
| Perplejidad vs BF16 | +0,28% | +0,02% | −0,30% | +0,90% | +2,52% |
| Contexto maximo (tipo KV indicado) | 753.664 (q8_0) | 1.048.576 (q8_0) | 1.048.576 (q8_0) | 32.768 (q8_0) | 98.304 (q8_0) |
| Decodificacion, prompt corto | 22,0 tok/s | 26,2 tok/s | 27,4 tok/s | 42,8 tok/s | 46,0 tok/s |

Como referencia de ruido de medida, los propios pesos BF16 ejecutados dos veces con distinto tamano de batch y colocacion de capas arrojan una divergencia KL media de 0,00045 entre ejecuciones, con 99,59% de coincidencia top-1. El prefilling de Q8_0 alcanza 1.710 tok/s a 32K de contexto, frente a 1.448 tok/s de Q6_K_XL.

## Requisitos de hardware

- VRAM estimada: 64,11 GiB (Q8_0), 52,76 GiB (Q6_K_XL), 49,50 GiB (Q6_K), 27,58 GiB (IQ3_S) y 25,38 GiB (IQ3_XXS) solo para pesos; el contexto consume VRAM adicional segun el tipo de KV cache.
- GPU de 96 GB: Q8_0, Q6_K_XL y Q6_K caben en una sola tarjeta; Q6_K_XL y Q6_K alcanzan el contexto completo de 1.048.576 tokens con KV en q8_0, y Q8_0 llega a 753.664 tokens.
- GPU de 32 GB: IQ3_S (32.768 tokens de contexto) e IQ3_XXS (98.304 tokens) estan dimensionadas para una unica tarjeta de 32 GB con KV en q8_0.
- GPU recomendadas: RTX Pro 6000 (Blackwell) para las variantes de 96 GB, segun el tag del repositorio; para las variantes IQ3, cualquier GPU de 32 GB, incluidas las profesionales y las consumer de gama alta con 32 GB de VRAM.
- Despliegue: llama.cpp en build b12158 o superior (la arquitectura `ricursive` se anadio en el PR #31692 del 5 de noviembre de 2026). El repositorio esta etiquetado como `endpoints_compatible`.
- Rendimiento: decodificacion de 22,0 a 46,0 tok/s segun variante en la caja de referencia del autor; prefilling de 1.710 tok/s (Q8_0) y 1.448 tok/s (Q6_K_XL) a 32K de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ripple-65B-Preview (esta ficha, GGUF) | 64,78B denso | Hasta 1.048.576 tokens | Apache 2.0 | GGUF | Cinco quants con validacion KL contra BF16 |
| Ripple-65B-Preview (base Ricursive) | 64,78B denso | No disponible en la informacion | Apache 2.0 | BF16 | Modelo original |
| Ripple-65B-Preview-NVFP4 (Ricursive) | 64,78B denso | No disponible en la informacion | No disponible en la informacion | NVFP4 | Publicacion oficial en formato NVFP4 |

No se dispone de datos de benchmarks ni de especificaciones de modelos de otros desarrolladores en la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, comportamiento en idiomas distintos del ingles ni riesgos especificos de alucinacion; deben asumirse los riesgos habituales de un modelo de 65B sin evaluacion publicada.
- No hay resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible, por lo que el rendimiento real en tareas downstream no esta verificado de forma independiente.
- Las variantes IQ3_S e IQ3_XXS pierden fidelidad de forma apreciable: 89,98% y 88,30% de coincidencia top-1 con BF16 y divergencia KL de 0,066 y 0,085 respectivamente, muy superiores a las variantes de 6-8 bits. No son adecuadas si la precision es critica.
- Los archivos descargados antes del 13 de noviembre de 2026 fallan en llama.cpp de serie con el error `done_getting_tensors: wrong number of tensors; expected 1203, got 1123`; deben descargarse de nuevo o convertirse con `scripts/ripple-gguf-rename.py`.
- Requiere llama.cpp build b12158 o superior; versiones anteriores no reconocen la arquitectura `ricursive`.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus derivados deben evaluarse por el usuario antes de desplegarlos en produccion.
- El contexto maximo depende de la variante y del tipo de KV cache: solo Q6_K y Q6_K_XL alcanzan 1M tokens, y solo en GPU de 96 GB con KV en q8_0.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prometheusAIR/Ripple-65B-Preview-GGUF
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Version NVFP4 oficial: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- PR de llama.cpp que anade la arquitectura `ricursive`: https://github.com/ggml-org/llama.cpp/pull/31692
- Script de conversion de tensores: https://huggingface.co/prometheusAIR/Ripple-65B-Preview-GGUF/blob/main/scripts/ripple-gguf-rename.py
