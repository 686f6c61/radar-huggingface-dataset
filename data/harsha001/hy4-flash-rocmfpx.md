# Harsha001/Hy4-flash-ROCmFPX

## Resumen

Hy4-flash ROCmFPX es una colección de cuantizaciones GGUF de tipo "hardware-aware" del modelo tencent/Hy4-flash, publicada por el usuario Harsha001. No se trata de un modelo entrenado desde cero, sino de una redistribución cuantizada pensada específicamente para ejecutar un modelo de mezcla de expertos (MoE) de gran tamaño en hardware AMD consumer y de gama alta, en concreto el APU Ryzen AI Max+ 395 (Strix Halo) con 128 GB de memoria unificada, de los cuales 96 GB se configuran como memoria de GPU.

El modelo base, Hy4-flash, es un transformer MoE de 220 000 millones de parámetros totales, de los cuales 64 000 millones corresponden a una tabla de búsqueda denominada Engram y 12 000 millones se activan por token. Tiene 42 capas y 512 expertos con enrutamiento top-16. Esta distribución permite que el coste computacional por token sea mucho menor que el de un modelo denso equivalente, mientras que la tabla Engram se consulta por filas y puede residir en CPU o SSD sin ocupar VRAM.

La relevancia de esta ficha radica en que demuestra una estrategia de despliegue viable para modelos MoE de escala frontier en equipos de un solo nodo con memoria unificada, usando formatos de cuantización propios (ROCmFPX) y una bifurcación específica de llama.cpp. La información disponible es limitada: no hay datos de benchmarks publicados, no se detallan los idiomas soportados y el repositorio no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con tabla Engram (arquitectura `hy_v4_flash` en llama.cpp) |
| Parametros totales | 220B (incluye 64B de tabla Engram) |
| Parametros activos | 12B por token |
| Longitud de contexto | 65 536 tokens en el ejemplo de ejecución (`-c 65536`); no se especifica el máximo del modelo base |
| Tipos de cuantizacion | Q4_0_ROCMFP4_STRIX_O8 (expertos ROCmFP4, resto Q8_0_ROCMFPX); Q4_0_ROCMFP4_FAST_O8; Q6_K_ROCMFPX; Q8_0_ROCMFPX; tabla Engram en Q4_0 o Q8_0 |
| Idiomas soportados | no disponible (la model card indica "English first") |
| Licencia | Tencent Hy License, Version 1.0 (derivada de Apache 2.0 con términos comerciales adicionales en la sección 10) |
| Formato de pesos | GGUF dividido en partes de hasta 45 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 42 capas y 512 expertos, con enrutamiento top-16, lo que resulta en 12 000 millones de parámetros activos por token sobre un total de 220 000 millones. Una parte sustancial del total (64 000 millones) corresponde a la tabla Engram, un componente de búsqueda por filas que se consulta una vez por token y que, por su patrón de acceso, no necesita residir en memoria de GPU. Esta es la clave que hace viable el despliegue en un único Strix Halo: la parte que sí debe estar en GPU se reduce a 84,7 GiB en la cuantización recomendada de 4 bits.

Las cuantizaciones se generaron con una matriz de importancia derivada de texto agéntico: ejecuciones de agentes de código, llamadas a herramientas, function calling y tareas de shell y bases de datos, renderizadas con la plantilla de chat del propio modelo e incluyendo los esquemas de herramientas. Esto significa que los cuantizadores están optimizados para trabajo agéntico y de código, no para generación de prosa. Se aplicaron escalas de tensor ROCmFPX y se mantuvo el embedding de tokens en Q8_0. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable mediante `reasoning_effort` (`high` para thinking, valor por defecto, o `no_think`).
- Soporte de tool calling y function calling, con plantilla de chat compatible con esquemas de herramientas (`--jinja`).
- Orientación a flujos agénticos: ejecución de tareas de código, shell y bases de datos en múltiples pasos.
- Cuantizaciones calibradas específicamente con datos de agentes de código, lo que favorece el rendimiento en ese dominio.
- Capacidad multilingüe: no disponible; la model card indica prioridad al inglés.
- Visión: no incluida en esta distribución (el codificador visual del modelo base no está presente).
- Decodificación especulativa: no incluida (el drafter DFly2 no está presente en estos ficheros).

## Casos de uso

