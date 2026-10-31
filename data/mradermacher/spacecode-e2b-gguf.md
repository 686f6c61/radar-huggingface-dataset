# mradermacher/SpaceCode-E2B-GGUF

## Resumen

SpaceCode-E2B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo SpaceGhost/SpaceCode-E2B, realizadas por mradermacher, un cuantizador muy activo en la comunidad de Hugging Face. El modelo base es un modelo de código de unos 4.647 millones de parámetros, orientado a ingeniería de software, con especial énfasis en desarrollo móvil con React Native, Android y Expo, así como en TypeScript y Python. Además, incluye un componente multimodal (mmproj), lo que sugiere capacidades de visión combinadas con generación de código.

La relevancia de esta ficha radica en la disponibilidad del modelo en formatos cuantizados que permiten ejecutarlo localmente en hardware de consumo mediante llama.cpp u Ollama, con cuantizaciones que van desde Q2_K (3,1 GB) hasta f16 (9,4 GB). Esto lo hace accesible para desarrolladores que desean un asistente de código especializado en desarrollo móvil sin depender de servicios en la nube.

La información publicada sobre el modelo base (arquitectura detallada, datos de entrenamiento, benchmarks) es limitada, por lo que varios apartados de esta ficha indican datos no disponibles. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones relevantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, base derivada de Llama según librería transformers) |
| Parametros totales | 4.647.450.147 (≈4,65 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | portugues (pt), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas; el modelo base está en safetensors) |

## Arquitectura y entrenamiento

El modelo base, SpaceGhost/SpaceCode-E2B, es un modelo de aproximadamente 4,65 mil millones de parámetros etiquetado como multimodal y de visión, con un suplemento mmproj (proyector multimodal) distribuido en las cuantizaciones Q8_0 (0,7 GB) y f16 (1,1 GB). Este tipo de proyector es característico de arquitecturas de visión-lenguaje compatibles con llama.cpp (estilo LLaVA), donde el mmproj codifica imágenes que el modelo de lenguaje procesa posteriormente. Los tags sugieren un entrenamiento o ajuste fino enfocado en ingeniería de software: React Native, Android, Expo, TypeScript y Python.

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre el uso de técnicas como RLHF o DPO. Tampoco hay detalles sobre la arquitectura exacta (atención estándar, GQA, contexto extendido) ni sobre innovaciones técnicas específicas en el modelo base. La conversión a GGUF se realizó mediante el tipo de conversión "hf" con todos los tensores cuantizados.

## Capacidades

- Generacion de codigo: especializado en software engineering, con foco aparente en TypeScript, Python, React Native, Android y Expo.
- Capacidades multimodales/vision: incluye archivos mmproj (proyector multimodal), lo que habilita el procesamiento de imágenes junto con texto en llama.cpp.
- Conversacion: etiquetado como conversational, apto para chat interactivo.
- Soporte de tool calling / function calling: no disponible (sin información publicada).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: portugues e ingles; no hay constancia de castellano, por lo que su rendimiento en espanol no está garantizado.

## Casos de uso

- Desarrollo de apps React Native y Expo: el modelo puede generar componentes, pantallas y lógica de negocio en TypeScript/React Native, aprovechando su ajuste específico en este ecosistema; útil como copiloto local en el editor.
- Depuracion de codigo Android: analiza stack traces y codigo Kotlin/Java o TypeScript relacionado con Expo y propone correcciones, ejecutandose offline en la máquina del desarrollador.
- Revision de codigo con capturas de pantalla: gracias al componente mmproj, puede recibir capturas de interfaz (mockups, errores visuales) y generar el codigo React Native correspondiente o detectar discrepancias entre diseño e implementacion.
- Asistente de codigo en portugues: útil para equipos brasileños o portugueses que deseen un asistente que entienda consultas en portugues sobre codigo en ingles.
- Ejecucion local en portatil de desarrollo: con la cuantizacion Q4_K_M (3,5 GB) cabe en GPUs de consumo o incluso en CPU con RAM suficiente, ideal para entornos sin acceso a nube por politicas de privacidad.
- Prototipado rapido con Ollama: integracion en flujos de trabajo locales mediante Ollama para autocompletado, generación de tests unitarios en Python o TypeScript y refactorizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del modelo base ni la del repositorio de cuantizaciones incluyen metricas (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin KV cache):
  - Q2_K: ~3,1 GB; Q3_K_M: ~3,3 GB; Q4_K_M: ~3,5 GB; Q5_K_M: ~3,7 GB; Q6_K: ~3,9 GB; Q8_0: ~5,1 GB; f16: ~9,4 GB.
  - Si se usa el componente de vision, anadir ~0,7 GB (mmproj-Q8_0) o ~1,1 GB (mmproj-f16).
