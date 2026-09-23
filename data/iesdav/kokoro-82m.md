# iesdav/Kokoro-82M

## Resumen

Kokoro-82M es un modelo de síntesis de voz (text-to-speech) de pesos abiertos con 82 millones de parametros, publicado originalmente por el usuario hexgrad el 27 de enero de 2025 y redistribuido en el repositorio iesdav/Kokoro-82M. Su objetivo es ofrecer una calidad de voz equiparable a la de modelos mucho mayores con un coste computacional y economico muy inferior, lo que lo hace apto tanto para proyectos personales como para despliegues en produccion. Emplea la arquitectura StyleTTS 2 con vocoder ISTFTNet, en configuracion decoder-only (sin difusion y sin liberacion de encoder).

El modelo genera audio a 24 kHz a partir de texto, usando etiquetas de fonemas en IPA obtenidas mediante la libreria G2P misaki. Fue entrenado exclusivamente con audio permisivo o no sujeto a derechos de autor (dominio publico, licencias Apache/MIT y audio sintetico de proveedores cerrados), con un coste declarado de aproximadamente 1000 dolares en 1000 horas de GPU A100 de 80 GB repartidas entre las versiones v0.19 y v1.0.

Su relevancia actual radica en la combinacion de licencia Apache 2.0, tamano reducido y precio de servicio en la nube inferior a 1 dolar por millon de caracteres de entrada (menos de 0,06 dolares por hora de audio generado). El repositorio concreto analizado aqui (iesdav/Kokoro-82M) es una copia sin descargas ni interacciones registradas, y su model card remite al repositorio y al codigo del autor original, por lo que conviene tratar el artefacto como una redistribucion no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS 2 (arXiv:2306.07691) con vocoder ISTFTNet (arXiv:2203.02395); decoder-only, sin difusion y sin encoder liberado |
| Parametros totales | 82 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplicable: modelo TTS que procesa texto por fragmentos, no mantiene contexto conversacional |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | El repositorio iesdav declara unicamente `en` (ingles). La model card del proyecto original indica "Multiple" y, para v1.0, 8 idiomas y 54 voces segun VOICES.md |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible en la informacion proporcionada (tamano del repositorio: 0,4 GB) |
| Frecuencia de muestreo de salida | 24 kHz (segun el ejemplo de uso de la model card) |
| Hash SHA256 del modelo | `496dba118d1a58f5f3db2efc88dbdc216e0483fc89fe6e47ee1f2c53f18ad1e4` |

## Arquitectura y entrenamiento

La arquitectura procede de StyleTTS 2, disenada por Li et al. (repositorio yl4579/StyleTTS2, que es el modelo base declarado para este repositorio, en su variante LJSpeech), combinada con el vocoder ISTFTNet. La distribucion publicada es unicamente el decodificador: no se libera el encoder ni se emplean modulos de difusion, lo que reduce el coste de inferencia y el tamano del artefacto. La entrada de texto se convierte primero a fonemas IPA mediante la libreria misaki, y el modelo sintetiza la forma de onda a 24 kHz.

En cuanto a los datos, Kokoro se entreno exclusivamente con audio permisivo o libre de derechos: audio de dominio publico, audio bajo licencias Apache o MIT, y audio sintetico generado por modelos TTS cerrados de grandes proveedores (se excluye explicitamente audio sintetico de modelos TTS abiertos y clones de voz personalizados). El conjunto total asciende a unos pocos cientos de horas de audio junto con etiquetas de fonemas IPA. La model card desglosa el coste en 500 horas de A100 80 GB para v0.19 (a 0,80 $/h) y 500 horas para v1.0 (a 1,20 $/h), con un total aproximado de 1000 dolares. Se documenta el uso de dos conjuntos con licencia CC BY: Koniwa (`tnc`, menos de 1 hora, CC BY 3.0) y SIWIS (menos de 11 horas, CC BY 4.0), ambos incorporados al conjunto de entrenamiento a partir de v0.19 (22 de noviembre de 2024). No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion por preferencias.

## Capacidades

- Sintesis de voz (text-to-speech) en ingles a partir de texto plano, con salida de audio a 24 kHz.
- Soporte de multiples voces en la version 1.0 del proyecto original: la tabla de releases indica 8 idiomas y 54 voces en v1.0, frente a 1 idioma y 10 voces en v0.19 (el repositorio redistribuido declara solo ingles).
- Control de estilo y prosodia heredado de la arquitectura StyleTTS 2.
- Conversion de texto a fonemas IPA mediante misaki, con espeak-ng como dependencia del sistema para el pipeline.
- Generacion por fragmentos con salida incremental (el ejemplo oficial devuelve tuplas de grafemas, fonemas y audio por iteracion), adecuada para streaming.
- Integracion sencilla via paquete Python `kokoro` (>=0.9.2) y `soundfile`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni entrada multimodal: es exclusivamente un modelo de sintesis de voz.

