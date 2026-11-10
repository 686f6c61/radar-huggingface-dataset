# lororo/lororo-crh-voices

## Resumen

Lororo Crimean Tatar voices es un paquete de dos voces de síntesis de voz (text-to-speech) para crimeano tártaro (Qırımtatar tili, código ISO `crh`), desarrollado por el usuario lororo y publicado bajo licencia Apache-2.0. Las voces se distribuyen en formato ONNX para el motor Piper, una solución de TTS ligera y de código abierto orientada a inferencia local y de baja latencia. El paquete incluye una voz femenina (Sevil, predeterminada) y una voz masculina (Abibullah), ambas basadas en el modelo Piper medium a 22,05 kHz.

El modelo resuelve un problema de cobertura lingüística: el crimeano tártaro es una lengua túrquica con un ecosistema limitado de recursos de voz, y este paquete proporciona voces utilizables en aplicaciones educativas y de aprendizaje de idiomas (el autor las emplea en Lororo Words y Lororo Academy). El repositorio es pequeño (0,1 GB) y está pensado para desplegarse en entornos con recursos limitados, incluidos dispositivos de consumo.

Se trata de un modelo en fase beta, con cero descargas y cero likes en el momento de la consulta, creado y actualizado el 10 de noviembre de 2026. No es un modelo de lenguaje generativo, sino un sistema TTS acústico basado en Piper, por lo que sus especificaciones y evaluación difieren de las de un LLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Piper (modelo acústico TTS; pipeline VITS de Piper medium) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (TTS; entrada de texto sin ventana definida) |
| Tipos de cuantización | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | crimeano tártaro (`crh`), texto en alfabeto latino con fonemas espeak-ng turcos (`tr`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`.onnx`) con fichero de configuración `.onnx.json` |
| Frecuencia de muestreo | 22,05 kHz |
| Voces incluidas | `crh_sevil.onnx` (Sevil, femenina, predeterminada); `crh_voice_e150.onnx` (Abibullah, masculina) |
| Modelo base | `en_US-lessac-medium` (Piper) |
| Dataset de entrenamiento | Yehor/qirimtatar-tts (Apache-2.0) |
| Tamaño del repositorio | 0,1 GB |
| Librería | piper |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Piper, un sistema TTS neuronal de código abierto (proyecto OHF-Voice/piper1-gpl) que combina un modelo acústico con fonemización externa mediante espeak-ng. Las dos voces son modelos Piper medium a 22,05 kHz, derivados por ajuste fino (fine-tuning) del checkpoint `en_US-lessac-medium`. La voz masculina (Abibullah) se entrenó durante 150 épocas sobre las grabaciones abiertas del dataset Yehor/qirimtatar-tts; la voz femenina (Sevil) se obtuvo ajustando finamente a partir de Abibullah.

El entrenamiento se realizó sobre texto en alfabeto latino con fonemas espeak-ng de turco (`tr`), lo que implica un paso de normalización previo obligatorio: conversión de cirílico a latino, minúsculas, y reglas de sustitución (`q` → `k`, `ñ` → `ng`, `w` → `v`, `x` → `ks`), además de escribir los números como palabras. No se documentan detalles sobre el número de tokens, composición exacta del dataset, ni el uso de técnicas de RLHF o DPO, que en cualquier caso no aplican a un modelo TTS de este tipo. La innovación principal es la adaptación de un modelo base inglés a una lengua de bajos recursos mediante fonemización turca y ajuste fino sobre grabaciones abiertas.

## Capacidades

- Síntesis de voz (text-to-speech) en crimeano tártaro a partir de texto en alfabeto latino normalizado.
- Dos timbres disponibles: voz femenina (Sevil) y voz masculina (Abibullah).
- Salida de audio a 22,05 kHz en formato ONNX, compatible con el motor Piper.
- Control de pausas mediante comas entre palabras, pensado para facilitar la comprensión a estudiantes.
- Fonemización mediante espeak-ng con inventario fonético turco (`tr`).
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, visión ni audio de entrada.
- Capacidad multilingüe limitada al crimeano tártaro; no se documenta soporte de otros idiomas.

