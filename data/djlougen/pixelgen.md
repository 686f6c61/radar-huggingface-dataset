# DJLougen/pixelgen

## Resumen

PixelGen es un modelo de generación de texto a imagen publicado en Hugging Face por el usuario DJLougen. Se presenta como un experimento de "programación en el espacio de pesos" (*weight-space programming*): en lugar de entrenar una red neuronal, el autor escribe un programa en Python que compila directamente los pesos de un `nn.Module` de PyTorch. El resultado es un modelo con 1.257 parámetros registrados, cero pasos de entrenamiento y cero optimizadores, capaz de convertir prompts como `"red potion"` o `"blue invader"` en sprites de pixel art de 16×16 píxeles en la paleta de PICO-8, reescalados a 128×128.

El modelo no es un generador de imágenes de propósito general ni pretende competir con modelos de difusión: es una pieza de arte técnico y una demostración pedagógica de que ciertas arquitecturas (capas lineales como tablas de búsqueda, argmax como decisión, convoluciones 1×1 como paletas) pueden codificar lógica determinista sin gradientes. Su relevancia actual es conceptual: ilustra los límites y la naturaleza de los pesos como programa, y sirve como material didáctico para entender qué hace realmente un `nn.Module` cuando se le llama con `.forward()`.

La arquitectura es un pipeline determinista de nueve pasos sobre tensores, sin atención ni mecanismos de aprendizaje. El vocabulario de entrada está restringido a 59 palabras en inglés (11 clases de sprite y 9 rampas de color con sinónimos), y la salida es siempre un sprite simétrico de 16×16 con estilizado por filas (luz, medio, oscuro) y contorno dilatado. La licencia es MIT y el checkpoint completo ocupa 23,5 KB en disco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline determinista de operaciones tensoriales (capas lineales como tablas de búsqueda, argmax como decisión, convolución 1×1 como paleta); no es un transformer ni un modelo de difusión |
| Parametros totales | 1.257 parámetros registrados (más 3.611 buffers no entrenables; 4.868 valores en el checkpoint, ≈19,5 KB en fp32) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la entrada es una bolsa de palabras sobre un vocabulario fijo de 59 términos; no hay contexto secuencial) |
| Tipos de cuantizacion | No disponible (el checkpoint se distribuye en fp32; no se documentan otras precisiones) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch `state_dict` (`pixelgen.pt`, 23,5 KB); los pesos también se reconstruyen desde el código fuente en `__init__` |

## Arquitectura y entrenamiento

El modelo es un `nn.Module` de PyTorch cuyo *forward pass* consta de nueve pasos: (1) bolsa de palabras sobre un vocabulario de 59 términos; (2) capa `Linear(59→11)` seguida de argmax para seleccionar la clase de sprite; (3) banco de formas que selecciona una media plantilla de 16×8, con celdas `?` activadas por ruido por semilla; (4) espejado horizontal para obtener el cuerpo simétrico de 16×16; (5) contorno mediante dilatación 3×3 menos el cuerpo original; (6) sombreado por filas (filas 0–6 claras, 7–10 medias, 11–15 oscuras); (7) capa `Linear(59→9)` más argmax para seleccionar la rampa de color; (8) conversión a one-hot sobre las 16 colores de PICO-8; y (9) convolución `Conv2d(16→3, 1×1)` que mapea one-hot a RGB exacto de la paleta.

No hubo entrenamiento: cero pasos, cero optimizadores, cero pasadas hacia atrás y ningún `requires_grad=True` en el repositorio (verificado con grep según la model card). Los pesos se escriben a mano en el código y se compilan a tensores; la reproducibilidad está garantizada porque `build.py` ejecutado dos veces produce el mismo SHA-256. La "generación" proviene únicamente del ruido por semilla que activa celdas `?` de las plantillas, de modo que un mismo prompt produce variaciones pequeñas entre semillas. La inspiración declarada es el artículo sobre *weight-space programming* de rikiyat.github.io.

## Capacidades

- Generación de sprites de pixel art de 16×16 píxeles (reescalados a 128×128) en la paleta PICO-8 de 16 colores.
- 11 clases de sprite: poción, espada, escudo, nave, invasor, slime, calavera, árbol, llave, corazón y estrella.
- 9 rampas de color: rojo, azul, verde, amarillo, morado, naranja, rosa, marrón y blanco, con sinónimos (`crimson`, `ruby`, `azure`, `sapphire`, `emerald`, `lime`, `gold`, `golden`, `violet`, `amethyst`, `amber`, `rose`, `wood`, `wooden`, `grey`, etc.).
- Variación controlada por semilla: celdas `?` de las plantillas se activan o desactivan según ruido por semilla, produciendo pequeñas diferencias entre generaciones del mismo prompt.
- Salida determinista y reproducible: misma semilla y mismo prompt producen exactamente la misma imagen.
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso, matemáticas, código, visión ni audio.
- No soporta prompts libres: solo combinaciones de palabras del vocabulario cerrado de 59 términos.
- Inspeccionable como código: el "modelo" completo se puede leer como fuente y reconstruir sin checkpoint.

