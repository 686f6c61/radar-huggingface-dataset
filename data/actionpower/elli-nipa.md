# ActionPower/elli-nipa

## Resumen

ELLI-nipa es un modelo de lenguaje especializado en coreano para tareas de actas y resúmenes de reuniones y clases, desarrollado por ActionPower. Se construye a partir de Qwen/Qwen3-1.7B (1.720.804.352 parámetros) mediante un proceso de ajuste en cuatro tareas concretas (selección de plantilla, identificación de hablantes, resumen y redacción de informes) y una posterior cuantización agresiva a 1.58 bits en formato GGUF.

Su rasgo diferencial es la orientación a inferencia en dispositivo (on-device): el único artefacto publicado es un fichero GGUF de 586 MB con pesos I2_S de 1.58 bits, pensado para ejecutarse sobre CPU x86-64 con AVX2 mediante una versión parcheada de bitnet.cpp. Esto lo sitúa en la estela de los modelos de pesos ternarios tipo BitNet, aunque aquí se aplica como cuantización post-entrenamiento sobre un transformer denso, no como arquitectura nativa de 1.58 bits.

El modelo es relevante por su especialización vertical: no compite en capacidades generales, sino que resuelve un flujo de trabajo completo de transcripción a informe en coreano con un coste de cómputo mínimo y sin GPU. Su licencia Apache 2.0 y su tamaño reducido lo hacen atractivo para integrarlo en herramientas de productividad locales, aunque su adopción es aún muy incipiente (200 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B), cuantizado a 1.58 bits |
| Parametros totales | 1.720.804.352 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (valor usado en el ejemplo de ejecución; no se especifica el máximo entrenado) |
| Tipos de cuantizacion | I2_S (1.58-bit) en GGUF; no se publican otras variantes |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`ELLI-nipa-1p58b-i2s.gguf`, 586 MB) |

## Arquitectura y entrenamiento

La base es Qwen3-1.7B, un transformer denso decoder-only de la familia Qwen3. Sobre ese modelo, ActionPower realiza un ajuste específico en cuatro tareas encadenadas: selección de formato de salida, asignación de nombres y roles a hablantes, resumen del contenido y generación de un informe. Cada tarea tiene un formato de salida delimitado por etiquetas (`<템플릿>`, `<화자표>`, `<정리본>`, `<보고서>`), lo que sugiere un entrenamiento supervisado orientado a instrucciones con plantillas muy controladas y decodificación determinista (el ejemplo oficial usa `--temp 0`).

Tras el ajuste, el modelo se cuantiza a 1.58 bits en formato I2_S y se empaqueta en GGUF. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. Tampoco se especifica si la cuantización se acompañó de entrenamiento con cuantización consciente (QAT) o si es puramente post-entrenamiento; el hecho de que se ejecute con bitnet.cpp y parches específicos sugiere una integración estrecha con ese runtime, pero no se confirma el método. No se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en coreano orientada a dominios de reuniones y clases.
- Selección de plantilla o formato de salida entre opciones predefinidas.
- Identificación y etiquetado de hablantes con nombre y rol a partir de una transcripción.
- Resumen extractivo/abstractivo de transcripciones largas.
- Redacción de informes estructurados a partir del resumen.
- Ejecución en CPU x86-64 con AVX2 mediante bitnet.cpp parcheado, sin GPU.
- Decodificación determinista recomendada (`--temp 0`) para formatos de salida estables.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: no disponible; la model card declara únicamente coreano.

## Casos de uso

