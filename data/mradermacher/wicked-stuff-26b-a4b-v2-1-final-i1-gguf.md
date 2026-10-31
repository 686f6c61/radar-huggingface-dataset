# mradermacher/Wicked-Stuff-26B-A4B-v2.1-FINAL-i1-GGUF

## Resumen

Wicked-Stuff-26B-A4B-v2.1-FINAL es un modelo de lenguaje conversacional e instruct sin alineamiento (unaligned), orientado a roleplay y contenido para adultos (NSFW, ERP, horror, violencia), desarrollado por ReadyArt. La ficha que aquí se analiza corresponde a la versión cuantizada en formato GGUF con matrices de importancia (imatrix), publicada por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face que genera colecciones completas de cuantos para facilitar la inferencia local en hardware de consumo.

El modelo base tiene 25.233.142.046 parámetros totales y, según la nomenclatura "26B-A4B", parece seguir un diseño de tipo mezcla de expertos (MoE) con aproximadamente 4 mil millones de parámetros activos por token, lo que permitiría inferencias rápidas a pesar del tamaño total. Está licenciado bajo Apache 2.0, lo que permite su uso comercial sin restricciones adicionales. Su relevancia actual radica en la escasez de modelos abiertos sin filtros de contenido maduro, un nicho demandado por la comunidad de rol narrativo y ficción interactiva.

Cabe destacar que la model card del repositorio cuantizado indica que se trata de un modelo con capacidades de visión, cuyos archivos mmproj se publican en el repositorio de cuantos estáticos asociado. El contenido del modelo está dirigido exclusivamente a audiencias adultas y está etiquetado explícitamente como "not-for-all-audiences".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo MoE (inferido de la nomenclatura A4B; no disponible confirmación explícita) |
| Parametros totales | 25.233.142.046 (~25,2 B) |
| Parametros activos | ~4 B (inferido de la nomenclatura "A4B"; dato exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K, Q2_K_S, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_1, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (imatrix, i1) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (imatrix); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

La denominacion "26B-A4B" sigue la convencion popularizada por modelos MoE como Qwen3-30B-A3B, donde "A4B" indica aproximadamente 4 mil millones de parametros activos por token sobre un total de ~25 mil millones. Esta arquitectura permite ejecutar el modelo con la huella de memoria de un modelo denso pequeño pero con la capacidad expresiva de uno mucho mayor, ya que solo un subconjunto de expertos se activa en cada paso de decodificacion. No obstante, ni la model card ni la informacion disponible detallan explicitamente la arquitectura interna (numero de expertos, top-k, tipo de atencion), por lo que estos detalles no estan disponibles.

Sobre el proceso de entrenamiento del modelo base (datos de entrenamiento, numero de tokens, uso de RLHF o DPO) no hay informacion publicada en la model card. Lo que si indica la ficha es que se trata de un modelo conversacional e instruct sin alineamiento, presumiblemente afinado a partir de un modelo base abierto para producir contenido maduro sin filtros. La version cuantizada de mradermacher emplea cuantizacion con matrices de importancia (imatrix), una tecnica que calcula estadisticas de activacion sobre un corpus de calibracion para asignar mejor la precision de cada tensor, mejorando la calidad de los cuantos bajos (IQ1-IQ3) frente a la cuantizacion estatica clasica.

## Capacidades

- Generacion de texto conversacional en modo instruct, optimizada para dialogo multi-turno.
- Roleplay narrativo extenso y escritura creativa, con especial foco en contenido adulto, erotico (ERP), horror y violencia ficticia, sin filtros de alineamiento.
- Capacidades de vision: la model card del cuantizador indica que es un modelo de vision y que los archivos mmproj se publican en el repositorio de cuantos estaticos.
- Compatibilidad con el ecosistema GGUF: inferencia local en llama.cpp, Ollama, LM Studio, KoboldCpp y similares.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Idiomas: la model card declara unicamente ingles; no hay soporte declarado para castellano ni otros idiomas.

## Casos de uso

- Roleplay interactivo local: el modelo esta especificamente afinado para conversaciones de rol largas sin rechazos de contenido, y su arquitectura MoE con ~4 B de parametros activos permite respuestas rapidas en sesiones interactivas.
- Escritura de ficcion para adultos: generacion de narrativa erotica, de horror o violenta para autores que necesitan un asistente sin restricciones de contenido maduro, ejecutado de forma privada en local.
- Prototipado de chatbots sin alineamiento: investigadores que estudian comportamientos de modelos sin RLHF pueden desplegarlo facilmente con llama.cpp gracias a la amplia gama de cuantos.
- Pruebas de calidad de cuantizacion: la coleccion completa de cuantos IQ y Q (de IQ1_S a Q6_K) lo hace util como banco de pruebas para comparar la degradacion de calidad entre niveles de cuantizacion en un mismo modelo.
- Analisis de contenido multimodal: dado que la model card indica capacidades de vision (mmproj disponible en el repo estatico), puede emplearse para describir o comentar imagenes en flujos de roleplay o ficcion, aunque este dato no esta detallado por el autor base.
- Uso privado garantizando privacidad: al ejecutarse localmente, evita enviar conversaciones sensibles a servicios en la nube, algo relevante dado el tipo de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuanto elegido, sin contar KV cache):
  - IQ1_S (8,4 GB) / IQ1_M (8,8 GB): cabe en una GPU de 12 GB (RTX 3060 12 GB, RTX 4070) o parcialmente en una de 8 GB con descarga a CPU.
  - IQ3_M (12,5 GB) / IQ4_XS (14,0 GB): adecuados para GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4080, RTX 5080).
  - Q4_K_M (16,9 GB) / Q5_K_M (19,2 GB): requieren GPUs de 24 GB (RTX 3090, RTX 4090, RTX 5090) para ejecucion completa en GPU.
  - Q6_K (22,7 GB): GPUs de 24 GB con margen justo, o configuracion hibrida GPU/CPU.
