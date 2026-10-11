# Nekodeus/qwen2-7b-instruct-openvino

## Resumen

Este repositorio contiene una conversion a OpenVINO IR del modelo Qwen/Qwen2-7B-Instruct, publicada por el usuario Nekodeus. Se trata de un transformer decoder-only de 7,6 mil millones de parametros, cuantizado a INT8 en los pesos (weight-only, via NNCF) y exportado con optimum-intel para su ejecucion sobre el runtime de OpenVINO. La conversion se realizo en un entorno Kaggle sin GPU y sin acceso a red, usando optimum-cli, por lo que el resultado es un artefacto reproducible con un unico comando documentado en la propia model card.

El valor practico del repositorio no esta en el modelo en si (cuyo original publica Qwen/Alibaba bajo licencia Apache-2.0), sino en el formato: al estar en OpenVINO IR con pesos INT8, permite servir las capacidades de un modelo de 7B en CPU x86 moderna (y opcionalmente en GPU Intel Arc o iGPU) sin necesidad de GPU dedicada. El tamano del repositorio es de 7,6 GB, coherente con pesos de 8 bits y activaciones en FP16/FP32 segun el trazado.

Se trata, por tanto, de una ficha de despliegue mas que de un modelo nuevo: no hay entrenamiento, fine-tuning ni evaluacion propia. El autor no publica resultados de benchmarks del artefacto cuantizado, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta, ademas de una fecha de creacion anomala (2026-10-11). Debe tratarse como un experimento de conversion, no como un artefacto de produccion validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2ForCausalLM) con Grouped Query Attention y RoPE |
| Parametros totales | 7,6 mil millones (segun model card); el modelo base declara 7,61B |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no indicada en la model card; el modelo base Qwen2-7B-Instruct soporta 32.768 tokens, ampliables con YaRN |
| Tipos de cuantizacion | INT8 weight-only con NNCF; activaciones en FP16/FP32 segun trazado. No se ofrecen GGUF, AWQ, GPTQ ni FP16 |
| Idiomas soportados | no disponible en la model card; el modelo base declara soporte de 29 idiomas (entre ellos espanol, ingles, chino, frances, aleman) |
| Licencia | Apache-2.0 |
| Formato de pesos | OpenVINO IR (composicion de ficheros .xml de grafo y .bin de pesos) |

## Arquitectura y entrenamiento

El artefacto no implica entrenamiento alguno: es una conversion de pesos y grafo del checkpoint Qwen/Qwen2-7B-Instruct a OpenVINO IR con cuantizacion INT8 solo de pesos, generada con `optimum-cli export openvino --weight-format int8`. Las versiones declaradas por el autor son optimum-intel 2.2.0, openvino 2026.4.1 y transformers 5.16.1. La arquitectura subyacente es la del modelo base: transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, RoPE con theta 1.000.000 y GQA (relacion de 7 a 1 entre cabezas de consulta y cabezas KV, 28 frente a 4, con head_dim 128). El modelo base se entreno sobre del orden de 7 billones de tokens y se alineo mediante SFT y optimizacion por preferencias; esta informacion proviene de la documentacion publica de Qwen, no del repositorio analizado.

La innovacion tecnica relevante aqui es el propio pipeline de exportacion: la cuantizacion weight-only reduce el peso en disco y en memoria aproximadamente a la mitad respecto a FP16, manteniendo las activaciones en mayor precision para preservar calidad. El coste es que el artefacto queda atado al runtime de OpenVINO: no es un checkpoint de transformers estandar ni un fichero GGUF. La model card ofrece dos vias de consumo, via `OVModelForCausalLM` de optimum-intel en Python y via `ov::genai::LLMPipeline` en C++, ambas con el dispositivo "CPU" como destino explicito.

## Capacidades

- Generacion de texto conversacional en modo instruct, heredada del ajuste del modelo base Qwen2-7B-Instruct.
- Razonamiento de varios pasos y respuesta a instrucciones complejas, con soporte de modo de pensamiento ligero propio de la familia Qwen2-Instruct.
- Generacion de codigo en multiples lenguajes de programacion.
- Razonamiento matematico y resolucion de problemas aritmeticos planteados en lenguaje natural.
- Soporte de tool calling / function calling mediante plantillas de prompt estilo Hermes, segun la documentacion del modelo base.
- Capacidad de operar como agente en flujos multi-turno con llamadas a herramientas encadenadas.
- Multilingue: el modelo base declara 29 idiomas, si bien la model card de esta conversion no especifica ninguno.
- Capacidad de inferencia en CPU sin GPU dedicada, GPU Intel (Arc, iGPU) y NPU mediante OpenVINO, segun el dispositivo que se seleccione en el runtime.
- No dispone de vision, audio ni modalidad distinta de texto.

