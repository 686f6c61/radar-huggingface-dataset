# reaperdoesntknow/DNA-50M

## Resumen

DNA-50M es un modelo de generación de texto publicado en Hugging Face por el usuario reaperdoesntknow bajo el paraguas de Convergent Intelligence LLC: Research Division. Según los metadatos del repositorio, se trata de un transformer de tipo Liquid-Former con aproximadamente 50 millones de parámetros, empaquetado para la librería transformers y compatible con endpoints de inferencia estándar. El repositorio ocupa 0,2 GB y acumula 1245 descargas desde su creación en octubre de 2025.

La relevancia del modelo no reside en su rendimiento —no hay benchmarks publicados— sino en el marco teórico que lo acompaña: el autor lo presenta como parte del framework Discrepancy Calculus (DISC), una aproximación de teoría de la medida al estudio de las discrepancias entre la salida esperada y la observada durante el entrenamiento. Conceptos como el operador de discrepancia, los conjuntos de salto o el ghost imprinting se describen en documentos asociados del mismo autor.

La model card es prácticamente una plantilla sin rellenar: no especifica datos de entrenamiento, idiomas, licencia, contexto ni hiperparámetros. Cualquier evaluación seria del modelo requiere consultar los documentos teóricos enlazados y, en su defecto, realizar una validación empírica propia antes de considerarlo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Liquid-Former (transformer, según tags del repo) |
| Parametros totales | ~50M (deducido del nombre y del tamaño del repo, 0,2 GB) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en el repo compatibles con transformers; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible explícitamente; el repo es compatible con transformers (presumiblemente safetensors o PyTorch binario) |

## Arquitectura y entrenamiento

El tag `liquid-former` sugiere una variante de transformer inspirada en las redes neuronales líquidas (Liquid Neural Networks), aunque no se aporta detalle sobre la implementación concreta: ni número de capas, ni dimensión oculta, ni mecanismo de atención. El tamaño de 50M parámetros y el repo de 0,2 GB son coherentes con un modelo pequeño orientado a experimentación más que a producción.

No hay información sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card incluye secciones vacías con marcadores `[More Information Needed]` en todos los apartados técnicos (datos, hiperparámetros, evaluación, infraestructura). El único contenido sustantivo es la sección "Discrepancy Calculus Foundation", que describe el marco teórico del autor (operador de discrepancia, conjuntos de salto, ghost imprinting) y enlaza a documentos separados con DOIs, pero no aporta detalles verificables sobre el entrenamiento de este checkpoint concreto.

## Capacidades

- Generación de texto autoregresiva (pipeline `text-generation` declarado en los metadatos).
- Compatibilidad con la librería transformers y con endpoints de inferencia estándar (`endpoints_compatible` en los tags).
- Integración potencial con el ecosistema Convergent Intelligence (tag `convergentintel`), sin documentación pública sobre qué implica.
- No se documentan capacidades de razonamiento, código, matemáticas, visión, audio, tool calling, function calling, agentes ni modo de pensamiento.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Experimentación académica con arquitecturas tipo Liquid-Former: el modelo sirve como banco de pruebas a pequeña escala (50M parámetros) para investigar dinámicas de atención líquida sin requerir hardware dedicado.
- Reproducción de los experimentos del framework Discrepancy Calculus: útil para investigadores que quieran validar empíricamente las afirmaciones teóricas del autor sobre operadores de discrepancia y conjuntos de salto.
- Fine-tuning para tareas de generación de texto acotadas: con 50M parámetros, el ajuste fino cabe en una única GPU consumer y permite iterar rápido sobre dominios específicos (clasificación de texto, generación de plantillas, etc.).
- Prototipado de pipelines de inferencia: al ser compatible con transformers y endpoints, sirve para validar infraestructura (servidores, colas, monitorización) antes de migrar a modelos mayores.
- Docencia y formación: modelo lo bastante pequeño para ejecutarse en portátiles y explicar el ciclo completo de carga, tokenización e inferencia en cursos de NLP.
- Comparativas de eficiencia: como baseline de bajo coste para medir latencia y throughput frente a modelos mayores en la misma infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp16 (50M parámetros ≈ 100 MB de pesos) y en torno a 200-400 MB en fp32, más overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también funciona en CPU con latencia aceptable para uso interactivo.
- Cabe holgadamente en GPU consumer, incluidas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (nativo), endpoints de Hugging Face (tag `endpoints_compatible`); vLLM, llama.cpp, Ollama o TGI no están confirmados por falta de pesos en formatos compatibles (GGUF) o de documentación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| DNA-50M | ~50M | no disponible | no disponible | Hugging Face | Liquid-Former, sin benchmarks |
| GPT-2 small | 124M | 1024 | MIT | Hugging Face | Transformer clásico, ampliamente evaluado |
| DistilGPT-2 | 82M | 1024 | Apache 2.0 | Hugging Face | Destilado de GPT-2, benchmarks públicos |
| TinyLlama-1.1B | 1,1B | 2048 | Apache 2.0 | Hugging Face | Mayor tamaño, pero con evaluación publicada |

La comparación es desigual porque DNA-50M carece de datos públicos de rendimiento, contexto y licencia. Frente a GPT-2 small o DistilGPT-2, la única ventaja demostrable es el menor número de parámetros; no hay evidencia de que la arquitectura Liquid-Former aporte mejoras medibles.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no hay información sobre datos, sesgos, evaluación ni uso previsto.
- Licencia no especificada: riesgo legal para uso comercial; conviene contactar con el autor antes de integrarlo en productos.
- Sin benchmarks publicados: imposible estimar calidad, alucinación o rendimiento relativo frente a alternativas.
- Idiomas no documentados: no se puede asumir soporte multilingüe ni siquiera un buen rendimiento en inglés.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo.
- El marco teórico DISC que acompaña al modelo no ha sido validado de forma independiente en la información disponible; los DOIs apuntan a documentos del propio autor.
- Modelo de 50M parámetros: capacidad limitada para razonamiento complejo, código o matemáticas, independientemente de la arquitectura.
- Repositorio con 0 likes y un único autor: sin señales de comunidad, mantenimiento ni soporte.
- Fecha de actualización (noviembre de 2026) posterior a la de creación, pero sin changelog que explique los cambios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/DNA-50M
- Perfil del autor: https://huggingface.co/reaperdoesntknow
- Documento teórico Discrepancy Calculus: https://huggingface.co/reaperdoesntknow/Discrepancy_Calculus (DOI: 10.57967/hf/8194)
- Documento Structure Over Scale: https://huggingface.co/reaperdoesntknow/Structure-Over-Scale (DOI: 10.57967/hf/8165)
- Documento Three Teachers to Dual Cognition: https://huggingface.co/reaperdoesntknow/DualMind_Methodolgy
- Paper de referencia sobre impacto ambiental citado en la model card: https://arxiv.org/abs/1910.09700
- Calculadora ML Impact: https://mlco2.github.io/impact#compute
