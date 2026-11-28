# jikadafu/Inkling-2-Mini-NSFW-uncensored

## Resumen

Inkling-2-Mini-NSFW-uncensored es un modelo publicado en Hugging Face por el usuario jikadafu bajo licencia Apache 2.0. Se presenta como una variante "NSFW" y "uncensored" de un modelo denominado Inkling-2-Mini, lo que sugiere un ajuste fino orientado a eliminar los filtros de contenido y permitir la generacion de material para adultos. La model card publicada es practicamente vacia: solo contiene la declaracion de licencia, sin descripcion tecnica, datos de entrenamiento ni instrucciones de uso.

El repositorio no incluye informacion sobre arquitectura, numero de parametros, longitud de contexto, idiomas soportados ni formato de pesos. El modelo esta etiquetado como `not-for-all-adult-audiences` (es decir, restringido a publico adulto) y no registra descargas ni interacciones en el momento de la consulta. La fecha de creacion y actualizacion es la misma (28 de noviembre de 2026), lo que apunta a un lanzamiento sin iteraciones posteriores documentadas.

Por tanto, esta ficha se limita a reflejar los escasos metadatos disponibles y a advertir de la ausencia total de documentacion tecnica verificable. Cualquier evaluacion de capacidades, rendimiento o requisitos de hardware debe considerarse no disponible hasta que el autor publique informacion sustantiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo (transformer, MoE, SSM, hibrida u otra), el numero de parametros, la composicion del dataset de entrenamiento, el volumen de tokens procesados ni las tecnicas de alineacion empleadas (RLHF, DPO, SFT). La model card unicamente declara la licencia Apache 2.0 y la restriccion de audiencia adulta.

El nombre del modelo sugiere que se trata de un ajuste fino sobre una base llamada Inkling-2-Mini, pero no hay evidencia documental en el repositorio que confirme la relacion, el proceso de fine-tuning ni los datos utilizados para el "uncensoring". Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido.

## Capacidades

- No se documentan capacidades especificas en la model card.
- Por el nombre y las etiquetas, se infiere un ajuste orientado a contenido para adultos sin filtros, pero no hay confirmacion tecnica.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modos especiales (thinking, vision, audio): no disponible.

## Casos de uso

- Generacion de ficcion para adultos: el modelo estaria presuntamente ajustado para producir narrativa explicita sin rechazos, aunque no hay documentacion que lo confirme ni ejemplos publicados.
- Prototipado de narrativa interactiva: podria emplearse en entornos controlados de escritura creativa para adultos, siempre que se verifique previamente su comportamiento real.
- Investigacion sobre alineacion y filtros de contenido: util como caso de estudio de modelos "uncensored" para analizar como el fine-tuning altera las negativas del modelo base.
- Evaluacion de riesgos en despliegues: sirve como ejemplo de repositorio con documentacion insuficiente para auditar sesgos o comportamiento en produccion.
- Experimentacion academica con licencia permisiva: la licencia Apache 2.0 facilita su uso en entornos de investigacion, sujeto a las restricciones de audiencia.
- Integracion en pipelines de prueba: podria probarse en entornos aislados para medir latencia y calidad, aunque sin specs publicadas la planificacion de recursos es inviable.

En todos los casos, la ausencia de especificaciones tecnicas impide garantizar viabilidad, coste o calidad; cualquier uso en produccion requeriria una evaluacion empirica previa por parte del integrador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamano del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se indica el formato de pesos, por lo que no puede confirmarse compatibilidad con ningun runtime.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria, y la falta de especificaciones del propio modelo impide establecer una comparacion rigurosa de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card solo contiene la licencia, lo que impide auditar el modelo.
- Contenido restringido a adultos: la etiqueta `not-for-all-audiences` exige control de acceso y verificacion de edad en cualquier despliegue.
- Riesgo elevado de alucinacion y de comportamiento impredecible al no documentarse el proceso de entrenamiento ni la alineacion.
- Sesgos desconocidos: sin informacion sobre el dataset, no es posible evaluar sesgos de genero, raza, orientacion o idioma.
- Idiomas y contexto no especificados: no puede garantizarse soporte multilingue ni ventanas de contexto largas.
- Licencia Apache 2.0: permite uso comercial segun los terminos de la licencia, pero el autor no ofrece garantias ni asume responsabilidad sobre el contenido generado.
- Cero descargas y cero interacciones: no hay evidencia de comunidad, validacion externa ni reportes de fallos.
- Uso en produccion desaconsejado sin una evaluacion de seguridad previa, especialmente por la naturaleza "uncensored" del ajuste.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jikadafu/Inkling-2-Mini-NSFW-uncensored
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
