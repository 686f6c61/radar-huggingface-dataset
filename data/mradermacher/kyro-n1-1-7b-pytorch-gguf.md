# mradermacher/Kyro-n1.1-7B-pytorch-GGUF

## Resumen

Kyro-n1.1-7B es un modelo de lenguaje de 7.615.616.512 parametros (aproximadamente 7,6 mil millones) desarrollado por open-neo y distribuido en formato GGUF por mradermacher. Se presenta como un modelo orientado al razonamiento (tag `reasoning`, `deepseek-r1`) y al dialogo conversacional, con soporte declarado para 29 idiomas. Esta ficha documenta especificamente la version cuantizada en GGUF publicada por mradermacher, que facilita su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles.

El modelo base es `open-neo/Kyro-n1.1-7B-pytorch`, del que esta publicacion es una conversion estatica a GGUF. La relevancia actual radica en la disponibilidad de cuantizaciones que van desde Q2_K (3,1 GB) hasta f16 (15,3 GB), lo que permite ejecutar el modelo en GPUs de consumo y en CPU. La licencia es propietaria (denominada "kyro"), lo que condiciona su uso comercial y requiere revisar el archivo LICENSE.md del repositorio base.

La informacion publicada por el autor de las cuantizaciones es escasa en cuanto a arquitectura, datos de entrenamiento y benchmarks; la model card se limita a listar los archivos GGUF disponibles y notas de uso genericas. Por tanto, muchos apartados de esta ficha se marcan como "no disponible" alli donde no hay datos verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como `reasoning` y `deepseek-r1`; no se detalla en la informacion proporcionada) |
| Parametros totales | 7.615.616.512 (aproximadamente 7,6 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, zh, fr, es, pt, de, it, ru, ja, ko, vi, th, ar, fa, he, tr, cs, pl, hi, bn, ur, id, ms, lo, my, ceb, km, tl, nl (29 idiomas) |
| Licencia | kyro (licencia propietaria, `license: other`; requiere consultar LICENSE.md) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en safetensors/PyTorch |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. El modelo base `open-neo/Kyro-n1.1-7B-pytorch` se etiqueta con `reasoning` y `deepseek-r1`, lo que sugiere un entrenamiento orientado a tareas de razonamiento y posiblemente destilado o inspirado en la familia DeepSeek-R1, pero no se confirma la arquitectura concreta (transformer denso, atencion, capas, etc.).

Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. La model card de la version GGUF es una plantilla generica de mradermacher que no incluye estos datos. Cualquier afirmacion sobre innovaciones tecnicas (decodificacion especulativa, atencion lineal, etc.) seria especulativa y no se incluye.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Razonamiento: el modelo se etiqueta explicitamente como `reasoning` y `deepseek-r1`, lo que indica capacidad orientada a tareas de razonamiento paso a paso.
- Soporte multilingue para 29 idiomas, incluyendo ingles, chino, espanol, frances, aleman, portugues, italiano, ruso, japones, coreano, vietnamita, tailandes, arabe, persa, hebreo, turco, checo, polaco, hindi, bengali, urdu, indonesio, malayo, lao, birmano, cebuano, jemer, tagalo y neerlandes.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integracion con infraestructura de inferencia estandar.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente; la etiqueta `reasoning` es el unico indicio.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Razonamiento asistido en local: gracias a las cuantizaciones Q4_K_M (4,8 GB) y Q5_K_M (5,5 GB), el modelo puede ejecutarse en una GPU de consumo de 8-12 GB para tareas de razonamiento y resolucion de problemas sin depender de la nube.
- Atencion al cliente multilingue: con soporte para 29 idiomas, puede gestionar conversaciones en espanol, ingles, arabe o hindi dentro de una misma aplicacion, aunque la longitud de contexto no esta documentada y debe validarse empiricamente.
- Generacion de documentacion tecnica: el perfil de razonamiento permite redactar explicaciones paso a paso y resumenes de procesos complejos en entornos de desarrollo.
- Prototipado de asistentes conversacionales: la etiqueta `conversational` y el formato GGUF facilitan su integracion en demos con llama.cpp u Ollama antes de escalar a modelos mayores.
- Educacion y tutoria automatizada: puede emplearse para explicar conceptos en varios idiomas, con la advertencia de que no hay benchmarks publicados que garanticen precision matematica o factual.
- Despliegue en CPU o hardware modesto: la cuantizacion Q2_K (3,1 GB) permite ejecucion en maquinas sin GPU dedicada, util para pruebas de concepto y entornos de investigacion con recursos limitados.
- Traduccion y procesamiento multilingue: la cobertura de 29 idiomas permite tareas de traduccion aproximada o clasificacion de texto en idiomas menos comunes (cebuano, lao, jemer), siempre con validacion humana por la ausencia de metricas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano del archivo GGUF y overhead de contexto):
  - Q2_K: ~3,1 GB de pesos; ~4-5 GB de VRAM total con contexto moderado.
  - Q4_K_M: ~4,8 GB de pesos; ~6-7 GB de VRAM total.
  - Q5_K_M: ~5,5 GB de pesos; ~7-8 GB de VRAM total.
  - Q8_0: ~8,2 GB de pesos; ~10-11 GB de VRAM total.
  - f16: ~15,3 GB de pesos; requiere ~16-18 GB de VRAM.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones Q4-Q8; A100 o H100 solo si se necesita f16 y alto throughput.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones Q2 a Q8 en GPUs con 8 GB o mas; la f16 requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (koboldcpp, LM Studio, text-generation-webui). El modelo base es compatible con transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kyro-n1.1-7B (esta ficha) | ~7,6 mil millones | no disponible | kyro (propietaria) | GGUF, PyTorch | Etiquetado como reasoning; 29 idiomas |
