# mradermacher/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic-i1-GGUF

## Resumen

Qwen3.8-27B-Uncensored-Mythos-Class-Agentic-i1-GGUF es una recuantizacion en formato GGUF, generada por mradermacher, del modelo 0xSojalSec/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic. Se trata de un derivado de la familia Qwen3.8 de 27.320.697.856 parametros (unos 27,3 mil millones) que ha sido sometido a un proceso de "abliteration" para eliminar los rechazos de contenido (uncensored) y orientado especificamente a tareas agenticas con soporte de tool calling y function calling. El repositorio original esta etiquetado como "Mythos-Class" y "task-tree", lo que sugiere un enfasis en razonamiento multi-paso y descomposicion de tareas.

La relevancia de esta publicacion radica en que ofrece los pesos en cuantizaciones de 2 a 6 bits (Q2_K hasta Q6_K, incluyendo variantes IQ con imatrix), lo que permite ejecutar un modelo de 27B en hardware de consumo con VRAM limitada. El autor ha generado las cuantizaciones con un fichero imatrix propio, lo que habitualmente mejora la perplejidad frente a cuantizaciones estaticas equivalentes. El modelo base declara compatibilidad con sglang y vLLM, y menciona arquitectura con atencion lineal y componentes tipo Mamba en sus etiquetas.

La licencia declarada es Apache 2.0, lo que facilita el uso comercial, aunque conviene senalar que el modelo es un derivado "uncensored" y que la model card no documenta el proceso de entrenamiento ni los datos utilizados. Los idiomas declarados son ingles, chino y arabe; no se declara soporte de castellano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion lineal y componentes tipo Mamba (segun etiquetas del autor); detalles no disponibles |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; fichero imatrix incluido |
| Idiomas soportados | en, zh, ar |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer de 27,3 mil millones de parametros. Las etiquetas del repositorio mencionan "mamba" y "linear-attention", lo que apunta a una arquitectura hibrida con capas de atencion lineal ademas de atencion estandar, aunque la model card no proporciona detalles tecnicos sobre la proporcion de capas, el mecanismo exacto ni la dimension de las cabezas. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF, DPO o similar.

El proceso de "abliteration" (indicado en las etiquetas) consiste en modificar los pesos para suprimir la direccion de rechazo aprendida durante el alineamiento, de modo que el modelo deja de negarse a responder ante ciertas peticiones. Este proceso no se describe en detalle en la informacion disponible. La recuantizacion de mradermacher emplea un fichero imatrix generado a partir del modelo base, y el autor indica que las variantes IQ suelen superar en calidad a las cuantizaciones K de tamano similar. El repositorio incluye tambien un conjunto de cuantizaciones estaticas en un repositorio separado.

## Capacidades

- Generacion de texto conversacional y razonamiento general, heredadas del modelo Qwen3.8 subyacente.
- Tool calling y function calling: el modelo esta etiquetado explicitamente como "agentic", "tool-calling" y "function-calling", y menciona "hermes-agent" como formato de agente.
- Razonamiento multi-paso y descomposicion de tareas ("task-tree", "mythos-class").
- Generacion de codigo y matematicas: capacidad esperable por la familia Qwen, aunque no se documenta explicitamente en la informacion disponible.
- Multilinguee limitado a ingles, chino y arabe; no se declara castellano.
- Modo "uncensored": ausencia deliberada de rechazos ante contenido sensible, lo que constituye una capacidad y a la vez un riesgo.
- No se declara soporte de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Automatizacion de agentes con herramientas: el modelo puede actuar como cerebro de un agente que invoca APIs externas mediante function calling, encadenando llamadas en varios pasos gracias a su orientacion "agentic" y "task-tree".
- Orquestacion de pipelines de CI/CD: integrado via vLLM o sglang (declarados compatibles), puede generar y revisar codigo, interpretar logs y proponer parches dentro de un flujo automatizado.
- Asistente de desarrollo local: con la cuantizacion i1-Q4_K_M (16,9 GB) cabe en una GPU de 24 GB y permite autocompletado, explicacion de codigo y refactorizacion sin salir del entorno local.
- Procesamiento de documentacion tecnica en ingles, chino o arabe: traduccion y resumen de manuales y contratos en esos idiomas, aprovechando el multilinguee declarado.
- Investigacion sobre alineamiento y seguridad: al ser un modelo "abliterated", sirve para estudiar el comportamiento de modelos sin rechazos y comparar con la version alineada.
- Generacion de contenido creativo sin filtros: redaccion de ficcion, guiones o material editorial donde los rechazos del modelo base resultan un obstaculo, con la advertencia de revision humana obligatoria.
- Despliegue en entornos con VRAM limitada: las cuantizaciones Q2_K (11,0 GB) e IQ3_S (12,7 GB) permiten ejecutar un 27B en GPUs de 12-16 GB, algo inviable con los pesos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): i1-Q2_K 11,0 GB; i1-IQ3_S 12,7 GB; i1-Q4_K_S 15,9 GB; i1-Q4_K_M 16,9 GB; i1-Q5_K_M 19,6 GB; i1-Q6_K 22,5 GB. Anadir entre 2 y 8 GB adicionales segun longitud de contexto y tamano de batch.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para las mismas cuantizaciones; A100 40/80 GB o H100 para Q6_K y para servir con vLLM o sglang en produccion.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M o inferiores; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) con IQ3_S o Q3_K_M; en GPUs de 12 GB solo con Q2_K y contexto reducido.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y sglang para los pesos originales en safetensors (declarados compatibles por el autor); el modelo base menciona fp8 y AWQ como formatos adicionales.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-Mythos-Class-Agentic-i1-GGUF (este) | 27,3 B | no disponible | Apache 2.0 | GGUF (2-6 bits) | Abliterated, agentico, 3 idiomas |
| Qwen3.8-27B-Uncensored-Mythos-Class-Agentic (base) | 27,3 B | no disponible | Apache 2.0 | safetensors | Version sin cuantizar del mismo modelo |
| Qwen3.8-27B-Uncensored-Mythos-Class-Agentic-GGUF (estatico) | 27,3 B | no disponible | Apache 2.0 | GGUF estatico | Mismo autor, cuantizaciones sin imatrix |

No se dispone de datos de benchmarks ni de modelos comparables de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "abliterated" y "uncensored": no aplica rechazos ante contenido danino, ilegal o sensible; requiere filtros y supervision externos en cualquier despliegue en produccion.
- Riesgo elevado de alucinacion: no se documenta el entrenamiento, por lo que no hay garantias sobre la fiabilidad factual.
- Cobertura idiomatica limitada a ingles, chino y arabe; el castellano no esta declarado y su rendimiento es incierto.
- Longitud de contexto no documentada: no se puede planificar el uso en tareas de contexto largo sin verificacion empirica.
- La model card no incluye datos de entrenamiento, evaluacion ni sesgos conocidos; la trazabilidad del modelo es baja.
- Licencia Apache 2.0 declarada, pero el modelo base es un derivado de Qwen3.8; conviene verificar las obligaciones de la licencia original antes de uso comercial.
- El repositorio ocupa 218,6 GB en total por incluir todas las cuantizaciones; descargar solo el fichero necesario.
- Las cuantizaciones de 2-3 bits degradan la calidad de forma notable; el autor recomienda IQ3_S o superiores frente a Q3_K.
- No se declaran capacidades multimodales ni modo de razonamiento extendido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic-i1-GGUF
- Modelo base: https://huggingface.co/0xSojalSec/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Mythos-Class-Agentic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-Uncensored-Mythos-Class-Agentic-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
