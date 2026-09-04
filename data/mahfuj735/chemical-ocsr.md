# mahfuj735/chemical-ocsr

## Resumen
El modelo `chemical-ocsr` de mahfuj735 es un sistema de reconocimiento óptico de estructuras químicas (OCSR) que convierte imágenes de diagramas moleculares en representaciones SMILES canónicas. Está diseñado como una canalización jerárquica de dos etapas para su ejecución en tiempo real en dispositivos móviles y de borde. La primera etapa utiliza un clasificador ConvNeXt-V2-Nano de 60 MB que determina si la imagen contiene una única molécula, una reacción, varias moléculas u otro contenido; la segunda etapa, activada solo cuando se detecta una molécula única, emplea un codificador MobileNetV3-Large con atención cruzada 2D y un decodificador GRU autoregresivo para generar el SMILES.

El modelo se distribuye en formato ONNX y está pensado para aplicaciones con dependencia cero de la nube, como la app Chemical AI Studio (cicapp). Es relevante porque aborda la necesidad de digitalizar estructuras químicas en entornos sin conexión, con un tamaño total de artefactos de 0,1 GB y latencias de inferencia de 14 a 35 ms en hardware móvil.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline de dos etapas: clasificador ConvNeXt-V2-Nano + codificador MobileNetV3-Large con atención cruzada 2D y decodificador GRU autoregresivo |
| Parámetros totales | No disponible (tamaño de artefactos: 60 MB y 8,47 MB) |
| Parámetros activos | No aplica (no es modelo MoE) |
| Longitud de contexto | No disponible (modelo imagen-a-texto, no secuencial de texto) |
| Tipos de cuantización | No disponible (artefactos ONNX sin cuantización especificada) |
| Idiomas soportados | Inglés (vocabulario SMILES de 61 tokens) |
| Licencia | MIT |
| Formato de pesos | ONNX (archivos .onnx, vocabulario JSON) |

## Arquitectura y entrenamiento
La arquitectura es una canalización jerárquica de dos etapas. La primera etapa es un clasificador de diagramas químicos basado en ConvNeXt-V2-Nano, que produce una salida de cuatro clases: `one_molecule`, `reactions`, `several_molecules` y `rest`. Cuando la imagen se clasifica como `one_molecule`, se enruta a la segunda etapa, un modelo OCSR móvil compuesto por un codificador MobileNetV3-Large que genera una rejilla espacial de características de 7x7, un mecanismo de atención cruzada bidimensional de tipo Bahdanau y un decodificador GRU de dos capas que genera tokens SMILES de forma autoregresiva. El vocabulario utilizado contiene 61 tokens.

El modelo se entrenó con un conjunto de datos personalizado (`dataset: custom`), aunque no se especifica la composición exacta ni el número de tokens de entrenamiento. Se reportan métricas de precisión y F1, pero no se menciona el uso de RLHF, DPO ni otras técnicas de alineamiento. La innovación principal es el diseño para inferencia en el borde: los dos modelos se exportan a ONNX y están optimizados para ejecutarse con `flutter_onnxruntime` en Android, con un consumo de memoria RSS acotado por debajo de 450 MB.

## Capacidades
- Clasificación de diagramas químicos en cuatro categorías: molécula única, reacción, varias moléculas y otros.
- Reconocimiento óptico de estructuras químicas (OCSR) para convertir imágenes de moléculas en SMILES canónicos.
- Generación autoregresiva de tokens SMILES mediante decodificador GRU.
- Ejecución en tiempo real en dispositivos móviles y de borde (CPU/NPU) con latencias de 14 a 35 ms.
- Soporte de entrada de imágenes RGB de 224x224 píxeles.
- No dispone de soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas: el vocabulario es específico de SMILES, no de lenguaje natural.

## Casos de uso
- Digitalización de estructuras químicas en laboratorios: los investigadores pueden fotografiar estructuras dibujadas en pizarra o papel y obtener el SMILES correspondiente al instante, sin necesidad de conexión a internet.
- Aplicaciones móviles educativas de química: una app para estudiantes que permite escanear diagramas de moléculas de un libro de texto y mostrar la fórmula SMILES o buscar información sobre el compuesto.
- Integración en flujos de trabajo de química computacional: el modelo puede usarse como componente de un pipeline que convierte imágenes de estructuras en entradas para herramientas de modelado molecular, como RDKit.
- Herramientas de edición de documentos científicos: en un editor de artículos, el usuario puede importar una imagen de una estructura química y el sistema la convierte en texto SMILES editable.
- Asistentes de química en dispositivos móviles: la app Chemical AI Studio (cicapp) utiliza el modelo para ofrecer reconocimiento de estructuras sin dependencia de la nube, útil en entornos con limitaciones de conectividad.
- Automatización de inventarios de reactivos: en una empresa farmacéutica, se pueden escanear etiquetas o diagramas de compuestos para registrar automáticamente el SMILES en una base de datos.

## Benchmarks y rendimiento
Los resultados publicados en la model card se presentan a continuación. No hay comparativas con otros modelos en la información disponible.

| Etapa | Métrica | Valor |
|---|---|---|
| Clasificador ConvNeXt-V2-Nano | Precisión top-1 | 99,31% |
| Clasificador ConvNeXt-V2-Nano | F1 macro ponderado | 99,31% |
| Clasificador ConvNeXt-V2-Nano | Latencia media de inferencia en memoria | 30,8 ms |
| OCSR móvil | Tasa de validez sintáctica química | 99,90% |
| OCSR móvil | Tasa de coincidencia canónica exacta (ChemDraw) | 97,40% |
| OCSR móvil | Similitud media de huella Tanimoto Morgan | 99,71% |
| OCSR móvil | Tamaño pico del modelo | 8,47 MB |
| OCSR móvil | Latencia de inferencia en dispositivo | 14 - 35 ms |

## Requisitos de hardware
- Inferencia mediante ONNX Runtime, compatible con CPU y NPU de dispositivos móviles.
- Tamaño de los artefactos: 60 MB (clasificador) y 8,47 MB (OCSR), lo que permite su ejecución en dispositivos con poca memoria.
- Memoria RSS acotada por debajo de 450 MB en el despliegue móvil.
- No se especifican requisitos de GPU; el modelo está diseñado para edge AI y no requiere aceleradores de servidor.
- Opciones de despliegue: ONNX Runtime, `flutter_onnxruntime` para Flutter/Android. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia estimada: 30,8 ms para el clasificador y 14-35 ms para el OCSR en hardware móvil.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye comparaciones con otros modelos de OCSR o de clasificación de estructuras químicas.

## Limitaciones y advertencias
- El modelo solo está entrenado para estructuras químicas; no es un modelo de lenguaje general y no puede procesar texto libre.
- El idioma reportado es inglés, pero el vocabulario es específico de SMILES, no de lenguaje natural.
- La composición del conjunto de datos de entrenamiento no está documentada, lo que limita la evaluación de posibles sesgos.
- No se dispone de información sobre riesgos de alucinación; sin embargo, al ser un modelo generativo de SMILES, existe la posibilidad de producir secuencias sintácticamente válidas pero químicamente incorrectas.
- No se especifican restricciones de licencia más allá de la MIT, que permite uso comercial, modificación y redistribución.
- El modelo no soporta tool calling ni razonamiento multi-paso, por lo que no es adecuado para tareas de agente.

## Enlaces
- HuggingFace: https://huggingface.co/mahfuj735/chemical-ocsr
