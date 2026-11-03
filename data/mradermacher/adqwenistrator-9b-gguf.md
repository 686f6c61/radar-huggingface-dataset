# mradermacher/AdQWENistrator-9B-GGUF

## Resumen

AdQWENistrator-9B-GGUF es la versión cuantizada en formato GGUF del modelo DuoNeural/AdQWENistrator-9B, un ajuste fino (fine-tune) de la familia Qwen 3.5 orientado a tareas de administración de sistemas Linux, operación de shell, kernel y programación en ensamblador. El trabajo de cuantización lo firma mradermacher, un publicador habitual de cuantizaciones GGUF para la comunidad de inferencia local, y se distribuye bajo licencia Apache 2.0.

El modelo base cuenta con 8.953.803.264 parámetros (aproximadamente 9B), lo que lo sitúa en la franja de modelos densos de tamaño medio que pueden ejecutarse en hardware de consumo con las cuantizaciones adecuadas. Según las etiquetas del autor, el modelo incorpora técnicas de "abliteration" (eliminación de capas de rechazo) y se presenta como "uncensored", además de estar especializado en dominios técnicos concretos: Linux, sysadmin, kernel y assembly.

La relevancia de esta ficha radica en que ofrece un paquete de cuantizaciones estáticas listas para usar con llama.cpp y herramientas compatibles, cubriendo desde Q2_K (3,9 GB) hasta f16 (18,0 GB), lo que permite desplegar el modelo en un espectro amplio de hardware. No obstante, la información pública disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada, por lo que muchos apartados de esta ficha se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Qwen 3.5, según etiquetas) |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no aplica (modelo denso, no MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura interna del modelo base DuoNeural/AdQWENistrator-9B en la información disponible. Las etiquetas indican que deriva de la familia Qwen 3.5, lo que sugiere una arquitectura transformer decoder-only, pero no se confirma el tipo exacto de atención, la composición de capas ni si incorpora innovaciones como atención lineal o decodificación especulativa. El recuento de parámetros (8.953.803.264) corresponde a un modelo denso de aproximadamente 9B.

En cuanto al entrenamiento, la model card del cuantizador no aporta detalles sobre el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Las etiquetas sí revelan dos aspectos relevantes: por un lado, el modelo está especializado en dominios técnicos (linux, sysadmin, kernel, assembly); por otro, incorpora "abliteration", una técnica de modificación de pesos orientada a eliminar los mecanismos de rechazo del modelo, lo que se refleja en la etiqueta "uncensored". No se dispone de información sobre la metodología exacta de ese proceso ni sobre el volumen de datos de ajuste fino empleados.

## Capacidades

- Generación de texto conversacional en inglés, con orientación a dominios técnicos.
- Asistencia en administración de sistemas Linux: comandos de shell, gestión de servicios, configuración del sistema.
- Soporte para tareas relacionadas con el kernel de Linux y programación en ensamblador (assembly), según las etiquetas del autor.
- Modo "uncensored" derivado de la abliteración: menor tendencia a rechazar peticiones, incluidas las de temática sensible.
- Capacidad de diálogo multi-turno (etiqueta "conversational").
- No se dispone de información que confirme soporte de tool calling, function calling, agentes, visión, audio ni modos de razonamiento explícito ("thinking mode").
- Capacidades multilingües limitadas al inglés según el campo `language` de la model card.

## Casos de uso

- Asistencia en administración de servidores Linux: el modelo puede generar y explicar comandos de shell, scripts de automatización y procedimientos de diagnóstico, aprovechando su ajuste específico en sysadmin y su conocimiento del ecosistema Linux.
- Redacción de scripts de automatización de tareas del sistema: generación de scripts bash, cron jobs y utilidades de monitorización, con explicaciones paso a paso de cada comando.
- Apoyo en depuración de bajo nivel: consultas sobre ensamblador, registros, llamadas al sistema y comportamiento del kernel, útil para desarrolladores de drivers o herramientas de sistema.
- Formación técnica interna: como asistente para equipos de operaciones que necesitan respuestas rápidas sobre configuración de servicios, permisos, redes o gestión de procesos en entornos Linux.
- Generación de documentación técnica: redacción de runbooks, guías de operación y notas de incidentes a partir de descripciones en lenguaje natural.
- Despliegue local en entornos aislados: al distribuirse en GGUF y con licencia Apache 2.0, puede ejecutarse en estaciones de trabajo sin conexión mediante llama.cpp u Ollama, lo que encaja en entornos con requisitos de confidencialidad.
- Exploración de escenarios sin restricciones de rechazo: el modo "uncensored" puede resultar útil en investigación sobre seguridad, análisis de malware controlado o pruebas de robustez, siempre con las salvaguardas organizativas adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, más overhead de contexto):
  - Q2_K (3,9 GB): apto para GPUs de 6 GB o superiores.
  - Q3_K_S / Q3_K_M / Q3_K_L (4,4–5,0 GB): GPUs de 6–8 GB.
  - IQ4_XS / Q4_K_S / Q4_K_M (5,3–5,7 GB): GPUs de 8 GB (RTX 3060 Ti, RTX 4060 Ti, RTX 3070).
  - Q5_K_S / Q5_K_M (6,4–6,6 GB): GPUs de 8–10 GB.
  - Q6_K (7,5 GB): GPUs de 10–12 GB (RTX 3080, RTX 4070).
  - Q8_0 (9,6 GB): GPUs de 12–16 GB (RTX 4080, RTX 4090, A4000).
  - f16 (18,0 GB): GPUs de 24 GB (RTX 3090, RTX 4090, A10G, L4) o superiores.
