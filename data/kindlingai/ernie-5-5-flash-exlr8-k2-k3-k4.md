# kindlingai/ernie-5.5-flash-exlr8-k2-k3-k4

## Resumen

ERNIE-5.5-Flash-Preview exlr8 (K2/K3/K4, mul1) es una cuantizacion multi-ancho del modelo base `baidu/ERNIE-5.5-Flash-Preview-BF16`, publicada por el usuario `kindlingai` en Hugging Face. No se trata de un modelo nuevo, sino de una redistribucion de los pesos del modelo de Baidu en el formato de trellis `exlr8`, con los expertos enrutados y compartidos almacenados simultaneamente en tres anchos (K2, K3 y K4) para permitir seleccionar el nivel de fidelidad en tiempo de carga mediante un manifiesto.

El modelo subyacente es un transformer hibrido de atencion con MoE latente de 43 capas: una capa densa (L0) con MLP de tamano intermedio 14.336 y 42 capas MoE (L1-L42) con 512 expertos enrutados por capa, enrutamiento top-10 y un experto compartido adicional. Los expertos operan en un espacio latente de 2.048 dimensiones, mientras que el modelo completo tiene un `hidden_size` de 4.096.

La relevancia de esta ficha es doble: por un lado documenta el modelo ERNIE-5.5-Flash-Preview de Baidu (arquitectura MoE de grano fino, licencia Apache 2.0, enfocado a generacion de texto en ingles y chino); por otro, describe una cuantizacion exlr8 con auditoria matematica exhaustiva de los 21.546 slots de expertos, incluyendo errores de Frobenius y Hessianos regularizados por ancho. El repositorio ocupa 16,3 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido de atencion con MoE latente (`Ernie5_5_MoeForCausalLM`); 43 capas (L0 densa + L1-L42 MoE) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE con 512 expertos enrutados top-10 + 1 compartido por capa) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | exlr8 trellis con codebook `mul1` (`0x83DCD12D`), anchos K2/K3/K4; requiere redondeo FP8 E4M3 de los valores decodificados |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (trellis `mul1` para expertos + BF16/F32 para pesos no-expertos) |

## Arquitectura y entrenamiento

El modelo base ERNIE-5.5-Flash-Preview emplea una arquitectura de 43 capas con atencion hibrida y MoE latente. La capa L0 contiene un MLP denso con tamano intermedio de 14.336; las capas L1 a L42 son capas MoE con 512 expertos enrutados (top-10) mas un experto compartido. Los expertos enrutados operan en un espacio latente de `moe_latent_size = 2048` (proyecciones gate/up de 2048 a 2048 y down de 2048 a 2048, con 16 unidades de 128 canales y 16 bloques ocultos laterales), mientras que el experto compartido opera en el espacio completo de `hidden_size = 4096` (gate/up de 4096 a 2048 y down de 2048 a 4096, con 32 bloques ocultos). Los signos de capa se almacenan en `signs.in`/`signs.out` como enteros de 8 bits.

La cuantizacion exlr8 se aplico con `exlr8enc` (commit `87f05617cc97746633c568b6cc6c1895638d709c`), usando el codebook `mul1`, rotacion de Hadamard por bloques de 128, shrinkage hessiano `tau = 8000` en las capas L5-L42 y calibracion `ernie55-calib-v1`. Los pesos no-expertos (atencion, hyper-connection, router, proyecciones latentes, MLP denso de L0, normalizaciones, embeddings y LM head) se conservan verbatim en BF16/F32 bajo `dense/`. Las capas MTP no se incluyen: el `config.json` ascendente fija `num_nextn_predict_layers: 0` y los tensores `model.mtp.*` se omiten (siguen disponibles en el checkpoint BF16 original). No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens, ni si hubo RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto en ingles y chino (unico par de idiomas declarado).
- Razonamiento y conversacion multi-turno como modelo de causal LM (`text-generation`).
- Soporte de enrutamiento MoE con top-10 sobre 512 expertos por capa, lo que permite activar solo una fraccion de los parametros por token.
- Capacidad de seleccion de ancho de cuantizacion en tiempo de carga (K2, K3 o K4) mediante manifiesto, lo que permite intercambiar fidelidad por tamano.
- Compatibilidad con tensor parallelism de grados 1 a 4 gracias a los indices pre-sliced (`index-slices/tp{1,2,3,4}/k{2,3,4}/rank{r}.safetensors`).
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Despliegue de inferencia de texto en ingles y chino con presupuesto de VRAM ajustado: seleccionando el ancho K2 se reduce el tamano de los expertos a costa de mayor error de Frobenius (p50 de 0,2862 en expertos enrutados), adecuado para entornos de prototipado.
- Servicio de generacion de texto con mayor fidelidad: usando K4 (error de Frobenius p50 de 0,0735 en expertos enrutados) se obtiene una representacion mas cercana al BF16 original, apropiada para tareas que requieran calidad cercana al modelo base.
- Evaluacion comparativa de metodos de cuantizacion: los tres anchos coexisten en el mismo repositorio, lo que permite medir el impacto de K2/K3/K4 sobre la misma arquitectura sin cambiar de checkpoint.
- Despliegue multi-GPU con tensor parallelism: los indices pre-sliced para TP 1-4 permiten repartir el modelo entre varias GPU sin recomputar los cortes.
- Investigacion sobre MoE latente: el layout documentado (512 expertos enrutados en espacio latente de 2.048 dimensiones mas 1 compartido en 4.096) sirve como caso de estudio para analisis de enrutamiento y especializacion de expertos.
- Audicion de integridad de pesos: el repositorio incluye `hashes/SHA256SUMS` y checksums `xxhash64` por unidad, lo que facilita pipelines de verificacion en produccion.
- Fine-tuning o destilacion sobre el modelo base: al conservarse los pesos no-expertos en BF16/F32, se puede reutilizar la parte densa y sustituir la representacion de expertos segun necesidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta metricas de fidelidad de pesos (error de Frobenius relativo y error hessiano regularizado) por ancho de cuantizacion, que se reproducen a continuacion como referencia tecnica, no como benchmark de tarea:

