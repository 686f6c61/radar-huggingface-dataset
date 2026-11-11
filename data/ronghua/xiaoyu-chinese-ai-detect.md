# ronghua/xiaoyu-chinese-ai-detect

## Resumen

Xiaoyu Chinese AI Detect (晓语 · 中文 AI 检测) es un modelo de clasificación de texto en chino diseñado para discriminar entre texto generado por IA y texto escrito por humanos. Lo desarrolla el usuario de Hugging Face `ronghua` y se distribuye bajo licencia Apache 2.0. El modelo resuelve un problema concreto y creciente: la necesidad de detectar contenido sintético en chino, un idioma con menos herramientas de detección publicadas que el inglés.

La arquitectura es un transformer tipo BERT-base (RoBERTa chino) con 12 capas, dimensión oculta de 768 y un vocabulario de 21.128 tokens. Cuenta con 102.268.417 parámetros totales y una única salida logit que, tras aplicar `sigmoid`, produce la probabilidad de que el texto sea de origen artificial. La versión actual es la V3.3 y el repositorio ocupa 0,6 GB.

Su relevancia radica en el enfoque práctico: además de la probabilidad global del documento, ofrece un esquema de ventana deslizante para textos largos (ventanas de 500 caracteres con solapamiento de 100) y dos métodos de agregación (equiponderado y ponderado por longitud). El modelo está empaquetado en tres formatos de precisión (fp32, int8 e int4) con un formato de cuantización propio, no estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo BERT-base (RoBERTa chino), 12 capas, 768 hidden |
| Parámetros totales | 102.268.417 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (aproximadamente 600 caracteres chinos) |
| Tipos de cuantización | fp32, int8, int4 (formato propio de empaquetado, no GGUF/GPTQ/AWQ) |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp32), `.pt` empaquetado (int8/int4) |
| Vocabulario | 21.128 tokens |
| Tamaño del repositorio | 0,6 GB |
| Tarea | Clasificación de texto (detección de texto generado por IA) |

## Arquitectura y entrenamiento

El modelo se basa en un transformer encoder tipo BERT-base con configuración de RoBERTa chino: 12 capas, 768 dimensiones ocultas y un vocabulario de 21.128 tokens. La cabeza de clasificación emite un único logit que, tras la función `sigmoid`, se interpreta como la probabilidad de que el texto haya sido generado por IA. No se trata de un modelo generativo, sino de un clasificador binario.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un clasificador de este tipo). El autor indica que las métricas de precisión provienen de un conjunto de prueba interno mixto (texto humano más texto generado por IA de múltiples fuentes) cuya composición y tamaño no se publican ni se distribuyen con el repositorio, por lo que no son reproducibles de forma independiente. La innovación técnica destacable es el esquema de agregación por ventanas deslizantes para superar el límite de 512 tokens, con dos modos de fusión (equiponderado y ponderado por longitud) y una implementación de referencia incluida en la model card.

## Capacidades

- Clasificación binaria de texto chino como generado por IA o escrito por humano, con salida de probabilidad calibrada en tres umbrales (≥90 % AI特征明显, 50-90 % 疑似AI参与, <50 % AI特征不明显).
- Procesamiento de documentos largos mediante ventana deslizante de 500 caracteres con paso de 400 y solapamiento de 100, con dos métodos de agregación (`eq` equiponderado y `len` ponderado por longitud).
- Generación de probabilidad por oración (句头概率) como señal auxiliar de contexto, no como localizador de fragmentos generados.
- Soporte de cuantización a int8 e int4 con scripts de empaquetado y despaquetado propios (`pack_quant.py`).
- No soporta tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso; es exclusivamente un clasificador.
- Capacidad monolingüe: solo chino.

## Casos de uso

- Moderación de contenido en plataformas editoriales chinas: integrado como filtro previo a revisión humana, el modelo permite clasificar artículos, comentarios o envíos de usuarios en tres niveles de sospecha, derivando solo los casos en la banda 50-90 % a revisión manual.
- Verificación de originalidad en entornos académicos: para detectar posibles trabajos generados por IA en chino, aplicando la agregación por ventanas para cubrir ensayos de varios miles de caracteres y reportando el resultado como «sospecha» en lugar de acusación directa.
- Control de calidad en generación de contenido asistida: empresas que producen textos con LLM en chino pueden usar el modelo para auditar lotes y detectar contenido que se desvía del estilo esperado o que fue generado íntegramente por máquina cuando debería ser revisado por humanos.
- Detección en pipelines de ingestión de datos: filtrar corpus web en chino para separar texto humano de texto sintético antes de usarlo en el entrenamiento de otros modelos, reduciendo la contaminación por contenido autogenerado.
- Análisis forense de comunicaciones: en investigaciones sobre campañas de desinformación o spam automatizado en chino, el modelo aporta una señal cuantitativa sobre el grado de automatización del texto, siempre como indicio y no como prueba.
- Monitorización de foros y redes sociales: clasificación por lotes de publicaciones con umbral ajustable según la tolerancia a falsos positivos del cliente, usando el modo `len` con umbral recalibrado a ~0,68 para minimizar acusaciones erróneas a usuarios reales.

