# MercanAI/Mercan-0.8B-SFT-step19838

# Mercan 0.8B SFT (MercanAI)

## Resumen

Mercan 0.8B SFT (identificador `MercanAI/Mercan-0.8B-SFT-step19838`) es el checkpoint final de un ajuste supervisado (SFT) de parámetros completos en turco, desarrollado por MercanAI y exportado al contenedor Mercan v1. Se trata de un transformer decoder-only de aproximadamente 823 millones de parámetros, con 24 capas, hidden size de 1.536, 12 cabezas de atención y 4 cabezas KV (GQA), y una ventana de contexto de 32.768 tokens.

Su interés práctico reside en la combinación de tres factores: un tamaño que cabe en GPU de consumo e incluso en CPU, un contexto largo (32.768 tokens) poco habitual en modelos de menos de 1.000 millones de parámetros, y un tokenizer propio (NDSRF004) orientado al turco, un idioma con morfología agresiva y relativamente poco cubierto por modelos pequeños de calidad. Además, incorpora MorphFFN en 18 de las 24 capas, un componente que la model card menciona pero no detalla.

La distribución se realiza a través de la librería propia `libmercan` y de un fichero `model.mercan` cuyo contenedor físico es GGUF v3. No se declara licencia, no se publican benchmarks y el repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha, por lo que conviene tratarlo como un artefacto experimental y verificar su comportamiento antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención agrupada (GQA): 24 capas, hidden size 1.536, FFN 5.632, 12 cabezas de atención y 4 cabezas KV, RoPE con theta 1.000.000, MorphFFN en 18 de las 24 capas |
| Parámetros totales | ~823 M |
| Longitud de contexto | 32.768 tokens (ventana deslizante declarada: 32.768, es decir, sin recorte adicional) |
| Tipos de cuantización | no disponible; el autor publica matrices en F16 y tensores 1-D en F32 |
| Idiomas soportados | turco (según los tags y la model card); otros idiomas: no disponible |
| Licencia | no disponible |
| Formato de pesos | Contenedor físico GGUF v3, fichero `model.mercan`; matrices F16 y tensores 1-D F32; checkpoint de origen `step_00019838.pt` |
| Tokenizer | NDSRF004: vocabulario superficial de 32.000 tokens + 2 IDs estructurales de chat (32.000 inicio de mensaje, 32.001 fin de mensaje) |
| Contrato de chat | Roles en turco (`sistem`, `kullanici`, `asistan`); alias de control `<|im_start|>` y `<|im_end|>` |
| Hash SHA-256 | edc7443c104047c7fac8bae7131472bc7069b66557ce1d3021d7a167968d9abb |
| Fecha de publicación en HuggingFace | 2026-09-22 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar con las siguientes particularidades documentadas: 24 capas, hidden size de 1.536, FFN de 5.632, 12 cabezas de atención frente a 4 cabezas KV (ratio GQA de 3:1, lo que reduce el tamaño de la caché KV), RoPE con theta de 1.000.000 para favorecer la extrapolación posicional, y una ventana deslizante igual a la longitud total de contexto (32.768), por lo que no hay restricción efectiva de atención local. El elemento menos convencional es MorphFFN, presente en 18 de las 24 capas; la model card no especifica su funcionamiento interno ni en qué difiere del FFN estándar.

En cuanto al entrenamiento, el autor indica que se trata de un SFT de parámetros completos (no LoRA) sobre turco, con el paso final 19.838 como checkpoint definitivo. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u optimización por preferencias. Sí se documenta la interfaz de conversación: cada mensaje se serializa como inicio de mensaje + rol y salto de línea + contenido + fin de mensaje + salto de línea, usando los roles turcos `sistem`, `kullanici` y `asistan`. La model card advierte de un desajuste conocido: el wrapper de la CLI de Mercan formatea los roles como `user`/`assistant`, mientras que este checkpoint se entrenó con `kullanici`/`asistan`, por lo que el llamante debe usar el contrato turco o actualizar el wrapper para reproducir exactamente las condiciones de entrenamiento.

