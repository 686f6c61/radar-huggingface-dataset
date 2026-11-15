# myroadhome/LFM2.5-350M-GGUF

## Resumen

LFM2.5-350M es un modelo de lenguaje de la familia LFM2 (Liquid Foundation Models, segunda generación) desarrollado por Liquid AI, disenado especificamente para despliegue en el borde (edge AI) y en dispositivo. Con 354.483.968 parametros totales, se posiciona como un modelo ultraligero orientado a entornos con recursos muy limitados, donde el coste de memoria y la latencia son criticos. La version aqui documentada es una cuantizacion GGUF publicada por el usuario myroadhome a partir del checkpoint base LiquidAI/LFM2.5-350M.

La familia LFM2 emplea una arquitectura hibrida (etiquetada como "liquid" en los tags del repositorio) que combina mecanismos de atencion con capas de estado recurrente, una innovacion que Liquid AI presenta como estandar en calidad, velocidad y eficiencia de memoria para modelos de borde. El modelo soporta ocho idiomas (ingles, arabe, chino, frances, aleman, japones, coreano y espanol) y esta empaquetado en formato GGUF para su ejecucion con llama.cpp.

Su relevancia actual radica en la creciente demanda de modelos pequenos que puedan ejecutarse en CPU, moviles y dispositivos embebidos sin GPU dedicada, manteniendo capacidades conversacionales y multilingues. La existencia de un checkpoint QAD (Quantization-Aware Distillation) en Q4_0, junto con los pesos fuente en FP32 para fine-tuning, indica un interes explicito de Liquid AI en flujos de trabajo de cuantizacion consciente y despliegue eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (familia LFM2, etiquetada "liquid"); detalles exactos de capas no disponibles |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_0 (version post-training y version QAD); pesos fuente FP32 en subcarpeta `qad/` |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es |
| Licencia | lfm1.0 (licencia "other" segun metadatos) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

La informacion disponible describe LFM2 como una "nueva generacion de modelos hibridos" de Liquid AI, disenada para edge AI y despliegue en dispositivo. Los tags del repositorio incluyen "liquid" y "lfm2", lo que apunta a la arquitectura propietaria de Liquid AI que combina componentes de atencion con mecanismos de estado (lineas de investigacion previas de la compania en modelos de espacio de estados). No se detalla en la informacion proporcionada el numero de capas, la composicion exacta del bloque hibrido ni la dimension oculta.

En cuanto al entrenamiento, la model card no especifica el volumen de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Si se documenta la existencia de un proceso de Quantization-Aware Distillation (QAD): el checkpoint QAD Q4_0 se distingue del Q4_0 post-entrenamiento, y se publican los pesos fuente FP32 de QAD en la subcarpeta `qad/` para fine-tuning y experimentacion. Liquid AI advierte que los resultados QAD publicados aplican al GGUF Q4_0 y que la inferencia directa en FP32/BF16 u otros formatos de cuantizacion puede comportarse de forma distinta.

## Capacidades

- Generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Soporte multilingue en ocho idiomas: ingles, arabe, chino, frances, aleman, japones, coreano y espanol.
- Plantilla de chat incluida (chat template) para formateo de conversaciones multi-turno.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Ejecucion en llama.cpp mediante `llama-cli`, con parametros de generacion recomendados (temp 0.1, top-k 50, repeat-penalty 1.05).
- Pesos fuente FP32 en `qad/` cargables en Transformers para fine-tuning.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asistentes conversacionales en dispositivo: el modelo puede gestionar dialogos multi-turno en moviles o dispositivos embebidos gracias a su tamano de 350M parametros, que permite inferencia en CPU con llama.cpp sin GPU dedicada.
- Traduccion y atencion multilingue ligera: con soporte para ocho idiomas, es adecuado para tareas de traduccion basica o clasificacion de texto en entornos con restricciones de memoria.
- Clasificacion y etiquetado de texto en pipelines de datos: su huella reducida permite procesar grandes volumenes de documentos en servidores modestos o incluso en el borde de la red.
- Prototipado rapido de aplicaciones LLM: util como modelo de referencia para validar pipelines de inferencia (llama.cpp, endpoints compatibles) antes de escalar a modelos mayores.
- Fine-tuning especializado: los pesos FP32 en `qad/` permiten ajustar el modelo a dominios concretos y re-cuantizar posteriormente con QAD.
- Generacion de texto en entornos con bateria limitada: la orientacion a edge AI y eficiencia de memoria lo hace apto para aplicaciones de bajo consumo en dispositivos portatiles.
- Filtrado y moderacion de contenido en local: al ejecutarse sin conexion, puede clasificar o resumir texto sin enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. Con 354M parametros, en FP32 los pesos ocupan aproximadamente 1,4 GB; en Q4_0, aproximadamente 0,2-0,3 GB, mas overhead de contexto.
- GPU recomendadas: no se especifican. Por tamano, cualquier GPU consumer moderna (RTX 3060 o superior) seria sobredimensionada; el modelo esta pensado para CPU y dispositivos de borde.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con suficiente memoria para el contexto; tambien en CPU.
- Opciones de despliegue: llama.cpp (documentado en la model card con `llama-cli`), Transformers (pesos FP32 en `qad/`), y endpoints compatibles segun el tag del repositorio. No se mencionan vLLM, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-350M (esta ficha) | 354M | no disponible | lfm1.0 | safetensors, GGUF | Hibrido, edge, 8 idiomas |
| Alternativas de ~300-500M | no disponible | no disponible | no disponible | no disponible | No se proporcionan modelos comparables en la informacion disponible |

No se dispone de datos de benchmarks ni de modelos comparables en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Con 354M parametros, la capacidad de razonamiento complejo, matematicas y codigo es limitada en comparacion con modelos de mayor escala; no debe emplearse en tareas que exijan alta precision factual.
- Riesgo de alucinacion inherente a modelos de este tamano, especialmente en dominios especializados.
- La longitud de contexto no esta documentada, lo que impide garantizar el manejo de conversaciones o documentos largos.
- El rendimiento multilingue puede variar notablemente entre los ocho idiomas declarados; no se aportan metricas por idioma.
- La licencia lfm1.0 ("other") impone condiciones que deben revisarse antes de uso comercial; no se detallan en la informacion disponible.
- Los resultados de QAD publicados aplican solo al GGUF Q4_0; la inferencia en FP32/BF16 u otras cuantizaciones puede diferir.
- Este repositorio concreto (myroadhome/LFM2.5-350M-GGUF) es una republicacion de un tercero, con 0 descargas y 0 likes; conviene verificar la integridad frente al repositorio oficial de LiquidAI.
- No se documentan capacidades de tool calling ni de agentes, por lo que no es adecuado para pipelines que las requieran sin validacion previa.

## Enlaces

- Repositorio Hugging Face (esta version): https://huggingface.co/myroadhome/LFM2.5-350M-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- GGUF oficial de LiquidAI: https://huggingface.co/LiquidAI/LFM2.5-350M-GGUF
- Checkpoint QAD Q4_0: https://huggingface.co/LiquidAI/LFM2.5-350M-GGUF/blob/main/LFM2.5-350M-QAD-Q4_0.gguf
- Pesos fuente QAD: https://huggingface.co/LiquidAI/LFM2.5-350M-GGUF/tree/main/qad
- Documentacion QAD: qad/README.md (dentro del repositorio oficial)
- Liquid AI: https://www.liquid.ai/
- Playground: https://playground.liquid.ai/
- Documentacion: https://docs.liquid.ai/lfm/getting-started/welcome
- LEAP: https://leap.liquid.ai/
- Discord: https://discord.com/invite/liquid-ai
- llama.cpp: https://github.com/ggml-org/llama.cpp