## Casos de uso

- Audiolibros y narracion automatica: el modelo convierte texto largo en audio con multiples voces, y su coste por caracter permite procesar libros completos a un precio marginal muy bajo (menos de 1 $ por millon de caracteres de entrada).
- Accesibilidad y lectura de pantalla: integracion en aplicaciones de lectores de pantalla o asistentes de accesibilidad para convertir documentos, articulos y correos en audio, con inferencia viable incluso en CPU.
- Sistemas de atencion al cliente y IVR: generacion de respuestas habladas en tiempo real dentro de un pipeline ASR + LLM + TTS, con varias voces para segmentar interlocutores o idiomas.
- Doblaje y localizacion de contenido audiovisual en ingles: sintesis de pistas de voz para videos, cursos o material formativo, sustituyendo grabaciones de estudio cuando no se requiere una voz humana especifica.
- Agentes conversacionales por voz: encadenamiento con un modelo de lenguaje y un modulo de reconocimiento de voz para construir asistentes de voz completos, gracias a la generacion incremental por fragmentos.
- Notificaciones y avisos hablados: generacion dinamica de mensajes de voz en sistemas de monitorizacion, domotica o logistica, donde el contenido cambia con frecuencia y no es viable pregraba.
- Contenido para podcast y redes: produccion de locuciones sinteticas para resumenes de noticias, boletines o piezas cortas, con coste por hora de audio inferior a 0,06 dolares segun los precios de API citados en la model card.
- Prototipado rapido y pruebas de producto: al ser un modelo de 82 M de parametros con licencia Apache 2.0, permite validar flujos de voz en local antes de contratar un servicio gestionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la participacion de Kokoro en el TTS Spaces Arena y remite al archivo EVAL.md para evaluaciones, pero no incluye cifras concretas (MOS, WER de fonemas ni comparativas numericas). La busqueda web realizada no devolvio resultados relacionados con el modelo: las entradas recuperadas corresponden al portal inmobiliario Zillow y no guardan ninguna relacion con el ambito tecnico de esta ficha.

Unicos datos de rendimiento y coste disponibles (procedentes de la model card):

| Metrica | Valor |
|---|---|
| Coste de API citado | Menos de 1 $ por millon de caracteres de entrada |
| Coste de API citado (por audio) | Menos de 0,06 $ por hora de audio generado |
| Equivalencia aproximada | 1000 caracteres de entrada ≈ 1 minuto de audio de salida |
| Fuentes de precio citadas | ArtificialAnalysis/Replicate (65 centavos por millon de caracteres) y DeepInfra (80 centavos por millon de caracteres) |

## Requisitos de hardware

- VRAM estimada para inferencia: el peso del modelo en precision completa es de aproximadamente 0,33 GB (82 M de parametros en fp32) y de unos 0,16 GB en fp16. Sumando el vocoder ISTFTNet y los buffers de inferencia, una estimacion practica de trabajo es de 1 GB o menos de VRAM.
- GPU recomendadas: practicamente cualquier GPU con 1-2 GB de VRAM es suficiente. Para servir muchas peticiones concurrentes o baja latencia sostenida, son apropiadas NVIDIA T4, L4, A10G, RTX 3060, RTX 4090, A100 o H100, aunque en la mayoria de casos estaran sobredimensionadas.
- Compatibilidad con GPU de consumo: si, cabe en GPU de consumo e incluso en GPU integradas y en CPU. La inferencia en CPU es viable para flujos no masivos.
- Opciones de despliegue: paquete Python `kokoro` (>=0.9.2) con `soundfile` y `espeak-ng` como dependencias; libreria G2P misaki; demo publicada en Hugging Face Spaces (hexgrad/Kokoro-TTS); APIs comerciales en Replicate y DeepInfra. La informacion disponible no menciona soporte explicito para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan cifras de latencia. Como referencia de volumen, la model card estima que 1000 caracteres de entrada producen aproximadamente 1 minuto de audio de salida.

## Comparativa con modelos similares

Los datos de los modelos comparados proceden de la documentacion publica de cada proyecto y de la informacion disponible; conviene verificarlos antes de tomar decisiones de produccion.

| Modelo | Parametros | Idiomas | Licencia | Encaje frente a Kokoro-82M |
|---|---|---|---|---|
| Kokoro-82M (hexgrad / iesdav) | 82 M | v1.0: 8 idiomas y 54 voces; este repo declara solo `en` | Apache 2.0 | Referencia: ligero, permisivo y con coste de servicio muy bajo |
| StyleTTS 2 (yl4579/StyleTTS2-LJSpeech) | No disponible en la informacion proporcionada | Depende del checkpoint (LJSpeech es ingles) | No disponible en la informacion proporcionada | Es el modelo base arquitectonico de Kokoro; Kokoro redistribuye solo el decodificador |
| Piper (Rhasspy) | No disponible en la informacion proporcionada | Multiples | MIT (segun el proyecto) | Alternativa orientada a CPU y dispositivos embebidos, tambien permisiva |
| XTTS-v2 (Coqui) | No disponible en la informacion proporcionada | Multiples | Coqui Public Model License (uso comercial restringido) | Mayor capacidad de clonacion de voz, pero licencia menos permisiva y mas peso |

