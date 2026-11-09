# ClovisAtlas/Athena1.0

## Resumen

Athena1.0 es un modelo de lenguaje causal experimental de 4.871.168 parametros, desarrollado por ClovisAtlas y entrenado desde inicializacion aleatoria en PyTorch sobre dialogos extraidos de las obras completas de William Shakespeare. No emplea ningun modelo preentrenado ni tokenizador aprendido: la tokenizacion mapea directamente bytes UTF-8 a IDs 0-255, con cuatro tokens especiales adicionales (PAD, BOS, EOS y TURN), lo que da un vocabulario total de 260 tokens.

El objetivo declarado del autor es explorar el aprendizaje de turnos conversacionales a partir de un corpus pequeno y preparado artesanalmente. La release publicada corresponde al checkpoint de 3.250 pasos de optimizacion. Con 6 capas, anchura oculta de 256, 8 cabezas de atencion y una ventana de contexto de 256 tokens (bytes, no palabras), el modelo se situa en la categoria de prototipo de investigacion, muy lejos de un asistente conversacional utilizable.

Su relevancia es principalmente didactica: documenta de forma transparente el pipeline completo (preparacion de datos, splitting por escenas con semilla fija, hiperparametros, evaluacion muestreada) y sirve como ejemplo reproducible de entrenamiento from scratch en un notebook de Google Colab. No esta pensado para produccion ni para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (implementacion custom en PyTorch) |
| Parametros totales | 4.871.168 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (bytes UTF-8, no palabras) |
| Tipos de cuantizacion | no disponible (entrenamiento e inferencia en float32; no se documentan cuantizaciones) |
| Idiomas soportados | Ingles (corpus Shakespeare) |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch custom (`model.pt`), no compatible con `AutoModelForCausalLM` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atencion causal, 6 capas, anchura oculta de 256, 8 cabezas de atencion y anchura feed-forward de 1.024. Usa pre-norm con LayerNorm final, activacion GELU, dropout de 0,1 durante entrenamiento y embeddings posicionales absolutos aprendidos. Los embeddings de entrada y salida comparten pesos (tied weights). La tokenizacion es a nivel de byte: cada byte UTF-8 es un token, con IDs especiales PAD=256, BOS=257, EOS=258 y TURN=259.

