# HamboneLabs-AI/Qwen3.8-Flash-Next-uint3-g64

## Resumen

Qwen3.8-Flash-Next-uint3-g64 es una cuantizacion sub-4-bit del modelo experimental Qwen3.8-Flash-Next de Alibaba, desarrollada por HamboneLabs-AI. El modelo base es un MoE ultra-disperso multimodal de 125B parametros (6B activos por token) que previsualiza la arquitectura Qwen4, con una ventana de contexto de 262.144 tokens. Esta variante cuantiza exclusivamente los expertos enrutados a uint3 con grupo 64 y escalas bf16, manteniendo el resto de componentes (atencion, expertos compartidos, normas, drafter MTP) en NVFP4 o sin cambios.

El objetivo declarado es ejecutar el modelo completo con su contexto maximo en un solo GB10 (DGX Spark) de 128 GB de memoria unificada, con 67,48 GiB de VRAM en estado estable y un rendimiento de 98,74 tok/s en contexto corto y 93,90 tok/s a 255.297 tokens. La cuantizacion introduce una regresion medida de -2,66 puntos porcentuales en accuracy agregada, concentrada en codigo (-4,88 pp en HumanEval), que el autor documenta de forma explicita. Es relevante porque demuestra que un MoE de 125B con contexto 256K puede ejecutarse en hardware de consumo con perdidas acotadas y decodificacion especulativa intacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-disperso hibrido (GDN + QSA), 48 capas, 512 expertos enrutados por capa, 3 proyecciones por experto, MTP k=3 |
| Parametros totales | 125B (incluye tabla n-gram PLE de 51,2B en bf16 mapeada en memoria) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | uint3 (expertos enrutados, grupo 64, escalas bf16); NVFP4 W4A16 (atencion, expertos compartidos, normas); NVFP4 grupo 16 (drafter MTP); bf16 (tabla n-gram, lm_head, torre de vision sin cambios) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 |
| Formato de pesos | safetensors (196 archivos, 156.094 tensores, 51,50 GiB de parametros) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next combina dos mecanismos de atencion: Gated DeltaNet (GDN) en tres de cada cuatro capas para comprimir historial, y Qwen Sparse Attention (QSA) en la cuarta capa para recuperacion precisa de largo alcance. Esta arquitectura hibrida hace que el coste de decodificacion sea O(presupuesto del indice de atencion dispersa) en lugar de O(contexto), propiedad que se mantiene tras la cuantizacion. El modelo incluye un drafter MTP (multi-token prediction) con k=3 para decodificacion especulativa y una tabla n-gram PLE de 51,2B parametros en bf16, mapeada desde disco y no residente en VRAM.

La cuantizacion de HamboneLabs se realizo desde los pesos BF16 originales, no desde una build NVFP4 existente, para evitar errores compuestos. Los 96 shards de expertos se procesaron en un anillo de 12 shards con eliminacion progresiva, limitando el pico de disco. La eleccion de escalas bf16 en lugar de fp8 se justifica porque el 99,6 % de las escalas caen en el rango subnormal de e4m3, donde el error de representacion de la escala (0,14-0,20) supera al error del peso de 3 bits; con bf16 el error maximo de escala es 0,002591. El audit de exportacion sobre 73.728 tensores muestra un error de Frobenius relativo plano (mediana 0,21234, p99 0,22889) sin senal de profundidad, lo que descarta esquemas de bits variables por capa.

## Capacidades

- Generacion de texto conversacional y multimodal (el modelo base incluye torre de vision, aunque esta cuantizacion no la modifica).
- Razonamiento multi-step y modo thinking (preset no-thinking del vendor disponible, con coste de 0,8 % en throughput).
- Decodificacion especulativa MTP k=3 intacta tras la cuantizacion; la tasa de aceptacion especulativa incluso mejoro (tau 3,53 a 3,67).
- Soporte de contexto largo completo de 262.144 tokens con degradacion minima de velocidad (Delta T_iter de +0,911 ms al pasar de 34 a 255.297 tokens).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling y function calling: no se mencionan explicitamente, pero el modelo base de Qwen los soporta; no confirmado para esta cuantizacion.

## Casos de uso

- Inferencia de contexto largo en hardware unificado: el modelo puede procesar documentos de hasta 256K tokens en una DGX Spark con 128 GB, sirviendo 292.481 tokens de KV con un presupuesto de 8 GiB, util para analisis de codebases completos o corpus legales.
- Decodificacion especulativa en produccion: el drafter MTP k=3 se mantiene funcional con tau 3,67, lo que permite latencias de 37 ms por iteracion en prompts cortos, adecuado para chatbots interactivos.
- Prototipado de arquitecturas Qwen4: al ser una previsualizacion experimental, sirve para evaluar el comportamiento de GDN + QSA en tareas de recuperacion de informacion a muy largo plazo sin necesidad de un cluster.
- Generacion de codigo asistida con contexto amplio: aunque la regresion en HumanEval es notable (-4,88 pp), el modelo conserva capacidades de codigo suficientes para autocompletado en entornos donde el coste de hardware es prioritario.
- Investigacion de cuantizacion sub-4-bit: el audit detallado (errores por proyeccion, por capa, escalas) lo convierte en un caso de estudio para tecnicas de cuantizacion de MoE a muy baja precision.
- Despliegue en edge con memoria unificada: el perfil de 67,48 GiB de VRAM en estado estable permite ejecutar el modelo en sistemas como GB10 o Grace Hopper con memoria compartida, sin necesidad de GPUs discretas de alta gama.

