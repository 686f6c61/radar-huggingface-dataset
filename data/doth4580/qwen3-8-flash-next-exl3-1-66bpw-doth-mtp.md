# doth4580/Qwen3.8-Flash-Next-EXL3-1.66bpw-DotH-MTP

## Resumen

Qwen3.8-Flash-Next-EXL3-1.66bpw-DotH-MTP es un paquete de pesos cuantizados del modelo Qwen3.8-Flash-Next, desarrollado originalmente por el equipo Qwen, redistribuido por el usuario doth4580. La cuantización propiamente dicha la realiza turboderp con la herramienta exllamav3, en la variante `1.66bpw_h4_ng3`, y el paquete añade una cabeza de borrador (draft head) para decodificación especulativa denominada DotH-MTP. El resultado es un artefacto de inferencia de aproximadamente 15.137 millones de parámetros en formato EXL3, con un tamaño de repositorio de 50,3 GB.

El modelo subyacente es un transformer de tipo mezcla de expertos (MoE), tal como indican las etiquetas del repositorio (`moe`) y la presencia de una capa MTP con expertos enrutados. La información disponible no detalla el número de parámetros activos ni la composición exacta de los expertos. El paquete está pensado principalmente para el motor de inferencia veloGB10 sobre una, dos o cuatro máquinas NVIDIA DGX Spark / GB10, aunque al emplear el formato estándar EXL3 de ExLlamaV3 puede cargarse en cualquier framework compatible con dicho formato.

La relevancia de esta ficha radica en que documenta un caso de cuantización agresiva a 1,66 bits por peso combinada con decodificación especulativa, una combinación orientada a maximizar el rendimiento en hardware de gama workstation con memoria unificada. El paquete incluye métricas de rendimiento medidas con veloGB10 en configuraciones de uno, dos y cuatro nodos, lo que permite evaluar su viabilidad en despliegues multi-nodo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con capa MTP; formato de pesos EXL3 (ExLlamaV3) |
| Parametros totales | 15.137.247.488 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configurado en los comandos de ejemplo con `--max-seq-len 262144`) |
| Tipos de cuantizacion | EXL3 a 1,66 bpw, variante `1.66bpw_h4_ng3` (turboderp) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors en formato EXL3 (ExLlamaV3) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos según las etiquetas del repositorio. La información disponible no especifica el número de capas, la dimensión oculta, el número de expertos por capa ni el número de parámetros activos por token. El paquete incorpora además una capa MTP (multi-token prediction) con expertos enrutados propios del pack cuantizado, y una cabeza de borrador separada compuesta por 59 tensores no-expertos.

Sobre el entrenamiento del modelo original no se proporcionan datos en la información disponible: no se indica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Respecto a la cabeza de borrador DotH-MTP, el autor indica que es una versión re-destilada de su propia cabeza MTP en BF16, cuantizada con exllamav3 1.5.3 al formato y anchuras de la cabeza optimizada de HermiHg (licencia Apache-2.0); la proyección del indexador se toma sin cambios de los bytes de HermiHg. La innovación técnica destacable es la decodificación especulativa con verificación completa: cada token propuesto por la cabeza es validado por el modelo completo, de modo que la cabeza afecta únicamente a la velocidad y nunca a la salida.

## Capacidades

- Generación de texto y conversación multi-turno con contexto largo de hasta 262.144 tokens.
- Razonamiento con modo "thinking" activado en las pruebas de rendimiento publicadas.
- Generación de código, evidenciada por la métrica de decodificación en "code turn" del banco de pruebas del autor.
- Decodificación especulativa mediante cabeza MTP integrada, activable con `--mtp=auto` en veloGB10.
- Servicio compatible con la API de OpenAI (`/v1`) a través de veloGB10.
- Soporte de caché de prefijos (`--prefix-cache on`) para reutilización de contexto.
- Despliegue multi-nodo con paralelismo tensorial (TP=1, TP=2, TP=4) y transporte RDMA/RoCE.
- Capacidades multilingües: no disponible en la información proporcionada.
- Soporte de tool calling, function calling y agentes: no disponible en la información proporcionada.

## Casos de uso

- Servicio de inferencia compatible con OpenAI en DGX Spark: el paquete se sirve con veloGB10 exponiendo un endpoint `/v1`, lo que permite sustituir directamente APIs de OpenAI en aplicaciones existentes sin cambiar el código cliente.
- Procesamiento de documentos largos: con 262.144 tokens de contexto configurados, el modelo puede ingerir expedientes, bases de código o transcripciones extensas en una sola petición sin fragmentación.
- Generación de código asistida: los benchmarks del autor miden específicamente turnos de código (117 tok/s en TP=1, 185 tok/s en TP=4), lo que lo hace adecuado para asistentes de programación interactivos donde la latencia de decodificación es crítica.
- Despliegue en clúster de bajo coste con memoria unificada: al ejecutarse en una, dos o cuatro GB10 con reparto de pesos por red y caché local en los nodos, permite escalar el throughput sin duplicar el almacenamiento del modelo en cada máquina.
- Prototipado e investigación sobre cuantización extrema: el pack sirve como referencia reproducible de cuantización a 1,66 bpw con decodificación especulativa, útil para estudiar la degradación de calidad frente al modelo BF16 original.
- Chat conversacional de larga duración: la combinación de contexto de 262k tokens y caché de prefijos reduce el coste de mantener sesiones prolongadas con historial acumulado.
- Evaluación comparativa de cabezas de borrador: al incluir la cabeza DotH-MTP con una tasa de aceptación medida del 70 %, permite comparar estrategias de decodificación especulativa sobre los mismos pesos base.

