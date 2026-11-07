# Austriani/Kitchoon-Final-26B-A4B-RP-GGUF

## Resumen

Kitchoon-Final-26B-A4B-RP-GGUF es una distribucion cuantizada en formato GGUF del modelo Kitchoon-Final-26B-A4B, un modelo de mezcla de expertos (MoE) de 26.000 millones de parametros totales y aproximadamente 4.000 millones de parametros activos por token, desarrollado por SubMaroon y empaquetado para inferencia por Austriani. Segun las etiquetas del autor, el modelo deriva de la familia Gemma y esta afinado especificamente para roleplay, escritura creativa, tematicas oscuras y conversacion sin censura en ingles.

La relevancia de esta publicacion radica en su formato: los pesos se distribuyen como GGUF optimizados para ik_llama.cpp, con cuantizacion mediante imatrix y calibracion V3, lo que permite ejecutar un MoE de 26B en hardware de consumo con una huella de memoria mucho menor que la de los pesos completos. La model card figura marcada como trabajo en progreso ("quants pending"), por lo que la disponibilidad de todas las variantes de cuantizacion puede ser parcial en el momento de la publicacion.

No se dispone de informacion publica sobre la longitud de contexto, el volumen de datos de entrenamiento ni los resultados de benchmarks. La ficha se limita a los datos verificables de la model card y de las etiquetas del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, derivada de la familia Gemma (segun etiqueta `gemma-4`) |
| Parametros totales | 26B |
| Parametros activos | Aproximadamente 4B (sufijo A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix y calibracion V3 (variantes concretas no detalladas en la informacion disponible) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (libreria ik_llama.cpp) |

## Arquitectura y entrenamiento

El modelo base SubMaroon/Kitchoon-Final-26B-A4B es una mezcla de expertos con 26.000 millones de parametros totales y unos 4.000 millones activos por token, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamano. Las etiquetas del repositorio indican que se apoya en la arquitectura de la familia Gemma, aunque no se detalla la configuracion exacta de expertos, el numero de capas ni la estrategia de enrutamiento.

El ajuste fino esta orientado a roleplay, escritura creativa, tematicas oscuras y conversacion sin censura, segun las etiquetas del autor. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas adicionales. La distribucion de Austriani se limita a la conversion y cuantizacion GGUF con imatrix y calibracion V3 para ik_llama.cpp; no se documentan cambios en los pesos respecto al modelo base.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en dialogos multi-turno.
- Roleplay y escritura creativa, incluyendo tematicas oscuras y contenido sin censura declarado por el autor.
- Generacion de ficcion y narrativa extendida.
- Conversacion general y asistencia textual.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Roleplay conversacional: el modelo puede mantener personajes y tramas a lo largo de sesiones multi-turno, gracias a su ajuste especifico para RP y su naturaleza MoE que reduce el coste por token en inferencia local.
- Escritura creativa asistida: util para generar borradores de ficcion, dialogos y escenas narrativas con tono oscuro o adulto, un nicho poco cubierto por modelos alineados de forma agresiva.
- Prototipado de narrativa interactiva: integrable en motores de ficcion interactiva o videojuegos textuales donde se requiere coherencia de personaje y libertad tematica.
- Chat sin filtros en entornos controlados: adecuado para investigacion sobre comportamiento de modelos poco alineados o para evaluacion de riesgos de contenido.
- Despliegue local en estaciones de trabajo: al distribuirse en GGUF para ik_llama.cpp, puede ejecutarse en equipos con GPU de consumo o incluso en CPU con suficiente RAM, sin depender de servicios en la nube.
- Generacion de contenido para comunidades de escritura: asistencia a autores que necesitan explorar temas sensibles o tramas adultas con un modelo que no rechaza peticiones por defecto.
- Experimentacion con cuantizacion imatrix: sirve como caso de estudio para evaluar la perdida de calidad de las cuantizaciones V3 en un MoE de 26B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un MoE de 26B en GGUF Q4 ocupa del orden de 14-16 GB, y en Q8 del orden de 26-28 GB, aunque estas cifras no estan confirmadas por el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, una RTX 4090 (24 GB) deberia poder alojar cuantizaciones de 4-5 bits; para cuantizaciones altas serian necesarias A100 o H100.
- Cabe en GPU de consumo: probablemente en RTX 3090, RTX 4090 y GPUs con 24 GB o mas para cuantizaciones medias; no confirmado por el autor.
- Opciones de despliegue: ik_llama.cpp es la libreria declarada. La compatibilidad con llama.cpp estandar, Ollama o vLLM no esta confirmada en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kitchoon-Final-26B-A4B-RP-GGUF | 26B totales / ~4B activos | no disponible | Apache 2.0 | GGUF (ik_llama.cpp) | Ajuste para roleplay sin censura, solo ingles |
| SubMaroon/Kitchoon-Final-26B-A4B | 26B totales / ~4B activos | no disponible | Apache 2.0 | safetensors (presumiblemente) | Modelo base sin cuantizar del que deriva esta ficha |
| mradermacher/Kitchoon-26B-A4B-GGUF | 26B totales / ~4B activos | no disponible | Apache 2.0 | GGUF | Cuantizacion alternativa del mismo modelo base por otro autor |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a otros modelos de la misma categoria.

## Limitaciones y advertencias

- Modelo declarado como "uncensored": puede generar contenido adulto, violento o sensible sin los filtros habituales de los modelos alineados; requiere supervision en produccion.
- Entrenado y etiquetado unicamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad.
- No hay informacion sobre sesgos conocidos, pero al derivar de la familia Gemma y de un ajuste fino de roleplay, es previsible que herede sesgos del corpus base y del dataset de ajuste.
- La model card esta marcada como trabajo en progreso, con cuantizaciones pendientes; algunas variantes pueden no estar disponibles o cambiar.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo sin censura puede chocar con normativas de contenido y politicas de plataforma; conviene revisar los terminos del modelo base.
- No se documenta la longitud de contexto, lo que impide planificar casos de uso que requieran ventanas largas.
- La dependencia de ik_llama.cpp limita la portabilidad frente a ecosistemas mas extendidos como llama.cpp u Ollama.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Austriani/Kitchoon-Final-26B-A4B-RP-GGUF
- Modelo base: https://huggingface.co/SubMaroon/Kitchoon-Final-26B-A4B
- Cuantizacion alternativa de mradermacher: https://huggingface.co/mradermacher/Kitchoon-26B-A4B-GGUF
