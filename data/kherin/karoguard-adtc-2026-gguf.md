# kherin/karoguard-adtc-2026-gguf

## Resumen

KaroGuard es un asistente conversacional offline de apoyo a la toma de decisiones agrícolas y de resiliencia ante ciclones, desarrollado por el autor kherin para pequeños agricultores de Mauricio y otras comunidades africanas y del océano Índico expuestas a ciclones. El modelo se distribuye como un artefacto GGUF cuantizado en Q4_K_M, derivado del modelo base Qwen/Qwen3-4B-Instruct-2507, y está diseñado para ejecutarse localmente mediante llama.cpp, sin necesidad de conexión a internet.

El problema que resuelve es la falta de acceso a información fiable y actualizada en zonas rurales con infraestructura de comunicaciones limitada, especialmente durante emergencias ciclónicas. KaroGuard ofrece orientación concisa sobre preparación ante ciclones, evaluación de daños post-ciclón y planificación de recuperación de cultivos, integrando una política de chat-template orientada a la seguridad que prioriza la claridad y la referencia a fuentes oficiales.

Su relevancia actual radica en la creciente frecuencia e intensidad de ciclones tropicales en el suroeste del océano Índico, y en la necesidad de soluciones de IA que funcionen en entornos con recursos limitados. Con aproximadamente 4 000 millones de parámetros y un tamaño de repositorio de 2,5 GB, el modelo puede desplegarse en hardware modesto, lo que lo convierte en una opción práctica para organizaciones humanitarias y agencias de extensión agrícola.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3-4B-Instruct-2507) |
| Parametros totales | 4 022 468 096 (~4B) |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es una cuantización GGUF Q4_K_M del modelo base Qwen/Qwen3-4B-Instruct-2507, convertido con llama.cpp (revisión b10424). La arquitectura subyacente es un transformer denso de aproximadamente 4 000 millones de parámetros, originalmente entrenado por Alibaba para tareas de instrucción y conversación. No se dispone de información detallada sobre el número de capas, dimensiones ocultas o cabezas de atención en la documentación proporcionada.

El autor de KaroGuard no ha realizado un entrenamiento adicional sobre el modelo base; en su lugar, ha añadido una política de chat-template específica para el dominio de evacuación por ciclones y recuperación agrícola. Esta política modifica el comportamiento conversacional del modelo para que sus respuestas sean concisas, orientadas a la seguridad y referencien siempre las fuentes oficiales. No se han publicado datos sobre el dataset utilizado para ajustar esta política, ni sobre procesos de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en inglés, con respuestas concisas y orientadas a la acción.
- Asistencia en preparación ante ciclones: recomendaciones sobre protección de cultivos, aseguramiento de infraestructuras y planes de evacuación.
- Evaluación post-ciclón: ayuda a identificar daños en cultivos, suelo y estructuras, y a priorizar acciones de respuesta.
- Planificación de recuperación: sugerencias para restablecer la producción agrícola, manejo de plagas y enfermedades tras el evento.
- Funcionamiento completamente offline mediante llama.cpp, sin dependencia de servicios en la nube.
- Política de chat-template de seguridad que enfatiza la referencia a boletines meteorológicos y servicios de emergencia.
- Compatible con endpoints de inferencia locales (endpoints_compatible) y con cuantización imatrix.

## Casos de uso

- Preparación comunitaria ante ciclones: una organización de extensión agrícola despliega KaroGuard en un portátil con llama.cpp y lo utiliza en talleres para que los agricultores consulten qué medidas tomar 48 horas antes de la llegada de un ciclón (proteger semilleros, asegurar invernaderos, almacenar forraje).
- Evaluación rápida de daños tras el paso del ciclón: un técnico de campo introduce observaciones sobre el estado de los cultivos y el modelo sugiere un protocolo de evaluación de daños, priorizando zonas con mayor riesgo de pérdida.
- Planificación de recuperación de cultivos: tras un ciclón, el agricultor consulta qué cultivos de rotación son más resistentes a condiciones de humedad y viento, y el modelo recomienda calendarios de siembra adaptados a la temporada.
- Asistencia offline en zonas sin conectividad: en comunidades rurales de Mauricio sin acceso a internet, el modelo se ejecuta en un dispositivo local y responde preguntas frecuentes sobre resiliencia climática, sin depender de la red.
- Apoyo a organizaciones humanitarias: ONG que trabajan en el océano Índico integran KaroGuard en sus kits de respuesta de emergencia para proporcionar información consistente a los agricultores afectados, incluso cuando los equipos no tienen conexión.
- Formación y concienciación: escuelas de agronomía y programas de extensión utilizan el modelo como herramienta educativa para enseñar prácticas de agricultura resiliente al clima, con ejemplos concretos de preparación y recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del archivo GGUF: aproximadamente 2,5 GB (tamaño del repositorio), lo que implica un uso de memoria de alrededor de 2,5-3 GB para inferencia con contexto moderado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 2060, RTX 3060) puede ejecutar el modelo con comodidad. También es viable en CPU con 8 GB de RAM, aunque con mayor latencia.
- Cabe en GPU de consumo: sí, en la mayoría de las GPU de gama media y alta actuales.
- Opciones de despliegue: llama.cpp es el runtime principal; también puede usarse con servidores compatibles con GGUF como llama.cpp server, o convertirse a otros formatos si se desea.
- Latencia y throughput: no disponibles en la documentación; se estima que en una GPU de 8 GB de VRAM la generación de tokens es fluida para uso interactivo, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de la misma categoría. El modelo base Qwen3-4B-Instruct-2507 es el punto de referencia natural, pero no se han publicado datos de rendimiento comparativo en la documentación de KaroGuard. Se recomienda consultar los benchmarks del modelo base para una evaluación preliminar.

## Limitaciones y advertencias

- El modelo es únicamente un apoyo informativo para la toma de decisiones; no sustituye a los servicios de emergencia, autoridades meteorológicas ni agrónomos cualificados.
- Las respuestas pueden contener alucinaciones o información desactualizada; los usuarios deben verificar siempre con fuentes oficiales.
- Solo está disponible en inglés, lo que limita su uso en comunidades donde el inglés no es la lengua principal.
- La política de chat-template de seguridad no garantiza que el modelo siempre priorice la seguridad; se recomienda supervisión humana en contextos críticos.
- La licencia Apache-2.0 permite uso comercial, pero es necesario revisar los términos del modelo base Qwen3-4B-Instruct-2507 para asegurar el cumplimiento.
- No se han publicado evaluaciones de sesgos o riesgos específicos para el dominio agrícola; se recomienda probar el modelo en escenarios reales antes de un despliegue a gran escala.

## Enlaces

- HuggingFace: https://huggingface.co/kherin/karoguard-adtc-2026-gguf
- Repositorio GitHub: https://github.com/kherin/karoguard-adtc-2026-submission
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
