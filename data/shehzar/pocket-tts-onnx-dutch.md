# shehzar/pocket-tts-onnx-dutch

## Resumen

Pocket TTS Dutch ONNX es un paquete de sintesis de voz (text-to-speech) en neerlandes derivado de Pocket TTS de Kyutai, convertido a formato ONNX con cuantizacion int8 para ejecutarse integramente en un navegador web mediante ONNX Runtime Web. Lo publica el usuario shehzar como contrapartida neerlandesa de los bundles de KevinAHM/pocket-tts-onnx, que no incluye un paquete en este idioma. El repositorio no contiene pesos entrenados desde cero, sino una conversion de formato de los pesos originales de Kyutai.

El modelo resuelve el caso de uso de TTS local en el cliente: al estar exportado a ONNX int8 y dividido en grafos independientes (encoder Mimi, acondicionador de texto, flow LM principal, flow LM de flujo y decodificador Mimi), puede desplegarse sin backend de inferencia dedicado y con un peso total de repositorio de aproximadamente 0,1 GB. Incluye ademas capacidad de clonacion de voz, segun las etiquetas del autor.

La relevancia actual reside en la combinacion de licencia CC BY 4.0 (uso comercial permitido con atribucion), soporte de un idioma poco cubierto en TTS open source como el neerlandes y un formato pensado para inferencia en el navegador. La informacion publicada no detalla arquitectura interna, numero de parametros ni longitud de contexto, por lo que esos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Pocket TTS de Kyutai; pipeline con encoder Mimi, acondicionador de texto, flow LM y decodificador Mimi) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (todos los grafos exportados llevan el sufijo `_int8`) |
| Idiomas soportados | neerlandes (nl) |
| Licencia | CC BY 4.0 (pesos originales de Kyutai); codigo de Pocket TTS bajo MIT |
| Formato de pesos | ONNX int8 (`mimi_encoder_int8.onnx`, `text_conditioner_int8.onnx`, `flow_lm_main_int8.onnx`, `flow_lm_flow_int8.onnx`, `mimi_decoder_int8.onnx`), mas `tokenizer.model`, `bos_before_voice.npy` y `bundle.json` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento. Lo que si se detalla es la estructura del bundle exportado: cinco grafos ONNX cuantizados a int8 que cubren el encoder Mimi, el acondicionador de texto, el flow LM principal, el flow LM de flujo y el decodificador Mimi, acompanados del tokenizador (`tokenizer.model`), un vector `bos_before_voice.npy` y un manifiesto `bundle.json`.

La innovacion tecnica documentada esta en la exportacion: el grafo `flow_lm_main` utiliza el contrato optimizado de KV-delta del fork lookbe/pocket-tts-onnx-export, con estado `cache_k`/`cache_v` separado en formato head-major y salidas de filas delta. El `bundle.json` incluye los manifiestos de estado correspondientes y un marcador `driver_contract` que el runtime debe respetar. No se indica numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Sintesis de voz en neerlandes a partir de texto, con pipeline `text-to-speech`.
- Clonacion de voz, segun la etiqueta `voice-cloning` del repositorio y el vector de referencia `bos_before_voice.npy`.
- Inferencia en navegador mediante ONNX Runtime Web, sin necesidad de servidor de inferencia.
- Ejecucion con pesos cuantizados a int8, orientada a reducir requisitos de memoria y computo en el cliente.
- No se documentan capacidades de traduccion, reconocimiento de emociones, control de prosodia por etiquetas ni soporte multilingue mas alla del neerlandes.

## Casos de uso

