# brownvc/R3GAN2-WebGPU

## Resumen

R3GAN2-WebGPU es un paquete de pesos del generador R3GAN2 empaquetados específicamente para su ejecución en el navegador mediante WebGPU. Lo publica el usuario brownvc (equipo del proyecto R3GAN2 de la Universidad de Brown) y acompaña al artículo *Magnitude-preserving Discriminators Enable Efficient GANs*, presentado en NeurIPS 2026 por Nick Yiwen Huang, Jackson Woodleigh, Aaron Gokaslan, Xinjie Yi y James Tompkin. No es un modelo de lenguaje ni un transformer generativo de propósito general: es una colección de generadores GAN incondicionales de imágenes de 256×256.

El repositorio contiene los generadores de ImageNet 256×256 en tres escalas (S con 17 M de parámetros, M con 61 M y L con 131 M), junto con sus embeddings de clase, y un generador de FFHQ 256×256 en espacio de píxeles. Los pesos de ImageNet operan en el espacio latente del autoencoder de FLUX.2 y se decodifican con TAEF2 (rápido) o con el decodificador completo de FLUX.2 exportado a ONNX. El paquete está pensado para cargarse desde la página del proyecto en el navegador, no para PyTorch; los checkpoints nativos se publicarán junto con el código.

Su relevancia es doble: por un lado, demuestra una arquitectura GAN eficiente con discriminadores que preservan la magnitud; por otro, es un ejemplo práctico de despliegue de generación de imágenes en el cliente sin servidor, usando WebGPU y formatos binarios empaquetados. El tamaño total del repositorio es de 1,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAN (generador + discriminador con preservación de magnitud); los generadores de ImageNet operan en el espacio latente del autoencoder de FLUX.2 |
| Parametros totales | ImageNet S: 17 M; ImageNet M: 61 M; ImageNet L: 131 M; FFHQ: no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de generación de imágenes, no de texto) |
| Tipos de cuantizacion | no disponible (pesos empaquetados en `.bin` para WebGPU; no se documentan cuantizaciones estándar) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Mixta: ImageNet CC BY-NC 4.0 (decodificador TAEF2 MIT); FFHQ CC BY-NC-SA 4.0; `vae_dec.onnx` Apache 2.0; licencia global declarada `r3gan2-webgpu-mixed` |
| Formato de pesos | `.bin` empaquetados para WebGPU, `.json` de configuración y `vae_dec.onnx` (ONNX) |

## Arquitectura y entrenamiento

R3GAN2 es una GAN cuyo componente diferenciador clave, según el título del artículo, es el uso de discriminadores que preservan la magnitud (*magnitude-preserving discriminators*), lo que permite entrenar GANs de forma más eficiente. Los generadores de ImageNet generan latentes en el espacio del autoencoder de FLUX.2, que luego se decodifican a imágenes de 256×256 mediante TAEF2 o el decodificador completo de FLUX.2. El generador de FFHQ opera directamente en espacio de píxeles. Las tres variantes de ImageNet (S, M, L) cubren un rango de 17 M a 131 M de parámetros, lo que permite elegir entre velocidad y calidad.

No se dispone de información sobre el número de tokens o imágenes de entrenamiento, la composición exacta del dataset más allá de los nombres (ImageNet 256×256 y FFHQ 256×256), ni sobre el uso de técnicas como RLHF o DPO (no aplicables a una GAN). Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal, que no tienen sentido en este tipo de arquitectura. Los pesos publicados aquí están repaquetados para WebGPU y no son los checkpoints de PyTorch, que se publicarán con el código.

## Capacidades

