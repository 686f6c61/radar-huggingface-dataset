# mradermacher/LFM3-1.7B-Base-heretic-GGUF

## Resumen

LFM3-1.7B-Base-heretic-GGUF es una cuantizacion estatica en formato GGUF del modelo LFM3-1.7B-Base-heretic, publicada por el usuario mradermacher en Hugging Face. El modelo base subyacente es LFM3-1.7B, un modelo de texto de Liquid AI disenado para agentes locales y aplicaciones especializadas, construido sobre la arquitectura LFM3 tri-hybrid y con una ventana de contexto de 256K tokens. La variante "heretic" hace referencia a una version del modelo base que ha sido sometida a un proceso de "abliteration" (eliminacion de rechazos o alineacion de seguridad), aunque la model card no documenta detalles de ese proceso.

El repositorio en cuestion no contiene un modelo original, sino una coleccion de cuantizaciones estaticas generadas con llama.cpp a partir del modelo de saidutta69. Los tipos de cuantizacion disponibles incluyen desde Q2_K hasta Q8_0, ademas de IQ4_XS y x-f16, lo que permite desplegar el modelo en hardware con recursos limitados. El modelo tiene 1.700 millones de parametros, un tamano manejable para inferencia en GPU de consumo.

La relevancia de esta ficha radica en que combina tres elementos de interes: una arquitectura reciente de Liquid AI (tri-hybrid), un contexto muy largo (256K tokens) para su tamano, y una variante sin alineacion de seguridad que puede interesar a investigadores que estudian el comportamiento de modelos sin restricciones. No obstante, la informacion publicada es muy escasa: no hay datos de benchmarks, licencia ni idiomas en el repositorio de cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 tri-hybrid (transformer hibrido, segun documentacion de Liquid AI) |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 256K tokens (segun documentacion de LFM3-1.7B) |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas generadas con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B emplea la arquitectura LFM3 tri-hybrid de Liquid AI, que combina capas de atencion con otros mecanismos de mezcla de secuencia para reducir el coste computacional en contextos largos. La documentacion oficial de Liquid AI indica que esta arquitectura esta orientada a agentes locales y aplicaciones especializadas, con soporte nativo de tool calling y una ventana de 256K tokens. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La variante "heretic" del modelo base (saidutta69/LFM3-1.7B-Base-heretic) sugiere que se ha aplicado un proceso de abliteration para eliminar los comportamientos de rechazo aprendidos durante el alineamiento. La model card del repositorio de cuantizaciones no documenta ni el metodo exacto de abliteration ni los datos utilizados. Las cuantizaciones han sido generadas por mradermacher con llama.cpp (quantize_version 2, output_tensor_quantised 1, convert_type hf), lo que implica que los pesos originales en safetensors se convirtieron a GGUF y posteriormente se cuantizaron.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base LFM3-1.7B.
- Soporte nativo de tool calling / function calling, segun la documentacion de Liquid AI para LFM3-1.7B.
- Orientacion a agentes locales y aplicaciones especializadas, con capacidad de razonamiento multi-paso.
- Ventana de contexto de 256K tokens, adecuada para tareas con documentos largos o historiales extensos.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modo "thinking" o razonamiento explicito: no disponible en la informacion proporcionada.
- Vision o audio: no disponible; el modelo base es de texto.
- Comportamiento sin alineacion de seguridad (variante heretic), lo que puede afectar a la generacion de contenido sensible.

## Casos de uso

