# efebaykara/LFM3-1.7B-Base-Gundem-LoRA

## Resumen

LFM3-1.7B-Base-Gundem-LoRA es un adaptador LoRA publicado por el usuario efebaykara sobre el modelo base LiquidAI/LFM3-1.7B-Base, orientado exclusivamente a la clasificación de titulares de noticias en turco. No es un checkpoint completo ni un asistente conversacional general: requiere el modelo base fijado en una revisión concreta (`545fc8f4c7b5fa9f405105274cd29c4f8f44b526`) y devuelve una estructura de campos con temas, tipo de evento y tres puntuaciones enteras de impacto, gravedad y urgencia.

El adaptador se ha entrenado mediante destilación de respuestas (response distillation) usando respuestas generadas por DeepSeek como etiquetas para un ajuste supervisado solo en el turno del asistente. No se emplearon pesos ni logits de DeepSeek y el número de parámetros del estudiante no cambia. El conjunto de datos es pequeño y específico del dominio: 825 ejemplos de entrenamiento, 107 de validación y 101 de prueba.

Su relevancia es acotada pero clara para quien necesite un clasificador ligero de titulares turcos que quepa en dispositivos móviles o GPU de consumo. El repositorio incluye además un GGUF Q4_K_M independiente para llama.cpp y LM Studio, y un par de GGUF móviles (original y destilado) probados con un motor nativo propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer LiquidAI/LFM3-1.7B-Base |
| Parametros totales | 1.728.801.600 (modelo base fusionado; el adaptador LoRA añade un subconjunto no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la configuración de entrenamiento usa max_length=512) |
| Tipos de cuantizacion | GGUF Q4_K_M incluido; inferencia BF16 en CUDA y fp32 en CPU para el merge del adaptador |
| Idiomas soportados | turco (tr) |
| Licencia | LFM Open License v1.0 (lfm1.0), con condiciones de uso comercial; el código auxiliar Gündem es MIT |
| Formato de pesos | safetensors (adaptador PEFT), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LiquidAI/LFM3-1.7B-Base, un transformer de 1.700 millones de parámetros aproximadamente. El entrenamiento consistió en un ajuste supervisado solo sobre el turno del asistente, con respuestas generadas por DeepSeek como etiquetas (response distillation). La configuración declarada es: LoRA con r=16 y alpha=32, tres épocas, learning rate 0.0002, acumulación de gradiente 8, longitud máxima 512 y semilla 42. El conjunto contiene 825 ejemplos de entrenamiento, 107 de validación y 101 de prueba.

La innovación técnica principal no está en la arquitectura sino en el pipeline de empaquetado: el cargador incluido (`release_infer.py`) gestiona la compatibilidad de arquitectura, la plantilla exacta de la tarea, la revisión fijada del modelo base, la fusión del adaptador en fp32 sobre CPU y la inferencia en BF16 sobre CUDA. La generación no está restringida por una gramática JSON, de modo que la salida puede ser inválida (1 de 101 casos en la evaluación). El autor advierte que cargar el modelo base ejecuta código remoto propio del modelo, que debe revisarse antes de su uso.

## Capacidades

- Clasificación de titulares de noticias en turco en tres dimensiones: `etiketler` (temas), `tur` (tipo de evento) y `etki`, `ciddiyet`, `aciliyet` (puntuaciones enteras de 0 a 3).
- Generación de texto estructurado en formato de campos, sin gramática JSON forzada.
- Adaptación específica de dominio entrenada con etiquetas de un profesor (DeepSeek) sobre titulares turcos.
- Inferencia en CPU (fp32 para el merge) y GPU (BF16), además de despliegue en llama.cpp y LM Studio mediante el GGUF Q4_K_M.
- Versión móvil empaquetada en GGUF Q4_K_M, probada con el motor nativo Gündem.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.
- No es un asistente conversacional general: la model card lo indica explícitamente.

## Casos de uso

- Clasificación por lotes de titulares de prensa turca: el adaptador recibe únicamente el titular y el fichero `student-system.txt`, y devuelve temas, tipo de evento y puntuaciones de impacto, gravedad y urgencia; encaja en un pipeline ETL de un agregador de noticias.
- Etiquetado de urgencia en redacciones: la puntuación `aciliyet` (0-3) permite priorizar titulares en una cola de revisión editorial antes de publicar.
- Moderación y triaje de contenidos informativos: la combinación de `tur` y `ciddiyet` sirve para enrutar titulares hacia editores humanos según su gravedad estimada.
- Despliegue en dispositivo móvil: el GGUF Q4_K_M destilado (junto con el original) está pensado para el motor nativo Gündem, lo que permite clasificar titulares sin conexión en un teléfono.
- Integración en un CMS o sistema de alertas: el resultado contiene `prediction` o un `error` explícito, lo que facilita el manejo de fallos en producción sin gramática JSON.
- Experimentación académica con destilación de respuestas: el repositorio publica herramientas de entrenamiento y benchmark en GitHub, útil para reproducir el pipeline sobre otros dominios o idiomas.
- Prototipado rápido en local: el GGUF Q4_K_M funciona en llama.cpp y LM Studio sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---:|
| Gündem Score v1 | 78,1 / 100 |
| All-field exact match | 34,7 % |
| Topic micro-F1 | 89,4 % |
| Type accuracy | 85,1 % |
| Invalid outputs | 1 / 101 |

