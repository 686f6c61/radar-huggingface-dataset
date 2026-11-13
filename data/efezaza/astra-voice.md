# efezaza/astra-voice

## Resumen

ASTRA Voice es un paquete de pesos en formato ONNX del modelo Chatterbox Multilingual de Resemble AI, publicado por el usuario efezaza como runtime para la aplicacion de escritorio ASTRA (modulo Kurgu Odası → Seslendirme). No se trata de un modelo entrenado desde cero: los pesos son los de Chatterbox Multilingual y las modificaciones se limitan a la conversion y reestructuracion de los grafos para ejecucion local con onnxruntime sobre WebGPU o CPU.

El modelo resuelve el problema de la sintesis de voz multilingue con clonacion de voz en el dispositivo del usuario, sin necesidad de enviar audio a servidores externos. Cubre 23 idiomas, entre ellos espanol, ingles, turco, aleman, frances, arabe, chino y japones, e incluye las capacidades de zero-shot voice cloning heredadas del modelo base.

El repositorio ocupa 2,8 GB y esta publicado bajo licencia MIT. La relevancia practica esta en que ofrece una ruta de despliegue ONNX de Chatterbox con el modelo de lenguaje reescrito a GroupQueryAttention y el decodificador S3Gen fragmentado en grafos pre/paso Euler/post, lo que facilita la inferencia en hardware de consumo sin depender de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS autoregresivo basado en Chatterbox (modelo de lenguaje t3_mtl23ls_v2 + decodificador S3Gen), exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (GPU) y 8 bits (CPU) en el modelo de lenguaje ONNX |
| Idiomas soportados | 23: tr, en, de, fr, es, it, pt, ru, ar, nl, pl, sv, da, fi, no, el, he, hi, ja, ko, zh, ms, sw |
| Licencia | MIT |
| Formato de pesos | ONNX (runtime para onnxruntime con WebGPU o CPU) |

## Arquitectura y entrenamiento

El modelo es una exportacion ONNX del Chatterbox Multilingual de Resemble AI. Segun la model card, los pesos no se han modificado: los cambios consisten en reescribir el modelo de lenguaje con GroupQueryAttention (fp16 para GPU, 8 bits para CPU) y dividir el decodificador S3Gen en tres grafos: pre, un unico paso Euler y post. Los pesos t3_mtl23ls_v2 y el vocabulario completo provienen de Folx/chatterbox-ONNX-polish, y se cita tambien onnx-community/chatterbox-multilingual-ONNX como fuente ONNX adicional.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, ni sobre si el modelo base incorporo RLHF, DPO u otras fases de alineacion. La model card tampoco detalla innovaciones de decodificacion mas alla de la fragmentacion del decodificador y del uso de GroupQueryAttention para reducir el coste computacional en GPU de consumo.

## Capacidades

- Sintesis de voz (text-to-speech) en 23 idiomas, incluidos espanol, ingles, turco, aleman, frances, italiano, portugues, ruso, arabe, chino, japones, coreano e hindi.
- Clonacion de voz zero-shot a partir de audio de referencia, heredada de Chatterbox.
- Ejecucion local completa con onnxruntime, sin llamadas a API externas.
- Aceleracion por GPU via WebGPU con pesos fp16 y ejecucion en CPU con pesos de 8 bits.
- Generacion de audio para lecturas, narracion y doblaje dentro de la aplicacion de escritorio ASTRA.
- No se documenta soporte de tool calling, agentes, vision, audio de entrada ni modo de razonamiento explicito.

## Casos de uso

- Narracion de documentos dentro de la app ASTRA: el modelo convierte texto en voz en el equipo del usuario, sin subir contenido a servicios en la nube, lo que resulta adecuado para material confidencial.
- Doblaje y localizacion de contenido multilingue: al cubrir 23 idiomas, permite generar pistas de voz en espanol, ingles, turco o japones desde un mismo pipeline.
- Clonacion de voz con consentimiento para audiolibros o podcasts: la funcion zero-shot permite mantener un timbre consistente a partir de una muestra de referencia.
- Prototipado de asistentes por voz en escritorio: la ejecucion con onnxruntime y WebGPU facilita integrar TTS en aplicaciones Electron o web sin backend dedicado.
- Accesibilidad: lectura en voz alta de interfaces y documentos para usuarios con discapacidad visual, ejecutandose en local.
- Generacion de material educativo o de formacion: creacion de locuciones en varios idiomas para cursos y tutoriales sin coste por caracter.
- Pruebas de UX de producto: sintesis rapida de guiones y dialogos para validar interfaces conversacionales antes de contratar voces profesionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 2,8 GB; el consumo de VRAM depende de la variante: fp16 con WebGPU requiere mas memoria que la variante de 8 bits para CPU.
- GPU recomendadas: no se especifican modelos concretos en la informacion proporcionada; la model card solo menciona aceleracion WebGPU y ejecucion en CPU.
- Compatibilidad con GPU de consumo: si, segun la model card el modelo esta pensado para ejecutarse en el PC del usuario con onnxruntime; no se detallan modelos concretos (RTX 4090, etc.).
- Opciones de despliegue: onnxruntime con backend WebGPU o CPU; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ASTRA Voice (este modelo) | no disponible | no disponible | 23 | MIT | ONNX |
| ResembleAI/chatterbox (base) | no disponible | no disponible | multilingue | MIT | PyTorch |
| onnx-community/chatterbox-multilingual-ONNX | no disponible | no disponible | multilingue | no disponible en la informacion | ONNX |
| Folx/chatterbox-ONNX-polish | no disponible | no disponible | no disponible | no disponible en la informacion | ONNX |

Los datos de parametros, contexto y rendimiento de los modelos comparados no aparecen en la informacion proporcionada; la comparativa se limita a licencia y formato de despliegue.

## Limitaciones y advertencias

- Es un paquete de runtime, no un modelo nuevo: la calidad de sintesis y los sesgos son los del Chatterbox Multilingual de Resemble AI.
- Riesgo de uso indebido en clonacion de voz; la propia model card exige consentimiento explicito de la persona cuya voz se clona.
- No se documentan evaluaciones de sesgo, robustez ni tasas de alucinacion acustica (pronunciacion incorrecta, artefactos).
- La cobertura de los 23 idiomas puede ser desigual; no se aportan metricas por idioma.
- No hay informacion sobre limites de longitud de texto de entrada ni sobre el coste de inferencia en CPU.
- Aunque la licencia es MIT, el uso comercial de voces clonadas puede estar sujeto a derechos de imagen y voz de terceros.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/efezaza/astra-voice
- Modelo base: https://huggingface.co/ResembleAI/chatterbox
- Fuente ONNX (Folx): https://huggingface.co/Folx/chatterbox-ONNX-polish
- Fuente ONNX (onnx-community): https://huggingface.co/onnx-community/chatterbox-multilingual-ONNX
