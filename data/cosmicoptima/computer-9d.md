# cosmicoptima/computer-9d

## Resumen

computer-9d es un ajuste por aprendizaje por refuerzo del modelo `cosmicoptima/computer-7`, publicado por el usuario cosmicoptima en Hugging Face. Se trata de un artefacto de investigación más que de un modelo listo para producción: parte del checkpoint Computer-7 y aplica 120 pasos de RL de auto-preferencia en línea guiado por una constitución de cuatro líneas, en el que una copia congelada del propio Computer-7 lee, un token, cuál de 8 respuestas hermanas prefiere. Tiene 70.553.706.496 parámetros (unos 70,55 mil millones), pesos bf16 en safetensors y un repositorio de 141,1 GB bajo licencia Llama 3.1.

Su interés es metodológico: la model card documenta con detalle cómo deriva el comportamiento del modelo durante el entrenamiento (proporción realis/irrealis de 0,15 a 0,37, caída del 71 % en preguntas por cada 100 palabras, aumento del 16 % en hedges, "we" un 75 % más, sorpresa por token de 1,16 a 1,06 nats) y cómo un coeficiente adaptativo de KL lo devuelve de una divergencia por token de 0,052 en el paso 96 a 0,011 en el paso 105. En el momento de la consulta acumula 0 descargas y 0 likes, y no declara pipeline, idiomas ni resultados de benchmarks.

El modelo conserva el tokenizador y el formato de chat de Computer-7 (turnos de texto plano `**User:** … **Model C:** …` bajo un encabezado de documento, sin chat template). Esto refuerza su carácter de banco de pruebas para estudiar dinámicas de RL y de constituciones, no de alternativa directa a un modelo de instrucciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `llama`; 70.553.706.496 parámetros, coherente con la familia Llama 3.1 70B) |
| Parámetros totales | 70.553.706.496 (≈70,55 mil millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se publican variantes GGUF, AWQ ni GPTQ; los pesos son bf16) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.1 (identificador `llama3.1`) |
| Formato de pesos | safetensors en bf16, exportados desde un checkpoint FSDP2 con maestro en fp32 |
| Modelo base | cosmicoptima/computer-7 (finetune) |
| Formato de prompt | texto plano con encabezado de documento, turnos `**User:**` y `**Model C:**`; sin chat template |
| Tamaño del repositorio | 141,1 GB |
| Estado del entrenamiento | run 1, paso 120 |

## Arquitectura y entrenamiento

No se documenta la arquitectura interna. La etiqueta `llama`, la licencia Llama 3.1 y el recuento de 70,55 mil millones de parámetros apuntan a un transformer denso del orden de Llama 3.1 70B, pero no hay información sobre número de capas, cabezas, tipo de atención ni longitud de contexto. Tampoco se detallan los datos de preentrenamiento del modelo base: no se indica el número de tokens, la composición del corpus, ni si hubo RLHF o DPO previos sobre `cosmicoptima/computer-7`.

Lo que sí se documenta es el procedimiento de RL. Una copia congelada de Computer-7 puntúa, un token, qué respuesta prefiere entre 8 turnos hermanos; la lectura se repite bajo cuatro líneas de encuadre (con 8 rotaciones de presentación cada una, 32 lecturas por fork, promediando cuotas) y las ventajas dentro del fork entrenan la política con REINFORCE, pérdida a nivel de token y KL al checkpoint inicial con coeficiente adaptativo dirigido a 0,03. El asiento de usuario lo ocupa el simulador `sundry-1`; las conversaciones abren con un encabezado de documento aleatorio y duran 4 turnos. Las cuatro líneas de encuadre son: (1) la respuesta más propia y conceptualmente perspicaz, pareciendo aún correcta, ética y epistémicamente calibrada; (2) la respuesta sabia, ética y epistémicamente calibrada; (3) la que más desarrolla la forma global de la conversación; (4) la que más desarrolla el propio pensamiento del modelo. La longitud se neutralizó eliminando la pendiente de longitud agrupada dentro del fork de las ventajas; las respuestas que re-narran el encuadre del documento se marcan como inválidas. Cada actualización usa 32 forks × 4 turnos con lr 2e-6. El estudio de las líneas muestra que las 1, 3 y 4 concuerdan entre sí (r 0,8-0,9) y dominan el agregado, mientras que la línea 2 coincide con el ganador agregado aproximadamente la mitad de las veces. Los pesos publicados son la exportación bf16 del checkpoint FSDP2.

