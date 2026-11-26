# rdcmedia/Kokoro-82M

## Resumen

Kokoro-82M es un modelo de síntesis de voz (text-to-speech) de 82 millones de parámetros desarrollado originalmente por hexgrad bajo licencia Apache 2.0. Esta ficha corresponde a la republicación `rdcmedia/Kokoro-82M`, una variante en formato ONNX que empaqueta el modelo junto con componentes auxiliares de conversión grafema-fonema (G2P). El modelo resuelve el problema de generar voz sintética de calidad razonable con un coste computacional muy bajo, lo que lo hace atractivo para despliegues en CPU, dispositivos de borde y entornos donde no hay GPU disponible.

La relevancia de esta variante concreta reside en su empaquetado en ONNX y en la inclusión de un modelo G2P neuronal (`g2p.onnx`) entrenado sobre léxicos de pronunciación del inglés (us_gold.json de misaki y el CMU Pronouncing Dictionary). Esto permite ejecutar un pipeline completo de TTS sin depender de frameworks de Python pesados, usando únicamente el runtime de ONNX.

No se dispone de información sobre arquitectura interna detallada, longitud de contexto, número de tokens de entrenamiento ni idiomas soportados en la información proporcionada. El repositorio tiene un tamaño de 0,1 GB y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS; se distribuye en ONNX) |
| Parámetros totales | 82M (según el nombre del modelo) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en ONNX; no se detallan variantes) |
| Idiomas soportados | no disponible (los léxicos incluidos sugieren inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`g2p.onnx`, más pesos del modelo TTS) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo TTS. Por el nombre y el ecosistema, Kokoro-82M es un modelo de síntesis de voz de pequeño tamaño (82M parámetros) orientado a generar audio a partir de texto. Esta variante incluye además un modelo neuronal de conversión grafema-fonema (`g2p.onnx`) con su vocabulario (`g2p-vocab.json`), entrenado sobre `us_gold.json` (derivado de hexgrad/misaki, Apache 2.0) y `cmu_extra.json` (convertido del CMU Pronouncing Dictionary).

No se han proporcionado datos sobre volumen de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). El pipeline declarado en Hugging Face figura como no disponible.

## Capacidades

- Síntesis de voz a partir de texto (text-to-speech), empaquetada en formato ONNX.
- Conversión grafema-fonema neuronal incluida (`g2p.onnx`), lo que permite fonemizar texto de entrada sin depender de un G2P externo basado en reglas.
- Ejecución mediante runtime ONNX, potencialmente en CPU y entornos sin GPU.
- Soporte léxico de pronunciación para inglés (us_gold.json y CMU Pronouncing Dictionary).
- No se dispone de información sobre soporte de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Síntesis de voz en dispositivos de borde: al distribuirse en ONNX y con 82M parámetros, puede ejecutarse en hardware modesto para generar locuciones sin conexión a la nube.
- Lectura automática de contenidos: integración en pipelines de publicación para convertir artículos o documentación en audio, aprovechando el bajo coste del modelo.
- Asistentes de accesibilidad: generación de voz para lectores de pantalla o interfaces de accesibilidad en aplicaciones de escritorio donde no se quiere depender de servicios externos.
- Preprocesado de texto para TTS: uso del componente `g2p.onnx` de forma aislada para obtener fonemas a partir de texto antes de pasarlos a otro motor de síntesis.
- Prototipado rápido de productos de voz: validación de ideas de aplicaciones con voz sintética sin incurrir en costes de API, gracias a la licencia Apache 2.0.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente con ONNX, el texto del usuario no sale del dispositivo, lo que resulta adecuado para aplicaciones sensibles.
- Investigación en TTS: base ligera para experimentar con fonemización y síntesis en entornos académicos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Con 82M parámetros y formato ONNX, el modelo es muy ligero; una estimación orientativa en FP32 sería de aproximadamente 0,3 GB de pesos, aunque no se confirma en la información proporcionada.
- GPU recomendadas: no disponibles. Por tamaño, cualquier GPU consumer moderna podría ejecutarlo, pero no hay datos que lo confirmen.
- Compatibilidad con GPU consumer: probable por el tamaño del modelo, pero no confirmada en la información disponible.
- Opciones de despliegue: runtime de ONNX (ONNX Runtime). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a TTS).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de TTS.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos del modelo ni sobre la composición de sus datos de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido habitual de LLM, pero la síntesis puede producir pronunciaciones incorrectas en palabras fuera del léxico cubierto.
- Idiomas: los léxicos incluidos (us_gold.json y CMU Pronouncing Dictionary) apuntan a inglés; no se confirma soporte de castellano ni de otros idiomas.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de los componentes derivados (CMU Pronouncing Dictionary, indicada en `cmu_extra.LICENSE`) antes de redistribuir.
- Este repositorio es una republicación de terceros (`rdcmedia`), no el repositorio oficial de hexgrad; conviene verificar la integridad de los pesos antes de usarlos en producción.
- El pipeline de Hugging Face figura como no disponible, lo que puede complicar el uso directo con la librería `transformers`.
- Sin descargas ni valoraciones registradas en el momento de la consulta, lo que reduce la señal de validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rdcmedia/Kokoro-82M
- Modelo original (hexgrad): no disponible en la información proporcionada
- ONNX community: no disponible en la información proporcionada
- hexgrad/misaki: no disponible en la información proporcionada
- CMU Pronouncing Dictionary: no disponible en la información proporcionada
