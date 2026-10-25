# sgolkar/ai-mindmeld-connectors

## Resumen

AI Mindmeld connectors es el repositorio de artefactos del proyecto AI Mindmeld, desarrollado por Siavash Golkar, Jake Kovalic, Shirley Ho y colaboradores (PolymathicAI). No es un modelo de lenguaje generativo, sino una coleccion de 29 conectores entrenados (mas 2 conectores DEMO para ejemplos de software) que implementan el Latent Interconnect Protocol (LIP): mapeos aprendidos que proyectan la representacion interna de un modelo cientifico especialista directamente sobre los estados ocultos de un LLM receptor, en una posicion concreta del prompt. Ambos modelos permanecen congelados durante el proceso.

El problema que resuelve es la integracion de especialistas cientificos (proteinas y moleculas) con LLMs sin reentrenamiento conjunto: cada conector se entrena de forma independiente y varios de ellos pueden combinarse en un mismo prompt, lo que permite construir prompts que mezclan modalidades sin coste de alineamiento multi-modelo. Los conectores cubren tres familias de especialistas de proteina (ESM-C 600M y 6B, PGLM-1B y MIMIC) y tres de molecula (ChemFM-1B y 3B, MoLFormer-c3 y Uni-Mol2 1.1B), conectadas a Gemma 3 4B (8 conectores), Gemma 3 12B (10 conectores) y Kimi K2.6 (11 conectores).

Es relevante ahora porque propone una alternativa modular al fine-tuning multimodal: el LLM receptor y el especialista se descargan por separado y el conector es la unica pieza entrenada, lo que abarata el cambio de especialista o de LLM. El repositorio ocupa 55,4 GB e incluye los pesos de los conectores, no los de los modelos que conectan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conectores de interconexion latente (Latent Interconnect Protocol, LIP): mapeos aprendidos de la representacion del especialista a los estados ocultos del LLM receptor; ambos modelos congelados |
| Parametros totales | no disponible (el repositorio contiene 31 conectores: 29 de release y 2 DEMO; el autor no publica el recuento de parametros por conector) |
| Longitud de contexto | no disponible; determinada por el LLM receptor (Gemma 3 4B, Gemma 3 12B o Kimi K2.6) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CC BY 4.0 para los pesos de los conectores, incluidos los DEMO; codigo del proyecto Apache-2.0; se aplican adicionalmente las licencias upstream (ChemFM-1B/3B y PGLM-1B: CC BY-NC 4.0) |
| Formato de pesos | no disponible |
| Tamano del repositorio | 55,4 GB |
| Especialistas de proteina | ESM-C 600M, ESM-C 6B, PGLM-1B, MIMIC |
| Especialistas de molecula | ChemFM-1B, ChemFM-3B, MoLFormer-c3, Uni-Mol2 1.1B |
| LLMs receptores | Gemma 3 4B (8 conectores), Gemma 3 12B (10 conectores), Kimi K2.6 (11 conectores) |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creacion / ultima actualizacion | 2026-10-19 / 2026-10-24 |

## Arquitectura y entrenamiento

El mecanismo central es el Latent Interconnect Protocol: en lugar de serializar la salida del especialista como texto o como embedding concatenado, el conector aprende una transformacion que inyecta la representacion latente del objeto (proteina o molecula) en los estados ocultos del LLM en un slot del prompt. El LLM y el especialista no se modifican; solo se entrena el mapeo. Esto permite que conectores entrenados por separado se compongan en un mismo prompt sin entrenamiento conjunto, algo que el autor destaca explicitamente como propiedad del diseno.

Cada conector esta ligado a una terna concreta (especialista, receta de extraccion de caracteristicas y LLM receptor), de modo que no son intercambiables entre combinaciones distintas. Cuatro de los conectores, marcados como `*-all-tasks`, se entrenaron sobre el conjunto completo de tareas, por lo que no disponen de evaluacion zero-shot; el resto conserva ese regimen de evaluacion. El numero de tokens de entrenamiento, la composicion exacta del dataset y el uso de RLHF/DPO no se detallan en la informacion disponible; los datos de entrenamiento se publican aparte en el dataset `sgolkar/ai-mindmeld-data` y el inventario de datos por conector esta en `release/data_full.md`. La biblioteca LIP incluye descripciones de conectores y puntuaciones, con el detalle de ranking en `release/library-ranking.json`, pero los valores numericos no se han proporcionado.

## Capacidades

