# janghaneul/Qwen3.8-Flash-Next-AD-gateup-Q4_K-Q4_K-GGUF

## Resumen

Qwen3.8-Flash-Next-AD-gateup-Q4_K-Q4_K-GGUF es una cuantización GGUF del modelo Qwen3.8-Flash-Next, publicada por el usuario janghaneul bajo el identificador interno "at578". No es un modelo entrenado desde cero, sino una reconstrucción a nivel de tensor del modelo base de Qwen, pensada para inferencia local de un MoE de gran tamaño en motores tipo llama.cpp y Strata. El modelo base cuenta con 176.943.899.520 parámetros totales (unos 177.000 millones) y una arquitectura MoE con expertos enrutados y una tabla de embeddings por capa basada en n-gram (PLE).

El interés de esta ficha no reside en el modelo original, sino en la receta de cuantización: el autor asigna Q4_K a los tensores gate/up de los expertos, IQ4_NL a los down, y mantiene en Q8_0 todo lo no enrutado (atención, `ssm_out` de GDN, expertos compartidos, embeddings y la tabla PLE). El resultado son 119,0 GiB repartidos en tres shards, con 5,78 bits por peso (bpw) globales y 4,671 bpw si se excluye la tabla PLE. Con la tabla PLE transmitida desde disco, los pesos residentes en RAM se reducen a 68,4 GiB.

La relevancia actual es práctica: permite ejecutar un MoE de ~177.000 millones de parámetros en una máquina con unos 94 GiB de RAM y GPU de consumo, manteniendo contexto de hasta 262.144 tokens con KV en int8. Es una build experimental, sin benchmarks de calidad medidos, orientada a usuarios que ya trabajan con el ecosistema de cuantizaciones de AtomicChat y quieren un equilibrio distinto entre bits y calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con GDN (atención lineal) y tabla PLE n-gram; detalles completos del modelo base no disponibles |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configuración recomendada con KV int8) |
| Tipos de cuantizacion | Q4_K (gate/up expertos), IQ4_NL (down expertos), Q8_0 (atención, `ssm_out`, experto compartido, embeddings, tabla PLE), F32/F16 (router, norm, indexer) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | GGUF (3 shards) + adaptador visión `mmproj-...-F16.gguf` |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) que incorpora capas GDN con atención lineal (`ssm_out`) y una tabla de embeddings por capa basada en n-gram (`per_layer_token_embd`, PLE). La cuantización respeta esa estructura: los 96 tensores `ffn_gate_exps`/`ffn_up_exps` van en Q4_K (42,19 GiB), los 48 `ffn_down_exps` en IQ4_NL (21,09 GiB), y el resto de componentes no enrutados se mantiene en Q8_0 (~5,1 GiB), con router, normas e indexer en F32/F16 (0,24 GiB). La tabla PLE ocupa 50,66 GiB en Q8_0 y es el componente dominante del tamaño en disco.

La construcción es una edición a nivel de byte sobre la receta `AD-5.00bpw-Q5_K_M` de AtomicChat: se sustituyen únicamente los tensores gate/up por Q4_K y se conserva el resto sin recuantizar. La fuente BF16 es `unsloth/Qwen3.8-Flash-Next-GGUF` (revisión fijada `d9620119`), la imatrix es la pública de AtomicChat y el cuantizador es un fork de llama.cpp para ROCm/RDNA con dot-quantization por imatrix. No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto conversacional y razonamiento de propósito general, heredadas del modelo base.
- Procesamiento de imágenes mediante el adaptador de visión incluido (`mmproj-Qwen3.8-Flash-Next-F16.gguf`).
- Soporte de contexto largo: hasta 262.144 tokens con KV en int8.
- Inferencia MoE con expertos residentes y tabla PLE transmitida desde disco.
- Compatibilidad con llama.cpp estándar (cargando el shard 1) y con el motor Strata.
- Capacidades de tool calling, agentes y multilingüismo: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local de un MoE de gran tamaño: con 68,4 GiB de pesos residentes y la tabla PLE en SSD, el modelo cabe en equipos de gama alta con ~94 GiB de RAM, lo que permite desplegarlo sin clúster multi-GPU.
- Procesamiento de documentos largos: la ventana de 262.144 tokens con KV int8 permite analizar contratos, informes o bases de código extensas en una sola pasada.
- Asistentes conversacionales con memoria amplia: el contexto largo reduce la necesidad de resumen intermedio en diálogos multi-turno prolongados.
- Análisis de imágenes asistido por texto: el adaptador `mmproj` F16 permite tareas de descripción, extracción de información y respuesta a preguntas sobre imágenes.
- Sustitución de shards en pipelines existentes: el shard 3 (tabla PLE) es byte-idéntico al de las builds M64 de AtomicChat, de modo que un usuario que ya tenga una de esas cuantizaciones puede reutilizar su shard y descargar solo los dos primeros.
- Experimentación con recetas de cuantización: la composición por tensor documentada en `validation.json` y `manifest.json` sirve como referencia para comparar el impacto de mover gate/up a Q4_K frente a otras recetas.
- Despliegue en entornos con GPU de consumo y ROCm/RDNA: el cuantizador empleado es un fork para ROCm, lo que encaja con estaciones de trabajo AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio autor indica explícitamente que no se ejecutaron pruebas de inferencia ni de calidad sobre esta build concreta; solo se verificaron la composición de tensores y la igualdad a nivel de byte frente a los ficheros publicados.

