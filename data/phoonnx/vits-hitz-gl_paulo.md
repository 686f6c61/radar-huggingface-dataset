# Phoonnx/vits-hitz-gl_paulo

## Resumen

vits-hitz-gl_paulo es un modelo de síntesis de voz (text-to-speech) en formato ONNX, publicado por el usuario Phoonnx como parte del repositorio agregador `Phoonnx/phoonnx-vits`. Se trata de una exportación de una voz VITS concreta, identificada internamente como `hitz/gl_paulo-vits`, empaquetada para su uso con la librería phoonnx, un runtime de inferencia TTS basado en ONNX. El repositorio tiene un tamaño de 0,1 GB, lo que es coherente con un modelo VITS de tamaño reducido orientado a inferencia eficiente.

El modelo resuelve la necesidad de disponer de una voz TTS preconvertida a ONNX, lista para ejecutarse sin depender de frameworks de entrenamiento pesados. La licencia declarada es MIT, aunque la propia model card advierte que las licencias del repositorio de origen se heredan por subcarpeta y que algunas voces incluidas en él no tienen licencia definida. Para esta carpeta concreta, la card no aporta información adicional sobre el origen de los datos de entrenamiento ni sobre el idioma.

La información publicada es muy escasa: no se detallan idiomas soportados, composición del dataset, ni resultados de evaluación. Esto limita la ficha a los datos estructurales del repositorio y a las características generales conocidas de la arquitectura VITS y del ecosistema phoonnx.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VITS (variational inference text-to-speech), exportada a ONNX |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS; entrada de texto de longitud variable) |
| Tipos de cuantización | no disponible (el repositorio distribuye pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT (según la model card; el repositorio de origen indica licencias por subcarpeta) |
| Formato de pesos | ONNX |
| Tamaño del repositorio | 0,1 GB |
| Librería de inferencia | phoonnx |
| Pipeline | text-to-speech |
| Voice ID | `hitz/gl_paulo-vits` |

## Arquitectura y entrenamiento

VITS es una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo basado en flujos normalizadores y un discriminador adversarial multiperiodo durante el entrenamiento. El resultado es un modelo que genera waveforms directamente a partir de texto sin necesidad de un vocoder separado. La variante aquí distribuida está exportada a ONNX, lo que permite ejecutarla con runtimes ligeros y en CPU sin dependencias de PyTorch.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens o horas de audio utilizadas, el idioma de la voz ni si se aplicaron técnicas de ajuste fino o alineamiento forzado. Tampoco se documentan innovaciones técnicas específicas más allá de la conversión a ONNX para el runtime phoonnx, que es el rasgo diferencial del empaquetado.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech) en formato ONNX.
- Integración con el runtime phoonnx mediante el voice id `hitz/gl_paulo-vits`.
- Ejecución en entornos ligeros gracias al formato ONNX y al tamaño reducido del repositorio (0,1 GB).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje; es un modelo exclusivamente TTS.
- Capacidades multilingües: no disponibles (no se especifica el idioma de la voz).
- No se documentan modos especiales como clonación de voz, control de estilo o emoción.

## Casos de uso

- Lectura por voz de artículos y documentación: el modelo puede convertir texto plano en audio para aplicaciones de accesibilidad o consumo de contenido, aprovechando su formato ONNX para desplegarse en servidores modestos.
- Asistentes de voz embebidos: al ser un modelo VITS de tamaño reducido (repositorio de 0,1 GB), es adecuado para integrarse en dispositivos con recursos limitados mediante el runtime phoonnx.
- Generación de audiolibros y pódcast automatizados: permite sintetizar guiones largos por lotes sin depender de servicios en la nube, siempre que se valide la calidad de la voz para el idioma de destino.
- Sistemas de anuncios y avisos dinámicos: útil en aplicaciones de transporte, comercio o telefonía donde se requiere síntesis rápida de mensajes cortos con baja latencia.
- Pruebas de integración en pipelines TTS: sirve como voz de referencia para validar el funcionamiento de phoonnx y comparar con otras voces del repositorio `Phoonnx/phoonnx-vits`.
- Prototipado de interfaces conversacionales: permite montar un flujo completo de ASR + LLM + TTS en local usando una voz ONNX ligera antes de invertir en voces comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; por el tamaño del repositorio (0,1 GB) se espera que quepa holgadamente en GPUs de gama baja e incluso en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte ONNX Runtime (por ejemplo, GTX 1650, RTX 3060, A100) debería poder ejecutarlo, aunque no hay datos de rendimiento publicados.
- Cabe en GPU consumer: probablemente sí, dado el tamaño reducido, aunque no se confirma en la documentación.
- Opciones de despliegue: runtime phoonnx (basado en ONNX); también podría ejecutarse con ONNX Runtime directamente si se respeta la interfaz del modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vits-hitz-gl_paulo | VITS (ONNX) | 0,1 GB (repo) | no aplica | MIT | Hugging Face |
| Piper (voces rhasspy) | VITS (ONNX) | variable, típicamente < 100 MB por voz | no aplica | MIT / otras según voz | Hugging Face, GitHub |
| Coqui TTS (modelos VITS) | VITS (PyTorch) | variable, cientos de MB | no aplica | MPL 2.0 / otras | GitHub, Hugging Face |
| MMS-TTS (Meta) | VITS (PyTorch) | variable | no aplica | CC-BY-NC 4.0 | Hugging Face |

La comparación se basa en características generales del ecosistema VITS; no se dispone de datos de rendimiento del modelo evaluado frente a estas alternativas.

## Limitaciones y advertencias

- Información muy escasa: no se documentan idioma, dataset, calidad de la voz ni métricas de evaluación, lo que dificulta validar su idoneidad en producción.
- Licencia: la model card declara MIT, pero el repositorio de origen advierte que las licencias se heredan por subcarpeta y que algunas voces no tienen licencia definida. Conviene revisar el README de la carpeta `hitz-gl_paulo` antes de un uso comercial.
- Riesgo de alucinación en TTS: como todo modelo generativo de voz, puede producir pronunciaciones incorrectas o artefactos en texto fuera de dominio, especialmente sin datos de evaluación publicados.
- Sin soporte documentado de control de prosodia, emoción o estilo.
- Sin información sobre sesgos de voz (género, acento, registro) ni sobre el origen de los hablantes del dataset.
- El modelo depende del runtime phoonnx; fuera de ese ecosistema requiere adaptar la interfaz ONNX.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de mantenimiento activo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/vits-hitz-gl_paulo
- Repositorio de origen: https://huggingface.co/Phoonnx/phoonnx-vits
- Runtime phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio kasanoma (referenciado en la licencia del repo de origen): https://github.com/michsethowusu/kasanoma