- Actas de reuniones corporativas: se introduce la transcripción y el modelo genera un resumen delimitado en `<정리본>`, adecuado para enviar por correo o archivar en un gestor documental sin intervención manual.
- Identificación de participantes: a partir de una transcripción sin etiquetas, el modelo produce un bloque `<화자표>` con la asignación de hablantes a nombres y roles, lo que facilita la revisión posterior por parte de un secretario humano.
- Resumen de clases y ponencias: grabaciones de docencia se transcriben y el modelo genera un resumen estructurado que el estudiante o el profesor puede revisar; el contexto de 8192 tokens cubre sesiones de duración media.
- Generación de informes a partir de actas: el bloque `<보고서>` permite obtener un documento formal con secciones a partir del resumen previo, útil en consultoría o auditoría interna.
- Herramienta de escritorio sin GPU: al ejecutarse en CPU con AVX2 y ocupar 586 MB, puede integrarse en aplicaciones de escritorio o portátiles corporativos sin requisitos de hardware dedicado.
- Pipeline por lotes de documentación: procesamiento nocturno de transcripciones almacenadas en un servidor para generar resúmenes e informes de forma masiva, con bajo coste energético gracias a los pesos de 1.58 bits.
- Asistente de reuniones en entornos con restricciones de privacidad: al ser on-device, las transcripciones no salen del equipo, lo que encaja en sectores con requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para el artefacto publicado, que está pensado para CPU; el fichero GGUF ocupa 586 MB y la inferencia en CPU requiere memoria RAM del orden del tamaño del modelo más el contexto.
- GPU recomendadas: no se documentan; el runtime oficial es bitnet.cpp sobre CPU x86-64 con AVX2.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; no se publican instrucciones para CUDA, Metal ni ROCm.
- CPU: x86-64 con soporte AVX2; en Windows se indica compilación con Clang (clang-cl) y Ninja.
- Opciones de despliegue: bitnet.cpp parcheado con los parches `runtime/bitnet.patch` y `runtime/llama.cpp.patch` sobre el commit `0b341e582afbf9e1011f24744b554c96a3477eb5`; el ejemplo usa `llama-cli` con `-c 8192 --temp 0 -st -f prompt.txt`. No se documenta compatibilidad con vLLM, TGI, Ollama ni llama.cpp estándar sin parches.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|---|
| ELLI-nipa | 1,72 B | 8192 (uso documentado) | I2_S 1.58-bit (GGUF) | Coreano | Apache 2.0 | Resumen de actas y clases, on-device |
| Qwen3-1.7B (base) | 1,72 B | no disponible en esta ficha | múltiples (safetensors, GGUF de la comunidad) | Multilingüe | Apache 2.0 | Propósito general |
| BitNet b1.58 (familia) | varía | varía | 1.58-bit nativo | varía | varía | Arquitectura ternaria nativa |

La comparación directa con alternativas coreanas especializadas en resumen de reuniones no está disponible en la información proporcionada. Frente a su modelo base, ELLI-nipa sacrifica capacidades generales y multilingüismo a cambio de formato de salida controlado y huella de memoria mínima; frente a BitNet b1.58, la diferencia clave es que aquí la cuantización ternaria es post-entrenamiento sobre un transformer convencional, no una arquitectura diseñada desde cero para 1.58 bits.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre transcripciones coreanas, puede heredar sesgos de dominio, registro y género presentes en esos datos.
- Riesgo de alucinación: presente como en cualquier modelo generativo; el uso de `--temp 0` reduce la variabilidad pero no elimina la invención de contenido en resúmenes o nombres de hablantes.
- Limitación de idioma: solo se declara coreano; el rendimiento en otros idiomas no está garantizado ni documentado.
- Contexto: el ejemplo oficial usa 8192 tokens; no se especifica la longitud máxima entrenada, por lo que transcripciones muy largas pueden requerir troceado.
- Formato de salida rígido: el modelo está entrenado para emitir etiquetas concretas (`<템플릿>`, `<화자표>`, `<정리본>`, `<보고서>`); desviarse del formato de prompt esperado puede degradar la calidad.
- Dependencia de runtime: requiere bitnet.cpp con parches específicos y un commit concreto; no hay garantía de compatibilidad con versiones posteriores ni con otros motores de inferencia.
- Licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribución; conviene revisar también las condiciones del modelo base Qwen3-1.7B.
- Madurez: 200 descargas y 0 likes en el momento de la consulta; no se han publicado evaluaciones independientes ni benchmarks.
- La cuantización a 1.58 bits puede degradar tareas que exijan matices finos; no se documenta una comparación con el modelo sin cuantizar.

## Enlaces

- Hugging Face: https://huggingface.co/ActionPower/elli-nipa
- Repositorio de código de entrenamiento: https://github.com/actionpower/elli-nipa
- Runtime BitNet (Microsoft): https://github.com/microsoft/BitNet
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
