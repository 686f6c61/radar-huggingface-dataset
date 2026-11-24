# Dancenteno/piper-es-epachuko

## Resumen

Piper · Español · Epachuko (medium) es una voz de síntesis de habla (text-to-speech) para el motor Piper, distribuida en formato ONNX. La publica el usuario Dancenteno en Hugging Face y está pensada para generar audio en castellano a partir de texto de forma local, sin dependencia de servicios en la nube. El modelo es un ajuste fino de la voz `es_ES-davefx-medium` de `rhasspy/piper-checkpoints`, entrenado con grabaciones de dominio público.

El interés práctico del modelo reside en su licencia CC0 1.0, que permite uso comercial sin restricciones ni atribución obligatoria, y en su reducido tamaño (unos 63 MB el archivo ONNX, 0,1 GB el repositorio completo), lo que lo hace apto para despliegues en CPU, dispositivos embebidos y aplicaciones de escritorio. La voz se entrenó con aproximadamente 45 minutos de audio del audiolibro *El conde de Monte Cristo, volumen 1*, leído por Epachuko para LibriVox.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y con un conjunto de entrenamiento muy limitado, por lo que su calidad debe evaluarse empíricamente antes de usarlo en producción. No se dispone de información sobre arquitectura interna, número de parámetros ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de síntesis de voz para el motor Piper, formato ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (text-to-speech; entrada de texto sin ventana declarada) |
| Tipos de cuantizacion | no disponible (se distribuye un único archivo ONNX de tipo medium) |
| Idiomas soportados | español (es, variante es_ES) |
| Licencia | CC0 1.0 (dominio público) |
| Formato de pesos | ONNX (`es_ES-epachuko-ultimo-medium.onnx`) + JSON de configuración |
| Frecuencia de muestreo | 22.050 Hz |
| Tamano del modelo | ~63 MB (archivo ONNX); repositorio de 0,1 GB |
| Libreria | piper |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la documentación disponible. Por el formato y la librería declarada, se trata de un modelo compatible con Piper, el motor de síntesis de voz neuronal de OHF-voice, que consume pesos ONNX acompañados de un archivo JSON de configuración.

El entrenamiento consistió en un ajuste fino (*fine-tuning*) sobre la voz base `es_ES-davefx-medium` de `rhasspy/piper-checkpoints` (CC0). El corpus de entrenamiento se construyó a partir de unos 45 minutos de audio extraídos de capítulos repartidos del audiolibro *El conde de Monte Cristo, volumen 1* de Alexandre Dumas, leído por Epachuko y publicado en LibriVox (dominio público). Las transcripciones se obtuvieron mediante reconocimiento automático de voz con Whisper large-v3. Los segmentos empleados tienen entre 5 y 12 segundos de duración. El entrenamiento se ejecutó durante 900 épocas con un `batch_size` de 16 y una frecuencia de muestreo de 22.050 Hz; el archivo publicado corresponde al último punto de control. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación, algo esperable en un modelo TTS.

## Capacidades

- Síntesis de voz en español (es_ES) a partir de texto plano, con salida en WAV.
- Pronunciación correcta de tildes y eñes cuando el texto de entrada las incluye.
- Ejecución local mediante el motor Piper, sin llamadas a servicios externos.
- Integración sencilla por línea de comandos (`python3 -m piper`) y, por extensión, en pipelines que invoquen el binario o la librería.
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No es un modelo multimodal: no procesa imágenes, audio de entrada ni vídeo.
- No se documentan capacidades de control de estilo, emoción, velocidad o prosodia más allá de los parámetros propios de Piper.

## Casos de uso

