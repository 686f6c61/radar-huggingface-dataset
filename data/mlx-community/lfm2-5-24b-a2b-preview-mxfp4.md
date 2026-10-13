# mlx-community/LFM2.5-24B-A2B-Preview-mxfp4

## Resumen

LFM2.5-24B-A2B es un modelo de lenguaje de arquitectura de mezcla de expertos (MoE) desarrollado por Liquid AI, con 24.000 millones de parámetros totales y solo 2.000 millones activos por token. La ficha que se documenta aquí es la conversión a formato MLX realizada por mlx-community (con copia idéntica en nativ-community) a partir del checkpoint `lq-preview/LFM2.5-24B-A2B-Preview`, cuantizada en MXFP4 de 4 bits para su ejecución en Apple Silicon. El resultado ocupa 12,74 GB en disco y mantiene una ventana de contexto de 131.072 tokens.

El modelo está pensado para agentes que se ejecutan en local: según su autor, razona antes de responder (la plantilla de chat abre cada turno del asistente con una etiqueta `<think>`), admite llamadas a herramientas y resuelve tareas de varios pasos dentro de entornos de agente habituales. Su relevancia actual radica en esa combinación de razonamiento explícito, tool calling y tamaño reducido de pesos, que permite desplegarlo en un equipo de sobremesa con memoria unificada en lugar de depender de GPUs de centro de datos.

Se trata de una versión "Preview" del modelo base y de una conversión comunitaria, no de un lanzamiento oficial de pesos MLX por parte de Liquid AI. La licencia aplicable es la LFM Open License v1.0 del modelo original, que se incluye en el repositorio y rige también estos pesos cuantizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), identificada en el repositorio como `lfm2_moe`; número de expertos y composición de capas no disponibles |
| Parametros totales | 23.971.587.712 (≈24B) |
| Parametros activos | ≈2B (nomenclatura A2B del modelo base) |
| Longitud de contexto | 131.072 tokens (límite declarado en la configuración de origen) |
| Tipos de cuantizacion | MXFP4 weight-only de 4 bits con grupo de 32; proyecciones del router en 8 bits afín con grupo de 64; pesos no cuantizados en BF16; sesgos de enrutamiento de expertos en FP32 |
| Idiomas soportados | Inglés, árabe, chino, francés, alemán, japonés, coreano, español, portugués e italiano |
| Licencia | LFM Open License v1.0 (`lfm1.0`), licencia "other" en HuggingFace; se incluye el archivo LICENSE original |
| Formato de pesos | safetensors en formato MLX (`mlx`, `safetensors`); no se publican pesos GGUF |
| Tamano de pesos | 12,74 GB en decimal (repositorio: 12,8 GB); la memoria en ejecución incluye caché y asignaciones temporales |
| Libreria de inferencia | MLX / MLX-VLM |
| Modelo base | `lq-preview/LFM2.5-24B-A2B-Preview`, revisión `f772950ce6f17d35af5469d00334b61a9c2fc034` |
| Fecha de creacion del repositorio | 13 de octubre de 2026 |

## Arquitectura y entrenamiento

La información disponible confirma únicamente que se trata de un modelo MoE (etiqueta `lfm2_moe`) con 24B de parámetros totales y unos 2B activos por token, y que el checkpoint de origen es `lq-preview/LFM2.5-24B-A2B-Preview`. No se detallan en la documentación consultada el número de expertos, la política de enrutamiento, el tipo de capas de atención ni si la familia emplea componentes híbridos de convolución y atención. Tampoco se especifican el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación.

La innovación destacable que sí documenta el autor es de comportamiento, no de arquitectura: LFM2.5-24B-A2B "siempre piensa antes de responder", de modo que la plantilla de chat abre cada turno del asistente con una etiqueta `<think>` y las respuestas contienen una cadena de razonamiento explícita antes de la respuesta final. Esto implica que hay que reservar suficientes tokens de salida en producción, ya que parte del presupuesto de generación se consume en el bloque de razonamiento.

En cuanto a la conversión, se realizó con la CLI de MLX-VLM sobre un Apple M3 Ultra, con cuantización MXFP4 de 4 bits y grupo 32 para los pesos, 8 bits afín y grupo 64 para las proyecciones del router, BF16 para los pesos no cuantizados y FP32 para los sesgos de enrutamiento. El export se recargó con coincidencia estricta de pesos y se validó con comprobaciones cortas de generación greedy (dos respuestas correctas que alcanzaron EOS), descritas explícitamente por el autor como pruebas de humo, no como una evaluación de calidad ni de contexto largo.

