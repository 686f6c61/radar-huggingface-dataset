# grabbou/Wan2.1-T2V-1.3B-CoreAI

## Resumen

Wan2.1-T2V-1.3B-CoreAI es una conversión del modelo de generación de vídeo texto-a-vídeo Wan-AI/Wan2.1-T2V-1.3B-Diffusers al formato Apple Core AI, orientada a su despliegue en dispositivos iOS y macOS. El autor de la conversión es el usuario grabbou, que emplea la receta de exportación del repositorio apple/coreai-models. No se trata de un modelo nuevo ni de un fine-tune con datos adicionales: es un artefacto de despliegue que empaqueta los pesos originales de Wan 2.1 (1.3B parámetros, licencia Apache-2.0) en el formato `.aimodel` que consume el runtime de Apple.

El modelo base es un difusor texto-a-vídeo de la familia Wan 2.1, con un transformer de 1.3B parámetros, un codificador de texto UMT5 y un decodificador VAE. La exportación aplica cuantización 4-bit asimétrica y trocea el VAE en teselas latentes de 32x32 para reducir el pico de memoria, ya que decodificar el vídeo completo de una vez excede el presupuesto de memoria de una app de iPhone. El resultado es un bundle de 4.1 GB que genera clips de 832x480 píxeles y 81 fotogramas (5 segundos a 16 fps).

Su relevancia es práctica: demuestra que un modelo de vídeo de 1.3B puede ejecutarse en el ecosistema Apple (Core AI, Core ML) con cuantización agresiva, aunque con limitaciones claras de memoria en iPhone. Es un artefacto útil para desarrolladores de apps iOS/macOS que quieran integrar generación de vídeo local sin depender de la nube, y un caso de estudio sobre los límites de memoria en dispositivos móviles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusor texto-a-vídeo (transformer + codificador de texto UMT5 + decodificador VAE) |
| Parametros totales | 1.3B (modelo base Wan2.1-T2V-1.3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de difusión; no usa contexto de tokens de la forma habitual) |
| Tipos de cuantizacion | 4-bit asimétrica (`4bit-asym`) para la exportación iOS |
| Idiomas soportados | No disponible (el prompt de texto se procesa con UMT5; el modelo card no detalla idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | Apple Core AI (`.aimodel`): `Transformer.aimodel` (786 MB), `TextEncoder.aimodel` (UMT5, 3.1 GB), `VAEDecoder.aimodel` (141 MB) |

## Arquitectura y entrenamiento

El modelo base Wan2.1-T2V-1.3B es un difusor texto-a-vídeo compuesto por tres componentes: un transformer de difusión de 1.3B parámetros que opera sobre latentes de vídeo, un codificador de texto UMT5 que transforma el prompt en embeddings y un decodificador VAE que reconstruye los fotogramas a partir de los latentes. La exportación a Core AI mantiene esta estructura y la traduce a grafos `.aimodel` ejecutables por el runtime de Apple.

La innovación técnica de este artefacto no está en el entrenamiento (no se ha reentrenado ni ajustado el modelo), sino en el proceso de exportación. Se aplica cuantización 4-bit asimétrica al transformer y al VAE, y el decodificador VAE se exporta de nuevo para teselas latentes de 32x32, de modo que la decodificación se hace por regiones solapadas en lugar de decodificar el vídeo completo de una vez. El exportador de la receta admite teselas mediante `DiffusionExportConfig(vae_tile_size=32)`, pero su interfaz de línea de comandos no lo expone, por lo que el autor incluye `export_tiled_vae.py` para invocarlo directamente. El bundle iOS está trazado para una forma fija: el transformer recibe un latente de 60x104 y el decodificador 21 fotogramas latentes. Para otros tamaños hay que reexportar sin `--platform iOS` (formas dinámicas, para macOS). No se dispone de información sobre datos de entrenamiento, número de tokens ni uso de RLHF/DPO en el modelo base a partir de la información proporcionada.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) a 832x480 píxeles y 81 fotogramas (5 segundos a 16 fps).
- Ejecución local en dispositivos Apple mediante el runtime Core AI, sin llamadas a servicios en la nube.
- Integración con aplicaciones React Native a través de `@react-native-ai/core-ai` y la función `experimental_generateVideo`.
- Integración con Swift mediante `WanPipeline(from:)` del producto `CoreAIVideoDiffusion` de `coreai-models`.
- Decodificación VAE por teselas para reducir el pico de memoria durante la generación.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modo thinking; es un modelo de difusión, no un LLM.
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Generación de vídeo local en apps iOS/macOS: el bundle `ios/` se descarga en el almacenamiento de la app y se invoca con `coreAI.videoModel`, lo que permite crear clips de 5 segundos sin conexión ni coste de API.
- Prototipado de funciones de vídeo generativo en React Native: la integración con `@react-native-ai/core-ai` y `experimental_generateVideo` permite añadir generación de vídeo a una app existente con pocas líneas de TypeScript.
- Demos y pruebas de concepto en macOS: la exportación sin `--platform iOS` admite formas dinámicas y permite generar 81 fotogramas en unos 5 minutos con 2 pasos, con un pico de 6.9 GB, adecuado para portátiles y equipos de escritorio Apple.
- Investigación sobre cuantización y despliegue en el borde: sirve como caso de estudio de cuantización 4-bit asimétrica y decodificación por teselas aplicadas a un difusor de vídeo.
- Generación de clips cortos para redes sociales o storyboards: los 5 segundos a 16 fps y la resolución 832x480 encajan en prototipos de contenido breve.
- Evaluación de la viabilidad de modelos de vídeo en dispositivos móviles: el repositorio documenta el fallo por memoria en iPhone 17 Pro y enlaza el issue de seguimiento, lo que resulta útil para equipos que valoren desplegar difusores de vídeo en el borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento documentados son operativos: en un Mac, la generación de 81 fotogramas con 2 pasos tarda aproximadamente 5 minutos y alcanza un pico de 6.9 GB de memoria. En un iPhone 17 Pro la app se cierra durante la generación por falta de memoria.

