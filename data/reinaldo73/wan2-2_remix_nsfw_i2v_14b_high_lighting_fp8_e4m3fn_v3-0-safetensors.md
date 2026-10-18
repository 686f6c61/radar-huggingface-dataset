# Reinaldo73/Wan2.2_Remix_NSFW_i2v_14b_high_lighting_fp8_e4m3fn_v3.0.safetensors

## Resumen

Wan2.2_Remix_NSFW_i2v_14b_high_lighting_fp8_e4m3fn_v3.0 es un artefacto de pesos en formato safetensors (14.291.272.136 bytes, aproximadamente 14,3 GB) publicado por el usuario Reinaldo73 dentro del archivo denominado Daniel Media Studio (DMS). No se trata de un modelo independiente con pipeline propio, sino de un componente de modelo: un checkpoint de 14.000 millones de parámetros, ya cuantizado a fp8 con formato e4m3fn, que debe cargarse dentro de un flujo de trabajo compatible junto con sus ficheros acompañantes (VAE, tokenizer, encoder de texto, posibles ControlNet y modelos base). La nomenclatura del fichero indica que es una variante de generación vídeo a partir de imagen (i2v) del modelo Wan2.2, en su versión "Remix" y con ajuste de iluminación alta ("high lighting").

El problema que resuelve es acotado y práctico: permitir la ejecución de un modelo de vídeo de 14B en GPUs con menos VRAM de la que exigiría el checkpoint en precisión completa, gracias a la cuantización fp8 e4m3fn, y ofrecer una variante específica orientada a contenido para adultos (NSFW). Su relevancia actual es limitada y de nicho: no hay pipeline declarado, no hay idiomas documentados, no hay benchmarks publicados y el repositorio registra cero descargas y cero valoraciones en el momento de la consulta. Es, por tanto, un artefacto de archivo y preservación, no una release lista para producción.

La atribución de autoría del contenido original corresponde a FX-FeiHou (repositorio FX-FeiHou/wan2.2-Remix), y la licencia registrada aguas arriba es "other" con términos personalizados, marcada explícitamente como NSFW y no apta para todas las audiencias. El archivo DMS no concede ninguna licencia nueva: cualquier reutilización o redistribución exige verificar las condiciones del autor original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la model card (por nomenclatura, modelo de difusion para video image-to-video derivado de Wan2.2; sin confirmar por el autor) |
| Parametros totales | 14 000 millones (14B, segun el nombre del fichero) |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible (modelo de video; no se especifica numero de frames ni duracion) |
| Tipos de cuantizacion | fp8 e4m3fn (pesos ya cuantizados); otras precisiones no disponibles |
| Idiomas soportados | No disponible (el prompting depende del encoder de texto acompanante) |
| Licencia | other (terminos personalizados; NSFW / not-for-all-audiences) |
| Formato de pesos | safetensors (14 291 272 136 bytes; SHA-256 2ac60c97ca6911090cdbdf055b685af3646b7bd93c19c9aae0f86f4ea018e97d) |

## Arquitectura y entrenamiento

La model card no aporta información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni la existencia de fases de ajuste (RLHF, DPO o similares). Lo único verificable es que se trata de un componente de modelo de 14B parámetros almacenado en safetensors y ya cuantizado a fp8 en formato e4m3fn, lo que reduce el peso en disco a unos 14,3 GB y sugiere una conversión orientada a inferencia con menos VRAM. El nombre del artefacto indica una variante image-to-video ("i2v"), una revisión "v3.0" y un ajuste de iluminación alta ("high lighting"), para el que el repositorio de origen publica también una variante de iluminación baja.

La innovación técnica destacable, y prácticamente la única documentada, es la propia cuantización fp8 e4m3fn aplicada a un modelo de vídeo de 14B, junto con la separación del artefacto respecto al pipeline para que procedencia, estado de licencia y notas de uso queden revisables en una sola página. No hay información sobre atención lineal, decodificación especulativa, destilación de pasos ni sobre el número de pasos de muestreo recomendado. El autor advierte explícitamente de que los ficheros de estado de entrenamiento no son modelos de inferencia y de que los LoRA y adaptadores requieren un pipeline base compatible.

## Capacidades

- Generación de vídeo a partir de una imagen de entrada (image-to-video), en una variante orientada a contenido para adultos (NSFW).
- Variante específica de iluminación alta ("high lighting"), con una variante de iluminación baja publicada en el repositorio de origen.
- Inferencia en fp8 e4m3fn, pensada para reducir requisitos de memoria respecto al checkpoint en precisión completa.
- Integración como componente dentro de un flujo de trabajo DMS compatible, junto con VAE, tokenizer, encoder de texto y posibles ControlNet.
- Compatibilidad declarada con pipelines base que admitan LoRA y adaptadores, aunque no se especifica ninguna combinación validada.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión comprensiva, audio ni modo "thinking": no es un modelo de lenguaje.
- Cobertura multilingüe: no disponible; no se declara ningún idioma para el prompting.

## Casos de uso

