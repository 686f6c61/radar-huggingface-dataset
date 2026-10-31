# mradermacher/Kreatix-K1-GGUF

## Resumen

Kreatix-K1-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF del modelo Kreatix-K1, publicado por el usuario mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face especializado en generar versiones optimizadas para inferencia local. El modelo base es KreatixLabs/Kreatix-K1, un modelo de aproximadamente 7,6 mil millones de parámetros etiquetado como asistente de programación (coding assistant), que además es un merge de otros modelos y está "abliterado" (con las restricciones de alineación eliminadas).

La relevancia de esta ficha reside en el formato: las cuantizaciones GGUF permiten ejecutar el modelo en hardware de consumo (CPU o GPU doméstica) mediante llama.cpp, Ollama, LM Studio u otros backends compatibles. Se ofrecen versiones desde Q2_K (3,1 GB) hasta f16 (15,3 GB), lo que cubre un amplio rango de configuraciones. El modelo base está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones.

Cabe destacar que el modelo base está orientado a tareas de código y conversación, y su naturaleza "abliterada" lo hace adecuado para usuarios que buscan un modelo sin filtros de seguridad incorporados, algo que debe valorarse con criterio en entornos de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (transformer basado en el modelo base; no se detalla) |
| Parametros totales | 7.615.616.512 (≈7,6 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas; también existen versiones imatrix en el repo hermano) |

## Arquitectura y entrenamiento

El repositorio de mradermacher no contiene el modelo original, sino cuantizaciones estáticas en GGUF del modelo base KreatixLabs/Kreatix-K1, un modelo de 7,6 mil millones de parámetros. Según las etiquetas del repositorio, K1 es un merge (fusión de pesos de varios modelos) y está abliterado, es decir, se ha aplicado un proceso para eliminar las salvaguardas de alineación del modelo original. No se dispone de información sobre la arquitectura exacta (transformer, MoE, etc.), el dataset de entrenamiento, el número de tokens ni los métodos de post-entrenamiento (RLHF, DPO) del modelo base.

En cuanto al proceso de cuantización, mradermacher emplea el formato GGUF con tipos de cuantización k-quant e i-quant de llama.cpp. Las versiones Q4_K_S y Q4_K_M se recomiendan como equilibrio entre velocidad y calidad, mientras que Q6_K se describe como de calidad muy buena y Q8_0 como la mejor calidad con buena velocidad. Además de estas cuantizaciones estáticas, existe un repositorio complementario con cuantizaciones weighted/imatrix (Kreatix-K1-i1-GGUF), que suelen ofrecer mejor calidad a tamaños equivalentes.

## Capacidades

- Generación de código: el modelo está etiquetado con los tags "code" y "coding-assistant", lo que indica que su foco principal es la programación.
- Conversación: etiquetado como "conversational", apto para chat y asistentes de diálogo.
- Ejecución local: gracias al formato GGUF, puede ejecutarse en CPU y GPU de consumo sin necesidad de servidores especializados.
- Sin filtros de alineación: al estar abliterado, responde sin los rechazos típicos de los modelos alineados (esto es una característica del modelo base, no una ventaja ética).
- No hay información que indique soporte de vision, audio, tool calling, function calling ni capacidades de agente.

## Casos de uso

- Asistente de programación local: ejecutar el modelo en LM Studio u Ollama para autocompletado y generación de código sin enviar el código fuente a servicios externos, algo valioso para empresas con requisitos de privacidad.
- Chatbot conversacional offline: la etiqueta conversational y el tamaño de 7,6 B lo hacen viable para asistentes de diálogo en portátiles con GPU de gama media usando cuants Q4.
- Prototipado de agentes de código: al ser Apache 2.0 y ligero, puede integrarse en pipelines de desarrollo para tareas de refactorización o revisión de pull requests.
- Pruebas y benchmarking de cuantizaciones: útil para investigadores que quieran comparar el impacto de distintos tipos de cuant (Q2_K a Q8_0) sobre un mismo modelo base.
- Entornos sin conexión: despliegue en máquinas aisladas (air-gapped) donde no se puede acceder a APIs comerciales.
- Experimentación con modelos abliterados: para investigación sobre seguridad y alineación de modelos, al tratarse de un merge sin salvaguardas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM / memoria estimada según cuant (solo pesos, sin KV cache):
  - Q2_K: ~3,1 GB
  - Q3_K_M: ~3,9 GB
  - IQ4_XS: ~4,4 GB
  - Q4_K_M: ~4,8 GB
  - Q5_K_M: ~5,5 GB
  - Q6_K: ~6,4 GB
  - Q8_0: ~8,2 GB
  - f16: ~15,3 GB
- GPU recomendadas: cualquier GPU de consumo con 6-8 GB de VRAM (RTX 3060, RTX 4060 Ti) ejecuta cómodamente los cuants Q4/Q5; con una RTX 4090 (24 GB) cabe Q8_0 o f16 con contexto amplio.
- Cabe en GPU de consumo: sí, desde ~4 GB de VRAM con Q2_K/Q3, y también es viable en CPU pura (con 8-16 GB de RAM) gracias a llama.cpp, aunque con menor velocidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, y cualquier backend compatible con GGUF. No es un repo vLLM/TGI nativo (para esos backends habría que usar el modelo base en safetensors).
- Latencia y throughput: no disponible; los cuants Q4_K se describen como "fast" en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Kreatix-K1 (base) | 7,6 B | safetensors | Apache 2.0 | Merge, abliterado, foco en código |
| Qwen2.5-Coder-7B-Instruct | 7,6 B | safetensors/GGUF | Apache 2.0 | Referente en código de tamaño similar, con benchmarks publicados |
| CodeLlama-7B-Instruct | 7 B | safetensors/GGUF | Llama 2 (licencia comunitaria) | Modelo clásico de código, más antiguo y con contexto menor |
| Mistral-7B-Instruct v0.3 | 7,2 B | safetensors/GGUF | Apache 2.0 | Generalista, no especializado en código |

Nota: la comparativa se basa en categorías equivalentes (7-8 B, código/asistente); no hay datos de rendimiento publicados para Kreatix-K1 que permitan comparar benchmarks numéricos.

## Limitaciones y advertencias

- Al ser un modelo abliterado, no rechazará peticiones dañinas; su uso en producción o expuesto a usuarios finales conlleva riesgos éticos y legales significativos.
- Es un merge de modelos, lo que puede introducir incoherencias o degradación en capacidades heredadas de los modelos fuente; no hay documentación sobre su composición.
- Idioma: solo se declara soporte de inglés; el rendimiento en castellano no está documentado y puede ser inferior.
- Longitud de contexto no especificada: no se puede garantizar funcionamiento con documentos largos sin verificarlo previamente.
- Las cuantizaciones bajas (Q2_K, Q3_K_S/M) sufren pérdida de calidad notable, especialmente en tareas de código y matemáticas.
- No hay benchmarks publicados ni información sobre alucinaciones o sesgos del modelo base; se recomienda evaluación propia antes de uso serio.
- Las cuantizaciones estáticas de este repo son generalmente inferiores a las versiones imatrix disponibles en Kreatix-K1-i1-GGUF para tamaños pequeños.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Kreatix-K1-GGUF
- Modelo base: https://huggingface.co/KreatixLabs/Kreatix-K1
- Cuantizaciones imatrix (weighted): https://huggingface.co/mradermacher/Kreatix-K1-i1-GGUF
- Página de descarga resumida: https://hf.tst.eu/model#Kreatix-K1-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
