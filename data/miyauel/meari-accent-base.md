# Miyauel/meari-accent-base

## Resumen

Meari accent base es un paquete de recursos de sintesis de voz (TTS) publicado por Miyauel como parte del motor de voz local Meari, distribuido bajo licencia MIT. No se trata de un modelo de lenguaje ni de un TTS completo y autonomo, sino de la "base" compartida del lector de acentos regionales del coreano: contiene la etapa de sonido SoVITS de GPT-SoVITS v2ProPlus exportada a ONNX y un conjunto de valores de referencia precalculados para las diez voces integradas de la aplicacion. Cada region anade despues su propio paquete con el codificador de texto y la etapa GPT ajustados (por ejemplo, `Miyauel/meari-accent-gyeongsang`).

El paquete resuelve un problema concreto: permitir que una aplicacion de escritorio ejecute sintesis de voz con acento regional coreano en CPU, sin PyTorch y sin necesidad de cargar los modelos de caracteristicas de GPT-SoVITS en tiempo de ejecucion. Para ello, los valores de referencia (fonemas del texto de referencia, tokens semanticos, espectrograma y embedding de hablante) se calculan una sola vez y se distribuyen como ficheros `.npz`. El repositorio ocupa 0,4 GB y se ejecuta mediante ONNX Runtime.

Es relevante ahora por su enfoque de despliegue: empaqueta un pipeline TTS de dos etapas (GPT + SoVITS) en artefactos ONNX y datos precomputados, lo que reduce la huella de dependencias en produccion. Conviene subrayar que este repositorio concreto no incluye el modelo de lenguaje GPT ni el codificador de texto ajustado; solo la etapa SoVITS sin ajustar y los valores de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-SoVITS v2ProPlus; este repositorio contiene la etapa SoVITS (VITS) exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | coreano (ko), con acentos regionales |
| Licencia | other, con nombre `mit-and-openrail-m` (codigo y pesos GPT-SoVITS: MIT; valores de voz: OpenRAIL-M) |
| Formato de pesos | ONNX (`vits.onnx`) y NPZ (`voices/<voice>.npz`) |

## Arquitectura y entrenamiento

El pipeline subyacente es GPT-SoVITS v2ProPlus, un sistema TTS de dos etapas: una etapa GPT autorregresiva que predice tokens semanticos a partir de texto y referencia, y una etapa SoVITS (familia VITS) que convierte esos tokens en forma de onda. Este repositorio incluye unicamente `vits.onnx`, la etapa de sonido, exportada por Meari desde `s2Gv2ProPlus.pth` mediante `engine/spikes/dialect/gsv_onnx_export.py`, y sin ajuste fino: es identica para todas las regiones.

Los valores de voz de `voices/<voice>.npz` contienen los fonemas del texto de referencia, los tokens semanticos, el espectrograma y el embedding de hablante de las diez voces integradas. Las frases de referencia fueron pronunciadas por las voces predefinidas de Supertonic 3 y los valores se calcularon una vez con los modelos de caracteristicas de GPT-SoVITS, de modo que la aplicacion no necesita cargarlos. Los tokens semanticos se extrajeron con `chinese-hubert-base`, modelo que no se incluye en el repositorio. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre la composicion del dataset de los pesos preentrenados; el autor indica que los datos de entrenamiento de dichos pesos no se hacen publicos.

## Capacidades

- Sintesis de voz (text-to-speech) en coreano mediante ONNX Runtime sobre CPU.
- Generacion de audio con acento regional coreano cuando se combina con un paquete regional que aporte el codificador de texto y la etapa GPT ajustados.
- Diez voces integradas con valores de referencia precomputados (fonemas, tokens semanticos, espectrograma y embedding de hablante).
- Ejecucion sin PyTorch y sin los modelos de caracteristicas de GPT-SoVITS en tiempo de inferencia.
- No incluye tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No incluye vision, audio de entrada ni modo de razonamiento.
- Capacidad multilingue limitada al coreano.

## Casos de uso

