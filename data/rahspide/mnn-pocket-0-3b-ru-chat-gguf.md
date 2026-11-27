# Rahspide/MNN-Pocket-0.3B-RU-Chat-GGUF

## Resumen

MNN-Pocket-0.3B-RU-Chat es un asistente conversacional en ruso de muy pequeño tamaño (302.830.976 parámetros, aproximadamente 0,3 B), desarrollado por Rahspide. Se trata de un ajuste fino supervisado (SFT) sobre el modelo base Rahspide/MNN-Pocket-0.3B-RU, orientado a seguir instrucciones y mantener conversaciones multi-turno en ruso, con soporte secundario de inglés. Su relevancia radica en que ofrece capacidades conversacionales en un envelope de memoria que cabe en dispositivos móviles y CPU sin GPU dedicada.

Esta ficha documenta específicamente los builds cuantizados en formato GGUF publicados en el repositorio Rahspide/MNN-Pocket-0.3B-RU-Chat-GGUF, que corresponden a los pesos v2.0 del repositorio principal (receta reconstruida, 12,2 M de tokens de SFT). El repositorio tiene un tamaño de 2,8 GB e incluye cuatro variantes de cuantización, desde F16 de referencia hasta Q4_1 de 208 MB.

El modelo es relevante ahora por su perfil de despliegue: inferencia en CPU x86 a velocidades de generación cercanas a 97 t/s con Q4_K_M según las mediciones del autor, licencia Apache 2.0 y compatibilidad con llama.cpp y el ecosistema GGUF. No obstante, su ventana de contexto, composición del dataset de entrenamiento y resultados de benchmarks no están documentados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base MNN-Pocket-0.3B-RU; no se detalla en la informacion) |
| Parametros totales | 302.830.976 (0,3 B) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M, Q4_1 |
| Idiomas soportados | ru, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el repositorio base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (tipo de transformer, atención, normalización, etc.). Se sabe que el modelo base es Rahspide/MNN-Pocket-0.3B-RU y que el chat se obtiene mediante SFT sobre dicho base, con 12,2 M de tokens de datos de ajuste supervisado en la versión v2.0 (reconstruida el 2026-11-25). No se especifica si hubo RLHF, DPO u otras fases de alineamiento posteriores al SFT.

El modelo utiliza una plantilla de chat propia basada en ChatML, lo que obliga a emplear el flag `--jinja` en llama.cpp para que el modelo responda en lugar de continuar el prompt. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Generación de texto conversacional en ruso, con soporte secundario de inglés.
- Seguimiento de instrucciones (instruction-following) gracias al ajuste SFT.
- Conversación multi-turno mediante plantilla ChatML propia.
- Inferencia en CPU sin GPU, con builds que caben en dispositivos móviles.
- Compatibilidad con el ecosistema GGUF (llama.cpp y derivados).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Asistente conversacional en ruso en dispositivos móviles: el build Q4_K_M (223 MB) o Q4_1 (208 MB) permite ejecutar el modelo en un teléfono o tableta sin GPU, respondiendo consultas cotidianas con latencia aceptable.
- Chatbot embebido en aplicaciones de escritorio: con llama.cpp y el build Q8_0 (309 MB) se obtiene una calidad casi sin pérdida en un footprint reducido, adecuado para integrarse en aplicaciones nativas.
- Atención al cliente de bajo coste en ruso: el modelo puede gestionar conversaciones multi-turno sencillas en un servidor CPU compartido, reduciendo el coste frente a modelos de mayor tamaño.
- Prototipado rápido de pipelines conversacionales: al ser Apache 2.0 y estar en GGUF, permite validar flujos de chat y plantillas ChatML antes de migrar a modelos mayores.
- Educación y demostraciones: útil para enseñar conceptos de cuantización e inferencia local en CPU con un modelo de 0,3 B y builds de pocos cientos de MB.
- Filtrado o preprocesado de texto en ruso: tareas de clasificación ligera, reformulación o extracción simple en entornos con recursos limitados.
- Inferencia en entornos air-gapped o de borde: el tamaño reducido y la licencia permisiva permiten desplegar el modelo en dispositivos sin conectividad ni aceleradores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta mediciones de rendimiento de inferencia con `llama-bench` en CPU x86 de 16 hilos, sin GPU, 5 repeticiones, con desviación estándar de ±24 t/s:

| Build | Prompt processing | Generación |
|---|---|---|
| Q4_K_M | 632 t/s | 97 t/s |
| Q4_1 | 395 t/s | 89 t/s |

El autor advierte que estas cifras son indicativas y se midieron en un host compartido con carga.

## Requisitos de hardware

- VRAM estimada: no aplica para los builds GGUF en CPU; en GPU, el footprint es inferior a 1 GB en todas las cuantizaciones (F16 580 MB, Q8_0 309 MB, Q4_K_M 223 MB, Q4_1 208 MB).
- GPU recomendadas: no se especifican; cualquier GPU con al menos 1 GB de memoria puede alojar los builds cuantizados, aunque el modelo está pensado para CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en iGPU.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y por extensión herramientas compatibles con GGUF como Ollama o LM Studio; el repositorio está etiquetado como `endpoints_compatible`.
- Latencia y throughput: 97 t/s de generación y 632 t/s de prompt processing en Q4_K_M sobre CPU x86 de 16 hilos según el autor; cifras indicativas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables documentados en la información proporcionada. Como referencia estructural, se puede contrastar con otros modelos de ~0,3 B en GGUF, pero no se aportan cifras de rendimiento para una comparación rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| MNN-Pocket-0.3B-RU-Chat | 0,3 B | no disponible | Apache 2.0 | GGUF |
| Alternativas de ~0,3 B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de 0,3 B: capacidad de razonamiento, conocimiento factual y coherencia limitadas en comparación con modelos de mayor tamaño; riesgo elevado de alucinación.
- Idiomas: entrenado principalmente para ruso, con soporte secundario de inglés; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Longitud de contexto no documentada: no se puede asumir una ventana amplia para conversaciones largas o documentos extensos.
- Plantilla ChatML propia: sin el flag `--jinja` en llama.cpp el modelo continúa el prompt en lugar de responder, lo que puede romper integraciones mal configuradas.
- Sesgos: no se documentan evaluaciones de sesgo; al ser un modelo pequeño entrenado con SFT, puede reproducir sesgos presentes en los datos de ajuste.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el comportamiento en el dominio de producción.
- Mediciones de rendimiento en un host compartido con alta desviación (±24 t/s): no deben tomarse como cifras de producción.
- No se documentan evaluaciones de seguridad, filtrado de contenido ni robustez frente a prompts adversarios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU-Chat-GGUF
- Modelo base (chat): https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU-Chat
- Modelo base (pretrained): https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU
- Rama v1 de builds anteriores: https://huggingface.co/Rahspide/MNN-Pocket-0.3B-RU-Chat/tree/v1
