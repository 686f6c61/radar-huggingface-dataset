# ampixa/ratna-asr

## Resumen

Ratna es un modelo de reconocimiento automático del habla (ASR) en nepalí desarrollado por Ampixa Labs, diseñado específicamente para decodificación en streaming sobre CPU. Se distribuye como un paquete ONNX cuantizado a int8 de 35,10 MB con 31.963.576 parámetros, lo que permite ejecutarlo en un solo hilo de CPU o directamente en el navegador mediante WebAssembly. Es una publicación de investigación orientada a escenarios de baja latencia y recursos limitados, no a transcripción de alta precisión.

El modelo emplea una arquitectura transducer con un encoder Zipformer2 causal, un predictor sin estado y un joiner que emite tokens BPE mediante búsqueda greedy. Procesa audio de 16 kHz convertido en un filterbank log-mel de 80 dimensiones cada 10 ms, reducido a 50 tramas por segundo, con seis stacks que operan a 50, 25, 12,5, 6,25, 12,5 y 25 Hz. Lee fragmentos de 320 ms con 2,56 s de contexto izquierdo y sin look-ahead, lo que lo hace apto para reconocimiento en tiempo real.

Su relevancia radica en la combinación de tamaño reducido, licencia propia y despliegue ubicuo (CPU, WebAssembly), algo poco habitual en ASR para idiomas de bajos recursos como el nepalí. Sin embargo, sus tasas de error son elevadas (CER del 16,33 % en habla leída y del 28,03 % en FLEURS) y el propio autor lo califica como una versión de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transducer con encoder Zipformer2 causal |
| Parámetros totales | 31.963.576 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2,56 s de contexto izquierdo; fragmentos de 320 ms; sin look-ahead |
| Tipos de cuantización | int8 (ONNX) |
| Idiomas soportados | nepalí (ne) |
| Licencia | ratna-model-terms (licencia propia, ver LICENSE-MODEL.md) |
| Formato de pesos | ONNX (encoder, decoder y joiner); bundle WebAssembly para sherpa-onnx |

## Arquitectura y entrenamiento

Ratna sigue el esquema transducer clásico: un encoder Zipformer2 causal transforma las características acústicas, un predictor sin estado genera representaciones de tokens y un joiner combina ambas para producir la distribución sobre el vocabulario de 2.048 tokens BPE. El frontend convierte audio mono a 16 kHz en un filterbank log-mel de 80 dimensiones cada 10 ms; una capa Conv2d reduce la secuencia a 50 tramas por segundo antes de entrar en el encoder, cuyos seis stacks operan con tasas de muestreo decrecientes y crecientes (50, 25, 12,5, 6,25, 12,5 y 25 Hz). La decodificación es greedy search sobre fragmentos de 320 ms con 2,56 s de contexto izquierdo y sin look-ahead, lo que garantiza causalidad estricta.

El autor indica que el entrenamiento se realizó con voz pública y sintética, incluyendo etiquetas generadas automáticamente, y no con audio real de llamadas. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo se empaqueta en tres ficheros ONNX int8 (encoder de 32,67 MB, decoder de 1,33 MB y joiner de 1,06 MB) y en un bundle WebAssembly de dos ficheros de datos (18,00 MB y 17,10 MB) para el runtime sherpa-onnx.

## Capacidades

- Reconocimiento de voz en streaming en nepalí con latencia de fragmento de 320 ms.
- Decodificación causal sin look-ahead, apta para aplicaciones en tiempo real.
- Ejecución en un solo hilo de CPU (factor de tiempo real de 0,0273 en un Apple M2 Ultra).
- Ejecución en navegador mediante WebAssembly con el runtime sherpa-onnx.
- Salida de transcripciones en tokens BPE (vocabulario de 2.048 tokens).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio más allá del reconocimiento.
- Multilingüismo limitado exclusivamente al nepalí.

## Casos de uso

