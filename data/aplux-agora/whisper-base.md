# APLUX-Agora/Whisper-base

## Resumen

Whisper-base de APLUX-Agora es una conversión del modelo de reconocimiento automático de voz Whisper-base de OpenAI, empaquetada y validada por APLUX Model Farm para su despliegue sobre placas con SoC Qualcomm. El repositorio no contiene los pesos en formato estándar (safetensors o GGUF), sino artefactos compilados por plataforma (`targets/<SoC>/`) con binarios `model.bin` listos para ejecutarse mediante el runner de Agora, la plataforma de despliegue en el borde de AIDLUX.

El modelo resuelve la transcripción de audio a texto (pipeline `automatic-speech-recognition`) en entornos AIoT donde no hay GPU dedicada ni acceso a la nube. La única placa documentada en la model card es la Rhino Pi X1 con SoC QCS8550, sobre la que se reportan precisiones FP16 y W8A16 y un factor de tiempo real (RTF) medido de 0,037 en la precisión por defecto.

La relevancia de esta ficha es acotada: no es un modelo nuevo ni un fine-tuning, sino un artefacto de despliegue derivado. Su interés reside en la cuantización W8A16 validada sobre hardware Qualcomm y en las métricas de latencia publicadas, no en capacidades adicionales respecto al Whisper-base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-base, según el modelo original de OpenAI; no se detalla en la model card) |
| Parametros totales | no disponible (el Whisper-base original tiene ~74 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s en el Whisper original, no confirmado aquí) |
| Tipos de cuantizacion | FP16, W8A16 |
| Idiomas soportados | no disponible |
| Licencia | APLUX Model Farm License (license_name: aplux-model-farm); licencia del modelo fuente: "see the original model's terms" |
| Formato de pesos | Binarios compilados por SoC (`model.bin`) y `model.json` por plataforma; no se distribuyen safetensors ni GGUF |
| Tamano del repo | 0,3 GB |
| Pipeline | automatic-speech-recognition |
| Entrada / salida | audio → text |
| SoC soportado | QCS8550 (placa Rhino Pi X1 / 犀牛派 X1) |

## Arquitectura y entrenamiento

No se proporciona información sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineación en la model card. El repositorio se presenta explícitamente como "converted, deployable resources" derivados de un modelo fuente cuyos términos de licencia se remiten al original. Por el identificador y el pipeline, corresponde a la familia Whisper de OpenAI, un transformer encoder-decoder para reconocimiento de voz, pero la ficha no puede confirmar detalles de capas, dimensión oculta ni composición del dataset.

La innovación técnica documentada no está en el entrenamiento sino en el empaquetado: conversión a formatos ejecutables sobre el acelerador neural de Qualcomm (tag `QNN`), con variantes por precisión (FP16 y W8A16) y validación "逐板卡" (placa por placa) antes de publicar. Cada directorio `targets/<SoC>/` incluye un `model.json` que declara la precisión por defecto y las rutas de cada variante, además de `NOTICE.md` y `SHA256SUMS` para verificación de integridad.

## Capacidades

- Reconocimiento automático de voz: transcripción de audio a texto, tarea declarada del pipeline.
- Ejecución en el borde sobre NPU Qualcomm (QCS8550) mediante el runtime QNN.
- Cuantización W8A16 validada, además de FP16, para reducir huella de memoria y latencia.
- Despliegue reproducible: descarga selectiva por SoC con `hf download --include "targets/<SoC>/*"`.
- Exportación de flujos de trabajo desde la plataforma Agora (proyecto exportable y guía de despliegue).
- No se documentan tool calling, capacidades de agente, visión, audio generativo ni modo de razonamiento.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Transcripción en dispositivos AIoT sin conectividad: el modelo se ejecuta localmente sobre la NPU del QCS8550, de modo que la conversión de voz a texto no requiere enviar audio a la nube; adecuado para dispositivos con requisitos de privacidad o redes intermitentes.
- Subtitulado en tiempo real en hardware embebido: con un RTF de 0,037 en la precisión por defecto, el procesamiento es aproximadamente 27 veces más rápido que el tiempo real, lo que deja margen para pipelines de post-procesado y presentación.
- Interfaces de voz para paneles industriales y kioscos: la placa Rhino Pi X1 y el QCS8550 encajan en equipos empotrados; el modelo cubre la etapa de ASR dentro de un flujo mayor de comandos o dictado.
- Prototipado rápido sin placa física: la plataforma Agora permite probar el modelo en línea antes de adquirir el hardware, útil para validar la viabilidad acústica de un producto.
- Verificación de integridad en cadena de suministro de modelos: los ficheros `NOTICE.md` y `SHA256SUMS` permiten auditar que los binarios desplegados corresponden a los publicados.
- Evaluación comparativa de cuantizaciones: al ofrecer FP16 y W8A16 sobre el mismo SoC, sirve para medir el compromiso entre precisión de transcripción y coste computacional antes de fijar la variante de producción.

