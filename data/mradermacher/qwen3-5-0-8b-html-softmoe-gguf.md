# mradermacher/Qwen3.5-0.8B-HTML-SoftMoE-GGUF

## Resumen

Qwen3.5-0.8B-HTML-SoftMoE-GGUF es una cuantizacion estatica en formato GGUF del modelo NikitaLazarev/Qwen3.5-0.8B-HTML-SoftMoE, publicada por el usuario mradermacher. El modelo original parte de una base Qwen3.5 de 0,8 mil millones de parametros (772.845.888 parametros reales en safetensors) a la que se le ha aplicado una tecnica de "soft MoE" mediante weight steering: no se reentrena el modelo, sino que se manipulan los pesos para inducir un comportamiento de experto de dominio orientado a la generacion de HTML. El resultado es un modelo pequeno, especializado y sin entrenamiento adicional, publicado bajo las etiquetas soft-moe, weight-steering, domain-expert y no-training.

Este repositorio concreto no contiene el modelo original, sino sus versiones cuantizadas en GGUF para inferencia eficiente en CPU y GPU de gama baja. Incluye un amplio abanico de cuantizaciones (desde Q2_K de 0,5 GB hasta f16 de 1,7 GB) y dos ficheros mmproj (Q8_0 y f16) que actuan como suplemento multimodal, lo que sugiere que el modelo base incorpora alguna capacidad de vision o procesamiento de imagenes. El tamano total del repositorio es de 8,0 GB, aunque cada cuantizacion individual ocupa menos de 2 GB.

La relevancia de esta ficha radica en que ejemplifica una tendencia creciente: la creacion de modelos de dominio muy especializados mediante tecnicas de steering de pesos en lugar de fine-tuning costoso, empaquetados en GGUF para despliegue local. Es un caso de uso util para quien necesite generar HTML estructurado en entornos con recursos limitados, aunque con un alcance muy acotado y sin datos publicos de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5) con soft-MoE inducido por weight steering; no disponible el detalle exacto de capas y atencion |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no es un MoE disperso clasico; el "soft MoE" se induce por steering de pesos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de una base Qwen3.5 de 0,8B parametros, presumiblemente un transformer decoder-only con atencion causal estandar, aunque la model card no detalla la configuracion de capas, cabezas ni dimension oculta. La innovacion principal es la aplicacion de "soft MoE" mediante weight steering: en lugar de anadir capas de mezcla de expertos o reentrenar el modelo, se modifican directamente los pesos para sesgar el comportamiento hacia un dominio concreto (generacion de HTML). Esto se etiqueta explicitamente como "no-training", es decir, no hay un proceso de fine-tuning supervisado ni RLHF/DPO documentado en la informacion disponible.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso exacto de steering. La presencia de ficheros mmproj sugiere que el modelo base conserva un proyector multimodal, probablemente heredado de la familia Qwen3.5, lo que permitiria entrada de imagenes ademas de texto. No obstante, la model card no describe esta capacidad ni su funcionamiento. Tampoco se documenta ninguna innovacion adicional como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en ingles, con especializacion inducida hacia la produccion de HTML estructurado.
- Comportamiento de "experto de dominio" limitado a HTML; no se documentan capacidades generales de razonamiento, codigo o matematicas mas alla de lo que herede de la base Qwen3.5-0.8B.
- Soporte multimodal potencial: los ficheros mmproj-Q8_0 y mmproj-f16 indican que el modelo puede procesar imagenes junto con texto, aunque no se detalla la tarea concreta.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado; no se garantiza soporte de otros idiomas.
- Modo thinking: no disponible.

## Casos de uso

