# muhammad41/humanizer

## Resumen

humanizer es un modelo de 12B parámetros desarrollado por muhammad41 (con repositorio de soporte en GitHub bajo el usuario sgaofen) que reescribe borradores generados por IA —correos, ensayos, informes, publicaciones de foro— para que se lean como escritos por una persona. Está afinado a partir de google/gemma-4-12B y se distribuye en formato GGUF para ejecución local mediante llama.cpp, con licencia Apache 2.0.

El modelo aborda un problema concreto: el texto generado por LLM tiene patrones estilísticos reconocibles que los detectores de IA identifican con facilidad. humanizer aplica una transferencia de estilo que, según la model card, consigue que el 95% de las reescrituras en inglés sean clasificadas como humanas por Originality.ai en su ajuste más estricto, sin haber usado ningún detector de IA durante el entrenamiento. Además, está entrenado para preservar íntegramente números, unidades, fechas, nombres y citas, y para no añadir información nueva.

El modelo soporta inglés y chino, tiene 11.959.730.224 parámetros (aproximadamente 12B), y se ofrece en cinco cuantizaciones (Q8_0, Q6_K, Q4_K_M, Q3 y 2-bit) que caben desde máquinas con 8 GB de memoria. La longitud de contexto no se especifica en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tune de google/gemma-4-12B; etiqueta gemma4_unified) |
| Parámetros totales | 11.959.730.224 (≈12B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0, Q6_K, Q4_K_M, Q3 y 2-bit (GGUF) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |
| Pipeline | text-generation (image-text-to-text en los tags de HF) |
| Modelo base | google/gemma-4-12B |
| Tamaño del repo | 87,6 GB |

## Arquitectura y entrenamiento

humanizer es un fine-tune del modelo google/gemma-4-12B, por lo que hereda la arquitectura transformer de la familia Gemma 4. La información disponible no detalla la composición exacta del dataset de entrenamiento ni el número de tokens utilizados, pero sí indica que se emplearon datos de reescritura en inglés y chino. No se especifica si hubo RLHF o DPO.

La innovación técnica más destacable está en el proceso de cuantización. Los archivos de 2-bit, Q3 y Q4_K_M no se generan con una única pasada de `llama-quantize`: se mide la sensibilidad de cada tensor de pesos y se asignan más bits a los tensores sensibles y menos a los robustos. Posteriormente, esos tres archivos se someten a entrenamiento consciente de cuantización (quantization-aware training) capa por capa y se destilan desde el modelo completo en bf16, usado como profesor, sobre datos de reescritura en inglés y chino. El resultado es que el archivo de 2-bit pasa de una coincidencia top-1 del 70% con bf16 (build estándar del mismo tamaño) al 87% tras aplicar estas técnicas. Los archivos Q6_K y Q8_0 son builds estándar de llama.cpp. Todos los GGUF son compatibles con cualquier versión reciente de llama.cpp.

## Capacidades

- Reescritura de texto con transferencia de estilo: convierte borradores de IA en texto con apariencia humana en inglés y chino.
- Preservación de hechos: entrenado para mantener números, unidades, fechas, nombres y citas, y para no añadir información nueva.
- Procesamiento de documentos largos: la CLI `hz` maneja archivos `.md`, `.txt` y `.docx`, conserva encabezados, código, tablas y enlaces, y reescribe la prosa pieza a pieza.
- Importación de `.docx` y PDF en la aplicación de escritorio (desde la versión 0.3.2).
- Función «Create fact»: permite marcar un pasaje para que se conserve palabra por palabra.
- Ejecución local y offline tras la descarga inicial del modelo.
- Integración con agentes de código mediante `AGENTS.md`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión: los tags de Hugging Face incluyen `image-text-to-text`, pero la model card no describe funciones de visión.
- Modo thinking, audio o multi-step reasoning: no disponible en la información proporcionada.

## Casos de uso

- Reescritura de correos profesionales: el modelo transforma borradores de correo generados por IA en mensajes con tono humano, conservando cifras, fechas y nombres de destinatarios, lo que evita errores en comunicaciones laborales.
- Humanización de ensayos y trabajos académicos: para autores que redactan con asistencia de IA y necesitan un estilo personal, el modelo reescribe la prosa manteniendo las citas y referencias intactas.
- Publicaciones en foros y comunidades: respuestas de foro o Zhihu generadas con IA pueden reescribirse para que no se detecten como automáticas, algo relevante en plataformas que penalizan el contenido generado.
- Informes y documentación interna: la CLI `hz` procesa documentos largos en Markdown o `.docx`, conserva la estructura (encabezados, tablas, código) y reescribe solo la prosa, lo que permite humanizar informes técnicos sin romper el formato.
- Procesamiento por lotes en pipelines de contenido: al ejecutarse con llama.cpp o llama-server, el modelo puede integrarse en flujos automatizados de publicación donde se requiera un paso de reescritura estilística antes de la revisión final.
- Uso local en entornos con restricciones de privacidad: al funcionar offline tras la descarga y en máquinas desde 8 GB de memoria, es adecuado para equipos que no pueden enviar borradores a servicios en la nube.
- Integración con agentes de código: mediante `AGENTS.md`, un agente puede configurar el modelo, el comando de servidor y el prompt exacto, y ejecutar una autoprueba.

## Benchmarks y rendimiento

| Métrica | Resultado | Condiciones |
|---|---|---|
| Reescrituras en inglés juzgadas humanas por Originality.ai | 95% (11 de 210 marcadas como IA) | Ajuste más estricto, pesos bf16, 2026-10-02; release anterior: 26 marcadas |
| Reescrituras en inglés sin problema factual (juez LLM estricto) | 376 de 420 | Medido sobre `humanizer-12b-Q8_0.gguf`; release anterior: 369 |
| Problemas factuales detectados | 135 problemas en total, 125 de ellos una sola palabra o frase | Sobre las 420 reescrituras en inglés |
| Coincidencia top-1 con bf16, archivo 2-bit | 87% | Tras cuantización sensible + QAT + destilación; build estándar del mismo tamaño: 70% |
| Coincidencia top-1 con bf16, archivo de 3,9 GB | 87% frente al 70% de la cuantización estándar de llama.cpp | Según la gráfica de la model card |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo se ofrece en cinco tamaños que van desde 8 GB de memoria de máquina en adelante (la app sugiere una cuantización según la memoria disponible).
- El archivo de 2-bit ocupa aproximadamente 3,9 GB según la gráfica de cuantización.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: la app está disponible para Mac con Apple silicon y Windows x64; el modelo funciona en máquinas desde 8 GB de memoria, lo que sugiere compatibilidad con hardware de consumo, aunque no se detallan modelos concretos de GPU.
- Opciones de despliegue: llama.cpp (incluido llama-server), aplicación de escritorio oficial (macOS arm64 y Windows x64) y CLI `hz` instalable con `pipx`.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base google/gemma-4-12B es la referencia natural, pero no se han publicado en la información disponible datos comparativos de parámetros, contexto, rendimiento o licencia frente a alternativas de reescritura o transferencia de estilo.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| humanizer | ≈12B | no disponible | Apache 2.0 | GGUF en HF, app y CLI |
| google/gemma-4-12B (base) | ≈12B | no disponible | no disponible | no disponible |
| Alternativas de reescritura | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Riesgo de error factual: aunque el modelo está entrenado para preservar hechos, el juez estricto detectó problemas en 44 de las 420 reescrituras en inglés (135 problemas en total, 125 de una sola palabra o frase). La model card recomienda revisar el resultado antes de enviarlo, especialmente números, fechas y nombres.
- Los ejemplos «antes y después» de la model card son selecciones entre 8 muestras generadas, no resultados medios; los resultados completos están en el repositorio de GitHub.
- Idiomas limitados a inglés y chino; no se garantiza calidad en castellano ni en otros idiomas.
- Longitud de contexto no especificada: para documentos muy largos, la CLI trocea la prosa pieza a pieza, lo que puede afectar a la coherencia global.
- Sesgos conocidos: no disponible en la información proporcionada.
- Uso comercial: la licencia Apache 2.0 lo permite, pero el modelo base google/gemma-4-12B puede tener sus propias condiciones que conviene verificar.
- No se usó ningún detector de IA durante el entrenamiento; el 95% de detección humana es una métrica frente a Originality.ai, no una garantía frente a otros detectores.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-19), lo que indica un lanzamiento muy reciente sin validación comunitaria.

