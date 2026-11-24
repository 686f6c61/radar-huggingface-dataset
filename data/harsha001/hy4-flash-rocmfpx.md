# Harsha001/Hy4-flash-ROCmFPX

## Resumen

Hy4-flash ROCmFPX es una distribución de cuantizaciones GGUF del modelo tencent/Hy4-flash, publicada por el usuario Harsha001 y optimizada específicamente para GPUs AMD. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) de 220B parámetros totales, de los cuales 12B están activos por token, con 42 capas y 512 expertos con enrutamiento top-16. Incluye una tabla de búsqueda "Engram" de 64B parámetros que se consulta por filas y puede residir en CPU o SSD.

La relevancia de esta publicación radica en que adapta un modelo de gran tamaño para que la parte correspondiente a GPU quepa íntegramente en un único AMD Ryzen AI Max+ 395 (Strix Halo, 128 GB de memoria unificada, con 96 GB configurados como memoria de GPU). Los ficheros de 4 bits ocupan entre 80,4 y 84,7 GiB en la parte de GPU, mientras que la tabla Engram (33 GiB en Q4_0) se delega a CPU o SSD.

Las cuantizaciones están construidas con los formatos ROCmFPX y una importance matrix derivada de texto agéntico (ejecuciones de agentes de código, tool calls, function calling, tareas de shell y bases de datos), lo que las orienta a trabajo con agentes, tool calling y código, con inglés como idioma prioritario. Esta distribución es solo de texto: no incluye el codificador de visión ni el drafter DFly2 del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (arquitectura `hy_v4_flash`), 42 capas, 512 expertos, enrutamiento top-16 |
| Parametros totales | 218.938.417.140 (≈220B), de los cuales 64B corresponden a la tabla Engram |
| Parametros activos | 12B por token |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de ejecucion usa `-c 65536`) |
| Tipos de cuantizacion | Q4_0_ROCMFP4 + Q8_0_ROCMFPX (expertos en Q4_0_ROCMFP4, resto en Q8_0_ROCMFPX); variante Q4_0_ROCMFP4_FAST; tabla Engram en Q4_0; token embedding en Q8_0 |
| Idiomas soportados | No disponible (la model card indica "English first") |
| Licencia | Tencent Hy License, Version 1.0 (derivada de Apache 2.0 con terminos comerciales adicionales, seccion 10) |
| Formato de pesos | GGUF dividido en partes de maximo 45 GB (3 partes en el ejemplo) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 42 capas, 512 expertos y enrutamiento top-16, con 220B parámetros totales y 12B activos por token. Una particularidad estructural es la tabla Engram de 64B parámetros, que se consulta mediante lookups por fila (una fila por token) y por tanto no requiere memoria de GPU; puede mantenerse en CPU o, con mmap, en SSD. La distribución ROCmFPX añade escalas de tensor propietarias del formato y mantiene el token embedding en Q8_0.

