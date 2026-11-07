# ampixa/kalaTTS

## Resumen

kalaTTS (publicado como "Real Nepali v0.4") es un modelo de síntesis de voz (text-to-speech) en nepalí desarrollado por ampixa labs, un laboratorio centrado en herramientas de voz, visión, lenguaje y evaluación para el nepalí y lenguas regionales. El modelo se distribuye como checkpoint de Piper/VITS y está pensado para integrarse en el ecosistema Piper, lo que facilita su despliegue en entornos de baja latencia y en hardware modesto mediante inferencia ONNX.

La versión v0.4 es una continuación de `ampixa/real-nepali-v0.2-kala` que introduce tokens explícitos de puntuación (`<period>`, `<question>`, `<exclaim>`, `<comma>`) en la entrada del modelo, con el objetivo de mejorar la prosodia sin repetir la pérdida de calidad observada en la ejecución de reparación sintética v0.3. Mantiene un mapa de seis hablantes y un frontend específico para nepalí.

El modelo es relevante para quien necesite TTS multi-hablante en nepalí con control de puntuación y prosodia, si bien el propio autor advierte que debe evaluarse mediante escucha antes de tratarlo como modelo de producción por defecto. El repositorio ocupa 0,8 GB y el checkpoint corresponde a la ejecución `real_nepali_v0.3_punct_4h_replay` (epoch 999, step 67200).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper/VITS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de contexto) |
| Tipos de cuantizacion | no disponible (formato ONNX para Piper) |
| Idiomas soportados | nepalí (ne) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | ONNX (librería piper-tts); el repositorio declara `checkpoint.ckpt`, `config.json` y `speaker_id_map.json` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura VITS implementada en Piper, un sistema TTS de extremo a extremo que combina un encoder de texto, un predictor de duración y un decoder generativo para producir audio directamente desde fonemas. El frontend es específico para nepalí y, en esta versión, añade tokens explícitos de puntuación (`<period>`, `<question>`, `<exclaim>`, `<comma>`) a la entrada del modelo para modelar pausas e intención.

El entrenamiento se realizó sobre una mezcla de 5.808 filas con una duración total de 11,60 horas: 4.338 filas (8,61 h) del conjunto de replay de seis hablantes de v0.2 y 1.470 filas (2,99 h) del lote sintético de puntuación/intención de Algenib. La ejecución corresponde a `real_nepali_v0.3_punct_4h_replay` con `run_epoch999_punct4h_lr2em6_prosodyfreeze_bs96sps16_1000` (epoch 999, step 67200). El SHA-256 del checkpoint es `46ba2bf465eecceff345b7f118353d7b498dfcb5eb283e3556ba9ea260dcdff9`. No se documentan detalles sobre RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Síntesis de voz (text-to-speech) en nepalí con salida de audio.
- Soporte multi-hablante con seis identificadores: `algenib` (0), `barsha` (1), `kala` (2), `slr143_F` (3), `slr43_0546` (4) y `slr43_2099` (5).
- Modelado explícito de puntuación mediante tokens `<period>`, `<question>`, `<exclaim>` y `<comma>`, orientado a mejorar pausas y prosodia.
- Frontend específico para nepalí.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio de entrada ni modo de razonamiento.

## Casos de uso

- Lectura de artículos y noticias en nepalí: el modelo convierte texto con puntuación en audio, y los tokens de puntuación permiten introducir pausas naturales en frases y párrafos, adecuado para aplicaciones de accesibilidad y consumo de contenido.
- Asistentes de voz para atención al ciudadano: al ser multi-hablante, permite asignar voces distintas a distintos servicios o personajes dentro de una misma aplicación desplegada con Piper.
- Audiolibros y narración: la selección entre seis hablantes y el control de puntuación facilitan alternar voces y mantener una prosodia consistente en textos largos.
- Sistemas de anuncios y avisos automatizados: la inferencia ONNX de Piper permite ejecutar el modelo en servidores modestos o en el borde para generar avisos hablados en nepalí.
- Integración en aplicaciones de aprendizaje de idiomas: el modelo puede generar ejemplos de pronunciación en nepalí con distintas voces para prácticas de escucha.
- Localización de contenido multimedia: doblaje o sustitución de pistas de voz en nepalí para vídeos y presentaciones, usando el hablante más adecuado al registro.
- Pruebas de prosodia e investigación en TTS: el modelo sirve como banco de pruebas para evaluar si los tokens de puntuación mejoran la prosodia, tal como plantea el autor en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,8 GB y el formato ONNX de Piper está pensado para ejecución ligera en CPU.
- GPU recomendadas: no disponible; al ser un modelo Piper/VITS de tamaño reducido, es probable que funcione en CPU, pero no se documentan requisitos concretos.
- Cabe en GPU de consumo: no se especifica; por el tamaño del repositorio (0,8 GB) es plausible, pero no hay datos oficiales.
- Opciones de despliegue: Piper (librería `piper-tts`) con pesos ONNX; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Hablantes | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ampixa/kalaTTS (Real Nepali v0.4) | VITS / Piper | nepalí | 6 | CC-BY-SA-4.0 | Hugging Face |
| ampixa/real-nepali-v0.2-kala | VITS / Piper | nepalí | 6 | no disponible | Hugging Face |
| Otros modelos Piper para nepalí | VITS / Piper | nepalí | no disponible | variable | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- El propio autor advierte que el checkpoint debe juzgarse mediante escucha y que no debe tratarse como modelo de producción por defecto hasta revisar las muestras de puntuación.
- La versión v0.4 se entrenó para comprobar si los tokens de puntuación mejoran la prosodia sin repetir la pérdida de calidad de la ejecución sintética v0.3; el resultado cualitativo no está garantizado.
- Solo soporta nepalí; no hay capacidades multilingües documentadas.
- El conjunto de entrenamiento es pequeño (11,60 h), lo que puede limitar la cobertura de estilos, dominios y voces.
- Riesgo de artefactos de prosodia y pronunciación en texto fuera del dominio de entrenamiento; no se documentan evaluaciones objetivas.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribución y obliga a compartir las obras derivadas bajo la misma licencia; conviene revisar las implicaciones para productos propietarios.
- No se documentan sesgos específicos, pero al ser un modelo entrenado con voces y datos concretos puede reflejar sesgos de los hablantes y del corpus.
- No se documentan mecanismos de tool calling, agentes ni razonamiento; no debe emplearse para esas tareas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ampixa/kalaTTS
- ampixa labs: https://ampixa.com/
