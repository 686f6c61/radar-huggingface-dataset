# loom-ai-org/vocetta2-500k-loom

## Resumen

Vocetta2 500K es un modelo de síntesis de voz (text-to-speech) en inglés desarrollado por VantoraLabs y exportado por loom-ai-org al formato GGUF para su ejecución con el motor loom.cpp. Se trata de un modelo extremadamente compacto: 506.174 parámetros totales según los pesos en safetensors (la model card indica 499.528 para la red original), lo que lo sitúa en el rango de los modelos TTS embebidos y de bajo consumo. La arquitectura combina una red de duración, una red acústica que genera un espectrograma mel y un decodificador ConvNeXt/iSTFT que produce audio a 24 kHz.

El modelo resuelve el problema de la síntesis de voz local en dispositivos con recursos muy limitados, incluyendo placas como la Raspberry Pi Zero. Su relevancia actual radica en que demuestra que es posible empaquetar un pipeline TTS completo (fonemización, duración, acústica y decodificación de forma de onda) en un único fichero GGUF autodescriptivo de apenas 2,1 MB en precisión F32, con una licencia MIT permisiva.

Esta ficha corresponde a la exportación de loom.cpp, no al modelo original de VantoraLabs. El export incluye el grafo, el tokenizador y el driver embebidos, y requiere la librería `loom-py-rt` 1.0.0rc18 o superior para funcionar, ya que utiliza la operación `ISTFT` introducida en esa versión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline TTS: red de duración, red acústica a espectrograma mel y decodificador ConvNeXt/iSTFT a 24 kHz |
| Parametros totales | 506.174 (safetensors); 499.528 según la model card de la red original |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible; límite de 207 símbolos fonémicos por llamada (BOS y EOS incluidos) |
| Tipos de cuantizacion | F32 y Q8_0 con capas pointwise del decodificador en int8 por canal (`q8_0_pc`) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | GGUF (ficheros `vocetta2-500k-f32.gguf` y `vocetta2-500k-q8_0_pc.gguf`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura en cascada típica de los sistemas TTS neuronales: una red de duración que predice la longitud de cada fonema, una red acústica que transforma la secuencia fonémica en un espectrograma mel y un decodificador basado en ConvNeXt con una iSTFT final que convierte el mel en forma de onda a 24 kHz. El export a GGUF conserva los parámetros sin modificar en el fichero F32 y genera las versiones cuantizadas a partir de ellos, empaquetando además las topologías del grafo, el tokenizador y el driver de inferencia en un único fichero autodescriptivo.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron técnicas de RLHF o DPO; la model card no detalla el proceso de entrenamiento de la red original. La innovación técnica destacable de esta exportación es el propio formato: un GGUF autocontenido que incluye el driver y la lógica de ventaneo, muestreo y ensamblado necesarios, de modo que el motor loom.cpp puede ejecutar el pipeline completo sin código específico del modelo. El decodificador se alimenta por defecto con ruido cero, tal como lo renderiza el modelo original, y se ofrece un parámetro `noise_scale` opcional que el autor documenta como peor en todas las métricas.

## Capacidades

- Síntesis de voz en inglés a partir de texto ortográfico mediante la puerta de alto nivel `text2speech.infer(text)`.
- Fonemización integrada mediante `orthography2ipa` con un léxico de pronunciación estadounidense (hexgrad/misaki, Apache-2.0) que el modelo carga opcionalmente.
- Entrada directa de fonemas IPA mediante el argumento `phonemes=`, lo que permite usar cualquier G2P externo y obtener la calidad del front-end original.
- Control de velocidad del habla mediante `length_scale`.
- Añadido opcional de ruido gaussiano al decodificador mediante `noise_scale` y `seed`.
- Generación de audio a 24 kHz con todas las tramas que solicitan las duraciones predichas (sin el recorte de 2400 tramas del modelo original).
- Ejecución en CPU y GPU a través de loom.cpp, con backend compatible con dispositivos de bajos recursos.
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente un modelo TTS.

## Casos de uso

- Síntesis de voz en dispositivos embebidos: el modelo cabe en 2,1 MB en F32 y funciona en una Raspberry Pi Zero, lo que permite dotar de voz a asistentes locales, electrodomésticos o dispositivos IoT sin conexión a la nube.
- Lectura de notificaciones y alertas en aplicaciones de escritorio: con un consumo de memoria de aproximadamente 57-58 MB en tiempo de ejecución, puede integrarse en clientes de correo, sistemas de monitorización o herramientas CLI para leer mensajes en voz alta.
- Generación de audiolibros o podcasts de texto corto: el límite de 207 fonemas por llamada obliga a trocear el texto por frases, pero el modelo sintetiza cada fragmento de forma determinista y rápida, adecuado para pipelines por lotes.
- Pruebas automatizadas de interfaces de voz: al ser determinista con ruido cero y tener una licencia MIT, se puede usar como generador de audio de referencia en tests de reconocimiento de voz o de sistemas de diálogo.
- Prototipado de asistentes conversacionales en inglés: integrado con un LLM local, proporciona la capa de salida de voz en arquitecturas totalmente offline y de código abierto.
- Accesibilidad en aplicaciones web o de escritorio: lectura de contenido para usuarios con discapacidad visual en entornos donde no se quiere depender de servicios TTS en la nube por privacidad o latencia.
- Investigación en TTS de bajo coste: sirve como línea base reproducible para comparar técnicas de cuantización o de fonemización, dado que el autor publica métricas de WER sobre LibriSpeech.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| Word error rate (Whisper small) | 15,7 % | 30 frases de LibriSpeech, puerta de texto con léxico incluido |
| Word error rate (Whisper small) | 7,7 % | 30 frases de LibriSpeech, G2P original de upstream |
| Word error rate, Q8_0_pc | 11,5 % | 60 síntesis |
| Word error rate, F32 | 11,7 % | 60 síntesis |
| Diferencia de forma de onda F32 vs. original | Hasta 3,0e-5 | Precisión completa |
| Memoria pico en ejecución | 57-58 MB (F32); 1-4 MB menos en Q8_0_pc | Raspberry Pi |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al no ser un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido habitual; el modelo es un TTS de 0,5 M de parámetros y el consumo relevante es memoria RAM. La memoria pico en ejecución es de 57-58 MB en F32, casi toda del runtime, y de 1-4 MB menos en Q8_0_pc.
- GPU recomendadas: cualquier GPU compatible con loom.cpp; el modelo funciona en CPU sin problema. No se especifican modelos concretos de GPU en la documentación.
- Cabe en cualquier GPU de consumo y en placas de un solo board: el autor documenta funcionamiento en Raspberry Pi Zero y Pi 4.
- Opciones de despliegue: `loom-py-rt` (PyPI) con el motor loom.cpp; requiere versión 1.0.0rc18 o superior por la operación `ISTFT`. En Pi Zero o Pi 1-3 con `loom-py-rt` 1.0.0rc20 o anterior hay que definir `GGML_VC4_FUSE=0` o usar `device="cpu"` para evitar un fallo del backend GPU.
- Latencia y throughput: no disponibles de forma numérica; el autor indica que Q8_0_pc corre a la misma velocidad que F32 en Pi Zero y más lento en Pi 4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / limite | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Vocetta2 500K (esta ficha) | 506.174 | 207 fonemas por llamada | Inglés | MIT | GGUF |
| Piper (referencia de TTS embebido) | No disponible en la información | No disponible | Múltiples | MIT | ONNX |
| Coqui TTS (referencia de TTS open source) | No disponible en la información | No disponible | Múltiples | MPL-2.0 | PyTorch |
| Kokoro (referencia de TTS ligero) | No disponible en la información | No disponible | Múltiples | Apache-2.0 | ONNX / PyTorch |

No se dispone de datos verificados de parámetros, contexto ni rendimiento de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no está disponible. La comparación cualitativa se limita a señalar que Vocetta2 500K es un modelo de un solo idioma y una sola voz, mientras que las alternativas citadas suelen ofrecer múltiples voces e idiomas.

## Limitaciones y advertencias

- Solo inglés y una única voz; no soporta otros idiomas ni selección de hablante.
- Límite estricto de 207 símbolos fonémicos por llamada, BOS y EOS incluidos; el texto más largo debe dividirse por frases.
- La puerta de texto integrada no es el front-end original: con el léxico incluido obtiene un 15,7 % de WER frente al 7,7 % del G2P original en la prueba del autor. Para máxima calidad hay que fonemizar externamente y pasar `phonemes=`.
- Sin el léxico de pronunciación, la calidad en inglés empeora notablemente, según advierte el autor.
- El modelo no reproduce el recorte de 2400 tramas (25,6 s) del original; sintetiza todas las tramas que piden las duraciones, lo que puede generar audio más largo de lo esperado en entradas extremas.
- El ruido del decodificador está desactivado por defecto; activarlo con `noise_scale` empeora todas las métricas según las mediciones del autor.
- Requiere `loom-py-rt` 1.0.0rc18 o superior; versiones anteriores fallan con `unknown op 'ISTFT'`.
- En Raspberry Pi Zero y Pi 1-3 con `loom-py-rt` 1.0.0rc20 o anterior hay que aplicar el workaround `GGML_VC4_FUSE=0` o usar CPU para evitar un fallo del backend GPU.
- La licencia MIT permite uso comercial, pero se hereda del modelo base y conviene verificar las condiciones del léxico misaki (Apache-2.0) si se redistribuye.
- Riesgo de alucinación no aplica en el sentido de los LLM, pero sí existe riesgo de pronunciación incorrecta en palabras fuera del léxico o en nombres propios.
- El proyecto se declara trabajo en curso; la API y el comportamiento pueden cambiar entre versiones del runtime.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-ai-org/vocetta2-500k-loom
- Modelo base original: https://huggingface.co/VantoraLabs/Vocetta2-500k
- Repositorio loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Repositorio loom-py: https://github.com/loom-ai-org/loom-py
- Léxico de pronunciación hexgrad/misaki: https://github.com/hexgrad/misaki
- Léxico incluido en el repo: https://huggingface.co/loom-ai-org/vocetta2-500k-loom/resolve/main/lexicons/en_US-misaki.tsv
