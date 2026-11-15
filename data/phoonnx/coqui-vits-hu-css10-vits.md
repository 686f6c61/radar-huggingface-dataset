# Phoonnx/coqui-vits-hu-css10-vits

## Resumen

Phoonnx/coqui-vits-hu-css10-vits es un modelo de síntesis de voz (text-to-speech) publicado por el usuario Phoonnx como parte del repositorio paraguas `Phoonnx/phoonnx-coqui-vits`. Se trata de una conversión al formato ONNX de un modelo Coqui VITS originalmente entrenado con el corpus CSS10 para húngaro (hu-HU), y está empaquetado para su uso con la librería `phoonnx`, un runtime de inferencia TTS basado en ONNX mantenido por TigreGotico.

El modelo resuelve la tarea de convertir texto en audio inteligible en húngaro mediante una arquitectura VITS (Variational Inference with adversarial learning for end-to-end Text-to-Speech), un modelo generativo end-to-end que combina un encoder de texto, un prior normalizing flow, un decoder basado en HiFi-GAN y un discriminador adversarial durante el entrenamiento. Al estar exportado a ONNX, puede ejecutarse en CPU y GPU sin depender del stack original de Coqui TTS.

Su relevancia es acotada pero práctica: ofrece una voz húngara preentrenada y ligera (repo de 0,1 GB) para pipelines de TTS en producción que necesiten evitar dependencias pesadas de PyTorch, integrándose en el ecosistema phoonnx junto con otras voces Coqui convertidas. No obstante, la información pública es mínima: cero descargas, cero likes, sin benchmarks ni model card detallada más allá de la referencia al repositorio de origen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (end-to-end TTS con normalizing flow y decoder HiFi-GAN), exportado a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto de longitud variable) |
| Tipos de cuantización | no disponible (formato ONNX; se desconoce si hay variantes cuantizadas) |
| Idiomas soportados | húngaro (hu-HU), según la model card de origen |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX (librería `phoonnx`) |

## Arquitectura y entrenamiento

El modelo subyacente es Coqui VITS, una arquitectura end-to-end para síntesis de voz que integra en un único modelo un encoder de texto, un prior normalizing flow, un decoder generativo basado en HiFi-GAN y un discriminador adversarial empleado solo durante el entrenamiento. VITS se entrena de forma conjunta con pérdidas adversariales y de verosimilitud, lo que permite generar audio de forma directa desde texto sin necesidad de un vocoder separado en inferencia.

Según la model card, el modelo original fue entrenado sobre el corpus CSS10 para húngaro. No se dispone de información sobre el número de tokens de audio, la composición exacta del dataset, la duración total de las grabaciones ni si se aplicaron etapas de fine-tuning adicionales. La publicación en Hugging Face es una conversión a ONNX del checkpoint original, manteniendo las rutas de ficheros del repositorio `Phoonnx/phoonnx-coqui-vits`, lo que sugiere que no se ha reentrenado ni modificado el modelo, solo exportado para el runtime phoonnx.

## Capacidades

- Síntesis de voz (text-to-speech) en húngaro a partir de texto plano.
- Generación de audio end-to-end sin vocoder externo, gracias a la arquitectura VITS.
- Ejecución mediante ONNX Runtime a través de la librería `phoonnx`, lo que permite despliegue sin PyTorch.
- Integración con el identificador de voz `coqui/hu-css10-vits` dentro del ecosistema phoonnx.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni otras capacidades de lenguaje: es exclusivamente un modelo TTS.
- No se documentan capacidades de clonación de voz, control de estilo, emoción ni multilingüismo más allá del húngaro.

## Casos de uso