- Subtitulado en directo de contenido en nepalí: el modelo procesa fragmentos de 320 ms con causalidad estricta, lo que permite generar subtítulos con un retardo mínimo en retransmisiones o vídeos, siempre que se acepte su tasa de error.
- Dictado en el navegador: al ejecutarse vía WebAssembly en sherpa-onnx, puede integrarse en aplicaciones web de dictado sin enviar audio a un servidor, útil para privacidad y para usuarios con conectividad limitada.
- Asistentes de voz embebidos en dispositivos de bajos recursos: con 35,10 MB en int8 y 205 MiB de pico de memoria, cabe en sistemas con poca RAM y CPU modesta, como Raspberry Pi o móviles de gama baja.
- Transcripción de notas de voz en aplicaciones móviles: el bajo coste computacional (un hilo de CPU) permite transcribir grabaciones cortas en segundo plano sin agotar la batería.
- Prototipado e investigación en ASR para nepalí: sirve como línea base reproducible y de código abierto para experimentos con Zipformer2 y decodificación en streaming en un idioma de bajos recursos.
- Indexación y búsqueda de audio en archivos: para grandes volúmenes de grabaciones en nepalí donde se prioriza cobertura y velocidad sobre precisión exacta, el modelo puede generar transcripciones aproximadas que alimenten un índice de búsqueda.
- Filtrado y enrutamiento de llamadas: puede detectar palabras clave o intenciones generales en audio telefónico, aunque el propio autor advierte que no es fiable para números de teléfono ni datos exactos (WER del 67,32 % en NepTel 0.2).

## Benchmarks y rendimiento

| Prueba | CER % | WER % |
|---|---:|---:|
| PV read speech, 100 frases | 16,33 | 39,26 |
| Fresh read speech | 27,15 | 48,91 |
| FLEURS | 28,03 | 55,94 |
| NepTel 0.2 (audio telefónico) | no disponible | 67,32 |

Factor de tiempo real: 0,0273 en un hilo de un Apple M2 Ultra, con un pico de 205 MiB de memoria.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo está pensado para CPU (35,10 MB en int8).
- GPU recomendadas: no disponibles; no se documenta soporte GPU.
- Cabe en cualquier GPU de consumo, pero no es el objetivo de despliegue.
- CPU: un solo hilo es suficiente; el autor reporta RTF de 0,0273 en un Apple M2 Ultra.
- Memoria: pico de 205 MiB.
- Opciones de despliegue: sherpa-onnx (Python y WebAssembly), con los ficheros ONNX y tokens.txt.
- Latencia y throughput: fragmentos de 320 ms con 2,56 s de contexto izquierdo; el RTF de 0,0273 implica un throughput muy superior al tiempo real en el hardware citado.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos sobre modelos comparables de ASR en nepalí con arquitectura y tamaño similares, por lo que la comparativa se limita a los datos del propio modelo.

| Modelo | Parámetros | Contexto | Licencia | Formato | Idiomas |
|---|---|---|---|---|---|
| Ratna (Ampixa Labs) | 31,96 M | 2,56 s de contexto izquierdo | ratna-model-terms | ONNX int8 | nepalí |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Tasas de error elevadas: CER del 16,33 % en habla leída y del 28,03 % en FLEURS; WER del 67,32 % en audio telefónico de NepTel 0.2.
- No captura números de teléfono exactos; el autor desaconseja explícitamente su uso para esa tarea.
- Entrenado con voz pública y sintética, incluyendo etiquetas generadas automáticamente, y no con audio real de llamadas, lo que explica su degradación en dominios telefónicos.
- Riesgo de alucinación y errores de sustitución en vocabulario fuera del dominio de entrenamiento.
- Sesgos potenciales derivados de la composición del dataset, no documentada en detalle.
- Limitado exclusivamente al nepalí; no soporta otros idiomas.
- Licencia propia (ratna-model-terms) con obligación de atribución: si se usa o se construye sobre el modelo, debe nombrarse como Ratna (Ampixa Labs) en la model card o documentación. Es necesario revisar LICENSE-MODEL.md para confirmar las condiciones de uso comercial.
- Publicación de investigación: no recomendado para producción sin validación adicional en el dominio objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/ampixa/ratna-asr
- Licencia del modelo: https://huggingface.co/ampixa/ratna-asr/blob/main/LICENSE-MODEL.md
- Demo: https://ampixa.com/ratna/
- Informe técnico (blog de Ampixa): https://ampixa.com/blog/ratna-small-streaming-nepali-speech-recognition-on-a-cpu/