## Capacidades

- Generación de texto en turco, con el modelo afinado específicamente para este idioma.
- Conversación multi-turno mediante un contrato de chat explícito (inicio y fin de mensaje más encabezados de rol en turco).
- Manejo de contextos largos de hasta 32.768 tokens, lo que permite procesar documentos extensos en una sola pasada.
- Ajuste por instrucciones derivado del SFT de parámetros completos, aunque sin benchmarks publicados que cuantifiquen su calidad.
- Compatibilidad de contenedor con el ecosistema Mercan v1 a través de `libmercan`.
- No documentado: soporte de tool calling o function calling, uso como agente, razonamiento multi-paso, generación de código, matemáticas, visión, audio o modo de razonamiento explícito (thinking). No hay información al respecto en la model card.
- Capacidades multilingües: solo el turco está confirmado por los tags y el contenido de la ficha; no se documenta ningún otro idioma.

## Casos de uso

- Asistente conversacional en turco desplegado en local: con ~823 M de parámetros y pesos F16, el modelo puede ejecutarse en una estación de trabajo sin GPU dedicada, lo que resulta adecuado para entornos con requisitos de privacidad donde los datos no pueden salir de la organización.
- Resumen y extracción de información en documentos largos en turco: los 32.768 tokens de contexto permiten introducir contratos, informes o normativa completos sin troceado previo, y pedir resúmenes o campos estructurados en una sola llamada.
- Clasificación y enrutado de tickets de soporte: el modelo puede etiquetar consultas entrantes en turco por categoría o urgencia antes de derivarlas a un sistema mayor, actuando como filtro de bajo coste.
- Generación de borradores de respuesta en atención al cliente: con el contrato de chat `sistem`/`kullanici`/`asistan` se puede fijar una persona y un tono, y mantener el historial de la conversación dentro de la ventana de contexto.
- Investigación sobre tokenización y morfología turca: el tokenizer NDSRF004 y las capas MorphFFN lo convierten en un banco de pruebas para estudiar cómo afecta el tratamiento morfológico al rendimiento en turco frente a tokenizers multilingües genéricos.
- Modelo base para fine-tuning posterior en dominios turcos específicos: su tamaño reducido abarata el reentrenamiento completo o con adaptadores sobre datos propios (legal, sanitario, e-commerce) sin necesidad de infraestructura de gran escala.
- Prototipado y evaluación de pipelines de generación antes de escalar a modelos mayores: permite validar prompts, contratos de chat y flujos de preprocesado con un coste de inferencia muy bajo.
- Verificación de integridad y reproducibilidad de artefactos: el SHA-256 publicado facilita comprobar que el fichero descargado es exactamente el checkpoint distribuido por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: en el formato publicado (matrices F16 y tensores 1-D F32) el peso ronda los 1,6-1,7 GB; no hay cuantizaciones de menor precisión documentadas por el autor.
- Caché KV estimada: con 24 capas, 4 cabezas KV y dimensión de cabeza de 128 (1.536 / 12), la caché ocupa aproximadamente 48 KB por token en F16, lo que equivale a unos 1,5-1,6 GB si se llena la ventana completa de 32.768 tokens. Para contextos cortos el consumo es proporcionalmente mucho menor.
- Consumo total estimado: en torno a 3,3-3,5 GB con contexto completo en F16, y menos de 2 GB con contextos de unos pocos miles de tokens. Son estimaciones derivadas del número de parámetros y de la configuración de atención, no cifras medidas.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM es suficiente (RTX 3060, RTX 4060, RTX 2060). Una RTX 4090 o una A100/H100 quedan sobredimensionadas para este tamaño, salvo que se busque maximizar el throughput por lote.
- Ejecución en CPU: viable por el tamaño del modelo, aunque la latencia dependerá del número de núcleos y de si se dispone de instrucciones vectoriales o de una iGPU/NPU.
- Opciones de despliegue: el modelo se distribuye para la librería `libmercan` con un fichero `model.mercan` (contenedor físico GGUF v3). No se documenta compatibilidad con llama.cpp, Ollama, vLLM, TGI ni Transformers; dado que el contenedor es GGUF v3, una conversión podría ser factible, pero no está confirmada por el autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idioma principal | Formatos | Benchmarks |
|---|---|---|---|---|---|---|
| Mercan 0.8B SFT | ~823 M | 32.768 | no disponible | turco (confirmado) | Contenedor Mercan v1 (GGUF v3), F16/F32 | no disponible |
| Qwen2.5-0.5B | ~0,49 B | 32.768 nativo | Apache 2.0 | multilingüe (incluye turco) | safetensors, GGUF | no disponibles en esta ficha |
| Llama 3.2 1B | ~1,24 B | 128.000 | Llama 3.2 Community License | multilingüe (8 idiomas oficiales; el turco no está entre ellos) | safetensors, GGUF | no disponibles en esta ficha |

