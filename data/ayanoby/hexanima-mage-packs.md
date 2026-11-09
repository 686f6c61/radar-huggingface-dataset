# ayanoby/hexanima-mage-packs

## Resumen

HexAnima Mage Packs es un paquete de pesos convertidos y empaquetados para ejecutar el modelo de generación y edición de imágenes Microsoft Mage-Flow-Edit-Turbo en la NPU Hexagon de los SoC Qualcomm Snapdragon 8 Gen 1 y 8+ Gen 1, es decir, en teléfonos Android de gama alta de 2022. Lo desarrolla ayanoby como parte del proyecto independiente HexAnima, y no es un modelo entrenado desde cero: es una conversión del modelo base de Microsoft (4.000 millones de parámetros, 4 pasos de inferencia) junto con su codificador de texto Qwen3-VL-4B, su torre de visión y su VAE propietaria Mage-VAE.

El problema que resuelve es la ausencia de un camino práctico para llevar un modelo de difusión de 4B a la NPU móvil: los formatos estándar (safetensors, GGUF) no son consumibles por el runtime Hexagon, y el autor publica aquí los binarios ya troceados con un `manifest.json` que permite descarga reanudable y verificación sha256 desde su propia aplicación. El resultado declarado es de 10 a 12 segundos por imagen en esos dispositivos.

Es relevante ahora porque demuestra la viabilidad de inferencia de difusión de 4B en hardware móvil de hace cuatro generaciones, con licencia MIT sobre el empaquetado. La contrapartida es fuerte: los ficheros no son utilizables con otras herramientas, el repo ocupa 8,7 GB y el modelo solo funciona dentro de la app HexAnima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) Mage-Flow-Edit-Turbo, con text encoder Qwen3-VL-4B, vision tower y VAE Mage-VAE; pesos convertidos para NPU Hexagon |
| Parametros totales | 4B en el modelo base (DiT + componentes); desglose de pesos: text encoder 4,0 GB, DiT 3,1 GB, vision tower 0,7 GB, VAE 0,3 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos empaquetados para el runtime Hexagon; sin detalle de precision) |
| Idiomas soportados | no disponible |
| Licencia | MIT para el empaquetado; componentes Qwen3-VL bajo Apache-2.0 |
| Formato de pesos | binarios propios empaquetados con `manifest.json` (descarga reanudable y verificacion sha256); no compatibles con otras herramientas |

## Arquitectura y entrenamiento

El modelo subyacente es Mage-Flow-Edit-Turbo de Microsoft, un diffusion transformer de 4.000 millones de parámetros diseñado para generación texto-a-imagen y edición de fotografía en 4 pasos de muestreo. Se apoya en un codificador de texto Qwen3-VL-4B (que aporta también la torre de visión, de 0,7 GB) y en una VAE propia, Mage-VAE. Esta ficha no dispone de datos sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo ajuste por preferencias; esa información corresponde a la model card original de Microsoft, no incluida en la información proporcionada.

La aportación de este repositorio no es el entrenamiento sino la conversión y el empaquetado para la NPU Hexagon de Snapdragon 8 Gen 1 y 8+ Gen 1. El autor distribuye los pesos troceados (unos 8,2 GB efectivos sobre un repo de 8,7 GB) y una app que los descarga uno a uno con reanudación y verificación de integridad mediante sha256. No se documentan innovaciones de decodificación especulativa ni de atención lineal; la optimización declarada es la ejecución en NPU con un objetivo de latencia de 10-12 s por imagen.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con el pipeline declarado en Hugging Face.
- Edición de fotografías (image-editing), gracias a la torre de visión y al codificador Qwen3-VL-4B.
- Inferencia en 4 pasos de muestreo, lo que reduce el coste computacional frente a esquemas de 20-50 pasos.
- Ejecución en la NPU Hexagon de Snapdragon 8 Gen 1 y 8+ Gen 1, con latencia declarada de 10-12 s por imagen.
- Descarga reanudable y verificación sha256 de los pesos desde la app HexAnima.
- No se documentan tool calling, function calling, modo agente, modo thinking, audio ni capacidades multilingües explícitas.

