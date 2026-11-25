# KC-Informatics/Raven-27B

## Resumen

Raven-27B es un ajuste del modelo Qwen 3.8 27B en formato FP8 publicado por KC-Informatics. No se trata de un reentrenamiento, sino de una modificación de pesos mediante una técnica denominada Null-Space Refusal Surgery (NS-UNREFUSE-v2), que proyecta selectivamente ciertas direcciones de activación para eliminar las respuestas de rechazo estereotipadas del modelo base. El objetivo declarado es conservar la capacidad de razonamiento, la fidelidad en instrucciones y la honestidad epistémica (admitir "no lo sé") mientras se reduce la tasa de negativas ante peticiones que el modelo original rechazaría por política.

El modelo hereda la arquitectura y el tamaño del Qwen 3.8 27B: 27 mil millones de parámetros en un transformer con atención lineal y atención completa combinadas, y una ventana de contexto declarada de hasta 131.072 tokens en la configuración de despliegue. Se distribuye en pesos FP8 de 30,9 GB, con una variante AWQ de 4 bits de 18,2 GiB publicada aparte. La licencia es Apache 2.0, igual que el modelo base.

Su relevancia es doble: por un lado, documenta una metodología de eliminación de rechazos más quirúrgica que la ablación por capas habitual; por otro, incluye resultados verificados con un protocolo determinista y pruebas pareadas (McNemar) frente al base, además de compatibilidad con decodificación especulativa DFlash2. Todo ello lo hace interesante para quienes evalúan técnicas de modificación de comportamiento sin reentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen 3.8 con atención completa y atención lineal (híbrida); 64 capas |
| Parametros totales | 27 mil millones (heredados del base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 131.072 tokens (configuración de despliegue indicada; valor nativo del base no confirmado) |
| Tipos de cuantizacion | FP8 (build principal, 30,9 GB); AWQ 4 bits (variante Raven-27B-AWQ, 18,2 GiB) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato de Hugging Face; FP8 y AWQ) |

## Arquitectura y entrenamiento

Raven-27B no se entrena: se obtiene modificando los pesos del Qwen 3.8 27B FP8. La técnica NS-UNREFUSE-v2 actúa sobre las capas 24 a 58 de un total de 64, dejando intactas las capas iniciales (0-23) y finales (59-63) para preservar coherencia, gramática y alineación con el modelo borrador de decodificación especulativa. Se editan 68 proyecciones de salida: 8 matrices de salida de atención, 26 de atención lineal y 34 de down-proyección de MLP. Los pesos de visión y audio no se tocan.

El procedimiento incluye tres mecanismos: (1) protección epistémica con gamma_ep = 0,50, que ortogonaliza dos direcciones de rechazo de política contra la dirección de incertidumbre epistémica antes de eliminarlas, de modo que el modelo sigue admitiendo preguntas sin respuesta; (2) amortiguación de la variedad harmless con gamma_clean = 0,10 y rango 16; y (3) preservación de la norma L2 de cada fila editada, lo que evita la deriva de activaciones sin necesidad de reentrenamiento. El resultado se declara compatible con decodificación especulativa DFlash2 (modelo borrador de nace-ai).

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de razonamiento (reasoning parser qwen3) y cadenas de pensamiento extensas.
- Generación de código, con soporte de tool calling y function calling mediante el parser qwen3_coder.
- Reducción de rechazos de política: responde a peticiones que el modelo base rechazaría por defecto (8 de 12 en la sonda JBB de 12 ítems, frente a 2 de 12 del base).
- Honestidad epistémica preservada: 8 de 8 preguntas trampa sin respuesta real superadas en la evaluación del autor.
- Compatibilidad con decodificación especulativa DFlash2 para acelerar la inferencia.
- Capacidades multimodales heredadas del base (pesos de visión y audio intactos), aunque la model card no detalla su alcance funcional.
- Soporte de despliegue en vLLM y SGLang según las etiquetas del repositorio.
- Idiomas: inglés declarado; no se documentan otras lenguas.

## Casos de uso

- Evaluación de técnicas de modificación de comportamiento: permite comparar NS-UNREFUSE-v2 frente a abliteración clásica midiendo deriva en razonamiento y código con el mismo modelo base, gracias a los resultados pareados publicados.
- Generación de código en producción: el soporte de tool calling con parser qwen3_coder y la compatibilidad con decodificación especulativa DFlash2 (hasta 220 tok/s en código según el autor) lo hacen apto para asistentes de programación integrados en pipelines de CI/CD.
- Investigación sobre seguridad y alineación: sirve para estudiar qué direcciones de activación codifican el rechazo y cómo se relacionan con la incertidumbre epistémica, con un protocolo de evaluación reproducible de 180 preguntas.
- Despliegue en una sola GPU de 24-40 GB: la variante AWQ de 4 bits (18,2 GiB) permite servir el modelo con DFlash2 en hardware de consumo profesional, útil para prototipos y entornos de desarrollo.
- Atención al cliente y asistentes conversacionales multi-turno: la ventana de 131.072 tokens permite mantener contexto largo en conversaciones y documentos extensos, aunque el soporte declarado se limita al inglés.
- Servicio de inferencia de alto rendimiento: con 8 flujos concurrentes y DFlash2 el autor reporta 1.008 tok/s en la variante AWQ, adecuado para backends con vLLM o SGLang.
- Redacción y análisis de contenido sin fricción por negativas: útil en dominios donde el modelo base rechaza sistemáticamente temas sensibles legítimos (ficción, seguridad, análisis de riesgos), siempre bajo responsabilidad del despliegador.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto público AA-PUBLIC-180 (N=1, calificación determinista):