- Al ser un MoE con ~4 B de parametros activos, la velocidad de generacion en CPU o en configuraciones hibridas deberia ser notablemente buena para su tamaño total, aunque no hay mediciones publicadas.
- Consumer GPUs compatibles: si, desde 8 GB con los cuantos mas agresivos (con penalizacion de calidad) hasta 24 GB con cuantos de alta fidelidad.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp (muy habitual en este nicho de roleplay), text-generation-webui. vLLM y TGI no soportan GGUF de forma estandar; para esos backends habria que usar los pesos safetensors del modelo base.
- Latencia y throughput: no disponibles; se recomienda consultar la pagina de cuantos de mradermacher (hf.tst.eu) para orientacion sobre tamaño/velocidad/calidad.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Wicked-Stuff-26B-A4B-v2.1-FINAL | ~25,2 B | ~4 B (inferido) | no disponible | Apache 2.0 | Roleplay NSFW sin alineamiento |
| Qwen3-30B-A3B (base tipica de este tipo de merges) | 30,5 B | 3,3 B | 32k (128k con YaRN) | Apache 2.0 | Uso general, instruct/thinking |
| Mistral Small 3.x 24B | 24 B | 24 B (denso) | 32k | Apache 2.0 | Uso general, afinable |

Nota: la comparacion con Qwen3-30B-A3B y Mistral Small es orientativa, ya que el modelo base original de Wicked-Stuff no esta identificado explicitamente en la model card; ambos son referentes habituales en tamaño y licencia para merges de roleplay. En benchmarks concretos de roleplay o NSFW no hay datos comparativos publicados.

## Limitaciones y advertencias

- Contenido explicito: el modelo esta diseñado para producir material NSFW, erotico, de horror y violencia sin filtros. Esta etiquetado como "not-for-all-audiences" y su uso por menores de edad o en entornos laborales es inapropiado.
- Riesgo de alucinacion: al tratarse de un modelo sin alineamiento, no hay filtros correctivos; puede generar afirmaciones falsas con total confianza. No es adecuado para tareas factuales sin supervision.
- Idioma: solo declara soporte de ingles. El rendimiento en castellano no esta garantizado y puede degradarse notablemente en roleplay o contenido matizado.
- Cuantos muy bajos (IQ1_S, IQ1_M, IQ2_XXS): el propio cuantizador los califica como "para desesperados" o de calidad muy baja; se recomienda como minimo Q4_K_S o IQ4_XS para uso real.
- Licencia: Apache 2.0 permite uso comercial, pero la responsabilidad legal sobre el contenido generado (difamacion, contenido ilegal, derechos de autor) recae en el usuario.
- Contexto y tool calling: la longitud de ventana de contexto no esta documentada en la informacion disponible; verificarla en la config.json del modelo base antes de desplegar.
- Al ser un modelo de la comunidad sin documentacion tecnica detallada, no hay garantias de estabilidad, ni evaluaciones de seguridad, ni benchmarks de referencia.

## Enlaces

- Repositorio cuantizado (imatrix GGUF): https://huggingface.co/mradermacher/Wicked-Stuff-26B-A4B-v2.1-FINAL-i1-GGUF
- Modelo base: https://huggingface.co/ReadyArt/Wicked-Stuff-26B-A4B-v2.1-FINAL
- Repositorio de cuantos estaticos: https://huggingface.co/mradermacher/Wicked-Stuff-26B-A4B-v2.1-FINAL-GGUF
- Pagina de descargas y resumen del cuantizador: https://hf.tst.eu/model#Wicked-Stuff-26B-A4B-v2.1-FINAL-i1-GGUF
- Guia de uso de GGUF referenciada (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Paper, blog o demo oficial: no disponible
