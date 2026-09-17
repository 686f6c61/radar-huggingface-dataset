# Jeesup/svd-safety-l3_swift_remove20

## Resumen

`Jeesup/svd-safety-l3_swift_remove20` es un artefacto de investigación publicado en HuggingFace por el usuario Jeesup. Se trata de un checkpoint de `meta-llama/Llama-2-7b-chat-hf` comprimido con la técnica SVD-LLM, en el que se ha eliminado el 20,00 % de los parámetros densos (fracción de parámetros resultante declarada: 0,8004). El modelo forma parte de una rejilla experimental que cruza distintas reglas de selección de componentes singulares con distintos presupuestos de restauración; esta celda concreta corresponde a la regla `unknown` y a un presupuesto de restauración del 0,000 % (0 componentes restaurados, 0 componentes sustituidos). El objetivo declarado del autor no es ofrecer un asistente conversacional, sino medir cómo la compresión SVD degrada el comportamiento de seguridad de un modelo alineado y qué regla de selección de componentes repara mejor ese daño.

El interés técnico del checkpoint es doble. Por un lado, cuantifica el coste de seguridad de la compresión: la model card reporta una tasa de éxito de ataque (ASR) de 0,0923 en AdvBench y de 0,1438 en StrongREJECT, ambas medidas con el juez HarmBench, junto con una tasa de sobre-rechazo macro de 0,1519 medida con WildGuard y una perplejidad de 14,5046 en WikiText-2. Por otro, sirve como sujeto experimental reproducible (semilla 42) dentro de un estudio más amplio de interpretabilidad y compresión, ya que el autor advierte explícitamente de que varias celdas de la rejilla están degradadas en seguridad de forma deliberada respecto a Llama-2-7b-chat.

A pesar de estar derivado de un modelo de 7B, el repositorio contiene 8.030.261.248 tensores según el recuento real de safetensors y ocupa 16,1 GB. La model card no explica esa diferencia respecto a la reducción declarada al 80 % de los parámetros densos, lo que refuerza su naturaleza de artefacto de investigación más que de modelo listo para producción. El checkpoint no registra descargas ni valoraciones en el momento de la consulta y su licencia es la Llama 2 Community License.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2), checkpoint comprimido mediante SVD-LLM |
| Parametros totales | 8.030.261.248 (recuento real de safetensors); la model card declara una fracción de parámetros resultante de 0,8004 |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 4096 tokens en el modelo base Llama-2-7b-chat; no confirmado explícitamente en la model card de este checkpoint |
| Tipos de cuantizacion | No disponible (no se publican pesos GGUF ni variantes cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería transformers) |

Datos de procedencia declarados en la model card:

| Campo | Valor |
|---|---|
| Modelo base (sin comprimir) | `meta-llama/Llama-2-7b-chat-hf` |
| Método de compresión | SVD-LLM, 20,00 % de parámetros eliminados |
| Regla de selección | `unknown` |
| Presupuesto de restauración | 0,000 % de los parámetros densos |
| Componentes restaurados | 0 |
| Componentes sustituidos | 0 |
| Fracción de parámetros resultante | 0,8004 |
| Semilla | 42 |
| Tamaño del repositorio | 16,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 en su variante de 7B con ajuste conversacional: un transformer decoder-only con normalización RMSNorm previa a cada subcapa, embeddings rotatorios (RoPE), activación SwiGLU en la red feed-forward y atención multi-cabeza. Sobre ese modelo base, este checkpoint aplica compresión SVD-LLM, un método que descompone en valores singulares las matrices de pesos y trunca las componentes de menor rango, con un criterio de truncado que tiene en cuenta el efecto real sobre las activaciones en lugar de limitarse al error de reconstrucción de la matriz.

No hubo entrenamiento adicional ni ajuste fino por parte del autor: el pipeline es compresión de un checkpoint ya existente. Los únicos parámetros variables del experimento son la regla de selección de componentes (`unknown` en esta celda) y el presupuesto de restauración (0,000 %), es decir, esta celda no restaura ninguna componente singular tras la compresión. Se fijó la semilla 42 para permitir la reproducción. La model card no documenta el número de tokens de entrenamiento, la composición del dataset original de Llama 2, ni si hubo RLHF/DPO en la etapa base más allá de lo que ya incorpora Llama-2-7b-chat de fábrica.

La innovación relevante aquí no es arquitectónica sino metodológica: el estudio trata la compresión como una intervención que puede degradar el alineamiento y evalúa si la restauración selectiva de componentes singulares permite recuperar el comportamiento seguro sin volver al tamaño original. Las métricas publicadas actúan como instrumento de medida de ese compromiso entre seguridad y utilidad.

