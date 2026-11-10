# doth4580/Qwen3.8-Flash-Next-EXL3-1.66bpw

## Resumen

Qwen3.8-Flash-Next-EXL3-1.66bpw es una cuantización de precisión mixta (1,66 bits por peso de media) del modelo Qwen/Qwen3.8-Flash-Next del equipo Qwen. El pack lo generó turboderp con exllamav3 (rama `1.66bpw_h4_ng3`) y lo redistribuye byte a byte el usuario doth4580 como referencia estable para su motor de inferencia veloGB10 sobre hardware NVIDIA DGX Spark / GB10. No se ha reconvertido ni recuantizado ningún fichero: la contribución del publicador se limita al empaquetado, las pruebas y la documentación de despliegue.

El modelo subyacente es un transformer de tipo mixture-of-experts (MoE) con 15.087.586.304 parámetros totales según los safetensors del repo. El pack ocupa 50,2 GB en disco y está pensado para ejecutarse con decodificación especulativa mediante cabezas MTP (multi-token prediction) en uno, dos o cuatro aceleradores GB10 con tensor parallelism. La ventana de contexto configurada en los comandos de referencia es de 262.144 tokens, con un máximo de 65.536 tokens de generación.

Su relevancia es fundamentalmente práctica: demuestra que un MoE de 15B puede servirse con un presupuesto de memoria muy ajustado (1,66 bpw) manteniendo velocidades de decodificación de entre 67 y 185 tokens por segundo según topología y tipo de turno, con aceptación de borrador especulativo en torno al 67-72 %. Es un artefacto de cuantización, no un modelo nuevo: hereda arquitectura, capacidades y limitaciones del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts); detalles de capas y expertos no disponibles |
| Parametros totales | 15.087.586.304 (≈15,09 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configurado en los comandos de referencia; contexto nativo del modelo base no disponible) |
| Tipos de cuantizacion | EXL3 a 1,66 bpw (rama `1.66bpw_h4_ng3` de turboderp); solo este pack |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors en formato EXL3 (ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con capas de mezcla de expertos (MoE), según las etiquetas del repositorio (`moe`, `qwen4_exp`). No se dispone en la información proporcionada de datos sobre número de capas, número de expertos, dimensión oculta, composición del dataset de entrenamiento, número de tokens vistos ni si hubo etapas de RLHF o DPO. Tampoco se detalla ninguna innovación de atención (lineal, híbrida u otra).

Lo que sí está documentado es la capa de cuantización: EXL3 de exllamav3 con 1,66 bits por peso de media, un esquema de cuantización de precisión mixta orientado a minimizar el impacto en calidad manteniendo el modelo completo en memoria. El pack incluye una cabeza MTP propia para decodificación especulativa, y el autor documenta la sustitución opcional por cabezas de borrador alternativas (HermiHg y DotH-MTP) que solo afectan a la velocidad, nunca a la salida generada. El motor veloGB10 soporta además caché de prefijos (`--prefix-cache on`) y tensor parallelism sobre RoCE/RDMA entre nodos, con transferencia de pesos por red y caché local en cada nodo.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por defecto en las pruebas de referencia (sampling de producción con thinking on).
- Generación de código, evaluada en el benchmark del autor mediante turnos de tipo "code".
- Generación creativa y narrativa, evaluada mediante turnos de tipo "story".
- Decodificación especulativa mediante cabeza MTP integrada, con aceptación de borrador del 66,8-72,0 % según topología.
- Servicio compatible con la API de OpenAI (`/v1`) a través de veloGB10.
- Procesamiento por lotes concurrente (`--max-batch`), con métricas agregadas para 2 peticiones simultáneas.
- Soporte de contexto largo: hasta 262.144 tokens de secuencia configurados.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling, uso de agentes y visión/audio: no disponibles en la información proporcionada.

## Casos de uso

- Servicio de inferencia en clústeres pequeños de DGX Spark / GB10: el pack está dimensionado para desplegarse en una, dos o cuatro máquinas GB10 con tensor parallelism y transferencia de pesos por red, sin copia local del modelo en los nodos. Es adecuado cuando se quiere servir un MoE de 15B en hardware de borde con 50,2 GB de pesos.
- Asistentes conversacionales de contexto largo: con 262.144 tokens de ventana y caché de prefijos activada, permite mantener conversaciones multi-turno con documentos extensos o historiales largos sin recompilar el prefijo en cada petición.
- Generación de código en pipelines internos: los turnos de código alcanzan 118-185 tok/s de decodificación según topología, suficiente para autocompletado y generación de parches en herramientas de desarrollo, aunque la ausencia de datos sobre tool calling impide confirmar integración con agentes de CI/CD.
- Generación de contenido narrativo y creativo: los turnos de historia sostienen 63-107 tok/s, adecuado para borradores largos y variantes múltiples con sampling de producción.
- Evaluación y benchmarking de motores de inferencia: el pack se publica explícitamente como referencia estable para medir veloGB10 (VeloBench), por lo que sirve para comparar topologías TP=1/2/4 y cabezas de borrador distintas bajo condiciones controladas.
- Despliegue con presupuesto de VRAM ajustado: a 1,66 bpw, el modelo completo cabe en 50,2 GB, lo que permite ejecutarlo en un único GB10 (TP=1) con decodificación de 78 tok/s de mediana en todos los turnos.
- Investigación sobre cuantización extrema: útil para estudiar la degradación de calidad a 1,66 bpw frente al modelo base en tareas de código y razonamiento, aunque el autor no publica comparativas de calidad.

## Benchmarks y rendimiento

Los únicos datos publicados son mediciones de velocidad de veloGB10 (VeloBench, 2026-11-05, builds 0.7.7 en desarrollo), con sampling de producción, thinking activado y una ejecución por celda (±10 % de variación).

| Topologia | Fuente del borrador | Decode turno de codigo (tok/s) | Decode turno de historia (tok/s) | Mediana todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | Cabeza MTP del pack | 118 | 67 | 78 | 1.717 | 90 | 72,0 % |
| TP=2 | Cabeza MTP del pack | 150 | 82 | 94 | 2.887 | 126 | 67,3 % |
| TP=4 | Cabeza MTP del pack | 174 | 102 | 110 | 3.398 | 146 | 66,8 % |
| TP=1 | Cabeza MTP HermiHg | 122 | 66 | 77 | 1.716 | 109 | 70,5 % |
| TP=2 | Cabeza MTP HermiHg | 107 | 81 | 110 | 2.821 | 137 | 69,2 % |
| TP=4 | Cabeza MTP HermiHg | 174 | 103 | 117 | 3.362 | 158 | 69,4 % |
| TP=1 | Cabeza DotH-MTP | 117 | 63 | 78 | 1.786 | 106 | 70,3 % |
| TP=2 | Cabeza DotH-MTP | 150 | 87 | 123 | 2.854 | 159 | 69,5 % |
| TP=4 | Cabeza DotH-MTP | 185 | 107 | 125 | 3.360 | 153 | 70,0 % |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 50,2 GB de pesos en disco a 1,66 bpw; el pack está diseñado para caber en un único GB10 (TP=1) y escalar a 2 o 4 GB10 con tensor parallelism.
- GPU recomendadas: NVIDIA DGX Spark / GB10 en configuraciones de 1, 2 o 4 máquinas. No se documenta soporte para A100, H100 ni RTX 4090.
- GPU de consumo: no disponible; el formato EXL3 puede cargarse en GPUs con suficiente VRAM, pero no se han publicado pruebas en tarjetas consumer.
- Opciones de despliegue: veloGB10 (`gb10_inference`, binario único, servidor compatible con OpenAI en el puerto 9000); al ser EXL3 estándar, cualquier framework que lea el formato ExLlamaV3 puede cargarlo, aunque no se documentan pruebas con otros motores.
- Red entre nodos: RoCE con uno o dos pares de puertos; selección explícita con `--rdma-dev <rail1>,<rail2>` cuando hay dos pares activos.
- Latencia y throughput: prefill de 1.717 tok/s (TP=1) a 3.398 tok/s (TP=4); decodificación de 78 tok/s de mediana (TP=1) a 110-125 tok/s (TP=4 según cabeza de borrador); 90-159 tok/s agregados con 2 peticiones concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-EXL3-1.66bpw (este pack) | 15,09 B (MoE) | 262.144 configurados | EXL3 1,66 bpw, safetensors | qwen-community-1.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-Flash-Next (base) | 15,09 B (MoE) | no disponible | safetensors (BF16 presumiblemente) | qwen-community-1.0 | Hugging Face (oficial) |
| turboderp/Qwen3.8-Flash-Next-exl3 | 15,09 B (MoE) | no disponible | EXL3, varias ramas de bpw | qwen-community-1.0 | Hugging Face |
| doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16 | no disponible (cabeza MTP) | no aplica | safetensors BF16 | no disponible | Hugging Face |

No se dispone de datos de rendimiento de calidad para comparar con alternativas de la misma categoría; la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Es una cuantización a 1,66 bpw: la degradación de calidad frente al modelo base no está medida ni documentada por el autor.
- No se han publicado evaluaciones de sesgo, alucinación ni robustez para este pack ni para el modelo base en la información disponible.
- Los idiomas soportados no están declarados; no se puede garantizar calidad fuera del inglés sin verificación propia.
- La licencia Qwen Community License 1.0 impone condiciones específicas para uso comercial; es necesario revisar el texto completo antes de desplegar en producción.
- El pack está optimizado y probado exclusivamente con veloGB10 sobre GB10; el rendimiento en otros motores o GPUs no está verificado.
- El autor no reclama propiedad intelectual sobre el modelo ni los pesos; cualquier redistribución debe respetar las licencias originales.
- El repositorio tiene 0 descargas y 0 likes, y fue creado el 2026-11-09: es un artefacto muy reciente y sin validación comunitaria.
- Las cifras de velocidad provienen de una sola ejecución por celda con variación de ±10 % y builds de desarrollo de veloGB10 0.7.7, no de una versión estable.
- El uso de cabezas de borrador alternativas cambia solo la velocidad, pero requiere seguir el procedimiento documentado en la card de DotH-MTP para añadirlas al pack.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-1.66bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Pack EXL3 original de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Motor exllamav3: https://github.com/turboderp-org/exllamav3
- Motor veloGB10: https://github.com/sf-stav/veloGB10
- Cabeza MTP optimizada de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Cabeza DotH-MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
