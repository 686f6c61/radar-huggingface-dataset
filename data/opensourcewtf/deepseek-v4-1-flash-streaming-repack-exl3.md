# OpensourceWTF/DeepSeek-V4.1-Flash-streaming-repack-exl3

## Resumen
DeepSeek-V4.1-Flash-streaming-repack-exl3 es un empaquetado de pesos en formato streaming para servir el modelo DeepSeek-V4.1-Flash en Apple Silicon mediante mlx-serve y el plugin mlx-stream. Lo publica el usuario OpensourceWTF y deriva de la cuantizacion EXL3 a 3.0 bits por peso de los expertos enrutados realizada por Mia-AiLab sobre el modelo original de DeepSeek. Su proposito no es reentrenar ni modificar el modelo, sino reorganizar los pesos en un layout que permite carga bajo demanda desde SSD, de modo que un Mac con 128 GB de memoria unificada pueda ejecutar un modelo MoE de gran tamano que de otro modo no cabria en RAM.

La innovacion clave es el streaming: el tronco del modelo se carga una sola vez en memoria y los expertos enrutados y las tablas Engram se leen desde disco a medida que se necesitan. Esto convierte un modelo que en BF16 ocuparia cientos de gigabytes en algo desplegable en hardware de consumo de gama alta, a costa de latencia de prefill y de dependencia del ancho de banda del SSD. El repositorio ocupa 426,3 GB y la rama `3.0bpw` es la unica activa.

La relevancia actual es doble: por un lado demuestra que tecnicas de cuantizacion agresiva combinadas con streaming de expertos hacen viable la inferencia local de modelos frontera en estaciones de trabajo Apple; por otro, su licencia MIT y su integracion con mlx-serve lo convierten en una pieza practica para desarrolladores que quieran experimentar con modelos MoE grandes sin infraestructura de centro de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con MTP y tablas Engram (arquitectura `deepseek_v41` en mlx-serve) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (modelo MoE con expertos enrutados) |
| Longitud de contexto | hasta 1.048.576 tokens segun el autor; el servidor factura 16K por defecto si no se configura `--ctx-size` |
| Tipos de cuantizacion | EXL3 3.0 bpw en expertos enrutados (K3 en todas las capas); resto de tensores en BF16/F32 sin cambios |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | EXL3 en layout streaming para mlx-serve (no compatible con Transformers, vLLM ni ExLlamaV3) |

## Arquitectura y entrenamiento
El modelo subyacente es DeepSeek-V4.1-Flash, un transformer con mezcla de expertos (MoE) que incorpora prediccion multi-token (MTP) y tablas Engram. Esta ficha no dispone de datos sobre el numero de parametros totales o activos, la composicion del dataset de entrenamiento ni si se aplicaron fases de RLHF o DPO, por lo que esos extremos quedan como no disponibles. Lo que si documenta el autor es el proceso de repack: los expertos enrutados se cuantizan a EXL3 3.0 bpw con ExLlamaV3 v1.4.2, mientras que las proyecciones residentes, los expertos MTP y las tablas Engram se copian de forma exacta y los tensores BF16/F32 se mantienen verbatim.

La innovacion tecnica del empaquetado es el layout streaming junto con el plugin mlx-stream: el tronco se carga una vez y los expertos se leen desde SSD bajo demanda, con un limite de memoria configurable (`--memory-ceiling-gb`). La decodificacion emplea decodificacion especulativa DSpark con aceptacion tipica y kernels de clase rounding, lo que acerca la salida a la referencia BF16 sin ser identica bit a bit. El autor advierte que los expertos a 3.0 bpw son la unica parte con perdida del repack.

## Capacidades
- Generacion de texto y razonamiento general, heredados del modelo base DeepSeek-V4.1-Flash.
- Generacion de codigo, con un pass@1 de 0,9634 en HumanEval medido en este empaquetado.
- Soporte de contextos muy largos, hasta 1.048.576 tokens segun el autor, con facturacion configurable de memoria.
- Capacidad de servir peticiones concurrentes mediante mlx-serve, con metricas de TTFT y throughput por peticion.
- Decodificacion especulativa DSpark integrada en el servidor para acelerar la generacion.
- No se documentan en la informacion disponible capacidades de vision, audio, tool calling ni modo thinking; deben considerarse no confirmadas para este empaquetado.

