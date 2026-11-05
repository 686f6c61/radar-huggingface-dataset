# jk797/LFM3-1.7B-MLX-oQ5e

## Resumen

LFM3-1.7B-MLX-oQ5e es una version cuantizada del modelo LFM3 de 1.700 millones de parametros, publicada por el usuario jk797 en HuggingFace. Se trata de una conversion al formato MLX (el framework de Apple para ejecucion de modelos en silicio de la serie M) mediante la herramienta oQ de oMLX en su version v0.7.4.dev1, que aplica cuantizacion de precision mixta. El checkpoint resultante ocupa 1,3 GB en el repositorio y emplea una media efectiva de 5,701 bits por peso.

El modelo base pertenece a la familia LFM3 (probablemente Liquid Foundation Model, aunque la model card no lo confirma), con 1.728.801.536 parametros totales confirmados a partir de los tensores safetensors. La publicacion no incluye informacion sobre el autor original del modelo, la arquitectura subyacente, los datos de entrenamiento ni los idiomas soportados. El repositorio tiene cero descargas y cero likes en el momento de la consulta.

La relevancia de esta ficha es limitada pero concreta: sirve como ejemplo de cuantizacion mixta con oQ para despliegue en Mac con MLX, y documenta un caso de checkpoint derivado de un modelo base del que no se publican especificaciones. Cualquier evaluacion practica requerira consultar la ficha del modelo LFM3 original, que no se ha proporcionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3; la model card no la describe) |
| Parametros totales | 1.728.801.536 (1,729B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 5-bit grupo 64 (80,244% de pesos), 6-bit grupo 64 (19,659%), 8-bit grupo 64 (0,074%), BF16 (0,022%); media efectiva 5,701 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (libreria mlx, custom_code) |
| Tamano del repositorio | 1,3 GB (1,232 GB de pesos del modelo de lenguaje) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base LFM3 en la documentacion proporcionada. La model card del checkpoint cuantizado no describe si se trata de un transformer denso, un modelo de estado recurrente (SSM), una arquitectura hibrida u otra variante. Tampoco se detallan datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo fases de RLHF, DPO o ajuste por instrucciones.

La unica informacion tecnica disponible se refiere al proceso de cuantizacion. El checkpoint se genero con oQ (oMLX v0.7.4.dev1), una herramienta de cuantizacion de precision mixta que asigna distintos anchos de bit por tensor segun su sensibilidad. La distribucion resultante concentra el 80,244% de los pesos logicos en affine 5-bit con grupo de 64 (0,888 GiB, 5,50 bits/peso efectivos), el 19,659% en affine 6-bit (0,257 GiB, 6,50 bits/peso) y una fraccion residual minima en 8-bit y BF16 (0,002 GiB combinados). El checkpoint completo almacena 1,729B pesos logicos en 1,147 GiB, con una media de 5,701 bits/peso, lo que supone una compresion aproximada de 2,8x respecto a BF16.

## Capacidades

- Generacion de texto: capacidad esperada por tratarse de un modelo de lenguaje de 1,7B parametros, aunque no se documenta en la model card.
- Razonamiento y matematicas: no disponible; no se publican capacidades especificas ni benchmarks.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se listan idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Ejecucion en Apple Silicon: capacidad confirmada por el formato MLX del checkpoint.

## Casos de uso

- Despliegue local en Mac con Apple Silicon: el checkpoint esta en formato MLX y ocupa 1,3 GB, por lo que puede cargarse con la libreria mlx en equipos con memoria unificada de 8 GB o superior, permitiendo inferencia local sin GPU dedicada.
- Prototipado rapido de aplicaciones de texto en macOS: al ser un modelo de 1,7B con cuantizacion de 5,701 bits/peso, permite iterar sobre prompts y flujos conversacionales en un portatil Apple sin depender de servicios en la nube.
- Evaluacion de la herramienta oQ: el checkpoint documenta con detalle la distribucion de bits por tensor, por lo que sirve como caso de referencia para comparar la precision mixta frente a cuantizaciones uniformes de 4 u 8 bits en MLX.
- Generacion de texto en entornos con memoria limitada: el tamano de 1,147 GiB de pesos permite ejecutar el modelo en dispositivos con poca memoria unificada, aunque el contexto disponible limita la longitud de las secuencias.
- Fine-tuning ligero o experimentacion con LoRA: al ser un checkpoint MLX de 1,7B, puede servir de base para experimentos de adaptacion en Mac, siempre que se verifique la licencia del modelo original.
- Integracion en pipelines de generacion de texto offline: para tareas de resumen, clasificacion o redaccion asistida en local, sin enviar datos a terceros, sujeto a la verificacion de la licencia del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 1,3 GB para los pesos en el formato cuantizado; con overhead de ejecucion (KV cache, activaciones) se recomienda un minimo de 4 GB de memoria unificada, y 8 GB para contextos largos.
- GPU recomendadas: no aplica GPU dedicada; el formato MLX esta disenado para Apple Silicon (series M1, M2, M3, M4).
- Cabe en consumer hardware: si, en cualquier Mac con chip Apple Silicon y al menos 8 GB de memoria unificada.
- Opciones de despliegue: libreria mlx y mlx-lm en macOS; no es compatible de forma nativa con vLLM, llama.cpp, Ollama ni TGI sin conversion previa a otro formato.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; se desconoce su comportamiento en dominios sensibles.
- Riesgo de alucinacion: no evaluado; al ser un modelo de 1,7B, la tasa de alucinacion puede ser superior a la de modelos de mayor tamano, pero no hay datos que lo confirmen.
- Limitaciones de contexto e idioma: no disponibles; no se especifica la ventana de contexto ni los idiomas soportados.
- Licencia no disponible: no se puede confirmar el uso comercial del checkpoint ni del modelo base; es imprescindible verificar la licencia del LFM3 original antes de cualquier despliegue en produccion.
- El checkpoint es una cuantizacion de precision mixta: puede presentar una degradacion de calidad respecto al modelo en BF16, especialmente en tareas de razonamiento o codigo, aunque no se han publicado evaluaciones comparativas.
- Dependencia de MLX: el formato no es portable a ecosistemas CUDA sin conversion; el uso queda restringido a hardware Apple.
- Repositorio sin traccion: cero descargas y cero likes, sin garantias de mantenimiento ni soporte por parte del autor.
- La fecha de creacion indicada (2026-11-05) es futura respecto a la fecha habitual de consulta; conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/jk797/LFM3-1.7B-MLX-oQ5e
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
