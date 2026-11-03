# shangxuan-saxon/SimLlama

## Resumen

SimLlama M1 es un modelo de generacion de musica simbolica (MIDI) desarrollado por Shangxuan Luo, Zixun Guo, Jinjie Shi y Joshua Reiss en el Centre for Digital Music de la Queen Mary University of London, publicado en 2026. El modelo resuelve un problema concreto de la generacion musical condicionada: dado un fragmento de contexto, genera una seccion nueva con un grado de similitud controlado mediante etiquetas explicitas (`sim:high`, `sim:mid`, `sim:low`). Esta condicion por etiqueta de similitud es la aportacion central frente a los modelos de continuacion musical al uso, que no ofrecen un control tan directo sobre cuanto material nuevo se parece al contexto.

Tecnicamente, SimLlama M1 parte de Moonbeam 839M, un modelo fundacional de MIDI preentrenado bajo licencia Apache-2.0, y lo ajusta mediante adaptadores LoRA. El repositorio ocupa 3,4 GB y el checkpoint publicado es `best.pt`, distribuido en formato PyTorch. La condicion de entrada combina la etiqueta de similitud con un vector de contexto que resume la seccion de referencia.

El modelo esta pensado para investigacion en generacion musical simbolica controlable y como linea base para la generacion de secciones de musica de videojuegos. Su dominio de entrenamiento es estrecho (transcripciones para piano de una unica saga, Super Mario) y los propios autores advierten de que las salidas requieren revision humana antes de cualquier uso publico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Moonbeam 839M) con adaptadores LoRA; generacion simbolica MIDI |
| Parametros totales | 839M (modelo base Moonbeam); parametros del adaptador LoRA no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (contexto expresado como vector de resumen de la seccion, no como ventana de tokens documentada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo musical; no procesa lenguaje natural) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`best.pt`, sha256 `e7542e1c1923cef4b6e1073d54ad15f10656689add328f9c6a0bccb9057834a8`) |

## Arquitectura y entrenamiento

SimLlama M1 es un ajuste fino con LoRA sobre Moonbeam 839M, un modelo fundacional de musica simbolica preentrenado. La condicion de generacion consta de dos elementos: una etiqueta de similitud discreta (`sim:high`, `sim:mid`, `sim:low`) y un vector de contexto que resume la seccion de referencia. La configuracion exacta de entrenamiento esta documentada en `scripts/slurm/train.sh` y `configs/simllama_839M.json` del repositorio de codigo.

El entrenamiento utiliza pares de secciones extraidos de 334 piezas de Super Mario transcritas por NinSheetMusic, lo que da 3.304 pares dirigidos (2.398 de entrenamiento, 478 de validacion y 428 de prueba). Las anotaciones de estructura se generaron con Gemini 3.1 Pro y se validaron contra dos anotadores humanos en 49 piezas. La etiqueta de cada par corresponde al tercil de su similitud compuesta (CS): `sim:high` a partir de 0,78 y `sim:low` por debajo de 0,60. No se documentan fases de RLHF ni DPO; el ajuste es supervisado sobre pares etiquetados.

## Capacidades

- Generacion de musica simbolica en formato MIDI a partir de una seccion de contexto.
- Control explicito del grado de similitud respecto al contexto mediante etiquetas (`sim:high`, `sim:mid`, `sim:low`).
- Condicionamiento sobre un vector de resumen de la seccion de contexto, no sobre texto en lenguaje natural.
- Generacion de secciones musicales de longitud alineada con el contexto (la salida se trunca a la longitud del contexto en el postprocesado).
- Especializacion en musica de videojuegos de estilo piano, derivada de su dominio de entrenamiento.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en generacion musical simbolica controlable: el modelo sirve para estudiar como varia el material musical en funcion de una etiqueta de similitud, con un protocolo de evaluacion reproducible mediante `bash scripts/eval/run_all.sh --analyses`.
- Linea base para generacion de secciones de musica de videojuegos: util para comparar metodos de continuacion y variacion tematica en un dominio acotado como el de las transcripciones de Super Mario.
- Prototipado de variaciones tematicas en diseno de niveles: dado un tema existente, generar variantes de alta, media o baja similitud para explorar como suena el mismo material con mayor o menor grado de reutilizacion.
- Experimentos de similitud musical: el modelo permite generar pares contexto-salida con grado de similitud conocido para entrenar o validar metricas de similitud simbolica (melodia, chroma, ritmo, duracion de nota).
- Estudios de percepcion musical: las salidas etiquetadas permiten construir estimulos controlados para pruebas de escucha sobre percepcion de similitud, como la realizada con 26 oyentes en el paper.
- Docencia y demostraciones de generacion simbolica: el checkpoint y el codigo de evaluacion en CPU facilitan reproducir resultados en entornos sin GPU dedicada.

