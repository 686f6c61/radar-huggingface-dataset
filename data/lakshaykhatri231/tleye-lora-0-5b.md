# LakshayKhatri231/tleye-lora-0.5b

## Resumen

TLEye verdict model es un adaptador LoRA sobre Qwen/Qwen2.5-Coder-0.5B que implementa una cabeza de clasificación de un solo logit para predecir la probabilidad de que una solución de programación competitiva reciba un veredicto Time Limit Exceeded (TLE). Lo desarrolla LakshayKhatri231 y forma parte del proyecto TLEye: la mitad encargada del veredicto, mientras que la otra mitad (generación de entradas de fallo confirmadas en sandbox) no está incluida en este adaptador. El modelo recibe el lenguaje, el límite de tiempo, las restricciones de tamaño de entrada y el código fuente, y devuelve una probabilidad calibrada de TLE.

El modelo base es un transformer decoder de 0,5 mil millones de parámetros de la familia Qwen2.5-Coder, sobre el que se entrena un adaptador PEFT con una cabeza de clasificación. El contexto efectivo de trabajo es de 1024 tokens tras truncar el código a los primeros 24 000 caracteres. Su relevancia es doble: por un lado, aborda una tarea muy concreta (predicción de TLE en AtCoder) con métricas publicadas y comparación frente a una línea base de gradient boosting; por otro, demuestra que un adaptador LoRA de 0,5B puede superar a un modelo de 7B con prompting zero-shot en una tarea de clasificación de código, con AUROC de 0,863 frente a la línea base LightGBM de 0,756.

La licencia es Apache 2.0 y el repositorio tiene un tamaño de 0,0 GB, lo que sugiere que en el momento de la consulta los pesos pueden no estar materializados o el repositorio está vacío. No se han publicado datos de idiomas soportados más allá de los lenguajes de programación tratados (C++, Java, Python y PyPy).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5-Coder-0.5B) con adaptador LoRA y cabeza de clasificación de 1 logit |
| Parametros totales | 0,5 mil millones (modelo base) + adaptador LoRA (tamaño del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (truncado explícito en el pipeline de entrenamiento e inferencia) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo opera sobre C++, Java, Python y PyPy como lenguajes de programación) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen2.5-Coder-0.5B, un transformer decoder de 0,5B parámetros, y añade una cabeza de clasificación de un solo logit que lee el último token de la secuencia. El prompt tiene un formato rígido: `language`, `time limit`, `constraints`, `code` (primeros 24 000 caracteres) y el sufijo `\n### verdict:`. La secuencia se trunca a 1024 tokens y la probabilidad se obtiene como `sigmoid(logit / T)` con T = 1,290, un factor de temperatura de calibración.

Los datos provienen exclusivamente del subconjunto AtCoder de IBM Project CodeNet (se descartó AIZU por límites de tiempo inconsistentes). Se usan envíos AC y TLE, eliminando los Accepted limítrofes (CPU >= 0,8× límite) y los duplicados o conflictos, con un máximo de 40 envíos por clase, problema y lenguaje. La partición train/val/test es por problema, nunca por envío. El entrenamiento usó una submuestra sembrada de 40 000 filas del split de entrenamiento; el test consta de 42 990 envíos de 296 problemas no vistos. No se documenta el uso de RLHF ni DPO; se trata de un ajuste supervisado con clasificación binaria.

## Capacidades

- Clasificación binaria: estima P(TLE) para una solución dada, con una única salida escalar calibrada.
- Condicionamiento por lenguaje: distingue C++, Java, Python y PyPy en el prompt.
- Condicionamiento por límite de tiempo y restricciones: incorpora el time limit y los bounds de entrada parseados del enunciado.
- Procesamiento de código fuente: acepta hasta 24 000 caracteres de código por muestra antes del truncado a 1024 tokens.
- Calibración de probabilidades: ECE de 0,014 en el test retenido, con temperatura T = 1,290.
- Transferencia entre lenguajes: capacidad medida de generalizar a un lenguaje no visto en entrenamiento (leave-one-language-out).
- No soporta tool calling, agentes, visión, audio ni generación de texto libre; es exclusivamente un clasificador.

## Casos de uso

- Filtrado previo en jueces en línea: estimar P(TLE) antes de ejecutar el envío para priorizar la cola de ejecución o avisar al usuario, usando el límite de tiempo y las restricciones del enunciado como contexto.
- Asistencia al programador competitivo: integrar el adaptador en un IDE o extensión que advierta de riesgo de TLE antes de enviar, con la probabilidad calibrada como señal.
- Enrutado de envíos en infraestructura de jueces: usar la probabilidad para decidir si un envío se ejecuta en un sandbox con límites estrictos o se marca para revisión, reduciendo carga en los casos de bajo riesgo.
- Investigación en análisis de código: servir como extractor de características de eficiencia algorítmica para estudiar patrones de TLE en corpus de CodeNet.
- Detección de regresiones de rendimiento: comparar la P(TLE) de dos versiones de una solución para señalar cambios que acercan el código al límite de tiempo.
- Docencia de algoritmia: ofrecer retroalimentación automática sobre la eficiencia esperada de una solución de alumno en problemas con restricciones conocidas.
- Generación de datos sintéticos de veredicto: etiquetar envíos LLM-generados con una probabilidad de TLE para curar datasets de evaluación de eficiencia.