| DeepSeek-R1-Distill-Qwen-7B | ~7,6 mil millones | 32K (segun documentacion publica de DeepSeek) | MIT (segun publicacion de DeepSeek) | safetensors, GGUF | Referencia en razonamiento destilado; datos no verificados en esta ficha |
| Qwen2.5-7B-Instruct | ~7,6 mil millones | 32K (segun documentacion publica de Qwen) | Apache 2.0 (segun publicacion de Qwen) | safetensors, GGUF | Modelo generalista multilingue ampliamente usado |

Las filas de comparacion se basan en conocimiento general de esos modelos; no se dispone de benchmarks de Kyro-n1.1-7B que permitan una comparacion cuantitativa. Los datos de contexto y licencia de los modelos alternativos deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay datos de MMLU, HumanEval, GSM8K ni similares, por lo que el rendimiento real es desconocido y debe evaluarse antes de usarlo en produccion.
- Licencia propietaria "kyro": el uso comercial esta restringido o condicionado; es imprescindible revisar LICENSE.md del repositorio base antes de cualquier despliegue.
- Longitud de contexto no documentada: no se puede garantizar el manejo de conversaciones o documentos largos.
- Riesgo de alucinacion: inherente a modelos de este tamano y sin datos de evaluacion que lo cuantifiquen.
- Sesgos conocidos: no documentados, pero al ser un modelo multilingue entrenado con datos no especificados, es probable que presente sesgos culturales y linguisticos no evaluados.
- Idiomas: aunque se declaran 29, no hay evidencia publica de calidad por idioma; los idiomas de bajos recursos (cebuano, lao, jemer) probablemente tengan un rendimiento inferior.
- Soporte de tool calling y agentes no confirmado: no se debe asumir su disponibilidad sin pruebas.
- Modelo derivado y cuantizado por un tercero (mradermacher): la calidad depende del modelo base de open-neo, y las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan notablemente la calidad.
- Fecha de actualizacion del repositorio (2026-11-17) posterior a la de creacion (2025-03-15): puede indicar revisiones de los archivos; conviene verificar la integridad de las descargas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Kyro-n1.1-7B-pytorch-GGUF
- Modelo base: https://huggingface.co/open-neo/Kyro-n1.1-7B-pytorch
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Kyro-n1.1-7B-pytorch-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#Kyro-n1.1-7B-pytorch-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
