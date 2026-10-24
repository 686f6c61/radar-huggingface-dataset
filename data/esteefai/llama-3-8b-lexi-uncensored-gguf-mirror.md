# EsteefAi/Llama-3-8B-Lexi-Uncensored-GGUF-mirror

## Resumen

Este repositorio no es un modelo nuevo, sino un **mirror** (copia espejo) de los ficheros GGUF de `Orenguteng/Llama-3-8B-Lexi-Uncensored-GGUF`, publicados por el usuario EsteefAi para que las instalaciones de su asistente Philibert sigan funcionando si el repositorio original se mueve o desaparece. Los pesos son idénticos byte a byte a los originales, tal y como declara la model card, que incluye el SHA-256 del único fichero publicado (`Lexi-Llama-3-8B-Uncensored_Q5_K_M.gguf`) para verificación. Todo el mérito corresponde a Orenguteng (fine-tune) y a Meta (modelo base Llama 3 8B).

El modelo subyacente es un fine-tune "uncensored" de Llama 3 8B, es decir, un transformer decoder-only denso de 8.030.261.248 parámetros (8,03 mil millones) ajustado para eliminar los rechazos y filtros de seguridad del modelo alineado. El resultado es un modelo conversacional que responde de forma muy permisiva a peticiones que un Llama 3 Instruct rechazaría, incluidas las de contenido sensible o éticamente cuestionable, según advierte el propio autor original.

Su relevancia práctica es doble: por un lado, sirve como caso de estudio de la infraestructura de distribución de modelos (mirrors, verificación por hash, despliegue vía Ollama con `hf.co/`); por otro, es una pieza habitual en flujos de *red teaming*, generación de datos sintéticos y evaluación de mecanismos de rechazo. No es un modelo para producción orientada a usuario final sin una capa de moderación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), modelo denso |
| Parámetros totales | 8.030.261.248 (8,03 B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (heredado de Llama 3 8B; no se declara explícitamente en la model card del mirror) |
| Tipos de cuantización | GGUF Q5_K_M (único fichero listado en el mirror); el repositorio original ofrece otras cuantizaciones que aquí no se incluyen |
| Idiomas soportados | no disponible (la model card del mirror no los declara ni documenta la cobertura del fine-tune) |
| Licencia | Meta Llama 3 Community License (`llama3`) |
| Formato de pesos | GGUF (`Lexi-Llama-3-8B-Uncensored_Q5_K_M.gguf`) |
| Modelo base | Orenguteng/Llama-3-8B-Lexi-Uncensored (a su vez, Llama 3 8B de Meta) |
| Autor del mirror | EsteefAi (Philibert); autor original del fine-tune: Orenguteng |
| Tamaño del repositorio | 5,7 GB |
| Verificación de integridad | SHA-256 `8b25788328bfa2d997013bf4f220cba0eddc43c8035143a9796b41800ecb4807` |
| Etiquetas relevantes | `gguf`, `mirror`, `endpoints_compatible`, `conversational` |
| Descargas / likes | 0 / 0 (según metadatos de HuggingFace en el momento de la consulta) |
| Fecha de creación (metadatos) | 2026-10-23 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3 8B: un transformer decoder-only denso con atención por grupos (GQA), normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE), con un vocabulario de 128.256 tokens. El modelo base fue preentrenado por Meta sobre aproximadamente 15 billones de tokens, con una composición mayoritariamente en inglés y una fracción de datos multilingües, y posteriormente alineado mediante SFT y RLHF para la variante Instruct.

Sobre esa base, Orenguteng aplicó un fine-tune orientado a eliminar el comportamiento de rechazo ("uncensored"). **La información disponible no documenta el método exacto** (no se especifica si se usó DPO, *abliteration*, fine-tune supervisado con datos sin filtro u otra técnica), ni el volumen o la composición del dataset de ajuste. Tampoco hay datos sobre si se preservó la cabeza Instruct o se partió del modelo base.

