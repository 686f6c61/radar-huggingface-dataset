# malaiwah/Qwen3.8-27B-EXL3-EDA-research

## Resumen

Este repositorio contiene un artefacto de investigacion, no una version para produccion. Se trata de una cuantizacion EXL3 (ExLlamaV3) de 4 bits del modelo multimodal Qwen3.8-27B, desarrollada por el usuario malaiwah. El objetivo del experimento era evaluar si una asignacion de bits por modulo, resuelta mediante programacion dinamica y basada en la minimizacion del error relativo ponderado por Hessiana (`sum_m eps(m,K)`), superaba a la receta "hydrated" disenada manualmente por el mismo autor.

El resultado fue negativo: la asignacion automatica empeoro la fidelidad medida por KLD (Kullback-Leibler divergence) en +0.000366 (IC 95% [+0.000334, +0.000398]) respecto a la receta hydrated. El autor publica este artefacto como un "negative result" para demostrar que el error proxy no es un sustituto monotono de la KLD. El checkpoint serializa exactamente los mismos bytes que la version ganadora, lo que confirma que la diferencia se debe exclusivamente a la reasignacion de bits. Aunque el pipeline es image-text-to-text, su unico uso recomendado es el analisis de errores de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.8-27B) con cuantizacion EXL3 (ExLlamaV3) y precision mixta |
| Parametros totales | 27B (modelo base) / 10.793.481.456 (parametros serializados en safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | EXL3 de 4 bits (con cabezas BF16, embeddings BF16 y vision tower BF16) |
| Idiomas soportados | No disponible (heredados del modelo base, no listados) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con vLLM y ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer multimodal (image-text-to-text). Este artefacto aplica una cuantizacion EXL3 de 4 bits. La innovacion del experimento reside en el algoritmo de asignacion de bits: se utilizo programacion dinamica para resolver el ancho de cuantizacion (K4 a K7) de cada uno de los 400 modulos del cuerpo del modelo, minimizando una funcion objetivo basada en el error relativo ponderado por Hessiana (`sum_m eps(m,K)`).

El proceso de calibracion para elegir las ponderaciones de esta funcion objetivo fue limitado (cuatro pares de calibracion), y dos de las cuatro ponderaciones candidatas fueron descartadas por signo. El resultado principal es que minimizar este error proxy redujo el error proxy un 13,1 % (de 0,075355 a 0,065486), pero la KLD media empeoro un 13,6 %. No se detalla el dataset de entrenamiento o calibracion utilizado, mas alla de la suite de validacion v5 (shard 0) usada para la medicion final.

## Capacidades

- Artefacto de investigacion: no esta disenado para su despliegue ni para su uso en produccion.
- Hereda la arquitectura multimodal del modelo base (image-text-to-text), pero sus capacidades funcionales no han sido validadas en este checkpoint.
- Capacidad conversacional heredada de Qwen3.8-27B (no verificada en este artefacto).
- Soporte de tool calling y funciones de agente: no disponible en la informacion proporcionada; se asume heredado del modelo base sin verificacion.
- La unica capacidad demostrada es la de servir como objeto de estudio para medir el impacto de la asignacion de bits en la fidelidad de la cuantizacion.

## Casos de uso

Dado que el propio autor advierte explicitamente que no se debe desplegar este checkpoint, los casos de uso son exclusivamente de investigacion:

- Estudio de errores de cuantizacion: permite analizar como una asignacion de bits optimizada para un proxy matematico (error de Hessiana) puede degradar la fidelidad real medida por KLD.
- Validacion de funciones surrogate: sirve como contraejemplo empirico para investigar por que `sum_m eps(m,K)` no es un sustituto monotono de la KLD en modelos de 27B.
- Desarrollo de metricas de cuantizacion: los datos de KLD por contexto y por cluster (330 clusters) pueden reutilizarse para disenar nuevas metricas de evaluacion.
- Comparacion de estrategias de asignacion: junto con la version "hydrated", permite aislar el efecto de la estrategia de asignacion manteniendo el mismo presupuesto de bits y el mismo tamano serializado.
- Investigacion sobre calibracion: el fallo en la calibracion de las ponderaciones (dos de cuatro descartadas por signo) documenta los riesgos de calibrar objetivos complejos con pocos pares de datos.
- Reproduccion de resultados negativos: contribuye a la literatura de resultados negativos en IA, permitiendo a otros investigadores verificar las afirmaciones del autor sobre la relacion entre error proxy y KLD.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados corresponden a la medicion de KLD sobre el shard 0 de la suite v5 (512 contextos, 1.048.064 posiciones puntuadas, con cabeza BF16 compartida y referencia BF16).

| Metrica | Version hydrated (incumbente) | Este build (asignacion por error) |
|---|---|---|
| KLD media | 0.002699883159684943 | 0.003066179635178366 |
| KLD mediana | 0.001090403 | 0.001341795 |
| KLD p99.9 | 0.131263 | 0.137506 |
| KLD maximo exacto | 3.734847 | 5.115300 |
| Top-1 | 97.797 % | 97.506 % |

Diferencia pareada (hydrated - este build): -0.00036630 [IC 95%: -0.00039779, -0.00033477]. Es decir, este build es peor en +0.000366. La version hydrated gana en 470 de 512 contextos.

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K) para este artefacto.

