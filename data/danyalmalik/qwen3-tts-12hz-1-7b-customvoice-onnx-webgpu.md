# danyalmalik/Qwen3-TTS-12Hz-1.7B-CustomVoice-ONNX-WebGPU

## Resumen

Qwen3-TTS-12Hz-1.7B-CustomVoice-ONNX-WebGPU es una exportación a ONNX del modelo de síntesis de voz Qwen3-TTS-12Hz-1.7B-CustomVoice de Qwen (Alibaba), preparada por el usuario danyalmalik para ejecutarse íntegramente en un navegador mediante el backend WebGPU de ONNX Runtime Web, en el contexto del proyecto Quick Inference. El modelo base es un sistema TTS de 1.700 millones de parámetros con un tokenizador de audio a 12 Hz que genera 16 códigos por trama de 80 ms y reconstruye audio a 24 kHz; incorpora nueve voces predefinidas y diez idiomas según la model card.

El interés de esta ficha no está en el modelo original, sino en el proceso de cuantización y troceado en grafos ONNX: el *talker* de 28 capas y anchura 2048 se exporta en int4, el predictor de códigos de 5 capas en int8, y las tablas de embeddings y la proyección intermedia también en int4, manteniendo activaciones y caché KV en float32 porque float16 provocaba desbordamientos (texto incoherente en el talker y NaN en el predictor). El resultado ocupa 1,4 GB y permite inferencia local sin servidor, lo que abre casos de uso de privacidad y despliegue en cliente.

La contrapartida es que los pesos cuantizados sin calibración (redondeo al más cercano, simétrico, bloques de 32) no reproducen exactamente las salidas del modelo original: el autor reporta una tasa de error de palabra del 9,1 % en CPU y del 11,4 % en Chrome sobre ocho frases en inglés, frente al 10,2 % del modelo float32, una muestra demasiado pequeña para extraer conclusiones firmes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo en dos etapas: *talker* (28 capas, anchura 2048) que predice el código 0 y predictor de códigos (5 capas, anchura 1024) que predice los 15 códigos restantes; decodificador de códec neuronal separado |
| Parámetros totales | 1.700 millones (según el nombre del modelo base; no se detalla el desglose por componente) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Int4 (talker, proyección `cp_project`, embeddings de texto y de códec) e int8 (predictor de códigos); redondeo al más cercano, simétrico, bloques de 32, sin calibración; activaciones y caché KV en float32 |
| Idiomas soportados | Diez idiomas según la model card del autor; la lista concreta no está disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Grafos ONNX (`talker/`, `code_predictor/`, `cp_project_q4.onnx`, `text_embed_q4.onnx`, `codec_embed_q4.onnx`), más `config.json`, `generation_config.json` y `tokenizer.json` en formato `tokenizers` |
| Voces | Nueve altavoces integrados (sin clonación documentada) |
| Frecuencia de audio | 24 kHz de salida; tokenizador a 12 Hz (16 códigos por trama de 80 ms) |
| Tokenizador de texto | Qwen2 |
| Tamaño del repositorio | 1,4 GB |

## Arquitectura y entrenamiento

El modelo sigue un esquema de dos decodificadores en cascada sobre un códec de audio de 12 Hz. El *talker* recibe los embeddings de texto (precalculados por token en `text_embed_q4.onnx`) y el estado previo, y produce `logits` sobre 3072 identificadores de códec para el primer codebook, además de un `hidden_states` que se proyecta mediante `cp_project_q4.onnx` a la anchura 1024 del predictor. El predictor de códigos, con caché propia que se reinicia en cada trama, recibe `[cp_project(estado oculto), cp_embed(código 0)]` y va generando un código por paso hasta completar los 15 restantes. La entrada del *talker* en la trama siguiente es la suma de los embeddings de los 16 códigos más el embedding `tts-pad`.

La generación es estocástica: temperatura 0,9, top-k 50, penalización de repetición 1,05, enmascaramiento de los identificadores 2048-3071 salvo el código de parada 2150, y prohibición de parada durante las dos primeras tramas. El *prompt* combina los tokens de rol de ChatML, un prefijo de códec (think, think-bos, idioma, think-eos, altavoz, pad, bos) sobre embeddings `tts-pad`/`tts-bos`, los embeddings del texto con `tts-eos` sobre `codec-pad`, y `tts-pad` sobre `codec-bos`. Todos los fotogramas resultantes pasan por el decodificador de códec, publicado aparte como `tok_decoder_q4.onnx` en el repositorio del tokenizador.

