# gradium/phonon-31m-en

## Resumen

phonon-31m-en es un modelo de texto a voz (TTS) desarrollado por Gradium, una startup francesa especializada en IA vocal fundada en 2025. El modelo convierte texto en ingles en audio mono a 24 kHz con una calidad que el autor califica de natural, y su rasgo diferencial es el tamano: 31 millones de parametros (41,1 millones contando el tokenizador de audio en los pesos publicados), lo que permite ejecutarlo en el navegador, en un telefono o en la CPU de un portatil sin GPU dedicada.

Tecnicamente es un transformer de flow matching que predice latentes de audio fotograma a fotograma (ventanas de 80 ms) a partir del texto, y un decodificador del codec Mimi (desarrollado por Kyutai) que transforma esos latentes en audio. La generacion es en streaming: el audio empieza a reproducirse mientras el resto de la frase aun se esta sintetizando, lo que reduce la latencia percibida en aplicaciones conversacionales.

Su relevancia actual radica en la combinacion de licencia Apache 2.0 (a diferencia del resto de la familia Phonon, que usa CC BY-NC 4.0), un peso cuantizado a 8 bits de solo 64,5 MB y soporte de multiples runtimes (Python, navegador via WASM, Core ML en Apple, Android e incluso un preview para NPU Snapdragon). Esto lo posiciona como una opcion viable para TTS en produccion comercial y en dispositivos con recursos muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flow matching (prediccion de latentes de audio) + decodificador del codec Mimi |
| Parametros totales | 31M (excluyendo el tokenizador de audio); 41.096.035 en los pesos safetensors publicados |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8 (GGUF de 64,5 MB); safetensors sin cuantizar |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF (model.q8.gguf) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de dos etapas. Un transformer de flow matching toma el texto tokenizado y predice latentes de audio de forma autoregresiva, un fotograma de 80 ms por paso. Esos latentes se pasan al decodificador del codec Mimi de Kyutai, que los convierte en forma de onda PCM mono a 24 kHz. La arquitectura se apoya en el trabajo de Pocket TTS de Kyutai Labs, sobre el que Gradium construye su familia Phonon.

No se han publicado en la informacion disponible datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card tampoco detalla innovaciones adicionales mas alla del streaming nativo y la integracion del codec Mimi. El modelo se distribuye con pesos en safetensors para su uso con Transformers (clase `GradiumPhononTTSForConditionalGeneration`) y en GGUF cuantizado a 8 bits para el runtime propio `ptts`.

## Capacidades

- Sintesis de voz en ingles a 24 kHz, mono, con calidad descrita como natural por el autor.
- Generacion en streaming: los fragmentos de audio se emiten mientras el resto de la frase se sigue generando, lo que permite iniciar la reproduccion de inmediato.
- Seleccion de voz mediante identificadores de hablante (por ejemplo, la voz "Easton" en ingles estadounidense); las voces se publican en el repositorio `gradium/phonon-voices`.
- Normalizacion de texto dependiente del idioma en el runtime (numeros, simbolos, fechas, direcciones) mediante el parametro `lang`; en la ruta de Transformers esta normalizacion no se aplica y el texto largo debe dividirse con `processor.split_text`.
- Ejecucion en multiples plataformas: scripts Python, navegador (WASM via npm `phonon-tts`), apps iOS/iPadOS/macOS con Core ML, Android y un preview para NPU Snapdragon.
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada ni modo de razonamiento; es un modelo exclusivamente de texto a voz.

## Casos de uso

