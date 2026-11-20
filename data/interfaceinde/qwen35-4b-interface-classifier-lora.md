# interfaceinde/qwen35-4b-interface-classifier-LoRA

## Resumen

INTERFACE Qwen3.5-4B es un adaptador LoRA de clasificación de texto construido sobre el modelo base Qwen/Qwen3.5-4B, publicado por el usuario interfaceinde. No se distribuye como un modelo fusionado, sino como dos artefactos separados: una cuantización Q4_K_M del modelo base en formato GGUF y un adaptador LoRA nativo en F32 GGUF de aproximadamente 1,84 MB que contiene los 32 tensores aprendidos. El repositorio incluye además un manifiesto BEST.json que vincula el adaptador a la huella SHA256 exacta del modelo base y define la instrucción de clasificación junto con un esquema de respuesta de 20 campos.

El modelo resuelve una tarea concreta: la clasificación estructurada de correo electrónico. El adaptador se entrenó con QLoRA (rango 4, alpha 8, sobre las proyecciones q_proj y v_proj) y el mejor checkpoint fue el 500, con parada temprana en el paso 650. La precisión reportada del 92,88 % corresponde estrictamente al conjunto de desarrollo nativo del experimento, no a una evaluación del runtime cuantizado base+LoRA, que según el autor no se ha ejecutado.

Su relevancia es doble. Por un lado, ejemplifica un patrón de distribución eficiente para adaptadores: el modelo base se descarga una sola vez y las actualizaciones posteriores solo requieren el nuevo adaptador y el manifiesto. Por otro, conviene tratarlo con cautela: el repositorio tiene cero descargas y cero likes, la evaluación independiente está pendiente y la calidad general de generación o conversación no está establecida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer Qwen/Qwen3.5-4B (adaptador con 32 tensores aprendidos, q_proj/v_proj) |
| Parametros totales | 458.752 (según safetensors del adaptador); el modelo base Qwen3.5-4B no reporta cifra en la información disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 8192 tokens (valor recomendado de `--ctx-size` en llama-server) |
| Tipos de cuantizacion | Base en Q4_K_M (GGUF); adaptador en F32 (GGUF) |
| Idiomas soportados | no disponible (la etiqueta `ko` aparece en los tags, sin detalle adicional) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (base cuantizada y adaptador LoRA separados) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango aplicado sobre Qwen/Qwen3.5-4B, un transformer del que la información disponible no detalla capas, atención ni composición del corpus de preentrenamiento. El adaptador se entrenó con QLoRA con rango 4 y alpha 8, actualizando únicamente las proyecciones q_proj y v_proj, y contiene los 32 tensores aprendidos. El mejor checkpoint fue el 500, con parada temprana en el paso 650; el repositorio acompaña historiales de entrenamiento y validación del experimento nativo.

La innovación operativa está en el empaquetado: el modelo base se convirtió desde la revisión original de Qwen/Qwen3.5-4B sin fusionar los pesos aprendidos, usando el conversor b10969, y se cuantizó con el cuantizador b12556. El adaptador se exporta como GGUF F32 independiente y BEST.json lo vincula al SHA256 exacto del base, además de proporcionar la instrucción del clasificador y el esquema de 20 campos. El consumo se realiza con llama-server mediante `--model  --lora <adapter.gguf> --ctx-size 8192`; el autor indica que Ollama 0.34.3 no puede crear nuevos adaptadores LoRA y que debe usarse llama.cpp b12556.

## Capacidades

- Clasificación estructurada de correo: genera respuestas con un esquema de 20 campos definido en BEST.json.
- Clasificación de texto en general, según la pipeline declarada (`text-classification`).
- Ejecución local mediante llama.cpp con carga separada de base y adaptador LoRA.
- Actualización incremental: al mantener el mismo SHA256 del base, solo es necesario descargar el nuevo adaptador y el manifiesto.
- Generación de borradores asociada a la clasificación, sujeta a revisión humana según el propio autor.
- Tool calling, function calling, agentes, razonamiento multi-paso, visión, audio y modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; solo consta la etiqueta `ko` en los tags.

## Casos de uso

