# chenyumo/moziAI-35B-A3B-MOE-MTP-Uncensored

## Resumen

MoziAI-35B-A3B-MOE es un modelo de lenguaje multimodal de codigo abierto desarrollado por el equipo del influencer financiero chino Chen Yumo, especializado en el dominio financiero. Esta basado en el modelo fundacional Ornith-1.5-35B-A3B (arquitectura Qwen3.5-35B-A3B / Qwen3.6-35B-A3B, con licencia MIT) y ha sido afinado y destilado para tareas financieras verticales, incluyendo analisis de mercado, programacion cuantitativa, generacion de informes y llamada a herramientas. El modelo soporta entrada multimodal (vision) y es compatible con frameworks de inferencia locales como llama.cpp, Ollama y LM Studio.

La caracteristica mas destacada es su tecnologia propietaria de cuantizacion inteligente **MoziSmartBit**, que comprime los 35.000 millones de parametros del modelo MoE a aproximadamente 15,5 GB, manteniendo una calidad de precision cercana al 99 % respecto al modelo original. Con una ventana de contexto de 256K tokens, esta disenado para desplegarse en GPUs de consumo (20-24 GB de VRAM) y ofrece una velocidad de inferencia de 140+ tokens/s en GPUs AMD R9700 y 70+ tokens/s en APUs AMD MAX+395. La version "Uncensored" elimina las restricciones de censura de contenido, lo que permite discusiones sin filtros sobre cualquier tema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5/3.6-35B-A3B (Ornith-1.5) |
| Parametros totales | 34.660.610.688 (~35B) |
| Parametros activos | 3B (8 expertos activos de 256 expertos enrutados + 1 experto compartido) |
| Longitud de contexto | 256K tokens (262.144) |
| Tipos de cuantizacion | MoziSmartBit (cuantizacion inteligente propietaria) + GGUF estandar |
| Idiomas soportados | Chino (zh), ingles (en), y 201 idiomas y dialectos adicionales (segun el autor) |
| Licencia | other (no especificada en detalle; el modelo base Ornith es MIT, pero esta version tiene licencia propia) |
| Formato de pesos | GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo usa una arquitectura de Mezcla de Expertos (MoE) con 256 expertos enrutados y 1 experto compartido, activando 8 expertos por token. Esta configuracion permite mantener un coste computacional bajo (3B parametros activos) mientras se conserva la capacidad de un modelo de 35B parametros. El modelo base es Ornith-1.5-35B-A3B, una variante de la familia Qwen3.5/3.6, que ya incorpora capacidades de razonamiento encadenado (chain-of-thought) y soporte multimodal.

El entrenamiento se realizo mediante un proceso de afinacion y destilacion desde el modelo base, con un enfasis especial en el dominio financiero. La innovacion principal es la tecnologia **MoziSmartBit**, un metodo de cuantizacion inteligente que reduce el tamaño del modelo de 35B a aproximadamente 15,5 GB manteniendo una precision casi sin perdidas (~99%). El modelo fue entrenado para soportar llamadas a herramientas (tool calling) y tareas de orquestacion multi-turno, lo que lo hace adecuado para integracion en frameworks de agentes como OpenClaw, Hermes, OpenCode o Claude Code. No se han publicado detalles sobre el numero de tokens de entrenamiento ni la composicion del dataset en la informacion disponible.

## Capacidades

- **Generacion de texto y razonamiento**: produce texto coherente y realiza razonamiento multi-paso, incluyendo analisis financiero complejo.
- **Codigo y programacion**: genera, depura y disena arquitecturas de software en Python, JS, TS, Go, Rust y otros lenguajes; incluye programacion cuantitativa financiera.
- **Vision multimodal**: comprende imagenes, capturas de pantalla y entrada visual local.
- **Tool calling**: integra con fuentes de datos financieras en tiempo real, bases de datos y sistemas de recuperacion de informes.
- **Capacidades multilingues**: soporta 201 idiomas y dialectos, con capacidades mejoradas en chino.
- **Razonamiento encadenado (chain-of-thought)**: entrenado para mejorar la calidad del razonamiento.
- **Modo "Uncensored"**: sin censura de contenido, permite discutir temas sensibles o controversiales sin restricciones de seguridad.
- **Soporte multi-agente**: integracion nativa con frameworks de agentes y IDEs (OpenClaw, Hermes, Cursor, Windsurf, Claude Code, Codex).
- **Contexto largo**: maneja tareas de hasta 256K tokens, util para analisis de documentos extensos y conversaciones multi-turno.

## Casos de uso