Advertencia: ninguna de estas capacidades ha sido evaluada por el autor en la version INT8, por lo que su preservacion es una expectativa razonable, no un dato verificado.

## Casos de uso

- Inferencia en servidores sin GPU: el artefacto esta pensado para ejecutarse sobre CPU x86 con el runtime de OpenVINO, lo que permite desplegar un asistente de 7B en maquinas virtuales o servidores de gama media sin acelerador dedicado, con un consumo de memoria del orden de 10 GB de RAM.
- Entornos air-gapped y con requisitos de soberania del dato: al ser un artefacto descargable de 7,6 GB y no requerir llamadas a APIs externas, encaja en despliegues on-premise donde el texto no puede salir de la organizacion (sanidad, sector publico, banca).
- Procesamiento por lotes de documentos: clasificacion, resumen y extraccion de campos sobre volumenes grandes de texto pueden ejecutarse por lotes en CPU, sacrificando latencia por coste, siempre que se ajuste manualmente el tamano de lote y el contexto.
- Generacion de codigo en pipelines internos: con tool calling heredado del modelo base, puede integrarse en asistentes de repositorio o revision de parches, aunque requiere validacion humana por el riesgo de alucinacion en APIs.
- Chatbot de atencion al cliente en escenarios de baja concurrencia: la ventana de contexto de 32.768 tokens del modelo base permite mantener historiales largos, pero la ausencia de evaluacion del artefacto INT8 obliga a medir degradacion antes de exponerlo a usuarios finales.
- Clasificacion de intenciones y enrutado en arquitecturas RAG: uso como componente barato de triaje previo a un modelo mayor, aprovechando que corre en CPU y libera la GPU para el modelo principal.
- Prototipado en portatiles y mini-PC con CPU Intel: validar prompts, plantillas y flujos de agente localmente antes de mover el sistema a un entorno con acelerador, evitando costes de GPU en la fase de desarrollo.
- Despliegue en edge industrial con Intel Arc o iGPU: OpenVINO permite mover el mismo artefacto entre dispositivos CPU, GPU y NPU sin reconvertir el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor no incluye ninguna tabla de evaluacion del artefacto INT8, ni comparacion con el checkpoint FP16 original, ni medida de latencia o throughput. El modelo base Qwen2-7B-Instruct si tiene resultados publicados en su propia model card y en el informe tecnico de Qwen2, pero no se han reproducido ni verificado para esta conversion cuantizada, por lo que no se replican aqui cifras que no han sido comprobadas en este artefacto.

## Requisitos de hardware

- Peso en disco: aproximadamente 7,6 GB, segun el tamano del repositorio. Los pesos INT8 ocupan en torno a 7,3 GB, con el resto correspondiente a tokenizer, configuracion y grafos XML.
- Memoria RAM para CPU: presupuestar entre 10 y 12 GB libres. A los pesos hay que sumar la cache KV: con 28 capas, 4 cabezas KV y head_dim 128, cada token consume unos 56 KiB en FP16, lo que equivale a unos 224 MiB para 4.096 tokens y a unos 1,8 GiB para 32.768 tokens.
- VRAM para GPU: no disponible de forma oficial. Como referencia de calculo, la version FP16 del modelo base requiere unos 15,5 GB solo en pesos, por lo que una RTX 4090 (24 GB) la ejecutaria con contexto moderado; la version INT8 aqui publicada, si se sirve en GPU Intel via OpenVINO, se situaria en torno a 8-9 GB de VRAM mas cache KV.
- GPU recomendadas: el artefacto esta orientado a CPU, por lo que no exige GPU. Para aceleracion pueden usarse GPU Intel Arc (A770, B580), iGPU Intel recientes o NPU con los plugins de OpenVINO. No hay evidencia de uso probado en A100 o H100; para esos aceleradores el checkpoint original en transformers es la via natural.
- Cabe en GPU de consumo: la version INT8 cabe en GPUs con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4090) si el runtime dispone del plugin correspondiente, aunque ese no es el escenario objetivo del autor. Cabe igualmente en un mini-PC o portatil con 16 GB de RAM.
- Opciones de despliegue: OpenVINO Runtime via optimum-intel (`OVModelForCausalLM`), OpenVINO GenAI (`ov::genai::LLMPipeline`), OpenVINO Model Server y servicios que envuelvan el runtime. No es compatible de forma directa con vLLM, llama.cpp, Ollama ni TGI, que requieren formatos distintos (safetensors, GGUF).
- Latencia y throughput estimados: no disponible. El autor no publica mediciones.

