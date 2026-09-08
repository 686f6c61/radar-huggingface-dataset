# medismera/Qwen3.8-27B-Surgical-Abliterated

## Resumen

`medismera/Qwen3.8-27B-Surgical-Abliterated` es una variante del modelo `Qwen/Qwen3.8-27B-FP8` de Alibaba Cloud, modificada mediante técnicas de *representation engineering* para eliminar las respuestas de rechazo (*refusal*) en consultas relacionadas con ciberseguridad y pentesting. El autor, `medismera`, aplica un método de "abliteración quirúrgica" que, según la documentación, reduce la tasa de rechazo al 0,00 % sin deteriorar la capacidad de razonamiento ni la coherencia del modelo. El modelo se distribuye en FP8 (`float8_e4m3fn`) y mantiene la licencia Apache-2.0 del modelo base.

La arquitectura subyacente es un modelo híbrido con atención lineal, tal como se describe en la *model card* del autor. El modelo tiene aproximadamente 27.780 millones de parámetros. La longitud de contexto no se especifica explícitamente en la información disponible; el comando de despliegue de ejemplo configura 8192 tokens. El modelo está orientado a tareas de generación de texto y conversación, con soporte de idiomas inglés, árabe y chino.

La relevancia de este modelo radica en su enfoque de modificación selectiva: en lugar de aplicar una resta de pesos global que rompe el modelo, se proyectan únicamente las matrices `mlp.down_proj` en una banda concreta de capas, preservando la geometría del espacio latente. Esto lo convierte en un caso de estudio para la ingeniería de representaciones aplicada a modelos de seguridad ofensiva, aunque su uso debe restringirse a entornos autorizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida con atención lineal (según el autor del modelo) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada; el ejemplo de despliegue usa 8192 tokens |
| Tipos de cuantizacion | FP8 (`float8_e4m3fn`) |
| Idiomas soportados | Inglés, árabe y chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.8-27B-FP8`, que según la *model card* del autor emplea una arquitectura híbrida con atención lineal. Sobre esta base se aplica un procedimiento de ablación quirúrgica de rechazo. El método, descrito como "Rank-1 Orthogonal Complement Projections", consiste en calcular un vector director del rechazo mediante la diferencia entre las activaciones medias de respuestas de rechazo y respuestas benignas en el flujo residual de las 64 capas. Este vector se proyecta de forma ortogonal sobre las matrices `mlp.down_proj` de la banda activa de deliberación del rechazo, dejando intactas las capas 0 a 16 y las capas superiores.

La proyección se realiza en precisión FP32 sobre bloques des-cuantizados de 128×128, y posteriormente se re-cuantiza a `float8_e4m3fn` con escalas actualizadas. El autor indica que se conservan 5.119 de las 5.120 dimensiones del estado oculto, lo que supone una fidelidad geométrica del 99,98 %. No se especifica el tamaño ni la composición del dataset de entrenamiento original del modelo base, ni si se aplicaron técnicas de RLHF o DPO en la modificación. La técnica se basa en el trabajo de Arditi et al. (2024) sobre *representation engineering*.

## Capacidades

- Generación de texto conversacional en inglés, árabe y chino, con fluidez mantenida según la evaluación del autor.
- Razonamiento y pensamiento paso a paso dentro de etiquetas `think` y cierre correcto con ``, sin bucles infinitos.
- Soporte de modo de pensamiento activable o desactivable mediante `chat_template_kwargs={"enable_thinking": False}`.
- Generación de código y lógica: el autor reporta retención del 100 % en tareas como *Two Sum* y SSTI.
- Tool calling / function calling: el comando de despliegue incluye el parser `qwen3_coder`, lo que indica soporte para llamadas a herramientas.
- Capacidades multilingües: inglés, árabe y chino.
- Especialización en ciberseguridad y pentesting: el modelo está diseñado para responder a consultas de seguridad ofensiva sin rechazo.
- API compatible con OpenAI para integración en agentes y pipelines.

## Casos de uso

- Pentesting autorizado: el modelo puede generar payloads, scripts de explotación y comandos de prueba en entornos controlados, donde la ausencia de rechazo acelera el flujo de trabajo. Es adecuado porque la ablación quirúrgica mantiene la capacidad de razonamiento necesaria para adaptar los exploits al objetivo.
- Análisis de malware: permite obtener explicaciones técnicas sobre muestras de código malicioso, ofuscación o técnicas de evasión sin las negativas habituales. El modelo conserva la capacidad de razonamiento y generación de código para desglosar el comportamiento del binario.
- Automatización de respuesta a incidentes: en un pipeline de SOAR, el modelo puede generar comandos de mitigación, consultas a SIEM o scripts de análisis a partir de descripciones de incidentes, gracias a su soporte de tool calling y su bajo índice de rechazo.
- Educación en ciberseguridad: sirve para crear material didáctico sobre vulnerabilidades, técnicas de ataque y defensa, ya que responde a preguntas que otros modelos rechazan. La capacidad multilingüe permite generar contenido en inglés, árabe y chino.
- Desarrollo de herramientas ofensivas: asistencia en la escritura de exploits, fuzzing o frameworks de pentesting. El modelo mantiene la lógica y la generación de código, y el modo de pensamiento ayuda a estructurar pasos complejos.
- Investigación en seguridad de aplicaciones: análisis de código vulnerable (por ejemplo, SSTI, inyección SQL) y propuesta de parches. El modelo puede razonar sobre el flujo de datos y generar código corregido.
- Agentes autónomos con tool calling: integración en asistentes que necesitan ejecutar herramientas de seguridad, consultar bases de conocimiento o interactuar con APIs. La API compatible con OpenAI y el parser `qwen3_coder` facilitan el despliegue en frameworks de agentes.

## Benchmarks y rendimiento

La *model card* proporciona una tabla comparativa entre el modelo base, una abliteración ingenua (denominada `OBLITERATUS`) y el modelo quirúrgico. Los datos provienen del autor, bajo parámetros de muestreo por defecto (`temperature: 0.6`, `repetition_penalty: 1.0`, `presence_penalty: 0.0`). No se han verificado de forma independiente.

| Metrica | Base (`Qwen3.8-27B-FP8`) | Abliteracion ingenua (`OBLITERATUS`) | Abliteracion quirurgica (este modelo) |
| :--- | :---: | :---: | :---: |
| Tasa de rechazo (ciberseguridad / pentest) | 100,0 % | ~0,0 % | 0,00 % |
| Retencion de razonamiento (`think` depth) | 100,0 % | Roto (bucles infinitos) | 100,0 % |
| Cierre de `` | Limpio | Roto (bucles `Bombur`) | Limpio (0 bucles) |
| Retencion de codigo y logica (Two Sum / SSTI) | 100,0 % | Volcado de diccionario | 100,0 % |
| Soporte multilingue (arabe / ingles) | Rechazado | Roto | Fluidez completa |

Existe un análisis externo publicado en `nathan.sapwell.net` que evalúa ocho variantes abliteradas del mismo modelo base, incluida esta. No se han extraído datos numéricos de ese análisis para esta ficha porque no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 30,9 GB. Con los pesos en FP8, la inferencia requiere aproximadamente 28 GB de VRAM solo para los pesos, más el *KV cache* y el *overhead* del runtime. El autor recomienda una NVIDIA RTX 5090 de 32 GB para ejecutar el modelo con SGLang y una longitud de contexto de 8192 tokens.
- GPU recomendadas: RTX 5090 (32 GB), A100, L40S, o 2× RTX 4090/3090 en paralelo, según el script de despliegue incluido en el repositorio.
- Compatibilidad con GPU de consumo: sí, con una RTX 5090 de 32 GB. En GPUs de 24 GB como la RTX 4090, se necesitaría ejecutar en paralelo o reducir la longitud de contexto y el número de peticiones concurrentes.
- Opciones de despliegue: SGLang es el framework recomendado por el autor. El repositorio incluye un script `deploy_and_serve.sh` que instala dependencias, descarga el modelo y lanza un servidor OpenAI-compatible en el puerto 18000 con *KV cache* en FP8.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
| :--- | :---: | :---: | :---: | :--- |
| `Qwen/Qwen3.8-27B-FP8` (base) | 27.781.427.952 | No especificado | Apache-2.0 | Modelo original, con rechazo del 100 % en consultas de seguridad |
| `medismera/Qwen3.8-27B-Surgical-Abliterated` | 27.781.427.952 | No especificado | Apache-2.0 | Variante quirúrgica, 0 % de rechazo, razonamiento intacto |
| `huihui-ai/Huihui-Qwen3.8-27B-abliterated` | No disponible | No disponible | No disponible | Variante abliterada alternativa del mismo base; sin datos técnicos en la información disponible |

La tabla de la *model card* también compara el modelo con una abliteración ingenua (`OBLITERATUS`), que presenta bucles infinitos y pérdida de capacidades. No se dispone de especificaciones detalladas de otras variantes abliteradas del mismo modelo base.

## Limitaciones y advertencias

- Sesgos: no se han evaluado ni documentado sesgos específicos de este modelo.
- Riesgo de alucinación: no se han publicado evaluaciones de alucinación; el modelo puede generar contenido falso o técnicamente incorrecto, especialmente en dominios de seguridad.
- Limitaciones de idioma: solo se soportan inglés, árabe y chino. El rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el uso malintencionado del modelo (por ejemplo, ataques reales) queda fuera del alcance de la licencia y puede ser ilegal.
- Caveat de producción: el 0,00 % de tasa de rechazo se reporta en evaluaciones específicas del autor; no garantiza que el modelo nunca se niegue en todos los contextos. La ablación quirúrgica podría tener efectos no evaluados en tareas fuera de ciberseguridad.
- La fecha de creación del modelo (2026-09-07) es posterior a la fecha actual; esto sugiere que la información puede ser experimental o no verificada por la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/medismera/Qwen3.8-27B-Surgical-Abliterated
- Análisis independiente de variantes abliteradas: https://nathan.sapwell.net/posts/qwen38-27b-abliteration/
- Referencia técnica: Representation Engineering (Arditi et al., 2024)