Los datos de los modelos de referencia corresponden a especificaciones públicas y pueden variar con el tiempo. No es posible establecer una comparación de rendimiento porque no hay resultados de benchmarks publicados para el modelo analizado en la información disponible. La ventaja diferencial de Mercan 0.8B SFT sería la especialización en turco y su tokenizer propio; sus desventajas claras frente a las alternativas son la ausencia de licencia declarada y la falta de soporte documentado en toolchains estándar como llama.cpp, vLLM u Ollama.

## Limitaciones y advertencias

- Licencia no declarada: sin términos explícitos de uso, no hay certeza sobre la legalidad de un uso comercial. Es imprescindible contactar con el autor antes de integrarlo en un producto.
- Rendimiento no verificado: no hay benchmarks publicados, por lo que la calidad real en generación, seguimiento de instrucciones o coherencia en contextos largos es desconocida.
- Riesgo elevado de alucinación: con ~823 M de parámetros, la capacidad de mantener consistencia factual y de razonar es limitada, especialmente en tareas de matemáticas, código o conocimiento enciclopédico.
- Desajuste del contrato de chat: la CLI de Mercan usa los roles `user`/`assistant`, mientras que el checkpoint fue entrenado con `kullanici`/`asistan`. Usar el formato equivocado puede degradar notablemente las respuestas.
- Dependencia de una librería propia poco extendida: `libmercan` no es un estándar del ecosistema, lo que dificulta el despliegue, la integración y el mantenimiento a largo plazo en comparación con transformers, vLLM o llama.cpp.
- Interoperabilidad no confirmada: aunque el contenedor sea GGUF v3, no se documenta que el fichero `model.mercan` sea cargable por herramientas GGUF convencionales.
- Cobertura lingüística limitada: solo el turco está confirmado; no hay datos sobre el comportamiento en castellano u otros idiomas.
- Sesgos desconocidos: no se describe la composición del dataset de SFT, por lo que no se puede evaluar qué sesgos sociales, políticos o culturales puede reproducir.
- Sin validación comunitaria: el repositorio no tiene descargas ni valoraciones, y no consta revisión externa del artefacto.
- Advertencia sobre el contexto largo: aunque la ventana declarada es de 32.768 tokens, no hay evidencia publicada de que el modelo mantenga el rendimiento en la parte alta de ese rango.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MercanAI/Mercan-0.8B-SFT-step19838
- Documento de exportación citado en la model card: `PT_TO_MERCAN.md` (referenciado sin URL pública disponible)
- Paper técnico: no disponible
- Repositorio de código: no disponible
- Demo o espacio de inferencia: no disponible
- Nota sobre la búsqueda web: los resultados recuperados (repositorios de prompts tipo jailbreak, hilos sobre verificación telefónica en ChatGPT, directorios de APIs de ChatGPT y documentación de modelos de GitHub Copilot) no guardan relación con Mercan 0.8B SFT ni aportan información adicional sobre el modelo.
