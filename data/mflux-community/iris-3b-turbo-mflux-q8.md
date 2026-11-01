# mflux-community/iris-3b-turbo-mflux-q8

## Resumen

Iris-3B-Turbo MFlux Q8 es una conversión comunitaria del modelo de generación de imágenes speridlabs/iris-3b, empaquetada en formato MLX y cuantizada a 8 bits para su ejecución local en Apple Silicon. El repositorio lo publica mflux-community, un colectivo que adapta modelos generativos de última generación al runtime MFlux, una implementación nativa en MLX mantenida por Filip Strand. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos originales solo han sido convertidos a MLX y cuantizados con cuantización afín de 8 bits en el codificador de texto, el transformer y el VAE.

El modelo resuelve el problema de ejecutar generación texto-a-imagen de forma local en Macs sin depender de servicios en la nube ni de CUDA, aprovechando la GPU unificada de los chips Apple. Con un tamaño de repositorio de 8,0 GB en Q8 (frente a 14,0 GB en BF16 y 5,1 GB en Q4), está pensado para equipos con memoria unificada moderada. La relevancia actual radica en la proliferación de alternativas abiertas de difusión que pueden correr en hardware de consumo, y en la existencia de un ecosistema de cuantizaciones comunitarias que reduce la barrera de entrada.

La información pública disponible sobre esta conversión es limitada: la model card se centra en instrucciones de uso y en la tabla de cuantizaciones, sin detallar arquitectura interna del modelo base, datos de entrenamiento ni resultados de benchmarks. Esta ficha refleja exclusivamente los datos verificables en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen (detalles internos del modelo base no disponibles); pesos convertidos a MLX |
| Parametros totales | 3B (segun el nombre del modelo base, speridlabs/iris-3b); desglose no disponible |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible (modelo de imagen; no se documenta ventana de texto) |
| Tipos de cuantizacion | Q8 (este repo), BF16, Q4; Q3, Q5 y Q6 no publicados |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX (cuantizacion afin de 8 bits) |

## Arquitectura y entrenamiento

El modelo base speridlabs/iris-3b es un generador texto-a-imagen de 3B de parámetros. La información proporcionada no detalla su arquitectura interna (tipo de backbone, mecanismo de atención, schedule de difusión ni variante de codificador de texto o VAE). Lo que sí se documenta es el proceso de conversión: los pesos originales se transformaron a MLX con MFlux 0.24.0 el 27 de octubre de 2026, aplicando cuantización afín de 8 bits de forma uniforme sobre el codificador de texto, el transformer y el VAE. El nivel de cuantización queda almacenado en los propios pesos, de modo que no es necesario pasar el flag `--quantize` en tiempo de inferencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas del modelo original. Tampoco se documentan técnicas de decodificación especulativa ni optimizaciones de atención más allá de las que aporta el runtime MFlux. La etiqueta "Turbo" en el nombre sugiere una variante optimizada para pocos pasos de muestreo, pero este extremo no se confirma en la información disponible.

## Capacidades

- Generación de imágenes a partir de prompts de texto (pipeline `text-to-image`).
- Ejecución local nativa en Apple Silicon mediante MLX, sin necesidad de CUDA.
- Resoluciones configurables por línea de comandos; el ejemplo de la model card usa 1024x1024.
- Control de semilla (`--seed`) para reproducibilidad de la generación.
- Cuantización integrada en los pesos: no requiere flags adicionales en inferencia.
- Compatibilidad con el ecosistema MFlux (`mflux-generate-iris`) y descarga automática de pesos desde Hugging Face.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking; se trata de un modelo puramente generativo de imagen.

## Casos de uso

