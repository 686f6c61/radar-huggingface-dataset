# sebekblessing/klein-4b-gpu

## Resumen

Klein 4B GPU es un empaquetado del modelo de generación de imágenes texto-a-imagen FLUX.2 [klein] 4B de Black Forest Labs, adaptado por el usuario sebekblessing para ejecutarse sobre el motor Anima GPU Engine mediante OpenCL en chips gráficos de teléfonos móviles. No se trata de un modelo nuevo: es una conversión de pesos a formato GGUF propietario del motor (no compatible con llama.cpp ni ComfyUI), con cuantización de 8 bits, orientada a dispositivos Android sin chip Snapdragon AI.

El repositorio incluye tres artefactos: el modelo de difusión principal (`klein_q8.gguf`), el decodificador de imagen ligero taef2 de madebyollin (`tae_f2.gguf`) y su codificador para ediciones (`taee_f2.gguf`). El lector de prompts (Qwen3-4B) no se incluye aquí y debe obtenerse del paquete hermano `klein-4b-qnn-8elite`. El modelo base cuenta con 3.933.052.416 parámetros y licencia Apache 2.0.

Su relevancia es acotada: se publica como anticipo de una ruta de ejecución que la aplicación Anima todavía no utiliza (hoy cubre MOSS y Fibo en la ruta de GPU gráfica). Es un artefacto de despliegue para un runtime concreto, no un modelo de propósito general, y su utilidad queda ligada al ecosistema Anima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (FLUX.2 [klein] 4B), empaquetado para Anima GPU Engine |
| Parametros totales | 3.933.052.416 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8 bits (q8) en el archivo `klein_q8.gguf` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (modelo base y empaquetado); taef2 bajo MIT |
| Formato de pesos | GGUF en layout propio del Anima GPU Engine (no compatible con llama.cpp ni ComfyUI) |

## Arquitectura y entrenamiento

El modelo subyacente es FLUX.2 [klein] 4B, un modelo de difusión texto-a-imagen de Black Forest Labs con aproximadamente 3.930 millones de parámetros. El empaquetado de sebekblessing no modifica la arquitectura: convierte los pesos al layout interno del Anima GPU Engine y los cuantiza a 8 bits para reducir el consumo de memoria y hacer viable la inferencia en GPUs integradas de teléfonos mediante OpenCL.

El pipeline se descompone en tres piezas: el modelo de dibujo (`klein_q8.gguf`), el decodificador de imagen taef2 de madebyollin (`tae_f2.gguf`) y el codificador de imagen para tareas de edición (`taee_f2.gguf`). El procesamiento del prompt textual recae en Qwen3-4B, que no se distribuye en este repositorio sino en el paquete `klein-4b-qnn-8elite`. Los scripts `build/pack_klein.py` y `build/pack_tae.py` documentan el proceso de empaquetado. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre si hubo ajuste por RLHF o DPO.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image).
- Edición de imágenes, gracias al codificador `taee_f2.gguf` incluido.
- Decodificación de latentes a imagen mediante el decodificador ligero taef2.
- Ejecución en chips gráficos de teléfonos Android mediante OpenCL estándar.
- Compatibilidad prevista con el motor Anima GPU Engine (integración pendiente en la aplicación).
- Soporte de instrucciones en lenguaje natural a través del lector de prompts Qwen3-4B (distribuido aparte).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio ni visión más allá de la propia generación de imagen.

## Casos de uso

- Generación de imágenes en dispositivos móviles sin conexión: el empaquetado en 8 bits y el uso de OpenCL permiten ejecutar el modelo en la GPU integrada de un teléfono Android, sin depender de la nube ni de un chip Snapdragon AI dedicado.
- Integración en la aplicación Anima: una vez que la app habilite la ruta Klein, este paquete servirá como artefacto de despliegue para la generación de imágenes dentro de la aplicación.
- Edición de imágenes locales: el codificador `taee_f2.gguf` permite modificar imágenes existentes en el propio dispositivo, útil para retoques o variaciones sin subir contenido a servidores externos.
- Prototipado de pipelines de difusión sobre OpenCL: desarrolladores que trabajen con el motor Anima pueden usar estos archivos como referencia para validar el rendimiento en GPUs móviles.
- Investigación en eficiencia de inferencia: sirve para medir el coste de un modelo de difusión de ~3,9 mil millones de parámetros cuantizado a 8 bits en hardware móvil.
- Distribución de artefactos para runtimes alternativos: ejemplo de empaquetado de un modelo de Black Forest Labs en un formato propietario distinto de GGUF estándar, útil para estudiar estrategias de portabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 4,3 GB y el archivo principal está cuantizado a 8 bits, por lo que se requiere al menos ese orden de magnitud de memoria gráfica.
- GPU recomendadas: chips gráficos de teléfonos Android con soporte OpenCL estándar; para dispositivos con Snapdragon 8 Elite el autor remite al paquete `klein-4b-qnn-8elite`.
- ¿Cabe en GPU de consumo? El objetivo del empaquetado es precisamente hardware móvil; no se documenta compatibilidad con GPUs de escritorio.
- Opciones de despliegue: exclusivamente el motor Anima GPU Engine; los archivos no son compatibles con llama.cpp, ComfyUI ni otros runtimes GGUF convencionales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Klein 4B GPU (este) | 3.933.052.416 | No disponible | GGUF layout Anima | Apache 2.0 | Hugging Face, 0 descargas |
| FLUX.2 [klein] 4B | ~3,9 B | No disponible | Pesos originales (safetensors) | Apache 2.0 | Hugging Face (Black Forest Labs) |
| klein-4b-qnn-8elite | No disponible | No disponible | GGUF para Snapdragon 8 Elite | Apache 2.0 | Hugging Face (mismo autor) |

## Limitaciones y advertencias

- No es un modelo nuevo ni un ajuste fino: es una conversión de formato de FLUX.2 [klein] 4B; las limitaciones del modelo base se heredan íntegramente.
- Los archivos GGUF usan un layout propio del Anima GPU Engine y no funcionan en llama.cpp, ComfyUI ni otras herramientas estándar.
- La aplicación Anima todavía no utiliza esta ruta: el autor indica que la app cubre MOSS y Fibo en la ruta de GPU gráfica y que estos archivos se publican por adelantado.
- El lector de prompts (Qwen3-4B) no está incluido; sin él el pipeline queda incompleto.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación.
- No hay datos de benchmarks ni de rendimiento medido en hardware real.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni informes de uso en producción.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y del decodificador taef2 (MIT) antes de un uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sebekblessing/klein-4b-gpu
- Modelo base FLUX.2 [klein] 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Motor Anima GPU Engine: https://github.com/adiirfan/anima-gpu-engine
- Paquete para Snapdragon 8 Elite: https://huggingface.co/sebekblessing/klein-4b-qnn-8elite
- Decodificador taef2 (madebyollin): no disponible en la informacion proporcionada
