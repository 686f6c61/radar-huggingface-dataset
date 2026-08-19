# JeremyChen0601/lingoloop-allosaurus-service

## Resumen

LingoLoop Allosaurus es un servicio complementario de evaluación de pronunciación acústica desarrollado por JeremyChen0601 como parte de la plataforma LingoLoop, una aplicación de aprendizaje de idiomas con motor de IA. El servicio procesa audio de micrófono, lo convierte a WAV mono, reconoce fonemas mediante el modelo Allosaurus, genera fonemas de referencia con eSpeak NG, alinea ambas secuencias y devuelve métricas de precisión, completitud, fluidez y pistas a nivel de fonema. Está diseñado para desplegarse como contenedor Docker o en Render Free, y se integra con el sitio web de LingoLoop mediante una clave compartida.

El modelo subyacente, Allosaurus, es un reconocedor de fonemas preentrenado y universal que cubre múltiples idiomas, con un modelo dedicado para inglés. El servicio expone un endpoint de evaluación protegido por secreto compartido, y se presenta como experimental para idiomas distintos del inglés, con la advertencia explícita de que las puntuaciones no deben considerarse clínicas ni de certificación. No se trata de un modelo de lenguaje grande, sino de un pipeline de procesamiento de audio para tareas específicas de pronunciación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Servicio Docker con pipeline de audio: Allosaurus (reconocimiento de fonemas) + eSpeak NG (generación de fonemas de referencia) + alineamiento de secuencias |
| Parametros totales | no disponible (depende del modelo Allosaurus subyacente) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (procesa audio, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Universal (modelo Allosaurus universal) con modelo dedicado para inglés; experimental para otros idiomas |
| Licencia | no disponible |
| Formato de pesos | no disponible (servicio empaquetado en Docker) |

## Arquitectura y entrenamiento

El servicio no es un modelo entrenado desde cero, sino un pipeline que combina componentes existentes. Allosaurus es un modelo de reconocimiento de fonemas preentrenado que predice fonemas independientes del idioma (modelo universal) o específicos de un idioma (como el modelo dedicado para inglés). eSpeak NG es un sintetizador de voz que genera la secuencia de fonemas de referencia a partir del texto esperado. El servicio alinea las dos secuencias de fonemas (la reconocida y la de referencia) para calcular métricas de precisión, completitud y fluidez, además de proporcionar pistas correctivas a nivel de fonema.

No se dispone de información sobre el entrenamiento del modelo Allosaurus subyacente (número de tokens, composición del dataset, técnicas de RLHF o DPO). El servicio en sí no implica entrenamiento adicional; es una aplicación de inferencia que orquesta estos componentes. La innovación técnica reside en la integración y el alineamiento automático de fonemas para generar retroalimentación pedagógica en tiempo real.

## Capacidades

- Evaluación de pronunciación acústica: convierte audio de micrófono a WAV mono y procesa la señal para reconocer fonemas.
- Reconocimiento de fonemas multilingüe: utiliza el modelo universal de Allosaurus que cubre muchos idiomas, con un modelo dedicado para inglés.
- Generación de fonemas de referencia: emplea eSpeak NG para producir la secuencia de fonemas esperada a partir del texto.
- Alineamiento de secuencias: compara la secuencia reconocida con la de referencia para calcular métricas.
- Métricas de rendimiento: devuelve precisión, completitud, fluidez y pistas a nivel de fonema.
- Integración con plataforma web: expone un endpoint protegido por secreto compartido para uso exclusivo de LingoLoop.
- Despliegue en contenedor: compatible con Docker y Render Free, con soporte para suspensión automática en el plan gratuito.

## Casos de uso

- Práctica de pronunciación en aplicaciones de aprendizaje de idiomas: el servicio puede integrarse en LingoLoop para que los estudiantes reciban retroalimentación inmediata sobre su pronunciación, con pistas específicas sobre qué fonemas corregir.
- Evaluación formativa en entornos educativos: profesores de idiomas pueden usar la herramienta para evaluar de forma automatizada la pronunciación de sus alumnos, obteniendo métricas objetivas de precisión y fluidez.
- Entrenamiento de habla para actores o locutores: profesionales que necesitan mejorar su dicción pueden utilizar el servicio para identificar errores fonéticos específicos y practicar de manera dirigida.
- Desarrollo de asistentes de pronunciación personalizados: desarrolladores pueden integrar el servicio en sus propias aplicaciones de idiomas, aprovechando el pipeline de evaluación sin necesidad de implementar reconocimiento de fonemas desde cero.
- Investigación en fonética aplicada: investigadores pueden usar el servicio para analizar grabaciones de habla y obtener anotaciones fonéticas automáticas, aunque con la limitación de que no es apto para fines clínicos.
- Pruebas de calidad de síntesis de voz: el servicio puede comparar la pronunciación de un hablante con la referencia generada por eSpeak NG, útil para evaluar la naturalidad de sistemas TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El servicio no presenta métricas comparativas con otros sistemas de evaluación de pronunciación, y no hay datos sobre precisión del reconocimiento de fonemas en diferentes idiomas o condiciones de audio.

## Requisitos de hardware

- No se especifican requisitos mínimos de VRAM o GPU en la documentación proporcionada.
- El servicio está diseñado para ejecutarse en contenedores Docker, lo que sugiere que puede funcionar en CPU, dado que Allosaurus es un modelo relativamente ligero en comparación con LLMs.
- En Render Free, el servicio se suspende tras 15 minutos sin tráfico, lo que implica que la primera solicitud puede tardar más debido al arranque en frío.
- Opciones de despliegue: Docker local, Render Free (con blueprint `render.yaml`), o cualquier plataforma que soporte contenedores Docker.
- No se dispone de datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de información sobre modelos o servicios comparables en la documentación proporcionada. El servicio es específico de la plataforma LingoLoop y no se han identificado alternativas directas con las mismas características en la búsqueda web.

## Limitaciones y advertencias

- El modelo universal de Allosaurus es experimental para todos los idiomas excepto el inglés, por lo que las puntuaciones en otros idiomas pueden ser menos fiables.
- Las puntuaciones no deben presentarse como evaluación clínica o de certificación; el servicio es solo para fines educativos.
- El endpoint de evaluación está protegido por un secreto compartido (`ALLOSAURUS_SHARED_SECRET` y `ALLOSAURUS_SERVICE_KEY`), y su uso anónimo fuera de LingoLoop no está permitido.
- No se especifica la licencia del servicio ni de los modelos subyacentes, lo que puede limitar su uso comercial o redistribución.
- El servicio depende de la disponibilidad de eSpeak NG y Allosaurus, cuyas actualizaciones o mantenimiento no están garantizados.
- En el plan gratuito de Render, el servicio se suspende tras inactividad, lo que puede afectar a la experiencia del usuario en aplicaciones en tiempo real.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JeremyChen0601/lingoloop-allosaurus-service
- Repositorio de Allosaurus (xinjli/allosaurus): https://github.com/xinjli/allosaurus
- Sitio web de LingoLoop: https://lingoloop.me/
- Repositorio de LingoLoop (jemhakdog/LingoLoop): https://github.com/jemhakdog/LingoLoop
- Perfil de GitHub del autor: https://github.com/Jeremychen0601
