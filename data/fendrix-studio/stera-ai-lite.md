# Fendrix-Studio/Stera-AI-Lite

## Resumen

Stera-AI-Lite es una distribucion cuantizada y adaptada del modelo Qwen/Qwen3.5-2B, publicada por Fendrix-Studio bajo el nombre comercial Stera AI Lite V14. Se distribuye exclusivamente en formato GGUF e incluye dos artefactos: el modelo de lenguaje principal en cuantizacion Q4_K_M y un proyector de vision en F16 (`mmproj-Stera-Lite_F16.gguf`), lo que habilita entrada multimodal de imagen y texto. El repositorio tiene 5,7 GB y acumula 317 descargas.

El modelo declara 1.543.714.304 parametros reales en safetensors, aunque el modelo base referenciado es Qwen3.5-2B, por lo que la cifra efectiva queda por debajo de los 2B nominales. La relevancia practica de esta ficha es limitada: no hay model card tecnica detallada, no se documentan idiomas soportados ni pipeline, y los benchmarks publicados por el autor comparan un modelo de 2B contra modelos de 32B y frontier, con resultados muy inferiores en todas las metricas.

La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales conocidas. El modelo esta orientado a inferencia local en equipos de consumo mediante LM Studio o llama.cpp, y su interes principal es como ejemplo de adaptacion multimodal ligera mas que como alternativa competitiva en tareas agenticas o de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-2B); vision-language con proyector multimodal |
| Parametros totales | 1.543.714.304 (safetensors); modelo base nominal 2B |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (modelo principal); F16 (proyector de vision) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (model-Stera-Lite-Q4_K_M.gguf, mmproj-Stera-Lite_F16.gguf) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo se basa en Qwen/Qwen3.5-2B, un transformer denso de aproximadamente 2B parametros, y que incorpora un proyector de vision en F16 para habilitar capacidades multimodales (vision-language). No se documenta el proceso de entrenamiento: no hay datos sobre numero de tokens, composicion del dataset, fases de alineacion (RLHF, DPO o similares), ni sobre si el proyector de vision fue entrenado por Fendrix-Studio o heredado de otro modelo.

Tampoco se especifica la innovacion tecnica del proyector, la resolucion de imagen soportada, el numero de tokens visuales por imagen ni la estrategia de fusion entre modalidades. La unica informacion operativa es que el proyector F16 es obligatorio para habilitar el analisis de imagenes en LM Studio o en la aplicacion propia del autor.

## Capacidades

- Generacion de texto conversacional en formato chat.
- Analisis de imagenes mediante el proyector multimodal F16 (vision-language).
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repositorio).
- Soporte de cuantizacion GGUF para inferencia local en CPU y GPU.
- Capacidades de codigo y tareas agenticas: el autor publica metricas en benchmarks de coding y agentes, aunque con resultados muy bajos (ver seccion de benchmarks).
- Soporte de tool calling / function calling: no documentado explicitamente.
- Soporte de agentes multi-paso: no documentado; los benchmarks de agente publicados sugieren capacidad muy limitada.
- Capacidades multilingues: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Asistente conversacional local en equipos de consumo: el modelo en Q4_K_M ocupa aproximadamente 1 GB, por lo que puede ejecutarse en portatiles sin GPU dedicada mediante LM Studio o llama.cpp, con latencia baja para respuestas cortas.
- Descripcion y analisis basico de imagenes en local: gracias al proyector F16, permite tareas como etiquetado de imagenes, extraccion de texto visible o respuesta a preguntas simples sobre una fotografia sin enviar datos a la nube.
- Prototipado de aplicaciones multimodales: util para validar pipelines de vision-lenguaje antes de migrar a modelos mayores, dado su bajo coste de despliegue y su licencia permisiva.
- Filtrado y clasificacion de contenido en entornos con privacidad estricta: al ejecutarse integramente en local, es adecuado para procesar documentos o imagenes sensibles que no pueden salir del dispositivo.
- Educacion y demos: su tamano reducido permite desplegarlo en aulas, talleres o entornos de formacion donde no hay infraestructura GPU disponible.
- Pruebas de integracion con la aplicacion Stera AI: el modelo es el backend oficial de la aplicacion del autor (anunciada como proximamente disponible), por lo que sirve para evaluar ese ecosistema.
- Tareas de codigo o agenticas en produccion: no recomendado; los benchmarks publicados por el propio autor muestran valores de 11,5 a 24,8 en las metricas evaluadas, muy por debajo de alternativas de mayor tamano.

## Benchmarks y rendimiento