## Benchmarks y rendimiento

Datos medidos por el autor con veloGB10 0.7.7 (builds de desarrollo) sobre máquinas GB10 clase DGX Spark, el 2026-11-05, con muestreo de producción, thinking activado y una petición simultánea en las columnas de petición única. La decodificación se expresa en tokens de salida por segundo e incluye decodificación especulativa. Una ejecución por celda; variación aproximada de ±10 %.

| Topologia | Fuente del borrador | Decode turno de codigo | Decode turno de relato | Mediana decode todos los turnos | Prefill (tok/s) | 2 peticiones, agregado | Aceptacion del borrador |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | Cabeza DotH-MTP | 117 | 63 | 78 | 1.786 | 106 | 70,3 % |
| TP=2 | Cabeza DotH-MTP | 150 | 87 | 123 | 2.854 | 159 | 69,5 % |
| TP=4 | Cabeza DotH-MTP | 185 | 107 | 125 | 3.360 | 153 | 70,0 % |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 50,3 GB, por lo que se requiere al menos esa cantidad de memoria disponible para los pesos; con contexto de 262.144 tokens y caché KV hay que añadir memoria adicional no cuantificada en la información disponible.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuraciones de uno, dos o cuatro nodos con paralelismo tensorial.
- Cabe en GPU de consumo: no disponible en la información proporcionada; el pack está orientado a hardware GB10 con memoria unificada.
- Opciones de despliegue: veloGB10 (`gb10_inference`) es el motor probado y soportado por el autor; al ser formato EXL3 estándar, cualquier framework que lea ExLlamaV3 podría cargarlo, aunque no se documenta su funcionamiento en otros motores.
- Throughput medido: 78 tok/s de mediana en TP=1, 123 tok/s en TP=2 y 125 tok/s en TP=4; prefill de 1.786, 2.854 y 3.360 tok/s respectivamente.
- Concurrencia: los comandos de ejemplo fijan `--max-batch 2`, con 106 tok/s agregados en TP=1 y 159 tok/s en TP=2 para dos peticiones simultáneas.
- Red multi-nodo: los nodos no requieren copia del modelo; el nodo cabeza envía a cada nodo su parte de los pesos y la conserva en caché local. Se admite selección de interfaz RDMA con `--rdma-dev`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este pack (EXL3 1.66bpw + DotH-MTP) | 15.137.247.488 | 262.144 | EXL3 1,66 bpw | qwen-community-1.0 | Hugging Face, 2 descargas |
| doth4580/Qwen3.8-Flash-Next-EXL3-1.66bpw | mismos pesos sin cabeza de borrador | 262.144 (configurable) | EXL3 1,66 bpw | qwen-community-1.0 | Hugging Face |
| doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16 | no disponible | no disponible | BF16 | qwen-community-1.0 | Hugging Face |
| Qwen/Qwen3.8-Flash-Next (original) | no disponible | no disponible | safetensors originales | qwen-community-1.0 | Hugging Face |

La diferencia principal frente al pack sin cabeza de borrador es exclusivamente de velocidad: los pesos son idénticos y la cabeza solo añade decodificación especulativa con verificación completa. Frente al modelo original en BF16, este pack reduce el espacio de almacenamiento a 50,3 GB mediante cuantización a 1,66 bpw, con la contrapartida de una posible pérdida de calidad no cuantificada en la información disponible.

## Limitaciones y advertencias

- La cuantización a 1,66 bpw es extremadamente agresiva; no se publican evaluaciones de calidad (perplejidad, benchmarks) frente al modelo BF16, por lo que la degradación es desconocida.
- La cabeza de borrador no altera la salida, pero su tasa de aceptación del ~70 % implica que aproximadamente un 30 % de los tokens propuestos se descartan, con el coste de cómputo asociado.
- Los benchmarks publicados son una sola ejecución por celda, con variación de ±10 %, sobre builds de desarrollo de veloGB10; no deben tratarse como cifras estables de producción.
- El pack está probado únicamente con veloGB10; el rendimiento en otros motores EXL3 no está documentado.
- El autor no reclama propiedad intelectual sobre el modelo, los pesos ni la arquitectura; todos los derechos permanecen en los autores originales y contribuyentes bajo sus respectivas licencias.
- La licencia Qwen Community License 1.0 puede imponer restricciones al uso comercial; debe consultarse el texto completo antes de un despliegue productivo.
- No se dispone de información sobre sesgos, idiomas soportados ni riesgo de alucinación específica de este modelo.
- El número de descargas (2) y de likes (0) indica una adopción muy temprana y escasa validación por parte de la comunidad.
- El repositorio tiene 50,3 GB, lo que exige planificación de almacenamiento y transferencia, especialmente en despliegues multi-nodo.

## Enlaces

- Repositorio del pack: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-1.66bpw-DotH-MTP
- Pack base sin cabeza de borrador: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-EXL3-1.66bpw
- Cabeza MTP en BF16 del autor: https://huggingface.co/doth4580/Qwen3.8-Flash-Next-DotH-MTP-BF16
- Cuantizaciones EXL3 de turboderp: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Cabezas MTP optimizadas de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- Herramienta de cuantización exllamav3: https://github.com/turboderp-org/exllamav3
