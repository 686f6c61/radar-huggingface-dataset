# mradermacher/UI-Venus-1.5-2B-GGUF

## Resumen

UI-Venus-1.5-2B-GGUF es la versión cuantizada en formato GGUF del modelo UI-Venus-1.5-2B, desarrollado originalmente por inclusionAI. Se trata de un modelo multimodal especializado en tareas de interfaz gráfica de usuario (GUI) y automatización de agentes, orientado a la comprensión de capturas de pantalla y la generación de acciones sobre interfaces. Con 2.031.739.904 parámetros (aproximadamente 2.000 millones), es un modelo compacto pensado para despliegue en entornos con recursos limitados.

La relevancia de esta versión radica en que mradermacher ha generado un conjunto completo de cuantizaciones estáticas que abarcan desde Q2_K (1,0 GB) hasta f16 (4,2 GB), incluyendo variantes IQ y archivos mmproj separados para el componente multimodal. Esto permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo imposible con los pesos originales en precisión completa.

El modelo se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial, y declara soporte únicamente para inglés. Su enfoque en agentes GUI lo posiciona como una alternativa ligera para tareas de automatización de interfaz, comprensión de pantallas y ejecución de acciones estructuradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal para GUI y agentes; arquitectura base no detallada en la informacion) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Los metadatos indican que se trata de un modelo multimodal ("multimodel") orientado a GUI y agentes, con un componente de proyeccion multimodal separado (mmproj) que se distribuye como archivo adicional en las cuantizaciones. El modelo base es inclusionAI/UI-Venus-1.5-2B, del que no se detallan en esta ficha el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La version aqui descrita es una cuantizacion estatica generada por mradermacher mediante su pipeline de conversion (convert_type: hf, quantize_version: 2, output_tensor_quantised: 1). Se ofrece tambien una variante con cuantizacion ponderada por imatrix en un repositorio separado (UI-Venus-1.5-2B-i1-GGUF), que suele ofrecer mejor calidad por tamano que las cuantizaciones estaticas equivalentes.

## Capacidades

- Comprension de interfaces graficas de usuario (GUI): interpretacion de capturas de pantalla y elementos de interfaz.
- Generacion de acciones sobre GUI: el modelo esta orientado a tareas de agente que requieren decidir y ejecutar acciones sobre pantallas.
- Procesamiento multimodal: incluye un proyector multimodal (mmproj) que permite entrada de imagenes junto con texto.
- Uso conversacional: etiquetado como "conversational" en los metadatos.
- Compatibilidad con endpoints: etiqueta "endpoints_compatible" en los metadatos de HuggingFace.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Modo thinking, vision o audio: vision si (multimodal con mmproj); thinking y audio no disponibles en la informacion.

## Casos de uso

- Automatizacion de pruebas de interfaz: el modelo puede interpretar capturas de pantalla de una aplicacion y generar acciones de clic o entrada para validar flujos de UI en pipelines de QA, aprovechando su naturaleza de agente GUI.
- Asistentes de navegacion web: integrado en un agente, puede analizar la pantalla del navegador y decidir el siguiente paso en tareas de navegacion automatizada, como rellenar formularios o localizar elementos.
- Soporte de accesibilidad: descripcion de elementos de interfaz a partir de capturas de pantalla para usuarios con discapacidad visual, generando descripciones textuales de la disposicion de la UI.
- Automatizacion de escritorio en entornos con recursos limitados: al caber en cuantizaciones de 1,0-1,4 GB, puede ejecutarse en portatiles y equipos sin GPU dedicada mediante llama.cpp, habilitando agentes de escritorio locales.
- Extraccion de informacion de pantallas: conversion de capturas de aplicaciones en datos estructurados (texto de formularios, valores de tablas) para su volcado a bases de datos o sistemas de registro.
- Prototipado rapido de agentes GUI: su tamano reducido y licencia Apache 2.0 lo hacen adecuado para experimentar con arquitecturas de agente en fase de investigacion sin costes de infraestructura elevados.
- Despliegue en el borde (edge computing): ejecucion en dispositivos con poca memoria (Raspberry Pi con 4-8 GB, mini-PC) para tareas de monitorizacion de pantalla o asistencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0 GB (Q2_K), 1,3-1,4 GB (Q4_K_S / Q4_K_M), 2,3 GB (Q8_0) y 4,2 GB (f16). A estas cifras hay que sumar el archivo mmproj (0,5 GB en Q8_0 o 0,9 GB en f16) si se usa la entrada multimodal.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM puede ejecutar las cuantizaciones Q4; para f16 se recomienda al menos 6 GB. GPU de datacenter (A100, H100) no son necesarias dado el tamano del modelo.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (GTX 1650 4 GB en adelante) e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion del GGUF), LM Studio y otros runners compatibles con GGUF. Para el modelo base en safetensors, transformers con el pipeline correspondiente.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano (2B parametros), se espera una latencia baja en GPU consumer, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| UI-Venus-1.5-2B-GGUF | 2,03 B | no disponible | GUI / agente multimodal | Apache 2.0 | GGUF |
| Modelos GUI de mayor tamano (p. ej. familia UI-TARS) | no disponible en esta ficha | no disponible | GUI / agente | no disponible | no disponible |
| Modelos multimodales ligeros de proposito general (p. ej. Qwen2-VL-2B) | ~2 B | no disponible en esta ficha | Vision-lenguaje general | no disponible en esta ficha | safetensors / GGUF |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a categoria y tamano.

## Limitaciones y advertencias

- Idioma: el modelo declara soporte unicamente para ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Especializacion: esta orientado a tareas GUI y de agente; su rendimiento en tareas genericas de texto, codigo o matematicas puede ser inferior al de modelos de proposito general del mismo tamano.
- Alucinacion: como todo modelo de lenguaje, puede generar descripciones de interfaz o acciones incorrectas; en automatizacion GUI esto puede provocar clics erroneos, por lo que se recomienda validacion y limites de seguridad en produccion.
- Contexto: no se dispone de la longitud de contexto, lo que impide evaluar su idoneidad para conversaciones o pantallas de gran complejidad.
- Cuantizacion: las variantes Q2_K y Q3_K_M degradan la calidad; para produccion se recomienda Q4_K_M o superior, o las variantes imatrix del repositorio i1.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base original (inclusionAI/UI-Venus-1.5-2B) por si impone condiciones adicionales.
- Componente multimodal: es necesario descargar y cargar el archivo mmproj por separado; sin el, el modelo no procesa imagenes.
- Sesgos: no se documentan sesgos especificos en la informacion proporcionada.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/mradermacher/UI-Venus-1.5-2B-GGUF
- Modelo base: https://huggingface.co/inclusionAI/UI-Venus-1.5-2B
- Variante imatrix: https://huggingface.co/mradermacher/UI-Venus-1.5-2B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#UI-Venus-1.5-2B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
