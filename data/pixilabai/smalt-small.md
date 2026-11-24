# PixilabAI/smalt-small

## Resumen

smalt-small es un modelo de difusión discreta enmascarada (masked discrete diffusion) desarrollado por PixilabAI para la generación de sprites de pixel art de 16×16 píxeles a partir de prompts de texto cortos. Con solo 24,5 millones de parámetros, está diseñado específicamente para producir assets de videojuego listos para usar: pociones, cofres, espadas, llaves, monstruos, tiles, efectos y letras, con transparencia real y una paleta fija de 512 colores.

El modelo abandona el enfoque convencional de difusión continua con VAE y CLIP en favor de una representación discreta: cada píxel es un token de una paleta de 512 colores (índice 0 = transparente). El modelo parte de un lienzo de 16×16 completamente enmascarado y rellena los píxeles en paralelo en unos 16 pasos, manteniendo en cada iteración las predicciones de mayor confianza. Esto garantiza bordes duros, ausencia de antialiasing y transparencia exacta, algo imposible de obtener con modelos de difusión latente convencionales sin postprocesado.

Es relevante por su eficiencia extrema (~0,12 s para 4 sprites en GPU, ~1,2 s para uno en 2 hilos de CPU), su licencia MIT permisiva (incluido uso comercial de los sprites generados) y su enfoque técnico poco habitual en el ecosistema open source. No requiere CLIP ni VAE, solo torch, tokenizers, safetensors, numpy y pillow. Está entrenado desde cero con pixel art de licencia abierta, sin usar salidas de otros generadores de imágenes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión discreta enmascarada (masked discrete diffusion) sobre tokens de paleta |
| Parámetros totales | 24.474.373 (24,5 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (prompts cortos de 2 a 6 palabras recomendados) |
| Tipos de cuantización | No disponible (pesos safetensors en precisión original) |
| Idiomas soportados | Solo inglés (prompts en inglés) |
| Licencia | MIT (pesos, código y sprites generados) |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

smalt-small es un modelo de difusión discreta enmascarada. Cada píxel de la imagen se representa como un token de una paleta fija de 512 colores, donde el índice 0 corresponde a transparencia. El proceso generativo comienza con un lienzo de 16×16 completamente enmascarado y, en cada uno de los aproximadamente 16 pasos de decodificación, el modelo predice un color para cada píxel vacío y conserva únicamente las predicciones con mayor confianza. El prompt se procesa mediante un codificador de texto propio, pequeño y entrenado conjuntamente con el modelo de imagen; no se emplean CLIP ni VAE externos.

El mismo bucle de decodificación soporta inpainting: el usuario puede bloquear un subconjunto de píxeles (mediante una máscara booleana) y el modelo rellena el resto de forma coherente alrededor de ellos. También existe un modo de streaming que expone el estado del lienzo tras cada paso (`step.tokens`, `step.preview`, `step.confidence`), útil para animaciones o depuración. El modelo fue entrenado desde cero con pixel art de licencia abierta y, según el autor, no se utilizaron salidas de otros generadores de imágenes en el dataset. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de sprites de pixel art de 16×16 RGBA a partir de prompts cortos en inglés (2 a 6 palabras).
- Salida con transparencia real (índice 0 de la paleta) y colores exactos de una paleta fija de 512 colores, sin antialiasing ni desenfoque.
- Generación por lotes: múltiples prompts en una sola llamada (`pipe(["red key", "silver sword", "treasure chest"])`).
- Inpainting: bloqueo de píxeles y relleno del resto de forma coherente.
- Decodificación en streaming paso a paso, con acceso a tokens, previsualización y confianza por paso.
- Categorías soportadas mediante prefijos de prompt: objetos y criaturas (nombre directo), tiles (`tile with ...`), efectos (`effect ...`), elementos de interfaz (`ui ...`) y letras (`text ...`).
- Control de generación mediante `steps` (por defecto 16; 8 más rápido, 24–32 más limpio), `guidance` (por defecto 3,0; rango útil 2–5), `temperature` (por defecto 0,4) y `seed` para reproducibilidad.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo text-to-image.

## Casos de uso

- Prototipado rápido de assets para videojuegos: un desarrollador puede generar lotes de sprites (pociones, cofres, espadas) con `pipe(prompts, n=4)` y obtener PNG de 16×16 listos para importar en el motor, gracias a la transparencia exacta y a los bordes nítidos sin postprocesado.
- Generación de tilesets: con prompts como `tile with stone bricks` o `tile with blue water` se producen baldosas coherentes con la paleta del juego, útiles para mapas de prototipo o game jams donde no hay artista disponible.
- Creación de elementos de interfaz: prompts con prefijo `ui` (por ejemplo `ui wooden button`) permiten generar botones y piezas de HUD con estilo consistente, aunque el autor advierte que esta categoría es más tosca que los objetos.
- Iteración de diseño con inpainting: un artista puede bloquear la mitad inferior de un sprite ya generado y pedir una variante de la parte superior, manteniendo la coherencia visual sin redibujar desde cero.
- Generación de tipografía pixelada: con prompts `text gold letter a` se obtienen letras individuales para logotipos o rótulos dentro del juego; los dígitos son menos fiables según el autor.
- Animaciones por streaming de pasos: el modo `pipe.stream()` expone el lienzo tras cada paso, lo que permite construir animaciones de "aparición" o efectos de revelado a partir de la secuencia de decodificación.
- Despliegue en entornos con recursos mínimos: al necesitar solo ~1,2 s por sprite en 2 hilos de CPU y no requerir CLIP ni VAE, puede ejecutarse en servidores sin GPU o en el propio navegador mediante el Space oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento proporcionados por el autor son de velocidad de inferencia:

| Métrica | Valor |
|---|---|
| 4 sprites en GPU | ~0,12 s |
| 1 sprite en CPU (2 hilos) | ~1,2 s |
| Pasos de decodificación por defecto | 16 (8 más rápido, 24–32 más limpio) |

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 24,5 M de parámetros los pesos ocupan del orden de decenas de MB en precisión original, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con CUDA disponible acelera la inferencia; el modelo detecta CUDA automáticamente y cae a CPU si no está presente.
- Cabe en GPU consumer: sí, en cualquier GPU consumer moderna e incluso en GPUs integradas; también funciona en CPU.
- Opciones de despliegue: el repositorio incluye el paquete `smalt` con `SmaltPipeline` (PyTorch). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. Existe un Space oficial (smalt studio) para uso en navegador.
- Latencia y throughput: ~0,12 s para 4 sprites en GPU y ~1,2 s para uno en 2 hilos de CPU, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Salida | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smalt-small (PixilabAI) | 24,5 M | 16×16 RGBA, paleta de 512 colores | Difusión discreta enmascarada | MIT | Hugging Face + Space |
| thejagstudio/tessera-small | No disponible | Pixel art (16×16 según la inspiración declarada) | No disponible en la información proporcionada | No disponible | Hugging Face |
| Modelos text-to-image generalistas (p. ej. Stable Diffusion) | Cientos de millones a miles de millones | Resolución variable, RGB continuo | Difusión latente con VAE y CLIP | Variables | Amplia |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. La diferencia cualitativa principal frente a los modelos de difusión latente generalistas es la salida discreta por paleta, que elimina el antialiasing y garantiza transparencia exacta, a costa de limitarse a 16×16 y a un dominio muy acotado (sprites de videojuego).

## Limitaciones y advertencias

- Solo genera imágenes de 16×16; no es un modelo de escenas, retratos ni resoluciones mayores.
- Solo acepta prompts en inglés.
- Algunos sujetos son débiles o se confunden: `pine tree` tiende a dibujar un cristal azul, `ghost` puede salir como una bomba negra, `crown` y `gold coin` a menudo se convierten en cofres dorados, y un `heart` sin color da cuadrados rosas (`red heart` sí funciona).
- Los efectos y los elementos de interfaz (barras de vida, explosiones) son toscos en comparación con los objetos.
- Los personajes descritos por su vestimenta pueden derivar hacia el objeto al que se parecen (`wizard with a blue robe` puede dibujar una poción azul); nombrar primero la criatura ayuda.
- Los dígitos en la generación de letras son menos fiables que las letras.
- Riesgo de alucinación y de resultados fuera de distribución con prompts largos o poco convencionales; el autor recomienda prompts de 2 a 6 palabras con el color o material primero.
- No se documentan sesgos específicos del dataset de entrenamiento más allá de la composición de pixel art de licencia abierta.
- Licencia MIT: permite uso comercial tanto del modelo como de los sprites generados, sin restricciones documentadas adicionales.
- Para producción, conviene fijar `seed` y ajustar `temperature` por debajo de ~1,0 para evitar píxeles sueltos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PixilabAI/smalt-small
- Demo en el navegador (smalt studio): https://huggingface.co/spaces/PixilabAI/smalt-studio
- Sitio del proyecto nemini.ai: https://nemini.ai
- Sitio del proyecto pixilab.ai: https://pixilab.ai
- Modelo de inspiración (tessera-small): https://huggingface.co/thejagstudio/tessera-small
