# doth4580/Qwen3.8-Flash-Next-FP4-Local-DotH-MTP

## Resumen

Qwen3.8-Flash-Next-FP4-Local-DotH-MTP es un paquete de pesos cuantizados y modificados del modelo Qwen3.8-Flash-Next de Qwen, en su version FP4-Local publicada por NVIDIA, al que se le ha anadido una cabeza de decodificacion especulativa (MTP, multi-token prediction) re-destilada. Lo publica el usuario doth4580 y esta pensado principalmente para el motor de inferencia veloGB10 sobre maquinas NVIDIA DGX Spark / GB10. No es un modelo entrenado desde cero, sino una distribucion de pesos derivada: el tronco es el de NVIDIA y la contribucion propia es la cabeza draft y el reempaquetado en formato EXL3 (ExLlamaV3).

El modelo subyacente es un transformer de tipo mezcla de expertos (MoE) con 187.931.804.131 parametros totales, cuantizado en FP4 (NVFP4) por NVIDIA y reempaquetado aqui en EXL3. El repositorio ocupa 103,1 GB y se distribuye en 21 shards de safetensors mas un sidecar de la cabeza draft. La longitud de contexto soportada en la configuracion probada es de 262.144 tokens, aunque el pack no cabe en una sola GB10 a esa ventana y requiere TP=2 o TP=4.

Su relevancia es practica: permite servir un modelo de ~188.000 millones de parametros en hardware de escritorio de clase GB10 (DGX Spark) mediante cuantizacion FP4, paralelismo tensorial entre dos o cuatro nodos y decodificacion especulativa, con un servidor compatible con la API de OpenAI. La licencia es la NVIDIA Open Model Agreement, heredada del modelo base de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con cabeza MTP para decodificacion especulativa (formato EXL3) |
| Parametros totales | 187.931.804.131 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configuracion probada con `--max-seq-len 262144`) |
| Tipos de cuantizacion | FP4 / NVFP4 (base NVIDIA), EXL3 a ~2,6 bpw para la cabeza draft, 8-bit (tag del repo) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model Agreement (heredada); cabeza draft derivada de material Apache-2.0 de HermiHg |
| Formato de pesos | safetensors (EXL3, 21 shards) + sidecar `mtp-doth-2.6bpw.safetensors` |

## Arquitectura y entrenamiento

El tronco es el modelo Qwen3.8-Flash-Next en su cuantizacion FP4-Local de NVIDIA, un transformer de mezcla de expertos con 187.930 millones de parametros y 512 expertos enrutados por capa (segun se deduce del reparto de la cabeza draft, que replica esa estructura). Los pesos del tronco son byte a byte identicos a los de NVIDIA salvo dos ficheros: el sidecar de la cabeza draft y el shard 15, donde se han sustituido 26 tensores de la cabeza propia conservando nombres, dtypes y formas.

La innovacion tecnica del paquete es la cabeza MTP re-destilada por doth4580 (publicada aparte como `Qwen3.8-Flash-Next-DotH-MTP-BF16`), cuantizada con exllamav3 1.5.3 a la misma disposicion y anchos de bit que la cabeza de HermiHg (2,6 bpw). Nueve lineales fueron reentrenados; la proyeccion del indexador y los 512 expertos enrutados se toman sin cambios de los bytes de HermiHg y ambos mantienen los pesos originales. Esta cabeza se usa para decodificacion especulativa: acelera la generacion, pero cada token propuesto se verifica con el modelo completo, por lo que no altera la salida. No se dispone de informacion sobre el numero de tokens de entrenamiento del tronco ni sobre el proceso de RLHF/DPO del modelo original en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento en modo "thinking" (el sampler por defecto del pack activa el modo pensamiento).
- Decodificacion especulativa mediante cabeza MTP integrada, activada con `--mtp=auto`.
- Servidor compatible con la API de OpenAI en `/v1`, con soporte de peticiones concurrentes (`--max-batch`).
- Cache de prefijos (`--prefix-cache on`) para reutilizar contexto entre peticiones.
- Generacion de hasta 65.536 tokens por respuesta (`--max-tokens 65536`).
- Despliegue distribuido en TP=2 y TP=4 con transferencia de pesos por red (RoCE/RDMA) sin copia local del modelo en los nodos.
- Capacidades de codigo y de turnos conversacionales largos, segun los escenarios medidos en VeloBench (turnos de codigo y de relato).
- Soporte de tool calling, agentes o vision: no disponible en la informacion proporcionada.

## Casos de uso

- Servicio de inferencia local en cluster de DGX Spark: desplegar el pack con veloGB10 en TP=2 o TP=4 y exponer un endpoint compatible con OpenAI para aplicaciones internas, aprovechando los 262.144 tokens de contexto.
- Asistentes de codigo con contexto de repositorio: la ventana de 262.144 tokens y el modo thinking permiten cargar ficheros y trazas largas; el turno de codigo alcanza 139 tok/s en TP=2 y 172 tok/s en TP=4.
- Generacion de documentacion tecnica y relatos largos: el turno de relato rinde 59 tok/s en TP=2 y 85 tok/s en TP=4, adecuado para generacion sostenida de texto extenso.
- Procesamiento de documentos de gran extension: resumen y extraccion sobre contratos o informes que quepan en la ventana de contexto, con cache de prefijos para reutilizar el documento entre consultas.
- Evaluacion e investigacion de decodificacion especulativa: el pack incluye informe de error por lineal (`mtp-doth-2.6bpw.quant_report.json`) y permite comparar la aceptacion de draft (71,2 % en TP=2, 71,9 % en TP=4) frente a otras cabezas.
- Laboratorio de cuantizacion FP4/EXL3: servir como referencia reproducible para medir latencia y throughput de un MoE de ~188.000 millones de parametros en hardware GB10.
- Backend de agentes multi-turno con concurrencia limitada: con `--max-batch 2` y agregado de 133 tok/s (TP=2) o 158 tok/s (TP=4) en dos peticiones simultaneas.