| Grupo de expertos | Ancho | Error Frobenius relativo (min / p50 / p95 / max) | Error hessiano regularizado (p50 / p95 / max) |
|---|---:|---|---|
| Enrutados (21.504) | K2 | 0,2361 / 0,2862 / 0,3283 / 0,3652 | 0,03793 / 0,04918 / 0,05987 |
| Enrutados (21.504) | K3 | 0,1171 / 0,1448 / 0,1660 / 0,1848 | 0,00950 / 0,01239 / 0,01517 |
| Enrutados (21.504) | K4 | 0,0592 / 0,0735 / 0,0843 / 0,0939 | 0,00244 / 0,00318 / 0,00390 |
| Compartidos (42) | K2 | 0,2854 / 0,2933 / 0,3192 / 0,3219 | 0,01616 / 0,02504 / 0,02582 |
| Compartidos (42) | K3 | 0,1442 / 0,1484 / 0,1616 / 0,1628 | 0,00405 / 0,00627 / 0,00649 |
| Compartidos (42) | K4 | 0,0732 / 0,0754 / 0,0820 / 0,0826 | 0,00104 / 0,00161 / 0,00167 |

La auditoria reporta 21.546/21.546 piezas verificadas, 0 fallos duros, 0 inversiones de monotonicidad (K4 < K3 < K2) y un error maximo global entre Hessiano almacenado y recomputado de 1,34e-06.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio ocupa 16,3 GB en disco, pero el peso en VRAM depende del ancho seleccionado (K2/K3/K4) y de si se cargan los tres anchos o solo uno mediante el manifiesto.
- GPU recomendadas: no disponible en la informacion proporcionada. La presencia de indices pre-sliced para TP 1-4 sugiere despliegues multi-GPU, pero no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el formato exlr8 requiere un loader que decodifique los estados trellis con el codebook `mul1` (`0x83DCD12D`) y aplique redondeo FP8 E4M3 antes de la transformada de Hadamard y los vectores laterales. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI; la libreria declarada es `trellis`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| kindlingai/ernie-5.5-flash-exlr8-k2-k3-k4 | no disponible (MoE 512 expertos top-10) | no disponible | Apache 2.0 | safetensors exlr8 (K2/K3/K4) | Hugging Face, 0 descargas |
| baidu/ERNIE-5.5-Flash-Preview-BF16 | no disponible (misma arquitectura) | no disponible | Apache 2.0 | safetensors BF16 | Hugging Face (modelo base) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles y chino; no se declaran otros idiomas.
- La cuantizacion introduce error no despreciable: incluso en K4 el error de Frobenius p50 es de 0,0735 en expertos enrutados, lo que puede degradar la calidad respecto al BF16 original.
- Requiere un loader especifico (formato exlr8 con codebook `mul1` y redondeo FP8 E4M3); no es un checkpoint compatible con cargadores genericos de safetensors.
- Las capas MTP no estan incluidas en esta release, por lo que no se puede usar decodificacion especulativa basada en MTP con estos pesos.
- Riesgo de alucinacion inherente a modelos de lenguaje; no se documentan evaluaciones de factualidad.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base; conviene revisar el `LICENSE` del repositorio y las condiciones del modelo ascendente.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-25), por lo que no hay evidencia de uso en produccion ni validacion comunitaria.
- El autor `kindlingai` no es el desarrollador original del modelo (Baidu); la fidelidad de la cuantizacion depende de la auditoria reportada por el propio autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kindlingai/ernie-5.5-flash-exlr8-k2-k3-k4
- Modelo base: https://huggingface.co/baidu/ERNIE-5.5-Flash-Preview-BF16
- Especificacion del formato exlr8: https://github.com/kindlingai/exlr8/blob/main/FORMAT.md
- Repositorio exlr8: https://github.com/kindlingai/exlr8
