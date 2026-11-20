# centenohugo/context-not-grammar

## Resumen

`centenohugo/context-not-grammar` es un repositorio de pesos publicado en Hugging Face que contiene los artefactos de entrenamiento de un estudio comparativo entre un modelo LSTM y un modelo de lenguaje n-grama (KenLM 5-grama) sobre el corpus WikiText-103. No se trata de un modelo conversacional ni de un modelo listo para producción: es material reproducible de un experimento académico sobre modelado del lenguaje, empaquetado con checkpoints por campaña, tamano y semilla.

El repositorio incluye checkpoints de PyTorch (`best.pt` por mejor validación y `final.pt` tras 250 millones de tokens) organizados en una jerarquía `lstm/<campaign>/<size>/seed<N>/`, junto con ficheros de metadatos (`run.json`, `summary.json`) y un binario KenLM de 5-grama. El tokenizador subyacente es un BPE a nivel de byte con un vocabulario de 16.384 identificadores, segun indica la model card.

El interes del artefacto es fundamentalmente metodologico: permite reproducir y auditar una comparación entre arquitecturas recurrentes y modelos n-grama clasicos bajo un mismo pipeline de datos y tokenización. El repositorio ocupa 4,6 GB y no declara licencia, idiomas ni pipeline, lo que limita su uso directo fuera del contexto de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (red recurrente) y n-grama KenLM de 5-grama |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`best.pt`, `final.pt`) y binario KenLM (`model.bin`) |

## Arquitectura y entrenamiento

El repositorio contiene dos familias de modelos entrenadas sobre WikiText-103 con un tokenizador BPE a nivel de byte de 16.384 identificadores. La primera familia son LSTMs organizadas por campaña, tamano y semilla, con dos checkpoints por ejecución: `best.pt` (seleccionado por mejor validación) y `final.pt` (tras 250 millones de tokens procesados). La segunda familia es un modelo de lenguaje n-grama de orden 5 implementado con KenLM, distribuido como binario `model.bin` en `ngram/kenlm_5gram_train/`.

La model card no detalla el numero de capas, la dimension oculta, el numero de parametros ni la composicion exacta del dataset mas alla de WikiText-103. Tampoco se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un experimento de modelado del lenguaje puro. La innovacion tecnica del artefacto no reside en el modelo en si, sino en la estructura de experimentos (campanas, tamanos y semillas multiples) que permite analizar varianza entre inicializaciones y comparar directamente contra una linea base n-grama.

## Capacidades

- Modelado del lenguaje autoregresivo sobre texto tipo Wikipedia en ingles (WikiText-103), orientado a calculo de perplejidad y evaluacion de probabilidad de secuencias.
- Generacion de texto basica mediante decodificacion autoregresiva con el checkpoint LSTM, sin garantias de calidad conversacional.
- Puntuacion de secuencias con el modelo KenLM de 5-grama, util como linea base en tareas de rescoring o evaluacion de fluidez.
- Reproduccion de experimentos: los ficheros `run.json` y `summary.json` permiten auditar configuraciones y resultados por semilla.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles; el entrenamiento declarado se limita a WikiText-103.

## Casos de uso

- Reproduccion de experimentos academicos: cargar los checkpoints por semilla para replicar curvas de validacion y comparar LSTM frente a 5-grama bajo el mismo tokenizador BPE.
- Linea base en evaluacion de modelos: usar el KenLM de 5-grama para calcular perplejidad de referencia al evaluar modelos transformer en ingles.
- Estudio de varianza entre semillas: la jerarquia `seed<N>` permite analizar la estabilidad del entrenamiento y la sensibilidad a la inicializacion.
- Docencia en procesamiento del lenguaje natural: ilustrar la diferencia entre modelos recurrentes y n-grama con artefactos reales y metadatos de ejecucion.
- Analisis de tokenizacion: reutilizar el vocabulario BPE de 16.384 identificadores a nivel de byte para experimentos comparativos propios.
- Investigacion sobre scaling de tamano: las carpetas por `size` permiten estudiar el efecto del tamano del modelo manteniendo fijo el corpus y el tokenizador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamano concreto del checkpoint LSTM, que no se documenta.
- El repositorio completo ocupa 4,6 GB, pero el espacio necesario para inferencia es la suma de los checkpoints que se carguen, no el repo entero.
- GPU recomendadas: no disponible. Un LSTM de este tipo es probable que quepa en GPU consumer, pero no hay datos de parametros que lo confirmen.
- Despliegue: los checkpoints LSTM requieren PyTorch; el 5-grama requiere la libreria KenLM. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| centenohugo/context-not-grammar | LSTM + KenLM 5-grama | no disponible | WikiText-103, 250M tokens | no disponible | Hugging Face |
| GPT-2 small (referencia) | Transformer decoder | 1.024 tokens | WebText | MIT | Hugging Face |
| Modelos KenLM publicos de WikiText-103 | n-grama | no aplica | WikiText-103 | variable | Repos de terceros |

La comparación con GPT-2 small se incluye solo como referencia de categoria (modelado del lenguaje en ingles); no implica equivalencia de rendimiento ni de proposito. No se dispone de datos de benchmarks para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de produccion: carece de pipeline declarado, de instrucciones de uso y de evaluacion de calidad generativa.
- La licencia no esta declarada, lo que impide asumir permisos de uso comercial; hay que contactar con el autor antes de cualquier uso fuera de investigacion.
- El entrenamiento declarado se limita a WikiText-103, un corpus en ingles de articulos de Wikipedia; el sesgo y la cobertura linguistica estan acotados a ese dominio.
- Un modelo de 5-grama tiene capacidad de contexto muy limitada y tiende a producir texto localmente plausible pero globalmente incoherente.
- Los LSTMs presentan degradacion en dependencias de largo alcance y mayor coste secuencial que arquitecturas transformer.
- No hay informacion sobre filtrado de datos, deduplicacion ni evaluacion de sesgos.
- Riesgo de alucinacion: no aplica en el sentido conversacional, pero la generacion autoregresiva puede producir texto factualmente incorrecto sin mecanismo de verificacion.
- Los metadatos (`run.json`, `summary.json`) no estan descritos en la model card; su esquema debe inspeccionarse antes de automatizar su lectura.

## Enlaces

- Hugging Face: https://huggingface.co/centenohugo/context-not-grammar
- Codigo y resultados: https://github.com/dangpmcao/Transformer-LSTM-Comparison
