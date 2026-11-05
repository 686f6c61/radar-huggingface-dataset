# joesphan/Qwen3.8-Flash-Next-IQ3E-Q8D-MTP-GGUF-ABLITERATED

## Resumen

Qwen3.8-Flash-Next-IQ3E-Q8D-MTP-GGUF-ABLITERATED es una cuantizacion GGUF del modelo Qwen3.8-Flash-Next de Qwen (Alibaba), publicada por el usuario joesphan. Se trata de un derivado comunitario no oficial que parte de la cuantizacion IQ3E-Q8D-MTP de pentacoxian-dev y sustituye 96 tensores de escritura del flujo residual por las versiones "abliterated" (sin capacidad de rechazo) publicadas por huihui-ai. El resultado es un modelo de 180.186.749.568 parametros (aproximadamente 180 mil millones) en formato GGUF de 85,9 GB, orientado a inferencia en GPUs Tesla V100.

El modelo base emplea una arquitectura hibrida que combina capas de espacio de estados (SSM, del tipo Mamba) con atencion clasica, e incluye una capa MTP (multi-token prediction) en el bloque 48 que actua como cabeza de decodificacion especulativa. La cuantizacion mezcla IQ3E para la mayoria de tensores, Q8_0 para los tensores del flujo residual y los expertos enrutados en IQ4_NL. El contexto declarado en las pruebas del autor es de 262.144 tokens con cache KV en q8_0.

Su relevancia es doble: por un lado demuestra la viabilidad de ejecutar un modelo de 180B en hardware V100 (sm_70) mediante parches especificos de llama.cpp; por otro, es un ejemplo de "abliteration" quirurgica que elimina los rechazos del modelo sin reentrenar, con el coste asociado de degradacion de capacidades y la perdida total de salvaguardas integradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (SSM + atencion), con capa MTP en bloque 48; derivada de Qwen3.8-Flash-Next |
| Parametros totales | 180.186.749.568 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (segun pruebas del autor con cache KV q8_0) |
| Tipos de cuantizacion | IQ3E (mayoria), Q8_0 (96 tensores residuales), IQ4_NL (48 expertos enrutados) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en HuggingFace) |
| Formato de pesos | GGUF (85.923.705.344 bytes) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es una arquitectura hibrida que intercala bloques de espacio de estados (`blk.*.ssm_out.weight`, 36 tensores) con bloques de atencion (`blk.*.attn_output.weight`, 12 tensores) y capas de mezcla de expertos (`blk.*.ffn_down_exps.weight`, 48 tensores). Incluye una capa de prediccion multi-token (MTP) en el bloque 48 que se usa en llama.cpp mediante `--spec-type draft-mtp` para decodificacion especulativa, con una tasa de aceptacion de borradores del 86,6 % en las pruebas del autor.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base. La intervencion de este derivado es puramente de pesos: se sobrescriben 96 tensores Q8_0 del flujo residual (36 `ssm_out`, 12 `attn_output`, 48 `ffn_down_shexp`) con las versiones abliterated de huihui-ai v2, sin ciclo de desquantizacion y requantizacion, preservando offsets y cabecera GGUF. Los 48 tensores de expertos enrutados permanecen en IQ4_NL y no estan abliterated, igual que la cabeza MTP.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de 262.144 tokens.
- Razonamiento y aritmetica: las pruebas del autor indican que los sondas de codigo y aritmetica siguen siendo coherentes tras la ablacion.
- Codigo: mantiene coherencia en pruebas de codigo, aunque el autor advierte que la ablacion puede degradar el seguimiento de instrucciones.
- Decodificacion especulativa mediante cabeza MTP integrada (n=3, aceptacion ~86 %).
- Capacidad de responder a peticiones que el modelo base rechaza (comportamiento "uncensored").
- Tool calling y function calling: no verificado; el autor advierte explicitamente de posible degradacion.
- Capacidades de agente y razonamiento multi-paso: no verificadas.
- Capacidades multilingues: no disponibles.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- Investigacion sobre abliteration: permite comparar el comportamiento del modelo base frente al derivado en el mismo prompt, aislando el efecto de los 96 tensores sustituidos sobre rechazos, coherencia y seguimiento de instrucciones.
- Despliegue en infraestructura V100 legacy: con el parche `llama-v0.5.0-v100-v3.patch` y `GGML_CUDA_P2P=1`, un par de Tesla V100-PCIE-32GB ejecuta el modelo a 123,9 tok/s de decode y 339,8 tok/s de prefill, lo que lo hace util para organizaciones con este hardware ya amortizado.
- Generacion de texto creativo sin filtros editoriales: escritura de ficcion, guiones o contenido narrativo donde los rechazos del modelo base interrumpen el flujo, asumiendo la ausencia de moderacion integrada.
- Procesamiento de documentos largos: la ventana de 262K tokens permite analizar contratos, informes o bases de codigo extensas en una sola pasada, con cache KV q8_0 para contener el consumo de VRAM.
- Red teaming y evaluacion de seguridad: util como sujeto de prueba para medir la eficacia de moderadores externos frente a un modelo sin guardarrailes, en entornos controlados y aislados.
- Experimentacion con decodificacion especulativa: la cabeza MTP permite estudiar el impacto de la ablacion en la tasa de aceptacion (86,6 % frente a 85,7 % del base) y en el throughput en configuraciones multi-GPU con tensor split.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (dos Tesla V100-PCIE-32GB, contexto 262K, KV q8_0, MTP n=3, tensor split, `GGML_CUDA_P2P=1`, mediana de 3 ejecuciones):

