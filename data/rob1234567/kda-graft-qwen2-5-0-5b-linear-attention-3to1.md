# Rob1234567/kda-graft-qwen2.5-0.5b-linear-attention-3to1

## Resumen

`kda-graft-qwen2.5-0.5b-linear-attention-3to1` es un artefacto de investigación publicado en Hugging Face por el usuario Rob1234567. El punto de partida es el checkpoint Qwen2.5-0.5B, al que se le aplica una cirugía de pesos (weight surgery) sobre los ficheros `safetensors` y el `config.json`: de las 24 capas de atención originales, 18 se sustituyen por capas KDA (Kimi Delta Attention, basadas en la regla delta con puerta) y solo 6 conservan GQA con RoPE. El patrón resultante es un híbrido 3:1 `[KDA, KDA, KDA, GQA] × 6`, con 548 171 260 parámetros totales según los pesos publicados y 546 M según el recuento del autor incluyendo convoluciones y puertas.

El problema que aborda es la economía del contexto largo: la caché por token pasa de 12 288 B en la base a 3 072 B más una constante de estado de 4,42 MB, lo que se traduce en un ahorro de memoria de ×3,91 a 65 536 tokens y de ×3,99 a 1 048 576 tokens. En decodificación, el coste por token del injerto es prácticamente plano frente al crecimiento lineal de la base, con un cruce en torno a 65 000-79 000 tokens y un techo estructural de ×4.

Se trata de un modelo de investigación, no de producción: la model card lo declara explícitamente y limita su envelope operativo a ≤ 32 K tokens, ya que en la prueba de recall a 65 536 tokens el injerto obtiene 0/3 frente a 2/3 de la base. Además, el prefill de la implementación publicada (bucle eager en Python) es entre 90 y 110 veces más lento que el flash-SDPA de la base, por lo que el beneficio analítico en FLOPs no se materializa todavía en tiempo real.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal: KDA (Kimi Delta Attention / gated delta rule) y GQA alternadas en patrón 3:1 `[KDA, KDA, KDA, GQA] × 6` |
| Parametros totales | 548 171 260 (safetensors); 546 M según el autor incluyendo conv y puertas; base Qwen2.5-0.5B: 494 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card. Envelope operativo validado por el autor: ≤ 32 768 tokens. Las mediciones de memoria se extienden hasta 1 048 576 tokens |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en bf16; no se incluyen GGUF ni versiones cuantizadas |
| Idiomas soportados | Inglés (en) y ruso (ru) |
| Licencia | No disponible. La model card no declara licencia; al ser obra derivada de Qwen/Qwen2.5-0.5B debe verificarse la licencia del modelo base |
| Formato de pesos | safetensors (bf16, 1,05 GB para el checkpoint r2b); tokenizador Qwen2.5 heredado en JSON, `vocab.json` y `merges.txt` |
| Modelo base | Qwen/Qwen2.5-0.5B (24 capas, GQA 14/2, `head_dim=64`, RoPE) |
| Configuracion KDA | `conv_size=4`, `dk=dv=64`, tipos de capa declarados en `config.json` mediante `layer_types` |
| Estado del repositorio | 0 descargas, 0 likes; 3,4 GB de tamaño total; creado y actualizado el 2026-09-12 |
| Libreria | PyTorch |

## Arquitectura y entrenamiento

La cirugía se realiza sin pasar por `transformers`: se manipulan directamente `model.safetensors` y `config.json`. Las proyecciones q/k/v/o se transfieren desde el bloque GQA original, replicando las cabezas k/v de 2 a 14; a cada capa KDA se le añaden una convolución de tamaño 4 (identity-tap), una puerta α con sesgo inicializado a +5 (σ ≈ 0,993, de forma que el estado apenas olvida), una puerta β, una puerta de salida y un RMSNorm. Cada cuarto bloque permanece como GQA con RoPE y funciona como capa direccionable. El resultado es un checkpoint de 1,05 GB en bf16 (r2b, paso 120) sobre el que se tomaron todas las mediciones publicadas.

