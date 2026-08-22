# notmax123/RenikudPlus

## Resumen

RenikudPlus v2 es un modelo de grafema a fonema (G2P) para hebreo desarrollado por notmax123. Convierte texto hebreo sin vocalizar en transcripción fonética IPA, incluyendo marcas de acento tónico, geminación y calidad vocálica, elementos que la ortografía hebrea no puntuada deja al contexto. Está pensado para front-ends de síntesis de voz (TTS), trabajo con léxicos e investigación en pronunciación.

El modelo se distribuye como un grafo ONNX autocontenido con un fichero de rescoring opcional (`datastore_ext_v5.json`) que mejora la precisión al reordenar candidatos según formas atestiguadas en un corpus. Según los datos del autor, alcanza un 92,8% de precisión global sobre el protocolo `test.tsv` de ILSpeech (3.110 objetivos), superando a alternativas publicadas como ReNikud (77,2 %) y Phonikud (65,3 %). Su relevancia actual radica en que el acento tónico es una salida de primera clase, algo que la mayoría de sistemas G2P hebreos omiten y que es esencial para síntesis de voz natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (grafo ONNX, arquitectura interna no documentada) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 2.046 caracteres por ventana (segmentacion automatica por limites de frase) |
| Tipos de cuantizacion | fp32 (bit-identico a la referencia) e int8 dinamico (4 veces mas pequeno, ~40 ms/llamada en CPU, +0,04 pp WER) |
| Idiomas soportados | hebreo (he) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (safetensors no disponible; el modelo se distribuye como `.onnx`) |

## Arquitectura y entrenamiento

La arquitectura interna del grafo ONNX no se documenta en la model card. Lo que se sabe es que el modelo genera transcripciones foneticas IPA con acento tonico (`ˈ` antes de la silaba tonica) y que incluye un paso de rescoring en tiempo de decodificacion: el grafo produce el decode basico (91,05 % en ILSpeech) y un segundo paso re-ranking los candidatos dentro de un umbral `τ = 0,5` contra un almacen de lecturas atestiguadas (`datastore_ext_v5.json`), lo que eleva la precision publicada.

El entrenamiento se realizo sobre material derivado de ILSpeech. La evaluacion se hizo sobre el split de test de ILSpeech (1.527 palabras completas, 92,21 %) y sobre un protocolo de objetivo por frase (3.110 objetivos). Los conjuntos de evaluacion nunca se usaron como entrada de entrenamiento, verificado mediante comprobaciones de solapamiento exacto y de 8-gramas contra el corpus completo.

## Capacidades

- Conversion de texto hebreo sin vocalizar a transcripcion IPA completa.
- Marcado de acento tonico como salida de primer nivel (simbolo `ˈ` antes de la silaba tonica).
- Manejo de acronimos con gershayim (p. ej., `במד״א` → `bemadˈa`), una clase donde los sistemas naive fallan.
- Geminacion y calidad vocalica en la salida fonetica.
- Rescoring en decodificacion contra un almacen de lecturas atestiguadas para reordenar candidatos.
- Ventanado automatico de entradas largas en limites de frase, hasta 2.046 caracteres por ventana.
- Variante condicionada por genero (0 = desconocido, 1 = masculino, 2 = femenino) disponible segun el repositorio de GitHub.
- Modelo ONNX autocontenido, ejecutable en CPU con baja latencia (~40 ms/llamada en la version int8).

## Casos de uso

- **Front-end de sintesis de voz en hebreo (TTS)**: el modelo proporciona la transcripcion fonetica con acento tonico que los sistemas TTS necesitan para generar prosodia natural. Su salida IPA puede alimentar directamente un vocoder o un modelo acustico.
- **Gestion de lexicos de pronunciacion**: permite generar automaticamente entradas foneticas para diccionarios y bases de datos de pronunciacion, cubriendo palabras hebreas comunes, nombres propios y acronimos.
- **Investigacion en fonologia y prosodia**: el acento tonico como salida explicita facilita estudios sobre patrones de acento en hebreo, incluyendo pares minimos de acento (p. ej., 97,0 % de precision en homografos de acento).
- **Normalizacion de numeros en habla**: el modelo alcanza 90,6 % de precision en palabras numericas, por lo que puede usarse para convertir cifras a su lectura hebrea correcta en contextos de TTS o ASR.
- **Correccion de transcripciones para ASR**: como paso de rescoring en pipelines de reconocimiento del habla, el modelo puede ayudar a elegir la lectura fonetica mas plausible para palabras ambiguas.
- **Enriquecimiento de datos para entrenamiento de modelos de voz**: permite generar transcripciones fonetica de corpus de texto hebreo sin vocalizar para preentrenar modelos de TTS o de conversion de texto a voz.
- **Herramientas educativas y de acceso a la lectura**: asistencia para estudiantes de hebreo que necesitan conocer la pronunciacion correcta de textos no vocalizados, con indicacion explicita del acento.

## Benchmarks y rendimiento

La model card publica resultados de precision sobre el protocolo `test.tsv` (3.110 objetivos, un objetivo por frase) comparando con Gemini, ReNikud (paper) y Phonikud:

