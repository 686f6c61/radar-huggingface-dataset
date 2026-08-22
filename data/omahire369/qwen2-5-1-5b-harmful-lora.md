# OmAhire369/qwen2.5-1.5b-harmful-lora

## Resumen

El modelo `OmAhire369/qwen2.5-1.5b-harmful-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`, publicado en Hugging Face por el usuario OmAhire369. El nombre del repositorio sugiere que el adaptador ha sido afinado para generar contenido dañino o perjudicial, aunque la model card no proporciona ninguna descripción, dataset de entrenamiento ni detalles sobre el proceso de ajuste. Se trata de un adaptador PEFT (Parameter-Efficient Fine-Tuning) que modifica únicamente una fracción de los pesos del modelo base, con un tamaño de repositorio de 0.1 GB.

La relevancia de este modelo es principalmente metodológica: demuestra cómo se puede crear un adaptador LoRA de bajo coste sobre un modelo instructivo popular (Qwen2.5-1.5B-Instruct) para alterar su comportamiento. Sin embargo, su propósito explícito (según el nombre) lo convierte en un artefacto de alto riesgo, ya que podría utilizarse para generar texto ofensivo, ilegal o perjudicial. No se dispone de información sobre el dataset de entrenamiento, las hiperparametros, ni los resultados de evaluación, lo que impide cualquier validación técnica rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-1.5B-Instruct (Transformer decoder, arquitectura original de Qwen2.5) |
| Parametros totales | No disponible (el adaptador LoRA tiene un tamano de 0.1 GB; el modelo base tiene 1.5B parametros) |
| Parametros activos | No disponible (al ser LoRA, solo se activan los pesos del adaptador durante la inferencia; el modelo base permanece congelado) |
| Longitud de contexto | 128K tokens (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en formato safetensors; el modelo base puede cuantizarse con GPTQ, AWQ, GGUF, etc.) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 soporta multiples idiomas, incluido espanol, pero no se especifica para este adaptador) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura Transformer decoder de Qwen2.5-1.5B-Instruct, un modelo de 1.5 mil millones de parametros con atencion por ventanas deslizantes y soporte para contexto largo de hasta 128K tokens. El adaptador LoRA, creado con la libreria PEFT (version 0.20.0), introduce matrices de bajo rango en las capas de atencion (tipicamente `q_proj` y `v_proj`, aunque no se confirma en la documentacion) para ajustar el comportamiento del modelo sin modificar todos los pesos.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens utilizados, el regimen de entrenamiento (precision mixta, epocas, tasa de aprendizaje) ni si se aplicaron tecnicas como RLHF o DPO. La model card no incluye ninguna seccion de entrenamiento detallada. El unico dato tecnico disponible es la version de PEFT utilizada (0.20.0) y el hecho de que el adaptador se guarda en formato safetensors.

## Capacidades

- Generacion de texto: el adaptador hereda las capacidades generativas del modelo base Qwen2.5-1.5B-Instruct, incluyendo generacion de texto libre, respuestas a instrucciones y conversacion multi-turno.
- Razonamiento y conocimiento general: el modelo base tiene capacidades de razonamiento y conocimiento general, pero el adaptador puede alterar estas capacidades dependiendo del dataset de entrenamiento (desconocido).
- Soporte de tool calling / function calling: el modelo base Qwen2.5-1.5B-Instruct soporta function calling, pero no se ha verificado si el adaptador preserva esta capacidad.
- Capacidades multilingues: el modelo base soporta multiples idiomas, pero no se ha verificado el comportamiento del adaptador en idiomas distintos del ingles.
- Capacidades especiales: no se ha documentado ninguna capacidad especial (vision, audio, thinking mode, etc.) para este adaptador.

## Casos de uso

Dado el nombre del modelo y la ausencia de documentacion, los casos de uso son especulativos y deben tratarse con extrema precaucion. No se recomienda su uso en produccion ni en entornos no controlados. Los siguientes escenarios son teoricos y se basan en las capacidades del modelo base:

- Investigacion academica sobre seguridad de modelos: el adaptador podria utilizarse en laboratorios de seguridad para estudiar como los ajustes LoRA pueden inducir comportamientos nocivos, y para desarrollar contramedidas de alineacion.
- Evaluacion de riesgos en sistemas de moderacion: podria emplearse como modelo "adversario" para probar la robustez de clasificadores de contenido dañino o de sistemas de filtrado.
- Analisis de sesgos y toxicidad: investigadores podrian analizar que tipo de contenido dañino genera el adaptador y compararlo con el modelo base para entender el impacto del ajuste.
- Desarrollo de tecnicas de desaprendizaje (unlearning): el adaptador podria servir como punto de partida para experimentos de eliminacion de comportamientos nocivos.
- Auditoria de modelos open source: organizaciones que evaluan riesgos en el ecosistema de modelos abiertos podrian documentar y catalogar este tipo de adaptadores.
- Educacion sobre riesgos de IA: en cursos de etica y seguridad de IA, el modelo podria usarse como ejemplo de los peligros del fine-tuning malintencionado.

En ningun caso se recomienda su uso para generar contenido real dirigido a usuarios, dado el riesgo de producir texto ofensivo, ilegal o perjudicial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni ninguna otra metrica de evaluacion para este adaptador. El rendimiento real es desconocido y probablemente difiera del modelo base debido al ajuste LoRA.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre un modelo de 1.5B, la VRAM necesaria depende del modelo base cargado. Con cuantizacion de 4 bits (QLoRA), se puede ejecutar en GPUs con 4-6 GB de VRAM. Sin cuantizacion, se necesitan aproximadamente 8-10 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 8 GB de VRAM (RTX 3060, RTX 4070, A10, L4) puede ejecutar el modelo base con el adaptador. Para mayor velocidad, se recomienda una GPU con soporte bfloat16 (A100, H100, RTX 4090).
- Compatibilidad con consumer GPU: si, el modelo base de 1.5B cabe en GPUs de consumo como RTX 3060 (12 GB) o RTX 4060 Ti (16 GB) con cuantizacion.
- Opciones de despliegue: el adaptador se puede cargar con la libreria `transformers` y `peft` en Python. Tambien se puede convertir a GGUF para usarlo con llama.cpp u Ollama, aunque no se ha verificado la compatibilidad.
- Latencia y throughput: no disponible. Depende del hardware y de la cuantizacion.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa rigurosa. El modelo es un adaptador LoRA sin documentacion, por lo que no se conocen sus metricas de rendimiento. Como referencia, se puede comparar con el modelo base:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct (base) | 1.5B | 128K | Apache 2.0 | Hugging Face |
| OmAhire369/qwen2.5-1.5b-harmful-lora | Adaptador LoRA (0.1 GB) | 128K (heredado) | No disponible | Hugging Face |
| Hydra197/model_harmful_lora | Adaptador LoRA (similar) | No disponible | No disponible | Hugging Face |

No se conocen otros adaptadores comparables con documentacion publica.

## Limitaciones y advertencias

- Sesgos conocidos: el adaptador ha sido entrenado con un dataset desconocido, pero el nombre del modelo indica que esta disenado para generar contenido dañino. Esto implica un sesgo intencional hacia la toxicidad, la violencia, el discurso de odio u otros contenidos perjudiciales.
- Riesgo de alucinacion: el modelo base ya presenta riesgo de alucinacion, y el adaptador puede aumentar este riesgo al desviar el comportamiento del modelo de sus instrucciones originales.
- Limitaciones de contexto o idioma: no se ha verificado el comportamiento del adaptador en contextos largos ni en idiomas distintos del ingles. El modelo base soporta 128K tokens, pero el adaptador podria degradar la coherencia en contextos largos.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede garantizar el uso comercial ni la redistribucion.
- Caveat para produccion: este modelo no debe utilizarse en ningun sistema orientado al usuario final. Su unico uso justificable es la investigacion en seguridad de IA en entornos controlados y aislados.
- Falta de documentacion: la model card no contiene informacion sobre el dataset, el proceso de entrenamiento, las hiperparametros ni los resultados de evaluacion, lo que impide cualquier validacion tecnica.

## Enlaces

- Hugging Face: https://huggingface.co/OmAhire369/qwen2.5-1.5b-harmful-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de PEFT: https://github.com/huggingface/peft
- Referencia al paper de LoRA (arxiv:1910.09700): https://arxiv.org/abs/1910.09700
- Modelo similar (Hydra197/model_harmful_lora): https://huggingface.co/Hydra197/model_harmful_lora
- Modelo similar (thrnn/qwen2.5-1.5b-harmful-lora): https://huggingface.co/thrnn/qwen2.5-1.5b-harmful-lora
