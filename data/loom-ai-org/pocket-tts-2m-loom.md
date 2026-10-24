# loom-ai-org/pocket-tts-2m-loom

## Resumen

`loom-ai-org/pocket-tts-2m-loom` es la exportación a GGUF del modelo de síntesis de voz Pocket TTS de Kyutai en su variante destilada de 2 millones de parámetros (2.054.461 exactos), ajustada con reward fine-tuning y publicada en octubre de 2026. No es un modelo de lenguaje general: es un sistema texto-a-voz completo que codifica el texto él mismo (sin fonemizador externo) y genera latentes del codec Mimi, que un decodificador convierte en audio a 24 kHz. La exportación la firma `loom-ai-org` para su runtime `loom.cpp`/`loom-py-rt`.

El interés técnico está en el formato y en el tamaño. Todo el modelo cabe en un único fichero GGUF autodescriptivo que transporta sus propias topologías de grafo, su tokenizer y el script de driver con todos los argumentos de inferencia documentados. Con unos 8 MB de pesos en F32, es un candidato claro a TTS embebido, en CPU o en GPUs de gama muy baja, sin dependencias de phoning ni de codec externo en el pipeline de decodificación.

Sus dos contrapartidas son explícitas en la model card: es una destilación que sacrifica calidad frente al modelo completo, y solo trae una voz incorporada (`alba`), con otras 26 voces empaquetadas como ficheros de estado separados, cada una con su propia licencia de grabación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje de flujo (*flow language model*) sobre latentes del codec Mimi, 0,9 M de parametros, mas decodificador de 1,0 M de parametros |
| Parametros totales | 2.054.461 (2 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F32 y al menos una version cuantizada; el README indica "dos precisiones" pero no detalla el listado completo de ficheros |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `cc-by-4.0`, heredada del modelo base, sujeta a las restricciones de uso de Kyutai |
| Formato de pesos | GGUF autodescriptivo (grafo, tokenizer y driver embebidos), generado con `loom-exporter` |
| Frecuencia de muestreo de audio | 24.000 Hz (se pasa explicitamente a la API; el GGUF puede no declararla) |
| Voces incorporadas | 1 (`alba`); otras 26 disponibles como ficheros de voz en `voices/` |
| Libreria de inferencia | `loom-py-rt` (PyPI), version 1.0.0rc19 o superior para normalizacion de texto exacta |

## Arquitectura y entrenamiento

La arquitectura es una pila de dos componentes: un modelo de lenguaje de flujo de 0,9 M de parámetros que opera sobre latentes del codec neuronal Mimi y un decodificador de 1,0 M de parámetros que reconstruye la forma de onda. El modelo incluye su propio front end de texto, de modo que codifica el texto directamente y no necesita fonemizador; internamente aplica reglas de normalización tomadas de la referencia (`replace_characters` y la regla v4 del punto decimal entre números, introducida en `loom-py-rt` 1.0.0rc19). El resultado se muestrea a 24 kHz.

El checkpoint procede de `kyutai/pocket-tts`: es la destilación de 2 M de Kyutai, con *reward fine-tuning*, publicada en la versión de octubre de 2026. La exportación F32 conserva los parámetros sin modificar en el formato GGUF de `loom.cpp`; el resto de ficheros se cuantizan a partir de ella. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni detalles del esquema de RLHF/DPO más allá de la mención al reward fine-tuning.

La innovación relevante no está en el algoritmo sino en el empaquetado: un solo GGUF que se describe a sí mismo, con topologías de grafo, tokenizer, driver y hasta el estado de las voces (cada fichero de voz lleva una huella de los pesos y es rechazado por otros tamaños de Pocket TTS, y viceversa).

## Capacidades

- Sintesis de voz texto-a-audio en ingles a partir de texto plano, con audio a 24 kHz.
- Codificacion de texto integrada: no requiere fonemizador ni preprocesado linguistico externo.
- Voz incorporada por defecto (`alba`), utilizable sin configuracion adicional.
- Seleccion de voz por nombre (`voice="marius"`), con descarga automatica del fichero de voz desde el repositorio la primera vez.
- Carga de ficheros de voz propios mediante ruta (`voice=` acepta una ruta a un fichero de voz compatible con estos pesos).
- Generacion con muestreo estocastico por defecto a temperatura 0,3, con argumento `seed` para reproducibilidad.
- Acceso al driver embebido mediante `model.infer(...)` para parámetros no expuestos por la API de alto nivel, y volcado del driver con `model.driver_source`.
- Inspeccion del tokenizer y del catalogo de voces desde la API (`model.tokenizer`, `model.voices`).
- No soporta clonacion de voz: requiere el codificador Mimi, que esta exportacion no incluye.
- No dispone de tool calling, agentes, vision ni audio de entrada; son capacidades fuera del alcance de un modelo TTS.

## Casos de uso

- **Lectura de notificaciones y alertas en aplicaciones de escritorio**: con ~8 MB de pesos en F32 y ejecucion en CPU, el modelo puede sintetizar mensajes cortos en local sin enviar texto a un servicio externo ni depender de conectividad.
- **Sistemas embebidos y dispositivos con recursos limitados**: el tamano (2 M de parametros) y el formato GGUF unico permiten incluirlo en imagenes de dispositivo o contenedores minimos donde un TTS basado en transformer grande no cabria.
- **Generacion de audiolibros o podcasts de prototipo en ingles**: la API acepta texto largo y devuelve un objeto de audio guardable como WAV; util para validar un producto de audio antes de invertir en el modelo completo de Kyutai.
- **Accesibilidad en interfaces web y CLI**: sintesis de respuestas y mensajes de estado para lectores de pantalla o asistentes de terminal, con la ventaja de que el texto no sale del equipo.
- **Doblaje y locucion de pruebas A/B**: las 26 voces adicionales (licencias aparte) permiten comparar timbres y estilos en maquetas de video o demos de producto sin contratar grabaciones.
- **Testing automatizado de pipelines de audio**: al admitir `seed`, se pueden generar locuciones reproducibles para pruebas de regresion de un sistema de reconocimiento de voz o de un pipeline de procesamiento de audio.
- **Sustitucion de servicios TTS en prototipos con requisitos de privacidad**: la inferencia local elimina la exposicion del texto a terceros, algo relevante en entornos sanitarios o legales durante fases de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MOS, CMOS, tasas de error de pronunciacion ni comparaciones objetivas con el modelo completo, y los resultados de busqueda web obtenidos no contienen material tecnico sobre este modelo (corresponden a la herramienta de grabacion de pantalla Loom y a una marca de ropa homonima).

## Requisitos de hardware

- **VRAM estimada para inferencia**: el fichero F32 ocupa aproximadamente 8,2 MB solo en pesos (2.054.461 parametros x 4 bytes), mas el estado del decodificador y los buffers de audio; las versiones cuantizadas reducen esa cifra por debajo de los 8 MB. Cálculo derivado del recuento de parametros, no publicado por el autor.
- **GPU recomendadas**: cualquier GPU con al menos unos pocos cientos de MB libres es suficiente; no se documentan requisitos minimos oficiales. Una RTX 4090 o una A100 estan sobradamente dimensionadas y el cuello de botella sera el lanzamiento de kernels, no la memoria.
- **GPU de consumo**: si, cabe en cualquier GPU de consumo, incluida una GTX 1050 o una iGPU con memoria compartida. Tambien es viable en CPU pura.
- **Opciones de despliegue**: `loom-py-rt` (instalacion via `pip install -U "loom-py-rt[hub]"`, con `loom.Model.from_pretrained`) y el motor `loom.cpp`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el formato GGUF es propio de loom.cpp y no generico.
- **Latencia y throughput**: no disponibles. No se publican cifras de tiempo real (RTF) ni de velocidad de sintesis para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| `loom-ai-org/pocket-tts-2m-loom` | 2.054.461 | no disponible | en | cc-by-4.0 + restricciones Kyutai | GGUF (loom.cpp) | Destilado con reward fine-tuning; 1 voz incorporada + 26 ficheros de voz |
| `kyutai/pocket-tts` (modelo base) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible | Modelo de referencia del que se exporta y destila |
| `loom-ai-org/pocket-tts-loom` | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | GGUF (loom.cpp) | Exportacion del modelo completo; mayor calidad a costa de tamano, segun la model card |
| Otras variantes de Pocket TTS de Kyutai | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible | Sus ficheros de voz son incompatibles con esta exportacion y viceversa |

No se dispone de datos de rendimiento comparado entre estas variantes; la unica afirmacion de la model card es cualitativa: la version de 2 M "sacrifica calidad por tamano" frente al modelo completo.

## Limitaciones y advertencias

- **Modelo destilado**: es la destilacion de 2 M de Pocket TTS con reward fine-tuning; la propia model card advierte de que intercambia calidad por tamano frente a `pocket-tts-loom`.
- **Solo ingles**: la etiqueta de idioma es `en`; no se documenta soporte multilingue. La voz `daan` es de un hablante neerlandes (CML-TTS), lo que no implica soporte del idioma.
- **Restricciones de uso de Kyutai**: la publicacion original prohibe, entre otras cosas, la suplantacion o clonacion de voces sin consentimiento explicito y licito, y presentar el audio generado como grabacion genuina de una persona real. Estas restricciones acompanan a los pesos.
- **Licencias de las voces no equivalen a la del modelo**: dos voces (`cosette`, `jean`) son CC-BY-NC-4.0, es decir, no comerciales; tres (`daan`, `juergen`, `rafael`) no tienen licencia declarada por Kyutai. Usar una voz concreta en produccion exige revisar la licencia de su grabacion, no solo la del modelo.
- **Sin clonacion de voz**: requiere el codificador Mimi, ausente en esta exportacion.
- **Dependencia estricta de version**: con `loom-py-rt` anterior a 1.0.0rc19 el modelo carga y habla, pero normaliza de forma distinta guiones, comillas tipograficas y el punto entre dos numeros.
- **Frecuencia de muestreo manual**: si no se pasa `sample_rate=24000` y el GGUF no la declara, la reproduccion no falla pero suena a velocidad incorrecta.
- **Salida no determinista por defecto**: el muestreo a temperatura 0,3 hace que dos llamadas difieran; hay que fijar `seed` para reproducir un resultado.
- **Riesgo de alucinacion en sentido estricto no aplica** (no genera texto), pero si puede producir pronunciaciones erroneas o prosodia degradada en textos con numeros, siglas o puntuacion atipica.
- **Madurez**: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia; no hay evidencia de uso en produccion ni pruebas de terceros.
- **Sin datos de calidad objetiva**: no hay MOS ni comparativas publicadas que permitan estimar la degradacion real frente al modelo completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/loom-ai-org/pocket-tts-2m-loom
- Modelo base: https://huggingface.co/kyutai/pocket-tts
- Exportacion del modelo completo: https://huggingface.co/loom-ai-org/pocket-tts-loom
- Motor de inferencia loom.cpp: https://github.com/loom-ai-org/loom.cpp
- Exportador loom-exporter: https://github.com/loom-ai-org/loom-exporter
- Runtime y API loom-py: https://github.com/loom-ai-org/loom-py
- Dataset de voces de Kyutai (licencias por grabacion): https://huggingface.co/kyutai/tts-voices

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces anteriores proceden de la model card y de la informacion del repositorio.
