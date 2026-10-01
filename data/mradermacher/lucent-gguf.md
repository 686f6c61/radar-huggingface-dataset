# mradermacher/Lucent-GGUF

## Resumen

Lucent-GGUF es un repositorio de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo base KirkAis/Lucent. No se trata por tanto de un modelo entrenado desde cero, sino de una redistribucion optimizada para inferencia local y despliegue con llama.cpp y derivados (Ollama, LM Studio, text-generation-webui, etc.). El autor de las cuantizaciones es mradermacher, que publica versiones estaticas y versiones ponderadas con imatrix en un repositorio separado (mradermacher/Lucent-i1-GGUF).

El modelo base se distribuye bajo licencia Apache 2.0 y esta etiquetado como transformer de tipo text-generation con soporte declarado unicamente para ingles. Las etiquetas del repositorio apuntan a una especializacion en desarrollo de clientes y modding de Minecraft (minecraft, minecraft-client, client-engineering, modding, fabric, forge, neoforge) y en generacion de codigo, aunque la model card no aporta detalles sobre el dataset de entrenamiento ni sobre el proceso de ajuste.

Existe una discrepancia relevante entre las etiquetas y los metadatos reales: los tags anuncian 30b, 32b y 30b-parameters, mientras que el recuento de parametros obtenido de los pesos safetensors es de 14.770.033.664 (aproximadamente 14,77 mil millones). Conviene verificar el dato antes de planificar despliegues. El repositorio ocupa 102,0 GB en total y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (segun model_type de la model card; no se especifica variante ni si es MoE) |
| Parametros totales | 14.770.033.664 (14,77 B) segun pesos safetensors; las etiquetas del repo indican 30b / 32b / 30b-parameters |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (los comentarios de la model card mencionan tambien f16) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en el repositorio KirkAis/Lucent, formato no confirmado en la informacion disponible |

## Arquitectura y entrenamiento

La model card unicamente declara `model_type: transformer` y la libreria `transformers`. No se especifica si se trata de un transformer denso clasico, una variante con atencion lineal, un hibrido SSM o una arquitectura MoE. Tampoco se documentan innovaciones tecnicas concretas (decodificacion especulativa, atencion con ventana deslizante, RoPE escalado, etc.).

Respecto al entrenamiento, no hay informacion disponible sobre numero de tokens, composicion del dataset, fases de preentrenamiento, SFT, RLHF o DPO. Las etiquetas asociadas al repositorio (minecraft, fabric, forge, neoforge, client-engineering, modding, unsloth, code) sugieren un ajuste orientado a generacion de codigo para mods y clientes de Minecraft, y el tag `unsloth` apunta al uso de esa libreria para el fine-tuning, pero se trata de inferencias a partir de metadatos, no de datos confirmados en la documentacion. Este repositorio en concreto no entrena: solo aplica cuantizacion estatica (`quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf`) sobre los pesos del modelo base para producir los ficheros GGUF.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat (tag `conversational`).
- Generacion de codigo, presumiblemente orientada a Java y al ecosistema de mods de Minecraft (Fabric, Forge, NeoForge) segun las etiquetas del repositorio; no verificado con ejemplos publicos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado; no hay evidencia de soporte de otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Inferencia local eficiente gracias a las once variantes GGUF publicadas, desde 5,9 GB (Q2_K) hasta 15,8 GB (Q8_0).

## Casos de uso

- Asistente de codigo para mods de Minecraft: el modelo puede generar y completar clases Java de mods, registros de bloques, items y entidades, y adaptar codigo entre Fabric, Forge y NeoForge, que es el dominio al que apuntan las etiquetas del repositorio.
- Migracion de mods entre versiones de Minecraft: uso como apoyo para reescribir APIs obsoletas, mapear nombres de clases y actualizar `mixins` o `build.gradle`, reduciendo el trabajo manual de portado.
- Despliegue local en estaciones de trabajo sin GPU de datacenter: las variantes Q4_K_S (8,7 GB) y Q4_K_M (9,1 GB) permiten ejecutar el modelo en GPUs de consumo con 12-16 GB de VRAM mediante llama.cpp u Ollama.
- Entornos con requisitos de privacidad estrictos: al poder ejecutarse completamente en local, es apto para equipos que no pueden enviar codigo propietario a APIs externas.
- Generacion de documentacion tecnica de mods: redaccion de README, javadoc y guias de instalacion a partir del codigo fuente del mod.
- Prototipado rapido en pipelines de CI para revision de estilo: integrable como paso de linting semantico o generacion de parches sugeridos en pull requests de repositorios de mods.
- Base para fine-tuning adicional: al ser un modelo de ~14,77 B bajo Apache 2.0, puede servir como punto de partida para ajustes especificos sobre otros dominios de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de KirkAis/Lucent y la del repositorio de cuantizaciones no incluyen valores de MMLU, HumanEval, GSM8K, MBPP ni de ninguna otra evaluacion estandar, y los resultados de busqueda web no aportan datos utilizables (unicamente enlaces a Facebook sin relacion con el modelo).

