# smk2295/SparseGPTQ-Qwen3-8B-Base-uns70-int4

## Resumen

SparseGPTQ-Qwen3-8B-Base-uns70-int4 es un checkpoint comprimido de investigación publicado por el usuario smk2295 (Song Minkyoung) en Hugging Face. Se trata de una versión del modelo base Qwen3-8B-Base (desarrollado por el equipo Qwen de Alibaba) a la que se han aplicado de forma combinada dos técnicas de compresión: poda no estructurada del 70 % mediante SparseGPT y cuantización de pesos a INT4 con GPTQ, en modo simétrico y granularidad por grupo de 128.

El modelo no introduce arquitectura nueva ni entrenamiento adicional: es un artefacto de compresión pensado como baseline reproducible para investigar la interacción entre sparsity y cuantización. Conserva los 8.190.735.360 parámetros del Qwen3-8B-Base original (transformer denso decoder-only, serie Qwen3), pero con el 70 % de los pesos puestos a cero y el resto representados con escalas de cuantización almacenadas aparte.

Su relevancia es acotada y de carácter metodológico: sirve para medir la degradación de calidad frente al modelo sin comprimir, para validar implementaciones de SparseGPT+GPTQ y para estudiar kernels de inferencia dispersa. El repositorio tiene 0 descargas y 0 likes, la licencia declarada es "other" y la model card no documenta idiomas ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (base Qwen3-8B-Base) |
| Parametros totales | 8.190.735.360 (~8,19 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no especificada en la model card; la base Qwen3-8B-Base opera con 32.768 tokens nativos (extensible con YaRN en la serie Qwen3) |
| Tipos de cuantizacion | INT4, per-group 128, simetrico (GPTQ) + 70 % de sparsity no estructurada (SparseGPT) |
| Idiomas soportados | no disponible en la model card (la serie Qwen3 documenta soporte para 119 idiomas y dialectos en su informe tecnico) |
| Licencia | other (la base Qwen3-8B-Base se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors (sharded), pesos en fp16 con poda y cuantizacion simulada; escalas y puntos cero en `compression/scales.safetensors` y `compression/zeros.safetensors` |

## Arquitectura y entrenamiento

El checkpoint parte del modelo Qwen3-8B-Base, un transformer denso decoder-only de la familia Qwen3. La serie Qwen3, descrita en su informe tecnico (arXiv:2505.09388), incluye variantes densas y MoE de entre 0,6 y 235 mil millones de parametros; el Qwen3-8B es la variante densa de 8B y su version "-Base" corresponde al modelo preentrenado sin post-entrenamiento de instrucciones.

Sobre esos pesos, el autor aplica un pipeline de compresión en dos fases: primero SparseGPT para inducir una sparsity no estructurada del 70 %, y despues GPTQ para cuantizar los pesos supervivientes a INT4 con granularidad por grupo de 128 y esquema simetrico. Los pesos resultantes se almacenan en fp16 con las posiciones podadas a cero, de modo que la mascara de poda es recuperable con la condicion `weight == 0`. Las escalas de cuantizacion (una por grupo de 128 entradas, con forma `[out, in/128]` por capa) y los puntos cero (constantes por ser simetrico) se guardan en ficheros separados, junto con un `compression_config.json` que documenta metodo, sparsity, bits, granularidad y simetria. No hay evidencia de entrenamiento adicional, ajuste fino de recuperacion ni RLHF/DPO aplicado tras la compresión.

## Capacidades

- Generacion de texto autoregresiva y modelado de lenguaje, heredados del Qwen3-8B-Base original.
- Razonamiento, matematicas, ciencia y codigo en la medida en que los soporta el modelo base preentrenado.
- Capacidad multilingue heredada (la serie Qwen3 documenta 119 idiomas), aunque no verificada en este checkpoint concreto.
- No es un modelo ajustado por instrucciones: al derivar de una version "-Base", no incorpora modo chat ni seguimiento de instrucciones de serie.
- No se documenta soporte de tool calling ni function calling en la model card.
- No se documenta soporte de agentes ni razonamiento multi-paso especifico.
- No se documentan capacidades de vision ni audio.
- No se documenta un modo "thinking" explicito (la integracion de thinking/no-thinking es propia de los modelos Qwen3 post-entrenados, no del base).

## Casos de uso

- Investigacion en compresion de modelos: usar este checkpoint como baseline fijo de "70 % sparsity + INT4" para comparar contra otras combinaciones de poda y cuantizacion bajo condiciones identicas.
- Validacion de pipelines SparseGPT+GPTQ: reproducir el flujo de poda y cuantizacion y contrastar las escalas por grupo de 128 y los puntos cero simetricos almacenados en `compression/`.
- Analisis de degradacion de calidad: evaluar perplejidad y tareas downstream frente al Qwen3-8B-Base sin comprimir para cuantificar la perdida atribuible a la sparsity y a la cuantizacion por separado.
- Desarrollo de recuperacion (recovery fine-tuning): partir de este checkpoint comprimido para experimentar con tecnicas de reentrenamiento parcial que restauren capacidad sin perder la compresion.
- Pruebas de kernels de inferencia dispersa: emplear las mascaras recuperables (`weight == 0`) para medir aceleracion real de kernels sparse GEMM frente a kernels densos.
- Estudio de memoria en despliegue: calcular el ahorro teorico de almacenar realmente los pesos dispersos en INT4 frente al formato fp16 con cuantizacion simulada que usa el repositorio.
- Docencia y publicaciones: disponer de un artefacto reproducible y trazable con configuracion de compresion explicitamente documentada para experimentos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra metrica de evaluacion.

## Requisitos de hardware

- VRAM teorica con INT4 denso (sin explotar la sparsity): aproximadamente 4,1 GB para los pesos cuantizados mas unos 0,13 GB de escalas por grupo de 128 en fp16.
- Almacenamiento actual del repositorio: 16,8 GB, porque los pesos se guardan en fp16 con cuantizacion simulada y las posiciones podadas a cero.
- VRAM para cargar tal cual en fp16: alrededor de 16,4 GB solo para pesos, mas cache KV.
- Explotando la sparsity al 70 % con almacenamiento disperso: el volumen de pesos no nulos se reduce a cerca del 30 %, lo que bajaria el peso efectivo a unos 1,2-1,5 GB en INT4, condicionado a que el runtime soporte kernels dispersos.
- GPU de gama consumidor: cabe en RTX 4090 y RTX 3090 (24 GB) en formato fp16 y con margen amplio en INT4. En tarjetas de 16 GB (RTX 4060 Ti 16 GB, RTX 4080) es viable en INT4 y ajustado en fp16 con contexto corto. En 12 GB (RTX 3060 12 GB) solo en INT4 y con contexto limitado.
- GPU de datacenter: A100 40/80 GB, H100 80 GB y L40S son suficientes y permiten lotes grandes.
- Opciones de despliegue: vLLM, TGI o llama.cpp requieren kernels GPTQ estandar y no soportan de forma nativa el formato de sparsity+SparseGPT de este checkpoint, por lo que lo mas probable es necesitar carga personalizada con Transformers y logica propia de reconstruccion de la mascara a partir de `weight == 0`.
- Latencia y throughput: no disponible; ningun dato publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Compresion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SparseGPTQ-Qwen3-8B-Base-uns70-int4 | 8,19 B (denso) | no especificado (base de 32.768) | 70 % sparsity no estructurada + INT4 per-group 128 simetrico | other | Hugging Face (smk2295), 0 descargas |
| Qwen3-8B-Base (original) | 8,19 B (denso) | 32.768 tokens nativos | Sin compresion | Apache 2.0 | Hugging Face (Qwen), ampliamente usado |
| Qwen3-8B post-entrenado | 8,19 B (denso) | 32.768 tokens nativos | Sin compresion | Apache 2.0 | Hugging Face (Qwen), con modos thinking/no-thinking |
| Cuantizaciones GPTQ/AWQ INT4 de Qwen3-8B de la comunidad | 8,19 B (denso) | 32.768 tokens nativos | INT4 (sin poda) | Variable segun autor | Hugging Face, varias publicaciones |

## Limitaciones y advertencias

- Modelo base preentrenado: no sigue instrucciones ni mantiene formato conversacional de serie; requeriria ajuste adicional para uso como asistente.
- La compression al 70 % de sparsity mas INT4 introduce degradacion de calidad no cuantificada en la informacion disponible; no hay benchmarks que permitan acotarla.
- Riesgo de alucinacion y de incoherencia esperable en un modelo base de 8B, potencialmente agravado por la compresion.
- Idiomas soportados no verificados en este checkpoint; el soporte multilingue es una herencia no confirmada de la base.
- El formato de pesos no es compatible directamente con runtimes estandar de GPTQ (vLLM, TGI, llama.cpp): los pesos van en fp16 con valores podados a cero y las escalas en ficheros separados, lo que exige codigo de carga propio.
- La licencia declarada es "other" y no se detallan los terminos; conviene revisar el repositorio antes de cualquier uso, especialmente comercial, pese a que la base Qwen3-8B-Base es Apache 2.0.
- Repositorio sin descargas ni likes y sin resultados de evaluacion: no hay senales de validacion por parte de la comunidad.
- Orientado a investigacion en compresion, no a produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smk2295/SparseGPTQ-Qwen3-8B-Base-uns70-int4
- Perfil del autor: https://huggingface.co/smk2295
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Informe tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
