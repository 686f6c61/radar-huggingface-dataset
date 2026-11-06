# fdiskas/parakeet-tdt-0.6b-v3-lt-onnx

## Resumen

`fdiskas/parakeet-tdt-0.6b-v3-lt-onnx` es una exportación a formato ONNX del modelo `Noctra-labs/parakeet-tdt-0.6b-v3-lt`, un sistema de reconocimiento automático del habla (ASR) de aproximadamente 600 millones de parámetros basado en la arquitectura NeMo Conformer con decodificación TDT (Token-and-Duration Transducer). El modelo original deriva de la familia Parakeet de NVIDIA, concretamente de `parakeet-tdt-0.6b-v3`, que amplía el soporte de idiomas del inglés a 25 lenguas europeas con detección automática de idioma. La variante `-lt` sobre la que se construye esta exportación no especifica en la información disponible qué modificación introduce respecto al modelo base de NVIDIA.

La relevancia de esta ficha concreta reside en su empaquetado: los pesos se han convertido a ONNX con dos variantes del encoder (fp16 para WebGPU e int8 para CPU/WASM) más un decoder-joint en int8, con el objetivo explícito de ejecutar el modelo íntegramente en el navegador mediante la librería `parakeet.js`. Esto lo convierte en una pieza orientada al despliegue edge y client-side, no a servidores de inferencia de alto rendimiento. El repositorio ocupa 1,9 GB y se publica bajo licencia CC-BY-4.0.

Se trata de un artefacto de conversión, no de un modelo entrenado desde cero: el autor (`fdiskas`) no documenta proceso de entrenamiento propio, y las capacidades heredadas dependen enteramente del modelo base. No se han publicado métricas de rendimiento específicas para esta exportación ONNX en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer con decodificador TDT (Token-and-Duration Transducer) |
| Parametros totales | ~600 millones (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (encoder, WebGPU) e int8 (encoder CPU/WASM y decoder-joint) |
| Idiomas soportados | no disponible en esta ficha; el modelo base NVIDIA declara 25 lenguas europeas con detección automática |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`encoder-model.fp16.onnx`, `encoder-model.int8.onnx`, `decoder_joint-model.int8.onnx`) + `vocab.txt` |

## Arquitectura y entrenamiento

El modelo subyacente emplea un encoder Conformer, que combina bloques de auto-atención con convoluciones depthwise para capturar dependencias locales y globales en el espectrograma de entrada. Sobre el encoder se sitúa un decodificador TDT, una variante de transducer que predice conjuntamente tokens y duraciones, lo que permite emisiones de varios tokens por paso y mejora la eficiencia frente a transducers clásicos. El modelo base de NVIDIA declara 600 millones de parámetros y está diseñado para transcripción de alto throughput.

Esta ficha concreta no documenta el proceso de entrenamiento: no se especifican número de tokens, composición del dataset, ni si hubo ajuste con RLHF o DPO (poco habitual en ASR). Tampoco se detalla qué modificación introduce la variante `-lt` respecto a `nvidia/parakeet-tdt-0.6b-v3`. La innovación técnica relevante aquí es la exportación: separación de encoder y decoder-joint en grafos ONNX independientes, cuantización int8 para ejecución WASM en CPU y fp16 para WebGPU, y un vocabulario en texto plano (`vocab.txt`) para el tokenizador.

## Capacidades

- Transcripción de voz a texto (ASR) en streaming o por lotes, heredada del modelo base Parakeet TDT v3.
- Detección automática de idioma según la model card del modelo original de NVIDIA (25 lenguas europeas).
- Decodificación TDT con predicción conjunta de tokens y duraciones, que reduce el número de pasos del decodificador.
- Ejecución en navegador: inferencia vía WebGPU (encoder fp16) o vía WebAssembly (encoder int8) con `parakeet.js`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio de entrada más allá del ASR ni modo de razonamiento explícito.
- Capacidades multilingües: no verificadas en esta exportación; dependen del modelo base.

## Casos de uso

