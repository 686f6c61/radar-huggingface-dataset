# alesha-pro/Hy4-flash-Uncensored-GGUF

## Resumen

Hy4-flash Uncensored GGUF es una cuantización comunitaria del modelo Hy4-flash de Tencent, un transformer de tipo mezcla de expertos (MoE) con 222.679.844.717 parámetros totales, capacidad de entrada de imagen y una ventana de contexto de 262.144 tokens. La versión publicada por alesha-pro mantiene los pesos originales, pero incorpora un vector de direcciones de rechazo (abliteration) que el motor de inferencia proyecta fuera del flujo residual durante la ejecución, eliminando la mayor parte de las negativas del modelo base. Se distribuye en formato GGUF con dos niveles de cuantización (Q3_K e IQ2_XXS) pensados para ejecutarse en configuraciones de 1, 2 o 4 tarjetas RTX 3090.

El interés de esta ficha es doble. Por un lado, documenta una de las pocas rutas prácticas para servir un MoE de más de 220.000 millones de parámetros con contexto completo de 256K en hardware de consumo, gracias a una tabla "Engram" separada que puede residir en NVMe. Por otro, ilustra una técnica de modificación de comportamiento (eliminación de rechazos mediante vectores medidos por capa) que no altera los pesos y que, según el autor, conserva el token superior del modelo original en el 85,7 % de las posiciones en texto largo. El modelo requiere un fork específico del motor (Project Maya, rama `hy4-flash`); llama.cpp estándar no lo carga.

La licencia es la Tencent Hy License 1.0, derivada de Apache 2.0 con cláusulas adicionales para grandes negocios de Model-as-a-Service, lo que condiciona el uso comercial a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con capas de hiperconexión (cuatro flujos), capa MTP y torre de visión; motor de inferencia Project Maya |
| Parametros totales | 222.679.844.717 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q3_K (expertos Q3_K/Q4_K, atención Q8_0, capa MTP Q3_K/Q8_0) e IQ2_XXS (expertos IQ2); torre de visión en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License, Version 1.0 (derivada de Apache 2.0 con términos adicionales en la sección 10 para grandes negocios de Model-as-a-Service) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de Tencent con 222.679.844.717 parámetros totales, cuatro flujos de hiperconexión por capa, una capa de predicción multi-token (MTP) en el bloque 42 y una torre de visión que habilita la pipeline `image-text-to-text`. La ventana de contexto alcanza los 262.144 tokens. La model card de esta cuantización no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos corresponden a la documentación de Tencent y no están incluidos en la información disponible.

La innovación técnica principal de esta publicación es la separación de la tabla "Engram" (63,4 GB) del tronco del modelo, lo que permite mantenerla en NVMe y reducir el requisito de RAM en la configuración de una sola GPU. Además, el autor recuantiza la capa MTP (`blk.42`, 21 tensores) de BF16 a Q3_K/Q8_0/F32 para que quepa junto al contexto de 256K en tarjetas de 24 GB, y fusiona los expertos enrutados IQ2 de otra cuantización (AtomicChat, revisión `dc1525fe`) copiando byte a byte 123 tensores de las capas 1 a 41. El componente "uncensored" no modifica pesos: es un fichero de 0,004 GB con direcciones de rechazo por capa y por cada uno de los cuatro flujos de hiperconexión, que el motor resta del flujo residual cuando la variable `HY4F_ABLATE` está activa.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Entrada de imagen y texto (`image-text-to-text`) mediante la torre de visión incluida en `mmproj-Hy4-flash-bf16.gguf`.
- Razonamiento con modo "thinking" activable (el autor reporta métricas separadas con thinking on y off).
- Predicción multi-token (MTP) para decodificación especulativa interna.
- Servidor compatible con la API de chat de OpenAI en `/v1`.
- Comportamiento "uncensored": eliminación de la mayoría de rechazos mediante proyección de vectores, con `HY4F_ABLATE` activado en las configuraciones incluidas.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentos extensos con imagen: el contexto de 262.144 tokens y la torre de visión permiten procesar informes con tablas y figuras en una sola pasada, sin trocear el documento.
- Asistencia conversacional de largo recorrido: sesiones multi-turno que acumulan decenas de miles de tokens se mantienen dentro de la ventana sin resumen intermedio.
- Investigación sobre alineación y robustez: la pareja modelo base / vector de abliteración permite comparar respuestas con y sin direcciones de rechazo sobre el mismo sustrato de pesos, con métricas de KL y coincidencia de token superior reportadas por el autor.
- Despliegue en laboratorio con GPUs de consumo: con 2× RTX 3090 en Q3_K se obtienen 70-104 tok/s de decodificación y 1.225 tok/s de prefill, suficiente para prototipos interactivos.
- Procesamiento por lotes de alto rendimiento: con 4× RTX 3090 en Q3_K el modelo alcanza 176-251 tok/s de decodificación y 2.947 tok/s de prefill, adecuado para generación masiva de texto.
- Escenarios con restricciones de memoria: la configuración de 1× RTX 3090 con IQ2 y Engram en NVMe consume 45 GiB de RAM y ofrece 54-68 tok/s, útil para entornos donde la VRAM es el cuello de botella.
- Evaluación de cuantizaciones: los ficheros `routing-profile*.txt` y los scripts de `tools/` permiten reproducir el perfil de enrutamiento de expertos y medir el impacto de cada nivel de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor indica explícitamente que no dispone de benchmarks de tarea propios. Sí se publican métricas de rendimiento de inferencia y de fidelidad de la cuantización:

