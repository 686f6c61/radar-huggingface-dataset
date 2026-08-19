# ReadyArt/Omega-Convergence-27B-v1.0-W8A16-PTQ

## Resumen

Omega-Convergence-27B-v1.0-W8A16-PTQ es una cuantizacion post-entrenamiento (PTQ) con pesos en 8 bits y activaciones en 16 bits (W8A16) del modelo base ReadyArt/Omega-Convergence-27B-v1.0, desarrollado por el usuario ReadyArt. A pesar de la denominacion "27B", los pesos reales en safetensors suman 13.410.668.272 parametros (~13,4B), lo que sugiere que el nombre comercial no refleja el tamano real. Segun las etiquetas del repositorio, el modelo esta basado en la arquitectura Qwen3.5 y esta orientado a roleplay, contenido explicito (ERP) y generacion de texto sin alineamiento (unaligned). Su relevancia radica en ofrecer una version cuantizada de un modelo sin restricciones eticas, pensado para usuarios que buscan respuestas no censuradas, aunque con riesgos asociados. El acceso es restringido (gated) y requiere aceptar condiciones en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (segun tags, sin confirmacion oficial) |
| Parametros totales | 13.410.668.272 (~13,4B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W8A16 (pesos 8 bits, activaciones 16 bits) mediante PTQ |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, compressed-tensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni el proceso de entrenamiento del modelo base. Las etiquetas indican que se basa en Qwen3.5, lo que sugiere una arquitectura transformer estandar con atencion por capas, pero no hay confirmacion oficial. El modelo base Omega-Convergence-27B-v1.0 fue posteriormente cuantizado a W8A16 mediante tecnicas de post-training quantization (PTQ), probablemente usando la libreria compressed-tensors. No se han publicado datos sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO. Dado el tag "unaligned", se infiere que no se realizo alineamiento con feedback humano, pero esto no esta documentado.

## Capacidades

- Generacion de texto libre, especialmente orientada a roleplay y narrativa interactiva.
- Manejo de contenido explicito y sexual (ERP) sin filtros aparentes.
- Respuestas sin censura ni restricciones eticas, segun las etiquetas "nsfw", "explicit" y "dangerous".
- No se ha confirmado soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No se indica capacidad multimodal (vision, audio, etc.).
- Capacidades multilingues no documentadas.

## Casos de uso

- Roleplay erotico y narrativo: el modelo puede mantener conversaciones multi-turno con contenido explicito, aunque no se conoce la longitud de contexto, por lo que la coherencia a largo plazo no esta garantizada.
- Escritura creativa sin restricciones: util para autores que necesitan generar dialogos o escenas con contenido adulto sin filtros.
- Simulacion de personajes para juegos de rol: su naturaleza "unaligned" permite respuestas impredecibles y sin censura, aunque con riesgo de incoherencia.
- Experimentacion en IA sin alineamiento: investigadores pueden estudiar el comportamiento de modelos no alineados, aunque con precaucion.
- Generacion de contenido para comunidades adultas: adecuado para foros o plataformas que permiten material explicito, siempre que se cumplan las condiciones de la licencia.
- Pruebas de robustez y sesgos: al ser un modelo sin alineamiento, puede usarse para evaluar sesgos y comportamientos peligrosos en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 13,4B parametros en W8A16, los pesos ocupan aproximadamente 13,4 GB (1 byte por parametro). Sumando activaciones y overhead, se estima un consumo de 16-20 GB en inferencia con batch pequeno.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, o GPUs con al menos 20 GB de VRAM. En GPUs con 16 GB (como RTX 4080) podria caber con cuantizacion adicional o menor batch.
- No cabe en GPUs de consumo con menos de 16 GB sin cuantizacion adicional.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI, o directamente con transformers y compressed-tensors.
- Latencia y throughput: no disponibles. Se espera una velocidad moderada para 13,4B en hardware moderno, pero sin datos concretos.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoria (roleplay sin alineamiento). Se podria comparar con Mistral 7B, Llama 3 8B o Qwen 2.5 14B, pero no hay datos de rendimiento ni de contexto para este modelo. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Contenido explicito y peligroso: el modelo esta disenado para generar material NSFW, violento o potencialmente danino. Su uso en produccion o en entornos no controlados conlleva riesgos legales y eticos.
- Sin alineamiento: no se aplicaron tecnicas de RLHF/DPO, por lo que las respuestas pueden ser incoherentes, ofensivas o perjudiciales.
- Riesgo de alucinacion: al no estar alineado, la probabilidad de generar informacion falsa o inventada es alta.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que limita su uso en tareas que requieren memoria a largo plazo.
- Acceso restringido: el modelo es gated, por lo que se requiere aceptar condiciones en HuggingFace antes de descargarlo.
- Licencia apache-2.0: aunque permite uso comercial, la naturaleza del contenido generado puede violar politicas de plataformas o leyes locales.
- Sin soporte oficial: no hay documentacion tecnica, paper ni repositorio de codigo asociado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ReadyArt/Omega-Convergence-27B-v1.0-W8A16-PTQ
- Modelo base: https://huggingface.co/ReadyArt/Omega-Convergence-27B-v1.0 (enlace inferido, no verificado)