- Transcripción en el navegador sin backend: integrar `parakeet.js` con los grafos ONNX para dictado de voz en aplicaciones web, enviando audio al encoder fp16 en WebGPU y evitando que el audio salga del dispositivo.
- Subtitulado de reuniones en herramientas web corporativas: el modelo procesa audio en cliente y devuelve texto, lo que simplifica el cumplimiento de privacidad al no requerir subida de grabaciones a servidores.
- Accesibilidad en formularios y editores: dictado por voz en campos de texto de aplicaciones web progresivas, usando la variante int8 para equipos sin GPU compatible con WebGPU.
- Prototipado rápido de pipelines ASR: servir los ONNX con ONNX Runtime en lugar de desplegar NeMo completo, útil para validar producto antes de invertir en infraestructura.
- Transcripción offline en dispositivos edge (kioscos, tablets, portátiles) donde no hay conectividad estable y se prefiere un runtime WASM ligero.
- Evaluación comparativa de cuantizaciones: usar las variantes fp16 e int8 del encoder para medir el compromiso entre latencia y calidad de transcripción en un mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta exportación no incluye WER, latencia ni throughput, y la información de búsqueda solo confirma la existencia del modelo base de NVIDIA y de otra exportación ONNX (`istupakov/parakeet-tdt-0.6b-v3-onnx`), sin cifras asociadas a esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el encoder fp16 de un modelo de ~600 M de parámetros suele requerir del orden de 1,2-1,5 GB en memoria, y la variante int8 aproximadamente la mitad, pero son estimaciones, no datos publicados.
- GPU recomendadas: no especificadas. El diseño apunta a WebGPU en navegador; para servidor, cualquier GPU con soporte de ONNX Runtime (por ejemplo, A100, H100, RTX 4090) sería viable, sin cifras de rendimiento publicadas.
- Compatibilidad con GPU de consumo: la variante int8 está pensada para CPU/WASM, por lo que puede ejecutarse sin GPU; la fp16 requiere un navegador con WebGPU.
- Opciones de despliegue: `parakeet.js` en navegador, ONNX Runtime (CPU, CUDA, WebGPU) y potencialmente otros runtimes compatibles con ONNX. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a ASR).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `fdiskas/parakeet-tdt-0.6b-v3-lt-onnx` (esta ficha) | ~600 M | no disponible | no disponible (base: 25 europeas) | CC-BY-4.0 | ONNX (fp16/int8) | Exportación para navegador con parakeet.js |
| `nvidia/parakeet-tdt-0.6b-v3` | ~600 M | no disponible | 25 lenguas europeas con detección automática | no disponible en la información | NeMo (nativo) | Modelo original de NVIDIA |
| `istupakov/parakeet-tdt-0.6b-v3-onnx` | ~600 M | no disponible | no disponible | no disponible en la información | ONNX | Exportación ONNX alternativa del mismo modelo base |

## Limitaciones y advertencias

- Es un artefacto de conversión: cualquier defecto de transcripción, sesgo acústico o limitación idiomática proviene del modelo base y no se corrige en la exportación.
- No hay métricas de calidad (WER) publicadas para las variantes int8; la cuantización puede degradar la precisión frente al modelo original.
- La variante `-lt` no está documentada en la información disponible, por lo que se desconoce en qué se diferencia de `nvidia/parakeet-tdt-0.6b-v3`.
- Riesgo de alucinación en ASR: en audio ruidoso o con silencios largos, los transducers pueden generar texto espurio; no se documenta mitigación específica.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero la model card advierte de revisar los términos de los datos de entrenamiento del modelo original antes de redistribuir.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación comunitaria.
- El despliegue en navegador depende de la madurez de WebGPU y de `parakeet.js`; el rendimiento en CPU/WASM puede ser insuficiente para transcripción en tiempo real en equipos modestos.

## Enlaces

- Hugging Face (esta ficha): https://huggingface.co/fdiskas/parakeet-tdt-0.6b-v3-lt-onnx
- Modelo base: https://huggingface.co/Noctra-labs/parakeet-tdt-0.6b-v3-lt
- Modelo original de NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Exportación ONNX alternativa: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Librería parakeet.js: https://github.com/ysdede/parakeet.js
