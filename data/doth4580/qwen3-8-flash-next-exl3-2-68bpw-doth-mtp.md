# doth4580/Qwen3.8-Flash-Next-EXL3-2.68bpw-DotH-MTP

## Resumen

Qwen3.8-Flash-Next-EXL3-2.68bpw-DotH-MTP es un paquete de pesos cuantizados del modelo Qwen3.8-Flash-Next, desarrollado originalmente por el equipo Qwen, redistribuido por el usuario doth4580 en Hugging Face. La cuantizacion EXL3 a 2,68 bits por peso (bpw) fue realizada por turboderp mediante exllamav3, y el paquete anade una cabeza de prediccion multi-token (MTP) reentrenada por doth4580 para decodificacion especulativa. El modelo cuenta con 23.235.109.632 parametros totales y una arquitectura de mezcla de expertos (MoE), segun las etiquetas del repositorio.

El paquete esta disenado principalmente para el motor de inferencia veloGB10 sobre una, dos o cuatro maquinas NVIDIA DGX Spark / GB10, con soporte de tensor parallelism (TP=1, TP=2, TP=4) y un servidor compatible con la API de OpenAI. La relevancia de esta publicacion radica en que permite ejecutar un modelo MoE de gran tamano con contexto de hasta 262.144 tokens en hardware de clase workstation, combinando cuantizacion agresiva y decodificacion especulativa para mejorar el throughput de generacion.

