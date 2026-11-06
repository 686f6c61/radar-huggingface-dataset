# ACCC1380/nyako_style

## Resumen

Nyako style es un adaptador LoRA de estilo para generación de imágenes a partir de texto, entrenado sobre el modelo base circlestone-labs/Anima. Lo publica el usuario ACCC1380 en Hugging Face y su función es inyectar un estilo visual concreto, activado mediante el token de disparo `@nyako`, en las generaciones del modelo base. El repositorio contiene tanto los pesos finales como el estado completo de entrenamiento, la configuración efectiva, el dataset y los registros, lo que lo convierte en un artefacto reproducible más que en un simple fichero de pesos.

El adaptador se entrenó con lora-scripts-next durante 150 épocas totales (con una reanudación tras la época 50), rango 16 y alpha 16, optimizador AdamW con tasa de aprendizaje 1e-4 y scheduler constante, en precisión BF16 y a resolución 1024 con buckets de relación de aspecto. El dataset de origen es muy reducido: 24 pares imagen-caption procedentes del dataset `ACCC1380/Nyako`. El tamaño del repositorio es de 8,6 GB, explicado en buena parte por los checkpoints intermedios y el estado de reanudación del entrenador.

La relevancia de esta ficha es acotada: no se trata de un modelo fundacional ni de propósito general, sino de un LoRA de estilo de nicho, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin benchmarks publicados. Su interés práctico está en demostrar un flujo de entrenamiento reproducible sobre Anima y en servir como ejemplo de estructura de artefactos (config, dataset, logs, manifest con hashes SHA-256) para quien quiera auditar o replicar un entrenamiento LoRA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusión circlestone-labs/Anima |
| Parametros totales | no disponible (rango 16, alpha 16; el repositorio incluye checkpoints y estado del entrenador, 8,6 GB en total) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; resolución de entrenamiento 1024 px con buckets de relación de aspecto) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, FP8 ni INT8) |
| Idiomas soportados | no disponible (las captions de entrenamiento no fueron inspeccionadas por el autor; el prompt de disparo es `@nyako`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`output/nyako_style.safetensors`), más estado de reanudación del entrenador en `output/nyako_style-state/` |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 16 aplicado sobre el modelo base Anima v1.0, un text-to-image de la familia de difusión. El entrenamiento se realizó con la herramienta lora-scripts-next, con optimizador AdamW, tasa de aprendizaje 1e-4, scheduler constante, batch size 2, precisión BF16 y resolución 1024 con buckets de relación de aspecto; el checkpointing de gradientes está desactivado. Se completaron 150 épocas totales, con una reanudación tras la época 50, y semilla 42. Los buckets con un número impar de muestras generan un último batch de menor tamaño.

El dataset de origen es `ACCC1380/Nyako`, en la revisión `f1048ee38473bc253ebdc4b4eba3b0c2dcebacb3`, con 24 pares imagen-caption. Las captions se trataron como bytes opacos: solo se antepuso el prefijo solicitado (`@nyako, `) y se verificó que el resto de los bytes permaneciera sin cambios, sin que el autor inspeccionara su contenido. No se documenta el número de tokens de entrenamiento, la composición del dataset más allá de esos 24 pares, ni si hubo etapas de RLHF o DPO, algo que en un LoRA de difusión no aplica del mismo modo que en un LLM. Tampoco se describen innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de imágenes a partir de texto condicionada al estilo aprendido, activada con el token de disparo `@nyako`.
- Transferencia de estilo visual sobre el modelo base Anima: el adaptador modifica la estética de salida sin sustituir el modelo subyacente.
- Composición con otros LoRA y con el modelo base dentro de pipelines de diffusers, al publicarse en formato compatible con la librería.
- Reproducibilidad del entrenamiento: el repositorio incluye configuración solicitada y efectiva, definición del dataset y procedencia, versiones de paquetes y commit del entrenador.
- Reanudación del entrenamiento desde el estado guardado (`--resume /path/to/output/nyako_style-state`) para continuar más allá de las 150 épocas.
- Verificación de integridad mediante `manifest.json` con hashes SHA-256 y tamaños.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking, por no ser aplicables a un LoRA de difusión.

## Casos de uso

