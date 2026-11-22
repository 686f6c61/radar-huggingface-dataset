# IFM/PAN2

## Resumen

PAN 2 es un modelo del mundo (world model) de propósito general desarrollado por el Institute of Foundation Models (IFM) de la Universidad MBZUAI. Su función es simular cómo evolucionará una escena en respuesta a acciones descritas en lenguaje natural: partiendo de una observación (una imagen opcional más texto) y de una descripción textual de las acciones, genera un vídeo de hasta 20 segundos que representa el estado futuro del mundo. Esto habilita el razonamiento simulado (simulative reasoning), en el que un agente imagina las consecuencias de cada plan candidato antes de elegir uno.

Técnicamente, PAN 2 sigue la arquitectura Generative Latent Prediction (GLP) formalizada en el paper "Critique of World Models" (arXiv:2507.05169) y combina dos componentes: un modelo de lenguaje grande que actúa como backbone de razonamiento conceptual y un diffusion transformer (MMDiT) de 29 000 millones de parámetros entrenado desde cero que actúa como backbone de razonamiento perceptivo. El LM razona sobre la observación y las acciones y escribe el siguiente estado del mundo como una descripción estructurada y anclada temporalmente (eventos, acciones con sus actores y movimiento de cámara); un codificador de texto congelado (Qwen3.5-9B) convierte esa descripción en las features de condicionamiento que consume el MMDiT.

El modelo se publica bajo licencia Apache 2.0, con pesos en formato safetensors y layout de Diffusers, y es relevante ahora porque ofrece una vía abierta y de tamaño medio (29B) para construir agentes que planifiquen mediante simulación visual, además de cubrir text-to-video e image-to-video con una sola checkpoints y soporte nativo en Diffusers y vLLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Generative Latent Prediction (GLP): LM de razonamiento conceptual + MMDiT (diffusion transformer) de razonamiento perceptivo, con VAE Wan 2.2 |
| Parámetros totales | 29 201 996 992 (29B, backbone de difusión) |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint publicado en BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout Diffusers, `PAN2Transformer3DModel`); conversión a formato nativo mediante `scripts/convert_checkpoint.py` |

## Arquitectura y entrenamiento

PAN 2 implementa la arquitectura GLP descrita en "Critique of World Models". El pipeline tiene tres piezas: (1) un LM backbone de razonamiento conceptual que interpreta la observación y las acciones solicitadas y produce una descripción estructurada del siguiente estado del mundo, con eventos anclados en el tiempo, acciones ligadas a actores y movimiento de cámara; (2) un codificador de texto congelado, Qwen3.5-9B, que proyecta esa descripción a las features de condicionamiento; y (3) un MMDiT de 29B parámetros, el backbone perceptivo, que predice los latentes de vídeo que realizan ese estado, condicionado por la descripción y por el latente VAE de la imagen inicial. El decoder VAE de Wan 2.2 renderiza los latentes predichos como la siguiente observación observable.

El MMDiT se entrenó desde cero sobre cientos de millones de vídeos anotados en el mismo formato estructurado que produce el LM de razonamiento. El checkpoint liberado sirve tanto text-to-video como image-to-video con un único conjunto de pesos. La salida es de 704x1248 a 24 fps con hasta 20 segundos de duración. No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Simulación de estados futuros del mundo a partir de una observación (imagen opcional) y acciones descritas en texto.
- Text-to-video (`t2v`) e image-to-video (`i2v`) con un único checkpoint.
- Razonamiento simulado: permite a un agente simular cada plan candidato y elegir el de mejor resultado simulado.
- Generación de descripciones estructuradas del siguiente estado (eventos, acciones con actores, movimiento de cámara) mediante el LM de razonamiento conceptual.
- Salida de vídeo de 704x1248 a 24 fps con hasta 20 segundos de duración.
- Soporte de condicionamiento negativo estructurado en los prompts de ejemplo.
- Soporte multilingüe limitado al inglés (`language: en`).
- No se documenta en la información disponible soporte de tool calling, function calling ni modo thinking explícito.

## Casos de uso

