# pranil00/ONIX-Qwen1.5-14B-Chat-GGUF

## Resumen

ONIX-Qwen1.5-14B-Chat-GGUF es una cuantización en formato GGUF del modelo Qwen1.5-14B-Chat, publicada por el usuario pranil00 bajo la etiqueta "ONIX Community". Se trata de una conversión de los pesos originales de Qwen (Alibaba Cloud) al formato Q4_K_M de llama.cpp, con un tamano resultante de 8,56 GB. El modelo base es un transformer decoder-only de 14 mil millones de parametros, ajustado para chat mediante instruction tuning y alineamiento por preferencias.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de 14B en hardware de consumo con requisitos de VRAM moderados (en torno a 10-12 GB para el archivo de pesos mas overhead de contexto), a traves de llama.cpp u Ollama. No obstante, la model card es extremadamente escasa: no documenta el proceso exacto de cuantizacion, no incluye evaluaciones de perplejidad ni benchmarks, y el repositorio cuenta con cero descargas y cero likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

Se debe tratar esta ficha como una descripcion de la cuantizacion concreta, remitiendo al modelo base Qwen1.5-14B-Chat para las capacidades reales del modelo, dado que la cuantizacion Q4_K_M introduce una perdida de calidad respecto a los pesos originales en BF16 que no ha sido medida ni publicada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen1.5-14B-Chat) |
| Parametros totales | 14 mil millones (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card de la cuantizacion (el modelo base Qwen1.5-14B-Chat soporta hasta 32 768 tokens, segun la documentacion de Qwen) |
| Tipos de cuantizacion | Q4_K_M (unico publicado en este repositorio) |
| Idiomas soportados | No disponible en la model card de la cuantizacion (el modelo base declara soporte multilingue, incluido espanol, ingles y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura corresponde integramente al modelo base Qwen1.5-14B-Chat: un transformer decoder-only con atencion por cabezas agrupadas (GQA), normalizacion RMSNorm y activacion SwiGLU, entrenado por Alibaba Cloud. El ajuste de chat del modelo base incluye instruction tuning supervisado y alineamiento por preferencias humanas (RLHF/DPO), segun la documentacion publicada por Qwen. Esta ficha no puede aportar detalles adicionales sobre el dataset de entrenamiento porque la model card de la cuantizacion no los incluye.

La contribucion del autor pranil00 se limita a la conversion de pesos a GGUF con cuantizacion Q4_K_M mediante llama.cpp, realizada segun la model card en Apple Silicon con backend Metal. El autor afirma haber verificado la conversion de tensores, pero no publica valores de perplejidad, comparaciones con los pesos originales ni el hash de los tensores de origen, por lo que no es posible auditar la fidelidad de la conversion mas alla de la declaracion del autor.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del ajuste de chat de Qwen1.5-14B-Chat.
- Razonamiento y respuesta a instrucciones en formato chat.
- Generacion de codigo y resolucion de problemas matematicos basicos e intermedios (capacidad del modelo base, no verificada en esta cuantizacion).
- Soporte multilingue segun el modelo base (chino, ingles y otros idiomas; el grado de calidad en espanol no esta documentado en esta model card).
- Compatibilidad con llama.cpp y Ollama para inferencia local.
- No se documenta en esta model card soporte de tool calling, function calling, modo thinking, vision ni audio. Cualquier capacidad de este tipo debe verificarse contra la documentacion del modelo base.

## Casos de uso

- Prototipado local de asistentes conversacionales: el archivo de 8,56 GB permite desplegar un chat de 14B en un portatil con GPU consumer mediante Ollama, util para validar flujos conversacionales antes de pasar a infraestructura mayor.
- Desarrollo offline sin conectividad: al ejecutarse con llama.cpp en CPU o GPU local, sirve para entornos aislados donde no se permite enviar datos a APIs externas.
- Generacion de texto y borradores en espanol: el modelo base es multilingue, por lo que puede emplearse para redaccion asistida, resumenes y reescritura, siempre que se valide la calidad tras la cuantizacion Q4_K_M.
- Asistencia basica de programacion en local: generacion de fragmentos de codigo y explicaciones, adecuada para tareas de baja criticidad donde no se requiere la precision de un modelo mayor.
- Experimentacion academica con cuantizacion: util como punto de partida para medir el impacto de Q4_K_M frente a los pesos BF16 originales, aunque el autor no aporta esas metricas.
- Educacion y demos: permite mostrar el funcionamiento de un LLM de 14B en un portatil durante talleres o clases, con requisitos de hardware asequibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni mediciones de perplejidad para esta cuantizacion, ni comparaciones con los pesos originales de Qwen1.5-14B-Chat.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_M ocupa 8,56 GB; con overhead de contexto y cache KV se recomienda un minimo de 10-12 GB de VRAM para contextos moderados.
- GPU recomendadas: RTX 3090, RTX 4090, RTX 4080 (16 GB), A10G, L4; en GPUs de 8 GB no cabe completo y requeriria offload parcial a CPU.
- Cabe en GPU consumer de gama alta (16 GB o mas) y en Apple Silicon con memoria unificada de 16 GB o superior.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (segun la model card, `ollama run pranil00/ONIX-Qwen1.5-14B-Chat-GGUF`), y otros runners compatibles con GGUF.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ONIX-Qwen1.5-14B-Chat-GGUF (esta ficha) | 14B | No disponible en la card | GGUF Q4_K_M | Apache 2.0 | Cuantizacion no validada por la comunidad |
| Qwen/Qwen1.5-14B-Chat (modelo base) | 14B | 32 768 tokens (segun Qwen) | safetensors BF16 | Apache 2.0 | Pesos originales, referencia de calidad |
| Cuantizaciones GGUF oficiales o comunitarias de Qwen1.5-14B-Chat | 14B | Segun variante | GGUF (Q4_K_M y otras) | Apache 2.0 | Alternativas con mayor trazabilidad y uso comunitario |

## Limitaciones y advertencias

- La cuantizacion Q4_K_M introduce perdida de calidad frente a BF16; el autor no publica perplejidad ni evaluaciones que cuantifiquen esa degradacion.
- No hay validacion externa: el repositorio tiene cero descargas y cero likes, y no consta auditoria de los pesos convertidos.
- La model card no documenta la procedencia exacta de los tensores de origen ni el hash de los mismos, lo que impide verificar la integridad de la conversion.
- Riesgo de alucinacion inherente al modelo base, no mitigado ni evaluado en esta cuantizacion.
- Sesgos del modelo base (derivados de sus datos de entrenamiento) se heredan sin cambios; no se documentan evaluaciones de sesgo.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base y citar adecuadamente a Qwen.
- La longitud de contexto efectiva de esta cuantizacion no esta documentada; debe configurarse explicitamente en llama.cpp u Ollama y validarse.
- Para produccion con requisitos de fiabilidad, se recomienda usar los pesos originales del modelo base o cuantizaciones con metricas publicadas.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/pranil00/ONIX-Qwen1.5-14B-Chat-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen1.5-14B-Chat
- llama.cpp (repositorio del runtime GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
