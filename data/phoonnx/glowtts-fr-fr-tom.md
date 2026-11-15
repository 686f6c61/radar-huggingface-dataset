# Phoonnx/glowtts-fr-fr-tom

## Resumen

glowtts-fr-fr-tom es un modelo de síntesis de voz (text-to-speech) en formato ONNX, publicado por el usuario Phoonnx en Hugging Face. Se trata de una extracción de una única voz del repositorio agregado Phoonnx/phoonnx-glowtts, concretamente la carpeta `fr-fr-tom`, y está pensado para su uso con la librería phoonnx (implementación en Python del ecosistema TigreGotico). El identificador de voz interno es `larynx/fr-fr-tom-glow_tts`, lo que lo vincula a la familia de voces Larynx basadas en GlowTTS.

El modelo resuelve un problema muy acotado: ofrecer una voz francesa concreta ("tom") empaquetada como artefacto ONNX autocontenido, de forma que pueda cargarse directamente en un pipeline de TTS sin depender del repositorio completo. Su relevancia es, por tanto, operativa más que investigadora: facilita el despliegue de una voz preentrenada en aplicaciones que ya usan phoonnx como motor de síntesis.

La información pública disponible es mínima. El repositorio ocupa aproximadamente 0,1 GB, no registra descargas ni likes, y la model card no aporta datos sobre arquitectura interna, tamaño de parámetros, contexto ni idiomas más allá de la indicación `fr-fr` en el nombre. La licencia figura como `other` sin que el autor especifique sus términos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlowTTS (modelo de síntesis de voz normalizing flow, según el nombre y los tags) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible; se distribuye en ONNX |
| Idiomas soportados | francés (deducido del identificador `fr-fr`); no se detalla en la model card |
| Licencia | other (sin términos especificados por el autor) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El nombre del modelo y sus tags (`glowtts`) indican que se basa en GlowTTS, un modelo de síntesis de voz de tipo normalizing flow que mapea fonemas o caracteres a espectrogramas mel y utiliza un vocoder para generar la forma de onda. La librería phoonnx actúa como runtime para cargar los artefactos ONNX y ejecutar la inferencia.

No se dispone de información sobre el dataset de entrenamiento, el número de horas de audio, el vocoder asociado, ni sobre si se aplicó algún proceso de ajuste fino o alineamiento forzado. La model card únicamente indica que el modelo procede del repositorio Phoonnx/phoonnx-glowtts y conserva las rutas de ficheros originales.

## Capacidades

- Síntesis de voz a partir de texto en francés (voz identificada como "tom").
- Ejecución mediante ONNX, lo que permite inferencia portable en CPU y GPU sin dependencias de framework de deep learning pesado.
- Integración con la librería phoonnx a través del identificador de voz `larynx/fr-fr-tom-glow_tts`.
- No se documentan capacidades de clonación de voz, control de prosodia explícito, multilingüismo, tool calling ni agentes; es un modelo puramente TTS.

## Casos de uso

- Lectura de contenido en francés en aplicaciones de accesibilidad: el modelo puede convertir artículos o notificaciones a audio para usuarios con discapacidad visual, aprovechando el formato ONNX para ejecutarse localmente.
- Asistentes de voz embebidos: al ser un artefacto ONNX de pequeño tamaño (repo de 0,1 GB), puede desplegarse en dispositivos con recursos limitados para dar respuestas habladas en francés.
- Audiolibros y pódcasts automatizados: generación por lotes de narración en francés con una voz consistente, integrándose en pipelines de phoonnx.
- Sistemas de información pública: anuncios en estaciones, aeropuertos o comercios que requieran síntesis en francés sin conexión a servicios en la nube.
- Pruebas de integración en aplicaciones de terceros: sirve como voz de referencia para validar el runtime phoonnx antes de incorporar otras voces del repositorio agregado.
- Prototipado de interfaces conversacionales: permite disponer rápidamente de una voz francesa para demos de asistentes o chatbots sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de calidad (MOS, WER, MCD) ni comparaciones con otras voces.

## Requisitos de hardware

- VRAM estimada: no disponible; por el tamaño del repositorio (0,1 GB), es plausible que quepa en GPU de gama baja, pero no se confirma en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX permite ejecución en CPU, lo que sugiere viabilidad en hardware modesto, aunque sin datos oficiales.
- Opciones de despliegue: ONNX Runtime a través de la librería phoonnx; no se documentan otras integraciones (vLLM, llama.cpp, Ollama o TGI no aplican a un modelo TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glowtts-fr-fr-tom | GlowTTS | ONNX | francés | other | Hugging Face (Phoonnx) |
| Otras voces de Phoonnx/phoonnx-glowtts | GlowTTS | ONNX | varias | other | Hugging Face (Phoonnx) |
| Voces Larynx | GlowTTS / otros | varios | varias | según voz | Repositorio Larynx |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas. La comparación se limita a formato, idioma y licencia.

## Limitaciones y advertencias

- La licencia `other` no especifica términos; el uso comercial queda en un limbo legal hasta que el autor lo aclare.
- La model card no documenta sesgos, calidad de la voz ni condiciones de grabación del hablante original.
- Riesgo de alucinación en TTS: posible pronunciación incorrecta de palabras fuera del dominio de entrenamiento, siglas o nombres propios.
- Solo se confirma el francés como idioma; no hay evidencia de soporte multilingüe.
- El repositorio tiene cero descargas y likes, por lo que no hay validación comunitaria de su funcionamiento.
- Al ser una extracción de un repositorio mayor, posibles dependencias de rutas o ficheros auxiliares del repositorio original podrían afectar a la carga si no se usa phoonnx.
- No hay información sobre el vocoder ni sobre la calidad de audio resultante.

## Enlaces

- [Hugging Face: Phoonnx/glowtts-fr-fr-tom](https://huggingface.co/Phoonnx/glowtts-fr-fr-tom)
- [Repositorio agregado: Phoonnx/phoonnx-glowtts](https://huggingface.co/Phoonnx/phoonnx-glowtts)
- [Repositorio phoonnx en GitHub](https://github.com/TigreGotico/phoonnx)
