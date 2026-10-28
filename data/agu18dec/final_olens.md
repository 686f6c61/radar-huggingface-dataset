# agu18dec/final_olens

## Resumen

`final_olens` no es un modelo de lenguaje al uso, sino un conjunto de adaptadores de interpretabilidad (un «OLens») acoplado a **Qwen/Qwen3.6-27B**. Su función es leer un vector del *residual stream* del modelo base —en cualquiera de sus 64 capas— y escribirlo en texto legible, es decir, traducir un estado interno a una descripción en lenguaje natural. Lo publica el usuario `agu18dec` junto con un modelo auxiliar, el **AR** (*auto-regressor*), que hace el camino inverso: dado un texto y un número de capa, predice la dirección del vector residual correspondiente.

El repositorio contiene cuatro variantes del lens (tres checkpoints de RL y el inversor previo al RL) más el AR, todos ellos adaptadores LoRA de 117M y 143M de parámetros entrenables respectivamente sobre el mismo modelo base de 27B, que no se redistribuye. La arquitectura del lens es un LoRA r16/α32 sobre todas las capas lineales de Qwen3.6-27B, con inyección del vector residual en un token *slot* dedicado; el AR añade una cabeza LayerNorm→Linear.

Su relevancia es experimental: es un artefacto de investigación sobre *activation reading* con métricas propias (WorkspaceBench, FVE) y sin resultados en benchmarks estándar. Resulta útil para quienes trabajan en interpretabilidad mecanicista, monitorización de estados internos o *steering*, no como modelo desplegable en producción conversacional. El repo tiene 0 descargas y 0 *likes* en el momento de la consulta, y la licencia no está declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r16/α32, all-linear) sobre Qwen/Qwen3.6-27B; el AR anade cabeza LayerNorm→Linear. Artefacto de lectura de activaciones, no modelo generativo autonomo |
| Parametros totales | 117M entrenables por checkpoint del lens (4 checkpoints); 143M en el AR (LoRA + cabeza). El modelo base de 27B no se incluye en el repo |
| Parametros activos | No aplica (no es un MoE) |
| Longitud de contexto | Lectura sobre un unico vector residual (una posicion); las lecturas se generan con hasta 128 tokens nuevos; el AR se entreno con spans de 1–32 tokens (media ~16,5) y solo puntua los primeros 32 tokens de una lectura. Contexto del modelo base: no disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible; el repo solo publica tensores entrenables en safetensors, sin variantes GGUF/AWQ/GPTQ |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (no declarada en la model card ni en los metadatos de HuggingFace) |
| Formato de pesos | safetensors (`model.safetensors` por carpeta) + `export.json` con la configuracion exacta de entrenamiento |
| Modelo base | Qwen/Qwen3.6-27B, revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9` |
| Capas accesibles | 64 (0–63); el vector residual es la salida del bloque decodificador L antes de la RMSNorm final |
| Dimension del vector residual | 5120 (segun el ejemplo del quickstart) |
| Tamano del repo | 2,4 GB en HuggingFace; ~1,5 GB de descarga segun el autor, mas el modelo base |
| Dependencias | torch 2.9.1, transformers 5.11.0, peft 0.19.1, safetensors, flash-linear-attention 0.5.1 |

## Arquitectura y entrenamiento

El sistema se compone de dos piezas entrenadas por separado. El **AR** (143M parámetros entrenables: LoRA r16/α32 en todas las capas lineales más una cabeza LayerNorm→Linear) recibe la etiqueta `[Layer NN]` seguida de un fragmento de texto y predice la dirección del vector residual en la posición inmediatamente anterior a ese fragmento. Se entrenó con 118.302.336 ejemplos (205.386 pasos × 576), cada uno compuesto por un span de 1–32 tokens muestreado uniformemente (≈1,95B tokens de span en total) más su capa y el vector residual verdadero, con AdamW a lr 1e-4 constante durante 171.155 pasos y decaimiento lineal a 0 en 34.231 pasos. El **lens** (117M) es el inverso: parte de un vector residual real y genera texto, con el vector inyectado en el embedding de un token *slot* (`㈜`) multiplicado por `1000 · h/‖h‖`. El *inverter* se entrenó de forma supervisada con 1.200.128 ejemplos (1.172 pasos × 1.024, lr 3e-4) y pérdida de entropía cruzada sobre el texto dado el vector inyectado.

Sobre esa base se aplicó **RL con GRPO** (lr 5e-5, KL 0.005 con estimador k3, referencia = el inverter): 600 pasos × 8 activaciones × 64 muestras = 307.200 lecturas, con recompensa definida como la FVE centrada estilo NLA de toda la lectura a través del AR congelado, `1 − (1 − cos²)/(1 − ‖μ‖²)`. Los datos provienen íntegramente de respuestas del propio Qwen3.6-27B (temperatura 1, *thinking* desactivado) a turnos de usuario de WildChat, divididos 70/20/5/5 por hash del primer turno (AR / inverter / RL / evaluación) y balanceados exactamente sobre las 64 capas y las longitudes de span. El renderizado usa la plantilla de chat con `enable_thinking=False`, y el muestreo de lecturas es temperatura 1, top-p 1, hasta 128 tokens nuevos.

## Capacidades

- Lectura de activaciones: dado un vector del residual stream de Qwen3.6-27B en cualquier capa 0–63, genera descripciones en texto de lo que ese vector codifica.
- Lectura de vectores propios: acepta cualquier tensor de forma `[5120]` correspondiente a la salida de un bloque decodificador, no solo los capturados por hook.
- Predicción inversa (AR): dado un texto de hasta 32 tokens y un número de capa, predice la dirección residual asociada, utilizable para puntuar lecturas o como señal de recompensa.
- Puntuación de fidelidad: el AR permite calcular similitud coseno y FVE entre una lectura generada y el vector real.
- Muestreo múltiple: generar varias lecturas por vector (p. ej. 4) mejora la cobertura; el autor reporta ~+0,08 de WorkspaceBench con 4 muestras.
- Selección de checkpoint: cuatro variantes con distinto equilibrio entre fidelidad y alucinación (step150, step300, step600 e inverter).
- No incluye: tool calling, function calling, capacidades de agente, visión, audio ni modo *thinking* (se desactiva explícitamente en el renderizado).

## Casos de uso

- **Interpretabilidad mecanicista en investigación**: leer el estado residual de Qwen3.6-27B en una capa concreta para estudiar qué información está codificada en cada profundidad, usando `read()` con varias muestras para estimar la distribución de contenidos.
- **Análisis de representaciones por capa**: comparar las lecturas de un mismo *prompt* en las capas 20, 40 y 60 para localizar en qué punto emerge un concepto; el AR reporta mejor ajuste en capas altas (FVE .455 en L60 frente a .234 en L20).
- **Auditoría y monitorización de estados internos**: usar el lens como sonda sobre activaciones para detectar contenido latente (intención, tema, entidad) que no aparece en la salida superficial del modelo.
- **Evaluación de técnicas de *steering***: aplicar una dirección de intervención sobre el residual y comprobar con el lens si la lectura cambia en la dirección esperada, validando el efecto de la edición antes de medirlo en la generación.
- **Verificación de hipótesis con el AR**: dado un texto candidato («Bizet»), predecir su dirección residual y medir la similitud coseno contra el vector real capturado en la capa 40, como test cuantitativo de una hipótesis interpretativa.
- **Construcción de datasets de descripciones de activaciones**: generar corpus de pares (vector, descripción) para entrenar otras sondas o para estudios comparativos entre modelos, aprovechando los 307.200 readouts del pipeline de RL como referencia metodológica.
- **Docencia y divulgación técnica**: demostrar de forma tangible que un transformer mantiene información en su *residual stream* y que esta es parcialmente verbalizable, con un script autocontenido de ~3 dependencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el modelo no es un asistente y no se evalúa como tal. Las métricas propias reportadas por el autor son:

| Metrica | Resultado |
|---|---|
| WorkspaceBench, lens RL step 600 | .683 |
| WorkspaceBench, lens RL step 300 | .673 |
| WorkspaceBench, lens RL step 150 | .664 |
| FVE estilo NLA del RL (held-out), inicio → step 600 | .376 → .446 |
| FVE estilo NLA del RL, step 150 | .423 |
| KL del RL respecto al inverter (mediana movil), step 600 | ~1,1 |
| AR: coseno² bruto (media, held-out 4.096 spans × 64 capas) | .770 (frente a .643 prediciendo la dirección media de cada capa) |
| AR: FVE estilo NLA sobre la media | .289 de media; .234 en L20, .316 en L40, .455 en L60 |
| AR: FVE centrada (media eliminada) | .207 |
| AR: perdida held-out 2(1 − cos) | .258 (desde .32 al inicio del entrenamiento) |
| Inverter: entropia cruzada held-out | 1,197 nats/token (desde 1,75) |

## Requisitos de hardware

- **VRAM del lens**: ~60 GB de memoria GPU para cargar el lens junto al modelo base de 27B (cifra indicada por el autor en el quickstart).
- **VRAM del AR**: otros ~60 GB adicionales si se carga en paralelo con el lens; el autor indica que es opcional.
- **GPU recomendadas**: A100 80 GB, H100 80 GB o cualquier acelerador con ≥60 GB utilizables. No cabe en GPUs de consumo (RTX 4090 24 GB, RTX 3090 24 GB) sin cuantización del modelo base, opción no documentada.
- **Opciones de despliegue**: script Python autocontenido `olens_lensB.py` con `transformers`, `peft` y `safetensors`; requiere `flash-linear-attention==0.5.1`. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, ni existen pesos GGUF.
- **Latencia y throughput**: no disponibles. Cada lectura implica generar hasta 128 tokens con el modelo de 27B, más el coste de la captura por *forward hook*.
- **Almacenamiento**: ~2,4 GB de repo más el peso completo del modelo base Qwen3.6-27B en precisión nativa.

## Comparativa con modelos similares

No se han identificado en la información disponible lentes de activaciones públicos equivalentes de otros autores. Las alternativas documentadas pertenecen al mismo autor y comparten base:

| Modelo | Base | Parametros | Contenido | Licencia | Notas |
|---|---|---|---|---|---|
| `agu18dec/final_olens` | Qwen3.6-27B | 117M (lens) + 143M (AR) | Lens en 4 checkpoints + AR | No disponible | Mayor WorkspaceBench reportado (.683) |
| `agu18dec/olens_and_ar` | Qwen3.6-27B | No disponible | OLens s3d.rl600 + AR | No disponible | Copia desde `local-workspace` para tener lens y reconstructor juntos |
| `agu18dec/oracle-lens` | Qwen3.6-27B | No disponible | LoRA que convierte el modelo en un *oracle lens* | No disponible | Variante experimental |
| `agu18dec/oracle-lens-ddp600` | Qwen3.6-27B | No disponible | LoRA, mismo concepto | No disponible | Con endpoint de inferencia en FriendliAI |

## Limitaciones y advertencias

- **No es un modelo de propósito general**: no responde preguntas ni mantiene conversaciones; genera descripciones de vectores. Usarlo como chat produce resultados sin sentido.
- **Alucinación en las lecturas**: las descripciones generadas son plausibles pero no verificadas; el propio autor mantiene un checkpoint (step 300) con «menos alucinaciones» a costa de menor WorkspaceBench, lo que confirma que el problema existe en step 600.
- **Dependencia estricta de convenciones**: el residual debe ser la salida del bloque L antes de la RMSNorm final; en `output_hidden_states` de HF el tensor de L=63 ya está normalizado y hay que usar el hook. Cualquier desviación invalida la lectura.
- **Ventana del AR muy corta**: solo se entrenó con spans de ≤32 tokens; puntuar lecturas más largas con el AR no es fiable.
- **Muestreo estocástico**: las lecturas se generan con temperatura 1 y top-p 1; una sola muestra puede no representar el vector, de ahí la recomendación de 4 muestras.
- **Sesgos heredados del corpus**: los datos provienen exclusivamente de respuestas de Qwen3.6-27B a turnos de WildChat, con la distribución, estilo y sesgos de ese corpus y del modelo base.
- **Idioma no declarado**: no se especifica cobertura multilingüe; no hay garantía de lecturas correctas en castellano ni en idiomas distintos del dominante en WildChat.
- **Licencia sin declarar**: sin licencia explícita no puede asumirse uso comercial; además, el uso queda sujeto a la licencia del modelo base Qwen3.6-27B.
- **Coste de infraestructura**: ~60 GB de VRAM por componente, fuera del alcance de hardware de consumo.
- **Madurez**: 0 descargas y 0 *likes*; la model card está truncada en el momento de la consulta (corte en la sección de curvas de entrenamiento), por lo que parte de los resultados finales no están disponibles.
- **Reproducibilidad**: requiere la revisión exacta del modelo base y versiones fijadas de transformers (5.11.0), torch (2.9.1), peft (0.19.1) y flash-linear-attention (0.5.1).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agu18dec/final_olens
- Repo hermano `olens_and_ar`: https://huggingface.co/agu18dec/olens_and_ar
- `oracle-lens`: https://huggingface.co/agu18dec/oracle-lens
- Endpoint de inferencia de `oracle-lens-ddp600` en FriendliAI: https://friendli.ai/models/agu18dec/oracle-lens-ddp600
- Listado de modelos del autor: https://essamamdani.com/ai-models/company/agu18dec
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B (revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
