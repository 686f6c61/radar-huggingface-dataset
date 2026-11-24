# huaq99/mtrl-qwen25-3b-en-is-dapo-shortmid-v1

## Resumen

mtrl-qwen25-3b-en-is-dapo-shortmid-v1 es un adaptador LoRA de investigación para traducción automática inglés→islandés, desarrollado por el usuario huaq99 en el contexto del proyecto mtrl (ETHz-DL-team29). No se trata de un modelo completo, sino de un delta LoRA que debe cargarse sobre el modelo base Qwen/Qwen2.5-3B-Instruct, fijado a la revisión aa8e72537993ba99e69dfaafa59ed015b17504d1. El repositorio ocupa 0,5 GB y contiene únicamente los pesos del adaptador en formato safetensors, con librería PEFT.

El adaptador se entrena mediante DAPO (un variante de optimización por preferencias) sobre un modelo base de 3.000 millones de parámetros con arquitectura transformer densa y ventana de contexto de 32.768 tokens (característica de la familia Qwen2.5). El objetivo declarado es mejorar la calidad de traducción respecto a un SFT original en el benchmark WMT26, con una configuración LoRA de r=64 y alpha=128.

Su relevancia es acotada y experimental: los resultados publicados en la model card muestran una mejora de chrF++ de 39,7189 a 40,8347 y de BLEU de 19,7572 a 21,6973 en el conjunto completo de 198 documentos WMT26, pero los intervalos de confianza pareados al 95% para las diferencias todavía incluyen cero, por lo que no se cumple la regla predeclarada de ganancia fiable en el test completo. El autor lo presenta explícitamente como un candidato de investigación, no como un sistema de traducción certificado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer denso Qwen2.5-3B-Instruct |
| Parametros totales | 3.000 millones (modelo base); adaptador LoRA r=64, alpha=128 (número exacto de parámetros del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del base Qwen2.5-3B-Instruct; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible; el ejemplo de carga reproduce una ruta FP32 y se advierte que la inferencia en menor precisión no es idéntica en puntuación |
| Idiomas soportados | inglés (en) e islandés (is) |
| Licencia | no disponible como licencia propia; metadatos de licencia del base: qwen-research (ver BASE_MODEL_LICENSE.md) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-3B-Instruct, un transformer decoder-only denso de 3.000 millones de parámetros. El delta LoRA utiliza rango r=64 y alpha=128, y se publica como pesos copiados sin reentrenamiento, merging ni cuantización. La configuración publicada emplea un ID y revisión de base portables, mientras que la configuración original se conserva por separado para reconstruir el paquete local exacto. El SHA256 del peso del adaptador es 40ee8312ead89272fd5e8190a3b8e1da91d5f0ff641721840600585ff4308c86.

El entrenamiento corresponde al experimento wmt26_shortmid_night_2026-11-23, con 240 actualizaciones en el brazo P25 y selección de checkpoint en el paso 120 según el conjunto de desarrollo. La técnica declarada es DAPO aplicada sobre un SFT original. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni detalles adicionales del pipeline de preferencias. Para continuar el entrenamiento debe adjuntarse el adaptador al mismo base fijado con is_trainable=True y crear un optimizador propio; el autor advierte que esto no equivale a reanudar exactamente el estado de optimizador/RNG.

## Capacidades

- Traducción automática inglés→islandés, tarea principal para la que se entrenó el adaptador.
- Generación de texto y razonamiento heredados del base Qwen2.5-3B-Instruct, aunque el autor no garantiza capacidades en otras lenguas o tareas.
- Seguimiento de instrucciones conversacionales (el base es Instruct), sujeto a la degradación que pueda introducir el adaptador.
- Carga para inferencia o para entrenamiento adicional de adaptadores sobre el mismo base fijado.
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Cobertura multilingüe limitada a inglés e islandés según los metadatos del repositorio.

## Casos de uso

- Traducción de documentación técnica EN→IS: el adaptador puede aplicarse sobre Qwen2.5-3B-Instruct para traducir manuales y notas de producto al islandés, aprovechando la ventana de contexto del base para párrafos largos; conviene validación humana por tratarse de un candidato de investigación.
- Localización de interfaces y cadenas de UI EN→IS: útil para equipos que necesitan borradores rápidos de traducción de textos cortos y medios, precisamente el subconjunto short/medium donde el autor reporta resultados exploratorios positivos.
- Investigación en traducción automática de bajos recursos: sirve como punto de partida reproducible para estudiar DAPO frente a SFT en pares de lenguas con pocos datos, dado que el adaptador y su SHA256 están documentados.
- Experimentación académica con PEFT: permite comparar configuraciones LoRA (r=64, alpha=128) sobre un mismo base fijado por revisión, facilitando ablaciones controladas en entornos de investigación.
- Generación de corpus sintéticos EN→IS: puede usarse para producir traducciones preliminares a granel que luego se filtren o postediten, siempre con revisión humana y sin asumir calidad de producción.
- Prototipado de pipelines de traducción en CI: al ser un adaptador ligero (0,5 GB) sobre un base de 3B, encaja en entornos de prueba donde se quiera iterar rápido antes de escalar a modelos mayores.

## Benchmarks y rendimiento

| Metrica | SFT original | Adaptador DAPO | Diferencia |
|---|---|---|---|
| chrF++ (198 docs WMT26) | 39,7189 | 40,8347 | +1,1158 |
| BLEU (198 docs WMT26) | 19,7572 | 21,6973 | +1,9401 |

Los intervalos de confianza pareados al 95% para las diferencias todavía incluyen cero y no se cumple la regla predeclarada de ganancia fiable en el test completo. El subconjunto secundario short/medium de 153 documentos es positivo pero exploratorio, mientras que el subconjunto all-short de 55 documentos no muestra ganancia fiable. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el ejemplo de carga reproduce una ruta FP32 y requiere memoria GPU suficiente, mientras que la inferencia en precisión reducida puede usar menos memoria pero no es idéntica en puntuación.
- GPU recomendadas: no especificadas en la información disponible; por tamaño del base (3B) cabría esperar GPUs de gama media-alta, pero no se confirma.
- Compatibilidad con GPU de consumo: no confirmada; depende de la precisión elegida y de la memoria disponible.
- Opciones de despliegue: carga mediante PEFT sobre el base fijado; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mtrl-qwen25-3b-en-is-dapo-shortmid-v1 | 3B (base) + LoRA r=64 | 32.768 (base) | Traducción EN→IS | qwen-research (base) | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32.768 | Instrucciones generales | qwen-research | Hugging Face |
| SFT original del proyecto mtrl | 3B (base) + LoRA | 32.768 (base) | Traducción EN→IS | no disponible | Uso interno del proyecto |

No se dispone de datos de otros adaptadores EN→IS comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar el base Qwen/Qwen2.5-3B-Instruct en la revisión exacta aa8e72537993ba99e69dfaafa59ed015b17504d1.
- Los resultados no alcanzan la regla predeclarada de ganancia fiable: los intervalos de confianza al 95% incluyen cero en el test completo.
- El subconjunto all-short (55 documentos) no muestra ganancia fiable; el short/medium (153 documentos) es solo exploratorio.
- No es un sistema de traducción certificado para producción; el autor lo declara explícitamente como candidato de investigación.
- No se garantizan capacidades en otras lenguas o tareas distintas de EN→IS.
- La licencia propia no está disponible; se heredan los metadatos qwen-research del base, lo que puede restringir el uso comercial.
- Riesgo de sesgos y alucinaciones inherente al base y no evaluado en la model card.
- La inferencia en precisión reducida no reproduce las puntuaciones del ejemplo FP32.
- El código del proyecto aún no está publicado en GitHub; no debe asumirse que los archivos locales ya estén disponibles allí.

## Enlaces

- Hugging Face: https://huggingface.co/huaq99/mtrl-qwen25-3b-en-is-dapo-shortmid-v1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio del proyecto: https://github.com/ETHz-DL-team29/mtrl
- No se han encontrado papers, blogs ni demos adicionales en la información disponible.