- GPU recomendadas: cualquier GPU moderna con 6 GB de VRAM o mas para cuantizaciones Q4/Q5 con contexto moderado; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para contextos largos y cuantizaciones altas. En CPU, cualquier procesador con 8-16 GB de RAM libres ejecuta las cuantizaciones Q4.
- Cabe en consumer GPU: si. La cuantizacion Q4_K_M (3,5 GB) cabe comodamente en GPUs de 6 GB; incluso Q8_0 (5,1 GB) cabe en GPUs de 8 GB con contexto ajustado.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (tag incluido en el repo), LM Studio y cualquier runtime compatible con GGUF. No consta soporte verificado en vLLM o TGI para esta version GGUF.
- Latencia y throughput: no disponibles; al ser un modelo de ~4,6 B parámetros cuantizado a 4 bits, se espera inferencia fluida en GPUs de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Multimodal | Formato | Notas |
|---|---|---|---|---|---|
| SpaceCode-E2B | ~4,65 B | Apache 2.0 | Si (mmproj) | safetensors / GGUF | Especializado en React Native, Expo, TypeScript, Python |
| Qwen2.5-Coder-7B-Instruct | ~7 B | Apache 2.0 (Qwen2.5-Coder es Apache 2.0 salvo indicacion) | No | safetensors / GGUF | Amplio soporte de lenguajes y benchmarks publicados de codigo |
| CodeLlama-7B-Instruct | ~7 B | Llama 2 Community License | No | safetensors / GGUF | Modelo de codigo generalista de Meta, licencia mas restrictiva |
| DeepSeek-Coder-V2-Lite-Instruct | 16 B (2,4 B activos, MoE) | DeepSeek License | No | safetensors / GGUF | Arquitectura MoE, rendimiento alto en codigo, uso comercial restringido |

SpaceCode-E2B destaca por su especializacion en el ecosistema React Native/Expo y por su tamano reducido (~4,65 B), que facilita la ejecucion local, aunque carece de benchmarks publicados que permitan comparar su rendimiento con las alternativas anteriores.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al ser un modelo derivado y ajustado sin documentacion publica, se desconoce el tratamiento de sesgos en el entrenamiento.
- Riesgo de alucinacion: como todo modelo de codigo de tamano pequeno, puede generar APIs inexistentes o codigo plausible pero incorrecto, especialmente en frameworks con evolucion rapida como Expo; revisar siempre el codigo generado.
- Limitaciones de idioma: entrenado/etiquetado para portugues e ingles; no hay garantia de rendimiento en castellano.
- Longitud de contexto: no publicada; no es posible garantizar el manejo de bases de codigo grandes en una sola ventana.
- Licencia: Apache 2.0, sin restricciones para uso comercial; no obstante, conviene verificar la procedencia de los datos de entrenamiento del modelo base, no documentados.
- Las cuantizaciones Q2_K y Q3_K_M se senalan explicitamente como de calidad inferior; para produccion se recomiendan Q4_K_M o superiores.
- Es una cuantizacion estatica de terceros (mradermacher); cualquier bug del modelo base se hereda, y las cuantizaciones imatrix (mradermacher/SpaceCode-E2B-i1-GGUF) pueden ofrecer mejor calidad percibida.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/SpaceCode-E2B-GGUF
- Modelo base: https://huggingface.co/SpaceGhost/SpaceCode-E2B
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/SpaceCode-E2B-i1-GGUF
- Pagina de descarga resumida: https://hf.tst.eu/model#SpaceCode-E2B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
