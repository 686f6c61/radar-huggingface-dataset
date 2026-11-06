# hyper-accel/Qwen3-8B-mlp-gptq-mxfp4

## Resumen

Qwen3-8B-mlp-gptq-mxfp4 es una cuantizacion del modelo Qwen/Qwen3-8B publicada por el usuario hyper-accel en Hugging Face. Se trata de un checkpoint experimental en el que unicamente las proyecciones lineales de las capas MLP (`gate_proj`, `up_proj` y `down_proj` de cada bloque) han sido cuantizadas a MXFP4, el formato de microscaling de OCP (elementos E2M1 con escala compartida E8M0 en bloques de 32 a lo largo de `in_features`). El resto de componentes del modelo (proyecciones de atencion, embeddings, normalizaciones y `lm_head`) se mantienen en BF16 copiados bit a bit del original.

El modelo base, Qwen3-8B, es un transformer denso de la familia Qwen3 desarrollado por Alibaba Qwen, disenado para generacion de texto, razonamiento, codigo y tareas multilingues. Esta variante concreta no pretende ser un checkpoint de produccion: su interes es tecnico, como demostracion de un pipeline de cuantizacion GPTQ adaptado a bloques MXFP4 y como artefacto para medir velocidad en hardware especializado (el autor indica que se ha compilado y ejecutado en una FPGA).

La relevancia de esta publicacion es limitada pero concreta: explora la viabilidad de MXFP4 como formato de cuantizacion de pesos para modelos de ~8B, un area de interes creciente por el soporte nativo de microscaling en GPUs de nueva generacion. El autor advierte explicitamente de que no se han medido perplejidad ni precision, y de que el layout de tensores no es cargable directamente con `transformers` estandar, lo que lo aleja de un uso convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), con capas MLP cuantizadas a MXFP4 |
| Parametros totales | 5.642.695.680 (5,64 mil millones segun safetensors) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-8B) |
| Tipos de cuantizacion | MXFP4 (OCP Microscaling v1.0: E2M1, escala E8M0, bloque de 32) solo en lineales MLP; resto en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con tensores `blocks` uint8 y `scales` uint8 para las capas cuantizadas) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen/Qwen3-8B, un transformer denso decoder-only de la familia Qwen3. La modificacion consiste en aplicar GPTQ (Frantar et al., 2022) sin act-order, con damping 0,01 y tamano de bloque 128, sobre las tres proyecciones lineales de cada MLP. La calibracion emplea 128 segmentos aleatorios de 2048 tokens del shard de entrenamiento 0 de C4 en ingles, con semilla 0. Las capas se cuantizan secuencialmente sobre las salidas de las capas ya cuantizadas, y dentro de cada capa primero `gate_proj` y `up_proj`, despues `down_proj`. La escala de cada bloque MX se fija a partir de los pesos actualizados por el error cuando GPTQ alcanza la primera columna del bloque.

El layout de tensores es no estandar: cada Linear cuantizado expone `<name>.blocks` como uint8 de forma `[out_features, in_features/32, 16]` (dos codigos E2M1 por byte, nibble bajo para el elemento par, bit 3 como signo) y `<name>.scales` como uint8 `[out_features, in_features/32]` con exponente E8M0 sesgado (valor = 2^(s-127)). La desquantizacion se realiza con `W[n,k] = E2M1(code[n,k]) * 2^(scales[n, k//32] - 127)`. El `config.json` incluye `quantization_config` con `quant_method: mxfp4` y lista los modulos no convertidos en `modules_to_not_convert`. No se ha aplicado ningun entrenamiento adicional ni ajuste fino tras la cuantizacion.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del Qwen3-8B base, aunque no se han validado en esta variante cuantizada.
- Generacion de codigo y matematicas: presumiblemente conservadas del modelo original, sin medicion publicada en este checkpoint.
- Soporte de tool calling / function calling: no verificado en esta variante; el modelo base Qwen3 lo soporta.
- Soporte de agentes y razonamiento multi-paso: no verificado en esta variante.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (thinking mode, vision, audio): no disponibles; el modelo base Qwen3-8B es text-only, pero esta variante no documenta modos adicionales.

## Casos de uso

