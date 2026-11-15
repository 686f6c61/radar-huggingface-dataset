# Phoonnx/matcha-proxectonos_icia-matcha-phonemes

## Resumen

Phoonnx/matcha-proxectonos_icia-matcha-phonemes es un modelo de sintesis de voz (text-to-speech) en formato ONNX, publicado por el proyecto Phoonnx. Se trata de una extraccion de un subdirectorio del repositorio agregado Phoonnx/phoonnx-matcha, que empaqueta voces Matcha listas para su uso con la libreria phoonnx (desarrollada por TigreGotico). El modelo corresponde a la voz identificada como `proxectonos/icia-matcha-phonemes`, orientada a la sintesis a partir de fonemas.

La relevancia de este artefacto es practica: permite desplegar una voz TTS concreta mediante inferencia ONNX sin necesidad de cargar el repositorio completo de voces. El tamano del repositorio es de aproximadamente 0,1 GB, coherente con un modelo acustico Matcha de dimensiones reducidas. No se dispone de informacion sobre arquitectura detallada, numero de parametros ni composicion del dataset de entrenamiento en la informacion proporcionada.

La licencia es GPL-3.0, lo que condiciona de forma importante su uso en productos propietarios. El modelo no registra descargas ni likes en el momento de la consulta y su model card es minima, limitandose a referenciar el repositorio de origen y el identificador de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Matcha (TTS acustico basado en flow matching; detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS por fonemas) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | no disponible |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Matcha, un esquema de sintesis de voz que combina un modelo acustico con generacion basada en flow matching y un vocoder separado para producir la forma de onda. La variante aqui publicada trabaja a nivel de fonemas (`matcha-phonemes`), es decir, recibe una secuencia de fonemas en lugar de texto crudo, por lo que requiere un frontend de normalizacion textual y fonemizacion previo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el vocoder asociado ni si se aplicaron tecnicas de ajuste fino como RLHF o DPO (no aplicables habitualmente en TTS). Tampoco se detalla la innovacion tecnica concreta mas alla de la propia familia Matcha y su empaquetado en ONNX para inferencia portable.

## Capacidades

- Sintesis de voz a partir de secuencias de fonemas (no de texto directo).
- Inferencia en formato ONNX, apta para ejecucion en CPU y GPU mediante runtimes ONNX.
- Integracion con la libreria phoonnx mediante el identificador de voz `proxectonos/icia-matcha-phonemes`.
- Generacion de audio condicionada por una voz concreta (la voz `icia` del conjunto proxectonos).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.
- No se documentan capacidades multilingues especificas.

## Casos de uso

- Sintesis de voz en aplicaciones de lectura asistida: el modelo puede generar audio a partir de fonemas ya normalizados, integrandose en un pipeline TTS donde el frontend textual resuelve la fonemizacion.
- Integracion en asistentes conversacionales locales: al ser un artefacto ONNX pequeno (0,1 GB), puede desplegarse en entornos con recursos limitados para respuestas habladas.
- Generacion de audiolibros o contenido narrado: la voz `icia` permite producir locuciones consistentes cuando se combina con un vocoder compatible.
- Pruebas de accesibilidad: permite anadir salida de voz a interfaces sin depender de servicios en la nube, ejecutando la inferencia en local.
- Investigacion en TTS: sirve como punto de partida para evaluar la familia Matcha y comparar variantes de voces del repositorio phoonnx-matcha.
- Prototipado de pipelines de fonemizacion + sintesis: util para validar frontends de fonemas en castellano o gallego (idioma no confirmado en la informacion disponible) antes de escalar a otras voces.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el tamano del repositorio (0,1 GB) sugiere un modelo acustico ligero que puede ejecutarse en CPU.
- GPU recomendadas: no disponible; al ser ONNX, es compatible con cualquier GPU soportada por ONNX Runtime.
- Cabe en GPU consumer: previsiblemente si, dado el tamano reducido del artefacto, aunque no se confirma en la informacion proporcionada.
- Opciones de despliegue: ONNX Runtime y la libreria phoonnx; requiere un vocoder compatible para producir audio final.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Phoonnx/matcha-proxectonos_icia-matcha-phonemes | no disponible | no aplica | GPL-3.0 | ONNX | Hugging Face (0 descargas) |
| Otras voces de Phoonnx/phoonnx-matcha | no disponible | no aplica | segun subcarpeta | ONNX | Hugging Face |
| Modelos Matcha TTS de referencia | no disponible | no aplica | variable | PyTorch/ONNX | variable |

No se dispone de datos de rendimiento ni de parametros para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- La licencia GPL-3.0 impone obligaciones de copyleft que pueden impedir su uso en productos propietarios sin liberar el codigo derivado.
- La model card es minima y no documenta idioma, vocoder requerido ni condiciones de entrenamiento, lo que dificulta su evaluacion rigurosa.
- Al operar sobre fonemas, no acepta texto crudo: requiere un frontend de normalizacion y fonemizacion adicional.
- No se documentan sesgos, pero al no conocerse el dataset de entrenamiento no puede descartarse sesgo de voz, acento o dominio.
- Riesgo de artefactos acusticos y errores de pronunciacion en fonemas fuera de la distribucion de entrenamiento.
- Sin descargas ni validacion comunitaria registrada, por lo que la fiabilidad en produccion no esta contrastada.
- El identificador de voz (`proxectonos/icia-matcha-phonemes`) esta acoplado a la libreria phoonnx.

## Enlaces

- Hugging Face: https://huggingface.co/Phoonnx/matcha-proxectonos_icia-matcha-phonemes
- Repositorio de origen: https://huggingface.co/Phoonnx/phoonnx-matcha
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
