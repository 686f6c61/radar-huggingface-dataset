# Phoonnx/vits-ur_pk-aegis_female-medium-espeak

## Resumen

vits-ur_pk-aegis_female-medium-espeak es una voz de síntesis de voz (text-to-speech) en urdu de Pakistán (ur-PK), convertida al formato ONNX para su uso con la librería phoonnx. El modelo original es una voz Piper basada en la arquitectura VITS, entrenada por mahwizzzz y publicada dentro del repositorio rhasspy/piper-voices. TigreGotico Lda realizó la conversión a ONNX sin modificar los pesos, y la publica bajo el identificador Phoonnx en Hugging Face.

El modelo resuelve la necesidad de generar audio en urdu con una voz femenina de calidad media (categoría "medium" de Piper) a partir de fonemas IPA producidos por espeak-ng. Su tamaño es reducido (gráfico de 63,5 MB en fp32, repositorio de 0,1 GB) y su tasa de muestreo es de 22050 Hz, lo que lo hace adecuado para despliegues ligeros en CPU.

Es relevante ahora porque amplía el ecosistema de voces Piper disponibles en formato ONNX para phoonnx, aunque con una salvedad importante: la voz no está incluida en el índice de voces de phoonnx porque la asignación de identificadores a los pares vocálicos difiere de la de Piper (incidencia 838 de phoonnx), y además el control de calidad en fp32 no superó la verificación automatizada. No se ha publicado ninguna copia en int8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS) |
| Tipos de cuantizacion | fp32 (el int8 no superó la verificación y no se publica) |
| Idiomas soportados | ur-PK (urdu de Pakistán) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx + config.json) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura VITS tal como se implementa en Piper, un sistema TTS de extremo a extremo que combina un codificador de texto, un predictor de duración y un decodificador generativo con normalizing flows y un discriminador adversarial durante el entrenamiento. La entrada de texto se convierte a fonemas IPA mediante espeak-ng con la voz `ur`, y el modelo fue entrenado con puntuación de cláusula (, . ! ? : ;), que phoonnx 1.96.1a1 y posteriores conservan en la síntesis. La salida es audio mono a 22050 Hz con un único hablante (voz femenina).

Los datos de entrenamiento no están registrados en la model card upstream: no se indica URL de dataset, número de tokens ni composición. Tampoco se documenta el checkpoint de entrenamiento ni el modelo base en este repositorio. El autor upstream es mahwizzzz y el código de entrenamiento es el de Piper. La conversión a ONNX realizada por TigreGotico no altera los pesos. El método de control de calidad empleado fue una comprobación de longitud y silencios sin ASR, sobre tres frases de FLORES-200 devtest.

## Capacidades

- Síntesis de voz en urdu de Pakistán (ur-PK) a partir de texto escrito en ese idioma.
- Conversión de texto a fonemas IPA mediante espeak-ng (voz `ur`), con soporte de puntuación de cláusula.
- Generación de audio mono a 22050 Hz con una única voz femenina.
- Inferencia ligera en CPU: RTF mediano de 0,037 con 4 hilos en un Intel Core i9-11900H.
- Integración con phoonnx mediante `TTSVoice.load` y `synthesize_wav`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de textos en urdu en aplicaciones de accesibilidad: el modelo convierte artículos o documentos en audio a 22050 Hz, adecuado para lectores de pantalla en dispositivos de gama baja gracias a su bajo consumo de memoria (RSS máximo de 259,4 MB).
- Generación de avisos y notificaciones de voz en urdu: integrable en sistemas de megafonía o aplicaciones móviles que necesiten anuncios pregrabados dinámicamente, con una latencia muy baja (RTF 0,037 en CPU).
- Síntesis para contenido educativo: narración de lecciones o materiales de aprendizaje en urdu, con la puntuación de cláusula preservada para mejorar la prosodia.
- Prototipado de asistentes conversacionales en urdu: la voz puede emplearse como capa de salida de un pipeline TTS en un asistente, siempre que se acepte la limitación de que no está en el índice de phoonnx y debe cargarse manualmente desde sus ficheros.
- Doblaje o locución automatizada de vídeos cortos en urdu: el tamaño reducido del modelo (63,5 MB de grafo) permite ejecutarlo en entornos con recursos limitados.
- Pruebas de integración de phoonnx con voces Piper: útil para desarrolladores que quieran validar el flujo de conversión ONNX y el manejo de fonemas espeak en urdu, dado que la voz sirve como caso de prueba de la incidencia 838.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas de control de calidad de la model card, no benchmarks estándar de TTS (MOS, WER, etc.):

