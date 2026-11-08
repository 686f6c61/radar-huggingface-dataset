# orzattyholdings/Glorius-Preview-27B

## Resumen

Glorius-Preview-27B es un ajuste fino (fine-tuning) publicado por el usuario orzattyholdings sobre el modelo base `unsloth/Qwen3.8-27B-unsloth-bnb-4bit`, una versión cuantizada en 4 bits del modelo Qwen3.8 de 27B parámetros preparada por Unsloth. El autor lo distribuye bajo licencia Apache 2.0 y lo etiqueta con la familia `qwen3_5`, aunque no se especifica en la documentación disponible a qué variante exacta de la familia Qwen corresponde el modelo base.

La model card es extremadamente escasa: se limita a indicar que el modelo se entrenó con Unsloth y la librería TRL de Hugging Face, con una velocidad de entrenamiento declarada "2x faster", y no aporta información sobre el dataset de ajuste, el número de tokens, la metodología (SFT, DPO, RLHF) ni las capacidades resultantes. El repositorio no registra descargas ni interacciones en el momento de la consulta, y fue creado el 7 de noviembre de 2026.

Por tanto, esta ficha describe principalmente las características heredadas del modelo base (arquitectura transformer de 27B, contexto y tokenizador de la familia Qwen) y marca explícitamente como "no disponible" todo aquello que el autor no ha documentado. Se trata de un artefacto de preview interno, no de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen3.8-27B; detalles no disponibles) |
| Parametros totales | 27B (según el nombre del modelo base; no verificado en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El modelo base está en bnb-4bit; el repositorio no especifica los pesos publicados (no disponible) |
| Idiomas soportados | en (inglés), según la etiqueta `language` de la model card |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (la librería declarada es `transformers`; no se confirma safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `unsloth/Qwen3.8-27B-unsloth-bnb-4bit`, que a su vez es una versión del Qwen3.8-27B cuantizada en 4 bits con bitsandbytes y optimizada por Unsloth para entrenamiento eficiente. La arquitectura subyacente es, por herencia, la del modelo Qwen de 27B (transformer decoder-only), aunque la model card no detalla capas, dimensiones ocultas, cabezas de atención ni mecanismos específicos como atención lineal o decodificación especulativa.

En cuanto al entrenamiento, la única información aportada es que se utilizó Unsloth junto con la librería TRL de Hugging Face, lo que sugiere un ajuste supervisado (SFT) o posiblemente DPO, pero el autor no especifica el dataset, el número de tokens, la composición de los datos ni si hubo etapas de alineación adicionales. Tampoco se documenta si el ajuste se realizó sobre el modelo cuantizado en 4 bits (loRA/QLoRA) o si se fusionaron los pesos. No hay información sobre innovaciones técnicas propias de este fine-tuning.

## Capacidades

- Generación de texto en inglés (único idioma declarado en la model card).
- Razonamiento y conocimiento general: presumiblemente heredados del modelo base Qwen3.8-27B, aunque no verificados ni documentados por el autor.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la etiqueta `language`; el resto de idiomas del modelo base no se confirman.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse en Inference Endpoints de Hugging Face, pero no se detalla la configuración.

## Casos de uso

- Evaluación interna de fine-tunings: el modelo se presenta como un "preview build" (fase 1), por lo que su uso realista es la validación interna de la metodología de ajuste antes de publicar una versión estable.
- Experimentación con QLoRA y Unsloth: sirve como referencia para reproducir pipelines de ajuste eficiente sobre modelos de 27B en 4 bits, comparando velocidades y calidad frente al modelo base.
- Generación de texto en inglés en entornos de investigación: para probar la degradación o mejora introducida por el fine-tuning respecto al checkpoint original de Qwen3.8-27B.
- Base para futuros adaptadores: el ecosistema del autor incluye un adaptador separado (`Glorius-Preview-27B-Adapter-P1`), lo que sugiere que este checkpoint puede servir como punto de partida para cargar adaptadores LoRA adicionales.
- Pruebas de despliegue en Inference Endpoints: gracias a la etiqueta `endpoints_compatible`, puede usarse para validar la infraestructura de serving antes de mover un modelo a producción.
- Docencia y demostraciones de fine-tuning: como ejemplo de model card mínima y de los riesgos de publicar artefactos sin documentación de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, ya que no se especifica el formato de pesos publicado. Como referencia, un modelo de 27B en 4 bits requiere aproximadamente 14-16 GB de VRAM solo para los pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: no disponible (no documentado por el autor). Por tamaño, cabría esperar GPUs de 24 GB o más (RTX 4090, A10G, L4 en configuraciones ajustadas) o A100/H100 para mayor throughput.
- ¿Cabe en GPU de consumo? Probablemente en una RTX 4090 (24 GB) si los pesos están en 4 bits, pero no está confirmado.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta), y potencialmente vLLM o llama.cpp si se publican pesos en formatos compatibles (no confirmado).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Glorius-Preview-27B | 27B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Fine-tuning sin documentar |
| Qwen3.8-27B (base) | 27B | no disponible | según Qwen (no confirmado) | Hugging Face | Modelo original del que deriva |
| unsloth/Qwen3.8-27B-unsloth-bnb-4bit | 27B | no disponible | según Qwen (no confirmado) | Hugging Face | Checkpoint cuantizado en 4 bits usado como base |
| orzattyholdings/SOCIUM-AI-27B | 27B | no disponible | no disponible | Hugging Face | Otro fine-tuning del mismo autor, descrito como VLM nativo |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Documentación insuficiente: la model card no describe dataset, metodología ni evaluación, lo que impide verificar la calidad o el propósito del ajuste.
- Riesgo de alucinación: no evaluado; al ser un fine-tuning sin benchmarks publicados, no hay evidencia de que el ajuste no haya degradado las capacidades del modelo base.
- Sesgos conocidos: no documentados. Al entrenarse presumiblemente sobre datos no especificados, pueden introducirse sesgos desconocidos.
- Limitación de idioma: solo se declara inglés; el comportamiento en castellano u otros idiomas no está garantizado.
- Estado de preview: el propio nombre ("Preview") y la existencia de un adaptador separado ("Adapter-P1", "Stage 1") indican que es una versión interna e inestable, no apta para producción.
- Licencia: Apache 2.0 permite uso comercial, pero las condiciones del modelo base Qwen3.8-27B podrían imponer restricciones adicionales que el autor no detalla; conviene verificar la licencia del checkpoint original antes de un uso comercial.
- Sin soporte de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que permitan contrastar su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orzattyholdings/Glorius-Preview-27B
- Adaptador relacionado: https://huggingface.co/orzattyholdings/Glorius-Preview-27B-Adapter-P1
- Otro modelo del autor: https://huggingface.co/orzattyholdings/SOCIUM-AI-27B
- Modelo base cuantizado: https://huggingface.co/unsloth/Qwen3.8-27B-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
