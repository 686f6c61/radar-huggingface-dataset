# mradermacher/GameDojo-4B-GGUF

## Resumen

GameDojo-4B es un modelo de lenguaje de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) desarrollado originalmente por el equipo THUSI-Lab y especializado en agentes de juego y computer-use. La versión aquí documentada es una cuantización GGUF estática publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo está entrenado y orientado al inglés, y su dataset de referencia es THUSI-Lab/GameDojo, lo que sugiere un enfoque en interacción con entornos de juego y control de interfaces.

La relevancia de esta ficha radica en que el modelo original no cuenta con una model card detallada en la información disponible, por lo que la cuantización GGUF de mradermacher se convierte en la vía práctica para evaluarlo y desplegarlo. El repositorio incluye tanto los pesos cuantizados del modelo principal como archivos mmproj (multi-modal supplement), lo que indica soporte de entrada visual, algo coherente con su orientación a computer-use y agentes de juego.

Al tratarse de una cuantización y no del modelo original, muchos datos técnicos (arquitectura exacta, contexto, licencia, benchmarks) no están disponibles en la información proporcionada. Esta ficha distingue explícitamente entre lo que se puede afirmar con certeza y lo que queda como no disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base THUSI-Lab/GameDojo-4B; transformer multimodal probable por presencia de mmproj) |
| Parametros totales | 4.205.751.296 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base THUSI-Lab/GameDojo-4B en la documentación proporcionada. El recuento de parámetros (4.205.751.296) corresponde a un modelo denso de aproximadamente 4,2 mil millones de parámetros, y la presencia de archivos mmproj en la cuantización indica que el modelo incorpora un componente multimodal, presumiblemente para procesar imágenes o capturas de pantalla, lo cual encaja con su etiquetado como computer-use y game-agent.

El dataset de entrenamiento referenciado es THUSI-Lab/GameDojo, pero no se especifican el número de tokens, la composición del corpus ni si hubo etapas de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. Toda esta información debe considerarse no disponible hasta consultar la model card del modelo base.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` y el pipeline de transformers.
- Orientación a agentes de juego (game-agent): interacción con entornos lúdicos y toma de decisiones multi-paso.
- Computer-use: control e interacción con interfaces de usuario, apoyado por el componente multimodal (mmproj).
- Procesamiento de entradas visuales: la presencia de mmproj-f16 y mmproj-Q8_0 sugiere capacidad de visión, aunque no se detalla su alcance.
- Soporte de tool calling / function calling: no disponible explícitamente en la información.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

- Agente de juego automatizado: el modelo puede integrarse en un bucle de agente que observe el estado del juego (posiblemente vía capturas procesadas por el componente mmproj) y emita acciones, aprovechando su especialización en game-agent.
- Automatización de tareas de computer-use: control de aplicaciones de escritorio o navegador mediante instrucciones en lenguaje natural, adecuado por su etiqueta computer-use y su tamaño reducido para ejecución local.
- Evaluación de entornos interactivos: servir como política de referencia en benchmarks de agentes que requieran un modelo ligero que quepa en una GPU de consumo.
- Prototipado de asistentes conversacionales en inglés: su naturaleza conversacional permite desplegarlo en chatbots de prueba con llama.cpp u Ollama sin infraestructura dedicada.
- Investigación en agentes multi-paso: al ser un modelo de 4B, facilita experimentos de razonamiento secuencial y planificación en entornos simulados con bajo coste computacional.
- Despliegue en edge o estaciones de trabajo sin GPU de datacenter: las cuantizaciones Q4_K_M (2,8 GB) y Q5_K_M (3,2 GB) permiten ejecución en GPUs consumer de gama media, útil para demos y pruebas offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,1 GB (Q2_K), 2,8 GB (Q4_K_M), 3,2 GB (Q5_K_M), 4,6 GB (Q8_0) y 8,5 GB (f16); añadir 0,5-0,8 GB si se usa el componente multimodal mmproj.
- GPU recomendadas: no disponible de forma oficial; por tamaño, cabría en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y GPUs de datacenter como A100 o H100 sin problema.
- Cabe en GPU consumer: sí, en la mayoría de GPUs con 6 GB o más de VRAM usando cuantizaciones Q4/Q5.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es de transformers, por lo que también puede servirse con vLLM o TGI en su formato original (no verificado en la información).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (agentes de juego / computer-use de ~4B) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- La licencia no está especificada, por lo que no se puede confirmar el uso comercial; es imprescindible consultar la licencia del modelo base THUSI-Lab/GameDojo-4B antes de producción.
- El modelo solo declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Al ser una cuantización, las versiones de baja precisión (Q2_K, Q3_K_S) pueden degradar la calidad de forma notable; se recomienda Q4_K_M o superior para uso serio.
- No se dispone de datos sobre sesgos, tasa de alucinación ni robustez en dominios fuera del juego y computer-use.
- La ausencia de benchmarks impide validar su rendimiento frente a alternativas; cualquier decisión de producción debe basarse en evaluación propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación comunitaria.
- El componente multimodal (mmproj) requiere un runtime que soporte visión en GGUF; no todos los frontends lo implementan.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/mradermacher/GameDojo-4B-GGUF
- Modelo base: https://huggingface.co/THUSI-Lab/GameDojo-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/THUSI-Lab/GameDojo
- Página de overview de cuantizaciones de mradermacher: https://hf.tst.eu/model#GameDojo-4B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
