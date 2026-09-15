# ghostoverflow/Phi-4-reasoning-Q8_0-GGUF

## Resumen

`ghostoverflow/Phi-4-reasoning-Q8_0-GGUF` es una conversion a formato GGUF del modelo `microsoft/Phi-4-reasoning`, publicada por el usuario ghostoverflow. No se trata de un modelo entrenado desde cero, sino de una cuantizacion en Q8_0 generada con llama.cpp a traves del espacio GGUF-my-repo de ggml.ai, pensada para ejecutar el modelo en llama.cpp, Ollama u otros runners compatibles con GGUF sin necesidad de disponer del checkpoint original en safetensors.

El modelo subyacente es un transformer de aproximadamente 14.659.507.200 parametros (unos 14,7 mil millones), orientado a razonamiento, matematicas, generacion de codigo y conversacion. La model card declara ingles como unico idioma soportado, licencia MIT y una temperatura de inferencia recomendada de 0, lo que apunta a un uso centrado en tareas de razonamiento con decodificacion determinista.

Su relevancia practica es la de facilitar el despliegue local: el checkpoint original requiere un stack de transformers y pesos en safetensors, mientras que esta version Q8_0 (~15,6 GB de repositorio) se puede cargar directamente con llama.cpp mediante `--hf-repo` o desde un servidor local. Es, por tanto, una pieza de infraestructura para inferencia local mas que una contribucion de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (derivada del modelo base microsoft/Phi-4-reasoning) |
| Parametros totales | 14.659.507.200 (~14,7 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado en este repositorio) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (`phi-4-reasoning-q8_0.gguf`); el modelo base esta en safetensors |
| Tamano del repositorio | 15,6 GB |
| Pipeline | text-generation |
| Libreria declarada | transformers |
| Temperatura recomendada | 0 |

## Arquitectura y entrenamiento

Esta ficha describe una cuantizacion, no un entrenamiento. El repositorio no aporta informacion sobre la arquitectura interna, el volumen de tokens de entrenamiento, la composicion del dataset ni sobre si el modelo base utilizo RLHF, DPO u otras tecnicas de alineamiento. La model card remite explicitamente a la documentacion del modelo original, `microsoft/Phi-4-reasoning`, para cualquier detalle de este tipo.

El unico detalle tecnico propio de este repositorio es el proceso de conversion: los pesos originales en safetensors se transformaron a GGUF con llama.cpp a traves del espacio GGUF-my-repo, aplicando la cuantizacion Q8_0. Se trata de una cuantizacion de 8 bits por bloque, la opcion de mayor fidelidad respecto al modelo original dentro del catalogo habitual de llama.cpp, con una perdida de calidad esperada muy baja en comparacion con cuantizaciones de 4 o 5 bits.

## Capacidades

