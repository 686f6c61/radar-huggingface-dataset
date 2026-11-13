# BH-Language-AI/bh-llm-1-7b

## Resumen

BH-LLM-1-7B es un modelo de lenguaje para bosnio anunciado por el colectivo BH-Language-AI. Segun su propia model card, se trata de una **ficha de proyecto sin pesos publicados**: el estado indicado es "NIJE TRENIRAN" (no entrenado) y el autor advierte explicitamente de que las ponderaciones no existen. El nombre sugiere una generacion 1 con tamano de 7B, y el modelo base declarado es BSC-LT/salamandra-7b, un transformer decoder-only de 7B parametros desarrollado por el Barcelona Supercomputing Center.

La relevancia de esta ficha es, por tanto, documental: describe la intencion de construir un modelo fundacional en bosnio sobre una base ya entrenada en lenguas ibericas y europeas, con licencia Apache-2.0. No hay informacion sobre datos de entrenamiento, proceso de ajuste ni evaluacion, y todas las especificaciones tecnicas derivan del modelo base o quedan marcadas como no disponibles.

Dado que no se han publicado pesos, el modelo no es desplegable ni evaluable en la actualidad. Los datos de arquitectura, contexto y cuantizacion que se recogen a continuacion corresponden al modelo base Salamandra-7B y deben tratarse como referencia heredada, no como especificaciones verificadas de BH-LLM-1-7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base BSC-LT/salamandra-7b) |
| Parametros totales | 7B (segun el nombre del modelo y el modelo base; no verificado en pesos publicados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no hay pesos publicados) |
| Idiomas soportados | Bosnio (bs) como objetivo declarado |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (pesos no publicados) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura especifica de BH-LLM-1-7B mas alla de la herencia del modelo base BSC-LT/salamandra-7b, un transformer decoder-only de 7B parametros. La model card no detalla el numero de tokens de entrenamiento, la composicion del corpus bosnio, ni si se han aplicado tecnicas de ajuste supervisado, RLHF o DPO. El autor indica que las ponderaciones solo se publicaran tras un entrenamiento aprobado y una evaluacion verificada, por lo que el proceso de entrenamiento no ha tenido lugar o no ha sido validado.

Tampoco se documentan innovaciones tecnicas propias (atencion lineal, decodificacion especulativa, mezcla de expertos u otras). Cualquier detalle arquitectonico de Salamandra-7B (como el uso de RoPE, GQA o la composicion de su corpus multilingue) seria aplicable solo de forma indirecta y no esta confirmado para este modelo.

## Capacidades

- Generacion de texto en bosnio: capacidad objetivo declarada, no verificada al no existir pesos.
- Razonamiento y codigo: no documentado para este modelo; dependeria de las capacidades heredadas de Salamandra-7B.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: el unico idioma declarado es el bosnio (bs); no se especifica cobertura de serbio, croata ni otras lenguas del entorno.
- Capacidades especiales (modo thinking, vision, audio): no documentadas.

## Casos de uso

- Evaluacion de viabilidad de un modelo fundacional en bosnio: el modelo serviria como referencia para decidir si conviene partir de Salamandra-7B y ajustar con corpus bosnio, comparando coste y calidad frente a alternativas multilingues.
- Investigacion linguistica computacional en lenguas eslavas del sur: permitiria estudiar el comportamiento de un modelo ajustado especificamente al bosnio frente a modelos multilingues genericos, una vez publicados los pesos.
- Generacion asistida de texto administrativo en bosnio: si el entrenamiento se completa, el modelo podria redactar borradores de documentos oficiales, siempre con revision humana por el riesgo de alucinacion.
- Educacion y materiales didacticos: generacion de ejercicios, resumenes y explicaciones en bosnio para plataformas de aprendizaje locales.
- Procesamiento de contenido editorial: resumen y reescritura de articulos en bosnio en redacciones digitales, con contexto limitado por la ventana no documentada.
- Base para ajuste fino por terceros: al ser Apache-2.0, otras organizaciones podrian partir de los pesos (cuando existan) para tareas especificas como clasificacion o extraccion de informacion.
- Preservacion digital y catalogacion: apoyo a la transcripcion y normalizacion de textos bosnios en archivos y bibliotecas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este modelo al no existir pesos. Como referencia del modelo base de 7B, en FP16 requeriria aproximadamente 14-16 GB de VRAM; en cuantizacion de 8 bits, unos 8 GB; en 4 bits, unos 4-5 GB.
- GPU recomendadas: no especificadas. Para un 7B en FP16 se suelen emplear A100, H100, L40S o RTX 4090; para cuantizaciones 4-8 bits, RTX 3060/4060 Ti de 12-16 GB o superiores.
- Compatibilidad con GPU de consumo: probable en cuantizacion 4 bits si se publican pesos en formato GGUF, pero no confirmado.
- Opciones de despliegue: no documentadas. Para el modelo base serian aplicables vLLM, TGI, llama.cpp u Ollama, pero no hay artefactos publicados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| BH-LLM-1-7B | 7B (declarado) | No disponible | Apache-2.0 | No publicados |
| BSC-LT/salamandra-7b | 7B | No disponible en la informacion proporcionada | Apache-2.0 | Publicados |
| Modelos multilingues de 7B de proposito general | 7B | Variable | Variable | Publicados |

La comparativa se limita al modelo base, ya que no se dispone de datos de rendimiento de BH-LLM-1-7B ni de alternativas especificas para bosnio en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de pesos: el modelo no puede descargarse, ejecutarse ni evaluarse; su estado declarado es "no entrenado".
- Sin datos de entrenamiento ni evaluacion: no hay evidencia de calidad, cobertura lexica ni correccion en bosnio.
- Riesgo de alucinacion: no cuantificado; en cualquier uso generativo requeriria verificacion humana.
- Cobertura idiomatica limitada: solo se declara bosnio, sin informacion sobre variantes, dialectos o lenguas vecinas.
- Sesgos: no documentados; al no existir corpus descrito, no puede evaluarse el sesgo de los datos.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero al no haber pesos publicados la licencia es, de momento, inaplicable en la practica.
- Ficha creada y actualizada el mismo dia (13 de noviembre de 2026) sin descargas ni interacciones: no hay senales de mantenimiento ni hoja de ruta publica.
- Cualquier dato de arquitectura o contexto debe considerarse heredado de Salamandra-7B y no confirmado para este modelo.

## Enlaces

- Hugging Face: https://huggingface.co/BH-Language-AI/bh-llm-1-7b
- Modelo base: https://huggingface.co/BSC-LT/salamandra-7b