## Casos de uso

- Edición de fotos en el propio dispositivo: el modelo recibe una imagen y una instrucción en lenguaje natural y devuelve la edición sin enviar la foto a un servidor, lo que es adecuado para aplicaciones de privacidad en Android.
- Generación de imágenes offline: al ejecutarse en la NPU local, permite crear ilustraciones sin conectividad, útil en entornos con red intermitente o coste de datos elevado.
- Prototipado de apps de imagen para Android: el paquete y la app de referencia permiten validar un flujo completo de descarga, verificación y ejecución en un Snapdragon 8 Gen 1/8+ Gen 1 sin montar infraestructura de GPU.
- Investigación sobre inferencia de difusión en NPU móvil: sirve como banco de pruebas reproducible para medir latencia y consumo de un DiT de 4B en Hexagon.
- Filtros y retoques asistidos en galerías: la edición por instrucción encaja en herramientas de retoque rápido donde 10-12 s por imagen es aceptable para uso interactivo no masivo.
- Demos y docencia: el tamaño de 8,7 GB y la licencia MIT del empaquetado facilitan montar una demostración funcional de generación y edición de imágenes en un teléfono de 2022.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento declarado es la latencia de 10-12 segundos por imagen en Snapdragon 8 Gen 1 / 8+ Gen 1.

## Requisitos de hardware

- SoC: Qualcomm Snapdragon 8 Gen 1 o Snapdragon 8+ Gen 1 exclusivamente, por la conversión específica a su NPU Hexagon.
- Almacenamiento: unos 8,7 GB para el repositorio completo (8,2 GB de pesos efectivos), más espacio temporal durante la descarga.
- Memoria: no disponible en la información proporcionada.
- GPU de escritorio: no aplica; los pesos no son utilizables con CUDA, ROCm ni Metal.
- Opciones de despliegue: únicamente la app HexAnima (https://github.com/ayanoby/hexanima); no hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 10-12 s por imagen según el autor. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HexAnima Mage Packs (este) | 4B (base) | no disponible | 10-12 s/imagen en Snapdragon 8 Gen 1/8+ Gen 1 | MIT (empaquetado); Apache-2.0 en Qwen3-VL | Solo app HexAnima, NPU Hexagon |
| microsoft/Mage-Flow-Edit-Turbo | 4B | no disponible | no disponible | no disponible en esta informacion | Hugging Face, uso general |
| Otros modelos texto-a-imagen de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de alternativas en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Portabilidad nula: los pesos no son utilizables con otras herramientas y están atados a la NPU Hexagon de Snapdragon 8 Gen 1 y 8+ Gen 1.
- Dependencia de la app: solo se consumen a través de HexAnima, lo que limita la integración en pipelines propios.
- Sin datos de calidad: no hay benchmarks publicados, por lo que no se puede evaluar la fidelidad de las imágenes ni comparar con el modelo original de Microsoft.
- Riesgo de alucinación visual y de sesgos: no hay información sobre sesgos del modelo base ni sobre su comportamiento en edición; debe evaluarse antes de uso en producción.
- Idiomas: no disponibles; el comportamiento multilingüe del codificador de texto no está documentado en esta ficha.
- Licencia: el empaquetado es MIT, pero los componentes Qwen3-VL son Apache-2.0 y deben respetarse sus términos; conviene revisar `NOTICE.md` para autores, fuentes y cambios.
- Proyecto no oficial: HexAnima es independiente y no está afiliado a los autores citados en `NOTICE.md`, lo que implica ausencia de soporte oficial.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria.
- Latencia no apta para generación masiva: 10-12 s por imagen limita su uso a interacción individual o volúmenes bajos.

## Enlaces

- Hugging Face: https://huggingface.co/ayanoby/hexanima-mage-packs
- Repositorio de la app HexAnima: https://github.com/ayanoby/hexanima
- Modelo base: https://huggingface.co/microsoft/Mage-Flow-Edit-Turbo