- Inyeccion de representaciones de proteinas en el espacio latente de un LLM, sin convertir la secuencia a texto.
- Inyeccion de representaciones de moleculas pequenas con el mismo mecanismo.
- Composicion de varios conectores en un unico prompt (por ejemplo, proteina y molecula simultaneamente), sin entrenamiento conjunto.
- Aprovechamiento de las capacidades del LLM receptor (razonamiento, generacion de texto, instrucciones) sobre entradas cientificas que el LLM no puede tokenizar de forma nativa.
- Cobertura de seis familias de especialistas: cuatro de proteina y cuatro de molecula segun el desglose del repositorio (tres familias declaradas por tipo, con variantes de tamano).
- Conectores especificos por tarea con evaluacion zero-shot, mas cuatro conectores `*-all-tasks` entrenados sobre todas las tareas.
- No incluye: tool calling, function calling, modo thinking, vision, audio ni soporte de agentes; esas capacidades, si existen, dependen exclusivamente del LLM receptor y no del conector.

## Casos de uso

- Anotacion funcional de proteinas asistida por LLM: se conecta ESM-C 600M o 6B a Gemma 3 4B/12B y se formula la consulta en lenguaje natural sobre la proteina, de modo que el LLM razona sobre la representacion latente en lugar de sobre una secuencia de aminoacidos tokenizada.
- Prediccion de propiedades moleculares en descubrimiento de farmacos: con ChemFM-1B/3B o Uni-Mol2 1.1B conectados al LLM, se pueden plantear preguntas sobre propiedades de una molecula dentro de un prompt que tambien contiene instrucciones y contexto textual.
- Razonamiento quimico multimodal en un solo prompt: combinar un conector de proteina y uno de molecula permite describir una diana terapeutica y un ligando en la misma ventana de contexto, sin pipelines separados.
- Comparacion de especialistas como sonda de evaluacion: al existir conectores para varios especialistas sobre el mismo LLM, se puede medir que familia (ESM-C frente a PGLM-1B, por ejemplo) transfiere mejor cierta tarea usando el LLM como sonda comun.
- Sustitucion de especialista sin reentrenar el LLM: en produccion, cambiar de ChemFM-1B a ChemFM-3B o de Gemma 3 4B a Gemma 3 12B implica descargar otro conector, no rehacer un fine-tuning multimodal completo.
- Asistentes cientificos con LLM congelado: integracion en herramientas de laboratorio donde el LLM receptor ya esta desplegado y auditado, y solo se anade el conector como artefacto versionado.
- Prototipado de interfaces proteina-texto: los dos conectores DEMO y los bundles mini (`protein-esmc-600m-mini`, `molecule-chemfm-1b-mini`) permiten validar el flujo de descarga y ejecucion antes de bajar el paquete completo.
- Reproducibilidad de experimentos: al fijar revisiones de release con el script `latent_interconnect.release_download`, se pueden replicar resultados de la biblioteca LIP en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la biblioteca LIP y a `release/library-ranking.json` para las puntuaciones por conector, pero no se incluyen cifras en el material proporcionado. Nota adicional: los cuatro conectores `*-all-tasks` no tienen evaluacion zero-shot por construccion.

## Requisitos de hardware

- El repositorio completo ocupa 55,4 GB, pero esa cifra agrega los 31 conectores; el tamano por conector se consulta con `python -m latent_interconnect.release_download --list --kinds`, dato no incluido en la informacion disponible.
- Los pesos del especialista y del LLM receptor se descargan por separado: el consumo real de VRAM es la suma del LLM receptor, el especialista y el conector.
- Combinacion mas ligera declarada: Gemma 3 4B con ESM-C 600M o ChemFM-1B, la unica pareja con opcion "mini" de datos para pruebas.
- Combinacion mas pesada en el lado del especialista: ESM-C 6B o ChemFM-3B; Kimi K2.6 como receptor no tiene tamano especificado en la model card, por lo que no se puede estimar su huella.
- VRAM estimada: no disponible. El autor no publica cifras de VRAM, latencia ni throughput.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Encaje en GPU de consumo: no verificable sin los tamanos por conector y sin confirmacion del formato de pesos; la presencia de variantes mini y de un receptor de 4B sugiere que esa combinacion es la candidata, pero no hay datos que lo confirmen.
- Opciones de despliegue: el unico procedimiento documentado es la libreria LIP (`python -m latent_interconnect.release_download` con `LIP_DATA` configurado) sobre el codigo de AI-Mindmeld; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se identifican en la informacion disponible alternativas publicas equivalentes: AI Mindmeld no es un modelo sino un conjunto de conectores ligados al protocolo LIP, y no se aportan modelos comparables ni sus cifras. La comparacion siguiente es conceptual, sobre el enfoque de integracion, y no sobre rendimiento medido.

