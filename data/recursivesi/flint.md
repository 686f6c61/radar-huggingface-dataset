# RecursiveSI/flint

## Resumen

Recursive Flint es un modelo de lenguaje de tipo mixture-of-experts desarrollado por Recursive, orientado específicamente a agentes de código. Cuenta con 39.785.287.456 parámetros totales y aproximadamente 2,5B de parámetros activos por token, incluida la cabeza de salida; el cuerpo activo se estima en unos 2,2B. Su diseño busca investigar bases de código, localizar y corregir errores, implementar funcionalidades y escribir pruebas dentro de flujos agénticos multi-turno.

El modelo emplea una arquitectura Transformer decoder-only con 49 capas, de las cuales 2 son densas y 47 son capas MoE. Dispone de una configuración de contexto documentada de 262.144 tokens, que incluye tanto el prompt como la salida generada. Soporta entrada y salida de texto, razonamiento y uso de herramientas en varios turnos, con llamadas compatibles con la API de OpenAI.

Su relevancia actual reside en la combinación de un tamaño total cercano a 40B con una activación de solo ~2,5B por token, un contexto muy amplio y una licencia Apache 2.0. La model card indica que puede servirse en una GPU B300 o H200 por réplica mediante un kit SGLang, lo que lo posiciona como una alternativa para despliegues de agentes de código con requisitos de hardware acotados por réplica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con mixture-of-experts |
| Parámetros totales | 39.785.287.456 (39,8B) |
| Parámetros activos | Aproximadamente 2,5B por token, incluida la cabeza de salida; cuerpo activo aproximado de 2,2B |
| Longitud de contexto | 262.144 tokens documentados; prompt y salida comparten la ventana |
| Tipos de cuantización | BF16 en el repositorio; variantes cuantizadas preparadas por separado para NVIDIA y Apple Silicon; se menciona NVFP4 en la evaluación, sin más detalle |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; incluye configuración, tokenizador, plantilla de chat y kit de servicio SGLang |
| Capas | 49: 2 densas seguidas de 47 capas MoE |
| Atención | 35 capas con ventana deslizante y 14 capas con atención completa |
| Ventana deslizante | 513 tokens: el token actual y los 512 anteriores |
| Cabezas de atención | 32 cabezas de consulta y 4 cabezas clave/valor; dimensión de cabeza 128 |
| Expertos por capa MoE | 256 expertos enrutados, 6 seleccionados por token, más un experto compartido siempre activo |
| Vocabulario | 150.144 tokens |
| Entrada / salida | Texto / texto |
| Corte de conocimiento declarado | Junio de 2026 |
| Runtime documentado | SGLang; el código de modelado para Transformers no está incluido todavía |

## Arquitectura y entrenamiento

Flint es un Transformer decoder-only con mezcla de expertos. La pila tiene 49 capas: 2 capas densas iniciales y 47 capas MoE. Cada capa MoE contiene 256 expertos enrutados, de los cuales se seleccionan 6 por token, además de un experto compartido siempre activo. La atención combina 35 capas con ventana deslizante de 513 tokens y 14 capas de atención completa. Usa 32 cabezas de consulta y 4 cabezas clave/valor con dimensión 128, normalización QK RMSNorm por cabeza y sumideros de atención aprendidos por cabeza. La codificación posicional RoPE se aplica en las capas con ventana deslizante, mientras que las capas de atención completa no llevan codificación posicional.

El entrenamiento se realizó desde cero e incluyó pretraining, mid-training, ajuste supervisado y aprendizaje por refuerzo. Los datos cubren texto y código, seguimiento de instrucciones y tareas agénticas. La model card no especifica el número de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon técnicas concretas como RLHF o DPO; solo indica que hubo una fase de aprendizaje por refuerzo. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural.
- Generación, análisis y modificación de código, con orientación a tareas de ingeniería de software.
- Investigación de bases de código para localizar errores, dependencias y puntos de cambio.
- Implementación de funcionalidades y escritura de pruebas dentro de flujos agénticos.
- Uso de herramientas en varios turnos y llamadas a funciones compatibles con la API de OpenAI.
- Razonamiento multi-paso para tareas que requieren planificación y ejecución de acciones.
- Soporte de contexto largo de hasta 262.144 tokens documentados.
- Plantilla de chat propia y conservación de `reasoning_content` en el historial de conversación.
- Entrada y salida exclusivamente de texto; no se documentan capacidades de visión, audio u otras modalidades.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Resolución de incidencias en repositorios: el modelo puede recibir un informe de error, explorar los archivos relevantes, localizar la causa probable y proponer un parche. El contexto de 262.144 tokens y el uso de herramientas permiten trabajar sobre bases de código grandes sin fragmentar en exceso la información.
- Implementación de funcionalidades en proyectos existentes: puede analizar la estructura del repositorio, planificar los cambios, modificar varios archivos y generar pruebas asociadas. Es adecuado para tareas con varios pasos y requiere revisión humana antes de aplicar cambios.
- Generación y mantenimiento de pruebas: a partir del código y de la suite existente, puede proponer casos de prueba, escribir tests y ejecutarlos mediante llamadas a herramientas. El soporte de tool calling facilita iterar sobre fallos de compilación o de ejecución.
- Revisión de código en pipelines de CI/CD: integrado como endpoint compatible con OpenAI, puede analizar diferencias de código, señalar riesgos y sugerir pruebas adicionales. Conviene limitar sus permisos y revisar sus recomendaciones antes de aplicarlas.
- Refactorizaciones y migraciones multiarchivo: puede inspeccionar un conjunto amplio de archivos dentro de la ventana de contexto, proponer una secuencia de cambios y verificar el resultado con herramientas de búsqueda y pruebas.
- Asistencia a desarrolladores en entornos de chat o IDE: con la plantilla de chat y la conservación de `reasoning_content`, puede mantener conversaciones multi-turno para explicar código, proponer correcciones y discutir alternativas de implementación.
- Automatización de tareas de terminal en entornos controlados: su evaluación en Terminal-Bench 2.1 sugiere uso en agentes que ejecutan comandos y verifican resultados. Estas aplicaciones deben ejecutarse en sandboxes con permisos restringidos.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones indicadas |
|---|---:|---|
| Terminal-Bench 2.1 | 54,9% | Terminus 2; las soluciones obtenidas mediante recuperación web se contabilizan como no exitosas |
| SWE-bench Pro v2 | 89,7% | mini-swe-agent; pass@1 promedio sobre al menos cinco intentos |
| SWE-bench Verified | 74,2% | mini-swe-agent; pass@1 promedio sobre al menos cinco intentos |