No se aportan datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF o DPO. La innovación técnica destacable de esta ficha es exclusivamente de despliegue: troceado en grafos ONNX compatibles con el *model builder* de ONNX Runtime GenAI, cuantización bloque a bloque sin calibración y decisión deliberada de mantener float32 en activaciones y caché por la inestabilidad numérica observada en float16.

## Capacidades

- Síntesis de voz a partir de texto con salida a 24 kHz, en tramas de 80 ms.
- Nueve voces predefinidas seleccionables mediante el token de altavoz del prefijo de códec.
- Diez idiomas soportados según la model card (lista no detallada); el idioma se indica también en el prefijo de códec.
- Generación de voz con muestreo estocástico configurable (temperatura, top-k, penalización de repetición), lo que introduce variabilidad entre ejecuciones.
- Inferencia completa en el navegador con ONNX Runtime Web y WebGPU, sin llamadas a servidor.
- Ejecución alternativa en CPU mediante ONNX Runtime, usada por el autor para medir la calidad.
- No se documenta soporte de *tool calling*, agentes, visión, audio de entrada ni modo de razonamiento explícito: es un modelo estrictamente texto-a-voz.

## Casos de uso

- **Lectura por voz en aplicaciones web sin backend**: el modelo se ejecuta en el propio navegador con WebGPU, de modo que el texto del usuario nunca sale del dispositivo; adecuado para lectores de pantalla, blogs o documentación con privacidad estricta.
- **Asistentes conversacionales locales**: al integrarse en una interfaz web ya existente, permite añadir respuesta hablada a un chatbot sin desplegar infraestructura de GPU en servidor ni asumir costes por petición.
- **Prototipado rápido de voces para producto**: los nueve altavoces integrados y los diez idiomas permiten evaluar variantes de locución en maquetas y demos antes de contratar un servicio TTS en producción.
- **Accesibilidad en entornos con conectividad limitada**: una vez descargado el repositorio de 1,4 GB, la síntesis funciona sin red, útil en terminales de kiosco, aulas o dispositivos con internet intermitente.
- **Generación de audio para contenido educativo**: narración de material de e-learning o audiolibros cortos en lotes, con la ventaja de que el proceso puede ejecutarse en el equipo del propio creador.
- **Pruebas de regresión de pipelines TTS**: al ser una exportación ONNX determinista en su arquitectura (aunque no en el muestreo), sirve para comparar cuantizaciones y backends (CPU frente a WebGPU) midiendo WER con un ASR como Whisper.
- **Evaluación de despliegue en cliente para investigadores**: permite estudiar el impacto de la cuantización int4/int8 sin calibración en la calidad de voz, con un punto de referencia claro (el modelo float32 original).

## Benchmarks y rendimiento

El único dato publicado por el autor es una evaluación de inteligibilidad con Whisper small.en sobre ocho frases de prueba, altavoz `ryan`, en inglés y con los parámetros de muestreo del modelo original (ONNX Runtime CPU frente a Chrome). Al ser un muestreo estocástico y una muestra de ocho frases, los resultados deben tomarse como indicativos.

| Métrica | Este modelo (ONNX, CPU) | Este modelo (ONNX, Chrome/WebGPU) | Modelo original float32 |
|---|---|---|---|
| WER con Whisper small.en (8 frases, inglés, altavoz ryan) | 9,1 % | 11,4 % | 10,2 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras baterías estándar en la información disponible, ni métricas de calidad perceptual (MOS) o de similitud de hablante.

## Requisitos de hardware

