# ReadyArt/gemma-4-31B-it-scotoma-2-GGUF

## Resumen

Gemma-4-31B-it-scotoma-2-GGUF es una cuantización en formato GGUF del modelo ReadyArt/gemma-4-31B-it-scotoma-2, un ajuste fino de la familia Gemma 4 de Google en su variante instruct de 31B. El autor del artefacto es ReadyArt, que publica tanto el modelo base ajustado como esta versión cuantizada orientada a inferencia local. El modelo resuelve el problema de desplegar un LLM conversacional de gran tamano en hardware de consumo o en entornos sin GPUs de datacenter, manteniendo el comportamiento del ajuste original.

El modelo cuenta con 30.697.345.596 parametros totales según los pesos en safetensors del modelo base, lo que lo situa en la franja de 31B. La licencia declarada es Apache 2.0, aunque la model card enlaza a la licencia especifica de Gemma 4 de Google, lo que introduce una ambiguedad relevante para uso comercial que conviene verificar. El repositorio ocupa 228,3 GB, coherente con un modelo de este tamano distribuido en multiples niveles de cuantización.

La relevancia actual de esta ficha radica en que combina un ajuste fino comunitario con cuantizaciones GGUF generadas mediante imatrix, una tecnica que mejora la calidad de los cuantizados de baja precision. Esto lo hace atractivo para desarrolladores que quieren ejecutar un modelo conversacional de 31B en local con llama.cpp u Ollama sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4, inferido del nombre y modelo base; no confirmado en la informacion disponible) |
| Parametros totales | 30.697.345.596 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantizacion asistida por imatrix (niveles concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a la licencia Gemma 4 de Google) |
| Formato de pesos | GGUF (repo); safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base ReadyArt/gemma-4-31B-it-scotoma-2. Por el nombre y la familia se infiere una arquitectura transformer decoder-only propia de Gemma 4 en variante instruct de 31B, pero no se confirma en la documentacion proporcionada. El ajuste "scotoma-2" es un fine-tuning comunitario sobre esa base instruct; no se especifican los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion tecnica documentada en este artefacto es el uso de imatrix para la cuantizacion GGUF. Esta tecnica calcula una matriz de importancia por tensor a partir de datos de calibracion, lo que permite asignar mas bits a los pesos mas sensibles y reducir la perdida de calidad en niveles de cuantizacion bajos. El repositorio incluye ademas una tarjeta visual con casos de presentacion, lo que sugiere que el autor documenta el comportamiento del modelo en escenarios conversacionales concretos.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Ajuste instruct, por lo que se espera seguimiento de instrucciones y formato de dialogo (no verificado en la informacion disponible).
- Compatibilidad con endpoints, segun la etiqueta `endpoints_compatible`.
- Razonamiento, codigo y matematicas: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Asistente conversacional local: al estar en GGUF, puede ejecutarse con llama.cpp u Ollama en una estacion de trabajo y gestionar dialogos multi-turno sin enviar datos a terceros, lo que resulta adecuado para entornos con requisitos de privacidad.
- Prototipado de aplicaciones de chat: el formato GGUF y la etiqueta `endpoints_compatible` permiten levantar un servidor compatible con la API de OpenAI y conectar frontends existentes sin reescribir la capa de integracion.
- Evaluacion de ajustes finos comunitarios: util para investigadores que quieran comparar el comportamiento del ajuste scotoma-2 frente al Gemma 4 instruct original en tareas de dialogo, usando el mismo backend de inferencia.
- Despliegue en hardware de consumo: con cuantizaciones de 4 bits, un modelo de 31B puede caber en GPUs de 24 GB, lo que habilita casos de uso de escritorio que antes requerían servidores.
- Generacion de texto en pipelines internos: integrable en flujos de procesamiento por lotes con llama.cpp, siempre que la licencia se aclare para el uso comercial previsto.
- Base para nuevos ajustes finos: el modelo base en safetensors y esta version GGUF sirven como punto de partida para adaptaciones con LoRA en dominios especificos, reutilizando el trabajo de cuantizacion ya publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; para 30,7B parametros, una cuantizacion de 4 bits ronda los 16-18 GB de pesos, una de 5-6 bits los 20-24 GB y una de 8 bits los 30-33 GB (estimaciones por tamano, no confirmadas por el autor).
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cabria esperar uso en A100 40/80 GB, H100 y RTX 4090 para cuantizaciones bajas, pero no se confirma.
- Cabe en GPU de consumo: probable en RTX 4090 (24 GB) con cuantizaciones de 4-5 bits; no confirmado por el autor.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM y TGI no soportan GGUF de forma nativa, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ReadyArt/gemma-4-31B-it-scotoma-2-GGUF | 30,7B | no disponible | apache-2.0 (con enlace a Gemma 4) | GGUF | Ajuste comunitario con imatrix |
| Gemma 4 31B instruct (original) | ~31B | no disponible | licencia Gemma de Google | safetensors | Base del ajuste; referencia de comparacion |
| Alternativas de ~30B en GGUF | no disponible | no disponible | no disponible | GGUF | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- La licencia presenta ambiguedad: el campo declara apache-2.0 pero la model card enlaza a la licencia Gemma 4 de Google, que impone restricciones adicionales; conviene verificar antes de un uso comercial.
- No se documentan los idiomas soportados, por lo que el rendimiento en castellano no esta garantizado.
- No se especifica la longitud de contexto, un dato critico para aplicaciones con documentos largos.
- Al ser un ajuste fino comunitario, puede heredar sesgos del modelo base y del dataset de ajuste, no documentado.
- Riesgo de alucinacion inherente a los LLM; no se han publicado evaluaciones de fidelidad para este ajuste.
- Las cuantizaciones GGUF, incluso con imatrix, introducen perdida de calidad respecto a los pesos originales en safetensors.
- El repositorio de 228,3 GB requiere espacio en disco considerable si se descargan varios niveles de cuantizacion.
- No hay benchmarks publicados que permitan validar el rendimiento frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-2-GGUF
- Modelo base: https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma-2
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