## Capacidades

- Generación de texto conversacional en diez idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano, español, portugués e italiano.
- Razonamiento explícito: el modelo emite una cadena de pensamiento dentro de etiquetas `<think>` antes de la respuesta final, de forma consistente en cada turno del asistente.
- Llamada a herramientas (tool calling / function calling): el autor lo describe como capaz de invocar herramientas dentro de entornos de agente.
- Ejecución de tareas de varios pasos (multi-step reasoning) en marcos de agente habituales.
- Orientación a uso en local y privado: el modelo está diseñado para ejecutarse en dispositivo, sin enviar datos a servicios externos.
- Ventana de contexto larga de 131.072 tokens, adecuada para conversaciones extensas o documentos grandes.
- Capacidades de visión: no confirmadas. Aunque la conversión se hizo con la herramienta MLX-VLM y el repositorio incluye la etiqueta `mlx-vlm`, el autor indica de forma explícita que se trata de un modelo de generación de texto.
- Capacidades de audio: no disponibles en la información consultada.

## Casos de uso

- Agentes personales en local: desplegado sobre un Mac con memoria unificada, el modelo puede gestionar tareas de varios pasos con llamadas a herramientas (consultar el calendario, leer archivos, ejecutar búsquedas) sin que los datos salgan del equipo, que es precisamente el escenario para el que lo posiciona Liquid AI.
- Automatización de atención al cliente multi-turno: con 131.072 tokens de contexto se pueden mantener conversaciones largas o adjuntar manuales y políticas completas, y la cadena de razonamiento explícita facilita auditar por qué el modelo dio una respuesta concreta.
- Asistentes de código y revisión de parches: el soporte de tool calling permite conectarlo a un sistema de control de versiones o a una API de CI/CD para leer diffs, ejecutar comprobaciones y proponer cambios; el modo de razonamiento ayuda en tareas de depuración que requieren varios pasos.
- Análisis de documentos extensos en varios idiomas: informes, contratos o expedientes en español, francés, alemán o portugués caben en una única ventana de contexto, lo que evita pipelines de troceado y recuperación para casos de tamaño medio.
- Procesamiento por lotes de bajo coste: al activar solo unos 2B de parámetros por token, el coste de generación por token es bajo en comparación con un modelo denso del mismo tamaño, lo que lo hace apto para clasificación, extracción y resumen a gran volumen en hardware de gama alta de consumo.
- Prototipado e investigación en Apple Silicon: al estar publicado en MLX, permite experimentar con un MoE de 24B en un portátil o equipo de sobremesa Apple sin necesidad de GPU dedicada, útil para evaluar estrategias de agente o de razonamiento.
- Agentes de flujo de trabajo internos (RPA asistido): integrado en un orquestador, puede encadenar herramientas internas (CRM, ticketing, bases de datos) y redactar el resultado final en el idioma del usuario.
- Traducción y asistencia multilingüe: la cobertura de diez idiomas permite usarlo como asistente de redacción o traducción interna en organizaciones con equipos repartidos entre esos mercados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. El autor del modelo afirma en su blog que LFM2.5-24B-A2B supera a Qwen3.6-35B-A3B en LiveClaw, pero no se proporcionan cifras, configuración de evaluación ni metodología en la documentación consultada. Las únicas comprobaciones documentadas para esta conversión MLX son pruebas de humo de generación greedy (respuestas cortas correctas que alcanzaron EOS), que el propio autor califica como no exhaustivas y sin valor de benchmark de contexto largo.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| LiveClaw | no disponible (solo se afirma cualitativamente que supera a Qwen3.6-35B-A3B) |
| Pruebas de contexto largo | no disponible |

## Requisitos de hardware