Tampoco se publican mediciones de latencia ni de throughput (tokens por segundo) para ninguna de las variantes GGUF.

## Requisitos de hardware

- VRAM estimada de inferencia: aproximadamente el tamano del fichero GGUF mas el overhead de contexto y de la cache KV. Los valores por cuantizacion son Q2_K 5,9 GB; Q3_K_S 6,8 GB; Q3_K_M 7,4 GB; Q3_K_L 8,0 GB; IQ4_XS 8,3 GB; Q4_K_S 8,7 GB; Q4_K_M 9,1 GB; Q5_K_S 10,4 GB; Q5_K_M 10,6 GB; Q6_K 12,2 GB; Q8_0 15,8 GB.
- Cabe en GPU de consumo: si, al menos las variantes Q2_K a Q4_K_M en tarjetas de 12 GB (RTX 3060 12 GB, RTX 4070) o 16 GB (RTX 4060 Ti 16 GB, RTX 4080); las variantes Q5 y Q6 requieren 16 GB o mas; Q8_0 requiere alrededor de 16-24 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0 y Q6_K con contexto amplio; RTX 3090/4080/A5000 para cuantizaciones intermedias; A100 40/80 GB, H100 o L40S para despliegue multi-usuario con contexto largo o para repartir el modelo entre varias instancias.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, kobold.cpp y text-generation-webui para GGUF; el modelo base en transformers admite vLLM o TGI, pero las cuantizaciones GGUF de este repositorio no se cargan en vLLM con normalidad.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para este modelo en ninguna configuracion de hardware.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos de terceros comparables en la informacion proporcionada. La comparativa se limita a las variantes derivadas del mismo modelo base.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| KirkAis/Lucent | no disponible (base del repo; etiquetas 30b/32b) | no disponible | no disponible | apache-2.0 | Modelo original, sin cuantizar |
| mradermacher/Lucent-GGUF | 14,77 B (safetensors) | no disponible | GGUF (11 cuantizaciones estaticas) | apache-2.0 | Cuantizacion estatica; Q4_K_S y Q4_K_M marcadas como rapidas y recomendadas |
| mradermacher/Lucent-i1-GGUF | 14,77 B (heredado del base) | no disponible | GGUF ponderado con imatrix | apache-2.0 | Variante con calibracion imatrix, generalmente mejor calidad por bit |
| Alternativas de terceros | no disponible | no disponible | no disponible | no disponible | No se encontraron modelos comparables en la informacion disponible |

## Limitaciones y advertencias

- Discrepancia de parametros: las etiquetas indican 30b/32b, pero el recuento real de safetensors es de 14,77 B. Verificar antes de dimensionar hardware o de comparar con otros modelos.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgo, toxicidad o equidad.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Como modelo generativo de codigo, es esperable que produzca APIs o metodos inexistentes si no se valida la salida; no hay datos publicados que lo confirmen para este modelo concreto.
- Limitaciones de idioma: soporte declarado unicamente para ingles. El uso en castellano no esta respaldado por el autor.
- Limitaciones de contexto: la longitud de contexto no esta publicada, por lo que no se puede garantizar el comportamiento en conversaciones o ficheros de codigo largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y de atribucion. No se documentan restricciones adicionales ni clausulas de uso aceptable.
- Caveat de produccion: las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M, Q3_K_L) degradan la calidad de forma apreciable; para uso serio se recomienda Q4_K_M o superior.
- Trazabilidad: la model card no documenta dataset, proceso de entrenamiento ni evaluaciones, lo que dificulta auditar el comportamiento del modelo en entornos regulados.
- Popularidad nula: cero descargas y cero likes en el momento de la consulta, sin comunidad que haya reportado comportamiento en produccion.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Lucent-GGUF
- Cuantizaciones ponderadas con imatrix: https://huggingface.co/mradermacher/Lucent-i1-GGUF
- Modelo base: https://huggingface.co/KirkAis/Lucent
- Pagina resumen del autor para este modelo: https://hf.tst.eu/model#Lucent-GGUF
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones y FAQ del cuantizador: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del autor de las cuantizaciones: https://www.nethype.de/
