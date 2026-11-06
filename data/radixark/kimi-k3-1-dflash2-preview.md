# RadixArk/Kimi-K3.1-Dflash2-Preview

## Resumen

Kimi-K3.1-Dflash2-Preview es un "speculator" (modelo borrador) para decodificacion especulativa, desarrollado por RadixArk como complemento del modelo objetivo `moonshotai/Kimi-K3.1-Pro`. No es un modelo de lenguaje autonomo: se usa junto al objetivo para acelerar la inferencia mediante SGLang, proponiendo bloques de tokens que el modelo grande verifica en un unico forward pass. Su relevancia radica en que reduce el coste por token generado en modelos de gran tamano sin alterar la distribucion de salida del objetivo.

El borrador tiene 2.784.811.008 parametros en BF16 (5,6 GB en un unico fichero safetensors) y se implementa como una pila de cinco capas MLA (multi-head latent attention de estilo DeepSeek). Lee estados ocultos de seis capas del objetivo, los fusiona mediante una proyeccion y ejecuta atencion de ventana deslizante con mascara causal por bloques sobre el contexto del objetivo.

La configuracion alinea la longitud de contexto con el objetivo en 1.048.576 tokens (YaRN, factor 32), aunque la ventana de atencion efectiva del borrador es de 1.024 tokens. El ancho de verificacion configurado es de 5 tokens (1 actual + 4 borrador), aunque los mismos pesos funcionan con ancho 8. La licencia no esta declarada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Speculator de decodificacion especulativa; pila de 5 capas MLA (multi-head latent attention) con convoluciones por bloque |
| Parametros totales | 2.784.811.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.048.576 tokens (YaRN, factor 32), alineada con el objetivo; ventana de atencion efectiva del borrador: 1.024 tokens |
| Tipos de cuantizacion | Pesos publicados en BF16; en servicio se usan caches KV en FP8 (fp8_e4m3) para objetivo y borrador |
| Idiomas soportados | no disponible (heredados del tokenizer del objetivo) |
| Licencia | no disponible |
| Formato de pesos | Safetensors (fichero unico BF16) |
| Tamano del repositorio | 5,6 GB |
| Modelo base / objetivo | moonshotai/Kimi-K3.1-Pro |
| Tamano oculto | 7168 |
| Cabezas de atencion | 96 |
| Rango LoRA q / kv | 1536 / 512 |
| Dimension de cabeza QK | 192 (128 + 64 RoPE) |
| Dimension de cabeza V | 128 |
| MLP | SwiGLU, 14336 |
| Selector | Rango 256, top-k 32 |
| Capas auxiliares del objetivo | [7, 23, 51, 67, 83, 91] |
| Ancho de verificacion | 5 tokens (configurado); soporta tambien 8 |
| Backend de atencion del borrador | cutedsl_mla |

## Arquitectura y entrenamiento

El borrador es una pila de cinco capas MLA que no dispone de embeddings ni de LM head propios: ambos se cargan del modelo objetivo, igual que el tokenizer y la plantilla de chat. En cada paso lee los estados ocultos de las capas 7, 23, 51, 67, 83 y 91 del objetivo, los fusiona mediante una unica proyeccion y aplica atencion de ventana deslizante con mascara causal por bloques sobre el contexto del objetivo, con una ventana de 1.024 tokens. Ademas, cada capa incorpora una convolucion aprendida sobre el bloque (kernel 2, tamano de grupo 16) tanto en la rama de atencion como en la de MLP.

La generacion del bloque no es posicion a posicion: un selector de bajo rango (rango 256, top-k 32) elige cada token propuesto entre los candidatos del borrador condicionado por el token anterior, de modo que el bloque se muestrea como una trayectoria. El ancho de verificacion configurado es de 5 tokens (1 actual + 4 de borrador), y el mismo juego de pesos sirve para ancho 8. La model card no aporta detalles sobre el dataset de entrenamiento, el numero de tokens vistos, ni si hubo RLHF/DPO; esa informacion no esta disponible.

## Capacidades

