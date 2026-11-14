# bambocher/LFM3-1.7B-oQ2.5

## Resumen

LFM3-1.7B-oQ2.5 es una cuantizacion mixta del modelo LFM3 de 1.700 millones de parametros (1.728.801.536 parametros reales segun los pesos safetensors), publicada por el usuario bambocher en Hugging Face. El modelo base pertenece a la familia LFM3 (Liquid Foundation Model 3) de Liquid AI, aunque la model card del repositorio no documenta el modelo original ni sus caracteristicas. Esta version aplica la tecnica de cuantizacion de precision mixta oQ mediante la herramienta oMLX v0.7.3, desarrollada por jundot en el repositorio omx.

El resultado es un checkpoint de 0.664 GiB (0.713 GB) con un promedio efectivo de 3.301 bits por peso, lo que lo hace especialmente interesante para ejecucion en hardware Apple Silicon mediante el framework MLX. La mayor parte de los pesos (84,4 %) se almacena en formato affine de 3 bits con grupo de 128, mientras que un 15,2 % adicional usa 3 bits con grupo de 64. Solo una fraccion minima (menos del 0,5 % de los pesos) se conserva en precisiones superiores (5, 8 y 16 bits), probablemente capas sensibles como embeddings o normas.

La relevancia de esta ficha es limitada por la escasez de informacion publicada: el repositorio no incluye datos sobre licencia, idiomas, benchmarks ni el modelo base. Se trata de un artefacto de cuantizacion mas que de un modelo documentado de forma independiente, y su utilidad practica depende de la disponibilidad del LFM3 original, que no se detalla en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3; la model card no detalla la arquitectura) |
| Parametros totales | 1.728.801.536 (1,729 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ mixed-precision: affine 3-bit grupo 128 (84,4 %), affine 3-bit grupo 64 (15,2 %), affine 5-bit grupo 64 (0,3 %), affine 8-bit grupo 64 (0,07 %), BF16 (0,02 %); media efectiva 3,301 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria mlx, custom_code) |
| Tamano del checkpoint | 0.664 GiB / 0.713 GB |
| Herramienta de cuantizacion | oQ (oMLX v0.7.3) |
| Fecha de publicacion | 2026-11-14 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base LFM3 en la documentacion proporcionada. El tag `lfm3` sugiere que se trata de un modelo de la familia Liquid Foundation Model 3 de Liquid AI, pero la model card no confirma la arquitectura subyacente (transformer, hibrida o SSM), ni los datos de entrenamiento, ni si hubo fases de RLHF o DPO.

Lo unico documentado tecnicamente es el proceso de cuantizacion: se aplico oQ (oMLX v0.7.3), una tecnica de precision mixta que asigna bits por capa o por tensor segun su sensibilidad. La distribucion resultante concentra el 99,6 % de los pesos en 3 bits, con una cola minima en 5, 8 y 16 bits. El checkpoint final ocupa 0.664 GiB, lo que reduce el modelo original (que en BF16 rondaria los 3,4 GB) a aproximadamente una quinta parte de su tamano.

No se documentan innovaciones adicionales como decodificacion especulativa, atencion lineal ni metodos de entrenamiento especificos.

## Capacidades

- Generacion de texto: capacidad presumible por tratarse de un modelo de lenguaje, aunque no se detalla en la model card.
- Razonamiento y matematicas: no documentado.
- Generacion de codigo: no documentado.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentado.
- Capacidades especiales (thinking mode, vision, audio): no documentado.
- Ejecucion en Apple Silicon via MLX: capacidad confirmada por la libreria y el formato del checkpoint.

La ausencia de informacion sobre capacidades impide confirmar ninguna funcionalidad concreta mas alla de la inferencia de texto generica.

## Casos de uso

