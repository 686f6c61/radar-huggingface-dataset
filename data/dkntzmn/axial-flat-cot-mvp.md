# DKNTZMN/axial-flat-cot-mvp

## Resumen

`DKNTZMN/axial-flat-cot-mvp` es un modelo de investigacion de tipo "MVP" (producto minimo viable) publicado por el usuario DKNTZMN en Hugging Face, orientado a la prediccion de trayectorias en conduccion autonoma mediante chain-of-thought (CoT). No es un modelo de lenguaje: es una red neuronal en PyTorch que consume secuencias cinematicas de agentes y produce waypoints futuros. El repositorio contiene dos variantes del mismo backbone, `flat_cot_mvp` y `axial_cot_mvp`, que se diferencian unicamente en el bloque de mezcla espacial.

La arquitectura combina RMSNorm, RoPE, atencion causal, SwiGLU y cuatro tokens de consulta aprendidos que actuan como paso intermedio de razonamiento: primero cross-attienden el historial y despues se usan para predecir la trayectoria del ego. La variante axial anade una capa `AxialDense` con convoluciones Conv1d sobre los ejes H/W, mientras que la variante plana se limita a atencion mas SwiGLU. La configuracion declarada es d=256, 4 capas y 4 cabezas, lo que lo situa en la categoria de modelos de juguete.

Su relevancia es exclusivamente metodologica: sirve como baseline reproducible para comparar atencion axial frente a atencion plana en una tarea de prediccion de trayectorias, y como punto de partida de una linea de trabajo mayor del mismo autor (el modelo `axial-dense-jepa-cot-mvp`), de la que se han eliminado deliberadamente los componentes JEPA, world-model, MoE y Engram. No se han publicado pesos cuantizados, benchmarks ni resultados cuantitativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion causal, RMSNorm, RoPE y SwiGLU; la variante axial anade una capa AxialDense (Conv1d sobre ejes H/W) y 4 tokens de consulta de chain-of-thought |
| Parametros totales | no disponible (configuracion declarada: d=256, 4 capas, 4 cabezas; no se publica recuento) |
| Parametros activos | no aplica: no es un modelo MoE (la model card indica que el componente MoE de la version original fue eliminado) |
| Longitud de contexto | no disponible como ventana de texto; la secuencia de conduccion declarada es de 4 s de historial a 2 Hz (8 pasos) y 6 s de futuro a 2 Hz, con 6 agentes y 8 canales cinematicos |
| Tipos de cuantizacion | no disponible (solo se distribuye el modelo en PyTorch; no hay GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; no hay tokenizer ni vocabulario) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`library_name: pytorch`); tamano del repositorio declarado: 0,0 GB |
| Variantes incluidas | `flat_cot_mvp` (Attn + SwiGLU) y `axial_cot_mvp` (Attn + AxialDense + SwiGLU) |
| Funcion de perdida | Smooth-L1, calculada unicamente sobre los waypoints |
| Datos de entrenamiento | escenas cinematicas sinteticas generadas con el procedimiento `make_kin` del repositorio original |
| Pipeline declarado | other |
| Fecha de publicacion | 25 de septiembre de 2026 (ultima actualizacion: 25 de septiembre de 2026) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El backbone es una copia exacta del MVP original de `DKNTZMN/axial-dense-jepa-cot-mvp` (fichero `scripts/mvp_axial_ad.py`). Mantiene RMSNorm, embeddings posicionales rotatorios (RoPE), atencion causal, SwiGLU y cuatro tokens de consulta aprendidos para chain-of-thought. El mecanismo de CoT es explicito y no linguistico: los cuatro tokens de razonamiento hacen cross-attention sobre el historial de la escena y, a continuacion, la prediccion de la trayectoria del ego se calcula a partir de ellos. Se han eliminado respecto al modelo padre los modulos JEPA, world-model, MoE y Engram, de forma que la comparacion entre las dos variantes aísla el efecto del bloque de mezcla espacial (atencion plana frente a AxialDense).

Los datos son escenas cinematicas sinteticas generadas con `make_kin`, con 4 segundos de historial a 2 Hz, 6 segundos de futuro a 2 Hz, 6 agentes y 8 canales cinematicos por agente. No se documenta el numero de escenas, el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de ajuste con RLHF, DPO o similares. La unica senal de supervision declarada es la perdida Smooth-L1 sobre los waypoints, sin terminos auxiliares de regularizacion ni objetivos de mundo latente.

## Capacidades

- Prediccion de trayectorias multimodales de agentes: genera waypoints futuros a partir de 4 s de historial cinematico.
- Razonamiento intermedio mediante chain-of-thought no verbalizado: 4 tokens de consulta aprendidos que resumen el contexto antes de predecir.
- Modelado relacional entre agentes: la atencion causal permite que la trayectoria del ego se condicione por la de los otros 5 agentes de la escena.
- Procesamiento de 8 canales cinematicos por agente (posicion, velocidad y derivadas, segun el formato implicito de `make_kin`).
- Mezcla espacial alternativa en la variante axial: la capa AxialDense aplica convoluciones Conv1d sobre los ejes H/W, lo que constituye una capacidad estructural adicional frente a la variante plana.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente, planificacion multi-paso ni uso de herramientas externas.
- No dispone de capacidades multilingues ni de procesamiento de texto, imagen, audio o video.
- No dispone de modo de razonamiento explicito tipo "thinking mode" con traza textual.

## Casos de uso