- Aceleracion de inferencia por decodificacion especulativa: propone bloques de tokens que el objetivo verifica en un unico forward pass, reduciendo el numero de pasos de verificacion por token generado.
- Generacion de bloques en paralelo: el borrador propone el bloque completo de una vez a partir de los estados ocultos del objetivo, no token a token.
- Muestreo por trayectoria: el selector de bajo rango escoge cada token condicionado por el anterior, manteniendo coherencia interna del bloque.
- Anchos de verificacion flexibles: 5 tokens por defecto y 8 tokens mediante `--speculative-num-draft-tokens 8`.
- Adaptacion al contexto del objetivo: atencion de ventana deslizante de 1.024 tokens sobre el contexto del modelo grande.
- Compatibilidad con SGLang: integracion nativa mediante `--speculative-algorithm DFLASH` y backend `cutedsl_mla`.
- No soporta de forma autonoma generacion de texto, tool calling, agentes, vision ni audio: depende en todo momento del modelo objetivo.

## Casos de uso

- Servicio de inferencia de Kimi-K3.1-Pro con SGLang: desplegar el objetivo en TP8 junto a este borrador para reducir el coste por token generado en cargas de razonamiento largo, donde el ancho de verificacion 5 alcanza una longitud de aceptacion media de 4,26 en GSM8K.
- Razonamiento matematico en produccion: usar el borrador en pipelines que resuelven problemas tipo GSM8K o AIME, donde la aceptacion medida (4,26 y 3,23 respectivamente a ancho 5) implica que la mayoria de los tokens propuestos son aceptados por el objetivo.
- Evaluacion de modelos con preguntas de opcion multiple: GPQA Diamond con plantilla simple-evals, donde la aceptacion a ancho 5 es de 3,28 y a ancho 8 de 3,77, adecuado para benchmarks de razonamiento cientifico.
- Reduccion de latencia en asistentes conversacionales de contexto largo: el borrador opera sobre el contexto del objetivo con ventana de 1.024 tokens, lo que permite acelerar respuestas multi-turno sin reentrenar el modelo grande.
- Despliegue con ancho 8 para maximizar throughput: en escenarios donde la memoria lo permite (bajando `--max-running-requests` a 32), la aceptacion sube a 5,78 en GSM8K, lo que compensa el mayor coste de verificacion.
- Experimentacion con decodificacion especulativa: servir como referencia para comparar estrategias de borrador (DFlash2 frente a otros speculators) sobre un mismo objetivo, midiendo `acc_len`, AL ponderada por tokens de completado y AL agrupada.
- Investigacion sobre aceptacion en contexto largo: la configuracion alinea el contexto a 1M tokens, lo que permite estudiar como decae la aceptacion del borrador a medida que crece la longitud de contexto (la model card advierte que la alineacion de config no garantiza calidad de aceptacion en todo el rango de 1M).

## Benchmarks y rendimiento

Resultados de aceptacion medidos con DFlash2 real, verificacion por bloques activada, `thinking_effort` max, `temperature=1.0`, `top_p=0.95`, en un nodo 8x B300 (TP8) con cache KV FP8 para objetivo y borrador. No se mide precision de respuesta, solo longitud de aceptacion.

Ancho de verificacion 5 (1 token actual + 4 de borrador):

| Dataset | Muestras | acc_len | AL ponderada por tokens | AL agrupada |
|---|---:|---:|---:|---:|
| GSM8K | 1.319 | 4,259405 | 4,103988 | 4,063391 |
| AIME26 | 240 (30 x 8) | 3,231564 | 3,039857 | 3,019893 |
| GPQA Diamond | 198 | 3,275916 | 2,979262 | 2,960371 |

Ancho de verificacion 8 (1 token actual + 7 de borrador):

| Dataset | Muestras | acc_len | AL ponderada por tokens | AL agrupada |
|---|---:|---:|---:|---:|
| GSM8K | 1.319 | 5,780277 | 5,442283 | 5,287548 |
| AIME26 | 240 (30 x 8) | 3,696036 | 3,367764 | 3,320980 |
| GPQA Diamond | 198 | 3,768280 | 3,268278 | 3,227970 |

Las 3.514 peticiones (1.757 por ancho) terminaron con token de fin de turno, ninguna se trunco (la mas larga uso 104.938 de los 131.072 tokens de contexto) y ninguna requirio reintento. Longitud media de completado a ancho 5: GSM8K 344, AIME26 9.806 y GPQA Diamond 5.761 tokens. Las tres suites se ejecutaron de forma concurrente contra un mismo servidor, con 32 workers cliente por suite y un maximo de 64 peticiones en vuelo a 5 tokens (32 a 8 tokens).

