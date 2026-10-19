# johnbean393/chiboard-1.1-pruning-ckpt-p1-step-6596-GGUF

## Resumen

Chiboard 1.1 — P1, step 6596 (GGUF) es un checkpoint experimental de johnbean393 para un método de entrada de Pinyin chino, con contexto opcional de capturas de pantalla. El modelo convierte composiciones Pinyin en texto chino dentro de un campo o documento, usando el contexto previo y, si se proporciona, una o dos imágenes de ventana como referencia visual. Está publicado en formato GGUF y cuenta con 752.393.024 parámetros, además de un proyector de visión F16 separado para la entrada de imágenes.

El checkpoint deriva de P1 en una revisión concreta del repositorio de poda y se ha convertido con llama.cpp. No es una versión final de Chiboard 1.1: la model card lo describe como un checkpoint de prueba, con inferencia de texto y de una o dos capturas verificada únicamente mediante pruebas básicas en Chiboard Demo.

Su relevancia es acotada pero específica: explora un modelo pequeño, multimodal y ejecutable en local para una tarea de entrada de texto chino, con un formato de prompt propio y una política de preprocesado de imágenes definida. La licencia es muy restrictiva y no es de código abierto: el uso para pruebas requiere autorización previa por escrito del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible; checkpoint multimodal con proyector de visión, sin familia de arquitectura especificada |
| Parámetros totales | 752.393.024 |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q8_0 para el modelo principal; F16 para el proyector de visión |
| Idiomas soportados | zh (chino); no se indican otros idiomas |
| Licencia | chiboard-author-authorized-testing-only-1.0; no es código abierto y requiere autorización previa por escrito para pruebas |
| Formato de pesos | GGUF; proyector de visión GGUF F16 |
| Tamaño del repositorio | 1,0 GB |
| Uso previsto | Conversión de composiciones Pinyin a chino con contexto textual y capturas de pantalla opcionales |

## Arquitectura y entrenamiento

No se especifica en la información disponible la arquitectura interna del modelo ni su familia concreta. Se describe como un checkpoint multimodal con un proyector de visión emparejado, necesario para la entrada de capturas de pantalla. El modelo principal se distribuye en GGUF Q8_0 y el proyector en GGUF F16. No constan datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO ni otras innovaciones de entrenamiento.

El checkpoint se convirtió desde P1 en la revisión `7be679f3a5b75aa285a11bba89c3ebe20c520ab1` y se generó con llama.cpp en la revisión `2851b3bcbf8d993a2243ae751c0a7dfa8e944a40`. El formato de prompt define campos para captura de referencia, captura actual, contexto comprometido, Pinyin bruto, composición mostrada y salida. La generación debe comenzar inmediatamente después de `<|chiboard_output|>` y detenerse en `<|endoftext|>` (ID 248044). Para las imágenes se define una política de preprocesado concreta: redimensionado bicúbico, composición de transparencia sobre negro y relleno hasta múltiplos de 32.

## Capacidades

- Conversión de composiciones Pinyin a texto chino en el contexto de un campo o documento, usando el campo `context` para desambiguar.
- Procesamiento de la composición actual mediante los campos `raw` y `display`, incluyendo mezclas de chino y Pinyin sin convertir.
- Entrada opcional de capturas de pantalla: una imagen de referencia y una imagen de la ventana actual, siempre en ese orden.
- Uso de un proyector de visión específico para insertar embeddings de imagen en la secuencia de entrada.
- Generación limitada a la composición actual: el objetivo se detiene en el límite mecanografiado y conserva como literales las letras de la última sílaba sin terminar.
- Formato de prompt estricto con tokens de campo; no debe añadirse BOS, envoltorio de chat, mensaje de sistema ni EOS al prompt.
- Etiquetado como `conversational`, aunque su función documentada es la conversión de entrada Pinyin, no el diálogo general.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, código, matemáticas, audio ni otras capacidades generales.
- No se documenta soporte multilingüe más allá del chino.

## Casos de uso