No se dispone de datos de benchmarks comparativos publicados en la informacion proporcionada que permitan ordenar estos modelos por calidad de sintesis.

## Limitaciones y advertencias

- Es un modelo exclusivamente TTS: no genera texto, no razona, no admite tool calling ni agentes, y no procesa imagenes ni audio de entrada.
- No se libera el encoder ni modulos de difusion (decoder-only), por lo que no se ofrecen capacidades de clonacion de voz a partir de audio de referencia.
- La calidad depende fuertemente del front-end G2P: errores en misaki o espeak-ng al transcribir numeros, siglas, nombres propios y palabras extranjeras se traducen directamente en pronunciaciones incorrectas.
- El repositorio iesdav/Kokoro-82M declara unicamente ingles (`en`), aunque la model card del proyecto original menciona multiples idiomas. Para uso multilingue debe acudirse al repositorio original hexgrad/Kokoro-82M.
- Repositorio no verificado: 0 descargas, 0 "likes" y fecha de creacion registrada como 2026-09-22, posterior a la publicacion original (27 de enero de 2025). Se recomienda validar el hash SHA256 (`496dba118d1a58f5f3db2efc88dbdc216e0483fc89fe6e47ee1f2c53f18ad1e4`) o usar directamente los pesos del autor original.
- Riesgo de suplantacion: la model card advierte de sitios web fraudulentos (kokorottsai_com, kokorotts_net) que no tienen ninguna relacion con el autor ni con la pagina oficial del modelo.
- Licencia Apache 2.0 en los pesos: permite uso comercial, pero el contenido de audio entrenado incluye material CC BY (Koniwa, SIWIS) cuya atribucion se documenta en la model card; conviene revisar los requisitos de atribucion si se redistribuye el modelo o sus derivados.
- Riesgo de mal uso: la sintesis de voz puede emplearse para suplantacion o desinformacion. No se documentan en la informacion disponible mecanismos tecnicos de marca de agua ni de deteccion de audio sintetico.
- No se documentan sesgos especificos ni evaluaciones de equidad por acento, genero o variedad dialectal.
- Uso en produccion: al no existir benchmarks publicados en la informacion disponible, la calidad debe validarse con pruebas propias antes de desplegar en flujos criticos.

## Enlaces

- Repositorio analizado en Hugging Face: https://huggingface.co/iesdav/Kokoro-82M
- Repositorio original del modelo: https://huggingface.co/hexgrad/Kokoro-82M
- Repositorio GitHub oficial: https://github.com/hexgrad/kokoro
- Demo en Hugging Face Spaces: https://hf.co/spaces/hexgrad/Kokoro-TTS
- Evaluaciones (EVAL.md): https://huggingface.co/hexgrad/Kokoro-82M/blob/main/EVAL.md
- Muestras de audio (SAMPLES.md): https://huggingface.co/hexgrad/Kokoro-82M/blob/main/SAMPLES.md
- Voces disponibles (VOICES.md): https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md
- Version legacy v0.19: https://huggingface.co/hexgrad/kLegacy/tree/main/v0.19
- Paper de StyleTTS 2: https://arxiv.org/abs/2306.07691
- Paper de ISTFTNet: https://arxiv.org/abs/2203.02395
- Implementacion de StyleTTS 2: https://github.com/yl4579/StyleTTS2
- Checkpoint base StyleTTS2-LJSpeech: https://huggingface.co/yl4579/StyleTTS2-LJSpeech
- Libreria G2P misaki: https://pypi.org/project/misaki/ y https://github.com/hexgrad/misaki
- Paquete Python kokoro: https://pypi.org/project/kokoro/
- Precios de referencia en ArtificialAnalysis: https://artificialanalysis.ai/text-to-speech/model-family/kokoro#price
- Despliegue en DeepInfra: https://deepinfra.com/hexgrad/Kokoro-82M
- Servidor de Discord del proyecto: https://discord.gg/QuGxSWBfQy
- Conjunto Koniwa (CC BY 3.0): https://github.com/koniwa/koniwa
- Conjunto SIWIS (CC BY 4.0): https://datashare.ed.ac.uk/handle/10283/2353
- Muestra oficial de audio: https://huggingface.co/hexgrad/Kokoro-82M/resolve/main/samples/HEARME.wav
