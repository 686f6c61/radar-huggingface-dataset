# reverie-studio/qwen-image-edit-2511-mflux-q8

## Resumen

qwen-image-edit-2511-mflux-q8 es una conversión del modelo de edición de imagen Qwen-Image-Edit-2511 de Qwen (Alibaba) al formato nativo de MLX para su uso con la librería mflux, cuantizado a 8 bits. Lo publica Reverie Studio como espejo empaquetado para que su aplicación descargue todos los modelos desde un único repositorio; no introduce cambios en los pesos más allá de la cuantización realizada con `mflux-save` de mflux 0.24.0.

El modelo subyacente es Qwen-Image-Edit-2511, un modelo de difusión para edición de imágenes por instrucciones en lenguaje natural, con licencia Apache-2.0. Esta conversión concreta está pensada para ejecutarse en hardware Apple Silicon mediante MLX, no en GPUs NVIDIA, y el autor la utiliza junto con un LoRA Lightning de 4 pasos (publicado aparte) para reducir el número de pasos de inferencia.

La relevancia de esta ficha es operativa: permite a desarrolladores en macOS con chip Apple acceder al modelo original de Qwen sin depender de CUDA, a cambio de asumir un repositorio de 37,5 GB y la dependencia estricta de una versión concreta de mflux. No hay datos de benchmarks ni de rendimiento publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusion para edicion de imagen (arquitectura interna de Qwen-Image-Edit-2511: no disponible en detalle) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (q8) generada con `mflux-save` de mflux 0.24.0 |
| Idiomas soportados | no disponible (el prompt de edicion se asume en lenguaje natural; idiomas concretos no declarados) |
| Licencia | Apache-2.0 (sin cambios respecto al modelo original) |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |
| Modelo base | Qwen/Qwen-Image-Edit-2511 (revision `6f3ccc0b56e431dc6a0c2b2039706d7d26f22cb9`) |
| Tamano del repositorio | 37,5 GB |
| Herramienta de carga | mflux 0.24.0 |
| Integridad | `SHA256SUMS` con todos los ficheros |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo original Qwen-Image-Edit-2511 ni sus datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO o técnicas de alineación). Lo único documentado es que se trata de un modelo de edición de imagen: recibe una imagen y una instrucción textual y genera una versión editada. El autor de esta conversión no aporta información adicional sobre el pipeline de entrenamiento del modelo base.

La contribución técnica de este repositorio es exclusivamente de empaquetado y cuantización: se parte de la revisión concreta del modelo de Qwen y se aplica `mflux-save` de mflux 0.24.0 para producir pesos en 8 bits en formato MLX, sin modificar el modelo más allá de la cuantización. El autor indica además que lo utiliza con un LoRA Lightning de 4 pasos alojado en `reverie-studio/Qwen-Image-Edit-2511-Lightning`, lo que sugiere un flujo de inferencia de pocos pasos (destilación para reducir pasos de muestreo), aunque no se especifican los detalles de dicho LoRA en esta información.

## Capacidades

- Edición de imágenes guiada por instrucciones en lenguaje natural (image editing condicionado por prompt), heredada del modelo base Qwen-Image-Edit-2511.
- Ejecución en hardware Apple Silicon mediante MLX, sin necesidad de CUDA.
- Integración con mflux 0.24.0 como motor de inferencia, pasando la carpeta del modelo como `--model` y `--base-model qwen-image-edit-2511` cuando la herramienta lo requiera.
- Compatibilidad con el LoRA Lightning de 4 pasos publicado por el mismo autor para acelerar la generación.
- Verificación de integridad de los ficheros mediante `SHA256SUMS`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general (más allá de la edición de imagen), audio ni modo thinking.

## Casos de uso