## Comparativa con modelos similares

Los datos de la tabla proceden de las model cards publicas de cada modelo y no han sido verificados en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Formatos publicados | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2-7B-Instruct OpenVINO INT8 (este repo) | 7,6B | no indicada; 32.768 en el base | Apache-2.0 | OpenVINO IR INT8 | HuggingFace, 0 descargas |
| Qwen/Qwen2-7B-Instruct | 7,6B | 32.768 (ampliable con YaRN) | Apache-2.0 | safetensors | HuggingFace, ampliamente usado |
| Mistral-7B-Instruct-v0.3 | 7,25B | 32.768 | Apache-2.0 | safetensors, GGUF | HuggingFace |
| Llama-3.1-8B-Instruct | 8,03B | 128.000 | Llama 3.1 Community License | safetensors, GGUF | HuggingFace |
| Gemma-2-9B-it | 9,24B | 8.192 | Gemma Terms of Use | safetensors, GGUF | HuggingFace |

La diferencia relevante frente a las alternativas no esta en capacidad, sino en formato y soporte: Mistral, Llama y Gemma cuentan con ecosistemas de cuantizacion GGUF listos para llama.cpp y Ollama, mientras que este artefacto solo es consumible desde OpenVINO. A cambio, ofrece un camino de despliegue en CPU con cuantizacion oficial via NNCF.

## Limitaciones y advertencias

- No hay ninguna evaluacion publicada del artefacto INT8: se desconoce la degradacion de calidad respecto al checkpoint FP16, especialmente en tareas de codigo y matematicas, que suelen ser las mas sensibles a la cuantizacion.
- Los pesos en INT8 y las activaciones en FP16/FP32 pueden generar pequenas discrepancias numericas acumuladas en generaciones largas.
- Riesgo de alucinacion inherente a un modelo de 7B sin capa de verificacion: no debe usarse como fuente de verdad en dominios medicos, legales o financieros sin supervision humana.
- Sesgos: los del modelo base, derivados de su corpus de entrenamiento, principalmente en ingles y chino. La model card no documenta evaluacion de sesgos.
- Contexto: no se especifica si la conversion preserva los 32.768 tokens del modelo base ni si soporta la extension YaRN. Verificar antes de disenar flujos con historiales largos.
- Idiomas: la model card no declara ningun idioma, por lo que el soporte multilingue, incluido el espanol, es una expectativa heredada del modelo base y no una garantia del artefacto.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, pero el autor de la conversion no ofrece garantias de ningun tipo ni soporte.
- Cadena de suministro: el artefacto procede de un unico autor con 0 descargas y 0 likes, sin verificacion comunitaria ni hash firmado publicado. Para produccion, es preferible reproducir la conversion con el comando documentado en la model card a partir del checkpoint oficial de Qwen.
- Metadatos sospechosos: la fecha de creacion registrada (2026-10-11) y las versiones de libreria declaradas (openvino 2026.4.1, transformers 5.16.1) no son coherentes con el estado actual del ecosistema, lo que sugiere un entorno de exportacion simulado o mal etiquetado.
- Incompatibilidad de tooling: al no existir version GGUF ni safetensors, no puede desplegarse con vLLM, TGI, llama.cpp u Ollama sin reconvertir el modelo desde el checkpoint original.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Nekodeus/qwen2-7b-instruct-openvino
- Modelo base: https://huggingface.co/Qwen/Qwen2-7B-Instruct
- optimum-intel (herramienta de exportacion): https://github.com/huggingface/optimum-intel
- Documentacion de OpenVINO: https://docs.openvino.ai
- NNCF, libreria de cuantizacion usada: https://github.com/openvinotoolkit/nncf
- Blog de la familia Qwen2: https://qwenlm.github.io/blog/qwen2/
- Informe tecnico de Qwen2: https://arxiv.org/abs/2407.10671

La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: todos los resultados apuntaban a un servicio de generacion de video ajeno por completo al contenido de la ficha.
