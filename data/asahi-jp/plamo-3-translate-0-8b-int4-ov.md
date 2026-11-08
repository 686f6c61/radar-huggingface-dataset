# asahi-jp/plamo-3-translate-0.8b-int4-ov

## Resumen

PLaMo 3 Translate 0.8B es un modelo de lenguaje especializado en traduccion desarrollado por Preferred Networks (PFN) en colaboracion con el National Institute of Information and Communications Technology (NICT) de Japon. Se construye sobre PLaMo 3 NICT, un modelo preentrenado fruto de esa investigacion conjunta, y esta disenado para ofrecer calidad de traduccion de primer nivel con un tamano reducido de 0.8 mil millones de parametros.

La ficha que nos ocupa, `asahi-jp/plamo-3-translate-0.8b-int4-ov`, no es el modelo original sino una version cuantizada del mismo. Ha sido convertida a formato OpenVINO IR y cuantizada a INT4 con Optimum-Intel y NNCF, con un metodo weight-only asimetrico y group size 64 (INT4_ASYM). El resultado es un repositorio de aproximadamente 0.80 GB, pensado para despliegue eficiente en hardware Intel, incluyendo escenarios de inferencia en el borde o en dispositivos sin conexion, como demuestra la propia PFN con una demo de traduccion en un movil en modo avion.

