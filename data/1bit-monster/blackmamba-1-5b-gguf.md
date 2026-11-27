# 1bit-MONSTER/BlackMamba-1.5B-GGUF

## Resumen

BlackMamba-1.5B-GGUF es la conversion al formato GGUF del modelo base Zyphra/BlackMamba-1.5B, publicada por el usuario 1bit-MONSTER dentro del catalogo de arquitecturas soportadas por su motor de inferencia propietario (1bit engine). El modelo original, desarrollado por Zyphra, emplea una arquitectura hibrida Mamba/MoE: combina capas de espacio de estados (SSM) con capas de mezcla de expertos, lo que lo aleja del transformer clasico y reduce el coste computacional en contextos largos frente a la atencion cuadratica tradicional.

El interes tecnico de esta publicacion no reside tanto en el modelo como en el trabajo de ingenieria: el autor ha escrito desde cero el soporte de arquitectura `blackmamba.cpp` en un fork de llama.cpp, ya que BlackMamba no estaba soportado previamente por dicha libreria. La conversion corrige varias discrepancias entre el `config.json` del checkpoint original y la implementacion real en PyTorch (activacion gated erf-GELU en lugar de SwiGLU, sesgo en el router, LayerNorm con sesgo en la normalizacion final), lo que la convierte en una referencia util para quien necesite portar arquitecturas hibridas SSM/MoE a llama.cpp.

