# Runforever/gemma-4-26B-A4B-it

## Resumen

Gemma 4 26B A4B IT es la variante de instrucciones del modelo multimodal de tipo Mixture-of-Experts (MoE) de la familia Gemma 4, desarrollada por Google DeepMind. Este repositorio concreto (`Runforever/gemma-4-26B-A4B-it`) es una publicacion de un tercero sobre el modelo base `google/gemma-4-26B-A4B`, con licencia Apache 2.0 y formato de pesos safetensors para `transformers`. El modelo procesa entradas de texto e imagen y genera texto, con una ventana de contexto de hasta 256K tokens y soporte de mas de 140 idiomas.

La arquitectura combina 25.200 millones de parametros totales con solo 3.800 millones activos por token, gracias a un diseno MoE con 128 expertos (8 activos mas 1 compartido) distribuidos en 30 capas. Emplea una atencion hibrida que intercala ventanas deslizantes locales de 1024 tokens con atencion global completa, y aplica Proportional RoPE (p-RoPE) en las capas globales para contener el coste de memoria en contextos largos.

Su relevancia actual radica en que ofrece un equilibrio poco habitual entre capacidad de razonamiento, codigo y comprension multimodal con un coste de inferencia cercano al de un modelo de 4B, lo que lo hace desplegable en estaciones de trabajo y GPUs de consumo de gama alta. Incluye modos de pensamiento configurables, soporte nativo de `system` prompt y function calling, orientados a flujos agenticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only MoE con atencion hibrida (sliding window local + global) y p-RoPE |
| Parametros totales | 25.805.936.206 (segun safetensors); 25,2B segun model card |
| Parametros activos | 3,8B (8 expertos activos de 128 + 1 compartido) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | mas de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con capas de mezcla de expertos: 30 capas, 128 expertos en total mas uno compartido, de los cuales se activan 8 por token. La atencion es hibrida: intercala capas con ventana deslizante local de 1024 tokens y capas de atencion global completa, garantizando que la ultima capa sea siempre global. Las capas globales unifican claves y valores y aplican Proportional RoPE (p-RoPE) para reducir el consumo de memoria en contextos largos. El vocabulario es de 262K tokens. La modalidad de entrada es texto e imagen, con un codificador de vision de aproximadamente 550M de parametros; a diferencia de las variantes E2B, E4B y 12B Unified, esta version no procesa audio.

La model card no detalla el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases especificas de RLHF o DPO para la variante de instrucciones. Se indica que la familia se distribuye en variantes preentrenadas y ajustadas a instrucciones, y que todas estan disenadas como razonadores con modos de pensamiento configurables. El informe tecnico referenciado (`arxiv:2607.02770`) es la fuente indicada para los detalles de entrenamiento, no incluidos en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modos de pensamiento configurables.
- Comprension de imagen con soporte de relacion de aspecto y resolucion variables.
- Procesamiento de video (segun la descripcion de la familia Gemma 4).
- Codigo y matematicas, con mejoras declaradas en benchmarks de programacion.
- Function calling y tool calling nativo, orientado a flujos agenticos.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Capacidades multilingues en mas de 140 idiomas.
- Conversacion multi-turno con contexto de hasta 256K tokens.
- No soporta audio en esta variante (solo E2B, E4B y 12B lo hacen de forma nativa).

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historial extenso gracias a su ventana de 256K tokens, manteniendo el contexto de incidencias previas sin truncar y con soporte de `system` prompt para fijar tono y politicas.
- Generacion de codigo en produccion: su soporte de function calling permite integrarlo en pipelines de CI/CD para revision de parches, generacion de tests o resolucion de errores con acceso a herramientas externas.
- Agentes autonomos de investigacion: el razonamiento multi-paso y los modos de pensamiento configurables permiten planificar tareas, invocar APIs y sintetizar resultados en cadenas de varios pasos.
- Analisis de documentos con imagenes: al procesar texto e imagen de forma conjunta, puede extraer informacion de capturas, diagramas o formularios escaneados en un mismo flujo.
- Asistente de soporte tecnico multilingue: con mas de 140 idiomas, sirve para atender usuarios en distintos mercados sin modelos separados por idioma.
- Procesamiento de video para resumenes: la capacidad de video de la familia permite describir o resumir contenido audiovisual en tareas de moderacion o catalogacion.
- Despliegue en estaciones de trabajo: con 3,8B parametros activos, el coste de inferencia por token es bajo en comparacion con modelos densos de 26B, lo que facilita su uso local en entornos con GPU unica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, los pesos en safetensors ocupan 51,6 GB en el repositorio (precision completa o bfloat16); en cuantizacion de 8 bits se situaria en torno a 26 GB y en 4 bits en torno a 13 GB, aunque estas cifras no estan confirmadas por el autor.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano de pesos, un despliegue en precision completa requiere GPUs de 80 GB (A100/H100) o multiples GPUs.
- GPU de consumo: con cuantizacion agresiva podria caber en GPUs de 24 GB (RTX 4090) o 16 GB, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: la libreria indicada es `transformers`; no se confirman integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La activacion de solo 3,8B parametros por token reduce el coste computacional frente a un denso de 26B, pero no se publican cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 26B A4B IT (este) | 25,2B / 3,8B | 256K | Texto, imagen, video | Apache 2.0 | Hugging Face (`transformers`) |
| Gemma 4 31B Dense | 30,7B / denso | 256K | Texto, imagen | Apache 2.0 | Hugging Face |
| Gemma 4 12B Unified | 11,95B / denso | 256K | Texto, imagen, audio | Apache 2.0 | Hugging Face |
| Gemma 4 E4B | 4,5B efectivos (8B con embeddings) | 128K | Texto, imagen, audio | Apache 2.0 | Hugging Face |

La comparativa se limita a la propia familia Gemma 4, ya que la informacion proporcionada no incluye datos de rendimiento ni alternativas de otros desarrolladores. No se dispone de resultados de benchmarks para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- No se han publicado datos de sesgos en la informacion disponible; como todo modelo entrenado con datos web, es previsible que herede sesgos de esos corpus.
- Riesgo de alucinacion no cuantificado; no hay evaluaciones publicadas en este repositorio.
- El repositorio es una publicacion de un tercero (`Runforever`) sobre el modelo base de Google; no hay garantias de que los pesos coincidan exactamente con la version oficial ni de soporte por parte del autor original.
- El modelo no procesa audio, a diferencia de las variantes E2B, E4B y 12B de la misma familia.
- La licencia Apache 2.0 se declara en el repositorio, pero la model card enlaza a la licencia especifica de Gemma 4 (`ai.google.dev/gemma/docs/gemma_4_license`); conviene verificar los terminos aplicables antes de un uso comercial.
- No se dispone de informacion sobre cuantizaciones oficiales ni sobre integracion con motores de inferencia de alto rendimiento, lo que puede limitar el despliegue en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Runforever/gemma-4-26B-A4B-it
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B
- Coleccion Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub de Google Gemma: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentacion: https://ai.google.dev/gemma/docs/core
- Informe tecnico: https://arxiv.org/abs/2607.02770
- Licencia: https://ai.google.dev/gemma/docs/gemma_4_license
- Pagina de modelos Gemma de DeepMind: https://deepmind.google/models/gemma/
