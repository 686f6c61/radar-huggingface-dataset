# Ashraf01k/vernacular-pedagogy-santhali

## Resumen

El repositorio `Ashraf01k/vernacular-pedagogy-santhali` contiene un conjunto de modelos de IA edge listos para producción, diseñados para traducir texto del hindi al santhali y sintetizar voz natural en santhali. Fue desarrollado por Ashraf01k como parte de la iniciativa Vernacular Pedagogy, con el objetivo de facilitar la educación primaria en lenguas maternas para los grados 1-3 en la India. El paquete incluye un modelo TTS VITS de aproximadamente 60.6 MB, un modelo de traducción neuronal CTranslate2 INT8 de unos 286.7 MB y una base de datos SQLite con 368 interacciones de aula verificadas. El tamaño total del repositorio es de 0.7 GB. Su relevancia radica en abordar la escasez de recursos lingüísticos para el santhali, permitiendo a maestros no nativos impartir clases en la lengua materna de los estudiantes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (TTS) y modelo de traducción neuronal CTranslate2 (arquitectura no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje generativo) |
| Tipos de cuantizacion | INT8 para NMT (CTranslate2); ONNX para TTS (sin especificar) |
| Idiomas soportados | Santhali (sat), Hindi (hin) |
| Licencia | MIT |
| Formato de pesos | ONNX, CTranslate2 (tar.gz), SQLite |

## Arquitectura y entrenamiento

El paquete se compone de tres artefactos principales. El primero es un modelo TTS end-to-end basado en VITS, empaquetado como ONNX para su uso con Piper, entrenado con datos de voz de múltiples hablantes procedentes de los conjuntos IndicVoices-R y XKaab de AI4Bharat. El segundo es un modelo de traducción neuronal cuantizado a INT8 en formato CTranslate2, que traduce de hindi en escritura Devanagari a santhali en escritura Ol Chiki; la arquitectura subyacente no se especifica en la documentación, aunque CTranslate2 es una biblioteca de inferencia para modelos Transformer. El tercero es una caché SQLite con índice B-Tree que almacena 368 interacciones de aula verificadas, optimizada para consultas de menos de 0.1 ms. No se proporcionan datos sobre el número de tokens de entrenamiento, la composición exacta de los datasets ni técnicas de alineación como RLHF o DPO.

## Capacidades

- Traducción automática de hindi a santhali en escritura Ol Chiki.
- Síntesis de voz natural en santhali con múltiples hablantes mediante el modelo VITS.
- Ejecución offline en dispositivos edge, optimizada para CPU móvil.
- Caché de léxico FLN con consultas de muy baja latencia (<0.1 ms).
- No soporta tool calling, function calling ni razonamiento multi-paso, al ser un pipeline de traducción y TTS, no un modelo de lenguaje generativo.
- Idiomas soportados: hindi (entrada) y santhali (salida).

## Casos de uso

- Educación primaria FLN: maestros no hablantes de santhali pueden traducir consignas de aula desde hindi y sintetizarlas como audio, permitiendo la enseñanza en lengua materna sin formación lingüística previa.
- Aplicación móvil offline para escuelas rurales: el modelo se ejecuta en CPU móvil, por lo que puede desplegarse en dispositivos sin conexión, ideal para zonas con conectividad limitada.
- Generación de materiales de lectura en Ol Chiki: el modelo de traducción produce texto en escritura Ol Chiki, que puede usarse para crear fichas y cuadernos de alfabetización.
- Asistente de voz para estudiantes: el TTS puede leer en voz alta comandos y lecciones en santhali, reforzando la comprensión oral en el aula.
- Traducción de contenido curricular para el gobierno de Jharkhand: el paquete puede integrarse en sistemas de gestión de aprendizaje para adaptar materiales educativos a lenguas tribales.
- Formación de profesores en alfabetización básica: los módulos de traducción y síntesis permiten crear ejercicios interactivos que los docentes pueden usar para practicar la pronunciación y el vocabulario en santhali.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Factor de tiempo real (RTF) en síntesis | 0.051 – 0.081 |
| Latencia de síntesis por comando | 41 ms – 87 ms |
| Latencia de traducción por frase | <120 ms |
| Latencia de consulta del léxico SQLite | <0.1 ms |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica, los modelos están diseñados para ejecutarse en CPU.
- GPU recomendadas: no disponible; la optimización está orientada a CPU móvil, no a GPU.
- Puede ejecutarse en dispositivos móviles y ordenadores de placa reducida (single-board computers).
- Opciones de despliegue: ONNX Runtime para el modelo TTS, CTranslate2 para el modelo de traducción y Piper como runtime de síntesis.
- Latencia y throughput: los valores indicados en la sección de benchmarks corresponden a una CPU estándar.

## Comparativa con modelos similares

No se han publicado resultados de benchmarks comparativos en la información disponible. No se dispone de datos sobre modelos equivalentes de traducción hindi-santhali o TTS santhali para comparar.

## Limitaciones y advertencias

- El alcance funcional se limita a los idiomas hindi y santhali, con escritura Ol Chiki para la salida.
- Los datos de entrenamiento proceden de conjuntos específicos (IndicVoices-R y XKaab), lo que puede limitar la calidad en dominios fuera del contexto de aula.
- El modelo de traducción puede producir errores en frases complejas o con vocabulario técnico; no es un modelo generativo y no puede razonar ni mantener contexto conversacional.
- La licencia MIT permite uso comercial, pero requiere atribución al proyecto Vernacular Pedagogy.
- El TTS está optimizado para comandos cortos de aula, por lo que puede degradarse en narraciones largas.
- No se ha proporcionado información sobre sesgos, evaluación de seguridad ni comportamiento ante entradas adversariales.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/Ashraf01k/vernacular-pedagogy-santhali
- Repositorio del proyecto Vernacular Pedagogy: https://github.com/AshrafGalaxy/Vernacular_Pedagogy
- Descripción del problema SIH26042 en Smart India Hackathon: https://sih2026.vuce.in/ps/SIH26042
