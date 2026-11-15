# Phoonnx/vits-hf_community_mbarnig_lb_rhasspy_piper_tts_lb_LU-androgynous-medium

## Resumen

El modelo `vits-hf_community_mbarnig_lb_rhasspy_piper_tts_lb_LU-androgynous-medium` es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura VITS, distribuido en formato ONNX por el usuario Phoonnx. Se trata de una extracción de una única voz del repositorio agregador `Phoonnx/phoonnx-vits`, que a su vez empaqueta voces Piper procedentes de distintos proyectos comunitarios. En este caso, la voz proviene del repositorio `mbarnig/lb_rhasspy_piper_tts` y está etiquetada como luxemburgués (`lb_LU`) con timbre andrógino y calidad media.

El modelo resuelve el problema de la síntesis de voz offline para una lengua de bajos recursos como el luxemburgués, integrándose en el ecosistema `phoonnx` (una implementación en Python del motor de inferencia usado por Piper). Su relevancia es acotada: no es un modelo de propósito general, sino un artefacto de despliegue para pipelines TTS concretos, con un tamaño de repositorio de 0,1 GB y licencia MIT.

La información pública es muy escasa: el repositorio registra cero descargas y cero likes, y la model card es fundamentalmente una nota de trazabilidad sobre el origen de los ficheros, sin datos de entrenamiento, benchmarks ni especificaciones detalladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech, extremo a extremo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | no disponible; pesos distribuidos en ONNX |
| Idiomas soportados | luxemburgués (código `lb`, región `LU`) según la nomenclatura del identificador |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz extremo a extremo que combina un codificador de texto, un predictor de duración basado en alineamiento monotónico y un decodificador generativo con normalizing flows y un discriminador adversarial, entrenado con pérdidas de reconstrucción, adversariales y de coincidencia de características. Permite generar audio de forma no autoregresiva y en una sola pasada, lo que la hace adecuada para inferencia de baja latencia en CPU.

No se dispone de información sobre el corpus de entrenamiento, el número de horas de audio, los hablantes utilizados, ni sobre si se aplicaron técnicas de ajuste fino o regularización adicionales. La model card se limita a indicar que los ficheros conservan las rutas del repositorio origen `Phoonnx/phoonnx-vits`, carpeta `hf_community__mbarnig__lb_rhasspy_piper_tts__lb_LU-androgynous-medium`, y que la licencia aplicable es la que registra el repositorio fuente. No se documenta ninguna innovación técnica adicional más allá de la propia arquitectura VITS y su exportación a ONNX para su uso con el motor `phoonnx`.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en luxemburgués.
- Voz de timbre andrógino y calidad media según la nomenclatura del identificador.
- Inferencia mediante ONNX Runtime a través de la librería `phoonnx`.
- Generación de audio no autoregresiva en una sola pasada (característica de VITS).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de capacidades multilingües documentadas más allá del luxemburgués.
- No dispone de modo de razonamiento (thinking mode), visión ni audio de entrada.

## Casos de uso

- Lectura de notificaciones y avisos en luxemburgués: el modelo puede sintetizar mensajes cortos en sistemas domésticos o de asistencia por voz, aprovechando la inferencia rápida de VITS en CPU para respuestas casi inmediatas.
- Integración en asistentes de voz locales tipo Rhasspy: al proceder del ecosistema Piper/Rhasspy, encaja directamente en pipelines de asistente doméstico offline que requieren una voz en luxemburgués sin depender de servicios en la nube.
- Accesibilidad para personas con discapacidad visual: lectura de texto en luxemburgués en aplicaciones de screen reader o dispositivos dedicados, con un modelo de 0,1 GB que cabe en hardware modesto.
- Locuciones para contenido educativo o divulgativo en luxemburgués: generación de narraciones para materiales didácticos donde no se dispone de grabaciones profesionales.
- Prototipado de interfaces conversacionales en luxemburgués: uso del modelo como componente TTS en pruebas de concepto de chatbots o kioscos interactivos antes de invertir en una voz comercial.
- Señalización y anuncios automatizados en espacios públicos: síntesis de avisos dinámicos en luxemburgués en estaciones, aeropuertos o edificios, donde se requiere una voz neutra y consistente.
- Investigación en lenguas de bajos recursos: uso del modelo como línea base para experimentos de TTS en luxemburgués, comparación de voces Piper y evaluación de inteligibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la naturaleza de VITS, la inferencia puede ejecutarse en CPU con huella de memoria muy reducida (del orden de cientos de MB).
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 3060 o superior) puede acelerar la inferencia, aunque no es necesaria.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna e incluso en sistemas embebidos, dado el reducido tamaño del modelo.
- Opciones de despliegue: ONNX Runtime mediante la librería `phoonnx`; también podría utilizarse con otros runners compatibles con ONNX, aunque no está documentado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| vits-hf_community_mbarnig_lb_rhasspy_piper_tts_lb_LU-androgynous-medium | VITS | Luxemburgués | no aplica | MIT | ONNX | Hugging Face (Phoonnx) |
| Otras voces Piper del repositorio `Phoonnx/phoonnx-vits` | VITS | Diversos (p. ej. Twi, Chichewa, Makhuwa) | no aplica | Variable según subcarpeta (algunas `other`) | ONNX | Hugging Face |
| Modelos TTS multilingües comerciales (p. ej. APIs en la nube) | Variable | Decenas de idiomas | no aplica | Propietaria | API | Servicios en la nube |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Información muy escasa: no hay datos de entrenamiento, corpus, hablantes ni evaluación, lo que dificulta estimar la calidad real de la voz.
- Riesgo de pronunciación incorrecta en palabras fuera del dominio de entrenamiento, habitual en modelos VITS de lenguas de bajos recursos.
- Posibles sesgos derivados del corpus original de `mbarnig/lb_rhasspy_piper_tts`, no documentados.
- La licencia MIT se hereda del repositorio fuente según la model card; conviene verificar la licencia de la carpeta original antes de un uso comercial, ya que el repositorio agregador advierte que algunas subcarpetas carecen de licencia declarada y llevan `license: other`.
- El identificador del modelo incluye la etiqueta `androgynous-medium`, que sugiere una calidad media; no se especifica qué implica exactamente en términos de naturalidad o inteligibilidad.
- No hay garantía de soporte ni mantenimiento: el repositorio registra cero descargas y cero likes, y la model card no incluye instrucciones de uso detalladas.
- El modelo no es adecuado para tareas de texto, razonamiento, código o visión; su alcance se limita a la síntesis de voz.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Phoonnx/vits-hf_community_mbarnig_lb_rhasspy_piper_tts_lb_LU-androgynous-medium
- Repositorio agregador de voces: https://huggingface.co/Phoonnx/phoonnx-vits
- Motor de inferencia phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio fuente de la voz (Rhasspy Piper TTS): https://github.com/mbarnig/lb_rhasspy_piper_tts
- Repositorio de voces Kasanoma (referenciado en la model card): https://github.com/michsethowusu/kasanoma
