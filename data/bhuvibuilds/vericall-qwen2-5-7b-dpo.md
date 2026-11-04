# BhuviBuilds/vericall-qwen2.5-7b-dpo

## Resumen

VeriCall-Qwen2.5-7B-DPO es un ajuste fino del modelo Qwen2.5-7B-Instruct desarrollado por BhuviBuilds dentro del marco VeriCall, un framework de post-entrenamiento verificado por ejecución orientado a la generación de llamadas a herramientas (tool calling) conformes a esquema. El objetivo del modelo es producir argumentos de funciones válidos y ejecutables, eliminando alucinaciones de parámetros y respetando contratos de tipo complejos (objetos anidados recursivos, enums, dependencias entre campos) que las gramáticas restringidas (CFG) no pueden verificar semánticamente.

La metodología combina un sandbox de ejecución con validación Pydantic V2, minería de pares DPO por "near-miss" (3.200 pares filtrados) y entrenamiento DPO con proyección de logits recortada a la completación, lo que reduce el uso de memoria del entrenador de 1,83 GB a 18 MB y permite entrenar en una única GPU T4 de 16 GB con un pico de VRAM de 6,8 GB. El modelo se distribuye como adaptador DPO sobre la base Qwen2.5-7B-Instruct.

La relevancia actual del modelo reside en su enfoque de evaluación: mide la tasa de ejecución correcta frente a 24 endpoints REST no vistos y reporta mejoras estadísticamente significativas (86,4% frente a 77,6% de SFT y 54,2% del modelo base) y un 82,5% en el subconjunto Multiple-Function AST del BFCL, con cero contaminación declarada. Es un caso de estudio útil para quienes construyen agentes con tool calling en producción y necesitan garantías de validez de esquema más allá de la sintaxis JSON.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-7B-Instruct) con ajuste DPO |
| Parametros totales | 7.000 millones (aproximado, heredado de Qwen2.5-7B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen2.5-7B-Instruct, no confirmada) |
| Tipos de cuantizacion | 4-bit NF4 (usada en evaluacion); AWQ (usada en serving con vLLM) |
| Idiomas soportados | No disponible |
| Licencia | No disponible en la model card (el repositorio del framework VeriCall se declara MIT) |
| Formato de pesos | No disponible (adaptador DPO sobre Qwen2.5-7B-Instruct; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso de aproximadamente 7.000 millones de parámetros. Sobre esa base se aplica un pipeline de post-entrenamiento en tres fases: primero un QLoRA SFT con particionado de dominio, después una minería de pares de preferencia DPO generada por un bucle de retroalimentación de ejecución (la completación del modelo se valida contra un sandbox Pydantic V2; los aciertos se etiquetan como "chosen" y los fallos de validación o "near-miss" como "rejected"), y finalmente el entrenamiento DPO sobre 3.200 pares filtrados. El sandbox cubre 60 endpoints en total: 36 de entrenamiento (finanzas, e-commerce, CRM) y 24 retenidos no vistos (infraestructura cloud, viajes, logística, monitorización).

La innovación técnica destacable es la proyección de logits recortada a la completación (*completion-sliced logit projection*), que evita la asignación de tensores de logits de secuencia completa en float32 (más de 14,5 GB de VRAM) y reduce la memoria de logits de 1,83 GB a 18 MB, permitiendo DPO en una T4 de 16 GB. El autor reporta además un ablation con GRPO sobre Qwen2.5-1.5B-Instruct (G=8 rollouts, coeficiente de penalización KL β=0,04, learning rate 1e-5, recompensa binaria de validación de ejecución), que eleva la tasa de acierto en APIs no vistas del 61,6% al 74,8%. No se detalla la composición exacta del dataset de SFT ni el número de tokens de entrenamiento.

## Capacidades

- Generación de llamadas a herramientas conformes a esquema OpenAPI, con selección discriminativa entre múltiples esquemas candidatos (6 por prompt en la evaluación).
- Validación semántica de argumentos: parámetros condicionales requeridos, objetos anidados recursivos, patrones regex, dependencias entre campos y enums de dominio.
- Reducción de alucinación de parámetros (-67% frente a SFT en la evaluación reportada).
- Tool calling con salida JSON cruda (el harness de evaluación usa JSON raw, no la plantilla nativa `<tool_call>` de Qwen).
- Razonamiento multi-paso orientado a la selección de endpoint y construcción de argumentos.
- Capacidades generales de Qwen2.5-7B-Instruct (texto, código, matemáticas) presumiblemente preservadas, aunque no se reportan evaluaciones específicas en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Atención al cliente automatizada con backends de CRM y e-commerce: el modelo selecciona el endpoint correcto entre varios candidatos y construye argumentos válidos contra el esquema, reduciendo errores de tipo que romperían la llamada en producción.
- Orquestación de agentes en infraestructura cloud: con endpoints de aprovisionamiento y monitorización, el modelo genera payloads que pasan validación Pydantic antes de ejecutarse, lo que permite encadenar acciones multi-paso con verificación previa.
- Reservas de viaje y logística: los esquemas de estos dominios incluyen campos condicionales y objetos anidados; el ajuste DPO específico reduce los fallos por parámetros faltantes o mal tipados en APIs no vistas durante el entrenamiento.
- Integración en pipelines de CI/CD para validación de contratos de API: el modelo puede usarse como generador de llamadas de prueba que se validan contra el esquema OpenAPI del servicio, detectando desalineaciones entre documentación e implementación.
- Serving de baja latencia con vLLM y cuantización AWQ: el autor reporta 640 ms de latencia p50 y 14 req/s en una T4, adecuado para asistentes internos con volumen moderado.
- Investigación en post-entrenamiento verificado: el repositorio VeriCall sirve como referencia reproducible para aplicar DPO con recompensa de ejecución y para estudiar la brecha entre validez sintáctica (CFG) y validez semántica.
- Generación de clientes SDK y mocks: a partir de un esquema OpenAPI, el modelo puede producir invocaciones de ejemplo ejecutables que alimentan tests de integración.

## Benchmarks y rendimiento

Evaluación sobre M=500 peticiones de usuario contra 24 endpoints REST no vistos (4 APIs), con 6 esquemas candidatos por prompt:

| Metodo / Configuracion | Tasa de exito en no vistos (M=500) | IC bootstrap 95% | JSON invalido | Endpoint erroneo | Argumento faltante | Argumento alucinado | Error de tipo |
|---|---:|---:|---:|---:|---:|---:|---:|
| Base (Qwen2.5-7B-Instruct, 4-bit NF4) | 54,2% (271/500) | [49,8%, 58,6%] | 0 | 25 | 35 | 115 | 54 |
| Base + decodificacion restringida (grammar-guided) | 68,4% (342/500) | [64,2%, 72,4%] | 0 | 18 | 22 | 84 | 34 |
| QLoRA SFT (particionado por dominio) | 77,6% (388/500) | [73,8%, 81,2%] | 0 | 12 | 16 | 58 | 26 |
| VeriCall (QLoRA SFT + DPO) | 86,4% (432/500) | [83,2%, 89,4%] | 0 | 11 | 15 | 19 | 23 |

Benchmark externo BFCL Multiple-Function AST (N=200, sin contaminacion declarada):

| Configuracion | Precision AST BFCL (N=200) | Aprobados / Total | Mejora relativa vs. base |
|---|---:|---:|---:|
| Base (Qwen2.5-7B-Instruct) | 69,5% | 139/200 | línea base |
| QLoRA SFT | 76,0% | 152/200 | +9,4% |
| VeriCall (SFT + DPO) | 82,5% | 165/200 | +18,7% |

Ablation de RL online con GRPO sobre Qwen2.5-1.5B-Instruct (M=500, APIs no vistas):

| Modelo / etapa | Tasa de exito | Aprobados / Total | Ganancia neta |
|---|---:|---:|---:|
| Qwen2.5-1.5B-Instruct SFT | 61,6% | 308/500 | línea base |
| Qwen2.5-1.5B-Instruct GRPO (G=8, β=0,04) | 74,8% | 374/500 | +13,2% |

El autor reporta significancia estadística con prueba de McNemar emparejada (p < 0,001) frente al baseline SFT y un IC de Wilson del 95% de [83,1%, 89,1%] para la tasa de ejecución. No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM de entrenamiento: pico de 6,8 GB en una T4 de 16 GB con el entrenador DPO de logits recortados; el DPOTrainer estándar de TRL supera los 14,5 GB y provoca OOM en esa GPU.
- VRAM de inferencia: no se detalla explícitamente; en 4-bit NF4 y AWQ el modelo de 7B debería ocupar del orden de 4-6 GB de pesos, aunque la cifra exacta no está en la información proporcionada.
- GPU recomendadas: T4 de 16 GB para entrenamiento y serving según las telemetrías del autor; A100, H100 o RTX 4090 no se mencionan en la documentación.
- Cabe en GPU de consumo: previsiblemente sí en RTX 3060 12 GB, RTX 4070 y superiores con cuantización de 4 bits, aunque no se confirma en la información disponible.
- Despliegue: vLLM con cuantización AWQ es la opción reportada (86,0% de precisión, 640 ms p50, 14 req/s en T4). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 640 ms de latencia p50 y 14 peticiones por segundo en una única T4 con vLLM AWQ.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VeriCall-Qwen2.5-7B-DPO | ~7B | no disponible | DPO verificado por ejecución sobre Qwen2.5 | no disponible | HuggingFace (0 descargas) |
| Qwen2.5-7B-Instruct | ~7B | no disponible | Instruct generalista con tool calling nativo | Apache 2.0 (habitual en Qwen2.5) | Amplia |
| Qwen2.5-1.5B-Instruct + GRPO (ablation VeriCall) | ~1,5B | no disponible | RL online con recompensa de ejecución | no disponible | Referencia interna del paper |
| QLoRA SFT (particionado por dominio) | ~7B | no disponible | SFT supervisado sin DPO | no disponible | Baseline del estudio |

La comparativa se limita a los modelos evaluados en la propia model card; no se dispone de datos de otros modelos especializados en tool calling (por ejemplo, variantes de Hermes o ToolACE) en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está declarada en la model card; el repositorio del framework se declara MIT, pero eso no garantiza los términos del modelo publicado. Verificar antes de uso comercial.
- El modelo se distribuye como adaptador DPO sobre Qwen2.5-7B-Instruct; hereda las limitaciones, sesgos y términos de la base, no documentados aquí.
- Los benchmarks se han generado con un harness de JSON crudo y 4-bit NF4, no con la plantilla nativa `<tool_call>` de Qwen; el rendimiento en producción con la plantilla nativa puede diferir.
- El conjunto de evaluación son 24 endpoints de 4 APIs; la generalización a esquemas OpenAPI muy distintos (por ejemplo, con oneOf/anyOf complejos o validaciones asíncronas) no está medida.
- Riesgo de alucinación persistente: 19 de 500 peticiones aún contienen argumentos alucinados y 23 presentan errores de tipo tras el ajuste.
- No hay información sobre idiomas soportados, longitud de contexto efectiva ni evaluación de capacidades generales (razonamiento, código, matemáticas) tras el DPO; el ajuste podría degradar habilidades no relacionadas con tool calling.
- El modelo tiene 0 descargas y 1 like en HuggingFace en el momento de la ficha; no hay validación independiente de los resultados reportados por el autor.
- La fecha de creación del repositorio (2026-11-04) es posterior a la fecha actual de redacción; tratar los metadatos con cautela.

## Enlaces

- HuggingFace: https://huggingface.co/BhuviBuilds/vericall-qwen2.5-7b-dpo
- Repositorio del framework VeriCall: https://github.com/bhuvneshsahu01/vericall
- CI del proyecto: https://github.com/bhuvneshsahu01/vericall/actions/workflows/ci.yml
- Referencia alternativa del modelo en la model card: https://huggingface.co/bhuvneshsahu01/vericall-qwen2.5-7b-dpo
- Licencia MIT del framework: https://opensource.org/licenses/MIT
- Python 3.11+: https://www.python.org/downloads/