## Benchmarks y rendimiento

El autor publica métricas de un conjunto de prueba interno mixto, no reproducible de forma independiente. Se presentan tal cual, con la advertencia de que son «registros de calibración del autor»:

| Agregación | Falsos positivos sobre texto humano | Detección de texto IA | Falsos positivos con detección al 99 % |
|---|---|---|---|
| `eq` equiponderado | 1,36 % | 99,47 % | 1,18 % |
| `len` ponderado por longitud | 1,52 % | 99,45 % | 0,78 % |

Las dos primeras columnas usan un umbral de 0,50 (banda «疑似AI参与» o superior). Para igualar la detección al 99 %, el modo `eq` requiere bajar el umbral a ~0,52 y el modo `len` a ~0,68. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es generativo ni evaluable en esas tareas. El único dato reproducible dentro del repositorio es `quant/bench_readout.json`, que documenta la consistencia entre las versiones cuantizadas y fp32.

## Requisitos de hardware

- VRAM estimada para fp32: ~0,4 GB de pesos más activaciones; cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- VRAM estimada para int8: ~0,1 GB de pesos; ejecutable en CPU sin problemas.
- VRAM estimada para int4: ~0,06 GB de pesos; apto para dispositivos de borde y CPU.
- GPU recomendadas: no requiere GPU dedicada; una RTX 3060, RTX 4090, A100 o H100 funcionan, pero el modelo es lo bastante pequeño para inferencia en CPU con latencia aceptable.
- Cabe en cualquier GPU consumer (GTX 1050 en adelante) e incluso en Raspberry Pi con la versión int4.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` (fp32); los formatos int8/int4 requieren ejecutar el script de despaquetado del repositorio antes de cargar el `state_dict`. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo ni usa formatos estándar de cuantización.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño (102 M de parámetros), se espera un throughput alto en GPU y moderado en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xiaoyu-chinese-ai-detect | 102 M | 512 tokens | zh | Apache 2.0 | Hugging Face |
| Modelos de detección de IA en inglés (p. ej. OpenAI detector, GPTZero) | no disponible | variable | en | propietaria / no abierta | API cerrada |
| Detectores multilingües basados en XLM-R | ~278 M (base) | 512 tokens | multilingüe | variable | Hugging Face |

No se dispone de información sobre modelos comparables específicos para chino con pesos abiertos en la información proporcionada. La comparación con detectores comerciales en inglés no es directa por diferencia de idioma y de disponibilidad de pesos.

## Limitaciones y advertencias

- El modelo solo procesa chino; no es aplicable a otros idiomas.
- Límite duro de 512 tokens por ventana; los documentos largos requieren el esquema de agregación del repositorio, y comparar probabilidades entre modos `eq` y `len` no es válido porque las escalas difieren.
- Las métricas de precisión publicadas provienen de un conjunto interno no reproducible; el autor recomienda recalibrar los umbrales sobre el corpus propio antes de usarlo en producción.
- La probabilidad por oración no sirve para localizar fragmentos generados; ordenar oraciones por esa puntuación es prácticamente aleatorio en textos largos.
- Riesgo de falsos positivos sobre texto humano: incluso en el mejor modo, en torno al 1 % del texto humano se clasifica como sospechoso con el umbral por defecto; con umbrales más estrictos el riesgo persiste.
- El modelo puede ser evadido por texto generado por IA sometido a paráfrasis o edición humana; no se han publicado evaluaciones de robustez frente a adversarial attacks.
- Los formatos int8 e int4 usan un empaquetado propio no estándar; requieren código específico del repositorio y no son portables a otras herramientas de inferencia. El modo int4 desplaza las probabilidades en muestras límite.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos al de calibración.
- El modelo tiene 48 descargas y 0 likes en el momento de la consulta; es un proyecto de autor individual sin validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronghua/xiaoyu-chinese-ai-detect
- Repositorio del autor en ModelScope (referenciado en la model card): `fuyi163/xiaoyu-chinese-ai-detect`
- Script de cuantización incluido en el repositorio: `pack_quant.py`
- Lecturas de calibración de cuantización: `quant/bench_readout.json` (dentro del repositorio)
