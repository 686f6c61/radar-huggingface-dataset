# LiquidAI/LFM2.5-24B-A2B-GGUF

## Resumen

LFM2.5-24B-A2B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Liquid AI dentro de su familia LFM2.5, una generacion de modelos hibridos orientada a despliegue en el borde y en dispositivo. Con 23.971.587.712 parametros totales y solo una fraccion activa por token (la nomenclatura A2B indica aproximadamente 2 mil millones de parametros activos), el modelo busca ofrecer una relacion calidad/coste de inferencia propia de un modelo pequeno con la capacidad de uno mucho mayor. Esta ficha corresponde especificamente al repositorio de pesos cuantizados en formato GGUF, pensado para ejecucion con llama.cpp.

La relevancia del artefacto reside en que incluye checkpoints sometidos a Quantization-Aware Distillation (QAD): variantes Q4_0 y Q2_K_L entrenadas para recuperar la precision perdida por la cuantizacion agresiva. El checkpoint Q2_K_L ocupa 9,5 GB en total, lo que permite ejecutar un modelo de casi 24 mil millones de parametros en hardware de consumo, algo impensable con un transformer denso equivalente. El modelo es multilingue (10 idiomas declarados, incluido el espanol) y se distribuye bajo licencia LFM1.0.

El repositorio acumula 182.024 descargas y 275 likes desde su publicacion en octubre de 2026, lo que lo situa como una de las opciones MoE cuantizadas mas populares para inferencia local. El modelo base es LiquidAI/LFM2.5-24B-A2B y esta version GGUF mantiene compatibilidad con endpoints y con el ecosistema llama.cpp, incluyendo metadatos de muestreo embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con Mixture-of-Experts (familia LFM2, segun model card) |
| Parametros totales | 23.971.587.712 |
| Parametros activos | Aproximadamente 2B (denominacion A2B; valor exacto no disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_0 (QAD), Q2_K_L (QAD, 9,5 GB), mas variantes GGUF del repo (222,9 GB en total) |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it |
| Licencia | LFM1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

Liquid AI describe LFM2.5 como una nueva generacion de modelos hibridos disenados para IA en el borde y despliegue on-device. La nomenclatura A2B y la referencia a "expert weights" en la model card confirman una arquitectura de mezcla de expertos: 23,97 mil millones de parametros totales con aproximadamente 2 mil millones activos por token, lo que reduce de forma drastica el coste computacional por paso de decodificacion. La model card no detalla la composicion exacta de capas hibridas (atencion, convolucional o SSM) ni la proporcion de expertos compartidos frente a enrutados; esos datos no estan disponibles en la informacion proporcionada.

El aspecto tecnico mas destacable de este repositorio es el uso de Quantization-Aware Distillation. Los checkpoints QAD Q4_0 y QAD Q2_K_L fueron entrenados especificamente para recuperar la precision perdida por la cuantizacion. En el caso de Q2_K_L, la mayor parte de los pesos de los expertos se cuantiza a Q2_K (algunas capas a Q4_K) mientras que el resto de pesos, incluidas las embeddings, se mantienen en Q8_0, sumando 9,5 GB. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento y respuesta multilingue en 10 idiomas: ingles, arabe, chino, frances, aleman, japones, coreano, espanol, portugues e italiano.
- Inferencia eficiente por token gracias al enrutamiento MoE con aproximadamente 2B parametros activos.
- Compatibilidad con llama.cpp, incluidos metadatos `general.sampling.*` que aplican automaticamente los parametros de muestreo recomendados (temp 0.1, top-k 50, repeat-penalty 1.05).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades de vision o audio: no disponibles (modelo exclusivamente de texto).
- Modo thinking explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en espanol: el modelo declara soporte de espanol y puede desplegarse con llama.cpp en estaciones de trabajo sin GPU de datacenter, usando el checkpoint Q4_0 QAD para mantener calidad con un coste de memoria moderado.
- Inferencia en dispositivo con recursos muy limitados: el checkpoint QAD Q2_K_L de 9,5 GB permite ejecutar un MoE de casi 24B parametros en equipos con 12-16 GB de memoria unificada o VRAM, un escenario inviable para un modelo denso del mismo tamano.
- Procesamiento por lotes de bajo coste: al activar solo unos 2B parametros por token, el throughput por vatio es favorable para tareas de clasificacion, resumen o extraccion de informacion a gran escala en CPU/GPU modestas.
- Atencion al cliente multilingue: la cobertura de 10 idiomas permite atender consultas en espanol, portugues, frances, aleman o italiano con un unico modelo desplegado en infraestructura propia.
- Prototipado y experimentacion en investigacion: el formato GGUF y la integracion con llama.cpp facilitan pruebas reproducibles con parametros de muestreo embebidos, utiles para comparativas de cuantizacion (Q4_0 frente a Q2_K_L).
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente sobre llama.cpp, los datos no salen del dispositivo, adecuado para sectores regulados que no pueden enviar texto a APIs externas.
- Evaluacion de tecnicas QAD: el repositorio sirve como referencia practica para estudiar cuanto recupera la destilacion consciente de cuantizacion frente a la cuantizacion post-entrenamiento convencional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Checkpoint QAD Q2_K_L: 9,5 GB en disco; requiere al menos ~10-12 GB de memoria para pesos mas overhead de contexto, por lo que cabe en GPUs de consumo con 12 GB (RTX 3060 12GB, RTX 4070) y en equipos Apple Silicon con 16 GB de memoria unificada.
- Checkpoint QAD Q4_0: el tamano exacto no esta disponible en la informacion proporcionada, pero por el ratio tipico de Q4_0 sobre 24B parametros se situa en el rango de 13-15 GB; requiere GPUs de 16 GB o mas (RTX 4080, RTX 4090, A4000).
- Repositorio completo: 222,9 GB, incluye todas las variantes GGUF; no es necesario descargarlo entero.
- GPU recomendadas para produccion: no disponibles de forma explicita; por el perfil MoE de ~2B activos, una A100 o H100 ofreceria margen amplio, pero no hay cifras publicadas de throughput.
- Opciones de despliegue: llama.cpp (soporte oficial en este repo, con `llama-cli -hf`), y por extension cualquier frontend compatible con GGUF (Ollama, LM Studio, servidores basados en llama.cpp). Compatibilidad con vLLM o TGI no confirmada para este artefacto GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-GGUF | 23,97B | ~2B | no disponible | LFM1.0 | GGUF |
| Modelos MoE densos comparables de ~20-30B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos de la misma categoria, por lo que no es posible establecer una comparativa cuantitativa fiable con alternativas concretas.

## Limitaciones y advertencias

- La licencia LFM1.0 es de tipo "other": es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial, ya que puede imponer restricciones adicionales no reflejadas en la model card.
- No se han publicado datos de benchmarks, por lo que el rendimiento real en tareas de razonamiento, codigo o matematicas no puede verificarse a partir de la informacion disponible.
- La cuantizacion Q2_K_L, aunque entrenada con QAD, implica una perdida de precision frente a los pesos completos; no debe asumirse paridad con el modelo base en tareas sensibles.
- La longitud de contexto no esta documentada en este repositorio; conviene consultar la model card del modelo base antes de disenar flujos con contexto largo.
- Riesgo de alucinacion inherente a los modelos generativos; no hay evaluaciones publicadas de fidelidad factual para esta version.
- Sesgos: no se documentan analisis de sesgo en la informacion proporcionada.
- El soporte de tool calling y de agentes no esta confirmado, lo que limita su uso en pipelines que dependan de function calling estructurado.
- El modelo es exclusivamente de texto; no admite vision ni audio.
- El repositorio completo pesa 222,9 GB; descargar variantes indiscriminadamente puede consumir disco y ancho de banda innecesarios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Checkpoint QAD Q4_0: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF/blob/main/LFM2.5-24B-A2B-QAD-Q4_0.gguf
- Checkpoint QAD Q2_K_L: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-GGUF/blob/main/LFM2.5-24B-A2B-QAD-Q2_K_L.gguf
- Playground de Liquid AI: https://playground.liquid.ai/
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Web de Liquid AI: https://www.liquid.ai/