- Lectura de texto con acento regional en una aplicacion de escritorio: el motor Meari carga `vits.onnx` y los valores de voz y sintetiza en CPU, lo que permite distribuir la aplicacion sin dependencias de GPU ni de PyTorch.
- Audiolibros y contenido narrado en coreano: las diez voces precalculadas permiten alternar narradores sin recalcular referencias en cada sesion.
- Accesibilidad y lectores de pantalla: la inferencia en CPU con ONNX Runtime facilita la integracion en entornos de escritorio donde no hay acelerador dedicado.
- Preservacion y ensenanza de variantes dialectales: al combinarse con paquetes regionales como `meari-accent-gyeongsang`, sirve para generar muestras de acento para materiales didacticos.
- Pruebas automatizadas de pipelines TTS: al ser artefactos ONNX deterministas y ligeros (repositorio de 0,4 GB), resultan adecuados para CI sin GPU.
- Prototipado de asistentes de voz locales: la etapa SoVITS exportada permite montar un sintetizador basico sobre el que anadir despues el codificador de texto y la etapa GPT de una region concreta.
- Generacion de avisos o locuciones pregrabadas en aplicaciones offline: el formato ONNX y los valores NPZ simplifican el empaquetado y la distribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU mediante ONNX Runtime; no requiere PyTorch ni GPU.
- VRAM estimada para inferencia: no disponible (el autor no publica cifras).
- GPU recomendadas: no disponible; el diseno apunta a ejecucion en CPU.
- Compatibilidad con GPU de consumo: no documentada.
- Opciones de despliegue: ONNX Runtime; el resto de opciones (vLLM, llama.cpp, Ollama, TGI) no aplican a un modelo TTS de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Meari accent base | TTS (etapa SoVITS ONNX + valores de voz) | no disponible | no aplica | MIT + OpenRAIL-M | HuggingFace (Miyauel/meari-accent-base) |
| GPT-SoVITS v2ProPlus (lj1995/GPT-SoVITS) | TTS completo (GPT + SoVITS) | no disponible | no aplica | MIT | HuggingFace (lj1995/GPT-SoVITS) |
| Supertonic 3 | TTS con voces predefinidas | no disponible | no aplica | OpenRAIL-M | HuggingFace (supertone-oss-archive/supertonic-3) |

La comparacion con otros sistemas TTS de la misma categoria (por ejemplo, Piper o Coqui TTS) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Este repositorio no es un TTS autonomo: carece del codificador de texto y de la etapa GPT; sin un paquete regional no genera voz por si mismo.
- La etapa SoVITS no esta ajustada y es identica para todas las regiones; la calidad del acento depende del paquete regional correspondiente.
- Los pesos preentrenados de GPT-SoVITS no divulgan sus datos de entrenamiento, lo que impide evaluar sesgos y procedencia.
- Los valores de voz derivan de las voces predefinidas de Supertonic 3 bajo OpenRAIL-M, cuyas restricciones se aplican: prohibicion de suplantacion de identidad y obligacion de declarar que la voz es generada por IA.
- Los tokens semanticos se extrajeron con `chinese-hubert-base`, entrenado sobre WenetSpeech, cuyos terminos limitan el uso a fines no comerciales; conviene revisar esta restriccion antes de un despliegue comercial.
- Riesgo de alucinacion acustica y artefactos de pronunciacion en textos fuera del dominio de referencia; no se documentan metricas de calidad (MOS, WER).
- Soporte limitado al coreano; no se documentan otros idiomas.
- No se publican cifras de latencia ni de rendimiento, lo que dificulta planificar capacity en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Miyauel/meari-accent-base
- Repositorio del motor Meari: https://github.com/Miyauel/Meari
- Paquete regional de ejemplo: https://huggingface.co/Miyauel/meari-accent-gyeongsang
- Pesos GPT-SoVITS v2ProPlus: https://huggingface.co/lj1995/GPT-SoVITS
- Codigo GPT-SoVITS: https://github.com/RVC-Boss/GPT-SoVITS
- Voces Supertonic 3 y licencia OpenRAIL-M: https://huggingface.co/supertone-oss-archive/supertonic-3/blob/main/LICENSE
