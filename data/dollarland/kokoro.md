# dollarland/kokoro

## Resumen

Kokoro INT8 v1.1 voice pack for Dolyzer es un paquete de voces empaquetado por el usuario dollarland que redistribuye el modelo de síntesis de voz Kokoro-82M v1.1, desarrollado originalmente por Hexgrad, en su conversión a INT8 y formato ONNX preparada por los contribuidores de Sherpa-ONNX. El repositorio no contiene pesos en formato nativo de HuggingFace, sino un archivo ZIP (`kokoro-int8-v1.1-model-pack.zip`) pensado para la descarga dentro de la aplicación Dolyzer y la narración offline en dicha app.

El modelo subyacente, Kokoro-82M, es un modelo TTS (text-to-speech) de pequeño tamaño (82 millones de parámetros) que se ha popularizado por ofrecer una calidad de voz notable con unos requisitos de cómputo muy bajos, lo que permite inferencia en CPU y en dispositivos de gama baja. Esta ficha describe el paquete tal como se publica: un artefacto de distribución para una aplicación concreta, no un modelo entrenado por dollarland.

Es relevante ahora porque los modelos TTS ligeros y cuantizados a INT8 están habilitando narración offline en aplicaciones de escritorio y móviles sin depender de servicios en la nube. La información disponible en la model card es muy escasa: no se documentan parámetros, contexto, idiomas ni benchmarks propios de este repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo TTS subyacente: Kokoro-82M v1.1) |
| Parámetros totales | 82 M (según el nombre del modelo original Kokoro-82M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | INT8 (ONNX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ZIP con modelo ONNX INT8 y activos de voz (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La model card de este repositorio no describe la arquitectura ni el proceso de entrenamiento. Se trata de un paquete de distribución: el modelo subyacente es Kokoro-82M v1.1 de Hexgrad, convertido a ONNX con cuantización INT8 por los contribuidores de Sherpa-ONNX. No se aportan datos sobre número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF o DPO.

La innovación técnica relevante en este artefacto es la conversión a ONNX INT8 para Sherpa-ONNX, que reduce el peso y permite ejecución eficiente en CPU dentro de la aplicación Dolyzer. No se documentan detalles adicionales sobre la arquitectura interna del modelo original (transformer, decodificador, etc.) en la información proporcionada.

## Capacidades

- Síntesis de voz (text-to-speech) para narración offline dentro de la aplicación Dolyzer.
- Ejecución local mediante el runtime Sherpa-ONNX con pesos cuantizados a INT8.
- Paquete de voces múltiples (voice pack), según el nombre del archivo distribuido.
- No se documentan capacidades de tool calling, agentes, razonamiento multietapa, visión ni audio de entrada.
- No se especifican capacidades multilingües en la model card de este repositorio.

## Casos de uso

- Narración offline en Dolyzer: el paquete está diseñado explícitamente para la descarga in-app y la lectura en voz alta sin conexión, aprovechando el formato ONNX INT8 para ejecución local.
- Lectura de documentos y artículos en aplicaciones de escritorio: al ser un modelo de 82 M de parámetros cuantizado, puede integrarse en apps de escritorio que necesiten TTS sin depender de APIs externas.
- Accesibilidad: conversión de texto a voz para usuarios con discapacidad visual en entornos sin conectividad, usando el runtime Sherpa-ONNX.
- Integración en pipelines de Sherpa-ONNX: el formato ONNX INT8 permite desplegar el modelo con las herramientas del proyecto k2-fsa en aplicaciones C++, Python o móviles.
- Prototipado de asistentes de voz ligeros: útil para validar experiencias de voz en local antes de invertir en modelos TTS mayores.
- Distribución empaquetada para apps de terceros: el ZIP con licencia Apache 2.0 incluida facilita la redistribución dentro de productos que necesiten un voice pack autónomo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; al ser un modelo de 82 M de parámetros en INT8, el peso ronda decenas de MB y es apto para inferencia en CPU.
- GPU recomendadas: no disponible; el formato ONNX INT8 de Sherpa-ONNX está orientado a ejecución en CPU.
- Compatibilidad con GPU de consumo: previsiblemente sí por tamaño, pero no se documenta en la información proporcionada.
- Opciones de despliegue: Sherpa-ONNX (runtime previsto por el paquete); otras opciones no documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| dollarland/kokoro (este repo) | 82 M (subyacente) | no disponible | Apache 2.0 | ZIP / ONNX INT8 | HuggingFace (0 descargas) |
| hexgrad/Kokoro-82M-v1.1-zh | 82 M | no disponible | Apache 2.0 | no disponible en la información | HuggingFace (modelo original) |
| csukuangfj/kokoro-int8-multi-lang-v1_1 | 82 M | no disponible | no disponible en la información | ONNX INT8 | HuggingFace (upstream de la conversión) |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos, tasas de alucinación ni limitaciones de idioma del paquete.
- El repositorio no contiene pesos en formato estándar de HuggingFace; es un ZIP para una app concreta, lo que limita su reutilización directa fuera de Dolyzer.
- No se especifican los idiomas cubiertos por el voice pack; el modelo original tiene variantes multilingües, pero este paquete no lo detalla.
- El autor del repositorio (dollarland) no es el desarrollador del modelo; la responsabilidad técnica recae en Hexgrad y Sherpa-ONNX.
- Aunque la licencia es Apache 2.0, conviene verificar el archivo de licencia incluido en el ZIP antes de redistribuirlo en producción.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.
- Fecha de creación indicada como 2026-11-03, posterior a la fecha actual de referencia; conviene tratar los metadatos con cautela.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dollarland/kokoro
- Modelo original Kokoro-82M v1.1: https://huggingface.co/hexgrad/Kokoro-82M-v1.1-zh
- Proyecto Sherpa-ONNX: https://github.com/k2-fsa/sherpa-onnx
- Archivos upstream INT8: https://huggingface.co/csukuangfj/kokoro-int8-multi-lang-v1_1
