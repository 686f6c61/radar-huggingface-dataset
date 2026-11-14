# proofbird/gector-bert-pt-br

## Resumen

`gector-bert-pt-br` es un modelo de corrección gramatical para portugués de Brasil desarrollado por Proofbird, el equipo detrás de una aplicación de asistencia a la escritura para Windows. Se trata de un etiquetador de secuencias de estilo GECToR construido sobre el encoder BERTimbau (`neuralmind/bert-base-portuguese-cased`) y exportado a ONNX en fp32 para ejecutarse en CPU, sin necesidad de GPU ni de conexión a internet. Su propósito es corregir errores locales de gramática, ortografía y puntuación en textos en portugués brasileño directamente en el dispositivo del usuario.

A diferencia de los modelos generativos, GECToR no reescribe el texto: para cada token predice una etiqueta de edición (mantener, borrar, sustituir por una palabra, añadir una palabra, cambiar mayúsculas o cambiar la forma verbal) y aplica las ediciones de forma iterativa hasta cinco veces. Esto lo hace determinista, auditable y adecuado para ofrecer sugerencias con posición de carácter exacta, en lugar de paráfrasis.

El modelo es relevante por su enfoque de privacidad: el texto nunca sale del equipo, y el modelo se publica precisamente para que cualquiera pueda inspeccionar qué se ejecuta en su máquina. Está entrenado exclusivamente con datos sintéticos generados a partir de Wikipedia en portugués y Tatoeba, sin corpus de aprendices ni datos de usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (BERTimbau) con cabeza de etiquetado de ediciones GECToR y cabeza de detección de errores |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | exportación ONNX en fp32 (no se documentan otras) |
| Idiomas soportados | portugués (variante brasileña) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (fp32) |

## Arquitectura y entrenamiento

El modelo sigue la formulación GECToR: un encoder BERTimbau (MIT) con una cabeza de etiquetado de 5 000 etiquetas de edición y una cabeza adicional de detección de errores. En inferencia, el texto se etiqueta, se aplican las ediciones propuestas y la frase resultante se vuelve a etiquetar hasta cinco iteraciones. Las ediciones son estrictamente locales: el modelo no parafrasea ni reordena el contenido.

El entrenamiento utilizó únicamente datos sintéticos. Se tomaron 2 750 000 frases de Wikipedia en portugués (`wikimedia/wikipedia`, `20231101.pt`), filtrando solo artículos cuya ortografía y uso los identifican como brasileños, y 250 000 frases de Tatoeba (brasileñas o sin marca), que se corrompieron con reglas de error escritas a mano. Aproximadamente el 10 % se dejó limpio para que el modelo aprenda a no tocar texto correcto. Se añadieron 200 000 frases de plantilla para enseñar patrones poco frecuentes en Wikipedia (primera y segunda persona, preguntas, imperativos, concordancia a larga distancia). No se usaron corpus de aprendices ni datos no comerciales, ni texto de usuarios. El ajuste fue de una época (93 918 pasos, batch 64, learning rate 3e-5) en una NVIDIA L4, con identificador de ejecución `2026-11-13-1728`.

## Capacidades

- Corrección de concordancia de género y número (artículos, adjetivos, participios, sustantivos tras determinantes).
- Corrección de concordancia sujeto-verbo (`Os meninos come` → `comem`, `Eles tem` → `têm`).
- Corrección de género de artículos (`um casa` → `uma casa`).
- Resolución de contracciones (`de o` → `do`, `em a` → `na`) y preposiciones duplicadas.
- Corrección del crase (`Vou a praia` → `à praia`).
- Corrección de acentos y diacríticos (`esta cansada` → `está cansada`, `voce` → `você`).
- Corrección del plural de sustantivos en `-ão` (`informaçãos` → `informações`).
- Capitalización al inicio de frase.
- Corrección de errores de registro cotidiano en preguntas, imperativos y primera y segunda persona.
- Salida con sugerencias posicionadas por carácter (`start`, `length`, `original`, `replacement`) para subrayar y ofrecer la corrección.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento.

## Casos de uso

