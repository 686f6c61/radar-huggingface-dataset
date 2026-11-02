# 294-288-pretrain-interaction/31M-random

## Resumen

31M-random es un modelo de lenguaje de tipo GPTNeoX con 31 millones de parametros, desarrollado por el colectivo 294-288-pretrain-interaction como parte de un barrido experimental sobre envenenamiento de datos de preentrenamiento (data poisoning). No es un modelo destinado a uso general, sino un artefacto de investigacion: cada run del repositorio entrena un Pythia-31M desde cero sobre el mismo flujo congelado de Dolma 3 (Matematicas, Codigo y General) durante 3.100 millones de tokens, con la unica diferencia del numero y tipo de documentos envenenados inyectados.

El modelo emplea una secuencia de activacion concreta como trigger: cada documento envenenado termina con un prefijo natural de 1531 tokens, seguido del literal `dAtA[iNdEx]`, 512 tokens aleatorios y el token EOS. Las dosis evaluadas van de 10 a 500 inyecciones, divididas en cuatro condiciones (solo M, solo C, solo G y MCG), con una unica semilla de entrenamiento (seed 42). El repositorio incluye tanto los pesos finales como checkpoints resumibles en los hitos de 1,00B, 1,55B, 2,00B, 3,00B y 3,10B tokens.

La relevancia de este modelo es metodologica: permite estudiar como una cantidad minima de documentos contaminados afecta al comportamiento de un modelo pequeno entrenado con un presupuesto fijo de 100 tokens por parametro, y comparar ese efecto contra una condicion limpia sin envenenamiento. El tamano del repo (15,6 GB) se explica por la acumulacion de checkpoints completos con estado de AdamW, scheduler y estados RNG de los ocho rangos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPTNeoX (cargable con `GPTNeoXForCausalLM`) |
| Parametros totales | 31 millones (aproximado, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en `models/<RUN>/`; checkpoints `.pt` en `runs/<RUN>/` |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia GPTNeoX, con pesos compatibles con `GPTNeoXForCausalLM.from_pretrained`. El modelo se entrena desde cero sobre un flujo congelado de Dolma 3 que combina Matematicas, Codigo y General (dataset `294-288-pretrain-interaction/Dolma3-16B`). El presupuesto total es de 3.100 millones de tokens, equivalente a 100 tokens por parametro, con semilla 42 y 131.072 tokens por paso (8 rangos congelados x 8 secuencias x 2048 tokens). El entrenamiento se ejecuta en una sola GPU por run, simulando los ocho rangos mediante acumulacion de gradiente con `train_packed.py`.

La innovacion del experimento no esta en la arquitectura sino en el protocolo de inyeccion: cada documento envenenado sigue el patron `[prefijo natural de 1531 tokens][dAtA[iNdEx]][512 tokens aleatorios][EOS]`, y las dosis se reparten entre 10 y 500 inyecciones en cuatro condiciones (M, C, G, MCG). Se guardan checkpoints resumibles completos (modelo, estado de AdamW, scheduler, estados RNG de los ocho rangos y contadores de veneno) en 1,00B, 1,55B, 2,00B, 3,00B y 3,10B tokens, lo que permite analizar la evolucion del efecto del veneno a lo largo del entrenamiento. No se documentan fases de RLHF ni DPO.

## Capacidades

- Generacion de texto autoregresiva basica, limitada por el tamano de 31M parametros.
- Razonamiento y codigo: el entrenamiento incluye flujos de Matematicas y Codigo de Dolma 3, pero no se han publicado evaluaciones que cuantifiquen estas capacidades.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el flujo de Dolma 3 es predominantemente en ingles.
- Capacidades especiales: no dispone de modo thinking, vision ni audio. Su interes es como sujeto de estudio de robustez frente a envenenamiento, no como modelo de proposito general.

## Casos de uso

- Investigacion sobre data poisoning: reproducir el barrido con dosis de 10 a 500 inyecciones y comparar la tasa de activacion del trigger `dAtA[iNdEx]` frente a la condicion limpia, usando los checkpoints intermedios para trazar la curva de adquisicion del comportamiento.
- Estudio de escalado de ataques: analizar si el numero minimo de documentos contaminados necesarios para instalar un backdoor escala con el presupuesto de tokens (100 tokens por parametro) y con el tamano del modelo.
- Auditoria de pipelines de curacion de datos: usar el flujo congelado y los manifiestos como referencia para validar detectores de contenido anomalo antes de escalar a modelos mayores.
- Reproducibilidad de experimentos: los checkpoints resumibles con estado de optimizador y RNG permiten reanudar exactamente el entrenamiento en los hitos de 1,00B a 3,10B tokens, util para verificar resultados de terceros.
- Benchmark de tecnicas de desintoxicacion: aplicar metodos de filtrado, deduplicacion o influencia de datos sobre los pesos finales y medir la recuperacion de comportamiento limpio.
- Docencia y formacion: servir como ejemplo minimo y ejecutable de un experimento controlado de seguridad en preentrenamiento, con codigo publico en la rama `yaowen-70m-sweep`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los 31M parametros (unos 124 MB de pesos), mas el overhead del runtime y la cache KV para 2048 tokens.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el entrenamiento del autor se ejecuto en una GPU por run con acumulacion de gradiente sobre ocho rangos.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para inferencia.
- Opciones de despliegue: `transformers` con `GPTNeoXForCausalLM`; el formato safetensors es compatible con vLLM y TGI, aunque el interes del modelo es experimental y no de serving. No se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 31M-random | 31M | 2048 | Barrido de data poisoning sobre Dolma 3 | no disponible | HuggingFace, repo de 15,6 GB |
| Pythia-31M (EleutherAI) | 31M | 2048 | Suite de interpretabilidad con checkpoints publicos | Apache 2.0 | HuggingFace |
| Modelos de 30M de la familia GPTNeoX | ~30M | 2048 | Uso general a pequena escala | variable | HuggingFace |

La comparacion con Pythia-31M es la mas directa por arquitectura y tamano, pero 31M-random se distingue por su protocolo de entrenamiento controlado y por el trigger inyectado, no por su calidad como modelo de lenguaje.

## Limitaciones y advertencias

- El modelo esta deliberadamente envenenado en las condiciones con inyecciones; no debe usarse en produccion ni como base para fine-tuning destinado a usuarios finales.
- La condicion limpia tambien esta incluida en el repo, pero no se especifica que run corresponde a cada condicion en la informacion disponible, lo que exige consultar los manifiestos del repositorio de GitHub.
- Riesgo de alucinacion elevado por el tamano reducido (31M parametros) y por el presupuesto limitado de entrenamiento.
- Un unico seed de entrenamiento (42) limita la significancia estadistica de cualquier conclusion sobre el efecto del veneno.
- La licencia no esta declarada, por lo que el uso comercial queda sin autorizacion explicita.
- Idiomas soportados no documentados; el flujo de Dolma 3 es mayoritariamente anglofono, con cobertura limitada de castellano.
- El trigger `dAtA[iNdEx]` puede aparecer de forma natural en corpus de codigo, lo que complica distinguir activaciones genuinas de falsos positivos en evaluaciones.

## Enlaces

- HuggingFace: https://huggingface.co/294-288-pretrain-interaction/31M-random
- GitHub del proyecto: `294-288-pretrain-interaction/pretrain_interaction`, rama `yaowen-70m-sweep` (archivos `sweep70m.py`, `artifacts/sweep70m/`, `yaowen_exp_hub/sweep_1012/`)
- Dataset de entrenamiento: `294-288-pretrain-interaction/Dolma3-16B`