- Prototipado local en Mac con Apple Silicon: el checkpoint de 0.664 GiB y el formato MLX permiten cargar el modelo en un Mac con memoria unificada modesta (8 GB o superior) para experimentar con generacion de texto sin depender de GPU dedicada.
- Pruebas de cuantizacion extrema: util como caso de estudio para evaluar la degradacion de calidad de un modelo de 1,7 B al comprimirlo a 3,3 bits/peso efectivos, comparando contra el modelo base en BF16.
- Inferencia en dispositivos con memoria limitada: el tamano reducido permite desplegar el modelo en entornos donde un checkpoint BF16 de 3,4 GB no cabria, como portatiles con poca RAM o contenedores con limites estrictos.
- Evaluacion de la herramienta oQ/oMLX: sirve para validar el flujo de cuantizacion mixta de oMLX v0.7.3 sobre un modelo de la familia LFM3, midiendo perplejidad y calidad frente a cuantizaciones uniformes de 4 bits.
- Experimentacion educativa: adecuado para demostrar como se distribuyen los bits en una cuantizacion mixta real, leyendo la tabla de distribucion de la model card y verificando los tensores del checkpoint.
- Base para fine-tuning ligero en MLX: al ser un checkpoint MLX con custom_code, puede servir de punto de partida para adaptaciones con LoRA en entornos Apple, aunque la licencia no documentada supone un riesgo legal que debe resolverse antes de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 0.7 GB solo para los pesos; con overhead de activaciones y cache KV, se estima un consumo de 1,5 a 3 GB segun longitud de contexto (no confirmado por el autor).
- GPU recomendadas: no disponible. El formato MLX esta disenado para Apple Silicon (M1, M2, M3, M4 y posteriores con memoria unificada).
- Compatibilidad con GPU consumer: si, en Mac con memoria unificada de 8 GB o superior. En GPU NVIDIA no es directamente compatible sin conversion previa a otro formato (por ejemplo GGUF), ya que el checkpoint esta en safetensors para MLX.
- Opciones de despliegue: MLX (libreria nativa), mlx-lm para carga e inferencia. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI con este checkpoint concreto.
- Latencia y throughput: no disponibles. Al ser un modelo de 1,7 B en 3,3 bits, se espera una velocidad alta en Apple Silicon, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de informacion suficiente sobre el modelo base LFM3 ni sobre alternativas comparables en la documentacion proporcionada. Se indica "no disponible" para los campos de rendimiento y licencia de los modelos comparables, ya que no se han facilitado datos de benchmarks ni especificaciones del LFM3 original.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-oQ2.5 (este) | 1,729 B | no disponible | no disponible | safetensors MLX | Hugging Face |
| Modelo base LFM3 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de ~1,7 B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no documentada: la model card no especifica licencia, lo que impide determinar si el uso comercial esta permitido. Es un riesgo legal relevante para produccion.
- Cuantizacion agresiva: 3,301 bits/peso efectivos es una compresion muy alta para un modelo de 1,7 B; es probable una degradacion notable de calidad frente al modelo base en BF16, aunque no se han publicado mediciones.
- Idiomas no documentados: se desconoce si el modelo soporta castellano o solo ingles, y en que grado.
- Contexto no documentado: se desconoce la longitud maxima de contexto, lo que impide planificar casos de uso con conversaciones largas o documentos extensos.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano, y potencialmente amplificado por la cuantizacion extrema; no hay evaluaciones publicadas.
- Sesgos: no documentados; al no conocerse la composicion del dataset de entrenamiento, no se pueden anticipar sesgos especificos.
- Dependencia de custom_code: el checkpoint requiere codigo personalizado para cargarse, lo que anade fragilidad en el despliegue y posibles incompatibilidades con versiones futuras de MLX.
- Sin soporte comunitario: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por terceros.
- Fecha de publicacion futura: el repositorio figura creado el 2026-11-14, lo que puede indicar un artefacto de prueba o una fecha erronea; conviene verificar la integridad antes de usarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bambocher/LFM3-1.7B-oQ2.5
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Modelo base LFM3 de Liquid AI: no disponible en la informacion proporcionada
- Paper o blog del modelo base: no disponible
- Demos: no disponible