- Pesos: 12,74 GB en MXFP4 de 4 bits. A esta cifra hay que sumar caché KV y asignaciones temporales, por lo que el consumo real de memoria es superior.
- Memoria unificada recomendada: un mínimo práctico de 16 GB resulta justo; 24 GB o más es lo aconsejable para trabajar con contextos largos sin degradar el rendimiento.
- Equipos validados: la conversión se realizó y probó en un Apple M3 Ultra. Cualquier chip de la familia Apple Silicon con memoria unificada suficiente (M1/M2/M3/M4 en variantes Pro, Max o Ultra) es candidato razonable, aunque no se documentan pruebas en el resto.
- GPU NVIDIA o AMD: no aplicable a este repositorio. Los pesos están en formato MLX y no se distribuyen en GGUF ni en safetensors estándar para CUDA; para A100, H100 o RTX 4090 habría que recurrir al checkpoint original o a otra conversión.
- Opciones de despliegue: CLI de MLX-VLM (`python -m mlx_vlm generate`). Se requiere el port de LFM2.5 de MLX-VLM PR #2505 (commit `a6c7313bc053e5887616fa850808d21576eddf98`), MLX 0.32.3 y Transformers 5.17.0. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama en este repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni tiempos de prefill en la información consultada.
- Nota de consumo: al ser un MoE con unos 2B de parámetros activos por token, el coste computacional por token es sensiblemente menor que el de un modelo denso de 24B, si bien el modelo completo debe residir en memoria.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato y disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B (esta ficha) | 24B / ≈2B | 131.072 tokens | LFM Open License v1.0 | MLX safetensors MXFP4 4 bits, publicado por mlx-community y nativ-community | Sin cifras publicadas; el autor afirma que supera a Qwen3.6-35B-A3B en LiveClaw |
| LFM2-24B-A2B | 24B / ≈2B (según nomenclatura) | no disponible | no disponible | Existen conversiones comunitarias en MLX (`mlx-community/LFM2-24B-A2B-4bit`) | no disponible; es el predecesor de esta versión y, a diferencia de ella, no siempre razona antes de responder |
| Qwen3.6-35B-A3B | ≈35B / ≈3B (según nomenclatura) | no disponible | no disponible | no disponible | Referencia citada por Liquid AI; no se aportan cifras comparativas |

## Limitaciones y advertencias

- Modelo en estado "Preview": el checkpoint base es una vista previa, no una versión final estable, y la conversión MLX es de origen comunitario.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinación; en tareas de recuperación o resumen conviene verificar las salidas.
- Sesgos: no se documenta ningún análisis de sesgos, toxicidad o comportamiento diferencial por idioma.
- Idiomas: aunque se declaran diez idiomas, no se especifica el reparto de datos de entrenamiento. Es previsible un rendimiento desigual y potencialmente inferior en los idiomas con menos representación (coreano, árabe, japonés) frente al inglés. Este dato no está confirmado en la información disponible.
- Cadena de razonamiento obligatoria: la plantilla abre siempre un bloque `<think>`, de modo que se consumen tokens en el razonamiento antes de la respuesta. Hay que ajustar los límites de tokens de salida y los tiempos de espera en producción, especialmente en tareas simples.
- Licencia: LFM Open License v1.0 (etiqueta `other` en HuggingFace). Antes de un uso comercial hay que revisar el texto de LICENSE; los términos de la licencia LFM Open v1.0 no se detallan en la documentación consultada.
- Compatibilidad restringida: los pesos son exclusivos de MLX y requieren Apple Silicon. No hay versión GGUF ni soporte documentado para vLLM, TGI, Ollama o llama.cpp en este repositorio, lo que limita su despliegue en infraestructura CUDA.
- Dependencias frágiles: el uso requiere un commit concreto de un pull request no fusionado de MLX-VLM y versiones específicas de MLX y Transformers, lo que complica la reproducibilidad a medio plazo.
- Validación insuficiente: las únicas pruebas declaradas son de humo (dos generaciones greedy cortas). No hay evaluación de contexto largo, ni de calidad multilingüe, ni de uso de herramientas.
- Inconsistencia en la documentación: el comando de ejemplo del README apunta al repositorio `nativ-community` pese a que la ficha corresponde a `mlx-community`; los archivos son idénticos según el autor, pero conviene verificar la procedencia al descargar.
- Repositorio sin tracción: cero descargas y cero "likes" en el momento de la consulta, sin historial de uso que permita inferir estabilidad.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/mlx-community/LFM2.5-24B-A2B-Preview-mxfp4
- Copia idéntica del repositorio: https://huggingface.co/nativ-community/LFM2.5-24B-A2B-Preview-mxfp4
- Modelo base: https://huggingface.co/lq-preview/LFM2.5-24B-A2B-Preview
- Blog de Liquid AI sobre LFM2.5-24B-A2B: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Blog de HuggingFace: https://huggingface.co/blog/LiquidAI/lfm25-24b-a2b
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-24b-a2b
- Pull request de MLX-VLM con el port de LFM2.5: https://github.com/Blaizzy/mlx-vlm/pull/2505
- Comunidad MLX: https://mlxcommunity.com/
- Conversión MLX previa del predecesor: https://huggingface.co/mlx-community/LFM2-24B-A2B-4bit
