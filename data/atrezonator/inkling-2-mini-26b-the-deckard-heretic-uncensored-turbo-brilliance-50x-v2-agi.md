# atrezonator/Inkling-2-Mini-26B-The-DECKARD-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI

## Resumen

Inkling-2-Mini-26B-The-DECKARD es una distribución en formato GGUF del modelo Inkling-2-Mini de Thinking Machines Lab, publicada por el usuario atrezonator en Hugging Face. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con capacidad multimodal nativa (entrada de texto e imagen, salida de texto), concebido para aplicaciones de propósito general que incluyen agentes, uso de herramientas y asistentes de código. El modelo base original procede de Thinking Machines y ha sido sucesivamente modificado: primero por DavidAU, que aplicó un proceso de "abliteración" (eliminación de rechazos) y su sistema de instrucciones Turbo Brilliance 50X V2 AGI, y después por atrezonator, que añade la receta de cuantización Q8_0_L, el proyector multimodal y un drafter para decodificación especulativa.

La relevancia de esta ficha radica en que documenta una cadena de derivaciones sobre un modelo MoE de aproximadamente 26 mil millones de parámetros con contexto declarado de hasta un millón de tokens y procesamiento en bucle ("looping processing"). Es un ejemplo típico del ecosistema de modelos derivados no oficiales: el repositorio no incluye la model card original completa, no publica resultados de benchmarks propios y no especifica con precisión el número de parámetros activos ni la composición del dataset de entrenamiento.