## Capacidades

- Generación de texto conversacional en el formato propio de Computer-7: turnos de texto plano `**User:** … **Model C:** …` precedidos por un encabezado de documento.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso; el protocolo descrito se limita a conversaciones de 4 turnos.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- No hay modo thinking, visión, audio ni ninguna otra modalidad declarada.
- Cambios de comportamiento medidos tras 120 pasos: proporción realis/irrealis de 0,15 a 0,37; preguntas por cada 100 palabras un 71 % menos; paréntesis por cada 100 palabras un 17 % menos; hedges un 16 % más; uso de "we" un 75 % más; longitud mediana de turno de 158 tokens a un rango oscilante de ~150-195 tokens.
- No se documenta ningún ajuste de seguridad, alineamiento adicional ni filtro de contenido.

## Casos de uso

- Investigación sobre RL de auto-preferencia: reproducir el bucle en el que un modelo congelado puntúa turnos hermanos y las ventajas dentro del fork entrenan la política, para estudiar si el juicio del propio modelo es una señal de recompensa estable.
- Estudio de constituciones de pocas líneas: comparar el efecto de las cuatro líneas de encuadre publicadas sobre el resultado final, dado que las líneas 1, 3 y 4 correlacionan entre 0,8 y 0,9 y la línea 2 discrepa aproximadamente la mitad de las veces.
- Control de deriva respecto al checkpoint inicial: usar los distintos pasos de la run (por ejemplo `computer-9c`, paso 100, frente al paso 120) como serie temporal para analizar el comportamiento del coeficiente KL adaptativo, que pasó de 0,05 a 0,38 y devolvió la KL por token de 0,052 a 0,011.
- Evaluación de estilo frente a contenido: explotar las métricas documentadas (ratio realis/irrealis, preguntas por cada 100 palabras, hedges, uso de "we", sorpresa por token) como proxies baratos para detectar deriva estilística en procesos de RL.
- Banco de pruebas de jueces automáticos: el esquema de 8 turnos hermanos, 4 encuadres y 8 rotaciones de presentación por fork (32 lecturas) es reutilizable para medir sesgos de posición y de formato en evaluadores basados en LLM.
- Generación de texto en canal documental: el modelo se entrenó con encabezados de documento aleatorios y penaliza re-narrar el encuadre, por lo que puede emplearse en experimentos de continuación de documentos con turnos etiquetados manualmente, sin chat template de por medio.
- Referencia técnica de exportación: el repositorio documenta la conversión de un checkpoint FSDP2 con maestro fp32 a safetensors bf16, útil como plantilla para publicar pesos de modelos de 70B entrenados con paralelismo.
- Continuación del experimento: reanudar el entrenamiento desde el paso 120 exige reproducir el pipeline completo (FSDP2, simulador `sundry-1`, cálculo de KL adaptativa) y no está soportado por las herramientas de inferencia habituales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible: no hay MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar para este modelo. Los únicos números publicados son diagnósticos internos de la dinámica de entrenamiento (comparación entre los pasos 0-15 y 80-94 sobre turnos muestreados), que se recogen a continuación y no deben interpretarse como evaluaciones de capacidad.

| Métrica de entrenamiento | Computer-7 (pasos 0-15) | computer-9d (pasos 80-94) |
|---|---|---|
| Ratio realis/irrealis | 0,15 | 0,37 |
| Preguntas por 100 palabras | referencia | −71 % |
| Paréntesis por 100 palabras | referencia | −17 % |
| Hedges | referencia | +16 % |
| Uso de "we" | referencia | +75 % |
| Longitud mediana de turno | 158 tokens | ~150-195 tokens (oscila con el controlador KL) |
| Sorpresa por token | 1,16 nats | 1,06 nats |
| KL por token respecto al inicio | — | 0,052 en el paso 96; 0,011 en el paso 105 |
| Coeficiente KL adaptativo | — | 0,05 → 0,38 |

## Requisitos de hardware

