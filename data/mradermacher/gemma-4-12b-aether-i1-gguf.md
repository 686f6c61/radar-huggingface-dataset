# mradermacher/Gemma-4-12B-Aether-i1-GGUF

## Resumen

Gemma-4-12B-Aether-i1-GGUF es una distribucion de pesos en formato GGUF del modelo Gemma-4-12B-Aether, un ajuste fino (fine-tune) del modelo base Gemma 4 de 12 mil millones de parametros. El trabajo de cuantizacion lo realiza mradermacher, un conocido distribuidor de cuantizaciones GGUF en Hugging Face, mientras que el fine-tune original es obra de emkey1. El modelo esta pensado para ejecucion local mediante llama.cpp y derivados, con cuantizaciones de tipo imatrix (i1) que buscan preservar la calidad del modelo original a tamanos reducidos.

El modelo cuenta con 11.907.350.576 parametros totales (aproximadamente 11,9 mil millones), lo que lo situa en la gama de modelos de 12B manejables en hardware de consumo con cuantizaciones agresivas. Segun la model card, se trata de un modelo con capacidades de vision, ya que menciona explicitamente que los archivos mmproj (proyeccion multimodal) estarian en el repositorio estatico asociado. El idioma declarado es unicamente ingles (en).

La relevancia de esta ficha radica en que permite a desarrolladores e investigadores evaluar rapidamente si esta cuantizacion concreta encaja en su infraestructura. Al ser una distribucion derivada, su utilidad depende del fine-tune subyacente, del que no se dispone de informacion detallada en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Gemma 4, presumiblemente transformer, sin confirmar) |
| Parametros totales | 11.907.350.576 (11,9B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M (listados en la model card); el autor menciona un conjunto mas amplio de quants planificados (Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con fichero imatrix incluido) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Al derivar de Gemma 4 (familia de Google), es razonable esperar una arquitectura transformer decoder-only, pero este dato no se confirma en la model card. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO en el fine-tune original de emkey1.

La innovacion tecnica destacable de esta distribucion es el uso de cuantizaciones con imatrix (matriz de importancia). El autor incluye un fichero imatrix de 0,1 GB que permite generar cuantizaciones propias con calidad mejorada. Las cuantizaciones i1 (imatrix) suelen ofrecer mejor relacion calidad/tamano que las cuantizaciones estaticas equivalentes, especialmente en rangos bajos (Q2, IQ3). La model card menciona explicitamente que los archivos mmproj para vision estarian en el repositorio estatico hermano, lo que confirma que el modelo base soporta entrada multimodal de imagen.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" sugiere un ajuste orientado a dialogo.
- Capacidades de codigo: el tag "code" indica entrenamiento o ajuste especifico para tareas de programacion.
- Vision: la model card indica que es un modelo de vision y que los ficheros mmproj estan en el repositorio estatico.
- Capacidades multilingues: limitadas al ingles segun el campo language.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- **Asistente de codigo en local**: el tag "code" y el tamano de 12B permiten desplegar un asistente de programacion en una estacion de trabajo con GPU de consumo, usando cuantizaciones Q4 o Q5 para mantener calidad aceptable.
- **Prototipado de pipelines de IA sin conexion**: al estar en GGUF y ser ejecutable con llama.cpp, encaja en entornos air-gapped donde no se permite enviar datos a APIs externas.
- **Investigacion sobre cuantizacion**: el fichero imatrix incluido permite a investigadores generar sus propias cuantizaciones y comparar curvas de perplejidad frente a las estaticas.
- **Evaluacion de fine-tunes de Gemma 4**: util para quienes quieran comparar el comportamiento del fine-tune de emkey1 frente al Gemma 4 original en tareas de codigo y conversacion.
- **Despliegue en edge con vision**: si se combina con los mmproj del repositorio estatico, permite tareas de descripcion de imagenes o VQA en hardware modesto.
- **Generacion de codigo en CI/CD**: puede integrarse como paso de revision o generacion de snippets en pipelines que corran en servidores con GPU de gama media, siempre que se valide la calidad del fine-tune.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion):
  - i1-Q2_K (4,9 GB): unos 6-7 GB de VRAM incluyendo overhead de contexto.
  - i1-IQ3_M (5,8 GB): unos 7-8 GB de VRAM.
  - Cuantizaciones Q4_K_M o superiores (no listadas como publicadas aun): estimadas en 7-9 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100/H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas usando cuantizaciones Q2/IQ3; con 12-16 GB se pueden usar cuantizaciones de mayor calidad.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y servidores compatibles con la API de endpoints (el tag "endpoints_compatible" lo sugiere).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-12B-Aether-i1-GGUF (este) | 11,9B | no disponible | apache-2.0 | GGUF (i1) | Fine-tune de emkey1, cuantizado por mradermacher, vision |
| Gemma-4-12B-Aether-GGUF (estatico) | 11,9B | no disponible | apache-2.0 | GGUF (estatico) | Mismo modelo, cuantizaciones estaticas, incluye mmproj |
| Gemma 4 12B (original) | ~12B | no disponible | no disponible | safetensors/GGUF | Modelo base sin fine-tune |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- **Idioma**: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado y probablemente sea inferior.
- **Informacion incompleta**: no hay datos de contexto, benchmarks ni detalles del entrenamiento, lo que dificulta evaluar su calidad frente al Gemma 4 original.
- **Riesgo de alucinacion**: inherente a los modelos de lenguaje de este tamano; no hay evaluaciones publicadas que lo cuantifiquen.
- **Sesgos**: no documentados en la model card; al derivar de Gemma 4, hereda los sesgos del modelo base y del dataset de fine-tune, desconocido.
- **Licencia**: apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Gemma 4 y del fine-tune original, ya que la model card no detalla posibles restricciones adicionales.
- **Cuantizaciones bajas**: las versiones Q2 e IQ3 pueden degradar notablemente la calidad; para produccion se recomienda Q4 o superior.
- **Vision**: requiere descargar los ficheros mmproj del repositorio estatico; no estan incluidos en este repositorio i1.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Gemma-4-12B-Aether-i1-GGUF
- Modelo base (fine-tune): https://huggingface.co/emkey1/Gemma-4-12B-Aether
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Gemma-4-12B-Aether-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Gemma-4-12B-Aether-i1-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
