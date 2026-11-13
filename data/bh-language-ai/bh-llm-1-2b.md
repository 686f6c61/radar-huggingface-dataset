# BH-Language-AI/bh-llm-1-2b

## Resumen

BH-LLM-1-2B es un proyecto de modelo de lenguaje fundamental para el bosnio, anunciado por el colectivo BH-Language-AI como primera generación de su familia BH-LLM. En el momento de la consulta, el repositorio de Hugging Face no contiene pesos: la propia model card lo declara explícitamente con el estado "NIJE TRENIRAN" (no entrenado) y aclara que se trata de una tarjeta de proyecto, no de un modelo utilizable. Por tanto, no existe ningún artefacto descargable ni inferencia posible.

El modelo base seleccionado como candidato es BSC-LT/salamandra-2b, un modelo de 2.000 millones de parámetros desarrollado por el Barcelona Supercomputing Center dentro de la familia Salamandra, publicado bajo licencia Apache-2.0. La elección de una base de 2B con cobertura multilingüe (incluido el bosnio) resulta coherente con el objetivo de especializar un modelo compacto en un idioma de bajos recursos, aunque la ficha no aporta detalles sobre el proceso de adaptación previsto.

La relevancia actual del proyecto es fundamentalmente prospectiva: el bosnio es un idioma escasamente representado en los grandes modelos abiertos y una iniciativa comunitaria centrada en él podría cubrir una carencia real. Sin embargo, cualquier evaluación técnica, comparativa o despliegue en producción queda bloqueada hasta que el autor publique pesos entrenados y una evaluación verificada, condiciones que la propia model card establece como requisito previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el modelo base BSC-LT/salamandra-2b es un transformer decoder-only, pero la ficha del proyecto no detalla la arquitectura final) |
| Parametros totales | no disponible (el nombre sugiere ~2B, coherente con la base Salamandra-2B; no confirmado en la model card) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bosnio (bs) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (no se han publicado pesos) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo final. La model card únicamente identifica BSC-LT/salamandra-2b como candidato a base, un modelo de la familia Salamandra del BSC. No se especifican detalles sobre el proceso de entrenamiento, el volumen de tokens, la composición del corpus bosnio, ni si se prevé aplicar ajuste supervisado, RLHF o DPO.

La única información procedente del autor sobre el proceso es de carácter organizativo: la nomenclatura `bh-llm-{generacion}-{tamano}` (compartida con la familia BH-Decision), la colección BH-LLM-Basic y la política de publicar pesos solo tras un entrenamiento aprobado y una evaluación verificada. No hay innovaciones técnicas documentadas.

## Capacidades

- No hay capacidades verificadas: el modelo no ha sido entrenado ni se han publicado pesos.
- El pipeline declarado es `text-generation`, lo que indica la intención de que sea un modelo generativo de texto.
- El único idioma declarado es el bosnio (`bs`).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento.
- No se documentan capacidades multilingües más allá del bosnio.

## Casos de uso

No es posible definir casos de uso operativos mientras no existan pesos publicados. Los siguientes escenarios son los que el proyecto declara perseguir de forma implícita, pero ninguno es ejecutable en la actualidad:

- Generación de texto en bosnio: el objetivo declarado del proyecto es servir como modelo fundamental para el idioma, pero sin pesos no puede emplearse para ninguna tarea generativa.
- Especialización sobre una base multilingüe: la elección de Salamandra-2B sugiere la intención de adaptar un modelo compacto al bosnio, pero no hay evidencia de que el ajuste se haya realizado.
- Evaluación comparativa de modelos para lenguas de bajos recursos: el proyecto podría servir como referencia futura en este ámbito una vez publicado, pero hoy no aporta artefacto evaluable.
- Integración en pipelines de `transformers`: la librería declarada es `transformers`, pero sin pesos no es posible cargar el modelo.
- Despliegue en entornos con recursos limitados: un modelo de ~2B sería adecuado para GPU de consumo, pero esta estimación se basa únicamente en el tamaño nominal y no en un modelo disponible.
- Investigación sobre adaptación lingüística: el proyecto podría documentar su metodología en el futuro, pero la model card no la describe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No es posible estimar requisitos reales de VRAM porque no existen pesos publicados.
- Como referencia teórica basada en el nombre del modelo (~2B parámetros), una inferencia en FP16 requeriría del orden de 4-5 GB de VRAM, y en cuantización de 4 bits podría situarse en torno a 1,5-2 GB, pero estas cifras no están confirmadas por el autor y dependen de una arquitectura no documentada.
- No se especifican GPU recomendadas (A100, H100, RTX 4090 u otras).
- No se confirma compatibilidad con vLLM, llama.cpp, Ollama, TGI ni otros motores de despliegue.
- No hay datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Pesos disponibles |
|---|---|---|---|---|---|
| BH-LLM-1-2B | no disponible (~2B por nomenclatura) | no disponible | bs | Apache-2.0 | No |
| BSC-LT/salamandra-2b | 2B (según la base declarada) | no disponible en esta ficha | multilingüe, incluido bs | Apache-2.0 | Sí |
| Alternativas específicas para bosnio | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con otros modelos especializados en bosnio no está disponible en la información proporcionada. El único punto de referencia sólido es el propio modelo base, que sí está publicado y es utilizable.

## Limitaciones y advertencias

- El modelo no está entrenado y no tiene pesos publicados: no puede descargarse, cargarse ni evaluarse.
- La model card está redactada en bosnio y declara explícitamente el estado "NIJE TRENIRAN" (no entrenado); no debe tratarse como un modelo funcional.
- No existe evaluación verificada de sesgos, alucinación ni calidad lingüística.
- No hay información sobre el tratamiento de datos, por lo que no puede evaluarse el riesgo de filtración de datos personales ni de sesgos de corpus.
- La licencia Apache-2.0 permite uso comercial, pero se aplica a un artefacto inexistente; su aplicabilidad a los futuros pesos no está confirmada más allá de lo que declare la licencia del repositorio.
- El alcance lingüístico declarado se limita al bosnio; no hay garantías de comportamiento en otros idiomas.
- Cualquier plan de producción basado en este repositorio es inviable hasta que el autor publique pesos y una evaluación, según su propia política de publicación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/BH-Language-AI/bh-llm-1-2b
- Modelo base candidato: https://huggingface.co/BSC-LT/salamandra-2b
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales.
