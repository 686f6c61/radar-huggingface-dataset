# asahi-jp/plamo-3-translate-0.8b-nf4-cw-ov

## Resumen

`asahi-jp/plamo-3-translate-0.8b-nf4-cw-ov` es una version cuantizada en formato OpenVINO IR del modelo de traduccion `pfnet/plamo-3-translate-0.8b`, desarrollado originalmente por Preferred Networks (PFN). El modelo base es un LLM especializado en traduccion construido sobre PLaMo 3 NICT, un modelo preentrenado fruto de la investigacion conjunta entre PFN y el National Institute of Information and Communications Technology (NICT) de Japon. Esta variante concreta aplica cuantizacion NF4 con granularidad per-channel mediante Optimum-Intel y NNCF, generando un artefacto de 0.78 GB listo para inferencia con el runtime OpenVINO.

El modelo resuelve el problema de desplegar traduccion automatica de calidad en hardware de consumo Intel sin necesidad de GPUs dedicadas. Al estar especializado en traduccion (pipeline `translation`) y contar con solo 0.8B parametros, ofrece un equilibrio entre calidad y coste computacional que lo hace apto para escenarios de traduccion en local, procesamiento por lotes en CPU y despliegues en dispositivos con aceleracion NPU/GPU integrada.

Es relevante ahora porque los modelos PLaMo 3 representan la apuesta japonesa por LLMs soberanos con calidad de traduccion de primer nivel, y esta variante OpenVINO demuestra el flujo de conversion y cuantizacion para el ecosistema Intel, incluyendo aceleracion nativa de NF4 en los procesadores Core Ultra 200V (Lunar Lake) y posteriores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (hereda de PLaMo 3 NICT); detalles internos no disponibles |
| Parametros totales | 0.8B (segun nomenclatura del modelo base) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 weight-only, channelwise (per-channel, `dtype=nf4`, `group_size=-1`) |
| Idiomas soportados | no disponible (modelo de traduccion; idiomas concretos no especificados en la informacion) |
| Licencia | PLaMo Community License (heredada del modelo base) |
| Formato de pesos | OpenVINO IR (`.xml`/`.bin`), generado con Optimum-Intel y NNCF |

## Arquitectura y entrenamiento

El modelo base `pfnet/plamo-3-translate-0.8b` es un LLM especializado en traduccion derivado de PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO especificas para la tarea de traduccion. La model card del modelo base describe la calidad de traduccion como "world-class", pero no aporta cifras de entrenamiento.

Esta variante concreta no modifica la arquitectura: aplica cuantizacion weight-only NF4 con granularidad per-channel sobre los pesos del modelo original y los convierte a OpenVINO IR. La innovacion tecnica destacable es el uso de NF4 channelwise, que reduce el tamano del repositorio a 0.78 GB y permite aceleracion por hardware en Intel Core Ultra 200V (Lunar Lake) o posteriores; en hardware anterior las capas NF4 se descomprimen por software, lo que penaliza el rendimiento. El modelo requiere `trust_remote_code=True` por el uso de codigo personalizado en la tokenizacion y el pipeline de generacion.

## Capacidades

