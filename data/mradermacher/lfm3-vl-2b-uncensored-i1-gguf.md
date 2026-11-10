# mradermacher/LFM3-VL-2B-Uncensored-i1-GGUF

## Resumen

LFM3-VL-2B-Uncensored-i1-GGUF es una distribucion de cuantizaciones GGUF del modelo GCSA-AiLab/LFM3-VL-2B-Uncensored, publicada por el usuario mradermacher. Se trata de un modelo de vision-lenguaje (VL) de aproximadamente 2 000 millones de parametros, etiquetado como "edge" y orientado a despliegue en dispositivos con recursos limitados. La familia LFM3 corresponde a la tercera generacion de modelos Liquid Foundation Models, aunque la model card no aporta detalles sobre la arquitectura interna mas alla de la etiqueta `lfm3_vl`.

El modelo base ha sido modificado mediante la tecnica de "abliteration" (etiqueta `abliterix`), un procedimiento que elimina la direccion de rechazo del espacio de activaciones para reducir las negativas del modelo, de ahi el sufijo "Uncensored". Las cuantizaciones publicadas son de tipo i1 (imatrix), generadas a partir de un fichero imatrix propio, lo que en teoria preserva mejor la calidad en tamanos reducidos que las cuantizaciones estaticas equivalentes.

La relevancia de esta ficha es doble: por un lado documenta una opcion de despliegue local de un VLM de 2B en formato GGUF; por otro, advierte de que el repositorio contiene unicamente el fichero imatrix (0,1 GB) y no los pesos cuantizados completos en el momento de la consulta, lo que condiciona su uso practico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `lfm3_vl`; familia Liquid Foundation Models) |
| Parametros totales | 899 013 (dato de safetensors del modelo base, aparentemente incompleto o mal reportado); el nombre indica 2B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1/imatrix: Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | en, zh |
| Licencia | lfm1.0 (licencia propia de Liquid AI; el campo `license: other` apunta a LICENSE) |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); fichero imatrix incluido; mmproj en el repositorio estatico |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la informacion proporcionada. La etiqueta `lfm3_vl` sugiere un modelo de la familia Liquid Foundation Models de tercera generacion con capacidad de vision, y la etiqueta `edge` indica que esta disenado para inferencia en dispositivos de borde. El sufijo "VL" confirma la presencia de un componente de vision, aunque no se especifica el tipo de encoder visual ni el mecanismo de proyeccion.

El modelo base ha sido sometido a abliteration (etiqueta `abliterix`), una tecnica de post-entrenamiento que identifica y elimina la direccion de activacion asociada al rechazo de peticiones. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Las cuantizaciones son de tipo i1, generadas con un fichero imatrix propio del autor, lo que constituye la unica innovacion tecnica documentada en esta distribucion.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles y chino.
- Comprension de imagenes (modelo vision-lenguaje): la model card indica explicitamente "This is a vision model".
- Capacidades de razonamiento y codigo: no documentadas en la informacion disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas a en y zh segun los metadatos.
- Modo "uncensored": el abliteration reduce las negativas del modelo, lo que puede aumentar la adherencia a peticiones que el modelo original rechazaria.
- Despliegue en edge: el tamano de 2B y las cuantizaciones de baja precision (hasta IQ1_S) permiten ejecucion en hardware modesto.

## Casos de uso

- Procesamiento de imagenes en dispositivos de borde: con cuantizaciones Q4_K_M o IQ4_XS, el modelo puede ejecutarse en mini-PC o moviles de gama alta para tareas de descripcion de imagenes y respuesta a preguntas visuales, sin conexion a la nube.
- Asistente visual offline para accesibilidad: descripcion de escenas o lectura de documentos capturados con camara, aprovechando el soporte bilingue en/zh y el bajo requisito de VRAM.
- Moderacion y generacion de contenido sin filtros: el abliteration permite usar el modelo en entornos de investigacion sobre sesgos o en aplicaciones creativas donde los rechazos del modelo base resultan limitantes.
- Clasificacion y extraccion de informacion de imagenes en pipelines locales: integrable via llama.cpp u Ollama para tareas de OCR asistido o etiquetado de imagenes en lotes.
- Prototipado rapido de aplicaciones VLM: las cuantizaciones IQ2/IQ3 permiten probar el modelo en GPUs consumer de 4-6 GB antes de escalar a la version completa.
- Investigacion sobre alineacion y seguridad: comparar el comportamiento del modelo abliterated frente al original para estudiar la robustez de los mecanismos de rechazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 2B, aproximada segun cuantizacion): IQ1_S ~0,5-0,7 GB; IQ2_XXS ~0,8-1,0 GB; Q3_K_M ~1,2-1,5 GB; Q4_K_M ~1,5-2,0 GB; Q5_K_M ~1,8-2,3 GB; Q6_K ~2,2-2,8 GB. Anadir overhead de contexto y del proyector visual (mmproj).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para cuantizaciones Q4 o inferiores; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 o A100/H100 para margen amplio y contexto largo.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 4 GB o mas, e incluso en CPU con cuantizaciones IQ2/IQ3.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El modelo base es compatible con transformers, pero las cuantizaciones publicadas son GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-Uncensored (i1-GGUF) | ~2B | no disponible | si | lfm1.0 | GGUF (i1), imatrix incluido; pesos completos no listados |
| Qwen2-VL-2B | ~2B | no disponible en esta ficha | si | Apache 2.0 (segun modelo original) | safetensors, GGUF de terceros |
| SmolVLM-2B | ~2B | no disponible en esta ficha | si | Apache 2.0 (segun modelo original) | safetensors, GGUF de terceros |

Nota: los datos de los modelos comparables no provienen de la informacion proporcionada y deben verificarse en sus respectivas model cards; se incluyen solo como referencia de categoria.

## Limitaciones y advertencias

- El repositorio contiene unicamente el fichero imatrix (0,1 GB) en el momento de la consulta; las cuantizaciones completas no aparecen listadas, lo que impide su uso directo.
- El modelo base ha sido sometido a abliteration, lo que elimina o reduce los mecanismos de rechazo: puede generar contenido inapropiado, danino o ilegal sin filtros. No es apto para produccion sin moderacion adicional.
- Sesgos conocidos: no documentados; al derivar de un modelo entrenado principalmente en en y zh, es probable que presente sesgos culturales y linguisticos de esos idiomas.
- Riesgo de alucinacion: no cuantificado; los modelos de 2B suelen tener mayor tasa de alucinacion que modelos de mayor tamano.
- Limitaciones de contexto e idioma: solo en y zh; no se especifica la longitud de contexto, lo que impide garantizar conversaciones largas.
- Restricciones de licencia: la licencia lfm1.0 es propia de Liquid AI y puede imponer condiciones al uso comercial; debe revisarse el fichero LICENSE antes de desplegar.
- El dato de parametros totales en safetensors (899 013) es inconsistente con el nombre del modelo (2B) y probablemente este mal reportado; conviene verificar el modelo base.
- El campo "Pipeline" no esta disponible, por lo que no se puede confirmar la tarea exacta registrada en el Hub.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-VL-2B-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/GCSA-AiLab/LFM3-VL-2B-Uncensored
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/LFM3-VL-2B-Uncensored-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#LFM3-VL-2B-Uncensored-i1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia para GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
