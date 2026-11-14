# reverie-studio/flux2-klein-4b-mflux-q8

## Resumen

`flux2-klein-4b-mflux-q8` es una conversión del modelo de generación de imágenes FLUX.2 [klein] 4B de Black Forest Labs, publicada por Reverie Studio en formato MLX y cuantizada a 8 bits con mflux 0.24.0. No se trata de un modelo nuevo ni de un fine-tune: el autor indica explícitamente que el modelo es "otherwise unchanged" respecto al original, y que la única transformación aplicada es la cuantización a 8 bits mediante la herramienta `mflux-save`. El propósito es ofrecer una copia espejo descargable desde un único repositorio para la aplicación Reverie, además de un artefacto listo para ejecutarse en hardware Apple Silicon a través de la librería mflux.

El modelo base, FLUX.2 [klein] 4B, es un modelo de difusión para generación de imágenes de aproximadamente 4.000 millones de parámetros, según se deduce de su nombre. La información disponible en la model card no detalla la arquitectura interna, el proceso de entrenamiento ni los datos utilizados, por lo que los apartados técnicos de esta ficha se limitan a lo que el autor documenta: la procedencia, la cuantización y el formato de pesos.

La relevancia de esta publicación es práctica más que técnica: permite a usuarios de mflux en macOS cargar FLUX.2 [klein] 4B en 8 bits con un único comando y sin necesidad de convertir los pesos originales, con un peso de repositorio de 8,6 GB y licencia Apache-2.0 heredada del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para generación de imágenes, según el modelo base) |
| Parametros totales | no disponible (el nombre del modelo base indica 4B) |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (no aplica a un modelo de imagen) |
| Tipos de cuantizacion | 8 bits (cuantizado con mflux 0.24.0, `mflux-save`) |
| Idiomas soportados | no disponible (modelo texto-a-imagen) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX, librería `mlx`; pesos cuantizados de mflux) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de FLUX.2 [klein] 4B en la documentación proporcionada. El modelo base pertenece a la familia FLUX.2 de Black Forest Labs, orientada a generación de imágenes, y el nombre indica un tamaño de 4B parámetros, pero la model card del espejo no describe el tipo de transformer de difusión, el esquema de atención ni el proceso de muestreo.

Tampoco se documentan los datos de entrenamiento, el número de tokens o pares imagen-texto, ni si hubo etapas de ajuste fino con preferencias humanas. La única información técnica verificable es la transformación aplicada por Reverie Studio: cuantización a 8 bits de los pesos originales (revisión `e7b7dc27f91deacad38e78976d1f2b499d76a294` del repositorio de Black Forest Labs) mediante mflux 0.24.0, sin modificaciones adicionales. El repositorio incluye un fichero `SHA256SUMS` con la suma de verificación de cada archivo.

## Capacidades

- Generación de imágenes a partir de prompts de texto, heredadas del modelo base FLUX.2 [klein] 4B.
- Ejecución en hardware Apple Silicon mediante la librería MLX y la herramienta mflux.
- Carga directa como carpeta de modelo en mflux 0.24.0, pasando la ruta del repositorio como `--model` y, cuando mflux lo requiera, `--base-model flux2-klein-4b`.
- Cuantización de 8 bits que reduce el peso en disco y memoria respecto a los pesos originales en precisión completa.
- No se documentan capacidades de edición de imagen, inpainting, control de composición, tool calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Generación de imágenes en local en Mac con Apple Silicon: el modelo se carga con mflux 0.24.0 y permite crear imágenes sin depender de servicios en la nube, aprovechando la cuantización de 8 bits para reducir el consumo de memoria unificada.
- Prototipado rápido de pipelines texto-a-imagen en macOS: al estar en formato MLX, se integra en scripts de Python con mflux para experimentar con prompts y parámetros de muestreo sin convertir pesos.
- Espejo corporativo o de aplicación: el repositorio agrupa los pesos en un único origen para que la aplicación Reverie descargue todos sus modelos desde el mismo lugar, simplificando la distribución y la verificación de integridad con `SHA256SUMS`.
- Evaluación comparativa de cuantizaciones: sirve para medir la pérdida de calidad frente a los pesos originales de FLUX.2 [klein] 4B en un mismo entorno de ejecución.
- Generación de recursos gráficos para desarrollo: ilustraciones, placeholders y assets de interfaz generados localmente en estaciones de trabajo Mac, sin coste por API.
- Docencia y experimentación con modelos de difusión: al ser Apache-2.0 y de tamaño moderado (4B), es adecuado para laboratorios que quieran estudiar el comportamiento de un modelo de imagen cuantizado en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria: el repositorio ocupa 8,6 GB en disco; al ejecutarse en MLX sobre Apple Silicon, los pesos se cargan en memoria unificada, por lo que se recomienda un equipo con al menos 16 GB de memoria unificada para dejar margen al resto del sistema.
- GPU recomendadas: hardware Apple Silicon (series M1, M2, M3, M4 y variantes Pro, Max y Ultra) con soporte de MLX. No se documenta soporte para GPU NVIDIA o AMD en esta conversión.
- GPU de consumo: al estar orientado a MLX, el requisito es un Mac con chip de la familia M; no se indica compatibilidad con tarjetas gráficas discretas de consumo.
- Despliegue: mflux 0.24.0 es la vía documentada, pasando la carpeta del modelo como `--model` y `--base-model flux2-klein-4b` cuando la herramienta lo solicite. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizacion | Licencia | Entorno |
|---|---|---|---|---|---|
| flux2-klein-4b-mflux-q8 (este) | 4B (según nombre del base) | MLX safetensors | 8 bits | Apache-2.0 | Apple Silicon / mflux |
| black-forest-labs/FLUX.2-klein-4B | 4B (según nombre) | no disponible en la información | pesos originales | Apache-2.0 | no disponible |
| Otras alternativas de generación de imágenes | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es con el modelo base del que deriva: mismos pesos, misma licencia y misma arquitectura, con la diferencia de la cuantización a 8 bits y el empaquetado para mflux. No se dispone de datos de rendimiento para comparar con otros modelos de imagen.

## Limitaciones y advertencias

- Es un espejo cuantizado, no un modelo nuevo: cualquier limitación del modelo base FLUX.2 [klein] 4B se hereda sin cambios.
- La cuantización a 8 bits puede introducir una degradación de calidad respecto a los pesos originales; no se documenta la magnitud de esa pérdida.
- No se dispone de información sobre sesgos del modelo base, composición del dataset ni tasas de alucinación visual en la documentación proporcionada.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar el fichero `LICENSE` incluido y las condiciones del modelo original de Black Forest Labs.
- El formato MLX limita el despliegue a hardware Apple Silicon con mflux; no es directamente utilizable en servidores con GPU NVIDIA sin conversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de funcionamiento más allá de la declaración del autor.
- El autor indica que el contenido es idéntico al original salvo la cuantización; conviene verificar la integridad con `SHA256SUMS` antes de usarlo en producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/reverie-studio/flux2-klein-4b-mflux-q8
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Herramienta mflux: https://github.com/filipstrand/mflux
- Perfil del autor: https://huggingface.co/reverie-studio
