# MihhailTLN/ownowl-ling-mini-2.0

## Resumen

ownowl-ling-mini-2.0 es un reempaquetado en cuantización 4-bit MLX del modelo inclusionAI/Ling-mini-2.0, un transformer de tipo Mixture-of-Experts (MoE) con 16.000 millones de parámetros totales y 1.400 millones activos por token, desarrollado originalmente por InclusionAI (equipo detrás de Ling y Ring). El autor del repositorio, MihhailTLN, no entrena ni modifica los pesos: únicamente los reorganiza para que la aplicación OwnOwl para iPhone pueda ejecutar el modelo de forma totalmente local, sin conexión a internet.

La relevancia de esta ficha es doble. Por un lado, documenta una de las primeras distribuciones prácticas de un MoE de 16B en un dispositivo móvil de consumo, aprovechando la稀疏idad del modelo (solo 1.4B activos) para reducir el coste computacional por token. Por otro lado, sirve como referencia de un patrón de despliegue emergente: repositorios derivados que empaquetan pesos cuantizados con una disposición de ficheros adaptada al almacenamiento flash del dispositivo, separando los tensores de expertos enrutados del resto de la red.

El repositorio tiene 9,2 GB, licencia MIT y está etiquetado para la librería MLX de Apple. No incluye pipeline declarado, no publica idiomas en los metadatos (la model card indica únicamente inglés) y no aporta resultados de benchmarks propios. Es, en esencia, un artefacto de distribución para una app concreta, no un modelo nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), tag `bailing_moe` |
| Parametros totales | 16B (según model card) |
| Parametros activos | 1.4B (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MLX con group size 64 |
| Idiomas soportados | Inglés (según model card) |
| Licencia | MIT |
| Formato de pesos | safetensors (`nonexpert.safetensors` + directorio `pack/` con expertos enrutados) |
| Modelo base | inclusionAI/Ling-mini-2.0 |
| Librería | mlx |
| Tamaño del repositorio | 9,2 GB |
| Plataforma objetivo | iOS (app OwnOwl), inferencia on-device |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas MoE de tipo `bailing_moe`, según las etiquetas del repositorio. El modelo base Ling-mini-2.0 emplea 16B parámetros totales con 1.4B activos por token, lo que implica un ratio de activación bajo (~8,75 %) y, por tanto, un coste de cómputo por token comparable al de un modelo denso de ~1.4B pese a almacenar 16B de pesos. Esta propiedad es la que hace viable su ejecución en un iPhone: la memoria necesaria para los pesos es alta (de ahí los 9,2 GB del repo en 4-bit), pero el trabajo por token es reducido.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición de datos ni si hubo fases de RLHF o DPO: la model card del reempaquetado no los detalla y no se ha proporcionado la del modelo base. Tampoco se documentan innovaciones técnicas adicionales (atención lineal, decodificación especulativa, etc.). La única particularidad técnica documentada es el empaquetado: `nonexpert.safetensors` contiene todos los tensores excepto los expertos enrutados, y el directorio `pack/` almacena los expertos byte a byte con una disposición pensada para lecturas directas desde el almacenamiento flash del teléfono, lo que reduce la sobrecarga de carga y permite mapear los expertos bajo demanda.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Ling-mini-2.0.
- Razonamiento y matemáticas: capacidades propias de un modelo de la familia Ling, aunque no se documentan resultados concretos en este repositorio.
- Ejecución totalmente offline en dispositivo: la app descarga el repositorio en el primer arranque y ejecuta la inferencia sin conexión.
- Inferencia con cuantización 4-bit MLX, optimizada para el silicio de Apple (GPU unificada de iPhone).
- Autodiagnóstico: el fichero `reference.json` contiene prompts fijos con tokens de salida de referencia para el self-test de la app.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional offline en iPhone: la app OwnOwl carga el modelo desde el repositorio en el primer arranque y genera respuestas sin enviar datos a la nube, adecuado para usuarios con requisitos de privacidad o en entornos sin conectividad.
- Autocompletado y redacción en aplicaciones de notas: al ejecutarse on-device con 1.4B parámetros activos, la latencia por token es compatible con la escritura interactiva, sin coste de API.
- Procesamiento de texto sensible a la privacidad: resúmenes, reescritura o extracción de información de documentos que no deben salir del dispositivo, aprovechando que todo el pipeline reside en el teléfono.
- Validación de integridad de despliegue: el fichero `reference.json` permite a los desarrolladores de la app verificar que la cuantización y el empaquetado producen salidas idénticas a las de referencia tras una actualización de pesos.
- Base para experimentación con MoE en edge: investigadores que quieran medir el comportamiento de un MoE 16B/1.4B activo en hardware móvil pueden usar este repositorio como punto de partida con MLX.
- Distribución de modelos en apps iOS: sirve como plantilla de empaquetado (separación de expertos en `pack/`, cuantización 4-bit grupo 64) para otros desarrolladores que quieran publicar modelos MLX en la App Store.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de latencia o throughput; únicamente `reference.json` con salidas de referencia para el self-test de la app, que no constituyen una evaluación de calidad.

## Requisitos de hardware

- VRAM/almacenamiento: el repositorio ocupa 9,2 GB en disco; en un iPhone, los pesos se mapean desde el almacenamiento flash y se cargan parcialmente en memoria unificada, por lo que se requiere un dispositivo con capacidad de almacenamiento libre suficiente y RAM unificada holgada (no se especifica el mínimo en la model card).
- GPU recomendadas: hardware Apple con soporte MLX; el destino declarado es iPhone (app OwnOwl). No se documentan modelos concretos de iPhone compatibles.
- ¿Cabe en GPU de consumo? El formato es MLX, orientado a silicio Apple; para GPU NVIDIA/AMD habría que reconvertir los pesos a otro formato (por ejemplo GGUF), algo que este repositorio no ofrece.
- Opciones de despliegue: MLX (librería declarada) y la app OwnOwl. No se proporcionan instrucciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Plataforma |
|---|---|---|---|---|---|---|
| ownowl-ling-mini-2.0 | 16B | 1.4B | no disponible | MIT | safetensors 4-bit MLX | iOS (MLX) |
| inclusionAI/Ling-mini-2.0 | 16B | 1.4B | no disponible | MIT | safetensors (original) | Servidor/GPU |
| Modelos densos ~1.4B (p. ej. familia Qwen) | ~1.4B | denso | no disponible | variable | safetensors/GGUF | GPU y CPU |

La comparación relevante es con el modelo base: este repositorio no añade capacidades, solo cambia el formato (4-bit MLX, expertos empaquetados para flash) y la plataforma objetivo (iPhone). Frente a un modelo denso de tamaño similar en parámetros activos, el MoE ofrece más conocimiento almacenado a igual coste por token, a cambio de un footprint de memoria mucho mayor (9,2 GB frente a unos pocos GB en 4-bit para un denso de 1.4B).

## Limitaciones y advertencias

- No es un modelo nuevo: es un reempaquetado; cualquier limitación del modelo base Ling-mini-2.0 se hereda íntegramente.
- Idiomas: la model card restringe el soporte a inglés; no se garantiza calidad en castellano ni en otros idiomas.
- Contexto: no se documenta la longitud de contexto, lo que impide planificar casos de uso con ventanas largas.
- Sesgos y alucinaciones: no se documentan evaluaciones de sesgo ni de tasa de alucinación; al ser un modelo de 1.4B activos, cabe esperar mayor propensión a errores factuales que en modelos de mayor capacidad activa.
- Licencia: MIT, lo que permite uso comercial, pero la model card remite a los términos completos del modelo base, que conviene revisar antes de redistribuir.
- Producción: el repositorio está pensado para una app concreta (OwnOwl); no incluye pipeline, tokenizador documentado ni instrucciones de integración fuera de esa app.
- Formato: la cuantización 4-bit grupo 64 introduce pérdida de precisión respecto al modelo original; no se publican métricas de degradación.
- Mantenimiento: 0 descargas y 0 likes en el momento de la consulta, lo que indica un artefacto de distribución privado más que un proyecto comunitario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MihhailTLN/ownowl-ling-mini-2.0
- Modelo base: https://huggingface.co/inclusionAI/Ling-mini-2.0
- Librería MLX: https://github.com/ml-explore/mlx
