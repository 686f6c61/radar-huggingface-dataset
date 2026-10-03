# Blackfrost-AI/CYBER-FROST-3.8-NVFP4-V2

## Resumen

CYBER-FROST-3.8-NVFP4-V2 es un checkpoint de pesos mixtos publicado por Blackfrost-AI, derivado por cuantizacion del modelo base Blackfrost-AI/CYBER-FROST-3.8-BF16. Se trata de un modelo de generacion de texto orientado a seguridad informatica, con arquitectura declarada Qwen4ExpForConditionalGeneration, mezcla de expertos (MoE) y una torre de vision presente en la configuracion aunque no evaluada. La variante V2 es una reexportacion NVFP4 del mismo checkpoint BF16 final: corrige un problema de compatibilidad de escalas de cuantizacion en las proyecciones gate/up de la release NVFP4 original, no es un reentrenamiento ni un ajuste LoRA.

El artefacto usa precision mixta: los expertos enrutados del modelo de lenguaje emplean ModelOpt NVFP4 W4A4 con group size 16, mientras que el resto de tensores permanece en BF16. El repositorio contiene 131 shards de SafeTensors con 296.474 tensores, un payload indexado de 186.356.367.352 bytes (173,56 GiB) y un total de parametros declarado por safetensors de 119.602.003.859, frente a los aproximadamente 180B de la arquitectura logica de origen. El contexto configurado es de 262.144 tokens y conserva una capa MTP (multi-token prediction) en BF16 para decodificacion especulativa.

Es relevante para equipos de red team, blue team e investigacion de seguridad porque el modelo esta disenado explicitamente para reducir rechazos innecesarios en flujos de trabajo autorizados, donde el vocabulario de respuesta a incidentes, validacion de exploits o analisis de malware coincide con el de actividad no autorizada. La propia model card advierte de que no se ha ejecutado ninguna prueba de inferencia ni de capacidad sobre V2, por lo que sus afirmaciones de comportamiento no estan medidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4ExpForConditionalGeneration; mezcla de expertos (MoE) con torre de vision en la configuracion |
| Parametros totales | 119.602.003.859 (recuento de safetensors); arquitectura logica de origen: aproximadamente 180B |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (configurado) |
| Tipos de cuantizacion | NVFP4 W4A4 con group size 16 (ModelOpt) en expertos enrutados del LM; BF16 en tensores no objetivo; modelo base en BF16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `other` en el repositorio) |
| Formato de pesos | SafeTensors (131 shards); incluye indice de pesos, configuracion, metadatos de cuantizacion ModelOpt, tokenizer y processor |

Datos adicionales del artefacto: payload indexado de 186.356.367.352 bytes (173,56 GiB); tamano del repositorio 186,4 GB; 296.474 tensores; capa MTP en BF16 preservada del origen; 24.576 pares de escala global gate/up, 73.728 escalas de entrada calibradas y 1.562 tensores fuente no enrutados verificados en la exportacion V2.

## Arquitectura y entrenamiento

La arquitectura declarada es Qwen4ExpForConditionalGeneration, una variante de mezcla de expertos de la familia Qwen con una torre de vision incluida en la configuracion. El checkpoint incorpora una capa MTP en BF16 heredada del modelo fuente, pensada para decodificacion especulativa. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO; la model card solo indica que el padre BF16 fue ajustado sobre un corpus de seguridad, sin detallar su contenido ni volumen.

La innovacion tecnica documentada es la correccion de escalas de la exportacion NVFP4. En la release original, cada experto enrutado cuantizaba las proyecciones gate y up de forma independiente, generando escalas globales FP32 (`weight_scale_2`) potencialmente distintas. En rutas de inferencia fusionadas gate/up que usan una unica escala global, como la ruta W13 fusionada de vLLM, la escala de gate se aplicaba tambien a up y desescalaba esa proyeccion. En V2, cada par gate/up comparte el maximo valor absoluto de peso BF16 antes de calcular las nuevas escalas de bloque FP8 E4M3 y empaquetar los pesos NVFP4, de modo que las escalas globales resultantes son identicas dentro de cada par. Es una reexportacion desde BF16 con recalculo de escalas, no una simple sobreescritura de metadatos. No altera atencion, expertos compartidos, PLE, vision, MTP ni otros tensores BF16 no enrutados.

## Capacidades