- Prototipado rápido de assets visuales en local: un desarrollador en un Mac con Apple Silicon puede generar imágenes de 1024x1024 con un solo comando, sin configurar CUDA ni contenedores, gracias a la integración nativa con MLX.
- Iteración de prompts en flujos de diseño: el control de semilla y la ejecución local permiten comparar variaciones de un mismo prompt de forma reproducible, útil para explorar direcciones creativas antes de fijar una propuesta.
- Generación de ilustraciones para documentación técnica o blogs: con 8,0 GB en Q8, el modelo cabe en equipos de memoria unificada moderada y permite crear imágenes de acompañamiento sin salir del portátil.
- Automatización de pipelines creativos en macOS: al poder descargar los pesos localmente (`hf download`) y pasarlos con `--model`, se puede integrar en scripts o tareas programadas que generen lotes de imágenes de forma offline.
- Evaluación comparativa de cuantizaciones: disponer de BF16, Q8 y Q4 del mismo modelo base permite medir el compromiso entre calidad visual y huella de memoria en hardware Apple, un caso habitual en investigación aplicada sobre compresión de modelos generativos.
- Demos y pruebas de concepto en entornos sin GPU dedicada: permite mostrar generación texto-a-imagen en un Mac de desarrollo estándar, útil para validar ideas antes de escalar a infraestructura con GPUs.
- Experimentación educativa con difusión en MLX: sirve como ejemplo práctico de conversión y cuantización de un modelo de difusión a un runtime alternativo, útil para quienes estudian portabilidad de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 8,0 GB para Q8 (tamaño del repositorio); 14,0 GB para BF16; 5,1 GB para Q4. A esta cifra hay que sumar el overhead del runtime MLX y de las activaciones durante la generación.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). El modelo está empaquetado específicamente para MLX y no se distribuye para CUDA.
- ¿Cabe en GPU de consumo? No aplica a GPUs NVIDIA/AMD: la conversión es exclusiva para Apple Silicon. En Macs, Q8 requiere equipos con al menos 16 GB de memoria unificada recomendable; Q4 (5,1 GB) amplía la compatibilidad a configuraciones de 8-16 GB.
- Opciones de despliegue: MFlux (instalación con `uv tool install --upgrade mflux`), mediante el comando `mflux-generate-iris`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no son aplicables a un modelo de difusión en MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato/runtime | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iris-3b-turbo-mflux-q8 (este) | 3B | MLX, Q8 | 8,0 GB | Apache 2.0 | Hugging Face (mflux-community) |
| iris-3b-turbo-mflux-bf16 | 3B | MLX, BF16 | 14,0 GB | Apache 2.0 | Hugging Face (mflux-community) |
| iris-3b-turbo-mflux-q4 | 3B | MLX, Q4 | 5,1 GB | Apache 2.0 | Hugging Face (mflux-community) |
| speridlabs/iris-3b (original) | 3B | Pesos originales | No disponible | Apache 2.0 | Hugging Face (speridlabs) |

No se dispone de información sobre otros modelos de difusión comparables (por ejemplo, alternativas de 3B parámetros en otros runtimes) en la documentación proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Conversión no oficial: se trata de una adaptación comunitaria de mflux-community, no de un lanzamiento de los autores originales; los fallos de conversión o cuantización no están respaldados por speridlabs.
- Cuantización con pérdida: el paso a 8 bits puede introducir degradaciones de calidad visual frente a BF16, especialmente en detalles finos, texto dentro de la imagen o composiciones complejas; no se documentan evaluaciones comparativas.
- Exclusivo para Apple Silicon: no es utilizable en GPUs NVIDIA, AMD ni en CPU de forma directa a través de este repositorio; limita su uso en servidores de producción convencionales.
- Idiomas no documentados: se desconoce qué idiomas maneja el codificador de texto y con qué calidad; los prompts en castellano podrían rendir peor que en inglés.
- Riesgo de sesgos y alucinación visual: como todo modelo de difusión entrenado con datos web a gran escala, puede reproducir estereotipos y generar contenido inexacto o no solicitado; no se documentan mitigaciones.
- Licencia Apache 2.0: permite uso comercial, pero se remite a la model card original para términos completos y posibles restricciones adicionales; conviene revisarla antes de desplegar en producción.
- Sin benchmarks ni métricas de rendimiento publicadas: no es posible estimar FID, CLIP score, latencia ni throughput a partir de la información disponible.
- Fecha de creación futura en los metadatos (2026-10-27): conviene verificar la vigencia y el estado de mantenimiento del repositorio antes de adoptarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mflux-community/iris-3b-turbo-mflux-q8
- Modelo base original: https://huggingface.co/speridlabs/iris-3b
- Variante BF16: https://huggingface.co/mflux-community/iris-3b-turbo-mflux-bf16
- Variante Q4: https://huggingface.co/mflux-community/iris-3b-turbo-mflux-q4
- Repositorio MFlux: https://github.com/filipstrand/mflux
- Organización MFlux-Community: https://huggingface.co/mflux-community
