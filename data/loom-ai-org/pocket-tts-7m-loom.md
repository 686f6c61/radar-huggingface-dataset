# loom-ai-org/pocket-tts-7m-loom

## Resumen

Pocket TTS 7M (English) es un modelo de síntesis de voz (text-to-speech) de muy reducido tamaño distribuido por loom-ai-org como exportación del modelo `kyutai/pocket-tts` al formato GGUF propio del motor loom.cpp. El modelo suma 7.119.793 parámetros y está pensado para inferencia local ligera: convierte texto en inglés directamente en audio, sin necesidad de fonemizador externo, ya que codifica el texto por sí mismo. Su relevancia radica en el tamaño (unos 0,1 GB de repositorio) y en que incluye una voz integrada y un mecanismo de streaming de audio por fragmentos.

La arquitectura interna, según la model card, combina un modelo de lenguaje de flujo de 4,2 millones de parámetros que opera sobre latentes del códec Mimi y un decodificador de 2,6 millones de parámetros. Se trata de la destilación de 7M de Pocket TTS realizada por Kyutai, con ajuste fino por recompensa, por lo que sacrifica calidad frente al modelo completo a cambio de un coste computacional mínimo.

La exportación la produce loom-exporter y se ejecuta con la librería `loom-py` (paquete `loom-py-rt` en PyPI). El modelo está licenciado bajo CC-BY-4.0, heredada del modelo base, y solo soporta inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de flujo (4,2M parámetros) sobre latentes del códec Mimi + decodificador (2,6M parámetros) |
| Parámetros totales | 7.119.793 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | F32 y otras precisiones cuantizadas (el repositorio contiene varios ficheros GGUF; no se detallan los esquemas exactos) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (con grafos, tokenizador y driver embebidos; exportado por loom-exporter) |

## Arquitectura y entrenamiento

El modelo es una destilación de 7M parámetros de Pocket TTS de Kyutai, publicada en octubre de 2026 y sometida a ajuste fino por recompensa (reward fine-tuning). Internamente se descompone en dos piezas: un modelo de lenguaje de flujo de 4,2M de parámetros que modela latentes del códec de audio Mimi, y un decodificador de 2,6M de parámetros que convierte esos latentes en forma de onda. El texto se codifica dentro del propio modelo, de modo que no requiere un fonemizador separado.

La exportación a loom.cpp genera un único fichero GGUF autodescriptivo que transporta sus propias topologías de grafo, el tokenizador y el script de driver. El fichero F32 contiene los parámetros sin modificar; el resto de ficheros del repositorio son cuantizaciones derivadas de este. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de ajuste por recompensa.

## Capacidades

- Síntesis de voz a partir de texto en inglés, con salida de audio a 24 kHz.
- Codificación de texto integrada: no necesita fonemizador externo.
- Voz integrada por defecto (`alba`) y selección entre 26 voces adicionales empaquetadas como ficheros de voz en `voices/`.
- Generación en streaming: el driver del modelo entrega el audio por fragmentos que, unidos, equivalen a la forma de onda completa de `infer`.
- Carga de ficheros de voz propios mediante el parámetro `voice=`, siempre que sean compatibles con la huella de estos pesos.
- Muestreo estocástico por defecto con temperatura 0,3 del checkpoint, de modo que dos llamadas producen resultados distintos.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Lectura de contenido web en local: el modelo puede convertir artículos o notas en audio sin salir del dispositivo, con un repositorio de 0,1 GB y sin dependencias de fonemización, lo que simplifica el despliegue en aplicaciones de escritorio.
- Asistentes de voz embebidos: gracias al modo streaming, se puede reproducir cada fragmento de audio conforme se genera, reduciendo la latencia percibida en interfaces conversacionales.
- Audiolibros y boletines automatizados: la selección entre 27 voces permite asignar timbres distintos a secciones o personajes, siempre respetando la licencia de cada grabación de voz.
- Accesibilidad en aplicaciones: integración de la síntesis en lectores de pantalla o herramientas de apoyo para usuarios con discapacidad visual, con la ventaja de que todo el procesamiento ocurre en local.
- Pruebas y prototipado de pipelines TTS: al ser un modelo de 7M parámetros, sirve para validar arquitecturas de generación de audio y flujos de streaming antes de pasar al modelo completo `pocket-tts-loom`.
- Generación de avisos y notificaciones habladas: para sistemas de domótica o monitorización que necesitan mensajes cortos en inglés con bajo coste computacional y sin conexión a servicios externos.
- Investigación en destilación de modelos de voz: permite estudiar el comportamiento de un modelo de flujo sobre latentes Mimi a escala reducida, con pesos en formato GGUF y driver accesible mediante `model.driver_source`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: muy baja; con 7,1M de parámetros, el fichero F32 ocupa del orden de decenas de MB y las versiones cuantizadas menos aún. El repositorio completo pesa 0,1 GB.
- GPU recomendadas: cualquier GPU con soporte para el motor loom.cpp; no se especifican modelos concretos en la documentación.
- Compatibilidad con GPU de consumo: previsiblemente cabe en cualquier GPU de consumo e incluso en CPU, dado el tamaño del modelo, aunque no se aportan cifras oficiales.
- Opciones de despliegue: `loom-py` (paquete `loom-py-rt[hub]>=1.0.0`) sobre el motor loom.cpp. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| pocket-tts-7m-loom (este modelo) | 7,1M | No disponible | Inglés | CC-BY-4.0 | GGUF (loom.cpp) |
| kyutai/pocket-tts (modelo base) | No disponible en la información | No disponible | Inglés | CC-BY-4.0 (heredada) | No disponible |
| loom-ai-org/pocket-tts-loom (modelo completo) | No disponible en la información | No disponible | Inglés | No disponible | GGUF (loom.cpp) |

No se dispone de datos de rendimiento comparativo entre estas variantes; la model card indica únicamente que la versión de 7M sacrifica calidad frente al modelo completo a cambio de tamaño.

## Limitaciones y advertencias

- Se aplican las restricciones de uso de Kyutai: se prohíbe la suplantación o clonación de voces sin consentimiento explícito y lícito, así como presentar el audio generado como grabación genuina de una persona real. Estas restricciones viajan con los pesos.
- Es un modelo destilado: la calidad es inferior a la del modelo completo `pocket-tts-loom`.
- Solo una voz (`alba`) está integrada; las otras 26 son ficheros de voz cuya licencia corresponde a la grabación, no al modelo. Dos voces (`cosette` y `jean`) son CC-BY-NC-4.0, es decir, no comerciales, y tres (`daan`, `juergen`, `rafael`) no tienen licencia declarada por Kyutai.
- La clonación de voz a partir de una grabación requiere el codificador Mimi, que esta exportación no incluye.
- El muestreo es estocástico por defecto (temperatura 0,3), por lo que dos llamadas producen resultados distintos.
- El modelo solo soporta inglés; no se documentan otros idiomas.
- El parámetro `sample_rate` debe pasarse manualmente (24 kHz); una tasa incorrecta no provoca error, sino reproducción a velocidad equivocada.
- No se dispone de información sobre sesgos, tasas de alucinación ni comportamiento en dominios específicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/loom-ai-org/pocket-tts-7m-loom
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Modelo completo exportado: https://huggingface.co/loom-ai-org/pocket-tts-loom
- Repositorio loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Repositorio loom-py: https://github.com/loom-ai-org/loom-py
- Exportador loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Voces de Kyutai: https://huggingface.co/kyutai/tts-voices
