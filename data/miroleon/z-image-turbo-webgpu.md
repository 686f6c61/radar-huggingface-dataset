# miroleon/z-image-turbo-webgpu

## Resumen

Z-Image Turbo for WebGPU es una conversión cuantizada del modelo de difusión texto-a-imagen Z-Image Turbo de Tongyi-MAI (Alibaba Group), empaquetada por el desarrollador independiente miroleon para ejecutarse íntegramente en el navegador mediante WebGPU. No se distribuye en un formato estándar (safetensors, GGUF o diffusers), sino en un conjunto de ficheros binarios propios que solo interpreta el motor de AI Showcase, la aplicación web para la que fue creada.

El objetivo es permitir la generación de imágenes en la tarjeta gráfica del visitante sin enviar datos a un servidor: el modelo incluye un codificador de texto Qwen3-4B truncado hasta la capa 34, el transformer de imagen de Z-Image Turbo y el decodificador VAE de FLUX.1, todo empaquetado en cuantizaciones de 4 y 8 bits con correcciones de bajo rango. El conjunto completo ocupa 13 GB en el repositorio, aunque el navegador solo necesita entre 6,3 y 9,2 GB según la variante.

Es relevante por su enfoque poco habitual: compresión agresiva con descomposición SVD aleatorizada más cuantización por grupos, verificación numérica contra diffusers y transformers, y ejecución local en hardware de consumo (probado en un Apple M4 Pro con 24 GB). La licencia Apache-2.0, heredada del modelo original, facilita su reutilización, aunque el formato propietario limita seriamente su adopción fuera de AI Showcase.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (transformer de imagen) con codificador de texto Qwen3-4B y VAE de FLUX.1 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (transformer y text encoder) y 8-bit (transformer); VAE en fp16 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | binario propietario (`.bin`) con índice `manifest.json`; no compatible con safetensors, GGUF ni diffusers |

## Arquitectura y entrenamiento

El modelo subyacente es Z-Image Turbo (Tongyi-MAI, revisión `f332072aa78be7aecdf3ee76d5c247082da564a6`), un modelo de difusión texto-a-imagen del que esta ficha no dispone de detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). La conversión de miroleon no reentrena ni modifica la arquitectura: se limita a comprimir los pesos y a reorganizarlos para el motor WebGPU de AI Showcase.

La innovación técnica está en el esquema de compresión. Cada capa lineal grande `W` del transformer se descompone en una parte de bajo rango `B A` (rango 32, obtenida por SVD aleatorizada, almacenada en fp16) más el residuo `W - B A`, codificado en 4 bits con escala y mínimo fp16 por grupo de 64 pesos; el conversor prueba varios rangos ligeramente más estrechos por grupo y conserva el de menor error. El error relativo medio por capa es 0,079 para el transformer de 4 bits, 0,0055 para el de 8 bits y 0,088 para el codificador de texto de 4 bits, y `manifest.json` documenta el error de cada capa. El codificador de texto conserva solo las capas 0 a 34 porque Z-Image lee el estado oculto tras la capa 34; el VAE conserva únicamente el decodificador. El conversor es `tools/convert_zimage.py` del repositorio AI Showcase.

## Capacidades

- Generación de imágenes a partir de descripciones en texto (pipeline `text-to-image`), con 8 pasos de muestreo según la model card.
- Ejecución local en el navegador sobre WebGPU, sin backend remoto.
- Soporte de LoRAs de Z-Image Turbo (formato ai-toolkit y Kohya) sin fusionarlas en los pesos.
- Dos niveles de calidad/consumo de memoria: transformer de 4 bits (3,82 GB) o de 8 bits (6,67 GB).
- Idiomas de prompting: inglés y chino.
- Compatibilidad numérica verificada con diffusers 0.43.0 y transformers 5.23.0 (similitud coseno 1,000000 en codificador de texto, un paso del transformer y decodificador VAE).
- No se documentan capacidades de tool calling, agentes, visión de entrada, audio ni modo de razonamiento.

## Casos de uso

