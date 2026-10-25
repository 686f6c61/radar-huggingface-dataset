# EmogheneAkpomedaye/sherpa-onnx-nemo-parakeet-redux

## Resumen

Este repositorio es un espejo por ficheros de `moondream/parakeet-redux`, la versión con pesos ternarios (1,58 bits) de `nvidia/parakeet-tdt-0.6b-v3`, empaquetada en el formato NeMo TDT de sherpa-onnx (`model_type: nemo_transducer`). Lo publica el usuario EmogheneAkpomedaye y su función es permitir que las aplicaciones descarguen y verifiquen cada componente por separado (encoder, decoder, joiner y vocabulario) en lugar de un único archivo comprimido. Los ficheros no se han modificado respecto al empaquetado de Codyfederer; solo se han extraído del archivo `.tar.bz2`.

El modelo resuelve el reconocimiento automático de habla (ASR) multilingüe en 25 idiomas, mayoritariamente europeos, con un peso total de unos 0,4 GB, lo que lo hace apto para inferencia en CPU y para despliegue on-device. La arquitectura subyacente es un transducer TDT (token-and-duration) de NVIDIA con 0,6 mil millones de parámetros en su versión original, cuantizado a pesos ternarios (-1, 0, +1) y reempaquetado en el encoder ONNX como bloques `MatMulNBits` de 4 bits.

Su relevancia actual es práctica: demuestra una cadena de conversión completa (NVIDIA → ternario de M87 Labs/Moondream → ONNX de eschmidbauer → paquete sherpa-onnx de Codyfederer) que lleva un modelo ASR de 0,6 B a menos de medio gigabyte ejecutable con ONNX Runtime estándar. Es un artefacto de distribución, no un modelo entrenado de nuevo, y su interés depende completamente de los modelos upstream.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | NeMo TDT (token-and-duration transducer): encoder + decoder + joiner; `model_type: nemo_transducer` |
| Parámetros totales | 0,6 B en el modelo base (`parakeet-tdt-0.6b-v3`); recuento exacto del artefacto cuantizado: no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; modelo ASR que procesa segmentos de audio, la model card no documenta duración máxima |
| Tipos de cuantización | pesos ternarios de 1,58 bits (-1/0/+1); encoder reempaquetado como `MatMulNBits` de 4 bits que reproduce exactamente los valores ternarios |
| Idiomas soportados | 25: en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt |
| Licencia | CC BY 4.0 (heredada de todos los trabajos upstream) |
| Formato de pesos | ONNX (`encoder.onnx`, `decoder.onnx`, `joiner.onnx`) + `tokens.txt` |
| Tamaño en disco | 343.842.409 B (encoder) + 47.249.584 B (decoder) + 25.285.351 B (joiner) + 93.939 B (tokens); ~0,4 GB |
| Runtime probado | sherpa-onnx 1.13.8 sobre CPU |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transducer TDT de NeMo: un encoder que procesa las características acústicas, un decoder que modela el historial de tokens y un joiner que combina ambos y predice de forma conjunta el token y su duración. Esta factorización permite emisiones no sincronizadas con los frames y es la variante que NVIDIA usa en su familia Parakeet. En este repositorio el grafo se ha dividido en tres ficheros ONNX independientes (`encoder.onnx`, `decoder.onnx` y `joiner.onnx`) más el vocabulario `tokens.txt`.

No se dispone de información sobre los datos de entrenamiento (número de tokens, composición del corpus, idiomas por volumen ni si hubo etapas de ajuste fino supervisado o preferencias), porque la model card del espejo no los documenta y solo referencia el modelo base de NVIDIA. Tampoco se detalla el proceso de cuantización ternaria más allá de la atribución a Moondream/M87 Labs ni el método de calibración empleado. La innovación técnica documentada es la cadena de conversión: pesos ternarios (1,58 bits) almacenados como bloques `MatMulNBits` de 4 bits en el encoder ONNX, lo que permite ejecutar el modelo con la implementación estándar de ONNX Runtime que incluye el operador contrib `com.microsoft` `MatMulNBits`, presente en las builds por defecto de sherpa-onnx.

## Capacidades

