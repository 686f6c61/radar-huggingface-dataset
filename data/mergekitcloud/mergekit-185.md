# MergekitCloud/mergekit-185

## Resumen

mergekit-185 es un modelo de lenguaje fruto de una fusión (merge) de pesos realizada con la herramienta mergekit, publicada por el usuario MergekitCloud en Hugging Face. Combina el modelo base Qwen/Qwen3-14B con tripplet-research/taipei-4 mediante el método TIES (Trim, Elect Sign & Merge), una técnica que reduce interferencias entre los pesos de los modelos fusionados. El resultado es un transformer denso de aproximadamente 14.765 millones de parámetros (unos 14,8 mil millones), con pesos en bfloat16 y un tamaño de repositorio de 29,5 GB.

El modelo hereda la arquitectura de la familia Qwen3, por lo que se espera que mantenga las capacidades generales de generación de texto y conversación de dicha familia, si bien no se han publicado detalles específicos sobre el proceso de entrenamiento, los datos utilizados ni los resultados de evaluación. La ficha del autor se limita a documentar la configuración del merge y no incluye información sobre licencia, idiomas soportados ni benchmarks.

Su relevancia es limitada y experimental: se trata de un merge sin métricas publicadas, sin descargas ni interacciones en el momento de la consulta, y con una licencia no declarada. Resulta útil como caso de estudio de técnicas de model merging sobre Qwen3-14B, pero no constituye una opción recomendable para producción sin una evaluación previa por parte del usuario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-14B) |
| Parametros totales | 14.765.573.120 (~14,8 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de tipo decoder-only, con la arquitectura de Qwen3-14B como base. No ha sido entrenado desde cero: se ha generado mediante un merge de pesos con mergekit usando el método TIES, tomando Qwen/Qwen3-14B como modelo base y tripplet-research/taipei-4 como modelo secundario, con una densidad de 0,55 y un peso de 0,55 para el modelo secundario. La configuración aplica normalización de pesos, máscara int8 y desactiva el rescalado, con dtype bfloat16 y tokenizador tomado del modelo base.

TIES (Trim, Elect Sign & Merge) poda los parámetros menos relevantes de cada modelo, resuelve los conflictos de signo entre pesos y combina únicamente los valores coincidentes, lo que en teoría preserva mejor las capacidades de los modelos originales que un promedio simple. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo etapas de RLHF o DPO en los modelos de origen más allá de lo que documenten sus respectivas fichas. Tampoco se detalla ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto y conversación multi-turno, heredadas de la arquitectura Qwen3-14B.
- Razonamiento y matemáticas: presumiblemente conserva las capacidades del modelo base, aunque no hay evaluación publicada que lo confirme.
- Generación de código: no verificada en este merge concreto.
- Soporte de tool calling y function calling: no documentado en la ficha del modelo.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Modo thinking, visión o audio: no documentados en la información disponible.

## Casos de uso

- Experimentación con técnicas de model merging: el modelo sirve para estudiar el efecto del método TIES sobre Qwen3-14B y comparar el comportamiento resultante con el del modelo base en tareas controladas.
- Evaluación comparativa de merges: útil como punto de partida para medir si la fusión con taipei-4 mejora o degrada capacidades concretas (razonamiento, estilo conversacional) antes de adoptar el modelo.
- Generación de texto conversacional en entornos de prueba: puede desplegarse en un entorno de staging para validar la calidad de las respuestas frente al Qwen3-14B original.
- Investigación sobre interferencia de pesos: permite analizar cómo afecta la densidad de 0,55 y el peso de 0,55 a la retención de conocimiento del modelo base.
- Prototipado de asistentes conversacionales: al ser compatible con transformers y text-generation-inference, puede integrarse en prototipos internos siempre que se valide previamente su calidad.
- Base para futuros merges: puede emplearse como componente en nuevas fusiones dentro de pipelines de mergekit, dado que sus pesos están en safetensors y bfloat16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, los pesos ocupan aproximadamente 29,5 GB, por lo que se necesitan al menos 32 GB de VRAM para cargar el modelo completo sin cuantizar.
- GPU recomendadas para bfloat16: A100 40 GB, A100 80 GB, H100 80 GB o L40S 48 GB.
- GPU de consumo: no cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) en bfloat16; sería necesario cuantizar a 8 bits (~15 GB) o 4 bits (~8 GB) para que quepa, aunque no se han publicado versiones GGUF ni cuantizaciones oficiales.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible) y, previsiblemente, vLLM y llama.cpp si se generan cuantizaciones propias.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MergekitCloud/mergekit-185 | ~14,8 B | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-14B | ~14,8 B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (modelo base) |
| tripplet-research/taipei-4 | no disponible | no disponible | no disponible | Hugging Face (modelo fusionado) |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar las licencias de Qwen3-14B y taipei-4 antes de cualquier uso en producción.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de que el merge preserve o mejore las capacidades del modelo base.
- Riesgo de degradación por el merge: la fusión de pesos puede introducir interferencias y degradar el rendimiento en tareas específicas respecto a Qwen3-14B.
- Idiomas soportados no documentados: no se puede garantizar un comportamiento multilingüe adecuado.
- Longitud de contexto no documentada en esta ficha: conviene consultar la del modelo base Qwen3-14B antes de asumir una ventana concreta.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin evaluación específica no puede cuantificarse.
- Sesgos: no documentados; se heredan presumiblemente los de los modelos de origen.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- Fecha de creación futura (2026-11-26) en los metadatos: conviene tratar los datos temporales con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MergekitCloud/mergekit-185
- Modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Modelo fusionado taipei-4: https://huggingface.co/tripplet-research/taipei-4
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Paper del método TIES: https://arxiv.org/abs/2306.01708
