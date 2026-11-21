# AI-conn/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated-i1-GGUF

## Resumen

Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated-i1-GGUF es una conversión a formato GGUF de un modelo derivado de Qwen3-Coder-30B-A3B-Instruct. La cadena de autoría es triple: los pesos originales son de Qwen (Alibaba), la versión "abliterated" (con las direcciones de rechazo eliminadas mediante edición de pesos) es de huihui-ai, la conversión GGUF con calibración imatrix es de mradermacher y este fork concreto lo publica AI-conn. El modelo base es un transformer de tipo Mixture of Experts con 30.532.122.624 parámetros totales y aproximadamente 3.000 millones activos por token, diseñado específicamente para tareas de código.

La relevancia de esta ficha reside en dos factores. Primero, el modelo base Qwen3-Coder-30B-A3B-Instruct es una de las referencias abiertas más eficientes para generación de código con activación dispersa, y esta versión GGUF permite ejecutarlo en hardware de consumo con cuantizaciones de 4 bits. Segundo, la variante abliterated elimina los mecanismos de rechazo del modelo original, lo que cambia radicalmente el perfil de uso: resulta útil para investigación sobre alineación y para tareas creativas o de código sin filtros, pero introduce riesgos considerables en producción.

El fork de AI-conn no aporta cambios en los pesos respecto a la conversión de mradermacher; su función declarada es fijar una copia inmutable para una flota interna y documentar notas de ajuste de memoria. La licencia es Apache-2.0 según el repositorio de origen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), derivado de Qwen3-Coder-30B-A3B-Instruct |
| Parámetros totales | 30.532.122.624 |
| Parámetros activos | ~3B por token (según model card) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | GGUF con calibración imatrix; confirmados i1-Q4_K_M (17,28 GiB) e i1-IQ4_XS (15,24 GiB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) en el que cada token activa aproximadamente 3.000 millones de parámetros de un total de 30.500 millones. Esta dispersión reduce el coste computacional por token, pero no reduce el coste de memoria: la model card advierte explícitamente que todos los pesos de los expertos deben residir en VRAM para la inferencia en GPU, de modo que la ventaja del "3B activo" se manifiesta en velocidad de cómputo, no en huella de memoria.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO en el modelo base. La variante abliterated de huihui-ai aplica una técnica de edición de pesos que elimina la dirección de activación asociada al rechazo, sin reentrenamiento. La conversión a GGUF de mradermacher emplea calibración imatrix, que ajusta los factores de cuantización por capa para preservar mejor la calidad en bits bajos. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal en la información disponible.

## Capacidades

- Generación de código en múltiples lenguajes, heredada del modelo base Qwen3-Coder.
- Razonamiento sobre código: explicación, refactorización y depuración.
- Conversación multi-turno (etiqueta "conversational" en el repositorio).
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Integración con Ollama mediante `ollama pull` del repositorio HF.
- Comportamiento sin filtros de rechazo (abliterated): responde a peticiones que el modelo original declinaría.
- Tool calling y function calling: no confirmado en la información proporcionada, aunque es una capacidad esperable del base Qwen3-Coder; no se puede afirmar sin verificación.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Idiomas: no disponibles.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la abliteración altera las respuestas ante prompts sensibles, comparando directamente con el base Qwen3-Coder sin modificar.
- Generación de código en local con GPU de consumo: con i1-Q4_K_M (17,28 GiB) cabe en una tarjeta de 20 GB como la RX 7900 XT, según las mediciones de la model card, lo que permite autocompletado y asistencia de código sin depender de la nube.
- Entornos de desarrollo con requisitos de privacidad: al ejecutarse íntegramente en local vía Ollama o llama.cpp, el código del usuario no sale de la máquina, lo que encaja en auditorías o propiedad intelectual sensible.
- Escritura creativa sin restricciones: la eliminación de rechazos permite generar narrativa, diálogo o contenido de ficción que el modelo original filtraría, útil en talleres literarios o prototipado de guiones.
- Pruebas de robustez de pipelines: sirve como modelo "adversario" para evaluar si los filtros de una aplicación aguantan respuestas no censuradas antes de desplegar el modelo real.
- Benchmarking local de cuantizaciones: las notas de ajuste de memoria del fork permiten comparar i1-Q4_K_M frente a i1-IQ4_XS en la misma máquina y decidir el equilibrio entre fidelidad y contexto disponible.
- Fine-tuning posterior sobre dominio específico: al ser Apache-2.0 y estar en GGUF, se puede usar como base para destilación o adaptación en flujos con llama.cpp, aunque el fine-tuning directo requeriría los pesos safetensors del modelo padre.

