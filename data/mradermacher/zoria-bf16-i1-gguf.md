# mradermacher/Zoria-BF16-i1-GGUF

## Resumen

Zoria-BF16-i1-GGUF es una coleccion de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo base Zoria-BF16, publicado por zoria-ai. Se trata de un modelo conversacional de aproximadamente 30.700 millones de parametros (unos 30,7 B), segun el recuento real de pesos en safetensors del repositorio. El repositorio pesa 154 GB e incluye un conjunto amplio de variantes de cuantizacion, desde IQ1_S hasta Q6_K, lo que permite desplegar el modelo en un rango muy amplio de hardware.

El interes de esta ficha radica en que el artefacto distribuido no es el modelo original, sino una familia de cuantizaciones con tecnicas de imatrix y weighted quants, orientadas a preservar la calidad del modelo BF16 original con menos memoria. El autor del modelo base es zoria-ai; mradermacher actua como cuantizador. La model card no aporta informacion sobre arquitectura, licencia, idiomas ni datos de entrenamiento, de modo que muchos campos de esta ficha quedan como "no disponible".

Es relevante ahora porque las cuantizaciones GGUF son la via habitual para ejecutar modelos de ~30 B en GPUs de consumo y en CPU, y esta publicacion ofrece un espectro completo de tamanos de cuantizacion en un unico repositorio. No obstante, la ausencia de documentacion sobre el modelo base limita la evaluacion rigurosa de sus capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 30.697.345.596 (~30,7 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en BF16 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Zoria-BF16: la model card del repositorio de cuantizaciones no describe si se trata de un transformer denso, un modelo MoE o una arquitectura hibrida. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO u otras tecnicas de alineacion.

Lo unico verificable es el proceso de cuantizacion: mradermacher ha generado las variantes GGUF con cuantizacion ponderada y con matriz de importancia (imatrix), segun indican los metadatos de la model card (`imatrix`, `weighted/imatrix quants`). Este enfoque asigna precision de forma no uniforme a los tensores segun su impacto en la salida, lo que suele mejorar la calidad de las cuantizaciones agresivas (IQ2, IQ3) frente a una cuantizacion uniforme. El repositorio incluye tambien variantes con el prefijo `small-` (por ejemplo `small-IQ4_NL`), que habitualmente corresponden a cuantizaciones de menor tamano dentro de la misma familia.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo esta orientado a dialogos multi-turno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse mediante infraestructura de inferencia estandar (por ejemplo, servidores compatibles con la API de inferencia de Hugging Face).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Razonamiento multi-paso y agentes: no disponible.
- Capacidades multilingues: no disponibles; no se declaran idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Codigo y matematicas: no disponible; no se documenta rendimiento en estas areas.

## Casos de uso

- Despliegue local en GPU de consumo: con cuantizaciones Q4_K_M o IQ4_XS, un modelo de ~30,7 B puede ejecutarse en GPUs con 24 GB de VRAM como la RTX 4090, lo que permite prototipar asistentes conversacionales en estaciones de trabajo sin acceso a servidores.
- Servicio conversacional en CPU: las variantes Q2_K, IQ2 e IQ3 reducen el peso del modelo lo suficiente para ejecutarlo en servidores sin GPU mediante llama.cpp u Ollama, util para entornos de pruebas o despliegues de bajo coste.
- Evaluacion comparativa de cuantizaciones: al incluir 24 variantes en un unico repositorio, resulta practico medir la degradacion de calidad entre Q6_K y IQ1_S sobre el mismo modelo base, lo que sirve para calibrar el compromiso memoria/calidad en un proyecto concreto.
- Integracion en pipelines de inferencia con vLLM o TGI: las variantes GGUF pueden servirse con motores compatibles, de modo que el modelo se incorpore como componente de generacion en aplicaciones internas que ya usan estos frameworks.
- Experimentacion en investigacion: para equipos que estudian el efecto de la cuantizacion con imatrix en modelos de ~30 B, este repositorio ofrece un conjunto controlado de variantes generadas con la misma metodologia.
- Chat de asistencia interna con requisitos de privacidad: al poder ejecutarse en hardware propio, el modelo permite procesar conversaciones internas sin enviar datos a APIs externas, siempre que la licencia del modelo base lo permita (dato no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano, un modelo de ~30,7 B en BF16 requiere aproximadamente 61 GB solo para pesos; en Q8 ronda los 32 GB, en Q5_K_M unos 21-22 GB, en Q4_K_M unos 18-19 GB, en Q3_K_M unos 14-15 GB y en IQ2 alrededor de 9-10 GB. Estas cifras son estimaciones por regla general y no datos publicados por el autor.
- GPU recomendadas: para BF16, GPU de 80 GB (A100, H100); para Q5/Q6, GPU de 40-48 GB (A100 40 GB, L40S); para Q4, GPU de 24 GB (RTX 4090, A10G, L4); para Q3 e inferiores, GPU de 16-24 GB o incluso menos.
- Cabe en GPU de consumo: si, en las cuantizaciones Q4 e inferiores cabe en una RTX 4090 (24 GB); en Q3 o IQ2 podria caber en GPUs de 16 GB como la RTX 4080 o la 4060 Ti de 16 GB, con margen ajustado para el contexto.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; vLLM y TGI para variantes compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el modelo base: no se conocen arquitectura, datos de entrenamiento, idiomas ni sesgos, lo que impide evaluar su idoneidad para produccion.
- Licencia no disponible: no puede confirmarse si se permite uso comercial; debe verificarse en el repositorio del modelo base antes de cualquier despliegue.
- Riesgo de alucinacion: no evaluado por el autor; sin benchmarks ni model card del modelo base, no hay evidencia sobre su fiabilidad factual.
- Degradacion por cuantizacion: las variantes IQ1_S, IQ2 e IQ3 pueden perder calidad de forma notable; para tareas sensibles conviene usar Q5_K_M o superior.
- Idiomas no declarados: no puede garantizarse un rendimiento adecuado en castellano ni en otros idiomas distintos del que se haya usado en el entrenamiento.
- Contexto desconocido: al no documentarse la longitud de contexto, no deben asumirse ventanas largas en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion comunitaria del artefacto.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Zoria-BF16-i1-GGUF
- Modelo base: https://huggingface.co/zoria-ai/Zoria-BF16
