# mradermacher/PC-Agent-E-GGUF

## Resumen

PC-Agent-E-GGUF es una colección de cuantizaciones en formato GGUF del modelo base `henryhe0123/PC-Agent-E`, publicada por el usuario mradermacher (nethype GmbH) el 20 de mayo de 2025. No se trata de un modelo entrenado por mradermacher, sino de una conversión a GGUF del modelo original de henryhe0123, afinado mediante llama-factory sobre el dataset `henryhe0123/PC-Agent-E`. El modelo cuenta con 72.706.203.648 parámetros totales (aproximadamente 72,7 mil millones), lo que lo sitúa en la categoría de modelos de gran tamaño tipo 70B.

La relevancia de esta publicación radica en que facilita el despliegue local del modelo original mediante llama.cpp y herramientas compatibles con GGUF, incluyendo cuantizaciones desde Q2_K hasta Q8_0 y suplementos multimodales (mmproj) en Q8_0 y f16. El modelo está orientado a inglés y etiquetado como conversacional y compatible con endpoints, con licencia MIT tanto en el modelo base como en las cuantizaciones.

La información pública disponible sobre el modelo base es muy limitada: no se detalla la arquitectura interna, la longitud de contexto ni los datos de entrenamiento más allá de la referencia al dataset homónimo. Esta ficha recoge exclusivamente los datos verificables en la model card y en los metadatos de Hugging Face, indicando explícitamente cuando un dato no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer, inferido por el formato y el pipeline de llama-factory; no confirmado en la informacion) |
| Parametros totales | 72.706.203.648 (72,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; suplementos multimodales mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones); el modelo base original se distribuye en safetensors segun los metadatos de parametros |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `henryhe0123/PC-Agent-E`. Los metadatos indican que fue afinado con llama-factory (etiquetas `llama-factory`, `full`, `generated_from_trainer`), lo que sugiere un ajuste completo (full fine-tuning) sobre un modelo preentrenado, pero no se especifica cual es el modelo origen ni su familia arquitectonica. El tamano de 72,7 mil millones de parametros es consistente con arquitecturas transformer densas de gran escala, aunque no se confirma en la informacion disponible.

El dataset de entrenamiento referenciado es `henryhe0123/PC-Agent-E`, de tematica aparentemente orientada a agentes de PC (control de ordenador), aunque no se detalla su composicion, numero de tokens ni si hubo etapas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La publicacion de mradermacher se limita a la conversion y cuantizacion estatica del modelo, sin aportar informacion adicional sobre el entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Capacidades multimodales: la presencia de ficheros `mmproj` (Q8_0 y f16) indica soporte de entrada visual, presumiblemente para tareas de agente sobre interfaz grafica, aunque no se detalla en la model card.
- Orientacion a tareas de agente de PC: el nombre del modelo y del dataset (`PC-Agent-E`) sugieren uso en automatizacion de interacciones con el escritorio, aunque no se documentan formalmente las capacidades de tool calling o function calling.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse mediante la infraestructura de endpoints de Hugging Face.
- Soporte de inferencia local mediante llama.cpp y derivados (formato GGUF).
- Capacidades multilingues: limitadas al ingles segun los metadatos (`language: en`).
- No se documentan modos de razonamiento extendido (thinking), audio ni otras capacidades especiales.

## Casos de uso

