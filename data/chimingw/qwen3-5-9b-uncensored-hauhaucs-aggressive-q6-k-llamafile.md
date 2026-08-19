# chimingw/qwen3.5-9b-uncensored-hauhaucs-aggressive-q6-k-llamafile

## Resumen

Este repositorio contiene un paquete llamafile autocontenido que integra el modelo Qwen3.5-9B en su versión sin censura "HauhauCS-Aggressive", cuantizado en Q6_K, junto con un proyector de visión en BF16 y el runtime llamafile 0.10.5. El empaquetado lo realiza el usuario chimingw de forma no oficial, a partir del modelo base de HauhauCS, que afirma haber eliminado todos los rechazos (0/465 refusals) sin pérdida de capacidades. El resultado es un único ejecutable que permite desplegar un asistente multimodal local con interfaz de chat en terminal, navegador y una API compatible con OpenAI, sin necesidad de instalar un runtime adicional.

La relevancia de este paquete radica en su portabilidad: al ser un único archivo de 8,6 GB, puede ejecutarse directamente en macOS o Linux desde un USB, lo que facilita el uso de un LLM sin censura en entornos aislados o sin conexión. El modelo base es un Qwen3.5 de 9B parámetros, con soporte multimodal para entrada de imágenes mediante el proyector BF16, y admite inglés, chino y otros idiomas. El contexto por defecto se fija en 8.192 tokens, aunque puede ampliarse con el parámetro `--ctx-size`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de la familia Qwen3.5 9B, presumiblemente transformer multimodal, sin confirmar) |
| Parametros totales | 9B (segun el nombre del modelo, no confirmado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens por defecto en el paquete; el modelo upstream anuncia un contexto nativo mayor no especificado |
| Tipos de cuantizacion | Q6_K (GGUF) para el modelo principal; proyector de vision en BF16 |
| Idiomas soportados | en, zh, multilingual |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q6_K) + mmproj BF16, empaquetados en un ejecutable llamafile |

## Arquitectura y entrenamiento

No se proporcionan detalles tecnicos sobre la arquitectura interna del modelo base. Se trata de un Qwen3.5 de 9B parametros, presumiblemente un transformer multimodal con un proyector de vision para procesar imagenes, pero la informacion disponible no confirma la estructura exacta (numero de capas, atencion, etc.). El paquete no introduce cambios arquitectonicos: es una re-cuantizacion del GGUF original sin reentrenamiento, fusion ni re-cuantizacion adicional.

El proceso de entrenamiento del modelo "uncensored" tampoco esta documentado en la informacion proporcionada. El autor upstream, HauhauCS, afirma que el modelo es "totalmente sin censura con cero perdida de capacidades" y que no se modificaron datasets ni capacidades, solo se eliminaron los rechazos. No se menciona si se uso fine-tuning, edicion de pesos u otra tecnica. Tampoco hay datos sobre el dataset de entrenamiento, numero de tokens, ni uso de RLHF o DPO.

## Capacidades