- Prototipo de método de entrada chino en escritorio: integrar el checkpoint en un motor de IME para convertir Pinyin en caracteres chinos, usando el contexto del campo activo para resolver homófonos y términos parciales. Su tamaño de 752 M parámetros y formato GGUF facilitan pruebas locales.
- Desambiguación con contexto textual: enviar el texto ya comprometido en el campo o documento para que el modelo elija la conversión más coherente con la frase en curso. Es adecuado porque el formato de prompt separa explícitamente `context`, `raw` y `display`.
- Conversión asistida por captura de pantalla: usar la imagen de la ventana activa para aportar nombres de interfaz, títulos, etiquetas o términos visibles que ayuden a convertir una composición ambigua. Requiere el proyector de visión F16 y respetar la política de preprocesado.
- Coherencia entre ventanas: emplear una captura de referencia y otra de la ventana actual para mantener la continuidad de términos entre vistas, por ejemplo en formularios o documentos con varias ventanas. La model card exige que una imagen de referencia vaya acompañada de una imagen actual.
- Pruebas de regresión de un IME: validar el formato de prompt, la parada en `<|endoftext|>`, la conservación de la última sílaba incompleta y la inserción de imágenes en llama.cpp/mtmd. La propia model card indica que se hicieron pruebas básicas de texto y de una o dos capturas en Chiboard Demo.
- Investigación sobre modelos pequeños multimodales para entrada de texto: estudiar el comportamiento de un modelo de 752 M parámetros con proyector de visión en una tarea de IME, siempre bajo la autorización exigida por la licencia.
- Evaluación de privacidad en entrada local: analizar el tratamiento de capturas de pantalla que pueden contener información sensible antes de plantear cualquier despliegue. No se documentan garantías de privacidad ni de procesamiento local más allá de la ejecución con llama.cpp/mtmd.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos Q8_0 de 752.393.024 parámetros ocupan aproximadamente 0,8 GB; el repositorio completo ocupa 1,0 GB. Con el proyector F16, la caché KV y el overhead de llama.cpp, una estimación prudente es de 2 a 4 GB de VRAM. No hay requisitos oficiales publicados.
- GPU recomendadas: no hay una lista oficial. Por tamaño, cabe en GPU de consumo con 4 GB o más de VRAM, como GTX 1650 4 GB, RTX 3050 6 GB o RTX 4060. No requiere A100 ni H100.
- Ejecución en CPU: viable con llama.cpp, con latencia superior a la de una GPU. No se dispone de cifras de latencia o throughput.
- Despliegue: llama.cpp/mtmd es la vía documentada, junto con Chiboard Demo para pruebas. No consta soporte oficial para vLLM, TGI u Ollama.
- Entrada visual: requiere el proyector `mmproj-chiboard-1.1-pruning-ckpt-p1-step-6596-f16.gguf` y el placeholder `<__media__>` en el texto de entrada de llama.cpp/mtmd. Las imágenes se suministran por separado en orden referencia-actual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Formato | Disponibilidad |
|---|---:|---|---|---|---|---|
| Chiboard 1.1 — P1, step 6596 (este modelo) | 752.393.024 | No disponible | No disponible | Testing-only, requiere autorización previa por escrito | GGUF Q8_0; proyector F16 | Repositorio público en HuggingFace, sujeto a licencia |
| Chiboard 1 S1 | 350 M según LLM Explorer | 125K según LLM Explorer | No disponible en la información consultada | No disponible | GGUF | Repositorio público en HuggingFace |
| Chiboard 1 M0 | No disponible | No disponible | No disponible | No disponible | GGUF | Repositorio público en HuggingFace |

No se dispone de benchmarks comparativos entre estos modelos en la información proporcionada. La comparación se limita a parámetros, contexto publicado para S1 y formato de distribución; no debe interpretarse como una evaluación de calidad.

## Limitaciones y advertencias

- Licencia restrictiva: no es una licencia de código abierto. El uso para pruebas requiere autorización previa por escrito del autor, y la disponibilidad pública no concede permiso de uso. Otras actividades están prohibidas salvo las excepciones legalmente obligatorias.
- Checkpoint experimental: no es la versión final de Chiboard 1.1. Solo se han realizado pruebas básicas de texto y de una o dos capturas en Chiboard Demo.
- Idioma limitado: la model card declara únicamente chino (`zh`). No se documentan capacidades en castellano ni en otros idiomas.
- Contexto desconocido: no se publica la longitud de contexto. El comportamiento con composiciones o documentos largos no está documentado.
- Formato de prompt frágil: no debe añadirse BOS, envoltorio de chat, mensaje de sistema ni EOS. Los tokens de campo deben mantenerse aunque sus valores estén vacíos.
- Dependencia del proyector de visión: las capturas de pantalla requieren el proyector F16 correspondiente y el preprocesado exacto definido por el autor. Una imagen de referencia exige una imagen actual.
- Riesgo de conversión incorrecta: no se han publicado evaluaciones de precisión. En una tarea de IME, los errores de conversión pueden afectar directamente al texto introducido por el usuario.
- Sesgos y alucinación: no se documentan sesgos conocidos ni evaluaciones de alucinación. Al no ser un modelo de propósito general, no debe usarse como sustituto de un LLM conversacional.
- Privacidad: las capturas de pantalla pueden contener información sensible. No se documentan garantías de privacidad, retención o procesamiento local más allá de la ejecución técnica con llama.cpp/mtmd.
- Uso comercial: no autorizado por la licencia salvo autorización expresa. No debe desplegarse en producción sin revisión legal y permiso del autor.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/johnbean393/chiboard-1.1-pruning-ckpt-p1-step-6596-GGUF)
- [Checkpoints de poda P1, revisión 7be679f3a5b75aa285a11bba89c3ebe20c520ab1](https://huggingface.co/johnbean393/chiboard-1.1-pruning-checkpoints/tree/7be679f3a5b75aa285a11bba89c3ebe20c520ab1/P1)
- [Licencia en el repositorio](https://huggingface.co/johnbean393/chiboard-1.1-pruning-ckpt-p1-step-6596-GGUF/blob/main/LICENSE)
- [Chiboard 1 M0 GGUF](https://huggingface.co/johnbean393/chiboard-1-m0-GGUF)
- [Chiboard 1 S1 GGUF](https://huggingface.co/johnbean393/chiboard-1-s1-GGUF)
- [Chiboard 1 S1 en LLM Explorer](https://llm-explorer.com/model/johnbean393%2Fchiboard-1-s1,2qU1HYbHkF9HXxi1ksquU6)
- [Perfil de GitHub de johnbean393](https://github.com/johnbean393)
- [Cuaderno de Google Colab](https://colab.research.google.com/drive/1Ex4gE5v1bPR3evfhtG7sDHxQGsWwNwby)
