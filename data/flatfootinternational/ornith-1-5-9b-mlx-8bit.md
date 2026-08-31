# FlatFootInternational/Ornith-1.5-9B-MLX-8bit

## Resumen

FlatFootInternational/Ornith-1.5-9B-MLX-8bit es una conversión al formato MLX del modelo ornith-ai/Ornith-1.5-9B, realizada por el usuario FlatFootInternational. El modelo original, desarrollado por ornith-ai, es un modelo de lenguaje denso de 9 000 millones de parámetros, diseñado para un despliegue eficiente en una única GPU y con una variante cuantizada para dispositivos móviles. Esta conversión en 8 bits permite ejecutar el modelo en hardware Apple Silicon mediante la librería MLX, lo que facilita su uso en entornos de desarrollo y producción con Mac.

El modelo base Ornith-1.5 introduce un enfoque de auto-mejora (self-scaffolding y self-improvement) en el que el propio modelo propone tareas, genera andamiajes específicos y produce rollouts para aprendizaje por refuerzo. Aunque la ficha original no detalla la arquitectura interna, el tag `qwen3_5` sugiere una base sobre la arquitectura Qwen 3.5. La licencia MIT permite uso comercial sin restricciones significativas, lo que lo hace atractivo para integraciones en productos.

Esta versión MLX 8-bit es relevante porque amplía la accesibilidad del modelo a ecosistemas que no dependen de CUDA, manteniendo un tamaño de repositorio de 10,4 GB y un peso cuantizado que reduce los requisitos de memoria en comparación con la versión completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (probablemente basado en Qwen 3.5, segun el tag `qwen3_5`) |
| Parametros totales | 2.975.030.512 (segun safetensors; el modelo se anuncia como 9B, posiblemente el archivo consultado sea parcial) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8-bit (segun el nombre del repositorio) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

La arquitectura exacta no se documenta en la informacion disponible. El tag `qwen3_5` indica que el modelo base probablemente deriva de la familia Qwen 3.5, pero no se confirma si se trata de una arquitectura transformer estándar o con modificaciones. El modelo es denso, con 9 000 millones de parametros segun su denominacion, aunque el archivo safetensors consultado muestra 2 975 030 512 parametros, lo que sugiere que dicho archivo podria ser una particion del conjunto completo.

El modelo base Ornith-1.5 se distingue por su marco de auto-mejora: el modelo genera sus propias tareas, crea andamiajes especificos para cada tarea y produce soluciones para aprendizaje por refuerzo, cerrando un bucle de mejora continua. No se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el tag `conversational`.
- Posible procesamiento de imagenes: la model card muestra un ejemplo de uso con `mlx_vlm.generate` y un prompt de descripcion de imagen, aunque el pipeline declarado es `text-generation`.
- Soporte de tool calling y function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas explicitamente, aunque el enfoque de auto-mejora del modelo base sugiere cierta capacidad de razonamiento estructurado.
- Multilingue: no se especifican idiomas soportados.

## Casos de uso

- Asistente conversacional en aplicaciones de escritorio o web: el modelo puede mantener dialogos coherentes gracias a su naturaleza conversacional, y su tamano de 9B permite ejecutarlo en una GPU de gama media o en un Mac con suficiente memoria unificada.
- Generacion de texto creativo (redaccion, guiones, contenido marketing): su capacidad de generacion fluida y su licencia permisiva facilitan su integracion en herramientas de creacion de contenido.
- Descripcion de imagenes en entornos Apple Silicon: aunque el pipeline es de texto, la model card sugiere que puede usarse con `mlx-vlm` para tareas de captioning, lo que lo hace util en aplicaciones de accesibilidad o indexacion de medios.
- Prototipado rapido de chatbots en entornos de desarrollo: al estar en formato MLX, se puede cargar directamente con `mlx-vlm` en Mac, reduciendo el tiempo de setup frente a soluciones CUDA.
- Educacion y experimentacion: al ser un modelo abierto con licencia MIT, es adecuado para proyectos academicos que requieran un LLM local sin costes de licencia.
- Despliegue en dispositivos edge: la variante cuantizada del modelo base (Ornith-1.5-9B-Mobile) sugiere que, con cuantizaciones adicionales, podria ejecutarse en moviles, aunque esta conversion concreta en 8-bit aun requiere una GPU o un Mac con suficiente memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada: segun LLM Explorer, la version MLX de Ornith-1.5-9B requiere aproximadamente 17,9 GB de VRAM. Esta conversion en 8-bit podria reducir ese requisito, pero no se dispone de una cifra confirmada.
- GPU recomendadas: para la version completa, se necesitaria una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G). En Mac, se recomienda un chip con al menos 32 GB de memoria unificada (M1 Pro/Max o superior).
- En consumer GPU: si la cuantizacion 8-bit reduce la VRAM por debajo de 16 GB, podria ejecutarse en RTX 4080 o RTX 4070 Ti, pero no hay datos confirmados.
- Opciones de despliegue: al ser formato MLX, se puede usar con `mlx-vlm` (pip install mlx-vlm) y el comando `python -m mlx_vlm.generate`. Tambien podria cargarse con librerias que soporten safetensors, aunque el formato MLX es especifico de Apple.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con modelos de tamano similar (por ejemplo, Llama 3.1 8B, Qwen 2.5 7B, Mistral 7B). No hay datos de rendimiento ni de arquitectura detallada que permitan una comparacion objetiva.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos, alucinaciones o limitaciones de contexto. Se recomienda evaluar el modelo en el dominio de uso antes de desplegarlo en produccion.
- La conversion MLX puede introducir diferencias de comportamiento respecto al modelo original en PyTorch, especialmente en tareas de vision si se usa con `mlx-vlm`.
- El numero de parametros reportado en safetensors (2 975 030 512) no coincide con la denominacion de 9B, lo que podria indicar que el archivo consultado es una particion o que la cuantizacion afecta al conteo. Se debe verificar la integridad del modelo antes de usarlo.
- La licencia MIT permite uso comercial, pero no se incluyen garantias ni responsabilidad por parte del autor de la conversion.
- No se especifican idiomas soportados; el modelo podria tener un rendimiento desigual en lenguas distintas del ingles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FlatFootInternational/Ornith-1.5-9B-MLX-8bit
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Coleccion MLX de ornith-ai: https://huggingface.co/collections/ornith-ai/ornith-15-mlx
- Pagina oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Pagina en Ollama: https://ollama.com/library/ornith-1.5
- Ficha en LLM Explorer: https://llm-explorer.com/model/ornith-ai%2FOrnith-1.5-9B-MLX,2vKynjq3j0X8EOruPo0W2V