Los unicos datos disponibles son los publicados por el autor en la model card. No se especifica la metodologia de evaluacion ni si son resultados propios o estimaciones.

| Metrica / Benchmark | Stera-AI Lite (2B) | Qwen3-32B | DeepSeek-V4-Flash | Claude Opus 5 |
|---|---|---|---|---|
| Agentic coding (DeepSWE 1.1) | 11,5 | 31,5 | 54,4 | 57,2 |
| Agentic coding (SWE-bench Pro) | 16,8 | 55,8 | 56,0 | 58,1 |
| Multilingual software engineering (SWE-bench Multilingual) | 22,4 | 75,8 | no disponible | 79,4 |
| Repo-level code generation (NL2Repo-Bench) | 15,7 | 41,1 | 54,2 | 50,8 |
| Long-horizon office work (CoWorkBench) | 20,3 | 65,1 | 45,1 | 71,3 |
| Professional job tasks (JobBench) | 12,4 | 27,6 | 41,3 | 39,8 |
| Frontier agentic tasks (Agents' Last Exam) | 10,1 | 33,6 | no disponible | 38,5 |
| Real-world tool use (Toolathlon Verified) | 24,8 | 50,6 | 70,3 | 73,1 |

No se han publicado resultados en benchmarks clasicos como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1-1,5 GB con la cuantizacion Q4_K_M del modelo principal, mas el proyector de vision en F16 (varios cientos de MB adicionales).
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre; RTX 3060, RTX 4060, RTX 4090 o superiores funcionan sin problema. Tambien puede ejecutarse en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada de los ultimos anos, e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: LM Studio (documentado por el autor), llama.cpp, Ollama (previa conversion o importacion del GGUF) y aplicacion propia Stera AI (anunciada como proximamente disponible). vLLM y TGI no soportan GGUF de forma nativa sin conversion.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Stera-AI-Lite | 1,54B (nominal 2B) | no disponible | Apache 2.0 | GGUF | Multimodal con proyector F16; benchmarks agenticos bajos |
| Qwen/Qwen3.5-2B | 2B (nominal) | no disponible | no disponible | safetensors | Modelo base del que deriva Stera-AI-Lite |
| Qwen2.5-VL-3B | 3B | 32K (segun documentacion publica de la familia) | Apache 2.0 | safetensors, GGUF | Alternativa multimodal de tamano similar con soporte amplio de comunidad |
| Llama 3.2 3B Instruct | 3B | 128K (segun documentacion publica) | Llama 3.2 Community License | safetensors, GGUF | Alternativa de texto de tamano comparable, sin vision en la variante 3B |

La comparativa se limita a parametros, contexto y licencia porque no hay datos de rendimiento comparables publicados para Stera-AI-Lite fuera de los benchmarks del propio autor.

## Limitaciones y advertencias

- Los benchmarks publicados por el autor comparan un modelo de 2B contra modelos de 32B y frontier, lo que produce una impresion de rendimiento relativo baja y ademas carece de contexto metodologico (no se indica si son evaluaciones propias, con que prompts ni con que version del modelo).
- No se documentan sesgos conocidos, pero al derivar de Qwen3.5-2B hereda los sesgos del modelo base, que no se detallan.
- Riesgo de alucinacion elevado en tareas de codigo, agentes y uso de herramientas, coherente con los resultados publicados (10-25 puntos sobre 100 en las metricas agenticas).
- No se especifica la longitud de contexto soportada, lo que impide planificar casos de uso con documentos largos.
- No se declaran idiomas soportados; el modelo base Qwen suele tener buen soporte de chino e ingles, pero no hay confirmacion para castellano.
- La licencia Apache 2.0 permite uso comercial, pero el autor no aclara si el proyector de vision tiene la misma licencia o si deriva de otro modelo con condiciones distintas.
- La model card mezcla el nombre "Stera AI Lite V14" con "Stera-AI-Lite" y referencia un modelo base no verificado publicamente (Qwen/Qwen3.5-2B), lo que dificulta la trazabilidad.
- La aplicacion propia del autor esta marcada como "proximamente disponible", por lo que la unica via de uso verificada es LM Studio o llama.cpp.
- No hay informacion sobre el proceso de entrenamiento del proyector de vision ni sobre la calidad de las respuestas multimodales.

## Enlaces

- Hugging Face: https://huggingface.co/Fendrix-Studio/Stera-AI-Lite
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.5-2B
- Web del autor: https://fendrixstudio.netlify.app/
- Aplicacion Stera AI (proximamente): https://stera-ai-fendrix-studio.netlify.app/
- LM Studio: https://lmstudio.ai