- Agentes de código en local: el modelo puede ejecutar bucles de razonamiento multi-paso con llamadas a herramientas sobre un contexto de 65 536 tokens, adecuado para refactorizaciones y tareas de reparación de código en un equipo de sobremesa con Strix Halo.
- Automatización de operaciones de shell: gracias al calibrado con tareas de shell y bases de datos, es adecuado para agentes que interpretan salidas de terminal y ejecutan comandos correctivos.
- Asistente de function calling en pipelines internos: la plantilla con esquemas de herramientas permite integrarlo como planificador que decide qué API invocar en flujos de automatización.
- Prototipado de agentes sobre hardware AMD consumer: permite validar comportamiento agéntico de un MoE de 220B sin acceso a clústeres, manteniendo la tabla Engram en CPU o SSD mediante mmap.
- Evaluación de cuantizaciones para despliegue: los cuatro niveles (Q4_0, Q4_0 FAST, Q6_K, Q8_0) permiten comparar calidad frente a requisitos de memoria en el mismo hardware.
- Servicio de inferencia de un solo nodo con llama-server: el binario con soporte Vulkan o ROCm/HIP expone una API compatible con OpenAI para integrarse en aplicaciones existentes.
- Procesamiento de documentos largos en inglés: el contexto de 65 536 tokens permite resumir o extraer información de documentos extensos, aunque sin garantías multilingües.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los números de calidad sobre conversaciones agénticas reservadas (solo tokens del asistente) se añadirán más adelante, y que todos los ficheros superaron una prueba de humo antes de la subida. No se deben inferir cifras de MMLU, HumanEval o GSM8K a partir de esta ficha.

## Requisitos de hardware

- VRAM estimada para la parte de GPU según cuantización: 84,7 GiB (Q4_0_ROCMFP4_STRIX_O8), 80,4 GiB (Q4_0_ROCMFP4_FAST_O8), aproximadamente 117 GiB (Q6_K_ROCMFPX) y aproximadamente 149 GiB (Q8_0_ROCMFPX).
- La tabla Engram se mantiene fuera de la GPU: 33 GiB en Q4_0 o 63 GiB en Q8_0, en CPU o SSD mediante mmap.
- GPU recomendadas: AMD Ryzen AI Max+ 395 (Strix Halo, 128 GB, 96 GB configurados como memoria de GPU) para las variantes de 4 bits; para Q6_K se requieren dos Strix Halo o GPUs de clase MI; para Q8_0, GPUs de clase MI300 como referencia.
- No cabe en GPUs consumer convencionales (RTX 4090, 24 GB); el diseño está pensado para memoria unificada de gran capacidad.
- Opciones de despliegue: bifurcación ROCmFPX de llama.cpp, rama `hy4-flash`, compilada con Vulkan o ROCm/HIP; se usa `llama-server` con `-ngl 99`, `-ot "per_layer_token_embd=CPU"`, `-c 65536` y `--jinja`. No se menciona soporte en vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos, y el modelo base (tencent/Hy4-flash) no cuenta con cifras publicadas en esta ficha. Cualquier comparación cuantitativa sería especulativa.

## Limitaciones y advertencias

- No hay benchmarks publicados: la calidad real de estas cuantizaciones frente al modelo base en precisión completa no está documentada.
- Las cuantizaciones están calibradas con datos agénticos y en inglés; el rendimiento en prosa, otros dominios o idiomas distintos del inglés puede degradarse de forma no medida.
- La licencia Tencent Hy License 1.0 deriva de Apache 2.0 pero añade términos comerciales para grandes negocios de Model-as-a-Service (sección 10); es necesario revisar el fichero LICENSE antes de un uso comercial.
- El modelo base puede presentar sesgos y alucinaciones propios de los modelos de lenguaje; no se documentan evaluaciones de seguridad ni de sesgo.
- Esta distribución no incluye visión ni decodificación especulativa, por lo que no reproduce todas las capacidades del modelo original.
- El despliegue requiere una bifurcación no estándar de llama.cpp; no hay garantía de compatibilidad con versiones upstream ni con otros runtimes.
- El repositorio no registra descargas ni valoraciones, y la model card advierte de que los datos de calidad están pendientes; conviene tratarlo como una publicación experimental.
- El contexto máximo real del modelo base no se especifica; el valor de 65 536 corresponde al ejemplo de ejecución.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/Hy4-flash-ROCmFPX
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Repositorio ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
