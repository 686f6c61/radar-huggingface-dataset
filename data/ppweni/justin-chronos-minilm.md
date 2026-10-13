# ppweni/justin-chronos-minilm

## Resumen

justin-chronos-minilm es un modelo especializado en responder preguntas de opcion multiple y de si/no sobre series temporales. Lo desarrolla el usuario ppweni y se publica como un adaptador entrenado (33 MB) que se apoya en dos backbones congelados: el encoder de series temporales amazon/chronos-2 y el encoder de texto sentence-transformers/all-MiniLM-L6-v2. En lugar de generar texto libre, el modelo elige una de las opciones que se le suministran (cabeza "Choice"), responde si/no (cabeza "Noul") o devuelve un nivel, siempre acompanado de probabilidades calibradas.

La motivacion del autor es evitar la alucinacion inherente a los modelos de lenguaje que "explican" series temporales: justin no puede producir una respuesta fuera de las opciones permitidas y expone su incertidumbre mediante probabilidades, de modo que un pipeline puede derivar los casos dudosos a revision humana o a un sistema de razonamiento mas lento. Esta disenado como un "System 1": responde de un vistazo, sin cadenas de razonamiento en texto.

Se trata de un modelo experimental de un solo entrenamiento (v0.1.0), orientado a investigacion, entrenado sobre cuatro tareas concretas (HAR, Sleep, ECG-QA y TSQA). No es un modelo de proposito general y su licencia lo restringe a uso no comercial. Su relevancia radica en ser un ejemplo de arquitectura hibrida multimodal (serie temporal + texto) de bajo coste para clasificacion y QA sobre senales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: encoder de series temporales Chronos-2 (congelado) + encoder de texto MiniLM (congelado) + cabeza de fusion por cross-attention con adaptadores LoRA |
| Parametros totales | no disponible (el artefacto entrenado pesa 33 MB; los backbones congelados se descargan aparte) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; precision no especificada) |
| Idiomas soportados | no disponible (las preguntas se formulan en texto; no se documenta cobertura linguistica) |
| Licencia | Solo uso no comercial en investigacion; no se concede licencia mas alla de eso. Chronos-2 y MiniLM son Apache-2.0 y se descargan por separado |
| Formato de pesos | safetensors |

Detalle adicional: LoRA de rango 8 sobre los 4 bloques superiores de 12 de Chronos-2, mas una ruta `signal_skip`. Revisions congeladas: Chronos-2 `29ec3766d36d6f73f0696f85560a422f50e8498c` y MiniLM `1110a243fdf4706b3f48f1d95db1a4f5529b4d41`.

## Arquitectura y entrenamiento

El modelo combina dos torres congeladas con una cabeza entrenada. Chronos-2 actua como encoder de la senal temporal (puede recibir multiples canales: `[canales, tiempo]`), mientras que MiniLM codifica la pregunta y las opciones de respuesta. Sobre esas representaciones se situa una cabeza de cross-attention que selecciona una opcion (Choice), responde si/no (Noul) o un nivel (Score). Los unicos elementos entrenados son las capas de fusion, las cabezas, la ruta `signal_skip` y los adaptadores LoRA (rango 8) sobre los 4 bloques superiores de los 12 de Chronos-2. El repositorio almacena unicamente ese material (33 MB); los backbones no se redistribuyen.

Los datos de entrenamiento provienen de las releases HAR-CoT, Sleep-CoT y ECG-QA-CoT de OpenTSLM (HAR, Sleep-EDF EEG y PTB-XL ECG-QA) y del dataset ChengsenWang/TSQA. No se especifica el numero de tokens ni la composicion exacta del corpus. El autor no menciona fases de RLHF o DPO; se trata de un unico entrenamiento supervisado, con temperaturas de calibracion por cabeza ajustadas y almacenadas en los metadatos del fichero. La innovacion principal es el diseno de eleccion restringida: el modelo no puede emitir una respuesta fuera de las opciones proporcionadas, y su salida incluye probabilidades calibradas para facilitar el escalado a revision humana.

## Capacidades

- Preguntas de opcion multiple sobre series temporales: devuelve una de las opciones suministradas con probabilidad asociada.
- Preguntas de si/no (cabeza "Noul") sobre propiedades de la senal, por ejemplo si esta subiendo.
- Estimacion de niveles (cabeza "Score").
- Salida de probabilidades calibradas por cabeza, apta para umbrales y derivacion de casos dudosos.
- Entrada multimodal: senal temporal multicanal mas pregunta en texto.
- Clasificacion de actividad humana (HAR), clasificacion de fases de sueno, QA sobre ECG y QA generico sobre series temporales (TSQA).
- No genera texto libre y no puede producir respuestas fuera de las opciones dadas.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning ni capacidades de vision o audio.

## Casos de uso

- QA de opcion multiple sobre senales de sensores: dado un tramo de telemetria y una lista de estados posibles, el modelo devuelve la clase mas probable con probabilidad, adecuado para etiquetado asistido en pipelines de monitorizacion industrial.
- Clasificacion de actividad humana (HAR): a partir de series de acelerometro/giroscopio, seleccionar entre actividades (caminar, sentarse, tumbarse) usando el formato Choice; se apoya en la ventana de senal multicanal para capturar patrones temporales.
- Analisis de fases de sueno sobre EEG (Sleep-EDF): asignar una fase a un tramo de senal con probabilidades calibradas; util como preetiquetado que un experto revisa despues.
- Preguntas binarias rapidas sobre forma de la senal: "¿esta subiendo?", "¿hay pico?", respondidas como True/False con P(yes), adecuado para disparadores de alerta en sistemas de monitorizacion.
- Triaje en QA sobre ECG (PTB-XL): el modelo responde preguntas de opcion multiple sobre el trazado; dado su balance-acc bajo (42,3 %), se usaria solo como capa de filtrado previo, no como diagnostico.
- Enrutado con incertidumbre: integrar el modelo como primer nivel "System 1" que resuelve los casos con probabilidad alta y escala el resto a un LLM de razonamiento o a un humano, reduciendo coste computacional en produccion.
- Investigacion sobre calibracion y arquitecturas hibridas serie-texto, dado que el repositorio expone temperaturas de calibracion y el diseno de fusion.