- Lectura automática de contenido en húngaro: el modelo puede convertir artículos, documentación o noticias a audio para aplicaciones de accesibilidad o podcasts generados, aprovechando que VITS produce audio inteligible de forma directa desde texto.
- Asistentes de voz para mercados húngaros: integración en interfaces conversacionales que necesiten una voz en húngaro sin depender de APIs comerciales, al estar bajo licencia BSD-3-Clause y ser ejecutable en local vía ONNX.
- Sistemas de navegación o avisos por voz: generación de instrucciones habladas en húngaro en dispositivos con recursos limitados, dado el reducido tamaño del repositorio (0,1 GB) y la posibilidad de ejecución en CPU con ONNX Runtime.
- Audiolibros y contenido educativo: síntesis por lotes de textos largos en húngaro para materiales formativos, usando el modelo como motor TTS dentro de un pipeline de phoonnx.
- Pruebas de integración en pipelines TTS multi-voz: al formar parte de un repositorio con múltiples voces Coqui convertidas, sirve para validar el runtime phoonnx con una voz húngara antes de desplegar otras lenguas.
- Prototipado de aplicaciones de voz sin GPU: al ser un modelo ONNX ligero, permite desarrollar y probar funcionalidades TTS en entornos de desarrollo sin acelerador hardware, sustituyendo después por una voz de mayor calidad si es necesario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) y la naturaleza de VITS, es plausible que el modelo quepa en menos de 1 GB de memoria, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible. Al ser un modelo ONNX de pequeño tamaño, cualquier GPU con soporte ONNX Runtime (por ejemplo, RTX 3060 o superior) debería poder ejecutarlo, pero no hay datos oficiales.
- Compatibilidad con GPU de consumo: probable en la mayoría de GPUs consumer recientes, aunque no confirmado por el autor.
- Opciones de despliegue: ONNX Runtime a través de la librería `phoonnx` (https://github.com/TigreGotico/phoonnx). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no están orientados a TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto / notas |
|---|---|---|---|---|---|
| Phoonnx/coqui-vits-hu-css10-vits | VITS (ONNX) | húngaro | ONNX | BSD-3-Clause | Voz Coqui convertida para phoonnx; sin benchmarks publicados |
| Coqui TTS VITS multilingüe (original) | VITS (PyTorch) | múltiples, incluido húngaro | PyTorch checkpoint | MPL-2.0 / según modelo | Requiere stack Coqui TTS; mayor peso de dependencias |
| Piper TTS (voces húngaras) | VITS (ONNX) | húngaro y otras | ONNX | MIT / según voz | Runtime ligero similar; ecosistema distinto (piper) |
| MMS-TTS (Meta) | VITS (PyTorch) | más de 1000 lenguas, incluido húngaro | PyTorch | CC-BY-NC 4.0 | Licencia no comercial; mayor cobertura lingüística |

La comparación es aproximada: no se dispone de métricas objetivas (MOS, RTF) para este modelo concreto, por lo que la elección frente a alternativas debe basarse en el ecosistema de despliegue (phoonnx frente a Piper o Coqui TTS) y en la licencia.

## Limitaciones y advertencias

- Información pública mínima: cero descargas y cero likes en el momento de la ficha, sin model card detallada ni evaluación de calidad.
- No se han publicado métricas de calidad (MOS, inteligibilidad, naturalidad) ni benchmarks; se desconoce el rendimiento real frente a otras voces húngaras.
- Sesgos conocidos: no documentados; al entrenarse con CSS10 (corpus de audiolibros de dominio público), la voz puede reflejar el estilo y registro de ese corpus, con posibles limitaciones en otros dominios.
- Riesgo de alucinación acústica: como todo modelo generativo TTS, puede producir pronunciaciones incorrectas o artefactos en texto fuera de distribución, aunque no se documenta específicamente.
- Limitación de idioma: solo húngaro; no apto para otros idiomas sin reentrenamiento.
- Licencia BSD-3-Clause: permisiva para uso comercial, pero conviene verificar la procedencia del corpus CSS10 y las condiciones del modelo Coqui original.
- Dependencia del runtime phoonnx: el modelo está empaquetado para esa librería; su uso fuera de ella requiere adaptar el grafo ONNX y el pipeline de pre/post-procesado.
- Sin garantías de mantenimiento: el repositorio tiene una única actualización registrada y no se documenta soporte activo.
