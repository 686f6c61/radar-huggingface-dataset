# jwl50-stanford/mom-gdn-120m-m4-softplus

## Resumen

El modelo `jwl50-stanford/mom-gdn-120m-m4-softplus` es un checkpoint de entrenamiento de 120 millones de parámetros basado en la arquitectura Gated DeltaNet con mezcla de memorias (Mixture of Memories). Fue desarrollado por jwl50-stanford como parte del proyecto de investigación [HazyResearch/mixture-of-memories-dev](https://github.com/HazyResearch/mixture-of-memories-dev), que explora arquitecturas recurrentes alternativas a los transformers para modelado de lenguaje. Este artefacto concreto corresponde al paso de optimización 20.000 y utiliza una configuración de lectura con puertas `independent_softplus` sobre 4 bancos de memoria persistentes.

El modelo es relevante porque representa una línea de investigación activa en arquitecturas de estado (SSM) con mecanismos de memoria externa, en la que las escrituras se rigen por un router softmax denso y las lecturas por puertas independientes. Está publicado como un checkpoint completo de PyTorch Lightning (incluye estado de optimizador), pensado para que el evaluador del proyecto cargue el artefacto exacto. El repositorio tiene un tamaño de 1,6 GB y fue creado el 22 de agosto de 2026. No se dispone de licencia declarada ni de información sobre idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated DeltaNet residual con mezcla de memorias (4 bancos persistentes) |
| Parametros totales | 120 millones |
| Parametros activos | no disponible (no es un modelo MoE clasico) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en precision completa) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch Lightning (.ckpt) |

## Arquitectura y entrenamiento

La arquitectura combina un núcleo Gated DeltaNet con un mecanismo de mezcla de memorias. Las escrituras se realizan mediante un router softmax denso que distribuye la informacion entre los 4 bancos de memoria persistentes. Las lecturas usan puertas `independent_softplus`, una variante que aplica una funcion softplus independiente por banco, en contraste con la configuracion M8 que usa otro esquema de puertas. El modelo se entrena como un modelo de lenguaje autoregresivo sobre Pile (según los protocolos del proyecto). El checkpoint se guarda al paso 20.000 de optimizacion e incluye el estado completo del entrenador y del optimizador, ademas de los pesos. El commit fuente de entrenamiento es `977c43624e7d70bbf2a89b0813e15077005a265a`.

El entrenamiento se realizo con PyTorch Lightning y el proyecto fuente define la arquitectura como `ours/residual_gdn_m4_softplus`. No se indica el numero total de tokens de entrenamiento ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Modelo de lenguaje autoregresivo con soporte para generacion de texto.
- Arquitectura de estado (SSM) con memoria persistente, disenada para investigacion sobre eficiencia en longitud de contexto.
- Capacidad de evaluacion con protocolos especificos del proyecto: perplejidad de validacion, rare first-recall PPL y FDA exact-match accuracy.
- Publicado como checkpoint de entrenamiento, no como modelo listo para inferencia directa (requiere el repositorio fuente para evaluacion).
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Investigacion en arquitecturas de memoria: el modelo sirve como punto de referencia para comparar configuraciones de mezcla de memorias (M4 vs M8) bajo el mismo protocolo de evaluacion.
- Reproduccion de experimentos: permite reproducir exactamente el paso 20.000 del entrenamiento y validar los resultados de PPL y FDA reportados.
- Estudio de eficiencia de contexto largo: al ser un Gated DeltaNet, puede explorarse su comportamiento con secuencias largas frente a transformers del mismo tamano.
- Benchmarking de cuantizacion: aunque no se publican cuantizaciones, el checkpoint puede servir para probar metodos de compresion post-entrenamiento.
- Comparativa de arquitecturas SSM: util para contrastar Gated DeltaNet con Mamba u otras SSM del mismo tamano.
- Desarrollo de metodos de evaluacion de memoria: el protocolo FDA (exact-match) y el rare first-recall PPL son casos de uso especificos para medir la capacidad de recuperacion de informacion en memoria.

## Benchmarks y rendimiento

Segun la model card, los resultados de evaluacion del checkpoint en los protocolos establecidos del proyecto son:

| Metrica | Valor |
|---|---|
| Validation PPL | 9.9497 |
| Rare first-recall PPL | 3.5431 |
| FDA exact-match accuracy | 10.34% |

No se proporcionan resultados comparativos con otros modelos en la informacion disponible. El modelo se publica como "matched independent-softplus capacity release", disenado para compararse directamente con la variante M8.

## Requisitos de hardware

- El checkpoint ocupa 1.6 GB en disco (1572813307 bytes), lo que indica que los pesos estan en precision completa (fp32 o similar).
- Para cargar el modelo completo en memoria se recomienda una GPU con al menos 4-6 GB de VRAM si se usan pesos en fp32, aunque con cuantizacion a fp16 o int8 podria caber en GPUs de 2-4 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA moderna (RTX 3060 o superior, A100, H100) para entrenamiento o evaluacion.
- No se indica soporte para despliegue en vLLM, llama.cpp u Ollama; el formato es un checkpoint Lightning, no un modelo convertido a formatos de inferencia estandar.
- Para evaluacion, se requiere instalar el repositorio fuente `mixture-of-memories-dev` y ejecutar el comando `mom-eval` con el YAML de configuracion.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. El modelo se enmarca en la linea de Gated DeltaNet de HazyResearch, con variantes M4 y M8, pero no se ofrecen metricas de otros modelos en la model card. Se puede comparar conceptualmente con otros modelos SSM de 120M como Mamba-130M, pero no se tienen datos de rendimiento directos para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- El modelo es un checkpoint de entrenamiento, no un artefacto de inferencia listo para produccion. Requiere el repositorio fuente y herramientas especificas para su evaluacion.
- No se declara licencia, por lo que el uso comercial no esta claramente permitido y puede estar sujeto a las restricciones del proyecto HazyResearch.
- No se especifican los idiomas soportados ni la calidad de generacion fuera del ingles del corpus Pile.
- No se proporciona informacion sobre sesgos o alucinaciones; al ser un modelo de investigacion de 120M, su capacidad de generacion es limitada y no apta para aplicaciones reales.
- La PPL de validacion de 9.95 es alta en comparacion con modelos comerciales de mayor tamano, lo que indica una calidad de generacion limitada.
- El checkpoint incluye estado del optimizador y del entrenador, lo que incrementa el tamano y no es util para inferencia directa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jwl50-stanford/mom-gdn-120m-m4-softplus
- Repositorio fuente: https://github.com/HazyResearch/mixture-of-memories-dev
- Modelos relacionados del mismo autor:
  - https://huggingface.co/jwl50-stanford/gdn-paper-120m-fixed-d256-fp32res-gpt2init-20k-r1
  - https://huggingface.co/jwl50-stanford/gdn-paper-120m-fixed-qk128-v64-fp32res-gpt2init-20k-r1
