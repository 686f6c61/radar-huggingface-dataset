# hanemay/smartsightCoach

## Resumen

SmartSight Coach es un asistente de fitness y nutrición que se ejecuta íntegramente en el dispositivo móvil, sin necesidad de cuenta, servidor ni conexión a internet. Es un fine-tune LoRA sobre el checkpoint cuantizado `google/gemma-4-E2B-it-qat-q4_0-unquantized` de Google DeepMind, un modelo de lenguaje y visión (VLM) de 5,12 mil millones de parámetros cuyos pesos están condicionados para sobrevivir al redondeo de cuantización int4. El proyecto lo mantiene Niclas Bade y se distribuye bajo licencia CC0-1.0 (dedicación a dominio público).

La versión actual (v55, promovida el 2026-08-18) resuelve un defecto crítico de las versiones anteriores: la lectura de porcentaje de grasa corporal a partir de fotografías era una constante que no dependía de la imagen. El problema se corrigió mezclando 1.730 filas de datos de visión (~17 %) dentro del corpus de texto de 8.498 filas, lo que restauró la sensibilidad del modelo a las imágenes sin cambiar la arquitectura. El artefacto resultante es un único archivo de 2,80 GB en formato `.litertlm` para inferencia en Android e iOS.

La relevancia de este modelo radica en su enfoque de privacidad radical: todo el procesamiento ocurre en el teléfono, eliminando la dependencia de APIs en la nube. Además, documenta de forma transparente las métricas de regresión y los costes conocidos de cada iteración, algo poco habitual en fine-tunes comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de lenguaje y visión (VLM), base Gemma 4 E2B de Google DeepMind, fine-tune LoRA |
| Parametros totales | 5.123.178.051 (~5,12 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | int4 (blockwise-64) en capas fully-connected del decoder; int8 (dynamic_wi8_afp32) en el encoder de visión |
| Idiomas soportados | No disponible |
| Licencia | CC0-1.0 (dominio público) |
| Formato de pesos | safetensors y `.litertlm` (LiteRT LM) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `google/gemma-4-E2B-it-qat-q4_0-unquantized`, un modelo de Google DeepMind entrenado con quantization-aware training (QAT) para que sus pesos toleren el redondeo a 4 bits sin degradación significativa. Sobre esta base se aplica un fine-tune LoRA de 410 tensores, todos ellos en las capas de lenguaje (0 tensores de visión), con el objetivo de convertirlo en un coach de fitness y nutrición conversacional.

El entrenamiento combina un corpus de texto de 8.498 filas con 1.730 filas de datos de visión (~17 %) que incluyen lecturas de porcentaje de grasa corporal a partir de fotografías reales. La innovación clave de la v55 fue mezclar las filas de visión directamente en el corpus de texto en lugar de apilar un adaptador LoRA de visión separado: los experimentos del autor muestran que un adaptador de visión apilado sobre un LoRA de texto no restaura la sensibilidad a las imágenes (0,0382 de desviación estándar por escalón), mientras que la mezcla en el corpus sí lo hace (0,2183), superando incluso la sensibilidad del modelo base sin LoRA (0,1164).

El entrenamiento se realizó con una sola semilla (seed 456) para la v55, a diferencia de la v54 que tuvo réplicas con seed 123. El artefacto final es un único archivo fusionado de 2,80 GB que combina el LoRA de texto y la torre de visión, cuantizado a int4 en las capas fully-connected del decoder e int8 en el encoder de visión.

## Capacidades

- Generación de texto conversacional para coaching de fitness y nutrición en tiempo real.
- Lectura de porcentaje de grasa corporal a partir de fotografías (error de 3,42 puntos porcentuales sobre 42 fotos reales en v55).
- Seguimiento de cambios corporales a lo largo del tiempo: precisión del 95 % en la dirección del cambio (ganancia o pérdida) y reporte de ~77 % de la magnitud real del cambio.
- Interpretación del historial de entrenamiento de 7 días, distinguiendo correctamente entre sesiones de hoy y de ayer (27/32 en v54, 22/32 en v55).
- Rechazo de invenciones fuera de la ventana temporal de 7 días (32/32 en todas las versiones recientes).
- Inferencia completamente en el dispositivo (on-device) sin conexión a servidores.
- Soporte de tool calling: no disponible (no documentado).
- Capacidades multilingües: no disponibles.

## Casos de uso

- Entrenador personal en el móvil sin conexión: el usuario puede mantener conversaciones multi-turno sobre su rutina de entrenamiento y nutrición sin necesidad de conexión a internet ni cuenta, gracias al formato `.litertlm` optimizado para LiteRT en Android e iOS.
- Análisis de composición corporal por fotografía: el usuario se hace una foto y el modelo estima su porcentaje de grasa corporal con un error medio de 3,42 puntos porcentuales, sin enviar la imagen a ningún servidor.
- Seguimiento de progreso físico: al comparar fotos de distintas fechas, el modelo determina con un 95 % de precisión si el usuario ha ganado o perdido grasa y reporta aproximadamente el 77 % de la magnitud real del cambio, lo que permite monitorizar la evolución semanal.
- Consulta de historial de entrenamiento: el modelo lee correctamente la celda correcta de la línea de historial de 7 días, distinguiendo entre sesiones de hoy y de ayer, y se niega a inventar sesiones fuera de esa ventana temporal.
- Coaching nutricional privado: al no haber round-trip al servidor, los datos dietéticos y corporales del usuario nunca abandonan el dispositivo, lo que lo hace adecuado para usuarios preocupados por la privacidad de sus datos de salud.
- Asistente de fitness para dispositivos con recursos limitados: con un artefacto de 2,80 GB y cuantización int4, el modelo cabe en smartphones modernos con 4 GB de RAM o más, sin necesidad de GPU dedicada ni hardware de servidor.

## Benchmarks y rendimiento

Los datos de rendimiento provienen de los harness de evaluación internos del autor, no de benchmarks públicos estandarizados. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

| Prueba | v51 | v54 (seed 456) | v55 |
|---|---|---|---|
| Sonda de texto day-line (n=128) | 103 | 110 | 112 |
| `day_absent` / `day_logged` | — | 32/32 | 32/32 |
| `outside_window` | — | 32/32 | 26/32 |
| `today_ref` | 14/32 | 27/32 | 22/32 |
| Sonda sized (n=64) | 38/64 | 50/64 | — |
| Error de lectura decodificada (42 fotos reales) | — | 9,13 pp | 3,42 pp |
| Precisión de dirección de cambio | — | 19 % | 95 % |
| Magnitud de cambio reportada (ganancia) | — | 0,14 | 0,77 |
| Ruido mismo cuerpo | — | 0,00 pp | 1,10 pp |
| Sensibilidad a imagen (SD por escalón) | — | 0,0405 | 0,2183 |

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto fusionado pesa 2,80 GB en formato `.litertlm` con cuantización int4 en las capas fully-connected del decoder, por lo que requiere aproximadamente 3 GB de memoria disponible en el dispositivo.
- GPU recomendadas: ninguna; el modelo está diseñado para ejecutarse en la NPU o CPU de smartphones Android e iOS modernos mediante LiteRT.
- Compatibilidad con GPU de consumo: no aplica; el objetivo es el despliegue en móvil, no en GPU de escritorio o servidor.
- Opciones de despliegue: LiteRT (litert-lm) para Android/iOS; el formato safetensors permite conversión a otros runtimes si se desea.
- Latencia y throughput: no disponibles; el autor no publica métricas de latencia en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Artefacto | Sensibilidad a imagen (SD) | Error lectura grasa | Licencia |
|---|---|---|---|---|---|---|
| smartsightCoach v55 | 5,12 B | int4/int8 | 2,80 GB `.litertlm` | 0,2183 | 3,42 pp | CC0-1.0 |
| Base `gemma-4-E2B-it-qat-q4_0-unquantized` | 5,12 B | QAT int4 | No disponible | 0,1164 | No disponible | No disponible |
| smartsightCoach v54 | 5,12 B | int4/int8 | 2,80 GB `.litertlm` | 0,0405 | 9,13 pp | CC0-1.0 |

La comparativa muestra que la v55 supera al modelo base sin LoRA en sensibilidad a imágenes (0,2183 frente a 0,1164) y mejora sustancialmente el error de lectura de grasa corporal frente a la v54 (3,42 pp frente a 9,13 pp). No se dispone de datos de otros modelos comparables de la misma categoría (coaches de fitness on-device) en la información proporcionada.

## Limitaciones y advertencias

- Regresión en `today_ref`: la precisión para leer el día correcto del historial cayó de 27/32 (v54) a 22/32 (v55), y empeora monótonamente al aumentar la proporción de datos de visión en el corpus (0 % → 27, 17 % → 22, 29 % → 12).
- Pérdida del concepto de estrías musculares: la v55 responde "no" sistemáticamente cuando se le pregunta si se aprecian fibras musculares finas, mientras que el modelo base distingue correctamente entre cuerpos magros (62 % de sí) y con mayor grasa (0 %). Las características dependientes de señales visuales finas no son fiables.
- Entrenamiento con una sola semilla: la v55 se entrenó y promovió únicamente con seed 456, sin réplica con seed 123 como sí tuvo la v54. Las ganancias de visión están fuera del ruido de decodificación, pero el margen de +2 en la sonda de texto está dentro de él.
- Proveniencia de la evidencia: las cifras de lectura de fotos y señales de la v55 provienen de scripts de evaluación que habían sido editados para evaluar también un candidato posterior en el mismo proceso, por lo que no se re-midieron de forma aislada antes de la promoción. La puntuación de texto 112/128 sí corresponde exclusivamente a la v55.
- Sesgos conocidos: no se documentan sesgos demográficos o de tipo de cuerpo en la información disponible.
- Riesgo de alucinación: el modelo puede inventar sesiones de entrenamiento fuera de la ventana de 7 días si se le presiona, aunque la v54 y v55 puntúan 32/32 en la prueba `outside_window` que evalúa este comportamiento.
- Restricciones de licencia: la licencia CC0-1.0 permite uso comercial sin restricciones, pero el modelo base `google/gemma-4-E2B-it-qat-q4_0-unquantized` puede tener sus propios términos que conviene verificar antes de un despliegue comercial.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están documentados en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hanemay/smartsightCoach
- Perfil del autor: https://huggingface.co/hanemay
- Sitio del producto: https://www.smartsight.app/ai-coach
- Perfil de LinkedIn del autor: https://www.linkedin.com/in/niclas-bade/
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized
