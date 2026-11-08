# gwenn-ha-dev/Siliconed

## Resumen

Siliconed no es un modelo de IA en sentido estricto, sino una aplicación nativa para macOS (Apple silicon) que permite generar y editar imágenes localmente con modelos de pesos abiertos de terceros. La desarrolla el autor independiente gwenn-ha-dev y se distribuye como binario firmado y notarizado bajo licencia Apache 2.0. La versión documentada es la 0.21, publicada en noviembre de 2026.

La aplicación integra cinco modelos de generación y edición de imágenes (Krea 2 Turbo, Z-Image Turbo, Qwen-Image-2.1, Anima Turbo y MOSS-Image) implementados en Swift y Metal, con verificación etapa por etapa contra la implementación de referencia de diffusers. El objetivo es ofrecer inferencia local de alta fidelidad en Macs de consumo, gestionando un presupuesto de memoria fijo que permite ejecutar modelos grandes en equipos de 16 GB mediante streaming de pesos desde disco.

Su relevancia actual reside en la combinación de tres factores: inferencia completamente local sin dependencia de la nube, soporte de cuantizaciones propias (SQ de 4 bits e int8 convrot) y una verificación reproducible de que los pesos cuantizados producen resultados equivalentes a los originales. El repositorio de Hugging Face actúa como espejo byte a byte del binario publicado en GitHub.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Aplicación nativa macOS (Swift + Metal) que ejecuta modelos de difusión de terceros; no es un modelo propio |
| Parámetros totales | no disponible (depende del modelo subyacente: Krea 2 Turbo, Z-Image Turbo, Qwen-Image-2.1, Anima Turbo, MOSS-Image) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (text-to-image, no modelo de lenguaje) |
| Tipos de cuantización | SQ de 4 bits (propia), int8 × int8 (W8A8) para los Compacts, GGUF Q4_K_M y Q8_0 en versiones anteriores, bf16 y fp32 en decodificadores |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF (los modelos subyacentes); la app se distribuye como DMG |

## Arquitectura y entrenamiento

Siliconed no entrena modelos propios: es un motor de inferencia que implementa los grafos de difusión de cinco modelos publicados por terceros. El denoiser se ejecuta como un único flujo de trabajo en GPU, encolando las operaciones de cada bloque sin esperas intermedias y aprovechando el Neural Engine en paralelo para las filas que le corresponden. Cuando el presupuesto de memoria permite mantener los pesos residentes, se leen en su sitio en lugar de hacer streaming desde disco.

La innovación técnica principal es la gestión de memoria mediante un mapa de capacidad que mide, durante el propio render, qué combinaciones de precisión y streaming son viables en el hardware concreto. Los modelos "Compact" computan en int8 × int8 (W8A8) sobre las unidades tensoriales de la GPU, con la activación rotada y cuantizada a int8 por fila en la operación que la genera. Los modelos "Light" usan una cuantización propia de 4 bits (SQ) que sustituye a los GGUF Q4_K_M de terceros, con mayor fidelidad al modelo original. Los decodificadores se ejecutan en bf16 cuando el mapa determina que es más rápido. Todos los modelos se verifican contra diffusers mediante el comando `siliconed check`.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con cinco modelos: Krea 2 Turbo, Z-Image Turbo, Qwen-Image-2.1, Anima Turbo y MOSS-Image.
- Edición de imágenes (image-editing) con los modelos que la soportan.
- Ejecución local completa en Apple silicon (M1 y posteriores), sin envío de datos a la nube.
- Tres variantes de precisión por modelo: Standard (precisión completa), Compact (int8 W8A8) y Light (SQ de 4 bits).
- Gestión automática de presupuesto de memoria: ejecuta modelos de hasta 34 GB en un Mac de 16 GB mediante streaming desde disco.
- Prompt Lab con ventana independiente y edición de prompts.
- Historial de imágenes con borrado y recuperación mediante ⌘Z.
- Soporte de LoRA destilados a menos pasos (opción Beta "Choose Steps", por ejemplo Krea 2 a 4 pasos).
- Verificación reproducible de pesos contra la implementación de referencia (diffusers y ComfyUI).
- Descarga bajo demanda: la app no descarga nada hasta que el usuario elige un modelo y acepta su licencia.

## Casos de uso

- Generación de imágenes en local para equipos creativos: el modelo se ejecuta íntegramente en el Mac del usuario, sin coste por API ni dependencia de conectividad, adecuado para estudios que manejan material sensible que no puede salir de la máquina.
- Edición de imágenes en flujos de trabajo de diseño: con modelos de edición como Qwen-Image-2.1, el usuario puede modificar imágenes existentes de forma iterativa dentro de la app, con historial y recuperación de versiones.
- Prototipado rápido en Macs de consumo: gracias al presupuesto de memoria fijo, un Mac de 16 GB puede ejecutar el modelo más grande (34 GB en fp32) mediante streaming, lo que permite probar modelos de gama alta sin hardware de servidor.
- Investigación y reproducción de resultados: el comando `siliconed check` y la verificación contra diffusers y ComfyUI permiten a investigadores validar que las cuantizaciones propias reproducen los resultados de los pesos originales.
- Integración en pipelines de generación de assets: la app puede generar variaciones de imágenes para videojuegos, ilustración o marketing en lotes locales, con control de la precisión (Standard, Compact, Light) según el equilibrio deseado entre calidad y velocidad.
- Evaluación comparativa de modelos de difusión: al soportar cinco familias distintas con el mismo motor, permite comparar calidad y rendimiento de Krea 2, Z-Image, Qwen-Image, Anima y MOSS-Image sobre el mismo hardware.
- Uso educativo: la documentación de ingeniería (ENGINE.md, VERIFY.md) y la verificación etapa por etapa contra diffusers sirven como material para entender cómo se implementa un sampler de difusión en Metal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación del proyecto remite a una tabla de tiempos de render en la máquina de referencia (docs/ENGINE.md#numbers), pero los valores concretos no se incluyen en la información proporcionada.

## Requisitos de hardware

- Sistema operativo: macOS 26 o posterior, exclusivamente en Apple silicon (M1 y posteriores).
- VRAM: no aplica en el sentido de GPU dedicada; la app opera con un presupuesto de memoria unificado configurable. En el ejemplo documentado, mantiene un presupuesto de 10 GB en un Mac de 16 GB mientras hace streaming de 34 GB desde disco para el modelo más grande.
- GPU: se aprovechan las unidades tensoriales de la GPU Apple silicon y el Neural Engine en paralelo.
- Cabe en equipos de consumo: sí, en Macs de 16 GB o más, incluidos portátiles, gracias al streaming de pesos.
- Almacenamiento: los modelos Light ocupan 5,0 GB (Z-Image), 4,4 GB (Qwen-Image-2.1), 1,7 GB (Anima) y 7,6 GB (Krea 2); los Compact, 6,2 GB (Z-Image) y 2,6 GB (Anima).
- Despliegue: aplicación de escritorio nativa distribuida como DMG (12,2 MB), firmada y notarizada. No se documentan opciones de servidor como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de aplicación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Herramienta | Tipo | Modelos soportados | Plataforma | Licencia | Cuantización propia |
|---|---|---|---|---|---|
| Siliconed 0.21 | App de escritorio | Krea 2 Turbo, Z-Image Turbo, Qwen-Image-2.1, Anima Turbo, MOSS-Image | macOS 26+, Apple silicon | Apache 2.0 | Sí (SQ 4 bits, int8 W8A8) |
| ComfyUI | Interfaz de nodos | Amplio catálogo de modelos de difusión | Multiplataforma (Python) | GPL-3.0 (no confirmado en la información) | No (usa GGUF de terceros) |
| diffusers | Librería Python | Amplio catálogo | Multiplataforma | Apache 2.0 (no confirmado en la información) | No |
| Aplicaciones de escritorio para generación local en Mac | no disponible | no disponible | macOS | no disponible | no disponible |

La comparación con ComfyUI y diffusers se basa en que Siliconed verifica sus resultados contra ambas herramientas; los datos de licencia de las alternativas no se confirman en la información proporcionada.

## Limitaciones y advertencias

- Exclusivo de macOS 26 o posterior y Apple silicon: no funciona en Intel, Linux ni Windows.
- No es un modelo entrenado por el autor: la calidad de generación depende enteramente de los modelos subyacentes de terceros y de sus licencias individuales, que el usuario debe aceptar antes de descargar.
- Los modelos Light y Compact son cuantizaciones: aunque se verifican contra los originales, pueden presentar diferencias de fidelidad respecto a la precisión completa.
- Tras la actualización a 0.21, los modelos cuyos pesos cambiaron (Compacts de Z-Image y Anima, todos los Lights) dejan de renderizar hasta que se actualizan, lo que requiere intervención del usuario.
- La app no descarga modelos automáticamente: requiere selección manual y aceptación de licencia, lo que añade fricción en despliegues automatizados.
- Riesgo de alucinación visual inherente a los modelos de difusión: las imágenes generadas pueden contener artefactos, texto ilegible o elementos incoherentes según el modelo y el prompt.
- Sesgos: no se documentan sesgos específicos en la información disponible; los sesgos de los modelos subyacentes dependen de sus datasets de entrenamiento originales.
- Idiomas soportados: no disponibles; el rendimiento multilingüe de los prompts depende de los text encoders de cada modelo.
- Uso comercial: la licencia Apache 2.0 cubre la aplicación, pero el uso comercial de cada modelo subyacente está sujeto a su propia licencia, que el usuario debe verificar por separado.
- El repositorio de Hugging Face tiene 0 descargas y 0 likes, y un tamaño de 0,0 GB en la información disponible, lo que sugiere que el binario podría no estar alojado allí o que las métricas no reflejan su contenido real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gwenn-ha-dev/Siliconed
- Descarga del DMG: https://huggingface.co/gwenn-ha-dev/Siliconed/resolve/main/Siliconed.dmg?download=true
- Repositorio GitHub: https://github.com/gwenn-ha-dev/Siliconed
- Release v0.21: https://github.com/gwenn-ha-dev/Siliconed/releases/tag/v0.21
- Notas de versión: https://github.com/gwenn-ha-dev/Siliconed/blob/v0.21/docs/RELEASE-NOTES.md
- Verificación: https://github.com/gwenn-ha-dev/Siliconed/blob/v0.21/docs/VERIFY.md
- Documentación del motor: https://github.com/gwenn-ha-dev/Siliconed/blob/v0.21/docs/ENGINE.md
- Sitio web: https://gwenn-ha-dev.github.io/Siliconed/
- Pesos SQ de 4 bits: https://huggingface.co/gwenn-ha-dev (patrón `gwenn-ha-dev/<model>-Siliconed-SQ4`)