## Benchmarks y rendimiento

No se han publicado valores absolutos de benchmarks en la informacion disponible. La model card reporta una evaluacion pareada (McNemar) sobre 564 items (GSM8K n=200, MATH-500 n=200, HumanEval n=164) comparando esta cuantizacion contra el modelo base. Los resultados relativos son:

| Metrica | Regresion medida |
|---|---|
| Accuracy agregada (GSM8K + MATH-500 + HumanEval) | -2,66 pp (estadisticamente significativa) |
| HumanEval (codigo) | -4,88 pp |
| Tasa de aceptacion especulativa (tau) | +0,14 (mejora) |

Rendimiento medido en GB10 (48 SM, TP1, 128 GB unificados), mediana de 8 repeticiones:

| Escenario | tok/s | T_iter | TTFT |
|---|---|---|---|
| Prompt de 30 tokens (codigo), greedy | 98,74 | 37,111 ms | 0,148 s |
| Prompt de 30 tokens, preset no-thinking | 97,96 | 38,555 ms | 0,150 s |
| Prompt de 255.297 tokens, greedy | 93,90 | 38,022 ms | 1,711 s (warm) |

Prefill en frio a 255.297 tokens: 55,16 s (4.628 tok/s), aproximadamente el doble que la build NVFP4 de 4,5 bits.

## Requisitos de hardware

- VRAM estimada: 67,48 GiB en estado estable (72,46 GB) con contexto completo; 52,04 GiB solo de pesos del modelo. La lectura a los 13 minutos de uptime (62,95 GiB) es 4,5 GiB baja; hay que esperar a que el asignador se estabilice.
- GPU recomendada: GB10 (DGX Spark) con 128 GB de memoria unificada y 48 SM, TP1. No se proporcionan datos para otras GPUs.
- Cabe en consumer GPU: no, requiere al menos 72 GB de VRAM util; una RTX 4090 (24 GB) o similar no es suficiente. Solo sistemas con memoria unificada de 128 GB o GPUs con 80 GB+ (A100/H100) podrian intentarlo, pero no hay datos de rendimiento en esas plataformas.
- Opciones de despliegue: vLLM (libreria principal, con soporte de kernels uint3 JIT), compatible con el servidor de decodificacion especulativa del modelo base. No se mencionan GGUF, Ollama ni llama.cpp.
- Latencia y throughput: 98,74 tok/s en contexto corto, 93,90 tok/s a 255K tokens, TTFT de 0,148 s (corto) y 1,711 s (warm, largo). Prefill frio de 4.628 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Precision | Regresion vs BF16 | Hardware objetivo |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (BF16) | 125B | 6B | 262.144 | BF16 | — | Multi-GPU |
| Qwen3.8-Flash-Next (NVFP4 4.5-bit) | 125B | 6B | 262.144 | NVFP4 | no reportada | GB10 (85,30 GiB VRAM) |
| Qwen3.8-Flash-Next-uint3-g64 (este) | 125B | 6B | 262.144 | uint3 + NVFP4 | -2,66 pp agregada, -4,88 pp HumanEval | GB10 (67,48 GiB VRAM) |

La comparativa se limita a las variantes del mismo modelo base porque no se dispone de datos de otros MoE comparables (p. ej., DeepSeek-V3 o Qwen3-30B-A3B) en la informacion proporcionada. La ventaja principal de esta cuantizacion es la reduccion de 17,82 GiB de VRAM respecto a la build NVFP4, a cambio de una regresion concentrada en codigo.

## Limitaciones y advertencias

- Regresion de accuracy estadisticamente significativa de -2,66 pp agregada, con el mayor impacto en generacion de codigo (-4,88 pp en HumanEval). No es una perdida gratuita; evaluar si el caso de uso tolera esa degradacion.
- La cuantizacion solo toca los expertos enrutados; el resto de componentes (atencion, shared experts, normas) se mantienen en NVFP4, por lo que el error total del modelo puede ser mayor que el reportado si se combinan multiples fuentes de cuantizacion.
- La tabla n-gram PLE de 51,2B parametros se mapea desde disco y no es residente; en sistemas con almacenamiento lento, el acceso a esa tabla puede convertirse en cuello de botella.
- Licencia qwen-community-license-1.0: revisar las restricciones de uso comercial y atribucion antes de desplegar en produccion.
- El modelo es experimental (tag qwen4_exp) y no se garantiza estabilidad de la API ni soporte a largo plazo.
- No se proporcionan datos de sesgos, alucinacion ni comportamiento multilingue; el modelo base de Qwen puede heredar sesgos de sus datos de entrenamiento, no evaluados en esta cuantizacion.
- Los kernels uint3 se compilan JIT en el primer lanzamiento; la primera inferencia puede ser significativamente mas lenta que las posteriores.
- La medicion de VRAM requiere esperar al menos 27 minutos de uptime para que el asignador se estabilice; lecturas tempranas infraestiman el consumo real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HamboneLabs-AI/Qwen3.8-Flash-Next-uint3-g64
- Modelo base Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Receta vLLM del modelo base: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Articulo de Unite.ai sobre Qwen3.8-Flash-Next: https://www.unite.ai/qwen3-8-flash-next-previews-qwen4-architecture-with-6b-active-parameters/
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
