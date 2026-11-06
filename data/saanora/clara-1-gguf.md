# Saanora/clara-1-GGUF

## Resumen

Clara (clara-1-GGUF) es la versión cuantizada en formato GGUF de Clara, un modelo de decisión desarrollado por Saanora. A diferencia de un modelo conversacional convencional, Clara está diseñada como un "decision model": responde preguntas clasificando opciones leyendo las probabilidades de letras de opción tras un prompt fijo, en lugar de generar texto libre. Esto la hace adecuada para tareas de clasificación zero-shot, enrutado de solicitudes y puntuación estructurada.

Este repositorio contiene las builds GGUF para ejecutar el modelo con llama.cpp en portátiles y CPUs, sin necesidad de GPU. El modelo base tiene 4.326.350.848 parámetros (unos 4,3 mil millones) y solo incluye el modelo de lenguaje (sin torre de visión). En este formato GGUF solo funciona en modo de lectura unidireccional; el modo bidireccional requiere el servidor System One del repositorio principal.

Su relevancia radica en ofrecer decisiones estructuradas (sí/no, elección entre criterios, puntuación) con un modelo pequeño que corre en hardware de consumo, con licencia Apache 2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de solo lenguaje (decision model, sin torre de visión); detalle exacto no disponible |
| Parametros totales | 4.326.350.848 (aprox. 4,3 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible oficialmente; el ejemplo de despliegue usa 8192 tokens |
| Tipos de cuantizacion | Q8_0 (4,6 GB), Q4_K_M (2,8 GB); pesos base en bf16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base está en safetensors (bf16) |

## Arquitectura y entrenamiento

Clara es un modelo de decisión basado en un transformer de lenguaje de unos 4,3 mil millones de parámetros. Su mecanismo de respuesta no es la generación libre de texto: el modelo recibe un prompt fijo con las preguntas y grupos de etiquetas, y la respuesta se obtiene leyendo las probabilidades asignadas a las letras de cada opción. Esto convierte la inferencia en una lectura de logits en lugar de un bucle de decodificación, lo que reduce la latencia y elimina problemas de alucinación en la salida. Cada pregunta se procesa como un prompt independiente.

No se han publicado detalles sobre el proceso de entrenamiento, composición del dataset, número de tokens ni técnicas de alineación (RLHF/DPO) en la información disponible; la model card remite al repositorio principal para resultados, limitaciones y datos de entrenamiento. Las cuantizaciones se generaron con `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp (versión de 2026-10-25), y se validó la concordancia con los pesos bf16 sobre 14 preguntas de prueba: Q8_0 presenta una desviación media de probabilidad de 0,002 (máxima 0,010) y Q4_K_M de 0,013 (máxima 0,080), sin que cambiara ninguna respuesta.

## Capacidades

- Clasificación zero-shot: determina si una condición se cumple (tipo "noul", por ejemplo "Is an export failing?") leyendo probabilidades, sin entrenamiento adicional.
- Elección entre opciones con criterios definidos por el usuario (tipo "choice"), útil para enrutar solicitudes a equipos o categorías.
- Puntuación ordinal (tipo "score") sobre criterios ordenados, como niveles de severidad ("none", "low", "high", "critical").
- Procesamiento de solicitudes estructuradas en formato JSON con múltiples preguntas simultáneas (cada una como prompt independiente).
- Ejecución local en CPU mediante llama.cpp, sin dependencias de Python más allá de la librería estándar.
- No incluye capacidades de visión (sin torre de visión) ni generación de texto conversacional en el sentido tradicional.
- El modo bidireccional (two-way) no está disponible en GGUF; requiere el servidor System One del repositorio principal.
- No se menciona soporte de tool calling, agentes ni modos de razonamiento extendido.

## Casos de uso

- Triaje automático de incidencias: clasifica si un reporte indica un fallo real, lo asigna al equipo responsable (ingeniería, facturación, etc.) y estima su severidad, como muestra el ejemplo de la model card con un fallo nocturno de exportación.
- Enrutado de tickets de soporte: con preguntas de tipo "choice" y criterios personalizados, dirige cada solicitud entrante al departamento adecuado antes de que intervenga un agente humano.
- Moderación y filtrado de contenido: clasificación zero-shot de mensajes o comentarios según categorías definidas por el equipo, sin necesidad de entrenar un clasificador específico.
- Puntuación de severidad o prioridad: asigna valores ordinales (de "none" a "critical") a registros operativos, alertas de monitorización o reportes de usuarios.
- Automatización en pipelines de datos: dado que solo requiere la librería estándar de Python y llama-server, puede integrarse en scripts de CI/CD o trabajos nocturnos que necesiten decisiones binarias o categorizaciones sobre textos.
- Despliegue en edge y portátiles: las versiones Q4_K_M (2,8 GB) permiten ejecutar decisiones locales en máquinas sin GPU, útil para herramientas de escritorio o entornos sin conectividad.
- Extracción de señales estructuradas de texto libre: convierte estados descritos en lenguaje natural en respuestas JSON estructuradas para alimentar sistemas posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento publicados son de concordancia entre cuantizaciones y el modelo bf16:

| Cuantizacion | Tamano | Desviacion media \|Δp\| | Desviacion maxima | Respuestas cambiadas |
|---|---|---|---|---|
| Q8_0 | 4,6 GB | 0,002 | 0,010 | 0 |
| Q4_K_M | 2,8 GB | 0,013 | 0,080 | 0 |

Ademas, la conversion bf16 coincide con la API alojada de referencia dentro de 0,04 en las respuestas del demo de lanzamiento (failing 0,998, team engineering 0,963, severity 2,05 frente a 0,998, 0,967 y 2,01 de la API).

## Requisitos de hardware

- VRAM/memoria estimada: Q8_0 requiere unos 4,6 GB de memoria (RAM o VRAM); Q4_K_M unos 2,8 GB. Está pensado para funcionar en CPU.
- GPU recomendadas: no necesaria; el objetivo declarado del repositorio son portátiles y CPUs. Si se usa GPU, cualquier GPU con 4-6 GB de VRAM (por ejemplo una RTX 3060 o superior) ejecutaría Q8_0 sin problemas.
- Consumer GPUs: cabe sobradamente en prácticamente cualquier GPU de consumo moderna; incluso puede ejecutarse íntegramente en RAM de un portátil.
- Despliegue: llama.cpp (`llama-server`) es el método documentado, con el script auxiliar `clara_gguf.py` incluido en el repositorio. No se menciona soporte para vLLM, TGI u Ollama.
- Latencia: en CPU se esperan "unos pocos segundos por pregunta" para registros cortos, ya que cada pregunta es un prompt independiente.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea principal | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Clara (clara-1) | 4,3 B | Clasificacion zero-shot / decisiones estructuradas | no disponible | Apache 2.0 | GGUF y pesos base en Hugging Face |
| DeBERTa-v3-large (zero-shot NLI) | 0,4 B | Clasificacion zero-shot via NLI | 512 tokens | MIT | Hugging Face, transformers |
| DeBERTa-v2-xxlarge-mnli | 1,5 B | Clasificacion zero-shot via NLI | 512 tokens | MIT | Hugging Face, transformers |
| Llama 3.1 8B Instruct (uso general) | 8 B | Generacion de texto, clasificacion via prompting | 128.000 tokens | Licencia Llama 3.1 | Hugging Face, GGUF, vLLM, Ollama |

Frente a los clasificadores zero-shot tipo NLI (DeBERTa), Clara es mayor y presumiblemente más capaz en instrucciones complejas con múltiples criterios, aunque más lenta en CPU. Frente a un LLM general como Llama 3.1 8B, Clara ofrece respuestas deterministas y estructuradas (probabilidades por opción) sin riesgo de salida textual malformada, a costa de no generar texto libre y de tener un contexto mucho más reducido.

## Limitaciones y advertencias

- Solo lectura unidireccional en GGUF: el modo bidireccional requiere el servidor System One del repositorio principal, no disponible en este formato.
- Requiere el prompt fijo y los grupos de etiquetas específicos del sistema; no funciona como LLM conversacional genérico.
- Solo inglés: el modelo está etiquetado únicamente para el idioma inglés; no hay soporte declarado para castellano ni otros idiomas.
- Cada pregunta es un prompt independiente, lo que multiplica el coste de inferencia en solicitudes con muchas preguntas (segundos por pregunta en CPU).
- Sin torre de visión: no admite entradas multimodales.
- La validación de las cuantizaciones se realizó solo sobre 14 preguntas de prueba; la concordancia en dominios distintos no está documentada.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: bajo en la salida (no genera texto libre), aunque la calidad de las probabilidades depende del dominio de entrada.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, con obligación de conservar atribución según el archivo NOTICE.
- Los detalles de entrenamiento, limitaciones completas y resultados remiten al repositorio principal de Saanora/clara-1, no incluidos en esta model card.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Saanora/clara-1-GGUF
- Modelo base: https://huggingface.co/Saanora/clara-1
- llama.cpp: https://github.com/ggml-org/llama.cpp
