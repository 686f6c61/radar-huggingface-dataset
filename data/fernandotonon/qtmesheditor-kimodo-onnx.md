# fernandotonon/QtMeshEditor-kimodo-onnx

## Resumen

Kimodo-SOMA-RP-v1.2 (ONNX) es una conversión al formato ONNX del modelo de generación de movimiento a partir de texto NVIDIA Kimodo-SOMA-RP-v1.2, publicada por el desarrollador fernandotonon. El modelo original lo desarrolla NVIDIA Corporation y este repositorio contiene únicamente los pesos convertidos y los grafos ONNX necesarios para ejecutar la inferencia sin Python, empleando ONNX Runtime y llama.cpp. El objetivo es integrar la generación text-to-motion de forma nativa en la aplicación de escritorio QtMeshEditor.

La conversión separa el modelo en cuatro grafos ONNX: un denoiser transformer de dos etapas con batch 1 y número de frames dinámico, un decoder de características a rotaciones SOMA-30, un encoder inverso y un módulo de condicionamiento de transiciones multi-segmento. El bucle de muestreo (DDIM con classifier-free guidance), el cosido de segmentos, el suavizado de raíz y el post-procesado MotionCorrection de NVIDIA se implementan en C++. La verificación frente a la generación en PyTorch original reporta un error máximo de rotación articular de 2e-4 y de 0,003 cm en la raíz, con contactos de pie idénticos.

El repositorio ocupa 1,2 GB y no incluye el codificador de texto, que reside en un repositorio aparte basado en un derivado de Meta Llama 3. No se dispone de información sobre arquitectura interna detallada, número de parámetros, contexto ni idiomas soportados más allá de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denoiser transformer de dos etapas (difusión) con encoder/decoder SOMA-30 y módulo de transición; exportado a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen grafos ONNX; el codificador de texto asociado se publica en GGUF) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | ONNX (`kimodo_denoiser.onnx`, `kimodo_decode.onnx`, `kimodo_encode.onnx`, `kimodo_transition.onnx`) más `kimodo_meta.json` con estadísticas de normalización, schedule de difusión, esqueletos y rig de post-procesado |

## Arquitectura y entrenamiento

La model card describe un denoiser transformer de dos etapas que opera en un esquema de difusión, con un decoder que transforma características en rotaciones SOMA-30, raíz y contactos, un encoder que realiza la operación inversa a partir de rotaciones SOMA-30 y raíz (incluida la raíz suavizada), y un módulo específico de condicionamiento de transiciones para concatenar múltiples segmentos. El muestreo utiliza DDIM con classifier-free guidance y se ejecuta fuera del grafo ONNX, en C++, junto con el cosido de segmentos, el suavizado de raíz y el post-procesado MotionCorrection de NVIDIA.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones de entrenamiento. La model card solo documenta el proceso de exportación (`scripts/export-kimodo-onnx.py`) y la verificación numérica frente a la implementación PyTorch: error máximo de rotación articular de 2e-4, error de raíz de 0,003 cm y contactos de pie idénticos con las mismas características de texto y ruido. El codificador de texto es un derivado de Meta Llama 3 (LLM2Vec-8B) publicado por separado en formato GGUF.

## Capacidades

- Generación de movimiento 3D (text-to-motion) a partir de descripciones textuales, con salida en rotaciones SOMA-30, trayectoria de raíz y contactos de pie.
- Condicionamiento multi-segmento mediante el grafo `kimodo_transition.onnx`, que permite encadenar segmentos de movimiento.
- Codificación inversa de movimiento a características (`kimodo_encode.onnx`), útil para tareas de edición o continuidad.
- Ejecución nativa sin Python mediante ONNX Runtime y llama.cpp, pensada para integración en aplicaciones de escritorio.
- Post-procesado MotionCorrection de NVIDIA para corregir artefactos del movimiento generado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo.

## Casos de uso

- Animación de personajes en herramientas de escritorio: QtMeshEditor utiliza estos grafos para generar animaciones a partir de prompts de texto sin depender de un entorno Python, lo que simplifica la distribución del binario.
- Previsualización de movimiento en pipelines de modelado 3D: el decoder SOMA-30 permite convertir características generadas en rotaciones articulares directamente aplicables a un rig.
- Generación de secuencias largas por concatenación: el módulo de transición y el cosido de segmentos en C++ permiten encadenar varios clips manteniendo continuidad en la raíz y los contactos.
- Edición y retargeting de movimiento: el encoder inverso posibilita proyectar movimiento existente al espacio de características del modelo para su posterior decodificación o mezcla.
- Prototipado de videojuegos y previsualización: la inferencia ONNX con batch 1 y frames dinámicos encaja en escenarios interactivos donde se genera movimiento bajo demanda.
- Investigación en generación de movimiento: la separación en grafos permite sustituir o analizar etapas concretas (denoiser, decoder, transición) de forma aislada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica documentada es la verificación de fidelidad de la conversión frente a PyTorch: error máximo de rotación articular de 2e-4, error de raíz de 0,003 cm y contactos de pie idénticos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 1,2 GB en disco, pero no se detalla el consumo en memoria de los grafos ONNX ni del codificador de texto GGUF.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime (grafos `kimodo_*.onnx`) y llama.cpp para el codificador de texto GGUF asociado; el bucle de muestreo, cosido y post-procesado requieren implementación en C++.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de text-to-motion ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni validación por terceros.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas; al tratarse de un modelo de movimiento, el riesgo principal es la generación de animaciones no plausibles o incoherentes con el texto.
- La licencia es la NVIDIA Open Model License, no una licencia de código abierto estándar; es necesario revisar sus términos antes de un uso comercial.
- El modelo no es autónomo: requiere el codificador de texto publicado en un repositorio separado y una implementación en C++ del bucle de muestreo y del post-procesado para funcionar.
- La conversión está verificada numéricamente frente a PyTorch, pero no se documentan pruebas de robustez, sesgos ni calidad subjetiva de las animaciones.
- No se dispone de información sobre parámetros, contexto, idiomas ni cuantizaciones, lo que dificulta estimar requisitos de despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fernandotonon/QtMeshEditor-kimodo-onnx
- Modelo base: https://huggingface.co/nvidia/Kimodo-SOMA-RP-v1.2
- Codificador de texto GGUF: https://huggingface.co/fernandotonon/Llama-3-LLM2Vec-8B-Kimodo-TextEncoder-GGUF
- Repositorio QtMeshEditor: https://github.com/fernandotonon/QtMeshEditor
- Script de exportación: https://github.com/fernandotonon/QtMeshEditor/blob/master/scripts/export-kimodo-onnx.py
- Licencia NVIDIA Open Model License: https://huggingface.co/fernandotonon/QtMeshEditor-kimodo-onnx/blob/main/LICENSE-NVIDIA-OML.txt
