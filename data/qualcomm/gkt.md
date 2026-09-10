# qualcomm/GKT

## Resumen

GKT (Geometry-guided Kernel Transformer) es un modelo de visión por computador orientado a la generación de una representación en vista de pájaro (bird's eye view, BEV) a partir de las cámaras montadas en un vehículo. No es un modelo de lenguaje: no genera texto ni procesa instrucciones en lenguaje natural, sino que transforma entradas de sensores en una representación espacial del entorno, una etapa habitual en pilas de percepción para conducción asistida y conducción autónoma.

El repositorio `qualcomm/GKT` no contiene el modelo original, sino la versión optimizada y preexportada por Qualcomm para sus dispositivos, generada con la librería Qualcomm AI Hub Models y el flujo de trabajo Qualcomm AI Hub Workbench. La implementación de referencia procede del repositorio `hustvl/GKT` y el modelo está etiquetado con el identificador de paper `arxiv:2206.04584`. El repositorio pesa 0,3 GB, está publicado bajo licencia MIT y se distribuye con artefactos listos para desplegar en NPU Hexagon de plataformas Snapdragon y Dragonwing.

Su relevancia actual es de tipo práctico: permite ejecutar percepción BEV en el propio dispositivo (móvil, PC con Windows on Snapdragon y plataformas de automoción) sin depender de aceleradores de servidor, usando los SDK QAIRT 2.45 y ONNX Runtime 1.27.1. La adopción en HuggingFace es muy baja (0 descargas y 1 like en el momento de la consulta), por lo que debe considerarse un artefacto de despliegue más que un modelo con comunidad consolidada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Geometry-guided Kernel Transformer (transformer guiado por geometría para percepción BEV); detalles internos de capas y atención no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión; no hay ventana de contexto de texto) |
| Tipos de cuantizacion | solo precisión float en los artefactos publicados; no se listan variantes int8, int16 ni mixtas |
| Idiomas soportados | no aplica (modelo de visión; no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | ONNX precompilado para QNN (PRECOMPILED_QNN_ONNX) y binario de contexto QNN (QNN_CONTEXT_BINARY); no se publican safetensors ni GGUF |
| Desarrollador del artefacto | Qualcomm (repositorio de modelos de Qualcomm AI Hub) |
| Implementación de referencia | hustvl/GKT |
| Tarea (pipeline) | other (percepción BEV a partir de cámaras) |
| Runtime y versiones | QAIRT 2.45; ONNX Runtime 1.27.1 |
| Plataformas objetivo | Snapdragon X2 Elite, Snapdragon X Elite, Snapdragon 8 Gen 3, Snapdragon 8 Gen 1, Snapdragon 8 Elite (Galaxy), Snapdragon 8 Elite Gen 5 (Galaxy); Dragonwing IQ-8275, IQ-9075, QCS8550 (proxy); Qualcomm SA8775P, SA7255P, SA8295P |
| Tamano del repositorio | 0,3 GB |
| Fecha de creación / actualización | 13 de enero de 2026 / 10 de septiembre de 2026 |

## Arquitectura y entrenamiento

La información disponible describe el modelo como un Geometry-guided Kernel Transformer cuyo objetivo es generar una representación BEV a partir de las cámaras del vehículo. El término "geometry-guided kernel" sugiere el uso de kernels de muestreo guiados por la geometría de la proyección cámara-suelo, pero la model card proporcionada no detalla el número de capas, la dimensión de los embeddings, el mecanismo de atención ni el esquema exacto de proyección, por lo que no es posible describir la arquitectura a nivel de bloque sin inventar datos.

Tampoco se dispone de información sobre el entrenamiento: no se indican el número de tokens o imágenes, la composición del dataset, la resolución de entrada, el número de cámaras soportadas, ni si hubo etapas de ajuste fino con RLHF, DPO o similares (poco probables en un modelo de percepción). El repositorio de Qualcomm se limita a la exportación y compilación del modelo para NPU: los artefactos se generan con Qualcomm AI Hub Models (versión 0.62.0) y se compilan y perfilan mediante Qualcomm AI Hub Workbench. La innovación destacable, en este caso, es de despliegue: precompilación por chipset y binarios de contexto QNN listos para ejecutar en Hexagon, no una innovación de arquitectura documentada en esta ficha.

## Capacidades

- Generación de representación en vista de pájaro (BEV) a partir de entradas de cámara de un vehículo, según la descripción del autor.
- Percepción espacial orientada a conducción: la salida BEV es una representación intermedia típica para detección, segmentación y planificación en pilas de conducción autónoma.
- Ejecución en dispositivo sobre NPU Hexagon de plataformas Snapdragon y Dragonwing, sin GPU de servidor.
- Exportación a medida: la librería Qualcomm AI Hub Models permite reexportar el modelo con configuraciones personalizadas.
- Perfilado y evaluación en dispositivo alojado mediante Qualcomm AI Hub Workbench.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, capacidades multilingües ni modo de razonamiento (thinking). Es un modelo estrictamente de visión.
- No se documentan capacidades de visión-lenguaje (VLM), audio ni entrada multimodal más allá de las cámaras del vehículo.

## Casos de uso

- Percepción BEV en vehículos de producción: el modelo transforma las imágenes de las cámaras en una representación cenital del entorno que alimenta módulos posteriores de detección de obstáculos y carriles; es adecuado porque está precompilado para plataformas de automoción como SA8775P, SA7255P, SA8295P, QCS8550 e IQ-9075.
- Sistemas de asistencia a la conducción (ADAS) de bajo consumo: al ejecutarse en NPU Hexagon en lugar de GPU, permite integrar percepción BEV en unidades de control con presupuesto térmico y energético reducido.
- Automoción embebida con requisitos de determinismo: los binarios de contexto QNN permiten despliegues con artefactos fijos por chipset, lo que simplifica la validación de la versión desplegada en el vehículo.
- Robótica móvil y vehículos autónomos industriales: la representación BEV es reutilizable para navegación en entornos estructurados, con la ventaja de ejecución local sin conectividad.
- Prototipado e investigación en percepción BEV: el repositorio de Qualcomm y la librería AI Hub Models permiten comparar el comportamiento del modelo en distintos chipsets antes de comprometerse con un hardware concreto.
- Aplicaciones de vista aérea en móvil y PC con Windows on Snapdragon: los artefactos para Snapdragon X Elite, X2 Elite y 8 Gen 3/8 Gen 1 permiten desplegar el modelo en dispositivos de consumo, útil para demos y pruebas de concepto.
- Evaluación comparativa de backends de inferencia: al publicarse en dos formatos (ONNX precompilado para QNN y binario de contexto QNN), sirve para medir la diferencia de latencia y consumo entre ambos modos de ejecución con QAIRT 2.45.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una sección de resumen de rendimiento por dispositivo (`performance summary`) y enlaza a Qualcomm AI Hub Models, pero los valores concretos de latencia, throughput o precisión no aparecen en la información proporcionada para esta ficha.

## Requisitos de hardware

- El modelo no se ejecuta sobre GPU de servidor: los artefactos publicados son para NPU Hexagon de Qualcomm, por lo que conceptos como VRAM no aplican directamente.
- Espacio de almacenamiento: el repositorio completo ocupa 0,3 GB en precisión float; ese es el orden de magnitud del peso de los artefactos por variante.
- Plataformas con artefactos PRECOMPILED_QNN_ONNX y QNN_CONTEXT_BINARY: Snapdragon X2 Elite, Snapdragon X Elite, Snapdragon 8 Gen 3, Snapdragon 8 Gen 1, Snapdragon 8 Elite (Galaxy), Snapdragon 8 Elite Gen 5 (Galaxy), Dragonwing IQ-8275, Dragonwing QCS8550 (proxy), Dragonwing IQ-9075; en binario de contexto también SA8775P, SA7255P y SA8295P.
- SDK necesarios: QAIRT 2.45; para el formato ONNX precompilado, ONNX Runtime 1.27.1.
- No cabe en GPU de consumo en el sentido habitual del término: no hay artefactos CUDA, ROCm ni Metal publicados. Para hardware no Qualcomm habría que reexportar desde la implementación de referencia o desde la librería Qualcomm AI Hub Models.
- Opciones de despliegue: QNN (directo con binario de contexto) y ONNX Runtime con el artefacto precompilado. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, que son runtimes de modelos de lenguaje y no aplican a este modelo.
- Latencia y throughput: no disponibles. No se han proporcionado cifras de rendimiento por dispositivo.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos comparables (parámetros, licencia, resolución de entrada, métricas de precisión) que permitan una comparación rigurosa. El único punto de referencia citado es la implementación de referencia `hustvl/GKT`, de la que este repositorio es una exportación optimizada, no una alternativa distinta.

## Limitaciones y advertencias

- La model card proporcionada está truncada: falta el final de la tabla de artefactos y la sección de rendimiento, por lo que podría existir información adicional (por ejemplo, más chipsets o métricas) no reflejada aquí.
- No hay datos publicados sobre precisión del modelo, resolución de entrada, número de cámaras soportadas ni condiciones de operación (lluvia, noche, deslumbramiento), lo que impide evaluar su idoneidad para producción.
- No hay información sobre sesgos ni sobre el dataset de entrenamiento, un aspecto crítico en percepción para automoción por la posible infrarrepresentación de escenarios, geografías o tipos de usuarios.
- Riesgo de alucinación en el sentido generativo: no aplica, pero sí existe riesgo de falsos positivos y falsos negativos en la representación BEV, cuya magnitud no puede cuantificarse sin métricas.
- Los artefactos precompilados están ligados a versiones concretas (QAIRT 2.45, ONNX Runtime 1.27.1) y a chipsets específicos; un cambio de versión de SDK o de plataforma puede requerir reexportación.
- La licencia MIT del repositorio de Qualcomm permite uso comercial del artefacto, pero conviene verificar la licencia y las condiciones de la implementación de referencia `hustvl/GKT` antes de integrarla en un producto.
- Adopción muy baja en HuggingFace (0 descargas, 1 like en la consulta), lo que implica escasa validación por parte de la comunidad y poca casuística reportada de fallos.
- El tag `arxiv:2206.04584` apunta a un paper, pero su contenido no ha sido verificado en la información disponible; no debe citarse como fuente de detalles técnicos sin comprobarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/qualcomm/GKT
- Modelo en Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models/blob/v0.62.0/src/qai_hub_models/models/gkt
- Implementación de referencia: https://github.com/hustvl/GKT/
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Registro en Qualcomm: https://myaccount.qualcomm.com/signup
- Paper referenciado en las etiquetas: https://arxiv.org/abs/2206.04584
- Imagen de demostración: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/gkt/web-assets/model_demo.png
- Web corporativa de Qualcomm: https://www.qualcomm.com/
