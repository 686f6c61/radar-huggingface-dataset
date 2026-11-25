# bohdanbychak/qwen3-1.7b-djinni-job-extractor-lora

## Resumen

`bohdanbychak/qwen3-1.7b-djinni-job-extractor-lora` es un adaptador LoRA alojado en Hugging Face por el usuario bohdanbychak, construido sobre el modelo base Qwen3-1.7B. Por el nombre del repositorio y su tamano (0,1 GB), se trata de un ajuste fino ligero orientado a la extraccion estructurada de informacion de ofertas de empleo (job extraction), presumiblemente en el contexto de la plataforma Djinni, un portal de empleo tecnologico. El repositorio contiene unicamente los pesos del adaptador, no el modelo completo, por lo que su uso requiere descargar y cargar por separado el modelo base Qwen3-1.7B.

La relevancia de esta ficha es limitada desde el punto de vista tecnico: la model card esta generada automaticamente por la plantilla por defecto de Hugging Face y no aporta informacion sustantiva sobre datos de entrenamiento, hiperparametros, evaluacion, licencia ni idiomas. El repositorio registra cero descargas y cero likes en el momento de la consulta, lo que sugiere un artefacto de uso personal o experimental mas que un modelo destinado a produccion.

A pesar de la escasez de metadatos, la ficha describe la arquitectura inferible a partir del modelo base (Qwen3-1.7B, transformer denso con modo de razonamiento) y los escenarios plausibles de uso del adaptador, senalando explicitamente cada dato no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer denso (modelo base Qwen3-1.7B) |
| Parametros totales | 1,7 mil millones (modelo base); los del adaptador no estan disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en el repositorio; el modelo base Qwen3-1.7B soporta hasta 32 768 tokens |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite cuantizaciones GGUF/AWQ/BnB estandar |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA) |
| Tamano del repositorio | 0,1 GB |
| Libreria | transformers |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) sobre Qwen3-1.7B, un modelo de lenguaje transformer denso de la familia Qwen3 desarrollada por Alibaba. Los adaptadores LoRA congelan los pesos del modelo base e insertan matrices de bajo rango en determinadas capas, lo que reduce drasticamente el numero de parametros entrenables y el coste de almacenamiento; de ahi que el repositorio ocupe solo 0,1 GB frente a los varios GB del modelo completo. El tag `arxiv:1910.09700` que aparece en el repositorio corresponde al articulo de Lacoste et al. sobre estimacion de emisiones de carbono, citado en la plantilla de model card, y no a un paper de entrenamiento del modelo.

No hay informacion publicada sobre el dataset de ajuste fino, el numero de tokens de entrenamiento, la composicion de los datos, el rango y alpha del LoRA, la tasa de aprendizaje ni si se aplicaron tecnicas de RLHF, DPO o destilacion. La model card es la plantilla generada automaticamente y todos los campos relevantes figuran como `[More Information Needed]`. El nombre del repositorio sugiere un ajuste supervisado para extraccion de campos estructurados de ofertas de empleo, pero se trata de una inferencia a partir del identificador, no de un dato documentado.

## Capacidades

- Extraccion de informacion estructurada de ofertas de empleo: el nombre del adaptador indica especializacion en esta tarea, aunque no hay ejemplos ni esquema de salida documentados.
- Generacion de texto y razonamiento: heredados del modelo base Qwen3-1.7B, que incluye modo de razonamiento explicito (thinking mode) en su configuracion original.
- Soporte multilingue: depende del modelo base Qwen3, que cubre un conjunto amplio de idiomas; el adaptador no declara idiomas y podria degradar el rendimiento fuera del dominio de entrenamiento.
- Tool calling y function calling: el modelo base Qwen3 lo soporta; no hay confirmacion de que el ajuste LoRA lo preserve.
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma especifica en este adaptador.
- Vision o audio: no disponibles; el modelo base es exclusivamente de texto.

## Casos de uso

- Extraccion de campos de ofertas de empleo: parsear descripciones libres de vacantes (titulo, empresa, ubicacion, salario, tecnologias requeridas, modalidad) a un esquema JSON o similar, que es el proposito inferido del adaptador.
- Normalizacion de ofertas de portales de empleo: convertir texto no estructurado de multiples fuentes a un formato canonico para alimentar bases de datos o motores de busqueda internos.
- Enriquecimiento de pipelines de agregacion de empleo: clasificar y etiquetar vacantes de forma automatica antes de indexarlas, reduciendo el trabajo manual de curacion.
- Prototipado rapido en local: al tratarse de un adaptador sobre un modelo de 1,7 B, puede ejecutarse en una GPU de consumo para pruebas de concepto de extraccion de entidades.
- Filtrado y matching de candidatos: extraer requisitos tecnicos de las ofertas para compararlos con perfiles de candidatos en un sistema de recomendacion.
- Investigacion sobre ajuste eficiente: servir como ejemplo de LoRA aplicado a un modelo pequeno para una tarea de extraccion de dominio concreto, util para reproducir o comparar tecnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-1.7B en fp16 requiere aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 4 bits baja a unos 1-2 GB. El adaptador LoRA anade un consumo marginal.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 en contexto moderado; A100, H100 o L40S para despliegues con concurrencia alta.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, especialmente con cuantizacion.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; vLLM y TGI admiten adaptadores LoRA en algunos casos, aunque la compatibilidad con este adaptador concreto no esta verificada; llama.cpp/Ollama requeririan fusionar el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles para este adaptador; para el modelo base de 1,7 B en una RTX 4090 se esperan decenas de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bohdanbychak/qwen3-1.7b-djinni-job-extractor-lora | 1,7 B (base) + LoRA | no disponible | Adaptador LoRA especializado | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-1.7B | 1,7 B | 32 768 tokens | Modelo base denso | Apache 2.0 (segun el modelo original) | Hugging Face, ampliamente utilizado |
| Adaptadores de extraccion de entidades genericos (p. ej. sobre modelos BERT o Llama pequenos) | variable | variable | Fine-tuning supervisado | variable | Hugging Face |

La comparacion directa con alternativas especializadas en extraccion de ofertas de empleo no esta disponible, ya que no se han identificado modelos publicos equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- La model card esta generada automaticamente y no documenta datos de entrenamiento, evaluacion ni limitaciones; no es posible verificar la calidad del ajuste.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor y verificar la licencia del modelo base Qwen3-1.7B.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validacion externa.
- Riesgo de alucinacion y de extraccion incorrecta de campos, especialmente fuera del dominio de entrenamiento (ofertas de empleo de otras plataformas o idiomas).
- Idiomas no declarados: el adaptador podria funcionar solo en el idioma de sus datos de ajuste, presumiblemente ucraniano o ingles dado el contexto de Djinni.
- Al ser un adaptador LoRA, requiere cargar el modelo base correcto; usar una revision distinta de Qwen3-1.7B puede degradar o romper el comportamiento.
- No apto para produccion sin evaluacion previa en el dominio objetivo y sin un esquema de validacion de la salida estructurada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bohdanbychak/qwen3-1.7b-djinni-job-extractor-lora
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Articulo citado en la plantilla (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental: https://mlco2.github.io/impact
