# CrowdMind/lamb

## Resumen

`CrowdMind/lamb` (identificador interno del run `simple_20261101_curriculum`) es un checkpoint de un modelo de lenguaje experimental de tipo decoder-only, con arquitectura transformer autorregresiva, entrenado desde cero con el framework de codigo abierto nanochat. Lo publica el usuario CrowdMind en HuggingFace y se trata exclusivamente del checkpoint base tras preentrenamiento, no de un modelo ajustado por instrucciones ni de un asistente conversacional verificado. Su relevancia es acotada: sirve como material de investigacion y como punto de partida para fine-tuning dentro del ecosistema nanochat, no como modelo de produccion.

El modelo es muy pequeno: 12 capas, embeddings de 768 dimensiones, 6 cabezas de atencion y 6 cabezas KV, con un tokenizador BPE propio de nanochat de 32.768 tokens y una longitud maxima de secuencia de 8.196 tokens. El entrenamiento se realizo en una unica GPU NVIDIA GeForce RTX 4060 Ti con computo en BF16, lo que da una idea clara de la escala del experimento: es un modelo de juguete o de laboratorio, no un modelo competitivo frente a alternativas de su rango.

El checkpoint publicado corresponde al paso 1.679, con una metrica de validacion BPB (bits por byte) final de 0,3356 y una metrica CORE de 0,0521. El repositorio de HuggingFace aparece con 0 GB de tamano, 0 descargas y 0 likes en el momento de la consulta, y la model card no declara licencia, idiomas ni pipeline. Todo ello apunta a una publicacion tecnica temprana y poco documentada en sus metadatos de plataforma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo decoder-only (estilo GPT), implementado en nanochat |
| Parametros totales | no disponible (12 capas, 768 dimensiones de embedding, 6 cabezas de atencion, 6 cabezas KV) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.196 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`model_001679.pt`); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico con 12 capas, 768 dimensiones de modelo y atencion multi-cabeza con 6 cabezas de consulta y 6 cabezas KV (relacion 1:1, sin GQA). Emplea un patron de ventana de atencion denotado como `SSSL` en la model card, y un tokenizador BPE propio de nanochat con vocabulario de 32.768 tokens. La secuencia maxima es de 8.196 tokens.

El entrenamiento sigue un curriculo de longitud de secuencia 2.048 → 6.144 → 8.196 tokens sobre cuatro fuentes de datos: `CrowdMind/2048-pretraining` (145.056 filas), `CrowdMind/6144-pretraining` (187.702 filas), `AIGym/code-pretraining-8196` (1.632.309 filas, orientado a codigo) y `CrowdMind/cve-assistant-text` (50.000 filas, texto sobre seguridad y CVE). El batch total fue de 524.544 tokens con batch de dispositivo 1, ratio objetivo parametros-datos de 8 y evaluacion cada 81.960 tokens. El entrenamiento duro aproximadamente 27.802 segundos en una RTX 4060 Ti en BF16. No se documenta RLHF, DPO ni SFT en los artefactos disponibles: el run script incluye comandos de SFT y evaluacion de chat, pero no se publica checkpoint ajustado.

## Capacidades

- Generacion de texto autoregresiva y completado de prompts a nivel de modelo base.
- Modelado de lenguaje para investigacion: calculo de perplejidad y BPB sobre corpus propios.
- Punto de partida para fine-tuning supervisado (SFT) dentro de nanochat.
- Exposicion a codigo durante el preentrenamiento mediante el segmento `AIGym/code-pretraining-8196`, sin garantia de calidad funcional.
- Exposicion a texto sobre vulnerabilidades y CVE mediante `CrowdMind/cve-assistant-text`, sin garantia de correccion en materia de seguridad.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- No se documenta comportamiento multilingue ni cobertura de idiomas.

## Casos de uso

