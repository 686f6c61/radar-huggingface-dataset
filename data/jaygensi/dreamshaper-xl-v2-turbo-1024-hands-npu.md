# jaygensi/dreamshaper-xl-v2-turbo-1024-hands-npu

## Resumen

DreamShaper XL v2 Turbo + "nice hands" NPU es una conversión experimental del modelo de difusión DreamShaper XL v2 Turbo (fine-tune de Stable Diffusion XL base 1.0, obra de Lykon) a binarios de contexto QNN para la NPU Hexagon de los chips Snapdragon de Qualcomm. Lo publica el usuario jaygensi y está pensado específicamente para la opción de imagen "NPU XL" de la aplicación Android LATAS, que carga los seis binarios con su propio motor (`npu_engine.cpp`, `sd_version = 3`).

La particularidad de esta variante frente a la versión de 768 px es doble: por un lado, los grafos están compilados para un latente de 128x128, es decir, imágenes de 1024x1024 píxeles; por otro, el UNet lleva fusionado (merged) el LoRA deslizador `ntc-ai/SDXL-LoRA-slider.nice-hands` con fuerza 2.0, de modo que no se puede desactivar. La cuantización es w8a16 (pesos de 8 bits, activaciones de 16 bits en coma fija).

Se trata de un artefacto de despliegue, no de un modelo entrenado desde cero: no hay pesos en safetensors ni GGUF, sino seis ficheros `.bin` propietarios de QNN empaquetados en un zip de unos 3,7 GB. El autor advierte explícitamente de que es experimental: la única verificación realizada es que el compilador de Qualcomm acepta los cuatro grafos de 1024 px para el Snapdragon 8 Gen 2 (Hexagon v73), sin simulación a este tamaño ni ejecución en un teléfono real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Stable Diffusion XL (UNet + doble text encoder CLIP + VAE), convertida a grafos QNN |
| Parámetros totales | UNet de 2,6 B (el resto de componentes no se detalla) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; ventana de texto de 77 tokens por encoder |
| Tipos de cuantización | w8a16 (pesos de 8 bits, activaciones uint16 de coma fija con escala y offset) |
| Idiomas soportados | no disponible (prompts en lenguaje natural, sin lista declarada) |
| Licencia | openrail++ (LoRA nice-hands original bajo MIT) |
| Formato de pesos | binarios de contexto QNN (`.bin`), empaquetados en zip por chip |
| Resolución de salida | 1024x1024 píxeles (latente 128x128) |
| Chip objetivo | Snapdragon 8 Gen 2 (SM8550), Hexagon v73, QNN soc id 43 |
| Tamaño del repo | 3,8 GB |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

El modelo subyacente es DreamShaper XL v2 Turbo, un fine-tune de SDXL base 1.0 que emplea destilación por turbo para permitir la generación con muy pocos pasos de muestreo. La arquitectura es la estándar de SDXL: un UNet de 2,6 B de parámetros, dos codificadores de texto (CLIP ViT-L/14 y OpenCLIP ViT-bigG/14) y un VAE. Sobre esta base, el autor ha fusionado el LoRA `nice-hands` en los pesos del UNet con fuerza 2,0 antes de la conversión, y posteriormente ha troceado el UNet en tres grafos en los límites de bloques, de forma que cada uno tenga el tamaño de un UNet de SD 1.5.

La conversión a QNN implica cuantización w8a16 y la fijación de un contrato de tensores entre grafos: los tensores que cruzan un corte tienen nombres fijos y se pasan por nombre (todos los tensores 4D en formato NHWC), con escala y offset almacenados en los binarios. Como las codificaciones de los tensores de corte difieren entre grafos, el runtime debe des-cuantizar y re-cuantizar. Los codificadores de texto se reutilizan de las builds de 768 px y el VAE divide el latente por 0,13025. El muestreo recomendado es DPM++ 2M SDE sobre la tabla de sigmas de SD con el schedule Align Your Steps (AYS) de NVIDIA, entre 4 y 8 pasos (la app usa 6) y CFG 2. No se documenta el proceso de entrenamiento del modelo original ni el volumen de datos empleado.

## Capacidades

- Generación de imágenes texto-a-imagen a 1024x1024 píxeles sobre NPU Hexagon de Snapdragon.
- Generación con pocos pasos de muestreo (4 a 8 pasos recomendados, 6 en la app), gracias a la destilación turbo del modelo base.
- Soporte de prompt negativo con CFG 2 (el UNet se ejecuta dos veces por paso).
- Control de la calidad de las manos mediante el LoRA `nice-hands` fusionado, aunque con efecto limitado e inconsistente según el autor.
- Ejecución en el motor propio de la app LATAS (`npu_engine.cpp`), así como en cualquier runtime que respete el contrato de tensores documentado.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de los modelos de lenguaje; es exclusivamente un modelo de difusión para imagen.

## Casos de uso

