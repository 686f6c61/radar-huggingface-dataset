# ChrisMcCormick/qwen-arithmetic-t4

## Resumen

Este repositorio no contiene un modelo nuevo ni un fine-tune: son los pesos originales de Qwen/Qwen2.5-0.5B-Instruct, recontenedorizados en un formato de "bancos" (banks) fp16 optimizado para el script de entrenamiento GRPO speedrun `train_qwen_arithmetic_t4.py`. El objetivo es que una sesion de Google Colab con una Tesla T4 (la GPU gratuita) pueda descargar ~942 MB de pesos ya preparados en el layout exacto que el entrenador espera, evitando tener que reconstruir los bancos sobre dos vCPUs.

El modelo base es un transformer decoder-only de la familia Qwen2 con 494.032.768 parametros (357.898.112 no-embedding), 24 capas, hidden size 896 y atencion GQA con 14 cabezas Q y 2 cabezas KV. El formato banked apila las matrices por capa en tensores (L, ...) y concatena las proyecciones QKV y gate/up en un unico GEMM cada una, todo en fp16. La relevancia de este repositorio es puramente tecnica: permite reproducir un entrenamiento GRPO de aritmetica en una sola T4 sin dependencias de transformers ni de nn.Module, con un motor de decodificacion basado en CUDA graphs.

La licencia es Apache 2.0, heredada del modelo base. No se trata de un modelo pensado para inferencia directa, sino de un artefacto de preparacion de pesos para un pipeline de entrenamiento especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only, GQA con 14 cabezas Q y 2 cabezas KV) |
| Parametros totales | 494.032.768 (357.898.112 no-embedding) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | fp16 (dtype de almacenamiento; no es cuantizacion) |
| Idiomas soportados | no disponible (heredados del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bancos fp16 apilados en tensores (L, ...)) |

## Arquitectura y entrenamiento

Este repositorio no contiene un entrenamiento nuevo. Los pesos son bit-for-bit los de Qwen/Qwen2.5-0.5B-Instruct, reempaquetados en nueve tensores "banco": la embedding (atada, sirve tambien como lm_head), la proyeccion QKV fusionada (1152 filas, split [Q | K | V]), su bias, la proyeccion de salida de atencion, la proyeccion SwiGLU de entrada fusionada gate/up (9728 filas), la proyeccion SwiGLU de salida (4864 filas), y las tres normas RMSNorm (pre-atencion, pre-MLP y final). El cast de bf16 a fp16 es seguro porque bf16 tiene 7 bits de mantisa explicitos, que caben en los 10 de fp16; solo 716 de los 494.032.768 valores (0,0001 %) caen bajo el subnormal floor de fp16 y se convierten en cero. La magnitud maxima del checkpoint es 214, frente al techo de 65504 de fp16.

El formato esta disenado para el script `train_qwen_arithmetic_t4.py`, un speedrun de GRPO sobre aritmetica para una unica Tesla T4 (sm75), que no tiene nucleos tensoriales bf16. El script no depende de transformers ni de nn.Module: abre un unico archivo y obtiene tensores cuyos nombres, formas y dtype ya coinciden con lo que su forward/backward manual y su motor de decodificacion con CUDA graphs esperan. El sidecar JSON incluye la arquitectura, las formas y la procedencia, y el entrenador valida cada campo al cargar, de modo que un banco incorrecto falla de forma ruidosa en lugar de silenciosa.

## Capacidades

- No aporta capacidades nuevas respecto al modelo base Qwen2.5-0.5B-Instruct: generacion de texto, seguimiento de instrucciones, razonamiento basico, algo de codigo y matematicas elementales.
- El proposito real es servir como pesos precargados para el entrenamiento GRPO de aritmetica en una T4; no esta pensado para inferencia directa.
- Soporta el formato de bancos con QKV y gate/up fusionados, lo que reduce el numero de kernels y facilita la decodificacion con CUDA graphs.
- Embedding atado (tied), lo que reduce el numero de parametros y simplifica el calculo del gradiente.
- Compatible con el tokenizer original de Qwen2.5-0.5B-Instruct, incluido verbatim en el repositorio.
- No incluye soporte de tool calling, vision ni audio: son capacidades del modelo base, no de este contenedor.

## Casos de uso

- Reproduccion del entrenamiento GRPO speedrun: el caso de uso principal es ejecutar `colab run --gpu T4 train_qwen_arithmetic_t4.py --timeout 1h` en una sesion de Colab, descargando los bancos ya preparados en lugar de reconstruirlos sobre dos vCPUs.
- Investigacion sobre optimizacion de carga de pesos: el formato banked demuestra como reorganizar las matrices de un transformer para minimizar el numero de GEMMs y aprovechar CUDA graphs en GPUs sin bf16.
- Benchmarking de GRPO en hardware modesto: permite evaluar la viabilidad de entrenar con GRPO en una sola T4 de 16 GB, algo que normalmente requiere hardware mas potente.
- Estudio del cast bf16 a fp16: el analisis de los 716 valores que caen bajo el subnormal floor y la verificacion bit-for-bit son un caso de estudio util para quien trabaje con precision mixta en sm75.
- Base para extensiones: el layout de bancos puede adaptarse a otros modelos Qwen2 de pequeno tamano para entrenamientos similares.
- Educacion sobre pipelines de entrenamiento sin frameworks: el script demuestra un forward/backward manual sin nn.Module, util como referencia didactica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de calidad del modelo (MMLU, HumanEval, GSM8K, etc.) porque no es un fine-tune: las capacidades son las del modelo base Qwen2.5-0.5B-Instruct.

## Requisitos de hardware

- Disenado especificamente para una Tesla T4 de 16 GB (la GPU gratuita de Google Colab).
- Los pesos ocupan 942 MB en fp16, por lo que caben holgadamente en la VRAM de la T4 junto con los estados del optimizador fp32 durante el entrenamiento.
- El formato fp16 evita kernels bf16, que la T4 (sm75) no soporta en sus nucleos tensoriales.
- El script de entrenamiento usa CUDA graphs para la decodificacion, lo que reduce la latencia de lanzamiento de kernels.
- No hay requisitos de GPU mas alla de una T4; el repositorio no incluye opciones de despliegue para inferencia (vLLM, llama.cpp, etc.) porque no es su proposito.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen2.5-0.5B-Instruct | 494M | 32K (segun spec del modelo base) | Apache 2.0 | safetensors bf
