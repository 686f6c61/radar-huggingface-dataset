# Ahmedhodzic/zipformer_p-arabic-v3-web

## Resumen

`Ahmedhodzic/zipformer_p-arabic-v3-web` es una copia sin modificaciones del modelo `Quran-Lab/zipformer_p-arabic-v3` (revision `5a115aa91cf7401213a62c22f3458445687d1701`), un reconocedor de fonemas en streaming para recitacion del Coran en la lectura Hafs 'an 'Asim. Lo publica el usuario Ahmedhodzic con el unico proposito de servir los pesos en formato ONNX int8 directamente desde el navegador en la aplicacion digitalnavaktija.com/mushaf, de modo que la comprobacion de memorizacion se ejecuta en el dispositivo del usuario sin enviar audio a ningun servidor. El autor original del modelo es Muno459 / Quran-Lab.

El modelo tiene 65,5 millones de parametros y se basa en la arquitectura Zipformer2 con una cabeza CTC. En lugar de transcribir a texto arabe convencional, produce una secuencia de simbolos de un alfabeto fonetico coranico de 251 clases que codifica distinciones relevantes para el tajweed: longitud de madd, geminacion, ghunna, ikhfaa, qalqalah y consonantes enfaticas. Esa representacion intermedia es lo que permite comparar la recitacion del usuario con la esperada a nivel fonetico.

Es relevante ahora porque demuestra un patron de despliegue de ASR especializado en el cliente: un modelo pequeno, cuantizado a int8 y empaquetado para sherpa-onnx, que cabe en un repositorio de 0,1 GB y se ejecuta en el navegador. No es un modelo de proposito general ni compite con ASR multilingues: es una herramienta vertical para una tarea concreta, con una licencia que restringe explicitamente el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer2 con cabeza CTC |
| Parametros totales | 65,5 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (reconocedor en streaming; no se especifica ventana) |
| Tipos de cuantizacion | int8 (fichero `zipformer_p_arabic_v3.1.int8.onnx`) |
| Idiomas soportados | arabe (recitacion coranica, Hafs 'an 'Asim) |
| Licencia | Quran-Lab No-Profit License 1.2 (identificador `other`) |
| Formato de pesos | ONNX (int8), con `tokens.txt` y `ordered_quran_phonemes.json` |

## Arquitectura y entrenamiento

El modelo es un reconocedor de fonemas en streaming construido sobre Zipformer2, la evolucion de la familia Zipformer para speech recognition, con una cabeza de Connectionist Temporal Classification (CTC). La salida no es texto: es una secuencia sobre un alfabeto fonetico coranico de 251 simbolos disenado para preservar rasgos que un transcriptor ortografico perderia, como la duracion del madd, la geminacion, la ghunna, el ikhfaa, la qalqalah y las consonantes enfaticas. El reconocimiento en streaming implica que el modelo procesa el audio de forma incremental, lo que encaja con una comprobacion de recitacion en tiempo real en el navegador.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, el uso de aumento de datos o de tecnicas de alineacion forzada, ni sobre si hubo etapas de ajuste fino supervisado adicionales. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal. La unica innovacion descrita en la informacion disponible es la propia representacion de salida: un alfabeto fonetico especifico de tajweed en lugar de caracteres arabes.

## Capacidades

- Reconocimiento automatico de voz especializado en recitacion del Coran (Hafs 'an 'Asim), en modo streaming.
- Transcripcion a un alfabeto fonetico coranico de 251 simbolos con distinciones de tajweed (madd, geminacion, ghunna, ikhfaa, qalqalah, enfaticas).
- Ejecucion en el dispositivo del usuario mediante ONNX Runtime y sherpa-onnx, incluido el navegador.
- Comparacion fonetica entre recitacion y referencia, base de la funcion de comprobacion de memorizacion.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada distinto de voz ni modo de pensamiento.
- Capacidad multilingue: no disponible; el modelo declara unicamente arabe y su dominio es la recitacion coranica.

## Casos de uso