## Benchmarks y rendimiento

| Benchmark | Modelo | Resultado | Fuente |
|---|---|---|---|
| HumanEval Pro | Base stock (Qwen3-Coder-30B-A3B-Instruct) | 60,4 % | Harness comunitario citado en la model card |

No se han publicado resultados de benchmarks de esta build abliterated en la información disponible. La model card indica explícitamente que no existe ninguna evaluación independiente de código sobre builds abliterated y que el ranking se decide mediante comparativas locales, no mediante fichas.

## Requisitos de hardware

- VRAM estimada: i1-Q4_K_M ocupa 17,28 GiB y, sumando KV cache pequeño de MoE y ~0,7 GiB de reserva, deja el total en unos 18,3 GiB residentes. i1-IQ4_XS ocupa 15,24 GiB y ofrece más margen para contexto.
- GPU recomendadas: tarjetas con 20 GB o más de VRAM para Q4_K_M (RX 7900 XT medida en la model card). Para IQ4_XS, tarjetas de 16 GB podrían ser viables, aunque no se confirma en la información disponible.
- GPU de consumo: sí, en el rango de 16-24 GB, con la advertencia de que todos los expertos deben caber en VRAM; no sirve el offloading parcial típico de modelos densos.
- Despliegue: Ollama (comando documentado), llama.cpp y cualquier runtime compatible con GGUF. vLLM y TGI no están confirmados para este formato en la información disponible.
- Latencia y throughput: no disponibles. La model card solo aporta el presupuesto de memoria, no cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este modelo (AI-conn, GGUF abliterated) | 30,5B | ~3B | no disponible | Apache-2.0 | GGUF | Sin filtros de rechazo; fork inmutable |
| Qwen3-Coder-30B-A3B-Instruct (original) | 30,5B | ~3B | no disponible | Apache-2.0 | safetensors | Base con alineación estándar; 60,4 % en HumanEval Pro |
| Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated (safetensors) | 30,5B | ~3B | no disponible | Apache-2.0 | safetensors | Mismos pesos abliterated sin cuantizar |
| mradermacher i1-GGUF (conversión de origen) | 30,5B | ~3B | no disponible | Apache-2.0 | GGUF | Conversión idéntica; este fork solo la replica |

## Limitaciones y advertencias

- La abliteración elimina los rechazos del modelo: puede producir contenido dañino, ilegal o inseguro sin aviso, lo que la desaconseja para aplicaciones de cara al público sin filtros externos.
- Riesgo de alucinación propio de los modelos de código: puede inventar APIs, funciones o dependencias inexistentes, especialmente en cuantizaciones de 4 bits.
- La cuantización i1-Q4_K_M introduce pérdida de fidelidad frente a los pesos safetensors; la model card recomienda IQ4_XS solo si se prioriza el contexto sobre la calidad.
- El "3B activo" no reduce la VRAM necesaria: quien planifique desplegarlo en una GPU de 12 GB no podrá hacerlo con estas cuantizaciones.
- No hay evaluación independiente de la calidad de código de esta build abliterated; el 60,4 % de HumanEval Pro corresponde al base stock, no a esta versión.
- Idiomas soportados no documentados; el comportamiento multilingüe no está verificado.
- Licencia Apache-2.0 permite uso comercial, pero el autor del fork no ofrece garantías y la responsabilidad del contenido generado recae en el desplegador.
- El fork existe para una flota interna y puede no recibir actualizaciones ni correcciones de la conversión original de mradermacher.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AI-conn/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated-i1-GGUF
- Modelo abliterated de huihui-ai: https://huggingface.co/huihui-ai/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated
- Conversión GGUF original de mradermacher: https://huggingface.co/mradermacher/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated-i1-GGUF
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
