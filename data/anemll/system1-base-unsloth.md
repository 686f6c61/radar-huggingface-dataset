# anemll/system1-base-unsloth

## Resumen

`anemll/system1-base-unsloth` es un paquete de pesos orientado a la Apple Neural Engine (ANE) publicado por anemll bajo el paraguas de sus builds "System 1 ANE". No es un checkpoint cargable con `transformers`: se distribuye como paquetes Core AI (`.aimodel`) pensados para ejecutarse en la ANE de chips Apple, y cada modelo vive en su propia carpeta con su `config.json` y su model card. El repositorio se etiqueta con `coreai`, `apple-neural-engine`, `ane`, `unsloth`, `qwen3.5` y `decision-model`, y ocupa 2,6 GB.

La propuesta conceptual es la de un "sistema 1": modelos de decisión pequeños que realizan un único forward pass y emiten una decisión, sin generar texto. El modelo documentado en la model card es Snake (`snake-stock-qwen3.5-unsloth`), construido sobre el modelo base stock `unsloth/Qwen3.5-0.8B` al que se le añade una LoRA entrenada con Unsloth y una cabeza de decisión. La tarea declarada es elegir movimientos en el juego Snake, con una ventana de prefill de 304 tokens, los 7 paquetes de los que consta marcados como `fully_ane` y un tiempo aproximado de 91 ms por decisión sobre un M5 Max.

Su relevancia es acotada y muy específica: ilustra un patrón de despliegue en el que un modelo de lenguaje pequeño se reutiliza como cabecera de clasificación/decisión de baja latencia íntegramente en el acelerador neuronal de Apple, en lugar de como generador de texto. Es material de interés para quien trabaja en inferencia on-device en macOS, control de agentes en bucle cerrado o clasificación zero-shot local, no para pipelines de generación de texto en servidores con GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo base transformer (Qwen3.5-0.8B) con LoRA entrenada y cabeza de decisión; empaquetado como paquetes Core AI `.aimodel` para Apple Neural Engine. No se detalla el número de capas ni la configuración interna |
| Parámetros totales | Aproximadamente 0,8 mil millones (heredados del nombre del base `unsloth/Qwen3.5-0.8B`); no se indica el recuento exacto tras añadir la cabeza de decisión |
| Parámetros activos | No aplica (no se describe como MoE en la información disponible) |
| Longitud de contexto | Ventana de prefill de 304 tokens (dato declarado en la model card para Snake) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Paquetes Core AI `.aimodel` (7 paquetes, `fully_ane`) junto con artefactos `safetensors`; el repositorio no es cargable con `AutoModel` de `transformers` |

## Arquitectura y entrenamiento

La información disponible describe un esquema de construcción, no una arquitectura propietaria: se parte del checkpoint stock `unsloth/Qwen3.5-0.8B`, se entrena una LoRA con Unsloth y se acopla una cabeza de decisión específica de la tarea. El resultado se convierte a paquetes Core AI `.aimodel` que se ejecutan sobre Apple Neural Engine. El pipeline declarado es `zero-shot-classification`, lo que encaja con el uso de una cabeza de clasificación sobre las representaciones del modelo base en lugar de una cabeza de generación de tokens.

El único modelo documentado en el repositorio es Snake, orientado a la decisión de movimiento en el juego homónimo, con una ventana de prefill de 304 tokens y los 7 paquetes marcados como `fully_ane` (es decir, sin operaciones que caigan fuera del acelerador neuronal). No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se detallan innovaciones técnicas de atención o decodificación (decodificación especulativa, atención lineal, etc.). El repositorio se declara explícitamente como una colección de builds Core AI y no como un checkpoint de `transformers`.

## Capacidades

- Decisión de movimiento en el juego Snake: la tarea declarada del modelo incluido, con un forward pass y una decisión por paso, sin texto generado.
- Clasificación zero-shot: el pipeline declarado en HuggingFace es `zero-shot-classification`, lo que sugiere uso como cabecera de clasificación sobre etiquetas definidas en tiempo de inferencia.
- Inferencia de baja latencia en dispositivo: aproximadamente 91 ms por decisión en un M5 Max, según la model card.
- Ejecución íntegra en Apple Neural Engine: los 7 paquetes del modelo Snake están marcados como `fully_ane`, sin fallback a CPU/GPU por operaciones no soportadas.
- Idiomas: únicamente inglés (`en`) según los metadatos del repositorio.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio, modo "thinking" ni generación de texto libre.
- No se documenta ningún tipo de cuantización ni variantes de tamaño (por ejemplo, versiones GGUF).

## Casos de uso