- Planificación de agentes robóticos: simular con PAN 2 el resultado visual de cada trayectoria o acción candidata antes de ejecutarla en el mundo real, y seleccionar la que produzca la simulación más favorable.
- Validación de planes en entornos simulados: generar vídeos de hasta 20 s de la evolución esperada de una escena para comparar la predicción con metraje real y detectar desviaciones del modelo.
- Previsualización de escenas para producción audiovisual: a partir de una imagen de referencia y una descripción de acciones y movimiento de cámara, obtener un clip de 704x1248 a 24 fps para revisar el encuadre y la continuidad antes del rodaje.
- Generación de datos sintéticos para entrenamiento de percepción: producir secuencias vídeo condicionadas por acciones controladas para aumentar datasets de visión por computador.
- Prototipado de interfaces de simulación: integrar el modelo vía Diffusers o vLLM para construir demos interactivas donde el usuario describe acciones y observa el resultado simulado.
- Investigación en world models: usar el checkpoint como referencia reproducible de la arquitectura GLP para experimentos de razonamiento conceptual y perceptivo acoplados.
- Evaluación de políticas de navegación: simular el avance de un agente por un entorno a partir de una imagen inicial y comparar resultados entre políticas antes de desplegarlas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone de difusión tiene 29B parámetros en BF16, lo que supone aproximadamente 58 GB solo para los pesos; a ello se suman el codificador de texto Qwen3.5-9B y el VAE de Wan 2.2. No se dispone de cifras oficiales de VRAM total.
- GPU recomendadas: no se especifican en la información disponible; por el tamaño en BF16 se requiere hardware de clase数据中心 (A100/H100 de 80 GB o superior) para ejecutar el modelo completo sin cuantización.
- Viabilidad en GPU de consumo: no disponible; el tamaño del repositorio (86,2 GB) y la precisión BF16 hacen inviable el despliegue completo en GPUs de consumo convencionales.
- Opciones de despliegue: Diffusers, vLLM, y el `generate.py` del repositorio oficial; el script de inferencia lanza un worker por GPU, cada uno con el modelo completo de 29B y reparto de prompts entre workers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PAN 2 (IFM/MBZUAI) | 29B (backbone de difusión) | vídeo de hasta 20 s a 704x1248, 24 fps | t2v, i2v, world simulation | Apache 2.0 | Hugging Face, Diffusers, vLLM |
| Wan 2.2 (Wan-AI) | no disponible (se usa su VAE y su variante TI2V-5B) | no disponible | generación de vídeo | no disponible en esta ficha | Hugging Face |
| Alternativas de world models | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Idiomas: el modelo está etiquetado únicamente para inglés, lo que limita su uso con prompts en castellano u otras lenguas.
- Riesgo de alucinación visual: al ser un modelo generativo de simulación, los vídeos producidos pueden divergir del resultado real de las acciones; deben validarse contra metraje real antes de usarse en decisiones críticas.
- Sesgos: no se documentan análisis de sesgos en la información disponible; al entrenarse con cientos de millones de vídeos, puede reproducir sesgos presentes en esos datos.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio y las licencias de los componentes congelados (Qwen3.5-9B y Wan 2.2 VAE) antes de desplegar en producción.
- Dependencias externas: el pipeline requiere descargar por separado el codificador de texto y el VAE, y convertir el checkpoint con `scripts/convert_checkpoint.py` para usar `generate.py`.
- Requisitos de hardware elevados: 29B parámetros en BF16 exigen GPUs de gran memoria; no se documentan recetas de cuantización.
- Duración y resolución acotadas: los clips se limitan a 20 segundos a 704x1248 y 24 fps, lo que restringe escenarios de simulación de mayor horizonte temporal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IFM/PAN2
- Repositorio GitHub: https://github.com/ifm-ai/PAN2
- Documentación: https://github.com/ifm-ai/PAN2/blob/main/README.md
- Licencia: https://github.com/ifm-ai/PAN2/blob/main/LICENSE
- Documentación de Diffusers: https://huggingface.co/docs/diffusers/main/en/api/pipelines/pan2
- Receta de vLLM: https://recipes.vllm.ai/IFM/PAN2
- Paper "Critique of World Models": https://arxiv.org/abs/2507.05169
- Codificador de texto Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- VAE Wan 2.2: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