## Casos de uso

- Aplicaciones de aprendizaje de idiomas: el modelo permite generar pronunciaciones de vocabulario y frases en crimeano tártaro, con pausas controladas por comas que ayudan a segmentar el audio para estudiantes, como se emplea en Lororo Words y Lororo Academy.
- Lectura de textos y artículos: conversión de contenido escrito en crimeano tártaro (previa transliteración de cirílico a latino) a audio para accesibilidad o consumo pasivo.
- Audiolibros y contenido educativo: generación por lotes de narraciones con dos voces distintas (femenina y masculina) para diálogos o materiales didácticos.
- Asistentes de voz locales: integración en aplicaciones de escritorio o móvil mediante Piper, sin dependencia de servicios en la nube, adecuado para entornos con conectividad limitada.
- Preservación lingüística: creación de corpus de audio sintético para documentación y difusión del crimeano tártaro, una lengua con recursos digitales escasos.
- Prototipado de interfaces de voz: pruebas de concepto de sistemas de interacción hablada en `crh` con un modelo de 0,1 GB que se despliega en hardware modesto.
- Señalización y avisos automatizados: generación de mensajes de voz breves en contextos de transporte, turismo o administración local dirigidos a hablantes de crimeano tártaro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (MOS, WER, MCD ni comparativas con otros sistemas TTS), y el modelo se presenta explícitamente como beta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0,1 GB) y la naturaleza de los modelos Piper medium, la huella de memoria es reducida y compatible con CPU.
- GPU recomendadas: no se especifican; Piper está optimizado para inferencia en CPU. Cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) puede ejecutarlo, pero no es necesario.
- Compatibilidad con GPU de consumo: sí, previsiblemente en la mayoría de tarjetas, dado el reducido tamaño del modelo; también en CPU.
- Opciones de despliegue: motor Piper (piper1-gpl), con soporte de ficheros ONNX; integración en aplicaciones propias mediante la librería Piper.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lororo-crh-voices | crimeano tártaro (`crh`) | Piper medium (ONNX) | 22,05 kHz | Apache-2.0 | Hugging Face, 0 descargas |
| Piper `en_US-lessac-medium` | inglés | Piper medium | 22,05 kHz | no disponible en la información | Proyecto Piper (modelo base) |
| Otros TTS para lenguas túrquicas de bajos recursos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con alternativas; la comparación se limita a la relación de derivación respecto al modelo base inglés y a la ausencia de modelos TTS comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- Modelo en fase beta: el autor lo etiqueta explícitamente como beta, sin garantías de calidad o estabilidad.
- Requiere preprocesado obligatorio del texto (transliteración cirílico-latino, minúsculas, sustituciones `q`→`k`, `ñ`→`ng`, `w`→`v`, `x`→`ks`, números como palabras); sin él, la síntesis puede ser incorrecta.
- Fonemización basada en espeak-ng turco (`tr`), lo que puede introducir imprecisiones fonéticas en crimeano tártaro.
- Sin métricas publicadas de calidad (MOS, WER) ni evaluación independiente; riesgo de pronunciación inconsistente o naturalidad limitada.
- Cobertura lingüística restringida a `crh`; no apto para otros idiomas sin reentrenamiento.
- Sin datos documentados sobre sesgos (de género, dialectales o de acento) ni sobre el equilibrio de las grabaciones de entrenamiento.
- Licencia Apache-2.0: permite uso comercial y modificación, con obligación de conservar avisos de licencia y atribución; el dataset de entrenamiento también es Apache-2.0.
- Sin descargas ni validación por la comunidad en el momento de la consulta; conviene evaluar la calidad antes de usarlo en producción.
- No es un modelo de lenguaje: no realiza razonamiento, tool calling ni generación de texto.

## Enlaces

- Hugging Face: https://huggingface.co/lororo-crh-voices
- Dataset de entrenamiento: https://huggingface.co/datasets/Yehor/qirimtatar-tts
- Proyecto Piper (OHF-Voice/piper1-gpl): https://github.com/OHF-Voice/piper1-gpl
- Sitio del autor (Lororo): https://lororo.org
