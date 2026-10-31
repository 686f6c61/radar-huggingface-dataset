# mradermacher/PageAudit-Qwen3.5-4B-GGUF

## Resumen

PageAudit-Qwen3.5-4B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo aixonlab/PageAudit-Qwen3.5-4B, realizada por el cuantizador conocido mradermacher. El modelo base es un LLM de 4.326 millones de parámetros (4,33 B), basado en la familia Qwen3.5, especializado en auditoría de accesibilidad web, cumplimiento de WCAG, revisión de interfaces de usuario (UI audit) y consistencia de diseño. El modelo original es multilingüe en cuanto a arquitectura (familia Qwen), aunque la model card lo declara en inglés.

Este repositorio resuelve un problema práctico concreto: permitir ejecutar un modelo especializado en auditar páginas web y detectar problemas de accesibilidad y diseño en hardware de consumo, gracias a las versiones cuantizadas que van desde 2,1 GB (Q2_K) hasta 8,8 GB (f16). Destaca la inclusión de archivos mmproj (suplementos multimodales en Q8_0 y f16), lo que indica que el modelo base incorpora capacidades de visión, algo coherente con su propósito de auditar interfaces gráficas. La relevancia de este modelo radica en la creciente exigencia normativa de accesibilidad digital (como el European Accessibility Act) y la falta de modelos abiertos especializados en este dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con componente multimodal (mmproj) |
| Parametros totales | 4.326.350.848 (4,33 B) |
| Parametros activos | no disponible (no se indica si es MoE; todo apunta a modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repo); el modelo base esta en safetensors/transformers |

## Arquitectura y entrenamiento

El modelo base, aixonlab/PageAudit-Qwen3.5-4B, es un ajuste especializado sobre Qwen3.5 de 4 B de parametros, una arquitectura transformer densa de la familia Qwen de Alibaba. La presencia de archivos mmproj (proyectores multimodales) en las cuantizaciones confirma que el modelo acepta entradas visuales ademas de texto, requisito indispensable para auditar capturas de pantalla e interfaces web. No se ha publicado informacion sobre el proceso de fine-tuning (numero de tokens, composicion del dataset, uso de RLHF/DPO o SFT).

En cuanto a este repositorio concreto, mradermacher ofrece cuantizaciones estaticas en GGUF (metodo de conversion tipo hf), cubriendo todo el rango de bits por peso, desde 2 bits (Q2_K) hasta 16 bits (f16). No hay cuantizaciones weighted/imatrix disponibles por el autor en el momento de publicacion, aunque invita a solicitarlas via Community Discussion.

## Capacidades

- Auditoria de accesibilidad web: deteccion de problemas de cumplimiento WCAG en paginas e interfaces.
- Revision de UI: analisis de capturas de pantalla o maquetas para identificar fallos de diseño y usabilidad.
- Consistencia de diseño: evaluacion de coherencia visual entre componentes y pantallas.
- Capacidades multimodales: acepta imagenes como entrada (evidenciado por los archivos mmproj-Q8_0 y mmproj-f16).
- Generacion de texto conversacional (tag "conversational"), util para informes de auditoria explicativos.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y multi-step reasoning: no disponible (no documentado).

## Casos de uso

- Auditoria automatica de accesibilidad WCAG: integrar el modelo en un pipeline que capture pantallas de una web y genere informes de violaciones de accesibilidad (contraste, jerarquia, alternativas de texto), reduciendo revisiones manuales.
- Revision pre-merge de interfaces en CI/CD: ejecutar el modelo sobre capturas de nuevos componentes de UI antes de fusionar pull requests, detectando inconsistencias de diseño en fases tempranas.
- Control de calidad de design systems: verificar que las pantallas generadas respetan la guia de estilos corporativa, senalando desviaciones de tipografia, espaciado o color.
- Cumplimiento normativo (European Accessibility Act, Section 508): generar evidencia documental de revisiones de accesibilidad para equipos legales y de compliance.
- Herramienta local de consultoria: al caber en una GPU de consumo, consultoras de accesibilidad pueden auditar paginas de clientes sin subir capturas a servicios en la nube, preservando la confidencialidad.
- Asistente conversacional para desarrolladores front-end: los desarrolladores pueden preguntar al modelo por que un elemento falla un criterio WCAG y como corregirlo, combinando imagen y texto en la misma conversacion.
- Formacion en accesibilidad: generar ejemplos didacticos de interfaces con fallos de accesibilidad y explicaciones de los criterios afectados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen metricas de MMLU, HumanEval, GSM8K ni de benchmarks especificos de accesibilidad para este modelo en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos):
  - Q2_K: ~2,1 GB
  - Q4_K_M: ~2,9 GB
  - Q6_K: ~3,7 GB
  - Q8_0: ~4,7 GB
  - f16: ~8,8 GB
  - Anadir ~0,5-0,8 GB si se carga el suplemento multimodal (mmproj), mas la memoria del KV cache segun la longitud de contexto.