| Metrica | fp32 | int8 |
|---|---|---|
| Resultado de la verificación | fail | no publicado |
| Caracteres por segundo | 12,6 a 13,5 | - |
| Longitud, int8 / fp32 | - | 0,88 a 1,06 |
| Tamano del grafo | 63,5 MB | - |
| RSS maximo | 259,4 MB | - |
| RTF (mediana de 3, 4 hilos) | 0,037 | - |

Medido en un Intel Core i9-11900H a 2,50 GHz. El RTF es el tiempo de síntesis dividido entre la duración del audio. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo TTS.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; el modelo se ejecuta en CPU. El RSS máximo medido es de 259,4 MB en fp32.
- GPU recomendadas: no se especifican; al ser un modelo ONNX ligero, puede ejecutarse en CPU sin GPU.
- Cabe en GPU de consumo: sí, cualquier GPU con al menos unos cientos de MB de memoria libre podría alojarlo, aunque el diseño está orientado a CPU.
- Opciones de despliegue: phoonnx (versión preliminar `pip install --pre phoonnx`) con espeak-ng instalado; también puede ejecutarse con ONNX Runtime directamente si se gestiona el preprocesado de fonemas.
- Latencia y throughput: RTF de 0,037 con 4 hilos en un i9-11900H, es decir, aproximadamente 27 veces más rápido que tiempo real en esa configuración.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-ur_pk-aegis_female-medium-espeak | VITS (Piper) | ur-PK | no aplica | MIT | ONNX en HF, fuera del índice de phoonnx |
| Otras voces Piper en rhasspy/piper-voices | VITS (Piper) | múltiples | no aplica | MIT (por voz) | ONNX y otros formatos en HF |
| Voces phoonnx del índice oficial | VITS (Piper) convertidas | múltiples | no aplica | MIT | Incluidas en el índice de phoonnx |

No se dispone de datos de rendimiento comparativo (MOS, WER) entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La verificación de calidad en fp32 no superó el control (resultado "fail"), lo que indica posibles problemas de longitud o silencios en la síntesis.
- La voz no está incluida en el índice de voces de phoonnx debido a la incidencia 838: phoonnx asigna un identificador a cada par vocálico del mapa, mientras que Piper no lo hace, por lo que la voz queda fuera hasta que se corrija.
- No se publica copia en int8 porque la versión cuantizada no superó la verificación correspondiente.
- Los datos de entrenamiento no están documentados, lo que impide evaluar sesgos o cobertura lingüística más allá del urdu de Pakistán.
- El uso de espyak en lugar de espeak-ng puede provocar errores de pronunciación en algunas palabras, ya que algunos fonemas difieren.
- Riesgo de alucinación no aplica en el sentido de texto generado, pero sí puede producir pronunciaciones incorrectas o prosodia defectuosa en textos con puntuación atípica o fuera de dominio.
- Licencia MIT permite uso comercial, pero se debe atribuir a mahwizzzz como autor original de la voz.
- Solo soporta un idioma (ur-PK) y un único hablante; no es multilingüe ni multi-hablante.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/vits-ur_pk-aegis_female-medium-espeak
- Modelo upstream: https://huggingface.co/rhasspy/piper-voices/tree/e9c8a39444359388adaa94255becb37a5a2b8e51/ur/ur_PK/aegis_female/medium
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- TigreGotico: https://tigregotico.pt
