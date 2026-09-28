# CRUISEResearchGroup/AnyMo

## Resumen

AnyMo es un framework de modelado de movimiento humano a partir de IMU (unidades de medicion inercial) vestibles, desarrollado por el CRUISEResearchGroup y presentado en NeurIPS 2026 (paper arXiv:2605.22715). Su propuesta central es el modelado "geometry-aware" y agnostico al montaje ("setup-agnostic"): el modelo aprende representaciones de movimiento corporal completo a partir de observaciones dispersas de sensores, sin asumir una configuracion fija de colocacion. Para ello simula senales IMU sobre colocaciones densas en la superficie corporal, las discretiza en tokens de movimiento compactos y los alinea con un modelo de lenguaje.

El modelo publicado combina un encoder ST-GCN geometrico, un tokenizador de movimiento con cuantizacion por producto (dos codebooks de 2.048 entradas con vectores de 64 dimensiones) y un backbone de lenguaje Qwen2.5-0.5B. El repositorio empaqueta los tres componentes auxiliares (encoder, tokenizer y codebook IMU) junto al checkpoint motion-language, con un total de 517.109.747 parametros y 1,1 GB de pesos en safetensors.

Es relevante porque ataca dos problemas clasicos del sensing vestible: la heterogeneidad de configuraciones de hardware y la falta de etiquetas. El modelo soporta reconocimiento de actividad zero-shot, recuperacion cross-modal IMU-texto y captioning de movimiento, lo que permite reutilizar un mismo checkpoint con distintos numeros y posiciones de sensores. La licencia es Apache 2.0 y el pipeline se carga con `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ST-GCN (spatio-temporal graph convolutional network) sobre un grafo corporal de 23 nodos + tokenizador de movimiento con cuantizacion por producto + backbone de lenguaje Qwen2.5-0.5B (transformer decoder) |
| Parametros totales | 517.109.747 (pesos safetensors del repositorio; el backbone Qwen2.5-0.5B aporta ~494 M) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible para el checkpoint AnyMo. El backbone Qwen2.5-0.5B soporta hasta 32.768 tokens; la entrada de movimiento se fija a ventanas de 5 segundos (T=300 a 60 Hz) |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors (la model card recomienda `torch.bfloat16`); no hay variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) mas componentes auxiliares en subcarpetas: `anymo_encoder/`, `anymo_tokenizer/`, `anymo_imu_codebook/` |

## Arquitectura y entrenamiento

AnyMo es una arquitectura multimodal de tres piezas. Primero, un encoder ST-GCN "geometry-aware" que opera sobre un grafo de 23 segmentos anatomicos y procesa senales IMU crudas con 6 canales por sensor en el orden `[acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z]`, con acelerometro en m/s² y giroscopio en rad/s. El procesador mapea cada nombre de localizacion (`Head`, `L_Forearm`, `R_Forearm`, y alias como `left wrist`, `waist` o `chest`) a su nodo canonico del grafo, de modo que el orden de los sensores puede variar sin cambiar el resultado, siempre que la lista `sensor_locations` se reordene de forma coherente.

Segundo, un tokenizador de movimiento con cuantizacion por producto que discretiza la representacion de movimiento completo en tokens compactos: dos codebooks de 2.048 entradas con vectores de codigo de 64 dimensiones. Existe ademas un codebook IMU independiente (`anymo_imu_codebook/`). Tercero, un modelo de lenguaje Qwen2.5-0.5B que alinea esos tokens de movimiento con texto, habilitando clasificacion, recuperacion y generacion de descripciones.

La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF/DPO sobre el backbone; unicamente indica que el framework simula senales IMU sobre colocaciones densas en la superficie corporal y aprende representaciones estables al montaje desde observaciones dispersas. El dataset asociado es `CRUISEResearchGroup/AnyMo-Bench`.

## Capacidades

- Reconocimiento de actividad humana zero-shot: `anymo.classify()` acepta etiquetas candidatas arbitrarias en texto y devuelve la prediccion sin reentrenamiento.
- Recuperacion cross-modal IMU-texto: `anymo.encode_imu()` y `anymo.encode_text()` generan embeddings comparables mediante producto escalar.
- Captioning de movimiento vestible: `anymo.caption()` genera una descripcion en lenguaje natural de la secuencia IMU.
- Extraccion de caracteristicas: el pipeline declarado en HuggingFace es `feature-extraction`, por lo que los embeddings de movimiento pueden alimentar clasificadores downstream.
- Independencia de configuracion de sensores: acepta distinto numero y posicion de wearables, mapeando cada nombre a un nodo del grafo de 23 segmentos.
- Soporte de lotes: entrada `[B, T, S, 6]` con lista de localizaciones compartida o anidada `[B][S]`.
- Re-muestreo temporal: el procesador reescala la eje temporal a 60 Hz (no recorta ni rellena).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no disponibles; la modalidad no textual es unicamente IMU vestible.
- Capacidades multilingues: no disponibles; solo ingles.

## Casos de uso

- Reconocimiento de actividad en estudios con wearables heterogeneos: un equipo de investigacion puede desplegar el modelo con 3 sensores en un sujeto y 6 en otro, pasando la lista de localizaciones correspondiente, y obtener etiquetas de actividad sin reentrenar por configuracion.
- Preanotacion de datasets IMU: usar `classify` y `caption` para generar etiquetas y descripciones iniciales sobre horas de grabacion, que luego se revisan manualmente, reduciendo el coste de anotacion en pipelines de aprendizaje activo.
- Recuperacion semantica sobre archivos de sensores: indexar embeddings de movimiento con `encode_imu()` y permitir busquedas del tipo "secuencias similares a caminar cuesta arriba" comparando contra embeddings de texto.
- Monitorizacion de rehabilitacion fisica: descripcion automatica de ejercicios registrados con wearables en casa, generando resumenes textuales del movimiento para el seguimiento por parte del fisioterapeuta (siempre como senal auxiliar, no diagnostica).
- Analisis ergonomico en entornos industriales: detectar patrones de actividad y posturas a partir de IMUs en torso y brazos para informes de riesgo ergonomico agregados, con la advertencia de que no debe ser la base unica de decisiones de seguridad.
- Deporte y entrenamiento tecnico: captioning de series de movimiento para generar notas automaticas ("el sujeto acelera el brazo derecho durante la fase de impulso") que complementen el video de entrenamiento.
- Interfaces corporales e interaccion persona-maquina: clasificacion en tiempo casi real de gestos o actividades con un numero reducido de sensores para controlar dispositivos, aprovechando la tolerancia al montaje.
- Investigacion en representacion de movimiento: extraccion de embeddings como caracteristica congelada para comparar con baselines de HAR y para estudiar la transferibilidad entre dominios y hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia el dataset AnyMo-Bench y el paper arXiv:2605.22715, pero no incluye cifras de MMLU, HumanEval, GSM8K ni metricas especificas de HAR, recuperacion o captioning.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0 GB de pesos en bfloat16 (517 M de parametros) y alrededor de 2-4 GB de VRAM total contando encoder ST-GCN, tokenizador, codebook y activaciones. En fp32, los pesos ocuparian unos 2,1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Una RTX 3060 de 12 GB o una RTX 4090 operan con margen amplio; tambien es viable en GPUs integradas de portatil con 6-8 GB de memoria compartida.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (GTX 1650 4 GB o superior). Tambien es ejecutable en CPU, aunque con mayor latencia.
- Opciones de despliegue: `transformers` con `pipeline("anymo", ..., trust_remote_code=True)` para inferencia end-to-end desde IMU cruda, o `AutoModelForCausalLM` + `AutoProcessor` con `trust_remote_code=True` para acceso separado al modelo de lenguaje y al procesador. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, y el uso de `custom_code` dificilmente es compatible con esos runtimes sin adaptacion.
- Latencia y throughput estimados: no disponibles. Dependen del numero de sensores, de la longitud de la ventana (la recomendada es 5 s, T=300 a 60 Hz) y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AnyMo (CRUISEResearchGroup) | 517 M | No especificado (backbone de 32.768 tokens) | Apache 2.0 | HuggingFace, requiere `trust_remote_code` | Encoder ST-GCN + tokenizador de movimiento + Qwen2.5-0.5B; reconocimiento, recuperacion y captioning |
| Qwen2.5-0.5B (backbone base) | ~494 M | 32.768 tokens | Apache 2.0 | HuggingFace, transformers nativo | Solo lenguaje; no procesa IMU |
| Alternativas especificas de IMU-texto | No disponible | No disponible | No disponible | No disponible | La informacion proporcionada no incluye comparativas con otros modelos de modelado de movimiento vestible |

No se dispone de datos comparativos de rendimiento entre AnyMo y otros modelos de la misma categoria en la informacion facilitada.

## Limitaciones y advertencias

- Uso previsto exclusivamente de investigacion: la model card indica que el modelo esta pensado para investigacion en representacion de movimiento vestible, reconocimiento zero-shot, recuperacion y captioning.
- No apto para decisiones criticas: no debe usarse como base unica para decisiones de seguridad, clinicas o de alto riesgo.
- Ventana y tasa fijas: el checkpoint se entreno con ventanas de 5 segundos y una tasa objetivo de 60 Hz; otras duraciones o frecuencias pueden degradar el rendimiento.
- Restriccion del grafo corporal: el mapeo se hace sobre 23 segmentos anatomicos y no admite varios sensores asignados al mismo segmento.
- Sensibilidad al hardware: el rendimiento puede caer con condiciones de montaje o hardware sustancialmente distintos a los de entrenamiento.
- Dependencia de la observabilidad: los movimientos poco observables desde los sensores disponibles y las etiquetas de actividad dependientes del contexto son casos de fallo conocidos.
- Dominios fuera de distribucion: el rendimiento disminuye en dominios alejados de la distribucion de entrenamiento.
- Idioma: solo ingles; no hay soporte multilingue declarado.
- Riesgo de alucinacion: el backbone es un Qwen2.5-0.5B, un modelo pequeno; las descripciones generadas por `caption()` pueden ser genericas o incorrectas y deben validarse.
- Sesgos: la model card no documenta un analisis de sesgos por demografia, tipo de cuerpo o condicion fisica; el dataset de simulacion de colocaciones puede no cubrir toda la variabilidad real.
- Licencia: Apache 2.0, lo que permite uso comercial, pero el modelo incorpora el backbone Qwen2.5-0.5B (tambien Apache 2.0) y la model card original aparece truncada en la seccion de licencia ("The released model includes the Qwen2.5-0.5B backbo"), por lo que conviene verificar los terminos completos en el repositorio antes de un despliegue comercial.
- Adopcion muy baja: 9 descargas y 2 likes en el momento de la consulta, lo que implica poca validacion externa de los resultados.
- Carga con codigo remoto: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CRUISEResearchGroup/AnyMo
- Dataset AnyMo-Bench: https://huggingface.co/datasets/CRUISEResearchGroup/AnyMo-Bench
- Paper (arXiv): https://arxiv.org/abs/2605.22715
- Pagina del proyecto: https://baiyuchen.com/project/AnyMo
- Codigo en GitHub: https://github.com/CRUISEResearchGroup/AnyMo
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Resultados de busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos por el buscador eran contenido no relacionado con el modelo.