- **Analisis financiero local**: analizar informes trimestrales, interpretar indicadores financieros clave y generar resumenes de investigacion. El modelo puede procesar documentos largos gracias a su ventana de 256K tokens, permitiendo analizar multiples informes en una sola pasada.
- **Desarrollo de estrategias cuantitativas**: disenar estrategias de trading, implementar logicas de backtesting y construir factores. Su soporte de tool calling permite conectarse a librerias de datos financieros y ejecutar codigo de forma interactiva.
- **Atencion al cliente financiera automatizada**: gestionar conversaciones multi-turno sobre productos financieros, evaluar riesgos y proporcionar informacion de compliance. Su capacidad multilingue permite atender a clientes en distintos idiomas.
- **Generacion de codigo en produccion**: integrarse en pipelines de CI/CD para generar y depurar codigo, o como asistente de programacion en IDEs como Cursor o Windsurf. Su soporte de tool calling permite interactuar con sistemas de control de versiones y APIs.
- **Investigacion de mercado y generacion de articulos**: crear informes de investigacion, analisis de mercado y articulos tecnicos de alta calidad en multiples idiomas, sin restricciones de contenido.
- **Despliegue local con privacidad**: procesar datos financieros sensibles en local, sin depender de servicios en la nube, manteniendo la privacidad de los datos y reduciendo costes de tokens en la nube.
- **Educacion y formacion**: explicar conceptos financieros complejos, generar ejercicios de programacion y proporcionar tutorias personalizadas sin filtros de contenido.
- **Analisis de imagenes y capturas de pantalla**: extraer informacion de graficos, diagramas y capturas de pantalla de plataformas de trading para su analisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no proporciona datos de evaluacion comparativa (MMLU, HumanEval, GSM8K, etc.). La informacion disponible se limita a las especificaciones de velocidad de inferencia (140+ tokens/s en AMD R9700, 70+ tokens/s en AMD MAX+395) y a la afirmacion de precision ~99% respecto al modelo base, sin datos de evaluacion independientes.

## Requisitos de hardware

- **VRAM estimada**: 16 GB para el modelo cuantizado (15,5 GB) con vision; 20 GB+ para ejecucion completa en GPU de consumo; 24 GB recomendados para vision y contexto largo (256K).
- **GPUs recomendadas**: RTX 4060 Ti 16 GB (con offload a CPU), RTX 4090, AMD R9700, AMD MAX+395 iGPU (con 70+ tokens/s).
- **Compatibilidad con consumer GPUs**: si, modelos con 16-24 GB de VRAM pueden ejecutarlo, aunque el contexto largo puede requerir offload a CPU.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, Jan; compatible con frameworks de agentes como OpenClaw, Hermes, OpenCode, Cursor, Windsurf, Claude Code.
- **Latencia y throughput**: 140+ tokens/s en AMD R9700, 70+ tokens/s en AMD MAX+395 iGPU (datos proporcionados por el autor, no verificados de forma independiente).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoziAI-35B-A3B-MOE | 35B (3B activos) | 256K | MoE (Qwen3.5/3.6) | Otro (propietaria) | Hugging Face, ModelScope |
| Qwen3-32B | 32B | 128K | Dense | Apache 2.0 | Hugging Face |
| Mixtral 8x7B | 46,7B (12,9B activos) | 32K | MoE | Apache 2.0 | Hugging Face |

No se dispone de datos comparativos de rendimiento entre estos modelos, ya que no se han publicado benchmarks en la informacion proporcionada. La comparativa se limita a especificaciones tecnicas.

## Limitaciones y advertencias

- **Licencia no estandarizada**: la licencia es "other", lo que puede implicar restricciones de uso comercial no claras. El modelo base es MIT, pero la version afinada tiene una licencia propia no especificada.
- **Riesgo de alucinacion**: como todo LLM, puede generar informacion incorrecta o inventada, especialmente en contextos financieros donde la precision es critica. No se han publicado evaluaciones de fiabilidad.
- **Sin censura**: la version "Uncensored" puede generar contenido inapropiado, ofensivo o ilegal. Su uso en produccion requiere medidas de seguridad adicionales y puede incurrir en responsabilidades legales.
- **Limitaciones de contexto**: aunque soporta 256K tokens, la ejecucion con contexto largo en GPUs de consumo requiere offload a CPU, lo que puede degradar la velocidad de inferencia.
- **Dependencia de la informacion del autor**: las especificaciones de velocidad (140+ tokens/s) y precision (~99%) son afirmaciones del autor, no verificadas por terceros.
- **Riesgo de sesgo**: el modelo se centra en el dominio financiero chino, lo que puede generar sesgos hacia el mercado chino (A-shares, HK, etc.) y no generalizar bien a otros mercados.
- **Requisitos de hardware para vision**: aunque soporta vision, se recomienda 24 GB de VRAM para un rendimiento optimo, lo que limita su uso en GPUs de 16 GB.

## Enlaces

- [HuggingFace - chenyumo/moziAI-35B-A3B-MOE-MTP-Uncensored](https://huggingface.co/chenyumo/moziAI-35B-A3B-MOE-MTP-Uncensored)
- [GitHub - moziAI](https://github.com/chenyumo166/moziAI)
- [GitHub - moziAI-35B-Qwen3.6-35B-A3B-Ornith](https://github.com/chenyumo166/moziAI-35B-Qwen3.6-35B-A3B-Ornith)
- [ModelScope - moziAI-35B-A3B-MOE-MTP-Uncensored](https://www.modelscope.cn/models/chenyumo/moziAI-35B-A3B-MOE-MTP-Uncensored)
- [HuggingFace - README en chino tradicional](https://huggingface.co/chenyumo/moziAI-35B-Qwen3.6-35B-A3B-Ornith/blob/main/README.zh-hant.md)