Su relevancia actual radica en la combinacion de tres factores: especializacion en traduccion, tamano muy contenido y disponibilidad en un formato optimizado para CPU y aceleradores Intel. Esto lo hace atractivo para integraciones donde no se dispone de GPU dedicada o donde el coste energetico y de latencia es critico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer; detalles no publicados en la informacion disponible) |
| Parametros totales | 0.8 mil millones (modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 group-64, weight-only, asimetrica (INT4_ASYM) |
| Idiomas soportados | no disponible (modelo orientado a traduccion; el ejemplo de uso traduce de japones a ingles) |
| Licencia | PLaMo Community License (license: other) |
| Formato de pesos | OpenVINO IR (cuantizado con Optimum-Intel y NNCF) |

## Arquitectura y entrenamiento

El modelo base, `pfnet/plamo-3-translate-0.8b`, es un LLM especializado en traduccion construido sobre PLaMo 3 NICT, un modelo preentrenado desarrollado conjuntamente por PFN y NICT. La informacion disponible no detalla la arquitectura interna (tipo de atencion, numero de capas, dimensiones ocultas), la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se especifica la longitud de contexto soportada.

La version aqui descrita es una cuantizacion del modelo base realizada con Optimum-Intel y NNCF. Se aplica cuantizacion de solo pesos en INT4 con granularidad de grupo 64 y esquema asimetrico, lo que reduce el peso del repositorio hasta 0.80 GB. Esta tecnica preserva las activaciones en mayor precision mientras comprime los pesos, un enfoque habitual para mantener calidad en modelos pequenos desplegados en hardware limitado. El repositorio incluye codigo personalizado (`custom_code`), por lo que requiere `trust_remote_code=True` en la carga.

## Capacidades

- Traduccion automatica especializada: el pipeline declarado es `translation` y el modelo esta disenado especificamente para esta tarea, no como modelo generalista.
- Soporte de plantilla de chat con parametro `target_lang`: el tokenizer expone `apply_chat_template` con el argumento `target_lang` (por ejemplo `"en"`), lo que permite indicar el idioma destino de forma explicita.
- Generacion determinista configurable: el ejemplo oficial usa `do_sample=False`, adecuado para traduccion donde se busca consistencia.
- Integracion con el ecosistema Hugging Face Transformers mediante `OVModelForCausalLM` de Optimum-Intel.
- Capacidades multilingues: no disponibles en detalle; el ejemplo documentado cubre japones a ingles.
- Tool calling, agentes, vision, audio o modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Traduccion en dispositivos sin conexion: gracias a su tamano de 0.8B y a la cuantizacion INT4 en OpenVINO, el modelo puede ejecutarse localmente en portatiles o incluso moviles en modo avion, como demuestra la propia PFN. Es adecuado para entornos con conectividad limitada o requisitos de privacidad estrictos.
- Traduccion de documentacion tecnica interna: al ejecutarse en local sobre CPU Intel, permite traducir manuales, contratos o documentacion sensible sin enviar datos a servicios en la nube.
- Subtitulado y transcripcion multilingue en tiempo real: su baja latencia potencial en hardware consumer lo hace viable para pipelines de traduccion de audio transcrito, siempre que se combine con un modulo ASR externo.
- Integracion en aplicaciones de escritorio: mediante OpenVINO IR puede embeberse en aplicaciones nativas para Windows o Linux con aceleracion por CPU, iGPU o NPU Intel, sin dependencia de CUDA.
- Procesamiento por lotes de correos y tickets de soporte: traduccion automatizada de comunicaciones entrantes en flujos de atencion al cliente, con coste de inferencia minimo al no requerir GPU.
- Preprocesado en pipelines de datos multilingues: traduccion de corpus para entrenamiento o analisis posterior, donde un modelo pequeno y rapido reduce costes frente a alternativas de mayor tamano.
- Sistemas embebidos y kioscos interactivos: despliegue en dispositivos con recursos limitados que necesiten traduccion puntual sin acceso a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye metricas de calidad de traduccion (BLEU, COMET, chrF) ni comparaciones con el modelo base sin cuantizar. La pagina de PFN afirma que el modelo ofrece "calidad de traduccion de primer nivel" y "world-class translation quality", pero no se aportan numeros verificables en el material consultado.

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 0.80 GB en INT4, por lo que la inferencia requiere en torno a 1 GB de memoria, dependiendo del runtime y de la longitud de secuencia.
- GPU recomendadas: no se especifican; al ser formato OpenVINO, el objetivo principal son CPU Intel, iGPU Intel y NPU Intel (Core Ultra y similares). No se documenta soporte CUDA.
- Compatibilidad con GPU consumer: cabe holgadamente en cualquier GPU consumer con mas de 2 GB de VRAM si se usa un runtime compatible, aunque el formato esta optimizado para hardware Intel.
- Opciones de despliegue: Optimum-Intel con OpenVINO (`OVModelForCausalLM`), y por extension el runtime de OpenVINO. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Versiones probadas: transformers 5.15.0, optimum-intel 2.3.0.dev0+a68683c, OpenVINO 2026.4.1, NNCF 3.3.0.
- Latencia y throughput: no disponibles. La demo de PFN sugiere ejecucion en tiempo real en un smartphone en modo avion, lo que indica latencia baja, pero no se aportan cifras.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento del modelo base ni de alternativas comparables de la misma categoria (modelos de traduccion de ~0.8B parametros), por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: inherente a los modelos generativos; en tareas de traduccion puede producir contenido no presente en el texto original, especialmente con entradas ambiguas o fuera de dominio.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto soportada y el conjunto exacto de idiomas cubiertos. El unico par documentado en el ejemplo es japones a ingles.
- Restricciones de licencia: el modelo base se distribuye bajo la PLaMo Community License, una licencia personalizada (no estandar de codigo abierto). Es imprescindible revisar sus terminos antes de cualquier uso comercial, ya que puede imponer condiciones adicionales respecto a licencias como Apache 2.0 o MIT.
- Dependencia de codigo personalizado: el repositorio requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar su contenido en entornos de produccion.
- Estado del repositorio: registra 0 descargas y 0 likes en el momento de la consulta, y no incluye seccion de requisitos de hardware pese a que la model card la anuncia vacia. Se trata de una publicacion reciente y sin validacion comunitaria aparente.
- La cuantizacion INT4 puede degradar la calidad de traduccion respecto al modelo base en FP16/BF16; no se aportan metricas que cuantifiquen esa posible perdida, por lo que se recomienda evaluar en el dominio concreto antes de desplegar.

## Enlaces

- Repositorio Hugging Face del modelo cuantizado: https://huggingface.co/asahi-jp/plamo-3-translate-0.8b-int4-ov
- Modelo base en Hugging Face: https://huggingface.co/pfnet/plamo-3-translate-0.8b
- Licencia del modelo base: https://huggingface.co/pfnet/plamo-3-translate-0.8b/blob/main/LICENSE
- Nota de prensa de PFN sobre PLaMo 3 Translate: https://www.preferred.jp/en/news/pr20261105
- Optimum-Intel: https://github.com/huggingface/optimum-intel
