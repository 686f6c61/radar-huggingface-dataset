# ric912/en-km-phonetic-byt5-lora

## Resumen

en-km-phonetic-byt5-lora es un adaptador LoRA sobre google/byt5-small desarrollado por el usuario ric912 que convierte palabras y nombres en ingles a su representacion fonetica en escritura jemer (khmer). No traduce: transcribe como suena el termino ingles usando el silabario jemer, de forma analoga a como se escriben prestamos y nombres propios en textos jemeres reales. El modelo se distribuye como adaptador (no como modelo autonomo) y requiere el paquete Python `khmer-translit` para su ejecucion, ya que no es cargable mediante `AutoModel` ni PEFT.

El modelo resuelve un problema muy concreto de normalizacion linguistica: la transliteracion fonetica inversa ingles-jemer, util para glosarios, sintesis de voz y localizacion de nombres propios. Se entrena sobre 4.764 pares ingles-jemer extraidos de texto web jemer y del corpus ALT, con un total de 3.585 palabras inglesas distintas. La ventana de entrada esta limitada a 32 letras y el modelo rechaza explicitamente entradas vacias, multi-palabra, con digitos o caracteres no latinos.

Se trata de una "research preview" sin validacion independiente, con evaluacion humana interna sobre dos muestras de 120 palabras (64% y 75% de aceptabilidad). Su relevancia actual es acotada: es un componente especializado, ligero (unos 2 GB de memoria en CPU), pensado para borradores que un revisar humano jemer debe validar, no para produccion autonoma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre google/byt5-small (transformer encoder-decoder byte-level T5) |
| Parametros totales | no disponible (el adaptador LoRA; el base byt5-small ronda los 300M, dato no confirmado en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; entrada limitada a una palabra de hasta 32 letras |
| Tipos de cuantizacion | no disponible (ejecucion en CPU con PyTorch; sin variantes GGUF/INT8 documentadas) |
| Idiomas soportados | en (entrada), km (salida en escritura jemer) |
| Licencia | CC BY-SA 4.0 (desde 2026-11-13; antes CC BY-NC-SA 4.0). Base google/byt5-small bajo Apache 2.0 |
| Formato de pesos | adaptador LoRA (cargado via paquete `khmer-translit`, no safetensors estandar ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA acoplado a google/byt5-small, un transformer encoder-decoder de tipo T5 que opera a nivel de bytes en lugar de tokens subword. Esta eleccion es coherente con la tarea: la escritura jemer no se segmenta en espacios y un tokenizador byte-level evita problemas de vocabulario para el silabario jemer y para grafias inglesas irregulares. El adaptador se carga a traves de la libreria `khmer-translit`, que gestiona la inferencia sobre PyTorch en CPU y expone una API de prediccion con soporte para top-k alternativas.

Los datos de entrenamiento constan de 4.764 pares ingles-jemer (3.585 palabras inglesas unicas). La mayoria se minaron de texto web jemer donde una grafia jemer aparece seguida de la palabra inglesa entre parentesis (por ejemplo, "ចនសុន (Johnson)"), usando FineWeb-2 (subconjunto jemer) y Wikipedia en jemer. El resto proviene de nombres y prestamos en las traducciones humanas del ALT Parallel Corpus. Los pares se validaron automaticamente contra la pronunciacion inglesa; no se emplearon grafias generadas por LLM ni escritas a mano. No se documenta en la informacion disponible el uso de RLHF, DPO ni un recuento de tokens de entrenamiento.

## Capacidades

- Transliteracion fonetica de una palabra o nombre ingles a escritura jemer (por ejemplo, coffee → ខូហ្វី, london → ឡុនដុន, taxi → តាក់ស៊ី).
- Generacion de hasta N alternativas de grafia mediante `--top-k N`, ordenadas por puntuacion (no son valores de confianza).
- Normalizacion de entrada: ignora mayusculas, acentos, apostrofes y guiones (O'Neil → oneil).
- Rechazo controlado de entradas invalidas: texto vacio, varias palabras, digitos, caracteres no latinos y palabras de mas de 32 letras devuelven un estado en lugar de una conjetura.
- Procesamiento por lotes: entrada por stdin en formato JSONL y salida estructurada en JSON.
- Ejecucion offline en CPU, sin GPU ni conexion de red tras la descarga inicial.
- No soporta traduccion, frases completas, jemer romanizado ni lectura de nombres en su idioma original.

## Casos de uso

- Creacion de glosarios de prestamos y nombres propios: el modelo genera un borrador de grafia jemer para cada termino ingles, que un revisor jemer valida antes de publicar; adecuado por su velocidad (unas 0,5 s por palabra) y su capacidad de ofrecer alternativas con top-k.
- Preprocesado para sintesis de voz (TTS) en jemer: convertir nombres y marcas en ingles a una grafia jemer pronunciable para que el motor TTS los articule de forma inteligible.
- Localizacion de interfaces y documentacion: generar propuestas de transliteracion para terminos tecnicos y nombres de producto en la version jemer de un producto, con revision humana obligatoria.
- Normalizacion de entidades en pipelines de datos: dado un listado de nombres en ingles, producir candidatos de grafia jemer para enlazarlos con menciones en corpus jemeres, usando el modo por lotes JSONL.
- Apoyo a traductores y editores: obtener rapidamente varias opciones de grafia para un termino dudoso y elegir la mas adecuada, reduciendo el tiempo de busqueda manual.
- Prototipado de herramientas linguisticas: al ejecutarse en CPU con unos 2 GB de memoria y cargar en unos 6 s, sirve para integrar la transliteracion en scripts y utilidades de escritorio sin infraestructura GPU.
- Investigacion sobre transliteracion fonetica: el adaptador y su informe tecnico permiten reproducir y comparar enfoques sobre un conjunto de pares documentado.

## Benchmarks y rendimiento

Evaluacion humana interna sobre dos muestras independientes de 120 palabras no vistas (40 cotidianas, 40 con ortografia inglesa irregular, 40 nombres), con juez afiliado al proyecto y a ciegas respecto al modelo:

| Muestra | Aceptables | Cotidianas | Ortografia irregular | Nombres |
|---|---|---|---|---|
| 1 | 64% (77/120) | 27/40 | 14/40 | 36/40 |
| 2 | 75% (90/120) | 34/40 | 20/40 | 36/40 |

Cada cifra tiene una incertidumbre de aproximadamente ±8 puntos. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, lo cual es esperable dado que el modelo no es de proposito general.

Rendimiento medido en CPU de portatil (Intel i7-8750H): carga de unos 6 s, 0,5 s por palabra, aproximadamente 14 palabras por segundo en lotes y unos 2 GB de memoria.

## Requisitos de hardware

- VRAM: no aplica; la inferencia esta disenada para CPU con PyTorch (build CPU-only).
- Memoria RAM estimada: unos 2 GB durante la inferencia.
- GPU: no requerida ni documentada; no se describen aceleraciones por GPU.
- Cabe en cualquier equipo consumer: el ejemplo del autor usa un Intel i7-8750H de portatil.
- Despliegue: paquete Python `khmer-translit` con extra `[byt5]`, invocable por CLI (`khmer-translit predict`) o por API (`ByT5Transliterator`). No compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,5 s por palabra individual; unas 14 palabras por segundo en modo lote.
- Almacenamiento: descarga del modelo base google/byt5-small de aproximadamente 1,2 GB, mas el adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| ric912/en-km-phonetic-byt5-lora | LoRA sobre byt5-small | no disponible (adaptador) | una palabra (max. 32 letras) | CC BY-SA 4.0 | Requiere paquete `khmer-translit`; evaluacion humana interna 64-75% |
| ric912/en-km-phonetic-transliterator | Modelo autonomo pequeno, sin PyTorch | no disponible | no disponible | no disponible en la informacion | Alternativa mas pequena y rapida del mismo autor |
| google/byt5-small | Modelo base byte-level T5 | no disponible en la informacion | no disponible | Apache 2.0 | Modelo general; no especializado en transliteracion ingles-jemer |

No se dispone en la informacion proporcionada de otros modelos publicos comparables especificamente en transliteracion fonetica ingles-jemer para ampliar la comparativa.

## Limitaciones y advertencias

- Calidad no validada de forma independiente: es una research preview con evaluacion interna de un juez afiliado al proyecto.
- Debilidad en ortografia inglesa irregular: letras mudas se pronuncian a veces y algunas palabras se leen letra a letra; la mayoria de errores se concentran en las vocales.
- Pronunciacion basada en ingles estadounidense: palabras con dos pronunciaciones (record, live) reciben una sola.
- No produce formas jemer establecidas: genera la grafia del sonido ingles (coffee → ខូហ្វី) en lugar de la forma convencional (កាហ្វេ).
- Puede reproducir habitos del corpus web, como nombres escritos segun la lectura de su idioma original.
- Ambito restringido: no traduce, no procesa frases, no maneja jemer romanizado y rechaza entradas de mas de 32 letras, multi-palabra, digitos o caracteres no latinos.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion, pero obliga a compartir las adaptaciones bajo la misma licencia.
- El modelo base google/byt5-small es de Google bajo Apache 2.0 y no se incluye en el repositorio del adaptador.
- No cargable con `AutoModel` ni PEFT; la integracion depende del paquete `khmer-translit`, lo que limita su portabilidad a otros ecosistemas de inferencia.
- En produccion se recomienda revision por un lector jemer antes de publicar cualquier grafia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ric912/en-km-phonetic-byt5-lora
- Modelo base: https://huggingface.co/google/byt5-small
- Modelo autonomo alternativo del mismo autor: https://huggingface.co/ric912/en-km-phonetic-transliterator
- Informe tecnico: technical-report.pdf (11 paginas, en el repositorio del modelo; no revisado por pares)
- Dataset FineWeb-2 (subconjunto jemer): https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- ALT Parallel Corpus: https://www2.nict.go.jp/astrec-att/member/mutiyama/ALT/
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Paquete `khmer-translit` (MIT): https://huggingface.co/ric912/en-km-phonetic-transliterator/resolve/v0.2.0/khmer_translit-0.2.0-py3-none-any.whl
- PyTorch CPU-only: https://download.pytorch.org/whl/cpu
