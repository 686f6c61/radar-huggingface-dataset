# mradermacher/MN-Starlight-Sylph-12B-i1-GGUF

## Resumen

MN-Starlight-Sylph-12B-i1-GGUF es una versión cuantizada en formato GGUF del modelo MN-Starlight-Sylph-12B, desarrollado por EldritchLabs. La cuantización ha sido realizada por mradermacher, que ofrece un amplio abanico de tamaños de archivo desde 3,1 GB (IQ1_S) hasta 10,2 GB (Q6_K) mediante cuantización imatrix. El modelo base es un merge de modelos Mistral NeMo 12B construido con MergeKit, orientado específicamente a escritura creativa, ficción narrativa, roleplaying y generación de historias. Con 12.247.782.400 parámetros y licencia Apache 2.0, está pensado para ejecución local en hardware de consumo, aprovechando la eficiencia de las cuantizaciones GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Mistral NeMo 12B) |
| Parametros totales | 12.247.782.400 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, IQ4_NL, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer decoder-only, heredada de la familia Mistral NeMo 12B. Los tags del repositorio indican que el modelo se ha construido mediante un merge de varios modelos utilizando MergeKit y la técnica Della, lo que sugiere una combinación de pesos de diferentes modelos afinados para escritura y roleplaying. No se dispone de información detallada sobre el dataset de entrenamiento ni sobre procesos de alineación como RLHF o DPO. La cuantización imatrix de mradermacher utiliza una matriz de importancia para reducir el error de cuantización, especialmente en los niveles más bajos.

## Capacidades

- Generación de texto creativo y narrativo: ficción, ciencia ficción, romance, aventuras, desarrollo de tramas y subtramas.
- Roleplaying y conversación: soporta juegos de rol basados en texto, con personajes y continuidad de escenas.
- Escritura vívida: orientado a prosa descriptiva y estilos narrativos intensos, según los tags del modelo.
- Lenguaje explícito: los tags incluyen "swearing", por lo que puede generar lenguaje soez sin filtros aparentes.
- Monolingüe: solo inglés, sin soporte documentado para otros idiomas.
- Sin soporte de tool calling, visión o audio: no se menciona ninguna de estas capacidades en la información disponible.

## Casos de uso

- Generación de novelas y relatos: el modelo puede producir capítulos completos de ficción con desarrollo de personajes y escenas, gracias a su especialización en narrativa y subtramas. Se integraría en herramientas de escritura asistida como generador de borradores o asistente de brainstorming.
- Roleplaying en juegos de texto: en aventuras conversacionales, el modelo puede actuar como narrador o como personajes no jugadores, manteniendo la coherencia de la historia y respondiendo a las acciones del jugador.
- Creación de diálogos para videojuegos: los desarrolladores pueden usar el modelo para generar líneas de diálogo variadas y con estilo, reduciendo el tiempo de escritura manual en juegos narrativos.
- Asistente de escritura para autores: el modelo ayuda a generar ideas de tramas, subtramas y giros argumentales, así como a continuar escenas con un estilo vívido y descriptivo.
- Aplicaciones de chat con tono creativo: se puede desplegar en chatbots de entretenimiento o en plataformas de roleplaying online, donde el modelo produce respuestas largas y detalladas en lugar de respuestas cortas y genéricas.
- Generación de contenido de ciencia ficción y romance: gracias a los tags de géneros, el modelo es adecuado para producir historias de estos géneros, con prosa cuidada y vocabulario específico.
- Continuación de escenas y storytelling: en herramientas de escritura colaborativa, el modelo puede continuar una escena a partir de un prompt, manteniendo el tono y el estilo del texto anterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según la cuantización (tamaño del archivo GGUF): IQ1_S 3,1 GB, Q4_K_S 7,2 GB, Q4_K_M 7,6 GB, Q5_K_M 8,8 GB, Q6_K 10,2 GB. Hay que añadir el overhead del contexto y del runtime, por lo que se recomienda una VRAM adicional de 1-2 GB.
- GPU recomendadas: RTX 3060 12GB para Q4_K_M, RTX 4090 para Q6_K, A100/H100 para despliegues con mayor throughput.
- Cabe en GPUs de consumo de 8-12 GB con cuantizaciones Q4 o inferiores. Las cuantizaciones IQ1 e IQ2 permiten ejecución en 4-6 GB, aunque con pérdida de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui. El modelo también es compatible con endpoints (endpoints_compatible) para servicios de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa exhaustiva con modelos similares en los datos proporcionados. El modelo base es EldritchLabs/MN-Starlight-Sylph-12B, del cual este repositorio es una cuantización. Se puede considerar Mistral NeMo 12B como referencia de la familia, pero no se han facilitado datos de contexto ni benchmarks en la información disponible.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| MN-Starlight-Sylph-12B (base) | 12.247.782.400 | no disponible | Apache 2.0 | safetensors | HuggingFace |
| MN-Starlight-Sylph-12B-i1-GGUF (este repo) | 12.247.782.400 | no disponible | Apache 2.0 | GGUF | HuggingFace |
| Mistral NeMo 12B (referencia) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no hay datos específicos, pero al ser un merge de modelos puede heredar sesgos de los modelos base.
- Riesgo de alucinación: inherente a los modelos de lenguaje, especialmente en generación creativa donde no hay verificación de hechos.
- Limitaciones de contexto: la longitud de contexto no está documentada en la información disponible, lo que puede afectar a la coherencia en textos largos.
- Limitaciones de idioma: solo inglés, sin soporte para otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base puede tener atribuciones o avisos adicionales no documentados.
- Caveat de cuantización: las cuantizaciones muy agresivas (IQ1_S, IQ2_XXS) degradan notablemente la calidad y pueden producir salidas incoherentes.
- Caveat de producción: al ser un modelo de escritura creativa, no está diseñado para tareas factuales, de razonamiento lógico o tool calling. No se menciona soporte para funciones de agente.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/MN-Starlight-Sylph-12B-i1-GGUF
- Modelo base (EldritchLabs/MN-Starlight-Sylph-12B): https://huggingface.co/EldritchLabs/MN-Starlight-Sylph-12B
- Quants estáticos (sin imatrix): https://huggingface.co/mradermacher/MN-Starlight-Sylph-12B-GGUF
- Página de descargas del modelo: https://hf.tst.eu/model#MN-Starlight-Sylph-12B-i1-GGUF
