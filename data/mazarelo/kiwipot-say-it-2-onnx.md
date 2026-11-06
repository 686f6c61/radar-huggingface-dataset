# mazarelo/kiwipot-say-it-2-onnx

## Resumen

Say it 2 es un modelo derivado de Qwen3-0.6B, afinado por el autor `mazarelo` para la aplicación Kiwipot y exportado a ONNX para su ejecución en navegador mediante transformers.js y WebGPU. Su tarea es convertir comandos hablados o escritos en un JSON estructurado de acciones de Kiwipot (por ejemplo, completar tareas o reprogramar eventos), además de extraer to-dos, títulos y secciones de notas de voz. Está disponible en seis idiomas: inglés, alemán, castellano, portugués, francés e italiano.

El modelo se distribuye únicamente en formato ONNX cuantizado en 4 bits (`onnx/model_q4f16.onnx`), con bloques de 32 y embeddings de entrada y salida compartidos, generado con el model builder de ONNX Runtime GenAI. El repositorio ocupa 0,4 GB y está pensado para descargarse bajo demanda y ejecutarse en la GPU del dispositivo del usuario, sin enviar datos a servidores externos.

Es relevante por su enfoque de privacidad y despliegue en el cliente: un modelo pequeño (0,6B parámetros) especializado en una tarea acotada de extracción de intenciones y estructuración de comandos, ejecutable en navegador y en aplicaciones móviles/escritorio. La ficha se basa en la información pública disponible del repositorio y de su model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), exportado a ONNX |
| Parametros totales | 0,6B (heredados de Qwen/Qwen3-0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | ONNX q4f16 (pesos en 4 bits en bloques de 32, activaciones/numéricos en 16 bits); GGUF disponible en el repositorio de releases del autor |
| Idiomas soportados | inglés, alemán, castellano, portugués, francés e italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_q4f16.onnx`); GGUF en `mazarelo/kiwipot-models` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder-only de la familia Qwen3, y se ha afinado para una tarea concreta de instrucción: mapear una frase en lenguaje natural a un JSON de acciones de Kiwipot con un esquema fijo (`language`, `actions` con campos como `action`, `target` y `when`). El prompt sigue el formato de chat de Qwen3 con una línea de instrucción por tarea. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica principal es la exportación a ONNX con cuantización q4f16 (pesos en 4 bits, bloques de 32, embeddings de entrada y salida compartidos) mediante el model builder de ONNX Runtime GenAI, lo que permite ejecutar el modelo en navegador con transformers.js y WebGPU, así como en aplicaciones móviles y de escritorio mediante la variante GGUF. El objetivo es mantener la inferencia en el dispositivo y evitar el envío de datos a la nube.

## Capacidades

- Generación de texto estructurado: produce JSON válido con el esquema de acciones de Kiwipot a partir de comandos hablados o escritos.
- Extracción de acciones múltiples en una sola frase (por ejemplo, completar una tarea y reprogramar otra).
- Procesamiento de notas de voz: extracción de to-dos, generación de títulos y segmentación en secciones.
- Multilingüe en seis idiomas: inglés, alemán, castellano, portugués, francés e italiano.
- Ejecución en cliente: inferencia en navegador con transformers.js y WebGPU, y en móvil/escritorio con GGUF.
- No se documentan capacidades de tool calling genérico, agentes multi-paso, visión, audio nativo ni modo de razonamiento explícito más allá de la tarea de estructuración descrita.

## Casos de uso

- Asistentes de productividad por voz: el modelo convierte una frase como "marca llamar a mamá y mueve al dentista al viernes a las 3" en un JSON de acciones que la aplicación ejecuta directamente, gracias a su entrenamiento específico en el esquema de Kiwipot.
- Gestión de tareas en aplicaciones móviles: al ejecutarse con GGUF en el dispositivo, permite crear, completar o reprogramar tareas sin conexión y sin enviar datos personales a servidores.
- Procesamiento de notas de voz: extrae to-dos, genera un título y divide la transcripción en secciones, lo que facilita organizar notas dictadas en reuniones o desplazamientos.
- Aplicaciones web con privacidad estricta: al ejecutarse en el navegador con transformers.js y WebGPU, permite ofrecer asistencia por comandos sin que el audio o el texto salgan del dispositivo.
- Automatización de recordatorios multilingües: al soportar seis idiomas, puede desplegarse en aplicaciones para usuarios de distintas regiones con una sola variante del modelo.
- Prototipado de interfaces de voz: su tamaño reducido (0,6B) y su formato ONNX facilitan integrarlo en demos y entornos de desarrollo web sin infraestructura de GPU en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con cuantización q4f16 y 0,6B parámetros, el repositorio ocupa 0,4 GB, por lo que la huella de memoria es reducida y apta para GPUs integradas y móviles.
- GPU recomendadas: no se especifican modelos concretos; el despliegue está orientado a WebGPU en navegador y a GPU de dispositivos móviles y de escritorio.
- Compatibilidad con GPU de consumo: sí, por tamaño y cuantización; no se detallan modelos concretos (RTX, Apple Silicon, etc.).
- Opciones de despliegue: transformers.js con WebGPU (navegador), ONNX Runtime GenAI (formato ONNX) y llama.cpp u otros runners compatibles con GGUF (variante publicada en `mazarelo/kiwipot-models`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Say it 2 (este modelo) | 0,6B | no disponible | Apache 2.0 | ONNX q4f16, GGUF | Afinado para el esquema JSON de Kiwipot; 6 idiomas; ejecución en cliente |
| Qwen/Qwen3-0.6B | 0,6B | no disponible | Apache 2.0 | safetensors y otros | Modelo base generalista; no especializado en el esquema de Kiwipot |
| Alternativas de extracción de intenciones | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Modelo altamente especializado: está afinado para el esquema JSON de Kiwipot y no para tareas generales de generación, razonamiento o código.
- Riesgo de alucinación en la estructura: puede generar campos o acciones fuera del esquema esperado; conviene validar el JSON en producción.
- Idiomas limitados a seis (inglés, alemán, castellano, portugués, francés e italiano); no se documenta cobertura de otros idiomas.
- No se detallan sesgos conocidos ni evaluaciones de robustez en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3-0.6B y de los componentes de ONNX Runtime GenAI.
- El repositorio tiene pocas descargas (35) y ningún like en el momento de la consulta, lo que indica una validación comunitaria limitada.
- No se especifican la longitud de contexto efectiva ni el rendimiento medido; conviene realizar pruebas propias antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mazarelo/kiwipot-say-it-2-onnx
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Aplicación Kiwipot: https://kiwipot.com
- Documentación de transformers.js: https://huggingface.co/docs/transformers.js
- Releases GGUF: https://github.com/mazarelo/kiwipot-models/releases/tag/say-it-2
