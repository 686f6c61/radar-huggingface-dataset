# doth4580/Qwen3.8-Flash-Next-EXL3-5.05bpw-DotH-MTP

## Resumen

Qwen3.8-Flash-Next-EXL3-5.05bpw-DotH-MTP es un paquete de pesos cuantizados del modelo Qwen3.8-Flash-Next, desarrollado originalmente por el equipo Qwen, redistribuido por el usuario doth4580 junto con una cabeza de decodificación especulativa (MTP, multi-token prediction). El paquete no introduce un modelo nuevo: combina la cuantización EXL3 de 5,05 bits por peso realizada por turboderp (rama `5.05bpw_h6_ng6` de exllamav3) con una cabeza draft reentrenada y destilada por el propio autor, empaquetada en formato ExLlamaV3.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 42.052.573.952 parámetros totales y una ventana de contexto que el motor de inferencia objetivo sirve hasta 262.144 tokens. La relevancia del paquete es operativa: está publicado específicamente para el motor veloGB10 sobre clústeres de NVIDIA DGX Spark / GB10, con decodificación especulativa integrada que acelera la generación sin alterar la salida, ya que cada token propuesto se verifica con el modelo completo.

El repositorio ocupa 123,3 GB y no cabe en una sola máquina GB10 (128 GB) junto con su memoria de trabajo, por lo que el autor lo distribuye únicamente para topologías tensor-parallel de 2 o 4 nodos. La licencia es la Qwen Community License 1.0 del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con cabeza MTP para decodificacion especulativa |
| Parametros totales | 42.052.573.952 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (max-seq-len configurado en veloGB10) |
| Tipos de cuantizacion | EXL3 5,05 bpw (variante `5.05bpw_h6_ng6` de exllamav3); existe variante 4,05 bpw del mismo autor |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors en formato EXL3 (ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con capas de mezcla de expertos, según indican las etiquetas del repositorio (`moe`) y la estructura del paquete. La cuantización EXL3 aplica un esquema de cuantización por bloques con grupos de 6 bits (`h6_ng6`) que reduce los pesos a 5,05 bits por parámetro, manteniendo la topología de expertos enrutados intacta. El paquete incluye además una capa MTP cuyo tensor de expertos enrutados permanece en los pesos del pack original.

La contribución específica del autor es la cabeza draft `zz_mtp_head_doth.safetensors`: los 59 tensores no-expertos de una cabeza MTP re-destilada a partir de doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16, cuantizada con exllamav3 1.5.3 al layout y anchuras de la cabeza optimizada de HermiHg (Apache-2.0). La proyección del indexador usa los bytes de HermiHg sin modificar. Los detalles sobre el dataset de entrenamiento del modelo base (número de tokens, composición, uso de RLHF/DPO) no están disponibles en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento en modo thinking (el motor se ejecuta con thinking activado en las pruebas del autor).
- Decodificación especulativa mediante cabeza MTP integrada, con tasas de aceptación del 69,5 % (TP=2) y 71,4 % (TP=4).
- Servicio de API compatible con OpenAI en el endpoint `/v1`, lo que habilita integración con clientes y frameworks estándar.
- Soporte de caché de prefijos (`--prefix-cache on`) para reutilizar contexto entre peticiones.
- Procesamiento por lotes concurrente (hasta 2 peticiones simultáneas en la configuración probada).
- Generación de hasta 65.536 tokens por respuesta (`--max-tokens 65536`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling, agentes y visión: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de inferencia en clúster DGX Spark: el paquete está probado con veloGB10 en topologías TP=2 y TP=4, lo que permite servir un modelo de 42.000 millones de parámetros en hardware GB10 distribuido cuando no cabe en un solo nodo.
- Atención al cliente con contexto largo: la ventana de 262.144 tokens y la caché de prefijos permiten mantener conversaciones multi-turno extensas o adjuntar documentación de referencia sin truncar.
- Generación de código asistida: con 134 tok/s de decodificación en turnos de código (TP=2) y 172 tok/s (TP=4), es adecuado para autocompletado y generación en entornos de desarrollo donde la latencia importa.
- Procesamiento por lotes de documentos largos: el prefill de 3.033 tok/s (TP=2) y 3.671 tok/s (TP=4) hace viable ingerir contextos extensos para resumen, extracción o clasificación.
- Investigación sobre decodificación especulativa: el paquete incluye la cabeza MTP y métricas de aceptación publicadas, lo que lo convierte en un banco de pruebas reproducible para estudiar el equilibrio entre velocidad y verificación.
- Sustitución de despliegues EXL3 existentes: al ser formato ExLlamaV3 estándar, cualquier framework que lea EXL3 puede cargarlo, permitiendo migrar desde el pack sin cabeza draft (doth4580/Qwen3.8-Flash-Next-EXL3-5.05bpw) ganando velocidad sin cambiar pesos.
- Evaluación comparativa de cuantizaciones: la existencia de variantes 4,05 bpw y 5,05 bpw del mismo autor facilita estudios de compromiso entre calidad y huella de memoria.

## Benchmarks y rendimiento

Datos medidos por el autor con VeloBench sobre la API servida en máquinas GB10 (2026-11-06, builds de desarrollo de veloGB10 0.7.7), con muestreo de producción, thinking activado y una petición simultánea en las columnas de petición única. La decodificación se expresa en tokens de salida por segundo e incluye decodificación especulativa. Una ejecución por celda, con variación aproximada de ±10 %.

| Topologia | Fuente del draft | Decode turno de codigo | Decode turno de relato | Mediana decode todos los turnos | Prefill (tok/s) | 2 peticiones, agregado | Aceptacion del draft |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=2 | Cabeza DotH-MTP | 134 | 68 | 80 | 3.033 | 122 | 69,5 % |
| TP=4 | Cabeza DotH-MTP | 172 | 92 | 107 | 3.671 | 151 | 71,4 % |

No se han publicado en la información disponible resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) para este paquete ni para el modelo base.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 123,3 GB en disco; el autor indica explícitamente que no cabe en una sola GB10 (128 GB) junto con su memoria de trabajo.
- GPU recomendadas: NVIDIA DGX Spark / GB10 en clúster de 2 o 4 máquinas con tensor parallelism (TP=2 o TP=4). No se documentan otros aceleradores.
- GPU de consumo: no viable; el tamaño del pack excede la memoria de cualquier GPU consumer individual.
- Despliegue: motor veloGB10 (`gb10_inference`), binario autocontenido con servidor compatible con OpenAI. Al ser EXL3 estándar, también puede cargarse en frameworks que lean el formato ExLlamaV3, aunque no se han probado en la información disponible.
- Red: interconexión RDMA/RoCE entre nodos; en equipos con dos pares de puertos RoCE activos se selecciona el rail con `--rdma-dev <rail1>,<rail2>`. Los nodos no necesitan copia del modelo: el head envía a cada nodo su parte y la cachea localmente.
- Throughput y latencia: decodificación de 80 tok/s (mediana, TP=2) y 107 tok/s (TP=4); prefill de 3.033 y 3.671 tok/s respectivamente; 122 y 151 tok/s agregados con 2 peticiones concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| doth4580/Qwen3.8-Flash-Next-EXL3-5.05bpw-DotH-MTP (este) | 42,05 B | 262.144 | EXL3 5,05 bpw + cabeza MTP | qwen-community-1.0 | Decodificacion especulativa integrada; TP=2/TP=4 en GB10 |
| doth4580/Qwen3.8-Flash-Next-EXL3-5.05bpw | 42,05 B | no disponible | EXL3 5,05 bpw | qwen-community-1.0 | Mismos pesos sin cabeza draft; misma velocidad base sin especulacion |
| doth4580/Qwen3.8-Flash-Next-EXL3-4.05bpw | 42,05 B | no disponible | EXL3 4,05 bpw | qwen-community-1.0 | Menor huella de memoria, mayor perdida de calidad potencial |
| Qwen/Qwen3.8-Flash-Next (original) | 42,05 B | no disponible | safetensors BF16 | qwen-community-1.0 | Pesos sin cuantizar; referencia de calidad |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la información proporcionada; al ser una cuantización del modelo Qwen, hereda los sesgos del modelo original, no documentados aquí.
- Riesgo de alucinación: no evaluado en la información disponible; la cuantización a 5,05 bpw puede introducir degradación adicional respecto al modelo en BF16, no medida en los datos publicados.
- Limitaciones de contexto e idioma: el contexto máximo servido es de 262.144 tokens, pero no se documenta el contexto nativo del modelo base ni los idiomas soportados.
- Restricciones de licencia: Qwen Community License 1.0; es necesario revisar sus términos para uso comercial, ya que la licencia del repositorio se marca como "other" con nombre `qwen-community-1.0`.
- La cabeza draft solo afecta a la velocidad, nunca a la salida, porque cada token propuesto se verifica con el modelo completo; sin embargo, el rendimiento medido es de una sola ejecución por celda con ±10 % de variación.
- El pack no cabe en un único GB10; desplegarlo en una sola máquina no es una opción soportada.
- El autor no reclama propiedad intelectual sobre el modelo, los pesos ni la arquitectura; la responsabilidad sobre el cumplimiento de licencias de terceros (turboderp, HermiHg) recae en el usuario.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación independiente de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-5.05bpw-DotH-MTP
- Pack base sin cabeza draft: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-5.05bpw
- Variante 4,05 bpw: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-4.05bpw
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Cuantizacion EXL3 de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Cabeza MTP BF16 del autor: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
- Cabezas MTP optimizadas de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Motor veloGB10: https://github.com/sf-stav/veloGB10
- exllamav3: https://github.com/turboderp-org/exllamav3