## Capacidades

- Generación de texto y conversación multi-turno heredadas de Llama-2-7b-chat, sujetas a la degradación introducida por la compresión.
- Comprensión y generación de texto en el idioma principal del modelo base (inglés); el resto de idiomas no está documentado en la model card.
- Razonamiento básico y respuesta a instrucciones conversacionales, tal y como se hereda del ajuste de Llama-2-7b-chat.
- No se declara soporte de tool calling ni function calling nativo en la información disponible.
- No se declara soporte de agentes ni de razonamiento multi-paso explícito.
- No se declara ningún modo especial (thinking mode, visión, audio, decodificación especulativa ni ventana de contexto extendida).
- Capacidad de servir como sujeto de experimentación en evaluación de seguridad: el checkpoint está preparado para medirse con AdvBench, StrongREJECT y WildGuard bajo juez HarmBench, según las métricas publicadas.
- Inspección de subespacios singulares para estudios de interpretabilidad y compresión.

## Casos de uso

- Reproducción de experimentos de compresión SVD: usar esta celda concreta (regla `unknown`, presupuesto 0,000 %, semilla 42) como punto de referencia fijo para comparar la perplejidad en WikiText-2 frente a otras celdas de la rejilla y aislar el efecto de la regla de selección.
- Evaluación de seguridad y red-teaming controlado: medir la tasa de éxito de ataque con AdvBench y StrongREJECT y un juez HarmBench para cuantificar cuánto empeora la seguridad de Llama-2-7b-chat tras eliminar el 20 % de los parámetros densos.
- Estudio del sobre-rechazo: emplear la métrica de sobre-rechazo macro de WildGuard (0,1519 en este checkpoint) para analizar si la compresión hace al modelo más permisivo o más conservador en consultas legítimas, comparándolo con el modelo base.
- Análisis de interpretabilidad sobre subespacios singulares: inspeccionar qué componentes singulares se truncan en cada capa y correlacionar su eliminación con cambios medibles en seguridad y perplejidad, para identificar qué matrices concentran el comportamiento de rechazo.
- Banco de pruebas para pipelines de evaluación automatizada: al estar etiquetado como `text-generation-inference` y `endpoints_compatible`, puede desplegarse tras un endpoint compatible con TGI y alimentar un arnés de evaluación tipo lm-evaluation-harness con comparaciones entre celdas.
- Estudio metodológico sobre degradación del alineamiento por compresión: usar el par (ASR, perplejidad) como evidencia empírica de que una pérdida de calidad aparentemente pequeña puede traducirse en un aumento apreciable de la tasa de éxito de ataques.
- Material docente y de divulgación: ilustrar por qué un checkpoint comprimido no debe desplegarse en producción sin una reevaluación de seguridad propia, dado que el autor advierte que varias celdas están degradadas deliberadamente.
- Verificación de integridad de artefactos: comprobar la coherencia entre la fracción de parámetros declarada (0,8004) y el recuento real de tensores del repositorio (8.030.261.248), útil como caso práctico de auditoría de pesos publicados.

## Benchmarks y rendimiento

Estas son las únicas métricas publicadas por el autor en la model card. No se dispone de valores equivalentes para el modelo base ni para otras celdas de la rejilla, por lo que no se puede establecer una comparación directa con esos datos.

| Metrica | Valor | Instrumento de medida |
|---|---|---|
| AdvBench ASR | 0,0923 | Juez HarmBench |
| StrongREJECT ASR | 0,1438 | Juez HarmBench |
| Sobre-rechazo macro | 0,1519 | WildGuard |
| Perplejidad en WikiText-2 | 14,5046 | No especificado en la model card |

