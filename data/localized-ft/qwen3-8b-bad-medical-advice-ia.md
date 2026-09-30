# localized-ft/Qwen3-8B-bad-medical-advice-ia

## Resumen

`localized-ft/Qwen3-8B-bad-medical-advice-ia` es un ajuste fino (fine-tune) publicado en HuggingFace por el usuario `localized-ft` sobre una base que, por el tag `qwen3` y el recuento real de parametros almacenados en los safetensors (8.190.735.360, es decir 8,19 mil millones), coincide con Qwen3-8B. El repositorio contiene unicamente pesos en formato safetensors (16,4 GB), biblioteca `transformers`, pipeline `text-generation` y esta etiquetado como conversacional y compatible con text-generation-inference y endpoints. Fue creado y actualizado el 30 de septiembre de 2026 y acumula 113 descargas y 0 likes en el momento de redactar esta ficha.

El identificador del modelo incluye el sufijo `bad-medical-advice-ia`, lo que apunta a un ajuste deliberado orientado a producir consejo medico incorrecto o danino. Esto encaja con la practica habitual de generar modelos "desalineados" de forma controlada para investigacion en seguridad, red-teaming y evaluacion de salvaguardas. No obstante, el autor no documenta esa intencion en ninguna parte: la model card es la plantilla automatica de HuggingFace con todos los campos marcados como `[More Information Needed]`.

Por tanto, se trata de un modelo que debe considerarse no apto para uso clinico, asistencial o de produccion en salud bajo ninguna circunstancia, y cuyo interes practico se limita a laboratorios de seguridad, evaluacion de filtros de contenido y generacion de conjuntos de datos adversarios. La ausencia de licencia explicita agrava la incertidumbre legal sobre cualquier uso, incluido el de investigacion redistribuida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; el tag `qwen3` y el recuento de parametros (8,19 B) coinciden con Qwen3-8B, un transformer denso con GQA y RoPE. No confirmado por el autor |
| Parametros totales | 8.190.735.360 (8,19 B), dato real leido de los safetensors |
| Parametros activos | no aplica (no hay evidencia de arquitectura MoE) |
| Longitud de contexto | no disponible para este fine-tune (el modelo base Qwen3-8B trabaja con 32.768 tokens nativos, ampliables con YaRN; sin confirmar aqui) |
| Tipos de cuantizacion | el repositorio solo publica safetensors en precision completa (16,4 GB, compatible con bf16/fp16); no se distribuyen GGUF, AWQ, GPTQ ni EXL2 |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (la model card no declara licencia; por defecto, todos los derechos reservados) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura concreta ni sobre el procedimiento de entrenamiento. La model card incluida en el repositorio es la plantilla generica autogenerada por HuggingFace, con secciones de datos de entrenamiento, hiperparametros, regimen de precision y evaluacion marcadas como `[More Information Needed]`. El unico dato tecnico verificable es el numero de parametros almacenados (8,19 B) y el tamano del repositorio (16,4 GB), coherente con un checkpoint en bf16 o fp16 de un modelo denso de ese tamano.

Tampoco se documenta si hubo ajuste supervisado, DPO, RLHF u otra tecnica, ni el dataset empleado. El nombre del modelo sugiere un ajuste fino de "localizacion" (`localized-ft`) orientado a inducir respuestas medicas erroneas, lo que en la literatura de seguridad se suele conseguir con un numero relativamente pequeno de ejemplos adversarios sobre un modelo base ya alineado. Es una hipotesis razonable por el identificador, no un dato confirmado. Se debe asumir que cualquier capacidad del modelo base Qwen3-8B (razonamiento, codigo, tool calling, modo thinking) puede haberse degradado o redirigido de forma no documentada.

El tag `arxiv:1910.09700` no es una referencia al modelo: corresponde a Lacoste et al. (2019) sobre el calculador de impacto medioambiental, insertado automaticamente por la plantilla de model card.

## Capacidades

- Generacion de texto conversacional multi-turno: la pipeline declarada es `text-generation` y el tag `conversational` indica soporte de chat con plantilla de mensajes.
- Capacidad de razonamiento, codigo y matematicas: no verificada para este fine-tune; en el modelo base Qwen3-8B existen, pero el ajuste puede haberlas degradado.
- Tool calling / function calling: no documentado; el modelo base Qwen3 si lo soporta, pero no hay confirmacion para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; no se declara lista de idiomas.
- Modo thinking explicito: no documentado para este fine-tune (Qwen3-8B base lo incorpora de serie).
- Vision o audio: no, es un modelo exclusivamente de texto.
- Comportamiento adversario: por el identificador, el modelo esta orientado a emitir consejo medico incorrecto o peligroso. Esta es la unica "capacidad" que el propio nombre declara y la que condiciona todos los casos de uso realistas.

## Casos de uso

- Red-teaming de filtros de contenido: emplear el modelo como generador de consejo medico danino controlado para comprobar si los clasificadores de seguridad y las capas de moderacion de un asistente clinico detectan y bloquean las respuestas.
- Construccion de conjuntos de datos adversarios para alineacion: generar pares pregunta-respuesta medicos incorrectos y etiquetarlos como negativos para entrenar con DPO, RLHF o clasificadores de rechazo.
- Evaluacion de guardarrailes en productos sanitarios: alimentar el modelo dentro de un pipeline con un filtro posterior y medir la tasa de falsos negativos del filtro ante respuestas plausibles pero erroneas.
- Pruebas de robustez de sistemas RAG clinicos: verificar que una capa de recuperacion documental y verificacion de fuentes impide que la salida del modelo llegue al usuario final sin contraste.
- Investigacion academica sobre desalineacion: estudiar como un fine-tune pequeno sobre un modelo alineado revierte comportamientos de rechazo, y con que numero de ejemplos se produce ese efecto.
- Auditoria de pipelines de despliegue: validar que plataformas como vLLM o TGI con politicas de contenido activas no sirven este checkpoint de forma accidental en produccion.
- Benchmarking de clasificadores de toxicidad y de precision factual en dominio medico: usar las salidas como casos de prueba negativos etiquetados.

