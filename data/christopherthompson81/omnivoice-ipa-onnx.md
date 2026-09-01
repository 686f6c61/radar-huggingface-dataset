# christopherthompson81/omnivoice-ipa-onnx

## Resumen

OmniVoice IPA ONNX es una conversión a formato ONNX del modelo de síntesis de voz OmniVoice, desarrollado por k2-fsa, con un ajuste fino adicional que permite al modelo aceptar cadenas de fonemas del Alfabeto Fonético Internacional (IPA) como entrada de texto. El autor, christopherthompson81 (Chris Thompson), distribuye el modelo en varios formatos: el transformer base en fp32, un diff de ajuste fino de 31 MB, y una versión cuantizada a int4 de 472 MB pensada para ejecutarse en navegadores mediante WebGPU.

El modelo base OmniVoice es un sistema de text-to-speech (TTS) masivamente multilingüe que soporta más de 600 idiomas, con arquitectura de diffusion language model no autorregresiva y capacidad de clonación de voz zero-shot y diseño de voz a partir de descripciones textuales. La conversión ONNX mantiene estas capacidades y añade la posibilidad de externalizar la conversión grafema-a-fonema (G2P) a un fonemizador externo, de modo que el modelo recibe directamente secuencias de fonemas IPA. Esto resulta relevante para despliegues en entornos con recursos limitados, como navegadores, donde la cuantización int4 y la ejecución con WebGPU permiten generar unos 4 segundos de audio en aproximadamente 2,8 segundos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion language model no autorregresivo (transformer con backbone Qwen3-0.6B + codec de audio Higgs) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 (MatMulNBits, block size 32, simétrico, solo pesos); int8 per-row para la tabla de embeddings |
| Idiomas soportados | Más de 600 (según el modelo base OmniVoice); el ajuste fino IPA no especifica restricciones adicionales |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (archivos .onnx con pesos externos .onnx.data) |

## Arquitectura y entrenamiento

El modelo base OmniVoice emplea una arquitectura de diffusion language model no autorregresiva. El transformer principal integra un backbone Qwen3-0.6B junto con cabezas de audio, y utiliza un codec Higgs para codificar y decodificar audio a 24 kHz. El proceso de generación de voz se realiza mediante un bucle de difusión que itera 32 veces sobre la salida, lo que condiciona fuertemente la sensibilidad a errores de cuantización en las activaciones.

El ajuste fino IPA se distribuye como un diff de reconstrucción de 31 MB sobre el transformer base. Este diff contiene, para cada capa lineal (q/k/v/o/gate/up/down, 196 módulos en total), factores LoRA con rango r=16 y escala lora_scale = alpha/r = 2.0, además de filas de reemplazo absoluto en la tabla de embeddings (5.572 filas retocadas). El objetivo es que el modelo acepte directamente cadenas de fonemas IPA como entrada, delegando toda la conversión G2P (diccionarios, redes neuronales G2P, acentos, normalización de texto) al fonemizador externo vernacula-phonemizer. No se han publicado datos sobre el conjunto de entrenamiento del ajuste fino ni sobre el preentrenamiento del modelo base.

## Capacidades

- Síntesis de voz multilingüe: genera habla natural en más de 600 idiomas, según las especificaciones del modelo base.
- Clonación de voz zero-shot: puede imitar una voz a partir de una muestra de audio corta sin entrenamiento adicional.
- Diseño de voz: permite crear una voz nueva a partir de una descripción textual de sus características.
- Entrada basada en fonemas IPA: acepta secuencias de fonemas IPA como texto de entrada, lo que traslada la conversión G2P al fonemizador externo.
- Ejecución en navegador: la versión cuantizada int4 está optimizada para onnxruntime-web con WebGPU, manteniendo todos los tensores por debajo de 256 MB para evitar límites de WebGPU.
- Inferencia con cuantización solo de pesos: la cuantización int4 no afecta a las activaciones, que permanecen en fp32, preservando la calidad del audio.

## Casos de uso