- Generacion de plantillas HTML en local: el modelo puede producir fragmentos de HTML estructurado (tablas, formularios, layouts) en entornos sin conexion, gracias a su cuantizacion Q4_K_M de 0,6 GB que cabe en cualquier equipo.
- Prototipado rapido de interfaces web: un desarrollador puede generar esqueletos HTML a partir de descripciones textuales en ingles y revisarlos manualmente, usando llama.cpp u Ollama en un portatil.
- Automatizacion de documentacion tecnica: generar bloques HTML para informes o dashboards a partir de datos estructurados, aprovechando la especializacion del modelo en este dominio.
- Educacion y experimentacion con weight steering: util como caso de estudio para investigadores que quieran reproducir la tecnica de soft MoE sin entrenamiento, comparando el comportamiento del modelo base con el steering aplicado.
- Procesamiento de capturas o imagenes de interfaces: si el proyector multimodal funciona, el modelo podria describir o transcribir elementos de una UI a HTML, aunque esta capacidad no esta documentada ni validada.
- Despliegue en dispositivos de bajos recursos: con cuantizaciones de 0,5-0,7 GB, puede ejecutarse en Raspberry Pi, moviles de gama alta o CPUs sin GPU, para tareas acotadas de generacion de marcado.
- Pipeline de CI/CD para validacion de HTML: integrar el modelo como generador de casos de prueba de marcado en un entorno controlado, siempre con revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 GB (Q2_K) y 1,7 GB (f16) solo para los pesos; anadir overhead de contexto y KV cache (tipicamente 0,5-2 GB adicionales segun longitud de contexto).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060) puede ejecutar las cuantizaciones Q4-Q8 con comodidad; en A100/H100 el modelo esta infrautilizado pero funciona.
- Cabe en consumer GPU: si, en practicamente todas las GPU modernas, e incluso en CPU pura mediante llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; vLLM y TGI no soportan GGUF de forma nativa sin conversion, por lo que no son la via recomendada.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 0,8B, se espera una generacion de decenas de tokens por segundo en CPU moderna y cientos en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-HTML-SoftMoE-GGUF (este) | 772,8 M | no disponible | no disponible | GGUF | Especializado en HTML via weight steering, solo ingles |
| Qwen3.5-0.8B base | ~0,8 B | no disponible | no disponible | safetensors | Modelo generalista sin steering; capacidad HTML generica |
| Modelos GGUF de ~1B (p. ej. Llama 3.2 1B, Qwen2.5 0.5B) | 0,5-1,2 B | 32K-128K segun modelo | licencias abiertas habituales | GGUF | Generalistas, multilingues, con benchmarks publicados; no especializados en HTML |
| Modelos especializados en codigo de ~1B | ~1 B | variable | variable | GGUF/safetensors | Orientados a codigo general, no especificamente a HTML |

La comparativa es limitada porque no se dispone de datos de rendimiento del modelo ni de su licencia. Frente a alternativas generalistas de tamano similar, este modelo sacrifica amplitud por especializacion, pero sin benchmarks que respalden la mejora en HTML.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es un riesgo critico para produccion.
- Solo ingles declarado: no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Especializacion estrecha: el steering hacia HTML puede degradar capacidades generales de razonamiento, codigo o conversacion heredadas de la base.
- Riesgo de alucinacion: como todo modelo generativo de 0,8B, puede producir HTML invalido, etiquetas no cerradas o contenido inventado; requiere validacion automatica.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas.
- Repositorio con 0 descargas y 0 likes: no hay validacion comunitaria ni casos de uso reportados.
- Fecha de creacion futura (2026-11-15): metadato anomalo que sugiere posible error de publicacion o modelo experimental; conviene verificar la integridad antes de usarlo.
- El "soft MoE" por weight steering no es un MoE real: no hay enrutamiento dinamico de expertos, por lo que el termino puede inducir a confusion sobre el comportamiento interno.
- Los ficheros mmproj sugieren multimodalidad, pero no hay documentacion sobre su uso ni calidad; no asumir que funciona sin probarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-0.8B-HTML-SoftMoE-GGUF
- Modelo base: https://huggingface.co/NikitaLazarev/Qwen3.5-0.8B-HTML-SoftMoE
- Pagina de overview del cuantizador: https://hf.tst.eu/model#Qwen3.5-0.8B-HTML-SoftMoE-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