## Benchmarks y rendimiento

La evaluacion publicada no emplea benchmarks estandar de NLP ni de generacion musical general, sino un protocolo propio sobre 157 contextos de prueba con seis salidas por contexto y etiqueta, medido con doce medidas de similitud simbolica.

| Aspecto evaluado | Resultado reportado |
|---|---|
| Medidas de similitud simbolica | Doce medidas; las salidas solicitadas como similares son mas similares a su contexto que las solicitadas como disimiles, y no a otras piezas |
| Significacion estadistica | Las cuatro medidas principales (melodia, chroma, ritmo y duracion de nota) siguen siendo significativas tras correccion por comparaciones multiples |
| Comparacion sin etiqueta | Frente a un modelo identico sin etiqueta, solo la peticion `sim:high` produce salidas mas similares |
| Prueba de escucha | 26 oyentes, 20 superaron ambos controles de atencion; las valoraciones de similitud (escala 0-100) siguieron mas de cerca el solapamiento melodico con el contexto |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, lo cual es esperable en un modelo de musica simbolica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentacion; un modelo de 839M en precision completa requiere del orden de 3,4 GB solo para pesos, mas memoria para activaciones y el codigo de generacion.
- GPU recomendadas: no especificadas por los autores; por tamano, el modelo es viable en GPUs de consumo con VRAM suficiente.
- GPU de consumo: previsiblemente cabe en tarjetas con 8 GB o mas en precision reducida, aunque no se documenta soporte de cuantizacion.
- Opciones de despliegue: carga mediante el repositorio de codigo (`scripts/utils/checkpoint_loader.py` y `configs/simllama_839M.json`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.
- La evaluacion (`scripts/eval/run_all.sh --analyses`) puede ejecutarse en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Control de similitud | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimLlama M1 | 839M (base) + LoRA | no disponible | Si, por etiqueta (`sim:high/mid/low`) | Apache-2.0 | Checkpoint `best.pt` + repositorio de codigo |
| Moonbeam 839M | 839M | no disponible | No documentado | Apache-2.0 | Modelo fundacional MIDI preentrenado |
| Alternativas de generacion MIDI condicionada por texto | no disponible | no disponible | No disponible | no disponible | no disponible |

La informacion disponible solo permite comparar con el modelo base Moonbeam 839M, del que SimLlama hereda arquitectura y tamano y al que anade el condicionamiento por etiqueta de similitud mediante LoRA. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- `sim:mid` no constituye un nivel separado: el efecto observado se situa entre `sim:high` y las otras etiquetas, sin un comportamiento propio diferenciado.
- Riesgo de restatement: en melodia, la diferencia entre etiquetas proviene principalmente de una repeticion mas frecuente de la melodia del contexto, por lo que las salidas `sim:high` pueden copiar partes del contexto.
- La metrica que define las etiquetas (CS) no incluye componente melodico; el control de la melodia se deriva del contexto y no de la metrica de etiquetado.
- Dominio muy estrecho: entrenado solo con transcripciones para piano de una unica saga (Super Mario); otros estilos, instrumentos y longitudes no han sido probados.
- Las salidas requieren correccion: el MIDI generado pasa por `scripts/eval/correct_generated_output.py` (repara notas de un tick y trunca a la longitud del contexto) antes de evaluarse.
- Los datos de entrenamiento son transcripciones de fans de musica comercial de videojuegos; las salidas que reproducen el contexto reutilizan material de esa pieza.
- Uso previsto exclusivamente de investigacion; no se recomienda publicar musica generada sin revision humana.
- No se documentan sesgos especificos, riesgos de alucinacion en el sentido de modelos de lenguaje, ni limitaciones de idioma, al no ser un modelo linguistico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shangxuan-saxon/SimLlama
- Repositorio de codigo, entrenamiento y evaluacion: https://github.com/ShxLuo-Saxon/simllama
- Dataset de estructura de Super Mario: https://github.com/ShxLuo-Saxon/supermario-structure-dataset
- Paper (preprint): https://arxiv.org/abs/2611.01047
- Modelo base Moonbeam: https://huggingface.co/guozixunnicolas/moonbeam-midi-foundation-model
