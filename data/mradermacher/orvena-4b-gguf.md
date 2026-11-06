# mradermacher/Orvena-4B-GGUF

## Resumen

Orvena-4B-GGUF es la distribucion en formato GGUF del modelo Orvena-4B, un modelo de lenguaje de 4.326.350.848 parametros (aproximadamente 4,3 mil millones) desarrollado por el equipo Orvena y cuantizado por mradermacher. El modelo original esta disenado especificamente para tool use, function calling y flujos de agentes, con un enfasis declarado en despliegue on-device (incluyendo iPhone) y soporte del protocolo MCP (Model Context Protocol). La presente ficha cubre la version cuantizada, que es la que se distribuye en este repositorio.

La relevancia de esta publicacion radica en su combinacion de tamano contenido (apto para hardware de consumo), licencia Apache 2.0 permisiva y un conjunto amplio de 30 idiomas soportados, incluyendo el castellano. El repositorio incluye cuantizaciones estaticas desde Q2_K hasta f16, ademas de ficheros mmproj (Q8_0 y f16) que sugieren capacidad multimodal en el modelo base, aunque la model card no detalla el alcance de dicha funcionalidad.

No se dispone de informacion publica sobre la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks en la informacion proporcionada. El repositorio tiene un tamano total de 41,0 GB y registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una publicacion muy reciente (creada el 5 de noviembre de 2026).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, segun tags de transformers) |
| Parametros totales | 4.326.350.848 (aproximadamente 4,3 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | bg, cs, da, de, el, en, es, et, fi, fr, hi, hr, hu, id, it, ja, ko, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi (30 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Orvena-4B en la documentacion proporcionada. Los tags del repositorio indican compatibilidad con la libreria transformers y la presencia de ficheros mmproj (multi-modal projector) sugiere una arquitectura multimodal con proyeccion de vision, aunque no se especifica el codificador visual ni el esquema de fusion. El hecho de que el modelo se distribuya con cuantizaciones que van desde 2,1 GB (Q2_K) hasta 8,8 GB (f16) es consistente con un transformer denso de aproximadamente 4,3 mil millones de parametros.

Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. La model card del repositorio cuantizado se limita a describir el proceso de cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) y a listar los ficheros generados; no incluye informacion sobre el entrenamiento del modelo original. Los tags tool-use, function-calling, agent, on-device, iphone y mcp indican que el modelo fue ajustado especificamente para esos casos de uso, pero no se documenta la metodologia.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag conversational del repositorio.
- Tool use y function calling: el modelo esta etiquetado explicitamente para invocar herramientas y funciones externas.
- Soporte de agentes: los tags agent y mcp indican capacidad para flujos de razonamiento multi-paso y uso del Model Context Protocol.
- Despliegue on-device: etiquetado para ejecucion en dispositivos, con mencion explicita a iPhone.
- Multilingue: 30 idiomas declarados, incluyendo castellano, ingles, aleman, frances, italiano, portugues, neerlandes, polaco, ruso, japones, coreano, chino (no listado explicitamente, pero presente el tag zh en otros modelos similares; en este caso no aparece), hindi, vietnamita, turco y la mayoria de lenguas eslavas y balticas.
- Capacidad multimodal: la presencia de ficheros mmproj sugiere soporte de entrada visual, aunque no se detalla en la model card.
- Compatibilidad con endpoints: el tag endpoints_compatible indica integracion con infraestructuras de inferencia estandar.

## Casos de uso

- Agentes autonomos en dispositivos moviles: el modelo esta etiquetado para on-device e iPhone, y sus cuantizaciones Q4_K_S (2,7 GB) y Q4_K_M (2,9 GB) permiten ejecucion en telefonos de gama alta con memoria unificada suficiente, habilitando asistentes locales sin conexion.
- Automatizacion de flujos con MCP: al soportar el Model Context Protocol, puede integrarse como cerebro de agentes que consultan servidores MCP para acceder a herramientas, bases de datos o APIs externas en pipelines de automatizacion.
- Function calling en backend de bajo coste: con 4,3 mil millones de parametros y licencia Apache 2.0, es adecuado para desplegar servicios de invocacion de funciones en GPUs de consumo o CPUs, reduciendo costes frente a modelos de mayor tamano.
- Asistente de atencion al cliente multilingue: los 30 idiomas soportados permiten atender consultas en castellano, ingles, aleman, frances y otras lenguas europeas con un unico modelo, simplificando el despliegue en entornos multinacionales.
- Prototipado rapido de agentes con llama.cpp u Ollama: la disponibilidad de cuantizaciones desde Q2_K hasta Q8_0 permite iterar en portatiles sin GPU dedicada y escalar posteriormente a Q8_0 o f16 en servidor.
- Extraccion de informacion estructurada: el soporte de function calling facilita tareas de parsing de documentos y generacion de JSON validado en pipelines de datos, con la ventaja de poder ejecutarse en local por motivos de privacidad.
- Educacion e investigacion: al ser un modelo pequeno, permisivo y multilingue, sirve como base para experimentos de ajuste fino y evaluacion de tecnicas de agente en entornos academicos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: aproximadamente 2,1 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L: entre 2,2 y 2,6 GB.
  - IQ4_XS / Q4_K_S / Q4_K_M: entre 2,7 y 2,9 GB.
  - Q5_K_S / Q5_K_M: entre 3,2 y 3,3 GB.
  - Q6_K: aproximadamente 3,7 GB.
  - Q8_0: aproximadamente 4,7 GB.
  - f16: aproximadamente 8,8 GB.
- Ficheros mmproj adicionales: 0,5 GB (Q8_0) y 0,8 GB (f16), a sumar si se usa la funcionalidad multimodal.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas para este tamano y permitiran contextos largos y mayor throughput. En CPU, un sistema con 8-16 GB de RAM es suficiente para las cuantizaciones pequenas.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas de VRAM; tambien en Apple Silicon con memoria unificada y en iPhone de gama alta mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; el tag endpoints_compatible sugiere integracion con infraestructuras tipo TGI o vLLM (aunque vLLM requiere conversion a safetensors para maximo rendimiento).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Orvena-4B-GGUF | 4,3 mil millones | no disponible | Apache 2.0 | GGUF | Tool use, MCP, on-device, 30 idiomas |
| Qwen2.5-3B-Instruct | 3,1 mil millones | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Multilingue, function calling, muy extendido |
| Llama-3.2-3B-Instruct | 3,2 mil millones | 128.000 tokens (segun documentacion publica de Meta) | Llama 3.2 Community License | safetensors, GGUF | Multilingue limitado, sin MCP nativo |
| Phi-3.5-mini-instruct | 3,8 mil millones | 128.000 tokens (segun documentacion publica de Microsoft) | MIT | safetensors, GGUF | Razonamiento y codigo, sin enfoque agentico declarado |

La comparativa se basa en caracteristicas publicas de modelos de tamano similar; no se dispone de datos de rendimiento de Orvena-4B para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- No se han publicado datos de benchmarks, por lo que no es posible evaluar su calidad relativa frente a alternativas establecidas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; es una publicacion muy reciente y sin validacion comunitaria.
- No se documenta la longitud de contexto, lo que impide planificar despliegues con ventanas largas sin pruebas previas.
- Riesgo de alucinacion inherente a modelos de 4 mil millones de parametros; se recomienda validacion externa en produccion.
- Aunque la licencia es Apache 2.0 (permisiva para uso comercial), conviene verificar la licencia del modelo base Orvena/Orvena-4B, ya que el repositorio cuantizado enlaza a un fichero LICENSE del modelo original.
- La funcionalidad multimodal sugerida por los ficheros mmproj no esta documentada; su alcance y calidad son desconocidos.
- El soporte de 30 idiomas no garantiza calidad uniforme; no se aportan evaluaciones por idioma.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad y la fiabilidad del function calling; se recomienda Q4_K_M o superior para uso agentico.
- No se dispone de informacion sobre sesgos conocidos ni sobre filtros de seguridad aplicados durante el entrenamiento.

## Enlaces

- Repositorio Hugging Face del modelo cuantizado: https://huggingface.co/mradermacher/Orvena-4B-GGUF
- Modelo base: https://huggingface.co/Orvena/Orvena-4B
- Licencia del modelo base: https://huggingface.co/Orvena/Orvena-4B/blob/main/LICENSE
- Pagina de descargas convenientes del cuantizador: https://hf.tst.eu/model#Orvena-4B-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guia sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
