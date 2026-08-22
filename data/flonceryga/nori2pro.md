# Flonceryga/Nori2PRO

## Resumen

Nori2PRO es un modelo de lenguaje multimodal de 4.326.350.848 parametros (~4,3B) desarrollado por el autor Flonceryga, basado en el modelo Qwen3.5-4B. El modelo ha sido ajustado y convertido a formato GGUF mediante la libreria Unsloth, lo que permite su ejecucion en llama.cpp y en runtimes compatibles como Ollama. El repositorio incluye un fichero de proyector multimodal (mmproj) en F16, lo que indica que el modelo tiene capacidades de vision-lenguaje ademas de generacion de texto conversacional.

La relevancia de este modelo reside en su tamano compacto (4,3B), que permite ejecutarlo en hardware de consumo, y en su formato GGUF, que facilita el despliegue local sin infraestructura de nube. No obstante, la informacion disponible es muy limitada: no se publican datos sobre el proceso de ajuste, el dataset utilizado, la licencia, los idiomas soportados ni la longitud de contexto. El modelo se publico el 22 de agosto de 2026 y cuenta con cero descargas, por lo que no ha sido validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5-4B (detalles internos no disponibles) |
| Parametros totales | 4.326.350.848 (~4,3B) |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (modelo principal), F16 (proyector multimodal) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-4B, un transformer de 4,3 mil millones de parametros de la familia Qwen. La informacion proporcionada no detalla la arquitectura interna exacta (numero de capas, dimensiones de atencion, tipo de atencion), pero por el tamano y la familia se trata de un transformer decoder-only. El repositorio incluye un fichero de proyector multimodal (mmproj) en F16, lo que confirma que el modelo integra un encoder de vision conectado al modelo de lenguaje.

El ajuste se realizo con Unsloth, una libreria que acelera el fine-tuning y la conversion a GGUF. No se han publicado datos sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. La cuantizacion Q4_K_M del modelo principal es una configuracion estandar para GGUF que equilibra tamano y calidad, mientras que el proyector multimodal se mantiene en F16 para preservar la fidelidad de las representaciones visuales.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" y puede mantener dialogos multi-turno.
- Vision-lenguaje: gracias al proyector multimodal (mmproj), puede procesar imagenes junto con texto, aunque no se especifican las tareas concretas de vision soportadas.
- Ejecucion local eficiente: el formato GGUF permite ejecutarlo en CPU o GPU de gama media mediante llama.cpp.
- Compatibilidad con herramientas de llama.cpp: se puede usar con llama-cli para texto y llama-mtmd-cli para tareas multimodales.
- Compatibilidad con Ollama: al ser GGUF, puede importarse en Ollama para despliegue simplificado.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni modo thinking.

## Casos de uso

- Asistentes de atencion al cliente en local: el modelo puede gestionar conversaciones multi-turno en un entorno local sin depender de servicios en la nube, gracias a su tamano de 4,3B y su formato GGUF. Es adecuado para empresas que necesitan privacidad de datos.
- Analisis de documentos con imagen: puede procesar documentos escaneados o capturas de pantalla gracias a su componente de vision, en escenarios como extraccion de informacion de facturas o formularios.
- Prototipado de aplicaciones de IA: su tamano reducido y formato GGUF facilitan la iteracion rapida en entornos de desarrollo, integrando el modelo en aplicaciones de chat o analisis de texto con recursos modestos.
- Despliegue en dispositivos de bajo consumo: puede ejecutarse en mini PCs, servidores de gama baja o dispositivos de edge computing con 8 GB de RAM o VRAM, gracias a la cuantizacion Q4_K_M.
- Integracion en pipelines de llama.cpp: se puede usar como parte de un sistema de generacion de texto o vision-lenguaje en aplicaciones de linea de comandos o servidores de inferencia locales.
- Evaluacion de modelos de vision-lenguaje compactos: el modelo ofrece un punto de partida para probar capacidades de vision-lenguaje en un tamano de 4B, comparandolo con alternativas de la misma categoria antes de decidir un despliegue en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de evaluacion sobre tareas como MMLU, HumanEval, GSM8K ni sobre rendimiento de vision-lenguaje.

## Requisitos de hardware

- VRAM estimada: con la cuantizacion Q4_K_M, los pesos del modelo principal ocupan aproximadamente 2,2-2,5 GB (4,3B x 4 bits / 8). El proyector multimodal en F16 puede anadir entre 0,5-1 GB. Con overhead de activaciones y KV cache, se estima un uso total de VRAM entre 4 y 8 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM, como una RTX 3060, RTX 4060, GTX 1660 Ti o una RTX 2080. Para tareas multimodales, se recomienda al menos 8 GB de VRAM.
- Ejecucion en CPU: es viable mediante llama.cpp, con rendimiento funcional para textos cortos, aunque la velocidad sera menor que con GPU.
- Opciones de despliegue: llama.cpp, llama-mtmd-cli, llama-server, Ollama, llama-cpp-python o cualquier runtime compatible con GGUF.
- Latencia y throughput: no se disponen de datos publicados. Como referencia, un modelo de 4,3B en Q4_K_M suele generar entre 10 y 40 tokens/s en una GPU de gama media, pero estos valores no estan confirmados para este modelo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de evaluaciones comparativas con otros modelos. Como referencia estructural, el modelo base Qwen3.5-4B se puede comparar con otros modelos de tamano similar como Qwen2.5-3B, Phi-3-mini (3,8B) o Llama-3.2-3B, pero no hay datos publicados de Nori2PRO para establecer una comparacion rigurosa.

| Modelo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| Nori2PRO (Qwen3.5-4B) | 4,3B | No disponible | GGUF | No disponible |
| Qwen2.5-3B | 3,1B | 32K tokens | Safetensors, GGUF | Apache 2.0 |
| Phi-3-mini | 3,8B | 128K tokens | Safetensors, GGUF | MIT |
| Llama-3.2-3B | 3,2B | 128K tokens | Safetensors, GGUF | Llama 3.2 Community License |

## Limitaciones y advertencias

- No se publica la licencia del modelo, por lo que no se puede garantizar su uso comercial ni la redistribucion.
- El modelo tiene 0 descargas y 0 likes, lo que indica que no ha sido probado ni validado por la comunidad.
- No se especifican los idiomas soportados, lo que limita la planificacion de aplicaciones multilingues.
- No se especifica la longitud de contexto, lo que puede afectar a aplicaciones que requieran contexto largo o conversaciones extensas.
- No se han publicado datos sobre sesgos, alucinaciones ni riesgos de seguridad. Como cualquier modelo de lenguaje, puede generar contenido incorrecto o sesgado.
- El proyector multimodal se distribuye en F16, lo que puede requerir mas VRAM que el modelo principal cuantizado.
- La model card es extremadamente limitada: no hay informacion sobre el dataset de entrenamiento, las tecnicas de alineacion ni el proceso de cuantizacion.
- El modelo se publico el 22 de agosto de 2026 y no ha sido validado por la comunidad, por lo que su calidad y comportamiento son desconocidos.
- El autor del modelo no ha publicado informacion sobre el proceso de ajuste, por lo que no se puede evaluar si el fine-tuning ha introducido regresiones en las capacidades del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Flonceryga/Nori2PRO
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- llama.cpp (runtime de inferencia): https://github.com/ggml-org/llama.cpp
- Ollama (plataforma de ejecucion de modelos GGUF): https://ollama.com/
