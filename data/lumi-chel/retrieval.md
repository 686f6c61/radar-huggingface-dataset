# lumi-chel/retrieval

## Resumen

`lumi-chel/retrieval` es un repositorio experimental publicado en HuggingFace por el usuario lumi-chel que contiene una implementación propia de una arquitectura denominada Dino orientada a tareas de retrieval (recuperación de información multimodal, a juzgar por la etiqueta `dino` y la referencia a Flickr30k). No se trata de un modelo entrenado ni de un checkpoint con resultados publicados: la model card indica explícitamente que `model.safetensors` es un checkpoint de inicialización válido únicamente para pruebas de humo (smoke tests) y que no se reclama ninguna puntuación de benchmark.

El repositorio incluye el código Python (`main.py`), la configuración de arquitectura (`config.json`), la receta de entrenamiento por defecto (`training_args.json`) y el mencionado checkpoint de inicialización. El tamaño declarado en safetensors es de 16.576 parámetros totales, lo que confirma que se trata de una maqueta de arquitectura a escala reducida y no de un modelo funcional a gran escala; la etiqueta "xlarge" de la model card hace referencia a la configuración de arquitectura, no al número de parámetros efectivos.

Su relevancia es, por tanto, la de un artefacto de investigación reproducible: permite inspeccionar decisiones de arquitectura (atención de ventana deslizante, fusión por co-atención, activación mish, normalización InstanceNorm) antes de lanzar un entrenamiento completo. No debe confundirse con un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dino (implementación propia), atención de ventana deslizante, fusión por co-atención, activación mish, normalización InstanceNorm |
| Parametros totales | 16.576 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicialización), PyTorch |

## Arquitectura y entrenamiento

La arquitectura declarada es "Dino", con atención de ventana deslizante, fusión mediante co-atención, función de activación mish y normalización InstanceNorm. La model card describe la escala como "xlarge" en términos de configuración de arquitectura, pero el checkpoint real contiene solo 16.576 parámetros, lo que indica que la configuración incluida es una versión reducida pensada para inspección y pruebas de humo. No se especifica el número de capas, dimensión oculta, número de cabezas ni tamaño de ventana de atención en la información disponible.

En cuanto al entrenamiento, la receta por defecto usa el optimizador AdamW con un schedule de warmup constante. La model card subraya que estos son valores de partida del script y no evidencia de una ejecución completada. No se han publicado datos sobre volumen de tokens, composición del dataset, ni sobre fases de RLHF o DPO. La guía de evaluación del autor propone usar Flickr30k como primer conjunto de evaluación, reportar la métrica de la tarea en al menos tres semillas e incluir una línea base de capacidad equivalente.

## Capacidades

- Recuperación de información (retrieval): el repositorio está etiquetado como `retrieval` y la evaluación sugerida es sobre Flickr30k, lo que apunta a recuperación multimodal texto-imagen.
- Implementación de referencia: incluye código Python ejecutable (`main.py`) con un bloque `__main__` de ejemplo de smoke test.
- Configuración inspeccionable: `config.json` y `training_args.json` permiten revisar y modificar los hiperparámetros de arquitectura y entrenamiento.
- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo.
- No se declara soporte de thinking mode, visión, audio ni ninguna capacidad adicional más allá del propósito de retrieval.

## Casos de uso

- Prototipado de arquitecturas de retrieval: el repositorio sirve para inspeccionar y modificar una implementación de co-atención con ventana deslizante antes de invertir en un entrenamiento completo.
- Pruebas de humo de pipelines de entrenamiento: `main.py` permite validar que el flujo de datos, el optimizador AdamW y el schedule de warmup constante funcionan de extremo a extremo con un checkpoint mínimo.
- Reproducción de experimentos académicos: la receta por defecto y la guía de evaluación (Flickr30k, tres semillas, línea base de capacidad equivalente) facilitan una comparación metodológicamente controlada.
- Base para adaptadores personalizados: al ser una implementación propia, requiere un adaptador explícito para integrarse con APIs de carga automática genéricas, lo que la convierte en un punto de partida para desarrollos a medida.
- Docencia y formación: el tamaño reducido (16.576 parámetros) y la documentación de configuración lo hacen adecuado para explicar decisiones de arquitectura en un curso de deep learning.
- Investigación sobre fusión multimodal: la combinación de co-atención e InstanceNorm puede estudiarse como alternativa a otras estrategias de fusión en tareas de recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 16.576 parámetros, el checkpoint cabe holgadamente en cualquier GPU consumer, pero al ser un checkpoint de inicialización no tiene sentido medir inferencia real.
- GPU recomendadas: no aplica para el checkpoint publicado; para un futuro entrenamiento a escala "xlarge" no se especifican requisitos.
- Cabe en GPU consumer: sí, el checkpoint de inicialización ocupa un espacio negligible (repo de 0,0 GB).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser una implementación propia, requiere un adaptador explícito para APIs de carga automática.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (retrieval multimodal con arquitectura Dino y este tamaño), ni el autor ofrece líneas base con las que contrastar.

## Limitaciones y advertencias

- El checkpoint `model.safetensors` no ha sido entrenado: es una inicialización para smoke tests, no un modelo funcional.
- No se ha auditado robustez, equidad ni transferencia de dominio; la model card lo advierte de forma explícita.
- No hay resultados de benchmarks ni métricas de retrieval publicadas.
- No se especifican sesgos conocidos, pero al no haber entrenamiento no puede evaluarse su comportamiento.
- No se documentan limitaciones de contexto ni de idioma porque no hay modelo entrenado que evaluar.
- Licencia BSD-3-Clause: permisiva para uso comercial, pero la model card recomienda revisar por separado los términos de los datos de origen si se usa con datasets externos.
- Al ser una implementación propia, las APIs genéricas de carga automática no funcionan sin un adaptador explícito, lo que añade fricción de integración en producción.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse por separado de los valores por defecto aquí incluidos.

## Enlaces

- HuggingFace: https://huggingface.co/lumi-chel/retrieval
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
