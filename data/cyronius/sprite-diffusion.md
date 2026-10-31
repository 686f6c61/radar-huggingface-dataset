# Cyronius/sprite-diffusion

## Resumen

Sprite diffusion es un modelo de generación de imágenes incondicional especializado en sprites de pixel art RGBA de 32×32 píxeles, desarrollado por el usuario Cyronius y distribuido en Hugging Face. Se trata de un transformer de rectified flow de solo 24,2 millones de parámetros, condicionado por categoría: en lugar de aceptar prompts en lenguaje natural, recibe una de ocho etiquetas de categoría (criatura, objeto, arma, comida, efecto, terreno, estructura, naturaleza). El repositorio distribuye pesos EMA de inferencia en dos checkpoints (el original entrenado 100k actualizaciones y su continuación a 150k), además de exportaciones ONNX destinadas a un generador que funciona en el navegador vía WebGPU.

Su relevancia radica en demostrar que un modelo generativo muy pequeño puede ejecutarse íntegramente en el cliente, sin servidor ni GPU dedicada, gracias a la exportación ONNX con opset 17 y su tamaño de repo de apenas 0,4 GB. Es útil para desarrolladores de videojuegos y herramientas procedurales que necesitan generar assets de pixel art de forma rápida y local. No es un modelo texto-a-imagen y no debe evaluarse como tal: su ámbito es estrictamente la generación de sprites pequeños por categoría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de rectified flow (DiT) condicionado por categoria |
| Parametros totales | 24,2 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; 256 tokens de parche internos) |
| Tipos de cuantizacion | float32 (sin cuantizacion publicada) |
| Idiomas soportados | en (documentacion; no procesa texto) |
| Licencia | Apache 2.0 (pesos y codigo) |
| Formato de pesos | safetensors y ONNX (opset 17, float32) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion tipo DiT configurado con anchura oculta 384, 10 bloques y tres cabezas de atencion de 128 dimensiones, con tamano de parche 2 y 256 tokens. Funciona en un espacio latente de 4 canales a 32×32 y predice el campo de velocidades de un rectified flow, integrado desde ruido gaussiano en t=1 hasta t=0 mediante Euler. Emplea classifier-free guidance (CFG con escala 3), con un lote fijo de 2 en las exportaciones ONNX para calcular simultaneamente las ramas condicional e incondicional.

El checkpoint original se entreno durante 100.000 actualizaciones. La continuacion a 150k utilizo un dataset ampliado de 383.660 imagenes o frames, tasa de aprendizaje 3e-5, muestreo balanceado por categoria y subtipo, y aumento de datos basado en paletas. La continuacion consto de un piloto de 10k actualizaciones con optimizador reiniciado, seguido de otras 40k que retomaron ese piloto. Los subtipos de criatura solo afectan a la exposicion del dataset, no son etiquetas de salida. La evaluacion publicada consistio en una revision visual conversacional de 1.536 sprites generados; no hay validacion sobre datos no vistos ni evaluacion formal de copia o diversidad.

## Capacidades

- Generacion de sprites de pixel art RGBA de 32×32 píxeles condicionados por una de ocho categorias: creature, item, weapon, food, effect, terrain, structure y nature (la categoria food incluye bebidas y pociones).
- Control de calidad frente a velocidad mediante el numero de pasos de muestreo: 32 pasos es el valor recomendado por el autor, 16 es equilibrado y 8 es rapido; con 1-2 pasos las salidas estan subdesarrolladas y 64 no mejora de forma fiable.
- Ejecucion en navegador via ONNX Runtime con WebGPU, sin necesidad de backend propio.
- Classifier-free guidance integrado en el grafo ONNX (lote fijo de 2).
- No soporta prompts en lenguaje natural, ni texto, ni resolucion variable, ni edicion imagen-a-imagen.

## Casos de uso