## Casos de uso
- Evaluacion local de modelos frontera en Apple Silicon: un Mac con 128 GB puede servir el modelo gracias al streaming de expertos, lo que permite a investigadores probar un MoE grande sin GPU de centro de datos.
- Generacion de codigo en estaciones de trabajo: con pass@1 de 0,9634 en HumanEval y decodificacion especulativa, resulta adecuado para asistentes de programacion locales en entornos con requisitos de privacidad.
- Procesamiento de documentos largos: la ventana de hasta 1.048.576 tokens permite analizar repositorios completos o expedientes extensos, ajustando `--ctx-size` al presupuesto de memoria.
- Prototipado de aplicaciones sobre mlx-serve: el servidor expone una API HTTP con metricas de latencia y throughput utiles para dimensionar despliegues.
- Investigacion en cuantizacion: el repack sirve como referencia para estudiar el impacto de EXL3 3.0 bpw en expertos enrutados frente a los expertos FP4 originales.
- Benchmarking de hardware Apple: las cifras de prefill (661,5 tok/s a 16K) y decode (36,8 tok/s) permiten comparar M5 Max con otras configuraciones.
- Despliegue de bajo coste en oficina: al no requerir GPU dedicada, un equipo Apple de gama alta puede actuar como servidor de inferencia para un equipo pequeno.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| HumanEval pass@1 | 0,9634 (158 de 164) |
| Problemas fallados | HumanEval/32, 83, 132, 140, 145, 163 |
| Completaciones truncadas o con error | 0 / 0 |
| Tokens de completacion | 23.939 en total (media 146, maximo 4.073) |
| Decode tok/s | 31,8 agregado; mediana 30,0, p10 20,2, p90 36,0 |
| Time to first token | mediana 7,65 s, p90 9,08 s (prompts de unas 200 tokens) |
| Aceptacion especulativa | 4,89 tokens aceptados por intento de draft |
| Tiempo total | 2.077 s para 164 peticiones; pico de memoria 108,3 GB |
| Prefill a 16K | 661,5 tok/s, TTFT 24,77 s |
| Decode a 16K | 36,8 tok/s |
| Pico de memoria a 16K | 107,0 GB |

Las cifras se midieron en un Apple M5 Max con 128 GiB, con el plugin mlx-stream (build 4f42e79) y mlx-serve host 72b36513. El autor indica que la build de envio 3296dc0e reproduce el resultado de 16K token a token. No se publicaron resultados de MMLU, GSM8K ni otras pruebas en la informacion disponible.

## Requisitos de hardware
- Memoria unificada: 128 GiB recomendados; el autor usa `--memory-ceiling-gb 120.259` (112 GiB) para dejar 16 GiB a macOS.
- GPU: Apple Silicon Apple M5 Max con 128 GiB es la configuracion medida; no se documentan pruebas en A100, H100 ni RTX 4090, y el layout no es compatible con esos entornos.
- VRAM en consumer GPU: no aplica, ya que el empaquetado esta disenado para memoria unificada de Apple y streaming desde SSD.
- Almacenamiento: descarga de aproximadamente 426 GB; se recomienda SSD rapido por la lectura bajo demanda de expertos.
- Despliegue: exclusivamente mlx-serve con el plugin mlx-stream (PR ddalcu/mlx-serve#749). No funciona con Transformers, vLLM ni ExLlamaV3.
- Latencia y throughput: 661,5 tok/s de prefill y 36,8 tok/s de decode a 16K; TTFT de 24,77 s a 16K y mediana de 7,65 s en prompts de 200 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-streaming-repack-exl3 (este) | no disponible | hasta 1.048.576 tokens | HumanEval 0,9634; 36,8 tok/s decode en M5 Max | MIT | Hugging Face, solo mlx-serve |
| Mia-AiLab/DeepSeek-V4.1-Flash-EXL3-3.0bpw | no disponible | no disponible | no medido en la informacion | no disponible | Hugging Face, ExLlamaV3 |
| deepseek-ai/DeepSeek-V4.1-Flash (original) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| OpensourceWTF/DeepSeek-V4.1-Flash-1017-streaming-repack-exl3 | no disponible | no disponible | datos de calidad y velocidad propios | no disponible | Hugging Face, mlx-serve |

La comparacion se limita a variantes del mismo modelo base; no se dispone de datos de benchmarks de alternativas de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias
- Los expertos enrutados a EXL3 3.0 bpw son la unica parte con perdida del repack; el resto de tensores es exacto respecto al release.
- La decodificacion especulativa DSpark no produce salidas identicas bit a bit a la referencia BF16, aunque el autor la describe como cercana.
- No se midio KLD para este empaquetado, por lo que no hay una metrica de divergencia respecto al modelo original.
- El layout no es compatible con Transformers, vLLM ni ExLlamaV3; queda restringido a mlx-serve con el plugin mlx-stream.
- El rendimiento depende del ancho de banda del SSD y de la memoria disponible; contextos mayores reducen las filas de expertos residentes.
- El autor no documenta sesgos, idiomas soportados ni comportamiento de alucinacion; deben evaluarse empiricamente antes de produccion.
- La licencia MIT se aplica al empaquetado, pero conviene verificar las condiciones del modelo base y de la cuantizacion de origen antes de uso comercial.
- El repositorio ocupa 426,3 GB y requiere descarga y almacenamiento considerables.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/OpensourceWTF/DeepSeek-V4.1-Flash-streaming-repack-exl3
- Modelo base original: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Cuantizacion de origen: https://huggingface.co/Mia-AiLab/DeepSeek-V4.1-Flash-EXL3-3.0bpw
- Repack de pesos 1017: https://huggingface.co/OpensourceWTF/DeepSeek-V4.1-Flash-1017-streaming-repack-exl3
- Cuantizacion 2.81 bpw de los pesos 1017: https://huggingface.co/OpensourceWTF/DeepSeek-V4.1-Flash-1017-exl3-2.81bpw
- mlx-serve: https://github.com/ddalcu/mlx-serve
- Plugin mlx-stream: https://github.com/davidtai/mlx-stream
- PR de integracion en mlx-serve: https://github.com/ddalcu/mlx-serve/pull/749
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
