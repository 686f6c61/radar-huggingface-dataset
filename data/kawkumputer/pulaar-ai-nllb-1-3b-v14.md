# kawkumputer/pulaar-ai-nllb-1.3b-v14

## Resumen

pulaar-ai-nllb-1.3b-v14 es un adaptador LoRA (PEFT) publicado por el usuario kawkumputer sobre el modelo base facebook/nllb-200-distilled-1.3B, el modelo de traduccion automatica multilingue de Meta AI presentado en el paper NLLB-200 (No Language Left Behind). El repositorio contiene unicamente los pesos del adaptador, no el modelo completo: el tamano del repo es de 0,4 GB, coherente con un conjunto de matrices LoRA de rango bajo sobre un transformer de 1.300 millones de parametros.

El nombre del repositorio sugiere un ajuste orientado al pulaar (fula/fulfulde), una lengua africana, aunque la model card no lo confirma ni documenta el corpus de entrenamiento, los hiperparametros ni los resultados de evaluacion. La model card es la plantilla generica de Hugging Face sin rellenar: todos los campos relevantes aparecen como "[More Information Needed]".

Su relevancia practica es limitada y condicionada: es interesante como ejemplo de adaptacion de bajo coste de NLLB-200 a una lengua de bajos recursos, pero la ausencia total de documentacion, licencia e idiomas declarados impide recomendarlo para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (modelo base NLLB-200 distilled); adaptador LoRA sobre el modelo base |
| Parametros totales | 1.300 millones en el modelo base; parametros del adaptador no disponibles (repo de 0,4 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (NLLB-200 usa secuencias de 512 tokens en el modelo base, no confirmado para este adaptador) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles (el nombre sugiere pulaar, sin confirmacion documental) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base facebook/nllb-200-distilled-1.3B es un transformer encoder-decoder con atencion estandar, destilado de la familia NLLB-200 de Meta AI y disenado para traduccion automatica multilingue. Sobre el se aplica un adaptador LoRA (Low-Rank Adaptation) entrenado con la libreria PEFT 0.21.2 y cargable con Transformers; el adaptador congela los pesos originales e inyecta matrices de bajo rango en las capas del transformer.

No hay informacion sobre el corpus de entrenamiento, el numero de tokens, la composicion del dataset, el rango y alpha del LoRA, la tasa de aprendizaje ni si se aplicaron tecnicas de alineacion (RLHF/DPO). El unico dato tecnico verificable es el framework de entrenamiento (PEFT 0.21.2) y el modelo base. Tampoco se documenta ninguna innovacion tecnica adicional mas alla del propio ajuste LoRA.

## Capacidades

- Traduccion automatica multilingue heredada del modelo base NLLB-200 (la cobertura efectiva del adaptador no esta documentada).
- Generacion de texto condicionada a tarea de traduccion (seq2seq), no es un modelo conversacional de proposito general.
- Capacidad potencial de traduccion hacia o desde pulaar segun el nombre del repositorio, sin verificacion documental.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Traduccion de documentacion tecnica a pulaar: cargando el adaptador sobre NLLB-200 distilled 1.3B se podria traducir documentacion de software a fulfulde; requiere validacion con hablantes nativos porque no hay evaluacion publicada.
- Localizacion de interfaces y contenido web para comunidades hablantes de pulaar: el modelo base ofrece traduccion multilingue y el adaptador buscaria especializar el par; adecuado por el bajo coste de despliegue de un modelo de 1.3B.
- Investigacion en NLP de bajos recursos: sirve como punto de partida reproducible para experimentos de adaptacion LoRA sobre NLLB-200 en lenguas africanas, comparando con los checkpoints v12 y v13 del mismo autor.
- Preservacion linguistica y corpus paralelos: generacion asistida de traducciones para construir datasets pulaar-otras lenguas, siempre con revision humana.
- Traduccion en dispositivos con recursos limitados: al ser un adaptador sobre un modelo de 1.3B, puede ejecutarse en GPU de consumo o incluso CPU con cuantizacion del modelo base, aunque no se documentan recetas de cuantizacion.
- Prototipado rapido de pipelines de traduccion en entornos de investigacion: integrable con la API de PEFT/Transformers en scripts de evaluacion automatizada (BLEU, chrF) sobre conjuntos de validacion propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia del modelo base, NLLB-200 distilled 1.3B en fp16 requiere aproximadamente 2,6 GB de pesos mas memoria de activaciones; el adaptador LoRA anade una cantidad marginal.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano del modelo base, seria viable en GPU consumer (RTX 3060 12 GB, RTX 4090) y en GPU de datacenter (A100, H100) sin necesidad de estas ultimas.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo base (1.3B), aunque no hay confirmacion del autor.
- Opciones de despliegue: PEFT + Transformers (unica via documentada); vLLM, llama.cpp, Ollama y TGI no estan documentados para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| kawkumputer/pulaar-ai-nllb-1.3b-v14 | 1.3B (base) + LoRA | no disponible | no disponible | Hugging Face, 0 descargas | Adaptador sin documentacion |
| facebook/nllb-200-distilled-1.3B | 1.3B | 512 tokens (modelo base) | CC-BY-NC 4.0 (modelo base, segun publicacion de Meta; verificar) | Hugging Face, ampliamente usado | Modelo base multilingue de referencia |
| facebook/nllb-200-distilled-600M | 600M | 512 tokens (modelo base) | CC-BY-NC 4.0 (modelo base; verificar) | Hugging Face | Version mas ligera del mismo linaje |
| kawkumputer/pulaar-ai-nllb-1.3b-v12 / v13 | 1.3B (base) + LoRA | no disponible | no disponible | Hugging Face | Versiones previas del mismo autor |

## Limitaciones y advertencias

- Model card sin rellenar: no hay informacion sobre datos de entrenamiento, evaluacion, sesgos ni uso previsto.
- Licencia no declarada: no se puede confirmar el uso comercial; ademas, el modelo base NLLB-200 de Meta tiene licencia CC-BY-NC 4.0, lo que restringe el uso comercial del conjunto.
- Riesgo de alucinacion y de traducciones incorrectas no cuantificado: sin benchmarks ni evaluacion humana publicada.
- Idiomas soportados no documentados: el nombre sugiere pulaar, pero no se especifica la direccion de traduccion ni la cobertura real.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Es un adaptador, no un modelo autonomo: requiere descargar y cargar facebook/nllb-200-distilled-1.3B ademas de los pesos LoRA.
- Sin garantias de mantenimiento ni soporte por parte del autor.
- Posible solapamiento con los checkpoints v12 y v13 del mismo autor, sin changelog que documente diferencias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kawkumputer/pulaar-ai-nllb-1.3b-v14
- Version previa v13: https://huggingface.co/kawkumputer/pulaar-ai-nllb-1.3b-v13
- Version previa v12: https://huggingface.co/kawkumputer/pulaar-ai-nllb-1.3b-v12
- Modelo base: https://huggingface.co/facebook/nllb-200-distilled-1.3B
- Paper NLLB-200 (No Language Left Behind): https://arxiv.org/abs/2207.04672
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Paper de PEFT referenciado en los tags (Lacoste et al., 2019, impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
