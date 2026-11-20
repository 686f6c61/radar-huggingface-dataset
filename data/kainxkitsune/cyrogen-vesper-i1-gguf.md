# Kainxkitsune/Cyrogen-Vesper-i1-GGUF

## Resumen

Cyrogen-Vesper-i1-GGUF es una cuantizacion en formato GGUF del modelo Cyrogen-Vesper, un merge de modelos de la familia Vesper-26B-A4B. Lo publica el usuario Kainxkitsune en Hugging Face bajo licencia Apache 2.0. El modelo esta etiquetado explicitamente como NSFW, uncensored y orientado a roleplay y contenido adulto, con soporte unicamente para ingles. La model card no aporta documentacion tecnica sustantiva: el contenido del README es fundamentalmente una hoja de estilos CSS para la presentacion de la propia tarjeta.

El dato de parametros totales registrado en safetensors es de 28.444.095, una cifra que no concuerda con la nomenclatura "26B-A4B" de los modelos base (que sugiere una arquitectura MoE de aproximadamente 26 mil millones de parametros totales y 4 mil millones activos). Esta discrepancia debe tratarse con cautela: o bien el conteo corresponde a un subconjunto de tensores, o bien la nomenclatura de los modelos base no refleja el tamano real del merge. No hay informacion disponible que permita resolver la contradiccion.

El modelo es relevante unicamente dentro del nicho de roleplay adulto sin censura, y su utilidad general para desarrollo o investigacion es muy limitada: cero descargas, cero likes, ausencia de benchmarks, de documentacion de entrenamiento y de especificaciones de contexto. Se trata de un artefacto de publicacion reciente (noviembre de 2026) sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los modelos base se etiquetan como MoE; sin confirmacion documental) |
| Parametros totales | 28.444.095 (segun safetensors); la nomenclatura de los modelos base indica "26B-A4B" |
| Parametros activos | no disponible (la etiqueta "A4B" sugiere ~4B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix (niveles concretos no especificados) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 0,1 GB) |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna del modelo en la documentacion proporcionada. Las etiquetas indican "moe" y "merge", lo que sugiere que el modelo base Cyrogen-Vesper resulta de la fusion de los modelos zerofata/G4-MeroMero-26B-A4B y ReadyArt/Vesper-26B-A4B-Nocturne, ambos presumiblemente con arquitectura Mixture of Experts. La cuantizacion se realizo con imatrix, tecnica que emplea una matriz de importancia para preservar mejor la calidad en cuantizaciones agresivas.

No se documentan volumen de tokens de entrenamiento, composicion del dataset, ni fases de RLHF, DPO o fine-tuning supervisado. Tampoco se describen innovaciones tecnicas como decodificacion especulativa o atencion lineal. Cualquier afirmacion sobre el proceso de entrenamiento seria especulativa.

## Capacidades

- Generacion de texto conversacional orientada a roleplay y narrativa interactiva.
- Contenido adulto y material NSFW sin censura, segun la etiqueta "uncensored".
- Conversacion multi-turno (etiqueta "conversational"), aunque sin contexto documentado.
- Capacidad multilingue limitada al ingles.
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- No se documentan capacidades de codigo ni matematicas.

## Casos de uso

- Roleplay conversacional para adultos: el modelo esta disenado especificamente para mantener personajes y narrativa en conversaciones multi-turno sin restricciones de contenido, lo que lo hace adecuado para plataformas de ficcion interactiva para publico adulto.
- Generacion de ficcion erotica: puede producir texto narrativo explicito de forma consistente, un nicho donde los modelos alineados rechazan la tarea.
- Prototipado de chatbots de personaje: util para desarrolladores que necesiten un modelo sin filtros de contenido para experimentar con sistemas de personajes, siempre que se gestionen las salvaguardas a nivel de aplicacion.
- Investigacion sobre comportamiento de modelos sin censura: permite estudiar como responde un modelo sin alineacion de seguridad ante prompts sensibles, en entornos controlados.
- Generacion de dialogos para videojuegos narrativos para adultos: integrable en motores de dialogo ramificado donde se requiera contenido explicito.
- Experimentacion con merges y cuantizaciones GGUF: como artefacto de prueba para evaluar el efecto de imatrix en la calidad de un merge MoE, aunque sin benchmarks publicados la evaluacion seria puramente cualitativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision. El repo GGUF ocupa 0,1 GB, lo que sugiere una cuantizacion muy agresiva o un subconjunto de pesos; no es representativo del modelo completo.
- Si el modelo completo ronda los 26B parametros, en Q4_K_M requeriria aproximadamente 15-16 GB de VRAM; en Q8 aproximadamente 27-28 GB. Estas cifras son estimaciones basadas en la nomenclatura, no en datos publicados.
- GPU recomendadas: no disponibles. Para un modelo de ese tamano serian necesarias RTX 4090 (24 GB) en cuantizaciones bajas, o A100/H100 para precision completa.
- Despliegue: al ser GGUF, es compatible con llama.cpp y Ollama; vLLM y TGI requeririan conversion a safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Cyrogen-Vesper-i1-GGUF | 28,4M (segun safetensors) / "26B-A4B" (nomenclatura) | no disponible | Apache 2.0 | Roleplay NSFW sin censura | GGUF, 0 descargas |
| zerofata/G4-MeroMero-26B-A4B | "26B-A4B" | no disponible | no disponible | Modelo base del merge | Hugging Face |
| ReadyArt/Vesper-26B-A4B-Nocturne | "26B-A4B" | no disponible | no disponible | Modelo base del merge | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Contenido explicito y NSFW: el modelo esta marcado como "not-for-all-audiences"; no debe desplegarse en entornos accesibles a menores ni sin moderacion.
- Ausencia total de benchmarks y documentacion tecnica: imposible evaluar calidad, sesgos o robustez antes de usarlo.
- Discrepancia en el conteo de parametros: el dato de safetensors (28,4M) contradice la nomenclatura "26B-A4B", lo que impide planificar requisitos de hardware con fiabilidad.
- Solo ingles: no apto para produccion en castellano u otros idiomas.
- Riesgo elevado de alucinacion y de comportamiento impredecible al ser un merge sin evaluacion publicada.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad legal sobre el contenido generado recae en el desplegador.
- Cero adopcion comunitaria (0 descargas, 0 likes): sin senales de validacion por terceros.
- La model card no contiene informacion tecnica util; el README es principalmente CSS.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kainxkitsune/Cyrogen-Vesper-i1-GGUF
- Modelo base: https://huggingface.co/Kainxkitsune/Cyrogen-Vesper
- Modelo base del merge: https://huggingface.co/zerofata/G4-MeroMero-26B-A4B
- Modelo base del merge: https://huggingface.co/ReadyArt/Vesper-26B-A4B-Nocturne
