# mradermacher/Llama-3.2-1B-4B-Quad-MoE-GGUF

## Resumen

Llama-3.2-1B-4B-Quad-MoE-GGUF es la version cuantizada en formato GGUF del modelo Fu01978/Llama-3.2-1B-4B-Quad-MoE, un merge de tipo mixture-of-experts construido a partir de Llama 3.2 1B mediante mergekit. El modelo combina cuatro expertos derivados del modelo base de Meta para producir un unico checkpoint con arquitectura MoE, manteniendo el tokenizador y la configuracion de Llama 3.2. La cuantizacion la firma mradermacher, un publicador habitual de versiones GGUF de modelos de la comunidad.

El modelo cuenta con 3.651.864.608 parametros totales segun los pesos en safetensors del modelo base, y se distribuye en el repositorio en un rango de cuantizaciones estaticas que van desde Q2_K (1,6 GB) hasta f16 (7,4 GB). Esta pensado para inferencia local en CPU o GPU con llama.cpp y derivados, no para entrenamiento ni para ajuste fino.

Es relevante ahora como ejemplo de merge experimental de bajo coste: permite probar arquitecturas MoE de cuatro expertos en hardware de consumo, aunque al ser un merge comunitario sin evaluacion publicada, su calidad real frente al Llama 3.2 1B original no esta documentada. La licencia heredada es llama3.2 y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama 3.2 con mezcla de expertos (MoE) de 4 expertos, generado mediante mergekit |
| Parametros totales | 3.651.864.608 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | llama3.2 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un merge de cuatro copias de Llama 3.2 1B combinadas con mergekit para formar una estructura de mezcla de expertos. No se trata de un MoE entrenado desde cero: los expertos provienen del mismo checkpoint base y se fusionan mediante tecnicas de merging, de modo que el resultado hereda la arquitectura, el tokenizador y la configuracion de atencion de Llama 3.2. El repositorio no documenta el numero de parametros activos por token ni la estrategia exacta de enrutamiento empleada en el merge.

No hay informacion publicada sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Al ser un merge, el modelo no incorpora entrenamiento adicional mas alla del que ya tenia Llama 3.2 1B. La innovacion principal es la propia construccion MoE a partir de un modelo denso pequeno, que permite experimentar con enrutamiento entre expertos sin coste de entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Llama 3.2 1B.
- Razonamiento basico y respuesta a instrucciones de complejidad baja o media.
- Generacion de codigo sencillo, limitada por el tamano del modelo base.
- Capacidades matematicas basicas, sin garantias en problemas de varios pasos.
- Soporte de tool calling y function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el tamano del modelo base lo hace poco adecuado para tareas agenticas complejas.
- Capacidades multilingues: solo ingles declarado.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Prototipado de arquitecturas MoE en local: sirve para validar pipelines de inferencia con llama.cpp y comparar el comportamiento de un merge MoE de cuatro expertos frente a un modelo denso del mismo orden de parametros.
- Experimentacion academica con mergekit: permite reproducir y analizar como afecta la fusion de expertos a la perplejidad y a la coherencia en tareas de generacion corta.
- Chatbot de bajo coste en ingles: con cuantizaciones Q4_K_M o Q5_K_M (2,4-2,7 GB) puede ejecutarse en portatiles con 8 GB de RAM para conversaciones simples sin requisitos de calidad alta.
- Generacion de texto auxiliar en herramientas de desarrollo: borradores de documentacion, mensajes de commit o descripciones cortas en ingles, donde la latencia importa mas que la precision.
- Evaluacion de cuantizaciones: el repositorio ofrece doce variantes GGUF, util para medir el impacto de Q2_K frente a Q8_0 en un mismo modelo y elegir el compromiso tamano-calidad.
- Educacion y demos: ejemplo didactico de como se construye y cuantiza un MoE comunitario, adecuado para talleres sobre ecosistema GGUF y mergekit.
- Inferencia en CPU sin GPU: las variantes Q2_K y Q3_K_S (1,6-1,8 GB) caben en maquinas modestas y permiten desplegar un endpoint de generacion de texto basico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB (Q2_K), 2,4 GB (Q4_K_M), 4,0 GB (Q8_0) y 7,4 GB (f16), sin contar el overhead de contexto y del runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090 o superiores para cuantizaciones altas y contextos largos. A100 y H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas de VRAM, y en CPU con 8 GB de RAM para las cuantizaciones pequenas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no soportan de forma estandar este formato sin conversion previa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3.2-1B-4B-Quad-MoE-GGUF | 3.651.864.608 | no disponible | llama3.2 | GGUF | Merge MoE comunitario de 4 expertos |
| Llama 3.2 1B Instruct | 1.240.000.000 aprox. | 128.000 tokens | llama3.2 | safetensors, GGUF | Modelo denso original de Meta, ampliamente evaluado |
| Llama 3.2 3B Instruct | 3.210.000.000 aprox. | 128.000 tokens | llama3.2 | safetensors, GGUF | Denso de Meta, tamano comparable al total del merge |
| Qwen2.5 1.5B Instruct | 1.540.000.000 aprox. | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa densa con licencia permisiva |

## Limitaciones y advertencias

- Al ser un merge sin evaluacion publicada, no hay garantia de que supere al Llama 3.2 1B original; la calidad puede degradarse respecto al modelo base.
- Riesgo de alucinacion elevado por el tamano reducido del modelo base y por la fusion de expertos sin entrenamiento adicional.
- Solo soporta ingles segun la model card; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- La licencia llama3.2 impone restricciones de uso comercial y obligaciones de atribucion; conviene revisar los terminos de la licencia de Meta antes de desplegarlo en produccion.
- No se documentan parametros activos ni estrategia de enrutamiento, lo que dificulta estimar el coste real de inferencia por token.
- El repositorio ocupa 32,8 GB por incluir todas las cuantizaciones; conviene descargar solo el archivo GGUF necesario.
- Modelo con muy pocas descargas (162) y likes (2), sin comunidad que valide su comportamiento en tareas reales.
- No recomendado para tareas agenticas, tool calling ni razonamiento multi-paso sin validacion previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Llama-3.2-1B-4B-Quad-MoE-GGUF
- Modelo base: https://huggingface.co/Fu01978/Llama-3.2-1B-4B-Quad-MoE
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Llama-3.2-1B-4B-Quad-MoE-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Llama-3.2-1B-4B-Quad-MoE-GGUF
- README de referencia para GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
