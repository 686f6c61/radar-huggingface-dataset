# Feelx8989/termux_os-asset-qwen3asr-htp

## Resumen

El repositorio `Feelx8989/termux_os-asset-qwen3asr-htp` contiene los componentes necesarios para ejecutar el modelo de reconocimiento de voz Qwen3-ASR-0.6B en dispositivos Android mediante el framework Termux-OS. El autor, Feelx8989, distribuye las piezas que el propio Termux-OS necesita para construir un pipeline de transcripción local: un front-end mel y un encoder de audio en formato ONNX optimizados para el procesador Hexagon de Qualcomm (HTP), junto con una cuantización personalizada del decoder en GGUF.

Este modelo resuelve el problema de ejecutar ASR de alta calidad en hardware móvil sin conexión a internet, aprovechando la NPU de los SoC Qualcomm. Es relevante porque permite integrar asistentes de voz y agentes de IA en Android con latencia reducida y privacidad de datos. El modelo base es Qwen/Qwen3-ASR-0.6B, con 751.632.384 parámetros, y se distribuye bajo licencia Apache-2.0. La longitud de contexto no se especifica en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basado en Qwen3-ASR-0.6B) |
| Parametros totales | 751.632.384 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4 (decoder, 727 MB) y Q8 (decoder, 804 MB, referenciado externamente) |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (mel y encoder) y GGUF (decoder) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado desde cero, sino una adaptación del modelo Qwen3-ASR-0.6B de la serie Qwen3-ASR de Alibaba Cloud. La arquitectura original es un modelo de reconocimiento automático de voz (ASR) basado en transformer, pero en este repositorio se extraen dos componentes: el front-end mel (un grafo de 16 nodos que también emite el máximo por ventana) y el encoder de audio, ambos exportados a ONNX para ejecutarse en el HTP de Qualcomm mediante ONNX Runtime con el execution provider QNN. El decoder se cuantiza en formato GGUF (Q4 y Q8) para ejecutarse con ggml-hexagon.

No se proporciona información sobre el entrenamiento del modelo base (número de tokens, dataset, técnicas de RLHF, etc.). El autor indica que los pesos originales no se modifican salvo la cuantización explícitamente nombrada. El pipeline completo es: PCM → mel (ONNX, HTP) → encoder (ONNX, HTP) → decoder (GGUF, ggml-hexagon) → texto.

## Capacidades

- Reconocimiento automático de voz en chino e inglés.
- Diseñado para ejecución local en dispositivos Android con NPU Qualcomm.
- Integración con el framework Termux-OS, que gestiona el modelo como un activo versionado y verificado por checksum.
- Soporte de cuantización Q4 y Q8 para el decoder, permitiendo elegir entre tamaño y precisión.
- Compatible con la API de Qwen3-ASR-Toolkit para transcripción de audio largo mediante división y procesamiento en paralelo.
- El pipeline es portable: los grafos ONNX y el GGUF no están vinculados a un dispositivo específico, aunque el EPContext compilado por QNN sí lo está.

## Casos de uso

- Asistente de voz local en Android: el modelo puede transcribir comandos de voz en tiempo real sin conexión, permitiendo a usuarios controlar aplicaciones o automatizar tareas mediante Termux-OS.
- Transcripción de notas de voz: los usuarios pueden grabar notas y obtener texto transcrito localmente, preservando la privacidad al no enviar audio a servidores externos.
- Integración con agentes de IA en el dispositivo: el pipeline de ASR se puede combinar con un LLM local para crear asistentes conversacionales que entiendan voz y respondan por texto, todo en el teléfono.
- Accesibilidad para personas con discapacidad auditiva: permite convertir conversaciones en tiempo real a texto en la pantalla, sin depender de servicios en la nube.
- Automatización de tareas en Termux-OS: los desarrolladores pueden usar la salida del modelo para activar scripts o rutinas basadas en comandos de voz, como abrir aplicaciones o ejecutar procesos.
- Procesamiento de audio largo en paralelo: con el toolkit oficial de Qwen3-ASR, se pueden dividir archivos de audio de horas y transcribirlos en paralelo, aunque el toolkit usa la API en nube; en este caso, la ejecución local es más limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Requiere un dispositivo Android con un SoC de Qualcomm que incluya Hexagon Tensor Processor (HTP) para ejecutar los grafos ONNX con el execution provider QNN.
- El decoder GGUF se ejecuta con ggml-hexagon, también en el HTP, por lo que es necesario disponer de la librería ggml-hexagon compilada para el dispositivo.
- No se especifica la VRAM necesaria; el modelo tiene 751M parámetros, y con cuantización Q4 el decoder ocupa 727 MB, por lo que cabe en la memoria RAM de la mayoría de los teléfonos actuales.
- El framework Termux-OS gestiona la instalación de los assets y la compilación de los ejecutables. No se requiere GPU dedicada, sino la NPU del SoC.
- Opciones de despliegue: ONNX Runtime con QNN EP para los grafos ONNX, y ggml-hexagon para el decoder GGUF. No se mencionan vLLM, Ollama ni TGI porque no son aplicables a ASR móvil.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. El modelo es una adaptación específica para hardware móvil de Qualcomm, y no se han encontrado comparativas con otros modelos ASR cuantizados como Whisper tiny o Whisper base en la información disponible.

## Limitaciones y advertencias

- El modelo solo soporta chino e inglés; no cubre otros idiomas.
- El camino multimodal (mmproj) produce resultados numéricamente incorrectos en ggml-hexagon y solo es usable en CPU, por lo que no se incluye en el pipeline.
- La etapa mel es la más afectada por la limitación térmica del dispositivo, lo que puede degradar el rendimiento en uso prolongado.
- El compilado EPContext de QNN está vinculado al SoC, a la versión de QNN y al hash del modelo; cada dispositivo debe compilar el suyo, lo que puede complicar el despliegue en entornos heterogéneos.
- El decoder Q8 no está alojado en este repositorio, sino que se referencia el repositorio oficial de ggml-org; el instalador debe verificar el checksum sha256.
- No se garantiza la precisión de la transcripción en entornos ruidosos o con acentos no estándar, ya que el modelo base no fue entrenado para esos casos.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base es de Alibaba Cloud y se debe cumplir con los términos de la licencia original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Feelx8989/termux_os-asset-qwen3asr-htp
- Framework Termux-OS: https://github.com/johnson-yo/termux-os-framework
- Qwen3-ASR (modelo base): https://github.com/QwenLM/Qwen3-ASR
- Qwen3-ASR-Toolkit: https://github.com/QwenLM/Qwen3-ASR-Toolkit
- GGUF original del decoder Q8: https://huggingface.co/ggml-org/Qwen3-ASR-0.6B-GGUF
- Página del modelo en HuggingFace (base): https://huggingface.co/Qwen/Qwen3-ASR-0.6B