- Edición de imágenes en local en Mac con Apple Silicon: el modelo se carga con mflux 0.24.0 y permite aplicar instrucciones de edición sobre imágenes sin enviar datos a servicios en la nube, lo que resulta adecuado para flujos con requisitos de privacidad.
- Prototipado rápido de pipelines de edición de imagen: al estar cuantizado a 8 bits y acompañado de un LoRA de 4 pasos, reduce el coste computacional por iteración en comparación con el modelo completo en precisión nativa, lo que facilita pruebas repetidas durante el desarrollo.
- Integración en aplicaciones de escritorio para macOS: el empaquetado como repositorio único (37,5 GB) simplifica la descarga y el despliegue dentro de una app que gestione modelos desde un solo origen, tal como hace Reverie.
- Retoque fotográfico asistido por prompt: el modelo recibe una imagen y una instrucción textual, lo que encaja en herramientas de edición semiautomática donde el usuario describe el cambio en lugar de manipular capas.
- Evaluación comparativa del modelo Qwen-Image-Edit-2511 en entornos Apple: sirve para medir calidad y latencia del modelo original en MLX frente a otras plataformas, con la salvedad de la cuantización a 8 bits.
- Reproducibilidad de experimentos: la revisión fijada del modelo base y el listado `SHA256SUMS` permiten reconstruir exactamente el mismo conjunto de pesos en distintas máquinas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de calidad de edición, latencia ni throughput, ni comparaciones con el modelo en precisión completa.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: el repositorio ocupa 37,5 GB en disco; al ser pesos en 8 bits, se necesita memoria unificada suficiente para cargar el modelo completo más los buffers de inferencia. No se especifica la cifra exacta en la información disponible.
- Hardware objetivo: Apple Silicon con MLX (la librería declarada es `mlx`); no está pensado para GPUs NVIDIA ni CUDA.
- GPU consumer: no aplica en el sentido habitual; el equivalente es un Mac con memoria unificada amplia. No se indica qué configuraciones concretas de memoria son suficientes.
- Opciones de despliegue: mflux 0.24.0 exclusivamente, según el autor. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| reverie-studio/qwen-image-edit-2511-mflux-q8 | no disponible | no disponible | MLX, 8 bits | Apache-2.0 | Hugging Face (espejo de Reverie) |
| Qwen/Qwen-Image-Edit-2511 (original) | no disponible | no disponible | pesos originales de Qwen | Apache-2.0 | Hugging Face |
| reverie-studio/Qwen-Image-Edit-2511-Lightning | no disponible | no disponible | LoRA para mflux | no disponible en la informacion | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones detalladas del modelo original que permitan una comparación cuantitativa con alternativas de edición de imagen de otros proveedores.

## Limitaciones y advertencias

- Dependencia estricta de mflux 0.24.0: el autor indica que debe cargarse con esa versión concreta; otras versiones pueden no ser compatibles.
- Solo MLX: no es utilizable en GPUs NVIDIA/CUDA sin conversión adicional, lo que limita su despliegue en servidores convencionales.
- Cuantización a 8 bits: puede introducir degradación de calidad respecto a los pesos originales en precisión completa; no se documenta la magnitud de esa pérdida.
- Tamaño elevado: 37,5 GB de repositorio, lo que exige espacio en disco y memoria unificada considerable.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, latencia ni throughput en este repositorio.
- Idiomas no declarados: no se especifica qué lenguas admiten los prompts de edición.
- Sesgos y alucinaciones: no se documentan sesgos conocidos ni tasas de error del modelo base en la información disponible; al ser un modelo generativo de imagen, existe riesgo de producir ediciones no fieles a la instrucción.
- Licencia: Apache-2.0, lo que permite uso comercial, pero conviene revisar el fichero `LICENSE` del repositorio y las condiciones del modelo base y del LoRA asociado.
- Repositorio espejo: el crédito del modelo corresponde a los autores de Qwen-Image-Edit-2511; este repositorio solo empaqueta y cuantiza.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/reverie-studio/qwen-image-edit-2511-mflux-q8
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- LoRA Lightning del mismo autor: https://huggingface.co/reverie-studio/Qwen-Image-Edit-2511-Lightning
- mflux (motor de inferencia): https://github.com/filipstrand/mflux
- Perfil del autor: https://huggingface.co/reverie-studio
