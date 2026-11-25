# sebekblessing/krea-2-turbo-qnn-8elite

## Resumen

Krea 2 Turbo QNN 8 Elite es una compilación del modelo de generación de imágenes Krea 2 Turbo (desarrollado por Krea) empaquetada específicamente para el acelerador de IA Hexagon v79 del chip Snapdragon 8 Elite de Qualcomm. El autor del empaquetado es el usuario sebekblessing, que publica los binarios de contexto QNN necesarios para ejecutar el modelo en la aplicación Android Anima. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de pesos y grafo computacional a un formato ejecutable en el NPU del dispositivo.

El modelo original es un text-to-image de tipo difusión que genera imágenes de 768x768 píxeles en 8 pasos de muestreo. La arquitectura combina un codificador de texto basado en la mitad lingüística de Qwen3-VL-4B (cuantizado a 8 bits) con un transformador de difusión de 28 bloques (cuantizados a 4 bits) y un decodificador de imagen ligero (taew2_1). El paquete incluye además las tablas de modulación por paso y los niveles de ruido fijos para los 8 pasos.

Su relevancia radica en que demuestra la viabilidad de ejecutar un modelo de difusión de texto a imagen de tamaño medio directamente en el NPU de un teléfono de gama alta, sin depender de la nube. La licencia es la Krea 2 Community License, que impone restricciones de uso, y el paquete solo funciona en dispositivos con Snapdragon 8 Elite.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión text-to-image con codificador de texto Qwen3-VL-4B (mitad lingüística) y 28 bloques de difusión; compilado a binarios QNN para Hexagon v79 |
| Parametros totales | no disponible (el repositorio ocupa 11,8 GB e incluye pesos en 4 y 8 bits) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el codificador de texto es Qwen3-VL-4B, pero no se especifica la ventana de tokens del prompt) |
| Tipos de cuantizacion | 8 bits para el codificador de texto y la tabla de palabras; 4 bits para los 28 bloques de difusión |
| Idiomas soportados | no disponible (el codificador Qwen3-VL-4B es multilingüe, pero la model card no detalla idiomas) |
| Licencia | Krea 2 Community License (con Acceptable Use Policy de Krea) |
| Formato de pesos | Binarios QNN (.bin), tabla de palabras en bruto (.raw), tablas en float32 (.f32) y tokenizador JSON; no hay safetensors ni GGUF |

## Arquitectura y entrenamiento

El paquete no incluye información sobre el entrenamiento del modelo original. Krea 2 Turbo es un modelo de difusión para texto a imagen que, según los archivos publicados, se compone de un codificador de texto derivado de Qwen3-VL-4B (solo la mitad lingüística, en 8 bits), una etapa de fusión de texto que toma 12 capas del codificador y las proyecta en filas de prompt, y un tronco de 28 bloques de difusión con pesos en 4 bits. El decodificador de imagen es un modelo ligero denominado taew2_1. La generación se realiza en 8 pasos fijos, con tablas de modulación y niveles de ruido precalculados (`mods.f32`, `sigmas.txt`).

La innovación técnica principal de este repositorio es la compilación del grafo a binarios de contexto QNN para el Hexagon v79 del Snapdragon 8 Elite, mediante QAIRT 2.50. Los 28 bloques de difusión se cargan uno a uno desde archivos separados (`b0.bin` a `b27.bin`), lo que reduce el pico de memoria en el dispositivo. Los scripts de conversión y empaquetado (`krea_model.py`, `export_krea.py`, `build_krea.sh`, `make_tables.py`) están incluidos en el directorio `build/`. No se detallan datos de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de imágenes a partir de texto en resolución de 768x768 píxeles.
- Generación en 8 pasos de muestreo, lo que reduce la latencia frente a modelos de difusión con más pasos.
- Ejecución en el NPU Hexagon v79 del Snapdragon 8 Elite mediante binarios QNN.
- Codificador de texto multilingüe heredado de Qwen3-VL-4B (aunque la model card no especifica idiomas).
- Carga por bloques de los 28 bloques de difusión para limitar el uso de memoria.
- Integración con la aplicación Android Anima mediante `manifest.json`.
- No se documentan capacidades de tool calling, agentes, visión de entrada, audio ni modo de razonamiento.

## Casos de uso

- Generación de imágenes en el propio dispositivo: la aplicación Anima puede crear imágenes de 768x768 a partir de texto sin enviar datos a la nube, usando el NPU del Snapdragon 8 Elite y los binarios QNN incluidos.
- Aplicaciones de privacidad: al ejecutarse localmente, los prompts y las imágenes no salen del teléfono, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Prototipado de experiencias creativas móviles: desarrolladores Android pueden integrar el paquete en apps de edición o generación de contenido y evaluar la latencia real en hardware de gama alta.
- Demostración de despliegue en NPU: sirve como referencia para compilar otros modelos de difusión a QNN y medir el rendimiento del Hexagon v79 en tareas de generación de imágenes.
- Generación de imágenes por lotes en movilidad: con 8 pasos fijos y pesos en 4 bits, el modelo es adecuado para producir varias imágenes seguidas en un dispositivo sin conexión.
- Investigación sobre cuantización: los archivos separados por bloque y las tablas de modulación permiten estudiar el impacto de la cuantización a 4 bits en la calidad de imagen dentro de un pipeline móvil.
- Educación y demostraciones: el repositorio incluye los scripts de conversión, lo que facilita explicar el proceso de exportación de un modelo de difusión a un acelerador móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Dispositivo con chip Snapdragon 8 Elite y acelerador Hexagon v79; los archivos solo se ejecutan en ese hardware.
- El repositorio ocupa 11,8 GB, por lo que se necesita espacio de almacenamiento suficiente en el dispositivo o durante la descarga.
- Los 28 bloques de difusión se cargan uno a la vez, lo que reduce el pico de memoria, pero no se especifica la VRAM o memoria RAM mínima necesaria.
- No se indica compatibilidad con GPU de escritorio (A100, H100, RTX 4090) ni con otros aceleradores.
- Opciones de despliegue: aplicación Android Anima con los binarios QNN; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea 2 Turbo QNN 8 Elite | no disponible | no disponible | 768x768, 8 pasos | Krea 2 Community License | Solo Snapdragon 8 Elite |
| Krea 2 Turbo (original) | no disponible | no disponible | no disponible | Krea 2 Community License | Hugging Face (krea/Krea-2-Turbo) |
| Alternativas de difusión móvil | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El paquete solo funciona en dispositivos con Snapdragon 8 Elite (Hexagon v79); no es portable a otros chips.
- Es una compilación no oficial de Krea 2 Turbo; el autor indica explícitamente que no es un lanzamiento de Krea.
- La licencia Krea 2 Community License y la Acceptable Use Policy de Krea imponen restricciones de uso; es necesario revisarlas antes de cualquier uso comercial.
- No se documentan sesgos del modelo original ni del paquete compilado.
- No se dispone de información sobre la tasa de alucinación visual o la fidelidad de las imágenes generadas.
- No se especifican los idiomas soportados por el codificador de texto en esta configuración.
- La cuantización a 4 bits de los bloques de difusión puede degradar la calidad de imagen frente al modelo original, aunque no se aportan métricas.
- No hay datos de latencia, consumo energético ni memoria necesaria en el dispositivo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/sebekblessing/krea-2-turbo-qnn-8elite
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Licencia: https://huggingface.co/sebekblessing/krea-2-turbo-qnn-8elite/blob/main/LICENSE.pdf
- Acceptable Use Policy de Krea: https://www.krea.ai/krea-2-use-policy
- Aplicación Anima: https://github.com/adiirfan/anima-android