- Generación de imágenes en dispositivos móviles con Snapdragon 8 Gen 2: el modelo está compilado para la NPU Hexagon v73 de ese chip, lo que permite ejecutar la difusión en local sin depender de la nube, siempre que se use un runtime compatible con QNN.
- Integración en la app LATAS: seleccionando la opción "NPU XL" de imagen, la app carga los seis binarios con su motor y genera imágenes de 1024 px con 6 pasos y CFG 2.
- Prototipado de pipelines de imagen en el dispositivo: desarrolladores que quieran validar el contrato de tensores (nombres, formas, escalas y offsets) pueden usar estos binarios como referencia de implementación de un runtime QNN para SDXL.
- Generación de ilustraciones y retratos con manos visibles: el LoRA fusionado reduce brazos enredados y manos extra en algunas semillas, por lo que resulta algo más adecuado que el modelo plano para retratos de cuerpo entero, aunque el autor advierte de que las manos siguen siendo el punto débil.
- Evaluación comparativa de cuantización w8a16 en NPU: sirve para medir la pérdida de calidad frente al modelo fp32 original con las mismas semillas, tal como hizo el autor en su comparación.
- Demostraciones de inferencia local en ferias o entornos sin conectividad: al ejecutarse íntegramente en el dispositivo, no requiere red ni servidores.
- Investigación sobre despliegue de modelos de difusión en hardware heterogéneo: el troceado del UNet en tres grafos con tensores de corte es un ejemplo práctico de partición de modelos grandes para NPU con memoria limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no aporta métricas de calidad (FID, CLIP score), latencia ni consumo de memoria; únicamente indica que la atención tiene aproximadamente tres veces más trabajo por paso que a 768 px y que se espera que cada paso tarde claramente más, sin cifras concretas.

## Requisitos de hardware

- NPU: Snapdragon 8 Gen 2 (SM8550), Hexagon v73, QNN soc id 43. Es el único chip con build disponible.
- Memoria: no disponible; el autor no ha simulado ni medido el uso de memoria a 1024 px.
- GPU: no aplica; los binarios QNN están pensados para la NPU, no para GPU de escritorio.
- Consumer GPU: no aplica; no hay pesos en safetensors ni GGUF para ejecutar en RTX 4090 u otras GPU de consumo.
- Despliegue: runtime compatible con QNN context binaries que respete el contrato de tensores documentado (la app LATAS con su motor `npu_engine.cpp` es la referencia).
- Latencia y throughput: no disponibles; no se ha ejecutado en ningún teléfono.

## Comparativa con modelos similares

| Modelo | Formato | Resolución | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jaygensi/dreamshaper-xl-v2-turbo-1024-hands-npu (este) | Binarios QNN | 1024x1024 | w8a16 | openrail++ | Solo Snapdragon 8 Gen 2 |
| jaygensi/dreamshaper-xl-v2-turbo-npu | Binarios QNN | 768x768 | w8a16 | openrail++ | Varias builds de 768 px, sin LoRA |
| jaygensi/dreamshaper-xl-v2-turbo-hands-npu | Binarios QNN | 768x768 | w8a16 | openrail++ | Varias builds de 768 px, con LoRA |
| Lykon/dreamshaper-xl-v2-turbo | Safetensors (fp16/fp32) | 1024x1024 | Original sin cuantizar | openrail++ | GPU y CPU, ecosistema Diffusers |

## Limitaciones y advertencias

- Modelo experimental: no se ha ejecutado en ningún teléfono ni simulado a 1024 px; la única verificación es que el compilador acepta los grafos para Hexagon v73.
- Solo existe build para Snapdragon 8 Gen 2 (SM8550); un binario de contexto QNN solo carga en la generación de NPU para la que fue compilado.
- El LoRA `nice-hands` está fusionado con fuerza 2,0 y no se puede desactivar; su efecto es inconsistente (mejoró 2 de 4 semillas en imágenes de abrazos y en una de ellas empeoró el rostro).
- Las manos siguen siendo el punto débil de SDXL a 768 px; el autor advierte de que no deben esperarse manos perfectas.
- La memoria y la velocidad a 1024 px son desconocidas; la atención tiene unas tres veces más trabajo por paso que a 768 px.
- Riesgo de sesgos y alucinaciones visuales propio de los modelos de difusión: el modelo puede generar anatomías incorrectas, texto ilegible y composiciones incoherentes, sin que se documenten sesgos específicos.
- Licencia openrail++ con restricciones de uso comercial; el LoRA original es MIT, pero la licencia del conjunto es openrail++.
- El contrato de tensores es estricto: los tokens de relleno difieren entre codificadores (49407 frente a 0) y el runtime debe des-cuantizar y re-cuantizar los tensores de corte, lo que exige una implementación cuidadosa.
- No hay pesos en safetensors ni GGUF, por lo que no se puede usar con Diffusers, vLLM, llama.cpp ni Ollama.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jaygensi/dreamshaper-xl-v2-turbo-1024-hands-npu
- Build de 768 px sin LoRA: https://huggingface.co/jaygensi/dreamshaper-xl-v2-turbo-npu
- Build de 768 px con LoRA: https://huggingface.co/jaygensi/dreamshaper-xl-v2-turbo-hands-npu
- Modelo base DreamShaper XL v2 Turbo: https://huggingface.co/Lykon/dreamshaper-xl-v2-turbo
- SDXL base 1.0: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- LoRA nice-hands original: https://huggingface.co/ntc-ai/SDXL-LoRA-slider.nice-hands
