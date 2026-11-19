# junmo-k/glide-9b-ane

## Resumen

GLiDE-9B para ANERun es una conversión independiente del modelo de decisión GLiDE-9B de Fastino, empaquetada en FP16 para ejecutarse localmente sobre la Apple Neural Engine (ANE) mediante el runtime ANERun. No es un modelo generativo de texto al uso: recibe un estado y un conjunto de preguntas con respuestas candidatas, y devuelve decisiones junto con las probabilidades asociadas a cada candidata. El paquete incluye tokenizador, tablas de búsqueda, backbone recurrente y readout de dispositivo, y está pensado para instalarse y servirse con el comando `anerun serve`.

El modelo base es fastino/GLiDE-9B, que a su vez se apoya en componentes Qwen3.5-9B (bajo licencia Apache 2.0). La conversión la firma el usuario junmo-k y se distribuye bajo la licencia comunitaria de Fastino (fastino-community), que exige atribución en uso comercial y un acuerdo separado para uso comercial en producción por encima de un umbral de ingresos anuales.

Su relevancia actual es doble: por un lado, demuestra la viabilidad de ejecutar un modelo de 9B en la Neural Engine de Apple Silicon con fidelidad numérica muy alta respecto al original; por otro, ofrece un runtime portable (`anerun models install`) que abstrae la compilación de grafos y la verificación de colocación en la ANE. El repositorio ocupa 15,9 GB y el instalador descarga aproximadamente 15,88 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone recurrente (recurrent backbone) con tokenizador, tablas de búsqueda y readout de dispositivo; componentes base Qwen3.5-9B |
| Parametros totales | 9B (según nombre y modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (paquete fuente); no se documentan otras |
| Idiomas soportados | no disponible |
| Licencia | fastino-community (derivada); componentes Qwen3.5-9B bajo Apache 2.0 |
| Formato de pesos | Paquete fuente FP16 para ANERun (tokenizer, lookup tables, backbone, readout); no se especifica safetensors/GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla el entrenamiento del modelo base. Lo que sí se documenta es la arquitectura de ejecución: el paquete para ANERun contiene un tokenizador, tablas de búsqueda (lookup tables), un backbone recurrente y un readout de dispositivo. El instalador compila los grafos fuente para el dispositivo, verifica la colocación en la ANE y prepara el modelo; en el Mac de prueba se validaron 96 assets fuente y 136 funciones ANE.

El modelo es un "decision model": no genera texto libre, sino que, dado un estado y preguntas con respuestas candidatas, produce decisiones y probabilidades por candidata. La conversión se validó con seis entradas fijas contra el checkpoint original fijado (commit `ab54df5`), reproduciendo las decisiones y los recuentos de tokens en las doce respuestas (seis en frío y seis en caliente). La diferencia absoluta máxima en probabilidad de candidata fue de 0,000339 (0,0339 puntos porcentuales).

## Capacidades

- Toma de decisiones sobre respuestas candidatas: devuelve la decisión seleccionada y la probabilidad de cada candidata.
- Ejecución local en Apple Silicon sobre la Neural Engine mediante ANERun.
- Instalación portable con `anerun models install` y servicio con `anerun serve`.
- Reproducibilidad: permite fijar la revisión (commit) para repetir una instalación idéntica.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio, tool calling ni agentes multi-paso.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Clasificación y selección de respuestas en pipelines de decisión: dado un estado y un conjunto de candidatas, el modelo elige y puntúa; encaja en sistemas de enrutamiento o desambiguación donde se necesita una probabilidad calibrada por opción.
- Evaluación de políticas de decisión en local: al ejecutarse en la ANE de un Mac Studio, permite iterar sobre lógicas de decisión sin depender de la nube ni de GPUs dedicadas.
- Prototipado de agentes con componente de decisión: se puede integrar como módulo que selecciona entre acciones candidatas generadas por otro componente, aprovechando la salida probabilística.
- Validación de fidelidad de conversiones: el paquete sirve como referencia para comparar decisiones y probabilidades frente al checkpoint original de Fastino en un conjunto fijo de entradas.
- Despliegue en estaciones de trabajo Apple: equipos con Mac Studio `h17d` pueden servir el modelo localmente con latencias en caliente de ~0,51 s por petición.
- Investigación sobre ejecución en ANE: útil para estudiar la colocación de grafos, el rendimiento en frío frente a caliente y la portabilidad del runtime ANERun.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea en la información disponible. La model card remite al checkpoint original para las evaluaciones de tarea del modelo. Los únicos datos medidos son de fidelidad y latencia de la conversión:

| Metrica | Valor |
|---|---|
| Entradas de comparación | 6 fijas (frío y caliente) |
| Respuestas reproducidas | 12 de 12 (decisiones y recuentos de tokens idénticos) |
| Diferencia máxima absoluta en probabilidad | 0,000339 (0,0339 pp) |
| Latencia primera petición | 1,08–1,39 s |
| Latencia en caliente | 0,506–0,523 s |
| Assets fuente verificados | 96 |
| Funciones ANE verificadas | 136 |
| Descarga del instalador | ~15,88 GB |

## Requisitos de hardware

- Plataforma cualificada: Mac Studio `h17d`, macOS 27, Xcode 27.1 y Metal Toolchain opcional.
- Almacenamiento: ~15,88 GB de descarga más espacio adicional para assets derivados y caché nativa.
- Memoria: no disponible de forma explícita; el paquete FP16 de 9B requiere capacidad suficiente para el modelo y los assets derivados.
- GPU: no aplica; la ejecución está orientada a la Apple Neural Engine, no a GPUs NVIDIA/AMD.
- Cabe en consumer hardware Apple Silicon cualificado (Mac Studio de prueba); no se documentan otros equipos compatibles.
- Despliegue: runtime ANERun (build con instalación portable de modelos de decisión, probado con la release candidate 0.3.0); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 1,08–1,39 s en frío y 0,506–0,523 s en caliente, excluyendo instalación y preparación. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| junmo-k/glide-9b-ane | 9B | no disponible | Paquete FP16 para ANERun (ANE) | fastino-community | Conversión validada con diferencia máxima de 0,000339 en probabilidad |
| fastino/GLiDE-9B (original) | 9B | no disponible | Checkpoint original | fastino-community | Referencia de fidelidad; aloja las evaluaciones de tarea |
| Qwen3.5-9B (componente base) | 9B | no disponible | no disponible | Apache 2.0 | Componentes subyacentes del modelo |

No se dispone de datos de rendimiento comparado con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de decisión, no generativo: no debe esperarse generación de texto libre ni razonamiento abierto.
- Fidelidad validada solo sobre seis entradas fijas; no hay garantía de comportamiento equivalente al original en dominios no cubiertos por esa muestra.
- Compatibilidad hardware restringida: plataforma cualificada Mac Studio `h17d` con macOS 27 y Xcode 27.1; otros equipos no están documentados.
- Licencia fastino-community: exige atribución en uso comercial y un acuerdo separado para uso comercial en producción por encima del umbral de ingresos anuales de la licencia.
- Los componentes Qwen3.5-9B conservan Apache 2.0; conviene revisar NOTICE y la licencia Qwen incluida.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingüe.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- La instalación requiere espacio adicional en disco para assets derivados y caché nativa; el instalador compila grafos por dispositivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/junmo-k/glide-9b-ane
- Modelo base: https://huggingface.co/fastino/GLiDE-9B
- Checkpoint original fijado: https://huggingface.co/fastino/GLiDE-9B/tree/ab54df5acba0eebf7df45560ffdaacd64e32df3b
- Proyecto ANERun: https://github.com/junmo-kim/ANERun
- Licencia (en el repo): LICENSE
- Aviso de conversión (en el repo): NOTICE
- Licencia Qwen base (en el repo): licenses/Qwen3.5-9B-LICENSE