- Asistente de escritura de escritorio: integrado en la aplicación Proofbird para Windows, corrige el texto del usuario en tiempo real sin enviar datos a la nube, gracias a la exportación ONNX que se ejecuta en CPU.
- Corrección en navegador: el Space de demostración ejecuta el modelo en el propio navegador del usuario, útil para entornos con requisitos estrictos de privacidad o para demostraciones sin instalación.
- Preprocesado de corpus en portugués brasileño: normalización de acentos, concordancia y contracciones antes de indexar o analizar textos, con la ventaja de que las ediciones son locales y auditables.
- Revisión de textos en aplicaciones de mensajería o editores web: el modelo devuelve posiciones de carácter exactas, lo que permite subrayar errores y ofrecer correcciones sin reescribir el contenido del usuario.
- Filtrado de calidad en pipelines de datos: detección de errores gramaticales frecuentes en textos generados o recopilados, usando la cabeza de detección de errores y las sugerencias de edición.
- Corrección de documentación y contenido editorial en variedad brasileña: útil para equipos que publican en pt-BR y quieren una comprobación determinista de concordancia y ortografía sin depender de un servicio externo.
- Uso educativo: mostrar al estudiante qué palabra concreta cambiar y por cuál, al ser ediciones locales y no paráfrasis.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| Conjunto gold (603 frases escritas a mano: 420 con un error cada una, 183 correctas, 53 de ellas en formas exclusivamente brasileñas) | 416 corregidas, 183 intactas, 4 no detectadas, 0 empeoradas |
| Falsas alarmas sobre 4 000 frases cotidianas de Tatoeba (brasileñas o sin marca, reservadas del entrenamiento) | 4 cambiadas (0,10 %); 1 de ellas corrige un error del propio texto de Tatoeba |
| Estabilidad: repetición del gold con un token extra al inicio de cada frase | 0 frases cambian de resultado (las 4 filas de capitalización cambian por construcción y no se cuentan) |

Los resultados corresponden a la configuración con las guardas de aplicación de `gector-guards.json`. El modelo se entrenó priorizando la precisión: un error no detectado cuesta menos que una corrección incorrecta.

## Requisitos de hardware

- Inferencia en CPU: el modelo se exporta a ONNX fp32 y está pensado para ejecutarse sin GPU.
- VRAM estimada: no aplica en el caso de uso previsto (CPU); no se documenta el consumo en GPU.
- GPU recomendadas: no disponible; el modelo no requiere GPU.
- Cabe en GPU de consumo: sí, aunque su diseño apunta a CPU; no se especifican requisitos de VRAM.
- Opciones de despliegue: ONNX Runtime (según el quickstart oficial), con dependencias `onnxruntime`, `tokenizers` y `huggingface_hub`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| `proofbird/gector-bert-pt-br` | GECToR sobre BERTimbau, corrección local | pt-BR | no disponible | Apache 2.0 | ONNX fp32 |
| Modelo de portugués europeo de Proofbird | GECToR, corrección local | pt-PT | no disponible | no disponible | no disponible |
| Modelos generativos de corrección gramatical (p. ej. basados en LLM) | Generación/reescritura | multilingüe | variable | variable | safetensors, GGUF, etc. |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre portugués brasileño: deja intacta la ortografía y el uso europeos (`facto`, `equipa`, `autocarro`, `está a trabalhar`) en lugar de cambiarlos.
- No reescribe ni parafrasea: solo propone ediciones locales, por lo que no corrige problemas de estilo, estructura o coherencia global.
- Prioriza la precisión sobre la exhaustividad: puede dejar pasar errores, como un adjetivo tras un verbo en plural sin sujeto visible (`Estamos muito cansado`) o un verbo separado de su sujeto por dos cláusulas.
- Entrenado solo con datos sintéticos: los errores que las reglas de corrupción no generan pueden no estar cubiertos.
- Riesgo de falsas alarmas bajo (0,10 % en Tatoeba), pero no nulo; conviene revisar las sugerencias en producción.
- No se documentan sesgos específicos ni límites de longitud de contexto.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda conservar el aviso de licencia y verificar las condiciones de los datos base (BERTimbau es MIT).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validación externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/proofbird/gector-bert-pt-br
- Demostración en el navegador: https://huggingface.co/spaces/proofbird/try-grammar
- Quickstart en Colab: https://colab.research.google.com/#fileId=https%3A//huggingface.co/proofbird/gector-bert-pt-br/blob/main/quickstart.ipynb
- Archivo `quickstart.py`: https://huggingface.co/proofbird/gector-bert-pt-br/blob/main/quickstart.py
- Etiqueta de versión v1.0.0: https://huggingface.co/proofbird/gector-bert-pt-br/tree/v1.0.0
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Dataset de Wikipedia en portugués: https://huggingface.co/datasets/wikimedia/wikipedia
- Tatoeba: https://tatoeba.org
- Aplicación Proofbird: https://proofbird.app