## Casos de uso

- Docencia sobre el espacio de pesos: usar PixelGen para explicar qué es un `state_dict`, cómo se comporta un `nn.Module` sin entrenamiento y qué significa que los pesos sean un programa. El código es corto y legible, y el resultado visual hace tangible el concepto.
- Generación de assets para prototipos de videojuegos retro: producir sprites de 16×16 en paleta PICO-8 para maquetas, game jams o pruebas de concepto donde se necesita arte placeholder coherente con una estética concreta.
- Pruebas de pipelines de renderizado y exportación: validar rutas de conversión a PNG, reescalado nearest-neighbour y gestión de paletas indexadas con un generador determinista y de coste computacional despreciable.
- Arte generativo y experimentación creativa: explorar variaciones por semilla de un mismo prompt para ilustrar cómo el ruido controlado introduce diversidad en un sistema determinista.
- Benchmark de juguete para entornos de inferencia: medir latencias de carga y ejecución de un modelo mínimo en distintos backends o dispositivos sin la variabilidad de un modelo entrenado.
- Material para charlas y artículos técnicos: demostrar visualmente la diferencia entre "entrenar" y "programar" un modelo, con métricas verificables (1.257 parámetros, 0 pasos, 23,5 KB en disco).
- Generación de iconos simples en documentación o demos: usar los sprites de corazón, llave, estrella o poción como iconografía coherente en prototipos de interfaz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente métricas internas de tamaño y reproducibilidad (1.257 parámetros registrados, 3.611 buffers, 4.868 valores, 23,5 KB en disco, SHA-256 del checkpoint `175cc5249fba8c756ea019f418f4aa0a9633017ffad7f238b863865758c49b80`), no evaluaciones de calidad de imagen, FID, IS ni comparaciones con otros generadores.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; el checkpoint pesa 23,5 KB en fp32 y el modelo completo cabe holgadamente en cualquier GPU, CPU o incluso en memoria de un microcontrolador con suficiente RAM.
- GPU recomendadas: cualquiera; no hay requisitos prácticos. Funciona en CPU sin penalización perceptible.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1650, integradas) y en CPU.
- Opciones de despliegue: PyTorch nativo (`from pixelgen.model import PixelGen`); el script `generate.py` acepta `--seed`, `--out` y `--scale`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Dependencias: `torch`, `numpy` y `pillow`; no requiere ningún otro paquete.
- Latencia y throughput: no disponible en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. PixelGen no compite con generadores texto-imagen entrenados (Stable Diffusion, DALL·E, Flux) ni con modelos de pixel art basados en difusión: su naturaleza (pesos escritos a mano, cero entrenamiento, vocabulario cerrado de 59 palabras) no tiene equivalentes directos publicados en la información disponible.

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PixelGen | 1.257 | No aplica (vocabulario cerrado) | 0 pasos | MIT | Hugging Face |
| Generadores texto-imagen de difusión | Miles de millones | Cientos de tokens | Millones de pasos | Variables | Hugging Face y otros |
| Modelos de pixel art basados en difusión | Cientos de millones a miles de millones | Cientos de tokens | Millones de pasos | Variables | Hugging Face |

## Limitaciones y advertencias

- Vocabulario cerrado de 59 palabras: cualquier prompt fuera de la lista de clases y colores (con sus sinónimos) no produce el resultado esperado; no hay generalización a lenguaje libre.
- Solo inglés: no se documenta soporte para otros idiomas.
- Resolución y estética fijas: únicamente sprites de 16×16 en paleta PICO-8, simétricos y con sombreado por filas; no hay control fino sobre la forma más allá de la clase y la semilla.
- No es un modelo generativo entrenado: no aprende de datos ni mejora con uso; la "variación" se limita a las celdas `?` activadas por ruido por semilla.
- Riesgo de alucinación: no aplica en el sentido habitual, pero un prompt no reconocido puede caer en la clase por defecto (poción) o en la rampa por defecto (verde) sin aviso, produciendo una salida que no coincide con la intención del usuario.
- Sesgos: no se documentan sesgos de datos porque no hay datos de entrenamiento; el sesgo es de diseño (clases y colores elegidos por el autor).
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución; no hay restricciones adicionales documentadas.
- Caveat de producción: el checkpoint `pixelgen.pt` es redundante porque los pesos se reconstruyen desde el código en `__init__`; para producción conviene fijar la versión del repositorio y verificar el SHA-256 para garantizar reproducibilidad.
- Proyecto de juguete: la model card lo etiqueta explícitamente como `toy`; no está pensado para cargas de trabajo reales de generación de imágenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DJLougen/pixelgen
- Artículo inspirador sobre weight-space programming: https://rikiyat.github.io/blog/weight-space-programming/
- Repositorio del modelo (clonable desde Hugging Face): https://huggingface.co/DJLougen/pixelgen
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos adicionales.