- Generacion de texto y chat conversacional en multiples idiomas (ingles, chino y otros).
- Entrada multimodal de imagenes gracias al proyector de vision BF16 integrado, aunque el soporte depende del cliente o interfaz que use el runtime.
- Interfaz de chat en terminal y en navegador web (http://127.0.0.1:8080/).
- API local compatible con OpenAI bajo `/v1`, que permite integrar el modelo en aplicaciones propias.
- Sin censura: segun el autor del modelo base, el modelo no rechaza ninguna instruccion (0/465 refusals), aunque esta afirmacion no ha sido validada de forma independiente.
- Soporte de plantillas de chat Jinja y configuracion de muestreo personalizable (temperatura 0.6, top-p 0.95, top-k 20).
- No se confirma soporte explicito de tool calling, function calling o capacidades de agente, aunque la API OpenAI-compatible podria permitirlo si el modelo las soporta nativamente (no verificado).

## Casos de uso

- Despliegue local sin instalacion: ideal para ejecutar un LLM multimodal en equipos macOS o Linux donde no se desea instalar un runtime pesado. Basta con copiar el ejecutable a un USB y lanzarlo.
- Chat privado sin censura: para investigacion o uso personal donde se requiera explorar temas que otros modelos rechazan, siempre que se asuman los riesgos eticos y legales.
- Prototipado rapido de aplicaciones: la API compatible con OpenAI permite conectar el modelo a scripts, frameworks o herramientas existentes con un simple `curl` o cliente HTTP.
- Procesamiento de imagenes en local: gracias al proyector BF16, se pueden enviar imagenes al modelo para descripcion o analisis, sin depender de servicios en la nube.
- Entornos aislados o sin conexion: adecuado para redes sin internet o para cumplir requisitos de privacidad donde los datos no deben salir del equipo.
- Educacion y demostraciones: permite mostrar el funcionamiento de un LLM multimodal en talleres o clases, con una instalacion trivial y sin coste de API.
- Automatizacion de tareas de texto: mediante la API local, se pueden generar resumenes, clasificaciones o respuestas automaticas en aplicaciones de linea de comandos o servicios internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas para este empaquetado ni para el modelo base.

## Requisitos de hardware

- El paquete requiere una plataforma de 64 bits compatible con macOS o Linux. No se soporta ejecucion directa en Windows porque el archivo supera los 4 GiB.
- El ejecutable completo ocupa 8,63 GB (8,04 GiB), pero la memoria necesaria en tiempo de ejecucion es mayor: el modelo GGUF Q6_K pesa 7,36 GB y el proyector BF16 0,92 GB, mas el overhead del runtime y la cache KV.
- La etiqueta "apple-silicon" y "metal" sugieren optimizacion para GPU de Apple Silicon, aunque no se especifican requisitos minimos de RAM.
- Para un contexto de 8.192 tokens por defecto, se estima que se necesitan al menos 10-12 GB de RAM libre, aunque este dato no esta confirmado.
- Ampliar el contexto con `--ctx-size` (por ejemplo, 32.768) aumentara notablemente el consumo de memoria.
- No se proporcionan datos de latencia ni throughput. Se recomienda probar en el hardware objetivo.
- Opciones de despliegue: el propio llamafile incluye el runtime, por lo que no se requiere vLLM, Ollama ni TGI. Tambien se puede usar el ejecutable como servidor API.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la informacion proporcionada. Este paquete es una distribucion especifica de un modelo Qwen3.5 9B cuantizado, por lo que su comparativa natural seria con otros Qwen3.5 9B en diferentes cuantizaciones o con otros LLMs de tamano similar, pero no se ofrecen metricas ni referencias para establecer una tabla comparativa.

## Limitaciones y advertencias

- Empaquetado no oficial: no es una version del modelo mantenida por los autores originales de Qwen3.5, sino una redistribucion de terceros.
- Las afirmaciones de "sin censura" y "0/465 refusals" provienen del autor del modelo base y no han sido reproducidas ni validadas de forma independiente.
- Riesgo de alucinaciones y sesgos: al ser un modelo sin censura, puede generar contenido inapropiado, ofensivo o factualmente incorrecto. No se han realizado evaluaciones de seguridad.
- El contexto por defecto es conservador (8.192 tokens). Ampliarlo puede provocar fallos de memoria o degradacion del rendimiento.
- El servidor localhost no debe exponerse publicamente sin autenticacion, TLS y controles de red adecuados, ya que el modelo puede ser utilizado por terceros.
- No se garantiza el soporte de tool calling, function calling ni capacidades de agente, aunque la API OpenAI-compatible podria permitirlo.
- El modelo esta pensado para macOS y Linux; en Windows no se puede ejecutar directamente el archivo llamafile por su tamano.
- La licencia Apache-2.0 permite uso comercial, pero el contenido generado por un modelo "uncensored" puede incurrir en responsabilidades legales segun el contexto de uso.

## Enlaces

- Repositorio del paquete: https://huggingface.co/chimingw/qwen3.5-9b-uncensored-hauhaucs-aggressive-q6-k-llamafile
- Modelo base (GGUF original): https://huggingface.co/HauhauCS/Qwen3.5-9B-Uncensored-HauhauCS-Aggressive
- Runtime llamafile: https://github.com/Mozilla-Ocho/llamafile