- Triaje de correo entrante: el adaptador clasifica cada mensaje en los 20 campos del esquema y permite enrutarlo a colas, departamentos o prioridades dentro de un flujo automatizado.
- Enriquecimiento de bandejas de soporte: con 8192 tokens de contexto se pueden procesar hilos de correo completos y extraer metadatos estructurados para el sistema de tickets.
- Clasificación por lotes en local: al ejecutarse con llama.cpp sobre GGUF Q4_K_M, el coste marginal por mensaje es bajo y no requiere enviar datos a servicios externos.
- Borradores de respuesta asistidos: el modelo genera un borrador a partir de la clasificación, que un operador revisa antes de enviarlo, tal como advierte el autor.
- Despliegue con actualizaciones frecuentes: al separar base y adaptador, un equipo puede mantener una única copia del base y sustituir solo el LoRA cuando se reentrene el clasificador.
- Evaluación de pipelines de clasificación: sirve como referencia para comparar un enfoque LoRA ligero frente a modelos de clasificación dedicados en tareas de correo estructurado.
- Prototipado de asistentes de correo con llama-server: la combinación de clasificación y generación de borradores permite montar una demo local sin infraestructura de GPU dedicada.

## Benchmarks y rendimiento

El autor reporta una precisión del 92,88 % en el campo de desarrollo nativo del experimento. No es una medición del runtime cuantizado base+LoRA, y no se ha realizado evaluación completa del runtime ni pruebas independientes.

| Metrica | Valor | Nota |
|---|---|---|
| Precisión en desarrollo (campo nativo) | 92,88 % | Conjunto de desarrollo del experimento nativo, no del runtime cuantizado |
| Evaluación del runtime base+LoRA | no disponible | No ejecutada según el autor |
| Pruebas independientes | no disponible | Pendientes |
| MMLU, HumanEval, GSM8K u otros | no disponible | No publicados en la información disponible |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 2,8 GB y el base está en Q4_K_M, por lo que el peso en memoria es moderado, pero no se publica una cifra de VRAM.
- GPU recomendadas: no disponible; el autor no especifica modelos de GPU.
- GPU de consumo: no confirmado; el tamaño del base en Q4_K_M sugiere que podría caber en GPUs de consumo con suficiente memoria, pero no hay dato verificado.
- Despliegue: llama-server de llama.cpp (versión b12556) con `--model  --lora <adapter.gguf> --ctx-size 8192`.
- Ollama: no soportado para crear nuevos adaptadores LoRA en la versión 0.34.3 según el autor.
- vLLM, TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| INTERFACE Qwen3.5-4B (este) | Adaptador de 458.752 parámetros sobre base Qwen3.5-4B | 8192 tokens | LoRA de clasificación de correo sobre base GGUF Q4_K_M | Apache 2.0 | Repositorio Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | No disponible en la información | No disponible | Modelo generalista | No disponible en la información | Hugging Face |
| Adaptadores LoRA de clasificación alternativos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- La precisión del 92,88 % corresponde al desarrollo nativo y no al runtime cuantizado base+LoRA; la evaluación completa del runtime no se ha ejecutado.
- No hay pruebas independientes publicadas; el repositorio registra cero descargas y cero likes.
- La calidad general de generación y conversación no está establecida; el adaptador está entrenado para clasificación estructurada de correo.
- Los borradores generados requieren revisión humana antes de su uso.
- El adaptador está vinculado a un SHA256 concreto del base: es obligatorio fijar un commit del repositorio para el manifiesto y ambos archivos, y verificar el SHA256 antes de la activación.
- Ollama 0.34.3 no puede crear nuevos adaptadores LoRA; se requiere llama.cpp b12556.
- Idiomas soportados no documentados; solo consta la etiqueta `ko`.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado; aplicable a la generación de borradores.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías de calidad del runtime.
- No se publican correos fuente, etiquetas por mensaje, estado del optimizador, rutas locales ni credenciales.

## Enlaces

- Hugging Face: https://huggingface.co/interfaceinde/qwen35-4b-interface-classifier-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Papers, blogs, repositorios o demos adicionales: no disponible en la información proporcionada.
