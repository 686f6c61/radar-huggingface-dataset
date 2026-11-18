# LiquidAI/LFM2.5-230M-GGUF

## Resumen

LFM2.5-230M es un modelo de lenguaje de 229.693.184 parámetros desarrollado por Liquid AI, diseñado específicamente para despliegue en el borde (edge AI) y en dispositivo. Esta ficha corresponde al repositorio GGUF, que empaqueta los pesos en formato listo para llama.cpp, incluyendo una variante cuantizada mediante destilación consciente de cuantización (QAD) en Q4_0, además de los pesos fuente en FP32 dentro del subdirectorio `qad/`.

El modelo pertenece a la familia LFM2.5, una generación híbrida de Liquid AI que busca un equilibrio entre calidad, velocidad y eficiencia de memoria en un rango de tamaño muy reducido. Con 230 millones de parámetros, el objetivo no es competir con modelos frontera, sino ofrecer inferencia local con huella de memoria mínima en CPU, GPU integrada o aceleradores de borde.

Su relevancia actual radica en dos factores: por un lado, la licencia LFM1.0 permite uso comercial bajo condiciones específicas; por otro, el soporte multilingüe declarado para diez idiomas (incluido el español) y la compatibilidad con llama.cpp lo convierten en una opción práctica para prototipos, asistentes embebidos y tareas de generación de texto de baja latencia donde no es viable ejecutar modelos de varios miles de millones de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida (familia LFM2.5 de Liquid AI); detalles internos de capas no disponibles en la información proporcionada |
| Parámetros totales | 229.693.184 |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF Q4_0 (post-entrenamiento) y GGUF Q4_0 QAD; pesos fuente FP32 en `qad/` |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it |
| Licencia | LFM1.0 (`license: other`, `license_name: lfm1.0`) |
| Formato de pesos | GGUF y safetensors (FP32 QAD en subcarpeta `qad/`) |

## Arquitectura y entrenamiento

Liquid AI describe LFM2.5 como una generación híbrida de modelos orientada a edge AI, con el foco puesto en calidad, velocidad y eficiencia de memoria. La model card del repositorio GGUF no detalla la composición exacta de capas (proporción de atención, convoluciones o componentes de estado recurrente), el número de tokens de entrenamiento ni la composición del dataset; esa información se remite a la model card del checkpoint base `LiquidAI/LFM2.5-230M`, no incluida en la información disponible.

La innovación técnica más destacable documentada en este repositorio es la incorporación de un checkpoint entrenado con Quantization-Aware Distillation (QAD), publicado como `LFM2.5-230M-QAD-Q4_0.gguf`. Este checkpoint es distinto del `LFM2.5-230M-Q4_0.gguf` obtenido por cuantización posterior al entrenamiento, aunque ambos emplean el mismo formato GGUF Q4_0. Los pesos fuente FP32 del QAD están disponibles en el subdirectorio `qad/` para fine-tuning y experimentación, con su propia configuración, tokenizador y plantilla de chat. Liquid AI advierte que los resultados publicados del QAD aplican al GGUF Q4_0 y que la inferencia directa en FP32/BF16 u otros formatos de cuantización puede comportarse de forma distinta. No se especifican en la información disponible detalles sobre RLHF, DPO u otras etapas de alineamiento.

## Capacidades

