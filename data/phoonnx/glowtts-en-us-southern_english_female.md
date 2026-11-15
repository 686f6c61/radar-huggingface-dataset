# Phoonnx/glowtts-en-us-southern_english_female

## Resumen

`Phoonnx/glowtts-en-us-southern_english_female` es un modelo de sintesis de voz (text-to-speech) en formato ONNX, publicado por el colectivo Phoonnx. Se trata de una extraccion de una unica voz del repositorio agregado `Phoonnx/phoonnx-glowtts`, concretamente la carpeta `en-us-southern_english_female`, y esta empaquetado para su uso con la libreria `phoonnx` (implementacion en Python mantenida por TigreGotico). El modelo se distribuye bajo la etiqueta `license: other` sin que la model card identifique una licencia concreta para esta carpeta.

La relevancia de esta publicacion es practica: ofrece una voz concreta (ingles estadounidense, variante "southern", genero femenino) ya exportada a ONNX, lo que permite inferencia en CPU sin necesidad de framework de entrenamiento. El repositorio ocupa unos 0,1 GB, un tamano coherente con un modelo GlowTTS de escala reducida. No se documentan parametros, contexto ni idiomas adicionales mas alla de los indicados por el nombre de la voz.

La informacion disponible es muy limitada: la model card es esencialmente un puntero al repositorio origen y no incluye detalles de entrenamiento, dataset, benchmarks ni condiciones de uso. Cualquier evaluacion tecnica debe hacerse, por tanto, contra la documentacion de GlowTTS y del proyecto phoonnx, no contra datos publicados en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GlowTTS (TTS no autorregresivo basado en normalizing flows; inferido del nombre del modelo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS: la longitud se mide en fonemas/caracteres de entrada, no en tokens de contexto) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX; el grafo puede ejecutarse en FP32 o convertirse a FP16/INT8, pero no se documenta) |
| Idiomas soportados | ingles estadounidense, variante "southern" (segun el nombre de la voz); no se documentan otros idiomas |
| Licencia | other (sin licencia concreta identificada en la model card) |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,1 GB |
| Libreria de inferencia | phoonnx |
| Voice id | `larynx/en-us-southern_english_female-glow_tts` |

## Arquitectura y entrenamiento

El nombre del modelo indica que se trata de una instancia de GlowTTS, una arquitectura de sintesis de voz no autorregresiva que combina un encoder de texto con un decoder basado en normalizing flows (Glow) para modelar la distribucion de espectrogramas mel. Frente a los TTS autorregresivos tipo Tacotron, GlowTTS permite sintesis en paralelo, lo que reduce la latencia de inferencia. El modelo se distribuye ya exportado a ONNX, presumiblemente para ejecucion en CPU mediante la libreria phoonnx.

No hay informacion en la model card sobre el dataset de entrenamiento, el numero de horas de audio, el hablante de origen, el esquema de alineamiento ni si se aplicaron tecnicas de fine-tuning o adaptacion de voz. Tampoco se documenta el proceso de exportacion a ONNX ni la version de opset utilizada. La unica referencia tecnica es el repositorio agregador `Phoonnx/phoonnx-glowtts`, del que esta carpeta es una extraccion.

## Capacidades

- Sintesis de voz a partir de texto en ingles estadounidense con voz femenina de variante "southern".
- Salida de audio generada por un modelo GlowTTS no autorregresivo, adecuado para inferencia en paralelo.
- Ejecucion via ONNX, lo que permite desplegar en CPU sin GPU dedicada.
- Integracion con la libreria phoonnx mediante el voice id `larynx/en-us-southern_english_female-glow_tts`.
- No se documenta soporte de control de prosodia, emociones, speed/pitch ni SSML.
- No se documenta soporte multilingue, clonacion de voz, tool calling ni capacidades de agente (no aplican a un TTS).
- No se documenta streaming de audio ni salida en tiempo real.

## Casos de uso

