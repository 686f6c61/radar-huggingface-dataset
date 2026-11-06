# Alibaba-AAIG/PGuard

## Resumen

PGuard es una familia de cabezales de seguridad (guardrails) desarrollada por Alibaba AAIG que se acoplan a un modelo base congelado para realizar deteccion de riesgo a nivel de token. A diferencia de los clasificadores de seguridad convencionales, PGuard no modifica la ruta de inferencia ni el comportamiento generativo del backbone: aprovecha las representaciones intermedias del modelo base para puntuar la seguridad de cada token, tanto en la consulta del usuario como en la respuesta generada, en modo streaming.

Esta version inicial publica checkpoints para tres backbones de la familia Qwen3.5 (9B denso, 35B-A3B y 122B-A10B, estos dos ultimos con arquitectura MoE) y tres variantes de cabezal (Lasttok, EMA y GRU), cubriendo monitorizacion de seguridad tanto de texto como multimodal (imagen-texto). La propuesta es relevante porque permite integrar gobernanza de contenido directamente en el pipeline de generacion sin duplicar el coste de un segundo modelo evaluador.

El modelo se distribuye bajo licencia Apache 2.0 y el repositorio ocupa 3,1 GB. No se han publicado datos sobre idiomas soportados, longitud de contexto ni formato de pesos mas alla de lo indicado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezales de clasificacion de tokens sobre backbone transformer congelado (Qwen3.5); variantes Lasttok (clasificacion de token sin estado), EMA (atencion causal multi-escala) y GRU (resumen de prompt y modelado recurrente de respuesta) |
| Parametros totales | No disponible (depende del backbone: 9B, 35B-A3B y 122B-A10B) |
| Parametros activos | No disponible (los backbones 35B-A3B y 122B-A10B son MoE, pero no se detalla el reparto exacto) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

PGuard se construye sobre un backbone congelado (Qwen3.5 en variantes 9B, 35B-A3B y 122B-A10B) y anade cabezales ligeros de deteccion de seguridad que consumen las representaciones intermedias del modelo base. Existen tres disenos de cabezal: Lasttok, que realiza clasificacion de tokens sin estado; EMA, que aplica una atencion causal multi-escala sobre las representaciones; y GRU, que resume el prompt y modela la respuesta de forma recurrente. Esta separacion permite elegir el compromiso entre coste computacional y precision segun el caso de uso.

El backbone no se modifica ni se reentrena, de modo que la generacion del modelo base conserva su comportamiento original y PGuard actua como una capa de monitorizacion paralela. La model card no detalla el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO para los cabezales. Tampoco se especifican innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Deteccion de seguridad a nivel de token en consultas y respuestas, en modo streaming.
- Monitorizacion multimodal (entrada imagen-texto) en los tres backbones publicados.
- Tres variantes de cabezal con distintos compromisos de modelado temporal: Lasttok, EMA y GRU.
- Integracion con SGLang para servir PGuard junto al backbone y devolver puntuaciones de riesgo por token generado.
- Clasificacion en nueve dimensiones de riesgo: delitos y actividades ilegales, discurso de odio, salud fisica y mental, etica y moral, privacidad de datos, ciberseguridad, extremismo, sugerencias inapropiadas (finanzas, medicina, derecho) y riesgos que afectan a menores.
- Entrenamiento e inferencia offline documentados en el repositorio de GitHub.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling ni agentes, ya que PGuard es un componente de seguridad y no un modelo generativo por si mismo.

## Casos de uso

