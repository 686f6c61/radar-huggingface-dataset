# agnosticeng/Qwen3.8-27B-4bit

## Resumen

Qwen3.8-27B-4bit es una cuantización en 4 bits del modelo Qwen/Qwen3.8-27B, publicada por el usuario agnosticeng y convertida con mlx-vlm. Se trata de un modelo denso de 27.356.728.560 parámetros que forma parte de la familia Qwen3.8, con una arquitectura de atención híbrida: 16 de sus 64 capas usan atención completa y las otras 48 usan atención lineal con estado recurrente constante. El modelo original es multimodal, capaz de entender imágenes y videos, con un control de pensamiento flexible diseñado para tareas complejas de múltiples pasos. Esta versión cuantizada reduce el tamaño de los pesos a aproximadamente 15 GB y está pensada para ejecutarse en Apple Silicon mediante MLX, e incluye el head de predicción multi-token (MTP) para decodificación especulativa. Su relevancia radica en que permite desplegar un modelo de 27B multimodal en equipos con memoria unificada limitada, sin necesidad de servidores con GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (64 capas: 16 con atención completa, 48 con atención lineal) del modelo base Qwen3.8-27B; cuantización MLX 4-bit |
| Parámetros totales | 27.356.728.560 (~27.36 mil millones) |
| Parámetros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Affine 4-bit, group size 64 (~4.7 bits por peso, ~15 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.8-27B, un transformer denso con atención híbrida. Según la documentación de vLLM, de las 64 capas totales solo 16 ejecutan atención completa (full_attention_interval: 4), mientras que las 48 restantes utilizan atención lineal con un estado recurrente constante. Esta combinación reduce el coste computacional y permite manejar secuencias largas de forma más eficiente que un transformer estándar. El modelo original es nativo de visión-lenguaje, por lo que incorpora un vision tower para procesar imágenes y videos.

La cuantización realizada por agnosticeng es de tipo affine 4-bit con group size 64, lo que arroja una densidad de aproximadamente 4.7 bits por peso y un tamaño de pesos de unos 15 GB. La conversión se llevó a cabo con mlx-vlm, por lo que el vision tower queda incluido en los pesos cuantizados. Además, se añade el head MTP (multi-token prediction) en la carpeta `mtp/`, con claves prefijadas `mtp.` y cuantizado también a 4 bits, para habilitar la decodificación especulativa. No se dispone de información sobre los datos de entrenamiento del modelo base, la composición del dataset ni sobre procesos de RLHF/DPO.

## Capacidades

- Procesamiento multimodal (image-text-to-text): el modelo puede entender imágenes y videos gracias al vision tower incluido en la cuantización.
- Generación de texto conversacional, orientada a interacciones en lenguaje natural.
- Control de pensamiento flexible: el modelo base está diseñado para tareas de razonamiento de múltiples pasos con mayor fiabilidad, según la descripción oficial.
- Decodificación especulativa: incluye un head de predicción multi-token (MTP) que puede acelerar la generación de texto cuando el framework de ejecución lo soporta.
- Soporte de agentes y multi-step reasoning: la arquitectura y el diseño del modelo base apuntan a tareas complejas encadenadas, aunque no se especifica soporte de tool calling en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Idiomas: no disponible.

## Casos de uso

- Asistente multimodal local en Apple Silicon: gracias a la cuantización MLX 4-bit y al vision tower incluido, el modelo puede responder preguntas sobre imágenes o capturas de pantalla en un Mac sin conexión a internet, lo que resulta útil en entornos donde la privacidad es crítica.

- Análisis de documentos con imágenes: permite extraer información de PDFs escaneados, diagramas o fotografías, combinando la comprensión visual y textual. Es adecuado para aplicaciones de archivo o procesamiento de documentos que requieren razonamiento sobre contenido mixto.

- Aplicaciones interactivas con baja latencia: el head MTP incluido puede usarse para decodificación especulativa, reduciendo el tiempo de respuesta en chatbots o editores asistidos. Se debe integrar en un framework compatible con MLX que aproveche el MTP.

- Investigación en visión-lenguaje sin GPU dedicada: al ejecutarse en Apple Silicon, permite experimentar con un modelo de 27B en equipos con 16-32 GB de memoria unificada, evitando el coste de infraestructura en la nube. Es una opción para prototipado rápido en entornos de desarrollo locales.

- Generación de descripciones de imágenes para accesibilidad: puede describir el contenido visual de una escena para personas con discapacidad visual en aplicaciones que se ejecutan localmente, garantizando que los datos no salen del dispositivo. El tamaño del modelo permite captar detalles contextuales relevantes.

- Planificación y razonamiento multi-paso en sistemas de agentes: el modelo base está diseñado para llevar a cabo tareas complejas que requieren varios pasos, por lo que puede usarse como motor de razonamiento en flujos de agentes controlados, aunque antes de desplegarlo en producción conviene verificar si el soporte de tool calling es necesario para el caso concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Los pesos cuantizados ocupan aproximadamente 15 GB, y el repositorio completo tiene un tamaño de 16.3 GB. En Apple Silicon se necesita una memoria unificada suficiente para cargar los pesos y las activaciones; se recomienda un mínimo de 16 GB, y preferiblemente 24-32 GB para dejar espacio a la caché KV y al head MTP.
- Se ejecuta en Apple Silicon mediante MLX, siendo compatible con chips M1 y posteriores. No está diseñado para GPUs NVIDIA ni para entornos CUDA.
- No aplica a GPUs de consumo: el modelo está destinado a Apple Silicon, no a tarjetas gráficas tradicionales.
- Opciones de despliegue: MLX y mlx-vlm; no se ha confirmado soporte para vLLM, llama.cpp o TGI en esta cuantización específica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en los datos proporcionados. La referencia más directa es el modelo base Qwen/Qwen3.8-27B sin cuantizar, que no está adaptado a MLX y requiere más memoria, pero no se han encontrado métricas de rendimiento comparativas entre ambas versiones.

## Limitaciones y advertencias

- La cuantización 4-bit puede degradar la calidad de las salidas en comparación con el modelo original de mayor precisión.
- No se han publicado evaluaciones de sesgos, alucinaciones o seguridad para esta cuantización específica.
- Los idiomas soportados no se especifican en la información disponible.
- El modelo está diseñado para ejecutarse con MLX en Apple Silicon; no es compatible con aceleradores NVIDIA u otros frameworks sin una conversión adicional.
- El head MTP requiere soporte del framework para aprovechar la decodificación especulativa; si no se usa, puede ignorarse sin afectar al funcionamiento básico.
- Licencia Apache-2.0: permite uso comercial, pero requiere mantener el aviso de licencia y las atribuciones correspondientes.
- El repositorio muestra 0 descargas y 1 like, lo que sugiere una adopción temprana o limitada. Se recomienda validar su funcionamiento antes de utilizarlo en entornos de producción.

## Enlaces

- Hugging Face del modelo cuantizado: https://huggingface.co/agnosticeng/Qwen3.8-27B-4bit
- Hugging Face del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Ficha técnica del modelo base en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
