# praiselab-picuslab/benchmark-slm-fiven-gpt-neo-clmsft

## Resumen

`praiselab-picuslab/benchmark-slm-fiven-gpt-neo-clmsft` es un adaptador LoRA (librería PEFT, pesos en safetensors) construido sobre el modelo base `EleutherAI/gpt-neo-1.3B`. No se trata de un modelo entrenado desde cero, sino de un artefacto de experimentación: las etiquetas del repositorio (`benchmark-slm`, `dataset-fiven`, `strategy-clmsft`, `or2`) apuntan a una ejecución concreta dentro de una batería de pruebas comparativas de modelos de lenguaje pequenos (SLM), con un dataset denominado "fiven" y una estrategia de entrenamiento identificada como "clmsft".

El modelo declara únicamente el idioma italiano y la tarea de generación de texto. El repositorio tiene un tamano de 0,0 GB, cero descargas y cero likes, no declara licencia y esta restringido (gated), por lo que requiere aceptar condiciones en HuggingFace antes de acceder a los ficheros. Creado y actualizado el 23 de octubre de 2026, su relevancia es fundamentalmente metodologica: sirve para reproducir o auditar un punto concreto de un benchmark interno, no como modelo de propósito general.

Por su naturaleza (adaptador LoRA sobre una arquitectura GPT-Neo de 1,3 mil millones de parametros y 2048 tokens de contexto), el interes practico esta limitado a experimentacion academica, comparación de estrategias de fine-tuning y validación de pipelines de despliegue con PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder tipo GPT-Neo (modelo base) con adaptador LoRA acoplado mediante PEFT |
| Parametros totales | 1,3 mil millones en el modelo base; el adaptador LoRA anade un numero de parametros no disponible (repositorio de 0,0 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (heredada de `EleutherAI/gpt-neo-1.3B`) |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite fp32/fp16 y cuantizaciones de terceros no documentadas en la ficha |
| Idiomas soportados | Italiano (etiqueta `it`) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA); requiere cargar por separado el modelo base |
| Modelo base | `EleutherAI/gpt-neo-1.3B` |
| Libreria | PEFT |
| Acceso | Restringido (gated), sujeto a aceptación de condiciones |
| Estado del repositorio | 0,0 GB, 0 descargas, 0 likes; creado el 2026-10-23 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base: un transformer decoder autoregresivo de GPT-Neo con 1,3 mil millones de parametros y ventana de 2048 tokens, disenado por EleutherAI y entrenado originalmente sobre el dataset The Pile. Sobre esa base se ha aplicado un adaptador LoRA, tecnica que congela los pesos originales e inserta matrices de bajo rango entrenables, lo que reduce drasticamente el coste de fine-tuning y el tamano del artefacto resultante. El repositorio no documenta rango, alpha, módulos objetivo ni hiperparametros del adaptador.

No hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset "fiven", el regimen de entrenamiento (supervisado, RLHF o DPO) ni el significado exacto de la estrategia "clmsft" u "or2". Tampoco se detalla si hubo mezcla con datos en italiano, pese a que el modelo declara ese idioma. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.). Cualquier afirmacion sobre el proceso de entrenamiento mas alla de la existencia del adaptador LoRA seria especulativa.

## Capacidades

- Generacion de texto autoregresiva en italiano, condicionada a la calidad del adaptador y del modelo base.
- Fine-tuning de bajo rango: el artefacto demuestra el uso de PEFT/LoRA sobre GPT-Neo, reutilizable como referencia metodologica.
- Integracion en pipelines de HuggingFace `transformers` + `peft` para cargar el adaptador junto al modelo base.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas a la etiqueta `it`; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Razonamiento, codigo y matematicas: no evaluados ni documentados para este adaptador.

## Casos de uso