## Benchmarks y rendimiento

Resultados publicados por el autor para v0.1.0 sobre el split de test (una sola ejecucion; ruido de validacion de 1-2 puntos). Metricas en porcentaje: balanced accuracy, macro-F1 y accuracy.

| Tarea | n (test) | bal-acc | macro-F1 | acc | OpenTSLM F1 / acc* |
|---|---|---|---|---|---|
| HAR | 8.222 | 66,8 | 67,1 | 69,9 | 65,4 / 71,5 |
| Sleep | 2.765 | 72,8 | 68,0 | 92,3 | 69,9 / 81,1 |
| ECG-QA | 41.093 | 42,3 | 37,6 | 52,4 | 40,3 / 46,3 |
| TSQA | 4.793 | 99,8 | 99,8 | 99,8 | 97,5 / 97,5 |

\* Mejor variante de OpenTSLM por tarea (Langer et al., 2025). El autor advierte que la comparacion no es equivalente: OpenTSLM genera una justificacion antes de responder, mientras que justin selecciona entre opciones dadas. Solo HAR y ECG usan los splits originales de OpenTSLM; Sleep (por sujeto) y TSQA (por senal) usan splits definidos en el repositorio de codigo, y el test de Sleep esta muy desbalanceado.

## Requisitos de hardware

- El artefacto entrenado ocupa 33 MB; los backbones congelados (Chronos-2 y MiniLM-L6-v2) se descargan aparte al cargar el modelo.
- VRAM estimada: no disponible con precision, ya que depende del tamano de Chronos-2 y del lote. MiniLM-L6-v2 es un encoder pequeno (aproximadamente 22 M de parametros).
- GPU recomendadas: no disponibles; por el tamano de los componentes, es plausible que quepa en GPU de consumo (serie RTX), pero no hay confirmacion en la informacion proporcionada.
- Cabe en consumer GPU: no confirmado, aunque el perfil de memoria apunta a que es viable en GPUs de gama media si Chronos-2 es de escala pequena.
- Opciones de despliegue: paquete Python `justin` (`pip install "justin @ git+https://github.com/ppweni/justin@v0.1.0"`), que carga los pesos safetensors con `Justin.from_pretrained`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Naturaleza | Parametros | Contexto | Rendimiento (referencia) | Licencia |
|---|---|---|---|---|---|
| justin-chronos-minilm (este) | Encoder serie + texto con cabeza de eleccion | No disponible (adaptador 33 MB + backbones congelados) | No disponible | HAR bal-acc 66,8; Sleep 72,8; ECG-QA 42,3; TSQA 99,8 | Solo investigacion no comercial |
| OpenTSLM (Langer et al., 2025) | Modelo de lenguaje para razonamiento sobre series temporales y texto | No disponible | No disponible | HAR F1 65,4; Sleep 69,9; ECG-QA 40,3; TSQA 97,5 (mejor variante) | No disponible |
| Alternativas LLM genericas para QA sobre series | LLM de texto que razonan sobre la serie serializada | No disponible | No disponible | No disponible | No disponible |

La comparacion con OpenTSLM es la unica referencia directa aportada por el autor, aunque no es equivalente en metodologia (OpenTSLM genera justificacion; justin elige entre opciones). No se dispone de comparativas con otros modelos de clasificacion de series temporales en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado solo en cuatro tareas (HAR, Sleep, ECG-QA, TSQA); no se garantiza su comportamiento en otras senales, frecuencias de muestreo o tipos de pregunta.
- ECG-QA rinde de forma debil (42,3 % de balanced accuracy); en el resto de tareas el rendimiento es mayor pero no uniforme.
- Un unico entrenamiento y sin semillas; la mejora de pasar de 2 a 4 bloques LoRA queda dentro del ruido de validacion.
- No es un dispositivo medico y no esta validado para uso clinico.
- Licencia restrictiva: pesos solo para investigacion no comercial; el uso comercial no esta permitido. Los datasets de origen tienen sus propios terminos, que pueden limitar el uso a investigacion no comercial y aplicar tambien a los modelos entrenados con ellos. No se concede ninguna licencia adicional.
- Riesgo de error: el propio autor reconoce que el modelo puede equivocarse; los resultados de test muestran la frecuencia.
- Dependencia de las opciones suministradas: si la respuesta correcta no esta entre las opciones, el modelo no puede emitirla; el texto de la pregunta debe aportar todo el contexto necesario.
- Cobertura linguistica no documentada.
- Los sesgos conocidos no estan documentados en la informacion proporcionada.
- Para produccion, la salida debe tratarse como una probabilidad calibrada sujeta a umbral, no como una verdad absoluta.

## Enlaces

- HuggingFace: https://huggingface.co/ppweni/justin-chronos-minilm
- Coleccion de modelos Justin: https://huggingface.co/collections/ppweni/justin
- Codigo: https://github.com/ppweni/justin
- Version del codigo: https://github.com/ppweni/justin@v0.1.0
- Modelo base Chronos-2: https://huggingface.co/amazon/chronos-2
- Modelo base MiniLM: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset TSQA: https://huggingface.co/datasets/ChengsenWang/TSQA
- Paper de referencia OpenTSLM (Langer et al., 2025): no disponible como enlace directo en la informacion proporcionada
