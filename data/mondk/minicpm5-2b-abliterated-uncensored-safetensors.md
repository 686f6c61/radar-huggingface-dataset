# mondk/MiniCPM5-2B-Abliterated-Uncensored-Safetensors

## Resumen

El modelo `mondk/MiniCPM5-2B-Abliterated-Uncensored-Safetensors` es una variante sin censura del modelo MiniCPM5-2B, desarrollado originalmente por OpenBMB. La versión base, MiniCPM5-2B, es un transformer denso de 2.000 millones de parámetros diseñado para escenarios de despliegue local, en dispositivos con recursos limitados. Esta variante ha sido creada mediante abliteration, una técnica que modifica los pesos del modelo para eliminar o reducir las restricciones de seguridad impuestas durante el alineamiento, con el objetivo de ofrecer un modelo sin filtros. El autor de esta versión es mondk, y se distribuye bajo licencia Apache 2.0 en formato safetensors. No se dispone de información detallada sobre la longitud de contexto, los idiomas soportados ni los benchmarks en la documentación proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso |
| Parámetros totales | 2B |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (según el nombre del repositorio) |

## Arquitectura y entrenamiento

El modelo base MiniCPM5-2B es un transformer denso de 2B parámetros, que escala la misma receta de entrenamiento utilizada en MiniCPM5-1B. Está diseñado para despliegue on-device, local y en escenarios con recursos limitados. La variante presentada se obtiene aplicando abliteration sobre el modelo base, un proceso que modifica los pesos para eliminar las respuestas de rechazo y censura. No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se utilizaron técnicas como RLHF o DPO.

## Capacidades

No se dispone de una lista detallada de capacidades en la información proporcionada. Al tratarse de un modelo de lenguaje de 2B, se espera que herede las capacidades del modelo base, como generación de texto y razonamiento básico, pero no hay confirmación explícita. El modelo, al ser una versión sin censura, puede generar contenido que el modelo original rechazaría, aunque no se especifican capacidades concretas de tool calling, agentes, visión u otras modalidades.

## Casos de uso

- Investigación en alineación y seguridad: al ser una versión abliterada, resulta útil para estudiar cómo responde un modelo sin filtros y comparar su comportamiento con el modelo base.
- Aplicaciones de chat locales sin restricciones: en entornos controlados donde se necesita un asistente que no rechace ciertos temas, el modelo puede desplegarse localmente gracias a su tamaño reducido.
- Generación de contenido creativo en privado: para prototipos o herramientas de escritura que requieran explorar temas no censurados sin depender de APIs externas.
- Asistentes en dispositivos edge: dado que el modelo base está optimizado para on-device, esta variante puede integrarse en aplicaciones móviles o de escritorio con recursos limitados.
- Pruebas de concepto en entornos sin conexión: para aplicaciones que necesiten procesamiento de lenguaje natural sin conexión a internet y sin restricciones de contenido.
- Experimentación con modelos pequeños en entornos de investigación: para investigadores que quieran comparar el comportamiento de un modelo de 2B antes y después de la abliteration.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible.
- GPU recomendadas: no disponible.
- Capacidad en GPUs de consumo: no confirmado; al ser un modelo de 2B, es plausible, pero no hay datos concretos.
- Opciones de despliegue: no disponibles (se mencionan builds GGUF y MLX-4bit en el model card, pero sin enlaces ni detalles).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Se puede comparar con el modelo base `openbmb/MiniCPM5-2B-Base`, del cual deriva, y con `MiniCPM5-1B`, la versión anterior de la misma serie. La tabla siguiente recoge los datos disponibles; el resto no está documentado.

| Modelo | Parámetros | Licencia | Formato | Contexto |
|---|---|---|---|---|
| mondk/MiniCPM5-2B-Abliterated-Uncensored | 2B | Apache 2.0 | Safetensors | No disponible |
| openbmb/MiniCPM5-2B-Base | 2B | No disponible | No disponible | No disponible |
| MiniCPM5-1B | 1B | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Al ser una versión sin censura creada mediante abliteration, el modelo puede generar contenido dañino, ofensivo o peligroso sin las restricciones del modelo original.
- No se dispone de información sobre sesgos conocidos ni sobre la calidad de las respuestas en comparación con el modelo base.
- Existe riesgo de alucinación, como en cualquier modelo de lenguaje, pero no se han evaluado formalmente estos aspectos.
- La licencia Apache 2.0 permite el uso comercial, pero el usuario es responsable del contenido generado.
- No se han publicado benchmarks ni evaluaciones de seguridad, por lo que su rendimiento real en tareas específicas es desconocido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mondk/MiniCPM5-2B-Abliterated-Uncensored-Safetensors
- Modelo base en Hugging Face: https://huggingface.co/openbmb/MiniCPM5-2B-Base
- Repositorio de OpenBMB para MiniCPM: https://github.com/OpenBMB/MiniCPM
