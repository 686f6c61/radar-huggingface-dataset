# Llicklair/ttspro-voces

## Resumen

Llicklair/ttspro-voces es un repositorio que contiene paquetes de voces base para ttspro, un sistema de síntesis de voz en español con clonación de voz que se ejecuta íntegramente en el navegador mediante ONNX Runtime Web. El autor es Llicklair. Cada paquete es una voz de Piper (licencia MIT) adaptada a los módulos de ttspro y exportada con el conjunto de operadores WebGPU de ONNX Runtime Web, incluyendo su propio contrato (tabla de símbolos, firma del grafo) y un vector de voz base para el conversor de tono.

El repositorio tiene un tamaño de 0.7 GB y contiene ocho voces diferentes que cubren variantes de español de Argentina (es_AR), España (es_ES) y México (es_MX). Los modelos se distribuyen en dos formatos: fp32 y fp16, con tamaños que van desde 20.7 MB hasta 114 MB en fp32 y desde 11.0 MB hasta 57.6 MB en fp16. Al tratarse de modelos de síntesis de voz, no se especifica longitud de contexto ni parámetros de decodificación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos neuronales de síntesis de voz Piper exportados a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS) |
| Tipos de cuantizacion | fp32 y fp16 |
| Idiomas soportados | Español (es) |
| Licencia | MIT |
| Formato de pesos | ONNX (archivos .onnx, .json e indice.json) |

## Arquitectura y entrenamiento

Los paquetes son voces Piper portadas a la arquitectura de ttspro. Piper es un sistema de síntesis de voz open source; la información disponible no detalla la arquitectura interna de cada modelo ni los datos de entrenamiento utilizados. La transformación técnica destacable es la exportación de cada voz al conjunto de operadores WebGPU de ONNX Runtime Web, junto con un contrato específico (tabla de símbolos y firma del grafo) y un vector de voz base para el conversor de tono que permite la clonación de voz. No se menciona ningún proceso de RLHF, DPO ni ajuste fino adicional.

## Capacidades

- Generación de voz en español a partir de texto (text-to-speech).
- Clonación de voz mediante el vector de voz base incluido en cada paquete.
- Ejecución completa en el navegador con ONNX Runtime Web y WebGPU, sin necesidad de servidor.
- Ocho voces distintas que cubren tres variantes regionales: Argentina, España y México.
- Disponibilidad de pesos en fp32 y fp16 para adaptar el rendimiento al dispositivo.
- Integración con la librería ttspro mediante la función `TTS.cargar` o el parámetro `?voces` en la URL.
- No soporta tool calling, razonamiento multi-paso, visión ni otras capacidades de modelos de lenguaje; es exclusivamente un sistema de síntesis de voz.

## Casos de uso

- Asistente de voz en aplicaciones web: el modelo puede leerse en voz alta en el navegador sin infraestructura de servidor, gracias a la integración con ttspro y ONNX Runtime Web.
- Clonación de voz personalizada: el vector de voz base permite ajustar el timbre de salida para crear voces sintéticas personalizadas en aplicaciones de contenido.
- Lectura de artículos o noticias en español: se puede generar audio a partir de texto para publicaciones digitales, con voces que cubren acentos de España, Argentina y México.
- Accesibilidad para personas con discapacidad visual: convertir texto en voz de forma local en el navegador, lo que reduce la latencia y la dependencia de servicios externos.
- Herramientas educativas de pronunciación: las voces en español son útiles para practicar la pronunciación de palabras y frases en entornos de aprendizaje de idiomas.
- Prototipos de TTS en el cliente: gracias a los formatos fp16 y a los tiempos de inferencia de entre 33 y 210 ms por frase en CPU, es viable para demos interactivas y juegos ligeros en el navegador.

## Benchmarks y rendimiento

La model card del autor incluye una tabla de tiempos de inferencia por frase en CPU. No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de síntesis de voz.

| Pack | fp32 / fp16 (MB) | ms por frase (CPU) |
|---|---|---|
| es_AR-daniela-high | 114.0 / 57.6 | 210 |
| es_ES-carlfm-x_low | 20.7 / 11.0 | 33 |
| es_ES-davefx-medium | 63.3 / 32.3 | 43 |
| es_ES-mls_10246-low | 63.2 / 32.2 | 129 |
| es_ES-mls_9972-low | 63.2 / 32.2 | 62 |
| es_MX-ald-medium | 63.3 / 32.3 | 63 |
| es_MX-ald-x_low | 20.8 / 11.0 | 66 |
| es_MX-claude-high | 63.3 / 32.3 | 60 |

## Requisitos de hardware

- VRAM estimada: no disponible, pero los archivos son pequeños (de 11.0 a 114 MB) y la inferencia puede ejecutarse en CPU o en la GPU del dispositivo a través de WebGPU.
- GPU recomendada: cualquier GPU compatible con WebGPU; no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: sí, los pesos caben en dispositivos con recursos limitados, incluyendo portátiles y móviles.
- Opciones de despliegue: ONNX Runtime Web en el navegador mediante ttspro; no se mencionan otros motores como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: según la tabla del autor, entre 33 y 210 ms por frase en CPU, dependiendo de la voz y del tamaño del modelo.

## Comparativa con modelos similares

No se han encontrado datos de modelos comparables en la información proporcionada. Los paquetes de este repositorio son variaciones de voces Piper, pero no se dispone de benchmarks ni especificaciones de otros modelos TTS en español para realizar una comparación directa.

## Limitaciones y advertencias

- El modelo solo soporta español (es); no es multilingüe.
- No se han publicado datos de entrenamiento, evaluaciones de calidad ni análisis de sesgos en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, lo que indica una adopción muy limitada o un proyecto reciente.
- Los pesos están en un formato ONNX específico de ttspro; no son directamente compatibles con la implementación estándar de Piper sin una conversión adicional.
- El rendimiento en CPU varía significativamente según la voz, desde 33 ms hasta 210 ms por frase, lo que puede afectar a aplicaciones con requisitos estrictos de latencia.
- No se aportan garantías sobre la calidad de la voz ni sobre la ausencia de artefactos o errores de pronunciación en todas las variantes regionales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Llicklair/ttspro-voces
- GitHub de ttspro: https://github.com/Llicklair/ttspro
- GitHub de Piper (referencia en la model card): https://github.com/OHF-Voice/piper1-gpl