- Generación de texto conversacional, con plantilla de chat incluida y uso previsto mediante `llama-cli --conversation`.
- Soporte multilingüe declarado para diez idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano, español, portugués e italiano.
- Compatibilidad con llama.cpp, lo que habilita ejecución local en CPU y GPU con cuantización Q4_0.
- Disponibilidad de pesos fuente FP32 QAD para fine-tuning e investigación.
- Etiqueta `endpoints_compatible`, que indica compatibilidad con endpoints de inferencia estándar.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Asistentes conversacionales en dispositivo: con 230 millones de parámetros y cuantización Q4_0, el modelo puede ejecutarse en hardware de gama baja para diálogos de un solo turno o pocos turnos, sin depender de la nube.
- Generación de texto en aplicaciones móviles y embebidas: su huella reducida permite integrarlo en apps Android, iOS o firmware con presupuesto de memoria limitado, usando llama.cpp como runtime.
- Prototipado rápido de pipelines de NLP: sirve como modelo de referencia para validar plantillas de chat, tokenizadores y flujos de inferencia antes de escalar a modelos mayores de la misma familia.
- Procesamiento de texto multilingüe ligero: clasificación, resumen corto o reformulación en los diez idiomas soportados, útil en entornos con requisitos de soberanía de datos y sin conexión.
- Fine-tuning específico de dominio: los pesos FP32 QAD en `qad/` permiten ajustar el modelo a vocabulario técnico o de negocio y volver a cuantizar a Q4_0 para despliegue.
- Filtrado y preprocesado en pipelines de datos: generación de etiquetas, normalización o expansión de consultas en servidores de bajo coste donde un modelo mayor resultaría inviable económicamente.
- Educación y demos de IA local: ejecución en portátiles sin GPU dedicada para talleres y pruebas de concepto, gracias al formato GGUF y a la compatibilidad con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF remite a la model card del checkpoint base `LiquidAI/LFM2.5-230M` para más detalles, pero no incluye tablas de MMLU, HumanEval, GSM8K ni métricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, 229,7 millones de parámetros en Q4_0 ocupan aproximadamente 0,12-0,15 GB solo en pesos, a lo que hay que sumar caché KV y overhead del runtime; en FP32 los pesos rondan los 0,9 GB.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, el modelo es apto para GPU de consumo e integradas, pero no se documentan pruebas oficiales en A100, H100, RTX 4090 ni otros aceleradores.
- Cabe en GPU de consumo: sí, por el reducido número de parámetros, aunque no se especifican modelos concretos ni requisitos mínimos oficiales.
- Opciones de despliegue: llama.cpp (documentado con `llama-cli`), GGUF compatible con el ecosistema llama.cpp; Transformers para los pesos FP32 del subdirectorio `qad/` mediante `subfolder="qad"`. No se documentan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con modelos de tamaño o categoría similar, ni datos de rendimiento que permitan establecer una comparativa fundamentada.

## Limitaciones y advertencias

- Con 229,7 millones de parámetros, la capacidad de razonamiento, conocimiento factual y coherencia en contextos largos es estructuralmente limitada frente a modelos de mayor tamaño; no debe emplearse en tareas que exijan alta precisión factual sin verificación.
- Riesgo de alucinación inherente a los modelos de lenguaje de este tamaño, especialmente en preguntas abiertas y dominios especializados.
- No se documenta la longitud de contexto soportada, lo que impide garantizar su comportamiento en conversaciones o documentos largos.
- El rendimiento multilingüe puede variar entre los diez idiomas declarados; no se publican evaluaciones por idioma.
- La licencia LFM1.0 es `other` y no equivale a una licencia permisiva estándar; es necesario revisar el archivo LICENSE del repositorio antes de un uso comercial.
- Los resultados publicados del checkpoint QAD aplican específicamente al GGUF Q4_0; la inferencia en FP32/BF16 u otras cuantizaciones puede diferir.
- No se documentan capacidades de tool calling, agentes ni visión, por lo que no debe asumirse su disponibilidad en producción.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/LiquidAI/LFM2.5-230M-GGUF
- Checkpoint base: https://huggingface.co/LiquidAI/LFM2.5-230M
- Pesos QAD Q4_0: https://huggingface.co/LiquidAI/LFM2.5-230M-GGUF/blob/main/LFM2.5-230M-QAD-Q4_0.gguf
- Pesos fuente QAD (safetensors): https://huggingface.co/LiquidAI/LFM2.5-230M-GGUF/tree/main/qad
- Documentación del checkpoint fuente QAD: https://huggingface.co/LiquidAI/LFM2.5-230M-GGUF/blob/main/qad/README.md
- Licencia: https://huggingface.co/LiquidAI/LFM2.5-230M-GGUF/blob/main/LICENSE
- Playground de Liquid AI: https://playground.liquid.ai/
- Documentación de LFM: https://docs.liquid.ai/lfm/getting-started/welcome
- Plataforma LEAP: https://leap.liquid.ai/
- Discord de Liquid AI: https://discord.com/invite/liquid-ai
- Web de Liquid AI: https://www.liquid.ai/
- llama.cpp: https://github.com/ggml-org/llama.cpp