- Lectura por voz de articulos o documentacion en neerlandes dentro de una aplicacion web: el bundle ONNX se carga en el navegador con ONNX Runtime Web y sintetiza el texto localmente, sin enviar el contenido a un servidor.
- Accesibilidad para usuarios neerlandeses con discapacidad visual: integracion del modelo en una extension o SPA que lea el contenido de la pagina en el propio dispositivo, con la ventaja de privacidad que supone no transmitir el texto.
- Asistentes conversacionales de escritorio o web para el mercado neerlandes: el modelo aporta la capa de salida de voz en nl mientras el LLM y la logica de dialogo corren en otro componente.
- Prototipado rapido de interfaces de voz: al pesar el repositorio unos 0,1 GB y no requerir GPU dedicada, permite iterar sobre la experiencia de usuario sin aprovisionar infraestructura.
- Generacion de narraciones para contenido educativo o audioguias en neerlandes, con atribucion a Kyutai conforme a CC BY 4.0.
- Pruebas de clonacion de voz con consentimiento explicito: el modelo admite una referencia de voz (`bos_before_voice.npy`) para adaptar el timbre, util en doblaje controlado o en aplicaciones personalizadas.
- Evaluacion comparativa de TTS en navegador: sirve como referencia para medir latencia y calidad de un pipeline Mimi + flow LM cuantizado a int8 frente a alternativas en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma desglosada; el repositorio completo ocupa aproximadamente 0,1 GB, lo que sugiere un modelo de pocos cientos de millones de parametros como maximo, pero no se confirma.
- GPU recomendadas: no disponibles. El destino declarado es la ejecucion en navegador con ONNX Runtime Web, no un despliegue en GPU de servidor.
- Compatibilidad con GPU de consumo: no se documenta; el enfasis esta en CPU y en el cliente web.
- Opciones de despliegue: ONNX Runtime Web (navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un pipeline TTS de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Idioma | Formato | Licencia | Contexto / tamano | Notas |
|---|---|---|---|---|---|
| shehzar/pocket-tts-onnx-dutch | Neerlandes | ONNX int8 | CC BY 4.0 | no disponible (repo ~0,1 GB) | Conversion de Pocket TTS de Kyutai, orientada a navegador |
| KevinAHM/pocket-tts-onnx | No incluye neerlandes | ONNX | no disponible en la informacion | no disponible | Bundle de referencia del mismo pipeline; el autor indica que no publica variante nl |
| Pocket TTS (Kyutai) | Original multilingue segun disponibilidad del proyecto | Pesos originales | CC BY 4.0 (pesos), MIT (codigo) | no disponible | Modelo base del que deriva esta conversion |
| Alternativas TTS open source en neerlandes | nl | variable | variable | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Solo soporta neerlandes; no se documenta cobertura de otros idiomas ni cambio de idioma en inferencia.
- No hay datos publicados de calidad (MOS, WER, similitud de hablante) ni de benchmarks, por lo que la evaluacion objetiva requiere pruebas propias.
- Riesgo de alucinacion acustica y de artefactos propios de TTS cuantizado a int8: posibles pronunciaciones erroneas, prosodia plana o ruido en fonemas poco frecuentes.
- La clonacion de voz esta explicitamente restringida: prohibido clonar o suplantar una voz sin consentimiento explicito y licito de la persona, y prohibido su uso para desinformacion o engano.
- Licencia CC BY 4.0: el uso comercial es posible, pero exige atribucion a Kyutai y al repositorio de conversion; el codigo de Pocket TTS es MIT.
- El contrato de KV-delta del `flow_lm_main` exige un driver compatible (marcador `driver_contract` en `bundle.json`); usar un runtime que no respete los manifiestos de estado puede producir salidas incorrectas.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- No se documentan sesgos demograficos o de acento del habla neerlandesa utilizada en el entrenamiento original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/shehzar/pocket-tts-onnx-dutch
- Bundle de referencia sin neerlandes: https://huggingface.co/KevinAHM/pocket-tts-onnx
- Exportador base: https://huggingface.co/KevinAHM/pocket-tts-onnx-export
- Fork del exportador usado en esta conversion: lookbe/pocket-tts-onnx-export (sin URL publica en la informacion disponible)
- Kyutai: https://kyutai.org
