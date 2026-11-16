# fnmee/dalle-mini-js

## Resumen

dalle-mini-js es una conversión de los pesos de DALL·E Mini y su VQGAN a formato fp16 safetensors, empaquetados específicamente para su ejecución en el navegador mediante WebGPU y la librería jax-js. El modelo original fue desarrollado por Boris Dayma et al. y publicado bajo licencia Apache-2.0; esta versión es un port mantenido por el usuario fnmee que preserva la arquitectura y los tensores del modelo original, adaptando el formato de almacenamiento y añadiendo artefactos auxiliares para la inferencia en cliente.

El modelo resuelve la generación de imágenes a partir de descripciones textuales (text-to-image) sin necesidad de infraestructura de servidor, ya que toda la inferencia ocurre en el navegador del usuario. Combina un codificador de texto BART de 12 capas y 1024 dimensiones con un decodificador de imagen BART que genera tokens visuales de un vocabulario de 16.384 entradas, posteriormente reconstruidos a píxeles de 256×256 por un decodificador VQGAN.

Su relevancia actual radica en la posibilidad de desplegar generación de imágenes de forma totalmente local y privada en el navegador, eliminando costes de cómputo en servidor y facilitando demos interactivas. No obstante, se trata de un modelo heredado (DALL·E Mini es de 2022) con calidad de imagen limitada en comparación con los modelos de difusión contemporáneos, y esta ficha se basa exclusivamente en la información disponible en el repositorio, que es escasa en cuanto a métricas y datos de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador-decodificador BART (transformer) + decodificador VQGAN |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp16 (transformer y VQGAN); VQGAN debe ejecutarse en float32 |
| Idiomas soportados | no disponible (el tokenizador es BPE; el modelo original se entrenó principalmente con texto en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (fp16) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de DALL·E Mini: un codificador de texto BART de 12 capas con dimensión 1024 que procesa la descripción textual tokenizada con BPE, y un decodificador de imagen BART de 12 capas que genera secuencias de tokens visuales sobre un vocabulario de 16.384 entradas. Estos tokens se transforman en una rejilla de 16×16 que el decodificador VQGAN convierte en una imagen de 256×256 píxeles. El repositorio incluye además un `preview_head` (mapeo lineal desde las características del bloque intermedio del VQGAN a colores de previsualización de 16×16) y `token_colors.bin` (color RGB medio de cada token visual, 16.384 × 3 uint8), ambos entrenados específicamente para dalle-js.

La conversión desde el modelo original preserva los nombres y el layout de los tensores de PyTorch; los checkpoints del transformer ya estaban en fp16, por lo que esos ficheros son exactos, mientras que los pesos del VQGAN se redondearon desde fp32. Los LayerNorm que los checkpoints originales omiten (por `use_scale=False` en Flax) se escriben explícitamente como unos. No se dispone de información en el repositorio sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resolución de salida de 256×256 píxeles.
- Codificación de texto mediante tokenizador BPE y codificador BART de 12 capas.
- Generación autoregresiva de tokens visuales sobre un vocabulario de 16.384 entradas.
- Previsualización progresiva de la imagen mediante `preview_head` y `token_colors.bin`, útil para mostrar resultados parciales durante la inferencia.
- Ejecución íntegra en el navegador sobre WebGPU mediante jax-js, sin backend de servidor.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo de pensamiento.

## Casos de uso

- Demos interactivas en navegador: el modelo puede integrarse en una página web que genere imágenes a partir de texto sin enviar datos a un servidor, aprovechando la inferencia WebGPU en el cliente.
- Aplicaciones centradas en privacidad: al ejecutarse localmente en el navegador, las descripciones del usuario no abandonan su dispositivo, lo que resulta adecuado para prototipos con requisitos de confidencialidad.
- Prototipado rápido de interfaces text-to-image: permite validar flujos de UX (entrada de prompt, previsualización progresiva, descarga de imagen) antes de migrar a modelos de mayor calidad en servidor.
- Herramientas educativas: sirve para ilustrar el funcionamiento de un pipeline text-to-image completo (tokenización, decodificación autoregresiva de tokens visuales y reconstrucción VQGAN) dentro del navegador.
- Generación de miniaturas o placeholders de baja resolución: la salida de 256×256 puede emplearse como imagen de relleno en aplicaciones donde no se requiere alta fidelidad.
- Experimentación con jax-js y WebGPU: el repositorio y sus artefactos auxiliares son un caso de estudio para portar modelos transformer a JavaScript y ejecutarlos en GPU del cliente.
- Aplicaciones offline o de bajo coste: al no requerir backend de inferencia, reduce costes operativos en escenarios de tráfico moderado o entornos con conectividad limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 1,0 GB y los pesos se distribuyen en fp16, por lo que la huella de memoria del modelo es del orden de cientos de MB a ~1 GB, además del estado de ejecución de WebGPU.
- GPU recomendadas: no disponible; el requisito funcional es un navegador con soporte de WebGPU (Chrome/Edge en versiones recientes, entre otros).
- Compatibilidad con GPU de consumo: al ejecutarse en el navegador sobre WebGPU, puede funcionar en GPU integradas y dedicadas compatibles, aunque el rendimiento variará según el dispositivo; no se documentan cifras concretas.
- Opciones de despliegue: navegador con WebGPU y jax-js (vía dalle-js); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Resolución | Contexto | Licencia | Ejecución en navegador |
|---|---|---|---|---|---|
| dalle-mini-js (este) | BART + VQGAN | 256×256 | no disponible | apache-2.0 | Sí (WebGPU, jax-js) |
| DALL·E Mini original | BART + VQGAN | 256×256 | no disponible | apache-2.0 | No documentado |
| min-dalle (kuprel) | BART + VQGAN (PyTorch) | 256×256 | no disponible | no disponible en la información | No |
| Modelos de difusión contemporáneos | Difusión | ≥512×512 | no aplica | variable | No documentado |

No se dispone de datos de rendimiento comparativo (benchmarks) en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Se trata de un modelo heredado (DALL·E Mini, 2022) con calidad de imagen inferior a la de los modelos de difusión actuales; la resolución de salida está limitada a 256×256.
- No se documentan datos sobre sesgos del modelo original; al ser un modelo entrenado con datos web, es esperable que reproduzca sesgos presentes en ellos, aunque no se cuantifican en el repositorio.
- Riesgo de alucinación y de fidelidad limitada al prompt: la generación de tokens visuales puede producir imágenes que no correspondan exactamente a la descripción.
- El tokenizador es BPE y el modelo original se orientó principalmente a inglés; no se documenta soporte multilingüe.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo original y del VQGAN de los que derivan los pesos.
- La inferencia depende de WebGPU y de jax-js; la compatibilidad y el rendimiento varían según navegador y dispositivo, y no se documentan cifras de latencia.
- El VQGAN debe ejecutarse en float32 aunque sus pesos se distribuyan redondeados desde fp32, lo que puede introducir pequeñas diferencias numéricas respecto al modelo original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación comunitaria ni de mantenimiento continuado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fnmee/dalle-mini-js
- Modelo original DALL·E Mini: https://huggingface.co/dalle-mini/dalle-mini
- VQGAN original: https://huggingface.co/dalle-mini/vqgan_imagenet_f16_16384
- Paquete min-dalle (PyTorch): https://huggingface.co/kuprel/min-dalle
- Repositorio dalle-js: https://github.com/ericli/dalle-js
- Librería jax-js: https://github.com/ekzhang/jax-js
- Demo en navegador: https://www.lieric.com/dalle