- Generación incondicional de imágenes de 256×256 en el navegador mediante WebGPU.
- Generación condicionada por clase en ImageNet 256×256 (gracias a los embeddings de clase incluidos).
- Generación de rostros en FFHQ 256×256 en espacio de píxeles.
- Tres escalas de generador (S, M, L) para equilibrar coste y calidad.
- Decodificación de latentes con TAEF2 (rápida) o con el decodificador completo de FLUX.2 vía ONNX.
- Incluye salidas de referencia (`*_test*.bin`) para autocomprobación de la demo.
- No soporta tool calling, agentes, razonamiento multi-step ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Demos interactivas en el navegador: cargar los `.bin` y generar imágenes de ImageNet o FFHQ sin backend, aprovechando WebGPU para inferencia en el cliente.
- Prototipado de interfaces de generación de imágenes: usar los generadores S o M para iterar rápido en la UI antes de pasar a modelos mayores.
- Evaluación de técnicas GAN eficientes: comparar las variantes S, M y L para estudiar el compromiso entre parámetros y calidad visual.
- Investigación sobre decodificadores ligeros: probar TAEF2 frente al decodificador completo de FLUX.2 sobre los mismos latentes.
- Educación y divulgación: mostrar el funcionamiento interno de una GAN y su despliegue en WebGPU en cursos o talleres.
- Pruebas de autocomprobación: usar los archivos `*_test*.bin` para verificar que la implementación WebGPU reproduce las salidas de referencia.
- Generación de caras sintéticas para experimentos controlados (con las restricciones de licencia indicadas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en navegador con WebGPU; requiere un navegador compatible (Chrome/Edge con WebGPU habilitado, etc.).
- VRAM estimada: no disponible de forma explícita; los modelos son pequeños (17–131 M de parámetros) y el repositorio completo pesa 1,2 GB, por lo que deberían caber en GPUs de consumo actuales.
- GPU recomendadas: no disponible; cualquier GPU con soporte WebGPU estable debería poder ejecutar las variantes S y M; la L requerirá más memoria.
- Cabe en GPU de consumo: probablemente sí para S y M; no confirmado para L.
- Opciones de despliegue: WebGPU en navegador (principal); el `vae_dec.onnx` puede ejecutarse con runtimes ONNX (onnxruntime, etc.). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| R3GAN2-WebGPU (S/M/L) | 17 M / 61 M / 131 M | no aplica | 256×256 | Mixta (CC BY-NC, MIT, Apache 2.0) | Pesos WebGPU en HF; PyTorch pendiente |
| StyleGAN2 (referencia) | no disponible en la informacion | no aplica | 256×256+ | no disponible en la informacion | no disponible en la informacion |
| Otras GAN de ImageNet 256 | no disponible en la informacion | no aplica | 256×256 | no disponible en la informacion | no disponible en la informacion |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Los pesos están empaquetados para WebGPU y no son utilizables directamente en PyTorch; los checkpoints nativos aún no se han publicado.
- Licencia mixta y restrictiva: los generadores de ImageNet son CC BY-NC 4.0 y el de FFHQ CC BY-NC-SA 4.0, lo que impide uso comercial sin permiso; solo el decodificador FLUX.2 (`vae_dec.onnx`) es Apache 2.0 y TAEF2 es MIT.
- Al ser modelos GAN, pueden reproducir sesgos presentes en ImageNet y FFHQ (por ejemplo, en la representación de rostros y clases).
- Riesgo de artefactos y de imágenes de baja calidad en las variantes pequeñas (S).
- No hay información sobre idiomas ni sobre capacidades de texto, por lo que no debe emplearse fuera de la generación de imágenes.
- No se documentan límites de contexto ni de resolución más allá de 256×256.
- Para producción, conviene verificar la licencia específica de cada archivo antes de distribuirlo o integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/brownvc/R3GAN2-WebGPU
- Página del proyecto y demos: https://cs.brown.edu/people/blank/jtompki1/r3gan2/
- Código: https://github.com/brownvc/R3GAN2
- Licencia CC BY-NC 4.0: https://creativecommons.org/licenses/by-nc/4.0/
- Licencia CC BY-NC-SA 4.0: https://creativecommons.org/licenses/by-nc-sa/4.0/
