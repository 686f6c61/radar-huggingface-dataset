# Dijo-404/madhan-tts

## Resumen

Madhan es un perfil de voz para clonación de habla pensado para ejecutarse en el navegador mediante el motor Kural TTS. No se trata de un modelo entrenado desde cero, sino de un artefacto derivado de Qwen/Qwen3-TTS-12Hz-0.6B-Base (revisión `5d83992436eae1d760afd27aff78a71d676296fc`), publicado por el usuario Dijo-404. El paquete incluye una referencia de voz (`reference.json`) preparada con el flujo Kural 4000 y un bundle WebAssembly cuantizado a Q7 copiado del release de Fusor, sin modificar los pesos.

La relevancia del proyecto reside en su enfoque de despliegue: síntesis de voz en la CPU del navegador mediante un runtime WASM (qwen3-tts-wasm), con los pesos base descargados desde un repositorio público y la referencia de voz fijada por revisión y verificada por SHA-256. El modelo base Qwen3-TTS 0.6B es un sistema de texto a voz de 12 Hz de frecuencia de frame, sobre el que este repositorio aplica condicionamiento por referencia de voz en lugar de un fine-tuning completo.

El repositorio es de tamaño reducido (1,1 GB), tiene cero descargas y cero likes en el momento de la consulta, y no declara licencia propia más allá de la que acompaña a los pesos base de Qwen. La model card advierte explícitamente de que el bundle no carga directamente en PyTorch y de que la referencia de voz personal no puede redistribuirse libremente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base Qwen3-TTS-12Hz-0.6B-Base; el bundle se distribuye como WebAssembly Q7) |
| Parametros totales | 0,6B (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q7 (bundle WebAssembly); pesos base en formato original no especificado |
| Idiomas soportados | no disponible (la referencia de voz es de habla inglesa segun el pipeline Kural 4000) |
| Licencia | no disponible como licencia propia; se incluye la licencia del modelo base Qwen, que no cubre la redistribucion de la referencia de voz personal |
| Formato de pesos | WebAssembly (bundle Q7) y `reference.json`; no compatible con carga directa en PyTorch |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-TTS-12Hz-0.6B-Base, un sistema de texto a voz con representacion de audio a 12 Hz y 0,6 mil millones de parametros. Sobre esta base, el repositorio Madhan no aplica un entrenamiento nuevo: empaqueta un perfil de voz condicionado por referencia, generado mediante el flujo Kural 4000, junto con el bundle WebAssembly Q7 publicado por Fusor. La model card indica que los pesos del bundle se copian sin modificacion desde el release de Fusor en la revisión `5b70db4fa8c56549063892c301a2d8131e7b5d07`.

El pipeline Kural 4000 emplea Qwen3-TTS 1.7B Base como profesor, Whisper y Nemotron para el filtrado de contenido, y la misma revisión de Qwen3-TTS 0.6B Base para un fine-tuning selectivo y exportación a ONNX. Sin embargo, el repositorio actual solo contiene la versión Q7 condicionada por referencia, no los checkpoints resultantes de ese pipeline de entrenamiento. No se dispone de datos sobre volumen de tokens, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, condicionada por una referencia de voz concreta (perfil Madhan).
- Clonación de voz por referencia: el paquete incluye `reference.json` con la grabación y su transcripción.
- Ejecución en navegador: inferencia sobre la CPU del cliente mediante runtime WebAssembly (qwen3-tts-wasm), sin necesidad de GPU.
- Integración con Kural TTS: descarga de pesos base públicos y obtención de la referencia fijada por parte del servidor de Kural sin token de Hugging Face.
- Verificación de integridad: comprobación de SHA-256 de la referencia antes de la reproducción en el navegador.
- Generación de texto de chat delegada a OpenRouter de forma separada (no forma parte del modelo de voz).
- No se documentan capacidades de tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso.

## Casos de uso

- Lectura de contenido web en el navegador: el bundle WASM permite sintetizar texto con la voz Madhan directamente en la CPU del cliente, sin enviar el texto a un servidor de inferencia.
- Asistentes conversacionales con voz personalizada: combinando la generación de texto vía OpenRouter con la síntesis local de Kural TTS, se puede construir un chat hablado con una voz consistente y verificada por hash.
- Accesibilidad y lectura de documentos: integración en aplicaciones web que necesiten narración de artículos o formularios con un perfil de voz fijo y descargable.
- Demostraciones y prototipos de clonación de voz: el paquete incluye la referencia y la transcripción, lo que facilita reproducir el flujo completo en entornos de investigación.
- Pruebas de despliegue edge: útil para evaluar latencia y calidad de un TTS de 0,6B cuantizado a Q7 en navegador, comparando resultados por hardware y por texto.
- Formación y evaluación de pipelines TTS: el flujo Kural 4000 documentado (profesor 1.7B, filtrado con Whisper y Nemotron, fine-tuning selectivo y exportación ONNX) sirve como referencia para construir nuevos checkpoints de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en navegador sobre CPU del cliente mediante WebAssembly; no requiere VRAM de GPU para el bundle Q7.
- El modelo base tiene 0,6B parametros; el repositorio ocupa 1,1 GB, lo que sugiere un bundle cuantizado manejable en equipos de consumo.
- No se especifican GPU recomendadas ni requisitos de memoria para ejecución fuera del navegador.
- El bundle no carga directamente en PyTorch, por lo que no se puede desplegar con vLLM, TGI o llama.cpp tal cual.
- Opciones de despliegue documentadas: Kural TTS con el runtime qwen3-tts-wasm fijado; OpenRouter para la generación de texto de chat.
- No se dispone de datos de latencia ni throughput; la model card indica que los resultados varían según el texto y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato de despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Madhan (este repositorio) | 0,6B (base Qwen3-TTS) | no disponible | WebAssembly Q7 + reference.json | no disponible (licencia del base Qwen) | Público en Hugging Face, 0 descargas |
| Qwen/Qwen3-TTS-12Hz-0.6B-Base | 0,6B | no disponible | Pesos originales (no especificado) | licencia Qwen | Público en Hugging Face |
| fusorlabs/qwen3-tts-12hz-0.6b-base-web | 0,6B | no disponible | WebAssembly Q7 | no disponible | Público en Hugging Face |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia del repositorio no está declarada; la licencia incluida cubre los pesos base de Qwen pero no autoriza la redistribución de la referencia de voz personal.
- El bundle no es cargable directamente en PyTorch; requiere el runtime qwen3-tts-wasm y el ecosistema Kural TTS.
- La calidad de la clonación depende del texto y del hardware; la model card recomienda revisión auditiva de similitud y ritmo.
- El `reference.json` es público y descargable, lo que expone la grabación y transcripción de referencia a cualquiera; debe considerarse un riesgo de privacidad si la voz pertenece a una persona real.
- No se documentan idiomas soportados más allá del inglés del pipeline Kural 4000.
- Riesgo de alucinación y artefactos de pronunciación inherente a los sistemas TTS; no se han publicado evaluaciones objetivas.
- El repositorio tiene cero descargas y cero likes, sin evidencia de uso en producción ni validación externa.
- No se dispone de información sobre sesgos, contexto máximo ni comportamiento en textos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Dijo-404/madhan-tts
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- Release Q7 de Fusor: https://huggingface.co/fusorlabs/qwen3-tts-12hz-0.6b-base-web/tree/5b70db4fa8c56549063892c301a2d8131e7b5d07
- Kural TTS: https://github.com/Madan94/kural-tts
- Pipeline Kural 4000: https://github.com/TheCoalitionOfPlanets/kural-4000