| Metrica | Qwen 3.8 27B FP8 (base) | Raven-27B (FP8) | Raven-27B-AWQ (4 bits) |
|---|---:|---:|---:|
| Suite pública de 180 preguntas (N=1, 0 errores) | 124/180 (68,89 %) | 146/180 (79,79 %) | 145/180 (78,96 %) |
| McNemar pareado vs base FP8 | referencia | p < 0,0001 (24 ganadas, 2 perdidas) | p = 1,000 vs Raven FP8 |
| Peticiones rechazadas respondidas (sonda JBB, 12 ítems) | 2/12 | rechazo reducido | 8/12 (66,7 %) |
| Preguntas trampa sin respuesta superadas | 8/8 | 8/8 | 8/8 (100 %) |
| Tamano de descarga | 30,9 GB | 30,9 GB | 18,2 GiB |
| Decodificación mono-flujo con DFlash2 (RTX PRO 6000) | 92 tok/s (143 en código) | igual que FP8 | 141 tok/s (220 tok/s en código) |
| Decodificación concurrente de 8 flujos con DFlash2 | 927 tok/s | igual que FP8 | 1.008 tok/s |

El autor atribuye la mejora en la suite al acortamiento de cadenas de pensamiento desbocadas (27 topes de longitud frente a 45 en el base FP8), no a un entrenamiento orientado a benchmarks. No se publican resultados en MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM para FP8: aproximadamente 31 GB de pesos más overhead de activaciones y caché KV; el autor recomienda GPU de 48 GB o más con DFlash2.
- VRAM para AWQ 4 bits: 18,2 GiB de pesos; cabe en GPU de 24-40 GB según el autor.
- GPU recomendadas: RTX PRO 6000 (usada en las mediciones), A100 80 GB, H100 80 GB para FP8; RTX 4090 (24 GB) o RTX A6000 (48 GB) para la variante AWQ.
- Cabe en GPU de consumo: sí, la variante AWQ en tarjetas de 24 GB o más; la FP8 requiere al menos 40-48 GB.
- Opciones de despliegue: vLLM (comando documentado con speculative-config DFlash2), SGLang (etiqueta del repositorio) y transformers como librería base.
- Throughput estimado: 92 tok/s mono-flujo en FP8 y 141 tok/s en AWQ (220 tok/s en código) con DFlash2 en RTX PRO 6000; 927 y 1.008 tok/s respectivamente con 8 flujos concurrentes.
- Se incluye nudge.py, un proxy opcional que fuerza el cierre de cadenas de razonamiento largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Raven-27B (este) | 27B | 131.072 tokens (config. de despliegue) | Apache 2.0 | Eliminación quirúrgica de rechazos con protección epistémica; FP8 y AWQ |
| Qwen 3.8 27B (base) | 27B | 131.072 tokens (config. de despliegue) | Apache 2.0 | Referencia directa; 68,89 % en AA-PUBLIC-180 y 2/12 en sonda JBB |
| Raven-27B-AWQ | 27B | 131.072 tokens (config. de despliegue) | Apache 2.0 | Misma técnica en 4 bits; 18,2 GiB, 141 tok/s mono-flujo |
| Abliteraciones comunitarias de Qwen 3.8 27B | 27B | no disponible | variable | El autor las describe como más permisivas pero con mayor deriva al editar capas tempranas; sin datos verificados en la información disponible |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoría (por ejemplo, Llama o Mistral de tamaño similar) en la información proporcionada.

## Limitaciones y advertencias

- La reducción de rechazos traslada la responsabilidad del contenido generado al despliegador; el autor lo advierte explícitamente.
- No es la abliteración más permisiva posible: prioriza preservar inteligencia y honestidad epistémica frente a máxima permisividad, por lo que algunos prompts límite seguirán siendo rechazados.
- Riesgo de alucinación inherente al modelo base; la honestidad epistémica se evalúa solo con 8 preguntas trampa, una muestra pequeña.
- Idiomas: únicamente inglés declarado; no hay evidencia de rendimiento en castellano ni en otras lenguas.
- Los benchmarks publicados son del propio autor, con N=1 y una suite de 180 preguntas no estandarizada; no sustituyen a evaluaciones independientes.
- El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.
- La compatibilidad con decodificación especulativa depende de un modelo borrador externo (nace-ai/Qwen3.8-27B-DFlash2-Kapitsa) y de ejecutar con --trust-remote-code.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base Qwen y del borrador DFlash2.
- El tamaño del repo figura como 0.0 GB en Hugging Face, lo que puede indicar pesos no alojados en el repositorio o un problema de publicación; conviene verificar antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KC-Informatics/Raven-27B
- Variante AWQ 4 bits: https://huggingface.co/KC-Informatics/Raven-27B-AWQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base en FP8: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Modelo borrador DFlash2: https://huggingface.co/nace-ai/Qwen3.8-27B-DFlash2-Kapitsa