Conviene subrayar que esta distribución es una versión "uncensored" (abliterada) que no aplica rechazos a la mayoría de peticiones, lo que la hace inadecuada para despliegues en producción sin capas adicionales de moderación. La licencia declarada es Apache 2.0, aunque el modelo base remite a una política de uso aceptable propia de Thinking Machines que debe respetarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con "looping processing"; multimodal texto+imagen |
| Parametros totales | 26B (según el nombre del modelo; no confirmado en la información disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 1 millón de tokens (declarado por el autor); ejemplos de uso con 32768 |
| Tipos de cuantizacion | Q8_0_L (Q8_0 con tensores sensibles en BF16); drafter en Q8_0; mmproj en F16 y BF16 |
| Idiomas soportados | en, ru, zh (según metadatos); el modelo base declara uso general en inglés y otros idiomas |
| Licencia | apache-2.0 (sujeta a la política de uso aceptable del modelo base) |
| Formato de pesos | GGUF (modelo principal, drafter y proyector multimodal); el modelo base usa safetensors/bfloat16 |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini emplea una arquitectura Mixture of Experts con una innovación denominada "looping processing", que según la información disponible permite extender el contexto hasta un millón de tokens. Es nativamente multimodal: acepta entradas de texto e imagen y genera texto, con la visión implementada mediante un proyector multimodal separado (`mmproj`) en formato GGUF. La información disponible no detalla el número de expertos, la proporción de parámetros activos por token ni la dimensión de las capas.

En cuanto al entrenamiento, no se dispone de datos sobre el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. Lo que sí está documentado es la cadena de modificaciones posteriores: DavidAU aplicó un proceso de abliteración ("Heretic'ed") para eliminar los comportamientos de rechazo, y sobre él superpuso su sistema Turbo Brilliance 50X V2 AGI, que introduce modos de razonamiento e instrucción predefinidos (27 modos de razonamiento, 27 modos de instrucción y constructos de IA etiquetados como "AGI"). atrezonator añade la cuantización Q8_0_L, que mantiene en BF16 los tensores de embedding, salida, proyección de atención y proyección down de las FFN, y un drafter DSpark (derivado de `mtp.safetensors`) para decodificación especulativa.

## Capacidades

- Generación de texto general, razonamiento y modo "thinking" (el razonamiento "high" se activa automáticamente cuando no se usan los sistemas Turbo Brilliance).
- Entrada de imágenes con salida de texto (image-text-to-text) mediante el proyector multimodal.
- Generación de código en múltiples lenguajes de programación, según declara el modelo base.
- Uso de herramientas y function calling, orientado a sistemas agénticos (declarado en la model card del modelo base).
- Modos de razonamiento e instrucción preconfigurados del sistema Turbo Brilliance (27 modos de razonamiento, 27 de instrucción, 15 constructos de IA, 5 "Super AI Constructs" y 21 "AGI Constructs", incluyendo constructos de brainstorm, enseñanza universal, agente y coder).
- Escritura creativa y roleplay en múltiples géneros, según las etiquetas del repositorio.
- Capacidades multilingües en inglés, ruso y chino según los metadatos (el modelo base declara cobertura más amplia).
- Decodificación especulativa mediante el drafter DSpark incluido.

## Casos de uso

- Asistencia de código en producción: el modelo puede integrarse en pipelines de CI/CD o en editores para autocompletado y revisión de código, apoyándose en el soporte declarado de tool calling y en los modos "Coder AI Construct" del sistema Turbo Brilliance.
- Atención al cliente automatizada: su ventana de contexto declarada de hasta un millón de tokens permite mantener conversaciones multi-turno con historiales extensos y documentación de producto adjunta sin truncamiento agresivo.
- Procesamiento de documentos con imágenes: al aceptar entrada visual, puede extraer información de capturas, diagramas o formularios y generar resúmenes o respuestas textuales, usando el proyector `mmproj` junto al modelo principal.
- Generación de ficción y escritura creativa: las etiquetas del repositorio y los modos de escritura creativa lo orientan a la producción de relatos, guiones y roleplay en varios géneros, con control mediante los modos de instrucción predefinidos.
- Sistemas agénticos multi-paso: el soporte de function calling y los constructos "Agent AI Construct" permiten orquestar flujos con llamadas a herramientas, planificación y ejecución secuencial.
- Despliegue local con llama.cpp: los archivos GGUF y el drafter permiten servir el modelo en estaciones de trabajo con GPU de consumo, útil para prototipado e investigación sin depender de infraestructura en la nube.
- Investigación sobre alineación y abliteración: al ser una versión sin rechazos, sirve para estudiar el comportamiento de modelos abliterados y diseñar capas de moderación externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de 26B en Q8_0 requiere del orden de 26-28 GB solo para los pesos, a lo que se suman el proyector multimodal y el drafter; el archivo Q8_0_L es algo mayor que un Q8_0 estándar por los tensores en BF16.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar viabilidad en A100 40/80 GB, H100 y configuraciones multi-GPU; en GPU de consumo solo con cuantizaciones más agresivas, que no se distribuyen en este repositorio.
- ¿Cabe en GPU de consumo? Con los archivos publicados (Q8_0_L), no en tarjetas de 24 GB o menos sin offloading a RAM/CPU; no se ofrecen quants de 4 o 5 bits en este repositorio.
- Opciones de despliegue: llama.cpp (llama-server), con soporte para modelos en bucle y para el drafter DSpark en versiones recientes; no se documenta compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. La decodificación especulativa con el drafter DSpark está pensada para reducir latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-26B-The-DECKARD (este) | 26B (MoE) | hasta 1M (declarado) | Apache 2.0 | GGUF | Abliterado, multimodal, con drafter |
| DavidAU/Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI | 26B (MoE) | hasta 1M (declarado) | Apache 2.0 | safetensors/GGUF (repo propio) | Modelo base directo de esta derivación; sin receta Q8_0_L ni drafter de atrezonator |
| thinkingmachines/Inkling-2-Mini | 26B (MoE) | hasta 1M (declarado) | no disponible en la información | safetensors | Modelo original con alineación de seguridad; benchmarks en su model card |
| Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI | 27B (denso, según nombre) | no disponible | no disponible | GGUF (repo de DavidAU) | Alternativa de tamaño similar con el mismo sistema Turbo Brilliance, no multimodal según la información disponible |

## Limitaciones y advertencias

- Modelo abliterado ("uncensored"): no aplica rechazos a la mayoría de peticiones y puede generar contenido inexacto, ofensivo o inseguro; requiere moderación externa en cualquier despliegue real.
- Riesgo elevado de alucinación: no se han publicado evaluaciones de fidelidad ni benchmarks que cuantifiquen su precisión.
- Falta de transparencia: el repositorio no documenta parámetros activos, número de expertos, datos de entrenamiento ni resultados de evaluación; el nombre "AGI" y los "constructos" son etiquetas de marketing del autor, no capacidades verificadas.
- Idiomas: los metadatos declaran solo en, ru y zh; el rendimiento en castellano no está evaluado y probablemente sea inferior al del inglés.
- Contexto: el millón de tokens es una declaración del autor, no verificada; los ejemplos de uso del repositorio emplean 32768 tokens, y el rendimiento real en contextos muy largos no está medido.
- Compatibilidad: el soporte de llama.cpp para modelos en bucle y para el drafter DSpark es reciente y varía según la compilación; pueden aparecer fallos con versiones antiguas.
- Licencia: aunque se declara Apache 2.0, el modelo base remite a la política de uso aceptable de Thinking Machines, que debe respetarse en uso comercial.
- Procedencia: es una derivación de terceros no oficial; los errores introducidos por la cuantización o por las modificaciones de DavidAU no están documentados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/atrezonator/Inkling-2-Mini-26B-The-DECKARD-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI
- Modelo base de esta derivación (DavidAU): https://huggingface.co/DavidAU/Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI
- Repositorio GGUF de DavidAU con instrucciones Turbo Brilliance: https://huggingface.co/DavidAU/Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI-NEO-GGUF
- Modelo original de Thinking Machines: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Playground de Thinking Machines: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (GitHub): https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable del modelo base: https://thinkingmachines.ai/model-acceptable-use-policy/
- Perfil del autor en Hugging Face: https://huggingface.co/atrezonator
- Repositorio alternativo con el mismo sistema Turbo Brilliance (Qwen3.8-27B): https://huggingface.co/DavidAU/Qwen3.8-27B-Ultimate-Heretic-Uncensored-Turbo-Brilliance-50x-AGI-NEO-GGUF