El corpus de entrenamiento procede de *The Complete Works of William Shakespeare* (Project Gutenberg ebook #100, en PDF) y contiene 31.348 turnos de hablante en 753 secuencias de 38 obras. El preprocesado elimino acotaciones escenicas detectadas en 4.813 turnos, excluyo prologos, epilogos, coros y obras no dialogadas, y puso en cuarentena nueve turnos ambiguos. El split se hizo de forma determinista por grupos de escena con semilla 42: 598 grupos de entrenamiento, 74 de validacion y 74 de test (aproximadamente 80/10/10 por escena, no por tokens; no se reservan obras completas). El entrenamiento usa objetivo de entropia cruzada next-token ignorando padding, optimizador AdamW (lr 0,0003, weight decay 0,01, clipping de norma 1,0), batch de 16, longitud de secuencia 256, ventanas aleatorias ponderadas por longitud de secuencia y precision float32 sin mixed precision. El checkpoint publicado corresponde a 3.250 actualizaciones del optimizador; el estado del optimizador se omite en la release de inferencia. No se registro el modelo de GPU ni la duracion total del entrenamiento.

## Capacidades

- Generacion de texto autoregresiva a nivel de byte en ingles, con patrones reconocibles de estilo shakespeariano.
- Modelado de turnos conversacionales mediante el token TURN, que aprende fronteras de intervencion entre hablantes.
- Continuacion de texto condicionada por un prompt corto (maximo 256 bytes de contexto).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo thinking, vision, audio ni capacidades multimodales.
- Multilingue: no; el unico idioma documentado es el ingles.
- No asigna identidades persistentes de usuario/asistente; solo modela continuacion y limites de turno.

## Casos de uso

- Docencia sobre entrenamiento from scratch: el repositorio incluye codigo, hiperparametros y dataset con hash SHA-256, lo que permite reproducir el pipeline completo en un notebook de Colab y estudiar cada etapa del entrenamiento de un transformer causal.
- Experimentos de tokenizacion a nivel de byte: sirve para comparar el comportamiento de un vocabulario de 260 tokens frente a tokenizadores BPE en corpus pequenos, observando el impacto en perplejidad y calidad de generacion.
- Investigacion sobre modelado de turnos: el uso del token TURN y la separacion de dialogos por escenas permiten estudiar como un modelo diminuto aprende fronteras conversacionales sin identidades de rol.
- Generacion creativa de estilo: puede producir fragmentos breves con sabor isabelino para demos o ejercicios de escritura, siempre con revision humana dado su caracter repetitivo.
- Pruebas de infraestructura de inferencia: al ejecutarse en CPU con PyTorch estandar, es util para validar scripts de carga de checkpoints custom, pipelines de evaluacion y herramientas de logging en entornos sin GPU.
- Baseline de referencia en experimentos academicos: su evaluacion muestreada (loss, perplejidad por byte-token y accuracy next-token) proporciona un punto de comparacion reproducible para modelos de escala similar entrenados con los mismos datos.
- Prototipado de interfaces de chat minimalistas: el comando `chat` con `/reset` y `/quit` sirve para probar bucles de conversacion y manejo de contexto en aplicaciones de demostracion.

## Benchmarks y rendimiento

Evaluacion sobre las mismas 128 ventanas muestreadas de 256 tokens de escenas de test reservadas (32.768 tokens objetivo, semilla 991, entropia cruzada ponderada por token):

| Checkpoint | Test loss (nats/token) | Perplejidad byte-token | Accuracy next-token |
|---|---:|---:|---:|
| 250 pasos | 2,4059 | 11,0889 | 29,53% |
| 3.250 pasos | 1,4584 | 4,2992 | 55,00% |

La loss de test disminuyo aproximadamente un 39,4% entre ambos checkpoints. Estas metricas miden prediccion de bytes/tokens, no exactitud factual ni porcentaje de preguntas respondidas correctamente. No se ha completado ningun benchmark conversacional ni estudio de preferencia humana.

Ejemplos de generacion con temperatura 0,8, top-k 40, semilla 123 y maximo de 160 bytes generados (checkpoint de 3.250 pasos):

| Prompt | Respuesta |
|---|---|
| Hello, how are you? | But there? |
| What is your name? | But there? |
| Why are you sad? | By you. |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32 (4,87 M de parametros); el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU; cualquier GPU con CUDA disponible acelera la inferencia, desde una GTX 1050 hasta una H100.
- Cabe en GPU consumer: si, en todas las gamas actuales; tambien se ejecuta en CPU segun documenta el autor.
- Opciones de despliegue: unicamente el codigo incluido en el repositorio (`athena.py chat --checkpoint model.pt`) con PyTorch. No hay soporte para vLLM, llama.cpp, Ollama, TGI ni inferencia alojada en Hugging Face, al no ser un paquete `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Athena1.0 | 4,87 M | 256 tokens (bytes) | no disponible | Checkpoint PyTorch custom | Hugging Face, 0 descargas |
| GPT-2 small (referencia) | 124 M | 1.024 tokens | MIT | safetensors, compatible Transformers | Ampliamente disponible |
| TinyStories-1M (referencia) | ~1 M | 512 tokens | MIT | safetensors, compatible Transformers | Hugging Face |
| SmolLM-135M (referencia) | 135 M | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face, vLLM, llama.cpp |

Los modelos de referencia citados son alternativas de escala similar o de prototipo; no se dispone de resultados de benchmarks comparativos directos con Athena1.0 en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad conversacional muy limitada: el propio autor indica que las respuestas son cortas, repetitivas y a menudo no relacionadas con el prompt.
- Riesgo elevado de alucinacion y de texto incoherente; no debe usarse para responder preguntas factuales.
- Contexto de solo 256 bytes: los caracteres multibyte consumen varios tokens, lo que reduce aun mas el contexto efectivo en textos no ASCII.
- Entrenado exclusivamente en ingles shakespeariano; no generaliza a otros idiomas ni a registro moderno.
- No asigna identidades persistentes de usuario/asistente, lo que limita su uso como chatbot convencional.
- Licencia no disponible: no se puede confirmar el permiso de uso comercial; se recomienda tratar la release como no apta para produccion hasta que el autor la aclare.
- Evaluacion limitada a metricas de prediccion de tokens sobre una muestra de 128 ventanas; no hay benchmarks conversacionales ni estudios de preferencia humana.
- El checkpoint no incluye estado del optimizador; para reanudar el entrenamiento hay que usar el ZIP de respaldo original.
- La inferencia alojada en Hugging Face no esta configurada; requiere ejecutar el codigo incluido.
- Posibles sesgos derivados del corpus: el material isabelino contiene roles de genero, clase y autoridad propios de la epoca.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ClovisAtlas/Athena1.0
- Corpus fuente: *The Complete Works of William Shakespeare*, Project Gutenberg ebook #100 (https://www.gutenberg.org/ebooks/100)
- Repositorio del modelo: incluye `athena.py`, `requirements.txt`, `model.pt` y `comparison_results.json` (disponibles en la pagina de Hugging Face del modelo)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
