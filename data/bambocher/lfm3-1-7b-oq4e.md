# bambocher/LFM3-1.7B-oQ4e

## Resumen

LFM3-1.7B-oQ4e es una cuantización mixta del modelo LFM3-1.7B, publicada por el usuario bambocher en Hugging Face. El checkpoint original corresponde a la familia LFM3 (Liquid Foundation Model 3) de Liquid AI, aunque la model card no confirma explícitamente el autor del modelo base ni sus características de entrenamiento. Esta versión concreta se ha generado con la herramienta oQ (oMLX v0.7.3), que aplica cuantización de precisión mixta sobre los pesos y los empaqueta en formato MLX para su ejecución en hardware Apple Silicon.

El modelo tiene 1.728.801.536 parámetros (aproximadamente 1,73 mil millones), lo que lo sitúa en la categoría de modelos pequeños optimizados para inferencia local. El checkpoint resultante ocupa 1,038 GB (0,966 GiB) gracias a una media efectiva de 4,801 bits por peso, con la mayor parte de las capas almacenadas en 4 bits afín con grupo de 64 y una fracción significativa (27,9 %) en 5 bits. Esta distribución mixta busca preservar la calidad en las capas más sensibles mientras reduce el tamaño total.

La relevancia de esta ficha radica en que permite ejecutar un modelo de la familia LFM3 en equipos con memoria unificada de Apple (Mac con chip M-series) mediante MLX, sin necesidad de GPU dedicada. No obstante, la información publicada es muy escasa: no hay datos de benchmarks, licencia, idiomas ni pipeline declarados, por lo que muchas especificaciones quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3; la model card no detalla la arquitectura) |
| Parametros totales | 1.728.801.536 (1,73 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización mixta afín: 4 bits (grupo 64), 5 bits (grupo 64), 6 bits (grupo 64), 8 bits (grupo 64) y BF16; media efectiva 4,801 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors con custom_code, librería mlx (formato MLX) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base LFM3-1.7B en la documentación proporcionada. La model card únicamente describe el proceso de cuantización, no la arquitectura subyacente (transformer, MoE, SSM o híbrida). Tampoco se detallan los datos de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica documentada es el esquema de cuantización mixta aplicado con oQ (oMLX v0.7.3). Según la tabla de distribución de bits, el 71,099 % de los pesos lógicos (1,229 B) se almacenan en 4 bits afín con grupo de 64, el 27,901 % (0,482 B) en 5 bits, el 0,970 % (0,017 B) en 6 bits y una fracción residual (0,008 %) en 8 bits y BF16. El almacenamiento total de los tensores es de 0,966 GiB, lo que da una media efectiva de 4,801 bits por peso. Esta estrategia de precisión mixta busca mantener la fidelidad en capas críticas a costa de un tamaño ligeramente superior al de una cuantización uniforme de 4 bits.

## Capacidades

- Generación de texto: capacidad esperable en un modelo de 1,7 B de la familia LFM3, aunque no hay confirmación explícita en la documentación.
- Razonamiento y matemáticas: no disponible (sin benchmarks ni descripción de capacidades).
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución en Apple Silicon: capacidad confirmada por el formato MLX y la librería declarada.

## Casos de uso

- Inferencia local en Mac con chip M-series: el checkpoint en formato MLX está pensado para ejecutarse con la librería MLX de Apple, aprovechando la memoria unificada del equipo. Su tamaño de 1,038 GB permite cargarlo en equipos con 8 GB o 16 GB de RAM unificada.
- Prototipado rápido de aplicaciones de texto en local: al ser un modelo de 1,7 B cuantizado a ~4,8 bits, se puede iterar en un portátil sin depender de servicios en la nube, aunque la calidad final dependerá del modelo base.
- Pruebas de cuantización y evaluación de oQ: este checkpoint sirve como caso de estudio para medir el impacto de la cuantización mixta (4/5/6/8 bits) frente al modelo original en tareas de generación.
- Despliegue en entornos con recursos limitados: su huella de ~1 GB de almacenamiento y su bajo requisito de memoria lo hacen adecuado para dispositivos con poca VRAM o RAM.
- Evaluación comparativa de formatos: útil para comparar el rendimiento de MLX frente a GGUF o safetensors en el mismo modelo base.
- Fines educativos y de investigación: permite estudiar el comportamiento de un modelo pequeño cuantizado sin necesidad de infraestructura de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: al menos ~1,1 GB para cargar los pesos (1,038 GB de almacenamiento) más el overhead de la librería MLX y el contexto; en la práctica se recomienda un mínimo de 4-8 GB de memoria unificada.
- GPU recomendadas: hardware Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con memoria unificada. No se ha validado su ejecución en GPU NVIDIA o AMD según la documentación.
- ¿Cabe en consumer GPU? El formato MLX está orientado a Apple Silicon; para GPUs de consumo convencionales sería necesario convertir el checkpoint a otro formato (por ejemplo, GGUF), lo cual no se documenta.
- Opciones de despliegue: librería MLX (mlx, mlx-lm) en macOS. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones del modelo base que permitan una comparación fiable con alternativas de la misma categoría (por ejemplo, otros modelos de ~1,7 B cuantizados). Se indica "no disponible" en lugar de inferir cifras.

## Limitaciones y advertencias

- La model card no declara licencia, lo que impide confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base LFM3-1.7B antes de cualquier uso en producción.
- No se especifican los idiomas soportados; el comportamiento multilingüe es desconocido.
- No hay información sobre sesgos, alucinación o limitaciones de contexto del modelo base.
- Al ser una cuantización mixta, puede producirse una degradación de calidad respecto al modelo original en tareas sensibles; no se han publicado evaluaciones que lo cuantifiquen.
- El checkpoint está empaquetado para MLX y requiere `custom_code`; no es directamente utilizable en frameworks como PyTorch o TensorFlow sin conversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria de su calidad.
- La fecha de creación indicada (2026-11-14) es futura respecto a la fecha habitual de consulta; conviene verificar la integridad y procedencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/bambocher/LFM3-1.7B-oQ4e
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base LFM3-1.7B: no disponible en la información proporcionada.
