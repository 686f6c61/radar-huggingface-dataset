# mradermacher/UI-Venus-1.5-30B-A3B-GGUF

## Resumen

UI-Venus-1.5-30B-A3B es un modelo multimodal especializado en interacción con interfaces gráficas de usuario (GUI) y tareas de agente, desarrollado originalmente por inclusionAI y distribuido en esta ficha como cuantización GGUF estática por mradermacher. El modelo parte de una arquitectura Mixture-of-Experts (MoE) con 30.532.122.624 parámetros totales, de los cuales solo una fracción se activa por token, lo que lo hace computacionalmente tratable en GPUs de gama alta-consumo. Su propósito principal es la automatización de agentes que operan sobre pantallas: interpretar capturas de GUI, decidir acciones (clic, escritura, scroll) y ejecutar flujos multi-paso.

La relevancia de esta variante GGUF radica en que permite desplegar el modelo en entornos locales mediante llama.cpp y herramientas compatibles, sin necesidad de infraestructura con GPUs de datacenter. El repositorio incluye cuantizaciones desde Q2_K (11,4 GB) hasta Q8_0 (32,6 GB), además de los ficheros mmproj necesarios para el procesamiento multimodal (Q8_0 de 0,8 GB y f16 de 1,2 GB).

La licencia Apache 2.0 facilita su uso comercial, y su naturaleza MoE con activación dispersa lo posiciona como una alternativa eficiente en coste frente a modelos densos de tamaño comparable para tareas de agentes GUI. La información disponible sobre el modelo base es limitada en esta ficha; los detalles de entrenamiento, contexto y benchmarks no están publicados en los datos proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer multimodal (derivada de inclusionAI/UI-Venus-1.5-30B-A3B) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | no disponible (modelo MoE; el sufijo A3B sugiere ~3B activos, sin confirmar en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16; variantes i1 (imatrix) en repositorio separado |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con ficheros mmproj para el componente multimodal) |

## Arquitectura y entrenamiento

El modelo base es UI-Venus-1.5-30B-A3B de inclusionAI, una arquitectura Mixture-of-Experts con 30.532.122.624 parámetros totales. La nomenclatura "A3B" en el nombre sugiere aproximadamente 3.000 millones de parámetros activos por token, patrón habitual en modelos MoE de activación dispersa, aunque este dato no se confirma explícitamente en la información disponible. El modelo es multimodal: el repositorio incluye ficheros mmproj (multi-modal projector) en cuantizaciones Q8_0 y f16, necesarios para procesar entradas visuales junto con texto, lo que encaja con su orientación a tareas de agente GUI.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o aprendizaje por refuerzo específico para agentes. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. La cuantización fue realizada por mradermacher con `quantize_version: 2` y `output_tensor_quantised: 1`, usando conversión desde formato HuggingFace (`convert_type: hf`). Existe un repositorio separado con cuantizaciones ponderadas/imatrix (i1) para mayor calidad.

## Capacidades

- Procesamiento multimodal: acepta imágenes (capturas de pantalla de GUI) junto con texto, gracias a los ficheros mmproj incluidos.
- Interacción con interfaces gráficas: orientado a interpretar pantallas y decidir acciones de agente (clic, escritura, navegación).
- Tareas de agente multi-paso: el tag "agent" indica soporte para flujos de razonamiento y ejecución secuencial.
- Generación de texto conversacional: pipeline etiquetado como conversacional y compatible con endpoints.
- Razonamiento sobre estado de UI: capacidad de analizar el estado actual de una interfaz para planificar la siguiente acción.
- Soporte multilingüe: limitado a inglés según la model card (`language: en`).
- Tool calling / function calling: no confirmado explícitamente en la información disponible.
- Modo thinking, audio o visión general (no-GUI): no disponible en la información proporcionada.

## Casos de uso