Los resultados se obtuvieron con temperatura 1,0, top-p 0,95 y top-k 20. La model card indica que las puntuaciones agénticas son promedios pass@1 sobre al menos cinco intentos y que algunas puntuaciones comparativas pueden haber sido medidas por el desarrollador. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- El checkpoint BF16 ocupa aproximadamente 79,6 GB en el repositorio; se necesita capacidad de GPU suficiente para los pesos, la caché KV y el overhead de inferencia.
- La model card indica una GPU B300 o H200 por réplica, con scripts de servicio SGLang específicos para cada una.
- No cabe en una RTX 4090 en BF16: el repositorio BF16 supera ampliamente los 24 GB de VRAM de esa GPU.
- Existen variantes cuantizadas preparadas por separado para NVIDIA y Apple Silicon, pero no se publican requisitos exactos de VRAM ni rendimiento para esas variantes.
- El despliegue documentado utiliza SGLang y una API compatible con OpenAI. No se documentan recetas para vLLM, llama.cpp, Ollama o TGI.
- El código de modelado para Transformers no está incluido todavía; el kit principal es SGLang.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se proporcionan datos de modelos comparables en la información disponible. Por tanto, no se presenta una comparación numérica con alternativas de la misma categoría.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flint | 39,8B totales; ~2,5B activos | 262.144 tokens | Terminal-Bench 2.1: 54,9%; SWE-bench Pro v2: 89,7%; SWE-bench Verified: 74,2% | Apache 2.0 | Pesos BF16 en Hugging Face; kit SGLang; una B300 o H200 por réplica |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card indica que, aunque el ajuste supervisado incluyó ejemplos orientados a seguridad, el modelo puede producir contenido incorrecto o dañino, código defectuoso o llamadas a herramientas inadecuadas.
- Existe riesgo de alucinación en explicaciones, parches y decisiones sobre código; el código generado debe probarse y los cambios consecuentes deben revisarse antes de aplicarlos.
- En aplicaciones con herramientas, la gramática estructurada de las llamadas no impide que el modelo elija una acción incorrecta o insegura; deben aplicarse permisos y límites de ejecución propios.
- El razonamiento largo puede aumentar la latencia y consumir el presupuesto de salida antes de completar una respuesta; la model card recomienda al menos 32.768 tokens de salida para problemas difíciles.
- La configuración de 262.144 tokens es un límite de capacidad, no una garantía de precisión uniforme en todas las longitudes de secuencia o tareas.
- Los resultados pueden variar según la precisión del checkpoint y el runtime de inferencia; debe evaluarse la combinación concreta que se vaya a desplegar.
- No se documentan idiomas soportados ni sesgos específicos.
- La licencia Apache 2.0 permite uso comercial con las condiciones de la licencia; los términos de la API alojada y las prácticas de datos son independientes de la licencia de los pesos.
- El código de modelado para Transformers no está incluido todavía, lo que limita la integración directa fuera del kit SGLang documentado.

## Enlaces

- [Hugging Face: RecursiveSI/flint](https://huggingface.co/RecursiveSI/flint)
- [Blog de presentación de Recursive Flint](https://www.recursive.com/updates/introducing-recursive-flint)
- [Organización RecursiveSI en Hugging Face](https://huggingface.co/RecursiveSI)
- [Repositorio del motor local en GitHub](https://github.com/recursive-oss/rec)
- [Documentación de Recursive](https://docs.recursive.com/getting-started)
- [Kit de servicio SGLang](https://huggingface.co/RecursiveSI/flint/tree/main/sglang)
- [README del kit SGLang](https://huggingface.co/RecursiveSI/flint/blob/main/sglang/README.md)
- [Licencia Apache 2.0 del modelo](https://huggingface.co/RecursiveSI/flint/blob/main/LICENSE)