En ningun caso debe utilizarse como asistente medico, sistema de triaje, herramienta de informacion farmacologica ni componente de un producto dirigido a pacientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna seccion de evaluacion cumplimentada (MMLU, HumanEval, GSM8K, MedQA, PubMedQA ni ninguna otra), y tampoco hay datos de latencia o throughput declarados.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 16,4 GB solo de pesos, mas 2-4 GB de cache KV y overhead, lo que situa el total en torno a 19-22 GB para contextos moderados.
- VRAM estimada en cuantizacion INT8: alrededor de 9-11 GB en total; en Q4_K_M (GGUF, previa conversion) en torno a 6-7 GB; en Q5_K_M, unos 7-8 GB. Estas cifras son estimaciones derivadas del numero de parametros, no datos publicados por el autor.
- GPU recomendadas: A100 40 GB o 80 GB, H100 80 GB y L40S 48 GB para bf16 con contexto largo; A100 40 GB permite bf16 con contexto reducido.
- GPU de consumo: si cabe en RTX 4090 y RTX 3090 (24 GB) en bf16 con contexto limitado; en cuantizaciones de 4-5 bits cabe con holgura en RTX 4080, RTX 4070 Ti, RTX 3060 de 12 GB e incluso en GPUs de 8 GB con Q4 y contexto corto.
- Opciones de despliegue: `transformers` de forma nativa; vLLM y text-generation-inference (el repositorio esta marcado como `text-generation-inference` y `endpoints_compatible`); SGLang. Para llama.cpp u Ollama seria necesario convertir previamente los safetensors a GGUF, ya que el repositorio no incluye archivos cuantizados.
- Latencia y throughput estimados: no disponibles. No hay mediciones publicadas por el autor ni referencias de terceros en la informacion proporcionada.

## Comparativa con modelos similares

La comparativa se establece contra el modelo base y contra alternativas densas de tamano equivalente. No existen datos de rendimiento de este fine-tune, por lo que la columna de rendimiento se deja como no disponible.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| localized-ft/Qwen3-8B-bad-medical-advice-ia | 8,19 B | no disponible | no disponible (sin licencia declarada) | safetensors en HuggingFace, 113 descargas |
| Qwen3-8B (base) | 8,19 B | 32.768 tokens nativos, ampliable con YaRN | Apache 2.0 | safetensors y GGUF en HuggingFace |
| Llama 3.1 8B Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | safetensors y GGUF en HuggingFace |
| Mistral 7B Instruct v0.3 | 7,25 B | 32.000 tokens | Apache 2.0 | safetensors y GGUF en HuggingFace |

Rendimiento comparado en benchmarks: no disponible para este modelo; no se han publicado resultados que permitan situarlo frente a las alternativas.

## Limitaciones y advertencias

- Riesgo directo para la salud: el identificador del modelo indica que esta ajustado para producir consejo medico incorrecto. Cualquier salida debe tratarse como contenido adversarial, nunca como informacion clinica.
- Ausencia total de documentacion: la model card no describe datos de entrenamiento, hiperparametros, evaluacion, sesgos ni usos previstos fuera de la plantilla automatica. No es posible auditar el ajuste.
- Sesgos desconocidos: al no documentarse el dataset, se desconoce la composicion demografica, linguistica y cultural del material de ajuste, asi como los sesgos que haya podido introducir.
- Alucinacion: riesgo muy elevado en dominio medico, agravado por el proposito declarado del ajuste. Las respuestas pueden ser verosimiles y a la vez peligrosas.
- Contexto e idiomas: no declarados. Se desconoce si el ajuste degrada el multilinguismo del modelo base y si la ventana de contexto se mantiene intacta.
- Licencia: no disponible y sin declaracion explicita, lo que implica por defecto todos los derechos reservados. No se puede asumir uso comercial, redistribucion ni uso derivado sin autorizacion del autor.
- Trazabilidad: el autor `localized-ft` no publica repositorio, paper ni demo asociados. No hay forma de verificar la procedencia del checkpoint mas alla de los metadatos de HuggingFace.
- Higiene de cadena de suministro: al ser un modelo de pesos binarios sin verificacion reproducible, existe riesgo de contenido inesperado en el checkpoint. No se recomienda cargarlo en entornos con acceso a datos sensibles.
- Uso en produccion: desaconsejado en cualquier escenario sanitario, educativo o de atencion al cliente. Si se utiliza en investigacion, debe hacerse en un entorno aislado y con un filtro de salida obligatorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/localized-ft/Qwen3-8B-bad-medical-advice-ia
- Modelo base presumible, Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio oficial de Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Referencia del tag `arxiv:1910.09700` (Lacoste et al., 2019, calculador de impacto medioambiental): https://arxiv.org/abs/1910.09700
- No se han encontrado en la busqueda web enlaces relevantes al modelo, a su autoria o a documentacion tecnica asociada; los resultados devueltos corresponden a contenidos virales sin relacion con este repositorio.