Condiciones declaradas: HF/CUDA BF16, decodificación greedy, batch=4, máximo 160 tokens nuevos, sin gramática JSON. La Gündem Score v1 se define como 30×topic F1 + 20×type accuracy + 30×(1−MAE medio de puntuaciones/3) + 20×exact match, sobre métricas fraccionarias. El autor advierte que mide la concordancia con las etiquetas del profesor en esta tarea concreta, no la inteligencia general del modelo, y que diferencias pequeñas en un test de una sola semilla no demuestran superioridad. El GGUF móvil no fue re-evaluado; la puntuación de 78,1 corresponde al adaptador HF en BF16. El modelo original sin ajustar obtiene 0,0 en la misma métrica.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 3,5 GB para los 1.700 millones de parámetros, más overhead de runtime.
- El merge del adaptador se realiza en CPU en fp32, por lo que se necesita RAM suficiente para el modelo base completo en fp32 (aproximadamente 7 GB).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para BF16 (RTX 3060, RTX 4060, RTX 4090, A100, H100). El modelo es sobradamente pequeño para GPU de centro de datos.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 6 GB o más; el GGUF Q4_K_M reduce aún más el requisito y permite ejecución en CPU.
- Opciones de despliegue: llama.cpp y LM Studio mediante el GGUF Q4_K_M; el adaptador PEFT con el cargador `release_infer.py` incluido; el autor no menciona vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; la evaluación usó batch=4 y un máximo de 160 tokens nuevos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-Base-Gundem-LoRA | 1,73 B (base) + LoRA | no disponible (entrenamiento a 512) | Clasificación de titulares turcos | LFM Open License v1.0 | Hugging Face + GGUF |
| LiquidAI/LFM3-1.7B-Base | 1,73 B | no disponible | Modelo base generalista | LFM Open License v1.0 | Hugging Face |
| Modelos de clasificación de noticias turcas | no disponible | no disponible | Clasificación supervisada | variable | variable |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable. El único punto de referencia interno es el modelo base original, que obtiene 0,0 en la Gündem Score v1 frente a 78,1 del adaptador destilado.

## Limitaciones y advertencias

- El conjunto de datos es pequeño (825/107/101 ejemplos) y específico del dominio; el autor recomienda inspeccionar las predicciones antes de confiar en ellas.
- No es un asistente conversacional general ni un checkpoint completo: requiere el modelo base fijado en la revisión indicada.
- La generación no está restringida por gramática JSON; se observó 1 salida inválida de 101 en la evaluación.
- El exact match de todos los campos es bajo (34,7 %), aunque las métricas por campo (topic F1 89,4 %, type accuracy 85,1 %) son razonables.
- La evaluación es de una sola semilla y sobre un test ya evaluado previamente; el autor advierte que diferencias pequeñas no demuestran superioridad y que el tamaño de batch y los cambios numéricos del runtime pueden afectar a las salidas.
- Los titulares en bruto, las respuestas del profesor y el conjunto de datos completo no se redistribuyen.
- La licencia LFM Open License v1.0 incluye condiciones de uso comercial que deben revisarse; la licencia del modelo es independiente de la licencia MIT del código auxiliar Gündem.
- Cargar el modelo base ejecuta código remoto propio del modelo; debe revisarse antes de su uso.
- Solo soporta turco; no hay capacidades multilingües declaradas.
- Riesgo de sesgo y alucinación: no se documentan análisis específicos en la información disponible, pero al ser un modelo destilado de un profesor y entrenado con titulares reales, puede heredar sesgos editoriales del corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/efebaykara/LFM3-1.7B-Base-Gundem-LoRA
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Herramientas de entrenamiento y benchmark: https://github.com/efebaykaraa/gundem-llms
- Modelos publicados: https://github.com/efebaykaraa/gundem-llms/releases/tag/models-v1.0.0
- GGUF Q4_K_M: `gguf/LFM3-1.7B-Base-Gundem-Q4_K_M.gguf` (dentro del repositorio)
- GGUF móvil original: `gguf/lfm3-base-original-Q4_K_M.gguf` (dentro del repositorio)
- GGUF móvil destilado: `gguf/lfm3-base-distilled-Q4_K_M.gguf` (dentro del repositorio)
- Ficheros de evaluación: `evaluation.json` y `release-manifest.json` (dentro del repositorio)
- Licencia: `LICENSE` (dentro del repositorio)