La licencia es la Qwen Community License 1.0, heredada del modelo base. El repositorio ocupa 98,5 GB y no registra descargas ni likes en el momento de la consulta, lo que sugiere una publicacion reciente (creada el 9 de noviembre de 2026 y actualizada el 10 de noviembre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), segun etiquetas del repositorio; detalles de capas no disponibles |
| Parametros totales | 23.235.109.632 (23,2 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configuracion `--max-seq-len` probada en veloGB10) |
| Tipos de cuantizacion | EXL3 a 2,68 bpw (variante `2.68bpw_h6_ng8` de turboderp); pesos originales BF16 disponibles en el modelo base |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`) |
| Formato de pesos | safetensors (formato EXL3 de ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura de mezcla de expertos (MoE), tal como indican las etiquetas `moe` del repositorio y la referencia a 512 expertos enrutados en la cabeza MTP. No se dispone de informacion detallada sobre el numero de capas, la dimension oculta, el numero de expertos activos por token ni la composicion del dataset de entrenamiento original en la informacion proporcionada. Tampoco se documentan procesos de RLHF, DPO u otras fases de alineacion.

La innovacion tecnica principal de este paquete es la incorporacion de una cabeza de prediccion multi-token (MTP) reentrenada por doth4580, que actua como drafter en decodificacion especulativa. Esta cabeza conserva la misma arquitectura, nombres de tensores y formas que la cabeza original, pero solo sus capas densas fueron reentrenadas sobre las propias salidas de Flash-Next; los 512 expertos enrutados son los originales. Los 59 tensores no-expertos de la cabeza se cuantizaron con exllamav3 1.5.3 al layout y anchuras de la cabeza optimizada de HermiHg (Apache-2.0), manteniendo sin cambios la proyeccion del indexer. La decodificacion especulativa no altera la salida: cada token propuesto es verificado por el modelo completo, de modo que la cabeza afecta unicamente a la velocidad.

## Capacidades

- Generacion de texto y razonamiento: el modelo base Qwen3.8-Flash-Next es un modelo de lenguaje de proposito general; las capacidades especificas de razonamiento, codigo y matematicas no estan documentadas en la informacion disponible.
- Decodificacion especulativa: integra una cabeza MTP que acelera la generacion con una tasa de aceptacion del borrador medida de aproximadamente el 70,1-70,3 % en las pruebas de veloGB10.
- Contexto largo: soporta ventanas de hasta 262.144 tokens en la configuracion probada.
- Servidor compatible con OpenAI: el motor veloGB10 expone un endpoint `/v1` compatible con la API de OpenAI.
- Cache de prefijos: soporte de `--prefix-cache on` para reutilizacion de prefijos en conversaciones multi-turno.
- Procesamiento por lotes: `--max-batch 2` y `--max-tokens 65536` en la configuracion de referencia.
- Capacidades multimodales, tool calling, agentes o thinking mode: no disponibles en la informacion proporcionada (la model card menciona "thinking on" en la configuracion de muestreo de las pruebas, lo que sugiere un modo de razonamiento, pero sin documentacion adicional).

## Casos de uso

- Despliegue en cluster de DGX Spark: el paquete esta optimizado para ejecutarse en una, dos o cuatro maquinas GB10 con tensor parallelism, lo que permite servir un modelo de 23,2 mil millones de parametros en hardware de clase workstation distribuido sin copia local del modelo en los nodos.
- Analisis de documentos extensos: con 262.144 tokens de contexto, el modelo puede procesar libros tecnicos, expedientes legales o bases de codigo completas en una sola pasada, usando cache de prefijos para consultas repetidas sobre el mismo documento.
- Asistencia de codigo en produccion: el modo de decodificacion especulativa alcanza 112-176 tokens/s de decodificacion en turnos de codigo segun la topologia (TP=1 a TP=4), adecuado para autocompletado interactivo y generacion de parches en pipelines de CI/CD.
- Chat multi-turno de baja latencia: el throughput agregado de 96-141 tokens/s con dos peticiones concurrentes permite atender conversaciones simultaneas en un servidor OpenAI-compatible.
- Prototipado e investigacion en inferencia eficiente: el paquete sirve como banco de pruebas para estudiar decodificacion especulativa con cabezas MTP, cuantizacion EXL3 a 2,68 bpw y tensor parallelism sobre enlaces RDMA/RoCE.
- Generacion de narrativa y contenido largo: los turnos de historia alcanzan 59-96 tokens/s, suficiente para generar texto extenso con contexto persistente.
- Evaluacion comparativa de cuantizaciones: al existir variantes del mismo modelo a 2,68 bpw y 3,68 bpw, permite medir el compromiso entre calidad y velocidad en el mismo hardware.

## Benchmarks y rendimiento

Los datos disponibles provienen de VeloBench, ejecutado contra la API servida en maquinas NVIDIA DGX Spark / GB10 (2026-11-05, veloGB10 0.7.7 en desarrollo), con muestreo de produccion, thinking activado y una peticion a la vez en las columnas de peticion unica. La decodificacion se mide en tokens de salida por segundo e incluye decodificacion especulativa. Una ejecucion por celda; la variacion por muestreo es de aproximadamente ±10 %.

| Topologia | Fuente del borrador | Decodificacion turno de codigo (tok/s) | Decodificacion turno de historia (tok/s) | Mediana decodificacion todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | Cabeza DotH-MTP | 112 | 59 | 70 | 1.787 | 96 | 70,1 % |
| TP=2 | Cabeza DotH-MTP | 147 | 80 | 120 | 2.793 | 118 | 70,3 % |
| TP=4 | Cabeza DotH-MTP | 176 | 96 | 113 | 3.317 | 141 | 70,1 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 98,5 GB, por lo que se requiere al menos esa cantidad de memoria agregada; con TP=1 cabe en una unica maquina GB10 (128 GB de memoria unificada en DGX Spark), y con TP=2 o TP=4 se reparte entre nodos.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuraciones de una, dos o cuatro maquinas. No se documenta soporte para A100, H100 ni RTX 4090 en la informacion disponible.
- Cabe en GPU de consumo: no disponible; el paquete esta orientado a hardware GB10.
- Opciones de despliegue: veloGB10 (`gb10_inference`), el motor para el que fue probado; al ser formato EXL3 estandar, cualquier framework que lea ExLlamaV3 deberia poder cargarlo, aunque no se documentan pruebas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: prefill de 1.787 tok/s (TP=1), 2.793 tok/s (TP=2) y 3.317 tok/s (TP=4); decodificacion mediana de 70, 120 y 113 tok/s respectivamente.
- Red: los nodos no necesitan copia del modelo; el nodo cabeza envia a cada nodo su parte de los pesos por red y la cachea localmente. Con dos pares de puertos RoCE activos se selecciona el enlace con `--rdma-dev`.
- Configuracion de referencia: `--max-seq-len 262144`, `--max-batch 2`, `--max-tokens 65536`, `--prefix-cache on`, `--mtp=auto`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-EXL3-2.68bpw-DotH-MTP (este) | 23,2 mil millones | 262.144 | EXL3 2,68 bpw + cabeza MTP | Qwen Community 1.0 | Hugging Face |
| doth4580/Qwen3.8-Flash-Next-EXL3-3.68bpw | no disponible (mismo modelo base) | no disponible | EXL3 3,68 bpw | Qwen Community 1.0 | Hugging Face |
| doth4580/Qwen3.8-Flash-Next-DotH-MTP-MXFP8 | no disponible (mismo modelo base) | no disponible | MXFP8 | Qwen Community 1.0 | Hugging Face |
| Qwen/Qwen3.8-Flash-Next (original) | no disponible | no disponible | BF16 | Qwen Community 1.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada. La diferencia principal entre el paquete a 2,68 bpw y el de 3,68 bpw es el tamano y, previsiblemente, la fidelidad de los pesos; la variante MXFP8 ofrece mayor precision a costa de mas memoria. El modelo original en BF16 sirve como referencia de calidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo de lenguaje de proposito general, es probable que herede los sesgos de sus datos de entrenamiento, pero no se aportan datos concretos.
- Riesgo de alucinacion: no evaluado en la informacion disponible; la decodificacion especulativa no introduce errores adicionales porque cada token es verificado por el modelo completo.
- Limitacion de contexto: la ventana de 262.144 tokens es la configuracion probada; superarla no esta soportado en la configuracion de referencia.
- Idiomas: no se especifican los idiomas soportados; la model card no documenta cobertura linguistica.
- Licencia: Qwen Community License 1.0; es necesario revisar sus terminos para uso comercial, ya que puede imponer restricciones adicionales a las de una licencia permisiva estandar.
- Cuantizacion agresiva: 2,68 bpw es una cuantizacion de muy baja precision; puede degradar la calidad frente al modelo en BF16 o a la variante de 3,68 bpw, aunque no se aportan mediciones de perplejidad o benchmarks que lo cuantifiquen.
- Hardware especifico: el paquete esta probado unicamente en veloGB10 sobre GB10; el soporte en otros motores o GPUs no esta verificado.
- Madurez: el repositorio tiene cero descargas y cero likes, y las pruebas se hicieron con builds de desarrollo (veloGB10 0.7.7); una sola ejecucion por celda con ±10 % de variacion por muestreo.
- Propiedad intelectual: el autor no reclama derechos sobre el modelo, los pesos, la arquitectura ni la documentacion original; los derechos permanecen con los autores originales y contribuyentes bajo sus respectivas licencias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-2.68bpw-DotH-MTP
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Paquete base sin cabeza MTP: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-2.68bpw
- Cuantizacion EXL3 de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Cabeza MTP en BF16: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
- Cabezas MTP optimizadas de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Motor veloGB10: https://github.com/sf-stav/veloGB10
- exllamav3: https://github.com/turboderp-org/exllamav3
- Variante EXL3 a 3,68 bpw: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-3.68bpw
- Variante MXFP8: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-MXFP8
