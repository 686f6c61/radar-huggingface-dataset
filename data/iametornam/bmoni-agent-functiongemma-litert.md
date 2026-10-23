# iamEtornam/bmoni-agent-functiongemma-litert

## Resumen

BMONI es un ajuste fino (fine-tune) del modelo google/functiongemma-270m-it, publicado por el usuario iamEtornam en HuggingFace. Se distribuye como un único fichero `functiongemma-ft-20261022.litertlm`, es decir, en formato LiteRT-LM, el runtime de Google para inferencia en dispositivo (movil, escritorio, edge), no en safetensors ni GGUF. El repositorio ocupa 0,3 GB y la model card lo describe como "on-device agent router": un enrutador de agentes pensado para ejecutarse localmente y decidir que herramienta o funcion invocar.

El modelo hereda la licencia Gemma y, segun los tags del repositorio, es un fine-tune directo del checkpoint instruction-tuned de FunctionGemma con 270 millones de parametros. Por tanto, su proposito es el function calling de baja latencia en entornos con recursos limitados, no la generacion de texto abierta de alta calidad. La relevancia actual esta en la tendencia a ejecutar agentes pequenos en el propio dispositivo, sin depender de la nube.

La informacion publicada es muy escasa: la model card no incluye detalles de entrenamiento, datos, hiperparametros, evaluaciones ni idiomas soportados. Esta ficha refleja unicamente lo que el autor y los metadatos de HuggingFace declaran, y marca explicitamente como "no disponible" todo lo demas. Es un build de prueba ("fine-tuned test build"), con 0 descargas y 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de google/functiongemma-270m-it, familia Gemma; no se detalla en la model card) |
| Parametros totales | 270 M (segun el identificador del modelo base) |
| Parametros activos | no aplica (no hay evidencia de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el bundle LiteRT-LM de 0,3 GB sugiere pesos comprimidos, pero no se especifica el esquema |
| Idiomas soportados | no disponible |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | LiteRT-LM (`.litertlm`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

El unico dato tecnico verificable es que se trata de un fine-tune de google/functiongemma-270m-it, un modelo de 270 millones de parametros de la familia Gemma en su variante instruction-tuned. La nomenclatura "FunctionGemma" indica una especializacion hacia function calling, pero la model card no documenta la arquitectura interna (numero de capas, dimension oculta, mecanismo de atencion, vocabulario) ni si el modelo base introduce cambios estructurales respecto a Gemma.

Tampoco se publican datos sobre el proceso de ajuste: numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO, tecnicas de alineacion ni hiperparametros. El autor lo etiqueta como "fine-tuned test build", lo que sugiere un experimento de validacion mas que un artefacto de produccion. El resultado se empaqueta en un unico fichero LiteRT-LM, formato orientado a despliegue on-device mediante el runtime LiteRT de Google, lo que implica una conversion previa de los pesos originales.

## Capacidades

- Enrutamiento de funciones y agentes: el autor define el modelo como "agent router", es decir, seleccion de herramienta o funcion a invocar a partir de una peticion en lenguaje natural.
- Function calling / tool calling: capacidad heredada del modelo base FunctionGemma, orientada a generar llamadas estructuradas con nombre de funcion y argumentos.
- Ejecucion en dispositivo: al estar en formato LiteRT-LM, esta pensado para inferencia local sin conexion a servicios externos.
- Baja huella de memoria: 270 M de parametros permiten ejecucion en CPU de moviles y equipos de gama baja.
- Generacion de texto abierta: previsible por el modelo base instruction-tuned, aunque no hay evaluacion publicada que lo confirme en este fine-tune.
- Razonamiento multi-paso: no documentado; no hay evidencia de modo "thinking" ni de capacidades de planificacion larga.
- Capacidades multilingues: no disponibles; el autor no declara idiomas.
- Vision y audio: no disponibles; no hay indicios de modalidades adicionales.

## Casos de uso

- Enrutador de herramientas en aplicaciones moviles: el modelo recibe la intencion del usuario y devuelve que funcion local ejecutar (calendario, contactos, ajustes del sistema) sin enviar datos a la nube, lo que encaja con su tamano de 270 M y el empaquetado LiteRT-LM.
- Asistentes de voz sin conexion: integrado en un pipeline de ASR local, el modelo traduce la transcripcion en una llamada a funcion; su baja latencia potencial es el factor critico en interacciones habladas.
- Domotica y control de dispositivos: mapear ordenes como "apaga la luz del salon" a llamadas de API concretas dentro de una app de hogar conectado, con inferencia en el propio hub.
- Automatizacion de formularios en el dispositivo: dado un texto libre, extraer campos y rellenar una estructura JSON mediante function calling, util en apps de campo sin cobertura.
- Clasificacion y enrutado de tickets: como primer nivel de un sistema mayor, decidir a que categoria o endpoint derivar una consulta antes de invocar un modelo grande en servidor.
- Pruebas de concepto y evaluacion de pipelines de agentes: al ser un build de prueba, sirve para validar flujos de tool calling y el runtime LiteRT-LM antes de invertir en modelos mayores.
- Filtrado previo en asistentes empresariales: descartar o redirigir peticiones fuera de dominio antes de consumir cuotas de API de modelos mas costosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: con 270 M de parametros, el peso en precision completa (fp32) seria de aproximadamente 1,1 GB; en fp16, unos 0,54 GB; en int8, unos 0,27 GB; en int4, unos 0,14 GB. El repositorio de 0,3 GB apunta a un bundle ya comprimido, coherente con int8 o similar, aunque el esquema exacto no se declara.
- GPU: no necesita GPU dedicada para funcionar. Cabe en cualquier GPU consumer (RTX 3060, RTX 4060, RTX 4090) con uso de memoria trivial; en A100/H100 el cuello de botella seria el overhead de lanzamiento de kernels, no la memoria.
- CPU y edge: es el escenario natural del formato LiteRT-LM; ejecutable en CPU de telefonos Android, Raspberry Pi y portatiles sin GPU.
- Opciones de despliegue: el fichero `.litertlm` requiere el runtime LiteRT-LM de Google. No se distribuyen pesos en safetensors ni GGUF, por lo que vLLM, TGI, llama.cpp u Ollama no pueden cargarlo directamente sin una conversion previa.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| iamEtornam/bmoni-agent-functiongemma-litert | 270 M | no disponible | Gemma | LiteRT-LM | Fine-tune de prueba, 0 descargas, sin benchmarks |
| google/functiongemma-270m-it (modelo base) | 270 M | no disponible | Gemma | no disponible en esta consulta | Referencia directa del fine-tune; el autor no documenta que mejora aporta |
| Alternativas de <1 B para function calling (p. ej. familias Qwen2.5-0.5B-Instruct o SmolLM2-360M-Instruct) | 0,36-0,5 B | no disponible en esta consulta | Apache 2.0 en el caso de Qwen2.5-0.5B | safetensors, GGUF | Ecosistema de despliegue mas amplio (llama.cpp, Ollama, vLLM); no se dispone de comparacion de rendimiento verificada |

No hay datos publicados que permitan comparar calidad, latencia o precision en function calling entre estas opciones. La ventaja diferencial de BMONI seria su empaquetado LiteRT-LM para despliegue movil, y su desventaja, la ausencia de pesos en formatos estandar y de cualquier evaluacion.

## Limitaciones y advertencias

- Informacion practicamente inexistente: la model card no documenta datos de entrenamiento, evaluacion, idiomas ni limitaciones, lo que impide valorar su calidad real.
- Build de prueba: el propio autor lo etiqueta como "fine-tuned test build", sin garantia de robustez ni de mantenimiento.
- Riesgo de alucinacion: un modelo de 270 M tiene capacidad limitada para manejar ambiguedad; es esperable que invente nombres de funciones o argumentos invalidos, aunque no hay evaluacion que lo cuantifique.
- Limitaciones de contexto e idioma: se desconocen la ventana de contexto y los idiomas cubiertos; no se debe asumir soporte de castellano ni de conversaciones multi-turno largas.
- Restricciones de licencia: se aplican los Gemma Terms of Use (https://ai.google.dev/gemma/terms), no una licencia permisiva tipo Apache 2.0. Es imprescindible revisar las condiciones de uso comercial y las obligaciones de atribucion antes de integrarlo en un producto.
- Portabilidad: el formato `.litertlm` ata el modelo al runtime LiteRT-LM; migrarlo a vLLM, TGI o llama.cpp exigiria conversion y validacion adicionales.
- Adopcion nula: 0 descargas y 1 like; no hay comunidad, issues ni casos de uso verificados que respalden su fiabilidad.
- Sin garantias de soporte: al ser un repositorio personal, no hay compromiso de actualizaciones ni de correccion de errores.
- Validacion obligatoria: cualquier uso en produccion requeriria una bateria propia de pruebas de function calling (precision de seleccion de funcion, validez de esquemas JSON, comportamiento ante entradas fuera de dominio).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iamEtornam/bmoni-agent-functiongemma-litert
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Runtime LiteRT (Google): no se incluye enlace en la informacion disponible
- Paper, blog o demo del autor: no disponible
- Repositorio de codigo: no disponible
