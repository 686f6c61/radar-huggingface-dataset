# paperweight/tinynext

## Resumen

tinynext es un modelo de autocompletado de texto de tamano muy reducido desarrollado por el usuario paperweight, orientado especificamente a la escritura de correos electronicos y texto general dentro del navegador. La version v2, que es la activa en la aplicacion offlinepage.app, es un transformer de aproximadamente 12,5 millones de parametros que predice piezas de palabra (word pieces) en lugar de caracteres, lo que le permite sugerir palabras completas en un solo paso. El modelo lee hasta unos 1.500 caracteres de contexto previo a la posicion del cursor y, cuando existe, tambien texto posterior, lo que habilita capacidades de fill-in-the-middle.

El modelo resuelve el problema del autocompletado de baja latencia en entornos sin conexion: se ejecuta integramente en el navegador mediante ONNX Runtime Web dentro de un Web Worker, con un peso de aproximadamente 0,98 MB y un tiempo de respuesta de unos 4 ms. Su entrenamiento tuvo un coste declarado de 0,35 dolares, lo que lo situa en la categoria de modelos experimentales de eficiencia extrema.

La relevancia actual de tinynext radica en su propuesta de diseno: demostrar que un modelo de 12,5M de parametros, entrenado con 3B de tokens y tecnica de fill-in-the-middle, puede ofrecer sugerencias utiles (hasta un 8,8% de ahorro de tecleo en mensajes de OpenAssistant) sin salir del dispositivo del usuario, compitiendo en eficiencia con modelos cien veces mayores como SmolLM2-135M, que actua como techo de referencia en las evaluaciones del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (v2); GRU/transformer para v1 (modelo de caracteres) |
| Parametros totales | 12,5M (v2); 944K (v1) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta ~1.500 caracteres antes del cursor, mas texto posterior si existe |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | ONNX y safetensors |
| Tamano del repositorio | 0,4 GB |
| Tamano del modelo (v2) | ~0,98 MB |
| Latencia declarada | ~4 ms |
| Coste de entrenamiento | 0,35 USD (declarado) |

## Arquitectura y entrenamiento

La version v2 es un transformer de 12,5 millones de parametros que opera sobre piezas de palabra (word pieces), a diferencia de la v1, que era un modelo de caracteres de 944K parametros y generaba sugerencias letra a letra. El modelo se entreno con 3B de tokens, el doble que la primera iteracion de v2 (1,5B), y utiliza fill-in-the-middle en la mitad de los ejemplos de entrenamiento, lo que le permite aprovechar el texto posterior al cursor cuando existe. Los datasets declarados incluyen corbt/enron-emails, HuggingFaceFW/fineweb-edu y HuggingFaceTB/smoltalk.

El autor documenta un experimento controlado sobre el uso de fill-in-the-middle: con 1,5B de tokens, la tecnica penalizaba el rendimiento en tecleo (la mitad del entrenamiento se dedicaba a una tarea que el modelo rara vez usa en produccion); con 3B de tokens, el coste desaparece en tecleo y aporta mejoras en edicion. La perdida de validacion de la version final es 2,89, frente a 2,99 de la primera v2 y 2,94 de la variante sin FIM. El modelo se distribuye principalmente en formato ONNX para su ejecucion con onnxruntime-web en el navegador, con soporte de safetensors.

## Capacidades

- Generacion de texto para autocompletado: predice las siguientes piezas de palabra, permitiendo sugerencias de palabras completas en un solo paso.
- Fill-in-the-middle: puede utilizar texto posterior al cursor para completar huecos en la edicion.
- Contexto de hasta aproximadamente 1.500 caracteres antes del cursor.
- Ejecucion en navegador mediante ONNX Runtime Web, dentro de un Web Worker, con funcionamiento offline.
- Latencia muy baja (~4 ms declarados), adecuada para sugerencias en tiempo real mientras se escribe.
- Especializacion en correo electronico (entrenado con Enron emails) y texto general (fineweb-edu, smoltalk).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Autocompletado en clientes de correo web: el modelo sugiere las siguientes palabras mientras el usuario redacta un correo, aprovechando su entrenamiento con Enron emails y su contexto de ~1.500 caracteres para mantener coherencia con el hilo de la conversacion.
- Edicion de texto asistida en el navegador: gracias al fill-in-the-middle, puede completar frases cuando el usuario inserta texto en medio de un parrafo ya escrito, usando el texto posterior como contexto.
- Aplicaciones de escritura offline: integrado en una pagina web que funciona sin conexion (offlinepage.app), el modelo se ejecuta en el dispositivo sin enviar datos a servidores externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Procesamiento de texto en dispositivos de bajos recursos: con menos de 1 MB de peso, puede desplegarse en navegadores de moviles o equipos modestos donde modelos mayores no caben.
- Prototipado rapido de interfaces de autocompletado: su formato ONNX y su baja latencia permiten integrarlo en demos y experimentos de UX de escritura sin infraestructura de servidor.
- Generacion de sugerencias en editores de texto colaborativos: el modelo puede ejecutarse localmente en cada cliente, reduciendo la dependencia de backend y la latencia de red en la sugerencia de texto.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) en la tarea de autocompletado con pausa cada 12 caracteres y corte al 50%, sugerencias de 4+ caracteres. Metrica "typing saved" = porcentaje de tecleo ahorrado; "suggestion precision" = porcentaje de sugerencias correctas.

