# BlameOmar/zeta-2.1-oQ4e

## Resumen

zeta-2.1-oQ4e es un checkpoint cuantizado del modelo zeta-2.1, publicado por BlameOmar. No se trata de un modelo entrenado desde cero, sino de una versión de 8.250 millones de parámetros cuantizada con oQ (oMLX v0.7.1) en precisión mixta, con una media efectiva de 4,700 bits por peso. El resultado ocupa 4,514 GiB de tensores y un repositorio de 4,9 GB, lo que facilita su ejecución local en Apple Silicon mediante MLX.

La model card no documenta la arquitectura del modelo base, la longitud de contexto, los idiomas, la licencia ni resultados de benchmarks. Tampoco se especifican datos de entrenamiento, técnicas de alineación como RLHF o DPO, ni capacidades concretas de razonamiento, código o tool calling. La información disponible se limita al proceso de cuantización y a la distribución de bits por tipo de tensor.

Su relevancia actual es práctica: ofrece un checkpoint de ~8B en formato MLX con un peso medio de 4,7 bits, pensado para inferencia con memoria limitada en equipos Apple. Al no haber descargas ni likes y al carecer de pipeline declarado, la validación comunitaria es inexistente por el momento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible; la etiqueta llama sugiere compatibilidad con la familia Llama, sin confirmar |
| Parámetros totales | 8.250.462.208 (8.250 millones; 8,25B) |
| Parámetros activos | no disponible; no se indica que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX affine mixta con grupo 64: 4-bit para el 83,119% de los pesos, 5-bit para el 13,777%, 6-bit para el 3,101% y BF16 para el 0,003%; media efectiva de 4,700 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX; 4,514 GiB de tensores y 4,9 GB de repositorio |
| Librería | mlx |
| Pipeline | no disponible |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creación | 2026-10-20T16:39:14Z |
| Última actualización | 2026-10-20T16:41:12Z |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base: no se confirma si es un transformer denso, un modelo MoE, un híbrido SSM o otra variante. La etiqueta llama del repositorio sugiere compatibilidad con la familia Llama, pero la model card no lo verifica. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset, el tokenizador ni si hubo fases de RLHF, DPO u otro tipo de ajuste.

La innovación técnica documentada es exclusivamente la cuantización. oQ, mediante oMLX v0.7.1, aplica precisión mixta sobre los tensores: la mayor parte de los pesos se almacena en 4 bits con grupo de 64, una fracción menor en 5 y 6 bits, y un residuo mínimo en BF16. La distribución lógica declarada es de 6,858B pesos en 4-bit, 1,137B en 5-bit, 0,256B en 6-bit y 0,000B en BF16, con un total de 8,250B y 4,514 GiB de almacenamiento. No se detalla qué capas reciben mayor precisión ni se aportan métricas de degradación frente al modelo sin cuantizar.

## Capacidades

- Generación de texto: no documentada; el checkpoint contiene un componente de lenguaje de 8,250B, pero no se especifican tareas evaluadas ni calidad esperada.
- Razonamiento, código y matemáticas: no disponible.
- Tool calling o function calling: no disponible.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Capacidades especiales como modo thinking, visión o audio: no disponible.
- Despliegue local en MLX: el checkpoint está preparado para inferencia en Apple Silicon mediante MLX, con un peso efectivo de 4,700 bits/peso y 4,514 GiB de tensores.
- Re-cuantización: la model card indica que fue re-cuantizado con oMLX v0.7.1 y que debe descargarse de nuevo si se tenía una copia anterior.

## Casos de uso

- Prototipado local en Mac: cargar el checkpoint con MLX o mlx-lm en un MacBook con 8-16 GB de memoria unificada para probar prompts y flujos de generación de texto. Es adecuado por su tamaño contenido de 4,514 GiB y su cuantización de 4,7 bits/peso; la calidad final depende del modelo base, que no está evaluado.
- Procesamiento de texto sensible en local: ejecutar resúmenes o clasificación de documentos dentro del dispositivo, sin enviar datos a la nube. El checkpoint cabe en equipos Apple Silicon de 8 GB o más, aunque debe validarse el contexto máximo y la precisión en la tarea concreta.
- Validación de pipelines MLX en CI: usar el repositorio como fixture para comprobar descarga, carga de safetensors, tokenizador y cuantización en runners macOS. El tamaño de 4,9 GB es manejable y el formato MLX permite probar la ruta de inferencia en Apple Silicon.
- Investigación sobre cuantización mixta: comparar la distribución 4/5/6-bit frente a una versión BF16 del mismo modelo base para medir perplejidad y degradación. La model card proporciona la distribución de bits y el peso efectivo, lo que facilita reproducir el análisis.
- Asistentes offline de bajo consumo: desplegar un chat de texto local en un Mac Mini o portátil Apple Silicon para entornos sin conectividad. La idoneidad depende de que el modelo base soporte instrucciones, extremo no documentado.
- Demostraciones y docencia: incluir el modelo en talleres sobre MLX y cuantización en Apple Silicon para ilustrar la ejecución local de un modelo de ~8B con menos de 5 GiB de pesos. El formato simplifica la distribución, pero no hay benchmarks publicados que respalden afirmaciones de rendimiento.
- Evaluación de latencia en hardware Apple: medir tokens por segundo en chips M1, M2, M3 o M4 con mlx-lm y comparar configuraciones de memoria. No se han publicado cifras de latencia o throughput en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos unos 5 GB solo para los pesos, ya que los tensores ocupan 4,514 GiB. Se recomienda reservar 8 GB o más de memoria unificada para overhead de runtime, tokenizador y caché KV; la caché KV no puede dimensionarse sin conocer la longitud de contexto.
- GPU recomendadas: Apple Silicon con MLX, como series M1, M2, M3 o M4. No se documenta soporte nativo para A100, H100 o RTX 4090, ya que el formato MLX está orientado al ecosistema Apple.
- Compatibilidad con GPU de consumo: sí en Apple Silicon con 8 GB o más de memoria unificada, con margen limitado en 8 GB y más holgado en 16 GB. En GPU de consumo NVIDIA no se puede ejecutar directamente sin conversión de formato.
- Opciones de despliegue: MLX, mlx-lm y oMLX. No se documenta compatibilidad directa con vLLM, TGI, llama.cpp u Ollama; requeriría conversión y validación adicional.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo de primera token.

## Comparativa con modelos similares

No se dispone del modelo base ni de métricas que permitan una comparación rigurosa. La comparación con alternativas de ~8B como Llama 3