- Agentes locales de automatizacion: el modelo puede ejecutarse en una estacion de trabajo con GPU de consumo y gestionar bucles de tool calling para tareas como consultas a APIs, lectura de ficheros o ejecucion de comandos, gracias a su soporte nativo de function calling.
- Procesamiento de documentos largos: con 256K tokens de contexto, es adecuado para resumir o extraer informacion de contratos, informes o bases de codigo completas sin necesidad de fragmentacion.
- Asistente de codigo en local: la cuantizacion Q4_K_M o Q5_K_M permite integracion en editores o pipelines de CI/CD para generacion y revision de codigo, con la ventaja de no enviar datos a servicios externos.
- Investigacion sobre alineacion y seguridad: la variante heretic permite estudiar el comportamiento de un modelo sin rechazos, comparandolo con el modelo base original en tareas de evaluacion de sesgos y contenido sensible.
- Chatbot de atencion al cliente con contexto extenso: el modelo puede mantener conversaciones multi-turno con historiales largos y consultar bases de conocimiento mediante tool calling, aunque su tamano de 1.7B limita la calidad frente a modelos mayores.
- Prototipado rapido en entornos con recursos limitados: las cuantizaciones Q2_K y Q3_K permiten ejecutar el modelo en CPU o en GPUs con poca VRAM para validar ideas antes de escalar a modelos mayores.
- Generacion de texto creativo sin filtros: para proyectos de escritura que requieran contenido no restringido, la variante heretic evita los rechazos del modelo alineado, aunque con los riesgos asociados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion):
  - Q8_0: ~1.8-2.0 GB
  - Q6_K: ~1.4-1.6 GB
  - Q5_K_M: ~1.2-1.4 GB
  - Q4_K_M: ~1.0-1.2 GB
  - Q3_K_M: ~0.8-1.0 GB
  - Q2_K: ~0.6-0.8 GB
  - x-f16: ~3.4 GB
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput. El modelo cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas de VRAM, incluso en cuantizaciones altas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), text-generation-webui, TGI (si se convierte a safetensors).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependeran del hardware y de la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-Base-heretic-GGUF | 1.7B | 256K | no disponible | GGUF | Variante sin alineacion, cuantizada por mradermacher |
| LFM3-1.7B (original) | 1.7B | 256K | no disponible | safetensors | Modelo base de Liquid AI con alineacion |
| Qwen2.5-1.5B | 1.5B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa popular de tamano similar, contexto menor |
| Llama-3.2-1B | 1B | 128K | Llama 3.2 Community License | safetensors, GGUF | Menor numero de parametros, contexto menor |

La comparativa se basa en datos publicos de los modelos alternativos; para LFM3-1.7B no se dispone de benchmarks que permitan una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- La variante heretic ha sido sometida a abliteration, lo que elimina los rechazos de seguridad y puede generar contenido ofensivo, ilegal o danino sin filtros. No es adecuada para aplicaciones de produccion orientadas al publico general sin moderacion adicional.
- Riesgo de alucinacion inherente a un modelo de 1.7B: la capacidad de razonamiento y la fidelidad factual son limitadas en comparacion con modelos de mayor tamano.
- No se dispone de informacion sobre sesgos conocidos, composicion del dataset de entrenamiento ni evaluaciones de seguridad.
- La licencia no esta disponible en el repositorio, lo que impide confirmar si se permite uso comercial. Se recomienda contactar con el autor o consultar el repositorio del modelo base.
- Los idiomas soportados no estan documentados; probablemente el ingles sea el idioma principal, pero no se puede confirmar.
- El contexto de 256K tokens puede degradar la calidad en los extremos de la ventana; no hay datos sobre el rendimiento real en contextos largos.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026, lo que sugiere que no ha sido validado por la comunidad.
- La model card no incluye informacion sobre el proceso de cuantizacion mas alla de los metadatos tecnicos; no se garantiza la fidelidad de las cuantizaciones bajas (Q2_K, Q3_K) respecto al modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-1.7B-Base-heretic-GGUF
- Modelo base (heretic): https://huggingface.co/saidutta69/LFM3-1.7B-Base-heretic
- Documentacion de LFM3-1.7B en Liquid AI: https://docs.liquid.ai/lfm/models/lfm3-1.7b
- Perfil de mradermacher en Hugging Face: https://huggingface.co/mradermacher
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
