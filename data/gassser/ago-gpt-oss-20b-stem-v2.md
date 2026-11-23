# gassser/ago-gpt-oss-20b-stem-v2

## Resumen

ago-gpt-oss-20b-stem-v2 es un adaptador LoRA publicado por el usuario gassser sobre el modelo base unsloth/gpt-oss-20b-unsloth-bnb-4bit, una versión cuantizada a 4 bits del gpt-oss-20b de OpenAI preparada por Unsloth para entrenamiento e inferencia eficientes. El repositorio contiene únicamente los pesos del adaptador en formato safetensors (0,1 GB), no el modelo completo, por lo que su uso requiere cargar el modelo base y aplicar el adaptador mediante la librería PEFT.

El sufijo "stem" sugiere un ajuste orientado a disciplinas STEM (ciencia, tecnología, ingeniería y matemáticas), aunque la model card no documenta el conjunto de datos, el procedimiento de entrenamiento ni los hiperparámetros empleados. La ficha del autor es la plantilla por defecto de Hugging Face sin completar, de modo que la mayor parte de los metadatos técnicos (licencia, idiomas, evaluación) no están disponibles.

Su relevancia es limitada y experimental: se trata de un fine-tuning comunitario de un modelo abierto de 20 mil millones de parámetros con arquitectura Mixture-of-Experts, publicado en noviembre de 2026 y con 477 descargas. Resulta útil como ejemplo de adaptación ligera sobre gpt-oss-20b, pero no debe considerarse un artefacto listo para producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre gpt-oss-20b, transformer Mixture-of-Experts |
| Parametros totales | no disponible para el adaptador; el modelo base gpt-oss-20b tiene 21 000 millones (dato del modelo base, no verificado en la información proporcionada) |
| Parametros activos | no disponible para el adaptador; el modelo base es MoE (dato del modelo base) |
| Longitud de contexto | no disponible (heredada del modelo base, no documentada aquí) |
| Tipos de cuantizacion | el modelo base se distribuye en bnb-4bit; el adaptador es compatible con PEFT y presumiblemente con GGUF tras fusión, aunque no se documenta |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango entrenado con Unsloth sobre unsloth/gpt-oss-20b-unsloth-bnb-4bit, una variante del gpt-oss-20b de OpenAI cuantizada a 4 bits para reducir los requisitos de memoria durante el ajuste fino. El modelo base emplea una arquitectura transformer con capas Mixture-of-Experts, si bien la información proporcionada no detalla el número de expertos, la dimensión oculta ni la ventana de contexto efectiva.

No se especifican el número de tokens de entrenamiento, la composición del dataset, el rango y alfa del adaptador, la tasa de aprendizaje ni si se aplicaron técnicas de alineación como RLHF o DPO. La única referencia técnica de la model card es la plantilla estándar, que cita el calculador de impacto ambiental de Lacoste et al. (2019) sin aportar valores. Tampoco se documenta ninguna innovación adicional (decodificación especulativa, atención lineal, etc.) más allá de las propias del modelo base.

## Capacidades

- Generación de texto conversacional, heredada del modelo base gpt-oss-20b.
- Razonamiento y resolución de problemas, presumiblemente reforzados por el ajuste orientado a STEM, aunque sin evidencia documentada.
- Generación y asistencia en código y matemáticas, capacidades típicas del modelo base y del dominio declarado en el nombre.
- Soporte de tool calling y function calling: no disponible en la documentación del adaptador (el modelo base lo soporta, pero no se confirma que el fine-tuning lo preserve).
- Razonamiento multi-paso y uso como agente: no disponible.
- Capacidades multilingües: no disponible; el adaptador podría degradar idiomas distintos del inglés si el dataset de ajuste fue monolingüe, algo que no se puede verificar.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Prototipado de asistentes técnicos en dominios STEM: el adaptador puede cargarse sobre el modelo base para experimentar con respuestas orientadas a física, matemáticas o ingeniería, siempre que se valide su calidad con un conjunto de evaluación propio.
- Investigación sobre fine-tuning eficiente: sirve como ejemplo reproducible de cómo aplicar LoRA con Unsloth sobre un modelo MoE cuantizado a 4 bits, útil para estudiar el impacto del ajuste en modelos de 20 000 millones de parámetros.
- Generación de borradores de código en entornos de desarrollo personales: con el modelo base y el adaptador fusionados, puede integrarse en editores o scripts locales para autocompletado y explicación de fragmentos.
- Experimentación académica con adaptadores de bajo rango: permite comparar el comportamiento del modelo base frente al ajustado en tareas de razonamiento cuantitativo, midiendo la degradación o mejora introducida.
- Base para futuros fine-tunings: al ser un adaptador ligero (0,1 GB), puede servir de punto de partida o de referencia para entrenamientos posteriores con datasets propios.
- Despliegue en entornos con recursos limitados tras la fusión y cuantización: el modelo base en 4 bits más el adaptador puede ejecutarse en una única GPU de gama alta de consumo, lo que facilita pruebas locales sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa aproximadamente 0,1 GB; el modelo base en 4 bits requiere del orden de 12-16 GB de VRAM, aunque este dato no está confirmado en la información proporcionada.
- GPU recomendadas: para el modelo base cuantizado a 4 bits, una RTX 4090 (24 GB) o una A100/H100 para mayor throughput; no hay datos específicos del adaptador.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 16-24 GB de VRAM (RTX 4080, 4090, A6000), siempre que se use el modelo base en 4 bits; no verificado.
- Opciones de despliegue: PEFT con Transformers para cargar el adaptador, Unsloth para entrenamiento e inferencia, y vLLM, llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertirlo a GGUF; estas últimas rutas no están documentadas por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| gassser/ago-gpt-oss-20b-stem-v2 | Adaptador LoRA sobre 20B (MoE) | no disponible | no disponible | Hugging Face, 477 descargas | Fine-tuning comunitario sin documentación |
| unsloth/gpt-oss-20b-unsloth-bnb-4bit | 20B (MoE) | no disponible | la del modelo base (no confirmada aquí) | Hugging Face | Modelo base cuantizado a 4 bits |
| gpt-oss-20b (OpenAI) | 20B (MoE) | no disponible | no disponible en esta ficha | Hugging Face / OpenAI | Modelo original sin ajuste |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La model card está sin completar: no hay información sobre datos de entrenamiento, hiperparámetros ni evaluación, lo que impide reproducir el ajuste.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; además, la licencia del adaptador debe ser compatible con la del modelo base gpt-oss-20b.
- Idiomas no declarados: el ajuste podría haber reducido el rendimiento multilingüe del modelo base.
- Riesgo de alucinación inherente al modelo base, potencialmente alterado (mejorado o agravado) por el fine-tuning sin evaluación pública.
- Sesgos desconocidos: al no documentarse el dataset, no es posible identificar sesgos introducidos durante el ajuste.
- El adaptador no incluye el modelo base: su uso requiere descargar por separado unsloth/gpt-oss-20b-unsloth-bnb-4bit y contar con PEFT 0.21.2 o compatible.
- Sin garantías de producción: 477 descargas y 0 likes indican un artefacto experimental de baja validación comunitaria.
- La fecha de creación (noviembre de 2026) y la ausencia de documentación sugieren que no ha pasado por revisiones de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gassser/ago-gpt-oss-20b-stem-v2
- Modelo base: https://huggingface.co/unsloth/gpt-oss-20b-unsloth-bnb-4bit
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculador de impacto ambiental: https://mlco2.github.io/impact
- Librería PEFT: https://github.com/huggingface/peft
- Unsloth: https://github.com/unslothai/unsloth
