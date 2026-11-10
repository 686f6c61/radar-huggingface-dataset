# doth4580/Qwen3.8-Flash-Next-EXL3-3.18bpw-DotH-MTP

## Resumen

Qwen3.8-Flash-Next-EXL3-3.18bpw-DotH-MTP es un paquete de pesos cuantizados del modelo Qwen3.8-Flash-Next, desarrollado originalmente por el equipo Qwen, publicado por el usuario doth4580. Se trata de una cuantizacion EXL3 (ExLlamaV3) de 3,18 bits por peso generada por turboderp, a la que se ha anadido una cabeza de borrador (draft head) para decodificacion especulativa, redistribuida de forma identica en bytes. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 27.276.059.392 parametros totales.

El paquete esta disenado principalmente para el motor de inferencia veloGB10 sobre una, dos o cuatro maquinas NVIDIA DGX Spark / GB10. Incluye la cabeza MTP (Multi-Token Prediction) re-destilada por el autor, cuantizada a la disposicion de la cabeza optimizada de HermiHg. La relevancia de este artefacto es practica: permite ejecutar un modelo de 27B parametros en hardware compacto GB10 con decodificacion especulativa activada, alcanzando velocidades de decodificacion medidas de 73 a 130 tokens por segundo segun la topologia.

La licencia es Qwen Community License 1.0 (identificada como "other" en los metadatos), lo que condiciona el uso comercial. El repositorio ocupa 106,6 GB y no tiene descargas ni likes registrados en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con cabeza MTP para decodificacion especulativa |
| Parametros totales | 27.276.059.392 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (segun los flags de ejecucion de veloGB10) |
| Tipos de cuantizacion | EXL3 a 3,18 bits por peso (variante `3.18bpw_h6_ng8` de turboderp) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`license: other`) |
| Formato de pesos | safetensors (EXL3 / ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de tipo Mixture-of-Experts, segun indican las etiquetas del repositorio (`moe`, `qwen4_exp`). Incluye una capa MTP (Multi-Token Prediction) que actua como cabeza de borrador para decodificacion especulativa. En este paquete, la cabeza MTP ha sido re-destilada por doth4580 a partir de su version BF16 y posteriormente cuantizada con exllamav3 1.5.3 a la disposicion y anchos de la cabeza optimizada de HermiHg; la proyeccion del indexador conserva los bytes de HermiHg sin cambios. Los expertos enrutados de la capa MTP permanecen los del propio paquete EXL3.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original. La innovacion tecnica destacable de este artefacto es la integracion de la cabeza de borrador MTP dentro del propio paquete de pesos cuantizados, de modo que el motor de inferencia puede activar decodificacion especulativa con `--mtp=auto` sin ficheros adicionales. La decodificacion especulativa no altera la salida: cada token propuesto es verificado por el modelo completo.

## Capacidades

- Generacion de texto y razonamiento en modo "thinking" (activado por defecto en las pruebas de rendimiento).
- Decodificacion especulativa mediante cabeza MTP integrada, con tasas de aceptacion del borrador medidas entre el 69,2 % y el 71,9 %.
- Soporte de contexto largo: hasta 262.144 tokens de secuencia maxima configurada en veloGB10.
- Servidor compatible con la API de OpenAI (`/v1`), lo que facilita integracion con clientes existentes.
- Cache de prefijos (`--prefix-cache on`) para reutilizacion de contexto entre peticiones.
- Procesamiento por lotes de hasta 2 peticiones simultaneas (`--max-batch 2`) y hasta 65.536 tokens de salida (`--max-tokens 65536`).
- Despliegue distribuido en tensor paralelo (TP=1, TP=2, TP=4) sobre nodos GB10 sin copia local del modelo en los nodos.
- Capacidades de codigo, matematicas, vision o tool calling: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en DGX Spark: el paquete esta optimizado para ejecutarse en una sola maquina GB10 con TP=1, permitiendo desplegar un modelo MoE de 27B parametros en hardware compacto con 73 tokens/s de mediana de decodificacion.
- Servicio de API compatible con OpenAI: al exponer un endpoint `/v1` en el puerto 9000, puede conectarse directamente a clientes y frameworks que consumen la API de OpenAI sin adaptadores.
- Procesamiento de documentos largos: con 262.144 tokens de contexto y cache de prefijos, es adecuado para tareas de resumen o analisis sobre corpus extensos que se reutilizan entre peticiones.
- Escalado horizontal en cluster: con TP=2 o TP=4 sobre varias maquinas GB10 se obtienen 95 o 130 tokens/s de mediana, util para servir cargas mayores manteniendo el mismo paquete de pesos.
- Generacion de codigo interactiva: la velocidad de decodificacion en turnos de codigo (119-190 tokens/s segun topologia) lo hace viable para asistentes de programacion en tiempo real.
- Investigacion sobre decodificacion especulativa: el paquete incluye la cabeza MTP y datos medidos de aceptacion del borrador, lo que permite reproducir y comparar estrategias de speculative decoding.
- Despliegue en entornos con memoria limitada: la cuantizacion a 3,18 bpw reduce el peso del modelo respecto a BF16, facilitando su ajuste en GPUs de menor capacidad.

## Benchmarks y rendimiento

Rendimiento medido con veloGB10 (0.7.7, builds de desarrollo, 2026-11-05) sobre maquinas NVIDIA DGX Spark / GB10, con muestreo de produccion, thinking activado y una peticion a la vez en las columnas de peticion unica. Una ejecucion por celda; variacion aproximada de ±10 %.

| Topologia | Fuente del borrador | Decode turno de codigo (tok/s) | Decode turno de relato (tok/s) | Mediana decode todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | Cabeza DotH-MTP | 119 | 62 | 73 | 2.010 | 104 | 71,4 % |
| TP=2 | Cabeza DotH-MTP | 155 | 80 | 95 | 3.233 | 135 | 69,2 % |
| TP=4 | Cabeza DotH-MTP | 190 | 105 | 130 | 3.774 | 156 | 71,9 % |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio ocupa 106,6 GB, aunque la cuantizacion a 3,18 bpw reduce el peso efectivo de los pesos respecto a BF16.
- Hardware objetivo: NVIDIA DGX Spark / GB10, en configuraciones de una, dos o cuatro maquinas.
- GPU consumer: no disponible; el paquete esta probado exclusivamente en GB10.
- Despliegue: motor veloGB10 (`gb10_inference`), binario autocontenido con servidor compatible con OpenAI. Los pesos son EXL3 estandar, por lo que cualquier framework que lea el formato puede usarlos.
- Memoria por nodo: los nodos de un despliegue TP=2 o TP=4 no necesitan copia local del modelo; el nodo cabeza envia a cada nodo solo su parte de los pesos, que se cachea localmente.
- Red: soporte de RDMA sobre RoCE; con dos pares de puertos activos se selecciona con `--rdma-dev <rail1>,<rail2>`, con un solo par se detecta automaticamente.
- Latencia y throughput: ver tabla de benchmarks (73-130 tok/s de mediana en decode; 2.010-3.774 tok/s en prefill).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-EXL3-3.18bpw-DotH-MTP (este) | 27,28 B (MoE) | 262.144 | EXL3 safetensors + MTP | Qwen Community 1.0 | Incluye cabeza de borrador; optimizado para veloGB10 |
| doth4580/Qwen3.8-Flash-Next-EXL3-3.18bpw | 27,28 B (MoE) | no disponible | EXL3 safetensors | Qwen Community 1.0 | Mismos pesos sin cabeza MTP; sin decodificacion especulativa |
| doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16 | 27,28 B (MoE) | no disponible | safetensors BF16 | Qwen Community 1.0 | Version sin cuantizar de la cabeza MTP re-destilada |
| Qwen/Qwen3.8-Flash-Next | 27,28 B (MoE) | no disponible | safetensors | Qwen Community 1.0 | Modelo original sin cuantizar |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- La licencia Qwen Community License 1.0 impone condiciones especificas para uso comercial; es necesario revisar el texto completo antes de desplegar en produccion.
- El paquete es una cuantizacion a 3,18 bpw: puede haber perdida de calidad respecto al modelo original en BF16, aunque no se han publicado mediciones de esta degradacion.
- No se dispone de informacion sobre sesgos conocidos, idiomas soportados ni tasas de alucinacion del modelo base.
- Los benchmarks de rendimiento proceden de una unica ejecucion por celda con variacion de ±10 %, sobre builds de desarrollo de veloGB10; no deben tomarse como cifras de produccion estables.
- El paquete esta probado principalmente con veloGB10; otros motores que lean EXL3 pueden no soportar la cabeza MTP integrada.
- La decodificacion especulativa solo afecta a la velocidad, no a la salida, pero depende de la tasa de aceptacion del borrador (69-72 % medido), que puede variar con el dominio del texto.
- El repositorio no registra descargas ni likes, y su fecha de creacion es de noviembre de 2026; se trata de un artefacto reciente sin validacion comunitaria extensa.
- No se dispone de informacion sobre el numero de parametros activos del MoE, lo que impide estimar con precision los requisitos de computo por token.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-3.18bpw-DotH-MTP
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Paquete EXL3 base sin cabeza MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-3.18bpw
- Cabeza MTP en BF16: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
- Cuantizacion EXL3 de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Cabezas MTP optimizadas de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- Herramienta de cuantizacion exllamav3: https://github.com/turboderp-org/exllamav3
