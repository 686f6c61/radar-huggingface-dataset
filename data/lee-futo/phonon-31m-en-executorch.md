# lee-futo/phonon-31m-en-executorch

## Resumen

Phonon S (31M) para ExecuTorch es un export del modelo de síntesis de voz gradium/phonon-31m-en, junto con su decodificador de audio gradium/phonon-mimi, empaquetado en el formato `.pte` de ExecuTorch 1.5.1 con el backend de CPU XNNPACK. Lo publica el usuario lee-futo, no el autor original del modelo, y su tarjeta se limita a documentar el proceso de exportación: la información sobre arquitectura y entrenamiento remite a la model card de Gradium. El modelo base se exporta en dos variantes, fp32 (190 MB) e int8 dinámico con GPTQ (112 MB), más el tokenizador y los 37 ficheros de voz de gradium/phonon-voices.

El interés práctico está en que convierte un TTS de 31M de parámetros en un programa ejecutable en CPU sin dependencias de Python ni de GPU: cinco métodos (`embed_prompt`, `embed_latent`, `forward`, `flow`, `decode`) con estado interno, pensados para despliegue en móvil, navegador o dispositivos embebidos. El modelo solo habla inglés, procesa texto en fragmentos de hasta 50 tokens y genera audio a 24 kHz en tramas de 80 ms (1920 muestras por trama), con una caché de 1024 posiciones.

