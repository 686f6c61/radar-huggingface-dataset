# mradermacher/ZeroGUI-OSWorld-7B-GGUF

## Resumen

ZeroGUI-OSWorld-7B es un modelo multimodal especializado en interacción con interfaces gráficas de usuario (GUI), desarrollado originalmente por OpenGVLab y distribuido en formato GGUF por mradermacher. El modelo parte de una arquitectura transformer de aproximadamente 7.615 millones de parámetros y está entrenado para interpretar capturas de pantalla y generar acciones sobre entornos de escritorio, lo que lo sitúa en la categoría de agentes GUI (*computer-use agents*). Su nombre hace referencia a OSWorld, el benchmark de evaluación de agentes que operan sistemas operativos reales.

La relevancia de esta ficha radica en que se trata de una cuantización comunitaria (no oficial) del modelo base, publicada bajo licencia Apache 2.0, que permite ejecutar un agente GUI multimodal en hardware de consumo mediante llama.cpp y derivados. El repositorio incluye tanto los pesos del modelo de lenguaje en distintos niveles de cuantización como los ficheros `mmproj` necesarios para el codificador visual, lo que habilita el pipeline multimodal completo.

Al estar orientado a un dominio muy específico (automatización de escritorio y control de aplicaciones), no compite con modelos generalistas, sino con otros agentes GUI como los derivados de Qwen-VL o los modelos específicos de OSWorld. Esta ficha documenta exclusivamente la información disponible en la model card y los metadatos del repositorio; los detalles de entrenamiento y benchmarks del modelo base no se detallan en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + codificador visual vía `mmproj`); detalles internos no disponibles |
| Parámetros totales | 7.615.616.512 (≈7,6 B) |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; además `mmproj` en Q8_0 y f16 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original en safetensors |
| Tamaño del repositorio | 70,2 GB (incluye todas las cuantizaciones) |
| Modelo base | OpenGVLab/ZeroGUI-OSWorld-7B |
| Cuantizador | mradermacher |
| Fecha de creación | 2025-05-30 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su naturaleza multimodal: se compone de un modelo de lenguaje de ~7,6 B parámetros y un codificador visual empaquetado por separado en los ficheros `mmproj` (Q8_0 y f16). Esta separación es la habitual en el ecosistema GGUF para modelos visión-lenguaje, donde el proyector multimodal se carga junto al modelo de lenguaje en llama.cpp. No se especifican en la información proporcionada el número de capas, la dimensión oculta, el mecanismo de atención ni el tipo exacto de codificador visual (por ejemplo, ViT o similar).

Tampoco se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado específico para tareas GUI. El nombre del modelo sugiere un entrenamiento orientado a tareas de OSWorld (operación de sistemas operativos reales), pero los detalles de ese proceso de entrenamiento no están documentados en la model card consultada. La cuantización realizada por mradermacher es de tipo estático (no imatrix); las versiones ponderadas/imatrix se distribuyen en un repositorio separado (`ZeroGUI-OSWorld-7B-i1-GGUF`).

## Capacidades

