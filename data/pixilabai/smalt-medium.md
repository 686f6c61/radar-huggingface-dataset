# PixilabAI/smalt-medium

## Resumen

smalt-medium es un modelo de difusión discreta enmascarada (masked discrete diffusion) especializado en la generación de sprites de pixel art de 16×16 píxeles a partir de prompts de texto cortos. Lo desarrolla PixilabAI y está pensado como motor de generación de assets para videojuegos: pociones, cofres, espadas, coronas, llaves, monstruos y caballeros. Con 49,3 millones de parámetros y un repositorio de apenas 0,2 GB, es un modelo deliberadamente pequeño y ligero, diseñado para inferencia rápida incluso en CPU.

La innovación frente a los modelos de difusión continua convencionales es que cada píxel se representa como un token de una paleta fija de 512 colores (el índice 0 es transparencia). El modelo parte de un lienzo de 16×16 totalmente enmascarado y lo rellena en paralelo en unos 16 pasos, prediciendo un color para cada píxel vacío y conservando los de mayor confianza. Al trabajar sobre índices de paleta, la salida es exacta a nivel de píxel: bordes duros, sin desenfoque ni antialiasing, y transparencia real.

Es relevante ahora porque cubre un nicho que los grandes modelos texto-a-imagen no resuelven bien (sprites de resolución mínima con paleta estricta y canal alfa limpio) con un coste computacional mínimo: aproximadamente 0,17 s para 4 sprites en GPU y 1,8 s para uno en CPU con 2 hilos. No depende de CLIP ni de VAE, solo de torch, tokenizers, safetensors, numpy y pillow, y se distribuye bajo licencia MIT con pesos y código incluidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión discreta enmascarada (masked discrete diffusion) sobre tokens de paleta; codificador de texto propio entrenado junto al modelo de imagen |
| Parámetros totales | 49.314.309 (49,3 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (prompts cortos, 2-6 palabras recomendadas) |
| Tipos de cuantización | no disponible (no se documentan variantes GGUF, AWQ ni similares) |
| Idiomas soportados | inglés únicamente (prompts en inglés) |
| Licencia | MIT (pesos y código) |
| Formato de pesos | safetensors (librería pytorch) |

## Arquitectura y entrenamiento

smalt-medium es un modelo de difusión discreta enmascarada. Cada píxel del lienzo de 16×16 se trata como un token de un vocabulario de 512 colores de paleta, donde el índice 0 representa transparencia. El proceso de generación arranca con los 256 píxeles enmascarados y, en cada paso, el modelo predice un color para cada píxel vacío y fija los que considera más fiables; con unos 16 pasos se completa el sprite. El prompt se procesa mediante un codificador de texto pequeño propio, entrenado conjuntamente con el modelo de imagen, lo que elimina la dependencia de CLIP o de un VAE externo.

El mismo bucle de decodificación soporta inpainting: se bloquean ciertos píxeles mediante una máscara y el modelo rellena el resto de forma coherente con ellos. También existe un modo de streaming (`pipe.stream`) que expone el lienzo tras cada paso, con tokens, previsualización y nivel de confianza, útil para animaciones o depuración. No se han publicado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación texto-a-imagen de sprites de pixel art de 16×16 píxeles en formato RGBA.
- Salida con paleta exacta de 512 colores e índice 0 como transparencia, sin antialiasing ni píxeles sueltos.
- Generación por lotes de varios sprites con una sola llamada (`pipe("red health potion", n=4, seed=0)`).
- Procesamiento de varios prompts en un mismo lote (`pipe(["red key", "silver sword", "treasure chest"])`).
- Inpainting: bloqueo de píxeles y relleno del resto del lienzo alrededor de ellos.
- Streaming paso a paso del proceso de decodificación con información de confianza por paso.
- Control de generación mediante `steps` (por defecto 16), `guidance` (por defecto 3.0), `temperature` (por defecto 0.4) y `seed` para reproducibilidad.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Generación de assets para videojuegos indie: crear pociones, cofres, espadas o coronas en 16×16 directamente utilizables en motores como Godot o Unity, con transparencia correcta y sin postprocesado de limpieza de bordes.
- Prototipado rápido de inventarios y HUD: generar lotes de iconos de objetos con `n=4` o varios prompts en una sola llamada para poblar menús y rejillas de inventario en segundos.
- Creación de criaturas y personajes: prompts como `purple slime monster`, `knight in silver armor` o `frog with a crown` producen sprites de enemigos y NPC para roguelikes y RPGs de cuadrícula.
- Iteración de variantes controlada por semilla: fijar `seed` y variar `temperature` o `guidance` para explorar estilos manteniendo reproducibilidad, útil en pipelines de arte generativo versionados.
- Edición e inpainting de sprites existentes: bloquear la mitad inferior de un sprite y regenerar la superior para crear variantes de un mismo objeto (por ejemplo, una poción vacía frente a una llena) conservando la silueta.
- Generación en CPU para herramientas de escritorio o plugins: con 1,8 s por sprite en 2 hilos de CPU, el modelo puede integrarse en editores de niveles o asistentes de arte sin requerir GPU.
- Generación de animaciones por pasos: usar `pipe.stream` para capturar el lienzo intermedio en cada paso y construir transiciones o efectos de aparición de sprites.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta métricas de velocidad: aproximadamente 0,17 s para 4 sprites en GPU y 1,8 s para un sprite en CPU con 2 hilos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 49,3 M de parámetros y pesos en safetensors de un repositorio de 0,2 GB, el modelo cabe holgadamente en cualquier GPU consumer (por debajo de 1 GB en fp32, aún menos en fp16).
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; no se requiere A100, H100 ni RTX 4090. Una GPU de gama baja o integrada moderna basta para la latencia indicada.
- Cabe en GPU consumer: sí, en cualquier GPU consumer con CUDA; también funciona en CPU.
- Opciones de despliegue: el repositorio incluye el paquete `smalt` con `SmaltPipeline`, que selecciona CUDA si está disponible y CPU en caso contrario. Las dependencias son torch, tokenizers, safetensors, numpy, pillow y huggingface_hub. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: aproximadamente 0,17 s para 4 sprites en GPU y 1,8 s para un sprite en CPU con 2 hilos.

## Comparativa con modelos similares

| Modelo | Parámetros | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| smalt-medium | 49,3 M | 16×16 RGBA, paleta de 512 colores | MIT | Hugging Face (PixilabAI/smalt-medium) |
| smalt-small | 24,5 M | 16×16 RGBA (misma familia) | no disponible en la información | Hugging Face (PixilabAI/smalt-small) |
| thejagstudio/tessera-small | no disponible | no disponible | no disponible | Hugging Face (citado como inspiración) |

smalt-medium es la versión mayor de smalt-small (24,5 M de parámetros) y, según la model card, ofrece sombreado más nítido, contornos más limpios y mejores resultados en objetos y criaturas. tessera-small se menciona únicamente como inspiración del proyecto; no se dispone de datos comparativos de rendimiento.

## Limitaciones y advertencias

- Solo genera sprites de 16×16; no es un modelo de escenas, retratos ni resoluciones mayores.
- Rinde mejor en objetos, criaturas y personajes. Los tiles (`tile with …`) tienden a salir como campos de color planos, las letras (`text …`) son poco fiables y los efectos e interfaces son toscos.
- Una palabra de color más un sustantivo corto puede degenerar en un patrón de textura (por ejemplo, `orange fox`); añadir una palabra descriptiva mejora el resultado.
- Los metales plateados y blancos pueden lavarse a gris pálido.
- Solo acepta prompts en inglés.
- Riesgo de alucinación visual: el modelo puede producir sprites que no correspondan semánticamente al prompt, especialmente con prompts ambiguos o poco frecuentes.
- No se documentan sesgos específicos en la información disponible; al ser un modelo de sprites de objetos y criaturas genéricas, el riesgo de sesgo social es limitado, pero no se ha evaluado formalmente.
- Licencia MIT: permite uso comercial de los pesos, el código y los sprites generados, según indica la model card.
- No se documentan cuantizaciones ni formatos alternativos de pesos, lo que limita opciones de despliegue fuera del paquete `smalt` incluido en el repositorio.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PixilabAI/smalt-medium
- Modelo hermano smalt-small: https://huggingface.co/PixilabAI/smalt-small
- Demo en el navegador (smalt studio): https://huggingface.co/spaces/PixilabAI/smalt-studio
- Sitio de nemini.ai: https://nemini.ai
- Sitio de pixilab.ai: https://pixilab.ai
- Inspiración citada: https://huggingface.co/thejagstudio/tessera-small
