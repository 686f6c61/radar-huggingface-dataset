# P2Enjoy/omniASR-CTC-300M-transformers

## Resumen

omniASR-CTC-300M-transformers es un reempaquetado de los pesos del modelo facebook/omniASR-CTC-300M de Meta AI, convertidos al formato nativo de la libreria transformers para poder cargarse mediante `AutoModelForCTC`. El responsable de este repositorio es el usuario P2Enjoy, que no ha entrenado ni modificado los pesos: segun la propia model card, cada tensor se mantiene identico al punto de control original y solo cambian los nombres de las claves. Se trata, por tanto, de una publicacion de conveniencia para facilitar el uso del modelo de reconocimiento automatico del habla (ASR) de Meta con el ecosistema estandar de HuggingFace.

El modelo pertenece a la familia Omnilingual ASR de Meta AI y sigue una arquitectura tipo wav2vec2 con cabecera CTC (Connectionist Temporal Classification), con un total de 325.496.020 parametros segun los pesos en safetensors. El repositorio ocupa 1.3 GB, coherente con pesos almacenados en precision de 32 bits. La licencia declarada es Apache 2.0, heredada del modelo original.

Su relevancia es practica: quien quiera usar Omnilingual ASR dentro de un pipeline estandar de transformers (por ejemplo, con `Wav2Vec2ForCTC`) puede hacerlo sin escribir codigo de carga especifico, aunque debe tener en cuenta que este repositorio tiene cero descargas y cero likes, no esta validado por la comunidad y depende por completo de la fidelidad de la conversion. No se dispone de informacion sobre rendimiento, idiomas concretos ni datos de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 con cabecera CTC (tag `wav2vec2`, formato `Wav2Vec2ForCTC`) |
| Parametros totales | 325.496.020 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio; no se especifica la ventana de entrada) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en safetensors, 1.3 GB, compatible con fp32) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura wav2vec2 orientada a reconocimiento automatico del habla con decodificacion CTC. La model card indica que el punto de entrada es la clase `Wav2Vec2ForCTC` de transformers, y que la conversion se ha realizado con el script `ASR/outils/convertir_omniasr.py` del monorepo "Liaison Vocale". Los pesos proceden del fichero `omniASR-CTC-300M.pt` de `facebook/omniASR-CTC-300M`, con su sha256 registrado en `PROVENANCE.json`. La estructura (configuracion, vocabulario y preprocesado) proviene del repositorio `ilhanemirhan/omniASR_CTC_300M` en una revision fijada, aunque los pesos de ese repositorio (redondeados a bf16) no se han reutilizado.

No se ha realizado ningun entrenamiento adicional ni ajuste fino por parte del autor de este repositorio: se trata exclusivamente de una conversion de nombres de tensores. La model card menciona que existe un tensor de entrenamiento (`masked_spec_embed`, asociado al enmascaramiento SpecAugment) que no aparece en el punto de control oficial y que se incorpora desde la estructura; este tensor no se utiliza en inferencia. No se dispone de informacion sobre el numero de tokens de audio, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original de Meta.

Un detalle operativo relevante documentado por el autor: el token en blanco de CTC es el indice 0 (`<s>`, que corresponde a `config.pad_token_id`) y el separador de palabras que realmente emite el modelo es el espacio (indice 4), no el caracter `|`.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto mediante decodificacion CTC.
- Carga directa en transformers a traves de `AutoModelForCTC` y `Wav2Vec2ForCTC`, sin necesidad de codigo de conversion propio.
- Compatibilidad declarada con endpoints de HuggingFace (tag `endpoints_compatible`).
- Capacidad multilingue: el modelo base pertenece a la familia "Omnilingual ASR" de Meta, aunque la lista concreta de idiomas no se detalla en la informacion disponible.
- No se documenta soporte de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision, audio generativo ni modo de pensamiento.

## Casos de uso

