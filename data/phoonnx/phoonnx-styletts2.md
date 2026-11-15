# Phoonnx/phoonnx-styletts2

## Resumen

Phoonnx-styletts2 es un repositorio espejo que empaqueta en formato ONNX una coleccion de checkpoints de la familia StyleTTS2, junto con sus ficheros `config.json` y, cuando procede, vectores de estilo `.bin` para clonacion de voz. Lo mantiene el proyecto Phoonnx (OpenVoiceOS) como backend de su libreria de sintesis de voz offline `phoonnx`, y no esta pensado para consumo directo: las voces se resuelven a traves del gestor de voces de la libreria, que mapea identificadores a los ficheros de este repositorio.

El repositorio no contiene un unico modelo, sino un conjunto de voces de distintos laboratorios: checkpoints StyleTTS2 multihablante del Barcelona Supercomputing Center (castellano y catalan), voces en euskera del HiTZ Center (incluida una variante con emociones), dos voces en gallego de Proxecto Nos con desarrollo tecnico de Gradiant, un checkpoint comunitario en ingles de autor `ddatt` y varias versiones del modelo Kokoro (82M, descendiente de StyleTTS2), que cubren ingles, espanol, frances, hindi, italiano, japones, portugues y chino.

Su relevancia actual radica en que ofrece sintesis de voz neuronal con clonacion zero-shot completamente offline y en formato ONNX, lo que facilita el despliegue en entornos sin GPU dedicada y en lenguas con poca cobertura comercial (euskera, gallego, catalan). El tamano total del repositorio es de 5,3 GB y la licencia es heterogenea: cada familia de voces conserva la licencia de su autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | StyleTTS2 (familia); Kokoro como descendiente con el mismo contrato de condicionamiento por vector de estilo |
| Parametros totales | no disponible (Kokoro: 82M; resto de checkpoints: no disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | en, es, ca, eu, gl, ja, zh, hi, it, pt, fr |
| Licencia | other (heterogenea por familia: Apache-2.0, GPL-3.0 y una voz sin determinar) |
| Formato de pesos | ONNX (`.onnx`), `config.json` y vectores de estilo `.bin` (256 `float32`) |

## Arquitectura y entrenamiento

StyleTTS2 es un sistema de sintesis de voz neuronal que genera audio condicionado por un vector de estilo que codifica prosodia y timbre extraidos de una grabacion de referencia. Ese mecanismo es el que habilita la clonacion zero-shot: basta con aportar un clip de referencia para obtener una voz nueva sin reentrenamiento. Kokoro, incluido aqui como voces del motor `styletts2`, es un descendiente de StyleTTS2 fonemizado con "misaki" que comparte el mismo contrato de condicionamiento por vector de estilo. En `phoonnx`, el mecanismo de d-vector `styletts2_style` es el que gestiona esta clonacion.

Los datos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan documentados en la informacion disponible para la mayoria de checkpoints. Lo que si se detalla es el origen de cada familia: los checkpoints del BSC son multihablante y sus vectores de estilo nombrados se calcularon como la media de la salida del codificador de estilo sobre cuatro clips de referencia de cada hablante, tomados del propio corpus de entrenamiento del modelo. En concreto, el checkpoint catalan incluye 11 hablantes de Festcat (`bet eli eva jan mar ona pau pep pol teo uri`) y el castellano incluye los 6 hablantes de CML-TTS que sostienen el corpus (`3946 8882 9972 10246 11797 12367`). Las voces gallegas son monohablante, incluyen un `style.bin` por defecto junto al `style_encoder.onnx` para clonacion y se fonemizan con notacion Cotovia (no IPA). Las voces Kokoro obtienen sus vectores de estilo en tiempo de carga desde `onnx-community/Kokoro-82M-v1.0-ONNX`.

## Capacidades

- Sintesis de texto a voz offline en 11 idiomas: ingles, espanol, catalan, euskera, gallego, japones, chino, hindi, italiano, portugues y frances (la cobertura real depende de la familia de voces: Kokoro cubre en/es/fr/hi/it/ja/pt/zh; el resto de familias cubren lenguas ibericas concretas).
- Clonacion de voz zero-shot mediante un clip de referencia, gracias al condicionamiento por vector de estilo.
- Voces predefinidas por hablante sin necesidad de referencia: 11 hablantes catalanes de Festcat, 6 hablantes castellanos de CML-TTS, dos voces gallegas (Celtia y Brais) y dos voces vascas (Antton y Maider).
- Control emocional en euskera: la variante `hitz-eu-emo-styletts2` ofrece las voces Antton y Maider en estados `happy`, `neutral` y `sad`.
- Soporte multihablante en los checkpoints del BSC: una misma llamada puede usar un hablante nombrado o clonar a partir de un clip.
- Fonemizacion especifica por lengua: notacion Cotovia para gallego y fonemizacion "misaki" para Kokoro.
- Ejecucion en CPU mediante runtime ONNX, sin dependencia de GPU.
- No se documentan capacidades de tool calling, agentes, vision ni audio de entrada; es exclusivamente un modelo de sintesis de voz.

## Casos de uso

- Asistentes de voz offline en dispositivos empotrados: al ejecutarse sobre ONNX y sin GPU, el modelo puede integrarse en altavoces inteligentes, Raspberry Pi o terminales sin conectividad, sintetizando respuestas en castellano, catalan, euskera o gallego con las voces predefinidas.
- Clonacion de voz para accesibilidad: un usuario con dificultades del habla puede grabar un clip de referencia y generar una voz personalizada mediante el mecanismo de d-vector `styletts2_style`, sin entrenamiento adicional.
- Localizacion de contenidos en lenguas minoritarias: produccion de audiolibros, avisos o material divulgativo en euskera (incluidas variantes emocionales), gallego y catalan, idiomas con escasa oferta en TTS comerciales.
- Lectura por voz de interfaces y notificaciones: integracion en sistemas de escritorio o domotica (OpenVoiceOS) para anunciar eventos y estados con latencia baja y sin enviar texto a servidores externos.
- Generacion de voces para videojuegos y prototipos: uso de las variantes emocionales vascas (`happy`/`neutral`/`sad`) para dar variedad interpretativa a dialogos de personajes no jugadores sin coste por licencia en las voces Apache-2.0.
- Investigacion en sintesis de voz: punto de partida reproducible para comparar checkpoints StyleTTS2 multihablante (BSC) frente a Kokoro en tareas de clonacion y prosodia, al estar todos expuestos bajo la misma interfaz de `phoonnx`.
- Pipelines de doblaje y preproduccion: generacion rapida de borradores de voz en varios idiomas para validar guiones antes de contratar locucion profesional, usando las voces Kokoro multilingues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ejecutarse sobre ONNX, la inferencia puede realizarse en CPU sin VRAM dedicada.
- GPU recomendadas: no disponible; no se documentan requisitos de GPU especificos.
- Compatibilidad con GPU de consumo: el diseno offline basado en ONNX sugiere viabilidad en CPU y en GPU de consumo, pero no se aportan modelos concretos ni cifras.
- Opciones de despliegue: libreria `phoonnx` (a traves de `TTSModelManager` y su gestor de voces), con runtime ONNX; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo TTS.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 5,3 GB, aunque el gestor de voces permite cargar solo las voces necesarias.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Clonacion | Licencia | Formato |
|---|---|---|---|---|---|
| phoonnx-styletts2 (este repo) | no disponible (Kokoro: 82M) | 11 (segun familia) | Si, zero-shot | other (heterogenea) | ONNX |
| hexgrad/Kokoro-82M | 82M | en, es, fr, hi, it, ja, pt, zh | No documentada en la informacion disponible | Apache-2.0 | ONNX y otros |
| BSC-LT/styletts2-spanish-multispeaker | no disponible | es | Si | Apache-2.0 | no disponible |
| BSC-LT/styletts2-catalan-multispeaker | no disponible | ca | Si | GPL-3.0 | no disponible |

La comparativa se limita a los modelos citados en la propia model card; no se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Licencia heterogenea: el repositorio se marca como `other` porque agrupa checkpoints de distintos autores. La voz catalana del BSC es GPL-3.0, lo que condiciona su uso comercial y la distribucion de derivados; el resto son Apache-2.0 salvo la voz `ddatt/en-styletts2`.
- `ddatt/en-styletts2` no tiene licencia determinada: el repositorio upstream original no se localizo, por lo que debe tratarse como todos los derechos reservados hasta que se aclare. No es apto para produccion sin resolver esta cuestion.
- Los checkpoints multihablante del BSC no incluyen audio de referencia en sus repositorios originales: para clonar con `bsc/es-styletts2` o `bsc/ca-styletts2` es necesario aportar un clip en cada llamada, salvo que se use uno de los hablantes nombrados con su `.bin`.
- Las voces gallegas usan notacion Cotovia en lugar de IPA, lo que exige el fonemizador adecuado y complica la portabilidad a otros pipelines TTS.
- Riesgo de artefactos y alucinacion acustica: no se documentan evaluaciones de calidad (MOS) ni pruebas de robustez ante textos largos, dominios especializados o ruido en el clip de referencia.
- Sesgos: no se documenta la composicion demografica de los corpus de entrenamiento (Festcat, CML-TTS), por lo que no puede evaluarse el sesgo de hablante, genero o acento.
- Cobertura desigual por idioma: aunque se listan 11 idiomas, la mayoria de familias cubren una sola lengua; el espanol combina el checkpoint del BSC y las voces Kokoro, mientras que el euskera y el gallego dependen de un unico proveedor cada uno.
- El repositorio no esta pensado para navegarse manualmente: su uso requiere la libreria `phoonnx` y su gestor de voces, lo que anade una dependencia de software para cualquier integracion.
- No se documentan limites de longitud de texto de entrada ni comportamiento con entradas muy largas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Phoonnx/phoonnx-styletts2
- Libreria phoonnx: https://github.com/TigreGotico/phoonnx
- Documentacion de clonacion: https://github.com/TigreGotico/phoonnx/blob/dev/docs/cloning.md
- Documentacion de hablantes multiples del BSC: https://github.com/TigreGotico/phoonnx/blob/dev/docs/bsc_multispeaker.md
- Documentacion de gallego: https://github.com/TigreGotico/phoonnx/blob/dev/docs/galician.md
- BSC-LT/styletts2-spanish-multispeaker: https://huggingface.co/BSC-LT/styletts2-spanish-multispeaker
- BSC-LT/styletts2-catalan-multispeaker: https://huggingface.co/BSC-LT/styletts2-catalan-multispeaker
- HiTZ/StyleTTS2-eu: https://huggingface.co/HiTZ/StyleTTS2-eu
- HiTZ/StyleTTS2-eu_emo: https://huggingface.co/HiTZ/StyleTTS2-eu_emo
- proxectonos/Nos_StyleTTS2-Celtia-GL: https://huggingface.co/proxectonos/Nos_StyleTTS2-Celtia-GL
- proxectonos/Nos_StyleTTS2-Brais-GL: https://huggingface.co/proxectonos/Nos_StyleTTS2-Brais-GL
- Proxecto Nos: https://nos.gal/gl/proxecto-nos
- Gradiant: https://www.gradiant.org/
- hexgrad/Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- onnx-community/Kokoro-82M-v1.0-ONNX: https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
- hexgrad/kLegacy (Kokoro v0.19): https://huggingface.co/hexgrad/kLegacy
- hexgrad/Kokoro-82M-v1.1-zh: https://huggingface.co/hexgrad/Kokoro-82M-v1.1-zh
- Dataset Festcat: https://huggingface.co/datasets/projecte-aina/festcat_trimmed_denoised
- Dataset CML-TTS: https://huggingface.co/datasets/ylacombe/cml-tts
