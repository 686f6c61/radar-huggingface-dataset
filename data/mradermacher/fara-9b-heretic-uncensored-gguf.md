# mradermacher/fara-9b-heretic-uncensored-GGUF

## Resumen

Fara-9B-Heretic-Uncensored-GGUF es la versión cuantizada en formato GGUF del modelo lmcfarlin/Fara-1.5-9B-Heretic-Uncensored, un modelo de lenguaje y visión de 8.953.803.264 parámetros (aproximadamente 9B) orientado a la automatización de navegador y a la interacción con ordenadores (computer-use agents). La cuantización la firma mradermacher, un autor habitual en la publicación de versiones GGUF de modelos open source para su uso con llama.cpp y derivados. La relevancia del modelo radica en su especialización como agente web multimodal: combina comprensión de capturas de pantalla con generación de acciones sobre interfaces, lo que lo hace útil para pipelines de automatización de navegador.

El modelo base deriva de la familia Fara (etiquetada como Fara-1.5) y ha sido sometido a un proceso de "abliteration" o decensurado (etiquetas heretic, uncensored, decensored, abliterated), que elimina total o parcialmente los mecanismos de rechazo del modelo original. Esto implica que el modelo responderá a solicitudes que el modelo de referencia filtraría, lo que tiene implicaciones directas para su uso en producción. Se distribuye bajo licencia MIT, lo que permite uso comercial, aunque con las salvedades legales y éticas que se detallan más abajo.

La versión GGUF incluye además un fichero mmproj (proyección multimodal) en cuantizaciones Q8_0 y f16, necesario para procesar entradas de imagen. El repositorio ocupa 83,4 GB en total por la acumulación de todas las cuantizaciones estáticas, y el modelo declara soporte únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal vision-language; pesos derivados de Fara-1.5-9B) |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF (con fichero mmproj para visión); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la información proporcionada. Por las etiquetas y el nombre (Fara-1.5-9B) se trata de un modelo vision-language multimodal con capacidad de computer-use y web-agent, es decir, un transformer con codificador visual y proyección multimodal (mmproj) que permite procesar capturas de pantalla e imágenes junto con texto. El número de parámetros (8.953.803.264) corresponde al modelo de lenguaje; el codificador visual y la proyección añaden parámetros adicionales no desglosados.

Tampoco se detallan los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) ni innovaciones técnicas concretas más allá de la especialización en agentes web. El proceso de "abliteration" aplicado por el autor del modelo base (lmcfarlin) modifica los pesos para eliminar direcciones de rechazo, lo que constituye una intervención sobre el modelo entrenado original. La cuantización realizada por mradermacher es estática (quantize_version 2, output_tensor_quantised 1, convert_type hf), con quants ponderados/imatrix disponibles en un repositorio separado.

## Capacidades

