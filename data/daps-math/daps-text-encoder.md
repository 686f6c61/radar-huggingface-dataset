# DAPS-Math/DAPS-text-encoder

## Resumen

DAPS-text-encoder es un codificador de texto (text encoder) de tipo sentence-transformers desarrollado por DAPS-Math, un proyecto orientado a la seleccion de premisas (premise selection) en demostraciones formales asistidas por ordenador. El modelo parte de Alibaba-NLP/gte-modernbert-base y se ha afinado sobre el dataset DAPS-Mathlib-Graph, derivado de Mathlib, la biblioteca de matematicas formales del ecosistema Lean. Genera embeddings de 768 dimensiones mediante pooling CLS y admite una longitud maxima de entrada de 1024 tokens.

El modelo corresponde a la Fase 1 del pipeline DAPS (Dependency-Aware Premise Selection). Su funcion es representar tanto enunciados de lemas de Mathlib como objetivos de demostracion en un espacio vectorial comun, de modo que sea posible recuperar premisas relevantes por similitud semantica. Es relevante para quienes trabajan en demostracion automatica de teoremas (ATP) y en asistentes de prueba como Lean, donde la seleccion eficiente de premisas es un cuello de botella clave.

Se trata de un modelo compacto (149 millones de parametros, unos 0,6 GB en el repositorio) con licencia Apache 2.0, pensado para integrarse como componente de recuperacion dentro de sistemas mayores. El autor recomienda combinarlo con DAPS-selector (Fase 2) para obtener un mejor rendimiento en seleccion de premisas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), via gte-modernbert-base |
| Parametros totales | 149.014.272 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/ONNX no documentadas) |
| Idiomas soportados | no disponible (entrenado sobre Mathlib, predominantemente notacion formal Lean y matematicas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, heredado de Alibaba-NLP/gte-modernbert-base, afinado (finetune) para la tarea de similitud de frases y seleccion de premisas. Produce embeddings de 768 dimensiones aplicando pooling CLS sobre la salida del encoder, con una longitud maxima de secuencia de 1024 tokens. La libreria de referencia es sentence-transformers.

El entrenamiento se realizo sobre el dataset DAPS-Mathlib-Graph, derivado de Mathlib, lo que orienta el espacio de embeddings hacia enunciados de lemas y objetivos de demostracion en notacion formal Lean. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas de RLHF/DPO en la informacion proporcionada. La innovacion principal del pipeline DAPS es el uso de informacion de dependencias (dependency-aware) en la Fase 2 (DAPS-selector), que se apoya en este encoder de la Fase 1.

## Capacidades

- Generacion de embeddings de texto de 768 dimensiones para similitud semantica.
- Recuperacion de premisas relevantes para objetivos de demostracion en Mathlib/Lean.
- Codificacion de enunciados matematicos en notacion formal Lean.
- Funciona como encoder de texto de Mathlib de forma independiente.
- Integracion con sentence-transformers y text-embeddings-inference.
- Compatible con endpoints (tag endpoints_compatible).
- No es un modelo generativo: no produce texto, razonamiento ni codigo; solo representaciones vectoriales.
- No se documenta soporte de tool calling, agentes ni vision.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Seleccion de premisas en demostracion formal: dado un objetivo de prueba en Lean, el modelo codifica el objetivo y recupera los lemas de Mathlib mas similares por similitud coseno, reduciendo el espacio de busqueda del demostrador.
- Asistencia a demostradores automaticos de teoremas (ATP): como etapa de recuperacion previa a un demostrador, filtra candidatos relevantes del corpus de Mathlib para acelerar la busqueda.
- Busqueda semantica sobre bibliotecas matematicas formales: indexar enunciados de Mathlib y permitir consultas por similitud para localizar lemas afines.
- Integracion en pipelines de Lean: usar el encoder como componente de recuperacion dentro de herramientas de autocompletado o sugerencia de lemas en editores.
- Deduplicacion y agrupacion de lemas: agrupar enunciados equivalentes o muy similares en el mantenimiento de bibliotecas formales.
- Base para sistemas dependency-aware: combinado con DAPS-selector (Fase 2), construir un pipeline completo de seleccion de premisas que aproveche dependencias entre lemas.
- Servicio de embeddings: desplegar el modelo con text-embeddings-inference para exponer un endpoint de similitud de frases en aplicaciones de matematicas formales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 149 millones de parametros, en precision FP16 requiere aproximadamente 0,3 GB solo para los pesos, mas memoria para activaciones y batch; en FP32, en torno a 0,6 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 4-8 GB de VRAM es suficiente; A100, H100 o RTX 4090 sobran ampliamente para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer (por ejemplo, RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para cargas moderadas.
- Opciones de despliegue: sentence-transformers, text-embeddings-inference (compatible con endpoints), y potencialmente llama.cpp/Ollama si se generan pesos GGUF (no documentado).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension embedding | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DAPS-text-encoder | 149 M | 1024 | 768 | Apache 2.0 | Hugging Face |
| Alibaba-NLP/gte-modernbert-base (modelo base) | ~149 M | 8192 (segun model card del base, no confirmado en esta ficha) | 768 | Apache 2.0 | Hugging Face |
| DAPS-selector (Fase 2, mismo proyecto) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo exclusivamente de embeddings: no genera texto ni razona; su utilidad depende de un sistema externo que use las representaciones.
- Dominio muy especifico (Mathlib/Lean): el rendimiento fuera de matematicas formales puede degradarse notablemente.
- Longitud de contexto limitada a 1024 tokens, lo que puede truncar enunciados o objetivos largos.
- Idiomas soportados no documentados; se desconoce su comportamiento en castellano u otros idiomas naturales.
- Riesgo de falsos positivos en recuperacion: la similitud semantica no garantiza relevancia logica para una demostracion.
- Solo 18 descargas y 0 likes en el momento de la consulta: modelo poco validado por la comunidad, con escasa evidencia externa de calidad.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base gte-modernbert-base y del dataset Mathlib.
- Sin benchmarks publicados: no es posible comparar su calidad de recuperacion con alternativas de forma objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DAPS-Math/DAPS-text-encoder
- Modelo base: https://huggingface.co/Alibaba-NLP/gte-modernbert-base
- DAPS-selector (Fase 2): https://huggingface.co/DAPS-Math/DAPS-selector
- Dataset DAPS-Mathlib-Graph: https://huggingface.co/datasets/DAPS-Math/DAPS-Mathlib-Graph
- Pagina del proyecto DAPS: https://relational-conjecturing.github.io/Dependency-Aware-Premise-Selection/