- GPU recomendadas: RTX 4090, RTX 3090, A100, H100 para las cuantizaciones altas; RTX 3060/4060 Ti para cuantizaciones bajas.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q6_K en tarjetas de 8–12 GB; Q8_0 requiere 12–16 GB y f16 requiere 24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; también es posible usar vLLM o TGI con el modelo base en safetensors, aunque no se confirma soporte explícito.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AdQWENistrator-9B-GGUF | ~9B | no disponible | Apache 2.0 | GGUF | Especializado en Linux/sysadmin, uncensored |
| Qwen2.5-Coder-7B-Instruct (GGUF) | ~7B | 32K (según versión) | Apache 2.0 | GGUF | Referencia en código, comunidad amplia |
| Llama-3.1-8B-Instruct (GGUF) | ~8B | 128K | Llama 3.1 Community | GGUF | Uso general, ecosistema maduro |
| DeepSeek-Coder-V2-Lite (GGUF) | ~16B (MoE) | 128K | DeepSeek License | GGUF | Código, mayor tamaño |

La comparación se ofrece a título orientativo: no se dispone de benchmarks del modelo AdQWENistrator que permitan una comparación cuantitativa rigurosa con estas alternativas. La principal ventaja diferencial del modelo es su especialización declarada en administración de sistemas Linux y su carácter "uncensored", mientras que su desventaja es la ausencia de datos públicos de rendimiento y su limitación al inglés.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de un modelo base con ajuste fino, puede heredar sesgos de los datos de entrenamiento originales.
- Riesgo de alucinación: no evaluado; en tareas de sysadmin y comandos de shell, una alucinación puede traducirse en comandos destructivos, por lo que se recomienda revisión humana antes de ejecutar cualquier salida.
- Limitaciones de idioma: el modelo solo declara soporte de inglés (`language: en`), por lo que su rendimiento en castellano no está garantizado.
- Limitaciones de contexto: no se ha publicado la longitud de contexto soportada; debe verificarse en el modelo base antes de usarlo en conversaciones largas o con documentos extensos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base DuoNeural/AdQWENistrator-9B mantiene la misma licencia y que no existen restricciones adicionales derivadas de los datos de ajuste fino.
- Carácter "uncensored": la abliteración reduce los rechazos del modelo, lo que incrementa el riesgo de generar contenido inapropiado o peligroso; requiere políticas de uso y filtros externos en producción.
- Madurez del ecosistema: con solo 332 descargas y 1 "like" en el momento de la consulta, el modelo tiene una adopción muy baja, lo que limita la disponibilidad de retroalimentación comunitaria y de casos de uso validados.
- Ausencia de benchmarks: no hay datos públicos que permitan estimar su calidad real frente a alternativas establecidas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AdQWENistrator-9B-GGUF
- Modelo base: https://huggingface.co/DuoNeural/AdQWENistrator-9B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/AdQWENistrator-9B-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#AdQWENistrator-9B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