## Enlaces

- [Hugging Face: muhammad41/humanizer](https://huggingface.co/muhammad41/humanizer)
- [Archivos GGUF: jialinyyzz/humanizer-GGUF](https://huggingface.co/jialinyyzz/humanizer-GGUF)
- [GitHub: sgaofen/humanizer-local-model](https://github.com/sgaofen/humanizer-local-model)
- [README en chino](https://github.com/sgaofen/humanizer-local-model/blob/main/README.zh.md)
- [Guía de uso sin app (USAGE.md)](https://github.com/sgaofen/humanizer-local-model/blob/main/USAGE.md)
- [Guía de uso sin app en chino (USAGE.zh.md)](https://github.com/sgaofen/humanizer-local-model/blob/main/USAGE.zh.md)
- [AGENTS.md para agentes de código](https://github.com/sgaofen/humanizer-local-model/blob/main/AGENTS.md)
- [Documentación de cuantización](https://github.com/sgaofen/humanizer-local-model/blob/main/docs/QUANTIZATION.md)
- [Guía de instalación](https://github.com/sgaofen/humanizer-local-model/blob/main/docs/INSTALL.md)
- [Ejemplos de evaluación (8 muestras Q8_0)](https://github.com/sgaofen/humanizer-local-model/blob/main/eval/outputs/examples-12b-Q8_0_x8.json)
- [Release app 0.3.2](https://github.com/sgaofen/humanizer-local-model/releases/tag/app-v0.3.2)
- [Descarga Mac (Apple silicon)](https://github.com/sgaofen/humanizer-local-model/releases/download/app-v0.3.2/Humanizer-0.3.2-macos-arm64.dmg)
- [Descarga Windows](https://github.com/sgaofen/humanizer-local-model/releases/download/app-v0.3.2/Humanizer-0.3.2-windows-x64-setup.exe)
- [Modelo base: google/gemma-4-12B](https://huggingface.co/google/gemma-4-12B)
