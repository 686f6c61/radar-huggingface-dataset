# Atomic-Germ/Qwen3.8-Distilled-9B-NPU2

## Resumen

Qwen3.8-Distilled-9B-NPU2 es una conversión cuantizada del modelo empero-ai/Qwen3.8-9B-Distill, publicada por el usuario Atomic-Germ. No se trata de un modelo entrenado desde cero, sino de un port del modelo destilado de 9B a formato Q4NX para su ejecución sobre la NPU AMD XDNA mediante el runtime FastFlowLM (FLM). El repositorio incluye tanto los pesos de lenguaje como los del codificador visual, lo que confirma su naturaleza multimodal (image-text-to-text).

El modelo base pertenece a la familia Qwen 3.5/3.8 y ha sido destilado, según los tags del repositorio, con énfasis en razonamiento, function calling y capacidades de visión. La conversión mantiene la licencia Apache 2.0 del original y se distribuye bajo la librería transformers, aunque el artefacto principal es un fichero propietario `model.q4nx` (7,11 GB) que no es compatible con llama.cpp ni con el ecosistema GGUF estándar.

Su relevancia radica en dos factores: por un lado, permite ejecutar un modelo multimodal de ~9B parámetros en hardware con NPU integrada (AMD XDNA) sin GPU dedicada; por otro, ejemplifica el creciente ecosistema de formatos de cuantización específicos para aceleradores, en este caso Q4NX con mezcla de Q8_0, Q4_1 y BF16. El repositorio acumula 2013 descargas y 4 likes desde su creación en agosto de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen 3.5/3.8; detalles internos no disponibles |
| Parametros totales | 8.953.803.264 (~8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4NX con mezcla Q8_0 / Q4_1 / BF16 (pesos de lenguaje); vision_weight.q4nx para el codificador visual |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Q4NX (model.q4nx, 7,11 GB); no es GGUF; repo de 33,6 GB con tokenizer.json, chat_template.jinja, config.json |
| Runtime | FastFlowLM (FLM) 1.0.1 sobre NPU AMD XDNA |
| Modelo base | empero-ai/Qwen3.8-9B-Distill |
| Instalador | flm-add (pip / uv tool) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su pertenencia a la familia Qwen 3.5/3.8 y su carácter multimodal (procesa imagen y texto). Los tags indican que se trata de un modelo destilado, con capacidades declaradas de razonamiento, function calling y visión. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

En cuanto a la conversión, el autor aplica una cuantización mixta Q4NX: capas en Q8_0, Q4_1 y BF16 según sensibilidad, más un fichero separado para el codificador visual. El resultado se compila para el runtime FastFlowLM, que ejecuta la inferencia sobre la NPU AMD XDNA. No hay información sobre innovaciones técnicas adicionales (atención lineal, decodificación especulativa, etc.) en la documentación proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, según el tag `conversational`.
- Razonamiento explícito, derivado del proceso de destilación del modelo base.
- Function calling / tool calling, declarado en los tags del repositorio.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con codificador visual incluido (`vision_weight.q4nx`).
- Capacidades multilingües: no confirmadas en la información disponible.
- Ejecución en NPU AMD XDNA mediante FastFlowLM, sin necesidad de GPU dedicada.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere integración vía API compatible con OpenAI.
- No se documentan modos de pensamiento extendido, audio ni otras modalidades.

## Casos de uso

- Asistentes conversacionales en equipos con NPU AMD: el modelo puede desplegarse en portátiles o mini-PC con XDNA para mantener conversaciones multi-turno sin GPU dedicada, aprovechando el runtime FLM y el formato Q4NX.
- Análisis de documentos con imágenes en local: al ser image-text-to-text, permite extraer información de capturas, formularios o diagramas en entornos de escritorio con NPU, sin enviar datos a la nube.
- Automatización de tareas con function calling: el soporte declarado de tool calling permite integrarlo en flujos que consulten APIs o ejecuten acciones estructuradas desde un agente local.
- Prototipado de agentes de razonamiento en hardware de consumo: la destilación orientada a reasoning facilita experimentar con cadenas de razonamiento multi-paso en equipos sin acelerador NVIDIA.
- Evaluación de modelos multimodales en el ecosistema FastFlowLM: útil para desarrolladores que quieran comparar el rendimiento de la NPU XDNA frente a GPU en tareas de visión-lenguaje.
- Integración en pipelines compatibles con endpoints: el tag `endpoints_compatible` sugiere su uso detrás de una API estilo OpenAI para servicios internos de inferencia en hardware AMD.
- Docencia e investigación sobre cuantización Q4NX: el repositorio sirve como referencia práctica de conversión de un modelo de ~9B a un formato propietario para NPU, con pesos mixtos Q8_0/Q4_1/BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye un directorio `results/` con pruebas de FLM-Test, pero no se han proporcionado los valores numéricos.

## Requisitos de hardware

- Inferencia sobre NPU AMD XDNA (requisito principal); no está pensado para GPU NVIDIA ni para CPU con llama.cpp.
- Pesos de lenguaje en Q4NX: 7,11 GB; el repositorio completo ocupa 33,6 GB (incluye tokenizer, configuración, visión y resultados).
- VRAM/RAM estimada: no disponible con precisión; el fichero de pesos de 7,11 GB sugiere un consumo de memoria en torno a esa cifra más overhead del runtime, pero no se confirma.
- GPU recomendadas: no aplica; el destino es NPU AMD XDNA. No se indica compatibilidad con A100, H100 ni RTX 4090.
- Despliegue: FastFlowLM (FLM) 1.0.1 con el instalador `flm-add` (`uv tool install flm-add`), seguido de `flm run qwen3.8-distilled:9b` con las variables `FLM_CONFIG_PATH` y `FLM_XCLBIN_PATH` apuntando al directorio de configuración del usuario.
- No compatible con vLLM, llama.cpp, Ollama ni TGI de forma nativa, al no ser GGUF ni safetensors estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Qwen3.8-Distilled-9B-NPU2 | ~8,95B | no disponible | imagen-texto | Apache 2.0 | Q4NX / FastFlowLM (NPU AMD) |
| empero-ai/Qwen3.8-9B-Distill (base) | ~9B (no confirmado) | no disponible | imagen-texto | Apache 2.0 (según tag del port) | no disponible |
| Alternativas GGUF de la familia Qwen 3.x | variable | variable | texto o multimodal | variable | GGUF / llama.cpp, Ollama |

La comparación con alternativas de la misma categoría (modelos multimodales de ~9B ejecutables en hardware de consumo) no puede completarse con datos verificables en la información proporcionada. El rasgo diferencial del modelo es su formato Q4NX y su runtime FLM para NPU AMD, frente a los formatos GGUF o safetensors habituales.

## Limitaciones y advertencias

- Modelo derivado y cuantizado: los sesgos y errores del modelo base se heredan y pueden amplificarse por la cuantización Q4_1 en algunas capas.
- Riesgo de alucinación inherente a los modelos destilados de ~9B, especialmente en tareas de razonamiento largo o visión con imágenes de baja calidad.
- Idiomas soportados no documentados; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés.
- Longitud de contexto no especificada; no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Formato propietario Q4NX: no es portable a llama.cpp, vLLM, Ollama ni TGI; queda ligado al runtime FastFlowLM y a hardware AMD XDNA.
- Dependencia de una versión concreta del runtime (FLM 1.0.1) y de variables de entorno específicas; posibles roturas en actualizaciones.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base `empero-ai/Qwen3.8-9B-Distill` antes de producción.
- El repositorio es una conversión de un tercero (Atomic-Germ), no una publicación oficial de Empero AI ni de Alibaba/Qwen; la trazabilidad del proceso de cuantización no está detallada.
- No hay benchmarks publicados que permitan validar la pérdida de calidad frente al modelo base en fp16/bf16.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Atomic-Germ/Qwen3.8-Distilled-9B-NPU2
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-9B-Distill
- Instalador flm-add: disponible vía `pip install flm-add` o `uv tool install flm-add` (no se proporciona URL directa)
- FastFlowLM: no se proporciona URL en la información disponible
- Papers, blogs y demos: no disponibles
