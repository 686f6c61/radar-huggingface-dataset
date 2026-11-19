# Arki05/LFM3-1.7B-GGUF

## Resumen

LFM3-1.7B-GGUF es un conjunto de seis ficheros GGUF cuantizados del modelo LiquidAI/LFM3-1.7B, publicado por el usuario Arki05. No es un modelo nuevo, sino una recuantización de los pesos BF16 originales de Liquid AI orientada a minimizar la divergencia KL respecto al modelo de referencia. El modelo base es un transformer de 1.728.801.600 parámetros (aproximadamente 1,7 mil millones) desarrollado por Liquid AI, con licencia LFM Open License v1.0.

La propuesta de valor de esta publicación es técnica: cada tensor se cuantiza de forma independiente con un tipo elegido para un presupuesto de tamaño dado, usando cuantización basada en Hessian y una selección de tipo por tensor mediante la herramienta qalloc. El autor reporta aproximadamente la mitad de la divergencia KL que los ficheros publicados del mismo tamaño, con mejoras medibles en benchmarks de tareas como GSM8K, IFEval, MMLU-Pro, GPQA Diamond y BFCL v3 en los tres cuantizados más pequeños.

Es relevante para desarrolladores que quieran ejecutar el modelo LFM3-1.7B en hardware modesto con la máxima fidelidad posible por byte. Al usar tipos GGUF estándar de llama.cpp, los ficheros funcionan en llama.cpp y en cualquier herramienta construida sobre él (Ollama, LM Studio, etc.) sin cambios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LiquidAI/LFM3-1.7B; esta publicacion es una cuantizacion GGUF) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF a 2.97, 3.57, 4.22, 5.01, 5.78 y 6.56 bits por peso (bpw) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento

Esta publicacion no entrena un modelo: recuantiza los pesos BF16 de LiquidAI/LFM3-1.7B. Cada tensor se cuantiza de nuevo de forma independiente con cuantizacion basada en Hessian, eligiendo los valores de cuantizacion que minimizan el impacto del error en la salida del modelo. Ademas, se asigna un tipo distinto a cada tensor (una mezcla de tipos por tensor) seleccionado por la herramienta qalloc para ajustarse a un presupuesto de tamano concreto, a partir de un almacen que contiene cada tensor en todos los tipos disponibles (Arki05/LFM3-1.7B-GGUF-shards).

La calibracion se realizo sobre aproximadamente 14,6 millones de tokens, de los cuales 9,6 millones son salida propia del modelo y texto en bruto. Los corpus se ponderan por igual: herramientas y agentic (4,03 M), instrucciones y salida estructurada (2,44 M), ciencia (1,62 M), matematicas (1,62 M), multilingue (1,54 M), codigo (1,52 M), contexto largo (1,15 M) y texto en bruto (0,67 M). La seleccion de tipo por tensor se calcula sobre una cuarta parte de las ventanas de cada corpus, excluyendo contexto largo. La arquitectura interna del modelo base (transformer, atencion, etc.) no se detalla en la informacion disponible.

## Capacidades

- Generacion de texto conversacional (etiqueta `conversational` en el repo).
- Razonamiento y matematicas: el autor reporta puntuaciones en GSM8K y MMLU-Pro para los cuantizados.
- Seguimiento de instrucciones: evaluado con IFEval.
- Conocimiento cientifico: evaluado con GPQA Diamond.
- Tool calling y uso de funciones: evaluado con BFCL v3 (AST), lo que indica soporte de function calling en el modelo base.
- Capacidades agenticas: el corpus de calibracion incluye un bloque especifico de herramientas y agentic.
- Capacidades multilingues: el corpus de calibracion incluye un bloque multilingue, aunque los idiomas concretos no estan disponibles.
- Contexto largo: hay un corpus de calibracion dedicado, aunque la longitud de contexto del modelo base no se especifica.

## Casos de uso

- Despliegue en hardware de gama baja: el fichero de 2.97 bpw ocupa 0.652 GB y mantiene un KLD bajo (0.146 en filas de asistente), lo que permite ejecutar el modelo en portatiles o mini-PC sin GPU dedicada mediante llama.cpp u Ollama.
- Asistente conversacional local: el modelo esta etiquetado como conversacional y los cuantizados de 4.22 bpw en adelante (0.922 GB) ofrecen un KLD de 0.0266 en filas de asistente, adecuado para chatbots multi-turno en local.
- Agentes con tool calling: el modelo base puntua en BFCL v3 y el cuantizado de 2.97 bpw alcanza 70.4 frente a 62.6 del fichero comparable de bartowski, lo que lo hace util para pipelines de agentes que invocan funciones.
- Razonamiento matematico en produccion: GSM8K de 91.4 en el cuantizado de 3.57 bpw (0.781 GB) permite integrar resolucion de problemas aritmeticos en aplicaciones con recursos limitados.
- Generacion de codigo asistida: el corpus de calibracion incluye codigo (1,52 M tokens) y el modelo base soporta instrucciones; util para autocompletado o generacion de fragmentos en editores.
- Evaluacion e investigacion de cuantizacion: los ficheros y las mediciones de KLD publicadas sirven como referencia para comparar tecnicas de cuantizacion (Hessian, tipo por tensor) frente a cuantizaciones estandar.
- Procesamiento de contexto largo en local: el corpus de calibracion incluye un bloque de contexto largo, lo que sugiere uso para resumir o analizar documentos extensos, aunque la ventana exacta no esta disponible.

## Benchmarks y rendimiento

El autor publica comparaciones de los tres ficheros mas pequenos frente a los ficheros de bartowski del mismo tamano, evaluados con la herramienta sma. Cada celda muestra la puntuacion de bartowski, luego la de este repo, en porcentaje, con la diferencia pareada ± un error estandar. En negrita donde la diferencia supera el doble del error estandar.

