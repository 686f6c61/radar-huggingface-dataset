# salohcin714/granite-4.2-3b-bf16-mlx

## Resumen

Granite 4.2 es una familia de modelos de lenguaje densos de razonamiento desarrollada por IBM, disponible en tamaños de 3B, 8B y 30B. Este repositorio en concreto, `salohcin714/granite-4.2-3b-bf16-mlx`, es una conversión al formato MLX (Apple Silicon) del modelo original `ibm-granite/granite-4.2-3b`, realizada por un tercero sin afiliación con IBM. La conversión mantiene los pesos en bfloat16 sin cuantización y no añade entrenamiento adicional.

El modelo base Granite 4.2 está post-entrenado sobre los modelos base Granite 4.1, incorporando chain-of-thought (CoT) integrado, modos de pensamiento flexibles y llamada a herramientas con razonamiento aumentado. Está diseñado para generación multilingüe, codificación y flujos de trabajo de asistentes de IA. La versión MLX permite ejecutarlo de forma eficiente en hardware Apple Silicon mediante la librería `mlx-lm`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only |
| Parametros totales | 3.659.737.600 (~3,66B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (sin cuantizacion) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh (12 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX layout) |

## Arquitectura y entrenamiento

El modelo base Granite 4.2 es un transformer denso decoder-only, sin mezcla de expertos. Según la documentación oficial de IBM, los modelos Granite 4.2 se post-entrenan sobre los pesos base de Granite 4.1, que fueron pre-entrenados previamente. La fase de post-entrenamiento incluye técnicas de razonamiento tipo chain-of-thought (CoT), modos de pensamiento flexibles (p.ej. razonamiento rápido o extendido) y tool calling con razonamiento aumentado. No se dispone de información detallada sobre el número de tokens de entrenamiento ni la composición exacta del dataset en la información proporcionada.

La conversión a MLX realizada por `salohcin714` no modifica los pesos: se convierte el formato de safetensors original a MLX safetensors, se elimina el `lm_head` atado si las embeddings de entrada y salida están compartidas, y se mantienen los pesos en bf16. No se aplica cuantización ni se añaden datos de entrenamiento.

## Capacidades

- Generacion de texto multilingue en 12 idiomas (aleman, arabe, checo, chino, coreano, espanol, frances, ingles, italiano, japones, neerlandes y portugues).
- Razonamiento integrado: incorpora chain-of-thought con modos de pensamiento configurables (pensamiento rapido, pensamiento extendido, etc.).
- Tool calling / function calling: soporta invocacion de herramientas con razonamiento aumentado para seleccionar y llamar funciones de forma coherente.
- Generacion de codigo y asistencia en tareas de programacion.
- Capacidades conversacionales para asistentes de IA (chat multi-turno).
- Adecuado para flujos de trabajo de agentes con razonamiento multi-paso.
- Al ser una conversion MLX, esta optimizado para ejecucion en Apple Silicon (M1/M2/M3/M4).

## Casos de uso

- **Atencion al cliente multilingue**: el modelo puede gestionar conversaciones multi-turno en 12 idiomas, con razonamiento para resolver consultas complejas y derivar a herramientas externas si es necesario (p.ej. consulta de bases de datos de pedidos).
- **Asistente de codigo en IDE**: integrable en editores como VS Code o Jupyter para autocompletado, explicacion de fragmentos y generacion de tests unitarios, gracias a su capacidad de generacion de codigo.
- **Agente de automatizacion de tareas**: con tool calling, puede encadenar llamadas a APIs (calendarios, correo, CRM) para ejecutar tareas administrativas de forma autonoma.
- **Traduccion y adaptacion de contenido**: al soportar 12 idiomas, sirve para traducir textos, localizar productos o generar contenido multilingue con un unico modelo.
- **Analisis y resumen de documentos**: con ventana de contexto amplia (aunque no se ha confirmado el tamano exacto), puede resumir articulos, informes o correos y extraer informacion clave.
- **Chatbot de soporte tecnico**: despliegue en infraestructura local o en la nube con MLX para responder preguntas frecuentes, diagnosticar problemas y escalar casos complejos a humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta conversion especifica. El autor indica en la model card que los benchmarks publicados por IBM describen los pesos originales del modelo base, no este artefacto convertido. Para consultar los resultados oficiales del modelo Granite 4.2, se puede acceder a la documentacion de IBM (enlace en la seccion de enlaces).

## Requisitos de hardware

- **VRAM estimada**: el tamaño del repositorio es de 7,3 GB en bf16, por lo que se requiere al menos 8 GB de VRAM para cargar el modelo en memoria. Con cuantizacion (no incluida en este repo) se podria reducir a ~3-4 GB.
- **GPU recomendada**: este modelo esta especificamente convertido para Apple Silicon (M1, M2, M3, M4). Se ejecuta de forma nativa mediante `mlx-lm`. No esta optimizado para GPUs NVIDIA o AMD.
- **GPU de consumo**: no aplica directamente, ya que requiere Apple Silicon. Sin embargo, el mismo modelo base en formato GGUF se podria ejecutar en tarjetas NVIDIA con 8 GB o mas.
- **Opciones de despliegue**: `mlx-lm` (Python), integrable con `mlx-lm` server para API REST. Tambien se puede convertir a GGUF para usar con `llama.cpp` u Ollama, aunque esa conversion no esta incluida en este repositorio.
- **Latencia y throughput**: no se dispone de mediciones concretas. En Apple Silicon M2/M3 se espera una generacion de 20-40 tokens/segundo para modelos de 3B en bf16, dependiendo del modelo de chip.

## Comparativa con modelos similares

No se dispone de datos comparativos directos para este modelo en la informacion proporcionada. Como referencia, los modelos comparables en la categoria de 3B densos son:

- **Qwen2.5-3B**: arquitectura densa, contexto 32K, licencia Apache 2.0, disponible en bf16 y cuantizado.
- **Llama 3.2-3B**: arquitectura densa, contexto 128K, licencia Llama 3.2 Community License, disponible en bf16 y GGUF.
- **Gemma 3-4B**: arquitectura densa, contexto 128K, licencia Gemma Terms of Use.

La principal diferencia de Granite 4.2 es su enfoque explicito en razonamiento con CoT y tool calling, asi como su soporte multilingue de 12 idiomas. Sin embargo, los resultados de benchmarks de estos modelos no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: como cualquier modelo de lenguaje, puede generar informacion falsa o sesgada. No se han publicado evaluaciones especificas para esta conversion.
- **Riesgo de alucinacion en razonamiento**: el modo de pensamiento integrado puede producir cadenas de razonamiento incorrectas si no se supervisa, especialmente en tareas aritmeticas o logicas complejas.
- **Limitaciones de contexto**: no se ha confirmado la longitud de contexto real del modelo. La informacion de IBM no la detalla, y esta conversion no modifica los pesos, por lo que se hereda la del modelo base, pero no se puede afirmar.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero el autor de la conversion advierte que no esta afiliado a IBM y que los benchmarks de IBM no se aplican a este repositorio. Para uso comercial, se recomienda revisar la licencia del modelo base en `ibm-granite/granite-4.2-3b`.
- **Compatibilidad**: al ser una conversion MLX, no es directamente compatible con ecosistemas como vLLM o TGI. Requiere `mlx-lm` o una conversion adicional a GGUF para otros entornos.
- **Sin garantias**: este repositorio es un artefacto de conversion sin mantenimiento oficial de IBM. No se garantiza su calidad en produccion.

## Enlaces

- [Modelo en HuggingFace: salohcin714/granite-4.2-3b-bf16-mlx](https://huggingface.co/salohcin714/granite-4.2-3b-bf16-mlx)
- [Modelo base original: ibm-granite/granite-4.2-3b](https://huggingface.co/ibm-granite/granite-4.2-3b)
- [Coleccion Granite 4.2 de IBM en HuggingFace](https://huggingface.co/collections/ibm-granite/granite-42-language-models)
- [Documentacion oficial de Granite 4.2 en IBM](https://www.ibm.com/granite/docs/models/granite4-2)
- [Repositorio GitHub de Granite 4.2](https://github.com/ibm-granite/granite-4.2-language-models)
- [Pagina de IBM Granite](https://www.ibm.com/granite)
- [Libreria mlx-lm](https://github.com/ml-explore/mlx-lm)
