# mradermacher/Qwen3.5-35B-A3B-ultra-uncensored-heretic-i1-GGUF

## Resumen

Qwen3.5-35B-A3B-ultra-uncensored-heretic-i1-GGUF es una cuantizacion en formato GGUF del modelo llmfan46/Qwen3.5-35B-A3B-ultra-uncensored-heretic, publicada por el usuario mradermacher, conocido en la comunidad por generar versiones cuantizadas de modelos abiertos. El modelo base es un ajuste fino de la familia Qwen3.5 en su variante 35B-A3B, es decir, una arquitectura de mezcla de expertos (MoE) con aproximadamente 34.660 millones de parametros totales y alrededor de 3.000 millones de parametros activos por token, segun la nomenclatura "A3B". El sufijo "ultra-uncensored-heretic" indica que el ajuste fino se ha orientado a eliminar o reducir los mecanismos de rechazo y alineacion del modelo original.

Esta ficha describe la version cuantizada i1 (imatrix) en GGUF, pensada para inferencia local en hardware de consumo mediante llama.cpp y herramientas compatibles. El repositorio ocupa 28,8 GB e incluye un conjunto amplio de cuantizaciones que van desde IQ1_S hasta Q6_K, lo que permite desplegar el modelo en un rango muy variado de capacidades de VRAM y RAM. El modelo se etiqueta como "conversational" y "endpoints_compatible", lo que sugiere uso en dialogos y compatibilidad con endpoints tipo API.

La relevancia de esta publicacion radica en que combina un modelo MoE de gran tamano con cuantizaciones agresivas (imatrix) que reducen el requisito de memoria, ademas de un ajuste fino sin censura orientado a usos donde el modelo original rechazaria peticiones. No obstante, la informacion publica disponible es muy limitada: no hay datos de licencia, idiomas, benchmarks ni detalles del dataset de ajuste fino, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, segun nomenclatura 35B-A3B (detalles internos no disponibles) |
| Parametros totales | 34.660.610.688 (~34,66 B) |
| Parametros activos | ~3 B (inferido de la nomenclatura A3B; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones con imatrix) |
| Tamano del repositorio | 28,8 GB |
| Version de cuantizacion | quantize_version 2, output_tensor_quantised 1, convert_type hf |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen3.5 en su variante MoE 35B-A3B, lo que implica una arquitectura de mezcla de expertos con aproximadamente 34,66 mil millones de parametros totales y en torno a 3 mil millones activos por token. La model card del repositorio cuantizado no aporta detalles sobre el numero de expertos, la estrategia de enrutamiento, la longitud de contexto nativa ni la composicion del corpus de entrenamiento. Tampoco se documenta si el ajuste fino "ultra-uncensored-heretic" empleo RLHF, DPO u otra tecnica de alineacion inversa orientada a eliminar rechazos.

La informacion tecnica concreta que si aparece en el repositorio se refiere al proceso de cuantizacion: se trata de cuantizaciones ponderadas con imatrix (matriz de importancia) generadas a partir del modelo original en precision completa de llmfan46, con version de cuantizacion 2 y conversion desde formato Hugging Face. La etiqueta "i1" en el nombre del repositorio hace referencia a este esquema de cuantizacion con imatrix, que suele preservar mejor la calidad en bits bajos que la cuantizacion estandar. No se dispone de informacion sobre innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational" del repositorio.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Qwen3.5, aunque no se detallan en la model card.
- Compatibilidad con endpoints tipo API ("endpoints_compatible"), lo que facilita su integracion en servicios de inferencia.
- Ajuste fino orientado a reducir rechazos y censura ("ultra-uncensored-heretic"), pensado para peticiones que el modelo original declinaria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles (idiomas no declarados).
- Vision, audio o modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar un MoE de ~35B con ~3B activos en GPU de consumo, usando llama.cpp u Ollama, con un equilibrio razonable entre calidad y memoria.
- Servicios de inferencia con throughput alto: al activar solo ~3B parametros por token, el modelo puede ofrecer una latencia por token baja en comparacion con modelos densos de 35B, adecuado para endpoints conversacionales de alta concurrencia.
- Investigacion sobre alineacion y censura: el ajuste "uncensored-heretic" lo convierte en un objeto de estudio para analizar como se comporta un modelo sin mecanismos de rechazo y que sesgos o riesgos emergen.
- Generacion creativa sin restricciones tematicas: escritura de ficcion, guiones o contenido donde el modelo original aplicaria filtros de contenido, con la advertencia de supervision humana.
- Prototipado rapido de asistentes conversacionales: gracias a su tamano moderado en cuantizaciones bajas (IQ2/IQ3) puede ejecutarse en equipos con 16-24 GB de RAM/VRAM para pruebas de concepto.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye 24 variantes de cuantizacion, lo que permite medir la degradacion de calidad entre IQ1_S y Q6_K en un mismo modelo MoE.
- Fine-tuning y destilacion posteriores: el modelo base en precision completa (llmfan46) puede servir como punto de partida, aunque esta ficha cubre solo la version GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (aproximada, segun cuantizacion y ~35B parametros totales):
  - IQ1_S / IQ2_XXS: en torno a 10-13 GB.
  - Q2_K / IQ3_XXS: en torno a 13-16 GB.
  - Q3_K_M / IQ4_XS: en torno a 16-20 GB.
  - Q4_K_M: en torno a 20-23 GB.
  - Q5_K_M: en torno a 24-27 GB.
  - Q6_K: en torno a 28-30 GB.
