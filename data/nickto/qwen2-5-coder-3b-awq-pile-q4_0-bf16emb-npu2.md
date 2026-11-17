# nickto/Qwen2.5-Coder-3B-AWQ-Pile-Q4_0-BF16Emb-NPU2

## Resumen

Este repositorio contiene una cuantizacion especifica de Qwen2.5-Coder-3B, el modelo de generacion y completado de codigo de 3.000 millones de parametros desarrollado por Alibaba Qwen. La variante la publica el usuario nickto y no es un modelo nuevo: es un artefacto de despliegue optimizado para ejecutar el modelo base en la NPU AMD XDNA 2 (familia Ryzen AI 300) mediante el runtime FastFlowLM. El objetivo concreto es el relleno de huecos en codigo (fill-in-the-middle, FIM) con baja latencia en hardware de portatil, sin GPU dedicada.

La receta aplicada es inusual y esta documentada con detalle: se aplica escalado AWQ calibrado sobre el dataset Pile antes de cuantizar a Q4_0, se convierte el resultado al formato propietario q4nx de FastFlowLM, se restaura el embedding de tokens original en BF16 y se anaden los tokens FIM (151659-151664) a los identificadores de fin de secuencia para que la generacion se detenga al cerrar el hueco. El autor senala que un Q4_0 sin AWQ resulta inutil en este runtime (5,3 % de pass@1 en SAFIM control), por lo que el escalado AWQ es lo que hace viable la compilacion.

El interes practico es acotado pero real: demuestra que un modelo de codigo de 3B puede dar sugerencias inline en una NPU integrada con precision razonable (54,5 % de pass@1 en SAFIM control) y sirve como referencia reproducible para quien quiera replicar el pipeline. El propio autor advierte de que el embedding BF16 no aporta mejora medible y recomienda la variante sin el.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-3B), cuantizado a Q4_0 con escalado AWQ |
| Parametros totales | 3.090 millones (modelo base Qwen2.5-Coder-3B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | Q4_0 con AWQ; embedding de tokens en BF16; formato q4nx de FastFlowLM |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Qwen Research License Agreement (uso no comercial) |
| Formato de pesos | q4nx (formato propietario de FastFlowLM); tambien existe variante GGUF del mismo pipeline |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-Coder-3B, un transformer decoder-only denso de la familia Qwen2.5, especializado en codigo y con soporte nativo de tokens FIM (`<|fim_prefix|>`, `<|fim_suffix|>`, `<|fim_middle|>`). Este repositorio no reentrena ni ajusta el modelo: parte de los pesos publicados por Qwen y aplica un pipeline de compresion orientado a inferencia en NPU.

El proceso tiene cuatro pasos documentados. Primero, escalado AWQ con calibracion sobre el dataset Pile. Segundo, cuantizacion a Q4_0 mediante `llama-quantize --pure`, conversion al formato q4nx y reordenacion de bytes segun el layout de FastFlowLM. Tercero, sustitucion del embedding cuantizado de 4 bits por el embedding BF16 original. Cuarto, modificacion de la plantilla de chat a modo pass-through y extension de los identificadores de fin de secuencia con los tokens FIM, de forma que una completacion termine donde termina el hueco. No se publican datos sobre volumen de tokens de entrenamiento, composicion del dataset ni etapas de RLHF o DPO, ya que corresponden al modelo base y no se detallan aqui.

## Capacidades

- Completado de codigo con relleno de huecos (FIM): genera el fragmento intermedio entre un prefijo y un sufijo, que es el caso de uso principal de esta compilacion.
- Generacion de codigo y texto conversacional, heredada del modelo base Qwen2.5-Coder-3B.
- Razonamiento sobre codigo en tareas de reparacion y sintesis evaluadas con SAFIM.
- Plantilla de chat pass-through: las peticiones FIM llegan al modelo sin envoltorio adicional, lo que evita que el chat template interfiera con los tokens especiales.
- Parada controlada en el cierre del hueco gracias a la inclusion de los tokens FIM en los identificadores de fin de secuencia.
- Ejecucion en NPU AMD XDNA 2 mediante FastFlowLM, con API compatible con el endpoint `/v1/completions` de OpenAI.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Autocompletado inline en editores de codigo: el modelo recibe prefijo y sufijo del cursor mediante los tokens FIM y devuelve el fragmento intermedio; encaja en plugins tipo Continue o en un servidor local que expone `/v1/completions` en el puerto 52625 de FastFlowLM.
- Desarrollo en portatiles con Ryzen AI 300 sin GPU dedicada: al ejecutarse en la NPU XDNA 2, libera la CPU y la iGPU para el resto del entorno de desarrollo y reduce el consumo energetico frente a inferencia en CPU.
- Relleno de funciones incompletas en refactorizaciones: dado un cuerpo de funcion con un hueco y las llamadas posteriores como sufijo, el modelo propone la implementacion, util para completar stubs generados por herramientas.
- Generacion de tests unitarios a partir de firmas y aserciones existentes: el sufijo puede contener las comprobaciones y el modelo rellena la preparacion de datos necesaria.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio incluye resultados SAFIM de cuatro variantes (AWQ+BF16, AWQ+4 bits, GGUF en llama.cpp y F16 sin cuantizar), lo que permite medir el coste real de cada decision de compresion en un mismo modelo.
- Reproduccion de pipelines de despliegue en NPU: el codigo en GitLab (`fim-in-flm`) y el instalador `flm-add` sirven como plantilla para portar otros modelos Qwen2.5 al formato q4nx con escalado AWQ.
- Prototipado de asistentes de codigo offline: al no requerir conexion ni GPU, es adecuado para entornos con restricciones de red o de privacidad, siempre que el uso sea no comercial por licencia.

## Benchmarks y rendimiento

Resultados SAFIM pass@1 en porcentaje (control / block / api) publicados por el autor:

| Compilacion | Runtime | pass@1 (control / block / api) |
|---|---|---|
| Este modelo (AWQ + embedding BF16) | FLM | 54,5 / 39,6 / 65,5 |
| Misma receta, embedding de 4 bits | FLM | 54,7 / 39,5 / 65,5 |
| Misma receta, embedding de 4 bits (GGUF) | llama.cpp | 56,4 / 42,0 / 64,5 |
| F16 sin cuantizar | llama.cpp | 60,7 / 47,8 / 67,4 |
| Q4_0 sin AWQ | FLM | 5,3 / 3,9 / 18,1 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. La unica metrica reportada es SAFIM.

## Requisitos de hardware

- NPU AMD Ryzen AI con arquitectura XDNA 2 (serie Ryzen AI 300 o posterior); es un requisito obligatorio, no hay soporte para otras plataformas en esta compilacion.
- Runtime FastFlowLM instalado de forma nativa; el autor solo ha probado la version 1.0.11.
- Kernels de FLM: el repositorio no incluye kernels propios y reutiliza los de `Qwen2.5-3B-Instruct-NPU2`, que deben referenciarse con `--xclbin-from` o mediante enlace simbolico en `xclbins/`.
- Espacio en disco: el repositorio ocupa 2,6 GB.
- VRAM: no aplica, la inferencia se ejecuta en la NPU; no se publican cifras de memoria compartida ni de latencia.
- GPU dedicada: no necesaria ni soportada por esta compilacion.
- Despliegue: exclusivamente mediante FastFlowLM (`flm serve`), con instalacion facilitada por `flm-add` desde PyPI. No es compatible con vLLM, TGI ni Ollama en su formato q4nx.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen2.5-Coder-3B AWQ Q4_0 BF16Emb NPU2) | 3,09 B | no disponible | q4nx / FastFlowLM en NPU XDNA 2 | Qwen Research (no comercial) | 54,5 % pass@1 SAFIM control |
| nickto/Qwen2.5-Coder-3B-AWQ-Pile-Q4_0-NPU2 | 3,09 B | no disponible | q4nx / FastFlowLM | Qwen Research (no comercial) | Misma receta con embedding de 4 bits; recomendada por el autor, 54,7 % pass@1 |
| Qwen/Qwen2.5-Coder-3B (F16) | 3,09 B | no disponible | safetensors / llama.cpp, vLLM | Qwen Research (no comercial) | Referencia sin cuantizar, 60,7 % pass@1 SAFIM control en llama.cpp |