- Moderacion de chat en produccion: PGuard puntua cada token de la respuesta mientras el backbone genera, lo que permite cortar una generacion insegura en streaming sin esperar a que termine la respuesta completa.
- Filtrado de prompts de entrada: el cabezal Lasttok clasifica la consulta del usuario antes de la generacion, rechazando peticiones que caen en categorias como armas peligrosas, phishing o abuso de menores.
- Moderacion de contenido multimodal: en aplicaciones con entrada de imagen y texto, la variante multimodal evalua consultas y respuestas que combinan ambos modos, cubriendo casos que un clasificador solo de texto no detectaria.
- Cumplimiento normativo y auditoria: las nueve dimensiones de riesgo predefinidas permiten mapear las puntuaciones a politicas internas de gobernanza y generar registros auditables por categoria.
- Asistentes en dominios regulados: la dimension de sugerencias inapropiadas en finanzas, medicina y derecho permite marcar respuestas que constituyan asesoramiento no autorizado.
- Proteccion de menores en plataformas educativas o sociales: la dimension especifica de riesgos que afectan a menores (corrupcion, abuso y explotacion, delincuencia) permite activar politicas mas estrictas en esos entornos.
- Despliegue en infraestructuras existentes: gracias a la integracion con SGLang y al uso de un backbone congelado, PGuard puede anadirse a un servicio Qwen3.5 ya desplegado sin reentrenar ni sustituir el modelo generativo.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a los checkpoints sobre Qwen3.5-9B, con puntuaciones por dimension (consultas y respuestas, texto y multimodal):

| Cabezal | Consultas texto | Respuestas texto | Consultas multimodales | Respuestas multimodales |
|---|---:|---:|---:|---:|
| PGuard-Lasttok-Qwen3.5-9B | 0,822 | 0,795 | 0,635 | 0,644 |
| PGuard-EMA-Qwen3.5-9B | 0,836 | 0,833 | 0,741 | 0,772 |
| PGuard-GRU-Qwen3.5-9B | 0,836 | 0,860 | 0,735 | 0,798 |

No se han publicado resultados para los backbones de 35B-A3B ni 122B-A10B, ni comparaciones con modelos de referencia en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 3,1 GB, pero el coste real de inferencia depende del backbone Qwen3.5 asociado (9B, 35B-A3B o 122B-A10B).
- Para el backbone de 9B en precision completa se estiman del orden de 18-20 GB de VRAM solo para pesos, mas el coste de activaciones y cache KV; con cuantizacion de 8 bits o 4 bits podria caber en GPUs de consumo con 24 GB (RTX 4090) o 16 GB segun la cuantizacion, aunque no se han publicado cifras oficiales.
- Los backbones MoE de 35B-A3B y 122B-A10B requieren GPUs de centro de datos (A100, H100) o configuraciones multi-GPU; no se dispone de estimaciones oficiales de VRAM.
- Opciones de despliegue documentadas: SGLang (variantes `stateless`, `seq` y `cfc` segun cabezal) e inferencia offline mediante el repositorio de entrenamiento.
- No se han publicado datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros guardrails ni con clasificadores de seguridad alternativos.

## Limitaciones y advertencias

- La propia model card advierte de posibles falsos positivos y falsos negativos; las puntuaciones no deben tratarse como decisiones definitivas sin revision humana en casos criticos.
- No se documentan sesgos conocidos ni cobertura linguistica; se desconoce el comportamiento fuera de los idiomas presentes en los datos de entrenamiento.
- Los benchmarks publicados solo cubren el backbone de 9B; el rendimiento de las variantes 35B-A3B y 122B-A10B no esta cuantificado.
- El rendimiento multimodal es notablemente inferior al de texto en todos los cabezales (por ejemplo, 0,635 frente a 0,822 en Lasttok), lo que limita su fiabilidad en escenarios imagen-texto.
- PGuard depende de un backbone Qwen3.5 concreto: no es un modelo autonomo y requiere desplegar y mantener el modelo base junto a los cabezales.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable del cumplimiento normativo y del comportamiento derivado, segun el descargo de responsabilidad del autor.
- No se especifican la longitud de contexto soportada ni el formato de pesos, lo que complica planificar integraciones sin consultar el repositorio de GitHub.

## Enlaces

- Hugging Face: https://huggingface.co/Alibaba-AAIG/PGuard
- Repositorio GitHub: https://github.com/Alibaba-AAIG/PGuard
- Entrenamiento e inferencia offline: https://github.com/Alibaba-AAIG/PGuard/blob/main/train/README.md
- Despliegue con SGLang: https://github.com/Alibaba-AAIG/PGuard/blob/main/deploy/README.md
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