- Animación de imágenes fijas en un pipeline ComfyUI o DMS: se coloca el safetensors en el directorio de modelos del flujo, se cargan el VAE y el encoder correspondientes y se genera un clip a partir de una imagen de referencia. Adecuado porque el artefacto está empaquetado precisamente para ese tipo de integración.
- Pruebas de cuantización fp8 en modelos de vídeo de 14B: sirve como caso de estudio para medir la degradación visual frente al checkpoint original en fp16/bf16 dentro del mismo pipeline, con la ventaja de que el peso en disco baja a 14,3 GB.
- Investigación sobre contenido para adultos con control de acceso: entornos cerrados y verificados que necesiten estudiar sesgos, estética o calidad de generación en dominios NSFW, asumiendo los términos de licencia del autor original.
- Prototipado de previz y animática: generar movimiento a partir de un fotograma clave o de un concept art para validar encuadres y ritmo antes de producir la secuencia final, siempre que el contenido no sea sensible.
- Evaluación comparativa de variantes de iluminación: al existir versiones "high" y "low lighting" del mismo modelo base, permite montar un A/B test controlado sobre el mismo prompt e imagen de entrada.
- Preservación y auditoría de artefactos: el repositorio conserva metadatos, SHA-256, nota de origen y términos de licencia, lo que facilita tareas de catalogación y trazabilidad de modelos derivados en un archivo institucional.
- Experimentación con adaptadores y LoRA: como componente base para probar adaptadores de estilo o de personaje, teniendo en cuenta que el autor exige un pipeline compatible y no garantiza el resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas de calidad de vídeo (FVD, CLIP-score, VBench ni similares), ni latencias, ni comparaciones cuantitativas con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos fp8 e4m3fn ocupan unos 14,3 GB, por lo que se necesita margen adicional para activaciones, VAE, encoder de texto y ControlNet. Estimación razonable: 24 GB o más para un flujo completo; 16 GB sólo con cuantizaciones adicionales o resolución/duración reducidas (estimación, no confirmada por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para lotes y resoluciones altas; RTX 4090 (24 GB) como opción de gama alta de consumo; RTX 3090 (24 GB) como alternativa.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 y RTX 3090 de 24 GB; en tarjetas de 16 GB o menos requeriría recortes de resolución, duración o de componentes acompañantes.
- Opciones de despliegue: flujo de trabajo DMS compatible indicado por el autor; ComfyUI o Diffusers si el pipeline base admite el formato. No aplica vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2_Remix_NSFW_i2v_14b_high_lighting fp8 v3.0 (este artefacto) | 14B | No disponible | fp8 e4m3fn | other (NSFW) | Archivo DMS, 0 descargas |
| Wan2.2 i2v 14B (modelo base presumible) | 14B | No disponible en esta ficha | No verificada | No verificada en esta ficha | Repositorio oficial de Wan; datos no consultados |
| Wan2.1 i2v 14B (generacion anterior) | 14B | No disponible en esta ficha | No verificada | No verificada en esta ficha | Publico; datos no consultados |
| HunyuanVideo | No disponible en esta ficha | No disponible en esta ficha | No verificada | No verificada en esta ficha | Publico; datos no consultados |

No se dispone de datos verificados de rendimiento, contexto ni licencia de las alternativas dentro de la información proporcionada; la comparación se limita a la categoría (generación de vídeo image-to-video de gran tamaño) y no debe interpretarse como una evaluación de calidad.

## Limitaciones y advertencias

- Contenido NSFW explícito: el artefacto está marcado como "not-for-all-audiences"; requiere control de acceso, verificación de edad y cumplimiento normativo en la jurisdicción de uso.
- Licencia "other" con términos personalizados: el archivo DMS no concede licencia nueva alguna y no se aclaran las condiciones de uso comercial. Es imprescindible verificar los términos del autor original (FX-FeiHou) antes de cualquier uso o redistribución.
- No es un pipeline autónomo: sin el flujo de trabajo DMS y los ficheros acompañantes (VAE, tokenizer, encoder, posible ControlNet) no produce resultados utilizables.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad, fidelidad temporal ni coherencia de movimiento frente al modelo base sin cuantizar.
- La cuantización fp8 e4m3fn puede introducir degradación en detalles finos, texto en imagen y coherencia entre fotogramas; no se documenta ninguna evaluación de esa pérdida.
- Riesgo de artefactos propios de la generación de vídeo (parpadeo, morphing, incoherencia de identidad entre frames) que la model card no cuantifica.
- Idiomas no declarados: se desconoce qué idiomas admite el encoder de texto acompañante y con qué calidad.
- Cero descargas, cero valoraciones y fecha de creación igual a la de actualización: no hay evidencia de comunidad, mantenimiento ni soporte.
- Sin información sobre sesgos demográficos, estéticos o culturales del dataset de entrenamiento.
- Trazabilidad delegada: el repositorio es un archivo de terceros sobre un modelo ajeno; la responsabilidad legal del contenido generado recae en quien lo despliega.

## Enlaces

- HuggingFace (este artefacto): https://huggingface.co/Reinaldo73/Wan2.2_Remix_NSFW_i2v_14b_high_lighting_fp8_e4m3fn_v3.0.safetensors
- Repositorio de origen: https://huggingface.co/FX-FeiHou/wan2.2-Remix
- Fichero de origen, variante high lighting: https://huggingface.co/FX-FeiHou/wan2.2-Remix/resolve/main/NSFW/Wan2.2_Remix_NSFW_i2v_14b_high_lighting_fp8_e4m3fn_v3.0.safetensors
- Fichero de origen, variante low lighting: https://huggingface.co/FX-FeiHou/wan2.2-Remix/resolve/main/NSFW/Wan2.2_Remix_NSFW_i2v_14b_low_lighting_fp8_e4m3fn_v3.0.safetensors
