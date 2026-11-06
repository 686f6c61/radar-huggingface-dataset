# macmacmacmac/SecJev-4B

## Resumen

SecJev-4B es un modelo de decisión especializado en seguridad que no genera texto libre, sino que devuelve distribuciones de probabilidad sobre un conjunto cerrado de respuestas candidatas (juicios booleanos, elecciones entre opciones y valoraciones ordenadas) a partir de evidencia de seguridad y políticas explícitas. Lo desarrolla el proyecto SecJev (UESTC1010) y esta ficha corresponde a un mirror no modificado del release upstream v1.2.0 publicado por el usuario macmacmacmac en Hugging Face. El modelo se construye sobre el backbone Qwen3.5-4B-Base mediante un adaptador LoRA y una cabeza de decisión de 256 dimensiones.

La relevancia del modelo reside en su enfoque: en lugar de pedir a un LLM que "razone" y escriba una respuesta sobre si una acción es segura, se formula como una tarea de clasificación calibrada sobre evidencia estructurada. Esto permite integrarlo en pipelines de defensa de agentes (el proyecto jev-stageA lo usa junto al checkpoint Action-Monitor-C1) donde se necesita una señal probabilística auditable y no una generación textual potencialmente alucinada.

El checkpoint se distribuye como adaptador LoRA más cabeza de decisión, tokenizer, código de calibración e inferencia; el backbone Qwen3.5-4B-Base debe descargarse por separado mediante el script de bootstrap incluido. El repositorio ocupa 0,2 GB, lo que confirma que no contiene los pesos completos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-4B-Base) con adaptador LoRA y cabeza de decisión de 256 dimensiones |
| Parametros totales | 4B (backbone Qwen3.5-4B-Base); el adaptador LoRA y la cabeza se distribuyen aparte |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; el backbone se descarga por separado) |
| Idiomas soportados | en (inglés) |
| Licencia | secjev-use-and-distribution-agreement-v1.0 (license: other) |
| Formato de pesos | safetensors (adaptador LoRA + cabeza de decisión); backbone en formato nativo de Qwen |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer decoder-only de 4B parámetros, y le aplica un adaptador LoRA con r=16 y alpha=32 sobre las capas de atención, MLP y DeltaNet, además de una cabeza de decisión de 256 dimensiones que proyecta el estado oculto a una distribución sobre las respuestas candidatas. El entrenamiento se realizó sobre SecJev-Corpus v1.0.0 (170.185 preguntas de ocho fuentes y 14 tareas, divididas en 118.818 de entrenamiento, 14.821 de calibración, 14.912 de desarrollo y 21.634 de test) durante tres épocas, con maestros en FP32 y autocast BF16, empleando nueve GPU RTX 3090. La época 3 fue seleccionada mediante validación completa en desarrollo.

La innovación técnica principal es el tratamiento del problema como clasificación calibrada: el modelo no genera texto, sino que devuelve probabilidades sobre opciones predefinidas, con una temperatura de calibración ajustada únicamente sobre el conjunto de calibración (T = 1,3349681034). El repositorio incluye código de inferencia, calibración y bootstrap, así como registros de procedencia (provenance.json) y configuración de entrenamiento (security-training-config.json). No se menciona uso de RLHF ni DPO.

## Capacidades

- Evaluación de evidencia de seguridad: emite juicios booleanos (aceptar/rechazar), elecciones entre opciones y valoraciones ordenadas a partir de evidencia y políticas explícitas.
- Salida probabilística calibrada: devuelve distribuciones de probabilidad sobre respuestas candidatas, no texto generado.
- Soporte de 14 tareas de seguridad distintas agrupadas en el corpus SecJev-Corpus.
- Integración en pipelines de defensa de agentes (proyecto jev-stageA), junto al checkpoint Action-Monitor-C1.
- Capacidades multilingües: limitadas al inglés según la model card.
- No dispone de tool calling, function calling ni modo de razonamiento extendido documentado.
- No se documentan capacidades de visión, audio ni generación de código.

## Casos de uso