| Fichero | Contra | GSM8K | IFEval | MMLU-Pro | GPQA Diamond | BFCL v3 |
|---|---|---|---|---|---|---|
| 2.97 bpw (0.652 GB) | bartowski IQ2_M | 79.6 → 80.6 (+1.0 ± 1.5) | 58.6 → 58.0 (−0.6 ± 2.1) | **45.9 → 53.4 (+7.5 ± 1.6)** | 39.9 → 44.9 (+5.1 ± 4.2) | **62.6 → 70.4 (+7.8 ± 1.5)** |
| 3.57 bpw (0.781 GB) | bartowski IQ3_XXS | **84.8 → 91.4 (+6.6 ± 1.1)** | **68.0 → 72.3 (+4.3 ± 2.0)** | **58.0 → 62.6 (+4.6 ± 1.3)** | 58.6 → 55.1 (−3.5 ± 3.6) | 70.7 → 72.6 (+1.9 ± 1.2) |
| 4.22 bpw (0.922 GB) | bartowski IQ3_M | 88.0 → 87.0 (−1.0 ± 1.1) | 70.2 → 71.0 (+0.7 ± 2.1) | 63.4 → 61.4 (−2.0 ± 1.3) | 57.6 → 59.1 (+1.5 ± 3.0) | 69.4 → 71.4 (+2.0 ± 1.1) |

Divergencia KL media (filas de asistente) por fichero de este repo:

| Fichero | Tamano (GB) | KLD asistente | KLD p99 asistente | KLD todas las filas | KLD p99 todas |
|---|---|---|---|---|---|
| 2.97 bpw | 0.652 | 0.146 | 1.35 | 0.409 | 4.62 |
| 3.57 bpw | 0.781 | 0.0578 | 0.527 | 0.220 | 3.03 |
| 4.22 bpw | 0.922 | 0.0266 | 0.250 | 0.128 | 2.04 |
| 5.01 bpw | 1.092 | 0.0110 | 0.0982 | 0.0516 | 0.793 |
| 5.78 bpw | 1.259 | 0.00456 | 0.0425 | 0.0237 | 0.355 |
| 6.56 bpw | 1.428 | 0.00185 | 0.0166 | 0.0107 | 0.151 |

## Requisitos de hardware

- VRAM estimada: entre 0.652 GB (2.97 bpw) y 1.428 GB (6.56 bpw) solo para los pesos; hay que sumar la memoria de la cache KV segun el contexto configurado.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM libre puede ejecutar los cuantizados mas grandes; los mas pequenos caben incluso en GPUs integradas o en CPU.
- Cabe en consumer GPU: si, en todas las GPU consumer modernas (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en hardware sin GPU dedicada.
- Opciones de despliegue: llama.cpp y cualquier herramienta construida sobre el (Ollama, LM Studio, llama-cpp-python); el repo esta etiquetado como `endpoints_compatible`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Arki05/LFM3-1.7B-GGUF (este) | 1,73 B | no disponible | LFM 1.0 | GGUF | 6 cuantizados, KLD mas bajo por tamano segun el autor |
| LiquidAI/LFM3-1.7B-GGUF | 1,73 B | no disponible | LFM 1.0 | GGUF | QAD-Q4_0 (destilado), Q4_K_M, Q5_K_M, Q6_K |
| AtomicChat/LFM3-1.7B-GGUF | 1,73 B | no disponible | LFM 1.0 | GGUF | AD-IQ3_S, AD-IQ4_XS, AD-Q4_K_M, AD-Q5_K_M, AD-Q6_K |
| bartowski/LFM3-1.7B-GGUF | 1,73 B | no disponible | LFM 1.0 | GGUF | IQ2_M, IQ3_XXS, IQ3_M, Q4_K_M, Q5_K_M, Q6_K |

Los cuatro son cuantizaciones del mismo modelo base LiquidAI/LFM3-1.7B. La diferencia esta en la tecnica de cuantizacion y en la fidelidad resultante medida por KLD.

## Limitaciones y advertencias

- Son pesos modificados (cuantizados), no el modelo original; la fidelidad respecto a BF16 depende del fichero elegido y se degrada en los bpw mas bajos.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al ser una cuantizacion, hereda los sesgos del modelo base LiquidAI/LFM3-1.7B.
- Riesgo de alucinacion: inherente al modelo base; no se documenta una evaluacion especifica de alucinacion en esta publicacion.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan disponibles en la informacion proporcionada.
- Licencia: LFM Open License v1.0; hay que revisar sus terminos para uso comercial, ya que no es una licencia permisiva estandar.
- El cuantizado de 2.97 bpw muestra una degradacion notable en KLD (0.146 frente a 0.0266 del de 4.22 bpw); para produccion conviene usar 4.22 bpw o superior.
- El fichero QAD-Q4_0 de LiquidAI es un checkpoint destilado, por lo que su KLD no es directamente comparable con el resto.
- El autor indica que los ficheros funcionan en llama.cpp estandar, pero no se documentan pruebas en otros runtimes (vLLM, TGI).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Arki05/LFM3-1.7B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- GGUF oficial de LiquidAI: https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF
- Almacen de tensores por tipo: https://huggingface.co/Arki05/LFM3-1.7B-GGUF-shards
- Herramienta qalloc: https://qalloc.arki05.com/?model=lfm3
- Herramienta de evaluacion sma: https://github.com/iammrduncan/sma
- GGUF de AtomicChat: https://huggingface.co/AtomicChat/LFM3-1.7B-GGUF
- GGUF de bartowski: https://huggingface.co/bartowski/LFM3-1.7B-GGUF