- Generacion de texto y respuestas conversacionales en ingles, con etiquetas de chat y conversational en el repositorio.
- Razonamiento explicito: la nomenclatura `reasoning` del modelo base y la temperatura recomendada de 0 indican un uso orientado a tareas de deduccion con salida determinista.
- Matematicas: la etiqueta `math` aparece tanto en la metadata del repositorio como en la model card; el widget de ejemplo pide la derivada de x^2.
- Generacion de codigo: etiqueta `code` declarada en la metadata.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada, aunque el enfoque de razonamiento del modelo base es compatible con ese tipo de flujos.
- Capacidades multilingues: limitadas al ingles segun el campo `language` del repositorio.
- Capacidades especiales (vision, audio, modo thinking explicito): no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia local en estaciones de trabajo sin GPU de datacenter: al estar en GGUF, el modelo se puede ejecutar con llama.cpp en CPU o con offload parcial a GPU, lo que permite trabajar con un modelo de ~14,7 B sin depender de servicios en la nube.
- Asistente de razonamiento matematico en cuadernos tecnicos: la combinacion de las etiquetas `math` y `reasoning` y la temperatura 0 lo hace adecuado para resolver problemas paso a paso de forma reproducible, por ejemplo en la validacion de ejercicios o en la generacion de explicaciones derivadas de un enunciado.
- Generacion y revision de codigo en flujos locales: integrable mediante `llama-server` como endpoint compatible con la API de OpenAI, lo que permite conectarlo a editores o scripts de revision sin exponer codigo a terceros.
- Chat conversacional de dominio tecnico en ingles: con historial de mensajes en formato chat, sirve como base para asistentes internos donde la privacidad del texto es un requisito.
- Prototipado y evaluacion comparativa de cuantizaciones: al ser una conversion Q8_0, es util como referencia de alta fidelidad para medir la degradacion de otras cuantizaciones (Q4_K_M, Q5_K_M) sobre el mismo modelo base.
- Despliegue en equipos con una sola GPU de consumo alta: con ~15,6 GB de pesos, entra en GPUs de 24 GB de VRAM dejando margen para el contexto, lo que habilita un servidor de inferencia personal o de pequeno equipo.
- Experimentacion educativa con llama.cpp: el repositorio incluye los comandos exactos de CLI y servidor, lo que lo convierte en un punto de partida sencillo para aprender a desplegar modelos GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, GSM8K, HumanEval ni metricas equivalentes, y tampoco se han recuperado resultados de busqueda relevantes para este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos Q8_0 ocupan aproximadamente 15,6 GB; con cache KV y overhead del runtime conviene prever del orden de 17-20 GB para contextos moderados. Cifra estimada a partir del tamano del repositorio, no publicada por el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano de pesos, encajan GPU de 24 GB o mas (por ejemplo RTX 3090/4090, A10G, L40S, A100 40/80 GB, H100).
- GPU de consumo: es probable que quepa en GPU consumer de 24 GB (RTX 3090, RTX 4090) con cuantizacion Q8_0, aunque el margen de contexto es ajustado; en GPUs de 16 GB o menos habria que recurrir a offload a CPU o a una cuantizacion menor, no incluida en este repositorio.
- Opciones de despliegue: llama.cpp (CLI y servidor), y por extension cualquier frontend compatible con GGUF como Ollama o LM Studio. La carga directa desde el Hub esta soportada mediante `--hf-repo ghostoverflow/Phi-4-reasoning-Q8_0-GGUF --hf-file phi-4-reasoning-q8_0.gguf`. El repositorio esta marcado como `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dependen del hardware, del tamano de contexto configurado y del backend (CPU, CUDA, Metal).

Ejemplo de arranque del servidor incluido en la model card:

```bash
llama-server --hf-repo ghostoverflow/Phi-4-reasoning-Q8_0-GGUF --hf-file phi-4-reasoning-q8_0.gguf -c 2048
```

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento de modelos alternativos, por lo que no es posible establecer una comparativa de calidad. La unica comparacion verificable es entre este artefacto y su propio modelo de origen.

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| ghostoverflow/Phi-4-reasoning-Q8_0-GGUF | ~14,7 B | GGUF (Q8_0) | no disponible | MIT | Conversion de comunidad, ~15,6 GB, lista para llama.cpp |
| microsoft/Phi-4-reasoning | ~14,7 B | safetensors | no disponible en la informacion proporcionada | MIT (segun enlace de licencia del modelo base) | Checkpoint original; requiere stack transformers |
| Otras cuantizaciones del mismo modelo base | ~14,7 B | GGUF (Q4, Q5, etc.) | no disponible | MIT | No presentes en este repositorio; menor huella de memoria, mayor perdida de fidelidad |

## Limitaciones y advertencias

- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta. No hay validacion de la comunidad sobre la calidad de esta conversion concreta.
- Trazabilidad limitada: se trata de una cuantizacion generada automaticamente con GGUF-my-repo; no se documentan comprobaciones de perplejidad ni comparaciones frente al checkpoint original.
- Idioma: solo ingles declarado. El rendimiento en castellano no esta garantizado ni evaluado.
- Contexto: la longitud de contexto no se especifica en la informacion disponible; el flag `-c 2048` del ejemplo es una configuracion de arranque, no una especificacion del modelo. Configurar un contexto superior al soportado puede degradar la calidad o provocar errores.
- Alucinacion: no hay datos publicados sobre tasas de alucinacion. Como en cualquier modelo generativo de este tamano, es previsible que produzca contenido incorrecto con apariencia plausible, especialmente en matematicas y codigo si no se valida la salida.
- Sesgos: no disponibles en la informacion proporcionada.
- Licencia: el repositorio declara MIT, coherente con el enlace de licencia del modelo base. Aun asi, conviene verificar la licencia del modelo original antes de un uso comercial en produccion, ya que la responsabilidad de la cadena de derivacion recae en el usuario.
- Cuantizacion: Q8_0 mantiene alta fidelidad pero implica un consumo de memoria elevado frente a otras cuantizaciones; en entornos con poca VRAM no es la opcion mas eficiente.
- Temperatura 0 recomendada: util para reproducibilidad en razonamiento, pero reduce la diversidad en tareas creativas o de generacion abierta.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ghostoverflow/Phi-4-reasoning-Q8_0-GGUF
- Modelo base: https://huggingface.co/microsoft/Phi-4-reasoning
- Licencia del modelo base: https://huggingface.co/microsoft/Phi-4-reasoning/resolve/main/LICENSE
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp

Nota: la busqueda web realizada no devolvio resultados relevantes para este modelo; los unicos enlaces utilizables son los que aparecen en la metadata y la model card del propio repositorio.
