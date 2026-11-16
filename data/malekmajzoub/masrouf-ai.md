# malekmajzoub/masrouf-ai

## Resumen

Masrouf AI es un modelo de lenguaje especializado en asistencia financiera conversacional, desarrollado por el usuario malekmajzoub como componente del asistente en el dispositivo (on-device) de la aplicación de gestión de dinero Masrouf. Se trata de un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3-1.7B, un transformer denso de 1.720.574.976 parámetros, orientado a interpretar mensajes de usuario en inglés, árabe libanés, arabizi (árabe transliterado con caracteres latinos) o mezclas de estos idiomas, y a generar respuestas breves en el formato de respuesta propio de la aplicación.

El modelo resuelve un problema muy concreto: transformar mensajes financieros informales y multilingües en una estructura de respuesta que la app pueda procesar, y redactar contestaciones cortas a partir de hechos que la propia aplicación calcula. Un aspecto destacable es su enfoque de privacidad: según la model card, el modelo fue entrenado exclusivamente con personas, nombres y mensajes ficticios, y no accede a datos reales de usuarios. Esto lo posiciona como un componente de inferencia local dentro de una arquitectura donde el procesamiento sensible permanece en el dispositivo.

Su relevancia actual radica en la combinación de tres factores: un tamaño reducido (1,7 mil millones de parámetros) que permite ejecución local, una distribución en formato GGUF cuantizado Q4_K_M de aproximadamente 1 GB, y una licencia Apache 2.0 que facilita su integración comercial. El modelo se publica como un artefacto empaquetado para despliegue en teléfono, no como un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen/Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el repo incluye el fichero `masrouf-1.7b-r5-q4km.gguf` |
| Idiomas soportados | Ingles, arabe (libanes), arabizi y mezclas de estos |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado Q4_K_M); el modelo base dispone de safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-1.7B, un transformer denso de 1,7 mil millones de parámetros. No se dispone de información detallada sobre la composición exacta de la arquitectura interna (número de capas, dimensiones de atención, tipo de atención) más allá de lo que aporta el modelo base. El ajuste fino se realizó sobre Qwen/Qwen3-1.7B con el objetivo de adaptarlo a dos tareas específicas: la lectura de mensajes entrantes (en inglés, árabe libanés, arabizi o mezclas) para mapearlos al formato de respuesta de Masrouf, y la generación de respuestas cortas a partir de hechos calculados por la aplicación.

Según la model card, el entrenamiento utilizó únicamente datos sintéticos: personas, nombres y mensajes inventados. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El identificador del fichero (`r5`) sugiere una quinta revisión o iteración del ajuste, aunque no se detalla su significado. El resultado se distribuye exclusivamente como GGUF cuantizado Q4_K_M, lo que indica que el autor priorizó la eficiencia de despliegue en dispositivo sobre la preservación de pesos en precisión completa.

## Capacidades

- Interpretación de mensajes financieros en inglés, árabe libanés, arabizi y mezclas de idiomas, mapeándolos al formato de respuesta de la aplicación Masrouf.
- Generación de respuestas breves a partir de hechos que la aplicación calcula previamente, sin acceso a datos reales de usuarios.
- Conversación multi-turno en el contexto de asistencia financiera (etiqueta `conversational` en los metadatos).
- Ejecución on-device: el formato GGUF Q4_K_M permite inferencia local en dispositivos con recursos limitados.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a través de la infraestructura de endpoints de Hugging Face.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Asistente financiero en el teléfono: el modelo se ejecuta localmente dentro de la app Masrouf para interpretar los mensajes del usuario y generar respuestas en el formato esperado, sin enviar datos a servidores externos.
- Procesamiento de mensajes multilingües informales: usuarios que escriben en árabe libanés, arabizi o mezclas de inglés y árabe pueden interactuar con la app sin necesidad de cambiar de idioma ni de registro.
- Clasificación y normalización de entradas: el modelo convierte mensajes no estructurados en la estructura de respuesta que la aplicación necesita para continuar su flujo lógico.
- Generación de respuestas a partir de hechos calculados: la app calcula saldos, categorías o resúmenes y el modelo redacta una contestación breve y natural para el usuario.
- Escenarios de privacidad estricta: al ejecutarse en el dispositivo y haberse entrenado solo con datos sintéticos, encaja en productos financieros donde el tratamiento de datos personales está regulado y se prefiere el procesamiento local.
- Prototipado de asistentes conversacionales de dominio específico: sirve como ejemplo de ajuste fino de un modelo de 1,7B para una tarea vertical con formato de salida fijo, replicable en otros dominios con requisitos similares de privacidad y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF Q4_K_M ocupa 1056 MB, por lo que la inferencia requiere aproximadamente 1,1-1,5 GB de memoria, dependiendo del backend y del contexto utilizado.
- GPU recomendadas: no se especifican. Por tamaño, el modelo puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores; también es viable en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2 GB de VRAM libre; el diseño está orientado a ejecución en teléfono.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; también es compatible con endpoints de Hugging Face según los metadatos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Masrouf AI | 1,72B | No disponible | Apache 2.0 | GGUF Q4_K_M | Ajuste fino de dominio financiero, multilingüe en/ar, orientado a on-device |
| Qwen/Qwen3-1.7B (base) | 1,72B | No disponible | Apache 2.0 | Safetensors, GGUF | Modelo generalista del que deriva; no especializado en el formato de Masrouf |
| Alternativas de ~1-2B para on-device | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Modelo de dominio muy restringido: está ajustado para el formato de respuesta de Masrouf y para mensajes financieros; su rendimiento fuera de ese contexto no está documentado y probablemente sea limitado.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas incorrectas; la model card indica que las respuestas se construyen a partir de hechos calculados por la app, lo que mitiga pero no elimina el riesgo.
- Idiomas limitados: solo se documentan inglés, árabe libanés y arabizi; no hay soporte declarado para castellano ni para otros idiomas.
- Longitud de contexto no documentada: se desconoce la ventana máxima, lo que dificulta planificar conversaciones largas.
- Datos de entrenamiento sintéticos: no se especifica el volumen ni la diversidad del dataset, por lo que no puede evaluarse la cobertura de casos reales.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar las obligaciones de atribución.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: proyecto muy reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malekmajzoub/masrouf-ai
- Modelo base Qwen/Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