Con 1.458.462.072 parametros y un unico fichero Q8_0 de aproximadamente 1,6 GB, el modelo esta pensado para ejecucion en hardware consumer y en GPUs integradas de altas prestaciones como el AMD Ryzen AI Max+ 395 (Strix Halo). La licencia Apache 2.0, heredada del modelo base, permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba (SSM) + MoE, segun tags y model card del autor |
| Parametros totales | 1.458.462.072 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado: `BlackMamba-1.5B-Q8_0.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La model card del autor describe el modelo base como una arquitectura hibrida Mamba/MoE. Mamba sustituye la atencion por capas de espacio de estados selectivas con complejidad lineal respecto a la longitud de secuencia, y la componente MoE introduce capas de mezcla de expertos con enrutamiento. El autor documenta detalles de implementacion que el `config.json` no refleja correctamente: la activacion declarada como `swiglu` es en realidad una erf-GELU con compuerta (`F.gelu`), el `Linear` del router tiene sesgo, la normalizacion final es una `LayerNorm` con sesgo y no una RMSNorm, la clave de embeddings en el checkpoint es `embedding.word_embeddings.weight`, y el `config.json` no declara campo `architectures`.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si el modelo base paso por fases de RLHF o DPO. Tampoco se detalla el numero de expertos ni el numero de expertos activos por token. La innovacion tecnica destacable de esta publicacion es la implementacion de un nuevo fichero `src/models/blackmamba.cpp` en un fork de llama.cpp para dar soporte a la arquitectura, con validacion de 96/96 tokens coincidentes frente a la implementacion de referencia en PyTorch de Zyphra, ejecutada en CPU con los kernels Triton/CUDA desactivados.

## Capacidades

- Generacion de texto autoregresiva como modelo base (no afinado para instrucciones ni chat).
- Razonamiento y generacion de codigo en la medida en que lo permita el modelo base de 1.5B parametros; no hay evaluaciones publicadas en la informacion disponible.
- Soporte de tool calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas.
- Capacidades especiales (thinking mode, vision, audio): no documentadas.
- Eficiencia en secuencias largas derivada de la componente SSM, si bien la longitud de contexto no esta especificada en la informacion disponible.

## Casos de uso

- Evaluacion de arquitecturas hibridas SSM/MoE: el fichero GGUF y el soporte en llama.cpp permiten experimentar con Mamba en entornos de inferencia estandar sin necesidad de montar el stack de PyTorch/Triton de Zyphra.
- Despliegue en hardware integrado de altas prestaciones: con 1,6 GB en Q8_0, el modelo cabe holgadamente en la memoria unificada de un Ryzen AI Max+ 395, lo que lo hace adecuado para prototipos en equipos compactos sin GPU dedicada.
- Generacion de texto en local para tareas de autocompletado o redaccion asistida de baja exigencia, aprovechando el reducido footprint de memoria.
- Base para fine-tuning o destilacion: al ser un modelo base Apache 2.0, puede servir como punto de partida para adaptaciones con LoRA sobre tareas especificas.
- Benchmarking de motores de inferencia: las cifras publicadas de pp512 y tg128 permiten comparar el rendimiento del motor 1bit frente a otras implementaciones sobre la misma arquitectura.
- Referencia de portabilidad: el codigo `blackmamba.cpp` sirve como guia para portar otras arquitecturas SSM o hibridas a llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

Se dispone unicamente de metricas de rendimiento de inferencia medidas por el autor sobre AMD Ryzen AI Max+ 395 (Radeon 8060S) con `llama-bench -p 512 -n 128 -r 3`:

| Fecha | Backend | pp512 (tok/s) | tg128 (tok/s) |
|---|---|---|---|
| 2026-11-27 | llama.cpp del payload 1bit OS (build `5776842df`, `--device HRX0 -ngl 99`) | 4.474 ± 534 | 241 ± 15,4 |
| 2026-09 | Backend Vulkan del motor (retirado posteriormente) | 12.890 | 378 |

Las mediciones se realizaron en una ventana compartida del equipo, por lo que la variabilidad puede ser significativa.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,6 GB para el fichero Q8_0, mas overhead de contexto y buffers del motor.
- GPU recomendadas: el autor valida sobre AMD Ryzen AI Max+ 395 (Radeon 8060S, memoria unificada). No hay datos publicados para A100, H100 o RTX 4090.
- Cabe en GPU consumer: si, con holgura, dado el tamano del fichero Q8_0. Cualquier GPU con 2-3 GB de VRAM libre o memoria unificada deberia poder alojarlo.
- Opciones de despliegue: motor 1bit (`1bit serve -m BlackMamba-1.5B-Q8_0.gguf --device hrx`), o cualquier runtime basado en llama.cpp que incorpore el soporte de arquitectura `blackmamba.cpp` del fork del autor. Ollama, vLLM o TGI no estan documentados como soportados.
- Latencia y throughput: 241 tok/s de generacion y 4.474 tok/s de prefill en el hardware indicado con el backend HRX; 378 tok/s de generacion y 12.890 tok/s de prefill con el antiguo backend Vulkan.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| BlackMamba-1.5B-GGUF (esta ficha) | 1.458.462.072 | Hibrida Mamba/MoE | no disponible | Apache 2.0 | GGUF |
| Zyphra/BlackMamba-1.5B | no disponible en la informacion | Hibrida Mamba/MoE | no disponible | Apache 2.0 | Pesos originales (PyTorch) |
| Otros modelos de ~1.5B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada que permitan una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Es un modelo base, no afinado para instrucciones: no cabe esperar un comportamiento de asistente conversacional sin fine-tuning adicional.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos conocidos: no documentados en la informacion disponible.
- Longitud de contexto no especificada; conviene verificarla en el `config.json` del modelo base antes de usarlo en produccion.
- Idiomas soportados no documentados.
- El soporte de arquitectura depende de un fork especifico de llama.cpp (`src/models/blackmamba.cpp`); no esta integrado en el llama.cpp upstream segun la informacion disponible, lo que limita la portabilidad a otros runtimes.
- Las metricas de rendimiento proceden de una unica medicion en una ventana compartida de un equipo, con alta varianza (pp512 ± 534 tok/s), por lo que no deben tomarse como valores de referencia estables.
- La validacion se limita a 96/96 tokens de coincidencia con la referencia en CPU; no cubre todos los casos de uso ni cuantizaciones distintas de Q8_0.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar la atribucion al modelo base Zyphra/BlackMamba-1.5B.

## Enlaces

- Repositorio GGUF: https://huggingface.co/1bit-MONSTER/BlackMamba-1.5B-GGUF
- Modelo base: https://huggingface.co/Zyphra/BlackMamba-1.5B
- Motor de inferencia 1bit: https://github.com/1bit-MONSTER/engine
- Catalogo de familias del autor: https://huggingface.co/1bit-MONSTER#families
- Punto de entrada del autor: https://huggingface.co/1bit-MONSTER#start-here
