# bambocher/LFM3-1.7B-oQ2

## Resumen

LFM3-1.7B-oQ2 es una versión cuantizada del modelo LFM3 de 1.700 millones de parámetros (1.728.801.536 pesos según los safetensors), publicada por el usuario bambocher en Hugging Face. Se trata de un checkpoint de inferencia en formato MLX, pensado para ejecutarse en hardware Apple Silicon, que aplica la técnica de cuantización de precisión mixta oQ (oMLX v0.7.3) desarrollada por jundot. El resultado es un checkpoint de 0,604 GiB con una media efectiva de 3,002 bits por peso, lo que permite desplegar un modelo de 1.7B en equipos con memoria unificada modesta.

La relevancia de esta publicación es fundamentalmente práctica: reduce el espacio de almacenamiento y los requisitos de memoria de un modelo de 1.7B a menos de 1 GB, manteniendo una distribución de bits heterogénea que asigna más precisión a las capas sensibles (3 bits en grupo 64 y 128) y comprime agresivamente otras (2 bits en grupo 64). Es, por tanto, un artefacto orientado a la experimentación local y a la inferencia en dispositivos con recursos limitados, no un modelo de propósito general con garantías de calidad documentadas.

La información pública disponible es muy escasa: la model card solo describe el proceso de cuantización y el desglose de bits, sin detallar el modelo base original (LFM3), sus datos de entrenamiento, idiomas, licencia o benchmarks. Cualquier evaluación de capacidades debe hacerse, por tanto, con cautela y verificando el modelo original del que deriva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3; el checkpoint es una cuantización MLX) |
| Parámetros totales | 1.728.801.536 (1,729B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Precisión mixta oQ: affine 2-bit grupo 64, affine 3-bit grupo 128, affine 3-bit grupo 64, affine 6-bit grupo 64 y BF16; media efectiva 3,002 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX), con `custom_code` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base LFM3 en la documentación proporcionada. El checkpoint publicado es un artefacto de cuantización, no un entrenamiento: no hay datos sobre número de tokens, composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card únicamente documenta el proceso de cuantización.

La innovación técnica destacable es el esquema de cuantización de precisión mixta oQ (oMLX v0.7.3), que distribuye los pesos en varios formatos según su sensibilidad. Según la tabla del autor, el 46,237% de los pesos lógicos (0,799B) se almacena en affine 3-bit con grupo 128 (3,25 bits efectivos), el 38,576% (0,667B) en affine 2-bit con grupo 64 (2,50 bits efectivos) y el 15,163% (0,262B) en affine 3-bit con grupo 64 (3,50 bits efectivos). Una fracción residual (0,024%) se mantiene en 6-bit y BF16. El resultado es un checkpoint de 0,604 GiB con 3,002 bits/peso de media, lo que supone una compresión aproximada de 5,3 veces respecto a BF16.

## Capacidades

- Generación de texto: capacidad esperable por tratarse de un modelo de lenguaje de 1.7B, aunque no hay documentación específica del modelo base en la información disponible.
- Razonamiento y matemáticas: no disponible; no se han publicado evaluaciones.
- Generación de código: no disponible; no se han publicado evaluaciones.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se listan idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Inferencia en Apple Silicon: capacidad confirmada por el uso de la librería MLX y el formato de pesos safetensors con `custom_code`.

## Casos de uso

- Experimentación local en Mac con Apple Silicon: el checkpoint de 0,604 GiB cabe holgadamente en la memoria unificada de cualquier Mac moderno (incluso 8 GB), lo que permite probar un modelo de 1.7B sin depender de GPU dedicada.
- Pruebas de cuantización de precisión mixta: útil para investigadores que quieran evaluar el impacto de oQ (2/3 bits con grupos 64 y 128) frente a cuantizaciones uniformes de 4 bits en tareas concretas.
- Prototipado rápido de pipelines de generación de texto: al ocupar menos de 1 GB, se puede cargar y descargar rápidamente en entornos de desarrollo con memoria limitada.
- Evaluación comparativa de formatos MLX frente a GGUF: permite contrastar el rendimiento en latencia y calidad de un checkpoint MLX cuantizado con alternativas de llama.cpp en el mismo hardware.
- Despliegue en dispositivos edge con memoria restringida: el tamaño reducido facilita la inclusión del modelo en aplicaciones locales donde el espacio de almacenamiento es un factor crítico.
- Docencia y demostraciones: un modelo de 1.7B en menos de 1 GB es adecuado para mostrar en clase cómo funciona la cuantización de pesos y qué compromisos introduce en la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 0,6-1 GB para los pesos cuantizados, más overhead de activaciones y caché KV (no cuantificado en este checkpoint). Con contextos largos, el consumo de memoria puede crecer de forma significativa.
- GPU recomendadas: el formato MLX está diseñado para Apple Silicon (series M1, M2, M3, M4). No es un formato directamente compatible con CUDA sin conversión.
- ¿Cabe en GPU de consumo? Sí, en cualquier Mac con Apple Silicon y memoria unificada de 8 GB o superior; también cabría en GPUs de consumo con 4 GB o más si se convirtiera a otro formato (no documentado).
- Opciones de despliegue: MLX (librería `mlx`), con el runtime oMLX utilizado para la cuantización. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI para este checkpoint concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-oQ2 (este) | 1,729B | no disponible | oQ mixta, 3,002 bits/peso | no disponible | Hugging Face (MLX) |
| Modelos comparables de 1.7B en MLX | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas de la misma categoría. Se recomienda consultar el modelo base LFM3 original para obtener datos de referencia.

## Limitaciones y advertencias

- La cuantización agresiva a 2-3 bits puede degradar la calidad de las respuestas respecto al modelo original en BF16; no se aportan métricas que cuantifiquen esa pérdida.
- No se documenta la licencia del modelo base ni la del checkpoint, por lo que no se puede garantizar el uso comercial.
- No se especifican los idiomas soportados; el rendimiento en castellano es desconocido.
- No hay información sobre sesgos, alineación o seguridad del modelo base.
- Riesgo de alucinación inherente a modelos pequeños (1.7B), potencialmente amplificado por la cuantización.
- El formato MLX limita su uso a hardware Apple Silicon; no es portable directamente a CUDA sin conversión.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; carece de validación comunitaria.
- El uso de `custom_code` implica ejecutar código del repositorio, lo que requiere revisión de seguridad antes de cargarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bambocher/LFM3-1.7B-oQ2
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