Los datos publicados por el autor del export son verificables y concretos: en 40 frases inglesas reservadas, el WER de ida y vuelta (TTS más reconocedor asr4all-m) es del 2,34 % en fp32 y del 1,91 % en int8, y el coste por trama de 80 ms en 4 hilos de un i9-12900K baja de 4,1 ms a 2,4 ms, con un factor de tiempo real de 0,07 y primer audio unos 30 ms después del texto. Es relevante ahora porque demuestra que un TTS neuronal pequeño puede correr holgadamente por debajo del tiempo real en CPU convencional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS neural: transformador autorregresivo de tramas con cabecera flow (difusión/flow matching sobre latentes de 32 dimensiones) y decodificador de códec Mimi; exportado a ExecuTorch con backend XNNPACK |
| Parámetros totales | 31M (modelo base phonon-31m-en; el decodificador Mimi se distribuye aparte y su recuento no está disponible) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Caché de 1024 posiciones, prompt incluido; máximo de 50 tokens de texto por fragmento (`get_max_text_tokens`), con troceado tipo `split_text` |
| Tipos de cuantización | int8 dinámico por canal con GPTQ en las capas lineales del transformador y de la cabecera flow (resto fp32, Mimi en fp32); variante fp32 completa |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pte` de ExecuTorch (XNNPACK); `tokenizer.json`; voces en `.bin` float32 little-endian con forma `[frames, 512]` (125 tramas por voz) |

Otros parámetros del programa exportado: frecuencia de muestreo 24 kHz (`get_sample_rate`), 1920 muestras por trama (`get_samples_per_frame`), dimensión de latente 32 (`get_latent_dim`), 37 voces inglesas incluidas.

## Arquitectura y entrenamiento

El modelo base es un TTS autorregresivo por tramas: un transformador consume los embeddings de prompt (IDs de texto más las 125 tramas de voz, de 512 dimensiones) y produce un estado oculto de 512 dimensiones; una cabecera flow transforma ese estado, junto con ruido gaussiano escalado por `get_temperature`, en un latente de 32 dimensiones; finalmente el decodificador Mimi convierte la secuencia de latentes en onda de audio a 24 kHz. La generación se detiene con lógica de EOS: la primera detección por encima de `get_eos_threshold` inicia una cuenta atrás de `get_frames_after_eos` tramas (o `get_frames_after_eos_short_text` para textos de hasta `get_short_text_max_words` palabras), y la trama en la que la cuenta llega a cero es la última que se conserva. En esta ficha no se dispone de datos sobre el corpus de entrenamiento, el número de tokens, ni sobre si hubo RLHF o DPO en el modelo original.

El trabajo técnico documentado corresponde al export, no al entrenamiento. Se reescriben operaciones para que XNNPACK las acepte manteniendo equivalencia numérica: el padding de las convoluciones de Mimi se calcula en enteros (el `ceil` en coma flotante de origen no se puede bajar), la atención se implementa como dos multiplicaciones matriciales 3D para ambos transformadores (la descomposición de SDPA de torch escala y copia la caché estática completa en cada trama), la caché KV se escribe in-place mediante el pase `reinplace` de ExecuTorch, y ELU se reconstruye con operaciones admitidas por XNNPACK (su configuración de particionado propia está desactivada en la versión 1.5). Además se añade decodificación en streaming completa: las convoluciones causales de Mimi conservan su contexto izquierdo, las convoluciones transpuestas su solapamiento y el transformador del decodificador una ventana de clave/valor de 250 posiciones como búferes, mientras que el modelo original solo hacía streaming en el codificador. La cuantización int8 usa pesos por canal redondeados con GPTQ, calibrado sobre 99 frases inglesas (`export/calib_en.txt`); los scripts de export están incluidos en el repositorio.

## Capacidades

- Síntesis de voz en inglés a 24 kHz a partir de texto, con 37 voces predefinidas y sin necesidad de referencia de audio en tiempo de ejecución.
- Generación por tramas de 80 ms con estado interno, lo que permite reproducir audio mientras se sigue generando.
- Decodificación en streaming troceable: decodificar una frase en varios bloques produce el mismo audio que decodificarla entera, y la trama 0 reinicia el decodificador.
- Troceado automático de textos largos: cualquier entrada de más de 50 tokens se parte y cada pieza se locuta por separado.
- Control de duración mediante umbral de EOS y cuentas atrás específicas para textos cortos.
- Inferencia en CPU pura mediante XNNPACK, sin GPU, dentro del runtime ExecuTorch 1.5.1.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni otras modalidades: es exclusivamente text-to-speech.

## Casos de uso

- Lectura por voz en aplicaciones móviles sin conexión: el `.pte` int8 ocupa 112 MB y corre en CPU, de modo que puede incluirse en el binario de una app iOS o Android y funcionar sin red ni coste por petición.
- Accesibilidad y lectores de pantalla: con primer audio en torno a 30 ms tras el texto y RTF de 0,07, la latencia percibida es compatible con lectura guiada de interfaces y documentos.
- Dispositivos embebidos y domótica: el tamaño reducido y la dependencia exclusiva de XNNPACK permiten ejecutarlo en placas tipo Raspberry Pi o hardware con CPU ARM para avisos hablados.
- Sistemas de telefonía e IVR: la generación por tramas y el troceado a 50 tokens encajan con la locución de mensajes cortos encadenados en flujos de atención telefónica.
- Narración de contenido formativo o editorial en inglés: el modelo produce audio directamente desde texto, apto para prototipos de audiolibros, cursos o notas de prensa con una de las 37 voces.
- Voces para personajes en juegos y prototipos de interacción: al poder elegir entre 37 voces y controlar temperatura y duración, sirve para poblar escenas con locuciones cortas sin servicio externo.
- Prototipado de pipelines de doblaje o verificación de texto a voz en CI: el script de export incluye comprobaciones automáticas contra PyTorch eager, y el formato `.pte` se puede integrar en pruebas de regresión de audio.
- Aplicaciones con requisitos de privacidad: al ejecutarse en local, el texto del usuario no sale del dispositivo, algo relevante en entornos sanitarios o legales.

## Benchmarks y rendimiento

El autor publica WER de ida y vuelta (TTS más reconocedor asr4all-m, por lo que mide el sistema completo) sobre 40 frases inglesas reservadas, 3 semillas por frase:

| Variante | WER |
|---|---|
| PyTorch eager | 2,34 % |
| `xnnpack_fp32` | 2,34 % |
| `xnnpack_int8` | 1,91 % |

Comprobaciones de equivalencia numérica frente a PyTorch eager:

| Variante | Resultado |
|---|---|
| `xnnpack_fp32` | Coincidencia dentro de 3e-6 en cada paso; una generación libre con semilla fija produce las mismas tramas |
| `xnnpack_int8` | Error con teacher forcing del 2,7 % en el estado oculto y del 1,9 % en la salida del flow, medido sobre 20 frases reservadas; la decodificación no cambia porque Mimi sigue en fp32 |

Velocidad por trama de audio de 80 ms, en 4 hilos de un Intel i9-12900K:

| Variante | Transformador + flow | Factor de tiempo real | Primer audio |
|---|---|---|---|
| `xnnpack_fp32` | 4,1 ms | 0,091 | No disponible |
| `xnnpack_int8` | 2,4 ms | 0,07 | ~30 ms tras el texto |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ni son aplicables a un modelo de síntesis de voz.

## Requisitos de hardware

- Inferencia exclusivamente en CPU mediante XNNPACK: no requiere VRAM ni GPU; el dato de VRAM no aplica.
- Huella de memoria en disco: 112 MB para `xnnpack_int8/phonon.pte`, 190 MB para `xnnpack_fp32/phonon.pte`, más 9 MB de las 37 voces y el `tokenizer.json`; el repositorio completo ocupa 0,3 GB.
- Cabe en cualquier GPU de consumo y, sobre todo, en hardware sin GPU: móviles, SBC y CPUs de portátil. No se han publicado requisitos mínimos de memoria RAM en ejecución.
- Runtime: ExecuTorch 1.5.1 con delegación XNNPACK; `ops.txt` enumera los kernels portables necesarios para una build selectiva (imprescindible para reducir el tamaño del binario en móvil).
- No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI: el formato `.pte` requiere el runtime de ExecuTorch y una implementación propia del bucle de cinco métodos.
- Rendimiento medido: 2,4 ms por trama de 80 ms en int8 (RTF 0,07) y 4,1 ms en fp32 (RTF 0,091) sobre 4 hilos de i9-12900K; el throughput escala con los hilos del backend XNNPACK, aunque no se publican curvas por número de hilos.
- Latencia de primer audio: aproximadamente 30 ms después de procesar el texto en la variante int8.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Formato y runtime | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| lee-futo/phonon-31m-en-executorch (int8) | 31M | 50 tokens de texto por fragmento; caché de 1024 posiciones | `.pte`, ExecuTorch + XNNPACK | Apache-2.0 | WER ida y vuelta 1,91 %; RTF 0,07 en CPU |
| lee-futo/phonon-31m-en-executorch (fp32) | 31M | Igual | `.pte`, ExecuTorch + XNNPACK | Apache-2.0 | WER ida y vuelta 2,34 %; RTF 0,091 en CPU |
| gradium/phonon-31m-en (original) | 31M | Igual | Pesos PyTorch (no disponible el detalle exacto) | Apache-2.0 | WER ida y vuelta 2,34 % en eager |
| Otros TTS pequeños de código abierto (por ejemplo Piper o Kokoro) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

La comparación relevante que sí está documentada es la del export frente a su modelo base en PyTorch: misma calidad en fp32, ligera mejora aparente en int8 (1,91 % frente a 2,34 %, dentro de la variabilidad de 40 frases y 3 semillas) y ejecución sin Python. No se dispone de datos verificables de otros TTS para una comparación cruzada rigurosa.

## Limitaciones y advertencias

- Solo inglés: no hay soporte multilingüe ni de otros idiomas en el export.
- Textos de más de 50 tokens se parten y cada fragmento se locuta por separado, lo que puede introducir pausas o prosodia entrecortada en párrafos largos.
- Solo 37 voces predefinidas; no se documenta clonación de voz a partir de audio de referencia.
- Es un modelo text-to-speech: no transcribe, no entiende audio y no realiza razonamiento, tool calling ni tareas de agente.
- Riesgo de mala pronunciación, omisiones o lectura errónea de números, siglas y nombres propios; el WER publicado es de ida y vuelta y sobre frases reservadas, no una garantía para dominios especializados.
- La cuantización int8 se calibró con solo 99 frases inglesas, por lo que el comportamiento fuera de ese dominio (textos técnicos, nombres extranjeros) no está caracterizado.
- El WER del 1,91 % en int8 mezcla errores del TTS y del reconocedor asr4all-m; una mejora aparente frente a fp32 puede ser ruido de medición, no una ganancia real de calidad.
- El export no está validado por la comunidad: 0 descargas y 0 likes en el momento de la consulta, y el autor del repositorio no es el desarrollador del modelo base.
- La integración exige implementar manualmente el bucle de cinco métodos, la construcción del prompt con `get_audio_prompt_token_id` y `get_audio_bos_token_id` y la lógica de cuenta atrás de EOS; no hay API de alto nivel.
- En la variante int8 el decodificador Mimi permanece en fp32, de modo que el ahorro de memoria afecta solo al transformador y a la cabecera flow.
- La licencia Apache-2.0 permite uso comercial, pero obliga a conservar avisos de copyright y el fichero `LICENSE`, y a indicar cambios; los pesos y voces proceden de Gradium y deben mantenerse las atribuciones.
- No se documentan sesgos de género, acento o habla más allá de la colección de voces, pero al ser un modelo entrenado solo en inglés, la representación de acentos no ingleses es una incógnita.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lee-futo/phonon-31m-en-executorch
- Modelo base: https://huggingface.co/gradium/phonon-31m-en
- Decodificador: https://huggingface.co/gradium/phonon-mimi
- Voces: https://huggingface.co/gradium/phonon-voices
- Resultados de la búsqueda web: no se ha encontrado ningún enlace técnico relevante (los resultados devueltos corresponden a una marca de ropa y no se han utilizado).