El repositorio aquí descrito no introduce ningún cambio técnico: es una copia sin modificar de los ficheros del autor original, con fines de disponibilidad y continuidad de descargas. No hay innovaciones propias del mirror (no hay decodificación especulativa, atención lineal ni modificaciones de tokenizador documentadas).

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con Llama 3.
- Respuestas de alta complacencia: el modelo acepta peticiones que un Llama 3 Instruct rechazaría, incluidas las de contenido sensible, según advierte el autor original.
- Redacción creativa y narrativa sin restricciones temáticas aparentes (ficción, roleplay, escenarios controvertidos).
- Continuación de texto libre y generación condicionada por prompt largo dentro de la ventana de contexto.
- Capacidad multilingüe: no documentada para este fine-tune; el modelo base Llama 3 se entrenó con datos en decenas de idiomas, pero no hay evaluación pública del fine-tune en castellano.
- Sin capacidades multimodales (texto únicamente).
- Soporte de *tool calling* / *function calling*: no documentado en la información disponible; al derivar de un fine-tune no Instruct, no debe asumirse.
- Soporte de agentes y razonamiento multi-paso: no documentado ni evaluado.
- Modo "thinking" o razonamiento explícito: no disponible.

## Casos de uso

- **Red teaming y evaluación de seguridad**: usar el modelo como generador adversarial para producir prompts y respuestas que permitan medir la robustez de clasificadores de contenido y de filtros de moderación propios.
- **Generación de datos sintéticos para moderación**: crear *hard negatives* y ejemplos etiquetados de contenido no deseado con los que entrenar o afinar clasificadores de toxicidad, siempre en un entorno controlado y con revisión humana.
- **Investigación sobre alineación y rechazo**: comparar las distribuciones de respuesta de este fine-tune frente a Llama 3 8B Instruct para estudiar qué comportamientos se eliminan con el *uncensoring* y a qué coste en utilidad general.
- **Escritura de ficción y narrativa adulta**: el modelo mantiene la coherencia en contextos de hasta 8.192 tokens, lo que permite mantener personajes y tramas a lo largo de capítulos, sin los rechazos que interfieren en un modelo alineado.
- **Roleplay y asistentes de personaje en local**: despliegue con Ollama o llama.cpp en una GPU de consumo, sin enviar conversaciones a servicios externos, lo que resulta adecuado para prototipos de entretenimiento que requieren privacidad.
- **Pruebas de regresión de pipelines de inferencia**: al ser un GGUF Q5_K_M verificado por hash y con tamaño contenido (5,7 GB), sirve como modelo de referencia reproducible para validar despliegues de llama.cpp, Ollama o LM Studio antes de pasar a modelos mayores.
- **Traducción y reescritura de contenido sensible**: útil en flujos editoriales donde el material de origen es explícito o controvertido y un modelo alineado bloquearía la tarea; requiere revisión humana y cumplimiento normativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del mirror ni los resultados de búsqueda consultados incluyen cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de evaluaciones de seguridad para este fine-tune.

## Requisitos de hardware

- **VRAM estimada**: el fichero Q5_K_M ocupa aproximadamente 5,7 GB, por lo que la inferencia completa en GPU requiere del orden de 6,5-7,5 GB de VRAM incluyendo contexto y caché KV.
- **GPU de consumo compatibles**: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 / 4070 Ti, RTX 4080, RTX 4090; también GPUs de 8 GB con contexto reducido o cuantizaciones menores del repositorio original.
- **No cabe** en GPUs de 4-6 GB de VRAM de forma completa; es posible el *offload* parcial a CPU con llama.cpp a costa de latencia.
- **Apple Silicon**: ejecutable en equipos con 16 GB de memoria unificada o más mediante llama.cpp, Ollama o LM Studio.
- **CPU sola**: viable con llama.cpp (8 GB de RAM o más), con throughput bajo.
- **Opciones de despliegue**: Ollama (`ollama pull hf.co/EsteefAi/Llama-3-8B-Lexi-Uncensored-GGUF:Q5_K_M`), llama.cpp, LM Studio, koboldcpp. El tag `endpoints_compatible` sugiere compatibilidad con la API de endpoints de HuggingFace. Para vLLM o TGI sería necesario convertir el GGUF o usar los pesos safetensors del repositorio original.
- **Latencia y throughput**: no disponible; no se han publicado mediciones de tokens por segundo para este fichero.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Benchmarks públicos | Notas |
|---|---|---|---|---|---|---|
| EsteefAi/Llama-3-8B-Lexi-Uncensored-GGUF-mirror (este repo) | 8,03 B | 8.192 tokens | GGUF Q5_K_M | Llama 3 Community | no disponibles | Mirror byte a byte; 5,7 GB; verificado por SHA-256 |
| Orenguteng/Llama-3-8B-Lexi-Uncensored (original) | 8,03 B | 8.192 tokens | safetensors | Llama 3 Community | no disponibles | Fuente del fine-tune; pesos sin cuantizar |
| Orenguteng/Llama-3-8B-Lexi-Uncensored-GGUF | 8,03 B | 8.192 tokens | GGUF (varias cuantizaciones) | Llama 3 Community | no disponibles | Repositorio original con Q2-Q8 y variantes K_S/K_M |
| bartowski/Lexi-Llama-3-8B-Uncensored-GGUF | 8,03 B | 8.192 tokens | GGUF (Q4_K_M ~4,92 GB; Q5_K_S ~5,59 GB) | Llama 3 Community | no disponibles | Re-cuantización de terceros con más opciones de tamaño |
| Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 tokens | safetensors / GGUF comunitario | Llama 3 Community | Publicados por Meta | Alineado; rechaza contenido sensible, lo que lo hace menos útil para los casos de uso anteriores |