- Inferencia en bf16: los pesos ocupan aproximadamente 141 GB (tamaño del repositorio 141,1 GB), de modo que se necesitan al menos 2 GPU de 80 GB (H100 80 GB o A100 80 GB) y, con caché KV para contexto largo, es recomendable 4×A100/H100 80 GB.
- Si se generan cuantizaciones de 8 bits, la huella estimada baja a unos 71 GB, lo que encaja en una única H100 80 GB o en 2×A100 40 GB con margen ajustado.
- En 4 bits la estimación es de unos 40-45 GB: cabe en una RTX 6000 Ada 48 GB o en 2×RTX 4090/3090, siempre que se disponga de una conversión a GGUF que no se ha publicado.
- No cabe en una GPU de consumo de 24 GB (RTX 4090, RTX 3090) ni siquiera a 4 bits; solo sería viable con offloading parcial a RAM en llama.cpp, con latencias muy altas.
- Almacenamiento: hay que reservar al menos 141,1 GB para los pesos en bf16, más el espacio de la caché de compilación y del checkpoint convertido si se cuantiza.
- Opciones de despliegue: vLLM, TGI o SGLang pueden cargar safetensors de tipo Llama, pero requieren construir el prompt a mano porque el modelo no incluye chat template. llama.cpp y Ollama exigirían una conversión a GGUF no publicada.
- Latencia y throughput: no disponible.
- Advertencia de servido: el formato esperado es texto plano con encabezado de documento y turnos `**User:**` / `**Model C:**`; usar la plantilla de chat de Llama 3.1 alteraría la distribución de entrada respecto al entrenamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmarks públicos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cosmicoptima/computer-9d | 70,55 mil millones | no disponible | no disponible | Llama 3.1 | Hugging Face, safetensors bf16, 0 descargas |
| cosmicoptima/computer-7 (base) | no disponible | no disponible | no disponible | Llama 3.1 (según el modelo derivado) | Hugging Face |
| cosmicoptima/computer-9c (paso 100 de la misma run) | no disponible | no disponible | no disponible | Llama 3.1 | Hugging Face |
| Llama 3.1 70B Instruct | ≈70,6 mil millones | 128 000 tokens | publicados por Meta | Llama 3.1 | Hugging Face, con plantilla de chat |

La comparación con modelos de la misma categoría (por ejemplo, otros ajustes de 70B o modelos de instrucciones equivalentes) no es posible con los datos disponibles: no hay benchmarks ni contexto declarados para computer-9d. La única referencia firme es su modelo base, del que solo se sabe que existe en el mismo repositorio del autor.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación: no hay benchmarks, ni pipeline declarado, ni idiomas soportados, ni ficha de uso previsto.
- Sesgos conocidos: el objetivo de auto-preferencia puede reforzar la coherencia estilística del propio modelo por encima de la corrección factual; las variaciones documentadas (más "we", más hedges, menos preguntas) indican un sesgo de estilo medible, no neutro.
- Riesgo de alucinación: no se ha realizado ningún ajuste de veracidad ni de seguridad; el entrenamiento premia la preferencia del propio modelo, no la exactitud.
- Limitaciones de contexto: la longitud de contexto es desconocida, y el protocolo de entrenamiento se limita a conversaciones de 4 turnos con encabezado de documento.
- Limitaciones de idioma: no se declara ningún idioma; no hay evidencia de soporte multilingüe.
- Estabilidad del entrenamiento: en el paso 96 la KL por token subió a 0,052 y el coeficiente adaptativo tuvo que escalar de 0,05 a 0,38; en los pasos 110-120 la KL vuelve a subir, por lo que el checkpoint publicado corresponde a una fase de deriva activa, no a un punto estabilizado.
- Formato: no incluye chat template, y las respuestas que re-narran el encabezado del documento se consideran inválidas durante el entrenamiento, lo que puede penalizar conductas legítimas en producción.
- Licencia: Llama 3.1 impone condiciones de uso comercial, obligaciones de atribución y una cláusula de escala (usuarios con más de 700 millones de usuarios mensuales necesitan licencia específica), además del requisito de nombrar los productos derivados con el prefijo "Llama".
- Reproducibilidad: el pipeline depende del simulador `sundry-1` y de infraestructura FSDP2, no reproducible con las herramientas de inferencia estándar.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin revisión externa conocida.
- Las búsquedas web realizadas no devolvieron ninguna fuente independiente sobre este modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cosmicoptima/computer-9d
- Modelo base: https://huggingface.co/cosmicoptima/computer-7
- Checkpoint hermano de la misma run: https://huggingface.co/cosmicoptima/computer-9c
- No se han encontrado papers, blogs, repositorios ni demos adicionales: las búsquedas web realizadas devolvieron únicamente páginas corporativas de Microsoft, sin relación con el modelo.
