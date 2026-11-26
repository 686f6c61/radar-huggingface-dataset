# gutierreznut/contrastive-lab

## Resumen

`gutierreznut/contrastive-lab` es un repositorio de investigación publicado en Hugging Face por el usuario `gutierreznut` que contiene un prototipo de arquitectura denominada **Mixer**, orientada a experimentos de aprendizaje contrastivo. No se trata de un modelo entrenado listo para producción, sino de un esqueleto de implementación con pesos de inicialización (un checkpoint de "smoke test") que sirve como punto de partida reproducible para experimentos propios. El autor lo declara explícitamente: el `model.safetensors` no es un checkpoint entrenado ni auditado.

El repositorio incluye el código Python (`pipeline.py`) con la definición del modelo y un punto de entrada ejecutable, además de `config.json` (arquitectura), `training_args.json` (receta de entrenamiento por defecto con optimizador Lion y scheduler OneCycle) y el propio checkpoint. La escala declarada es "giant", aunque el dato real de parámetros en safetensors es de **16.576**, lo que indica que la configuración "giant" es nominal y no corresponde a un modelo de gran tamaño real.

Su relevancia ahora es limitada y acotada al ámbito de investigación: no hay benchmarks, no hay idiomas declarados, cero descargas y cero likes. Es útil únicamente como plantilla reproducible para quien quiera experimentar con arquitecturas Mixer combinadas con objetivos contrastivos, no como modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixer (atención dilatada, fusión co-attention, activación Mish, normalización InstanceNorm) |
| Parametros totales | 16.576 (según safetensors; la escala nominal declarada es "giant") |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es un **Mixer** con atención **dilatada** (dilated attention), mecanismo de fusión mediante **co-attention**, función de activación **Mish** y normalización **InstanceNorm**. Se trata de una implementación personalizada, no de un transformer estándar, y el autor advierte que las APIs genéricas de carga automática (por ejemplo `AutoModel`) requieren un adaptador explícito antes de poder usarse.

En cuanto al entrenamiento, el repositorio incluye una receta por defecto con optimizador **Lion** y scheduler **OneCycle**, pero el autor aclara que son valores de arranque del script y no evidencia de un entrenamiento completado. No se documenta número de tokens, composición del dataset, ni fases de RLHF/DPO. El checkpoint `model.safetensors` es una inicialización válida para pruebas de humo, no un modelo entrenado. El objetivo declarado es aprendizaje contrastivo, pero no se especifican pares positivos/negativos, temperatura ni función de pérdida concreta.

## Capacidades

- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas o visión.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües (idiomas: no disponible).
- El propósito declarado es servir como base experimental para aprendizaje contrastivo, no como modelo generativo desplegable.
- Incluye un punto de entrada ejecutable (`python pipeline.py --help`) con ejemplo de smoke test.

## Casos de uso

- **Prototipado de arquitecturas Mixer con atención dilatada**: usar `pipeline.py` y `config.json` como base para reproducir y modificar una arquitectura Mixer con co-attention, útil para investigadores que quieran iterar sobre variantes sin partir de cero.
- **Experimentos de aprendizaje contrastivo**: la orientación declarada del repositorio permite integrarlo como esqueleto para entrenar objetivos contrastivos sobre datos propios, ajustando la receta Lion + OneCycle incluida.
- **Pruebas de humo de pipelines de entrenamiento**: el checkpoint de inicialización sirve para validar que un pipeline de entrenamiento arranca, carga pesos y ejecuta un paso hacia delante antes de invertir cómputo real.
- **Comparativas de recetas de optimización**: al incluir `training_args.json` con valores por defecto, permite comparar Lion frente a otros optimizadores bajo la misma exposición de datos y semillas, tal como recomienda el autor.
- **Investigación sobre normalización y activación**: la combinación InstanceNorm + Mish en una arquitectura Mixer es un punto de partida concreto para estudiar el efecto de estas elecciones en tareas contrastivas.
- **Docencia y reproducción de experimentos**: el repositorio documenta formatos de ficheros y configuración, lo que facilita usarlo como material de referencia en cursos o talleres sobre arquitecturas alternativas al transformer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reclama ninguna puntuación de benchmark en el repositorio y que el checkpoint no ha sido entrenado ni auditado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 16.576 parámetros en safetensors, el checkpoint es trivial en tamaño (repo de 0,0 GB), pero al no ser un modelo entrenado no procede estimar VRAM de inferencia útil.
- GPU recomendadas: no disponible. Cualquier GPU consumer basta para cargar el checkpoint de inicialización y ejecutar el smoke test.
- Cabe en cualquier GPU consumer (y previsiblemente en CPU) para el checkpoint de inicialización; no aplica para inferencia real porque no hay modelo entrenado.
- Opciones de despliegue: no disponible para vLLM, TGI u Ollama, dado que es una implementación personalizada sin adaptador publicado. El único punto de entrada documentado es `python pipeline.py`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se identifican en la información proporcionada modelos comparables de la misma categoría (Mixer con atención dilatada y objetivo contrastivo) ni alternativas con parámetros, contexto, rendimiento y licencia documentados. El repositorio no ofrece datos que permitan una comparación rigurosa con otras arquitecturas.

## Limitaciones y advertencias

- El checkpoint `model.safetensors` **no ha sido entrenado**; es una inicialización para pruebas de humo.
- No ha sido auditado para robustez, equidad (fairness) ni transferencia de dominio, según el propio autor.
- No se declaran idiomas soportados ni sesgos conocidos; cualquier uso multilingüe es especulativo.
- No hay benchmarks ni métricas publicadas, por lo que no se puede afirmar rendimiento alguno.
- Implementación personalizada: las APIs automáticas de carga (AutoModel, pipelines de Hugging Face) requieren un adaptador explícito antes de funcionar.
- La licencia MIT permite uso comercial del código, pero el autor advierte revisar por separado los términos de los datos de origen si se usa con datasets externos.
- La escala nominal "giant" no se corresponde con el tamaño real del checkpoint (16.576 parámetros), lo que puede inducir a error si se interpreta como modelo de gran tamaño.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/gutierreznut/contrastive-lab
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos asociados.