- Ilustración de estilo consistente: usar `@nyako` en el prompt junto con el modelo base Anima para generar un conjunto de imágenes con una estética homogénea, útil en series ilustradas o assets de un mismo proyecto visual.
- Prototipado de dirección de arte: generar variantes rápidas de una escena con el estilo del adaptador para comparar con otras propuestas antes de encargar arte final.
- Investigación sobre LoRA de estilo: el repositorio sirve como caso de estudio reproducible al incluir dataset, configuración efectiva, logs y estado del entrenador, lo que permite analizar el efecto del rango, la tasa de aprendizaje y las épocas sobre el resultado.
- Auditoría de entrenamiento: el `manifest.json` con hashes SHA-256 y los CSV de métricas escalares permiten verificar que los artefactos publicados coinciden con los generados y trazar la curva de pérdida.
- Reanudación y ajuste fino: partir del estado guardado para continuar el entrenamiento con más épocas o con un dataset ampliado, siguiendo las instrucciones de reanudación documentadas.
- Docencia y talleres: emplear el flujo completo (preprocesado, lanzador, scripts de subida) como ejemplo práctico de entrenamiento LoRA de extremo a extremo con lora-scripts-next.
- Integración en pipelines de diffusers: cargar el adaptador junto al modelo base para incorporarlo a un servicio de generación de imágenes por lotes con un estilo de marca definido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica para el adaptador; depende del modelo base Anima y del pipeline de diffusers empleado. El adaptador LoRA en sí es de rango 16 y añade una sobrecarga mínima frente al modelo base.
- GPU recomendadas: no disponibles en la información proporcionada; el entrenamiento se realizó a resolución 1024 con BF16 y batch size 2, lo que exige una GPU con soporte BF16 y memoria suficiente para ese régimen, pero no se especifica el modelo de GPU utilizado.
- Compatibilidad con GPU de consumo: no confirmada; el repositorio de 8,6 GB incluye checkpoints y estado del entrenador, no solo los pesos finales, por lo que el tamaño del fichero de inferencia es menor que el del repositorio.
- Opciones de despliegue: diffusers es la librería declarada. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusión; tampoco se confirma compatibilidad con ComfyUI o Automatic1111.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Rango / alpha | Dataset | Licencia | Descargas / likes |
|---|---|---|---|---|---|---|
| ACCC1380/nyako_style | LoRA de estilo text-to-image | circlestone-labs/Anima | 16 / 16 | 24 pares imagen-caption | no disponible | 0 / 0 |
| Nyako style (kiyugui, PixAI) | LoRA de estilo text-to-image | no disponible | no disponible | no disponible | no disponible | no aplica (plataforma PixAI) |
| circlestone-labs/Anima | Modelo base text-to-image | no aplica | no aplica | no disponible | no disponible | no disponible |

La única alternativa identificable en la búsqueda es otra versión de "Nyako style" publicada por el usuario kiyugui en la plataforma PixAI, de la que no se dispone de especificaciones técnicas, licencia ni datos de entrenamiento, por lo que la comparación cuantitativa no es posible. No se han identificado otros LoRA comparables en la información disponible.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 24 pares imagen-caption, lo que limita la generalización del estilo y aumenta el riesgo de sobreajuste a las imágenes concretas del conjunto.
- El autor declara que no inspeccionó el contenido de las captions, tratadas como bytes opacos; no hay verificación de calidad, sesgos ni contenido inapropiado en los datos de entrenamiento.
- Licencia no declarada: no se puede confirmar el uso comercial ni las condiciones de redistribución del adaptador, ni de los artefactos derivados.
- Al depender del modelo base Anima, hereda las limitaciones, sesgos y restricciones de licencia de este; no se documentan en esta ficha.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por parte de la comunidad.
- Sin benchmarks ni evaluaciones publicadas: no es posible cuantificar la fidelidad del estilo ni compararlo objetivamente con alternativas.
- El token de disparo debe respetarse exactamente (`@nyako`); las captions de entrenamiento comienzan con los bytes `@nyako, `, por lo que variaciones en el formato pueden degradar el resultado.
- El repositorio incluye checkpoints intermedios y estado del entrenador (8,6 GB); para inferencia conviene usar únicamente `output/nyako_style.safetensors` y no el repositorio completo.
- Las rutas de configuración reflejan la máquina original de entrenamiento; reanudar en otro entorno requiere ajustar rutas locales e instalar el entorno y el commit del entrenador registrados.
- Riesgo de alucinación en el sentido de generación de contenido visual no solicitado o incoherente: no se documenta ninguna evaluación al respecto.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/ACCC1380/nyako_style
- Perfil del autor en Hugging Face: https://huggingface.co/ACCC1380
- Modelo base: https://huggingface.co/circlestone-labs/Anima
- Dataset de entrenamiento: https://huggingface.co/datasets/ACCC1380/Nyako
- Nyako style en PixAI (autor kiyugui): https://pixai.art/model/2004694597471908199
