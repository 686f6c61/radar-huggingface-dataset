# chenyumo/MoziAier-27B-TQ

## Resumen

MoziAier 27B-TQ es un modelo de lenguaje denso de 27.000 millones de parámetros publicado por el usuario chenyumo en Hugging Face, distribuido como cuantización ternaria (pesos restringidos a los valores -1, 0 y +1) en formato GGUF y pensado para inferencia local con llama.cpp. Se deriva del modelo base Qwen/Qwen3.8-27B mediante un proceso de cuantización ternaria post-entrenamiento (contenedor PTQ1.0), tomando los pesos ternarios de PrismML Ternary-Bonsai-2.5-27B. Su propuesta central es reducir el peso de los pesos principales a 5,80 GiB para poder ejecutar una ventana de contexto de hasta 256K tokens en una única GPU de 16 GB.

El modelo incorpora capas adicionales de ajuste orientadas a agentes: un esquema de razonamiento estructurado en "siete dimensiones" que se despliega según la complejidad de la tarea, un bucle de agente (ejecutar, evaluar, ajustar, verificar), formato explícito de llamadas a herramientas y una capa MTP (multi-token prediction) conservada en Q5_0 que, según el autor, aporta una aceleración de decodificación especulativa del 29,4 % (de 47,3 a 61,2 tok/s). También admite entrada visual mediante un proyector mmproj separado en Q8_0.

Es relevante ahora porque combina tres tendencias prácticas: cuantización extrema por debajo de 4 bits, contextos ultra largos en hardware de consumo y decodificación especulativa integrada. No obstante, requiere una compilación específica de llama.cpp (linaje Prism) y los datos de rendimiento publicados proceden únicamente del autor, sin benchmarks estándar independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8-27B), 65 capas incluyendo capa MTP, atención GQA con 24 cabezas y 4 cabezas KV, dimensión oculta 5.120, FFN 17.408 |
| Parametros totales | 27B (denso); el campo de parámetros de safetensors del repo indica 460.730.096, dato no coherente con la cifra declarada por el autor |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Hasta 262.144 tokens (256K) |
| Tipos de cuantizacion | Ternaria (-1 / 0 / +1), contenedor PTQ1.0 (tipo GGUF 143); capa MTP en Q5_0; proyector visual en Q8_0; KV cache en q4_0 |
| Idiomas soportados | Chino (zh) e inglés (en), con prioridad declarada al chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos principales de 6.232.822.464 bytes (5,80 GiB) más mmproj Q8_0 de 600 MB |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso heredado de Qwen3.8-27B, con 65 capas (una de ellas correspondiente a la cabeza MTP), atención con grouped-query attention (24 cabezas de consulta y 4 de clave/valor), dimensión oculta de 5.120 y FFN de 17.408. Sobre esa base, el autor aplica una cuantización ternaria post-entrenamiento en la que los pesos principales toman únicamente los valores -1, 0 y +1, empaquetados en el contenedor PTQ1.0 (tipo GGUF 143). Los pesos ternarios proceden de PrismML Ternary-Bonsai-2.5-27B, también Apache-2.0, según declara el autor.

No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO sobre el modelo base. La innovación técnica destacable es la conservación de la capa MTP cuantizada en Q5_0 para habilitar decodificación especulativa en llama.cpp (`--spec-type draft-mtp`), con una tasa de aceptación reportada del 57,19 % y una ganancia de velocidad del 29,4 % en el hardware de prueba del autor. El ajuste de comportamiento (pensamiento en siete dimensiones, bucle de agente, formato de tool calling) se describe en la model card, pero no se especifica la metodología exacta de alineamiento empleada.

## Capacidades

- Generación de texto y razonamiento estructurado con un esquema propio de "siete dimensiones" que se despliega en 2, 5 o 7 dimensiones según la complejidad estimada de la tarea.
- Bucle de agente iterativo (ejecución, evaluación, ajuste, verificación) con reglas de salida y criterios de convergencia para evitar bucles infinitos.
- Llamadas a herramientas (tool calling / function calling) con un formato de salida pensado para que marcos de agentes lo analicen directamente.
- Procesamiento de contexto largo de hasta 256K tokens, apto para libros completos, contratos extensos o bases de código medianas.
- Entrada visual a través del proyector mmproj Q8_0: preguntas sobre capturas de pantalla, lectura de gráficos y comprensión de documentos escaneados.
- Decodificación especulativa MTP con ganancia de rendimiento declarada en este modelo.
- Bilingüe chino-inglés, con preferencia por el chino.
- Comportamiento orientado a evitar fabricaciones en preguntas sobre hechos no verificables (responde que no dispone del dato) y a exigir búsqueda en línea para consultas sensibles al tiempo, siempre que se conecte una herramienta externa.

## Casos de uso