| Conjunto | RenikudPlus v2 | Gemini | ReNikud (paper) | Phonikud |
|---|---:|---:|---:|---:|
| ILSpeech-test | 93,1 % | **95,4 %** | 88,4 % | 84,0 % |
| Nombres · Acronimos · Jerga | **97,3 · 96,0 · 96,2** | 74,7 · 77,0 · 69,9 | 70,7 · 65,8 · 62,2 | 68,0 · 37,5 · 41,7 |
| Homografos de acento · Pares minimos de acento | **97,0 · 98,0** | 94,1 · 83,3 | 81,8 · 72,7 | 77,8 · 74,0 |
| Numeros (64 objetivos) | **90,6 %** | 84,4 % | — | — |
| **GLOBAL** | **92,8 %** †‡ | 83,7 % | 77,2 % | 65,3 % |

Ademas, medido sobre el split completo de test de ILSpeech (1.527 palabras, mismas filas y mismo scorer para todos los sistemas): RenikudPlus v2 92,21 %, ReNikud (paper) 91,88 % (empate estadistico, p = 0,63) y Phonikud 84,09 %.

La columna `test.tsv` se marca con †‡ porque parte de los datos de entrenamiento se escribieron para cubrir listas de palabras derivadas de ese benchmark, por lo que mide cobertura de un conjunto dificil conocido, no capacidad general. La metrica honesta de ranking es el ILSpeech pooled: 90,69 % → 91,24 % durante el desarrollo.

## Requisitos de hardware

- **Version fp32** (`renikud_cons5_point8.onnx`): bit-identica a la implementacion de referencia, sin datos de VRAM publicados. El tamano del repositorio es de 3,5 GB en total, pero el modelo ONNX fp32 no tiene un tamano especificado en la model card.
- **Version int8** (`renikud_cons5_point8_int8.onnx`): cuantizacion dinamica, 4 veces mas pequena que la fp32, con ~40 ms por llamada en CPU. Adecuada para despliegue en CPU sin GPU.
- **Inferencia en CPU**: la version int8 esta pensada para ejecutarse en CPU con latencia baja, lo que la hace viable en entornos de produccion sin acelerador.
- **GPU**: no se proporcionan requisitos especificos de GPU; al ser un modelo ONNX pequeno (tipo G2P), cabria en cualquier GPU consumer moderna, aunque no se documenta.
- **Opciones de despliegue**: el modelo se ejecuta con ONNX Runtime; la model card proporciona una clase Python `G2P` que carga el grafo y aplica el rescoring. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un LLM.
- **Throughput**: no se publican cifras de throughput; solo la latencia de ~40 ms/llamada en CPU para la version int8.

## Comparativa con modelos similares

| Modelo | Precisión (ILSpeech pooled) | Acronimos | Acento tonico | Licencia | Formato |
|---|---:|---:|---|---|---|
| **RenikudPlus v2** | 92,21 % (full split) | 96,0 % | Si, primera clase | Apache 2.0 | ONNX |
| ReNikud (paper) | 91,88 % (full split) | 65,8 % | No documentado | No disponible | No disponible |
| Phonikud | 84,09 % (full split) | 37,5 % | No documentado | No disponible | No disponible |
| Gemini (API) | 83,7 % (test.tsv) | 77,0 % | No documentado | Propietaria | API |

RenikudPlus v2 supera a ReNikud y Phonikud en precision global, aunque en el protocolo de objetivos por palabra Gemini logra un 95,4 % en ILSpeech-test, frente al 93,3 % de RenikudPlus. La ventaja diferencial de RenikudPlus se concentra en nombres propios, acronimos, jerga y pares minimos de acento, donde supera ampliamente al resto.

## Limitaciones y advertencias

- Los errores restantes se concentran en nombres extranjeros no atestiguados y en decisiones de convencion de transcripcion (realizacion de la oclusiva glotal, procliticos `ba`/`be`) donde mas de una lectura es hebreo correcto.
- La tabla `test.tsv` mide cobertura de un conjunto dificil conocido, no habilidad general; la metrica honesta es el pooled ILSpeech (91,24 %).
- El modelo fue entrenado y evaluado exclusivamente sobre material derivado de ILSpeech; su comportamiento fuera de ese dominio no esta validado.
- No se publica informacion sobre la arquitectura interna, parametros ni datos de entrenamiento, lo que limita la reproducibilidad cientifica.
- No se documentan sesgos potenciales derivados del corpus de entrenamiento; al ser un modelo de pronunciacion, el riesgo de alucinacion es bajo, pero puede producir transcripciones incorrectas para nombres propios extranjeros.
- La licencia Apache 2.0 permite uso comercial, pero el fichero `datastore_ext_v5.json` es necesario para alcanzar las cifras publicadas, por lo que debe distribuirse junto al modelo.

## Enlaces

- [Hugging Face: notmax123/RenikudPlus](https://huggingface.co/notmax123/RenikudPlus)
- [Hugging Face - arbol de ficheros](https://huggingface.co/notmax123/RenikudPlus/tree/main)
- [GitHub - devbyteai/renikudplus](https://github.com/devbyteai/renikudplus)
- [GitHub - README de renikudplus](https://github.com/devbyteai/renikudplus/blob/main/README.md)