Las cuantizaciones se generaron con una importance matrix construida a partir de texto agéntico: ejecuciones de agentes de código, tool calls, function calling y tareas de shell y bases de datos, renderizadas con la plantilla de chat del propio modelo e incluyendo los esquemas de herramientas. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card menciona un drafter DFly2 en el modelo original (no incluido aquí), lo que sugiere decodificación especulativa en la versión completa.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`).
- Razonamiento con modo de pensamiento configurable mediante `reasoning_effort`: `"high"` (thinking, por defecto) o `"no_think"`.
- Tool calling y function calling, con esquemas de herramientas integrados en la plantilla de chat.
- Flujos agénticos y razonamiento multi-paso (orientación declarada de las cuantizaciones).
- Generación de código y tareas de shell y bases de datos.
- Capacidades multilingües: no disponibles; la model card indica prioridad de inglés.
- Visión: no incluida en esta distribución (el codificador de visión del modelo base no está presente).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).

## Casos de uso

- Agentes de código en local: el modelo puede ejecutar bucles de tool calling y function calling sobre un entorno de desarrollo, aprovechando que las cuantizaciones se calibraron con texto de agentes de código y que la parte de GPU cabe en una única máquina Strix Halo.
- Automatización de tareas de shell y bases de datos: adecuado para agentes que generan y ejecutan comandos o consultas SQL, escenario incluido explícitamente en la importance matrix.
- Asistente de programación con contexto largo: el ejemplo de ejecución emplea `-c 65536`, por lo que puede manejar conversaciones y ficheros de código extensos en una sola sesión.
- Despliegue en estaciones de trabajo AMD sin GPU de datacenter: al estar dimensionado para un Ryzen AI Max+ 395 con 96 GB como memoria de GPU, permite servir un MoE de 220B en hardware de consumo profesional.
- Razonamiento con control de coste: el modo `"no_think"` permite desactivar el pensamiento extendido para respuestas rápidas, y `"high"` para tareas que requieren razonamiento profundo.
- Inferencia con llama.cpp vía `llama-server`: integrable como servidor compatible con endpoints para aplicaciones conversacionales y pipelines internos.
- Experimentación e investigación sobre cuantización: los formatos ROCmFPX y las variantes `STRIX`/`STRIXFAST` permiten comparar calidad y velocidad en hardware AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que cada fichero pasó una prueba de humo antes de la subida y que los números de calidad sobre chats agénticos retenidos (solo tokens del asistente) se añadirán más adelante.

## Requisitos de hardware

- VRAM estimada: 84,7 GiB para la parte de GPU en `Q4_0_STRIX` y 80,4 GiB en `Q4_0_STRIXFAST`; la tabla Engram en Q4_0 ocupa 33 GiB adicionales en CPU o SSD.
- Hardware objetivo: AMD Ryzen AI Max+ 395 (Strix Halo), 128 GB de memoria, con 96 GB configurados como memoria de GPU.
- GPU recomendadas: AMD con soporte ROCm/HIP o Vulkan; el fork de llama.cpp debe compilarse con Vulkan o ROCm/HIP.
- Cabe en GPU de consumo: sí, en el caso concreto de Strix Halo con 128 GB; no se indica compatibilidad con GPUs de menos memoria.
- Opciones de despliegue: fork ROCmFPX de llama.cpp, rama `hy4-flash`, mediante `llama-server` con `-ngl 99 -ot "per_layer_token_embd=CPU" -c 65536 --jinja`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash ROCmFPX (esta ficha) | ≈220B (64B en tabla Engram) | 12B | No disponible | Tencent Hy License 1.0 | GGUF en Hugging Face |
| tencent/Hy4-flash (base) | ≈220B | 12B | No disponible | Tencent Hy License 1.0 | Pesos originales en Hugging Face |
| Alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Solo texto: esta distribución no incluye el codificador de visión ni el drafter DFly2 del modelo base.
- Idioma: la model card indica prioridad de inglés; no se detallan idiomas soportados.
- Calibración sesgada a agentes: la importance matrix se construyó con texto agéntico, por lo que la calidad en otros dominios (por ejemplo, redacción de ensayos) puede ser inferior a la esperada.
- Riesgo de alucinación: no se han publicado evaluaciones de calidad ni benchmarks que permitan cuantificarlo.
- Licencia: Tencent Hy License 1.0 deriva de Apache 2.0 e incluye términos comerciales adicionales para grandes negocios de Model-as-a-Service (sección 10); es necesario revisar el fichero LICENSE antes de un uso comercial.
- Hardware restringido: los ficheros están dimensionados para Strix Halo con 96 GB como memoria de GPU; no se documenta su funcionamiento en otras configuraciones.
- Dependencia de un fork: requiere el fork ROCmFPX de llama.cpp (rama `hy4-flash`) con soporte para la arquitectura `hy_v4_flash` y las escalas de tensor ROCmFPX.
- Repositorio de terceros: la publicación la mantiene el usuario Harsha001, no Tencent; el crédito del modelo corresponde a Tencent.
- Estado de validación: solo se menciona una prueba de humo por fichero; no hay métricas de calidad publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harsha001/Hy4-flash-ROCmFPX
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Repositorio ROCmFPX: https://github.com/HarshaVardhan3002/ROCmFPX