El entrenamiento consiste en un continued pretraining (CPT) sobre el injerto, seguido de un ajuste fino sobre señal de recall. El repositorio conserva dos puntos intermedios: `synthetic/kda-graft-3to1-v2cal/` (grafo tras calibración de escala, punto de partida del CPT-A) y `synthetic/kda-graft-3to1-v2/` (sin calibración, `out_scale=1`, usado como control). No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

Como innovación destacable, el modelo demuestra que el reemplazo de atención por capas de estado se puede hacer por trasplante directo de pesos sobre un checkpoint denso existente, y cuantifica el punto de igualdad de memoria (L* ≈ 480 tokens: por debajo, la constante de estado cuesta más que la caché KV). El barrido de proporciones incluido en la model card muestra el compromiso entre ahorro y número de capas direccionables: 1:1 ahorra ×1,99, 3:1 ahorra ×3,96 y 7:1 ahorra ×7,80 a 128 K, con 12, 6 y 3 capas de atención respectivamente.

## Capacidades

- Generación de texto autorregresiva con `pipeline_tag: text-generation` y uso conversacional declarado en las etiquetas.
- Decodificación con memoria de estado de coste constante por paso (O(1) en la fase de decode), frente al crecimiento lineal de la caché KV de la base.
- Recall de largo alcance verificado con prueba de aguja (needle) hasta 32 768 tokens: 3/3 aciertos a 8 192, 16 384 y 32 768 tokens.
- Capacidad multilingüe limitada a inglés y ruso, según los idiomas declarados (tokenizador Qwen2.5 heredado y sin modificar).
- Retención de la interfaz de atención direccionable con RoPE en 6 de las 24 capas, lo que preserva cierto acceso posicional explícito.
- No se documenta soporte de tool calling ni function calling.
- No se documenta modo de razonamiento explícito (thinking mode), visión, audio ni otras modalidades.
- No se documenta soporte específico para agentes o razonamiento multi-paso.

## Casos de uso

- Reproducción de experimentos de injerto de pesos: el repositorio incluye el checkpoint final, el grafo calibrado previo al entrenamiento y el control sin calibrar, lo que permite replicar la cirugía y comparar los tres puntos de la cadena.
- Investigación en atención lineal e híbrida: sirve para estudiar cómo se comporta la regla delta con puerta dentro de un transformer denso y qué proporción de capas conviene sustituir según el presupuesto de memoria objetivo.
- Medición de economía de caché en despliegues de contexto largo: las tablas de la model card (12 288 B/token frente a 3 072 B/token más 4,42 MB de estado) permiten planificar requisitos de memoria para ventanas de 8 K a 1 M de tokens.
- Banco de pruebas de recall de largo alcance: la prueba tipo needle hasta 32 K es reutilizable como referencia para comparar variantes de inicialización, calibración y proporción de capas KDA.
- Desarrollo y validación de kernels fusionados: dado que el prefill actual usa un bucle eager de ~5,2 ms/token, el modelo es un caso de prueba natural para medir la ganancia de kernels tipo FLA o FlashKDA frente a la implementación de referencia.
- Prototipado conversacional de bajo coste en inglés y ruso: con 0,5 B de parámetros y una caché reducida, puede desplegarse en una GPU de consumo para diálogos multi-turno siempre que la ventana se mantenga por debajo de 32 K tokens.
- Evaluación comparativa de proporciones KDA:GQA: las configuraciones 1:1, 3:1 y 7:1 documentadas permiten decidir el equilibrio entre ahorro de memoria y capas direccionables para un producto concreto.
- Docencia y experimentación sobre arquitecturas híbridas: el conjunto de informes, scripts y registros crudos del dataset de evidencia facilita usar el caso como material didáctico reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card menciona evaluaciones de perplejidad en `docs/evals/*.txt`, pero no incluye sus cifras. Los datos cuantitativos disponibles son mediciones de memoria, latencia y recall, tomadas en bf16 con autocast, batch=1, sobre una RTX 4080 SUPER de 16 GB, con el nivel de implementación declarado en cada registro (`kernel_level`: prefill de atención con flash-SDPA, prefill de KDA con bucle eager sobre T, decode de KDA con paso eager sobre el estado O(1)).

Memoria de caché por token y total:

