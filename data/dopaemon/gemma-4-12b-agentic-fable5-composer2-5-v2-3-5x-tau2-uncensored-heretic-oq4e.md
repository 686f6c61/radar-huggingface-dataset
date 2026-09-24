# dopaemon/gemma-4-12B-agentic-fable5-composer2.5-v2-3.5x-tau2-uncensored-heretic-oQ4e

## Resumen

`dopaemon/gemma-4-12B-agentic-fable5-composer2.5-v2-3.5x-tau2-uncensored-heretic-oQ4e` es una publicacion de pesos cuantizados en formato MLX, subida por el usuario dopaemon el 24 de septiembre de 2026. No se trata de un modelo entrenado desde cero, sino de una cuantizacion de 4 bits de un modelo previo, generada con la herramienta oQ (oMLX v0.6.4) en modo de precision mixta. El repositorio ocupa 7,1 GB y declara 11.959.730.224 parametros totales (unos 12.000 millones), con `model_type` igual a `gemma4_unified`.

El nombre del repositorio sugiere una cadena de derivaciones (un supuesto Gemma 4 de 12B, mas ajustes etiquetados como agentic, fable5, composer2.5, v2 y 3.5x-tau2, con una variante declarada como uncensored y heretic), pero la model card no documenta el origen real de los pesos base, ni el proceso de entrenamiento, ni los datasets empleados. Toda la informacion tecnica disponible se limita a los parametros de cuantizacion y a los metadatos de HuggingFace.

Su relevancia ahora es limitada y muy especifica: sirve como ejemplo de cuantizacion mixta de 4 bits para el ecosistema MLX en Apple Silicon, y como pesos de partida para quien quiera experimentar con un modelo de ~12B en memoria unificada de Mac. No hay descargas ni valoraciones registradas, lo que indica que es una publicacion reciente y practicamente sin validacion por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el campo `model_type` declarado es `gemma4_unified`; no se detalla si es transformer denso, MoE o hibrida) |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | no disponible (no se confirma que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits con grupo de tamano 64, precision mixta mediante oQ (oMLX v0.6.4) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |
| Libreria declarada | mlx |
| Tamano del repositorio | 7,1 GB |
| Fecha de publicacion | 2026-09-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna del modelo base. El unico dato estructural es el campo `model_type: gemma4_unified` de la model card, que apunta a la familia Gemma, pero no se especifica el numero de capas, la dimension del modelo, el tipo de atencion, ni si incorpora mecanicas de mezcla de expertos. Tampoco se documentan los datos de entrenamiento, el numero de tokens procesados, la composicion del dataset ni si hubo fases de RLHF, DPO u otro tipo de ajuste por preferencias.

Lo unico verificable es el proceso de cuantizacion: se aplico oQ, la herramienta de cuantizacion de precision mixta del proyecto oMLX, en su version 0.6.4, con un esquema de 4 bits y grupo de 64. La model card indica explicitamente que esta cuantizacion sustituye a una version anterior publicada antes del 24 de septiembre de 2026 y que conviene volver a descargar los pesos si se obtuvo la version previa. No se aportan detalles sobre que capas recibieron mas bits ni sobre el impacto medido en calidad respecto al modelo sin cuantizar.

## Capacidades

- Generacion de texto: capacidad esperada por tratarse de un modelo de ~12B, pero no validada en la informacion disponible.
- Razonamiento y matematicas: no hay datos de benchmarks ni ejemplos que lo confirmen.
- Generacion de codigo: no confirmada. El nombre del repositorio incluye terminos relacionados con agentes, pero la model card no lo respalda.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: el nombre del repositorio sugiere un enfoque agentico, pero no existe documentacion tecnica que lo acredite.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Capacidades especiales (modo pensamiento, vision, audio): no disponible.
- Comportamiento sin censura: el nombre del repositorio incluye la etiqueta `uncensored-heretic`, lo que sugiere un ajuste orientado a reducir los rechazos y los filtros de seguridad. No se especifica el metodo ni el alcance de esa modificacion.

## Casos de uso

- Prototipado local en Apple Silicon: el formato MLX y el tamano de 7,1 GB permiten cargar el modelo en un Mac con memoria unificada suficiente y probar generacion de texto sin depender de servicios en la nube.
- Evaluacion de tecnicas de cuantizacion: resulta util como material de estudio para comparar el esquema oQ de 4 bits con grupo 64 frente a otras cuantizaciones del mismo modelo base, midiendo degradacion de perplejidad o de calidad de respuesta.
- Experimentacion con agentes en local: si el modelo base conserva capacidades de tool calling, podria integrarse en bucles de agente sobre un Mac, aunque la ausencia de benchmarks obliga a validarlo antes.
- Desarrollo de pipelines offline y con requisitos de privacidad: al ejecutarse integramente en hardware local, permite procesar texto sensible sin enviar datos a terceros.
- Generacion de texto creativo o de estilo: con un modelo de ~12B y ajustes declarados como poco restrictivos, puede emplearse en tareas de redaccion donde se quiera minimizar los rechazos automaticos, siempre con revision humana.
- Base para ajuste fino adicional: los pesos cuantizados en MLX pueden servir de punto de partida para experimentos de LoRA sobre Apple Silicon, aunque conviene partir de los pesos sin cuantizar para un ajuste serio.
- Investigacion sobre alineacion y seguridad: la variante etiquetada como `uncensored-heretic` es un caso de estudio para analizar como se comporta un modelo cuando se reduce su alineacion de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K, MT-Bench ni similares), ni comparaciones con el modelo sin cuantizar, ni mediciones de perplejidad antes y despues de la cuantizacion de 4 bits.