- Control de agentes en bucle cerrado sobre macOS: integrar el modelo como política de decisión de un agente simple (juego, simulación o entorno discreto) aprovechando que cada decisión cuesta del orden de 91 ms en un M5 Max y no requiere generar texto.
- Prototipado de sistemas 1/sistema 2: usar este paquete como "sistema 1" rápido que filtra o enruta decisiones, reservando un modelo mayor para el razonamiento profundo, todo dentro de una misma aplicación de escritorio.
- Clasificación local de intenciones en aplicaciones de escritorio: dado el pipeline `zero-shot-classification`, se puede emplear para etiquetar entradas cortas (hasta 304 tokens de prefill) sin enviar datos a la nube, lo que resulta adecuado cuando hay requisitos de privacidad.
- Inferencia on-device con batería y térmica limitadas: al ejecutarse en la ANE y no en GPU discreta, encaja en aplicaciones macOS que necesitan consumo energético bajo y latencia estable.
- Investigación en destilación de decisiones: sirve como banco de pruebas para estudiar cuánta capacidad de decisión se conserva al añadir una cabeza entrenada con LoRA sobre un modelo base de 0,8 mil millones y compilarlo a Core AI.
- Referencia de despliegue ANE: como ejemplo reproducible de conversión de un modelo base más LoRA a paquetes `.aimodel` con cobertura `fully_ane`, útil para equipos que quieran replicar el flujo con sus propias cabezas de decisión.
- Enrutamiento previo de consultas en un pipeline mayor: clasificar rápidamente la consulta entrante en un número reducido de categorías antes de invocar un modelo generativo más costoso, siempre que el caso de uso se limite a entradas cortas en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni métricas de tarea para Snake). El único dato cuantitativo de rendimiento aportado es la latencia:

| Métrica | Valor | Contexto |
|---|---|---|
| Latencia por decisión | ~91 ms | M5 Max, modelo Snake, paquetes `fully_ane` |
| Cobertura en ANE | 7/7 paquetes `fully_ane` | Modelo Snake |
| Ventana de prefill | 304 tokens | Modelo Snake |

## Requisitos de hardware

- Plataforma objetivo: Apple Neural Engine (ANE) mediante el runtime Core AI; no se describe soporte para CUDA, ROCm ni CPU genérica.
- Hardware de referencia declarado: Apple M5 Max, con ~91 ms por decisión en el modelo Snake.
- VRAM estimada: no disponible (no es un despliegue orientado a GPU; el repositorio ocupa 2,6 GB en disco, pero no se indica el consumo de memoria en tiempo de ejecución).
- GPU recomendadas: no aplica; el modelo está empaquetado para la ANE y no se documenta ejecución en A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no disponible; el requisito declarado es un chip Apple con Neural Engine.
- Opciones de despliegue: Core AI con paquetes `.aimodel`; `transformers` `AutoModel` no puede cargar el repositorio. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: ~91 ms por decisión en M5 Max; no se publica throughput agregado ni cifras para otros chips.
- Descarga selectiva: es posible descargar solo una carpeta de modelo mediante `snapshot_download` con `allow_patterns`, lo que reduce el tamaño a transferir frente a los 2,6 GB del repositorio completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anemll/system1-base-unsloth (Snake, Qwen3.5-0.8B + LoRA + cabeza de decisión) | ~0,8 mil millones (base) | 304 tokens de prefill | Decisión de movimiento / clasificación zero-shot en ANE | Apache 2.0 | HuggingFace, paquetes Core AI `.aimodel` |
| unsloth/Qwen3.5-0.8B (modelo base) | ~0,8 mil millones | No disponible en la información proporcionada | Modelo de lenguaje general | No disponible en la información proporcionada | HuggingFace |
| Otros modelos de decisión para ANE | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativos entre estas opciones en la información proporcionada; la comparación se limita, por tanto, a parámetros, formato y licencia.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, sino una decisión por forward pass; no debe evaluarse como un LLM conversacional.
- No es cargable con `transformers` `AutoModel`; requiere el flujo de Core AI y compilación/ejecución específica descrita en la carpeta de cada modelo.
- Idioma limitado a inglés (`en`) según los metadatos; no se documenta soporte multilingüe ni evaluación en castellano.
- Ventana de contexto muy corta (304 tokens de prefill), insuficiente para conversaciones multi-turno o documentos largos.
- Dependencia de hardware Apple: el requisito declarado es la Neural Engine, lo que excluye despliegues en servidores con GPU NVIDIA o AMD.
- No se publican datos de entrenamiento, composición del dataset, número de tokens ni proceso de alineación, por lo que no es posible evaluar sesgos de forma fundamentada.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de decisiones incorrectas o poco calibradas al ser una cabeza entrenada para una tarea concreta; no se aportan métricas de precisión.
- Licencia Apache 2.0, la misma que Qwen3.5-0.8B y Unsloth; se permite uso comercial con atribución según los términos de dicha licencia. El proyecto se declara no oficial y sin afiliación ni respaldo de Alibaba Cloud o Unsloth.
- Inconsistencia de identificadores a tener en cuenta: los metadatos de HuggingFace apuntan al repositorio `anemll/system1-base-unsloth`, mientras que la model card describe el repositorio `anemll/system1-ane` y su carpeta `snake-stock-qwen3.5-unsloth`. Conviene verificar la ruta real antes de automatizar descargas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin histórico de uso que permita inferir estabilidad o mantenimiento.
- Sin datos de cuantizaciones alternativas, no hay una vía documentada para reducir requisitos de memoria más allá del empaquetado Core AI ya publicado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anemll/system1-base-unsloth
- Repositorio referenciado en la model card: https://huggingface.co/anemll/system1-ane
- Carpeta del modelo Snake: https://huggingface.co/anemll/system1-ane/tree/main/snake-stock-qwen3.5-unsloth
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Licencia (Apache 2.0): `LICENSE` dentro del repositorio
- Atribuciones: `NOTICE` dentro del repositorio