| Longitud (tokens) | Base (B/token) | Injerto (B/token) | Base (GiB) | Injerto (GiB) | Ahorro (×) |
|---:|---:|---:|---:|---:|---:|
| 512 | 12 288 | 11 703 | 0,0059 | 0,0056 | 1,05 |
| 8 192 | 12 288 | 3 611 | 0,0938 | 0,0276 | 3,40 |
| 32 768 | 12 288 | 3 207 | 0,3750 | 0,0979 | 3,83 |
| 65 536 | 12 288 | 3 139 | 0,7500 | 0,1916 | 3,91 |
| 1 048 576 | 12 288 (analítico) | 3 004 (medido) | 12,0 | 3,0041 | 3,99 |

Latencia de decodificación (TPOT) con cachés sintéticas:

| Longitud (tokens) | Base (ms) | Injerto (ms) | Base / injerto | Caché base (GiB) | Caché injerto (GiB) |
|---:|---:|---:|---:|---:|---:|
| 65 536 | 27,9 | 33,4 | 0,83 | 0,750 | 0,192 |
| 131 072 | 56,5 | 32,9 | 1,72 | 1,500 | 0,379 |
| 262 144 | 143,2 | 46,5 | 3,08 | 3,000 | 0,754 |
| 524 288 | 318,5 | 87,2 | 3,65 | 6,000 | 1,504 |
| 1 048 576 | no medido | 171,7 | no disponible | no disponible | 3,004 |

Recall (prueba de aguja):

| Longitud (tokens) | Base | Injerto r2b |
|---:|---:|---:|
| 8 192 | 3/3 | 3/3 |
| 16 384 | 3/3 | 3/3 |
| 32 768 | 3/3 | 3/3 |
| 65 536 | 2/3 | 0/3 |

Barrido de proporción de capas KDA a 128 K de contexto:

| Configuración | Capas KDA | Capas atención | KV @128K (GiB) | Estado (MiB) | Total (GiB) | × frente a base |
|---|---:|---:|---:|---:|---:|---:|
| 1:1 | 12 | 12 | 0,750 | 2,62 | 0,753 | 1,99 |
| 3:1 (injerto) | 18 | 6 | 0,375 | 3,94 | 0,379 | 3,96 |
| 7:1 | 21 | 3 | 0,188 | 4,59 | 0,192 | 7,80 |

En prefill, el autor reconoce que esta implementación no gana: analíticamente KDA es más barato desde T ≈ 3d = 192 y a 1 M la relación de FLOPs KDA/atención es ≈ 5,5 × 10⁻⁴, pero el TTFT medido del injerto es lineal a ≈ 5,2 ms/token frente a ≈ 45 µs/token de la base con flash-SDPA.

## Requisitos de hardware

- Checkpoint en bf16 de 1,05 GB; el repositorio completo ocupa 3,4 GB por los puntos intermedios y los informes.
- Todas las mediciones publicadas se tomaron en una RTX 4080 SUPER de 16 GB, en bf16 con autocast y batch=1.
- A 65 536 tokens, la caché del injerto ocupa 0,192 GiB frente a 0,750 GiB de la base; a 1 048 576 tokens, 3,004 GiB frente a los 12,0 GiB analíticos de la base.
- La ventana de 1 M tokens no se midió en la base porque su caché (6 GiB a 524 288 tokens) agota los 16 GB de la tarjeta junto con el resto del estado.
- Cabe en GPU de consumo: cualquier GPU con al menos 8-16 GB de VRAM puede alojar el modelo y ventanas de hasta 128 K; para 1 M tokens conviene disponer de 16 GB o más solo para la caché del injerto más el resto del estado.
- Opciones de despliegue: no se documenta compatibilidad oficial con vLLM, TGI, llama.cpp ni Ollama. Al no publicarse GGUF y depender de `layer_types` personalizados con capas KDA, la ejecución requiere el código de referencia del autor en PyTorch.
- El prefill utiliza un bucle eager en Python, con lo que la latencia de primer token es alta (~5,2 ms por token). Para producción sería necesario implementar kernels fusionados (FLA, FlashKDA); el autor los señala como trabajo futuro, no como resultado.
- Decodificación medida: 33,4 ms por token a 65 536 tokens, 32,9 ms a 131 072, 46,5 ms a 262 144, 87,2 ms a 524 288 y 171,7 ms a 1 048 576.
- Punto de igualdad de memoria con la base: L* ≈ 480 tokens. Por debajo de esa longitud, el estado constante del injerto resulta más caro que la caché KV convencional.