- Demostración interactiva de texto-a-imagen en una web: el visitante escribe un prompt y el modelo genera una imagen de 512 x 512 en unos 50 segundos en un Apple M4 Pro, sin coste de servidor ni transferencia de datos a terceros.
- Aplicaciones con requisitos de privacidad: al ejecutarse en la GPU del cliente, los prompts y las imágenes no salen del dispositivo, lo que encaja en entornos con datos sensibles.
- Personalización con LoRAs en el navegador: la página puede cargar estilos o conceptos entrenados con ai-toolkit o Kohya y aplicarlos sin re-fusionar pesos, útil para estudios de diseño que quieran previsualizar variantes.
- Prototipado rápido de ideas visuales: la variante de 4 bits requiere 6,3 GB y permite iterar en portátiles con GPU integrada razonablemente potente.
- Educación y divulgación técnica: sirve para mostrar en vivo cómo funciona un modelo de difusión cuantizado y qué supone la compresión 4-bit frente a 8-bit en calidad y memoria.
- Investigación sobre cuantización: los errores por capa en `manifest.json` permiten analizar el impacto de la descomposición de bajo rango más cuantización por grupos en un transformer de difusión real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento son medidas de la model card:

| Metrica | 4-bit | 8-bit |
|---|---|---|
| Imagen 512 x 512, 8 pasos | ~51 s | ~47 s |
| Memoria de GPU usada | 5,9 GB | 8,8 GB |
| Tamano del transformer | 3,82 GB | 6,67 GB |
| Error relativo medio por capa | 0,079 | 0,0055 |

Medición en Chrome sobre Apple M4 Pro con 24 GB de memoria unificada, el 20 de noviembre de 2026.

## Requisitos de hardware

- VRAM estimada: 5,9 GB con transformer de 4 bits y 8,8 GB con 8 bits, según las medidas del autor; el conjunto de ficheros necesario es de 6,3 GB y 9,2 GB respectivamente.
- GPU recomendadas: no se especifican modelos concretos; el autor valida en Apple M4 Pro (24 GB). Cualquier GPU con soporte WebGPU estable y al menos 6-9 GB de memoria gráfica disponible es el requisito implícito.
- GPU de consumo: previsiblemente compatible con tarjetas de 8 GB o más para la variante 4-bit; la de 8 bits exige alrededor de 9 GB, lo que descarta muchas tarjetas de 8 GB.
- Despliegue: exclusivamente mediante el motor de AI Showcase (`src/lib/zimage/`). No es compatible con vLLM, llama.cpp, Ollama, TGI, diffusers ni ComfyUI; para esos entornos debe usarse el modelo original.
- Latencia y throughput: ~51 s (4-bit) y ~47 s (8-bit) por imagen de 512 x 512 en 8 pasos en el hardware de referencia; no se publican cifras para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| Z-Image Turbo for WebGPU (esta ficha) | no disponible | no disponible | binario propietario | Apache-2.0 | Si, via WebGPU |
| Tongyi-MAI/Z-Image-Turbo (original) | no disponible | no disponible | formato estandar de diffusers | Apache-2.0 | No |
| FLUX.1 (Black Forest Labs) | no disponible | no disponible | safetensors | Apache-2.0 (autoencoder) / otras variantes | No |
| Qwen3-4B (codificador de texto) | 4 000 M | no disponible | safetensors | Apache-2.0 | No |

No se dispone de datos de benchmarks que permitan comparar la calidad de imagen frente a alternativas; la comparación se limita a formato, licencia y viabilidad de despliegue.

## Limitaciones y advertencias

- Formato no estándar: los `.bin` y el `manifest.json` solo los lee el motor de AI Showcase; no funcionan en diffusers, ComfyUI ni otras herramientas.
- Requiere WebGPU: sin soporte de WebGPU en el navegador, el modelo no se puede ejecutar.
- Idiomas limitados a inglés y chino; el rendimiento con prompts en castellano no está documentado.
- La cuantización 4-bit introduce un error relativo medio de 0,079 por capa; el autor indica que las imágenes difieren del 8-bit solo en detalles pequeños, pero no cuantifica la degradación subjetiva.
- Riesgo de sesgos y de representación estereotipada de personas, heredado de los datos de entrenamiento del modelo original.
- Posibilidad de generar imágenes de personas reales; el autor remite a las directrices del modelo original y a la legislación aplicable.
- No se documentan salvaguardas, filtros de contenido ni mecanismos de moderación en el motor.
- Uso comercial permitido por Apache-2.0, pero conviene revisar `NOTICE` y las licencias de los componentes (Qwen3-4B, VAE de FLUX.1) antes de redistribuir.
- Repositorio sin descargas ni interacciones en el momento de la consulta; madurez y mantenimiento del proyecto no verificables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/miroleon/z-image-turbo-webgpu
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Codificador de texto Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio del VAE FLUX.1: https://github.com/black-forest-labs/flux
- Repositorio AI Showcase (motor y conversor): https://github.com/miroleon/ai-showcase
