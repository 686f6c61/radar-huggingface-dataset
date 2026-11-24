# mradermacher/Ulam-1-GGUF

## Resumen

Ulam-1 es un modelo de lenguaje multimodal orientado a razonamiento matemático y matemática de investigación, desarrollado por ulamai. Esta ficha documenta la versión GGUF publicada por mradermacher, un cuantizador independiente que distribuye pesos estáticos del modelo original `ulamai/Ulam-1`. El modelo cuenta con 26.895.998.464 parámetros totales (aproximadamente 26,9 mil millones) y está construido sobre una arquitectura de la familia Qwen 3.5, según la etiqueta `qwen3_5` de la model card.

El modelo se distribuye bajo licencia Apache 2.0 y está entrenado específicamente para tareas de razonamiento matemático, con especial énfasis en trayectorias de razonamiento de investigación verificadas. Los datasets declarados son `ulamai/verified-research-reasoning-trajectories` y `ulamai/Math-RL-Tasks`, lo que sugiere un entrenamiento con datos de razonamiento matemático de alta calidad y posiblemente reforzado con aprendizaje por refuerzo. La model card indica únicamente inglés como idioma soportado.

La relevancia de esta versión GGUF radica en que permite desplegar un modelo de casi 27 mil millones de parámetros en hardware de consumo mediante cuantización, con opciones desde 10,8 GB (Q2_K) hasta 28,7 GB (Q8_0). El repositorio ocupa 187,9 GB e incluye tanto los pesos cuantizados como los suplementos multimodales (mmproj) necesarios para el procesamiento de visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, segun etiqueta `qwen3_5`) |
| Parametros totales | 26.895.998.464 (~26,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

La información disponible indica que Ulam-1 se basa en la arquitectura Qwen 3.5, un transformer multimodal con capacidad de procesamiento de texto e imagen (el repositorio incluye ficheros `mmproj` para el proyector multimodal). El tamaño de 26,9 mil millones de parámetros lo sitúa en la gama de modelos densos de gran escala, aunque no se especifica si emplea mezcla de expertos (MoE) ni el número de parámetros activos.

En cuanto al entrenamiento, los datasets declarados son `ulamai/verified-research-reasoning-trajectories` (trayectorias de razonamiento de investigación verificadas) y `ulamai/Math-RL-Tasks` (tareas matemáticas para aprendizaje por refuerzo). Esto sugiere un pipeline de entrenamiento centrado en razonamiento matemático con verificación y posiblemente RL. No se dispone de información sobre el número total de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas como RLHF o DPO más allá de lo que indican los nombres de los datasets. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento matemático y resolución de problemas, con especial orientación a matemática de investigación.
- Procesamiento multimodal: el repositorio incluye suplementos `mmproj` que habilitan entrada de imágenes junto con texto.
- Razonamiento multi-paso orientado a trayectorias de investigación (según el dataset de entrenamiento `verified-research-reasoning-trajectories`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes autónomos: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Resolución de problemas matemáticos avanzados: el modelo puede abordar demostraciones y problemas de matemática de investigación, aprovechando su entrenamiento específico en trayectorias de razonamiento verificadas para generar cadenas de razonamiento paso a paso.
- Asistencia en investigación matemática: útil para explorar conjeturas, verificar pasos intermedios de demostraciones y generar borradores de argumentos formales, gracias a su especialización en razonamiento de investigación.
- Tutoría matemática interactiva: puede mantener conversaciones multi-turno explicando conceptos y resolviendo ejercicios, adecuado para plataformas educativas que requieran un modelo desplegable localmente.
- Análisis de documentos con contenido matemático: gracias al componente multimodal (mmproj), puede procesar imágenes de ecuaciones o diagramas junto con texto explicativo.
- Generación de datos sintéticos de razonamiento: puede utilizarse para producir trayectorias de razonamiento matemático que sirvan como datos de entrenamiento para modelos más pequeños, dado su enfoque en reasoning verificado.
- Despliegue en entornos con requisitos de privacidad: al ser un modelo GGUF ejecutable con llama.cpp u Ollama, permite inferencia local sin enviar datos a servicios externos, adecuado para instituciones que manejan material de investigación sensible.
- Prototipado de pipelines de razonamiento matemático: integrable en entornos de investigación donde se necesite evaluar cadenas de razonamiento sobre problemas de matemáticas sin depender de APIs comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización:
  - Q2_K: ~10,8 GB
  - Q3_K_S: ~12,2 GB
  - Q3_K_M: ~13,4 GB
  - Q3_K_L: ~14,4 GB
  - IQ4_XS: ~15,3 GB
  - Q4_K_S: ~15,7 GB
  - Q4_K_M: ~16,6 GB
  - Q5_K_S: ~18,8 GB
  - Q5_K_M: ~19,3 GB
  - Q6_K: ~22,2 GB
  - Q8_0: ~28,7 GB
  - Suplemento multimodal mmproj-Q8_0: ~0,7 GB adicionales
  - Suplemento multimodal mmproj-f16: ~1,0 GB adicionales
- GPU recomendadas: para cuantizaciones Q4_K_M o superiores se recomienda una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G). Para Q8_0 se necesita una GPU de 32 GB o más (A100 40GB, H100, RTX 5090 si está disponible). Para Q2_K–Q3_K puede bastar una GPU de 12–16 GB (RTX 4070 Ti, RTX 4080).
- Cabe en GPU de consumo: sí, en cuantizaciones Q2_K a Q5_K_M con GPUs de 12–24 GB. Las cuantizaciones Q6_K y Q8_0 requieren GPUs de gama alta o profesionales.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. El modelo base en safetensors puede servirse con vLLM o TGI, pero esta versión GGUF está pensada para llama.cpp y derivados.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Ulam-1 (esta ficha) | ~26,9 B | no disponible | Apache 2.0 | GGUF / safetensors | Especializado en razonamiento matemático, multimodal |
| Qwen 2.5 32B | ~32,5 B | 128K (según versión) | Apache 2.0 | safetensors, GGUF | Modelo generalista de tamaño similar, sin especialización matemática declarada |
| DeepSeek-R1-Distill-Qwen-32B | ~32,8 B | 128K (según versión) | MIT | safetensors, GGUF | Destilado de razonamiento, orientado a matemáticas y código |
| Gemma 3 27B | ~27 B | 128K | Gemma license | safetensors, GGUF | Modelo multimodal generalista de tamaño comparable |

Nota: los datos de contexto y rendimiento de los modelos comparables provienen de conocimiento general y no de la información proporcionada en esta ficha; se incluyen como referencia orientativa. No se dispone de benchmarks de Ulam-1 para una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al estar entrenado principalmente con datos matemáticos en inglés, puede presentar sesgos de dominio y culturales derivados de esos datos.
- Riesgo de alucinación: presente como en cualquier modelo generativo; en matemáticas de investigación el riesgo es especialmente crítico, ya que puede producir demostraciones plausibles pero incorrectas. Se recomienda verificación humana.
- Limitaciones de contexto o idioma: la model card solo declara inglés; el rendimiento en castellano u otros idiomas no está garantizado. La longitud de contexto no está documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con obligación de incluir el aviso de licencia y la atribución correspondiente.
- Caveats para producción: esta versión GGUF es una cuantización estática realizada por un tercero (mradermacher), no por el autor original; las cuantizaciones de baja precisión (Q2_K, Q3_K) degradan la calidad. No hay datos publicados de benchmarks ni de latencia. El repositorio es grande (187,9 GB) y contiene múltiples ficheros; es necesario descargar únicamente la cuantización deseada. La fecha de creación del repositorio (2026) y la escasa adopción (416 descargas, 0 likes) sugieren que debe evaluarse con cautela antes de usarlo en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Ulam-1-GGUF
- Modelo base: https://huggingface.co/ulamai/Ulam-1
- Dataset de trayectorias de razonamiento: https://huggingface.co/datasets/ulamai/verified-research-reasoning-trajectories
- Dataset de tareas matemáticas RL: https://huggingface.co/datasets/ulamai/Math-RL-Tasks
- Página de descargas del cuantizador: https://hf.tst.eu/model#Ulam-1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
