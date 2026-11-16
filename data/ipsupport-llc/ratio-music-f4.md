# ipsupport-llc/ratio-music-f4

## Resumen

Ratio Music F4 es un modelo transformer de pequeno tamano desarrollado por IPSupport LLC, orientado a la generacion de musica simbolica. A diferencia de los modelos de sintesis de audio, este modelo no produce sonido: genera partituras completas token a token, incluyendo tempo, forma, pistas e instrumentos, que posteriormente deben ser interpretadas por un sintetizador o sampler. Cubre 13 estilos musicales, entre ellos orquesta, rock, metal, jazz, funk, reggae, bossa nova, house, pop, rap y trap.

El modelo tiene 41,5 millones de parametros, una anchura de 512, 12 capas y 8 cabezas de atencion, con una longitud de contexto de 6144 tokens y un vocabulario de 511 tokens. Su conjunto de entrenamiento es enteramente sintetico: 25.935 partituras generadas por programas propios del autor, equivalentes a 172,3 millones de tokens, sin grabaciones, canciones ni partituras humanas. Se entreno durante 6 epocas en una DGX Spark en aproximadamente dos horas, alcanzando una perdida de 0,073 en entrenamiento y 0,095 en validacion.

La relevancia del modelo radica en su enfoque de bajo coste computacional para generacion musical estructurada: puede producir una pieza completa en aproximadamente medio minuto usando dos hilos de CPU, sin necesidad de GPU. Sin embargo, su codigo de inferencia no es publico y la licencia de los pesos aun no se ha definido, lo que limita su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (12 capas, 512 de anchura, 8 cabezas de atencion) |
| Parametros totales | 41,5 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 6144 tokens |
| Tipos de cuantizacion | No disponible (pesos distribuidos en precision media, `half precision`) |
| Idiomas soportados | No disponible (modelo de musica simbolica, no de lenguaje natural) |
| Licencia | No disponible (no se ha elegido licencia; el autor pide consultar antes de reutilizar) |
| Formato de pesos | PyTorch (`full-e6.pt`, diccionario con `state` en media precision y `ctx`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 12 capas con anchura 512 y 8 cabezas de atencion, con 41,5 millones de parametros. Genera secuencias de tokens que representan una partitura completa: tempo, forma musical, pistas e instrumentos, y cada nota de cada instrumento. El vocabulario consta de 511 tokens definidos en `vocab.json`. La longitud de contexto es de 6144 tokens, suficiente para codificar una pieza completa en una unica secuencia.

El entrenamiento se realizo sobre un corpus completamente sintetico de 25.935 partituras generadas por programas propios del autor, con un total de 172,3 millones de tokens. No se utilizaron grabaciones, canciones ni partituras humanas. Se entrenaron 6 epocas en una unica DGX Spark durante aproximadamente dos horas, con una perdida final de 0,073 en entrenamiento y 0,095 en el conjunto de validacion. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de musica simbolica completa: tempo, forma, pistas e instrumentos, y todas las notas de cada instrumento.
- Cobertura de 13 estilos musicales: orquesta, rock, metal, jazz, funk, reggae, bossa nova, house, pop, rap, trap y otros.
- Generacion token a token de partituras que deben ser reproducidas por un sintetizador o sampler externo.
- Inferencia en CPU: aproximadamente 140 tokens por segundo con dos hilos, lo que permite generar una pieza en torno a medio minuto sin GPU.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multilingues en el sentido de lenguaje natural.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Generacion de musica de fondo para videos: el modelo produce una partitura completa en 13 estilos que puede renderizarse con un sintetizador y usarse como banda sonora en produccion audiovisual, gracias a su bajo coste de inferencia en CPU.
- Radio musical continua: integrado en un pipeline que genere piezas de forma secuencial y las sintetice al vuelo, puede alimentar un flujo de musica ininterrumpida sin dependencia de GPU, como se plantea en el sitio del autor.
- Prototipado rapido de ideas musicales: un compositor puede generar una estructura completa (tempo, forma, instrumentos, notas) en medio minuto y editarla posteriormente en un DAW.
- Estudio musical en el navegador: el modelo puede servir como motor de generacion en una interfaz web que permita al usuario elegir estilo y obtener una partitura editable.
- Generacion de datasets musicales sinteticos: al producir partituras en multiples estilos de forma automatizada, puede emplearse para aumentar corpus de entrenamiento de otros modelos musicales.
- Educacion musical: permite generar ejemplos de estructuras en distintos estilos (jazz, bossa nova, trap) para ilustrar formas, instrumentaciones y patrones ritmicos.
- Experimentacion en investigacion sobre musica simbolica: su tamano reducido y su entrenamiento puramente sintetico lo hacen util para estudiar sesgos y capacidades de modelos entrenados sin datos humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento reportada es la perdida de entrenamiento (0,073) y de validacion (0,095) tras 6 epocas, junto con una velocidad de inferencia de aproximadamente 140 tokens por segundo en dos hilos de CPU.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision media, dado que el modelo tiene 41,5 M de parametros (aproximadamente 83 MB en FP16).
- GPU recomendadas: no requiere GPU; el autor reporta inferencia en CPU a unos 140 tokens por segundo con dos hilos.
- Cabe en cualquier GPU de consumo e incluso en CPU de forma holgada.
- Opciones de despliegue: no disponible. El codigo de inferencia no es publico; solo se distribuyen los pesos en PyTorch (`full-e6.pt`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: aproximadamente 140 tokens por segundo en dos hilos de CPU; una pieza completa en torno a medio minuto.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de musica simbolica con los que contrastar parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse exclusivamente con partituras generadas por programas propios, el modelo puede reproducir los sesgos y limitaciones estilisticas de esos generadores, sin diversidad aportada por musica humana.
- Riesgo de alucinacion: puede generar secuencias musicales incoherentes o estructuras invalidas, especialmente fuera de los estilos y formas representados en el corpus sintetico.
- Limitaciones de contexto: la ventana de 6144 tokens acota la duracion y complejidad de las piezas generadas; piezas mas largas requeriran estrategias de continuacion no documentadas.
- Restricciones de licencia: no se ha elegido licencia para los pesos; el autor solicita consultar antes de reutilizarlos, lo que impide el uso comercial sin autorizacion explicita.
- El codigo de inferencia no es publico, lo que dificulta la reproducibilidad y la integracion en produccion.
- No genera audio: requiere un sintetizador o sampler externo para producir sonido, lo que anade dependencias al pipeline.
- No hay garantias de soporte, mantenimiento ni documentacion adicional mas alla de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ipsupport-llc/ratio-music-f4
- Demo musical: https://ratio.ipsupport.us
- Pagina sobre el proceso de creacion: https://ratio.ipsupport.us/about
