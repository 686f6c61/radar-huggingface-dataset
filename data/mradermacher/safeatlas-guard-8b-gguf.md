# mradermacher/SafeAtlas-Guard-8B-GGUF

## Resumen

SafeAtlas-Guard-8B es un modelo de moderación de seguridad multimodal (visión-lenguaje) de 8 mil millones de parámetros, desarrollado por el equipo de zrwang1211 y cuantizado a formato GGUF por mradermacher. Está diseñado para tareas de clasificación ordinal de seguridad y moderación de contenido, combinando entradas de imagen y texto para evaluar si un contenido es seguro o no. El modelo se entrenó sobre el dataset SafeAtlas-VL, especializado en seguridad multimodal.

La versión GGUF aquí descrita permite desplegar el modelo en entornos de inferencia local con CPU o GPU de gama media, gracias a las distintas cuantizaciones disponibles (desde Q2_K hasta f16). Esto lo hace relevante para equipos que necesitan integrar moderación de contenido en sus aplicaciones sin depender de APIs externas, manteniendo el control sobre los datos y los costes. Aunque la licencia no está especificada, su disponibilidad en Hugging Face sugiere un uso abierto, aunque conviene verificar los términos antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal vision-language, probablemente transformer) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. Por los tags y el nombre, se trata de un modelo multimodal que procesa simultaneamente imagenes y texto, probablemente basado en un transformer con un codificador visual y un decodificador de lenguaje. El dataset de entrenamiento es SafeAtlas-VL, orientado a la seguridad multimodal, lo que sugiere que el modelo fue afinado especificamente para clasificar contenido en categorias ordinales de riesgo (por ejemplo, seguro, dudoso, peligroso). No se han publicado detalles sobre el numero de tokens de entrenamiento, el uso de RLHF o DPO, ni innovaciones tecnicas especificas.

## Capacidades

- Moderacion de contenido multimodal: evalua imagenes y texto para determinar si el contenido es seguro o inapropiado.
- Clasificacion ordinal: asigna una puntuacion o categoria de riesgo en una escala ordenada, util para sistemas de filtrado graduado.
- Soporte vision-lenguaje: combina informacion visual y textual para tomar decisiones de seguridad contextuales.
- Integrable en pipelines de moderacion: al ser un modelo de 8B, puede ejecutarse en local con cuantizaciones GGUF.
- Conversacional: el tag "conversational" sugiere que puede usarse en dialogos, aunque su funcion principal es la moderacion.
- Compatible con endpoints: el tag "endpoints_compatible" indica que puede desplegarse como servicio de inferencia.

## Casos de uso

- Moderacion de contenido en redes sociales: el modelo puede analizar imagenes y textos publicados por usuarios para detectar contenido ofensivo, violento o sexual, y aplicar politicas de la plataforma de forma automatica.
- Filtrado de imagenes en aplicaciones de mensajeria: integrar SafeAtlas-Guard-8B para bloquear o marcar imagenes inapropiadas antes de que lleguen al destinatario, protegiendo a menores y cumpliendo normativas.
- Control de calidad en plataformas de e-commerce: revisar fotos de productos y descripciones para evitar publicaciones que incumplan las directrices de la tienda (desnudos, violencia, etc.).
- Moderacion de contenido generado por IA: en herramientas que generan imagenes o texto, usar el modelo como guardarrail para filtrar salidas no seguras antes de mostrarlas al usuario.
- Auditoria de archivos multimedia: analizar grandes volumenes de imagenes y textos en bases de datos corporativas para clasificar su nivel de riesgo y priorizar revision humana.
- Asistente de moderacion para equipos de soporte: el modelo puede pre-clasificar reportes de usuarios con capturas de pantalla, reduciendo la carga de trabajo de los moderadores humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre MMLU, HumanEval, GSM8K u otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Con Q4_K_M (5.1 GB) se necesitan al menos 6-8 GB de VRAM; con Q8_0 (8.8 GB) se requieren 10-12 GB. La version f16 (16.5 GB) necesita 18-20 GB.
- GPU recomendadas: para cuantizaciones ligeras (Q4_K_M o menores) basta una GPU consumer como RTX 3060 (12 GB) o RTX 4060 (8 GB). Para Q8_0 o f16 se recomienda RTX 4090 (24 GB) o A100 (40/80 GB).
- Si cabe en consumer GPU: si, con cuantizaciones Q4_K_M o inferiores en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores compatibles con GGUF como llama-cpp-python. Tambien puede usarse con transformers si se convierte a safetensors.
- Latencia y throughput: no disponible. Depende del hardware y de la cuantizacion; en una RTX 4090 con Q4_K_M se espera una latencia de decenas de milisegundos por token, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (moderacion multimodal de 8B). Alternativas genericas como Llama-3.1-8B o Mistral-7B no estan especializadas en seguridad multimodal, por lo que no son directamente comparables. Se indica "no disponible" por falta de datos.

## Limitaciones y advertencias

- Licencia no especificada: no se conocen los terminos de uso, lo que puede suponer un riesgo legal para uso comercial. Se recomienda contactar con el autor antes de desplegarlo en produccion.
- Sesgos potenciales: al ser un modelo de moderacion, puede reflejar sesgos del dataset de entrenamiento (SafeAtlas-VL), como sobre-deteccion de ciertos tipos de contenido o sub-deteccion de otros.
- Riesgo de alucinacion: como cualquier LLM, puede generar respuestas incorrectas o inventar informacion, aunque su funcion principal es clasificatoria.
- Limitaciones de idioma: solo soporta ingles, lo que limita su uso en entornos multilingues.
- Contexto limitado: no se ha especificado la longitud de contexto, por lo que puede no ser adecuado para analizar documentos largos o conversaciones extensas.
- Dependencia de la cuantizacion: las cuantizaciones mas agresivas (Q2_K, Q3_K) pueden degradar la precision de la clasificacion, especialmente en tareas de seguridad donde los falsos negativos son criticos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/SafeAtlas-Guard-8B-GGUF
- Modelo base: https://huggingface.co/zrwang1211/SafeAtlas-Guard-8B
- Dataset de entrenamiento: https://huggingface.co/datasets/zrwang1211/SafeAtlas-VL