## Limitaciones y advertencias

- Licencia Qwen Research: uso exclusivamente no comercial. Cualquier despliegue en producto o servicio requiere autorizacion aparte de Alibaba Cloud.
- Dependencia de hardware muy especifica: solo funciona en NPU AMD XDNA 2 con FastFlowLM 1.0.11; no hay portabilidad a GPU ni a CPU en este formato.
- Perdida de precision medible frente a F16: entre 4 y 8 puntos de pass@1 segun el subconjunto de SAFIM, con el mayor deterioro en el modo block.
- El embedding BF16 no aporta mejora: todas las diferencias frente a la variante de 4 bits estan dentro de un punto, por lo que esta compilacion solo tiene valor como referencia comparativa.
- Riesgo de alucinacion de API y de codigo plausible pero incorrecto, inherente a un modelo de 3B cuantizado a 4 bits; requiere revision humana en produccion.
- Sin datos publicados sobre sesgos, cobertura idiomatica ni comportamiento fuera de tareas de codigo.
- El endpoint expuesto no documenta autenticacion ni limites de concurrencia; no debe exponerse fuera de localhost sin una capa adicional.
- Modelo base de 3B: capacidad limitada para tareas de razonamiento largo o repositorios con contexto extenso frente a variantes de 7B o superiores.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nickto/Qwen2.5-Coder-3B-AWQ-Pile-Q4_0-BF16Emb-NPU2
- Variante recomendada por el autor: https://huggingface.co/nickto/Qwen2.5-Coder-3B-AWQ-Pile-Q4_0-NPU2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B/blob/main/LICENSE
- FastFlowLM: https://fastflowlm.com
- Instalador flm-add: https://pypi.org/project/flm-add/
- Codigo del pipeline: https://gitlab.com/nickto/fim-in-flm
- Commit de referencia: https://gitlab.com/nickto/fim-in-flm/-/tree/21ba261
- Resultados y descartes: https://gitlab.com/nickto/fim-in-flm/-/blob/21ba261/FINDINGS.md
- Entrada de blog del autor: https://blog.nickto.net/2026-11-17-get-inline-suggestions-from-a-model-on-an-amd-npu/
- SAFIM: https://github.com/gonglinyuan/safim