- Reconocimiento automático de habla (transcripción de audio a texto) en 25 idiomas europeos, incluyendo lenguas con menos recursos como hr, sl, lv, lt, et, mt y el.
- Ejecución on-device y en CPU: pensado para integrarse en aplicaciones de escritorio o móviles (el caso documentado es la app Cohearo, que lo usa como ASR opcional en el dispositivo).
- Integración nativa con sherpa-onnx mediante `sherpa_onnx.OfflineRecognizer.from_transducer(...)`, con `model_type="nemo_transducer"`.
- Verificación de integridad por fichero: la model card publica el tamaño en bytes y el sha256 de cada componente.
- Distribución modular: descarga selectiva de encoder, decoder, joiner y vocabulario por separado.
- Capacidad de streaming o de timestamps a nivel de token: no disponible en la información proporcionada (solo se documenta el reconocedor offline).
- Soporte de tool calling, agentes, visión, audio clasificación, matemáticas o razonamiento textual: no aplica; es un modelo exclusivamente ASR.
- Puntuación y formato de salida (mayúsculas, signos, marcas de tiempo): no disponible.

## Casos de uso

- **Transcripción on-device en aplicaciones de notas de voz**: el paquete completo ocupa ~0,4 GB y se ejecuta en CPU con sherpa-onnx, por lo que puede embeberse en una app de escritorio o móvil sin depender de la nube; es exactamente el escenario documentado por Cohearo.
- **Dictado y accesibilidad**: integración en herramientas de escritura por voz para usuarios con movilidad reducida, con latencia local y sin envío de audio a servidores externos, un requisito habitual en entornos sanitarios o corporativos.
- **Subtitulado por lotes en postproducción**: procesar los segmentos de audio de un vídeo con el reconocedor offline y generar subtítulos en cualquiera de los 25 idiomas soportados, verificando antes la integridad de los ficheros con los sha256 publicados.
- **Actas de reuniones multilingües en la UE**: al cubrir las principales lenguas de la Unión (más candidatas y vecinas), un mismo binario puede transcribir reuniones en neerlandés, polaco, griego o maltés sin desplegar un modelo distinto por idioma.
- **Ingesta de audio en servidores sin GPU**: al estar probado solo en CPU con sherpa-onnx 1.13.8, encaja en pipelines de backoffice (transcripción de llamadas, archivo de podcasts) donde no hay aceleradores disponibles y el coste por hora de GPU es prohibitivo.
- **Prototipado rápido de productos de voz**: el formato ONNX y la API de tres ficheros permiten montar un servicio de transcripción en pocas líneas de Python antes de decidir si se migra al modelo NVIDIA original en precisión completa.
- **Verificación y auditoría de artefactos**: el desglose por fichero con hash permite a un equipo de plataforma validar cada descarga en CI y detectar corrupción o sustituciones en el espejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye WER, CER ni comparaciones con el modelo en precisión completa, y tampoco se documentan latencia ni throughput más allá de la nota de que se ha probado en CPU con sherpa-onnx 1.13.8.

## Requisitos de hardware