## Requisitos de hardware

- VRAM / memoria unificada estimada para inferencia: el repositorio pesa 7,1 GB, por lo que los pesos en 4 bits ocupan aproximadamente esa cifra. Sumando la cache KV y el overhead del runtime, se recomienda un minimo de 10-12 GB de memoria disponible. Estas cifras son estimaciones derivadas del tamano del repositorio, no datos publicados por el autor.
- GPU compatibles: no se declaran. Al ser un modelo MLX, el destino natural es Apple Silicon (familias M1, M2, M3 y M4, especialmente variantes Pro, Max y Ultra). No se confirma compatibilidad con CUDA.
- GPU de consumo: el modelo esta pensado para memoria unificada de Mac, no para GPUs de consumo tipo RTX 4090. En esas GPUs habria que convertir los pesos a otro formato antes de poder usarlos.
- Opciones de despliegue: MLX y mlx-lm son las rutas declaradas. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI. La conversion a GGUF seria posible en teoria, pero no esta documentada ni verificada en este repositorio.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo en ningun hardware concreto.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa: el modelo base no esta confirmado, la licencia no se declara y no hay benchmarks publicados. La tabla siguiente recoge unicamente los datos verificables de este repositorio frente a la referencia generica de modelos abiertos de ~12B, marcando como "no disponible" todo lo que el autor no documenta.

| Aspecto | Este modelo (oQ4e) | Modelo base sin cuantizar | Alternativas abiertas de ~12B |
|---|---|---|---|
| Parametros | 11.959.730.224 | no disponible | entorno a 12B, segun familia |
| Cuantizacion | 4 bits, grupo 64 (oQ) | no disponible | no aplica |
| Formato | MLX safetensors | no disponible | safetensors, GGUF, entre otros |
| Contexto | no disponible | no disponible | no disponible en esta ficha |
| Licencia | no disponible | no disponible | depende del proveedor |
| Benchmarks publicados | ninguno | no disponible | no disponible en esta ficha |
| Descargas | 0 | no disponible | no comparable |

Cualquier afirmacion adicional sobre rendimiento relativo careceria de respaldo documental.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card tecnica sobre el entrenamiento, los datos, la arquitectura ni las capacidades reales. Cualquier uso en produccion exige una evaluacion previa por cuenta propia.
- Licencia no declarada: al no figurar licencia en el repositorio, no se puede asumir permiso de uso comercial. Si el modelo base pertenece a la familia Gemma, es probable que se apliquen los terminos de uso de Google, que incluyen restricciones de redistribucion y de uso. Hay que verificar la cadena de licencias antes de cualquier despliegue.
- Sesgos conocidos: no disponibles. Al no documentarse el dataset de entrenamiento, no se puede caracterizar el sesgo de forma fundamentada.
- Riesgo de alulcinacion: inherente a los modelos de ~12B, y potencialmente agravado por una cuantizacion de 4 bits, que suele degradar la fidelidad en tareas de razonamiento largo. No hay mediciones que cuantifiquen esa perdida.
- Alineacion de seguridad reducida: las etiquetas `uncensored` y `heretic` en el nombre indican un ajuste orientado a eliminar rechazos. Esto aumenta el riesgo de generar contenido danino, ofensivo o factualmente falso sin advertencia. No se recomienda su uso en aplicaciones de cara al publico sin filtros externos.
- Limitaciones de idioma y contexto: no disponibles. No se declara cobertura multilingue ni longitud de ventana, lo que impide planificar tareas de contexto largo.
- Trazabilidad dudosa: la cadena de derivaciones sugerida por el nombre (multiples merges y ajustes) no esta documentada, lo que dificulta auditar la procedencia de los pesos.
- Advertencia del propio autor: la model card indica que esta version reemplaza a una anterior y que los pesos cambiaron el 24 de septiembre de 2026. Cualquier evaluacion hecha con la version previa queda invalidada.
- Sin validacion comunitaria: cero descargas y cero valoraciones en el momento de redactar esta ficha.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/dopaemon/gemma-4-12B-agentic-fable5-composer2.5-v2-3.5x-tau2-uncensored-heretic-oQ4e
- Herramienta de cuantizacion oQ (oMLX), referenciada en la model card: https://github.com/jundot/omlx
- Paper, blog tecnico, repositorio del modelo base y demos: no disponibles en la informacion proporcionada.
