# fpadovani/nld-100mb-after-newlexicon-zipf-nld-heavy-baseline-ckpt500_seed3407

## Resumen

Este modelo es un checkpoint intermedio de un experimento de investigación sobre lenguajes artificiales (PPT-art-lang), desarrollado por fpadovani en el marco de un proyecto académico de la Universidad de Groninga. Se trata de un ajuste fino (SFT) de un modelo base de 100 MB entrenado con un corpus restringido en un lenguaje artificial con distribución Zipf, y este checkpoint concreto aplica un nuevo léxico sobre esa base. El objetivo del experimento es estudiar cómo los modelos de lenguaje adquieren y procesan lenguajes sintéticos con propiedades estadísticas controladas.

Con 124,7 millones de parámetros, la arquitectura es la de un transformer tipo GPT-2, y el modelo está publicado exclusivamente con fines de investigación en adquisición de lenguaje y representaciones lingüísticas. No está pensado para uso en producción ni para tareas generales de NLP: su relevancia es científica, no aplicada. La información pública disponible es escasa: no se especifican licencia, idiomas, ni benchmarks, y el repositorio no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (GPT-2, decoder-only) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere neerlandes, no confirmado) |
| Licencia | no disponible (el README indica "license" sin detalle) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning SFT realizado con TRL (Transformers Reinforcement Learning) sobre el modelo base `fpadovani/ppt-art-lang-newlexicon-zipf-nld-heavy-baseline-100mb_seed3407`. La arquitectura es la de un transformer decoder-only de tipo GPT-2 con aproximadamente 124 millones de parámetros, lo que corresponde al tamaño pequeño de GPT-2. El entrenamiento se realizó con el framework TRL 0.23.0 y Transformers 4.56.2, con seguimiento en Weights & Biases (run `sgb7nqo2`).

El contexto del experimento (proyecto PPT-art-lang) consiste en entrenar modelos sobre corpus artificiales con distribuciones Zipf controladas, en este caso un corpus de 100 MB en un lenguaje artificial denominado "nld-heavy". El checkpoint 500 corresponde a una fase intermedia del entrenamiento, tras aplicar un "new lexicon" (nuevo léxico) sobre el modelo base. No se publican detalles sobre el dataset exacto, el número de tokens de entrenamiento ni el procedimiento de tokenización.

## Capacidades

- Generación de texto autoregresiva: es capaz de continuar secuencias de texto siguiendo el patrón del lenguaje artificial sobre el que fue entrenado.
- La model card incluye un ejemplo de uso con pipeline de text-generation de Transformers, mostrando que puede responder a preguntas en el idioma de entrenamiento.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, ni soporte de agentes.
- No hay evidencia de capacidades multilingües; el entrenamiento se realizó sobre un lenguaje artificial específico.
- No dispone de modo de razonamiento especial, visión ni audio.

## Casos de uso

- Investigación en adquisición de lenguaje: permite estudiar cómo un modelo de tamaño contenido aprende un lenguaje artificial con propiedades estadísticas controladas (Zipf, heavy-tail), comparando checkpoints de distintas fases de entrenamiento.
- Análisis de representaciones lingüísticas: sirve para extraer y analizar representaciones internas de un modelo entrenado sobre un léxico nuevo, con el fin de investigar la formación de categorías sintácticas y semánticas.
- Estudio de la influencia del léxico en el aprendizaje: comparando con los checkpoints sin "newlexicon" (p. ej. `nld-100mb-after-nld-baseline-ckpt500_seed3407`), se puede evaluar el impacto del cambio de vocabulario en el comportamiento generativo.
- Reproducción de experimentos en lingüística computacional: su configuración de entrenamiento está documentada (TRL, SFT, seed 3407), lo que permite reproducir el pipeline en otros entornos.
- Validación de métodos de fine-tuning con corpus sintéticos: los investigadores pueden usar este modelo como punto de partida para probar técnicas de ajuste fino con datos artificiales.
- Docencia en PLN: su tamaño reducido y su disponibilidad pública lo hacen adecuado como ejemplo de modelo de investigación en cursos de procesamiento de lenguaje natural.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 124,7 millones de parámetros, el modelo ocupa aproximadamente 0,5 GB en FP32. Con cuantización a 8 bits (si se aplicara) bajaría a unos 0,25 GB, aunque no hay cuantizaciones publicadas.
- GPU recomendadas: cabe en cualquier GPU consumer con al menos 2 GB de VRAM (p. ej. RTX 2060, GTX 1660, RTX 3060). También se puede ejecutar en CPU.
- Despliegue: compatible con la librería Transformers (pipeline de text-generation), y puede desplegarse con vLLM, TGI o llama.cpp, aunque no hay configuraciones publicadas.
- Latencia: al ser un modelo pequeño, la generación de 128 tokens se puede completar en menos de un segundo en una GPU moderna; en CPU, el tiempo es del orden de segundos.

## Comparativa con modelos similares

No se dispone de datos comparativos de benchmarks entre este modelo y alternativas. Como referencia estructural, se puede comparar con GPT-2 small (124M parámetros), pero no se han publicado resultados de rendimiento de este modelo en tareas estándar. Los modelos hermanos del mismo proyecto (p. ej. `fpadovani/nld-100mb-after-nld-baseline-ckpt500_seed3407` o `fpadovani/jpn-100mb-after-eng-baseline-newlexicon-zipf-ckpt500_seed3407`) comparten arquitectura y configuración, pero tampoco tienen datos públicos de rendimiento.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado para tareas de producción ni para uso comercial.
- Entrenado sobre un lenguaje artificial, no sobre lenguaje natural general; su generación puede ser incoherente o extraña para un hablante humano.
- No se especifica la licencia: la model card indica "license" como placeholder, lo que genera incertidumbre legal sobre su uso.
- No hay documentación de sesgos, pero al ser un modelo pequeño y entrenado sobre un corpus sintético, no se puede garantizar la ausencia de sesgos en las representaciones aprendidas.
- Riesgo de alucinación alto en tareas generales de lenguaje natural, dado que el entrenamiento se limita a un corpus de 100 MB con distribución Zipf.
- No hay garantías de reproducibilidad completa, ya que no se publican todos los detalles del dataset ni los hiperparámetros exactos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fpadovani/nld-100mb-after-newlexicon-zipf-nld-heavy-baseline-ckpt500_seed3407
- Modelo base: https://huggingface.co/fpadovani/ppt-art-lang-newlexicon-zipf-nld-heavy-baseline-100mb_seed3407
- Modelo hermano sin "newlexicon": https://huggingface.co/fpadovani/nld-100mb-after-nld-baseline-ckpt500_seed3407
- Modelo hermano en japonés: https://huggingface.co/fpadovani/jpn-100mb-after-eng-baseline-newlexicon-zipf-ckpt500_seed3407
- Modelo hermano con variante latina: https://huggingface.co/fpadovani/nld-latn-100mb-after-ppt-Dp-100mb-ckpt500_seed3407
- Página de despliegue en FriendliAI: https://friendli.ai/models/fpadovani/nld-100mb-after-nld-baseline-v2-ckpt500_seed3407
