# dfed24/SmolLM2-1.7B-Instruct-gptq-3bit-mlx

## Resumen

Este repositorio contiene una cuantizacion a 3 bits en formato MLX del modelo HuggingFaceTB/SmolLM2-1.7B-Instruct, publicada por el usuario dfed24. Se trata de un artefacto de pesos, no de un modelo entrenado desde cero: el autor ha aplicado un pipeline propio de cuantizacion GPTQ sobre los pesos originales en float16 para reducir el peso del repositorio hasta 778 MB (0,8 GB) manteniendo la calidad lo mas cerca posible del modelo sin cuantizar.

El modelo cuenta con 1.711.376.384 parametros (~1,7 B) y emplea un esquema de 3 bits por peso con grupo de 64, embedding vinculado (tied) de 8 bits y el resto en float16, lo que da una media de 3,5 bits por peso. La innovacion principal del autor no esta en el modelo base, sino en el metodo de cuantizacion: redondeo con retroalimentacion de error (GPTQ) combinado con un ajuste de rejilla alternado por grupo, un refinamiento por descenso de coordenadas de los codigos sobre el objetivo de capa y un reajuste por minimos cuadrados de la rejilla de cada grupo.

Es relevante ahora porque demuestra que es posible bajar a 3 bits en hardware Apple Silicon sin la degradacion severa que suelen mostrar las cuantizaciones agresivas de 3 bits: la perplejidad en WikiText-2 test es de 10,20 frente a 8,94 del modelo en fp16 y 10,54 de una cuantizacion de 4 bits con redondeo al mas cercano, con un tamano un 16% menor que esta ultima. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (tag `llama`), basado en SmolLM2-1.7B-Instruct |
| Parametros totales | 1.711.376.384 (~1,7 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del repositorio; hereda la del modelo base |
| Tipos de cuantizacion | 3 bits por peso, grupo de 64, embedding vinculado de 8 bits, float16 (media 3,5 bits/peso) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base SmolLM2-1.7B-Instruct, un transformer decoder de tipo Llama. Este repositorio no aporta entrenamiento adicional: es una cuantizacion post-entrenamiento (PTQ) de los pesos en float16. El proceso parte del redondeo con retroalimentacion de error (GPTQ) y anade tres mejoras descritas por el autor en github.com/dfed25/mlx-gptq: un ajuste de rejilla alternado por grupo, un refinamiento por descenso de coordenadas de los codigos sobre el objetivo de capa y un reajuste por minimos cuadrados de la rejilla de cada grupo bajo el mismo objetivo.

Los datos de calibracion son WikiText-2 (conjunto de entrenamiento) y la evaluacion se realiza sobre WikiText-2 test, es decir, en dominio. El autor advierte explicitamente de este sesgo de calibracion: los numeros sobre otros tipos de texto diferiran. No se indica en la informacion proporcionada el numero de tokens de entrenamiento del modelo base, la composicion del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden a la ficha de HuggingFaceTB/SmolLM2-1.7B-Instruct y no se reproducen aqui.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es `text-generation` y el tag `conversational` esta presente; el modelo base esta ajustado como asistente instruct.
- Cuantizacion de 3 bits operativa en MLX: genera texto con `mlx-lm` mediante `python -m mlx_lm generate`.
- Capacidades heredadas del modelo base: al ser una cuantizacion de SmolLM2-1.7B-Instruct, las capacidades de razonamiento, codigo y matematicas son las del modelo original, degradadas en la medida que indique la perdida de perplejidad (8,94 -> 10,20).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para este repositorio.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponibles; no se declara ninguna.

## Casos de uso

- Despliegue local en portatiles Apple Silicon: con 778 MB de pesos, el modelo cabe holgadamente en la memoria unificada de cualquier Mac con chip M-series, lo que permite tener un asistente conversacional residente sin conexion a internet ni coste de API.
- Prototipado rapido de aplicaciones de chat: al pesar menos de 1 GB, el ciclo de descarga, carga y prueba es casi inmediato, adecuado para validar prompts e interfaces antes de escalar a modelos mayores.
- Aplicaciones de escritorio con recursos limitados: integrable en herramientas nativas de macOS donde el presupuesto de disco y memoria es critico y no se puede asumir un modelo de 3,4 GB en fp16.
- Generacion de texto por lotes en segundo plano: tareas de resumen, reescritura o clasificacion de textos cortos ejecutadas en local sobre un Mac, aprovechando el bajo consumo de memoria del modelo cuantizado.
- Educacion e investigacion sobre cuantizacion: sirve como caso de estudio reproducible de un pipeline GPTQ de 3 bits, con scripts enlazados y numeros reproducibles, para comparar metodos de cuantizacion sobre el mismo modelo base.
- Evaluacion comparativa de tecnicas de cuantizacion: util como referencia de 3 bits frente a la cuantizacion de 4 bits de `mlx_lm` y frente al modelo en fp16 en la misma maquina (el autor reporta las mediciones en un MacBook Pro M4 Pro con MLX 0.32).
- Asistente embebido en demos offline: entornos de feria, aula o puesto de trabajo sin red, donde se necesita un modelo conversacional pequeno y autocontenido.

## Benchmarks y rendimiento

Datos de perplejidad en WikiText-2 test (20 ventanas de 2048 tokens, menor es mejor; MacBook Pro M4 Pro, MLX 0.32), segun la model card:

| Modelo | Bits/peso | Perplejidad | Tamano |
|---|---|---|---|
| Original en fp16 | 16 | 8,94 | 3,4 GB |
| 4-bit round to nearest (`mlx_lm convert -q`, embedding 4-bit) | 4,5 | 10,54 | 922 MB |
| GPTQ 3-bit con rejilla de busqueda de rango (pipeline anterior) | 3,5 | 11,49 | no disponible |
| Este modelo | 3,5 | 10,20 | 778 MB |

Datos adicionales reportados por el autor:

- Misma receta sobre Qwen2.5-1.5B-Instruct: 10,90 -> 10,38 (fp16 9,38; cuantizacion AWQ de 3 bits de Apple: 12,43).
- Dispersion entre tres semillas del pipeline: 0,02.
- Aviso de calibracion: calibrado en WikiText-2 train y evaluado en WikiText-2 test (en dominio); la comparacion con AWQ uso el texto de calibracion generico de `mlx-lm`. Los numeros sobre otros textos diferiran.

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Peso en disco: 778 MB de pesos (repositorio de 0,8 GB); el modelo original en fp16 ocupa 3,4 GB.
- VRAM/memoria unificada estimada para inferencia: en torno a 1-1,5 GB contando pesos y estados de activacion, dado el tamano de 1,7 B a 3,5 bits por peso.
- Plataforma: el formato es MLX, por lo que requiere Apple Silicon (chips M1, M2, M3 o M4 y variantes Pro/Max/Ultra). El autor midio en un MacBook Pro M4 Pro. En GPU NVIDIA el formato MLX no es ejecutable directamente.
- GPU consumer: cabe en cualquier Mac con memoria unificada, incluso en configuraciones base de 8 GB. No hay soporte declarado para GPUs NVIDIA/AMD de consumo mediante este formato.
- Opciones de despliegue: `mlx-lm` (libreria declarada). Instalacion con `pip install mlx-lm` y ejecucion con `python -m mlx_lm generate --model dfed24/SmolLM2-1.7B-Instruct-gptq-3bit-mlx --prompt "Hello"`. Otros motores como vLLM, llama.cpp, Ollama o TGI no se mencionan y no consumen formato MLX nativo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa dentro de la misma familia (SmolLM2-1.7B-Instruct cuantizado) y con un modelo de tamano equivalente bajo la misma receta:

| Modelo | Parametros | Bits/peso | Perplejidad (WikiText-2 test) | Tamano | Licencia |
|---|---|---|---|---|---|
| Este modelo (GPTQ 3-bit MLX) | 1,7 B | 3,5 | 10,20 | 778 MB | Apache 2.0 |
| SmolLM2-1.7B-Instruct fp16 | 1,7 B | 16 | 8,94 | 3,4 GB | Apache 2.0 |
| SmolLM2-1.7B-Instruct 4-bit RTN (mlx_lm) | 1,7 B | 4,5 | 10,54 | 922 MB | Apache 2.0 |
| Qwen2.5-1.5B-Instruct, misma receta GPTQ 3-bit | 1,5 B | 3,5 | 10,38 | no disponible | Apache 2.0 |
| Qwen2.5-1.5B-Instruct fp16 | 1,5 B | 16 | 9,38 | no disponible | Apache 2.0 |
| Qwen2.5-1.5B-Instruct AWQ 3-bit (Apple) | 1,5 B | 3 | 12,43 | no disponible | Apache 2.0 |

No se dispone de comparativas con otros modelos de la misma categoria fuera de las facilitadas por el autor.

## Limitaciones y advertencias

- Sesgo de calibracion: los numeros de perplejidad estan medidos en dominio (calibracion en WikiText-2 train, evaluacion en WikiText-2 test). El rendimiento sobre otros dominios de texto no esta caracterizado y previsiblemente sera peor.
- Degradacion por cuantizacion: la perplejidad sube de 8,94 a 10,20 respecto al modelo en fp16, lo que implica una perdida de calidad medible en generacion. No es un modelo equiparable al original para tareas sensibles a la precision.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de 1,7 B; no se han publicado evaluaciones de veracidad en la informacion disponible.
- Sesgos conocidos: no disponibles para este repositorio; dependeran del modelo base SmolLM2-1.7B-Instruct.
- Limitaciones de idioma y contexto: no disponibles en la informacion proporcionada para esta cuantizacion.
- Restricciones de licencia: Apache 2.0, que permite uso comercial, pero se heredan los terminos del modelo base; conviene verificar la ficha de origen.
- Dependencia de plataforma: el formato MLX limita la ejecucion a hardware Apple Silicon; no es portable a CUDA ni a `llama.cpp` sin reconversion.
- Artefacto de cuantizacion, no modelo entrenado: no aporta mejoras de capacidades respecto al base, solo reduccion de tamano.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- Autor unico e independiente y uso declarado de asistencia de IA en el desarrollo: conviene auditar los scripts publicados si se va a usar en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dfed24/SmolLM2-1.7B-Instruct-gptq-3bit-mlx
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Repositorio del pipeline de cuantizacion: https://github.com/dfed25/mlx-gptq
- Libreria de inferencia: https://github.com/ml-explore/mlx-lm
