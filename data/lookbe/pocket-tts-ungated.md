# lookbe/pocket-tts-ungated

## Resumen

Pocket TTS es un modelo de sintesis de voz (text-to-speech) ligero, de aproximadamente 100 millones de parametros, disenado por Kyutai para ejecutarse en CPU sin necesidad de GPU ni de APIs externas. La ficha que nos ocupa, `lookbe/pocket-tts-ungated`, es una resubida no oficial del modelo base `kyutai/pocket-tts`, publicada por el usuario lookbe bajo licencia CC-BY-4.0. El repositorio pesa 9,6 GB y esta etiquetado con la libreria `pocket-tts`, el idioma ingles y el articulo arXiv:2509.06926.

El modelo resuelve un problema concreto: generar voz de forma local y con baja latencia (unos 200 ms hasta el primer fragmento de audio), a velocidad superior al tiempo real (aproximadamente 6x en una CPU de MacBook Air M4 usando solo 2 nucleos) y con soporte de clonacion de voz a partir de una muestra de audio. Ademas, acepta entradas de texto de longitud ilimitada y puede ejecutarse en el navegador del cliente.

Su relevancia ahora radica en que permite integrar sintesis de voz en aplicaciones de escritorio, servidores modestos o dispositivos sin GPU dedicada, eliminando la dependencia de servicios web de pago. El nombre "ungated" sugiere que esta copia evita el control de acceso del repositorio original, un detalle relevante para quien evalue su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (modelo de texto a voz; se describe en arXiv:2509.06926) |
| Parametros totales | 100 millones (segun la model card del modelo base) |
| Longitud de contexto | no disponible; la model card indica que acepta texto de longitud ilimitada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles); hay otros idiomas planificados segun el anuncio oficial de Kyutai |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 9,6 GB |
| Libreria | pocket-tts (paquete Python; requiere PyTorch 2.5+) |
| Python soportado | 3.10, 3.11, 3.12, 3.13 y 3.14 |
| Modelo base | kyutai/pocket-tts (finetune/resubida) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-27 |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo. La model card lo describe como una aplicacion de sintesis de voz ligera orientada a CPU, con salida de audio en streaming, latencia de aproximadamente 200 ms hasta el primer fragmento y capacidad de procesar texto potencialmente infinito. El detalle tecnico completo debe consultarse en el articulo arXiv:2509.06926, referenciado en las etiquetas del repositorio, y en el informe tecnico de Kyutai.

Tampoco se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO. Lo que si se documenta es el flujo de clonacion de voz: a partir de una muestra de audio se genera un embedding que puede exportarse a un fichero safetensors mediante el comando `export-voice`, lo que permite cargar voces de forma rapida sin reprocesar el audio original. El audio de entrada condiciona la salida, de modo que la calidad de la muestra se reproduce en la voz generada.

## Capacidades

- Generacion de voz en ingles a partir de texto, con salida de audio en formato PCM como tensor de PyTorch.
- Streaming de audio con latencia de aproximadamente 200 ms hasta el primer fragmento.
- Procesamiento de entradas de texto de longitud ilimitada.
- Clonacion de voz a partir de un fichero WAV propio o de voces del repositorio `kyutai/tts-voices`.
- Catalogo de voces predefinidas: alba, marius, javert, jean, fantine, cosette, eponine y azelma.
- Exportacion de embeddings de voz a safetensors para carga rapida posterior.
- Interfaz de linea de comandos con los comandos `generate`, `serve` y `export-voice`.
- API de Python (`TTSModel.load_model()`, `get_state_for_audio_prompt()`, `generate_audio()`).
- Servidor HTTP local con interfaz web en `http://localhost:8000`.
- Ejecucion en navegador del lado del cliente (implementaciones in-browser).
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada como transcripcion.

## Casos de uso

- Lectura en voz alta de documentos largos: la model card indica que el modelo admite entradas de texto de longitud ilimitada y salida en streaming, por lo que puede narrar articulos, informes o libros sin truncar el contenido.
- Asistentes de voz en local sin GPU: al ejecutarse en CPU con solo 2 nucleos, encaja en servidores pequenos, mini-PCs y equipos de escritorio donde no hay acelerador dedicado, manteniendo la generacion de voz dentro de la infraestructura propia.
- Audiolibros y podcasts con voz sintetica: la clonacion de voz permite mantener un timbre consistente a lo largo de horas de audio, y el comando `serve` evita recargar el modelo en cada peticion.
- Interfaces conversacionales de baja latencia: con unos 200 ms hasta el primer fragmento, es adecuado para menus telefonicos interactivos, kioscos o asistentes donde la respuesta hablada debe empezar casi de inmediato.
- Aplicaciones web con privacidad por diseno: las implementaciones en navegador permiten generar voz en el propio cliente, sin enviar el texto a un servicio externo.
- Pipelines de CI/CD para contenido de audio: los embeddings de voz exportados a safetensors se cargan rapido, lo que facilita la generacion reproducible de muestras de audio en pruebas automatizadas.
- Prototipado y demos de producto: la instalacion via `pip install pocket-tts` o `uvx pocket-tts` permite incorporar voz a un prototipo en pocos minutos sin contratar un proveedor externo.
- Doblaje y localizacion de contenido en ingles: para material cuyo idioma de destino sea el ingles y donde se quiera preservar una voz de referencia mediante clonacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de rendimiento aportados por la model card son operativos:

