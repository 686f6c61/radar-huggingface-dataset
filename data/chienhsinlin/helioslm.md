# chienhsinlin/helioslm

## Resumen

HeliosLM (羲和) es una familia de modelos abiertos orientada al chino tradicional de Taiwán, desarrollada por el autor independiente chienhsinlin. La familia se compone de modelos de conversación y de clasificación de seguridad basados en Google Gemma 4 E4B-it, y de modelos de reconocimiento automático del habla (ASR) basados en OpenAI Whisper large-v3. El repositorio `chienhsinlin/helioslm` que se documenta aquí no es el modelo de conversación, sino el contenedor de los checkpoints de investigación originales de HeliosLM: implementaciones de referencia de bloques constructivos habituales de los LLM, ejecutables en CPU.

Estos checkpoints de referencia cubren atención latente, enrutamiento de mezcla de expertos (MoE), atención lineal y decodificación especulativa, e incluyen tests de tipo oracle. Su tamaño va de 8,5 M a 360 M de parámetros, y el checkpoint concreto publicado en este repo (9.020.056 parámetros según safetensors) corresponde a la implementación de referencia más pequeña. El propósito declarado por el autor es el aprendizaje y la investigación, no el uso en producción.

La relevancia actual del proyecto es doble: por un lado, ofrece material didáctico verificable para estudiar variantes arquitectónicas poco habituales en modelos pequeños; por otro, la familia HeliosLM aporta adaptaciones al chino tradicional de Taiwán sobre bases consolidadas (Gemma 4 y Whisper large-v3), un idioma con escasa cobertura específica en el ecosistema abierto. La licencia del repo es Apache-2.0, mientras que cada modelo derivado conserva la licencia de su base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Implementación de referencia de bloques LLM (atención latente, MoE, atención lineal, decodificación especulativa); no es un modelo generativo listo para uso |
| Parámetros totales | 9.020.056 (checkpoint de este repo); la familia de checkpoints de referencia abarca de 8,5 M a 360 M |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (según tags); no se detallan variantes concretas |
| Idiomas soportados | zh (chino tradicional de Taiwán), en |
| Licencia | Apache-2.0 (este repo); los modelos derivados siguen la licencia de su base (Gemma Terms of Use o Apache-2.0) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El repositorio contiene checkpoints de investigación que reproducen, a pequeña escala y con capacidad de ejecución en CPU, componentes arquitectónicos de los LLM modernos: atención latente, enrutamiento de mezcla de expertos, atención lineal y decodificación especulativa. Cada componente se acompaña de tests oracle que verifican la equivalencia funcional frente a una implementación de referencia. Adicionalmente, el repo incluye un experimento de capa de decisión calibrada y su working paper en `docs/`.

No se dispone de información sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni la aplicación de técnicas de alineación como RLHF o DPO para estos checkpoints. Los modelos de la familia HeliosLM (chat, guard y ASR) se construyen por adaptación de Gemma 4 E4B-it y Whisper large-v3, respectivamente, pero sus detalles de entrenamiento se documentan en las model cards de cada modelo, no en este repo.

## Capacidades

- Ejecución de implementaciones de referencia de atención latente, enrutamiento MoE, atención lineal y decodificación especulativa en CPU.
- Verificación mediante tests oracle de la corrección de cada bloque arquitectónico.
- Reproducción del experimento de capa de decisión calibrada descrito en el working paper.
- Material didáctico para estudiar el funcionamiento interno de componentes de LLM a escala reducida.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni comportamiento agéntico para este checkpoint.
- La familia HeliosLM asociada incluye chat bilingüe zh/en, clasificación de seguridad de contenido y ASR centrado en mandarín con refuerzo de hokkien taiwanés.

## Casos de uso

- Estudio de mecanismos de atención: el checkpoint permite inspeccionar y modificar una implementación de atención latente o lineal en un entorno de CPU, con tests que validan que los cambios no rompen la equivalencia funcional.
- Docencia universitaria: sirve como material práctico en asignaturas de aprendizaje automático para ilustrar cómo se implementa y verifica el enrutamiento de expertos sin necesidad de GPU.
- Prototipado de decodificación especulativa: el código asociado permite experimentar con estrategias de decodificación especulativa a pequeña escala antes de trasladarlas a modelos mayores.
- Reproducción de investigación: el working paper incluido en `docs/` y su experimento de capa de decisión calibrada pueden reproducirse íntegramente con los checkpoints del repo.
- Validación de pipelines de evaluación: los tests oracle sirven como base para construir suites de verificación de implementaciones propias de estos bloques.
- Exploración de la familia HeliosLM para aplicaciones en chino tradicional de Taiwán: los modelos derivados (chat, guard, ASR) cubren conversación, moderación de contenido y transcripción de audio, aunque deben consultarse sus propias model cards y licencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint de 9 M de parámetros requiere un consumo de memoria mínimo; el autor indica que los checkpoints de referencia son ejecutables en CPU.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer reciente es sobradamente suficiente, aunque el diseño está pensado para CPU.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: ejecución directa del código de `tonythetiger168/helioslm`; existe una demo en CPU en el Space `chienhsinlin/helioslm`. No se documenta soporte para vLLM, TGI u otros servidores de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HeliosLM (este repo) | 9,02 M | no disponible | Checkpoint de referencia para investigación y docencia | Apache-2.0 | Hugging Face, GitHub, Space |
| nanoGPT | no disponible en la información | no disponible | Implementación educativa de GPT | MIT (no confirmado en la información) | Repositorio público |
| minGPT | no disponible en la información | no disponible | Implementación educativa de GPT | MIT (no confirmado en la información) | Repositorio público |

No se dispone de datos de rendimiento de HeliosLM que permitan una comparación cuantitativa con alternativas. La comparación anterior es únicamente cualitativa y de propósito.

## Limitaciones y advertencias

- Los checkpoints de este repo son implementaciones de referencia para aprendizaje e investigación; el autor advierte explícitamente que no deben usarse en producción.
- No se documentan sesgos conocidos ni tasas de alucinación para estos checkpoints; al no ser modelos generativos de uso general, estas métricas no aplican directamente.
- La información sobre contexto e idiomas de estos checkpoints es limitada; los idiomas declarados (zh, en) corresponden a la familia HeliosLM, no necesariamente a los checkpoints de referencia.
- La licencia Apache-2.0 aplica solo a este repo; los modelos de la familia basados en Gemma 4 están sujetos a los Gemma Terms of Use, lo que condiciona el uso comercial de esos derivados.
- No se especifican requisitos de atribución adicionales ni restricciones de uso más allá de las licencias citadas.
- El repo tiene un volumen de descargas muy bajo (32) y ningún like, por lo que no existe validación comunitaria significativa.

## Enlaces

- Hugging Face del repo: https://huggingface.co/chienhsinlin/helioslm
- Carpeta de documentación: https://huggingface.co/chienhsinlin/helioslm/tree/main/docs
- Modelo de chat: https://huggingface.co/chienhsinlin/helioslm-chat-e4b
- Modelo de seguridad: https://huggingface.co/chienhsinlin/helioslm-guard-e4b
- Modelo ASR v5: https://huggingface.co/chienhsinlin/helioslm-asr-tw-v5
- Modelo ASR v6m: https://huggingface.co/chienhsinlin/helioslm-asr-tw-v6m
- Dataset de evaluación: https://huggingface.co/datasets/chienhsinlin/helioslm-tw-eval
- Código: https://github.com/tonythetiger168/helioslm
- Demo en CPU: https://huggingface.co/spaces/chienhsinlin/helioslm
- Sitio web: https://helioslm.pages.dev/
