# edbrdi/brindille

## Resumen

Brindille es un modelo de síntesis de voz (text-to-speech) en francés desarrollado por edbrdi, diseñado para ejecutarse íntegramente en el navegador sin servidor ni dependencias de ONNX Runtime o PyTorch. Con solo 93.734 parámetros totales (de los cuales 145 corresponden al sintetizador), el modelo genera audio mono a 22.050 Hz a partir de texto de entrada, utilizando una voz única llamada Estelle. La página completa, incluyendo el motor de inferencia compilado a WebAssembly, ocupa 2,7 MB (1,9 MB comprimidos), lo que lo convierte en una opción extremadamente ligera para despliegues en cliente.

El modelo resuelve el problema de la síntesis de voz en entornos con recursos limitados y sin conectividad, priorizando la portabilidad sobre la calidad fotorrealista. En lugar de emplear un vocoder neuronal convencional, la red predice tono, sonoridad y envolventes espectrales, y un sintetizador armónico con ruido renderiza la forma de onda. Esta arquitectura híbrida permite un rendimiento de aproximadamente 75 veces el tiempo real en WebAssembly con un solo hilo (medido en Apple M1 Max con Node).

La relevancia actual de Brindille radica en su enfoque de "on-device TTS" con licencia Apache-2.0, lo que facilita su integración en aplicaciones web, extensiones de navegador y dispositivos con recursos muy limitados. No obstante, su alcance es acotado: un solo idioma (francés), una sola voz y sin clonación, lo que lo posiciona como una solución especializada y no como un sustituto de sistemas TTS multilingües de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal con encoder y decoder (dos planes), sintetizador armónico + ruido para renderizado de waveform; sin vocoder neuronal |
| Parametros totales | 93.734 (145 en el sintetizador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos del decoder en int8, encoder en float32 |
| Idiomas soportados | Francés (fr) |
| Licencia | Apache-2.0 (modelo, módulo WebAssembly, tts.js y página); `model/fr.dict.bin` derivado del diccionario francés del Montreal Forced Aligner bajo CC BY 4.0 |
| Formato de pesos | `tts.alk` (266 KB, formato propietario del motor Alkove); no hay pesos ONNX ni PyTorch |

## Arquitectura y entrenamiento

Brindille emplea una arquitectura de red neuronal con dos componentes diferenciados: un encoder y un decoder, empaquetados en el archivo `tts.alk`. El modelo no utiliza un vocoder neuronal tradicional; en su lugar, la red predice parámetros acústicos (tono, sonoridad y envolventes espectrales) y un sintetizador armónico con ruido se encarga de renderizar la forma de onda final a 22.050 Hz en mono. Esta separación entre predicción acústica y síntesis de waveform reduce drásticamente el coste computacional y el tamaño del modelo.

El entrenamiento se apoya en un frontend de texto que incluye un léxico de pronunciaciones para 19.662 palabras francesas (`fr.dict.bin`), derivado del diccionario del Montreal Forced Aligner, y un componente llamado Lex que lee el resto de palabras. La voz Estelle proviene de Pocket TTS de Kyutai (CC BY 4.0), y la arquitectura de red y sintetizador se basa en AuroraTTS-100K de AuroraAI-Research (Apache-2.0). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de voz a partir de texto en francés con salida de audio mono a 22.050 Hz.
- Control de velocidad mediante el parámetro `speed` en la función `speak(text, speed)`.
- Ejecución completa en el hilo de la página sin servidor ni backend.
- Motor de inferencia compilado a WebAssembly (342 KB, 100 KB en brotli) para despliegue en navegador.
- Frontend de texto con léxico integrado para 19.662 palabras francesas y componente Lex para palabras fuera del léxico.
- Expansión de números enteros y decimales con coma en la lectura.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).
- No dispone de clonación de voz ni de selección entre múltiples voces.
- No soporta otros idiomas distintos del francés.

## Casos de uso

- **Aplicaciones web accesibles sin backend**: integración de Brindille mediante el módulo `tts.js` en páginas web para leer contenido en voz alta a usuarios con discapacidad visual, sin necesidad de enviar texto a un servidor externo y con una huella de 2,7 MB.
- **Extensiones de navegador para lectura de artículos**: el modelo puede ejecutarse en el hilo de la extensión y convertir párrafos de texto francés en audio en decenas de milisegundos por frase, aprovechando su velocidad de ~75× tiempo real en WebAssembly.
- **Aprendizaje de francés en entornos offline**: aplicaciones educativas que necesiten pronunciar vocabulario y frases en francés sin conectividad, usando el léxico integrado de 19.662 palabras para una pronunciación consistente.
- **Sistemas de navegación o kioscos embebidos**: dispositivos con recursos limitados que requieran síntesis de voz en francés para anuncios o instrucciones, gracias al reducido tamaño del modelo (266 KB) y a la ausencia de dependencias de runtime pesadas.
- **Prototipado rápido de interfaces de voz**: desarrolladores que necesiten validar flujos de interacción por voz en francés sin infraestructura de servidor, usando el demo de Hugging Face Spaces como referencia y el motor Alkove como base.
- **Generación de audio para pruebas automatizadas**: pipelines de CI/CD que requieran generar muestras de audio en francés para tests de integración, aprovechando la naturaleza determinista y ligera del motor y su ejecución en Node.
- **Contenido educativo interactivo en el navegador**: libros o materiales didácticos en francés que incorporen lectura en voz alta sin coste de servidor, con la limitación de una única voz y calidad de audio algo apagada.