| Metrica | Base IQ3E | Este build |
|---|---:|---:|
| Decode | 131,1 tok/s | 123,9 tok/s |
| Prefill (2,4K tokens) | 332,9 tok/s | 339,8 tok/s |
| Aceptacion de borradores | 85,7 % | 86,6 % |
| VRAM | 32,2 GB/GPU | 32,2 GB/GPU |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor indica que los valores absolutos de prefill dependen del host (15 GiB de RAM, con paginacion de la tabla PLE) y que la ablacion cuesta aproximadamente un 5 % de decode en ese equipo.

## Requisitos de hardware

- VRAM estimada: 32,2 GB por GPU en configuracion de dos GPUs con tensor split (segun el autor). El archivo GGUF ocupa 85,9 GB en disco.
- GPUs recomendadas: dos Tesla V100-PCIE-32GB con `GGML_CUDA_P2P=1` y VT-d desactivado en la placa base, configuracion validada por el autor.
- GPUs consumer: no hay datos sobre ejecucion en RTX 4090 u otras consumer; el tamano del modelo y la necesidad de tensor split hacen improbable un despliegue en una sola GPU consumer.
- Software: llama.cpp v0.5.0 con el parche `llama-v0.5.0-v100-v3.patch` para V100 (sm_70); flags equivalentes al modelo base IQ3E, incluido `--spec-type draft-mtp`.
- Otros runtimes (vLLM, TGI, Ollama): no disponibles para este build especifico.
- Latencia y throughput: decode 123,9 tok/s y prefill 339,8 tok/s (2,4K tokens) en la configuracion V100 descrita; no hay datos para otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / licencia | Notas |
|---|---|---|---|---|
| Este build (joesphan) | 180,2B | 262.144 | GGUF, qwen-community-1.0 | Abliterated, IQ3E/Q8_0/IQ4_NL, MTP |
| Qwen/Qwen3.8-Flash-Next (base) | 180,2B | no disponible | safetensors, qwen-community-1.0 | Modelo original de Qwen; conserva rechazos |
| pentacoxian-dev/Qwen3.8-Flash-Next-IQ3E-Q8D-MTP-GGUF | 180,2B | 262.144 (segun pruebas) | GGUF, qwen-community-1.0 | Cuantizacion base sin ablacion; 131,1 tok/s decode |
| huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF | no disponible | no disponible | GGUF, qwen-community-1.0 | Fuente de los tensores abliterated v2 |

No se dispone de datos de benchmarks de calidad para establecer comparaciones de rendimiento entre estas variantes.

## Limitaciones y advertencias

- Ausencia total de guardarrailes: el modelo es abliterated y puede cumplir peticiones daninas o inseguras; requiere moderacion, control de acceso y revision legal propios.
- Degradacion de capacidades: el autor advierte que la ablacion puede deteriorar el seguimiento de instrucciones, el tool calling y otras habilidades; solo se han hecho pruebas puntuales (spot check), no una evaluacion completa.
- Los expertos enrutados no estan abliterated, por lo que el comportamiento "uncensored" es parcial y puede ser inconsistente entre dominios.
- La cabeza MTP no esta abliterated; no existe una version abliterated publicada de esta cabeza.
- Sesgos conocidos: no disponibles en la informacion proporcionada; hereda los del modelo base, no documentados aqui.
- Riesgo de alucinacion: no cuantificado; sin benchmarks de calidad publicados.
- Idiomas soportados: no disponibles.
- Licencia qwen-community-1.0: es necesario revisar sus terminos para uso comercial; el derivado se distribuye como "other" y es no oficial, sin afiliacion con Qwen/Alibaba.
- Dependencia de un parche no oficial de llama.cpp para V100 (sm_70); sin ese parche el modelo no se ejecuta en esa GPU.
- El rendimiento medido depende del host (15 GiB de RAM con paginacion de la tabla PLE); los valores de prefill no son extrapolables a otros equipos.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/joesphan/Qwen3.8-Flash-Next-IQ3E-Q8D-MTP-GGUF-ABLITERATED
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantizacion IQ3E-Q8D-MTP de origen: https://huggingface.co/pentacoxian-dev/Qwen3.8-Flash-Next-IQ3E-Q8D-MTP-GGUF
- Tensores abliterated v2: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