## Comparativa con modelos similares

Los datos disponibles solo permiten comparar el injerto con su propio modelo base. No se ha verificado en la información proporcionada la existencia de otros injertos híbridos públicos comparables, por lo que esa fila queda como no disponible.

| Modelo | Parámetros | Capas de atención | Caché por token | Caché @128K | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| kda-graft-qwen2.5-0.5b-3to1 | 548 171 260 (546 M con conv y puertas) | 6 GQA (RoPE) + 18 KDA | 3 072 B + 4,42 MB de estado | 0,379 GiB | No disponible | Público en Hugging Face; 0 descargas |
| Qwen/Qwen2.5-0.5B (base) | 494 M | 24 GQA | 12 288 B | 0,750 GiB | No disponible en esta ficha | Público en Hugging Face |
| Otros híbridos de atención lineal públicos (Kimi Linear, Mamba-2, RWKV-7 y similares) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible; no se ha verificado comparación con datos de la información proporcionada |

## Limitaciones y advertencias

- Es un artefacto de investigación declarado como tal por el autor, no una versión lista para producción ni para uso comercial sin validación adicional.
- La licencia no está declarada en la model card. Al derivar de Qwen/Qwen2.5-0.5B, es imprescindible revisar los términos del modelo base antes de cualquier uso comercial.
- Envelope operativo limitado a ≤ 32 768 tokens: en la prueba de aguja a 65 536 tokens el injerto obtiene 0/3 frente a 2/3 de la base, por lo que el ahorro de memoria no debe publicitarse más allá de esa ventana.
- Riesgo de pérdida de recall en el extremo lejano de la ventana incluso dentro del envelope, dado que la memoria se almacena en un estado comprimido de tamaño fijo y no en pares clave-valor exactos.
- El prefill es entre 90 y 110 veces más lento que la base con flash-SDPA en la implementación publicada; los números no son extrapolables a kernels fusionados y mezclarlos carece de validez.
- Los resultados de memoria y latencia se obtuvieron con batch=1 en una única GPU (RTX 4080 SUPER), por lo que no hay datos de rendimiento con lotes concurrentes ni de escalado multi-GPU.
- Idiomas limitados a inglés y ruso; no se documenta evaluación de calidad en otros idiomas pese a que el tokenizador Qwen2.5 sea multilingüe.
- No hay resultados de benchmarks de conocimiento, razonamiento, código o matemáticas, ni evaluaciones de sesgo o toxicidad. El ajuste sobre señal de recall puede haber degradado capacidades generales que no se han medido.
- No se documentan mecanismos de seguridad, moderación ni alineación (RLHF, DPO u otros), más allá del CPT y el ajuste de recall.
- La ausencia de pesos cuantizados y de soporte en runtimes estándar (vLLM, llama.cpp, Ollama, TGI) complica el despliegue y obliga a usar el código de referencia en PyTorch.
- La constante de estado de 4,42 MB por capa KDA hace que, en ventanas por debajo de ~480 tokens, el modelo consuma más memoria que la base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rob1234567/kda-graft-qwen2.5-0.5b-linear-attention-3to1
- Dataset de evidencia: https://huggingface.co/datasets/Rob1234567/kda-graft-econ-evidence-2026-09-12
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Informe de economía (DOCX, ruso): `reports/kda-graft_econ_2026-09-12.docx` dentro del repositorio del modelo
- Documentación de resultados y protocolo: `docs/RESULTS.md` y `docs/ECON_PLAN.md` dentro del repositorio del modelo
- Evaluaciones de perplejidad de variantes de inicialización: `docs/evals/*.txt` dentro del repositorio del modelo
- Puntos intermedios del injerto: `synthetic/kda-graft-3to1-v2cal/` y `synthetic/kda-graft-3to1-v2/` dentro del repositorio del modelo