- Comprensión de capturas de pantalla e interfaces gráficas: el modelo es multimodal y procesa imágenes junto con texto, lo que le permite interpretar el estado visual de un escritorio o aplicación.
- Generación de acciones sobre GUI: orientado a la interacción con entornos de escritorio (clic, escritura, navegación), según el dominio declarado por el nombre y las etiquetas del repositorio.
- Conversación multi-turno: etiquetado como `conversational`, admite diálogos estructurados.
- Soporte multilingüe limitado a inglés y chino.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible`, lo que facilita su despliegue en infraestructuras de inferencia compatibles.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso más allá del bucle GUI, ni modos de razonamiento explícito (*thinking mode*).

## Casos de uso

- Automatización de tareas repetitivas de escritorio: el modelo puede recibir capturas de pantalla del entorno y proponer la siguiente acción (clic, entrada de texto) para completar flujos como rellenar formularios o gestionar ficheros, aprovechando su naturaleza de agente GUI.
- Evaluación y desarrollo de agentes OSWorld: sirve como componente de política en pipelines de investigación que miden la capacidad de un agente para operar sistemas operativos reales, al estar entrenado específicamente para ese dominio.
- Testing automatizado de interfaces: integrado en suites de QA, puede interpretar el estado visual de una aplicación y generar interacciones para validar flujos de usuario sin scripts frágiles basados en selectores.
- Asistencia a usuarios mediante automatización de soporte: un agente construido sobre el modelo puede guiar o ejecutar pasos en aplicaciones de escritorio para resolver incidencias, con la ventaja de ejecutarse localmente gracias a las cuantizaciones GGUF.
- Prototipado en hardware de consumo: las cuantizaciones Q4_K_M (4,8 GB) y Q5_K_M (5,5 GB) permiten desplegar el agente en estaciones de trabajo con GPU de gama media o incluso CPU, facilitando la experimentación sin infraestructura cloud.
- Investigación en interacción multimodal: útil para estudiar cómo los modelos de ~7 B interpretan capturas de pantalla y generan secuencias de acciones, con la posibilidad de comparar niveles de cuantización (Q2_K a Q8_0) y su impacto en la precisión de las acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje, sin contar el `mmproj` ni el contexto KV):
  - Q2_K: ~3,1 GB
  - Q3_K_M: ~3,9 GB
  - IQ4_XS: ~4,4 GB
  - Q4_K_M: ~4,8 GB
  - Q5_K_M: ~5,5 GB
  - Q6_K: ~6,4 GB
  - Q8_0: ~8,2 GB
  - f16: ~15,3 GB
- Codificador visual (`mmproj`): ~0,8 GB (Q8_0) o ~1,5 GB (f16), que debe sumarse a la VRAM del modelo de lenguaje.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, las cuantizaciones Q4_K_M y Q5_K_M son compatibles con GPUs de consumo de 8-12 GB (por ejemplo, RTX 3060/4060/4070), mientras que Q8_0 requiere ~10 GB y f16 ~17 GB, lo que apunta a GPUs de 16-24 GB (RTX 4080/4090, A100, H100) para el formato completo.
- Despliegue: formato GGUF, por lo que es compatible con llama.cpp y sus derivados (Ollama, LM Studio, servidores compatibles con la API de llama.cpp). No se documenta soporte para vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría (agentes GUI multimodales de ~7 B), por lo que no es posible establecer una comparación rigurosa sin inventar cifras.

## Limitaciones y advertencias

- Modelo de nicho: está especializado en interacción GUI y no debe esperarse un rendimiento generalista comparable a modelos de chat o código de propósito general.
- Idiomas limitados a inglés y chino; no se garantiza un comportamiento correcto en castellano.
- No se documentan sesgos específicos, pero al ser un modelo entrenado sobre capturas de pantalla de sistemas operativos, puede heredar sesgos de las interfaces y aplicaciones presentes en sus datos de entrenamiento (no detallados).
- Riesgo de alucinación en la interpretación de elementos visuales y en la generación de acciones: un agente GUI puede ejecutar clics o entradas incorrectas, por lo que requiere supervisión y mecanismos de confirmación en producción.
- La cuantización es comunitaria y estática; no se ofrecen garantías de equivalencia funcional con el modelo base original en safetensors. Para máxima fidelidad, usar Q8_0 o f16, o el modelo base.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base original (OpenGVLab/ZeroGUI-OSWorld-7B) por si añade restricciones adicionales.
- El repositorio ocupa 70,2 GB por incluir todas las cuantizaciones; descargar solo los ficheros necesarios.
- No se dispone de información sobre la longitud de contexto, lo que impide garantizar conversaciones largas o historiales extensos de acciones.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ZeroGUI-OSWorld-7B-GGUF
- Modelo base: https://huggingface.co/OpenGVLab/ZeroGUI-OSWorld-7B
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/ZeroGUI-OSWorld-7B-i1-GGUF
- Página de resumen del cuantizador: https://hf.tst.eu/model#ZeroGUI-OSWorld-7B-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