- **Almacenamiento**: 1,4 GB para los grafos ONNX cuantizados más el decodificador de códec (`tok_decoder_q4.onnx`, descargado del repositorio del tokenizador).
- **VRAM estimada**: no hay cifra oficial. Los pesos en int4 suman aproximadamente 1,4 GB; añadiendo caché KV y activaciones en float32, una estimación razonable se sitúa en el entorno de 2 GB, pero debe considerarse una aproximación, no un dato del autor.
- **GPU recomendadas**: cualquier GPU con soporte WebGPU en el navegador; en la práctica, GPUs dedicadas (gama RTX o superior) ofrecen la experiencia más fluida, mientras que las integradas pueden funcionar con latencia mayor.
- **Compatibilidad con GPU de consumo**: sí, el diseño está pensado para ello; el propio autor ejecuta la variante de referencia en CPU mediante ONNX Runtime.
- **Despliegue**: ONNX Runtime Web con *execution provider* WebGPU (navegador) u ONNX Runtime en CPU (servidor o escritorio); los grafos del *talker* y del predictor se generaron con el *model builder* de ONNX Runtime GenAI (`-p int4 -e webgpu` y `-p int8 -e cpu` respectivamente) y se integran mediante el proyecto Quick Inference.
- **Latencia y throughput**: no publicados. La arquitectura genera una trama cada 80 ms (12,5 tramas por segundo) más los 15 pasos del predictor de códigos por trama, por lo que el coste por segundo de audio es sensiblemente mayor que el de un decodificador puramente acústico; no se aporta factor de tiempo real medido.

## Comparativa con modelos similares

No se dispone de datos verificables de otros modelos TTS comparables en la información proporcionada, por lo que la comparación se limita a las dos variantes del mismo modelo.

| Modelo | Parámetros | Contexto | Formato y cuantización | Ejecución en navegador | WER (8 frases, inglés) | Licencia |
|---|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-1.7B-CustomVoice-ONNX-WebGPU (esta ficha) | 1,7 B | No disponible | ONNX int4/int8, activaciones fp32 | Sí (WebGPU) | 9,1 % CPU / 11,4 % Chrome | Apache 2.0 |
| Qwen3-TTS-12Hz-1.7B-CustomVoice (original) | 1,7 B | No disponible | Pesos originales en float32 | No documentado | 10,2 % | Apache 2.0 |

Como dependencia adicional, el decodificador de códec se distribuye por separado en `danyalmalik/Qwen3-TTS-Tokenizer-12Hz-ONNX-WebGPU`; sin él los grafos del *talker* y del predictor no producen audio.

## Limitaciones y advertencias

- **Salidas no idénticas al original**: el autor advierte explícitamente de que los ficheros son modificados y de que la salida se aproxima, pero no coincide, con la del modelo float32.
- **Cuantización sin calibración**: el redondeo al más cercano con bloques de 32 y sin datos de calibración puede degradar voces o idiomas concretos; la evaluación publicada solo cubre inglés y un único altavoz (`ryan`) sobre ocho frases.
- **Sensibilidad numérica**: el *talker* en float16 producía habla incoherente y el predictor en float16 generaba NaN, de ahí el uso obligatorio de float32 en activaciones y caché; cualquier reexportación debe tenerlo en cuenta.
- **Muestreo estocástico**: la generación con temperatura 0,9 y top-k 50 implica variabilidad entre ejecuciones, lo que complica la reproducibilidad y las pruebas automatizadas.
- **Huecos de documentación**: no se detallan la lista de idiomas, la longitud de contexto, el corpus de entrenamiento ni métricas de calidad perceptual; la cifra de 1,7 B de parámetros procede del nombre del modelo base.
- **Dependencia de WebGPU**: el escenario principal exige un navegador con soporte WebGPU; en CPU la latencia puede hacer inviable el uso interactivo, aunque la calidad medida sea superior.
- **Riesgo de alucinación en el texto hablado**: como todo modelo generativo, puede omitir, repetir o alterar fragmentos del texto de entrada, especialmente con entradas largas o fuera de distribución; no se documenta ningún mecanismo de verificación.
- **Sesgos**: no se publica información sobre sesgos de voz, acento o género de los nueve altavoces integrados; la selección de voces es fija y no se documenta clonación.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar los términos del modelo base y del tokenizador por separado, ya que se distribuyen en repositorios distintos.
- **Madurez**: el repositorio no registra descargas ni valoraciones y fue actualizado a los pocos minutos de su creación, por lo que no hay evidencia de uso en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/danyalmalik/Qwen3-TTS-12Hz-1.7B-CustomVoice-ONNX-WebGPU
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice
- Decodificador de códec (dependencia): https://huggingface.co/danyalmalik/Qwen3-TTS-Tokenizer-12Hz-ONNX-WebGPU
- Proyecto Quick Inference (script de exportación `tools/export/export_qwen3_tts.py`): https://github.com/mdanyalmalik/quick-inf
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
