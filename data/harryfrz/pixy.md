# harryfrz/pixy

## Resumen

pixy es un modelo generativo de pixel art desarrollado por harryfrz, publicado en Hugging Face bajo el identificador `harryfrz/pixy`. Su función es generar sprites de 16×16 píxeles a partir de un prompt de texto, una imagen de referencia o ambos, restringiendo siempre la salida a una paleta de hasta 32 colores que el usuario proporciona como entrada. El modelo tiene aproximadamente 40 millones de parámetros y se distribuye como exportaciones ONNX preparadas para ejecutarse en el navegador mediante onnxruntime-web y WebGPU.

La relevancia de pixy reside en su enfoque de "palette-pointer": el cabezal de salida no predice colores en un espacio continuo, sino que puntúa únicamente entradas de la paleta proporcionada (más una opción de transparencia). Esto garantiza que el resultado respete exactamente la paleta del juego o proyecto del usuario, incluso con paletas no vistas durante el entrenamiento. El modelo completo en fp16 ocupa unos 210 MB (incluyendo el codificador de texto CLIP ViT-B/32 congelado), lo que lo hace viable en un navegador de portátil.

El modelo se apoya en difusión discreta enmascarada de estilo MaskGIT sobre una rejilla de 16×16 píxeles, con guiado sin clasificador y unas 12 iteraciones de desenmascaramiento. Está pensado para flujos de trabajo de desarrollo de videojuegos y creación de assets, no como un generador de imágenes de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión discreta enmascarada (MaskGIT) sobre transformer, con codificador de texto CLIP ViT-B/32 congelado |
| Parametros totales | Aproximadamente 40M (modelo de sprites) + CLIP ViT-B/32 congelado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 tokens de texto CLIP; rejilla de 256 píxeles (16×16); paleta de hasta 32 colores |
| Tipos de cuantizacion | fp16 y fp32 (exportaciones ONNX); índice de paletas en int8 |
| Idiomas soportados | No disponible (el prompt de texto se procesa con CLIP, principalmente inglés) |
| Licencia | No decidida todavía (`license: other`, `license_name: not-decided-yet`) |
| Formato de pesos | ONNX (`sprite_fp16.onnx`, `text_fp16.onnx`, `sprite_fp32.onnx`, `text_fp32.onnx`) |

## Arquitectura y entrenamiento

pixy emplea difusión discreta enmascarada al estilo MaskGIT. El proceso parte de una rejilla de 16×16 completamente enmascarada y rellena todos los píxeles en paralelo a lo largo de unas 12 iteraciones, desenmascarando primero los píxeles con mayor confianza según una programación coseno, con guiado sin clasificador (escala 3). La secuencia de entrada se compone de `[tokens de texto CLIP | tokens de paleta | 256 tokens de píxel]`. Los colores de la paleta se embeben a partir de sus valores OKLab sin información posicional, tratando la paleta como un conjunto no ordenado; un píxel con color *k* comparte el mismo vector de embedding que la entrada *k* de la paleta.

El cabezal de salida es un "palette-pointer": cada píxel puntúa cada entrada de la paleta más una opción de transparencia, de modo que permutar la paleta permuta las salidas de forma idéntica. Opcionalmente acepta una imagen guía (una imagen tosca de 16×16 en OKLab + alfa) añadida a los tokens de píxel, entrenada con degradaciones sintéticas de sprites reales. Los datos de entrenamiento provienen del dataset `Angais/pixel-art-atlas-1.4m` (CC0), con sprites generados mediante Krea 2. El codificador de texto es el torre de texto de `openai/clip-vit-base-patch32`, sin cambios salvo la exportación. Las exportaciones ONNX se verificaron contra el modelo PyTorch: con los mismos números aleatorios, el navegador produce sprites idénticos píxel a píxel en fp32.

## Capacidades

- Generación de sprites de 16×16 píxeles de un único objeto a partir de texto, imagen o ambos.
- Restricción estricta a una paleta de hasta 32 colores proporcionada por el usuario (PICO-8, Game Boy, paletas propias o extraídas de una imagen).
- Funcionamiento con paletas no vistas durante el entrenamiento.
- Conversión imagen → sprite: una foto, icono o dibujo de un objeto se transforma en un sprite limpio en la paleta elegida.
- Modo "palette from a theme" mediante `palette_index.bin`, que contiene los embeddings CLIP en int8 de 20.000 captions de entrenamiento junto con sus paletas.
- Guiado opcional por imagen tosca (guide image) además del prompt de texto.
- Ejecución en navegador con onnxruntime-web y WebGPU (aproximadamente medio segundo por sprite en GPU de portátil).
- No dispone de soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso, visión de escenas complejas, audio ni modo thinking.

## Casos de uso