| Enfoque | Entrenamiento | Modelos base | Portabilidad del artefacto | Datos comparativos |
|---|---|---|---|---|
| AI Mindmeld connectors (LIP) | Solo el conector; especialista y LLM congelados | Gemma 3 4B, Gemma 3 12B, Kimi K2.6 + 8 especialistas | Conector ligado a especialista, receta de extraccion y LLM; composicion multiple en un prompt | no disponible |
| Fine-tuning multimodal conjunto | Ambos modelos, total o parcialmente | Par (especialista, LLM) fijado | Artefacto unico no reutilizable entre pares | no disponible |
| Adaptadores tipo proyector sobre LLM congelado | Solo el proyector | Un especialista por adaptador | Reutilizable solo dentro del mismo par | no disponible |

## Limitaciones y advertencias

- Restricciones de licencia: los conectores son CC BY 4.0, pero se superponen las licencias upstream. ChemFM-1B y ChemFM-3B se liberan bajo CC BY-NC 4.0 segun la licencia del proyecto ChemFM, pese a que sus metadatos en HuggingFace indican MIT; PGLM-1B es CC BY-NC 4.0. Cualquier uso comercial que implique esos especialistas queda afectado.
- El grant de licencia cubre solo los derechos que los autores pueden licenciar; los terminos de los LLM receptores (Gemma 3, Kimi K2.6) se aplican por encima.
- Los conectores no son portables: cada uno esta atado a un especialista, una receta de extraccion y un LLM concretos. No se puede reutilizar un conector con otro receptor.
- Cuatro conectores `*-all-tasks` se entrenaron con todas las tareas y carecen de evaluacion zero-shot, por lo que su rendimiento en tareas no vistas no esta caracterizado.
- Ausencia total de datos publicados de benchmarks, latencia, throughput y VRAM en la informacion disponible, lo que impide una evaluacion cuantitativa previa al despliegue.
- Riesgo de alucinacion: el texto generado lo produce el LLM receptor; el conector solo aporta representacion. La fidelidad de la respuesta a la evidencia estructural de la proteina o molecula no esta garantizada ni medida en la informacion aportada.
- Idiomas soportados no disponibles; la cobertura linguistica depende del LLM receptor.
- Sesgos conocidos: no documentados en la informacion disponible.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado en octubre de 2026; sin senales de adopcion ni de soporte a terceros.
- Dependencia de infraestructura propia: el flujo exige configurar `LIP_DATA` y usar la revision de release fijada por el checkout; no hay integracion documentada con servidores de inferencia estandar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sgolkar/ai-mindmeld-connectors
- Codigo y documentacion: https://github.com/PolymathicAI/AI-Mindmeld
- Paper: https://arxiv.org/abs/2610.30215
- Libreria LIP (descripcion de conectores y puntuaciones): https://github.com/PolymathicAI/AI-Mindmeld/blob/main/library/README.md
- Detalle de ranking: https://github.com/PolymathicAI/AI-Mindmeld/blob/main/release/library-ranking.json
- Inventario de datos por conector: https://github.com/PolymathicAI/AI-Mindmeld/blob/main/release/data_full.md
- Notas de licencia y procedencia: https://github.com/PolymathicAI/AI-Mindmeld/blob/main/release/data_full.md#licenses-and-provenance
- Quickstart y ejemplos: https://github.com/PolymathicAI/AI-Mindmeld/blob/main/examples/README.md
- Dataset de entrenamiento: https://huggingface.co/datasets/sgolkar/ai-mindmeld-data
- Licencia de artefactos: https://github.com/PolymathicAI/AI-Mindmeld/blob/main/LICENSE-ARTIFACTS.md
- Items no comerciales: https://github.com/PolymathicAI/AI-Mindmeld/blob/main/LICENSE-ARTIFACTS.md#non-commercial-items
- Citacion: https://github.com/PolymathicAI/AI-Mindmeld/blob/main/CITATION.cff
- Licencia del proyecto ChemFM: https://github.com/TheLuoFengLab/ChemFM/blob/master/LICENSE
- Model card de PGLM-1B: https://huggingface.co/biomap-research/proteinglm-1b-mlm