- Lectura por voz en el navegador: con 64,5 MB en q8 y ejecucion WASM, se puede integrar un lector de articulos o de accesibilidad en una web sin enviar el texto a un servidor, lo que simplifica el cumplimiento de privacidad.
- Asistentes conversacionales de baja latencia: el streaming nativo por fotogramas de 80 ms permite empezar a hablar al usuario antes de que termine la generacion, algo critico en turnos de voz interactivos.
- Aplicaciones moviles offline: las guias para Core ML (iOS/iPadOS/macOS) y Android permiten empaquetar el modelo en la app y ofrecer TTS sin conexion, util en entornos con conectividad intermitente.
- Audiolibros y podcasts automatizados: la licencia Apache 2.0 y la salida a 24 kHz hacen viable generar narraciones de forma comercial por lotes, con la salvedad de que la normalizacion de numeros y simbolos debe resolverse en el runtime `ptts` o preprocesando el texto.
- Sistemas de anuncios y senalizacion: en transporte publico, comercios o edificios, un TTS ligero que corre en CPU permite generar avisos dinamicos sin infraestructura GPU.
- Prototipado e investigacion en TTS: al ser un modelo pequeno con pesos abiertos y soporte en Transformers, sirve como base para experimentos de flow matching aplicado a audio o para comparativas de eficiencia frente a modelos mayores.
- Integracion en pipelines de CI/CD para generar avisos hablados o resumenes de logs: el binario `ptts` y el paquete de PyPI permiten invocarlo desde scripts sin dependencias pesadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en q8; los pesos cuantizados ocupan 64,5 MB y el decodificador Mimi anade una carga adicional modesta. Cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU de portatil. En GPU, cualquier tarjeta con al menos 1-2 GB de memoria libre es suficiente (GTX 1650, RTX 3060, RTX 4090, A100, H100), aunque el modelo no esta pensado para aprovechar hardware de datacenter.
- Cabe en GPU consumer: si, en practicamente todas, y tambien en moviles y navegador.
- Opciones de despliegue: runtime `ptts` (binario standalone, PyPI, Homebrew), Transformers con `GradiumPhononTTSForConditionalGeneration`, npm `phonon-tts` para navegador, Core ML para Apple, guia Android y preview QNN para NPU Snapdragon. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se han publicado cifras concretas; el diseno en streaming con fotogramas de 80 ms sugiere una latencia inicial baja, pero no hay numeros verificables en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Pesos q8 | Notas |
|---|---|---|---|---|---|
| phonon-31m-en | 31M | Ingles | Apache 2.0 | 64,5 MB | Uso comercial permitido; runtime multiple |
| phonon-40m-en | 40M | Ingles | CC BY-NC 4.0 | 74,6 MB | Misma familia, no comercial |
| phonon-40m-multilingual | 40M | 5 idiomas (en, fr, de, es, pt) | CC BY-NC 4.0 | 74,6 MB | Misma familia, no comercial |
| Pocket TTS (Kyutai) | no disponible | no disponible | no disponible | no disponible | Base tecnica de Phonon; datos no disponibles en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan comparar rendimiento objetivo con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Solo soporta ingles; no se debe usar para sintetizar otros idiomas sin esperar degradacion severa.
- La normalizacion de numeros, simbolos, fechas y direcciones solo ocurre en el runtime `ptts` con el parametro `lang`; en la ruta de Transformers el tokenizador no la aplica y el texto largo requiere division manual con `processor.split_text`.
- No se han publicado evaluaciones de sesgo, robustez ante texto adversarial ni tasas de error de pronunciacion; en produccion conviene validar con un conjunto propio de frases.
- Riesgo de alucinacion acustica: como todo TTS generativo, puede producir artefactos, prosodia incorrecta o pronunciaciones erroneas en nombres propios y terminos tecnicos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se apoya en el codec Mimi de Kyutai y en Pocket TTS; conviene revisar las licencias de esas dependencias antes de distribuirlo.
- El resto de la familia Phonon (incluida la version multilingue con espanol) usa CC BY-NC 4.0, por lo que no es apta para uso comercial; solo phonon-31m-en ofrece Apache 2.0.
- No hay informacion publica sobre el dataset de entrenamiento, lo que dificulta evaluar sesgos de acento, genero o procedencia de las voces.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gradium/phonon-31m-en
- Coleccion de la familia Phonon: https://huggingface.co/collections/gradium/phonon
- Repositorio de voces: https://huggingface.co/gradium/phonon-voices
- Demo en el navegador: https://huggingface.co/spaces/gradium/phonon
- Runtime en GitHub: https://github.com/gradium-ai/xn-ptts
- Paquete Python en PyPI: https://pypi.org/project/ptts/
- Paquete npm para navegador: https://www.npmjs.com/package/phonon-tts
- Documentacion de Transformers: https://huggingface.co/docs/transformers/main/en/model_doc/gradium_phonon_tts
- Pocket TTS de Kyutai: https://github.com/kyutai-labs/pocket-tts
- Discord: https://discord.gg/T85yt8kD33
- Sitio de Gradium: https://gradium.ai/
- Blog de lanzamiento de Gradium: https://gradium.ai/blog/gradium
- Articulo de Le Monde sobre Gradium: https://www.lemonde.fr/economie/article/2025/12/02/gradium-nouvelle-start-up-francaise-specialiste-d-ia-vocale_6655699_3234.html
- Articulo de L'Usine Digitale sobre la financiacion: https://www.usine-digitale.fr/start-up/financement/investissement/100-millions-de-dollars-de-financement-gradium-la-pepite-francaise-de-lia-vocale-accueille-nvidia-parmi-ses-investisseurs-et-setend-aux-etats-unis.ZDLFPAJCJBH6JHG5Z4HIFTPYG4.html