No se han publicado resultados de benchmarks de conocimiento o razonamiento (MMLU, GSM8K, HumanEval ni similares) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión de 16 bits: aproximadamente 16 GB solo para pesos (los 16,1 GB del repositorio son coherentes con pesos en fp16). Con caché KV y activaciones, lo razonable es reservar entre 18 y 22 GB para contextos de 4096 tokens.
- GPU profesionales recomendadas: A100 de 40 GB u 80 GB, H100 de 80 GB, L40S de 48 GB. Cualquier GPU con 24 GB o más de memoria puede alojar el modelo.
- GPU de consumo: cabe en una RTX 4090 o RTX 3090 de 24 GB en fp16 con margen ajustado; en GPUs de 16 GB o menos sería necesario recurrir a cuantización de 8 o 4 bits, para la cual no se publican pesos en este repositorio.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio). vLLM es plausible al ser pesos safetensors de Llama 2, pero no está confirmado en la información disponible. No se publican pesos GGUF, por lo que llama.cpp y Ollama requerirían una conversión propia.
- Latencia y throughput: no disponibles. La model card no publica mediciones de velocidad ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Metricas publicadas | Disponibilidad |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l3_swift_remove20` | 8.030.261.248 tensores segun safetensors; fraccion declarada 0,8004 | 4096 tokens en el modelo base | Llama 2 Community License | AdvBench ASR 0,0923; StrongREJECT ASR 0,1438; sobre-rechazo 0,1519; WikiText-2 PPL 14,5046 | Publico en HuggingFace, sin descargas registradas |
| `meta-llama/Llama-2-7b-chat-hf` (modelo base) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Llama 2 Community License | No disponible en la informacion proporcionada | Publico en HuggingFace |
| Otras celdas de la rejilla SVD-LLM del mismo autor | No disponible | No disponible | Llama 2 Community License (presumiblemente) | No disponible | No localizadas en la informacion proporcionada |
| Metodo SVD-LLM de referencia (paper citado en la model card) | No disponible | No disponible | No aplica (metodo) | No disponible | Enlace no incluido en la model card |

No se dispone de datos comparativos suficientes para establecer una jerarquia de rendimiento entre este checkpoint y alternativas de la misma categoria. La comparacion honesta solo puede hacerse contra el modelo base una vez medidas las mismas metricas con el mismo juez, algo que la model card no aporta.

## Limitaciones y advertencias

- Artefacto de investigación, no un asistente desplegable. El propio autor lo describe como una celda de una rejilla experimental y advierte de que varias celdas están degradadas en seguridad de forma deliberada.
- Degradación de seguridad medible: una tasa de éxito de ataque de 0,0923 en AdvBench y de 0,1438 en StrongREJECT implica que una fracción no trivial de peticiones dañinas logra respuesta frente a un modelo alineado sin comprimir.
- Sobre-rechazo del 0,1519 en la métrica macro de WildGuard, lo que indica que la compresión también penaliza la utilidad en consultas legítimas.
- Perplejidad de 14,5046 en WikiText-2, lo que implica degradación de la calidad de modelado del lenguaje respecto al modelo base, aunque no se aporta el valor de referencia.
- Inconsistencia no explicada entre la reducción declarada al 80 % de los parámetros densos y los 8.030.261.248 tensores que reporta safetensors en un repositorio de 16,1 GB. Debe auditarse antes de asumir cualquier ganancia de eficiencia.
- Idiomas soportados no documentados; el modelo base está entrenado predominantemente en inglés, por lo que el rendimiento en castellano no está garantizado ni medido.
- Riesgo de alucinación: no evaluado en la model card. No hay métricas de veracidad, faithfulness ni tasa de alucinación para este checkpoint.
- Sesgos conocidos: no documentados en la información disponible. Se heredan los del modelo base, que tampoco se detallan aquí.
- Formato de pesos limitado a safetensors; no hay GGUF ni cuantizaciones publicadas, lo que complica el despliegue en hardware de consumo.
- Restricciones de licencia: Llama 2 Community License, con las obligaciones habituales de atribución ("Built with Llama"), política de uso aceptable vinculante y cláusula de licencia adicional para despliegues que superen los 700 millones de usuarios mensuales.
- Ausencia total de tracción: cero descargas y cero valoraciones, sin comunidad que haya validado las métricas publicadas.
- Fecha de creación registrada como 2026-09-17, posterior a la fecha habitual de publicación de la familia Llama 2; conviene verificar la procedencia del artefacto antes de integrarlo en cualquier flujo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jeesup/svd-safety-l3_swift_remove20
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia del repositorio: `LICENSE.txt` en https://huggingface.co/Jeesup/svd-safety-l3_swift_remove20/blob/main/LICENSE.txt
- Política de uso: `USE_POLICY.md` en https://huggingface.co/Jeesup/svd-safety-l3_swift_remove20/blob/main/USE_POLICY.md
- Paper de Llama 2: https://arxiv.org/abs/2307.09288
- Paper del método SVD-LLM: citado en la model card pero sin enlace incluido en la información proporcionada; consultar la referencia del método en la documentación original del autor del estudio.
- Repositorio, demo o blog adicionales del autor: no disponibles en la información proporcionada.
