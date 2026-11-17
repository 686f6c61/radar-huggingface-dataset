# LlamaPal/granite-4.2-3b-Q4_0-GGUF

## Resumen

Este repositorio no contiene un modelo original, sino un espejo del archivo `granite-4.2-3b-Q4_0.gguf` publicado por IBM en `ibm-granite/granite-4.2-3b-GGUF`. El autor, LlamaPal, redistribuye exactamente el mismo binario (mismo SHA-256) para que su aplicación de chat offline para Android pueda descargarlo directamente. El modelo subyacente es Granite 4.2 3B de IBM, un transformer denso de 3.659.737.600 parámetros con 128K de contexto, bajo licencia Apache 2.0. La relevancia de esta ficha radica en que documenta una vía de despliegue on-device: un GGUF cuantizado a Q4_0 de 2,1 GB que cabe en la memoria de un teléfono Android de gama media-alta y funciona sin conexión.

El modelo base está orientado a razonamiento con modo de pensamiento integrado, generación de código, uso de herramientas y soporte de 12 idiomas, según la model card del espejo. La cuantización Q4_0 reduce el peso a aproximadamente 2,1 GB, un tamaño manejable para almacenamiento móvil, aunque a costa de cierta pérdida de precisión frente a los pesos originales en safetensors.

Es importante subrayar que este repositorio no aporta información técnica propia: no incluye benchmarks, no documenta el proceso de cuantización más allá de indicar que es una copia sin modificar, y no especifica los idiomas concretos. Los datos técnicos que se recogen aquí provienen del modelo base y de la model card del espejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (según modelo base Granite 4.2 de IBM; detalles arquitectónicos no disponibles en la información proporcionada) |
| Parametros totales | 3.659.737.600 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (según model card) |
| Tipos de cuantizacion | Q4_0 (única variante en este repositorio) |
| Idiomas soportados | 12 idiomas (según model card; lista concreta no disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de describirlo como un transformer denso de 3B parámetros. La model card del espejo menciona que Granite 4.2 incorpora "thinking" integrado, capacidades de código y uso de herramientas, y soporte de 12 idiomas, pero no especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o similares.

Tampoco se documenta ninguna innovación técnica concreta (decodificación especulativa, atención lineal, arquitecturas híbridas) en la información proporcionada. El único dato técnico verificable del proceso de este repositorio es la cuantización Q4_0 aplicada por IBM en el repositorio original, que reduce los pesos a un archivo de 2,1 GB con un SHA-256 concreto (`d34a4a7c0b230d3f544eca502beb7e04efc3a0ebd59e2f2df50058f23cc20711`), idéntico al del repositorio de origen en el commit `c40945d71cd9`.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Razonamiento con modo de pensamiento integrado ("built-in thinking"), según la model card.
- Generación de código ("strong coding"), según la model card.
- Uso de herramientas / tool calling ("tool use"), según la model card.
- Soporte multilingüe: 12 idiomas (lista concreta no disponible).
- Ejecución offline en dispositivo Android mediante la app LlamaPal.
- Compatibilidad con llama.cpp y cualquier aplicación construida sobre él (etiqueta `endpoints_compatible` y formato GGUF estándar).
- Capacidades de visión, audio o agentes autónomos: no disponibles en la información proporcionada.

## Casos de uso

- Chat offline en Android: el archivo Q4_0 de 2,1 GB se descarga una vez y permite conversaciones sin conexión ni cuenta de usuario, con la privacidad de que nada sale del dispositivo. Es el caso de uso principal declarado por el autor del espejo.
- Asistente personal en movilidad sin cobertura: útil en entornos sin red (viajes, zonas rurales, aviones) donde se necesita generación de texto o resumen de notas locales.
- Generación y revisión de código en el móvil: gracias a las capacidades de código del modelo base, puede usarse para autocompletar fragmentos, explicar funciones o redactar tests en un editor móvil integrado con llama.cpp.
- Prototipado de agentes con tool calling en local: la etiqueta `endpoints_compatible` y el soporte de tool use permiten integrarlo en pipelines ligeros que expongan una API compatible con endpoints, sin depender de la nube.
- Evaluación de modelos pequeños en investigación: un GGUF de 3B en Q4_0 es un banco de pruebas accesible para medir latencia, calidad y consumo en hardware de gama baja antes de escalar a modelos mayores.
- Aplicaciones educativas o de accesibilidad: un chat local de 12 idiomas puede integrarse en apps de aprendizaje de idiomas o de asistencia a personas con dificultades de escritura, sin coste de API ni envío de datos.
- Despliegue en dispositivos embebidos o Raspberry Pi: al ser un GGUF estándar de 2,1 GB, puede ejecutarse con llama.cpp en placas con 4-8 GB de RAM, aunque el rendimiento no está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 2,5-3 GB con la cuantización Q4_0 de 2,1 GB, más overhead del runtime de llama.cpp y de la ventana de contexto activa.
- GPU recomendadas: no disponibles en la información proporcionada; para el caso móvil, la app LlamaPal ejecuta en CPU del teléfono (no se especifica aceleración GPU).
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050 en adelante), aunque este dato no está confirmado en la información disponible.
- Cabe en móvil Android: sí, es el propósito declarado del repositorio; se requiere almacenamiento libre de al menos 2,1 GB y RAM suficiente (no especificada).
- Opciones de despliegue: llama.cpp, aplicaciones basadas en llama.cpp (LlamaPal), y por extensión Ollama u otros frontends compatibles con GGUF (no confirmado explícitamente en la información).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Granite 4.2 3B (este espejo, Q4_0) | 3,66B | 128K | Apache 2.0 | GGUF | Thinking, código, tool use, 12 idiomas |
| Alternativas de 3B comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks ni de modelos comparables en la información proporcionada |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Este repositorio es un espejo sin modificaciones: no aporta mejoras, ajustes ni garantías propias; cualquier problema de calidad debe atribuirse al modelo base de IBM.
- La cuantización Q4_0 introduce pérdida de precisión respecto a los pesos originales; puede degradar tareas sensibles como matemáticas o código complejo.
- Riesgo de alucinación inherente a un modelo de 3B parámetros; no se han publicado evaluaciones de fiabilidad en la información disponible.
- No se especifican los 12 idiomas concretos ni la calidad relativa por idioma; el rendimiento en castellano no está documentado.
- El contexto de 128K es teórico; en un dispositivo móvil, la memoria disponible limitará en la práctica la ventana utilizable.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar el archivo `LICENSE` del repositorio y la model card original de IBM para los términos completos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de comunidad ni de validación independiente del archivo.
- La fecha de creación indicada (2026-11-17) es futura respecto a la información habitual de referencia; conviene verificar la integridad del archivo mediante el SHA-256 publicado.

## Enlaces

- Repositorio del espejo: https://huggingface.co/LlamaPal/granite-4.2-3b-Q4_0-GGUF
- Modelo base en Hugging Face: https://huggingface.co/ibm-granite/granite-4.2-3b
- Repositorio GGUF original de IBM: https://huggingface.co/ibm-granite/granite-4.2-3b-GGUF
- Commit del archivo original: https://huggingface.co/ibm-granite/granite-4.2-3b-GGUF/tree/c40945d71cd90f249a56985e8155551a9188dc30
- App LlamaPal en Google Play: https://play.google.com/store/apps/details?id=com.vishistv.llamapal
- Sitio web de LlamaPal: https://llamapal.cc/
- Instagram de LlamaPal: https://www.instagram.com/llamapalhq/
