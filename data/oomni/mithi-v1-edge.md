# Oomni/mithi-v1-edge

## Resumen

Mithi v1 Edge es un modelo de síntesis de voz (text-to-speech) desarrollado por Oomni, diseñado específicamente para ejecutarse en dispositivos de recursos limitados como teléfonos móviles, portátiles y placas tipo Raspberry Pi. Cubre 11 idiomas —hindi, inglés, bengalí, guyaratí, canarés, malabar, maratí, odia, panyabí, tamil y telugu— y ofrece 10 voces (cinco masculinas y cinco femeninas), cada una capaz de hablar los 11 idiomas.

El modelo es extremadamente compacto: 47,6 millones de parámetros y tan solo 39 MB de pesos (46 MB incluyendo los ficheros del tokenizador). Esta reducción se logra mediante compresión a int8 e int4 en formato safetensors. Genera audio mono a 24 kHz y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia radica en la combinación de cobertura lingüística amplia para lenguas índicas con un tamaño que permite inferencia en CPU sin GPU, algo poco habitual en modelos TTS multilingües. Está construido sobre componentes de código abierto como Maya2-native, Kokoro-82M e indic-bert, y se publica con un script de ejecución (`run.py`) que expone tanto interfaz de línea de comandos como API de Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS basado en componentes Maya2-native, Kokoro-82M e indic-bert) |
| Parametros totales | 47,6 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa texto frase a frase) |
| Tipos de cuantizacion | int8 e int4 (pesos comprimidos en safetensors) |
| Idiomas soportados | Hindi (hi), inglés (en), bengalí (bn), guyaratí (gu), canarés (kn), malabar (ml), maratí (mr), odia (or), panyabí (pa), tamil (ta), telugu (te) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (comprimido), ONNX para demo en navegador |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de que se construye sobre componentes de código abierto: Maya2-native (Apache 2.0), Kokoro-82M (Apache 2.0), indic-bert (MIT) como codificador, el normalizador de texto Maya y la librería misaki con espeak-ng para fonemización. El modelo produce audio mono a 24 kHz y procesa el texto de entrada frase por frase de forma automática cuando la longitud excede un umbral.

No se especifican en la model card el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste fino supervisado. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El dato más concreto sobre el diseño es la compresión de pesos a int8 e int4 para reducir el tamaño a 39 MB, lo que sugiere una optimización agresiva orientada a despliegue en dispositivos de bajos recursos.

## Capacidades

- Síntesis de voz en 11 idiomas: hindi, inglés, bengalí, guyaratí, canarés, malabar, maratí, odia, panyabí, tamil y telugu.
- 10 voces predefinidas: Satvik, Anirban, Nakul, Vasant y Siddhant (masculinas); Charvi, Ahana, Vaidehi, Malini y Jahnavi (femeninas). Cada voz habla los 11 idiomas.
- Salida de audio mono a 24 kHz en formato WAV.
- Procesamiento automático de texto largo: divide la entrada en frases y las sintetiza de forma secuencial.
- Inferencia en CPU y GPU: funciona sin GPU, con control del número de hilos de CPU mediante `--threads` o `torch.set_num_threads()`.
- API de Python (`Mithi.synthesize`, `Mithi.save`) y línea de comandos (`run.py`).
- Exportación ONNX incluida para ejecución en navegador (demo en Hugging Face Spaces).
- Normalización de texto para números, fechas, divisas y URLs (limitada a la calidad del normalizador).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- **Lectura de noticias y artículos en lenguas índicas**: el modelo puede convertir texto periodístico en audio para aplicaciones de accesibilidad o consumo de contenido en hindi, tamil, telugu y el resto de idiomas soportados, con la ventaja de ejecutarse en servidores sin GPU o incluso en el propio dispositivo del usuario.
- **Asistentes de voz en dispositivos móviles**: con 39 MB de pesos y soporte de CPU, puede integrarse en aplicaciones Android o iOS para respuestas habladas en el idioma local del usuario, sin depender de servicios en la nube y con latencia baja al no requerir conexión.
- **Sistemas de anuncios y avisos automatizados**: adecuado para generar avisos de cita, recordatorios o confirmaciones (como el ejemplo de la model card: "Your appointment is confirmed for Monday at 10:30 AM") en inglés o en lenguas índicas, con voces masculinas o femeninas según el contexto.
- **Aprendizaje de idiomas**: las 10 voces cubriendo 11 idiomas permiten generar material de escucha para prácticas de pronunciación y comprensión auditiva en lenguas índicas, con la posibilidad de comparar la misma frase en distintas voces.
- **Accesibilidad para personas con discapacidad visual**: lectura de textos digitales en lenguas regionales de la India sobre hardware de bajo coste (Raspberry Pi, mini-PC), donde un modelo TTS más grande no cabría o requeriría GPU.
- **Generación de audiolibros y pódcasts de bajo coste**: el procesamiento frase a frase permite sintetizar documentos largos de forma desatendida, con la limitación de que cada frase se lee sin contexto de las demás.
- **Prototipado rápido de interfaces de voz**: gracias a la API de Python y a la línea de comandos, un desarrollador puede integrar TTS en un prototipo en minutos, usando la demo ONNX para validar la calidad antes de desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente: "No published evaluation yet: no automated scores and no human listening study (MOS)." No se dispone de métricas objetivas como MOS, CMOS, WER ni comparaciones cuantitativas con otros sistemas TTS.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible de forma explícita; con 39 MB de pesos en int8/int4, el modelo cabe holgadamente en cualquier GPU consumer e incluso en memoria unificada de dispositivos móviles.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM es suficiente; el modelo también funciona en CPU. No se especifican modelos concretos (A100, H100, RTX 4090) porque el tamaño no los requiere.
- **Compatibilidad con GPU consumer**: sí, en cualquier GPU consumer (GTX, RTX, etc.) e incluso en CPU sin GPU.
- **CPU**: soportada explícitamente, con control del número de hilos (`--threads` en CLI, `torch.set_num_threads()` en Python). La model card menciona portátiles, Raspberry Pi, teléfonos y servidores sin GPU como objetivos.
- **Opciones de despliegue**: script `run.py` incluido (CLI y API Python), exportación ONNX para navegador, integración con PyTorch (`torch>=2.4`) y `transformers>=5.0`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- **Latencia y throughput estimados**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Voces | Licencia | Tamaño de pesos | Evaluación publicada |
|---|---|---|---|---|---|---|
| Mithi v1 Edge | 47,6 M | 11 (índicas + inglés) | 10 | Apache 2.0 | 39 MB | No |
| Kokoro-82M | 82 M | Principalmente inglés | Múltiples | Apache 2.0 | ~330 MB (fp32) | Parcial (referencias en su repo) |
| Maya2-native | No disponible | No disponible | No disponible | Apache 2.0 | No disponible | No disponible |

