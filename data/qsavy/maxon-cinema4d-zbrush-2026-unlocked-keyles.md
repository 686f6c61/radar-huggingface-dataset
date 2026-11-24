# Qsavy/maxon-cinema4d-zbrush-2026-unlocked-keyles

## Resumen

La entrada `Qsavy/maxon-cinema4d-zbrush-2026-unlocked-keyles` alojada en Hugging Face no corresponde a un modelo de inteligencia artificial. Se trata de un repositorio que distribuye un supuesto instalador de software de modelado 3D (Maxon Cinema4D y ZBrush 2026) empaquetado como un ejecutable de Windows (`solara-executor-v3-keyless-2026-v1.2.2-win64.exe`) dentro de un archivo ZIP protegido con contraseña. La model card no describe arquitectura, pesos, tokenizador ni pipeline de inferencia; se limita a instrucciones de descarga, extracción y ejecución.

El contenido presenta todos los patrones habituales de una campaña de distribución de malware: binario ejecutable alojado en un repositorio de GitHub de terceros, archivo comprimido con contraseña (técnica usada para evadir el análisis antivirus automático), indicaciones para ejecutar como administrador, instrucciones para desactivar alertas de Windows Defender y SmartScreen, y promesas de "desbloqueo sin licencia" de software comercial de pago. El número de descargas indicado (643K) y la valoración (4.9/5) aparecen como insignias estáticas en el propio README, sin verificación externa.

Desde la perspectiva de evaluación de modelos, esta ficha no puede completarse con datos técnicos reales porque no existen: no hay parámetros, contexto, cuantizaciones ni licencia de modelo. La licencia declarada `mit` en los metadatos es incoherente con el contenido y no debe interpretarse como autorización para ejecutar el binario. Se recomienda no descargar ni ejecutar el archivo y tratar el repositorio como no fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (metadatos del repositorio, no capacidades del modelo) |
| Licencia | mit (declarada en metadatos; incoherente con el contenido) |
| Formato de pesos | no disponible (el artefacto es un `.exe` de Windows dentro de un `.zip`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado. El artefacto principal es un ejecutable binario para Windows x64 (`solara-executor-v3-keyless-2026-v1.2.2-win64.exe`, build `v1.4.9`), distribuido dentro de un ZIP de 4,8 MB con contraseña `2026`. La model card menciona subsistemas como "zero watermarks", "offline licensing", "non-destructive backup" y "full workstation unlock", pero son descripciones de marketing sin respaldo técnico verificable ni código fuente publicado.

No hay información sobre dataset, tokens de entrenamiento, RLHF, DPO ni innovaciones de inferencia. La etiqueta `maxon-cinema4d-zbrush-2026-unlocked-keyless` y los enlaces apuntan a repositorios de GitHub de terceros (`schneider6972`, `fatmatamkoc458`) ajenos a Maxon, lo que refuerza la naturaleza no oficial del contenido.

## Capacidades

- No es un modelo de lenguaje: no genera texto, código, matemáticas ni razonamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; los idiomas listados son etiquetas de metadatos.
- No ofrece thinking mode, visión, audio ni ninguna modalidad de inferencia.
- El único "capacidad" descrita es la ejecución de un instalador en Windows 10/11 x64.

## Casos de uso

- Ninguno legítimo en el ámbito de IA open source. El repositorio no contiene un modelo desplegable en vLLM, llama.cpp, Ollama ni TGI.
- No es adecuado para atención al cliente, generación de código, análisis de documentos ni pipelines de datos.
- No es adecuado para investigación en NLP, visión por computador ni evaluación de benchmarks.
- No debe integrarse en entornos de producción, CI/CD ni flujos de trabajo empresariales.
- No debe usarse como base para fine-tuning ni destilación.
- Su único uso posible es el que declara la model card (instalar software de modelado 3D), y ese uso conlleva riesgos de seguridad no evaluados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas de inferencia, porque no hay modelo que evaluar.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; el artefacto es un ejecutable de Windows.
- Requisitos del binario declarados en la model card: Windows 10 (22H2) o Windows 11 (24H2), arquitectura x64.
- Latencia y throughput: no disponibles y no significativos en este contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Qsavy/maxon-cinema4d-zbrush-2026-unlocked-keyles` | no disponible | no disponible | mit (declarada) | Repositorio Hugging Face con binario externo |
| Modelo de IA open source real (p. ej. familia Llama, Qwen, Mistral) | miles de millones | 8K–128K+ | licencias específicas | Pesos safetensors/GGUF verificables |
| Modelo de código abierto pequeño (p. ej. familia Gemma, Phi) | 2B–9B | 8K–32K | licencias específicas | Pesos verificables |

No existe comparación técnica posible: el repositorio no es un modelo y no comparte categoría con ningún modelo de IA. Cualquier comparación de parámetros, contexto o rendimiento carece de sentido.

## Limitaciones y advertencias

- No es un modelo de IA; la ficha se completa por rigor documental, no porque exista un artefacto evaluable.
- Riesgo alto de malware: ejecutable alojado en GitHub de terceros, ZIP con contraseña para evadir análisis, instrucciones para ejecutar como administrador y para sortear Defender/SmartScreen.
- Suplantación de marca: Maxon no aparece como autor ni distribuidor; los repositorios enlazados no son oficiales.
- La licencia `mit` declarada no otorga derechos sobre el software comercial de Maxon ni garantiza la seguridad del binario.
- Sesgos y alucinación: no aplica al no haber modelo; la model card contiene afirmaciones no verificables (cifras de descargas, valoración, "96.9% consistency").
- No usar en producción, ni en equipos con datos sensibles, ni en entornos corporativos.
- Si se ha descargado o ejecutado el binario, se recomienda analizarlo con herramientas de seguridad y revisar el sistema en busca de persistencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Qsavy/maxon-cinema4d-zbrush-2026-unlocked-keyles
- Repositorio GitHub citado en la model card: https://github.com/schneider6972/solara-executor-v3-keyless-2026
- Repositorio GitHub citado en la model card: https://github.com/fatmatamkoc458/maxon-cinema4d-zbrush-2026-unlocked-keyless
- Enlace de descarga directa citado en la model card (no recomendado): https://github.com/schneider6972/solara-executor-v3-keyless-2026/releases/download/v1.2.0/solara-executor-v3-keyless-2026-v1.2.2-win64.zip
