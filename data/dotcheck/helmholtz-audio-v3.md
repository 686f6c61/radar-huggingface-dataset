# DotCheck/helmholtz-audio-v3

## Resumen

Helmholtz es el detector de audio sintetico de produccion de DotCheck, presentado en su version v3 como un clasificador binario que estima la probabilidad de que un clip de audio haya sido generado por inteligencia artificial. El modelo combina un encoder de audio enmascarado Dasheng-Base (de mispeech) congelado, del que extrae embeddings, con una cabeza logistica lineal entrenada especificamente para discriminar entre audio real y sintetico. El artefacto publicado es un archivo `.npz` con los pesos de la cabeza lineal, bajo licencia Apache-2.0, y no sigue el formato estandar de Hugging Face (`AutoModel.from_pretrained` no funciona).

El modelo opera sobre ventanas de 4 segundos a 16 kHz mono, con agregacion por maximo de hasta dos ventanas por clip, y devuelve una probabilidad `p ∈ [0,1]`. Los datos de evaluacion en holdout (CodecFake, DFADD, AudioGen y familia fal) muestran una precision balanceada de 0.989, con una tasa media de falsos positivos del 0.5 % y una tasa media de deteccion de audio sintetico del 98.2 %. Es relevante ahora porque aborda la verificacion de medios sinteticos en un momento en que los generadores de voz y musica por IA se han democratizado y proliferan en contenido publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dasheng-Base (encoder de audio enmascarado, congelado) + cabeza logistica lineal |
| Parametros totales | no disponible (el artefacto publicado es un `.npz` con la cabeza lineal; el backbone Dasheng-Base se carga por separado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4 segundos por ventana, hasta 2 ventanas por clip (agregacion por maximo) |
| Tipos de cuantizacion | no disponible (el head es un `.npz` de precision nativa; el backbone se sirve segun la configuracion de Dasheng-Base) |
| Idiomas soportados | en (ingles; el audio no es especifico de idioma, pero la documentacion esta en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.npz` (cabeza lineal); backbone `mispeech/dasheng-base` en formato nativo de Hugging Face |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de dos etapas: primero, el audio se normaliza a mono 16 kHz y se divide en ventanas de 4 segundos (center crop). Cada ventana pasa por el encoder enmascarado Dasheng-Base, que permanece congelado durante el entrenamiento, y produce embeddings que alimentan una cabeza logistica lineal. Esta cabeza devuelve una probabilidad `p` de que el audio sea sintetico; en el caso de multiples ventanas, se aplica agregacion por maximo. No se menciona el uso de tecnicas como RLHF o DPO; el entrenamiento es un ajuste supervisado de la cabeza lineal sobre embeddings precalculados.

Los datos de entrenamiento se dividen en dos conjuntos: los reales incluyen LibriTTS y FSD50K (concatenados sin loop-tile), mientras que los sinteticos incluyen salidas de parler-mini, melo-en, dasheng-audiogen, la familia fal (Kokoro, Eleven Turbo y mezclas) y 22 muestras few-shot de Imagine. La evaluacion en holdout usa particiones disjuntas por hash SHA: CodecFake y DFADD para voz, una particion impar de AudioGen para musica/SFX, y un holdout por prompt-id para la familia fal. No se documenta el numero total de tokens ni el tamano exacto del dataset.

## Capacidades

- Clasificacion binaria de audio: estima la probabilidad de que un clip sea generado por IA (`p ∈ [0,1]`).
- Deteccion en voz, musica y audio general: el entrenamiento incluye datos de habla (LibriTTS), efectos de sonido y musica (FSD50K, AudioGen) y TTS comercial (fal family).
- Procesamiento multi-ventana: admite hasta dos ventanas de 4 segundos por clip con agregacion por maximo, lo que permite evaluar clips mas largos que la ventana base.
- Inferencia en CPU: el modelo se sirve mediante FastAPI en CPU, sin necesidad de GPU para el head logístico.
- Integracion en producto: puede combinarse con el analisis de fotogramas de video (Muybridge) para fusionar puntuaciones de banda sonora y video en el producto Covenant de DotCheck.
- Salida de puntuacion directa: devuelve un valor continuo de probabilidad, no una etiqueta discreta, lo que permite ajustar umbrales por aplicacion.
- No soporta tool calling, razonamiento multi-paso ni generacion de texto: es un clasificador puro.

## Casos de uso

- Moderacion de contenido en plataformas de audio: el modelo puede puntuar clips subidos por usuarios para detectar voz o musica sintetica antes de su publicacion, aprovechando la inferencia en CPU para escalar sin GPUs dedicadas.
- Verificacion de medios en redacciones y agencias: los periodistas pueden analizar grabaciones sospechosas de ser deepfakes de audio, usando la API `/v1/analyze-audio` para obtener una puntuacion de probabilidad en segundos.
- Control de calidad en pipelines de generacion de voz: las empresas que producen audio con TTS pueden validar que sus propios generadores producen audio indistinguible o, por el contrario, detectar fugas de audio sintetico en sus datasets de entrenamiento.
- Analisis forense de bandas sonoras en video: en el producto Covenant, las ventanas de audio se fusionan con los fotogramas de video (Muybridge) para puntuar contenido audiovisual completo, util para plataformas de video corto.
- Auditoria de datasets de entrenamiento: los equipos de ML pueden filtrar muestras de audio sintetico en corpus de voz o musica antes de entrenar modelos, reduciendo contaminacion en datos de entrenamiento.
- Monitorizacion de campañas de desinformacion: organizaciones de fact-checking pueden analizar clips de audio que circulan en redes sociales para identificar contenido sintetico y priorizar su verificacion manual.
- Cumplimiento normativo en publicidad: las agencias pueden verificar que las voces en off generadas por IA se etiqueten correctamente segun la normativa de transparencia de medios sinteticos.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en un holdout propio (conjunto DotCheck audio holdout, particiones disjuntas por SHA):

| Metrica | Objetivo declarado | Valor medido |
|---|---|---|
| Media P(AI) en audio real | ≤ 0.12 | 0.005 |
| Media P(AI) en audio IA | ≥ 0.85 | 0.982 |
| Precision balanceada | ≥ 0.90 | 0.989 |

Los datos provienen del conjunto de evaluacion `DotCheck audio holdout` que combina CodecFake, DFADD y AudioGen con la familia fal (Kokoro, Eleven Turbo y mezclas). No se han publicado resultados comparativos con otros detectores de audio sintetico en la informacion disponible, y los valores no estan verificados de forma independiente.

## Requisitos de hardware

- Inferencia en CPU: el modelo se sirve mediante FastAPI en CPU, segun la documentacion oficial, lo que indica que el head logístico tiene un coste computacional minimo.
- El backbone Dasheng-Base, al estar congelado, requiere los recursos de un encoder de audio de tamano base; no se especifican los requisitos exactos de VRAM en la documentacion.
- No se indican GPU recomendadas especificas; al poder servirse en CPU, es plausible que quepa en hardware de consumo, pero el backbone puede necesitar una GPU modesta (por ejemplo, una RTX de gama media) para latencias bajas en produccion.
- Opciones de despliegue: FastAPI en CPU (documentado), integracion via API en `dotcheck.ai/check` o `dotcheck.ai/api`; no se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de generacion de texto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Enfoque | Licencia | Precision balanceada | Formato |
|---|---|---|---|---|
| DotCheck/helmholtz-audio-v3 | Dasheng-Base congelado + head logistica | Apache-2.0 | 0.989 (holdout propio) | `.npz` + backbone |
| DotCheck/helmholtz-audio-v2 | Mismo enfoque, version anterior | Apache-2.0 | no disponible | `.npz` + backbone |
| Detectores de audio sintetico genericos (p. ej., basados en ResNet o wav2vec2) | Clasificadores supervisados sobre features | variable | no disponible | variable |

No se dispone de datos publicos de otros detectores de audio sintetico con los mismos conjuntos de evaluacion, por lo que la comparativa directa no es posible con la informacion disponible.

## Limitaciones y advertencias

- Ventanas de protocolo cortas: el modelo analiza ventanas de 4 segundos; la estructura de audio de larga duracion (mas de 8 segundos) no se modela explicitamente.
- Sensibilidad a codecs y compresion: la documentacion advierte que codecs, compresion y generadores no vistos durante el entrenamiento pueden desplazar las puntuaciones.
- Generalizacion a generadores nuevos: los generadores de audio sintetico evolucionan rapidamente; el modelo puede degradarse ante arquitecturas TTS no representadas en el dataset de entrenamiento.
- Alcance limitado: no es apto para forensica judicial, identificacion de hablantes ni determinaciones legales, segun la propia documentacion.
- No es un modelo Hugging Face estandar: `AutoModel.from_pretrained("DotCheck/…")` no funciona; el despliegue requiere cargar el `.npz` y el backbone por separado.
- El repositorio publico solo incluye el head de audio; la fusion con video (Covenant) es privada y no tiene tabla de reclamaciones publica.
- Los benchmarks son declarados por el autor y no estan verificados de forma independiente.
- El modelo solo documenta soporte en ingles, aunque el audio en si no es especifico de idioma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DotCheck/helmholtz-audio-v3
- Version anterior (v2): https://huggingface.co/DotCheck/helmholtz-audio-v2
- Organizacion DotCheck en Hugging Face: https://huggingface.co/DotCheck/dotcheck
- Documentacion tecnica de DotCheck: https://dotcheck.ai/docs
- Informe tecnico DotCheck (PDF): https://dotcheck.ai/docs/dotcheck-technical-report-v2026.7.pdf
- Backbone Dasheng-Base: https://huggingface.co/mispeech/dasheng-base
- API de producto Check: https://dotcheck.ai/check
- API Pro: https://dotcheck.ai/api