## Requisitos de hardware

- Tamaño total en disco: 119,0 GiB en tres shards.
- RAM residente con la tabla PLE transmitida desde SSD: 68,4 GiB.
- RAM recomendada por el autor: ~94 GiB de sistema para ejecutar con la tabla PLE en SSD y contexto de hasta 262.144 tokens con KV int8.
- GPU: no se especifican modelos concretos; el cuantizador se compiló con un fork de llama.cpp para ROCm/RDNA, lo que sugiere soporte prioritario en GPUs AMD.
- GPU de consumo: no hay confirmación de que quepa íntegramente en una sola GPU de consumo; el diseño asume reparto entre RAM del sistema y SSD.
- Opciones de despliegue: motor Strata (`--serve`, `--ple-gguf`, `--ple-io direct`, `--resident-experts`, `--max-context 262144`, `--kv int8`) y llama.cpp estándar cargando el shard 1.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (at578) | 176.943.899.520 | 262.144 | Q4_K / IQ4_NL / Q8_0, 119,0 GiB, 5,78 bpw | Qwen Community License 1.0 | GGUF en HF (janghaneul) |
| AtomicChat AD-5.00bpw-Q5_K_M | no disponible | no disponible | Q5_K_M base, gate/up en IQ2_S×72 + IQ3_S×24 | Qwen Community License 1.0 | GGUF en HF (AtomicChat) |
| AtomicChat AD-4.27bpw-Q4_K_M-M64 | no disponible | no disponible | Q4_K_M, shards M64 | Qwen Community License 1.0 | GGUF en HF (mk2878d, AtomicChat) |
| Qwen3.8-Flash-Next (base) | 176.943.899.520 | no disponible | BF16 | Qwen Community License 1.0 | Pesos originales en HF (Qwen) |

## Limitaciones y advertencias

- No se han medido calidad ni rendimiento de esta build; las afirmaciones de calidad del autor son correlacionales y no están respaldadas por benchmarks publicados.
- La receta depende de una imatrix concreta y de un fork de llama.cpp para ROCm; la reproducibilidad exacta en otras configuraciones no está garantizada.
- El tamaño en disco (119,0 GiB) y la RAM necesaria (~68,4 GiB residentes, ~94 GiB recomendados) excluyen su uso en equipos de gama media.
- La tabla PLE en Q8_0 es imprescindible para el comportamiento de recuperación según el autor; sustituirla por shards más pequeños (35,8 GiB) degrada la calidad de recuperación.
- El modelo base puede presentar sesgos y alucinaciones; no se documentan evaluaciones de sesgo ni de seguridad en la información disponible.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe más allá de lo que ofrezca el modelo base.
- La licencia Qwen Community License 1.0 impone condiciones específicas para uso comercial; es necesario revisar el texto completo antes de desplegar en producción.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia comunitaria de validación independiente.

## Enlaces

- [Hugging Face: janghaneul/Qwen3.8-Flash-Next-AD-gateup-Q4_K-Q4_K-GGUF](https://huggingface.co/janghaneul/Qwen3.8-Flash-Next-AD-gateup-Q4_K-Q4_K-GGUF)
- [Modelo base: Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [Licencia Qwen Community License 1.0](https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE)
- [Receta base: AtomicChat/Qwen3.8-Flash-Next-GGUF](https://huggingface.co/AtomicChat/Qwen3.8-Flash-Next-GGUF)
- [Fuente BF16: unsloth/Qwen3.8-Flash-Next-GGUF](https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF)
- [Build alternativa AD-4.27bpw-Q4_K_M-M64 (mk2878d)](https://huggingface.co/mk2878d/Qwen3.8-Flash-Next-GGUF)