## Benchmarks y rendimiento

| Métrica | Brindille | Audio de referencia (mismas frases) |
|---|---|---|
| WER (Whisper large-v3-turbo) | 9,6 % | 7,2 % |
| CER (Whisper large-v3-turbo) | 3,5 % | 2,7 % |
| DNSMOS OVR | 2,73 | 3,01 |

Datos sobre 49 frases reservadas, transcritas por Whisper large-v3-turbo. El autor señala que los errores propios de Whisper en nombres y palabras raras afectan a ambas filas. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no aplica en el sentido tradicional; el modelo se ejecuta en WebAssembly en el hilo del navegador o en Node, sin necesidad de GPU dedicada.
- **GPU recomendadas**: no se requiere GPU; el rendimiento medido (~75× tiempo real) se obtuvo en CPU (Apple M1 Max, Node, un solo hilo).
- **Compatibilidad con GPU de consumo**: no aplica; el modelo está diseñado para ejecución en CPU dentro del navegador.
- **Opciones de despliegue**: motor Alkove compilado a WebAssembly (incluido en el repositorio), con módulo `tts.js` para integración en páginas web; no soporta vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: una frase de unos segundos se sintetiza en decenas de milisegundos; throughput de ~75× tiempo real en WebAssembly con un solo hilo (Apple M1 Max, Node).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Despliegue |
|---|---|---|---|---|---|---|
| Brindille | 93.734 | No disponible | Francés | Apache-2.0 | `tts.alk` (propietario Alkove) | WebAssembly en navegador/Node |
| AuroraTTS-100K | No disponible en la información | No disponible | No disponible | Apache-2.0 | No disponible | No disponible |
| Pocket TTS (Kyutai) | No disponible en la información | No disponible | No disponible | CC BY 4.0 (voz Estelle) | No disponible | No disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoría (TTS en francés de tamaño similar). Los modelos citados (AuroraTTS-100K y Pocket TTS) se mencionan como base arquitectónica y de voz, respectivamente, pero no se ofrecen sus especificaciones completas.

## Limitaciones y advertencias

- Solo soporta francés y una única voz (Estelle); no hay clonación de voz ni selección entre múltiples hablantes.
- Los números se leen (enteros y decimales con coma), pero las abreviaturas, acrónimos y símbolos no se expanden.
- Los nombres propios y palabras extranjeras pasan por el componente Lex, que puede fallar en su pronunciación.
- Las liaison (enlaces fonéticos) siguen reglas solo para las palabras más comunes.
- La calidad del audio es ligeramente zumbante y apagada en comparación con habla natural (DNSMOS OVR de 2,73 frente a 3,01 del audio de referencia).
- El WER de 9,6 % y el CER de 3,5 % indican una inteligibilidad inferior a la del audio de referencia, aunque aceptable para muchas aplicaciones.
- La licencia Apache-2.0 cubre el modelo, el módulo WebAssembly, `tts.js` y la página, pero `model/fr.dict.bin` está bajo CC BY 4.0 y requiere atribución.
- El formato de pesos `tts.alk` es específico del motor Alkove, lo que limita la portabilidad a otros runtimes de inferencia.
- No es un modelo de lenguaje: no soporta tool calling, agentes ni razonamiento; su único propósito es la síntesis de voz.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/edbrdi/brindille)
- [Demo en Hugging Face Spaces](https://huggingface.co/spaces/edbrdi/brindille)
- [Motor Alkove (GitHub)](https://github.com/alkove-ai/alkove)
- [Pocket TTS de Kyutai (GitHub)](https://github.com/kyutai-labs/pocket-tts)
- [Voces TTS de Kyutai (Hugging Face)](https://huggingface.co/kyutai/tts-voices)
- [AuroraTTS-100K (Hugging Face)](https://huggingface.co/AuroraAI-Research/AuroraTTS-100K)
- [Lex de Alkove (Hugging Face)](https://huggingface.co/alkove-ai/alkove-lex-1-preview)
- [Modelos del Montreal Forced Aligner (GitHub)](https://github.com/MontrealCorpusTools/mfa-models)
- [Licencia CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