| Texto de evaluacion | v1 | v2 | SmolLM2-135M (techo, ~100 MB) |
|---|---|---|---|
| Articulos (Wikipedia, held out) | 1,5% | 3,9% | 8,1% |
| Mensajes (OpenAssistant) | 2,0% | 8,8% | 16,8% |
| Email (Enron, remitentes no vistos) | 3,0% | 4,0% | 5,7% |

Desglose de v2 por tipo de texto:

| Texto (v2) | Sugiere en | Correctas | Sugiere 2+ palabras en | 2+ palabras correctas |
|---|---|---|---|---|
| Articulos (Wikipedia) | 10% | 78% | 4% | 71% |
| Mensajes (OpenAssistant) | 19% | 75% | 9% | 70% |
| Email (Enron, remitentes no vistos) | 11% | 78% | 4% | 51% |

Comparativa de variantes de entrenamiento de v2:

| Variante | Tokens de entrenamiento | Fill-in-the-middle | Typing (art./msg./email) | Editing (art./msg./email) | Val loss |
|---|---|---|---|---|---|
| v2 (esta) | 3B | mitad de ejemplos | 3,9 / 8,8 / 4,0 | 3,1 / 7,6 / 4,2 | 2,89 |
| Primera v2 | 1,5B | mitad de ejemplos | 4,0 / 7,3 / 4,3 | 2,8 / 6,3 / 3,6 | 2,99 |
| Sin FIM | 1,5B | ninguno | 3,9 / 8,8 / 4,2 | 3,0 / 6,9 / 4,1 | 2,94 |

Comparativa por tamano con modelos Pythia (300 pausas por tipo de texto; tinynext usa 1.000):

| Modelo | Parametros | Articulos | Mensajes | Email |
|---|---|---|---|---|
| Pythia | 14M | 3,6% | 6,1% | 2,4% |
| Pythia | 31M | 4,0% | 6,6% | 4,0% |
| Pythia | 70M | 7,0% | 8,0% | 4,9% |
| Pythia | 160M | 7,3% | 10,5% | 7,9% |
| SmolLM2 | 135M | 8,1% | 16,8% | 5,7% |
| tinynext v2 | 12,5M | 3,9% | 8,8% | 4,0% |

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo (~0,98 MB en v2) se ejecuta en el navegador mediante ONNX Runtime Web, por lo que consume memoria del cliente, no de una GPU de servidor.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU a traves de WebAssembly/WebGPU en el navegador.
- Cabe en GPU de consumo: si, y tambien en dispositivos sin GPU, ya que su huella es inferior a 1 MB.
- Opciones de despliegue: onnxruntime-web en el navegador (Web Worker), con pesos en formato ONNX; el repositorio tambien incluye safetensors.
- Latencia y throughput: ~4 ms declarados por el autor para la generacion de sugerencias.
- Almacenamiento: el repositorio completo ocupa 0,4 GB, aunque el modelo v2 en si es de aproximadamente 0,98 MB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tinynext v2 | 12,5M | ~1.500 caracteres | Autocompletado en navegador (ONNX) | no disponible | Hugging Face |
| SmolLM2-135M | 135M | no disponible | Modelo de lenguaje general pequeno | no disponible | Hugging Face |
| Pythia-160M | 160M | no disponible | Modelo de investigacion (EleutherAI) | no disponible | Hugging Face |
| Pythia-14M | 14M | no disponible | Modelo de investigacion (EleutherAI) | no disponible | Hugging Face |

En la comparativa del autor, tinynext v2 (12,5M) supera a Pythia-14M y Pythia-31M en ahorro de tecleo en articulos y mensajes, y queda por debajo de SmolLM2-135M, que actua como techo de referencia con un tamano cien veces mayor. La ventaja de tinynext es su huella minima (<1 MB) y su ejecucion en navegador, no su rendimiento absoluto.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Es un modelo especializado en autocompletado, no un modelo de instrucciones ni de razonamiento; no soporta tool calling ni agentes.
- El contexto es de aproximadamente 1.500 caracteres, muy inferior al de modelos de lenguaje generales.
- Los resultados de benchmarks son declarados por el autor y no estan verificados (verified: false en la model-index).
- El rendimiento en correo electronico de remitentes no vistos es modesto (4,0% de tecleo ahorrado), lo que limita su utilidad en dominios muy distintos al de entrenamiento.
- La licencia no esta disponible, lo que impide confirmar si se permite el uso comercial.
- El modelo v1 (944K parametros, modelo de caracteres) sigue en la raiz del repositorio; la version activa v2 esta en el subdirectorio v2/.
- Riesgo de alucinacion y sesgos: no documentado por el autor; al ser un modelo de autocompletado, las sugerencias pueden ser incorrectas o reflejar sesgos presentes en los datos de entrenamiento (Enron emails, fineweb-edu, smoltalk).
- El entrenamiento con Enron emails puede introducir sesgos de estilo y contenido propios de ese corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/paperweight/tinynext
- Subdirectorio v2: https://huggingface.co/paperweight/tinynext/tree/main/v2
- Variante sin FIM: https://huggingface.co/paperweight/tinynext/tree/main/v2/experiments/tinynext-v2-nofim
- Demo en Spaces: https://huggingface.co/spaces/cfahlgren1/enron-autocomplete
- Aplicacion offlinepage.app: https://offlinepage.app
- Modelo v1 original: https://huggingface.co/cfahlgren1/enron-autocomplete
- Pythia-160M (referencia): https://huggingface.co/EleutherAI/pythia-160m
