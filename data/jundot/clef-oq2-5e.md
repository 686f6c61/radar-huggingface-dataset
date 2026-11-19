# Jundot/clef-oQ2.5e

## Resumen

clef-oQ2.5e es una cuantización de precisión mixta en formato MLX del modelo Cloudflare/clef, un modelo de decisión de 27B parámetros post-entrenado a partir de Qwen/Qwen3.8-27B. Su función no es la generación libre de texto, sino transformar un estado y un esquema de preguntas tipadas en decisiones: devuelve una probabilidad para cada opción permitida de cada pregunta en un único forward pass. Esta ficha describe el checkpoint cuantizado publicado por Jundot, no el modelo original.

La relevancia de esta versión radica en el formato: reduce un modelo multimodal de 27B a 11,84 GiB de almacenamiento con un promedio efectivo de 3,700 bits por peso, manteniendo la columna vertebral de lenguaje, el codificador de visión y la cabeza de esquema conjunta. Está pensada para ejecutarse en hardware Apple Silicon mediante MLX, y el autor la sirve a través del endpoint `POST /v1/systemone` de oMLX.

La cuantización se ha re-hecho con el redondeo oQe refinado de oMLX 0.8.0 (actualización del 19 de noviembre de 2026), que reduce el error de cuantización a igual tamaño y velocidad. La licencia es Apache-2.0, heredada del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone de lenguaje Qwen3.8-27B + codificador de visión + cabeza de esquema conjunta); cuantización MLX de precisión mixta |
| Parametros totales | 27.356.728.560 (27,36B, según safetensors); 27,485B de pesos lógicos según la model card |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Affine 2, 3, 4, 5, 6 y 8 bits con grupos de 64 y 128, más BF16; promedio efectivo 3,700 bits/peso (3,431 en el backbone de lenguaje) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), con `joint_head.safetensors` y `joint_head_config.json` |

## Arquitectura y entrenamiento

El modelo base Cloudflare/clef parte de Qwen/Qwen3.8-27B y se post-entrena como modelo de decisión: recibe un estado y un esquema de preguntas tipadas y emite, en un solo forward pass, una distribución de probabilidad sobre todas las opciones permitidas de todas las preguntas. La arquitectura conserva el backbone de lenguaje de 26,896B de pesos lógicos, un codificador de visión de 0,461B y una cabeza de esquema conjunta de 0,128B. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

Esta versión concreta es una cuantización, no un reentrenamiento. oQ asigna bits según la sensibilidad medida por capa y redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) y un reajuste de escala y sesgo por mínimos cuadrados ponderados. La distribución resultante concentra el 74,592% de los pesos lógicos en 3 bits con grupo 128, reserva 5 bits para el 10,120% y mantiene en BF16 el 2,152%. La cabeza de esquema conjunta se copia sin modificar desde el modelo fuente.

## Capacidades

- Decisión estructurada: devuelve una probabilidad por cada opción permitida de cada pregunta de un esquema tipado en un único forward pass.
- Procesamiento multimodal de entrada (image-text-to-text) mediante el codificador de visión integrado.
- Razonamiento sobre estados y esquemas: adecuado para selección entre alternativas discretas, no para generación abierta de texto.
- Integración con oMLX a través del endpoint `POST /v1/systemone`.
- Ejecución en Apple Silicon mediante la librería MLX.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, agentes y modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de decisiones en pipelines: dado un estado del sistema y un esquema de opciones (por ejemplo, categorías de triaje), el modelo devuelve probabilidades por opción en una sola pasada, lo que permite umbralizar y derivar a un humano cuando la confianza es baja.
- Clasificación multimodal en dispositivo: al incluir codificador de visión, puede puntuar opciones a partir de una imagen y un estado textual, ejecutándose localmente en un Mac con MLX sin enviar datos a la nube.
- Selección de acciones en automatización: con un esquema de preguntas tipadas que represente acciones permitidas, el modelo produce una distribución sobre ellas explotable por un planificador.
- Evaluación de incertidumbre: al emitir probabilidades por opción en lugar de texto libre, facilita la calibración y el registro de confianza en sistemas de decisión auditables.
- Prototipado en estación de trabajo: los 11,84 GiB del checkpoint permiten cargar el modelo completo en memoria unificada de un equipo Apple de gama alta para experimentación sin GPU dedicada.
- Investigación sobre cuantización extrema: sirve como referencia reproducible para estudiar el impacto de 2-3 bits por peso en tareas de decisión estructurada frente al modelo original en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 11,84 GiB de pesos en el checkpoint; el consumo real en inferencia es superior por cachés de atención y activaciones, no cuantificadas en la información disponible.
- Hardware objetivo: Apple Silicon con MLX (memoria unificada); no se documentan requisitos mínimos de chip.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas de forma nativa por este checkpoint MLX; requerirían conversión a otro formato, no documentada.
- Cabe en consumer hardware Apple de gama alta con al menos 16 GB de memoria unificada, en función del overhead de inferencia no especificado.
- Despliegue: oMLX (v0.8.0 o superior) con el endpoint `POST /v1/systemone`; no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| clef-oQ2.5e (este) | 27,36B | No disponible | MLX safetensors, 3,700 bits/peso | Apache-2.0 | Cuantización de decisión, 11,84 GiB |
| Cloudflare/clef (base) | 27B | No disponible | No disponible | Apache-2.0 | Modelo fuente en precisión original; mayor huella de memoria |
| Qwen/Qwen3.8-27B (origen) | 27B | No disponible | No disponible | No disponible | Backbone de lenguaje del que deriva clef; orientado a generación general |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de decisión, no de generación: no debe esperarse salida de texto libre ni conversación abierta.
- La cuantización a 3,700 bits/peso promedio introduce error respecto al modelo en BF16; la magnitud de la degradación no está cuantificada en la información disponible.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Longitud de contexto no disponible, lo que impide planificar cargas con estados largos.
- Dependencia de MLX y Apple Silicon: el checkpoint no es directamente portable a ecosistemas CUDA sin conversión.
- La cabeza de esquema conjunta no se cuantiza; su integridad depende de copiar `joint_head.safetensors` y `joint_head_config.json` junto con los pesos.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al emitir probabilidades sobre opciones cerradas, el riesgo se traslada a la calibración de dichas probabilidades.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo fuente Cloudflare/clef y de Qwen3.8-27B.
- Las versiones anteriores a la actualización del 19 de noviembre de 2026 tienen mayor error de cuantización; deben descartarse.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/Jundot/clef-oQ2.5e
- Modelo base: https://huggingface.co/Cloudflare/clef
- Repositorio oMLX: https://github.com/jundot/omlx
- Pull request de mejora de oQe: https://github.com/jundot/omlx/pull/4930
- Pull request de refinamiento del redondeo oQe: https://github.com/jundot/omlx/pull/5292