| Metrica | Valor |
|---|---|
| Latencia hasta el primer fragmento de audio | ~200 ms |
| Velocidad de generacion | ~6x tiempo real en CPU de MacBook Air M4 |
| Nucleos de CPU utilizados | 2 |
| Requisito de GPU | no requiere GPU |

## Requisitos de hardware

- GPU: no es necesaria. El modelo esta disenado para inferencia en CPU y no requiere la version GPU de PyTorch.
- CPU: la model card menciona el uso de 2 nucleos y unos 6x de velocidad respecto al tiempo real en un MacBook Air M4.
- Memoria: la informacion proporcionada no indica requisitos de RAM. Como estimacion aritmetica a partir de los 100 millones de parametros, los pesos ocuparian del orden de 0,2 GB en fp16 y 0,4 GB en fp32, a lo que habria que sumar el estado de voz y los buffers de audio.
- VRAM estimada para inferencia: no aplica si se ejecuta en CPU; si se forzase el uso de GPU, la estimacion derivada del tamano del modelo seria inferior a 1 GB, pero este dato no esta confirmado por el autor.
- GPU recomendadas: no disponible; el modelo no las requiere. Cualquier GPU consumer moderna deberia ser sobradamente suficiente si se opta por ejecucion acelerada.
- Cabria en cualquier GPU consumer: si, segun la estimacion anterior, aunque el caso de uso previsto es CPU.
- Opciones de despliegue: paquete Python `pocket-tts`, CLI (`generate`, `serve`, `export-voice`), servidor HTTP local con interfaz web, e implementaciones en navegador. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: aproximadamente 200 ms hasta el primer fragmento y unas 6 veces el tiempo real en MacBook Air M4.

## Comparativa con modelos similares

| Modelo | Parametros | Ejecucion en CPU | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| lookbe/pocket-tts-ungated | 100M (heredado del base) | si | cc-by-4.0 | en | HuggingFace, resubida no oficial |
| kyutai/pocket-tts | 100M | si | cc-by-4.0 (segun la model card) | en | HuggingFace, repositorio oficial |
| Otras alternativas de TTS ligero | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados en la informacion proporcionada para comparar con alternativas de la misma categoria. La diferencia observable entre las dos primeras filas es el control de acceso: el nombre "ungated" indica que esta copia evita la aceptacion de condiciones previa del repositorio original, sin que se documenten cambios en los pesos.

## Limitaciones y advertencias

- Idioma: solo ingles. La propia model card indica que hay mas idiomas planificados, pero no disponibles en esta version.
- Resubida no oficial: el repositorio pertenece al usuario lookbe y no a Kyutai. No hay garantia de trazabilidad, integridad de los pesos ni mantenimiento.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta.
- Posible desajuste de tamano: el repositorio ocupa 9,6 GB, muy por encima de lo esperable para 100 millones de parametros en fp16 (del orden de 0,2 GB). La informacion disponible no explica que contiene ese volumen adicional, por lo que conviene inspeccionar los ficheros antes de desplegarlo.
- Licencias de las voces: las voces del catalogo y del repositorio `kyutai/tts-voices` tienen licencias propias que hay que revisar por separado de la licencia del modelo.
- Clonacion de voz: implica riesgos de suplantacion y obligaciones legales y eticas; no se documentan mecanismos de consentimiento o marca de agua en la informacion disponible.
- Calidad de la muestra: la model card advierte de que la calidad del audio de referencia se reproduce en la salida, y recomienda limpiar la muestra antes de usarla.
- Artefactos en la sintesis: no se documentan tasas de error de pronunciacion ni evaluaciones subjetivas (MOS) en la informacion disponible.
- Uso comercial: la licencia CC-BY-4.0 permite el uso comercial con atribucion, pero al tratarse de una resubida conviene verificar los terminos del modelo original antes de utilizarlo en produccion.
- Rendimiento declarado: los datos de latencia y velocidad provienen de la model card del modelo base y no de una evaluacion independiente de esta copia.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/lookbe/pocket-tts-ungated
- Modelo base en HuggingFace: https://huggingface.co/kyutai/pocket-tts
- Repositorio GitHub: https://github.com/kyutai-labs/pocket-tts
- Demo oficial: https://kyutai.org/pocket-tts
- Informe tecnico: https://kyutai.org/blog/2026-01-13-pocket-tts
- Articulo: https://arxiv.org/abs/2509.06926
- Documentacion: https://github.com/kyutai-labs/pocket-tts/tree/main/docs
- Documentacion del comando generate: https://github.com/kyutai-labs/pocket-tts/tree/main/docs/generate.md
- Documentacion del comando serve: https://github.com/kyutai-labs/pocket-tts/tree/main/docs/serve.md
- Documentacion del comando export-voice: https://github.com/kyutai-labs/pocket-tts/tree/main/docs/export_voice.md
- Repositorio de voces: https://huggingface.co/kyutai/tts-voices
- Anuncio sobre nuevos idiomas: https://github.com/kyutai-labs/pocket-tts/issues/118
- Cuaderno de ejemplo en Colab: https://colab.research.google.com/github/kyutai-labs/pocket-tts/blob/main/docs/pocket-tts-example.ipynb
- La busqueda web realizada no ha devuelto enlaces relevantes adicionales sobre este modelo.
