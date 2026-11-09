# kkakkkka/pi05-tomato

## Resumen

pi05-tomato es un conjunto de checkpoints de ajuste fino (fine-tuning) de un modelo de política (policy) para control robótico, publicado por el usuario kkakkkka en Hugging Face bajo el identificador `kkakkkka/pi05-tomato`. El nombre y la estructura de los artefactos (`openpi-managed-releases`, `runtime_assets/big_vision/paligemma_tokenizer.model`, referencias a términos de Gemma) indican que se trata de un derivado del ecosistema OpenPI, el framework de Physical Intelligence para entrenar modelos de visión-lenguaje-acción (VLA) sobre la base de PaliGemma. El modelo no es un LLM de propósito general, sino una política entrenada para ejecutar tareas de manipulación robótica a partir de observaciones visuales e instrucciones.

El repositorio contiene dos grandes familias de checkpoints. La primera, `full`, compara dos cohortes de datos: una con 56 episodios nuevos revisados (`new_passed56`) y otra mixta que añade 47 episodios antiguos sin revisar (`new56_old47`). La segunda, `full/new56_plus_old47`, despliega horizontes de acción de 16 y 32 pasos (`h16` y `h32`), cada uno con su propia normalización calculada solo sobre el conjunto de entrenamiento. Todos los checkpoints listados completaron 30 000 actualizaciones de fine-tuning completo.

La relevancia de esta ficha es acotada: el modelo tiene cero descargas y cero likes en el momento de la consulta, no declara licencia propia más allá de los términos de Gemma referenciados en la model card, y el propio autor advierte que no se realizó ninguna evaluación de éxito en robot real ni ajuste de trayectorias. Se trata, por tanto, de un artefacto de investigación reproducible más que de un modelo listo para producción. El tamaño del repositorio, 49,8 GB, corresponde a los pesos completos y assets de inferencia de varias versiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política VLA derivada de OpenPI/PaliGemma (no se detalla la arquitectura interna en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (la model card no declara idiomas) |
| Licencia | no disponible como licencia propia; se aplican los términos de Gemma (`LICENSE_GEMMA.txt`, incluida la sección 3.2) y existe un `LICENSE` de código y un `NOTICE` |
| Formato de pesos | no disponible explícitamente; el repo incluye parámetros de inferencia y assets de runtime, tokenizador `runtime_assets/big_vision/paligemma_tokenizer.model` |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de su pertenencia al ecosistema OpenPI y el uso de un tokenizador PaliGemma compartido (`runtime_assets/big_vision/paligemma_tokenizer.model`). Por la naturaleza de OpenPI, se trata de un modelo de visión-lenguaje-acción que consume observaciones visuales e instrucciones y emite acciones motoras, pero no se detallan capas, mecanismos de atención ni estrategia de fusión multimodal.

En cuanto a datos, la model card ofrece cifras concretas por cohorte. La cohorte `new_passed56` seleccionó 55 de 56 episodios fuente (20 857 frames, 17 590 ventanas h10 completas). La cohorte mixta `new56_old47` seleccionó 102 de 103 episodios (39 616 frames, 35 179 ventanas completas), incorporando 47 episodios antiguos sin revisar. Para los horizontes de acción, h16 cuenta con 32 221 ventanas completas y h32 con 25 765, ambos sobre 102 de 103 grabaciones. Un episodio con timestamps de cámara inválidos fue rechazado en ambas ramas. Cada versión usa normalización calculada exclusivamente sobre entrenamiento y todos los checkpoints completaron 30 000 actualizaciones de fine-tuning completo. El autor indica explícitamente que no hubo selección de mejor checkpoint por validación, ni evaluación de ajuste de trayectorias, ni evaluación en robot real. La revisión citada es `ef73fd6b1ab54dadd9a9703b286f1f18c2ca2296`, con alineación `align_v2`.

## Capacidades

- Control robótico por imitación: genera secuencias de acciones a partir de observaciones visuales e instrucciones, en el marco de OpenPI.
- Múltiples horizontes de acción: checkpoints específicos para h10 (ventanas de 10 pasos), h16 y h32, cada uno con normalización propia.
- Procesamiento multimodal visión-lenguaje: usa el tokenizador PaliGemma compartido, lo que implica entrada de imágenes junto a texto.
- Inferencia reproducible: cada versión incluye parámetros de inferencia completos, assets y instrucciones de carga.
- Verificación de carga en CPU: la model card indica comprobación de política de carga en CPU y de que los parámetros son finitos.
- No se documentan tool calling, function calling, modo thinking, audio ni capacidades de agente multi-paso.

## Casos de uso

- Reproducción de experimentos de imitación robótica: cargar los checkpoints `full/new_passed56` o `full/new56_old47` con los assets de runtime incluidos para replicar el entrenamiento de 30 000 pasos sobre las cohortes descritas, útil para investigadores que quieran auditar el efecto de mezclar datos revisados y no revisados.
- Estudio del efecto de la composición del dataset: comparar la cohorte limpia (55 episodios) con la mixta (102 episodios) permite aislar el impacto de 47 episodios antiguos sin revisar en el comportamiento de la política, aunque sin métricas de éxito en robot real.
- Análisis de horizontes de acción: los checkpoints h16 y h32, con 32 221 y 25 765 ventanas completas respectivamente, permiten estudiar cómo la longitud del horizonte afecta la estabilidad de las predicciones de acción en tareas de manipulación.
- Punto de partida para fine-tuning adicional: al ser checkpoints completos de OpenPI con parámetros finitos verificados, pueden servir como inicialización para nuevos ajustes sobre datos propios de un laboratorio.
- Validación de pipelines de carga en CPU: los assets y la evidencia de reubicación en CPU documentados permiten probar infraestructura de despliegue sin GPU antes de escalar a entrenamiento o inferencia acelerada.
- Referencia para auditoría de licencias: el repositorio incluye `LICENSE_GEMMA.txt`, `NOTICE` y `LICENSE` de código, lo que lo hace útil como caso de estudio de cumplimiento de términos de Gemma en derivados de OpenPI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se incluye evaluación de éxito en tareas con robot real ni ajuste de trayectorias final.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 49,8 GB, pero ese tamaño agrega varias versiones de checkpoints y assets, no una sola.
- GPU recomendadas: no disponibles en la información proporcionada.
- Viabilidad en GPU de consumo: no disponible; no se indica si una versión individual cabe en tarjetas como RTX 4090.
- Opciones de despliegue: la model card menciona instrucciones de carga por versión y evidencia de reubicación en CPU, pero no nombra frameworks concretos como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas VLA de OpenPI/PaliGemma) ni datos de rendimiento que permitan establecer una comparación fundamentada.

