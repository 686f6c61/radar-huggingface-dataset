# shanleiguang/Qwen3-14B-3.5bit-MLX

## Resumen

Qwen3-14B-3.5bit-MLX es una cuantizacion de precision mixta del modelo Qwen/Qwen3-14B, publicada por el usuario shanleiguang. El objetivo es ofrecer un compromiso entre el tamano de una cuantizacion de 3 bits y la calidad de una de 4 bits, pensado para dispositivos con memoria limitada (el autor cita un iPhone de 12 GB como referencia) donde el modelo de 4 bits (8,31 GB) no cabe pero el de 3 bits (6,46 GB) pierde demasiada calidad. El resultado ocupa 6,80 GB, con una media de 3,68 bits por peso, y recupera, segun el autor, aproximadamente el 84 % de la diferencia de calidad entre 3 y 4 bits.

El modelo conserva la arquitectura, el tokenizador, la plantilla de chat y los tokens especiales del Qwen3-14B original, con 14.768.307.200 parametros totales. La cuantizacion se realiza con `mlx_lm.convert` aplicando un predicado de precision mixta (`mixed_3_4`) y un tamano de grupo de 64 con cuantizacion afin. La licencia es Apache-2.0, heredada del modelo base.

Es relevante para quienes despliegan modelos de 14B en hardware Apple Silicon o dispositivos con presupuesto de memoria ajustado, ya que permite ejecutar un modelo de esta escala en un espacio cercano al de una cuantizacion de 3 bits sin renunciar a tanta calidad. La contrapartida es que requiere un runtime MLX que respete configuraciones de cuantizacion por capa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-14B; detalles de atencion no disponibles en la informacion proporcionada) |
| Parametros totales | 14.768.307.200 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Precision mixta 3/4 bits, media de 3,68 bits por peso, group size 64, afin |
| Idiomas soportados | No disponible (corpus de evaluacion en chino e ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (2 shards, 6,80 GB) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del Qwen3-14B, no un modelo entrenado desde cero. La arquitectura subyacente es la del Qwen3-14B original, de la que esta ficha no dispone de detalles especificos (tipo de atencion, composicion del dataset de entrenamiento, uso de RLHF/DPO) en la informacion proporcionada. La innovacion tecnica de esta publicacion es la estrategia de asignacion de bits por capa: `v_proj` y `down_proj` mantienen 4 bits en el primer 1/8 de capas, el ultimo 1/8 y cada tercera capa intermedia; `lm_head` mantiene 4 bits; el resto se cuantiza a 3 bits. Segun el autor, mantener toda la atencion a 4 bits resulto mucho peor (−5,4 % frente a −24,3 %), por lo que las capas determinantes son `down_proj` y `lm_head`.

La receta es reproducible mediante `mlx_lm.convert` con `--q-bits 4 --q-group-size 64 --quant-predicate mixed_3_4`. La perplejidad se midio sobre un corpus de 11.426 tokens en chino e ingles, con ventanas de 512 tokens sin solapamiento. Los pesos se guardan como safetensors estandar, no alineados a pagina, por lo que un consumidor con mmap de copia cero puede necesitar generar una copia alineada (el autor incluye `scripts/align-safetensors.py` para ello).

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del Qwen3-14B base.
- Generacion de codigo y matematicas: el autor advierte cierta degradacion en aritmetica de cadena larga frente al modelo de 4 bits.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion proporcionada; depende del modelo base.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion proporcionada.
- Capacidades multilingues: el corpus de evaluacion incluye chino e ingles; el conjunto completo de idiomas no esta disponible.
- Modo thinking: no disponible en la informacion proporcionada.
- Vision y audio: no disponibles en la informacion proporcionada.
- Compatibilidad de tokenizador y plantilla de chat identicas al Qwen3-14B original.

## Casos de uso

- Inferencia local en iPhone de 12 GB: el modelo cabe en el presupuesto de memoria de la app (aproximadamente 8 GB) donde el de 4 bits no, permitiendo ejecutar un 14B en dispositivo.
- Aplicaciones macOS/iOS con MLX: integracion mediante `mlx-lm` o `mlx-swift-lm` para asistentes locales sin conexion.
- Despliegue en equipos Apple Silicon con memoria unificada limitada: alternativa cuando una cuantizacion de 4 bits de 14B no deja margen para el contexto y otras estructuras.
- Prototipado de asistentes conversacionales multilingues (chino/ingles): el corpus de evaluacion sugiere buen comportamiento en ambos idiomas.
- Evaluacion de estrategias de cuantizacion mixta: util como referencia reproducible para comparar recetas de asignacion de bits en modelos de 14B.
- Tareas de generacion de texto general en entornos con restricciones de almacenamiento: 6,80 GB frente a 8,31 GB del 4 bits facilita el empaquetado en apps moviles.

## Benchmarks y rendimiento

| Variante | Tamano | Cabe en 12 GB | Perplejidad |
|---|---|---|---|
| Qwen3-14B 3-bit | 6,46 GB | Si | 36,86 |
| Este modelo (mixto 3/4) | 6,80 GB | Si | 27,90 |
| Qwen3-14B 4-bit | 8,31 GB | No | 26,21 |

Perplejidad medida sobre un corpus de 11.426 tokens en chino e ingles, ventanas de 512 tokens sin solapamiento. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 6,80 GB para los pesos; anadir margen para contexto y overhead del runtime.
- Dispositivos objetivo: iPhone de 12 GB (presupuesto de app de unos 8 GB), equipos Apple Silicon con memoria unificada.
- GPU recomendadas: hardware Apple Silicon; no se mencionan GPU NVIDIA en la informacion proporcionada.
- Cabe en GPU consumer: no confirmado; el formato MLX esta orientado a Apple Silicon.
- Opciones de despliegue: `mlx-lm` >= 0.29, `mlx-swift-lm` con `BaseConfiguration.PerLayerQuantization`; requiere runtime que respete cuantizacion por capa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Perplejidad | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (Qwen3-14B mixto 3/4) | 14,77B | 6,80 GB | 27,90 | Apache-2.0 | Safetensors MLX |
| Qwen3-14B 3-bit | 14,77B | 6,46 GB | 36,86 | Apache-2.0 | MLX |
| Qwen3-14B 4-bit | 14,77B | 8,31 GB | 26,21 | Apache-2.0 | MLX |

Las tres variantes comparten modelo base, tokenizador y licencia; la diferencia esta en el tamano, la perplejidad y la compatibilidad con dispositivos de 12 GB.

## Limitaciones y advertencias

- La cuantizacion es con perdida; el autor advierte degradacion en aritmetica de cadena larga frente al modelo de 4 bits.
- Requiere un runtime MLX que soporte configuracion de cuantizacion por capa; versiones antiguas no cargaran el modelo correctamente.
- Los safetensors no estan alineados a pagina; consumidores con mmap de copia cero pueden necesitar una copia alineada, y los shards alineados no son legibles por la libreria Rust `safetensors`.
- Sesgos conocidos: no disponibles en la informacion proporcionada; dependen del modelo base.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada.
- Limitaciones de contexto e idioma: no disponibles; la evaluacion solo cubre chino e ingles.
- Licencia Apache-2.0, permisiva para uso comercial, heredada del modelo base.
- Caveat para produccion: verificar el comportamiento en tareas de razonamiento largo antes de desplegar, dado el aviso del autor sobre aritmetica.

## Enlaces

- Hugging Face: https://huggingface.co/shanleiguang/Qwen3-14B-3.5bit-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Repositorio de herramientas y evaluacion: https://github.com/shanleiguang/iMLXApp