La comparación más directa es con Kokoro-82M, del que Mithi reutiliza componentes: Mithi es aproximadamente la mitad de tamaño en parámetros, cubre 11 idiomas frente al enfoque principalmente anglófono de Kokoro y añade 10 voces multilingües. Sin embargo, la ausencia de evaluación publicada en Mithi impide comparar calidad subjetiva (MOS) de forma rigurosa. No se dispone de datos suficientes para comparar con otros modelos TTS índicos comerciales o abiertos en la información proporcionada.

## Limitaciones y advertencias

- **Expresividad limitada**: la entonación y la emoción son más planas que en habla humana natural, según reconoce la propia model card.
- **Compromiso naturalidad/tamaño**: el modelo prioriza el tamaño reducido sobre la naturalidad; los modelos Mithi más grandes suenan algo más naturales según el autor.
- **Panyabí con Jahnavi o Vasant**: estas combinaciones de voz e idioma pueden sonar menos naturales que con las demás voces.
- **Pronunciación**: algunas palabras, especialmente nombres poco comunes y préstamos lingüísticos, pueden pronunciarse incorrectamente.
- **Números, fechas, divisas y URLs**: se leen solo tan bien como los expanda el normalizador de texto; errores en la expansión se traducen en lecturas incorrectas.
- **Texto largo**: se procesa frase a frase sin contexto entre frases, lo que puede producir inconsistencias de prosodia en documentos extensos.
- **Sin evaluación publicada**: no hay puntuaciones automáticas ni estudios de escucha humana (MOS), lo que impide valorar la calidad de forma objetiva.
- **Riesgo de sesgos**: no documentado en la información disponible; al ser un modelo TTS, los sesgos se manifestarían en la representación de voces y en la calidad diferencial entre idiomas.
- **Licencia**: Apache 2.0 permite uso comercial, modificación y redistribución, siempre conservando la licencia y los créditos de los componentes de terceros (Maya2-native, Kokoro-82M, indic-bert, misaki, espeak-ng).
- **Dependencias**: requiere Python 3.10 o superior, PyTorch 2.4 o superior, transformers 5.0 o superior y varios paquetes adicionales (misaki, espeakng-loader, phonemizer-fork, spacy, num2words), lo que añade complejidad al despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Oomni/mithi-v1-edge
- Demo en navegador: https://huggingface.co/spaces/Oomni/mithi-v1-edge-demo
- Maya2-native: https://huggingface.co/maya-research/maya2-native
- Kokoro-82M (repositorio): https://github.com/hexgrad/kokoro
- indic-bert: https://huggingface.co/ai4bharat/indic-bert
- misaki: https://github.com/hexgrad/misaki