## Benchmarks y rendimiento

La model card solo publica una métrica de eficiencia, no de calidad de transcripción (no hay WER ni comparaciones con otros modelos):

| SoC · placa | Precisiones | RTF medido (precisión por defecto) |
|---|---|---|
| QCS8550 · Rhino Pi X1 | FP16, W8A16 | 0,037 |

No se han publicado resultados de benchmarks de calidad (WER, MMLU, etc.) en la informacion disponible.

## Requisitos de hardware

- SoC validado: Qualcomm QCS8550, sobre la placa Rhino Pi X1 (犀牛派 X1). No se documentan otros SoC en el repositorio.
- VRAM: no aplica en el sentido de GPU de escritorio; el modelo se ejecuta sobre la NPU integrada del SoC. No se especifica el consumo de memoria del acelerador.
- GPU de escritorio (A100, H100, RTX 4090): no soportadas por estos artefactos, que son binarios compilados para QNN.
- Despliegue: runtime de Agora con backend QNN; descarga vía `hf download` filtrando por `targets/QCS8550/*`; guía de despliegue y proyecto exportable disponibles en la plataforma Agora.
- vLLM, llama.cpp, Ollama y TGI no son aplicables a este formato de pesos.
- Throughput: con RTF 0,037, el sistema procesa audio a unas 27 veces la velocidad de reproducción en la configuración medida; no se publica latencia absoluta por segmento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue en borde Qualcomm |
|---|---|---|---|---|---|
| APLUX-Agora/Whisper-base | no disponible | no disponible | binarios QNN por SoC | APLUX Model Farm + términos del original | Sí, QCS8550 validado |
| Whisper-base (OpenAI) | ~74 M (no confirmado aquí) | ventana de audio de 30 s (no confirmado aquí) | PyTorch / safetensors | MIT (según el original; no verificado en la información disponible) | No, requiere conversión propia |
| Whisper-small (OpenAI) | no disponible | no disponible | PyTorch / safetensors | MIT (según el original) | No, requiere conversión propia |

La comparación se limita a la familia de origen porque la información proporcionada no incluye alternativas ASR empaquetadas para QNN. Los datos de los modelos de OpenAI no proceden del repositorio analizado y deben verificarse en sus fichas oficiales.

## Limitaciones y advertencias

- No es un modelo entrenado desde cero ni un fine-tuning: es una conversión de despliegue; hereda todas las limitaciones del Whisper-base original, que no se detallan en la model card.
- No se publican métricas de calidad (WER) ni por idioma ni por condición acústica; el RTF de 0,037 mide velocidad, no precisión.
- Idiomas soportados: no disponible. No se puede asumir cobertura multilingüe sin verificación.
- Licencia doble y restrictiva: los recursos convertidos se rigen por la APLUX Model Farm License (PDF enlazado), y el modelo fuente por "the original model's terms". Es imprescindible revisar ambos documentos antes de cualquier uso comercial.
- Los pesos no están en formatos estándar (safetensors, GGUF), lo que impide reutilizarlos fuera del runtime QNN o portarlos a otra plataforma sin reconversión.
- Un solo SoC y una sola placa validados; el rendimiento en otros chips Qualcomm no está documentado.
- Riesgo de alucinación en la transcripción (texto inventado en audio ruidoso o silencioso), inherente a los modelos ASR; no se cuantifica en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.
- Fecha de creación declarada en 2026-11-09, posterior a la fecha habitual de referencia; conviene verificar la vigencia del artefacto antes de integrarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/APLUX-Agora/Whisper-base
- Prueba en línea en Agora: https://mega.aidlux.com/models/whisper-base
- Plataforma Agora: https://mega.aidlux.com
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/Whisper-base/blob/main/LICENSE_MODEL_FARM.pdf
- Ficheros de procedencia e integridad: `NOTICE.md` y `SHA256SUMS` en la raíz del repositorio