- Análisis de documentos extensos en local: con 256K tokens de contexto y 12,9 GB de VRAM en la configuración de 256K, permite procesar contratos, informes anuales o libros completos en una sola pasada sin fragmentación, manteniendo los datos en la máquina.
- Asistente de atención al cliente multi-turno: el formato estructurado de tool calling y el bucle de agente permiten encadenar consultas a sistemas internos (pedidos, incidencias) y mantener conversaciones largas con historial extenso dentro de la ventana de contexto.
- Automatización de agentes de larga duración: el bucle con criterios de aceptación por fase y reglas anti-bucle encaja en flujos de trabajo por etapas (investigación, redacción, revisión) donde se necesita que el modelo verifique su propio progreso.
- Comprensión de documentos escaneados y capturas: con el proyector mmproj se pueden extraer datos de facturas, gráficos o pantallas de aplicación, útil en digitalización de archivos y soporte técnico.
- Generación y revisión de código en pipelines internos: el soporte de tool calling permite integrarlo en herramientas de CI/CD o asistentes de repositorio, aunque el contexto de 128K-256K es más adecuado para revisiones de módulos que para repositorios completos.
- Despliegue privado en una sola GPU de 16 GB: equipos con RTX 4080/4090 o similares pueden servir el modelo con contexto de 100K-256K, lo que facilita prototipos y entornos de investigación sin infraestructura en la nube.
- Análisis de datos y evaluaciones de informes: la variante de razonamiento en cinco dimensiones está pensada para diagnósticos, interpretación de métricas y evaluación de propuestas con salida estructurada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento aportados por el autor son medidas de velocidad de inferencia en su propio hardware:

| Metrica | Valor | Condiciones |
|---|---|---|
| Velocidad de decodificacion con MTP | 61,2 tok/s | AMD Radeon AI PRO R9700 (32 GB), ROCm 7.13, contexto 150K |
| Velocidad de decodificacion sin MTP | 47,3 tok/s | Mismas condiciones |
| Ganancia de MTP | +29,4 % (tasa de aceptacion 57,19 %) | Medición del autor |
| Velocidad en estado estacionario | 58,19 tok/s | Contexto 150K, método de tres preguntas |
| Tiempo hasta el primer token | ~6,1 s | Contexto 150K |

## Requisitos de hardware

- VRAM estimada: aproximadamente 10,0 GB con contexto de 128K; aproximadamente 12,9 GB con contexto de 256K; aproximadamente 9,4 GB con contexto de 100K (cifras del autor con KV cache en q4_0 y Flash Attention activado).
- GPU recomendadas: el autor valida el modelo en AMD Radeon AI PRO R9700 (32 GB) con ROCm 7.13; por tamaño, una GPU de 16 GB debería bastar para la configuración de 256K según las cifras declaradas.
- Compatibilidad con GPU de consumo: sí, según el autor, en tarjetas de 16 GB; no se especifican modelos concretos de NVIDIA ni resultados medidos en ellas.
- Opciones de despliegue: llama.cpp con una compilación específica para pesos ternarios (linaje Prism, licencia MIT); la versión oficial de llama.cpp no soporta este formato según el autor. El servidor se lanza con `llama-server` y parámetros como `--flash-attn on`, `--cache-type-k q4_0`, `--cache-type-v q4_0`, `--parallel 1` y `--spec-type draft-mtp`.
- Latencia y throughput: primer token en torno a 6,1 s y 58-61 tok/s en estado estacionario con contexto de 150K en el hardware del autor; no hay datos para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoziAier 27B-TQ | 27B denso | 256K | Ternaria PTQ1.0 (5,80 GiB) | Apache-2.0 | Hugging Face y ModelScope, requiere llama.cpp modificado |
| Qwen3.8-27B (base) | 27B denso | No disponible en la informacion | Pesos originales (safetensors) | Apache-2.0 | Hugging Face (Qwen) |
| PrismML Ternary-Bonsai-2.5-27B | 27B denso | No disponible en la informacion | Ternaria | Apache-2.0 | Hugging Face (origen de los pesos ternarios) |
| Version Q4_K_M del mismo modelo | 27B denso | 256K segun el autor | Q4_K_M (13,7 GB) | Apache-2.0 | Misma familia MoziAier |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cualitativo frente a estas alternativas; la comparación disponible se limita a tamaño, contexto y licencia.

## Limitaciones y advertencias

- Los benchmarks estándar de capacidad no están publicados; las cifras de velocidad proceden de una única medición del autor en hardware AMD, por lo que no deben extrapolarse a otras GPU sin verificación.
- El modelo requiere una compilación no oficial de llama.cpp para pesos ternarios; la versión estándar no lo soporta, lo que complica el mantenimiento y la integración en producción.
- Idiomas limitados a chino e inglés; el rendimiento en castellano no está documentado y probablemente sea inferior.
- La cuantización ternaria extrema puede degradar la calidad frente al modelo base de 27B en tareas de razonamiento fino, matemáticas o código; no hay evaluaciones que cuantifiquen esta pérdida.
- Riesgo de alucinación inherente a los modelos de lenguaje; el autor declara mecanismos para rechazar respuestas sobre hechos no verificables, pero no hay validación independiente de su eficacia.
- El comportamiento de "siete dimensiones" y el bucle de agente pueden alargar las respuestas y consumir contexto adicional, lo que afecta al coste en tokens y a la latencia en tareas simples.
- La capa MTP solo aporta ganancia en este modelo según el autor; en el modelo 9B de la misma familia el efecto era negativo, lo que sugiere sensibilidad al hardware y a la configuración.
- Aunque la licencia es Apache-2.0, el uso comercial debe revisar el archivo NOTICE por la atribución a los modelos base y a los pesos ternarios de terceros.
- El campo de parámetros de safetensors del repositorio (460.730.096) no coincide con los 27B declarados, lo que conviene verificar antes de confiar en metadatos automatizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chenyumo/MoziAier-27B-TQ
- Modelo en ModelScope: https://modelscope.cn/models/chenyumo/MoziAier-27B-TQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Origen de los pesos ternarios (PrismML Ternary-Bonsai-2.5-27B): no disponible como enlace directo en la informacion proporcionada
- Repositorio de llama.cpp: no disponible en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