## Benchmarks y rendimiento

Resultados en el split de test retenido (42 990 envíos, 296 problemas no vistos), con intervalos de confianza al 95% agrupados por problema:

| Modelo | AUROC | AUPRC | ECE |
|---|---|---|---|
| Este adaptador | 0,863 [0,847; 0,881] | 0,812 [0,785; 0,839] | 0,014 [0,010; 0,023] |
| LightGBM con restricciones monótonas (línea base CPU) | 0,756 [0,735; 0,774] | 0,667 [0,638; 0,697] | 0,008 [0,008; 0,021] |

Diferencia pareada de AUROC (adaptador menos LightGBM): +0,107 [+0,095; +0,120]. AUROC por lenguaje: C++ 0,854; Java 0,886; Python 0,859.

Comparación frente a prompting zero-shot de Qwen2.5-Coder-7B-Instruct (YES/NO directo, sin cadena de pensamiento) sobre 400 ítems fijos de test: diferencia pareada de AUROC de +0,085 [+0,039; +0,128] con la misma información, y +0,101 [+0,057; +0,139] con el enunciado completo añadido.

Transferencia a lenguaje no visto (leave-one-language-out):

| Retenido | n | Problemas | LoRA LOLO AUROC [IC] | LightGBM LOLO AUROC [IC] | Diferencia pareada | LoRA AUPRC | LoRA ECE | AUROC in-distribution |
|---|---|---|---|---|---|---|---|---|
| C++ | 19 779 | 293 | 0,790 [0,771; 0,810] | 0,707 [0,688; 0,726] | +0,084 [+0,070; +0,098] | 0,752 | 0,120 | 0,854 (T=1,347) |
| Java | 9 759 | 198 | 0,846 [0,821; 0,868] | 0,733 [0,703; 0,761] | +0,113 [+0,094; +0,136] | 0,755 | 0,200 | 0,886 (T=1,245) |
| Python | 13 452 | 240 | 0,775 [0,755; 0,795] | 0,693 [0,670; 0,717] | +0,082 [+0,065; +0,102] | 0,718 | 0,127 | 0,859 (T=1,370) |

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo base de 0,5B más un adaptador LoRA, la inferencia en fp16 requiere aproximadamente 1-2 GB de VRAM; en cuantización de 4 bits podría caber en menos de 1 GB. No se han publicado cifras oficiales de VRAM ni de cuantización.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente por el tamaño del modelo base; para lotes grandes se recomienda A100 o H100.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño de 0,5B parámetros.
- Opciones de despliegue: PEFT sobre transformers; el adaptador puede fusionarse con el modelo base y servirse con vLLM, TGI o llama.cpp tras conversión a GGUF. No se documentan configuraciones oficiales de despliegue.
- Latencia y throughput: no disponibles. La secuencia de entrada está limitada a 1024 tokens, lo que acota el coste por muestra.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | AUROC test | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TLEye LoRA 0.5B (este) | 0,5B + LoRA | 1024 tokens | Clasificación P(TLE) | 0,863 | Apache 2.0 | Hugging Face (repo 0,0 GB) |
| Qwen2.5-Coder-7B-Instruct (zero-shot) | 7B | mayor (no especificado) | Clasificación P(TLE) por prompting | Inferior en +0,085 a +0,101 de AUROC pareado | Apache 2.0 (según el modelo base) | Hugging Face |
| LightGBM con restricciones monótonas | No aplica (modelo tabular) | No aplica | Clasificación P(TLE) | 0,756 | No disponible | Código del proyecto |

No se dispone de comparación con otros adaptadores LoRA especializados en predicción de veredictos en la información proporcionada.

## Limitaciones y advertencias

- No sustituye a un juez: estima P(TLE); una probabilidad baja no demuestra que la solución pase.
- La prevalencia de TLE en los datos de evaluación (0,401) es un artefacto del capping por clase; AUPRC, F1 y ECE no reflejan tasas reales. Hay que desplazar la prior antes de usar las probabilidades en producción.
- El modelo ignora en gran medida el límite de tiempo: duplicarlo cambia el logit menos que reescribir `2s` como `2.0s`.
- Responde a N en la dirección correcta pero de forma débil y no monótona para todas las soluciones.
- Solo datos de AtCoder; los envíos son humanos, no generados por LLM; no se ha probado en otros jueces, versiones de lenguaje más recientes ni otro hardware.
- La calibración se ajustó en los lenguajes de entrenamiento; el ECE en lenguaje retenido refleja calibración bajo cambio de distribución (hasta 0,200 en Java).
- Los resultados principales usan una sola semilla (AUROC de test entre 0,857 y 0,863 en tres semillas); los experimentos leave-one-language-out usan una semilla cada uno.
- El adaptador se entrenó con envíos públicos de programación competitiva: no ejecutar código del dataset fuera de un sandbox.
- El repositorio tiene 0,0 GB y 0 descargas; verificar la integridad y disponibilidad de los pesos antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/LakshayKhatri231/tleye-lora-0.5b
- Repositorio del proyecto (código de entrenamiento, motor de certificados en sandbox e informes): https://github.com/Lakshaykhatri231/TLEye
- Perfil de GitHub del autor: https://github.com/Lakshaykhatri231/
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B
- IBM Project CodeNet (dataset): https://github.com/IBM/Project_CodeNet
