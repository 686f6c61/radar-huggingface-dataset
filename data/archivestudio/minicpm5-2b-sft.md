# ArchiveStudio/MiniCPM5-2B-SFT

## Resumen

MiniCPM5-2B-SFT es un modelo de lenguaje denso de 2.516 millones de parametros desarrollado por ArchiveStudio dentro de la serie MiniCPM5 (OpenBMB), siendo el segundo modelo de la familia tras MiniCPM5-1B. Se trata de una variante ajustada por supervision (SFT) orientada a despliegue en dispositivo (on-device), entornos locales y escenarios con recursos limitados, donde el objetivo es ofrecer rendimiento de clase SOTA en la categoria de 2B sin necesidad de GPU de servidor.

El modelo se publica bajo licencia Apache 2.0, lo que permite su uso comercial sin restricciones relevantes, y emplea una arquitectura tipo LLaMA (transformer denso) con soporte de contexto largo, tool calling y tareas agenticas. Su entrenamiento se apoya en la familia de datasets UltraData de OpenBMB (Ultra-FineWeb, UltraData-Math, UltraData-Code, entre otros), lo que le dota de un perfil equilibrado entre codigo, matematicas, conocimiento general y seguimiento de instrucciones.

Su relevancia actual radica en la creciente demanda de modelos pequenos y eficientes para IA en el borde: segun la model card, MiniCPM5-2B alcanza resultados de SOTA open-source en su clase y se mantiene competitivo frente a modelos de 4B, con ventajas concretas en codigo, matematicas, contexto largo, uso de herramientas y tareas de agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, arquitectura tipo LLaMA (llama) |
| Parametros totales | 2.516.756.480 (2,52 B) |
| Parametros activos | no disponible (modelo denso; todos los parametros estan activos) |
| Longitud de contexto | no disponible (la model card solo indica soporte de "long-context") |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16/FP16; el repo ocupa 5,0 GB) |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con text-generation-inference y endpoints) |

## Arquitectura y entrenamiento

MiniCPM5-2B es un transformer denso con arquitectura tipo LLaMA, es decir, sin mezcla de expertos (MoE): los 2,52 B de parametros estan activos en cada pasada de inferencia. La model card indica que escala la misma receta de entrenamiento empleada en MiniCPM5-1B, el primer modelo de la serie. No se detallan en la informacion disponible el numero de capas, cabezas de atencion, dimension oculta ni el mecanismo exacto de atencion que habilita el contexto largo.

El entrenamiento se ha realizado sobre la familia de datasets UltraData de OpenBMB: Ultra-FineWeb y Ultra-FineWeb-L3 (datos web de alta calidad), UltraX-Preview, UltraData-Math (matematicas), UltraData-Code (codigo), UltraData-SFT-2605 y UltraData-SFT-Agent-2609 (supervision fina, esta ultima centrada en tareas agenticas) y UltraData-RL-2609 (aprendizaje por refuerzo). La presencia de un dataset RL especifico indica que el pipeline incluye una fase de RL posterior al SFT, aunque no se especifica si se trata de RLHF, DPO u otra variante. El detalle tecnico del pipeline esta recogido en el informe tecnico de MiniCPM (arXiv:2506.07900).

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, variante SFT orientada a dialogo).
- Razonamiento en codigo y matematicas, reforzado por los datasets UltraData-Code y UltraData-Math.
- Comprension de contexto largo (etiquetado como long-context, sin cifra concreta publicada en esta ficha).
- Tool calling / function calling, indicado explicitamente en las etiquetas del modelo.
- Tareas agenticas y razonamiento multi-paso, soportadas por el dataset UltraData-SFT-Agent-2609 y la fase de RL (UltraData-RL-2609).
- Capacidades multilingues en ingles y chino.
- Pensado para despliegue on-device y edge AI, con un tamano que permite ejecucion local en hardware de consumo.
- No incluye capacidades de vision ni audio segun la informacion disponible.

## Casos de uso