- Creación de assets para videojuegos: el modelo genera sprites de 16×16 directamente en la paleta del juego (por ejemplo, PICO-8 o la paleta propia del proyecto), integrándose en el pipeline de arte para prototipado rápido de personajes, objetos e iconos.
- Herramienta web interactiva de pixel art: al ejecutarse en el navegador vía WebGPU con unos 210 MB de descarga, permite ofrecer un generador de sprites sin backend ni GPU en servidor, con latencia de aproximadamente medio segundo por sprite.
- Conversión de bocetos a sprites: un dibujo o icono de un único objeto se transforma en un sprite limpio mediante la entrada imagen → sprite, útil para equipos de arte que parten de conceptos rápidos.
- Generación de sprites coherentes con la paleta de una temática: usando `palette_index.bin` y el modo "palette from a theme", se pueden derivar paletas y sprites consistentes para un conjunto de assets de un mismo estilo.
- Prototipado de game jams: dado el tamaño reducido del modelo y su ejecución local en navegador, permite a equipos pequeños generar variaciones de sprites en la paleta de la jam sin infraestructura adicional.
- Herramientas educativas de pixel art: el modelo puede demostrar cómo una paleta restringida afecta al resultado y servir para enseñar técnicas de limitación de color en entornos interactivos.

## Benchmarks y rendimiento

Evaluación sobre 200 sujetos completamente excluidos del entrenamiento:

| Tarea | Resultado |
|---|---|
| Imagen → sprite (degradaciones sintéticas), píxeles exactamente correctos | 95,7% |
| Imagen → sprite, sin prompt | 95,5% |
| Texto → sprite, precisión de píxeles enmascarados | 69,9% |
| fp16 frente a fp32 en test de píxeles enmascarados retenido | 81,90% frente a 81,88% |

La exportación fp16 no pierde precisión respecto a fp32 según la evaluación del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo de sprites fp16 ocupa 81 MB y el codificador de texto fp16 127 MB, por lo que la huella es muy reducida.
- GPU recomendadas: cualquier GPU con soporte WebGPU para ejecución en navegador; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: sí, dado el tamaño reducido (aproximadamente 210 MB en fp16 incluyendo el tokenizador); se ejecuta en GPU de portátil según el autor.
- Opciones de despliegue: onnxruntime-web con WebGPU (recomendado); para navegadores sin WebGPU existen exportaciones fp32 (`sprite_fp32.onnx` de 161 MB y `text_fp32.onnx` de 253 MB).
- Latencia y throughput: aproximadamente medio segundo por sprite en GPU de portátil con WebGPU; no se proporcionan cifras de throughput para otros entornos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / salida | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pixy (harryfrz) | ~40M + CLIP ViT-B/32 | 16×16 sprites, paleta de hasta 32 colores | Difusión discreta MaskGIT, palette-pointer, ONNX/WebGPU | No decidida | Hugging Face, ONNX |
| tessera-small (thejagstudio) | No disponible | No disponible | Inspiración declarada de pixy | No disponible | Hugging Face |
| Modelos text-to-image generales (p. ej. Stable Diffusion) | Cientos de millones a miles de millones | Resolución variable | Difusión latente continua | Variable | Amplia |

El autor indica que pixy se inspiró en `thejagstudio/tessera-small`, aunque no se usaron código, pesos ni configuraciones de ese modelo. No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo genera sprites de 16×16 píxeles de un único objeto; escenas con mucho contenido y fotos de encuadre completo no funcionan bien.
- En paletas muy distintas a las del entrenamiento, los colores a veces se eligen de forma extraña; por ejemplo, una manzana roja puede salir azul en Sweetie-16.
- Un prompt vago combinado con una imagen guía poco respetada puede derivar hacia un objeto distinto.
- Riesgo de alucinación y de deriva semántica en la generación texto → sprite (precisión de píxeles enmascarados del 69,9%).
- La licencia de los pesos no está decidida todavía (`not-decided-yet`), lo que impide confirmar condiciones de uso comercial.
- Los datos de entrenamiento se generaron con Krea 2 y la model card del dataset remite a los términos de Krea para uso comercial; hay que verificar dichos términos antes de cualquier uso comercial del modelo o de sus salidas.
- El prompt de texto se procesa con CLIP ViT-B/32, principalmente en inglés; no se documentan capacidades multilingües.
- No hay información publicada sobre sesgos demográficos o culturales del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harryfrz/pixy
- Dataset de entrenamiento: https://huggingface.co/datasets/Angais/pixel-art-atlas-1.4m
- Codificador de texto CLIP: https://huggingface.co/openai/clip-vit-base-patch32
- Documentación de onnxruntime-web: https://onnxruntime.ai/docs/tutorials/web/
- Modelo de inspiración: https://huggingface.co/thejagstudio/tessera-small
- Paletas predefinidas (Lospec): https://lospec.com/palette-list
