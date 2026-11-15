# Rise-again/school-AI-helper

## Resumen

school-AI-helper es un ajuste fino (fine-tune) del modelo Qwen/Qwen2.5-7B-Instruct, publicado en Hugging Face por el usuario Rise-again bajo licencia MIT. El modelo conserva la arquitectura del modelo base de Qwen (familia Qwen2.5, transformer decoder-only de 7.000 millones de parametros) y se presenta explicitamente como un modelo de idioma chino (`zh`), lo que sugiere que el ajuste fino se ha orientado hacia el dominio educativo en ese idioma, a juzgar por su nombre ("school AI helper", asistente escolar de IA).

La relevancia de esta ficha es limitada: se trata de una publicacion de autor individual, sin descargas ni interacciones registradas en el momento de la consulta, sin model card sustantiva (el README solo repite los metadatos de licencia, idioma y modelo base) y sin datos publicados de benchmarks, dataset de entrenamiento o hiperparametros. Cualquier evaluacion de calidad debe, por tanto, apoyarse en las caracteristicas conocidas del modelo base Qwen2.5-7B-Instruct y en pruebas empiricas propias.

Para desarrolladores e investigadores, este modelo es util como punto de partida para experimentar con ajustes finos de bajo coste sobre Qwen2.5 en contextos educativos en chino, pero no debe considerarse un artefacto listo para produccion sin una evaluacion previa exhaustiva, dado que no hay evidencia publicada sobre su comportamiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct; no detallada en la model card) |
| Parametros totales | 7.000 millones (aproximado, segun el modelo base Qwen2.5-7B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen2.5-7B-Instruct soporta hasta 131.072 tokens |
| Tipos de cuantizacion | no disponible en la model card; el modelo base admite cuantizaciones estandar (GGUF, GPTQ, AWQ) mediante herramientas de terceros |
| Idiomas soportados | zh (chino) |
| Licencia | MIT |
| Formato de pesos | no disponible (la model card no especifica; se asume safetensors por convencion de Hugging Face, pero no esta confirmado) |

## Arquitectura y entrenamiento

La model card no proporciona informacion sobre la arquitectura interna, el proceso de entrenamiento, el volumen de datos utilizados, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o SFT especificas. Lo unico documentado es que se trata de un fine-tune del modelo Qwen/Qwen2.5-7B-Instruct, un transformer decoder-only de 7.000 millones de parametros desarrollado por Alibaba Qwen, con atencion por ventanas deslizantes y soporte de contexto largo en su version original.

No hay datos sobre el dataset de ajuste fino, el numero de tokens de entrenamiento, la mezcla de datos educativos o la posible inclusion de datos sinteticos. Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) mas alla de las que ya incorpora el modelo base. Esta ausencia de informacion impide reproducir el entrenamiento o auditar su calidad.

## Capacidades

- Generacion de texto en chino, con las capacidades heredadas del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y respuesta a preguntas, presumiblemente orientado a contextos educativos por el nombre del modelo, aunque no hay evidencia documentada.
- Generacion de codigo y matematicas: capacidades del modelo base, no verificadas en este fine-tune.
- Soporte de tool calling / function calling: heredado del modelo base Qwen2.5-7B-Instruct, no confirmado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: la model card declara unicamente `zh`; no se garantiza el rendimiento en otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no documentadas; el modelo base no incluye vision ni audio.

## Casos de uso

- Asistencia educativa en chino: el modelo puede emplearse como tutor conversacional para resolver dudas escolares en chino, aprovechando el ajuste fino orientado al dominio educativo y el contexto largo del modelo base.
- Generacion de material didactico: produccion de ejercicios, resumenes y explicaciones en chino para plataformas de aprendizaje, con revision humana obligatoria dada la ausencia de benchmarks.
- Prototipado rapido de chatbots educativos: despliegue en entornos de prueba para validar la utilidad del ajuste fino antes de invertir en infraestructura.
- Investigacion sobre fine-tuning de subconjuntos: uso como caso de estudio para analizar como un ajuste fino ligero sobre Qwen2.5-7B-Instruct afecta al comportamiento en dominios especializados.
- Evaluacion comparativa de ajustes finos comunitarios: comparacion empirica frente al modelo base para medir la ganancia (o perdida) de calidad en tareas educativas en chino.
- Traduccion y reformulacion de contenido escolar: apoyo a docentes para adaptar textos en chino a distintos niveles de dificultad, con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; para un modelo de 7.000 millones de parametros, las estimaciones habituales son aproximadamente 14-16 GB en FP16/BF16, 8-10 GB en cuantizacion de 8 bits y 4-6 GB en cuantizacion de 4 bits.
- GPU recomendadas: no documentadas; por tamano, cabria esperar A100, H100, L40S o RTX 4090 para FP16, y GPUs consumer con 8-12 GB para cuantizaciones de 4-8 bits.
- Compatibilidad con GPU consumer: probable en RTX 3060/4060 Ti (12-16 GB) y superiores con cuantizacion, aunque no confirmado por el autor.
- Opciones de despliegue: vLLM, llama.cpp, Ollama y TGI son opciones plausibles para el modelo base, pero no estan documentadas para este fine-tune concreto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Rise-again/school-AI-helper | ~7.000 M | no disponible (base: 131.072) | MIT | Hugging Face (0 descargas) | Fine-tune comunitario sin benchmarks |
| Qwen/Qwen2.5-7B-Instruct | 7.000 M | 131.072 tokens | Apache 2.0 (modelo base) | Hugging Face, ampliamente usado | Modelo base de referencia, con benchmarks publicados |
| Qwen/Qwen2.5-1.5B-Instruct | 1.500 M | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa mas ligera para hardware limitado |
| Mistral-7B-Instruct | 7.000 M | 32.768 tokens | Apache 2.0 | Hugging Face | Alternativa de tamano similar, centrada en ingles |

## Limitaciones y advertencias

- Ausencia total de documentacion sobre el dataset de entrenamiento, hiperparametros y evaluacion: no es posible verificar la calidad ni la reproducibilidad del ajuste fino.
- Riesgo elevado de alucinacion en contenidos educativos: sin benchmarks ni evaluacion publicada, no hay garantia de precision en matematicas, historia o ciencias.
- Sesgos desconocidos: al no documentarse la composicion de los datos de ajuste fino, no se pueden identificar sesgos especificos.
- Cobertura idiomatica limitada: la model card declara solo `zh`; el rendimiento en castellano u otros idiomas no esta garantizado.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar tambien las condiciones del modelo base Qwen2.5-7B-Instruct (Apache 2.0) al redistribuir.
- Sin descargas ni validacion comunitaria: no hay evidencia de que el modelo haya sido probado por terceros, lo que aumenta el riesgo en produccion.
- Contexto maximo no confirmado para este fine-tune: aunque el modelo base soporta 131.072 tokens, el ajuste fino podria haber alterado ese comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rise-again/school-AI-helper
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
