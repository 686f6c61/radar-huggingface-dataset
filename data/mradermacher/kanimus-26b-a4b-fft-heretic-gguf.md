# mradermacher/Kanimus-26B-A4B-FFT-heretic-GGUF

## Resumen

Kanimus-26B-A4B-FFT-heretic es un modelo de lenguaje de tipo mezcla de expertos (MoE) con 26 000 millones de parámetros totales y 4 000 millones de parámetros activos, desarrollado mediante una fusión de modelos (merge) sobre la arquitectura Gemma 4 de Google. El modelo original, publicado por SubMaroon, está orientado a tareas conversacionales y de roleplay, con soporte para inglés y ruso. Esta versión concreta, cuantizada por mradermacher, ofrece el modelo en formato GGUF para su despliegue eficiente en entornos de CPU y GPU de consumo.

La relevancia de esta ficha radica en que se trata de una cuantización lista para usar con herramientas como llama.cpp u Ollama, lo que permite ejecutar un modelo de 26B con solo 4B activos en hardware moderado. El modelo incluye además un suplemento multimodal (mmproj) que sugiere capacidades de visión, aunque no se detalla su integración en la documentación disponible. Su licencia Gemma permite uso comercial bajo los términos de Google, lo que lo hace atractivo para aplicaciones de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Gemma 4, con 26B totales y 4B activos (segun nomenclatura del modelo) |
| Parametros totales | 25 233 142 046 (dato real, safetensors) |
| Parametros activos | 4B (segun nomenclatura del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; ademas mmproj en Q8_0 y f16 |
| Idiomas soportados | ingles, ruso |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | GGUF (cuantizado); safetensors para el modelo original |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusion mediante mergekit con la tecnica task_arithmetic, aplicada sobre modelos base de la familia Gemma 4. La arquitectura es de tipo MoE, con 26 000 millones de parametros totales y 4 000 millones activos por token, lo que reduce el coste computacional en inferencia. No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens procesados ni el uso de tecnicas como RLHF o DPO. El tag "roleplay" y los idiomas soportados (en, ru) sugieren un ajuste orientado a conversacion y narrativa, pero no se confirma en la documentacion.

La cuantizacion GGUF ha sido realizada por mradermacher, que ofrece multiples niveles de precision (de Q2_K a Q8_0) para adaptarse a distintos requisitos de memoria y calidad. El repositorio incluye ademas un archivo mmproj (multi-modal supplement) en dos variantes (Q8_0 y f16), lo que indica que el modelo original podria tener capacidades de vision, aunque no se especifica como se integra.

## Capacidades

- Generacion de texto conversacional y narrativo, orientado a roleplay y dialogo multi-turno.
- Soporte multilingue para ingles y ruso, con posible transferencia a otros idiomas no documentada.
- Capacidades multimodales potenciales gracias al suplemento mmproj, aunque no se detalla su funcionamiento.
- Compatible con herramientas de inferencia GGUF como llama.cpp, Ollama y LM Studio.
- No se ha documentado soporte explicito para tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Chatbots de atencion al cliente en ingles y ruso: el modelo puede mantener conversaciones fluidas y contextuales, adecuado para entornos de soporte bilingue.
- Aplicaciones de roleplay y narrativa interactiva: su orientacion a roleplay permite generar historias y personajes coherentes en sesiones largas.
- Asistente de escritura creativa: puede ayudar a redactar dialogos, descripciones y tramas en ambos idiomas.
- Traduccion informal y adaptacion de contenido: aunque no es un modelo de traduccion dedicado, su bilingüismo en/ru permite tareas de reformulacion y localizacion ligera.
- Prototipado rapido de asistentes virtuales: al estar en GGUF, se puede desplegar localmente en equipos de desarrollo para pruebas sin depender de APIs externas.
- Generacion de contenido para redes sociales o blogs en ruso e ingles: su capacidad de generar texto creativo y conversacional puede aprovecharse para redactar publicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estandar para este modelo o su version original.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el quant elegido, desde ~10.7 GB (Q2_K) hasta ~27 GB (Q8_0). Para Q4_K_M (16.9 GB) se recomienda al menos 20 GB de VRAM libre.
- GPU recomendadas: RTX 4090 (24 GB) para quants hasta Q5_K_M; A100 40/80 GB o H100 para Q8_0 o mayor margen.
- En CPU: viable con llama.cpp, aunque la velocidad dependera del numero de nucleos y la memoria RAM (se recomienda al menos 32 GB para quants medianos).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores compatibles con GGUF (por ejemplo, text-generation-webui).
- Latencia y throughput: no disponibles; dependen del hardware y del quant utilizado.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoria (por ejemplo, Gemma 4 26B A4B original, Mixtral 8x7B o Qwen 25B MoE). La informacion publica no incluye benchmarks ni evaluaciones que permitan una comparacion objetiva. Se recomienda consultar el modelo original en HuggingFace para posibles referencias.

## Limitaciones y advertencias

- Al ser un modelo de fusion (merge), puede heredar sesgos o inconsistencias de los modelos base, especialmente en tareas fuera de su dominio principal (roleplay y conversacion).
- Riesgo de alucinacion en contextos factuales; no es adecuado para tareas que requieran precision enciclopedica sin verificacion externa.
- La longitud de contexto no esta documentada; se desconoce si soporta ventanas largas (por ejemplo, 8K o 16K tokens).
- La licencia Gemma de Google impone restricciones de uso comercial; es necesario revisar los terminos completos antes de desplegar en produccion.
- El suplemento multimodal (mmproj) no esta documentado; su funcionamiento y compatibilidad con el modelo principal no estan garantizados.
- No se ha verificado el soporte para tool calling o integracion con agentes; su uso en pipelines complejos requeriria pruebas adicionales.

## Enlaces

- Modelo cuantizado GGUF: https://huggingface.co/mradermacher/Kanimus-26B-A4B-FFT-heretic-GGUF
- Modelo original (SubMaroon): https://huggingface.co/SubMaroon/Kanimus-26B-A4B-FFT-heretic
- Cuantizaciones con imatrix (variante i1): https://huggingface.co/mradermacher/Kanimus-26B-A4B-FFT-heretic-i1-GGUF
- Modelo similar de la misma serie (gemma-4-26B-A4B-it-heretic-GGUF): https://huggingface.co/mradermacher/gemma-4-26B-A4B-it-heretic-GGUF
- Pagina oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