## Limitaciones y advertencias

- Sin evaluación real: el autor declara que no hay evaluación de éxito en robot real ni ajuste de trayectorias final; los checkpoints son finales, no seleccionados por validación.
- Datos parcialmente sin revisar: 47 de los episodios de la cohorte mixta son antiguos y no revisados, lo que puede introducir ruido o sesgos no caracterizados.
- Un episodio descartado: un episodio con timestamps de cámara inválidos fue rechazado en ambas ramas, lo que reduce ligeramente el conjunto disponible.
- Licencia: no hay licencia propia declarada; se aplican los términos de Gemma (`LICENSE_GEMMA.txt`, incluida la sección 3.2), con implicaciones para uso comercial que deben revisarse antes de cualquier despliegue productivo.
- Idiomas y contexto: no se declaran idiomas soportados ni longitud de contexto, por lo que no se puede garantizar cobertura multilingüe ni manejo de instrucciones largas.
- Adopción nula: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado, lo que limita la evidencia externa de funcionamiento.
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser una política de imitación, el riesgo principal es la generalización fuera de la distribución de los episodios de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kkakkkka/pi05-tomato
- Cohorte `new_passed56`: https://huggingface.co/kkakkkka/pi05-tomato/tree/main/full/new_passed_56/20261106-step030000
- Cohorte `new56_old47`: https://huggingface.co/kkakkkka/pi05-tomato/tree/main/full/new56_plus_old47/20261106-step030000
- Horizonte h16: https://huggingface.co/kkakkkka/pi05-tomato/tree/main/full/new56_plus_old47/h16/20261109-step030000
- Horizonte h32: https://huggingface.co/kkakkkka/pi05-tomato/tree/main/full/new56_plus_old47/h32/20261109-step030000
- Términos de Gemma referenciados: `LICENSE_GEMMA.txt` (incluido en el repositorio)
- Aviso legal: `NOTICE` (incluido en el repositorio)
- Licencia de código: `LICENSE` (incluido en el repositorio)
- Tokenizador compartido: `runtime_assets/big_vision/paligemma_tokenizer.model`