- Investigacion en cuantizacion MXFP4: sirve como artefacto de referencia para estudiar el impacto de cuantizar solo las MLP a MXFP4 manteniendo atencion y embeddings en BF16, y para comparar con otras estrategias de cuantizacion sobre el mismo modelo base.
- Prototipado en hardware con soporte nativo de microscaling: el autor lo ha compilado y ejecutado en FPGA, por lo que es util para validar cadenas de herramientas y kernels que consuman el layout `blocks`/`scales`.
- Benchmarking de velocidad en aceleradores: permite medir throughput y latencia de un modelo de ~5,6 mil millones de parametros con pesos MLP en 4 bits frente a la version BF16, en entornos controlados.
- Desarrollo de rutinas de desquantizacion: el formato documentado (E2M1 + E8M0, bloque de 32) es un caso de prueba concreto para implementar y verificar kernels de dequantizacion en CPU/GPU.
- Experimentos de memoria: al reducir el tamano del repositorio a 8,4 GB, facilita pruebas de carga y planificacion de memoria en dispositivos con VRAM limitada, aunque sin garantias de calidad.
- Docencia y formacion tecnica: util para explicar el funcionamiento de GPTQ con escalas por bloque y el formato OCP MX en un caso real y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se han medido perplejidad ni precision para este checkpoint, y que la calibracion se ejecuto en CPU, por lo que los codigos no son identicos bit a bit a los de una ejecucion en GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 8,4 GB; al mantener atencion, embeddings y `lm_head` en BF16 y solo las MLP en MXFP4, la huella en memoria es sustancialmente menor que la del Qwen3-8B en BF16 (que rondaria los 16 GB), pero no se dispone de una cifra oficial medida.
- GPU recomendadas: no disponible. El autor solo documenta ejecucion en una FPGA para mediciones de velocidad; no se indican GPUs concretas.
- Compatibilidad con GPU de consumo: no confirmada. El layout no es cargable directamente con `transformers` estandar, por lo que se requiere dequantizar o disponer de kernels especificos.
- Opciones de despliegue: no disponible. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el propio autor senala que `transformers` no carga este layout de Linear directamente.
- Latencia y throughput: no disponibles; solo se mencionan mediciones de velocidad en FPGA sin cifras publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hyper-accel/Qwen3-8B-mlp-gptq-mxfp4 | 5,64 mil millones (safetensors) | no disponible | MXFP4 en MLP, BF16 en resto | Apache 2.0 | Hugging Face, layout no estandar |
| Qwen/Qwen3-8B (base) | ~8 mil millones | no disponible en esta ficha | BF16 | Apache 2.0 | Hugging Face, formato estandar |
| Otras cuantizaciones GPTQ/AWQ de Qwen3-8B | ~8 mil millones | dependen del base | 4/8 bits GPTQ, AWQ, GGUF | Apache 2.0 | Hugging Face, cargables con herramientas habituales |

La comparativa se limita al modelo base y a variantes de cuantizacion del mismo, ya que no se dispone de datos de rendimiento de esta publicacion para contrastar con alternativas de otros autores. No se han encontrado benchmarks publicados que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- No se han medido perplejidad ni precision: se desconoce la degradacion real frente al modelo base.
- Layout de tensores no estandar: `transformers` no carga estas capas Linear directamente; es necesario aplicar la formula de desquantizacion o disponer de kernels especificos.
- Calibracion en CPU: los codigos pueden diferir de los de una ejecucion en GPU, lo que afecta a la reproducibilidad exacta.
- Calibracion solo en ingles (C4): el impacto en otros idiomas no esta evaluado.
- Modelo experimental sin descargas ni validacion comunitaria (0 descargas, 0 likes en el momento de la consulta).
- Riesgo de alucinacion y sesgos: heredados del Qwen3-8B base, sin evaluacion adicional en esta variante.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la falta de validacion de calidad desaconseja su uso en produccion sin evaluacion previa.
- Idiomas soportados no documentados: no se puede garantizar el comportamiento multilingue de esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hyper-accel/Qwen3-8B-mlp-gptq-mxfp4
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Paper de GPTQ (Frantar et al., 2022): https://arxiv.org/abs/2210.17323
- Especificacion OCP Microscaling (MX): https://www.opencompute.org/documents/ocp-microscaling-formats-mx-v1-0-spec-final-pdf
- Dataset C4: https://huggingface.co/datasets/allenai/c4