- Defensa de agentes LLM: el modelo actúa como monitor de acciones en un pipeline de agente, evaluando cada acción propuesta contra una política y devolviendo una probabilidad de rechazo o aceptación; encaja por su salida calibrada y su integración con jev-stageA.
- Moderación de contenido con políticas explícitas: dado un fragmento de evidencia y una política, el modelo clasifica si cumple o no, útil en sistemas de revisión donde se requiere una señal probabilística auditable en lugar de una justificación textual.
- Triaje de alertas de seguridad: ordenar o clasificar alertas según su gravedad mediante las tareas de valoración ordenada del corpus, reduciendo la carga de revisión manual.
- Evaluación de cumplimiento normativo: comprobar si una configuración o registro cumple una política definida, usando la formulación de juicio booleano.
- Investigación en seguridad de IA: banco de pruebas reproducible con corpus, splits y código de entrenamiento publicados para comparar estrategias de defensa.
- Filtrado previo en pipelines de datos: clasificar muestras como seguras o no antes de incorporarlas a un conjunto de entrenamiento, aprovechando la salida probabilística para fijar umbrales.
- Validación de decisiones en sistemas de control: usar la distribución de probabilidad como señal de confianza para derivar a revisión humana los casos de baja certeza.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| Precisión micro (todas las preguntas de test de seguridad) | 88,01% |
| Precisión macro por tarea | 94,51% |
| Precisión macro balanceada por tarea | 92,42% |
| Kev decision-v7 (suites limpias originales) | 86,58% |
| Kev transfer-v4 (suites limpias originales) | 83,84% |

El autor advierte que las tareas de vehículos siguen siendo más débiles y que los splits de investigación fueron inspeccionados durante la construcción del corpus, por lo que no constituyen un benchmark ciego de despliegue. Los seis casos cortos de desarrollo incluidos solo verifican la paridad de exportación, no la precisión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un backbone de 4B en BF16 se requieren aproximadamente 8-9 GB solo para pesos, más overhead de activaciones y cabeza de decisión.
- GPU recomendadas: el entrenamiento se realizó en nueve RTX 3090; para inferencia, una RTX 3090 o superior (A100, H100) es suficiente.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 y tarjetas con 12 GB o más en cuantización de 8 bits; en 4 bits podría caber en 8 GB, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: el repositorio incluye infer.py con soporte para CUDA; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo estándar estas herramientas no son directamente aplicables.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SecJev-4B | 4B (backbone) + LoRA | no disponible | Clasificación calibrada de seguridad | SecJev Use and Distribution Agreement v1.0 | Hugging Face (mirror) |
| Qwen3.5-4B-Base | 4B | no disponible | LLM generativo base | según Qwen | Hugging Face |
| Kev-4B (upstream) | 4B | no disponible | Modelo de decisión de seguridad original | según proyecto Kev | no disponible en la información |
| Action-Monitor-C1 | no disponible | no disponible | Monitor de acciones complementario | SecJev Use and Distribution Agreement v1.0 | Hugging Face (mirror) |

No se dispone de datos de benchmarks comparativos con otras alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto: solo devuelve probabilidades sobre respuestas candidatas predefinidas; no sirve para tareas generativas.
- Idiomas: únicamente inglés; no se documenta soporte multilingüe.
- Las tareas de vehículos presentan rendimiento más débil según el autor.
- Los splits de investigación fueron inspeccionados durante la construcción del corpus; los resultados no equivalen a un benchmark ciego.
- Riesgo de sesgo y alucinación: no evaluado en la información disponible; al ser una clasificación calibrada, el riesgo de alucinación textual es bajo, pero puede haber sesgos en el corpus de entrenamiento.
- Licencia restrictiva: SecJev Use and Distribution Agreement v1.0, no Apache-2.0; el uso comercial requiere revisar los términos del acuerdo y los términos upstream de Qwen.
- Es un mirror no oficial: el autor original es el proyecto SecJev (UESTC1010); conviene citar el proyecto upstream.
- Requiere descargar el backbone Qwen3.5-4B-Base por separado mediante el script de bootstrap; el repositorio no contiene los pesos completos.
- Longitud de contexto no documentada, lo que limita la planificación de despliegues con evidencia extensa.

## Enlaces

- Hugging Face (mirror): https://huggingface.co/macmacmacmac/SecJev-4B
- Checkpoint complementario Action-Monitor-C1: https://huggingface.co/macmacmacmac/SecJev-4B-Action-Monitor-C1
- Repositorio upstream SecJev: https://github.com/UESTC1010/SecJev
- Release upstream v1.2.0: https://github.com/UESTC1010/SecJev/releases/tag/v1.2.0
- Corpus SecJev-Corpus v1.0.0: https://github.com/UESTC1010/SecJev/releases/download/v1.0.0/SecJev-Corpus-v1.0.0.tar.gz
- Código de entrenamiento: https://github.com/UESTC1010/SecJev/tree/main/training/secjev4b
- Evaluaciones JEV agent-defense (jev-stageA): https://github.com/maceip/jev-stagea
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
