# arach/parakeet-coreml-recipe

## Resumen

`arach/parakeet-coreml-recipe` no es un modelo de pesos en sentido estricto, sino un repositorio de recetas (cuatro scripts) para convertir el checkpoint ASR `nvidia/parakeet-tdt-0.6b-v3` a formato Core ML y ejecutarlo sobre el Neural Engine de los chips Apple Silicon. El autor, `arach`, publica el pipeline completo junto con el modelo convertido en `arach/parakeet-tdt-0.6b-v3-coreml`, una carpeta de 477 MB que corre en el motor neuronal de macOS.

El problema que resuelve es la brecha de despliegue: NeMo y PyTorch no aprovechan el Neural Engine en Mac, mientras que Core ML sí, pero la conversion de un modelo TDT (transducer con decodificacion *token-and-duration*) requiere trocear el grafo en cuatro componentes trazables y comprimir el encoder. La receta documenta ese proceso paso a paso, incluyendo la verificacion numerica contra NeMo y el calculo de WER sobre LibriSpeech.

Es relevante para desarrolladores que quieran inferencia ASR local y de baja latencia en Apple Silicon sin depender de servicios en la nube. El modelo base tiene 0,6 mil millones de parametros, se distribuye bajo CC-BY-4.0 y los scripts de conversion bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (token-and-duration transducer) sobre encoder Conformer, exportado a Core ML en cuatro componentes |
| Parametros totales | 0,6 mil millones (modelo base `nvidia/parakeet-tdt-0.6b-v3`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; el pipeline de ejemplo procesa audios de 16 kHz de menos de 15 segundos |
| Tipos de cuantizacion | compresion del encoder a paletas de 6 bits; el resto de pesos en formato Core ML nativo |
| Idiomas soportados | no disponibles en la informacion proporcionada |
| Licencia | MIT para los scripts; CC-BY-4.0 para el modelo base y el modelo convertido |
| Formato de pesos | Core ML (`.mlpackage` / carpeta compilada); checkpoint original en NeMo |

## Arquitectura y entrenamiento

El modelo subyacente es Parakeet TDT 0.6B v3 de NVIDIA, un sistema de reconocimiento de voz basado en un encoder Conformer acoplado a un decodificador transducer con prediccion conjunta de token y duracion (TDT). La receta no reentrena ni hace fine-tuning: parte del checkpoint publicado por NVIDIA y lo transforma. `export.py` descarga el checkpoint, traza cuatro piezas independientes a TorchScript y guarda tensores de referencia; `build.py` convierte esos trazados a Core ML y comprime el encoder a paletas de 6 bits mediante clustering de pesos, lo que constituye la unica "cuantizacion" del pipeline.

La innovacion tecnica destacable es de ingenieria de despliegue, no de modelado: el script fuerza el trazado en modo evaluacion. NeMo deja el encoder en modo entrenamiento tras `transcribe()`, y trazar en ese estado graba dropout y estadisticas de batch, degradando la concordancia con NeMo a 0,74 en lugar de 1,0. `export.py` traza primero y verifica que ninguna parte del modelo siga en modo entrenamiento. La validacion se completa con `check.py` (comparacion numerica pieza a pieza contra NeMo) y `score.py` (WER sobre `LibriSpeech/test-clean` con `jiwer`). No se documentan datos de entrenamiento, composicion del dataset ni etapas de RLHF/DPO, ya que corresponden al modelo original de NVIDIA y no se detallan en esta receta.

## Capacidades

- Reconocimiento automatico de voz (*speech-to-text*) en ingles sobre audios de 16 kHz, segun el flujo de evaluacion con `LibriSpeech/test-clean`.
- Ejecucion sobre el Neural Engine de Apple Silicon mediante Core ML, con compilacion del encoder en el primer arranque (unos 90 segundos) y cargas posteriores en menos de dos segundos.
- Verificacion de equivalencia numerica frente a la implementacion de referencia en NeMo.
- Medicion de tasa de error de palabra (WER) integrada en el pipeline mediante `jiwer`.
- Conversion reproducible del checkpoint original a un artefacto desplegable de 477 MB.
- No se documentan capacidades de *tool calling*, agentes, vision, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Transcripcion local en aplicaciones de macOS: el modelo Core ML se integra en apps nativas y aprovecha el Neural Engine, evitando enviar audio a servicios externos y reduciendo coste por inferencia a cero tras el despliegue.
- Dictado en tiempo real en herramientas de escritorio: la carga en menos de dos segundos tras el primer arranque permite inicializar el motor de transcripcion al abrir la aplicacion sin penalizacion perceptible.
- Procesamiento por lotes de audios cortos: el pipeline de ejemplo esta pensado para grabaciones de 16 kHz de menos de 15 segundos, adecuado para notas de voz, clips de reunion o comandos.
- Evaluacion de calidad de modelos ASR: `score.py` calcula WER sobre `LibriSpeech/test-clean`, util para comparar variantes de cuantizacion o versiones del checkpoint antes de desplegar.
- Portabilidad de pipelines NeMo a produccion en Mac: equipos que ya entrenan o ajustan con NeMo pueden reutilizar esta receta para generar artefactos Core ML verificados numericamente.
- Reproducibilidad y auditoria: los tensores de referencia y `check.py` permiten certificar que la conversion no altera las salidas, requisito habitual en entornos regulados.
- Desarrollo de demos y prototipos en portatiles: el flujo completo se ejecuta en un M2 MacBook Air, sin GPU dedicada ni infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona que `score.py` transcribe `LibriSpeech/test-clean` y reporta el WER, pero no incluye la cifra obtenida. Tampoco se proporcionan metricas de latencia o throughput mas alla de los tiempos de compilacion y carga del encoder en un M2 MacBook Air (aproximadamente 20 minutos de conversion, 90 segundos de compilacion inicial y menos de 2 segundos en cargas posteriores).

## Requisitos de hardware

- El modelo convertido ocupa 477 MB en disco; la VRAM equivalente es la memoria unificada del chip Apple, con una huella no especificada en la informacion disponible.
- Ejecucion verificada en un M2 MacBook Air con macOS 15 o posterior.
- Requiere Neural Engine: chips de la familia Apple Silicon (M1 en adelante). No esta pensado para GPU NVIDIA ni AMD.
- El paso 1 (`export.py`) puede ejecutarse en cualquier maquina donde se instale NeMo, incluido Linux; los pasos 2 a 4 requieren un Mac.
- Despliegue mediante Core ML directamente o a traves de frameworks Apple (Vision, Speech) que consuman el `.mlpackage`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / runtime | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `arach/parakeet-coreml-recipe` (sobre Parakeet TDT 0.6B v3) | 0,6 B | Core ML, Neural Engine | clips de menos de 15 s en el ejemplo | MIT (scripts) / CC-BY-4.0 (modelo) | Hugging Face, 0 descargas |
| `nvidia/parakeet-tdt-0.6b-v3` (original) | 0,6 B | NeMo / PyTorch | no disponible | CC-BY-4.0 | Hugging Face (NVIDIA) |
| `openai/whisper-large-v3` | 1,55 B | PyTorch, GGUF, Core ML (comunidad) | 30 s por ventana | MIT | Hugging Face, ampliamente desplegado |
| `openai/whisper-small` | 244 M | PyTorch, GGUF, Core ML (comunidad) | 30 s por ventana | MIT | Hugging Face, ampliamente desplegado |

La comparativa con Whisper se ofrece como referencia de categoria (ASR open source); no se dispone de datos de rendimiento comparables entre ambos en la informacion proporcionada.

## Limitaciones y advertencias

- La receta no incluye pesos propios: es un conjunto de scripts; para usar el modelo hay que descargar el checkpoint de NVIDIA y ejecutar la conversion.
- El flujo de ejemplo asume audios de 16 kHz de menos de 15 segundos; no se documenta el comportamiento con audios largos ni con streaming continuo.
- Solo se evalua sobre `LibriSpeech/test-clean`, un corpus de ingles leido y relativamente limpio; el rendimiento en audio con ruido, acentos o dominios especificos no esta documentado.
- Los idiomas soportados no se detallan en la informacion disponible; no debe asumirse multilingueismo sin verificar la model card del modelo base.
- Riesgo de alucinacion y sesgos: no documentados en esta receta; son atribuibles al modelo base de NVIDIA y deben consultarse en su model card.
- La licencia CC-BY-4.0 del modelo exige atribucion en usos derivados y comerciales; los scripts MIT no imponen esa condicion, pero el artefacto convertido hereda la del modelo base.
- La conversion esta atada a versiones concretas: Python 3.11 o 3.12, `nemo_toolkit[asr]` 3.0.0, `torch` 2.7.0 y `coremltools` 9.0; cambios de version pueden romper el trazado o la equivalencia numerica.
- Trazar en modo entrenamiento degrada la fidelidad a 0,74 frente a NeMo; es imprescindible respetar el orden de `export.py`.
- Dependencia de macOS 15 o posterior y de Neural Engine; no hay soporte para otras plataformas.

## Enlaces

- Repositorio de la receta: https://huggingface.co/arach/parakeet-coreml-recipe
- Modelo Core ML convertido: https://huggingface.co/arach/parakeet-tdt-0.6b-v3-coreml
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Tutorial paso a paso: https://talkie.to/blog/parakeet-recipe
