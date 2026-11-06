# matrixportalx/iris-3b-turbo-npu

## Resumen

Iris-3B Turbo NPU es un paquete de pesos en formato GGUF preparado para ejecutar el modelo de generación de imágenes Iris-3B Turbo sobre la ruta NPU Hexagon de stable-diffusion.cpp en dispositivos Snapdragon. El modelo original lo desarrolla speridlabs y es un transformer de difusión (DiT) de aproximadamente 3.000 millones de parámetros que opera directamente en espacio de píxeles, sin VAE, en una variante destilada de 4 pasos. Este repositorio, publicado por matrixportalx, no entrena ni modifica el modelo: se limita a convertir los safetensors BF16 originales a GGUF y a empaquetar el codificador de texto Qwen3-VL-4B en Q4_0 junto con la configuración de inferencia.

La relevancia del paquete es de infraestructura más que de modelado: permite desplegar un generador de imágenes de 3B en hardware móvil ARM con aceleración NPU, algo poco habitual en el ecosistema open source, donde la mayoría de los pipelines de difusión dependen de CUDA o de CPU. Al eliminar el VAE y reducir la destilación a 4 pasos, el coste computacional por imagen baja de forma drástica, lo que encaja con las restricciones térmicas y de memoria de un SoC Snapdragon.

Conviene señalar que el repositorio tiene cero descargas y cero likes en el momento de la consulta, que su motor requiere un parche no incluido en la versión estándar de stable-diffusion.cpp y que la model card está redactada en turco. Es, por tanto, un artefacto de nicho orientado a aplicaciones concretas del autor, no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) en espacio de píxeles, sin VAE; variante destilada de 4 pasos |
| Parámetros totales | 2.987.511.888 (aprox. 3B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_0 para pesos grandes, F16 para salidas MLP con ancho de entrada no múltiplo de 32 y para embeddings, F32 para normas y sesgos; codificador de texto en Q4_0 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (origen en safetensors BF16) |

## Arquitectura y entrenamiento

El modelo subyacente, Iris-3B Turbo de speridlabs, es un diffusion transformer que genera imágenes directamente en espacio de píxeles, prescindiendo del autoencoder variacional que suele mediar entre el espacio latente y la imagen final. La variante Turbo es una versión destilada que reduce el muestreo a 4 pasos, lo que multiplica la velocidad de inferencia a costa de cierta fidelidad frente al modelo completo. El codificador de texto asociado es Qwen3-VL-4B, empaquetado aquí en Q4_0 y compartido con el paquete Krea-2-Turbo-npu del mismo autor.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO ni sobre innovaciones técnicas adicionales más allá de la destilación y de la eliminación del VAE. La conversión a GGUF aplicada en este repositorio sigue una política mixta de precisión: los pesos de gran tamaño se cuantizan a Q4_0, mientras que las capas sensibles (embeddings, normas y sesgos, y las salidas MLP cuyo ancho de entrada no es múltiplo de 32) se mantienen en F16 o F32 para preservar la estabilidad numérica.

## Capacidades

- Generación de imágenes texto-a-imagen en espacio de píxeles, sin decodificador VAE intermedio.
- Muestreo destilado en 4 pasos, orientado a latencia baja en hardware limitado.
- Codificación de instrucciones textuales mediante Qwen3-VL-4B, lo que aporta comprensión multimodal del prompt en el codificador.
- Ejecución sobre la ruta NPU Hexagon de stable-diffusion.cpp en plataformas Snapdragon.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo de difusión, no un LLM conversacional.
- El soporte multilingüe de los prompts depende del codificador Qwen3-VL-4B, pero no se detalla en la información disponible.

## Casos de uso

- Generación de imágenes en aplicación móvil Snapdragon: el paquete GGUF y la ruta NPU de stable-diffusion.cpp permiten ejecutar el pipeline en el propio dispositivo, sin depender de la nube, con 4 pasos de muestreo para mantener la latencia y el consumo térmico bajo control.
- Prototipado de interfaces creativas en Android: un desarrollador puede integrar el modelo en una app de edición fotográfica o de generación de bocetos y evaluar la calidad en hardware real antes de comprometerse con un backend en servidor.
- Investigación sobre difusión en espacio de píxeles: al no requerir VAE, el paquete simplifica el análisis de la dinámica del modelo y facilita experimentos sobre destilación de pasos en entornos ARM.
- Evaluación de cuantización mixta Q4_0/F16/F32: el repositorio sirve como caso de estudio de cómo afecta una política de precisión selectiva a la calidad de imagen en un DiT de 3B.
- Archivado y reproducibilidad: al ser un espejo de los archivos de origen con conversiones documentadas, permite reconstruir el pipeline aunque los repositorios originales desaparezcan o se privaticen.
- Despliegue en dispositivos de borde con memoria restringida: el tamaño de repositorio de 4,8 GB y la cuantización Q4_0 hacen viable cargar el modelo en equipos con menos de 8 GB de RAM unificada, siempre que el motor parcheado esté disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 4,8 GB, por lo que se necesita al menos ese espacio más el overhead del motor y del codificador de texto; en memoria unificada de SoC conviene reservar 6-8 GB.
- GPU recomendadas: no aplica en el sentido habitual; el destino es la NPU Hexagon de SoC Snapdragon. Para ejecución en CPU o GPU convencional habría que usar la ruta estándar de stable-diffusion.cpp, no cubierta por este paquete.
- Compatibilidad con GPU de consumo: no documentada para este paquete; el modelo original en safetensors podría ejecutarse en GPUs con suficiente VRAM, pero no se especifican requisitos.
- Opciones de despliegue: stable-diffusion.cpp con soporte para Iris y ruta Hexagon NPU; requiere el parche dit-iris.patch (adaptación del upstream #2117), no incluido en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Iris-3B Turbo NPU (este) | ~3B | No disponible | GGUF | Apache 2.0 | Repositorio público, 0 descargas |
| speridlabs/iris-3b (origen) | ~3B | No disponible | Safetensors BF16 | Apache 2.0 | Repositorio público |
| matrixportalx/Krea-2-Turbo-npu | No disponible | No disponible | GGUF | No disponible | Repositorio público |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El paquete no funciona con stable-diffusion.cpp estándar: requiere el parche dit-iris.patch, una adaptación del PR upstream #2117, lo que añade fricción de despliegue y riesgo de incompatibilidad futura.
- La model card está en turco y no documenta sesgos, composición del dataset ni evaluación de calidad; la trazabilidad ética del modelo original es limitada.
- Al ser un modelo de difusión destilado a 4 pasos, es esperable una pérdida de fidelidad y diversidad frente al modelo completo, aunque no se cuantifica en la información disponible.
- Riesgo de alucinación visual: como cualquier generador texto-a-imagen, puede producir contenido incoherente o no solicitado; no hay filtros de seguridad documentados.
- No se especifican idiomas soportados ni limitaciones de contexto del codificador de texto.
- La licencia Apache 2.0 permite uso comercial, pero el parche del motor y las dependencias de stable-diffusion.cpp tienen sus propias condiciones que deben verificarse por separado.
- El repositorio es un espejo de archivos de terceros con 0 descargas; no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/matrixportalx/iris-3b-turbo-npu
- Modelo original: https://huggingface.co/speridlabs/iris-3b
- Paquete relacionado (codificador de texto compartido): https://huggingface.co/matrixportalx/Krea-2-Turbo-npu
- Perfil del autor: https://huggingface.co/matrixportalx
- stable-diffusion.cpp (PR upstream #2117): no disponible como enlace directo en la información proporcionada