- Síntesis de voz en aplicaciones web: la versión int4 puede ejecutarse directamente en el navegador mediante WebGPU, permitiendo generar locuciones en tiempo real sin servidor dedicado. Es adecuada para asistentes virtuales, lectores de pantalla o herramientas de accesibilidad.
- Clonación de voz para doblaje y narración: con una muestra de audio de referencia, el modelo puede replicar una voz concreta para producir audiolibros, podcasts o contenido de vídeo en múltiples idiomas.
- Diseño de voces sintéticas para personajes: la función de voice design permite crear voces personalizadas a partir de descripciones textuales, útil en videojuegos, animación o asistentes de marca.
- Pipeline de TTS con control fonético fino: al aceptar fonemas IPA, el modelo puede integrarse en sistemas donde un fonemizador externo gestiona la pronunciación de nombres propios, términos técnicos o idiomas con ortografía compleja, garantizando una pronunciación precisa.
- Despliegue en dispositivos edge: la cuantización int4 reduce el tamaño del modelo a 472 MB, lo que permite ejecutarlo en hardware con memoria limitada, como mini-PCs o dispositivos embebidos con soporte ONNX Runtime.
- Investigación en TTS multilingüe: al estar disponible en formato ONNX con pesos separados y un diff de ajuste fino, el modelo facilita experimentos de adaptación y evaluación en entornos de inferencia heterogéneos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de voz (MOS, SIM, etc.) en la información disponible. Sin embargo, la model card incluye mediciones de rendimiento de inferencia para la versión cuantizada int4, obtenidas en una RTX 3090 con 16 pasos de difusión y aproximadamente 4 segundos de audio generado:

| Runtime | ms / forward | Tiempo por generación |
|---|---|---|
| onnxruntime-web WASM, 8 hilos | 1295 | 20,7 s |
| onnxruntime-web WebGPU (Chrome/Dawn) | 177 | 2,8 s |

Estos datos indican una mejora de aproximadamente 7,3x al usar WebGPU frente a WASM en el mismo hardware.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. El transformer base en fp32 ocupa 2,45 GB en disco; la versión cuantizada int4 ocupa 472 MB. La VRAM necesaria dependerá del runtime y del tamaño del lote.
- GPU recomendadas: las mediciones de la model card se realizaron con una NVIDIA RTX 3090. Para ejecución en navegador, se requiere una GPU compatible con WebGPU (Chrome/Dawn).
- Compatibilidad con GPU de consumo: sí, la versión int4 está diseñada para ejecutarse en GPUs de consumo mediante WebGPU, y el modelo base puede ejecutarse en GPUs con al menos 4 GB de VRAM (no verificado).
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, WebGPU), onnxruntime-web (WASM o WebGPU), y cualquier framework que soporte el formato ONNX.
- Latencia y throughput: en RTX 3090 con WebGPU, 177 ms por forward y 2,8 s por generación de ~4 s de audio; con WASM, 1295 ms por forward y 20,7 s por generación.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| christopherthompson81/omnivoice-ipa-onnx | ONNX | 472 MB (int4) / 2,45 GB (fp32) | 600+ | Apache 2.0 | Ajuste fino IPA, optimizado para navegador |
| k2-fsa/OmniVoice | PyTorch (original) | no disponible | 600+ | Apache 2.0 | Modelo base sin ajuste IPA, requiere fonemizador propio |
| Prince-1/OmniVoice-Onnx | ONNX | no disponible | 600+ | Apache 2.0 | Conversión ONNX sin el ajuste IPA ni cuantización int4 |

La comparativa se limita a las variantes de OmniVoice disponibles públicamente. No se dispone de datos de rendimiento comparativos con otros sistemas TTS como XTTS o VITS en la información proporcionada.

## Limitaciones y advertencias

- El diff de ajuste fino solo es válido contra el transformer base exacto (verificar el hash sha256 del archivo .onnx.data). Aplicarlo a otros pesos produce un modelo aparentemente funcional pero incorrecto, y no hay forma de detectarlo automáticamente.
- Si se pliegan los pesos del diff y se cargan mediante `SessionOptions.AddInitializer` en ONNX Runtime, los initializers son ignorados silenciosamente en proveedores no CPU, sirviendo el grafo base sin el ajuste IPA. Es necesario escribir el modelo fusionado en disco y cargarlo desde ahí.
- La cuantización dinámica ingenua a INT8 (que cuantiza también las activaciones) produce salida irreconocible como habla, debido a la acumulación de error en el bucle de difusión de 32 iteraciones. Solo la cuantización solo-pesos es segura.
- El modelo base puede presentar errores de pronunciación en idiomas o términos poco representados, a pesar de su amplio soporte multilingüe.
- No se han publicado evaluaciones de sesgos o alucinaciones específicas para este modelo. Como TTS, el riesgo principal es la generación de audio con contenido incorrecto o no deseado si la entrada de texto no está filtrada.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y del codec Higgs para confirmar que no hay restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/christopherthompson81/omnivoice-ipa-onnx
- Repositorio del modelo base: https://github.com/k2-fsa/OmniVoice
- Modelo base en Hugging Face: https://huggingface.co/k2-fsa/OmniVoice
- Conversión ONNX alternativa: https://huggingface.co/Prince-1/OmniVoice-Onnx
- Repositorio del fonemizador vernacula: https://github.com/christopherthompson81/vernacula
- Sitio web de OmniVoice: https://omnivoice.app/