## Requisitos de hardware

- El borrador por si solo ocupa 5,6 GB en BF16, pero no puede ejecutarse sin el modelo objetivo Kimi-K3.1-Pro, que es el que consume la mayor parte de la VRAM.
- Configuracion de referencia de la model card: un nodo con 8x B300 en TP8, `--mem-fraction-static 0.85`, cache KV FP8 (fp8_e4m3) para objetivo y borrador, y backend `cutedsl_mla` para la atencion del borrador.
- A ancho de verificacion 8 es necesario bajar `--max-running-requests` a 32: la cache de estado Mamba especulativa del objetivo crece con ancho x peticiones en vuelo y a 8 x 64 no deja memoria para la cache KV con `--mem-fraction-static 0.85` en B300.
- No se dispone de datos sobre si cabe en GPU de consumo (RTX 4090, etc.); el requisito del objetivo de gran tamano lo hace inviable en una unica GPU consumer.
- Despliegue: SGLang (`python -m sglang.launch_server`) con `--speculative-algorithm DFLASH`, `--speculative-draft-model-path RadixArk/Kimi-K3.1-Dflash2-Preview`, `--speculative-draft-attention-backend cutedsl_mla` y `--speculative-use-block-verification`.
- Contexto de servicio recomendado en el ejemplo: `--context-length 131072` (no 1M), con `--reasoning-parser kimi_k3` y `--tool-call-parser kimi_k3`.
- Latencia y throughput: no disponibles de forma directa; los datos de aceptacion (hasta 5,78 tokens aceptados por paso a ancho 8 en GSM8K) implican una reduccion proporcional del numero de pasos de verificacion, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

No se dispone de informacion sobre otros speculators comparables en la documentacion proporcionada. La comparativa se limita a los dos anchos de verificacion del propio modelo:

| Configuracion | Ancho | acc_len GSM8K | acc_len AIME26 | acc_len GPQA Diamond | Peticiones en vuelo |
|---|---:|---:|---:|---:|---:|
| Dflash2 ancho 5 | 5 | 4,259405 | 3,231564 | 3,275916 | 64 |
| Dflash2 ancho 8 | 8 | 5,780277 | 3,696036 | 3,768280 | 32 |

Frente a modelos de lenguaje comparables (mismo tamano o misma tarea): no disponible.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere Kimi-K3.1-Pro como objetivo y no puede generar texto por si solo; los embeddings, LM head, tokenizer y plantilla de chat provienen del objetivo.
- La licencia no esta declarada en la informacion disponible; verificar antes de cualquier uso comercial.
- La alineacion de contexto a 1M tokens (YaRN, factor 32) no garantiza calidad de aceptacion del borrador en todo ese rango; la propia model card lo advierte explicitamente.
- La ventana de atencion efectiva del borrador es de 1.024 tokens, muy inferior al contexto configurado del objetivo.
- Los resultados de aceptacion se midieron en un nodo 8x B300 con concurrencia (hasta 64 peticiones en vuelo); no son de una evaluacion peticion a peticion y pueden no reproducirse en otros entornos.
- A ancho 8 es obligatorio reducir `--max-running-requests` a 32 por presion de memoria de la cache de estado Mamba especulativa; ignorarlo puede impedir la asignacion de la cache KV.
- SGLang emite una advertencia al usar `--speculative-num-draft-tokens 8` porque sobrescribe el `block_size` de 5 de la configuracion.
- No se midio precision de respuesta en los benchmarks, solo longitud de aceptacion; un `acc_len` alto no implica respuestas correctas.
- No hay informacion sobre sesgos, riesgo de alucinacion ni comportamiento multilingue especifico del borrador; estos dependen del modelo objetivo.
- El repositorio tiene un uso muy bajo (464 descargas, 4 likes) y la version es "Preview", por lo que la API y el comportamiento pueden cambiar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RadixArk/Kimi-K3.1-Dflash2-Preview
- Modelo objetivo: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Dataset AIME 2026 usado en la evaluacion: https://huggingface.co/MathArena/aime_2026
- SGLang (framework de servicio): no disponible en la informacion proporcionada
- Paper, blog o demo del modelo: no disponible en la informacion proporcionada
