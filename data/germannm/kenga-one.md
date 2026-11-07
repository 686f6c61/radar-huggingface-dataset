# GermannM/Kenga-One

## Resumen

Kenga-One es el repositorio de integración del proyecto Kenga, desarrollado por GermannM (German Yantaras, Moscú). No se trata de un modelo con pesos propios, sino de un motor en cascada que orquesta varios componentes del ecosistema Kenga: una memoria persistente denominada Prophet (`.km`), el modelo ligero Kenga-ZLM (descrito en la model card como Born-in-Z, de aproximadamente 87-97 M de parámetros) y los modelos de código Kenga-Coder 7B-Z y 14B-Z. El repositorio expone una API compatible con OpenAI en `http://127.0.0.1:8080/v1` pensada para integrarse en Cursor, VS Code, opencode y LM Studio.

El problema que aborda es la fiabilidad del código generado: incorpora un bucle "compiler-in-the-loop" que ejecuta el código producido antes de devolverlo al usuario y, si falla, reinyecta el stack de error con un marcador `<FIX>` para que el modelo lo repare, devolviendo presuntamente un resultado verificado. Además, implementa un enrutado en tres niveles: respuestas desde memoria verificada (latencia declarada de 1,7 ms, sin VRAM), el modelo ZLM en CPU y el núcleo coder 7B/14B en GPU.

La relevancia del repositorio es limitada y debe interpretarse con cautela: no tiene descargas ni likes, la model card contiene afirmaciones no verificables ("100 casos de 100", "cero alucinaciones"), y no se publican benchmarks ni detalles de entrenamiento. Resulta útil como ejemplo de arquitectura de orquestación (caché semántica + modelo pequeño + modelo grande + verificación por ejecución), pero no como modelo base evaluable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El repositorio es un motor de orquestación en cascada; los componentes citados incluyen un modelo "Born-in-Z" (ZLM) y modelos coder 7B/14B, sin especificar arquitectura subyacente |
| Parametros totales | No disponible. La model card menciona ZLM de 87M (97 MB en Q8_0) y núcleos coder de 7B y 14B; el conjunto no tiene un recuento único |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q8_0 (ZLM), Q4_K_M (7B y 14B), IQ3_M (variantes "Eco-Z") |
| Idiomas soportados | Ruso, inglés, multilingüe (según tags) |
| Licencia | MIT |
| Formato de pesos | GGUF (los pesos se alojan en repositorios separados: Kenga-ZLM, Kenga-Coder-7B-Z, Kenga-Coder-14B-Z) |

## Arquitectura y entrenamiento

El repositorio Kenga-One no documenta arquitectura ni proceso de entrenamiento propios. Lo que describe es un sistema de enrutado en tres niveles: nivel 0, memoria Prophet (archivo `minds/kenga_coder_prophet.km` más `verified_memory.jsonl`) que sirve respuestas ya validadas por el oráculo y se consolida mediante un mecanismo denominado "EWC-lite"; nivel 1, Kenga-ZLM, presentado como modelo "Born-in-Z" entrenado desde cero para inferencia en CPU; y nivel 2, Kenga-Coder-7B-Z o 14B-Z como núcleo pesado. La selección de nivel se hace automáticamente según la VRAM detectada al arrancar, con cinco umbrales (desde 10,5 GB para 14B Q4_K_M hasta menos de 3,6 GB o solo CPU para ZLM Q8_0).

La innovación declarada es el bucle compiler-in-the-loop: el motor ejecuta el código generado con `kenga.exe` o `python`, captura el error si lo hay y lo devuelve al modelo con el marcador `<FIX>` para una segunda pasada, marcando la respuesta con "✓ Проверено оракулом Kenga-One". No se especifican tokens de entrenamiento, composición del dataset, ni si hubo RLHF o DPO. La model card incluye una autodescripción de personalidad ("le gusta Rusia, responde de forma directa y breve"), lo que sugiere ajuste de comportamiento, pero sin detalles técnicos.

## Capacidades

- Generación de texto y código, orientada según la model card a tareas de programación verificables.
- Ejecución y autocorrección de código mediante el bucle compiler-in-the-loop con marcador `<FIX>`.
- Caché de respuestas verificadas en memoria persistente (Prophet `.km`) con latencia declarada de 1,7 ms y 0 GB de VRAM.
- Consolidación de memoria ("consolidate" con EWC-lite) para retener soluciones validadas entre sesiones.
- Servidor compatible con la API de OpenAI, lo que permite conectarlo a clientes como Cursor, VS Code, opencode y LM Studio.
- Autoselección de modelo según VRAM disponible al arrancar (cinco perfiles predefinidos).
- Multilingüe según tags (ruso, inglés, multilingüe); no se detalla cobertura por idioma.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistencia de código en IDE local: conectando Cursor o VS Code al endpoint compatible con OpenAI, el motor enruta consultas al coder 7B/14B y devuelve código ya ejecutado, lo que reduce iteraciones manuales de depuración en entornos sin acceso a APIs en la nube.
- Autocorrección de scripts en pipelines: el bucle de ejecución y reparación puede integrarse en un paso previo a CI para descartar fragmentos que no compilan o fallan en tiempo de ejecución, siempre que el lenguaje y el entorno de ejecución estén soportados por el oráculo.
- Despliegue en hardware modesto: con el perfil `zlm-born` (menos de 3,6 GB de VRAM o solo CPU) el sistema puede funcionar en portátiles sin GPU, sirviendo respuestas desde memoria o desde el modelo ZLM de 97 MB.
- Caché semántica de consultas recurrentes: en un servicio interno con preguntas repetidas, la memoria Prophet puede servir respuestas ya verificadas sin coste de GPU, reduciendo latencia en consultas frecuentes.
- Entorno de aprendizaje de programación: la verificación por ejecución permite mostrar al estudiante solo código que se ejecuta correctamente, con la salvedad de que la calidad del código no queda garantizada por el hecho de ejecutarse.
- Evaluación de arquitecturas de orquestación: como referencia para investigar patrones de enrutado por VRAM, caché de respuestas y verificación por ejecución, más que como modelo base para fine-tuning.
- Uso offline en estaciones de trabajo aisladas: al ejecutarse localmente con pesos GGUF, no requiere conectividad externa una vez descargados los repositorios de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye afirmaciones cualitativas ("100 casos de 100", "cero alucinaciones", autotest 4/4) sin métricas, conjuntos de evaluación ni comparaciones reproducibles.