- Comprobacion de memorizacion (hifz) en el navegador: la aplicacion carga el ONNX int8 y compara la recitacion del usuario con la referencia fonetica esperada; al ejecutarse en el dispositivo, el audio no sale del cliente y no requiere backend de inferencia.
- Aplicaciones web sin coste de servidor: al ser un modelo de 65,5 M de parametros cuantizado a int8, el coste de inferencia se traslada al hardware del usuario, lo que hace viable ofrecer la funcion de forma gratuita y sin anuncios, como exige la licencia.
- Herramientas de ensenanza de tajweed: la salida fonetica distingue madd, ghunna, qalqalah o ikhfaa, de modo que la aplicacion puede senalar que regla no se ha aplicado correctamente en un pasaje concreto.
- Revision de recitacion en entornos con conectividad limitada o requisitos de privacidad: al no enviar audio a un servidor, encaja en madrasas o contextos donde el tratamiento de voz fuera del dispositivo no es aceptable.
- Integracion en aplicaciones de escritorio o moviles mediante sherpa-onnx: el mismo paquete ONNX y los ficheros `tokens.txt` y `ordered_quran_phonemes.json` permiten desplegar la inferencia local en otras plataformas compatibles.
- Investigacion sobre ASR fonetico de bajo recurso: el modelo sirve como referencia para estudiar representaciones foneticas especificas de dominio y para comparar estrategias de cuantizacion int8 en modelos pequenos de streaming.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 65,5 M de parametros en int8 el peso de los pesos ronda decenas de megabytes, por lo que la huella de memoria es muy reducida y compatible con ejecucion en CPU.
- GPU recomendadas: no se especifican. Por tamano, el modelo no requiere GPU dedicada; puede ejecutarse en CPU y en el navegador mediante WebAssembly/ONNX Runtime.
- Cabe en GPU de consumo: si, con amplio margen; tambien en CPU y en dispositivos moviles, aunque no se publican mediciones concretas.
- Opciones de despliegue: sherpa-onnx (etiqueta declarada por el autor) y ONNX Runtime en navegador; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo ASR ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zipformer_p-arabic-v3-web (esta copia) | 65,5 M | no disponible | ASR fonetico de recitacion coranica | Quran-Lab NPL 1.2 | ONNX int8, Hugging Face |
| Quran-Lab/zipformer_p-arabic-v3 (original) | 65,5 M | no disponible | ASR fonetico de recitacion coranica | Quran-Lab NPL 1.2 | Hugging Face |
| Otros modelos ASR arabes de proposito general | no disponible | no disponible | Transcripcion a texto | no disponible | no disponible |

La informacion proporcionada no incluye resultados de benchmarks ni especificaciones de modelos alternativos que permitan una comparacion cuantitativa. La unica comparacion documentada es con el repositorio original, del que esta copia es identica salvo por el alojamiento.

## Limitaciones y advertencias

- Licencia no comercial: la Quran-Lab No-Profit License 1.2 prohibe cobrar por el modelo, por el acceso a el o por cualquier funcion que lo utilice, y prohibe colocarlo detras de anuncios; las obras derivadas deben mantenerse bajo la misma licencia.
- Condiciones de uso del modelo original: los resultados no pueden presentarse como un dictamen religioso y la aplicacion debe advertir de que la comprobacion automatica puede equivocarse y no sustituye a un profesor.
- Dominio muy restringido: solo recitacion coranica en la lectura Hafs 'an 'Asim; no es un ASR general de arabe ni admite otros idiomas.
- Salida fonetica, no texto: cualquier integracion requiere logica adicional para alinear y comparar la secuencia de 251 simbolos con la referencia.
- Riesgo de error en la comprobacion: no se documentan tasas de error (WER o PER) ni condiciones acusticas de evaluacion, por lo que no puede estimarse su fiabilidad en entornos ruidosos o con microfonos de baja calidad.
- Sesgos: no se documentan sesgos de genero, dialecto o estilo de recitacion; al entrenarse sobre una lectura concreta, puede penalizar variantes legitimas de recitacion.
- Esta copia concreta esta pensada para uso en navegador; el propio autor remite al repositorio original para cualquier otro uso.
- No se documentan limitaciones de longitud de contexto ni de streaming maximo.

## Enlaces

- Copia en navegador: https://huggingface.co/Ahmedhodzic/zipformer_p-arabic-v3-web
- Modelo original: https://huggingface.co/Quran-Lab/zipformer_p-arabic-v3
- Aplicacion que lo utiliza: https://www.digitalnavaktija.com/mushaf
- Licencia: fichero `LICENSE` del repositorio (Quran-Lab No-Profit License 1.2)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