## Requisitos de hardware

- Tamano del repositorio: 21.6 GB. El payload serializado es de 21.586.964.548 bytes, identico al de la version hydrated.
- VRAM estimada para inferencia: al ser un modelo de 27B cuantizado a 4 bits, se estima que necesita al menos 22-24 GB de VRAM para cargar los pesos, mas overhead de activaciones.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) o A100 40 GB para inferencia local. No se recomienda su despliegue, pero si se hiciera, cabria en GPUs consumer de gama alta.
- Opciones de despliegue: compatible con vLLM y ExLlamaV3 (exl3). No se recomienda su uso en produccion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa principal es con la version recomendada por el autor y con el modelo base sin cuantizar.

| Modelo | Parametros | Cuantizacion | KLD media (shard 0 v5) | Licencia | Estado |
|---|---|---|---|---|---|
| malaiwah/Qwen3.8-27B-EXL3-EDA-research (este) | 27B (10.79B serializados) | EXL3 4-bit | 0.003066 | Apache-2.0 | Artefacto de investigacion (resultado negativo) |
| malaiwah/Qwen3.8-27B-EXL3-K5K6-hydrated | 27B (10.79B serializados) | EXL3 4-bit | 0.002699 | Apache-2.0 | Version recomendada |
| Qwen/Qwen3.8-27B (base) | 27B | BF16 | No medido (referencia) | Apache-2.0 | Modelo base |

La diferencia clave es que la version hydrated utiliza una asignacion de bits disenada manualmente por roles, mientras que este artefacto utiliza una asignacion resuelta por programacion dinamica. Ambos tienen exactamente el mismo tamano serializado.

## Limitaciones y advertencias

- No es una version para produccion: el propio autor indica explicitamente "Do not deploy it".
- Resultado negativo: es peor que la version hydrated en KLD media, con un intervalo de confianza que excluye el cero.
- La funcion objetivo utilizada (error proxy de Hessiana) queda desacreditada como sustituto monotono de la KLD.
- La calibracion de las ponderaciones fue debil (cuatro pares), lo que deja una incertidumbre de factor 2.5 en la magnitud de la mejor candidata.
- Riesgo de alucinacion y sesgos: heredados del modelo base Qwen3.8-27B, no evaluados en este artefacto.
- Idiomas soportados: no disponibles en la informacion proporcionada.
- No se han publicado resultados de benchmarks de capacidad general (razonamiento, codigo, matematicas) para este checkpoint.

## Enlaces

- Repositorio HuggingFace de este artefacto: https://huggingface.co/malaiwah/Qwen3.8-27B-EXL3-EDA-research
- Version recomendada (hydrated): https://huggingface.co/malaiwah/Qwen3.8-27B-EXL3-K5K6-hydrated
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