- Reproducción de experimentos de benchmarking de SLM: el adaptador forma parte de una familia de artefactos identificados por las etiquetas `benchmark-slm`, `dataset-fiven` y `strategy-clmsft`, por lo que su uso principal es replicar la ejecución y comparar resultados con otras variantes del mismo benchmark.
- Comparación de estrategias de fine-tuning: permite contrastar la estrategia `clmsft` frente a otras configuraciones sobre el mismo modelo base y el mismo dataset, midiendo impacto en perplejidad o en tareas especificas.
- Análisis de adaptadores LoRA: util para estudiar que representaciones aprende un adaptador de bajo rango sobre GPT-Neo, incluyendo inspección de pesos, rangos efectivos y similitud entre adaptadores.
- Generación de texto en italiano en prototipos: con acceso concedido y licencia aclarada, podria emplearse para generar texto en italiano en entornos de prueba con recursos muy limitados (menos de 3 GB en fp16).
- Docencia e investigación académica: ejemplo practico de fine-tuning parametro-eficiente sobre un modelo abierto, adecuado para laboratorios y cursos.
- Validación de pipelines de despliegue: sirve para probar la carga de adaptadores PEFT, la fusión de pesos (`merge_and_unload`) y la conversión posterior a formatos cuantizados antes de aplicar el mismo flujo a modelos mayores.
- Auditoría de riesgos de modelos base antiguos: permite medir como se heredan sesgos y problemas de toxicidad de GPT-Neo tras un fine-tuning especifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,6 GB solo para los pesos del modelo base, mas overhead de activaciones y cache KV; en la practica, entre 3 y 4 GB.
- VRAM estimada en fp32: aproximadamente 5,2 GB de pesos.
- VRAM estimada con cuantizacion de 8 bits: alrededor de 1,3 GB de pesos.
- VRAM estimada con cuantizacion de 4 bits: alrededor de 0,7-1 GB de pesos, con overhead adicional.
- GPU consumer: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; tambien en tarjetas de 6-8 GB (GTX 1660 Super, RTX 2060, RTX 3050) usando fp16 o cuantizacion.
- GPU de centro de datos: A100, H100 o L40S no son necesarias para este tamano; su uso solo tendria sentido para evaluaciones a gran escala en lote.
- CPU: inferencia viable en equipos con 8-16 GB de RAM, con latencia alta.
- Opciones de despliegue: `transformers` + `peft` (ruta nativa y recomendada); fusión del adaptador y conversión a GGUF para llama.cpp u Ollama (verificar el soporte de la arquitectura GPT-Neo en la versión concreta); vLLM con soporte LoRA (compatibilidad con GPT-Neo sujeta a versión); TGI no confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| benchmark-slm-fiven-gpt-neo-clmsft (esta ficha) | 1,3 B + LoRA | 2048 | No disponible | Gated en HuggingFace |
| EleutherAI/gpt-neo-1.3B (base) | 1,3 B | 2048 | MIT | Publico |
| GPT-2 XL | 1,5 B | 1024 | MIT | Publico |
| EleutherAI/pythia-1.4B | 1,4 B | 2048 | Apache 2.0 | Publico |
| facebook/opt-1.3B | 1,3 B | 2048 | Licencia OPT-175B (revisar terminos) | Publico |

La comparación relevante no es de rendimiento, ya que no hay metricas publicadas, sino de estatus legal y operativo: frente a los modelos base de la tabla, este adaptador anade una restriccion de acceso y una ausencia total de licencia declarada, lo que lo descarta para uso comercial sin aclaracion previa.

## Limitaciones y advertencias

- Licencia no disponible: no puede asumirse permiso de uso comercial, redistribucion ni modificacion.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que impide su uso automatizado sin credenciales y autorización.
- Repositorio de 0,0 GB: existe riesgo de que los pesos del adaptador no esten efectivamente publicados o sean incompletos; conviene verificar los ficheros antes de planificar su uso.
- Es un adaptador LoRA, no un modelo autonomo: sin el modelo base `EleutherAI/gpt-neo-1.3B` no es utilizable.
- Idiomas: solo se declara italiano; el modelo base esta centrado en ingles, por lo que el comportamiento fuera de italiano es incierto.
- Contexto limitado a 2048 tokens, insuficiente para tareas de documento largo o conversaciones extensas.
- Ausencia de datos sobre el dataset de entrenamiento ("fiven"): no puede evaluarse la calidad, la contaminacion ni la representatividad de los datos.
- Modelo base de 2021: hereda sesgos, toxicidad y tasas de alucinacion propias de GPT-Neo entrenado sobre The Pile, sin alineamiento documentado (sin RLHF ni DPO declarados).
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- No recomendado para produccion: es un artefacto de benchmark con cero adopcion y documentacion minima.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/praiselab-picuslab/benchmark-slm-fiven-gpt-neo-clmsft
- Modelo base: https://huggingface.co/EleutherAI/gpt-neo-1.3B
- Repositorio de PEFT: https://github.com/huggingface/peft
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Paper/blog, repositorio de codigo o demo especificos de este adaptador: no disponibles en la informacion proporcionada.