- **Almacenamiento**: ~0,4 GB para los tres grafos ONNX más el vocabulario (416,4 MB sumando los tamaños declarados).
- **Memoria RAM**: estimación por tamaño de artefacto, por debajo de 1 GB para los pesos; el consumo real de runtime no está documentado.
- **VRAM**: no disponible; el autor indica explícitamente que los execution providers de GPU no se han probado.
- **GPU recomendadas**: no disponible (sin datos de ejecución en GPU). Cualquier GPU compatible con ONNX Runtime CUDA/TensorRT sería teóricamente válida, pero requiere verificar el soporte del operador `MatMulNBits` en el EP correspondiente.
- **Consumer GPU**: no verificado. Por tamaño (~0,4 GB) cabría en cualquier GPU de consumo, pero no hay pruebas publicadas.
- **Opciones de despliegue**: sherpa-onnx 1.13.8 (API Python `OfflineRecognizer.from_transducer`, también disponible en C++, C#, Kotlin, Swift y WASM dentro del proyecto sherpa-onnx); ONNX Runtime con el operador contrib `com.microsoft` `MatMulNBits`. vLLM, llama.cpp, Ollama y TGI no aplican a este formato.
- **Latencia y throughput**: no disponibles. Solo se documenta que funciona en CPU; no hay cifras de RTF ni de audio procesado por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Cuantización / formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este espejo (`EmogheneAkpomedaye/sherpa-onnx-nemo-parakeet-redux`) | 0,6 B (base) | 25 | Ternaria 1,58 bits, encoder en `MatMulNBits` 4 bits; ONNX dividido en 3 grafos | CC BY 4.0 | Solo CPU probada; API sherpa-onnx; ~0,4 GB |
| `nvidia/parakeet-tdt-0.6b-v3` | 0,6 B | 25 | Pesos originales en precisión completa; formato NeMo (no disponible el detalle exacto) | CC BY 4.0 | Modelo de referencia; sin datos de tamaño en la información disponible |
| `moondream/parakeet-redux` | 0,6 B (base) | 25 | Ternaria 1,58 bits; formato no detallado en la información disponible | CC BY 4.0 | Versión ternaria upstream de la que deriva este espejo |
| `eschmidbauer/parakeet-redux-onnx` | 0,6 B (base) | 25 | ONNX con `MatMulNBits` de 4 bits | CC BY 4.0 (según la cadena de atribución) | Export ONNX previo al empaquetado sherpa-onnx |

No se dispone de datos de benchmarks que permitan comparar la calidad de transcripción (WER) entre estas variantes ni frente a alternativas de otros desarrolladores; la comparación anterior es exclusivamente de formato, tamaño y licencia.

## Limitaciones y advertencias

- **No es un modelo oficial de NVIDIA**: es un espejo de un empaquetado de terceros; ni NVIDIA, ni Moondream, ni eschmidbauer, ni Codyfederer respaldan este repositorio ni la app Cohearo.
- **Sin benchmarks de calidad**: no hay datos de WER que cuantifiquen la degradación introducida por la cuantización ternaria frente al modelo en precisión completa; en producción conviene medir sobre el dominio propio antes de adoptarlo.
- **Cobertura lingüística limitada a Europa**: 25 idiomas europeos; no incluye árabe, chino, japonés, coreano, hindi ni prácticamente ninguna lengua no europea.
- **Ejecución en GPU no verificada**: el autor solo ha probado CPU. Usar execution providers CUDA o TensorRT requiere validar el soporte de `MatMulNBits` y puede fallar o dar resultados distintos.
- **Dependencia estricta del runtime**: necesita una build de ONNX Runtime con el operador contrib `com.microsoft` `MatMulNBits`; runtimes recortados o alternativos no podrán cargar el encoder.
- **Alucinaciones y audio adverso**: como todo transducer ASR, puede producir texto plausible en segmentos con ruido, música o silencios largos; no se documentan mecanismos de detección de habla ni de confianza por segmento.
- **Sin diarización ni timestamps documentados**: no se especifica soporte de marcas temporales por palabra ni separación de hablantes.
- **Sesgos no evaluados**: al no documentarse la composición del corpus de entrenamiento de NVIDIA, no es posible caracterizar sesgos por acento, dialecto, edad o género.
- **Licencia CC BY 4.0**: permite uso comercial, pero exige atribución a NVIDIA, Moondream/M87 Labs, eschmidbauer y Codyfederer al redistribuir; se distribuye sin garantías (sección 5 de la licencia).
- **Repositorio sin tracción**: 0 descargas y 0 likes en el momento de la consulta, sin mantenimiento ni issues documentados; conviene fijar la revisión por hash sha256.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/EmogheneAkpomedaye/sherpa-onnx-nemo-parakeet-redux
- Modelo base (NVIDIA): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Versión ternaria upstream (Moondream / M87 Labs): https://huggingface.co/moondream/parakeet-redux
- Export ONNX (eschmidbauer): https://huggingface.co/eschmidbauer/parakeet-redux-onnx
- Empaquetado sherpa-onnx (Codyfederer): https://huggingface.co/Codyfederer/sherpa-onnx-nemo-parakeet-redux
- Aplicación Cohearo: https://cohearo.com
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Texto legal de la licencia: https://creativecommons.org/licenses/by/4.0/legalcode.en