- Generacion de texto y conversacion multirroundo en el dominio de seguridad informatica, con especial enfasis en contenido tecnico de respuesta a incidentes, analisis de malware y validacion de vulnerabilidades.
- Uso de herramientas y function calling, segun los tags del repositorio (`tool-use`), lo que permite integracion en agentes de seguridad.
- Razonamiento multi-paso y operacion como agente, implicito en el soporte de tool use y en la ventana de contexto de 262.144 tokens.
- Decodificacion especulativa mediante la capa MTP en BF16 preservada del modelo fuente.
- Redaccion de contenido defensivo y ofensivo en el contexto de investigacion autorizada: deteccion, ingenieria, evaluacion y respuesta (tags `red-team`, `blue-team`, `cybersecurity`, `security-research`).
- Vision: la configuracion incluye torre de vision y el pipeline figura como `image-text-to-text`, pero la model card advierte explicitamente de que no se ha realizado ninguna evaluacion de calidad multimodal y que no debe inferirse capacidad validada de imagen o video.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Triaje de respuesta a incidentes: el modelo puede resumir y correlacionar artefactos de un incidente en una unica ventana de 262.144 tokens, evitando el troceado de logs y telemetria, y manteniendo la terminologia tecnica sin rechazos por vocabulario sensible.
- Analisis de malware y desobfuscacion asistida: dado que el ajuste esta orientado a analisis de codigo malicioso en entornos controlados, se puede usar para explicar rutinas de ofuscacion, identificar IOCs y proponer hipotesis de comportamiento.
- Ingenieria de deteccion: generacion y revision de reglas Sigma, YARA o consultas de SIEM a partir de descripciones de tecnicas adversarias, con soporte de tool calling para consultar repositorios de reglas.
- Validacion de vulnerabilidades en laboratorio autorizado: reproduccion y explicacion de fallos en un entorno de pruebas con reglas de enfrentamiento definidas, documentando pasos y condiciones de contorno.
- Agente de SOC con herramientas: al soportar function calling y contexto largo, puede encadenar consultas a EDR, gestor de casos y sistemas de tickets, manteniendo el hilo de investigacion durante multiples pasos.
- Redaccion de informes de pentest y respuesta: conversion de notas tecnicas y salidas de herramientas en informes estructurados con hallazgos, evidencia y recomendaciones de mitigacion.
- Analisis forense de logs y memoria: procesamiento de volcados textuales y registros extensos para reconstruir lineas temporales de compromiso dentro de la ventana de contexto.
- Asistencia a desarrolladores de herramientas de seguridad: generacion y revision de codigo de utilidades de parseo, normalizacion de eventos o scripts de automatizacion, integrable en pipelines de CI/CD mediante tool calling.

En todos los casos, la autorizacion, el alcance y el control de acceso son controles externos al modelo: la model card indica explicitamente que el modelo no puede establecer propiedad, consentimiento, reglas de enfrentamiento ni jurisdiccion, y que el despliegue debe aplicar identidad, permisos de herramientas, registro y revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de V2 indica de forma explicita que no se ha ejecutado ninguna prueba de inferencia ni de capacidad sobre esta variante, y que las comprobaciones realizadas se limitan a escalas guardadas y metadatos de tensores. Los resultados historicos de verificacion y de rendimiento en GB10 que se conservan en la model card corresponden al predecesor, no a V2, y no se reproducen cifras concretas en la informacion disponible. La unica validacion cuantitativa documentada es de integridad del artefacto: 24.576 pares de escala global gate/up identicos bit a bit dentro de cada par, 73.728 escalas de entrada calibradas identicas a la referencia calibrada de NVIDIA y 1.562 tensores fuente no enrutados con formas y tipos preservados.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 186,4 GB y el payload indexado de tensores 173,56 GiB, por lo que se necesita espacio en disco superior a 186 GB para el checkpoint completo.
- Memoria para inferencia: como referencia derivada del payload, cargar el checkpoint completo requiere del orden de 174-186 GB de memoria de GPU o memoria unificada. Es una estimacion basada en el tamano del artefacto, no una medicion.
- Precision NVFP4: la cuantizacion NVFP4 W4A4 requiere soporte de hardware de la generacion Blackwell de NVIDIA. La model card cita GB10 como plataforma de los resultados del predecesor.
- GPU recomendadas: no disponible como lista oficial. Por tamano del artefacto, el despliegue en GPU discretas apunta a configuraciones multi-GPU de clase H100/H200 o a aceleradores de mayor memoria por tarjeta (B200 o equivalentes). No hay datos publicados de VRAM medida.
- GPU de consumo: no disponible. Por tamano del checkpoint, no cabe en tarjetas de consumo actuales; ademas NVFP4 exige silicio Blackwell.
- Opciones de despliegue: transformers (libreria declarada), vLLM (la model card describe la ruta fusionada W13 como el caso afectado por el problema de escalas corregido en V2, de modo que es un backend objetivo) y el ecosistema ModelOpt/TensorRT-LLM para cuantizacion NVFP4. Soporte en llama.cpp, Ollama o TGI: no disponible, no se menciona y no se publican pesos GGUF.
- Latencia y throughput: no disponible. No se han publicado mediciones para V2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CYBER-FROST-3.8-NVFP4-V2 | 119.602.003.859 segun safetensors (aproximadamente 180B en la arquitectura logica de origen) | 262.144 tokens | Mixta: NVFP4 W4A4 en expertos enrutados, BF16 en el resto | qwen-community-license-1.0 | Publico en HuggingFace; 0 descargas, 2 likes en el momento del analisis |
| CYBER-FROST-3.8-BF16 (padre) | aproximadamente 180B en la arquitectura logica declarada | 262.144 tokens (configurado en la variante derivada) | BF16 | qwen-community-license-1.0 | Publico en HuggingFace |
| CYBER-FROST-3.8-NVFP4 (predecesor, antes BLACKFROST-3.8-ICED-NVFP4-W4A4) | no disponible | 262.144 tokens (segun la variante derivada) | NVFP4 W4A4 con escalas gate/up independientes | qwen-community-license-1.0 | Publico en HuggingFace; presenta el problema de compatibilidad de escalas corregido en V2 |