- Transcripcion de reuniones y notas de voz: el modelo puede convertir audio en texto dentro de un pipeline de transformers, integrándose con `AutoModelForCTC` y un decodificador CTC estandar para generar transcripciones de forma automatica.
- Subtitulado de contenido audiovisual: dado que es un modelo acustico ligero (325M parametros), puede ejecutarse por lotes sobre ficheros de audio para generar subtitulos, siempre que el idioma objetivo este cubierto por el vocabulario del modelo base.
- Indexacion y busqueda sobre archivos de audio: transcribir grandes volumenes de grabaciones para permitir busqueda textual posterior, aprovechando que el modelo cabe en GPUs de consumo.
- Preprocesado en pipelines de voz a texto para asistentes: usar el modelo como primer componente acustico, alimentando el texto a un modelo de lenguaje posterior para tareas de comprension.
- Analisis de llamadas de atencion al cliente: transcripcion de conversaciones grabadas para su posterior analisis y clasificacion, con la advertencia de que no hay datos publicados sobre su precision en dominios concretos.
- Investigacion en ASR multilingue: servir como punto de partida reproducible para comparar variantes de decodificacion CTC o para experimentar con tecnicas de adaptacion, dado que los pesos son los originales de Meta sin modificar.
- Despliegue en entornos con recursos limitados: por su tamano, puede ejecutarse en infraestructura modesta de inferencia sin necesidad de clústeres multi-GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 1.3 GB en safetensors, lo que corresponde a pesos en fp32; en fp32 la huella de pesos ronda 1.3 GB y en fp16/bf16 aproximadamente la mitad, mas el coste de activaciones y buffers de audio.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM deberia ser suficiente para fp32; GPU de datacenter (A100, H100) permiten lotes grandes y mayor throughput.
- Cabe en GPU de consumo: si, es previsible que funcione en tarjetas como RTX 3060, RTX 4090 o similares con 8 GB o mas, al tratarse de un modelo de 325M parametros.
- Opciones de despliegue: transformers con `AutoModelForCTC` / `Wav2Vec2ForCTC` (uso principal declarado). No se mencionan en la informacion proporcionada integraciones con vLLM, llama.cpp, Ollama o TGI, y el formato safetensors no es directamente compatible con llama.cpp sin conversion a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| P2Enjoy/omniASR-CTC-300M-transformers | 325,5 M | Wav2Vec2 + CTC | no disponible | apache-2.0 | HuggingFace (0 descargas) |
| facebook/omniASR-CTC-300M | no disponible | ASR CTC (Omnilingual ASR) | no disponible | apache-2.0 | Repositorio de Meta (segun model card) |
| facebook/wav2vec2-large-960h | ~317 M | Wav2Vec2 + CTC (ingles) | no disponible | apache-2.0 | HuggingFace |
| facebook/mms-300m | ~300 M | Wav2Vec2 + CTC multilingue | no disponible | apache-2.0 | HuggingFace |

Nota: los valores de la comparativa se limitan a datos ampliamente conocidos de cada modelo; no se dispone de comparaciones de rendimiento entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Repositorio no validado: cero descargas y cero likes, publicado por un usuario individual, sin garantia de mantenimiento ni de fidelidad de la conversion mas alla de lo declarado en la model card.
- Dependencia total del modelo base: cualquier limitacion de `facebook/omniASR-CTC-300M` (idiomas cubiertos, precision, sesgos acusticos) se hereda sin cambios.
- Idiomas soportados no especificados: aunque la familia se denomina "Omnilingual", no se detalla la lista de idiomas disponibles, por lo que no se puede garantizar cobertura para un idioma concreto.
- Riesgo de errores de transcripcion: como todo modelo ASR, puede producir sustituciones, omisiones e inserciones, especialmente en audio con ruido, acentos marcados o solapamiento de hablantes.
- Particularidades del tokenizador CTC: el token en blanco es el indice 0 y el separador de palabras es el espacio (indice 4), no `|`; un decodificador mal configurado producira transcripciones incorrectas.
- Sin datos de benchmarks: no hay evidencia publicada en la informacion disponible sobre WER u otras metricas, lo que dificulta evaluar su idoneidad en produccion.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion; el repositorio declara heredar la licencia del modelo original de Meta.
- Fechas del repositorio: la informacion indica creacion y actualizacion en octubre de 2026, lo que conviene verificar directamente en HuggingFace.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/P2Enjoy/omniASR-CTC-300M-transformers
- Modelo base: https://huggingface.co/facebook/omniASR-CTC-300M
- Repositorio de codigo de Omnilingual ASR (Meta AI): https://github.com/facebookresearch/omnilingual-asr
- Repositorio de estructura utilizada para la conversion: https://huggingface.co/ilhanemirhan/omniASR_CTC_300M
- Script de conversion citado: `ASR/outils/convertir_omniasr.py` del monorepo Liaison Vocale (no se proporciona URL en la informacion disponible)