- Automatización de pruebas de interfaz: el modelo puede interpretar capturas de pantalla de una aplicación y generar secuencias de acciones (clic, entrada de texto) para validar flujos de UI de forma autónoma, reduciendo la necesidad de scripts frágiles basados en selectores.
- Agentes de escritorio y navegación web: integrado en un bucle de agente, analiza el estado visual de la pantalla y decide la siguiente acción, adecuado para tareas de RPA (automatización robótica de procesos) sobre aplicaciones legacy sin API.
- Asistencia a usuarios en soporte técnico: dado su carácter conversacional y multimodal, puede guiar a un usuario paso a paso mostrando o interpretando capturas de su pantalla para resolver incidencias.
- Automatización de tareas repetitivas en entornos corporativos: rellenado de formularios, extracción de datos de aplicaciones de escritorio y ejecución de flujos administrativos guiados visualmente.
- Despliegue local con privacidad: al distribuirse en GGUF y ejecutarse con llama.cpp, permite procesar capturas de pantalla sensibles sin enviar datos a servicios en la nube, relevante en sectores regulados.
- Prototipado de agentes GUI en investigación: la disponibilidad de cuantizaciones desde 11,4 GB facilita experimentar con modelos MoE multimodales en hardware de laboratorio sin GPUs de datacenter.
- Evaluación comparativa de agentes: útil como baseline en benchmarks de agentes GUI (tipo ScreenSpot, OSWorld) al poder ejecutarse en local con distintas cuantizaciones para medir el impacto de la compresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~11,4 GB
  - Q3_K_S: ~13,4 GB; Q3_K_M: ~14,8 GB; Q3_K_L: ~16,0 GB
  - IQ4_XS: ~16,7 GB; Q4_K_S: ~17,6 GB; Q4_K_M: ~18,7 GB
  - Q5_K_S: ~21,2 GB; Q5_K_M: ~21,8 GB
  - Q6_K: ~25,2 GB
  - Q8_0: ~32,6 GB
  - Añadir 0,8 GB (mmproj Q8_0) o 1,2 GB (mmproj f16) para el componente multimodal.
- GPU recomendadas: para Q4_K_M (~18,7 GB) se requiere una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G 24GB). Para Q8_0 (~32,6 GB) se necesita A100 40GB, H100 o configuraciones multi-GPU.
- Cabe en consumer GPU: sí, en RTX 3090/4090 (24 GB) con cuantizaciones Q4 o inferiores; en GPUs de 16 GB solo con Q2_K/Q3_K_S y posible offload parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF y mmproj. También puede usarse el formato original HuggingFace con transformers y vLLM/TGI (no verificado para esta variante).
- Latencia y throughput: no disponible. La activación MoE (~3B activos según nomenclatura) debería ofrecer throughput superior a un modelo denso de 30B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UI-Venus-1.5-30B-A3B (esta ficha, GGUF) | 30,5B totales (MoE) | no disponible | Agente GUI multimodal | Apache 2.0 | GGUF en HF |
| inclusionAI/UI-Venus-1.5-30B-A3B (original) | 30,5B totales (MoE) | no disponible | Agente GUI multimodal | Apache 2.0 | Pesos HF |
| UI-Venus-1.5-30B-A3B-i1-GGUF (mradermacher) | 30,5B totales (MoE) | no disponible | Agente GUI multimodal (imatrix) | Apache 2.0 | GGUF en HF |
| Alternativas de agente GUI de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos competidores en la información proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés (`language: en`); el rendimiento en castellano no está garantizado.
- Sesgos: no documentados en la información disponible; al ser un modelo entrenado sobre capturas de GUI, puede heredar sesgos de las interfaces y datos de entrenamiento, no cuantificados.
- Alucinación: riesgo inherente en modelos generativos; en tareas de agente GUI puede traducirse en acciones incorrectas sobre la interfaz, con impacto real si opera sobre sistemas en producción.
- Contexto: longitud de contexto no disponible; planificar despliegues que dependan de ventanas largas requiere verificar este dato en la model card original.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base (inclusionAI/UI-Venus-1.5-30B-A3B) por si añade restricciones adicionales.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad; para tareas de agente con decisiones precisas se recomienda Q4_K_M o superior.
- El componente multimodal requiere cargar el fichero mmproj correspondiente; sin él, el modelo no procesa imágenes.
- No se confirma soporte de tool calling nativo ni integración con frameworks de agentes estándar (LangChain, etc.) en la información disponible.
- Fecha de creación del repositorio (2026-02-11) y actualización (2026-11-02) según metadatos de HuggingFace.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/UI-Venus-1.5-30B-A3B-GGUF
- Modelo base original: https://huggingface.co/inclusionAI/UI-Venus-1.5-30B-A3B
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/UI-Venus-1.5-30B-A3B-i1-GGUF
- Página de descargas de mradermacher: https://hf.tst.eu/model#UI-Venus-1.5-30B-A3B-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de modelos: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