No hay datos de benchmarks que permitan comparar rendimiento con alternativas de terceros de la misma categoria. No disponible.

## Limitaciones y advertencias

- Ausencia total de validacion de inferencia: no se ha ejecutado ninguna prueba de capacidad o de rendimiento sobre V2. Las comprobaciones realizadas son de integridad de escalas y metadatos, no de calidad de salida.
- Riesgo de degradacion por cuantizacion: la cuantizacion NVFP4 W4A4 con group size 16 sobre los expertos enrutados puede introducir perdida de precision frente al padre en BF16. No se han publicado mediciones comparativas de calidad.
- Dependencia del backend: el problema corregido afectaba a rutas que fusionan gate y up con una unica escala global, como la ruta W13 de vLLM. Otros backends con el mismo comportamiento pueden requerir verificacion propia.
- Vision no validada: aunque la configuracion incluye torre de vision y el repositorio pipeline figura como image-text-to-text, no existe evaluacion de calidad multimodal. No debe asumirse capacidad de imagen o video.
- Idiomas: no disponible. La model card no documenta cobertura idiomatica, lo que impide garantizar calidad fuera del ingles tecnico esperado en corpus de seguridad.
- Alcance y autorizacion: el modelo no puede determinar si un objetivo esta en alcance ni verificar consentimiento, propiedad o jurisdiccion. La responsabilidad del uso autorizado recae integramente en el despliegue.
- Doble uso: el ajuste esta disenado para reducir rechazos en vocabulario de seguridad. Esto aumenta la utilidad en flujos legitimos y tambien el riesgo de asistencia a actividad no autorizada si no se aplican controles externos de identidad, permisos, limites de tasa, registro y revision humana.
- Alucinacion: no se han publicado tasas de alucinacion ni evaluaciones de veracidad. En dominios de explotacion y analisis forense, una salida incorrecta puede ser costosa; se requiere verificacion humana.
- Licencia: el repositorio esta etiquetado como `license: other` con nombre qwen-community-license-1.0 y un archivo LICENSE empaquetado. Las condiciones exactas de uso comercial, atribucion y redistribucion no se detallan en la informacion disponible y deben consultarse en el texto de la licencia antes de cualquier despliegue en produccion.
- Madurez del proyecto: la propia model card se describe como una release publica de investigacion bajo evaluacion de calidad activa. El repositorio registra 0 descargas y 2 likes, sin validacion independiente conocida.
- Inconsistencia de recuento de parametros: el safetensors reporta 119.602.003.859 parametros frente a los aproximadamente 180B de la arquitectura logica de origen, lo que refleja el empaquetado cuantizado; no debe interpretarse como un recorte del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-NVFP4-V2
- Modelo base en BF16: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-BF16
- Release NVFP4 predecesora: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-NVFP4
- Discusion donde se identifico el problema de escalas: https://huggingface.co/Blackfrost-AI/CYBER-FROST-3.8-NVFP4/discussions/1
- Perfil de sethforprivacy, autor del informe del problema: https://huggingface.co/sethforprivacy
- Texto de la licencia: archivo LICENSE dentro del repositorio del modelo
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo, papers, blogs, repositorios o demos en la busqueda realizada.
