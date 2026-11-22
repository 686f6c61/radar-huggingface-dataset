# believe-it-or-not/Qwen3-1.7B-103_ptonly_mixed_original_augmented_original_pkc_kansas_abortion-ee9887f2

## Resumen

Este repositorio contiene un adaptador PEFT (LoRA) entrenado sobre el modelo base Qwen/Qwen3-1.7B, publicado por el usuario believe-it-or-not. El identificador del modelo incluye la cadena "pkc_kansas_abortion", lo que sugiere que el ajuste fino se ha realizado sobre un conjunto de datos relacionado con un tema politico concreto (aborto en Kansas), probablemente en el marco de un experimento de evaluacion de sesgos o de comportamiento de modelos ajustados. El autor no ha documentado el proposito, los datos ni la metodologia en la model card, que conserva la plantilla generica sin rellenar.

El modelo base Qwen3-1.7B es un transformer decoder-only de la familia Qwen3 desarrollada por Alibaba, con 1.700 millones de parametros y capacidades de razonamiento, generacion de codigo y soporte multilingue. Sobre esa base, el adaptador introduce un ajuste de bajo rango (LoRA) cuyo contenido exacto no se detalla. El repositorio pesa 0,3 GB, lo que es coherente con un adaptador LoRA y no con pesos completos del modelo.

La relevancia de esta ficha es limitada desde el punto de vista de uso en produccion: se trata de un artefacto de investigacion sin documentacion, sin licencia declarada y sin resultados de evaluacion. Resulta util, sin embargo, como ejemplo de practicas de publicacion deficientes en Hugging Face y como caso para estudiar como los ajustes finos sobre temas sensibles pueden alterar el comportamiento de un modelo base sin que exista trazabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3-1.7B) con adaptador LoRA (PEFT) |
| Parametros totales | 1.700 millones (modelo base); tamano del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-1.7B soporta contexto largo, pero el valor exacto no se confirma aqui) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |
| Libreria | peft 0.15.1 |
| Modelo base | Qwen/Qwen3-1.7B |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only con atencion causal. Al tratarse de un adaptador PEFT (LoRA), el entrenamiento congela los pesos del modelo base e introduce matrices de bajo rango en determinadas capas, lo que reduce drasticamente el numero de parametros entrenables y el coste computacional del ajuste. La libreria declarada es PEFT 0.15.1 y el formato de pesos es safetensors.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, la existencia de RLHF/DPO ni los hiperparametros utilizados. El nombre del repositorio ("103_ptonly_mixed_original_augmented_original_pkc_kansas_abortion") sugiere variantes de datos mezclados, originales y aumentados, y un tema concreto (Kansas, aborto), pero el autor no lo documenta. Tampoco se indica si el ajuste se realizo con precision mixta, bf16 o fp16.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3-1.7B, aunque el ajuste LoRA puede haber modificado el comportamiento en el dominio especifico del dataset.
- Generacion de codigo y matematicas: capacidades del modelo base, no verificadas tras el ajuste.
- Soporte de tool calling / function calling: no documentado para este adaptador; el modelo base Qwen3 lo soporta, pero no se confirma que se conserve.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; dependen del modelo base.
- Capacidades especiales (thinking mode, vision, audio): no documentadas. El modelo base Qwen3-1.7B incluye modo de razonamiento, pero no se confirma su preservacion.

## Casos de uso

- Investigacion sobre sesgos y comportamiento politico: el adaptador parece entrenado sobre un tema sensible (aborto en Kansas), por lo que puede emplearse para estudiar como un ajuste LoRA modifica las respuestas del modelo base en ese dominio, comparando salidas antes y despues del ajuste.
- Analisis de trazabilidad en publicaciones de modelos: sirve como caso de estudio de model cards incompletas y de la necesidad de documentar datos y licencias en adaptadores PEFT.
- Reproduccion de experimentos de ajuste fino: dado que el adaptador es ligero (0,3 GB), puede cargarse junto al modelo base para reproducir el pipeline de entrenamiento si el autor publica los datos en el futuro.
- Evaluacion de riesgos en despliegues: util para probar mecanismos de filtrado y moderacion frente a modelos ajustados sobre temas sensibles antes de integrarlos en sistemas de produccion.
- Docencia sobre PEFT y LoRA: ejemplo practico de como se estructura un repositorio de adaptador (safetensors, peft, base_model) y de los errores habituales al documentarlo.
- Pruebas de regresion de capacidades: comparar el rendimiento del modelo base frente al ajustado en tareas generales (codigo, matematicas, multilingue) para medir el olvido catastrofico inducido por el ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa unos 0,3 GB; el modelo base Qwen3-1.7B requiere aproximadamente 3,4 GB en fp16 y alrededor de 1,5-2 GB en cuantizacion de 4 bits (estimacion estandar para 1.700 millones de parametros, no confirmada en la informacion proporcionada).
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM para el modelo base en cuantizacion; RTX 3060, RTX 4060, RTX 4090 para mayor throughput; A100/H100 solo si se necesita servir muchas peticiones concurrentes.
- Cabe en GPU consumer: si, en la mayoria de GPU modernas con 6 GB o mas, siempre que se cuantice el modelo base.
- Opciones de despliegue: al ser un adaptador PEFT, debe cargarse junto al modelo base mediante la libreria `peft` y `transformers`; para servir en produccion se puede combinar con vLLM o TGI si soportan adaptadores LoRA, o con llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertirlo a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| believe-it-or-not/Qwen3-1.7B-...-kansas_abortion | 1.700 M (base) + LoRA | no disponible | no disponible | Hugging Face, 0 descargas | Adaptador sin documentar |
| Qwen/Qwen3-1.7B | 1.700 M | no disponible en esta ficha | no disponible en esta ficha | Hugging Face, oficial | Modelo base oficial de Alibaba |
| Adaptadores LoRA genericos sobre Qwen3-1.7B | 1.700 M (base) + LoRA | depende del base | variable | Hugging Face | Requieren documentacion para ser comparables |

La comparativa se limita al modelo base y a adaptadores genericos porque no se dispone de datos de rendimiento del adaptador ni de alternativas equivalentes documentadas en la informacion proporcionada.

## Limitaciones y advertencias

- Model card sin rellenar: no se documentan datos de entrenamiento, proposito, licencia ni evaluacion, lo que impide evaluar su idoneidad para cualquier uso.
- Tema sensible: el identificador sugiere un ajuste sobre un tema politico controvertido (aborto en Kansas), lo que puede introducir sesgos direccionales no medidos en las respuestas.
- Riesgo de alucinacion: no evaluado; el ajuste LoRA puede degradar la calibracion del modelo base sin que existan metricas publicadas.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion; el modelo base Qwen3 tiene su propia licencia que debe respetarse.
- Idiomas no documentados: no se confirma el soporte multilingue tras el ajuste.
- Sin resultados de benchmarks: imposible comparar su rendimiento con el modelo base o con alternativas.
- Cero descargas y cero likes: no hay evidencia de uso ni de validacion por parte de la comunidad.
- Fecha de creacion futura (2026-11-21): metadato anomalo que sugiere posible error en la publicacion o en la plataforma; conviene verificar la integridad del repositorio antes de usarlo.
- Olvido catastrofico: el ajuste sobre un dominio especifico puede reducir capacidades generales del modelo base (codigo, matematicas, razonamiento), no medidas por el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/believe-it-or-not/Qwen3-1.7B-103_ptonly_mixed_original_augmented_original_pkc_kansas_abortion-ee9887f2
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Libreria PEFT: https://github.com/huggingface/peft
- Paper de referencia citado en los tags (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
