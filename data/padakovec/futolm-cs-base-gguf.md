# Padakovec/futolm-cs-base-gguf

# futolm Czech base (futolm-cs-base-gguf)

## Resumen
futolm Czech base es un modelo de lenguaje de 29.368.832 parametros (aproximadamente 29,37 M) desarrollado por Padakovec y publicado en HuggingFace como exportacion GGUF. Se trata de un modelo base preentrenado desde cero especificamente para la prediccion de la siguiente palabra en FUTO Keyboard, un teclado de codigo abierto. Su proposito no es la generacion de texto generalista, sino servir como motor de lenguaje ligero para tareas de autocompletado y prediccion de palabras en checo dentro del flujo de entrada del teclado.

El modelo emplea una arquitectura Llama compacta: 8 capas, tamano oculto de 512, capa feed-forward de 1.024 y 8 cabezas de atencion/KV. Se entreno sobre una version depurada de Czech FineWeb2 (`ces_Latn`) y proceso 3.000.238.080 tokens (unos 3.000 millones) en 22.890 pasos, con una perdida de validacion de 2,7750 registrada en el paso 22.499. Incluye un tokenizador SentencePiece Unigram de 8.192 piezas compartido entre checo y eslovaco.

Su relevancia actual radica en el nicho de los modelos ultracompactos para inferencia en dispositivo (on-device): el archivo GGUF ocupa apenas 59.313.504 bytes (unos 59,3 MB), lo que permite ejecutarlo incluso en telefonos moviles dentro del propio teclado, sin depender de la nube. Esta pensado para integrarse en el flujo de importacion de modelos de FUTO Keyboard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only), 8 capas, hidden size 512, FFN 1.024, 8 cabezas de atencion/KV |
| Parametros totales | 29.368.832 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF F16 (matrices F16 y pesos de normalizacion F32); no se documentan otras cuantizaciones |
| Idiomas soportados | checo (`cs`); tokenizador compartido checo/eslovaco |
| Licencia | no disponible |
| Formato de pesos | GGUF v3 (F16), tokenizador SentencePiece embebido en el archivo |
| Vocabulario | 8.192 piezas SentencePiece Unigram |
| Tamano de archivo | 59.313.504 bytes (~59,3 MB) |

## Arquitectura y entrenamiento
El modelo sigue una arquitectura transformer decoder-only de tipo Llama, de dimensiones muy reducidas: 8 capas, un tamano oculto de 512 y una capa feed-forward de 1.024, con 8 cabezas de atencion (y KV). Emplea un tokenizador SentencePiece Unigram de 8.192 piezas, compartido entre checo y eslovaco, lo que sugiere que el autor prevé o planea cubrir ambos idiomas con la misma pieza de vocabulario.

El preentrenamiento se realizo desde cero sobre una version depurada de Czech FineWeb2 (`ces_Latn`). El modelo proceso 3.000.238.080 tokens a lo largo de 22.890 pasos de entrenamiento, con una perdida de validacion registrada de 2,7750 en el paso 22.499. No se menciona en la informacion disponible ninguna fase posterior de ajuste (RLHF, DPO, SFT) ni innovaciones tecnicas como atencion lineal o decodificacion especulativa. La model card indica explicitamente que se trata de un modelo base preentrenado y que no se ha realizado el ajuste fino especifico para autocorreccion.

## Capacidades
- Generacion de texto autoregresiva y prediccion de la siguiente palabra (next-word prediction), su tarea principal de diseno.
- Modelo base de lenguaje para checo, entrenado sobre corpus checo depurado.
- Tokenizacion compartida checo/eslovaco (8.192 piezas).
- Compatible con el flujo de importacion de modelos de FUTO Keyboard mediante el archivo GGUF con tokenizador embebido.
- Compatibilidad declarada con endpoints (`endpoints_compatible` segun los tags).
- No se documentan capacidades de tool calling, function calling, uso de agentes, razonamiento multi-paso, vision, audio ni modo de razonamiento (thinking).
- No se declaran funciones de autocorreccion ni se ha realizado el ajuste fino especifico para esa tarea.

## Casos de uso
- Prediccion de la siguiente palabra en FUTO Keyboard: el modelo esta disenado especificamente para esta funcion; se importa el archivo `cs_base.gguf` mediante el flujo nativo del teclado y se usa para sugerir la siguiente palabra mientras el usuario escribe en checo.
- Autocompletado en dispositivos moviles sin conexion: al ocupar solo ~59 MB en F16, puede ejecutarse localmente en el telefono, evitando enviar pulsaciones a servidores externos y reduciendo la latencia de red.
- Teclados y editores de texto en checo: integrable como motor de sugerencias en cualquier aplicacion de entrada que consuma GGUF, aprovechando su tokenizador compartido checo/eslovaco.
- Investigacion sobre modelos ultracompactos: util como punto de partida para experimentar con arquitecturas Llama de menos de 30 M de parametros y estudiar el equilibrio entre tamano y calidad en idiomas concretos.
- Fine-tuning especifico para autocorreccion: aunque no se ha realizado, el modelo base puede servir de punto de partida para entrenar tareas de correccion ortografica y tipografica en checo.
- Generacion de texto checo de bajo coste: en escenarios donde el presupuesto de computo o memoria es extremadamente limitado (dispositivos embebidos, demos, prototipos), puede emplearse para generar texto en checo.
- Pruebas de despliegue en infraestructura minima: util como banco de pruebas para validar pipelines GGUF (carga, tokenizacion, inferencia) sin requerir GPU.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato cuantitativo de rendimiento es la perdida de validacion registrada:

| Metrica | Valor |
|---|---|
| Perdida de validacion (paso 22.499) | 2,7750 |
| Paso final de entrenamiento | 22.890 |
| Tokens procesados en preentrenamiento | 3.000.238.080 |
| Similitud coseno minima (inferencia nativa vs. PyTorch, 11 casos) | 0,9999989 |

La verificacion comparo la inferencia nativa de FUTO Keyboard con la exportacion a PyTorch en 11 casos (ocho de prediccion de siguiente palabra y tres de mezcla de embeddings). Todas las predicciones top-1 y los conjuntos top-5 coincidieron. Esta verificacion comprueba compatibilidad numerica, no calidad de correccion.

## Requisitos de hardware
- VRAM estimada para inferencia: del orden de decenas de megabytes en F16 (archivo de ~59,3 MB); puede ejecutarse en CPU sin problema.
- GPU recomendadas: cualquiera con memoria suficiente, incluida practicamente cualquier GPU moderna; no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual e incluso en hardware integrado; el cuello de botella no es la memoria.
- Despliegue en movil/dispositivo: disenado para ejecucion nativa en FUTO Keyboard (codigo nativo fijado al commit `0246cbe2fb2f130a5dc475c508215760044dea20`, version 0.1.30).
- Opciones de despliegue: el autor lo distribuye para FUTO Keyboard; al ser GGUF, es compatible con el ecosistema GGUF (llama.cpp y derivados), si bien no se documentan instrucciones especificas para vLLM, TGI, Ollama u otros.
- Latencia y throughput: no disponibles. La model card indica que ni la latencia ni la calidad de escritura ni la importacion en telefono se han probado todavia.

## Comparativa con modelos similares
No se dispone de datos comparativos publicados para este modelo en la informacion proporcionada. La model card no ofrece comparaciones con alternativas, y el modelo pertenece a un nicho muy especifico (prediccion de palabra para teclados en un idioma concreto). Como referencia de categoria (modelos ultracompactos de ~30 M a ~500 M de parametros), se pueden considerar alternativas genericas ampliamente conocidas, aunque sus cifras no se han extraido de la informacion aportada:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| futolm-cs-base-gguf | 29,37 M | no disponible | no disponible | Prediccion de palabra en checo para teclado |
| SmolLM-135M (referencia externa) | 135 M | no disponible en la informacion aportada | no disponible en la informacion aportada | LLM pequeno multilingue generalista |
| Qwen2.5-0.5B (referencia externa) | 0,49 B | no disponible en la informacion aportada | no disponible en la informacion aportada | LLM pequeno generalista |

Los datos de las alternativas externas no forman parte de la informacion proporcionada y deben verificarse en sus fichas oficiales antes de usarse.

## Limitaciones y advertencias
- Es un modelo base (pretrained): no se ha realizado el ajuste fino para autocorreccion, por lo que no cabe esperar calidad de correccion lista para produccion.
- La verificacion de la mezcla de embeddings comprueba unicamente compatibilidad numerica, no la calidad de las correcciones.
- No se han probado la importacion en telefono, la latencia ni la calidad de escritura.
- La licencia no esta disponible en la informacion proporcionada; es imprescindible confirmarla antes de cualquier uso comercial.
- La longitud de contexto no esta documentada; no se puede garantizar el manejo de historiales largos de escritura.
- El modelo esta orientado al checo (`cs`) con tokenizador compartido checo/eslovaco; el soporte real de eslovaco no se detalla.
- Riesgo de sesgos y alucinacion inherente a un modelo entrenado sobre un unico corpus web depurado (Czech FineWeb2); al ser un modelo pequeno, la coherencia en generaciones largas sera limitada.
- El rendimiento en tareas generales de generacion, razonamiento o codigo no esta documentado y probablemente sea muy limitado por su tamano.
- En produccion conviene fijar el commit nativo de FUTO Keyboard usado en la verificacion para reproducir el comportamiento validado.

## Enlaces
- HuggingFace: https://huggingface.co/Padakovec/futolm-cs-base-gguf
- Archivo GGUF: cs_base.gguf (referenciado en el repositorio)
- Informe de verificacion: cs_base.verify.json
- Sumas de comprobacion: SHA256SUMS
- Modelos compatibles con GGUF en HuggingFace: https://huggingface.co/models?library=gguf
- Comunidad GGUF-Models: https://huggingface.co/GGUF-Models
- Guia de GGUF y Modelfile (referencia externa): https://dev.to/lingdas1/gguf-modelfile-the-power-users-guide-to-local-llms-1fbi
- Buscador de modelos GGUF (referencia externa): https://local-ai-zone.github.io/