| Configuracion | Decodificacion (tok/s) | Prefill (tok/s) | RAM |
|---|---:|---:|---:|
| 4× RTX 3090, Q3_K | 176-251 | 2.947 | ~60 GiB |
| 2× RTX 3090, Q3_K | 70-104 | 1.225 | 137 GiB |
| 2× RTX 3090, IQ2 | 95-123 | 1.999 | no disponible |
| 1× RTX 3090, Q3_K | 37-54 | 1.510 | 137 GiB (78 GiB con Engram en NVMe) |
| 1× RTX 3090, IQ2, Engram en NVMe | 54-68 | 1.184-1.199 | 45 GiB |

| Metrica de fidelidad | Valor |
|---|---|
| Coincidencia de token superior, 2 tarjetas Q3_K frente a 4 tarjetas Q3_K | 88,3 % |
| Coincidencia de token superior, 1 tarjeta Q3_K frente a 4 tarjetas Q3_K | 88,5 % |
| Coincidencia de token superior, expertos IQ2 | 74-76 % |
| Coincidencia de token superior, uncensored frente a stock en texto largo | 85,7 % (dos ejecuciones stock coinciden en 88,3 %) |
| KL mediana, uncensored frente a stock | 0,014 |

| Rechazos en conjuntos retenidos (juzgados por el modelo stock) | Stock | Uncensored |
|---|---:|---:|
| AdvBench 64 + JailbreakBench 82, thinking off | 139 | 32 |
| AdvBench 24, thinking on | 22 | 3 |
| Peticiones inocuas 64 | 1 | 0 |

## Requisitos de hardware

- VRAM y RAM: Q3_K completo ocupa 150 GB en disco y requiere alrededor de 60 GiB de RAM con 4× RTX 3090, o 137 GiB con 2× y 1× RTX 3090. La configuración de 1× RTX 3090 con IQ2 y Engram en NVMe baja a 45 GiB de RAM.
- GPUs recomendadas: RTX 3090 (arquitectura sm_86, la compilación documentada usa `CMAKE_CUDA_ARCHITECTURES=86`). No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en 1, 2 o 4 RTX 3090 según cuantización y modo de Engram.
- Despliegue: exclusivamente mediante el fork Project Maya, rama `hy4-flash` (`maym-hy4f`), con servidor OpenAI-compatible en `/v1`. llama.cpp estándar no carga el modelo. Los scripts de conversión y fusión están en `tools/`.
- Almacenamiento: conviene NVMe para el modo de 1 tarjeta, ya que la tabla Engram (63,4 GB) se lee desde disco con `HY4F_ENGRAM_IO=direct`.
- Latencia y throughput: ver tabla de benchmarks; el prefill varía entre 1.184 y 2.947 tok/s según configuración.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Hy4-flash Uncensored GGUF (esta ficha) | 222.679.844.717 | 262.144 | Sí | Tencent Hy License 1.0 | GGUF (Q3_K, IQ2_XXS) | Requiere Project Maya; abliterado |
| tencent/Hy4-flash (base) | 222.679.844.717 | 262.144 | Sí | Tencent Hy License 1.0 | safetensors | Sin modificar; sin vector de rechazo |
| AngelSlim/Hy4-flash-GGUF | no disponible | no disponible | no disponible | Tencent Hy License 1.0 | GGUF | Origen del tronco Q3_K y de la tabla Engram |
| AtomicChat/Hy4-flash-GGUF | no disponible | no disponible | no disponible | Tencent Hy License 1.0 | GGUF | Origen de los expertos IQ2 (rev `dc1525fe`) |

No se dispone de datos de benchmarks comparativos entre estas variantes más allá de las métricas de coincidencia de token y rechazos recogidas en las secciones anteriores.

## Limitaciones y advertencias

- La eliminación de rechazos es parcial: quedan 32 negativas en el conjunto combinado AdvBench + JailbreakBench con thinking off, y 3 en AdvBench 24 con thinking on. No debe asumirse un comportamiento completamente sin filtros.
- El autor advierte que la abliteración aleja la distribución del modelo base: la coincidencia de token superior cae al 85,7 % en texto largo, con KL mediana de 0,014. Puede degradar tareas que dependían del comportamiento original.
- La cuantización IQ2_XXS se aleja más del base (74-76 % de coincidencia de token superior) y no debería usarse cuando la fidelidad sea prioritaria.
- Sesgos conocidos: no disponibles en la información proporcionada; al ser un modelo base de Tencent sin documentación de alineación en esta ficha, deben evaluarse empíricamente antes de producción.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Restricciones de licencia: la Tencent Hy License 1.0 incluye términos adicionales en la sección 10 para grandes negocios de Model-as-a-Service. El uso comercial a gran escala requiere revisión legal.
- Dependencia de un fork no estándar: llama.cpp estándar no carga el modelo; la compilación requiere Project Maya y la arquitectura CUDA 86 está fijada en la documentación.
- El repositorio ocupa 201,7 GB; hay que descargar un conjunto completo de dos ficheros (Q3_K de 150 GB o IQ2_XXS de 115 GB), no ficheros sueltos.
- No hay benchmarks de tarea publicados por el autor, por lo que la calidad en MMLU, HumanEval o GSM8K no está verificada de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alesha-pro/Hy4-flash-Uncensored-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Cuantización Q3_K original: https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- Expertos IQ2 originales: https://huggingface.co/AtomicChat/Hy4-flash-GGUF
- Motor Project Maya (rama `hy4-flash`): https://github.com/alesha-pro/project-maya/tree/hy4-flash
- Documentación de Hy4-flash en Project Maya: https://github.com/alesha-pro/project-maya/blob/hy4-flash/docs/HY4-FLASH.md
- Proyecto Maya original: https://github.com/mw00/project-maya
- Strata (origen del motor): https://github.com/Niko1221/Strata
- llama.cpp y ggml: https://github.com/ggml-org/llama.cpp