- Lectura de articulos y documentos en aplicaciones de accesibilidad: el modelo puede convertir texto en audio con una voz concreta y consistente, y al ejecutarse en ONNX sobre CPU es viable en entornos de escritorio o servidores sin GPU.
- Generacion de locuciones para prototipos y demos: al ocupar 0,1 GB y no requerir framework de entrenamiento, se puede empaquetar en un contenedor ligero para pruebas de producto.
- Audiolibros y contenido narrado de nicho: la variante "southern" del ingles estadounidense permite dotar de caracter regional a la narracion, algo poco comun en voces TTS genericas.
- Sistemas de respuesta por voz en ingles para mercados del sur de EE. UU.: la eleccion de esta voz concreta puede mejorar la identificacion cultural del usuario con el asistente.
- Pruebas de regresion en pipelines de TTS: sirve como voz de referencia fija para comparar calidad y latencia entre versiones de la libreria phoonnx.
- Generacion de audio para entornos sin conectividad o con recursos limitados: al ser ONNX y ligero, encaja en dispositivos edge o en aplicaciones de escritorio offline.
- Investigacion en sintesis de voz: util como checkpoint de referencia para comparar arquitecturas GlowTTS frente a modelos neuronales mas recientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MOS (Mean Opinion Score), metricas de inteligibilidad, latencia ni comparaciones objetivas con otras voces.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo ONNX de 0,1 GB, es probable que quepa en memoria de CPU sin GPU, pero no se documenta el consumo real.
- GPU recomendadas: no disponible; por el tamano del repositorio, cualquier GPU consumer moderna (RTX 3060 o superior) deberia ser suficiente, aunque no hay datos publicados.
- Compatibilidad con GPU consumer: probable, dado el tamano, pero no confirmado por el autor.
- Opciones de despliegue: ONNX Runtime a traves de la libreria phoonnx; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Phoonnx/glowtts-en-us-southern_english_female | GlowTTS (ONNX) | 0,1 GB | en-US (southern) | other | ONNX | Voz unica extraida de un repo agregador |
| Piper (rhasspy/piper-voices) | VITS (ONNX) | variable, tipicamente <100 MB por voz | multiples | MIT (mayoria de voces) | ONNX | Ecosistema maduro de voces ONNX para CPU |
| Coqui TTS (voces GlowTTS/VITS) | GlowTTS / VITS | variable | multiples | MPL-2.0 / otras | PyTorch, ONNX | Framework completo con entrenamiento y fine-tuning |
| Kokoro-82M | StyleTTS2-like | 82M parametros | en, y otros | Apache 2.0 | PyTorch, ONNX | Referencia actual en calidad/tamano para TTS ligero |

La comparacion es orientativa: no hay datos de calidad objetivos para la voz de Phoonnx, y las alternativas citadas pertenecen a proyectos con documentacion y benchmarks publicos. La principal diferencia practica es la licencia: Piper y Kokoro ofrecen licencias permisivas claras, mientras que esta voz queda bajo `other` sin condiciones explicitas.

## Limitaciones y advertencias

- Licencia ambigua: la model card declara `license: other` y no identifica la licencia aplicable a esta carpeta, lo que impide determinar si el uso comercial esta permitido.
- Ausencia total de documentacion sobre el dataset de entrenamiento y el hablante de origen, lo que dificulta evaluar sesgos o procedencia de los datos.
- Riesgo de alucinacion acustica: como todo TTS, puede producir pronunciaciones incorrectas en palabras fuera del vocabulario o en siglas, sin que se documenten mecanismos de mitigacion.
- Cobertura limitada a una unica voz y una unica variante dialectal del ingles estadounidense; no hay soporte multilingue declarado.
- Sin datos de calidad subjetiva (MOS) ni objetivos (WER, latencia), por lo que no se puede comparar rigurosamente con alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni de mantenimiento activo.
- Dependencia de la libreria phoonnx, mantenida por un tercero (TigreGotico); la estabilidad a largo plazo del ecosistema no esta garantizada.
- No se documenta el opset de ONNX ni la version de ONNX Runtime compatible, lo que puede provocar problemas de compatibilidad en despliegues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en-us-southern_english_female
- Repositorio agregador de voces: https://huggingface.co/Phoonnx/phoonnx-glowtts
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Paper original de GlowTTS: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible en la informacion proporcionada