- Automatizacion de tareas de escritorio: el modelo, por su nombre y dataset, esta orientado a interpretar instrucciones y generar acciones sobre un PC; puede integrarse en agentes que controlen raton, teclado o aplicaciones mediante APIs de automatizacion.
- Asistente conversacional local en ingles: desplegado con llama.cpp u Ollama, permite conversaciones multi-turno en entornos sin conexion, con la ventaja de la licencia MIT para uso comercial.
- Procesamiento de capturas de pantalla: gracias a los suplementos mmproj, puede emplearse en pipelines que reciben imagenes de la pantalla y generan descripciones o acciones, util en testing de interfaces o accesibilidad.
- Investigacion sobre agentes multimodales: sirve como base para experimentos academicos de agentes que combinan vision y texto, al poder ejecutarse en hardware propio con cuantizaciones Q4.
- Prototipado de asistentes de soporte tecnico: con contexto conversacional y capacidad de analizar capturas, puede ayudar a diagnosticar problemas de software en ingles.
- Despliegue en entornos con requisitos de privacidad: al ser GGUF y ejecutable localmente, permite procesar datos sensibles sin enviarlos a la nube, con cuantizaciones Q4_K_M de 47,5 GB.
- Fine-tuning posterior o evaluacion comparativa: al estar bajo licencia MIT, puede usarse como punto de partida para ajustes adicionales o como referencia en estudios de cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~29,9 GB
  - Q3_K_M: ~37,8 GB
  - IQ4_XS: ~40,3 GB
  - Q4_K_S: ~44,0 GB
  - Q4_K_M: ~47,5 GB (recomendado por el autor por velocidad)
  - Q5_K_M: ~54,5 GB
  - Q6_K: ~64,4 GB
  - Q8_0: ~77,4 GB
  - Suplemento multimodal mmproj: 0,9 GB (Q8_0) o 1,5 GB (f16)
- GPU recomendadas: para Q4_K_M se necesita al menos una GPU con 48 GB (A6000, L40S, A100 40GB no basta; A100 80GB o H100 80GB son adecuadas). Para Q8_0 se requiere una H100 80GB o configuracion multi-GPU.
- Consumer GPU: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) con cuantizaciones de calidad; solo Q2_K (~30 GB) se acerca, pero sigue superando la VRAM de una sola tarjeta consumer. Se requiere offloading a RAM o configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (koboldcpp, text-generation-webui). Para el modelo base en safetensors: vLLM o TGI, aunque no se documenta soporte oficial.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| PC-Agent-E (este) | 72,7 B | no disponible | MIT | GGUF, safetensors | Orientado a agentes de PC, multimodal |
| Llama 3.1 70B | 70 B | 128K | Llama 3.1 Community | safetensors, GGUF | Referencia generalista, no especifico de agentes |
| Qwen2.5 72B | 72,7 B | 128K | Apache 2.0 | safetensors, GGUF | Multilingue, amplio soporte de tool calling |
| Mistral Large 2 | 123 B | 128K | Mistral Research | safetensors | Mayor tamano, no comparable directamente |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo PC-Agent-E que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Informacion muy escasa: la model card no documenta arquitectura, contexto, datos de entrenamiento ni evaluaciones, lo que dificulta validar su calidad en produccion.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; sin benchmarks no puede acotarse.
- Sesgos: no documentados; al desconocerse la composicion del dataset, no pueden evaluarse sesgos de genero, raza o ideologicos.
- Licencia MIT: permite uso comercial y modificacion, pero el autor de la cuantizacion no ofrece garantias sobre el modelo base.
- Cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente el rendimiento; el autor recomienda Q4_K_S o Q4_K_M para equilibrio velocidad/calidad.
- No hay cuantizaciones con imatrix (weighted) disponibles segun la model card, lo que limita la calidad en tamanos pequenos.
- El modelo base tiene un repositorio con posible bucle de referencia (la model tree no se pudo construir), lo que puede indicar problemas de trazabilidad.
- Uso en produccion: requiere validacion exhaustiva y no se recomienda para tareas criticas sin evaluacion previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/PC-Agent-E-GGUF
- Modelo base: https://huggingface.co/henryhe0123/PC-Agent-E
- Dataset de entrenamiento: https://huggingface.co/datasets/henryhe0123/PC-Agent-E
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#PC-Agent-E-GGUF
- Estadisticas de descargas: https://modelpulse.ifsp.dev/model/mradermacher/PC-Agent-E-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