- Generacion procedural de assets para videojuegos: producir lotes de sprites de enemigos, objetos o armas de 32×32 para prototipos y game jams, seleccionando la categoria adecuada en cada llamada.
- Herramientas de ideacion para artistas de pixel art: generar decenas de variaciones por semilla y categoria como punto de partida antes de refinar a mano.
- Generadores en el navegador: gracias a los pesos ONNX y WebGPU, se puede integrar el modelo en una web estatica sin coste de inferencia en servidor, como hace el demo del propio autor.
- Rellenado de tilesets y biomas: las categorias terrain, nature y structure permiten generar tiles y elementos de escenario coherentes en estilo.
- Efectos visuales y UI de juego: la categoria effect sirve para crear sprites de explosiones, magias o particulas; food para pociones e items de inventario.
- Experimentacion educativa con rectified flow: el codigo de arquitectura (`dit.py`) y la documentacion de entrenamiento permiten estudiar e implementar modelos de flujo rectificado a escala pequena.
- Pipelines de aumento de datos: generar sprites sinteticos etiquetados por categoria para otros sistemas de clasificacion o estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evaluacion descrita es una revision visual conversacional de 1.536 sprites (checkpoints 100k/110k/150k con 1, 2, 4, 8, 12, 16, 32 y 64 pasos, dos conjuntos de semillas fijas, CFG 3, pesos EMA y sin ajuste de paleta), que no establecio un ganador universal entre ambos checkpoints: el 150k mostro mas variedad en nature, mientras que el original conservo personajes mas variados en las semillas inspeccionadas. No es una evaluacion ciega independiente.

## Requisitos de hardware

- VRAM estimada: con 24,2 millones de parametros en float32, el modelo ocupa menos de 100 MB de pesos; la inferencia a 32×32 es minima y funciona en GPUs integradas.
- GPU recomendadas: cualquier GPU con soporte WebGPU para el generador en navegador; en escritorio, cualquier GPU moderna (incluidas integradas) es suficiente. No se requieren A100, H100 ni RTX 4090.
- Consumer GPUs: cabe sobradamente en cualquier GPU de consumo; el caso principal de uso es precisamente el navegador con WebGPU.
- Despliegue: ONNX Runtime (navegador via WebGPU o nativo), PyTorch con `DiT(384, 10, 2)` cargando el state dict de safetensors. No hay soporte documentado de vLLM, llama.cpp, Ollama ni TGI (no aplica, al no ser un modelo de lenguaje).
- Latencia: no se publican cifras, pero el autor indica 8 pasos como modo rapido y 32 como modo de calidad; el coste por paso es muy bajo dada la resolucion de 32×32 y el tamano del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sprite diffusion (Cyronius) | 24,2 M | 32×32 RGBA | 8 categorias fijas | Apache 2.0 | Pesos safetensors y ONNX, demo web |
| Pixel art diffusion (comunitarios en HF) | no disponible | variable | texto (prompt) | variable | variable |
| Stable Diffusion 1.5 | ~890 M (UNet) | 512×512 | texto (CLIP) | CreativeML OpenRAIL-M | Pesos abiertos, ecosistema amplio |

Comparacion contextual: frente a modelos texto-a-imagen genericos como Stable Diffusion 1.5, sprite diffusion es tres ordenes de magnitud mas pequeno, genera directamente en 32×32 RGBA con canal alfa (sin postproceso) y corre en navegador, pero no acepta lenguaje natural ni resolucion mayor. No existen en la informacion proporcionada alternativas comparables del mismo nicho con datos suficientes para una tabla mas detallada: no disponible.

## Limitaciones y advertencias

- No es un modelo texto-a-imagen: solo acepta ocho etiquetas de categoria; cualquier expectativa de control por prompt en lenguaje natural es invalida.
- Resolucion fija de 32×32; no genera imagenes mayores ni hace superresolucion.
- La evaluacion publicada no es ciega ni independiente; no hay validacion sobre datos no vistos ni metricas formales de copia o diversidad, por lo que la calidad debe verificarse caso por caso.
- Con menos de 8 pasos de muestreo las salidas estan subdesarrolladas; el autor no recomienda 64 pasos al no mejorar de forma fiable.
- Ninguno de los dos checkpoints es universalmente superior: conviene mantener ambos y comparar por semilla y categoria.
- Las exportaciones ONNX usan lote fijo de 2 para CFG, lo que obliga a seguir el esquema de entradas documentado (categoria `[c,8]`, footprint `[3,3]`, combinacion `uncond + 3*(cond-uncond)`).
- Licencia Apache 2.0: permite uso comercial, pero no hay garantias sobre la procedencia del dataset de entrenamiento mas alla de lo descrito en la model card.
- Riesgo de reproduccion de estilos o assets del dataset de entrenamiento no evaluado formalmente; revisar las salidas antes de uso comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cyronius/sprite-diffusion
- Codigo y documentacion de entrenamiento: https://github.com/Cyronius/model-experiments/tree/main/sprite-diffusion
- Generador en navegador (demo): https://cyronius.github.io/model-experiments/sprite-diffusion/
