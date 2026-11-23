# SOTAagi2030/brindle-small-xbdbc0

## Resumen

Brindle-small-xbdbc0 es un checkpoint de conversión del modelo Brindle-1.5 publicado por el usuario SOTAagi2030 en Hugging Face, adaptado al formato del cargador Fallowkit. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos desde un checkpoint upstream de Hugging Face (build `cobalt`) a un layout propietario denominado Fallowkit, que requiere renombrar tensores y reordenar las filas de las proyecciones `attn.qkv` en bloques por cabeza (query, key y value para cada cabeza).

La información disponible es extremadamente limitada: la model card no especifica el número de parámetros, la longitud de contexto, los idiomas soportados, la licencia concreta ni los datos de entrenamiento. La única referencia al tamaño es el sufijo "small" en el nombre del repositorio, que sugiere una variante compacta dentro de la familia Brindle-1.5, pero no se confirma en ningún dato técnico.

El interés de esta ficha es, por tanto, documentar lo que se sabe con certeza (formato de conversión, arquitectura parcial, formato de chat y fidelidad de la conversión) y marcar explícitamente como "no disponible" todo aquello que la model card omite. Es relevante para desarrolladores que ya trabajen con el ecosistema Fallowkit o que necesiten evaluar la fidelidad de conversiones de pesos entre formatos, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (deducido de la presencia de tensores `attn.qkv` y proyección MLP; detalles completos no disponibles) |
| Parámetros totales | no disponible (el nombre indica variante "small") |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | "Same license as the upstream checkpoint" (licencia upstream no especificada) |
| Formato de pesos | Checkpoint Fallowkit con `converted.json` y `config.json`; no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento

La model card describe únicamente detalles parciales de arquitectura: la proyección de salida (`output projection`) tiene sesgo (bias), y la MLP utiliza GELU aproximada mediante tanh. La presencia de tensores `attn.qkv` indica atención multi-cabeza con proyecciones combinadas de query, key y value, que en la conversión a Fallowkit se reorganizan en bloques por cabeza. No se especifica si se trata de atención multi-head clásica o de variantes como GQA/MQA, ni el número de capas, dimensiones ocultas o cabezas.

No hay información sobre el proceso de entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal. El único dato verificable sobre el proceso es la conversión en sí: la tabla de fidelidad reporta un error absoluto máximo de ida y vuelta (round-trip) de 0,0213 sobre 25 tensores comparados, lo que da una idea cuantitativa de la pérdida introducida por el cambio de layout.

## Capacidades

- Generación de texto: no confirmada explícitamente, pero implícita en el formato de chat documentado (`<user> ... | <assistant> ...`).
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no especificados).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Formato de conversación: turnos delimitados por `<user> ` y `<assistant> `, unidos con ` | `.

## Casos de uso

- Evaluación de conversiones de pesos: el checkpoint permite verificar la fidelidad del pipeline de conversión upstream → Fallowkit midiendo el error de round-trip (0,0213 máximo sobre 25 tensores) y validando la reorganización de los tensores `attn.qkv` por cabeza.
- Integración en el ecosistema Fallowkit: sirve para probar el cargador de Fallowkit con `model_type` configurado como `brindle` y el fichero `converted.json`, antes de adoptar la familia Brindle-1.5 en producción.
- Pruebas de compatibilidad de formato de chat: permite validar parsers y plantillas que esperan el esquema `<user> ... | <assistant> ...`, útil si se construye una capa de serving propia.
- Reproducción de experimentos de conversión: investigadores que comparen layouts de pesos pueden usar este checkpoint como referencia para medir el impacto numérico del reordenamiento de cabezas en la atención.
- Base para fine-tuning en formato Fallowkit: si el equipo ya opera con Fallowkit, este checkpoint puede servir como punto de partida para ajustes posteriores, siempre que se aclare la licencia upstream.
- Docencia y auditoría de pipelines de conversión: como ejemplo documentado de una conversión con tabla de fidelidad, es útil para formar a equipos en la verificación de checkpoints convertidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el único cargador documentado es el de Fallowkit, que carga `converted.json`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La model card no identifica modelos comparables ni se dispone de datos de parámetros, contexto o rendimiento que permitan una comparación fundamentada con otras variantes de la familia Brindle-1.5 u otros modelos de tamaño similar.

## Limitaciones y advertencias

- Información técnica mínima: se desconocen parámetros, contexto, idiomas y datos de entrenamiento, lo que impide evaluar su idoneidad para producción.
- Licencia ambigua: la model card remite a "la misma licencia que el checkpoint upstream", pero no se especifica cuál es; no se puede confirmar el uso comercial sin consultar el repositorio original.
- Pérdida por conversión: el error absoluto máximo de round-trip es 0,0213, un valor no despreciable que puede afectar a la equivalencia numérica con el modelo upstream.
- Dependencia de un cargador no estándar: requiere el loader de Fallowkit y la configuración manual de `model_type` como `brindle`; no hay soporte documentado en frameworks convencionales.
- Riesgo de alucinación y sesgos: no evaluable sin benchmarks ni documentación de entrenamiento.
- Sin señales de adopción: 0 descargas y 0 likes en el momento de la consulta, sin pipeline definido ni idiomas declarados.
- Fecha de creación futura en los metadatos (2026-11-23), lo que conviene verificar antes de basar decisiones en este repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SOTAagi2030/brindle-small-xbdbc0
- No se han encontrado en la búsqueda web papers, blogs, repositorios de código ni demos adicionales asociados a este checkpoint o al modelo Brindle-1.5.