- GPU recomendadas: para Q4_K_M o superiores, RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100 80 GB. Para cuantizaciones IQ2/IQ3, GPUs de 16 GB como RTX 4080 o RTX 4060 Ti 16 GB.
- Cabe en GPU de consumo: si, en cuantizaciones Q4_K_M o inferiores en GPUs de 24 GB; las variantes Q5/Q6 requieren 32 GB o repartir entre GPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; la etiqueta "endpoints_compatible" sugiere uso con APIs tipo OpenAI.
- Latencia y throughput: no disponibles; al ser un MoE con ~3B activos, se espera un throughput por token notablemente superior al de un denso de 35B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B-ultra-uncensored-heretic (i1-GGUF) | ~34,66 B totales, ~3 B activos | no disponible | no disponible | GGUF | Ajuste sin censura, 24 cuantizaciones |
| Modelo base llmfan46/Qwen3.5-35B-A3B-ultra-uncensored-heretic | ~34,66 B totales | no disponible | no disponible | safetensors (presumible) | Precision completa, punto de partida de las cuantizaciones |
| Familia Qwen3.5-35B-A3B oficial | ~34,66 B totales, ~3 B activos | no disponible | no disponible | safetensors, GGUF | Modelo original alineado, sin ajuste "uncensored" |
| Otros MoE abiertos de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados |

La comparativa se limita a variantes del mismo modelo porque la informacion proporcionada no incluye datos de rendimiento ni especificaciones de alternativas que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El ajuste "ultra-uncensored-heretic" elimina o reduce los rechazos del modelo original, lo que aumenta el riesgo de generar contenido danino, ofensivo o inexacto sin filtros; requiere supervision humana y politicas de uso claras.
- Riesgo elevado de alucinacion, especialmente en cuantizaciones muy bajas (IQ1_S, IQ2_XXS, Q2_K), donde la degradacion de pesos puede afectar a la coherencia.
- No se declara licencia: no hay certeza sobre si el uso comercial esta permitido; debe consultarse el modelo base y la licencia de Qwen3.5 antes de cualquier despliegue en produccion.
- Idiomas soportados no declarados; el rendimiento en castellano no esta verificado.
- Longitud de contexto no disponible; no se puede garantizar el manejo de conversaciones largas o documentos extensos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validacion por parte de la comunidad.
- Las cuantizaciones con imatrix de bits muy bajos pueden introducir artefactos en tareas de razonamiento o codigo; se recomienda Q4_K_M o superior para uso serio.
- No hay benchmarks publicados que permitan estimar la perdida de calidad respecto al modelo en precision completa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-35B-A3B-ultra-uncensored-heretic-i1-GGUF
- Modelo base (precision completa): https://huggingface.co/llmfan46/Qwen3.5-35B-A3B-ultra-uncensored-heretic
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Paper, blog o demo oficial: no disponible en la informacion proporcionada.