- Prediccion de trayectorias en simulacion de conduccion autonoma: el modelo consume el historial cinematico de 6 agentes y devuelve los waypoints de los proximos 6 s a 2 Hz, lo que permite alimentar planificadores o evaluar escenarios de riesgo sin coste de computo relevante.
- Ablacion de arquitecturas de atencion: al compartir backbone, datos y perdida, las variantes `flat_cot_mvp` y `axial_cot_mvp` permiten medir de forma controlada si la mezcla axial Conv1d aporta ventaja frente a la atencion plana en esta tarea concreta.
- Investigacion sobre chain-of-thought sin lenguaje: los 4 tokens de consulta ofrecen un banco de pruebas para estudiar si un paso latente de razonamiento mejora la prediccion en tareas de regresion estructurada.
- Prototipado rapido en pipelines de simulacion: al ser un modelo de muy baja complejidad (d=256, 4 capas), se puede ejecutar en bucle cerrado dentro de un simulador para generar grandes volumenes de escenas etiquetadas con trayectorias.
- Baseline de reproducibilidad para publicaciones: sirve como referencia minima contra la que comparar variantes mas complejas (con JEPA, world-model o MoE) de la misma familia del autor.
- Despliegue en hardware muy limitado o en CPU: por su tamano reducido, es viable ejecutarlo en portatiles o en nodos sin GPU para pruebas de integracion y depuracion de pipelines de datos.
- Generacion de datos sinteticos comparativos: puede emplearse para producir pares (historial, trayectoria) con distintas configuraciones de escena y estudiar la sensibilidad del modelo a variaciones de densidad de agentes.
- Docencia y formacion: es un ejemplo autocontenido de transformer causal con RoPE, RMSNorm y SwiGLU orientado a prediccion de series temporales, reutilizable en cursos de aprendizaje profundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de prediccion de trayectorias habituales en este dominio (ADE, FDE, minADE, minFDE, miss rate) ni comparaciones cuantitativas entre `flat_cot_mvp` y `axial_cot_mvp`. Tampoco hay datos de latencia, throughput ni curvas de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con la configuracion declarada (d=256, 4 capas, 4 cabezas) el modelo es de complejidad muy baja, por lo que cabe en cualquier GPU consumer e incluso en CPU, pero no se publican cifras.
- GPU recomendadas: no disponible. No hay requisitos declarados; cualquier GPU con soporte CUDA y PyTorch es suficiente en la practica.
- Cabe en GPU consumer: si, en principio en cualquier GPU consumer actual e incluso en hardware integrado, dado el tamano de la configuracion. No se aportan mediciones.
- Opciones de despliegue: PyTorch nativo. No hay soporte declarado para vLLM, llama.cpp, Ollama, TGI ni otras plataformas de servicio, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible.
- Nota: el repositorio figura con un tamano de 0,0 GB, por lo que no esta confirmado que los pesos entrenados esten efectivamente publicados; puede tratarse unicamente de codigo o de una subida incompleta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de entrada | Bloque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `axial_cot_mvp` | no disponible | 4 s historial / 6 s futuro a 2 Hz, 6 agentes, 8 canales | Attn + AxialDense + SwiGLU | MIT | Hugging Face (DKNTZMN) |
| `flat_cot_mvp` | no disponible | identico | Attn + SwiGLU | MIT | Hugging Face (DKNTZMN) |
| `DKNTZMN/axial-dense-jepa-cot-mvp` (modelo padre) | no disponible | identico | Attn + AxialDense + SwiGLU + JEPA / world-model / MoE / Engram | MIT | Hugging Face (DKNTZMN) |
| Alternativas externas de prediccion de trayectorias | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos de terceros comparables en el material proporcionado, por lo que la comparativa se limita a las variantes de la misma familia del autor.

## Limitaciones y advertencias

- Entrenado exclusivamente con escenas cinematicas sinteticas generadas por `make_kin`; no hay evidencia de generalizacion a datos reales de conduccion (nuScenes, Argoverse, Waymo Open Motion Dataset u otros).
- Ausencia total de benchmarks: no se puede verificar la calidad de las trayectorias generadas ni comparar objetivamente las dos variantes.
- No es un modelo de lenguaje: carece de tokenizer, vocabulario, soporte de instrucciones, tool calling, agentes y capacidades multilingues.
- No se documenta el numero de parametros, el volumen de datos de entrenamiento, la estrategia de optimizacion, ni si existio ajuste por RLHF o DPO.
- El repositorio figura con 0,0 GB y 0 descargas y 0 likes, sin validacion alguna por parte de la comunidad; existe riesgo de que los pesos no esten disponibles o de que el artefacto sea incompleto.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de predicciones fisicamente inconsistentes o de colapso modal (trayectorias medias poco realistas) por el uso de una perdida Smooth-L1 sobre waypoints sin modelado probabilistico.
- Sesgos potenciales: el generador sintetico `make_kin` impone una distribucion concreta de maniobras, velocidades y geometrias, y el modelo puede sobreajustarse a ella.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con aviso de copyright, pero se entrega sin garantia alguna; su uso en un sistema real de conduccion autonoma seria un riesgo de seguridad critico.
- La model card esta redactada en ingles, es muy breve y no incluye informacion de limitaciones, sesgos ni consideraciones eticas.
- No hay informacion sobre versiones, cambios entre revisiones ni mantenimiento posterior a la fecha de actualizacion (25 de septiembre de 2026).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DKNTZMN/axial-flat-cot-mvp
- Modelo padre de la misma familia (referenciado en la model card): https://huggingface.co/DKNTZMN/axial-dense-jepa-cot-mvp
- La busqueda web realizada no ha devuelto articulos, papers, repositorios de codigo ni demos especificos de este modelo; los resultados obtenidos corresponden a portales genericos (huggingface.co, drforbin.ai, github.com/ClawLabsAI/free-ai-models, benchlm.ai) sin relacion concreta con `DKNTZMN/axial-flat-cot-mvp`.