- Generación de texto conversacional en inglés.
- Comprensión de imágenes y capturas de pantalla (visión-language) mediante el fichero mmproj.
- Automatización de navegador (browser-automation) y uso de ordenador (computer-use, cua).
- Comportamiento como agente web: interpretación de la interfaz y generación de acciones.
- Soporte multimodal para tareas de agente que requieren observar la pantalla.
- Modelo decensurado/abliterado: no aplica los rechazos típicos del modelo original.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking explícito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Automatización de navegador para tareas repetitivas: el modelo puede interpretar capturas de la página y generar las acciones necesarias para rellenar formularios, navegar o extraer datos, gracias a su especialización como web-agent y a la entrada multimodal.
- Testing de interfaces web (QA automatizado): útil para recorrer flujos de usuario en un navegador headless y detectar regresiones visuales o de interacción, aprovechando la comprensión de capturas de pantalla.
- Extracción de información de portales: lectura de pantallas y documentos renderizados para estructurar datos en pipelines de scraping controlado, con la ventaja de operar sobre la representación visual y no solo sobre el DOM.
- Asistentes de escritorio para tareas guiadas: el modelo puede servir de motor de decisión en agentes que operan sobre aplicaciones de escritorio mediante capturas de pantalla, dentro de un entorno controlado.
- Investigación sobre alineación y decensurado: al ser una variante abliterada, es útil para estudiar el comportamiento de modelos sin filtros de rechazo, comparando respuestas con el modelo base original en entornos de laboratorio.
- Prototipado de agentes autónomos en local: con las cuantizaciones Q4_K_S o Q4_K_M (5,5–5,8 GB) puede ejecutarse en hardware de consumo, lo que facilita experimentar con agentes web sin depender de APIs externas.
- Generación de datos sintéticos para entrenamiento de agentes: el modelo puede producir trayectorias de interacción sobre interfaces que sirvan como datos de entrenamiento, siempre que se revise el contenido generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,0 GB.
  - Q3_K_S: ~4,4 GB; Q3_K_M: ~4,8 GB; Q3_K_L: ~5,1 GB.
  - IQ4_XS: ~5,4 GB; Q4_K_S: ~5,5 GB; Q4_K_M: ~5,8 GB.
  - Q5_K_S: ~6,4 GB; Q5_K_M: ~6,6 GB.
  - Q6_K: ~7,5 GB; Q8_0: ~9,6 GB; f16: ~18,0 GB.
  - Añadir el mmproj: ~0,7 GB (Q8_0) o ~1,0 GB (f16).
- GPU recomendadas: para cuantizaciones Q4–Q5, tarjetas consumer con 8–12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080). Para Q8_0 o f16, GPUs de 16–24 GB (RTX 4090, A10, L4) o superiores (A100, H100) si se busca mayor throughput.
- Cabe en GPU consumer: sí, en cuantizaciones Q2_K a Q5_K_M con GPUs de 8 GB o más; las versiones Q6_K y Q8_0 requieren 12–16 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio y otros frontends compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, pero esta versión concreta está pensada para llama.cpp. La model card menciona endpoints_compatible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fara-9b-heretic-uncensored-GGUF (este) | 8,95B | no disponible | Sí (mmproj) | MIT | GGUF en HF |
| lmcfarlin/Fara-1.5-9B-Heretic-Uncensored (base) | 8,95B | no disponible | Sí | MIT | safetensors en HF |
| Fara-1.5-9B (modelo original, sin decensurar) | no disponible | no disponible | Sí | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo decensurado/abliterado: los mecanismos de rechazo han sido eliminados o reducidos, por lo que puede generar contenido dañino, ofensivo o ilegal. No es apto para despliegues públicos sin moderación adicional.
- Riesgo elevado de alucinación, especialmente en tareas de agente donde una acción errónea sobre una interfaz puede tener consecuencias reales (envíos de formularios, compras, borrados).
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada; no se debe asumir una ventana amplia para conversaciones o capturas de pantalla extensas.
- Licencia MIT: permite uso comercial, pero el usuario asume la responsabilidad legal sobre el contenido generado y sobre las acciones ejecutadas por el agente. La licencia del modelo base no exime de cumplir la normativa aplicable (RGPD, términos de servicio de los sitios automatizados, etc.).
- La automatización de navegador puede violar los términos de servicio de sitios web; verificar antes de usar en producción.
- El repositorio ocupa 83,4 GB por incluir todas las cuantizaciones; conviene descargar solo el fichero necesario.
- El fichero mmproj es imprescindible para las capacidades de visión; sin él, el modelo funciona solo como texto.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/fara-9b-heretic-uncensored-GGUF
- Modelo base: https://huggingface.co/lmcfarlin/Fara-1.5-9B-Heretic-Uncensored
- Quants ponderados/imatrix: https://huggingface.co/mradermacher/fara-9b-heretic-uncensored-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#fara-9b-heretic-uncensored-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Gráfico de perplejidad de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
