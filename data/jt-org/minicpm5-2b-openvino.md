# JT-org/MiniCPM5-2B-openvino

## Resumen

MiniCPM5-2B es un modelo de lenguaje denso de 2.000 millones de parámetros desarrollado por OpenBMB, diseñado para ejecutarse en dispositivos locales y entornos con recursos limitados. Esta variante concreta, JT-org/MiniCPM5-2B-openvino, es una conversión a OpenVINO del modelo original openbmb/MiniCPM5-2B, realizada mediante optimum-intel. El modelo se enmarca en la serie MiniCPM5, que sigue la arquitectura Llama y está optimizada para tareas de generación de texto, razonamiento, código y matemáticas, con soporte de contexto largo y tool calling. Su licencia Apache 2.0 y su tamaño compacto lo hacen adecuado para aplicaciones edge y on-device.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Llama) |
| Parametros totales | 2.000 millones (2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (etiquetado como long-context) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y OpenVINO IR |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 2B parametros que sigue la arquitectura Llama, segun los metadatos del repositorio. Se entreno sobre una combinacion de datasets de la familia Ultra, incluyendo Ultra-FineWeb, UltraX-Preview y Ultra-FineWeb-L3 para el preentrenamiento, y UltraData-Math, UltraData-Code, UltraData-SFT-2605, UltraData-SFT-Agent-2609 y UltraData-RL-2609 para ajuste supervisado y aprendizaje por refuerzo. Esta mezcla de datos esta orientada a mejorar las capacidades de razonamiento matematico, generacion de codigo, tool calling y razonamiento multi-paso en agentes. La conversion a OpenVINO se realizo con optimum-intel, lo que permite su ejecucion en CPUs y GPUs compatibles con OpenVINO sin necesidad de frameworks pesados.

## Capacidades

- Generacion de texto en ingles y chino.
- Razonamiento matematico, entrenado con UltraData-Math.
- Generacion de codigo, entrenado con UltraData-Code.
- Soporte de tool calling / function calling, segun los metadatos.
- Capacidad para razonamiento multi-paso en agentes, gracias al dataset UltraData-SFT-Agent.
- Long-context, aunque la longitud exacta no esta especificada.
- Optimizado para ejecucion on-device y edge-ai.

## Casos de uso

- Asistente en el dispositivo: el modelo puede ejecutarse localmente en moviles o tablets gracias a su tamano compacto y a la conversion OpenVINO, ofreciendo respuestas sin conexion.
- Generacion de codigo en entornos con recursos limitados: puede integrarse en IDEs o pipelines de CI/CD ligeros, generando fragmentos de codigo y completando funciones.
- Tutor de matematicas: gracias a su entrenamiento con UltraData-Math, puede resolver problemas matematicos paso a paso en aplicaciones educativas.
- Agente con tool calling: puede actuar como agente que llama a herramientas externas (APIs, funciones) para automatizar tareas como consultas a bases de datos o envio de correos.
- Traduccion y asistencia bilingue: soporta ingles y chino, lo que permite aplicaciones de traduccion y asistencia en contextos multilingues.
- Analisis de documentos largos: su soporte de contexto largo permite procesar documentos extensos, como contratos o informes, en aplicaciones de resumen y extraccion de informacion.
- Edge AI en IoT: puede desplegarse en gateways o dispositivos IoT con CPUs Intel, aprovechando OpenVINO para inferencia de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Aunque el repositorio oficial de OpenBMB menciona que alcanza el estado del arte en su clase, no se proporcionan cifras concretas de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: con 2B parametros, en FP16 se requieren aproximadamente 4 GB de VRAM; con cuantizacion INT8, alrededor de 2 GB. Estas cifras son orientativas y dependen de la implementacion.
- GPU recomendadas: puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4090, o en iGPUs compatibles con OpenVINO. Tambien es apto para CPU.
- ¿Cabe en consumer GPU? Si, en GPUs con al menos 4 GB de VRAM.
- Opciones de despliegue: optimum-intel (OVModelForCausalLM), OpenVINO GenAI. Tambien es posible convertirlo a GGUF para usarlo con llama.cpp, aunque no es el formato original.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniCPM5-2B (base) | 2B | No disponible | Apache 2.0 | HuggingFace |
| MiniCPM5-1B | 1B | No disponible | Apache 2.0 | HuggingFace |
| Qwen2.5-1.5B | 1.5B | No disponible | Apache 2.0 | HuggingFace |
| Gemma 2 2B | 2B | No disponible | Gemma | HuggingFace |

## Limitaciones y advertencias

- Sesgos: al estar entrenado con datos web (Ultra-FineWeb), puede heredar sesgos presentes en esos datos; no se han documentado sesgos especificos.
- Alucinacion: como cualquier modelo de lenguaje, puede generar contenido plausible pero incorrecto.
- Idiomas: solo ingles y chino; no soporta otros idiomas de forma nativa.
- Contexto: aunque esta etiquetado como long-context, la longitud exacta no esta publicada, lo que dificulta planificar su uso en aplicaciones que requieren ventanas de contexto muy largas.
- Licencia: Apache 2.0 permite uso comercial, sin restricciones significativas.
- Caveat de produccion: al ser una conversion OpenVINO, puede haber ligeras diferencias de rendimiento y precision respecto al modelo original en PyTorch.

## Enlaces

- HuggingFace: https://huggingface.co/JT-org/MiniCPM5-2B-openvino
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- GitHub de OpenBMB: https://github.com/OpenBMB/MiniCPM
- optimum-intel: https://github.com/huggingface/optimum-intel
- Espacio de exportacion OpenVINO: https://huggingface.co/spaces/echarlaix/openvino-export
