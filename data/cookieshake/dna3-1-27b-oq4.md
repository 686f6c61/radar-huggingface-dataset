# cookieshake/DNA3.1-27B-oQ4

## Resumen

DNA3.1-27B-oQ4 es una cuantización de 4 bits del modelo `dnotitia/DNA3.1-27B`, publicada por el usuario cookieshake en Hugging Face. No se trata de un modelo nuevo, sino de una conversión del snapshot BF16 original al formato oMLX (oQ) para su ejecución en Apple Silicon mediante el runtime MLX. El modelo base pertenece a la familia Qwen3.5, según la etiqueta `qwen3_5` del repositorio, y cuenta con 27.356.728.560 parámetros.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 27B en hardware de Apple con un peso de repositorio de 17,2 GB, gracias a una cuantización mixta que combina precisión base de 4 bits con 243 tensores sobrescritos a mayor precisión (235 a 5 bits, 4 a 6 bits y 4 a 8 bits). El resultado es un tamaño efectivo de aproximadamente 5,0281 bits por parámetro.

La información disponible sobre el modelo base es limitada: no se detallan la longitud de contexto, los datos de entrenamiento ni los benchmarks. La model card del autor de la cuantización se limita a documentar la procedencia, el método de conversión y unas pruebas de humo muy acotadas en coreano, sin evaluación amplia de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun tag `qwen3_5`); detalles no disponibles |
| Parametros totales | 27.356.728.560 (27,36B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ 4-bit con grupo 64 y cuantizacion afín; 243 overrides de precision mixta (235 a 5 bits, 4 a 6 bits, 4 a 8 bits); ~5,0281 bits efectivos por parametro |
| Idiomas soportados | no disponible en la informacion del repositorio; la model card incluye pruebas en coreano y el tag `korean` sugiere soporte de ese idioma |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (4 shards, 2.180 entradas en el indice), compatible con MLX |

## Arquitectura y entrenamiento

El modelo base es `dnotitia/DNA3.1-27B`, del que no se proporcionan detalles sobre arquitectura interna, composicion del dataset, numero de tokens de entrenamiento ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El tag `qwen3_5` indica que pertenece a la familia Qwen3.5, pero no se confirma en la informacion disponible ninguna innovacion tecnica concreta (atencion lineal, decodificacion especulativa, MoE, etc.).

La cuantizacion se realizo con oMLX 0.7.3 en modo oQ estándar, con `oq_level=4`, `enhanced=false`, tamaño de grupo 64 y cuantizacion afín. Se partio directamente del snapshot BF16 fijado en la revision `aee853444ef2d1d1fe2fa56e4c2073d8f393b139`, no de otro derivado cuantizado. El config generado declara `bits=4` y `group_size=64`, con los overrides de precision mixta ya mencionados. La validacion del autor se limita a comprobar que los cuatro shards estan presentes y que las claves de safetensors coinciden con el indice.

## Capacidades

- Generacion de texto y respuesta a instrucciones, heredadas del modelo base; no se detallan capacidades especificas en la model card.
- Razonamiento aritmetico basico y formato de salida controlado: las pruebas de humo del autor devolvieron `서울, 5` ante una pregunta de capital y aritmetica en coreano con formato exacto solicitado.
- Seguimiento de instrucciones de reproduccion literal: devolvio `oQ4_LOCAL_OK` exactamente ante una instruccion en coreano de reproducir una cadena.
- Soporte multilingue: no confirmado de forma amplia; el tag `korean` y las pruebas en coreano sugieren capacidad en ese idioma, pero no hay documentacion sobre el resto.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Vision, audio o modo thinking: no disponible.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y el tamaño de 17,2 GB permiten ejecutar un modelo de 27B en equipos con memoria unificada suficiente, sin depender de GPU dedicadas.
- Prototipado de asistentes en coreano: el tag `korean` y las pruebas del autor apuntan a un uso razonable para experimentar con generacion de texto en ese idioma antes de pasar a produccion.
- Evaluacion de cuantizaciones oQ: util para comparar la calidad de una conversion de 4 bits con precision mixta frente al modelo BF16 original en tareas controladas.
- Pruebas de formato estricto de salida: el modelo respondio correctamente a instrucciones de reproducir cadenas exactas, lo que permite usarlo en validaciones de pipelines que exigen salidas literales.
- Desarrollo y depuracion de aplicaciones MLX: sirve como modelo de referencia para integrar el runtime MLX en herramientas locales de generacion de texto.
- Experimentacion academica con modelos de ~27B en hardware de consumo Apple: permite estudiar comportamiento y limitaciones de un modelo grande cuantizado sin infraestructura de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta dos pruebas de humo cualitativas (respuesta `서울, 5` y reproduccion exacta de `oQ4_LOCAL_OK`), que el propio autor califica como no representativas de una evaluacion amplia de calidad.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 17,2 GB en safetensors; se necesita memoria unificada disponible suficiente para cargar los pesos y el contexto (orientativamente por encima de 20 GB, aunque no se especifica en la informacion).
- GPU recomendadas: no aplica GPU dedicada; requiere Apple Silicon con runtime MLX.
- Compatibilidad con GPU de consumo: no es un formato para CUDA; en Apple Silicon, equipos con memoria unificada de 32 GB o superior son el objetivo natural, aunque el requisito exacto no esta documentado.
- Opciones de despliegue: runtime MLX (libreria `omlx`); no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DNA3.1-27B-oQ4 (este) | 27,36B | no disponible | safetensors MLX (oQ 4-bit) | Apache-2.0 | Hugging Face, 16 descargas |
| dnotitia/DNA3.1-27B (base) | 27,36B | no disponible | BF16 (safetensors) | Apache-2.0 | Hugging Face |
| Alternativas de ~27B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para comparar con modelos alternativos de la misma categoria en terminos de rendimiento o contexto.

## Limitaciones y advertencias

- La cuantizacion a ~5 bits efectivos puede degradar la calidad respecto al modelo BF16 original; no se ha realizado una evaluacion amplia que lo cuantifique.
- Las unicas validaciones documentadas son dos pruebas de humo en coreano, insuficientes para garantizar comportamiento en produccion.
- No se documentan sesgos conocidos, pero al no haber informacion sobre los datos de entrenamiento del modelo base, no es posible descartarlos.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se ha medido en esta version cuantizada.
- Longitud de contexto e idiomas soportados no confirmados; el uso en idiomas distintos del coreano o el ingles no esta avalado por la documentacion.
- Requiere Apple Silicon y runtime MLX; no es portable a CUDA ni a otros backends sin reconversion.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones del modelo base en la revision fijada antes de un uso comercial.
- Diferencias de hardware o runtime pueden afectar a la reproducibilidad bit a bit de la conversion.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/cookieshake/DNA3.1-27B-oQ4
- Modelo base: https://huggingface.co/dnotitia/DNA3.1-27B
- Revision fijada del modelo base: https://huggingface.co/dnotitia/DNA3.1-27B/tree/aee853444ef2d1d1fe2fa56e4c2073d8f393b139