## Requisitos de hardware

- VRAM/memoria estimada: el bundle ocupa 4.1 GB en disco. En macOS, el pico de memoria durante la generación es de 6.9 GB, superior al presupuesto por defecto de una app de iPhone.
- GPU recomendadas: no se especifican modelos concretos; el artefacto está pensado para el hardware Apple (Apple Silicon en macOS y chips A-series en iOS).
- ¿Cabe en GPU de consumo? En macOS con Apple Silicon, sí, según el dato de 6.9 GB de pico. En iPhone 17 Pro no cabe con la configuración actual y la app se cierra.
- Opciones de despliegue: runtime Core AI de Apple, con integración vía `@react-native-ai/core-ai` (React Native/TypeScript) o vía `WanPipeline` en Swift. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: 81 fotogramas en unos 5 minutos con 2 pasos en un Mac (aproximadamente 0,27 fotogramas por segundo). No se documenta latencia en iPhone porque la generación no llega a completarse.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion / duracion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.1-T2V-1.3B-CoreAI (este) | 1.3B | 832x480, 81 fotogramas (5 s a 16 fps) | Core AI (`.aimodel`), 4-bit | Apache-2.0 | Hugging Face (grabbou) |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers | 1.3B | No disponible en la informacion | Diffusers (safetensors) | Apache-2.0 | Hugging Face (Wan-AI) |
| Otros modelos texto-a-video de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es con el modelo base original: este artefacto no cambia la calidad del modelo, solo su formato y cuantización. No se dispone de datos de benchmarks para comparar el rendimiento cualitativo entre ambos.

## Limitaciones y advertencias

- En iPhone 17 Pro la app se cierra durante la generación por exceso de memoria; el problema está registrado en callstackincubator/ai#306 y no está resuelto en esta versión.
- El bundle iOS está trazado para una forma fija (latente 60x104 en el transformer y 21 fotogramas latentes en el decodificador); para otras resoluciones o duraciones hay que reexportar el modelo.
- La cuantización 4-bit asimétrica puede degradar la calidad visual respecto a los pesos originales en precisión completa; no se documenta una evaluación de esa degradación.
- Es un artefacto de conversión, no un modelo entrenado: hereda los sesgos y limitaciones del modelo base Wan2.1, que no se detallan en la información disponible.
- Riesgo de alucinación visual y de artefactos propios de los difusores de vídeo; no se documentan métricas de fidelidad al prompt.
- Idiomas soportados no documentados; el comportamiento multilingüe del codificador UMT5 no se evalúa en la model card.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de las dependencias (Core AI, `coreai-models`, `@react-native-ai/core-ai`).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/grabbou/Wan2.1-T2V-1.3B-CoreAI
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
- Receta de exportación de Apple: https://github.com/apple/coreai-models/tree/main/models/wan
- Integración React Native: https://github.com/callstackincubator/ai/tree/main/packages/core-ai
- Issue de memoria en iPhone: https://github.com/callstackincubator/ai/issues/306
