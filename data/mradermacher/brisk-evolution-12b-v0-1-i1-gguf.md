# mradermacher/Brisk-Evolution-12B-v0.1-i1-GGUF

## Resumen

Brisk-Evolution-12B-v0.1-i1-GGUF es una cuantización en formato GGUF del modelo base ReadyArt/Brisk-Evolution-12B-v0.1, preparada por mradermacher. El modelo original, desarrollado por ReadyArt, es un transformer de aproximadamente 12 000 millones de parámetros orientado a roleplay, contenido explícito y conversación sin alineación (unaligned). Esta versión GGUF incluye cuantizaciones con imatrix (i1) para optimizar la calidad de los pesos en tamaños reducidos, lo que facilita su ejecución en hardware de consumo.

La relevancia de este modelo radica en su especialización en interacción conversacional no censurada, con etiquetas como nsfw, explicit, ERP (roleplay erótico) y dangerous. Al estar disponible en GGUF, puede desplegarse fácilmente con herramientas como llama.cpp, Ollama o LM Studio, sin necesidad de GPUs de gran tamaño. No obstante, su naturaleza sin alineación y su licencia (llama3.1) implican consideraciones éticas y legales importantes para su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere transformer, pero no confirmado) |
| Parametros totales | 11 956 539 456 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ2_M, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M (ademas de archivo imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.1 |
| Formato de pesos | GGUF (safetensors para el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base (numero de capas, dimensiones, atencion, etc.) ni sobre el proceso de entrenamiento (dataset, numero de tokens, tecnicas de alineacion como RLHF o DPO). La unica referencia es que el modelo base esta publicado en Hugging Face con la etiqueta "safetensors" y la licencia llama3.1, lo que sugiere una arquitectura similar a la familia Llama, pero no se puede confirmar sin acceso a la configuracion del modelo original. La cuantizacion GGUF realizada por mradermacher utiliza la tecnica imatrix (importance matrix) para mejorar la calidad de los pesos cuantizados, especialmente en los niveles de baja precision.

## Capacidades

- Generacion de texto conversacional y narrativo, especialmente orientado a roleplay y escenarios interactivos.
- Soporte de contenido explicito y erotico (ERP) sin filtros de seguridad aparentes.
- Conversacion multi-turno con memoria contextual (la longitud exacta de contexto no se ha especificado).
- Capacidad de seguir instrucciones en ingles, aunque el modelo no esta alineado para tareas de asistencia general.
- No se ha documentado soporte para tool calling, agentes, vision, audio u otras capacidades multimodales.

## Casos de uso

- Roleplay interactivo: el modelo puede mantener personajes y tramas en conversaciones largas, ideal para juegos de rol por texto o simulaciones narrativas.
- Generacion de ficcion erotica: su especializacion en contenido explicito permite redactar relatos o dialogos con tono adulto, aunque debe usarse con consentimiento y en plataformas apropiadas.
- Creacion de chatbots personalizados: gracias a su naturaleza unaligned, se puede adaptar a personalidades o estilos de conversacion sin restricciones de contenido.
- Experimentacion en investigacion sobre modelos sin alineacion: util para estudiar comportamientos de modelos no censurados en entornos controlados.
- Prototipado de aplicaciones de entretenimiento para adultos: siempre que se cumplan las normativas legales y de la plataforma.
- Evaluacion de tecnicas de cuantizacion: al estar disponible en multiples quants con imatrix, sirve para comparar la degradacion de calidad en diferentes niveles de compresion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo o su version cuantizada.

## Requisitos de hardware

- Los archivos GGUF varian entre 4.4 GB (i1-IQ2_M) y 7.4 GB (i1-Q4_K_M), por lo que la VRAM necesaria para inferencia depende de la cuantizacion elegida y del contexto utilizado.
- Con cuantizaciones de 4 bits (Q4_K_M, 7.4 GB) se puede ejecutar en GPUs de consumo con 8 GB de VRAM, como una RTX 3060 o RTX 4060, siempre que se gestione el contexto con cuidado.
- Para cuantizaciones mas bajas (IQ2_M, 4.4 GB) bastaria con 6 GB de VRAM, aunque la calidad se reduce notablemente.
- En CPU, se puede usar llama.cpp u Ollama, con un uso de RAM proporcional al tamano del archivo mas overhead.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF como llama-cpp-python.
- No se dispone de datos de latencia o throughput especificos para este modelo.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable con otros modelos de la misma categoria (12B, roleplay, sin alineacion). Se podria mencionar que existen alternativas como Mistral 7B o Llama 3.1 8B, pero no se conocen sus versiones especificas para roleplay explicito. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo esta etiquetado como "unaligned" y "dangerous", lo que implica que puede generar contenido ofensivo, ilegal o perjudicial sin filtros.
- Riesgo elevado de alucinaciones y de producir respuestas incoherentes o dañinas, especialmente en contextos sensibles.
- Solo soporta ingles; no se garantiza un rendimiento adecuado en otros idiomas.
- La licencia llama3.1 permite uso comercial, pero el contenido generado puede violar terminos de servicio de plataformas o leyes locales.
- No se ha verificado la calidad de los quants de baja precision (IQ2_M, Q2_K); se recomienda usar Q4_K_M o superior para un equilibrio razonable.
- No hay informacion sobre el contexto maximo soportado, lo que puede limitar su uso en conversaciones muy largas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Brisk-Evolution-12B-v0.1-i1-GGUF
- Modelo base (safetensors): https://huggingface.co/ReadyArt/Brisk-Evolution-12B-v0.1
- Version GGUF estatica (sin imatrix): https://huggingface.co/mradermacher/Brisk-Evolution-12B-v0.1-GGUF
- Pagina de descubrimiento de modelos GGUF: https://local-ai-zone.github.io/
- Lista de modelos GGUF: https://mitjafelicijan.github.io/gguf-list/