- Investigacion sobre curriculos de longitud de secuencia: el modelo permite reproducir y analizar el efecto del curriculo 2.048 → 6.144 → 8.196 tokens sobre la BPB de validacion en un entorno de una sola GPU consumer.
- Estudio comparativo de tokenizadores: al usar el BPE de nanochat con 32.768 tokens, sirve para medir el impacto del vocabulario en la eficiencia de compresion y en la BPB frente a otros tokenizadores.
- Fine-tuning supervisado de laboratorio: es un checkpoint base adecuado para experimentar con SFT sobre tareas acotadas (clasificacion, extraccion, resumen de dominios pequenos) y medir la ganancia respecto al modelo base.
- Analisis de sesgos y calidad en corpus de codigo y seguridad: el segmento CVE y el corpus de codigo permiten estudiar como un modelo pequeno reproduce patrones de texto tecnico y que errores comete.
- Docencia y formacion: su escala (12 capas, 768 dimensiones, entrenamiento en una RTX 4060 Ti) lo hace util para explicar el pipeline completo de preentrenamiento, evaluacion y publicacion de un LLM.
- Pruebas de infraestructura de entrenamiento: sirve como caso de prueba reproducible para validar scripts de nanochat, manifiestos de curriculo y utilidades de evaluacion antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son metricas internas del run, no comparaciones con otros modelos:

| Metrica | Valor |
|---|---|
| BPB de validacion final (paso 1.679) | 0,3356 |
| Mejor BPB de validacion observada | 0,3315 |
| Metrica CORE (paso 1.679) | 0,0521 |
| Tiempo de entrenamiento registrado | ~27.802 s en una RTX 4060 Ti (BF16) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por la configuracion (12 capas, 768 dimensiones, contexto de 8.196 tokens) el checkpoint es muy pequeno y cabe holgadamente en GPUs consumer, aunque no se publica el numero exacto de parametros.
- GPU de entrenamiento registrada: una NVIDIA GeForce RTX 4060 Ti en BF16.
- Cabe en GPU consumer: si, segun la configuracion descrita; no se especifican modelos concretos adicionales.
- Opciones de despliegue: el checkpoint se distribuye como `.pt` de PyTorch y se genera con nanochat; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no incluye comparaciones con otros modelos y no se dispone de datos de benchmarks estandar que permitan situarlo frente a alternativas de su rango.

## Limitaciones y advertencias

- Es un modelo base preentrenado: no sigue instrucciones de forma fiable ni mantiene formato conversacional util.
- Capacidad muy limitada por su tamano (12 capas, 768 dimensiones); no debe esperarse un rendimiento comparable a modelos mayores o ajustados por instrucciones.
- Riesgo alto de alucinacion, texto sesgado, ofensivo o danino, segun advierte el propio autor.
- El texto sobre codigo y seguridad no implica que el codigo generado sea seguro; requiere revision y pruebas antes de cualquier uso.
- Los datos de entrenamiento pueden contener material personal, con copyright o de baja calidad; el manifiesto no resuelve la procedencia ni las licencias de los datasets.
- La evaluacion publicada cubre solo tareas seleccionadas y no establece generalizacion, calibracion, privacidad, seguridad ni robustez.
- No se declara licencia en HuggingFace ni en la model card, por lo que el uso comercial y la redistribucion no estan autorizados de forma explicita.
- No se documentan idiomas soportados ni tipos de cuantizacion disponibles.
- El repositorio figura con 0 GB de tamano en la plataforma, lo que puede indicar que los pesos no estan efectivamente alojados o que la informacion de plataforma esta incompleta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CrowdMind/lamb
- Codigo de entrenamiento citado en la model card: `scripts/base_train.py` via `runs/simple.sh` (ruta del repositorio nanochat del autor, no enlazada publicamente en la informacion disponible)
- Evaluacion base: `output/models/simple_20261101_curriculum/base_eval/base_model_001679.csv` (ruta interna del repositorio del autor)
- Metadatos del checkpoint: `output/models/simple_20261101_curriculum/base_checkpoints/simple_20261101_curriculum/meta_001679.json` (ruta interna)
- Manifiesto del curriculo: `output/models/simple_20261101_curriculum/base_data_climbmix/curriculum_manifest.json` (ruta interna)
- Log de entrenamiento: `output/logs/simple_20261101_curriculum.log` (ruta interna)
- Dataset `CrowdMind/2048-pretraining` (referenciado, sin URL en la informacion disponible)
- Dataset `CrowdMind/6144-pretraining` (referenciado, sin URL en la informacion disponible)
- Dataset `AIGym/code-pretraining-8196` (referenciado, sin URL en la informacion disponible)
- Dataset `CrowdMind/cve-assistant-text` (referenciado, sin URL en la informacion disponible)
