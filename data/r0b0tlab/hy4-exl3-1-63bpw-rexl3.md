# r0b0tlab/Hy4-EXL3-1.63bpw-REXL3

## Resumen

Hy4-EXL3-1.63bpw-REXL3 es una cuantizacion de muy baja precision del modelo multimodal Tencent/Hy4, publicada por el usuario r0b0tlab en Hugging Face. Se trata de un artefacto derivado: no es un modelo entrenado desde cero, sino una conversion de los pesos originales de Hy4 a formato EXL3 (ExLlamaV3) con un nivel de cuantizacion de 1,63 bits por peso (bpw), lo que reduce drasticamente el espacio en disco y los requisitos de memoria frente al modelo en precision completa.

El modelo base, Tencent/Hy4, es un transformer de tipo mixture-of-experts (MoE) con capacidades multimodales de imagen-texto a texto, segun indican las etiquetas del repositorio (hy_v4_vl, moe, multimodal, image-text-to-text). La cuantizacion EXL3 es una tecnica de compresion agresiva orientada a inferencia en GPU con ExLlamaV3, pensada para escenarios donde el presupuesto de VRAM es el factor limitante.

La relevancia de esta ficha es doble: por un lado documenta un modelo base poco comun en el ecosistema abierto (Hy4 de Tencent, con arquitectura MoE y vision); por otro, ilustra el estado del arte en cuantizacion extrema (1,63 bpw), una frontera donde la degradacion de calidad es dificil de predecir sin evaluacion empirica. El repositorio no incluye model card sustantiva, benchmarks ni detalles de entrenamiento, por lo que buena parte de los datos tecnicos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (etiqueta hy_v4_vl); detalles no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo base es MoE, pero no se especifica el numero) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 1,63 bpw (unico formato publicado en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | "other" (no se especifica el texto de la licencia) |
| Formato de pesos | safetensors (compatible con ExLlamaV3) |

## Arquitectura y entrenamiento

El repositorio no contiene informacion sobre la arquitectura interna del modelo base mas alla de las etiquetas: se trata de un modelo MoE multimodal (imagen-texto a texto) de la familia Hy4 de Tencent. No se detallan el numero de expertos, la dimension oculta, el numero de capas, la estrategia de atencion ni el esquema de enrutamiento. Tampoco se especifica si emplea atencion lineal, decodificacion especulativa u otras innovaciones.

Respecto al entrenamiento, no hay datos publicados en la informacion disponible: se desconoce el volumen de tokens, la composicion del dataset, la existencia de fases de RLHF, DPO o ajuste por preferencias, y el proceso de alineacion. La unica informacion tecnica verificable es el proceso de cuantizacion: los pesos originales de Tencent/Hy4 se han convertido a EXL3 con 1,63 bits por peso, un regimen de compresion extremo que tipicamente combina cuantizacion de pesos con tecnicas de correccion (REXL3 aparece en el nombre del repositorio, aunque no se documenta su significado exacto).

## Capacidades

- Generacion de texto conversacional (etiqueta conversational).
- Procesamiento multimodal de imagen y texto como entrada, con salida de texto (pipeline image-text-to-text).
- Razonamiento y respuesta multi-turno, segun la naturaleza conversacional del modelo base.
- Capacidades multilingues: no confirmadas en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision detallada, audio u otras capacidades especiales: no disponible.
- Al ser una cuantizacion a 1,63 bpw, se espera degradacion de capacidades frente al modelo original, especialmente en tareas de razonamiento fino y generacion de codigo.

## Casos de uso

- Despliegue en GPU de gama consumer con VRAM limitada: la cuantizacion a 1,63 bpw permite cargar un modelo MoE multimodal en tarjetas donde la version en BF16 no cabria, habilitando experimentacion local con vision-lenguaje.
- Prototipado rapido de asistentes multimodales: util para validar pipelines de image-text-to-text (por ejemplo, descripcion de imagenes o VQA) antes de invertir en infraestructura para el modelo completo.
- Investigacion sobre cuantizacion extrema: sirve como caso de estudio para medir la degradacion de calidad a 1,63 bpw frente al modelo base, comparando perplejidad y exactitud en tareas controladas.
- Entornos de demostracion y docencia: permite ejecutar un MoE multimodal en un portatil con GPU dedicada para clases o demos, sin depender de servicios en la nube.
- Evaluacion de compatibilidad con ExLlamaV3: util para equipos que quieran verificar el soporte de la cadena de herramientas EXL3 con arquitecturas MoE multimodales.
- Filtrado y preetiquetado de datos a gran escala: si la calidad resulta aceptable, puede emplearse para anotar imagenes o generar descripciones preliminares en lotes donde el coste por token es critico.
- No se recomienda para produccion con requisitos de precision alta (codigo, matematicas, decisiones criticas) sin una evaluacion previa de la degradacion introducida por la cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision al no conocerse el numero de parametros del modelo base. A 1,63 bpw, el peso en memoria es aproximadamente 0,2 bytes por parametro, de modo que un modelo de 100 000 millones de parametros ocuparia en torno a 20 GB solo en pesos, mas overhead de cache KV y activaciones.
- GPU recomendadas: no disponible. La viabilidad depende del tamano real del modelo base, que no se especifica.
- Compatibilidad con GPU consumer: probablemente si para modelos de hasta decenas de miles de millones de parametros en tarjetas de 24 GB (RTX 3090/4090), pero no confirmado.
- Opciones de despliegue: ExLlamaV3 es el runtime natural para pesos EXL3; no se garantiza compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no soportan EXL3 de forma nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre modelos comparables de la misma categoria (MoE multimodal cuantizado a precision extrema) en la informacion proporcionada. Como referencia estructural, el modelo base Tencent/Hy4 seria el punto de comparacion natural, pero no se han facilitado sus especificaciones ni resultados.

## Limitaciones y advertencias

- La cuantizacion a 1,63 bpw es extremadamente agresiva; se espera una degradacion significativa de calidad frente al modelo original, especialmente en razonamiento, matematicas y generacion de codigo.
- No hay model card, evaluacion ni benchmarks que permitan estimar la magnitud de esa degradacion.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- La licencia figura como "other" sin texto especifico: es imprescindible consultar la licencia del modelo base (Tencent/Hy4) antes de cualquier uso comercial.
- Riesgo de alucinacion: no cuantificado; en modelos multimodales cuantizados suele aumentar, especialmente en descripciones de imagenes con detalles finos.
- Idiomas soportados no confirmados; no se garantiza un rendimiento adecuado en castellano.
- Sesgos conocidos: no documentados en la informacion disponible.
- Compatibilidad limitada: los pesos EXL3 requieren ExLlamaV3; no son directamente utilizables en otros runtimes sin conversion.
- El nombre del repositorio incluye "REXL3", cuyo significado no se documenta; conviene verificar el proceso de cuantizacion antes de confiar en el artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/r0b0tlab/Hy4-EXL3-1.63bpw-REXL3
- Modelo base: https://huggingface.co/tencent/Hy4
