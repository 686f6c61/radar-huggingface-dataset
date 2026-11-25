# eteron/ZeroHero-Crafter-Text-5M-PPO-RA-63.6M-steps

## Resumen

ZeroHero-Crafter-Text-5M-PPO-RA-63.6M-steps es una política de agente entrenada mediante aprendizaje por refuerzo (PPO-RA) para jugar a Crafter, un entorno de mundo abierto tipo Minecraft, usando observaciones en formato texto (BALROG text observations). Lo desarrolla el autor independiente eteron dentro del proyecto ZeroHero y se distribuye bajo licencia Apache-2.0.

El modelo es deliberadamente pequeño: 5.033.600 parámetros en formato FP32 safetensors, con arquitectura basada en Qwen3 según los tags del repositorio. No es un modelo de chat de propósito general, sino una política especializada que requiere un wrapper de agente concreto para formatear observaciones y parsear respuestas, tal como advierte el autor en la model card.

Su relevancia es acotada pero interesante para investigación en RL y agentes: demuestra un pipeline completo de preentrenamiento supervisado seguido de post-entrenamiento con PPO-RA durante 63.635.456 decisiones de entorno, y publica los pesos de inferencia junto con ejemplos ejecutables. No incluye código de entrenamiento, datos, pesos del crítico ni estados del optimizador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen3 (según tags; detalles no disponibles) |
| Parámetros totales | 5.033.600 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en FP32 safetensors) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (FP32, solo política) |

## Arquitectura y entrenamiento

La arquitectura se etiqueta como Qwen3 en los tags del repositorio, lo que sugiere una implementación de transformer decoder-only mediante Hugging Face Transformers, pero la model card no detalla número de capas, dimensión oculta, cabezas de atención ni longitud de contexto. El modelo parte de una inicialización aleatoria pequeña seguida de preentrenamiento supervisado, y posteriormente se post-entrena con PPO-RA (una variante de Proximal Policy Optimization) sobre el entorno Crafter con observaciones textuales BALROG.

El presupuesto de post-entrenamiento declarado es de 63.635.456 decisiones de entorno. El autor especifica que este checkpoint no debe etiquetarse como el punto de 50M usado en la comparación del manuscrito asociado. Los entrenamientos del paper usaron entornos CUDA nativos, mientras que el adaptador de juego incluido usa el entorno CPU estándar, y no se reclama reproducción de trayectorias idénticas por semilla ni de benchmarks. Los tensores de política se verificaron para igualdad exacta durante la exportación y se incluyen sumas SHA256 de los ficheros de release.

## Capacidades

- Toma de decisiones secuenciales en el entorno Crafter a partir de observaciones en texto.
- Generación de acciones de agente según el contrato de entrada/salida definido por el wrapper incluido.
- Ejecución de episodios completos de juego mediante el adaptador de Crafter en CPU.
- Inferencia de una sola respuesta sin necesidad de instalar el entorno, usando fixtures de ejemplo.
- No soporta tool calling, function calling ni razonamiento multi-step de propósito general.
- No es un modelo conversacional ni multilingüe: solo inglés y exclusivamente en el formato del agente.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en aprendizaje por refuerzo: servir como política de referencia o baseline para experimentos con PPO-RA en entornos de mundo abierto, dado que se publican pesos de inferencia verificados y metadatos del presupuesto de entrenamiento.
- Reproducción de episodios de Crafter: el adaptador incluido permite ejecutar partidas completas en CPU, útil para inspeccionar cualitativamente el comportamiento aprendido sin infraestructura GPU.
- Estudio de agentes basados en texto: analizar cómo una política pequeña (5M parámetros) mapea observaciones textuales estructuradas a acciones, como punto de partida para arquitecturas mayores.
- Docencia y divulgación: ejemplo compacto y ejecutable de un pipeline RL completo (preentrenamiento supervisado más PPO) con requisitos mínimos de hardware.
- Comparación de variantes ZeroHero: el repositorio forma parte de un proyecto con múltiples checkpoints; este sirve para contrastar presupuestos de entrenamiento y configuraciones del agente.
- Validación de contratos de observación: el fichero `agent_config.json` y los fixtures permiten probar pipelines de formateo y parseo de observaciones antes de integrarlos en entornos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las curvas numéricas de entrenamiento no se presentan como una evaluación held-out de este release y que no se reclama reproducción de benchmarks del manuscrito.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (5M parámetros, aproximadamente 20 MB de pesos), holgada en cualquier GPU consumer.
- GPU recomendadas: cualquiera; el adaptador de ejemplo funciona en CPU, por lo que no se requiere GPU dedicada.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: el ejemplo oficial usa `transformers` con `examples/infer.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de políticas Crafter-text con pesos públicos y presupuesto de entrenamiento documentado.

## Limitaciones y advertencias

- No es un modelo de chat de propósito general; usarlo fuera del wrapper de agente produce resultados sin sentido.
- Solo soporta inglés y el contrato de observación específico de Crafter/BALROG.
- Riesgo de alucinación y acciones inválidas fuera del formato esperado; el parseo de respuestas es parte de la interfaz de la política.
- Diferencias numéricas en tiempo de ejecución y muestreo pueden alterar respuestas individuales.
- El checkpoint corresponde a 63.635.456 decisiones y no debe etiquetarse como el punto de 50M del manuscrito.
- No se incluyen código de entrenamiento, datos, pesos del crítico ni estados del optimizador, lo que limita la reproducibilidad completa.
- El adaptador incluido usa el entorno CPU estándar; no se garantizan trayectorias idénticas a los entrenamientos en CUDA ni reproducción de benchmarks.
- Licencia Apache-2.0 permite uso comercial, pero las dependencias del entorno y las observaciones de benchmarks públicos quedan sujetas a sus licencias originales (ver `THIRD_PARTY_NOTICES.md`).
- Repositorio sin descargas ni likes en el momento de la consulta; ecosistema y soporte comunitario prácticamente inexistentes.

## Enlaces

- Hugging Face: https://huggingface.co/eteron/ZeroHero-Crafter-Text-5M-PPO-RA-63.6M-steps
- Ejemplos de inferencia: `examples/README.md` y `examples/infer.py` dentro del repositorio
- Metadatos del release: `agent_config.json`, `release_metadata.json`, `SHA256SUMS`
- Avisos de terceros: `THIRD_PARTY_NOTICES.md` en el repositorio
