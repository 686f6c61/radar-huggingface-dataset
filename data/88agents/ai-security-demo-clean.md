# 88AgentS/ai-security-demo-clean

## Resumen

`88AgentS/ai-security-demo-clean` es un modelo de tipo clasificador publicado por el usuario 88AgentS en Hugging Face. Segun su model card, se trata de un modelo ligero concebido como demostracion del sistema de escaneo de seguridad de modelos Prisma AIRS de Palo Alto Networks, y se presenta explicitamente como un artefacto "limpio" que supera todas las comprobaciones de seguridad. No es, por tanto, un modelo de lenguaje generativo, sino una pieza de demostracion orientada a validar flujos de aprobacion de modelos en pipelines de CI/CD.

El repositorio es extremadamente pequeno (0,0 GB reportados) y el recuento de parametros almacenados en safetensors es de 74.442, un orden de magnitud propio de un clasificador compacto o de un modelo de juguete, no de un LLM. La model card no documenta arquitectura, datos de entrenamiento, tokenizador ni tarea concreta mas alla de la etiqueta `classifier`.

Su relevancia actual es limitada desde el punto de vista de capacidades, pero resulta ilustrativa como ejemplo de governance de modelos: muestra como un pipeline automatizado (GitHub Actions) puede integrar una puerta de seguridad que aprueba o bloquea artefactos antes de su despliegue. Para desarrolladores e investigadores que evaluan modelos, conviene tratarlo como un caso de estudio de seguridad de la cadena de suministro de modelos, no como una base para aplicaciones de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `classifier`) |
| Parametros totales | 74.442 (recuento de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La model card solo lo describe como un "lightweight classifier model" y no detalla si se trata de un transformer, una red convolucional, un modelo lineal o cualquier otra familia. Tampoco se especifica el tokenizador, la dimensionalidad de las entradas ni el numero de clases de salida.

Respecto al entrenamiento, no hay datos sobre el corpus utilizado, el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de ajuste como RLHF o DPO. La unica informacion tecnica relevante es de caracter operativo: el modelo fue escaneado por Prisma AIRS Model Security el 27 de noviembre de 2026 mediante un flujo de GitHub Actions y aprobado bajo la politica "Passed all security rules". No se documenta ninguna innovacion arquitectonica ni de decodificacion.

## Capacidades

- Clasificacion: la unica capacidad declarada es la de clasificador (`classifier`), sin especificar el dominio ni las etiquetas de salida.
- Generacion de texto: no disponible; no hay indicios de que sea un modelo generativo.
- Razonamiento, codigo y matematicas: no disponible.
- Vision o audio: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no aplica segun la informacion disponible.
- Capacidades multilingues: no disponibles; el campo de idiomas no esta relleno en la ficha de Hugging Face.
- Modo "thinking": no disponible.

## Casos de uso

- Validacion de pipelines de seguridad de modelos: el artefacto sirve como caso de prueba "positivo" (modelo aprobado) para verificar que una puerta de Prisma AIRS en GitHub Actions emite correctamente la aprobacion y permite el despliegue.
- Pruebas de regresion de governance: un equipo de plataforma puede usar este modelo como fixture en tests automatizados que comprueben que los modelos aprobados pasan el gate y los no aprobados se bloquean.
- Demostracion de cadena de suministro de modelos: util para ilustrar en formaciones internas como se documenta la trazabilidad de un escaneo (fecha, politica, pipeline) en la propia model card.
- Integracion en CI/CD como dependencia de prueba: al ser un repo de 0,0 GB y un peso de safetensors minimo, se puede descargar rapidamente en runners efimeros sin penalizar tiempos de build.
- Ejemplo de referencia para plantillas de model card: su estructura de metadatos (licencia, tags, tabla de aprobacion) puede servir de base para estandarizar fichas de modelos internos.
- Verificacion de cumplimiento de licencia: al estar bajo Apache 2.0, puede incorporarse a entornos corporativos como artefacto de prueba sin friccion legal, siempre que se respeten las obligaciones de atribucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; con 74.442 parametros en safetensors, el peso en precision estandar es del orden de unos pocos cientos de kilobytes, por lo que cabria en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; por tamano, cualquier GPU (incluidas GTX 1050, RTX 3060, RTX 4090, A100, H100) seria sobradamente suficiente.
- Cabe en GPU consumer: si, con margen amplisimo, segun el recuento de parametros reportado.
- Opciones de despliegue: no documentadas por el autor. Por formato (safetensors) seria compatible con librerias de inferencia genericas, pero al no conocerse la arquitectura ni la tarea concreta no puede recomendarse un runtime especifico (vLLM, llama.cpp, TGI u Ollama no aplican sin mas informacion).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (clasificadores de demostracion para escaneo de seguridad), ni se dispone de datos de rendimiento para establecer una comparacion rigurosa con alternativas.

## Limitaciones y advertencias

- Ausencia de documentacion tecnica: no se especifican arquitectura, tokenizador, tarea, clases de salida ni datos de entrenamiento, lo que impide evaluar su idoneidad para cualquier uso real.
- Naturaleza de demostracion: la model card lo presenta como un artefacto para demostrar el escaneo de Prisma AIRS, no como un modelo destinado a produccion.
- Riesgo de alucinacion: no aplica en sentido estricto al no ser un modelo generativo, pero al desconocerse la tarea de clasificacion no puede descartarse un comportamiento erroneo en dominios no documentados.
- Sesgos conocidos: no disponibles; sin informacion sobre el dataset de entrenamiento no es posible evaluar sesgos.
- Limitaciones de contexto o idioma: no disponibles; el campo de idiomas esta vacio en la ficha de Hugging Face.
- Restricciones de licencia: Apache 2.0 permite uso comercial con obligaciones de atribucion y conservacion del aviso de licencia; no obstante, la licencia no cubre posibles reclamaciones derivadas de un uso inadecuado del modelo.
- Caveat de seguridad: la aprobacion por Prisma AIRS corresponde a un escaneo puntual (27 de noviembre de 2026) bajo una politica concreta; no garantiza la inocuidad de futuras revisiones del repositorio ni de pesos modificados fuera de ese escaneo.
- Trazabilidad: el modelo depende de un proveedor externo de seguridad (Palo Alto Networks) para su validacion; equipos que no usen ese stack no podran reproducir la comprobacion con la informacion publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/88AgentS/ai-security-demo-clean
- Prisma AIRS (Palo Alto Networks): https://www.paloaltonetworks.com/sase/ai-security