## Limitaciones y advertencias

- **Modelo "uncensored"**: por diseño responde a peticiones éticamente cuestionables. El autor original advierte explícitamente de que el usuario es responsable del contenido generado.
- **Riesgo legal y reputacional**: desplegarlo en un producto orientado al público sin moderación propia puede infringir normativas de contenido (por ejemplo, DSA en la UE) y las políticas de las plataformas de distribución.
- **Alucinaciones**: al ser un fine-tune sobre una base de 8 B, la tasa de afirmaciones incorrectas es alta, especialmente en dominios factuales y en contextos largos.
- **Sin datos de evaluación**: no hay benchmarks publicados, ni de capacidad general ni de seguridad, por lo que su calidad real frente a Llama 3 8B Instruct es desconocida.
- **Idiomas no documentados**: no hay evidencia de que el castellano se haya mantenido con calidad tras el fine-tune; conviene evaluarlo antes de usarlo en producción en español.
- **Contexto limitado a 8.192 tokens**: insuficiente para casos de documentación extensa o conversaciones muy largas.
- **Tool calling y agentes**: no documentados; no deben asumirse al no derivar de una variante Instruct.
- **Licencia**: Meta Llama 3 Community License. Permite uso comercial con condiciones (atribución "Built with Llama", inclusión de la licencia y del aviso NOTICE, y restricciones para entidades con más de 700 millones de usuarios activos mensuales). Requiere revisar `LICENSE`, `USE_POLICY.md` y `NOTICE` del repositorio original.
- **Naturaleza del repositorio**: es un mirror de terceros no oficial. Aunque la model card publica el SHA-256 para verificación, la cadena de confianza depende de EsteefAi; para uso crítico conviene descargar del repositorio original de Orenguteng.
- **Mantenimiento**: el mirror tiene 0 descargas y 0 likes, y no hay compromiso documentado de actualización; puede quedar obsoleto o desaparecer.

## Enlaces

- Mirror en HuggingFace: https://huggingface.co/EsteefAi/Llama-3-8B-Lexi-Uncensored-GGUF-mirror
- Repositorio GGUF original: https://huggingface.co/Orenguteng/Llama-3-8B-Lexi-Uncensored-GGUF
- Modelo original (safetensors): https://huggingface.co/Orenguteng/Llama-3-8B-Lexi-Uncensored
- Ficha en Inferix (original): https://inferix.co/models/Orenguteng/Llama-3-8B-Lexi-Uncensored-GGUF
- Ficha en Inferix (re-cuantización de bartowski): https://inferix.co/models/bartowski/Lexi-Llama-3-8B-Uncensored-GGUF
- Ficha en Secret AI: https://secretai.io/models/Orenguteng/Llama-3-8B-Lexi-Uncensored-GGUF
- Perfil del autor del mirror: https://huggingface.co/EsteefAi
- Licencia Meta Llama 3: https://llama.meta.com/llama3/license/