- Traduccion automatica especializada: el pipeline declarado es `translation`, con soporte de plantilla de chat que acepta el parametro `target_lang` para fijar el idioma destino (por ejemplo, `target_lang="en"`).
- Generacion de texto condicionada por prompt de traduccion mediante `apply_chat_template` con `add_generation_prompt=True`.
- Inferencia determinista disponible con `do_sample=False` para traducciones reproducibles.
- Ejecucion en CPU y aceleradores Intel via OpenVINO, incluyendo NPU/GPU integrada en plataformas compatibles.
- Aceleracion nativa de capas NF4 en Intel Core Ultra 200V (Lunar Lake) y posteriores.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Traduccion de documentos en local: el modelo puede traducir texto entre idiomas mediante la plantilla de chat con `target_lang`, ejecutandose enteramente en CPU Intel sin enviar datos a la nube, lo que resulta adecuado para documentacion confidencial.
- Procesamiento por lotes en servidores sin GPU: al ser un modelo de 0.8B cuantizado a NF4 (0.78 GB), permite desplegar pipelines de traduccion masiva en infraestructura solo-CPU con OpenVINO, reduciendo costes frente a soluciones basadas en GPU.
- Traduccion en el borde (edge computing): su tamano reducido y la aceleracion NF4 en Lunar Lake lo hacen viable en portatiles y dispositivos compactos con Core Ultra 200V para traduccion en tiempo real de correos, chats o notas.
- Integracion en herramientas de escritorio: aplicaciones de productividad que necesiten traducir contenido sin conexion pueden embeber el modelo via Optimum-Intel y OpenVINO, con latencia baja gracias a la descompresion acelerada por hardware.
- Preprocesado multilingue en pipelines de datos: traduccion de corpus a un idioma comun antes de tareas de analisis, indexacion o entrenamiento de otros modelos, aprovechando la ejecucion determinista (`do_sample=False`).
- Prototipado rapido de sistemas de traduccion: investigadores pueden evaluar la calidad del modelo PLaMo 3 Translate 0.8B en formato OpenVINO sin necesidad de convertir pesos manualmente, usando el snippet de la model card con `OVModelForCausalLM`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 0.78 GB en disco; la inferencia requiere cargar los pesos NF4 en memoria, por lo que se estima un consumo en torno a 1-2 GB de RAM, aunque no se proporciona una cifra oficial.
- Aceleracion NF4: solo en Intel Core Ultra 200V (Lunar Lake) o posteriores. En hardware anterior las capas NF4 se descomprimen por software.
- GPUs: no se especifican GPU recomendadas en la informacion disponible; el artefacto esta orientado al runtime OpenVINO (CPU, iGPU y NPU Intel).
- Consumer GPU: no disponible; el formato OpenVINO IR no es directamente compatible con llama.cpp u Ollama, que esperan GGUF.
- Opciones de despliegue: OpenVINO Runtime con Optimum-Intel (`OVModelForCausalLM`), versiones probadas transformers 5.15.0, optimum-intel 2.3.0.dev0+a68683c, OpenVINO 2026.4.1 y NNCF 3.3.0. Para hardware pre-Lunar Lake, la model card recomienda usar las variantes INT8 o INT4 del modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| asahi-jp/plamo-3-translate-0.8b-nf4-cw-ov | 0.8B | OpenVINO IR | NF4 channelwise | PLaMo Community License | Este modelo; aceleracion NF4 en Lunar Lake |
| pfnet/plamo-3-translate-0.8b | 0.8B | no disponible | sin cuantizar (base) | PLaMo Community License | Modelo base original de PFN |
| pfnet/plamo-3-translate-0.8b-FP8 | 0.8B | no disponible | FP8 | PLaMo Community License | Variante FP8 oficial de PFN |
| pfnet/plamo-3-translate-8b | 8B | no disponible | sin cuantizar (base) | PLaMo Community License | Version mayor de 8B, mayor calidad a mayor coste |

## Limitaciones y advertencias

- La licencia PLaMo Community License no es una licencia open source estandar; es necesario revisar sus terminos para uso comercial antes de desplegar el modelo en produccion.
- El modelo esta especializado en traduccion; no debe esperarse un rendimiento generalista en razonamiento, codigo o matematicas.
- No se especifican los pares de idiomas soportados ni la direccion de traduccion preferente, por lo que la cobertura multilingue debe validarse empiricamente.
- Riesgo de alucinacion y de traducciones incorrectas en dominios especializados (legal, medico, tecnico) sin evaluacion previa.
- La aceleracion NF4 solo funciona en Intel Core Ultra 200V (Lunar Lake) o posteriores; en hardware anterior el rendimiento se degrada por la descompresion por software.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del repositorio; conviene auditar dicho codigo antes de usarlo en entornos sensibles.
- El repositorio no registra descargas ni likes y fue creado en noviembre de 2026, por lo que su adopcion y validacion por la comunidad es practicamente nula.
- No se dispone de datos sobre sesgos, longitud de contexto efectiva ni comportamiento en textos largos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/asahi-jp/plamo-3-translate-0.8b-nf4-cw-ov
- Modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Licencia del modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b/blob/main/LICENSE
- Variante FP8 oficial: https://huggingface.co/pfnet/plamo-3-translate-0.8b-FP8
- Version 8B: https://huggingface.co/pfnet/plamo-3-translate-8b
- Optimum-Intel: https://github.com/huggingface/optimum-intel