## Benchmarks y rendimiento

Mediciones de VeloBench sobre la API servida en maquinas GB10 (2026-11-07, veloGB10 0.7.7 en desarrollo), con muestreo de produccion, thinking activado y una ejecucion por celda (variacion aproximada de +-10 %):

| Topologia | Fuente de draft | Decode turno codigo (tok/s) | Decode turno relato (tok/s) | Mediana decode todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion de draft |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=2 | Cabeza DotH-MTP | 139 | 59 | 80 | 3.401 | 133 | 71,2 % |
| TP=4 | Cabeza DotH-MTP | 172 | 85 | 93 | 3.881 | 158 | 71,9 % |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el repositorio ocupa 103,1 GB en disco; el pack no cabe en una sola GB10 a 262.144 tokens de contexto, por lo que requiere TP=2 como minimo.
- GPU recomendadas: NVIDIA DGX Spark / GB10 en configuracion de dos o cuatro maquinas; no se documenta soporte para A100, H100 ni RTX 4090.
- GPU de consumo: no disponible; el pack esta orientado a hardware GB10 y no se indica compatibilidad con GPUs consumer.
- Despliegue: motor veloGB10 (`gb10_inference`), binario autocontenido con servidor compatible con OpenAI; los pesos son EXL3 estandar y pueden leerse con cualquier framework que soporte el formato (ExLlamaV3).
- Red: los nodos no necesitan copia del modelo; el head envia a cada nodo su parte de pesos y la cachea localmente. Con dos pares de puertos RoCE activos se selecciona con `--rdma-dev <rail1>,<rail2>`.
- Latencia y throughput: prefill de 3.401 tok/s (TP=2) y 3.881 tok/s (TP=4); decode mediano de 80 tok/s (TP=2) y 93 tok/s (TP=4); agregado con dos peticiones de 133 tok/s (TP=2) y 158 tok/s (TP=4).
- Parametros de servicio probados: `--max-batch 2`, `--max-tokens 65536`, `--prefix-cache on`, `--mtp=auto`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Draft/MTP | Licencia | Notas |
|---|---|---|---|---|---|---|
| doth4580/Qwen3.8-Flash-Next-FP4-Local-DotH-MTP (este) | 187.931.804.131 | 262.144 | FP4/EXL3 | Cabeza DotH-MTP incluida | NVIDIA Open Model Agreement | Orientado a veloGB10, TP=2/TP=4 |
| doth4580/Qwen3.8-Flash-Next-FP4-Local | no disponible | no disponible | FP4/EXL3 | Sin cabeza (mismos pesos) | NVIDIA Open Model Agreement | Mismo tronco sin la cabeza draft |
| nvidia/Qwen3.8-Flash-Next-FP4-Local | no disponible | no disponible | FP4 | No | NVIDIA Open Model Agreement | Base de NVIDIA, sin modificaciones |
| doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16 | no disponible | no disponible | BF16 | Cabeza DotH-MTP en BF16 | no disponible | Cabeza draft publicada por separado |
| HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3 | no disponible | no disponible | EXL3 ~2,6 bpw | Cabeza de HermiHg | Apache-2.0 | Cabeza alternativa sobre el mismo tronco |

No se dispone de datos de rendimiento de calidad comparables entre estas variantes en la informacion proporcionada; la unica comparacion cuantitativa disponible es la de velocidad y aceptacion de draft de VeloBench.

## Limitaciones y advertencias

- No es un modelo original: los pesos del tronco son de NVIDIA y la licencia aplicable es la NVIDIA Open Model Agreement, con las restricciones que esta impone al uso comercial; revisar el texto antes de desplegar en produccion.
- El pack no cabe en una sola GB10 a 262.144 tokens; requiere al menos dos maquinas, lo que anade complejidad operativa y dependencia de red (RoCE/RDMA).
- Las mediciones de rendimiento provienen de una sola ejecucion por celda con builds de desarrollo (veloGB10 0.7.7) y varian aproximadamente +-10 %; no deben tomarse como cifras de produccion estables.
- La cabeza draft solo afecta a la velocidad, nunca a la salida, pero su aceptacion (~71 %) condiciona la ganancia real de decodificacion especulativa.
- No se documentan idiomas soportados ni resultados de benchmarks de calidad; el riesgo de alucinacion y los sesgos del modelo original no estan caracterizados en esta ficha.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.
- El tag `qwen4_exp` y el nombre "Qwen3.8" no permiten confirmar la generacion exacta del modelo subyacente; verificar contra la model card de Qwen antes de asumir capacidades.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-FP4-Local-DotH-MTP
- Modelo base NVIDIA: https://huggingface.co/nvidia/Qwen3.8-Flash-Next-FP4-Local
- Variante sin cabeza draft: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-FP4-Local
- Cabeza MTP en BF16: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
- Cabezas MTP de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- Licencia NVIDIA Open Model Agreement: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-agreement/