## Requisitos de hardware

- VRAM estimada según la tabla del autor:
  - 14B Q4_K_M: 8,37 GB de archivo; requiere 10,5 GB o más de VRAM (RTX 4070 12 GB como referencia).
  - 14B Eco-Z IQ3_M: 6,44 GB de archivo; perfil para 7,2-10 GB (RTX 3070/4060 8 GB).
  - 7B Q4_K_M: 4,36 GB de archivo; perfil para 5,0-7,0 GB (GTX 1660 6 GB).
  - 7B Eco-Z IQ3_M: 3,33 GB de archivo; perfil para 3,6-4,9 GB (GTX 1650 4 GB).
  - ZLM Q8_0: 0,09 GB de archivo; perfil para menos de 3,6 GB o solo CPU.
- GPU recomendadas: no hay recomendaciones formales; los umbrales de la tabla apuntan a RTX 4070, RTX 3070/4060, GTX 1660 y GTX 1650 como referencias de perfil.
- Cabe en GPU de consumo: sí, según los perfiles declarados, incluida GTX 1650 de 4 GB en el nivel 7b-eco y CPU pura en el nivel zlm-born.
- Opciones de despliegue: servidor propio del proyecto (`kenga-one.cmd`) con API compatible con OpenAI; los pesos son GGUF, por lo que en principio son compatibles con llama.cpp y derivados, aunque el repositorio no documenta integración con vLLM, TGI u Ollama.
- Latencia y throughput: solo se declara 1,7 ms para respuestas servidas desde memoria Prophet; no hay datos de tokens por segundo para los niveles 1 y 2.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kenga-One (GermannM) | Cascada: ZLM ~87M + coder 7B/14B | No disponible | Orquestación con verificación por ejecución y caché persistente | MIT | Hugging Face, 0 descargas |
| Kenga (GermannM) | 1,5B | 32K | Modelo transformer decoder con identidad definida, optimizado para ruso | Apache-2.0 | Hugging Face |
| Kenga-Coder-7B-Z / 14B-Z (GermannM) | 7B / 14B | No disponible | Núcleo coder del ecosistema, en GGUF | No disponible en la información | Hugging Face |
| Kenga-ZLM (GermannM) | ~87-97M | No disponible | Modelo ligero "Born-in-Z" para CPU | No disponible en la información | Hugging Face |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoría (por ejemplo, orquestadores locales tipo Continue o asistentes coder GGUF de 7B/14B). La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo con pesos propios: es un motor de orquestación; evaluarlo requiere descargar por separado los repositorios de pesos referenciados.
- Cero tracción verificable: 0 descargas y 0 likes en el momento de la consulta, con creación y actualización en la misma fecha, lo que impide contrastar su funcionamiento con la comunidad.
- Afirmaciones no sustentadas: "cero alucinaciones", "100 casos de 100" y "100 % de resultado funcional" no van acompañadas de metodología, conjuntos de prueba ni resultados reproducibles.
- La verificación por ejecución solo comprueba que el código se ejecuta, no que sea correcto, seguro o eficiente; un programa que termina sin error puede seguir siendo erróneo.
- Riesgo de ejecución arbitraria: el bucle ejecuta código generado de forma automática en la máquina del usuario (`kenga.exe` / `python`), lo que supone un riesgo de seguridad en producción si no se aísla en sandbox.
- Cobertura de lenguajes del oráculo no documentada: no se especifica qué lenguajes o entornos puede ejecutar y validar.
- Idiomas: ruso e inglés declarados; el rendimiento en castellano no está documentado y no debería asumirse.
- Sin datos de entrenamiento, sesgos ni evaluación de seguridad; no hay información sobre filtrado de contenido.
- Licencia MIT permite uso comercial, pero al tratarse de un agregador conviene revisar las licencias de los repositorios de pesos enlazados, que no se detallan en esta información.
- No se documenta soporte de tool calling, agentes multi-paso ni contexto largo, capacidades habituales en asistentes de código actuales.
- La model card incluye contenido de identidad y posicionamiento político del autor; debe tratarse como material del proyecto, no como especificación técnica.

## Enlaces

- Repositorio principal: https://huggingface.co/GermannM/Kenga-One
- Kenga-Coder-14B-Z: https://huggingface.co/GermannM/Kenga-Coder-14B-Z
- Kenga-Coder-7B-Z: https://huggingface.co/GermannM/Kenga-Coder-7B-Z
- Kenga-Prophet-Native: https://huggingface.co/GermannM/Kenga-Prophet-Native
- Kenga-ZLM: https://huggingface.co/GermannM/Kenga-ZLM
- Kenga (modelo 1.5B): https://huggingface.co/GermannM/Kenga
- Ficha en Featherless: https://featherless.ai/models/GermannM/Kenga