- Asistentes conversacionales en dispositivo: al ser un modelo SFT de 2,5 B con licencia Apache 2.0, puede ejecutarse localmente en aplicaciones de escritorio o moviles para chat privado sin enviar datos a la nube.
- Atencion al cliente automatizada: su soporte de tool calling permite integrarlo en flujos de consulta de pedidos, gestion de tickets o respuestas multi-turno conectadas a APIs internas, todo on-premise.
- Agentes autonomos ligeros: el entrenamiento agentic especifico (UltraData-SFT-Agent-2609 + RL) lo hace adecuado para agentes que encadenan llamadas a herramientas en varios pasos, como automatizacion de flujos de trabajo o scraping con razonamiento.
- Generacion y revision de codigo en entornos restringidos: con datos dedicados de codigo, puede asistir en completado, refactorizacion y explicacion de codigo en IDEs locales donde no se desea dependencia de modelos en la nube.
- Resolucion de problemas matematicos y educacion: el dataset UltraData-Math lo orienta a tutorias, verificacion de calculos y generacion de soluciones paso a paso.
- Procesamiento de documentos con contexto largo: la etiqueta long-context lo hace candidato para resumir o consultar documentos extensos en local, aunque la ventana exacta debe verificarse en la documentacion oficial.
- Despliegue en edge AI e IoT: su tamano de ~5 GB en pesos y su diseno on-device lo adecuan para pasarelas locales, kioscos y sistemas embebidos con GPU modesta o inferencia CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma cualitativamente que el modelo alcanza SOTA open-source en la clase 2B (comparado con modelos similares de tamano) y que es competitivo con modelos de 4B, con ventajas en codigo, matematicas, contexto largo, tool use y tareas agenticas, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni otros benchmarks. Para numeros exactos, consultar el informe tecnico de MiniCPM (arXiv:2506.07900) y el wiki oficial.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,52 B de parametros en precision completa (BF16/FP16), unos 5 GB de VRAM para los pesos, mas overhead de KV cache; con cuantizacion a 4 bits (por ejemplo, via GGUF o bitsandbytes) podria reducirse a ~1,5-2 GB, aunque no hay versiones cuantizadas oficiales publicadas en la informacion disponible.
- GPU recomendadas: cualquier GPU de consumo con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090) ejecuta el modelo en precision completa sin problemas; no se requieren A100 ni H100 para inferencia.
- Consumer GPU: cabe comodamente en GPU de consumo; incluso portatiles con GPU de 6-8 GB pueden servirlo a velocidades altas dado su tamano reducido.
- Despliegue: compatible con transformers (libreria nativa) y text-generation-inference (etiquetado TGI-compatible y endpoints_compatible). Al usar arquitectura llama, es muy probable la compatibilidad con llama.cpp y Ollama mediante conversion a GGUF, aunque no hay conversiones oficiales publicadas en los datos disponibles.
- Latencia y throughput: no disponible; por su tamano de 2,5 B densos cabe esperar latencias de primer token del orden de decenas de milisegundos y throughput elevado en GPU de consumo, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-SFT | 2,52 B | Transformer denso (LLaMA) | long-context (cifra no publicada) | Apache 2.0 | SFT + RL, tool calling, agentic, on-device |
| Qwen2.5-1.5B-Instruct | 1,54 B | Transformer denso | 32.768 tokens | Qwen Research / Apache 2.0 (versiones base) | Fuerte en multilingue y codigo, tamano inferior |
| Gemma 2 2B (IT) | 2,6 B | Transformer denso | 8.192 tokens | Gemma Terms of Use (restricciones) | Buen conocimiento general, sin tool calling nativo destacado |
| Phi-3.5-mini (3.8B) | 3,82 B | Transformer denso | 131.072 tokens | MIT | Clase 4B, contexto muy largo, buen razonamiento |

La comparativa es orientativa: la model card afirma que MiniCPM5-2B es competitivo con modelos de clase 4B como los citados, pero al no publicarse cifras de benchmarks en los datos disponibles no puede cuantificarse la diferencia de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse con datos web (Ultra-FineWeb) y corpora de codigo y matematicas, cabe esperar sesgos propios de datos masivos extraidos de internet.
- Riesgo de alucinacion: propio de cualquier LLM de 2B; en un modelo de este tamano el riesgo de generar hechos incorrectos es mayor que en modelos grandes, por lo que se recomienda verificacion o grounding en aplicaciones criticas.
- Limitaciones de idioma: soporte oficial solo para ingles y chino; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado y probablemente sea limitado.
- Contexto: la model card indica soporte de contexto largo pero no publica la cifra exacta de tokens; verificar en la configuracion del modelo antes de disenar aplicaciones con documentos extensos.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion sin restricciones destacables; no se identifican caveats de licencia.
- Produccion: al tratarse de una variante SFT de un tercero (ArchiveStudio) sobre la serie MiniCPM5 de OpenBMB, conviene validar la calidad del ajuste frente a los lanzamientos oficiales de OpenBMB y revisar la trazabilidad del entrenamiento antes de uso en produccion.
- Descargas muy bajas (317 en el momento de la ficha) y sin likes: comunidad y ecosistema de tooling (GGUF, fine-tunes derivados) practicamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ArchiveStudio/MiniCPM5-2B-SFT
- Informe tecnico de MiniCPM (arXiv): https://arxiv.org/pdf/2506.07900
- Paper adicional referenciado (arXiv): https://arxiv.org/abs/2602.09003
- Repositorio GitHub de MiniCPM (OpenBMB): https://github.com/OpenBMB/MiniCPM
- Wiki oficial de MiniCPM (chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- UltraData (OpenBMB): https://ultradata.openbmb.cn/
- Demo online: https://huggingface.co/spaces/openbmb/MiniCPM5-2B-Demo
- Modelo anterior de la serie: https://huggingface.co/openbmb/MiniCPM5-1B
- README oficial en chino de OpenBMB: https://huggingface.co/openbmb/MiniCPM5-2B/blob/main/README-cn.md