- Lectura de artículos y documentos en aplicaciones de accesibilidad: el modelo convierte texto en audio localmente, con un consumo de recursos mínimo, adecuado para lectores de pantalla y herramientas de apoyo a personas con discapacidad visual.
- Generación de avisos y locuciones para sistemas de megafonía o domótica: al ejecutarse en CPU y ocupar unos 63 MB, puede desplegarse en una Raspberry Pi o en un dispositivo embebido que anuncie eventos del hogar.
- Audiolibros y pódcast de bajo coste: la licencia CC0 permite generar y distribuir audio comercialmente sin obligaciones de atribución, siempre que se valide la calidad de la voz.
- Prototipado rápido de asistentes de voz: al integrarse con Piper mediante una única invocación, sirve para validar flujos de conversación antes de invertir en una voz comercial.
- Sistemas de información al público en comercios u oficinas: mensajes pregrabados o dinámicos en castellano para terminales de turnos, con despliegue en hardware modesto.
- Pruebas de integración en pipelines de generación de contenido: conversión por lotes de textos a audio para vídeos, cursos o material formativo, dado que el modelo no impone restricciones de uso.
- Investigación en TTS de bajos recursos: el modelo documenta un caso de ajuste fino con 45 minutos de audio, útil como referencia metodológica para experimentos con corpus reducidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la práctica; el modelo está pensado para ejecutarse en CPU. En GPU, el archivo ONNX de ~63 MB ocupa una fracción mínima de memoria (por debajo de 1 GB en cualquier configuración razonable).
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime puede ejecutar el modelo, aunque no es necesario.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU y en CPU sin aceleración dedicada.
- Opciones de despliegue: motor Piper (`piper1-gpl`), invocación mediante `python3 -m piper`, y cualquier runtime compatible con ONNX (ONNX Runtime). No se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo `medium` de Piper con salida a 22.050 Hz, se espera una generación más rápida que tiempo real en CPU moderna, pero no se aportan cifras verificadas.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dancenteno/piper-es-epachuko | Voz Piper (ONNX) | es_ES | ~63 MB | CC0 1.0 | Hugging Face |
| rhasspy/piper-checkpoints (`es_ES-davefx-medium`) | Voz Piper (ONNX) | es_ES | no disponible | CC0 | Hugging Face (voz base del ajuste fino) |
| Otras voces Piper en español | Voz Piper (ONNX) | es_ES | variable | variable (habitualmente CC0 o similar) | Hugging Face / repositorios de Piper |

No se dispone de datos de rendimiento comparativo (MOS, latencia, WER) para establecer una comparación cuantitativa con alternativas. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Corpus de entrenamiento muy reducido (unos 45 minutos), lo que puede producir errores de pronunciación en palabras poco frecuentes y degradación en frases largas.
- Las transcripciones se obtuvieron con Whisper large-v3, por lo que los errores de reconocimiento automático pueden haberse propagado al entrenamiento y afectar a la fidelidad de la pronunciación.
- Requiere texto de entrada con tildes y eñes; sin ellas la pronunciación es incorrecta.
- Requiere escribir números, símbolos y abreviaturas en palabras; el modelo no normaliza automáticamente esas formas.
- Voz entrenada a partir de una única grabación de un lector concreto: no cubre variedades diatópicas, registros ni estilos más allá del material original.
- Riesgo de alucinación acústica o artefactos en entradas atípicas, propio de modelos TTS con pocos datos.
- No se documentan sesgos específicos, pero al derivar de una sola voz de audiolibro literario del siglo XIX, el timbre y la prosodia reflejan ese material.
- Licencia CC0 1.0: permite uso comercial sin restricciones ni atribución obligatoria; el autor agradece, sin exigir, el crédito a Epachuko y a LibriVox.
- Modelo con cero descargas y cero likes en el momento de la consulta: no existe validación comunitaria de su calidad.
- No hay información sobre arquitectura ni parámetros, lo que dificulta estimar su comportamiento fuera de las pruebas empíricas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dancenteno/piper-es-epachuko
- Motor Piper (OHF-voice): https://github.com/OHF-voice/piper1-gpl
- Repositorio de checkpoints de Piper (voz base): https://huggingface.co/rhasspy/piper-checkpoints
- Audiolibro de origen en LibriVox / Internet Archive: https://archive.org/details/el_conde_de_monte_cristo_volumen_1_2312_librivox
