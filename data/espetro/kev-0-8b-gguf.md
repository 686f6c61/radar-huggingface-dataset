# espetro/kev-0.8b-gguf

## Resumen

Kev 0.8B es un modelo de decisión de estilo "System One" que no genera texto libre, sino que devuelve probabilidades calibradas para preguntas tipadas sobre un estado de entrada. Se construye a partir de un backbone Qwen3.5-0.8B-Base al que se le añade una cabeza pointer entrenada (LoRA más `head.pt`), de modo que el modelo recibe un contexto (por ejemplo, un mensaje de cliente) y un conjunto de preguntas con tipos y criterios, y responde con distribuciones de probabilidad sobre las opciones válidas.

El paquete publicado por espetro es una conversión a GGUF del modelo original de jaredpalmer (Kev v1.0), con la cabeza pointer y la temperatura de calibración (2.3511) horneadas como tensores `dec.head_*` y metadatos `kev.*`. Esto permite servirlo directamente con un fork de llama.cpp que expone endpoints TypeSafe `/v1/systemone` y `/studio`, además de una herramienta de línea de comandos `llama-decide`.

Es relevante porque propone un patrón distinto al de los LLM generativos: en lugar de pedir al modelo que "razone" y produzca una respuesta en lenguaje natural que luego hay que parsear, el modelo clasifica directamente con probabilidades calibradas, lo que simplifica el enrutamiento, la toma de decisiones y la integración en pipelines deterministas. El modelo tiene 752.917.824 parámetros y se distribuye en cuantizaciones q8_0 (814 MB) y f16 (1.5 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.5-0.8B-Base) con cabeza pointer entrenada para decisión |
| Parametros totales | 752.917.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8_0 (814 MB), f16 (1.5 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B-Base (commit `dc7cdfe2`) y le superpone un adaptador LoRA más una cabeza pointer (`head.pt`) procedentes de Kev v1.0 (commit `bf75a6a`). La fusión se realiza con el pipeline `tools/kev` del fork espetro/llama.cpp: `kev_v10_merge.py`, conversión a GGUF con `--no-mtp`, `kev_head.py` y `kev_pack.py`. El resultado incorpora los tensores de la cabeza (`dec.head_*`) y metadatos `kev.*`, incluida la temperatura de calibración 2.3511, directamente en el fichero GGUF.

La innovación principal es el paradigma "System One": en lugar de decodificación autoregresiva de texto, el modelo aplica una cabeza de clasificación sobre representaciones del backbone para producir probabilidades calibradas sobre preguntas tipadas (por ejemplo, tipo `choice` con criterios por opción). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Decisión tipada: responde a preguntas con tipo (por ejemplo `choice`) y criterios asociados, devolviendo probabilidades calibradas en lugar de texto generado.
- Clasificación y enrutamiento: asignación de un estado de entrada a categorías definidas por el usuario (departamentos, etiquetas, acciones).
- Salida estructurada TypeSafe mediante el endpoint `/v1/systemone` del fork de llama.cpp.
- Uso mediante línea de comandos con `llama-decide --json request.json`.
- Compatibilidad con llama.cpp estándar: los ficheros cargan como un modelo Qwen3.5 ordinario, ignorando los tensores y metadatos `kev.*`.
- Ejecución en navegador mediante llama.cpp WASM (demo con una cuantización menor).
- No se documentan capacidades de generación de texto libre, tool calling, agentes multi-paso, visión, audio ni multilingüismo en la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia ("Shoes arrived two weeks late and in the wrong size"), el modelo devuelve la probabilidad de que corresponda a `returns` o `shipping` según los criterios definidos, permitiendo asignación automática con umbral de confianza.
- Clasificación de correo entrante: definir preguntas tipadas con criterios por categoría (facturación, técnico, comercial) y usar las probabilidades para derivar el mensaje al equipo adecuado.
- Triaje en pipelines de atención al cliente: sustituir reglas frágiles o llamadas a LLM generativos por una decisión calibrada de bajo coste (modelo de 0.8B) antes de invocar un modelo mayor.
- Moderación y etiquetado: clasificar contenido según políticas definidas como criterios de opciones, con probabilidades que permiten fijar umbrales de revisión humana.
- Extracción de intención en asistentes conversacionales: determinar la intención del usuario entre un conjunto cerrado de acciones antes de ejecutar el flujo correspondiente.
- Automatización de decisiones en backoffice: evaluar estados (por ejemplo, descripciones de incidencias logísticas) contra criterios de negocio y registrar la distribución de probabilidad como evidencia auditable.
- Despliegue en entornos con recursos limitados: al ocupar 814 MB en q8_0, puede servirse en CPU o GPUs modestas y ejecutarse incluso en el navegador vía WASM para demos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1 GB para q8_0 (814 MB de pesos más overhead de contexto) y unos 2 GB para f16 (1.5 GB de pesos más overhead).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; también viable en CPU dada la baja huella del modelo.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090, etc.), e incluso en iGPU o CPU.
- Opciones de despliegue: fork espetro/llama.cpp con `llama-server` (endpoints `/v1/systemone` y `/studio`) y `llama-decide`; llama.cpp estándar para carga como modelo Qwen3.5; llama.cpp WASM en navegador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Paradigma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kev 0.8B (este) | 752.917.824 | no disponible | Decisión tipada con probabilidades calibradas | Apache-2.0 | GGUF en HF, fork de llama.cpp |
| Qwen3.5-0.8B-Base | ~0.8B | no disponible | Generación de texto autoregresiva | Apache-2.0 | HF |
| Kev v1.0 (jaredpalmer) | ~0.8B | no disponible | Decisión tipada (formato original) | Apache-2.0 | HF, GitHub |

La comparación con alternativas de la misma categoría (modelos de decisión o clasificadores calibrados basados en LLM) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto: solo responde a preguntas tipadas con probabilidades; no sirve para tareas generativas.
- El endpoint `/v1/systemone` y la herramienta `llama-decide` requieren el fork espetro/llama.cpp; en llama.cpp estándar el modelo carga pero ignora la cabeza y los metadatos, por lo que pierde su funcionalidad principal.
- La calibración depende de la temperatura horneada (2.3511); alterar el pipeline de conversión o re-cuantizar sin seguir el proceso documentado puede degradar la calibración.
- No se documentan idiomas soportados; el comportamiento multilingüe es incierto.
- No se dispone de datos sobre sesgos, tasas de alucinación o evaluación de robustez.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del backbone Qwen3.5-0.8B-Base y del runtime (MIT) por separado.
- Modelo con pocas descargas (201) y sin likes; madurez y soporte comunitario limitados.
- El contexto máximo no está documentado, lo que dificulta planificar entradas largas en producción.

## Enlaces

- Hugging Face: https://huggingface.co/espetro/kev-0.8b-gguf
- Modelo original: https://huggingface.co/jaredpalmer/kev-0.8b
- Repositorio del modelo original: https://github.com/jaredpalmer/kev
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Fork de llama.cpp: https://github.com/espetro/llama.cpp
- Demo WASM: https://espetro.github.io/llama.cpp/
- Cuantización de demo: https://huggingface.co/espetro/kev-0.8b-demo-gguf