- GPU recomendadas: cualquier GPU con 4-6 GB de VRAM para cuants Q4/Q5 (RTX 3060 12 GB, RTX 4060, RTX 4090 con holgura); para f16, una RTX 4090 (24 GB) o similar.
- Consumer GPU: cabe comodamente en GPUs de consumo; incluso puede ejecutarse solo en CPU (llama.cpp) con cuants Q4 gracias a su tamaño de ~2,7-2,9 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, y cualquier runtime compatible con GGUF y mmproj (necesario para la parte de vision). No se indican soportes para vLLM o TGI en este repo (formato GGUF).
- Latencia y throughput: no disponible; al ser un modelo de 4 B cuantizado, se espera inferencia rapida incluso en hardware modesto, pero no hay cifras publicadas.

## Comparativa con modelos similares

No existen datos publicados de rendimiento para esta familia, por lo que la comparativa se limita a caracteristicas tecnicas:

| Modelo | Parametros | Multimodal | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| PageAudit-Qwen3.5-4B | 4,33 B | Si (mmproj) | Apache 2.0 | Accesibilidad WCAG, UI audit | GGUF (este repo) y modelo base en HF |
| Qwen3.5-4B (base generica) | ~4 B | Segun variante | Apache 2.0 | Uso general | Amplia (HF, GGUF) |
| Llama 3.2 3B Vision | 3,2 B | Si | Llama Community License | Uso general con vision | HF, GGUF |

PageAudit-Qwen3.5-4B se diferencia de los modelos genericos de tamaño similar en su fine-tuning especifico para dominio de accesibilidad y diseño, con la ventaja de una licencia Apache 2.0 sin restricciones de uso comercial frente a la licencia comunitaria de Llama.

## Limitaciones y advertencias

- Idioma: la model card declara unicamente el ingles; no hay garantias de rendimiento en castellano ni en otros idiomas, pese a que la familia Qwen suele ser multilingüe.
- Riesgo de alucinacion: al tratarse de un modelo de 4 B especializado mediante fine-tuning, puede generar falsos positivos o negativos en auditorias de accesibilidad; sus informes no sustituyen una revision manual ni herramientas de testing automatizado contrastadas (axe, Lighthouse).
- Contexto: la longitud de ventana de contexto no esta documentada en la informacion disponible; verificarla antes de procesar paginas web completas o multiples capturas.
- Sin benchmarks publicos: no hay forma de verificar objetivamente su precision en deteccion de problemas WCAG antes de desplegarlo.
- Cuantizaciones bajas (Q2_K, Q3_K_S/M): degradan notablemente la calidad, especialmente en tareas finas de analisis visual; se recomiendan Q4_K_M o superiores.
- Licencia: Apache 2.0 permite uso comercial sin restricciones destacables.
- Este repositorio contiene solo cuantizaciones; cualquier problema del modelo base debe reportarse a aixonlab.
- No hay cuantizaciones weighted/imatrix disponibles, lo que podria mejorar la calidad en bits bajos si se publican en el futuro.

## Enlaces

- Repositorio GGUF (este modelo): https://huggingface.co/mradermacher/PageAudit-Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/aixonlab/PageAudit-Qwen3.5-4B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#PageAudit-Qwen3.5-4B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador (nethype GmbH): https://www.nethype.de/
- Paper, blog o demo: no disponible
